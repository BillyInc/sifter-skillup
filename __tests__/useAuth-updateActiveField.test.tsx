/**
 * updateActiveField must keep both key shapes of the profile in sync.
 *
 * _normalise emits snake_case AND a camelCase mirror for these fields
 * (current_track_id / currentTrackId, active_field_id / activeFieldId), and
 * consumers read the mirror — StarknetTrackScreen:247, EcosystemTrackScreen:158
 * and CairoBuilderTrackScreen:160 all guard on `user.currentTrackId` before
 * calling updateActiveField.
 *
 * The optimistic setUser merge used to write only the snake_case keys, so the
 * mirror stayed stale and that guard never became true. Combined with
 * updateActiveField being a fresh function identity on every render while
 * sitting in those effects' dependency arrays, setUser re-rendered and re-fired
 * the effect — two requests per iteration (PUT /api/users/me and
 * POST /api/users/active-field) for as long as the screen stayed mounted.
 *
 * AuthProvider is not rendered against the real dependency tree here; it pulls
 * in the Starknet/Privy bridge and the offline sync stack, so those are mocked
 * and the hook is driven through a bare consumer — the same approach as
 * useAuth-guest.test.tsx.
 */
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

const mockGetMe = jest.fn();
const mockUpdateMe = jest.fn();
const mockPost = jest.fn();

jest.mock('../src/lib/api', () => ({
  API_BASE: 'http://test',
  API: {
    authGuest: jest.fn(),
    saveToken: jest.fn(),
    getMe: (...a: unknown[]) => mockGetMe(...a),
    getToken: jest.fn().mockResolvedValue('tok'),
    checkStreak: jest.fn().mockResolvedValue(undefined),
    updateMe: (...a: unknown[]) => mockUpdateMe(...a),
    post: (...a: unknown[]) => mockPost(...a),
  },
}));

jest.mock('../src/lib/offlineStorage', () => ({
  getOrCreateDeviceId: jest.fn().mockResolvedValue('web_test_device'),
  onLoginSync: jest.fn().mockResolvedValue(undefined),
  switchLocalUser: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/postAuthRedirect', () => ({
  setPendingPostAuthRedirect: jest.fn(),
}));

jest.mock('../src/lib/resumeNavigation', () => ({
  resolvePostAuthHref: jest.fn().mockReturnValue('/'),
}));

jest.mock('../src/lib/logoutState', () => ({
  clearExplicitLogout: jest.fn().mockResolvedValue(undefined),
  markExplicitLogout: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/localUserState', () => ({
  clearLocalUserState: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/sessionProfile', () => ({
  clearSessionProfile: jest.fn().mockResolvedValue(undefined),
  getSavedSessionProfile: jest.fn().mockResolvedValue(null),
  saveSessionProfile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/components/auth/StarknetWalletBridge', () => ({
  StarknetWalletBridgeProvider: ({ children }: { children: React.ReactNode }) => children,
  useStarknetWalletBridge: () => ({
    wallet: null,
    address: null,
    status: 'unavailable',
    connectionMode: null,
    ready: false,
  }),
}));

jest.mock('../src/components/auth/PrivyStarknetBootstrap', () => ({
  PrivyStarknetBootstrap: () => null,
}));

jest.mock('../src/lib/config', () => ({ PRIVY_ENABLED: false }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthProvider, useAuth } = require('../src/hooks/useAuth');

let updateActiveField: (
  fieldId: string,
  color: string,
  trackId?: string,
  trackName?: string,
) => Promise<void>;
let currentUser: any;

function Probe() {
  const auth = useAuth();
  updateActiveField = auth.updateActiveField;
  currentUser = auth.user;
  return <Text>{auth.user ? auth.user.id : 'anon'}</Text>;
}

const renderAuth = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe('updateActiveField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentUser = null;
    mockUpdateMe.mockResolvedValue(undefined);
    mockPost.mockResolvedValue(undefined);
    // A signed-in profile on a different track than the one we switch to.
    mockGetMe.mockResolvedValue({
      id: 'user-1',
      username: 'Tester',
      auth_provider: 'guest',
      current_track_id: 'crypto',
      current_track_name: 'Crypto',
      active_field_id: 'crypto-basics',
    });
  });

  it('updates the camelCase mirrors, not only the snake_case keys', async () => {
    renderAuth();
    await waitFor(() => expect(currentUser?.id).toBe('user-1'));
    expect(currentUser.currentTrackId).toBe('crypto');

    await act(async () => {
      await updateActiveField('starknet', '#ff8a00', 'starknet-defi-navigator', 'DeFi Navigator');
    });

    // The load-bearing assertions: the mirrors the track screens actually read.
    // Before the fix these stayed 'crypto' / 'crypto-basics' and the guard in
    // those screens never satisfied.
    expect(currentUser.currentTrackId).toBe('starknet-defi-navigator');
    expect(currentUser.currentTrackName).toBe('DeFi Navigator');
    expect(currentUser.activeFieldId).toBe('starknet');
    expect(currentUser.activeFieldColor).toBe('#ff8a00');

    // And the snake_case keys the API contract uses are still written.
    expect(currentUser.current_track_id).toBe('starknet-defi-navigator');
    expect(currentUser.active_field_id).toBe('starknet');
  });

  it('sends exactly one pair of requests per call', async () => {
    renderAuth();
    await waitFor(() => expect(currentUser?.id).toBe('user-1'));

    await act(async () => {
      await updateActiveField('starknet', '#ff8a00', 'starknet-defi-navigator', 'DeFi Navigator');
    });

    expect(mockUpdateMe).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/api/users/active-field',
      expect.objectContaining({ active_field_id: 'starknet' }),
    );
  });

  it('leaves the track fields alone when no track is supplied', async () => {
    renderAuth();
    await waitFor(() => expect(currentUser?.id).toBe('user-1'));

    await act(async () => {
      await updateActiveField('defi', '#00ff00');
    });

    expect(currentUser.activeFieldId).toBe('defi');
    // No trackId/trackName argument means those fields must not be clobbered —
    // the spread guards in the mirrors object are what keep this true.
    expect(currentUser.currentTrackId).toBe('crypto');
    expect(currentUser.currentTrackName).toBe('Crypto');
  });
});
