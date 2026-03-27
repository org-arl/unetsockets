"""High-level UnetSocket wrapper built on fjagepy."""

from __future__ import annotations

import logging
from math import isnan
from threading import Thread
from typing import Any, Iterable, Optional, Sequence, Union, Callable

from fjagepy import AgentID, Gateway, Message, Performative
from .constants import Protocol, Services, Topics, Address, Priority, Robustness
from .messages import (
    AddressResolutionReq,
    DatagramDeliveryNtf,
    DatagramFailureNtf,
    DatagramNtf,
    DatagramReq,
    RemoteFailureNtf,
    RemoteMessageReq,
    RemoteSuccessNtf,
    ParamChangeNtf,
)

__all__ = ["UnetSocket"]

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

# When used as a send mode, indicates semi-blocking send().
# Waits until the data is accepted for transmission, but does
# not wait for actual transmission for unreliable sockets.
# If the socket is reliable, waits until delivery is acknowledged
# or fails. Not a valid timeout value for receive().
Gateway.SEMI_BLOCKING = -2;

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
        self.sendMode = Gateway.SEMI_BLOCKING
        self.localProtocol = -1
        self.remoteAddress = -1
        self.remoteProtocol = Protocol.DATA
        self.timeout = Gateway.BLOCKING
        self.provider: Optional[AgentID] = None
        self.ttl = float('nan')
        self.priority = Priority.NORMAL;
        self.robustness = Robustness.NORMAL;
        self.reliability : Optional[bool] = None;
        self.route : Optional[str] = None;
        self.mimeType : Optional[str]  = None;
        self.messageClass : Optional[str]  = None;
        self.remoteRecipient : Optional[str] = None;
        self.mailbox : Optional[str] = None;
        self._param_change_callbacks: dict[str, Callable[[Any], None]] = {}
        self._subscribe_datagrams()

        nodeinfo = self.gw.agentForService(Services.NODE_INFO)

        # subscribe to paramchange notifications for onParamChange callbacks
        self.gw.subscribe(self.gw.topic(Topics.PARAMCHANGE))
        if nodeinfo is not None:
            self.gw.subscribe(self.gw.topic(nodeinfo))
        self._param_change_thread = Thread(target=self._param_change_handler, daemon=True)
        self._param_change_thread.start()

        # subscribe to paramchange for local address
        if nodeinfo.address is not None:
            self.onParamChange("node", "address", self._update_local_address)
            self.localAddress = nodeinfo.address

    def __enter__(self) -> "UnetSocket":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def _update_local_address(self, new_address: int) -> None:
        logger.debug(f"Local address changed to {new_address}")
        self.localAddress = new_address

    def _param_change_handler(self) -> None:
        while True:
            if self.gw is None:
                break
            try:
                ntf = self.gw.receive(lambda msg: isinstance(msg, ParamChangeNtf), Gateway.BLOCKING)
                logger.debug(f"Received parameter change notification: {ntf}")
                if ntf is not None and ntf.paramValues is not None:
                    sender = isinstance(ntf.sender, AgentID) and ntf.sender.get_name() or str(ntf.sender)
                    for param, value in ntf.paramValues.items():
                        pname = param.split(".")[-1] if "." in param else param
                        key = f"{sender}:{pname}"
                        callback = self._param_change_callbacks.get(key, None)
                        if callback is not None:
                            logger.debug(f"Invoking parameter change callback for {key} with value {value}")
                            callback(value)
            except Exception as e:
                logger.error("Error in parameter change listener thread", exc_info=True)
                break

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
        """Gets the timeout for datagram reception.

        Returns:
            Timeout in milliseconds. 0 = non-blocking, -1 = blocking.
        """
        return self.timeout

    def getSendMode(self) -> int:
        """Get the send mode for datagram transmission.

        Returns:
            Send mode. -2 = semi-blocking, 0 = non-blocking, -1 = blocking.

        NON_BLOCKING sends the request without waiting for an AGREE.
        SEMI_BLOCKING waits for an AGREE, and if reliability is True also waits
        for a remote delivery/failure notification. BLOCKING waits for an AGREE
        followed by a completion notification.
        """
        return self.sendMode

    def setSendMode(self, mode: int) -> None:
        """Set the send mode for datagram transmission. NON_BLOCKING mode makes a
        request to send data, but does not wait for acceptance or transmission.
        SEMI_BLOCKING mode waits until the data is accepted for transmission, but
        does not wait for actual transmission for unreliable sockets. If reliability
        is True, SEMI_BLOCKING waits for a remote delivery/failure notification.
        BLOCKING mode waits for request acceptance followed by a transmission or
        delivery/failure notification.

        Args:
            mode: Send mode. -2 = semi-blocking, 0 = non-blocking, -1 = blocking.
        """
        if mode not in (Gateway.SEMI_BLOCKING, Gateway.NON_BLOCKING, Gateway.BLOCKING):
            logger.error(
                f"Invalid send mode {mode}. Must be one of "
                f"{Gateway.SEMI_BLOCKING} (SEMI_BLOCKING), "
                f"{Gateway.NON_BLOCKING} (NON_BLOCKING), "
                f"{Gateway.BLOCKING} (BLOCKING)."
            )
            return
        self.sendMode = mode

    def getTtl(self) -> float:
        """Get the Time-To-Live (TTL) for outgoing datagrams.

        Returns:
            TTL value, or NaN if not set.
        """
        return self.ttl

    def getTTL(self) -> float:
        """Alias for getTtl()."""
        return self.getTtl()

    def setTtl(self, ttl: float) -> None:
        """Set the Time-To-Live (TTL) for outgoing datagrams.

        Args:
            ttl: TTL value. Use NaN to unset.
        """
        self.ttl = ttl

    def setTTL(self, ttl: float) -> None:
        """Alias for setTtl()."""
        self.setTtl(ttl)

    def getPriority(self) -> int:
        """Get the priority level for outgoing datagrams.

        Returns:
            Priority level.
        """
        return self.priority

    def setPriority(self, priority: int) -> None:
        """Set the priority level for outgoing datagrams.

        Args:
            priority: Priority level.

        Example:
            >>> sock.setPriority(Priority.HIGH)
        """
        if priority < Priority.URGENT or priority > Priority.IDLE:
            logger.error(f"Invalid priority level {priority}. Must be between {Priority.URGENT} and {Priority.IDLE}.")
            return
        self.priority = priority

    def getRobustness(self) -> int:
        """Get the robustness level for outgoing datagrams.

        Returns:
            Robustness level.
        """
        return self.robustness

    def setRobustness(self, robustness: int) -> None:
        """Set the robustness level for outgoing datagrams.

        Args:
            robustness: Robustness level.
        Example:
            >>> sock.setRobustness(Robustness.ROBUST)
        """
        if robustness < Robustness.ROBUST or robustness > Robustness.NORMAL:
            logger.error(
                f"Invalid robustness level {robustness}. Must be between "
                f"{Robustness.ROBUST} and {Robustness.NORMAL}."
            )
            return
        self.robustness = robustness

    def getReliability(self) -> Optional[bool]:
        """Get the reliability setting for outgoing datagrams.

        Returns:
            True if reliable, False if unreliable, None if not set.
        """
        return self.reliability

    def setReliability(self, reliable: Optional[bool]) -> None:
        """Set the reliability for outgoing datagrams.

        Args:
            reliable: True for reliable, False for unreliable, None to unset.
        """
        self.reliability = reliable

    def getRoute(self) -> Optional[str]:
        """Get the route for outgoing datagrams.

        Returns:
            Route string, or None if not set.
        """
        return self.route

    def setRoute(self, route: Optional[str]) -> None:
        """Set the route for outgoing datagrams.

        Args:
            route: Route string, or None to unset.
        """
        self.route = route

    def getMimeType(self) -> Optional[str]:
        """Get the MIME type for outgoing datagrams.

        Returns:
            MIME type string, or None if not set.
        """
        return self.mimeType

    def setMimeType(self, mimeType: Optional[str]) -> None:
        """Set the MIME type for outgoing datagrams.

        Args:
            mimeType: MIME type string, or None to unset.
        """
        self.mimeType = mimeType

    def getMessageClass(self) -> Optional[str]:
        """Get the message class for outgoing datagrams.

        Returns:
            Message class string, or None if not set.
        """
        return self.messageClass

    def setMessageClass(self, messageClass: Optional[str]) -> None:
        """Set the message class for outgoing datagrams.

        Args:
            messageClass: Message class string, or None to unset.
        """
        self.messageClass = messageClass

    def getRemoteRecipient(self) -> Optional[str]:
        """Get the remote recipient for outgoing datagrams.

        Returns:
            Remote recipient string, or None if not set.
        """
        return self.remoteRecipient

    def setRemoteRecipient(self, remoteRecipient: Optional[str]) -> None:
        """Set the remote recipient for outgoing datagrams.

        Args:
            remoteRecipient: Remote recipient string, or None to unset.
        """
        self.remoteRecipient = remoteRecipient

    def getMailbox(self) -> Optional[str]:
        """Get the mailbox for outgoing remote messages.

        Returns:
            Mailbox name, or None if not set.
        """
        return self.mailbox

    def setMailbox(self, mailbox: Optional[str]) -> None:
        """Set the mailbox for outgoing remote messages.

        Args:
            mailbox: Mailbox name, or None to unset.
        """
        self.mailbox = mailbox

    def getServiceProvider(self) -> Optional[AgentID]:
        """Get the explicitly selected datagram service provider.

        Returns:
            Selected service provider, or None if not set.

        If no provider is set, UnetSocket selects one automatically when sending.
        RemoteMessageReq traffic prefers Services.REMOTE when available. Plain
        datagrams use the normal transport/routing/link/physical/datagram stack.
        """
        return self.provider

    def setServiceProvider(self, provider: Optional[AgentID]) -> None:
        """Set the datagram service provider to use for future sends.

        Args:
            provider: Provider agent, or None to restore automatic selection.

        When provider is None, UnetSocket reverts to automatic provider selection.
        Automatic selection prefers Services.REMOTE for RemoteMessageReq traffic,
        and otherwise walks down Services.TRANSPORT, Services.ROUTING,
        Services.LINK, Services.PHYSICAL, and Services.DATAGRAM.
        """
        self.provider = provider


    def send(
        self,
        data: Union[bytes, bytearray, Sequence[int], Message, str],
        to: Optional[int] = None,
        protocol: Optional[int] = None,
    ) -> bool:
        """Transmit a datagram to the specified destination.

        Protocol numbers between Protocol.DATA+1 to Protocol.USER-1 are reserved
        and cannot be used for sending. Socket-level metadata such as MIME type,
        message class, remote recipient, and mailbox automatically promote the
        outgoing request to a RemoteMessageReq.

        If no service provider is set explicitly, plain datagrams are routed using
        the normal UnetStack stack in order of preference: TRANSPORT, ROUTING,
        LINK, PHYSICAL, DATAGRAM. RemoteMessageReq traffic prefers REMOTE when
        available.

        Send behavior depends on sendMode. NON_BLOCKING returns after handing the
        request to the gateway. SEMI_BLOCKING waits for AGREE, and if reliability
        is True also waits for a remote delivery/failure notification. BLOCKING
        waits for AGREE and then for a transmission or delivery/failure notification.

        Args:
            data: Data to transmit. Can be bytes, bytearray, list of integers,
                a string (encoded as UTF-8), or a DatagramReq message. Passing a
                pre-built DatagramReq is supported for compatibility, but using the
                socket-level configuration API is preferred.
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
            logger.error("Cannot send datagram: socket is closed.")
            return False

        req = self._build_datagram_request(data, to, protocol)
        logger.debug(f"Built datagram request: {req}")
        if req is None:
            return False

        if req.recipient is None:
            provider = self._resolve_provider()
            if provider is None:
                logger.error("No datagram service provider found. Not sending datagram.")
                return False
            logger.debug(f"Using {provider} as datagram service provider.")
            req.recipient = provider

        if self.sendMode == Gateway.NON_BLOCKING:
            try:
                self.gw.send(req)
            except Exception:
                logger.error("Failed to send datagram", exc_info=True)
                return False
            return True

        rsp = self.gw.request(req, self.REQUEST_TIMEOUT)
        logger.debug(f"Received response for datagram send request: {rsp}")
        if rsp is None or rsp.perf != Performative.AGREE:
            return False

        if self.sendMode == Gateway.SEMI_BLOCKING:
            if getattr(req, "reliability", None) is True:
                return self._await_send_completion(req, delivery_only=True)
            return True

        logger.debug(f"Waiting for send completion notification for datagram with reliability={getattr(req, 'reliability', None)}")
        return self._await_send_completion(req, delivery_only=False)

    def receive(self, timeout: Optional[int] = None) -> Optional[DatagramNtf]: # type: ignore
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
            return self.gw.receive(_createMatcher(self.localAddress, self.localProtocol), effective_timeout)
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

    def onParamChange(self, agentId: Union[AgentID, str], paramName:str, callback: Callable[[ParamChangeNtf], None]) -> None:
        """Register a callback for parameter change notifications from a specific agent.

        Args:
            agentId: AgentID or name of the agent to monitor.
            paramName: Name of the parameter to watch for changes.
            callback: Function to call with the ParamChangeNtf when the parameter changes.

        Example:
            >>> def on_address_change(ntf):
            ...     print(f"Address changed: {ntf.paramValues['address']}")
            ...
            >>> sock.onParamChange("node", "address", on_address_change)
        """
        if self.gw is None:
            logger.error("Cannot register parameter change callback: socket is closed.")
            return
        if isinstance(agentId, AgentID):
            agent = agentId.get_name()
        else:
            agent = agentId

        self._param_change_callbacks["{}:{}".format(agent, paramName)] = callback

    def removeParamChangeCallback(self, agentId: Union[AgentID, str], paramName:str) -> None:
        """Remove a previously registered parameter change callback.

        Args:
            agentId: AgentID or name of the agent.
            paramName: Name of the parameter.

        Example:
            >>> sock.removeParamChangeCallback("node", "address")
        """
        if self.gw is None:
            logger.error("Cannot remove parameter change callback: socket is closed.")
            return
        if isinstance(agentId, AgentID):
            agent = agentId.get_name()
        else:
            agent = agentId

        key = "{}:{}".format(agent, paramName)
        if key in self._param_change_callbacks:
            del self._param_change_callbacks[key]
        else:
            logger.warning(f"No parameter change callback found for agent '{agent}' and parameter '{paramName}'")


## Internal helper methods

    def _build_datagram_request(
        self,
        data: Union[bytes, bytearray, Sequence[int], Message, str],
        to: Optional[int],
        protocol: Optional[int],
    ) -> Optional[DatagramReq]: # type: ignore
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
            if (self.mimeType is None and self.messageClass is None and self.remoteRecipient is None and self.mailbox is None):
                req = DatagramReq()
            else:
                req = RemoteMessageReq()
                if (self.mimeType is not None):
                    req.mimeType = self.mimeType;
                req.messageClass = self.messageClass
                req.remoteRecipient = self.remoteRecipient
                req.mailbox = self.mailbox
            if (isnan(self.ttl) == False):
                logger.debug(f"Setting TTL to {self.ttl} for datagram request")
                req.ttl = self.ttl
            if (self.priority is not None):
                req.priority = self.priority
            if (self.robustness is not None):
                req.robustness = self.robustness
            req.reliability = self.reliability
            req.route = self.route
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
        logger.debug(f"Built {req} for sending")
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
            Services.REMOTE,
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

    def _await_send_completion(self, req: Message, delivery_only: bool) -> bool:
        if self.gw is None:
            return False
        ntf = self.gw.receive(
            lambda msg: self._matches_send_completion(msg, req, delivery_only),
            self.REQUEST_TIMEOUT,
        )
        return self._is_successful_send_completion(ntf, delivery_only)

    def _matches_send_completion(
        self,
        msg: Message,
        req: Message,
        delivery_only: bool,
    ) -> bool:
        if msg is None:
            return False
        if not self._is_send_completion_notification(msg, delivery_only):
            return False
        request_id = getattr(req, "msgID", None)
        reply_to = getattr(msg, "inReplyTo", None)
        if request_id is None:
            return True
        return reply_to == request_id

    def _is_send_completion_notification(self, msg: Message, delivery_only: bool) -> bool:
        clazz = getattr(msg, "__clazz__", "")
        if delivery_only:
            return isinstance(msg, (RemoteSuccessNtf, RemoteFailureNtf))
        return (
            isinstance(
                msg,
                (DatagramDeliveryNtf, DatagramFailureNtf, RemoteSuccessNtf, RemoteFailureNtf),
            )
            or clazz == "org.arl.unet.DatagramTransmissionNtf"
        )

    def _is_successful_send_completion(self, msg: Optional[Message], delivery_only: bool) -> bool:
        if msg is None:
            return False
        if delivery_only:
            return isinstance(msg, RemoteSuccessNtf)
        clazz = getattr(msg, "__clazz__", "")
        return isinstance(msg, (DatagramDeliveryNtf, RemoteSuccessNtf)) or clazz == "org.arl.unet.DatagramTransmissionNtf"
