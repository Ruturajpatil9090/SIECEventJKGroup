from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from typing import Optional
from ..models.ministerial_session_model import EveMinisterialSession
from ..schemas.ministerial_session_schema import MinisterialSessionCreate, MinisterialSessionUpdate
from ..websockets.connection_manager import ConnectionManager

async def get_ministerial_session(db: AsyncSession, session_id: int):
    result = await db.execute(
        select(EveMinisterialSession)
        .filter(EveMinisterialSession.MinisterialSessionId == session_id)
    )
    return result.scalars().first()

async def get_max_ministerial_session_id(db: AsyncSession):
    result = await db.execute(select(func.max(EveMinisterialSession.MinisterialSessionId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_ministerial_sessions(db: AsyncSession,event_code: Optional[int] = None):
    query = text("""
        SELECT 
            ms.MinisterialSessionId, 
            ms.Event_Code, 
            ms.SponsorMasterId, 
            ms.Speaker_Name, 
            ms.designation, 
            ms.Mobile_No, 
            ms.Email_Address, 
            ms.MinisterialSession_Bio, 
            ms.Speaking_Date, 
            ms.Track,
            em.EventMaster_Name,
            sm.Sponsor_Name
        FROM Eve_MinisterialSessions ms
        LEFT JOIN Eve_EventMaster em ON ms.Event_Code = em.EventMasterId
        LEFT JOIN Eve_SponsorMaster sm ON ms.SponsorMasterId = sm.SponsorMasterId
        where ms.Event_Code = :event_code
        ORDER BY ms.MinisterialSessionId DESC
    """)
    
    result = await db.execute(query, {'event_code': event_code})
    return result.mappings().all()

async def create_ministerial_session(db: AsyncSession, session: MinisterialSessionCreate, ws_manager: Optional[ConnectionManager] = None):
    db_session = EveMinisterialSession(**session.model_dump())
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_ministerial_sessions")
    return db_session

async def update_ministerial_session(db: AsyncSession, session_id: int, session: MinisterialSessionUpdate,ws_manager: Optional[ConnectionManager] = None):
    update_data = session.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EveMinisterialSession)
        .where(EveMinisterialSession.MinisterialSessionId == session_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_ministerial_sessions")

    return await get_ministerial_session(db, session_id)

async def delete_ministerial_session(db: AsyncSession, session_id: int,ws_manager: Optional[ConnectionManager] = None):
    db_session = await get_ministerial_session(db, session_id)
    if not db_session:
        return False
    
    await db.delete(db_session)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_ministerial_sessions")
    return True

async def get_ministerial_sessions_by_event_code(db: AsyncSession, event_code: int):
    result = await db.execute(
        select(EveMinisterialSession)
        .filter(EveMinisterialSession.Event_Code == event_code)
        .order_by(asc(EveMinisterialSession.MinisterialSessionId))
    )
    return result.scalars().all()

async def get_ministerial_sessions_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(EveMinisterialSession)
        .filter(EveMinisterialSession.SponsorMasterId == sponsor_id)
        .order_by(asc(EveMinisterialSession.MinisterialSessionId))
    )
    return result.scalars().all()

async def get_ministerial_sessions_by_track(db: AsyncSession, track: str):
    result = await db.execute(
        select(EveMinisterialSession)
        .filter(EveMinisterialSession.Track == track)
        .order_by(asc(EveMinisterialSession.MinisterialSessionId))
    )
    return result.scalars().all()