from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "InformaTech"
    app_version: str = "0.1.0"
    debug: bool = True
    database_url: str = "sqlite:///./informatech.db"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    rate_limit_login: str = "10/minute"
    rate_limit_register: str = "3/minute"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env"}


settings = Settings()
