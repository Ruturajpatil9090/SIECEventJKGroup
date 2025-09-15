from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class SlotMaster(Base):
    __tablename__ = "Eve_SlotMaster"

    SlotMasterId = Column(Integer, primary_key=True)
    SlotMaster_Name = Column(String(255), nullable=True)
    SponsorMasterId = Column(Integer, nullable=True)
    Event_Code = Column(Integer, nullable=True)
    ID = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<SlotMaster {self.SlotMaster_Name}>"