/**
 * Sifter LevelUp — Challenge Card
 * Displays a monthly challenge in the ChallengeScreen list.
 * Adapts: list (mobile/narrow), grid (web wide).
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';
import { SUBMISSION_TYPE_LABELS } from '../theme/rewards';
import { challengeEngine } from '../lib/challengeEngine';
import type { Challenge } from '../types/social';

interface ChallengeCardProps {
  challenge:   Challenge;
  isJoined?:   boolean;
  needsAccept?:boolean;
  compact?:    boolean;
  onPress:     (c: Challenge) => void;
  onAccept?:   (c: Challenge) => void;
}

export default function ChallengeCard({
  challenge, isJoined = false, needsAccept = false,
  compact = false, onPress, onAccept,
}: ChallengeCardProps) {
  const { colors } = useTheme();
  const deadline   = challengeEngine.formatDeadline(challenge.end_date);
  const subLabel   = SUBMISSION_TYPE_LABELS[challenge.submission_type] ?? challenge.submission_type;

  const statusColor =
    challenge.status === 'active'   ? colors.accent
    : challenge.status === 'voting' ? colors.gold
    : challenge.status === 'open'   ? colors.green
    : colors.textMuted;

  const statusLabel =
    challenge.status === 'active'   ? '🟢 Active'
    : challenge.status === 'voting' ? '🗳️ Voting'
    : challenge.status === 'open'   ? '📢 Open'
    : challenge.status === 'complete' ? '✅ Complete'
    : '—';

  const reward = challenge.reward;
  const rewardStr = [
    reward.xp ? `+${reward.xp} XP` : null,
    reward.merch_credits ? `+${reward.merch_credits} Credits` : null,
    reward.token_amount && reward.token_currency !== 'platform_points'
      ? `+${reward.token_amount} ${reward.token_currency}` : null,
    reward.cash_cents ? `+$${(reward.cash_cents / 100).toFixed(0)}` : null,
  ].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        compact ? styles.cardCompact : styles.cardFull,
        { backgroundColor: colors.card, borderColor: isJoined ? colors.accent + '60' : colors.border },
        !compact && Shadow.sm,
      ]}
      onPress={() => onPress(challenge)}
      activeOpacity={0.85}
    >
      {/* Status + sponsor row */}
      <View style={styles.topRow}>
        <Text style={[styles.statusBadge, { color: statusColor }]}>{statusLabel}</Text>
        {challenge.sponsor_name && (
          <Text style={[styles.sponsor, { color: colors.textMuted }]}>
            Sponsored by {challenge.sponsor_name}
          </Text>
        )}
        {isJoined && <Text style={[styles.joinedBadge, { color: colors.accent }]}>✓ Joined</Text>}
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={compact ? 1 : 2}>
        {challenge.title}
      </Text>

      {!compact && (
        <Text style={[styles.brief, { color: colors.textSoft }]} numberOfLines={3}>
          {challenge.brief}
        </Text>
      )}

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{subLabel}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>⏱ {deadline}</Text>
      </View>

      {/* Reward strip */}
      {rewardStr ? (
        <View style={[styles.rewardStrip, { backgroundColor: colors.goldSoft }]}>
          <Text style={[styles.rewardText, { color: colors.gold }]}>🏆 Winners: {rewardStr}</Text>
        </View>
      ) : null}

      {/* Accept CTA — shown only when user has invite but hasn't accepted */}
      {needsAccept && onAccept && (
        <TouchableOpacity
          style={[styles.acceptBtn, { backgroundColor: colors.accent }]}
          onPress={(e) => { e.stopPropagation?.(); onAccept(challenge); }}
        >
          <Text style={styles.acceptBtnText}>⚡ Accept Invite — 48h left</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:         { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden' },
  cardFull:     { padding: Spacing.lg, gap: Spacing.sm },
  cardCompact:  { padding: Spacing.md, gap: Spacing.xs },
  topRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  statusBadge:  { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  sponsor:      { fontSize: FontSize.xs },
  joinedBadge:  { fontSize: FontSize.xs, fontWeight: FontWeight.black, marginLeft: 'auto' },
  title:        { fontSize: FontSize.md, fontWeight: FontWeight.black, lineHeight: 22 },
  brief:        { fontSize: FontSize.sm, lineHeight: 20 },
  metaRow:      { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  meta:         { fontSize: FontSize.xs },
  rewardStrip:  { borderRadius: Radius.md, padding: Spacing.sm, paddingHorizontal: Spacing.md, alignSelf: 'flex-start' },
  rewardText:   { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  acceptBtn:    { borderRadius: Radius.lg, paddingVertical: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs },
  acceptBtnText:{ fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#fff' },
});
