from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user_model import User
from ..schemas.user_schema import UserCreate
from ..utils.security import get_password_hash, verify_password, create_access_token,create_refresh_token
from datetime import timedelta
from .user_service import get_user_by_email

async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def create_access_token_for_user(user: User):
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return access_token

async def create_refresh_token_for_user(user: User):
    refresh_token_expires = timedelta(days=7)
    refresh_token = create_refresh_token(
        data={"sub": user.email}, expires_delta=refresh_token_expires
    )
    return refresh_token