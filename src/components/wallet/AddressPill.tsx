/**
 * Sifter Skill_Up — AddressPill
 * NEW FILE: src/components/wallet/AddressPill.tsx
 *
 * Reusable wallet address display with copy, explorer link,
 * balance, and faucet button. Works for ALL chains without
 * any browser extension.
 *
 * Referenced by: walletEnhancedSims, island06SolanaSimulatorDefs, etc.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../theme';

export interface AddressPillProps {
  label:          string;           // e.g. "Your Wallet", "Your Staking Wallet"
  address:        string | null;
  chain:          string;           // e.g. 'solana-devnet'
  balance?:       string;           // e.g. "5.0 SOL"
  variant?:       'mine' | 'theirs' | 'contract';
  onCreateWallet?: () => void;      // shown when address is null
  explorerBase?:  string;
  faucetUrl?:     string;
  faucetLabel?:   string;
  compact?:       boolean;
}

const VARIANT_COLORS: Record<string, string> = {
  mine:     Colors.accent,
  theirs:   Colors.green,
  contract: Colors.gold,
};

export default function AddressPill({
  label,
  address,
  chain,
  balance,
  variant = 'mine',
  onCreateWallet,
  explorerBase,
  faucetUrl,
  faucetLabel = 'Get test tokens',
  compact = false,
}: AddressPillProps) {
  const [copied, setCopied] = useState(false);
  const color = VARIANT_COLORS[variant] ?? Colors.accent;

  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null;

  const copy = async () => {
    if (!address) return;
    try {
      await Clipboard.setStringAsync(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const openExplorer = () => {
    if (!address || !explorerBase) return;
    Linking.openURL(`${explorerBase}/address/${address}`).catch(() => {});
  };

  const openFaucet = () => {
    if (!faucetUrl) return;
    Linking.openURL(faucetUrl).catch(() => {});
  };

  if (!address) {
    return (
      <View style={[styles.shell, { borderColor: color + '40' }]}>
        <Text style={[styles.label, { color: Colors.textMuted }]}>{label}</Text>
        <Text style={styles.noWallet}>No wallet yet</Text>
        {onCreateWallet && (
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: color }]}
            onPress={onCreateWallet}
          >
            <Text style={styles.createBtnText}>Create Testnet Wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.shell, { borderColor: color + '40' }, compact && styles.compact]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: color }]}>{label}</Text>
        {balance && (
          <View style={[styles.balanceBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.balanceText, { color }]}>{balance}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.addressRow} onPress={copy} activeOpacity={0.7}>
        <Text style={[styles.address, { color: Colors.text }]} numberOfLines={1}>
          {compact ? shortAddr : address}
        </Text>
        <Text style={[styles.copyIcon, { color }]}>
          {copied ? '✓' : '⎘'}
        </Text>
      </TouchableOpacity>

      {!compact && (
        <View style={styles.actions}>
          <Text style={[styles.chainTag, { color: Colors.textMuted }]}>
            {chain}
          </Text>
          {explorerBase && (
            <TouchableOpacity onPress={openExplorer}>
              <Text style={[styles.actionLink, { color }]}>Explorer ↗</Text>
            </TouchableOpacity>
          )}
          {faucetUrl && (
            <TouchableOpacity onPress={openFaucet}>
              <Text style={[styles.actionLink, { color: Colors.gold }]}>
                {faucetLabel} →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.bgSecondary ?? '#EBEBF5',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  compact: {
    padding: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  balanceBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  balanceText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  address: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: Platform.select({ web: 'monospace', default: undefined }),
    fontWeight: FontWeight.medium,
  },
  copyIcon: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  chainTag: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  actionLink: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  noWallet: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  createBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  createBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
