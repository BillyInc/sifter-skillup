// ⚡ Sifter Skill_Up — Quant Map Screen
// Quant-themed environment: Labs, Desks, Floors, Chambers, War Rooms
// instead of islands. Same mechanics as IslandMapScreen but different
// visual language and the VR unlock prompt on boss completion.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, Alert,
} from 'react-native';
import { QUANT_LABS, isQuantLabUnlocked, type QuantLab } from '../data/quantIslands';
import { getQuantLevel, quantLevelToLevel, QUANT_LEVELS } from '../data/quantLevels';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import LessonScreen from './LessonScreen';
import { VRBridge } from '../vr/VRBridge';
import type { VRScenarioKey } from '../vr/VRBridge';

// ── Tier colour map ───────────────────────────────────────────
const TIER_COLORS = {
  foundation:   '#22c55e',
  intermediate: '#f59e0b',
  advanced:     '#8b5cf6',
  elite:        '#ef4444',
};
const TIER_LABELS = {
  foundation:   'Foundation',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
  elite:        'Elite',
};

// ── Level dot ─────────────────────────────────────────────────
function LevelDot({ levelId, labColor, onPress, completed, isBoss, locked, interviewStyle }: {
  levelId: number; labColor: string; onPress: () => void;
  completed: boolean; isBoss: boolean; locked: boolean; interviewStyle?: boolean;
}) {
  const size = isBoss ? 54 : 42;
  const bg = locked ? Colors.border : completed ? labColor : '#fff';
  const border = locked ? Colors.borderDark ?? '#cbd5e1' : labColor;
  const emoji = locked ? '🔒' : isBoss ? (interviewStyle ? '⚔️' : '⭐') : undefined;

  return (
    <TouchableOpacity
      onPress={locked ? undefined : onPress}
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: border },
        !locked && Shadow.sm,
      ]}
      activeOpacity={locked ? 1 : 0.8}
    >
      {emoji
        ? <Text style={{ fontSize: isBoss ? 20 : 14 }}>{emoji}</Text>
        : <Text style={[styles.dotText, { color: completed ? '#fff' : labColor, fontSize: isBoss ? 16 : 12 }]}>
            {String(levelId - 1000)}
          </Text>}
    </TouchableOpacity>
  );
}

// ── Lab card ──────────────────────────────────────────────────
function LabCard({ lab, completedLevels, onLevelPress, unlocked }: {
  lab: QuantLab; completedLevels: number[];
  onLevelPress: (id: number) => void; unlocked: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = lab.end - lab.start + 1;
  const done  = completedLevels.filter(l => l >= lab.start && l <= lab.end).length;
  const pct   = Math.round((done / total) * 100);
  const tierColor = TIER_COLORS[lab.tier];

  const levels = Array.from({ length: total }, (_, i) => lab.start + i);
  const rows: number[][] = [];
  for (let i = 0; i < levels.length; i += 5) rows.push(levels.slice(i, i + 5));

  return (
    <View style={[styles.labCard, !unlocked && styles.labCardLocked, Shadow.md]}>
      {/* Header */}
      <TouchableOpacity
        style={[styles.labHeader, { backgroundColor: lab.color }]}
        onPress={() => unlocked && setExpanded(e => !e)}
        activeOpacity={unlocked ? 0.85 : 1}
      >
        <Text style={styles.labIcon}>{lab.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={[styles.tierPill, { backgroundColor: tierColor + '30' }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>{TIER_LABELS[lab.tier].toUpperCase()}</Text>
          </View>
          <Text style={styles.labName}>{lab.name}</Text>
          <Text style={styles.labSubtitle}>{lab.subtitle}</Text>
        </View>
        {unlocked && (
          <Text style={{ color: '#fff', fontSize: 18, opacity: 0.8 }}>{expanded ? '▲' : '▼'}</Text>
        )}
      </TouchableOpacity>

      {/* Description */}
      <View style={styles.labBody}>
        <Text style={styles.labDesc}>{lab.description}</Text>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: lab.color }]} />
          </View>
          <Text style={styles.progressLabel}>{done}/{total} · {pct}%</Text>
        </View>

        {/* VR badge */}
        {lab.vrScenario && done >= total && (
          <View style={[styles.vrBadge, { borderColor: lab.color }]}>
            <Text style={styles.vrBadgeIcon}>🥽</Text>
            <Text style={[styles.vrBadgeText, { color: lab.color }]}>VR Scenario Unlocked</Text>
          </View>
        )}
      </View>

      {/* Level grid */}
      {unlocked && expanded ? (
        <View style={styles.levelGrid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.levelRow}>
              {row.map(lvl => {
                const ql = QUANT_LEVELS[lvl];
                return (
                  <LevelDot
                    key={lvl}
                    levelId={lvl}
                    labColor={lab.color}
                    completed={completedLevels.includes(lvl)}
                    isBoss={lvl === lab.bossLevel}
                    locked={false}
                    interviewStyle={ql?.interviewStyle}
                    onPress={() => onLevelPress(lvl)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      ) : !unlocked ? (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedText}>
            Complete Level {lab.requiredLevel - 1000} boss to unlock
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ── VR prompt modal ───────────────────────────────────────────
function VRPromptModal({ visible, scenarioKey, labName, onDismiss }: {
  visible: boolean; scenarioKey: VRScenarioKey | undefined;
  labName: string; onDismiss: () => void;
}) {
  if (!scenarioKey) return null;
  const info = VRBridge.getScenarioInfo(scenarioKey);

  const launchVR = async () => {
    const { launched, error } = await VRBridge.launchScenario(
      { scenarioKey, userId: 'user', userDisplayName: 'Trader', difficultyLevel: 'training' },
      (result) => {
        Alert.alert('VR Session Complete', `Score: ${result.score}/100\n${result.feedbackSummary}`);
      }
    );
    if (!launched) {
      Alert.alert('VR Coming Soon', error ?? 'VR environment launching soon. Your progress is saved.');
    }
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.vrOverlay}>
        <View style={[styles.vrModal, Shadow.md]}>
          <Text style={styles.vrModalIcon}>🥽</Text>
          <Text style={styles.vrModalTitle}>VR Scenario Unlocked</Text>
          <Text style={styles.vrModalLab}>{labName}</Text>
          <Text style={styles.vrModalName}>{info.title}</Text>
          <Text style={styles.vrModalDesc}>{info.description}</Text>
          <View style={styles.vrModalMeta}>
            <Text style={styles.vrMetaItem}>⏱ ~{info.estimatedMinutes} min</Text>
            <Text style={styles.vrMetaItem}>🎯 {info.type}</Text>
            {info.requiresHaptics && <Text style={styles.vrMetaItem}>🤲 Haptics</Text>}
          </View>
          <TouchableOpacity style={styles.vrLaunchBtn} onPress={launchVR} activeOpacity={0.85}>
            <Text style={styles.vrLaunchBtnText}>Launch VR Experience</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vrDismissBtn} onPress={onDismiss}>
            <Text style={styles.vrDismissBtnText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Header stats ──────────────────────────────────────────────
function QuantHeader({ completedLevels }: { completedLevels: number[] }) {
  const total = Object.keys(QUANT_LEVELS).length;
  const done  = completedLevels.filter(l => l >= 1001 && l <= 1090).length;
  const labsDone = QUANT_LABS.filter(lab =>
    completedLevels.includes(lab.bossLevel)
  ).length;

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>⚡ Quant Program</Text>
        <Text style={styles.headerSub}>Trader Track</Text>
      </View>
      <View style={styles.headerStats}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{done}</Text>
          <Text style={styles.statLabel}>Levels</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{labsDone}</Text>
          <Text style={styles.statLabel}>Labs Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
      <View style={styles.overallBar}>
        <View style={[styles.overallFill, { width: `${Math.round((done/total)*100)}%` }]} />
      </View>
      <Text style={styles.overallLabel}>{Math.round((done/total)*100)}% complete</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────
export default function QuantMapScreen() {
  const { user } = useAuth();
  const { completeLevel } = useProgress();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [vrPrompt, setVrPrompt] = useState<{ scenarioKey: VRScenarioKey; labName: string } | null>(null);

  const completed = user?.completed_levels ?? [];

  const handleLevelPress = (id: number) => setActiveLevelId(id);

  const handleLevelComplete = async (stars: number, xp: number) => {
    if (!activeLevelId) return;
    await completeLevel(activeLevelId, xp, stars === 3);

    // Check if this was a boss with VR unlock
    const ql = QUANT_LEVELS[activeLevelId];
    const lab = QUANT_LABS.find(l => l.bossLevel === activeLevelId);
    if (ql?.vrUnlock && lab?.vrScenario) {
      setTimeout(() => {
        setVrPrompt({ scenarioKey: lab.vrScenario as VRScenarioKey, labName: lab.name });
      }, 600);
    }
    setActiveLevelId(null);
  };

  if (activeLevelId) {
    const ql = QUANT_LEVELS[activeLevelId];
    if (!ql) { setActiveLevelId(null); return null; }
    const level = quantLevelToLevel(ql);
    return (
      <LessonScreen
        levelId={activeLevelId}
        onExit={() => setActiveLevelId(null)}
        onComplete={handleLevelComplete}
        overrideLevel={level}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuantHeader completedLevels={completed} />

        {QUANT_LABS.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            completedLevels={completed}
            onLevelPress={handleLevelPress}
            unlocked={isQuantLabUnlocked(lab, completed)}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>🥽 Complete lab bosses to unlock VR scenarios</Text>
          <Text style={styles.footerSub}>Researcher & Developer tracks coming in Phase B</Text>
        </View>
      </ScrollView>

      <VRPromptModal
        visible={!!vrPrompt}
        scenarioKey={vrPrompt?.scenarioKey}
        labName={vrPrompt?.labName ?? ''}
        onDismiss={() => setVrPrompt(null)}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  scroll:         { flex: 1 },
  scrollContent:  { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },

  // Header
  header:         { backgroundColor: Colors.navy, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md },
  headerTop:      { gap: 2 },
  headerTitle:    { fontSize: FontSize.xxl, fontWeight: '900', color: '#fff' },
  headerSub:      { fontSize: FontSize.sm, color: '#94a3b8', fontWeight: '600' },
  headerStats:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stat:           { alignItems: 'center' },
  statVal:        { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  statLabel:      { fontSize: FontSize.xs, color: '#94a3b8', fontWeight: '600' },
  statDivider:    { width: 1, height: 32, backgroundColor: '#334155' },
  overallBar:     { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  overallFill:    { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  overallLabel:   { fontSize: FontSize.xs, color: '#94a3b8', textAlign: 'center', fontWeight: '600' },

  // Lab card
  labCard:        { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  labCardLocked:  { opacity: 0.65 },
  labHeader:      { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, alignItems: 'flex-start' },
  labIcon:        { fontSize: 32, lineHeight: 40 },
  labName:        { fontSize: FontSize.lg, fontWeight: '900', color: '#fff', marginTop: 2 },
  labSubtitle:    { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  tierPill:       { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  tierText:       { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  labBody:        { padding: Spacing.lg, gap: Spacing.md },
  labDesc:        { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },
  progressRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressTrack:  { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 3 },
  progressLabel:  { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', minWidth: 60, textAlign: 'right' },

  // VR badge
  vrBadge:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  vrBadgeIcon:    { fontSize: 14 },
  vrBadgeText:    { fontSize: FontSize.xs, fontWeight: '800' },

  // Level grid
  levelGrid:      { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  levelRow:       { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-start' },
  dot:            { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText:        { fontWeight: '800' },

  // Locked
  lockedOverlay:  { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  lockedIcon:     { fontSize: 28 },
  lockedText:     { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },

  // VR modal
  vrOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  vrModal:        { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.xl, width: '100%', maxWidth: 380, gap: Spacing.md },
  vrModalIcon:    { fontSize: 48, textAlign: 'center' },
  vrModalTitle:   { fontSize: FontSize.lg, fontWeight: '900', color: Colors.accent, textAlign: 'center' },
  vrModalLab:     { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', fontWeight: '600' },
  vrModalName:    { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  vrModalDesc:    { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, textAlign: 'center' },
  vrModalMeta:    { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  vrMetaItem:     { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  vrLaunchBtn:    { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  vrLaunchBtnText:{ color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  vrDismissBtn:   { alignItems: 'center', paddingVertical: Spacing.sm },
  vrDismissBtnText:{ color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' },

  // Footer
  footer:         { alignItems: 'center', gap: 6, paddingTop: Spacing.md },
  footerText:     { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600', textAlign: 'center' },
  footerSub:      { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});

// ── Python Gate Banner (shown on Quant Trader map after Lab 7, before Lab 8) ──
// This is appended as a named export for use wherever the gate status matters
export function PythonGateBanner({ chaptersCompleted, required }: { chaptersCompleted: number; required: number }) {
  const { Colors, Spacing, Radius, FontSize } = require('../theme');
  const { View, Text, StyleSheet } = require('react-native');
  const done = chaptersCompleted >= required;
  return (
    <View style={{
      margin: Spacing.md,
      padding: Spacing.lg,
      borderRadius: Radius.lg,
      backgroundColor: done ? '#d1fae5' : '#fef3c7',
      borderWidth: 1.5,
      borderColor: done ? '#10b981' : '#f59e0b',
    }}>
      <Text style={{ fontSize: FontSize.sm, fontWeight: '800', color: done ? '#065f46' : '#92400e', marginBottom: 4 }}>
        {done ? '✅ Lab 8 Unlocked — Applied Quant Python' : '🔒 Lab 8 Requires Python Foundations'}
      </Text>
      <Text style={{ fontSize: FontSize.xs, color: done ? '#065f46' : '#92400e', lineHeight: 18 }}>
        {done
          ? 'You\'ve completed the Python prerequisites. Lab 8 implements everything from Labs 0–7 in real code.'
          : `Complete Python chapters 1–5 (${chaptersCompleted}/${required} done) before starting the Applied Quant Python lab. You need the basics to write the implementations.`}
      </Text>
    </View>
  );
}
