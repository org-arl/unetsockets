"""Python interface to UnetStack modems."""

import fjagepy
from fjagepy import *

from .constants import Address, Protocol, ReservationStatus, Services, Topics
from . import messages
from .messages import *
from .socket import UnetSocket
from .unetutils import to_gps, to_local


# Build __all__ dynamically from fjagepy, messages, and unetpy exports
__all__ = (
    list(getattr(fjagepy, "__all__", []))
    + list(getattr(messages, "__all__", []))
    + [
        "UnetSocket",
        "to_gps",
        "to_local",
        "Services",
        "Topics",
        "Protocol",
        "ReservationStatus",
        "Address",
    ]
)
