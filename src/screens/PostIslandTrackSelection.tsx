/**
 * POST-ISLANDS TRACK SELECTION
 * After Island 18 boss (level 310) — three tracks unlock simultaneously.
 * DeFi Navigator (pink) | Ecosystem Deep Dive (indigo) | Cairo Builder (orange)
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';

export const POST_ISLAND_TRACKS = [
  {
    id: 'starknet-defi-navigator',
    route: '/starknet-track',
    icon: '⚡',
    name: 'DeFi Navigator',
    subtitle: 'Practitioner Track',
    description: 'Execute real swaps, staking, lending, and DCA on Starknet Sepolia. Build a verifiable on-chain portfolio with Starkzap.',
    accentColor: '#EC4899',
    tags: ['Hands-On', 'Transactions', 'Portfolio', '80h'],
  },
  {
    id: 'starknet-ecosystem-deep-dive',
    route: '/ecosystem-track',
    icon: '🔭',
    name: 'Ecosystem Deep Dive',
    subtitle: 'Analyst Track',
    description: 'Research protocols, analyse on-chain data with SQL, publish findings, and write Starknet Foundation grant proposals.',
    accentColor: '#6366F1',
    tags: ['Research', 'SQL', 'Publishing', 'Grants', '120h'],
  },
  {
    id: 'cairo-builder',
    route: '/cairo-builder-track',
    icon: '🏗️',
    name: 'Cairo Builder',
    subtitle: 'Developer Track',
    description: 'Write, test, and deploy Cairo smart contracts to Starknet Sepolia. Audit security vulnerabilities and build full DeFi protocols.',
    accentColor: '#F97316',
    tags: ['Cairo', 'Smart Contracts', 'snforge', 'Deploy', '160h'],
  },
] as const;

function TrackCard({
  track, onPress,
}: {
  track: typeof POST_ISLAND_TRACKS[number];
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[tc.card, { backgroundColor: colors.bgSecondary ?? colors.card, borderColor: `${track.accentColor}40` }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={tc.iconRow}>
        <Text style={tc.icon}>{track.icon}</Text>
        <View style={[tc.subtitleBadge, { backgroundColor: `${track.accentColor}20` }]}>
          <Text style={[tc.subtitleTxt, { color: track.accentColor }]}>{track.subtitle.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[tc.name, { color: colors.text }]}>{track.name}</Text>
      <Text style={[tc.desc, { color: colors.textSoft }]}>{track.description}</Text>
      <View style={tc.tags}>
        {track.tags.map(tag => (
          <View key={tag} style={[tc.tag, { backgroundColor: `${track.accentColor}15` }]}>
            <Text style={[tc.tagTxt, { color: track.accentColor }]}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={[tc.cta, { backgroundColor: track.accentColor }]}>
        <Text style={tc.ctaTxt}>Start {track.name} →</Text>
      </View>
    </TouchableOpacity>
  );
}

const tc = StyleSheet.create({
  card:        { borderRadius: Radius.xl, borderWidth: 1.5, padding: Spacing.lg, gap: Spacing.md, ...Shadow.md },
  iconRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon:        { fontSize: 32 },
  subtitleBadge: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  subtitleTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  name:        { fontSize: FontSize.xl, fontWeight: '900' },
  desc:        { fontSize: FontSize.sm, lineHeight: 20 },
  tags:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag:         { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  tagTxt:      { fontSize: 9, fontWeight: '700' },
  cta:         { borderRadius: Radius.full, padding: Spacing.md, alignItems: 'center' },
  ctaTxt:      { color: '#fff', fontSize: FontSize.sm, fontWeight: '900' },
});

export function TrackChoiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg }}>
      <View style={{ alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl }}>
        <Text style={{ fontSize: 52 }}>🏆</Text>
        <Text style={[hdr.title, { color: colors.text }]}>Starknet Islands Complete!</Text>
        <Text style={[hdr.sub, { color: colors.textSoft }]}>
          All three advanced tracks are now unlocked.{'\n'}
          Choose your path — or complete all three.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={{ color: colors.textMuted, fontSize: FontSize.sm, fontWeight: '700' }}>
          CHOOSE YOUR PATH
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>

      {POST_ISLAND_TRACKS.map(track => (
        <TrackCard
          key={track.id}
          track={track}
          onPress={() => router.push(track.route as any)}
        />
      ))}

      <Text style={{ color: colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 }}>
        All three tracks unlock simultaneously.{'\n'}
        They cover different skills and complement each other.
      </Text>
    </ScrollView>
  );
}

const hdr = StyleSheet.create({
  title: { fontSize: FontSize.xxl, fontWeight: '900', textAlign: 'center' },
  sub:   { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
});

export default TrackChoiceScreen;
