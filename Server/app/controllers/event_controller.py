from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.event_schema import EventMaster, EventMasterCreate, EventMasterUpdate
from ..services.event_service import (
    get_event_masters,
    get_event_master,
    create_event_master,
    update_event_master,
    delete_event_master,
    get_max_event_master_id,
    get_events_by_super_id,
    get_all_events
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/event-masters",
    tags=["event-masters"]
)

@router.get("/", response_model=List[EventMaster])
async def get_all_events_data(db: AsyncSession = Depends(get_db)):
    results = await get_all_events(db)
    return results

@router.get("/getlastEventMasterId", response_model=int)
async def get_max_event_master_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_event_master_id(db)

@router.post("/", response_model=EventMaster, status_code=status.HTTP_201_CREATED)
async def create_event_master_endpoint(
    event_master_data: EventMasterCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_event_master(db, event_master_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{event_master_id}", response_model=EventMaster)
async def read_event_master(
    event_master_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_event_master = await get_event_master(db, event_master_id=event_master_id)
    if db_event_master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="EventMaster not found"
        )
    return db_event_master

@router.get("/by-super/{event_super_id}", response_model=List[EventMaster])
async def read_events_by_super(
    event_super_id: int,
    db: AsyncSession = Depends(get_db),
):
    events = await get_events_by_super_id(db, event_super_id=event_super_id)
    return events

@router.put("/{event_master_id}", response_model=EventMaster)
async def update_existing_event_master(
    event_master_id: int,
    event_master: EventMasterUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_event_master = await update_event_master(
        db=db, 
        event_master_id=event_master_id, 
        event_master=event_master,
        ws_manager=manager
    )
    if updated_event_master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="EventMaster not found"
        )
    return updated_event_master

@router.delete("/{event_master_id}")
async def delete_existing_event_master(
    event_master_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_event_master(db=db, event_master_id=event_master_id,ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="EventMaster not found"
        )
    return {"message": "EventMaster deleted successfully"}