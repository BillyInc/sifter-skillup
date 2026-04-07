/**
 * Sifter Skill_Up — World Screen (NEW)
 *
 * Full-screen immersive world for each skill track.
 * Used for both:
 *  - Coming-soon tracks (shows the world + lock message)
 *  - Live tracks with their own world identity before entering content
 *
 * Navigation:
 *   navigation.navigate('World', {
 *     worldId: 'quant-quarter',
 *     trackId: 'quant-trader',
 *     fieldId: 'quant',
 *     trackName: 'Quant Trader',
 *     live: false,
 *   })
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Dimensions, ScrollView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme, getWorldTheme, Spacing, Radius, FontSize, AnimPreset, type WorldTheme } from '../theme';
import { getFieldDetail, isTrackLive } from '../data/fieldDetails';
import { getField } from '../data/fields';

const { width: W, height: H } = Dimensions.get('window');
const NUM_PARTICLES = 18;

// ─── Floating particle ────────────────────────────────────────────────────────

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
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity: alpha,
        transform: [{ translateX: x }, { translateY: y }, { scale }],
      }}
    />
  );
}

// ─── Animated glow orb ────────────────────────────────────────────────────────

function GlowOrb({ color, size, delay }: { color: string; size: number; delay: number }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const alpha = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.delay(delay).start(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.15, ...AnimPreset.pulse }),
            Animated.timing(scale, { toValue: 0.85, ...AnimPreset.pulse }),
          ]),
          Animated.sequence([
            Animated.timing(alpha, { toValue: 0.55, ...AnimPreset.pulse }),
            Animated.timing(alpha, { toValue: 0.2,  ...AnimPreset.pulse }),
          ]),
        ])
      ).start();
    });
  }, [delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity: alpha,
        transform: [{ scale }],
        position: 'absolute',
      }}
    />
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function WorldScreen() {
  const navigation     = useRouter();
  const params         = useLocalSearchParams<{ worldId?: string; trackId?: string; fieldId?: string; trackName?: string; live?: string }>();
  const { colors }     = useTheme();

  const {
    worldId   = 'default',
    trackId   = '',
    fieldId   = '',
    trackName = 'World',
  } = params;
  const live = params.live === 'true';

  const worldTheme  = getWorldTheme(worldId);
  const field       = fieldId ? getField(fieldId) : null;
  const detail      = fieldId ? getFieldDetail(fieldId) : null;
  const track       = detail
    ? [...(detail.generalTracks), ...(detail.specificTracks)].find(t => t.id === trackId)
    : null;

  // Entrance animations
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
    if (!live) return; // do nothing for coming-soon
    // Navigate based on track type
    if (trackId.startsWith('quant'))         { navigation.navigate('QuantMap', {}); return; }
    if (trackId.startsWith('defi') || trackId.startsWith('onchain')) {
      navigation.push('/map/island'); return;
    }
    navigation.push('/map/island');
  };

  const [bg0, bg1] = worldTheme.bgGradient;

  return (
    <View style={[styles.screen, { backgroundColor: bg0 }]}>
      {/* Gradient background simulation (two-tone) */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: bg1, top: H * 0.4 }]} />

      {/* Particles */}
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} color={worldTheme.particleColor} delay={i * 300} index={i} />
      ))}

      {/* Glow orbs */}
      <View style={styles.orbContainer} pointerEvents="none">
        <GlowOrb color={worldTheme.glowColor} size={320} delay={0} />
      </View>
      <View style={[styles.orbContainer, { right: -80, top: H * 0.4 }]} pointerEvents="none">
        <GlowOrb color={worldTheme.glowColor} size={240} delay={800} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* World header */}
          <Animated.View style={[styles.worldHeader, headerStyle]}>
            <Text style={styles.worldEmoji}>{worldTheme.emoji}</Text>
            <Text style={styles.worldName}>{worldTheme.name}</Text>
            {track && (
              <Text style={styles.trackName}>{track.name}</Text>
            )}
            {track && (
              <Text style={[styles.trackTagline, { color: worldTheme.primaryColor }]}>
                {track.tagline}
              </Text>
            )}
          </Animated.View>

          {/* Content card */}
          <Animated.View style={[
            styles.contentCard,
            { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: worldTheme.primaryColor + '40' },
            contentStyle,
          ]}>
            {track && (
              <>
                <Text style={styles.contentLabel}>About this track</Text>
                <Text style={styles.contentDesc}>{track.description}</Text>
              </>
            )}

            {/* Type badge */}
            {track && (
              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, {
                  backgroundColor: track.type === 'GENERAL' ? '#052e16' : '#1e1b4b',
                }]}>
                  <Text style={[styles.typeBadgeText, {
                    color: track.type === 'GENERAL' ? '#4ade80' : '#818cf8',
                  }]}>
                    {track.type} TRACK
                  </Text>
                </View>
                {field && (
                  <View style={[styles.fieldBadge, { backgroundColor: field.color + '20', borderColor: field.color + '40' }]}>
                    <Text style={{ fontSize: 13 }}>{field.emoji}</Text>
                    <Text style={[styles.fieldBadgeText, { color: field.color }]}>{field.name}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Status block */}
            {live ? (
              <View style={[styles.statusBlock, { backgroundColor: '#052e16', borderColor: '#4ade8040' }]}>
                <Text style={styles.statusEmoji}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusTitle, { color: '#4ade80' }]}>Live — Content Available</Text>
                  <Text style={[styles.statusBody, { color: 'rgba(255,255,255,0.7)' }]}>
                    Content is ready. Tap below to start your journey in this world.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={[styles.statusBlock, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={styles.statusEmoji}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusTitle, { color: 'rgba(255,255,255,0.9)' }]}>Coming Soon</Text>
                  <Text style={[styles.statusBody, { color: 'rgba(255,255,255,0.55)' }]}>
                    This world is under construction. Complete the active tracks to prepare — the skills carry over directly when this launches.
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.ctaWrap, contentStyle]}>
            {live ? (
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: worldTheme.primaryColor }]}
                onPress={handleCTA}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaBtnText}>Enter World →</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.ctaBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={[styles.ctaBtnText, { color: 'rgba(255,255,255,0.5)' }]}>🔒 Coming Soon</Text>
              </View>
            )}
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  orbContainer: { position: 'absolute', left: -80, top: H * 0.1, alignItems: 'center', justifyContent: 'center' },
  backBtn:      { position: 'absolute', top: 52, left: Spacing.lg, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backBtnText:  { color: '#fff', fontSize: FontSize.xl, fontWeight: '700' },
  scrollContent:{ paddingTop: 96, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl, alignItems: 'center' },
  worldHeader:  { alignItems: 'center', marginBottom: Spacing.xxl },
  worldEmoji:   { fontSize: 72, marginBottom: Spacing.md },
  worldName:    { fontSize: FontSize.lg, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: Spacing.sm },
  trackName:    { fontSize: FontSize.xxxl, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: Spacing.sm },
  trackTagline: { fontSize: FontSize.lg, fontWeight: '700', textAlign: 'center' },
  contentCard:  { width: '100%', maxWidth: 480, borderRadius: Radius.xl, padding: Spacing.xl, borderWidth: 1, marginBottom: Spacing.xl, gap: Spacing.lg },
  contentLabel: { fontSize: FontSize.sm, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },
  contentDesc:  { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
  badgeRow:     { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  typeBadge:    { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  typeBadgeText:{ fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.5 },
  fieldBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
  fieldBadgeText:{ fontSize: FontSize.xs, fontWeight: '700' },
  statusBlock:  { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'flex-start' },
  statusEmoji:  { fontSize: 24 },
  statusTitle:  { fontSize: FontSize.md, fontWeight: '900', marginBottom: 4 },
  statusBody:   { fontSize: FontSize.sm, lineHeight: 19 },
  ctaWrap:      { width: '100%', maxWidth: 480 },
  ctaBtn:       { borderRadius: Radius.lg, paddingVertical: Spacing.xl, alignItems: 'center' },
  ctaBtnText:   { fontSize: FontSize.lg, fontWeight: '900', color: '#fff' },
});
