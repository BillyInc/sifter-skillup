"""A log line must never be able to raise.

Found by requesting a signup code locally against a real Resend key. Resend
rejected the recipient with a JSON body, `_issue_email_code` caught the
EmailDeliveryError and called

    log.error("Email code delivery failed", email=..., purpose=..., error=str(exc))

intending to answer HTTP 502 "Could not send the email." The log call itself
raised `KeyError('"statusCode"')`, so the client got a 500 and a stack trace
instead -- the failure handler was the thing that failed.

Cause: loguru applies str.format to the message whenever args or kwargs are
present. The old implementation built the message with an f-string, so the
provider's text became part of the TEMPLATE and every brace in it became a
format placeholder. Resend's body starts `{"statusCode":422,...}`, giving a
placeholder named `"statusCode"`, which is not among the kwargs.

This is not specific to Resend: any logged third-party payload -- JSON from any
API, a dict repr, a `{}` in a stack trace -- had the same effect, and only when
kwargs were also passed, which is why it survived so long.
"""

import pytest

from logger import Logger


# Real Resend 422 body, trimmed. The braces are the entire point -- do not
# "tidy" this into a plain string.
RESEND_422 = (
    '{"statusCode":422,"name":"validation_error",'
    '"message":"Invalid `to` field. Please use a valid email address."}'
)


@pytest.fixture
def log():
    return Logger()


class TestBracesInLoggedText:
    def test_error_survives_a_json_payload_with_context_kwargs(self, log):
        """The exact shape that produced the 500."""
        log.error(
            "Email code delivery failed",
            email="local-test@example.com",
            purpose="signup",
            error=RESEND_422,
        )

    def test_critical_survives_the_same(self, log):
        log.critical("Delivery failed", error=RESEND_422, purpose="signup")

    @pytest.mark.parametrize(
        "text",
        [
            RESEND_422,
            "{}",
            "{0}",
            "{missing_key}",
            "dict repr: {'a': 1}",
            "unbalanced {",
        ],
    )
    def test_any_braced_text_is_safe(self, log, text):
        log.error("boom", error=text, some_context="value")

    def test_braces_in_the_message_itself_are_safe(self, log):
        """The message is a literal at every current call site, but nothing
        enforces that, and the same formatting applies to it."""
        log.error("failed for {user_id}", error="context", request_id="r1")

    def test_the_text_still_reaches_the_log(self, log):
        """Not swallowed -- the whole point is to keep the provider's reason,
        since the status code alone cannot distinguish an unverified domain
        from a malformed payload.

        Asserted through a loguru sink rather than capsys: the app configures
        its own sinks at import, so stdout/stderr capture proves nothing here.
        """
        from loguru import logger as loguru_logger

        emitted: list[str] = []
        sink_id = loguru_logger.add(emitted.append, format="{message}", level="ERROR")
        try:
            log.error(
                "Email code delivery failed", error=RESEND_422, purpose="signup"
            )
        finally:
            loguru_logger.remove(sink_id)

        joined = "".join(emitted)
        assert "Email code delivery failed" in joined
        # The literal braces must survive intact, not be eaten by formatting.
        assert '{"statusCode":422' in joined
        assert "validation_error" in joined

    def test_exception_path_is_unaffected(self, log):
        """Passing an Exception takes the opt(exception=...) branch, which
        must keep emitting a stack trace."""
        try:
            raise ValueError(RESEND_422)
        except ValueError as exc:
            log.error("Email code delivery failed", error=exc, purpose="signup")

    def test_no_error_argument_still_works(self, log):
        log.error("plain message", purpose="signup")
