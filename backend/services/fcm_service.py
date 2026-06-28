# ============================================
# Sifter LevelUp — Firebase Cloud Messaging
# Sends push notifications for device enforcement
# (e.g., logout when new device logs in)
# ============================================

from typing import Optional
import firebase_admin
from firebase_admin import credentials, messaging
from logger import log
from config import settings


class FCMService:
    """
    Manages Firebase Cloud Messaging (HTTP v1 API).
    Sends device notifications for single-device enforcement.
    """

    _initialized = False

    @classmethod
    def init(cls) -> None:
        """Initialize Firebase Admin SDK once at startup."""
        if cls._initialized:
            return
        if not settings.FCM_SERVICE_ACCOUNT_PATH:
            log.warning("FCM_SERVICE_ACCOUNT_PATH not set; FCM disabled")
            return
        try:
            creds = credentials.Certificate(settings.FCM_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(creds)
            cls._initialized = True
            log.info("Firebase Admin SDK initialized")
        except Exception as e:
            log.error(f"Failed to initialize Firebase: {e}")
            cls._initialized = False

    @classmethod
    def send_device_logout_notification(
        cls,
        fcm_token: str,
        new_device_name: str,
    ) -> bool:
        """
        Send a logout notification to an old device when a new device logs in.

        Args:
            fcm_token: Device's FCM registration token
            new_device_name: Name of the new device logging in

        Returns:
            True if sent successfully, False otherwise
        """
        if not cls._initialized or not settings.FCM_SERVICE_ACCOUNT_PATH:
            log.debug("FCM not configured; skipping notification")
            return False

        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title="New Device Detected",
                    body=f"Your account was accessed from {new_device_name}. If this wasn't you, sign in to revoke access.",
                ),
                data={
                    "action": "logout",
                    "reason": "single_device_enforcement",
                },
                token=fcm_token,
            )
            response = messaging.send(message)
            log.info(f"FCM notification sent: {response}")
            return True
        except Exception as e:
            log.error(f"Failed to send FCM notification: {e}")
            return False

    @classmethod
    def send_generic_notification(
        cls,
        fcm_token: str,
        title: str,
        body: str,
        data: Optional[dict] = None,
    ) -> bool:
        """Send a generic notification to a device."""
        if not cls._initialized or not settings.FCM_SERVICE_ACCOUNT_PATH:
            return False

        try:
            message = messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data=data or {},
                token=fcm_token,
            )
            response = messaging.send(message)
            log.info(f"Generic FCM notification sent: {response}")
            return True
        except Exception as e:
            log.error(f"Failed to send generic notification: {e}")
            return False
