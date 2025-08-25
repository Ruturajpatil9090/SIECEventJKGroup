# from pydantic import BaseModel
# from typing import Optional

# class ExpoRegistryTrackerBase(BaseModel):
#     Deliverabled_Code: Optional[int] = None
#     Deliverable_No: Optional[int] = None
#     SponsorMasterId: Optional[int] = None
#     Event_Code: Optional[int] = None
#     Booth_to_be_provided: Optional[str] = False
#     Booth_Assigned: Optional[str] = False
#     Booth_Number_Assigned: Optional[int] = None
#     Logo_Details_Received: Optional[str] = False
#     Notes_Comments: Optional[str] = None

# class ExpoRegistryTrackerCreate(ExpoRegistryTrackerBase):
#     pass

# class ExpoRegistryTrackerUpdate(ExpoRegistryTrackerBase):
#     pass

# class ExpoRegistryTracker(ExpoRegistryTrackerBase):
#     ExpoRegistryTrackerId: int
#     EventMaster_Name: Optional[str] = None
#     Sponsor_Name: Optional[str] = None 
#     Deliverables: Optional[str] = None

#     class Config:
#         from_attributes = True







from pydantic import BaseModel, validator
from typing import Optional, List, Union

class ExpoRegistryTrackerBase(BaseModel):
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Event_Code: Optional[str] = None
    Booth_to_be_provided: Optional[str] = "False"
    Booth_Assigned: Optional[str] = "False"
    Booth_Number_Assigned: Union[str, List[int], int]
    Logo_Details_Received: Optional[str] = "False"
    Notes_Comments: Optional[str] = None

    @validator('Booth_Number_Assigned', pre=True, always=True)
    def validate_booth_numbers(cls, v):
        if isinstance(v, list):
            return ','.join(map(str, v))
        return v

class ExpoRegistryTrackerCreate(ExpoRegistryTrackerBase):
    pass

class ExpoRegistryTrackerUpdate(ExpoRegistryTrackerBase):
    pass

class ExpoRegistryTracker(ExpoRegistryTrackerBase):
    ExpoRegistryTrackerId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None 
    Deliverables: Optional[str] = None

    @validator('Booth_Number_Assigned', pre=True, always=True)
    def parse_booth_numbers_response(cls, v):
        if isinstance(v, str) and v:
            try:
                return [int(num.strip()) for num in v.split(',') if num.strip().isdigit()]
            except (ValueError, AttributeError):
                return []
        return v

    class Config:
        from_attributes = True