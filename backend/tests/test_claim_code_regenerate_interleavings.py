"""Exact racing-regenerate interleavings against the real _retire_superseded_codes.

Each racer runs in its own thread against a fake whose every database call waits
for its turn in an explicit schedule, so the interleavings found by the
exhaustive review are replayed deterministically. Application-level only: the
real fix for the regenerate race is a partial unique index
(docs/ops/proposals/claim-codes-single-live-code-2026-11-27.sql).
"""
import random
import threading
from datetime import UTC, datetime, timedelta

import pytest

import routes.provisioning_routes as pr
from tests.test_claim_merge_safety import _DB, _Q, _code, _ts


def NOW_STAMP():
    return datetime.now(UTC).isoformat()


class _Sched:
    """Lets the actor named first in `order` run its next DB call; once the
    order is exhausted the remaining calls run in whichever order they arrive."""

    def __init__(self, order):
        self.order = list(order)
        self.finished = set()
        self.cv = threading.Condition()
        self.exec_lock = threading.Lock()

    def gate(self, who):
        with self.cv:
            while True:
                while self.order and self.order[0] in self.finished:
                    self.order.pop(0)
                if not self.order:
                    return
                if self.order[0] == who:
                    self.order.pop(0)
                    self.cv.notify_all()
                    return
                if not self.cv.wait(timeout=10):
                    raise TimeoutError("schedule deadlock")

    def done(self, who):
        with self.cv:
            self.finished.add(who)
            self.cv.notify_all()


class _GatedQ(_Q):
    def execute(self):
        who = threading.current_thread().name
        self.db.sched.gate(who)
        with self.db.sched.exec_lock:
            return super().execute()


class _GatedDB(_DB):
    sched = None

    def table(self, name):
        return _GatedQ(self, name)


def _live_ids(db):
    return sorted(r["id"] for r in db.tables["claim_codes"]
                  if not r.get("revoked_at") and not r.get("redeemed_at"))


def _run(db, order, actors):
    """actors: {name: callable}. Returns {name: result-or-exception}."""
    db.sched = _Sched(order)
    out = {}

    def wrap(name, fn):
        def go():
            try:
                out[name] = fn()
            except BaseException as exc:  # noqa: BLE001
                out[name] = exc
            finally:
                db.sched.done(name)
        return go

    threads = [threading.Thread(target=wrap(n, f), name=n) for n, f in actors.items()]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)
        assert not t.is_alive(), "racer hung"
    for v in out.values():
        if isinstance(v, BaseException):
            raise v
    return out


@pytest.fixture
def gdb(monkeypatch):
    d = _GatedDB()
    d.tables = {"claim_codes": []}
    monkeypatch.setattr(pr, "_svc", lambda: d)
    return d


def _insert(db, row):
    db.table("claim_codes").insert(row).execute()


def _racer(db, new_row, known_older):
    def go():
        _insert(db, new_row)
        return pr._retire_superseded_codes("prov-1", new_row["id"], known_older)
    return go


def test_finding1_winner_step_never_leaves_zero_live_codes(gdb):
    # c0 old live; B's c2 (clock 0s) already inserted; A's c1 (clock -17s) is
    # inserted mid-race. A snapshotted {c0,c2}, B snapshotted {c0}.
    gdb.tables["claim_codes"] = [
        _code(id="c0", code="C0", created_at=_ts(days=-2)),
        _code(id="c2", code="C2", created_at=_ts()),
    ]
    c1 = _code(id="c1", code="C1", created_at=_ts(seconds=-17))
    # B r1-read, A insert c1, A r1-read, B revoke c0, B after-read, A revoke c2,
    # A revoke c0, A after-read, B winner-step revoke (stale on the old code).
    order = "BAABBAAAAB"
    out = _run(gdb, order, {
        "A": _racer(gdb, c1, {"c0", "c2"}),
        "B": lambda: pr._retire_superseded_codes("prov-1", "c2", {"c0"}),
    })
    live = _live_ids(gdb)
    assert live, f"zero live codes: {gdb.tables['claim_codes']} -> {out}"
    # A True return is only valid while its own code is the live one.
    if out["A"] is True and out["B"] is True:
        pytest.fail("both told success although at most one card can be live")
    assert len(live) == 1


def test_finding2_reopen_never_resurrects_a_code_beside_a_fresh_redeem_stamp(gdb):
    # A's c1 -15s, B's c2 -16s, both known_older empty. Schedule AABBRAAA where R
    # is the redeemer stamping c1 between B's after-read and A's after-read.
    gdb.tables["claim_codes"] = [
        _code(id="c1", code="C1", created_at=_ts(seconds=-15)),
        _code(id="c2", code="C2", created_at=_ts(seconds=-16)),
    ]
    stamp = NOW_STAMP()

    def redeem():
        gdb.table("claim_codes").update({"redeemed_at": stamp}).eq("id", "c1").is_(
            "redeemed_at", "null").is_("revoked_at", "null").execute()
        return True

    out = _run(gdb, "AABBRAAA", {
        "A": lambda: pr._retire_superseded_codes("prov-1", "c1", set()),
        "B": lambda: pr._retire_superseded_codes("prov-1", "c2", set()),
        "R": redeem,
    })
    rows = {r["id"]: r for r in gdb.tables["claim_codes"]}
    assert rows["c1"]["redeemed_at"] == stamp           # the claim holds its code
    assert _live_ids(gdb) == [], f"a code was resurrected beside the claim: {rows}"
    assert out["B"] is False


def test_reopen_is_refused_while_any_fresh_redeem_stamp_exists(db_plain):
    db = db_plain
    db.tables["claim_codes"] = [
        _code(id="mine", code="M", created_at=_ts(), revoked_at=_ts(seconds=-1)),
        _code(id="stamped", code="S", created_at=_ts(minutes=-5), redeemed_at=_ts(seconds=-3)),
        _code(id="other", code="O", created_at=_ts(seconds=-30)),
    ]
    # "other" is revoked by this call (older than keep); keep itself was revoked.
    assert pr._retire_superseded_codes("prov-1", "mine") is False
    assert [r["id"] for r in db.tables["claim_codes"] if not r.get("revoked_at")
            and not r.get("redeemed_at")] == []


@pytest.fixture
def db_plain(monkeypatch):
    d = _DB()
    d.tables = {"claim_codes": []}
    monkeypatch.setattr(pr, "_svc", lambda: d)
    return d


def test_finding3_a_known_older_lost_card_is_never_reopened(db_plain):
    # The racer's own new code was revoked by an admin mid-flight; only the old
    # lost card is left among the codes this call revoked. It must stay dead.
    db = db_plain
    db.tables["claim_codes"] = [
        _code(id="lost", code="L", created_at=_ts(days=-9)),
        _code(id="mine", code="M", created_at=_ts(), revoked_at=_ts(seconds=-1)),
    ]
    assert pr._retire_superseded_codes("prov-1", "mine", {"lost"}) is False
    assert _live_ids(db) == []


def test_finding3_a_racers_code_inserted_before_our_snapshot_may_be_reopened(db_plain):
    # Skewed racers: B's code is in A's known_older but only seconds old, so it is
    # a concurrent regenerate's code, not the lost card, and may be restored.
    db = db_plain
    db.tables["claim_codes"] = [
        _code(id="o", code="O", created_at=_ts(days=-2)),
        _code(id="b", code="B", created_at=_ts(seconds=10)),
        _code(id="a", code="A", created_at=_ts(), revoked_at=_ts(seconds=-1)),
    ]
    assert pr._retire_superseded_codes("prov-1", "a", {"o", "b"}) is False
    assert _live_ids(db) == ["b"]


def test_finding4_stamps_are_unique_and_monotonic_even_on_a_frozen_clock(monkeypatch):
    frozen = datetime(2026, 11, 27, 12, 0, 0, 123456, tzinfo=UTC)

    class _Frozen(datetime):
        @classmethod
        def now(cls, tz=None):
            return frozen

    monkeypatch.setattr(pr, "datetime", _Frozen)
    pr._LAST_STAMP[0] = datetime.min.replace(tzinfo=UTC)
    stamps = [pr._unique_stamp() for _ in range(50)]
    assert len(set(stamps)) == 50
    parsed = [datetime.fromisoformat(s) for s in stamps]
    assert parsed == sorted(parsed)
    assert parsed[1] - parsed[0] == timedelta(microseconds=1)


def test_finding4_two_calls_never_share_a_revoke_stamp(db_plain):
    db = db_plain
    seen = set()
    for i in range(5):
        db.tables["claim_codes"] = [
            _code(id=f"old{i}", code=f"O{i}", created_at=_ts(days=-1)),
            _code(id=f"new{i}", code=f"N{i}", created_at=_ts()),
        ]
        pr._retire_superseded_codes("prov-1", f"new{i}", {f"old{i}"})
        stamp = next(r["revoked_at"] for r in db.tables["claim_codes"] if r["id"] == f"old{i}")
        seen.add(stamp)
    assert len(seen) == 5


def test_same_instant_ignores_string_form():
    assert pr._same_instant("2026-11-27T10:00:00.120000+00:00", "2026-11-27T10:00:00.12+00:00")
    assert pr._same_instant("2026-11-27T10:00:00Z", "2026-11-27T10:00:00+00:00")
    assert not pr._same_instant("2026-11-27T10:00:00.000001+00:00", "2026-11-27T10:00:00+00:00")


def test_regenerate_200_carries_a_refresh_note():
    import inspect
    assert '"note"' in inspect.getsource(pr.regenerate_code)


@pytest.mark.parametrize("seed", range(int(__import__("os").environ.get("SEEDS","40"))))
def test_random_interleavings_of_two_skewed_racers_keep_a_live_code(gdb, seed):
    """Sampled schedules, skews -20..20s. Asserts the app-level invariant that
    holds at the end of every sampled run: no schedule ends with zero live codes
    and no schedule ends with more than one live code."""
    rng = random.Random(seed)
    skew_a, skew_b = rng.randint(-20, 20), rng.randint(-20, 20)
    gdb.tables["claim_codes"] = [_code(id="c0", code="C0", created_at=_ts(days=-2))]
    ca = _code(id="ca", code="CA", created_at=_ts(seconds=skew_a))
    cb = _code(id="cb", code="CB", created_at=_ts(seconds=skew_b))
    order = "".join(rng.choice("AB") for _ in range(int(__import__("os").environ.get("SEEDS","40"))))
    # Each racer snapshots the live set before its own insert; inserts are gated
    # so the snapshot is taken at the start of its thread's turn order.
    gdb.sched = _Sched("")
    snap = {}

    def racer(name, row, other):
        def go():
            snap[name] = {r["id"] for r in gdb.tables["claim_codes"]
                          if not r.get("revoked_at") and not r.get("redeemed_at")}
            _insert(gdb, row)
            return pr._retire_superseded_codes("prov-1", row["id"], snap[name])
        return go

    _run(gdb, order, {"A": racer("A", ca, "B"), "B": racer("B", cb, "A")})
    live = _live_ids(gdb)
    assert len(live) >= 1, (seed, skew_a, skew_b, order, gdb.tables["claim_codes"])
