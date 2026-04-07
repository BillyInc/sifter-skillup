/**
 * StarkzapSimulatorCard — v2
 *
 * Changes from v1:
 *  1. SimHeader, ActionBtn, TxResult, InfoRow, DemoBadge, simulateDelay
 *     are now EXPORTED so Lab 8 bridge simulators can import them.
 *  2. New simulator types added to the switch statement:
 *     starkzap-bridge-lockmint  — Lab 8 Lesson 1
 *     starkzap-bridge-selector  — Lab 8 Lesson 2
 *     starkzap-bridge-route     — Lab 8 Lesson 3
 *     starkzap-bridge-calc      — Lab 8 Lesson 4
 *     starkzap-bridge-register  — Lab 8 Lesson 5
 *
 * All other content is identical to v1.
 * Replace StarkzapSimulatorCard.tsx with this file.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Linking,
} from 'react-native';
import { useAuth } from '../../../../hooks/useAuth';
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../../../lib/starkzap';
import { Spacing, Radius, FontSize, useTheme } from '../../../../theme';

// ── Lab 8 bridge simulators ────────────────────────────────────────────────────
import {
  BridgeLockMintSim,
  BridgeSelectorSim,
  BridgeRouteSim,
  BridgeCalcSim,
  BridgeRegisterSim,
} from '../lab8/navigatorLab8_simulators';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  simulatorType: string;
  onComplete: () => void;
  onSkip: () => void;
}

// ─── Shared UI components — EXPORTED for use in sub-simulator files ────────────

export function SimHeader({ icon, title, subtitle, colors }: {
  icon: string; title: string; subtitle: string; colors: any;
}) {
  return (
    <View style={[sH.wrap, { backgroundColor: colors.accentSoft }]}>
      <Text style={sH.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[sH.label, { color: colors.accent }]}>⚡ STARKNET LIVE</Text>
        <Text style={[sH.title, { color: colors.text }]}>{title}</Text>
        <Text style={[sH.sub, { color: colors.textSoft }]}>{subtitle}</Text>
      </View>
    </View>
  );
}
const sH = StyleSheet.create({
  wrap:  { flexDirection: 'row', gap: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md },
  icon:  { fontSize: 36, lineHeight: 44 },
  label: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: FontSize.lg, fontWeight: '900', lineHeight: 24, marginTop: 2 },
  sub:   { fontSize: FontSize.sm, lineHeight: 18, marginTop: 2 },
});

export function ActionBtn({ label, onPress, loading, disabled, variant = 'primary', colors }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'starknet'; colors: any;
}) {
  const bg = variant === 'primary' ? colors.accent
    : variant === 'starknet' ? '#ec4899'
    : 'transparent';
  const border = variant === 'ghost' ? colors.border : 'transparent';
  const txtColor = variant === 'ghost' ? colors.textSoft : '#fff';
  return (
    <TouchableOpacity
      style={[aB.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'ghost' ? 1.5 : 0 },
        (loading || disabled) && { opacity: 0.5 }]}
      onPress={onPress} disabled={loading || disabled} activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={txtColor} size="small" />
        : <Text style={[aB.txt, { color: txtColor }]}>{label}</Text>}
    </TouchableOpacity>
  );
}
const aB = StyleSheet.create({
  btn: { borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  txt: { fontSize: FontSize.md, fontWeight: '800' },
});

export function TxResult({ hash, label, colors }: { hash: string; label?: string; colors: any }) {
  const short = hash.slice(0, 10) + '...' + hash.slice(-6);
  return (
    <View style={[tR.wrap, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
      <Text style={tR.icon}>✅</Text>
      <View style={{ flex: 1 }}>
        <Text style={[tR.title, { color: colors.green }]}>{label ?? 'Transaction confirmed'}</Text>
        <Text style={[tR.hash, { color: colors.textSoft }]}>{short}</Text>
      </View>
      <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.voyager.online/tx/${hash}`)}>
        <Text style={[tR.link, { color: colors.accent }]}>View →</Text>
      </TouchableOpacity>
    </View>
  );
}
const tR = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.md },
  icon:  { fontSize: 20 },
  title: { fontSize: FontSize.sm, fontWeight: '800' },
  hash:  { fontSize: FontSize.xs, marginTop: 2 },
  link:  { fontSize: FontSize.sm, fontWeight: '700' },
});

export function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={[iR.row, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
      <Text style={iR.icon}>{icon}</Text>
      <Text style={[iR.label, { color: colors.textSoft }]}>{label}</Text>
      <Text style={[iR.value, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}
const iR = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.xs },
  icon:  { fontSize: 16, width: 24, textAlign: 'center' },
  label: { flex: 1, fontSize: FontSize.sm },
  value: { fontSize: FontSize.sm, fontWeight: '700', maxWidth: '50%' },
});

export function DemoBadge({ colors }: { colors: any }) {
  if (isStarkzapAvailable()) return null;
  return (
    <View style={[dB.wrap, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
      <Text style={[dB.text, { color: colors.gold }]}>
        🧪 Demo mode — install starkzap-native for real Sepolia transactions
      </Text>
    </View>
  );
}
const dB = StyleSheet.create({
  wrap: { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, marginBottom: Spacing.md },
  text: { fontSize: FontSize.xs, fontWeight: '600', textAlign: 'center' },
});

export async function simulateDelay(ms = 2000) {
  return new Promise<void>(r => setTimeout(r, ms));
}

// ─── Helper — get or create wallet ────────────────────────────────────────────

async function getWallet(starknetWallet: any): Promise<StarkzapWallet | null> {
  if (starknetWallet) return starknetWallet as StarkzapWallet;
  if (!isStarkzapAvailable()) return null;
  try {
    const { StarkSigner } = require('starkzap-native');
    const key = process.env.EXPO_PUBLIC_DEMO_STARK_KEY ?? '0x1';
    return await starkzapSdk.connectWallet({
      account: { signer: new StarkSigner(key) },
      deploy: 'if_needed',
      feeMode: 'sponsored',
    });
  } catch { return null; }
}

// ─── Individual simulators (unchanged from v1) ─────────────────────────────────

function WalletSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const address = (starknetWallet as any)?.address ?? MOCK.walletAddress;

  const handleFetch = async () => {
    setLoading(true);
    await simulateDelay(1200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const bal = await w.balanceOf(STARKNET_TOKENS.STRK);
        setBalance(bal.toFormatted());
      } catch { setBalance(MOCK.strkBalance); }
    } else {
      setBalance(MOCK.strkBalance);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="👛" title="Connect Wallet" subtitle="View your Starknet account and STRK balance." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="🔑" label="Address" value={address} colors={colors} />
      {balance && <InfoRow icon="💰" label="STRK Balance" value={balance} colors={colors} />}
      {!balance
        ? <ActionBtn label={loading ? '' : '👛 Fetch Balance'} onPress={handleFetch} loading={loading} colors={colors} />
        : <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function GaslessSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.transfer(STARKNET_TOKENS.STRK, [
          { to: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', amount: { toUnit: () => '1000000000000000000' } as any },
        ]);
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⚡" title="Gasless Transaction" subtitle="Send 1 STRK with zero gas — sponsored by a paymaster." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="💸" label="Send" value="1 STRK" colors={colors} />
      <InfoRow icon="⛽" label="Gas fee" value="$0.00 — sponsored" colors={colors} />
      {txHash
        ? <><TxResult hash={txHash} label="Gasless transfer confirmed" colors={colors} /><ActionBtn label="Continue →" onPress={onComplete} colors={colors} /></>
        : <ActionBtn label={loading ? '' : '⚡ Send Gasless'} onPress={handleSend} loading={loading} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function SwapSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [quote, setQuote] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuote = async () => {
    setLoading(true);
    await simulateDelay(1200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const q = await w.getQuote({
          tokenIn: STARKNET_TOKENS.STRK, tokenOut: STARKNET_TOKENS.USDC,
          amountIn: { toUnit: () => '100000000000000000000' } as any,
        });
        const usdc = Number(q.amountOutBase) / 1e6;
        setQuote(`≈ ${usdc.toFixed(2)} USDC`);
      } catch { setQuote(MOCK.swapQuote.to); }
    } else {
      setQuote(MOCK.swapQuote.to);
    }
    setLoading(false);
  };

  const handleSwap = async () => {
    setLoading(true);
    await simulateDelay(2500);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.swap({
          tokenIn: STARKNET_TOKENS.STRK, tokenOut: STARKNET_TOKENS.USDC,
          amountIn: { toUnit: () => '100000000000000000000' } as any, slippageBps: BigInt(50),
        });
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔄" title="Swap STRK → USDC" subtitle="Get a live quote from AVNU, then execute the swap." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="📤" label="Sell" value="100 STRK" colors={colors} />
      {quote && <InfoRow icon="📥" label="Receive" value={quote} colors={colors} />}
      {txHash
        ? <><TxResult hash={txHash} label="Swap confirmed on AVNU" colors={colors} /><ActionBtn label="Continue →" onPress={onComplete} colors={colors} /></>
        : !quote
          ? <ActionBtn label={loading ? '' : '📊 Get Quote'} onPress={handleQuote} loading={loading} colors={colors} />
          : <ActionBtn label={loading ? '' : '🔄 Swap Now'} onPress={handleSwap} loading={loading} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function StakeSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStake = async () => {
    setLoading(true);
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const pool = '0x0000000000000000000000000000000000000001';
        const tx = await w.stake(pool, { toUnit: () => '10000000000000000000' } as any);
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🏦" title="Stake STRK" subtitle="Stake 10 STRK into a delegation pool to earn rewards." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="🪙" label="Stake" value="10 STRK" colors={colors} />
      <InfoRow icon="📈" label="APY" value={MOCK.poolApy} colors={colors} />
      {txHash
        ? <><TxResult hash={txHash} label="Staked successfully" colors={colors} /><ActionBtn label="Continue →" onPress={onComplete} colors={colors} /></>
        : <ActionBtn label={loading ? '' : '🏦 Stake 10 STRK'} onPress={handleStake} loading={loading} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function LendSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLend = async () => {
    setLoading(true);
    await simulateDelay(2200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.lending().deposit({
          token: STARKNET_TOKENS.USDC,
          amount: { toUnit: () => '5000000' } as any,
        });
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="💵" title="Deposit to Vesu" subtitle="Supply 5 USDC to the Vesu lending market on Starknet." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="💵" label="Deposit" value="5 USDC" colors={colors} />
      <InfoRow icon="🏦" label="Protocol" value="Vesu — Starknet lending" colors={colors} />
      {txHash
        ? <><TxResult hash={txHash} label="USDC deposited to Vesu" colors={colors} /><ActionBtn label="Continue →" onPress={onComplete} colors={colors} /></>
        : <ActionBtn label={loading ? '' : '💵 Deposit 5 USDC'} onPress={handleLend} loading={loading} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function DcaSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    await simulateDelay(1200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const p = await w.dca().previewCycle({
          tokenIn: STARKNET_TOKENS.USDC, tokenOut: STARKNET_TOKENS.STRK,
          amountPerCycle: { toUnit: () => '10000000' } as any,
        });
        const strk = Number(p.amountOutBase) / 1e18;
        setPreview(`≈ ${strk.toFixed(2)} STRK per cycle`);
      } catch { setPreview('≈ 12.4 STRK per cycle'); }
    } else {
      setPreview('≈ 12.4 STRK per cycle');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    await simulateDelay(2500);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.dca().create({
          tokenIn: STARKNET_TOKENS.USDC, tokenOut: STARKNET_TOKENS.STRK,
          amountPerCycle: { toUnit: () => '10000000' } as any,
          cycleSeconds: BigInt(7 * 24 * 3600), cycles: BigInt(12),
        });
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📅" title="Create DCA Order" subtitle="Buy STRK weekly with $10 USDC for 12 weeks automatically." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="💰" label="Buy" value="STRK" colors={colors} />
      <InfoRow icon="💵" label="Spend" value="$10 USDC per week" colors={colors} />
      <InfoRow icon="🔄" label="Duration" value="12 weeks" colors={colors} />
      {preview && <InfoRow icon="📊" label="Est. output" value={preview} colors={colors} />}
      {txHash
        ? <><TxResult hash={txHash} label="DCA order created — runs weekly" colors={colors} /><ActionBtn label="Continue →" onPress={onComplete} colors={colors} /></>
        : !preview
          ? <ActionBtn label={loading ? '' : '📊 Preview'} onPress={handlePreview} loading={loading} colors={colors} />
          : <ActionBtn label={loading ? '' : '📅 Create DCA Order'} onPress={handleCreate} loading={loading} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function BuildSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛠️" title="Integration Challenge" subtitle="Apply Starkzap SDK to a real scenario." colors={colors} />
      <View style={{ backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '900', marginBottom: Spacing.sm }}>Challenge</Text>
        <Text style={{ color: colors.textSoft, fontSize: FontSize.sm, lineHeight: 20 }}>
          A DeFi app wants to offer users: (1) gasless onboarding via email, (2) auto-stake any STRK received, (3) a weekly DCA into USDC.{'\n\n'}
          Design the wallet configuration and write the three Starkzap SDK calls needed. The pattern: connectWallet → stake → dca().create
        </Text>
      </View>
      <ActionBtn label="Mark as Complete" onPress={onComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function BossSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [step, setStep] = useState<'swap' | 'stake' | 'lend' | 'done'>('swap');
  const [loading, setLoading] = useState(false);
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});

  const steps = [
    { key: 'swap',  icon: '🔄', label: 'Swap 1 STRK → USDC',    done: !!txHashes.swap },
    { key: 'stake', icon: '🏦', label: 'Stake 10 STRK',          done: !!txHashes.stake },
    { key: 'lend',  icon: '💵', label: 'Deposit 5 USDC to Vesu', done: !!txHashes.lend },
  ];

  const handleStep = async (stepKey: string) => {
    setLoading(true);
    await simulateDelay(2500);
    const hash = MOCK.txHash.slice(0, -4) + Math.random().toString(16).slice(2, 6);
    setTxHashes(prev => ({ ...prev, [stepKey]: hash }));
    setLoading(false);
    if (stepKey === 'swap')  setStep('stake');
    if (stepKey === 'stake') setStep('lend');
    if (stepKey === 'lend')  setStep('done');
  };

  const allDone = steps.every(s => !!txHashes[s.key]);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⭐" title="Island Boss — DeFi Navigator" subtitle="Complete 3 real Starknet transactions to finish the island." colors={colors} />
      <DemoBadge colors={colors} />
      {steps.map(s => (
        <View key={s.key} style={[{ borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1,
          borderColor: s.done ? (colors.green + '40') : colors.border,
          backgroundColor: s.done ? colors.greenSoft : colors.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <Text style={{ fontSize: 24 }}>{s.done ? '✅' : s.icon}</Text>
            <Text style={[{ flex: 1, fontSize: FontSize.sm, fontWeight: '800', color: s.done ? colors.green : colors.text }]}>{s.label}</Text>
            {!s.done && step === s.key && (
              <TouchableOpacity
                style={{ backgroundColor: '#ec4899', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}
                onPress={() => handleStep(s.key)} disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.xs }}>Execute</Text>}
              </TouchableOpacity>
            )}
          </View>
          {txHashes[s.key] && (
            <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.voyager.online/tx/${txHashes[s.key]}`)}>
              <Text style={{ fontSize: FontSize.xs, color: colors.accent, marginTop: 4, fontWeight: '600' }}>
                {txHashes[s.key].slice(0, 12)}... → View on Voyager
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {allDone && (
        <>
          <View style={{ backgroundColor: '#ec4899' + '15', borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>⭐</Text>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '900', color: '#ec4899', marginTop: Spacing.sm }}>Island Complete!</Text>
            <Text style={{ color: colors.textSoft, fontSize: FontSize.sm, textAlign: 'center', marginTop: 4 }}>You executed 3 real Starknet transactions.</Text>
          </View>
          <ActionBtn label="Complete Island →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}
      {!allDone && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function StarkzapSimulatorCard({ simulatorType, onComplete, onSkip }: Props) {
  const { colors } = useTheme();
  const props = { onComplete, onSkip, colors };

  switch (simulatorType) {
    // ── Original Starknet Island simulators (unchanged) ──────────────────────
    case 'starkzap-wallet':  return <WalletSim   {...props} />;
    case 'starkzap-gasless': return <GaslessSim  {...props} />;
    case 'starkzap-swap':    return <SwapSim     {...props} />;
    case 'starkzap-stake':   return <StakeSim    {...props} />;
    case 'starkzap-lend':    return <LendSim     {...props} />;
    case 'starkzap-dca':     return <DcaSim      {...props} />;
    case 'starkzap-build':   return <BuildSim    {...props} />;
    case 'starkzap-boss':    return <BossSim     {...props} />;

    // ── Lab 8 Bridge simulators (React Native, time-accelerated mocks) ────────
    case 'starkzap-bridge-lockmint':  return <BridgeLockMintSim  {...props} />;
    case 'starkzap-bridge-selector':  return <BridgeSelectorSim  {...props} />;
    case 'starkzap-bridge-route':     return <BridgeRouteSim     {...props} />;
    case 'starkzap-bridge-calc':      return <BridgeCalcSim      {...props} />;
    case 'starkzap-bridge-register':  return <BridgeRegisterSim  {...props} />;

    default:
      return (
        <View style={{ padding: Spacing.xl, alignItems: 'center', gap: Spacing.md }}>
          <Text style={{ fontSize: 32 }}>⚡</Text>
          <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '800' }}>Starknet Simulator</Text>
          <Text style={{ color: colors.textSoft, fontSize: FontSize.sm, textAlign: 'center' }}>
            Simulator type "{simulatorType}" coming soon.
          </Text>
          <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
        </View>
      );
  }
}
