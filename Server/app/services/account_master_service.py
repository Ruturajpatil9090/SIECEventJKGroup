from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from ..models.account_master_model import AccountMaster

async def get_all_account_masters(db: AsyncSession):
    result = await db.execute(
        select(AccountMaster)
        .filter(AccountMaster.Ac_type.in_(['P', 'M'])) 
        .order_by(AccountMaster.accoid)  
    )
    return result.scalars().all()

# async def get_all_account_masters(db: AsyncSession):
#     result = await db.execute(
#         select(
#             AccountMaster.accoid,
#             AccountMaster.Ac_Code,
#             AccountMaster.Ac_Name_E,
#             AccountMaster.Address_E,
#             AccountMaster.Pincode,
#             AccountMaster.Gst_No,
#             AccountMaster.Email_Id,
#             AccountMaster.Short_Name,
#             AccountMaster.CompanyPan,
#             AccountMaster.whatsup_no
#         )
#         .filter(AccountMaster.Ac_type.in_(['P', 'M']))
#         .order_by(AccountMaster.accoid)
#     )
#     return result.all()

async def get_account_master_by_ac_code(db: AsyncSession, ac_code: int):
    result = await db.execute(
        select(AccountMaster)
        .filter(AccountMaster.Ac_Code == ac_code)
    )
    return result.scalars().first()

async def search_account_masters_by_name(db: AsyncSession, name: str):
    result = await db.execute(
        select(AccountMaster)
        .filter(
            (AccountMaster.Ac_Name_E.ilike(f"%{name}%")) |
            (AccountMaster.Ac_Name_R.ilike(f"%{name}%"))
        )
        .order_by(AccountMaster.accoid)
    )
    return result.scalars().all()