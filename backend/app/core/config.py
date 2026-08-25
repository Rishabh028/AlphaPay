from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AlphaPay Transactions & Rewards API"
    API_V1_STR: str = "/api/v1"
    
    # Database URL defaults to local postgres or can be overridden via env variable
    DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/dat_db"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "*"
    ]
    
    # Reward Coin Rules
    REWARD_COIN_SPEND_UNIT: float = 100.0  # 1 coin per 100 INR spent
    REWARD_COIN_MAX_PER_TXN: int = 100     # Cap per transaction
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=(".env", "backend/.env"),
        extra="allow"
    )


settings = Settings()
