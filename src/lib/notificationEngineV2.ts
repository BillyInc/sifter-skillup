/**
 * Sifter LevelUp — Notification Engine
 * Push notifications via Expo Push API.
 * Email notifications via Resend.
 * Rate-limited, streak-aware, personalised.
 *
 * Usage:
 *   await notificationEngine.requestPermission();
 *   await notificationEngine.scheduleStreakWarning(hoursLeft);
 *   await notificationEngine.sendEmail('weeklyDigest', { name, streak, xp });
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { NOTIFICATION_CONFIG } from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PushTriggerType =
  | 'streak_warning'        // 4h before midnight, no lesson today
  | 'streak_lost'           // window expired
  | 'streak_milestone'      // 7, 30, 100 day milestones
  | 'daily_reminder'        // gentle daily nudge if no activity
  | 'lesson_complete'       // positive reinforcement (optional / opt-in)
  | 'stage_up';             // worker character evolved

export type EmailTriggerType =
  | 'weeklyDigest'
  | 'streakLost'
  | 'inactivity_7days'
  | 'stageUp'
  | 'welcomeBack';

export interface NotificationState {
  expoPushToken: string | null;
  lastSentAt: Record<PushTriggerType | EmailTriggerType, number>;
  scheduledIds: string[];
  emailOptIn: boolean;
  pushOptIn: boolean;
}

// ─── Storage key ───────────────────────────────────────────────────────────────

const STORAGE_KEY = '@sifter_notifications_v1';

// ─── Default handler (show alert style) ───────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function nowMs(): number {
  return Date.now();
}

function hoursAgo(ms: number): number {
  return (nowMs() - ms) / 3_600_000;
}

function defaultState(): NotificationState {
  return {
    expoPushToken: null,
    lastSentAt: {} as Record<PushTriggerType | EmailTriggerType, number>,
    scheduledIds: [],
    emailOptIn: true,
    pushOptIn: true,
  };
}

// ─── Copy: notification text ───────────────────────────────────────────────────

const PUSH_COPY: Record<PushTriggerType, (ctx?: any) => { title: string; body: string }> = {
  streak_warning: (ctx: { hoursLeft: number; streak: number }) => ({
    title: `🔥 ${ctx.streak}-day streak at risk`,
    body: `${Math.floor(ctx.hoursLeft)}h left today. One lesson keeps it alive.`,
  }),
  streak_lost: (ctx: { streak: number }) => ({
    title: `Streak lost (${ctx.streak} days)`,
    body: 'Start again today — your progress is still here.',
  }),
  streak_milestone: (ctx: { streak: number }) => ({
    title: `🎉 ${ctx.streak}-day streak!`,
    body: "You're building real consistency. Keep it up.",
  }),
  daily_reminder: (_ctx) => ({
    title: '⚡ Your desk is waiting',
    body: 'A 5-minute lesson today keeps the streak alive.',
  }),
  lesson_complete: (ctx: { xp: number }) => ({
    title: `+${ctx.xp} XP earned`,
    body: 'Great work. Come back tomorrow to keep the streak.',
  }),
  stage_up: (ctx: { stageName: string }) => ({
    title: `🎉 You evolved: ${ctx.stageName}`,
    body: 'Your worker character has a new look. Check your profile.',
  }),
};

// ─── Engine ────────────────────────────────────────────────────────────────────

class NotificationEngineClass {
  private state: NotificationState | null = null;
  private loading: Promise<void> | null = null;

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  private async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      this.state = raw ? (JSON.parse(raw) as NotificationState) : defaultState();
    } catch {
      this.state = defaultState();
    }
  }

  async ready(): Promise<void> {
    if (this.state) return;
    if (!this.loading) this.loading = this.load();
    await this.loading;
    this.loading = null;
  }

  private async save(): Promise<void> {
    if (!this.state) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  // ── Rate limit check ───────────────────────────────────────────────────────

  private canSend(type: PushTriggerType | EmailTriggerType): boolean {
    const last = this.state?.lastSentAt?.[type] ?? 0;
    return hoursAgo(last) >= NOTIFICATION_CONFIG.minIntervalHours;
  }

  private markSent(type: PushTriggerType | EmailTriggerType): void {
    if (!this.state) return;
    this.state.lastSentAt[type] = nowMs();
  }

  // ── Permissions ───────────────────────────────────────────────────────────

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    await this.ready();
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      this.state!.expoPushToken = token.data;
      this.state!.pushOptIn = true;
      await this.save();
    } catch {}

    return true;
  }

  getExpoPushToken(): string | null {
    return this.state?.expoPushToken ?? null;
  }

  // ── Push: schedule local ───────────────────────────────────────────────────

  /** Schedule a local notification N seconds from now */
  async scheduleLocal(
    type: PushTriggerType,
    secondsFromNow: number,
    ctx?: any,
  ): Promise<void> {
    await this.ready();
    if (!this.state!.pushOptIn) return;
    if (!this.canSend(type)) return;
    if (Platform.OS === 'web') return;

    const copy = PUSH_COPY[type](ctx);
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: copy.title, body: copy.body },
        trigger: { seconds: secondsFromNow } as any,
      });
      this.state!.scheduledIds.push(id);
      this.markSent(type);
      await this.save();
    } catch {}
  }

  /** Called by StreakEngine when hoursLeft < STREAK.warningHours */
  async scheduleStreakWarning(hoursLeft: number, streak: number): Promise<void> {
    if (hoursLeft <= 0) return;
    const secondsFromNow = Math.max(10, (hoursLeft - 0.25) * 3600); // fire 15min before
    await this.scheduleLocal('streak_warning', secondsFromNow, { hoursLeft, streak });
  }

  async sendStreakLost(streak: number): Promise<void> {
    await this.scheduleLocal('streak_lost', 5, { streak });
  }

  async sendMilestone(streak: number): Promise<void> {
    await this.scheduleLocal('streak_milestone', 2, { streak });
  }

  async sendStageUp(stageName: string): Promise<void> {
    await this.scheduleLocal('stage_up', 2, { stageName });
  }

  /** Cancel all pending local notifications */
  async cancelAll(): Promise<void> {
    await this.ready();
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.state!.scheduledIds = [];
      await this.save();
    } catch {}
  }

  // ── Email: Resend ──────────────────────────────────────────────────────────
  // Fires against your Flask backend which holds the Resend API key.
  // The backend endpoint should accept POST /notifications/email

  async sendEmail(
    type: EmailTriggerType,
    payload: {
      email: string;
      name: string;
      streak?: number;
      xp?: number;
      stageName?: string;
      trackName?: string;
    },
    backendBaseUrl: string,
  ): Promise<void> {
    await this.ready();
    if (!this.state!.emailOptIn) return;
    if (!this.canSend(type)) return;

    try {
      const res = await fetch(`${backendBaseUrl}/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...payload }),
      });
      if (res.ok) {
        this.markSent(type);
        await this.save();
      }
    } catch {}
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  async setEmailOptIn(v: boolean): Promise<void> {
    await this.ready();
    this.state!.emailOptIn = v;
    await this.save();
  }

  async setPushOptIn(v: boolean): Promise<void> {
    await this.ready();
    this.state!.pushOptIn = v;
    await this.save();
  }
}

export const notificationEngine = new NotificationEngineClass();
