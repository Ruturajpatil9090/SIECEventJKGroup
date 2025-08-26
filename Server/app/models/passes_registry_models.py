from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Eve_PassesRegistry(Base):
    __tablename__ = "Eve_PassesRegistry"

    PassessRegistryId = Column(Integer, primary_key=True)
    Deliverabled_Code = Column(Integer)
    Event_Code = Column(Integer)
    Elite_Passess = Column(Integer)
    Carporate_Passess = Column(Integer)
    Visitor_Passess = Column(Integer)
    Deligate_Name_Recieverd = Column(String(2))

    details = relationship(
        "Eve_PassessRegistryDetail", 
        back_populates="pass_registry",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

class Eve_PassessRegistryDetail(Base):
    __tablename__ = "Eve_PassessRegistryDetail"

    PassessRegistryDetailId = Column(Integer, primary_key=True)
    PassessRegistryId = Column(Integer, ForeignKey("Eve_PassesRegistry.PassessRegistryId"))
    Pass_type = Column(String(2))
    Assigen_Name = Column(String(50))
    Mobile_No = Column(String(50))
    Email_Address = Column(String(50))
    Designation = Column(String(50))
    Remark = Column(Text)

    pass_registry = relationship("Eve_PassesRegistry", back_populates="details")