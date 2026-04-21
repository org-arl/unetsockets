"""Python interface to UnetStack modems."""

import fjagepy
from fjagepy import *
from . import constants, messages, socket, unetutils
from .constants import *
from .messages import *
from .socket import *
from .unetutils import *


# Re-export fjagepy, UnetStack messages/constants, socket wrapper, and utilities.
__all__ = list(dict.fromkeys(
    list(getattr(fjagepy, "__all__", []))
    + list(getattr(messages, "__all__", []))
    + list(getattr(constants, "__all__", []))
    + list(getattr(socket, "__all__", []))
    + list(getattr(unetutils, "__all__", []))
))
