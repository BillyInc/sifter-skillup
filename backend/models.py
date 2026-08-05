# ============================================
# Sifter LevelUp — Pydantic Models
# Extended: offline sync, device sessions,
#           Starknet, feed, badges, challenges
# ============================================
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict, Any, Literal
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
    # SECURITY: `account_type` is deliberately NOT part of this model.
    # It gates require_admin (auth.py), so it must never be client-settable
    # via PUT /api/users/me. It is managed server-side only — see the
    # institutions verify flow (routes/institutions_routes.py) and
    # provisioning (routes/provisioning_routes.py). Unknown fields in the
    # request body are ignored by Pydantic, and update_me additionally
    # strips privileged columns before writing (main.py).


class UserProfile(BaseModel):
    """Serialised user/profile shape returned to the client.

    `account_type` mirrors the frontend AccountType union and defaults to
    'student' so existing users (whose rows predate the column) are unaffected.
    """
    id:           str
    username:     Optional[str] = None
    avatar_url:   Optional[str] = None
    account_type: str           = "student"


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
    email:      Optional[str] = None
    # Privy creates the wallet server-side — client can send email,
    # but the backend can also recover it from Privy/Supabase.
    privy_token: Optional[str] = None
    starknet_address: Optional[str] = None

# Read-only Starknet JSON-RPC methods this proxy is allowed to forward.
# The endpoint is an unauthenticated-ish public relay, so we deliberately
# exclude write methods (starknet_add*Transaction) and anything not on the
# read spec — an unknown method is rejected at validation time (422).
ALLOWED_STARKNET_RPC_METHODS = frozenset({
    "starknet_call",
    "starknet_estimateFee",
    "starknet_estimateMessageFee",
    "starknet_blockNumber",
    "starknet_blockHashAndNumber",
    "starknet_chainId",
    "starknet_specVersion",
    "starknet_syncing",
    "starknet_getBlockWithTxHashes",
    "starknet_getBlockWithTxs",
    "starknet_getBlockWithReceipts",
    "starknet_getStateUpdate",
    "starknet_getStorageAt",
    "starknet_getNonce",
    "starknet_getTransactionByHash",
    "starknet_getTransactionByBlockIdAndIndex",
    "starknet_getTransactionReceipt",
    "starknet_getTransactionStatus",
    "starknet_getBlockTransactionCount",
    "starknet_getClass",
    "starknet_getClassHashAt",
    "starknet_getClassAt",
    "starknet_getEvents",
})


class StarknetRPCRequest(BaseModel):
    network:  Literal["sepolia", "mainnet"] = "sepolia"
    method:   str
    params:   List[Any] = []

    @field_validator("method")
    @classmethod
    def _method_must_be_allowlisted(cls, v: str) -> str:
        if v not in ALLOWED_STARKNET_RPC_METHODS:
            raise ValueError(f"RPC method '{v}' is not allowed")
        return v


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


# ── Career v2 (typed response payloads) ───────────────────────
# These mirror src/types/career.ts (camelCase field names) and the plain
# dicts the career read/user-owned routes build. Every field the DB might
# omit or return NULL is Optional with a default so validation never crashes;
# extra="ignore" drops any stray keys. Routing a payload through the matching
# model + `.model_dump()` yields JSON identical to today's hand-built dicts.

class _CareerBase(BaseModel):
    model_config = ConfigDict(extra="ignore")


class FoundationSkill(_CareerBase):
    skill:      Optional[str]   = None
    prevalence: Optional[float] = None
    n:          Optional[int]   = None
    uri:        Optional[str]   = None


class ToolOut(_CareerBase):
    tool:     Optional[str]  = None
    group:    Optional[str]  = None
    hot:      Optional[bool] = None
    inDemand: Optional[bool] = None
    roleFreq: Optional[int]  = None
    source:   Optional[str]  = None
    # Phase 9 enrichment fields
    demandScore:   Optional[float] = None
    demandSource:  Optional[Literal["adzuna", "stackoverflow", "github_innovation", "onet_hot"]] = None
    demandAsOf:    Optional[str] = None
    toolUrl:       Optional[str] = None


class ToolGroups(_CareerBase):
    distinctive: List[ToolOut] = []
    common:      List[ToolOut] = []


class CertificationOut(_CareerBase):
    name:       Optional[str] = None
    body:       Optional[str] = None
    region:     Optional[str] = None
    level:      Optional[str] = None
    gateReason: Optional[str] = None
    # Phase 9 enrichment fields
    officialUrl:     Optional[str] = None
    seniorityTier:   Optional[int] = None
    tierType:        Optional[Literal["ladder", "stages"]] = None
    price:           Optional[float] = None
    currency:        Optional[Literal["USD", "NGN", "GBP", "EUR"]] = None
    priceAsOf:       Optional[str] = None
    priceSource:     Optional[str] = None


class SubgroupOut(_CareerBase):
    id:             Optional[str]          = None
    iscoSubmajor:   Optional[str]          = None
    name:           Optional[str]          = None
    description:    Optional[str]          = None
    roleCount:      Optional[int]          = None
    clusterSkills:  List[str]              = []
    tools:          ToolGroups             = Field(default_factory=ToolGroups)
    certifications: List[CertificationOut] = []


class DomainRoleSummary(_CareerBase):
    key:         Optional[str] = None
    name:        Optional[str] = None
    tier:        Optional[str] = None
    alsoKnownAs: List[str]     = []
    subgroupId:  Optional[str] = None
    eliteStatus: Optional[str] = None


class DomainDetail(_CareerBase):
    id:                     Optional[str]            = None
    name:                   Optional[str]            = None
    cluster:                Optional[str]            = None
    clusters:               List[str]                = []
    description:            Optional[str]            = None
    institutionType:        List[str]                = []
    eliteDomain:            bool                     = False
    foundationSkills:       List[FoundationSkill]    = []
    roleCount:              Optional[int]            = None
    tools:                  ToolGroups               = Field(default_factory=ToolGroups)
    gatewayCertifications:  List[CertificationOut]   = []
    roleHintCertifications: List[CertificationOut]   = []
    subgroups:              List[SubgroupOut]        = []
    roles:                  List[DomainRoleSummary]  = []


class RoleAppearance(_CareerBase):
    domainId:   Optional[str] = None
    domainName: Optional[str] = None
    roleKey:    Optional[str] = None


class RoleDetail(_CareerBase):
    key:            Optional[str]        = None
    name:           Optional[str]        = None
    tier:           Optional[str]        = None
    alsoKnownAs:    List[str]            = []
    iscoGroup:      Optional[str]        = None
    escoCode:       Optional[str]        = None
    eliteStatus:    Optional[str]        = None
    essentialSkills: List[str]           = []
    optionalSkills: List[str]            = []
    appearsIn:      List[RoleAppearance]  = []
    demandMetrics:  Optional[Dict[str, Any]] = None
    # Phase 9 enrichment fields
    currencyStatus:      Optional[Literal["current", "legacy", "emerging"]] = None
    currencyVerifiedAt:  Optional[str] = None
    currencySource:      Optional[Literal["wef_foj_2025", "onet_emerging", "lightcast", "curated"]] = None


class DomainLinkOut(_CareerBase):
    domainId:      Optional[str]         = None
    domainName:    Optional[str]         = None
    matchType:     Optional[str]         = None
    eliteFlag:     bool                  = False
    demandInsight: Optional[Dict[str, Any]] = None


class ProgrammeDetail(_CareerBase):
    id:              Optional[str]         = None
    name:            Optional[str]         = None
    displayName:     Optional[str]         = None
    institutionType: Optional[str]         = None
    discipline:      Optional[str]         = None
    qualification:   Optional[str]         = None
    durationYears:   Optional[float]       = None
    domains:         List[DomainLinkOut]   = []


# ── Search (grouped disambiguation) ──
class SearchDomain(_CareerBase):
    id:      Optional[str] = None
    name:    Optional[str] = None
    cluster: Optional[str] = None


class SearchRoleDomain(_CareerBase):
    domainId:   Optional[str] = None
    domainName: Optional[str] = None
    roleKey:    Optional[str] = None


class SearchRole(_CareerBase):
    name:    Optional[str]              = None
    tier:    Optional[str]              = None
    domains: List[SearchRoleDomain]     = []


class SearchProgramme(_CareerBase):
    id:              Optional[str] = None
    name:            Optional[str] = None
    institutionType: Optional[str] = None
    discipline:      Optional[str] = None


class CareerSearchResult(_CareerBase):
    domains:    List[SearchDomain]    = []
    roles:      List[SearchRole]      = []
    programmes: List[SearchProgramme] = []


# ── JAMB name → domains ──
class JambDomainLink(_CareerBase):
    domainId:   Optional[str] = None
    domainName: Optional[str] = None
    cluster:    Optional[str] = None
    matchType:  Optional[str] = None
    eliteFlag:  bool          = False


class JambDomainResult(_CareerBase):
    jambName: Optional[str]        = None
    domains:  List[JambDomainLink] = []


# ── Career-changer pivot ──
class PivotFrom(_CareerBase):
    id:   Optional[str] = None
    name: Optional[str] = None


class PivotMove(_CareerBase):
    domainId:     Optional[str]  = None
    domainName:   Optional[str]  = None
    cluster:      Optional[str]  = None
    eliteFlag:    bool           = False
    overlapScore: Optional[float] = None
    sharedSkills: List[str]      = []


class PivotResult(_CareerBase):
    fromDomain: PivotFrom       = Field(default_factory=PivotFrom)
    moves:      List[PivotMove] = []


# ── User-owned (saved / notes / subscriptions) ──
class SavedItemOut(_CareerBase):
    id:         Optional[str] = None
    entityType: Optional[str] = None
    entityId:   Optional[str] = None
    label:      Optional[str] = None
    createdAt:  Optional[str] = None


class NoteOut(_CareerBase):
    id:          Optional[str] = None
    entityType:  Optional[str] = None
    entityId:    Optional[str] = None
    body:        Optional[str] = None
    category:    Optional[str] = None
    entityLabel: Optional[str] = None
    createdAt:   Optional[str] = None
    updatedAt:   Optional[str] = None


class SubscriptionOut(_CareerBase):
    id:        Optional[str] = None
    target:    Optional[str] = None
    targetId:  Optional[str] = None
    createdAt: Optional[str] = None


# ── Response Envelope ─────────────────────────────────────────

# ── Admission Intelligence (Phase 8) ────────────────────────

class JambFloorOut(BaseModel):
    year: int
    floorScore: int
    contextNote: Optional[str] = None
    sourceUrl: Optional[str] = None
    dataDate: str


class ProgrammeSchoolCutoffOut(BaseModel):
    id: str
    schoolId: str
    schoolName: str
    programmeId: str
    programmeName: str
    year: int
    aggregateCutoff: Optional[int] = None
    jambCutoff: Optional[int] = None
    form: str  # UTME | DE
    sourceUrl: str
    verifiedAt: Optional[str] = None
    dataDate: str


class SchoolAggregateFormulaOut(BaseModel):
    id: str
    schoolId: str
    schoolName: str
    year: int
    jambWeight: float
    olevelWeight: float
    description: Optional[str] = None
    sourceUrl: Optional[str] = None
    dataDate: str


class CourseCompetitivenessOut(BaseModel):
    id: str
    broadCourse: str
    year: int
    applied: Optional[int] = None
    admitted: Optional[int] = None
    ratio: Optional[float] = None
    source: Optional[str] = None
    note: Optional[str] = None
    dataDate: str


class AdmissionSnapshotVersionOut(BaseModel):
    id: str
    label: str
    year: int
    compiledAt: str
    compiler: Optional[str] = None
    notes: Optional[str] = None
    isActive: bool


class AdmissionInsightOut(BaseModel):
    hasCutoffData: bool
    year: int
    label: str
    programmeCount: int


# ── Enrichment (Phase 9) ─────────────────────────────────────

class CertificationEnrichment(BaseModel):
    officialUrl: Optional[str] = None
    seniorityTier: Optional[int] = None
    tierType: Optional[Literal["ladder", "stages"]] = None
    price: Optional[float] = None
    currency: Optional[Literal["USD", "NGN", "GBP", "EUR"]] = None
    priceAsOf: Optional[str] = None
    priceSource: Optional[str] = None


class SkillUriMap(BaseModel):
    """Parallel URI map for skills (keyed by skill name)."""
    uris: Dict[str, str] = {}


class ToolDemandEnrichment(BaseModel):
    demandScore: Optional[float] = None
    demandSource: Optional[Literal["adzuna", "stackoverflow", "github_innovation", "onet_hot"]] = None
    demandAsOf: Optional[str] = None
    toolUrl: Optional[str] = None


class RoleCurrencyStatus(BaseModel):
    currencyStatus: Literal["current", "legacy", "emerging"] = "current"
    currencyVerifiedAt: Optional[str] = None
    currencySource: Optional[Literal["wef_foj_2025", "onet_emerging", "lightcast", "curated"]] = None


# ── Enrichment Version (tracks seed runs) ────────────────────

class EnrichmentVersionOut(BaseModel):
    id: str
    appliedAt: str
    sourceCommitHash: Optional[str] = None
    seedName: str
    rowsUpserted: int


class ResponseModel(BaseModel):
    success: bool          = True
    message: Optional[str] = None
    data:    Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool          = False
    error:   str
    details: Optional[Any] = None
