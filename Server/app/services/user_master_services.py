from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.user_master_model import TblUser

async def get_all_users_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(TblUser)
        .options(selectinload(TblUser.details))
        .order_by(TblUser.uid)
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return users or [] 
