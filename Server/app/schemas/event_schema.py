from pydantic import BaseModel
from typing import Optional
from datetime import date

class EventMasterBase(BaseModel):
    EventMaster_Name: str
    EventSuperId: int
    Start_Date: Optional[date] = None
    End_Date: Optional[date] = None

class EventMasterCreate(EventMasterBase):
    pass

class EventMasterUpdate(BaseModel):
    EventMaster_Name: Optional[str] = None
    EventSuperId: Optional[int] = None
    Start_Date: Optional[date] = None
    End_Date: Optional[date] = None

class EventMaster(EventMasterBase):
    EventMasterId: int
    EventSuper_Name: Optional[str] = None

    class Config:
        from_attributes = True