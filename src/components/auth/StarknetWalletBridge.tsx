import React, { createContext, useCallback, useContext, useState } from 'react';
import type { StarkzapWallet } from '../../lib/starkzap';
import { PRIVY_ENABLED } from '../../lib/config';
import { useStarkzapWallet } from '../../lib/starkzapPrivyAdapter';

type StarknetWalletBridgeStatus = 'unavailable' | 'waiting-for-user' | 'connecting' | 'ready' | 'error' | 'disconnected';

interface StarknetWalletBridgeValue {
  wallet: StarkzapWallet | null;
  address: string | null;
  status: StarknetWalletBridgeStatus;
  connectionMode: 'sponsored' | 'self-paid' | null;
  connect: () => void;
  disconnect: () => void;
  ready: boolean;
  error: Error | null;
}

const DEFAULT_VALUE: StarknetWalletBridgeValue = {
  wallet: null,
  address: null,
  status: 'unavailable',
  connectionMode: null,
  connect: () => {},
  disconnect: () => {},
  ready: false,
  error: null,
};

const StarknetWalletBridgeContext = createContext<StarknetWalletBridgeValue>(DEFAULT_VALUE);

function StarknetWalletBridgeLive({
  children,
  preferredAddress,
  preferredWalletId,
  preferredPublicKey,
}: {
  children: React.ReactNode;
  preferredAddress?: string | null;
  preferredWalletId?: string | null;
  preferredPublicKey?: string | null;
}) {
  const [enabled, setEnabled] = useState(true);
  const connect = useCallback(() => setEnabled(true), []);
  const disconnect = useCallback(() => setEnabled(false), []);
  const { wallet, address, status, error, connectionMode } = useStarkzapWallet({
    preferredAddress: preferredAddress ?? null,
    preferredWalletId: preferredWalletId ?? null,
    preferredPublicKey: preferredPublicKey ?? null,
    enabled,
  });

  return (
    <StarknetWalletBridgeContext.Provider
      value={{
        wallet: (wallet as StarkzapWallet | null) ?? null,
        address,
        status,
        connectionMode,
        connect,
        disconnect,
        ready: status === 'ready' && !!wallet,
        error,
      }}
    >
      {children}
    </StarknetWalletBridgeContext.Provider>
  );
}

export function StarknetWalletBridgeProvider({
  children,
  preferredAddress,
  preferredWalletId,
  preferredPublicKey,
}: {
  children: React.ReactNode;
  preferredAddress?: string | null;
  preferredWalletId?: string | null;
  preferredPublicKey?: string | null;
}) {
  if (!PRIVY_ENABLED) {
    return (
      <StarknetWalletBridgeContext.Provider value={DEFAULT_VALUE}>
        {children}
      </StarknetWalletBridgeContext.Provider>
    );
  }

  return (
    <StarknetWalletBridgeLive
      preferredAddress={preferredAddress}
      preferredWalletId={preferredWalletId}
      preferredPublicKey={preferredPublicKey}
    >
      {children}
    </StarknetWalletBridgeLive>
  );
}

export function useStarknetWalletBridge() {
  return useContext(StarknetWalletBridgeContext);
}
