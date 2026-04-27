import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Radius, Shadow, Spacing, FontSize, FontWeight, useTheme, webContainer } from '../theme';
import { ISLANDS, getIsland, isIslandUnlocked, type Island } from '../data/islands';
import { useAuth } from '../hooks/useAuth';
import { TrackChoiceScreen } from './PostIslandTrackSelection';

type Tier = 'beginner' | 'intermediate' | 'pro';
type IslandState = 'locked' | 'continue' | 'review' | 'ready';

function getTierLabel(tier: Tier) {
  if (tier === 'beginner') return 'Beginner Islands';
  if (tier === 'intermediate') return 'Intermediate Islands';
  return 'Pro Islands';
}

function getTierCopy(tier: Tier) {
  if (tier === 'beginner') return 'Foundations, wallet safety, and crypto basics.';
  if (tier === 'intermediate') return 'Execution, analysis, and sharper technical judgment.';
  return 'High-pressure, artifact-grade decision making.';
}

function getIslandState(unlocked: boolean, completed: boolean, current: boolean): IslandState {
  if (!unlocked) return 'locked';
  if (current) return 'continue';
  if (completed) return 'review';
  return 'ready';
}

function getIslandStateCopy(state: IslandState) {
  if (state === 'continue') {
    return { label: 'Continue', helper: 'Current run', progress: '68%' };
  }
  if (state === 'review') {
    return { label: 'Review', helper: 'Boss cleared', progress: '100%' };
  }
  if (state === 'ready') {
    return { label: 'Start', helper: 'Ready now', progress: '22%' };
  }
  return { label: 'Locked', helper: 'Unlock required', progress: '0%' };
}

function IslandDetailModal({
  island,
  open,
  onClose,
  onEnter,
}: {
  island: Island | null;
  open: boolean;
  onClose: () => void;
  onEnter: (island: Island) => void;
}) {
  const { colors } = useTheme();

  if (!island) return null;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: `${island.color}30` }]}>
          <LinearGradient
            colors={[`${island.color}18`, colors.card, colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: `${island.color}16`, borderColor: `${island.color}32` }]}>
                <Text style={styles.modalIcon}>{island.icon}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalEyebrow, { color: island.color }]}>
              {island.tier.toUpperCase()} · LEVELS {island.start}-{island.end}
            </Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{island.name}</Text>
            <Text style={[styles.modalDesc, { color: colors.textSoft }]}>{island.description}</Text>

            <View style={styles.modalMetaRow}>
              <View style={[styles.metaPill, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.metaPillText, { color: colors.textSoft }]}>
                  {island.end - island.start + 1} lessons
                </Text>
              </View>
              <View style={[styles.metaPill, { backgroundColor: `${island.color}12` }]}>
                <Text style={[styles.metaPillText, { color: island.color }]}>Boss {island.bossLevel}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.enterBtn, { backgroundColor: island.color }]}
              onPress={() => onEnter(island)}
              activeOpacity={0.88}
            >
              <Text style={styles.enterBtnText}>Continue Island</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

function IslandCard({
  island,
  unlocked,
  completed,
  current,
  onPress,
}: {
  island: Island;
  unlocked: boolean;
  completed: boolean;
  current: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const state = getIslandState(unlocked, completed, current);
  const stateCopy = getIslandStateCopy(state);
  const accent = completed ? '#10B981' : current ? island.color : state === 'ready' ? colors.accent : colors.textMuted;

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.88 : 1}
      onPress={unlocked ? onPress : undefined}
      style={[
        styles.islandCard,
        {
          backgroundColor: colors.card,
          borderColor: current ? `${island.color}66` : colors.border,
          opacity: unlocked ? 1 : 0.58,
        },
      ]}
    >
      <LinearGradient
        colors={[`${island.color}15`, colors.card, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.islandCardGradient}
      >
        <View style={styles.islandCardTop}>
          <View style={[styles.islandIconWrap, { backgroundColor: `${island.color}16`, borderColor: `${island.color}30` }]}>
            <Text style={styles.islandIcon}>{unlocked ? island.icon : 'LOCK'}</Text>
          </View>
          <View style={styles.islandHeaderText}>
            <Text style={[styles.islandName, { color: colors.text }]} numberOfLines={1}>
              {island.name}
            </Text>
            <Text style={[styles.islandSub, { color: colors.textMuted }]}>
              Levels {island.start}-{island.end}
            </Text>
          </View>
          <View style={[styles.statePill, { backgroundColor: `${accent}16` }]}>
            <Text style={[styles.statePillText, { color: accent }]}>{stateCopy.label}</Text>
          </View>
        </View>

        <Text style={[styles.islandDesc, { color: colors.textSoft }]} numberOfLines={2}>
          {island.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
            {island.end - island.start + 1} lessons
          </Text>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Boss {island.bossLevel}</Text>
          <Text style={[styles.metaLabel, { color: accent }]}>{stateCopy.helper}</Text>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.bgSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: completed ? '#10B981' : island.color,
                  width: stateCopy.progress,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            {state === 'locked' ? 'Unlock path required' : completed ? 'Ready for review' : current ? 'Best next step' : 'Ready to enter'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function NextTrackBanner({ islandId }: { islandId: number }) {
  const island = getIsland(islandId);
  if (islandId === 18 && island?.nextTracks?.length) {
    return <TrackChoiceScreen compact />;
  }
  if (!island?.nextTracks?.length) return null;
  return null;
}

export default function IslandMapScreen({ route }: any) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const completedLevels: number[] = (user?.completedLevels ?? user?.completed_levels ?? []).map(Number);
  const currentLevel: number = user?.current_level ?? 1;
  const starknetWalletReady = !!(user?.starknet_address || user?.starknet_auth);
  const [selected, setSelected] = useState<Island | null>(null);

  const initialIsland = route?.params?.initialIsland;
  useEffect(() => {
    if (!initialIsland) return;
    const target = ISLANDS.find(i => i.id === Number(initialIsland));
    if (target) setSelected(target);
  }, [initialIsland]);

  const tiers: Tier[] = [];
  const mainIslands = useMemo(() => ISLANDS.filter(i => i.id === -1), []);
  const starkIsland = useMemo(() => ISLANDS.find(i => i.id === 18) ?? null, []);
  const starkIslandUnlocked = starkIsland ? isIslandUnlocked(starkIsland, completedLevels) : false;
  const progressPct = Math.min(100, (completedLevels.length / 310) * 100);
  const clearedIslands = ISLANDS.filter(island => completedLevels.includes(island.bossLevel)).length;

  const handleEnter = (island: Island) => {
    setSelected(null);
    setTimeout(() => {
      router.push({
        pathname: '/map/lesson' as any,
        params: { levelId: String(island.start) },
      });
    }, 160);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={[colors.bg, colors.bgSecondary, colors.bg]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient
            colors={[`${colors.accent}14`, colors.card, colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTop}>
              <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.backBtnText, { color: colors.text }]}>{'<'}</Text>
              </TouchableOpacity>
              <View style={styles.heroHeaderText}>
                <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>Progress Surface</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>Island Atlas</Text>
                <Text style={[styles.heroSub, { color: colors.textSoft }]}>
                  Continue the real lesson route, review cleared islands, and keep Starknet progression in sync.
                </Text>
              </View>
              <View style={[styles.heroStat, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={[styles.heroStatValue, { color: colors.accent }]}>{completedLevels.length}</Text>
                <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>/ 310</Text>
              </View>
            </View>

            <View style={styles.heroMetaRow}>
              <View style={[styles.heroMetaChip, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.heroMetaValue, { color: colors.text }]}>{currentLevel}</Text>
                <Text style={[styles.heroMetaLabel, { color: colors.textMuted }]}>Current level</Text>
              </View>
              <View style={[styles.heroMetaChip, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.heroMetaValue, { color: colors.text }]}>{clearedIslands}</Text>
                <Text style={[styles.heroMetaLabel, { color: colors.textMuted }]}>Islands cleared</Text>
              </View>
              <View style={[styles.heroMetaChip, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.heroMetaValue, { color: starkIslandUnlocked ? '#10B981' : colors.text }]}>{starkIslandUnlocked ? 'Ready' : 'Pending'}</Text>
                <Text style={[styles.heroMetaLabel, { color: colors.textMuted }]}>Realm access</Text>
              </View>
            </View>

            <View style={styles.heroProgressWrap}>
              <View style={[styles.heroProgressTrack, { backgroundColor: colors.bgSecondary }]}>
                <View style={[styles.heroProgressFill, { backgroundColor: colors.accent, width: `${progressPct}%` }]} />
              </View>
              <View style={styles.heroProgressMeta}>
                <Text style={[styles.heroProgressText, { color: colors.textSoft }]}>{Math.round(progressPct)}% map completion</Text>
                <Text style={[styles.heroProgressText, { color: colors.textMuted }]}>
                  {starkIslandUnlocked
                    ? 'Island 18 unlocked'
                    : starknetWalletReady
                      ? 'Wallet ready for Island 18'
                      : 'Clear Island 17 to unlock Starknet'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {tiers.map(tier => {
          const tierIslands = mainIslands.filter(i => i.tier === tier);
          return (
            <View key={tier} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>{tier.toUpperCase()}</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{getTierLabel(tier)}</Text>
                <Text style={[styles.sectionCopy, { color: colors.textMuted }]}>{getTierCopy(tier)}</Text>
              </View>
              <View style={styles.grid}>
                {tierIslands.map(island => (
                  <IslandCard
                    key={island.id}
                    island={island}
                    unlocked={isIslandUnlocked(island, completedLevels)}
                    completed={completedLevels.includes(island.bossLevel)}
                    current={currentLevel >= island.start && currentLevel <= island.end}
                    onPress={() => setSelected(island)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {starkIsland ? (
          <View style={styles.section}>
            <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>SPECIAL ACCESS</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Starknet Realm</Text>
            <Text style={[styles.sectionCopy, { color: colors.textMuted }]}>
              Island 18 opens after Island 17, and your Starknet wallet state stays attached to the dedicated realm flow.
            </Text>
            <IslandCard
              island={starkIsland}
              unlocked={starkIslandUnlocked}
              completed={completedLevels.includes(310)}
              current={currentLevel >= 291 && currentLevel <= 310}
              onPress={() => setSelected(starkIsland)}
            />
          </View>
        ) : null}

        {completedLevels.includes(310) ? <NextTrackBanner islandId={18} /> : null}
      </ScrollView>

      <IslandDetailModal island={selected} open={!!selected} onClose={() => setSelected(null)} onEnter={handleEnter} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { ...webContainer, paddingBottom: Spacing.xxxl },
  heroCard: {
    borderWidth: 1,
    borderRadius: 11,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  heroGradient: { padding: 16, gap: Spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 20, fontWeight: FontWeight.bold },
  heroHeaderText: { flex: 1 },
  heroEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  heroTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  heroSub: { fontSize: 11, lineHeight: 17, maxWidth: 520 },
  heroStat: {
    minWidth: 78,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
  },
  heroStatValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  heroStatLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroMetaRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroMetaChip: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, minWidth: 110 },
  heroMetaValue: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginBottom: 2 },
  heroMetaLabel: { fontSize: 11, fontWeight: FontWeight.medium },
  heroProgressWrap: { gap: 8 },
  heroProgressTrack: { height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  heroProgressFill: { height: '100%', borderRadius: Radius.full },
  heroProgressMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  heroProgressText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { marginBottom: 10 },
  sectionEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  sectionCopy: { fontSize: FontSize.sm, lineHeight: 18 },
  grid: { gap: Spacing.sm },
  islandCard: {
    minWidth: 170,
    borderWidth: 1,
    borderRadius: 11,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  islandCardGradient: { padding: 12, gap: Spacing.md },
  islandCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  islandHeaderText: { flex: 1 },
  islandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  islandIcon: { fontSize: 16, fontWeight: FontWeight.black },
  islandName: { fontSize: 11, fontWeight: '800', marginBottom: 2 },
  islandSub: { fontSize: 9, fontWeight: FontWeight.medium },
  statePill: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  statePillText: { fontSize: 9, fontWeight: '700' },
  islandDesc: { fontSize: FontSize.sm, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metaLabel: { fontSize: 11, fontWeight: FontWeight.medium },
  progressRow: { gap: 6 },
  progressTrack: { height: 4, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.full },
  progressLabel: { fontSize: 11, fontWeight: FontWeight.medium },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 24, 0.62)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalGradient: { padding: Platform.OS === 'web' ? 14 : 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: { fontSize: 18 },
  modalClose: { fontSize: 20, fontWeight: FontWeight.bold, lineHeight: 20 },
  modalEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.8, marginBottom: 6 },
  modalTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, marginBottom: 6 },
  modalDesc: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  modalMetaRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  metaPill: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  metaPillText: { fontSize: 9, fontWeight: '700' },
  enterBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  enterBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
