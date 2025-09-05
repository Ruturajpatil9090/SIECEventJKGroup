from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class PassRegistryDetailBase(BaseModel):
    Pass_type: Optional[str] = None
    Assigen_Name: Optional[str] = None
    Mobile_No: Optional[str] = None
    Email_Address: Optional[str] = None
    Designation: Optional[str] = None
    Remark: Optional[str] = None

class PassRegistryDetailCreate(PassRegistryDetailBase):
    rowaction: Optional[str] = None  
    PassessRegistryDetailId: Optional[int] = None

class PassRegistryDetail(PassRegistryDetailBase):
    PassessRegistryDetailId: int
    PassessRegistryId: int

    class Config:
        from_attributes = True

class PassRegistryBase(BaseModel):
    Deliverabled_Code: Optional[int] = None
    Event_Code: Optional[int] = None
    Elite_Passess: Optional[int] = None
    Carporate_Passess: Optional[int] = None
    Visitor_Passess: Optional[int] = None
    Deligate_Name_Recieverd: Optional[str] = None
    SponsorMasterId: Optional[int] = None
    Deliverable_No: Optional[int] = None
    Registration_Form_Sent: Optional[str] = None

class PassRegistryCreate(PassRegistryBase):
    details: List[PassRegistryDetailCreate] = []

class PassRegistryUpdate(PassRegistryBase):
    details: Optional[List[PassRegistryDetailCreate]] = None

class PassRegistry(PassRegistryBase):
    PassessRegistryId: int
    details: List[PassRegistryDetail] = []
    EventMaster_Name: Optional[str] = None
    Deliverables: Optional[str] = None
    Sponsor_Name: Optional[str] = None

    class Config:
        from_attributes = True