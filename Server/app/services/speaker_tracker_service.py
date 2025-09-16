from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from typing import Optional
from ..models.speaker_tracker_model import EveSpeakerTracker
from ..schemas.speaker_tracker_schema import SpeakerTrackerCreate, SpeakerTrackerUpdate
from ..websockets.connection_manager import ConnectionManager

async def get_speaker_tracker(db: AsyncSession, tracker_id: int):
    result = await db.execute(
        select(EveSpeakerTracker)
        .filter(EveSpeakerTracker.SpeakerTrackerId == tracker_id)
    )
    return result.scalars().first()

async def get_max_speaker_tracker_id(db: AsyncSession):
    result = await db.execute(select(func.max(EveSpeakerTracker.SpeakerTrackerId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_speaker_trackers(db: AsyncSession,event_code: Optional[int] = None):
    query = text("""
        SELECT 
            st.SpeakerTrackerId, 
            st.Event_Code, 
            st.SponsorMasterId, 
            st.Speaker_Name, 
            st.Designation, 
            st.Mobile_No, 
            st.Email_Address, 
            st.Speaker_Bio, 
            st.Speaking_Date, 
            st.Track,
            st.Doc_No,
            em.EventMaster_Name,
            sm.Sponsor_Name,
                 st.Pitch_session_Topic
        FROM Eve_SpeakerTracker st
        LEFT JOIN Eve_EventMaster em ON st.Event_Code = em.EventMasterId
        LEFT JOIN Eve_SponsorMaster sm ON st.SponsorMasterId = sm.SponsorMasterId
        WHERE st.Event_Code = :event_code
        ORDER BY st.SpeakerTrackerId DESC
    """)
    
    result = await db.execute(query, {'event_code': event_code})
    return result.mappings().all()


#GET All Speaker Details with SpeakerTrackerId
async def get_speakertrackers_details(db: AsyncSession, SpeakerTrackerId: Optional[int] = None):
    query = text("""
SELECT        dbo.Eve_EventMaster.EventMaster_Name, dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_SpeakerTracker.Speaker_Name, dbo.Eve_SpeakerTracker.Designation, dbo.Eve_SpeakerTracker.Mobile_No, 
                         dbo.Eve_SpeakerTracker.Email_Address, dbo.Eve_SpeakerTracker.Speaker_Bio, dbo.Eve_SpeakerTracker.Speaking_Date, dbo.Eve_SpeakerTracker.Track, dbo.Eve_SpeakerTracker.Pitch_session_Topic, 
                         dbo.Eve_SpeakerTracker.SpeakerTrackerId
FROM            dbo.Eve_SpeakerTracker INNER JOIN
                         dbo.Eve_SponsorMaster ON dbo.Eve_SpeakerTracker.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId INNER JOIN
                         dbo.Eve_EventMaster ON dbo.Eve_SpeakerTracker.Event_Code = dbo.Eve_EventMaster.EventMasterId
WHERE       dbo.Eve_SpeakerTracker.SpeakerTrackerId = :SpeakerTrackerId
    """)
    
    result = await db.execute(query, {'SpeakerTrackerId': SpeakerTrackerId
})
    return result.mappings().all()


async def create_speaker_tracker(db: AsyncSession, tracker: SpeakerTrackerCreate, ws_manager: Optional[ConnectionManager] = None):
    db_tracker = EveSpeakerTracker(**tracker.model_dump())
    db.add(db_tracker)
    await db.commit()
    await db.refresh(db_tracker)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_speaker_trackers")
    return db_tracker

async def update_speaker_tracker(db: AsyncSession, tracker_id: int, tracker: SpeakerTrackerUpdate, ws_manager: Optional[ConnectionManager] = None):
    update_data = tracker.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EveSpeakerTracker)
        .where(EveSpeakerTracker.SpeakerTrackerId == tracker_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_speaker_trackers")
    return await get_speaker_tracker(db, tracker_id)

async def delete_speaker_tracker(db: AsyncSession, tracker_id: int, ws_manager: Optional[ConnectionManager] = None):
    db_tracker = await get_speaker_tracker(db, tracker_id)
    if not db_tracker:
        return False
    
    await db.delete(db_tracker)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_speaker_trackers")
    return True

async def get_speaker_trackers_by_event_code(db: AsyncSession, event_code: int):
    result = await db.execute(
        select(EveSpeakerTracker)
        .filter(EveSpeakerTracker.Event_Code == event_code)
        .order_by(asc(EveSpeakerTracker.SpeakerTrackerId))
    )
    return result.scalars().all()

async def get_speaker_trackers_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(EveSpeakerTracker)
        .filter(EveSpeakerTracker.SponsorMasterId == sponsor_id)
        .order_by(asc(EveSpeakerTracker.SpeakerTrackerId))
    )
    return result.scalars().all()

async def get_speaker_trackers_by_track(db: AsyncSession, track: str):
    result = await db.execute(
        select(EveSpeakerTracker)
        .filter(EveSpeakerTracker.Track == track)
        .order_by(asc(EveSpeakerTracker.SpeakerTrackerId))
    )
    return result.scalars().all()