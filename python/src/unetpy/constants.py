"""Constants and enumerations used by the Unet Python gateway."""

from __future__ import annotations

from fjagepy import Services as _Services

__all__ = [
    "Services",
    "Topics",
    "Protocol",
    "ReservationStatus",
    "Address",
]


class Services(_Services):
    """Services provided by agents.

    Agents can be looked up based on the services they provide.
    """

    NODE_INFO = "org.arl.unet.Services.NODE_INFO"
    ADDRESS_RESOLUTION = "org.arl.unet.Services.ADDRESS_RESOLUTION"
    DATAGRAM = "org.arl.unet.Services.DATAGRAM"
    PHYSICAL = "org.arl.unet.Services.PHYSICAL"
    RANGING = "org.arl.unet.Services.RANGING"
    BASEBAND = "org.arl.unet.Services.BASEBAND"
    LINK = "org.arl.unet.Services.LINK"
    MAC = "org.arl.unet.Services.MAC"
    ROUTING = "org.arl.unet.Services.ROUTING"
    ROUTE_MAINTENANCE = "org.arl.unet.Services.ROUTE_MAINTENANCE"
    TRANSPORT = "org.arl.unet.Services.TRANSPORT"
    REMOTE = "org.arl.unet.Services.REMOTE"
    STATE_MANAGER = "org.arl.unet.Services.STATE_MANAGER"
    DEVICE_INFO = "org.arl.unet.Services.DEVICE_INFO"
    DOA = "org.arl.unet.Services.DOA"


class Topics:
    """Topics that can be subscribed to."""

    PARAMCHANGE = "org.arl.unet.Topics.PARAMCHANGE"  # Topic for parameter change notification.
    LIFECYCLE = "org.arl.unet.Topics.LIFECYCLE"  # Topic for abnormal agent termination.


class Protocol:
    """Well-known protocol number assignments."""

    DATA = 0  # Protocol number for user application data.
    RANGING = 1  # Protocol number for use by ranging agents.
    LINK = 2  # Protocol number for use by link agents.
    REMOTE = 3  # Protocol number for use by remote management agents.
    MAC = 4  # Protocol number for use by MAC protocol agents.
    ROUTING = 5  # Protocol number for use by routing agents.
    TRANSPORT = 6  # Protocol number for use by transport agents.
    ROUTE_MAINTENANCE = 7  # Protocol number for use by route maintenance agents.
    LINK2 = 8  # Protocol number for use by secondary link agents.
    USER = 32  # Lowest protocol number allowable for user protocols.
    MAX = 63  # Largest protocol number allowable.


class ReservationStatus:
    """Status indicator for a particular request during the reservation process."""

    START = 0  # Start of channel reservation for a reservation request.
    END = 1  # End of channel reservation for a reservation request.
    FAILURE = 2  # Failure to reserve channel for a reservation request.
    CANCEL = 3  # Cancel channel reservation for a reservation request.
    REQUEST = 4  # Request information from a client agent for a reservation request.


class Address:
    """Defined constants for addressing."""

    BROADCAST = 0  # Broadcast address.
