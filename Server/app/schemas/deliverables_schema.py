from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeliverablesMasterBase(BaseModel):
    # event_code: int
    Category: str
    description: Optional[str] = None
    Deliverables: Optional[str] = None

class DeliverablesMasterCreate(DeliverablesMasterBase):
    pass

class DeliverablesMasterUpdate(BaseModel):
    # event_code: Optional[int] = None
    Category: Optional[str] = None
    description: Optional[str] = None
    Deliverables: Optional[str] = None

class DeliverablesMaster(DeliverablesMasterBase):
    id: int
    Deliverable_No: int

    class Config:
        from_attributes = True