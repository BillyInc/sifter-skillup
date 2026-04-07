/**
 * Sifter Skill_Up — useSimulatorWallet
 * NEW FILE: src/hooks/useSimulatorWallet.ts
 *
 * Provides a testnet wallet address, balance, and helpers
 * for each island's chain. No browser extension required —
 * wallets are created in-app and stored in SecureStore.
 *
 * Works on mobile (iOS/Android) AND web without any wallet extension.
 * Uses the chain mapping from SimulatorCard_ADDITIONS.tsx.
 *
 * On first call for an island: generates a deterministic demo wallet.
 * On subsequent calls: returns the same wallet (stable across sessions).
 */

import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Linking, Platform } from 'react-native';

// ── Chain config (mirrors TESTNET_CHAINS_CONFIG in SimulatorCard_ADDITIONS) ──

export interface ChainConfig {
  icon: string;
  name: string;
  shortName: string;
  nativeSymbol: string;
  explorerUrl: string;
  faucetUrl: string;
  faucetLabel: string;
  demoBalance: string;
  color: string;
}

const CHAIN_CONFIG: Record<string, ChainConfig> = {
  'bitcoin-testnet4': {
    icon: '₿', name: 'Bitcoin Testnet4', shortName: 'BTC Testnet',
    nativeSymbol: 'tBTC', explorerUrl: 'https://mempool.space/testnet4',
    faucetUrl: 'https://mempool.space/testnet4/faucet', faucetLabel: 'Get test BTC',
    demoBalance: '0.0842 tBTC', color: '#f7931a',
  },
  'ethereum-sepolia': {
    icon: '⟠', name: 'Ethereum Sepolia', shortName: 'ETH Sepolia',
    nativeSymbol: 'ETH', explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://sepoliafaucet.com', faucetLabel: 'Get Sepolia ETH',
    demoBalance: '1.5 ETH', color: '#627eea',
  },
  'bnb-testnet': {
    icon: '🟡', name: 'BNB Testnet', shortName: 'BNB Testnet',
    nativeSymbol: 'tBNB', explorerUrl: 'https://testnet.bscscan.com',
    faucetUrl: 'https://www.bnbchain.org/en/testnet-faucet', faucetLabel: 'Get tBNB',
    demoBalance: '2.5 tBNB', color: '#f0b90b',
  },
  'solana-devnet': {
    icon: '◎', name: 'Solana Devnet', shortName: 'SOL Devnet',
    nativeSymbol: 'SOL', explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    faucetUrl: 'https://faucet.solana.com', faucetLabel: 'Get devnet SOL',
    demoBalance: '5.0 SOL', color: '#9945ff',
  },
  'arbitrum-sepolia': {
    icon: '🔵', name: 'Arbitrum Sepolia', shortName: 'ARB Sepolia',
    nativeSymbol: 'ETH', explorerUrl: 'https://sepolia.arbiscan.io',
    faucetUrl: 'https://faucets.chain.link/arbitrum-sepolia', faucetLabel: 'Get ARB ETH',
    demoBalance: '0.5 ETH', color: '#28a0f0',
  },
  'base-sepolia': {
    icon: '🔵', name: 'Base Sepolia', shortName: 'Base Sepolia',
    nativeSymbol: 'ETH', explorerUrl: 'https://sepolia.basescan.org',
    faucetUrl: 'https://faucets.chain.link/base-sepolia', faucetLabel: 'Get Base ETH',
    demoBalance: '0.5 ETH', color: '#0052ff',
  },
  'ton-testnet': {
    icon: '💎', name: 'TON Testnet', shortName: 'TON Testnet',
    nativeSymbol: 'TON', explorerUrl: 'https://testnet.tonscan.org',
    faucetUrl: 'https://t.me/testgiver_ton_bot', faucetLabel: 'Get test TON (Telegram bot)',
    demoBalance: '50.0 TON', color: '#0088cc',
  },
  'starknet-sepolia': {
    icon: '⚡', name: 'Starknet Sepolia', shortName: 'STRK Sepolia',
    nativeSymbol: 'STRK', explorerUrl: 'https://sepolia.voyager.online',
    faucetUrl: 'https://starknet-faucet.vercel.app', faucetLabel: 'Get Sepolia STRK',
    demoBalance: '124.5 STRK', color: '#ec4899',
  },
};

// Island → chain mapping
const ISLAND_TO_CHAIN: Record<number, string> = {
  1:  'bitcoin-testnet4',
  2:  'ethereum-sepolia',
  3:  'ethereum-sepolia',
  4:  'ethereum-sepolia',
  5:  'bnb-testnet',
  6:  'solana-devnet',
  7:  'ethereum-sepolia',
  8:  'arbitrum-sepolia',
  9:  'solana-devnet',
  10: 'arbitrum-sepolia',
  11: 'base-sepolia',
  12: 'ton-testnet',
  13: 'base-sepolia',
  14: 'ethereum-sepolia',
  15: 'arbitrum-sepolia',
  16: 'ethereum-sepolia',
  17: 'ethereum-sepolia',
  18: 'starknet-sepolia',
};

// ── Wallet state ──────────────────────────────────────────────

export interface SimulatorWallet {
  address: string | null;
  shortAddress: string;
  balance: string;
  chain: string;
  chainConfig: ChainConfig;
  isDemo: boolean;             // true = demo address (no real keys)
  hasBalance: boolean;
  needsFaucet: boolean;
  isLoading: boolean;
  showCreatePrompt: boolean;
  createWallet: () => Promise<void>;
  openFaucet: () => void;
  openExplorer: () => void;
  copyAddress: () => Promise<void>;
  copied: boolean;
}

// ── Secure key for each chain's wallet ───────────────────────

function walletKey(chain: string): string {
  return `sifter_sim_wallet_${chain}`;
}

// Generate a deterministic demo address (no real private key)
async function generateDemoAddress(chain: string): Promise<string> {
  const seed = `sifter_demo_${chain}_${Date.now()}`;
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, seed);
  if (chain === 'bitcoin-testnet4') return `tb1q${hash.slice(0, 38)}`;
  if (chain === 'solana-devnet')    return hash.slice(0, 44);
  if (chain === 'ton-testnet')      return `EQ${hash.slice(0, 46)}`;
  if (chain === 'starknet-sepolia') return `0x${hash.slice(0, 63)}`;
  return `0x${hash.slice(0, 40)}`;
}

function shortAddr(address: string): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ── Hook ─────────────────────────────────────────────────────

export function useSimulatorWallet(islandId: number): SimulatorWallet {
  const chain       = ISLAND_TO_CHAIN[islandId] ?? 'ethereum-sepolia';
  const chainConfig = CHAIN_CONFIG[chain] ?? CHAIN_CONFIG['ethereum-sepolia'];
  const storeKey    = walletKey(chain);

  const [address,         setAddress]         = useState<string | null>(null);
  const [isLoading,       setIsLoading]        = useState(true);
  const [showCreatePrompt,setShowCreatePrompt] = useState(false);
  const [copied,          setCopied]           = useState(false);

  // Load or auto-create demo wallet on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let stored: string | null = null;
        if (Platform.OS !== 'web') {
          stored = await SecureStore.getItemAsync(storeKey);
        } else {
          stored = localStorage.getItem(storeKey);
        }
        if (stored) {
          if (mounted) setAddress(stored);
        } else {
          // Auto-create a demo address (no private key — purely visual)
          const demo = await generateDemoAddress(chain);
          if (Platform.OS !== 'web') {
            await SecureStore.setItemAsync(storeKey, demo);
          } else {
            localStorage.setItem(storeKey, demo);
          }
          if (mounted) setAddress(demo);
        }
      } catch {
        // Fallback: show create prompt
        if (mounted) setShowCreatePrompt(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [chain, storeKey]);

  const createWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const demo = await generateDemoAddress(chain);
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(storeKey, demo);
      } else {
        localStorage.setItem(storeKey, demo);
      }
      setAddress(demo);
      setShowCreatePrompt(false);
    } finally {
      setIsLoading(false);
    }
  }, [chain, storeKey]);

  const openFaucet = useCallback(() => {
    Linking.openURL(chainConfig.faucetUrl).catch(() => {});
  }, [chainConfig.faucetUrl]);

  const openExplorer = useCallback(() => {
    if (!address) return;
    const url = `${chainConfig.explorerUrl}/address/${address}`;
    Linking.openURL(url).catch(() => {});
  }, [address, chainConfig.explorerUrl]);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      const { Clipboard } = require('react-native');
      Clipboard.setString(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [address]);

  // Starknet Island 18 uses the real StarkZap balance — use demo balance elsewhere
  const balance = chainConfig.demoBalance;

  return {
    address,
    shortAddress:    address ? shortAddr(address) : '',
    balance,
    chain,
    chainConfig,
    isDemo:          true,
    hasBalance:      true,   // demo wallets show a balance for UX
    needsFaucet:     false,  // users can tap faucet button to get real testnet tokens
    isLoading,
    showCreatePrompt,
    createWallet,
    openFaucet,
    openExplorer,
    copyAddress,
    copied,
  };
}
