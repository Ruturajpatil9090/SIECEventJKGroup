# services/passes_registry_services.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func,asc,text
from typing import List, Optional
from ..models.passes_registry_models import Eve_PassesRegistry, Eve_PassessRegistryDetail
from ..schemas.passes_registry_schema import PassRegistryCreate, PassRegistryUpdate
from fastapi import APIRouter, Depends, HTTPException
from ..websockets.connection_manager import ConnectionManager

# async def get_passes_registries(db: AsyncSession, skip: int = 0, limit: int = 100):
#     result = await db.execute(
#         select(Eve_PassesRegistry)
#         .order_by(asc(Eve_PassesRegistry.PassessRegistryId))  
#         .offset(skip)
#         .limit(limit)
#     )
#     return result.scalars().all()

# async def get_passes_registries(db: AsyncSession, skip: int = 0, limit: int = 100):
#     query = text("""
# SELECT        dbo.Eve_DeliverablesMaster.Deliverables, dbo.Eve_EventMaster.EventMaster_Name, dbo.Eve_PassesRegistry.*, dbo.Eve_PassessRegistryDetail.*
# FROM            dbo.Eve_PassesRegistry INNER JOIN
#                          dbo.Eve_DeliverablesMaster ON dbo.Eve_PassesRegistry.Deliverabled_Code = dbo.Eve_DeliverablesMaster.id INNER JOIN
#                          dbo.Eve_EventMaster ON dbo.Eve_PassesRegistry.Event_Code = dbo.Eve_EventMaster.EventMasterId INNER JOIN
#                          dbo.Eve_PassessRegistryDetail ON dbo.Eve_PassesRegistry.PassessRegistryId = dbo.Eve_PassessRegistryDetail.PassessRegistryId
#     """)
    
#     result = await db.execute(query)
#     return result.mappings().all()

async def get_passes_registries(db: AsyncSession, event_code: int, skip: int = 0, limit: int = 100):
    query = text("""
    SELECT        
        dm.Deliverables, 
        em.EventMaster_Name, 
        pr.*,
        prd.PassessRegistryDetailId,
        prd.Pass_type,
        prd.Assigen_Name,
        prd.Mobile_No,
        prd.Email_Address,
        prd.Designation,
        prd.Remark,
        prd.PassessRegistryId as detail_RegistryId
    FROM            
        dbo.Eve_PassesRegistry pr
    INNER JOIN dbo.Eve_DeliverablesMaster dm
        ON pr.Deliverabled_Code = dm.id 
    INNER JOIN dbo.Eve_EventMaster em
        ON pr.Event_Code = em.EventMasterId 
    LEFT JOIN dbo.Eve_PassessRegistryDetail prd
        ON pr.PassessRegistryId = prd.PassessRegistryId
                 WHERE        pr.Event_Code = :event_code
    ORDER BY 
        pr.PassessRegistryId DESC,
        prd.PassessRegistryDetailId ASC
    OFFSET :skip ROWS FETCH NEXT :limit ROWS ONLY
    """)
    
    try:
        result = await db.execute(query, {"event_code": event_code,"skip": skip, "limit": limit})
        rows = result.mappings().all()
        
        # Group the results by PassessRegistryId
        registries_dict = {}
        
        for row in rows:
            row_dict = dict(row)
            registry_id = row_dict['PassessRegistryId']
            
            if registry_id not in registries_dict:
                registries_dict[registry_id] = {
                    "PassessRegistryId": registry_id,
                    "SponsorMasterId": row_dict.get('SponsorMasterId'),
                    "Event_Code": row_dict.get('Event_Code'),
                    "Deliverabled_Code": row_dict.get('Deliverabled_Code'),
                    "Elite_Passess": row_dict.get('Elite_Passess'),
                    "Carporate_Passess": row_dict.get('Carporate_Passess'),
                    "Visitor_Passess": row_dict.get('Visitor_Passess'),
                    "Deligate_Name_Recieverd": row_dict.get('Deligate_Name_Recieverd'),
                    "CreatedDate": row_dict.get('CreatedDate'),
                    "ModifiedDate": row_dict.get('ModifiedDate'),
                    "CreatedBy": row_dict.get('CreatedBy'),
                    "ModifiedBy": row_dict.get('ModifiedBy'),
                    "EventMaster_Name": row_dict.get('EventMaster_Name'),
                    "Deliverables": row_dict.get('Deliverables'),
                    "details": []
                }
            
            if row_dict.get('PassessRegistryDetailId') is not None:
                detail_data = {
                    "PassessRegistryDetailId": row_dict.get('PassessRegistryDetailId'),
                    "PassessRegistryId": row_dict.get('detail_RegistryId'),
                    "Pass_type": row_dict.get('Pass_type'),
                    "Assigen_Name": row_dict.get('Assigen_Name'),
                    "Mobile_No": row_dict.get('Mobile_No'),
                    "Email_Address": row_dict.get('Email_Address'),
                    "Designation": row_dict.get('Designation'),
                    "Remark": row_dict.get('Remark')
                }
                if any(value is not None for value in detail_data.values() if value != detail_data['PassessRegistryDetailId']):
                    registries_dict[registry_id]["details"].append(detail_data)
        
        return list(registries_dict.values())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching passes registries: {str(e)}")

async def get_passes_registry(db: AsyncSession, registry_id: int):
    result = await db.execute(
        select(Eve_PassesRegistry).where(Eve_PassesRegistry.PassessRegistryId == registry_id)
    )
    return result.scalar_one_or_none()

# async def create_passes_registry(db: AsyncSession, registry_data: PassRegistryCreate):
#     db_registry = Eve_PassesRegistry(**registry_data.dict(exclude={"details"}))
#     db.add(db_registry)
#     await db.flush()  # Get the ID
    
#     # Process details
#     created_details = []
#     for detail in registry_data.details:
#         if detail.rowaction == "add" or not detail.rowaction:
#             db_detail = Eve_PassessRegistryDetail(
#                 **detail.dict(exclude={"rowaction"}),
#                 PassessRegistryId=db_registry.PassessRegistryId
#             )
#             db.add(db_detail)
#             created_details.append(db_detail)
    
#     await db.commit()
#     await db.refresh(db_registry)
#     return db_registry


async def create_passes_registry(db: AsyncSession, registry_data: PassRegistryCreate,ws_manager: Optional[ConnectionManager] = None):
    add_details = [detail for detail in registry_data.details if detail.rowaction == "add"]
    
    if not add_details:
        raise HTTPException(
            status_code=400, 
            detail="Please Add At least one detail entry."
        )
    
    db_registry = Eve_PassesRegistry(**registry_data.dict(exclude={"details"}))
    db.add(db_registry)
    await db.flush()  
    
    created_details = []
    for detail in registry_data.details:
        if detail.rowaction == "add":
            db_detail = Eve_PassessRegistryDetail(
                **detail.dict(exclude={"rowaction", "PassessRegistryDetailId"}),
                PassessRegistryId=db_registry.PassessRegistryId
            )
            db.add(db_detail)
            created_details.append(db_detail)
    
    try:
        await db.commit()
        if ws_manager:
            await ws_manager.broadcast(message="refresh_passes_registries")
        await db.refresh(db_registry)
        
        db_registry.details = created_details
        return db_registry
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create passes registry: {str(e)}"
        )

async def update_passes_registry(
    db: AsyncSession, 
    registry_id: int, 
    registry_data: PassRegistryUpdate,
    ws_manager: Optional[ConnectionManager] = None
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
    if ws_manager:
            await ws_manager.broadcast(message="refresh_passes_registries")
    await db.refresh(db_registry)
    return db_registry

async def delete_passes_registry(db: AsyncSession, registry_id: int, ws_manager: Optional[ConnectionManager] = None):
    result = await db.execute(
        select(Eve_PassesRegistry).where(Eve_PassesRegistry.PassessRegistryId == registry_id)
    )
    db_registry = result.scalar_one_or_none()
    
    if db_registry:
        await db.delete(db_registry)
        await db.commit()
        if ws_manager:
            await ws_manager.broadcast(message="refresh_passes_registries")
        return True
    
    return False

async def get_max_registry_id(db: AsyncSession):
    result = await db.execute(select(func.max(Eve_PassesRegistry.PassessRegistryId)))
    return result.scalar() or 0