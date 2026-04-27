import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontSize, FontWeight, Radius, Shadow, Spacing, useTheme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { fieldColor } from '../components/artwork/FieldArtwork';

export const POST_ISLAND_TRACKS = [
  {
    id: 'starknet-defi-navigator',
    route: '/starknet-track',
    icon: '⚡',
    name: 'DeFi Navigator',
    subtitle: 'Practitioner Track',
    description: 'Execute swaps, staking, lending, and DCA on Starknet Sepolia with an artifact-first workflow.',
    accentColor: '#EC4899',
    tags: ['Hands-On', 'Transactions', 'Artifacts', '80h'],
  },
  {
    id: 'starknet-ecosystem-deep-dive',
    route: '/ecosystem-track',
    icon: '🔭',
    name: 'Ecosystem Deep Dive',
    subtitle: 'Analyst Track',
    description: 'Research protocols, analyze on-chain data, publish reports, and work through grant-grade ecosystem analysis.',
    accentColor: '#6366F1',
    tags: ['Research', 'SQL', 'Publishing', '120h'],
  },
  {
    id: 'cairo-builder',
    route: '/cairo-builder-track',
    icon: '🏗️',
    name: 'Cairo Builder',
    subtitle: 'Developer Track',
    description: 'Write, test, deploy, and audit Cairo smart contracts on Starknet with a production-style flow.',
    accentColor: '#F97316',
    tags: ['Cairo', 'Smart Contracts', 'snforge', '160h'],
  },
] as const;

function TrackCard({
  track,
  onPress,
}: {
  track: typeof POST_ISLAND_TRACKS[number];
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: `${track.accentColor}35` }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: `${track.accentColor}16`, borderColor: `${track.accentColor}30` }]}>
          <Text style={styles.icon}>{track.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{track.name}</Text>
          <Text style={[styles.subtitle, { color: track.accentColor }]}>{track.subtitle}</Text>
        </View>
        <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
      </View>

      <Text style={[styles.desc, { color: colors.textSoft }]}>{track.description}</Text>

      <View style={styles.tags}>
        {track.tags.map(tag => (
          <View key={tag} style={[styles.tag, { backgroundColor: `${track.accentColor}12` }]}>
            <Text style={[styles.tagText, { color: track.accentColor }]}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.ctaRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.ctaCopy, { color: colors.textMuted }]}>Track-first return experience enabled</Text>
        <View style={[styles.ctaButton, { backgroundColor: track.accentColor }]}>
          <Text style={styles.ctaText}>Start</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function TrackChoiceScreen({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { updateActiveField } = useAuth();
  const { colors } = useTheme();

  const handlePress = async (track: typeof POST_ISLAND_TRACKS[number]) => {
    try {
      await updateActiveField('starknet', fieldColor('starknet'), track.id, track.name);
    } catch {
      // Best effort only.
    }
    router.push(track.route as any);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        compact ? styles.containerCompact : null,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, compact ? styles.headerCompact : null]}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={[styles.title, { color: colors.text }]}>Starknet Islands Complete</Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Pick the exact track you want to continue. Returning users should always land back in this track’s own workspace.
        </Text>
      </View>

      {POST_ISLAND_TRACKS.map(track => (
        <TrackCard key={track.id} track={track} onPress={() => void handlePress(track)} />
      ))}
    </ScrollView>
  );
}

export default TrackChoiceScreen;

const styles = StyleSheet.create({
  container: { padding: Spacing.lg, gap: Spacing.md },
  containerCompact: { paddingHorizontal: 0, paddingBottom: 0 },
  header: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  headerCompact: { paddingTop: 0, paddingBottom: Spacing.md },
  trophy: { fontSize: 40 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.black, textAlign: 'center' },
  sub: { fontSize: FontSize.sm, lineHeight: 19, textAlign: 'center', maxWidth: 620 },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginBottom: 2 },
  subtitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.8 },
  arrow: { fontSize: 24, fontWeight: FontWeight.medium },
  desc: { fontSize: FontSize.sm, lineHeight: 18 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 10, fontWeight: FontWeight.bold },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  ctaCopy: { fontSize: 11, fontWeight: FontWeight.medium, flex: 1 },
  ctaButton: { borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  ctaText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.black },
});
