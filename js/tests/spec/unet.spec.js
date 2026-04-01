/* global it expect describe AgentID UnetMessages Gateway Services isBrowser isJsDom isNode UnetSocket Protocol toGps toLocal beforeEach jasmine spyOn*/

const DatagramReq = UnetMessages.DatagramReq;
const DatagramNtf = UnetMessages.DatagramNtf;

let gwOpts = [];
if (isBrowser){
  gwOpts = [{
    hostname: 'localhost',
    port : '8081',
    pathname: '/ws/'
  }, {
    hostname: 'localhost',
    port : '8082',
    pathname: '/ws/'
  }];
} else if (isJsDom || isNode){
  gwOpts = [{
    hostname: 'localhost',
    port : '1101',
    pathname: ''
  }, {
    hostname: 'localhost',
    port : '1102',
    pathname: ''
  }, ];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('A UnetSocket', function () {
  it('should be able to be constructed', async function () {
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    expect(usock).toBeInstanceOf(UnetSocket);
    usock.close();
  });

  it('should be able to get local address', async function () {
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let localAddr = await usock.getLocalAddress();
    expect(localAddr).toBe(232);
    usock.close();
  });

  it('should be able get correct IDs for host names', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let hostA = await usock.host('A');
    expect(hostA).toBe(232);
    let hostB = await usock.host('B');
    expect(hostB).toBe(31);
    usock.close();
  });

  it('should be able to get access to Agents for given Service', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let shell = await usock.agentForService(Services.SHELL);
    expect(shell).toBeInstanceOf(AgentID);
    usock.close();
  });

  it('should be able to get access to Agents for given name', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let node = usock.agent('node');
    expect(node).toBeInstanceOf(AgentID);
    usock.close();
  });

  it('should close only when closed', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    expect(usock.isClosed()).toBeFalse();
    usock.close();
    expect(usock.isClosed()).toBeTrue();
  });

  it('should give access the underlying Gateway', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let gw = usock.getGateway();
    expect(gw).toBeInstanceOf(Gateway);
    usock.close();
  });

  it('should be able to get parameters on Agents', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let node = usock.agent('node');
    expect(node).toBeInstanceOf(AgentID);
    expect(await node.get('address')).toBe(232);
    expect(await node.get('nodeName')).toBe('A');
    let phy = await usock.agentForService(Services.PHYSICAL);
    expect(phy).toBeInstanceOf(AgentID);
    expect(await phy.get('name')).toBe('phy');
    expect(await phy.get('MTU')).toBeGreaterThan(0);
    usock.close();
  });

  it('should be able to bind and unbind properly', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    expect(usock.getLocalProtocol()).toBe(-1);
    expect(usock.isBound()).toBeFalse();
    usock.bind(42);
    expect(usock.isBound()).toBeTrue();
    expect(usock.getLocalProtocol()).toBe(42);
    usock.unbind();
    expect(usock.isBound()).toBeFalse();
    expect(usock.getLocalProtocol()).toBe(-1);
    expect(usock.getRemoteAddress()).toBe(-1);
    expect(usock.getRemoteProtocol()).toBe(0);
    expect(usock.isConnected()).toBeFalse();
    usock.connect(31, 0);
    expect(usock.getRemoteAddress()).toBe(31);
    expect(usock.getRemoteProtocol()).toBe(0);
    expect(usock.isConnected()).toBeTrue();
    usock.disconnect();
    expect(usock.isConnected()).toBeFalse();
    expect(usock.getRemoteAddress()).toBe(-1);
    expect(usock.getRemoteProtocol()).toBe(0);
    usock.close();
  });


  it('should honour timeouts', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    usock.bind(0);
    expect(usock.getTimeout()).toBe(0);
    usock.setTimeout(1000);
    expect(usock.getTimeout()).toBe(1000);
    let t1 = Date.now();
    expect(await usock.receive()).toBeUndefined();
    let dt = Date.now() - t1;
    expect(dt).toBeGreaterThanOrEqual(1000);
    usock.setTimeout(0);
    expect(usock.getTimeout()).toBe(0);
    t1 = Date.now();
    expect(await usock.receive()).toBeUndefined();
    dt = Date.now() - t1;
    expect(dt).toBeLessThanOrEqual(500);
    usock.close();
  });

  it('should expose socket-level metadata and send-mode controls', async function() {
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    const phy = await usock.agentForService(Services.PHYSICAL);

    usock.setTTL(42);
    usock.setPriority('HIGH');
    usock.setReliability(true);
    usock.setRoute('route-1');
    usock.setMimeType('application/octet-stream');
    usock.setRemoteRecipient('recipient-1');
    usock.setMailbox('STATUS');
    usock.setMessageClass('org.example.Status');
    usock.setServiceProvider(phy);
    usock.setSendMode(UnetSocket.BLOCKING);

    expect(usock.getTTL()).toBe(42);
    expect(usock.getPriority()).toBe('HIGH');
    expect(usock.getReliability()).toBeTrue();
    expect(usock.getRoute()).toBe('route-1');
    expect(usock.getMimeType()).toBe('application/octet-stream');
    expect(usock.getRemoteRecipient()).toBe('recipient-1');
    expect(usock.getMailbox()).toBe('STATUS');
    expect(usock.getMessageClass()).toBe('org.example.Status');
    expect(usock.getServiceProvider()).toBe(phy);
    expect(usock.getSendMode()).toBe(UnetSocket.BLOCKING);

    usock.close();
  });

  it('should be only able to communicate bound to', async function(){
    let usock1 = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let usock2 = await new UnetSocket(gwOpts[1].hostname, gwOpts[1].port);
    expect(usock2.bind(Protocol.USER)).toBeTrue();
    usock2.setTimeout(1000);

    expect(await usock1.send([1,2,3])).toBeFalse();                   // Can't send if not bound
    expect(await usock1.send([4,5,6], 31)).toBeTrue();                // Can send to target even if not bound
    expect(await usock2.receive()).toBeUndefined();                   // But won't receive since not bound to correct protocol
    expect(await usock1.send([7,8,9], 31, Protocol.USER)).toBeTrue(); // Can send to target and protocol
    let ntf = await usock2.receive();                                 // Will receive since sent to correct protocol
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([7,8,9]);

    usock1.close();
    usock2.close();
  });

  it('should apply socket defaults to deprecated DatagramReq sends', async function() {
    let usock1 = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let usock2 = await new UnetSocket(gwOpts[1].hostname, gwOpts[1].port);
    spyOn(console, 'warn');

    expect(usock2.bind(Protocol.USER)).toBeTrue();
    usock2.setTimeout(1000);

    usock1.connect(31, Protocol.USER);
    usock1.setTTL(15);
    usock1.setReliability(false);
    usock1.setMimeType('application/test');
    usock1.setMailbox('STATUS');

    let req = new DatagramReq();
    req.data = [9, 8, 7];

    expect(await usock1.send(req)).toBeTrue();
    expect(console.warn).toHaveBeenCalled();
    expect(req.to).toBe(31);
    expect(req.protocol).toBe(Protocol.USER);
    expect(req.ttl).toBe(15);
    expect(req.reliability).toBeFalse();
    expect(req.mimeType).toBe('application/test');
    expect(req.mailbox).toBe('STATUS');

    let ntf = await usock2.receive();
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([9, 8, 7]);

    usock1.close();
    usock2.close();
  });

  it('should support reliable semi-blocking sends', async function() {
    let usock1 = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let usock2 = await new UnetSocket(gwOpts[1].hostname, gwOpts[1].port);

    expect(usock2.bind(Protocol.USER)).toBeTrue();
    usock2.setTimeout(1000);

    usock1.connect(31, Protocol.USER);
    usock1.setReliability(true);
    usock1.setSendMode(UnetSocket.SEMI_BLOCKING);

    expect(await usock1.send([3, 1, 4])).toBeTrue();
    let ntf = await usock2.receive();
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([3, 1, 4]);

    usock1.close();
    usock2.close();
  });

  it('should support blocking sends', async function() {
    let usock1 = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let usock2 = await new UnetSocket(gwOpts[1].hostname, gwOpts[1].port);

    expect(usock2.bind(Protocol.USER)).toBeTrue();
    usock2.setTimeout(1000);

    usock1.connect(31, Protocol.USER);
    usock1.setSendMode(UnetSocket.BLOCKING);

    expect(await usock1.send([2, 7, 1, 8])).toBeTrue();
    let ntf = await usock2.receive();
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([2, 7, 1, 8]);

    usock1.close();
    usock2.close();
  });

  it('should be only able to communicate on the protocol connected to', async function(){
    let usock1 = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let usock2 = await new UnetSocket(gwOpts[1].hostname, gwOpts[1].port);
    expect(usock2.bind(Protocol.USER)).toBeTrue();
    usock2.setTimeout(1000);

    usock1.connect(31, Protocol.USER);
    expect(await usock1.send([1,2,3])).toBeTrue();                     // Connected to correct protocol, can send without specifying target/protocol
    let ntf = await usock2.receive();
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([1,2,3]);
    expect(await usock1.send([1,2,3], 31, 0)).toBeTrue();               // Can override protocol and send to target,
    expect(await usock2.receive()).toBeUndefined();                     // ... but won't receive since not sent to correct protocol
    expect(await usock1.send([4,5,6], 27, Protocol.USER)).toBeTrue();   // Can send to correct protocol but wrong target,
    expect(await usock2.receive()).toBeUndefined();                     // ... and won't receive since not sent to correct target
    expect(await usock1.send([7,8,9])).toBeTrue();                      // Can send without specifying target/protocol since connected to correct protocol
    ntf = await usock2.receive();                                       // Will receive since sent to correct protocol and target
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([7,8,9]);

    usock1.close();
    usock2.close();
  });

  it('should be able to communicate - 3', async function(){
    let usock1 = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    let usock2 = await new UnetSocket(gwOpts[1].hostname, gwOpts[1].port);
    expect(usock2.bind(Protocol.USER)).toBeTrue();
    usock2.setTimeout(1000);
    usock1.connect(31, Protocol.USER);

    usock1.disconnect();
    expect(await usock1.send([1,2,3])).toBeFalse();                     // Disconnected, can't send without specifying target/protocol
    expect(await usock1.send([4,5,6], 31, Protocol.USER)).toBeTrue();   // Can send to correct protocol and target by specifying them, even if disconnected
    let ntf = await usock2.receive();                                   // ... and will receive since sent to correct protocol and target
    expect(ntf).toBeInstanceOf(DatagramNtf);
    expect(ntf.data).toEqual([4,5,6]);

    usock1.close();
    usock2.close();
  });

  it('should be able track the changes to local node address', async function(){
    let usock = await new UnetSocket(gwOpts[0].hostname, gwOpts[0].port);
    expect(usock._localAddress).toBe(232);

    // now change the local node address and check if the change is reflected in the UnetSocket
    const nodeinfo = await usock.getGateway().agentForService(Services.NODE_INFO);
    await nodeinfo.set('address', 123);
    await delay(300);
    expect(usock._localAddress).toBe(123);
    await nodeinfo.set('address', 232);
    await delay(300);
    expect(usock._localAddress).toBe(232);

    usock.close();
  });
});

describe('Unet Utils', function () {
  function coordTester(res, val) {
    const tolerance = 0.000100;
    const min = res - tolerance;
    const max = parseFloat(res) + tolerance;
    return (val >= min && val <=max);
  }

  beforeEach(function() {
    jasmine.addCustomEqualityTester(coordTester);
  });

  it('should be able to convert local coordinates to GPS coordinates', function () {
    const origin=[1.34286,103.84109];
    let x=100, y=100;
    let loc = toGps(origin,x,y);
    expect(loc.length).toBe(2);
    expect(loc[0]).toBeInstanceOf(Number);
    expect(loc[1]).toBeInstanceOf(Number);
    expect(loc[0]).toEqual(1.343764);
    expect(loc[1]).toEqual(103.841988);

    x=0, y=14.5;
    loc = toGps(origin,x,y);
    expect(loc.length).toBe(2);
    expect(loc[0]).toBeInstanceOf(Number);
    expect(loc[1]).toBeInstanceOf(Number);
    expect(loc[0]).toEqual(1.342991);
    expect(loc[1]).toEqual(103.84109);
  });

  it('should be able to convert GPS coordinates to local coordinates', function () {
    const origin=[1.34286,103.84109];
    let lat=1.343764, lon=103.841988;
    let loc = toLocal(origin,lat,lon);
    expect(loc.length).toBe(2);
    expect(loc[0]).toBeInstanceOf(Number);
    expect(loc[1]).toBeInstanceOf(Number);
    expect(loc[0]).toEqual(99.937602);
    expect(loc[1]).toEqual(99.959693);

    lat=1.342991, lon=103.84109;
    loc = toLocal(origin,lat,lon);
    expect(loc.length).toBe(2);
    expect(loc[0]).toBeInstanceOf(Number);
    expect(loc[1]).toBeInstanceOf(Number);
    expect(loc[0]).toEqual(0);
    expect(loc[1]).toEqual(14.485309);
  });

});