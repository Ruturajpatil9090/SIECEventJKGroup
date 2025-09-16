from sqlalchemy import Column, Integer, String, DateTime,Text
from sqlalchemy.orm import relationship
from .database import Base

class EveCuratedSession(Base):
    __tablename__ = "Eve_CuratedSession"

    CuratedSessionId = Column(Integer, primary_key=True, autoincrement=True)
    Event_Code = Column(Integer, nullable=True)
    SponsorMasterId = Column(Integer, nullable=True)
    Deliverabled_Code = Column(Integer, nullable=True)
    Deliverable_No = Column(Integer, nullable=True)
    Speaker_Name = Column(String(255), nullable=True)
    designation = Column(String(255), nullable=True)
    Mobile_No = Column(String(50), nullable=True)
    Email_Address = Column(String(50), nullable=True)
    CuratedSession_Bio = Column(Text, nullable=True)
    Speaking_Date = Column(DateTime, nullable=True)
    Track = Column(String(2), nullable=True)
    Doc_No = Column(Integer)

    def __repr__(self):
        return f"<EveCuratedSession {self.CuratedSessionId}>"