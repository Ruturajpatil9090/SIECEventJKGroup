from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from .database import Base

class ExpoRegistryTracker(Base):
    __tablename__ = "Eve_ExpoRegistryTracker"

    ExpoRegistryTrackerId = Column(Integer, primary_key=True, autoincrement=True)
    Deliverabled_Code = Column(Integer, nullable=True)
    Deliverable_No = Column(Integer, nullable=True)
    SponsorMasterId = Column(Integer, nullable=True)
    Event_Code = Column(String(255), nullable=True)
    Booth_to_be_provided = Column(String(2), default=False)
    Booth_Assigned = Column(String(2), default=False)
    Booth_Number_Assigned = Column(Text, nullable=True)
    Logo_Details_Received = Column(String(2), default=False)
    Notes_Comments = Column(Text, nullable=True)
    Doc_No = Column(Integer)

    def __repr__(self):
        return f"<ExpoRegistryTracker {self.ExpoRegistryTrackerId}>"