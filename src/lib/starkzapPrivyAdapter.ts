/**
 * Starkzap <-> Privy signer bridge.
 *
 * Uses the real Starknet wallet metadata created through Privy so StarkZap
 * receives the actual account address, wallet id, and public key required
 * for live Sepolia signing.
 */

import { useEffect, useMemo, useState } from 'react';
import { PrivySigner } from 'starkzap';
import { ensureStarknetWallet, type EnsuredStarknetWallet } from '../services/starknetWallet';
import { useAppPrivy, useAppSignRawHash } from './privy';
import { isStarkzapAvailable, SPONSORED_FEE_MODE, starkzapSdk } from './starkzap';

type Status = 'unavailable' | 'waiting-for-user' | 'connecting' | 'ready' | 'error';

interface StarknetLinkedAccount {
  id: string;
  address: string;
  public_key?: string;
  chain_type: string;
}

interface ResolvedWalletMeta {
  address: string;
  walletId: string;
  publicKey: string;
  source: 'linked' | 'backend';
}

function normalizeAddress(address: string | null | undefined) {
  return address?.trim().toLowerCase() ?? null;
}

function toLinkedAccount(raw: any): StarknetLinkedAccount | null {
  if (!raw?.address) {
    return null;
  }

  return {
    id: raw.id ?? raw.wallet_id ?? raw.address,
    address: raw.address,
    public_key: raw.public_key,
    chain_type: raw.chain_type,
  };
}

function pickStarknetAccount(privyUser: any, preferredAddress: string | null): StarknetLinkedAccount | null {
  const linked = Array.isArray(privyUser?.linked_accounts)
    ? privyUser.linked_accounts
        .filter((account: any) => account?.chain_type === 'starknet' && account?.address)
        .map(toLinkedAccount)
        .filter(Boolean) as StarknetLinkedAccount[]
    : [];

  if (!linked.length) {
    return null;
  }

  const normalizedPreferred = normalizeAddress(preferredAddress);
  if (normalizedPreferred) {
    const preferred = linked.find((account) => normalizeAddress(account.address) === normalizedPreferred);
    if (preferred) {
      return preferred;
    }
  }

  return linked[0] ?? null;
}

function toResolvedLinkedMeta(account: StarknetLinkedAccount | null): ResolvedWalletMeta | null {
  if (!account?.id || !account.address || !account.public_key) {
    return null;
  }

  return {
    address: account.address,
    walletId: account.id,
    publicKey: account.public_key,
    source: 'linked',
  };
}

function toResolvedBackendMeta(wallet: EnsuredStarknetWallet | null): ResolvedWalletMeta | null {
  if (!wallet?.address || !wallet.walletId || !wallet.publicKey) {
    return null;
  }

  return {
    address: wallet.address,
    walletId: wallet.walletId,
    publicKey: wallet.publicKey,
    source: 'backend',
  };
}

export function useStarkzapWallet(preferredAddress: string | null = null) {
  const privy = useAppPrivy();
  const { signRawHash } = useAppSignRawHash();
  const [wallet, setWallet] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('unavailable');
  const [error, setError] = useState<Error | null>(null);
  const [backendWallet, setBackendWallet] = useState<EnsuredStarknetWallet | null>(null);

  const linkedAccount = useMemo(
    () => pickStarknetAccount(privy.user, preferredAddress ?? null),
    [preferredAddress, privy.user],
  );
  const linkedWalletMeta = useMemo(() => toResolvedLinkedMeta(linkedAccount), [linkedAccount]);
  const backendWalletMeta = useMemo(() => toResolvedBackendMeta(backendWallet), [backendWallet]);
  const walletMeta = linkedWalletMeta ?? backendWalletMeta;
  const sdkReady = isStarkzapAvailable() && !!starkzapSdk;
  const address = walletMeta?.address ?? preferredAddress ?? linkedAccount?.address ?? backendWallet?.address ?? null;

  useEffect(() => {
    setBackendWallet(null);
  }, [privy.user?.id]);

  useEffect(() => {
    if (!sdkReady || !privy.isReady || !privy.user?.id) {
      return;
    }
    if (linkedWalletMeta || backendWalletMeta) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await privy.getAccessToken();
        if (!token) {
          return;
        }

        const ensured = await ensureStarknetWallet(token);
        if (!cancelled && ensured?.address) {
          setBackendWallet(ensured);
        }
      } catch (cause: any) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [backendWalletMeta, linkedWalletMeta, privy.getAccessToken, privy.isReady, privy.user?.id, sdkReady]);

  useEffect(() => {
    if (!sdkReady) {
      setStatus('unavailable');
      setWallet(null);
      return;
    }
    if (!privy.user || !walletMeta) {
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
          walletId: walletMeta.walletId,
          publicKey: walletMeta.publicKey,
          rawSign: async (_walletId: string, hash: string) => {
            const normalizedHash = (hash.startsWith('0x') ? hash : `0x${hash}`) as `0x${string}`;
            const result = await signRawHash({
              address: walletMeta.address,
              chainType: 'starknet',
              hash: normalizedHash,
            });
            return result.signature;
          },
        });

        const connected = await starkzapSdk.connectWallet({
          account: { signer },
          accountAddress: walletMeta.address,
          feeMode: SPONSORED_FEE_MODE,
        });

        await connected.ensureReady?.({
          deploy: 'if_needed',
          feeMode: SPONSORED_FEE_MODE,
        });

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
  }, [
    privy.user?.id,
    sdkReady,
    signRawHash,
    walletMeta?.address,
    walletMeta?.publicKey,
    walletMeta?.walletId,
  ]);

  return { wallet, status, error, address };
}
