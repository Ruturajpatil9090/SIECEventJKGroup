from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.user_schema import User, UserCreate, UserUpdate
from ..services.user_service import (
    get_users,
    get_user,
    create_user,
    update_user,
    delete_user
)
from ..models.database import get_db
from ..utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = await get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=User)
async def create_new_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await create_user(db=db, user=user)

@router.get("/{id}", response_model=User)
async def read_user(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = await get_user(db, id=id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{id}", response_model=User)
async def update_existing_user(
    id: int,
    user: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_user = await update_user(db=db, id=id, user=user)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{id}")
async def delete_existing_user(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await delete_user(db=db, id=id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}