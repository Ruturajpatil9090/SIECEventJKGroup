# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, update, asc, func,text
# from ..models.expo_registry_tracker_model import ExpoRegistryTracker
# from ..schemas.expo_registry_tracker_schema import ExpoRegistryTrackerCreate, ExpoRegistryTrackerUpdate
# from typing import Optional
# from ..websockets.connection_manager import ConnectionManager

# async def get_expo_registry_tracker(db: AsyncSession, tracker_id: int):
#     result = await db.execute(
#         select(ExpoRegistryTracker)
#         .filter(ExpoRegistryTracker.ExpoRegistryTrackerId == tracker_id)
#     )
#     return result.scalars().first()

# async def get_max_tracker_id(db: AsyncSession):
#     result = await db.execute(select(func.max(ExpoRegistryTracker.ExpoRegistryTrackerId)))
#     max_id = result.scalar()
#     return max_id if max_id is not None else 0

# # async def get_expo_registry_trackers(db: AsyncSession, skip: int = 0, limit: int = 100):
# #     result = await db.execute(
# #         select(ExpoRegistryTracker)
# #         .order_by(asc(ExpoRegistryTracker.ExpoRegistryTrackerId))
# #         .offset(skip)
# #         .limit(limit)
# #     )
# #     return result.scalars().all()


# async def get_expo_registry_trackers(db: AsyncSession):
#     query = text("""
# SELECT        dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_EventMaster.EventMaster_Name, dbo.Eve_DeliverablesMaster.Deliverables, dbo.Eve_ExpoRegistryTracker.*
# FROM            dbo.Eve_ExpoRegistryTracker INNER JOIN
#                          dbo.Eve_SponsorMaster ON dbo.Eve_ExpoRegistryTracker.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId INNER JOIN
#                          dbo.Eve_EventMaster ON dbo.Eve_ExpoRegistryTracker.Event_Code = dbo.Eve_EventMaster.EventMasterId INNER JOIN
#                          dbo.Eve_DeliverablesMaster ON dbo.Eve_ExpoRegistryTracker.Deliverabled_Code = dbo.Eve_DeliverablesMaster.id
#                  order by dbo.Eve_ExpoRegistryTracker.ExpoRegistryTrackerId desc
#     """)
    
#     result = await db.execute(query)
#     return result.mappings().all()

# async def create_expo_registry_tracker(db: AsyncSession, tracker: ExpoRegistryTrackerCreate,ws_manager: Optional[ConnectionManager] = None):
#     db_tracker = ExpoRegistryTracker(**tracker.model_dump())
#     db.add(db_tracker)
#     await db.commit()
#     await db.refresh(db_tracker)
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_expo_registry_trackers")
#     return db_tracker

# async def update_expo_registry_tracker(db: AsyncSession, tracker_id: int, tracker: ExpoRegistryTrackerUpdate,ws_manager: Optional[ConnectionManager] = None):
#     update_data = tracker.model_dump(exclude_unset=True)
    
#     await db.execute(
#         update(ExpoRegistryTracker)
#         .where(ExpoRegistryTracker.ExpoRegistryTrackerId == tracker_id)
#         .values(**update_data)
#     )
#     await db.commit()
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_expo_registry_trackers")
#     return await get_expo_registry_tracker(db, tracker_id)

# async def delete_expo_registry_tracker(db: AsyncSession, tracker_id: int,ws_manager: Optional[ConnectionManager] = None):
#     db_tracker = await get_expo_registry_tracker(db, tracker_id)
#     if not db_tracker:
#         return False
    
#     await db.delete(db_tracker)
#     await db.commit()
#     if ws_manager:
#         await ws_manager.broadcast(message="refresh_expo_registry_trackers")
#     return True

# async def get_trackers_by_event_code(db: AsyncSession, event_code: str):
#     result = await db.execute(
#         select(ExpoRegistryTracker)
#         .filter(ExpoRegistryTracker.Event_Code == event_code)
#         .order_by(asc(ExpoRegistryTracker.ExpoRegistryTrackerId))
#     )
#     return result.scalars().all()

# async def get_trackers_by_sponsor(db: AsyncSession, sponsor_id: int):
#     result = await db.execute(
#         select(ExpoRegistryTracker)
#         .filter(ExpoRegistryTracker.SponsorMasterId == sponsor_id)
#         .order_by(asc(ExpoRegistryTracker.ExpoRegistryTrackerId))
#     )
#     return result.scalars().all()


















from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from ..models.expo_registry_tracker_model import ExpoRegistryTracker
from ..schemas.expo_registry_tracker_schema import ExpoRegistryTrackerCreate, ExpoRegistryTrackerUpdate
from typing import Optional, List
from ..websockets.connection_manager import ConnectionManager

async def get_expo_registry_tracker(db: AsyncSession, tracker_id: int):
    result = await db.execute(
        select(ExpoRegistryTracker)
        .filter(ExpoRegistryTracker.ExpoRegistryTrackerId == tracker_id)
    )
    return result.scalars().first()

async def get_max_tracker_id(db: AsyncSession):
    result = await db.execute(select(func.max(ExpoRegistryTracker.ExpoRegistryTrackerId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

# async def get_expo_registry_trackers(db: AsyncSession,event_code: int):
#     query = text("""
# SELECT   dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_EventMaster.EventMaster_Name, dbo.Eve_DeliverablesMaster.Deliverables, dbo.Eve_ExpoRegistryTracker.*
# FROM            dbo.Eve_ExpoRegistryTracker INNER JOIN
#                          dbo.Eve_SponsorMaster ON dbo.Eve_ExpoRegistryTracker.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId INNER JOIN
#                          dbo.Eve_EventMaster ON dbo.Eve_ExpoRegistryTracker.Event_Code = dbo.Eve_EventMaster.EventMasterId INNER JOIN
#                          dbo.Eve_DeliverablesMaster ON dbo.Eve_ExpoRegistryTracker.Deliverabled_Code = dbo.Eve_DeliverablesMaster.id
#                  	where dbo.Eve_ExpoRegistryTracker.Event_Code = :event_code
#                  order by dbo.Eve_ExpoRegistryTracker.ExpoRegistryTrackerId desc
#     """)
    
#     result = await db.execute(query,{"event_code": event_code})
#     return result.mappings().all()



async def get_expo_registry_trackers(db: AsyncSession, event_code: int):
    query = text("""
SELECT   dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_EventMaster.EventMaster_Name, 
         dbo.Eve_DeliverablesMaster.Deliverables, dbo.Eve_ExpoRegistryTracker.*
FROM     dbo.Eve_ExpoRegistryTracker 
INNER JOIN dbo.Eve_SponsorMaster ON dbo.Eve_ExpoRegistryTracker.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId 
INNER JOIN dbo.Eve_EventMaster ON dbo.Eve_ExpoRegistryTracker.Event_Code = dbo.Eve_EventMaster.EventMasterId 
INNER JOIN dbo.Eve_DeliverablesMaster ON dbo.Eve_ExpoRegistryTracker.Deliverabled_Code = dbo.Eve_DeliverablesMaster.id
WHERE    dbo.Eve_ExpoRegistryTracker.Event_Code = :event_code
ORDER BY dbo.Eve_ExpoRegistryTracker.ExpoRegistryTrackerId DESC
""")
    
    result = await db.execute(query, {"event_code": event_code})
    rows = result.fetchall()
    columns = result.keys()
    return [dict(zip(columns, row)) for row in rows]


async def create_expo_registry_tracker(db: AsyncSession, tracker: ExpoRegistryTrackerCreate, ws_manager: Optional[ConnectionManager] = None):
    tracker_data = tracker.model_dump()
    
    if 'Booth_Number_Assigned' in tracker_data and isinstance(tracker_data['Booth_Number_Assigned'], list):
        tracker_data['Booth_Number_Assigned'] = ','.join(map(str, tracker_data['Booth_Number_Assigned']))
    
    db_tracker = ExpoRegistryTracker(**tracker_data)
    db.add(db_tracker)
    await db.commit()
    await db.refresh(db_tracker)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_expo_registry_trackers")
    return db_tracker

async def update_expo_registry_tracker(db: AsyncSession, tracker_id: int, tracker: ExpoRegistryTrackerUpdate, ws_manager: Optional[ConnectionManager] = None):
    update_data = tracker.model_dump(exclude_unset=True)
    
    if 'Booth_Number_Assigned' in update_data and isinstance(update_data['Booth_Number_Assigned'], list):
        update_data['Booth_Number_Assigned'] = ','.join(map(str, update_data['Booth_Number_Assigned']))
    
    await db.execute(
        update(ExpoRegistryTracker)
        .where(ExpoRegistryTracker.ExpoRegistryTrackerId == tracker_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_expo_registry_trackers")
    return await get_expo_registry_tracker(db, tracker_id)

async def delete_expo_registry_tracker(db: AsyncSession, tracker_id: int, ws_manager: Optional[ConnectionManager] = None):
    db_tracker = await get_expo_registry_tracker(db, tracker_id)
    if not db_tracker:
        return False
    
    await db.delete(db_tracker)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_expo_registry_trackers")
    return True

async def get_trackers_by_event_code(db: AsyncSession, event_code: str):
    result = await db.execute(
        select(ExpoRegistryTracker)
        .filter(ExpoRegistryTracker.Event_Code == event_code)
        .order_by(asc(ExpoRegistryTracker.ExpoRegistryTrackerId))
    )
    return result.scalars().all()

async def get_trackers_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(ExpoRegistryTracker)
        .filter(ExpoRegistryTracker.SponsorMasterId == sponsor_id)
        .order_by(asc(ExpoRegistryTracker.ExpoRegistryTrackerId))
    )
    return result.scalars().all()

def parse_booth_numbers(booth_numbers_str: Optional[str]) -> List[int]:
    if not booth_numbers_str:
        return []
    try:
        return [int(num.strip()) for num in booth_numbers_str.split(',') if num.strip().isdigit()]
    except (ValueError, AttributeError):
        return []

def format_booth_numbers(booth_numbers: List[int]) -> str:
    return ','.join(map(str, booth_numbers))