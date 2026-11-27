/**
 * Native provider: a restore/refresh waiting on getMe() must write nothing
 * when another tab signed out meanwhile (stored token changed and the
 * explicit-logout marker is set). Stateful: real session-profile, device-owner
 * and logout-marker modules over the AsyncStorage mock.
 */
import React from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, waitFor, act, cleanup } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { DEVICE_OWNER_KEY } from '../src/lib/deviceOwner';
import { getSavedSessionProfile } from '../src/lib/sessionProfile';
import { beginSignOut } from '../src/lib/sessionLifecycle';
import { hasExplicitLogout } from '../src/lib/logoutState';

let mockTokenValue: string | null = null;
let mockGetMe: jest.Mock;

jest.mock('../src/lib/api', () => ({
  API_BASE: 'http://test',
  API: {
    saveToken: jest.fn(async (t: string) => { mockTokenValue = t; }),
    clearToken: jest.fn(async () => { mockTokenValue = null; }),
    getToken: jest.fn(async () => mockTokenValue),
    hasStoredToken: jest.fn(() => mockTokenValue !== null),
    getMe: (...a: unknown[]) => mockGetMe(...a),
    checkStreak: jest.fn().mockResolvedValue(undefined),
    updateMe: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../src/lib/offlineStorage', () => ({
  getOrCreateDeviceId: jest.fn().mockResolvedValue('device'),
  onLoginSync: jest.fn().mockResolvedValue(undefined),
  switchLocalUser: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../src/lib/careerCache', () => ({ setCareerCacheIdentity: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../src/lib/legal', () => ({
  getLegalAcceptance: jest.fn().mockResolvedValue({ termsVersion: 't', privacyVersion: 'p', analyticsConsent: false }),
  LEGAL_ACCEPTANCE_KEY: 'legal-key',
}));
jest.mock('../src/lib/offlineQueue', () => ({
  OfflineQueue: { init: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../src/lib/postAuthRedirect', () => ({ setPendingPostAuthRedirect: jest.fn() }));
jest.mock('../src/lib/resumeNavigation', () => ({ resolvePostAuthHref: jest.fn().mockReturnValue('/') }));
jest.mock('../src/components/auth/StarknetWalletBridge', () => ({
  StarknetWalletBridgeProvider: ({ children }: { children: React.ReactNode }) => children,
  useStarknetWalletBridge: () => ({ wallet: null, address: null, status: 'unavailable', connectionMode: null, ready: false }),
}));
jest.mock('../src/components/auth/PrivyStarknetBootstrap', () => ({ PrivyStarknetBootstrap: () => null }));
jest.mock('../src/lib/config', () => ({ PRIVY_ENABLED: false }));

let auth: any;
function Probe() {
  auth = useAuth();
  return <Text>{auth?.user ? auth.user.id : 'anon'}</Text>;
}
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  mockTokenValue = null;
  mockGetMe = jest.fn();
  auth = null;
  await AsyncStorage.clear();
});
afterEach(() => cleanup());

async function otherTabSignsOut() {
  await beginSignOut();
  mockTokenValue = null;
  await AsyncStorage.removeItem('@levelup_session_profile_v1');
  await AsyncStorage.removeItem(DEVICE_OWNER_KEY);
}

it('restore: a sign-out in another tab during getMe() writes nothing and shows no user', async () => {
  mockTokenValue = 'tok-bob';
  let release!: (u: unknown) => void;
  mockGetMe.mockImplementation(() => new Promise((r) => { release = r; }));
  render(<AuthProvider><Probe /></AuthProvider>);
  await act(async () => { await flush(); });

  await act(async () => { await otherTabSignsOut(); });
  await act(async () => { release({ id: 'bob', email: 'b@x.y' }); await flush(); await flush(); });
  await waitFor(() => expect(auth.loading).toBe(false));

  expect(auth.user).toBeNull();
  expect(await getSavedSessionProfile()).toBeNull();
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
  expect(await hasExplicitLogout()).toBe(true);
});

it('restore: still signs the user in when nothing changed during getMe()', async () => {
  mockTokenValue = 'tok-bob';
  mockGetMe.mockResolvedValue({ id: 'bob', email: 'b@x.y' });
  render(<AuthProvider><Probe /></AuthProvider>);
  await waitFor(() => expect(auth.user?.id).toBe('bob'));
  expect((await getSavedSessionProfile<{ id: string }>())?.id).toBe('bob');
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe('bob');
});

it('refreshUser: a sign-out in another tab during getMe() writes nothing', async () => {
  mockTokenValue = 'tok-bob';
  mockGetMe.mockResolvedValueOnce({ id: 'bob', email: 'b@x.y' });
  render(<AuthProvider><Probe /></AuthProvider>);
  await waitFor(() => expect(auth.user?.id).toBe('bob'));

  let release!: (u: unknown) => void;
  mockGetMe.mockImplementation(() => new Promise((r) => { release = r; }));
  let refreshing!: Promise<void>;
  await act(async () => { refreshing = auth.refreshUser(); await flush(); });
  await act(async () => { await otherTabSignsOut(); });
  await act(async () => { release({ id: 'bob', email: 'late@x.y' }); await refreshing; });

  expect(await getSavedSessionProfile()).toBeNull();
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
});
