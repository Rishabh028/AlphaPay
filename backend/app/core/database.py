import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

# Normalize DATABASE_URL for Postgres drivers
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
elif db_url.startswith("postgresql://") and "+psycopg" not in db_url and "+pg8000" not in db_url:
    # Use pg8000 or psycopg driver
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args=connect_args)
    else:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args=connect_args,
        )
except Exception as e:
    logger.warning(f"Could not initialize primary database engine: {e}. Falling back to SQLite.")
    engine = create_engine(
        "sqlite:///./fallback.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
