/**
 * Sifter Skill_Up — Room Message
 * Renders one message in a Track Room or Guild Chat.
 * Supports: text, lesson_share, portfolio_share, challenge_update, reward_celebrate.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';
import type { RoomMessage as RoomMessageType } from '../types/social';

interface RoomMessageProps {
  message:    RoomMessageType;
  isOwn:      boolean;
  onReact:    (messageId: string, emoji: string) => void;
  onLessonTap?: (lessonId: number) => void;
}

// Stage name badge colours
const STAGE_COLORS = ['', '#94A3B8','#3B82F6','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#F59E0B'];

export default function RoomMessage({ message, isOwn, onReact, onLessonTap }: RoomMessageProps) {
  const { colors } = useTheme();
  const stageColor = STAGE_COLORS[message.author_stage] ?? colors.textMuted;
  const time = new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ── System messages ───────────────────────────────────────────────────────

  if (message.message_type === 'challenge_update') {
    return (
      <View style={[styles.systemMsg, { backgroundColor: colors.accentSoft }]}>
        <Text style={[styles.systemText, { color: colors.accent }]}>⚡ {message.content}</Text>
        <Text style={[styles.systemTime, { color: colors.textMuted }]}>{time}</Text>
      </View>
    );
  }

  if (message.message_type === 'reward_celebrate') {
    return (
      <View style={[styles.systemMsg, { backgroundColor: colors.goldSoft }]}>
        <Text style={[styles.systemText, { color: colors.gold }]}>🏆 {message.content}</Text>
        <Text style={[styles.systemTime, { color: colors.textMuted }]}>{time}</Text>
      </View>
    );
  }

  // ── Regular + lesson_share + portfolio_share ───────────────────────────────

  const isLesson    = message.message_type === 'lesson_share';
  const isPortfolio = message.message_type === 'portfolio_share';

  return (
    <View style={[styles.row, isOwn && styles.rowReverse]}>
      {/* Author avatar / stage badge */}
      <View style={[styles.stageBadge, { backgroundColor: stageColor + '22' }]}>
        <Text style={[styles.stageBadgeText, { color: stageColor }]}>
          {message.author_stage}
        </Text>
      </View>

      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble,
        { backgroundColor: isOwn ? colors.accent : colors.card,
          borderColor: isOwn ? 'transparent' : colors.border }]}>

        {/* Author name */}
        {!isOwn && (
          <Text style={[styles.authorName, { color: stageColor }]}>
            {message.author_username}
          </Text>
        )}

        {/* Lesson card */}
        {isLesson && message.attached_lesson_id && (
          <TouchableOpacity
            style={[styles.lessonCard, { backgroundColor: colors.bgSecondary, borderColor: colors.accent + '40' }]}
            onPress={() => onLessonTap?.(message.attached_lesson_id!)}
            activeOpacity={0.8}
          >
            <Text style={[styles.lessonLabel, { color: colors.accent }]}>📚 LESSON SHARED</Text>
            <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={2}>
              {message.attached_lesson_title}
            </Text>
            <Text style={[styles.lessonCta, { color: colors.accent }]}>Study this together →</Text>
          </TouchableOpacity>
        )}

        {/* Portfolio card */}
        {isPortfolio && (
          <View style={[styles.portfolioCard, { backgroundColor: colors.bgSecondary, borderColor: colors.gold + '40' }]}>
            <Text style={[styles.lessonLabel, { color: colors.gold }]}>🗂️ PORTFOLIO ITEM</Text>
            <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={2}>
              {message.content}
            </Text>
          </View>
        )}

        {/* Message text */}
        {message.message_type === 'text' && (
          <Text style={[styles.msgText, { color: isOwn ? '#fff' : colors.text }]}>
            {message.content}
          </Text>
        )}

        {/* Time + reactions */}
        <View style={styles.msgFooter}>
          <Text style={[styles.msgTime, { color: isOwn ? 'rgba(255,255,255,0.6)' : colors.textMuted }]}>
            {time}
          </Text>
          {Object.entries(message.reactions).filter(([, v]) => v > 0).map(([emoji, count]) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.reactionPill, { backgroundColor: colors.bgSecondary }]}
              onPress={() => onReact(message.id, emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={[styles.reactionCount, { color: colors.textMuted }]}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </View>
  );
}

// ─── Quick-react bar (shown on long press) ─────────────────────────────────────

export function QuickReactBar({ onReact }: { onReact: (emoji: string) => void }) {
  const EMOJIS = ['👍','🔥','💡','🤔','✅','❤️'];
  return (
    <View style={styles.quickBar}>
      {EMOJIS.map(e => (
        <TouchableOpacity key={e} style={styles.quickBtn} onPress={() => onReact(e)}>
          <Text style={styles.quickEmoji}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:            { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, maxWidth: '100%' },
  rowReverse:     { flexDirection: 'row-reverse' },
  stageBadge:     { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stageBadgeText: { fontSize: 11, fontWeight: FontWeight.black },
  bubble:         { maxWidth: '80%', borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.xs },
  ownBubble:      { borderBottomRightRadius: 4 },
  otherBubble:    { borderBottomLeftRadius: 4 },
  authorName:     { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  msgText:        { fontSize: FontSize.sm, lineHeight: 20 },
  msgFooter:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  msgTime:        { fontSize: 10 },
  reactionPill:   { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  reactionEmoji:  { fontSize: 12 },
  reactionCount:  { fontSize: 10, fontWeight: FontWeight.bold },

  lessonCard:     { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, gap: 2 },
  lessonLabel:    { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.6 },
  lessonTitle:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: 18 },
  lessonCta:      { fontSize: 11, fontWeight: FontWeight.bold },
  portfolioCard:  { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, gap: 2 },

  systemMsg:      { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginHorizontal: Spacing.xl, alignItems: 'center', flexDirection: 'row', gap: Spacing.sm, alignSelf: 'center' },
  systemText:     { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  systemTime:     { fontSize: 10 },

  quickBar:       { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: Radius.full, overflow: 'hidden' },
  quickBtn:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  quickEmoji:     { fontSize: 18 },
});
