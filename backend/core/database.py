from supabase import create_client, Client
from core.config import get_settings

settings = get_settings()

supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key
)

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_anon_key
)

def get_db() -> Client:
    return supabase_admin