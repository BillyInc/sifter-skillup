"""public_name: other users never see a legal name, username or email."""
import asyncio
from types import SimpleNamespace

import pytest

import main  # noqa: F401  (imports every mounted route module so db is patched)
from public_name import (
    NEUTRAL_PUBLIC_NAME,
    public_name,
    public_names_for_ids,
    publicize_user_row,
    run_with_public_name_columns,
)


class TestHelper:
    def test_display_name_wins(self):
        assert public_name({"display_name": " Ada B ", "first_name": "Adaeze", "username": "Adaeze Obi Okafor"}) == "Ada B"

    @pytest.mark.parametrize("blank", [None, "", "   "])
    def test_blank_display_name_falls_back_to_first_name_only(self, blank):
        row = {"display_name": blank, "first_name": "Adaeze", "username": "Adaeze Chinwe Okafor"}
        assert public_name(row) == "Adaeze"

    def test_first_name_is_first_token_only(self):
        assert public_name({"first_name": "Mary Jane"}) == "Mary"

    def test_column_missing_is_fine(self):
        assert public_name({"first_name": "Tolu", "username": "Tolu Bello"}) == "Tolu"

    @pytest.mark.parametrize("row", [
        None, {}, {"username": "Adaeze Chinwe Okafor"}, {"email": "ada.obi@example.com"},
        {"username": "ada.obi", "email": "ada.obi@example.com"},
        {"display_name": "a@b.com", "first_name": ""},
        {"first_name": "Student"}, {"first_name": "guest"},
    ])
    def test_missing_names_are_neutral_never_username_or_email(self, row):
        assert public_name(row) == NEUTRAL_PUBLIC_NAME == "Learner"

    def test_email_like_first_name_never_returned(self):
        assert public_name({"first_name": "ada@example.com"}) == "Learner"

    def test_publicize_overwrites_legacy_and_strips_raw_names(self):
        out = publicize_user_row({"id": "1", "username": "Adaeze Okafor", "first_name": "Adaeze", "display_name": None, "points": 5})
        assert out == {"id": "1", "username": "Adaeze", "public_name": "Adaeze", "points": 5}
        assert "Okafor" not in str(out)


class FakeQuery:
    def __init__(self, client, name):
        self.client, self.name, self.cols = client, name, ""

    def select(self, cols, **_):
        self.cols = cols
        self.client.selects.append((self.name, cols))
        return self

    def __getattr__(self, _attr):  # eq/in_/order/limit/ilike/range/lt/gte...
        return lambda *a, **k: self

    def execute(self):
        if self.client.no_display_name_column and "display_name" in self.cols:
            raise Exception("column users.display_name does not exist")
        return SimpleNamespace(data=list(self.client.rows.get(self.name, [])), count=None)


class FakeClient:
    def __init__(self, rows, no_display_name_column=False):
        self.rows, self.selects, self.no_display_name_column = rows, [], no_display_name_column

    def table(self, name):
        return FakeQuery(self, name)


LEGAL = "Adaeze Chinwe Okafor"
ME = {"id": "me", "username": "Me Legal Name", "first_name": "Me", "guild_id": "g1"}


def _install(mock_db, fake):
    mock_db.get_service_client.return_value = fake
    mock_db.get_client.return_value = fake


class TestRetry:
    def test_retries_without_display_name_when_column_missing(self):
        fake = FakeClient({"users": [{"id": "u", "first_name": "Ada"}]}, no_display_name_column=True)
        names = public_names_for_ids(fake, ["u"])
        assert names == {"u": "Ada"}
        assert any("display_name" in c for _, c in fake.selects) and "first_name" == fake.selects[-1][1].split(", ")[-1]

    def test_other_errors_propagate(self):
        def boom(_cols):
            raise RuntimeError("network down")
        with pytest.raises(RuntimeError):
            run_with_public_name_columns(boom)

    def test_lookup_failure_returns_empty_not_legal_name(self):
        class Bad:
            def table(self, _n):
                raise RuntimeError("down")
        assert public_names_for_ids(Bad(), ["u"]) == {}


class TestGuildPayloads:
    MEMBERS = [
        {"id": "u1", "username": LEGAL, "first_name": "Adaeze", "display_name": None, "points": 90, "streak": 2, "starknet_address": None},
        {"id": "u2", "username": "Tunde Bakare Ojo", "first_name": "Tunde", "display_name": "TB", "points": 80, "streak": 1, "starknet_address": None},
    ]

    def test_guild_detail_members_are_public(self, mock_db):
        from routes.guild_routes import guild_detail
        _install(mock_db, FakeClient({"users": self.MEMBERS}))
        gid = __import__("routes.guild_routes", fromlist=["SEED_GUILDS"]).SEED_GUILDS[0]["id"]
        data = asyncio.run(guild_detail(gid, current_user=ME)).data
        assert [m["public_name"] for m in data["members"]] == ["Adaeze", "TB"]
        assert [m["username"] for m in data["members"]] == ["Adaeze", "TB"]
        assert "Okafor" not in str(data) and "Bakare" not in str(data)

    def test_guild_detail_works_before_display_name_migration(self, mock_db):
        from routes.guild_routes import SEED_GUILDS, guild_detail
        rows = [{k: v for k, v in m.items() if k != "display_name"} for m in self.MEMBERS]
        _install(mock_db, FakeClient({"users": rows}, no_display_name_column=True))
        data = asyncio.run(guild_detail(SEED_GUILDS[0]["id"], current_user=ME)).data
        assert [m["public_name"] for m in data["members"]] == ["Adaeze", "Tunde"]

    def test_guild_leaderboard_public(self, mock_db):
        from routes.guild_routes import SEED_GUILDS, guild_leaderboard
        _install(mock_db, FakeClient({"users": self.MEMBERS}))
        data = asyncio.run(guild_leaderboard(SEED_GUILDS[0]["id"], current_user=ME)).data
        assert [m["username"] for m in data] == ["Adaeze", "TB"]
        assert "Okafor" not in str(data)

    def test_my_guild_top_members_public(self, mock_db):
        from routes.guild_routes import SEED_GUILDS, my_guild
        _install(mock_db, FakeClient({"users": self.MEMBERS}))
        data = asyncio.run(my_guild(current_user={**ME, "guild_id": SEED_GUILDS[0]["id"]})).data
        assert [m["public_name"] for m in data["top_members"]] == ["Adaeze", "TB"]

    def test_chat_history_ignores_stored_legal_snapshot(self, mock_db):
        from routes.guild_routes import guild_chat
        fake = FakeClient({
            "guild_messages": [{"id": "m1", "content": "hi", "created_at": "t", "user_id": "u1", "username": LEGAL}],
            "users": [{"id": "u1", "first_name": "Adaeze", "display_name": None}],
        })
        _install(mock_db, fake)
        data = asyncio.run(guild_chat("g1", limit=50, current_user=ME)).data
        assert data[0]["username"] == "Adaeze" and data[0]["public_name"] == "Adaeze"
        assert ("guild_messages", "id, content, created_at, user_id") in fake.selects

    def test_chat_history_lookup_failure_is_neutral(self, mock_db):
        from routes.guild_routes import guild_chat
        class Half(FakeClient):
            def table(self, name):
                if name == "users":
                    raise RuntimeError("down")
                return super().table(name)
        _install(mock_db, Half({"guild_messages": [{"id": "m1", "content": "hi", "created_at": "t", "user_id": "u1", "username": LEGAL}]}))
        data = asyncio.run(guild_chat("g1", limit=50, current_user=ME)).data
        assert data[0]["username"] == "Learner"

    def test_posting_stores_public_name_not_legal(self, mock_db):
        from routes.guild_routes import ChatMessage, send_guild_message
        captured = {}

        class Cap(FakeClient):
            def table(self, name):
                q = super().table(name)
                q.insert = lambda row: (captured.update(row), q)[1]
                return q
        _install(mock_db, Cap({}))
        asyncio.run(send_guild_message("g1", ChatMessage(content="yo"), current_user={**ME, "username": LEGAL, "first_name": "Adaeze"}))
        assert captured["username"] == "Adaeze"


class TestCommunityPayloads:
    POST_USER = {"id": "u1", "first_name": "Adaeze", "display_name": None, "avatar_url": None, "active_track": "t", "is_private": False}

    def test_feed_author_name_is_public(self, mock_db):
        from routes.community_routes import get_feed
        post = {"id": "p1", "user_id": "u1", "content": "x", "created_at": "t", "users": self.POST_USER}
        _install(mock_db, FakeClient({"posts": [post]}))
        data = asyncio.run(get_feed(mode="discover", cursor=None, limit=20, track=None, current_user=ME)).data
        assert data["posts"][0]["author"]["name"] == "Adaeze"

    def test_feed_survives_missing_display_name_column(self, mock_db):
        from routes.community_routes import get_feed
        user = {k: v for k, v in self.POST_USER.items() if k != "display_name"}
        post = {"id": "p1", "user_id": "u1", "content": "x", "created_at": "t", "users": user}
        _install(mock_db, FakeClient({"posts": [post]}, no_display_name_column=True))
        data = asyncio.run(get_feed(mode="discover", cursor=None, limit=20, track=None, current_user=ME)).data
        assert data["posts"][0]["author"]["name"] == "Adaeze"

    def test_notification_actor_public(self, mock_db):
        from routes.community_routes import get_notifications
        n = {"id": "n1", "type": "follow", "is_read": False, "created_at": "t", "users": {"id": "u1", "first_name": "Adaeze", "display_name": "Ada"}}
        _install(mock_db, FakeClient({"notifications": [n]}))
        data = asyncio.run(get_notifications(limit=50, current_user=ME)).data
        assert data["notifications"][0]["actor"]["name"] == "Ada"

    def test_dm_thread_participant_public(self, mock_db):
        from routes.community_routes import get_dm_threads
        t = {"id": "t1", "created_at": "c", "updated_at": "u", "dm_messages": [],
             "thread_participants": [{"user_id": "me", "users": {"id": "me"}},
                                     {"user_id": "u1", "users": {"id": "u1", "first_name": "Adaeze"}}]}
        _install(mock_db, FakeClient({"dm_threads": [t]}))
        data = asyncio.run(get_dm_threads(current_user=ME)).data
        assert data["threads"][0]["participant"]["name"] == "Adaeze"

    def test_dm_messages_and_follow_requests_public(self, mock_db):
        from routes.community_routes import get_dm_messages, get_follow_requests
        fake = FakeClient({
            "thread_participants": [{"user_id": "me"}],
            "dm_messages": [{"id": "m", "created_at": "t", "users": {"id": "u1", "first_name": "Adaeze", "username": LEGAL}}],
            "follow_requests": [{"id": "f", "users": {"id": "u1", "first_name": "Adaeze", "username": LEGAL}}],
        })
        _install(mock_db, fake)
        msgs = asyncio.run(get_dm_messages("t1", current_user=ME)).data["messages"]
        reqs = asyncio.run(get_follow_requests(current_user=ME)).data
        assert msgs[0]["users"]["public_name"] == "Adaeze" and "Okafor" not in str(msgs)
        assert reqs[0]["users"]["username"] == "Adaeze" and "Okafor" not in str(reqs)


class TestMissingRoutesPayloads:
    def test_friend_suggestions_and_friends_public(self, mock_db):
        from routes.missing_routes import friend_suggestions, get_friends
        _install(mock_db, FakeClient({
            "users": [{"id": "u1", "username": LEGAL, "first_name": "Adaeze", "display_name": None}],
            "friends": [{"user_id": "me", "users": {"id": "u1", "username": LEGAL, "first_name": "Adaeze"}}],
        }))
        sugg = asyncio.run(friend_suggestions(current_user={**ME, "active_track": "t"})).data
        friends = asyncio.run(get_friends(current_user=ME)).data
        assert sugg[0]["public_name"] == "Adaeze" and "Okafor" not in str(sugg)
        assert friends[0]["users"]["username"] == "Adaeze" and "Okafor" not in str(friends)

    def test_guild_post_author_public(self, mock_db):
        from routes.missing_routes import get_posts
        post = {"id": "p", "content": "x", "post_likes": [], "users": {"username": LEGAL, "first_name": "Adaeze", "display_name": None, "avatar_url": None}}
        _install(mock_db, FakeClient({"posts": [post]}))
        data = asyncio.run(get_posts(guild_id=None, field=None, limit=20, offset=0, current_user=ME)).data
        assert data[0]["author"] == "Adaeze" and "Okafor" not in str(data)
