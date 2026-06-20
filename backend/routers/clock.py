from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timezone
from core.database import get_db
from core.auth import get_current_staff, require_admin

router = APIRouter(prefix="/clock", tags=["Clock In/Out"])

class ClockInRequest(BaseModel):
    method: str = "app"
    location: Optional[str] = "Main Entrance"
    heart_rate: Optional[int] = None
    note: Optional[str] = None

class ClockOutRequest(BaseModel):
    method: str = "app"
    note: Optional[str] = None

@router.post("/in")
async def clock_in(data: ClockInRequest, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    existing = db.table("shifts").select("id").eq("staff_id", current_staff["id"]).eq("shift_date", str(date.today())).is_("clocked_out_at", "null").execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already clocked in. Please clock out first.")
    result = db.table("shifts").insert({"staff_id": current_staff["id"], "hospital_id": current_staff["hospital_id"], "clock_in_method": data.method, "clock_in_location": data.location, "clock_in_heart_rate": data.heart_rate, "clock_in_note": data.note, "shift_date": str(date.today())}).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to clock in")
    return {"message": f"Good shift, {current_staff['first_name']}! Clocked in.", "shift": result.data[0]}

@router.post("/out")
async def clock_out(data: ClockOutRequest, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    active = db.table("shifts").select("*").eq("staff_id", current_staff["id"]).eq("shift_date", str(date.today())).is_("clocked_out_at", "null").execute()
    if not active.data:
        raise HTTPException(status_code=400, detail="No active shift found.")
    now = datetime.now(timezone.utc).isoformat()
    result = db.table("shifts").update({"clocked_out_at": now, "clock_out_method": data.method, "clock_out_confirmed": True, "clock_out_note": data.note}).eq("id", active.data[0]["id"]).execute()
    return {"message": f"Good work today, {current_staff['first_name']}! Shift complete.", "shift": result.data[0]}

@router.get("/status")
async def clock_status(current_staff=Depends(get_current_staff), db=Depends(get_db)):
    active = db.table("shifts").select("*").eq("staff_id", current_staff["id"]).eq("shift_date", str(date.today())).is_("clocked_out_at", "null").execute()
    if active.data:
        return {"clocked_in": True, "shift": active.data[0]}
    return {"clocked_in": False, "message": "Not currently clocked in."}

@router.get("/today")
async def todays_shifts(current_staff=Depends(require_admin), db=Depends(get_db)):
    result = db.table("shifts").select("*, staff(first_name, last_name, role)").eq("hospital_id", current_staff["hospital_id"]).eq("shift_date", str(date.today())).execute()
    clocked_in = [s for s in result.data if not s.get("clocked_out_at")]
    return {"date": str(date.today()), "currently_clocked_in": len(clocked_in), "active_shifts": clocked_in, "all_shifts": result.data}

@router.get("/my-shifts")
async def my_shifts(current_staff=Depends(get_current_staff), db=Depends(get_db)):
    result = db.table("shifts").select("*").eq("staff_id", current_staff["id"]).order("shift_date", desc=True).limit(30).execute()
    return {"shifts": result.data, "total": len(result.data)}