"""Python interface to UnetStack modems."""

from __future__ import annotations

import fjagepy as _fjagepy
from fjagepy import *  # noqa: F401,F403

from .__about__ import __version__
from .constants import Address, Protocol, ReservationStatus, Services, Topics
from .constants import __all__ as _constants_all
from .messages import *  # noqa: F401,F403
from .messages import __all__ as _messages_all
from .socket import UnetSocket
from .socket import __all__ as _socket_all

_fjage_all = getattr(
    _fjagepy,
    "__all__",
    [name for name in dir(_fjagepy) if not name.startswith("_")],
)

__all__ = list(
    dict.fromkeys(
        list(_fjage_all)
        + list(_messages_all)
        + list(_constants_all)
        + list(_socket_all)
        + ["__version__"],
    )
)
