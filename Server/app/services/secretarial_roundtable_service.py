from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from typing import Optional
from ..models.secretarial_roundtable_model import EveSecretarialRoundTable
from ..schemas.secretarial_roundtable_schema import SecretarialRoundTableCreate, SecretarialRoundTableUpdate
from ..websockets.connection_manager import ConnectionManager

async def get_secretarial_roundtable(db: AsyncSession, roundtable_id: int):
    result = await db.execute(
        select(EveSecretarialRoundTable)
        .filter(EveSecretarialRoundTable.SecretarialRoundTableId == roundtable_id)
    )
    return result.scalars().first()

async def get_max_secretarial_roundtable_id(db: AsyncSession):
    result = await db.execute(select(func.max(EveSecretarialRoundTable.SecretarialRoundTableId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_secretarial_roundtables(db: AsyncSession, event_code: Optional[int] = None):
    query = text("""
     SELECT  srt.SecretarialRoundTableId, srt.Event_Code, srt.SponsorMasterId, srt.Speaker_Name, srt.designation, srt.Mobile_No, srt.Email_Address, srt.SecretarialRoundTable_Bio, srt.Speaking_Date, srt.Track, srt.Invitation_Sent, 
                         srt.Approval_Received, em.EventMaster_Name, sm.Sponsor_Name, srt.Deliverabled_Code, srt.Deliverable_No,srt.Doc_No
FROM  dbo.Eve_SecretarialRoundTable AS srt LEFT OUTER JOIN
                         dbo.Eve_EventMaster AS em ON srt.Event_Code = em.EventMasterId LEFT OUTER JOIN
                         dbo.Eve_SponsorMaster AS sm ON srt.SponsorMasterId = sm.SponsorMasterId
        WHERE srt.Event_Code = :event_code
        ORDER BY srt.SecretarialRoundTableId DESC
    """)
    
    result = await db.execute(query, {'event_code': event_code})
    return result.mappings().all()

async def get_secretarial_details(db: AsyncSession, SecretarialRoundTableId: Optional[int] = None):
    query = text("""
        SELECT 
            em.EventMaster_Name, 
            sm.Sponsor_Name, 
            srt.Speaker_Name, 
            srt.Mobile_No, 
            srt.Email_Address, 
            srt.SecretarialRoundTable_Bio, 
            srt.Speaking_Date, 
            srt.Track, 
            srt.Invitation_Sent, 
            srt.Approval_Received, 
            srt.SecretarialRoundTableId,
            srt.SponsorMasterId, 
            srt.designation
        FROM Eve_SecretarialRoundTable srt
        INNER JOIN Eve_SponsorMaster sm ON srt.SponsorMasterId = sm.SponsorMasterId
        INNER JOIN Eve_EventMaster em ON srt.Event_Code = em.EventMasterId
        WHERE srt.SecretarialRoundTableId = :SecretarialRoundTableId
    """)
    
    result = await db.execute(query, {'SecretarialRoundTableId': SecretarialRoundTableId})
    return result.mappings().all()

async def create_secretarial_roundtable(db: AsyncSession, roundtable: SecretarialRoundTableCreate, ws_manager: Optional[ConnectionManager] = None):
    db_roundtable = EveSecretarialRoundTable(**roundtable.model_dump())
    db.add(db_roundtable)
    await db.commit()
    await db.refresh(db_roundtable)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_secretarial_roundtables")
    return db_roundtable

async def update_secretarial_roundtable(db: AsyncSession, roundtable_id: int, roundtable: SecretarialRoundTableUpdate, ws_manager: Optional[ConnectionManager] = None):
    update_data = roundtable.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EveSecretarialRoundTable)
        .where(EveSecretarialRoundTable.SecretarialRoundTableId == roundtable_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_secretarial_roundtables")

    return await get_secretarial_roundtable(db, roundtable_id)

async def delete_secretarial_roundtable(db: AsyncSession, roundtable_id: int, ws_manager: Optional[ConnectionManager] = None):
    db_roundtable = await get_secretarial_roundtable(db, roundtable_id)
    if not db_roundtable:
        return False
    
    await db.delete(db_roundtable)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_secretarial_roundtables")
    return True

async def get_secretarial_roundtables_by_event_code(db: AsyncSession, event_code: int):
    result = await db.execute(
        select(EveSecretarialRoundTable)
        .filter(EveSecretarialRoundTable.Event_Code == event_code)
        .order_by(asc(EveSecretarialRoundTable.SecretarialRoundTableId))
    )
    return result.scalars().all()

async def get_secretarial_roundtables_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(EveSecretarialRoundTable)
        .filter(EveSecretarialRoundTable.SponsorMasterId == sponsor_id)
        .order_by(asc(EveSecretarialRoundTable.SecretarialRoundTableId))
    )
    return result.scalars().all()

async def get_secretarial_roundtables_by_track(db: AsyncSession, track: str):
    result = await db.execute(
        select(EveSecretarialRoundTable)
        .filter(EveSecretarialRoundTable.Track == track)
        .order_by(asc(EveSecretarialRoundTable.SecretarialRoundTableId))
    )
    return result.scalars().all()