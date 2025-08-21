from pydantic import BaseModel
from typing import List, Optional

class DetailDeliverableBase(BaseModel):
    Deliverabled_Code: int
    Deliverable_No: int

class DetailDeliverableCreate(DetailDeliverableBase):
    pass

class DetailDeliverable(DetailDeliverableBase):
    CatDeliverableDetailId: int
    CatDeliverableId: int

    class Config:
        from_attributes = True

class DeliverableBase(BaseModel):
    Event_Code: int
    CategoryMaster_Code: int
    CategorySubMaster_Code: int
    details: List[DetailDeliverableCreate] = []

class DeliverableCreate(DeliverableBase):
    pass

class DeliverableUpdate(BaseModel):
    Event_Code: Optional[int] = None
    CategoryMaster_Code: Optional[int] = None
    CategorySubMaster_Code: Optional[int] = None
    details: Optional[List[DetailDeliverableCreate]] = None

class Deliverable(DeliverableBase):
    CatDeliverableId: int
    details: List[DetailDeliverable] = []

class FilteredDeliverableResponse(BaseModel):
    CatDeliverableDetailId: int
    CatDeliverableId: int
    Deliverable_No: str
    Deliverabled_Code: str
    ID: int
    Event_Code: int
    CategoryMaster_Code: int
    CategorySubMaster_Code: int

    class Config:
        from_attributes = True