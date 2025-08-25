from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.category_schema import Category, CategoryCreate, CategoryUpdate
from ..services.category_service import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
    get_max_category_id
)
from ..models.database import get_db
from ..utils.security import get_current_user
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@router.get("/", response_model=List[Category])
async def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    categories = await get_categories(db, skip=skip, limit=limit)
    return categories

@router.get("/getlastCategoryMaster", response_model=int)
async def get_max_category_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_category_id(db)

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category_endpoint(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_category(db, category_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{category_id}", response_model=Category)
async def read_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_category = await get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return db_category

@router.put("/{category_id}", response_model=Category)
async def update_existing_category(
    category_id: int,
    category: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_category = await update_category(db=db, category_id=category_id, category=category,ws_manager=manager)
    if updated_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return updated_category

# @router.delete("/{category_id}")
# async def delete_existing_category(
#     category_id: int,
#     db: AsyncSession = Depends(get_db),
# ):
#     success = await delete_category(db=db, category_id=category_id)
#     if not success:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Category not found"
#         )
#     return {"message": "Category deleted successfully"}


@router.delete("/{category_id}")
async def delete_category_endpoint(category_id: int, db: AsyncSession = Depends(get_db)):
    try:
        success = await delete_category(db, category_id,ws_manager=manager)
        if success:
            return {"message": "Category deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cannot Delete this is referenced to Sub category Master."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting category: {str(e)}"
        )