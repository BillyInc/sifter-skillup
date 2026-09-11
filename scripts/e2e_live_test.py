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
UTME_SUBJECTS = ["Physics", "Chemistry", "Mathematics"]
UTME_SUBJECTS_NEGATIVE = ["Physics", "Mathematics", "Economics"]


class Runner:
    def __init__(self, base_url: str, timeout: int) -> None:
        self.base = base_url.rstrip("/")
        self.timeout = timeout
        self.steps: list[dict[str, Any]] = []
        self.run_id = uuid.uuid4().hex[:8]

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
        if not self.record(
            f"{label}: signup",
            bool(token),
            {"status": status} if token else payload,
        ):
            return None
        return token


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
        {"items": [{"draft_id": draft_id, "student_type": "secondary", "stream": "science"}]},
        token=owner_token,
    )
    gen = ((payload or {}).get("data") or {})
    generated = gen.get("generated") or gen.get("students") or []
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

    # 4. SS1 guidance -----------------------------------------------------
    status, payload = r.call(
        "POST",
        "/api/student/starting-point",
        {
            "userType": "ss_secondary",
            "ssDoor": "ss",
            "ssClass": "SS1",
            "stream": "science",
            "exploreIntent": ["careers"],
            "jambSubjects": UTME_SUBJECTS,
            "olevelSubjects": UTME_SUBJECTS + ["English Language"],
        },
        token=student_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    r.record("student: save SS1 starting point", ok, payload if not ok else {"status": status})

    status, payload = r.call("GET", "/api/student/starting-point", token=student_token)
    persisted = ((payload or {}).get("data") or {})
    r.record(
        "student: starting point persists",
        status == 200 and bool(persisted),
        {"userType": persisted.get("userType"), "ssClass": persisted.get("ssClass")},
    )

    # 5. subject matching -------------------------------------------------
    status, payload = r.call(
        "GET",
        "/api/student/programmes/by-subjects",
        params={"subjects": ",".join(UTME_SUBJECTS), "exam_type": "utme"},
    )
    matches = ((payload or {}).get("data") or {})
    items = matches.get("items") if isinstance(matches, dict) else matches
    items = items or []
    names = [m.get("jambName") or m.get("jamb_name") or m.get("name") for m in items if isinstance(m, dict)]
    r.record(
        "matcher: UTME Physics/Chemistry/Maths returns matches",
        len(items) > 0,
        {"count": len(items), "sample": names[:8]},
    )

    status, payload = r.call(
        "GET",
        "/api/student/programmes/by-subjects",
        params={"subjects": ",".join(UTME_SUBJECTS_NEGATIVE), "exam_type": "utme"},
    )
    neg = ((payload or {}).get("data") or {})
    neg_items = neg.get("items") if isinstance(neg, dict) else neg
    neg_items = neg_items or []
    neg_names = [
        (m.get("jambName") or m.get("jamb_name") or m.get("name") or "")
        for m in neg_items
        if isinstance(m, dict)
    ]
    cs_present = any("computer science" in (n or "").lower() for n in neg_names)
    r.record(
        "matcher: dropping Chemistry excludes Computer Science",
        not cs_present,
        {"count": len(neg_items), "computerSciencePresent": cs_present},
    )

    # 6. guidance path + report ------------------------------------------
    status, payload = r.call(
        "PUT",
        "/api/student/guidance-path",
        {
            "source": "explore",
            "path": {
                "academicContext": {"ssClass": "SS1", "stream": "science"},
                "subjects": UTME_SUBJECTS,
                "resume": {"stage": "subjects", "status": "in_progress", "mode": "guided"},
            },
        },
        token=student_token,
    )
    ok = status == 200 and (payload or {}).get("success") is not False
    r.record("student: save guidance path", ok, payload if not ok else {"status": status})

    status, payload = r.call("GET", "/api/student/guidance-path", token=student_token)
    resumed = ((payload or {}).get("data") or {}).get("path") or {}
    r.record(
        "student: guidance path resumes",
        status == 200 and bool(resumed),
        {"resume": resumed.get("resume")},
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
    roster_items = roster.get("items") or roster.get("students") or []
    found = any(student_name in json.dumps(i, default=str) for i in roster_items)
    r.record(
        "owner: student appears on roster",
        found,
        {"rosterSize": len(roster_items), "found": found},
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
    sys.exit(main())
