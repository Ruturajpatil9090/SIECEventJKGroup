from sqlalchemy import select, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.event_super_model import EventSuper
from ..models.event_model import EventMaster
from ..schemas.event_super_schema import EventSuperCreate, EventSuperUpdate
from sqlalchemy import select, func
from typing import Optional
from ..websockets.connection_manager import ConnectionManager

async def get_event_super(db: AsyncSession, event_super_id: int):
    result = await db.execute(select(EventSuper).filter(EventSuper.EventSuperId == event_super_id))
    return result.scalars().first()

async def get_max_event_super_id(db: AsyncSession):
    result = await db.execute(select(func.max(EventSuper.EventSuperId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_event_super_by_name(db: AsyncSession, event_super_name: str):
    result = await db.execute(select(EventSuper).filter(EventSuper.EventSuper_Name == event_super_name))
    return result.scalars().first()

async def get_event_supers(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(EventSuper)
        .order_by(desc(EventSuper.EventSuperId))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_event_super(db: AsyncSession, event_super: EventSuperCreate,ws_manager: Optional[ConnectionManager] = None):
    db_event_super = EventSuper(**event_super.model_dump())
    db.add(db_event_super)
    await db.commit()
    await db.refresh(db_event_super)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_event_super")
    return db_event_super

async def update_event_super(db: AsyncSession, event_super_id: int, event_super: EventSuperUpdate,ws_manager: Optional[ConnectionManager] = None):
    update_data = event_super.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EventSuper)
        .where(EventSuper.EventSuperId == event_super_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_event_super")
    return await get_event_super(db, event_super_id)

# async def delete_event_super(db: AsyncSession, event_super_id: int):
#     db_event_super = await get_event_super(db, event_super_id)
#     if not db_event_super:
#         return False
    
#     await db.delete(db_event_super)
#     await db.commit()
#     return True


async def delete_event_super(db: AsyncSession, event_super_id: int,ws_manager: Optional[ConnectionManager] = None):
    db_event_super = await get_event_super(db, event_super_id)
    if not db_event_super:
        return False
    
    result = await db.execute(
        select(func.count(EventMaster.EventMasterId))
        .where(EventMaster.EventSuperId == event_super_id)
    )
    event_master_count = result.scalar()
    
    if event_master_count > 0:
        return False
    
    await db.delete(db_event_super)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_event_super")
    return True