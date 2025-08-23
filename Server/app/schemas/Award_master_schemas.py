from pydantic import BaseModel
from typing import Optional


class AwardBase(BaseModel):
    Award_Name: Optional[str] = None
    EventSuperId: int


class AwardCreate(AwardBase):
    Award_Name: str
    EventSuperId: int


class AwardUpdate(BaseModel):
    Award_Name: Optional[str] = None
    EventSuperId: Optional[int] = None


class Award(AwardBase):
    AwardId: int 
    Award_Name: Optional[str] = None
    EventSuperId: Optional[int] = None 
    
    class Config:
        orm_mode = True
