from sqlalchemy import select, update, delete, asc, func,text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models.CategoryWiseDeliverables_model import (
    CategoryWiseDeliverablesMaster,
    CategoryWiseDetailDeliverablesMaster
)
from ..schemas.CategoryWiseDeliverables_schema import (
    DeliverableCreate, 
    DeliverableUpdate
)

async def get_deliverable(db: AsyncSession, deliverable_id: int):
    result = await db.execute(
        select(CategoryWiseDeliverablesMaster)
        .options(selectinload(CategoryWiseDeliverablesMaster.details))
        .filter(CategoryWiseDeliverablesMaster.CatDeliverableId == deliverable_id)
    )
    return result.scalars().first()

async def get_all_deliverables_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
    SELECT 
        cm.category_name,
        csm.CategorySub_Name,
        em.EventMaster_Name,
        esm.EventSuper_Name,
        cwdm.CatDeliverableId,
        cwdm.Event_Code,
        cwdm.CategoryMaster_Code,
        cwdm.CategorySubMaster_Code,
        cwdd.Deliverabled_Code,
        cwdd.Deliverable_No,
        cwdd.CatDeliverableDetailId
    FROM dbo.Eve_CategoryWiseDeliverablesMaster cwdm
    INNER JOIN dbo.Eve_CategoryMaster cm 
        ON cwdm.CategoryMaster_Code = cm.CategoryId
    INNER JOIN dbo.Eve_CategorySubMaster csm 
        ON cwdm.CategorySubMaster_Code = csm.CategorySubMasterId
        AND csm.CategoryId = cm.CategoryId
    INNER JOIN dbo.Eve_EventMaster em 
        ON cwdm.Event_Code = em.EventMasterId
    INNER JOIN dbo.Eve_EventSuperMaster esm 
        ON em.EventSuperId = esm.EventSuperId
    LEFT JOIN dbo.Eve_CategoryWiseDetailDeliverablesMaster cwdd
        ON cwdm.CatDeliverableId = cwdd.CatDeliverableId
    ORDER BY cwdm.CatDeliverableId DESC
    OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)
    
    result = await db.execute(query, {"skip": skip, "limit": limit})
    return result.mappings().all()



async def get_max_deliverable_id(db: AsyncSession):
    result = await db.execute(select(func.max(CategoryWiseDeliverablesMaster.CatDeliverableId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_deliverables(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(CategoryWiseDeliverablesMaster)
        .options(selectinload(CategoryWiseDeliverablesMaster.details))
        .order_by(asc(CategoryWiseDeliverablesMaster.CatDeliverableId))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_deliverable(db: AsyncSession, deliverable: DeliverableCreate):
    db_deliverable = CategoryWiseDeliverablesMaster(**deliverable.model_dump(exclude={"details"}))
    db.add(db_deliverable)
    await db.commit()
    await db.refresh(db_deliverable)

    current_id = 0
    for detail in deliverable.details:
        current_id += 1
        db_detail = CategoryWiseDetailDeliverablesMaster(
            **detail.model_dump(exclude={"ID"}),
            CatDeliverableId=db_deliverable.CatDeliverableId,
            ID=current_id
        )
        db.add(db_detail)

    await db.commit()
    return await get_deliverable(db, db_deliverable.CatDeliverableId)

async def update_deliverable(db: AsyncSession, deliverable_id: int, deliverable: DeliverableUpdate):
    db_deliverable = await get_deliverable(db, deliverable_id)
    if not db_deliverable:
        return None

    update_data = deliverable.model_dump(exclude_unset=True, exclude={"details"})
    if update_data:
        await db.execute(
            update(CategoryWiseDeliverablesMaster)
            .where(CategoryWiseDeliverablesMaster.CatDeliverableId == deliverable_id)
            .values(**update_data)
        )
    
    if deliverable.details is not None:
        current_details_stmt = select(CategoryWiseDetailDeliverablesMaster).filter(
            CategoryWiseDetailDeliverablesMaster.CatDeliverableId == deliverable_id
        )
        current_details = await db.execute(current_details_stmt)
        current_detail_dict = {
            d.Deliverabled_Code: d for d in current_details.scalars().all()
        }

        incoming_detail_codes = {d.Deliverabled_Code for d in deliverable.details}

        details_to_delete = [
            detail for detail_code, detail in current_detail_dict.items()
            if detail_code not in incoming_detail_codes
        ]
        
        for detail in details_to_delete:
            await db.delete(detail)

        new_detail_codes = incoming_detail_codes - set(current_detail_dict.keys())
        
        if new_detail_codes:
            max_id_result = await db.execute(
                select(func.max(CategoryWiseDetailDeliverablesMaster.ID))
                .where(CategoryWiseDetailDeliverablesMaster.CatDeliverableId == deliverable_id)
            )
            current_id = max_id_result.scalar() or 0

            for detail_code in new_detail_codes:
                new_detail_data = next(d for d in deliverable.details if d.Deliverabled_Code == detail_code)
                current_id += 1
                db_detail = CategoryWiseDetailDeliverablesMaster(
                    **new_detail_data.model_dump(exclude={"ID"}),
                    CatDeliverableId=deliverable_id,
                    ID=current_id
                )
                db.add(db_detail)

    await db.commit()
    return await get_deliverable(db, deliverable_id)

async def delete_deliverable(db: AsyncSession, deliverable_id: int):
    db_deliverable = await get_deliverable(db, deliverable_id)
    if not db_deliverable:
        return False

    await db.delete(db_deliverable)
    await db.commit()
    return True