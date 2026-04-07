# ============================================
# Sifter Skill_Up — Pydantic Models
# Extended: offline sync, device sessions,
#           Starknet, feed, badges, challenges
# ============================================
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, date
from enum import Enum
import re


# ── Enums ─────────────────────────────────────────────────────

class TrackType(str, Enum):
    CRYPTO            = "crypto"
    QUANT_TRADER      = "quant-trading"
    QUANT_RESEARCHER  = "quant-research"
    QUANT_DEVELOPER   = "quant-developer"
    PYTHON            = "python"
    DEFI_NAVIGATOR    = "starknet-defi-navigator"
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


# ── Starknet ──────────────────────────────────────────────────

class StarknetAuthRequest(BaseModel):
    email:        str
    privy_token:  str = Field(..., min_length=10, max_length=4096,
                              description="Verified Privy access token; backend exchanges it for the wallet address.")

class StarknetRPCRequest(BaseModel):
    network:  Literal["sepolia", "mainnet"] = "sepolia"
    method:   str  = Field(..., max_length=64)
    params:   List[Any] = Field(default_factory=list, max_length=32)

    @field_validator("method")
    @classmethod
    def validate_method(cls, v: str) -> str:
        # Allowlist of safe Starknet RPC methods (read-only / standard)
        allowed = {
            "starknet_blockNumber", "starknet_blockHashAndNumber", "starknet_chainId",
            "starknet_getBlockWithTxHashes", "starknet_getBlockWithTxs",
            "starknet_getStateUpdate", "starknet_getStorageAt",
            "starknet_getTransactionByHash", "starknet_getTransactionByBlockIdAndIndex",
            "starknet_getTransactionReceipt", "starknet_getTransactionStatus",
            "starknet_getClass", "starknet_getClassHashAt", "starknet_getClassAt",
            "starknet_getBlockTransactionCount", "starknet_call",
            "starknet_estimateFee", "starknet_estimateMessageFee",
            "starknet_getNonce", "starknet_getEvents",
            "starknet_specVersion", "starknet_syncing",
        }
        if v not in allowed:
            raise ValueError(f"method '{v}' not in RPC allowlist")
        return v

class StarknetTransactionLog(BaseModel):
    hash:        str = Field(..., min_length=10, max_length=128)
    network:     Literal["sepolia", "mainnet"] = "sepolia"
    type:        str = Field(..., max_length=32)
    lessonId:    Optional[str] = Field(None, max_length=64)
    labId:       Optional[str] = Field(None, max_length=64)
    amount:      Optional[str] = Field(None, max_length=64)
    token:       Optional[str] = Field(None, max_length=32)


# ── Auth (signup/login) ───────────────────────────────────────

class SignupRequest(BaseModel):
    email:    str = Field(..., max_length=320)
    password: str = Field(..., min_length=8, max_length=128)
    username: Optional[str] = Field(None, max_length=64)

class LoginRequest(BaseModel):
    email:    str = Field(..., max_length=320)
    password: str = Field(..., min_length=1, max_length=128)

class TelegramAuthRequest(BaseModel):
    initData: str = Field(..., max_length=4096)

class BaseWalletAuthRequest(BaseModel):
    walletAddress: str = Field(..., min_length=10, max_length=128)
    signature:     str = Field(..., min_length=10, max_length=512)
    message:       str = Field(..., max_length=4096)

class PushTokenUpdate(BaseModel):
    token: str = Field(..., min_length=1, max_length=4096)
    push_token: Optional[str] = Field(None, max_length=4096)


# ── Game Extra ───────────────────────────────────────────────

class LastPositionUpdate(BaseModel):
    position: Dict[str, Any]

class NavigatorLabComplete(BaseModel):
    lab_number: int = Field(..., ge=1, le=11)

class ActiveFieldUpdate(BaseModel):
    field_id:    str = Field(..., max_length=64,
                             pattern=r"^[a-z0-9_-]+$")
    field_color: Optional[str] = Field(None, max_length=9,
                                       pattern=r"^#?[0-9a-fA-F]{3,8}$")


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

_SOCIAL_PLATFORMS = {
    "twitter", "linkedin", "github", "medium", "reddit",
    "instagram", "facebook", "behance", "dribbble", "youtube",
}

class SocialShare(BaseModel):
    platform:     str = Field(..., max_length=32)
    content_type: str = Field(..., max_length=32)
    content_id:   str = Field(..., max_length=128)
    url:          Optional[str] = Field(None, max_length=2048)

    @field_validator("platform")
    @classmethod
    def _validate_platform(cls, v: str) -> str:
        if v not in _SOCIAL_PLATFORMS:
            raise ValueError(f"unknown platform: {v}")
        return v


class SocialBlast(BaseModel):
    platforms:    List[str] = Field(..., min_length=1, max_length=10)
    content_type: str = Field(..., max_length=32)
    content_id:   str = Field(..., max_length=128)
    caption:      str = Field("", max_length=4096)

    @field_validator("platforms")
    @classmethod
    def _validate_platforms(cls, v: list[str]) -> list[str]:
        for p in v:
            if p not in _SOCIAL_PLATFORMS:
                raise ValueError(f"unknown platform: {p}")
        return v


class PortfolioAttribution(BaseModel):
    item_id:  str = Field(..., max_length=128)
    platform: str = Field(..., max_length=32)
    url:      str = Field(..., max_length=2048)


class ReferralApply(BaseModel):
    code: str = Field(..., min_length=4, max_length=64)


class MerchRedeemRequest(BaseModel):
    item_id:          str = Field(..., max_length=128)
    shipping_address: Optional[Dict[str, Any]] = None


class FeedItemSubscribe(BaseModel):
    tracks: List[str] = Field(default_factory=list, max_length=32)


class InterviewStartRequest(BaseModel):
    track_id: str = Field(..., max_length=64)
    level:    str = Field(..., max_length=32)


class InterviewAnswerRequest(BaseModel):
    interview_id:   str = Field(..., max_length=128)
    question_index: int = Field(..., ge=0, le=64)
    answer:         str = Field(..., max_length=10000)


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
