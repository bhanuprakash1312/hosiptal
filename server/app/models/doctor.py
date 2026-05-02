from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)

    user = relationship("User", backref="doctor")
    department = relationship("Department", back_populates="doctors")
