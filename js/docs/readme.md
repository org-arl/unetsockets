<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [UnetSocket][1]
    *   [Parameters][2]
    *   [Examples][3]
    *   [close][4]
    *   [isClosed][5]
    *   [bind][6]
        *   [Parameters][7]
    *   [unbind][8]
    *   [isBound][9]
    *   [connect][10]
        *   [Parameters][11]
    *   [disconnect][12]
    *   [isConnected][13]
    *   [getLocalAddress][14]
    *   [getLocalProtocol][15]
    *   [getRemoteAddress][16]
    *   [getRemoteProtocol][17]
    *   [setTimeout][18]
        *   [Parameters][19]
    *   [getTimeout][20]
    *   [send][21]
        *   [Parameters][22]
    *   [receive][23]
    *   [getGateway][24]
    *   [agentForService][25]
        *   [Parameters][26]
    *   [agentsForService][27]
        *   [Parameters][28]
    *   [agent][29]
        *   [Parameters][30]
    *   [host][31]
        *   [Parameters][32]
*   [Protocol][33]
*   [UnetMessages][34]
*   [toGps][35]
    *   [Parameters][36]
*   [toLocal][37]
    *   [Parameters][38]
*   [DatagramReq][39]
    *   [Properties][40]
*   [DatagramNtf][41]
    *   [Properties][42]
*   [AgentID][43]
*   [Services][44]
*   [Performative][45]
*   [MessageClass][46]
*   [CachingAgentID][47]
    *   [Parameters][48]
    *   [set][49]
        *   [Parameters][50]
    *   [get][51]
        *   [Parameters][52]
*   [agent][53]
    *   [Parameters][54]
*   [topic][55]
    *   [Parameters][56]
*   [agentForService][57]
    *   [Parameters][58]
*   [agentsForService][59]
    *   [Parameters][60]

## UnetSocket

[js/src/unetsocket.js:27-287][61]

Creates a new UnetSocket to connect to a running Unet instance. This constructor returns a
[Promise][62] instead of the constructed UnetSocket object. Use `await` or `.then()` to get
a reference to the UnetSocket object. Based on if this is run in a Browser or Node.js,
it will internally connect over WebSockets or TCP respectively.

### Parameters

*   `hostname` **[string][63]?** hostname/ip address of the master container to connect to
*   `port` **[string][63]?** port number of the master container to connect to
*   `path` **[string][63]** path of the master container to connect to (for WebSockets) (optional, default `''`)

### Examples

```javascript
let socket = await new UnetSocket('localhost', 8081, '/ws/');
```

Returns **[Promise][62]<[UnetSocket][1]>** Promise which resolves to the UnetSocket object being constructed

### close

[js/src/unetsocket.js:51-54][64]

Closes the socket. The socket functionality may not longer be accessed after this method is called.

Returns **void**&#x20;

### isClosed

[js/src/unetsocket.js:60-62][65]

Checks if a socket is closed.

Returns **[boolean][66]** true if closed, false if open

### bind

[js/src/unetsocket.js:71-77][67]

Binds a socket to listen to a specific protocol datagrams.
Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved protocols
and cannot be bound. Unbound sockets listen to all unreserved

#### Parameters

*   `protocol` **[Protocol][33]** protocol number to listen for

Returns **[boolean][66]** true on success, false on failure

### unbind

[js/src/unetsocket.js:84-84][68]

Unbinds a socket so that it listens to all unreserved protocols.
Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved.

Returns **void**&#x20;

### isBound

[js/src/unetsocket.js:90-90][69]

Checks if a socket is bound.

Returns **[boolean][66]** true if bound to a protocol, false if unbound

### connect

[js/src/unetsocket.js:104-111][70]

Sets the default destination address and destination protocol number for datagrams sent
using this socket. The defaults can be overridden for specific send() calls.
The default protcol number when a socket is opened is Protcol.DATA.
The default node address is undefined.
Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved,
and cannot be used for sending datagrams using the socket.

#### Parameters

*   `to` **[number][71]** default destination node address
*   `protocol` **[Protocol][33]** default protocol number

Returns **[boolean][66]** true on success, false on failure

### disconnect

[js/src/unetsocket.js:118-121][72]

Resets the default destination address to undefined, and the default protocol number
to Protocol.DATA.

Returns **void**&#x20;

### isConnected

[js/src/unetsocket.js:127-127][73]

Checks if a socket is connected, i.e., has a default destination address and protocol number.

Returns **[boolean][66]** true if connected, false otherwise

### getLocalAddress

[js/src/unetsocket.js:133-139][74]

Gets the local node address of the Unet node connected to.

Returns **[Promise][62]\<int>** local node address, or -1 on error

### getLocalProtocol

[js/src/unetsocket.js:145-145][75]

Gets the protocol number that the socket is bound to.

Returns **[number][71]** } - protocol number if socket is bound, -1 otherwise

### getRemoteAddress

[js/src/unetsocket.js:151-151][76]

Gets the default destination node address for a connected socket.

Returns **[number][71]** } - default destination node address if connected, -1 otherwise

### getRemoteProtocol

[js/src/unetsocket.js:157-157][77]

Gets the default transmission protocol number.

Returns **[number][71]** } - default protocol number used to transmit a datagram

### setTimeout

[js/src/unetsocket.js:167-170][78]

Sets the timeout for datagram reception. A timeout of 0 means the
[receive method][79] will check any appropriate
Datagram has already been received (and is cached) else return immediately.

#### Parameters

*   `ms` **[number][71]** timeout in milliseconds

Returns **void**&#x20;

### getTimeout

[js/src/unetsocket.js:176-176][80]

Gets the timeout for datagram reception.

Returns **[number][71]** timeout in milliseconds

### send

[js/src/unetsocket.js:187-213][81]

Transmits a datagram to the specified node address using the specified protocol.
Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are considered reserved,
and cannot be used for sending datagrams using the socket.

#### Parameters

*   `data` **([Array][82]<[number][71]> | [DatagramReq][39])** data to be sent over the socket as an Array of bytes or DatagramReq
*   `to` **[number][71]** destination node address (optional, default `this.remoteAddress`)
*   `protocol` **[number][71]** protocol number (optional, default `this.remoteProtocol`)

Returns **[Promise][62]<[boolean][66]>** true if the Unet node agreed to send out the Datagram, false otherwise

### receive

[js/src/unetsocket.js:221-231][83]

Receives a datagram sent to the local node and the bound protocol number. If the socket is unbound,
then datagrams with all unreserved protocols are received. Any broadcast datagrams are also received.

Returns **[Promise][62]<[DatagramNtf][41]?>** datagram received by the socket

### getGateway

[js/src/unetsocket.js:237-237][84]

Gets a Gateway to provide low-level access to UnetStack.

Returns **Gateway** underlying fjage Gateway supporting this socket

### agentForService

[js/src/unetsocket.js:245-248][85]

Gets an AgentID providing a specified service for low-level access to UnetStack

#### Parameters

*   `svc` **[string][63]** the named service of interest
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)

Returns **[Promise][62]<[AgentID][43]?>** a promise which returns an [AgentID][43] that provides the service when resolved

### agentsForService

[js/src/unetsocket.js:256-259][86]

#### Parameters

*   `svc` **[string][63]** the named service of interest
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)

Returns **[Promise][62]<[Array][82]<[AgentID][43]>>** a promise which returns an array of [AgentIDs][43] that provides the service when resolved

### agent

[js/src/unetsocket.js:267-270][87]

Gets a named AgentID for low-level access to UnetStack.

#### Parameters

*   `name` **[string][63]** name of agent
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)

Returns **[AgentID][43]** AgentID for the given name

### host

[js/src/unetsocket.js:277-286][88]

Resolve node name to node address.

#### Parameters

*   `nodeName` **[string][63]** name of the node to resolve

Returns **[Promise][62]<[number][71]?>** address of the node, or null if unable to resolve

## Protocol

[js/src/unetutils.js:34-46][89]

Well-known protocol number assignments used in UnetStack

Type: [Object][90]<[string][63], [number][71]>

## UnetMessages

[js/src/unetutils.js:52-148][91]

Well-known protocol Messages used in UnetStack

Type: [Object][90]<[string][63], [MessageClass][46]>

## toGps

[js/src/unetutils.js:158-164][92]

Convert coordinates from a local coordinates to GPS coordinate

### Parameters

*   `origin` **[Array][82]** Local coordinate system's origin as `[latitude, longitude]`
*   `x` **[Number][71]** X coordinate of the local coordinate to be converted
*   `y` **[Number][71]** Y coordinate of the local coordinate to be converted

Returns **[Array][82]** GPS coordinates (in decimal degrees) as `[latitude, longitude]`

## toLocal

[js/src/unetutils.js:173-179][93]

Convert coordinates from a GPS coordinates to local coordinate

### Parameters

*   `origin` **[Array][82]** Local coordinate system's origin as `[latitude, longitude]`
*   `lat` **[Number][71]** Latitude of the GPS coordinate to be converted
*   `lon` **[Number][71]** Longitude of the GPS coordinate to be converted

Returns **[Array][82]** GPS coordinates (in decimal degrees) as `[latitude, longitude]`

## DatagramReq

[js/src/unetutils.js:246-357][94]

A message which requests the transmission of the datagram from the Unet

Type: Message

### Properties

*   `data` **[Array][82]<[number][71]>** data as an Array of bytes
*   `from` **[number][71]** from/source node address
*   `to` **[number][71]** to/destination node address
*   `protocol` **[number][71]** protocol number to be used to send this Datagram
*   `reliability` **[boolean][66]** true if Datagram should be reliable, false if unreliable
*   `ttl` **[number][71]** time-to-live for the datagram. Time-to-live is advisory, and an agent may choose it ignore it

## DatagramNtf

[js/src/unetutils.js:246-357][95]

Notification of received datagram message received by the Unet node.

Type: Message

### Properties

*   `data` **[Array][82]<[number][71]>** data as an Array of bytes
*   `from` **[number][71]** from/source node address
*   `to` **[number][71]** to/destination node address
*   `protocol` **[number][71]** protocol number to be used to send this Datagram
*   `ttl` **[number][71]** time-to-live for the datagram. Time-to-live is advisory, and an agent may choose it ignore it

## AgentID

[js/src/unetutils.js:246-357][96]

*   **See**: [fjåge.js Documentation][97]

An identifier for an agent or a topic.

## Services

[js/src/unetutils.js:246-357][96]

*   **See**: [fjåge.js Documentation][97]

Services supported by fjage agents.

## Performative

[js/src/unetutils.js:246-357][96]

*   **See**: [fjåge.js Documentation][97]

An action represented by a message.

## MessageClass

[js/src/unetutils.js:246-357][96]

*   **See**: [fjåge.js Documentation][97]

Function to creates a unqualified message class based on a fully qualified name.

## CachingAgentID

[js/src/unetutils.js:246-357][96]

**Extends AgentID**

A caching CachingAgentID which caches Agent parameters locally.

### Parameters

*   `name` **([string][63] | [AgentID][43])** name of the agent or an AgentID to copy
*   `topic` **[boolean][66]** name of topic
*   `owner` **Gateway** Gateway owner for this AgentID
*   `greedy` **[Boolean][66]** greedily fetches and caches all parameters if this Agent (optional, default `true`)

### set

[js/src/unetutils.js:268-272][98]

Sets parameter(s) on the Agent referred to by this AgentID, and caches the parameter(s).

#### Parameters

*   `params` **([string][63] | [Array][82]<[string][63]>)** parameters name(s) to be set
*   `values` **([Object][90] | [Array][82]<[Object][90]>)** parameters value(s) to be set
*   `index` **[number][71]** index of parameter(s) to be set (optional, default `-1`)
*   `timeout` **[number][71]** timeout for the response (optional, default `5000`)

Returns **[Promise][62]<([Object][90] | [Array][82]<[Object][90]>)>** a promise which returns the new value(s) of the parameters

### get

[js/src/unetutils.js:283-306][99]

Gets parameter(s) on the Agent referred to by this AgentID, getting them from the cache if possible.

#### Parameters

*   `params` **([string][63] | [Array][82]<[string][63]>)** parameters name(s) to be fetched
*   `index` **[number][71]** index of parameter(s) to be fetched (optional, default `-1`)
*   `timeout` **[number][71]** timeout for the response (optional, default `5000`)
*   `maxage` **[number][71]** maximum age of the cached result to retreive (optional, default `5000`)

Returns **[Promise][62]<([Object][90] | [Array][82]<[Object][90]>)>** a promise which returns the value(s) of the parameters

## agent

[js/src/unetutils.js:370-373][100]

Get an AgentID for a given agent name.

### Parameters

*   `name` **[string][63]** name of agent
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)
*   `greedy` **[Boolean][66]** greedily fetches and caches all parameters if this Agent (optional, default `true`)

Returns **([AgentID][43] | [CachingAgentID][47])** AgentID for the given name

## topic

[js/src/unetutils.js:384-387][101]

Returns an object representing the named topic.

### Parameters

*   `topic` **([string][63] | [AgentID][43])** name of the topic or AgentID
*   `topic2` **[string][63]** name of the topic if the topic param is an AgentID
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)
*   `greedy` **[Boolean][66]** greedily fetches and caches all parameters if this Agent (optional, default `true`)

Returns **([AgentID][43] | [CachingAgentID][47])** object representing the topic

## agentForService

[js/src/unetutils.js:398-402][102]

Finds an agent that provides a named service. If multiple agents are registered
to provide a given service, any of the agents' id may be returned.

### Parameters

*   `service` **[string][63]** the named service of interest
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)
*   `greedy` **[Boolean][66]** greedily fetches and caches all parameters if this Agent (optional, default `true`)

Returns **[Promise][62]<([AgentID][43]? | [CachingAgentID][47])>** a promise which returns an agent id for an agent that provides the service when resolved

## agentsForService

[js/src/unetutils.js:412-415][103]

Finds all agents that provides a named service.

### Parameters

*   `service` **[string][63]** the named service of interest
*   `caching` **[Boolean][66]** if the AgentID should cache parameters (optional, default `true`)
*   `greedy` **[Boolean][66]** greedily fetches and caches all parameters if this Agent (optional, default `true`)

Returns **[Promise][62]<([AgentID][43]? | [Array][82]<[CachingAgentID][47]>)>** a promise which returns an array of all agent ids that provides the service when resolved

[1]: #unetsocket

[2]: #parameters

[3]: #examples

[4]: #close

[5]: #isclosed

[6]: #bind

[7]: #parameters-1

[8]: #unbind

[9]: #isbound

[10]: #connect

[11]: #parameters-2

[12]: #disconnect

[13]: #isconnected

[14]: #getlocaladdress

[15]: #getlocalprotocol

[16]: #getremoteaddress

[17]: #getremoteprotocol

[18]: #settimeout

[19]: #parameters-3

[20]: #gettimeout

[21]: #send

[22]: #parameters-4

[23]: #receive

[24]: #getgateway

[25]: #agentforservice

[26]: #parameters-5

[27]: #agentsforservice

[28]: #parameters-6

[29]: #agent

[30]: #parameters-7

[31]: #host

[32]: #parameters-8

[33]: #protocol

[34]: #unetmessages

[35]: #togps

[36]: #parameters-9

[37]: #tolocal

[38]: #parameters-10

[39]: #datagramreq

[40]: #properties

[41]: #datagramntf

[42]: #properties-1

[43]: #agentid

[44]: #services

[45]: #performative

[46]: #messageclass

[47]: #cachingagentid

[48]: #parameters-11

[49]: #set

[50]: #parameters-12

[51]: #get

[52]: #parameters-13

[53]: #agent-1

[54]: #parameters-14

[55]: #topic

[56]: #parameters-15

[57]: #agentforservice-1

[58]: #parameters-16

[59]: #agentsforservice-1

[60]: #parameters-17

[61]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L27-L287 "Source code on GitHub"

[62]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[63]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[64]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L51-L54 "Source code on GitHub"

[65]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L60-L62 "Source code on GitHub"

[66]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[67]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L71-L77 "Source code on GitHub"

[68]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L84-L84 "Source code on GitHub"

[69]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L90-L90 "Source code on GitHub"

[70]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L104-L111 "Source code on GitHub"

[71]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[72]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L118-L121 "Source code on GitHub"

[73]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L127-L127 "Source code on GitHub"

[74]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L133-L139 "Source code on GitHub"

[75]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L145-L145 "Source code on GitHub"

[76]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L151-L151 "Source code on GitHub"

[77]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L157-L157 "Source code on GitHub"

[78]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L167-L170 "Source code on GitHub"

[79]: #unetsocketreceive

[80]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L176-L176 "Source code on GitHub"

[81]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L187-L213 "Source code on GitHub"

[82]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[83]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L221-L231 "Source code on GitHub"

[84]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L237-L237 "Source code on GitHub"

[85]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L245-L248 "Source code on GitHub"

[86]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L256-L259 "Source code on GitHub"

[87]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L267-L270 "Source code on GitHub"

[88]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetsocket.js#L277-L286 "Source code on GitHub"

[89]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L30-L33 "Source code on GitHub"

[90]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[91]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L48-L51 "Source code on GitHub"

[92]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L158-L164 "Source code on GitHub"

[93]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L173-L179 "Source code on GitHub"

[94]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L188-L198 "Source code on GitHub"

[95]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L200-L209 "Source code on GitHub"

[96]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L246-L357 "Source code on GitHub"

[97]: https://org-arl.github.io/fjage/jsdoc/

[98]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L268-L272 "Source code on GitHub"

[99]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L283-L306 "Source code on GitHub"

[100]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L370-L373 "Source code on GitHub"

[101]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L384-L387 "Source code on GitHub"

[102]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L398-L402 "Source code on GitHub"

[103]: https://github.com/org-arl/unetsockets/blob/f42f1a6eaaec71db9cce642347856c931ac17b70/js/src/unetutils.js#L412-L415 "Source code on GitHub"
