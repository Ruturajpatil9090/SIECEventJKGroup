# services/passes_registry_services.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func,asc,text
from typing import List, Optional
from ..models.passes_registry_models import Eve_PassesRegistry, Eve_PassessRegistryDetail
from ..schemas.passes_registry_schema import PassRegistryCreate, PassRegistryUpdate
from fastapi import APIRouter, Depends, HTTPException
from ..websockets.connection_manager import ConnectionManager


async def get_passes_registries(db: AsyncSession, event_code: int, skip: int = 0, limit: int = 100):
    query = text("""
   SELECT        TOP (100) PERCENT dm.Deliverables, em.EventMaster_Name, pr.PassessRegistryId, pr.Deliverabled_Code, pr.Event_Code, pr.Elite_Passess, pr.Carporate_Passess, pr.Visitor_Passess, pr.Deligate_Name_Recieverd, 
                         pr.SponsorMasterId, pr.Deliverable_No, prd.PassessRegistryDetailId, prd.Pass_type, prd.Assigen_Name, prd.Mobile_No, prd.Email_Address, prd.Designation, prd.Remark, prd.PassessRegistryId AS detail_RegistryId, 
                         dbo.Eve_SponsorMaster.Sponsor_Name,pr.Registration_Form_Sent
FROM            dbo.Eve_PassesRegistry AS pr INNER JOIN
                         dbo.Eve_DeliverablesMaster AS dm ON pr.Deliverabled_Code = dm.id INNER JOIN
                         dbo.Eve_EventMaster AS em ON pr.Event_Code = em.EventMasterId INNER JOIN
                         dbo.Eve_SponsorMaster ON pr.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId LEFT OUTER JOIN
                         dbo.Eve_PassessRegistryDetail AS prd ON pr.PassessRegistryId = prd.PassessRegistryId
WHERE    pr.Event_Code = :event_code
ORDER BY pr.PassessRegistryId DESC, prd.PassessRegistryDetailId
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
                    "Sponsor_Name": row_dict.get('Sponsor_Name'),
                    "Registration_Form_Sent": row_dict.get('Registration_Form_Sent'),
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
    

async def get_passessRegistry_details(db: AsyncSession, PassessRegistryId: Optional[int] = None):
    query = text("""
SELECT        dbo.Eve_PassessRegistryDetail.Pass_type, dbo.Eve_PassessRegistryDetail.Assigen_Name, dbo.Eve_PassessRegistryDetail.Mobile_No, dbo.Eve_PassessRegistryDetail.Email_Address, 
                         dbo.Eve_PassessRegistryDetail.Designation, dbo.Eve_PassessRegistryDetail.Remark, dbo.Eve_PassesRegistry.Carporate_Passess, dbo.Eve_PassesRegistry.Visitor_Passess, dbo.Eve_PassesRegistry.Elite_Passess, 
                         dbo.Eve_PassesRegistry.PassessRegistryId, dbo.Eve_PassesRegistry.Deligate_Name_Recieverd, dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_EventMaster.EventMaster_Name, 
                         dbo.Eve_PassesRegistry.Registration_Form_Sent
FROM            dbo.Eve_PassesRegistry INNER JOIN
                         dbo.Eve_SponsorMaster ON dbo.Eve_PassesRegistry.SponsorMasterId = dbo.Eve_SponsorMaster.SponsorMasterId INNER JOIN
                         dbo.Eve_EventMaster ON dbo.Eve_PassesRegistry.Event_Code = dbo.Eve_EventMaster.EventMasterId LEFT OUTER JOIN
                         dbo.Eve_PassessRegistryDetail ON dbo.Eve_PassesRegistry.PassessRegistryId = dbo.Eve_PassessRegistryDetail.PassessRegistryId
WHERE    dbo.Eve_PassesRegistry.PassessRegistryId = :PassessRegistryId
    """)
    
    result = await db.execute(query, {'PassessRegistryId': PassessRegistryId})
    return result.mappings().all()


async def get_passes_registry(db: AsyncSession, registry_id: int):
    result = await db.execute(
        select(Eve_PassesRegistry).where(Eve_PassesRegistry.PassessRegistryId == registry_id)
    )
    return result.scalar_one_or_none()


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