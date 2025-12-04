# Constants

This module defines protocol numbers, service identifiers, and other
constants used throughout UnetStack communication.

## Import

```python
from unetpy import Protocol, Services, Topics, ReservationStatus, Address
```

Constants and enumerations used by the Unet Python gateway.

This module defines protocol numbers, service identifiers, and other
constants used throughout UnetStack communication.


**Example:**

```python
    >>> from unetpy import Protocol, Services
    >>> sock.bind(Protocol.USER)
    >>> phy = sock.agentForService(Services.PHYSICAL)
```

---

## Protocol

Well-known protocol number assignments.

Protocol numbers identify the type of data in a datagram. Numbers 1-31
are reserved for UnetStack internal use. User applications should use
Protocol.DATA (0) or Protocol.USER (32) through Protocol.MAX (63).


**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `DATA` | User application data (0). |
| `RANGING` | Reserved for ranging agents (1). |
| `LINK` | Reserved for link agents (2). |
| `REMOTE` | Reserved for remote management agents (3). |
| `MAC` | Reserved for MAC protocol agents (4). |
| `ROUTING` | Reserved for routing agents (5). |
| `TRANSPORT` | Reserved for transport agents (6). |
| `ROUTE_MAINTENANCE` | Reserved for route maintenance agents (7). |
| `LINK2` | Reserved for secondary link agents (8). |
| `USER` | Lowest protocol number for user protocols (32). |
| `MAX` | Maximum protocol number (63). |

**Example:**

```python
    >>> sock.bind(Protocol.USER)
    >>> sock.send(data, to=31, protocol=Protocol.USER)
    >>> # Custom user protocol
    >>> MY_PROTOCOL = Protocol.USER + 5  # = 37
```

### Values

| Constant | Value |
|----------|-------|
| `Protocol.DATA` | `0` |
| `Protocol.RANGING` | `1` |
| `Protocol.LINK` | `2` |
| `Protocol.REMOTE` | `3` |
| `Protocol.MAC` | `4` |
| `Protocol.ROUTING` | `5` |
| `Protocol.TRANSPORT` | `6` |
| `Protocol.ROUTE_MAINTENANCE` | `7` |
| `Protocol.LINK2` | `8` |
| `Protocol.USER` | `32` |
| `Protocol.MAX` | `63` |

---

## Services

Service identifiers for looking up agents.

Agents can be looked up based on the services they provide. This class
extends the base fjåge Services with UnetStack-specific service identifiers.


**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `NODE_INFO` | Node information service - provides node address and name. |
| `ADDRESS_RESOLUTION` | Address resolution service - resolves node names. |
| `DATAGRAM` | Datagram service - handles datagram transmission. |
| `PHYSICAL` | Physical layer service - low-level frame transmission. |
| `RANGING` | Ranging/localization service - distance measurements. |
| `BASEBAND` | Baseband signal service - raw signal access. |
| `LINK` | Link layer service - reliable point-to-point links. |
| `MAC` | MAC protocol service - medium access control. |
| `ROUTING` | Routing service - multi-hop routing. |
| `ROUTE_MAINTENANCE` | Route maintenance service. |
| `TRANSPORT` | Transport layer service - reliable transport. |
| `REMOTE` | Remote access service - remote command execution. |
| `STATE_MANAGER` | State management service. |
| `DEVICE_INFO` | Device information service. |
| `DOA` | Direction of arrival service. |
| `SCHEDULER` | Sleep scheduler service. |
| `SHELL` | Shell service (inherited from fjåge). |

**Example:**

```python
    >>> phy = sock.agentForService(Services.PHYSICAL)
    >>> print(phy.MTU)
    >>> shell = gw.agentForService(Services.SHELL)
```

### Values

| Constant | Value |
|----------|-------|
| `Services.NODE_INFO` | `'org.arl.unet.Services.NODE_INFO'` |
| `Services.ADDRESS_RESOLUTION` | `'org.arl.unet.Services.ADDRESS_RESOLUTION'` |
| `Services.DATAGRAM` | `'org.arl.unet.Services.DATAGRAM'` |
| `Services.PHYSICAL` | `'org.arl.unet.Services.PHYSICAL'` |
| `Services.RANGING` | `'org.arl.unet.Services.RANGING'` |
| `Services.BASEBAND` | `'org.arl.unet.Services.BASEBAND'` |
| `Services.LINK` | `'org.arl.unet.Services.LINK'` |
| `Services.MAC` | `'org.arl.unet.Services.MAC'` |
| `Services.ROUTING` | `'org.arl.unet.Services.ROUTING'` |
| `Services.ROUTE_MAINTENANCE` | `'org.arl.unet.Services.ROUTE_MAINTENANCE'` |
| `Services.TRANSPORT` | `'org.arl.unet.Services.TRANSPORT'` |
| `Services.REMOTE` | `'org.arl.unet.Services.REMOTE'` |
| `Services.STATE_MANAGER` | `'org.arl.unet.Services.STATE_MANAGER'` |
| `Services.DEVICE_INFO` | `'org.arl.unet.Services.DEVICE_INFO'` |
| `Services.DOA` | `'org.arl.unet.Services.DOA'` |
| `Services.SCHEDULER` | `'org.arl.unet.Services.SCHEDULER'` |

---

## Topics

Topics for pub/sub notifications.

These topics can be subscribed to for receiving notifications about
various system events.


**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `PARAMCHANGE` | Topic for parameter change notifications. |
| `LIFECYCLE` | Topic for abnormal agent termination notifications. |

**Example:**

```python
    >>> gw.subscribe(gw.topic(Topics.PARAMCHANGE))
```

### Values

| Constant | Value |
|----------|-------|
| `Topics.PARAMCHANGE` | `'org.arl.unet.Topics.PARAMCHANGE'` |
| `Topics.LIFECYCLE` | `'org.arl.unet.Topics.LIFECYCLE'` |

---

## ReservationStatus

Status indicators for MAC channel reservation.

These values indicate the status of a channel reservation request
during the MAC reservation process.


**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `START` | Start of channel reservation. |
| `END` | End of channel reservation. |
| `FAILURE` | Failed to reserve channel. |
| `CANCEL` | Reservation cancelled. |
| `REQUEST` | Request for information from client agent. |

### Values

| Constant | Value |
|----------|-------|
| `ReservationStatus.START` | `0` |
| `ReservationStatus.END` | `1` |
| `ReservationStatus.FAILURE` | `2` |
| `ReservationStatus.CANCEL` | `3` |
| `ReservationStatus.REQUEST` | `4` |

---

## Address

Special address constants.


**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `BROADCAST` | Broadcast address (0) - sends to all nodes. |

**Example:**

```python
    >>> sock.send(data, to=Address.BROADCAST, protocol=Protocol.USER)
```

### Values

| Constant | Value |
|----------|-------|
| `Address.BROADCAST` | `0` |

---
