from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas.user_master_schemas import User
from app.services.user_master_services import get_all_users_with_details
from app.models.database import get_db 

router = APIRouter(
    prefix="/users-master",
    tags=["Users"]
)

@router.get("/", response_model=List[User])
async def read_all_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    users = await get_all_users_with_details(db, skip=skip, limit=limit)
    return users
