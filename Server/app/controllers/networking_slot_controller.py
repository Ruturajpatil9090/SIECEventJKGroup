from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.networking_slot_schema import (
    NetworkingSlot, 
    NetworkingSlotCreate, 
    NetworkingSlotUpdate
)
from ..services.networking_slot_service import (
    get_networking_slot,
    get_networking_slots,
    create_networking_slot,
    update_networking_slot,
    delete_networking_slot,
    get_max_networking_slot_id,
    get_networking_slots_by_event_code,
    get_networking_slots_by_sponsor,
    get_networking_slots_by_track,
    get_networking_slot_details,
    get_networking_slots_by_approval_status
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/networking-slots",
    tags=["networking-slots"]
)

@router.get("/", response_model=List[NetworkingSlot])
async def get_all_networking_slots(
    event_code: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    track: Optional[str] = Query(None),
    approval_status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        results = await get_networking_slots(db, event_code)
    elif sponsor_id:
        results = await get_networking_slots_by_sponsor(db, sponsor_id)
    elif track:
        results = await get_networking_slots_by_track(db, track)
    elif approval_status:
        results = await get_networking_slots_by_approval_status(db, approval_status)
    else:
        results = await get_networking_slots(db, None)
    
    return results

@router.get("/details/{NetworkingSlotId}")
async def read_NetworkingSlotId_details(
    NetworkingSlotId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        slot_details = await get_networking_slot_details(db, NetworkingSlotId=NetworkingSlotId)
        
        if not slot_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Networking slot details not found for ID: {NetworkingSlotId}"
            )
            
        return slot_details
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving networking slot details: {str(e)}"
        )

@router.get("/getlastNetworkingSlotId", response_model=int)
async def get_max_networking_slot_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_networking_slot_id(db)

@router.post("/", response_model=NetworkingSlot, status_code=status.HTTP_201_CREATED)
async def create_networking_slot_endpoint(
    slot_data: NetworkingSlotCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_networking_slot(db, slot_data, ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{slot_id}", response_model=NetworkingSlot)
async def read_networking_slot(
    slot_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_slot = await get_networking_slot(db, slot_id=slot_id)
    if db_slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Networking slot not found"
        )
    return db_slot

@router.put("/{slot_id}", response_model=NetworkingSlot)
async def update_existing_networking_slot(
    slot_id: int,
    slot: NetworkingSlotUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_slot = await update_networking_slot(db=db, slot_id=slot_id, slot=slot, ws_manager=manager)
    if updated_slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Networking slot not found"
        )
    return updated_slot

@router.delete("/{slot_id}")
async def delete_existing_networking_slot(
    slot_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_networking_slot(db=db, slot_id=slot_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Networking slot not found"
        )
    return {"message": "Networking slot deleted successfully"}