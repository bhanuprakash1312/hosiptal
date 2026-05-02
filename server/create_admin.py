from app.database import engine
from sqlalchemy import text
from app.core.security import hash_password

pwd = hash_password('Admin@123')
with engine.begin() as conn:
    conn.execute(
        text("INSERT INTO users (name, email, phone, password, role, is_verified) VALUES ('Super Admin', 'admin@hospital.com', '1234567890', :pwd, 'ADMIN', true) ON CONFLICT DO NOTHING"),
        {"pwd": pwd}
    )
    print("Admin created successfully")
