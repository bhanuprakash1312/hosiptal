from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Dict, List
import json
from jose import jwt, JWTError

from app.database import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.conversation import Conversation
from app.models.appointment import Appointment
from app.models.message import Message

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: int):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: int):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)
            if len(self.active_connections[conversation_id]) == 0:
                del self.active_connections[conversation_id]

    async def broadcast(self, message: str, conversation_id: int):
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.post("/chat/start/{appointment_id}")
def start_chat(
    appointment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    convo = db.query(Conversation).filter_by(appointment_id=appointment_id).first()

    if not convo:
        appointment = db.query(Appointment).get(appointment_id)
        # Authorization constraint on creation
        if user.id != appointment.patient_id and user.id != appointment.doctor_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Not authorized to start this conversation")

        convo = Conversation(
            appointment_id=appointment_id,
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)

    return convo

@router.get("/chat/messages/{conversation_id}")
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Verify authorization
    convo = db.query(Conversation).filter_by(id=conversation_id).first()
    if not convo or (user.id != convo.patient_id and user.id != convo.doctor_id):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")

    messages = (
        db.query(Message, User.name)
        .join(User, Message.sender_id == User.id)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )

    return [
        {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "sender_role": msg.sender_role,
            "sender_name": name,
            "message": msg.message,
            "created_at": msg.created_at
        }
        for msg, name in messages
    ]

@router.websocket("/chat/ws/{conversation_id}")
async def websocket_chat(websocket: WebSocket, conversation_id: int, token: str, db: Session = Depends(get_db)):
    # 1. Verify token manually since WebSockets don't easily use HTTP Headers
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            await websocket.close(code=1008, reason="Invalid token")
            return
        user_id = int(user_id_str)
    except JWTError:
        await websocket.close(code=1008, reason="Invalid token")
        return

    # 2. Get User & Convo
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=1008, reason="User not found")
        return

    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not convo:
        await websocket.close(code=1008, reason="Conversation not found")
        return

    # 3. Security Boundary: Ensure only assigned Patient or Doctor can join
    if user.id != convo.patient_id and user.id != convo.doctor_id:
        await websocket.close(code=1008, reason="Not authorized for this chat room")
        return

    # 4. Connect
    await manager.connect(websocket, conversation_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                
                # Check if this is a WebRTC signaling message
                msg_type = payload.get("type")
                if msg_type in ["offer", "answer", "ice-candidate", "end-call"]:
                    # Just broadcast signaling data, don't save to DB
                    payload["sender_role"] = user.role
                    payload["sender_name"] = user.name
                    await manager.broadcast(json.dumps(payload), conversation_id)
                    continue

                text_msg = payload.get("message", "").strip()
                if text_msg:
                    # Save DB
                    msg = Message(
                        conversation_id=conversation_id,
                        sender_id=user.id,
                        sender_role=user.role,
                        message=text_msg
                    )
                    db.add(msg)
                    db.commit()
                    db.refresh(msg)
                    
                    out_msg = {
                        "id": msg.id,
                        "conversation_id": msg.conversation_id,
                        "sender_id": msg.sender_id,
                        "sender_role": msg.sender_role,
                        "sender_name": user.name,
                        "message": msg.message,
                        "created_at": msg.created_at.isoformat(),
                        "type": "chat"
                    }
                    await manager.broadcast(json.dumps(out_msg), conversation_id)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
