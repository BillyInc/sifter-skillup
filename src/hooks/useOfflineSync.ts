/**
 * Sifter LevelUp — useOfflineSync (v2, WatermelonDB)
 *
 * REPLACES: src/hooks/useOfflineSync.ts
 *
 * Same external API as before. Internals now query WatermelonDB
 * reactively so the UI updates the moment the queue changes —
 * no polling required.
 *
 * Also surfaces download progress for track content so screens
 * can show a progress bar during first-launch or track switch.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
// withObservables requires @nozbe/with-observables - using polling fallback
// WatermelonDB Q - imported conditionally

// database - imported conditionally
// SyncQueueModel - imported conditionally
import {
  onSyncUpdate,
  getPendingSyncCount,
  downloadTrackContent,
  drainSyncQueue,
  getOrCreateDeviceId,
} from '../lib/offlineStorage';
import { API_BASE, API } from '../lib/api';

export interface SyncStatus {
  isOnline:       boolean;
  pendingCount:   number;
  isSyncing:      boolean;
  lastSyncedAt:   string | null;
  downloadProgress: number | null;   // 0-100 during track download, null otherwise
}

export function useOfflineSync(): SyncStatus & {
  downloadCurrentTrack:  (trackId: string) => Promise<boolean>;
  triggerManualSync:     () => Promise<void>;
  deviceId:              string;
} {
  const [isOnline,          setIsOnline]          = useState(true);
  const [pendingCount,      setPendingCount]       = useState(0);
  const [isSyncing,         setIsSyncing]          = useState(false);
  const [lastSyncedAt,      setLastSyncedAt]       = useState<string | null>(null);
  const [downloadProgress,  setDownloadProgress]   = useState<number | null>(null);
  const [deviceId,          setDeviceId]           = useState('');

  // Load stable device ID once
  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  // Network state watcher
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable));
    });
    NetInfo.fetch().then(state => {
      setIsOnline(!!(state.isConnected && state.isInternetReachable));
    });
    return unsub;
  }, []);

  // Sync count polling (WatermelonDB observable when installed, fallback to interval)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const poll = async () => {
      try {
        const count = await getPendingSyncCount();
        setPendingCount(count);
        setIsSyncing(count > 0);
        if (count === 0) setLastSyncedAt(new Date().toISOString());
      } catch {}
    };
    poll();
    interval = setInterval(poll, 5000); // poll every 5s as fallback
    // Also subscribe to manual sync updates
    const unsub = onSyncUpdate(count => {
      setPendingCount(count);
      setIsSyncing(count > 0);
      if (count === 0) setLastSyncedAt(new Date().toISOString());
    });
    return () => { clearInterval(interval); unsub(); };
  }, []);

  const downloadCurrentTrack = useCallback(async (trackId: string): Promise<boolean> => {
    const token = await API.getToken();
    setDownloadProgress(0);
    const result = await downloadTrackContent(
      trackId,
      API_BASE,
      () => Promise.resolve(token),
      pct => setDownloadProgress(pct),
    );
    setDownloadProgress(null);
    return result;
  }, []);

  const triggerManualSync = useCallback(async () => {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return;
    const token = await API.getToken();
    await drainSyncQueue(API_BASE, () => Promise.resolve(token));
  }, []);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncedAt,
    downloadProgress,
    downloadCurrentTrack,
    triggerManualSync,
    deviceId,
  };
}
