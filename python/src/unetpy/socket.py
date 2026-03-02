"""High-level UnetSocket wrapper built on fjagepy."""

from __future__ import annotations

import logging
from typing import Iterable, Optional, Sequence, Union, Callable

from fjagepy import AgentID, Gateway, Message, Performative
from .constants import Protocol, Services, Topics, Address
from .messages import AddressResolutionReq, DatagramNtf, DatagramReq

__all__ = ["UnetSocket"]

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

class UnetSocket:
    """High-level socket interface for UnetStack communication.

    UnetSocket provides a socket-like API for sending and receiving datagrams
    through UnetStack nodes. It handles subscriptions, default addresses, and
    blocking receives on top of fjåge's Gateway.

    Attributes:
        gw (Gateway): Underlying fjåge Gateway instance.
        localProtocol (int): Bound protocol number (-1 if unbound).
        remoteAddress (int): Default destination address (-1 if not connected).
        remoteProtocol (int): Default protocol for sending.
        timeout (int): Receive timeout in milliseconds.

    Example:
        Basic usage with context manager::

            from unetpy import UnetSocket, Protocol

            with UnetSocket("localhost", 1100) as sock:
                sock.bind(Protocol.USER)
                sock.send([1, 2, 3], to=31, protocol=Protocol.USER)

                sock.setTimeout(5000)
                ntf = sock.receive()
                if ntf:
                    print(f"Received: {ntf.data}")
    """

    REQUEST_TIMEOUT = 1000

    def __init__(
        self,
        hostname: str,
        port: int = 1100
    ) -> None:
        """Create a new UnetSocket connected to the specified host.

        Args:
            hostname: Hostname or IP address of the UnetStack node.
            port: TCP port number (default: 1100).

        Example:
            >>> sock = UnetSocket("localhost", 1100)
            >>> sock.getLocalAddress()
            232
            >>> sock.close()
        """
        self.gw = Gateway(hostname, port)
        self.localProtocol = -1
        self.remoteAddress = -1
        self.remoteProtocol = Protocol.DATA
        self.timeout = Gateway.BLOCKING
        self.provider: Optional[AgentID] = None
        self._subscribe_datagrams()

    def __enter__(self) -> "UnetSocket":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def _subscribe_datagrams(self) -> None:
        if self.gw is None:
            return
        # for new UnetStack versions (6.0.0 and later)
        self.gw.subscribe(self.gw.topic(Topics.DATAGRAM))
        # for compatibility with older UnetStack versions (before 5.2.0)
        agents: Iterable[AgentID] = self.gw.agentsForService(Services.DATAGRAM) or []
        for agent in agents:
            self.gw.subscribe(self.gw.topic(agent))

    def close(self) -> None:
        """Close the socket and release all resources.

        After calling close(), the socket cannot be used for communication.
        All subsequent operations will fail or return None/-1.

        Example:
            >>> sock = UnetSocket("localhost", 1100)
            >>> sock.isClosed()
            False
            >>> sock.close()
            >>> sock.isClosed()
            True
        """

        if self.gw is None:
            return
        self.gw.close()
        self.gw = None

    def isClosed(self) -> bool:
        """Check if the socket is closed.

        Returns:
            True if the socket has been closed, False otherwise.
        """
        return self.gw is None

    def bind(self, protocol: int) -> bool:
        """Bind the socket to listen for a specific protocol.

        Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved
        and cannot be bound. Unbound sockets listen to all unreserved protocols.

        Args:
            protocol: Protocol number to listen for. Use Protocol.DATA (0) or
                Protocol.USER (32) through Protocol.MAX (63).

        Returns:
            True on success, False if the protocol number is reserved.

        Example:
            >>> sock.bind(Protocol.USER)
            True
            >>> sock.isBound()
            True
            >>> sock.getLocalProtocol()
            32
        """

        if protocol == Protocol.DATA or (Protocol.USER <= protocol <= Protocol.MAX):
            self.localProtocol = protocol
            return True
        logger.error(f"Invalid protocol number {protocol} for binding")
        return False

    def unbind(self) -> None:
        """Unbind the socket to listen to all unreserved protocols.

        After unbinding, the socket will receive datagrams on all protocols
        except reserved ones (Protocol.DATA+1 to Protocol.USER-1).

        Example:
            >>> sock.bind(Protocol.USER)
            >>> sock.unbind()
            >>> sock.isBound()
            False
        """

        self.localProtocol = -1

    def isBound(self) -> bool:
        """Check if the socket is bound to a protocol.

        Returns:
            True if bound to a specific protocol, False otherwise.
        """
        return self.localProtocol >= 0

    def connect(self, to: int, protocol: int = Protocol.DATA) -> bool:
        """Set the default destination address and protocol for sending.

        The defaults can be overridden for specific send() calls. Protocol numbers
        between Protocol.DATA+1 to Protocol.USER-1 are reserved and cannot be used.

        Args:
            to: Default destination node address.
            protocol: Default protocol number (default: Protocol.DATA).

        Returns:
            True on success, False if the address or protocol is invalid.

        Example:
            >>> sock.connect(31, Protocol.USER)
            True
            >>> sock.send([1, 2, 3])  # Sends to node 31 with USER protocol
            True
        """

        if to >= 0 and (
            protocol == Protocol.DATA or (Protocol.USER <= protocol <= Protocol.MAX)
        ):
            self.remoteAddress = to
            self.remoteProtocol = protocol
            return True
        logger.error(f"Invalid address {to} or protocol number {protocol} for connecting")
        return False

    def disconnect(self) -> None:
        """Reset the default destination address and protocol.

        After disconnecting, send() calls require explicit destination addresses.
        The default protocol is reset to Protocol.DATA.

        Example:
            >>> sock.connect(31, Protocol.USER)
            >>> sock.disconnect()
            >>> sock.isConnected()
            False
        """

        self.remoteAddress = -1
        self.remoteProtocol = 0

    def isConnected(self) -> bool:
        """Check if a default destination is set.

        Returns:
            True if connected (default destination set), False otherwise.
        """
        return self.remoteAddress >= 0

    def getLocalAddress(self) -> int:
        """Get the local node address.

        Returns:
            Local node address, or -1 on error.

        Example:
            >>> sock.getLocalAddress()
            232
        """

        if self.gw is None:
            return -1
        nodeinfo = self.gw.agentForService(Services.NODE_INFO)
        if nodeinfo is None:
            logger.error("No NODE_INFO service provider found.")
            return -1
        if nodeinfo.address is not None:
            return nodeinfo.address
        logger.error("Unable to retrieve local node address.")
        return -1

    def getLocalProtocol(self) -> int:
        """Get the protocol number that the socket is bound to.

        Returns:
            Protocol number if socket is bound, -1 otherwise.
        """

        return self.localProtocol

    def getRemoteAddress(self) -> int:
        """Get the default destination node address.

        Returns:
            Default destination address if connected, -1 otherwise.
        """

        return self.remoteAddress

    def getRemoteProtocol(self) -> int:
        """Get the default transmission protocol number.

        Returns:
            Default protocol number used to transmit datagrams.
        """

        return self.remoteProtocol

    def setTimeout(self, ms: int) -> None:
        """Set the receive timeout.

        Args:
            ms: Timeout in milliseconds. 0 = non-blocking, -1 = blocking.
        """
        if ms < 0:
            ms = Gateway.BLOCKING
        self.timeout = ms

    def getTimeout(self) -> int:
        """Get the current receive timeout.

        Returns:
            Timeout in milliseconds.
        """
        return self.timeout

    def send(
        self,
        data: Union[bytes, bytearray, Sequence[int], Message, str],
        to: Optional[int] = None,
        protocol: Optional[int] = None,
    ) -> bool:
        """Transmit a datagram to the specified destination.

        Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved
        and cannot be used for sending.

        Args:
            data: Data to transmit. Can be bytes, bytearray, list of integers,
                a string (encoded as UTF-8), or a DatagramReq message.
            to: Destination node address. Uses default if not specified.
            protocol: Protocol number. Uses default if not specified.

        Returns:
            True on success, False on failure.

        Example:
            >>> sock.send([1, 2, 3], to=31, protocol=Protocol.USER)
            True
            >>> sock.send(b'\\x01\\x02\\x03', to=31, protocol=Protocol.USER)
            True
            >>> sock.send("Hello", to=31, protocol=Protocol.USER)
            True
        """

        if self.gw is None:
            return False

        req = self._build_datagram_request(data, to, protocol)
        if req is None:
            return False

        if req.recipient is None:
            provider = self._resolve_provider()
            if provider is None:
                logger.error("No datagram service provider found. Not sending datagram.")
                return False
            logger.debug(f"Using {provider} as datagram service provider.")
            req.recipient = provider

        rsp = self.gw.request(req, self.REQUEST_TIMEOUT)
        return rsp is not None and rsp.perf == Performative.AGREE

    def receive(self, timeout: Optional[int] = None) -> Optional[DatagramNtf]:
        """Receive a datagram sent to the local node.

        If the socket is bound, only receives datagrams matching the bound protocol.
        If unbound, receives datagrams with all unreserved protocols.
        Broadcast datagrams are always received.

        This call blocks until a datagram is available, the socket timeout is reached.
        There is currently no way to cancel a blocking receive.

        Args:
            timeout: Override timeout in milliseconds. Uses socket timeout if None.

        Returns:
            DatagramNtf or RxFrameNtf on success, None on timeout or if closed.

        Example:
            >>> sock.bind(Protocol.USER)
            >>> sock.setTimeout(5000)
            >>> ntf = sock.receive()
            >>> if ntf:
            ...     print(f"From: {ntf.from_}, Data: {ntf.data}")
        """

        if self.gw is None:
            return None

        def _createMatcher(localAddress, localProtocol) -> Callable[[Message], bool]:
            def _matches(ntf) -> bool:
                if ntf is None or not isinstance(ntf, DatagramNtf):
                    return False
                to = getattr(ntf, "to", -1)
                if to != localAddress and to != Address.BROADCAST:
                    return False
                proto = getattr(ntf, "protocol", Protocol.DATA)
                logger.debug(f"Checking if received datagram [{ntf} protocol={proto}] matches")
                if proto != Protocol.DATA and proto < Protocol.USER:
                    return False
                return localProtocol < 0 or localProtocol == proto
            return _matches

        effective_timeout = self._effective_timeout(timeout)
        logger.debug(f"Trying to receive datagram for up to {effective_timeout} ms")
        try:
            localAddress = self.getLocalAddress()
            return self.gw.receive(_createMatcher(localAddress, self.localProtocol), effective_timeout)
        except Exception as e:
            logger.error(f"Failed to receive datagram", exc_info=True)

    def getGateway(self) -> Optional[Gateway]:
        """Get the underlying fjåge Gateway for low-level access.

        Returns:
            The Gateway instance, or None if socket is closed.

        Example:
            >>> gw = sock.getGateway()
            >>> shell = gw.agentForService(Services.SHELL)
        """

        return self.gw

    def agentForService(self, svc) -> Optional[AgentID]:
        """Get an agent providing the specified service.

        Args:
            svc: Service identifier (from Services class).

        Returns:
            AgentID if found, None otherwise.

        Example:
            >>> phy = sock.agentForService(Services.PHYSICAL)
            >>> print(phy.MTU)
        """

        if self.gw is None:
            return None
        return self.gw.agentForService(svc)

    def agentsForService(self, svc) -> Optional[Iterable[AgentID]]:
        """Get all agents providing the specified service.

        Args:
            svc: Service identifier (from Services class).

        Returns:
            List of AgentID instances, or None if socket is closed.
        """

        if self.gw is None:
            return None
        return self.gw.agentsForService(svc)

    def agent(self, name: str) -> Optional[AgentID]:
        """Get an agent by name.

        Args:
            name: Agent name.

        Returns:
            AgentID if found, None otherwise.

        Example:
            >>> node = sock.agent("node")
            >>> print(f"Address: {node.address}, Name: {node.nodeName}")
        """

        if self.gw is None:
            return None
        return self.gw.agent(name)

    def host(self, nodeName: str) -> Optional[int]:
        """Resolve a node name to its address.

        Args:
            nodeName: Name of the node to resolve.

        Returns:
            Node address as integer, or None if unable to resolve.

        Example:
            >>> sock.host("A")
            232
            >>> sock.host("B")
            31
        """

        arp = self.agentForService(Services.ADDRESS_RESOLUTION)
        if arp is None:
            logger.error("No ADDRESS_RESOLUTION service provider found.")
            return None
        req = AddressResolutionReq()
        req.name = nodeName
        req.recipient = arp
        rsp = self.gw.request(req, self.REQUEST_TIMEOUT)
        if rsp is None:
            logger.error(f"Address resolution request timed out for node '{nodeName}'")
            return None
        return rsp.address

## Internal helper methods

    def _build_datagram_request(
        self,
        data: Union[bytes, bytearray, Sequence[int], Message, str],
        to: Optional[int],
        protocol: Optional[int],
    ) -> Optional[DatagramReq]:
        if isinstance(data, Message):
            if not isinstance(data, DatagramReq):
                logger.error("Message provided is not a DatagramReq")
                return None
            req = data
            payload = getattr(req, "data", None)
            if isinstance(payload, (bytes, bytearray)):
                req.data = list(payload)
            elif isinstance(payload, str):
                req.data = list(payload.encode("utf-8"))
        else:
            req = DatagramReq()
            req.data = self._normalize_payload(data)
            destination = to if to is not None else self.remoteAddress
            proto = protocol if protocol is not None else self.remoteProtocol
            if destination < 0:
                logger.error("No destination address specified for sending datagram")
                return None
            req.to = destination
            req.protocol = proto
        if req.protocol != Protocol.DATA and (
            req.protocol < Protocol.USER or req.protocol > Protocol.MAX
        ):
            logger.error(f"Invalid protocol number {req.protocol} for sending datagram")
            return None
        logger.debug(f"Built [{req} protocol={req.protocol}, to={req.to}, data=({len(req.data)} bytes)] for sending")
        return req

    def _normalize_payload(
        self,
        data: Union[bytes, bytearray, Sequence[int], str],
    ) -> Sequence[int]:
        if isinstance(data, str):
            return list(data.encode("utf-8"))
        if isinstance(data, (bytes, bytearray)):
            return list(data)
        return list(data)

    def _resolve_provider(self) -> Optional[AgentID]:
        if self.gw is None:
            return None
        if self.provider is not None:
            return self.provider
        for service in (
            Services.TRANSPORT,
            Services.ROUTING,
            Services.LINK,
            Services.PHYSICAL,
            Services.DATAGRAM,
        ):
            agent = self.gw.agentForService(service)
            if agent is not None:
                self.provider = agent
                break
        return self.provider

    def _effective_timeout(self, override: Optional[int]) -> int:
        if override is None:
            return self.timeout
        if override < 0:
            return Gateway.BLOCKING
        return override
