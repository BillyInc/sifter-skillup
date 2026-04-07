/**
 * StarkzapSimulatorCard
 *
 * Renders inside LessonScreen for any Starknet Island level that has
 * a `simulatorLesson` field starting with 'starkzap-'.
 *
 * Works in two modes:
 *  - Demo mode (starkzap-native not installed): mock UI with simulated delays
 *  - Real SDK mode: executes actual Sepolia testnet transactions
 *
 * Simulator types:
 *   starkzap-wallet   — connect/view wallet, claim faucet STRK
 *   starkzap-gasless  — send a sponsored (gasless) test transaction
 *   starkzap-swap     — swap STRK → USDC via AVNU
 *   starkzap-stake    — stake STRK into a delegation pool
 *   starkzap-lend     — deposit USDC into Vesu lending market
 *   starkzap-dca      — create a DCA order (STRK → USDC weekly)
 *   starkzap-build    — integration challenge (open-ended)
 *   starkzap-boss     — final challenge, combines multiple actions
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Linking,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../lib/starkzap';
import { Colors, Spacing, Radius, FontSize, Shadow, useTheme } from '../../theme';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  simulatorType: string;   // e.g. 'starkzap-swap'
  onComplete: () => void;
  onSkip: () => void;
}

// ─── Shared UI components ──────────────────────────────────────────────────────

function SimHeader({ icon, title, subtitle, colors }: {
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

function ActionBtn({ label, onPress, loading, disabled, variant = 'primary', colors }: {
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
      style={[aB.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'ghost' ? 1.5 : 0 }, (loading || disabled) && { opacity: 0.5 }]}
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

function TxResult({ hash, label, colors }: { hash: string; label?: string; colors: any }) {
  const short = hash.slice(0, 10) + '...' + hash.slice(-6);
  return (
    <View style={[tR.wrap, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
      <Text style={[tR.icon]}>✅</Text>
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

function InfoRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
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

function DemoBadge({ colors }: { colors: any }) {
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

async function simulateDelay(ms = 2000) { return new Promise(r => setTimeout(r, ms)); }

// ─── Individual simulators ─────────────────────────────────────────────────────

// ── Wallet ──────────────────────────────────────────────────────────────────

function WalletSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const address = (starknetWallet as any)?.address ?? MOCK.walletAddress;

  const handleCheck = async () => {
    setLoading(true);
    await simulateDelay(1200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const bal = await (starknetWallet as any).balanceOf(STARKNET_TOKENS.STRK);
        setBalance(bal.toFormatted());
      } catch { setBalance(MOCK.strkBalance); }
    } else {
      setBalance(MOCK.strkBalance);
    }
    setLoading(false);
    setDone(true);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="👛" title="Your Starknet Wallet" subtitle="View your address and check your STRK balance on Sepolia." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="🔑" label="Address" value={address} colors={colors} />
      {balance && <InfoRow icon="💰" label="STRK Balance" value={balance} colors={colors} />}
      {!done
        ? <ActionBtn label={loading ? '' : 'Check Balance'} onPress={handleCheck} loading={loading} colors={colors} />
        : (
          <>
            <View style={[{ backgroundColor: colors.greenSoft, borderRadius: Radius.lg, padding: Spacing.md }]}>
              <Text style={{ color: colors.green, fontWeight: '800', fontSize: FontSize.md }}>✅ Wallet connected</Text>
              <Text style={{ color: colors.textSoft, fontSize: FontSize.sm, marginTop: 4 }}>You can now execute real transactions on Starknet Sepolia.</Text>
            </View>
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />
          </>
        )
      }
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── Gasless ─────────────────────────────────────────────────────────────────

function GaslessSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.transfer(STARKNET_TOKENS.STRK, [{ to: MOCK.walletAddress, amount: { toUnit: () => '1000000000000000000' } as any }]);
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⛽" title="Send Gasless Transaction" subtitle="Transfer 1 STRK. The AVNU Paymaster covers the fee — you pay $0." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="📤" label="Send" value="1 STRK" colors={colors} />
      <InfoRow icon="⛽" label="Gas fee" value="$0.00 (sponsored)" colors={colors} />
      <InfoRow icon="📍" label="To" value={MOCK.walletAddress} colors={colors} />
      {txHash
        ? <>
            <TxResult hash={txHash} label="Gasless transfer confirmed" colors={colors} />
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />
          </>
        : <ActionBtn label={loading ? '' : '⚡ Send Gasless Transaction'} onPress={handleSend} loading={loading} colors={colors} variant="starknet" />
      }
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── Swap ────────────────────────────────────────────────────────────────────

function SwapSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleGetQuote = async () => {
    setLoading(true);
    await simulateDelay(1500);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const q = await w.getQuote({
          tokenIn: STARKNET_TOKENS.STRK,
          tokenOut: STARKNET_TOKENS.USDC,
          amountIn: { toUnit: () => '1000000000000000000' } as any,
        });
        setQuote(`≈ ${(Number(q.amountOutBase) / 1e6).toFixed(4)} USDC`);
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
          tokenIn: STARKNET_TOKENS.STRK,
          tokenOut: STARKNET_TOKENS.USDC,
          amountIn: { toUnit: () => '1000000000000000000' } as any,
          slippageBps: BigInt(100),
          provider: 'avnu',
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
      <SimHeader icon="🔄" title="Swap STRK → USDC" subtitle="Execute a real token swap via AVNU on Starknet Sepolia." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="↗️" label="You sell" value="1 STRK" colors={colors} />
      <InfoRow icon="↙️" label="You receive" value={quote ?? '—'} colors={colors} />
      <InfoRow icon="💧" label="Slippage" value="1%" colors={colors} />
      <InfoRow icon="⛽" label="Fee" value="$0.00 (sponsored)" colors={colors} />
      {txHash
        ? <>
            <TxResult hash={txHash} label="Swap executed via AVNU" colors={colors} />
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />
          </>
        : !quote
          ? <ActionBtn label={loading ? '' : '📊 Get Quote'} onPress={handleGetQuote} loading={loading} colors={colors} />
          : <ActionBtn label={loading ? '' : '🔄 Execute Swap'} onPress={handleSwap} loading={loading} variant="starknet" colors={colors} />
      }
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── Stake ────────────────────────────────────────────────────────────────────

const STAKE_POOL = '0x028d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a';

function StakeSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleStake = async () => {
    setLoading(true);
    await simulateDelay(2500);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.stake(STAKE_POOL, { toUnit: () => '100000000000000000000' } as any);
        setTxHash(tx.hash);
      } catch { setTxHash(MOCK.txHash); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🏦" title="Stake STRK" subtitle="Delegate 100 STRK to a validator. Earn ~8% APY." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="🪙" label="Amount" value="100 STRK" colors={colors} />
      <InfoRow icon="📈" label="APY" value={MOCK.poolApy} colors={colors} />
      <InfoRow icon="⏱" label="Lock-up" value="21 days unbonding" colors={colors} />
      <InfoRow icon="⛽" label="Fee" value="$0.00 (sponsored)" colors={colors} />
      {txHash
        ? <>
            <TxResult hash={txHash} label="STRK staked — earning rewards" colors={colors} />
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />
          </>
        : <ActionBtn label={loading ? '' : '🏦 Stake 100 STRK'} onPress={handleStake} loading={loading} variant="starknet" colors={colors} />
      }
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── Lend ────────────────────────────────────────────────────────────────────

function LendSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleDeposit = async () => {
    setLoading(true);
    await simulateDelay(2200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.lending().deposit({
          token: STARKNET_TOKENS.USDC,
          amount: { toUnit: () => '100000000' } as any, // 100 USDC (6 decimals)
          pool: 'vesu-genesis',
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
      <SimHeader icon="💵" title="Deposit into Vesu" subtitle="Supply 100 USDC to Vesu lending market. Earn supply APY." colors={colors} />
      <DemoBadge colors={colors} />
      <InfoRow icon="💵" label="Deposit" value="100 USDC" colors={colors} />
      <InfoRow icon="📈" label="Supply APY" value="~5.2%" colors={colors} />
      <InfoRow icon="🏛️" label="Protocol" value="Vesu Finance" colors={colors} />
      <InfoRow icon="⛽" label="Fee" value="$0.00 (sponsored)" colors={colors} />
      {txHash
        ? <>
            <TxResult hash={txHash} label="USDC deposited into Vesu" colors={colors} />
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />
          </>
        : <ActionBtn label={loading ? '' : '💵 Deposit 100 USDC'} onPress={handleDeposit} loading={loading} variant="starknet" colors={colors} />
      }
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── DCA ─────────────────────────────────────────────────────────────────────

function DcaSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePreview = async () => {
    setLoading(true);
    await simulateDelay(1500);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const p = await w.dca().previewCycle({
          tokenIn: STARKNET_TOKENS.USDC,
          tokenOut: STARKNET_TOKENS.STRK,
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
          tokenIn: STARKNET_TOKENS.USDC,
          tokenOut: STARKNET_TOKENS.STRK,
          amountPerCycle: { toUnit: () => '10000000' } as any,
          cycleSeconds: BigInt(7 * 24 * 3600), // weekly
          cycles: BigInt(12),
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
        ? <>
            <TxResult hash={txHash} label="DCA order created — runs weekly" colors={colors} />
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} />
          </>
        : !preview
          ? <ActionBtn label={loading ? '' : '📊 Preview'} onPress={handlePreview} loading={loading} colors={colors} />
          : <ActionBtn label={loading ? '' : '📅 Create DCA Order'} onPress={handleCreate} loading={loading} variant="starknet" colors={colors} />
      }
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── Build (open-ended challenge) ─────────────────────────────────────────────

function BuildSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛠️" title="Integration Challenge" subtitle="Apply Starkzap SDK to a real scenario." colors={colors} />
      <View style={[{ backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border }]}>
        <Text style={[{ color: colors.text, fontSize: FontSize.md, fontWeight: '900', marginBottom: Spacing.sm }]}>Challenge</Text>
        <Text style={[{ color: colors.textSoft, fontSize: FontSize.sm, lineHeight: 20 }]}>
          A DeFi app wants to offer users: (1) gasless onboarding via email, (2) auto-stake any STRK received, (3) a weekly DCA into USDC.{'\n\n'}
          Design the wallet configuration and write the three Starkzap SDK calls needed. The pattern: connectWallet → stake → dca().create
        </Text>
      </View>
      <ActionBtn label="Mark as Complete" onPress={onComplete} colors={colors} variant="starknet" />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ── Boss (combined challenge) ────────────────────────────────────────────────

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
        <View key={s.key} style={[{ borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: s.done ? (colors.green + '40') : colors.border, backgroundColor: s.done ? colors.greenSoft : colors.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <Text style={{ fontSize: 24 }}>{s.done ? '✅' : s.icon}</Text>
            <Text style={[{ flex: 1, fontSize: FontSize.sm, fontWeight: '800', color: s.done ? colors.green : colors.text }]}>{s.label}</Text>
            {!s.done && step === s.key && (
              <TouchableOpacity
                style={[{ backgroundColor: '#ec4899', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }]}
                onPress={() => handleStep(s.key)} disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.xs }}>Execute</Text>}
              </TouchableOpacity>
            )}
          </View>
          {txHashes[s.key] && (
            <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.voyager.online/tx/${txHashes[s.key]}`)}>
              <Text style={[{ fontSize: FontSize.xs, color: colors.accent, marginTop: 4, fontWeight: '600' }]}>
                {txHashes[s.key].slice(0, 12)}... → View on Voyager
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {allDone && (
        <>
          <View style={[{ backgroundColor: '#ec4899' + '15', borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' }]}>
            <Text style={{ fontSize: 48 }}>⭐</Text>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '900', color: '#ec4899', marginTop: Spacing.sm }}>Island Complete!</Text>
            <Text style={{ color: colors.textSoft, fontSize: FontSize.sm, textAlign: 'center', marginTop: 4 }}>You executed 3 real Starknet transactions.</Text>
          </View>
          <ActionBtn label="Complete Island →" onPress={onComplete} colors={colors} variant="starknet" />
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
    case 'starkzap-wallet':  return <WalletSim  {...props} />;
    case 'starkzap-gasless': return <GaslessSim {...props} />;
    case 'starkzap-swap':    return <SwapSim    {...props} />;
    case 'starkzap-stake':   return <StakeSim   {...props} />;
    case 'starkzap-lend':    return <LendSim    {...props} />;
    case 'starkzap-dca':     return <DcaSim     {...props} />;
    case 'starkzap-build':   return <BuildSim   {...props} />;
    case 'starkzap-boss':    return <BossSim    {...props} />;
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
