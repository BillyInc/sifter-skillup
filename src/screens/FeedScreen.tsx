/**
 * Sifter Skill_Up — Feed Screen
 * Tab name: 📰 Feed
 * Replaces Community + Guild.
 *
 * - Auto-loads user's primary active track on mount
 * - Monitored tracks shown as filter chips
 * - "+ Monitor" opens TrackSearch to add more
 * - Sections scroll vertically, each with its FeedCards
 * - Tap 💬 on any card → CommentSheet (threaded + image upload)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, SectionList, RefreshControl,
  Platform, useWindowDimensions,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { useAuth } from '../hooks/useAuth';
import FeedWebLayout from '../components/FeedWebLayout';
import { useFeed } from '../hooks/useFeed';
import { FeedCard } from '../components/FeedCard';
import { CommentSheet } from '../components/CommentSheet';
import { TrackSearch } from '../components/TrackSearch';
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
      style={[styles.chipsScroll, { borderBottomColor: colors.border }]}
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
                backgroundColor: isActive ? track.accentColor : colors.card,
                borderColor: isActive ? track.accentColor : colors.border,
              },
            ]}
          >
            <Text style={styles.chipEmoji}>{track.emoji}</Text>
            <Text style={[styles.chipLabel, { color: isActive ? '#fff' : colors.textSoft }]}>
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
        style={[styles.chip, styles.manageChip, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
      >
        <Text style={[styles.chipLabel, { color: colors.textMuted }]}>+ Monitor</Text>
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
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.sectionRight}>
        <View style={[styles.sectionCount, { backgroundColor: color + '20' }]}>
          <Text style={[styles.sectionCountText, { color }]}>{count}</Text>
        </View>
        <Text style={[styles.sectionChevron, { color: colors.textMuted }]}>
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
    <View style={[styles.skeleton, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.bgSecondary }]} />
      <View style={[styles.skeletonLine, { width: '90%', backgroundColor: colors.bgSecondary }]} />
      <View style={[styles.skeletonLine, { width: '70%', backgroundColor: colors.bgSecondary }]} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const { colors }  = useTheme();
  const { user }    = useAuth();
  const { width }   = useWindowDimensions();
  const isWebWide   = Platform.OS === 'web' && width >= 768;

  const userContext: UserFeedContext = {
    primaryTrackId: user?.current_track_id ?? 'defi-research-analyst',
    primaryFieldId: user?.active_field_id ?? 'crypto',
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
  const accentColor   = activeTrack?.accentColor ?? colors.accent;

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
    // Use the section's icon field instead of stripping emojis from the title
    // (multi-codepoint emoji like flags break the previous regex).
    ...sections.map(s => ({ id: s.section.id, label: s.section.title, icon: s.section.icon })),
  ];

  const visibleSections = sectionFilter === 'all'
    ? sections
    : sections.filter(s => s.section.id === sectionFilter);

  // Build SectionList-shaped sections. When a section is collapsed we still
  // pass an empty data array so the header is rendered (and can be tapped).
  const listSections = useMemo(
    () =>
      visibleSections.map(({ section, items, loading: sectionLoading }) => {
        const isCollapsed = collapsed[section.id] ?? false;
        let data: any[] = [];
        if (!isCollapsed) {
          if (sectionLoading) {
            data = [{ id: `${section.id}__loading`, __placeholder: 'loading' }];
          } else if (items.length === 0) {
            data = [{ id: `${section.id}__empty`, __placeholder: 'empty' }];
          } else {
            data = items;
          }
        }
        return {
          sectionId: section.id,
          title: section.title,
          icon: section.icon,
          totalCount: items.length,
          data,
        };
      }),
    [visibleSections, collapsed],
  );

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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>📰 Feed</Text>
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
        style={[styles.sectionFilter, { borderBottomColor: colors.border }]}
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
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor : colors.border,
                },
              ]}
            >
              <Text style={styles.sectionFilterIcon}>{opt.icon}</Text>
              <Text style={[styles.sectionFilterLabel, { color: isActive ? accentColor : colors.textSoft }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Feed (virtualized SectionList) ── */}
      {loading ? (
        <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </ScrollView>
      ) : (
        <SectionList
          sections={listSections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={accentColor} />
          }
          renderSectionHeader={({ section }) => {
            const isCollapsed = collapsed[section.sectionId] ?? false;
            return (
              <SectionHeader
                title={section.title}
                icon={section.icon}
                count={section.totalCount}
                collapsed={isCollapsed}
                onToggle={() => toggleSection(section.sectionId)}
                color={accentColor}
              />
            );
          }}
          renderItem={({ item, section }) => {
            const isCollapsed = collapsed[section.sectionId] ?? false;
            if (isCollapsed) return null;
            if ((item as any).__placeholder === 'empty') {
              return (
                <View style={[styles.emptySection, { backgroundColor: colors.card }]}>
                  <Text style={[styles.emptySectionText, { color: colors.textMuted }]}>
                    Loading {section.title.toLowerCase()}…
                  </Text>
                </View>
              );
            }
            if ((item as any).__placeholder === 'loading') {
              return <SkeletonCard />;
            }
            return (
              <FeedCard
                item={item as FeedItem}
                accentColor={accentColor}
                onReact={react}
                onComment={handleComment}
                onBookmark={bookmark}
              />
            );
          }}
          ListFooterComponent={<View style={{ height: Spacing.xxxl }} />}
        />
      )}

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

  header:             { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  headerTitle:        { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  headerSub:          { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginTop: 2 },

  chipsScroll:        { borderBottomWidth: 1, maxHeight: 54 },
  chipsContent:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row', alignItems: 'center' },
  chip:               { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5 },
  chipEmoji:          { fontSize: 14 },
  chipLabel:          { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  primaryDot:         { width: 6, height: 6, borderRadius: 3, marginLeft: 2 },
  manageChip:         {},

  sectionFilter:      { borderBottomWidth: 1, maxHeight: 48 },
  sectionFilterContent:{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row', alignItems: 'center' },
  sectionFilterChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  sectionFilterIcon:  { fontSize: 12 },
  sectionFilterLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  feedContent:        { padding: Spacing.md, gap: Spacing.md },

  sectionBlock:       { gap: Spacing.sm },
  sectionHeader:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingLeft: Spacing.md, borderLeftWidth: 3 },
  sectionIcon:        { fontSize: 18 },
  sectionTitle:       { fontSize: FontSize.sm, fontWeight: FontWeight.black, letterSpacing: 0.5, flex: 1 },
  sectionRight:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionCount:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  sectionCountText:   { fontSize: 11, fontWeight: FontWeight.black },
  sectionChevron:     { fontSize: 18, fontWeight: FontWeight.bold },

  emptySection:       { padding: Spacing.lg, borderRadius: Radius.lg, alignItems: 'center' },
  emptySectionText:   { fontSize: FontSize.sm },

  skeleton:           { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, gap: Spacing.sm, marginBottom: Spacing.sm },
  skeletonLine:       { height: 14, borderRadius: Radius.full },
});
