from sqlalchemy import select, update, delete,asc,text
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.category_sub_model import CategorySubMaster
from ..schemas.category_sub_schema import CategorySubCreate, CategorySubUpdate
from sqlalchemy import select, func

async def create_category_sub(db: AsyncSession, category_sub: CategorySubCreate):
    db_category_sub = CategorySubMaster(**category_sub.model_dump())
    db.add(db_category_sub)
    await db.commit()
    await db.refresh(db_category_sub)
    return db_category_sub

async def get_category_sub(db: AsyncSession, category_sub_id: int):
    result = await db.execute(
        select(CategorySubMaster)
        .where(CategorySubMaster.CategorySubMasterId == category_sub_id)
    )
    return result.scalars().first()

# async def get_all_category_subs(db: AsyncSession):
#     result = await db.execute(select(CategorySubMaster))
#     return result.scalars().all()

async def get_all_category_subs(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(CategorySubMaster)
        .order_by(asc(CategorySubMaster.CategorySubMasterId))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_all_Categories(db: AsyncSession):
    query = text("""
                SELECT  dbo.Eve_CategorySubMaster.CategoryId, dbo.Eve_CategorySubMaster.CategorySub_Name, dbo.Eve_CategorySubMaster.CategorySubMasterId, dbo.Eve_CategoryMaster.category_name
                FROM  dbo.Eve_CategoryMaster INNER JOIN
                dbo.Eve_CategorySubMaster ON dbo.Eve_CategoryMaster.CategoryId = dbo.Eve_CategorySubMaster.CategoryId order by dbo.Eve_CategorySubMaster.CategorySubMasterId desc
    """)
    
    result = await db.execute(query)
    return result.mappings().all()


async def get_max_categorySubMasterId(db: AsyncSession):
    result = await db.execute(select(func.max(CategorySubMaster.CategorySubMasterId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0

async def get_category_subs_by_category(db: AsyncSession, category_id: int):
    result = await db.execute(
        select(CategorySubMaster)
        .where(CategorySubMaster.CategoryId == category_id)
    )
    return result.scalars().all()

async def update_category_sub(
    db: AsyncSession, 
    category_sub_id: int, 
    category_sub: CategorySubUpdate
):
    update_data = category_sub.model_dump(exclude_unset=True)
    
    await db.execute(
        update(CategorySubMaster)
        .where(CategorySubMaster.CategorySubMasterId == category_sub_id)
        .values(**update_data)
    )
    await db.commit()
    return await get_category_sub(db, category_sub_id)

async def delete_category_sub(db: AsyncSession, category_sub_id: int):
    db_category_sub = await get_category_sub(db, category_sub_id)
    if not db_category_sub:
        return False
    
    await db.execute(
        delete(CategorySubMaster)
        .where(CategorySubMaster.CategorySubMasterId == category_sub_id)
    )
    await db.commit()
    return True