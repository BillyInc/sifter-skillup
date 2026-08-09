/**
 * Guest sign-in must create a REAL backend session.
 *
 * authGuest() used to fabricate a profile client-side and return without ever
 * calling the API, so no JWT was issued and every subsequent request went out
 * unauthenticated. Guest is the web app's main entry point, so that silently
 * disabled everything behind auth. These tests pin both halves of the
 * behaviour: the network call on the happy path, and the offline fallback.
 *
 * AuthProvider is not rendered here — it pulls in the Starknet/Privy bridge and
 * the whole offline sync stack. The module is loaded with those dependencies
 * mocked and the hook driven through a bare consumer.
 */
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

const mockAuthGuest = jest.fn();
const mockSaveToken = jest.fn();
const mockGetMe = jest.fn();

jest.mock('../src/lib/api', () => ({
  API_BASE: 'http://test',
  API: {
    authGuest: (...a: unknown[]) => mockAuthGuest(...a),
    saveToken: (...a: unknown[]) => mockSaveToken(...a),
    getMe: (...a: unknown[]) => mockGetMe(...a),
    getToken: jest.fn().mockResolvedValue('tok'),
    checkStreak: jest.fn().mockResolvedValue(undefined),
    updateMe: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/lib/offlineStorage', () => ({
  getOrCreateDeviceId: jest.fn().mockResolvedValue('web_test_device'),
  onLoginSync: jest.fn().mockResolvedValue(undefined),
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

let signInGuest: () => Promise<void>;
let currentUser: { id: string; auth_provider: string } | null;

function Probe() {
  const auth = useAuth();
  signInGuest = auth.signInGuest;
  currentUser = auth.user;
  return <Text>{auth.user ? auth.user.id : 'anon'}</Text>;
}

const renderAuth = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe('authGuest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentUser = null;
    mockGetMe.mockRejectedValue(new Error('Unauthorized')); // no saved session
  });

  it('creates a server-side session and persists the token', async () => {
    mockAuthGuest.mockResolvedValue({
      token: 'jwt-from-server',
      user: { id: 'srv-guest-1', username: 'Guest_ab12', auth_provider: 'guest' },
    });

    renderAuth();
    await waitFor(() => expect(mockGetMe).toHaveBeenCalled());
    await act(async () => {
      await signInGuest();
    });

    expect(mockAuthGuest).toHaveBeenCalledTimes(1);
    expect(mockSaveToken).toHaveBeenCalledWith('jwt-from-server');
    expect(currentUser?.id).toBe('srv-guest-1');
  });

  it('falls back to a local profile when the server is unreachable', async () => {
    mockAuthGuest.mockRejectedValue(new Error('Network request failed'));

    renderAuth();
    await waitFor(() => expect(mockGetMe).toHaveBeenCalled());
    await act(async () => {
      await signInGuest();
    });

    expect(mockSaveToken).not.toHaveBeenCalled();
    expect(currentUser?.auth_provider).toBe('guest');
    expect(currentUser?.id).toMatch(/^guest_/);
  });
});
