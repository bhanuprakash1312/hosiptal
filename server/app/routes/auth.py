
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.schemas.user import  UserLogin, VerifyOtpRequest, RegisterRequest, CompleteRegistrationRequest, ResetPasswordEmailRequest, ResetPasswordRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.database import Base , get_db
from app.models.patient import Patient
from datetime import datetime, timedelta, timezone
from app.utils.otp import generate_otp
from app.utils.email import send_otp_email


router = APIRouter(prefix="/auth", tags=["Auth"])

Base.metadata.create_all(bind=engine)

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already exists")

    otp = generate_otp()

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        otp=otp,
        otp_expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        is_verified=False
    )

    db.add(user)
    db.commit()

    send_otp_email(user.email, otp, "registration")

    return {"message": "OTP sent"}

@router.post("/complete-registration")
def complete_registration(
    data: CompleteRegistrationRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not user.is_verified:
        raise HTTPException(400, "OTP not verified")

    user.password = hash_password(data.password)

    p = data.patient
    patient = Patient(
        user_id=user.id,
        gender=p.gender,
        date_of_birth=p.date_of_birth,
        address=p.address,
        city=p.city,
        state=p.state,
        pincode=p.pincode,
        blood_group=p.blood_group,
        emergency_contact=p.emergency_contact,
        existing_conditions=p.existing_conditions
    )

    db.add(patient)
    db.commit()

    return {"message": "Registration complete"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your account")

    token = create_access_token(
        data={
            "sub": str(db_user.id)
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": db_user.id,
        "role": db_user.role

    }

@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or user.otp != data.otp:
        raise HTTPException(400, "Invalid OTP")

    if user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP expired")

    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None

    db.commit()

    return {"message": "OTP verified"}

@router.post("/reset-password-request")
def reset_password_request(request: ResetPasswordEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if user:
        otp = generate_otp()
        user.otp = otp
        user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        
        send_otp_email(user.email, otp, "reset")
        db.commit()

    # Always return success to prevent email enumeration
    return {"message": "If that email is registered, an OTP has been sent."}
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")

    user.password = hash_password(data.new_password)
    user.otp = None
    user.otp_expires_at = None

    db.commit()

    return {"message": "Password reset successful"}

