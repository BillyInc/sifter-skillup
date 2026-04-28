/**
 * Starkzap <-> Privy signer bridge.
 *
 * This bridge prefers the Starknet address already synced into the app user
 * profile, so it can keep working even when the wallet was created on the
 * backend and Privy's local user object has not refreshed yet.
 */

import { useEffect, useMemo, useState } from 'react';
import { PrivySigner } from 'starkzap';
import { starkzapSdk, isStarkzapAvailable } from './starkzap';
import { useAppPrivy, useAppSignRawHash } from './privy';

type Status = 'unavailable' | 'waiting-for-user' | 'connecting' | 'ready' | 'error';

interface StarknetLinkedAccount {
  id: string;
  address: string;
  public_key?: string;
  chain_type: string;
}

function pickStarknetAccount(privyUser: any): StarknetLinkedAccount | null {
  const linked = privyUser?.linked_accounts ?? [];
  const match = linked.find((account: any) => account?.chain_type === 'starknet' && account?.address);
  if (!match) {
    return null;
  }
  return {
    id: match.id ?? match.wallet_id ?? match.address,
    address: match.address,
    public_key: match.public_key,
    chain_type: match.chain_type,
  };
}

export function useStarkzapWallet(preferredAddress: string | null = null) {
  const privy = useAppPrivy();
  const { signRawHash } = useAppSignRawHash();
  const [wallet, setWallet] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('unavailable');
  const [error, setError] = useState<Error | null>(null);

  const linkedAccount = useMemo(() => pickStarknetAccount(privy.user), [privy.user]);
  const sdkReady = isStarkzapAvailable() && !!starkzapSdk;
  const address = preferredAddress ?? linkedAccount?.address ?? null;
  const walletId = linkedAccount?.id ?? address ?? null;
  const publicKey = linkedAccount?.public_key ?? address ?? undefined;

  useEffect(() => {
    if (!sdkReady) {
      setStatus('unavailable');
      setWallet(null);
      return;
    }
    if (!privy.user || !address || !walletId) {
      setStatus('waiting-for-user');
      setWallet(null);
      return;
    }

    let cancelled = false;
    setStatus('connecting');
    setError(null);

    void (async () => {
      try {
        const signer = new PrivySigner({
          walletId,
          publicKey: publicKey ?? address,
          rawSign: async (_walletId: string, hash: string) => {
            const normalizedHash = (hash.startsWith('0x') ? hash : `0x${hash}`) as `0x${string}`;
            const result = await signRawHash({
              address,
              chainType: 'starknet',
              hash: normalizedHash,
            });
            return result.signature;
          },
        });

        const connected = await starkzapSdk.connectWallet({ account: { signer } });
        if (cancelled) {
          return;
        }
        setWallet(connected);
        setStatus('ready');
      } catch (cause: any) {
        if (cancelled) {
          return;
        }
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setStatus('error');
        setWallet(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, privy.user, publicKey, sdkReady, signRawHash, walletId]);

  return { wallet, status, error, address };
}
