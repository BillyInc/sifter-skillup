"""
roster_extract — the swappable "document → best-effort rows" seam.

The assisted importer accepts photos/PDFs of attendance sheets, result sheets,
or class lists and returns best-effort structured rows to PRE-FILL the review
grid. It is deliberately a thin, replaceable interface:

    extract_rows(images: list[ImageInput]) -> list[ExtractedRow]

v1 backs it with an Anthropic vision call (raw httpx, matching the pattern in
routes/community_routes.py — no SDK dependency). If ANTHROPIC_API_KEY is unset
or the call fails, it degrades to an empty list so the educator simply gets a
blank grid to fill manually. The funnel and storage never change when this
implementation is swapped.

PRIVACY: uploaded documents are processed transiently and NEVER stored. Any
subjects/grades read here ride back in the response for in-memory mapping only
and are never written to the database. See migration_provisioning.sql.
"""
from typing import List, Optional

import httpx
from pydantic import BaseModel, Field

from config import settings
from logger import log

# Fast, capable multimodal model. The educator corrects every field afterward,
# so this only needs to give a good first pass on messy, handwritten sheets.
_VISION_MODEL = "claude-opus-4-8"
_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
_MAX_IMAGES = 15


class ImageInput(BaseModel):
    """One uploaded page: base64 data + its media type (image/* or application/pdf)."""
    media_type: str
    data: str  # base64, no newlines


class ExtractedRow(BaseModel):
    """A best-effort student row for the review grid. Every field is uncertain
    until the educator confirms it — `needs_review` starts True."""
    full_name: Optional[str] = None
    student_class: Optional[str] = None
    # Transient only — used to seed the mapping at generate time, never stored.
    subjects: List[str] = Field(default_factory=list)
    needs_review: bool = True


_SYSTEM = (
    "You extract a student roster from a photographed or scanned Nigerian school "
    "document (attendance sheet, result sheet, or class list). Return ONLY a JSON "
    "array, no prose. Each element: "
    '{"full_name": string|null, "student_class": string|null, "subjects": string[]}. '
    "full_name is the student's name as written. student_class is the class/level "
    "(e.g. 'SS2', 'JSS3') if present, else null. subjects is any list of subjects "
    "visible for that student (from a result sheet), else []. If a field is unclear, "
    "use null / [] rather than guessing. Do not invent students. Return [] if you "
    "cannot read any student rows."
)


async def extract_rows(images: List[ImageInput]) -> List[ExtractedRow]:
    """Best-effort pre-fill. Never raises — returns [] on any failure so the
    review grid falls back to manual entry."""
    if not images:
        return []
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key:
        log.info("roster_extract: ANTHROPIC_API_KEY unset — manual entry fallback")
        return []

    content: list = []
    for img in images[:_MAX_IMAGES]:
        source_type = "document" if img.media_type == "application/pdf" else "image"
        content.append({
            "type": source_type,
            "source": {"type": "base64", "media_type": img.media_type, "data": img.data},
        })
    content.append({
        "type": "text",
        "text": "Extract the student roster from these pages as the specified JSON array.",
    })

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                _ANTHROPIC_URL,
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": _VISION_MODEL,
                    "max_tokens": 8000,
                    "system": _SYSTEM,
                    "messages": [{"role": "user", "content": content}],
                },
            )
        if resp.status_code != 200:
            log.warning("roster_extract: vision call non-200", status=resp.status_code)
            return []
        body = resp.json()
        text = "".join(
            b.get("text", "") for b in body.get("content", []) if b.get("type") == "text"
        ).strip()
        return _parse_rows(text)
    except Exception as exc:  # noqa: BLE001
        log.warning("roster_extract: vision call failed", error=str(exc))
        return []


def _parse_rows(text: str) -> List[ExtractedRow]:
    """Parse the model's JSON array defensively; tolerate code fences / stray prose."""
    import json

    if not text:
        return []
    # Strip a ```json ... ``` fence if present.
    if text.startswith("```"):
        text = text.split("```", 2)[1] if text.count("```") >= 2 else text
        if text.lstrip().startswith("json"):
            text = text.lstrip()[4:]
    # Fall back to the outermost [...] if there's leading/trailing noise.
    if not text.lstrip().startswith("["):
        start, end = text.find("["), text.rfind("]")
        if start == -1 or end == -1 or end < start:
            return []
        text = text[start:end + 1]
    try:
        raw = json.loads(text)
    except (ValueError, TypeError):
        return []
    if not isinstance(raw, list):
        return []

    rows: List[ExtractedRow] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        name = item.get("full_name")
        cls = item.get("student_class")
        subjects = item.get("subjects") or []
        if not isinstance(subjects, list):
            subjects = []
        rows.append(ExtractedRow(
            full_name=(name.strip() if isinstance(name, str) and name.strip() else None),
            student_class=(cls.strip() if isinstance(cls, str) and cls.strip() else None),
            subjects=[str(s).strip() for s in subjects if str(s).strip()][:20],
            needs_review=True,
        ))
    return rows
