from pydantic import BaseModel
from typing import Optional

class SlotMasterBase(BaseModel):
    SlotMaster_Name: str
    SponsorMasterId: int
    SponsorMasterId: Optional[int] = None

class SlotMasterCreate(SlotMasterBase):
    pass

class SlotMasterUpdate(BaseModel):
    SlotMaster_Name: Optional[str] = None
    SponsorMasterId: Optional[int] = None

class SlotMaster(SlotMasterBase):
    SlotMasterId: int
    SponsorMaster_Name: Optional[str] = None
    SponsorMasterId: Optional[int] = None

    class Config:
        from_attributes = True