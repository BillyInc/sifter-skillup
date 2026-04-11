# ============================================
# Sifter Skill_Up — Twitter/X API v2 Feed
# Fetches curated crypto/quant tweets for feed
# ============================================

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
