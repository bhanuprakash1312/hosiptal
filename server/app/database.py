from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Render often provides 'postgres://' which SQLAlchemy 1.4+ doesn't like.
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    # Fallback to local SQLite if DATABASE_URL is completely missing
    # this helps local development if .env is missing
    DATABASE_URL = "sqlite:///./test.db"
    print("WARNING: DATABASE_URL not found, falling back to local SQLite.")

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