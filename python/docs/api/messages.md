# Messages

Pre-defined message classes for UnetStack communication.

## Import

```python
from unetpy import DatagramReq, DatagramNtf, RxFrameNtf
```

Pre-defined message classes for UnetStack communication.

This module provides message class definitions for all standard UnetStack
messages. Messages are created using fjagepy.MessageClass and follow the
UnetStack class hierarchy.

Messages follow the UnetStack inheritance hierarchy. For example,
RxFrameNtf extends DatagramNtf, so isinstance(rx, DatagramNtf)
returns True for RxFrameNtf instances.

---

## Available Messages
