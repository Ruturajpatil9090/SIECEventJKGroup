from pydantic import BaseModel
from typing import Optional

class AwardSubCategoryBase(BaseModel):
    AwardSubCategoryName: str
    AwardId: int

class AwardSubCategoryCreate(AwardSubCategoryBase):
    pass

class AwardSubCategoryUpdate(BaseModel):
    AwardSubCategoryName: Optional[str] = None
    AwardId: Optional[int] = None

class AwardSubCategory(AwardSubCategoryBase):
    AwardSubCategoryId: int

    class Config:
        from_attributes = True

# Schema for the joined query response
class AwardSubCategoryWithAward(BaseModel):
    Award_Name: Optional[str] = None
    AwardSubCategoryName: str
    AwardSubCategoryId: int
    AwardId: int

    class Config:
        from_attributes = True