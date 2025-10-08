# unetsocket.py

This python package `unetpy` provides UnetSocket APIs to interact with any modems running UnetStack. The `unetpy` package is built upon [fjagepy](https://github.com/org-arl/fjage/tree/master/gateways/python). This package allows the developers and users to interact with the modem using an interface implementd in python. All the requests made to the modem are using JSON messages. The relevant JSON messages are constructed and sent over TCP. The UnetStack server running on the modem understands these messages, takes corresponding actions and returns the notifications and/or responses back in the form of JSON messages which are parsed by `unetpy`.

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

This uses the modern `pyproject.toml`-based build powered by [Hatch](https://hatch.pypa.io/).

## Usage

Import the high-level API just like before:

```python
from unetpy import UnetSocket, Protocol
```

All `fjagepy` primitives continue to be re-exported, so legacy examples using
`from unetpy import *` keep working too.

## Command-line utilities

Two small helper CLIs are available once the package is installed:

- `unetpy-rx` — receive datagrams over a UnetSocket
- `unetpy-tx` — transmit datagrams over a UnetSocket

The historical `rxdata.py` and `txdata.py` scripts are still present as thin shims that
delegate to these console entry points.

## Examples

- [python-gateway-tutorial.ipynb](python-gateway-tutorial.ipynb)
- [rxdata](rxdata.py)
- [txdata](txdata.py)
