# SkillUp Missing Features Completion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Privy wallet SDK integration, Firebase Cloud Messaging (FCM) push notifications, and Twitter API feed integration for SkillUp.

**Architecture:** 
- **Privy SDK** integrates with frontend for wallet connection/authentication, backed by backend verification in Starknet routes
- **FCM** sends push notifications via Firebase v1 HTTP API when users log in from a new device  
- **Twitter API** replaces RSS-only feeds with real Twitter/X feeds for relevant crypto/quant content

**Tech Stack:** Firebase Admin SDK, Privy React hooks, Twitter/X API v2, FastAPI, React Native/Expo

---

## Task 1: Install Privy SDK in Frontend

**Files:**
- Modify: `package.json`
- Create: `src/hooks/usePrivy.ts` (if needed)
- Modify: `src/App.tsx` (if needed)

- [ ] **Step 1: Add Privy package to dependencies**

```bash
cd sifter-skillup
npm install @privy-io/react-auth
```

Expected: Package added to `package.json` and installed in `node_modules`.

- [ ] **Step 2: Verify installation**

```bash
npm list @privy-io/react-auth
```

Expected: Shows installed version (e.g., `@privy-io/react-auth@1.65.0`).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add Privy SDK for wallet authentication"
```

---

## Task 2: Integrate Privy Provider in App Root

**Files:**
- Modify: `src/App.tsx`
- Create: `src/config/privy.ts`

- [ ] **Step 1: Create Privy config file**

```bash
cat > src/config/privy.ts << 'EOF'
export const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";

if (!PRIVY_APP_ID) {
  console.warn("EXPO_PUBLIC_PRIVY_APP_ID not set — Privy wallet features disabled");
}

export const privyConfig = {
  appId: PRIVY_APP_ID,
  config: {
    appearance: {
      theme: "dark",
      accentColor: "#646cff",
    },
    wallets: {
      // Create embedded wallets (demo/test wallet)
      embedded: {
        createOnLogin: "users-without-wallets",
      },
    },
    externalWallets: {
      // Optional: allow users to connect external wallets
      solana: {
        categories: ["popular", "all"],
      },
      ethereum: {
        categories: ["popular", "all"],
      },
    },
  },
};
EOF
```

- [ ] **Step 2: Read current App.tsx to understand navigation/auth structure**

```bash
head -50 src/App.tsx
```

Expected: Shows root app structure, navigation setup, existing context providers.

- [ ] **Step 3: Update App.tsx to wrap with PrivyProvider**

The exact change depends on your current App.tsx structure. If you have a root Navigator or Context setup, wrap the navigation tree with PrivyProvider.

Example (update to match your actual structure):

```typescript
import { PrivyProvider } from "@privy-io/react-auth";
import { privyConfig } from "./config/privy";

export default function App() {
  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      {/* Your existing navigation and context providers */}
      <RootNavigator />
    </PrivyProvider>
  );
}
```

- [ ] **Step 4: Create .env variable for Privy App ID**

```bash
echo "EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here" >> .env
```

Expected: Privy App ID added to `.env` (you will need to fill in the actual value from your Privy dashboard).

- [ ] **Step 5: Commit**

```bash
git add src/config/privy.ts src/App.tsx .env
git commit -m "feat: integrate Privy provider in app root"
```

---

## Task 3: Create FCM Setup and Configuration

**Files:**
- Create: `backend/fcm_service.py`
- Modify: `backend/config.py`
- Modify: `backend/requirements.txt` or `backend/pyproject.toml`

- [ ] **Step 1: Install Firebase Admin SDK**

```bash
cd sifter-skillup/backend
uv add firebase-admin
```

Expected: `firebase-admin` added to `pyproject.toml` and uv.lock.

- [ ] **Step 2: Create FCM service module**

```bash
cat > backend/fcm_service.py << 'EOF'
# ============================================
# Sifter Skill_Up — Firebase Cloud Messaging
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
    async def send_device_logout_notification(
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
    async def send_generic_notification(
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


# Initialize on import
FCMService.init()
EOF
```

- [ ] **Step 3: Verify pyproject.toml has firebase-admin**

```bash
grep firebase-admin pyproject.toml
```

Expected: Shows `firebase-admin = "..."` in the dependencies.

- [ ] **Step 4: Commit**

```bash
git add backend/fcm_service.py pyproject.toml
git commit -m "feat: add Firebase Cloud Messaging service for push notifications"
```

---

## Task 4: Integrate FCM Notifications in Device Session Enforcement

**Files:**
- Modify: `backend/device_sessions.py`

- [ ] **Step 1: Read device_sessions.py to find where new device login is handled**

```bash
grep -n "new_device\|check_device\|register_device" backend/device_sessions.py | head -10
```

Expected: Shows key functions that handle device registration and checking.

- [ ] **Step 2: Add FCM import and integrate notification in device session creation**

Look for the function that creates a new device session when `SINGLE_DEVICE_ENFORCEMENT` is True. Add a call to notify the old device.

Example (modify to match actual code):

```python
from fcm_service import FCMService

# In the function that enforces single device:
# When a new device logs in and old device exists:

if old_device and old_device.get("fcm_token"):
    await FCMService.send_device_logout_notification(
        old_device["fcm_token"],
        new_device_name=current_device_name,
    )
```

- [ ] **Step 3: Verify device_sessions table has fcm_token column**

```bash
grep -i "fcm_token\|fcm" backend/device_sessions.py | head -5
```

If FCM token column doesn't exist in the device_sessions table schema, a migration will be needed (covered in next step).

- [ ] **Step 4: Commit**

```bash
git add backend/device_sessions.py
git commit -m "feat: send FCM notification when new device logs in"
```

---

## Task 5: Add FCM Token Column to device_sessions Table (if needed)

**Files:**
- Create: `backend/migration_fcm_device_tokens.sql`
- Modify: `backend/migration_v2.sql` or create standalone migration

- [ ] **Step 1: Check if fcm_token column already exists**

```bash
cd backend
python -c "
import asyncio
from database import db
try:
    result = db.get_service_client().table('device_sessions').select('*').limit(0).execute()
    columns = [col for col in dir(result) if not col.startswith('_')]
    print(columns)
except Exception as e:
    print(f'Error: {e}')
"
```

If `fcm_token` is not in the schema, proceed to Step 2.

- [ ] **Step 2: Create migration SQL file**

```bash
cat > backend/migration_fcm_device_tokens.sql << 'EOF'
-- Add FCM token column to device_sessions for push notifications
ALTER TABLE skillup_dev.device_sessions
ADD COLUMN fcm_token TEXT DEFAULT NULL;

COMMENT ON COLUMN skillup_dev.device_sessions.fcm_token IS 'Firebase Cloud Messaging device token for push notifications';
EOF
```

- [ ] **Step 3: Apply migration**

```bash
cd backend
# If using Supabase UI: copy-paste SQL into editor and run
# OR via CLI if you have psql access:
# psql $DATABASE_URL < migration_fcm_device_tokens.sql
```

- [ ] **Step 4: Commit**

```bash
git add backend/migration_fcm_device_tokens.sql
git commit -m "feat: add fcm_token column to device_sessions table"
```

---

## Task 6: Create Twitter API Integration Service

**Files:**
- Create: `backend/twitter_service.py`
- Modify: `backend/requirements.txt` or `backend/pyproject.toml`

- [ ] **Step 1: Install Twitter/X API v2 client**

```bash
cd sifter-skillup/backend
uv add tweepy tweepy[async]
```

Expected: Tweepy added to `pyproject.toml` and uv.lock.

- [ ] **Step 2: Create Twitter API service**

```bash
cat > backend/twitter_service.py << 'EOF'
# ============================================
# Sifter Skill_Up — Twitter/X API v2 Feed
# Fetches curated crypto/quant tweets for feed
# ============================================

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import tweepy
from logger import log
from config import settings


class TwitterService:
    """
    Manages Twitter/X API v2 for curated crypto/quant content feeds.
    Uses Bearer token (read-only access for published tweets).
    """

    _client: Optional[tweepy.Client] = None

    @classmethod
    def _get_client(cls) -> Optional[tweepy.Client]:
        """Lazy-load Twitter API client."""
        if cls._client is None:
            if not settings.TWITTER_API_BEARER_TOKEN:
                log.warning("TWITTER_API_BEARER_TOKEN not set; Twitter feed disabled")
                return None
            try:
                cls._client = tweepy.Client(
                    bearer_token=settings.TWITTER_API_BEARER_TOKEN,
                    wait_on_rate_limit=True,
                )
                log.info("Twitter API client initialized")
            except Exception as e:
                log.error(f"Failed to initialize Twitter client: {e}")
                return None
        return cls._client

    @classmethod
    async def fetch_feed_for_track(cls, track_id: str) -> List[Dict[str, Any]]:
        """
        Fetch recent tweets for a given track.

        Args:
            track_id: The learning track ID (e.g., 'starknet', 'quant_trader')

        Returns:
            List of formatted feed items
        """
        client = cls._get_client()
        if not client:
            return []

        # Define search queries per track
        track_queries = {
            "starknet": "Starknet OR Cairo lang:en -is:retweet",
            "quant_trader": "algorithmic trading quant finance lang:en -is:retweet",
            "quant_researcher": "quantitative research DeFi lang:en -is:retweet",
            "crypto_developer": "smart contract development blockchain lang:en -is:retweet",
        }

        query = track_queries.get(track_id, f"{track_id} crypto lang:en -is:retweet")

        try:
            # Fetch tweets from last 7 days
            tweets = client.search_recent_tweets(
                query=query,
                max_results=50,
                tweet_fields=["created_at", "public_metrics", "author_id"],
                expansions=["author_id"],
                user_fields=["username", "verified"],
            )

            if not tweets.data:
                log.debug(f"No tweets found for track {track_id}")
                return []

            # Build user lookup map
            users = {user.id: user for user in tweets.includes["users"]}

            # Format as feed items
            items = []
            for tweet in tweets.data:
                author = users.get(tweet.author_id, {})
                items.append({
                    "id": tweet.id,
                    "title": f"{author.username or 'Unknown'}" if hasattr(author, 'username') else "Unknown",
                    "content": tweet.text,
                    "source": "twitter",
                    "source_url": f"https://twitter.com/{getattr(author, 'username', 'x')}/status/{tweet.id}",
                    "created_at": tweet.created_at.isoformat() if tweet.created_at else None,
                    "track_id": track_id,
                    "like_count": tweet.public_metrics.get("like_count", 0),
                    "share_count": tweet.public_metrics.get("retweet_count", 0),
                })
            return items
        except Exception as e:
            log.error(f"Failed to fetch Twitter feed for {track_id}: {e}")
            return []

    @classmethod
    async def fetch_user_timeline(cls, username: str, max_tweets: int = 10) -> List[Dict[str, Any]]:
        """Fetch recent tweets from a specific user."""
        client = cls._get_client()
        if not client:
            return []

        try:
            user = client.get_user(username=username)
            if not user.data:
                log.warning(f"Twitter user not found: {username}")
                return []

            tweets = client.get_users_tweets(
                id=user.data.id,
                max_results=max_tweets,
                tweet_fields=["created_at", "public_metrics"],
            )

            if not tweets.data:
                return []

            items = []
            for tweet in tweets.data:
                items.append({
                    "id": tweet.id,
                    "title": username,
                    "content": tweet.text,
                    "source": "twitter",
                    "source_url": f"https://twitter.com/{username}/status/{tweet.id}",
                    "created_at": tweet.created_at.isoformat() if tweet.created_at else None,
                    "like_count": tweet.public_metrics.get("like_count", 0),
                })
            return items
        except Exception as e:
            log.error(f"Failed to fetch user timeline for {username}: {e}")
            return []
EOF
```

- [ ] **Step 3: Verify pyproject.toml has tweepy**

```bash
grep tweepy pyproject.toml
```

Expected: Shows `tweepy = "..."` in dependencies.

- [ ] **Step 4: Add Twitter Bearer Token to config.py**

Open `backend/config.py` and add after the TWITTER_CLIENT_SECRET line (around line 84):

```python
    # ── Twitter API v2 (Bearer token) ────────────────────────
    TWITTER_API_BEARER_TOKEN: str = os.getenv("TWITTER_API_BEARER_TOKEN", "")
```

- [ ] **Step 5: Update .env.example with Twitter Bearer Token**

```bash
echo "# ── Twitter API v2 (Bearer token for feed) ───────────" >> backend/.env.example
echo "TWITTER_API_BEARER_TOKEN=your-bearer-token-here" >> backend/.env.example
```

- [ ] **Step 6: Commit**

```bash
git add backend/twitter_service.py backend/config.py backend/.env.example pyproject.toml
git commit -m "feat: add Twitter/X API v2 integration for feed content"
```

---

## Task 7: Integrate Twitter Feed into feed_routes.py

**Files:**
- Modify: `backend/feed_routes.py`

- [ ] **Step 1: Read current feed_routes.py to understand structure**

```bash
head -100 backend/feed_routes.py
```

Expected: Shows current feed fetch logic.

- [ ] **Step 2: Import Twitter service**

Add at top of `feed_routes.py`:

```python
from twitter_service import TwitterService
```

- [ ] **Step 3: Integrate Twitter feed in get_feed function**

Modify the `get_feed()` function to optionally pull from Twitter if configured. Example (adjust to match actual structure):

```python
# In get_feed():
feed_items = []

# Existing feed logic (database)
# ... existing code ...

# Add Twitter feed items if track matches
if track_id and settings.TWITTER_API_BEARER_TOKEN:
    twitter_items = await TwitterService.fetch_feed_for_track(track_id)
    feed_items.extend(twitter_items)

# Sort by created_at descending
feed_items = sorted(
    feed_items,
    key=lambda x: x.get("created_at", ""),
    reverse=True
)

# Apply pagination
feed_items = feed_items[offset : offset + limit]
```

- [ ] **Step 4: Test feed endpoint locally**

```bash
cd backend
uv run uvicorn main:app --reload
# In another terminal:
curl "http://localhost:8000/api/feed?track_id=starknet&limit=20"
```

Expected: Response includes both database feed items and Twitter tweets.

- [ ] **Step 5: Commit**

```bash
git add backend/feed_routes.py
git commit -m "feat: integrate Twitter API feed into track feeds"
```

---

## Task 8: Add Firebase Service Account Setup Documentation

**Files:**
- Create: `docs/FIREBASE_SETUP.md`

- [ ] **Step 1: Create Firebase setup guide**

```bash
cat > docs/FIREBASE_SETUP.md << 'EOF'
# Firebase Setup for FCM Push Notifications

## Overview
SkillUp uses Firebase Cloud Messaging (FCM) to notify old devices when a user logs in from a new device (single-device enforcement).

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firebase Messaging API

### 2. Create Service Account
1. Go to Project Settings → Service Accounts tab
2. Click "Generate New Private Key"
3. Download the JSON file
4. Save to: `backend/firebase-service-account.json` (git-ignored)

### 3. Configure Environment
Add to `backend/.env`:

```
FCM_SERVICE_ACCOUNT_PATH=firebase-service-account.json
FCM_PROJECT_ID=your-project-id
```

### 4. Frontend: Get FCM Token
In the mobile app, request FCM token from Firebase Messaging:

```javascript
import messaging from '@react-native-firebase/messaging';

const fcmToken = await messaging.getToken();
// Send fcmToken with device login request
```

### 5. Verify Push Works
When a new device logs in, old device should receive logout notification.

## Troubleshooting

**"FCM not initialized"**: Check FCM_SERVICE_ACCOUNT_PATH and file permissions
**No notifications**: Verify FCM tokens are being stored in device_sessions table
**Google auth errors**: Regenerate service account private key

## Disabling FCM (Development)
Set `SINGLE_DEVICE_ENFORCEMENT=false` in backend/.env to skip FCM during dev.
EOF
```

- [ ] **Step 2: Commit**

```bash
git add docs/FIREBASE_SETUP.md
git commit -m "docs: add Firebase FCM setup guide"
```

---

## Task 9: Add Twitter API Bearer Token Setup Documentation

**Files:**
- Modify: `docs/FIREBASE_SETUP.md` or create `docs/TWITTER_SETUP.md`

- [ ] **Step 1: Create Twitter API setup guide**

```bash
cat > docs/TWITTER_SETUP.md << 'EOF'
# Twitter/X API v2 Setup for Feed Content

## Overview
SkillUp uses Twitter API v2 to fetch curated crypto and quant finance tweets for personalized feeds.

## Setup Steps

### 1. Apply for Twitter/X API Access
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app (or use existing one)
3. Request "Elevated" access level (free tier supports ~2M tweets/month)

### 2. Get Bearer Token
1. Go to your app's "Keys and tokens" section
2. Copy the **Bearer Token** (not API Key or API Secret)
3. Store securely (never commit to git)

### 3. Configure Environment
Add to `backend/.env`:

```
TWITTER_API_BEARER_TOKEN=your-bearer-token-here
```

### 4. Verify Tweets Load
```bash
curl "http://localhost:8000/api/feed?track_id=starknet&limit=10"
```

Expected: Response includes `source: "twitter"` items with tweet content.

## Supported Tracks
Feeds are configured per track:
- `starknet`: Starknet + Cairo development
- `quant_trader`: Algorithmic trading & quant finance
- `quant_researcher`: Quantitative research & DeFi
- `crypto_developer`: Smart contract development

## Troubleshooting

**"TWITTER_API_BEARER_TOKEN not set"**: Verify `backend/.env` has the token
**"No tweets found"**: Ensure account has Elevated API access, not Academic or Sandbox
**Rate limiting**: Tweepy auto-waits; monitor logs for rate_limit warnings

## Disabling Twitter Feed (Development)
Leave `TWITTER_API_BEARER_TOKEN` empty in `.env` to disable Twitter feed.
EOF
```

- [ ] **Step 2: Commit**

```bash
git add docs/TWITTER_SETUP.md
git commit -m "docs: add Twitter API v2 setup guide"
```

---

## Task 10: Create & Push Feature Branch

**Files:**
- None (git operation)

- [ ] **Step 1: Verify all changes are committed**

```bash
cd sifter-skillup
git status
```

Expected: No uncommitted changes.

- [ ] **Step 2: Create feature branch**

```bash
git checkout -b feat/complete-missing-features
```

- [ ] **Step 3: Push to remote**

```bash
git push -u origin feat/complete-missing-features
```

Expected: Shows remote tracking branch created.

- [ ] **Step 4: Verify branch on GitHub**

```bash
git branch -vv
```

Expected: Shows `feat/complete-missing-features` tracking `origin/feat/complete-missing-features`.

---

## Summary

**Completed Features:**
1. ✅ Privy SDK installed and integrated in frontend
2. ✅ Firebase Cloud Messaging configured for push notifications
3. ✅ Twitter/X API v2 integrated for live feed content
4. ✅ Documentation added for Firebase and Twitter setup
5. ✅ Feature branch created and pushed

**Next Steps:**
- Deploy Firebase service account JSON to backend server
- Configure TWITTER_API_BEARER_TOKEN in production
- Test end-to-end: login from new device → old device gets push notification
- Test feed: verify Twitter tweets appear in `/api/feed` endpoint

**Branch:** `feat/complete-missing-features`
