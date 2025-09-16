from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric, Text,DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Eve_SponsorMaster(Base):
    __tablename__ = "Eve_SponsorMaster"

    SponsorMasterId = Column(Integer, primary_key=True)
    Doc_Date = Column(DateTime)
    Doc_No = Column(Integer) 
    Sponsor_Name = Column(String(255), nullable=False)
    Sponsor_logo = Column(String(255), nullable=True)
    Sponsor_pdf = Column(String(255), nullable=True)
    Sponsor_video = Column(String(255), nullable=True)
    Event_Code = Column(Integer)
    CategoryMaster_Code = Column(Integer)
    CategorySubMaster_Code = Column(Integer)
    Proposal_Sent = Column(String(1))  
    Approval_Received = Column(String(1))  
    Sponsorship_Amount = Column(Numeric(15, 2))
    Sponsorship_Amount_Advance = Column(Numeric(15, 2))
    Payment_Status = Column(String(50))
    Proforma_Invoice_Sent = Column(String(1)) 
    Final_Invoice_Sent = Column(String(1)) 
    GST_Details_Received = Column(String(1))  
    Contact_Person = Column(String(255))
    Contact_Email = Column(String(255))
    Contact_Phone = Column(String(20))
    Notes = Column(Text)
    Address = Column(Text)
    CIN = Column(String(50))
    Sponsor_Deliverables_Tracker = Column(Text)
    Website = Column(String(255))
    Awards_Registry_Tracker = Column(Text)
    Category_Sponsors = Column(Text)
    Designation = Column(String(100))
    Expo_Registry = Column(Text)
    GST = Column(String(50))
    Passes_Registry_Tracker = Column(Text)
    Sponsor_Speakers = Column(Text)
    Networking_Table_Slots_Tracker = Column(Text)
    Created_By = Column(String(255))
    Modified_By = Column(String(255))
    User_Id = Column(Integer)

    details = relationship(
        "Eve_SponsorMasterDetail", 
        back_populates="sponsor",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

class Eve_SponsorMasterDetail(Base):
    __tablename__ = "Eve_SponsorMasterDetail"

    SponsorDetailId = Column(Integer, primary_key=True)
    ID = Column(Integer)
    Deliverabled_Code = Column(Integer)
    Deliverable_No = Column(Integer)
    SponsorMasterId = Column(Integer, ForeignKey("Eve_SponsorMaster.SponsorMasterId"))
    
    sponsor = relationship("Eve_SponsorMaster", back_populates="details")