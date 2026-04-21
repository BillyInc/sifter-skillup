/**
 * Sifter Skill_Up — Animated Island Map
 *
 * Each island is a distinct visual object — not a card.
 * Islands float, pulse, glow. Boss islands have fire rings.
 * Tap → spring zoom → lesson gateway opens.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Easing, Dimensions, SafeAreaView, Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { TrackChoiceScreen } from './PostIslandTrackSelection';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { ISLANDS, getIsland, type Island } from '../data/islands';
import { useAuth } from '../hooks/useAuth';

const { width: SW } = Dimensions.get('window');

// ─── Sea background ───────────────────────────────────────────────────────────

function SeaBackground() {
  const waves = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    waves.forEach((w, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 500),
      Animated.timing(w, { toValue: 1, duration: 3000 + i * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(w, { toValue: 0, duration: 3000 + i * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start());
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020812', '#041020', '#060F22']} style={StyleSheet.absoluteFill} />
      {waves.map((w, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', top: `${20 + i * 28}%`,
          left: 0, right: 0, height: 1.5,
          backgroundColor: '#4AB0F030',
          opacity: w.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.16] }),
          transform: [{ scaleX: w.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.05] }) }],
        }} />
      ))}
    </View>
  );
}

// ─── Island object ────────────────────────────────────────────────────────────

function IslandObject({ island, unlocked, completed, current, onPress }: {
  island: Island; unlocked: boolean; completed: boolean; current: boolean; onPress: () => void;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  const isBoss  = island.id % 5 === 0;
  const isStark = island.id === 18;
  const SIZE    = isStark ? 110 : isBoss ? 96 : 82;
  const C       = island.color;
  const locked  = !unlocked;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -(5 + (island.id % 4)), duration: 2000 + island.id * 90, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: (5 + (island.id % 4)), duration: 2000 + island.id * 90, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    if (current) {
      Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.25, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1.07, tension: 80, friction: 5, useNativeDriver: true }),
        Animated.spring(pulseAnim, { toValue: 0.96, tension: 80, friction: 5, useNativeDriver: true }),
      ])).start();
    }
    if ((isBoss || isStark) && unlocked) {
      Animated.loop(Animated.timing(orbitAnim, { toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: true })).start();
    }
  }, [current, unlocked]);

  const handlePress = () => {
    if (!unlocked) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
    ]).start(onPress);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={iso.container}>
      <Animated.View style={{ alignItems: 'center', transform: [{ translateY: floatAnim }, { scale: pulseAnim }, { scale: pressAnim }] }}>

        {/* Orbit ring for boss/starknet */}
        {(isBoss || isStark) && unlocked && (
          <Animated.View style={[iso.orbit, {
            width: SIZE + 36, height: SIZE + 36,
            borderRadius: (SIZE + 36) / 2,
            borderColor: isStark ? C + '90' : '#FF6B0080',
            borderStyle: isStark ? 'dashed' : 'solid',
            transform: [{ rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: [isStark ? '0deg' : '0deg', isStark ? '-360deg' : '360deg'] }) }],
          }]}>
            <Text style={[iso.orbitDot]}>{isStark ? '⚡' : '🔥'}</Text>
          </Animated.View>
        )}

        {/* Current island glow */}
        {current && (
          <Animated.View style={[iso.glowRing, {
            width: SIZE + 26, height: SIZE + 26,
            borderRadius: (SIZE + 26) / 2,
            borderColor: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [C + '35', C + 'CC'] }) as any,
          }]} />
        )}

        {/* Island body */}
        <View style={[iso.body, {
          width: SIZE, height: SIZE * 0.7,
          borderRadius: SIZE * 0.5,
          backgroundColor: locked ? '#0D0D20' : C + '20',
          borderColor: locked ? '#2A2A40' : C,
          shadowColor: locked ? 'transparent' : C,
        }]}>
          {/* Water shimmer */}
          <View style={[iso.water, { backgroundColor: locked ? '#1A1A30' : C + '18' }]} />

          {/* Terrain details */}
          {!locked && (
            <>
              {island.tier === 'beginner' && <><Text style={[iso.tree, { left: '10%', fontSize: 11 }]}>🌴</Text><Text style={[iso.tree, { right: '10%', fontSize: 11 }]}>🌴</Text></>}
              {island.tier === 'intermediate' && <Text style={[iso.tree, { left: '30%', fontSize: 13 }]}>🏛️</Text>}
              {island.tier === 'pro' && <Text style={[iso.tree, { left: '28%', fontSize: 15 }]}>🗼</Text>}
            </>
          )}

          {/* Icon */}
          <View style={[iso.icon, { backgroundColor: locked ? '#2A2A3E' : C }]}>
            <Text style={{ fontSize: SIZE * 0.2 }}>{locked ? '🔒' : island.icon}</Text>
          </View>

          {/* Completion */}
          {completed && (
            <View style={[iso.check, { backgroundColor: '#10B981' }]}>
              <Text style={{ fontSize: 8, color: '#fff', fontWeight: '900' }}>✓</Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text style={[iso.name, { color: locked ? '#FFFFFF35' : '#FFFC' }]} numberOfLines={1}>{island.name}</Text>
        <Text style={[iso.meta, { color: locked ? '#FFFFFF20' : C + '90' }]}>
          {island.end - island.start + 1} lvls{isBoss ? ' 🔥' : ''}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Lesson gateway modal ─────────────────────────────────────────────────────

function LessonGateway({ island, onClose, onEnter }: { island: Island; onClose: () => void; onEnter: () => void; }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const scale    = useRef(new Animated.Value(0.88)).current;
  const spark    = useRef(new Animated.Value(0)).current;
  const C = island.color;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entrance, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.spring(scale,    { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(spark, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(spark, { toValue: 0.3, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={gate.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View style={[gate.sheet, { opacity: entrance, transform: [{ scale }] }]}>
        <LinearGradient colors={['#06060F', '#0C0C22', '#06060F']} style={gate.inner}>
          <Animated.View style={[gate.islandBig, { backgroundColor: C + '20', borderColor: C, shadowColor: C, opacity: spark.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }]}>
            <Text style={{ fontSize: 52 }}>{island.icon}</Text>
          </Animated.View>
          <Animated.View style={[gate.glow, { backgroundColor: C, opacity: spark.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.15] }) }]} />
          <Text style={gate.name}>{island.name}</Text>
          <Text style={[gate.tier, { color: C }]}>{island.tier.toUpperCase()} · {island.end - island.start + 1} LEVELS</Text>
          <Text style={gate.desc}>{island.description}</Text>
          <View style={gate.meta}>
            <Text style={[gate.metaText, { color: C }]}>Levels {island.start}–{island.end}</Text>
            <Text style={gate.boss}>🔥 Boss: {island.bossLevel}</Text>
          </View>
          <TouchableOpacity style={[gate.btn, { backgroundColor: C }]} onPress={onEnter} activeOpacity={0.85}>
            <Text style={gate.btnText}>Enter Island ›</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ color: '#FFFFFF35', fontSize: 13, textAlign: 'center' }}>← Back to map</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// ─── Starknet connector ───────────────────────────────────────────────────────

function StarknetConnector() {
  const flow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(flow, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);
  return (
    <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', marginVertical: 4 }}>
      <View style={{ height: 2, width: SW * 0.5, backgroundColor: '#EC489930' }} />
      <Animated.View style={{
        position: 'absolute', left: SW * 0.25,
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#EC4899',
        transform: [{ translateX: flow.interpolate({ inputRange: [0, 1], outputRange: [0, SW * 0.5] }) }],
      }} />
      <Text style={{ position: 'absolute', bottom: 0, fontSize: 10, color: '#EC489960', fontWeight: '700' }}>
        → Continue to Starknet after Island 18
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────


// ── Next Track CTA — all 3 Starknet tracks shown after Island 18 boss ─────────
function NextTrackBanner({
  islandId,
}: {
  islandId: number;
  onNavigateToTrack?: (trackId: string) => void;
}) {
  const island = getIsland(islandId);
  // Only show the full three-track selector for Island 18 (Starknet World)
  if (islandId === 18 && island?.nextTracks?.length) {
    return <TrackChoiceScreen />;
  }
  if (!island?.nextTracks?.length) return null;
  // Generic fallback for other islands with a single next track
  return (
    <View style={ntb.wrap}>
      <Text style={ntb.title}>🎉 Island Complete!</Text>
      {island.nextTracks.map(trackId => (
        <TouchableOpacity key={trackId} style={ntb.btn}>
          <Text style={ntb.btnText}>Start {trackId} →</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const ntb = StyleSheet.create({
  wrap:    { margin: 16, backgroundColor: '#EC489915', borderRadius: 16, borderWidth: 1.5, borderColor: '#EC489940', padding: 16, alignItems: 'center', gap: 8 },
  title:   { fontSize: 18, fontWeight: '900', color: '#1A1A2E' },
  btn:     { backgroundColor: '#EC4899', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default function IslandMapScreen({ route }: any) {
  const router = useRouter();
  const { user } = useAuth();
  // completed_levels from server is string[], convert to number[] for .includes(number) checks
  const completedLevels: number[] = (user?.completedLevels ?? user?.completed_levels ?? []).map(Number);
  const currentLevel: number = user?.current_level ?? 1;
  const starknetUnlocked = !!(user?.starknet_address || user?.starknet_auth);
  const [selected, setSelected] = useState<Island | null>(null);

  // Auto-open gateway if routed here with a specific initialIsland (e.g. after Starknet auth)
  const initialIsland = route?.params?.initialIsland;
  useEffect(() => {
    if (initialIsland) {
      const target = ISLANDS.find(i => i.id === Number(initialIsland));
      if (target) setSelected(target);
    }
  }, [initialIsland]);

  const handleEnter = (island: Island) => {
    setSelected(null);
    // Use expo-router push with the correct file-based route path
    setTimeout(() => router.push(`/(tabs)/map/lesson?levelId=${island.start}` as any), 200);
  };

  const mainIslands = ISLANDS.filter(i => i.id !== 18);
  const starkIsland = ISLANDS.find(i => i.id === 18);
  const tiers: Array<'beginner'|'intermediate'|'pro'> = ['beginner','intermediate','pro'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#020812' }}>
      <SeaBackground />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ fontSize: 28, color: '#FFF', fontWeight: '300' }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFF' }}>Crypto Onboarding</Text>
          <Text style={{ fontSize: 12, color: '#FFFFFF55', marginTop: 1 }}>{ISLANDS.length} islands · Level {currentLevel}</Text>
        </View>
        <View style={{ backgroundColor: '#5B5FCF25', borderRadius: 20, borderWidth: 1, borderColor: '#5B5FCF50', paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ fontSize: 12, color: '#5B5FCF', fontWeight: '700' }}>{completedLevels.length}/310</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ height: 2, backgroundColor: '#1A1A30', marginHorizontal: 20, marginBottom: 16 }}>
        <View style={[{ height: '100%', borderRadius: 1, backgroundColor: '#5B5FCF', width: `${Math.min(100, completedLevels.length / 310 * 100)}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 80 }}>
        {tiers.map(tier => {
          const tierIslands = mainIslands.filter(i => i.tier === tier);
          return (
            <View key={tier} style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.1, color: '#FFFFFF40', marginLeft: 12, marginBottom: 12 }}>
                {tier === 'beginner' ? '🌱 BEGINNER' : tier === 'intermediate' ? '⚡ INTERMEDIATE' : '🔥 PRO'} ISLANDS
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {tierIslands.map(island => (
                  <IslandObject
                    key={island.id}
                    island={island}
                    unlocked={island.requiredLevel === 0 || completedLevels.includes(island.requiredLevel)}
                    completed={completedLevels.includes(island.bossLevel)}
                    current={currentLevel >= island.start && currentLevel <= island.end}
                    onPress={() => setSelected(island)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {starknetUnlocked && starkIsland && (
          <View style={{ alignItems: 'center' }}>
            <StarknetConnector />
            <IslandObject
              island={starkIsland}
              unlocked
              completed={completedLevels.includes(310)}
              current={currentLevel >= 291 && currentLevel <= 310}
              onPress={() => setSelected(starkIsland)}
            />
          </View>
        )}
      </ScrollView>

      {/* Three-track choice: shown after Island 18 boss (level 310) is completed */}
      {completedLevels.includes(310) && (
        <NextTrackBanner islandId={18} />
      )}

      {selected && <LessonGateway island={selected} onClose={() => setSelected(null)} onEnter={() => handleEnter(selected)} />}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const iso = StyleSheet.create({
  container: { alignItems: 'center', width: (SW - 16) / 4, marginBottom: 12 },
  orbit:     { position: 'absolute', borderWidth: 1.5, alignSelf: 'center' },
  orbitDot:  { fontSize: 13, position: 'absolute', top: -7, left: '42%' },
  glowRing:  { position: 'absolute', borderWidth: 2, alignSelf: 'center' },
  body:      {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, overflow: 'hidden', position: 'relative',
    shadowOpacity: 0.7, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  water:     { position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%' },
  tree:      { position: 'absolute', top: 3 },
  icon:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  check:     { position: 'absolute', top: 3, right: 3, width: 15, height: 15, borderRadius: 7.5, alignItems: 'center', justifyContent: 'center' },
  name:      { fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 5, paddingHorizontal: 2 },
  meta:      { fontSize: 8, textAlign: 'center', marginTop: 1 },
});

const gate = StyleSheet.create({
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000C0' },
  sheet:     { position: 'absolute', top: '12%', left: '8%', right: '8%', borderRadius: 28, overflow: 'hidden' },
  inner:     { padding: 28, alignItems: 'center' },
  islandBig: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowOpacity: 0.9, shadowRadius: 24, shadowOffset: { width: 0, height: 0 }, zIndex: 2 },
  glow:      { position: 'absolute', width: 140, height: 140, borderRadius: 70, top: '12%' },
  name:      { fontSize: 22, fontWeight: '900', color: '#FFF', marginTop: 16, marginBottom: 4, textAlign: 'center' },
  tier:      { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  desc:      { fontSize: 13, lineHeight: 20, color: '#FFFFFF65', textAlign: 'center', marginBottom: 16 },
  meta:      { flexDirection: 'row', gap: 20, marginBottom: 22 },
  metaText:  { fontSize: 13, fontWeight: '700' },
  boss:      { fontSize: 13, fontWeight: '700', color: '#FF6B00' },
  btn:       { borderRadius: 50, paddingVertical: 14, paddingHorizontal: 44 },
  btnText:   { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
