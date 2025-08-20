from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class EventSuper(Base):
    __tablename__ = "Eve_EventSuperMaster"

    EventSuperId = Column(Integer, primary_key=True)
    EventSuper_Name = Column(String(255), nullable=True)

    events = relationship(
        "EventMaster", 
        back_populates="event_super",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<EventSuper {self.EventSuper_Name}>"