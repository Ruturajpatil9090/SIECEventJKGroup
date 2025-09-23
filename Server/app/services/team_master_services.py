from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List, Optional
from ..models.team_master_models import Eve_TeamMasterHead, Eve_TeamMasterDetail
from ..schemas.team_master_schema import TeamMasterHeadCreate, TeamMasterHeadUpdate
from fastapi import HTTPException

async def get_team_masters(db: AsyncSession, skip: int = 0, limit: int = 100):
    query = text("""
    SELECT 
        tmh.TeamMasterId,
        tmh.Team_Name,
        tmh.Team_Purpose,
        tmh.Supervisor,
        tmh.Created_By,
        tmh.Created_Date,
        tmh.Modified_By,
        tmh.Modified_Date,
        tmd.TeamMasterDetailId,
        tmd.User_Id,
        tmd.TeamMasterId as detail_TeamMasterId
    FROM dbo.Eve_TeamMasterHead tmh
    LEFT JOIN dbo.Eve_TeamMasterDetail tmd ON tmh.TeamMasterId = tmd.TeamMasterId
    ORDER BY tmh.TeamMasterId DESC, tmd.TeamMasterDetailId
    """)
    
    try:
        result = await db.execute(query, {"skip": skip, "limit": limit})
        rows = result.mappings().all()
        
        # Group the results by TeamMasterId
        teams_dict = {}
        
        for row in rows:
            row_dict = dict(row)
            team_id = row_dict['TeamMasterId']
            
            if team_id not in teams_dict:
                teams_dict[team_id] = {
                    "TeamMasterId": team_id,
                    "Team_Name": row_dict.get('Team_Name'),
                    "Team_Purpose": row_dict.get('Team_Purpose'),
                    "Supervisor": row_dict.get('Supervisor'),
                    "Created_By": row_dict.get('Created_By'),
                    "Created_Date": row_dict.get('Created_Date'),
                    "Modified_By": row_dict.get('Modified_By'),
                    "Modified_Date": row_dict.get('Modified_Date'),
                    "details": []
                }
            
            if row_dict.get('TeamMasterDetailId') is not None:
                detail_data = {
                    "TeamMasterDetailId": row_dict.get('TeamMasterDetailId'),
                    "TeamMasterId": row_dict.get('detail_TeamMasterId'),
                    "User_Id": row_dict.get('User_Id')
                }
                if any(value is not None for value in detail_data.values()):
                    teams_dict[team_id]["details"].append(detail_data)
        
        return list(teams_dict.values())
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching team masters: {str(e)}")

async def get_team_master(db: AsyncSession, team_master_id: int):
    result = await db.execute(
        select(Eve_TeamMasterHead).where(Eve_TeamMasterHead.TeamMasterId == team_master_id)
    )
    return result.scalar_one_or_none()

async def create_team_master(db: AsyncSession, team_data: TeamMasterHeadCreate):
    add_details = [detail for detail in team_data.details if detail.rowaction == "add"]
    
    if not add_details:
        raise HTTPException(
            status_code=400, 
            detail="Please add at least one team detail entry."
        )
    

    db_team = Eve_TeamMasterHead(**team_data.dict(exclude={"details"}))
    db.add(db_team)
    await db.flush()
    

    created_details = []
    for detail in team_data.details:
        if detail.rowaction == "add":
            db_detail = Eve_TeamMasterDetail(
                **detail.dict(exclude={"rowaction", "TeamMasterDetailId"}),
                TeamMasterId=db_team.TeamMasterId
            )
            db.add(db_detail)
            created_details.append(db_detail)
    
    try:
        await db.commit()
        await db.refresh(db_team)
        

        db_team.details = created_details
        return db_team
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create team master: {str(e)}"
        )

async def update_team_master(
    db: AsyncSession, 
    team_master_id: int, 
    team_data: TeamMasterHeadUpdate
):

    result = await db.execute(
        select(Eve_TeamMasterHead).where(Eve_TeamMasterHead.TeamMasterId == team_master_id)
    )
    db_team = result.scalar_one_or_none()
    
    if not db_team:
        return None
    

    update_data = team_data.dict(exclude_unset=True, exclude={"details"})
    for field, value in update_data.items():
        setattr(db_team, field, value)


    created_details = []
    updated_details = []
    deleted_details = []
    
    if team_data.details:
        for detail in team_data.details:
            if detail.rowaction == "add":
                db_detail = Eve_TeamMasterDetail(
                    **detail.dict(exclude={"rowaction"}),
                    TeamMasterId=team_master_id
                )
                db.add(db_detail)
                created_details.append(db_detail)
            
            elif detail.rowaction == "update":
                result = await db.execute(
                    select(Eve_TeamMasterDetail).where(
                        Eve_TeamMasterDetail.TeamMasterDetailId == getattr(detail, 'TeamMasterDetailId', None)
                    )
                )
                existing_detail = result.scalar_one_or_none()
                
                if existing_detail:
                    update_data = detail.dict(exclude_unset=True, exclude={"rowaction", "TeamMasterDetailId"})
                    for field, value in update_data.items():
                        setattr(existing_detail, field, value)
                    updated_details.append(existing_detail)
            
            elif detail.rowaction == "delete":
                result = await db.execute(
                    select(Eve_TeamMasterDetail).where(
                        Eve_TeamMasterDetail.TeamMasterDetailId == getattr(detail, 'TeamMasterDetailId', None)
                    )
                )
                existing_detail = result.scalar_one_or_none()
                
                if existing_detail:
                    await db.delete(existing_detail)
                    deleted_details.append(existing_detail.TeamMasterDetailId)
    
    await db.commit()
    await db.refresh(db_team)
    return db_team

async def delete_team_master(db: AsyncSession, team_master_id: int):
    result = await db.execute(
        select(Eve_TeamMasterHead).where(Eve_TeamMasterHead.TeamMasterId == team_master_id)
    )
    db_team = result.scalar_one_or_none()
    
    if db_team:
        await db.delete(db_team)
        await db.commit()
        return True
    
    return False

async def get_max_team_master_id(db: AsyncSession):
    result = await db.execute(select(func.max(Eve_TeamMasterHead.TeamMasterId)))
    return result.scalar() or 0