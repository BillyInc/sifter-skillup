# ============================================
# Sifter Skill_Up — Pydantic Models
# ============================================
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

class TrackType(str, Enum):
    CRYPTO = "crypto"
    QUANT_TRADER = "quant-trading"
    QUANT_RESEARCHER = "quant-research"
    QUANT_DEVELOPER = "quant-developer"
    PYTHON = "python"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class LevelComplete(BaseModel):
    level_id: int
    track: TrackType
    score: int
    time_seconds: Optional[int] = None
    is_perfect: bool = False
    boosters_used: Dict[str, int] = {}

class GameState(BaseModel):
    state: Dict[str, Any]

class GuildCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_private: bool = False
    requires_approval: bool = True
    min_level: int = 1

class GuildChatSend(BaseModel):
    message: str

class WithdrawalRequest(BaseModel):
    points_used: int
    method: str  # 'crypto' | 'giftcard'
    destination: str  # wallet address or gift card email

class QuestClaim(BaseModel):
    quest_id: str

class FeedbackCreate(BaseModel):
    type: str  # 'bug' | 'suggestion' | 'content'
    message: str
    level_id: Optional[int] = None

class AnalyticsEvent(BaseModel):
    event_type: str
    event_data: Dict[str, Any]
    session_id: Optional[str] = None

class ResponseModel(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[Any] = None
