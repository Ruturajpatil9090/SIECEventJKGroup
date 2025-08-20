from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class CategoryWiseDeliverablesMaster(Base):
    __tablename__ = "Eve_CategoryWiseDeliverablesMaster"

    CatDeliverableId = Column(Integer, primary_key=True)
    Event_Code = Column(Integer)
    CategoryMaster_Code = Column(Integer)
    CategorySubMaster_Code = Column(Integer)

    details = relationship(
        "CategoryWiseDetailDeliverablesMaster", 
        back_populates="deliverable",
        cascade="all, delete-orphan",
        lazy="selectin" 
    )

class CategoryWiseDetailDeliverablesMaster(Base):
    __tablename__ = "Eve_CategoryWiseDetailDeliverablesMaster"

    CatDeliverableDetailId = Column(Integer, primary_key=True)
    ID = Column(Integer)
    Deliverabled_Code = Column(Integer)
    Deliverable_No = Column(Integer)
    CatDeliverableId = Column(Integer, ForeignKey("Eve_CategoryWiseDeliverablesMaster.CatDeliverableId"))

    deliverable = relationship("CategoryWiseDeliverablesMaster", back_populates="details")