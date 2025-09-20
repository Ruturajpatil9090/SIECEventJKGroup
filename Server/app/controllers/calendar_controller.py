from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date
from ..schemas.calendar_schema import (
    CalendarEvent, 
    CalendarEventCreate, 
    CalendarEventUpdate
)
from ..services.calendar_service import (
    get_calendar_event,
    get_calendar_events,
    create_calendar_event,
    update_calendar_event,
    delete_calendar_event,
    get_user_events
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/calendar",
    tags=["calendar"]
)

@router.get("/", response_model=List[CalendarEvent])
async def get_calendar_events_endpoint(
    user_id: int = Query(..., description="User ID is required to view events"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    event_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        events = await get_calendar_events(
            db, 
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            event_type=event_type
        )
        return events
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/user/{user_id}", response_model=List[CalendarEvent])
async def get_user_calendar_events(
    user_id: int,
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        events = await get_user_events(db, user_id, start_date, end_date)
        return events
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/", response_model=CalendarEvent, status_code=status.HTTP_201_CREATED)
async def create_calendar_event_endpoint(
    event_data: CalendarEventCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_calendar_event(db, event_data, ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{event_id}", response_model=CalendarEvent)
async def read_calendar_event(
    event_id: int,
    user_id: int = Query(..., description="User ID is required to view event"),
    db: AsyncSession = Depends(get_db),
):
    db_event = await get_calendar_event(db, event_id=event_id, user_id=user_id)
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found or you don't have permission to view it"
        )
    return db_event

@router.put("/{event_id}", response_model=CalendarEvent)
async def update_calendar_event_endpoint(
    event_id: int,
    event: CalendarEventUpdate,
    user_id: int = Query(..., description="User ID is required to update event"),
    db: AsyncSession = Depends(get_db),
):
    updated_event = await update_calendar_event(db=db, event_id=event_id, event=event, user_id=user_id, ws_manager=manager)
    if updated_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found or you don't have permission to update it"
        )
    return updated_event

@router.delete("/{event_id}")
async def delete_calendar_event_endpoint(
    event_id: int,
    user_id: int = Query(..., description="User ID is required to delete event"),
    db: AsyncSession = Depends(get_db),
):
    success = await delete_calendar_event(db=db, event_id=event_id, user_id=user_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found or you don't have permission to delete it"
        )
    return {"message": "Calendar event deleted successfully"}