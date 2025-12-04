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
| `REQUEST_TIMEOUT (int)` | Default timeout for requests in milliseconds (1000). |
| `hostname (str)` | Connected hostname. |
| `port (int)` | Connected port number. |
| `gw (Gateway | None)` | Underlying fjåge Gateway instance. |
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
UnetSocket(self, hostname: 'str', port: 'int' = 1100, *, gateway_cls: 'type[Gateway]' = <class 'fjagepy.Gateway.Gateway'>) -> 'None'
```

Create a new UnetSocket connected to the specified host.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `hostname` | Hostname or IP address of the UnetStack node. |
| `port` | TCP port number (default: 1100). |
| `gateway_cls` | Gateway class to use, for testing purposes. |

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
agent(self, name: 'str')
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
agentForService(self, svc)
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
agentsForService(self, svc)
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
bind(self, protocol: 'int') -> 'bool'
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

### cancel()

```python
cancel(self) -> 'None'
```

Cancel an ongoing blocking receive() call.

This method can be called from another thread to unblock a waiting
receive() call.


**Example:**

```python
    >>> import threading
    >>> def canceller():
    ...     time.sleep(2)
    ...     sock.cancel()
    >>> thread = threading.Thread(target=canceller)
    >>> thread.start()
    >>> ntf = sock.receive()  # Will be cancelled after 2 seconds
```

---

### close()

```python
close(self) -> 'None'
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
connect(self, to: 'int', protocol: 'int' = 0) -> 'bool'
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
disconnect(self) -> 'None'
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
getGateway(self) -> 'Optional[Gateway]'
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
getLocalAddress(self) -> 'int'
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
getLocalProtocol(self) -> 'int'
```

Get the protocol number that the socket is bound to.


**Returns:**

    Protocol number if socket is bound, -1 otherwise.

---

### getRemoteAddress()

```python
getRemoteAddress(self) -> 'int'
```

Get the default destination node address.


**Returns:**

    Default destination address if connected, -1 otherwise.

---

### getRemoteProtocol()

```python
getRemoteProtocol(self) -> 'int'
```

Get the default transmission protocol number.


**Returns:**

    Default protocol number used to transmit datagrams.

---

### getTimeout()

```python
getTimeout(self) -> 'int'
```

Get the current receive timeout (legacy API).


**Returns:**

    Timeout in milliseconds.

---

### get_timeout()

```python
get_timeout(self) -> 'int'
```

Get the current receive timeout.


**Returns:**

    Timeout in milliseconds.

---

### host()

```python
host(self, nodeName: 'str')
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
isBound(self) -> 'bool'
```

Check if the socket is bound to a protocol (legacy API).


**Returns:**

    True if bound to a specific protocol, False otherwise.

---

### isClosed()

```python
isClosed(self) -> 'bool'
```

Check if the socket is closed (legacy API).


**Returns:**

    True if the socket has been closed, False otherwise.

---

### isConnected()

```python
isConnected(self) -> 'bool'
```

Check if a default destination is set (legacy API).


**Returns:**

    True if connected (default destination set), False otherwise.

---

### is_bound()

```python
is_bound(self) -> 'bool'
```

Check if the socket is bound to a protocol.


**Returns:**

    True if bound to a specific protocol, False otherwise.

---

### is_closed()

```python
is_closed(self) -> 'bool'
```

Check if the socket is closed.


**Returns:**

    True if the socket has been closed, False otherwise.

---

### is_connected()

```python
is_connected(self) -> 'bool'
```

Check if a default destination is set.


**Returns:**

    True if connected (default destination set), False otherwise.

---

### receive()

```python
receive(self, timeout: 'Optional[int]' = None)
```

Receive a datagram sent to the local node.

If the socket is bound, only receives datagrams matching the bound protocol.
If unbound, receives datagrams with all unreserved protocols.
Broadcast datagrams are always received.

This call blocks until a datagram is available, the socket timeout is reached,
or until cancel() is called.


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

### send()

```python
send(self, data: 'Union[bytes, bytearray, Sequence[int], Message, str]', to: 'Optional[int]' = None, protocol: 'Optional[int]' = None) -> 'bool'
```

Transmit a datagram to the specified destination.

Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved
and cannot be used for sending.


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

### setTimeout()

```python
setTimeout(self, ms: 'int') -> 'None'
```

Set the receive timeout (legacy API).


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `ms` | Timeout in milliseconds. Use 0 for non-blocking, |

---

### set_timeout()

```python
set_timeout(self, ms: 'int') -> 'None'
```

Set the receive timeout.


**Parameters:**

| Parameter | Description |
|-----------|-------------|
| `ms` | Timeout in milliseconds. Use 0 for non-blocking, |

**Example:**

```python
    >>> sock.set_timeout(5000)  # 5 second timeout
    >>> sock.set_timeout(0)     # Non-blocking
    >>> sock.set_timeout(-1)    # Blocking
```

---

### unbind()

```python
unbind(self) -> 'None'
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
