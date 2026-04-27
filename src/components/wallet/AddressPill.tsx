import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../../theme';

export interface AddressPillProps {
  label: string;
  address: string | null;
  chain: string;
  balance?: string;
  variant?: 'mine' | 'theirs' | 'contract';
  onCreateWallet?: () => void;
  explorerBase?: string;
  faucetUrl?: string;
  faucetLabel?: string;
  compact?: boolean;
}

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
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const accent = useMemo(() => {
    switch (variant) {
      case 'theirs':
        return colors.green;
      case 'contract':
        return colors.gold;
      default:
        return colors.accent;
    }
  }, [colors.accent, colors.gold, colors.green, variant]);

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
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
      <View style={[styles.shell, { borderColor: `${accent}40`, backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.noWallet, { color: colors.textSoft }]}>No wallet connected yet</Text>
        {onCreateWallet ? (
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: accent }]}
            onPress={onCreateWallet}
            activeOpacity={0.85}
          >
            <Text style={styles.createBtnText}>Create testnet wallet</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.shell, compact && styles.compact, { borderColor: `${accent}40`, backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: accent }]}>{label}</Text>
        {balance ? (
          <View style={[styles.balanceBadge, { backgroundColor: `${accent}18` }]}>
            <Text style={[styles.balanceText, { color: accent }]}>{balance}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.addressRow} onPress={copy} activeOpacity={0.75}>
        <Text style={[styles.address, { color: colors.text }]} numberOfLines={1}>
          {compact ? shortAddr : address}
        </Text>
        <Text style={[styles.copyIcon, { color: accent }]}>{copied ? 'Copied' : 'Copy'}</Text>
      </TouchableOpacity>

      {!compact ? (
        <View style={styles.actions}>
          <Text style={[styles.chainTag, { color: colors.textMuted }]}>{chain}</Text>
          {explorerBase ? (
            <TouchableOpacity onPress={openExplorer}>
              <Text style={[styles.actionLink, { color: accent }]}>Explorer</Text>
            </TouchableOpacity>
          ) : null}
          {faucetUrl ? (
            <TouchableOpacity onPress={openFaucet}>
              <Text style={[styles.actionLink, { color: colors.gold }]}>{faucetLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
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
    fontSize: FontSize.xs,
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
