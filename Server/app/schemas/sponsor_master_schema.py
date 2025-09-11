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
    Sponsor_logo: Optional[str] = None
    Sponsor_pdf:  Optional[str] = None
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
    Sponsor_logo: Optional[str] = None
    Sponsor_pdf:  Optional[str] = None
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
    Pending_Amount: Optional[Decimal] = None
    details: List[SponsorDetail] = []



class SponsorCompleteDetails(BaseModel):
    SponsorMasterId: int
    Sponsor_Name: str
    Event_Code: int
    Contact_Person: Optional[str] = None
    Contact_Email: Optional[str] = None
    Contact_Phone: Optional[str] = None
    Sponsorship_Amount: Optional[float] = None 
    Pending_Amount: Optional[float] = None
    EventMaster_Name: Optional[str] = None
    MinistrialSpeakername: Optional[str] = None
    CuratedSpeakername: Optional[str] = None
    SpeakerTrackerSpeakerName: Optional[str] = None
    Award_Name: Optional[str] = None
    Elite_Passess: Optional[int] = None
    Carporate_Passess: Optional[int] = None
    Visitor_Passess: Optional[int] = None
    Booth_Number_Assigned: Optional[str] = None
    SpeakerTrackerDesignation: Optional[str] = None
    SpeakerTrackerMobile_No: Optional[str] = None
    SpeakerTrackerEmailId: Optional[str] = None
    SpeakerTrackerTrack: Optional[str] = None
    MinistrialTrackerDesignation: Optional[str] = None
    MinistrialMobileNo: Optional[str] = None
    MinistrialEmailId: Optional[str] = None
    MinistrilaTrack: Optional[str] = None
    CuratedDesignation: Optional[str] = None
    CuratedMobileNo: Optional[str] = None
    CuratedEmailId: Optional[str] = None
    # CuratedSpeakingdate: Optional[date] = None
    CuratedTrack: Optional[str] = None
    SecretarialRoundSpeakerName: Optional[str] = None
    SecretarialRoundDesignation: Optional[str] = None
    SecretarialRoundMobileNo: Optional[str] = None
    SecretarialRoundEmailAddress: Optional[str] = None
    SecretarialRoundTrack: Optional[str] = None
    SecretarialRoundInvitationsent: Optional[str] = None
    SecretarialRoundApprovalReceived: Optional[str] = None
    NetworkingSpeakername: Optional[str] = None
    NetworkingDesignation: Optional[str] = None
    NetworkingMobileNo: Optional[str] = None
    NetworkingEmailAddress: Optional[str] = None
    NetworkingBio: Optional[str] = None
    NetworkingTrack: Optional[str] = None
    NetworkingInvitationSent: Optional[str] = None
    NetworkingApproved: Optional[str] = None

    
class SponsorUserDetails(BaseModel):
    User_Name: str
    Sponsor_Name: str
    Approval_Received: Optional[bool] = None
    Sponsorship_Amount: Optional[float] = None
    Sponsorship_Amount_Advance: Optional[float] = None
    Contact_Person: Optional[str] = None
    Contact_Email: Optional[str] = None
    Contact_Phone: Optional[str] = None
    GST: Optional[str] = None
    Designation: Optional[str] = None

    

    class Config:
        from_attributes = True