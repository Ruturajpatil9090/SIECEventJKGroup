from sqlalchemy import Column, Integer, String, ForeignKey,Date
from sqlalchemy.orm import relationship
from .database import Base

class EventMaster(Base):
    __tablename__ = "Eve_EventMaster"

    EventMasterId = Column(Integer, primary_key=True)
    EventMaster_Name = Column(String(255), nullable=True)
    EventSuperId = Column(Integer, ForeignKey("Eve_EventSuperMaster.EventSuperId"), nullable=False)
    Start_Date = Column(Date, nullable=True)
    End_Date = Column(Date, nullable=True)

    event_super = relationship("EventSuper", back_populates="events")

    def __repr__(self):
        return f"<EventMaster {self.EventMaster_Name}>"