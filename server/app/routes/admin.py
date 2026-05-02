from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.department import Department
from app.models.appointment import Appointment
from app.models.user import User
from app.core.security import hash_password

router = APIRouter(prefix="/admin", tags=["Admin"])

class DepartmentCreate(BaseModel):
    name: str

class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    department_id: int

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_departments = db.query(Department).count()
    
    today = datetime.utcnow().date()
    daily_appointments = db.query(Appointment).filter(Appointment.appointment_date == today).count()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_departments": total_departments,
        "daily_appointments": daily_appointments
    }

@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/departments")
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db)):
    if db.query(Department).filter(Department.name == dept.name).first():
        raise HTTPException(status_code=400, detail="Department already exists")
    new_dept = Department(name=dept.name)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).get(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted"}

@router.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()
    return [{
        "id": d.id,
        "name": d.user.name,
        "email": d.user.email,
        "phone": d.user.phone,
        "department_id": d.department_id,
        "department_name": d.department.name if d.department else "None"
    } for d in doctors]

@router.post("/doctors")
def create_doctor(data: DoctorCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    if not db.query(Department).get(data.department_id):
        raise HTTPException(status_code=400, detail="Department not found")

    pwd = hash_password("Doctor@123")
    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password=pwd,
        role="DOCTOR",
        is_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    doctor = Doctor(id=user.id, department_id=data.department_id)
    db.add(doctor)
    db.commit()
    return {"message": "Doctor created", "id": doctor.id}

@router.delete("/doctors/{doc_id}")
def delete_doctor(doc_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).get(doc_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    user = db.query(User).get(doc_id)
    
    db.delete(doctor)
    if user:
        db.delete(user)
        
    db.commit()
    return {"message": "Doctor deleted"}
