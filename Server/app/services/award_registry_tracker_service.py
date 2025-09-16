from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from ..models.award_registry_tracker_model import AwardRegistryTracker
from ..schemas.award_registry_tracker_schema import AwardRegistryTrackerCreate, AwardRegistryTrackerUpdate
from typing import Optional
from ..websockets.connection_manager import ConnectionManager

async def get_award_registry_tracker(db: AsyncSession, tracker_id: int):
    result = await db.execute(
        select(AwardRegistryTracker)
        .filter(AwardRegistryTracker.AwardRegistryTrackerId == tracker_id)
    )
    return result.scalars().first()

async def get_max_award_tracker_id(db: AsyncSession):
    result = await db.execute(select(func.max(AwardRegistryTracker.AwardRegistryTrackerId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_award_registry_trackers(db: AsyncSession,event_code: int):
    query = text("""
SELECT  dbo.Eve_AwardMaster.Award_Name, dbo.Eve_AwardRegistryTracker.AwardRegistryTrackerId, dbo.Eve_AwardRegistryTracker.Event_Code, dbo.Eve_AwardRegistryTracker.SponsorMasterId, 
                         dbo.Eve_AwardRegistryTracker.Deliverabled_Code, dbo.Eve_AwardRegistryTracker.Deliverable_No, dbo.Eve_AwardRegistryTracker.Award_Code, dbo.Eve_EventMaster.EventMaster_Name, 
                         dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_DeliverablesMaster.Deliverables,dbo.Eve_AwardRegistryTracker.Doc_No
FROM            dbo.Eve_AwardRegistryTracker LEFT OUTER JOIN
                         dbo.Eve_AwardMaster ON dbo.Eve_AwardRegistryTracker.Award_Code = dbo.Eve_AwardMaster.AwardId INNER JOIN
                         dbo.Eve_SponsorMaster ON dbo.Eve_AwardRegistryTracker.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId INNER JOIN
                         dbo.Eve_EventMaster ON dbo.Eve_AwardRegistryTracker.Event_Code = dbo.Eve_EventMaster.EventMasterId INNER JOIN
                         dbo.Eve_DeliverablesMaster ON dbo.Eve_AwardRegistryTracker.Deliverabled_Code = dbo.Eve_DeliverablesMaster.id
                 WHERE        dbo.Eve_AwardRegistryTracker.Event_Code = :event_code
ORDER BY dbo.Eve_AwardRegistryTracker.AwardRegistryTrackerId DESC
    """)
    
    result = await db.execute(query, {"event_code": event_code})
    return result.mappings().all()

async def create_award_registry_tracker(db: AsyncSession, tracker: AwardRegistryTrackerCreate,ws_manager: Optional[ConnectionManager] = None):
    db_tracker = AwardRegistryTracker(**tracker.model_dump())
    db.add(db_tracker)
    await db.commit()
    await db.refresh(db_tracker)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_registry_trackers")
    return db_tracker

async def update_award_registry_tracker(db: AsyncSession, tracker_id: int, tracker: AwardRegistryTrackerUpdate,ws_manager: Optional[ConnectionManager] = None):
    update_data = tracker.model_dump(exclude_unset=True)
    
    await db.execute(
        update(AwardRegistryTracker)
        .where(AwardRegistryTracker.AwardRegistryTrackerId == tracker_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_registry_trackers")
    return await get_award_registry_tracker(db, tracker_id)

async def delete_award_registry_tracker(db: AsyncSession, tracker_id: int,ws_manager: Optional[ConnectionManager] = None):
    db_tracker = await get_award_registry_tracker(db, tracker_id)
    if not db_tracker:
        return False
    
    await db.delete(db_tracker)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_award_registry_trackers")
    return True

async def get_award_trackers_by_event_code(db: AsyncSession, event_code: int):
    result = await db.execute(
        select(AwardRegistryTracker)
        .filter(AwardRegistryTracker.Event_Code == event_code)
        .order_by(asc(AwardRegistryTracker.AwardRegistryTrackerId))
    )
    return result.scalars().all()

async def get_award_trackers_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(AwardRegistryTracker)
        .filter(AwardRegistryTracker.SponsorMasterId == sponsor_id)
        .order_by(asc(AwardRegistryTracker.AwardRegistryTrackerId))
    )
    return result.scalars().all()

async def get_award_trackers_by_deliverable(db: AsyncSession, deliverable_code: int):
    result = await db.execute(
        select(AwardRegistryTracker)
        .filter(AwardRegistryTracker.Deliverabled_Code == deliverable_code)
        .order_by(asc(AwardRegistryTracker.AwardRegistryTrackerId))
    )
    return result.scalars().all()