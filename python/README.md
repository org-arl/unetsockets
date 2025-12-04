# unetpy

`unetpy` is the modern Python wrapper for [fjagepy](https://github.com/org-arl/fjage/tree/master/gateways/python). It exposes the low-level fjåge primitives alongside a batteries-included `UnetSocket`, Unet-specific message classes, and coordinate utilities.

## Installation

### From PyPI

```bash
pip install unetpy
```

### From source

Clone the repository and install it in editable mode:

```bash
pip install -e .[dev]
```

This uses the `pyproject.toml`-based build powered by the standard [setuptools](https://setuptools.pypa.io/) backend.

## Usage

Import the high-level API just like in `unet.js`:

```python
from unetpy import (
    Gateway,
    AgentID,
    Performative,
    Message,
    MessageClass,
    UnetSocket,
    Protocol,
    Services,
    to_gps,
    to_local,
)
```

- All fjåge primitives continue to be available, so legacy `from unetpy import *` snippets keep working.
- Pre-defined message classes (`DatagramReq`, `DatagramNtf`, etc.) can be imported directly.
- `to_gps()`/`to_local()` replicate the helper coordinate math from `unet.js`.

### Pre-defined Messages and Services

Message classes mirror the UnetStack class hierarchy, so inheritance behaves exactly like it does on the modem. That means helper checks such as `isinstance(rx, DatagramNtf)` succeed even when `rx` is an `RxFrameNtf`. You can construct requests without manually calling `MessageClass`:

```python
from unetpy import Gateway, Services, DatagramReq

gw = Gateway("localhost", 1100)
req = DatagramReq()
req.to = 31
req.protocol = 0
req.data = [1, 2, 3]
req.recipient = gw.agentForService(Services.DATAGRAM)
gw.send(req)
```

### Working with `UnetSocket`

`UnetSocket` mirrors the JS implementation from `unet.js`, handling subscriptions, default addresses, and blocking receives on top of fjåge’s gateway:

```python
from unetpy import Protocol, Services, DatagramNtf, UnetSocket

with UnetSocket("localhost", 1101) as sock:
    sock.bind(Protocol.USER)
    sock.connect(31, Protocol.USER)
    sock.send([0x01, 0x02, 0x03])

    sock.setTimeout(2000)
    ntf = sock.receive()
    if isinstance(ntf, DatagramNtf):
        print(f"Got datagram from {ntf.from_}: {ntf.data}")

    # Drop down to fjåge when you need shell access or raw agents
    gw = sock.getGateway()
    shell = gw.agentForService(Services.SHELL)
    print(shell.language)
```

### Coordinate helpers

The coordinate math matches what `unet.js` exposes through `toGps()`/`toLocal()`, so you can use the same mission-planning tutorials in Python:

```python
from unetpy import to_gps, to_local

origin = (1.25, 103.88)  # latitude, longitude
lat, lon = to_gps(origin, x=120.0, y=-45.0)
print(lat, lon)
print(to_local(origin, lat, lon))
```

## Development

Run the unit tests with:

```bash
pytest
```