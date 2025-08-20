from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.deliverables_schema import DeliverablesMaster, DeliverablesMasterCreate, DeliverablesMasterUpdate
from ..services.deliverables_service import (
    get_deliverables_list,
    get_deliverable,
    create_deliverable,
    update_deliverable,
    delete_deliverable,get_max_deliverable_no_by_category
)
from ..models.database import get_db
from ..utils.security import get_current_user
from ..schemas.user_schema import User

router = APIRouter(prefix="/deliverables", tags=["deliverables"])

@router.get("/", response_model=List[DeliverablesMaster])
async def read_deliverables(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    deliverables = await get_deliverables_list(db, skip=skip, limit=limit)
    return deliverables


@router.get("/getlastdeliverables", response_model=dict)
async def get_last_deliverable_numbers(
    db: AsyncSession = Depends(get_db)
):
    categories = ['B', 'D', 'A', 'S']
    last_numbers = {}
    
    for category in categories:
        max_no = await get_max_deliverable_no_by_category(db, category)
        last_numbers[category] = max_no
    
    return last_numbers

@router.post("/", response_model=DeliverablesMaster)
async def create_new_deliverable(
    deliverable: DeliverablesMasterCreate,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    return await create_deliverable(db=db, deliverable=deliverable)

@router.get("/{deliverable_id}", response_model=DeliverablesMaster)
async def read_deliverable(
    deliverable_id: int,
    db: AsyncSession = Depends(get_db)
):
    db_deliverable = await get_deliverable(db, deliverable_id=deliverable_id)
    if db_deliverable is None:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    return db_deliverable

@router.put("/{deliverable_id}", response_model=DeliverablesMaster)
async def update_existing_deliverable(
    deliverable_id: int,
    deliverable: DeliverablesMasterUpdate,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    updated_deliverable = await update_deliverable(
        db=db, 
        deliverable_id=deliverable_id, 
        deliverable=deliverable
    )
    if updated_deliverable is None:
        raise HTTPException(status_code=404, detail="Deliverable not found")
    return updated_deliverable

# @router.delete("/{deliverable_id}")
# async def delete_existing_deliverable(
#     deliverable_id: int,
#     db: AsyncSession = Depends(get_db),
#     # current_user: User = Depends(get_current_user)
# ):
#     success = await delete_deliverable(db=db, deliverable_id=deliverable_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="Deliverable not found")
#     return {"message": "Deliverable deleted successfully"}


@router.delete("/{deliverable_id}")
async def delete_deliverable_endpoint(deliverable_id: int, db: AsyncSession = Depends(get_db)):
    try:
        success = await delete_deliverable(db, deliverable_id)
        if success:
            return {"message": "Deliverable deleted successfully"}
        else:
            # Check if the deliverable exists
            db_deliverable = await get_deliverable(db, deliverable_id)
            if not db_deliverable:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Deliverable not found"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete deliverable. It is referenced in Category Wise Details."
                )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting deliverable: {str(e)}"
        )