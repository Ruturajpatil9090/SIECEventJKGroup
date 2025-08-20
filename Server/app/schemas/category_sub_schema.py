from pydantic import BaseModel
from typing import Optional

class CategorySubBase(BaseModel):
    CategorySub_Name: str
    CategoryId: int
   

class CategorySubCreate(CategorySubBase):
    pass

class CategorySubUpdate(BaseModel):
    CategorySub_Name: Optional[str] = None
    CategoryId: Optional[int] = None

class CategorySubResponse(CategorySubBase):
    CategorySubMasterId: int
    category_name: Optional[str] = None

    class Config:
        from_attributes = True