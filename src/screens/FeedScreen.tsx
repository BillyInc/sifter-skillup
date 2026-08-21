/**
 * Sifter LevelUp — Feed Screen
 * Tab name: 📰 Feed
 * Replaces Community + Guild.
 *
 * - Auto-loads user's primary active track on mount
 * - Monitored tracks shown as filter chips
 * - "+ Monitor" opens TrackSearch to add more
 * - Sections scroll vertically, each with its FeedCards
 * - Tap 💬 on any card → CommentSheet (threaded + image upload)
 */

import React, { useState, useCallback } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl,
  } from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, webContainer } from '@/theme';
import { CompassFonts } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import FeedWebLayout from '@/components/FeedWebLayout';
import { useFeed } from '@/hooks/useFeed';
import { FeedCard } from '@/components/FeedCard';
import { CommentSheet } from '@/components/CommentSheet';
import { TrackSearch } from '@/components/TrackSearch';
import type { FeedItem, MonitoredTrack, UserFeedContext } from '../types/feed';

// ─── Monitored track filter chips ────────────────────────────────────────────

function TrackChips({
  tracks,
  activeId,
  onChange,
  onManage,
}: {
  tracks: MonitoredTrack[];
  activeId: string;
  onChange: (id: string) => void;
  onManage: () => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.chipsScroll, { borderBottomColor: colors.borderRole.subtle }]}
      contentContainerStyle={styles.chipsContent}
    >
      {tracks.map(track => {
        const isActive = track.id === activeId;
        return (
          <TouchableOpacity
            key={track.id}
            onPress={() => onChange(track.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? track.accentColor : colors.surface.raised,
                borderColor: isActive ? track.accentColor : colors.borderRole.subtle,
              },
            ]}
          >
            <Text style={styles.chipEmoji}>{track.emoji}</Text>
            <Text style={[styles.chipLabel, { color: isActive ? colors.surface.inverse : colors.textRole.secondary }]}>
              {track.label}
            </Text>
            {track.isPrimary && (
              <View style={[styles.primaryDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.5)' : track.accentColor }]} />
            )}
          </TouchableOpacity>
        );
      })}

      {/* Monitor more button */}
      <TouchableOpacity
        onPress={onManage}
        style={[styles.chip, styles.manageChip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
      >
        <Text style={[styles.chipLabel, { color: colors.textRole.muted }]}>Manage</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title, icon, count, collapsed, onToggle, color,
}: {
  title: string; icon: string; count: number;
  collapsed: boolean; onToggle: () => void; color: string;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.sectionHeader, { borderLeftColor: color }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{title}</Text>
      <View style={styles.sectionRight}>
        <View style={[styles.sectionCount, { backgroundColor: color + '20' }]}>
          <Text style={[styles.sectionCountText, { color }]}>{count}</Text>
        </View>
        <Text style={[styles.sectionChevron, { color: colors.textRole.muted }]}>
          {collapsed ? '›' : '⌄'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View style={[styles.skeleton, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.surface.subtle }]} />
      <View style={[styles.skeletonLine, { width: '90%', backgroundColor: colors.surface.subtle }]} />
      <View style={[styles.skeletonLine, { width: '70%', backgroundColor: colors.surface.subtle }]} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { colors }  = useTheme();
  const { user }    = useAuth();
  const { width, isWeb, isMobile }   = useResponsive();
  const isWebWide = isWeb && !isMobile;

  const userContext: UserFeedContext = {
    primaryTrackId: user?.currentTrackId ?? 'defi-research-analyst',
    primaryFieldId: user?.currentFieldId ?? 'crypto',
    monitoredTrackIds: [],
  };

  const {
    monitoredTracks,
    activeTrackId,
    setActiveTrackId,
    addMonitoredTrack,
    removeMonitoredTrack,
    sections,
    loading,
    isUsingFallback,
    refresh,
    comments,
    commentsLoading,
    loadComments,
    submitComment,
    react,
    bookmark,
  } = useFeed(userContext);

  const [commentItem, setCommentItem]     = useState<FeedItem | null>(null);
  const [showTrackSearch, setShowSearch]  = useState(false);
  const [collapsed, setCollapsed]         = useState<Record<string, boolean>>({});
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  // Active track accent color
  const activeTrack   = monitoredTracks.find(t => t.id === activeTrackId);
  const accentColor   = activeTrack?.accentColor ?? colors.accentRole.action;

  const handleComment = useCallback((item: FeedItem) => {
    setCommentItem(item);
    loadComments(item.id);
  }, [loadComments]);

  const handleCloseComment = useCallback(() => setCommentItem(null), []);

  const handleSubmitComment = useCallback(
    async (content: string, parentId: string | null, imageUrl?: string) => {
      if (commentItem) await submitComment(commentItem.id, content, parentId, imageUrl);
    },
    [commentItem, submitComment],
  );

  const toggleSection = (id: string) =>
    setCollapsed(c => ({ ...c, [id]: !c[id] }));

  // Section filter chips (from current track config)
  const sectionOptions = [
    { id: 'all', label: 'All', icon: '📡' },
    ...sections.map(s => ({ id: s.section.id, label: s.section.title.replace(/^[^\s]+\s/, ''), icon: s.section.icon })),
  ];

  const visibleSections = sectionFilter === 'all'
    ? sections
    : sections.filter(s => s.section.id === sectionFilter);

  return (
    // ── Web wide: two-column layout ──────────────────────────────────────────
    isWebWide ? (
      <>
        <FeedWebLayout
          activeTrackId={activeTrackId}
          monitoredTracks={monitoredTracks}
          sections={sections}
          sectionFilter={sectionFilter}
          onSectionFilterChange={setSectionFilter}
          onTrackChange={id => { setActiveTrackId(id); setSectionFilter('all'); }}
          onManageTracks={() => setShowSearch(true)}
          onReact={react}
          onComment={handleComment}
          onBookmark={bookmark}
          onRefresh={refresh}
          loading={loading}
          isUsingFallback={isUsingFallback}
        />
        {commentItem && (
          <CommentSheet
            item={commentItem}
            comments={comments[commentItem.id] ?? []}
            loading={commentsLoading[commentItem.id]}
            onClose={handleCloseComment}
            onSubmit={handleSubmitComment}
          />
        )}
        {showTrackSearch && (
          <TrackSearch
            monitoredTracks={monitoredTracks}
            onAdd={async (track: MonitoredTrack) => { await addMonitoredTrack(track); }}
            onRemove={async (id: string) => { await removeMonitoredTrack(id); }}
            onClose={() => setShowSearch(false)}
          />
        )}
      </>
    ) : (
    // ── Mobile: vertical scroll ───────────────────────────────────────────────
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle }]}>
        <View>
          <Text style={[styles.headerEyebrow, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>COMMUNITY FEED</Text>
          <Text style={[styles.headerTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Feed</Text>
          <Text style={[styles.headerCopy, { color: colors.textRole.secondary }]}>
            Track activity, student signals, and workspace updates in one compact stream.
          </Text>
          <Text style={[styles.headerSub, { color: accentColor }]}>
            {activeTrack?.label ?? 'Your track'}
          </Text>
        </View>
      </View>

      {/* ── Monitored track chips ── */}
      <TrackChips
        tracks={monitoredTracks}
        activeId={activeTrackId}
        onChange={id => { setActiveTrackId(id); setCollapsed({}); setSectionFilter('all'); }}
        onManage={() => setShowSearch(true)}
      />

      {/* ── Section filter chips ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.sectionFilter, { borderBottomColor: colors.borderRole.subtle }]}
        contentContainerStyle={styles.sectionFilterContent}
      >
        {sectionOptions.map(opt => {
          const isActive = opt.id === sectionFilter;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => setSectionFilter(opt.id)}
              style={[
                styles.sectionFilterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.surface.raised,
                  borderColor: isActive ? accentColor : colors.borderRole.subtle,
                },
              ]}
            >
              <Text style={styles.sectionFilterIcon}>{opt.icon}</Text>
              <Text style={[styles.sectionFilterLabel, { color: isActive ? accentColor : colors.textRole.secondary }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isUsingFallback && (
        <View style={[styles.fallbackBanner, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[styles.fallbackBannerText, { color: colors.gold }]}>
            Fallback content is showing right now. Your subscriptions still work, but this snapshot is temporary until live items load.
          </Text>
        </View>
      )}

      {/* ── Feed ── */}
      <ScrollView
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={accentColor} />
        }
      >
        {loading ? (
          // Skeleton state
          <>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </>
        ) : (
          visibleSections.map(({ section, items, loading: sectionLoading }) => {
            const isCollapsed = collapsed[section.id] ?? false;
            return (
              <View key={section.id} style={styles.sectionBlock}>
                <SectionHeader
                  title={section.title}
                  icon={section.icon}
                  count={items.length}
                  collapsed={isCollapsed}
                  onToggle={() => toggleSection(section.id)}
                  color={accentColor}
                />

                {!isCollapsed && (
                  sectionLoading ? (
                    <SkeletonCard />
                  ) : items.length === 0 ? (
                    <View style={[styles.emptySection, { backgroundColor: colors.surface.raised }]}>
                      <Text style={[styles.emptySectionText, { color: colors.textRole.muted }]}>
                        Loading {section.title.replace(/^[^\s]+\s/, '').toLowerCase()}…
                      </Text>
                    </View>
                  ) : (
                    items.map(item => (
                      <FeedCard
                        key={item.id}
                        item={item}
                        accentColor={accentColor}
                        onReact={react}
                        onComment={handleComment}
                        onBookmark={bookmark}
                      />
                    ))
                  )
                )}
              </View>
            );
          })
        )}
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* ── Comment sheet ── */}
      {commentItem && (
        <CommentSheet
          item={commentItem}
          comments={comments[commentItem.id] ?? []}
          loading={commentsLoading[commentItem.id]}
          onClose={handleCloseComment}
          onSubmit={handleSubmitComment}
        />
      )}

      {/* ── Track search ── */}
      {showTrackSearch && (
        <TrackSearch
          monitoredTracks={monitoredTracks}
          onAdd={async (track: MonitoredTrack) => {
            await addMonitoredTrack(track);
          }}
          onRemove={async (id: string) => {
            await removeMonitoredTrack(id);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </SafeAreaView>
    ) // end mobile branch
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:             { flex: 1 },

  header:             { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  headerEyebrow:      { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  headerTitle:        { fontSize: FontSize.lg, fontWeight: '900' },
  headerCopy:         { fontSize: FontSize.xs, lineHeight: 18, marginTop: 4 },
  headerSub:          { fontSize: FontSize.xs, fontWeight: '700', marginTop: 2 },

  chipsScroll:        { borderBottomWidth: 1, maxHeight: 52 },
  chipsContent:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row', alignItems: 'center' },
  chip:               { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5 },
  chipEmoji:          { fontSize: 14 },
  chipLabel:          { fontSize: FontSize.xs, fontWeight: '700' },
  primaryDot:         { width: 6, height: 6, borderRadius: 3, marginLeft: 2 },
  manageChip:         {},

  sectionFilter:      { borderBottomWidth: 1, maxHeight: 46 },
  sectionFilterContent:{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row', alignItems: 'center' },
  sectionFilterChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  sectionFilterIcon:  { fontSize: 12 },
  sectionFilterLabel: { fontSize: FontSize.xs, fontWeight: '700' },
  fallbackBanner:     { margin: Spacing.md, marginTop: 0, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.md },
  fallbackBannerText: { fontSize: FontSize.xs, fontWeight: '700', lineHeight: 18 },

  feedContent:        { ...webContainer, gap: Spacing.md },

  sectionBlock:       { gap: Spacing.sm },
  sectionHeader:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderLeftWidth: 3, borderRadius: Radius.md },
  sectionIcon:        { fontSize: 18 },
  sectionTitle:       { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.5, flex: 1 },
  sectionRight:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionCount:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  sectionCountText:   { fontSize: 11, fontWeight: '900' },
  sectionChevron:     { fontSize: 18, fontWeight: '700' },

  emptySection:       { padding: Spacing.lg, borderRadius: Radius.lg, alignItems: 'center' },
  emptySectionText:   { fontSize: FontSize.sm },

  skeleton:           { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, gap: Spacing.sm, marginBottom: Spacing.sm },
  skeletonLine:       { height: 14, borderRadius: Radius.full },
});
