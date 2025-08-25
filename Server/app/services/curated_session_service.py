from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from typing import Optional
from ..models.curated_session_model import EveCuratedSession
from ..schemas.curated_session_schema import CuratedSessionCreate, CuratedSessionUpdate
from ..websockets.connection_manager import ConnectionManager

async def get_curated_session(db: AsyncSession, session_id: int):
    result = await db.execute(
        select(EveCuratedSession)
        .filter(EveCuratedSession.CuratedSessionId == session_id)
    )
    return result.scalars().first()

async def get_max_curated_session_id(db: AsyncSession):
    result = await db.execute(select(func.max(EveCuratedSession.CuratedSessionId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_curated_sessions(db: AsyncSession):
    query = text("""
        SELECT 
            cs.CuratedSessionId, 
            cs.Event_Code, 
            cs.SponsorMasterId, 
            cs.Speaker_Name, 
            cs.designation, 
            cs.Mobile_No, 
            cs.Email_Address, 
            cs.CuratedSession_Bio, 
            cs.Speaking_Date, 
            cs.Track,
            em.EventMaster_Name,
            sm.Sponsor_Name
        FROM Eve_CuratedSession cs
        LEFT JOIN Eve_EventMaster em ON cs.Event_Code = em.EventMasterId
        LEFT JOIN Eve_SponsorMaster sm ON cs.SponsorMasterId = sm.SponsorMasterId
        ORDER BY cs.CuratedSessionId DESC
    """)
    
    result = await db.execute(query)
    return result.mappings().all()

async def create_curated_session(db: AsyncSession, session: CuratedSessionCreate,ws_manager: Optional[ConnectionManager] = None):
    db_session = EveCuratedSession(**session.model_dump())
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_curated_sessions")
    return db_session

async def update_curated_session(db: AsyncSession, session_id: int, session: CuratedSessionUpdate,ws_manager: Optional[ConnectionManager] = None):
    update_data = session.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EveCuratedSession)
        .where(EveCuratedSession.CuratedSessionId == session_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_curated_sessions")
    return await get_curated_session(db, session_id)

async def delete_curated_session(db: AsyncSession, session_id: int,ws_manager: Optional[ConnectionManager] = None):
    db_session = await get_curated_session(db, session_id)
    if not db_session:
        return False
    
    await db.delete(db_session)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_curated_sessions")
    return True

async def get_curated_sessions_by_event_code(db: AsyncSession, event_code: int):
    result = await db.execute(
        select(EveCuratedSession)
        .filter(EveCuratedSession.Event_Code == event_code)
        .order_by(asc(EveCuratedSession.CuratedSessionId))
    )
    return result.scalars().all()

async def get_curated_sessions_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(EveCuratedSession)
        .filter(EveCuratedSession.SponsorMasterId == sponsor_id)
        .order_by(asc(EveCuratedSession.CuratedSessionId))
    )
    return result.scalars().all()

async def get_curated_sessions_by_track(db: AsyncSession, track: str):
    result = await db.execute(
        select(EveCuratedSession)
        .filter(EveCuratedSession.Track == track)
        .order_by(asc(EveCuratedSession.CuratedSessionId))
    )
    return result.scalars().all()