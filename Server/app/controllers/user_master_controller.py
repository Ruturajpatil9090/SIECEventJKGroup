# from fastapi import APIRouter, Depends
# from sqlalchemy.ext.asyncio import AsyncSession
# from typing import List
# from app.schemas.user_master_schemas import User
# from app.services.user_master_services import get_all_users_with_details
# from app.models.database import get_db 

# router = APIRouter(
#     prefix="/users-master",
#     tags=["Users"]
# )

# @router.get("/", response_model=List[User])
# async def read_all_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
#     users = await get_all_users_with_details(db, skip=skip, limit=limit)
#     return users





from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from typing import List

from app.models.database import get_db
from app.schemas.user_master_schemas import LoginRequest, Token,User
from app.utils.security import create_access_token, create_refresh_token
from app.services.user_master_services import get_user_by_username,authenticate_user,get_all_users_with_details

router = APIRouter(prefix="/users-master", tags=["Authentication"])

@router.get("/", response_model=List[User])
async def read_all_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    users = await get_all_users_with_details(db, skip=skip, limit=limit)
    return users


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: LoginRequest, 
    db: AsyncSession = Depends(get_db)
):
    # Authenticate user
    user = await authenticate_user(db, form_data.User_Name, form_data.User_Password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is locked
    if user.IsLocked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is locked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=30)
    refresh_token_expires = timedelta(days=7)
    
    access_token = create_access_token(
        data={"sub": user.User_Name}, 
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.User_Name}, 
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_type": user.User_Type,
        "user_name": user.User_Name
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    from app.utils.security import verify_token
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise credentials_exception
    
    username = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = await get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    # Create new access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.User_Name}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


