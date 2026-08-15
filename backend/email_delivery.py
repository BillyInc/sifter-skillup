"""Transactional email delivery via Resend.

This replaces the `_deliver_email_code` stub in main.py, which only wrote the
code to the log. Nothing was ever sent, so the endpoint answered
`{"sent": true}` while no mail existed -- in production, where the dev-code
bypass is off, that meant nobody could complete signup at all.

Failures raise. The caller must not report `sent: true` for mail that was
never accepted, which is exactly the failure mode this replaces.
"""

from typing import Optional

import httpx

from config import settings
from logger import log

RESEND_ENDPOINT = "https://api.resend.com/emails"
REQUEST_TIMEOUT_SECONDS = 10.0


class EmailDeliveryError(Exception):
    """Delivery was not accepted by the provider."""


def _verification_html(code: str, ttl_minutes: int) -> str:
    return f"""\
<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Confirm your email</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:20px;color:#4b5563;">
        Enter this code in LevelUp to finish creating your account.
      </p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111827;
                  background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;">
        {code}
      </div>
      <p style="margin:24px 0 0;font-size:13px;line-height:19px;color:#6b7280;">
        This code expires in {ttl_minutes} minutes. If you did not request it,
        you can safely ignore this email -- no account will be created.
      </p>
    </div>
  </body>
</html>"""


def _verification_text(code: str, ttl_minutes: int) -> str:
    # Sent alongside the HTML: some clients render text only, and having both
    # meaningfully improves deliverability.
    return (
        f"Confirm your email\n\n"
        f"Your LevelUp verification code is: {code}\n\n"
        f"It expires in {ttl_minutes} minutes. If you did not request it, "
        f"ignore this email -- no account will be created.\n"
    )


async def _post(payload: dict) -> None:
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(RESEND_ENDPOINT, json=payload, headers=headers)
    except httpx.HTTPError as exc:
        raise EmailDeliveryError(f"Could not reach the email provider: {exc}") from exc

    if response.status_code >= 400:
        # Resend puts the reason in the body; the status alone does not
        # distinguish "domain not verified" from "malformed payload".
        raise EmailDeliveryError(
            f"Email provider rejected the send (HTTP {response.status_code}): "
            f"{response.text[:300]}"
        )


def _reset_html(code: str, ttl_minutes: int) -> str:
    return f"""\
<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Reset your password</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:20px;color:#4b5563;">
        Enter this code in LevelUp to choose a new password.
      </p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111827;
                  background:#f3f4f6;border-radius:8px;padding:16px;text-align:center;">
        {code}
      </div>
      <p style="margin:24px 0 0;font-size:13px;line-height:19px;color:#6b7280;">
        This code expires in {ttl_minutes} minutes. If you did not ask to reset
        your password, ignore this email -- your password will not change.
      </p>
    </div>
  </body>
</html>"""


def _reset_text(code: str, ttl_minutes: int) -> str:
    return (
        f"Reset your password\n\n"
        f"Your LevelUp password reset code is: {code}\n\n"
        f"It expires in {ttl_minutes} minutes. If you did not ask to reset your "
        f"password, ignore this email -- your password will not change.\n"
    )


async def send_password_reset_code(
    email: str,
    code: str,
    ttl_minutes: Optional[int] = None,
) -> None:
    """Email a password reset code. Raises EmailDeliveryError on failure."""
    ttl = ttl_minutes if ttl_minutes is not None else settings.EMAIL_CODE_TTL_MINUTES
    await _send(
        email,
        code,
        subject="Reset your LevelUp password",
        html=_reset_html(code, ttl),
        text=_reset_text(code, ttl),
    )


async def send_verification_code(
    email: str,
    code: str,
    ttl_minutes: Optional[int] = None,
) -> None:
    """Email a signup verification code. Raises EmailDeliveryError on failure."""
    ttl = ttl_minutes if ttl_minutes is not None else settings.EMAIL_CODE_TTL_MINUTES
    await _send(
        email,
        code,
        subject="Your LevelUp verification code",
        html=_verification_html(code, ttl),
        text=_verification_text(code, ttl),
    )


async def send_admin_mfa_code(
    email: str,
    code: str,
    ttl_minutes: Optional[int] = None,
) -> None:
    """Email a one-time admin challenge code."""
    ttl = ttl_minutes if ttl_minutes is not None else settings.EMAIL_CODE_TTL_MINUTES
    await _send(
        email,
        code,
        subject="Your LevelUp admin security code",
        html=_verification_html(code, ttl).replace("Confirm your email", "Confirm admin access"),
        text=_verification_text(code, ttl).replace("Confirm your email", "Confirm admin access"),
    )


async def _send(email: str, code: str, *, subject: str, html: str, text: str) -> None:
    if not settings.RESEND_API_KEY:
        # Local development without a key stays workable, but only where the
        # dev-code path is also active so the code is actually reachable.
        # Anywhere else this is a misconfiguration and must be loud.
        if settings.EMAIL_VERIFICATION_DEV_CODES:
            log.warning(
                "RESEND_API_KEY is not set; verification code logged instead of emailed",
                email=email,
                code=code,
            )
            return
        raise EmailDeliveryError(
            "Email delivery is not configured (RESEND_API_KEY is unset)."
        )

    await _post(
        {
            "from": settings.EMAIL_FROM,
            "to": [email],
            "subject": subject,
            "html": html,
            "text": text,
        }
    )
    log.info("Transactional email sent", email=email, subject=subject)
