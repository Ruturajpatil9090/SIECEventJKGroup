from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Eve_TeamMasterHead(Base):
    __tablename__ = "Eve_TeamMasterHead"

    TeamMasterId = Column(Integer, primary_key=True)
    Team_Name = Column(String(50))
    Team_Purpose = Column(String(255))
    Supervisor = Column(Integer)
    Created_By = Column(String(50))
    Created_Date = Column(DateTime, default=func.now())
    Modified_By = Column(String(50))
    Modified_Date = Column(DateTime, default=func.now(), onupdate=func.now())

    details = relationship(
        "Eve_TeamMasterDetail", 
        back_populates="team_head",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

class Eve_TeamMasterDetail(Base):
    __tablename__ = "Eve_TeamMasterDetail"

    TeamMasterDetailId = Column(Integer, primary_key=True)
    TeamMasterId = Column(Integer, ForeignKey("Eve_TeamMasterHead.TeamMasterId"))
    User_Id = Column(Integer)

    team_head = relationship("Eve_TeamMasterHead", back_populates="details")