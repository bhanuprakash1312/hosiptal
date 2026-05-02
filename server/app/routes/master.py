from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal , get_db
from app.models.department import Department
from app.models.doctor import Doctor

router = APIRouter(prefix="/master", tags=["Master"])



@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/doctors/{department_id}")
def get_doctors(department_id: int, db: Session = Depends(get_db)):
    doctors = db.query(Doctor).filter(
        Doctor.department_id == department_id
    ).all()
    
    return [
        {
            "id": doc.id,
            "name": doc.user.name,
            "experience_years": 10,  # Mocked as it's not in DB
            "consultation_fee": 500, # Mocked as it's not in DB
            "department_id": doc.department_id
        } for doc in doctors
    ]
