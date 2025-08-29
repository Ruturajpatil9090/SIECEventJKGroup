# routes/passes_registry.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import json
from app.websockets.connection_manager import manager

from ..schemas.passes_registry_schema import (
    PassRegistry, 
    PassRegistryCreate, 
    PassRegistryUpdate
)
from ..services.passes_registry_services import (
    get_passes_registries,
    get_passes_registry,
    create_passes_registry,
    update_passes_registry,
    delete_passes_registry,
    get_max_registry_id
)
from ..models.database import get_db

router = APIRouter(
    prefix="/passes-registry",
    tags=["passes-registry"]
)

@router.get("/", response_model=List[PassRegistry])
async def read_passes_registries(
    event_code: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    registries = await get_passes_registries(db,event_code=event_code, skip=skip, limit=limit)
    return registries

@router.get("/max-id", response_model=int)
async def get_max_registry_id_endpoint(db: AsyncSession = Depends(get_db)):
    return await get_max_registry_id(db)

@router.post("/", response_model=PassRegistry, status_code=status.HTTP_201_CREATED)
async def create_passes_registry_endpoint(
    registry_data: PassRegistryCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_passes_registry(db, registry_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{registry_id}", response_model=PassRegistry)
async def read_passes_registry(
    registry_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_registry = await get_passes_registry(db, registry_id=registry_id)
    if db_registry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passes registry not found"
        )
    return db_registry

@router.put("/{registry_id}", response_model=PassRegistry)
async def update_passes_registry_endpoint(
    registry_id: int,
    registry_data: PassRegistryUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        updated_registry = await update_passes_registry(
            db=db, 
            registry_id=registry_id, 
            registry_data=registry_data,
            ws_manager=manager
        )
        if updated_registry is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Passes registry not found"
            )
        return updated_registry
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{registry_id}")
async def delete_passes_registry_endpoint(
    registry_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_passes_registry(db=db, registry_id=registry_id, ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Passes registry not found"
        )
    return {"message": "Passes registry deleted successfully"}

# Alternative endpoint using JSON string for form data compatibility
@router.post("/json", response_model=PassRegistry, status_code=status.HTTP_201_CREATED)
async def create_passes_registry_json_endpoint(
    registry_data: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        registry_dict = json.loads(registry_data)
        registry_create = PassRegistryCreate(**registry_dict)
        return await create_passes_registry(db, registry_create)
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