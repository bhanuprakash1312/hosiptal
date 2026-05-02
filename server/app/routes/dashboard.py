from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_current_doctor
from app.database import get_db
from app.models.appointment import Appointment
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
