from pydantic import BaseModel
from datetime import date

class PatientCreate(BaseModel):
    gender: str
    date_of_birth: date
    address: str
    city: str
    state: str
    pincode: str
    blood_group: str | None = None
    emergency_contact: str
    existing_conditions: str | None = None

class PatientResponse(BaseModel):
    id: int
    gender: str
    date_of_birth: date
    blood_group: str | None

    class Config:
        orm_mode = True
