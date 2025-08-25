from sqlalchemy import desc, select, update, delete, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.Award_master_model import AwardMaster
from app.schemas.Award_master_schemas import AwardUpdate, AwardCreate
from typing import Optional
from ..websockets.connection_manager import ConnectionManager


async def get_Award_master_by_id(db: AsyncSession, award_id: int):
    result = await db.execute(select(AwardMaster).where(AwardMaster.AwardId == award_id))
    return result.scalar_one_or_none()


async def get_max_Award_master(db: AsyncSession):
    result = await db.execute(select(func.max(AwardMaster.AwardId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0


async def get_Award_master(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(AwardMaster)
         .order_by(desc(AwardMaster.AwardId))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def create_Award_Master(db: AsyncSession, award: AwardCreate,ws_manager: Optional[ConnectionManager] = None):
    max_id = await get_max_Award_master(db)
    new_id = max_id + 1

    db_award = AwardMaster(
        AwardId=new_id,
        Award_Name=award.Award_Name,
        EventSuperId=award.EventSuperId
    )
    db.add(db_award)
    await db.commit()
    await db.refresh(db_award)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_master")
    return db_award


async def update_Award_Master(db: AsyncSession, award_id: int, award: AwardUpdate,ws_manager: Optional[ConnectionManager] = None):
    update_data = award.model_dump(exclude_unset=True)

    await db.execute(
        update(AwardMaster)
        .where(AwardMaster.AwardId == award_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_master")

    return await get_Award_master_by_id(db, award_id)



async def delete_Award_Master(db: AsyncSession, award_id: int,ws_manager: Optional[ConnectionManager] = None):
    db_award = await get_Award_master_by_id(db, award_id)
    if not db_award:
        return None

    await db.delete(db_award)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_master")
    return db_award
