from sqlalchemy import select, update, delete, func , case
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.deliverables_models import DeliverablesMaster
from ..schemas.deliverables_schema import DeliverablesMasterCreate, DeliverablesMasterUpdate
from datetime import datetime
from ..models.CategoryWiseDeliverables_model import (
    CategoryWiseDeliverablesMaster,
    CategoryWiseDetailDeliverablesMaster
)

async def get_max_deliverable_no(db: AsyncSession):
    result = await db.execute(select(func.max(DeliverablesMaster.Deliverable_No)))
    max_no = result.scalar()
    return max_no if max_no is not None else 0

async def get_deliverable(db: AsyncSession, deliverable_id: int):
    result = await db.execute(
        select(DeliverablesMaster)
        .filter(DeliverablesMaster.id == deliverable_id)
    )
    return result.scalars().first()


async def get_deliverables_list(db: AsyncSession, skip: int = 0, limit: int = 100):
    category_order = case(
        (DeliverablesMaster.Category == 'B', 1),
        (DeliverablesMaster.Category == 'D', 2),
        (DeliverablesMaster.Category == 'A', 3),
        (DeliverablesMaster.Category == 'S', 4),
        else_=5
    )
    
    result = await db.execute(
        select(DeliverablesMaster)
        .order_by(
            category_order,
            DeliverablesMaster.Deliverable_No.desc()  
        )
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_max_deliverable_no_by_category(db: AsyncSession, category: str):
    result = await db.execute(
        select(func.max(DeliverablesMaster.Deliverable_No))
        .where(DeliverablesMaster.Category == category)
    )
    max_no = result.scalar()
    return max_no if max_no is not None else 0

async def create_deliverable(db: AsyncSession, deliverable: DeliverablesMasterCreate):
    max_no = await get_max_deliverable_no_by_category(db, deliverable.Category)
    
    db_deliverable = DeliverablesMaster(
        **deliverable.model_dump(exclude={'Deliverable_No'}),
        Deliverable_No=max_no + 1,
    )
    
    try:
        db.add(db_deliverable)
        await db.commit()
        await db.refresh(db_deliverable)
        return db_deliverable
    except Exception as e:
        await db.rollback()
        raise ValueError(f"Failed to create deliverable: {str(e)}")

async def update_deliverable(
    db: AsyncSession, 
    deliverable_id: int, 
    deliverable: DeliverablesMasterUpdate
):
    db_deliverable = await get_deliverable(db, deliverable_id)
    if not db_deliverable:
        return None
    
    update_data = deliverable.model_dump(exclude_unset=True)
    # update_data["updated_at"] = datetime.utcnow()
    
    await db.execute(
        update(DeliverablesMaster)
        .where(DeliverablesMaster.id == deliverable_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_deliverable(db, deliverable_id)

# async def delete_deliverable(db: AsyncSession, deliverable_id: int):
#     db_deliverable = await get_deliverable(db, deliverable_id)
#     if not db_deliverable:
#         return False
    
#     await db.execute(
#         delete(DeliverablesMaster)
#         .where(DeliverablesMaster.id == deliverable_id)
#     )
#     await db.commit()
#     return True

async def delete_deliverable(db: AsyncSession, deliverable_id: int):
    # First check if the deliverable exists
    db_deliverable = await get_deliverable(db, deliverable_id)
    if not db_deliverable:
        return False
    
    # Check if the deliverable is referenced in CategoryWiseDeliverablesDetails
    result = await db.execute(
        select(func.count(CategoryWiseDetailDeliverablesMaster.CatDeliverableDetailId))
        .where(CategoryWiseDetailDeliverablesMaster.Deliverabled_Code == deliverable_id)
    )
    reference_count = result.scalar()
    
    # If referenced, cannot delete
    if reference_count > 0:
        return False
    
    # If not referenced, proceed with deletion
    await db.execute(
        delete(DeliverablesMaster)
        .where(DeliverablesMaster.id == deliverable_id)
    )
    await db.commit()
    return True