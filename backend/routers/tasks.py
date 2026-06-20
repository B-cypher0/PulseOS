from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from core.database import get_db
from core.auth import get_current_staff, require_admin

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskCreate(BaseModel):
    assigned_to: str
    title: str
    description: Optional[str] = None
    category: str = "general"
    priority: str = "normal"
    due_at: Optional[str] = None
    patient_id: Optional[str] = None
    ward_id: Optional[str] = None

class TaskComplete(BaseModel):
    completion_note: Optional[str] = None

@router.post("/")
async def create_task(data: TaskCreate, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    task_data = {**data.model_dump(exclude_none=True), "hospital_id": current_staff["hospital_id"], "assigned_by": current_staff["id"], "status": "assigned"}
    result = db.table("tasks").insert(task_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create task")
    task = result.data[0]
    db.table("notifications").insert({"hospital_id": current_staff["hospital_id"], "recipient_type": "staff", "staff_id": data.assigned_to, "title": f"New task: {data.title}", "body": data.description or f"Priority: {data.priority}", "type": "task_assigned", "channel": "push", "task_id": task["id"]}).execute()
    return {"message": "Task assigned", "task": task}

@router.get("/my-tasks")
async def my_tasks(current_staff=Depends(get_current_staff), db=Depends(get_db)):
    result = db.table("tasks").select("*").eq("assigned_to", current_staff["id"]).not_.in_("status", ["completed", "cancelled"]).order("priority").execute()
    emergency = [t for t in result.data if t["priority"] == "emergency"]
    urgent = [t for t in result.data if t["priority"] == "urgent"]
    normal = [t for t in result.data if t["priority"] not in ["emergency", "urgent"]]
    return {"emergency": emergency, "urgent": urgent, "normal": normal, "total": len(result.data)}

@router.patch("/{task_id}/complete")
async def complete_task(task_id: str, data: TaskComplete, current_staff=Depends(get_current_staff), db=Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()
    result = db.table("tasks").update({"status": "completed", "completed_at": now, "completed_by": current_staff["id"], "completion_note": data.completion_note}).eq("id", task_id).eq("assigned_to", current_staff["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found or not assigned to you")
    return {"message": "Task completed ✓", "task": result.data[0]}

@router.get("/admin/all")
async def admin_tasks(current_staff=Depends(require_admin), db=Depends(get_db)):
    result = db.table("tasks").select("*, staff!assigned_to(first_name, last_name, role)").eq("hospital_id", current_staff["hospital_id"]).order("created_at", desc=True).limit(100).execute()
    now_iso = datetime.now(timezone.utc).isoformat()
    completed = [t for t in result.data if t["status"] == "completed"]
    overdue = [t for t in result.data if t.get("due_at") and t["status"] not in ["completed","cancelled"] and t["due_at"] < now_iso]
    rate = round(len(completed)/len(result.data)*100, 1) if result.data else 0
    return {"summary": {"total": len(result.data), "completed": len(completed), "overdue": len(overdue), "completion_rate": rate}, "overdue": overdue, "all": result.data}