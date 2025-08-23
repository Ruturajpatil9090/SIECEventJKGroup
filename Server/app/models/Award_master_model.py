from sqlalchemy import Column, Integer, String, ForeignKey,Date
from .database import Base

class AwardMaster(Base):
    __tablename__ = "Eve_AwardMaster"

    AwardId = Column(Integer, primary_key=True, autoincrement=False)
    Award_Name = Column(String(255), nullable=True)
    EventSuperId = Column(Integer,  nullable=False)
  