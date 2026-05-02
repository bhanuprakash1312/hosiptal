from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database import SessionLocal , get_db
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # print("====== JWT DEBUG START ======")
    # print("RAW TOKEN:", token)
    # print("SECRET_KEY:", SECRET_KEY)
    # print("ALGORITHM:", ALGORITHM)

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="try block error")
    except JWTError:
        raise HTTPException(status_code=401, detail="except block error")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
def get_current_doctor(current_user: User = Depends(get_current_user)):
    if current_user.role.upper() != "DOCTOR":
        raise HTTPException(status_code=403, detail="Not authorized as doctor")
    return current_user