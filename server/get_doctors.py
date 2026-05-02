from app.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    docs = conn.execute(text("SELECT name, email FROM users WHERE role='DOCTOR'")).fetchall()
    for d in docs:
        print(f"Name: {d.name}, Email: {d.email}")
