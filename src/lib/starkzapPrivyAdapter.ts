/**
 * Starkzap ↔ Privy signer bridge.
 *
 * When both Privy (auth + Starknet wallet) and Starkzap (Starknet SDK) are
 * available at runtime, this hook returns a connected Starkzap Wallet whose
 * signing operations are delegated to Privy's rawSign API. Simulators and
 * track-level actions can use this wallet to execute real Sepolia transactions.
 *
 * Usage:
 *   const { wallet, status, error } = useStarkzapWallet();
 *   if (wallet) await wallet.execute([...calls]);
 *
 * Returns { wallet: null, status: 'unavailable' } when:
 *   - starkzap-native isn't installed (isStarkzapAvailable() === false)
 *   - user isn't Privy-authenticated
 *   - user has no Starknet linked account on Privy
 */

import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useSignRawHash } from '@privy-io/expo/extended-chains';
import { PrivySigner } from 'starkzap';
import { starkzapSdk, isStarkzapAvailable } from './starkzap';

type Status = 'unavailable' | 'waiting-for-user' | 'connecting' | 'ready' | 'error';

interface StarknetLinkedAccount {
  id: string;
  address: string;
  public_key?: string;
  chain_type: string;
}

function pickStarknetAccount(privyUser: any): StarknetLinkedAccount | null {
  const linked = privyUser?.linked_accounts ?? [];
  const match = linked.find((a: any) => a?.chain_type === 'starknet' && a?.address);
  if (!match) return null;
  return {
    id: match.id ?? match.wallet_id ?? match.address,
    address: match.address,
    public_key: match.public_key,
    chain_type: match.chain_type,
  };
}

export function useStarkzapWallet() {
  const privy = usePrivy();
  const { signRawHash } = useSignRawHash();
  const [wallet, setWallet] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('unavailable');
  const [error, setError] = useState<Error | null>(null);

  const account = useMemo(() => pickStarknetAccount(privy.user), [privy.user]);
  const sdkReady = isStarkzapAvailable() && !!starkzapSdk;

  useEffect(() => {
    if (!sdkReady) { setStatus('unavailable'); setWallet(null); return; }
    if (!privy.user || !account) { setStatus('waiting-for-user'); setWallet(null); return; }

    let cancelled = false;
    setStatus('connecting');
    setError(null);

    (async () => {
      try {
        const signer = new PrivySigner({
          walletId: account.id,
          publicKey: account.public_key ?? account.address,
          rawSign: async (_walletId: string, hash: string) => {
            const normalizedHash = (hash.startsWith('0x') ? hash : `0x${hash}`) as `0x${string}`;
            const res = await signRawHash({
              address: account.address,
              chainType: 'starknet',
              hash: normalizedHash,
            });
            return res.signature;
          },
        });
        const connected = await starkzapSdk.connectWallet({ account: { signer } });
        if (cancelled) return;
        setWallet(connected);
        setStatus('ready');
      } catch (e: any) {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setStatus('error');
        setWallet(null);
      }
    })();

    return () => { cancelled = true; };
  }, [sdkReady, privy.user, account?.address, account?.id, signRawHash]);

  return { wallet, status, error, address: account?.address ?? null };
}
