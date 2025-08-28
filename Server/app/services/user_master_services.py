# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy.orm import selectinload
# from app.models.user_master_model import TblUser

# async def get_all_users_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
#     result = await db.execute(
#         select(TblUser)
#         .options(selectinload(TblUser.details))
#         .order_by(TblUser.uid)
#         .offset(skip)
#         .limit(limit)
#     )
#     users = result.scalars().all()
#     return users or [] 


























from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.user_master_model import TblUser
from app.utils.security import verify_password

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

async def get_user_by_username(db: AsyncSession, username: str) -> TblUser:
    result = await db.execute(
        select(TblUser).filter(TblUser.User_Name == username)
    )
    user = result.scalars().first()
    return user

async def authenticate_user(db: AsyncSession, username: str, password: str) -> TblUser:
    user = await get_user_by_username(db, username)
    if not user:
        return False
    

    if user.User_Password != password:
        return False
    
    return user