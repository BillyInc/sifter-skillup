/**
 * Sifter LevelUp — Feed Web Layout (Phase 3)
 * Two-column layout for web ≥768px.
 *
 * LEFT COLUMN  (scrollable, flex 3):
 *   Collapsible section headers → FeedCards per section
 *   Section filter chips at top
 *
 * RIGHT COLUMN (300px, sticky top):
 *   Track switcher — active + monitored tracks
 *   Ecosystem data panel (crypto) or Market data (quant/ops)
 *   New Skills from Sifter
 *   Active Campaigns (crypto tracks)
 *   Job snapshot (2 latest)
 *
 * No "Trending Now" widget — that was never in the template.
 * Right column panels pull directly from feedItems already loaded.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Platform,
} from 'react-native';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight,
} from '../theme';
import { FeedCard } from './FeedCard';
import type { FeedItem, ReactionType, TrackFeedSection, MonitoredTrack } from '../types/feed';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SectionData {
  section: TrackFeedSection;
  items: FeedItem[];
  loading: boolean;
}

interface FeedWebLayoutProps {
  activeTrackId: string;
  monitoredTracks: MonitoredTrack[];
  sections: SectionData[];
  sectionFilter: string;
  isUsingFallback: boolean;
  onSectionFilterChange: (id: string) => void;
  onTrackChange: (id: string) => void;
  onManageTracks: () => void;
  onReact: (feedItemId: string, r: ReactionType) => void;
  onComment: (item: FeedItem) => void;
  onBookmark: (feedItemId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

// ─── Right column: Track switcher ────────────────────────────────────────────

function TrackSwitcher({
  monitoredTracks,
  activeTrackId,
  onTrackChange,
  onManageTracks,
}: {
  monitoredTracks: MonitoredTrack[];
  activeTrackId: string;
  onTrackChange: (id: string) => void;
  onManageTracks: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.panelHeaderRow}>
        <Text style={[styles.panelTitle, { color: colors.textMuted }]}>YOUR TRACKS</Text>
        <TouchableOpacity onPress={onManageTracks}>
          <Text style={[styles.manageBtn, { color: colors.accent }]}>+ Manage</Text>
        </TouchableOpacity>
      </View>

      {monitoredTracks.map(track => {
        const isActive = track.id === activeTrackId;
        return (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.trackRow,
              isActive && { backgroundColor: track.accentColor + '12', borderRadius: Radius.md },
            ]}
            onPress={() => onTrackChange(track.id)}
            activeOpacity={0.75}
          >
            <View style={[styles.trackDot, { backgroundColor: isActive ? track.accentColor : colors.bgTertiary }]} />
            <Text style={styles.trackEmoji}>{track.emoji}</Text>
            <Text style={[
              styles.trackLabel,
              { color: isActive ? track.accentColor : colors.textSoft },
              isActive && { fontWeight: FontWeight.bold },
            ]}>
              {track.label}
            </Text>
            {track.isPrimary && (
              <View style={[styles.primaryTag, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.primaryTagText, { color: colors.accent }]}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Right column: Ecosystem / Market data ────────────────────────────────────

function DataPanel({
  sections,
  accentColor,
}: {
  sections: SectionData[];
  accentColor: string;
}) {
  const { colors } = useTheme();

  const dataSection = sections.find(s =>
    s.section.id === 'ecosystem_data' || s.section.id === 'market_data'
  );
  if (!dataSection || dataSection.items.length === 0) return null;

  const dataItem = dataSection.items[0];
  const meta     = dataItem.metadata as any;
  const isEco    = dataSection.section.id === 'ecosystem_data';

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.panelTitle, { color: colors.textMuted }]}>
        {isEco ? 'ECOSYSTEM DATA' : 'MARKET DATA'}
      </Text>

      <View style={[styles.metricBox, { backgroundColor: accentColor + '12', borderColor: accentColor + '30' }]}>
        <Text style={[styles.metricValue, { color: accentColor }]}>{meta?.value ?? '—'}</Text>
        <Text style={[styles.metricLabel, { color: colors.textSoft }]}>{meta?.metric ?? 'Index'}</Text>
        {(meta?.change7d || meta?.change30d) && (
          <View style={styles.changeRow}>
            {meta?.change7d  && <Text style={[styles.change, { color: colors.green }]}>7d {meta.change7d}</Text>}
            {meta?.change30d && <Text style={[styles.change, { color: colors.green }]}>30d {meta.change30d}</Text>}
          </View>
        )}
      </View>

      {meta?.protocols?.length > 0 && (
        <View style={styles.protocolList}>
          {meta.protocols.slice(0, 3).map((p: any) => (
            <View key={p.name} style={[styles.protocolRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.protocolName, { color: colors.textSoft }]}>{p.name}</Text>
              <Text style={[styles.protocolValue, { color: accentColor }]}>{p.value}</Text>
            </View>
          ))}
        </View>
      )}

      {meta?.externalUrl && (
        <TouchableOpacity
          style={[styles.extLink, { borderColor: accentColor + '40' }]}
          onPress={() => Platform.OS === 'web' && Linking.openURL(meta.externalUrl)}
        >
          <Text style={[styles.extLinkText, { color: accentColor }]}>
            {isEco ? 'View on DeFiLlama →' : 'View on Bloomberg →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Right column: Market Sentiment ──────────────────────────────────────────

function SentimentPanel({
  sections,
  accentColor,
}: {
  sections: SectionData[];
  accentColor: string;
}) {
  const { colors } = useTheme();

  const sentimentSection = sections.find(s => s.section.id === 'market_sentiment');
  if (!sentimentSection || sentimentSection.items.length === 0) return null;

  const item = sentimentSection.items[0];
  const meta  = item.metadata as any;

  const color =
    meta?.index >= 75 ? colors.red
    : meta?.index >= 55 ? colors.orange
    : meta?.index >= 45 ? colors.textSoft
    : meta?.index >= 25 ? colors.accent
    : colors.red;

  const barWidth = `${meta?.index ?? 50}%` as any;

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.panelTitle, { color: colors.textMuted }]}>MARKET SENTIMENT</Text>

      <View style={styles.sentimentHeader}>
        <Text style={[styles.sentimentIndex, { color }]}>{meta?.index ?? '—'}</Text>
        <Text style={[styles.sentimentLabel, { color }]}>{meta?.label ?? '—'}</Text>
      </View>

      <View style={[styles.sentimentBar, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.sentimentFill, { width: barWidth, backgroundColor: color }]} />
      </View>

      <View style={styles.sentimentScale}>
        <Text style={[styles.sentimentScaleText, { color: colors.red }]}>Fear</Text>
        <Text style={[styles.sentimentScaleText, { color: colors.textMuted }]}>Neutral</Text>
        <Text style={[styles.sentimentScaleText, { color: colors.red }]}>Greed</Text>
      </View>

      {meta?.change && (
        <Text style={[styles.sentimentChange, { color: colors.textMuted }]}>
          {meta.change}
        </Text>
      )}
      <Text style={[styles.sentimentSource, { color: colors.textMuted }]}>
        Source: {meta?.source ?? item.source}
      </Text>
    </View>
  );
}

// ─── Right column: Active Campaigns ──────────────────────────────────────────

function CampaignsPanel({
  sections,
  accentColor,
}: {
  sections: SectionData[];
  accentColor: string;
}) {
  const { colors } = useTheme();

  const campaignSection = sections.find(s => s.section.id === 'campaigns');
  if (!campaignSection || campaignSection.items.length === 0) return null;

  const campaigns = campaignSection.items;

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.panelTitle, { color: colors.textMuted }]}>ACTIVE CAMPAIGNS</Text>

      {campaigns.map(item => {
        const meta = item.metadata as any;
        return (
          <View key={item.id} style={[styles.campaignItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.campaignTitle, { color: colors.text }]} numberOfLines={1}>
              🎯 {item.title}
            </Text>
            <Text style={[styles.campaignReward, { color: accentColor }]}>
              {meta?.reward}
            </Text>
            <View style={styles.campaignBottom}>
              <Text style={[styles.campaignParticipants, { color: colors.textMuted }]}>
                {(meta?.participants ?? 0).toLocaleString()} joined
              </Text>
              <TouchableOpacity
                style={[styles.joinBtn, { backgroundColor: accentColor }]}
                onPress={() => meta?.joinUrl && Linking.openURL(meta.joinUrl)}
              >
                <Text style={styles.joinBtnText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Right column: New Skills ─────────────────────────────────────────────────

function SkillsPanel({
  sections,
  accentColor,
}: {
  sections: SectionData[];
  accentColor: string;
}) {
  const { colors } = useTheme();

  const skillSection = sections.find(s => s.section.id === 'skills');
  if (!skillSection || skillSection.items.length === 0) return null;

  const skills = skillSection.items;

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.panelTitle, { color: colors.textMuted }]}>NEW SKILLS</Text>

      {skills.map(item => {
        const meta = item.metadata as any;
        return (
          <View key={item.id} style={[styles.skillItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.skillTitle, { color: colors.text }]} numberOfLines={2}>
              ✨ {item.title}
            </Text>
            <View style={styles.skillBottom}>
              <Text style={[styles.skillMeta, { color: colors.textMuted }]}>
                {meta?.lessonCount} lessons · +{meta?.xpReward} XP
              </Text>
              <TouchableOpacity style={[styles.startBtn, { backgroundColor: accentColor }]}>
                <Text style={styles.startBtnText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Right column: Jobs snapshot ─────────────────────────────────────────────

function JobsPanel({
  sections,
  accentColor,
}: {
  sections: SectionData[];
  accentColor: string;
}) {
  const { colors } = useTheme();

  const jobSection = sections.find(s => s.section.id === 'jobs');
  if (!jobSection || jobSection.items.length === 0) return null;

  const jobs = jobSection.items;

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.panelTitle, { color: colors.textMuted }]}>LATEST OPPORTUNITIES</Text>

      {jobs.map(item => {
        const meta = item.metadata as any;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.jobItem, { borderBottomColor: colors.border }]}
            onPress={() => meta?.applyUrl && Linking.openURL(meta.applyUrl)}
            activeOpacity={0.75}
          >
            <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.jobMeta}>
              {meta?.remote && (
                <View style={[styles.jobTag, { backgroundColor: colors.greenSoft }]}>
                  <Text style={[styles.jobTagText, { color: colors.green }]}>Remote</Text>
                </View>
              )}
              {meta?.salaryRange && (
                <View style={[styles.jobTag, { backgroundColor: colors.goldSoft }]}>
                  <Text style={[styles.jobTagText, { color: colors.gold }]}>{meta.salaryRange}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

    </View>
  );
}

// ─── Left column: Section filter chips ───────────────────────────────────────

function SectionFilter({
  sections,
  activeId,
  accentColor,
  onChange,
}: {
  sections: SectionData[];
  activeId: string;
  accentColor: string;
  onChange: (id: string) => void;
}) {
  const { colors } = useTheme();

  const options = [
    { id: 'all', title: 'All', icon: '📡' },
    ...sections.map(s => ({ id: s.section.id, title: s.section.title.replace(/^[^\s]+\s/, ''), icon: s.section.icon })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      style={[styles.filterScroll, { borderBottomColor: colors.border }]}
    >
      {options.map(opt => {
        const isActive = opt.id === activeId;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: isActive ? accentColor + '18' : colors.card,
                borderColor: isActive ? accentColor : colors.border,
              },
            ]}
            onPress={() => onChange(opt.id)}
          >
            <Text style={styles.filterIcon}>{opt.icon}</Text>
            <Text style={[styles.filterLabel, { color: isActive ? accentColor : colors.textSoft }]}>
              {opt.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Left column: Feed section block ─────────────────────────────────────────

function FeedSection({
  sectionData,
  accentColor,
  onReact,
  onComment,
  onBookmark,
}: {
  sectionData: SectionData;
  accentColor: string;
  onReact: (id: string, r: ReactionType) => void;
  onComment: (item: FeedItem) => void;
  onBookmark: (id: string) => void;
}) {
  const { colors } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View style={styles.sectionBlock}>
      {/* Section header */}
      <TouchableOpacity
        style={[styles.sectionHeader, { borderLeftColor: accentColor }]}
        onPress={() => setCollapsed(c => !c)}
        activeOpacity={0.75}
      >
        <Text style={styles.sectionIcon}>{sectionData.section.icon}</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {sectionData.section.title}
        </Text>
        <View style={styles.sectionHeaderRight}>
          <View style={[styles.countBadge, { backgroundColor: accentColor + '20' }]}>
            <Text style={[styles.countText, { color: accentColor }]}>
              {sectionData.items.length}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>
            {collapsed ? '›' : '⌄'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Cards */}
      {!collapsed && (
        <View style={styles.cardsBlock}>
          {sectionData.loading ? (
            <View style={[styles.skeleton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.bgSecondary }]} />
              <View style={[styles.skeletonLine, { width: '85%', backgroundColor: colors.bgSecondary }]} />
              <View style={[styles.skeletonLine, { width: '65%', backgroundColor: colors.bgSecondary }]} />
            </View>
          ) : sectionData.items.length === 0 ? (
            <View style={[styles.emptySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Loading {sectionData.section.title.replace(/^[^\s]+\s/, '').toLowerCase()}…
              </Text>
            </View>
          ) : (
            sectionData.items.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                accentColor={accentColor}
                onReact={onReact}
                onComment={onComment}
                onBookmark={onBookmark}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── Root two-column layout ───────────────────────────────────────────────────

export default function FeedWebLayout({
  activeTrackId,
  monitoredTracks,
  sections,
  sectionFilter,
  isUsingFallback,
  onSectionFilterChange,
  onTrackChange,
  onManageTracks,
  onReact,
  onComment,
  onBookmark,
  onRefresh,
  loading,
}: FeedWebLayoutProps) {
  const { colors } = useTheme();

  const activeTrack  = monitoredTracks.find(t => t.id === activeTrackId) ?? monitoredTracks[0];
  const accentColor  = activeTrack?.accentColor ?? colors.accent;

  const visibleSections = sectionFilter === 'all'
    ? sections.filter(s => !s.section.id.startsWith('social_')) // show core sections by default; social shown when filtered
    : sections.filter(s => s.section.id === sectionFilter);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>

      {/* ── LEFT COLUMN ── */}
      <View style={styles.leftCol}>
        {/* Feed header */}
        <View style={[styles.feedHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <View>
            <Text style={[styles.feedTitle, { color: colors.text }]}>
              {activeTrack?.emoji} {activeTrack?.label ?? 'Feed'}
            </Text>
            <Text style={[styles.feedSub, { color: accentColor }]}>
              {sections.reduce((n, s) => n + s.items.length, 0)} items across {sections.length} sections
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
            onPress={onRefresh}
          >
            <Text style={[styles.refreshText, { color: colors.textMuted }]}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>

        {isUsingFallback && (
          <View style={[styles.fallbackBanner, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
            <Text style={[styles.fallbackBannerText, { color: colors.gold }]}>
              Seeded fallback content is active. You can still switch tracks and interact, but this snapshot is demo content until live feed items arrive.
            </Text>
          </View>
        )}

        {/* Section filter */}
        <SectionFilter
          sections={sections}
          activeId={sectionFilter}
          accentColor={accentColor}
          onChange={onSectionFilterChange}
        />

        {/* Feed sections */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.leftScroll}
          showsVerticalScrollIndicator={false}
        >
          {visibleSections.map(sectionData => (
            <FeedSection
              key={sectionData.section.id}
              sectionData={sectionData}
              accentColor={accentColor}
              onReact={onReact}
              onComment={onComment}
              onBookmark={onBookmark}
            />
          ))}
          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>
      </View>

      {/* ── RIGHT COLUMN ── */}
      <ScrollView
        style={[styles.rightCol, { borderLeftColor: colors.border }]}
        contentContainerStyle={styles.rightScroll}
        showsVerticalScrollIndicator={false}
      >
        <TrackSwitcher
          monitoredTracks={monitoredTracks}
          activeTrackId={activeTrackId}
          onTrackChange={onTrackChange}
          onManageTracks={onManageTracks}
        />

        <DataPanel      sections={sections} accentColor={accentColor} />
        <SentimentPanel sections={sections} accentColor={accentColor} />
        <CampaignsPanel sections={sections} accentColor={accentColor} />
        <SkillsPanel    sections={sections} accentColor={accentColor} />
        <JobsPanel      sections={sections} accentColor={accentColor} />

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:             { flex: 1, flexDirection: 'row' },

  // ── Left column ───────────────────────────────────────────────────────────
  leftCol:          { flex: 3, flexDirection: 'column' },
  feedHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1 },
  feedTitle:        { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  feedSub:          { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginTop: 2 },
  refreshBtn:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1 },
  refreshText:      { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  fallbackBanner:   { marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md },
  fallbackBannerText:{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, lineHeight: 18 },
  filterScroll:     { borderBottomWidth: 1, maxHeight: 50 },
  filterRow:        { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row', alignItems: 'center' },
  filterChip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  filterIcon:       { fontSize: 12 },
  filterLabel:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  leftScroll:       { padding: Spacing.lg, gap: Spacing.lg },
  sectionBlock:     { gap: Spacing.sm },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingLeft: Spacing.md, borderLeftWidth: 3, cursor: 'pointer' as any },
  sectionIcon:      { fontSize: 16 },
  sectionTitle:     { fontSize: FontSize.sm, fontWeight: FontWeight.black, letterSpacing: 0.5, flex: 1 },
  sectionHeaderRight:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  countBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  countText:        { fontSize: 11, fontWeight: FontWeight.black },
  chevron:          { fontSize: 18, fontWeight: FontWeight.bold },
  cardsBlock:       { gap: Spacing.sm },
  skeleton:         { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, gap: Spacing.sm },
  skeletonLine:     { height: 13, borderRadius: Radius.full },
  emptySection:     { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, alignItems: 'center' },
  emptyText:        { fontSize: FontSize.sm },

  // ── Right column ──────────────────────────────────────────────────────────
  rightCol:         { width: 300, borderLeftWidth: 1 },
  rightScroll:      { padding: Spacing.md, gap: Spacing.md },
  panel:            { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  panelHeaderRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle:       { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  manageBtn:        { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  // Track switcher
  trackRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs, cursor: 'pointer' as any },
  trackDot:         { width: 7, height: 7, borderRadius: 4 },
  trackEmoji:       { fontSize: 15 },
  trackLabel:       { flex: 1, fontSize: FontSize.sm },
  primaryTag:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  primaryTagText:   { fontSize: 9, fontWeight: FontWeight.black },

  // Data / metric panel
  metricBox:        { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, gap: 2, alignItems: 'center' },
  metricValue:      { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  metricLabel:      { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  changeRow:        { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  change:           { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  protocolList:     { gap: 0 },
  protocolRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  protocolName:     { fontSize: FontSize.sm },
  protocolValue:    { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  extLink:          { paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  extLinkText:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  // Sentiment
  sentimentHeader:  { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  sentimentIndex:   { fontSize: FontSize.xxxl, fontWeight: FontWeight.black },
  sentimentLabel:   { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  sentimentBar:     { height: 7, borderRadius: Radius.full, overflow: 'hidden' },
  sentimentFill:    { height: '100%', borderRadius: Radius.full },
  sentimentScale:   { flexDirection: 'row', justifyContent: 'space-between' },
  sentimentScaleText:{ fontSize: 10 },
  sentimentChange:  { fontSize: 11, marginTop: 2 },
  sentimentSource:  { fontSize: 10 },

  // Campaigns
  campaignItem:     { paddingBottom: Spacing.sm, marginBottom: Spacing.xs, borderBottomWidth: 1, gap: Spacing.xs },
  campaignTitle:    { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  campaignReward:   { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  campaignBottom:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  campaignParticipants:{ fontSize: 10 },
  joinBtn:          { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  joinBtnText:      { fontSize: 10, fontWeight: FontWeight.black, color: '#fff' },

  // Skills
  skillItem:        { paddingBottom: Spacing.sm, marginBottom: Spacing.xs, borderBottomWidth: 1, gap: Spacing.xs },
  skillTitle:       { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: 18 },
  skillBottom:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillMeta:        { fontSize: 10 },
  startBtn:         { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  startBtnText:     { fontSize: 10, fontWeight: FontWeight.black, color: '#fff' },

  // Jobs
  jobItem:          { paddingBottom: Spacing.sm, marginBottom: Spacing.xs, borderBottomWidth: 1, gap: Spacing.xs, cursor: 'pointer' as any },
  jobTitle:         { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: 18 },
  jobMeta:          { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  jobTag:           { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  jobTagText:       { fontSize: 10, fontWeight: FontWeight.semibold },
  viewAllBtn:       { paddingTop: Spacing.xs, alignItems: 'center' },
  viewAllText:      { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
