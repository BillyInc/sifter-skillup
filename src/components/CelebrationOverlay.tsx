/**
 * Sifter Skill_Up — Celebration Overlay
 * Full-screen celebration triggered on lesson complete, lab complete, stage-up.
 * Stitch palette confetti + The Bolt + XP burst. Auto-dismisses after 3.5s.
 *
 * Usage:
 *   <CelebrationOverlay
 *     visible={showCelebration}
 *     type="lesson"
 *     xpEarned={10}
 *     stageName="Associate"        // only on stage-up
 *     stageUp={false}
 *     onDismiss={() => setShowCelebration(false)}
 *   />
 */

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Dimensions, Platform,
} from 'react-native';
import { TheBolt } from './CharacterSystem';
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  AnimPreset,
} from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CelebrationEventType = 'lesson' | 'lab' | 'boss' | 'stage_up' | 'streak' | 'daily_goal';

export interface CelebrationOverlayProps {
  visible: boolean;
  type: CelebrationEventType;
  xpEarned?: number;
  stageName?: string;         // populated on stage_up
  stageUp?: boolean;
  streak?: number;            // for streak milestone
  onDismiss: () => void;
  autoDismissMs?: number;     // default 3500
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get('window');
const NUM_CONFETTI = 28;

// Stitch palette confetti colours
const CONFETTI_COLORS = [
  '#5B5FCF', '#8B8FFF', '#58CC02', '#FF9600',
  '#F59E0B', '#EC4899', '#0EA5E9', '#10B981',
];

// ─── Copy per event type ───────────────────────────────────────────────────────

const EVENT_COPY: Record<CelebrationEventType, {
  headline: string;
  sub: string;
  emoji: string;
}> = {
  lesson:      { headline: 'Lesson complete!',    sub: 'Keep that streak alive.',                emoji: '⚡' },
  lab:         { headline: 'Lab complete!',        sub: 'Real skill. Real XP.',                  emoji: '🔬' },
  boss:        { headline: 'Boss level cleared!',  sub: 'You just proved you get it.',           emoji: '🏆' },
  stage_up:    { headline: 'You evolved.',         sub: "Your character has a new look.",        emoji: '🌟' },
  streak:      { headline: 'Streak milestone!',    sub: "Consistency is the skill.",             emoji: '🔥' },
  daily_goal:  { headline: 'Daily goal hit!',      sub: "That's what consistency looks like.",  emoji: '🎯' },
};

// ─── Confetti particle ────────────────────────────────────────────────────────

function ConfettiParticle({ index, delay }: { index: number; delay: number }) {
  const x     = useRef(new Animated.Value(Math.random() * W)).current;
  const y     = useRef(new Animated.Value(-20)).current;
  const rot   = useRef(new Animated.Value(0)).current;
  const alpha = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size  = 8 + Math.random() * 8;
  const targetX = (Math.random() - 0.5) * 120;
  const duration = 1800 + Math.random() * 800;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, {
          toValue: H * 0.7 + Math.random() * 200,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: (x as any)._value + targetX,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(rot, {
          toValue: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 4),
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(alpha, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(alpha, {
            toValue: 0,
            duration: 500,
            delay: duration - 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scale, {
          toValue: 1,
          ...AnimPreset.spring,
        }),
      ]),
    ]).start();
  }, []);

  const rotate = rot.interpolate({
    inputRange: [-4, 4],
    outputRange: ['-720deg', '720deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        backgroundColor: color,
        opacity: alpha,
        transform: [
          { translateX: x },
          { translateY: y },
          { rotate },
          { scale },
        ],
      }}
    />
  );
}

// ─── XP burst ─────────────────────────────────────────────────────────────────

function XPBurst({ xp, visible }: { xp: number; visible: boolean }) {
  const { colors } = useTheme();
  const y     = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const alpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    y.setValue(0);
    scale.setValue(0);
    alpha.setValue(0);

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, ...AnimPreset.spring }),
        Animated.timing(alpha, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(y, { toValue: -30, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.timing(alpha, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.xpBurst,
        { opacity: alpha, transform: [{ translateY: y }, { scale }] },
        Shadow.glowGreen,
      ]}
    >
      <Text style={[styles.xpBurstText, { color: colors.xpGreen }]}>
        +{xp} XP
      </Text>
    </Animated.View>
  );
}

// ─── Main overlay ──────────────────────────────────────────────────────────────

export default function CelebrationOverlay({
  visible,
  type,
  xpEarned = 0,
  stageName,
  stageUp = false,
  streak,
  onDismiss,
  autoDismissMs = 3500,
}: CelebrationOverlayProps) {
  const { colors, isDark } = useTheme();

  const containerScale = useRef(new Animated.Value(0.9)).current;
  const containerAlpha = useRef(new Animated.Value(0)).current;
  const cardScale      = useRef(new Animated.Value(0.7)).current;
  const cardAlpha      = useRef(new Animated.Value(0)).current;

  const copy = EVENT_COPY[type];

  // Auto-dismiss timer
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(t);
  }, [visible, autoDismissMs]);

  // Entrance animation
  useEffect(() => {
    if (!visible) return;
    containerScale.setValue(0.9);
    containerAlpha.setValue(0);
    cardScale.setValue(0.7);
    cardAlpha.setValue(0);

    Animated.parallel([
      Animated.timing(containerAlpha, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(containerScale, { toValue: 1, ...AnimPreset.springGentle }),
      Animated.sequence([
        Animated.delay(150),
        Animated.spring(cardScale, { toValue: 1, ...AnimPreset.spring }),
        Animated.timing(cardAlpha, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible]);

  const confettiItems = useMemo(() =>
    Array.from({ length: NUM_CONFETTI }, (_, i) => ({ id: i, delay: i * 60 })),
    [],
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: containerAlpha, transform: [{ scale: containerScale }] },
        ]}
      >
        {/* Backdrop tint */}
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <View style={styles.backdropFill} />
        </TouchableOpacity>

        {/* Confetti */}
        {confettiItems.map(item => (
          <ConfettiParticle key={item.id} index={item.id} delay={item.delay} />
        ))}

        {/* Card */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              transform: [{ scale: cardScale }],
              opacity: cardAlpha,
            },
            Shadow.lg,
          ]}
        >
          {/* The Bolt */}
          <View style={styles.boltWrap}>
            <TheBolt size={100} animate />
          </View>

          {/* Headline */}
          <Text style={styles.emoji}>{copy.emoji}</Text>
          <Text style={[styles.headline, { color: colors.text }]}>
            {stageUp && stageName ? `You're now a ${stageName}` : copy.headline}
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            {stageUp && stageName ? copy.sub : copy.sub}
          </Text>

          {/* Streak badge */}
          {streak && streak > 0 && (
            <View style={[styles.streakRow, { backgroundColor: colors.orangeSoft }]}>
              <Text style={[styles.streakText, { color: colors.orange }]}>
                🔥 {streak}-day streak
              </Text>
            </View>
          )}

          {/* XP burst */}
          {xpEarned > 0 && <XPBurst xp={xpEarned} visible={visible} />}

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: colors.accent }]}
            onPress={onDismiss}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,30,0.75)',
  },
  card: {
    width: Math.min(W - Spacing.xl * 2, 360),
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 10,
  },
  boltWrap: {
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 40,
  },
  headline: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    textAlign: 'center',
  },
  sub: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  streakRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  streakText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  xpBurst: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
  },
  xpBurstText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  continueBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    width: '100%',
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: '#fff',
  },
});
