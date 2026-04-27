import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Radius, Shadow, Spacing, FontSize, FontWeight, useTheme } from '../theme';
import { ISLANDS, getIsland, isIslandUnlocked, type Island } from '../data/islands';
import { useAuth } from '../hooks/useAuth';
import { TrackChoiceScreen } from './PostIslandTrackSelection';

type Tier = 'beginner' | 'intermediate' | 'pro';

function getTierLabel(tier: Tier) {
  if (tier === 'beginner') return 'Beginner Islands';
  if (tier === 'intermediate') return 'Intermediate Islands';
  return 'Pro Islands';
}

function getTierCopy(tier: Tier) {
  if (tier === 'beginner') return 'Foundations, wallet safety, and crypto basics.';
  if (tier === 'intermediate') return 'Execution, analysis, and more technical judgment.';
  return 'High-pressure, portfolio-grade decision-making.';
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
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: `${island.color}35` }]}>
          <LinearGradient
            colors={[`${island.color}20`, colors.card, colors.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: `${island.color}18`, borderColor: `${island.color}45` }]}>
                <Text style={styles.modalIcon}>{island.icon}</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.modalClose, { color: colors.textMuted }]}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>{island.name}</Text>
            <Text style={[styles.modalEyebrow, { color: island.color }]}>
              {island.tier.toUpperCase()} · LEVELS {island.start}-{island.end}
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSoft }]}>{island.description}</Text>

            <View style={styles.modalMetaRow}>
              <View style={[styles.metaPill, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.metaPillText, { color: colors.textSoft }]}>
                  {island.end - island.start + 1} lessons
                </Text>
              </View>
              <View style={[styles.metaPill, { backgroundColor: `${island.color}15` }]}>
                <Text style={[styles.metaPillText, { color: island.color }]}>Boss {island.bossLevel}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.enterBtn, { backgroundColor: island.color }]}
              onPress={() => onEnter(island)}
              activeOpacity={0.88}
            >
              <Text style={styles.enterBtnText}>Continue Into Island</Text>
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
  const badgeColor = completed ? '#10B981' : current ? island.color : colors.textMuted;

  return (
    <TouchableOpacity
      activeOpacity={unlocked ? 0.88 : 1}
      onPress={unlocked ? onPress : undefined}
      style={[
        styles.islandCard,
        {
          backgroundColor: colors.card,
          borderColor: current ? `${island.color}70` : colors.border,
          opacity: unlocked ? 1 : 0.55,
        },
      ]}
    >
      <LinearGradient
        colors={[`${island.color}18`, colors.card, colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.islandCardGradient}
      >
        <View style={styles.islandCardTop}>
          <View style={[styles.islandIconWrap, { backgroundColor: `${island.color}18`, borderColor: `${island.color}35` }]}>
            <Text style={styles.islandIcon}>{unlocked ? island.icon : '🔒'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.islandName, { color: colors.text }]} numberOfLines={1}>
              {island.name}
            </Text>
            <Text style={[styles.islandSub, { color: colors.textMuted }]}>
              Levels {island.start}-{island.end}
            </Text>
          </View>
          <View style={[styles.statePill, { backgroundColor: `${badgeColor}18` }]}>
            <Text style={[styles.statePillText, { color: badgeColor }]}>
              {completed ? 'Complete' : current ? 'Continue' : unlocked ? 'Open' : 'Locked'}
            </Text>
          </View>
        </View>

        <Text style={[styles.islandDesc, { color: colors.textSoft }]} numberOfLines={2}>
          {island.description}
        </Text>

        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.bgSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: completed ? '#10B981' : island.color,
                  width: completed ? '100%' : current ? '68%' : unlocked ? '22%' : '0%',
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
            {completed ? 'Cleared' : current ? 'In progress' : unlocked ? 'Ready' : 'Unlock required'}
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

  const tiers: Tier[] = ['beginner', 'intermediate', 'pro'];
  const mainIslands = useMemo(() => ISLANDS.filter(i => i.id !== 18), []);
  const starkIsland = useMemo(() => ISLANDS.find(i => i.id === 18) ?? null, []);
  const starkIslandUnlocked = starkIsland ? isIslandUnlocked(starkIsland, completedLevels) : false;
  const progressPct = Math.min(100, (completedLevels.length / 310) * 100);

  const handleEnter = (island: Island) => {
    setSelected(null);
    setTimeout(() => router.push(`/(tabs)/map/lesson?levelId=${island.start}` as any), 160);
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
                <Text style={[styles.backBtnText, { color: colors.text }]}>‹</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroEyebrow, { color: colors.textMuted }]}>Crypto Onboarding</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>Island Journey</Text>
                <Text style={[styles.heroSub, { color: colors.textSoft }]}>
                  Compact, track-first progression with the real lesson routes preserved.
                </Text>
              </View>
              <View style={[styles.heroStat, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={[styles.heroStatValue, { color: colors.accent }]}>{completedLevels.length}</Text>
                <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>/ 310</Text>
              </View>
            </View>

            <View style={styles.heroProgressWrap}>
              <View style={[styles.heroProgressTrack, { backgroundColor: colors.bgSecondary }]}>
                <View style={[styles.heroProgressFill, { backgroundColor: colors.accent, width: `${progressPct}%` }]} />
              </View>
              <View style={styles.heroProgressMeta}>
                <Text style={[styles.heroProgressText, { color: colors.textSoft }]}>Level {currentLevel}</Text>
                <Text style={[styles.heroProgressText, { color: colors.textMuted }]}>
                  {starkIslandUnlocked
                    ? 'Island 18 unlocked'
                    : starknetWalletReady
                      ? 'Wallet ready for Island 18'
                      : 'Unlock Island 18 after Island 17'}
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
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{getTierLabel(tier)}</Text>
                  <Text style={[styles.sectionCopy, { color: colors.textMuted }]}>{getTierCopy(tier)}</Text>
                </View>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Starknet Realm</Text>
            <Text style={[styles.sectionCopy, { color: colors.textMuted }]}>
              Island 18 now unlocks strictly after Island 17, while your Starknet wallet stays ready as soon as you connect it.
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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  heroCard: {
    borderWidth: 1,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadow.md,
  },
  heroGradient: { padding: Spacing.lg, gap: Spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 24, fontWeight: FontWeight.medium, marginTop: -3 },
  heroEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, marginBottom: 4 },
  heroSub: { fontSize: FontSize.sm, lineHeight: 19, maxWidth: 520 },
  heroStat: {
    minWidth: 74,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  heroStatValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  heroStatLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroProgressWrap: { gap: 8 },
  heroProgressTrack: { height: 8, borderRadius: Radius.full, overflow: 'hidden' },
  heroProgressFill: { height: '100%', borderRadius: Radius.full },
  heroProgressMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  heroProgressText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: 4 },
  sectionCopy: { fontSize: FontSize.sm, lineHeight: 18 },
  grid: { gap: Spacing.sm },
  islandCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  islandCardGradient: { padding: Spacing.md, gap: Spacing.md },
  islandCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  islandIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  islandIcon: { fontSize: 22 },
  islandName: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginBottom: 2 },
  islandSub: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  statePill: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  statePillText: { fontSize: 10, fontWeight: FontWeight.bold },
  islandDesc: { fontSize: FontSize.sm, lineHeight: 18 },
  progressRow: { gap: 6 },
  progressTrack: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.full },
  progressLabel: { fontSize: 11, fontWeight: FontWeight.medium },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 24, 0.62)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    borderRadius: Radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalGradient: { padding: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: { fontSize: 34 },
  modalClose: { fontSize: 28, fontWeight: FontWeight.medium, lineHeight: 28 },
  modalTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, marginBottom: 6 },
  modalEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.8, marginBottom: Spacing.md },
  modalDesc: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },
  modalMetaRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  metaPill: { borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  metaPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  enterBtn: { borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center' },
  enterBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.black },
});
