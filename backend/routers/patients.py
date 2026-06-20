from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from core.database import get_db
from core.auth import get_current_staff

router = APIRouter(prefix="/patients", tags=["Patients"])

class PatientAdmit(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    id_number: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    ward_id: Optional[str] = None
    bed_number: Optional[str] = None
    admission_reason: Optional[str] = None
    triage_level: Optional[int] = 3
    attending_doctor_id: Optional[str] = None

class VitalsLog(BaseModel):
    patient_id: str
    heart_rate: Optional[int] = None
    spo2: Optional[float] = None
    skin_temp: Optional[float] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None

@router.post("/admit", status_code=201)
async def admit_patient(data: PatientAdmit, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    result = db.table("patients").insert({**data.model_dump(exclude_none=True), "hospital_id": current_staff["hospital_id"], "status": "admitted"}).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to admit patient")
    return {"message": f"Patient {data.first_name} {data.last_name} admitted", "patient": result.data[0]}

@router.get("/active")
async def active_patients(current_staff=Depends(get_current_staff), db=Depends(get_db)):
    result = db.table("patients").select("*").eq("hospital_id", current_staff["hospital_id"]).neq("status", "discharged").order("triage_level").execute()
    return {"patients": result.data, "total": len(result.data)}

@router.get("/{patient_id}")
async def get_patient(patient_id: str, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    result = db.table("patients").select("*").eq("id", patient_id).eq("hospital_id", current_staff["hospital_id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    vitals = db.table("patient_vitals").select("*").eq("patient_id", patient_id).order("recorded_at", desc=True).limit(10).execute()
    alerts = db.table("patient_alerts").select("*").eq("patient_id", patient_id).eq("status", "open").execute()
    return {"patient": result.data, "latest_vitals": vitals.data, "open_alerts": alerts.data}

@router.post("/vitals")
async def log_vitals(data: VitalsLog, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    alert_flag = "normal"
    alerts = []
    if data.heart_rate and (data.heart_rate > 120 or data.heart_rate < 45):
        alert_flag = "critical"
        alerts.append({"patient_id": data.patient_id, "hospital_id": current_staff["hospital_id"], "alert_type": "vitals_critical", "severity": "critical", "title": f"Critical heart rate: {data.heart_rate} BPM", "status": "open"})
    if data.spo2 and data.spo2 < 94:
        alert_flag = "critical"
        alerts.append({"patient_id": data.patient_id, "hospital_id": current_staff["hospital_id"], "alert_type": "vitals_critical", "severity": "critical", "title": f"Low SpO2: {data.spo2}%", "status": "open"})
    vitals_data = {**data.model_dump(exclude_none=True), "alert_flag": alert_flag}
    result = db.table("patient_vitals").insert(vitals_data).execute()
    if alerts:
        db.table("patient_alerts").insert(alerts).execute()
    return {"message": "Vitals logged", "flag": alert_flag, "alerts_raised": len(alerts)}

@router.patch("/{patient_id}/discharge")
async def discharge(patient_id: str, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    result = db.table("patients").update({"status": "discharged", "discharged_at": datetime.now(timezone.utc).isoformat()}).eq("id", patient_id).eq("hospital_id", current_staff["hospital_id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient discharged", "patient": result.data[0]}