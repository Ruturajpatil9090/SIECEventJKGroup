from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.CategoryWiseDeliverables_schema import (
    Deliverable,
    DeliverableCreate,
    DeliverableUpdate
)
from ..services.CategoryWiseDeliverables_services import (
    get_deliverables,
    get_deliverable,
    create_deliverable,
    update_deliverable,
    delete_deliverable,
    get_max_deliverable_id,
    get_all_deliverables_with_details
)
from ..models.database import get_db

router = APIRouter(
    prefix="/categorywisedeliverables",
    tags=["categorywisedeliverables"]
)

# @router.get("/", response_model=List[Deliverable])
# async def read_deliverables(
#     skip: int = 0,
#     limit: int = 100,
#     db: AsyncSession = Depends(get_db),
# ):
#     deliverables = await get_deliverables(db, skip=skip, limit=limit)
#     return deliverables


@router.get("/")
async def get_category_wise_deliverables_with_details(
    skip: int = 0, 
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    results = await get_all_deliverables_with_details(db, skip, limit)
    grouped_results = {}
    for row in results:
        cat_deliverable_id = row['CatDeliverableId']
        
        if cat_deliverable_id not in grouped_results:
            grouped_results[cat_deliverable_id] = {
                "Event_Code": row['Event_Code'],
                "CategoryMaster_Code": row['CategoryMaster_Code'],
                "CategorySubMaster_Code": row['CategorySubMaster_Code'],
                "category_name": row['category_name'],
                "CategorySub_Name": row['CategorySub_Name'],
                "EventMaster_Name": row['EventMaster_Name'],
                "EventSuper_Name": row['EventSuper_Name'],
                "CatDeliverableId": cat_deliverable_id,
                "details": []
            }
        
        if row['Deliverabled_Code'] is not None:
            grouped_results[cat_deliverable_id]['details'].append({
                "Deliverabled_Code": row['Deliverabled_Code'],
                "Deliverable_No": row['Deliverable_No'],
                "CatDeliverableDetailId": row['CatDeliverableDetailId'],
                "CatDeliverableId": cat_deliverable_id
            })
    
    return list(grouped_results.values())

@router.get("/getlastDeliverableId", response_model=int)
async def get_max_deliverable_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_deliverable_id(db)

@router.post("/", response_model=Deliverable, status_code=status.HTTP_201_CREATED)
async def create_deliverable_endpoint(
    deliverable_data: DeliverableCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_deliverable(db, deliverable_data)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{deliverable_id}", response_model=Deliverable)
async def read_deliverable(
    deliverable_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_deliverable = await get_deliverable(db, deliverable_id=deliverable_id)
    if db_deliverable is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deliverable not found"
        )
    return db_deliverable

@router.put("/{deliverable_id}", response_model=Deliverable)
async def update_existing_deliverable(
    deliverable_id: int,
    deliverable: DeliverableUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_deliverable = await update_deliverable(
        db=db, 
        deliverable_id=deliverable_id, 
        deliverable=deliverable
    )
    if updated_deliverable is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deliverable not found"
        )
    return updated_deliverable

@router.delete("/{deliverable_id}")
async def delete_existing_deliverable(
    deliverable_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_deliverable(db=db, deliverable_id=deliverable_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deliverable not found"
        )
    return {"message": "Deliverable deleted successfully"}