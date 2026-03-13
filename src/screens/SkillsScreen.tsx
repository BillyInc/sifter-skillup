import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, FlatList,
} from 'react-native';
import {
  SKILL_TRACKS, SKILL_CATEGORIES,
  type SkillTrack, type SkillCategory,
} from '../data/skills';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

// ── Difficulty badge ───────────────────────────────────────────────────────
const DIFF_COLORS = {
  beginner:     { bg: '#f0fdf4', text: '#166534' },
  intermediate: { bg: '#fffbeb', text: '#92400e' },
  advanced:     { bg: '#fef2f2', text: '#991b1b' },
  expert:       { bg: '#f5f3ff', text: '#4c1d95' },
};

function DiffBadge({ level }: { level: SkillTrack['difficulty'] }) {
  const c = DIFF_COLORS[level];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{level.toUpperCase()}</Text>
    </View>
  );
}

// ── Skill track card ───────────────────────────────────────────────────────
function SkillCard({ track, onPress, status }: { track: SkillTrack; onPress: () => void; status: 'live' | 'gated' | 'soon' }) {
  const badgeLabel = status === 'live' ? '⚡ AVAILABLE' : status === 'gated' ? '🔒 PYTHON FIRST' : 'COMING SOON';
  const badgeBg = status === 'live' ? 'rgba(0,255,128,0.25)' : status === 'gated' ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.15)';
  return (
    <TouchableOpacity style={[styles.card, Shadow.sm]} onPress={onPress} activeOpacity={0.85}>
      {/* Color bar + icon */}
      <View style={[styles.cardAccent, { backgroundColor: track.color }]}>
        <Text style={styles.cardIcon}>{track.icon}</Text>
        <View style={styles.cardAccentRight}>
          <DiffBadge level={track.difficulty} />
          <View style={[styles.comingSoonBadge, { backgroundColor: badgeBg }]}>
            <Text style={styles.comingSoonText}>{badgeLabel}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{track.name}</Text>
        <Text style={styles.cardTagline}>{track.tagline}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{track.description}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>⏱ Hours</Text>
            <Text style={styles.statValue}>{track.estimatedHours}h</Text>
          </View>
          <View style={[styles.stat, styles.statMid]}>
            <Text style={styles.statLabel}>📦 Modules</Text>
            <Text style={styles.statValue}>{track.modules.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>💰 Earning</Text>
            <Text style={[styles.statValue, styles.statEarning]} numberOfLines={1}>{track.earningPotential}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Track detail modal ─────────────────────────────────────────────────────
function TrackModal({ track, onClose }: { track: SkillTrack; onClose: () => void }) {
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: track.color }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalIcon}>{track.icon}</Text>
            <Text style={styles.modalTitle}>{track.name}</Text>
            <Text style={styles.modalTagline}>{track.tagline}</Text>
            <View style={styles.modalBadgeRow}>
              <DiffBadge level={track.difficulty} />
              <View style={[styles.comingSoonBadge, { marginLeft: Spacing.sm }]}>
                <Text style={styles.comingSoonText}>COMING SOON</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalContent}>
            {/* Description */}
            <Text style={styles.sectionTitle}>About this track</Text>
            <Text style={styles.modalDesc}>{track.description}</Text>

            {/* Stats */}
            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatVal}>{track.estimatedHours}h</Text>
                <Text style={styles.modalStatLabel}>Estimated</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatVal}>{track.modules.length}</Text>
                <Text style={styles.modalStatLabel}>Modules</Text>
              </View>
              <View style={[styles.modalStat, { flex: 1.5 }]}>
                <Text style={[styles.modalStatVal, { fontSize: FontSize.sm }]}>{track.earningPotential}</Text>
                <Text style={styles.modalStatLabel}>Earning potential</Text>
              </View>
            </View>

            {/* Real-world outcomes */}
            <Text style={styles.sectionTitle}>What you will be able to do</Text>
            {track.realWorldOutcomes.map((outcome, i) => (
              <View key={i} style={styles.outcomeRow}>
                <Text style={[styles.outcomeDot, { color: track.color }]}>✓</Text>
                <Text style={styles.outcomeText}>{outcome}</Text>
              </View>
            ))}

            {/* Modules */}
            <Text style={styles.sectionTitle}>Curriculum ({track.modules.length} modules)</Text>
            {track.modules.map((mod, i) => (
              <View key={mod.id} style={styles.moduleRow}>
                <View style={[styles.moduleNum, { backgroundColor: track.color + '20' }]}>
                  <Text style={[styles.moduleNumText, { color: track.color }]}>{i + 1}</Text>
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleTitle}>{mod.title}</Text>
                  <Text style={styles.moduleDesc}>{mod.description}</Text>
                </View>
                <Text style={styles.moduleLock}>🔒</Text>
              </View>
            ))}

            {/* CTA */}
            <View style={styles.ctaBox}>
              <Text style={styles.ctaTitle}>🚀 Coming Soon</Text>
              <Text style={styles.ctaBody}>
                This track is in development. Complete the crypto islands below to prepare — the knowledge carries over directly.
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ── Category filter bar ────────────────────────────────────────────────────
type Filter = SkillCategory | 'all';

function FilterBar({ active, onChange }: { active: Filter; onChange: (f: Filter) => void }) {
  const filters: { key: Filter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '⚡' },
    ...Object.entries(SKILL_CATEGORIES).map(([key, val]) => ({ key: key as SkillCategory, label: val.label, icon: val.icon })),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
      {filters.map(f => {
        const isActive = active === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, isActive && styles.filterPillActive]}
            onPress={() => onChange(f.key)}
            activeOpacity={0.8}
          >
            <Text style={styles.filterIcon}>{f.icon}</Text>
            <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function SkillsScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedTrack, setSelectedTrack] = useState<SkillTrack | null>(null);
  const navigation = useNavigation<any>();

  const { quantDeveloperUnlocked } = useAuth();

  const getTrackStatus = (track: SkillTrack): 'live' | 'gated' | 'soon' => {
    if (track.id === 'quant-trading' || track.id === 'quant-research') return 'live';
    if (track.id === 'quant-developer') return quantDeveloperUnlocked ? 'live' : 'gated';
    return 'soon';
  };

  const handleTrackPress = (track: SkillTrack) => {
    const status = getTrackStatus(track);
    if (track.id === 'quant-trading' || track.id === 'quant-research') {
      navigation.navigate('Quant');
    } else if (track.id === 'quant-developer' && status === 'live') {
      navigation.navigate('Quant'); // will route to developer map when built
    } else {
      setSelectedTrack(track);
    }
  };

  const visible = activeFilter === 'all'
    ? SKILL_TRACKS
    : SKILL_TRACKS.filter(t => t.category === activeFilter);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎓 Skill Tracks</Text>
          <Text style={styles.headerSub}>{SKILL_TRACKS.length} careers · all coming soon</Text>
        </View>
      </View>

      {/* Hero banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>Choose your crypto career</Text>
        <Text style={styles.heroSub}>
          Complete the crypto islands to unlock. Each track teaches a real, money-earning skill path.
        </Text>
      </View>

      {/* Filter */}
      <FilterBar active={activeFilter} onChange={setActiveFilter} />

      {/* Track list */}
      <FlatList
        data={visible}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SkillCard track={item} onPress={() => handleTrackPress(item)} status={getTrackStatus(item)} />
        )}
        ListFooterComponent={<View style={{ height: 32 }} />}
      />

      {/* Detail modal */}
      {selectedTrack && (
        <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />
      )}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:             { flex: 1, backgroundColor: Colors.bg },

  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:        { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub:          { fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 2 },

  heroBanner:         { backgroundColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  heroTitle:          { fontSize: FontSize.xxl, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroSub:            { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },

  filterScroll:       { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterContent:      { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.xs, flexDirection: 'row' },
  filterPill:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border },
  filterPillActive:   { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterIcon:         { fontSize: 14 },
  filterLabel:        { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSoft },
  filterLabelActive:  { color: '#fff' },

  listContent:        { padding: Spacing.lg, gap: Spacing.md },

  // Card
  card:               { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border },
  cardAccent:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  cardIcon:           { fontSize: 32 },
  cardAccentRight:    { alignItems: 'flex-end', gap: Spacing.xs },
  cardBody:           { padding: Spacing.lg },
  cardName:           { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: 2 },
  cardTagline:        { fontSize: FontSize.md, fontWeight: '700', color: Colors.accent, marginBottom: 6 },
  cardDesc:           { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginBottom: Spacing.md },

  statsRow:           { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md, gap: Spacing.sm },
  stat:               { flex: 1, alignItems: 'center' },
  statMid:            { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statLabel:          { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  statValue:          { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  statEarning:        { fontSize: 10, color: Colors.green, textAlign: 'center' },

  badge:              { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeText:          { fontSize: 10, fontWeight: '800' },
  comingSoonBadge:    { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  comingSoonText:     { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Modal
  modalSafe:          { flex: 1, backgroundColor: Colors.bg },
  modalScroll:        { flex: 1 },
  modalHeader:        { paddingTop: Spacing.xxxl, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  closeBtn:           { position: 'absolute', top: Spacing.lg, right: Spacing.lg, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:       { color: '#fff', fontWeight: '900', fontSize: 16 },
  modalIcon:          { fontSize: 48, marginBottom: Spacing.sm },
  modalTitle:         { fontSize: FontSize.xxl, fontWeight: '900', color: '#fff', textAlign: 'center' },
  modalTagline:       { fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4, marginBottom: Spacing.md },
  modalBadgeRow:      { flexDirection: 'row', alignItems: 'center' },
  modalContent:       { padding: Spacing.lg },
  modalDesc:          { fontSize: FontSize.md, color: Colors.textSoft, lineHeight: 22, marginBottom: Spacing.xl },
  modalStats:         { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  modalStat:          { flex: 1, alignItems: 'center' },
  modalStatVal:       { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  modalStatLabel:     { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  sectionTitle:       { fontSize: FontSize.md, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm },
  outcomeRow:         { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  outcomeDot:         { fontSize: 16, fontWeight: '900', lineHeight: 22 },
  outcomeText:        { flex: 1, fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },
  moduleRow:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  moduleNum:          { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  moduleNumText:      { fontSize: FontSize.sm, fontWeight: '900' },
  moduleInfo:         { flex: 1 },
  moduleTitle:        { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  moduleDesc:         { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  moduleLock:         { fontSize: 16 },
  ctaBox:             { backgroundColor: Colors.accentSoft, borderRadius: Radius.lg, padding: Spacing.lg, marginTop: Spacing.xl, borderWidth: 1.5, borderColor: Colors.accent + '40' },
  ctaTitle:           { fontSize: FontSize.lg, fontWeight: '900', color: Colors.accent, marginBottom: Spacing.sm },
  ctaBody:            { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },
});
