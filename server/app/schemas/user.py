from pydantic import BaseModel, EmailStr
from app.schemas.patient import PatientCreate
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str

class CompleteRegistrationRequest(BaseModel):
    email: EmailStr
    password: str
    patient: PatientCreate



class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True
class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordEmailRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
