from pydantic_settings import BaseSettings
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "TimePipeline"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/timepipeline.db"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production-use-a-very-long-random-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    CORS_ORIGINS_JSON: str = (
        '["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]'
    )

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return json.loads(self.CORS_ORIGINS_JSON)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
