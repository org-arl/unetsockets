import {AgentID, Gateway, Performative} from 'fjage';
import {Services, UnetMessages, UnetTopics, Protocol} from './unetutils';

const REQUEST_TIMEOUT = 1000;

const AddressResolutionReq = UnetMessages.AddressResolutionReq;
const DatagramReq = UnetMessages.DatagramReq;
const DatagramNtf = UnetMessages.DatagramNtf;
/**
 * Creates a new UnetSocket to connect to a running Unet instance. This constructor returns a
 * {@link Promise} instead of the constructed UnetSocket object. Use `await` or `.then()` to get
 * a reference to the UnetSocket object. Based on if this is run in a Browser or Node.js,
 * it will internally connect over WebSockets or TCP respectively.
 *
 *
 * @class UnetSocket
 * @param {string} [hostname] - hostname/ip address of the master container to connect to
 * @param {string} [port] - port number of the master container to connect to
 * @param {string} [path='']  - path of the master container to connect to (for WebSockets)
 * @returns {Promise<UnetSocket>} - Promise which resolves to the UnetSocket object being constructed
 *
 * @example
 * let socket = await new UnetSocket('localhost', 8081, '/ws/');
 */
export default class UnetSocket {

  constructor(hostname, port, path='') {
    return (async () => {
      this._gw = new Gateway({
        hostname : hostname,
        port : port,
        path : path
      });
      this._localProtocol = -1;
      this._remoteAddress = -1;
      this._localAddress = -1;
      this._remoteProtocol = Protocol.DATA;
      this._timeout = 0;
      this._provider = null;
      this._paramChangeCallbacks = {};

      //for new UnetStack versions (5.2.0 and later)
      this._gw.subscribe(this._gw.topic(UnetTopics.DATAGRAM));

      //for compatibility with older UnetStack versions (before 5.2.0)
      const alist = await this._gw.agentsForService(Services.DATAGRAM);
      alist.forEach(a => {this._gw.subscribe(this._gw.topic(a));});

      // get local nodeinfo agent
      const nodeinfo = await this._gw.agentForService(Services.NODE_INFO);

      // subscribe to paramchange notifications for onParamChange callbacks
      this._gw.subscribe(this._gw.topic(UnetTopics.PARAMCHANGE));
      if (nodeinfo != null) this._gw.subscribe(this._gw.topic(nodeinfo)); // nodeinfo publishes param changes for local node parameters
      this._gw.addMessageListener(msg => {
        if (msg instanceof UnetMessages.ParamChangeNtf) {
          const sender = (msg.sender instanceof AgentID) ? msg.sender.name : msg.sender;
          if (msg.paramValues != null){
            for (const p in msg.paramValues) {
              // if p has dots inside then take the substring after the last dot as the parameter name,
              // since many times fully qualified parameter names are used in the notifications
              const paramName = p.includes('.') ? p.substring(p.lastIndexOf('.') + 1) : p;
              const callback = this._paramChangeCallbacks[sender + '.' + paramName];
              if (callback != null) callback(msg.paramValues[p]);
            }
          }
        }
      });

      // get local node address and subscribe to changes in the local node address
      if (nodeinfo != null) {
        this.onParamChange(nodeinfo.name, 'address', (addr) => { this._localAddress = addr; });
        this._localAddress = await nodeinfo.get('address');
      }

      return this;
    })();
  }

  /**
   * Closes the socket. The socket functionality may not longer be accessed after this method is called.
   * @returns {void}
   */
  close() {
    this._gw.close();
    this._gw = null;
  }

  /**
   * Checks if a socket is closed.
   * @returns {boolean} - true if closed, false if open
   */
  isClosed() {
    return this._gw == null;
  }

  /**
   * Binds a socket to listen to a specific protocol datagrams.
   * Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved protocols
   * and cannot be bound. Unbound sockets listen to all unreserved
   * @param {Protocol} protocol - protocol number to listen for
   * @returns {boolean} - true on success, false on failure
   */
  bind(protocol) {
    if (protocol == Protocol.DATA || (protocol >= Protocol.USER && protocol <= Protocol.MAX)) {
      this._localProtocol = protocol;
      return true;
    }
    return false;
  }

  /**
   * Unbinds a socket so that it listens to all unreserved protocols.
   * Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved.
   * @returns {void}
   */
  unbind() { this._localProtocol = -1;}

  /**
   * Checks if a socket is bound.
   * @returns {boolean} - true if bound to a protocol, false if unbound
   */
  isBound() { return this._localProtocol >= 0;}

  /**
   * Sets the default destination address and destination protocol number for datagrams sent
   * using this socket. The defaults can be overridden for specific send() calls.
   * The default protcol number when a socket is opened is Protcol.DATA.
   * The default node address is undefined.
   * Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved,
   * and cannot be used for sending datagrams using the socket.
   *
   * @param {number} to - default destination node address
   * @param {Protocol} protocol - default protocol number
   * @returns {boolean} - true on success, false on failure
   */
  connect(to, protocol) {
    if (to >= 0 && (protocol == Protocol.DATA || (protocol >= Protocol.USER && protocol <= Protocol.MAX))) {
      this._remoteAddress = to;
      this._remoteProtocol = protocol;
      return true;
    }
    return false;
  }

  /**
   * Resets the default destination address to undefined, and the default protocol number
   * to Protocol.DATA.
   * @returns {void}
   */
  disconnect() {
    this._remoteAddress = -1;
    this._remoteProtocol = 0;
  }

  /**
   * Checks if a socket is connected, i.e., has a default destination address and protocol number.
   * @returns {boolean} - true if connected, false otherwise
   */
  isConnected() { return this._remoteAddress >= 0; }

  /**
   * Gets the local node address of the Unet node connected to.
   * @returns {Promise<int>} - local node address, or -1 on error
   */
  async getLocalAddress() {
    if (this._gw == null) return -1;
    const nodeinfo = await this._gw.agentForService(Services.NODE_INFO);
    if (nodeinfo == null) return -1;
    const addr = await nodeinfo.get('address');
    return addr != null ? addr : -1;
  }

  /**
   * Gets the protocol number that the socket is bound to.
   * @returns {number} - protocol number if socket is bound, -1 otherwise
   */
  getLocalProtocol() { return this._localProtocol; }

  /**
   * Gets the default destination node address for a connected socket.
   * @returns {number} - default destination node address if connected, -1 otherwise
   */
  getRemoteAddress() { return this._remoteAddress; }

  /**
   * Gets the default transmission protocol number.
   * @returns {number} - default protocol number used to transmit a datagram
   */
  getRemoteProtocol() { return this._remoteProtocol; }

  /**
   * Sets the timeout for datagram reception. A timeout of 0 means the
   * {@link UnetSocket#receive|receive method} will check any appropriate
   * Datagram has already been received (and is cached) else return immediately.
   *
   * @param {number} ms - timeout in milliseconds
   * @returns {void}
   */
  setTimeout(ms) {
    if (ms < 0) ms = 0;
    this._timeout = ms;
  }

  /**
   * Gets the timeout for datagram reception.
   * @returns {number} - timeout in milliseconds
   */
  getTimeout() { return this._timeout; }

  /**
   * Transmits a datagram to the specified node address using the specified protocol.
   * Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved,
   * and cannot be used for sending datagrams using the socket.
   * @param {number[]|DatagramReq} data - data to be sent over the socket as an Array of bytes or DatagramReq
   * @param {number} to - destination node address
   * @param {number} protocol - protocol number
   * @returns {Promise<boolean>} - true if the Unet node agreed to send out the Datagram, false otherwise
   */
  async send(data, to=this._remoteAddress, protocol=this._remoteProtocol) {
    if (to < 0 || this._gw == null) return false;
    var req;
    if (Array.isArray(data)){
      req = new DatagramReq();
      req.data = data;
      req.to = to;
      req.protocol = protocol;
    } else if (data instanceof DatagramReq){
      req = data;
    } else {
      return false;
    }
    let p = req.protocol;
    if (p != Protocol.DATA && (p < Protocol.USER || p > Protocol.MAX)) return false;
    if (req.recipient == null) {
      if (this._provider == null) this._provider = await this._gw.agentForService(Services.TRANSPORT);
      if (this._provider == null) this._provider = await this._gw.agentForService(Services.ROUTING);
      if (this._provider == null) this._provider = await this._gw.agentForService(Services.LINK);
      if (this._provider == null) this._provider = await this._gw.agentForService(Services.PHYSICAL);
      if (this._provider == null) this._provider = await this._gw.agentForService(Services.DATAGRAM);
      if (this._provider == null) return false;
      req.recipient = this._provider;
    }
    const rsp = await this._gw.request(req, REQUEST_TIMEOUT);
    return (rsp != null && rsp.perf == Performative.AGREE);
  }

  /**
   * Receives a datagram sent to the local node and the bound protocol number. If the socket is unbound,
   * then datagrams with all unreserved protocols are received. Any broadcast datagrams are also received.
   *
   * @returns {Promise<?DatagramNtf>} - datagram received by the socket
   */
  async receive() {
    if (this._gw == null) return null;
    return await this._gw.receive(msg => {
      if (!(msg instanceof DatagramNtf)) return false;
      let p = msg.protocol;
      if (msg.to != this._localAddress) return false;  // Datagram not addressed to this node
      if (p == Protocol.DATA || p >= Protocol.USER) {
        return this._localProtocol < 0 || this._localProtocol == p;
      }
      return false;
    }, this._timeout);
  }

  /**
   * Gets a Gateway to provide low-level access to UnetStack.
   * @returns {Gateway} - underlying fjage Gateway supporting this socket
   */
  getGateway() { return this._gw; }

  /**
   * Gets an AgentID providing a specified service for low-level access to UnetStack
   * @param {string} svc - the named service of interest
   * @returns {Promise<?AgentID>} - a promise which returns an {@link AgentID} that provides the service when resolved
   */
  async agentForService(svc) {
    if (this._gw == null) return null;
    return await this._gw.agentForService(svc);
  }

  /**
   *
   * @param {string} svc - the named service of interest
   * @returns {Promise<AgentID[]>} - a promise which returns an array of {@link AgentID|AgentIDs} that provides the service when resolved
   */
  async agentsForService(svc) {
    if (this._gw == null) return null;
    return await this._gw.agentsForService(svc);
  }

  /**
   * Gets a named AgentID for low-level access to UnetStack.
   * @param {string} name - name of agent
   * @returns {AgentID} - AgentID for the given name
   */
  agent(name) {
    if (this._gw == null) return null;
    return this._gw.agent(name);
  }

  /**
   * Resolve node name to node address.
   * @param {string} nodeName - name of the node to resolve
   * @returns {Promise<?number>} - address of the node, or null if unable to resolve
   */
  async host(nodeName) {
    const arp = await this.agentForService(Services.ADDRESS_RESOLUTION);
    if (arp == null) return null;
    const req = new AddressResolutionReq(nodeName);
    req.name = nodeName;
    req.recipient = arp;
    const rsp = await this._gw.request(req, REQUEST_TIMEOUT);
    if (rsp == null || ! Object.prototype.hasOwnProperty.call(rsp, 'address')) return null;
    return rsp.address;
  }

  /**
   * Registers a callback function to be called when a parameter value changes for the local node. This
   * uses the ParamChangeNtf messages published by the Unet node to notify of parameter changes. The callback
   * function will be called with the new value of the parameter.
   *
   * @param {AgentID|string} agentId
   * @param {string} paramName
   * @param {function(object): void} callback
   */
  onParamChange(agentId, paramName, callback) {
    if (agentId instanceof AgentID) agentId = agentId.name;
    this._paramChangeCallbacks[agentId + '.' + paramName] = callback;
  }

  /**
   * Removes a callback function registered to be called when a parameter value changes for the local node.
   *
   * @param {AgentID|string} agentId
   * @param {string} paramName
   */
  removeParamChange(agentId, paramName) {
    if (agentId instanceof AgentID) agentId = agentId.name;
    delete this._paramChangeCallbacks[agentId + '.' + paramName];
  }
}