#!/usr/bin/env python3
"""End-to-end check for the provisioning -> guidance -> report -> claim flow.

Exercises the live API in the order described in CLAUDE.md:

    school owner -> school code -> student provisioning -> SS1 guidance
      -> subject matching -> report -> claim code

Every step records its own result, and the whole run is written to a JSON
report so the outcome can be reviewed without re-reading the console.

This talks to whatever database the backend is configured against. It creates
real rows, so each run labels its data with a unique tag and deletes what it
created at the end. Use --no-cleanup to keep the rows for inspection.

Requirements on the backend being tested:
  * DEBUG=true          - enables the 000000 signup code and LEVELUP-EDU-DEV
  * reachable over HTTP from wherever this script runs

Usage:
    python scripts/e2e_live_test.py
    python scripts/e2e_live_test.py --base-url http://localhost:8000
    python scripts/e2e_live_test.py --no-cleanup --report e2e.json
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import traceback
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

TERMS_VERSION = "2026-08-14"
PRIVACY_VERSION = "2026-08-14"
DEV_EMAIL_CODE = "000000"
DEV_EDUCATOR_CODE = "LEVELUP-EDU-DEV"

# Computer Science UTME requires exactly Physics, Chemistry and Mathematics.
# The negative case drops Chemistry, so a correct matcher must not return it.
# UTME is exactly four subjects and the matcher rejects any set without Use of
# English (programmes_by_subjects in student_pipeline_routes.py). Sending three
# subjects returned an empty list with a notice, which the old assertion could
# not distinguish from "the matcher is broken".
UTME_SUBJECTS = ["English Language", "Physics", "Chemistry", "Mathematics"]
UTME_SUBJECTS_NEGATIVE = ["English Language", "Physics", "Mathematics", "Economics"]
# Chemistry-gated: present for UTME_SUBJECTS, absent for UTME_SUBJECTS_NEGATIVE.
# Computer Science was the old probe, but it matches neither set, so the
# negative assertion passed without testing anything.
CHEMISTRY_GATED_PROGRAMME = "chemical engineering"


def _match_items(payload: Any) -> tuple[list, Optional[str]]:
    """Unwrap the double envelope the pipeline routes return.

    ResponseModel.data is the _real() envelope {"status", "data", "meta"}, and
    the item list is the bare list at data.data. Reading only the outer layer
    yields the envelope dict, whose .get("items") is always None — which
    silently turned every match into zero matches.
    """
    envelope = (payload or {}).get("data") or {}
    if not isinstance(envelope, dict):
        return (envelope if isinstance(envelope, list) else []), None
    inner = envelope.get("data")
    items = inner if isinstance(inner, list) else []
    notice = (envelope.get("meta") or {}).get("notice")
    return items, notice


def _programme_name(m: Any) -> str:
    if not isinstance(m, dict):
        return ""
    return m.get("jambName") or m.get("jamb_name") or m.get("name") or ""


class Runner:
    def __init__(self, base_url: str, timeout: int) -> None:
        self.base = base_url.rstrip("/")
        self.timeout = timeout
        self.steps: list[dict[str, Any]] = []
        self.run_id = uuid.uuid4().hex[:8]
        # Held on the Runner rather than only in main's locals so cleanup can
        # reach it from any exit path, including the early failure returns and
        # the crash handler. Deliberately not part of the JSON report.
        self.owner_token: Optional[str] = None
        # Real user ids handed back by /api/auth/signup, keyed by the same label
        # signup() was called with. The roster identifies students by user_id,
        # not by any name we chose, so this is the only reliable join key.
        self.user_ids: dict[str, Optional[str]] = {}

    # ---------------------------------------------------------------- http
    def call(
        self,
        method: str,
        path: str,
        body: Optional[dict] = None,
        token: Optional[str] = None,
        params: Optional[dict] = None,
        raw: bool = False,
    ) -> tuple[int, Any]:
        url = f"{self.base}{path}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Content-Type", "application/json")
        req.add_header("X-Device-Id", f"e2e-{self.run_id}")
        if token:
            req.add_header("Authorization", f"Bearer {token}")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                payload = resp.read()
                if raw:
                    return resp.status, payload.decode("utf-8", "replace")
                return resp.status, json.loads(payload or b"null")
        except urllib.error.HTTPError as exc:
            payload = exc.read().decode("utf-8", "replace")
            try:
                return exc.code, json.loads(payload)
            except json.JSONDecodeError:
                return exc.code, {"raw": payload[:800]}
        except Exception as exc:  # noqa: BLE001 - network/connection failures
            return 0, {"error": f"{type(exc).__name__}: {exc}"}

    # --------------------------------------------------------------- steps
    def record(self, name: str, ok: bool, detail: Any = None) -> bool:
        self.steps.append(
            {
                "step": name,
                "ok": bool(ok),
                "detail": detail,
                "at": datetime.now(timezone.utc).isoformat(),
            }
        )
        marker = "PASS" if ok else "FAIL"
        print(f"[{marker}] {name}")
        if not ok:
            print(f"        {json.dumps(detail, default=str)[:700]}")
        return bool(ok)

    def signup(self, label: str, email: str, password: str) -> Optional[str]:
        status, payload = self.call(
            "POST", "/api/auth/email-code/request", {"email": email}
        )
        if status != 200:
            self.record(f"{label}: request email code", False, payload)
            return None
        self.record(f"{label}: request email code", True, {"status": status})

        status, payload = self.call(
            "POST",
            "/api/auth/signup",
            {
                "email": email,
                "password": password,
                "email_code": DEV_EMAIL_CODE,
                "first_name": "E2E",
                "last_name": label.title(),
                "terms_version": TERMS_VERSION,
                "privacy_version": PRIVACY_VERSION,
                "analytics_consent": False,
            },
        )
        token = ((payload or {}).get("data") or {}).get("token") if status == 200 else None
        # /api/auth/signup returns {"token": ..., "user": {...}} single-wrapped
        # (main.py:629/649/659). The roster keys students by this id.
        self.user_ids[label] = (((payload or {}).get("data") or {}).get("user") or {}).get("id")
        if not self.record(
            f"{label}: signup",
            bool(token),
            {"status": status} if token else payload,
        ):
            return None
        return token


_LIVE: dict[str, Any] = {}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://localhost:8000")
    ap.add_argument("--timeout", type=int, default=60)
    ap.add_argument("--report", default="e2e_report.json")
    ap.add_argument("--no-cleanup", action="store_true")
    args = ap.parse_args()

    r = Runner(args.base_url, args.timeout)
    tag = r.run_id
    owner_email = f"e2e.owner.{tag}@example.invalid"
    student_email = f"e2e.student.{tag}@example.invalid"
    password = f"E2e-{tag}-pw"
    created: dict[str, Any] = {}
    # Published so the crash handler below can still run cleanup: an exception
    # escaping main() would otherwise skip _finish entirely and leave rows in
    # the database for the next run to trip over.
    _LIVE.update(runner=r, args=args, created=created)

    print(f"Sifter LevelUp E2E  run={tag}  target={r.base}\n")

    # 0. reachability -----------------------------------------------------
    status, payload = r.call("GET", "/health")
    if not r.record("API reachable", status == 200, {"status": status}):
        print("\nBackend not reachable - is it running and is --base-url right?")
        return _finish(r, args, created, 1)

    # 1. school owner -----------------------------------------------------
    owner_token = r.signup("owner", owner_email, password)
    if not owner_token:
        return _finish(r, args, created, 1)
    r.owner_token = owner_token

    status, payload = r.call(
        "POST",
        "/api/institutions/access-code/validate",
        {"code": DEV_EDUCATOR_CODE, "organization_type": "secondary_school"},
        token=owner_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    if not r.record("owner: validate educator access code", ok, payload):
        return _finish(r, args, created, 1)

    school_name = f"E2E Test Secondary School {tag}"
    status, payload = r.call(
        "POST",
        "/api/institutions/verify",
        {
            "account_type": "institution_admin",
            "organization_type": "secondary_school",
            "organization_name": school_name,
            "role": "Principal",
            "access_code": DEV_EDUCATOR_CODE,
            # Required: admin access is refused for a claim with no address,
            # including under the developer access code (institutions_routes
            # `_find_or_create_school`).
            "address": "12 Adeola Odeku Street, Victoria Island",
            "city": "Lagos",
            "state": "Lagos",
            "country": "Nigeria",
        },
        token=owner_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    created["school_name"] = school_name
    if not r.record("owner: create/link institution", ok, payload):
        return _finish(r, args, created, 1)

    status, payload = r.call("GET", "/api/institutions/me", token=owner_token)
    school_id = ((payload or {}).get("data") or {}).get("id")
    created["school_id"] = school_id
    r.record("owner: institution resolves", status == 200, {"schoolId": school_id})

    # 2. provisioning -----------------------------------------------------
    student_name = f"E2E Student {tag}"
    status, payload = r.call(
        "POST",
        "/api/provisioning/drafts",
        {
            "manual_rows": [
                {
                    "full_name": student_name,
                    "student_class": "SS1",
                    "stream": "science",
                    "guardian_consent": True,
                    "guardian_name": "E2E Guardian",
                }
            ],
            "stream": "science",
        },
        token=owner_token,
    )
    rows = ((payload or {}).get("data") or {})
    draft_id = None
    if isinstance(rows, dict):
        candidates = rows.get("rows") or rows.get("drafts") or []
        if candidates:
            draft_id = candidates[0].get("id")
    if not draft_id and isinstance(rows, list) and rows:
        draft_id = rows[0].get("id")
    created["draft_id"] = draft_id
    if not r.record("owner: stage student draft", bool(draft_id), payload if not draft_id else {"draftId": draft_id}):
        return _finish(r, args, created, 1)

    status, payload = r.call(
        "POST",
        "/api/provisioning/generate",
        # student_type is the Student *stage*, not the school kind: the route
        # accepts only ss1/ss2/ss3/jamb, and a secondary school may not use
        # jamb (provisioning_routes `_validate_provisioning_type`). /generate
        # does not fall back to the draft's student_class, so it must be sent.
        {"items": [{"draft_id": draft_id, "student_type": "ss1", "stream": "science"}]},
        token=owner_token,
    )
    # /provisioning/generate returns `data` as a bare list of GeneratedStudent
    # dicts (snake_case), not an object with a "generated" key.
    gen = (payload or {}).get("data") or []
    generated = gen if isinstance(gen, list) else (gen.get("generated") or gen.get("students") or [])
    claim_code = None
    provisioned_id = None
    if generated:
        claim_code = generated[0].get("claimCode") or generated[0].get("claim_code")
        provisioned_id = generated[0].get("userId") or generated[0].get("user_id") or generated[0].get("id")
    created["provisioned_user_id"] = provisioned_id
    if not r.record(
        "owner: generate account + claim code",
        bool(claim_code),
        payload if not claim_code else {"userId": provisioned_id, "claimCodePresent": True},
    ):
        return _finish(r, args, created, 1)

    # 3. student claims ---------------------------------------------------
    student_token = r.signup("student", student_email, password)
    if not student_token:
        return _finish(r, args, created, 1)

    status, payload = r.call(
        "POST",
        "/api/provisioning/students/claim",
        {"code": claim_code, "email": student_email},
        token=student_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    if not r.record("student: redeem claim code", ok, payload):
        return _finish(r, args, created, 1)
    # The claim response carries the authoritative school_id (taken from the
    # claim_codes row), which is what the consent grant below must reference.
    claim_school_id = ((payload or {}).get("data") or {}).get("school_id") or school_id

    # 3b. student consents to individual visibility ------------------------
    # The roster deliberately emits only students who are either
    # provisioned+unclaimed or hold an active progress/full consent
    # (provisioning_routes.py:911-922). Claiming flips the student out of the
    # first category — this account is a self-signed-up student merged onto the
    # provisioned shell, so it was never in it — which leaves consent as the
    # only path to individual visibility. A "contact" scope is deliberately not
    # enough: the roster carries progress fields.
    status, payload = r.call(
        "POST",
        "/api/provisioning/students/consent",
        {"school_id": claim_school_id, "scope": "progress"},
        token=student_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    if not r.record("student: grant progress consent", ok, payload):
        return _finish(r, args, created, 1)

    # 4. SS1 guidance -----------------------------------------------------
    status, payload = r.call(
        "POST",
        "/api/student/starting-point",
        {
            # user_type is CHECK-constrained to the UserType union in
            # src/types/onboarding.ts; an SS1 explorer is "senior_secondary".
            # "ss_secondary" was never a member of either union.
            "userType": "senior_secondary",
            # student_starting_points.ss_door is CHECK-constrained to
            # ('know_where','know_what','unsure') — the same union the app types
            # in src/types/onboarding.ts. "ss" was never a valid door.
            "ssDoor": "unsure",
            # Lowercase: student_starting_points.ss_class carries a CHECK
            # constraint for ('ss1','ss2','ss3'), and the app types it the same
            # way (src/types/onboarding.ts). "SS1" is rejected by the database.
            "ssClass": "ss1",
            "stream": "science",
            "exploreIntent": ["careers"],
            "jambSubjects": UTME_SUBJECTS,
            "olevelSubjects": UTME_SUBJECTS,
        },
        token=student_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    r.record("student: save SS1 starting point", ok, payload if not ok else {"status": status})

    status, payload = r.call("GET", "/api/student/starting-point", token=student_token)
    # The route wraps its payload twice: ResponseModel.data is
    # {"status": "real"|"coming_soon", "data": <profile|None>, ...}. Reading
    # only the outer layer made this step pass unconditionally, because the
    # envelope is a non-empty dict even when nothing was saved. Assert on the
    # echoed value instead.
    envelope = ((payload or {}).get("data") or {})
    persisted = envelope.get("data") or {}
    r.record(
        "student: starting point persists",
        status == 200 and persisted.get("ssClass") == "ss1",
        {
            "envelopeStatus": envelope.get("status"),
            "userType": persisted.get("userType"),
            "ssClass": persisted.get("ssClass"),
        },
    )

    # 5. subject matching -------------------------------------------------
    status, payload = r.call(
        "GET",
        "/api/student/programmes/by-subjects",
        params={"subjects": ",".join(UTME_SUBJECTS), "exam_type": "utme"},
    )
    items, notice = _match_items(payload)
    names = [_programme_name(m) for m in items]
    gated_present = any(CHEMISTRY_GATED_PROGRAMME in n.lower() for n in names)
    r.record(
        "matcher: UTME with Chemistry returns Chemistry-gated matches",
        len(items) > 0 and gated_present,
        {
            "count": len(items),
            "sample": names[:8],
            "gatedProgrammePresent": gated_present,
            "notice": notice,
        },
    )

    status, payload = r.call(
        "GET",
        "/api/student/programmes/by-subjects",
        params={"subjects": ",".join(UTME_SUBJECTS_NEGATIVE), "exam_type": "utme"},
    )
    neg_items, neg_notice = _match_items(payload)
    neg_names = [_programme_name(m) for m in neg_items]
    gated_in_negative = any(CHEMISTRY_GATED_PROGRAMME in n.lower() for n in neg_names)
    # Both halves matter: the swap must still return programmes (so a blanket
    # failure cannot pass this step) and must drop the Chemistry-gated one.
    r.record(
        "matcher: dropping Chemistry excludes Chemistry-gated programmes",
        len(neg_items) > 0 and not gated_in_negative,
        {
            "count": len(neg_items),
            "gatedProgrammePresent": gated_in_negative,
            "notice": neg_notice,
        },
    )

    # 6. guidance path + report ------------------------------------------
    # report.html raises a deliberate 409 unless the resolved path carries both
    # programme.name and university.name (student_pipeline_routes.py:636), so a
    # path of academicContext/subjects/resume alone can never render. Reuse a
    # real programme name from the matcher step above rather than inventing one.
    chosen = next((m for m in items if isinstance(m, dict)), None)
    chosen_programme = _programme_name(chosen) or "Chemical Engineering"
    chosen_programme_id = (chosen or {}).get("id") or (chosen or {}).get("jambId")
    status, payload = r.call(
        "PUT",
        "/api/student/guidance-path",
        {
            "source": "explore",
            "path": {
                "academicContext": {"ssClass": "ss1", "stream": "science"},
                "subjects": UTME_SUBJECTS,
                "programme": {"id": chosen_programme_id, "name": chosen_programme},
                "university": {"name": "University of Lagos"},
                "resume": {"stage": "subjects", "status": "in_progress", "mode": "guided"},
            },
        },
        token=student_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    r.record("student: save guidance path", ok, payload if not ok else {"status": status})

    status, payload = r.call("GET", "/api/student/guidance-path", token=student_token)
    # Double envelope again: ResponseModel.data is the _real() wrapper and the
    # saved row sits at data.data. Reading data.path found nothing because the
    # outer layer only ever carries status/data/meta.
    envelope = (payload or {}).get("data") or {}
    saved = envelope.get("data") or {}
    resumed = (saved.get("path") or {}) if isinstance(saved, dict) else {}
    resume_state = resumed.get("resume") or {}
    r.record(
        "student: guidance path resumes",
        status == 200 and resume_state.get("stage") == "subjects",
        {
            "envelopeStatus": envelope.get("status"),
            "source": saved.get("source") if isinstance(saved, dict) else None,
            "resume": resume_state,
        },
    )

    status, body = r.call("GET", "/api/student/report.html", token=student_token, raw=True)
    html_ok = status == 200 and isinstance(body, str) and len(body) > 200
    r.record(
        "student: report.html renders",
        html_ok,
        {"status": status, "bytes": len(body) if isinstance(body, str) else 0},
    )

    # 7. roster -----------------------------------------------------------
    status, payload = r.call("GET", "/api/provisioning/roster", token=owner_token)
    roster = ((payload or {}).get("data") or {})
    # The roster is SINGLE-wrapped: ResponseModel(data=RosterResponse(...)).
    roster_items = roster.get("items") or roster.get("students") or []
    total_affiliated = roster.get("total_affiliated")
    # Affiliation and visibility are separate contracts, so assert on both:
    # total_affiliated proves the link exists, the row proves the consent
    # actually unlocked it. Checking only one of them hides half the failure.
    affiliated = isinstance(total_affiliated, int) and total_affiliated >= 1
    # The roster identifies students by user_id (provisioning_routes.py:923);
    # full_name is users.username, never the provisioning draft's name, so a
    # substring match on student_name can never succeed. Guard the id so an
    # unset capture can't quietly match a row with a null user_id.
    student_id = r.user_ids.get("student")
    found = bool(student_id) and any(
        isinstance(i, dict) and i.get("user_id") == student_id for i in roster_items
    )
    r.record(
        "owner: student appears on roster",
        affiliated and found,
        {
            "rosterSize": len(roster_items),
            "totalAffiliated": total_affiliated,
            "sharedWithYou": roster.get("shared_with_you"),
            "found": found,
        },
    )

    failures = [s for s in r.steps if not s["ok"]]
    return _finish(r, args, created, 1 if failures else 0, owner_token, student_token)


def _finish(
    r: Runner,
    args,
    created: dict,
    code: int,
    owner_token: Optional[str] = None,
    student_token: Optional[str] = None,
) -> int:
    # Fall back to the Runner's copy: a run that fails partway through still
    # created rows, and leaving them behind poisons the next run (a second
    # attempt collides with the first one's school/owner/draft).
    owner_token = owner_token or r.owner_token
    if not args.no_cleanup and owner_token:
        print("\nCleaning up test rows...")
        uid = created.get("provisioned_user_id")
        if uid:
            status, _ = r.call(
                "DELETE", f"/api/provisioning/students/{uid}", token=owner_token
            )
            print(f"  delete provisioned student -> {status}")
        status, _ = r.call("DELETE", "/api/provisioning/drafts", token=owner_token)
        print(f"  clear drafts -> {status}")
        print("  NOTE: the two signup accounts and the test school row remain;")
        print("        remove them manually if your database should stay clean.")
    elif args.no_cleanup:
        print("\n--no-cleanup set; test rows left in place.")

    passed = sum(1 for s in r.steps if s["ok"])
    total = len(r.steps)
    report = {
        "runId": r.run_id,
        "baseUrl": r.base,
        "finishedAt": datetime.now(timezone.utc).isoformat(),
        "passed": passed,
        "total": total,
        "created": created,
        "steps": r.steps,
    }
    with open(args.report, "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2, default=str)

    print(f"\n== {passed}/{total} steps passed ==")
    print(f"Report written to {args.report}")
    if code:
        print("FAILURES:")
        for s in r.steps:
            if not s["ok"]:
                print(f"  - {s['step']}")
    return code


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception:
        traceback.print_exc()
        if _LIVE:
            sys.exit(_finish(_LIVE["runner"], _LIVE["args"], _LIVE["created"], 1))
        sys.exit(1)
