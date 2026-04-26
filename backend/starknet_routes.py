"""
Compatibility shim for legacy imports.

The FastAPI app uses `routes.starknet_routes`, but some older tests and local
tools still import `backend.starknet_routes` directly. Re-export the current
router module so there is only one Starknet auth implementation to maintain.
"""

from routes.starknet_routes import *  # noqa: F401,F403
