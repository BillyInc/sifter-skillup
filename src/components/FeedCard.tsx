/**
 * Sifter LevelUp — FeedCard
 * Renders any FeedItem type with the correct metadata widget.
 * v3 theme throughout. Based on your template scaffold.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Linking,
} from 'react-native';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, Shadow,
} from '../theme';
import type { FeedItem, ReactionType } from '../types/feed';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeedCardProps {
  item: FeedItem;
  accentColor: string;
  onReact: (id: string, reaction: ReactionType) => void;
  onComment: (item: FeedItem) => void;
  onBookmark: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const REACTIONS: ReactionType[] = ['🔥', '💡', '💰', '📈', '🎯', '❤️'];

// ─── Metadata widgets ─────────────────────────────────────────────────────────

function EcosystemDataWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.widget, { backgroundColor: accent + '10', borderColor: accent + '30' }]}>
      <Text style={[styles.widgetValue, { color: accent }]}>{metadata.value}</Text>
      <Text style={[styles.widgetLabel, { color: colors.textMuted }]}>{metadata.metric}</Text>
      <View style={styles.changeRow}>
        {metadata.change7d && (
          <Text style={[styles.changeText, { color: colors.green }]}>7d {metadata.change7d}</Text>
        )}
        {metadata.change30d && (
          <Text style={[styles.changeText, { color: colors.green }]}>30d {metadata.change30d}</Text>
        )}
      </View>
      {metadata.protocols?.length > 0 && (
        <View style={styles.protocolRow}>
          {metadata.protocols.slice(0, 3).map((p: any) => (
            <View key={p.name} style={styles.protocolChip}>
              <Text style={[styles.protocolName, { color: colors.textMuted }]}>{p.name}</Text>
              <Text style={[styles.protocolValue, { color: accent }]}>{p.value}</Text>
            </View>
          ))}
        </View>
      )}
      {metadata.externalUrl && (
        <TouchableOpacity onPress={() => Linking.openURL(metadata.externalUrl)}>
          <Text style={[styles.linkText, { color: accent }]}>🔗 View on DeFiLlama →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function GovernanceWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.widget, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
      <View style={styles.voteBar}>
        <View style={[styles.voteFill, { width: `${metadata.forPercentage}%`, backgroundColor: colors.green }]} />
        <View style={[styles.voteFill, { width: `${metadata.againstPercentage}%`, backgroundColor: colors.red }]} />
      </View>
      <View style={styles.voteLabels}>
        <Text style={[styles.voteLabel, { color: colors.green }]}>For {metadata.forPercentage}%</Text>
        <Text style={[styles.voteLabel, { color: colors.red }]}>Against {metadata.againstPercentage}%</Text>
      </View>
      <Text style={[styles.voteEnds, { color: colors.textMuted }]}>
        Voting ends {new Date(metadata.endsAt).toLocaleDateString()}
      </Text>
      {metadata.canVote && (
        <TouchableOpacity
          style={[styles.actionChip, { backgroundColor: accent }]}
          onPress={() => metadata.voteUrl && Linking.openURL(metadata.voteUrl)}
        >
          <Text style={styles.actionChipText}>Vote →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function CampaignWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.widget, { backgroundColor: accent + '0e', borderColor: accent + '35' }]}>
      <Text style={[styles.campaignTask, { color: colors.textSoft }]}>▸ {metadata.task}</Text>
      <Text style={[styles.campaignReward, { color: accent }]}>Reward: {metadata.reward}</Text>
      <View style={styles.campaignFooter}>
        <Text style={[styles.campaignMeta, { color: colors.textMuted }]}>
          {metadata.participants?.toLocaleString()} participants · Ends {new Date(metadata.endsAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.actionChip, { backgroundColor: metadata.isJoined ? colors.green : accent }]}
          onPress={() => metadata.joinUrl && Linking.openURL(metadata.joinUrl)}
        >
          <Text style={styles.actionChipText}>{metadata.isJoined ? 'Joined ✓' : 'Join'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NewProjectWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  const auditColor =
    metadata.auditStatus === 'audited' ? colors.green
    : metadata.auditStatus === 'pending' ? colors.orange
    : colors.red;

  return (
    <View style={[styles.widget, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
      <View style={styles.projectRow}>
        <View style={[styles.projectBadge, { backgroundColor: accent + '18' }]}>
          <Text style={[styles.projectBadgeText, { color: accent }]}>{metadata.category}</Text>
        </View>
        <View style={[styles.projectBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.projectBadgeText, { color: colors.textSoft }]}>⛓️ {metadata.chain}</Text>
        </View>
        <View style={[styles.projectBadge, { backgroundColor: auditColor + '18' }]}>
          <Text style={[styles.projectBadgeText, { color: auditColor }]}>
            {metadata.auditStatus === 'audited' ? '✓ Audited' : metadata.auditStatus === 'pending' ? '⏳ Pending' : '⚠️ Unaudited'}
          </Text>
        </View>
      </View>
      {metadata.tvl && (
        <Text style={[styles.projectTvl, { color: colors.textSoft }]}>TVL: <Text style={{ color: accent, fontWeight: FontWeight.bold }}>{metadata.tvl}</Text></Text>
      )}
      {metadata.websiteUrl && (
        <TouchableOpacity onPress={() => Linking.openURL(metadata.websiteUrl!)}>
          <Text style={[styles.linkText, { color: accent }]}>Visit site →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MarketSentimentWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  const color =
    metadata.index >= 75 ? colors.red
    : metadata.index >= 55 ? colors.orange
    : metadata.index >= 45 ? colors.textSoft
    : metadata.index >= 25 ? colors.accent
    : colors.red;

  const barWidth = `${metadata.index}%` as any;

  return (
    <View style={[styles.widget, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
      <View style={styles.sentimentHeader}>
        <Text style={[styles.sentimentIndex, { color }]}>{metadata.index}</Text>
        <Text style={[styles.sentimentLabel, { color }]}>{metadata.label}</Text>
        <Text style={[styles.sentimentChange, { color: colors.textMuted }]}>{metadata.change}</Text>
      </View>
      <View style={[styles.sentimentBar, { backgroundColor: colors.bgTertiary }]}>
        <View style={[styles.sentimentFill, { width: barWidth, backgroundColor: color }]} />
      </View>
      <View style={styles.sentimentScale}>
        <Text style={[styles.sentimentScaleText, { color: colors.red }]}>Fear</Text>
        <Text style={[styles.sentimentScaleText, { color: colors.textMuted }]}>Neutral</Text>
        <Text style={[styles.sentimentScaleText, { color: colors.red }]}>Greed</Text>
      </View>
    </View>
  );
}

function JobWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.widget, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.jobRow}>
        <View style={[styles.projectBadge, { backgroundColor: colors.greenSoft }]}>
          <Text style={[styles.projectBadgeText, { color: colors.green }]}>
            🟢 {metadata.remote ? 'Remote' : metadata.location}
          </Text>
        </View>
        {metadata.salaryRange && (
          <View style={[styles.projectBadge, { backgroundColor: colors.goldSoft }]}>
            <Text style={[styles.projectBadgeText, { color: colors.gold }]}>{metadata.salaryRange}</Text>
          </View>
        )}
      </View>
      <View style={styles.jobFooter}>
        {metadata.applyBy && (
          <Text style={[styles.applyBy, { color: colors.textMuted }]}>Apply by {metadata.applyBy}</Text>
        )}
        {metadata.applyUrl && (
          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: accent }]}
            onPress={() => Linking.openURL(metadata.applyUrl!)}
          >
            <Text style={styles.actionChipText}>Apply →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SkillWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.widget, { backgroundColor: colors.accentSoft, borderColor: accent + '30' }]}>
      <View style={styles.skillRow}>
        <Text style={[styles.skillMeta, { color: accent }]}>
          {metadata.lessonCount} lessons · {metadata.duration} · +{metadata.xpReward} XP
        </Text>
        <TouchableOpacity style={[styles.actionChip, { backgroundColor: accent }]}>
          <Text style={styles.actionChipText}>Start →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function GuildConversationWidget({ metadata, accent }: { metadata: any; accent: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.guildMeta}>
      <Text style={[styles.guildHandle, { color: accent }]}>{metadata.authorHandle}</Text>
      <Text style={[styles.guildStats, { color: colors.textMuted }]}>
        {metadata.replies} replies · {metadata.likes} likes
      </Text>
    </View>
  );
}

function NewsWidget({ metadata }: { metadata: any }) {
  if (!metadata?.imageUrl) return null;
  return <Image source={{ uri: metadata.imageUrl }} style={styles.newsImage} resizeMode="cover" />;
}

// ─── Reaction bar ─────────────────────────────────────────────────────────────

function ReactionBar({
  reactions, myReaction, onReact,
}: {
  reactions: Record<ReactionType, number>;
  myReaction?: ReactionType;
  onReact: (r: ReactionType) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.reactionRow}>
      {REACTIONS.map(r => {
        const count    = reactions[r] ?? 0;
        const isActive = myReaction === r;
        if (count === 0 && !isActive) return null;
        return (
          <TouchableOpacity
            key={r}
            style={[
              styles.reactionPill,
              {
                backgroundColor: isActive ? colors.accentSoft : colors.bgSecondary,
                borderColor: isActive ? colors.accent : 'transparent',
              },
            ]}
            onPress={() => onReact(r)}
          >
            <Text style={styles.reactionEmoji}>{r}</Text>
            <Text style={[styles.reactionCount, { color: isActive ? colors.accent : colors.textMuted }]}>
              {count}
            </Text>
          </TouchableOpacity>
        );
      })}
      {/* Add reaction button */}
      <TouchableOpacity
        style={[styles.reactionPill, { backgroundColor: colors.bgSecondary, borderColor: 'transparent' }]}
        onPress={() => onReact('❤️')}
      >
        <Text style={styles.reactionEmoji}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── FeedCard ────────────────────────────────────────────────────────────────

export function FeedCard({ item, accentColor, onReact, onComment, onBookmark }: FeedCardProps) {
  const { colors } = useTheme();
  const meta = item.metadata as any;

  const renderWidget = () => {
    switch (item.type) {
      case 'ecosystem_data':   return <EcosystemDataWidget   metadata={meta} accent={accentColor} />;
      case 'governance':       return <GovernanceWidget       metadata={meta} accent={accentColor} />;
      case 'campaign':         return <CampaignWidget         metadata={meta} accent={accentColor} />;
      case 'new_project':      return <NewProjectWidget       metadata={meta} accent={accentColor} />;
      case 'market_sentiment': return <MarketSentimentWidget  metadata={meta} accent={accentColor} />;
      case 'job':              return <JobWidget              metadata={meta} accent={accentColor} />;
      case 'skill':            return <SkillWidget            metadata={meta} accent={accentColor} />;
      case 'community':        return <GuildConversationWidget metadata={meta} accent={accentColor} />;
      default:                 return <NewsWidget             metadata={meta} />;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.xs]}>
      {/* Source + time */}
      <View style={styles.cardHeader}>
        <View style={[styles.sourceBadge, { backgroundColor: accentColor + '18' }]}>
          <Text style={[styles.sourceText, { color: accentColor }]}>{item.source}</Text>
        </View>
        <Text style={[styles.timeText, { color: colors.textMuted }]}>{timeAgo(item.publishedAt)}</Text>
      </View>

      {/* Title + content */}
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.cardContent, { color: colors.textSoft }]} numberOfLines={3}>
        {item.content}
      </Text>

      {/* Type widget */}
      {renderWidget()}

      {/* Engagement */}
      <View style={[styles.engagement, { borderTopColor: colors.border }]}>
        <ReactionBar
          reactions={item.reactions}
          myReaction={item.myReaction}
          onReact={r => onReact(item.id, r)}
        />

        <View style={styles.engagementActions}>
          <TouchableOpacity style={styles.engagementBtn} onPress={() => onComment(item)}>
            <Text style={[styles.engagementBtnText, { color: colors.textMuted }]}>
              💬 {item.commentCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.engagementBtn} onPress={() => onBookmark(item.id)}>
            <Text style={[styles.engagementBtnText, { color: item.isBookmarked ? accentColor : colors.textMuted }]}>
              {item.isBookmarked ? '🔖' : '📎'} Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card:            { borderRadius: Radius.xl, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, gap: Spacing.sm },

  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sourceBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  sourceText:      { fontSize: 11, fontWeight: FontWeight.black, textTransform: 'uppercase' as any, letterSpacing: 0.4 },
  timeText:        { fontSize: 11 },

  cardTitle:       { fontSize: FontSize.sm, fontWeight: FontWeight.black, lineHeight: 19 },
  cardContent:     { fontSize: FontSize.xs, lineHeight: 18 },

  // Widgets
  widget:          { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.xs },
  widgetValue:     { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  widgetLabel:     { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'uppercase' as any },
  changeRow:       { flexDirection: 'row', gap: Spacing.md },
  changeText:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  protocolRow:     { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginTop: Spacing.xs },
  protocolChip:    { alignItems: 'center' },
  protocolName:    { fontSize: 10, fontWeight: FontWeight.semibold },
  protocolValue:   { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  linkText:        { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginTop: Spacing.xs },

  voteBar:         { flexDirection: 'row', height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  voteFill:        { height: '100%' },
  voteLabels:      { flexDirection: 'row', justifyContent: 'space-between' },
  voteLabel:       { fontSize: 11, fontWeight: FontWeight.semibold },
  voteEnds:        { fontSize: 11 },

  campaignTask:    { fontSize: FontSize.sm, lineHeight: 18 },
  campaignReward:  { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  campaignFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  campaignMeta:    { fontSize: 10, flex: 1 },

  projectRow:      { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  projectBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  projectBadgeText:{ fontSize: 11, fontWeight: FontWeight.semibold },
  projectTvl:      { fontSize: FontSize.sm },

  sentimentHeader: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  sentimentIndex:  { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  sentimentLabel:  { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  sentimentChange: { fontSize: FontSize.xs, marginLeft: 'auto' as any },
  sentimentBar:    { height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  sentimentFill:   { height: '100%', borderRadius: Radius.full },
  sentimentScale:  { flexDirection: 'row', justifyContent: 'space-between' },
  sentimentScaleText:{ fontSize: 10 },

  jobRow:          { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  jobFooter:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs },
  applyBy:         { fontSize: 11 },

  skillRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillMeta:       { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, flex: 1 },

  guildMeta:       { gap: 2 },
  guildHandle:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  guildStats:      { fontSize: 11 },

  newsImage:       { width: '100%', height: 148, borderRadius: Radius.lg },

  actionChip:      { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full },
  actionChipText:  { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: '#fff' },

  reactionRow:     { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  reactionPill:    { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  reactionEmoji:   { fontSize: 13 },
  reactionCount:   { fontSize: 11, fontWeight: FontWeight.bold },

  engagement:      { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.xs },
  engagementActions:{ flexDirection: 'row', gap: Spacing.md },
  engagementBtn:   { padding: 4 },
  engagementBtnText:{ fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
