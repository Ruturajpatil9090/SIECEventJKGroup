from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
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
    get_trackers_by_sponsor,
    parse_booth_numbers,
    get_exporegistry_details
)
from ..models.database import get_db
from ..utils.security import get_current_user
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/expo-registry",
    tags=["expo-registry"]
)

def process_booth_numbers_response(tracker_data: Dict[str, Any]) -> Dict[str, Any]:
    if isinstance(tracker_data, dict) and 'Booth_Number_Assigned' in tracker_data:
        booth_value = tracker_data['Booth_Number_Assigned']
        if booth_value is None:
            tracker_data['Booth_Number_Assigned'] = []
        elif isinstance(booth_value, str) and booth_value:
            try:
                tracker_data['Booth_Number_Assigned'] = [int(num.strip()) for num in booth_value.split(',') if num.strip().isdigit()]
            except (ValueError, AttributeError):
                tracker_data['Booth_Number_Assigned'] = []
        elif isinstance(booth_value, int):
            tracker_data['Booth_Number_Assigned'] = [booth_value]
    return tracker_data


@router.get("/details/{ExpoRegistryTrackerId}")
async def read_ExpoRegistry_details(
    ExpoRegistryTrackerId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        registry_details = await get_exporegistry_details(db, ExpoRegistryTrackerId=ExpoRegistryTrackerId)
        
        if not registry_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ExpoRegistry registry details not found for ID: {ExpoRegistryTrackerId}"
            )
            
        return registry_details
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error ExpoRegistry registry details: {str(e)}"
        )


@router.get("/", response_model=List[ExpoRegistryTracker])
async def get_all_Categories_data(
    event_code: Optional[str] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        results = await get_expo_registry_trackers(db, int(event_code))  # Convert to int
    elif sponsor_id:
        results = await get_trackers_by_sponsor(db, sponsor_id)
    else:
        results = await get_expo_registry_trackers(db, 0) 
    
    processed_results = []
    for result in results:
        result_dict = process_booth_numbers_response(result)
        processed_results.append(result_dict)
    
    return processed_results

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
        result = await create_expo_registry_tracker(db, tracker_data, ws_manager=manager)
        
        result_dict = result.__dict__
        result_dict = process_booth_numbers_response(result_dict)
        return result_dict
        
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
    
    tracker_dict = db_tracker.__dict__
    tracker_dict = process_booth_numbers_response(tracker_dict)
    return tracker_dict

@router.put("/{tracker_id}", response_model=ExpoRegistryTracker)
async def update_existing_expo_registry_tracker(
    tracker_id: int,
    tracker: ExpoRegistryTrackerUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_tracker = await update_expo_registry_tracker(db=db, tracker_id=tracker_id, tracker=tracker, ws_manager=manager)
    if updated_tracker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo registry tracker not found"
        )
    
    tracker_dict = updated_tracker.__dict__
    tracker_dict = process_booth_numbers_response(tracker_dict)
    return tracker_dict

@router.delete("/{tracker_id}")
async def delete_existing_expo_registry_tracker(
    tracker_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_expo_registry_tracker(db=db, tracker_id=tracker_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo registry tracker not found"
        )
    return {"message": "Expo registry tracker deleted successfully"}