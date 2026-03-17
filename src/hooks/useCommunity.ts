/**
 * useCommunity — All community state, realtime, and API logic.
 *
 * Handles:
 *  - Cursor-based infinite scroll (scales to millions of posts)
 *  - Supabase Realtime subscriptions (live likes, comments, notifications)
 *  - Feed algorithm: Following feed + Discover (trending by field/track)
 *  - @mention and #hashtag parsing
 *  - Reactions (6 types)
 *  - Report / block / mute
 *  - Private account enforcement
 *  - DM: user can only open their own inbox (no unsolicited messages)
 *  - Poll creation and voting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { offlineWrite } from '../lib/offlineQueue';
import * as Haptics from 'expo-haptics';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReactionType = '❤️' | '🔥' | '💡' | '🏆' | '😂' | '👀';
export const REACTIONS: ReactionType[] = ['❤️', '🔥', '💡', '🏆', '😂', '👀'];

export interface Author {
  id:         string;
  name:       string;
  avatar:     string;
  track?:     string;
  field?:     string;
  guild?:     string;
  isPrivate?: boolean;
  isFollowing?: boolean;
  isBlocked?: boolean;
}

export interface Poll {
  question:   string;
  options:    Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
  votedId?:   string;  // which option current user voted
  endsAt?:    string;
}

export interface Attachment {
  type:       'portfolio' | 'image';
  title?:     string;
  url?:       string;
  imageUri?:  string;
  badgeEarned?: string;
  trackName?:   string;
}

export interface Post {
  id:           string;
  author:       Author;
  content:      string;
  attachments?: Attachment[];
  poll?:        Poll;
  reactions:    Partial<Record<ReactionType, number>>;
  myReaction?:  ReactionType;
  comments:     number;
  quotes:       number;
  isBookmarked: boolean;
  quotedPost?:  Omit<Post, 'quotedPost'>;
  hashtags:     string[];
  mentions:     string[];
  createdAt:    string;
  isPinned?:    boolean;
}

export interface Comment {
  id:          string;
  author:      Author;
  content:     string;
  reactions:   Partial<Record<ReactionType, number>>;
  myReaction?: ReactionType;
  createdAt:   string;
  replies?:    Comment[];
}

export interface Notification {
  id:          string;
  type:        'reaction' | 'comment' | 'quote' | 'follow' | 'follow_request' | 'mention' | 'poll_ended' | 'guild_invite';
  actor:       Author;
  postId?:     string;
  postSnippet?: string;
  reaction?:   ReactionType;
  isRead:      boolean;
  createdAt:   string;
}

export interface TrendingTopic {
  tag:         string;
  postCount:   number;
  field?:      string;
}

export type FeedMode = 'following' | 'discover';

// ── Mention / hashtag parser ───────────────────────────────────────────────────

export function parseContent(text: string): { hashtags: string[]; mentions: string[] } {
  const hashtags = (text.match(/#(\w+)/g) ?? []).map(t => t.slice(1).toLowerCase());
  const mentions = (text.match(/@(\w+)/g) ?? []).map(t => t.slice(1).toLowerCase());
  return { hashtags, mentions };
}

/** Render content with coloured @mentions and #hashtags */
export function highlightContent(text: string): Array<{ text: string; type: 'plain' | 'mention' | 'hashtag' }> {
  const parts: Array<{ text: string; type: 'plain' | 'mention' | 'hashtag' }> = [];
  const regex = /(@\w+|#\w+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), type: 'plain' });
    parts.push({ text: match[0], type: match[0].startsWith('@') ? 'mention' : 'hashtag' });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), type: 'plain' });
  return parts;
}

// ── Feed cursor pagination ────────────────────────────────────────────────────

interface FeedState {
  posts:       Post[];
  cursor:      string | null;  // ISO timestamp of oldest post — never use page numbers (doesn't scale)
  hasMore:     boolean;
  loading:     boolean;
  refreshing:  boolean;
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useCommunity(currentUserId: string, currentUserTrack?: string) {
  const [feedMode, setFeedMode] = useState<FeedMode>('following');
  const [feed, setFeed] = useState<FeedState>({ posts: [], cursor: null, hasMore: true, loading: false, refreshing: false });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const realtimeRef = useRef<any>(null);

  // ── Load initial feed ───────────────────────────────────────────────────────

  const loadFeed = useCallback(async (refresh = false) => {
    setFeed(s => ({ ...s, loading: !refresh, refreshing: refresh }));
    try {
      const cursor = refresh ? null : feed.cursor;
      const params: Record<string, string> = {
        mode:   feedMode,
        userId: currentUserId,
        limit:  '20',
        ...(cursor ? { cursor } : {}),
        ...(currentUserTrack ? { track: currentUserTrack } : {}),
      };
      const qs = new URLSearchParams(params).toString();
      // Backend returns posts sorted newest-first, with next_cursor for pagination
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/community/feed?${qs}`, {
        headers: { Authorization: `Bearer ${await import('./api').then(m => m.API.getToken())}` },
      });
      if (!res.ok) throw new Error('Feed load failed');
      const data = await res.json();
      const newPosts: Post[] = (data.posts ?? []).filter((p: Post) => !blockedIds.has(p.author.id) && !mutedIds.has(p.author.id));

      setFeed(s => ({
        posts:      refresh ? newPosts : [...s.posts, ...newPosts],
        cursor:     data.next_cursor ?? null,
        hasMore:    data.has_more ?? false,
        loading:    false,
        refreshing: false,
      }));
    } catch {
      setFeed(s => ({ ...s, loading: false, refreshing: false }));
    }
  }, [feedMode, currentUserId, currentUserTrack, blockedIds, mutedIds]);

  const loadMore = useCallback(() => {
    if (!feed.hasMore || feed.loading) return;
    loadFeed(false);
  }, [feed.hasMore, feed.loading, loadFeed]);

  const refresh = useCallback(() => loadFeed(true), [loadFeed]);

  // ── Reload when feed mode changes ───────────────────────────────────────────

  useEffect(() => { loadFeed(true); }, [feedMode]);

  // ── Trending topics ─────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/community/trending`);
        if (res.ok) { const d = await res.json(); setTrending(d.topics ?? []); }
      } catch {}
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000); // refresh trending every 5 min
    return () => clearInterval(t);
  }, []);

  // ── Supabase Realtime ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to new posts in feed
    const postChannel = supabase
      .channel(`community:feed:${currentUserId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'sifter_dev',
        table:  'posts',
        filter: `audience=eq.public`,
      }, payload => {
        const post = payload.new as Post;
        if (blockedIds.has(post.author?.id) || mutedIds.has(post.author?.id)) return;
        setFeed(s => ({ ...s, posts: [post, ...s.posts] }));
      })
      // Subscribe to reaction updates — live like/reaction counts
      .on('postgres_changes', {
        event:  '*',
        schema: 'sifter_dev',
        table:  'post_reactions',
      }, payload => {
        const { post_id, reaction_type, count } = payload.new as any;
        setFeed(s => ({
          ...s,
          posts: s.posts.map(p =>
            p.id === post_id
              ? { ...p, reactions: { ...p.reactions, [reaction_type]: count } }
              : p
          ),
        }));
      })
      .subscribe();

    // Subscribe to personal notifications
    const notifChannel = supabase
      .channel(`notifications:${currentUserId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'sifter_dev',
        table:  'notifications',
        filter: `recipient_id=eq.${currentUserId}`,
      }, payload => {
        const notif = payload.new as Notification;
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(n => n + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      })
      .subscribe();

    realtimeRef.current = { postChannel, notifChannel };
    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [currentUserId, blockedIds, mutedIds]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const react = useCallback(async (postId: string, reaction: ReactionType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeed(s => ({
      ...s,
      posts: s.posts.map(p => {
        if (p.id !== postId) return p;
        const removing = p.myReaction === reaction;
        const prev = p.reactions ?? {};
        const oldReaction = p.myReaction;
        const updated = { ...prev };
        if (oldReaction) updated[oldReaction] = Math.max(0, (updated[oldReaction] ?? 1) - 1);
        if (!removing) updated[reaction] = (updated[reaction] ?? 0) + 1;
        return { ...p, reactions: updated, myReaction: removing ? undefined : reaction };
      }),
    }));
    await offlineWrite('/api/posts/react', 'POST', { postId, reaction }, 'normal');
  }, []);

  const submitPost = useCallback(async (params: {
    content:      string;
    quotedPostId?: string;
    poll?:        { question: string; options: string[]; durationHours?: number };
    imageUri?:    string;
  }) => {
    const { hashtags, mentions } = parseContent(params.content);
    const optimistic: Post = {
      id:          `temp_${Date.now()}`,
      author:      { id: currentUserId, name: 'You', avatar: '⚡', track: currentUserTrack },
      content:     params.content,
      reactions:   {},
      comments:    0,
      quotes:      0,
      isBookmarked: false,
      hashtags,
      mentions,
      createdAt:   new Date().toISOString(),
    };
    if (params.poll) {
      optimistic.poll = {
        question:   params.poll.question,
        options:    params.poll.options.map((t, i) => ({ id: String(i), text: t, votes: 0 })),
        totalVotes: 0,
      };
    }
    setFeed(s => ({ ...s, posts: [optimistic, ...s.posts] }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await offlineWrite('/api/posts', 'POST', { ...params, hashtags, mentions }, 'high');
  }, [currentUserId, currentUserTrack]);

  const votePoll = useCallback(async (postId: string, optionId: string) => {
    setFeed(s => ({
      ...s,
      posts: s.posts.map(p => {
        if (p.id !== postId || !p.poll) return p;
        const opts = p.poll.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);
        return { ...p, poll: { ...p.poll, options: opts, totalVotes: p.poll.totalVotes + 1, votedId: optionId } };
      }),
    }));
    await offlineWrite('/api/posts/vote', 'POST', { postId, optionId }, 'high');
  }, []);

  const bookmark = useCallback(async (postId: string, folderId?: string) => {
    setFeed(s => ({
      ...s,
      posts: s.posts.map(p => p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p),
    }));
    await offlineWrite('/api/posts/bookmark', 'POST', { postId, folderId }, 'normal');
  }, []);

  const reportPost = useCallback(async (postId: string, reason: string) => {
    await offlineWrite('/api/moderation/report', 'POST', { postId, reason, reporterId: currentUserId }, 'high');
  }, [currentUserId]);

  const blockUser = useCallback(async (userId: string) => {
    setBlockedIds(prev => new Set([...prev, userId]));
    setFeed(s => ({ ...s, posts: s.posts.filter(p => p.author.id !== userId) }));
    await offlineWrite('/api/users/block', 'POST', { targetId: userId }, 'high');
  }, []);

  const muteUser = useCallback(async (userId: string) => {
    setMutedIds(prev => new Set([...prev, userId]));
    setFeed(s => ({ ...s, posts: s.posts.filter(p => p.author.id !== userId) }));
    await offlineWrite('/api/users/mute', 'POST', { targetId: userId }, 'normal');
  }, []);

  const followUser = useCallback(async (userId: string, isPrivate: boolean) => {
    // Private accounts get a follow REQUEST — public accounts get instant follow
    const action = isPrivate ? 'follow-request' : 'follow';
    await offlineWrite(`/api/users/${action}`, 'POST', { targetId: userId }, 'normal');
  }, []);

  const markNotificationsRead = useCallback(async () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await offlineWrite('/api/notifications/read-all', 'POST', {}, 'normal');
  }, []);

  // ── Search ──────────────────────────────────────────────────────────────────

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/community/search?q=${encodeURIComponent(q)}&userId=${currentUserId}`,
        { headers: { Authorization: `Bearer ${await import('./api').then(m => m.API.getToken())}` } }
      );
      if (res.ok) { const d = await res.json(); setSearchResults(d.posts ?? []); }
    } catch {} finally { setSearchLoading(false); }
  }, [currentUserId]);

  // Load notifications once
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/notifications?userId=${currentUserId}`,
          { headers: { Authorization: `Bearer ${await import('./api').then(m => m.API.getToken())}` } }
        );
        if (res.ok) {
          const d = await res.json();
          setNotifications(d.notifications ?? []);
          setUnreadCount((d.notifications ?? []).filter((n: Notification) => !n.isRead).length);
        }
      } catch {}
    };
    if (currentUserId) load();
  }, [currentUserId]);

  return {
    // Feed
    feed, feedMode, setFeedMode, loadMore, refresh,
    // Actions
    react, submitPost, votePoll, bookmark,
    reportPost, blockUser, muteUser, followUser,
    // Notifications
    notifications, unreadCount, markNotificationsRead,
    // Discovery
    trending,
    // Search
    searchQuery, setSearchQuery, search, searchResults, searchLoading,
    // Utils
    blockedIds, mutedIds,
  };
}

// ── DM — user-initiated only ──────────────────────────────────────────────────
//
// Design decision: no unsolicited DMs. A user can only open their own inbox.
// Others cannot "slide into your DMs" — you have to tap their profile and
// choose to message them. This eliminates harassment and spam at the UX level.

export interface DMThread {
  id:            string;
  participant:   Author;
  lastMessage:   string;
  lastAt:        string;
  unread:        number;
}

export interface DMMessage {
  id:        string;
  senderId:  string;
  content:   string;
  createdAt: string;
  isRead:    boolean;
}

export function useDMs(currentUserId: string) {
  const [threads, setThreads] = useState<DMThread[]>([]);
  const [loading, setLoading] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/dms/threads`,
        { headers: { Authorization: `Bearer ${await import('./api').then(m => m.API.getToken())}` } }
      );
      if (res.ok) { const d = await res.json(); setThreads(d.threads ?? []); }
    } catch {} finally { setLoading(false); }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    await offlineWrite('/api/dms/send', 'POST', {
      senderId: currentUserId,
      recipientId,
      content,
    }, 'high');
  }, [currentUserId]);

  // Realtime for DMs
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`dms:${currentUserId}`)
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'sifter_dev',
        table:  'dm_messages',
        filter: `recipient_id=eq.${currentUserId}`,
      }, () => { loadThreads(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, loadThreads]);

  return { threads, loading, loadThreads, sendMessage };
}
