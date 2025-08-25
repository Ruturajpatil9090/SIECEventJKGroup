from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.award_registry_tracker_schema import (
    AwardRegistryTracker, 
    AwardRegistryTrackerCreate, 
    AwardRegistryTrackerUpdate
)
from ..services.award_registry_tracker_service import (
    get_award_registry_tracker,
    get_award_registry_trackers,
    create_award_registry_tracker,
    update_award_registry_tracker,
    delete_award_registry_tracker,
    get_max_award_tracker_id,
    get_award_trackers_by_event_code,
    get_award_trackers_by_sponsor,
    get_award_trackers_by_deliverable
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/award-registry",
    tags=["award-registry"]
)

@router.get("/", response_model=List[AwardRegistryTracker])
async def get_all_award_registry_data(
    event_code: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    deliverable_code: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        return await get_award_trackers_by_event_code(db, event_code)
    elif sponsor_id:
        return await get_award_trackers_by_sponsor(db, sponsor_id)
    elif deliverable_code:
        return await get_award_trackers_by_deliverable(db, deliverable_code)
    else:
        results = await get_award_registry_trackers(db)
        return results

@router.get("/getlastAwardRegistryId", response_model=int)
async def get_max_award_tracker_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_award_tracker_id(db)

@router.post("/", response_model=AwardRegistryTracker, status_code=status.HTTP_201_CREATED)
async def create_award_registry_tracker_endpoint(
    tracker_data: AwardRegistryTrackerCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_award_registry_tracker(db, tracker_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{tracker_id}", response_model=AwardRegistryTracker)
async def read_award_registry_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_tracker = await get_award_registry_tracker(db, tracker_id=tracker_id)
    if db_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Award registry tracker not found"
        )
    return db_tracker

@router.put("/{tracker_id}", response_model=AwardRegistryTracker)
async def update_existing_award_registry_tracker(
    tracker_id: int,
    tracker: AwardRegistryTrackerUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_tracker = await update_award_registry_tracker(db=db, tracker_id=tracker_id, tracker=tracker,ws_manager=manager)
    if updated_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Award registry tracker not found"
        )
    return updated_tracker

@router.delete("/{tracker_id}")
async def delete_existing_award_registry_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_award_registry_tracker(db=db, tracker_id=tracker_id,ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Award registry tracker not found"
        )
    return {"message": "Award registry tracker deleted successfully"}