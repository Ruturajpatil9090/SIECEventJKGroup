from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update,text
from typing import Any, Dict, List, Optional
from ..models.sponsor_master_model import Eve_SponsorMaster, Eve_SponsorMasterDetail
from ..schemas.sponsor_master_schema import SponsorMasterCreate, SponsorMasterUpdate
from ..models.expo_registry_tracker_model import ExpoRegistryTracker
from ..models.award_registry_tracker_model import AwardRegistryTracker
from ..models.curated_session_model import EveCuratedSession
from ..models.ministerial_session_model import EveMinisterialSession
from ..models.slot_master_model import SlotMaster
from ..models.passes_registry_models import Eve_PassesRegistry
from ..models.speaker_tracker_model import EveSpeakerTracker
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

async def get_all_sponsor_with_details(db: AsyncSession,event_code: int,  skip: int = 0, limit: int = 100):
    query = text("""
SELECT   dbo.Eve_SponsorMaster.SponsorMasterId, dbo.Eve_SponsorMaster.Doc_Date, dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_SponsorMaster.Sponsor_logo, dbo.Eve_SponsorMaster.Event_Code, 
                         dbo.Eve_SponsorMaster.CategoryMaster_Code, dbo.Eve_SponsorMaster.CategorySubMaster_Code, dbo.Eve_SponsorMaster.Proposal_Sent, dbo.Eve_SponsorMaster.Approval_Received, 
                         dbo.Eve_SponsorMaster.Sponsorship_Amount, dbo.Eve_SponsorMaster.Sponsorship_Amount_Advance, dbo.Eve_SponsorMaster.Payment_Status, dbo.Eve_SponsorMaster.Proforma_Invoice_Sent, 
                         dbo.Eve_SponsorMaster.Final_Invoice_Sent, dbo.Eve_SponsorMaster.GST_Details_Received, dbo.Eve_SponsorMaster.Contact_Person, dbo.Eve_SponsorMaster.Contact_Email, dbo.Eve_SponsorMaster.Contact_Phone, 
                         dbo.Eve_SponsorMaster.Notes, dbo.Eve_SponsorMaster.Address, dbo.Eve_SponsorMaster.CIN, dbo.Eve_SponsorMaster.Sponsor_Deliverables_Tracker, dbo.Eve_SponsorMaster.Website, 
                         dbo.Eve_SponsorMaster.Awards_Registry_Tracker, dbo.Eve_SponsorMaster.Category_Sponsors, dbo.Eve_SponsorMaster.Designation, dbo.Eve_SponsorMaster.Expo_Registry, dbo.Eve_SponsorMaster.GST, 
                         dbo.Eve_SponsorMaster.Passes_Registry_Tracker, dbo.Eve_SponsorMaster.Sponsor_Speakers, dbo.Eve_SponsorMaster.Networking_Table_Slots_Tracker, dbo.Eve_SponsorMaster.Created_By, 
                         dbo.Eve_SponsorMaster.Modified_By, dbo.Eve_SponsorMaster.User_Id, dbo.Eve_SponsorMasterDetail.SponsorDetailId, dbo.Eve_SponsorMasterDetail.ID, dbo.Eve_SponsorMasterDetail.Deliverabled_Code, 
                         dbo.Eve_SponsorMasterDetail.Deliverable_No, dbo.Eve_SponsorMasterDetail.SponsorMasterId AS Expr1, dbo.Eve_EventMaster.EventMaster_Name, dbo.Eve_CategoryMaster.category_name, 
                         dbo.Eve_CategorySubMaster.CategorySub_Name, dbo.tbluser.User_Name, dbo.Eve_SponsorMaster.Sponsorship_Amount - dbo.Eve_SponsorMaster.Sponsorship_Amount_Advance AS Pending_Amount
FROM            dbo.Eve_SponsorMaster INNER JOIN
                         dbo.Eve_SponsorMasterDetail ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_SponsorMasterDetail.SponsorMasterId INNER JOIN
                         dbo.Eve_EventMaster ON dbo.Eve_SponsorMaster.Event_Code = dbo.Eve_EventMaster.EventMasterId INNER JOIN
                         dbo.Eve_CategoryMaster ON dbo.Eve_SponsorMaster.CategoryMaster_Code = dbo.Eve_CategoryMaster.CategoryId INNER JOIN
                         dbo.Eve_CategorySubMaster ON dbo.Eve_SponsorMaster.CategorySubMaster_Code = dbo.Eve_CategorySubMaster.CategorySubMasterId INNER JOIN
                         dbo.tbluser ON dbo.Eve_SponsorMaster.User_Id = dbo.tbluser.User_Id
                   WHERE dbo.Eve_SponsorMaster.Event_Code = :event_code
ORDER BY dbo.Eve_SponsorMaster.SponsorMasterId DESC
    """)
    
    result = await db.execute(query, {"event_code": event_code,"skip": skip, "limit": limit})
    return result.mappings().all()






async def get_sponsor_complete_details(db: AsyncSession, event_code: int, sponsor_master_id: int):
    query = text("""
SELECT        dbo.Eve_PassesRegistry.Elite_Passess, dbo.Eve_PassesRegistry.Visitor_Passess, dbo.Eve_PassesRegistry.Carporate_Passess, dbo.Eve_MinisterialSessions.Speaker_Name AS MinistrialSpeakername, 
                         dbo.Eve_CuratedSession.Speaker_Name AS CuratedSpeakername, dbo.Eve_SpeakerTracker.Speaker_Name AS SpeakerTrackerSpeakerName, dbo.Eve_AwardMaster.Award_Name, dbo.Eve_SponsorMaster.Contact_Person, 
                         dbo.Eve_SponsorMaster.Contact_Email, dbo.Eve_SponsorMaster.Contact_Phone, dbo.Eve_SponsorMaster.Sponsorship_Amount, 
                         dbo.Eve_SponsorMaster.Sponsorship_Amount - ISNULL(dbo.Eve_SponsorMaster.Sponsorship_Amount_Advance, 0) AS Pending_Amount, dbo.Eve_EventMaster.EventMaster_Name, dbo.Eve_SponsorMaster.SponsorMasterId, 
                         dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_SponsorMaster.Event_Code, dbo.Eve_SponsorMaster.Approval_Received, dbo.Eve_ExpoRegistryTracker.Booth_Number_Assigned
FROM            dbo.Eve_SponsorMaster INNER JOIN
                         dbo.Eve_PassesRegistry ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_PassesRegistry.SponsorMasterId INNER JOIN
                         dbo.Eve_MinisterialSessions ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_MinisterialSessions.SponsorMasterId INNER JOIN
                         dbo.Eve_ExpoRegistryTracker ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_ExpoRegistryTracker.SponsorMasterId INNER JOIN
                         dbo.Eve_CuratedSession ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_CuratedSession.SponsorMasterId INNER JOIN
                         dbo.Eve_AwardRegistryTracker ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_AwardRegistryTracker.SponsorMasterId INNER JOIN
                         dbo.Eve_SpeakerTracker ON dbo.Eve_SponsorMaster.SponsorMasterId = dbo.Eve_SpeakerTracker.SponsorMasterId INNER JOIN
                         dbo.Eve_EventMaster ON dbo.Eve_SponsorMaster.Event_Code = dbo.Eve_EventMaster.EventMasterId LEFT OUTER JOIN
                         dbo.Eve_AwardMaster ON dbo.Eve_AwardRegistryTracker.Award_Code = dbo.Eve_AwardMaster.AwardId
WHERE 
    dbo.Eve_SponsorMaster.Event_Code = :event_code 
    AND dbo.Eve_SponsorMaster.SponsorMasterId = :sponsor_master_id
""")
    
    result = await db.execute(query, {
        "event_code": event_code,
        "sponsor_master_id": sponsor_master_id
    })
    return result.mappings().all()




async def get_event_dashboard_stats(db: AsyncSession, event_code: int) -> Dict[str, Any]:
    queries = {
        "sponsor_count": text("""
            SELECT COUNT(*) AS count 
            FROM dbo.Eve_SponsorMaster 
            WHERE Event_Code = :event_code
        """),
        "award_record_count": text("""
            SELECT COUNT(*) AS count 
            FROM dbo.Eve_AwardRegistryTracker 
            WHERE Award_Code > 0 AND Event_Code = :event_code
        """),
        "ministerial_speakers_count": text("""
            SELECT COUNT(*) AS count 
            FROM dbo.Eve_MinisterialSessions 
            WHERE Event_Code = :event_code AND Speaker_Name IS NOT NULL AND Speaker_Name <> ''
        """),
        "curated_speakers_count": text("""
            SELECT COUNT(*) AS count 
            FROM dbo.Eve_CuratedSession 
            WHERE Event_Code = :event_code AND Speaker_Name IS NOT NULL AND Speaker_Name <> ''
        """),
        "speaker_tracker_count": text("""
            SELECT COUNT(*) AS count 
            FROM dbo.Eve_SpeakerTracker 
            WHERE Event_Code = :event_code AND Speaker_Name IS NOT NULL AND Speaker_Name <> ''
        """),
        "booth_assigned_count": text("""
            SELECT COUNT(*) AS count 
            FROM dbo.Eve_ExpoRegistryTracker 
            WHERE Event_Code = :event_code 
            AND (Booth_Number_Assigned IS NOT NULL AND Booth_Number_Assigned <> '')
        """),
        "sponsor_details": text("""
           SELECT        dbo.tbluser.User_Name, dbo.Eve_SponsorMaster.Sponsor_Name, dbo.Eve_SponsorMaster.Sponsorship_Amount, dbo.Eve_SponsorMaster.Sponsorship_Amount_Advance, 
                         dbo.Eve_SponsorMaster.Sponsorship_Amount - ISNULL(dbo.Eve_SponsorMaster.Sponsorship_Amount_Advance, 0) AS Pending_Amount, dbo.Eve_CategorySubMaster.CategorySub_Name, 
                         dbo.Eve_SponsorMaster.Proposal_Sent, dbo.Eve_SponsorMaster.Approval_Received, dbo.Eve_SponsorMaster.Contact_Phone, dbo.Eve_SponsorMaster.Contact_Email, dbo.Eve_SponsorMaster.Contact_Person
FROM            dbo.Eve_SponsorMaster INNER JOIN
                         dbo.tbluser ON dbo.Eve_SponsorMaster.User_Id = dbo.tbluser.User_Id INNER JOIN
                         dbo.Eve_CategorySubMaster ON dbo.Eve_SponsorMaster.CategorySubMaster_Code = dbo.Eve_CategorySubMaster.CategorySubMasterId
            WHERE dbo.Eve_SponsorMaster.Event_Code = :event_code
        """)
    }
    
    results = {}
    
    for key, query in queries.items():
        try:
            if key == "sponsor_details":
                result = await db.execute(query, {"event_code": event_code})
                results[key] = result.mappings().all()
            else:
                result = await db.execute(query, {"event_code": event_code})
                results[key] = result.scalar()
        except Exception as e:
            results[key] = f"Error: {str(e)}"
    
    return {
        "event_code": event_code,
        "stats": {
            "total_sponsors": results.get("sponsor_count", 0),
            "award_records": results.get("award_record_count", 0),
            "ministerial_speakers": results.get("ministerial_speakers_count", 0),
            "curated_speakers": results.get("curated_speakers_count", 0),
            "speaker_tracker": results.get("speaker_tracker_count", 0),
            "booths_assigned": results.get("booth_assigned_count", 0)
        },
        "sponsor_details": results.get("sponsor_details", [])
    }


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


        # Handle Deliverable_Code 20  (PassesRegistry)
        elif detail_data.Deliverabled_Code == 20:
            existing_passes_registry_stmt = select(Eve_PassesRegistry).filter(
                Eve_PassesRegistry.SponsorMasterId == db_sponsor.SponsorMasterId,
                Eve_PassesRegistry.Deliverabled_Code == 20
            )
            existing_passes_registry_result = await db.execute(existing_passes_registry_stmt)
            existing_passes_registry = existing_passes_registry_result.scalar_one_or_none()
            
            if not existing_passes_registry:
                db_passes_registry = Eve_PassesRegistry(
                    Deliverabled_Code=detail_data.Deliverabled_Code,
                    Deliverable_No=detail_data.Deliverable_No,
                    SponsorMasterId=db_sponsor.SponsorMasterId,
                    Event_Code=sponsor_data.Event_Code,
                    Elite_Passess=0,
                    Carporate_Passess=0,
                    Visitor_Passess=0,
                    Deligate_Name_Recieverd="N"
                )
                db.add(db_passes_registry)
                should_broadcast = True

        # Handle Deliverable_Code 22  (SpeakerTracker)
        elif detail_data.Deliverabled_Code == 22:
            existing_speaker_tracker_stmt = select(EveSpeakerTracker).filter(
                EveSpeakerTracker.SponsorMasterId == db_sponsor.SponsorMasterId,
                EveSpeakerTracker.Deliverabled_Code == 22
            )
            existing_speaker_tracker_result = await db.execute(existing_speaker_tracker_stmt)
            existing_speaker_tracker = existing_speaker_tracker_result.scalar_one_or_none()
            
            if not existing_speaker_tracker:
                db_speaker_tracker = EveSpeakerTracker(
                    Deliverabled_Code=detail_data.Deliverabled_Code,
                    Deliverable_No=detail_data.Deliverable_No,
                    SponsorMasterId=db_sponsor.SponsorMasterId,
                    Event_Code=sponsor_data.Event_Code,
                    Speaker_Name="",
                    Designation="",
                    Mobile_No="",
                    Email_Address="",
                    Speaker_Bio="",
                    Speaking_Date=None,
                    Track=""
                )
                db.add(db_speaker_tracker)
                should_broadcast = True

    
    await db.commit()
    await db.refresh(db_sponsor)

    if ws_manager:
        if should_broadcast:
            await ws_manager.broadcast("refresh_expo_registry")
    
    return db_sponsor  




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
    
    should_broadcast = False

    if update_data:
        await db.execute(
            update(Eve_SponsorMaster)
            .where(Eve_SponsorMaster.SponsorMasterId == sponsor_id)
            .values(**update_data)
        )
        should_broadcast = True
    
    if sponsor_data.details is not None:
        current_details_stmt = select(Eve_SponsorMasterDetail).filter(
            Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id
        )
        current_details = await db.execute(current_details_stmt)
        current_detail_dict = {
            d.Deliverabled_Code: d for d in current_details.scalars().all()
        }

        incoming_detail_codes = {d.Deliverabled_Code for d in sponsor_data.details}

        # Check existing trackers for 31, 39, 43,20 and 40
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

        passes_registry_result = await db.execute(
            select(Eve_PassesRegistry).filter(
                Eve_PassesRegistry.SponsorMasterId == sponsor_id,
                Eve_PassesRegistry.Deliverabled_Code == 20
            )
        )
        passes_registry = passes_registry_result.scalar_one_or_none()

        #Speaker Sponsor Tracker
        speaker_tracker_result = await db.execute(
            select(EveSpeakerTracker).filter(
                EveSpeakerTracker.SponsorMasterId == sponsor_id,
                EveSpeakerTracker.Deliverabled_Code == 22
            )
        )
        speaker_tracker = speaker_tracker_result.scalar_one_or_none()
        

        expo_booth_assigned = expo_tracker and expo_tracker.Booth_Number_Assigned is not None and expo_tracker.Booth_Number_Assigned != 0
        award_assigned = award_tracker and award_tracker.Award_Code is not None and award_tracker.Award_Code != 0
        curated_speaker_assigned = curated_tracker and curated_tracker.Speaker_Name is not None and curated_tracker.Speaker_Name != ""
        ministerial_speaker_assigned = ministerial_tracker and ministerial_tracker.Speaker_Name is not None and ministerial_tracker.Speaker_Name != ""

        passes_registry_assigned = False
        if passes_registry:
            passes_registry_assigned = (
                (passes_registry.Elite_Passess is not None and passes_registry.Elite_Passess != 0) or
                (passes_registry.Carporate_Passess is not None and passes_registry.Carporate_Passess != 0) or
                (passes_registry.Visitor_Passess is not None and passes_registry.Visitor_Passess != 0)
            )

        speaker_assigned = speaker_tracker and speaker_tracker.Speaker_Name is not None and speaker_tracker.Speaker_Name != ""
        
        
        details_to_delete = []
        expo_trackers_to_delete = []
        award_trackers_to_delete = []
        curated_trackers_to_delete = []
        ministerial_trackers_to_delete = []
        passes_registry_to_delete = []
        speaker_trackers_to_delete = []


        
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
                elif detail_code == 20 and passes_registry:
                    if not passes_registry_assigned:
                        passes_registry_to_delete.append(passes_registry)
                        details_to_delete.append(detail)
                        should_broadcast = True
                    else:
                        continue
                elif detail_code == 22 and speaker_tracker:
                    if not speaker_assigned:
                        speaker_trackers_to_delete.append(speaker_tracker)
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

        for passes_registry_to_delete_item in passes_registry_to_delete:
            await db.delete(passes_registry_to_delete_item)

        for speaker_tracker_to_delete in speaker_trackers_to_delete:
            await db.delete(speaker_tracker_to_delete)
        
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
                            Notes_Comments=""
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
                
                elif detail_code == 20:
                    existing_passes_registry_stmt = select(Eve_PassesRegistry).filter(
                        Eve_PassesRegistry.SponsorMasterId == sponsor_id,
                        Eve_PassesRegistry.Deliverabled_Code == 20
                    )
                    existing_passes_registry_result = await db.execute(existing_passes_registry_stmt)
                    existing_passes_registry = existing_passes_registry_result.scalar_one_or_none()
                    
                    if not existing_passes_registry:
                        db_passes_registry = Eve_PassesRegistry(
                            Deliverabled_Code=20,
                            Deliverable_No=new_detail_data.Deliverable_No,
                            SponsorMasterId=sponsor_id,
                            Event_Code=db_sponsor.Event_Code,
                            Elite_Passess= None,
                            Carporate_Passess= None,
                            Visitor_Passess=   None,
                            Deligate_Name_Recieverd="N"
                        )
                        db.add(db_passes_registry)
                        should_broadcast = True

                elif detail_code == 22:
                    existing_speaker_tracker_stmt = select(EveSpeakerTracker).filter(
                        EveSpeakerTracker.SponsorMasterId == sponsor_id,
                        EveSpeakerTracker.Deliverabled_Code == 22
                    )
                    existing_speaker_tracker_result = await db.execute(existing_speaker_tracker_stmt)
                    existing_speaker_tracker = existing_speaker_tracker_result.scalar_one_or_none()
                    
                    if not existing_speaker_tracker:
                        db_speaker_tracker = EveSpeakerTracker(
                            Deliverabled_Code=22,
                            Deliverable_No=new_detail_data.Deliverable_No,
                            SponsorMasterId=sponsor_id,
                            Event_Code=db_sponsor.Event_Code,
                            Speaker_Name="",
                            Designation="",
                            Mobile_No="",
                            Email_Address="",
                            Speaker_Bio="",
                            Speaking_Date=None,
                            Track=""
                        )
                        db.add(db_speaker_tracker)
                        should_broadcast = True

    await db.commit()

    if ws_manager:
        if should_broadcast:
            await ws_manager.broadcast("refresh_expo_registry")
    
    return await get_sponsor(db, sponsor_id)



# async def delete_sponsor(
#     db: AsyncSession, 
#     sponsor_id: int,
#     ws_manager: Optional[ConnectionManager] = None
# ):
#     db_sponsor = await get_sponsor(db, sponsor_id)
#     if db_sponsor:
#         if db_sponsor.Sponsor_logo:
#             delete_upload_file(db_sponsor.Sponsor_logo)
        
#         await db.delete(db_sponsor)
#         await db.commit()
        
#         if ws_manager:
#             await ws_manager.broadcast("refresh_expo_registry")

#         return True
#     return False



async def delete_sponsor(
    db: AsyncSession, 
    sponsor_id: int,
    ws_manager: Optional[ConnectionManager] = None
):
    db_sponsor = await get_sponsor(db, sponsor_id)
    if db_sponsor:
        # Delete related entries from all tracker tables first
        try:
            # Delete from ExpoRegistryTracker
            expo_trackers = await db.execute(
                select(ExpoRegistryTracker)
                .where(ExpoRegistryTracker.SponsorMasterId == sponsor_id)
            )
            for expo_tracker in expo_trackers.scalars().all():
                await db.delete(expo_tracker)
            
            # Delete from AwardRegistryTracker
            award_trackers = await db.execute(
                select(AwardRegistryTracker)
                .where(AwardRegistryTracker.SponsorMasterId == sponsor_id)
            )
            for award_tracker in award_trackers.scalars().all():
                await db.delete(award_tracker)
            
            # Delete from EveCuratedSession
            curated_sessions = await db.execute(
                select(EveCuratedSession)
                .where(EveCuratedSession.SponsorMasterId == sponsor_id)
            )
            for curated_session in curated_sessions.scalars().all():
                await db.delete(curated_session)
            
            # Delete from EveMinisterialSession
            ministerial_sessions = await db.execute(
                select(EveMinisterialSession)
                .where(EveMinisterialSession.SponsorMasterId == sponsor_id)
            )
            for ministerial_session in ministerial_sessions.scalars().all():
                await db.delete(ministerial_session)
            
            # Delete from Eve_SponsorMasterDetail
            sponsor_details = await db.execute(
                select(Eve_SponsorMasterDetail)
                .where(Eve_SponsorMasterDetail.SponsorMasterId == sponsor_id)
            )
            for sponsor_detail in sponsor_details.scalars().all():
                await db.delete(sponsor_detail)


            # Update SlotMaster records to set SponsorMasterId to null
            slot_masters = await db.execute(
                select(SlotMaster)
                .where(SlotMaster.SponsorMasterId == sponsor_id)
            )
            for slot_master in slot_masters.scalars().all():
                slot_master.SponsorMasterId = None
                db.add(slot_master)

            # Delete from Eve_PassesRegistry
            passes_registries = await db.execute(
                select(Eve_PassesRegistry)
                .where(Eve_PassesRegistry.SponsorMasterId == sponsor_id)
            )
            for passes_registry in passes_registries.scalars().all():
                await db.delete(passes_registry)

            # Delete from EveSpeakerTracker
            speaker_trackers = await db.execute(
                select(EveSpeakerTracker)
                .where(EveSpeakerTracker.SponsorMasterId == sponsor_id)
            )
            for speaker_tracker in speaker_trackers.scalars().all():
                await db.delete(speaker_tracker)
            
            # Now delete the sponsor itself
            if db_sponsor.Sponsor_logo:
                delete_upload_file(db_sponsor.Sponsor_logo)
            
            await db.delete(db_sponsor)
            await db.commit()
            
            if ws_manager:
                await ws_manager.broadcast("refresh_expo_registry")
            
            return True
            
        except Exception as e:
            await db.rollback()
            # Log the error or handle it appropriately
            print(f"Error deleting sponsor and related entries: {e}")
            return False
    
    return False

async def get_sponsors_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(Eve_SponsorMaster)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()