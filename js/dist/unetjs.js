(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.unet = {}));
})(this, (function (exports) { 'use strict';

  /* fjage.js v2.2.1 */

  /**
  * An action represented by a message. The performative actions are a subset of the
  * FIPA ACL recommendations for interagent communication.
  * @enum {string}
  */
  const Performative = {
    REQUEST: 'REQUEST',               // Request an action to be performed
    AGREE: 'AGREE',                   // Agree to performing the requested action
    REFUSE: 'REFUSE',                 // Refuse to perform the requested action
    FAILURE: 'FAILURE',               // Notification of failure to perform a requested or agreed action
    INFORM: 'INFORM',                 // Notification of an event
    CONFIRM: 'CONFIRM',               // Confirm that the answer to a query is true
    DISCONFIRM: 'DISCONFIRM',         // Confirm that the answer to a query is false
    QUERY_IF: 'QUERY_IF',             // Query if some statement is true or false
    NOT_UNDERSTOOD: 'NOT_UNDERSTOOD', // Notification that a message was not understood
    CFP: 'CFP',                       // Call for proposal
    PROPOSE: 'PROPOSE',               // Response for CFP
    CANCEL: 'CANCEL'                  // Cancel pending request
  };

  ////// common utilities

  // generate random ID with length 4*len characters
  /**
   *
   * @private
   * @param {number} len
   */
  function _guid(len) {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return Array.from({ length: len }, s4).join('');
  }


  /**
   * A simple and lightweight implementation of UUIDv7.
   *
   * UUIDv7 is a time-based UUID version that is lexicographically sortable and
   * is designed to be used as a database key.
   *
   * The structure is as follows:
   * 0                   1                   2                   3
   * 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   * |                           unix_ts_ms                          |
   * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   * |          unix_ts_ms           |  ver  |      rand_a           |
   * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   * |var|                        rand_b                             |
   * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   * |                            rand_b                             |
   * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   *
   * - unix_ts_ms (48 bits): Unix timestamp in milliseconds.
   * - ver (4 bits): Version, set to 7.
   * - rand_a (12 bits): Random data.
   * - var (2 bits): Variant, set to '10'.
   * - rand_b (62 bits): Random data.
   */
  class UUID7 {
      /**
       * Private constructor to create a UUID7 from a byte array.
       * @param {Uint8Array} bytes The 16 bytes of the UUID.
       */
      constructor(bytes) {
          if (bytes.length !== 16) {
              throw new Error('UUID7 must be constructed with a 16-byte array.');
          }
          this.bytes = bytes;
      }

      /**
       * Generates a new UUIDv7.
       * @returns {UUID7} A new UUIDv7 instance.
       */
      static generate() {
          const bytes = new Uint8Array(16);
          const randomBytes = crypto.getRandomValues(new Uint8Array(10));
          const timestamp = Date.now();

          // Set the 48-bit timestamp
          // JavaScript numbers are 64-bit floats, but bitwise operations treat them
          // as 32-bit signed integers. We need to handle the 48-bit timestamp carefully.
          const timestampHi = Math.floor(timestamp / 2 ** 16);
          const timestampLo = timestamp % 2 ** 16;

          bytes[0] = (timestampHi >> 24) & 0xff;
          bytes[1] = (timestampHi >> 16) & 0xff;
          bytes[2] = (timestampHi >> 8) & 0xff;
          bytes[3] = timestampHi & 0xff;
          bytes[4] = (timestampLo >> 8) & 0xff;
          bytes[5] = timestampLo & 0xff;

          // Copy the 10 random bytes
          bytes.set(randomBytes, 6);

          // Set the 4-bit version (0111) in byte 6
          bytes[6] = (bytes[6] & 0x0f) | 0x70;

          // Set the 2-bit variant (10) in byte 8
          bytes[8] = (bytes[8] & 0x3f) | 0x80;

          return new UUID7(bytes);
      }

      /**
       * Extracts the timestamp from the UUID.
       * @returns {number} The Unix timestamp in milliseconds.
       */
      getTimestamp() {
          let timestamp = 0;
          timestamp = this.bytes[0] * 2 ** 40;
          timestamp += this.bytes[1] * 2 ** 32;
          timestamp += this.bytes[2] * 2 ** 24;
          timestamp += this.bytes[3] * 2 ** 16;
          timestamp += this.bytes[4] * 2 ** 8;
          timestamp += this.bytes[5];
          return timestamp;
      }

      /**
       * Formats the UUID into the standard string representation.
       * @returns {string} The UUID string.
       */
      toString() {
          let result = '';
          for (let i = 0; i < 16; i++) {
              result += this.bytes[i].toString(16).padStart(2, '0');
              if (i === 3 || i === 5 || i === 7 || i === 9) {
                  result += '-';
              }
          }
          return result;
      }
  }

  // src/index.ts
  var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
  var isNode = (
    // @ts-expect-error
    typeof process !== "undefined" && // @ts-expect-error
    process.versions != null && // @ts-expect-error
    process.versions.node != null
  );
  var isWebWorker = typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
  var isJsDom = typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && "userAgent" in navigator && typeof navigator.userAgent === "string" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom"));
  (
    // @ts-expect-error
    typeof Deno !== "undefined" && // @ts-expect-error
    typeof Deno.version !== "undefined" && // @ts-expect-error
    typeof Deno.version.deno !== "undefined"
  );
  typeof process !== "undefined" && process.versions != null && process.versions.bun != null;

  const SOCKET_OPEN = 'open';
  const SOCKET_OPENING = 'opening';
  const DEFAULT_RECONNECT_TIME$1 = 5000;       // ms, delay between retries to connect to the server.

  var createConnection;

  /**
  * @class
  * @ignore
  */
  class TCPConnector {

    /**
    * Create an TCPConnector to connect to a fjage master over TCP
    * @param {Object} opts
    * @param {string} [opts.hostname='localhost'] - hostname/ip address of the master container to connect to
    * @param {number} [opts.port=1100] - port number of the master container to connect to
    * @param {boolean} [opts.keepAlive=true] - try to reconnect if the connection is lost
    * @param {boolean} [opts.debug=false] - debug info to be logged to console?
    * @param {number} [opts.reconnectTime=5000] - time before reconnection is attempted after an error
    */
    constructor(opts = {}) {
      let host = opts.hostname || 'localhost';
      let port = opts.port || 1100;
      this._keepAlive = opts.keepAlive;
      this._reconnectTime = opts.reconnectTime || DEFAULT_RECONNECT_TIME$1;
      this.url = new URL('tcp://localhost');
      this.url.hostname = host;
      this.url.port = port.toString();
      this._buf = '';
      this._firstConn = true;               // if the Gateway has managed to connect to a server before
      this._firstReConn = true;             // if the Gateway has attempted to reconnect to a server before
      this.pendingOnOpen = [];              // list of callbacks make as soon as gateway is open
      this.connListeners = [];              // external listeners wanting to listen connection events
      this.debug = false;
      this._sockInit(host, port);
    }


    _sendConnEvent(val) {
      this.connListeners.forEach(l => {
        l && {}.toString.call(l) === '[object Function]' && l(val);
      });
    }

    _sockInit(host, port){
      if (!createConnection){
        try {
          // @ts-ignore
          import('net').then(module => {
            createConnection = module.createConnection;
            this._sockSetup(host, port);
          });
        }catch(error){
          if(this.debug) console.log('Unable to import net module');
        }
      }else {
        this._sockSetup(host, port);
      }
    }

    _sockSetup(host, port){
      if(!createConnection) return;
      try{
        this.sock = createConnection({ 'host': host, 'port': port });
        this.sock.setEncoding('utf8');
        this.sock.on('connect', this._onSockOpen.bind(this));
        this.sock.on('error', this._sockReconnect.bind(this));
        this.sock.on('close', () => {this._sendConnEvent(false);});
        this.sock.send = data => {this.sock.write(data);};
      } catch (error) {
        if(this.debug) console.log('Connection failed to ', this.sock.host + ':' + this.sock.port);
        return;
      }
    }

    _sockReconnect(){
      if (this._firstConn || !this._keepAlive || this.sock.readyState == SOCKET_OPENING || this.sock.readyState == SOCKET_OPEN) return;
      if (this._firstReConn) this._sendConnEvent(false);
      this._firstReConn = false;
      setTimeout(() => {
        this.pendingOnOpen = [];
        this._sockSetup(this.url.hostname, this.url.port);
      }, this._reconnectTime);
    }

    _onSockOpen() {
      this._sendConnEvent(true);
      this._firstConn = false;
      this.sock.on('close', this._sockReconnect.bind(this));
      this.sock.on('data', this._processSockData.bind(this));
      this.pendingOnOpen.forEach(cb => cb());
      this.pendingOnOpen.length = 0;
      this._buf = '';
    }

    _processSockData(s){
      this._buf += s;
      var lines = this._buf.split('\n');
      lines.forEach((l, idx) => {
        if (idx < lines.length-1){
          if (l && this._onSockRx) this._onSockRx.call(this,l);
        } else {
          this._buf = l;
        }
      });
    }

    toString(){
      let s = '';
      s += 'TCPConnector [' + this.sock ? this.sock.remoteAddress.toString() + ':' + this.sock.remotePort.toString() : '' + ']';
      return s;
    }

    /**
    * Write a string to the connector
    * @param {string} s - string to be written out of the connector to the master
    * @return {boolean} - true if connect was able to write or queue the string to the underlying socket
    */
    write(s){
      if (!this.sock || this.sock.readyState == SOCKET_OPENING){
        this.pendingOnOpen.push(() => {
          this.sock.send(s+'\n');
        });
        return true;
      } else if (this.sock.readyState == SOCKET_OPEN) {
        this.sock.send(s+'\n');
        return true;
      }
      return false;
    }

    /**
    * @callback TCPConnectorReadCallback
    * @ignore
    * @param {string} s - incoming message string
    */

    /**
    * Set a callback for receiving incoming strings from the connector
    * @param {TCPConnectorReadCallback} cb - callback that is called when the connector gets a string
    */
    setReadCallback(cb){
      if (cb && {}.toString.call(cb) === '[object Function]') this._onSockRx = cb;
    }

    /**
    * Add listener for connection events
    * @param {function} listener - a listener callback that is called when the connection is opened/closed
    */
    addConnectionListener(listener){
      this.connListeners.push(listener);
    }

    /**
    * Remove listener for connection events
    * @param {function} listener - remove the listener for connection
    * @return {boolean} - true if the listner was removed successfully
    */
    removeConnectionListener(listener) {
      let ndx = this.connListeners.indexOf(listener);
      if (ndx >= 0) {
        this.connListeners.splice(ndx, 1);
        return true;
      }
      return false;
    }

    /**
    * Close the connector
    */
    close(){
      if (!this.sock) return;
      if (this.sock.readyState == SOCKET_OPENING) {
        this.pendingOnOpen.push(() => {
          this.sock.send('{"alive": false}\n');
          this.sock.removeAllListeners('connect');
          this.sock.removeAllListeners('error');
          this.sock.removeAllListeners('close');
          this.sock.destroy();
        });
      } else if (this.sock.readyState == SOCKET_OPEN) {
        this.sock.send('{"alive": false}\n');
        this.sock.removeAllListeners('connect');
        this.sock.removeAllListeners('error');
        this.sock.removeAllListeners('close');
        this.sock.destroy();
      }
    }
  }

  const DEFAULT_RECONNECT_TIME = 5000;       // ms, delay between retries to connect to the server.

  /**
  * @class
  * @ignore
  */
  class WSConnector {

    /**
    * Create an WSConnector to connect to a fjage master over WebSockets
    * @param {Object} opts
    * @param {string} [opts.hostname='localhost'] - hostname/ip address of the master container to connect to
    * @param {number} [opts.port=80] - port number of the master container to connect to
    * @param {string} [opts.pathname="/"] - path of the master container to connect to
    * @param {boolean} [opts.keepAlive=true] - try to reconnect if the connection is lost
    * @param {boolean} [opts.debug=false] - debug info to be logged to console?
    * @param {number} [opts.reconnectTime=5000] - time before reconnection is attempted after an error
    */
    constructor(opts = {}) {
      let host = opts.hostname || 'localhost';
      let port = opts.port || 80;
      this.url = new URL('ws://localhost');
      this.url.hostname = host;
      this.url.port = port.toString();
      this.url.pathname = opts.pathname || '/';
      this._keepAlive = opts.keepAlive;
      this._reconnectTime = opts.reconnectTime || DEFAULT_RECONNECT_TIME;
      this.debug = opts.debug || false;      // debug info to be logged to console?
      this._firstConn = true;               // if the Gateway has managed to connect to a server before
      this._firstReConn = true;             // if the Gateway has attempted to reconnect to a server before
      this.pendingOnOpen = [];              // list of callbacks make as soon as gateway is open
      this.connListeners = [];              // external listeners wanting to listen connection events
      this._websockSetup(this.url);
    }

    _sendConnEvent(val) {
      this.connListeners.forEach(l => {
        l && {}.toString.call(l) === '[object Function]' && l(val);
      });
    }

    _websockSetup(url){
      try {
        this.sock = new WebSocket(url);
        this.sock.onerror = this._websockReconnect.bind(this);
        this.sock.onopen = this._onWebsockOpen.bind(this);
        this.sock.onclose = () => {this._sendConnEvent(false);};
      } catch (error) {
        if(this.debug) console.log('Connection failed to ', url);
        return;
      }
    }

    _websockReconnect(){
      if (this._firstConn || !this._keepAlive || this.sock.readyState == this.sock.CONNECTING || this.sock.readyState == this.sock.OPEN) return;
      if (this._firstReConn) this._sendConnEvent(false);
      this._firstReConn = false;
      if(this.debug) console.log('Reconnecting to ', this.sock.url);
      setTimeout(() => {
        this.pendingOnOpen = [];
        this._websockSetup(this.sock.url);
      }, this._reconnectTime);
    }

    _onWebsockOpen() {
      if(this.debug) console.log('Connected to ', this.sock.url);
      this._sendConnEvent(true);
      this.sock.onclose = this._websockReconnect.bind(this);
      this.sock.onmessage = event => { if (this._onWebsockRx) this._onWebsockRx.call(this,event.data); };
      this._firstConn = false;
      this._firstReConn = true;
      this.pendingOnOpen.forEach(cb => cb());
      this.pendingOnOpen.length = 0;
    }

    toString(){
      let s = '';
      s += 'WSConnector [' + this.sock ? this.sock.url.toString() : '' + ']';
      return s;
    }

    /**
    * Write a string to the connector
    * @param {string} s - string to be written out of the connector to the master
    */
    write(s){
      if (!this.sock || this.sock.readyState == this.sock.CONNECTING){
        this.pendingOnOpen.push(() => {
          this.sock.send(s+'\n');
        });
        return true;
      } else if (this.sock.readyState == this.sock.OPEN) {
        this.sock.send(s+'\n');
        return true;
      }
      return false;
    }

    /**
    * @callback WSConnectorReadCallback
    * @ignore
    * @param {string} s - incoming message string
    */

    /**
    * Set a callback for receiving incoming strings from the connector
    * @param {WSConnectorReadCallback} cb - callback that is called when the connector gets a string
    * @ignore
    */
    setReadCallback(cb){
      if (cb && {}.toString.call(cb) === '[object Function]') this._onWebsockRx = cb;
    }

    /**
    * Add listener for connection events
    * @param {function} listener - a listener callback that is called when the connection is opened/closed
    */
    addConnectionListener(listener){
      this.connListeners.push(listener);
    }

    /**
    * Remove listener for connection events
    * @param {function} listener - remove the listener for connection
    * @return {boolean} - true if the listner was removed successfully
    */
    removeConnectionListener(listener) {
      let ndx = this.connListeners.indexOf(listener);
      if (ndx >= 0) {
        this.connListeners.splice(ndx, 1);
        return true;
      }
      return false;
    }

    /**
    * Close the connector
    */
    close(){
      if (!this.sock) return;
      if (this.sock.readyState == this.sock.CONNECTING) {
        this.pendingOnOpen.push(() => {
          this.sock.send('{"alive": false}\n');
          this.sock.onclose = null;
          this.sock.close();
        });
      } else if (this.sock.readyState == this.sock.OPEN) {
        this.sock.send('{"alive": false}\n');
        this.sock.onclose = null;
        this.sock.close();
      }
    }
  }

  /* global Buffer */

  /**
  * Class representing a fjage's on-the-wire JSON message. A JSONMessage object
  * contains all the fields that can be a part of a fjage JSON message. The class
  * provides methods to create JSONMessage objects from raw strings and to
  * convert JSONMessage objects to JSON strings in the format of the fjage on-the-wire
  * protocol. See {@link https://fjage.readthedocs.io/en/latest/protocol.html#json-message-request-response-attributes fjage documentation}
  * for more details on the JSON message format.
  *
  * Most users will not need to create JSONMessage objects directly, but rather use the Gateway and Message classes
  * to send and receive messages. However, this class can be useful for low-level access to the fjage protocol
  * or for generating/consuming the fjåge protocol messages without having them be transmitted over a network.
  *
  * @example
  * const jsonMsg = new JSONMessage();
  * jsonMsg.action = 'send';
  * jsonMsg.message = new Message();
  * jsonMsg.message.sender = new AgentID('agent1');
  * jsonMsg.message.recipient = new AgentID('agent2');
  * jsonMsg.message.perf = Performative.INFORM;
  * jsonMsg.toJSON(); // Converts to JSON string in the fjage on-the-wire protocol format
  *
  * @example
  * const jsonString = '{"id":"1234",...}'; // JSON string representation of a JSONMessage
  * const jsonMsg = new JSONMessage(jsonString); // Parses the JSON string into a JSONMessage object
  * jsonMsg.message; // Access the Message object contained in the JSONMessage
  *
  * @class
  * @property {string} [id] - A UUID assigned to each JSONMessage object.
  * @property {string} [action] - Denotes the main action the object is supposed to perform.
  * @property {string} [inResponseTo] - This attribute contains the action to which this object is a response to.
  * @property {AgentID} [agentID] - An AgentID. This attribute is populated in objects which are responses to objects requesting the ID of an agent providing a specific service.
  * @property {Array<AgentID>} [agentIDs] - This attribute is populated in objects which are responses to objects requesting the IDs of agents providing a specific service, or objects which are responses to objects requesting a list of all agents running in a container.
  * @property {Array<string>} [agentTypes] - This attribute is optionally populated in objects which are responses to objects requesting a list of all agents running in a container. If populated, it contains a list of agent types running in the container, with a one-to-one mapping to the agent IDs in the "agentIDs" attribute.
  * @property {string} [service] - Used in conjunction with "action" : "agentForService" and "action" : "agentsForService" to query for agent(s) providing this specific service.
  * @property {Array<string>} [services] - This attribute is populated in objects which are responses to objects requesting the services available with "action" : "services".
  * @property {boolean} [answer] - This attribute is populated in objects which are responses to query objects with "action" : "containsAgent".
  * @property {Message} [message] - This holds the main payload of the message. The structure and format of this object is discussed in the {@link https://fjage.readthedocs.io/en/latest/protocol.html#json-message-request-response-attributes fjage documentation}.
  * @property {boolean} [relay] - This attribute defines if the target container should relay (forward) the message to other containers it is connected to or not.
  * @property {Object} [creds] - Credentials to be used for authentication.
  * @property {Object} [auth] - Authentication information to be used for the message.
  *
  *
  */
  class JSONMessage {

    /**
    * @param {String} [jsonString] - JSON string to be parsed into a JSONMessage object.
    * @param {Object} [owner] - The owner of the JSONMessage object, typically the Gateway instance.
    */
    constructor(jsonString, owner) {
      this.id = UUID7.generate().toString(); // unique JSON message ID
      this.action =  null;
      this.inResponseTo =  null;
      this.agentID = null;
      this.agentIDs = null;
      this.agentTypes = null;
      this.service =  null;
      this.services = null;
      this.answer =  null;
      this.message = null;
      this.relay =  null;
      this.creds =  null;
      this.auth =  null;
      this.name =  null;
      if (jsonString && typeof jsonString === 'string') {
        try {
          const parsed = JSON.parse(jsonString, _decodeBase64);
          if (parsed.message) parsed.message = Message.fromJSON(parsed.message);
          if (parsed.agentID) parsed.agentID = AgentID.fromJSON(parsed.agentID, owner);
          if (parsed.agentIDs) parsed.agentIDs = parsed.agentIDs.map(id => AgentID.fromJSON(id, owner));
          Object.assign(this, parsed);
        } catch (e) {
          throw new Error('Invalid JSON string: ' + e.message);
        }
      }  }

    /**
    * Creates a JSONMessage object to send a message.
    *
    * @param {Message} msg
    * @param {boolean} [relay=false] - whether to relay the message
    * @returns {JSONMessage} - JSONMessage object with request to send a message
    */
    static createSend(msg, relay=false){
      if (!(msg instanceof Message)) {
        throw new Error('Invalid message type');
      }
      const jsonMsg = new JSONMessage();
      jsonMsg.action = Actions.SEND;
      jsonMsg.relay = relay;
      jsonMsg.message = msg;
      return jsonMsg;
    }

    /**
    * Creates a JSONMessage object to update WantsMessagesFor list.
    *
    * @param {Array<AgentID>} agentIDs - array of AgentID objects for which the gateway wants messages
    * @returns {JSONMessage} - JSONMessage object with request to update WantsMessagesFor list
    */
    static createWantsMessagesFor(agentIDs) {
      if (!Array.isArray(agentIDs) || agentIDs.length === 0) {
        throw new Error('agentIDNames must be a non-empty array');
      }
      const jsonMsg = new JSONMessage();
      jsonMsg.action = Actions.WANTS_MESSAGES_FOR;
      jsonMsg.agentIDs = agentIDs;
      return jsonMsg;
    }

    /**
    * Creates a JSONMessage object to request the list of agents.
    *
    * @returns {JSONMessage} - JSONMessage object with request for the list of agents
    */
    static createAgents(){
      const jsonMsg = new JSONMessage();
      jsonMsg.action = Actions.AGENTS;
      jsonMsg.id = UUID7.generate().toString(); // unique JSON message ID
      return jsonMsg;
    }

    /**
    * Creates a JSONMessage object to check if an agent is contained
    *
    * @param {AgentID} agentID - AgentID of the agent to check
    * @returns {JSONMessage} - JSONMessage object with request to check if the agent is contained
    */
    static createContainsAgent(agentID) {
      if (!(agentID instanceof AgentID)) {
        throw new Error('agentID must be an instance of AgentID');
      }
      const jsonMsg = new JSONMessage();
      jsonMsg.action = Actions.CONTAINS_AGENT;
      jsonMsg.id = UUID7.generate().toString(); // unique JSON message ID
      jsonMsg.agentID = agentID;
      return jsonMsg;
    }

    /**
    * Creates a JSONMessage object to get an agent for a service.
    *
    * @param {string} service - service which the agent must provide
    * @returns {JSONMessage} - JSONMessage object with request for an agent providing the service
    */
    static createAgentForService(service) {
      if (typeof service !== 'string' || service.length === 0) {
        throw new Error('service must be a non-empty string');
      }
      const jsonMsg = new JSONMessage();
      jsonMsg.action = Actions.AGENT_FOR_SERVICE;
      jsonMsg.id = UUID7.generate().toString(); // unique JSON message ID
      jsonMsg.service = service;
      return jsonMsg;
    }

    /**
    * Creates a JSONMessage object to get all agents for a service.
    *
    * @param {string} service - service which the agents must provide
    * @returns {JSONMessage} - JSONMessage object with request for all agent providing the service
    */
    static createAgentsForService(service) {
      if (typeof service !== 'string' || service.length === 0) {
        throw new Error('service must be a non-empty string');
      }
      const jsonMsg = new JSONMessage();
      jsonMsg.action = Actions.AGENTS_FOR_SERVICE;
      jsonMsg.id = UUID7.generate().toString(); // unique JSON message ID
      jsonMsg.service = service;
      return jsonMsg;
    }

    /**
    * Converts the JSONMessage object to a JSON string in the format of the
    * fjage on-the-wire protocol. If the JSONMessage contains a Message or
    * AgentID objects, they will be serialized as per the fjåge protocol.
    *
    * @returns {string} - JSON string representation of the message
    */
    toJSON() {
      if (!this.action && !this.id) {
        throw new Error('Neither action nor id is set. Cannot serialize JSONMessage.');
      }
      const jsonObj = {};
      // Add property if not null or undefined
      if (this.id) jsonObj.id = this.id;
      if (this.action) jsonObj.action = this.action;
      if (this.inResponseTo) jsonObj.inResponseTo = this.inResponseTo;
      if (this.agentID) jsonObj.agentID = this.agentID.toJSON();
      if (this.agentIDs) {
        jsonObj.agentIDs = this.agentIDs.map(id => id.toJSON());
        if (jsonObj.agentIDs.length === 0) delete jsonObj.agentIDs; // remove empty array
      }
      if (this.service) jsonObj.service = this.service;
      if (this.services) {
        jsonObj.services = this.services;
        if (jsonObj.services.length === 0) delete jsonObj.services; // remove empty array
      }
      if (this.answer) jsonObj.answer = this.answer;
      if (this.message) jsonObj.message = this.message;
      if (this.relay) jsonObj.relay = this.relay;
      if (this.creds) jsonObj.creds = this.creds;
      if (this.auth) jsonObj.auth = this.auth;
      if (this.name) jsonObj.name = this.name;
      return JSON.stringify(jsonObj);
    }

    toString() {
      return this.toJSON();
    }
  }


  /**
  * Actions supported by the fjåge JSON message protocol. See
  * {@link https://fjage.readthedocs.io/en/latest/protocol.html#json-message-request-response-attributes fjage documentation} for more details.
  *
  * @enum {string} Actions
  */
  const Actions = {
    AGENTS : 'agents',
    CONTAINS_AGENT : 'containsAgent',
    AGENT_FOR_SERVICE : 'agentForService',
    AGENTS_FOR_SERVICE : 'agentsForService',
    SEND : 'send',
    WANTS_MESSAGES_FOR : 'wantsMessagesFor'};

  ////// private utilities


  /**
  * Decode large numeric arrays encoded in base64 back to array format.
  *
  * @private
  *
  * @param {string} _k - key (unused)
  * @param {any} d - data
  * @returns {Array} - decoded data in array format
  * */
  function _decodeBase64(_k, d) {
    if (d === null) return null;
    if (typeof d == 'object' && 'clazz' in d && 'data' in d && d.clazz.startsWith('[') && d.clazz.length == 2) {
      return _b64toArray(d.data, d.clazz) || d;
    }
    return d;
  }

  /**
  * Convert a base64 encoded string to an array of numbers of the specified data type.
  *
  * @private
  *
  * @param {string} base64 - base64 encoded string
  * @param {string} dtype - data type, e.g. '[B' for byte array, '[S' for short array, etc.
  * @param {boolean} [littleEndian=true] - whether to use little-endian byte order
  */
  function _b64toArray(base64, dtype, littleEndian=true) {
    let s = _atob(base64);
    let len = s.length;
    let bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++)
      bytes[i] = s.charCodeAt(i);
    let rv = [];
    let view = new DataView(bytes.buffer);
    switch (dtype) {
      case '[B': // byte array
      for (i = 0; i < len; i++)
        rv.push(view.getUint8(i));
      break;
      case '[S': // short array
      for (i = 0; i < len; i+=2)
        rv.push(view.getInt16(i, littleEndian));
      break;
      case '[I': // integer array
      for (i = 0; i < len; i+=4)
        rv.push(view.getInt32(i, littleEndian));
      break;
      case '[J': // long array
      for (i = 0; i < len; i+=8)
        rv.push(view.getBigInt64(i, littleEndian));
      break;
      case '[F': // float array
      for (i = 0; i < len; i+=4)
        rv.push(view.getFloat32(i, littleEndian));
      break;
      case '[D': // double array
      for (i = 0; i < len; i+=8)
        rv.push(view.getFloat64(i, littleEndian));
      break;
      default:
      return;
    }
    return rv;
  }

  // node.js safe atob function
  /**
  * @private
  * @param {string} a
  */
  function _atob(a){
    if (isBrowser || isWebWorker) return window.atob(a);
    else if (isJsDom || isNode) return Buffer.from(a, 'base64').toString('binary');
  }

  /* global global */


  const DEFAULT_QUEUE_SIZE = 128;        // max number of old unreceived messages to store
  const DEFAULT_TIMEOUT$1 = 10000;         // default timeout for requests in milliseconds

  const GATEWAY_DEFAULTS = {
    'timeout': DEFAULT_TIMEOUT$1,
    'keepAlive' : true,
    'queueSize': DEFAULT_QUEUE_SIZE,
    'returnNullOnFailedResponse': true
  };

  let DEFAULT_URL;
  let gObj = {};

  /**
  *
  * @private
  *
  * Initializes the Gateway module. This function should be called before using the Gateway class.
  * It sets up the default values for the Gateway and initializes the global object.
  * It also sets up the default URL for the Gateway based on the environment (browser, Node.js, etc.).
  * @returns {void}
  */
  function init(){
    if (isBrowser || isWebWorker){
      gObj = window;
      Object.assign(GATEWAY_DEFAULTS, {
        'hostname': gObj.location.hostname,
        'port': gObj.location.port,
        'pathname' : '/ws/'
      });
      DEFAULT_URL = new URL('ws://localhost');
      // Enable caching of Gateways in browser
      if (typeof gObj.fjage === 'undefined') gObj.fjage = {};
      if (typeof gObj.fjage.gateways == 'undefined') gObj.fjage.gateways = [];
    } else if (isJsDom || isNode){
      gObj = global;
      Object.assign(GATEWAY_DEFAULTS, {
        'hostname': 'localhost',
        'port': '1100',
        'pathname': ''
      });
      DEFAULT_URL = new URL('tcp://localhost');
    }
  }

  /**
  * A gateway for connecting to a fjage master container. This class provides methods to
  * send and receive messages, subscribe to topics, and manage connections to the master container.
  * It can be used to connect to a fjage master container over WebSockets or TCP.
  *
  * @example <caption>Connects to the localhost:1100</caption>
  * const gw = new Gateway({ hostname: 'localhost', port: 1100 });
  *
  * @example <caption>Connects to the origin</caption>
  * const gw = new Gateway();
  *
  * @class
  * @property {AgentID} aid - agent id of the gateway
  * @property {boolean} connected - true if the gateway is connected to the master container
  * @property {boolean} debug - true if debug messages should be logged to the console
  *
  * Constructor arguments:
  * @param {Object} opts
  * @param {string} [opts.hostname="localhost"] - hostname/ip address of the master container to connect to
  * @param {number} [opts.port=1100]          - port number of the master container to connect to
  * @param {string} [opts.pathname=""]        - path of the master container to connect to (for WebSockets)
  * @param {boolean} [opts.keepAlive=true]     - try to reconnect if the connection is lost
  * @param {number} [opts.queueSize=128]      - size of the _queue of received messages that haven't been consumed yet
  * @param {number} [opts.timeout=10000]       - timeout for fjage level messages in ms
  * @param {boolean} [opts.returnNullOnFailedResponse=true] - return null instead of throwing an error when a parameter is not found
  * @param {boolean} [opts.cancelPendingOnDisconnect=false] - cancel pending requests on disconnects
  */
  class Gateway {

    constructor(opts = {}) {
      // Similar to Object.assign but also overwrites `undefined` and empty strings with defaults
      for (var key in GATEWAY_DEFAULTS){
        if (opts[key] == undefined || opts[key] === '') opts[key] = GATEWAY_DEFAULTS[key];
      }
      var url = DEFAULT_URL;
      url.hostname = opts.hostname;
      url.port = opts.port;
      url.pathname = opts.pathname;
      let existing = this._getGWCache(url);
      if (existing) return existing;
      this._timeout = opts.timeout;         // timeout for fjage level messages (agentForService etc)
      this._keepAlive = opts.keepAlive;     // reconnect if connection gets closed/errored
      this._queueSize = opts.queueSize;     // size of _queue
      this._returnNullOnFailedResponse = opts.returnNullOnFailedResponse; // null or error
      this._cancelPendingOnDisconnect = opts.cancelPendingOnDisconnect; // cancel pending requests on disconnect
      this._pending_actions = {};            // msgid to callback mapping for pending actions
      this._subscriptions = {};              // map for all topics that are subscribed
      this._pending_receives = {};           // uuid to callbacks mapping for pending receives
      this._eventListeners = {};             // external listeners wanting to listen internal events
      this._queue = [];                      // incoming message _queue
      this.connected = false;               // connection status
      this.debug = false;                   // debug info to be logged to console?
      this.aid = new AgentID('gateway-'+_guid(4));         // gateway agent name
      this.connector = this._createConnector(url);
      this._addGWCache(this);
    }

    /**
    * Sends an event to all registered listeners of the given type.
    * @private
    * @param {string} type - type of event
    * @param {Object|Message|string} val - value to be sent to the listeners
    */
    _sendEvent(type, val) {
      if (!Array.isArray(this._eventListeners[type])) return;
      this._eventListeners[type].forEach(l => {
        if (l && {}.toString.call(l) === '[object Function]'){
          try {
            l(val);
          } catch (error) {
            console.warn('Error in event listener : ' + error);
          }
        }
      });
    }

    /**
    * Sends the message to all registered receivers.
    *
    * @private
    * @param {Message} msg
    * @returns {boolean} - true if the message was consumed by any listener
    */
    _sendReceivers(msg) {
      for (var lid in this._pending_receives){
        try {
          if (this._pending_receives[lid] && this._pending_receives[lid](msg)) return true;
        } catch (error) {
          console.warn('Error in listener : ' + error);
        }
      }
      return false;
    }


    /**
    * @private
    * @param {string} data - stringfied JSON data received from the master container to be processed
    * @returns {void}
    */
    _onMsgRx(data) {
      var jsonMsg;
      if (this.debug) console.log('< '+data);
      this._sendEvent('rx', data);
      try {
        jsonMsg = new JSONMessage(data, this);
      }catch(e){
        return;
      }
      this._sendEvent('rxp', jsonMsg);
      if (jsonMsg.id && jsonMsg.id in this._pending_actions) {
        // response to a pending request to master
        this._pending_actions[jsonMsg.id](jsonMsg);
        delete this._pending_actions[jsonMsg.id];
      } else if (jsonMsg.action == Actions.SEND) {
        // incoming message from master
        const msg = jsonMsg.message;
        if (!msg) return;
        this._sendEvent('rxmsg', msg);
        if ((msg.recipient.toJSON() == this.aid.toJSON())|| this._subscriptions[msg.recipient.toJSON()]) {
          // send to any "message" listeners
          this._sendEvent('message', msg);
          // send message to receivers, if not consumed, add to _queue
          if(!this._sendReceivers(msg)) {
            if (this._queue.length >= this._queueSize) this._queue.shift();
            this._queue.push(msg);
          }
        }
      } else {
        // respond to standard requests that every gateway must
        let rsp = new JSONMessage();
        rsp.id = jsonMsg.id;
        rsp.inResponseTo = jsonMsg.action;
        switch (jsonMsg.action) {
          case 'agents':
          rsp.agentIDs = [this.aid];
          break;
          case 'containsAgent':
          rsp.answer = (jsonMsg.agentID.toJSON() == this.aid.toJSON());
          break;
          case 'services':
          rsp.services = [];
          break;
          case 'agentForService':
          rsp.agentID = '';
          break;
          case 'agentsForService':
          rsp.agentIDs = [];
          break;
          default:
          rsp = undefined;
        }
        if (rsp) this._msgTx(rsp);
      }
    }

    /**
    * Sends a message out to the master container. This method is used for sending
    * fjage level actions that do not require a response, such as alive, wantMessages, etc.
    * @private
    * @param {JSONMessage} msg - JSONMessage to be sent to the master container
    * @returns {boolean} - true if the message was sent successfully
    */
    _msgTx(msg) {
      const s = msg.toJSON();
      if(this.debug) console.log('> '+s);
      this._sendEvent('tx', s);
      return this.connector.write(s);
    }

    /**
    * Send a message to the master container and wait for a response. This method is used for sending
    * fjage level actions that require a response, such as agentForService, agents, etc.
    * @private
    * @param {JSONMessage} rq - JSONMessage to be sent to the master container
    * @param {number} [timeout=opts.timeout] - timeout in milliseconds for the response
    * @returns {Promise<JSONMessage|null>} - a promise which returns the response from the master container
    */
    _msgTxRx(rq, timeout = this._timeout) {
      rq.id = UUID7.generate().toString();
      return new Promise(resolve => {
        let timer;
        if (timeout >= 0){
          timer = setTimeout(() => {
            delete this._pending_actions[rq.id];
            if (this.debug) console.log('Receive Timeout : ' + JSON.stringify(rq));
            resolve(null);
          }, timeout);
        }
        this._pending_actions[rq.id] = rsp => {
          if (timer) clearTimeout(timer);
          resolve(rsp);
        };
        if (!this._msgTx.call(this,rq)) {
          if(timer) clearTimeout(timer);
          delete this._pending_actions[rq.id];
          if (this.debug) console.log('Transmit Failure : ' +  JSON.stringify(rq));
          resolve(null);
        }
      });
    }

    /**
    * @private
    * @param {URL} url - URL object of the master container to connect to
    * @returns {TCPConnector|WSConnector} - connector object to connect to the master container
    */
    _createConnector(url){
      let conn;
      if (url.protocol.startsWith('ws')){
        conn =  new WSConnector({
          'hostname':url.hostname,
          'port':parseInt(url.port),
          'pathname':url.pathname,
          'keepAlive': this._keepAlive,
          'debug': this.debug
        });
      }else if (url.protocol.startsWith('tcp')){
        conn = new TCPConnector({
          'hostname':url.hostname,
          'port':parseInt(url.port),
          'keepAlive': this._keepAlive,
          'debug': this.debug
        });
      } else return null;
      conn.setReadCallback(this._onMsgRx.bind(this));
      conn.addConnectionListener(state => {
        this.connected = !!state;
        if (state == true){
          this.flush();
          this.connector.write('{"alive": true}');
          this._update_watch();
        } else {
          if (this._cancelPendingOnDisconnect) {
            this._sendReceivers(null);
            this.flush();
          }
        }
        this._sendEvent('conn', state);
      });
      return conn;
    }

    /**
    * Checks if the object is a constructor.
    *
    * @private
    * @param {Object} value - an object to be checked if it is a constructor
    * @returns {boolean} - if the object is a constructor
    */
    _isConstructor(value) {
      try {
        new new Proxy(value, {construct() { return {}; }});
        return true;
      } catch (err) {
        return false;
      }
    }

    /**
    * Matches a message with a filter.
    * @private
    * @param {string|Object|function} filter - filter to be matched
    * @param {Message} msg - message to be matched to the filter
    * @returns {boolean} - true if the message matches the filter
    */
    _matchMessage(filter, msg){
      if (typeof filter == 'string' || filter instanceof String) {
        return 'inReplyTo' in msg && msg.inReplyTo == filter;
      } else if (Object.prototype.hasOwnProperty.call(filter, 'msgID')) {
        return 'inReplyTo' in msg && msg.inReplyTo == filter.msgID;
      } else if (filter.__proto__.name == 'Message' || filter.__proto__.__proto__.name == 'Message') {
        return filter.__clazz__ == msg.__clazz__;
      } else if (typeof filter == 'function' && !this._isConstructor(filter)) {
        try {
          return filter(msg);
        }catch(e){
          console.warn('Error in filter : ' + e);
          return false;
        }
      } else {
        return msg instanceof filter;
      }
    }

    /**
    * Gets the next message from the _queue that matches the filter.
    * @private
    * @param {string|Object|function} filter - filter to be matched
    */
    _getMessageFromQueue(filter) {
      if (!this._queue.length) return;
      if (!filter) return this._queue.shift();
      let matchedMsg = this._queue.find( msg => this._matchMessage(filter, msg));
      if (matchedMsg) this._queue.splice(this._queue.indexOf(matchedMsg), 1);
      return matchedMsg;
    }

    /**
    * Gets a cached gateway object for the given URL (if it exists).
    * @private
    * @param {URL} url - URL object of the master container to connect to
    * @returns {Gateway|void} - gateway object for the given URL
    */
    _getGWCache(url){
      if (!gObj.fjage || !gObj.fjage.gateways) return null;
      var f = gObj.fjage.gateways.filter(g => g.connector.url.toString() == url.toString());
      if (f.length ) return f[0];
      return null;
    }

    /**
    * Adds a gateway object to the cache if it doesn't already exist.
    * @private
    * @param {Gateway} gw - gateway object to be added to the cache
    */
    _addGWCache(gw){
      if (!gObj.fjage || !gObj.fjage.gateways) return;
      gObj.fjage.gateways.push(gw);
    }

    /**
    * Removes a gateway object from the cache if it exists.
    * @private
    * @param {Gateway} gw - gateway object to be removed from the cache
    */
    _removeGWCache(gw){
      if (!gObj.fjage || !gObj.fjage.gateways) return;
      var index = gObj.fjage.gateways.indexOf(gw);
      if (index != null) gObj.fjage.gateways.splice(index,1);
    }

    /** @private */
    _update_watch() {
      let watch = Object.keys(this._subscriptions);
      watch.push(this.aid.toJSON());
      const jsonMsg = JSONMessage.createWantsMessagesFor(watch.map(id => AgentID.fromJSON(id)));
      this._msgTx(jsonMsg);
    }

    /**
    * Add an event listener to listen to various events happening on this Gateway
    *
    * @param {string} type - type of event to be listened to
    * @param {function} listener - new callback/function to be called when the event happens
    * @returns {void}
    */
    addEventListener(type, listener) {
      if (!Array.isArray(this._eventListeners[type])){
        this._eventListeners[type] = [];
      }
      this._eventListeners[type].push(listener);
    }

    /**
    * Remove an event listener.
    *
    * @param {string} type - type of event the listener was for
    * @param {function} listener - callback/function which was to be called when the event happens
    * @returns {void}
    */
    removeEventListener(type, listener) {
      if (!this._eventListeners[type]) return;
      let ndx = this._eventListeners[type].indexOf(listener);
      if (ndx >= 0) this._eventListeners[type].splice(ndx, 1);
    }

    /**
    * Add a new listener to listen to all {Message}s sent to this Gateway
    *
    * @param {function} listener - new callback/function to be called when a {Message} is received
    * @returns {void}
    */
    addMessageListener(listener) {
      this.addEventListener('message',listener);
    }

    /**
    * Remove a message listener.
    *
    * @param {function} listener - removes a previously registered listener/callback
    * @returns {void}
    */
    removeMessageListener(listener) {
      this.removeEventListener('message', listener);
    }

    /**
    * Add a new listener to get notified when the connection to master is created and terminated.
    *
    * @param {function} listener - new callback/function to be called connection to master is created and terminated
    * @returns {void}
    */
    addConnListener(listener) {
      this.addEventListener('conn', listener);
    }

    /**
    * Remove a connection listener.
    *
    * @param {function} listener - removes a previously registered listener/callback
    * @returns {void}
    */
    removeConnListener(listener) {
      this.removeEventListener('conn', listener);
    }

    /**
    * Gets the agent ID associated with the gateway.
    *
    * @returns {AgentID} - agent ID
    */
    getAgentID() {
      return this.aid;
    }

    /**
    * Get an AgentID for a given agent name.
    *
    * @param {string} name - name of agent
    * @returns {AgentID} - AgentID for the given name
    */
    agent(name) {
      return new AgentID(name, false, this);
    }

    /**
    * Returns an object representing the named topic.
    *
    * @param {string|AgentID} topic - name of the topic or AgentID
    * @param {string} [topic2] - name of the topic if the topic param is an AgentID
    * @returns {AgentID} - object representing the topic
    */
    topic(topic, topic2) {
      if (typeof topic == 'string' || topic instanceof String) return new AgentID(topic, true, this);
      if (topic instanceof AgentID) {
        if (topic.isTopic()) return topic;
        return new AgentID(topic.getName()+(topic2 ? '__' + topic2 : '')+'__ntf', true, this);
      }
    }

    /**
    * Subscribes the gateway to receive all messages sent to the given topic.
    *
    * @param {AgentID} topic - the topic to subscribe to
    * @returns {boolean} - true if the subscription is successful, false otherwise
    */
    subscribe(topic) {
      if (!topic.isTopic()) topic = new AgentID(topic.getName() + '__ntf', true, this);
      this._subscriptions[topic.toJSON()] = true;
      this._update_watch();
      return true;
    }

    /**
    * Unsubscribes the gateway from a given topic.
    *
    * @param {AgentID} topic - the topic to unsubscribe
    * @returns {void}
    */
    unsubscribe(topic) {
      if (!topic.isTopic()) topic = new AgentID(topic.getName() + '__ntf', true, this);
      delete this._subscriptions[topic.toJSON()];
      this._update_watch();
    }

    /**
    * Gets a list of all agents in the container.
    * @param {number} [timeout=opts.timeout] - timeout in milliseconds
    * @returns {Promise<AgentID[]>} - a promise which returns an array of all agent ids when resolved
    */
    async agents(timeout=this._timeout) {
      let jsonMsg = JSONMessage.createAgents();
      let rsp = await this._msgTxRx(jsonMsg, timeout);
      if (!rsp || !Array.isArray(rsp.agentIDs)) throw new Error('Unable to get agents');
      return rsp.agentIDs;
    }

    /**
    * Check if an agent with a given name exists in the container.
    *
    * @param {AgentID|string} agentID - the agent id to check
    * @param {number} [timeout=opts.timeout] - timeout in milliseconds
    * @returns {Promise<boolean>} - a promise which returns true if the agent exists when resolved
    */
    async containsAgent(agentID, timeout=this._timeout) {
      let jsonMsg = JSONMessage.createContainsAgent(agentID instanceof AgentID ? agentID : new AgentID(agentID));
      let rsp = await this._msgTxRx(jsonMsg, timeout);
      if (!rsp) {
        if (this._returnNullOnFailedResponse) return null;
        else throw new Error('Unable to check if agent exists');
      }
      return !!rsp.answer;
    }

    /**
    * Finds an agent that provides a named service. If multiple agents are registered
    * to provide a given service, any of the agents' id may be returned.
    *
    * @param {string} service - the named service of interest
    * @param {number} [timeout=opts.timeout] - timeout in milliseconds
    * @returns {Promise<?AgentID>} - a promise which returns an agent id for an agent that provides the service when resolved
    */
    async agentForService(service, timeout=this._timeout) {
      let jsonMsg = JSONMessage.createAgentForService(service);
      let rsp = await this._msgTxRx(jsonMsg, timeout);
      if (!rsp) {
        if (this._returnNullOnFailedResponse) return null;
        else throw new Error('Unable to get agent for service');
      }
      return rsp.agentID;
    }

    /**
    * Finds all agents that provides a named service.
    *
    * @param {string} service - the named service of interest
    * @param {number} [timeout=opts.timeout] - timeout in milliseconds
    * @returns {Promise<AgentID[]>} - a promise which returns an array of all agent ids that provides the service when resolved
    */
    async agentsForService(service, timeout=this._timeout) {
      let jsonMsg = JSONMessage.createAgentsForService(service);
      let rsp = await this._msgTxRx(jsonMsg, timeout);
      if (!rsp) {
        if (this._returnNullOnFailedResponse) return null;
        else throw new Error('Unable to get agents for service');
      }
      return rsp.agentIDs || [];
    }

    /**
    * Sends a message to the recipient indicated in the message. The recipient
    * may be an agent or a topic.
    *
    * @param {Message} msg - message to be sent
    * @returns {boolean} - if sending was successful
    */
    send(msg) {
      msg.sender = this.aid;
      this._sendEvent('txmsg', msg);
      const jsonMsg = JSONMessage.createSend(msg, true);
      return !!this._msgTx(jsonMsg);
    }

    /**
    * Flush the Gateway _queue for all pending messages. This drops all the pending messages.
    * @returns {void}
    *
    */
    flush() {
      this._queue.length = 0;
    }

    /**
    * Sends a request and waits for a response. This method returns a {Promise} which resolves when a response
    * is received or if no response is received after the timeout.
    *
    * @param {Message} msg - message to send
    * @param {number} [timeout=opts.timeout] - timeout in milliseconds
    * @returns {Promise<Message|void>} - a promise which resolves with the received response message, null on timeout
    */
    async request(msg, timeout=this._timeout) {
      this.send(msg);
      return this.receive(msg, timeout);
    }

    /**
    * Returns a response message received by the gateway. This method returns a {Promise} which resolves when
    * a response is received or if no response is received after the timeout.
    *
    * @param {function|Message|typeof Message} filter - original message to which a response is expected, or a MessageClass of the type
    * of message to match, or a closure to use to match against the message
    * @param {number} [timeout=0] - timeout in milliseconds
    * @returns {Promise<Message|void>} - received response message, null on timeout
    */
    async receive(filter, timeout=0) {
      return new Promise(resolve => {
        let msg = this._getMessageFromQueue.call(this,filter);
        if (msg) {
          resolve(msg);
          return;
        }
        if (timeout == 0) {
          if (this.debug) console.log('Receive Timeout : ' + filter);
          resolve();
          return;
        }
        let lid = UUID7.generate().toString();
        let timer;
        if (timeout > 0){
          timer = setTimeout(() => {
            this._pending_receives[lid] && delete this._pending_receives[lid];
            if (this.debug) console.log('Receive Timeout : ' + filter);
            resolve();
          }, timeout);
        }
        // listener for each pending receive
        this._pending_receives[lid] = msg => {
          // skip if the message does not match the filter
          if (msg && !this._matchMessage(filter, msg)) return false;
          if(timer) clearTimeout(timer);
          // if the message matches the filter or is null, delete listener clear timer and resolve
          this._pending_receives[lid] && delete this._pending_receives[lid];
          resolve(msg);
          return true;
        };
      });
    }

    /**
    * Closes the gateway. The gateway functionality may not longer be accessed after
    * this method is called.
    * @returns {void}
    */
    close() {
      this.connector.close();
      this._removeGWCache(this);
    }

  }

  const DEFAULT_TIMEOUT = 10000; // Default timeout for non-owned AgentIDs


  /**
  * An identifier for an agent or a topic. This can be to send, receive messages, and set or get parameters
  * on an agent or topic on the fjåge master container.
  *
  * @class
  * @param {string} name - name of the agent
  * @param {boolean} [topic=false] - name of topic
  * @param {Gateway} [owner] - Gateway owner for this AgentID
  */
  class AgentID {

    constructor(name, topic=false, owner) {
      this.name = name;
      this.topic = topic;
      this.owner = owner;
      this._timeout = owner ? owner._timeout : DEFAULT_TIMEOUT; // Default timeout if owner is not provided
    }

    /**
    * Gets the name of the agent or topic.
    *
    * @returns {string} - name of agent or topic
    */
    getName() {
      return this.name;
    }

    /**
    * Returns true if the agent id represents a topic.
    *
    * @returns {boolean} - true if the agent id represents a topic, false if it represents an agent
    */
    isTopic() {
      return this.topic;
    }

    /**
    * Sends a message to the agent represented by this id.
    *
    * @param {Message} msg - message to send
    * @returns {void}
    */
    send(msg) {
      msg.recipient = this;
      if (this.owner) this.owner.send(msg);
      else throw new Error('Unowned AgentID cannot send messages');
    }

    /**
    * Sends a request to the agent represented by this id and waits for a reponse.
    *
    * @param {Message} msg - request to send
    * @param {number} [timeout=owner.timeout] - timeout in milliseconds
    * @returns {Promise<Message>} - response
    */
    async request(msg, timeout=this._timeout) {
      msg.recipient = this;
      if (this.owner) return this.owner.request(msg, timeout);
      else throw new Error('Unowned AgentID cannot send messages');
    }

    /**
    * Gets a string representation of the agent id.
    *
    * @returns {string} - string representation of the agent id
    */
    toString() {
      return this.toJSON() + ((this.owner && this.owner.connector) ? ` on ${this.owner.connector.url}` : '');
    }

    /**
    * Gets a JSON string representation of the agent id.
    *
    * @returns {string} - JSON string representation of the agent id
    */
    toJSON() {
      return (this.topic ? '#' : '') + this.name;
    }

    /**
     * Inflate the AgentID from a JSON string or object.
     *
     * @param {string} json - JSON string or object to be converted to an AgentID
     * @param {Gateway} [owner] - Gateway owner for this AgentID
     * @returns {AgentID} - AgentID created from the JSON string or object
     */
    static fromJSON(json, owner) {
      if (typeof json !== 'string') {
        throw new Error('Invalid JSON for AgentID');
      }
      json = json.trim();
      if (json.startsWith('#')) {
        return new AgentID(json.substring(1), true, owner);
      } else {
        return new AgentID(json, false, owner);
      }
    }

    /**
    * Sets parameter(s) on the Agent referred to by this AgentID.
    *
    * @param {(string|string[])} params - parameters name(s) to be set
    * @param {(Object|Object[])} values - parameters value(s) to be set
    * @param {number} [index=-1] - index of parameter(s) to be set
    * @param {number} [timeout=owner.timeout] - timeout for the response
    * @returns {Promise<(Object|Object[])>} - a promise which returns the new value(s) of the parameters
    */
    async set (params, values, index=-1, timeout=this._timeout) {
      if (!params) return null;
      let msg = new ParameterReq();
      msg.recipient = this;
      if (Array.isArray(params)){
        if (params.length != values.length) throw new Error(`Parameters and values arrays must have the same length: ${params.length} != ${values.length}`);
        const clonedParams = params.slice(); // Clone the array to avoid side effects
        const clonedValues = values.slice(); // Clone the values array
        msg.param = clonedParams.shift();
        msg.value = clonedValues.shift();
        msg.requests = clonedParams.map((p, i) => {
          return {
            'param': p,
            'value': clonedValues[i]
          };
        });
      } else {
        msg.param = params;
        msg.value = values;
      }
      msg.index = Number.isInteger(index) ? index : -1;
      const rsp = await this.owner.request(msg, timeout);
      var ret = Array.isArray(params) ? new Array(params.length).fill(null) : null;
      if (!rsp || rsp.perf != Performative.INFORM || !rsp.param) {
        if (this.owner._returnNullOnFailedResponse) return ret;
        else throw new Error(`Unable to set ${this.name}.${params} to ${values}`);
      }
      if (Array.isArray(params)) {
        if (!rsp.values) rsp.values = {};
        if (rsp.param) rsp.values[rsp.param] = rsp.value;
        const rkeys = Object.keys(rsp.values);
        return params.map( p => {
          if (p.includes('.')) p = p.split('.').pop();
          let f = rkeys.find(k => (k.includes('.') ? k.split('.').pop() : k) == p);
          return f ? rsp.values[f] : undefined;
        });
      } else {
        return rsp.value;
      }
    }


    /**
    * Gets parameter(s) on the Agent referred to by this AgentID.
    *
    * @param {(string|string[])} params - parameters name(s) to be get, null implies get value of all parameters on the Agent
    * @param {number} [index=-1] - index of parameter(s) to be get
    * @param {number} [timeout=owner.timeout] - timeout for the response
    * @returns {Promise<(Object|Object[])>} - a promise which returns the value(s) of the parameters
    */
    async get(params, index=-1, timeout=this._timeout) {
      let msg = new ParameterReq();
      msg.recipient = this;
      if (params){
        if (Array.isArray(params)) {
          const clonedParams = params.slice(); // Clone the array to avoid side effects
          msg.param = clonedParams.shift();
          msg.requests = clonedParams.map(p => {return {'param': p};});
        }
        else msg.param = params;
      }
      msg.index = Number.isInteger(index) ? index : -1;
      const rsp = await this.owner.request(msg, timeout);
      var ret = Array.isArray(params) ? new Array(params.length).fill(null) : null;
      if (!rsp || rsp.perf != Performative.INFORM || !rsp.param) {
        if (this.owner._returnNullOnFailedResponse) return ret;
        else throw new Error(`Unable to get ${this.name}.${params}`);
      }
      // Request for listing of all parameters.
      if (!params) {
        if (!rsp.values) rsp.values = {};
        if (rsp.param) rsp.values[rsp.param] = rsp.value;
        return rsp.values;
      } else if (Array.isArray(params)) {
        if (!rsp.values) rsp.values = {};
        if (rsp.param) rsp.values[rsp.param] = rsp.value;
        const rkeys = Object.keys(rsp.values);
        return params.map( p => {
          if (p.includes('.')) p = p.split('.').pop();
          let f = rkeys.find(k => (k.includes('.') ? k.split('.').pop() : k) == p);
          return f ? rsp.values[f] : undefined;
        });
      } else {
        return rsp.value;
      }
    }
  }

  /**
  * Base class for messages transmitted by one agent to another. Creates an empty message.
  * @class
  *
  * @property {string} msgID - unique message ID
  * @property {Performative} perf - performative of the message
  * @property {AgentID} [sender] - AgentID of the sender of the message
  * @property {AgentID} [recipient] - AgentID of the recipient of the message
  * @property {string} [inReplyTo] - ID of the message to which this message is a response
  * @property {number} [sentAt] - timestamp when the message was sent
  */
  class Message {

    /**
    * @param {Message} [inReplyToMsg] - message to which this message is a response
    * @param {Performative} [perf=Performative.INFORM] - performative of the message
    */
    constructor(inReplyToMsg, perf=Performative.INFORM) {
      this.__clazz__ = 'org.arl.fjage.Message';
      this.msgID = UUID7.generate().toString();
      this.perf = perf;
      this.sender = null;
      this.recipient = inReplyToMsg ? inReplyToMsg.sender : null;
      this.inReplyTo = inReplyToMsg ? inReplyToMsg.msgID : null;
    }

    /**
    * Gets a string representation of the message.
    *
    * @returns {string} - string representation
    */
    toString() {
      let p = this.perf ? this.perf.toString() : 'MESSAGE';
      if (this.__clazz__ == 'org.arl.fjage.Message') return p;
      return p + ': ' + this.__clazz__.replace(/^.*\./, '');
    }

    /** Convert a message into a object for JSON serialization.
    *
    * NOTE: we don't do any base64 encoding for TX as
    *       we don't know what data type is intended
    *
    * @return {Object} - JSON string representation of the message
    */
    toJSON() {
      let props = {};
      for (let key in this) {
        if (key.startsWith('_')) continue; // skip private properties
        // @ts-ignore
        props[key] = this[key];
      }
      return { 'clazz': this.__clazz__, 'data': props };
    }


    /**
    * Create a message from a object parsed from the JSON representation of the message.
    *
    * @param {Object} jsonObj - Object containing all the properties of the message
    * @returns {Message} - A message created from the Object
    *
    */
    static fromJSON(jsonObj) {
      if (!( 'clazz' in jsonObj) || !( 'data' in jsonObj)) {
        throw new Error(`Invalid Object for Message : ${jsonObj}`);
      }
      let qclazz = jsonObj.clazz;
      let clazz = qclazz.replace(/^.*\./, '');
      let rv = MessageClass[clazz] ? new MessageClass[clazz] : new Message();
      rv.__clazz__ = qclazz;
      // copy all properties from the data object
      for (var key in jsonObj.data){
        if (key === 'sender' || key === 'recipient') {
          if (jsonObj.data[key] && typeof jsonObj.data[key] === 'string') {
            rv[key] = AgentID.fromJSON(jsonObj.data[key]);
          }
        } else rv[key] = jsonObj.data[key];
      }
      return rv;
    }
  }

  /**
  * Creates a unqualified message class based on a fully qualified name.
  * @param {string} name - fully qualified name of the message class to be created
  * @param {typeof Message} [parent] - class of the parent MessageClass to inherit from
  * @constructs Message
  * @example
  * const ParameterReq = MessageClass('org.arl.fjage.param.ParameterReq');
  * let pReq = new ParameterReq()
  */
  function MessageClass(name, parent=Message) {
    let sname = name.replace(/^.*\./, '');
    if (MessageClass[sname]) return MessageClass[sname];
    let cls = class extends parent {
      /**
      * @param {{ [x: string]: any; }} params
      */
      constructor(params) {
        super();
        this.__clazz__ = name;
        if (params){
          const keys = Object.keys(params);
          for (let k of keys) {
            this[k] = params[k];
          }
        }
        if (name.endsWith('Req')) this.perf = Performative.REQUEST;
      }
    };
    cls.__clazz__ = name;
    MessageClass[sname] = cls;
    return cls;
  }

  /**
  * @typedef {Object} ParameterReq.Entry
  * @property {string} param - parameter name
  * @property {Object} value - parameter value
  * @exports ParameterReq.Entry
  */

  /**
  * A message that requests one or more parameters of an agent.
  *
  * @example <caption>Setting a parameter myAgent.x to 42</caption>
  * let req = new ParameterReq({
  *  recipient: myAgentId,
  *  param: 'x',
  *  value: 42
  * });
  *
  * @example <caption>Getting the value of myAgent.x</caption>
  * let req = new ParameterReq({
  * recipient: myAgentId,
  * param: 'x'
  * });
  *
  * @typedef {Message} ParameterReq
  * @property {string} param - parameters name to be get/set if only a single parameter is to be get/set
  * @property {Object} value - parameters value to be set if only a single parameter is to be set
  * @property {Array<ParameterReq.Entry>} requests - a list of multiple parameters to be get/set
  * @property {number} [index=-1] - index of parameter(s) to be set*
  * @exports ParameterReq
  */
  const ParameterReq = MessageClass('org.arl.fjage.param.ParameterReq');

  /**
  * A message that is a response to a {@link ParameterReq} message.
  *
  * @example <caption>Receiving a parameter from myAgent</caption>
  * let rsp = gw.receive(ParameterRsp)
  * rsp.sender // = myAgentId; sender of the message
  * rsp.param  // = 'x'; parameter name that was get/set
  * rsp.value  // = 42;  value of the parameter that was set
  * rsp.readonly // = [false]; indicates if the parameter is read-only
  *
  *
  * @typedef {Message} ParameterRsp
  * @property {string} param - parameters name if only a single parameter value was requested
  * @property {Object} value - parameters value if only a single parameter was requested
  * @property {Map<string, Object>} values - a map of multiple parameter names and their values if multiple parameters were requested
  * @property {Array<boolean>} readonly - a list of booleans indicating if the parameters are read-only
  * @property {number} [index=-1] - index of parameter(s) being returned
  * @exports ParameterReq
  */
  MessageClass('org.arl.fjage.param.ParameterRsp');

  /**
  * Services supported by fjage agents.
  */
  const Services = {
    SHELL : 'org.arl.fjage.shell.Services.SHELL'
  };

  init();

  const DatagramReq$1 = MessageClass('org.arl.unet.DatagramReq');
  const DatagramNtf$1 = MessageClass('org.arl.unet.DatagramNtf');
  const TxFrameReq = MessageClass('org.arl.unet.phy.TxFrameReq', DatagramReq$1);
  const RxFrameNtf$1 = MessageClass('org.arl.unet.phy.RxFrameNtf', DatagramNtf$1);
  const BasebandSignal = MessageClass('org.arl.unet.bb.BasebandSignal');

  let UnetServices = {
    'NODE_INFO': 'org.arl.unet.Services.NODE_INFO',
    'ADDRESS_RESOLUTION': 'org.arl.unet.Services.ADDRESS_RESOLUTION',
    'DATAGRAM': 'org.arl.unet.Services.DATAGRAM',
    'PHYSICAL': 'org.arl.unet.Services.PHYSICAL',
    'RANGING': 'org.arl.unet.Services.RANGING',
    'BASEBAND': 'org.arl.unet.Services.BASEBAND',
    'LINK': 'org.arl.unet.Services.LINK',
    'MAC': 'org.arl.unet.Services.MAC',
    'ROUTING': 'org.arl.unet.Services.ROUTING',
    'ROUTE_MAINTENANCE': 'org.arl.unet.Services.ROUTE_MAINTENANCE',
    'TRANSPORT': 'org.arl.unet.Services.TRANSPORT',
    'REMOTE': 'org.arl.unet.Services.REMOTE',
    'STATE_MANAGER': 'org.arl.unet.Services.STATE_MANAGER',
    'DEVICE_INFO': 'org.arl.unet.Services.DEVICE_INFO',
    'DOA': 'org.arl.unet.Services.DOA',
    'SCHEDULER':'org.arl.unet.Services.SCHEDULER'
  };

  Object.assign(Services, UnetServices);

  /**
   * Well-known protocol number assignments used in UnetStack
   * @typedef {Object.<string, number>} Protocol
   */
  let Protocol = {
    'DATA' : 0,               // Protocol number for user application data.
    'RANGING' : 1,            // Protocol number for use by ranging agents.
    'LINK' : 2,               // Protocol number for use by link agents.
    'REMOTE' : 3,             // Protocol number for use by remote management agents.
    'MAC' : 4,                // Protocol number for use by MAC protocol agents.
    'ROUTING' : 5,            // Protocol number for use by routing agents.
    'TRANSPORT' : 6,          // Protocol number for use by transport agents.
    'ROUTE_MAINTENANCE' : 7,   // Protocol number for use by route maintenance agents.
    'LINK2' : 8,              // Protocol number for use by secondary link agents.
    'USER' : 32,              // Lowest protocol number allowable for user protocols.
    'MAX' : 63,               // Largest protocol number allowable.
  };

  /**
   * Well-known protocol Messages used in UnetStack
   * @typedef {Object.<string, MessageClass>} UnetMessages
   */
  let UnetMessages = {
    // unet
    'TestReportNtf'          : MessageClass('org.arl.unet.TestReportNtf'),
    'AbnormalTerminationNtf' : MessageClass('org.arl.unet.AbnormalTerminationNtf'),
    'CapabilityListRsp'      : MessageClass('org.arl.unet.CapabilityListRsp'),
    'CapabilityReq'          : MessageClass('org.arl.unet.CapabilityReq'),
    'ClearReq'               : MessageClass('org.arl.unet.ClearReq'),
    'DatagramCancelReq'      : MessageClass('org.arl.unet.DatagramCancelReq'),
    'DatagramDeliveryNtf'    : MessageClass('org.arl.unet.DatagramDeliveryNtf'),
    'DatagramFailureNtf'     : MessageClass('org.arl.unet.DatagramFailureNtf'),
    'DatagramNtf'            : MessageClass('org.arl.unet.DatagramNtf'),
    'DatagramProgressNtf'    : MessageClass('org.arl.unet.DatagramProgressNtf'),
    'DatagramReq'            : MessageClass('org.arl.unet.DatagramReq'),
    'ParamChangeNtf'         : MessageClass('org.arl.unet.ParamChangeNtf'),
    'RefuseRsp'              : MessageClass('org.arl.unet.RefuseRsp'),
    'FailureNtf'             : MessageClass('org.arl.unet.FailureNtf'),

    // net
    'DatagramTraceReq'       : MessageClass('org.arl.unet.net.DatagramTraceReq'),
    'RouteDiscoveryReq'      : MessageClass('org.arl.unet.net.RouteDiscoveryReq'),
    'RouteTraceReq'          : MessageClass('org.arl.unet.net.RouteTraceReq'),
    'RouteDiscoveryNtf'      : MessageClass('org.arl.unet.net.RouteDiscoveryNtf'),
    'RouteTraceNtf'          : MessageClass('org.arl.unet.net.RouteTraceNtf'),

    // phy
    'FecDecodeReq'           : MessageClass('org.arl.unet.phy.FecDecodeReq'),
    'RxSWiG1FrameNtf'        : MessageClass('org.arl.unet.phy.RxSWiG1FrameNtf', RxFrameNtf$1),
    'TxSWiG1FrameReq'        : MessageClass('org.arl.unet.phy.TxSWiG1FrameReq', TxFrameReq),
    'RxJanusFrameNtf'        : MessageClass('org.arl.unet.phy.RxJanusFrameNtf', RxFrameNtf$1),
    'TxJanusFrameReq'        : MessageClass('org.arl.unet.phy.TxJanusFrameReq', TxFrameReq),
    'BadFrameNtf'            : MessageClass('org.arl.unet.phy.BadFrameNtf'),
    'BadRangeNtf'            : MessageClass('org.arl.unet.phy.BadRangeNtf'),
    'ClearSyncReq'           : MessageClass('org.arl.unet.phy.ClearSyncReq'),
    'CollisionNtf'           : MessageClass('org.arl.unet.phy.CollisionNtf'),
    'RxFrameNtf'             : MessageClass('org.arl.unet.phy.RxFrameNtf', DatagramNtf$1),
    'RxFrameStartNtf'        : MessageClass('org.arl.unet.phy.RxFrameStartNtf'),
    'SyncInfoReq'            : MessageClass('org.arl.unet.phy.SyncInfoReq'),
    'SyncInfoRsp'            : MessageClass('org.arl.unet.phy.SyncInfoRsp'),
    'TxFrameNtf'             : MessageClass('org.arl.unet.phy.TxFrameNtf'),
    'TxFrameReq'             : MessageClass('org.arl.unet.phy.TxFrameReq', DatagramReq$1),
    'TxFrameStartNtf'        : MessageClass('org.arl.unet.phy.TxFrameStartNtf'),
    'TxRawFrameReq'          : MessageClass('org.arl.unet.phy.TxRawFrameReq'),

    // addr
    'AddressAllocReq'        : MessageClass('org.arl.unet.addr.AddressAllocReq'),
    'AddressAllocRsp'        : MessageClass('org.arl.unet.addr.AddressAllocRsp'),
    'AddressResolutionReq'   : MessageClass('org.arl.unet.addr.AddressResolutionReq'),
    'AddressResolutionRsp'   : MessageClass('org.arl.unet.addr.AddressResolutionRsp'),

    // bb
    'BasebandSignal'         : MessageClass('org.arl.unet.bb.BasebandSignal'),
    'RecordBasebandSignalReq' : MessageClass('org.arl.unet.bb.RecordBasebandSignalReq'),
    'RxBasebandSignalNtf'    : MessageClass('org.arl.unet.bb.RxBasebandSignalNtf', BasebandSignal),
    'TxBasebandSignalReq'    : MessageClass('org.arl.unet.bb.TxBasebandSignalReq', BasebandSignal),

    // link
    'LinkStatusNtf'          : MessageClass('org.arl.unet.link.LinkStatusNtf'),

    // localization
    'RangeNtf'               : MessageClass('org.arl.unet.localization.RangeNtf'),
    'RangeReq'               : MessageClass('org.arl.unet.localization.RangeReq'),
    'BeaconReq'              : MessageClass('org.arl.unet.localization.BeaconReq'),
    'RespondReq'             : MessageClass('org.arl.unet.localization.RespondReq'),
    'InterrogationNtf'       : MessageClass('org.arl.unet.localization.InterrogationNtf'),


    // mac
    'ReservationAcceptReq'   : MessageClass('org.arl.unet.mac.ReservationAcceptReq'),
    'ReservationCancelReq'   : MessageClass('org.arl.unet.mac.ReservationCancelReq'),
    'ReservationReq'         : MessageClass('org.arl.unet.mac.ReservationReq'),
    'ReservationRsp'         : MessageClass('org.arl.unet.mac.ReservationRsp'),
    'ReservationStatusNtf'   : MessageClass('org.arl.unet.mac.ReservationStatusNtf'),
    'RxAckNtf'               : MessageClass('org.arl.unet.mac.RxAckNtf'),
    'TxAckReq'               : MessageClass('org.arl.unet.mac.TxAckReq'),


    // remote
    'RemoteExecReq'          : MessageClass('org.arl.unet.remote.RemoteExecReq'),
    'RemoteFailureNtf'       : MessageClass('org.arl.unet.remote.RemoteFailureNtf'),
    'RemoteFileGetReq'       : MessageClass('org.arl.unet.remote.RemoteFileGetReq'),
    'RemoteFileNtf'          : MessageClass('org.arl.unet.remote.RemoteFileNtf'),
    'RemoteFilePutReq'       : MessageClass('org.arl.unet.remote.RemoteFilePutReq'),
    'RemoteSuccessNtf'       : MessageClass('org.arl.unet.remote.RemoteSuccessNtf'),
    'RemoteTextNtf'          : MessageClass('org.arl.unet.remote.RemoteTextNtf'),
    'RemoteTextReq'          : MessageClass('org.arl.unet.remote.RemoteTextReq'),

    // scheduler
    'AddScheduledSleepReq'   : MessageClass('org.arl.unet.scheduler.AddScheduledSleepReq'),
    'GetSleepScheduleReq'    : MessageClass('org.arl.unet.scheduler.GetSleepScheduleReq'),
    'RemoveScheduledSleepReq' : MessageClass('org.arl.unet.scheduler.RemoveScheduledSleepReq'),
    'SleepScheduleRsp'       : MessageClass('org.arl.unet.scheduler.SleepScheduleRsp'),
    'WakeFromSleepNtf'       : MessageClass('org.arl.unet.scheduler.WakeFromSleepNtf'),

    // state
    'ClearStateReq'          : MessageClass('org.arl.unet.state.ClearStateReq'),
    'SaveStateReq'           : MessageClass('org.arl.unet.state.SaveStateReq')
  };

  /**
    * Convert coordinates from a local coordinates to GPS coordinate
    * @param {Array} origin - Local coordinate system's origin as `[latitude, longitude]`
    * @param {Number} x - X coordinate of the local coordinate to be converted
    * @param {Number} y - Y coordinate of the local coordinate to be converted
    * @returns {Array} - GPS coordinates (in decimal degrees) as `[latitude, longitude]`
    */

  function toGps(origin, x, y) {
    let coords = [] ;
    let [xScale,yScale] = _initConv(origin[0]);
    coords[1] = x/xScale + origin[1];
    coords[0] = y/yScale + origin[0];
    return coords;
  }

  /**
    * Convert coordinates from a GPS coordinates to local coordinate
    * @param {Array} origin - Local coordinate system's origin as `[latitude, longitude]`
    * @param {Number} lat - Latitude of the GPS coordinate to be converted
    * @param {Number} lon - Longitude of the GPS coordinate to be converted
    * @returns {Array} - GPS coordinates (in decimal degrees) as `[latitude, longitude]`
    */
  function toLocal(origin, lat, lon) {
    let pos = [];
    let [xScale,yScale] = _initConv(origin[0]);
    pos[0] = (lon-origin[1]) * xScale;
    pos[1] = (lat-origin[0]) * yScale;
    return pos;
  }

  function _initConv(lat){
    let rlat = lat * Math.PI/180;
    let yScale = 111132.92 - 559.82*Math.cos(2*rlat) + 1.175*Math.cos(4*rlat) - 0.0023*Math.cos(6*rlat);
    let xScale = 111412.84*Math.cos(rlat) - 93.5*Math.cos(3*rlat) + 0.118*Math.cos(5*rlat);
    return [xScale, yScale];
  }

  /**
   * A message which requests the transmission of the datagram from the Unet
   *
   * @typedef {Message} DatagramReq
   * @property {number[]} data - data as an Array of bytes
   * @property {number} from - from/source node address
   * @property {number} to - to/destination node address
   * @property {number} protocol - protocol number to be used to send this Datagram
   * @property {boolean} reliability - true if Datagram should be reliable, false if unreliable
   * @property {number} ttl - time-to-live for the datagram. Time-to-live is advisory, and an agent may choose it ignore it
   */

  /**
   * Notification of received datagram message received by the Unet node.
   *
   * @typedef {Message} DatagramNtf
   * @property {number[]} data - data as an Array of bytes
   * @property {number} from - from/source node address
   * @property {number} to - to/destination node address
   * @property {number} protocol - protocol number to be used to send this Datagram
   * @property {number} ttl - time-to-live for the datagram. Time-to-live is advisory, and an agent may choose it ignore it
   */

  /**
   * An identifier for an agent or a topic.
   * @external AgentID
   * @see {@link https://org-arl.github.io/fjage/jsdoc/|fjåge.js Documentation}
   */

  /**
   * Services supported by fjage agents.
   * @external Services
   * @see {@link https://org-arl.github.io/fjage/jsdoc/|fjåge.js Documentation}
   */

  /**
   *  An action represented by a message.
   * @external Performative
   * @see {@link https://org-arl.github.io/fjage/jsdoc/|fjåge.js Documentation}
   */

  /**
   * Function to creates a unqualified message class based on a fully qualified name.
   * @external MessageClass
   * @see {@link https://org-arl.github.io/fjage/jsdoc/|fjåge.js Documentation}
   */

  /**
   * A caching CachingAgentID which caches Agent parameters locally.
   *
   * @class
   * @extends AgentID
   * @param {string | AgentID} name - name of the agent or an AgentID to copy
   * @param {boolean} topic - name of topic
   * @param {Gateway} owner - Gateway owner for this AgentID
   * @param {Boolean} [greedy=true] - greedily fetches and caches all parameters if this Agent
   *
  */
  class CachingAgentID extends AgentID {

    constructor(name, topic, owner, greedy=true) {
      if (name instanceof AgentID) {
        super(name.getName(), name.topic, name.owner);
      } else {
        super(name, topic, owner);
      }
      this.greedy = greedy;
      this.cache = {};
      this.specialParams = ['name', 'version'];
    }

    /**
     * Sets parameter(s) on the Agent referred to by this AgentID, and caches the parameter(s).
     *
     * @param {(string|string[])} params - parameters name(s) to be set
     * @param {(Object|Object[])} values - parameters value(s) to be set
     * @param {number} [index=-1] - index of parameter(s) to be set
     * @param {number} [timeout=5000] - timeout for the response
     * @returns {Promise<(Object|Object[])>} - a promise which returns the new value(s) of the parameters
     */
    async set(params, values, index=-1, timeout=5000) {
      let s = await super.set(params, values, index, timeout);
      this._updateCache(params, s, index);
      return s;
    }

    /**
     * Gets parameter(s) on the Agent referred to by this AgentID, getting them from the cache if possible.
     *
     * @param {(string|string[])} params - parameters name(s) to be fetched
     * @param {number} [index=-1] - index of parameter(s) to be fetched
     * @param {number} [timeout=5000] - timeout for the response
     * @param {number} [maxage=5000] - maximum age of the cached result to retreive
     * @returns {Promise<(Object|Object[])>} - a promise which returns the value(s) of the parameters
     */
    async get(params, index=-1, timeout=5000, maxage=5000) {
      if (this._isCached(params, index, maxage)) return this._getCache(params, index);
      if (this.greedy &&
        !(Array.isArray(params) && [...new Set([...params, ...this.specialParams])].length!=0) &&
        !this.specialParams.includes(params)) {
        let rsp = await super.get(null, index, timeout);
        this._updateCache(null, rsp, index);
        if (!rsp) return Array.isArray(params) ? new Array(params.length).fill(null) : null;
        if (!params) return rsp;
        else if (Array.isArray(params)) {
          return params.map(p => {
            let f = Object.keys(rsp).find(rv => this._toNamed(rv) === p);
            return f ? rsp[f] : null;
          });
        } else {
          let f = Object.keys(rsp).find(rv => this._toNamed(rv) === params);
          return f ? rsp[f] : null;
        }
      } else {
        let r = await super.get(params, index, timeout);
        this._updateCache(params, r, index);
        return r;
      }
    }

    _updateCache(params, vals, index) {
      if (vals == null || Array.isArray(vals) && vals.every(v => v == null)) return;
      if (params == null) {
        params = Object.keys(vals);
        vals = Object.values(vals);
      } else if (!Array.isArray(params)) params = [params];
      if (!Array.isArray(vals)) vals = [vals];
      params = params.map(this._toNamed);
      if (this.cache[index.toString()] === undefined) this.cache[index.toString()] = {};
      let c = this.cache[index.toString()];
      for (let i = 0; i < params.length; i++) {
        if (c[params[i]] === undefined) c[params[i]] = {};
        c[params[i]].value = vals[i];
        c[params[i]].ctime = Date.now();
      }
    }

    _isCached(params, index, maxage) {
      if (maxage <= 0) return false;
      if (params == null) return false;
      let c = this.cache[index.toString()];
      if (!c) {
        return false;
      }
      if (!Array.isArray(params)) params = [params];
      const rv = params.every(p => {
        p = this._toNamed(p);
        return (p in c) && (Date.now() - c[p].ctime <= maxage);
      });
      return rv;
    }

    _getCache(params, index) {
      let c = this.cache[index.toString()];
      if (!c) return null;
      if (!Array.isArray(params)){
        if (params in c) return c[params].value;
        return null;
      }else {
        return params.map(p => p in c ? c[p].value : null);
      }
    }

    _toNamed(param) {
      const idx = param.lastIndexOf('.');
      if (idx < 0) return param;
      else return param.slice(idx+1);
    }

  }


  class CachingGateway extends Gateway{

    /**
     * Get an AgentID for a given agent name.
     *
     * @param {string} name - name of agent
     * @param {Boolean} [caching=true] - if the AgentID should cache parameters
     * @param {Boolean} [greedy=true] - greedily fetches and caches all parameters if this Agent
     * @returns {AgentID|CachingAgentID} - AgentID for the given name
     */
    agent(name, caching=true, greedy=true) {
      const aid = super.agent(name);
      return caching ? new CachingAgentID(aid, null, null, greedy) : aid;
    }

    /**
     * Returns an object representing the named topic.
     *
     * @param {string|AgentID} topic - name of the topic or AgentID
     * @param {string} topic2 - name of the topic if the topic param is an AgentID
     * @param {Boolean} [caching=true] - if the AgentID should cache parameters
     * @param {Boolean} [greedy=true] - greedily fetches and caches all parameters if this Agent
     * @returns {AgentID|CachingAgentID} - object representing the topic
     */
    topic(topic, topic2, caching=true, greedy=true) {
      const aid = super.topic(topic, topic2);
      return caching ? new CachingAgentID(aid, null, null, greedy) : aid;
    }

    /**
     * Finds an agent that provides a named service. If multiple agents are registered
     * to provide a given service, any of the agents' id may be returned.
     *
     * @param {string} service - the named service of interest
     * @param {Boolean} [caching=true] - if the AgentID should cache parameters
     * @param {Boolean} [greedy=true] - greedily fetches and caches all parameters if this Agent
     * @returns {Promise<?AgentID|CachingAgentID>} - a promise which returns an agent id for an agent that provides the service when resolved
     */
    async agentForService(service, caching=true, greedy=true) {
      const aid = await super.agentForService(service);
      if (!aid) return aid;
      return caching ? new CachingAgentID(aid, null, null, greedy) : aid;
    }

    /**
     * Finds all agents that provides a named service.
     *
     * @param {string} service - the named service of interest
     * @param {Boolean} [caching=true] - if the AgentID should cache parameters
     * @param {Boolean} [greedy=true] - greedily fetches and caches all parameters if this Agent
     * @returns {Promise<?AgentID|CachingAgentID[]>} - a promise which returns an array of all agent ids that provides the service when resolved
     */
    async agentsForService(service, caching=true, greedy=true) {
      const aids = await super.agentsForService(service);
      return caching ? aids.map(a => new CachingAgentID(a, null, null, greedy)) : aids;
    }
  }

  const REQUEST_TIMEOUT = 1000;

  const AddressResolutionReq = UnetMessages.AddressResolutionReq;
  const DatagramReq = UnetMessages.DatagramReq;
  const DatagramNtf = UnetMessages.DatagramNtf;
  const RxFrameNtf = UnetMessages.RxFrameNtf;

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
  class UnetSocket {

    constructor(hostname, port, path='') {
      return (async () => {
        this.gw = new Gateway({
          hostname : hostname,
          port : port,
          path : path
        });
        this.localProtocol = -1;
        this.remoteAddress = -1;
        this.remoteProtocol = Protocol.DATA;
        this.timeout = 0;
        this.provider = null;
        const alist = await this.gw.agentsForService(Services.DATAGRAM);
        alist.forEach(a => {this.gw.subscribe(this.gw.topic(a));});
        return this;
      })();
    }

    /**
     * Closes the socket. The socket functionality may not longer be accessed after this method is called.
     * @returns {void}
     */
    close() {
      this.gw.close();
      this.gw = null;
    }

    /**
     * Checks if a socket is closed.
     * @returns {boolean} - true if closed, false if open
     */
    isClosed() {
      return this.gw == null;
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
        this.localProtocol = protocol;
        return true;
      }
      return false;
    }

    /**
     * Unbinds a socket so that it listens to all unreserved protocols.
     * Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved.
     * @returns {void}
     */
    unbind() { this.localProtocol = -1;}

    /**
     * Checks if a socket is bound.
     * @returns {boolean} - true if bound to a protocol, false if unbound
     */
    isBound() { return this.localProtocol >= 0;}

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
        this.remoteAddress = to;
        this.remoteProtocol = protocol;
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
      this.remoteAddress = -1;
      this.remoteProtocol = 0;
    }

    /**
     * Checks if a socket is connected, i.e., has a default destination address and protocol number.
     * @returns {boolean} - true if connected, false otherwise
     */
    isConnected() { return this.remoteAddress >= 0; }

    /**
     * Gets the local node address of the Unet node connected to.
     * @returns {Promise<int>} - local node address, or -1 on error
     */
    async getLocalAddress() {
      if (this.gw == null) return -1;
      const nodeinfo = await this.gw.agentForService(Services.NODE_INFO);
      if (nodeinfo == null) return -1;
      const addr = await nodeinfo.get('address');
      return addr != null ? addr : -1;
    }

    /**
     * Gets the protocol number that the socket is bound to.
     * @returns {number}} - protocol number if socket is bound, -1 otherwise
     */
    getLocalProtocol() { return this.localProtocol; }

    /**
     * Gets the default destination node address for a connected socket.
     * @returns {number}} - default destination node address if connected, -1 otherwise
     */
    getRemoteAddress() { return this.remoteAddress; }

    /**
     * Gets the default transmission protocol number.
     * @returns {number}} - default protocol number used to transmit a datagram
     */
    getRemoteProtocol() { return this.remoteProtocol; }

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
      this.timeout = ms;
    }

    /**
     * Gets the timeout for datagram reception.
     * @returns {number} - timeout in milliseconds
     */
    getTimeout() { return this.timeout; }

    /**
     * Transmits a datagram to the specified node address using the specified protocol.
     * Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved,
     * and cannot be used for sending datagrams using the socket.
     * @param {number[]|DatagramReq} data - data to be sent over the socket as an Array of bytes or DatagramReq
     * @param {number} to - destination node address
     * @param {number} protocol - protocol number
     * @returns {Promise<boolean>} - true if the Unet node agreed to send out the Datagram, false otherwise
     */
    async send(data, to=this.remoteAddress, protocol=this.remoteProtocol) {
      if (to < 0 || this.gw == null) return false;
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
        if (this.provider == null) this.provider = await this.gw.agentForService(Services.TRANSPORT);
        if (this.provider == null) this.provider = await this.gw.agentForService(Services.ROUTING);
        if (this.provider == null) this.provider = await this.gw.agentForService(Services.LINK);
        if (this.provider == null) this.provider = await this.gw.agentForService(Services.PHYSICAL);
        if (this.provider == null) this.provider = await this.gw.agentForService(Services.DATAGRAM);
        if (this.provider == null) return false;
        req.recipient = this.provider;
      }
      const rsp = await this.gw.request(req, REQUEST_TIMEOUT);
      return (rsp != null && rsp.perf == Performative.AGREE);
    }

    /**
     * Receives a datagram sent to the local node and the bound protocol number. If the socket is unbound,
     * then datagrams with all unreserved protocols are received. Any broadcast datagrams are also received.
     *
     * @returns {Promise<?DatagramNtf>} - datagram received by the socket
     */
    async receive() {
      if (this.gw == null) return null;
      return await this.gw.receive(msg => {
        if (msg.__clazz__ != DatagramNtf.__clazz__ && msg.__clazz__ != RxFrameNtf.__clazz__ ) return false;
        let p = msg.protocol;
        if (p == Protocol.DATA || p >= Protocol.USER) {
          return this.localProtocol < 0 || this.localProtocol == p;
        }
        return false;
      }, this.timeout);
    }

    /**
     * Gets a Gateway to provide low-level access to UnetStack.
     * @returns {Gateway} - underlying fjage Gateway supporting this socket
     */
    getGateway() { return this.gw; }

    /**
     * Gets an AgentID providing a specified service for low-level access to UnetStack
     * @param {string} svc - the named service of interest
     * @returns {Promise<?AgentID>} - a promise which returns an {@link AgentID} that provides the service when resolved
     */
    async agentForService(svc) {
      if (this.gw == null) return null;
      return await this.gw.agentForService(svc);
    }

    /**
     *
     * @param {string} svc - the named service of interest
     * @returns {Promise<AgentID[]>} - a promise which returns an array of {@link AgentID|AgentIDs} that provides the service when resolved
     */
    async agentsForService(svc) {
      if (this.gw == null) return null;
      return await this.gw.agentsForService(svc);
    }

    /**
     * Gets a named AgentID for low-level access to UnetStack.
     * @param {string} name - name of agent
     * @returns {AgentID} - AgentID for the given name
     */
    agent(name) {
      if (this.gw == null) return null;
      return this.gw.agent(name);
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
      const rsp = await this.gw.request(req, REQUEST_TIMEOUT);
      if (rsp == null || ! Object.prototype.hasOwnProperty.call(rsp, 'address')) return null;
      return rsp.address;
    }
  }

  exports.AgentID = AgentID;
  exports.CachingAgentID = CachingAgentID;
  exports.CachingGateway = CachingGateway;
  exports.Gateway = Gateway;
  exports.Message = Message;
  exports.MessageClass = MessageClass;
  exports.Performative = Performative;
  exports.Protocol = Protocol;
  exports.Services = Services;
  exports.UnetMessages = UnetMessages;
  exports.UnetSocket = UnetSocket;
  exports.toGps = toGps;
  exports.toLocal = toLocal;

}));
//# sourceMappingURL=unetjs.js.map
