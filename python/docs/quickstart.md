# Quick Start

This guide will help you get started with `unetpy` in minutes.

## Prerequisites

1. Install `unetpy`: `pip install unetpy`
2. Have a UnetStack simulator or modem running

## Connecting to a Node

```python
from unetpy import UnetSocket

# Create a socket connection to a UnetStack node
sock = UnetSocket("localhost", 1100)

# Get the local node address
print(f"Local address: {sock.getLocalAddress()}")

# Always close when done
sock.close()
```

### Using Context Managers

The recommended way is to use a context manager for automatic cleanup:

```python
from unetpy import UnetSocket

with UnetSocket("localhost", 1100) as sock:
    print(f"Local address: {sock.getLocalAddress()}")
# Socket is automatically closed here
```

## Sending Data

### Simple Send

```python
from unetpy import UnetSocket, Protocol

with UnetSocket("localhost", 1100) as sock:
    # Send to node 31 using USER protocol
    success = sock.send([1, 2, 3], to=31, protocol=Protocol.USER)
    print(f"Send {'succeeded' if success else 'failed'}")
```

### Using Connect for Default Destination

```python
from unetpy import UnetSocket, Protocol

with UnetSocket("localhost", 1100) as sock:
    # Set default destination
    sock.connect(31, Protocol.USER)

    # Now send without specifying destination
    sock.send([1, 2, 3])
    sock.send([4, 5, 6])
    sock.send([7, 8, 9])
```

## Receiving Data

### Blocking Receive

```python
from unetpy import UnetSocket, Protocol, DatagramNtf

with UnetSocket("localhost", 1100) as sock:
    # Bind to receive on USER protocol
    sock.bind(Protocol.USER)

    # Set timeout (in milliseconds)
    sock.setTimeout(5000)

    # Wait for datagram
    ntf = sock.receive()
    if isinstance(ntf, DatagramNtf):
        print(f"Received from {ntf.from_}: {ntf.data}")
    else:
        print("Timeout - no datagram received")
```

### Non-blocking Receive

```python
from unetpy import UnetSocket, Protocol

with UnetSocket("localhost", 1100) as sock:
    sock.bind(Protocol.USER)
    sock.setTimeout(0)  # Non-blocking

    ntf = sock.receive()
    if ntf is None:
        print("No datagram available")
```

## Two-Way Communication

Here's a complete example with two nodes:

```python
from unetpy import UnetSocket, Protocol, DatagramNtf
import threading

def receiver():
    with UnetSocket("localhost", 1102) as sock:
        sock.bind(Protocol.USER)
        sock.setTimeout(5000)
        ntf = sock.receive()
        if isinstance(ntf, DatagramNtf):
            print(f"Node B received: {ntf.data}")

def sender():
    with UnetSocket("localhost", 1101) as sock:
        sock.send([1, 2, 3], to=31, protocol=Protocol.USER)
        print("Node A sent data")

# Start receiver in background
recv_thread = threading.Thread(target=receiver)
recv_thread.start()

# Send data
sender()

# Wait for receiver
recv_thread.join()
```

## Low-Level Access

For advanced use cases, you can access the underlying fjåge Gateway:

```python
from unetpy import UnetSocket, Services

with UnetSocket("localhost", 1100) as sock:
    gw = sock.getGateway()

    # Get agents
    phy = gw.agentForService(Services.PHYSICAL)
    print(f"PHY agent: {phy.name}")
    print(f"MTU: {phy.MTU}")

    # Get node info
    node = sock.agent("node")
    print(f"Node name: {node.nodeName}")
    print(f"Node address: {node.address}")
```

## Resolving Node Names

```python
from unetpy import UnetSocket

with UnetSocket("localhost", 1100) as sock:
    # Resolve node name to address
    addr_a = sock.host("A")
    addr_b = sock.host("B")
    print(f"Node A address: {addr_a}")
    print(f"Node B address: {addr_b}")
```

## Coordinate Conversions

Convert between local (meters) and GPS coordinates:

```python
from unetpy import to_gps, to_local

# Define origin point (latitude, longitude)
origin = (1.34286, 103.84109)

# Convert local coordinates to GPS
x, y = 100.0, 100.0  # meters from origin
lat, lon = to_gps(origin, x, y)
print(f"GPS: {lat}, {lon}")

# Convert GPS back to local
x_back, y_back = to_local(origin, lat, lon)
print(f"Local: {x_back}, {y_back}")
```

## Logging and Debugging

This library uses the standard [Python logging](https://docs.python.org/3/library/logging.html) system.

By default, the library does not emit logs to the console.

To see logs, configure Python’s logging in your application:

```python
import logging

# Show all logs on stdout
logging.basicConfig(level=logging.DEBUG)

# Or, enable only logs from this library
logging.getLogger("fjagepy").setLevel(logging.DEBUG)
```

For troubleshooting, you can also send logs to a file:
```python
logging.basicConfig(filename="debug.log", level=logging.DEBUG)
```

## Next Steps

- See the [API Reference](api/index.md) for detailed documentation
- Check out [UnetSocket](api/unetsocket.md) for all available methods
- Learn about [Protocol](api/constants.md) numbers and [Services](api/constants.md)
