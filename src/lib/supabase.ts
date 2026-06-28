import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Env-driven Supabase credentials ─────────────────────────
// Set in .env:
//   EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
// ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SCHEMA = 'skillup_dev';

function isPlaceholder(value: string) {
  if (!value) return true;
  if (value.includes('your-project')) return true;
  if (value === 'your-anon-key') return true;
  return false;
}

export const SUPABASE_CONFIGURED =
  !isPlaceholder(SUPABASE_URL) && !isPlaceholder(SUPABASE_ANON);

if (!SUPABASE_CONFIGURED) {
  console.warn(
    '[supabase] Not configured — set EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY. Community / direct-Supabase paths will ' +
      'no-op until real credentials are in place. Prefer the FastAPI /api ' +
      'backend for demo-critical data access.',
  );
}

// Create the real client only when configured. Otherwise export `null` so
// callers can probe `SUPABASE_CONFIGURED` (or `supabase == null`) before
// dereferencing — importing this module must NOT throw or Metro crashes.
export const supabase: SupabaseClient<any, any, any> | null = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON, {
      db: { schema: SCHEMA },
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

function notConfigured<T = never>(method: string): T {
  console.warn(`[supabase] ${method} called but Supabase is not configured — returning safe default.`);
  return undefined as unknown as T;
}

// ── Auth helpers ─────────────────────────────────────────────
export const Auth = {
  async getSession() {
    if (!supabase) return null;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  async signUpEmail(email: string, password: string) {
    if (!supabase) return notConfigured('Auth.signUpEmail');
    return supabase.auth.signUp({ email, password });
  },

  async signInEmail(email: string, password: string) {
    if (!supabase) return notConfigured('Auth.signInEmail');
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signInGuest() {
    if (!supabase) return notConfigured('Auth.signInGuest');
    const id = Math.random().toString(36).slice(2, 10);
    const email = `guest_${id}@sifterlevelup.app`;
    const password = `guest_${id}_pwd`;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) return notConfigured('Auth.signOut');
    return supabase.auth.signOut();
  },
};

// ── Database helpers ─────────────────────────────────────────
export const DB = {
  async loadOrCreateUser(userId: string, meta?: Record<string, any>) {
    if (!supabase) return null;
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existing) return existing;

    const { data: created, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          username: meta?.username || 'Learner',
          avatar_url: meta?.avatar_url || null,
          auth_provider: meta?.auth_provider || 'email',
          points: 1000,
          streak: 1,
          last_played: new Date().toISOString().split('T')[0],
          current_level: 1,
          completed_levels: [],
          character_stage: 0,
          onboarding_completed: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return created;
  },

  async getUser(userId: string) {
    if (!supabase) return null;
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    return data;
  },

  async updateUser(userId: string, updates: Record<string, any>) {
    if (!supabase) return null;
    const { data } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    return data;
  },

  async completeLevel(userId: string, levelId: number, score: number, perfect: boolean) {
    if (!supabase) return null;
    const user = await this.getUser(userId);
    if (!user) return null;

    const completed: number[] = user.completed_levels || [];
    const isNew = !completed.includes(levelId);
    if (isNew) completed.push(levelId);

    const xpEarned = perfect ? 250 : 100;
    const newPoints = user.points + xpEarned;
    const nextLevel = Math.max(user.current_level, levelId + 1);

    await this.updateUser(userId, {
      points: newPoints,
      current_level: nextLevel,
      completed_levels: completed,
    });

    await supabase.from('level_scores').upsert({
      user_id: userId,
      level_id: levelId,
      score,
      stars: perfect ? 3 : score > 150 ? 2 : 1,
      completed_at: new Date().toISOString(),
    });

    return { xpEarned, newPoints, nextLevel, completed };
  },

  async checkStreak(userId: string) {
    if (!supabase) return undefined;
    const user = await this.getUser(userId);
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.last_played;
    const diff = (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000;
    const newStreak = diff <= 1 ? (user.streak || 1) + (diff === 1 ? 1 : 0) : 1;
    if (today !== lastDate) {
      await this.updateUser(userId, { streak: newStreak, last_played: today });
    }
    return newStreak;
  },

  async getGuilds() {
    if (!supabase) return [];
    const { data } = await supabase
      .from('guilds')
      .select('*')
      .eq('is_public', true)
      .order('total_xp', { ascending: false })
      .limit(20);
    return data || [];
  },

  async joinGuild(userId: string, guildId: string) {
    if (!supabase) return notConfigured('DB.joinGuild');
    return supabase.from('guild_members').upsert({ user_id: userId, guild_id: guildId, weekly_xp: 0 });
  },

  async getLeaderboard(limit = 20) {
    if (!supabase) return [];
    const { data } = await supabase
      .from('users')
      .select('id, username, points, streak, character_stage')
      .order('points', { ascending: false })
      .limit(limit);
    return data || [];
  },
};
