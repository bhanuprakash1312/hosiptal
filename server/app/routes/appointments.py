from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal , get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.blocked_slot import BlockedSlot
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

@router.get("/available-slots")
def get_available_slots(
    doctor_id: int,
    appointment_date: date,
    db: Session = Depends(get_db)
):
    all_slots = [
        "09:00 AM", "09:30 AM", "10:00 AM",
        "10:30 AM", "11:00 AM", "04:00 PM",
    ]

    # Check for whole day block
    whole_day_block = db.query(BlockedSlot).filter(
        BlockedSlot.doctor_id == doctor_id,
        BlockedSlot.date == appointment_date,
        BlockedSlot.time_slot == None
    ).first()

    if whole_day_block:
        return []

    # Get blocked specific slots
    blocked_slots_db = db.query(BlockedSlot.time_slot).filter(
        BlockedSlot.doctor_id == doctor_id,
        BlockedSlot.date == appointment_date,
        BlockedSlot.time_slot != None
    ).all()
    blocked_slots = [s[0] for s in blocked_slots_db]

    # Get booked appointments
    booked_appointments = db.query(Appointment.time_slot).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status == "BOOKED"
    ).all()
    booked_slots = [s[0] for s in booked_appointments]

    unavailable_slots = set(blocked_slots + booked_slots)
    available_slots = [slot for slot in all_slots if slot not in unavailable_slots]

    return available_slots
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

@router.delete("/{appointment_id}", dependencies=[Depends(get_current_user)])
def delete_appointment(
    appointment_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.user_id == current_user.id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=400, detail="Patient profile not found")
        
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == patient.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appointment.status not in ["CANCELLED", "COMPLETED"]:
        raise HTTPException(status_code=400, detail="Can only remove cancelled or completed appointments")
        
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment removed successfully"}