/**
 * Sifter Skill_Up — Download Track Screen
 * Shown when a user taps a track but content isn't downloaded yet.
 * Explains offline benefits, shows download size, starts download.
 * After download completes, navigates to the track map.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { downloadTrackContent, isTrackDownloaded } from '../lib/offlineStorage';
import { API_BASE, API } from '../lib/api';
import NetInfo from '@react-native-community/netinfo';

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
  const [phase,    setPhase]    = useState<Phase>('prompt');
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if already downloaded
    isTrackDownloaded(trackId).then(downloaded => {
      if (downloaded) { setPhase('already-downloaded'); }
    });
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startDownload = async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) { setPhase('offline'); return; }

    setPhase('downloading');
    setProgress(5);

    const success = await downloadTrackContent(
      trackId, API_BASE,
      () => API.getToken(),
      pct => setProgress(pct),
    );

    if (success) { setPhase('done'); setTimeout(onComplete, 1200); }
    else { setPhase('offline'); }
  };

  if (phase === 'already-downloaded') {
    onComplete();
    return null;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.emoji}>{trackEmoji}</Text>
        <Text style={styles.trackName}>{trackName}</Text>

        {phase === 'prompt' && (
          <>
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineBadgeText}>📲 Works 100% offline after download</Text>
            </View>
            <Text style={styles.body}>
              Download this track to your device and learn anywhere — no internet needed.
              Your progress syncs back automatically when you're online.
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>~{estimatedSizeMb}MB</Text>
                <Text style={styles.statLabel}>Download size</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>Forever</Text>
                <Text style={styles.statLabel}>No expiry</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>Auto</Text>
                <Text style={styles.statLabel}>Updates silently</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadBtn} onPress={startDownload}>
              <Text style={styles.downloadBtnText}>📥 Download for offline use</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
              <Text style={styles.skipBtnText}>Continue online (no download)</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'downloading' && (
          <>
            <Text style={styles.downloadingLabel}>Downloading…</Text>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, {
                width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
            <Text style={styles.downloadNote}>You can keep using the app — this happens in the background.</Text>
          </>
        )}

        {phase === 'done' && (
          <>
            <Text style={styles.doneEmoji}>✅</Text>
            <Text style={styles.doneTitle}>Downloaded!</Text>
            <Text style={styles.doneBody}>{trackName} is now on your device. Learn anywhere, even without internet.</Text>
          </>
        )}

        {phase === 'offline' && (
          <>
            <Text style={styles.offlineEmoji}>📶</Text>
            <Text style={styles.offlineTitle}>No internet connection</Text>
            <Text style={styles.offlineBody}>
              You can still continue learning — just without downloading for offline use right now.
              We'll prompt you to download again when you're back online.
            </Text>
            <TouchableOpacity style={styles.downloadBtn} onPress={onSkip}>
              <Text style={styles.downloadBtnText}>Continue anyway</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: Spacing.xxl, width: '88%', alignItems: 'center', ...Shadow.md },
  emoji: { fontSize: 52, marginBottom: Spacing.sm },
  trackName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: Spacing.md },
  offlineBadge: { backgroundColor: Colors.greenSoft, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginBottom: Spacing.md },
  offlineBadgeText: { fontSize: FontSize.xs, color: Colors.green, fontWeight: '800' },
  body: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.lg },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  downloadBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.md, width: '100%', alignItems: 'center', marginBottom: Spacing.sm },
  downloadBtnText: { color: '#fff', fontWeight: '900', fontSize: FontSize.sm },
  skipBtn: { padding: Spacing.md },
  skipBtnText: { fontSize: FontSize.sm, color: Colors.textMuted },
  downloadingLabel: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  progressTrack: { width: '100%', height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: 10, backgroundColor: Colors.accent, borderRadius: 5 },
  progressPct: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.accent, marginBottom: Spacing.sm },
  downloadNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  doneEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  doneTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.green, marginBottom: Spacing.sm },
  doneBody: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
  offlineEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  offlineTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  offlineBody: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
});
