"""Configuración centralizada (12-factor): todo viene de variables de entorno / .env."""
from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_DEFAULT_KEY = "change-me-in-production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "TechNews API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: Literal["development", "testing", "production"] = "development"
    DEBUG: bool = False

    # Base de datos
    DATABASE_URL: str = "sqlite:///./technews.db"

    # Seguridad / JWT
    SECRET_KEY: str = _INSECURE_DEFAULT_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Subida de archivos
    UPLOAD_DIR: str = "uploads"
    MEDIA_URL: str = "/media"
    MAX_UPLOAD_SIZE_MB: int = 5

    # Datos iniciales (script app.initial_data)
    FIRST_ADMIN_EMAIL: str = "admin@example.com"
    FIRST_ADMIN_USERNAME: str = "admin"
    FIRST_ADMIN_PASSWORD: str = "Admin12345"

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @model_validator(mode="after")
    def _check_production_secret(self) -> "Settings":
        if self.ENVIRONMENT == "production" and (
            self.SECRET_KEY == _INSECURE_DEFAULT_KEY or len(self.SECRET_KEY) < 32
        ):
            raise ValueError("En producción SECRET_KEY debe definirse y tener al menos 32 caracteres")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
