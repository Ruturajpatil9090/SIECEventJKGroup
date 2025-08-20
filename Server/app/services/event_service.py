from sqlalchemy import select, update, asc,text
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.event_model import EventMaster
from ..schemas.event_schema import EventMasterCreate, EventMasterUpdate
from sqlalchemy import select, func

async def get_event_master(db: AsyncSession, event_master_id: int):
    result = await db.execute(
        select(EventMaster)
        .filter(EventMaster.EventMasterId == event_master_id)
    )
    return result.scalars().first()

async def get_max_event_master_id(db: AsyncSession):
    result = await db.execute(select(func.max(EventMaster.EventMasterId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_event_master_by_name(db: AsyncSession, event_master_name: str):
    result = await db.execute(
        select(EventMaster)
        .filter(EventMaster.EventMaster_Name == event_master_name)
    )
    return result.scalars().first()


async def get_all_events(db: AsyncSession):
    query = text("""
             SELECT dbo.Eve_EventSuperMaster.EventSuper_Name, dbo.Eve_EventMaster.*
             FROM dbo.Eve_EventMaster INNER JOIN
             dbo.Eve_EventSuperMaster ON dbo.Eve_EventMaster.EventSuperId = dbo.Eve_EventSuperMaster.EventSuperId order by dbo.Eve_EventMaster.EventMasterId desc
    """)
    
    result = await db.execute(query)
    return result.mappings().all()

async def get_event_masters(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(EventMaster)
        .order_by(asc(EventMaster.EventMasterId))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_event_master(db: AsyncSession, event_master: EventMasterCreate):
    db_event_master = EventMaster(**event_master.model_dump())
    db.add(db_event_master)
    await db.commit()
    await db.refresh(db_event_master)
    return db_event_master

async def update_event_master(db: AsyncSession, event_master_id: int, event_master: EventMasterUpdate):
    update_data = event_master.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EventMaster)
        .where(EventMaster.EventMasterId == event_master_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_event_master(db, event_master_id)

async def delete_event_master(db: AsyncSession, event_master_id: int):
    db_event_master = await get_event_master(db, event_master_id)
    if not db_event_master:
        return False
    
    await db.delete(db_event_master)
    await db.commit()
    return True

async def get_events_by_super_id(db: AsyncSession, event_super_id: int):
    result = await db.execute(
        select(EventMaster)
        .filter(EventMaster.EventSuperId == event_super_id)
    )
    return result.scalars().all()