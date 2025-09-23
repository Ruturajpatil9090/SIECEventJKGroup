from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import json

from ..schemas.team_master_schema import (
    TeamMasterHead, 
    TeamMasterHeadCreate, 
    TeamMasterHeadUpdate
)
from ..services.team_master_services import (
    get_team_masters,
    get_team_master,
    create_team_master,
    update_team_master,
    delete_team_master,
    get_max_team_master_id
)
from ..models.database import get_db

router = APIRouter(
    prefix="/team-master",
    tags=["team-master"]
)

@router.get("/", response_model=List[TeamMasterHead])
async def read_team_masters(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    teams = await get_team_masters(db, skip=skip, limit=limit)
    return teams

@router.get("/max-id", response_model=int)
async def get_max_team_master_id_endpoint(db: AsyncSession = Depends(get_db)):
    return await get_max_team_master_id(db)

@router.post("/", response_model=TeamMasterHead, status_code=status.HTTP_201_CREATED)
async def create_team_master_endpoint(
    team_data: TeamMasterHeadCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_team_master(db, team_data)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{team_master_id}", response_model=TeamMasterHead)
async def read_team_master(
    team_master_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_team = await get_team_master(db, team_master_id=team_master_id)
    if db_team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team master not found"
        )
    return db_team

@router.put("/{team_master_id}", response_model=TeamMasterHead)
async def update_team_master_endpoint(
    team_master_id: int,
    team_data: TeamMasterHeadUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        updated_team = await update_team_master(
            db=db, 
            team_master_id=team_master_id, 
            team_data=team_data
        )
        if updated_team is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team master not found"
            )
        return updated_team
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{team_master_id}")
async def delete_team_master_endpoint(
    team_master_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_team_master(db=db, team_master_id=team_master_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team master not found"
        )
    return {"message": "Team master deleted successfully"}

@router.post("/json", response_model=TeamMasterHead, status_code=status.HTTP_201_CREATED)
async def create_team_master_json_endpoint(
    team_data: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        team_dict = json.loads(team_data)
        team_create = TeamMasterHeadCreate(**team_dict)
        return await create_team_master(db, team_create)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON data"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )