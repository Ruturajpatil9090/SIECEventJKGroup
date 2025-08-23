from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update,text
from typing import List, Optional
from ..models.sponsor_master_model import Eve_SponsorMaster, Eve_SponsorMasterDetail
from ..schemas.sponsor_master_schema import SponsorMasterCreate, SponsorMasterUpdate
from ..models.expo_registry_tracker_model import ExpoRegistryTracker
from ..models.award_registry_tracker_model import AwardRegistryTracker
from ..models.curated_session_model import EveCuratedSession
from ..models.ministerial_session_model import EveMinisterialSession
from ..utils.file_upload import save_upload_file, delete_upload_file
import os
from ..websockets.connection_manager import ConnectionManager

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




# async def create_sponsor(db: AsyncSession, sponsor_data: SponsorMasterCreate, logo_file = None,ws_manager: Optional[ConnectionManager] = None):
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
        
#         if detail_data.Deliverabled_Code == 31:
#             db_expo_tracker = ExpoRegistryTracker(
#                 Deliverabled_Code=detail_data.Deliverabled_Code,  
#                 Deliverable_No=detail_data.Deliverable_No,       
#                 SponsorMasterId=db_sponsor.SponsorMasterId,
#                 Event_Code=sponsor_data.Event_Code,
#                 Booth_to_be_provided="Y",
#                 Booth_Assigned="N",
#                 Booth_Number_Assigned= '',
#                 Logo_Details_Received="N",
#                 Notes_Comments=''
#             )
#             db.add(db_expo_tracker)
    
#     await db.commit()
#     await db.refresh(db_sponsor)

#     for detail_data in sponsor_data.details:
#         if detail_data.Deliverabled_Code == 31 and ws_manager:
#             await ws_manager.broadcast("refresh_expo_registry")
#             break 

#     return db_sponsor


# async def create_sponsor(
#     db: AsyncSession, 
#     sponsor_data: SponsorMasterCreate, 
#     logo_file = None,
#     ws_manager: Optional[ConnectionManager] = None
# ):
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
    
#     should_broadcast = False

#     for detail_data in sponsor_data.details:
#         current_id += 1
#         db_detail = Eve_SponsorMasterDetail(
#             SponsorMasterId=db_sponsor.SponsorMasterId,
#             ID=current_id,
#             Deliverabled_Code=detail_data.Deliverabled_Code,
#             Deliverable_No=detail_data.Deliverable_No
#         )
#         db.add(db_detail)
        
#         if detail_data.Deliverabled_Code == 31:
#             existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#                 ExpoRegistryTracker.SponsorMasterId == db_sponsor.SponsorMasterId,
#                 ExpoRegistryTracker.Deliverabled_Code == 31
#             )
#             existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
#             existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
            
#             if not existing_expo_tracker:
#                 db_expo_tracker = ExpoRegistryTracker(
#                     Deliverabled_Code=detail_data.Deliverabled_Code,
#                     Deliverable_No=detail_data.Deliverable_No,
#                     SponsorMasterId=db_sponsor.SponsorMasterId,
#                     Event_Code=str(sponsor_data.Event_Code),
#                     Booth_to_be_provided="Y",
#                     Booth_Assigned="N",
#                     Booth_Number_Assigned=None,
#                     Logo_Details_Received="N",
#                     Notes_Comments=''
#                 )
#                 db.add(db_expo_tracker)
#                 should_broadcast = True
    
#     await db.commit()
#     await db.refresh(db_sponsor)

#     if ws_manager and should_broadcast:
#         await ws_manager.broadcast("refresh_expo_registry")
    
#     return db_sponsor




#updated upto 31 and 39

# async def create_sponsor(
#     db: AsyncSession, 
#     sponsor_data: SponsorMasterCreate, 
#     logo_file = None,
#     ws_manager: Optional[ConnectionManager] = None
# ):
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
    
#     should_broadcast = False

#     for detail_data in sponsor_data.details:
#         current_id += 1
#         db_detail = Eve_SponsorMasterDetail(
#             SponsorMasterId=db_sponsor.SponsorMasterId,
#             ID=current_id,
#             Deliverabled_Code=detail_data.Deliverabled_Code,
#             Deliverable_No=detail_data.Deliverable_No
#         )
#         db.add(db_detail)
        
#         # Handle Deliverable_Code 31 (ExpoRegistryTracker)
#         if detail_data.Deliverabled_Code == 31:
#             existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#                 ExpoRegistryTracker.SponsorMasterId == db_sponsor.SponsorMasterId,
#                 ExpoRegistryTracker.Deliverabled_Code == 31
#             )
#             existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
#             existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
            
#             if not existing_expo_tracker:
#                 db_expo_tracker = ExpoRegistryTracker(
#                     Deliverabled_Code=detail_data.Deliverabled_Code,
#                     Deliverable_No=detail_data.Deliverable_No,
#                     SponsorMasterId=db_sponsor.SponsorMasterId,
#                     Event_Code=str(sponsor_data.Event_Code),
#                     Booth_to_be_provided="Y",
#                     Booth_Assigned="N",
#                     Booth_Number_Assigned=None,
#                     Logo_Details_Received="N",
#                     Notes_Comments=''
#                 )
#                 db.add(db_expo_tracker)
#                 should_broadcast = True
        
#         # Handle Deliverable_Code 39 (AwardRegistryTracker)
#         elif detail_data.Deliverabled_Code == 39:
#             existing_award_tracker_stmt = select(AwardRegistryTracker).filter(
#                 AwardRegistryTracker.SponsorMasterId == db_sponsor.SponsorMasterId,
#                 AwardRegistryTracker.Deliverabled_Code == 39
#             )
#             existing_award_tracker_result = await db.execute(existing_award_tracker_stmt)
#             existing_award_tracker = existing_award_tracker_result.scalar_one_or_none()
            
#             if not existing_award_tracker:
#                 db_award_tracker = AwardRegistryTracker(
#                     Deliverabled_Code=detail_data.Deliverabled_Code,
#                     Deliverable_No=detail_data.Deliverable_No,
#                     SponsorMasterId=db_sponsor.SponsorMasterId,
#                     Event_Code=sponsor_data.Event_Code,
#                     Award_Code=0 
#                 )
#                 db.add(db_award_tracker)
#                 should_broadcast = True
    
#     await db.commit()
#     await db.refresh(db_sponsor)

#     if ws_manager:
#         if should_broadcast:
#             await ws_manager.broadcast("refresh_expo_registry")
    
#     return db_sponsor







async def create_sponsor(
    db: AsyncSession, 
    sponsor_data: SponsorMasterCreate, 
    logo_file = None,
    ws_manager: Optional[ConnectionManager] = None
):
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
    
    should_broadcast = False

    for detail_data in sponsor_data.details:
        current_id += 1
        db_detail = Eve_SponsorMasterDetail(
            SponsorMasterId=db_sponsor.SponsorMasterId,
            ID=current_id,
            Deliverabled_Code=detail_data.Deliverabled_Code,
            Deliverable_No=detail_data.Deliverable_No
        )
        db.add(db_detail)
        
        # Handle Deliverable_Code 31 (ExpoRegistryTracker)
        if detail_data.Deliverabled_Code == 31:
            existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
                ExpoRegistryTracker.SponsorMasterId == db_sponsor.SponsorMasterId,
                ExpoRegistryTracker.Deliverabled_Code == 31
            )
            existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
            existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
            
            if not existing_expo_tracker:
                db_expo_tracker = ExpoRegistryTracker(
                    Deliverabled_Code=detail_data.Deliverabled_Code,
                    Deliverable_No=detail_data.Deliverable_No,
                    SponsorMasterId=db_sponsor.SponsorMasterId,
                    Event_Code=str(sponsor_data.Event_Code),
                    Booth_to_be_provided="Y",
                    Booth_Assigned="N",
                    Booth_Number_Assigned=None,
                    Logo_Details_Received="N",
                    Notes_Comments=''
                )
                db.add(db_expo_tracker)
                should_broadcast = True
        
        # Handle Deliverable_Code 39 (AwardRegistryTracker)
        elif detail_data.Deliverabled_Code == 39:
            existing_award_tracker_stmt = select(AwardRegistryTracker).filter(
                AwardRegistryTracker.SponsorMasterId == db_sponsor.SponsorMasterId,
                AwardRegistryTracker.Deliverabled_Code == 39
            )
            existing_award_tracker_result = await db.execute(existing_award_tracker_stmt)
            existing_award_tracker = existing_award_tracker_result.scalar_one_or_none()
            
            if not existing_award_tracker:
                db_award_tracker = AwardRegistryTracker(
                    Deliverabled_Code=detail_data.Deliverabled_Code,
                    Deliverable_No=detail_data.Deliverable_No,
                    SponsorMasterId=db_sponsor.SponsorMasterId,
                    Event_Code=sponsor_data.Event_Code,
                    Award_Code=0 
                )
                db.add(db_award_tracker)
                should_broadcast = True
        
        # Handle Deliverable_Code 43 (CuratedSessionTracker)
        elif detail_data.Deliverabled_Code == 43:
            existing_curated_tracker_stmt = select(EveCuratedSession).filter(
                EveCuratedSession.SponsorMasterId == db_sponsor.SponsorMasterId,
                EveCuratedSession.Deliverabled_Code == 43
            )
            existing_curated_tracker_result = await db.execute(existing_curated_tracker_stmt)
            existing_curated_tracker = existing_curated_tracker_result.scalar_one_or_none()
            
            if not existing_curated_tracker:
                db_curated_tracker = EveCuratedSession(
                    Deliverabled_Code=detail_data.Deliverabled_Code,
                    Deliverable_No=detail_data.Deliverable_No,
                    SponsorMasterId=db_sponsor.SponsorMasterId,
                    Event_Code=sponsor_data.Event_Code,
                    Speaker_Name="",
                    designation="",
                    Mobile_No="",
                    Email_Address="",
                    CuratedSession_Bio="",
                    Speaking_Date=None,
                    Track=""
                )
                db.add(db_curated_tracker)
                should_broadcast = True
        
        # Handle Deliverable_Code 40 (MinisterialSessionTracker)
        elif detail_data.Deliverabled_Code == 40:
            existing_ministerial_tracker_stmt = select(EveMinisterialSession).filter(
                EveMinisterialSession.SponsorMasterId == db_sponsor.SponsorMasterId,
                EveMinisterialSession.Deliverabled_Code == 40
            )
            existing_ministerial_tracker_result = await db.execute(existing_ministerial_tracker_stmt)
            existing_ministerial_tracker = existing_ministerial_tracker_result.scalar_one_or_none()
            
            if not existing_ministerial_tracker:
                db_ministerial_tracker = EveMinisterialSession(
                    Deliverabled_Code=detail_data.Deliverabled_Code,
                    Deliverable_No=detail_data.Deliverable_No,
                    SponsorMasterId=db_sponsor.SponsorMasterId,
                    Event_Code=sponsor_data.Event_Code,
                    Speaker_Name="",
                    designation="",
                    Mobile_No="",
                    Email_Address="",
                    MinisterialSession_Bio="",
                    Speaking_Date=None,
                    Track=""
                )
                db.add(db_ministerial_tracker)
                should_broadcast = True
    
    await db.commit()
    await db.refresh(db_sponsor)

    if ws_manager:
        if should_broadcast:
            await ws_manager.broadcast("refresh_expo_registry")
    
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



# async def update_sponsor(db: AsyncSession, sponsor_id: int, sponsor_data: SponsorMasterUpdate, logo_file = None,ws_manager: Optional[ConnectionManager] = None):
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

#         expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#             ExpoRegistryTracker.SponsorMasterId == sponsor_id,
#             ExpoRegistryTracker.Deliverabled_Code == 31
#         )
#         expo_tracker_result = await db.execute(expo_tracker_stmt)
#         expo_tracker = expo_tracker_result.scalar_one_or_none()

#         booth_assigned = expo_tracker and expo_tracker.Booth_Number_Assigned is not None and expo_tracker.Booth_Number_Assigned != 0
        
#         details_to_delete = []
#         expo_trackers_to_delete = []
        
#         for detail_code, detail in current_detail_dict.items():
#             if detail_code not in incoming_detail_codes:
#                 if detail_code == 31 and expo_tracker:
#                     if not booth_assigned:
#                         expo_trackers_to_delete.append(expo_tracker)
#                         details_to_delete.append(detail)
#                     else:
#                         continue
#                 else:
#                     details_to_delete.append(detail)

#         for expo_tracker_to_delete in expo_trackers_to_delete:
#             await db.delete(expo_tracker_to_delete)
        
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
                
#                 if detail_code == 31:
#                     existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#                         ExpoRegistryTracker.SponsorMasterId == sponsor_id,
#                         ExpoRegistryTracker.Deliverabled_Code == 31
#                     )
#                     existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
#                     existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
                    
#                     if not existing_expo_tracker:
#                         event_code_str = str(db_sponsor.Event_Code) if db_sponsor.Event_Code else None
#                         db_expo_tracker = ExpoRegistryTracker(
#                             Deliverabled_Code=31,
#                             Deliverable_No=new_detail_data.Deliverable_No,
#                             SponsorMasterId=sponsor_id,
#                             Event_Code=event_code_str,
#                             Booth_to_be_provided="Y",
#                             Booth_Assigned="N",
#                             Booth_Number_Assigned=None,
#                             Logo_Details_Received="N",
#                             Notes_Comments=f"Auto-created for sponsor {sponsor_id}"
#                         )
#                         db.add(db_expo_tracker)

#     await db.commit()

    
#     return await get_sponsor(db, sponsor_id)


# async def update_sponsor(
#     db: AsyncSession, 
#     sponsor_id: int, 
#     sponsor_data: SponsorMasterUpdate, 
#     logo_file = None,
#     ws_manager: Optional[ConnectionManager] = None
# ):
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

#         expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#             ExpoRegistryTracker.SponsorMasterId == sponsor_id,
#             ExpoRegistryTracker.Deliverabled_Code == 31
#         )
#         expo_tracker_result = await db.execute(expo_tracker_stmt)
#         expo_tracker = expo_tracker_result.scalar_one_or_none()

#         booth_assigned = expo_tracker and expo_tracker.Booth_Number_Assigned is not None and expo_tracker.Booth_Number_Assigned != 0
        
#         details_to_delete = []
#         expo_trackers_to_delete = []

#         should_broadcast = False
        
#         for detail_code, detail in current_detail_dict.items():
#             if detail_code not in incoming_detail_codes:
#                 if detail_code == 31 and expo_tracker:
#                     if not booth_assigned:
#                         expo_trackers_to_delete.append(expo_tracker)
#                         details_to_delete.append(detail)
#                         # ADDED: Set the flag when a deletion occurs
#                         should_broadcast = True 
#                     else:
#                         continue
#                 else:
#                     details_to_delete.append(detail)

#         for expo_tracker_to_delete in expo_trackers_to_delete:
#             await db.delete(expo_tracker_to_delete)
        
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
                
#                 if detail_code == 31:
#                     existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#                         ExpoRegistryTracker.SponsorMasterId == sponsor_id,
#                         ExpoRegistryTracker.Deliverabled_Code == 31
#                     )
#                     existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
#                     existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
                    
#                     if not existing_expo_tracker:
#                         event_code_str = str(db_sponsor.Event_Code) if db_sponsor.Event_Code else None
#                         db_expo_tracker = ExpoRegistryTracker(
#                             Deliverabled_Code=31,
#                             Deliverable_No=new_detail_data.Deliverable_No,
#                             SponsorMasterId=sponsor_id,
#                             Event_Code=event_code_str,
#                             Booth_to_be_provided="Y",
#                             Booth_Assigned="N",
#                             Booth_Number_Assigned=None,
#                             Logo_Details_Received="N",
#                             Notes_Comments=f"Auto-created for sponsor {sponsor_id}"
#                         )
#                         db.add(db_expo_tracker)
#                         # ADDED: Set the flag when a new entry is created
#                         should_broadcast = True 

#     await db.commit()

#     if ws_manager and should_broadcast:
#         await ws_manager.broadcast("refresh_expo_registry")
    
#     return await get_sponsor(db, sponsor_id)



#updated code for code 31 and 39

# async def update_sponsor(
#     db: AsyncSession, 
#     sponsor_id: int, 
#     sponsor_data: SponsorMasterUpdate, 
#     logo_file = None,
#     ws_manager: Optional[ConnectionManager] = None
# ):
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

#         # Check existing trackers for both 31 and 39
#         expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#             ExpoRegistryTracker.SponsorMasterId == sponsor_id,
#             ExpoRegistryTracker.Deliverabled_Code == 31
#         )
#         expo_tracker_result = await db.execute(expo_tracker_stmt)
#         expo_tracker = expo_tracker_result.scalar_one_or_none()

#         award_tracker_stmt = select(AwardRegistryTracker).filter(
#             AwardRegistryTracker.SponsorMasterId == sponsor_id,
#             AwardRegistryTracker.Deliverabled_Code == 39
#         )
#         award_tracker_result = await db.execute(award_tracker_stmt)
#         award_tracker = award_tracker_result.scalar_one_or_none()

#         expo_booth_assigned = expo_tracker and expo_tracker.Booth_Number_Assigned is not None and expo_tracker.Booth_Number_Assigned != 0
#         # For Award tracker, we might have different conditions, but for now using same logic
#         award_assigned = award_tracker and award_tracker.Award_Code is not None and award_tracker.Award_Code != 0
        
#         details_to_delete = []
#         expo_trackers_to_delete = []
#         award_trackers_to_delete = []

#         should_broadcast = False
        
#         for detail_code, detail in current_detail_dict.items():
#             if detail_code not in incoming_detail_codes:
#                 if detail_code == 31 and expo_tracker:
#                     if not expo_booth_assigned:
#                         expo_trackers_to_delete.append(expo_tracker)
#                         details_to_delete.append(detail)
#                         should_broadcast = True
#                     else:
#                         continue
#                 elif detail_code == 39 and award_tracker:
#                     if not award_assigned:
#                         award_trackers_to_delete.append(award_tracker)
#                         details_to_delete.append(detail)
#                         should_broadcast = True
#                     else:
#                         continue
#                 else:
#                     details_to_delete.append(detail)

#         for expo_tracker_to_delete in expo_trackers_to_delete:
#             await db.delete(expo_tracker_to_delete)
        
#         for award_tracker_to_delete in award_trackers_to_delete:
#             await db.delete(award_tracker_to_delete)
        
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
                
#                 if detail_code == 31:
#                     existing_expo_tracker_stmt = select(ExpoRegistryTracker).filter(
#                         ExpoRegistryTracker.SponsorMasterId == sponsor_id,
#                         ExpoRegistryTracker.Deliverabled_Code == 31
#                     )
#                     existing_expo_tracker_result = await db.execute(existing_expo_tracker_stmt)
#                     existing_expo_tracker = existing_expo_tracker_result.scalar_one_or_none()
                    
#                     if not existing_expo_tracker:
#                         event_code_str = str(db_sponsor.Event_Code) if db_sponsor.Event_Code else None
#                         db_expo_tracker = ExpoRegistryTracker(
#                             Deliverabled_Code=31,
#                             Deliverable_No=new_detail_data.Deliverable_No,
#                             SponsorMasterId=sponsor_id,
#                             Event_Code=event_code_str,
#                             Booth_to_be_provided="Y",
#                             Booth_Assigned="N",
#                             Booth_Number_Assigned=None,
#                             Logo_Details_Received="N",
#                             Notes_Comments=f"Auto-created for sponsor {sponsor_id}"
#                         )
#                         db.add(db_expo_tracker)
#                         should_broadcast = True
                
#                 elif detail_code == 39:
#                     existing_award_tracker_stmt = select(AwardRegistryTracker).filter(
#                         AwardRegistryTracker.SponsorMasterId == sponsor_id,
#                         AwardRegistryTracker.Deliverabled_Code == 39
#                     )
#                     existing_award_tracker_result = await db.execute(existing_award_tracker_stmt)
#                     existing_award_tracker = existing_award_tracker_result.scalar_one_or_none()
                    
#                     if not existing_award_tracker:
#                         db_award_tracker = AwardRegistryTracker(
#                             Deliverabled_Code=39,
#                             Deliverable_No=new_detail_data.Deliverable_No,
#                             SponsorMasterId=sponsor_id,
#                             Event_Code=db_sponsor.Event_Code,
#                             Award_Code=None
#                         )
#                         db.add(db_award_tracker)
#                         should_broadcast = True

#     await db.commit()

#     # Broadcast updates for both trackers if needed
#     if ws_manager:
#         if should_broadcast:
#             await ws_manager.broadcast("refresh_expo_registry")
    
#     return await get_sponsor(db, sponsor_id)





async def update_sponsor(
    db: AsyncSession, 
    sponsor_id: int, 
    sponsor_data: SponsorMasterUpdate, 
    logo_file = None,
    ws_manager: Optional[ConnectionManager] = None
):
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

        # Check existing trackers for 31, 39, 43, and 40
        expo_tracker_stmt = select(ExpoRegistryTracker).filter(
            ExpoRegistryTracker.SponsorMasterId == sponsor_id,
            ExpoRegistryTracker.Deliverabled_Code == 31
        )
        expo_tracker_result = await db.execute(expo_tracker_stmt)
        expo_tracker = expo_tracker_result.scalar_one_or_none()

        award_tracker_stmt = select(AwardRegistryTracker).filter(
            AwardRegistryTracker.SponsorMasterId == sponsor_id,
            AwardRegistryTracker.Deliverabled_Code == 39
        )
        award_tracker_result = await db.execute(award_tracker_stmt)
        award_tracker = award_tracker_result.scalar_one_or_none()

        curated_tracker_stmt = select(EveCuratedSession).filter(
            EveCuratedSession.SponsorMasterId == sponsor_id,
            EveCuratedSession.Deliverabled_Code == 43
        )
        curated_tracker_result = await db.execute(curated_tracker_stmt)
        curated_tracker = curated_tracker_result.scalar_one_or_none()

        ministerial_tracker_stmt = select(EveMinisterialSession).filter(
            EveMinisterialSession.SponsorMasterId == sponsor_id,
            EveMinisterialSession.Deliverabled_Code == 40
        )
        ministerial_tracker_result = await db.execute(ministerial_tracker_stmt)
        ministerial_tracker = ministerial_tracker_result.scalar_one_or_none()

        expo_booth_assigned = expo_tracker and expo_tracker.Booth_Number_Assigned is not None and expo_tracker.Booth_Number_Assigned != 0
        award_assigned = award_tracker and award_tracker.Award_Code is not None and award_tracker.Award_Code != 0
        curated_speaker_assigned = curated_tracker and curated_tracker.Speaker_Name is not None and curated_tracker.Speaker_Name != ""
        ministerial_speaker_assigned = ministerial_tracker and ministerial_tracker.Speaker_Name is not None and ministerial_tracker.Speaker_Name != ""
        
        details_to_delete = []
        expo_trackers_to_delete = []
        award_trackers_to_delete = []
        curated_trackers_to_delete = []
        ministerial_trackers_to_delete = []

        should_broadcast = False
        
        for detail_code, detail in current_detail_dict.items():
            if detail_code not in incoming_detail_codes:
                if detail_code == 31 and expo_tracker:
                    if not expo_booth_assigned:
                        expo_trackers_to_delete.append(expo_tracker)
                        details_to_delete.append(detail)
                        should_broadcast = True
                    else:
                        continue
                elif detail_code == 39 and award_tracker:
                    if not award_assigned:
                        award_trackers_to_delete.append(award_tracker)
                        details_to_delete.append(detail)
                        should_broadcast = True
                    else:
                        continue
                elif detail_code == 43 and curated_tracker:
                    if not curated_speaker_assigned:
                        curated_trackers_to_delete.append(curated_tracker)
                        details_to_delete.append(detail)
                        should_broadcast = True
                    else:
                        continue
                elif detail_code == 40 and ministerial_tracker:
                    if not ministerial_speaker_assigned:
                        ministerial_trackers_to_delete.append(ministerial_tracker)
                        details_to_delete.append(detail)
                        should_broadcast = True
                    else:
                        continue
                else:
                    details_to_delete.append(detail)

        for expo_tracker_to_delete in expo_trackers_to_delete:
            await db.delete(expo_tracker_to_delete)
        
        for award_tracker_to_delete in award_trackers_to_delete:
            await db.delete(award_tracker_to_delete)
        
        for curated_tracker_to_delete in curated_trackers_to_delete:
            await db.delete(curated_tracker_to_delete)
        
        for ministerial_tracker_to_delete in ministerial_trackers_to_delete:
            await db.delete(ministerial_tracker_to_delete)
        
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
                        should_broadcast = True
                
                elif detail_code == 39:
                    existing_award_tracker_stmt = select(AwardRegistryTracker).filter(
                        AwardRegistryTracker.SponsorMasterId == sponsor_id,
                        AwardRegistryTracker.Deliverabled_Code == 39
                    )
                    existing_award_tracker_result = await db.execute(existing_award_tracker_stmt)
                    existing_award_tracker = existing_award_tracker_result.scalar_one_or_none()
                    
                    if not existing_award_tracker:
                        db_award_tracker = AwardRegistryTracker(
                            Deliverabled_Code=39,
                            Deliverable_No=new_detail_data.Deliverable_No,
                            SponsorMasterId=sponsor_id,
                            Event_Code=db_sponsor.Event_Code,
                            Award_Code=None
                        )
                        db.add(db_award_tracker)
                        should_broadcast = True
                
                elif detail_code == 43:
                    existing_curated_tracker_stmt = select(EveCuratedSession).filter(
                        EveCuratedSession.SponsorMasterId == sponsor_id,
                        EveCuratedSession.Deliverabled_Code == 43
                    )
                    existing_curated_tracker_result = await db.execute(existing_curated_tracker_stmt)
                    existing_curated_tracker = existing_curated_tracker_result.scalar_one_or_none()
                    
                    if not existing_curated_tracker:
                        db_curated_tracker = EveCuratedSession(
                            Deliverabled_Code=43,
                            Deliverable_No=new_detail_data.Deliverable_No,
                            SponsorMasterId=sponsor_id,
                            Event_Code=db_sponsor.Event_Code,
                            Speaker_Name="",
                            designation="",
                            Mobile_No="",
                            Email_Address="",
                            CuratedSession_Bio="",
                            Speaking_Date=None,
                            Track=""
                        )
                        db.add(db_curated_tracker)
                        should_broadcast = True
                
                elif detail_code == 40:
                    existing_ministerial_tracker_stmt = select(EveMinisterialSession).filter(
                        EveMinisterialSession.SponsorMasterId == sponsor_id,
                        EveMinisterialSession.Deliverabled_Code == 40
                    )
                    existing_ministerial_tracker_result = await db.execute(existing_ministerial_tracker_stmt)
                    existing_ministerial_tracker = existing_ministerial_tracker_result.scalar_one_or_none()
                    
                    if not existing_ministerial_tracker:
                        db_ministerial_tracker = EveMinisterialSession(
                            Deliverabled_Code=40,
                            Deliverable_No=new_detail_data.Deliverable_No,
                            SponsorMasterId=sponsor_id,
                            Event_Code=db_sponsor.Event_Code,
                            Speaker_Name="",
                            designation="",
                            Mobile_No="",
                            Email_Address="",
                            MinisterialSession_Bio="",
                            Speaking_Date=None,
                            Track=""
                        )
                        db.add(db_ministerial_tracker)
                        should_broadcast = True

    await db.commit()

    # Broadcast updates for both trackers if needed
    if ws_manager:
        if should_broadcast:
            await ws_manager.broadcast("refresh_expo_registry")
    
    return await get_sponsor(db, sponsor_id)


# async def delete_sponsor(db: AsyncSession, sponsor_id: int):
#     db_sponsor = await get_sponsor(db, sponsor_id)
#     if db_sponsor:
#         if db_sponsor.Sponsor_logo:
#             delete_upload_file(db_sponsor.Sponsor_logo)
        
#         await db.delete(db_sponsor)
#         await db.commit()
#         return True
#     return False


async def delete_sponsor(
    db: AsyncSession, 
    sponsor_id: int,
    ws_manager: Optional[ConnectionManager] = None
):
    db_sponsor = await get_sponsor(db, sponsor_id)
    if db_sponsor:
        if db_sponsor.Sponsor_logo:
            delete_upload_file(db_sponsor.Sponsor_logo)
        
        await db.delete(db_sponsor)
        await db.commit()
        
        if ws_manager:
            await ws_manager.broadcast("refresh_expo_registry")

        return True
    return False

async def get_sponsors_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()