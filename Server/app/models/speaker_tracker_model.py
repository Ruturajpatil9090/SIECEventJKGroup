from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from .database import Base

class EveSpeakerTracker(Base):
    __tablename__ = "Eve_SpeakerTracker"

    SpeakerTrackerId = Column(Integer, primary_key=True, autoincrement=True)
    Event_Code = Column(Integer, nullable=True)
    SponsorMasterId = Column(Integer, nullable=True)
    Speaker_Name = Column(String(255), nullable=True)
    Designation = Column(String(50), nullable=True)
    Mobile_No = Column(String(50), nullable=True)
    Email_Address = Column(String(50), nullable=True)
    Speaker_Bio = Column(Text, nullable=True)
    Speaking_Date = Column(DateTime, nullable=True)
    Track = Column(String(2), nullable=True)
    Deliverabled_Code = Column(Integer, nullable=True)
    Deliverable_No = Column(Integer, nullable=True)
    Pitch_session_Topic = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<EveSpeakerTracker {self.SpeakerTrackerId}>"