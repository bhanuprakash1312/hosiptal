from app.database import SessionLocal, engine
from sqlalchemy import text
from app.core.security import hash_password

def fix():
    with engine.begin() as conn:
        # Get existing doctors
        docs = conn.execute(text("SELECT id, name, specialization, department_id FROM doctors")).fetchall()
        
        for doc in docs:
            old_id = doc.id
            name = doc.name
            
            # Generate email
            first_name = name.lower().replace("dr. ", "").split()[0]
            email = f"{first_name}@hospital.com"
            
            # Check if user already exists
            existing_user = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email}).fetchone()
            
            if existing_user:
                print(f"Skipping {name}, user already exists as {email}")
                continue
                
            # Create user
            pwd = hash_password("Doctor@123")
            res = conn.execute(text("""
                INSERT INTO users (name, email, phone, password, role, is_verified) 
                VALUES (:name, :email, '0000000000', :pwd, 'DOCTOR', true) 
                RETURNING id
            """), {"name": name, "email": email, "pwd": pwd})
            
            new_id = res.fetchone()[0]
            
            print(f"Created User for {name} with id {new_id} ({email})")
            
            # Since doctor is linked to appointments, we need to temporarily drop fk or just insert new doctor then update appointments
            # 1. Insert new doctor
            conn.execute(text("""
                INSERT INTO doctors (id, name, specialization, experience_years, consultation_fee, department_id)
                SELECT :new_id, name, specialization, experience_years, consultation_fee, department_id
                FROM doctors WHERE id = :old_id
            """), {"new_id": new_id, "old_id": old_id})
            
            # 2. Update appointments to point to new doc
            conn.execute(text("""
                UPDATE appointments SET doctor_id = :new_id WHERE doctor_id = :old_id
            """), {"new_id": new_id, "old_id": old_id})
            
            # 3. Delete old doctor
            conn.execute(text("DELETE FROM doctors WHERE id = :old_id"), {"old_id": old_id})
            
            print(f"Successfully migrated {name} to new ID {new_id}")

if __name__ == "__main__":
    fix()
