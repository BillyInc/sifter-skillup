/**
 * Sifter LevelUp - Download Track Screen
 * Shown when a user taps a track but content isn't downloaded yet.
 * Explains offline benefits, shows download size, starts download.
 * After download completes, navigates to the track map.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Spacing, Radius, FontSize, Shadow, FontWeight, useTheme,
} from '../theme';
import { downloadTrackContent, isTrackDownloaded } from '../lib/offlineStorage';
import { API_BASE, API } from '../lib/api';
import NetInfo from '@react-native-community/netinfo';
import { SifterButton, SifterCard } from '../components/ui';

interface Props {
  trackId: string;
  trackName: string;
  trackEmoji: string;
  estimatedSizeMb: number;
  onComplete: () => void;
  onSkip: () => void;
}

type Phase = 'prompt' | 'downloading' | 'done' | 'offline' | 'already-downloaded';

export default function DownloadTrackScreen({
  trackId, trackName, trackEmoji, estimatedSizeMb, onComplete, onSkip,
}: Props) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    isTrackDownloaded(trackId).then(downloaded => {
      if (downloaded) {
        setPhase('already-downloaded');
      }
    });
  }, [trackId]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const startDownload = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      setPhase('offline');
      return;
    }

    setPhase('downloading');
    setProgress(5);

    const success = await downloadTrackContent(
      trackId,
      API_BASE,
      () => API.getToken(),
      pct => setProgress(pct),
    );

    if (success) {
      setPhase('done');
      setTimeout(onComplete, 1200);
    } else {
      setPhase('offline');
    }
  };

  if (phase === 'already-downloaded') {
    onComplete();
    return null;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.shell}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>TRACK ACCESS</Text>
        <SifterCard style={[styles.card, { backgroundColor: colors.cardElevated, borderColor: colors.border }]}>
          <View style={styles.heroRow}>
            <View style={[styles.heroIcon, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={styles.emoji}>{trackEmoji}</Text>
            </View>
            <View style={styles.heroText}>
              <Text style={[styles.trackName, { color: colors.text }]}>{trackName}</Text>
              <Text style={[styles.trackSub, { color: colors.textSoft }]}>
                Save this track to your device for faster startup and offline access.
              </Text>
            </View>
          </View>

          {phase === 'prompt' && (
            <>
              <View style={[styles.banner, { backgroundColor: colors.greenSoft, borderColor: `${colors.green}30` }]}>
                <Text style={[styles.bannerText, { color: colors.green }]}>Offline-ready after one download</Text>
              </View>

              <Text style={[styles.body, { color: colors.textSoft }]}>
                Download now to learn without a connection. Progress will sync automatically the next time you are online.
              </Text>

              <View style={styles.statsRow}>
                {[
                  { label: 'Size', value: `~${estimatedSizeMb} MB` },
                  { label: 'Access', value: 'No expiry' },
                  { label: 'Updates', value: 'Background' },
                ].map((item) => (
                  <View
                    key={item.label}
                    style={[styles.statItem, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                  >
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <SifterButton
                label="Download track"
                onPress={startDownload}
                color={colors.accent}
                variant="track"
                style={styles.primaryButton}
              />
              <TouchableOpacity style={styles.secondaryAction} onPress={onSkip}>
                <Text style={[styles.secondaryActionText, { color: colors.textMuted }]}>Continue online for now</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'downloading' && (
            <>
              <Text style={[styles.phaseTitle, { color: colors.text }]}>Downloading track files</Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.accent,
                      width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressPct, { color: colors.accent }]}>{Math.round(progress)}%</Text>
              <Text style={[styles.downloadNote, { color: colors.textMuted }]}>
                You can keep using the app while this finishes in the background.
              </Text>
            </>
          )}

          {phase === 'done' && (
            <>
              <Text style={styles.stateEmoji}>OK</Text>
              <Text style={[styles.doneTitle, { color: colors.green }]}>Track downloaded</Text>
              <Text style={[styles.doneBody, { color: colors.textSoft }]}>
                {trackName} is now saved on this device and ready for offline study.
              </Text>
            </>
          )}

          {phase === 'offline' && (
            <>
              <Text style={styles.stateEmoji}>OFF</Text>
              <Text style={[styles.phaseTitle, { color: colors.text }]}>No internet connection</Text>
              <Text style={[styles.doneBody, { color: colors.textSoft }]}>
                You can still continue into the track now. We will offer the download again when you are back online.
              </Text>
              <SifterButton
                label="Continue without download"
                onPress={onSkip}
                color={colors.accent}
                variant="track"
                style={styles.primaryButton}
              />
            </>
          )}
        </SifterCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    ...Shadow.md,
  },
  heroRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emoji: { fontSize: 18 },
  heroText: { flex: 1, gap: 4 },
  trackName: { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  trackSub: { fontSize: FontSize.sm, lineHeight: 20 },
  banner: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  bannerText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  body: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.lg },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 6,
  },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: 'uppercase' },
  statValue: { fontSize: FontSize.sm, fontWeight: FontWeight.heavy },
  primaryButton: { marginTop: Spacing.xs },
  secondaryAction: { paddingTop: Spacing.md, alignItems: 'center' },
  secondaryActionText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  phaseTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: Radius.full },
  progressPct: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  downloadNote: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  stateEmoji: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  doneTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  doneBody: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
