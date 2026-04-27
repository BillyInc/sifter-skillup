import { useEffect, useRef } from 'react';
import { useAppPrivy } from '../../lib/privy';
import { ensureStarknetWallet } from '../../services/starknetWallet';

export function PrivyStarknetBootstrap({
  user,
  refreshUser,
}: {
  user: { email?: string; starknet_address?: string } | null;
  refreshUser: () => Promise<void>;
}) {
  const privy = useAppPrivy();
  const lastSyncedPrivyUser = useRef<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!privy.isReady || !privy.user?.id || !user?.email) {
      return;
    }
    if (lastSyncedPrivyUser.current === privy.user.id || inFlight.current) {
      return;
    }

    inFlight.current = true;
    void (async () => {
      try {
        const token = await privy.getAccessToken();
        if (!token) {
          return;
        }

        const wallet = await ensureStarknetWallet(token);
        if (wallet?.persisted) {
          lastSyncedPrivyUser.current = privy.user?.id ?? null;
          if (!user.starknet_address || user.starknet_address !== wallet.address) {
            await refreshUser();
          }
        }
      } finally {
        inFlight.current = false;
      }
    })();
  }, [privy, refreshUser, user?.email, user?.starknet_address]);

  return null;
}
