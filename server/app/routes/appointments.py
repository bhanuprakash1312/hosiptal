from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal , get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.schemas.appointment import AppointmentCreate
from datetime import date
from app.core.deps import get_current_user


router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", dependencies=[Depends(get_current_user)])
def book_appointment(
    data: AppointmentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(status_code=400, detail="Patient profile not found")

    # Prevent duplicate booking
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.time_slot == data.time_slot,
        Appointment.status == "BOOKED"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")

    appointment = Appointment(
        patient_id=patient.id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        time_slot=data.time_slot,
        visit_type=data.visit_type
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment booked successfully",
        "appointment_id": appointment.id
    }
@router.get("/patient/me")
def get_my_appointments(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(status_code=400, detail="Patient profile not found")

    return db.query(Appointment).filter(
        Appointment.patient_id == patient.id
    ).all()

@router.patch("/cancel/{appointment_id}", dependencies=[Depends(get_current_user)])
def cancel_appointnment(appointment_id : int,
        current_user = Depends(get_current_user),
        db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()

    if not patient:
        raise HTTPException(status_code=400, detail="Patient profile not found")
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == patient.id,
        Appointment.status == "BOOKED"
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found or cannot be cancelled")
    appointment.status = "CANCELLED"
    db.commit()
    return {"message": "Appointment cancelled successfully"}
@router.patch("/reschedule/{appointment_id}", dependencies=[Depends(get_current_user)])
def rechedule_appointement(appointment_id :int, data:AppointmentCreate, current_user = Depends(get_current_user), db : Session = Depends(get_db)):
    patient = db.query(Patient).filter(current_user.id == Patient.user_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Patient profile not found")
    existing = db.query(Appointment).filter(
        Appointment.doctor_id == data.doctor_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.time_slot == data.time_slot,
        Appointment.status == "BOOKED"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")


    existing.doctor_id = data.doctor_id
    existing.appointment_date = data.appointment_date
    existing.time_slot = data.time_slot
    existing.visit_type = data.visit_type

    db.commit()
    return {"message": "Appointment rescheduled successfully"}