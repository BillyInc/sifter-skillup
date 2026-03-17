/**
 * Sifter Skill_Up — Notification Engine
 *
 * Three channels:
 *   1. Push (Expo Notifications) — primary, works when app is backgrounded
 *   2. SMS  (Twilio via backend webhook) — for offline-primary users
 *   3. Email (SendGrid via backend webhook) — daily digest + milestones
 *
 * Notifications are:
 *   - Personalised by role (Supply Chain Analyst, Quant Trader, etc.)
 *   - Hyped and motivational — Duolingo energy, Sifter voice
 *   - Streak-aware — tone escalates from gentle reminder to urgent
 *   - Level-aware — references where the user actually is
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { offlineWrite } from './offlineQueue';

// ─── Role-specific notification copy ─────────────────────────────────────────

interface RoleCopy {
  streakReminder: string[];   // day 1 miss
  streakUrgent: string[];     // day 2+ miss
  levelComplete: string[];
  bossApproaching: string[];
  portfolioEarned: string[];
  weeklyProgress: string[];
}

const ROLE_COPY: Record<string, RoleCopy> = {
  'supply-chain-analyst': {
    streakReminder: [
      "⚡ {name}, your supply chain isn't going to optimise itself. 5 minutes. Let's go.",
      "🔗 Supply chain analysts earn $75k+ — and you're {progress}% of the way there. Don't stop now.",
      "📦 One stockout happened somewhere in the world while you weren't practising. Fix that.",
      "🚢 Real supply chains don't pause. Neither should you. Back to it, {name}.",
    ],
    streakUrgent: [
      "🚨 {name}! {streak} days without practice. Your future employer is interviewing someone who didn't stop.",
      "⚠️ Your supply chain portfolio is sitting unfinished. Every day counts towards the job that changes everything.",
      "🔥 You were on a {streak}-day streak. That's not gone — come back and reclaim it right now.",
    ],
    levelComplete: [
      "🏆 {name} just cleared {level}. Supply chain analysts who reach this level earn {salary}. You're getting there.",
      "⚡ Level complete! You just learned what most supply chain teams don't teach for 6 months on the job.",
    ],
    bossApproaching: [
      "🎯 Boss Battle tomorrow. This is the one that earns you a portfolio artifact. Don't walk in cold.",
      "⚡ Your Boss Battle is unlocked. This is what separates you from every candidate who just did coursework.",
    ],
    portfolioEarned: [
      "🏆 Portfolio artifact earned and pushed to LinkedIn. Recruiters can see this right now.",
      "📊 Your Supply Chain portfolio just grew. One more artifact closer to hire-ready.",
    ],
    weeklyProgress: [
      "📈 This week: {lessons} lessons, {xp} XP, {streak} day streak. You're building something real, {name}.",
    ],
  },
  'quant-trading': {
    streakReminder: [
      "📈 {name}, markets don't wait. Neither does your edge. 5 minutes.",
      "⚡ Every quant trader you're competing with practised today. Did you?",
      "₿ The gap between knowing and doing is practice. Come back.",
    ],
    streakUrgent: [
      "🚨 {name}, {streak} days off. The quant skills you're building fade faster than most. Back to it.",
      "📉 Your streak broke. Your edge doesn't have to. One session right now.",
    ],
    levelComplete: [
      "🏆 {name} just cleared {level}. Quant traders at this level command serious compensation.",
      "⚡ Level complete. You just learned what prop desks spend weeks teaching new hires.",
    ],
    bossApproaching: [
      "🎯 Boss Battle unlocked. Pass this and it's on your portfolio. Real proof of skill.",
    ],
    portfolioEarned: [
      "🏆 Portfolio artifact live. This is verified proof of trading skill — not just a certificate.",
    ],
    weeklyProgress: [
      "📈 {name}: {lessons} lessons, {xp} XP this week. Edge compounds like interest. Keep going.",
    ],
  },
  default: {
    streakReminder: [
      "⚡ {name}, 5 minutes today builds the career you want. Let's go.",
      "🎯 You're {progress}% through your track. Don't stop here.",
      "🔥 Your streak is alive. Keep it going — you're closer than you think.",
    ],
    streakUrgent: [
      "🚨 {name}, {streak} days since your last lesson. The skill you're building is still worth it.",
      "⚠️ Don't let a gap become a habit. One lesson. Right now.",
    ],
    levelComplete: [
      "🏆 Level complete, {name}! You're building something real.",
      "⚡ That's another level done. The skills you're earning can't be taken away.",
    ],
    bossApproaching: [
      "🎯 Your Boss Battle is ready. This is what puts real proof on your portfolio.",
    ],
    portfolioEarned: [
      "🏆 Portfolio artifact earned. Employers can verify this. It's real.",
    ],
    weeklyProgress: [
      "📈 {name}: {lessons} lessons, {xp} XP this week. Consistent beats talented every time.",
    ],
  },
};

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRoleCopy(trackId: string): RoleCopy {
  return ROLE_COPY[trackId] ?? ROLE_COPY.default;
}

// ─── Push notification setup ──────────────────────────────────────────────────

export async function requestPushPermission(): Promise<string | null> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus = existing === 'granted'
      ? existing
      : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== 'granted') return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch { return null; }
}

export async function scheduleDailyReminder(params: {
  userId: string;
  trackId: string;
  userName: string;
  progress: number;
  streak: number;
  hourLocal?: number; // default 19:00 local time
}) {
  const { trackId, userName, progress, streak, hourLocal = 19 } = params;
  const copy = getRoleCopy(trackId);

  const isUrgent = streak === 0; // missed yesterday
  const templates = isUrgent ? copy.streakUrgent : copy.streakReminder;
  const body = fillTemplate(pickRandom(templates), {
    name: userName,
    streak: String(streak),
    progress: String(Math.round(progress)),
  });

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: isUrgent ? '🚨 Come back!' : '⚡ Sifter Skill_Up',
      body,
      sound: true,
      badge: isUrgent ? 1 : 0,
    },
    trigger: {
      hour: hourLocal,
      minute: 0,
      repeats: true,
    } as any,
  });
}

// ─── Server-side notification triggers (SMS + Email via backend) ──────────────

export async function triggerServerNotification(params: {
  userId: string;
  type: 'streak_reminder' | 'streak_urgent' | 'level_complete' | 'boss_approaching' | 'portfolio_earned' | 'weekly_progress' | 'monthly_leaderboard';
  trackId: string;
  userName: string;
  data?: Record<string, string>;
  channels?: Array<'push' | 'sms' | 'email'>;
}) {
  // Queued as offline-aware write — sends when connection available
  await offlineWrite('/api/notifications/trigger', 'POST', params, 'normal');
}

// ─── In-app notification display config ──────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export { getRoleCopy, fillTemplate, pickRandom };
