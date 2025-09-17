from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class AwardRegistryTracker(Base):
    __tablename__ = "Eve_AwardRegistryTracker"

    AwardRegistryTrackerId = Column(Integer, primary_key=True, autoincrement=True)
    Event_Code = Column(Integer, nullable=True)
    SponsorMasterId = Column(Integer, nullable=True)
    Deliverabled_Code = Column(Integer, nullable=True)
    Deliverable_No = Column(Integer, nullable=True)
    Award_Code = Column(Integer, nullable=True)
    Doc_No = Column(Integer)
    Award_Sub_Code = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<AwardRegistryTracker {self.AwardRegistryTrackerId}>"