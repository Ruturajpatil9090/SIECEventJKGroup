from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TeamMasterDetailBase(BaseModel):
    User_Id: Optional[int] = None

class TeamMasterDetailCreate(TeamMasterDetailBase):
    rowaction: Optional[str] = None
    TeamMasterDetailId: Optional[int] = None

class TeamMasterDetail(TeamMasterDetailBase):
    TeamMasterDetailId: int
    TeamMasterId: int

    class Config:
        from_attributes = True

class TeamMasterHeadBase(BaseModel):
    Team_Name: Optional[str] = None
    Team_Purpose: Optional[str] = None
    Supervisor: Optional[int] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None

class TeamMasterHeadCreate(TeamMasterHeadBase):
    details: List[TeamMasterDetailCreate] = []

class TeamMasterHeadUpdate(TeamMasterHeadBase):
    details: Optional[List[TeamMasterDetailCreate]] = None

class TeamMasterHead(TeamMasterHeadBase):
    TeamMasterId: int
    Created_Date: Optional[datetime] = None
    Modified_Date: Optional[datetime] = None
    details: List[TeamMasterDetail] = []

    class Config:
        from_attributes = True