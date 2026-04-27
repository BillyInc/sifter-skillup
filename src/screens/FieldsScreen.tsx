import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
  useTheme,
  webContainer,
} from '../theme';
import {
  getAllFieldDetails,
  getFieldDetail,
  type FieldDetail,
  type FieldSkillTrack,
} from '../data/fieldDetails';
import { FieldArtwork, fieldColor, fieldEmoji } from '../components/artwork/FieldArtwork';
import { ISLANDS } from '../data/islands';
import { useAuth } from '../hooks/useAuth';

type FieldSummary = {
  id: string;
  name: string;
  status: 'live' | 'coming_soon';
};

function StatusPill({
  label,
  color,
  backgroundColor,
}: {
  label: string;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function TrackRow({
  track,
  accentColor,
  onPress,
}: {
  track: FieldSkillTrack;
  accentColor: string;
  onPress: (track: FieldSkillTrack) => void;
}) {
  const { colors } = useTheme();
  const isLive = track.status === 'live';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => {
        if (!isLive) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(track);
      }}
      disabled={!isLive}
      style={[
        styles.trackRow,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: isLive ? `${accentColor}33` : colors.border,
          opacity: isLive ? 1 : 0.62,
        },
      ]}
    >
      <View style={[styles.trackIcon, { backgroundColor: isLive ? `${accentColor}18` : colors.card }]}>
        <Text style={[styles.trackIconText, { color: isLive ? accentColor : colors.textMuted }]}>
          {isLive ? '>' : '#'}
        </Text>
      </View>

      <View style={styles.trackCopy}>
        <View style={styles.trackHeaderRow}>
          <Text style={[styles.trackName, { color: colors.text }]} numberOfLines={1}>
            {track.name}
          </Text>
          <StatusPill
            label={track.type === 'GENERAL' ? 'General' : 'Specific'}
            color={track.type === 'GENERAL' ? colors.green : accentColor}
            backgroundColor={track.type === 'GENERAL' ? `${colors.green}14` : `${accentColor}14`}
          />
          <StatusPill
            label={isLive ? 'Live' : 'Locked'}
            color={isLive ? colors.green : colors.textMuted}
            backgroundColor={isLive ? `${colors.green}14` : colors.card}
          />
        </View>
        <Text style={[styles.trackTagline, { color: colors.textSoft }]} numberOfLines={2}>
          {track.tagline}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function IslandStrip({ onIslandPress }: { onIslandPress: () => void }) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.islandScroll}
    >
      {ISLANDS.filter((island) => island.id === 18).map((island) => (
        <TouchableOpacity
          key={island.id}
          activeOpacity={0.82}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onIslandPress();
          }}
          style={[
            styles.islandCard,
            { backgroundColor: colors.bgSecondary, borderColor: colors.border },
            Shadow.xs,
          ]}
        >
          <View style={[styles.islandIconWrap, { backgroundColor: `${island.color}18` }]}>
            <Text style={styles.islandIcon}>{island.icon}</Text>
          </View>
          <Text style={[styles.islandNumber, { color: island.color }]}>Island {island.id}</Text>
          <Text style={[styles.islandName, { color: colors.text }]} numberOfLines={2}>
            {island.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function FieldCard({
  field,
  detail,
  expanded,
  onToggle,
  onTrackPress,
  onIslandPress,
}: {
  field: FieldSummary;
  detail: FieldDetail;
  expanded: boolean;
  onToggle: () => void;
  onTrackPress: (fieldId: string, track: FieldSkillTrack) => void;
  onIslandPress: () => void;
}) {
  const { colors } = useTheme();
  const accentColor = fieldColor(field.id);
  const isStarknet = field.id === 'starknet';
  const tracks = [...detail.generalTracks, ...detail.specificTracks];
  const liveCount = tracks.filter((track) => track.status === 'live').length;

  return (
    <View
      style={[
        styles.fieldCard,
        {
          backgroundColor: colors.card,
          borderColor: expanded ? `${accentColor}40` : colors.border,
        },
        Shadow.sm,
      ]}
    >
      <TouchableOpacity activeOpacity={0.88} onPress={onToggle} style={styles.fieldCardPress}>
        <View style={styles.fieldCardTop}>
          <View style={[styles.artworkFrame, { backgroundColor: `${accentColor}12` }]}>
            <FieldArtwork fieldId={field.id} size={68} />
          </View>

          <View style={styles.fieldMainCopy}>
            <View style={styles.fieldTitleRow}>
              <Text style={styles.fieldEmoji}>{fieldEmoji(field.id)}</Text>
              <Text style={[styles.fieldName, { color: colors.text }]} numberOfLines={1}>
                {field.name}
              </Text>
            </View>

            <View style={styles.fieldMetaRow}>
              <StatusPill
                label={field.status === 'live' ? 'Live now' : 'Coming soon'}
                color={field.status === 'live' ? colors.green : colors.textMuted}
                backgroundColor={field.status === 'live' ? `${colors.green}14` : colors.bgSecondary}
              />
              <StatusPill
                label={`${tracks.length} tracks`}
                color={accentColor}
                backgroundColor={`${accentColor}14`}
              />
              {liveCount > 0 ? (
                <StatusPill
                  label={`${liveCount} live`}
                  color={colors.orange}
                  backgroundColor={colors.orangeSoft}
                />
              ) : null}
            </View>

            <Text style={[styles.fieldWorldName, { color: accentColor }]} numberOfLines={1}>
              {detail.worldName}
            </Text>
            <Text style={[styles.fieldDescription, { color: colors.textSoft }]} numberOfLines={2}>
              {detail.worldDescription}
            </Text>
          </View>
        </View>

        <View style={styles.fieldFooterRow}>
          <Text style={[styles.browseHint, { color: colors.textMuted }]}>
            {expanded ? 'Hide tracks' : 'Browse tracks'}
          </Text>
          <Text style={[styles.browseArrow, { color: accentColor }]}>{expanded ? '^' : 'v'}</Text>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
          {isStarknet ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Starknet islands</Text>
                <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                  Open the Starknet realm and continue from Island 18.
                </Text>
              </View>
              <IslandStrip onIslandPress={onIslandPress} />

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Starknet tracks</Text>
                <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                  Only Starknet-related tracks are currently open.
                </Text>
              </View>
              <View style={styles.trackList}>
                {tracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    accentColor={colors.starknet}
                    onPress={(selectedTrack) => onTrackPress(field.id, selectedTrack)}
                  />
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Available tracks</Text>
                <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
                  Pick a route to continue into lessons, maps, or world content.
                </Text>
              </View>
              <View style={styles.trackList}>
                {tracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    accentColor={accentColor}
                    onPress={(selectedTrack) => onTrackPress(field.id, selectedTrack)}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function FieldsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateActiveField } = useAuth();
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);

  const fields = useMemo<FieldSummary[]>(() => {
    return getAllFieldDetails()
      .map((detail) => ({
        id: detail.fieldId,
        name: detail.worldName.replace(
          /\s(Borough|Quarter|Nexus|Network|Citadel|Hub|Ridge|District|Grid|Tower|Forum|Arena|Vault|Coast|Union|Centre|Park|Alleys|Circle|Point|Labs?)$/,
          '',
        ) || detail.worldName,
        status: [...detail.generalTracks, ...detail.specificTracks].some((track) => track.status === 'live')
          ? 'live'
          : 'coming_soon',
      }))
      .sort((a, b) => {
        if (a.id === 'starknet') return -1;
        if (b.id === 'starknet') return 1;
        if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

  const handleTrackPress = async (fieldId: string, track: FieldSkillTrack) => {
    if (track.status !== 'live') {
      return;
    }

    try {
      await updateActiveField(fieldId, fieldColor(fieldId), track.id, track.name);
    } catch {
      // Best effort only. Navigation should still continue.
    }

    if (track.navigateTo === 'Quant') {
      router.push('/skills/quant-map' as any);
      return;
    }

    if (track.navigateTo === 'CryptoMap' || track.navigateTo === 'IslandMap') {
      router.push({
        pathname: '/map/island' as any,
        params: { initialIsland: '18' },
      });
      return;
    }

    if (track.id === 'starknet-defi-navigator' || track.navigateTo === 'StarknetTrack') {
      router.push({
        pathname: '/starknet-track' as any,
        params: { trackId: track.id, fieldId, trackName: track.name },
      });
      return;
    }

    if (track.id === 'starknet-ecosystem-deep-dive') {
      router.push({
        pathname: '/ecosystem-track' as any,
        params: { trackId: track.id, fieldId, trackName: track.name },
      });
      return;
    }

    if (track.id === 'cairo-builder') {
      router.push({
        pathname: '/cairo-builder-track' as any,
        params: { trackId: track.id, fieldId, trackName: track.name },
      });
      return;
    }

    router.push({
      pathname: '/world' as any,
      params: {
        worldId: track.worldThemeId,
        trackId: track.id,
        fieldId,
        trackName: track.name,
        live: String(track.status === 'live'),
      },
    });
  };

  const handleIslandPress = () => {
    router.push({
      pathname: '/map/island' as any,
      params: { initialIsland: '18' },
    });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>FIELDS</Text>
          <Text style={[styles.title, { color: colors.text }]}>Browse career paths</Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>
            Compare fields, scan the live routes, and open the track that fits what you want to learn next.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              Shadow.xs,
            ]}
          >
            <Text style={[styles.summaryValue, { color: colors.text }]}>{fields.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Fields</Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              Shadow.xs,
            ]}
          >
            <Text style={[styles.summaryValue, { color: colors.green }]}>
              {fields.filter((field) => field.status === 'live').length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Live now</Text>
          </View>
        </View>

        <View style={styles.cards}>
          {fields.map((field) => {
            const detail = getFieldDetail(field.id);
            if (!detail) {
              return null;
            }

            return (
              <FieldCard
                key={field.id}
                detail={detail}
                expanded={expandedFieldId === field.id}
                field={field}
                onIslandPress={handleIslandPress}
                onToggle={() => setExpandedFieldId((current) => (current === field.id ? null : field.id))}
                onTrackPress={handleTrackPress}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    ...webContainer,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.lg,
    gap: 6,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: 22,
    maxWidth: 620,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  summaryValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cards: {
    gap: Spacing.md,
  },
  fieldCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  fieldCardPress: {
    padding: Spacing.md,
  },
  fieldCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  artworkFrame: {
    width: 84,
    height: 84,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fieldMainCopy: {
    flex: 1,
    gap: 6,
  },
  fieldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fieldEmoji: {
    fontSize: 18,
  },
  fieldName: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.4,
  },
  fieldMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  fieldWorldName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  fieldDescription: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  fieldFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  browseHint: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  browseArrow: {
    fontSize: 18,
    fontWeight: FontWeight.black,
  },
  expandedSection: {
    borderTopWidth: 1,
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  sectionSub: {
    fontSize: FontSize.sm,
    lineHeight: 19,
  },
  islandScroll: {
    paddingRight: Spacing.sm,
    gap: Spacing.sm,
  },
  islandCard: {
    width: 132,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: 6,
  },
  islandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  islandIcon: {
    fontSize: 20,
  },
  islandNumber: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  islandName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: 18,
  },
  trackList: {
    gap: Spacing.sm,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  trackIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIconText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
  },
  trackCopy: {
    flex: 1,
    gap: 4,
  },
  trackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  trackName: {
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  trackTagline: {
    fontSize: FontSize.sm,
    lineHeight: 19,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  pillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
});
