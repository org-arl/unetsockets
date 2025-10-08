"""Message class definitions for UnetStack interaction."""

from __future__ import annotations

from fjagepy import MessageClass

__all__ = [
    "TestReportNtf",
    "AbnormalTerminationNtf",
    "CapabilityListRsp",
    "CapabilityReq",
    "ClearReq",
    "DatagramCancelReq",
    "DatagramDeliveryNtf",
    "DatagramFailureNtf",
    "DatagramNtf",
    "DatagramProgressNtf",
    "DatagramReq",
    "ParamChangeNtf",
    "RefuseRsp",
    "FailureNtf",
    "DatagramTraceReq",
    "RouteDiscoveryReq",
    "RouteTraceReq",
    "RouteDiscoveryNtf",
    "RouteTraceNtf",
    "FecDecodeReq",
    "RxJanusFrameNtf",
    "TxJanusFrameReq",
    "BadFrameNtf",
    "BadRangeNtf",
    "BeaconReq",
    "ClearSyncReq",
    "CollisionNtf",
    "RxFrameNtf",
    "RxFrameStartNtf",
    "SyncInfoReq",
    "SyncInfoRsp",
    "TxFrameNtf",
    "TxFrameReq",
    "TxFrameStartNtf",
    "TxRawFrameReq",
    "AddressAllocReq",
    "AddressAllocRsp",
    "AddressResolutionReq",
    "AddressResolutionRsp",
    "BasebandSignal",
    "RecordBasebandSignalReq",
    "RxBasebandSignalNtf",
    "TxBasebandSignalReq",
    "LinkStatusNtf",
    "RangeNtf",
    "RangeReq",
    "RespondReq",
    "InterrogationNtf",
    "ReservationAcceptReq",
    "ReservationCancelReq",
    "ReservationReq",
    "ReservationRsp",
    "ReservationStatusNtf",
    "RxAckNtf",
    "TxAckReq",
    "RemoteExecReq",
    "RemoteFailureNtf",
    "RemoteFileGetReq",
    "RemoteFileNtf",
    "RemoteFilePutReq",
    "RemoteSuccessNtf",
    "RemoteTextNtf",
    "RemoteTextReq",
    "AddScheduledSleepReq",
    "GetSleepScheduleReq",
    "RemoveScheduledSleepReq",
    "SleepScheduleRsp",
    "WakeFromSleepNtf",
    "ClearStateReq",
    "SaveStateReq",
]

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
# BeaconReq intentionally defined twice to mirror legacy API behaviour.
BeaconReq = MessageClass("org.arl.unet.localization.BeaconReq")
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
