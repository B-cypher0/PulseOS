from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from core.database import get_db
from core.auth import hash_password, verify_password, create_access_token, get_current_staff, require_admin

router = APIRouter(prefix="/staff", tags=["Staff"])

class StaffRegister(BaseModel):
    hospital_id: str
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str = "nurse"
    phone: Optional[str] = None
    employee_number: Optional[str] = None
    ward_id: Optional[str] = None

class StaffLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=201)
async def register_staff(data: StaffRegister, db=Depends(get_db)):
    hospital = db.table("hospitals").select("id").eq("id", data.hospital_id).execute()
    if not hospital.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    existing = db.table("staff").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    staff_data = {**data.model_dump(exclude={"password"}), "password_hash": hash_password(data.password), "is_active": True}
    result = db.table("staff").insert(staff_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create staff member")
    staff = result.data[0]
    staff.pop("password_hash", None)
    return {"message": f"Welcome to PulseOS, {data.first_name}!", "staff": staff}

@router.post("/login")
async def login(data: StaffLogin, db=Depends(get_db)):
    result = db.table("staff").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    staff = result.data[0]
    if not staff.get("is_active"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account inactive")
    if not verify_password(data.password, staff.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token({"sub": staff["id"], "hospital_id": staff["hospital_id"], "role": staff["role"], "name": f"{staff['first_name']} {staff['last_name']}"})
    staff.pop("password_hash", None)
    return {"access_token": token, "token_type": "bearer", "staff": staff}

@router.get("/me")
async def get_my_profile(current_staff=Depends(get_current_staff)):
    current_staff.pop("password_hash", None)
    return current_staff

@router.get("/all")
async def get_all_staff(current_staff=Depends(require_admin), db=Depends(get_db)):
    result = db.table("staff").select("id,first_name,last_name,email,role,ward_id,is_active,employee_number,phone").eq("hospital_id", current_staff["hospital_id"]).order("last_name").execute()
    return {"staff": result.data, "total": len(result.data)}