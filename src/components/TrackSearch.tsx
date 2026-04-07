/**
 * Sifter Skill_Up — TrackSearch
 * Modal for searching and selecting tracks to monitor.
 * Shows all available tracks, grouped by field.
 * Already-monitored tracks shown with remove option.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, Shadow,
} from '../theme';
import { searchTracks } from '../lib/trackFeedConfig';
import type { MonitoredTrack } from '../types/feed';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrackSearchProps {
  monitoredTracks: MonitoredTrack[];
  onAdd: (track: MonitoredTrack) => void;
  onRemove: (trackId: string) => void;
  onClose: () => void;
}

// ─── Field group headers ──────────────────────────────────────────────────────

const FIELD_META: Record<string, { label: string; emoji: string; color: string }> = {
  'crypto':        { label: 'Crypto & DeFi',   emoji: '₿',  color: '#F7931A' },
  'quant':         { label: 'Quantitative',     emoji: '📊', color: '#5B5FCF' },
  'supply-chain':  { label: 'Supply Chain',     emoji: '🔗', color: '#0EA5E9' },
};

// ─── Track row ────────────────────────────────────────────────────────────────

function TrackRow({
  track,
  isMonitored,
  isPrimary,
  onAdd,
  onRemove,
}: {
  track: MonitoredTrack;
  isMonitored: boolean;
  isPrimary: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.trackRow, { backgroundColor: colors.card, borderColor: isMonitored ? track.accentColor + '40' : colors.border }, Shadow.xs]}>
      {/* Left: dot + emoji + label */}
      <View style={[styles.trackDot, { backgroundColor: isMonitored ? track.accentColor : colors.bgTertiary }]} />
      <Text style={styles.trackEmoji}>{track.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.trackLabel, { color: colors.text }]}>{track.label}</Text>
        <Text style={[styles.trackField, { color: colors.textMuted }]}>
          {FIELD_META[track.fieldId]?.label ?? track.fieldId}
        </Text>
      </View>

      {/* Right: action */}
      {isPrimary ? (
        <View style={[styles.primaryBadge, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.primaryBadgeText, { color: colors.accent }]}>Active track</Text>
        </View>
      ) : isMonitored ? (
        <TouchableOpacity
          style={[styles.removeBtn, { borderColor: colors.red + '60' }]}
          onPress={onRemove}
        >
          <Text style={[styles.removeBtnText, { color: colors.red }]}>Remove</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: track.accentColor }]}
          onPress={onAdd}
        >
          <Text style={styles.addBtnText}>+ Monitor</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── TrackSearch ──────────────────────────────────────────────────────────────

export function TrackSearch({ monitoredTracks, onAdd, onRemove, onClose }: TrackSearchProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchTracks(query), [query]);

  // Group by field
  const grouped = useMemo(() => {
    const groups: Record<string, MonitoredTrack[]> = {};
    for (const t of results) {
      if (!groups[t.fieldId]) groups[t.fieldId] = [];
      groups[t.fieldId].push(t);
    }
    return groups;
  }, [results]);

  const monitoredIds = new Set(monitoredTracks.map(t => t.id));
  const primaryId    = monitoredTracks.find(t => t.isPrimary)?.id;

  // Flatten with section headers for FlatList
  type ListItem =
    | { type: 'header'; fieldId: string }
    | { type: 'track';  track: MonitoredTrack };

  const listData = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    for (const fieldId of Object.keys(grouped)) {
      items.push({ type: 'header', fieldId });
      for (const t of grouped[fieldId]) {
        items.push({ type: 'track', track: t });
      }
    }
    return items;
  }, [grouped]);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.sheet, { backgroundColor: colors.bg }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Monitor Tracks</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Context line */}
        <View style={[styles.contextBanner, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.contextText, { color: colors.accent }]}>
            Your feed shows content from all monitored tracks. Your active learning track is always included.
          </Text>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search tracks or fields…"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Currently monitoring summary */}
        {monitoredTracks.length > 0 && !query && (
          <View style={[styles.monitoredSection, { borderBottomColor: colors.border }]}>
            <Text style={[styles.monitoredLabel, { color: colors.textMuted }]}>
              CURRENTLY MONITORING ({monitoredTracks.length})
            </Text>
            <View style={styles.monitoredPills}>
              {monitoredTracks.map(t => (
                <View key={t.id} style={[styles.monitoredPill, { backgroundColor: t.accentColor + '18', borderColor: t.accentColor + '40' }]}>
                  <Text style={styles.monitoredPillEmoji}>{t.emoji}</Text>
                  <Text style={[styles.monitoredPillLabel, { color: t.accentColor }]}>{t.label}</Text>
                  {!t.isPrimary && (
                    <TouchableOpacity onPress={() => onRemove(t.id)}>
                      <Text style={{ color: t.accentColor, fontSize: 14, marginLeft: 4 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        <FlatList
          data={listData}
          keyExtractor={(item) =>
            item.type === 'header' ? `h-${item.fieldId}` : `t-${item.track.id}`
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              const meta = FIELD_META[item.fieldId];
              return (
                <View style={[styles.fieldHeader, { borderBottomColor: colors.border }]}>
                  <Text style={styles.fieldHeaderEmoji}>{meta?.emoji ?? '📁'}</Text>
                  <Text style={[styles.fieldHeaderLabel, { color: meta?.color ?? colors.textSoft }]}>
                    {meta?.label ?? item.fieldId}
                  </Text>
                </View>
              );
            }
            return (
              <TrackRow
                track={item.track}
                isMonitored={monitoredIds.has(item.track.id)}
                isPrimary={item.track.id === primaryId}
                onAdd={() => onAdd(item.track)}
                onRemove={() => onRemove(item.track.id)}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No tracks found for "{query}"
            </Text>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheet:            { flex: 1 },

  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  closeBtn:         { fontSize: 20, fontWeight: FontWeight.bold, width: 40 },
  headerTitle:      { fontSize: FontSize.lg, fontWeight: FontWeight.black },

  contextBanner:    { padding: Spacing.md, paddingHorizontal: Spacing.lg },
  contextText:      { fontSize: FontSize.sm, lineHeight: 18 },

  searchRow:        { padding: Spacing.md, borderBottomWidth: 1 },
  searchBox:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1.5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  searchInput:      { flex: 1, fontSize: FontSize.md },

  monitoredSection: { padding: Spacing.lg, borderBottomWidth: 1, gap: Spacing.sm },
  monitoredLabel:   { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  monitoredPills:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  monitoredPill:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1.5 },
  monitoredPillEmoji:{ fontSize: 14 },
  monitoredPillLabel:{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginLeft: 4 },

  list:             { padding: Spacing.md, gap: Spacing.sm },

  fieldHeader:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs, borderBottomWidth: 1, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  fieldHeaderEmoji: { fontSize: 18 },
  fieldHeaderLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.black, letterSpacing: 0.6 },

  trackRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5 },
  trackDot:         { width: 8, height: 8, borderRadius: 4 },
  trackEmoji:       { fontSize: 20 },
  trackLabel:       { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  trackField:       { fontSize: FontSize.xs, marginTop: 2 },

  primaryBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  primaryBadgeText: { fontSize: 10, fontWeight: FontWeight.black },

  addBtn:           { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full },
  addBtnText:       { fontSize: FontSize.xs, fontWeight: FontWeight.black, color: '#fff' },

  removeBtn:        { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5 },
  removeBtnText:    { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  emptyText:        { textAlign: 'center', marginTop: Spacing.xxl, fontSize: FontSize.md },
});
