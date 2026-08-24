from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.router import api_router

import logging

logger = logging.getLogger(__name__)

# Import all models to ensure metadata registration
import app.models.transaction
import app.models.reward
import app.models.redemption


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup if database is accessible
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"Database initialization at startup skipped: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Financial Transactions & Rewards Dashboard API for Digital Alpha Technology",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
