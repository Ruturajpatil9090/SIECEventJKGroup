from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.schemas.Award_master_schemas import AwardBase, AwardCreate, AwardUpdate,Award
from app.services.Award_master_services import (
    get_Award_master,
    get_Award_master_by_id,
    get_max_Award_master,
    create_Award_Master,
    update_Award_Master,
    delete_Award_Master
)
from app.models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/award",
    tags=["Award"]
)

@router.get("/", response_model=List[Award])
async def read_awards(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    return await get_Award_master(db, skip=skip, limit=limit)

@router.get("/{award_id}", response_model=AwardBase)
async def read_award(award_id: int, db: AsyncSession = Depends(get_db)):
    db_award = await get_Award_master_by_id(db, award_id)
    if not db_award:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award not found")
    return db_award


@router.get("/max/id")
async def read_max_award_id(db: AsyncSession = Depends(get_db)):
    return  await get_max_Award_master(db)


@router.post("/add", response_model=AwardBase, status_code=status.HTTP_201_CREATED)
async def create_award(award: AwardCreate, db: AsyncSession = Depends(get_db)):
    return await create_Award_Master(db=db, award=award,ws_manager=manager)


@router.put("/{award_id}", response_model=AwardBase)
async def update_award(award_id: int, award: AwardUpdate, db: AsyncSession = Depends(get_db)):
    db_award = await update_Award_Master(db=db, award_id=award_id, award=award,ws_manager=manager)
    if not db_award:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award not found")
    return db_award


@router.delete("/{award_id}", response_model=AwardBase)
async def delete_award(award_id: int, db: AsyncSession = Depends(get_db)):
    db_award = await delete_Award_Master(db=db, award_id=award_id,ws_manager=manager)
    if not db_award:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Award not found")
    return db_award
