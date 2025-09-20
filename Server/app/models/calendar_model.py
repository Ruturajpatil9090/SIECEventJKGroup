from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class CalendarEvent(Base):
    __tablename__ = "Eve_Calendar"

    CalendarEventId = Column(Integer, primary_key=True, autoincrement=True)
    Title = Column(String(255), nullable=False)
    Description = Column(Text, nullable=True)
    StartDateTime = Column(DateTime, nullable=False)
    EndDateTime = Column(DateTime, nullable=False)
    EventType = Column(String(50), nullable=False)  # meeting, task, appointment
    Location = Column(String(255), nullable=True)
    OrganizerId = Column(Integer, nullable=False)  # User who created the event
    AssignedUserIds = Column(JSON, nullable=True)  # List of user IDs assigned to the event
    IsAllDay = Column(Boolean, default=False)
    RecurrenceRule = Column(String(255), nullable=True)
    Status = Column(String(20), default='scheduled')  # scheduled, cancelled, completed
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<CalendarEvent {self.CalendarEventId}: {self.Title}>"