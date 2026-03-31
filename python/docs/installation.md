# Installation

## Requirements

- Python 3.9 or higher
- fjagepy >= 2.0.0

## From PyPI

The simplest way to install `unetpy` is via pip:

```bash
pip install unetpy
```

## From Source

Clone the repository and install in editable mode:

```bash
git clone https://github.com/org-arl/unetsockets.git
cd unetsockets/python
pip install -e .
```

### Development Installation

To install with development dependencies (pytest):

```bash
pip install -e ".[dev]"
```

## Verifying Installation

```python
import unetpy
print("unetpy imported successfully")
```

## Connecting to UnetStack

After installation, you can connect to a running UnetStack node:

```python
from unetpy import UnetSocket

# Connect to a local simulator
sock = UnetSocket("localhost", 1100)
print(f"Connected to node at address: {sock.getLocalAddress()}")
sock.close()
```

For the simulator to be available, you need to have UnetStack running. See the [UnetStack documentation](https://unetstack.net/) for setup instructions.
