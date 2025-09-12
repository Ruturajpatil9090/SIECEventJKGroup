from sqlalchemy import select, update, desc
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.category_model import Category
from ..models.category_sub_model import CategorySubMaster
from ..schemas.category_schema import CategoryCreate, CategoryUpdate
from sqlalchemy import select, func
from typing import Optional
from ..websockets.connection_manager import ConnectionManager

async def get_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(Category).filter(Category.CategoryId  == category_id))
    return result.scalars().first()

async def get_max_category_id(db: AsyncSession):
    result = await db.execute(select(func.max(Category.CategoryId)))
    max_id = result.scalar()
    return max_id if max_id is not None else 0


async def get_category_by_name(db: AsyncSession, category_name: str):
    result = await db.execute(select(Category).filter(Category.category_name == category_name))
    return result.scalars().first()

async def get_categories(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Category)
        .order_by(desc(Category.CategoryId))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def create_category(db: AsyncSession, category: CategoryCreate,ws_manager: Optional[ConnectionManager] = None):
    db_category = Category(**category.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    if ws_manager:
        await ws_manager.broadcast(message="refresh_category")
    return db_category

async def update_category(db: AsyncSession, category_id: int, category: CategoryUpdate,ws_manager: Optional[ConnectionManager] = None):
    update_data = category.model_dump(exclude_unset=True)
    
    await db.execute(
        update(Category)
        .where(Category.CategoryId  == category_id)
        .values(**update_data)
    )
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_category")
    return await get_category(db, category_id)


async def delete_category(db: AsyncSession, category_id: int,ws_manager: Optional[ConnectionManager] = None):
    db_category = await get_category(db, category_id)
    if not db_category:
        return False
    
    result = await db.execute(
        select(func.count(CategorySubMaster.CategorySubMasterId))
        .where(CategorySubMaster.CategoryId == category_id)
    )
    subcategory_count = result.scalar()
    
    if subcategory_count > 0:
        return False
    
    await db.delete(db_category)
    await db.commit()
    if ws_manager:
        await ws_manager.broadcast(message="refresh_category")
    return True