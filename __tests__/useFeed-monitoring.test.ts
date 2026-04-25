import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MonitoredTrack, UserFeedContext } from '../src/types/feed';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../src/lib/api', () => ({
  API: {
    feedGetSubscriptions: jest.fn().mockResolvedValue({ tracks: [] }),
    feedGetItems: jest.fn().mockResolvedValue([]),
    feedGetBookmarks: jest.fn().mockResolvedValue([]),
    feedSubscribe: jest.fn().mockResolvedValue({ tracks: [] }),
    feedAddComment: jest.fn().mockResolvedValue({}),
    feedReact: jest.fn().mockResolvedValue({ success: true }),
    feedToggleBookmark: jest.fn().mockResolvedValue({ bookmarked: true }),
  },
}));

import { useFeed } from '../src/hooks/useFeed';

describe('useFeed.addMonitoredTrack', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('writes the new track list to AsyncStorage exactly once per add', async () => {
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');

    const ctx: UserFeedContext = {
      primaryTrackId: 'quant-trader',
      primaryFieldId: 'quant',
      monitoredTrackIds: [],
    };

    const { result } = renderHook(() => useFeed(ctx));

    await waitFor(() => {
      expect(result.current.monitoredTracks.length).toBeGreaterThan(0);
    });

    setItemSpy.mockClear();

    const newTrack: MonitoredTrack = {
      id: 'onchain-analyst',
      label: 'On-Chain Analyst',
      emoji: '🔍',
      fieldId: 'crypto',
      accentColor: '#F7931A',
      isPrimary: false,
    };

    await act(async () => {
      await result.current.addMonitoredTrack(newTrack);
    });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith(
      '@sifter_monitored_tracks_v1',
      expect.stringContaining('onchain-analyst'),
    );
  });
});
