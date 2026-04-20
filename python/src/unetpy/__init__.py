"""Python interface to UnetStack modems."""

import fjagepy
from fjagepy import *
from . import constants, messages


# Build __all__ dynamically from fjagepy, messages, and unetpy exports
__all__ = (
    list(getattr(fjagepy, "__all__", []))
    + list(getattr(messages, "__all__", []))
    + list(getattr(constants, "__all__", []))
)
