from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .models.database import engine, Base
from .controllers import auth_controller,deliverables_controller,category_controller,category_sub_controller,event_super_controller,event_controller,CategoryWiseDeliverables_controller,sponsor_master_controller,user_master_controller,expo_registry_tracker_controller,websocket_controller,Award_master_controller,award_registry_tracker_controller,curated_session_controller,ministerial_session_controller,slot_master_controller,passes_registry_controller,speaker_tracker_controller,account_master_controller,secretarial_roundtable_controller,networking_slot_controller
import asyncio
import os

app = FastAPI()

# Create upload directory
os.makedirs("uploads/sponsor_logos", exist_ok=True)

# Serve sponsor PDFs/documents
app.mount("/sponsors/pdf", StaticFiles(directory="uploads/docs"), name="pdf")

app.mount("/sponsors/video", StaticFiles(directory="uploads/Video"), name="video")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    #    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_controller.router)
app.include_router(deliverables_controller.router)
app.include_router(category_controller.router)
app.include_router(category_sub_controller.router)
app.include_router(event_super_controller.router)
app.include_router(event_controller.router)
app.include_router(CategoryWiseDeliverables_controller.router)
app.include_router(sponsor_master_controller.router)
app.include_router(user_master_controller.router)
app.include_router(expo_registry_tracker_controller.router)
app.include_router(websocket_controller.router)
app.include_router(Award_master_controller.router)
app.include_router(award_registry_tracker_controller.router)
app.include_router(curated_session_controller.router)
app.include_router(ministerial_session_controller.router)
app.include_router(slot_master_controller.router)
app.include_router(passes_registry_controller.router)
app.include_router(speaker_tracker_controller.router)
app.include_router(account_master_controller.router)
app.include_router(secretarial_roundtable_controller.router)
app.include_router(networking_slot_controller.router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def read_root():
    return {"message": "Welcome to FastAPI with Async MSSQL"}

@app.get("/ping")
async def ping():
    print("PING RECEIVED")
    return {"status": "alive"}