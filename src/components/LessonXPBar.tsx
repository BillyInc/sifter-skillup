/**
 * Sifter Skill_Up — Lesson XP Bar
 * Animated progress bar shown during active lessons.
 * Fills + bounces on correct answer. Pulses on wrong answer.
 * Shows XP earned so far + stage progress.
 *
 * Usage in LessonScreen:
 *   <LessonXPBar
 *     totalXp={user.totalXp}
 *     sessionXp={sessionXp}
 *     correctStreak={correctStreak}
 *     mood={mood}
 *   />
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight,
  AnimPreset, getStageForXp, getXpProgress,
  XP_VALUES,
} from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LessonMood = 'idle' | 'correct' | 'wrong' | 'streak';

export interface LessonXPBarProps {
  totalXp: number;        // user's total XP before this session
  sessionXp: number;      // XP earned so far this lesson session
  correctStreak: number;  // consecutive correct answers in this session
  mood: LessonMood;       // triggers the right animation
  compact?: boolean;      // slim version for tight headers
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LessonXPBar({
  totalXp,
  sessionXp,
  correctStreak,
  mood,
  compact = false,
}: LessonXPBarProps) {
  const { colors } = useTheme();

  const currentXp  = totalXp + sessionXp;
  const stage      = getStageForXp(currentXp);
  const progress   = getXpProgress(currentXp);

  // ── Animations ────────────────────────────────────────────────────────────

  // Bar fill — spring-driven width
  const fillAnim   = useRef(new Animated.Value(getXpProgress(totalXp))).current;
  // Bar scale bounce — vertical squash on correct
  const scaleY     = useRef(new Animated.Value(1)).current;
  // XP badge pop
  const badgeScale = useRef(new Animated.Value(1)).current;
  const badgeAlpha = useRef(new Animated.Value(0)).current;
  // Wrong shake
  const shakeX     = useRef(new Animated.Value(0)).current;
  // Streak glow
  const glowAlpha  = useRef(new Animated.Value(0)).current;

  // Fill to new progress on XP change
  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: progress,
      ...AnimPreset.spring,
    }).start();
  }, [progress]);

  // React to mood changes
  useEffect(() => {
    if (mood === 'correct') {
      // Bounce the bar + pop the XP badge
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleY, { toValue: 1.18, duration: 120, useNativeDriver: true }),
          Animated.spring(scaleY, { toValue: 1, ...AnimPreset.spring }),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.spring(badgeScale, { toValue: 1.4, ...AnimPreset.spring }),
            Animated.timing(badgeAlpha, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]),
          Animated.delay(600),
          Animated.parallel([
            Animated.timing(badgeScale, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(badgeAlpha, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    }

    if (mood === 'wrong') {
      // Shake the bar
      Animated.sequence([
        Animated.timing(shakeX, { toValue:  8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  0, duration: 60, useNativeDriver: true }),
      ]).start();
    }

    if (mood === 'streak') {
      // Glow pulse for consecutive correct answers
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAlpha, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.timing(glowAlpha, { toValue: 0,   duration: 500, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ).start(() => glowAlpha.setValue(0));
    }
  }, [mood, sessionXp]);

  // ── Derived values ────────────────────────────────────────────────────────

  const fillWidth = fillAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  const barColor =
    mood === 'correct' ? colors.xpGreen
    : mood === 'wrong'  ? colors.red
    : mood === 'streak' ? colors.gold
    : colors.accent;

  // ── Render ────────────────────────────────────────────────────────────────

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          { transform: [{ translateX: shakeX }] },
        ]}
      >
        <Animated.View
          style={[
            styles.compactTrack,
            { backgroundColor: colors.bgSecondary, transform: [{ scaleY }] },
          ]}
        >
          <Animated.View
            style={[styles.compactFill, { backgroundColor: barColor, width: fillWidth }]}
          />
          {/* Glow overlay */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: barColor, borderRadius: Radius.full, opacity: glowAlpha },
            ]}
          />
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stage label */}
      <View style={styles.topRow}>
        <Text style={[styles.stageLabel, { color: colors.accent }]}>
          ⚡ {stage.name}
        </Text>
        <View style={styles.xpRow}>
          <Text style={[styles.xpText, { color: colors.textSoft }]}>
            {currentXp} XP
          </Text>
          {/* Session XP badge — pops on correct */}
          <Animated.View
            style={[
              styles.sessionBadge,
              { backgroundColor: colors.xpGreen, opacity: badgeAlpha, transform: [{ scale: badgeScale }] },
            ]}
          >
            <Text style={styles.sessionBadgeText}>+{XP_VALUES.lessonComplete}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Bar */}
      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <Animated.View
          style={[
            styles.track,
            { backgroundColor: colors.bgSecondary, transform: [{ scaleY }] },
          ]}
        >
          {/* Fill */}
          <Animated.View
            style={[styles.fill, { backgroundColor: barColor, width: fillWidth }]}
          />
          {/* Streak glow overlay */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: barColor, borderRadius: Radius.full, opacity: glowAlpha },
            ]}
          />
          {/* Shine */}
          <Animated.View
            pointerEvents="none"
            style={[styles.shine, { opacity: fillAnim.interpolate({ inputRange: [0, 0.05], outputRange: [0, 0.3] }) }]}
          />
        </Animated.View>
      </Animated.View>

      {/* Streak indicator */}
      {correctStreak >= 2 && (
        <Text style={[styles.streakLabel, { color: colors.gold }]}>
          🔥 {correctStreak} in a row!
        </Text>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:        { gap: Spacing.xs },
  topRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stageLabel:       { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  xpRow:            { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  xpText:           { fontSize: FontSize.xs },
  sessionBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  sessionBadgeText: { fontSize: 10, fontWeight: FontWeight.black, color: '#fff' },

  track:            { height: 10, borderRadius: Radius.full, overflow: 'hidden', position: 'relative' },
  fill:             { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: Radius.full },
  shine:            { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: '#fff', borderTopLeftRadius: Radius.full, borderTopRightRadius: Radius.full },
  streakLabel:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textAlign: 'right' },

  // Compact
  compactContainer: { height: 5 },
  compactTrack:     { flex: 1, borderRadius: Radius.full, overflow: 'hidden', position: 'relative' },
  compactFill:      { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: Radius.full },
});
