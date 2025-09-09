from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, asc, func, text
from typing import Optional
from ..models.networking_slot_model import EveNetworkingSlot
from ..schemas.networking_slot_schema import NetworkingSlotCreate, NetworkingSlotUpdate
from ..websockets.connection_manager import ConnectionManager

async def get_networking_slot(db: AsyncSession, slot_id: int):
    result = await db.execute(
        select(EveNetworkingSlot)
        .filter(EveNetworkingSlot.NetworkingSlotId == slot_id)
    )
    return result.scalars().first()

async def get_max_networking_slot_id(db: AsyncSession):
    result = await db.execute(select(func.max(EveNetworkingSlot.NetworkingSlotId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_networking_slots(db: AsyncSession, event_code: Optional[int] = None):
    query = text("""
        SELECT 
            ns.NetworkingSlotId, 
            ns.Event_Code, 
            ns.SponsorMasterId, 
            ns.Speaker_Name, 
            ns.designation, 
            ns.Mobile_No, 
            ns.Email_Address, 
            ns.NetworkingSlotSession_Bio, 
            ns.Speaking_Date, 
            ns.Track,
            ns.Invitation_Sent,
            ns.Approval_Received,
            em.EventMaster_Name,
            sm.Sponsor_Name
        FROM Eve_NetworkingSlot ns
        LEFT JOIN Eve_EventMaster em ON ns.Event_Code = em.EventMasterId
        LEFT JOIN Eve_SponsorMaster sm ON ns.SponsorMasterId = sm.SponsorMasterId
        WHERE ns.Event_Code = :event_code OR :event_code IS NULL
        ORDER BY ns.NetworkingSlotId DESC
    """)
    
    result = await db.execute(query, {'event_code': event_code})
    return result.mappings().all()

async def get_networking_slot_details(db: AsyncSession, NetworkingSlotId: Optional[int] = None):
    query = text("""
        SELECT 
            em.EventMaster_Name, 
            sm.Sponsor_Name, 
            ns.Speaker_Name, 
            ns.Mobile_No, 
            ns.Email_Address, 
            ns.NetworkingSlotSession_Bio, 
            ns.Speaking_Date, 
            ns.Track, 
            ns.Invitation_Sent, 
            ns.Approval_Received,
            ns.NetworkingSlotId
        FROM Eve_NetworkingSlot ns
        INNER JOIN Eve_SponsorMaster sm ON ns.SponsorMasterId = sm.SponsorMasterId
        INNER JOIN Eve_EventMaster em ON ns.Event_Code = em.EventMasterId
        WHERE ns.NetworkingSlotId = :NetworkingSlotId
    """)
    
    result = await db.execute(query, {'NetworkingSlotId': NetworkingSlotId})
    return result.mappings().all()

async def create_networking_slot(db: AsyncSession, slot: NetworkingSlotCreate, ws_manager: Optional[ConnectionManager] = None):
    db_slot = EveNetworkingSlot(**slot.model_dump())
    db.add(db_slot)
    await db.commit()
    await db.refresh(db_slot)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_networking_slots")
    return db_slot

async def update_networking_slot(db: AsyncSession, slot_id: int, slot: NetworkingSlotUpdate, ws_manager: Optional[ConnectionManager] = None):
    update_data = slot.model_dump(exclude_unset=True)
    
    await db.execute(
        update(EveNetworkingSlot)
        .where(EveNetworkingSlot.NetworkingSlotId == slot_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_networking_slots")

    return await get_networking_slot(db, slot_id)

async def delete_networking_slot(db: AsyncSession, slot_id: int, ws_manager: Optional[ConnectionManager] = None):
    db_slot = await get_networking_slot(db, slot_id)
    if not db_slot:
        return False
    
    await db.delete(db_slot)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast("refresh_networking_slots")
    return True

async def get_networking_slots_by_event_code(db: AsyncSession, event_code: int):
    result = await db.execute(
        select(EveNetworkingSlot)
        .filter(EveNetworkingSlot.Event_Code == event_code)
        .order_by(asc(EveNetworkingSlot.NetworkingSlotId))
    )
    return result.scalars().all()

async def get_networking_slots_by_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(EveNetworkingSlot)
        .filter(EveNetworkingSlot.SponsorMasterId == sponsor_id)
        .order_by(asc(EveNetworkingSlot.NetworkingSlotId))
    )
    return result.scalars().all()

async def get_networking_slots_by_track(db: AsyncSession, track: str):
    result = await db.execute(
        select(EveNetworkingSlot)
        .filter(EveNetworkingSlot.Track == track)
        .order_by(asc(EveNetworkingSlot.NetworkingSlotId))
    )
    return result.scalars().all()

async def get_networking_slots_by_approval_status(db: AsyncSession, approval_status: str):
    result = await db.execute(
        select(EveNetworkingSlot)
        .filter(EveNetworkingSlot.Approval_Received == approval_status)
        .order_by(asc(EveNetworkingSlot.NetworkingSlotId))
    )
    return result.scalars().all()