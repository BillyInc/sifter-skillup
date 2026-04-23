/**
 * Sifter SkillUp — EcosystemTrackScreen
 * Starknet Ecosystem Deep Dive track screen.
 * Mirrors StarknetTrackScreen pattern and locking logic.
 * Place at: src/screens/EcosystemTrackScreen.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Animated, Linking, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';
import { API_BASE } from '../lib/api';
import {
  ECOSYSTEM_LABS,
  ECOSYSTEM_LEVEL_COLORS,
  ECOSYSTEM_TRACK,
  type EcosystemLabDef,
} from '../data/tracks/starknet_ecosystem/ecosystem/ecosystemTrack';

// ─── Accent color for this track ─────────────────────────────
const ACCENT = '#6366F1'; // indigo

// ─── Sub-components ───────────────────────────────────────────

function DuneStatusBanner({ hasDuneKey, onConfigure }: {
  hasDuneKey: boolean; onConfigure: () => void;
}) {
  const { colors } = useTheme();
  if (hasDuneKey) {
    return (
      <View style={[db.wrap, { backgroundColor: `${ACCENT}15`, borderColor: `${ACCENT}40` }]}>
        <Text style={db.icon}>🔭</Text>
        <View style={{ flex: 1 }}>
          <Text style={[db.label, { color: ACCENT }]}>DUNE API CONNECTED</Text>
          <Text style={[db.sub, { color: colors.textSoft }]}>Lab 9 SQL queries run on live Starknet data</Text>
        </View>
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={[db.wrap, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
      onPress={onConfigure}
    >
      <Text style={db.icon}>🔭</Text>
      <View style={{ flex: 1 }}>
        <Text style={[db.label, { color: colors.textMuted }]}>DUNE API NOT CONFIGURED</Text>
        <Text style={[db.sub, { color: colors.textSoft }]}>Labs 1–8 work without it. Lab 9 uses demo data until configured.</Text>
      </View>
      <View style={[db.btn, { backgroundColor: ACCENT }]}>
        <Text style={db.btnTxt}>Configure</Text>
      </View>
    </TouchableOpacity>
  );
}
const db = StyleSheet.create({
  wrap:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.md },
  icon:   { fontSize: 26 },
  label:  { fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  sub:    { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: 2 },
  btn:    { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  btnTxt: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.black },
});

function LevelHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={lh.wrap}>
      <View style={[lh.line, { backgroundColor: color }]} />
      <Text style={[lh.txt, { color }]}>{label.toUpperCase()}</Text>
      <View style={[lh.line, { backgroundColor: color }]} />
    </View>
  );
}
const lh = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.md },
  line: { flex: 1, height: 1 },
  txt:  { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.2 },
});

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
  const pulse = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!isCurrent) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.02, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isCurrent]);

  const borderColor = isComplete ? levelColor : isCurrent ? ACCENT : colors.border;
  const bg = isComplete
    ? `${levelColor}10`
    : isCurrent
    ? `${ACCENT}10`
    : colors.bgSecondary;

  return (
    <Animated.View style={{ transform: [{ scale: isCurrent ? pulse : 1 }] }}>
      <TouchableOpacity
        style={[lc.card, { backgroundColor: bg, borderColor, opacity: isLocked ? 0.45 : 1 }]}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.75}
      >
        {/* Header row */}
        <View style={lc.header}>
          <View style={[lc.numBadge, { backgroundColor: isComplete ? levelColor : `${levelColor}25` }]}>
            <Text style={[lc.numTxt, { color: isComplete ? '#fff' : levelColor }]}>
              {lab.number === 0 ? 'PRIMER' : `LAB ${lab.number}`}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          {lab.portfolioPush && !isLocked && (
            <View style={[lc.badge, { backgroundColor: `${ACCENT}20` }]}>
              <Text style={[lc.badgeTxt, { color: ACCENT }]}>💼 PORTFOLIO</Text>
            </View>
          )}
          {isComplete && <Text style={{ fontSize: 18 }}>✅</Text>}
          {isLocked  && <Text style={{ fontSize: 18 }}>🔒</Text>}
          {isCurrent && !isComplete && <Text style={{ fontSize: 18 }}>▶️</Text>}
        </View>

        {/* Title */}
        <Text style={[lc.title, { color: isLocked ? colors.textMuted : colors.text }]}>
          {lab.title}
        </Text>

        {/* Meta row */}
        <View style={lc.meta}>
          <Text style={[lc.metaTxt, { color: colors.textMuted }]}>
            {lab.lessonCount} lessons · ~{lab.estimatedH}h
          </Text>
          {lab.sqlPrimerRequired && (
            <View style={[lc.badge, { backgroundColor: '#F59E0B20', marginLeft: Spacing.sm }]}>
              <Text style={[lc.badgeTxt, { color: '#F59E0B' }]}>INCLUDES SQL PRIMER</Text>
            </View>
          )}
        </View>

        {/* Simulator type chips */}
        {lab.simulatorTypes.length > 0 && (
          <View style={lc.chips}>
            {lab.simulatorTypes.slice(0, 3).map(t => (
              <View key={t} style={[lc.chip, { backgroundColor: `${levelColor}15` }]}>
                <Text style={[lc.chipTxt, { color: levelColor }]}>
                  {t.replace('starkzap-', '').replace('judgment-', '').replace('sandbox-', '')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
const lc = StyleSheet.create({
  card:     { borderWidth: 1.5, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm, ...Shadow.sm },
  header:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  numBadge: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  numTxt:   { fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  title:    { fontSize: FontSize.md, fontWeight: FontWeight.bold, lineHeight: 22 },
  meta:     { flexDirection: 'row', alignItems: 'center' },
  metaTxt:  { fontSize: FontSize.sm },
  badge:    { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeTxt: { fontSize: 8, fontWeight: FontWeight.black, letterSpacing: 0.6 },
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip:     { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  chipTxt:  { fontSize: 9, fontWeight: FontWeight.semibold },
});

// ─── Main Screen ──────────────────────────────────────────────

export default function EcosystemTrackScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [completedBossIds, setCompletedBossIds] = useState<number[]>([]);
  const [hasDuneKey, setHasDuneKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProgress = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/progress/${user.id}`);
      const data = await res.json();
      setCompletedBossIds(data.completed_levels ?? []);
      setHasDuneKey(data.dune_api_configured ?? false);
    } catch {
      // offline — keep existing state
    }
  };

  useEffect(() => { fetchProgress(); }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgress();
    setRefreshing(false);
  };

  /** Is this lab unlocked for the current user? */
  const isLabUnlocked = (lab: EcosystemLabDef): boolean => {
    if (lab.requiresLevelId === null) return true;
    return completedBossIds.includes(lab.requiresLevelId);
  };

  const isLabComplete = (lab: EcosystemLabDef): boolean => {
    if (lab.number === 0) return completedBossIds.includes(4000);
    const bossId = ECOSYSTEM_TRACK.bossLevelIds[`lab${lab.number}` as keyof typeof ECOSYSTEM_TRACK.bossLevelIds];
    return bossId ? completedBossIds.includes(bossId) : false;
  };

  /** The first lab that is unlocked but not complete */
  const currentLabId = ECOSYSTEM_LABS.find(l => isLabUnlocked(l) && !isLabComplete(l))?.id;

  const handleLabPress = (lab: EcosystemLabDef) => {
    if (!isLabUnlocked(lab)) {
      Alert.alert(
        'Lab Locked',
        `Complete the previous lab's boss battle to unlock ${lab.title}.`
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

  // Group labs by level
  const juniorLabs       = ECOSYSTEM_LABS.filter(l => l.level === 'junior');
  const intermediateLabs = ECOSYSTEM_LABS.filter(l => l.level === 'intermediate');
  const seniorLabs       = ECOSYSTEM_LABS.filter(l => l.level === 'senior');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {/* Header */}
        <View style={{ gap: Spacing.xs }}>
          <Text style={{ fontSize: 10, fontWeight: FontWeight.black, color: ACCENT, letterSpacing: 1 }}>
            STARKNET ECOSYSTEM DEEP DIVE
          </Text>
          <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.black, color: colors.text }}>
            Ecosystem Analysis
          </Text>
          <Text style={{ fontSize: FontSize.sm, color: colors.textSoft, lineHeight: 20 }}>
            Research protocols. Publish findings. Write grants. Build a Senior analyst portfolio.
          </Text>
        </View>

        {/* Track stats strip */}
        <View style={s.statsRow}>
          {[
            { label: 'Labs', value: '9' },
            { label: 'Lessons', value: '55+' },
            { label: 'Est. Hours', value: '120' },
            { label: 'Level', value: 'Junior → Senior' },
          ].map(({ label, value }) => (
            <View key={label} style={[s.statBox, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[s.statVal, { color: ACCENT }]}>{value}</Text>
              <Text style={[s.statLbl, { color: colors.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Dune API banner */}
        <DuneStatusBanner hasDuneKey={hasDuneKey} onConfigure={handleConfigureDune} />

        {/* Junior Labs */}
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

        {/* Intermediate Labs */}
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

        {/* Senior Labs */}
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

const s = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox:  { flex: 1, borderRadius: Radius.lg, padding: Spacing.sm, alignItems: 'center', gap: 2 },
  statVal:  { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  statLbl:  { fontSize: 9, fontWeight: FontWeight.medium, letterSpacing: 0.4 },
});
