import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, getWorldTheme, Spacing, Radius, FontSize, AnimPreset } from '../theme';
import { getFieldDetail } from '../data/fieldDetails';
import { getField } from '../data/fields';
import {
  isStarknetTrack,
  getStarknetLab,
  getStarknetLessonCount,
  getStarknetLessonRuntimeId,
  type StarknetTrackId,
} from '../data/tracks/starknet_ecosystem/starknetLessonRegistry';

const { width: W, height: H } = Dimensions.get('window');
const NUM_PARTICLES = 18;

function Particle({ color, delay, index }: { color: string; delay: number; index: number }) {
  const x = useRef(new Animated.Value(Math.random() * W)).current;
  const y = useRef(new Animated.Value(H + 20)).current;
  const scale = useRef(new Animated.Value(Math.random() * 0.8 + 0.3)).current;
  const alpha = useRef(new Animated.Value(0)).current;

  const size = 4 + Math.random() * 8;
  const startX = Math.random() * W;
  const duration = 4000 + Math.random() * 4000;

  useEffect(() => {
    const run = () => {
      x.setValue(startX + (Math.random() - 0.5) * 80);
      y.setValue(H + 20);
      alpha.setValue(0);
      Animated.sequence([
        Animated.delay(delay + index * 200),
        Animated.parallel([
          Animated.timing(y, { toValue: -20, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(alpha, { toValue: 0.7, duration: 800, useNativeDriver: true }),
            Animated.timing(alpha, { toValue: 0, duration: 800, useNativeDriver: true, delay: duration - 1600 }),
          ]),
        ]),
      ]).start(() => run());
    };
    run();
  }, [alpha, delay, duration, index, startX, x, y]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: alpha,
        transform: [{ translateX: x }, { translateY: y }, { scale }],
      }}
    />
  );
}

function GlowOrb({ color, size, delay }: { color: string; size: number; delay: number }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const alpha = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.delay(delay).start(() => {
      Animated.loop(Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, ...AnimPreset.pulse }),
          Animated.timing(scale, { toValue: 0.85, ...AnimPreset.pulse }),
        ]),
        Animated.sequence([
          Animated.timing(alpha, { toValue: 0.55, ...AnimPreset.pulse }),
          Animated.timing(alpha, { toValue: 0.2, ...AnimPreset.pulse }),
        ]),
      ])).start();
    });
  }, [alpha, delay, scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: alpha,
        transform: [{ scale }],
        position: 'absolute',
      }}
    />
  );
}

function getLabNumber(labId: string, labNumber?: string): number | null {
  const rawValue = labNumber && labNumber.length > 0 ? labNumber : labId;
  if (rawValue === 'primer') return 0;

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isFinite(parsed)) return parsed;

  const match = rawValue.match(/\d+/);
  if (!match) return null;

  const extracted = Number.parseInt(match[0], 10);
  return Number.isFinite(extracted) ? extracted : null;
}

function getLabLessonCount(trackId: string, labId: string, labNumber?: string): number | null {
  const normalizedLabNumber = getLabNumber(labId, labNumber);
  if (normalizedLabNumber === null) return null;

  if (isStarknetTrack(trackId)) {
    const count = getStarknetLessonCount(trackId as StarknetTrackId, normalizedLabNumber);
    return count > 0 ? count : null;
  }

  return null;
}

function getTrackAccent(trackId: string, fallbackAccent: string) {
  if (trackId === 'starknet-defi-navigator') return '#EC4899';
  if (trackId === 'starknet-ecosystem-deep-dive') return '#6366F1';
  if (trackId === 'cairo-builder') return '#F97316';
  return fallbackAccent;
}

function LabWorldScreen({
  trackId, trackName, labId, labNumber, accentColor,
}: {
  trackId: string; trackName: string; labId: string;
  labNumber: string; accentColor: string;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [lessonCount, setLessonCount] = useState(0);
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLessonCount(getLabLessonCount(trackId, labId, labNumber) ?? 0);
    setLoading(false);
    Animated.timing(enterAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [enterAnim, labId, labNumber, trackId]);

  const labNum = getLabNumber(labId, labNumber) ?? 0;
  const bossLevelId =
    trackId === 'starknet-defi-navigator' ? 3000 + labNum :
    trackId === 'starknet-ecosystem-deep-dive' ? 4000 + labNum :
    trackId === 'cairo-builder' ? 5000 + labNum :
    3000 + labNum;

  function handleStartLab() {
    if (isStarknetTrack(trackId)) {
      const lab = getStarknetLab(trackId as StarknetTrackId, labNum);
      if (lab && lab.lessons.length > 0) {
        router.push({
          pathname: '/map/lesson' as any,
          params: {
            levelId: getStarknetLessonRuntimeId(trackId as StarknetTrackId, labNum, 0),
            trackId,
            labId,
            labNumber,
            lessonIndex: '0',
          },
        });
        return;
      }
    }

    router.push({
      pathname: '/map/lesson' as any,
      params: { levelId: bossLevelId - 1, trackId, labId, labNumber },
    });
  }

  const contentStyle = {
    opacity: enterAnim,
    transform: [{ translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };

  return (
    <SafeAreaView style={[styles.labScreen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.labScroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.labHeroCard, { backgroundColor: colors.card, borderColor: `${accentColor}30` }, contentStyle]}>
          <TouchableOpacity style={[styles.backChip, { backgroundColor: colors.bgSecondary }]} onPress={() => router.back()}>
            <Text style={[styles.backChipText, { color: colors.text }]}>{'<'} Back</Text>
          </TouchableOpacity>

          <Text style={[styles.surfaceEyebrow, { color: accentColor }]}>Track Workspace</Text>
          <Text style={[styles.labTitle, { color: colors.text }]}>{trackName}</Text>
          <Text style={[styles.labSub, { color: colors.textSoft }]}>Lab {labNum}</Text>
          {loading ? (
            <ActivityIndicator color={accentColor} size="large" />
          ) : (
            <Text style={[styles.labHeroCopy, { color: colors.textMuted }]}>
              {lessonCount > 0 ? `${lessonCount} lessons plus the boss challenge are ready.` : 'Ready to begin.'}
            </Text>
          )}

          <View style={styles.labStatsRow}>
            <View style={[styles.labStatCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.labStatValue, { color: colors.text }]}>{lessonCount || '--'}</Text>
              <Text style={[styles.labStatLabel, { color: colors.textMuted }]}>Lessons</Text>
            </View>
            <View style={[styles.labStatCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.labStatValue, { color: accentColor }]}>{bossLevelId}</Text>
              <Text style={[styles.labStatLabel, { color: colors.textMuted }]}>Boss ID</Text>
            </View>
            <View style={[styles.labStatCard, { backgroundColor: colors.bgSecondary }]}>
              <Text style={[styles.labStatValue, { color: accentColor }]}>Continue</Text>
              <Text style={[styles.labStatLabel, { color: colors.textMuted }]}>State</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.labInfoStack, contentStyle]}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: `${accentColor}24` }]}>
            <Text style={[styles.infoEyebrow, { color: accentColor }]}>Lessons</Text>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Work the full sequence first</Text>
            <Text style={[styles.infoBody, { color: colors.textSoft }]}>
              Lessons stay on the real route. Finish the sequence to unlock the boss with the right lab and track context preserved.
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: '#FF6B0030' }]}>
            <Text style={[styles.infoEyebrow, { color: '#FF6B00' }]}>Boss Review</Text>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Final check after every lesson</Text>
            <Text style={[styles.infoBody, { color: colors.textSoft }]}>
              Phase 1 is platform scored. Phase 2 verifies the practical work against the intended Starknet toolchain.
            </Text>
          </View>

          {(trackId === 'starknet-defi-navigator' || trackId === 'cairo-builder') && (
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: '#00FF8830' }]}>
              <Text style={[styles.infoEyebrow, { color: '#00FF88' }]}>Sepolia Live</Text>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Transactions remain on-chain</Text>
              <Text style={[styles.infoBody, { color: colors.textSoft }]}>
                Starkzap and the connected RPC path remain part of the workflow for transaction and deployment verification.
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[contentStyle]}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: accentColor }]}
            onPress={handleStartLab}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Continue Lab {labNum}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function WorldScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const params = useLocalSearchParams<{
    worldId?: string;
    trackId?: string;
    fieldId?: string;
    trackName?: string;
    live?: string;
    labId?: string;
    labNumber?: string;
  }>();

  const worldId = params.worldId ?? 'default';
  const trackId = params.trackId ?? '';
  const fieldId = params.fieldId ?? '';
  const trackName = params.trackName ?? 'World';
  const live = params.live === 'true' || params.live === '1';
  const labId = params.labId ?? '';
  const labNumber = params.labNumber ?? '';
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const worldTheme = getWorldTheme(worldId);
  const field = fieldId ? getField(fieldId) : null;
  const detail = fieldId ? getFieldDetail(fieldId) : null;
  const track = detail
    ? [...(detail.generalTracks ?? []), ...(detail.specificTracks ?? [])].find(t => t.id === trackId)
    : null;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [contentAnim, headerAnim]);

  const headerStyle = {
    opacity: headerAnim,
    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
  };
  const contentStyle = {
    opacity: contentAnim,
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  if (labId) {
    return (
      <LabWorldScreen
        trackId={trackId}
        trackName={trackName}
        labId={labId}
        labNumber={labNumber}
        accentColor={getTrackAccent(trackId, colors.accent)}
      />
    );
  }

  const handleCTA = () => {
    if (!live) return;
    if (trackId.startsWith('quant')) { router.push('/quant-map' as any); return; }
    if (trackId === 'starknet-defi-navigator') { router.push('/starknet-track' as any); return; }
    if (trackId === 'starknet-ecosystem-deep-dive') { router.push('/ecosystem-track' as any); return; }
    if (trackId === 'cairo-builder') { router.push('/cairo-builder-track' as any); return; }
    router.push('/map/island' as any);
  };

  const [bg0, bg1] = worldTheme.bgGradient;
  const accentColor = getTrackAccent(trackId, worldTheme.glowColor);
  const statusLabel = live ? 'Continue' : 'Locked';
  const statusCopy = live
    ? 'This track is live in the new shell and routes directly to the correct workspace.'
    : 'The world stays visible for orientation, but entry is still gated until the track is live.';

  return (
    <View style={[styles.screen, { backgroundColor: bg0 }]}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: bg1, top: H * 0.4 }]} />

      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} color={worldTheme.particleColor} delay={i * 300} index={i} />
      ))}

      <View style={styles.orbContainer} pointerEvents="none">
        <GlowOrb color={worldTheme.glowColor} size={320} delay={0} />
      </View>
      <View style={[styles.orbContainer, { right: -80, top: H * 0.4 }]} pointerEvents="none">
        <GlowOrb color={worldTheme.glowColor} size={240} delay={800} />
      </View>

      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.worldHeroCard, headerStyle]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>{'<'} Back</Text>
            </TouchableOpacity>
            <Text style={[styles.surfaceEyebrow, { color: accentColor }]}>
              {field?.name ? `${field.name} World` : 'World Surface'}
            </Text>
            <Text style={styles.worldName}>{worldTheme.name}</Text>
            {trackName !== 'World' && (
              <Text style={styles.worldSub}>{trackName}</Text>
            )}
            <Text style={styles.worldBodyText}>
              {track?.description ?? detail?.worldDescription ?? 'Track-specific world view with a direct path into the right workspace.'}
            </Text>

            <View style={styles.worldMetaRow}>
              <View style={styles.worldMetaCard}>
                <Text style={[styles.worldMetaValue, { color: accentColor }]}>{statusLabel}</Text>
                <Text style={styles.worldMetaLabel}>State</Text>
              </View>
              <View style={styles.worldMetaCard}>
                <Text style={styles.worldMetaValue}>{trackName !== 'World' ? trackName : worldTheme.name}</Text>
                <Text style={styles.worldMetaLabel}>Context</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.worldContent, contentStyle]}>
            <View style={styles.worldInfoCard}>
              <Text style={[styles.worldInfoLabel, { color: accentColor }]}>Workspace Status</Text>
              <Text style={styles.worldInfoTitle}>{live ? 'Route is live' : 'Entry is gated'}</Text>
              <Text style={styles.worldInfoText}>{statusCopy}</Text>
            </View>

            {live ? (
              <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: accentColor }]} onPress={handleCTA} activeOpacity={0.85}>
                <Text style={styles.ctaBtnText}>Continue to {trackName}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>Locked until the track goes live</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  orbContainer: { position: 'absolute', left: -80, top: -60 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xl },
  backBtn: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: Spacing.md,
  },
  backBtnText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '800' },
  surfaceEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  worldHeroCard: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  worldName: { fontSize: 28, fontWeight: '900', color: '#fff' },
  worldSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.72)' },
  worldBodyText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.76)', lineHeight: 19, maxWidth: 540 },
  worldMetaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  worldMetaCard: {
    minWidth: 120,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  worldMetaValue: { fontSize: FontSize.sm, fontWeight: '900', color: '#fff', marginBottom: 2 },
  worldMetaLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.52)' },
  worldContent: { gap: Spacing.lg },
  worldInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  worldInfoLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 },
  worldInfoTitle: { fontSize: FontSize.lg, fontWeight: '900', color: '#fff', marginBottom: 4 },
  worldInfoText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.72)', lineHeight: 19 },
  ctaBtn: { borderRadius: Radius.xl, paddingVertical: 14, alignItems: 'center' },
  ctaBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900' },
  lockedBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  lockedText: { color: 'rgba(255,255,255,0.68)', fontSize: FontSize.sm, fontWeight: '700' },
  labScreen: { flex: 1 },
  labScroll: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  backChip: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8 },
  backChipText: { fontSize: FontSize.xs, fontWeight: '800' },
  labHeroCard: { borderRadius: Radius.xxl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.sm },
  labTitle: { fontSize: FontSize.xxl, fontWeight: '900' },
  labSub: { fontSize: FontSize.md, fontWeight: '700' },
  labHeroCopy: { fontSize: FontSize.sm, lineHeight: 20 },
  labStatsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginTop: Spacing.sm },
  labStatCard: { borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 10, minWidth: 98 },
  labStatValue: { fontSize: FontSize.sm, fontWeight: '900', marginBottom: 2 },
  labStatLabel: { fontSize: 10, fontWeight: '700' },
  labInfoStack: { gap: Spacing.md },
  infoCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.xs },
  infoEyebrow: { fontSize: FontSize.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  infoTitle: { fontSize: FontSize.md, fontWeight: '900' },
  infoBody: { fontSize: FontSize.sm, lineHeight: 20 },
  primaryButton: { borderRadius: Radius.xl, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '900' },
});
