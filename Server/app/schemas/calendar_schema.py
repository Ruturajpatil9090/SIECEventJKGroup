from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CalendarEventBase(BaseModel):
    Title: str
    Description: Optional[str] = None
    StartDateTime: datetime
    EndDateTime: datetime
    EventType: str
    Location: Optional[str] = None
    OrganizerId: int
    AssignedUserIds: Optional[List[int]] = None
    IsAllDay: Optional[bool] = False
    RecurrenceRule: Optional[str] = None
    Status: Optional[str] = 'scheduled'

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    Title: Optional[str] = None
    Description: Optional[str] = None
    StartDateTime: Optional[datetime] = None
    EndDateTime: Optional[datetime] = None
    EventType: Optional[str] = None
    Location: Optional[str] = None
    AssignedUserIds: Optional[List[int]] = None
    IsAllDay: Optional[bool] = None
    RecurrenceRule: Optional[str] = None
    Status: Optional[str] = None

class CalendarEvent(CalendarEventBase):
    CalendarEventId: int
    CreatedAt: datetime
    UpdatedAt: datetime
    OrganizerName: Optional[str] = None
    AssignedUserNames: Optional[List[str]] = None

    class Config:
        from_attributes = True