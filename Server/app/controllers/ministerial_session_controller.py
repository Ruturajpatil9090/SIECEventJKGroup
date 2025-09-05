from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.ministerial_session_schema import (
    MinisterialSession, 
    MinisterialSessionCreate, 
    MinisterialSessionUpdate
)
from ..services.ministerial_session_service import (
    get_ministerial_session,
    get_ministerial_sessions,
    create_ministerial_session,
    update_ministerial_session,
    delete_ministerial_session,
    get_max_ministerial_session_id,
    get_ministerial_sessions_by_event_code,
    get_ministerial_sessions_by_sponsor,
    get_ministerial_sessions_by_track,
    get_ministrial_details
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/ministerial-sessions",
    tags=["ministerial-sessions"]
)

# @router.get("/", response_model=List[MinisterialSession])
# async def get_all_ministerial_sessions(
#     event_code: Optional[int] = Query(None),
#     sponsor_id: Optional[int] = Query(None),
#     track: Optional[str] = Query(None),
#     db: AsyncSession = Depends(get_db)
# ):
#     if event_code:
#         return await get_ministerial_sessions_by_event_code(db, event_code)
#     elif sponsor_id:
#         return await get_ministerial_sessions_by_sponsor(db, sponsor_id)
#     elif track:
#         return await get_ministerial_sessions_by_track(db, track)
#     else:
#         results = await get_ministerial_sessions(db)
#         return results

@router.get("/", response_model=List[MinisterialSession])
async def get_all_ministerial_sessions(
    event_code: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    track: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        results = await get_ministerial_sessions(db, event_code)
    elif sponsor_id:
        results = await get_ministerial_sessions_by_sponsor(db, sponsor_id)
    elif track:
        results = await get_ministerial_sessions_by_track(db, track)
    else:
        results = await get_ministerial_sessions(db, None)  
    
    return results


@router.get("/details/{MinisterialSessionId}")
async def read_MinisterialSessionId_details(
    MinisterialSessionId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        registry_details = await get_ministrial_details(db, MinisterialSessionId=MinisterialSessionId)
        
        if not registry_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ministerial registry details not found for ID: {MinisterialSessionId}"
            )
            
        return registry_details
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving Ministerial registry details: {str(e)}"
        )


@router.get("/getlastMinisterialSessionId", response_model=int)
async def get_max_ministerial_session_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_ministerial_session_id(db)

@router.post("/", response_model=MinisterialSession, status_code=status.HTTP_201_CREATED)
async def create_ministerial_session_endpoint(
    session_data: MinisterialSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_ministerial_session(db, session_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{session_id}", response_model=MinisterialSession)
async def read_ministerial_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_session = await get_ministerial_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ministerial session not found"
        )
    return db_session

@router.put("/{session_id}", response_model=MinisterialSession)
async def update_existing_ministerial_session(
    session_id: int,
    session: MinisterialSessionUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_session = await update_ministerial_session(db=db, session_id=session_id, session=session,ws_manager=manager)
    if updated_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ministerial session not found"
        )
    return updated_session

@router.delete("/{session_id}")
async def delete_existing_ministerial_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_ministerial_session(db=db, session_id=session_id,ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ministerial session not found"
        )
    return {"message": "Ministerial session deleted successfully"}