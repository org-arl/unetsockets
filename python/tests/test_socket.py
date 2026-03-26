from __future__ import annotations

import math
import time

import pytest

from unetpy import (
    AgentID,
    DatagramNtf,
    DatagramReq,
    Gateway,
    Performative,
    Protocol,
    RemoteMessageReq,
    Services,
    UnetSocket,
)

# Apply socket_module_setup fixture to all tests in this module
pytestmark = pytest.mark.usefixtures("socket_module_setup")


# Node A (232): tcp://localhost:1101
# Node B (31): tcp://localhost:1102

NODE_A_HOST = "localhost"
NODE_A_PORT = 1101
NODE_A_ADDRESS = 232

NODE_B_HOST = "localhost"
NODE_B_PORT = 1102
NODE_B_ADDRESS = 31

PRIORITY_URGENT = 1
PRIORITY_HIGH = 2
PRIORITY_NORMAL = 3
PRIORITY_IDLE = 5

ROBUSTNESS_ROBUST = 1
ROBUSTNESS_NORMAL = 2


class TestGateway:
    """Tests for the Gateway class."""

    def test_gateway_shell_agent(self):
        """Gateway should connect to the simulator and expose the shell service."""
        gw = Gateway(NODE_A_HOST, NODE_A_PORT)
        try:
            shell = gw.agentForService(Services.SHELL)
            assert isinstance(shell, AgentID)
            assert shell.name in {"shell", "websh"}
        finally:
            gw.close()


class TestUnetSocketConstruction:
    """Tests for UnetSocket construction and basic lifecycle."""

    def test_socket_can_be_constructed(self):
        """UnetSocket should be able to be constructed."""
        sock = UnetSocket(NODE_A_HOST, NODE_A_PORT)
        assert isinstance(sock, UnetSocket)
        sock.close()

    def test_socket_closes_only_when_closed(self):
        """UnetSocket should close only when closed."""
        sock = UnetSocket(NODE_A_HOST, NODE_A_PORT)
        assert not sock.isClosed()
        sock.close()
        assert sock.isClosed()

    def test_socket_gives_access_to_underlying_gateway(self):
        """UnetSocket should give access to the underlying Gateway."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            gw = sock.getGateway()
            assert isinstance(gw, Gateway)


class TestUnetSocketLocalAddress:
    """Tests for getting local address."""

    def test_get_local_address(self):
        """UnetSocket should be able to get local address."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            local_addr = sock.getLocalAddress()
            assert local_addr == NODE_A_ADDRESS


class TestUnetSocketHostResolution:
    """Tests for host name resolution."""

    def test_get_correct_ids_for_host_names(self):
        """UnetSocket should be able get correct IDs for host names."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            host_a = sock.host("A")
            assert host_a == NODE_A_ADDRESS
            host_b = sock.host("B")
            assert host_b == NODE_B_ADDRESS


class TestUnetSocketAgentAccess:
    """Tests for accessing agents."""

    def test_agent_for_service(self):
        """UnetSocket should be able to get access to Agents for given Service."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            shell = sock.agentForService(Services.SHELL)
            assert isinstance(shell, AgentID)

    def test_agent_by_name(self):
        """UnetSocket should be able to get access to Agents for given name."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            node = sock.agent("node")
            assert isinstance(node, AgentID)

    def test_get_parameters_on_agents(self):
        """UnetSocket should be able to get parameters on Agents."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            node = sock.agent("node")
            assert isinstance(node, AgentID)
            assert node.address == NODE_A_ADDRESS
            assert node.nodeName == "A"

            phy = sock.agentForService(Services.PHYSICAL)
            assert isinstance(phy, AgentID)
            assert phy.name == "phy"
            assert phy.MTU > 0


class TestUnetSocketBindUnbind:
    """Tests for bind and unbind functionality."""

    def test_bind_and_unbind(self):
        """UnetSocket should be able to bind and unbind properly."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            # Initial state
            assert sock.getLocalProtocol() == -1
            assert not sock.isBound()

            # Bind
            sock.bind(42)
            assert sock.isBound()
            assert sock.getLocalProtocol() == 42

            # Unbind
            sock.unbind()
            assert not sock.isBound()
            assert sock.getLocalProtocol() == -1

            # Connect/disconnect state
            assert sock.getRemoteAddress() == -1
            assert sock.getRemoteProtocol() == 0
            assert not sock.isConnected()

            # Connect
            sock.connect(NODE_B_ADDRESS, 0)
            assert sock.getRemoteAddress() == NODE_B_ADDRESS
            assert sock.getRemoteProtocol() == 0
            assert sock.isConnected()

            # Disconnect
            sock.disconnect()
            assert not sock.isConnected()
            assert sock.getRemoteAddress() == -1
            assert sock.getRemoteProtocol() == 0


def _drain_pending_messages(sock, timeout_ms=100):
    """Drain any pending messages from the socket."""
    sock.setTimeout(timeout_ms)
    while sock.receive() is not None:
        pass


class TestUnetSocketTimeout:
    """Tests for timeout functionality."""

    def test_timeout_settings(self):
        """UnetSocket should honour timeouts."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.bind(0)
            # Set timeout to 0 for non-blocking mode
            sock.setTimeout(0)
            assert sock.getTimeout() == 0

            # Set timeout to 1000ms
            sock.setTimeout(1000)
            assert sock.getTimeout() == 1000

            t1 = time.time()
            result = sock.receive()
            dt = (time.time() - t1) * 1000  # Convert to ms
            assert result is None
            assert dt >= 1000

            # Set timeout back to 0 (non-blocking)
            sock.setTimeout(0)
            assert sock.getTimeout() == 0

            t1 = time.time()
            result = sock.receive()
            dt = (time.time() - t1) * 1000
            assert result is None
            assert dt <= 500


class TestUnetSocketSendOptions:
    """Tests for socket-level send metadata and send mode."""

    def test_send_option_defaults(self):
        """UnetSocket should expose the documented default send options."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            assert sock.getSendMode() == Gateway.SEMI_BLOCKING
            assert math.isnan(sock.getTtl())
            assert sock.getPriority() == PRIORITY_NORMAL
            assert sock.getRobustness() == ROBUSTNESS_NORMAL
            assert sock.getReliability() is None
            assert sock.getRoute() is None
            assert sock.getMimeType() is None
            assert sock.getMessageClass() is None
            assert sock.getRemoteRecipient() is None

    def test_send_option_accessors_round_trip(self):
        """Configured send metadata should round-trip through the socket accessors."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.setSendMode(Gateway.BLOCKING)
            sock.setTTL(42.5)
            sock.setPriority(PRIORITY_HIGH)
            sock.setRobustness(ROBUSTNESS_ROBUST)
            sock.setReliability(True)
            sock.setRoute("232:31")
            sock.setMimeType("application/json")
            sock.setMessageClass("org.arl.unet.remote.RemoteTextReq")
            sock.setRemoteRecipient("node")
            sock.setMailbox("STATUS")

            assert sock.getSendMode() == Gateway.BLOCKING
            assert sock.getTTL() == 42.5
            assert sock.getPriority() == PRIORITY_HIGH
            assert sock.getRobustness() == ROBUSTNESS_ROBUST
            assert sock.getReliability() is True
            assert sock.getRoute() == "232:31"
            assert sock.getMimeType() == "application/json"
            assert sock.getMessageClass() == "org.arl.unet.remote.RemoteTextReq"
            assert sock.getRemoteRecipient() == "node"
            assert sock.getMailbox() == "STATUS"

            sock.setSendMode(99)
            assert sock.getSendMode() == Gateway.BLOCKING

    def test_socket_metadata_is_applied_to_datagram_requests(self):
        """Socket-level metadata should be copied into outgoing datagram requests."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.connect(NODE_B_ADDRESS, Protocol.USER)
            sock.setTtl(5.5)
            sock.setPriority(PRIORITY_HIGH)
            sock.setRobustness(ROBUSTNESS_ROBUST)
            sock.setReliability(False)
            sock.setRoute("A->B")

            req = sock._build_datagram_request([61, 62, 63], None, None)

            assert isinstance(req, DatagramReq)
            assert not isinstance(req, RemoteMessageReq)
            assert req.to == NODE_B_ADDRESS
            assert req.protocol == Protocol.USER
            assert req.data == [61, 62, 63]
            assert req.ttl == 5.5
            assert req.priority == PRIORITY_HIGH
            assert req.robustness == ROBUSTNESS_ROBUST
            assert req.reliability is False
            assert req.route == "A->B"

    def test_remote_message_metadata_uses_remote_request_type(self):
        """Remote message metadata should promote requests to RemoteMessageReq."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.connect(NODE_B_ADDRESS, Protocol.USER)
            sock.setMimeType("application/json+auvstatus")
            sock.setMessageClass("org.example.Status")
            sock.setRemoteRecipient("TOPSIDE")
            sock.mailbox = "STATUS"

            req = sock._build_datagram_request("ok", None, None)

            assert isinstance(req, RemoteMessageReq)
            assert req.to == NODE_B_ADDRESS
            assert req.protocol == Protocol.USER
            assert req.data == list(b"ok")
            assert req.mimeType == "application/json+auvstatus"
            assert req.messageClass == "org.example.Status"
            assert req.remoteRecipient == "TOPSIDE"
            assert req.mailbox == "STATUS"

class TestUnetSocketJavaParity:
    """Tests for Java API parity features implemented in Python."""

    def test_mailbox_accessors(self):
        """UnetSocket should expose mailbox getters and setters."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.setMailbox("STATUS")
            assert sock.getMailbox() == "STATUS"
            sock.setMailbox(None)
            assert sock.getMailbox() is None

    def test_service_provider_accessors(self):
        """UnetSocket should allow overriding the selected service provider."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            provider = sock.agentForService(Services.TRANSPORT)
            if provider is None:
                pytest.skip("Simulator does not expose a transport provider")
            sock.setServiceProvider(provider)
            assert sock.getServiceProvider() == provider

    def test_default_provider_prefers_remote_when_available(self):
        """Default provider resolution should prefer REMOTE when the service exists."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            remote = sock.agentForService(Services.REMOTE)
            if remote is None:
                pytest.skip("Simulator does not expose a REMOTE provider")
            sock.provider = None
            assert sock._resolve_provider() == remote

    def test_reliable_semi_blocking_send_waits_for_delivery(self, monkeypatch):
        """Reliable semi-blocking send should wait for a delivery/failure notification."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.connect(NODE_B_ADDRESS, Protocol.USER)
            sock.setReliability(True)
            sock.setSendMode(Gateway.SEMI_BLOCKING)

            class _Agree:
                perf = Performative.AGREE

            class _RemoteSuccess:
                inReplyTo = None

                def __init__(self, in_reply_to):
                    self.inReplyTo = in_reply_to

            receive_calls = {"count": 0}
            request_ids = {"value": None}

            def _request(_req, _timeout):
                request_ids["value"] = _req.msgID
                return _Agree()

            def _receive(_matcher, _timeout):
                receive_calls["count"] += 1
                msg = _RemoteSuccess(request_ids["value"])
                return msg if _matcher(msg) else None

            monkeypatch.setattr(sock.gw, "request", _request)
            monkeypatch.setattr(sock.gw, "receive", _receive)

            monkeypatch.setattr("unetpy.socket.RemoteSuccessNtf", _RemoteSuccess)

            assert sock.send([71, 72, 73]) is True
            assert receive_calls["count"] == 1

    def test_set_robustness_accepts_normal(self):
        """UnetSocket should allow switching robustness back to NORMAL."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock:
            sock.setRobustness(ROBUSTNESS_ROBUST)
            sock.setRobustness(ROBUSTNESS_NORMAL)
            assert sock.getRobustness() == ROBUSTNESS_NORMAL

class TestUnetSocketCommunication:
    """Tests for datagram communication between nodes."""

    def test_communication_requires_binding(self):
        """UnetSocket should be only able to communicate bound to protocol."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock1:
            with UnetSocket(NODE_B_HOST, NODE_B_PORT) as sock2:
                assert sock2.bind(Protocol.USER)
                # Drain any stale messages from previous tests
                _drain_pending_messages(sock2)
                sock2.setTimeout(2000)

                # Send without remote address should fail
                assert not sock1.send([11, 12, 13])

                # Send to address without binding to same protocol - should send but receiver won't get it
                assert sock1.send([14, 15, 16], NODE_B_ADDRESS)
                assert sock2.receive() is None

                # Send with correct protocol - should work
                assert sock1.send([17, 18, 19], NODE_B_ADDRESS, Protocol.USER)
                # Wait a bit for propagation in simulator
                time.sleep(0.5)
                ntf = sock2.receive()
                assert isinstance(ntf, DatagramNtf)
                assert ntf.data == [17, 18, 19]

    def test_communication_on_connected_protocol(self):
        """UnetSocket should be only able to communicate on the protocol connected to."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock1:
            with UnetSocket(NODE_B_HOST, NODE_B_PORT) as sock2:
                assert sock2.bind(Protocol.USER)
                # Drain any stale messages from previous tests
                _drain_pending_messages(sock2)
                sock2.setTimeout(5000)

                sock1.connect(NODE_B_ADDRESS, Protocol.USER)

                # Connected send should work
                assert sock1.send([21, 22, 23])
                time.sleep(0.5)
                ntf = sock2.receive()
                assert isinstance(ntf, DatagramNtf)
                assert ntf.data == [21, 22, 23]

                # Send with different protocol should not be received
                assert sock1.send([24, 25, 26], NODE_B_ADDRESS, 0)
                assert sock2.receive() is None

                # Send to different address should not be received
                assert sock1.send([27, 28, 29], 27, Protocol.USER)
                ntf = sock2.receive()
                assert ntf == None

                # Connected send with data should work
                assert sock1.send([30, 31, 32])
                time.sleep(0.5)
                ntf = sock2.receive()
                assert isinstance(ntf, DatagramNtf)
                assert ntf.data == [30, 31, 32]

    def test_communication_after_disconnect(self):
        """UnetSocket should not send after disconnect without explicit address."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock1:
            with UnetSocket(NODE_B_HOST, NODE_B_PORT) as sock2:
                assert sock2.bind(Protocol.USER)
                # Drain any stale messages from previous tests
                _drain_pending_messages(sock2)
                sock2.setTimeout(2000)
                sock1.connect(NODE_B_ADDRESS, Protocol.USER)

                sock1.disconnect()
                # Send without address should fail after disconnect
                assert not sock1.send([41, 42, 43])

                # Send with explicit address should work
                assert sock1.send([44, 45, 46], NODE_B_ADDRESS, Protocol.USER)
                time.sleep(0.5)
                ntf = sock2.receive()
                assert isinstance(ntf, DatagramNtf)
                assert ntf.data == [44, 45, 46]

    def test_datagram_between_two_nodes(self):
        """Datagrams should flow between two simulator nodes on 1101 and 1102."""
        with UnetSocket(NODE_A_HOST, NODE_A_PORT) as sock1:
            with UnetSocket(NODE_B_HOST, NODE_B_PORT) as sock2:
                # Bind receiver to a user protocol and discover its address.
                assert sock2.bind(Protocol.USER)
                # Drain any stale messages from previous tests
                _drain_pending_messages(sock2)
                addr2 = sock2.getLocalAddress()
                assert addr2 >= 0
                sock2.setTimeout(2000)

                # Send from node1 -> node2.
                payload = [51, 52, 53]
                assert sock1.send(payload, addr2, Protocol.USER)
                time.sleep(0.5)

                ntf = None
                for _ in range(3):
                    ntf = sock2.receive()
                    if isinstance(ntf, DatagramNtf):
                        break
                    time.sleep(0.5)
                assert isinstance(ntf, DatagramNtf)
                assert ntf.data == payload

