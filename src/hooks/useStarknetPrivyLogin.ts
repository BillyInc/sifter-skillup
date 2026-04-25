/**
 * useStarknetPrivyLogin wraps @privy-io/expo hooks for the Starknet auth flow.
 *
 * Flow:
 *   1. startEmail(email) -> Privy sends OTP -> caller collects code
 *   2. submitEmailCode(code) -> Privy verifies and authenticates
 *   3. authStarknet() posts the Privy access token to the backend, which
 *      idempotently creates the Starknet wallet via Privy's server API.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  useLoginWithEmail,
  useLoginWithOAuth,
  usePrivy,
} from '@privy-io/expo';

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

function pickStarknetAccount(privyUser: any): LinkedStarknetAccount | null {
  const linked = privyUser?.linked_accounts ?? [];
  const match = linked.find((account: any) => account?.chain_type === 'starknet' && account?.address);
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

  const privy = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail({
    onError: (err) => setState({ kind: 'error', message: err?.message ?? 'Email login failed' }),
  });
  const oauth = useLoginWithOAuth({
    onError: (err) => setState({ kind: 'error', message: err?.message ?? 'OAuth login failed' }),
  });

  const reset = useCallback(() => setState({ kind: 'idle' }), []);

  const finalize = useCallback(async (email: string) => {
    const token = await privy.getAccessToken();
    if (!token) {
      throw new Error('Privy access token unavailable after login.');
    }

    const account = pickStarknetAccount(privy.user);
    const ready = {
      email,
      starknetAddress: account?.address,
      starknetWalletId: account?.id,
      privyAccessToken: token,
    };
    setState({ kind: 'ready', ...ready });
    return ready;
  }, [privy]);

  const startEmail = useCallback(async (email: string) => {
    setState({ kind: 'sending-code', email });
    await sendCode({ email });
    setState({ kind: 'awaiting-code', email });
  }, [sendCode]);

  const submitEmailCode = useCallback(async (email: string, code: string) => {
    setState({ kind: 'verifying' });
    await loginWithCode({ email, code });
    return finalize(email);
  }, [finalize, loginWithCode]);

  const startOAuth = useCallback(async (provider: OAuthProvider, emailFallback: string) => {
    setState({ kind: 'verifying' });
    await oauth.login({ provider });
    const email = ((privy.user as any)?.linked_accounts
      ?.find((account: any) => account.type === 'email')?.address as string | undefined) ?? emailFallback;
    return finalize(email);
  }, [finalize, oauth, privy.user]);

  return useMemo(() => ({
    state,
    startEmail,
    submitEmailCode,
    startOAuth,
    reset,
    isReady: privy.isReady,
    authenticated: !!privy.user,
  }), [state, startEmail, submitEmailCode, startOAuth, reset, privy.isReady, privy.user]);
}
