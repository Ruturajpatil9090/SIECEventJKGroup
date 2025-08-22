from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update,text
from typing import List, Optional
from ..models.sponsor_master_model import Eve_SponsorMaster, Eve_SponsorMasterDetail
from ..schemas.sponsor_master_schema import SponsorMasterCreate, SponsorMasterUpdate
from ..models.expo_registry_tracker_model import ExpoRegistryTracker
from ..utils.file_upload import save_upload_file, delete_upload_file
import os

async def get_sponsors(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .order_by(Eve_SponsorMaster.SponsorMasterId) 
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_all_sponsor_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
    SELECT        
        dbo.Eve_SponsorMaster.*, 
        dbo.Eve_SponsorMasterDetail.*, 
        dbo.Eve_EventMaster.EventMaster_Name, 
        dbo.Eve_CategoryMaster.category_name, 
        dbo.Eve_CategorySubMaster.CategorySub_Name, 
        dbo.tbluser.User_Name
    FROM dbo.Eve_SponsorMaster 
    INNER JOIN dbo.Eve_SponsorMasterDetail ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_SponsorMasterDetail.SponsorMasterId 
    INNER JOIN dbo.Eve_EventMaster ON dbo.Eve_SponsorMaster.Event_Code = dbo.Eve_EventMaster.EventMasterId 
    INNER JOIN dbo.Eve_CategoryMaster ON dbo.Eve_SponsorMaster.CategoryMaster_Code = dbo.Eve_CategoryMaster.CategoryId 
    INNER JOIN dbo.Eve_CategorySubMaster ON dbo.Eve_SponsorMaster.CategorySubMaster_Code = dbo.Eve_CategorySubMaster.CategorySubMasterId 
    INNER JOIN dbo.tbluser ON dbo.Eve_SponsorMaster.User_Id = dbo.tbluser.User_Id
    ORDER BY dbo.Eve_SponsorMaster.SponsorMasterId DESC
    """)
    
    result = await db.execute(query, {"skip": skip, "limit": limit})
    return result.mappings().all()


async def get_sponsor(db: AsyncSession, sponsor_id: int):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .where(Eve_SponsorMaster.SponsorMasterId == sponsor_id)
    )
    return result.scalar_one_or_none()

async def get_max_sponsor_id(db: AsyncSession):
    result = await db.execute(
        select(func.max(Eve_SponsorMaster.SponsorMasterId))
    )
    return result.scalar() or 0

# async def create_sponsor(db: AsyncSession, sponsor_data: SponsorMasterCreate, logo_file = None):
#     logo_path = None
#     if logo_file:
#         logo_path = await save_upload_file(logo_file)
    
#     sponsor_dict = sponsor_data.model_dump(exclude={'details'})
#     if logo_path:
#         sponsor_dict['Sponsor_logo'] = logo_path
    
#     db_sponsor = Eve_SponsorMaster(**sponsor_dict)
#     db.add(db_sponsor)
#     await db.flush()
    
#     max_id_result = await db.execute(
#         select(func.max(Eve_SponsorMasterDetail.ID))
#         .where(Eve_SponsorMasterDetail.SponsorMasterId == db_sponsor.SponsorMasterId)
#     )
#     current_id = max_id_result.scalar() or 0
    
#     for detail_data in sponsor_data.details:
#         current_id += 1
#         db_detail = Eve_SponsorMasterDetail(
#             SponsorMasterId=db_sponsor.SponsorMasterId,
#             ID=current_id,
#             Deliverabled_Code=detail_data.Deliverabled_Code,
#             Deliverable_No=detail_data.Deliverable_No
#         )
#         db.add(db_detail)
    
#     await db.commit()
#     await db.refresh(db_sponsor)
#     return db_sponsor



# async def create_sponsor(db: AsyncSession, sponsor_data: SponsorMasterCreate, logo_file = None):
#     logo_path = None
#     if logo_file:
#         logo_path = await save_upload_file(logo_file)
    
#     sponsor_dict = sponsor_data.model_dump(exclude={'details'})
#     if logo_path:
#         sponsor_dict['Sponsor_logo'] = logo_path
    
#     db_sponsor = Eve_SponsorMaster(**sponsor_dict)
#     db.add(db_sponsor)
#     await db.flush()
    
#     max_id_result = await db.execute(
#         select(func.max(Eve_SponsorMasterDetail.ID))
#         .where(Eve_SponsorMasterDetail.SponsorMasterId == db_sponsor.SponsorMasterId)
#     )
#     current_id = max_id_result.scalar() or 0
    
#     for detail_data in sponsor_data.details:
#         current_id += 1
#         db_detail = Eve_SponsorMasterDetail(
#             SponsorMasterId=db_sponsor.SponsorMasterId,
#             ID=current_id,
#             Deliverabled_Code=detail_data.Deliverabled_Code,
#             Deliverable_No=detail_data.Deliverable_No
#         )
#         db.add(db_detail)
        
#         # Check if Deliverabled_Code is 31 and create ExpoRegistryTracker entry
#         if detail_data.Deliverabled_Code == 31:
#             expo_tracker_data = ExpoRegistryTrackerCreate(
#                 Deliverabled_Code=str(detail_data.Deliverabled_Code),
#                 Deliverable_No=detail_data.Deliverable_No,
#                 SponsorMasterId=db_sponsor.SponsorMasterId,
#                 Event_Code=sponsor_data.Event_Code,
#                 Booth_to_be_provided="Y",  # Convert to string "Y"
#                 Booth_Assigned="N",        # Convert to string "N"
#                 Booth_Number_Assigned=None,
#                 Logo_Details_Received="N", # Convert to string "N"
#                 Notes_Comments=f"Auto-created for sponsor {db_sponsor.SponsorMasterId}"
#             )
#             db_expo_tracker = ExpoRegistryTracker(**expo_tracker_data.model_dump())
#             db.add(db_expo_tracker)
    
#     await db.commit()
#     await db.refresh(db_sponsor)
#     return db_sponsor



async def create_sponsor(db: AsyncSession, sponsor_data: SponsorMasterCreate, logo_file = None):
    logo_path = None
    if logo_file:
        logo_path = await save_upload_file(logo_file)
    
    sponsor_dict = sponsor_data.model_dump(exclude={'details'})
    if logo_path:
        sponsor_dict['Sponsor_logo'] = logo_path
    
    db_sponsor = Eve_SponsorMaster(**sponsor_dict)
    db.add(db_sponsor)
    await db.flush()
    
    max_id_result = await db.execute(
        select(func.max(Eve_SponsorMasterDetail.ID))
        .where(Eve_SponsorMasterDetail.SponsorMasterId == db_sponsor.SponsorMasterId)
    )
    current_id = max_id_result.scalar() or 0
    
    for detail_data in sponsor_data.details:
        current_id += 1
        db_detail = Eve_SponsorMasterDetail(
            SponsorMasterId=db_sponsor.SponsorMasterId,
            ID=current_id,
            Deliverabled_Code=detail_data.Deliverabled_Code,
            Deliverable_No=detail_data.Deliverable_No
        )
        db.add(db_detail)
        
        if detail_data.Deliverabled_Code == 31:
            db_expo_tracker = ExpoRegistryTracker(
                Deliverabled_Code=detail_data.Deliverabled_Code,  
                Deliverable_No=detail_data.Deliverable_No,       
                SponsorMasterId=db_sponsor.SponsorMasterId,
                Event_Code=sponsor_data.Event_Code,
                Booth_to_be_provided="Y",
                Booth_Assigned="N",
                Booth_Number_Assigned= '',
                Logo_Details_Received="N",
                Notes_Comments=''
            )
            db.add(db_expo_tracker)
    
    await db.commit()
    await db.refresh(db_sponsor)
    return db_sponsor

# async def update_sponsor(db: AsyncSession, sponsor_id: int, sponsor_data: SponsorMasterUpdate, logo_file = None):
#     db_sponsor = await get_sponsor(db, sponsor_id)
#     if not db_sponsor:
#         return None

#     logo_path = None
#     old_logo_path = db_sponsor.Sponsor_logo
    
#     if logo_file:
#         logo_path = await save_upload_file(logo_file)
#         if old_logo_path:
#             delete_upload_file(old_logo_path)

#     update_data = sponsor_data.model_dump(exclude_unset=True, exclude={"details"})
#     if logo_path:
#         update_data['Sponsor_logo'] = logo_path
    
#     if update_data:
#         await db.execute(
#             update(Eve_SponsorMaster)
#             .where(Eve_SponsorMaster.SponsorMasterId == sponsor_id)
#             .values(**update_data)
#         )
    

#     if sponsor_data.details is not None:
#         current_details_stmt = select(Eve_SponsorMasterDetail).filter(
#             Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id
#         )
#         current_details = await db.execute(current_details_stmt)
#         current_detail_dict = {
#             d.Deliverabled_Code: d for d in current_details.scalars().all()
#         }

#         incoming_detail_codes = {d.Deliverabled_Code for d in sponsor_data.details}

#         details_to_delete = [
#             detail for detail_code, detail in current_detail_dict.items()
#             if detail_code not in incoming_detail_codes
#         ]
        
#         for detail in details_to_delete:
#             await db.delete(detail)

#         new_detail_codes = incoming_detail_codes - set(current_detail_dict.keys())
        
#         if new_detail_codes:
#             max_id_result = await db.execute(
#                 select(func.max(Eve_SponsorMasterDetail.ID))
#                 .where(Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id)
#             )
#             current_id = max_id_result.scalar() or 0

#             for detail_code in new_detail_codes:
#                 new_detail_data = next(d for d in sponsor_data.details if d.Deliverabled_Code == detail_code)
#                 current_id += 1
#                 db_detail = Eve_SponsorMasterDetail(
#                     **new_detail_data.model_dump(exclude={"ID"}),
#                     SponsorMasterId=sponsor_id,
#                     ID=current_id
#                 )
#                 db.add(db_detail)

#     await db.commit()
#     return await get_sponsor(db, sponsor_id)



async def update_sponsor(db: AsyncSession, sponsor_id: int, sponsor_data: SponsorMasterUpdate, logo_file = None):
    db_sponsor = await get_sponsor(db, sponsor_id)
    if not db_sponsor:
        return None

    logo_path = None
    old_logo_path = db_sponsor.Sponsor_logo
    
    if logo_file:
        logo_path = await save_upload_file(logo_file)
        if old_logo_path:
            delete_upload_file(old_logo_path)

    update_data = sponsor_data.model_dump(exclude_unset=True, exclude={"details"})
    if logo_path:
        update_data['Sponsor_logo'] = logo_path
    
    if update_data:
        await db.execute(
            update(Eve_SponsorMaster)
            .where(Eve_SponsorMaster.SponsorMasterId == sponsor_id)
            .values(**update_data)
        )
    

    if sponsor_data.details is not None:
        current_details_stmt = select(Eve_SponsorMasterDetail).filter(
            Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id
        )
        current_details = await db.execute(current_details_stmt)
        current_detail_dict = {
            d.Deliverabled_Code: d for d in current_details.scalars().all()
        }

        incoming_detail_codes = {d.Deliverabled_Code for d in sponsor_data.details}

        expo_tracker_stmt = select(ExpoRegistryTracker).filter(
            ExpoRegistryTracker.SponsorMasterId == sponsor_id,
            ExpoRegistryTracker.Deliverabled_Code == 31
        )
        expo_tracker_result = await db.execute(expo_tracker_stmt)
        expo_tracker = expo_tracker_result.scalar_one_or_none()

        booth_assigned = expo_tracker and expo_tracker.Booth_Number_Assigned is not None and expo_tracker.Booth_Number_Assigned != 0
        
        details_to_delete = []
        expo_trackers_to_delete = []
        
        for detail_code, detail in current_detail_dict.items():
            if detail_code not in incoming_detail_codes:
                if detail_code == 31 and expo_tracker:
                    if not booth_assigned:
                        expo_trackers_to_delete.append(expo_tracker)
                        details_to_delete.append(detail)
                    else:
                        continue
                else:
                    details_to_delete.append(detail)

        for expo_tracker_to_delete in expo_trackers_to_delete:
            await db.delete(expo_tracker_to_delete)
        
        for detail in details_to_delete:
            await db.delete(detail)

        new_detail_codes = incoming_detail_codes - set(current_detail_dict.keys())
        
        if new_detail_codes:
            max_id_result = await db.execute(
                select(func.max(Eve_SponsorMasterDetail.ID))
                .where(Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id)
            )
            current_id = max_id_result.scalar() or 0

            for detail_code in new_detail_codes:
                new_detail_data = next(d for d in sponsor_data.details if d.Deliverabled_Code == detail_code)
                current_id += 1
                db_detail = Eve_SponsorMasterDetail(
                    **new_detail_data.model_dump(exclude={"ID"}),
                    SponsorMasterId=sponsor_id,
                    ID=current_id
                )
                db.add(db_detail)
                
                if detail_code == 31:
                    existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
                        ExpoRegistryTracker.SponsorMasterId == sponsor_id,
                        ExpoRegistryTracker.Deliverabled_Code == 31
                    )
                    existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
                    existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
                    
                    if not existing_expo_tracker:
                        event_code_str = str(db_sponsor.Event_Code) if db_sponsor.Event_Code else None
                        db_expo_tracker = ExpoRegistryTracker(
                            Deliverabled_Code=31,
                            Deliverable_No=new_detail_data.Deliverable_No,
                            SponsorMasterId=sponsor_id,
                            Event_Code=event_code_str,
                            Booth_to_be_provided="Y",
                            Booth_Assigned="N",
                            Booth_Number_Assigned=None,
                            Logo_Details_Received="N",
                            Notes_Comments=f"Auto-created for sponsor {sponsor_id}"
                        )
                        db.add(db_expo_tracker)

    await db.commit()
    return await get_sponsor(db, sponsor_id)


async def delete_sponsor(db: AsyncSession, sponsor_id: int):
    db_sponsor = await get_sponsor(db, sponsor_id)
    if db_sponsor:
        if db_sponsor.Sponsor_logo:
            delete_upload_file(db_sponsor.Sponsor_logo)
        
        await db.delete(db_sponsor)
        await db.commit()
        return True
    return False

async def get_sponsors_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()