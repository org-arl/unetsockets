# unetpy Documentation

`unetpy` is the Python gateway for [UnetStack](https://unetstack.net/), providing a simple and intuitive API for communicating with underwater acoustic modems and simulators. It wraps the low-level [fjagepy](https://github.com/org-arl/fjage/tree/master/gateways/python) primitives and adds UnetStack-specific functionality.

## Table of Contents

- [Installation](installation.md)
- [Quick Start](quickstart.md)
- [API Reference](api/index.md)
  - [UnetSocket](api/unetsocket.md) - High-level socket interface
  - [Constants](api/constants.md) - Protocol numbers and service identifiers
  - [Messages](api/messages.md) - Pre-defined message classes
  - [Utilities](api/utilities.md) - Coordinate conversion functions

> **Note:** API documentation in `docs/api/` is auto-generated from source code
> docstrings. To regenerate, run: `python docs/generate_api_docs.py`

## Features

- **High-level `UnetSocket` API** - Simple socket-like interface for sending and receiving datagrams
- **Full fjåge compatibility** - All fjåge primitives are re-exported for low-level access
- **Pre-defined message classes** - All UnetStack messages available as direct imports (`DatagramReq`, `DatagramNtf`, etc.)
- **Coordinate utilities** - Convert between GPS and local coordinates
- **Context manager support** - Use `with` statements for automatic cleanup

## Basic Example

```python
from unetpy import UnetSocket, Protocol

# Connect to a UnetStack node
with UnetSocket("localhost", 1100) as sock:
    # Bind to user protocol
    sock.bind(Protocol.USER)

    # Send data to node 31
    sock.send([1, 2, 3], to=31, protocol=Protocol.USER)

    # Receive with timeout
    sock.setTimeout(5000)
    ntf = sock.receive()
    if ntf:
        print(f"Received: {ntf.data}")
```
