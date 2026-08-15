"""
Backend logging configuration using loguru
Provides structured JSON logging with console and file output
"""

from loguru import logger
import os
import sys
from datetime import datetime
from typing import Any, Dict, Optional


class Logger:
    """
    Structured logger wrapper for the backend
    Provides JSON-formatted logs with rotation and retention
    """

    def __init__(self):
        self.setup_logger()

    def setup_logger(self):
        """Configure logger with console and file outputs"""
        # Remove default handler
        logger.remove()

        # Windows development consoles often use cp1252. Structured log
        # records include level icons, so replace unsupported characters
        # instead of raising a secondary logging error during a request.
        for stream in (sys.stdout, sys.stderr):
            reconfigure = getattr(stream, "reconfigure", None)
            if reconfigure:
                try:
                    reconfigure(errors="backslashreplace")
                except (OSError, ValueError):
                    pass

        # Console output with JSON format
        # Note: serialize=True auto-formats as JSON; custom format= conflicts with it
        logger.add(
            sys.stdout,
            level="DEBUG" if os.getenv("ENVIRONMENT") == "development" else "INFO",
            serialize=True,
            backtrace=True,
            diagnose=True,
        )

        # Console output for errors
        logger.add(
            sys.stderr,
            level="ERROR",
            serialize=True,
            backtrace=True,
            diagnose=True,
        )

        # Create logs directory if it doesn't exist
        logs_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
        os.makedirs(logs_dir, exist_ok=True)

        # Main application log with rotation
        logger.add(
            os.path.join(logs_dir, "app.log"),
            level="DEBUG",
            rotation="500 MB",  # Rotate when file reaches 500MB
            retention="10 days",  # Keep logs for 10 days
            compression="zip",  # Compress rotated logs
            serialize=True,
            backtrace=True,
            diagnose=True,
            encoding="utf8",
        )

        # Error-only log
        logger.add(
            os.path.join(logs_dir, "error.log"),
            level="ERROR",
            rotation="100 MB",  # Rotate when file reaches 100MB
            retention="30 days",  # Keep error logs longer
            compression="zip",
            serialize=True,
            backtrace=True,
            diagnose=True,
            encoding="utf8",
        )

    def _json_formatter(self, record: Dict[str, Any]) -> str:
        """Format log record as JSON with timestamp, level, message, and extra fields"""
        log_record = {
            "timestamp": record["time"].isoformat(),
            "level": record["level"].name,
            "message": record["message"],
            "module": record["module"],
            "function": record["function"],
            "line": record["line"],
            "extra": record.get("extra", {}),
        }

        # Handle exception information if present
        if record.get("exception"):
            log_record["exception"] = {
                "type": str(record["exception"].type),
                "value": str(record["exception"].value),
                "traceback": record["exception"].traceback,
            }

        # Convert to JSON string
        import json

        return json.dumps(log_record)

    def debug(self, message: str, **kwargs):
        """Log debug message"""
        logger.debug(message, **kwargs)

    def info(self, message: str, **kwargs):
        """Log info message"""
        logger.info(message, **kwargs)

    def warning(self, message: str, **kwargs):
        """Log warning message"""
        logger.warning(message, **kwargs)

    def error(self, message: str, error: "Exception | str | None" = None, **kwargs):
        """Log error message with optional exception or context string.

        Accepts either an Exception (preferred — emits stack trace) or a
        plain string (treated as additional context, merged into the message).
        """
        if isinstance(error, BaseException):
            logger.opt(exception=error).error(message, **kwargs)
        elif isinstance(error, str):
            logger.error(f"{message} | {error}", **kwargs)
        else:
            logger.error(message, **kwargs)

    def critical(self, message: str, error: "Exception | str | None" = None, **kwargs):
        """Log critical message with optional exception or context string."""
        if isinstance(error, BaseException):
            logger.opt(exception=error).critical(message, **kwargs)
        elif isinstance(error, str):
            logger.critical(f"{message} | {error}", **kwargs)
        else:
            logger.critical(message, **kwargs)

    def child(self, **kwargs) -> "LoggerChild":
        """Create a child logger with additional context"""
        return LoggerChild(self, **kwargs)


class LoggerChild:
    """
    Child logger that includes additional context in all logs
    """

    def __init__(self, parent: "Logger", **context):
        self.parent = parent
        self.context = context

    def debug(self, message: str, **kwargs):
        """Log debug message with context"""
        combined_kwargs = {**self.context, **kwargs}
        self.parent.debug(message, **combined_kwargs)

    def info(self, message: str, **kwargs):
        """Log info message with context"""
        combined_kwargs = {**self.context, **kwargs}
        self.parent.info(message, **combined_kwargs)

    def warning(self, message: str, **kwargs):
        """Log warning message with context"""
        combined_kwargs = {**self.context, **kwargs}
        self.parent.warning(message, **combined_kwargs)

    def error(self, message: str, error: Optional[Exception] = None, **kwargs):
        """Log error message with context"""
        combined_kwargs = {**self.context, **kwargs}
        self.parent.error(message, error, **combined_kwargs)

    def critical(self, message: str, error: Optional[Exception] = None, **kwargs):
        """Log critical message with context"""
        combined_kwargs = {**self.context, **kwargs}
        self.parent.critical(message, error, **combined_kwargs)

    def child(self, **kwargs) -> "LoggerChild":
        """Create a child logger with additional context"""
        combined_context = {**self.context, **kwargs}
        return LoggerChild(self.parent, **combined_context)


# Global logger instance
log = Logger()

# Convenience exports for direct use
debug = log.debug
info = log.info
warning = log.warning
error = log.error
critical = log.critical

__all__ = ["log", "debug", "info", "warning", "error", "critical", "Logger"]
