from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.expo_registry_tracker_schema import (
    ExpoRegistryTracker, 
    ExpoRegistryTrackerCreate, 
    ExpoRegistryTrackerUpdate
)
from ..services.expo_registry_tracker_service import (
    get_expo_registry_tracker,
    get_expo_registry_trackers,
    create_expo_registry_tracker,
    update_expo_registry_tracker,
    delete_expo_registry_tracker,
    get_max_tracker_id,
    get_trackers_by_event_code,
    get_trackers_by_sponsor
)
from ..models.database import get_db
from ..utils.security import get_current_user

router = APIRouter(
    prefix="/expo-registry",
    tags=["expo-registry"]
)

@router.get("/", response_model=List[ExpoRegistryTracker])
async def read_expo_registry_trackers(
    skip: int = 0,
    limit: int = 100,
    event_code: Optional[str] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    if event_code:
        return await get_trackers_by_event_code(db, event_code)
    elif sponsor_id:
        return await get_trackers_by_sponsor(db, sponsor_id)
    else:
        return await get_expo_registry_trackers(db, skip=skip, limit=limit)

@router.get("/getlastExpoRegistryId", response_model=int)
async def get_max_tracker_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_tracker_id(db)

@router.post("/", response_model=ExpoRegistryTracker, status_code=status.HTTP_201_CREATED)
async def create_expo_registry_tracker_endpoint(
    tracker_data: ExpoRegistryTrackerCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_expo_registry_tracker(db, tracker_data)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{tracker_id}", response_model=ExpoRegistryTracker)
async def read_expo_registry_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_tracker = await get_expo_registry_tracker(db, tracker_id=tracker_id)
    if db_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo registry tracker not found"
        )
    return db_tracker

@router.put("/{tracker_id}", response_model=ExpoRegistryTracker)
async def update_existing_expo_registry_tracker(
    tracker_id: int,
    tracker: ExpoRegistryTrackerUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_tracker = await update_expo_registry_tracker(db=db, tracker_id=tracker_id, tracker=tracker)
    if updated_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo registry tracker not found"
        )
    return updated_tracker

@router.delete("/{tracker_id}")
async def delete_existing_expo_registry_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_expo_registry_tracker(db=db, tracker_id=tracker_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo registry tracker not found"
        )
    return {"message": "Expo registry tracker deleted successfully"}