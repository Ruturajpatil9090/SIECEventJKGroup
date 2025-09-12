from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.speaker_tracker_schema import (
    SpeakerTracker, 
    SpeakerTrackerCreate, 
    SpeakerTrackerUpdate
)
from ..services.speaker_tracker_service import (
    get_speaker_tracker,
    get_speaker_trackers,
    create_speaker_tracker,
    update_speaker_tracker,
    delete_speaker_tracker,
    get_max_speaker_tracker_id,
    get_speaker_trackers_by_event_code,
    get_speaker_trackers_by_sponsor,
    get_speaker_trackers_by_track,
    get_speakertrackers_details
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/speaker-trackers",
    tags=["speaker-trackers"]
)

@router.get("/", response_model=List[SpeakerTracker])
async def get_all_speaker_trackers(
    event_code: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    track: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        results = await get_speaker_trackers(db, event_code)
    elif sponsor_id:
        results = await get_speaker_trackers_by_sponsor(db, sponsor_id)
    elif track:
        results = await get_speaker_trackers_by_track(db, track)
    else:
        results = await get_speaker_trackers(db, None)
    
    return results


@router.get("/details/{SpeakerTrackerId}")
async def read_speakertracker_details(
    SpeakerTrackerId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        registry_details = await get_speakertrackers_details(db, SpeakerTrackerId=SpeakerTrackerId)
        
        if not registry_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CuratedSession Speaker Tracker details not found for ID: {SpeakerTrackerId}"
            )
            
        return registry_details
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving Speaker Tracker registry details: {str(e)}"
        )

@router.get("/getlastSpeakerTrackerId", response_model=int)
async def get_max_speaker_tracker_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_speaker_tracker_id(db)

@router.post("/", response_model=SpeakerTracker, status_code=status.HTTP_201_CREATED)
async def create_speaker_tracker_endpoint(
    tracker_data: SpeakerTrackerCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_speaker_tracker(db, tracker_data, ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{tracker_id}", response_model=SpeakerTracker)
async def read_speaker_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_tracker = await get_speaker_tracker(db, tracker_id=tracker_id)
    if db_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Speaker tracker not found"
        )
    return db_tracker

@router.put("/{tracker_id}", response_model=SpeakerTracker)
async def update_existing_speaker_tracker(
    tracker_id: int,
    tracker: SpeakerTrackerUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_tracker = await update_speaker_tracker(db=db, tracker_id=tracker_id, tracker=tracker, ws_manager=manager)
    if updated_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Speaker tracker not found"
        )
    return updated_tracker

@router.delete("/{tracker_id}")
async def delete_existing_speaker_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_speaker_tracker(db=db, tracker_id=tracker_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Speaker tracker not found"
        )
    return {"message": "Speaker tracker deleted successfully"}