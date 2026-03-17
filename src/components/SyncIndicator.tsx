/**
 * Discreet sync status indicator.
 * Shows as a small dot in the header — green (online), amber (syncing), grey (offline).
 * Never a modal, never a block. Users can always keep learning regardless.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../theme';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function SyncIndicator() {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync();

  const color  = isSyncing ? Colors.gold : isOnline ? Colors.green : Colors.textMuted;
  const label  = isSyncing
    ? `↑ ${pendingCount}`
    : isOnline ? '●' : '○';
  const title  = isSyncing
    ? `Syncing ${pendingCount} item${pendingCount !== 1 ? 's' : ''}…`
    : isOnline ? 'Online' : 'Offline — data saved locally';

  return (
    <View style={styles.container} accessible accessibilityLabel={title}>
      <Text style={[styles.dot, { color }]}>{label}</Text>
      {!isOnline && <Text style={styles.offlineLabel}>Offline</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { fontSize: 12, fontWeight: '800' },
  offlineLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
});
