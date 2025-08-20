from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update
from typing import List, Optional
from ..models.sponsor_master_model import Eve_SponsorMaster, Eve_SponsorMasterDetail
from ..schemas.sponsor_master_schema import SponsorMasterCreate, SponsorMasterUpdate

async def get_sponsors(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .order_by(Eve_SponsorMaster.SponsorMasterId) 
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .where(Eve_SponsorMaster.SponsorMasterId == sponsor_id)
    )
    return result.scalar_one_or_none()

async def get_max_sponsor_id(db: AsyncSession):
    result = await db.execute(
        select(func.max(Eve_SponsorMaster.SponsorMasterId))
    )
    return result.scalar() or 0

async def create_sponsor(db: AsyncSession, sponsor_data: SponsorMasterCreate):
    db_sponsor = Eve_SponsorMaster(**sponsor_data.model_dump(exclude={'details'}))
    db.add(db_sponsor)
    await db.flush()
    
    max_id_result = await db.execute(
        select(func.max(Eve_SponsorMasterDetail.ID))
        .where(Eve_SponsorMasterDetail.SponsorMasterId == db_sponsor.SponsorMasterId)
    )
    current_id = max_id_result.scalar() or 0
    
    for detail_data in sponsor_data.details:
        current_id += 1
        db_detail = Eve_SponsorMasterDetail(
            SponsorMasterId=db_sponsor.SponsorMasterId,
            ID=current_id,
            Deliverabled_Code=detail_data.Deliverabled_Code,
            Deliverable_No=detail_data.Deliverable_No
        )
        db.add(db_detail)
    
    await db.commit()
    await db.refresh(db_sponsor)
    return db_sponsor

async def update_sponsor(db: AsyncSession, sponsor_id: int, sponsor_data: SponsorMasterUpdate):
    db_sponsor = await get_sponsor(db, sponsor_id)
    if not db_sponsor:
        return None

    update_data = sponsor_data.model_dump(exclude_unset=True, exclude={"details"})
    if update_data:
        await db.execute(
            update(Eve_SponsorMaster)
            .where(Eve_SponsorMaster.SponsorMasterId == sponsor_id)
            .values(**update_data)
        )
    
    if sponsor_data.details is not None:
        current_details_stmt = select(Eve_SponsorMasterDetail).filter(
            Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id
        )
        current_details = await db.execute(current_details_stmt)
        current_detail_dict = {
            d.Deliverabled_Code: d for d in current_details.scalars().all()
        }

        incoming_detail_codes = {d.Deliverabled_Code for d in sponsor_data.details}

        details_to_delete = [
            detail for detail_code, detail in current_detail_dict.items()
            if detail_code not in incoming_detail_codes
        ]
        
        for detail in details_to_delete:
            await db.delete(detail)

        new_detail_codes = incoming_detail_codes - set(current_detail_dict.keys())
        
        if new_detail_codes:
            max_id_result = await db.execute(
                select(func.max(Eve_SponsorMasterDetail.ID))
                .where(Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id)
            )
            current_id = max_id_result.scalar() or 0

            for detail_code in new_detail_codes:
                new_detail_data = next(d for d in sponsor_data.details if d.Deliverabled_Code == detail_code)
                current_id += 1
                db_detail = Eve_SponsorMasterDetail(
                    **new_detail_data.model_dump(exclude={"ID"}),
                    SponsorMasterId=sponsor_id,
                    ID=current_id
                )
                db.add(db_detail)

    await db.commit()
    return await get_sponsor(db, sponsor_id)

async def delete_sponsor(db: AsyncSession, sponsor_id: int):
    db_sponsor = await get_sponsor(db, sponsor_id)
    if db_sponsor:
        await db.delete(db_sponsor)
        await db.commit()
        return True
    return False

async def get_sponsors_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()