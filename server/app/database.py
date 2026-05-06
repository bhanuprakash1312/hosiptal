from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.strip()
    # Render often provides 'postgres://' which SQLAlchemy 1.4+ doesn't like.
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    # Fallback to local SQLite if DATABASE_URL is completely missing
    DATABASE_URL = "sqlite:///./test.db"
    print("DEBUG: DATABASE_URL not found, using local SQLite.")
else:
    # Masking password for safe logging
    masked_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "unknown"
    print(f"DEBUG: Connecting to database at {masked_url}")

# Supabase Pooler (Transaction mode) often drops idle connections.
# pool_pre_ping=True will check if the connection is alive before using it.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    # SSL is required for Supabase connections (both .co and .com)
    connect_args={"sslmode": "require"} if "supabase" in DATABASE_URL.lower() else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()