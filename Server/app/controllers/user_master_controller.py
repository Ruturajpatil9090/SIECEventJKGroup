from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from typing import List

from app.models.database import get_db
from app.schemas.user_master_schemas import (
    LoginRequest, Token, UserResponse, UserProfileUpdate, 
    PasswordUpdate, UserSimpleResponse
)
from app.utils.security import create_access_token, create_refresh_token
from app.services.user_master_services import (
    get_user_by_username, authenticate_user, get_all_users_with_details,
    get_user_by_uid, update_user_profile, update_user_password,
    get_user_with_details_dict
)

router = APIRouter(prefix="/users-master", tags=["Authentication"])

@router.get("/", response_model=List[UserResponse])
async def read_all_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    users = await get_all_users_with_details(db, skip=skip, limit=limit)
    return users

@router.get("/{uid}", response_model=UserResponse)
async def get_user_by_uid_api(uid: int, db: AsyncSession = Depends(get_db)):
    user = await get_user_with_details_dict(db, uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/profile/{uid}", response_model=UserSimpleResponse)
async def update_user_profile_api(
    uid: int, 
    profile_data: UserProfileUpdate, 
    db: AsyncSession = Depends(get_db)
):
    update_dict = profile_data.dict(exclude_unset=True)
    
    user = await update_user_profile(db, uid, update_dict)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/password/{uid}")
async def update_user_password_api(
    uid: int, 
    password_data: PasswordUpdate, 
    db: AsyncSession = Depends(get_db)
):
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match"
        )
    
    success = await update_user_password(
        db, 
        uid, 
        password_data.current_password, 
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect or user not found"
        )
    
    return {"message": "Password updated successfully"}

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: LoginRequest, 
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(db, form_data.User_Name, form_data.User_Password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.IsLocked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is locked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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
        "user_name": user.User_Name,
        "user_id": user.User_Id,
        "uid": user.uid
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

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.User_Name}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}