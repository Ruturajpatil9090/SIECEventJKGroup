from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from ..schemas.curated_session_schema import (
    CuratedSession, 
    CuratedSessionCreate, 
    CuratedSessionUpdate
)
from ..services.curated_session_service import (
    get_curated_session,
    get_curated_sessions,
    create_curated_session,
    update_curated_session,
    delete_curated_session,
    get_max_curated_session_id,
    get_curated_sessions_by_event_code,
    get_curated_sessions_by_sponsor,
    get_curated_sessions_by_track,
    get_curatedsession_details
)
from ..models.database import get_db
from app.websockets.connection_manager import manager

router = APIRouter(
    prefix="/curated-sessions",
    tags=["curated-sessions"]
)

@router.get("/", response_model=List[CuratedSession])
async def get_all_curated_sessions(
    event_code: Optional[int] = Query(None),
    sponsor_id: Optional[int] = Query(None),
    track: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if event_code:
        results = await get_curated_sessions(db, event_code)
    elif sponsor_id:
        results = await get_curated_sessions_by_sponsor(db, sponsor_id)
    elif track:
        results = await get_curated_sessions_by_track(db, track)
    else:
        results = await get_curated_sessions(db, None) 
    
    return results


@router.get("/details/{CuratedSessionId}")
async def read_CuratedSessionId_details(
    CuratedSessionId: int,
    db: AsyncSession = Depends(get_db),
):
    try:
        registry_details = await get_curatedsession_details(db, CuratedSessionId=CuratedSessionId)
        
        if not registry_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CuratedSession registry details not found for ID: {CuratedSessionId}"
            )
            
        return registry_details
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving CuratedSession registry details: {str(e)}"
        )

@router.get("/getlastCuratedSessionId", response_model=int)
async def get_max_curated_session_id_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_max_curated_session_id(db)

@router.post("/", response_model=CuratedSession, status_code=status.HTTP_201_CREATED)
async def create_curated_session_endpoint(
    session_data: CuratedSessionCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await create_curated_session(db, session_data,ws_manager=manager)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{session_id}", response_model=CuratedSession)
async def read_curated_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    db_session = await get_curated_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curated session not found"
        )
    return db_session

@router.put("/{session_id}", response_model=CuratedSession)
async def update_existing_curated_session(
    session_id: int,
    session: CuratedSessionUpdate,
    db: AsyncSession = Depends(get_db),
):
    updated_session = await update_curated_session(db=db, session_id=session_id, session=session,ws_manager=manager)
    if updated_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curated session not found"
        )
    return updated_session

@router.delete("/{session_id}")
async def delete_existing_curated_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
):
    success = await delete_curated_session(db=db, session_id=session_id,ws_manager=manager)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curated session not found"
        )
    return {"message": "Curated session deleted successfully"}