from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class BlockedSlot(Base):
    __tablename__ = "blocked_slots"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    date = Column(Date, nullable=False)
    time_slot = Column(String, nullable=True) # If null, the whole day is blocked
