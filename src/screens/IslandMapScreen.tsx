import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ISLANDS, isIslandUnlocked, type Island } from '../data/islands';
import { getLevel } from '../data/levels';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useGameStore } from '../stores/gameStore';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import LessonScreen from './LessonScreen';

// ── Level dot ─────────────────────────────────────────────────
function LevelDot({ levelId, islandColor, onPress, completed, isBoss, locked }: {
  levelId: number; islandColor: string; onPress: () => void;
  completed: boolean; isBoss: boolean; locked: boolean;
}) {
  const size = isBoss ? 52 : 42;
  const bg   = locked ? Colors.border : completed ? islandColor : '#fff';
  const border = locked ? Colors.borderDark : islandColor;

  return (
    <TouchableOpacity
      onPress={locked ? undefined : onPress}
      style={[
        styles.levelDot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: border },
        !locked && Shadow.sm,
      ]}
      activeOpacity={locked ? 1 : 0.8}
    >
      <Text style={[styles.levelDotText, { color: locked ? Colors.textMuted : completed ? '#fff' : islandColor, fontSize: isBoss ? 18 : 14 }]}>
        {locked ? '🔒' : isBoss ? '⭐' : String(levelId)}
      </Text>
    </TouchableOpacity>
  );
}

// ── Island card ───────────────────────────────────────────────
function IslandCard({ island, completedLevels, onLevelPress, unlocked }: {
  island: Island; completedLevels: number[]; onLevelPress: (id: number) => void; unlocked: boolean;
}) {
  const total    = island.end - island.start + 1;
  const done     = completedLevels.filter(l => l >= island.start && l <= island.end).length;
  const pct      = Math.round((done / total) * 100);
  const tierColor = island.tier === 'beginner' ? Colors.beginner : island.tier === 'intermediate' ? Colors.intermediate : Colors.pro;

  // Build level grid (5 per row)
  const levels = Array.from({ length: total }, (_, i) => island.start + i);
  const rows: number[][] = [];
  for (let i = 0; i < levels.length; i += 5) rows.push(levels.slice(i, i + 5));

  return (
    <View style={[styles.islandCard, !unlocked && styles.islandCardLocked, Shadow.md]}>
      {/* Header */}
      <View style={[styles.islandHeader, { backgroundColor: island.color }]}>
        <Text style={styles.islandIcon}>{island.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={[styles.tierPill, { backgroundColor: tierColor + '30' }]}>
            <Text style={[styles.tierPillText, { color: tierColor }]}>{island.tier.toUpperCase()}</Text>
          </View>
          <Text style={styles.islandName}>{island.name}</Text>
          <Text style={styles.islandDesc} numberOfLines={2}>{island.description}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.islandProgress}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: island.color }]} />
        </View>
        <Text style={styles.progressLabel}>{done}/{total} levels · {pct}%</Text>
      </View>

      {/* Level dots grid */}
      {unlocked ? (
        <View style={styles.levelGrid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.levelRow}>
              {row.map(lvl => (
                <LevelDot
                  key={lvl}
                  levelId={lvl}
                  islandColor={island.color}
                  completed={completedLevels.includes(lvl)}
                  isBoss={lvl === island.bossLevel}
                  locked={false}
                  onPress={() => onLevelPress(lvl)}
                />
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedIcon}>🔒</Text>
          <Text style={styles.lockedText}>
            Complete Level {island.requiredLevel} to unlock
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────
export default function IslandMapScreen() {
  const { user } = useAuth();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const { hasPosition, lastPosition, loadPosition, clearPosition } = useGameStore();

  useEffect(() => {
    loadPosition();
  }, []);

  const completed = user?.completed_levels || [];

  // Sort islands by narrative order
  const orderedIslands = [...ISLANDS].sort((a, b) => {
    // Beginner first, then intermediate, then pro
    const tierOrder = { beginner: 0, intermediate: 1, pro: 2 };
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
    return a.start - b.start;
  });

  const handleLevelPress = useCallback((levelId: number) => setActiveLevelId(levelId), []);

  const handleLessonComplete = (stars: number, xp: number) => {
    setActiveLevelId(null);
    // refreshUser handled inside useProgress
  };

  const renderIslandCard = useCallback(({ item: island }: { item: Island }) => (
    <IslandCard
      island={island}
      completedLevels={completed}
      unlocked={isIslandUnlocked(island, completed)}
      onLevelPress={handleLevelPress}
    />
  ), [completed, handleLevelPress]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ Sifter Skill_Up</Text>
          <Text style={styles.headerSub}>Crypto · {completed.length}/270 levels</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statItem}>🔥 {user?.streak ?? 0}</Text>
          <Text style={styles.statItem}>⚡ {user?.points?.toLocaleString() ?? 0}</Text>
        </View>
      </View>

      {/* Resume button */}
      {hasPosition && lastPosition && (
        <TouchableOpacity
          style={styles.resumeButton}
          onPress={() => setActiveLevelId(Number(lastPosition.lessonId))}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeLabel}>Resume</Text>
            <Text style={styles.resumeDetail} numberOfLines={1}>
              {lastPosition.trackName} — {lastPosition.lessonTitle}
            </Text>
          </View>
          <Text style={styles.resumeArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Island list */}
      <FlashList
        data={orderedIslands}
        renderItem={renderIslandCard}
        estimatedItemSize={180}
        keyExtractor={(island) => island.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />

      {/* Lesson modal */}
      <Modal visible={activeLevelId !== null} animationType="slide" presentationStyle="fullScreen">
        {activeLevelId !== null && (
          <LessonScreen
            levelId={activeLevelId}
            onExit={() => setActiveLevelId(null)}
            onComplete={handleLessonComplete}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: Colors.bg },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:      { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub:        { fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 2 },
  headerStats:      { flexDirection: 'row', gap: Spacing.md },
  statItem:         { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },

  scrollContent:    { padding: Spacing.lg },

  resumeButton:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  resumeLabel:      { fontSize: FontSize.xs, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  resumeDetail:     { fontSize: FontSize.sm, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  resumeArrow:      { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },

  islandCard:       { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border },
  islandCardLocked: { opacity: 0.6 },
  islandHeader:     { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.lg, gap: Spacing.md },
  islandIcon:       { fontSize: 36, lineHeight: 44 },
  tierPill:         { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, marginBottom: 4 },
  tierPillText:     { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  islandName:       { fontSize: FontSize.xl, fontWeight: '900', color: '#fff', lineHeight: 26 },
  islandDesc:       { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 3, lineHeight: 18 },

  islandProgress:   { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  progressTrack:    { height: 8, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' },
  progressFill:     { height: 8, borderRadius: 99 },
  progressLabel:    { fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '600' },

  levelGrid:        { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  levelRow:         { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-start' },
  levelDot:         { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5 },
  levelDotText:     { fontWeight: '800' },

  lockedOverlay:    { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  lockedIcon:       { fontSize: 32 },
  lockedText:       { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
});
