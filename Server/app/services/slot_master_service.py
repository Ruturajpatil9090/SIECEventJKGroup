# from sqlalchemy import select, update, asc, func
# from sqlalchemy.ext.asyncio import AsyncSession
# from ..models.slot_master_model import SlotMaster
# from ..schemas.slot_master_schema import SlotMasterCreate, SlotMasterUpdate
# from typing import Optional
# from ..websockets.connection_manager import ConnectionManager

# async def get_slot_master(db: AsyncSession, slot_master_id: int):
#     result = await db.execute(
#         select(SlotMaster)
#         .filter(SlotMaster.SlotMasterId == slot_master_id)
#     )
#     return result.scalars().first()

# async def get_max_slot_master_id(db: AsyncSession):
#     result = await db.execute(select(func.max(SlotMaster.SlotMasterId)))
#     max_id = result.scalar()
#     return max_id if max_id is not None else 0

# async def get_slot_master_by_name(db: AsyncSession, slot_master_name: str):
#     result = await db.execute(
#         select(SlotMaster)
#         .filter(SlotMaster.SlotMaster_Name == slot_master_name)
#     )
#     return result.scalars().first()

# async def get_slot_masters(db: AsyncSession, skip: int = 0, limit: int = 100):
#     result = await db.execute(
#         select(SlotMaster)
#         .order_by(asc(SlotMaster.SlotMasterId))
#         .offset(skip)
#         .limit(limit)
#     )
#     return result.scalars().all()

# async def get_slots_by_sponsor_id(db: AsyncSession, sponsor_master_id: int):
#     result = await db.execute(
#         select(SlotMaster)
#         .filter(SlotMaster.SponsorMasterId == sponsor_master_id)
#     )
#     return result.scalars().all()

# async def create_slot_master(db: AsyncSession, slot_master: SlotMasterCreate, ws_manager: Optional[ConnectionManager] = None):
#     db_slot_master = SlotMaster(**slot_master.model_dump())
#     db.add(db_slot_master)
#     await db.commit()
#     await db.refresh(db_slot_master)
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_slot_master")
#     return db_slot_master

# async def update_slot_master(db: AsyncSession, slot_master_id: int, slot_master: SlotMasterUpdate, ws_manager: Optional[ConnectionManager] = None):
#     update_data = slot_master.model_dump(exclude_unset=True)
    
#     await db.execute(
#         update(SlotMaster)
#         .where(SlotMaster.SlotMasterId == slot_master_id)
#         .values(**update_data)
#     )
#     await db.commit()
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_slot_master")
#     return await get_slot_master(db, slot_master_id)

# async def delete_slot_master(db: AsyncSession, slot_master_id: int, ws_manager: Optional[ConnectionManager] = None):
#     db_slot_master = await get_slot_master(db, slot_master_id)
#     if not db_slot_master:
#         return False
    
#     await db.delete(db_slot_master)
#     await db.commit()
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_slot_master")
#     return True











from sqlalchemy import select, update, asc, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.slot_master_model import SlotMaster
from ..schemas.slot_master_schema import SlotMasterCreate, SlotMasterUpdate
from typing import Optional
from ..websockets.connection_manager import ConnectionManager

async def get_slot_master(db: AsyncSession, slot_master_id: int):
    result = await db.execute(
        select(SlotMaster)
        .filter(SlotMaster.SlotMasterId == slot_master_id)
    )
    return result.scalars().first()

async def get_max_slot_master_id(db: AsyncSession, event_code: Optional[str] = None):
    query = select(func.max(SlotMaster.SlotMasterId))
    if event_code:
        query = query.filter(SlotMaster.Event_Code == event_code)
    result = await db.execute(query)
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_slot_master_by_name(db: AsyncSession, slot_master_name: str, event_code: Optional[str] = None):
    query = select(SlotMaster).filter(SlotMaster.SlotMaster_Name == slot_master_name)
    if event_code:
        query = query.filter(SlotMaster.Event_Code == event_code)
    result = await db.execute(query)
    return result.scalars().first()

async def get_slot_masters(db: AsyncSession, skip: int = 0, limit: int = 100, event_code: Optional[str] = None):
    query = select(SlotMaster).order_by(asc(SlotMaster.SlotMasterId))
    if event_code:
        query = query.filter(SlotMaster.Event_Code == event_code)
    result = await db.execute(
        query.offset(skip).limit(limit)
    )
    return result.scalars().all()

async def get_slots_by_sponsor_id(db: AsyncSession, sponsor_master_id: int, event_code: Optional[str] = None):
    query = select(SlotMaster).filter(SlotMaster.SponsorMasterId == sponsor_master_id)
    if event_code:
        query = query.filter(SlotMaster.Event_Code == event_code)
    result = await db.execute(query)
    return result.scalars().all()

async def create_slot_master(db: AsyncSession, slot_master: SlotMasterCreate, ws_manager: Optional[ConnectionManager] = None):
    db_slot_master = SlotMaster(**slot_master.model_dump())
    db.add(db_slot_master)
    await db.commit()
    await db.refresh(db_slot_master)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_slot_master")
    return db_slot_master

# async def update_slot_master(db: AsyncSession, slot_master_id: int, slot_master: SlotMasterUpdate, ws_manager: Optional[ConnectionManager] = None):
#     update_data = slot_master.model_dump(exclude_unset=True)
    
#     await db.execute(
#         update(SlotMaster)
#         .where(SlotMaster.SlotMasterId == slot_master_id)
#         .values(**update_data)
#     )
#     await db.commit()
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_slot_master")
#     return await get_slot_master(db, slot_master_id)


async def get_slot_master_by_event_and_id(db: AsyncSession, event_code: str, ID: int):
    result = await db.execute(
        select(SlotMaster)
        .filter(SlotMaster.Event_Code == event_code, SlotMaster.ID == ID)
    )
    return result.scalars().first()

async def update_slot_master(db: AsyncSession, event_code: str, ID: int, slot_master: SlotMasterUpdate, ws_manager: Optional[ConnectionManager] = None):
    update_data = slot_master.model_dump(exclude_unset=True)
    
    result = await db.execute(
        update(SlotMaster)
        .where(SlotMaster.Event_Code == event_code, SlotMaster.ID == ID)
        .values(**update_data)
    )
    await db.commit()
    
    if result.rowcount == 0:
        return None
        
    if ws_manager:
        await ws_manager.broadcast(message="refresh_slot_master")
        
    return await get_slot_master_by_event_and_id(db, event_code, ID)

async def delete_slot_master(db: AsyncSession, slot_master_id: int, ws_manager: Optional[ConnectionManager] = None):
    db_slot_master = await get_slot_master(db, slot_master_id)
    if not db_slot_master:
        return False
    
    await db.delete(db_slot_master)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_slot_master")
    return True