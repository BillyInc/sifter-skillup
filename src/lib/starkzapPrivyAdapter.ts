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
import {
  isStarkzapAvailable,
  SELF_PAID_FEE_MODE,
  starkzapSdk,
} from './starkzap';

type Status = 'unavailable' | 'waiting-for-user' | 'connecting' | 'ready' | 'error' | 'disconnected';
type ConnectionMode = 'sponsored' | 'self-paid';

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

interface PreferredWalletMeta {
  preferredAddress?: string | null;
  preferredWalletId?: string | null;
  preferredPublicKey?: string | null;
  enabled?: boolean;
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

function toResolvedPreferredMeta(input: PreferredWalletMeta): ResolvedWalletMeta | null {
  if (!input.preferredAddress || !input.preferredWalletId || !input.preferredPublicKey) {
    return null;
  }

  return {
    address: input.preferredAddress,
    walletId: input.preferredWalletId,
    publicKey: input.preferredPublicKey,
    source: 'backend',
  };
}

export function useStarkzapWallet(input: PreferredWalletMeta | string | null = null) {
  const privy = useAppPrivy();
  const { signRawHash } = useAppSignRawHash();
  const { getAccessToken, isReady, user } = privy;
  const [wallet, setWallet] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('unavailable');
  const [error, setError] = useState<Error | null>(null);
  const [backendWallet, setBackendWallet] = useState<EnsuredStarknetWallet | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('self-paid');
  const preferred = useMemo(
    () => (
      typeof input === 'string' || input === null
        ? { preferredAddress: input ?? null, enabled: true }
        : input
    ),
    [input],
  );
  const enabled = preferred.enabled !== false;

  const linkedAccount = useMemo(
    () => pickStarknetAccount(user, preferred.preferredAddress ?? null),
    [preferred.preferredAddress, user],
  );
  const linkedWalletMeta = useMemo(() => toResolvedLinkedMeta(linkedAccount), [linkedAccount]);
  const preferredWalletMeta = useMemo(() => toResolvedPreferredMeta(preferred), [preferred]);
  const backendWalletMeta = useMemo(() => toResolvedBackendMeta(backendWallet), [backendWallet]);
  const walletMeta = linkedWalletMeta ?? preferredWalletMeta ?? backendWalletMeta;
  const sdkReady = isStarkzapAvailable() && !!starkzapSdk;
  const address =
    walletMeta?.address
    ?? preferred.preferredAddress
    ?? linkedAccount?.address
    ?? backendWallet?.address
    ?? null;

  useEffect(() => {
    setBackendWallet(null);
  }, [user?.id]);

  useEffect(() => {
    if (!sdkReady || !isReady || !user?.id) {
      return;
    }
    if (linkedWalletMeta || preferredWalletMeta || backendWalletMeta) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await getAccessToken();
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
  }, [
    backendWalletMeta,
    getAccessToken,
    isReady,
    linkedWalletMeta,
    preferredWalletMeta,
    sdkReady,
    user?.id,
  ]);

  useEffect(() => {
    if (!sdkReady) {
      setStatus('unavailable');
      setWallet(null);
      return;
    }
    if (!enabled) {
      setStatus('disconnected');
      setWallet(null);
      setError(null);
      return;
    }
    if (!user || !walletMeta?.walletId || !walletMeta.publicKey || !walletMeta.address) {
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
          feeMode: SELF_PAID_FEE_MODE,
        });

        if (cancelled) {
          return;
        }

        setWallet(connected);
        setConnectionMode('self-paid');
        setError(null);
        setStatus('ready');
      } catch (cause: any) {
        if (cancelled) {
          return;
        }
        setConnectionMode('self-paid');
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setStatus('error');
        setWallet(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    sdkReady,
    signRawHash,
    user,
    walletMeta?.address,
    walletMeta?.publicKey,
    walletMeta?.walletId,
  ]);

  return { wallet, status, error, address, connectionMode };
}
