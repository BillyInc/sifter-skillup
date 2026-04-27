import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Linking, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow, webContainer } from '../theme';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';
import { API } from '../lib/api';
import {
  ECOSYSTEM_LABS,
  ECOSYSTEM_LEVEL_COLORS,
  ECOSYSTEM_TRACK,
  type EcosystemLabDef,
} from '../data/tracks/starknet_ecosystem/ecosystem/ecosystemTrack';

const ACCENT = '#6366F1';

function DuneStatusBanner({ hasDuneKey, onConfigure }: {
  hasDuneKey: boolean; onConfigure: () => void;
}) {
  const { colors } = useTheme();
  const stateLabel = hasDuneKey ? 'Continue' : 'Configure';

  return (
    <TouchableOpacity
      style={[styles.bannerCard, { backgroundColor: colors.card, borderColor: hasDuneKey ? `${ACCENT}35` : colors.border }]}
      onPress={hasDuneKey ? undefined : onConfigure}
      disabled={hasDuneKey}
      activeOpacity={hasDuneKey ? 1 : 0.86}
    >
      <View style={styles.bannerHeader}>
        <View style={styles.bannerCopy}>
          <Text style={[styles.bannerEyebrow, { color: hasDuneKey ? ACCENT : colors.textMuted }]}>Dune API</Text>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>{hasDuneKey ? 'Live analytics connected' : 'Dune API not configured'}</Text>
          <Text style={[styles.bannerBody, { color: colors.textSoft }]}>
            {hasDuneKey
              ? 'Lab 9 SQL work now runs against live Starknet data.'
              : 'Labs 1-8 still work without it. Lab 9 will use demo data until you configure a key.'}
          </Text>
        </View>
        <View style={[styles.statePill, { backgroundColor: `${ACCENT}14` }]}>
          <Text style={[styles.statePillText, { color: ACCENT }]}>{stateLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LevelHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.levelHeader}>
      <View style={[styles.levelHeaderLine, { backgroundColor: color }]} />
      <Text style={[styles.levelHeaderText, { color }]}>{label.toUpperCase()}</Text>
      <View style={[styles.levelHeaderLine, { backgroundColor: color }]} />
    </View>
  );
}

function LabCard({
  lab, isLocked, isComplete, isCurrent,
  onPress,
}: {
  lab: EcosystemLabDef;
  isLocked: boolean;
  isComplete: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const levelColor = ECOSYSTEM_LEVEL_COLORS[lab.level];
  const accent = isComplete ? '#10B981' : isCurrent ? ACCENT : levelColor;
  const stateLabel = isLocked ? 'Locked' : isCurrent ? 'Continue' : isComplete ? 'Review' : 'Start';

  return (
    <TouchableOpacity
      style={[styles.labCard, {
        backgroundColor: colors.card,
        borderColor: isCurrent ? `${ACCENT}52` : isComplete ? '#10B98145' : isLocked ? colors.border : `${levelColor}26`,
        opacity: isLocked ? 0.56 : 1,
      }]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.82}
    >
      <View style={styles.labHeader}>
        <View style={[styles.labNumberBadge, { backgroundColor: isComplete ? '#10B981' : `${levelColor}18`, borderColor: `${levelColor}34` }]}>
          <Text style={[styles.labNumberText, { color: isComplete ? '#fff' : levelColor }]}>
            {lab.number === 0 ? 'P' : lab.number}
          </Text>
        </View>
        <View style={styles.labCopy}>
          <Text style={[styles.labEyebrow, { color: levelColor }]}>{lab.level}</Text>
          <Text style={[styles.labTitle, { color: isLocked ? colors.textMuted : colors.text }]}>{lab.title}</Text>
          <Text style={[styles.labMeta, { color: colors.textMuted }]}>
            {lab.lessonCount} lessons · ~{lab.estimatedH}h
          </Text>
        </View>
        <View style={[styles.statePill, { backgroundColor: `${accent}14` }]}>
          <Text style={[styles.statePillText, { color: accent }]}>{stateLabel}</Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        {lab.portfolioPush ? (
          <View style={[styles.chip, { backgroundColor: `${ACCENT}12` }]}>
            <Text style={[styles.chipText, { color: ACCENT }]}>Portfolio</Text>
          </View>
        ) : null}
        {lab.sqlPrimerRequired ? (
          <View style={[styles.chip, { backgroundColor: '#F59E0B18' }]}>
            <Text style={[styles.chipText, { color: '#F59E0B' }]}>SQL Primer</Text>
          </View>
        ) : null}
        {lab.simulatorTypes.slice(0, 2).map(type => (
          <View key={type} style={[styles.chip, { backgroundColor: `${levelColor}12` }]}>
            <Text style={[styles.chipText, { color: levelColor }]}>
              {type.replace('starkzap-', '').replace('judgment-', '').replace('sandbox-', '')}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function EcosystemTrackScreen() {
  const { colors } = useTheme();
  const { user, refreshUser, updateActiveField } = useAuth();
  const router = useRouter();

  const [hasDuneKey, setHasDuneKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const completedBossIds = useMemo(() => {
    const src = user?.completed_levels ?? [];
    return src
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));
  }, [user?.completed_levels]);

  const fetchSupplementary = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data: any = await API.getUserProgress();
      setHasDuneKey(data?.dune_api_configured ?? false);
    } catch {
      // Best effort only.
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchSupplementary();
  }, [fetchSupplementary]);

  useEffect(() => {
    if (!user?.id || user.currentTrackId === 'starknet-ecosystem-deep-dive') {
      return;
    }

    void updateActiveField(
      'starknet',
      '#EC4899',
      'starknet-ecosystem-deep-dive',
      'Starknet Ecosystem Deep Dive',
    ).catch(() => {});
  }, [updateActiveField, user?.currentTrackId, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    await fetchSupplementary();
    setRefreshing(false);
  };

  const isLabUnlocked = (lab: EcosystemLabDef): boolean => {
    if (lab.requiresLevelId === null) return true;
    return completedBossIds.includes(lab.requiresLevelId);
  };

  const isLabComplete = (lab: EcosystemLabDef): boolean => {
    if (lab.number === 0) return completedBossIds.includes(4000);
    const bossId = ECOSYSTEM_TRACK.bossLevelIds[`lab${lab.number}` as keyof typeof ECOSYSTEM_TRACK.bossLevelIds];
    return bossId ? completedBossIds.includes(bossId) : false;
  };

  const currentLabId = ECOSYSTEM_LABS.find(l => isLabUnlocked(l) && !isLabComplete(l))?.id;

  const handleLabPress = (lab: EcosystemLabDef) => {
    if (!isLabUnlocked(lab)) {
      Alert.alert(
        'Lab Locked',
        `Complete the previous lab boss to unlock ${lab.title}.`
      );
      return;
    }
    router.push({
      pathname: '/world' as any,
      params: {
        worldId: 'starknet-realm',
        trackId: ECOSYSTEM_TRACK.id,
        trackName: ECOSYSTEM_TRACK.name,
        labId: lab.id,
        labNumber: String(lab.number),
      },
    });
  };

  const handleConfigureDune = () => {
    Linking.openURL('https://docs.dune.com/api-reference/overview/introduction');
  };

  const juniorLabs = ECOSYSTEM_LABS.filter(l => l.level === 'junior');
  const intermediateLabs = ECOSYSTEM_LABS.filter(l => l.level === 'intermediate');
  const seniorLabs = ECOSYSTEM_LABS.filter(l => l.level === 'senior');
  const completedCount = ECOSYSTEM_LABS.filter(isLabComplete).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={[styles.heroEyebrow, { color: ACCENT }]}>Analyst Workspace</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Ecosystem Deep Dive</Text>
          <Text style={[styles.heroSub, { color: colors.textSoft }]}>
            Research protocols, write reports, and build a Starknet analyst portfolio with the proper lab sequence intact.
          </Text>

          <View style={styles.statsRow}>
            {[
              { label: 'Labs cleared', value: `${completedCount}/${ECOSYSTEM_LABS.length}`, accent: ACCENT },
              { label: 'Track state', value: currentLabId ? 'Continue' : 'Review', accent: currentLabId ? ACCENT : '#10B981' },
              { label: 'Dune', value: hasDuneKey ? 'Ready' : 'Pending', accent: hasDuneKey ? '#10B981' : colors.text },
            ].map(item => (
              <View key={item.label} style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.statValue, { color: item.accent }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <DuneStatusBanner hasDuneKey={hasDuneKey} onConfigure={handleConfigureDune} />

        <LevelHeader label="Junior Level" color={ECOSYSTEM_LEVEL_COLORS.junior} />
        {juniorLabs.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            isLocked={!isLabUnlocked(lab)}
            isComplete={isLabComplete(lab)}
            isCurrent={lab.id === currentLabId}
            onPress={() => handleLabPress(lab)}
          />
        ))}

        <LevelHeader label="Intermediate Level" color={ECOSYSTEM_LEVEL_COLORS.intermediate} />
        {intermediateLabs.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            isLocked={!isLabUnlocked(lab)}
            isComplete={isLabComplete(lab)}
            isCurrent={lab.id === currentLabId}
            onPress={() => handleLabPress(lab)}
          />
        ))}

        <LevelHeader label="Senior Level" color={ECOSYSTEM_LEVEL_COLORS.senior} />
        {seniorLabs.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            isLocked={!isLabUnlocked(lab)}
            isComplete={isLabComplete(lab)}
            isCurrent={lab.id === currentLabId}
            onPress={() => handleLabPress(lab)}
          />
        ))}

        <DisclaimerFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { ...webContainer, gap: Spacing.md, paddingBottom: 60 },
  heroCard: { borderWidth: 1, borderRadius: Radius.xxl, padding: Spacing.lg, gap: Spacing.md, ...Shadow.sm },
  backButton: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8 },
  backButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  heroEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  heroSub: { fontSize: FontSize.sm, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 96, borderRadius: Radius.lg, padding: Spacing.md, gap: 2 },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  statLabel: { fontSize: 10, fontWeight: FontWeight.medium },
  bannerCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
  bannerHeader: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  bannerCopy: { flex: 1 },
  bannerEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  bannerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginTop: 2 },
  bannerBody: { fontSize: FontSize.sm, lineHeight: 20, marginTop: 2 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  levelHeaderLine: { flex: 1, height: 1 },
  levelHeaderText: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.2 },
  labCard: { borderWidth: 1.5, borderRadius: Radius.xl, padding: Spacing.md, gap: Spacing.sm, ...Shadow.sm },
  labHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  labNumberBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labNumberText: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  labCopy: { flex: 1 },
  labEyebrow: { fontSize: 10, fontWeight: FontWeight.black, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  labTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, lineHeight: 22 },
  labMeta: { fontSize: FontSize.xs },
  statePill: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  statePillText: { fontSize: 10, fontWeight: FontWeight.black },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  chipText: { fontSize: 9, fontWeight: FontWeight.black },
});
