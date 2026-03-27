# UnetSocket

The `UnetSocket` class provides a high-level socket-like interface for
communicating with UnetStack nodes.

## Import

```python
from unetpy import UnetSocket
```

## Class Documentation

High-level socket interface for UnetStack communication.

UnetSocket provides a socket-like API for sending and receiving datagrams
through UnetStack nodes. It handles subscriptions, default addresses, and
blocking receives on top of fjåge's Gateway.


**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `gw (Gateway)` | Underlying fjåge Gateway instance. |
| `localProtocol (int)` | Bound protocol number (-1 if unbound). |
| `remoteAddress (int)` | Default destination address (-1 if not connected). |
| `remoteProtocol (int)` | Default protocol for sending. |
| `timeout (int)` | Receive timeout in milliseconds. |

**Example:**

```python
    Basic usage with context manager::

        from unetpy import UnetSocket, Protocol

        with UnetSocket("localhost", 1100) as sock:
            sock.bind(Protocol.USER)
            sock.send([1, 2, 3], to=31, protocol=Protocol.USER)

            sock.setTimeout(5000)
            ntf = sock.receive()
            if ntf:
                print(f"Received: {ntf.data}")
```

---

## Constructor

```python
UnetSocket(hostname: 'str', port: 'int' = 1100) -> 'None'
```

Create a new UnetSocket connected to the specified host.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `hostname` | Hostname or IP address of the UnetStack node. |
| `port` | TCP port number (default: 1100). |

**Example:**

```python
    >>> sock = UnetSocket("localhost", 1100)
    >>> sock.getLocalAddress()
    232
    >>> sock.close()
```

---

## Methods

### agent()

```python
agent(name: 'str') -> 'Optional[AgentID]'
```

Get an agent by name.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `name` | Agent name. |

**Returns:**

    AgentID if found, None otherwise. 

**Example:**

```python
    >>> node = sock.agent("node")
    >>> print(f"Address: {node.address}, Name: {node.nodeName}")
```

---

### agentForService()

```python
agentForService(svc) -> 'Optional[AgentID]'
```

Get an agent providing the specified service.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `svc` | Service identifier (from Services class). |

**Returns:**

    AgentID if found, None otherwise. 

**Example:**

```python
    >>> phy = sock.agentForService(Services.PHYSICAL)
    >>> print(phy.MTU)
```

---

### agentsForService()

```python
agentsForService(svc) -> 'Optional[Iterable[AgentID]]'
```

Get all agents providing the specified service.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `svc` | Service identifier (from Services class). |

**Returns:**

    List of AgentID instances, or None if socket is closed.

---

### bind()

```python
bind(protocol: 'int') -> 'bool'
```

Bind the socket to listen for a specific protocol.

Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved
and cannot be bound. Unbound sockets listen to all unreserved protocols.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `protocol` | Protocol number to listen for. Use Protocol.DATA (0) or |

**Returns:**

    True on success, False if the protocol number is reserved. 

**Example:**

```python
    >>> sock.bind(Protocol.USER)
    True
    >>> sock.isBound()
    True
    >>> sock.getLocalProtocol()
    32
```

---

### close()

```python
close() -> 'None'
```

Close the socket and release all resources.

After calling close(), the socket cannot be used for communication.
All subsequent operations will fail or return None/-1.


**Example:**

```python
    >>> sock = UnetSocket("localhost", 1100)
    >>> sock.isClosed()
    False
    >>> sock.close()
    >>> sock.isClosed()
    True
```

---

### connect()

```python
connect(to: 'int', protocol: 'int' = 0) -> 'bool'
```

Set the default destination address and protocol for sending.

The defaults can be overridden for specific send() calls. Protocol numbers
between Protocol.DATA+1 to Protocol.USER-1 are reserved and cannot be used.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `to` | Default destination node address. |
| `protocol` | Default protocol number (default: Protocol.DATA). |

**Returns:**

    True on success, False if the address or protocol is invalid. 

**Example:**

```python
    >>> sock.connect(31, Protocol.USER)
    True
    >>> sock.send([1, 2, 3])  # Sends to node 31 with USER protocol
    True
```

---

### disconnect()

```python
disconnect() -> 'None'
```

Reset the default destination address and protocol.

After disconnecting, send() calls require explicit destination addresses.
The default protocol is reset to Protocol.DATA.


**Example:**

```python
    >>> sock.connect(31, Protocol.USER)
    >>> sock.disconnect()
    >>> sock.isConnected()
    False
```

---

### getGateway()

```python
getGateway() -> 'Optional[Gateway]'
```

Get the underlying fjåge Gateway for low-level access.


**Returns:**

    The Gateway instance, or None if socket is closed. 

**Example:**

```python
    >>> gw = sock.getGateway()
    >>> shell = gw.agentForService(Services.SHELL)
```

---

### getLocalAddress()

```python
getLocalAddress() -> 'int'
```

Get the local node address.


**Returns:**

    Local node address, or -1 on error. 

**Example:**

```python
    >>> sock.getLocalAddress()
    232
```

---

### getLocalProtocol()

```python
getLocalProtocol() -> 'int'
```

Get the protocol number that the socket is bound to.


**Returns:**

    Protocol number if socket is bound, -1 otherwise.

---

### getMailbox()

```python
getMailbox() -> 'Optional[str]'
```

Get the mailbox for outgoing remote messages.


**Returns:**

    Mailbox name, or None if not set.

---

### getMessageClass()

```python
getMessageClass() -> 'Optional[str]'
```

Get the message class for outgoing datagrams.


**Returns:**

    Message class string, or None if not set.

---

### getMimeType()

```python
getMimeType() -> 'Optional[str]'
```

Get the MIME type for outgoing datagrams.


**Returns:**

    MIME type string, or None if not set.

---

### getPriority()

```python
getPriority() -> 'int'
```

Get the priority level for outgoing datagrams.


**Returns:**

    Priority level.

---

### getReliability()

```python
getReliability() -> 'Optional[bool]'
```

Get the reliability setting for outgoing datagrams.


**Returns:**

    True if reliable, False if unreliable, None if not set.

---

### getRemoteAddress()

```python
getRemoteAddress() -> 'int'
```

Get the default destination node address.


**Returns:**

    Default destination address if connected, -1 otherwise.

---

### getRemoteProtocol()

```python
getRemoteProtocol() -> 'int'
```

Get the default transmission protocol number.


**Returns:**

    Default protocol number used to transmit datagrams.

---

### getRemoteRecipient()

```python
getRemoteRecipient() -> 'Optional[str]'
```

Get the remote recipient for outgoing datagrams.


**Returns:**

    Remote recipient string, or None if not set.

---

### getRobustness()

```python
getRobustness() -> 'int'
```

Get the robustness level for outgoing datagrams.


**Returns:**

    Robustness level.

---

### getRoute()

```python
getRoute() -> 'Optional[str]'
```

Get the route for outgoing datagrams.


**Returns:**

    Route string, or None if not set.

---

### getSendMode()

```python
getSendMode() -> 'int'
```

Get the send mode for datagram transmission.


**Returns:**

    Send mode. -2 = semi-blocking, 0 = non-blocking, -1 = blocking.  NON_BLOCKING sends the request without waiting for an AGREE. SEMI_BLOCKING waits for an AGREE, and if reliability is True also waits for a remote delivery/failure notification. BLOCKING waits for an AGREE followed by a completion notification.

---

### getServiceProvider()

```python
getServiceProvider() -> 'Optional[AgentID]'
```

Get the explicitly selected datagram service provider.


**Returns:**

    Selected service provider, or None if not set.  If no provider is set, UnetSocket selects one automatically when sending. RemoteMessageReq traffic prefers Services.REMOTE when available. Plain datagrams use the normal transport/routing/link/physical/datagram stack.

---

### getTTL()

```python
getTTL() -> 'float'
```

Alias for getTtl().

---

### getTimeout()

```python
getTimeout() -> 'int'
```

Gets the timeout for datagram reception.


**Returns:**

    Timeout in milliseconds. 0 = non-blocking, -1 = blocking.

---

### getTtl()

```python
getTtl() -> 'float'
```

Get the Time-To-Live (TTL) for outgoing datagrams.


**Returns:**

    TTL value, or NaN if not set.

---

### host()

```python
host(nodeName: 'str') -> 'Optional[int]'
```

Resolve a node name to its address.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `nodeName` | Name of the node to resolve. |

**Returns:**

    Node address as integer, or None if unable to resolve. 

**Example:**

```python
    >>> sock.host("A")
    232
    >>> sock.host("B")
    31
```

---

### isBound()

```python
isBound() -> 'bool'
```

Check if the socket is bound to a protocol.


**Returns:**

    True if bound to a specific protocol, False otherwise.

---

### isClosed()

```python
isClosed() -> 'bool'
```

Check if the socket is closed.


**Returns:**

    True if the socket has been closed, False otherwise.

---

### isConnected()

```python
isConnected() -> 'bool'
```

Check if a default destination is set.


**Returns:**

    True if connected (default destination set), False otherwise.

---

### onParamChange()

```python
onParamChange(agentId: 'Union[AgentID, str]', paramName: 'str', callback: 'Callable[[ParamChangeNtf], None]') -> 'None'
```

Register a callback for parameter change notifications from a specific agent.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `agentId` | AgentID or name of the agent to monitor. |
| `paramName` | Name of the parameter to watch for changes. |
| `callback` | Function to call with the ParamChangeNtf when the parameter changes. |

**Example:**

```python
    >>> def on_address_change(ntf):
    ...     print(f"Address changed: {ntf.paramValues['address']}")
    ...
    >>> sock.onParamChange("node", "address", on_address_change)
```

---

### receive()

```python
receive(timeout: 'Optional[int]' = None) -> 'Optional[DatagramNtf]'
```

Receive a datagram sent to the local node.

If the socket is bound, only receives datagrams matching the bound protocol.
If unbound, receives datagrams with all unreserved protocols.
Broadcast datagrams are always received.

This call blocks until a datagram is available, the socket timeout is reached.
There is currently no way to cancel a blocking receive.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `timeout` | Override timeout in milliseconds. Uses socket timeout if None. |

**Returns:**

    DatagramNtf or RxFrameNtf on success, None on timeout or if closed. 

**Example:**

```python
    >>> sock.bind(Protocol.USER)
    >>> sock.setTimeout(5000)
    >>> ntf = sock.receive()
    >>> if ntf:
    ...     print(f"From: {ntf.from_}, Data: {ntf.data}")
```

---

### removeParamChangeCallback()

```python
removeParamChangeCallback(agentId: 'Union[AgentID, str]', paramName: 'str') -> 'None'
```

Remove a previously registered parameter change callback.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `agentId` | AgentID or name of the agent. |
| `paramName` | Name of the parameter. |

**Example:**

```python
    >>> sock.removeParamChangeCallback("node", "address")
```

---

### send()

```python
send(data: 'Union[bytes, bytearray, Sequence[int], Message, str]', to: 'Optional[int]' = None, protocol: 'Optional[int]' = None) -> 'bool'
```

Transmit a datagram to the specified destination.

Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved
and cannot be used for sending. Socket-level metadata such as MIME type,
message class, remote recipient, and mailbox automatically promote the
outgoing request to a RemoteMessageReq.

If no service provider is set explicitly, plain datagrams are routed using
the normal UnetStack stack in order of preference: TRANSPORT, ROUTING,
LINK, PHYSICAL, DATAGRAM. RemoteMessageReq traffic prefers REMOTE when
available.

Send behavior depends on sendMode. NON_BLOCKING returns after handing the
request to the gateway. SEMI_BLOCKING waits for AGREE, and if reliability
is True also waits for a remote delivery/failure notification. BLOCKING
waits for AGREE and then for a transmission or delivery/failure notification.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `data` | Data to transmit. Can be bytes, bytearray, list of integers, |
| `to` | Destination node address. Uses default if not specified. |
| `protocol` | Protocol number. Uses default if not specified. |

**Returns:**

    True on success, False on failure. 

**Example:**

```python
    >>> sock.send([1, 2, 3], to=31, protocol=Protocol.USER)
    True
    >>> sock.send(b'\x01\x02\x03', to=31, protocol=Protocol.USER)
    True
    >>> sock.send("Hello", to=31, protocol=Protocol.USER)
    True
```

---

### setMailbox()

```python
setMailbox(mailbox: 'Optional[str]') -> 'None'
```

Set the mailbox for outgoing remote messages.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `mailbox` | Mailbox name, or None to unset. |

---

### setMessageClass()

```python
setMessageClass(messageClass: 'Optional[str]') -> 'None'
```

Set the message class for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `messageClass` | Message class string, or None to unset. |

---

### setMimeType()

```python
setMimeType(mimeType: 'Optional[str]') -> 'None'
```

Set the MIME type for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `mimeType` | MIME type string, or None to unset. |

---

### setPriority()

```python
setPriority(priority: 'int') -> 'None'
```

Set the priority level for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `priority` | Priority level. |

**Example:**

```python
    >>> sock.setPriority(Priority.HIGH)
```

---

### setReliability()

```python
setReliability(reliable: 'Optional[bool]') -> 'None'
```

Set the reliability for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `reliable` | True for reliable, False for unreliable, None to unset. |

---

### setRemoteRecipient()

```python
setRemoteRecipient(remoteRecipient: 'Optional[str]') -> 'None'
```

Set the remote recipient for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `remoteRecipient` | Remote recipient string, or None to unset. |

---

### setRobustness()

```python
setRobustness(robustness: 'int') -> 'None'
```

Set the robustness level for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `robustness` | Robustness level. |

**Example:**

```python
    >>> sock.setRobustness(Robustness.ROBUST)
```

---

### setRoute()

```python
setRoute(route: 'Optional[str]') -> 'None'
```

Set the route for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `route` | Route string, or None to unset. |

---

### setSendMode()

```python
setSendMode(mode: 'int') -> 'None'
```

Set the send mode for datagram transmission. NON_BLOCKING mode makes a
request to send data, but does not wait for acceptance or transmission.
SEMI_BLOCKING mode waits until the data is accepted for transmission, but
does not wait for actual transmission for unreliable sockets. If reliability
is True, SEMI_BLOCKING waits for a remote delivery/failure notification.
BLOCKING mode waits for request acceptance followed by a transmission or
delivery/failure notification.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `mode` | Send mode. -2 = semi-blocking, 0 = non-blocking, -1 = blocking. |

---

### setServiceProvider()

```python
setServiceProvider(provider: 'Optional[AgentID]') -> 'None'
```

Set the datagram service provider to use for future sends.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `provider` | Provider agent, or None to restore automatic selection. |

---

### setTTL()

```python
setTTL(ttl: 'float') -> 'None'
```

Alias for setTtl().

---

### setTimeout()

```python
setTimeout(ms: 'int') -> 'None'
```

Set the receive timeout.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `ms` | Timeout in milliseconds. 0 = non-blocking, -1 = blocking. |

---

### setTtl()

```python
setTtl(ttl: 'float') -> 'None'
```

Set the Time-To-Live (TTL) for outgoing datagrams.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `ttl` | TTL value. Use NaN to unset. |

---

### unbind()

```python
unbind() -> 'None'
```

Unbind the socket to listen to all unreserved protocols.

After unbinding, the socket will receive datagrams on all protocols
except reserved ones (Protocol.DATA+1 to Protocol.USER-1).


**Example:**

```python
    >>> sock.bind(Protocol.USER)
    >>> sock.unbind()
    >>> sock.isBound()
    False
```

---
