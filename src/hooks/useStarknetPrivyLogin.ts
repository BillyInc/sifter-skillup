/**
 * useStarknetPrivyLogin — wraps @privy-io/expo hooks for the Starknet auth flow.
 *
 * Flow:
 *   1. startEmail(email) → Privy sends OTP → caller collects code
 *   2. submitEmailCode(code) → Privy verifies, authenticates, provisions Starknet wallet
 *   3. finalize() → returns { email, starknetAddress, starknetWalletId, privyAccessToken }
 *      for useAuth.authStarknet() + Starkzap PrivySigner.
 *
 * Privy exposes Starknet as an extended (curve-signing) chain. Wallet creation
 * goes through @privy-io/expo/extended-chains; signing uses useSignRawHash with
 * chainType: 'starknet', which Starkzap's PrivySigner wraps for Starknet txs.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  useLoginWithEmail,
  useLoginWithOAuth,
  usePrivy,
} from '@privy-io/expo';
import { useCreateWallet } from '@privy-io/expo/extended-chains';

export type StarknetLoginState =
  | { kind: 'idle' }
  | { kind: 'sending-code'; email: string }
  | { kind: 'awaiting-code'; email: string }
  | { kind: 'verifying' }
  | { kind: 'provisioning-wallet' }
  | { kind: 'ready'; email: string; starknetAddress: string; starknetWalletId: string; privyAccessToken: string }
  | { kind: 'error'; message: string };

export type OAuthProvider = 'google' | 'twitter' | 'apple';

export function useStarknetPrivyLogin() {
  const [state, setState] = useState<StarknetLoginState>({ kind: 'idle' });

  const privy = usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail({
    onError: (err) => setState({ kind: 'error', message: err?.message ?? 'Email login failed' }),
  });
  const oauth = useLoginWithOAuth({
    onError: (err) => setState({ kind: 'error', message: err?.message ?? 'OAuth login failed' }),
  });
  const { createWallet } = useCreateWallet();

  const reset = useCallback(() => setState({ kind: 'idle' }), []);

  // Ensure an on-chain-type Starknet wallet exists on the current Privy user; return its id + address.
  const provisionStarknetWallet = useCallback(async (): Promise<{ id: string; address: string }> => {
    setState({ kind: 'provisioning-wallet' });
    // If the user already has a Starknet linked account (returning user), reuse it.
    const linked = (privy.user as any)?.linked_accounts ?? [];
    const existing = linked.find((a: any) => a?.chain_type === 'starknet' && a?.address);
    if (existing?.address) {
      return { id: existing.id ?? existing.wallet_id ?? existing.address, address: existing.address };
    }
    const res = await createWallet({ chainType: 'starknet' });
    const w: any = res.wallet;
    if (!w?.address || !w?.id) {
      throw new Error('Privy did not return a Starknet wallet. Check your Privy dashboard config.');
    }
    return { id: w.id, address: w.address };
  }, [privy.user, createWallet]);

  const finalize = useCallback(async (email: string) => {
    const token = await privy.getAccessToken();
    if (!token) throw new Error('Privy access token unavailable after login.');
    const { id, address } = await provisionStarknetWallet();
    const ready = { email, starknetAddress: address, starknetWalletId: id, privyAccessToken: token };
    setState({ kind: 'ready', ...ready });
    return ready;
  }, [privy, provisionStarknetWallet]);

  const startEmail = useCallback(async (email: string) => {
    setState({ kind: 'sending-code', email });
    await sendCode({ email });
    setState({ kind: 'awaiting-code', email });
  }, [sendCode]);

  const submitEmailCode = useCallback(async (email: string, code: string) => {
    setState({ kind: 'verifying' });
    await loginWithCode({ email, code });
    return finalize(email);
  }, [loginWithCode, finalize]);

  const startOAuth = useCallback(async (provider: OAuthProvider, emailFallback: string) => {
    setState({ kind: 'verifying' });
    await oauth.login({ provider });
    const email = ((privy.user as any)?.linked_accounts
      ?.find((a: any) => a.type === 'email')?.address as string | undefined) ?? emailFallback;
    return finalize(email);
  }, [oauth, privy, finalize]);

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
