from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NetworkingSlotBase(BaseModel):
    Event_Code: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    Speaker_Name: Optional[str] = None
    designation: Optional[str] = None
    Mobile_No: Optional[str] = None
    Email_Address: Optional[str] = None
    NetworkingSlotSession_Bio: Optional[str] = None
    Speaking_Date: Optional[datetime] = None
    Track: Optional[str] = None
    Invitation_Sent: Optional[str] = None
    Approval_Received: Optional[str] = None

class NetworkingSlotCreate(NetworkingSlotBase):
    pass

class NetworkingSlotUpdate(NetworkingSlotBase):
    pass

class NetworkingSlot(NetworkingSlotBase):
    NetworkingSlotId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None

    class Config:
        from_attributes = True