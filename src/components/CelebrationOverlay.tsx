/**
 * Sifter Skill_Up — Celebration Overlay
 *
 * Duolingo-style celebration shown on:
 *   - Level complete
 *   - Boss Battle pass
 *   - Portfolio artifact earned
 *   - Streak milestone
 *   - Leaderboard rank up
 *
 * Animated: confetti burst + scale-in card + XP counter.
 * Non-blocking: auto-dismisses after 4s or on tap.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Dimensions, Modal,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';

const { width: W, height: H } = Dimensions.get('window');
const CONFETTI_COUNT = 40;

interface ConfettiPiece {
  x: number; color: string; delay: number; size: number;
}

type CelebrationVariant =
  | 'level_complete'
  | 'boss_pass'
  | 'portfolio_earned'
  | 'streak_milestone'
  | 'rank_up'
  | 'lesson_perfect';

interface Props {
  visible: boolean;
  variant: CelebrationVariant;
  title: string;
  subtitle?: string;
  xp?: number;
  onDismiss: () => void;
  onShare?: () => void;
}

const VARIANT_CONFIG: Record<CelebrationVariant, { emoji: string; color: string; label: string }> = {
  level_complete:    { emoji: '🏆', color: Colors.gold,   label: 'LEVEL COMPLETE' },
  boss_pass:         { emoji: '⚡', color: Colors.accent, label: 'BOSS DEFEATED' },
  portfolio_earned:  { emoji: '🎯', color: '#10b981',     label: 'PORTFOLIO ARTIFACT EARNED' },
  streak_milestone:  { emoji: '🔥', color: '#f97316',     label: 'STREAK MILESTONE' },
  rank_up:           { emoji: '📈', color: '#8b5cf6',     label: 'RANK UP' },
  lesson_perfect:    { emoji: '⭐', color: Colors.gold,   label: 'PERFECT!' },
};

const CONFETTI_COLORS = ['#6366f1','#f59e0b','#22c55e','#ef4444','#06b6d4','#f97316','#8b5cf6'];

export default function CelebrationOverlay({ visible, variant, title, subtitle, xp, onDismiss, onShare }: Props) {
  const cfg = VARIANT_CONFIG[variant];
  const scale  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [displayXp, setDisplayXp] = useState(0);
  const [confetti] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      x: Math.random() * W,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 400,
      size: 6 + Math.random() * 8,
    }))
  );
  const confettiAnims = useRef(confetti.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) return;

    // Reset
    scale.setValue(0); opacity.setValue(0); xpAnim.setValue(0);
    confettiAnims.forEach(a => a.setValue(0));

    // Card entrance
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Confetti fall
    confettiAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200 + Math.random() * 600,
        delay: confetti[i].delay,
        useNativeDriver: true,
      }).start();
    });

    // XP counter
    if (xp) {
      Animated.timing(xpAnim, { toValue: xp, duration: 1000, delay: 300, useNativeDriver: false }).start();
      xpAnim.addListener(({ value }) => setDisplayXp(Math.round(value)));
    }

    // Auto-dismiss after 5s
    const timer = setTimeout(onDismiss, 5000);
    return () => { clearTimeout(timer); xpAnim.removeAllListeners(); };
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss}>

        {/* Confetti */}
        {confetti.map((piece, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiPiece,
              {
                left: piece.x,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.size / 2,
                transform: [{
                  translateY: confettiAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, H + 50],
                  }),
                }],
                opacity: confettiAnims[i].interpolate({
                  inputRange: [0, 0.8, 1],
                  outputRange: [1, 1, 0],
                }),
              },
            ]}
          />
        ))}

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          {/* Label badge */}
          <View style={[styles.labelBadge, { backgroundColor: cfg.color }]}>
            <Text style={styles.labelText}>{cfg.label}</Text>
          </View>

          <Text style={styles.emoji}>{cfg.emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {xp !== undefined && (
            <View style={[styles.xpBadge, { backgroundColor: cfg.color + '22' }]}>
              <Text style={[styles.xpText, { color: cfg.color }]}>+{displayXp} XP</Text>
            </View>
          )}

          <View style={styles.btnRow}>
            {onShare && (
              <TouchableOpacity style={[styles.shareBtn, { borderColor: cfg.color }]} onPress={onShare}>
                <Text style={[styles.shareBtnText, { color: cfg.color }]}>Share 🚀</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.continueBtn, { backgroundColor: cfg.color }]} onPress={onDismiss}>
              <Text style={styles.continueBtnText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  confettiPiece: { position: 'absolute', top: 0 },
  card: {
    backgroundColor: '#fff', borderRadius: Radius.xl,
    padding: Spacing.xxxl, alignItems: 'center',
    width: W * 0.82, ...Shadow.md,
  },
  labelBadge: {
    borderRadius: Radius.full, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs, marginBottom: Spacing.md,
  },
  labelText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  emoji: { fontSize: 64, marginBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.md },
  xpBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginBottom: Spacing.xl },
  xpText: { fontSize: FontSize.xl, fontWeight: '900' },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  shareBtn: { flex: 1, borderWidth: 2, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  shareBtnText: { fontWeight: '800', fontSize: FontSize.sm },
  continueBtn: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
});
