from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)

    appointment_date = Column(Date, nullable=False)
    time_slot = Column(String, nullable=False)
    visit_type = Column(String, nullable=False)

    status = Column(String, default="BOOKED")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
    doctor = relationship("Doctor")
