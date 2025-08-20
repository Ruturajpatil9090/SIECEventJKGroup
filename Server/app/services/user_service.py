from sqlalchemy import select, update,asc
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user_model import User
from ..schemas.user_schema import UserCreate, UserUpdate
from ..utils.security import get_password_hash
from datetime import datetime

async def get_user(db: AsyncSession, id: int):
    result = await db.execute(select(User).filter(User.id == id))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(User)
        .order_by(asc(User.id))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

# async def create_user(db: AsyncSession, user: UserCreate):
#     hashed_password = get_password_hash(user.password)
#     db_user = User(
#         email=user.email,
#         hashed_password=hashed_password,
#         first_name=user.first_name,
#         # created_at=datetime.utcnow(),
#         # updated_at=datetime.utcnow()
#     )
#     db.add(db_user)
#     await db.commit()
#     await db.refresh(db_user)
#     return db_user


async def create_user(db: AsyncSession, user: UserCreate):
    user_data = user.model_dump()
    
    if "password" in user_data:
        user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
    
    db_user = User(**user_data)
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, id: int, user: UserUpdate):
    db_user = await get_user(db, id)
    if not db_user:
        return None
    
    update_data = user.model_dump(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    # update_data["updated_at"] = datetime.utcnow()
    
    await db.execute(
        update(User)
        .where(User.id == id)
        .values(**update_data)
    )
    await db.commit()
    return await get_user(db, id)

async def delete_user(db: AsyncSession, id: int):
    db_user = await get_user(db, id)
    if not db_user:
        return False
    
    await db.delete(db_user)
    await db.commit()
    return True