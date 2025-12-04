"""Pre-defined message classes for UnetStack communication.

This module provides message class definitions for all standard UnetStack
messages. Messages are created using fjagepy.MessageClass and follow the
UnetStack class hierarchy.

Messages follow the UnetStack inheritance hierarchy. For example,
RxFrameNtf extends DatagramNtf, so isinstance(rx, DatagramNtf)
returns True for RxFrameNtf instances.
"""

from __future__ import annotations

from fjagepy import MessageClass

# unet
TestReportNtf = MessageClass("org.arl.unet.TestReportNtf")
AbnormalTerminationNtf = MessageClass("org.arl.unet.AbnormalTerminationNtf")
CapabilityListRsp = MessageClass("org.arl.unet.CapabilityListRsp")
CapabilityReq = MessageClass("org.arl.unet.CapabilityReq")
ClearReq = MessageClass("org.arl.unet.ClearReq")
DatagramCancelReq = MessageClass("org.arl.unet.DatagramCancelReq")
DatagramDeliveryNtf = MessageClass("org.arl.unet.DatagramDeliveryNtf")
DatagramFailureNtf = MessageClass("org.arl.unet.DatagramFailureNtf")
DatagramNtf = MessageClass("org.arl.unet.DatagramNtf")
DatagramProgressNtf = MessageClass("org.arl.unet.DatagramProgressNtf")
DatagramReq = MessageClass("org.arl.unet.DatagramReq")
ParamChangeNtf = MessageClass("org.arl.unet.ParamChangeNtf")
RefuseRsp = MessageClass("org.arl.unet.RefuseRsp")
FailureNtf = MessageClass("org.arl.unet.FailureNtf")

# net
DatagramTraceReq = MessageClass("org.arl.unet.net.DatagramTraceReq")
RouteDiscoveryReq = MessageClass("org.arl.unet.net.RouteDiscoveryReq")
RouteTraceReq = MessageClass("org.arl.unet.net.RouteTraceReq")
RouteDiscoveryNtf = MessageClass("org.arl.unet.net.RouteDiscoveryNtf")
RouteTraceNtf = MessageClass("org.arl.unet.net.RouteTraceNtf")

# phy
FecDecodeReq = MessageClass("org.arl.unet.phy.FecDecodeReq")
RxJanusFrameNtf = MessageClass("org.arl.unet.phy.RxJanusFrameNtf")
TxJanusFrameReq = MessageClass("org.arl.unet.phy.TxJanusFrameReq")
BadFrameNtf = MessageClass("org.arl.unet.phy.BadFrameNtf")
BadRangeNtf = MessageClass("org.arl.unet.phy.BadRangeNtf")
BeaconReq = MessageClass("org.arl.unet.phy.BeaconReq")
ClearSyncReq = MessageClass("org.arl.unet.phy.ClearSyncReq")
CollisionNtf = MessageClass("org.arl.unet.phy.CollisionNtf")
RxFrameNtf = MessageClass("org.arl.unet.phy.RxFrameNtf", DatagramNtf)
RxFrameStartNtf = MessageClass("org.arl.unet.phy.RxFrameStartNtf")
SyncInfoReq = MessageClass("org.arl.unet.phy.SyncInfoReq")
SyncInfoRsp = MessageClass("org.arl.unet.phy.SyncInfoRsp")
TxFrameNtf = MessageClass("org.arl.unet.phy.TxFrameNtf")
TxFrameReq = MessageClass("org.arl.unet.phy.TxFrameReq", DatagramReq)
TxFrameStartNtf = MessageClass("org.arl.unet.phy.TxFrameStartNtf")
TxRawFrameReq = MessageClass("org.arl.unet.phy.TxRawFrameReq")

# addr
AddressAllocReq = MessageClass("org.arl.unet.addr.AddressAllocReq")
AddressAllocRsp = MessageClass("org.arl.unet.addr.AddressAllocRsp")
AddressResolutionReq = MessageClass("org.arl.unet.addr.AddressResolutionReq")
AddressResolutionRsp = MessageClass("org.arl.unet.addr.AddressResolutionRsp")

# bb
BasebandSignal = MessageClass("org.arl.unet.bb.BasebandSignal")
RecordBasebandSignalReq = MessageClass("org.arl.unet.bb.RecordBasebandSignalReq")
RxBasebandSignalNtf = MessageClass("org.arl.unet.bb.RxBasebandSignalNtf", BasebandSignal)
TxBasebandSignalReq = MessageClass("org.arl.unet.bb.TxBasebandSignalReq", BasebandSignal)

# link
LinkStatusNtf = MessageClass("org.arl.unet.link.LinkStatusNtf")

# localization
RangeNtf = MessageClass("org.arl.unet.localization.RangeNtf")
RangeReq = MessageClass("org.arl.unet.localization.RangeReq")
RespondReq = MessageClass("org.arl.unet.localization.RespondReq")
InterrogationNtf = MessageClass("org.arl.unet.localization.InterrogationNtf")

# mac
ReservationAcceptReq = MessageClass("org.arl.unet.mac.ReservationAcceptReq")
ReservationCancelReq = MessageClass("org.arl.unet.mac.ReservationCancelReq")
ReservationReq = MessageClass("org.arl.unet.mac.ReservationReq")
ReservationRsp = MessageClass("org.arl.unet.mac.ReservationRsp")
ReservationStatusNtf = MessageClass("org.arl.unet.mac.ReservationStatusNtf")
RxAckNtf = MessageClass("org.arl.unet.mac.RxAckNtf")
TxAckReq = MessageClass("org.arl.unet.mac.TxAckReq")

# remote
RemoteExecReq = MessageClass("org.arl.unet.remote.RemoteExecReq")
RemoteFailureNtf = MessageClass("org.arl.unet.remote.RemoteFailureNtf")
RemoteFileGetReq = MessageClass("org.arl.unet.remote.RemoteFileGetReq")
RemoteFileNtf = MessageClass("org.arl.unet.remote.RemoteFileNtf")
RemoteFilePutReq = MessageClass("org.arl.unet.remote.RemoteFilePutReq")
RemoteSuccessNtf = MessageClass("org.arl.unet.remote.RemoteSuccessNtf")
RemoteTextNtf = MessageClass("org.arl.unet.remote.RemoteTextNtf")
RemoteTextReq = MessageClass("org.arl.unet.remote.RemoteTextReq")

# scheduler
AddScheduledSleepReq = MessageClass("org.arl.unet.scheduler.AddScheduledSleepReq")
GetSleepScheduleReq = MessageClass("org.arl.unet.scheduler.GetSleepScheduleReq")
RemoveScheduledSleepReq = MessageClass("org.arl.unet.scheduler.RemoveScheduledSleepReq")
SleepScheduleRsp = MessageClass("org.arl.unet.scheduler.SleepScheduleRsp")
WakeFromSleepNtf = MessageClass("org.arl.unet.scheduler.WakeFromSleepNtf")

# state
ClearStateReq = MessageClass("org.arl.unet.state.ClearStateReq")
SaveStateReq = MessageClass("org.arl.unet.state.SaveStateReq")


# Build __all__ dynamically from module globals (message classes only)
# Message class names follow naming conventions: end with Req, Rsp, Ntf, or are BasebandSignal
_MESSAGE_SUFFIXES = ("Req", "Rsp", "Ntf")
_MESSAGE_SPECIAL = ("BasebandSignal",)

__all__ = [
    name for name, obj in list(globals().items())
    if not name.startswith("_")
    and isinstance(obj, type)
    and (name.endswith(_MESSAGE_SUFFIXES) or name in _MESSAGE_SPECIAL)
]
