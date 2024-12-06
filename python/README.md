# unetsocket.py

This python package `unetpy` provides UnetSocket APIs to interact with any modems running UnetStack. The `unetpy` package is built upon [fjagepy](https://github.com/org-arl/fjage/tree/master/gateways/python). This package allows the developers and users to interact with the modem using an interface implementd in python. All the requests made to the modem are using JSON messages. The relevant JSON messages are constructed and sent over TCP. The UnetStack server running on the modem understands these messages, takes corresponding actions and returns the notifications and/or responses back in the form of JSON messages which are parsed by `unetpy`.

## Installation::

```bash
pip install unetpy
```

## Usage

To import all general modules::

```python
from unetpy import *
```

## Examples

- [python-gateway-tutorial.ipynb](python-gateway-tutorial.ipynb)
- [rxdata](rxdata.py)
- [txdata](txdata.py)
