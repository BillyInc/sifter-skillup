/**
 * Sifter Skill_Up — useOfflineSync hook
 *
 * Surfaces offline/sync state to the UI.
 * Shows a discreet sync indicator (not a blocking screen).
 * Used in the header across all main screens.
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  getPendingSyncCount,
  onSyncUpdate,
  downloadTrackContent,
  getLocalProgress,
} from '../lib/offlineStorage';
import { API_BASE, API } from '../lib/api';

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

export function useOfflineSync() {
  const [isOnline,     setIsOnline]     = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing,    setIsSyncing]    = useState(false);

  useEffect(() => {
    // Network status
    const unsub = NetInfo.addEventListener(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable));
    });

    // Sync queue updates
    const unsubSync = onSyncUpdate(count => {
      setPendingCount(count);
      setIsSyncing(count > 0);
    });

    // Initial pending count
    getPendingSyncCount().then(setPendingCount);

    return () => { unsub(); unsubSync(); };
  }, []);

  const downloadCurrentTrack = useCallback(async (trackId: string) => {
    const token = await API.getToken();
    return downloadTrackContent(trackId, API_BASE, () => Promise.resolve(token));
  }, []);

  return { isOnline, pendingCount, isSyncing, downloadCurrentTrack };
}
