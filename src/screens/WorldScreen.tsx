/**
 * Sifter Skill_Up — World Screen (fixed)
 * Fixes:
 *   Bug #1: WorldScreen now reads labId and loads Navigator/Ecosystem/Cairo lab content
 *   Bug #3: routeParams was undefined — now uses useLocalSearchParams() correctly
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Dimensions, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, getWorldTheme, Spacing, Radius, FontSize, AnimPreset, type WorldTheme } from '../theme';
import { getFieldDetail, isTrackLive } from '../data/fieldDetails';
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

// ─── Floating particle ─────────────────────────────────────────────────────────

function Particle({ color, delay, index }: { color: string; delay: number; index: number }) {
  const x     = useRef(new Animated.Value(Math.random() * W)).current;
  const y     = useRef(new Animated.Value(H + 20)).current;
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
          Animated.timing(y,     { toValue: -20,  duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(alpha, { toValue: 0.7, duration: 800, useNativeDriver: true }),
            Animated.timing(alpha, { toValue: 0,   duration: 800, useNativeDriver: true, delay: duration - 1600 }),
          ]),
        ]),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.View pointerEvents="none"
      style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: alpha,
        transform: [{ translateX: x }, { translateY: y }, { scale }] }}
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
          Animated.timing(alpha, { toValue: 0.2,  ...AnimPreset.pulse }),
        ]),
      ])).start();
    });
  }, [delay]);
  return (
    <Animated.View pointerEvents="none"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color,
        opacity: alpha, transform: [{ scale }], position: 'absolute' }}
    />
  );
}

// ─── Lab content loader ────────────────────────────────────────────────────────
// Dynamically load lab data based on labId and trackId

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

// ─── Lab World Screen (when labId is present) ─────────────────────────────────

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

  // Navigator boss IDs: lab N boss = level 3000 + N
  // Ecosystem boss IDs: lab N boss = level 4000 + N
  // Cairo boss IDs:     lab N boss = level 5000 + N
  const bossLevelId =
    trackId === 'starknet-defi-navigator'     ? 3000 + labNum :
    trackId === 'starknet-ecosystem-deep-dive' ? 4000 + labNum :
    trackId === 'cairo-builder'               ? 5000 + labNum :
    3000 + labNum;

  function handleStartLab() {
    // Starknet tracks: look up the first real lesson in the registry instead of
    // guessing `bossLevelId - 1` (which collides with boss IDs of the previous
    // lab — e.g. Navigator lab 2 "first lesson" would resolve to 3001, the
    // Lab 1 boss). We pass a stable (trackId, labId, labNumber, lessonIndex=0)
    // tuple and let LessonScreen resolve the lesson object from the registry.
    if (isStarknetTrack(trackId)) {
      const lab = getStarknetLab(trackId as StarknetTrackId, labNum);
      if (lab && lab.lessons.length > 0) {
        router.push({
          pathname: '/(tabs)/map/lesson' as any,
          params: {
            // levelId still sent for legacy/compat; LessonScreen prefers the
            // (trackId, labId, lessonIndex) tuple when present.
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

    // Fallback for non-Starknet tracks (or unmapped Starknet labs): keep the
    // previous behaviour — assume the first lesson's numeric id is boss - 1.
    router.push({
      pathname: '/(tabs)/map/lesson' as any,
      params: { levelId: bossLevelId - 1, trackId, labId, labNumber },
    });
  }

  const contentStyle = {
    opacity: enterAnim,
    transform: [{ translateY: enterAnim.interpolate({ inputRange: [0,1], outputRange: [30, 0] }) }],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}>
        <Animated.View style={[{ alignItems: 'center', gap: Spacing.md }, contentStyle]}>
          <View style={{ backgroundColor: `${accentColor}20`, borderRadius: Radius.full,
            paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
            borderWidth: 1, borderColor: `${accentColor}50` }}>
            <Text style={{ color: accentColor, fontWeight: '800', fontSize: FontSize.sm }}>
              {trackName.toUpperCase()}
            </Text>
          </View>

          <Text style={{ color: '#fff', fontSize: FontSize.xxxl, fontWeight: '900', textAlign: 'center' }}>
            Lab {labNum}
          </Text>

          {loading ? (
            <ActivityIndicator color={accentColor} size="large" />
          ) : (
            <Text style={{ color: '#aaa', fontSize: FontSize.md, textAlign: 'center' }}>
              {lessonCount > 0 ? `${lessonCount} lessons + boss challenge` : 'Ready to begin'}
            </Text>
          )}
        </Animated.View>

        {/* Lab info cards */}
        <Animated.View style={[{ gap: Spacing.md }, contentStyle]}>
          <View style={{ backgroundColor: '#1A1A2E', borderRadius: Radius.lg, padding: Spacing.lg,
            borderWidth: 1, borderColor: `${accentColor}30`, gap: Spacing.sm }}>
            <Text style={{ color: accentColor, fontWeight: '800', fontSize: FontSize.sm }}>
              📚 LESSONS
            </Text>
            <Text style={{ color: '#ddd', fontSize: FontSize.md, lineHeight: 22 }}>
              Work through all lessons to master the concepts before the boss challenge.
              Each lesson is scored deterministically — your answers are checked against
              Starknet industry standards curated by the platform.
            </Text>
          </View>

          <View style={{ backgroundColor: '#1A1A2E', borderRadius: Radius.lg, padding: Spacing.lg,
            borderWidth: 1, borderColor: '#FF6B0030', gap: Spacing.sm }}>
            <Text style={{ color: '#FF6B00', fontWeight: '800', fontSize: FontSize.sm }}>
              🔥 BOSS CHALLENGE
            </Text>
            <Text style={{ color: '#ddd', fontSize: FontSize.md, lineHeight: 22 }}>
              The boss unlocks automatically after you finish every lesson in this lab.{'\n'}
              Phase 1 uses platform-scored questions and Phase 2 verifies practical work against the correct Starknet toolchain.
            </Text>
          </View>

          {/* Sepolia / Starkzap indicator */}
          {(trackId === 'starknet-defi-navigator' || trackId === 'cairo-builder') && (
            <View style={{ backgroundColor: '#0A2A1A', borderRadius: Radius.lg, padding: Spacing.md,
              borderWidth: 1, borderColor: '#00FF8830', flexDirection: 'row', gap: Spacing.sm,
              alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00FF88', fontWeight: '800', fontSize: FontSize.xs }}>
                  STARKNET SEPOLIA ACTIVE
                </Text>
                <Text style={{ color: '#aaa', fontSize: FontSize.xs, marginTop: 2 }}>
                  Transactions verified on-chain via Starkzap + BlastAPI RPC
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* CTAs */}
        <Animated.View style={[{ gap: Spacing.md }, contentStyle]}>
          <TouchableOpacity
            style={{ backgroundColor: accentColor, borderRadius: Radius.xl,
              paddingVertical: Spacing.lg, alignItems: 'center' }}
            onPress={handleStartLab}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontSize: FontSize.lg, fontWeight: '900' }}>
              Start Lab {labNum} →
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main WorldScreen ──────────────────────────────────────────────────────────

export default function WorldScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Bug #3 fix: use useLocalSearchParams() — not useRoute() which gives undefined routeParams
  const params = useLocalSearchParams<{
    worldId?: string;
    trackId?: string;
    fieldId?: string;
    trackName?: string;
    live?: string;
    labId?: string;
    labNumber?: string;
  }>();

  const worldId   = params.worldId   ?? 'default';
  const trackId   = params.trackId   ?? '';
  const fieldId   = params.fieldId   ?? '';
  const trackName = params.trackName ?? 'World';
  const live      = params.live === 'true' || params.live === '1';
  const labId     = params.labId     ?? '';
  const labNumber = params.labNumber ?? '';

  // Bug #1 fix: if labId provided, render LabWorldScreen directly
  if (labId) {
    const accentColor =
      trackId === 'starknet-defi-navigator'      ? '#EC4899' :
      trackId === 'starknet-ecosystem-deep-dive'  ? '#6366F1' :
      trackId === 'cairo-builder'                 ? '#F97316' :
      '#EC4899';

    return (
      <LabWorldScreen
        trackId={trackId}
        trackName={trackName}
        labId={labId}
        labNumber={labNumber}
        accentColor={accentColor}
      />
    );
  }

  const worldTheme = getWorldTheme(worldId);
  const field      = fieldId ? getField(fieldId) : null;
  const detail     = fieldId ? getFieldDetail(fieldId) : null;
  const track      = detail
    ? [...(detail.generalTracks ?? []), ...(detail.specificTracks ?? [])].find(t => t.id === trackId)
    : null;

  const headerAnim  = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const headerStyle = {
    opacity: headerAnim,
    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-24, 0] }) }],
  };
  const contentStyle = {
    opacity: contentAnim,
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0,1], outputRange: [20, 0] }) }],
  };

  const handleCTA = () => {
    if (!live) return;
    if (trackId.startsWith('quant'))      { router.push('/quant-map' as any); return; }
    if (trackId === 'starknet-defi-navigator')      { router.push('/starknet-track' as any); return; }
    if (trackId === 'starknet-ecosystem-deep-dive') { router.push('/ecosystem-track' as any); return; }
    if (trackId === 'cairo-builder')                { router.push('/cairo-builder-track' as any); return; }
    router.push('/(tabs)/map/island' as any);
  };

  const [bg0, bg1] = worldTheme.bgGradient;

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

      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.worldHeader, headerStyle]}>
            <Text style={styles.worldEmoji}>{worldTheme.emoji}</Text>
            <Text style={styles.worldName}>{worldTheme.name}</Text>
            {trackName !== 'World' && (
              <Text style={styles.worldSub}>{trackName}</Text>
            )}
          </Animated.View>

          <Animated.View style={[styles.worldContent, contentStyle]}>
            {live ? (
              <TouchableOpacity style={styles.ctaBtn} onPress={handleCTA} activeOpacity={0.85}>
                <Text style={styles.ctaBtnText}>Enter {trackName} →</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>🔒 Coming Soon</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  orbContainer: { position: 'absolute', left: -80, top: -60 },
  scrollContent:{ padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xl },
  backBtn:      { margin: Spacing.md, padding: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText:  { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
  worldHeader:  { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  worldEmoji:   { fontSize: 64 },
  worldName:    { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
  worldSub:     { fontSize: FontSize.md, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  worldContent: { gap: Spacing.lg },
  ctaBtn:       { backgroundColor: '#EC4899', borderRadius: Radius.xl, paddingVertical: Spacing.lg, alignItems: 'center' },
  ctaBtnText:   { color: '#fff', fontSize: FontSize.lg, fontWeight: '900' },
  lockedBadge:  { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  lockedText:   { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.lg, fontWeight: '700' },
});
