"""Constants and enumerations used by the Unet Python gateway.

This module defines protocol numbers, service identifiers, and other
constants used throughout UnetStack communication.

Example:
    >>> from unetpy import Protocol, Services
    >>> sock.bind(Protocol.USER)
    >>> phy = sock.agentForService(Services.PHYSICAL)
"""

from __future__ import annotations

from enum import Enum

from fjagepy import Services as _Services

__all__ = [
    "Services",
    "Topics",
    "Protocol",
    "ReservationStatus",
    "Address",
    "Priority",
    "Robustness",
    "RouteInfo"
]


class Services(_Services):
    """Service identifiers for looking up agents.

    Agents can be looked up based on the services they provide. This class
    extends the base fjåge Services with UnetStack-specific service identifiers.

    Example:
        >>> phy = sock.agentForService(Services.PHYSICAL)
        >>> print(phy.MTU)
        >>> shell = gw.agentForService(Services.SHELL)
    """

    NODE_INFO = "org.arl.unet.Services.NODE_INFO"
    """Node information service - provides node address and name."""

    ADDRESS_RESOLUTION = "org.arl.unet.Services.ADDRESS_RESOLUTION"
    """Address resolution service - resolves node names."""

    DATAGRAM = "org.arl.unet.Services.DATAGRAM"
    """Datagram service - handles datagram transmission."""

    PHYSICAL = "org.arl.unet.Services.PHYSICAL"
    """Physical layer service - low-level frame transmission."""

    RANGING = "org.arl.unet.Services.RANGING"
    """Ranging/localization service - distance measurements."""

    BASEBAND = "org.arl.unet.Services.BASEBAND"
    """Baseband signal service - raw signal access."""

    LINK = "org.arl.unet.Services.LINK"
    """Link layer service - reliable point-to-point links."""

    MAC = "org.arl.unet.Services.MAC"
    """MAC protocol service - medium access control."""

    ROUTING = "org.arl.unet.Services.ROUTING"
    """Routing service - multi-hop routing."""

    ROUTE_MAINTENANCE = "org.arl.unet.Services.ROUTE_MAINTENANCE"
    """Route maintenance service."""

    TRANSPORT = "org.arl.unet.Services.TRANSPORT"
    """Transport layer service - reliable transport."""

    REMOTE = "org.arl.unet.Services.REMOTE"
    """Remote access service - remote command execution."""

    STATE_MANAGER = "org.arl.unet.Services.STATE_MANAGER"
    """State management service."""

    DEVICE_INFO = "org.arl.unet.Services.DEVICE_INFO"
    """Device information service."""

    DOA = "org.arl.unet.Services.DOA"
    """Direction of arrival service."""

    SCHEDULER = "org.arl.unet.Services.SCHEDULER"
    """Sleep scheduler service."""


class Topics:
    """Topics for pub/sub notifications.

    These topics can be subscribed to for receiving notifications about
    various system events.

    Example:
        >>> gw.subscribe(gw.topic(Topics.PARAMCHANGE))
    """

    PARAMCHANGE = "org.arl.unet.Topics.PARAMCHANGE"
    """Topic for parameter change notifications."""

    LIFECYCLE = "org.arl.unet.Topics.LIFECYCLE"
    """Topic for abnormal agent termination notifications."""

    DATAGRAM = "org.arl.unet.Topics.DATAGRAM"
    """Topic for incoming datagram notification."""


class Protocol:
    """Well-known protocol number assignments.

    Protocol numbers identify the type of data in a datagram. Numbers 1-31
    are reserved for UnetStack internal use. User applications should use
    Protocol.DATA (0) or Protocol.USER (32) through Protocol.MAX (63).
    """

    DATA = 0
    """User application data (0)."""

    RANGING = 1
    """Reserved for ranging agents (1)."""

    LINK = 2
    """Reserved for link agents (2)."""

    REMOTE = 3
    """Reserved for remote management agents (3)."""

    MAC = 4
    """Reserved for MAC protocol agents (4)."""

    ROUTING = 5
    """Reserved for routing agents (5)."""

    TRANSPORT = 6
    """Reserved for transport agents (6)."""

    ROUTE_MAINTENANCE = 7
    """Reserved for route maintenance agents (7)."""

    LINK2 = 8
    """Reserved for secondary link agents (8)."""

    USER = 32
    """Lowest protocol number for user protocols (32)."""

    MAX = 63
    """Maximum protocol number (63)."""


class ReservationStatus(str, Enum):
    """Status indicators for MAC channel reservation.

    These values indicate the status of a channel reservation request
    during the MAC reservation process.
    """

    START = "START"
    """Start of channel reservation."""

    END = "END"
    """End of channel reservation."""

    FAILURE = "FAILURE"
    """Failed to reserve channel."""

    CANCEL = "CANCEL"
    """Reservation cancelled."""

    REQUEST = "REQUEST"
    """Request for information from client agent."""


class Address:
    """Special address constants.

    Example:
        >>> sock.send(data, to=Address.BROADCAST, protocol=Protocol.USER)
    """

    BROADCAST = 0
    """Broadcast address (0) - sends to all nodes in the network."""


class Priority(str, Enum):
    """Priority levels for message delivery.

    These priority levels determine the quality of service for message
    delivery in the UnetStack network.
    """

    URGENT = "URGENT"
    """Urgent priority. Deliver as soon as possible, taking priority over all other traffic, even if that leads to starvation of other traffic."""

    HIGH = "HIGH"
    """High priority. Deliver at better QoS than NORMAL, but avoiding starvation of other traffic when possible."""

    NORMAL = "NORMAL"
    """Normal priority. Deliver at better QoS than LOW, but avoiding starvation of other traffic when possible."""

    LOW = "LOW"
    """Low priority. Deliver at lower QoS than NORMAL, but still avoiding being completely starved by NORMAL or HIGH priority traffic."""

    IDLE = "IDLE"
    """Idle priority. Deliver only when there is no other traffic."""


class Robustness(str, Enum):
    """Robustness of transmission.

    """

    ROBUST = "ROBUST"
    """Robust delivery. Attempt to delivery Datagram with higher probability of success, potentially take longer"""

    NORMAL = "NORMAL"
    """Normal delivery. Attempt to deliver Datagram with normal probability of success and time."""

class RouteInfo:
    """Route information for routing agents."""

    class Operation(str, Enum):
        """Route operation types."""

        CREATE = "CREATE"
        """Create a new route."""

        CHANGE = "CHANGE"
        """Change an existing route."""

        DELETE = "DELETE"
        """Delete an existing route."""