from pydantic import BaseModel

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    experience_years: int
    consultation_fee: int
    department_id: int

    class Config:
        orm_mode = True
