import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUANT_LABS, isQuantLabUnlocked, type QuantLab } from '../data/quantIslands';
import { QUANT_LEVELS } from '../data/quantLevels';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { Colors, Spacing, Radius, FontSize, Shadow, useTheme } from '../theme';
import LessonScreen from './LessonScreen';
import { VRBridge } from '../lib/vrBridge';
import type { VRScenarioKey } from '../lib/vrBridge';
import DisclaimerFooter from '../components/DisclaimerFooter';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebSectionLabel, WebStatTile, WebListRow, useIsWebWide,
} from '../components/web/WebGrid';

const TIER_COLORS = {
  foundation: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#8b5cf6',
  elite: '#ef4444',
};

const TIER_LABELS = {
  foundation: 'Foundation',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};

type LabState = 'locked' | 'continue' | 'review' | 'ready';

function getFirstActiveLab(completedLevels: number[]) {
  return QUANT_LABS.find(lab => isQuantLabUnlocked(lab, completedLevels) && !completedLevels.includes(lab.bossLevel));
}

function getLabState(lab: QuantLab, completedLevels: number[]): LabState {
  if (!isQuantLabUnlocked(lab, completedLevels)) return 'locked';
  if (completedLevels.includes(lab.bossLevel)) return 'review';
  if (getFirstActiveLab(completedLevels)?.id === lab.id) return 'continue';
  return 'ready';
}

function LevelDot({ levelId, labColor, onPress, completed, isBoss, locked, interviewStyle }: {
  levelId: number; labColor: string; onPress: () => void;
  completed: boolean; isBoss: boolean; locked: boolean; interviewStyle?: boolean;
}) {
  const size = isBoss ? 54 : 42;
  const bg = locked ? Colors.border : completed ? labColor : '#fff';
  const border = locked ? Colors.borderDark ?? '#cbd5e1' : labColor;
  const emoji = locked ? 'L' : isBoss ? (interviewStyle ? 'X' : 'B') : undefined;

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
        ? <Text style={{ fontSize: isBoss ? 18 : 14, fontWeight: '800' }}>{emoji}</Text>
        : <Text style={[styles.dotText, { color: completed ? '#fff' : labColor, fontSize: isBoss ? 16 : 12 }]}>
            {String(levelId - 1000)}
          </Text>}
    </TouchableOpacity>
  );
}

function LabCard({ lab, completedLevels, onLevelPress, unlocked }: {
  lab: QuantLab; completedLevels: number[];
  onLevelPress: (id: number) => void; unlocked: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = lab.end - lab.start + 1;
  const done = completedLevels.filter(l => l >= lab.start && l <= lab.end).length;
  const pct = Math.round((done / total) * 100);
  const tierColor = TIER_COLORS[lab.tier];
  const state = getLabState(lab, completedLevels);
  const stateColor = state === 'review' ? '#10B981' : state === 'continue' ? lab.color : state === 'ready' ? tierColor : Colors.textMuted;
  const stateLabel = state === 'review' ? 'Review' : state === 'continue' ? 'Continue' : state === 'ready' ? 'Start' : 'Locked';

  const levels = Array.from({ length: total }, (_, i) => lab.start + i);
  const rows: number[][] = [];
  for (let i = 0; i < levels.length; i += 5) rows.push(levels.slice(i, i + 5));

  return (
    <View style={[styles.labCard, !unlocked && styles.labCardLocked, Shadow.md]}>
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
        <View style={[styles.stateBadge, { backgroundColor: `${stateColor}22` }]}>
          <Text style={[styles.stateBadgeText, { color: stateColor }]}>{stateLabel}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.labBody}>
        <Text style={styles.labDesc}>{lab.description}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: lab.color }]} />
          </View>
          <Text style={styles.progressLabel}>{done}/{total} · {pct}%</Text>
        </View>

        <Text style={styles.stateHelper}>
          {state === 'review'
            ? 'Boss cleared and ready to revisit.'
            : state === 'continue'
              ? 'Best next lab in the trader sequence.'
              : state === 'ready'
                ? 'Unlocked and ready to enter.'
                : `Complete Level ${lab.requiredLevel - 1000} boss to unlock.`}
        </Text>

        {lab.vrScenario && done >= total && (
          <View style={[styles.vrBadge, { borderColor: lab.color }]}>
            <Text style={styles.vrBadgeIcon}>VR</Text>
            <Text style={[styles.vrBadgeText, { color: lab.color }]}>Scenario unlocked</Text>
          </View>
        )}
      </View>

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
          <Text style={styles.lockedIcon}>LOCK</Text>
          <Text style={styles.lockedText}>
            Complete Level {lab.requiredLevel - 1000} boss to unlock
          </Text>
        </View>
      ) : null}
    </View>
  );
}

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
          <Text style={styles.vrModalIcon}>VR</Text>
          <Text style={styles.vrModalTitle}>Scenario Unlocked</Text>
          <Text style={styles.vrModalLab}>{labName}</Text>
          <Text style={styles.vrModalName}>{info.title}</Text>
          <Text style={styles.vrModalDesc}>{info.description}</Text>
          <View style={styles.vrModalMeta}>
            <Text style={styles.vrMetaItem}>~{info.estimatedMinutes} min</Text>
            <Text style={styles.vrMetaItem}>{info.type}</Text>
            {info.requiresHaptics && <Text style={styles.vrMetaItem}>Haptics</Text>}
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

function QuantHeader({ completedLevels }: { completedLevels: number[] }) {
  const { colors } = useTheme();
  const total = Object.keys(QUANT_LEVELS).length;
  const done = completedLevels.filter(l => l >= 1001 && l <= 1090).length;
  const labsDone = QUANT_LABS.filter(lab =>
    completedLevels.includes(lab.bossLevel)
  ).length;
  const currentLab = getFirstActiveLab(completedLevels);

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerEyebrow, { color: colors.textMuted }]}>Quant Workspace</Text>
        <Text style={styles.headerTitle}>Quant Program</Text>
        <Text style={styles.headerSub}>Trader Track · {currentLab ? `${currentLab.name} next` : 'Review ready'}</Text>
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
        <View style={[styles.overallFill, { width: `${Math.round((done / total) * 100)}%` }]} />
      </View>
      <Text style={styles.overallLabel}>{Math.round((done / total) * 100)}% complete</Text>
    </View>
  );
}

export default function QuantMapScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { completeLevel } = useProgress();
  const isWebWide = useIsWebWide();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [vrPrompt, setVrPrompt] = useState<{ scenarioKey: VRScenarioKey; labName: string } | null>(null);

  const completed: number[] = (user?.completed_levels ?? []).map(l => typeof l === 'string' ? parseInt(l, 10) : l).filter((n): n is number => !isNaN(n));
  const currentLab = useMemo(() => getFirstActiveLab(completed), [completed]);

  const handleLevelPress = (id: number) => setActiveLevelId(id);

  const handleLevelComplete = async (stars: number, xp: number) => {
    if (!activeLevelId) return;
    await completeLevel(activeLevelId, 'quant-trader', xp, stars === 3);
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
    return (
      <LessonScreen
        levelId={activeLevelId}
        onExit={() => setActiveLevelId(null)}
        onComplete={handleLevelComplete}
      />
    );
  }

  if (isWebWide) {
    const completedCount = completed.length;
    const totalLevels = Object.keys(QUANT_LEVELS).length;
    const labsUnlocked = QUANT_LABS.filter(l => isQuantLabUnlocked(l, completed)).length;

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title="Quant Quarter"
            subtitle={`${completedCount} / ${totalLevels} levels complete · ${labsUnlocked} labs unlocked`}
            accentColor={colors.accent}
          />

          <WebRow>
            <WebCol weight={1}>
              <WebCard title="Your Progress" accentBar accentColor={colors.accent}>
                <WebStatTile emoji="OK" label="Levels Done" value={`${completedCount}`} sub={`of ${totalLevels}`} color={colors.xpGreen} />
                <WebStatTile emoji="LB" label="Labs Unlocked" value={`${labsUnlocked}`} sub={`of ${QUANT_LABS.length}`} color={colors.accent} />
                <WebStatTile emoji="BS" label="Bosses Beaten" value={`${QUANT_LABS.filter(l => completed.includes(l.bossLevel)).length}`} sub="boss completions" color={colors.gold} />
              </WebCard>

              <WebCard title="Jump to Lab" accentBar accentColor={colors.gold} style={{ marginTop: 20 }}>
                {QUANT_LABS.map(lab => {
                  const state = getLabState(lab, completed);
                  return (
                    <WebListRow
                      key={lab.id}
                      icon={state === 'review' ? 'RV' : state === 'locked' ? 'LK' : 'GO'}
                      title={lab.name}
                      sub={`${lab.end - lab.start + 1} levels${lab.vrScenario ? ' · VR unlock' : ''}`}
                      onPress={state === 'locked' ? undefined : () => handleLevelPress(lab.start)}
                      right={
                        <View style={{
                          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                          backgroundColor: state === 'review'
                            ? colors.xpGreen + '20'
                            : state === 'locked'
                              ? colors.bgSecondary
                              : colors.accent + '20',
                        }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: state === 'review' ? colors.xpGreen : state === 'locked' ? colors.textMuted : colors.accent }}>
                            {state === 'review' ? 'Review' : state === 'continue' ? 'Continue' : state === 'ready' ? 'Start' : 'Locked'}
                          </Text>
                        </View>
                      }
                    />
                  );
                })}
              </WebCard>
            </WebCol>

            <WebCol weight={2}>
              <WebSectionLabel label="All Labs" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {QUANT_LABS.map(lab => {
                  const state = getLabState(lab, completed);
                  const accent = state === 'review' ? colors.xpGreen : state === 'locked' ? colors.textMuted : colors.accent;
                  return (
                    <View key={lab.id} style={{ width: '48%' }}>
                      <WebCard accentBar accentColor={accent} style={{ opacity: state === 'locked' ? 0.6 : 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <Text style={{ fontSize: 24 }}>{lab.icon ?? 'Q'}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{lab.name}</Text>
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                              {state === 'review' ? 'Review complete run' : state === 'continue' ? 'Continue current run' : state === 'ready' ? 'Ready to start' : 'Locked path'}
                            </Text>
                          </View>
                        </View>
                        {lab.description ? (
                          <Text style={{ fontSize: 12, color: colors.textSoft, lineHeight: 17, marginBottom: 10 }} numberOfLines={2}>
                            {lab.description}
                          </Text>
                        ) : null}
                        {lab.vrScenario && state !== 'locked' && (
                          <View style={{ backgroundColor: colors.accent + '18', borderRadius: Radius.sm, padding: 7, marginBottom: 10 }}>
                            <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '700' }}>VR unlocks on boss</Text>
                          </View>
                        )}
                        {state !== 'locked' && state !== 'review' && (
                          <TouchableOpacity
                            style={{ backgroundColor: accent, borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' }}
                            onPress={() => handleLevelPress(lab.start)}
                          >
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>{state === 'continue' ? 'Continue Lab' : 'Start Lab'}</Text>
                          </TouchableOpacity>
                        )}
                      </WebCard>
                    </View>
                  );
                })}
              </View>
              <View style={{ height: 40 }} />
            </WebCol>
          </WebRow>
        </WebShell>

        <VRPromptModal
          visible={!!vrPrompt}
          scenarioKey={vrPrompt?.scenarioKey}
          labName={vrPrompt?.labName ?? ''}
          onDismiss={() => setVrPrompt(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={Colors.bg} />
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
          <Text style={styles.footerText}>
            {currentLab ? `${currentLab.name} is the best next lab.` : 'All current labs are ready for review.'}
          </Text>
          <Text style={styles.footerSub}>VR scenarios unlock from lab bosses. Researcher and builder tracks arrive in Phase B.</Text>
        </View>

        <DisclaimerFooter />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  header: { backgroundColor: Colors.navy, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md },
  headerTop: { gap: 2 },
  headerEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: '#94a3b8', fontWeight: '600' },
  headerStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: FontSize.xs, color: '#94a3b8', fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: '#334155' },
  overallBar: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  overallFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  overallLabel: { fontSize: FontSize.xs, color: '#94a3b8', textAlign: 'center', fontWeight: '600' },
  labCard: { backgroundColor: Colors.card, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  labCardLocked: { opacity: 0.65 },
  labHeader: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, alignItems: 'flex-start' },
  labIcon: { fontSize: 32, lineHeight: 40 },
  labName: { fontSize: FontSize.lg, fontWeight: '900', color: '#fff', marginTop: 2 },
  labSubtitle: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  tierPill: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  tierText: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  stateBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  stateBadgeText: { fontSize: 10, fontWeight: '800' },
  labBody: { padding: Spacing.lg, gap: Spacing.md },
  labDesc: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },
  stateHelper: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressTrack: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', minWidth: 72, textAlign: 'right' },
  vrBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  vrBadgeIcon: { fontSize: 12, fontWeight: '800' },
  vrBadgeText: { fontSize: FontSize.xs, fontWeight: '800' },
  levelGrid: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  levelRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-start' },
  dot: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontWeight: '800' },
  lockedOverlay: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  lockedIcon: { fontSize: 16, fontWeight: '900' },
  lockedText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  vrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  vrModal: { backgroundColor: Colors.card, borderRadius: Radius.xl, padding: Spacing.xl, width: '100%', maxWidth: 380, gap: Spacing.md },
  vrModalIcon: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  vrModalTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.accent, textAlign: 'center' },
  vrModalLab: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', fontWeight: '600' },
  vrModalName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  vrModalDesc: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, textAlign: 'center' },
  vrModalMeta: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  vrMetaItem: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  vrLaunchBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  vrLaunchBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  vrDismissBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  vrDismissBtnText: { color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' },
  footer: { alignItems: 'center', gap: 6, paddingTop: Spacing.md },
  footerText: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600', textAlign: 'center' },
  footerSub: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});

export function PythonGateBanner({ chaptersCompleted, required }: { chaptersCompleted: number; required: number }) {
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
        {done ? 'Lab 8 Unlocked - Applied Quant Python' : 'Lab 8 Requires Python Foundations'}
      </Text>
      <Text style={{ fontSize: FontSize.xs, color: done ? '#065f46' : '#92400e', lineHeight: 18 }}>
        {done
          ? 'You have completed the Python prerequisites. Lab 8 implements everything from Labs 0-7 in real code.'
          : `Complete Python chapters 1-5 (${chaptersCompleted}/${required} done) before starting the Applied Quant Python lab.`}
      </Text>
    </View>
  );
}
