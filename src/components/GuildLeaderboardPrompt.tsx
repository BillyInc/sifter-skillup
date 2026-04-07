/**
 * Sifter Skill_Up — Guild Leaderboard Prompt
 * Shows the user's current guild rank and the XP gap to the next position.
 * Creates social competition urgency without them having to open the leaderboard.
 *
 * Variants:
 *   'banner'  — full card, shown on HomeScreen
 *   'inline'  — compact strip, shown in lesson results / lesson header
 *
 * Data comes from your Supabase guild_leaderboard table.
 * Pass in the pre-fetched leaderboard slice or let the hook fetch it.
 *
 * Usage:
 *   <GuildLeaderboardPrompt
 *     userXp={2450}
 *     userRank={4}
 *     aboveEntry={{ rank: 3, name: 'cryptodev', xp: 2510 }}
 *     belowEntry={{ rank: 5, name: 'defi_alice', xp: 2380 }}
 *     onPress={() => navigation.navigate('Guild')}
 *   />
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, AnimPreset, Shadow,
} from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  name: string;         // display name or handle
  xp: number;
  avatar?: string;      // emoji avatar
}

export interface GuildLeaderboardPromptProps {
  userXp: number;
  userRank: number;
  userAvatar?: string;
  guildName?: string;
  aboveEntry?: LeaderboardEntry | null;   // the person just above you
  belowEntry?: LeaderboardEntry | null;   // the person just below you
  variant?: 'banner' | 'inline';
  onPress?: () => void;
}

// ─── XP Gap bar ───────────────────────────────────────────────────────────────

function XpGapBar({
  gapXp,
  maxXp,
  color,
}: {
  gapXp: number;
  maxXp: number;
  color: string;
}) {
  const { colors } = useTheme();
  const fillAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show how CLOSE they are — so fill = 1 - (gap/max)
    const filled = Math.max(0, Math.min(1, 1 - gapXp / maxXp));
    Animated.spring(fillAnim, { toValue: filled, ...AnimPreset.spring }).start();
  }, [gapXp, maxXp]);

  const width = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.gapBarTrack, { backgroundColor: colors.bgSecondary }]}>
      <Animated.View style={[styles.gapBarFill, { backgroundColor: color, width }]} />
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuildLeaderboardPrompt({
  userXp,
  userRank,
  userAvatar = '⚡',
  guildName = 'your guild',
  aboveEntry,
  belowEntry,
  variant = 'banner',
  onPress,
}: GuildLeaderboardPromptProps) {
  const { colors } = useTheme();
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const enterAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.spring(enterAnim, { toValue: 1, ...AnimPreset.spring }).start();

    // Pulse the CTA button if close to overtaking
    if (aboveEntry && aboveEntry.xp - userXp <= 30) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, ...AnimPreset.pulse }),
          Animated.timing(pulseAnim, { toValue: 1,    ...AnimPreset.pulse }),
        ])
      ).start();
    }
  }, [aboveEntry?.xp, userXp]);

  if (!aboveEntry && !belowEntry) return null;

  const gapToAbove = aboveEntry ? aboveEntry.xp - userXp : 0;
  const gapBelow   = belowEntry ? userXp - belowEntry.xp : 0;
  const maxGap     = Math.max(gapToAbove, 200); // reference scale

  const urgentClose = aboveEntry && gapToAbove <= 30;
  const accentColor = urgentClose ? colors.gold : colors.accent;

  // ── Inline variant ────────────────────────────────────────────────────────

  if (variant === 'inline') {
    if (!aboveEntry) return null;
    return (
      <TouchableOpacity
        style={[styles.inlinePill, { backgroundColor: accentColor + '18' }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={[styles.inlineText, { color: accentColor }]}>
          {urgentClose ? '🔥 ' : ''}
          {gapToAbove} XP from #{aboveEntry.rank} {aboveEntry.name}
        </Text>
        <Text style={[styles.inlineArrow, { color: accentColor }]}>→</Text>
      </TouchableOpacity>
    );
  }

  // ── Banner variant ────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: colors.card, opacity: enterAnim, transform: [{ scale: enterAnim }] },
        Shadow.sm,
      ]}
    >
      {/* Header */}
      <View style={styles.bannerHeader}>
        <Text style={[styles.guildName, { color: colors.textMuted }]}>
          {guildName.toUpperCase()} · WEEK RANK
        </Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.viewAll, { color: accentColor }]}>View leaderboard →</Text>
        </TouchableOpacity>
      </View>

      {/* Rank stack: above → you → below */}
      <View style={styles.rankStack}>

        {/* Person above */}
        {aboveEntry && (
          <View style={[styles.rankRow, styles.rankRowAbove]}>
            <Text style={[styles.rankNum, { color: colors.textMuted }]}>#{aboveEntry.rank}</Text>
            <Text style={styles.rankAvatar}>{aboveEntry.avatar ?? '👤'}</Text>
            <Text style={[styles.rankName, { color: colors.textSoft }]}>{aboveEntry.name}</Text>
            <Text style={[styles.rankXp, { color: colors.textMuted }]}>{aboveEntry.xp.toLocaleString()} XP</Text>
            <View style={[styles.gapTag, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.gapTagText, { color: urgentClose ? colors.gold : colors.textMuted }]}>
                {gapToAbove > 0 ? `+${gapToAbove}` : '—'}
              </Text>
            </View>
          </View>
        )}

        {/* XP gap bar (shows how close you are to the person above) */}
        {aboveEntry && gapToAbove > 0 && (
          <View style={styles.gapBarRow}>
            <XpGapBar gapXp={gapToAbove} maxXp={maxGap} color={accentColor} />
            <Text style={[styles.gapLabel, { color: accentColor }]}>
              {urgentClose ? `🔥 Only ${gapToAbove} XP away!` : `${gapToAbove} XP to #${aboveEntry.rank}`}
            </Text>
          </View>
        )}

        {/* You */}
        <Animated.View
          style={[
            styles.rankRow,
            styles.rankRowYou,
            { backgroundColor: accentColor + '15', borderColor: accentColor + '40' },
          ]}
        >
          <Text style={[styles.rankNum, { color: accentColor }]}>#{userRank}</Text>
          <Text style={styles.rankAvatar}>{userAvatar}</Text>
          <Text style={[styles.rankName, { color: accentColor, fontWeight: FontWeight.black }]}>You</Text>
          <Text style={[styles.rankXp, { color: accentColor }]}>{userXp.toLocaleString()} XP</Text>
        </Animated.View>

        {/* Person below */}
        {belowEntry && (
          <View style={[styles.rankRow, styles.rankRowBelow]}>
            <Text style={[styles.rankNum, { color: colors.textMuted }]}>#{belowEntry.rank}</Text>
            <Text style={styles.rankAvatar}>{belowEntry.avatar ?? '👤'}</Text>
            <Text style={[styles.rankName, { color: colors.textSoft }]}>{belowEntry.name}</Text>
            <Text style={[styles.rankXp, { color: colors.textMuted }]}>{belowEntry.xp.toLocaleString()} XP</Text>
            <View style={[styles.gapTag, { backgroundColor: colors.greenSoft }]}>
              <Text style={[styles.gapTagText, { color: colors.green }]}>
                {gapBelow > 0 ? `+${gapBelow}` : '—'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* CTA */}
      {aboveEntry && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: accentColor }]}
            onPress={onPress}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>
              {urgentClose
                ? `🔥 ${gapToAbove} XP to overtake ${aboveEntry.name} — do a lesson`
                : `Do a lesson to climb to #${aboveEntry.rank}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  banner:       { borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.md },
  bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  guildName:    { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  viewAll:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  rankStack:    { gap: Spacing.xs },

  rankRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  rankRowAbove: {},
  rankRowBelow: {},
  rankRowYou:   { borderRadius: Radius.lg, borderWidth: 1.5, paddingVertical: Spacing.sm },

  rankNum:      { fontSize: FontSize.xs, fontWeight: FontWeight.black, width: 28, textAlign: 'right' },
  rankAvatar:   { fontSize: 18 },
  rankName:     { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  rankXp:       { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  gapTag:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  gapTagText:   { fontSize: 10, fontWeight: FontWeight.black },

  gapBarRow:    { paddingHorizontal: Spacing.lg, gap: 4 },
  gapBarTrack:  { height: 5, borderRadius: Radius.full, overflow: 'hidden' },
  gapBarFill:   { height: '100%', borderRadius: Radius.full },
  gapLabel:     { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  ctaBtn:       { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  ctaBtnText:   { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#fff', textAlign: 'center' },

  inlinePill:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  inlineText:   { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  inlineArrow:  { fontSize: 14, fontWeight: FontWeight.black },
});
