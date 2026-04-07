/**
 * StarknetFaucetButton
 *
 * Self-contained "Get Test STRK" button for use inside:
 *   - Starknet Island lesson headers
 *   - StarkzapSimulatorCard (before first transaction)
 *   - StarknetTrackScreen wallet section
 *
 * Shows claim status, handles cooldown, links to Voyager on success.
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
import {
  claimFaucet, getFaucetStatus,
  voyagerTxUrl, type FaucetResult,
} from '../lib/starknetFaucet';

interface Props {
  walletAddress: string;
  compact?: boolean;           // smaller inline version
  onSuccess?: (result: FaucetResult) => void;
}

export default function StarknetFaucetButton({ walletAddress, compact, onSuccess }: Props) {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<FaucetResult | null>(null);
  const [canClaim, setCanClaim] = useState(true);
  const [hoursLeft, setHoursLeft] = useState(0);

  useEffect(() => {
    getFaucetStatus(walletAddress).then(s => {
      setCanClaim(s.canClaim);
      setHoursLeft(s.hoursRemaining ?? 0);
    });
  }, [walletAddress]);

  const handleClaim = async () => {
    setLoading(true);
    setResult(null);
    try {
      const r = await claimFaucet(walletAddress, 'STRK');
      setResult(r);
      if (r.success) {
        setCanClaim(false);
        setHoursLeft(24);
        onSuccess?.(r);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (result?.success) return (
    <View style={[s.wrap, compact && s.compact]}>
      <View style={s.successRow}>
        <Text style={s.successIcon}>✅</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.successTitle}>10 STRK claimed!</Text>
          <Text style={s.successSub}>Testnet tokens arriving in your wallet</Text>
        </View>
        {result.txHash && (
          <TouchableOpacity
            onPress={() => Linking.openURL(voyagerTxUrl(result.txHash!))}
            style={s.voyagerBtn}
          >
            <Text style={s.voyagerText}>View →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── Error state ────────────────────────────────────────────────────────────
  if (result && !result.success) return (
    <View style={[s.wrap, s.errorWrap, compact && s.compact]}>
      <Text style={s.errorText}>⚠️ {result.error}</Text>
      {result.error?.includes('faucet.starknet.io') && (
        <TouchableOpacity onPress={() => Linking.openURL('https://faucet.starknet.io')}>
          <Text style={s.linkText}>Open faucet.starknet.io →</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Cooldown state ────────────────────────────────────────────────────────
  if (!canClaim) return (
    <View style={[s.wrap, s.cooldownWrap, compact && s.compact]}>
      <Text style={s.cooldownIcon}>⏱</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.cooldownTitle}>Next claim in {hoursLeft}h</Text>
        <Text style={s.cooldownSub}>You already claimed today's testnet STRK</Text>
      </View>
    </View>
  );

  // ── Default / claim state ─────────────────────────────────────────────────
  if (compact) return (
    <TouchableOpacity
      style={[s.compactBtn, loading && { opacity: 0.7 }]}
      onPress={handleClaim}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={s.compactBtnText}>⚡ Get 10 test STRK</Text>
      }
    </TouchableOpacity>
  );

  return (
    <View style={s.wrap}>
      <View style={s.infoRow}>
        <Text style={s.infoIcon}>🪙</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.infoTitle}>You need testnet STRK</Text>
          <Text style={s.infoSub}>
            Free Sepolia tokens to execute real lessons. No real money involved.
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[s.btn, loading && { opacity: 0.7 }]}
        onPress={handleClaim}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={s.btnText}>Claiming from Starknet faucet…</Text>
          </View>
        ) : (
          <Text style={s.btnText}>⚡ Claim 10 test STRK — Free</Text>
        )}
      </TouchableOpacity>
      <Text style={s.hint}>
        Powered by faucet.starknet.io · Sepolia testnet only · 1 claim per 24h
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:         { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: '#ec489930' },
  compact:      { padding: Spacing.sm },
  infoRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  infoIcon:     { fontSize: 24, marginTop: 2 },
  infoTitle:    { fontSize: FontSize.sm, fontWeight: '900', color: Colors.text, marginBottom: 2 },
  infoSub:      { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16 },
  btn:          { backgroundColor: '#ec4899', borderRadius: Radius.full, paddingVertical: 12, alignItems: 'center' },
  btnText:      { color: '#fff', fontSize: FontSize.sm, fontWeight: '800' },
  hint:         { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },
  compactBtn:   { backgroundColor: '#ec4899', borderRadius: Radius.full, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  compactBtnText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '800' },
  successRow:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  successIcon:  { fontSize: 20 },
  successTitle: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.green },
  successSub:   { fontSize: FontSize.xs, color: Colors.textSoft },
  voyagerBtn:   { backgroundColor: Colors.greenSoft, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  voyagerText:  { fontSize: FontSize.xs, fontWeight: '800', color: Colors.green },
  errorWrap:    { backgroundColor: Colors.redSoft, borderColor: Colors.red + '50' },
  errorText:    { fontSize: FontSize.sm, color: Colors.red, fontWeight: '600', marginBottom: Spacing.xs },
  linkText:     { fontSize: FontSize.xs, color: Colors.red, fontWeight: '700', textDecorationLine: 'underline' },
  cooldownWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: '#fffbeb', borderColor: '#fde047' },
  cooldownIcon: { fontSize: 20 },
  cooldownTitle:{ fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  cooldownSub:  { fontSize: FontSize.xs, color: Colors.textSoft },
});
