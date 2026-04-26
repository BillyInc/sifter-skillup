# ============================================
# Sifter Skill_Up — Pydantic Models
# Extended: offline sync, device sessions,
#           Starknet, feed, badges, challenges
# ============================================
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, date
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────

class TrackType(str, Enum):
    CRYPTO            = "crypto"
    QUANT_TRADER      = "quant-trading"
    QUANT_RESEARCHER  = "quant-research"
    QUANT_DEVELOPER   = "quant-developer"
    PYTHON            = "python"
    DEFI_NAVIGATOR    = "starknet-defi-navigator"
    STARKNET_ECOSYSTEM = "starknet-ecosystem-deep-dive"
    CAIRO_BUILDER     = "cairo-builder"
    SUPPLY_CHAIN      = "supply-chain"
    DEFI_RESEARCH     = "defi-research-analyst"

class QueuePriority(str, Enum):
    CRITICAL = "critical"   # progress, level completions
    HIGH     = "high"       # streaks, badges, portfolio pushes
    NORMAL   = "normal"     # analytics, feed events, social

class SyncStatus(str, Enum):
    PENDING   = "pending"
    APPLIED   = "applied"
    CONFLICT  = "conflict"
    REJECTED  = "rejected"


# ── Auth / User ────────────────────────────────────────────────

class UserUpdate(BaseModel):
    username:           Optional[str]            = None
    avatar_url:         Optional[str]            = None
    settings:           Optional[Dict[str, Any]] = None
    active_track:       Optional[str]            = None
    active_field_id:    Optional[str]            = None
    active_field_color: Optional[str]            = None
    current_track_id:   Optional[str]            = None
    current_track_name: Optional[str]            = None
    xp_stage:           Optional[int]            = None


# ── Level / Progress ──────────────────────────────────────────

class LevelComplete(BaseModel):
    level_id:      int
    track:         TrackType
    score:         int
    time_seconds:  Optional[int]       = None
    is_perfect:    bool                = False
    boosters_used: Dict[str, int]      = {}
    # for exact resume on re-entry
    lab_id:        Optional[str]       = None
    lesson_id:     Optional[str]       = None


class GameState(BaseModel):
    state: Dict[str, Any]


# ── Offline Sync ───────────────────────────────────────────────
# The client accumulates a local queue while offline.
# On reconnect it POSTs the whole queue to /api/sync/drain.
# Server applies in order, returns per-item results.

class OfflineQueueItem(BaseModel):
    id:           str                                    # client-generated UUID
    priority:     QueuePriority
    endpoint:     str                                    # e.g. "/api/game/complete-level"
    method:       Literal["POST", "PUT", "PATCH", "DELETE"]
    body:         Dict[str, Any]
    created_at:   str                                    # ISO timestamp (device local time)
    attempts:     int                                    = 0
    device_id:    str

class OfflineSyncRequest(BaseModel):
    device_id:    str
    items:        List[OfflineQueueItem]
    client_time:  str                                    # ISO — used for clock skew detection

class SyncItemResult(BaseModel):
    id:           str
    status:       SyncStatus
    response:     Optional[Any]    = None
    error:        Optional[str]    = None

class OfflineSyncResponse(BaseModel):
    results:      List[SyncItemResult]
    server_time:  str
    clock_skew_seconds: int        = 0                  # non-zero warns client


# ── Device Sessions ────────────────────────────────────────────

class DeviceRegister(BaseModel):
    device_id:       str           # stable hardware ID from expo-device
    device_name:     Optional[str] = None
    platform:        Optional[str] = None  # 'ios' | 'android'
    app_version:     Optional[str] = None
    push_token:      Optional[str] = None  # FCM token for logout notification


class PushTokenUpdate(BaseModel):
    push_token:      Optional[str] = None
    token:           Optional[str] = None


# ── Starknet ──────────────────────────────────────────────────

class StarknetAuthRequest(BaseModel):
    email:      str
    # Privy creates the wallet server-side — client just sends email
    privy_token: Optional[str] = None
    starknet_address: Optional[str] = None

class StarknetRPCRequest(BaseModel):
    network:  Literal["sepolia", "mainnet"] = "sepolia"
    method:   str
    params:   List[Any] = []


# ── Guilds ────────────────────────────────────────────────────

class GuildCreate(BaseModel):
    name:              str
    description:       Optional[str] = None
    icon:              Optional[str] = None
    is_private:        bool          = False
    requires_approval: bool          = True
    min_level:         int           = 1

class GuildChatSend(BaseModel):
    message: str


# ── Withdrawals ───────────────────────────────────────────────

class WithdrawalRequest(BaseModel):
    points_used: int
    method:      str   # 'crypto' | 'giftcard'
    destination: str   # wallet address or email


# ── Feedback / Reviews ────────────────────────────────────────

class FeedbackCreate(BaseModel):
    type:       str            # 'bug' | 'suggestion' | 'content'
    message:    str
    level_id:   Optional[int]  = None

class QuestClaim(BaseModel):
    quest_id: str


# ── Analytics ─────────────────────────────────────────────────

class AnalyticsEvent(BaseModel):
    event_type:  str
    event_data:  Dict[str, Any]
    session_id:  Optional[str] = None


# ── XP & Badges ──────────────────────────────────────────────

class XPEvent(BaseModel):
    event_type:   str           # 'level_complete' | 'boss_complete' | 'streak' | 'share' | 'portfolio_push'
    xp_amount:    int
    source_id:    Optional[str] = None    # level_id, badge_id, etc.
    metadata:     Dict[str, Any] = {}

class BadgeAward(BaseModel):
    badge_id:    str
    user_id:     str
    reason:      Optional[str] = None


# ── Feed ──────────────────────────────────────────────────────

class FeedSubscribe(BaseModel):
    track_ids:  List[str]
    field_ids:  List[str] = []

class FeedItemReact(BaseModel):
    item_id:    str
    reaction:   Literal["like", "bookmark", "share"]


# ── Challenges ────────────────────────────────────────────────

class ChallengeJoin(BaseModel):
    challenge_id: str

class ChallengeSubmit(BaseModel):
    challenge_id: str
    submission:   Dict[str, Any]   # free-form: code, document, score, etc.


# ── Social / Portfolio Attribution ───────────────────────────

class SocialShare(BaseModel):
    platform:     str             # 'twitter' | 'linkedin' | 'github' | etc.
    content_type: str             # 'level_complete' | 'badge' | 'portfolio'
    content_id:   str
    url:          Optional[str]   = None


# ── Airtable Sync (internal, used by Celery task) ─────────────

class AirtableSyncStatus(BaseModel):
    table:        str
    records_synced: int
    synced_at:    str
    error:        Optional[str] = None


# ── Response Envelope ─────────────────────────────────────────

class ResponseModel(BaseModel):
    success: bool          = True
    message: Optional[str] = None
    data:    Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool          = False
    error:   str
    details: Optional[Any] = None
