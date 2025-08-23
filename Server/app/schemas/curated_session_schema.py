from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CuratedSessionBase(BaseModel):
    Event_Code: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    Speaker_Name: Optional[str] = None
    designation: Optional[str] = None
    Mobile_No: Optional[str] = None
    Email_Address: Optional[str] = None
    CuratedSession_Bio: Optional[str] = None
    Speaking_Date: Optional[datetime] = None
    Track: Optional[str] = None

class CuratedSessionCreate(CuratedSessionBase):
    pass

class CuratedSessionUpdate(CuratedSessionBase):
    pass

class CuratedSession(CuratedSessionBase):
    CuratedSessionId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None

    class Config:
        from_attributes = True