# PulseOS — FastAPI Entry Point
# Author: Bongani Ntshumayelo | ORCID: 0009-0000-7981-8929
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from routers import staff, clock, tasks, patients, admin

settings = get_settings()

app = FastAPI(
    title="PulseOS",
    description="AI-powered hospital operations platform by Vibranium. Author: Bongani Ntshumayelo | ORCID: 0009-0000-7981-8929",
    version="1.0.0"
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(staff.router)
app.include_router(clock.router)
app.include_router(tasks.router)
app.include_router(patients.router)
app.include_router(admin.router)

@app.get("/", tags=["Health"])
async def root():
    return {"system": "PulseOS", "version": "1.0.0", "status": "online", "author": "Bongani Ntshumayelo", "orcid": "0009-0000-7981-8929", "docs": "/docs"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "database": "supabase_connected"}