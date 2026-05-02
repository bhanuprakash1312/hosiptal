from pydantic import BaseModel
from datetime import date
from typing import Optional

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    experience_years: int
    consultation_fee: int
    department_id: int

    class Config:
        orm_mode = True

class BlockedSlotCreate(BaseModel):
    date: date
    time_slot: Optional[str] = None
