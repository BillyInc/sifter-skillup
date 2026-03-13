import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Replace with your Supabase credentials ──────────────────
const SUPABASE_URL  = 'https://your-project.supabase.co';
const SUPABASE_ANON = 'your-anon-key';
const SCHEMA        = 'sifter_dev';
// ────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  db:   { schema: SCHEMA },
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});

// ── Auth helpers ─────────────────────────────────────────────
export const Auth = {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signUpEmail(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  async signInEmail(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signInGuest() {
    // Create anonymous-style account with a generated email
    const id       = Math.random().toString(36).slice(2, 10);
    const email    = `guest_${id}@sifterskillup.app`;
    const password = `guest_${id}_pwd`;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    return supabase.auth.signOut();
  },
};

// ── Database helpers ─────────────────────────────────────────
export const DB = {
  // Load or create user profile
  async loadOrCreateUser(userId: string, meta?: Record<string, any>) {
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existing) return existing;

    const { data: created, error } = await supabase
      .from('users')
      .insert([{
        id:               userId,
        username:         meta?.username || 'Learner',
        avatar_url:       meta?.avatar_url || null,
        auth_provider:    meta?.auth_provider || 'email',
        points:           1000,
        streak:           1,
        last_played:      new Date().toISOString().split('T')[0],
        current_level:    1,
        completed_levels: [],
        character_stage:  0,
        onboarding_completed: false,
      }])
      .select()
      .single();

    if (error) throw error;
    return created;
  },

  async getUser(userId: string) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    return data;
  },

  async updateUser(userId: string, updates: Record<string, any>) {
    const { data } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    return data;
  },

  // Complete a level
  async completeLevel(userId: string, levelId: number, score: number, perfect: boolean) {
    const user = await this.getUser(userId);
    if (!user) return null;

    const completed: number[] = user.completed_levels || [];
    const isNew = !completed.includes(levelId);
    if (isNew) completed.push(levelId);

    const xpEarned    = perfect ? 250 : 100;
    const newPoints   = user.points + xpEarned;
    const nextLevel   = Math.max(user.current_level, levelId + 1);

    await this.updateUser(userId, {
      points:           newPoints,
      current_level:    nextLevel,
      completed_levels: completed,
    });

    // Save score
    await supabase.from('level_scores').upsert({
      user_id:  userId,
      level_id: levelId,
      score,
      stars:    perfect ? 3 : score > 150 ? 2 : 1,
      completed_at: new Date().toISOString(),
    });

    return { xpEarned, newPoints, nextLevel, completed };
  },

  // Streak check
  async checkStreak(userId: string) {
    const user = await this.getUser(userId);
    if (!user) return;
    const today    = new Date().toISOString().split('T')[0];
    const lastDate = user.last_played;
    const diff     = (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000;
    const newStreak = diff <= 1 ? (user.streak || 1) + (diff === 1 ? 1 : 0) : 1;
    if (today !== lastDate) {
      await this.updateUser(userId, { streak: newStreak, last_played: today });
    }
    return newStreak;
  },

  // Guilds
  async getGuilds() {
    const { data } = await supabase.from('guilds').select('*').eq('is_public', true).order('total_xp', { ascending: false }).limit(20);
    return data || [];
  },

  async joinGuild(userId: string, guildId: string) {
    return supabase.from('guild_members').upsert({ user_id: userId, guild_id: guildId, weekly_xp: 0 });
  },

  async getLeaderboard(limit = 20) {
    const { data } = await supabase.from('users').select('id, username, points, streak, character_stage').order('points', { ascending: false }).limit(limit);
    return data || [];
  },
};
