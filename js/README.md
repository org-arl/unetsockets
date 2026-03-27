# JavaScript Helper Library for UnetStack

The JavaScript Helper Library for UnetStack is a JavaScript library that enables controlling of a UnetStack Node from JavaScript, both Browser-based (over WebSockets) and Node.JS (TCP).

The library contains helper methods, commonly used [Messages](https://fjage.readthedocs.io/en/latest/messages.html) and [Services](https://fjage.readthedocs.io/en/latest/services.html) in Unet, and an implementation of the [UnetSocket API](https://unetstack.net/handbook/unet-handbook_unetsocket_api.html), which is a high-level [Socket-like](https://en.wikipedia.org/wiki/Network_socket) API for communicating over an Unet.

## Installation

```sh
$ pnpm install unetjs
...
```

## Documentation

The API documentation of the latest version of unet.js is published at [https://github.com/org-arl/unetsockets/tree/master/js/docs](https://github.com/org-arl/unetsockets/tree/master/js/docs)

## Versions

### unetjs v4.0.0

unetjs v4.0.0 picks up the breaking change in fjage.js v2.0.0. It enables automatic registration of subscriptions with the master container using `WANTS_MESSAGES_FOR` action. This is done everytime a fjage.js client subscribes to a topic. A change in fjåge to support a non-aggregating `WebSocketConnector` enabled this performance in fjage.js. So **unetjs v4.0.0 is only compatible with fjage.js v2.0.0 and above**.

## Usage

### Pre-defined Messages and Services

This library provides 2 major components, the pre-defined `Message` and `Service` dictionaries, and the `UnetSocket` implementation.

The pre-defined `Message` and `Service` dictionaries are a convenient way to define commonly used Messages and Services in your code.

```js
// Instead of writing this,

import {MessageClass, Gateway} from 'unetjs'
let gw = new Gateway({...});
const DatagramReq = MessageClass('org.arl.unet.DatagramReq');
let req = new DatagramReq();
...
req.recipient = await gw.agentForService('org.arl.unet.Services.DATAGRAM')
let rsp = await gw.send(req);
...

// you can write this
import {UnetMessages, Gateway} from 'unetjs'
let gw = new Gateway({...});
let req = new UnetMessages.DatagramReq();
...
req.recipient = await gw.agentForService(Services.DATAGRAM)
let rsp = await gw.send(req);
```

The pre-defined `Message` also follows the class hierarchy that is implemented in UnetStack, so syntax like `instanceof` will yield the same results as in UnetStack.

```js
// RxFrameNtf is a subclass of DatagramNtf
let rxNtf = new UnetMessages.RxFrameNtf();

rxNtf instanceof UnetMessages.DatagramReq; // returns true;
```

### UnetSocket

The UnetSocket API is a high-level API exposed by UnetStack to allow users to communicate over an Unet. It is a socket-style API, which allows a user to send [Datagrams](https://unetstack.net/handbook/unet-handbook_datagram_service.html) to specific nodes, or as a broadcast, and similarly listen to Datagrams from specific nodes, etc. A detailed explanation of UnetSocket API can be found in the [Unet Handbook](https://unetstack.net/handbook/unet-handbook_unetsocket_api.html)

The JavaScript version of the UnetSocket API allows a user to connect to a node in an Unet from a browser/Node.JS-based application and communicate with other nodes in the Unet. The Datagrams received on those nodes could be consumed by other instances of the UnetSocket, either directly on the node, or on a remote [Gateway](https://fjage.readthedocs.io/en/latest/remote.html#interacting-with-agents-using-a-gateway) connected to that node.

Socket-level transmission metadata can be configured once and applied to subsequent sends using methods such as `setTTL()`, `setPriority()`, `setReliability()`, `setRoute()`, `setMimeType()`, `setRemoteRecipient()`, `setMailbox()`, and `setMessageClass()`. A specific service provider may also be forced with `setServiceProvider()`.

`send()` now supports three send modes via `setSendMode()`:

- `UnetSocket.NON_BLOCKING`: returns `true` once the request has been accepted for sending.
- `UnetSocket.SEMI_BLOCKING` (default): waits for an `AGREE`, and if reliability is enabled, also waits for a delivery/success notification.
- `UnetSocket.BLOCKING`: waits for an `AGREE` followed by a transmission, delivery, or failure notification.

Passing a `DatagramReq` directly to `send()` is still supported for compatibility, but it is deprecated. Prefer setting socket defaults and calling `send(data, to, protocol)` instead.

### Importing/Modules

A distribution-ready bundle is available for types of module systems commonly used in the JS world. Examples of how to use it for the different module systems are available in the [examples](/examples) directory.

At runtime, fjage.js (the underlying library used to connect to an Unet node) will check its context (browser or Node.js) and accordingly use the appropriate `Connector` (WebSocket or TCP) for connecting to the Unet node.

Here are some code snippets of how you can start using unet.js in the various module systems.

### [CommonJS](dist/cjs)

```js
const { Performative, AgentID, Message, Gateway, MessageClass } = require('unetjs');
const shell = new AgentID('shell');
const gw = new Gateway({
    hostname: 'localhost',
    port : '5081',
});
```

### [ECMAScript modules](dist/esm)

```js
import { Performative, AgentID, Message, Gateway, MessageClass } from 'unetjs'
const shell = new AgentID('shell');
const gw = new Gateway({
    hostname: 'localhost',
    port : '5081',
});
```

### [UMD](dist)

```js
<script src="unet.min.js"></script>
<script>
    const shell = new fjage.AgentID('shell');
    const gw = new fjage.Gateway({
        hostname: 'localhost',
        port : '8080',
        pathname: '/ws/'
    });
</script>
```
