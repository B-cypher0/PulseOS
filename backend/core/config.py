from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    database_url: str = ""
    app_name: str = "PulseOS"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    claude_api_key: str = ""
    environment: str = "development"
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()