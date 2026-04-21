/**
 * Sifter Skill_Up — SyncIndicator (v2)
 *
 * REPLACES: src/components/SyncIndicator.tsx
 *
 * Now shows download progress bar during track content download.
 * Still a discreet, non-blocking indicator — never a modal.
 * Positioned in screen headers.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '../theme';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function SyncIndicator() {
  const { isOnline, pendingCount, isSyncing, downloadProgress } = useOfflineSync();

  const showDownload = downloadProgress !== null;
  const color = showDownload
    ? Colors.accent
    : isSyncing
    ? Colors.gold
    : isOnline
    ? Colors.green
    : Colors.textMuted;

  const label = showDownload
    ? `⬇ ${downloadProgress}%`
    : isSyncing
    ? `↑ ${pendingCount}`
    : isOnline
    ? '●'
    : '○';

  const title = showDownload
    ? `Downloading content… ${downloadProgress}%`
    : isSyncing
    ? `Syncing ${pendingCount} item${pendingCount !== 1 ? 's' : ''}…`
    : isOnline
    ? 'Online'
    : 'Offline — progress saved locally';

  return (
    <View style={styles.container} accessible accessibilityLabel={title}>
      <Text style={[styles.dot, { color }]}>{label}</Text>
      {!isOnline && <Text style={styles.offlineLabel}>Offline</Text>}
      {showDownload && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${downloadProgress}%` as any }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
  },
  dot: {
    fontSize:   12,
    fontWeight: '800',
  },
  offlineLabel: {
    fontSize:   10,
    color:      Colors.textMuted,
    fontWeight: '600',
  },
  progressTrack: {
    width:           48,
    height:          3,
    borderRadius:    2,
    backgroundColor: Colors.border,
    overflow:        'hidden',
  },
  progressFill: {
    height:          3,
    borderRadius:    2,
    backgroundColor: Colors.accent,
  },
});
