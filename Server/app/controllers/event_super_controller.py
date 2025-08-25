from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.event_super_schema import EventSuper, EventSuperCreate, EventSuperUpdate
from ..services.event_super_service import (
    get_event_supers,
    get_event_super,
    create_event_super,
    update_event_super,
    delete_event_super,
    get_max_event_super_id
)
from ..models.database import get_db
from ..utils.security import get_current_user
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/event-supers",
    tags=["event-supers"]
)

@router.get("/", response_model=List[EventSuper])
async def read_event_supers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    event_supers = await get_event_supers(db, skip=skip, limit=limit)
    return event_supers

@router.get("/getlastEventSuperId", response_model=int)
async def get_max_event_super_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_event_super_id(db)

@router.post("/", response_model=EventSuper, status_code=status.HTTP_201_CREATED)
async def create_event_super_endpoint(
    event_super_data: EventSuperCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_event_super(db, event_super_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{event_super_id}", response_model=EventSuper)
async def read_event_super(
    event_super_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_event_super = await get_event_super(db, event_super_id=event_super_id)
    if db_event_super is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="EventSuper not found"
        )
    return db_event_super

@router.put("/{event_super_id}", response_model=EventSuper)
async def update_existing_event_super(
    event_super_id: int,
    event_super: EventSuperUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_event_super = await update_event_super(db=db, event_super_id=event_super_id, event_super=event_super,ws_manager=manager)
    if updated_event_super is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="EventSuper not found"
        )
    return updated_event_super

# @router.delete("/{event_super_id}")
# async def delete_existing_event_super(
#     event_super_id: int,
#     db: AsyncSession = Depends(get_db),
# ):
#     success = await delete_event_super(db=db, event_super_id=event_super_id)
#     if not success:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="EventSuper not found"
#         )
#     return {"message": "EventSuper deleted successfully"}


@router.delete("/{event_super_id}")
async def delete_event_super_endpoint(event_super_id: int, db: AsyncSession = Depends(get_db)):
    success = await delete_event_super(db, event_super_id,ws_manager=manager)
    
    if success:
        return {"message": "EventSuper deleted successfully"}
    else:
        event_super = await get_event_super(db, event_super_id)
        if event_super:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete this is referenced in Event Master."
            )
        else:
            raise HTTPException(
                status_code=404,
                detail="EventSuper not found"
            )