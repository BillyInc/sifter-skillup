import React, { createContext, useContext } from 'react';
import { PRIVY_CONFIGURED } from '../../lib/config';
import { useStarkzapWallet } from '../../lib/starkzapPrivyAdapter';
import type { StarkzapWallet } from '../../lib/starkzap';

type StarknetWalletBridgeStatus = 'unavailable' | 'waiting-for-user' | 'connecting' | 'ready' | 'error';

interface StarknetWalletBridgeValue {
  wallet: StarkzapWallet | null;
  address: string | null;
  status: StarknetWalletBridgeStatus;
  ready: boolean;
  error: Error | null;
}

const DEFAULT_VALUE: StarknetWalletBridgeValue = {
  wallet: null,
  address: null,
  status: 'unavailable',
  ready: false,
  error: null,
};

const StarknetWalletBridgeContext = createContext<StarknetWalletBridgeValue>(DEFAULT_VALUE);

function StarknetWalletBridgeInner({
  children,
  preferredAddress,
}: {
  children: React.ReactNode;
  preferredAddress?: string | null;
}) {
  const { wallet, address, status, error } = useStarkzapWallet(preferredAddress ?? null);

  return (
    <StarknetWalletBridgeContext.Provider
      value={{
        wallet: (wallet as StarkzapWallet | null) ?? null,
        address,
        status,
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
}: {
  children: React.ReactNode;
  preferredAddress?: string | null;
}) {
  if (!PRIVY_CONFIGURED) {
    return (
      <StarknetWalletBridgeContext.Provider value={DEFAULT_VALUE}>
        {children}
      </StarknetWalletBridgeContext.Provider>
    );
  }

  return <StarknetWalletBridgeInner preferredAddress={preferredAddress}>{children}</StarknetWalletBridgeInner>;
}

export function useStarknetWalletBridge() {
  return useContext(StarknetWalletBridgeContext);
}
