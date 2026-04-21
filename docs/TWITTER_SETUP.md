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
