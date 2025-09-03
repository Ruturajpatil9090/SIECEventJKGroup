from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..models.database import get_db
from ..services.account_master_service import (
    get_all_account_masters,
    get_account_master_by_ac_code,
    search_account_masters_by_name
)
from ..schemas.account_master_schema import AccountMaster

router = APIRouter(
    prefix="/account-masters",
    tags=["account-masters"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[AccountMaster])
async def get_all_accounts(
    db: AsyncSession = Depends(get_db)
):
    accounts = await get_all_account_masters(db)
    return accounts

@router.get("/by-ac-code/{ac_code}", response_model=AccountMaster)
async def get_account_by_ac_code(
    ac_code: int,
    db: AsyncSession = Depends(get_db)
):
    account = await get_account_master_by_ac_code(db, ac_code)
    if account is None:
        raise HTTPException(
            status_code=404,
            detail=f"Account with Ac_Code {ac_code} not found"
        )
    return account

@router.get("/search", response_model=List[AccountMaster])
async def search_accounts_by_name(
    name: str = Query(..., min_length=1, description="Name to search for"),
    db: AsyncSession = Depends(get_db)
):
    accounts = await search_account_masters_by_name(db, name)
    return accounts