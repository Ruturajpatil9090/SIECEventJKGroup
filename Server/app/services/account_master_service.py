from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from ..models.account_master_model import AccountMaster

async def get_all_account_masters(db: AsyncSession):
    """
    Get all account masters with pagination
    """
    result = await db.execute(
        select(AccountMaster)
        .order_by(AccountMaster.accoid)
        
    )
    return result.scalars().all()

async def get_account_master_by_ac_code(db: AsyncSession, ac_code: int):
    """
    Get account master by Ac_Code
    """
    result = await db.execute(
        select(AccountMaster)
        .filter(AccountMaster.Ac_Code == ac_code)
    )
    return result.scalars().first()

async def search_account_masters_by_name(db: AsyncSession, name: str):
    """
    Search account masters by name (English or Regional)
    """
    result = await db.execute(
        select(AccountMaster)
        .filter(
            (AccountMaster.Ac_Name_E.ilike(f"%{name}%")) |
            (AccountMaster.Ac_Name_R.ilike(f"%{name}%"))
        )
        .order_by(AccountMaster.accoid)
    )
    return result.scalars().all()