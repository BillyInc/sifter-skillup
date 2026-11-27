/**
 * Sign-out, account deletion and forced logout must clear the device's user
 * data; "continue later" must not. Sign-in must reconcile the device owner and
 * store the profile before the token (queued writes are owned by the profile).
 */
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act, cleanup } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '../src/hooks/useAuth';

const mockCalls: string[] = [];
const mockAuthLogin = jest.fn();
const mockHasStoredToken = jest.fn();
const mockClearAll = jest.fn();
const mockReconcile = jest.fn();
const mockGetMe = jest.fn();
const mockSwitchLocalUser = jest.fn();
const mockSavedProfile = jest.fn();
const mockSaveProfileSpy = jest.fn();
const mockAuthSignup = jest.fn();

jest.mock('../src/lib/api', () => ({
  API_BASE: 'http://test',
  API: {
    authLogin: (...a: unknown[]) => mockAuthLogin(...a),
    saveToken: jest.fn(async () => { mockCalls.push('saveToken'); }),
    clearToken: jest.fn().mockResolvedValue(undefined),
    getMe: (...a: unknown[]) => mockGetMe(...a),
    authSignup: (...a: unknown[]) => mockAuthSignup(...a),
    recordLegalAcceptance: jest.fn().mockResolvedValue(undefined),
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
  switchLocalUser: (...a: unknown[]) => mockSwitchLocalUser(...a),
}));
jest.mock('../src/lib/legal', () => ({
  getLegalAcceptance: jest.fn().mockResolvedValue({ termsVersion: 't', privacyVersion: 'p', analyticsConsent: false }),
  LEGAL_ACCEPTANCE_KEY: 'legal-key',
}));
jest.mock('../src/lib/offlineQueue', () => ({
  OfflineQueue: { init: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../src/lib/postAuthRedirect', () => ({ setPendingPostAuthRedirect: jest.fn() }));
jest.mock('../src/lib/resumeNavigation', () => ({ resolvePostAuthHref: jest.fn().mockReturnValue('/') }));
jest.mock('../src/lib/logoutState', () => ({
  clearExplicitLogout: jest.fn().mockResolvedValue(undefined),
  markExplicitLogout: jest.fn().mockResolvedValue(undefined),
  markPreserveLocalState: jest.fn().mockResolvedValue(undefined),
  hasPreserveLocalState: jest.fn().mockResolvedValue(false),
  hasExplicitLogout: jest.fn().mockResolvedValue(true),
}));
jest.mock('../src/lib/localUserState', () => ({
  clearLocalUserState: jest.fn().mockResolvedValue(undefined),
  clearAllDeviceUserData: (...a: unknown[]) => mockClearAll(...a),
  reconcileDeviceOwner: (...a: unknown[]) => mockReconcile(...a),
}));
jest.mock('../src/lib/sessionProfile', () => ({
  clearSessionProfile: jest.fn().mockResolvedValue(undefined),
  getSavedSessionProfile: (...a: unknown[]) => mockSavedProfile(...a),
  saveSessionProfile: jest.fn(async (p: unknown) => { mockCalls.push('saveProfile'); mockSaveProfileSpy(p); }),
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
  mockGetMe.mockRejectedValue(new Error('Unauthorized'));
  mockSwitchLocalUser.mockResolvedValue(undefined);
  mockSavedProfile.mockResolvedValue(null);
  auth = null;
});

describe('sign-in', () => {
  it('reconciles the device owner and saves the profile before the token', async () => {
    await signedInUser();
    expect(mockReconcile).toHaveBeenCalledWith('u1', { guest: false });
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
      await act(async () => { cleanup(); }); // unmount while the listener stubs still exist
      w.addEventListener = prev.wa; w.removeEventListener = prev.wr;
      if (hadDocument) g.document = prevDocument; else delete g.document;
    }
  });
});


describe('continue later', () => {
  it('keeps the offline-storage progress queue (only the next different account replaces it)', async () => {
    await signedInUser();
    mockSwitchLocalUser.mockClear();
    await act(async () => { await auth.signOut({ preserveLocalUserState: true }); });
    expect(mockSwitchLocalUser).not.toHaveBeenCalledWith('__signed_out__');
  });

  it('a full sign-out resets it', async () => {
    await signedInUser();
    mockSwitchLocalUser.mockClear();
    await act(async () => { await auth.signOut(); });
    expect(mockSwitchLocalUser).toHaveBeenCalledWith('__signed_out__');
  });
});

describe('forced logouts', () => {
  it.each(['device_mismatch', 'device_required'])('%s on restore clears the previous learner data like any forced logout', async (message) => {
    const { API } = jest.requireMock('../src/lib/api');
    API.getToken.mockResolvedValueOnce('stale-token');
    mockGetMe.mockRejectedValue(new Error(message));
    mockSavedProfile.mockResolvedValue({ id: 'u-old' });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(mockClearAll).toHaveBeenCalledWith('u-old'));
    expect(API.clearToken).toHaveBeenCalled();
  });

  it('does not wipe data another tab wrote when a different account is signing in there', async () => {
    const handlers: Record<string, () => void> = {};
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
      // The other tab already saved its profile (profile is written before the token).
      mockSavedProfile.mockResolvedValue({ id: 'u2' });
      await act(async () => { handlers.pageshow(); });
      await waitFor(() => expect(auth.user).toBeNull());
      expect(mockClearAll).not.toHaveBeenCalled();
    } finally {
      await act(async () => { cleanup(); }); // unmount while the listener stubs still exist
      w.addEventListener = prev.wa; w.removeEventListener = prev.wr;
      if (hadDocument) g.document = prevDocument; else delete g.document;
    }
  });
});

describe('stale in-flight restores (epoch)', () => {
  it('a refreshUser still waiting on getMe cannot re-save or re-publish the user after sign-out', async () => {
    await signedInUser();
    let release!: (p: unknown) => void;
    mockGetMe.mockImplementationOnce(() => new Promise((r) => { release = r; }));
    let refresh!: Promise<void>;
    await act(async () => { refresh = auth.refreshUser(); });
    await act(async () => { await auth.signOut(); });
    mockSaveProfileSpy.mockClear();
    await act(async () => {
      release({ id: 'u1', email: 'a@b.c', auth_provider: 'email' });
      await refresh;
    });
    expect(mockSaveProfileSpy).not.toHaveBeenCalled();
    expect(auth.user).toBeNull();
  });
});

describe('sign-up', () => {
  it('stores the profile before the token, like every other sign-in', async () => {
    mockAuthSignup.mockResolvedValue({ token: 't', user: { id: 'u9', email: 'n@b.c', auth_provider: 'email' } });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(auth).toBeTruthy());
    mockCalls.length = 0;
    await act(async () => { await auth.signUpEmail('n@b.c', 'pw', { first_name: 'N' }); });
    expect(mockCalls.indexOf('saveProfile')).toBeGreaterThanOrEqual(0);
    expect(mockCalls.indexOf('saveProfile')).toBeLessThan(mockCalls.indexOf('saveToken'));
    expect(mockReconcile).toHaveBeenCalledWith('u9', { guest: false });
  });
});
