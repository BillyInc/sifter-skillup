# ============================================
# Sifter LevelUp — Database Layer
# ============================================
import json
import socket
import urllib.parse
import urllib.request

from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions
from config import settings


_dns_fallback_installed = False


def _install_debug_dns_fallback() -> None:
    """Resolve stale local Supabase DNS in development only."""
    global _dns_fallback_installed
    if _dns_fallback_installed or not settings.DEBUG or not settings.SUPABASE_URL:
        return
    hostname = urllib.parse.urlparse(settings.SUPABASE_URL).hostname
    if not hostname:
        return
    original_getaddrinfo = socket.getaddrinfo
    try:
        original_getaddrinfo(hostname, 443, type=socket.SOCK_STREAM)
        _dns_fallback_installed = True
        return
    except socket.gaierror:
        pass
    query = urllib.parse.urlencode({"name": hostname, "type": "A"})
    request = urllib.request.Request(
        f"https://cloudflare-dns.com/dns-query?{query}",
        headers={"Accept": "application/dns-json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            payload = json.load(response)
        addresses = [
            answer.get("data")
            for answer in payload.get("Answer", [])
            if answer.get("type") == 1 and answer.get("data")
        ]
    except Exception:
        return
    if not addresses:
        return

    def getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        if host == hostname and family in (socket.AF_UNSPEC, socket.AF_INET):
            selected_type = type or socket.SOCK_STREAM
            selected_proto = proto or socket.IPPROTO_TCP
            return [
                (socket.AF_INET, selected_type, selected_proto, "", (address, port))
                for address in addresses
            ]
        return original_getaddrinfo(host, port, family, type, proto, flags)

    socket.getaddrinfo = getaddrinfo
    _dns_fallback_installed = True

class Database:
    _anon_client: Client = None
    _service_client: Client = None

    def _options(self) -> SyncClientOptions:
        return SyncClientOptions(schema=settings.SUPABASE_SCHEMA)

    def get_client(self) -> Client:
        if not self._anon_client:
            _install_debug_dns_fallback()
            self._anon_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY,
                options=self._options(),
            )
        return self._anon_client

    def get_service_client(self) -> Client:
        """Service role client — bypasses RLS. Use only server-side."""
        if not self._service_client:
            _install_debug_dns_fallback()
            self._service_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY,
                options=self._options(),
            )
        return self._service_client

db = Database()
