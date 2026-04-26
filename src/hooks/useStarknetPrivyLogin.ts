/**
 * useStarknetPrivyLogin wraps @privy-io/expo hooks for the Starknet auth flow.
 *
 * Flow:
 *   1. startEmail(email) -> Privy sends OTP -> caller collects code
 *   2. submitEmailCode(code) -> Privy verifies and authenticates
 *   3. authStarknet() posts the Privy access token to the backend, which
 *      idempotently creates the Starknet wallet via Privy's server API.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAppLoginWithEmail, useAppLoginWithOAuth, useAppPrivy } from '../lib/privy';
import {
  clearPendingPrivyWebLogin,
  getPrivyEmail,
  getPrivyLinkedAccounts,
  readPendingPrivyWebLogin,
  writePendingPrivyWebLogin,
} from '../lib/privyShared';

type LinkedStarknetAccount = {
  id: string;
  address: string;
};

export type StarknetLoginState =
  | { kind: 'idle' }
  | { kind: 'sending-code'; email: string }
  | { kind: 'awaiting-code'; email: string }
  | { kind: 'verifying' }
  | {
      kind: 'ready';
      email: string;
      starknetAddress?: string;
      starknetWalletId?: string;
      privyAccessToken: string;
    }
  | { kind: 'error'; message: string };

export type OAuthProvider = 'google' | 'twitter' | 'apple';

async function waitForPrivyAccessToken(
  getAccessToken: () => Promise<string | null | undefined>,
  attempts = 10,
  delayMs = 250,
): Promise<string> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const token = await getAccessToken();
    if (token) {
      return token;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Privy access token unavailable after login.');
}

function pickStarknetAccount(privyUser: any): LinkedStarknetAccount | null {
  const linked = getPrivyLinkedAccounts(privyUser);
  const match = linked.find(
    (account: any) =>
      (account?.chain_type === 'starknet' || account?.chainType === 'starknet') &&
      account?.address,
  );
  if (!match?.address) {
    return null;
  }
  return {
    id: match.id ?? match.wallet_id ?? match.address,
    address: match.address,
  };
}

export function useStarknetPrivyLogin() {
  const [state, setState] = useState<StarknetLoginState>({ kind: 'idle' });
  const completedUserId = useRef<string | null>(null);

  const privy = useAppPrivy();
  const { sendCode, loginWithCode } = useAppLoginWithEmail();
  const oauth = useAppLoginWithOAuth();

  const reset = useCallback(() => setState({ kind: 'idle' }), []);

  const finalize = useCallback(async (email: string) => {
    const token = await waitForPrivyAccessToken(() => privy.getAccessToken());

    const account = pickStarknetAccount(privy.user);
    const ready = {
      email,
      starknetAddress: account?.address,
      starknetWalletId: account?.id,
      privyAccessToken: token,
    };
    completedUserId.current = privy.user?.id ?? null;
    clearPendingPrivyWebLogin();
    setState({ kind: 'ready', ...ready });
    return ready;
  }, [privy]);

  const startEmail = useCallback(async (email: string) => {
    setState({ kind: 'sending-code', email });
    try {
      await sendCode({ email });
      setState({ kind: 'awaiting-code', email });
    } catch (error: any) {
      setState({ kind: 'idle' });
      throw error;
    }
  }, [sendCode]);

  const submitEmailCode = useCallback(async (email: string, code: string) => {
    setState({ kind: 'verifying' });
    try {
      await loginWithCode({ email, code });
      return await finalize(email);
    } catch (error) {
      setState({ kind: 'awaiting-code', email });
      throw error;
    }
  }, [finalize, loginWithCode]);

  const startOAuth = useCallback(async (provider: OAuthProvider, emailFallback: string) => {
    setState({ kind: 'verifying' });
    try {
      if (Platform.OS === 'web') {
        writePendingPrivyWebLogin(emailFallback);
      }
      await oauth.login({ provider });
      const email = getPrivyEmail(privy.user, emailFallback);
      return await finalize(email);
    } catch (error) {
      setState({ kind: 'idle' });
      throw error;
    }
  }, [finalize, oauth, privy.user]);

  useEffect(() => {
    const pendingOAuth = Platform.OS === 'web' ? readPendingPrivyWebLogin() : null;
    if (!privy.isReady || !privy.user?.id || !pendingOAuth) {
      return;
    }
    if (completedUserId.current === privy.user.id) {
      clearPendingPrivyWebLogin();
      return;
    }

    void finalize(getPrivyEmail(privy.user, pendingOAuth.emailFallback)).catch((error: any) => {
      setState({ kind: 'idle' });
    });
  }, [finalize, privy.isReady, privy.user]);

  return useMemo(() => ({
    state,
    startEmail,
    submitEmailCode,
    startOAuth,
    reset,
    isReady: privy.isReady,
    authenticated: privy.authenticated,
  }), [state, startEmail, submitEmailCode, startOAuth, reset, privy.authenticated, privy.isReady, privy.user]);
}
