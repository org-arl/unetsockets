# API Reference

This section provides detailed documentation for all public classes and functions in `unetpy`.

> **Note:** This documentation is auto-generated from source code docstrings.
> To regenerate, run: `python docs/generate_api_docs.py`

## Core Classes

### [UnetSocket](unetsocket.md)

The main high-level interface for communicating with UnetStack nodes. Provides a socket-like API for sending and receiving datagrams.

```python
from unetpy import UnetSocket

with UnetSocket("localhost", 1100) as sock:
    sock.bind(Protocol.USER)
    sock.send([1, 2, 3], to=31, protocol=Protocol.USER)
```

## Constants

### [Protocol](constants.md#protocol)

Protocol number assignments for different types of communication.

```python
from unetpy import Protocol

Protocol.DATA  # User application data (0)
Protocol.USER  # User protocols start here (32)
Protocol.MAX   # Maximum protocol number (63)
```

### [Services](constants.md#services)

Service identifiers for looking up agents.

```python
from unetpy import Services

Services.PHYSICAL        # Physical layer service
Services.DATAGRAM        # Datagram service
Services.NODE_INFO       # Node information service
```

### [Address](constants.md#address)

Address constants.

```python
from unetpy import Address

Address.BROADCAST  # Broadcast address (0)
```

## Messages

### [Message Classes](messages.md)

All UnetStack message classes can be imported directly.

```python
from unetpy import DatagramReq, DatagramNtf

req = DatagramReq()
req.to = 31
req.data = [1, 2, 3]
```

### [Common Messages](messages.md#common-messages)

- `DatagramReq` - Request to send a datagram
- `DatagramNtf` - Notification of received datagram
- `RxFrameNtf` - Physical layer frame received
- `TxFrameReq` - Request to transmit a frame

## Utilities

### [to_gps](utilities.md#to_gps)

Convert local coordinates to GPS coordinates.

```python
from unetpy import to_gps

lat, lon = to_gps(origin=(1.34, 103.84), x=100, y=100)
```

### [to_local](utilities.md#to_local)

Convert GPS coordinates to local coordinates.

```python
from unetpy import to_local

x, y = to_local(origin=(1.34, 103.84), lat=1.35, lon=103.85)
```

## Re-exported from fjagepy

The following classes are re-exported from `fjagepy` for convenience:

- `Gateway` - Low-level connection to fjåge container
- `AgentID` - Reference to an agent
- `Message` - Base message class
- `MessageClass` - Factory for creating message types
- `Performative` - Message performatives (AGREE, REFUSE, etc.)
