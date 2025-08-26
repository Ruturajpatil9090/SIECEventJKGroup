# services/passes_registry_services.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func,asc
from typing import List, Optional
from ..models.passes_registry_models import Eve_PassesRegistry, Eve_PassessRegistryDetail
from ..schemas.passes_registry_schema import PassRegistryCreate, PassRegistryUpdate

async def get_passes_registries(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_PassesRegistry)
        .order_by(asc(Eve_PassesRegistry.PassessRegistryId))  
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_passes_registry(db: AsyncSession, registry_id: int):
    result = await db.execute(
        select(Eve_PassesRegistry).where(Eve_PassesRegistry.PassessRegistryId == registry_id)
    )
    return result.scalar_one_or_none()

async def create_passes_registry(db: AsyncSession, registry_data: PassRegistryCreate):
    db_registry = Eve_PassesRegistry(**registry_data.dict(exclude={"details"}))
    db.add(db_registry)
    await db.flush()  # Get the ID
    
    # Process details
    created_details = []
    for detail in registry_data.details:
        if detail.rowaction == "add" or not detail.rowaction:
            db_detail = Eve_PassessRegistryDetail(
                **detail.dict(exclude={"rowaction"}),
                PassessRegistryId=db_registry.PassessRegistryId
            )
            db.add(db_detail)
            created_details.append(db_detail)
    
    await db.commit()
    await db.refresh(db_registry)
    return db_registry

async def update_passes_registry(
    db: AsyncSession, 
    registry_id: int, 
    registry_data: PassRegistryUpdate
):
    result = await db.execute(
        select(Eve_PassesRegistry).where(Eve_PassesRegistry.PassessRegistryId == registry_id)
    )
    db_registry = result.scalar_one_or_none()
    
    if not db_registry:
        return None
    
    update_data = registry_data.dict(exclude_unset=True, exclude={"details"})
    for field, value in update_data.items():
        setattr(db_registry, field, value)

    
    # Process details
    created_details = []
    updated_details = []
    deleted_details = []
    
    if registry_data.details:
        for detail in registry_data.details:
            if detail.rowaction == "add":
                db_detail = Eve_PassessRegistryDetail(
                    **detail.dict(exclude={"rowaction"}),
                    PassessRegistryId=registry_id
                )
                db.add(db_detail)
                created_details.append(db_detail)
            
            elif detail.rowaction == "update":
                result = await db.execute(
                    select(Eve_PassessRegistryDetail).where(
                        Eve_PassessRegistryDetail.PassessRegistryDetailId == getattr(detail, 'PassessRegistryDetailId', None)
                    )
                )
                existing_detail = result.scalar_one_or_none()
                
                if existing_detail:
                    update_data = detail.dict(exclude_unset=True, exclude={"rowaction", "PassessRegistryDetailId"})
                    for field, value in update_data.items():
                        setattr(existing_detail, field, value)
                    updated_details.append(existing_detail)
            
            elif detail.rowaction == "delete":
                result = await db.execute(
                    select(Eve_PassessRegistryDetail).where(
                        Eve_PassessRegistryDetail.PassessRegistryDetailId == getattr(detail, 'PassessRegistryDetailId', None)
                    )
                )
                existing_detail = result.scalar_one_or_none()
                
                if existing_detail:
                    await db.delete(existing_detail)
                    deleted_details.append(existing_detail.PassessRegistryDetailId)
    
    await db.commit()
    await db.refresh(db_registry)
    return db_registry

async def delete_passes_registry(db: AsyncSession, registry_id: int):
    result = await db.execute(
        select(Eve_PassesRegistry).where(Eve_PassesRegistry.PassessRegistryId == registry_id)
    )
    db_registry = result.scalar_one_or_none()
    
    if db_registry:
        await db.delete(db_registry)
        await db.commit()
        return True
    
    return False

async def get_max_registry_id(db: AsyncSession):
    result = await db.execute(select(func.max(Eve_PassesRegistry.PassessRegistryId)))
    return result.scalar() or 0