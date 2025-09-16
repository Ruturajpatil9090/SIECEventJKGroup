# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from typing import List
# from ..schemas.slot_master_schema import SlotMaster, SlotMasterCreate, SlotMasterUpdate
# from ..services.slot_master_service import (
#     get_slot_masters,
#     get_slot_master,
#     create_slot_master,
#     update_slot_master,
#     delete_slot_master,
#     get_max_slot_master_id,
#     get_slots_by_sponsor_id
# )
# from ..models.database import get_db
# from app.websockets.connection_manager import manager

# router = APIRouter(
#     prefix="/slot-masters",
#     tags=["slot-masters"]
# )

# @router.get("/", response_model=List[SlotMaster])
# async def read_slot_masters(
#     skip: int = 0,
#     limit: int = 100,
#     db: AsyncSession = Depends(get_db),
# ):
#     slot_masters = await get_slot_masters(db, skip=skip, limit=limit)
#     return slot_masters

# @router.get("/getlastSlotMasterId", response_model=int)
# async def get_max_slot_master_id_endpoint(
#     db: AsyncSession = Depends(get_db),
# ):
#     return await get_max_slot_master_id(db)

# @router.post("/", response_model=SlotMaster, status_code=status.HTTP_201_CREATED)
# async def create_slot_master_endpoint(
#     slot_master_data: SlotMasterCreate,
#     db: AsyncSession = Depends(get_db)
# ):
#     try:
#         return await create_slot_master(db, slot_master_data, ws_manager=manager)
#     except Exception as e:
#         await db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=str(e)
#         )

# @router.get("/{slot_master_id}", response_model=SlotMaster)
# async def read_slot_master(
#     slot_master_id: int,
#     db: AsyncSession = Depends(get_db),
# ):
#     db_slot_master = await get_slot_master(db, slot_master_id=slot_master_id)
#     if db_slot_master is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="SlotMaster not found"
#         )
#     return db_slot_master

# @router.get("/by-sponsor/{sponsor_master_id}", response_model=List[SlotMaster])
# async def read_slots_by_sponsor(
#     sponsor_master_id: int,
#     db: AsyncSession = Depends(get_db),
# ):
#     slots = await get_slots_by_sponsor_id(db, sponsor_master_id=sponsor_master_id)
#     return slots

# @router.put("/{slot_master_id}", response_model=SlotMaster)
# async def update_existing_slot_master(
#     slot_master_id: int,
#     slot_master: SlotMasterUpdate,
#     db: AsyncSession = Depends(get_db),
# ):
#     updated_slot_master = await update_slot_master(
#         db=db, 
#         slot_master_id=slot_master_id, 
#         slot_master=slot_master,
#         ws_manager=manager
#     )
#     if updated_slot_master is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="SlotMaster not found"
#         )
#     return updated_slot_master

# @router.delete("/{slot_master_id}")
# async def delete_existing_slot_master(
#     slot_master_id: int,
#     db: AsyncSession = Depends(get_db),
# ):
#     success = await delete_slot_master(db=db, slot_master_id=slot_master_id, ws_manager=manager)
#     if not success:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="SlotMaster not found"
#         )
#     return {"message": "SlotMaster deleted successfully"}















from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.slot_master_schema import SlotMaster, SlotMasterCreate, SlotMasterUpdate
from ..services.slot_master_service import (
    get_slot_masters,
    get_slot_master,
    create_slot_master,
    update_slot_master,
    delete_slot_master,
    get_max_slot_master_id,
    get_slots_by_sponsor_id
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/slot-masters",
    tags=["slot-masters"]
)

@router.get("/", response_model=List[SlotMaster])
async def read_slot_masters(
    skip: int = 0,
    limit: int = 100,
    event_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    slot_masters = await get_slot_masters(db, skip=skip, limit=limit, event_code=event_code)
    return slot_masters

@router.get("/getlastSlotMasterId", response_model=int)
async def get_max_slot_master_id_endpoint(
    event_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await get_max_slot_master_id(db, event_code=event_code)

@router.post("/", response_model=SlotMaster, status_code=status.HTTP_201_CREATED)
async def create_slot_master_endpoint(
    slot_master_data: SlotMasterCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_slot_master(db, slot_master_data, ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{slot_master_id}", response_model=SlotMaster)
async def read_slot_master(
    slot_master_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_slot_master = await get_slot_master(db, slot_master_id=slot_master_id)
    if db_slot_master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SlotMaster not found"
        )
    return db_slot_master

@router.get("/by-sponsor/{sponsor_master_id}", response_model=List[SlotMaster])
async def read_slots_by_sponsor(
    sponsor_master_id: int,
    event_code: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    slots = await get_slots_by_sponsor_id(db, sponsor_master_id=sponsor_master_id, event_code=event_code)
    return slots

# @router.put("/{slot_master_id}", response_model=SlotMaster)
# async def update_existing_slot_master(
#     slot_master_id: int,
#     slot_master: SlotMasterUpdate,
#     db: AsyncSession = Depends(get_db),
# ):
#     updated_slot_master = await update_slot_master(
#         db=db, 
#         slot_master_id=slot_master_id, 
#         slot_master=slot_master,
#         ws_manager=manager
#     )
#     if updated_slot_master is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="SlotMaster not found"
#         )
#     return updated_slot_master


@router.put("/{event_code}/{ID}", response_model=SlotMaster)
async def update_existing_slot_master(
    event_code: str,
    ID: int,
    slot_master: SlotMasterUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_slot_master = await update_slot_master(
        db=db, 
        event_code=event_code,
        ID=ID,
        slot_master=slot_master,
        ws_manager=manager
    )
    if updated_slot_master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SlotMaster not found"
        )
    return updated_slot_master

@router.delete("/{slot_master_id}")
async def delete_existing_slot_master(
    slot_master_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_slot_master(db=db, slot_master_id=slot_master_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SlotMaster not found"
        )
    return {"message": "SlotMaster deleted successfully"}