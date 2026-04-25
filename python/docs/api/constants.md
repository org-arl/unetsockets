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

### Values

| Constant | Value |
|----------|-------|
| `Protocol.DATA` | `<Protocol.DATA: 0>` |
| `Protocol.RANGING` | `<Protocol.RANGING: 1>` |
| `Protocol.LINK` | `<Protocol.LINK: 2>` |
| `Protocol.REMOTE` | `<Protocol.REMOTE: 3>` |
| `Protocol.MAC` | `<Protocol.MAC: 4>` |
| `Protocol.ROUTING` | `<Protocol.ROUTING: 5>` |
| `Protocol.TRANSPORT` | `<Protocol.TRANSPORT: 6>` |
| `Protocol.ROUTE_MAINTENANCE` | `<Protocol.ROUTE_MAINTENANCE: 7>` |
| `Protocol.LINK2` | `<Protocol.LINK2: 8>` |
| `Protocol.USER` | `<Protocol.USER: 32>` |
| `Protocol.MAX` | `<Protocol.MAX: 63>` |

---

## Services

Service identifiers for looking up agents.

Agents can be looked up based on the services they provide. This class
extends the base fjåge Services with UnetStack-specific service identifiers.


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


**Example:**

```python
    >>> gw.subscribe(gw.topic(Topics.PARAMCHANGE))
```

### Values

| Constant | Value |
|----------|-------|
| `Topics.PARAMCHANGE` | `<Topics.PARAMCHANGE: 'org.arl.unet.Topics.PARAMCHANGE'>` |
| `Topics.LIFECYCLE` | `<Topics.LIFECYCLE: 'org.arl.unet.Topics.LIFECYCLE'>` |
| `Topics.DATAGRAM` | `<Topics.DATAGRAM: 'org.arl.unet.Topics.DATAGRAM'>` |

---

## ReservationStatus

Status indicators for MAC channel reservation.

These values indicate the status of a channel reservation request
during the MAC reservation process.

### Values

| Constant | Value |
|----------|-------|
| `ReservationStatus.START` | `<ReservationStatus.START: 'START'>` |
| `ReservationStatus.END` | `<ReservationStatus.END: 'END'>` |
| `ReservationStatus.FAILURE` | `<ReservationStatus.FAILURE: 'FAILURE'>` |
| `ReservationStatus.CANCEL` | `<ReservationStatus.CANCEL: 'CANCEL'>` |
| `ReservationStatus.REQUEST` | `<ReservationStatus.REQUEST: 'REQUEST'>` |

---

## Address

Special address constants.


**Example:**

```python
    >>> sock.send(data, to=Address.BROADCAST, protocol=Protocol.USER)
```

### Values

| Constant | Value |
|----------|-------|
| `Address.BROADCAST` | `<Address.BROADCAST: 0>` |

---
