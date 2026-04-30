import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, RefreshControl, Linking,
  type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, Shadow, webContainer } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { getStarknetLabs } from '../data/tracks/starknet_ecosystem/starknetLessonRegistry';
import {
  getStarknetSepoliaRpcConfigError,
  isStarknetSepoliaRpcConfigured,
  starknetSepoliaRpcCall,
} from '../lib/starknetRpc';

const ACCENT = '#F97316';

const scrollContentStyle: ViewStyle = {
  ...(webContainer as ViewStyle),
  gap: Spacing.lg,
  paddingBottom: Spacing.xl,
};

interface LabDef {
  id: string;
  number: number;
  title: string;
  description: string;
  bossLevelId: number;
  tags: string[];
  lessonCount: number;
}

const CAIRO_LAB_UI: Record<number, Omit<LabDef, 'id' | 'number' | 'bossLevelId' | 'lessonCount'>> = {
  0: { title: 'Setup & Scarb', description: 'Install Scarb, create your first Cairo project, and run the first build.', tags: ['Tooling', 'Scarb', 'Setup'] },
  1: { title: 'Cairo Basics & ERC-20', description: 'Work through felt252 types, storage, events, and deploy an ERC-20 on Sepolia.', tags: ['Cairo', 'ERC-20', 'Sepolia'] },
  2: { title: 'Account Abstraction', description: 'Build around account contracts, signatures, and multi-sig patterns.', tags: ['AA', 'Signatures', 'Multi-sig'] },
  3: { title: 'snforge Testing', description: 'Write tests with snforge_std and a Starknet-focused local harness.', tags: ['Testing', 'snforge', 'TDD'] },
  4: { title: 'Starkzap SDK Integration', description: 'Connect Cairo contracts to the Starkzap SDK for front-end interaction.', tags: ['Starkzap', 'SDK', 'Integration'] },
  5: { title: 'DeFi Primitives: Vault & AMM', description: 'Build lending and AMM primitives with Cairo state machines and tests.', tags: ['DeFi', 'Vault', 'AMM'] },
  6: { title: 'Perpetuals Exchange', description: 'Model a perps venue with order logic, margin rules, and Sepolia deployment.', tags: ['Perps', 'Advanced', 'Deploy'] },
  7: { title: 'Cairo Architecture Patterns', description: 'Practice dispatcher patterns, component libraries, and upgrade-safe structure.', tags: ['Architecture', 'Patterns'] },
  8: { title: 'Full Stack: Apibara + FastAPI', description: 'Index Starknet events and expose them through a FastAPI service.', tags: ['Indexer', 'Apibara', 'API'] },
  9: { title: 'LendingPool Full Stack', description: 'Ship an end-to-end lending protocol with contracts, indexing, and UI.', tags: ['Full Stack', 'Lending'] },
  10: { title: 'Security Audit I', description: 'Use STRIDE and code review to identify concrete vulnerabilities.', tags: ['Security', 'STRIDE', 'Audit'] },
  11: { title: 'Security Audit II + Fork Tests', description: 'Audit a live-style deployment path and validate assumptions with fork-style tests.', tags: ['Fork Tests', 'Advanced Audit'] },
  12: { title: 'Final Boss: Reverse Engineer', description: 'Reverse engineer, audit, and package a complete Starknet protocol case study.', tags: ['Final Boss', 'GitHub', 'Certification'] },
};

const CAIRO_LABS: LabDef[] = getStarknetLabs('cairo-builder').map((lab) => {
  const ui = CAIRO_LAB_UI[lab.labNumber];

  return {
    id: lab.labId,
    number: lab.labNumber,
    title: ui?.title ?? `Lab ${lab.labNumber}`,
    description: ui?.description ?? `Complete ${lab.lessons.length} lessons and the boss for Lab ${lab.labNumber}.`,
    bossLevelId: lab.bossLevelId,
    tags: ui?.tags ?? ['Cairo'],
    lessonCount: lab.lessons.length,
  };
});

function LabCard({ lab, unlocked, completed, current, onPress }: {
  lab: LabDef; unlocked: boolean; completed: boolean; current: boolean; onPress: () => void;
}) {
  const { colors } = useTheme();
  const accent = completed ? '#10B981' : current ? ACCENT : unlocked ? ACCENT : colors.textMuted;
  const stateLabel = !unlocked ? 'Locked' : current ? 'Continue' : completed ? 'Review' : 'Start';

  return (
    <TouchableOpacity
      style={[styles.labCard, {
        backgroundColor: colors.card,
        borderColor: current ? `${ACCENT}55` : completed ? '#10B98155' : unlocked ? `${ACCENT}28` : colors.border,
        opacity: unlocked ? 1 : 0.56,
      }]}
      onPress={onPress}
      disabled={!unlocked}
      activeOpacity={0.82}
    >
      <View style={styles.labHeader}>
        <View style={[styles.numberBadge, { backgroundColor: completed ? '#10B981' : `${ACCENT}16`, borderColor: `${ACCENT}32` }]}>
          <Text style={[styles.numberText, { color: completed ? '#fff' : ACCENT }]}>
            {lab.number}
          </Text>
        </View>
        <View style={styles.labCopy}>
          <Text style={[styles.labEyebrow, { color: ACCENT }]}>Cairo Lab</Text>
          <Text style={[styles.labTitle, { color: colors.text }]}>{lab.title}</Text>
          <Text style={[styles.labDesc, { color: colors.textSoft }]} numberOfLines={2}>{lab.description}</Text>
        </View>
        <View style={[styles.statePill, { backgroundColor: `${accent}14` }]}>
          <Text style={[styles.statePillText, { color: accent }]}>{stateLabel}</Text>
        </View>
      </View>
      <View style={styles.tagRow}>
        <Text style={[styles.lessonMeta, { color: colors.textMuted }]}>{lab.lessonCount} lessons</Text>
        {lab.tags.slice(0, 3).map(tag => (
          <View key={tag} style={[styles.tag, { backgroundColor: `${ACCENT}10` }]}>
            <Text style={[styles.tagText, { color: ACCENT }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function CairoBuilderTrackScreen() {
  const router = useRouter();
  const { user, updateActiveField } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [sepoliaBlock, setSepoliaBlock] = useState<string | null>(null);
  const [sepoliaStatus, setSepoliaStatus] = useState<string | null>(null);

  const completedLevels: string[] = (user?.completed_levels ?? user?.completedLevels ?? []).map(String);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/fields' as any);
  }, [router]);

  function isLabUnlocked(lab: LabDef): boolean {
    if (lab.number === 0) return true;
    const previousLab = CAIRO_LABS.find((candidate) => candidate.number === lab.number - 1);
    return previousLab ? completedLevels.includes(String(previousLab.bossLevelId)) : false;
  }

  function isLabCompleted(lab: LabDef): boolean {
    return completedLevels.includes(String(lab.bossLevelId));
  }

  const currentLabId = CAIRO_LABS.find((lab) => isLabUnlocked(lab) && !isLabCompleted(lab))?.id;

  useEffect(() => {
    if (!isStarknetSepoliaRpcConfigured()) {
      setSepoliaStatus(getStarknetSepoliaRpcConfigError());
      return;
    }

    starknetSepoliaRpcCall('starknet_blockNumber')
      .then((result) => {
        if (result !== undefined && result !== null) {
          setSepoliaBlock(`#${result}`);
          setSepoliaStatus(null);
        }
      })
      .catch((error: any) => {
        setSepoliaStatus(error?.message ?? 'Could not load the Starknet Sepolia block height.');
      });
  }, []);

  useEffect(() => {
    if (!user?.id || user.currentTrackId === 'cairo-builder') {
      return;
    }

    void updateActiveField(
      'starknet',
      '#F59E0B',
      'cairo-builder',
      'Cairo Builder',
    ).catch(() => {});
  }, [updateActiveField, user?.currentTrackId, user?.id]);

  function handleLabPress(lab: LabDef) {
    router.push({
      pathname: '/world' as any,
      params: {
        worldId: 'cairo-realm',
        trackId: 'cairo-builder',
        trackName: 'Cairo Builder',
        labId: String(lab.number),
        labNumber: String(lab.number),
      },
    });
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const completedCount = CAIRO_LABS.filter(isLabCompleted).length;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={scrollContentStyle}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={handleBackPress} style={[styles.backButton, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={[styles.heroEyebrow, { color: ACCENT }]}>Builder Workspace</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Cairo Builder</Text>
          <Text style={[styles.heroSub, { color: colors.textSoft }]}>
            Write, test, deploy, and audit Starknet contracts with the exact lab progression preserved.
          </Text>

          <View style={styles.heroStats}>
            <View style={[styles.heroStatCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.heroStatValue, { color: ACCENT }]}>{completedCount}/{CAIRO_LABS.length}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Labs cleared</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{sepoliaBlock ?? 'RPC'}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Sepolia block</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.heroStatValue, { color: currentLabId ? ACCENT : '#10B981' }]}>{currentLabId ? 'Continue' : 'Review'}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>State</Text>
            </View>
          </View>
        </View>

        <View style={[styles.bannerCard, { backgroundColor: colors.card, borderColor: '#00FF8830' }]}>
          <Text style={[styles.bannerEyebrow, { color: '#00FF88' }]}>Sepolia Live</Text>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            {sepoliaBlock
              ? `Connected at block ${sepoliaBlock}`
              : sepoliaStatus
                ? 'Sepolia RPC needs attention'
                : 'Connecting to Starknet Sepolia'}
          </Text>
          <Text style={[styles.bannerBody, { color: colors.textSoft }]}>
            {sepoliaStatus
              ? sepoliaStatus
              : 'Deployments stay on-chain and testing remains grounded in the real Cairo toolchain.'}
          </Text>
        </View>

        <View style={styles.linkRow}>
          <TouchableOpacity style={[styles.linkChip, { borderColor: ACCENT }]} onPress={() => Linking.openURL('https://book.cairo-lang.org')}>
            <Text style={[styles.linkText, { color: ACCENT }]}>Cairo Book</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkChip, { borderColor: ACCENT }]} onPress={() => Linking.openURL('https://docs.swmansion.com/scarb/')}>
            <Text style={[styles.linkText, { color: ACCENT }]}>Scarb Docs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkChip, { borderColor: ACCENT }]} onPress={() => Linking.openURL('https://foundry-rs.github.io/starknet-foundry/')}>
            <Text style={[styles.linkText, { color: ACCENT }]}>snforge Docs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>Labs</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Builder Sequence</Text>
        </View>

        {CAIRO_LABS.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            unlocked={isLabUnlocked(lab)}
            completed={isLabCompleted(lab)}
            current={lab.id === currentLabId}
            onPress={() => handleLabPress(lab)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heroCard: { borderWidth: 1, borderRadius: Radius.xxl, padding: Spacing.xl, gap: Spacing.md, ...Shadow.sm },
  backButton: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 9 },
  backButtonText: { fontSize: FontSize.xs, fontWeight: '800' },
  heroEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '900' },
  heroSub: { fontSize: FontSize.sm, lineHeight: 20 },
  heroStats: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroStatCard: { flex: 1, minWidth: 104, borderRadius: Radius.xl, padding: Spacing.lg, gap: 4 },
  heroStatValue: { fontSize: FontSize.md, fontWeight: '900' },
  heroStatLabel: { fontSize: 10, fontWeight: '700' },
  bannerCard: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm },
  bannerEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  bannerTitle: { fontSize: FontSize.md, fontWeight: '900' },
  bannerBody: { fontSize: FontSize.sm, lineHeight: 20 },
  linkRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  linkChip: { borderRadius: Radius.full, borderWidth: 1.5, paddingHorizontal: Spacing.lg, paddingVertical: 8 },
  linkText: { fontSize: 12, fontWeight: '700' },
  sectionHeader: { gap: 4, marginTop: Spacing.xs },
  sectionEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '900' },
  labCard: { borderRadius: Radius.xl, borderWidth: 1.5, padding: Spacing.lg, gap: Spacing.sm, ...Shadow.sm },
  labHeader: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  numberBadge: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontWeight: '800', fontSize: FontSize.md },
  labCopy: { flex: 1 },
  labEyebrow: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  labTitle: { fontWeight: '800', fontSize: FontSize.md, marginBottom: 2 },
  labDesc: { fontSize: FontSize.sm, lineHeight: 18 },
  statePill: { borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  statePillText: { fontSize: 10, fontWeight: '800' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  lessonMeta: { fontSize: FontSize.xs, marginRight: 4 },
  tag: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 9, fontWeight: '700' },
});
