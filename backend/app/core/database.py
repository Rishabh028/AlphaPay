import logging
import ssl
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

# Normalize DATABASE_URL for Postgres drivers
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    # Test environment only — production MUST use PostgreSQL
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
    )
else:
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
    elif db_url.startswith("postgresql://") and "+psycopg" not in db_url and "+pg8000" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

    # Cloud PostgreSQL SSL normalization for pg8000 (Neon, Supabase, Render, Railway)
    if "+pg8000" in db_url:
        parsed = urlparse(db_url)
        params = parse_qs(parsed.query)
        if "sslmode" in params or "channel_binding" in params:
            ssl_ctx = ssl.create_default_context()
            connect_args["ssl_context"] = ssl_ctx
            params.pop("sslmode", None)
            params.pop("channel_binding", None)
            new_query = urlencode(params, doseq=True)
            db_url = urlunparse(parsed._replace(query=new_query))

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args,
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
