from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.secretarial_roundtable_schema import (
    SecretarialRoundTable, 
    SecretarialRoundTableCreate, 
    SecretarialRoundTableUpdate
)
from ..services.secretarial_roundtable_service import (
    get_secretarial_roundtable,
    get_secretarial_roundtables,
    create_secretarial_roundtable,
    update_secretarial_roundtable,
    delete_secretarial_roundtable,
    get_max_secretarial_roundtable_id,
    get_secretarial_roundtables_by_event_code,
    get_secretarial_roundtables_by_sponsor,
    get_secretarial_roundtables_by_track,
    get_secretarial_details
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/secretarial-roundtables",
    tags=["secretarial-roundtables"]
)

@router.get("/", response_model=List[SecretarialRoundTable])
async def get_all_secretarial_roundtables(
    event_code: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    track: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        results = await get_secretarial_roundtables_by_event_code(db, event_code)
    elif sponsor_id:
        results = await get_secretarial_roundtables_by_sponsor(db, sponsor_id)
    elif track:
        results = await get_secretarial_roundtables_by_track(db, track)
    else:
        results = await get_secretarial_roundtables(db, None)
    
    return results


@router.get("/details/{SecretarialRoundTableId}")
async def read_SecretarialRoundTableId_details(
    SecretarialRoundTableId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        roundtable_details = await get_secretarial_details(db, SecretarialRoundTableId=SecretarialRoundTableId)
        
        if not roundtable_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Secretarial roundtable details not found for ID: {SecretarialRoundTableId}"
            )
            
        return roundtable_details
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving secretarial roundtable details: {str(e)}"
        )

@router.get("/getlastSecretarialRoundTableId", response_model=int)
async def get_max_secretarial_roundtable_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_secretarial_roundtable_id(db)

@router.post("/", response_model=SecretarialRoundTable, status_code=status.HTTP_201_CREATED)
async def create_secretarial_roundtable_endpoint(
    roundtable_data: SecretarialRoundTableCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_secretarial_roundtable(db, roundtable_data, ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{roundtable_id}", response_model=SecretarialRoundTable)
async def read_secretarial_roundtable(
    roundtable_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_roundtable = await get_secretarial_roundtable(db, roundtable_id=roundtable_id)
    if db_roundtable is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Secretarial roundtable not found"
        )
    return db_roundtable

@router.put("/{roundtable_id}", response_model=SecretarialRoundTable)
async def update_existing_secretarial_roundtable(
    roundtable_id: int,
    roundtable: SecretarialRoundTableUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_roundtable = await update_secretarial_roundtable(db=db, roundtable_id=roundtable_id, roundtable=roundtable, ws_manager=manager)
    if updated_roundtable is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Secretarial roundtable not found"
        )
    return updated_roundtable

@router.delete("/{roundtable_id}")
async def delete_existing_secretarial_roundtable(
    roundtable_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_secretarial_roundtable(db=db, roundtable_id=roundtable_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Secretarial roundtable not found"
        )
    return {"message": "Secretarial roundtable deleted successfully"}