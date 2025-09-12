from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..models.database import get_db
from ..schemas.category_sub_schema import (
    CategorySubCreate,
    CategorySubUpdate,
    CategorySubResponse
)
from ..services.category_sub_service import (
    create_category_sub,
    get_category_sub,
    get_category_subs_by_category,
    update_category_sub,
    delete_category_sub,
    get_all_category_subs,
    get_max_categorySubMasterId,
    get_all_Categories
)
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/category-subs",
    tags=["Category Sub Master"]
)

@router.post("/", response_model=CategorySubResponse, status_code=status.HTTP_201_CREATED)
async def create_subcategory(
    category_sub: CategorySubCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_category_sub(db, category_sub,ws_manager=manager)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating subcategory: {str(e)}"
        )

@router.get("/", response_model=List[CategorySubResponse])
async def get_all_Categories_data(db: AsyncSession = Depends(get_db)):
    results = await get_all_Categories(db)
    return results
    
@router.get("/getlastCategorySubMaster", response_model=int)
async def get_max_category_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_categorySubMasterId(db)

@router.get("/{category_sub_id}", response_model=CategorySubResponse)
async def read_subcategory(
    category_sub_id: int,
    db: AsyncSession = Depends(get_db)
):
    db_category_sub = await get_category_sub(db, category_sub_id)
    if not db_category_sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found"
        )
    return db_category_sub

@router.get("/by-category/{category_id}", response_model=List[CategorySubResponse])
async def read_subcategories_by_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    category_subs = await get_category_subs_by_category(db, category_id)
    if not category_subs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subcategories found for this category"
        )
    return category_subs

@router.put("/{category_sub_id}", response_model=CategorySubResponse)
async def update_subcategory(
    category_sub_id: int,
    category_sub: CategorySubUpdate,
    db: AsyncSession = Depends(get_db)
):
    updated_subcategory = await update_category_sub(db, category_sub_id, category_sub,ws_manager=manager)
    if not updated_subcategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found"
        )
    return updated_subcategory

@router.delete("/{category_sub_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subcategory(
    category_sub_id: int,
    db: AsyncSession = Depends(get_db)
):
    success = await delete_category_sub(db, category_sub_id,ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found"
        )
    return None