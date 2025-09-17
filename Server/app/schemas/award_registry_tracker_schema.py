from pydantic import BaseModel
from typing import Optional

class AwardRegistryTrackerBase(BaseModel):
    Event_Code: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    Award_Code: Optional[int] = None
    Doc_No: Optional[int] = None
    Award_Sub_Code: Optional[int] = None

class AwardRegistryTrackerCreate(AwardRegistryTrackerBase):
    pass

class AwardRegistryTrackerUpdate(AwardRegistryTrackerBase):
    pass

class AwardRegistryTracker(AwardRegistryTrackerBase):
    AwardRegistryTrackerId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None 
    Deliverables: Optional[str] = None
    Award_Name: Optional[str] = None
    AwardSubCategoryName: Optional[str] = None

    class Config:
        from_attributes = True