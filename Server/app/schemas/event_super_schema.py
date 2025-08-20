from pydantic import BaseModel
from typing import Optional

class EventSuperBase(BaseModel):
    EventSuper_Name: str

class EventSuperCreate(EventSuperBase):
    pass

class EventSuperUpdate(BaseModel):
    EventSuper_Name: Optional[str] = None

class EventSuper(EventSuperBase):
    EventSuperId: int

    class Config:
        from_attributes = True