# from pydantic import BaseModel, Field
# from typing import List, Optional, Union
# from decimal import Decimal
# from datetime import datetime

# class SponsorDetailBase(BaseModel):
#     Deliverabled_Code: int
#     Deliverable_No: int
#     ID: Optional[int] = None
#     Doc_Date: Optional[str] = None

# class SponsorDetailCreate(SponsorDetailBase):
#     pass

# class SponsorDetail(SponsorDetailBase):
#     SponsorDetailId: int
#     SponsorMasterId: int
#     ID: int

#     class Config:
#         from_attributes = True

# class SponsorMasterBase(BaseModel):
#     Sponsor_Name: str
#     Sponsor_logo: Optional[str] = None
#     Doc_Date: Optional[str] = None
#     Event_Code: Optional[int] = None
#     CategoryMaster_Code: Optional[int] = None
#     CategorySubMaster_Code: Optional[int] = None
#     Proposal_Sent: Optional[str] = None
#     Approval_Received: Optional[str] = None
#     Sponsorship_Amount: Optional[Decimal] = None
#     Sponsorship_Amount_Advance: Optional[Decimal] = None 
#     Payment_Status: Optional[str] = None
#     Proforma_Invoice_Sent: Optional[str] = None
#     Final_Invoice_Sent: Optional[str] = None
#     GST_Details_Received: Optional[str] = None
#     Contact_Person: Optional[str] = None
#     Contact_Email: Optional[str] = None
#     Contact_Phone: Optional[str] = None
#     Notes: Optional[str] = None
#     Address: Optional[str] = None
#     CIN: Optional[str] = None
#     Sponsor_Deliverables_Tracker: Optional[str] = None
#     Website: Optional[str] = None
#     Awards_Registry_Tracker: Optional[str] = None
#     Category_Sponsors: Optional[str] = None
#     Designation: Optional[str] = None
#     Expo_Registry: Optional[str] = None
#     GST: Optional[str] = None
#     Passes_Registry_Tracker: Optional[str] = None
#     Sponsor_Speakers: Optional[str] = None
#     Networking_Table_Slots_Tracker: Optional[str] = None
#     Created_By: Optional[str] = None
#     Modified_By: Optional[str] = None
#     details: List[SponsorDetailCreate] = []

# class SponsorMasterCreate(SponsorMasterBase):
#     pass

# class SponsorMasterUpdate(BaseModel):
#     Sponsor_Name: Optional[str] = None
#     Sponsor_logo: Optional[str] = None
#     Doc_Date: Optional[str] = None
#     Event_Code: Optional[int] = None
#     CategoryMaster_Code: Optional[int] = None
#     CategorySubMaster_Code: Optional[int] = None
#     Proposal_Sent: Optional[str] = None
#     Approval_Received: Optional[str] = None
#     Sponsorship_Amount: Optional[Decimal] = None
#     Sponsorship_Amount_Advance: Optional[Decimal] = None 
#     Payment_Status: Optional[str] = None
#     Proforma_Invoice_Sent: Optional[str] = None
#     Final_Invoice_Sent: Optional[str] = None
#     GST_Details_Received: Optional[str] = None
#     Contact_Person: Optional[str] = None
#     Contact_Email: Optional[str] = None
#     Contact_Phone: Optional[str] = None
#     Notes: Optional[str] = None
#     Address: Optional[str] = None
#     CIN: Optional[str] = None
#     Sponsor_Deliverables_Tracker: Optional[str] = None
#     Website: Optional[str] = None
#     Awards_Registry_Tracker: Optional[str] = None
#     Category_Sponsors: Optional[str] = None
#     Designation: Optional[str] = None
#     Expo_Registry: Optional[str] = None
#     GST: Optional[str] = None
#     Passes_Registry_Tracker: Optional[str] = None
#     Sponsor_Speakers: Optional[str] = None
#     Networking_Table_Slots_Tracker: Optional[str] = None
#     Created_By: Optional[str] = None
#     Modified_By: Optional[str] = None
#     details: Optional[List[SponsorDetailCreate]] = None

# class SponsorMaster(SponsorMasterBase):
#     SponsorMasterId: int
#     details: List[SponsorDetail] = []

# class SponsorMasterWithDetails(SponsorMasterBase):
#     SponsorMasterId: int
#     category_name: Optional[str] = None
#     EventMaster_Name: Optional[str] = None
#     CategorySub_Name: Optional[str] = None
#     details: List[SponsorDetail] = []

#     class Config:
#         from_attributes = True




from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union
from decimal import Decimal
from datetime import datetime

class SponsorDetailBase(BaseModel):
    Deliverabled_Code: int
    Deliverable_No: int
    ID: Optional[int] = None

class SponsorDetailCreate(SponsorDetailBase):
    pass

class SponsorDetail(SponsorDetailBase):
    SponsorDetailId: int
    SponsorMasterId: int
    ID: int

    class Config:
        from_attributes = True

class SponsorMasterBase(BaseModel):
    Sponsor_Name: str
    Sponsor_logo: Optional[str] = None
    Doc_Date: Optional[str] = None
    Event_Code: Optional[int] = None
    CategoryMaster_Code: Optional[int] = None
    CategorySubMaster_Code: Optional[int] = None
    Proposal_Sent: Optional[str] = None
    Approval_Received: Optional[str] = None
    Sponsorship_Amount: Optional[Decimal] = None
    Sponsorship_Amount_Advance: Optional[Decimal] = None 
    Payment_Status: Optional[str] = None
    Proforma_Invoice_Sent: Optional[str] = None
    Final_Invoice_Sent: Optional[str] = None
    GST_Details_Received: Optional[str] = None
    Contact_Person: Optional[str] = None
    Contact_Email: Optional[str] = None
    Contact_Phone: Optional[str] = None
    Notes: Optional[str] = None
    Address: Optional[str] = None
    CIN: Optional[str] = None
    Sponsor_Deliverables_Tracker: Optional[str] = None
    Website: Optional[str] = None
    Awards_Registry_Tracker: Optional[str] = None
    Category_Sponsors: Optional[str] = None
    Designation: Optional[str] = None
    Expo_Registry: Optional[str] = None
    GST: Optional[str] = None
    Passes_Registry_Tracker: Optional[str] = None
    Sponsor_Speakers: Optional[str] = None
    Networking_Table_Slots_Tracker: Optional[str] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None
    User_Id: Optional[int] = None

    @validator('Doc_Date', pre=True)
    def convert_datetime_to_str(cls, v):
        if isinstance(v, datetime):
            return v.isoformat() 
        if v == "":
            return None
        return v

class SponsorMasterCreate(SponsorMasterBase):
    details: List[SponsorDetailCreate] = []

class SponsorMasterUpdate(BaseModel):
    Sponsor_Name: Optional[str] = None
    Sponsor_logo: Optional[str] = None
    Doc_Date: Optional[str] = None
    Event_Code: Optional[int] = None
    CategoryMaster_Code: Optional[int] = None
    CategorySubMaster_Code: Optional[int] = None
    Proposal_Sent: Optional[str] = None
    Approval_Received: Optional[str] = None
    Sponsorship_Amount: Optional[Decimal] = None
    Sponsorship_Amount_Advance: Optional[Decimal] = None 
    Payment_Status: Optional[str] = None
    Proforma_Invoice_Sent: Optional[str] = None
    Final_Invoice_Sent: Optional[str] = None
    GST_Details_Received: Optional[str] = None
    Contact_Person: Optional[str] = None
    Contact_Email: Optional[str] = None
    Contact_Phone: Optional[str] = None
    Notes: Optional[str] = None
    Address: Optional[str] = None
    CIN: Optional[str] = None
    Sponsor_Deliverables_Tracker: Optional[str] = None
    Website: Optional[str] = None
    Awards_Registry_Tracker: Optional[str] = None
    Category_Sponsors: Optional[str] = None
    Designation: Optional[str] = None
    Expo_Registry: Optional[str] = None
    GST: Optional[str] = None
    Passes_Registry_Tracker: Optional[str] = None
    Sponsor_Speakers: Optional[str] = None
    Networking_Table_Slots_Tracker: Optional[str] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None
    User_Id: Optional[int] = None
    details: Optional[List[SponsorDetailCreate]] = None

    @validator('Doc_Date', pre=True)
    def convert_datetime_to_str(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        if v == "":
            return None
        return v

class SponsorMaster(SponsorMasterBase):
    SponsorMasterId: int
    details: List[SponsorDetail] = []

    class Config:
        from_attributes = True

class SponsorMasterWithDetails(SponsorMasterBase):
    SponsorMasterId: int
    category_name: Optional[str] = None
    EventMaster_Name: Optional[str] = None
    CategorySub_Name: Optional[str] = None
    User_Name: Optional[str] = None
    details: List[SponsorDetail] = []

    class Config:
        from_attributes = True