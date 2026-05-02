from datetime import datetime, timezone
from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    sender_role = Column(String)  # PATIENT / DOCTOR
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
