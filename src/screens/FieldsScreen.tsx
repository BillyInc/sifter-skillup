/**
 * Sifter Skill_Up — Fields Screen
 *
 * Interactive skill field discovery. Each field is a full-height animated panel.
 * Scroll to browse. Tap to enter — the card expands into a portal.
 * "Harry Potter painting" feel — everything is always in motion.
 *
 * Layout:
 *   - Vertical snap-scroll stack of field panels
 *   - Each panel: unique animated artwork + field identity
 *   - Tap → spring expand to full screen → track pathway appears
 *   - Crypto special case: shows island chain pathway
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Easing, Dimensions, SafeAreaView, Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';
import { Radius, FontSize, FontWeight, Spacing } from '../theme';
import { getAllFieldDetails, getFieldDetail, type FieldDetail, type FieldSkillTrack } from '../data/fieldDetails';
import { FieldArtwork, fieldColor, fieldEmoji } from '../components/artwork/FieldArtwork';
import { ISLANDS } from '../data/islands';
import { useAuth } from '../hooks/useAuth';
import { getFieldGradient as resolveFieldGradient } from '../lib/visualThemes';

const { width: SW, height: SH } = Dimensions.get('window');

const CARD_HEIGHT = SH * 0.78;
const PEEK_HEIGHT = SH * 0.11;  // how much of next card peeks

// ─── Field background gradients ────────────────────────────────────────────────

function getFieldGradient(id: string): [string, string, string] {
  return resolveFieldGradient(id);
}

// ─── Island chain (Crypto special case) ──────────────────────────────────────

function IslandChain({ onIslandPress }: { onIslandPress: (island: any) => void }) {
  const scrollRef  = useRef<ScrollView>(null);
  const floats = [
    useAnimatedFloat(5, 2000, 0),
    useAnimatedFloat(5, 2150, 200),
    useAnimatedFloat(5, 2300, 400),
    useAnimatedFloat(5, 2450, 600),
    useAnimatedFloat(5, 2600, 800),
    useAnimatedFloat(5, 2750, 1000),
    useAnimatedFloat(5, 2900, 1200),
    useAnimatedFloat(5, 3050, 1400),
  ];

  return (
    <View style={chain.root}>
      <Text style={[chain.label, { color: '#F9731680' }]}>ONBOARDING ISLANDS</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={chain.scroll}
        decelerationRate="fast"
        snapToInterval={90}
      >
        {ISLANDS.slice(0, 18).map((island, i) => {
          const floatAnim = floats[i % floats.length];
          return (
            <Animated.View key={island.id} style={[chain.islandWrap, { transform: [{ translateY: floatAnim }] }]}>
              <TouchableOpacity
                style={[chain.island, {
                  backgroundColor: island.color + 'CC',
                  borderColor: island.color,
                  shadowColor: island.color,
                }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onIslandPress(island);
                }}
                activeOpacity={0.8}
              >
                <Text style={chain.islandIcon}>{island.icon}</Text>
                <Text style={chain.islandNum}>{island.id}</Text>
              </TouchableOpacity>
              <Text style={[chain.islandName, { color: '#FFF8' }]} numberOfLines={2}>{island.name}</Text>
            </Animated.View>
          );
        })}

        {/* Starknet portal */}
        <View style={chain.portalWrap}>
          <View style={[chain.portal, { borderColor: '#EC4899', shadowColor: '#EC4899' }]}>
            <Text style={chain.portalText}>⚡</Text>
            <Text style={[chain.portalLabel, { color: '#EC4899' }]}>Starknet</Text>
          </View>
          <Text style={[chain.islandName, { color: '#EC489980' }]}>Advanced Track</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Track pathway (non-crypto fields) ────────────────────────────────────────

function TrackPath({
  detail, fieldColor: C, onTrackPress,
}: {
  detail: FieldDetail;
  fieldColor: string;
  onTrackPress: (track: FieldSkillTrack) => void;
}) {
  const { colors } = useTheme();
  const tracks = [...detail.generalTracks, ...detail.specificTracks];

  return (
    <ScrollView style={path.root} showsVerticalScrollIndicator={false}>
      {tracks.map((track, i) => {
        const isLive = track.status === 'live';
        return (
          <TouchableOpacity
            key={track.id}
            style={[
              path.trackRow,
              {
                backgroundColor: isLive ? C + '20' : colors.card,
                borderColor: isLive ? C + '60' : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onTrackPress(track);
            }}
            activeOpacity={0.8}
          >
            {/* Path connector */}
            {i < tracks.length - 1 && (
              <View style={[path.connector, { backgroundColor: C + '40' }]} />
            )}

            <View style={[path.trackDot, { backgroundColor: isLive ? C : colors.bgSecondary, borderColor: isLive ? C : colors.border }]}>
              {isLive
                ? <Text style={path.dotCheck}>⚡</Text>
                : <Text style={[path.dotNum, { color: colors.textMuted }]}>{i + 1}</Text>
              }
            </View>

            <View style={{ flex: 1 }}>
              <View style={path.trackTop}>
                <Text style={[path.trackName, { color: isLive ? '#FFF' : colors.textSoft }]}>{track.name}</Text>
                <View style={[path.typePill, { backgroundColor: track.type === 'GENERAL' ? '#10B98125' : C + '25' }]}>
                  <Text style={[path.typeText, { color: track.type === 'GENERAL' ? '#10B981' : C }]}>
                    {track.type}
                  </Text>
                </View>
              </View>
              <Text style={[path.trackTagline, { color: colors.textMuted }]} numberOfLines={1}>{track.tagline}</Text>
            </View>

            <Text style={[path.trackArrow, { color: isLive ? C : colors.textMuted }]}>
              {isLive ? '›' : '🔒'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Expanded field modal ──────────────────────────────────────────────────────

function FieldPortal({
  field, detail, onClose, fieldColor: C,
}: {
  field: any;
  detail: FieldDetail;
  onClose: () => void;
  fieldColor: string;
}) {
  const navigation = useNavigation<any>();
  const { updateActiveField } = useAuth();
  const entrance   = useRef(new Animated.Value(0)).current;
  const slideY     = useRef(new Animated.Value(40)).current;
  const isCrypto   = field.id === 'crypto';
  const starknetDetail = isCrypto ? getFieldDetail('starknet') : null;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entrance, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(slideY,   { toValue: 0,  tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [entrance, slideY]);

  const close = () => {
    Animated.parallel([
      Animated.timing(entrance, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideY,   { toValue: 40, duration: 200, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handleTrack = (track: FieldSkillTrack) => {
    close();
    setTimeout(async () => {
      try {
        await updateActiveField(field.id, fieldColor(field.id), track.id, track.name);
      } catch {
        // Best effort only - continue navigation even if persistence fails.
      }

      if (track.navigateTo === 'Quant') navigation.push('/skills/quant-map');
      else if (track.navigateTo === 'CryptoMap' || track.navigateTo === 'IslandMap') navigation.push('/(tabs)/map/island');
      else if (track.id === 'starknet-defi-navigator' || track.navigateTo === 'StarknetTrack') navigation.push('/starknet-track', { trackId: track.id, fieldId: field.id, trackName: track.name });
      else if (track.id === 'starknet-ecosystem-deep-dive') navigation.push('/ecosystem-track', { trackId: track.id, fieldId: field.id, trackName: track.name });
      else if (track.id === 'cairo-builder') navigation.push('/cairo-builder-track', { trackId: track.id, fieldId: field.id, trackName: track.name });
      else navigation.push('/world', {
        worldId: track.worldThemeId,
        trackId: track.id,
        fieldId: field.id,
        trackName: track.name,
        live: track.status === 'live',
      });
    }, 220);
  };

  const gradient = getFieldGradient(field.id);

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={close}>
        <View style={portal.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[portal.sheet, {
        transform: [
          { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
          { translateY: slideY },
        ],
        opacity: entrance,
      }]}>
        <LinearGradient colors={gradient} style={portal.gradient}>

          {/* Handle */}
          <TouchableOpacity onPress={close} style={portal.handle} activeOpacity={0.7}>
            <View style={[portal.handleBar, { backgroundColor: C + '60' }]} />
          </TouchableOpacity>

          {/* Header */}
          <View style={portal.header}>
            <View style={{ flex: 1 }}>
              <Text style={portal.fieldEmoji}>{fieldEmoji(field.id)}</Text>
              <Text style={[portal.fieldName, { color: '#FFF' }]}>{field.name}</Text>
              <Text style={[portal.fieldSub, { color: C }]}>{detail.worldName}</Text>
            </View>
            <FieldArtwork fieldId={field.id} size={110} />
          </View>

          {/* Description */}
          <Text style={[portal.fieldDesc, { color: '#FFFFFF99' }]} numberOfLines={2}>
            {detail.worldDescription}
          </Text>

          {/* Track count */}
          <View style={portal.statsRow}>
            <View style={[portal.statPill, { borderColor: C + '50' }]}>
              <Text style={[portal.statText, { color: C }]}>
                {detail.generalTracks.length + detail.specificTracks.length} tracks
              </Text>
            </View>
            <View style={[portal.statPill, { borderColor: C + '50' }]}>
              <Text style={[portal.statText, { color: C }]}>
                {[...detail.generalTracks, ...detail.specificTracks].filter(t => t.status === 'live').length} live
              </Text>
            </View>
            {detail.generalTracks.length > 0 && (
              <View style={[portal.statPill, { borderColor: '#10B98150' }]}>
                <Text style={[portal.statText, { color: '#10B981' }]}>GENERAL + SPECIFIC</Text>
              </View>
            )}
          </View>

          <View style={[portal.divider, { backgroundColor: C + '30' }]} />

          {/* Content */}
          {isCrypto ? (
            <>
              <Text style={[portal.sectionLabel, { color: C }]}>ONBOARDING ISLANDS</Text>
              <IslandChain onIslandPress={() => { close(); setTimeout(() => navigation.push('/(tabs)/map/island'), 220); }} />
              {starknetDetail ? (
                <>
                  <View style={[portal.divider, { backgroundColor: '#EC489930', marginTop: Spacing.md }]} />
                  <Text style={[portal.sectionLabel, { color: '#EC4899' }]}>STARKNET TRACKS</Text>
                  <TrackPath detail={starknetDetail} fieldColor="#EC4899" onTrackPress={handleTrack} />
                </>
              ) : null}
            </>
          ) : (
            <>
              <Text style={[portal.sectionLabel, { color: C }]}>SKILL TRACKS</Text>
              <TrackPath detail={detail} fieldColor={C} onTrackPress={handleTrack} />
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

// ─── Single field card ─────────────────────────────────────────────────────────

function FieldCard({ field, detail, index }: { field: any; detail: FieldDetail | null; index: number }) {
  const C          = fieldColor(field.id);
  const gradient   = getFieldGradient(field.id);
  const [open, setOpen] = useState(false);

  const pressAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  // Entrance stagger
  const entranceY = useRef(new Animated.Value(60)).current;
  const entranceO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(entranceY, { toValue: 0, tension: 50, friction: 9, delay: index * 80, useNativeDriver: true }),
      Animated.timing(entranceO, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [entranceO, entranceY, index]);

  // Live field glow loop
  useEffect(() => {
    if (field.status === 'live') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      ).start();
    }
  }, [field.status, glowAnim]);

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(pressAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(pressAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    setOpen(true);
  };

  const liveCount = detail
    ? [...(detail.generalTracks ?? []), ...(detail.specificTracks ?? [])].filter(t => t.status === 'live').length
    : 0;
  const totalTracks = detail ? (detail.generalTracks?.length ?? 0) + (detail.specificTracks?.length ?? 0) : 0;

  return (
    <>
      <Animated.View style={[
        card.wrap,
        { transform: [{ scale: pressAnim }, { translateY: entranceY }], opacity: entranceO },
      ]}>
        <TouchableWithoutFeedback onPress={onPress}>
          <View style={[card.card, { height: CARD_HEIGHT }]}>
            <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />

            {/* Live glow border */}
            {field.status === 'live' && (
              <Animated.View style={[card.glowBorder, {
                borderColor: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [C + '40', C + 'CC'],
                }),
              }]} />
            )}

            {/* Artwork — top 55% */}
            <View style={card.artworkArea}>
              <FieldArtwork fieldId={field.id} size={Math.min(SW * 0.55, 220)} />
            </View>

            {/* Bottom identity panel */}
            <View style={card.infoPanel}>

              {/* Field name */}
              <View style={card.nameRow}>
                <Text style={[card.fieldEmoji]}>{fieldEmoji(field.id)}</Text>
                <Text style={[card.fieldName, { color: '#FFF' }]} numberOfLines={1}>{field.name}</Text>
                {field.status === 'live' && (
                  <View style={[card.liveBadge, { backgroundColor: C }]}>
                    <Text style={card.liveBadgeText}>⚡ LIVE</Text>
                  </View>
                )}
              </View>

              {/* Tagline */}
              <Text style={[card.tagline, { color: '#FFFFFF80' }]} numberOfLines={2}>
                {(detail?.worldDescription ?? '').slice(0, 80) + (((detail?.worldDescription ?? '').length > 80) ? '…' : '')}
              </Text>

              {/* Track count bar */}
              <View style={card.metaRow}>
                <View style={[card.trackPill, { borderColor: C + '60' }]}>
                  <Text style={[card.trackPillText, { color: C }]}>{totalTracks} tracks</Text>
                </View>
                {liveCount > 0 && (
                  <View style={[card.trackPill, { borderColor: '#10B98160' }]}>
                    <Text style={[card.trackPillText, { color: '#10B981' }]}>{liveCount} live</Text>
                  </View>
                )}

                {/* World name */}
                <Text style={[card.worldLabel, { color: C + '99' }]}>
                  {detail?.worldName ?? ''}
                </Text>

                {/* Tap hint */}
                <View style={[card.tapHint, { backgroundColor: C + '25', borderColor: C + '50' }]}>
                  <Text style={[card.tapHintText, { color: C }]}>Tap to enter ›</Text>
                </View>
              </View>
            </View>

            {/* Bottom peek gradient */}
            <LinearGradient
              colors={['transparent', '#00000060']}
              style={card.peekGradient}
            />
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>

      {open && detail && (
        <FieldPortal
          field={field}
          detail={detail}
          fieldColor={C}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function FieldsScreen() {
  const allDetails = getAllFieldDetails();

  // Build merged field list from ALL_FIELDS + fieldDetails
  const fields = allDetails.map(d => ({
    id: d.fieldId,
    name: d.worldName.replace(/\s(Borough|Quarter|Nexus|Network|Citadel|Hub|Ridge|District|Grid|Tower|Forum|Arena|Vault|Coast|Union|Centre|Park|Alleys|Circle|Point|Labs?)$/, '') || d.worldName,
    status: [...d.generalTracks, ...d.specificTracks].some(t => t.status === 'live') ? 'live' : 'coming_soon',
  }));

  return (
    <SafeAreaView style={[screen.root, { backgroundColor: '#050510' }]}>

      {/* Page header */}
      <View style={screen.header}>
        <Text style={screen.headerTitle}>🌐 Career Fields</Text>
        <Text style={screen.headerSub}>Scroll to explore · Tap to enter</Text>
      </View>

      {/* Snap-scrolling field stack */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT + Spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{ paddingBottom: PEEK_HEIGHT + 20 }}
      >
        {fields.map((field, i) => {
          const detail = getFieldDetail(field.id) ?? null;
          return (
            <View key={field.id} style={[screen.cardWrap, { marginBottom: Spacing.sm }]}>
              <FieldCard field={field} detail={detail} index={i} />
            </View>
          );
        })}
      </ScrollView>

      {/* Scroll indicator */}
      <View style={screen.scrollHint}>
        <Text style={screen.scrollHintText}>↕ Scroll to discover 29 fields</Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Animation helper ─────────────────────────────────────────────────────────

function useAnimatedFloat(range: number, duration: number, delay: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: -range, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: range,  duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [delay, duration, range, v]);
  return v;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const screen = StyleSheet.create({
  root:          { flex: 1 },
  header:        { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle:   { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: '#FFF', letterSpacing: -0.3 },
  headerSub:     { fontSize: FontSize.xs, color: '#FFFFFF60', marginTop: 2 },
  cardWrap:      {},
  scrollHint:    { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: '#FFFFFF15', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  scrollHintText:{ fontSize: 11, color: '#FFFFFF60', fontWeight: '600' },
});

const card = StyleSheet.create({
  wrap:         { marginHorizontal: Spacing.sm },
  card:         { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF10' },
  glowBorder:   { ...StyleSheet.absoluteFillObject, borderRadius: Radius.xl, borderWidth: 2 },
  artworkArea:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  infoPanel:    { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fieldEmoji:   { fontSize: 28 },
  fieldName:    { flex: 1, fontSize: FontSize.xxl, fontWeight: FontWeight.black, letterSpacing: -0.5 },
  liveBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  liveBadgeText:{ fontSize: 10, fontWeight: FontWeight.black, color: '#FFF' },
  tagline:      { fontSize: FontSize.sm, lineHeight: 20 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap' },
  trackPill:    { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  trackPillText:{ fontSize: 11, fontWeight: FontWeight.bold },
  worldLabel:   { flex: 1, fontSize: 11, fontWeight: FontWeight.medium },
  tapHint:      { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tapHintText:  { fontSize: 11, fontWeight: FontWeight.bold },
  peekGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
});

const portal = StyleSheet.create({
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000BB' },
  sheet:        {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SH * 0.88,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  gradient:     { flex: 1, padding: Spacing.lg },
  handle:       { alignItems: 'center', marginBottom: Spacing.md },
  handleBar:    { width: 48, height: 4, borderRadius: 2 },
  header:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  fieldEmoji:   { fontSize: 36, marginBottom: 4 },
  fieldName:    { fontSize: FontSize.xxl, fontWeight: FontWeight.black, letterSpacing: -0.5, marginBottom: 2 },
  fieldSub:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  fieldDesc:    { fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.md },
  statsRow:     { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', marginBottom: Spacing.md },
  statPill:     { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  statText:     { fontSize: 11, fontWeight: FontWeight.bold },
  divider:      { height: 1, marginBottom: Spacing.md },
  sectionLabel: { fontSize: 11, fontWeight: FontWeight.black, letterSpacing: 1.0, marginBottom: Spacing.sm },
});

const chain = StyleSheet.create({
  root:       { flex: 1 },
  label:      { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginBottom: 8 },
  scroll:     { paddingBottom: 8, gap: 0 },
  islandWrap: { width: 80, alignItems: 'center', marginRight: 8 },
  island:     {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
  islandIcon: { fontSize: 22 },
  islandNum:  { position: 'absolute', bottom: 2, right: 4, fontSize: 8, color: '#FFF', fontWeight: '900' },
  islandName: { fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 4, lineHeight: 12 },
  portalWrap: { width: 80, alignItems: 'center', marginRight: 8 },
  portal:     {
    width: 52, height: 52, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, backgroundColor: '#EC489920',
    shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  portalText:  { fontSize: 22 },
  portalLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
});

const path = StyleSheet.create({
  root:        { flex: 1 },
  trackRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    position: 'relative',
  },
  connector:   { position: 'absolute', width: 2, height: 12, bottom: -12, left: 22 },
  trackDot:    { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotCheck:    { fontSize: 14 },
  dotNum:      { fontSize: 12, fontWeight: FontWeight.black },
  trackTop:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
  trackName:   { fontSize: FontSize.sm, fontWeight: FontWeight.bold, flex: 1 },
  typePill:    { borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 2 },
  typeText:    { fontSize: 9, fontWeight: FontWeight.black },
  trackTagline:{ fontSize: FontSize.xs },
  trackArrow:  { fontSize: 18, fontWeight: FontWeight.black },
});
