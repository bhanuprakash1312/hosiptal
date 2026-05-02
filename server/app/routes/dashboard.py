from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_current_doctor
from app.database import get_db
from app.models.appointment import Appointment
from app.models.blocked_slot import BlockedSlot
from app.schemas.doctor import BlockedSlotCreate
from app.models.user import User

router = APIRouter(prefix="/doctor", tags=["Doctor Dashboard"])

@router.get("/appointments")
def doctor_appointments(
    db: Session = Depends(get_db),
    doctor: User = Depends(get_current_doctor)
):
    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doctor.id)
        .order_by(Appointment.appointment_date)
        .all()
    )

    return appointments
@router.patch("/appointments/{appointment_id}")
def update_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db),
    doctor: User = Depends(get_current_doctor)
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == doctor.id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = status
    db.commit()
    return {"message": "Status updated"}

@router.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    doctor: User = Depends(get_current_doctor)
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == doctor.id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    if appt.status not in ["CANCELLED", "COMPLETED"]:
        raise HTTPException(status_code=400, detail="Can only remove cancelled or completed appointments")

    db.delete(appt)
    db.commit()
    return {"message": "Appointment removed successfully"}

@router.get("/blocked-slots")
def get_blocked_slots(db: Session = Depends(get_db), doctor: User = Depends(get_current_doctor)):
    return db.query(BlockedSlot).filter(BlockedSlot.doctor_id == doctor.id).all()

@router.post("/blocked-slots")
def create_blocked_slot(data: BlockedSlotCreate, db: Session = Depends(get_db), doctor: User = Depends(get_current_doctor)):
    # Check if already exists
    existing = db.query(BlockedSlot).filter(
        BlockedSlot.doctor_id == doctor.id,
        BlockedSlot.date == data.date,
        BlockedSlot.time_slot == data.time_slot
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Slot already blocked")
        
    slot = BlockedSlot(doctor_id=doctor.id, date=data.date, time_slot=data.time_slot)
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@router.delete("/blocked-slots/{slot_id}")
def delete_blocked_slot(slot_id: int, db: Session = Depends(get_db), doctor: User = Depends(get_current_doctor)):
    slot = db.query(BlockedSlot).filter(BlockedSlot.id == slot_id, BlockedSlot.doctor_id == doctor.id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    db.delete(slot)
    db.commit()
    return {"message": "Blocked slot removed"}
