from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.award_subcategory_schema import (
    AwardSubCategory, 
    AwardSubCategoryCreate, 
    AwardSubCategoryUpdate,
    AwardSubCategoryWithAward
)
from ..services.award_subcategory_service import (
    get_award_subcategory,
    get_all_award_subcategories,
    create_award_subcategory,
    update_award_subcategory,
    delete_award_subcategory,
    get_max_award_subcategory_id,
    get_subcategories_by_award_id,
    get_award_subcategories_with_details
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/award-subcategories",
    tags=["award-subcategories"]
)

@router.get("/", response_model=List[AwardSubCategoryWithAward])
async def get_all_award_subcategories_endpoint(
    award_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if award_id:
        return await get_subcategories_by_award_id(db, award_id)
    return await get_all_award_subcategories(db)

@router.get("/with-details", response_model=List[AwardSubCategoryWithAward])
async def get_award_subcategories_with_details_endpoint(
    db: AsyncSession = Depends(get_db)
):
    return await get_award_subcategories_with_details(db)

@router.get("/getlastAwardSubCategoryId", response_model=int)
async def get_max_award_subcategory_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_award_subcategory_id(db)

@router.post("/", response_model=AwardSubCategory, status_code=status.HTTP_201_CREATED)
async def create_award_subcategory_endpoint(
    subcategory_data: AwardSubCategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_award_subcategory(db, subcategory_data, ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{subcategory_id}", response_model=AwardSubCategory)
async def read_award_subcategory(
    subcategory_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_subcategory = await get_award_subcategory(db, subcategory_id=subcategory_id)
    if db_subcategory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Award subcategory not found"
        )
    return db_subcategory

@router.put("/{subcategory_id}", response_model=AwardSubCategory)
async def update_existing_award_subcategory(
    subcategory_id: int,
    subcategory: AwardSubCategoryUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_subcategory = await update_award_subcategory(db=db, subcategory_id=subcategory_id, subcategory=subcategory, ws_manager=manager)
    if updated_subcategory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Award subcategory not found"
        )
    return updated_subcategory

@router.delete("/{subcategory_id}")
async def delete_existing_award_subcategory(
    subcategory_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_award_subcategory(db=db, subcategory_id=subcategory_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Award subcategory not found"
        )
    return {"message": "Award subcategory deleted successfully"}