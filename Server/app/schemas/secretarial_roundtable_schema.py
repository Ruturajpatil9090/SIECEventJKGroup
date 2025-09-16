from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SecretarialRoundTableBase(BaseModel):
    Event_Code: Optional[int] = None
    SponsorMasterId: Optional[int] = None
    Deliverabled_Code: Optional[int] = None
    Deliverable_No: Optional[int] = None
    Speaker_Name: Optional[str] = None
    designation: Optional[str] = None
    Mobile_No: Optional[str] = None
    Email_Address: Optional[str] = None
    SecretarialRoundTable_Bio: Optional[str] = None
    Speaking_Date: Optional[datetime] = None
    Track: Optional[str] = None
    Invitation_Sent: Optional[str] = None
    Approval_Received: Optional[str] = None
    Doc_No: Optional[int] = None

class SecretarialRoundTableCreate(SecretarialRoundTableBase):
    pass

class SecretarialRoundTableUpdate(SecretarialRoundTableBase):
    pass

class SecretarialRoundTable(SecretarialRoundTableBase):
    SecretarialRoundTableId: int
    EventMaster_Name: Optional[str] = None
    Sponsor_Name: Optional[str] = None

    class Config:
        from_attributes = True