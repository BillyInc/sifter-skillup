/**
 * Sifter Skill_Up — In-App Toast Notification System
 *
 * In-app toasts that fire inside the app.
 * Works alongside the existing push notification engine.
 *
 * USAGE:
 *   1. Wrap your app with <ToastProvider> (inside App.tsx, inside NavigationContainer)
 *   2. Call showToast() from anywhere via the useToast() hook
 *   3. The existing notificationEngine.ts calls showToast() for in-app events
 *
 * TOAST TYPES:
 *   success  — level complete, streak milestone, XP gain (green, bottom)
 *   warning  — streak at risk, approaching boss (gold, top)
 *   info     — portfolio pushed, badge earned (indigo, bottom)
 *   streak   — streak maintained (orange flame, top, large)
 *
 * HOW TO WIRE INTO notificationEngine.ts:
 *   Import { triggerInAppToast } from './inAppNotifications'
 *   Call triggerInAppToast({ type, title, body, emoji }) after any lesson/level event
 */

import React, {
  createContext, useContext, useState, useCallback,
  useRef, useEffect,
} from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'warning' | 'info' | 'streak';

export interface ToastMessage {
  id: string;
  type: ToastType;
  emoji: string;
  title: string;
  body?: string;
  durationMs?: number;  // default 3500
  position?: 'top' | 'bottom'; // default determined by type
  action?: { label: string; onPress: () => void };
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

interface ToastContextValue {
  showToast: (msg: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  dismissToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─────────────────────────────────────────────────────────────
// Singleton bridge — lets notificationEngine call showToast
// without needing a hook (since it's not a component)
// ─────────────────────────────────────────────────────────────

let _showToast: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function triggerInAppToast(msg: Omit<ToastMessage, 'id'>) {
  _showToast?.(msg);
}

// ─────────────────────────────────────────────────────────────
// Single Toast Component
// ─────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; textColor: string }> = {
  success: { bg: Colors.greenSoft,   border: Colors.green,      textColor: '#166534' },
  warning: { bg: Colors.goldSoft,    border: Colors.gold,       textColor: '#92400e' },
  info:    { bg: Colors.accentSoft,  border: Colors.accent,     textColor: Colors.accent },
  streak:  { bg: Colors.orangeSoft,  border: Colors.orange,     textColor: '#9a3412' },
};

function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  const isTop = (toast.position ?? (toast.type === 'warning' || toast.type === 'streak' ? 'top' : 'bottom')) === 'top';
  const ts = TYPE_STYLES[toast.type];
  const duration = toast.durationMs ?? 3500;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: isTop ? -120 : 120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }, [isTop, onDismiss, opacity, translateY]);

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(), duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[
        t.container,
        isTop ? t.posTop : t.posBottom,
        { backgroundColor: ts.bg, borderColor: ts.border },
        { transform: [{ translateY }], opacity },
        Shadow.md,
      ]}>
      <TouchableOpacity style={t.inner} onPress={dismiss} activeOpacity={0.9}>
        <Text style={t.emoji}>{toast.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[t.title, { color: ts.textColor }]}>{toast.title}</Text>
          {toast.body && (
            <Text style={[t.body, { color: ts.textColor + 'cc' }]}>{toast.body}</Text>
          )}
        </View>
        {toast.action && (
          <TouchableOpacity
            style={[t.actionBtn, { borderColor: ts.border }]}
            onPress={() => { toast.action!.onPress(); dismiss(); }}>
            <Text style={[t.actionText, { color: ts.textColor }]}>{toast.action.label}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={dismiss} style={t.dismissBtn}>
          <Text style={[t.dismissX, { color: ts.textColor + '80' }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const t = StyleSheet.create({
  container:  {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    zIndex: 9999,
    ...Platform.select({ web: { maxWidth: 420, alignSelf: 'center' as any } }),
  },
  posTop:     { top: Platform.OS === 'ios' ? 56 : 16 },
  posBottom:  { bottom: 100 },   // above tab bar
  inner:      { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  emoji:      { fontSize: 28 },
  title:      { fontSize: FontSize.sm, fontWeight: '900', lineHeight: 18 },
  body:       { fontSize: FontSize.xs, marginTop: 1, lineHeight: 15 },
  actionBtn:  { borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  actionText: { fontSize: FontSize.xs, fontWeight: '800' },
  dismissBtn: { padding: 4 },
  dismissX:   { fontSize: 14, fontWeight: '700' },
});

// ─────────────────────────────────────────────────────────────
// Toast Provider — wrap the app with this
// ─────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => {
      // Max 2 toasts on screen at once — drop oldest
      const next = prev.length >= 2 ? prev.slice(1) : prev;
      return [...next, { ...msg, id }];
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Wire up the singleton bridge
  useEffect(() => {
    _showToast = showToast;
    return () => { _showToast = null; };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {toasts.map(toast => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Pre-built toast helpers — call these from lesson engine,
// portfolio screen, streak tracker, etc.
// ─────────────────────────────────────────────────────────────

export const Toast = {
  levelComplete: (levelName: string, xpEarned: number) =>
    triggerInAppToast({
      type: 'success',
      emoji: '🏆',
      title: `${levelName} complete!`,
      body: `+${xpEarned} XP earned`,
      position: 'bottom',
    }),

  bossDefeated: (islandName: string) =>
    triggerInAppToast({
      type: 'success',
      emoji: '⚡',
      title: `${islandName} island cleared!`,
      body: 'Portfolio artifact unlocked',
      durationMs: 5000,
      position: 'bottom',
    }),

  streakMaintained: (days: number) =>
    triggerInAppToast({
      type: 'streak',
      emoji: '🔥',
      title: `${days}-day streak!`,
      body: 'Keep going — don\'t break it now',
      position: 'top',
    }),

  streakAtRisk: () =>
    triggerInAppToast({
      type: 'warning',
      emoji: '⚠️',
      title: 'Streak at risk!',
      body: 'Complete a lesson before midnight to save it',
      position: 'top',
      durationMs: 6000,
    }),

  portfolioPushed: (platformName: string) =>
    triggerInAppToast({
      type: 'info',
      emoji: '🚀',
      title: 'Portfolio updated',
      body: `Synced to ${platformName} from your Sifter portfolio`,
      position: 'bottom',
    }),

  xpGained: (amount: number, reason: string) =>
    triggerInAppToast({
      type: 'info',
      emoji: '⚡',
      title: `+${amount} XP`,
      body: reason,
      position: 'bottom',
      durationMs: 2500,
    }),
};


