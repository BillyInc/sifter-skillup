/**
 * starknetSharedSimulators.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚡ Sifter SkillUp — Starknet Shared Simulator Infrastructure
 *
 * Imported by ALL four Starknet tracks:
 *   Island · Navigator · Ecosystem · Builder
 *
 * Contains:
 *   - STARKNET_SEPOLIA config (RPC, explorer, faucet, contract addresses)
 *   - useStarknetSepolia() hook (balance fetching, faucet prompts)
 *   - StarknetAddressBanner, StarknetFaucetSheet, StarknetTxLink (UI)
 *   - STARKNET_SEPOLIA_CONFIG (island-level config object)
 *   - STARKZAP_SIMULATOR_TYPES (canonical type registry for all tracks)
 *   - LABS_1_TO_6_SIMULATOR_MAP (navigator sim → lesson mapping)
 *
 * DO NOT add track-specific simulator components here.
 * Track-specific simulators live in:
 *   island/     → islandSimulators.tsx
 *   navigator/  → navigatorSimulators.tsx
 *   ecosystem/  → ecosystemSimulators.tsx (+ ecosystemAllSimulators.jsx for web)
 *   builder/    → builderSimulators.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius, FontSize } from '../../../theme';
import StarknetFaucetButton from '../../../components/StarknetFaucetButton';

export const STARKNET_SEPOLIA = {
  rpc:          'https://starknet-sepolia.public.blastapi.io',
  rpc_backup:   'https://free-rpc.nethermind.io/sepolia-juno',
  explorer:     'https://sepolia.voyager.online',
  faucet:       'https://starknet-faucet.vercel.app',
  faucet_strk:  'https://blastapi.io/faucets/starknet-sepolia-strk',
  // Contract addresses on Sepolia
  eth_contract:  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  strk_contract: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  usdc_contract: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  // Prominent DeFi on Sepolia
  avnu_router:   '0x03f89c8a56b19fd4c27e6d2f577ba82f2b2f9e9cbec47a6f2b23c76ddb1d543d',
  // Staking on Sepolia (test params: 1 STRK min, 5-min unstake)
  staking:       'https://github.com/starkware-libs/starknet-staking',
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SepoliaBalance {
  eth:  string;
  strk: string;
  loading: boolean;
  error: boolean;
}

export interface SepoliaState {
  address: string | null;
  balance: SepoliaBalance;
  shortAddress: string;
  explorerUrl: string;
  needsFaucet: boolean;
  refreshBalance: () => void;
  openExplorer: () => void;
  copyAddress: () => void;
  copied: boolean;
}

// ── Balance fetcher ───────────────────────────────────────────────────────────

async function fetchStarknetBalance(
  address: string,
  contractAddress: string,
  rpc: string,
): Promise<string> {
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'starknet_call',
        params: [{
          contract_address: contractAddress,
          entry_point_selector: '0x2e4263afad30923c891518314c3c95dbe2c1b44d0ba5a8e8fd75be60b7de5f', // balanceOf
          calldata: [address],
        }, 'latest'],
      }),
    });
    const data = await res.json();
    if (data.result && data.result[0]) {
      const raw = BigInt(data.result[0]);
      return (Number(raw) / 1e18).toFixed(4);
    }
    return '0.0000';
  } catch {
    return '0.0000';
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useStarknetSepolia(address: string | null): SepoliaState {
  const [balance, setBalance] = useState<SepoliaBalance>({
    eth: '0.0000', strk: '0.0000', loading: false, error: false,
  });
  const [copied, setCopied] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setBalance(b => ({ ...b, loading: true, error: false }));
    try {
      const [eth, strk] = await Promise.all([
        fetchStarknetBalance(address, STARKNET_SEPOLIA.eth_contract, STARKNET_SEPOLIA.rpc),
        fetchStarknetBalance(address, STARKNET_SEPOLIA.strk_contract, STARKNET_SEPOLIA.rpc),
      ]);
      setBalance({ eth, strk, loading: false, error: false });
    } catch {
      // Try backup RPC
      try {
        const [eth, strk] = await Promise.all([
          fetchStarknetBalance(address, STARKNET_SEPOLIA.eth_contract, STARKNET_SEPOLIA.rpc_backup),
          fetchStarknetBalance(address, STARKNET_SEPOLIA.strk_contract, STARKNET_SEPOLIA.rpc_backup),
        ]);
        setBalance({ eth, strk, loading: false, error: false });
      } catch {
        setBalance(b => ({ ...b, loading: false, error: true }));
      }
    }
  }, [address]);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  const shortAddress = address
    ? `${address.slice(0, 10)}...${address.slice(-8)}`
    : 'No wallet';

  const needsFaucet = parseFloat(balance.eth) < 0.001 && parseFloat(balance.strk) < 1;

  const openExplorer = () => {
    if (address) Linking.openURL(`${STARKNET_SEPOLIA.explorer}/contract/${address}`);
  };

  const copyAddress = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return {
    address,
    balance,
    shortAddress,
    explorerUrl: address ? `${STARKNET_SEPOLIA.explorer}/contract/${address}` : '',
    needsFaucet,
    refreshBalance: fetchBalances,
    openExplorer,
    copyAddress,
    copied,
  };
}

// ── StarknetAddressBanner ─────────────────────────────────────────────────────
/**
 * Drop this at the top of any starkzap simulator to show the user's
 * Sepolia address, live balances, and faucet access.
 * starkzap still handles all actual transactions.
 *
 * Usage:
 *   <StarknetAddressBanner address={userStarknetAddress} />
 */
export function StarknetAddressBanner({ address }: { address: string | null }) {
  const sepolia = useStarknetSepolia(address);

  if (!address) return null;

  return (
    <View style={sty.banner}>
      <View style={sty.bannerHeader}>
        <Text style={sty.bannerIcon}>⚡</Text>
        <Text style={sty.bannerLabel}>STARKNET SEPOLIA TESTNET</Text>
        {sepolia.balance.loading && <ActivityIndicator size="small" color={Colors.accent} />}
      </View>

      {/* Address row — copyable */}
      <TouchableOpacity onPress={sepolia.copyAddress} style={sty.addressRow} activeOpacity={0.8}>
        <Text style={sty.addressText} numberOfLines={1}>{sepolia.shortAddress}</Text>
        <Text style={[sty.copyHint, { color: sepolia.copied ? Colors.green : Colors.textSoft }]}>
          {sepolia.copied ? '✓ Copied' : '📋'}
        </Text>
      </TouchableOpacity>

      {/* Balances */}
      {!sepolia.balance.error && (
        <View style={sty.balanceRow}>
          <View style={sty.balanceChip}>
            <Text style={sty.balanceLabel}>ETH</Text>
            <Text style={[sty.balanceValue, {
              color: parseFloat(sepolia.balance.eth) > 0.001 ? Colors.green : Colors.red,
            }]}>
              {sepolia.balance.eth}
            </Text>
          </View>
          <View style={sty.balanceChip}>
            <Text style={sty.balanceLabel}>STRK</Text>
            <Text style={[sty.balanceValue, {
              color: parseFloat(sepolia.balance.strk) > 1 ? Colors.green : Colors.red,
            }]}>
              {sepolia.balance.strk}
            </Text>
          </View>
          <TouchableOpacity onPress={sepolia.refreshBalance} style={sty.refreshBtn}>
            <Text style={{ color: Colors.accent, fontSize: FontSize.xs, fontWeight: '700' }}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Faucet prompt when needed */}
      {sepolia.needsFaucet && (
        <View style={sty.faucetRow}>
          <Text style={sty.faucetText}>Need testnet tokens to run this simulator:</Text>
          <View style={{ marginTop: 6 }}>
            <StarknetFaucetButton walletAddress={address} compact onSuccess={() => { void sepolia.refreshBalance(); }} />
          </View>
          <Text style={sty.faucetHint}>ETH may still be required for some Sepolia flows.</Text>
        </View>
      )}

      {/* Explorer link */}
      <TouchableOpacity onPress={sepolia.openExplorer} style={sty.explorerLink}>
        <Text style={sty.explorerLinkText}>View on Voyager Sepolia Explorer →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── FaucetSheet ───────────────────────────────────────────────────────────────
/**
 * Shows faucet instructions in a full card when user has no balance.
 * Use at the start of starkzap sims that need real tokens.
 */
export function StarknetFaucetSheet({
  address, onReady,
}: { address: string | null; onReady?: () => void }) {
  const sepolia = useStarknetSepolia(address);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await sepolia.refreshBalance();
    setChecking(false);
    if (!sepolia.needsFaucet && onReady) onReady();
  };

  if (!address) return null;
  if (!sepolia.needsFaucet) return null;

  return (
    <View style={sty.faucetSheet}>
      <Text style={sty.faucetSheetTitle}>⚡ Fund Your Starknet Sepolia Wallet</Text>
      <Text style={sty.faucetSheetSubtitle}>
        This lesson uses your real Starknet Sepolia address. You need test tokens to interact with the network.
      </Text>

      <StarknetAddressBanner address={address} />

      <View style={sty.faucetSteps}>
        <Text style={sty.faucetStepTitle}>CLAIM TEST STRK IN APP</Text>
        <StarknetFaucetButton walletAddress={address} onSuccess={() => { void sepolia.refreshBalance(); }} />
        <Text style={sty.faucetHint}>
          If a lesson also needs Sepolia ETH for gas, use your preferred public faucet after the STRK claim succeeds.
        </Text>
      </View>

      <TouchableOpacity onPress={handleCheck} style={sty.checkBtn} disabled={checking}>
        {checking
          ? <ActivityIndicator color="#fff" />
          : <Text style={sty.checkBtnText}>I've Funded My Wallet — Check Balance →</Text>}
      </TouchableOpacity>

      <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, textAlign: 'center', marginTop: Spacing.sm }}>
        Tokens arrive in ~30 seconds on Sepolia.
      </Text>
    </View>
  );
}

// ── TxExplorerLink ────────────────────────────────────────────────────────────
/**
 * After starkzap completes a transaction, show an explorer link.
 * Paste the txHash from starkzap's onComplete callback.
 */
export function StarknetTxLink({ txHash }: { txHash: string }) {
  const url = `${STARKNET_SEPOLIA.explorer}/tx/${txHash}`;
  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)} style={sty.txLink}>
      <Text style={sty.txLinkText}>⚡ View transaction on Voyager Sepolia →</Text>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, fontFamily: 'monospace', marginTop: 2 }}>
        {txHash.slice(0, 16)}…{txHash.slice(-8)}
      </Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const sty = StyleSheet.create({
  // Banner
  banner:       { backgroundColor: '#0a0a14', borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1.5, borderColor: '#f97316' + '40' },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bannerIcon:   { fontSize: 16 },
  bannerLabel:  { fontSize: FontSize.xs, fontWeight: '800', color: '#f97316', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },

  addressRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111120', borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.sm },
  addressText:  { fontFamily: 'monospace', fontSize: FontSize.xs, color: '#f97316', flex: 1 },
  copyHint:     { fontSize: FontSize.xs, fontWeight: '700' },

  balanceRow:   { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  balanceChip:  { flex: 1, backgroundColor: '#111120', borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  balanceLabel: { fontSize: 9, fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  balanceValue: { fontSize: FontSize.sm, fontWeight: '900', marginTop: 2 },
  refreshBtn:   { padding: Spacing.sm },

  faucetRow:    { backgroundColor: '#1a0a00', borderRadius: Radius.sm, padding: Spacing.md, borderWidth: 1, borderColor: '#f97316' + '30' },
  faucetText:   { fontSize: FontSize.xs, color: '#f97316', fontWeight: '700' },
  faucetHint:   { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 },

  explorerLink: { alignItems: 'center', paddingVertical: 4 },
  explorerLinkText: { fontSize: FontSize.xs, color: '#f97316', fontWeight: '700' },

  // FaucetSheet
  faucetSheet:      { gap: Spacing.md },
  faucetSheetTitle: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  faucetSheetSubtitle: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
  faucetSteps:      { gap: Spacing.sm },
  faucetStepTitle:  { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  faucetStepRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border },
  faucetStepNum:    { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' },
  checkBtn:         { backgroundColor: '#f97316', borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  checkBtnText:     { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },

  // TxLink
  txLink:     { padding: Spacing.md, backgroundColor: '#0a0a14', borderRadius: Radius.md, borderWidth: 1, borderColor: '#f97316' + '40' },
  txLinkText: { fontSize: FontSize.sm, fontWeight: '800', color: '#f97316' },
});

// ── Island-level Starknet config (matches island/simulators.tsx STARKNET_SEPOLIA_CONFIG) ────
export const STARKNET_SEPOLIA_CONFIG = {
  rpc:            'https://starknet-sepolia.public.blastapi.io',
  rpc_backup:     'https://free-rpc.nethermind.io/sepolia-juno',
  explorer:       'https://sepolia.voyager.online',
  faucet:         'https://starknet-faucet.vercel.app',
  faucet_strk:    'https://blastapi.io/faucets/starknet-sepolia-strk',
  eth_contract:   '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  strk_contract:  '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  usdc_contract:  '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  avnu_router:    '0x03f89c8a56b19fd4c27e6d2f577ba82f2b2f9e9cbec47a6f2b23c76ddb1d543d',
} as const;

// ── Canonical simulator type registry ────────────────────────────────────────
// All valid starkzap-* simulator type strings. Each track uses a subset.
export const STARKZAP_SIMULATOR_TYPES = [
  // ── Core (Island + Navigator + Ecosystem) ────────────────────────────────
  'starkzap-wallet',
  'starkzap-gasless',
  'starkzap-swap',
  'starkzap-btc-swap',
  'starkzap-stake',
  'starkzap-lend',
  'starkzap-borrow',
  'starkzap-dca',
  'starkzap-bridge',
  'starkzap-balance',
  'starkzap-build',
  'starkzap-boss',
  // ── Ecosystem-only ────────────────────────────────────────────────────────
  'starkzap-ecosystem-read',
  'starkzap-gaming-read',
  'starkzap-ecosystem-map',
  'starkzap-mainnet-push',
  'starkzap-package-install',
  // ── Navigator-only (DeFi analysis tools) ─────────────────────────────────
  'starkzap-pool-depth',
  'starkzap-protocol-reader',
  'starkzap-amm-pool',
  'starkzap-range-selector',
  'starkzap-validator-picker',
  'starkzap-stake-exit',
  'starkzap-utilisation-curve',
  'starkzap-health-factor',
  'starkzap-dca-calc',
  'starkzap-yield-dca',
  'starkzap-junior-allocator',
  'starkzap-risk-scorecard',
  'starkzap-loop-builder',
  'starkzap-il-calculator',
  'starkzap-range-builder',
  'starkzap-bridge-lockmint',
  'starkzap-bridge-selector',
  'starkzap-bridge-route',
  'starkzap-bridge-calc',
  'starkzap-bridge-register',
  'starkzap-perps-position',
  'starkzap-confidential',
  'starkzap-flashloan-defence',
  'starkzap-mev-defence',
  'starkzap-liquid-stake',
  'starkzap-treasury-allocator',
  'starkzap-correlation-manager',
  'starkzap-onchain-query',
  'starkzap-backtest',
  // ── Builder-only (Cairo dev toolchain) ───────────────────────────────────
  'cairo-typecheck',
  'cairo-invoke',
  'cairo-deploy',
  'cairo-snforge',
  'cairo-starkzap',
  'cairo-audit',
  'cairo-build',
  'cairo-boss',
] as const;

export type StarkzapSimulatorType = typeof STARKZAP_SIMULATOR_TYPES[number];

// ── Navigator sim → lesson mapping (from StarkzapSimulatorCard_v4_switchblock.ts) ──
export const LABS_1_TO_6_SIMULATOR_MAP = {
  'starkzap-pool-depth':        { lesson: 'prices-markets-liquidity',       lab: 1 },
  'starkzap-protocol-reader':   { lesson: 'reading-defi-data',              lab: 1 },
  'starkzap-wallet':            { lesson: 'first-defi-transaction',         lab: 1 },
  'starkzap-amm-pool':          { lesson: 'how-amms-work',                  lab: 2 },
  'starkzap-range-selector':    { lesson: 'concentrated-liquidity-ekubo',   lab: 2 },
  'starkzap-swap':              { lesson: 'avnu-aggregation',               lab: 2 },
  'starkzap-dca':               { lesson: 'advanced-swap-strategies',       lab: 2 },
  'starkzap-validator-picker':  { lesson: 'validator-selection',            lab: 3 },
  'starkzap-stake':             { lesson: 'staking-position-management',    lab: 3 },
  'starkzap-stake-exit':        { lesson: 'exiting-staking-positions',      lab: 3 },
  'starkzap-utilisation-curve': { lesson: 'how-lending-protocols-work',     lab: 4 },
  'starkzap-lend':              { lesson: 'supplying-assets-earning-yield', lab: 4 },
  'starkzap-health-factor':     { lesson: 'collateral-health-factor',       lab: 4 },
  'starkzap-borrow':            { lesson: 'borrowing-strategies',           lab: 4 },
  'starkzap-dca-calc':          { lesson: 'mathematics-of-dca',             lab: 5 },
  'starkzap-yield-dca':         { lesson: 'combining-dca-strategies',       lab: 5 },
  'starkzap-junior-allocator':  { lesson: 'asset-allocation-frameworks',    lab: 6 },
  'starkzap-risk-scorecard':    { lesson: 'protocol-risk-assessment',       lab: 6 },
  'starkzap-loop-builder':      { lesson: 'cross-protocol-strategies',      lab: 6 },
} as const;
