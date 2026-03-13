# ============================================
# Sifter Skill_Up — Database Layer
# ============================================
from supabase import create_client, Client
from config import settings

class Database:
    _anon_client: Client = None
    _service_client: Client = None

    def get_client(self) -> Client:
        if not self._anon_client:
            self._anon_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
        return self._anon_client

    def get_service_client(self) -> Client:
        """Service role client — bypasses RLS. Use only server-side."""
        if not self._service_client:
            self._service_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
        return self._service_client

db = Database()
