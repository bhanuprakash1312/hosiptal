from pydantic import BaseModel
from datetime import date, datetime

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    time_slot: str
    visit_type: str

class AppointmentResponse(BaseModel):
    id: int
    appointment_date: date
    time_slot: str
    visit_type: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
