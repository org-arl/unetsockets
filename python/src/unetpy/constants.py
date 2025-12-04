"""Constants and enumerations used by the Unet Python gateway.

This module defines protocol numbers, service identifiers, and other
constants used throughout UnetStack communication.

Example:
    >>> from unetpy import Protocol, Services
    >>> sock.bind(Protocol.USER)
    >>> phy = sock.agentForService(Services.PHYSICAL)
"""

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
    """Service identifiers for looking up agents.

    Agents can be looked up based on the services they provide. This class
    extends the base fjåge Services with UnetStack-specific service identifiers.

    Attributes:
        NODE_INFO: Node information service - provides node address and name.
        ADDRESS_RESOLUTION: Address resolution service - resolves node names.
        DATAGRAM: Datagram service - handles datagram transmission.
        PHYSICAL: Physical layer service - low-level frame transmission.
        RANGING: Ranging/localization service - distance measurements.
        BASEBAND: Baseband signal service - raw signal access.
        LINK: Link layer service - reliable point-to-point links.
        MAC: MAC protocol service - medium access control.
        ROUTING: Routing service - multi-hop routing.
        ROUTE_MAINTENANCE: Route maintenance service.
        TRANSPORT: Transport layer service - reliable transport.
        REMOTE: Remote access service - remote command execution.
        STATE_MANAGER: State management service.
        DEVICE_INFO: Device information service.
        DOA: Direction of arrival service.
        SCHEDULER: Sleep scheduler service.
        SHELL: Shell service (inherited from fjåge).

    Example:
        >>> phy = sock.agentForService(Services.PHYSICAL)
        >>> print(phy.MTU)
        >>> shell = gw.agentForService(Services.SHELL)
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
    SCHEDULER = "org.arl.unet.Services.SCHEDULER"


class Topics:
    """Topics for pub/sub notifications.

    These topics can be subscribed to for receiving notifications about
    various system events.

    Attributes:
        PARAMCHANGE: Topic for parameter change notifications.
        LIFECYCLE: Topic for abnormal agent termination notifications.

    Example:
        >>> gw.subscribe(gw.topic(Topics.PARAMCHANGE))
    """

    PARAMCHANGE = "org.arl.unet.Topics.PARAMCHANGE"
    LIFECYCLE = "org.arl.unet.Topics.LIFECYCLE"


class Protocol:
    """Well-known protocol number assignments.

    Protocol numbers identify the type of data in a datagram. Numbers 1-31
    are reserved for UnetStack internal use. User applications should use
    Protocol.DATA (0) or Protocol.USER (32) through Protocol.MAX (63).

    Attributes:
        DATA: User application data (0).
        RANGING: Reserved for ranging agents (1).
        LINK: Reserved for link agents (2).
        REMOTE: Reserved for remote management agents (3).
        MAC: Reserved for MAC protocol agents (4).
        ROUTING: Reserved for routing agents (5).
        TRANSPORT: Reserved for transport agents (6).
        ROUTE_MAINTENANCE: Reserved for route maintenance agents (7).
        LINK2: Reserved for secondary link agents (8).
        USER: Lowest protocol number for user protocols (32).
        MAX: Maximum protocol number (63).

    Example:
        >>> sock.bind(Protocol.USER)
        >>> sock.send(data, to=31, protocol=Protocol.USER)
        >>> # Custom user protocol
        >>> MY_PROTOCOL = Protocol.USER + 5  # = 37
    """

    DATA = 0
    RANGING = 1
    LINK = 2
    REMOTE = 3
    MAC = 4
    ROUTING = 5
    TRANSPORT = 6
    ROUTE_MAINTENANCE = 7
    LINK2 = 8
    USER = 32
    MAX = 63


class ReservationStatus:
    """Status indicators for MAC channel reservation.

    These values indicate the status of a channel reservation request
    during the MAC reservation process.

    Attributes:
        START: Start of channel reservation.
        END: End of channel reservation.
        FAILURE: Failed to reserve channel.
        CANCEL: Reservation cancelled.
        REQUEST: Request for information from client agent.
    """

    START = 0
    END = 1
    FAILURE = 2
    CANCEL = 3
    REQUEST = 4


class Address:
    """Special address constants.

    Attributes:
        BROADCAST: Broadcast address (0) - sends to all nodes.

    Example:
        >>> sock.send(data, to=Address.BROADCAST, protocol=Protocol.USER)
    """

    BROADCAST = 0
