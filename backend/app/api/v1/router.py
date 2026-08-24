from fastapi import APIRouter
from app.api.v1.endpoints import transactions, analytics, rewards, health

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(transactions.router)
api_router.include_router(analytics.router)
api_router.include_router(rewards.router)
