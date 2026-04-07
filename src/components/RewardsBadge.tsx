/**
 * Sifter Skill_Up — Rewards Badge Component
 * Displays a badge in a grid cell or as a large detail card.
 * Rarity glow: common=grey, rare=blue, epic=purple, legendary=gold shimmer.
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';
import { BADGE_RARITY_COLORS, BADGE_RARITY_LABELS } from '../theme/rewards';
import type { Badge } from '../types/social';

interface RewardsBadgeProps {
  badge:    Badge;
  size?:    'sm' | 'md' | 'lg';
  onPress?: (badge: Badge) => void;
  locked?:  boolean;
}

export function RewardsBadge({ badge, size = 'md', onPress, locked = false }: RewardsBadgeProps) {
  const { colors } = useTheme();
  const shimmer    = useRef(new Animated.Value(0)).current;
  const glowColor  = BADGE_RARITY_COLORS[badge.rarity] ?? colors.textMuted;

  const SIZES = { sm: 48, md: 64, lg: 88 };
  const EMOJI_SIZES = { sm: 22, md: 30, lg: 42 };
  const dim = SIZES[size];
  const emojiSize = EMOJI_SIZES[size];

  // Legendary shimmer animation
  useEffect(() => {
    if (badge.rarity !== 'legendary' || locked) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [badge.rarity, locked]);

  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] });

  return (
    <TouchableOpacity
      style={[
        styles.badgeCell,
        { width: dim, height: dim, borderRadius: dim / 4 },
        locked
          ? { backgroundColor: colors.bgSecondary }
          : { backgroundColor: glowColor + '18', borderColor: glowColor + '40', borderWidth: 1.5 },
        !locked && badge.rarity !== 'common' ? Shadow.sm : null,
      ]}
      onPress={() => onPress?.(badge)}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      {/* Legendary shimmer */}
      {!locked && badge.rarity === 'legendary' && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: dim / 4, backgroundColor: glowColor, opacity: shimmerOpacity },
          ]}
        />
      )}

      <Text style={[styles.badgeEmoji, { fontSize: emojiSize, opacity: locked ? 0.3 : 1 }]}>
        {locked ? '🔒' : badge.emoji}
      </Text>

      {size !== 'sm' && !locked && (
        <Text style={[styles.rarityDot, { color: glowColor }]}>●</Text>
      )}
    </TouchableOpacity>
  );
}

/** Full badge detail card — shown in a modal or detail screen. */
export function BadgeDetailCard({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const { colors } = useTheme();
  const glowColor  = BADGE_RARITY_COLORS[badge.rarity];
  const earnedDate = badge.earned_at ? new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <View style={[styles.detailCard, { backgroundColor: colors.card }, Shadow.lg]}>
      <View style={[styles.detailGlow, { backgroundColor: glowColor + '18' }]}>
        <Text style={styles.detailEmoji}>{badge.emoji}</Text>
      </View>
      <Text style={[styles.detailName, { color: colors.text }]}>{badge.name}</Text>
      <View style={[styles.rarityTag, { backgroundColor: glowColor + '20' }]}>
        <Text style={[styles.rarityLabel, { color: glowColor }]}>{BADGE_RARITY_LABELS[badge.rarity]}</Text>
      </View>
      <Text style={[styles.detailDesc, { color: colors.textSoft }]}>{badge.description}</Text>
      {earnedDate && (
        <Text style={[styles.earnedDate, { color: colors.textMuted }]}>Earned {earnedDate}</Text>
      )}
      <TouchableOpacity style={[styles.detailClose, { backgroundColor: colors.accent }]} onPress={onClose}>
        <Text style={{ color: '#fff', fontWeight: FontWeight.bold }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeCell:     { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badgeEmoji:    { textAlign: 'center' },
  rarityDot:     { fontSize: 8, marginTop: 2 },
  detailCard:    { borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: Spacing.md, maxWidth: 320, alignSelf: 'center' },
  detailGlow:    { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  detailEmoji:   { fontSize: 48 },
  detailName:    { fontSize: FontSize.xl, fontWeight: FontWeight.black, textAlign: 'center' },
  rarityTag:     { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  rarityLabel:   { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  detailDesc:    { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  earnedDate:    { fontSize: FontSize.xs },
  detailClose:   { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.lg, marginTop: Spacing.xs },
});
