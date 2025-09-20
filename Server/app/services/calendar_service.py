
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, update, delete, or_, and_, func, text
# from ..models.calendar_model import CalendarEvent
# from ..schemas.calendar_schema import CalendarEventCreate, CalendarEventUpdate
# from typing import Optional, List
# from datetime import datetime, date
# from ..websockets.connection_manager import ConnectionManager
# import json

# async def get_calendar_events(
#     db: AsyncSession, 
#     user_id: Optional[int] = None,
#     start_date: Optional[date] = None,
#     end_date: Optional[date] = None,
#     event_type: Optional[str] = None
# ):
#     if not user_id:
#         return []
    
#     # Build query without user filtering first
#     query = select(CalendarEvent)
    
#     # Filter by date range if provided
#     if start_date and end_date:
#         query = query.filter(
#             or_(
#                 and_(
#                     CalendarEvent.StartDateTime >= datetime.combine(start_date, datetime.min.time()),
#                     CalendarEvent.StartDateTime <= datetime.combine(end_date, datetime.max.time())
#                 ),
#                 and_(
#                     CalendarEvent.EndDateTime >= datetime.combine(start_date, datetime.min.time()),
#                     CalendarEvent.EndDateTime <= datetime.combine(end_date, datetime.max.time())
#                 ),
#                 and_(
#                     CalendarEvent.StartDateTime <= datetime.combine(start_date, datetime.min.time()),
#                     CalendarEvent.EndDateTime >= datetime.combine(end_date, datetime.max.time())
#                 )
#             )
#         )
    
#     # Filter by event type if provided
#     if event_type:
#         query = query.filter(CalendarEvent.EventType == event_type)
    
#     # FILTER FIX: Only show events that are today or in the future
#     # Get current date without time for comparison
#     current_date = datetime.now().date()
#     query = query.filter(CalendarEvent.EndDateTime >= datetime.combine(current_date, datetime.min.time()))
    
#     query = query.order_by(CalendarEvent.StartDateTime.asc())
    
#     result = await db.execute(query)
#     all_events = result.scalars().all()
    
#     # Filter events by user ID in Python (organizer or assigned)
#     filtered_events = []
#     for event in all_events:
#         is_assigned = event.AssignedUserIds and user_id in event.AssignedUserIds
        
#         if is_assigned:
#             filtered_events.append(event)
    
#     return filtered_events

# async def get_calendar_event(db: AsyncSession, event_id: int, user_id: Optional[int] = None):
#     # Get the event first
#     query = select(CalendarEvent).filter(CalendarEvent.CalendarEventId == event_id)
#     result = await db.execute(query)
#     event = result.scalars().first()
    
#     # Check permissions if user_id is provided
#     if user_id and event:

#         is_assigned = event.AssignedUserIds and user_id in event.AssignedUserIds
        
#         if not (is_assigned):  # FIXED: Check both organizer and assigned
#             return None
    
#     return event

# async def create_calendar_event(db: AsyncSession, event: CalendarEventCreate, ws_manager: Optional[ConnectionManager] = None):
#     db_event = CalendarEvent(**event.model_dump())
#     db.add(db_event)
#     await db.commit()
#     await db.refresh(db_event)
    
#     if ws_manager:
#        await ws_manager.broadcast(message="refresh_calender")
      
#     return db_event

# async def update_calendar_event(db: AsyncSession, event_id: int, event: CalendarEventUpdate, user_id: Optional[int] = None, ws_manager: Optional[ConnectionManager] = None):
#     # First check if user has permission to update this event
#     if user_id:
#         current_event = await get_calendar_event(db, event_id, user_id)
#         if not current_event:
#             return None
    
#     update_data = event.model_dump(exclude_unset=True)
    
#     await db.execute(
#         update(CalendarEvent)
#         .where(CalendarEvent.CalendarEventId == event_id)
#         .values(**update_data)
#     )
#     await db.commit()
    
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_calender")
    
#     return await get_calendar_event(db, event_id)

# async def delete_calendar_event(db: AsyncSession, event_id: int, user_id: Optional[int] = None, ws_manager: Optional[ConnectionManager] = None):
#     # First check if user has permission to delete this event
#     if user_id:
#         db_event = await get_calendar_event(db, event_id, user_id)
#         if not db_event:
#             return False
    
#     db_event = await get_calendar_event(db, event_id)
#     if not db_event:
#         return False
    
#     await db.delete(db_event)
#     await db.commit()
    
#     if ws_manager:
#        await ws_manager.broadcast(message="refresh_calender")

#     return True

# async def get_user_events(db: AsyncSession, user_id: int, start_date: date, end_date: date):
#     return await get_calendar_events(db, user_id, start_date, end_date)















from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, or_, and_, func, text
from ..models.calendar_model import CalendarEvent
from ..schemas.calendar_schema import CalendarEventCreate, CalendarEventUpdate
from typing import Optional, List
from datetime import datetime, date, timezone, timedelta
from ..websockets.connection_manager import ConnectionManager
import json
import pytz

# Indian Standard Time (UTC+5:30)
IST = pytz.timezone('Asia/Kolkata')

def convert_to_ist(dt):
    """Convert datetime to IST timezone"""
    if dt.tzinfo is None:
        # If naive datetime, assume it's already in IST
        return IST.localize(dt)
    else:
        # If aware datetime, convert to IST
        return dt.astimezone(IST)

def convert_to_utc(dt):
    """Convert datetime to UTC for storage"""
    if dt.tzinfo is None:
        # If naive datetime, assume it's in IST and convert to UTC
        localized = IST.localize(dt)
        return localized.astimezone(timezone.utc)
    else:
        # If aware datetime, convert to UTC
        return dt.astimezone(timezone.utc)

async def get_calendar_events(
    db: AsyncSession, 
    user_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    event_type: Optional[str] = None
):
    if not user_id:
        return []
    
    # Convert date range to UTC for database query
    if start_date and end_date:
        # Create datetime objects in IST timezone
        ist_start = datetime.combine(start_date, datetime.min.time())
        ist_end = datetime.combine(end_date, datetime.max.time())
        
        # Convert to UTC for database query
        utc_start = convert_to_utc(ist_start)
        utc_end = convert_to_utc(ist_end)
        
        query = select(CalendarEvent).filter(
            or_(
                and_(
                    CalendarEvent.StartDateTime >= utc_start,
                    CalendarEvent.StartDateTime <= utc_end
                ),
                and_(
                    CalendarEvent.EndDateTime >= utc_start,
                    CalendarEvent.EndDateTime <= utc_end
                ),
                and_(
                    CalendarEvent.StartDateTime <= utc_start,
                    CalendarEvent.EndDateTime >= utc_end
                )
            )
        )
    else:
        query = select(CalendarEvent)
    
    # Filter by event type if provided
    if event_type:
        query = query.filter(CalendarEvent.EventType == event_type)
    
    # Only show events that are today or in the future (in IST)
    current_ist = datetime.now(IST)
    current_utc = current_ist.astimezone(timezone.utc)
    query = query.filter(CalendarEvent.EndDateTime >= current_utc)
    
    query = query.order_by(CalendarEvent.StartDateTime.asc())
    
    result = await db.execute(query)
    all_events = result.scalars().all()
    
    # Convert UTC times back to IST for response
    for event in all_events:
        if event.StartDateTime:
            event.StartDateTime = convert_to_ist(event.StartDateTime.replace(tzinfo=timezone.utc))
        if event.EndDateTime:
            event.EndDateTime = convert_to_ist(event.EndDateTime.replace(tzinfo=timezone.utc))
    
    # Filter events by user ID
    filtered_events = []
    for event in all_events:
        is_assigned = event.AssignedUserIds and user_id in event.AssignedUserIds
        if is_assigned:
            filtered_events.append(event)
    
    return filtered_events

async def get_calendar_event(db: AsyncSession, event_id: int, user_id: Optional[int] = None):
    query = select(CalendarEvent).filter(CalendarEvent.CalendarEventId == event_id)
    result = await db.execute(query)
    event = result.scalars().first()
    
    if event:
        # Convert UTC times back to IST for response
        if event.StartDateTime:
            event.StartDateTime = convert_to_ist(event.StartDateTime.replace(tzinfo=timezone.utc))
        if event.EndDateTime:
            event.EndDateTime = convert_to_ist(event.EndDateTime.replace(tzinfo=timezone.utc))
    
    # Check permissions if user_id is provided
    if user_id and event:
        is_assigned = event.AssignedUserIds and user_id in event.AssignedUserIds
        if not is_assigned:
            return None
    
    return event

async def create_calendar_event(db: AsyncSession, event: CalendarEventCreate, ws_manager: Optional[ConnectionManager] = None):
    # Convert incoming datetimes from IST to UTC for storage
    event_data = event.model_dump()
    
    if event_data.get('StartDateTime'):
        event_data['StartDateTime'] = convert_to_utc(event_data['StartDateTime'])
    if event_data.get('EndDateTime'):
        event_data['EndDateTime'] = convert_to_utc(event_data['EndDateTime'])
    
    db_event = CalendarEvent(**event_data)
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    # Convert back to IST for response
    if db_event.StartDateTime:
        db_event.StartDateTime = convert_to_ist(db_event.StartDateTime.replace(tzinfo=timezone.utc))
    if db_event.EndDateTime:
        db_event.EndDateTime = convert_to_ist(db_event.EndDateTime.replace(tzinfo=timezone.utc))
    
    if ws_manager:
        await ws_manager.broadcast(message="refresh_calender")
      
    return db_event

async def update_calendar_event(db: AsyncSession, event_id: int, event: CalendarEventUpdate, user_id: Optional[int] = None, ws_manager: Optional[ConnectionManager] = None):
    # First check if user has permission to update this event
    if user_id:
        current_event = await get_calendar_event(db, event_id, user_id)
        if not current_event:
            return None
    
    update_data = event.model_dump(exclude_unset=True)
    
    # Convert datetime fields from IST to UTC for storage
    if 'StartDateTime' in update_data and update_data['StartDateTime']:
        update_data['StartDateTime'] = convert_to_utc(update_data['StartDateTime'])
    if 'EndDateTime' in update_data and update_data['EndDateTime']:
        update_data['EndDateTime'] = convert_to_utc(update_data['EndDateTime'])
    
    await db.execute(
        update(CalendarEvent)
        .where(CalendarEvent.CalendarEventId == event_id)
        .values(**update_data)
    )
    await db.commit()
    
    if ws_manager:
        await ws_manager.broadcast(message="refresh_calender")
    
    # Return the updated event with IST times
    return await get_calendar_event(db, event_id)

async def delete_calendar_event(db: AsyncSession, event_id: int, user_id: Optional[int] = None, ws_manager: Optional[ConnectionManager] = None):
    # First check if user has permission to delete this event
    if user_id:
        db_event = await get_calendar_event(db, event_id, user_id)
        if not db_event:
            return False
    
    db_event = await get_calendar_event(db, event_id)
    if not db_event:
        return False
    
    await db.delete(db_event)
    await db.commit()
    
    if ws_manager:
        await ws_manager.broadcast(message="refresh_calender")

    return True

async def get_user_events(db: AsyncSession, user_id: int, start_date: date, end_date: date):
    return await get_calendar_events(db, user_id, start_date, end_date)