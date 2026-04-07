/**
 * Sifter Skill_Up — Streak Urgency Banner
 * Shown in-app when streak is at risk (< 4h remaining, not done today).
 * Shakes periodically to grab attention. Tapping dismisses for the session.
 *
 * Two variants:
 *   'banner'  — full-width strip at the top of HomeScreen / FeedScreen
 *   'compact' — small pill for LessonScreen header
 *
 * Usage:
 *   <StreakUrgencyBanner
 *     status={streakStatus}
 *     variant="banner"
 *     onPress={() => navigation.navigate('Map')}
 *   />
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, AnimPreset,
} from '../theme';
import type { StreakStatus } from '../lib/StreakEngine';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface StreakUrgencyBannerProps {
  status: StreakStatus;
  variant?: 'banner' | 'compact';
  onPress?: () => void;
  onDismiss?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StreakUrgencyBanner({
  status,
  variant = 'banner',
  onPress,
  onDismiss,
}: StreakUrgencyBannerProps) {
  const { colors }   = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const shakeAnim    = useRef(new Animated.Value(0)).current;
  const alphaAnim    = useRef(new Animated.Value(1)).current;
  const scaleAnim    = useRef(new Animated.Value(0.9)).current;

  // Don't show if: done today, lost already, dismissed this session, or safe
  const shouldShow = !dismissed &&
    !status.completedToday &&
    !status.isLost &&
    (status.isAtRisk || status.hoursLeft <= 6);

  // Entrance animation
  useEffect(() => {
    if (!shouldShow) return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, ...AnimPreset.spring }),
      Animated.timing(alphaAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [shouldShow]);

  // Periodic shake — every 30s if at risk
  useEffect(() => {
    if (!shouldShow || !status.isAtRisk) return;

    const shake = () => {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  5, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  4, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0, duration: 80, useNativeDriver: true }),
      ]).start();
    };

    // Shake on mount
    shake();
    // Shake every 25 seconds
    const interval = setInterval(shake, 25000);
    return () => clearInterval(interval);
  }, [shouldShow, status.isAtRisk]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(alphaAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setDismissed(true);
      onDismiss?.();
    });
  };

  if (!shouldShow) return null;

  // ── Copy based on urgency ─────────────────────────────────────────────────

  const hours = Math.floor(status.hoursLeft);
  const mins  = Math.floor((status.hoursLeft - hours) * 60);

  const timeStr = hours > 0
    ? `${hours}h ${mins > 0 ? `${mins}m ` : ''}left`
    : `${mins}m left`;

  const urgencyLabel = status.isAtRisk
    ? `⚠️ ${timeStr} to keep your ${status.streak}-day streak!`
    : `🔥 Do a lesson before midnight — ${timeStr}`;

  const bgColor   = status.isAtRisk ? colors.orangeSoft : colors.goldSoft;
  const textColor = status.isAtRisk ? colors.orange     : colors.gold;
  const ctaLabel  = 'Do a lesson now →';

  // ── Compact pill ──────────────────────────────────────────────────────────

  if (variant === 'compact') {
    return (
      <Animated.View
        style={{
          opacity: alphaAnim,
          transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[styles.compactPill, { backgroundColor: bgColor }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={[styles.compactText, { color: textColor }]}>
            🔥 {status.streak} · {timeStr}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Full banner ───────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: bgColor, opacity: alphaAnim, transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Text style={[styles.bannerEmoji]}>{status.isAtRisk ? '⚠️' : '🔥'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.bannerText, { color: textColor }]}>{urgencyLabel}</Text>
        <Text style={[styles.bannerSub, { color: textColor }]}>
          Your {status.streak}-day streak is on the line.
        </Text>
      </View>

      <View style={styles.bannerActions}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: textColor }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Text style={[styles.dismissText, { color: textColor }]}>Later</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: Radius.xl,
  },
  bannerEmoji:    { fontSize: 24 },
  bannerText:     { fontSize: FontSize.sm, fontWeight: FontWeight.black, lineHeight: 18 },
  bannerSub:      { fontSize: FontSize.xs, marginTop: 2, opacity: 0.8 },
  bannerActions:  { alignItems: 'flex-end', gap: Spacing.xs },
  ctaBtn:         { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full },
  ctaBtnText:     { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: '#fff' },
  dismissBtn:     { paddingHorizontal: 4, paddingVertical: 2 },
  dismissText:    { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, opacity: 0.7 },

  compactPill:    { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  compactText:    { fontSize: 11, fontWeight: FontWeight.black },
});
