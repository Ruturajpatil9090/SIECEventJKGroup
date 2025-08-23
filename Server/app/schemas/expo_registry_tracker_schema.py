from pydantic import BaseModel
from typing import Optional

class ExpoRegistryTrackerBase(BaseModel):
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Event_Code: Optional[int] = None
    Booth_to_be_provided: Optional[str] = False
    Booth_Assigned: Optional[str] = False
    Booth_Number_Assigned: Optional[int] = None
    Logo_Details_Received: Optional[str] = False
    Notes_Comments: Optional[str] = None

class ExpoRegistryTrackerCreate(ExpoRegistryTrackerBase):
    pass

class ExpoRegistryTrackerUpdate(ExpoRegistryTrackerBase):
    pass

class ExpoRegistryTracker(ExpoRegistryTrackerBase):
    ExpoRegistryTrackerId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None 
    Deliverables: Optional[str] = None

    class Config:
        from_attributes = True