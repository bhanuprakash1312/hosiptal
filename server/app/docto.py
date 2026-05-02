from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.doctor import Doctor
from app.models.department import Department
from app.core.security import hash_password

def create_doctors():
    db: Session = SessionLocal()

    cardiology = db.query(Department).filter_by(name="Cardiology").first()
    ortho = db.query(Department).filter_by(name="Orthopedics").first()

    doctors = [
        {
            "name": "Bhanuprakash",
            "email": "bhanuprakash@hospital.com",
            "phone": "9000000001",
            "password": "Doctor@123",
            "department": cardiology
        },
        {
            "name": "Dr. Ananya",
            "email": "ananya@hospital.com",
            "phone": "9000000002",
            "password": "Doctor@123",
            "department": ortho
        }
    ]

    for d in doctors:
        if db.query(User).filter_by(email=d["email"]).first():
            continue

        user = User(
            name=d["name"],
            email=d["email"],
            phone=d["phone"],
            password=hash_password(d["password"]),
            role="DOCTOR",
            is_verified=True
        )
        db.add(user)
        db.flush()  # get user.id

        doctor = Doctor(
            id=user.id,
            department_id=d["department"].id
        )
        db.add(doctor)

        print(f"Created doctor {d['name']} in {d['department'].name}")

    db.commit()
    db.close()

if __name__ == "__main__":
    create_doctors()
