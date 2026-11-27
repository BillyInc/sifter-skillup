/**
 * Sign-out, account deletion and forced logout must clear the device's user
 * data; "continue later" must not. Sign-in must reconcile the device owner and
 * store the profile before the token (queued writes are owned by the profile).
 */
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '../src/hooks/useAuth';

const mockCalls: string[] = [];
const mockAuthLogin = jest.fn();
const mockHasStoredToken = jest.fn();
const mockClearAll = jest.fn();
const mockReconcile = jest.fn();

jest.mock('../src/lib/api', () => ({
  API_BASE: 'http://test',
  API: {
    authLogin: (...a: unknown[]) => mockAuthLogin(...a),
    saveToken: jest.fn(async () => { mockCalls.push('saveToken'); }),
    clearToken: jest.fn().mockResolvedValue(undefined),
    getMe: jest.fn().mockRejectedValue(new Error('Unauthorized')),
    getToken: jest.fn().mockResolvedValue(null),
    hasStoredToken: (...a: unknown[]) => mockHasStoredToken(...a),
    deleteMe: jest.fn().mockResolvedValue(undefined),
    checkStreak: jest.fn().mockResolvedValue(undefined),
    updateMe: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../src/lib/offlineStorage', () => ({
  getOrCreateDeviceId: jest.fn().mockResolvedValue('device'),
  onLoginSync: jest.fn().mockResolvedValue(undefined),
  switchLocalUser: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../src/lib/offlineQueue', () => ({
  OfflineQueue: { init: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../src/lib/postAuthRedirect', () => ({ setPendingPostAuthRedirect: jest.fn() }));
jest.mock('../src/lib/resumeNavigation', () => ({ resolvePostAuthHref: jest.fn().mockReturnValue('/') }));
jest.mock('../src/lib/logoutState', () => ({
  clearExplicitLogout: jest.fn().mockResolvedValue(undefined),
  markExplicitLogout: jest.fn().mockResolvedValue(undefined),
  hasExplicitLogout: jest.fn().mockResolvedValue(true),
}));
jest.mock('../src/lib/localUserState', () => ({
  clearLocalUserState: jest.fn().mockResolvedValue(undefined),
  clearAllDeviceUserData: (...a: unknown[]) => mockClearAll(...a),
  reconcileDeviceOwner: (...a: unknown[]) => mockReconcile(...a),
}));
jest.mock('../src/lib/sessionProfile', () => ({
  clearSessionProfile: jest.fn().mockResolvedValue(undefined),
  getSavedSessionProfile: jest.fn().mockResolvedValue(null),
  saveSessionProfile: jest.fn(async () => { mockCalls.push('saveProfile'); }),
}));
jest.mock('../src/components/auth/StarknetWalletBridge', () => ({
  StarknetWalletBridgeProvider: ({ children }: { children: React.ReactNode }) => children,
  useStarknetWalletBridge: () => ({ wallet: null, address: null, status: 'unavailable', connectionMode: null, ready: false }),
}));
jest.mock('../src/components/auth/PrivyStarknetBootstrap', () => ({ PrivyStarknetBootstrap: () => null }));
jest.mock('../src/lib/config', () => ({ PRIVY_ENABLED: false }));


let auth: any;
function Probe() {
  auth = useAuth();
  return <Text>{auth.user ? auth.user.id : 'anon'}</Text>;
}

async function signedInUser() {
  mockAuthLogin.mockResolvedValue({ token: 't', user: { id: 'u1', email: 'a@b.c', auth_provider: 'email' } });
  render(<AuthProvider><Probe /></AuthProvider>);
  await waitFor(() => expect(auth).toBeTruthy());
  await act(async () => { await auth.signInEmail('a@b.c', 'pw'); });
  await waitFor(() => expect(auth.user?.id).toBe('u1'));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCalls.length = 0;
  mockClearAll.mockResolvedValue(undefined);
  mockReconcile.mockResolvedValue(undefined);
  mockHasStoredToken.mockReturnValue(true);
  auth = null;
});

describe('sign-in', () => {
  it('reconciles the device owner and saves the profile before the token', async () => {
    await signedInUser();
    expect(mockReconcile).toHaveBeenCalledWith('u1');
    expect(mockCalls.indexOf('saveProfile')).toBeGreaterThanOrEqual(0);
    expect(mockCalls.indexOf('saveProfile')).toBeLessThan(mockCalls.indexOf('saveToken'));
  });
});

describe('device data clearing', () => {
  it('signOut clears all device user data', async () => {
    await signedInUser();
    await act(async () => { await auth.signOut(); });
    expect(mockClearAll).toHaveBeenCalledWith('u1');
  });

  it('signOut with preserveLocalUserState ("continue later") does not clear it', async () => {
    await signedInUser();
    await act(async () => { await auth.signOut({ preserveLocalUserState: true }); });
    expect(mockClearAll).not.toHaveBeenCalled();
  });

  it('deleteAccount clears all device user data', async () => {
    await signedInUser();
    await act(async () => { await auth.deleteAccount(); });
    expect(mockClearAll).toHaveBeenCalledWith('u1');
  });

  it('a forced logout (token removed elsewhere) clears all device user data', async () => {
    const handlers: Record<string, () => void> = {};
    // The RN jest environment has no DOM: provide just what the web-only
    // browser-restore reconciliation feature-detects.
    const w = window as any;
    const g = globalThis as any;
    const hadDocument = 'document' in g;
    const prevDocument = g.document;
    const prev = { wa: w.addEventListener, wr: w.removeEventListener };
    g.document = { addEventListener: jest.fn(), removeEventListener: jest.fn(), visibilityState: 'visible' };
    w.addEventListener = (n: string, h: () => void) => { handlers[n] = h; };
    w.removeEventListener = jest.fn();
    try {
      await signedInUser();
      mockHasStoredToken.mockReturnValue(false);
      await act(async () => { handlers.pageshow(); });
      await waitFor(() => expect(mockClearAll).toHaveBeenCalledWith('u1'));
      await waitFor(() => expect(auth.user).toBeNull());
    } finally {
      w.addEventListener = prev.wa; w.removeEventListener = prev.wr;
      if (hadDocument) g.document = prevDocument; else delete g.document;
    }
  });
});
