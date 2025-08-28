from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SpeakerTrackerBase(BaseModel):
    Event_Code: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Speaker_Name: Optional[str] = None
    Designation: Optional[str] = None
    Mobile_No: Optional[str] = None
    Email_Address: Optional[str] = None
    Speaker_Bio: Optional[str] = None
    Speaking_Date: Optional[datetime] = None
    Track: Optional[str] = None
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None

class SpeakerTrackerCreate(SpeakerTrackerBase):
    pass

class SpeakerTrackerUpdate(SpeakerTrackerBase):
    pass

class SpeakerTracker(SpeakerTrackerBase):
    SpeakerTrackerId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None

    class Config:
        from_attributes = True