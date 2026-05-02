from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    gender = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)

    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)

    blood_group = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=False)
    existing_conditions = Column(Text, nullable=True)

    user = relationship("User", backref="patient")
