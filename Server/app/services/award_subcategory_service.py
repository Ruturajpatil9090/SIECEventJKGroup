from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, text
from typing import Optional, List
from ..models.award_subcategory_model import EveAwardSubCategoryMaster
from ..schemas.award_subcategory_schema import AwardSubCategoryCreate, AwardSubCategoryUpdate
from ..websockets.connection_manager import ConnectionManager

async def get_award_subcategory(db: AsyncSession, subcategory_id: int):
    result = await db.execute(
        select(EveAwardSubCategoryMaster)
        .filter(EveAwardSubCategoryMaster.AwardSubCategoryId == subcategory_id)
    )
    return result.scalars().first()

async def get_max_award_subcategory_id(db: AsyncSession):
    result = await db.execute(select(func.max(EveAwardSubCategoryMaster.AwardSubCategoryId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_all_award_subcategories(db: AsyncSession, award_id: Optional[int] = None):
    query = text("""
        SELECT 
            am.Award_Name,
            sc.AwardSubCategoryName,
            sc.AwardSubCategoryId,
            sc.AwardId
        FROM Eve_AwardMaster am
        INNER JOIN Eve_AwardSubCategoryMaster sc ON am.AwardId = sc.AwardId
        ORDER BY sc.AwardSubCategoryId desc
    """)
    
    result = await db.execute(query)
    return result.mappings().all()

async def get_award_subcategories_with_details(db: AsyncSession):
    query = text("""
        SELECT 
            am.Award_Name,
            sc.AwardSubCategoryName,
            sc.AwardSubCategoryId,
            sc.AwardId
        FROM Eve_AwardMaster am
        INNER JOIN Eve_AwardSubCategoryMaster sc ON am.AwardId = sc.AwardId
        ORDER BY sc.AwardSubCategoryId ASC
    """)
    
    result = await db.execute(query)
    return result.mappings().all()

async def create_award_subcategory(db: AsyncSession, subcategory: AwardSubCategoryCreate, ws_manager: Optional[ConnectionManager] = None):
    db_subcategory = EveAwardSubCategoryMaster(**subcategory.model_dump())
    db.add(db_subcategory)
    await db.commit()
    await db.refresh(db_subcategory)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_subcategories")
    return db_subcategory

async def update_award_subcategory(db: AsyncSession, subcategory_id: int, subcategory: AwardSubCategoryUpdate, ws_manager: Optional[ConnectionManager] = None):
    update_data = subcategory.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EveAwardSubCategoryMaster)
        .where(EveAwardSubCategoryMaster.AwardSubCategoryId == subcategory_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_award_subcategories")

    return await get_award_subcategory(db, subcategory_id)

async def delete_award_subcategory(db: AsyncSession, subcategory_id: int, ws_manager: Optional[ConnectionManager] = None):
    db_subcategory = await get_award_subcategory(db, subcategory_id)
    if not db_subcategory:
        return False
    
    await db.delete(db_subcategory)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_award_subcategories")
    return True

async def get_subcategories_by_award_id(db: AsyncSession, award_id: int):
    query = text("""
        SELECT 
            am.Award_Name,
            sc.AwardSubCategoryName,
            sc.AwardSubCategoryId,
            sc.AwardId
        FROM Eve_AwardMaster am
        INNER JOIN Eve_AwardSubCategoryMaster sc ON am.AwardId = sc.AwardId
        WHERE sc.AwardId = :award_id
        ORDER BY sc.AwardSubCategoryId ASC
    """)
    
    result = await db.execute(query, {'award_id': award_id})
    return result.mappings().all()