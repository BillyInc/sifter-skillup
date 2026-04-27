import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';
import type { StarkzapWallet } from '../../lib/starkzap';
import { PRIVY_NATIVE_ENABLED } from '../../lib/config';
import { useStarkzapWallet } from '../../lib/starkzapPrivyAdapter';

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

function StarknetWalletBridgeWeb({
  children,
  preferredAddress,
}: {
  children: React.ReactNode;
  preferredAddress?: string | null;
}) {
  const fallbackAddress = preferredAddress?.trim() || null;

  return (
    <StarknetWalletBridgeContext.Provider value={{
      wallet: null,
      address: fallbackAddress,
      status: fallbackAddress ? 'ready' : 'waiting-for-user',
      ready: Boolean(fallbackAddress),
      error: null,
    }}>
      {children}
    </StarknetWalletBridgeContext.Provider>
  );
}

function StarknetWalletBridgeNative({
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
  if (Platform.OS === 'web') {
    return <StarknetWalletBridgeWeb preferredAddress={preferredAddress}>{children}</StarknetWalletBridgeWeb>;
  }

  if (!PRIVY_NATIVE_ENABLED) {
    return (
      <StarknetWalletBridgeContext.Provider value={DEFAULT_VALUE}>
        {children}
      </StarknetWalletBridgeContext.Provider>
    );
  }

  return <StarknetWalletBridgeNative preferredAddress={preferredAddress}>{children}</StarknetWalletBridgeNative>;
}

export function useStarknetWalletBridge() {
  return useContext(StarknetWalletBridgeContext);
}
