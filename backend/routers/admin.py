from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timezone
from core.database import get_db
from core.auth import get_current_staff, require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

class HospitalCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    admin_email: str
    phone: Optional[str] = None

class WardCreate(BaseModel):
    name: str
    floor: Optional[str] = None
    capacity: Optional[int] = 20
    strict_mode: Optional[bool] = False

@router.post("/hospitals", status_code=201)
async def create_hospital(data: HospitalCreate, db=Depends(get_db)):
    result = db.table("hospitals").insert(data.model_dump(exclude_none=True)).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create hospital")
    return {"message": f"Hospital '{data.name}' created", "hospital": result.data[0]}

@router.post("/wards")
async def create_ward(data: WardCreate, current_staff=Depends(require_admin), db=Depends(get_db)):
    result = db.table("wards").insert({**data.model_dump(exclude_none=True), "hospital_id": current_staff["hospital_id"]}).execute()
    return {"message": "Ward created", "ward": result.data[0]}

@router.get("/dashboard")
async def dashboard(current_staff=Depends(require_admin), db=Depends(get_db)):
    hospital_id = current_staff["hospital_id"]
    today = str(date.today())
    now_iso = datetime.now(timezone.utc).isoformat()
    active_shifts = db.table("shifts").select("*, staff(first_name, last_name, role)").eq("hospital_id", hospital_id).eq("shift_date", today).is_("clocked_out_at", "null").execute()
    active_patients = db.table("patients").select("id, first_name, last_name, ward_id, bed_number, triage_level, status").eq("hospital_id", hospital_id).neq("status", "discharged").execute()
    open_tasks = db.table("tasks").select("id, title, priority, status, assigned_to, due_at").eq("hospital_id", hospital_id).not_.in_("status", ["completed", "cancelled"]).execute()
    critical_alerts = db.table("patient_alerts").select("*").eq("hospital_id", hospital_id).eq("status", "open").in_("severity", ["high", "critical"]).execute()
    overdue = [t for t in open_tasks.data if t.get("due_at") and t["due_at"] < now_iso]
    return {
        "as_of": now_iso,
        "staff": {"clocked_in": len(active_shifts.data), "active": active_shifts.data},
        "patients": {"total": len(active_patients.data), "critical": len([p for p in active_patients.data if p.get("triage_level", 5) <= 2]), "list": active_patients.data},
        "tasks": {"open": len(open_tasks.data), "overdue": len(overdue), "overdue_list": overdue},
        "alerts": {"critical": len(critical_alerts.data), "list": critical_alerts.data}
    }