import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ECO-PULSE API"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./ecopulse.db"
    SECRET_KEY: str = "ecopulse-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    STATIC_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

    class Config:
        env_file = ".env"

settings = Settings()
