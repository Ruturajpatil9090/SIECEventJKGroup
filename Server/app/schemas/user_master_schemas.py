from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class UserDetailBase(BaseModel):
    Program_Name: Optional[str] = None
    Tran_Type: Optional[str] = None
    Permission: Optional[str] = None
    Company_Code: Optional[int] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None
    Created_Date: Optional[date] = None
    Modified_Date: Optional[date] = None
    Year_Code: Optional[int] = None
    udid: Optional[int] = None
    canView: Optional[str] = None
    canEdit: Optional[str] = None
    canSave: Optional[str] = None
    canDelete: Optional[str] = None
    DND: Optional[str] = None
    menuNames: Optional[str] = None
    uid: int 
    User_Id: int

class UserDetailCreate(UserDetailBase):
    pass

class UserDetail(UserDetailBase):
    Detail_Id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    User_Name: Optional[str] = None
    User_Type: Optional[str] = None
    Password: Optional[str] = None
    EmailId: Optional[str] = None
    userfullname: Optional[str] = None
    Mobile: Optional[str] = None
    User_Id: Optional[int] = None

class UserCreate(UserBase):
    details: List[UserDetailCreate] = []

class UserUpdate(BaseModel):
    User_Name: Optional[str] = None
    Password: Optional[str] = None
    details: Optional[List[UserDetailCreate]] = None

class User(UserBase):
    uid: int
    # details: List[UserDetail] = []

    class Config:
        from_attributes = True
