from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MinisterialSessionBase(BaseModel):
    Event_Code: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    Speaker_Name: Optional[str] = None
    designation: Optional[str] = None
    Mobile_No: Optional[str] = None
    Email_Address: Optional[str] = None
    MinisterialSession_Bio: Optional[str] = None
    Speaking_Date: Optional[datetime] = None
    Track: Optional[str] = None
    Invitation_Sent: Optional[str] = None
    Approval_Received: Optional[str] = None

class MinisterialSessionCreate(MinisterialSessionBase):
    pass

class MinisterialSessionUpdate(MinisterialSessionBase):
    pass

class MinisterialSession(MinisterialSessionBase):
    MinisterialSessionId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None

    class Config:
        from_attributes = True