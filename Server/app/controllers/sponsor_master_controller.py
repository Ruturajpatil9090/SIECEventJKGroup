from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..schemas.sponsor_master_schema import (
    SponsorMaster,
    SponsorMasterCreate,
    SponsorMasterUpdate
)
from ..services.sponsor_master_services import (
    get_sponsors,
    get_sponsor,
    create_sponsor,
    update_sponsor,
    delete_sponsor,
    get_max_sponsor_id,
    get_sponsors_with_details
)
from ..models.database import get_db

router = APIRouter(
    prefix="/sponsors",
    tags=["sponsors"]
)

@router.get("/", response_model=List[SponsorMaster])
async def read_sponsors(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    sponsors = await get_sponsors(db, skip=skip, limit=limit)
    return sponsors

@router.get("/getSponsorsById", response_model=List[SponsorMaster])
async def get_sponsors_with_details_endpoint(
    skip: int = 0, 
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    sponsors = await get_sponsors_with_details(db, skip, limit)
    return sponsors

@router.get("/getlastSponsorId", response_model=int)
async def get_max_sponsor_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_sponsor_id(db)

@router.post("/", response_model=SponsorMaster, status_code=status.HTTP_201_CREATED)
async def create_sponsor_endpoint(
    sponsor_data: SponsorMasterCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_sponsor(db, sponsor_data)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{sponsor_id}", response_model=SponsorMaster)
async def read_sponsor(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_sponsor = await get_sponsor(db, sponsor_id=sponsor_id)
    if db_sponsor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    return db_sponsor

@router.put("/{sponsor_id}", response_model=SponsorMaster)
async def update_existing_sponsor(
    sponsor_id: int,
    sponsor: SponsorMasterUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_sponsor = await update_sponsor(
        db=db, 
        sponsor_id=sponsor_id, 
        sponsor_data=sponsor
    )
    if updated_sponsor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    return updated_sponsor

@router.delete("/{sponsor_id}")
async def delete_existing_sponsor(
    sponsor_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_sponsor(db=db, sponsor_id=sponsor_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found"
        )
    return {"message": "Sponsor deleted successfully"}