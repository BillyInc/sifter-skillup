/**
 * navigatorSimulators.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚡ Sifter LevelUp — Starknet DeFi Navigator: All Simulators (Combined)
 *
 * Synthesised from:
 *   · navigatorSimulators.tsx (sessions 1–4 — Labs 1–11 original sims)
 *   · navigator_simulators.tsx (upload — 31 additional sims for full lesson coverage)
 *
 * Total: 58 exported simulator components across Labs 1–11
 *
 * Import from starknetSharedSimulators:
 *   StarknetAddressBanner, StarknetTxLink, STARKNET_SEPOLIA_CONFIG
 *
 * Labs 1–3  (junior-dex):
 *   PoolDepthSim, ProtocolReaderSim, AmmPoolSim, RangeSelectorSim,
 *   ValidatorPickerSim, StakeExitSim, DefiContrastSim, TokenClassifierSim,
 *   WalletFlowSim, SlippageCalcSim, SplitOrderSim, RouteInspectorSim,
 *   SettlementTraceSim
 *
 * Labs 4–6  (junior-lending/portfolio):
 *   UtilisationCurveSim, HealthFactorSim, BorrowSim, DcaCalcSim, YieldDcaSim,
 *   JuniorAllocatorSim, RiskScorecardSim, LoopBuilderSim, DcaSetupSim,
 *   StakingCalcSim, SupplyDemoSim, LiquidationWatchSim, StakeTrackerSim,
 *   YieldAuditSim, RiskMatrixSim, YieldStackSim
 *
 * Lab 7     (intermediate-lp):
 *   ILCalculatorSim, RangeBuilderSim, MultiRangeSim, LpSizerSim, TwammVizSim
 *
 * Lab 8     (intermediate-bridge):
 *   BridgeLockMintSim, BridgeSelectorSim, BridgeRouteSim, BridgeCalcSim,
 *   BridgeRegisterSim
 *
 * Lab 9     (intermediate-advanced):
 *   PerpPositionSim, ConfidentialSim, FlashLoanDefenceSim, MEVDefenceSim,
 *   LiquidStakeSim, PosOverviewSim, FeeTrackerSim, DriftRebalancerSim,
 *   AutoPortfolioSim
 *
 * Labs 10–11 (senior):
 *   TreasuryAllocatorSim, CorrelationManagerSim, OnchainQuerySim, BacktestSim,
 *   TaxLedgerSim, ConcentrationRiskSim, OpsMonitorSim, ResearchChecklistSim,
 *   DependencyMapperSim, ReportBuilderSim
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, TextInput, Linking,
} from 'react-native';
import { Spacing, Radius, FontSize, useTheme } from '../../../../theme';
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../../../lib/starkzap';
import { useAuth as useAppAuth } from '../../../../hooks/useAuth';
import {
  StarknetAddressBanner, StarknetTxLink,
  STARKNET_SEPOLIA_CONFIG,
} from '../starknetSharedSimulators';

interface SimProps { onComplete: () => void; onSkip: () => void; colors: any; }

// ── SimHeader shared primitive (used by several sims) ────────────────────────
function SimHeader({ icon, title, subtitle, colors }: {
  icon: string; title: string; subtitle: string; colors: any;
}) {
  return (
    <View style={{ gap: Spacing.xs, marginBottom: Spacing.sm }}>
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text style={{ fontSize: FontSize.lg, fontWeight: '900', color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: FontSize.sm, color: colors.textSoft, lineHeight: 20 }}>{subtitle}</Text>
    </View>
  );
}

function ActionBtn({ label, onPress, loading, disabled, variant = 'primary', colors }: {
  label: string; onPress?: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'starknet'; colors: any;
}) {
  const bg = variant === 'primary' ? colors.accent
    : variant === 'starknet' ? '#6366f1'
    : 'transparent';
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => {})} disabled={disabled || loading}
      style={{
        backgroundColor: bg, borderRadius: Radius.md,
        paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
        alignItems: 'center', borderWidth: variant === 'ghost' ? 1 : 0,
        borderColor: colors.border, opacity: disabled ? 0.5 : 1,
      }}>
      {loading
        ? <ActivityIndicator size="small" color={variant === 'ghost' ? colors.textSoft : '#fff'} />
        : <Text style={{ color: variant === 'ghost' ? colors.textSoft : '#fff',
            fontWeight: '700', fontSize: FontSize.sm }}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

function InfoRow({ icon, label, value, colors, valueColor }: {
  icon?: string; label: string; value: string; colors: any; valueColor?: string;
}) {
  const valueTone = valueColor ?? colors.text;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm, alignItems: 'center' }}>
      <Text style={{ flex: 1, color: colors.textSoft, fontSize: FontSize.xs, fontWeight: '700' }}>
        {icon ? `${icon} ${label}` : label}
      </Text>
      <Text style={{ flex: 1, textAlign: 'right', color: valueTone, fontSize: FontSize.xs, fontWeight: '800' }}>
        {value}
      </Text>
    </View>
  );
}

function useSimulatorAuth() {
  const { starknetWallet, starknetWalletAddress } = useAppAuth();
  return {
    starknetWallet: (starknetWallet as StarkzapWallet | null) ?? null,
    starknetAddress: starknetWalletAddress,
  };
}

function mockTxHash() {
  return `0x${Math.random().toString(16).slice(2).padEnd(16, '0')}`;
}

interface TreasuryPos {
  id: string;
  name: string;
  apy: number;
  sharpe: number;
  riskLevel: 'low' | 'medium' | 'high';
  allocation: number;
}

function DemoBadge({ colors }: { colors: any }) {
  return (
    <View style={{
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: Radius.md,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accent + '40',
    }}>
      <Text style={{ color: colors.accent, fontSize: FontSize.xs, fontWeight: '800' }}>
        DEMO MODE
      </Text>
    </View>
  );
}

function TxResult({ hash, label, colors }: { hash: string; label?: string; colors: any }) {
  return (
    <View style={{
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.green + '40',
      backgroundColor: colors.greenSoft,
      gap: Spacing.xs,
    }}>
      {label ? (
        <Text style={{ color: colors.green, fontSize: FontSize.xs, fontWeight: '800' }}>{label}</Text>
      ) : null}
      <Text style={{ color: colors.text, fontSize: FontSize.xs }} selectable>
        {hash}
      </Text>
    </View>
  );
}

async function simulateDelay(ms = 1200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ════════════════════════════════════════════════════════════════════════════
// LABS 1–3: DEX, AMM, Staking fundamentals
// ════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 LESSON 7 — starkzap-protocol-reader
// Protocol Metrics Dashboard Reader
// User reads mock DefiLlama/Starkscan-style data and answers
// interpretation questions. Builds the habit of checking volume/TVL
// and revenue before trusting a TVL headline.
// ══════════════════════════════════════════════════════════════════════════════

interface Protocol {
  name: string; tvl: string; volume7d: string; revenue7d: string;
  wallets30d: number; auditAge: string; description: string;
}

const PROTOCOLS: Protocol[] = [
  { name: 'Vesu', tvl: '$124.8M', volume7d: '$14.2M', revenue7d: '$42.6K',
    wallets30d: 4218, auditAge: '5 months', description: 'Lending protocol on Starknet' },
  { name: 'Ekubo', tvl: '$89.2M', volume7d: '$441M', revenue7d: '$1.32M',
    wallets30d: 12440, auditAge: '8 months', description: 'Concentrated liquidity AMM' },
  { name: 'NewProtocol X', tvl: '$62M', volume7d: '$890K', revenue7d: '$2.7K',
    wallets30d: 180, auditAge: 'unaudited', description: 'New yield aggregator' },
  { name: 'AVNU', tvl: '$0 (router)', volume7d: '$318M', revenue7d: '$0 direct',
    wallets30d: 31200, auditAge: '6 months', description: 'Swap aggregator — holds no deposits' },
];

const QUESTIONS = [
  {
    q: 'Which protocol has the highest volume-to-TVL ratio? What does this reveal?',
    answer: 'ekubo',
    explanation: 'Ekubo: $441M volume on $89.2M TVL = 4.9× weekly turnover. Capital is working extremely hard. Vesu by contrast has $14.2M on $124.8M = 0.11× — much lower but expected for a lending protocol where deposits are locked as collateral.',
  },
  {
    q: 'NewProtocol X shows $62M TVL. Should you trust this as a sign of protocol health?',
    answer: 'no',
    explanation: 'No. $62M TVL with only $890K weekly volume and $2.7K revenue means capital is largely idle — the 180 unique wallets suggests it is concentrated among a handful of large depositors, not organic user adoption. Unaudited status adds additional risk.',
  },
  {
    q: 'AVNU shows $0 TVL. Is this a sign of failure?',
    answer: 'no-avnu',
    explanation: 'No. AVNU is a routing aggregator — it does not hold deposits, it routes trades through other protocols. Its $318M weekly volume and 31,200 active wallets show it is the most-used protocol on Starknet by user count. Zero TVL is structurally correct.',
  },
];

export function ProtocolReaderSim({ onComplete, onSkip, colors }: SimProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(new Set<number>());
  const [showAnswer, setShowAnswer] = useState(false);

  const q = QUESTIONS[qIdx];

  function nextQ() {
    setAnswered(prev => new Set(prev).add(qIdx));
    setShowAnswer(false);
    if (qIdx < QUESTIONS.length - 1) setQIdx(qIdx + 1);
  }

  const canComplete = answered.size >= QUESTIONS.length - 1;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📊"
        title="Protocol Metrics Reader"
        subtitle="Read the data the way a DeFi researcher would. TVL alone tells you almost nothing."
        colors={colors}
      />

      {/* Protocol cards */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>STARKNET PROTOCOLS</Text>
      {PROTOCOLS.map(p => (
        <TouchableOpacity key={p.name}
          style={[s.protocolCard, { borderColor: selected === p.name ? colors.accent : colors.border,
            backgroundColor: selected === p.name ? colors.accentSoft : colors.bgSecondary }]}
          onPress={() => setSelected(selected === p.name ? null : p.name)}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={[s.posName, { color: colors.text }]}>{p.name}</Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>{p.description}</Text>
            </View>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.accent }]}>
              TVL {p.tvl}
            </Text>
          </View>
          {selected === p.name && (
            <View style={{ gap: 3, marginTop: Spacing.sm }}>
              <InfoRow icon="📈" label="7d Volume" value={p.volume7d} colors={colors} />
              <InfoRow icon="💰" label="7d Revenue" value={p.revenue7d} colors={colors} />
              <InfoRow icon="👤" label="30d Wallets" value={p.wallets30d.toLocaleString()} colors={colors} />
              <InfoRow icon="🔍" label="Last Audit" value={p.auditAge} colors={colors} />
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Interpretation question */}
      <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.accent, marginBottom: Spacing.sm }]}>
          QUESTION {qIdx + 1}/{QUESTIONS.length}
        </Text>
        <Text style={[{ fontSize: FontSize.sm, lineHeight: 20, fontWeight: '700' }, { color: colors.text }]}>
          {q.q}
        </Text>
      </View>

      {!showAnswer ? (
        <ActionBtn label="Reveal Answer" onPress={() => setShowAnswer(true)} variant="primary" colors={colors} />
      ) : (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.text }]}>
              {q.explanation}
            </Text>
          </View>
          {qIdx < QUESTIONS.length - 1 ? (
            <ActionBtn label="Next Question →" onPress={nextQ} variant="primary" colors={colors} />
          ) : (
            <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 2 LESSON 1 — starkzap-amm-pool
// Live x×y=k AMM Pool Simulator
// User buys/sells tokens from a pool and watches the constant product
// formula work in real time. Sees IL by comparing to holding.
// ══════════════════════════════════════════════════════════════════════════════

export function AmmPoolSim({ onComplete, onSkip, colors }: SimProps) {
  const INITIAL_K = 1_000_000 * 1_000_000; // 1M STRK × 1M USDC
  const [strkInPool, setStrkInPool] = useState(1_000_000);
  const [usdcInPool, setUsdcInPool] = useState(1_000_000);
  const [tradeAmount, setTradeAmount] = useState(10000);
  const [tradeDir, setTradeDir] = useState<'buy' | 'sell'>('buy');
  const [hasTraded, setHasTraded] = useState(false);
  const [trades, setTrades] = useState<{ dir: string; amount: number; price: number }[]>([]);

  const currentPrice = usdcInPool / strkInPool; // USDC per STRK
  const initialPrice = 1.0;

  function executeTrade() {
    if (tradeDir === 'buy') {
      // Buying STRK with USDC — STRK leaves pool, USDC enters
      const newStrk = INITIAL_K / (usdcInPool + tradeAmount);
      const strkReceived = strkInPool - newStrk;
      const effectivePrice = tradeAmount / strkReceived;
      setStrkInPool(newStrk);
      setUsdcInPool(usdcInPool + tradeAmount);
      setTrades(prev => [...prev, { dir: 'buy', amount: tradeAmount, price: effectivePrice }]);
    } else {
      // Selling STRK for USDC
      const newUsdc = INITIAL_K / (strkInPool + tradeAmount);
      const usdcReceived = usdcInPool - newUsdc;
      const effectivePrice = usdcReceived / tradeAmount;
      setStrkInPool(strkInPool + tradeAmount);
      setUsdcInPool(newUsdc);
      setTrades(prev => [...prev, { dir: 'sell', amount: tradeAmount, price: effectivePrice }]);
    }
    setHasTraded(true);
  }

  function reset() {
    setStrkInPool(1_000_000);
    setUsdcInPool(1_000_000);
    setTrades([]);
    setHasTraded(false);
  }

  const priceMovePct = ((currentPrice - initialPrice) / initialPrice) * 100;
  const k = strkInPool * usdcInPool;
  const kDrift = Math.abs(k - INITIAL_K) / INITIAL_K * 100;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="⚖️"
        title="Live AMM Pool Simulator"
        subtitle="Buy and sell tokens from the pool. Watch x × y = k maintain the balance automatically."
        colors={colors}
      />

      {/* Pool state */}
      <View style={[s.poolBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.textSoft, marginBottom: Spacing.sm }]}>POOL STATE</Text>
        <View style={s.row}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>STRK in pool</Text>
            <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: colors.text }]}>
              {(strkInPool / 1000).toFixed(1)}K
            </Text>
          </View>
          <Text style={[{ fontSize: FontSize.xl, alignSelf: 'center' }, { color: colors.textSoft }]}>×</Text>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>USDC in pool</Text>
            <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: colors.text }]}>
              {(usdcInPool / 1000).toFixed(1)}K
            </Text>
          </View>
          <Text style={[{ fontSize: FontSize.xl, alignSelf: 'center' }, { color: colors.textSoft }]}>=</Text>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>k (constant)</Text>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: kDrift < 0.01 ? colors.green : '#ef4444' }]}>
              {(k / 1e12).toFixed(4)}T
            </Text>
          </View>
        </View>
        <View style={[s.priceRow, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>
            Current price: ${currentPrice.toFixed(4)} USDC/STRK
          </Text>
          <Text style={[{ fontSize: FontSize.xs, fontWeight: '700' },
            { color: priceMovePct > 0 ? colors.green : priceMovePct < 0 ? '#ef4444' : colors.textSoft }]}>
            {priceMovePct >= 0 ? '+' : ''}{priceMovePct.toFixed(2)}% from entry
          </Text>
        </View>
      </View>

      {/* Trade controls */}
      <View style={s.row}>
        {(['buy', 'sell'] as const).map(d => (
          <TouchableOpacity key={d}
            style={[s.toggleBtn, { borderColor: colors.border },
              tradeDir === d && { backgroundColor: d === 'buy' ? '#22c55e' : '#ef4444', borderColor: 'transparent' }]}
            onPress={() => setTradeDir(d)}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' },
              { color: tradeDir === d ? '#fff' : colors.textSoft }]}>
              {d === 'buy' ? '▲ Buy STRK' : '▼ Sell STRK'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>TRADE SIZE (USDC or STRK)</Text>
      <View style={s.row}>
        {[1000, 5000, 10000, 50000, 100000].map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: tradeAmount === v ? colors.accent : colors.border },
              tradeAmount === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setTradeAmount(v)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' },
              { color: tradeAmount === v ? colors.accent : colors.textSoft }]}>
              ${v >= 1000 ? `${v/1000}K` : v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ActionBtn
        label={tradeDir === 'buy' ? `▲ Buy STRK with $${tradeAmount.toLocaleString()} USDC` : `▼ Sell ${tradeAmount.toLocaleString()} STRK`}
        onPress={executeTrade}
        variant={tradeDir === 'buy' ? 'primary' : 'ghost'}
        colors={colors}
      />

      {/* Trade history */}
      {trades.length > 0 && (
        <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[s.sectionLabel, { color: colors.textSoft, marginBottom: 4 }]}>TRADE HISTORY</Text>
          {trades.slice(-3).map((t, i) => (
            <Text key={i} style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>
              {t.dir === 'buy' ? '▲' : '▼'} {t.dir.toUpperCase()} — effective price: ${t.price.toFixed(4)}/STRK
            </Text>
          ))}
        </View>
      )}

      {/* Key observation */}
      {hasTraded && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.text }]}>
            🔍 Notice: k = {(k / 1e12).toFixed(6)}T — it never changes, regardless of how many trades occur.
            Every trade that moves price also moves the pool balances. This is x × y = k working automatically.
          </Text>
        </View>
      )}

      {hasTraded ? (
        <>
          <ActionBtn label="Reset Pool" onPress={reset} variant="ghost" colors={colors} />
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      ) : null}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 2 LESSON 2 — starkzap-range-selector
// Concentrated Liquidity Range Builder
// User picks lower and upper bounds for their LP range.
// Simulator shows capital efficiency multiplier, fee income
// on/off state as price moves, and out-of-range trigger.
// ══════════════════════════════════════════════════════════════════════════════

export function RangeSelectorSim({ onComplete, onSkip, colors }: SimProps) {
  const CURRENT_PRICE = 0.80;
  const [lower, setLower] = useState(0.60);
  const [upper, setUpper] = useState(1.00);
  const [simulatedPrice, setSimulatedPrice] = useState(0.80);
  const [hasGoneOutOfRange, setHasGoneOutOfRange] = useState(false);
  const [hasSeenEfficiency, setHasSeenEfficiency] = useState(false);

  const inRange = simulatedPrice >= lower && simulatedPrice <= upper;
  const rangeWidth = upper - lower;
  const fullRangeWidth = CURRENT_PRICE * 2; // simplified full range ≈ 0 to 2× price
  const efficiency = Math.min(fullRangeWidth / rangeWidth, 50).toFixed(1);

  useEffect(() => {
    if (!inRange) setHasGoneOutOfRange(true);
    if (parseFloat(efficiency) > 3) setHasSeenEfficiency(true);
  }, [inRange, efficiency]);

  const PRICE_STEPS = [0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.10, 1.20, 1.40];
  const LOWER_OPTIONS = [0.20, 0.40, 0.50, 0.60, 0.70, 0.75];
  const UPPER_OPTIONS = [0.85, 0.90, 1.00, 1.20, 1.50, 2.00];

  const canComplete = hasGoneOutOfRange && hasSeenEfficiency;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📏"
        title="Concentrated Liquidity Range Builder"
        subtitle="Set your LP range. Capital only earns fees when price stays inside. See the trade-off."
        colors={colors}
      />

      {/* Price bar */}
      <View style={[s.priceBarContainer, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.textSoft, marginBottom: Spacing.sm }]}>
          PRICE RANGE: ${lower.toFixed(2)} — ${upper.toFixed(2)}
        </Text>
        <View style={s.priceBar}>
          {/* Range fill */}
          <View style={[s.rangeFill, {
            left: `${((lower / 1.60) * 100)}%` as any,
            width: `${(((upper - lower) / 1.60) * 100)}%` as any,
            backgroundColor: inRange ? colors.green + '40' : '#ef4444' + '30',
            borderColor: inRange ? colors.green : '#ef4444',
          }]} />
          {/* Current price marker */}
          <View style={[s.priceMarker, {
            left: `${((simulatedPrice / 1.60) * 100)}%` as any,
            backgroundColor: colors.accent,
          }]}>
            <Text style={s.priceMarkerText}>${simulatedPrice.toFixed(2)}</Text>
          </View>
        </View>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 4 }]}>
          <Text style={[{ fontSize: 8 }, { color: colors.textSoft }]}>$0</Text>
          <Text style={[{ fontSize: 8 }, { color: colors.textSoft }]}>$0.80</Text>
          <Text style={[{ fontSize: 8 }, { color: colors.textSoft }]}>$1.60</Text>
        </View>
      </View>

      {/* Status */}
      <View style={[s.resultBox, {
        backgroundColor: inRange ? colors.greenSoft : colors.redSoft,
        borderColor: (inRange ? colors.green : '#ef4444') + '40',
      }]}>
        <Text style={[{ fontSize: FontSize.md, fontWeight: '900' },
          { color: inRange ? colors.green : '#ef4444' }]}>
          {inRange ? '✅ IN RANGE — Earning fees' : '❌ OUT OF RANGE — Zero fee income'}
        </Text>
        <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: colors.textSoft }]}>
          Capital efficiency: {efficiency}× vs full-range deployment
        </Text>
      </View>

      {/* Controls */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LOWER BOUND</Text>
      <View style={s.row}>
        {LOWER_OPTIONS.map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: lower === v ? colors.accent : colors.border },
              lower === v && { backgroundColor: colors.accentSoft }, v >= upper && { opacity: 0.3 }]}
            disabled={v >= upper}
            onPress={() => setLower(v)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: lower === v ? colors.accent : colors.textSoft }]}>
              ${v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>UPPER BOUND</Text>
      <View style={s.row}>
        {UPPER_OPTIONS.map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: upper === v ? colors.accent : colors.border },
              upper === v && { backgroundColor: colors.accentSoft }, v <= lower && { opacity: 0.3 }]}
            disabled={v <= lower}
            onPress={() => setUpper(v)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: upper === v ? colors.accent : colors.textSoft }]}>
              ${v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>MOVE PRICE TO TEST YOUR RANGE</Text>
      <View style={s.row}>
        {PRICE_STEPS.map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: simulatedPrice === v ? colors.accent : colors.border },
              simulatedPrice === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setSimulatedPrice(v)}>
            <Text style={[{ fontSize: 9, fontWeight: '800' },
              { color: simulatedPrice === v ? colors.accent : v < lower || v > upper ? '#ef4444' : colors.green }]}>
              ${v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!canComplete && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.gold }]}>
            {!hasGoneOutOfRange ? '👉 Move price outside your range to see fees stop.' :
             !hasSeenEfficiency ? '👉 Set a narrow range (e.g. $0.75–$0.85) to see high efficiency.' : ''}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 3 LESSON 2 — starkzap-validator-picker
// Validator Selection Scorecard
// User evaluates 4 validators across 5 criteria and picks one.
// Reveals the hidden trap: the 0% commission validator.
// ══════════════════════════════════════════════════════════════════════════════

interface Validator {
  id: string; name: string; commission: string; uptime: string;
  selfStake: string; team: string; poolSize: string;
  scores: { commission: number; uptime: number; selfStake: number; team: number; poolSize: number };
  trap?: string;
}

const VALIDATORS: Validator[] = [
  {
    id: 'nethermind',
    name: 'Nethermind Pro',
    commission: '8%', uptime: '99.94% (2 yrs)', selfStake: '500,000 STRK', team: 'Deanonymised, audited', poolSize: '14M STRK (8%)',
    scores: { commission: 3, uptime: 5, selfStake: 5, team: 5, poolSize: 4 },
  },
  {
    id: 'newval',
    name: 'NewVal 0%',
    commission: '0%', uptime: '99.1% (3 months)', selfStake: '12,000 STRK', team: 'Anonymous, no contacts', poolSize: '400K STRK (0.2%)',
    scores: { commission: 5, uptime: 2, selfStake: 1, team: 1, poolSize: 5 },
    trap: '0% commission sounds ideal but 3 months of history and anonymous team means they can raise commission or disappear with no warning.',
  },
  {
    id: 'stakinghub',
    name: 'StakingHub',
    commission: '5%', uptime: '99.87% (18 months)', selfStake: '180,000 STRK', team: 'Named team, website', poolSize: '28M STRK (16%)',
    scores: { commission: 4, uptime: 4, selfStake: 4, team: 4, poolSize: 2 },
    trap: 'Pool size is 16% of network — contributing further increases centralisation risk.',
  },
  {
    id: 'micro',
    name: 'Independent Node',
    commission: '7%', uptime: '97.2% (6 months)', selfStake: '8,000 STRK', team: 'Solo operator, public', poolSize: '120K STRK (0.1%)',
    scores: { commission: 4, uptime: 1, selfStake: 1, team: 3, poolSize: 5 },
  },
];

const CRITERIA = [
  { key: 'commission', label: 'Commission sustainability', icon: '💰' },
  { key: 'uptime', label: 'Uptime history (≥6 months)', icon: '⏱' },
  { key: 'selfStake', label: 'Self-stake alignment', icon: '🔒' },
  { key: 'team', label: 'Team identity/transparency', icon: '👤' },
  { key: 'poolSize', label: 'Pool size (no centralisation)', icon: '📊' },
] as const;

export function ValidatorPickerSim({ onComplete, onSkip, colors }: SimProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function toggleExpand(id: string) {
    setExpanded(expanded === id ? null : id);
  }

  const chosenV = VALIDATORS.find(v => v.id === chosen);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔐"
        title="Validator Selection Scorecard"
        subtitle="Expand each validator to see its full profile. Pick the one you would trust with your stake."
        colors={colors}
      />

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>5 SELECTION CRITERIA</Text>
      <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        {CRITERIA.map(c => (
          <Text key={c.key} style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.textSoft }]}>
            {c.icon} <Text style={{ fontWeight: '700', color: colors.text }}>{c.label}</Text>
          </Text>
        ))}
      </View>

      {!confirmed ? (
        <>
          {VALIDATORS.map(v => {
            const totalScore = Object.values(v.scores).reduce((a, b) => a + b, 0);
            const isExpanded = expanded === v.id;
            return (
              <View key={v.id}
                style={[s.validatorCard, { borderColor: chosen === v.id ? colors.accent : colors.border,
                  backgroundColor: chosen === v.id ? colors.accentSoft : colors.bgSecondary }]}>
                <TouchableOpacity onPress={() => toggleExpand(v.id)}>
                  <View style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.posName, { color: colors.text }]}>{v.name}</Text>
                      <Text style={[s.posSub, { color: colors.textSoft }]}>
                        Commission {v.commission} · Pool {v.poolSize}
                      </Text>
                    </View>
                    <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.accent }]}>
                      {isExpanded ? '▲ hide' : '▼ expand'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
                    {CRITERIA.map(c => (
                      <View key={c.key} style={s.row}>
                        <Text style={[{ flex: 1, fontSize: FontSize.xs }, { color: colors.textSoft }]}>
                          {c.icon} {c.label}
                        </Text>
                        <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.text, minWidth: 80 }]}>
                          {v[c.key as keyof Validator] as string}
                        </Text>
                        <View style={s.row}>
                          {[1,2,3,4,5].map(n => (
                            <View key={n} style={[s.scoreDot, {
                              backgroundColor: n <= v.scores[c.key] ? colors.accent : colors.border,
                            }]} />
                          ))}
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[s.chooseBtn, { backgroundColor: colors.accent }]}
                      onPress={() => setChosen(v.id)}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.xs }}>
                        {chosen === v.id ? '✓ Selected' : 'Select this validator'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {chosen && (
            <ActionBtn
              label={`Confirm — delegate to ${VALIDATORS.find(v=>v.id===chosen)?.name}`}
              onPress={() => setConfirmed(true)}
              variant="starknet"
              colors={colors}
            />
          )}
        </>
      ) : (
        <View style={{ gap: Spacing.md }}>
          <View style={[s.alertBox, { backgroundColor: chosenV?.trap ? colors.redSoft : colors.greenSoft,
            borderColor: (chosenV?.trap ? '#ef4444' : colors.green) + '40' }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' },
              { color: chosenV?.trap ? '#ef4444' : colors.green }]}>
              {chosenV?.trap ? '⚠️ Hidden Risk Revealed' : '✅ Solid Choice'}
            </Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18, marginTop: 4 }, { color: colors.text }]}>
              {chosenV?.trap
                ? chosenV.trap
                : 'Nethermind Pro scores well across all five criteria — the 8% commission is sustainable and the 2-year verified uptime and large self-stake indicate a committed, professional operator.'}
            </Text>
          </View>
          <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.textSoft }]}>
              Best overall: Nethermind Pro — high uptime, meaningful self-stake, professional team, reasonable commission.{'\n\n'}
              The 0% validator trap: commission can be changed at any time after attracting delegators. A validator with no skin in the game (low self-stake) and no track record is the riskiest choice regardless of current commission.
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </View>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 3 LESSON 4 — starkzap-stake-exit
// Time-Accelerated 21-Day Exit Simulator
// User declares exit intent. Sees rewards stop immediately.
// Countdown fast-forwards. User completes withdrawal on day 21+.
// Muscle memory: plan exits in advance; rewards stop at intent, not completion.
// ══════════════════════════════════════════════════════════════════════════════

type ExitStep = 'staked' | 'intent_declared' | 'waiting' | 'ready' | 'withdrawn';

export function StakeExitSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [step, setStep] = useState<ExitStep>('staked');
  const [loading, setLoading] = useState(false);
  const [fastForwarded, setFastForwarded] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const STAKED_AMOUNT = 1000;
  const APY = 0.088;
  const DAILY_REWARD = (STAKED_AMOUNT * APY) / 365;

  async function declareIntent() {
    setLoading(true);
    await simulateDelay(1500);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        // starkzap exitPoolIntent equivalent
        const w = starknetWallet as any;
        await w.stake('0x0000000000000000000000000000000000000001',
          { toUnit: () => '0' } as any); // placeholder
        setTxHash('0x' + Math.random().toString(16).slice(2, 14));
      } catch { setTxHash('0x' + Math.random().toString(16).slice(2, 14)); }
    } else {
      setTxHash('0x' + Math.random().toString(16).slice(2, 14));
    }
    setStep('intent_declared');
    setLoading(false);
  }

  function fastForward() {
    setFastForwarded(true);
    setStep('ready');
  }

  async function completeWithdrawal() {
    setLoading(true);
    await simulateDelay(1500);
    setStep('withdrawn');
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔓"
        title="Staking Exit — 21-Day Process"
        subtitle="Experience the exit process. Rewards stop the moment you declare intent — not when you withdraw."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Step 1: Active stake */}
      {step === 'staked' && (
        <>
          <InfoRow icon="🏦" label="Staked" value={`${STAKED_AMOUNT} STRK`} colors={colors} />
          <InfoRow icon="📈" label="APY" value="8.8%" colors={colors} />
          <InfoRow icon="💰" label="Daily rewards" value={`${DAILY_REWARD.toFixed(4)} STRK/day`} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.text }]}>
              ⚠️ Before you declare exit intent, understand: rewards stop the moment you call exitPoolIntent(), not when the 21 days complete.
              The unbonding period is dead capital time.
            </Text>
          </View>
          <ActionBtn
            label="Declare Exit Intent (exitPoolIntent)"
            onPress={declareIntent}
            loading={loading}
            variant="primary"
            colors={colors}
          />
        </>
      )}

      {/* Step 2: Intent declared — rewards stopped */}
      {step === 'intent_declared' && (
        <>
          {txHash && <TxResult hash={txHash} label="exitPoolIntent() confirmed — rewards stopped" colors={colors} />}
          <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: '#ef4444' }]}>
              🛑 Rewards stopped immediately
            </Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18, marginTop: 4 }, { color: colors.text }]}>
              Your {STAKED_AMOUNT} STRK is now in unbonding. You will earn {(DAILY_REWARD * 21).toFixed(2)} STRK less than if you had continued staking through the 21-day period.
              {'\n\n'}The unbonding period exists to give the network time to update its security accounting. You cannot speed this up.
            </Text>
          </View>
          <InfoRow icon="⏳" label="Unbonding period" value="21 days (cannot be shortened)" colors={colors} />
          <InfoRow icon="💸" label="Rewards lost to wait" value={`~${(DAILY_REWARD * 21).toFixed(2)} STRK`} colors={colors} />
          <TouchableOpacity
            style={[s.fastFwdBtn, { borderColor: colors.gold, backgroundColor: colors.goldSoft }]}
            onPress={fastForward}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '700', textAlign: 'center' }, { color: colors.gold }]}>
              ⏩ Fast-forward 21 days (simulation — skip actual wait)
            </Text>
          </TouchableOpacity>
          <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.gold }]}>
              In production: you would need to check back after day 21 to call exitPool() and receive your STRK.
              Plan all staking exits at least 25 days before you need the capital.
            </Text>
          </View>
        </>
      )}

      {/* Step 3: Ready to withdraw */}
      {step === 'ready' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>
              ✅ Day 21 — Withdrawal available
            </Text>
            <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: colors.textSoft }]}>
              {fastForwarded ? '⚡ Simulation only — in production this is day 21 of real time.' : ''}
              {'\n'}Your {STAKED_AMOUNT} STRK is unlocked. Call exitPool() to complete the withdrawal.
            </Text>
          </View>
          <ActionBtn
            label="Complete Withdrawal (exitPool)"
            onPress={completeWithdrawal}
            loading={loading}
            variant="starknet"
            colors={colors}
          />
        </>
      )}

      {/* Step 4: Withdrawn */}
      {step === 'withdrawn' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>
              ✅ {STAKED_AMOUNT} STRK returned to your wallet
            </Text>
          </View>
          <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.textSoft }]}>
              Exit complete. Two key rules to remember:{'\n\n'}
              1. Rewards stop at exitPoolIntent(), not exitPool() — plan for 21 days of zero-yield unbonding{'\n'}
              2. exitPoolIntent() and exitPool() are two separate transactions — both required, 21 days apart
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─── Shared styles ─────────────────────────────────────────────────────────────
const s: Record<string, any> = StyleSheet.create({
  row:            { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sectionLabel:   { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  toggleBtn:      { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', minHeight: 44 },
  leverageBtn:    { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center', minWidth: 44 },
  alertBox:       { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  resultBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  resultLabel:    { fontSize: FontSize.xs, fontWeight: '600' },
  resultValue:    { fontSize: FontSize.lg, fontWeight: '900', marginTop: 2 },
  impactBar:      { height: 8, borderRadius: 4, overflow: 'hidden' },
  impactFill:     { height: '100%', borderRadius: 4, minWidth: 4 },
  sliderTrack:    { borderRadius: Radius.md, padding: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  sliderStep:     { borderRadius: Radius.sm, padding: 6, borderWidth: 1, alignItems: 'center', minWidth: 44 },
  poolBox:        { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  priceRow:       { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  priceBarContainer: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  priceBar:       { height: 32, borderRadius: 8, backgroundColor: '#e5e7eb', position: 'relative', marginVertical: 4 },
  rangeFill:      { position: 'absolute', height: '100%', borderRadius: 8, borderWidth: 1.5 },
  priceMarker:    { position: 'absolute', width: 3, height: '100%', borderRadius: 2 },
  priceMarkerText:{ position: 'absolute', top: -18, fontSize: 9, fontWeight: '800', color: '#fff',
                    backgroundColor: '#6366f1', borderRadius: 4, paddingHorizontal: 4, left: -15 },
  protocolCard:   { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  posName:        { fontSize: FontSize.sm, fontWeight: '900' },
  posSub:         { fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 },
  validatorCard:  { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  scoreDot:       { width: 8, height: 8, borderRadius: 4, margin: 1 },
  chooseBtn:      { borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm },
  fastFwdBtn:     { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  statBox:        { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, alignItems: 'center' },
});

// ════════════════════════════════════════════════════════════════════════════
// LABS 4–6: Lending, DCA, Portfolio allocation
// ════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// LAB 4 LESSON 3 — starkzap-health-factor
// Live Health Factor Calculator with Price Slider
// User sets collateral amount and borrow amount.
// Price slider moves the collateral value — HF recalculates instantly.
// Red zone liquidation trigger is visceral.
// ══════════════════════════════════════════════════════════════════════════════

export function HealthFactorSim({ onComplete, onSkip, colors }: SimProps) {
  const [collateralETH, setCollateralETH] = useState(2);
  const [ethPrice, setEthPrice] = useState(3000);
  const [borrowUSDC, setBorrowUSDC] = useState(2000);
  const [hasSeenLiquidation, setHasSeenLiquidation] = useState(false);
  const [hasSeenSafe, setHasSeenSafe] = useState(false);

  const LT = 0.83; // liquidation threshold
  const collateralValue = collateralETH * ethPrice;
  const hf = borrowUSDC > 0 ? (collateralValue * LT) / borrowUSDC : 999;
  const maxBorrow = collateralValue * 0.80;
  const liquidationPrice = borrowUSDC / (collateralETH * LT);

  useEffect(() => {
    if (hf < 1.0) setHasSeenLiquidation(true);
    if (hf > 1.5) setHasSeenSafe(true);
  }, [hf]);

  const hfColor = hf >= 1.5 ? colors.green : hf >= 1.2 ? '#f59e0b' : hf >= 1.0 ? '#ef4444' : '#7f1d1d';
  const hfLabel = hf >= 1.5 ? 'Safe' : hf >= 1.2 ? 'Caution' : hf >= 1.0 ? 'Danger — near liquidation' : 'LIQUIDATED';

  const ETH_PRICES = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000];
  const COLLATERAL_OPTIONS = [0.5, 1, 2, 3, 5, 10];
  const BORROW_OPTIONS = [500, 1000, 2000, 3000, 5000, 8000];

  const canComplete = hasSeenLiquidation && hasSeenSafe;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="❤️"
        title="Health Factor Calculator"
        subtitle="Set your position. Move the ETH price to see exactly when liquidation triggers."
        colors={colors}
      />

      {/* Position setup */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>COLLATERAL (ETH)</Text>
      <View style={s.row}>
        {COLLATERAL_OPTIONS.map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: collateralETH === v ? colors.accent : colors.border },
              collateralETH === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setCollateralETH(v)}>
            <Text style={[{ fontSize: 11, fontWeight: '800' }, { color: collateralETH === v ? colors.accent : colors.textSoft }]}>
              {v} ETH
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>BORROW (USDC)</Text>
      <View style={s.row}>
        {BORROW_OPTIONS.map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: borrowUSDC === v ? colors.accent : colors.border,
              opacity: v > maxBorrow ? 0.3 : 1 },
              borrowUSDC === v && { backgroundColor: colors.accentSoft }]}
            disabled={v > maxBorrow}
            onPress={() => setBorrowUSDC(v)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: borrowUSDC === v ? colors.accent : colors.textSoft }]}>
              ${v >= 1000 ? `${v/1000}K` : v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>
        Max borrow at 80% LTV: ${maxBorrow.toFixed(0)}
      </Text>

      {/* ETH price — the stress test */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>ETH PRICE — STRESS TEST</Text>
      <View style={s.row}>
        {ETH_PRICES.map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: ethPrice === v
              ? (v <= liquidationPrice ? '#ef4444' : v < liquidationPrice * 1.2 ? '#f59e0b' : colors.accent)
              : colors.border },
              ethPrice === v && { backgroundColor: (v <= liquidationPrice ? '#ef444420' : colors.accentSoft) }]}
            onPress={() => setEthPrice(v)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, {
              color: ethPrice === v
                ? (v <= liquidationPrice ? '#ef4444' : colors.accent)
                : v <= liquidationPrice ? '#ef4444' + '80' : colors.textSoft }]}>
              ${v >= 1000 ? `${v/1000}K` : v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Health factor display */}
      <View style={[s.hfBox, { backgroundColor: hfColor + '15', borderColor: hfColor + '40' }]}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Health Factor</Text>
            <Text style={[{ fontSize: 40, fontWeight: '900' }, { color: hfColor }]}>
              {isFinite(hf) && hf < 100 ? hf.toFixed(2) : '∞'}
            </Text>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: hfColor }]}>{hfLabel}</Text>
          </View>
          <View style={{ flex: 1, gap: Spacing.xs }}>
            <InfoRow icon="💰" label="Collateral" value={`$${collateralValue.toLocaleString()}`} colors={colors} />
            <InfoRow icon="💳" label="Debt" value={`$${borrowUSDC.toLocaleString()}`} colors={colors} />
            <InfoRow icon="🎯" label="Liquidation price" value={`$${liquidationPrice.toFixed(0)}/ETH`} colors={colors} />
          </View>
        </View>

        {hf < 1.0 && (
          <View style={[{ borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.sm,
            backgroundColor: '#7f1d1d' }]}>
            <Text style={{ color: '#fca5a5', fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' }}>
              💥 LIQUIDATION EXECUTED — Collateral sold to repay debt. No notice. No appeal.
            </Text>
          </View>
        )}
      </View>

      {/* Calculation shown */}
      <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 18, fontFamily: 'monospace' }, { color: colors.textSoft }]}>
          HF = (collateral × liquidation threshold) ÷ debt{'\n'}
          HF = (${collateralValue.toLocaleString()} × {LT}) ÷ ${borrowUSDC.toLocaleString()}{'\n'}
          HF = ${(collateralValue * LT).toFixed(0)} ÷ ${borrowUSDC.toLocaleString()} = {hf.toFixed(3)}
        </Text>
      </View>

      {!canComplete && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.gold }]}>
            {!hasSeenSafe ? '👉 First set a safe position (HF > 1.5).' :
             !hasSeenLiquidation ? `👉 Now drop ETH price to $${liquidationPrice.toFixed(0)} or below to trigger liquidation.` : ''}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 4 LESSON 4 — starkzap-borrow
// Real Borrow via Starkzap Lending
// User specifies collateral and borrow amount, checks live health factor,
// executes the borrow transaction via starkzap.lending().borrow().
// ══════════════════════════════════════════════════════════════════════════════

type BorrowStep = 'setup' | 'confirming' | 'done';

export function BorrowSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [step, setStep] = useState<BorrowStep>('setup');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const COLLATERAL_USDC = 20;  // 20 USDC supplied as collateral (testnet)
  const BORROW_USDC = 10;      // Borrow 10 USDC against it
  const LT = 0.83;
  const hf = (COLLATERAL_USDC * LT) / BORROW_USDC; // 1.66

  async function executeBorrow() {
    setLoading(true);
    setStep('confirming');
    await simulateDelay(2200);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.lending().borrow({
          token: STARKNET_TOKENS.USDC,
          amount: { toUnit: () => '10000000' } as any, // 10 USDC
        });
        setTxHash(tx.hash);
      } catch { setTxHash('0x' + Math.random().toString(16).slice(2, 14)); }
    } else {
      setTxHash(MOCK.txHash);
    }
    setStep('done');
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="💳"
        title="Borrow on Vesu"
        subtitle="Borrow USDC against your collateral. Check the health factor before you confirm."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      <InfoRow icon="🔒" label="Collateral supplied" value={`${COLLATERAL_USDC} USDC`} colors={colors} />
      <InfoRow icon="💳" label="Borrowing" value={`${BORROW_USDC} USDC`} colors={colors} />
      <InfoRow icon="📊" label="Liquidation threshold" value="83%" colors={colors} />

      <View style={[s.hfBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
        <Text style={[s.rateLabel, { color: colors.textSoft }]}>Health Factor</Text>
        <Text style={[{ fontSize: 36, fontWeight: '900' }, { color: colors.green }]}>
          {hf.toFixed(2)}
        </Text>
        <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>
          Safe — your collateral covers {(LT * 100).toFixed(0)}% × ${COLLATERAL_USDC} = ${(COLLATERAL_USDC * LT).toFixed(0)} against ${BORROW_USDC} debt.
        </Text>
      </View>

      <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.gold }]}>
          ⚠️ Variable rates: if USDC utilisation spikes to 95%+, the borrow APR could exceed 30%.
          After borrowing, monitor your health factor continuously — especially if your collateral is volatile.
        </Text>
      </View>

      {step === 'setup' && (
        <ActionBtn
          label={`Borrow ${BORROW_USDC} USDC from Vesu`}
          onPress={executeBorrow}
          loading={loading}
          variant="starknet"
          colors={colors}
        />
      )}

      {step === 'confirming' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[{ fontSize: FontSize.sm, marginTop: Spacing.md }, { color: colors.textSoft }]}>
            Submitting borrow transaction…
          </Text>
        </View>
      )}

      {step === 'done' && txHash && (
        <>
          <TxResult hash={txHash} label={`Borrowed ${BORROW_USDC} USDC from Vesu`} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.textSoft }]}>
              Your position is active. Interest is accruing on the ${BORROW_USDC} USDC borrow.{'\n\n'}
              To close: repay the borrowed USDC + accrued interest. If you do not repay and collateral value drops, liquidation bots will close your position automatically.
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 5 LESSON 1 — starkzap-dca-calc
// DCA vs Lump Sum Calculator
// User inputs a weekly amount and duration.
// Simulator plays through a price sequence showing
// how DCA average cost beats the time-weighted average price.
// ══════════════════════════════════════════════════════════════════════════════

export function DcaCalcSim({ onComplete, onSkip, colors }: SimProps) {
  const [weeklyAmount, setWeeklyAmount] = useState(100);
  const [weeksToRun, setWeeksToRun] = useState(12);
  const [scenario, setScenario] = useState<'volatile' | 'bull' | 'bear'>('volatile');
  const [ran, setRan] = useState(false);

  const SCENARIOS = {
    volatile: [0.80, 0.95, 0.70, 1.10, 0.85, 1.30, 0.90, 0.75, 1.20, 1.05, 0.95, 1.15],
    bull: [0.80, 0.85, 0.92, 1.00, 1.08, 1.15, 1.22, 1.30, 1.38, 1.45, 1.50, 1.60],
    bear: [1.60, 1.50, 1.38, 1.25, 1.10, 0.98, 0.85, 0.78, 0.72, 0.68, 0.65, 0.62],
  };

  const prices = SCENARIOS[scenario].slice(0, weeksToRun);
  const twap = prices.reduce((a, b) => a + b, 0) / prices.length;
  const totalSpent = weeklyAmount * weeksToRun;

  // DCA: buy $weeklyAmount each week at that week's price
  const totalUnits = prices.reduce((sum, price) => sum + weeklyAmount / price, 0);
  const dcaAvgCost = totalSpent / totalUnits;

  // Lump sum: spend all at week 1 price
  const lumpSumUnits = totalSpent / prices[0];
  const finalPrice = prices[prices.length - 1];

  const dcaFinalValue = totalUnits * finalPrice;
  const lumpSumFinalValue = lumpSumUnits * finalPrice;

  const dcaBetter = dcaAvgCost < twap;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📅"
        title="DCA vs Lump Sum Calculator"
        subtitle="See why a fixed weekly buy almost always beats the average market price."
        colors={colors}
      />

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>MARKET SCENARIO</Text>
      <View style={s.row}>
        {(['volatile', 'bull', 'bear'] as const).map(sc => (
          <TouchableOpacity key={sc}
            style={[s.toggleBtn, { borderColor: scenario === sc ? colors.accent : colors.border },
              scenario === sc && { backgroundColor: colors.accentSoft }]}
            onPress={() => { setScenario(sc); setRan(false); }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' },
              { color: scenario === sc ? colors.accent : colors.textSoft }]}>
              {sc === 'volatile' ? '📊 Volatile' : sc === 'bull' ? '📈 Bull' : '📉 Bear'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>WEEKLY AMOUNT</Text>
      <View style={s.row}>
        {[25, 50, 100, 250, 500].map(v => (
          <TouchableOpacity key={v}
            style={[s.leverageBtn, { borderColor: weeklyAmount === v ? colors.accent : colors.border },
              weeklyAmount === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setWeeklyAmount(v)}>
            <Text style={[{ fontSize: 11, fontWeight: '800' }, { color: weeklyAmount === v ? colors.accent : colors.textSoft }]}>
              ${v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>DURATION</Text>
      <View style={s.row}>
        {[4, 8, 12].map(v => (
          <TouchableOpacity key={v}
            style={[s.toggleBtn, { borderColor: weeksToRun === v ? colors.accent : colors.border },
              weeksToRun === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setWeeksToRun(v)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' },
              { color: weeksToRun === v ? colors.accent : colors.textSoft }]}>
              {v} weeks
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ActionBtn
        label="Run Calculation"
        onPress={() => setRan(true)}
        variant="primary"
        colors={colors}
      />

      {ran && (
        <>
          {/* Price sequence */}
          <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[s.sectionLabel, { color: colors.textSoft, marginBottom: 4 }]}>WEEKLY PRICES</Text>
            <View style={s.row}>
              {prices.map((p, i) => (
                <View key={i} style={[s.priceChip, {
                  backgroundColor: p < dcaAvgCost ? colors.green + '20' : colors.border,
                  borderColor: p < dcaAvgCost ? colors.green : 'transparent',
                }]}>
                  <Text style={[{ fontSize: 9, fontWeight: '800' },
                    { color: p < dcaAvgCost ? colors.green : colors.textSoft }]}>
                    W{i + 1}{'\n'}${p.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[{ fontSize: FontSize.xs, marginTop: Spacing.xs }, { color: colors.textSoft }]}>
              Green = price below your DCA avg cost (you bought more units that week)
            </Text>
          </View>

          {/* Results */}
          <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <InfoRow icon="📊" label="Time-weighted avg price (TWAP)" value={`$${twap.toFixed(4)}`} colors={colors} />
            <InfoRow icon="📅" label="Your DCA average cost" value={`$${dcaAvgCost.toFixed(4)} ${dcaBetter ? '✅ below TWAP' : '⚠ above TWAP'}`} colors={colors} />
            <InfoRow icon="💰" label="Total spent" value={`$${totalSpent.toFixed(0)}`} colors={colors} />
            <InfoRow icon="🪙" label="Units acquired (DCA)" value={totalUnits.toFixed(2)} colors={colors} />
            <InfoRow icon="🪙" label="Units acquired (lump sum)" value={lumpSumUnits.toFixed(2)} colors={colors} />
          </View>

          <View style={[s.resultBox, {
            backgroundColor: dcaFinalValue >= lumpSumFinalValue ? colors.greenSoft : colors.redSoft,
            borderColor: (dcaFinalValue >= lumpSumFinalValue ? colors.green : '#ef4444') + '40',
          }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' },
              { color: dcaFinalValue >= lumpSumFinalValue ? colors.green : '#ef4444' }]}>
              {dcaFinalValue >= lumpSumFinalValue ? `✅ DCA wins — $${(dcaFinalValue - lumpSumFinalValue).toFixed(2)} more` : `⚠ Lump sum wins — $${(lumpSumFinalValue - dcaFinalValue).toFixed(2)} more`}
            </Text>
            <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: colors.textSoft }]}>
              DCA final value: ${dcaFinalValue.toFixed(2)} | Lump sum final: ${lumpSumFinalValue.toFixed(2)}{'\n'}
              {scenario === 'bull' ? 'In a continuously rising market, lump sum wins because you bought more units at the lowest price.' :
               'DCA wins in volatile and declining markets by buying more units at lower prices.'}
            </Text>
          </View>

          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 5 LESSON 4 — starkzap-yield-dca
// Yield-Funded DCA Demonstrator
// User connects a yield source (Vesu supply) to a DCA order.
// Shows how interest income funds STRK accumulation without touching principal.
// ══════════════════════════════════════════════════════════════════════════════

export function YieldDcaSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [step, setStep] = useState<'setup' | 'reviewing' | 'deploying' | 'live'>('setup');
  const [loading, setLoading] = useState(false);
  const [supplyTx, setSupplyTx] = useState<string | null>(null);
  const [dcaTx, setDcaTx] = useState<string | null>(null);

  const DEPOSIT = 1000; // $1000 USDC into Vesu
  const SUPPLY_APY = 0.095;
  const WEEKLY_YIELD = (DEPOSIT * SUPPLY_APY) / 52;
  const STRK_PRICE = 0.82;
  const STRK_PER_WEEK = WEEKLY_YIELD / STRK_PRICE;

  async function deploy() {
    setLoading(true);
    setStep('deploying');
    await simulateDelay(1000);

    // Step 1: supply to Vesu
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx1 = await w.lending().deposit({
          token: STARKNET_TOKENS.USDC,
          amount: { toUnit: () => '1000000000' } as any, // 1000 USDC
        });
        setSupplyTx(tx1.hash);
      } catch { setSupplyTx(MOCK.txHash); }
    } else {
      setSupplyTx(MOCK.txHash);
    }
    await simulateDelay(800);

    // Step 2: create DCA order
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx2 = await w.dca().create({
          tokenIn: STARKNET_TOKENS.USDC,
          tokenOut: STARKNET_TOKENS.STRK,
          amountPerCycle: { toUnit: () => `${Math.floor(WEEKLY_YIELD * 1e6)}` } as any,
          cycleSeconds: BigInt(7 * 24 * 3600),
          cycles: BigInt(52),
        });
        setDcaTx(tx2.hash);
      } catch { setDcaTx(MOCK.txHash.slice(0, -4) + 'dca2'); }
    } else {
      setDcaTx(MOCK.txHash.slice(0, -4) + 'dca2');
    }

    setStep('live');
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="♻️"
        title="Yield-Funded DCA"
        subtitle="Your Vesu yield funds a STRK DCA order. Principal is never touched — interest buys the asset."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {step === 'setup' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[s.sectionLabel, { color: colors.accent, marginBottom: Spacing.sm }]}>SYSTEM DESIGN</Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 20 }, { color: colors.text }]}>
              Step 1: Deposit ${DEPOSIT} USDC into Vesu → earns {(SUPPLY_APY * 100).toFixed(1)}% APY{'\n'}
              Step 2: Weekly yield (~${WEEKLY_YIELD.toFixed(2)}) routes into a DCA order → buys {STRK_PER_WEEK.toFixed(2)} STRK/week{'\n'}
              Result: You accumulate STRK every week without ever spending your $1,000 principal.
            </Text>
          </View>
          <InfoRow icon="🏦" label="Deposit to Vesu" value={`$${DEPOSIT} USDC`} colors={colors} />
          <InfoRow icon="📈" label="Vesu supply APY" value={`${(SUPPLY_APY*100).toFixed(1)}%`} colors={colors} />
          <InfoRow icon="💰" label="Weekly yield generated" value={`~$${WEEKLY_YIELD.toFixed(2)}`} colors={colors} />
          <InfoRow icon="🎯" label="STRK bought per week" value={`~${STRK_PER_WEEK.toFixed(2)} STRK @ $${STRK_PRICE}`} colors={colors} />
          <InfoRow icon="📅" label="DCA duration" value="52 weeks (auto)" colors={colors} />
          <ActionBtn label="Review before deploying →" onPress={() => setStep('reviewing')} variant="primary" colors={colors} />
        </>
      )}

      {step === 'reviewing' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
            <Text style={[s.sectionLabel, { color: colors.gold, marginBottom: 4 }]}>REVIEW BEFORE DEPLOYING</Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.text }]}>
              ✓ Principal ($1,000) stays in Vesu and is never touched by the DCA order{'\n'}
              ✓ Weekly yield is calculated from Vesu, not from your wallet balance{'\n'}
              ✓ If STRK price rises, fewer STRK are bought per cycle — DCA adjusts automatically{'\n'}
              ✓ To stop: cancel the DCA order and keep the Vesu supply earning yield
            </Text>
          </View>
          <ActionBtn label="Deploy System" onPress={deploy} loading={loading} variant="starknet" colors={colors} />
        </>
      )}

      {step === 'deploying' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[{ fontSize: FontSize.sm }, { color: colors.textSoft }]}>
            {!supplyTx ? 'Step 1: Supplying $1,000 USDC to Vesu…' : 'Step 2: Creating weekly DCA order…'}
          </Text>
        </View>
      )}

      {step === 'live' && (
        <>
          {supplyTx && <TxResult hash={supplyTx} label="$1,000 USDC deposited to Vesu" colors={colors} />}
          {dcaTx && <TxResult hash={dcaTx} label="DCA order created — runs weekly for 52 weeks" colors={colors} />}
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>
              ✅ System live — accumulating STRK from interest
            </Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18, marginTop: 4 }, { color: colors.textSoft }]}>
              Over 52 weeks at current rates: {'\n'}
              • Principal: $1,000 USDC (unchanged){'\n'}
              • STRK accumulated: ~{(STRK_PER_WEEK * 52).toFixed(0)} STRK{'\n'}
              • Value at current STRK price: ~${(STRK_PER_WEEK * 52 * STRK_PRICE).toFixed(0)}{'\n'}
              • Source of all STRK: Vesu interest — zero principal spent
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 6 LESSON 1 — starkzap-junior-allocator
// Portfolio Allocation Builder (Junior version)
// User allocates $10,000 across Starknet DeFi categories.
// Must resolve three explicit tensions: yield/liquidity,
// yield/price-exposure, and diversification.
// ══════════════════════════════════════════════════════════════════════════════

interface AllocCategory {
  id: string; label: string; icon: string; apy: string;
  liquidity: 'instant' | '21-day' | 'il-risk'; priceExposure: 'stable' | 'strk' | 'mixed';
  maxPct: number;
}

const CATEGORIES: AllocCategory[] = [
  { id: 'usdc_lending', label: 'USDC Lending (Vesu)', icon: '💵', apy: '8–12%', liquidity: 'instant', priceExposure: 'stable', maxPct: 60 },
  { id: 'strk_staking', label: 'STRK Staking', icon: '🏦', apy: '8–10%', liquidity: '21-day', priceExposure: 'strk', maxPct: 50 },
  { id: 'lp_stable', label: 'Stable LP (USDC/USDT)', icon: '💧', apy: '5–8%', liquidity: 'il-risk', priceExposure: 'stable', maxPct: 40 },
  { id: 'lp_volatile', label: 'STRK/USDC LP (Ekubo)', icon: '⚡', apy: '18–30%', liquidity: 'il-risk', priceExposure: 'mixed', maxPct: 30 },
  { id: 'reserve', label: 'Liquid Reserve (USDC)', icon: '🏦', apy: '0%', liquidity: 'instant', priceExposure: 'stable', maxPct: 100 },
];

export function JuniorAllocatorSim({ onComplete, onSkip, colors }: SimProps) {
  const TOTAL = 10000;
  const [allocations, setAllocations] = useState<Record<string, number>>({
    usdc_lending: 3000, strk_staking: 2000, lp_stable: 1000, lp_volatile: 1000, reserve: 3000,
  });

  const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = TOTAL - totalAllocated;

  const liquidPct = ((allocations.usdc_lending + allocations.reserve) / TOTAL) * 100;
  const strkExposurePct = ((allocations.strk_staking + allocations.lp_volatile * 0.5) / TOTAL) * 100;
  const maxSinglePct = Math.max(...Object.values(allocations)) / TOTAL * 100;

  const liquidOk = liquidPct >= 15 && liquidPct <= 40;
  const strkOk = strkExposurePct >= 10 && strkExposurePct <= 60;
  const concOk = maxSinglePct <= 50;
  const fullOk = Math.abs(remaining) <= 100;

  const allOk = liquidOk && strkOk && concOk && fullOk;

  const weightedApy = CATEGORIES.reduce((sum, cat) => {
    const catApy = cat.id === 'usdc_lending' ? 10
      : cat.id === 'strk_staking' ? 9
      : cat.id === 'lp_stable' ? 6.5
      : cat.id === 'lp_volatile' ? 22
      : 0;
    return sum + (allocations[cat.id] / TOTAL) * catApy;
  }, 0);

  function adjust(id: string, delta: number) {
    setAllocations(prev => {
      const newVal = Math.max(0, Math.min(TOTAL, (prev[id] || 0) + delta));
      return { ...prev, [id]: newVal };
    });
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🎯"
        title="Portfolio Allocation Builder"
        subtitle="Allocate $10,000. Resolve the three tensions before you can proceed."
        colors={colors}
      />

      {/* Three tensions */}
      <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.accent, marginBottom: Spacing.xs }]}>THREE TENSIONS TO RESOLVE</Text>
        {[
          { label: `Yield vs Liquidity: keep 15–40% instantly liquid`, ok: liquidOk, current: `${liquidPct.toFixed(0)}%` },
          { label: `Yield vs STRK exposure: 10–60% STRK-denominated`, ok: strkOk, current: `${strkExposurePct.toFixed(0)}%` },
          { label: `Diversification: no single position >50%`, ok: concOk, current: `${maxSinglePct.toFixed(0)}% max` },
        ].map((t, i) => (
          <View key={i} style={[s.tensionRow, { borderColor: t.ok ? colors.green + '40' : '#ef4444' + '40',
            backgroundColor: t.ok ? colors.greenSoft : colors.redSoft }]}>
            <Text style={[{ fontSize: FontSize.xs, flex: 1 }, { color: colors.text }]}>{t.label}</Text>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: t.ok ? colors.green : '#ef4444' }]}>
              {t.current} {t.ok ? '✓' : '✗'}
            </Text>
          </View>
        ))}
      </View>

      {/* Allocation controls */}
      {CATEGORIES.map(cat => (
        <View key={cat.id} style={[s.allocRow, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '900' }, { color: colors.text }]}>
              {cat.icon} {cat.label}
            </Text>
            <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>
              {cat.apy} APY · {cat.liquidity === 'instant' ? '⚡ Instant' : cat.liquidity === '21-day' ? '⏳ 21-day exit' : '⚠ IL risk'} · {cat.priceExposure === 'stable' ? '🟢 Stable' : cat.priceExposure === 'strk' ? '🔵 STRK' : '🟡 Mixed'}
            </Text>
          </View>
          <View style={s.row}>
            <TouchableOpacity style={s.adjBtn} onPress={() => adjust(cat.id, -500)}>
              <Text style={[{ fontWeight: '800' }, { color: colors.accent }]}>−</Text>
            </TouchableOpacity>
            <Text style={[{ minWidth: 60, textAlign: 'center', fontWeight: '800' }, { color: colors.text }]}>
              ${allocations[cat.id].toLocaleString()}
            </Text>
            <TouchableOpacity style={s.adjBtn} onPress={() => adjust(cat.id, 500)}>
              <Text style={[{ fontWeight: '800' }, { color: colors.accent }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Summary */}
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <View style={s.row}>
          <InfoRow icon="💰" label="Weighted APY" value={`${weightedApy.toFixed(1)}%`} colors={colors} />
          <InfoRow icon="📊" label="Remaining" value={`$${remaining.toLocaleString()}`} colors={colors} />
        </View>
      </View>

      {!fullOk && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.gold }]}>
            {remaining > 0 ? `$${remaining.toLocaleString()} unallocated — deploy it.` : `$${Math.abs(remaining).toLocaleString()} over budget — reduce some positions.`}
          </Text>
        </View>
      )}

      {allOk
        ? <ActionBtn label="Allocation complete →" onPress={onComplete} variant="starknet" colors={colors} />
        : <ActionBtn label="Adjust until all three tensions are resolved" onPress={() => {}} disabled variant="ghost" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 6 LESSON 3 — starkzap-risk-scorecard
// 7-Dimension Protocol Risk Scoring Tool
// User scores a protocol across all 7 dimensions.
// Sees the combined risk verdict and learns which dimensions
// matter most (upgrade mechanism).
// ══════════════════════════════════════════════════════════════════════════════

const RISK_DIMENSIONS: ReadonlyArray<{ id: string; label: string; icon: string; description: string; critical?: boolean }> = [
  { id: 'audit', label: 'Audit quality', icon: '🔍', description: 'Multiple firms, recent, all findings resolved?' },
  { id: 'team', label: 'Team transparency', icon: '👤', description: 'Deanonymised, track record, responsive?' },
  { id: 'upgrade', label: 'Upgrade mechanism', icon: '⚙️', description: 'Who can change code, how many keys, timelock?', critical: true },
  { id: 'tokenomics', label: 'Token distribution', icon: '📊', description: 'Insider concentration? Vesting cliffs?' },
  { id: 'oracle', label: 'Oracle dependency', icon: '🔮', description: 'Which oracle? TWAP or spot? Single source?' },
  { id: 'tvl', label: 'TVL quality', icon: '💰', description: 'Organic deposits? Volume/TVL ratio?' },
  { id: 'history', label: 'Exploit history', icon: '⚠️', description: 'Prior exploits? Severity? Recovery?' },
] as const;

// Mock protocol to score
const PROTOCOL_TO_SCORE = {
  name: 'Example Protocol Alpha',
  hints: {
    audit: 'Two audits: Trail of Bits (8 months ago), OpenZeppelin (14 months ago). 3 medium findings resolved.',
    team: 'Named team, GitHub active, 2 years on Starknet. No prior incidents.',
    upgrade: '3-of-5 multisig. No timelock. Changes execute immediately once threshold met.',
    tokenomics: 'Team holds 18% with 6-month cliff. Foundation 25%. Public 40%. Rest ecosystem fund.',
    oracle: 'Uses Pragma TWAP (20-minute window). Primary source: Chainlink for cross-chain prices.',
    tvl: 'TVL $48M. Volume/TVL 18% weekly. 2,800 unique 30d wallets. Holding duration avg 5 months.',
    history: 'No prior exploits. One bug bounty claim ($15K) for a low-severity finding, patched in 3 days.',
  },
};

export function RiskScorecardSim({ onComplete, onSkip, colors }: SimProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(new Set<string>());
  const [finalised, setFinalised] = useState(false);

  function setScore(id: string, v: number) {
    setScores(prev => ({ ...prev, [id]: v }));
  }

  function revealHint(id: string) {
    setRevealed(prev => new Set(prev).add(id));
  }

  const scoredCount = Object.keys(scores).length;
  const allScored = scoredCount === RISK_DIMENSIONS.length;
  const avgScore = allScored ? Object.values(scores).reduce((a, b) => a + b, 0) / RISK_DIMENSIONS.length : 0;
  const upgradeScore = scores['upgrade'] ?? null;
  const verdict = avgScore >= 4 ? 'Low Risk' : avgScore >= 3 ? 'Medium Risk' : 'High Risk';
  const verdictColor = avgScore >= 4 ? colors.green : avgScore >= 3 ? '#f59e0b' : '#ef4444';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔐"
        title="Protocol Risk Scorecard"
        subtitle="Score each dimension 1–5. Reveal the hint first, then rate. Upgrade mechanism is the critical one."
        colors={colors}
      />

      <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
        <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.accent }]}>
          Protocol: {PROTOCOL_TO_SCORE.name}
        </Text>
      </View>

      {RISK_DIMENSIONS.map(dim => {
        const hint = PROTOCOL_TO_SCORE.hints[dim.id as keyof typeof PROTOCOL_TO_SCORE.hints];
        const isRevealed = revealed.has(dim.id);
        const currentScore = scores[dim.id] ?? 0;

        return (
          <View key={dim.id} style={[s.dimCard, {
            borderColor: dim.critical ? '#f59e0b' : colors.border,
            backgroundColor: colors.bgSecondary,
          }]}>
            <View style={s.row}>
              <Text style={{ fontSize: 18 }}>{dim.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: FontSize.xs, fontWeight: '900' }, { color: colors.text }]}>
                  {dim.label} {dim.critical ? '⭐ CRITICAL' : ''}
                </Text>
                <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>{dim.description}</Text>
              </View>
            </View>

            {!isRevealed ? (
              <TouchableOpacity style={[s.revealBtn, { borderColor: colors.accent }]} onPress={() => revealHint(dim.id)}>
                <Text style={[{ fontSize: FontSize.xs, fontWeight: '700' }, { color: colors.accent }]}>
                  Reveal protocol data →
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={[s.hintBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.text }]}>{hint}</Text>
                </View>
                <View style={s.row}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <TouchableOpacity key={v}
                      style={[s.scoreBtn, { borderColor: currentScore === v ? colors.accent : colors.border },
                        currentScore === v && { backgroundColor: colors.accent }]}
                      onPress={() => setScore(dim.id, v)}>
                      <Text style={[{ fontSize: 11, fontWeight: '800' },
                        { color: currentScore === v ? '#fff' : colors.textSoft }]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={[{ fontSize: 10, marginLeft: 4 }, { color: colors.textSoft }]}>
                    {currentScore === 0 ? 'Rate' : currentScore <= 2 ? 'High risk' : currentScore <= 3 ? 'Medium' : 'Good'}
                  </Text>
                </View>
              </>
            )}
          </View>
        );
      })}

      {allScored && !finalised && (
        <ActionBtn label="Finalise Assessment" onPress={() => setFinalised(true)} variant="primary" colors={colors} />
      )}

      {finalised && (
        <>
          <View style={[s.resultBox, { borderColor: verdictColor + '40', backgroundColor: verdictColor + '15' }]}>
            <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: verdictColor }]}>
              {verdict} — avg {avgScore.toFixed(1)}/5
            </Text>
            {upgradeScore !== null && upgradeScore <= 2 && (
              <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: '#ef4444' }]}>
                ⚠️ Upgrade mechanism score: {upgradeScore}/5 — this is the critical dimension.
                A 3-of-5 multisig with no timelock means 3 key holders can change any contract parameter instantly.
                Even a strong score elsewhere is overshadowed by an exploitable upgrade path.
              </Text>
            )}
            {upgradeScore !== null && upgradeScore >= 4 && (
              <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: colors.textSoft }]}>
                Upgrade mechanism looks reasonable. The critical risk is managed.
              </Text>
            )}
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      {!allScored && (
        <Text style={[{ fontSize: FontSize.xs, textAlign: 'center' }, { color: colors.textSoft }]}>
          {scoredCount}/{RISK_DIMENSIONS.length} dimensions scored
        </Text>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 6 LESSON 4 — starkzap-loop-builder
// Loop / Cross-Protocol Yield Calculator
// User builds a supply→borrow→re-supply loop. Sees gross yield,
// borrow cost, net yield, and at what point adding more layers
// reduces rather than increases net return.
// ══════════════════════════════════════════════════════════════════════════════

export function LoopBuilderSim({ onComplete, onSkip, colors }: SimProps) {
  const [principal, setPrincipal] = useState(10000);
  const [supplyApy, setSupplyApy] = useState(10);
  const [borrowApy, setBorrowApy] = useState(6);
  const [ltvPct, setLtvPct] = useState(70);
  const [loops, setLoops] = useState(1);

  // Calculate loop yield
  // After N loops: effective principal = P × (1 + LTV + LTV² + ... LTV^N)
  const ltv = ltvPct / 100;
  const effectivePrincipal = principal * ((1 - Math.pow(ltv, loops + 1)) / (1 - ltv));
  const grossYield = effectivePrincipal * (supplyApy / 100);

  // Borrow at each loop except the first
  const totalBorrowed = principal * ((ltv - Math.pow(ltv, loops + 1)) / (1 - ltv));
  const borrowCost = totalBorrowed * (borrowApy / 100);

  const netYield = grossYield - borrowCost;
  const netApy = (netYield / principal) * 100;
  const isViable = borrowApy < supplyApy && netApy > supplyApy;

  const LOOP_OPTIONS = [1, 2, 3, 4];

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔄"
        title="Loop / Cross-Protocol Yield Builder"
        subtitle="Stack supply and borrow positions. See where more loops stops adding return."
        colors={colors}
      />

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SUPPLY APY</Text>
          <View style={s.miniRow}>
            {[8, 10, 12, 15].map(v => (
              <TouchableOpacity key={v}
                style={[s.miniBtn, { borderColor: supplyApy === v ? colors.green : colors.border },
                  supplyApy === v && { backgroundColor: colors.green + '20' }]}
                onPress={() => setSupplyApy(v)}>
                <Text style={[{ fontSize: 10, fontWeight: '800' },
                  { color: supplyApy === v ? colors.green : colors.textSoft }]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>BORROW APY</Text>
          <View style={s.miniRow}>
            {[4, 6, 8, 12].map(v => (
              <TouchableOpacity key={v}
                style={[s.miniBtn, { borderColor: borrowApy === v ? '#ef4444' : colors.border },
                  borrowApy === v && { backgroundColor: '#ef4444' + '20' }]}
                onPress={() => setBorrowApy(v)}>
                <Text style={[{ fontSize: 10, fontWeight: '800' },
                  { color: borrowApy === v ? '#ef4444' : colors.textSoft }]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LTV PER LOOP</Text>
      <View style={s.row}>
        {[50, 60, 70, 80].map(v => (
          <TouchableOpacity key={v}
            style={[s.toggleBtn, { borderColor: ltvPct === v ? colors.accent : colors.border },
              ltvPct === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setLtvPct(v)}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' },
              { color: ltvPct === v ? colors.accent : colors.textSoft }]}>{v}%</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>NUMBER OF LOOPS</Text>
      <View style={s.row}>
        {LOOP_OPTIONS.map(v => (
          <TouchableOpacity key={v}
            style={[s.toggleBtn, { borderColor: loops === v ? colors.accent : colors.border },
              loops === v && { backgroundColor: colors.accentSoft }]}
            onPress={() => setLoops(v)}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' },
              { color: loops === v ? colors.accent : colors.textSoft }]}>
              {v} {v === 1 ? 'loop' : 'loops'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="💰" label="Effective capital deployed" value={`$${effectivePrincipal.toFixed(0)}`} colors={colors} />
        <InfoRow icon="📈" label="Gross yield" value={`$${grossYield.toFixed(2)}/yr`} colors={colors} />
        <InfoRow icon="💸" label="Borrow cost" value={`$${borrowCost.toFixed(2)}/yr`} colors={colors} />
        <InfoRow icon="🎯" label="Net yield" value={`$${netYield.toFixed(2)}/yr`} colors={colors} />
      </View>

      <View style={[s.resultBox, {
        borderColor: (netApy > supplyApy ? colors.green : '#ef4444') + '50',
        backgroundColor: (netApy > supplyApy ? colors.green : '#ef4444') + '10',
      }]}>
        <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' },
          { color: netApy > supplyApy ? colors.green : '#ef4444' }]}>
          Net APY: {netApy.toFixed(1)}% vs {supplyApy}% base
        </Text>
        <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: colors.textSoft }]}>
          {!isViable
            ? `⚠️ Borrow APY (${borrowApy}%) ≥ Supply APY (${supplyApy}%) — looping is irrational. Every loop loses money.`
            : netApy <= supplyApy
            ? `Adding loops reduced net APY below base. The borrow cost is eroding the gain.`
            : `${loops} loop${loops > 1 ? 's' : ''} amplifies yield from ${supplyApy}% → ${netApy.toFixed(1)}%. Each loop also adds ${loops} × smart contract risk exposure.`}
        </Text>
      </View>

      {/* Risk warning for loops > 2 */}
      {loops >= 3 && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: '#ef4444' }]}>
            ⚠️ {loops} loops = {loops} protocols with separate smart contract risk.
            A health factor cascade: if collateral price drops, the innermost borrow liquidates first,
            then the outer borrow loses its repayment source. Loops collapse from the inside out.
          </Text>
        </View>
      )}

      <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─── Shared styles ─────────────────────────────────────────────────────────────
const _s2 = StyleSheet.create({
  row:          { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  miniRow:      { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  toggleBtn:    { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  leverageBtn:  { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center', minWidth: 44 },
  miniBtn:      { borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center' },
  alertBox:     { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  resultBox:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  rateBox:      { borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, gap: Spacing.xs },
  rateLabel:    { fontSize: FontSize.xs, fontWeight: '600' },
  rateValue:    { fontSize: FontSize.xl, fontWeight: '900' },
  divider:      { width: 1, alignSelf: 'stretch' },
  stepRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  stepBtn:      { borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 4, paddingHorizontal: 6, minWidth: 36, alignItems: 'center' },
  kinkBar:      { height: 16, borderRadius: 8, overflow: 'hidden', position: 'relative', borderWidth: 1 },
  kinkFill:     { position: 'absolute', left: 0, height: '100%', borderRadius: 8 },
  kinkMark:     { position: 'absolute', top: 0, width: 2, height: '100%', backgroundColor: '#6366f1' },
  kinkLabel:    { position: 'absolute', top: -16, fontSize: 9, fontWeight: '800', color: '#6366f1', left: 4 },
  hfBox:        { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  priceChip:    { borderRadius: 6, padding: 4, borderWidth: 1, alignItems: 'center', minWidth: 36 },
  posName:      { fontSize: FontSize.sm, fontWeight: '900' },
  posSub:       { fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 },
  protocolCard: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  allocRow:     { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  tensionRow:   { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, marginBottom: 4, gap: Spacing.sm },
  adjBtn:       { padding: Spacing.sm, borderRadius: Radius.md },
  dimCard:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, gap: Spacing.sm },
  hintBox:      { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1 },
  revealBtn:    { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: 4 },
  scoreBtn:     { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 4, alignItems: 'center' },
  loopBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
});

// ════════════════════════════════════════════════════════════════════════════
// LAB 7: Impermanent Loss & Range Builder
// ════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// LAB 7 LESSON 3 — starkzap-range-builder
// Concentrated Range Builder
// User picks lower and upper price bounds, sees capital efficiency,
// in-range probability based on historical range, and estimated
// break-even at a default fee APY.
// Also simulates a price move to show in-range vs out-of-range status.
// Unlock: user must have seen high efficiency (>= 5×), set an asymmetric
// range, and simulated an out-of-range event.
// ══════════════════════════════════════════════════════════════════════════════

const CURRENT_PRICE = 1.00; // STRK baseline

export function RangeBuilderSim({ onComplete, onSkip, colors }: SimProps) {
  const [lower, setLower] = useState(0.80);
  const [upper, setUpper] = useState(1.20);
  const [simulatedPrice, setSimulatedPrice] = useState(1.00);
  const [positionSize, setPositionSize] = useState(8000);
  const [feeApyInRange, setFeeApyInRange] = useState(150);

  const [hasSeenHighEfficiency, setHasSeenHighEfficiency] = useState(false);
  const [hasSeenAsymmetric, setHasSeenAsymmetric] = useState(false);
  const [hasSeenOutOfRange, setHasSeenOutOfRange] = useState(false);

  const inRange = simulatedPrice >= lower && simulatedPrice <= upper;
  const rangeWidth = upper - lower;

  // Capital efficiency vs full range model (full range ≈ 0 to 2× current price)
  const fullRangeWidth = CURRENT_PRICE * 2;
  const efficiencyRaw = fullRangeWidth / rangeWidth;
  const efficiency = Math.min(efficiencyRaw, 50); // cap display at 50×

  // Asymmetry: difference between upside room and downside room
  const upsideRoom = upper - CURRENT_PRICE;
  const downsideRoom = CURRENT_PRICE - lower;
  const asymmetryRatio = upsideRoom / downsideRoom;
  const isAsymmetric = Math.abs(asymmetryRatio - 1) > 0.15; // >15% tilt

  // IL at range boundaries (what IL would be if price exits at the boundary)
  const rUpper = upper / CURRENT_PRICE;
  const rLower = lower / CURRENT_PRICE;
  const ilAtUpper = Math.abs((2 * Math.sqrt(rUpper)) / (1 + rUpper) - 1) * 100;
  const ilAtLower = Math.abs((2 * Math.sqrt(rLower)) / (1 + rLower) - 1) * 100;

  // Fee income estimates
  const dailyFeeInRange = (positionSize * feeApyInRange) / 100 / 365;
  const breakEvenDaysUpper = ilAtUpper > 0
    ? Math.round((positionSize * ilAtUpper / 100) / dailyFeeInRange)
    : 0;
  const breakEvenDaysLower = ilAtLower > 0
    ? Math.round((positionSize * ilAtLower / 100) / dailyFeeInRange)
    : 0;

  useEffect(() => {
    if (efficiency >= 5) setHasSeenHighEfficiency(true);
    if (isAsymmetric) setHasSeenAsymmetric(true);
    if (!inRange) setHasSeenOutOfRange(true);
  }, [efficiency, isAsymmetric, inRange]);

  const canComplete = hasSeenHighEfficiency && hasSeenOutOfRange;

  const effColor = efficiency >= 10 ? colors.green : efficiency >= 5 ? '#f59e0b' : colors.textSoft;
  const inRangeColor = inRange ? colors.green : '#ef4444';

  const LOWER_OPTIONS = [0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95];
  const UPPER_OPTIONS = [1.05, 1.10, 1.15, 1.20, 1.30, 1.40, 1.60, 2.00, 2.50];
  const PRICE_STEPS = [0.50, 0.65, 0.75, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.20, 1.40, 1.60, 2.00, 2.50];

  const fmt = (n: number, dp = 2) => n.toFixed(dp);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🎯"
        title="Concentrated Range Builder"
        subtitle="Set your LP price range. See how width affects capital efficiency, IL at boundaries, and fee break-even."
        colors={colors}
      />

      {/* Current price display */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>ENTRY PRICE (STRK/USDC)</Text>
        <Text style={[s.bigNum, { color: colors.text }]}>${fmt(CURRENT_PRICE, 2)}</Text>
        <Text style={[s.sub, { color: colors.textSoft }]}>Your position centres at this price</Text>
      </View>

      {/* Range selector */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>LOWER BOUND</Text>
        <View style={s.stepRow}>
          {LOWER_OPTIONS.map(v => (
            <TouchableOpacity
              key={v}
              style={[
                s.stepBtn,
                {
                  backgroundColor: Math.abs(lower - v) < 0.001 ? '#ef4444' : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => { if (v < upper) setLower(v); }}
            >
              <Text style={[s.stepLabel, { color: Math.abs(lower - v) < 0.001 ? '#fff' : colors.text }]}>
                ${fmt(v, 2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.label, { color: colors.textSoft, marginTop: Spacing.sm }]}>UPPER BOUND</Text>
        <View style={s.stepRow}>
          {UPPER_OPTIONS.map(v => (
            <TouchableOpacity
              key={v}
              style={[
                s.stepBtn,
                {
                  backgroundColor: Math.abs(upper - v) < 0.001 ? colors.green : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => { if (v > lower) setUpper(v); }}
            >
              <Text style={[s.stepLabel, { color: Math.abs(upper - v) < 0.001 ? '#fff' : colors.text }]}>
                ${fmt(v, 2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[s.rangeBar, { marginTop: Spacing.md }]}>
          <Text style={[s.rangeLabel, { color: '#ef4444' }]}>${fmt(lower, 2)}</Text>
          <View style={[s.rangeTrack, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                s.rangeFill,
                {
                  backgroundColor: colors.primary,
                  left: `${Math.max(0, (lower / 3) * 100)}%` as any,
                  width: `${Math.min(100, ((upper - lower) / 3) * 100)}%` as any,
                },
              ]}
            />
            <View
              style={[
                s.rangeCurrent,
                {
                  left: `${(CURRENT_PRICE / 3) * 100}%` as any,
                  backgroundColor: colors.text,
                },
              ]}
            />
          </View>
          <Text style={[s.rangeLabel, { color: colors.green }]}>${fmt(upper, 2)}</Text>
        </View>
      </View>

      {/* Efficiency and metrics */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>RANGE METRICS</Text>
        <InfoRow
          label="Capital efficiency"
          value={`${fmt(efficiency, 1)}× vs full range`}
          valueColor={effColor}
          colors={colors}
        />
        <InfoRow
          label="Range width"
          value={`$${fmt(lower, 2)} – $${fmt(upper, 2)} (${fmt(rangeWidth / CURRENT_PRICE * 100, 0)}% of entry price)`}
          colors={colors}
        />
        <InfoRow
          label="Upside room"
          value={`+${fmt((upsideRoom / CURRENT_PRICE) * 100, 0)}%`}
          colors={colors}
        />
        <InfoRow
          label="Downside room"
          value={`−${fmt((downsideRoom / CURRENT_PRICE) * 100, 0)}%`}
          colors={colors}
        />
        {isAsymmetric && (
          <InfoRow
            label="Range tilt"
            value={asymmetryRatio > 1 ? `Bullish (${fmt(asymmetryRatio, 2)}× more upside room)` : `Bearish (${fmt(1 / asymmetryRatio, 2)}× more downside room)`}
            valueColor={colors.primary}
            colors={colors}
          />
        )}
        <InfoRow
          label="IL if exits upper bound"
          value={`−${fmt(ilAtUpper, 2)}%`}
          colors={colors}
        />
        <InfoRow
          label="IL if exits lower bound"
          value={`−${fmt(ilAtLower, 2)}%`}
          colors={colors}
        />
      </View>

      {/* Fee break-even */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>FEE INCOME BREAK-EVEN</Text>
        <View style={s.stepRow}>
          {[80, 120, 150, 200, 300].map(apy => (
            <TouchableOpacity
              key={apy}
              style={[
                s.stepBtn,
                {
                  backgroundColor: feeApyInRange === apy ? colors.primary : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFeeApyInRange(apy)}
            >
              <Text style={[s.stepLabel, { color: feeApyInRange === apy ? '#fff' : colors.text }]}>
                {apy}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <InfoRow
          label="Daily fee income (when in range)"
          value={`$${(dailyFeeInRange).toFixed(2)}/day`}
          colors={colors}
        />
        <InfoRow
          label="Days to break even if exits upper"
          value={`${breakEvenDaysUpper} days`}
          colors={colors}
        />
        <InfoRow
          label="Days to break even if exits lower"
          value={`${breakEvenDaysLower} days`}
          colors={colors}
        />
      </View>

      {/* Price simulator */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>SIMULATE PRICE MOVE</Text>
        <Text style={[s.sub, { color: inRangeColor }]}>
          {inRange ? '✅ IN RANGE — earning fees' : `❌ OUT OF RANGE at $${fmt(simulatedPrice, 2)} — earning zero fees`}
        </Text>
        {!inRange && (
          <Text style={[s.sub, { color: colors.textSoft, marginTop: 4 }]}>
            {simulatedPrice > upper
              ? `Position is 100% USDC (STRK was sold as price rose above $${fmt(upper, 2)})`
              : `Position is 100% STRK (USDC was used to buy STRK as price fell below $${fmt(lower, 2)})`
            }
          </Text>
        )}
        <View style={s.stepRow}>
          {PRICE_STEPS.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                s.stepBtn,
                {
                  backgroundColor: Math.abs(simulatedPrice - p) < 0.001
                    ? (p >= lower && p <= upper ? colors.green : '#ef4444')
                    : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSimulatedPrice(p)}
            >
              <Text style={[s.stepLabel, { color: Math.abs(simulatedPrice - p) < 0.001 ? '#fff' : colors.text }]}>
                ${p < 1 ? fmt(p, 2) : fmt(p, 2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Position size */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>POSITION SIZE</Text>
        <View style={s.stepRow}>
          {[5000, 8000, 15000, 30000].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                s.stepBtn,
                {
                  backgroundColor: positionSize === size ? colors.primary : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setPositionSize(size)}
            >
              <Text style={[s.stepLabel, { color: positionSize === size ? '#fff' : colors.text }]}>
                ${(size / 1000).toFixed(0)}k
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <InfoRow
          label="Max IL at upper bound"
          value={`$${((positionSize * ilAtUpper) / 100).toFixed(0)}`}
          colors={colors}
        />
        <InfoRow
          label="Annual fee income (when in range)"
          value={`$${((positionSize * feeApyInRange) / 100).toFixed(0)}/yr`}
          colors={colors}
        />
      </View>

      {/* Insights */}
      {hasSeenHighEfficiency && (
        <View style={[s.insight, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]}>
          <Text style={[s.insightTitle, { color: colors.primary }]}>⚡ High capital efficiency</Text>
          <Text style={[s.insightText, { color: colors.text }]}>
            Your narrow range achieves {fmt(efficiency, 1)}× capital efficiency — each dollar deployed earns as if {fmt(efficiency, 1)}× more liquidity was in the pool.
            This high rate only applies while price stays within your range.
          </Text>
        </View>
      )}

      {hasSeenAsymmetric && (
        <View style={[s.insight, { backgroundColor: colors.surfaceAlt, borderColor: '#f59e0b' }]}>
          <Text style={[s.insightTitle, { color: '#f59e0b' }]}>↗ Asymmetric range set</Text>
          <Text style={[s.insightText, { color: colors.text }]}>
            Your range has {asymmetryRatio > 1 ? 'more upside' : 'more downside'} room — expressing a {asymmetryRatio > 1 ? 'bullish' : 'bearish'} view.
            This is intentional LP management: aligning your range with your market conviction.
          </Text>
        </View>
      )}

      {hasSeenOutOfRange && (
        <View style={[s.insight, { backgroundColor: colors.surfaceAlt, borderColor: '#ef4444' }]}>
          <Text style={[s.insightTitle, { color: '#ef4444' }]}>🚫 Out-of-range event</Text>
          <Text style={[s.insightText, { color: colors.text }]}>
            When price exits your range, fee income drops to zero and your position converts fully to one asset.
            The wider your range, the less often this happens — but at lower capital efficiency.
          </Text>
        </View>
      )}

      <ActionBtn
        label={canComplete ? 'Complete Simulator' : `Explore ranges to unlock (efficiency ≥5×: ${hasSeenHighEfficiency ? '✓' : '○'}, out-of-range: ${hasSeenOutOfRange ? '✓' : '○'})`}
        onPress={canComplete ? onComplete : undefined}
        disabled={!canComplete}
        colors={colors}
      />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────

const _s3 = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bigNum: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  sub: {
    fontSize: FontSize.sm,
  },
  formula: {
    fontSize: FontSize.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  stepBtn: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  insight: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: Spacing.md,
    gap: 6,
  },
  insightTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  insightText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  rangeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  rangeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  rangeCurrent: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 12,
    borderRadius: 2,
    marginLeft: -2,
  },
  rangeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    minWidth: 40,
  },
});

// ════════════════════════════════════════════════════════════════════════════
// LAB 8: Bridge simulators
// ════════════════════════════════════════════════════════════════════════════

// ── Shared bridge helpers ──────────────────────────────────────────────────────

/** Verify ETH or USDC arrived on Starknet after a simulated bridge. */
async function verifyArrival(
  wallet: StarkzapWallet | null,
  token: 'ETH' | 'USDC',
): Promise<string> {
  if (!wallet || !isStarkzapAvailable()) {
    return token === 'ETH' ? MOCK.strkBalance.replace('STRK', 'ETH') : MOCK.usdcBalance;
  }
  try {
    const tok = token === 'ETH' ? STARKNET_TOKENS.ETH : STARKNET_TOKENS.USDC;
    const bal = await wallet.balanceOf(tok);
    return bal.toFormatted();
  } catch {
    return token === 'ETH' ? '2.00 ETH' : '500.00 USDC';
  }
}

/** Mock bridge tx hash with slight randomisation so each run looks distinct. */
function mockBridgeTxHash() {
  return '0x' + Math.random().toString(16).slice(2, 12) + '...bridge';
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 1 — starkzap-bridge-lockmint
// Lock-and-Mint vs Burn-and-Mint Visualizer
// ══════════════════════════════════════════════════════════════════════════════

type LockMintStep =
  | 'idle' | 'locking' | 'locked' | 'minting' | 'complete'
  | 'exploited' | 'burning' | 'attesting' | 'native_minted';

export function BridgeLockMintSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [mode, setMode] = useState<'lock' | 'burn'>('lock');
  const [step, setStep] = useState<LockMintStep>('idle');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetStep() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep('idle'); setBalance(null); setTxHash(null);
  }

  async function runLockMint() {
    setLoading(true);
    setStep('locking');
    await simulateDelay(900);
    setStep('locked');
    await simulateDelay(700);
    setStep('minting');
    await simulateDelay(1000);
    const hash = mockBridgeTxHash();
    setTxHash(hash);
    // Real SDK: verify ETH balance on Starknet after simulated bridge
    const w = starknetWallet as StarkzapWallet | null;
    const bal = await verifyArrival(w, 'ETH');
    setBalance(bal);
    setStep('complete');
    setLoading(false);
  }

  async function runBurnMint() {
    setLoading(true);
    setStep('burning');
    await simulateDelay(1000);
    setStep('attesting');
    await simulateDelay(1200);
    const hash = mockBridgeTxHash();
    setTxHash(hash);
    const w = starknetWallet as StarkzapWallet | null;
    const bal = await verifyArrival(w, 'USDC');
    setBalance(bal);
    setStep('native_minted');
    setLoading(false);
  }

  async function triggerExploit() {
    setLoading(true);
    await simulateDelay(800);
    setStep('exploited');
    setLoading(false);
  }

  const isLock = mode === 'lock';

  const stepLabels: Partial<Record<LockMintStep, string>> = {
    idle: 'Ready to bridge',
    locking: 'Locking ETH in Starkgate contract on Ethereum…',
    locked: 'ETH locked in contract ✓',
    minting: 'Minting wETH on Starknet…',
    complete: 'Bridge complete — wETH received on Starknet',
    exploited: '⚠ Contract drained — your wETH is worthless',
    burning: 'Burning USDC on Ethereum — permanently destroyed…',
    attesting: 'Circle attestation service confirming burn…',
    native_minted: 'Native USDC minted on Starknet by Circle ✓',
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="⛓"
        title="Bridge Mechanics Visualizer"
        subtitle="Execute a bridge and observe what actually locks, mints, and burns."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Mode toggle */}
      <View style={s.row}>
        {(['lock', 'burn'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.modeBtn, { borderColor: colors.border },
              mode === m && { backgroundColor: m === 'lock' ? '#f59e0b' : '#0d9488', borderColor: 'transparent' }]}
            onPress={() => { setMode(m); resetStep(); }}
          >
            <Text style={[s.modeBtnTxt, { color: mode === m ? '#fff' : colors.textSoft }]}>
              {m === 'lock' ? '🔒 Starkgate\nLock-and-Mint' : '🔥 CCTP\nBurn-and-Mint'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status display */}
      {step !== 'idle' && (
        <View style={[s.statusBox, {
          backgroundColor: step === 'exploited' ? colors.redSoft : step === 'native_minted' ? colors.greenSoft : colors.bgSecondary,
          borderColor: step === 'exploited' ? colors.red + '40' : step === 'native_minted' ? colors.green + '40' : colors.border,
        }]}>
          <Text style={[s.statusTxt, { color: step === 'exploited' ? colors.red : step === 'native_minted' ? colors.green : colors.textSoft }]}>
            {stepLabels[step] ?? step}
          </Text>
        </View>
      )}

      {/* Flow steps */}
      {step !== 'idle' && (
        <View style={{ gap: Spacing.xs }}>
          <InfoRow icon="🇺🇸" label="Ethereum" value={
            isLock
              ? (['locked','minting','complete','exploited'].includes(step) ? '2 ETH — LOCKED in contract' : '2 ETH')
              : (['attesting','native_minted'].includes(step) ? 'USDC — BURNED ✓' : 'USDC available')
          } colors={colors} />
          <InfoRow icon="🔗" label={isLock ? 'Starkgate Contract' : 'Circle Attestation'} value={
            step === 'locking' ? 'Receiving…' :
            step === 'locked' ? 'Holding 2 ETH' :
            step === 'minting' ? 'Authorising mint…' :
            step === 'complete' ? '2 ETH locked ✓' :
            step === 'exploited' ? '💥 DRAINED — empty' :
            step === 'burning' ? 'Burn confirmed…' :
            step === 'attesting' ? 'Signing attestation…' :
            step === 'native_minted' ? 'Attested ✓' : '—'
          } colors={colors} />
          <InfoRow icon="⚡" label="Starknet" value={
            isLock
              ? (step === 'minting' ? 'Minting wETH…' : step === 'complete' ? '2 wETH ✓ (representation)' : step === 'exploited' ? 'wETH = worthless IOU' : '—')
              : (step === 'native_minted' ? `${balance ?? 'USDC'} (native — issued by Circle)` : '—')
          } colors={colors} />
        </View>
      )}

      {/* Real balance after bridge */}
      {balance && step !== 'exploited' && (
        <InfoRow icon="💰" label="Your Starknet balance (verified)" value={balance} colors={colors} />
      )}

      {/* Tx result */}
      {txHash && step !== 'exploited' && (
        <TxResult
          hash={txHash}
          label={isLock ? 'Simulated bridge — wETH minted' : 'Simulated CCTP — native USDC minted'}
          colors={colors}
        />
      )}

      {/* Exploit outcome */}
      {step === 'exploited' && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: colors.red + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.red }]}>
            The Starkgate contract held your 2 ETH as backing. The exploit drained it.
            Your Starknet wETH is now a claim with no collateral — worthless.{'\n\n'}
            Switch to CCTP (Burn-and-Mint) to see why this exploit is impossible
            when there is no locked pool.
          </Text>
        </View>
      )}

      {/* CCTP no-exploit note */}
      {step === 'native_minted' && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.green }]}>
            There is no locked USDC on Ethereum to steal. The source token was
            permanently destroyed. Your Starknet USDC is native — issued by Circle.
            No exploit button exists because there is no collateral pool to drain.
          </Text>
        </View>
      )}

      {/* Actions */}
      {step === 'idle' && (
        <ActionBtn
          label={isLock ? '🔒 Bridge 2 ETH via Starkgate' : '🔥 Bridge USDC via CCTP'}
          onPress={isLock ? runLockMint : runBurnMint}
          loading={loading}
          variant={isLock ? 'primary' : 'starknet'}
          colors={colors}
        />
      )}
      {step === 'complete' && (
        <>
          <ActionBtn
            label="💥 Simulate Bridge Exploit"
            onPress={triggerExploit}
            loading={loading}
            variant="primary"
            colors={colors}
          />
          <ActionBtn label="Reset" onPress={resetStep} variant="ghost" colors={colors} />
        </>
      )}
      {step === 'exploited' && (
        <ActionBtn label="Try CCTP instead →" onPress={() => { setMode('burn'); resetStep(); }} variant="starknet" colors={colors} />
      )}
      {step === 'native_minted' && (
        <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      )}
      {!loading && ['locking','locked','minting','burning','attesting'].includes(step) && (
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 2 — starkzap-bridge-selector
// ETH → Starknet Bridge Selector with time-accelerated 12-hour wait
// ══════════════════════════════════════════════════════════════════════════════

type BridgeChoice = 'starkgate' | 'cctp' | 'orbiter';
type SelectorStep = 'pick' | 'executing' | 'waiting' | 'complete' | 'error';

const BRIDGE_SCENARIOS = [
  { label: '1  Bridge $80,000 ETH to Starknet', asset: 'ETH' as const, amount: 80000 },
  { label: '2  Bridge $55,000 USDC to Starknet', asset: 'USDC' as const, amount: 55000 },
  { label: '3  Bridge $600 ETH to Starknet', asset: 'ETH' as const, amount: 600 },
];

export function BridgeSelectorSim({ onComplete, onSkip, colors }: SimProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [bridge, setBridge] = useState<BridgeChoice | null>(null);
  const [flowStep, setFlowStep] = useState<SelectorStep>('pick');
  const [loading, setLoading] = useState(false);
  const [fastForwarded, setFastForwarded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const scenario = BRIDGE_SCENARIOS[scenarioIdx];

  function reset(newScenario?: number) {
    setBridge(null); setFlowStep('pick'); setLoading(false);
    setFastForwarded(false); setErrorMsg(''); setTxHash(null);
    if (newScenario !== undefined) setScenarioIdx(newScenario);
  }

  function incompatibilityError(b: BridgeChoice): string | null {
    if (b === 'cctp' && scenario.asset === 'ETH')
      return 'CCTP only supports USDC — it cannot bridge ETH. Use Starkgate for ETH.';
    if (b === 'orbiter' && scenario.amount > 15000)
      return `Orbiter's per-transaction limit is ~$15,000. $${scenario.amount.toLocaleString()} would require ${Math.ceil(scenario.amount / 15000)} sequential transactions — use Starkgate instead.`;
    return null;
  }

  async function execute() {
    if (!bridge) return;
    const err = incompatibilityError(bridge);
    if (err) { setErrorMsg(err); setFlowStep('error'); return; }

    setLoading(true);
    setFlowStep('executing');
    await simulateDelay(900);

    if (bridge === 'starkgate') {
      // Show 12-hour countdown UI — learner fast-forwards
      setFlowStep('waiting');
      setLoading(false);
    } else {
      // CCTP ~8 min / Orbiter ~2 min — simulate with short delay
      await simulateDelay(1800);
      setTxHash(mockBridgeTxHash());
      setFlowStep('complete');
      setCompletedCount(c => c + 1);
      setLoading(false);
    }
  }

  function fastForward() {
    setFastForwarded(true);
    setTxHash(mockBridgeTxHash());
    setFlowStep('complete');
    setCompletedCount(c => c + 1);
  }

  const fee = bridge === 'starkgate' ? '$9 gas' :
              bridge === 'cctp' ? '$5 gas' :
              `$${(1.50 + scenario.amount * 0.0006).toFixed(2)}`;

  const trustModel = bridge === 'starkgate' ? 'Starknet STARK proof — no added trust' :
                     bridge === 'cctp' ? 'Circle attestation — burn-and-mint' :
                     'Third-party relayers';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🌉"
        title="ETH → Starknet Bridge Selector"
        subtitle="Pick the right bridge for each scenario. Wrong choices have consequences."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Scenario tabs */}
      <View style={{ gap: Spacing.xs }}>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SCENARIO</Text>
        {BRIDGE_SCENARIOS.map((sc, i) => (
          <TouchableOpacity
            key={i}
            style={[s.scenarioBtn, { borderColor: scenarioIdx === i ? colors.accent : colors.border,
              backgroundColor: scenarioIdx === i ? colors.accentSoft : colors.bgSecondary }]}
            onPress={() => reset(i)}
            disabled={flowStep !== 'pick' && scenarioIdx === i}
          >
            <Text style={[s.scenarioBtnTxt, { color: scenarioIdx === i ? colors.accent : colors.textSoft }]}>
              {sc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bridge choice */}
      {flowStep === 'pick' && (
        <View style={{ gap: Spacing.xs }}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SELECT BRIDGE</Text>
          {(['starkgate', 'cctp', 'orbiter'] as BridgeChoice[]).map((b) => (
            <TouchableOpacity
              key={b}
              style={[s.bridgeCard, { borderColor: bridge === b ? colors.accent : colors.border,
                backgroundColor: bridge === b ? colors.accentSoft : colors.bgSecondary }]}
              onPress={() => setBridge(b)}
            >
              <Text style={[s.bridgeCardTitle, { color: bridge === b ? colors.accent : colors.text }]}>
                {b === 'starkgate' ? '🔐 Starkgate' : b === 'cctp' ? '🔥 CCTP' : '⚡ Orbiter'}
              </Text>
              <Text style={[s.bridgeCardSub, { color: colors.textSoft }]}>
                {b === 'starkgate' ? 'Canonical · Lock-and-mint · ~5 min deposit · 12 hr withdrawal' :
                 b === 'cctp' ? 'Burn-and-mint · USDC only · ~8 min' :
                 'Relayer · ETH/USDC · ~2 min · max ~$15K/tx'}
              </Text>
            </TouchableOpacity>
          ))}
          {bridge && (
            <ActionBtn label="Execute Bridge →" onPress={execute} loading={loading} variant="primary" colors={colors} />
          )}
        </View>
      )}

      {/* Executing */}
      {flowStep === 'executing' && (
        <View style={[s.statusBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.accent} style={{ marginBottom: Spacing.sm }} />
          <Text style={[s.statusTxt, { color: colors.textSoft }]}>Initiating bridge transaction…</Text>
        </View>
      )}

      {/* 12-hour wait (Starkgate) */}
      {flowStep === 'waiting' && (
        <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
          <Text style={[s.alertTitle, { color: colors.accent }]}>⏳ STARK Proof Generation</Text>
          <Text style={[s.alertTxt, { color: colors.text, marginTop: Spacing.xs }]}>
            Estimated time: <Text style={{ fontWeight: '800' }}>up to 12 hours</Text>
          </Text>
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.xs }]}>
            A STARK validity proof is being generated and submitted to Ethereum L1.
            This is cryptographic security — not a performance limitation.
            Your Starknet funds are safe at L2 finality while you wait.
          </Text>
          <TouchableOpacity
            style={[s.fastFwdBtn, { borderColor: colors.gold, backgroundColor: colors.goldSoft }]}
            onPress={fastForward}
          >
            <Text style={[s.fastFwdTxt, { color: colors.gold }]}>
              ⏩ Fast-forward to completion (simulation — skip 12-hour wait)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error */}
      {flowStep === 'error' && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: colors.red + '40' }]}>
          <Text style={[s.alertTitle, { color: colors.red }]}>⚠ Wrong Bridge for This Asset</Text>
          <Text style={[s.alertTxt, { color: colors.red, marginTop: Spacing.xs }]}>{errorMsg}</Text>
          <TouchableOpacity onPress={() => reset(scenarioIdx)} style={{ marginTop: Spacing.md }}>
            <Text style={[s.linkTxt, { color: colors.accent }]}>← Try a different bridge</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Complete */}
      {flowStep === 'complete' && (
        <>
          <TxResult
            hash={txHash!}
            label={`Bridge via ${bridge === 'starkgate' ? 'Starkgate' : bridge === 'cctp' ? 'CCTP' : 'Orbiter'} — simulated`}
            colors={colors}
          />
          <InfoRow icon="🔐" label="Trust model" value={trustModel} colors={colors} />
          <InfoRow icon="💰" label="Fee paid" value={fee} colors={colors} />
          {fastForwarded && bridge === 'starkgate' && (
            <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
              <Text style={[s.alertTxt, { color: colors.gold }]}>
                ⚡ Simulation only — in production this withdrawal takes up to 12 hours.
                Plan Starkgate exits well in advance.
              </Text>
            </View>
          )}
          {completedCount < 3 ? (
            <ActionBtn label="Try next scenario →" onPress={() => reset((scenarioIdx + 1) % 3)} variant="primary" colors={colors} />
          ) : (
            <ActionBtn label="All scenarios complete →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
          <ActionBtn label="Retry this scenario" onPress={() => reset(scenarioIdx)} variant="ghost" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 3 — starkzap-bridge-route
// Solana → Starknet Route Planner
// ══════════════════════════════════════════════════════════════════════════════

type RouteAsset = 'USDC' | 'wSOL';
type RouteChoice = 'direct' | 'hop';

export function BridgeRouteSim({ onComplete, onSkip, colors }: SimProps) {
  const [asset, setAsset] = useState<RouteAsset>('USDC');
  const [amount, setAmount] = useState('20000');
  const [chosen, setChosen] = useState<RouteChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState(new Set<string>());

  const amtNum = Math.max(1, parseFloat(amount) || 20000);

  const directFee = amtNum * 0.0005;
  const hopFee = asset === 'USDC' ? 5 : 21;
  const directMin = 9;
  const hopMin = asset === 'USDC' ? 14 : 24;

  const directTrust = asset === 'USDC'
    ? 'Circle attestation (CCTP integration) — identical to standard CCTP'
    : 'Hyperlane 6-of-10 validator multisig';
  const hopTrust = asset === 'USDC'
    ? 'Wormhole guardian set → Circle CCTP on final leg'
    : 'Wormhole guardian (13-of-19) → Starkgate STARK proof on Starknet leg';

  const cheaper: RouteChoice | 'equal' = directFee < hopFee ? 'direct' : directFee > hopFee ? 'hop' : 'equal';
  const safer: RouteChoice | 'equal' = asset === 'USDC' ? 'equal' : 'hop';

  const recommendation = () => {
    if (asset === 'USDC') return 'Both paths use CCTP for USDC — security is identical. Direct is slightly simpler.';
    if (amtNum < 10000) return 'Direct Hyperlane — fees proportionate, security adequate for this size.';
    if (directFee > hopFee) return 'Intermediate hop — cheaper AND provides Starkgate STARK proof on the final Starknet leg.';
    return 'Intermediate hop for amounts above ~$25K — Starkgate security on the final leg is worth the small premium.';
  };

  async function executeRoute() {
    setLoading(true);
    await simulateDelay(2000);
    setTxHash(mockBridgeTxHash());
    setDone(true);
    setCompletedPairs(prev => new Set(prev).add(`${asset}-${chosen}`));
    setLoading(false);
  }

  function reset() {
    setChosen(null); setDone(false); setTxHash(null);
  }

  const allFourSeen = completedPairs.size >= 3;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔀"
        title="Solana → Starknet Route Planner"
        subtitle="Compare routes. Change asset and amount to see how the recommendation shifts."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Asset toggle */}
      <View style={s.row}>
        {(['USDC', 'wSOL'] as RouteAsset[]).map((a) => (
          <TouchableOpacity
            key={a}
            style={[s.modeBtn, { borderColor: colors.border },
              asset === a && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
            onPress={() => { setAsset(a); reset(); }}
          >
            <Text style={[s.modeBtnTxt, { color: asset === a ? '#fff' : colors.textSoft }]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount input */}
      <View>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>AMOUNT (USD)</Text>
        <TextInput
          style={[s.input, { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }]}
          value={amount}
          onChangeText={(v) => { setAmount(v); reset(); }}
          keyboardType="numeric"
          placeholderTextColor={colors.textSoft}
          placeholder="e.g. 20000"
        />
      </View>

      {/* Route cards */}
      {!done && (
        <View style={{ gap: Spacing.sm }}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SELECT ROUTE</Text>
          {(['direct', 'hop'] as RouteChoice[]).map((r) => {
            const isCheaper = cheaper === r;
            const isSafer = safer === r && asset !== 'USDC';
            return (
              <TouchableOpacity
                key={r}
                style={[s.bridgeCard, { borderColor: chosen === r ? colors.accent : colors.border,
                  backgroundColor: chosen === r ? colors.accentSoft : colors.bgSecondary }]}
                onPress={() => setChosen(r)}
              >
                <Text style={[s.bridgeCardTitle, { color: chosen === r ? colors.accent : colors.text }]}>
                  {r === 'direct' ? '⚡ Direct — Hyperlane' : `🔗 Intermediate Hop — ${asset === 'USDC' ? 'Wormhole + CCTP' : 'Wormhole + Starkgate'}`}
                </Text>
                <View style={[s.row, { marginTop: Spacing.xs }]}>
                  <Text style={[s.bridgeCardSub, { color: colors.textSoft, flex: 1 }]}>
                    ⏱ ~{r === 'direct' ? directMin : hopMin} min   💰 ${r === 'direct' ? directFee.toFixed(2) : hopFee.toFixed(2)}
                  </Text>
                  {isCheaper && <Text style={[s.badge, { backgroundColor: colors.greenSoft, color: colors.green }]}>Cheaper</Text>}
                  {isSafer && <Text style={[s.badge, { backgroundColor: colors.accentSoft, color: colors.accent }]}>Stronger</Text>}
                </View>
                <Text style={[s.bridgeCardSub, { color: colors.textSoft, marginTop: 2 }]}>
                  🔐 {r === 'direct' ? directTrust : hopTrust}
                </Text>
              </TouchableOpacity>
            );
          })}
          {chosen && (
            <ActionBtn label={`Execute ${chosen === 'direct' ? 'Direct' : 'Intermediate Hop'} →`}
              onPress={executeRoute} loading={loading} variant="primary" colors={colors} />
          )}
        </View>
      )}

      {/* Result */}
      {done && (
        <>
          <TxResult hash={txHash!} label={`Simulated ${chosen === 'direct' ? 'Hyperlane' : 'Wormhole + Starkgate'} route`} colors={colors} />
          <InfoRow icon="💰" label="Fee paid" value={`$${chosen === 'direct' ? directFee.toFixed(2) : hopFee.toFixed(2)}`} colors={colors} />
          <InfoRow icon="🔐" label="Trust model" value={chosen === 'direct' ? directTrust : hopTrust} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.text }]}>
              📋 At ${amtNum.toLocaleString()} {asset}: {recommendation()}
            </Text>
          </View>
          {asset === 'USDC' && (
            <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
              <Text style={[s.alertTxt, { color: colors.green }]}>
                USDC: both routes use the CCTP integration. Hyperlane validators are message
                routers — Circle's attestation service is the security gate regardless of path.
              </Text>
            </View>
          )}
          {!allFourSeen ? (
            <ActionBtn label="Try different asset / amount →" onPress={reset} variant="primary" colors={colors} />
          ) : (
            <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 4 — starkzap-bridge-calc
// Round-Trip Cost Calculator
// ══════════════════════════════════════════════════════════════════════════════

type CalcPreset = { label: string; principal: number; destApy: number; srcApy: number; days: number };

const CALC_PRESETS: CalcPreset[] = [
  { label: 'Small $1K test', principal: 1000, destApy: 20, srcApy: 5, days: 14 },
  { label: 'Medium $25K', principal: 25000, destApy: 14, srcApy: 6, days: 60 },
  { label: 'Large $80K', principal: 80000, destApy: 12, srcApy: 7, days: 90 },
];

export function BridgeCalcSim({ onComplete, onSkip, colors }: SimProps) {
  const [principal, setPrincipal] = useState(25000);
  const [destApy, setDestApy] = useState(14);
  const [srcApy, setSrcApy] = useState(6);
  const [days, setDays] = useState(60);
  const [entryCost, setEntryCost] = useState(5);
  const [exitCost, setExitCost] = useState(16);
  const [hasExplored, setHasExplored] = useState(false);
  const [hasSeenNotViable, setHasSeenNotViable] = useState(false);
  const [hasSeenViable, setHasSeenViable] = useState(false);

  const diff = Math.max(0, destApy - srcApy) / 100;
  const dailyYield = (principal * diff) / 365;
  const totalCost = entryCost + exitCost;
  const breakEvenDays = dailyYield > 0 ? totalCost / dailyYield : Infinity;
  const netAdvantage = dailyYield * days - totalCost;
  const viable = days > breakEvenDays && netAdvantage > 0;

  useEffect(() => {
    setHasExplored(true);
    if (!viable) setHasSeenNotViable(true);
    if (viable && netAdvantage > 50) setHasSeenViable(true);
  }, [principal, destApy, srcApy, days, entryCost, exitCost]);

  function applyPreset(p: CalcPreset) {
    setPrincipal(p.principal); setDestApy(p.destApy); setSrcApy(p.srcApy); setDays(p.days);
  }

  function NumInput({ label, value, onInc, onDec, display }: {
    label: string; value: number; display: string;
    onInc: () => void; onDec: () => void;
  }) {
    return (
      <View style={[s.numRow, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <Text style={[s.numLabel, { color: colors.textSoft }]}>{label}</Text>
        <TouchableOpacity onPress={onDec} style={s.numBtn}>
          <Text style={[s.numBtnTxt, { color: colors.accent }]}>−</Text>
        </TouchableOpacity>
        <Text style={[s.numVal, { color: colors.text }]}>{display}</Text>
        <TouchableOpacity onPress={onInc} style={s.numBtn}>
          <Text style={[s.numBtnTxt, { color: colors.accent }]}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🧮"
        title="Round-Trip Cost Calculator"
        subtitle="Find the break-even point before committing capital to a cross-chain strategy."
        colors={colors}
      />

      {/* Presets */}
      <View>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LOAD PRESET</Text>
        <View style={s.row}>
          {CALC_PRESETS.map((p) => (
            <TouchableOpacity
              key={p.label}
              style={[s.presetBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}
              onPress={() => applyPreset(p)}
            >
              <Text style={[s.presetBtnTxt, { color: colors.textSoft }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Inputs */}
      <NumInput
        label="Principal"
        value={principal}
        display={`$${principal.toLocaleString()}`}
        onInc={() => setPrincipal(v => Math.min(v + 5000, 500000))}
        onDec={() => setPrincipal(v => Math.max(v - 5000, 500))}
      />
      <NumInput
        label="Destination APY"
        value={destApy}
        display={`${destApy}%`}
        onInc={() => setDestApy(v => Math.min(v + 1, 100))}
        onDec={() => setDestApy(v => Math.max(v - 1, 1))}
      />
      <NumInput
        label="Source APY (Ethereum)"
        value={srcApy}
        display={`${srcApy}%`}
        onInc={() => setSrcApy(v => Math.min(v + 1, destApy - 1))}
        onDec={() => setSrcApy(v => Math.max(v - 1, 0))}
      />
      <NumInput
        label="Hold duration"
        value={days}
        display={`${days} days`}
        onInc={() => setDays(v => Math.min(v + 5, 365))}
        onDec={() => setDays(v => Math.max(v - 5, 1))}
      />
      <View style={s.row}>
        <NumInput
          label="Entry cost $"
          value={entryCost}
          display={`$${entryCost}`}
          onInc={() => setEntryCost(v => v + 1)}
          onDec={() => setEntryCost(v => Math.max(v - 1, 1))}
        />
        <NumInput
          label="Exit cost $"
          value={exitCost}
          display={`$${exitCost}`}
          onInc={() => setExitCost(v => v + 1)}
          onDec={() => setExitCost(v => Math.max(v - 1, 1))}
        />
      </View>

      {/* Results */}
      <View style={[s.resultsBox, { borderColor: viable ? colors.green + '50' : colors.red + '50',
        backgroundColor: viable ? colors.greenSoft : colors.redSoft }]}>
        <InfoRow icon="📊" label="APY Differential" value={`${(destApy - srcApy).toFixed(1)}%`} colors={colors} />
        <InfoRow icon="💵" label="Daily Yield Advantage" value={`$${dailyYield.toFixed(2)}/day`} colors={colors} />
        <InfoRow icon="🏁" label="Round-Trip Cost" value={`$${totalCost}`} colors={colors} />
        <InfoRow
          icon="⏱"
          label="Break-Even"
          value={isFinite(breakEvenDays) ? `${breakEvenDays.toFixed(1)} days` : '∞ — no differential'}
          colors={colors}
        />
        <View style={[s.verdictBox, { backgroundColor: viable ? colors.green + '20' : colors.red + '20' }]}>
          <Text style={[s.verdictTxt, { color: viable ? colors.green : colors.red }]}>
            {viable
              ? `✅  Net advantage: $${netAdvantage.toFixed(2)} over ${days} days`
              : `❌  Not viable — ${days}d hold is below ${breakEvenDays.toFixed(1)}d break-even`}
          </Text>
        </View>
      </View>

      {hasSeenViable && hasSeenNotViable && (
        <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      )}
      {(!hasSeenViable || !hasSeenNotViable) && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!hasSeenNotViable
              ? 'Adjust inputs to see a ❌ not viable result, then continue.'
              : 'Adjust inputs to see a ✅ viable result, then continue.'}
          </Text>
        </View>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 5 — starkzap-bridge-register
// Multi-Chain Position Register + Rebalancing Threshold Tool
// ══════════════════════════════════════════════════════════════════════════════

type Chain = 'Ethereum' | 'Starknet' | 'Solana';
type RiskLevel = 'None' | 'Low' | 'Medium' | 'High';

interface Pos {
  id: string;
  name: string;
  chain: Chain;
  value: number;
  apy: number;
  bridge: string;
  risk: RiskLevel;
}

const BRIDGE_RISK: Record<string, RiskLevel> = {
  'None': 'None',
  'Starkgate': 'Low',
  'CCTP': 'Low',
  'Hyperlane CCTP': 'Low',
  'Hyperlane (non-USDC)': 'Medium',
  'Orbiter': 'Medium',
  'Third-party multisig': 'High',
};

const CHAIN_FINALITY: Record<Chain, string> = {
  Ethereum: '~15 min',
  Starknet: 'L2 ~30s · L1 up to 12 hrs',
  Solana: '< 1 sec',
};

const RISK_COLOR: Record<RiskLevel, string> = {
  None: '#6b7280',
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
};

export function BridgeRegisterSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [positions, setPositions] = useState<Pos[]>([
    { id: '1', name: 'Ekubo LP', chain: 'Starknet', value: 50000, apy: 16, bridge: 'Starkgate', risk: 'Low' },
    { id: '2', name: 'Aave USDC', chain: 'Ethereum', value: 40000, apy: 6, bridge: 'None', risk: 'None' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newChain, setNewChain] = useState<Chain>('Starknet');
  const [newBridge, setNewBridge] = useState('Starkgate');
  const [newValue, setNewValue] = useState('10000');
  const [newApy, setNewApy] = useState('12');

  // Rebalancing check
  const [rPrincipal, setRPrincipal] = useState(25000);
  const [rDest, setRDest] = useState(14);
  const [rSrc, setRSrc] = useState(6);
  const [rDays, setRDays] = useState(30);
  const [rCost, setRCost] = useState(22);

  const rDiff = Math.max(0, rDest - rSrc) / 100;
  const rGain = rPrincipal * rDiff * (rDays / 365);
  const rViable = rGain > rCost;

  const totalValue = positions.reduce((s, p) => s + p.value, 0);
  const bridgeExposed = positions.filter(p => p.risk !== 'None').reduce((s, p) => s + p.value, 0);
  const highRisk = positions.filter(p => p.risk === 'High').reduce((s, p) => s + p.value, 0);

  const [starknetBal, setStarknetBal] = useState<string | null>(null);
  const [loadingBal, setLoadingBal] = useState(false);

  async function fetchStarknetBalance() {
    setLoadingBal(true);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as StarkzapWallet;
        const bal = await w.balanceOf(STARKNET_TOKENS.STRK);
        setStarknetBal(bal.toFormatted());
      } catch { setStarknetBal(MOCK.strkBalance); }
    } else {
      await simulateDelay(800);
      setStarknetBal(MOCK.strkBalance);
    }
    setLoadingBal(false);
  }

  function addPosition() {
    const risk = BRIDGE_RISK[newBridge] ?? 'Medium';
    setPositions(prev => [...prev, {
      id: Date.now().toString(),
      name: newName || 'Position',
      chain: newChain,
      value: parseFloat(newValue) || 0,
      apy: parseFloat(newApy) || 0,
      bridge: newBridge,
      risk,
    }]);
    setShowAdd(false);
    setNewName(''); setNewValue('10000'); setNewApy('12');
  }

  const addedHighOrMedium = positions.some(p => p.risk === 'Medium' || p.risk === 'High');
  const hasRunRebal = rDays > 0;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📋"
        title="Multi-Chain Position Register"
        subtitle="Track bridge risk, settlement finality, and rebalancing thresholds across chains."
        colors={colors}
      />

      {/* Portfolio summary */}
      <View style={s.row}>
        {[
          { label: 'Portfolio', value: `$${totalValue.toLocaleString()}`, color: colors.text },
          { label: 'Bridge Exposed', value: `$${bridgeExposed.toLocaleString()}`, color: '#f59e0b' },
          { label: 'High Risk', value: highRisk > 0 ? `$${highRisk.toLocaleString()}` : '$0', color: highRisk > 0 ? '#ef4444' : '#22c55e' },
        ].map((s2) => (
          <View key={s2.label} style={[s.statBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[s.statLabel, { color: colors.textSoft }]}>{s2.label}</Text>
            <Text style={[s.statValue, { color: s2.color }]}>{s2.value}</Text>
          </View>
        ))}
      </View>

      {/* Position list */}
      {positions.map((p) => (
        <View key={p.id} style={[s.posRow, { borderColor: RISK_COLOR[p.risk] + '40',
          backgroundColor: p.risk === 'High' ? colors.redSoft : p.risk === 'Medium' ? colors.goldSoft : colors.bgSecondary }]}>
          <View style={[s.row, { alignItems: 'flex-start' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.posName, { color: colors.text }]}>{p.name}</Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>
                {p.chain} · {p.bridge} · {p.apy}% APY · ${p.value.toLocaleString()}
              </Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>
                Finality: {CHAIN_FINALITY[p.chain]}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={[s.riskBadge, { color: RISK_COLOR[p.risk] }]}>{p.risk}</Text>
              <TouchableOpacity onPress={() => setPositions(prev => prev.filter(x => x.id !== p.id))}>
                <Text style={{ color: colors.textSoft, fontSize: 11 }}>remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Add position */}
      {!showAdd ? (
        <TouchableOpacity
          style={[s.addBtn, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}
          onPress={() => setShowAdd(true)}
        >
          <Text style={[s.addBtnTxt, { color: colors.accent }]}>+ Add Position</Text>
        </TouchableOpacity>
      ) : (
        <View style={[s.addForm, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <TextInput
            style={[s.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={newName} onChangeText={setNewName}
            placeholder="Position name" placeholderTextColor={colors.textSoft}
          />
          <View style={s.row}>
            {(['Ethereum', 'Starknet', 'Solana'] as Chain[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.toggleChip, { borderColor: newChain === c ? colors.accent : colors.border,
                  backgroundColor: newChain === c ? colors.accentSoft : 'transparent' }]}
                onPress={() => setNewChain(c)}
              >
                <Text style={[s.toggleChipTxt, { color: newChain === c ? colors.accent : colors.textSoft }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            {Object.keys(BRIDGE_RISK).map((b) => (
              <TouchableOpacity
                key={b}
                style={[s.toggleChip, { borderColor: newBridge === b ? colors.accent : colors.border,
                  backgroundColor: newBridge === b ? colors.accentSoft : 'transparent' }]}
                onPress={() => setNewBridge(b)}
              >
                <Text style={[{ fontSize: 10, fontWeight: '600' }, { color: newBridge === b ? colors.accent : colors.textSoft }]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.autoRisk, { color: RISK_COLOR[BRIDGE_RISK[newBridge] ?? 'Medium'] }]}>
            Auto-risk: {BRIDGE_RISK[newBridge] ?? 'Medium'}
          </Text>
          <View style={s.row}>
            <TextInput
              style={[s.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newValue} onChangeText={setNewValue}
              keyboardType="numeric" placeholder="Value $" placeholderTextColor={colors.textSoft}
            />
            <TextInput
              style={[s.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newApy} onChangeText={setNewApy}
              keyboardType="numeric" placeholder="APY %" placeholderTextColor={colors.textSoft}
            />
          </View>
          <View style={s.row}>
            <ActionBtn label="Add" onPress={addPosition} variant="primary" colors={colors} />
            <ActionBtn label="Cancel" onPress={() => setShowAdd(false)} variant="ghost" colors={colors} />
          </View>
        </View>
      )}

      {/* Live Starknet balance */}
      <TouchableOpacity
        style={[s.balanceBtn, { borderColor: colors.accent + '50', backgroundColor: colors.accentSoft }]}
        onPress={fetchStarknetBalance}
        disabled={loadingBal}
      >
        {loadingBal
          ? <ActivityIndicator color={colors.accent} size="small" />
          : <Text style={[s.balanceBtnTxt, { color: colors.accent }]}>
              ⚡ {starknetBal ? `Starknet balance: ${starknetBal}` : 'Check real Starknet balance →'}
            </Text>}
      </TouchableOpacity>

      {/* Rebalancing threshold */}
      <View style={[s.rebalBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.textSoft, marginBottom: Spacing.sm }]}>REBALANCING THRESHOLD CHECK</Text>
        {[
          { label: 'Principal to move', value: rPrincipal, display: `$${rPrincipal.toLocaleString()}`,
            inc: () => setRPrincipal(v => v + 5000), dec: () => setRPrincipal(v => Math.max(v - 5000, 500)) },
          { label: 'Destination APY', value: rDest, display: `${rDest}%`,
            inc: () => setRDest(v => Math.min(v + 1, 60)), dec: () => setRDest(v => Math.max(v - 1, rSrc + 1)) },
          { label: 'Source APY', value: rSrc, display: `${rSrc}%`,
            inc: () => setRSrc(v => Math.min(v + 1, rDest - 1)), dec: () => setRSrc(v => Math.max(v - 1, 0)) },
          { label: 'Hold period (days)', value: rDays, display: `${rDays} days`,
            inc: () => setRDays(v => Math.min(v + 5, 365)), dec: () => setRDays(v => Math.max(v - 5, 1)) },
        ].map((row) => (
          <View key={row.label} style={[s.numRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[s.numLabel, { color: colors.textSoft }]}>{row.label}</Text>
            <TouchableOpacity onPress={row.dec} style={s.numBtn}>
              <Text style={[s.numBtnTxt, { color: colors.accent }]}>−</Text>
            </TouchableOpacity>
            <Text style={[s.numVal, { color: colors.text }]}>{row.display}</Text>
            <TouchableOpacity onPress={row.inc} style={s.numBtn}>
              <Text style={[s.numBtnTxt, { color: colors.accent }]}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={[s.verdictBox, { backgroundColor: rViable ? colors.green + '20' : colors.red + '20',
          marginTop: Spacing.sm }]}>
          <Text style={[s.verdictTxt, { color: rViable ? colors.green : colors.red }]}>
            {rViable
              ? `✅  Rebalance justified — gain $${rGain.toFixed(2)} > cost $${rCost}`
              : `❌  Do not rebalance — gain $${rGain.toFixed(2)} < cost $${rCost}`}
          </Text>
        </View>
      </View>

      {addedHighOrMedium && hasRunRebal && (
        <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      )}
      {(!addedHighOrMedium || !hasRunRebal) && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!addedHighOrMedium
              ? 'Add a Medium or High risk position to see how the register tracks it.'
              : 'Adjust the rebalancing values and observe the threshold verdict.'}
          </Text>
        </View>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ─── Shared StyleSheet ────────────────────────────────────────────────────────

const _s4 = StyleSheet.create({
  row:           { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sectionLabel:  { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 },
  modeBtn:       { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  modeBtnTxt:    { fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center', lineHeight: 16 },
  statusBox:     { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  statusTxt:     { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  alertBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  alertTitle:    { fontSize: FontSize.sm, fontWeight: '900' },
  alertTxt:      { fontSize: FontSize.sm, lineHeight: 20 },
  linkTxt:       { fontSize: FontSize.sm, fontWeight: '700' },
  fastFwdBtn:    { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.md },
  fastFwdTxt:    { fontSize: FontSize.xs, fontWeight: '700', textAlign: 'center' },
  scenarioBtn:   { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  scenarioBtnTxt:{ fontSize: FontSize.xs, fontWeight: '700' },
  bridgeCard:    { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  bridgeCardTitle:{ fontSize: FontSize.sm, fontWeight: '900' },
  bridgeCardSub: { fontSize: FontSize.xs, lineHeight: 18 },
  badge:         { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, fontSize: FontSize.xs, fontWeight: '800', overflow: 'hidden' },
  input:         { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, fontSize: FontSize.sm, marginBottom: 0 },
  numRow:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm },
  numLabel:      { flex: 1, fontSize: FontSize.xs },
  numBtn:        { paddingHorizontal: Spacing.md, paddingVertical: 4 },
  numBtnTxt:     { fontSize: FontSize.lg, fontWeight: '800', lineHeight: 20 },
  numVal:        { fontSize: FontSize.sm, fontWeight: '800', minWidth: 80, textAlign: 'center' },
  presetBtn:     { flex: 1, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  presetBtnTxt:  { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  resultsBox:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, gap: Spacing.xs },
  verdictBox:    { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  verdictTxt:    { fontSize: FontSize.sm, fontWeight: '900', textAlign: 'center' },
  posRow:        { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  posName:       { fontSize: FontSize.sm, fontWeight: '900' },
  posSub:        { fontSize: FontSize.xs, lineHeight: 18, marginTop: 2 },
  riskBadge:     { fontSize: FontSize.xs, fontWeight: '900' },
  addBtn:        { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderStyle: 'dashed' },
  addBtnTxt:     { fontSize: FontSize.sm, fontWeight: '800' },
  addForm:       { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  autoRisk:      { fontSize: FontSize.xs, fontWeight: '800' },
  toggleChip:    { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  toggleChipTxt: { fontSize: 10, fontWeight: '700' },
  statBox:       { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, alignItems: 'center' },
  statLabel:     { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  statValue:     { fontSize: FontSize.md, fontWeight: '900' },
  balanceBtn:    { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  balanceBtnTxt: { fontSize: FontSize.xs, fontWeight: '700' },
  rebalBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
});

// ════════════════════════════════════════════════════════════════════════════
// LAB 9: Advanced DeFi (Perps, Confidential, MEV, Flash Loans)
// ════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// LESSON 1 — starkzap-perps-position
// Open a leveraged perp on Extended. Feel the liquidation price.
// Price simulation: favourable / neutral / adverse (liquidation).
// ══════════════════════════════════════════════════════════════════════════════

type PerpStep = 'setup' | 'open' | 'simulating' | 'result';
type PerpOutcome = 'profit' | 'loss' | 'liquidated' | null;

export function PerpPositionSim({ onComplete, onSkip, colors }: SimProps) {
  const [leverage, setLeverage] = useState(10);
  const [collateral, setCollateral] = useState(1000);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [step, setStep] = useState<PerpStep>('setup');
  const [outcome, setOutcome] = useState<PerpOutcome>(null);
  const [loading, setLoading] = useState(false);
  const [hasSeen, setHasSeen] = useState({ profit: false, liquidated: false });

  const ENTRY_PRICE = 0.90;
  const FUND_RATE = 0.00015; // 0.015% per 8h
  const positionSize = collateral * leverage;
  const liqThresholdPct = (1 / leverage) * 0.92; // ~8% buffer for maint margin
  const liqPrice = direction === 'long'
    ? ENTRY_PRICE * (1 - liqThresholdPct)
    : ENTRY_PRICE * (1 + liqThresholdPct);
  const dailyFunding = positionSize * FUND_RATE * 3;

  async function openPosition() {
    setLoading(true);
    await simulateDelay(1500);
    setStep('open');
    setLoading(false);
  }

  async function runScenario(type: 'favour' | 'neutral' | 'adverse') {
    setLoading(true);
    setStep('simulating');
    await simulateDelay(1800);

    let oc: PerpOutcome;
    if (type === 'favour') oc = 'profit';
    else if (type === 'neutral') oc = 'loss'; // small loss from funding
    else oc = 'liquidated';

    setOutcome(oc);
    setHasSeen(prev => ({
      profit: prev.profit || oc === 'profit',
      liquidated: prev.liquidated || oc === 'liquidated',
    }));
    setStep('result');
    setLoading(false);
  }

  const pnl = outcome === 'profit'
    ? (positionSize * 0.12 - dailyFunding * 5).toFixed(2)
    : outcome === 'loss'
    ? (-dailyFunding * 5).toFixed(2)
    : `-${collateral.toFixed(2)}`;

  const canComplete = hasSeen.profit && hasSeen.liquidated;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📈" title="Perpetuals Position Simulator"
        subtitle="Open a leveraged position on Extended. Observe the liquidation price before committing."
        colors={colors} />
      <DemoBadge colors={colors} />

      {/* Setup */}
      {(step === 'setup' || step === 'open') && (
        <>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>DIRECTION</Text>
          <View style={s.row}>
            {(['long', 'short'] as const).map(d => (
              <TouchableOpacity key={d}
                style={[s.toggleBtn, { borderColor: colors.border },
                  direction === d && { backgroundColor: d === 'long' ? '#22c55e' : '#ef4444', borderColor: 'transparent' }]}
                onPress={() => { setDirection(d); setStep('setup'); setOutcome(null); }}>
                <Text style={[s.toggleTxt, { color: direction === d ? '#fff' : colors.textSoft }]}>
                  {d === 'long' ? '▲ Long' : '▼ Short'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LEVERAGE</Text>
          <View style={s.row}>
            {[2, 5, 10, 20].map(lv => (
              <TouchableOpacity key={lv}
                style={[s.leverageBtn, { borderColor: colors.border },
                  leverage === lv && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
                onPress={() => { setLeverage(lv); setStep('setup'); setOutcome(null); }}>
                <Text style={[s.leverageTxt, { color: leverage === lv ? '#fff' : colors.textSoft }]}>{lv}×</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>COLLATERAL</Text>
          <View style={s.row}>
            {[500, 1000, 2000, 5000].map(c => (
              <TouchableOpacity key={c}
                style={[s.leverageBtn, { borderColor: colors.border },
                  collateral === c && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
                onPress={() => { setCollateral(c); setStep('setup'); setOutcome(null); }}>
                <Text style={[s.leverageTxt, { color: collateral === c ? '#fff' : colors.textSoft }]}>${c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <InfoRow icon="📊" label="Position Size" value={`$${positionSize.toLocaleString()}`} colors={colors} />
          <InfoRow icon="🏁" label="Entry Price" value={`$${ENTRY_PRICE}`} colors={colors} />
          <InfoRow icon="⚡" label="Liquidation Price"
            value={`$${liqPrice.toFixed(3)} (${(liqThresholdPct * 100).toFixed(1)}% adverse)`}
            colors={colors} />
          <InfoRow icon="💸" label="Daily Funding Cost"
            value={`$${dailyFunding.toFixed(2)}/day (${direction === 'long' ? 'you pay' : 'you receive'})`}
            colors={colors} />
        </>
      )}

      {/* Open confirmation */}
      {step === 'setup' && (
        <ActionBtn label={`Open ${direction === 'long' ? '▲ Long' : '▼ Short'} ${leverage}× →`}
          onPress={openPosition} loading={loading} variant="starknet" colors={colors} />
      )}

      {/* Scenario selection */}
      {step === 'open' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.green }]}>
              ✅ Position open — ${positionSize.toLocaleString()} {direction} at ${ENTRY_PRICE}
            </Text>
          </View>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SIMULATE 5-DAY PRICE MOVE</Text>
          {[
            { key: 'favour' as const, label: `📈 Favourable (+12%)`, color: colors.green },
            { key: 'neutral' as const, label: `➡  Sideways (funding only)`, color: colors.textSoft },
            { key: 'adverse' as const, label: `💥 Adverse — trigger liquidation`, color: '#ef4444' },
          ].map(sc => (
            <TouchableOpacity key={sc.key}
              style={[s.scenarioBtn, { borderColor: sc.color + '60', backgroundColor: sc.color + '15' }]}
              onPress={() => runScenario(sc.key)} disabled={loading}>
              <Text style={[s.scenarioBtnTxt, { color: sc.color }]}>{sc.label}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Simulating */}
      {step === 'simulating' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.md }]}>Price simulation running…</Text>
        </View>
      )}

      {/* Result */}
      {step === 'result' && (
        <>
          <View style={[s.alertBox, {
            backgroundColor: outcome === 'profit' ? colors.greenSoft : outcome === 'liquidated' ? colors.redSoft : colors.bgSecondary,
            borderColor: outcome === 'profit' ? colors.green + '40' : outcome === 'liquidated' ? '#ef4444' + '40' : colors.border,
          }]}>
            <Text style={[s.alertTitle, {
              color: outcome === 'profit' ? colors.green : outcome === 'liquidated' ? '#ef4444' : colors.textSoft
            }]}>
              {outcome === 'profit' ? '✅ Profitable exit' : outcome === 'liquidated' ? '💥 Position liquidated' : '➡ Sideways — funding eroded returns'}
            </Text>
            <Text style={[s.alertTxt, { color: colors.text, marginTop: 4 }]}>PnL: ${pnl}</Text>
            {outcome === 'liquidated' && (
              <Text style={[s.alertTxt, { color: '#ef4444', marginTop: 4 }]}>
                Your ${collateral} collateral is exhausted. A {(liqThresholdPct * 100).toFixed(1)}% adverse move at {leverage}× leverage was enough.
              </Text>
            )}
          </View>
          <ActionBtn label="Try another scenario" onPress={() => { setStep('open'); setOutcome(null); }} variant="ghost" colors={colors} />
        </>
      )}

      {!canComplete && (hasSeen.profit || hasSeen.liquidated) && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!hasSeen.profit ? 'Now try a favourable scenario.' : 'Now trigger a liquidation to see the consequence.'}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 2 — starkzap-confidential
// Public transfer (amount visible) vs confidential transfer (amount hidden).
// Generate viewing key. Reveal to "auditor." Feel the difference.
// ══════════════════════════════════════════════════════════════════════════════

type ConfStep = 'idle' | 'pub_sending' | 'pub_done' | 'conf_sending' | 'conf_done' | 'key_generated' | 'revealed';

export function ConfidentialSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [step, setStep] = useState<ConfStep>('idle');
  const [loading, setLoading] = useState(false);
  const [pubTxHash, setPubTxHash] = useState<string | null>(null);
  const [confTxHash, setConfTxHash] = useState<string | null>(null);
  const [viewingKey, setViewingKey] = useState<string | null>(null);
  const AMOUNT = 5000;
  const MASKED = '█████ USDC';

  async function sendPublic() {
    setLoading(true); setStep('pub_sending');
    await simulateDelay(1500);
    setPubTxHash(mockTxHash());
    setStep('pub_done');
    setLoading(false);
  }

  async function sendConfidential() {
    setLoading(true); setStep('conf_sending');
    await simulateDelay(2000);
    setConfTxHash(mockTxHash());
    setStep('conf_done');
    setLoading(false);
  }

  async function generateKey() {
    setLoading(true);
    await simulateDelay(1000);
    setViewingKey('vk_' + Math.random().toString(36).slice(2, 20));
    setStep('key_generated');
    setLoading(false);
  }

  function revealToAuditor() { setStep('revealed'); }

  const canComplete = step === 'revealed';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔒" title="Confidential Transfer Demo"
        subtitle="Compare public and confidential transfers. Generate a viewing key and reveal to a simulated auditor."
        colors={colors} />
      <DemoBadge colors={colors} />

      {/* Step 1: Public transfer */}
      <View style={[s.phaseBox, { borderColor: step === 'idle' || step === 'pub_sending' || step === 'pub_done' ? colors.accent : colors.border,
        backgroundColor: colors.bgSecondary }]}>
        <Text style={[s.phaseTxt, { color: colors.accent }]}>STEP 1 — Standard Transfer</Text>
        <Text style={[s.phaseDesc, { color: colors.textSoft }]}>Send ${AMOUNT.toLocaleString()} USDC publicly. Amount is visible to everyone.</Text>
        {step === 'pub_done' && pubTxHash && (
          <>
            <TxResult hash={pubTxHash} label="Standard transfer confirmed" colors={colors} />
            <InfoRow icon="👁" label="On-chain view" value={`${AMOUNT.toLocaleString()} USDC — PUBLIC`} colors={colors} />
            <View style={[s.alertBox, { backgroundColor: '#fef3c7', borderColor: '#f59e0b40', marginTop: 4 }]}>
              <Text style={{ color: '#92400e', fontSize: FontSize.xs, lineHeight: 16 }}>
                Anyone can read this amount on the Starknet explorer — employees, competitors, anyone.
              </Text>
            </View>
          </>
        )}
        {step === 'idle' && (
          <ActionBtn label="Send Standard Transfer" onPress={sendPublic} loading={loading} variant="primary" colors={colors} />
        )}
      </View>

      {/* Step 2: Confidential transfer */}
      {step !== 'idle' && (
        <View style={[s.phaseBox, { borderColor: ['conf_sending','conf_done','key_generated','revealed'].includes(step) ? '#8b5cf6' : colors.border,
          backgroundColor: colors.bgSecondary }]}>
          <Text style={[s.phaseTxt, { color: '#8b5cf6' }]}>STEP 2 — Confidential Transfer (Tongo Cash)</Text>
          <Text style={[s.phaseDesc, { color: colors.textSoft }]}>Send the same amount. Amount is hidden by a ZK proof.</Text>
          {['conf_done','key_generated','revealed'].includes(step) && confTxHash && (
            <>
              <TxResult hash={confTxHash} label="Confidential transfer confirmed — simulated" colors={colors} />
              <InfoRow icon="🔒" label="On-chain view" value={MASKED} colors={colors} />
              <InfoRow icon="✅" label="Validity proof" value="Verified ✓ — amount hidden" colors={colors} />
              <View style={[s.alertBox, { backgroundColor: '#f0fdf4', borderColor: '#22c55e40', marginTop: 4 }]}>
                <Text style={{ color: '#166534', fontSize: FontSize.xs, lineHeight: 16 }}>
                  The amount is provably valid but publicly hidden. Only the holder of a viewing key can decrypt it.
                </Text>
              </View>
            </>
          )}
          {step === 'pub_done' && (
            <ActionBtn label="Send Confidential Transfer →" onPress={sendConfidential} loading={loading} variant="primary" colors={colors} />
          )}
        </View>
      )}

      {/* Step 3: Viewing key */}
      {['conf_done','key_generated','revealed'].includes(step) && (
        <View style={[s.phaseBox, { borderColor: ['key_generated','revealed'].includes(step) ? colors.gold : colors.border,
          backgroundColor: colors.bgSecondary }]}>
          <Text style={[s.phaseTxt, { color: colors.gold }]}>STEP 3 — Generate Viewing Key</Text>
          <Text style={[s.phaseDesc, { color: colors.textSoft }]}>Create a key that grants access to this transaction\'s hidden amount.</Text>
          {viewingKey && (
            <InfoRow icon="🗝" label="Viewing Key" value={viewingKey.slice(0, 24) + '...'} colors={colors} />
          )}
          {step === 'conf_done' && (
            <ActionBtn label="Generate Viewing Key" onPress={generateKey} loading={loading} variant="primary" colors={colors} />
          )}
          {step === 'key_generated' && (
            <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
              <Text style={[s.alertTxt, { color: colors.gold }]}>
                ⚠ Once shared, this key cannot be revoked. The holder permanently holds decryption access.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Step 4: Reveal to auditor */}
      {step === 'key_generated' && (
        <ActionBtn label="Share Key with Auditor →" onPress={revealToAuditor} variant="starknet" colors={colors} />
      )}
      {step === 'revealed' && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[s.alertTitle, { color: colors.green }]}>✅ Auditor can now verify: {AMOUNT.toLocaleString()} USDC</Text>
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
            The auditor sees only this transaction. All other confidential transfers remain hidden — no other viewing keys were shared.
          </Text>
        </View>
      )}

      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 3 — starkzap-flashloan-defence
// User has a position in a lending protocol.
// A flash loan attack hits — oracle manipulated — health factor drops.
// User enables TWAP oracle defence — same attack fails.
// ══════════════════════════════════════════════════════════════════════════════

type FlashStep = 'idle' | 'attacking' | 'attacked' | 'defended';

export function FlashLoanDefenceSim({ onComplete, onSkip, colors }: SimProps) {
  const [oracleType, setOracleType] = useState<'spot' | 'twap'>('spot');
  const [step, setStep] = useState<FlashStep>('idle');
  const [loading, setLoading] = useState(false);

  const DEPOSIT = 40000;
  const BORROW = 25000;
  const STRK_PRICE = 0.80;

  // Spot oracle: flash loan moves price 30% → collateral drops
  const SPOT_MANIPULATED_PRICE = STRK_PRICE * 0.70; // "depressed" 30%
  const SPOT_COLLATERAL = DEPOSIT * 0.70;
  const SPOT_HF = (SPOT_COLLATERAL * 0.83) / BORROW;

  // TWAP: 180-block window, 3-block attack moves TWAP 1/60
  const TWAP_MOVEMENT_PCT = (0.30 * 3) / 180; // 0.5% TWAP change
  const TWAP_COLLATERAL = DEPOSIT * (1 - TWAP_MOVEMENT_PCT);
  const TWAP_HF = (TWAP_COLLATERAL * 0.83) / BORROW;

  async function runAttack() {
    setLoading(true);
    setStep('attacking');
    await simulateDelay(2500);
    setStep('attacked');
    setLoading(false);
  }

  function reset() { setStep('idle'); }

  const attackHF = oracleType === 'spot' ? SPOT_HF : TWAP_HF;
  const attackSucceeds = oracleType === 'spot' && SPOT_HF < 1.0;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⚠️" title="Flash Loan Attack — Your Position"
        subtitle="A bot attacks a protocol you\'re in. Observe the health factor impact. Then enable the TWAP defence."
        colors={colors} />

      {/* Your position */}
      <View style={[s.phaseBox, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <Text style={[s.phaseTxt, { color: colors.text }]}>YOUR POSITION</Text>
        <InfoRow icon="💵" label="Deposited" value={`$${DEPOSIT.toLocaleString()} USDC`} colors={colors} />
        <InfoRow icon="🏦" label="Borrowed" value={`$${BORROW.toLocaleString()} USDC`} colors={colors} />
        <InfoRow icon="📊" label="Collateral token" value="STRK" colors={colors} />
      </View>

      {/* Oracle selector */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>PROTOCOL ORACLE TYPE</Text>
      <View style={s.row}>
        {(['spot', 'twap'] as const).map(o => (
          <TouchableOpacity key={o}
            style={[s.toggleBtn, { borderColor: colors.border },
              oracleType === o && { backgroundColor: o === 'spot' ? '#ef4444' : '#22c55e', borderColor: 'transparent' }]}
            onPress={() => { setOracleType(o); reset(); }}>
            <Text style={[s.toggleTxt, { color: oracleType === o ? '#fff' : colors.textSoft }]}>
              {o === 'spot' ? '⚡ Spot Oracle' : '🛡 TWAP Oracle (30 min)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {oracleType === 'spot' && step === 'idle' && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
          <Text style={[s.alertTxt, { color: '#ef4444' }]}>
            ⚠ Spot oracle: reads current DEX price directly. A flash loan can move this price in a single block.
          </Text>
        </View>
      )}
      {oracleType === 'twap' && step === 'idle' && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.green }]}>
            🛡 TWAP oracle: averages price over 180 blocks (30 min). A single-block flash loan moves it by 1/180.
          </Text>
        </View>
      )}

      {/* Attack trigger */}
      {step === 'idle' && (
        <ActionBtn label="💥 Launch Flash Loan Attack" onPress={runAttack} loading={loading}
          variant="primary" colors={colors} />
      )}

      {/* Attacking */}
      {step === 'attacking' && (
        <View style={{ gap: Spacing.sm }}>
          {['Borrowing $10M flash loan…','Selling STRK on DEX — price drops 30%…','Protocol reads manipulated oracle…','Checking collateral value…'].map((msg, i) => (
            <View key={i} style={[s.phaseBox, { borderColor: '#ef4444' + '40', backgroundColor: colors.redSoft }]}>
              <Text style={{ color: '#ef4444', fontSize: FontSize.xs }}>{msg}</Text>
            </View>
          ))}
          <ActivityIndicator color="#ef4444" />
        </View>
      )}

      {/* Attack result */}
      {step === 'attacked' && (
        <>
          <InfoRow icon="📉" label={`Oracle-reported STRK price (${oracleType === 'spot' ? 'MANIPULATED' : 'TWAP protected'})`}
            value={oracleType === 'spot' ? `$${SPOT_MANIPULATED_PRICE.toFixed(3)} (real: $${STRK_PRICE})` : `~$${(STRK_PRICE * (1 - TWAP_MOVEMENT_PCT)).toFixed(4)} (0.5% TWAP movement)`}
            colors={colors} />
          <InfoRow icon="💰" label="Reported collateral value"
            value={`$${(oracleType === 'spot' ? SPOT_COLLATERAL : TWAP_COLLATERAL).toFixed(0)}`} colors={colors} />
          <View style={[s.alertBox, {
            backgroundColor: attackSucceeds ? colors.redSoft : colors.greenSoft,
            borderColor: (attackSucceeds ? '#ef4444' : colors.green) + '40',
          }]}>
            <Text style={[s.alertTitle, { color: attackSucceeds ? '#ef4444' : colors.green }]}>
              {attackSucceeds ? '💥 LIQUIDATED — Health Factor: ' + attackHF.toFixed(3) : '🛡 ATTACK FAILED — Health Factor: ' + attackHF.toFixed(3)}
            </Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              {attackSucceeds
                ? `Health factor dropped to ${attackHF.toFixed(3)} — below 1.0. Your position was liquidated at the artificially low price. STRK\'s real price never changed.`
                : `TWAP moved only ${(TWAP_MOVEMENT_PCT * 100).toFixed(2)}% despite the 30% spot manipulation. Health factor ${attackHF.toFixed(3)} — unchanged. Attack failed.`}
            </Text>
          </View>
          {oracleType === 'spot' && (
            <ActionBtn label="Switch to TWAP oracle and retry →" onPress={() => { setOracleType('twap'); reset(); }}
              variant="starknet" colors={colors} />
          )}
          {oracleType === 'twap' && (
            <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
          <ActionBtn label="Reset" onPress={reset} variant="ghost" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 4 — starkzap-mev-defence
// Set slippage. High slippage → sandwich simulation plays.
// Low slippage → protected. Then real starkzap swap executes.
// ══════════════════════════════════════════════════════════════════════════════

type MEVStep = 'setup' | 'sandwiching' | 'sandwiched' | 'protected' | 'swapping' | 'complete';

export function MEVDefenceSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [slippage, setSlippage] = useState(5.0);
  const [step, setStep] = useState<MEVStep>('setup');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hasSeenSandwich, setHasSeenSandwich] = useState(false);

  const SWAP_AMOUNT = 50000;
  const extractable = (SWAP_AMOUNT * slippage / 100).toFixed(0);
  const tightEnough = slippage <= 0.5;

  async function executeWithSlippage() {
    setLoading(true);
    if (slippage > 1) {
      setStep('sandwiching');
      await simulateDelay(2000);
      setStep('sandwiched');
      setHasSeenSandwich(true);
    } else {
      setStep('protected');
    }
    setLoading(false);
  }

  async function executeRealSwap() {
    setLoading(true);
    setStep('swapping');
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.swap({
          tokenIn: STARKNET_TOKENS.STRK, tokenOut: STARKNET_TOKENS.USDC,
          amountIn: { toUnit: () => '100000000000000000000' } as any,
          slippageBps: BigInt(Math.round(slippage * 100)),
        });
        setTxHash(tx.hash);
      } catch { setTxHash(mockTxHash()); }
    } else {
      setTxHash(mockTxHash());
    }
    setStep('complete');
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛡" title="MEV Defence — Slippage Practice"
        subtitle="High slippage lets bots extract value. Tight slippage forces revert. Practise finding the right setting."
        colors={colors} />
      <DemoBadge colors={colors} />

      {step === 'setup' && (
        <>
          <InfoRow icon="🔄" label="Swap" value={`$${SWAP_AMOUNT.toLocaleString()} STRK → USDC`} colors={colors} />
          <InfoRow icon="🏛" label="Venue" value="AVNU (Starknet)" colors={colors} />

          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SLIPPAGE TOLERANCE</Text>
          <View style={s.row}>
            {[0.1, 0.3, 0.5, 1.0, 3.0, 5.0].map(v => (
              <TouchableOpacity key={v}
                style={[s.leverageBtn, { borderColor: slippage === v
                  ? (v <= 0.5 ? colors.green : v <= 1 ? colors.gold : '#ef4444')
                  : colors.border },
                  slippage === v && { backgroundColor: v <= 0.5 ? '#22c55e' : v <= 1 ? '#f59e0b' : '#ef4444', borderColor: 'transparent' }]}
                onPress={() => { setSlippage(v); }}>
                <Text style={[s.leverageTxt, { color: slippage === v ? '#fff' : colors.textSoft }]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <InfoRow icon="💰" label="Max extractable before revert"
            value={`$${extractable} ${slippage > 1 ? '⚠ too high' : slippage <= 0.5 ? '✓ appropriate' : '⚠ borderline'}`}
            colors={colors} />

          <ActionBtn label="Execute Swap →" onPress={executeWithSlippage} loading={loading} variant="primary" colors={colors} />
        </>
      )}

      {step === 'sandwiching' && (
        <View style={{ gap: Spacing.sm }}>
          {['Sequencer detects your $50K swap…','Front-run buy inserted before yours…','Your swap executes at inflated price…','Bot sells after — capturing the difference…'].map((m, i) => (
            <View key={i} style={[s.phaseBox, { borderColor: '#ef4444' + '40', backgroundColor: colors.redSoft }]}>
              <Text style={{ color: '#ef4444', fontSize: FontSize.xs }}>{m}</Text>
            </View>
          ))}
          <ActivityIndicator color="#ef4444" />
        </View>
      )}

      {step === 'sandwiched' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
            <Text style={[s.alertTitle, { color: '#ef4444' }]}>💸 Sandwich — ${(SWAP_AMOUNT * slippage / 100).toFixed(0)} extracted</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              Your {slippage}% tolerance allowed ${(SWAP_AMOUNT * slippage / 100).toFixed(0)} of extraction before the transaction would revert. The swap completed but you received less than market rate.
            </Text>
          </View>
          <ActionBtn label="Try with 0.5% slippage →" onPress={() => { setSlippage(0.5); setStep('setup'); }} variant="primary" colors={colors} />
        </>
      )}

      {step === 'protected' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[s.alertTitle, { color: colors.green }]}>🛡 Protected — slippage {slippage}%</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              At {slippage}% tolerance, any adverse price impact over ${(SWAP_AMOUNT * slippage / 100).toFixed(0)} causes an automatic revert. The transaction is safe to execute on Starknet via AVNU.
            </Text>
          </View>
          {hasSeenSandwich
            ? <ActionBtn label="Execute Real Swap via AVNU →" onPress={executeRealSwap} loading={loading} variant="starknet" colors={colors} />
            : <ActionBtn label="First try a high slippage to see the sandwich →" onPress={() => { setSlippage(5); setStep('setup'); }} variant="ghost" colors={colors} />}
        </>
      )}

      {step === 'swapping' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.md }]}>Executing via AVNU…</Text>
        </View>
      )}

      {step === 'complete' && txHash && (
        <>
          <TxResult hash={txHash} label={`Swap executed with ${slippage}% slippage — protected`} colors={colors} />
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 5 — starkzap-liquid-stake
// Real starkzap.stake() on Sepolia (or demo fallback).
// LST yield ticker. Vesu collateral simulation. De-peg stress.
// ══════════════════════════════════════════════════════════════════════════════

type LSTStep = 'idle' | 'staking' | 'staked' | 'depositing' | 'collateral' | 'depeg';

export function LiquidStakeSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useSimulatorAuth();
  const [step, setStep] = useState<LSTStep>('idle');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [lstBalance, setLstBalance] = useState(0);
  const [yieldAccrued, setYieldAccrued] = useState(0);
  const [borrow] = useState(8500);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STAKE_AMOUNT = 1000;
  const STRK_PRICE = 0.82;
  const EXCHANGE_RATE = 1.03;
  const APY = 0.088;
  const depegRate = 0.91;

  const lstValue = lstBalance * EXCHANGE_RATE * STRK_PRICE;
  const hfNormal = lstBalance > 0 ? (lstValue * 0.83) / borrow : 0;
  const hfDepeg = lstBalance > 0 ? (lstBalance * depegRate * STRK_PRICE * 0.83) / borrow : 0;

  useEffect(() => {
    if (step === 'staked') {
      tickerRef.current = setInterval(() => {
        setYieldAccrued(prev => prev + (STAKE_AMOUNT * APY / 365 / 86400) * 3);
      }, 3000);
    }
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [step]);

  async function stake() {
    setLoading(true); setStep('staking');
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const pool = '0x0000000000000000000000000000000000000001';
        const tx = await w.stake(pool, { toUnit: () => '1000000000000000000000' } as any);
        setTxHash(tx.hash);
      } catch { setTxHash(mockTxHash()); }
    } else {
      setTxHash(mockTxHash());
    }
    setLstBalance(STAKE_AMOUNT);
    setStep('staked');
    setLoading(false);
  }

  async function depositToVesu() {
    setLoading(true); setStep('depositing');
    await simulateDelay(1500);
    setStep('collateral');
    setLoading(false);
  }

  function simulateDepeg() { setStep('depeg'); }

  const canComplete = step === 'depeg';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🌊" title="Liquid Staking — LST Lifecycle"
        subtitle="Stake STRK, receive LST receipt, earn yield, use as Vesu collateral, stress-test a de-peg."
        colors={colors} />
      <DemoBadge colors={colors} />

      {/* Step 1: Stake */}
      {step === 'idle' && (
        <>
          <InfoRow icon="🪙" label="Stake amount" value={`${STAKE_AMOUNT} STRK`} colors={colors} />
          <InfoRow icon="📈" label="LST APY" value={`${(APY * 100).toFixed(1)}%`} colors={colors} />
          <InfoRow icon="⚡" label="Unbonding" value="None — LST is immediately tradeable" colors={colors} />
          <ActionBtn label={`Stake ${STAKE_AMOUNT} STRK → Receive xSTRK`} onPress={stake} loading={loading} variant="starknet" colors={colors} />
        </>
      )}

      {step === 'staking' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.md }]}>Staking via real starkzap SDK on Sepolia…</Text>
        </View>
      )}

      {/* Staked state */}
      {['staked','depositing','collateral','depeg'].includes(step) && txHash && (
        <TxResult hash={txHash} label={`Staked ${STAKE_AMOUNT} STRK — received xSTRK`} colors={colors} />
      )}

      {step === 'staked' && (
        <>
          <InfoRow icon="🔑" label="xSTRK balance" value={`${lstBalance.toFixed(0)} xSTRK`} colors={colors} />
          <InfoRow icon="📊" label="Exchange rate" value={`1 xSTRK = ${EXCHANGE_RATE} STRK`} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[s.alertTitle, { color: colors.green }]}>
              ⚡ Yield accruing: +{yieldAccrued.toFixed(6)} STRK
            </Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 2 }]}>
              Exchange rate rises continuously. Your xSTRK balance is unchanged — each xSTRK is worth more STRK over time.
            </Text>
          </View>
          <ActionBtn label="Deposit xSTRK to Vesu as Collateral →" onPress={depositToVesu} loading={loading} variant="primary" colors={colors} />
        </>
      )}

      {/* Collateral state */}
      {['collateral','depeg'].includes(step) && (
        <>
          <InfoRow icon="💵" label="xSTRK collateral" value={`${lstBalance} xSTRK ($${lstValue.toFixed(0)})`} colors={colors} />
          <InfoRow icon="🏦" label="Borrowed" value={`$${borrow.toLocaleString()} USDC`} colors={colors} />
          <InfoRow icon="📊" label="Health Factor (normal)"
            value={hfNormal.toFixed(3) + (hfNormal < 1.3 ? ' ⚠ Low' : ' ✓')} colors={colors} />
        </>
      )}

      {step === 'collateral' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.text }]}>
              Health factor tracks the xSTRK/STRK exchange rate — not just the STRK/USD price. A de-peg reduces your health factor even if STRK price is unchanged.
            </Text>
          </View>
          <ActionBtn label="Simulate 12% xSTRK De-peg →" onPress={simulateDepeg} variant="primary" colors={colors} />
        </>
      )}

      {/* De-peg scenario */}
      {step === 'depeg' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
            <Text style={[s.alertTitle, { color: '#ef4444' }]}>📉 xSTRK de-peg: 1 xSTRK = {depegRate} STRK</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              STRK market price unchanged at ${STRK_PRICE}.{'\n'}
              New xSTRK dollar value: {lstBalance} × {depegRate} × ${STRK_PRICE} = ${(lstBalance * depegRate * STRK_PRICE).toFixed(0)}{'\n'}
              New health factor: {hfDepeg.toFixed(3)}
              {hfDepeg < 1.2 ? '\n\n⚠ Health factor dangerously low — consider adding collateral.' : '\n\nPosition survives this de-peg — buffer maintained.'}
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─── Shared stylesheet ────────────────────────────────────────────────────────

const _s5 = StyleSheet.create({
  row:           { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sectionLabel:  { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  toggleBtn:     { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  toggleTxt:     { fontSize: FontSize.xs, fontWeight: '800' },
  leverageBtn:   { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  leverageTxt:   { fontSize: FontSize.xs, fontWeight: '800' },
  scenarioBtn:   { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  scenarioBtnTxt:{ fontSize: FontSize.sm, fontWeight: '800' },
  phaseBox:      { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  phaseTxt:      { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.6 },
  phaseDesc:     { fontSize: FontSize.xs, lineHeight: 16 },
  alertBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  alertTitle:    { fontSize: FontSize.sm, fontWeight: '900' },
  alertTxt:      { fontSize: FontSize.sm, lineHeight: 20 },
});

// ════════════════════════════════════════════════════════════════════════════
// LABS 10–11: Senior (Treasury, Correlation, On-chain, Backtest)
// ════════════════════════════════════════════════════════════════════════════

const PROTOCOL_PRESETS: Omit<TreasuryPos, 'id' | 'allocation'>[] = [
  { name: 'Vesu USDC Supply',   apy: 10.5, sharpe: 1.8, riskLevel: 'low' },
  { name: 'Ekubo ETH/USDC LP', apy: 22.0, sharpe: 1.1, riskLevel: 'medium' },
  { name: 'STRK Staking',       apy: 8.8,  sharpe: 2.2, riskLevel: 'low' },
  { name: 'wBTC Lending',       apy: 7.2,  sharpe: 1.5, riskLevel: 'low' },
  { name: 'New Protocol',       apy: 38.0, sharpe: 0.4, riskLevel: 'high' },
  { name: 'USDC Reserve',       apy: 0,    sharpe: 0,   riskLevel: 'low' },
];

const TOTAL_TREASURY = 300000;
const CONCENTRATION_LIMIT = 0.25;

export function TreasuryAllocatorSim({ onComplete, onSkip, colors }: SimProps) {
  const [positions, setPositions] = useState<TreasuryPos[]>([]);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [allocationInput, setAllocationInput] = useState('');
  const [hasSeenViolation, setHasSeenViolation] = useState(false);
  const [hasCorreected, setHasCorrected] = useState(false);

  const totalDeployed = positions.reduce((s, p) => s + p.allocation, 0);
  const remaining = TOTAL_TREASURY - totalDeployed;
  const weightedApy = totalDeployed > 0
    ? positions.reduce((s, p) => s + (p.allocation / totalDeployed) * p.apy, 0)
    : 0;
  const weightedSharpe = totalDeployed > 0
    ? positions.reduce((s, p) => s + (p.allocation / totalDeployed) * p.sharpe, 0)
    : 0;
  const violations = positions.filter(p => p.allocation / TOTAL_TREASURY > CONCENTRATION_LIMIT);

  function addPosition() {
    const amt = parseFloat(allocationInput);
    if (!amt || amt <= 0 || amt > remaining) return;
    const preset = PROTOCOL_PRESETS[selectedPreset];
    const pct = amt / TOTAL_TREASURY;
    const newPos: TreasuryPos = { id: Date.now().toString(), ...preset, allocation: amt };
    const updatedPositions = [...positions, newPos];
    setPositions(updatedPositions);
    setAllocationInput('');
    if (pct > CONCENTRATION_LIMIT) setHasSeenViolation(true);
    const hasViol = updatedPositions.some(p => p.allocation / TOTAL_TREASURY > CONCENTRATION_LIMIT);
    if (hasSeenViolation && !hasViol) setHasCorrected(true);
  }

  function removePosition(id: string) {
    setPositions(prev => prev.filter(p => p.id !== id));
  }

  const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
  const canComplete = positions.length >= 4 && hasSeenViolation && totalDeployed >= TOTAL_TREASURY * 0.9;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🏦" title="Treasury Allocation Tool"
        subtitle="Deploy $300,000 across Starknet protocols. 25% concentration limit applies."
        colors={colors} />

      {/* Portfolio summary */}
      <View style={s.row}>
        {[
          { label: 'Deployed', val: `$${totalDeployed.toLocaleString()}`, color: colors.text },
          { label: 'Remaining', val: `$${remaining.toLocaleString()}`, color: remaining > 0 ? colors.accent : colors.green },
          { label: 'Wtd APY', val: `${weightedApy.toFixed(1)}%`, color: '#22c55e' },
          { label: 'Wtd Sharpe', val: weightedSharpe.toFixed(2), color: colors.accent },
        ].map(i => (
          <View key={i.label} style={[s.statBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[s.statLabel, { color: colors.textSoft }]}>{i.label}</Text>
            <Text style={[s.statVal, { color: i.color }]}>{i.val}</Text>
          </View>
        ))}
      </View>

      {/* Violations */}
      {violations.length > 0 && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
          {violations.map(v => (
            <Text key={v.id} style={{ color: '#ef4444', fontSize: FontSize.xs, fontWeight: '700' }}>
              ⚠ {v.name}: ${v.allocation.toLocaleString()} = {(v.allocation / TOTAL_TREASURY * 100).toFixed(1)}% — exceeds 25% limit. Reduce by ${(v.allocation - TOTAL_TREASURY * CONCENTRATION_LIMIT).toLocaleString()}.
            </Text>
          ))}
        </View>
      )}

      {/* Position list */}
      {positions.map(p => (
        <View key={p.id} style={[s.posRow, {
          borderColor: p.allocation / TOTAL_TREASURY > CONCENTRATION_LIMIT ? '#ef4444' : riskColors[p.riskLevel] + '50',
          backgroundColor: colors.bgSecondary,
        }]}>
          <View style={[s.row, { alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.posName, { color: colors.text }]}>{p.name}</Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>
                ${p.allocation.toLocaleString()} ({(p.allocation / TOTAL_TREASURY * 100).toFixed(1)}%) · {p.apy}% APY · Sharpe {p.sharpe}
              </Text>
            </View>
            <Text style={[s.riskBadge, { color: riskColors[p.riskLevel] }]}>{p.riskLevel.toUpperCase()}</Text>
            <TouchableOpacity onPress={() => removePosition(p.id)}>
              <Text style={{ color: colors.textSoft, fontSize: 12, marginLeft: 8 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add position */}
      {remaining > 0 && (
        <View style={[s.addForm, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>ADD POSITION</Text>
          <View style={s.row}>
            {PROTOCOL_PRESETS.map((p, i) => (
              <TouchableOpacity key={p.name}
                style={[s.leverageBtn, { borderColor: selectedPreset === i ? colors.accent : colors.border },
                  selectedPreset === i && { backgroundColor: colors.accentSoft }]}
                onPress={() => setSelectedPreset(i)}>
                <Text style={[{ fontSize: 9, fontWeight: '700', textAlign: 'center' }, { color: selectedPreset === i ? colors.accent : colors.textSoft }]}>
                  {p.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[s.row, { alignItems: 'center' }]}>
            <TextInput
              style={[s.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={allocationInput}
              onChangeText={setAllocationInput}
              keyboardType="numeric"
              placeholder={`Max $${remaining.toLocaleString()} · 25% = $${(TOTAL_TREASURY * CONCENTRATION_LIMIT).toLocaleString()}`}
              placeholderTextColor={colors.textSoft}
            />
            <TouchableOpacity
              style={[s.addBtn2, { backgroundColor: colors.accent }]}
              onPress={addPosition}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.sm }}>Add</Text>
            </TouchableOpacity>
          </View>
          {parseFloat(allocationInput) / TOTAL_TREASURY > CONCENTRATION_LIMIT && (
            <Text style={{ color: '#ef4444', fontSize: FontSize.xs, marginTop: 2 }}>
              ⚠ ${parseFloat(allocationInput).toLocaleString()} = {(parseFloat(allocationInput) / TOTAL_TREASURY * 100).toFixed(1)}% — exceeds 25% concentration limit
            </Text>
          )}
        </View>
      )}

      {!canComplete && positions.length > 0 && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!hasSeenViolation ? 'Try allocating more than 25% to one protocol to see the violation.' :
             positions.length < 4 ? 'Add at least 4 positions.' :
             totalDeployed < TOTAL_TREASURY * 0.9 ? `Deploy at least $${(TOTAL_TREASURY * 0.9).toLocaleString()}.` : ''}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 10 LESSON 3 — starkzap-correlation-manager
// Add positions. Run sell-off simulation. Observe correlated cluster.
// Set exit criteria. See criteria trigger.
// ══════════════════════════════════════════════════════════════════════════════

interface CorrPos {
  id: string; name: string; value: number; apy: number;
  correlation: 'high' | 'medium' | 'low';
  exitTrigger: string;
  exitSet: boolean;
  selloffChange: number;
}

const STARTER_POSITIONS: CorrPos[] = [
  { id: '1', name: 'Ekubo STRK/ETH LP', value: 80000, apy: 22, correlation: 'high', exitTrigger: '', exitSet: false, selloffChange: -0.11 },
  { id: '2', name: 'ETH LST Staking', value: 60000, apy: 8.8, correlation: 'high', exitTrigger: '', exitSet: false, selloffChange: -0.10 },
  { id: '3', name: 'STRK Long (Extended)', value: 40000, apy: 0, correlation: 'high', exitTrigger: '', exitSet: false, selloffChange: -0.15 },
  { id: '4', name: 'Vesu USDC Supply', value: 50000, apy: 10.5, correlation: 'low', exitTrigger: '', exitSet: false, selloffChange: 0.002 },
];

export function CorrelationManagerSim({ onComplete, onSkip, colors }: SimProps) {
  const [positions, setPositions] = useState<CorrPos[]>(STARTER_POSITIONS.map(p => ({ ...p })));
  const [simulationRun, setSimulationRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingExit, setEditingExit] = useState<string | null>(null);
  const [exitInput, setExitInput] = useState('');

  const corrColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
  const highCorr = positions.filter(p => p.correlation === 'high');
  const totalValue = positions.reduce((s, p) => s + p.value, 0);
  const afterSelloff = (p: CorrPos) => p.value * (1 + p.selloffChange);

  async function runSelloff() {
    setLoading(true);
    await simulateDelay(1800);
    setSimulationRun(true);
    setLoading(false);
  }

  function setExit(id: string) {
    if (!exitInput) return;
    setPositions(prev => prev.map(p => p.id === id ? { ...p, exitTrigger: exitInput, exitSet: true } : p));
    setEditingExit(null);
    setExitInput('');
  }

  const exitsCriteria = positions.filter(p => p.exitSet).length;
  const canComplete = simulationRun && exitsCriteria >= 2;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📊" title="Correlation Manager"
        subtitle="See how correlated positions decline together. Set exit criteria before the next sell-off."
        colors={colors} />

      {/* Correlation summary */}
      <View style={[s.alertBox, { backgroundColor: highCorr.length >= 3 ? colors.redSoft : colors.accentSoft,
        borderColor: (highCorr.length >= 3 ? '#ef4444' : colors.accent) + '40' }]}>
        <Text style={[s.alertTxt, { color: highCorr.length >= 3 ? '#ef4444' : colors.accent }]}>
          {highCorr.length} of {positions.length} positions are highly correlated to crypto market.
          {highCorr.length >= 3 ? ' This is a concentrated single-macro-bet risk.' : ' Moderate risk.'}
        </Text>
      </View>

      {/* Positions */}
      {positions.map(p => (
        <View key={p.id} style={[s.posRow, { borderColor: corrColors[p.correlation] + '50', backgroundColor: colors.bgSecondary }]}>
          <View style={[s.row, { alignItems: 'flex-start' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.posName, { color: colors.text }]}>{p.name}</Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>
                ${p.value.toLocaleString()} · {p.apy}% APY
              </Text>
              {simulationRun && (
                <Text style={[s.posSub, {
                  color: p.selloffChange < -0.05 ? '#ef4444' : p.selloffChange > 0 ? '#22c55e' : colors.textSoft,
                  fontWeight: '800',
                }]}>
                  Sell-off: {(p.selloffChange * 100).toFixed(1)}% → ${afterSelloff(p).toLocaleString()}
                </Text>
              )}
              {p.exitSet ? (
                <Text style={[s.posSub, { color: '#22c55e', fontWeight: '700' }]}>✅ Exit: {p.exitTrigger}</Text>
              ) : editingExit === p.id ? (
                <View style={[s.row, { marginTop: 4 }]}>
                  <TextInput
                    style={[s.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    value={exitInput} onChangeText={setExitInput}
                    placeholder="e.g. Exit if HF ≤ 1.3 or price −20%"
                    placeholderTextColor={colors.textSoft} />
                  <TouchableOpacity style={[s.addBtn2, { backgroundColor: colors.accent }]} onPress={() => setExit(p.id)}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: FontSize.xs }}>Set</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setEditingExit(p.id); setExitInput(''); }}>
                  <Text style={[s.posSub, { color: colors.accent, fontWeight: '700', marginTop: 2 }]}>+ Set exit criteria</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[s.riskBadge, { color: corrColors[p.correlation] }]}>{p.correlation.toUpperCase()} CORR</Text>
          </View>
        </View>
      ))}

      {/* Sell-off summary */}
      {simulationRun && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
          <Text style={[s.alertTitle, { color: '#ef4444' }]}>📉 Crypto Sell-Off Simulation</Text>
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
            Portfolio before: ${totalValue.toLocaleString()}{'\n'}
            Portfolio after: ${positions.reduce((s, p) => s + afterSelloff(p), 0).toLocaleString()}{'\n'}
            Correlated cluster decline: {highCorr.map(p => `${p.name.split(' ')[0]} ${(p.selloffChange * 100).toFixed(1)}%`).join(', ')}
          </Text>
        </View>
      )}

      {!simulationRun && (
        <ActionBtn label="▶ Run Crypto Sell-Off Simulation" onPress={runSelloff} loading={loading} variant="primary" colors={colors} />
      )}

      {!canComplete && simulationRun && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            Set exit criteria for at least 2 positions to continue.
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 11 LESSON 1 — starkzap-onchain-query
// Dune-style query builder for Starknet analytics.
// User selects metric, time range, protocol — sees mock results.
// ══════════════════════════════════════════════════════════════════════════════

type QueryMetric = 'tvl' | 'volume' | 'fees' | 'users' | 'health_factors';
type Protocol11 = 'vesu' | 'ekubo' | 'starknet_all' | 'avnu';

const MOCK_DATA: Record<QueryMetric, Record<Protocol11, string>> = {
  tvl:            { vesu: '$124.8M', ekubo: '$89.2M', starknet_all: '$341.5M', avnu: '$18.4M (routing)' },
  volume:         { vesu: '$12.4M (7d)', ekubo: '$441M (7d)', starknet_all: '$612M (7d)', avnu: '$318M (7d)' },
  fees:           { vesu: '$48K (7d)', ekubo: '$1.32M (7d)', starknet_all: '$2.1M (7d)', avnu: '$0 (gasless)' },
  users:          { vesu: '4,218 unique wallets (30d)', ekubo: '12,440 (30d)', starknet_all: '38,100 (30d)', avnu: '31,200 (30d)' },
  health_factors: { vesu: 'Median HF: 2.14 · 12 positions below 1.3', ekubo: 'N/A', starknet_all: 'N/A', avnu: 'N/A' },
};

const INSIGHT: Record<QueryMetric, string> = {
  tvl:            'TVL measures the total capital currently deployed. High TVL alone does not imply profitability — compare to volume to assess capital efficiency.',
  volume:         'Volume/TVL ratio reveals how hard capital is working. Ekubo: $441M volume on $89M TVL = 4.95× weekly turnover — highly active relative to size.',
  fees:           'Fee income accrues to LPs. $1.32M fees on $89M Ekubo TVL = 1.48% weekly = ~77% annualised fee APY before IL. Compare to the LP APY dashboard to verify consistency.',
  users:          'User count measures protocol adoption. AVNU\'s 31,200 users on $0 direct fee revenue shows it monetises indirectly (spreads, not fees).',
  health_factors: '12 positions below 1.3 health factor on Vesu — these are at risk in a sell-off. Monitoring this metric identifies systemic liquidation risk building in the ecosystem.',
};

export function OnchainQuerySim({ onComplete, onSkip, colors }: SimProps) {
  const [metric, setMetric] = useState<QueryMetric>('tvl');
  const [protocol, setProtocol] = useState<Protocol11>('vesu');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [queriesRun, setQueriesRun] = useState(new Set<string>());

  async function runQuery() {
    setLoading(true);
    await simulateDelay(1200);
    setResult(MOCK_DATA[metric][protocol]);
    setQueriesRun(prev => new Set(prev).add(`${metric}-${protocol}`));
    setLoading(false);
  }

  const canComplete = queriesRun.size >= 4;

  const metricLabels: Record<QueryMetric, string> = {
    tvl: 'TVL', volume: 'Volume', fees: 'Fee Revenue', users: 'Unique Users', health_factors: 'Health Factors',
  };
  const protocolLabels: Record<Protocol11, string> = {
    vesu: 'Vesu', ekubo: 'Ekubo', starknet_all: 'Starknet All', avnu: 'AVNU',
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔍" title="On-Chain Analytics — Starknet Query Builder"
        subtitle="Query live protocol metrics. Interpret results for strategy decisions."
        colors={colors} />

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>METRIC</Text>
      <View style={s.row}>
        {(Object.keys(metricLabels) as QueryMetric[]).map(m => (
          <TouchableOpacity key={m}
            style={[s.leverageBtn, { borderColor: metric === m ? colors.accent : colors.border },
              metric === m && { backgroundColor: colors.accentSoft }]}
            onPress={() => { setMetric(m); setResult(null); }}>
            <Text style={[{ fontSize: 9, fontWeight: '700', textAlign: 'center' }, { color: metric === m ? colors.accent : colors.textSoft }]}>
              {metricLabels[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>PROTOCOL</Text>
      <View style={s.row}>
        {(Object.keys(protocolLabels) as Protocol11[]).map(p => (
          <TouchableOpacity key={p}
            style={[s.leverageBtn, { borderColor: protocol === p ? colors.accent : colors.border },
              protocol === p && { backgroundColor: colors.accentSoft }]}
            onPress={() => { setProtocol(p); setResult(null); }}>
            <Text style={[{ fontSize: 9, fontWeight: '700', textAlign: 'center' }, { color: protocol === p ? colors.accent : colors.textSoft }]}>
              {protocolLabels[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ActionBtn label={loading ? '' : `▶ Run Query: ${metricLabels[metric]} — ${protocolLabels[protocol]}`}
        onPress={runQuery} loading={loading} variant="primary" colors={colors} />

      {result && (
        <>
          <InfoRow icon="📊" label={`${metricLabels[metric]} — ${protocolLabels[protocol]}`} value={result} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.text }]}>{INSIGHT[metric]}</Text>
          </View>
        </>
      )}

      <Text style={[s.posSub, { color: colors.textSoft }]}>Queries run: {queriesRun.size}/4 required</Text>
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 11 LESSON 4 — starkzap-backtest
// Strategy backtester. User selects a Starknet DeFi strategy,
// defines parameters, runs backtest over mock historical data.
// ══════════════════════════════════════════════════════════════════════════════

type BacktestStrategy = 'lp_full_range' | 'lp_concentrated' | 'lending_usdc' | 'strk_staking' | 'dca_weekly';

const BACKTEST_RESULTS: Record<BacktestStrategy, {
  totalReturn: number; annualisedReturn: number; maxDrawdown: number; sharpe: number;
  bestMonth: string; worstMonth: string; notes: string;
}> = {
  lp_full_range:   { totalReturn: 18.4, annualisedReturn: 22.1, maxDrawdown: -14.2, sharpe: 0.9, bestMonth: 'Oct +8.2%', worstMonth: 'Jun −11.4%', notes: 'Full-range LP earned consistent fees but suffered significant IL during STRK volatile months. Fee income did not cover IL in months where STRK moved >20%.' },
  lp_concentrated: { totalReturn: 31.2, annualisedReturn: 37.4, maxDrawdown: -22.8, sharpe: 1.1, bestMonth: 'Oct +14.1%', worstMonth: 'Jun −19.3%', notes: 'Concentrated range maximised fee income when in-range (3.4× capital efficiency). Out-of-range periods earned zero fees. Required 4 rebalances. Higher volatility than full-range.' },
  lending_usdc:    { totalReturn: 8.9, annualisedReturn: 10.7, maxDrawdown: -0.2, sharpe: 2.8, bestMonth: 'Mar +1.1%', worstMonth: 'Aug +0.4%', notes: 'Stable yield driven by lending utilisation. Near-zero drawdown. Sharpe 2.8 is highest in the comparison — best risk-adjusted return. Does not benefit from STRK appreciation.' },
  strk_staking:    { totalReturn: 14.8, annualisedReturn: 17.8, maxDrawdown: -28.1, sharpe: 0.7, bestMonth: 'Oct +12.8%', worstMonth: 'Jun −24.9%', notes: 'High max drawdown driven by STRK price volatility. Staking yield (8.8%) was dwarfed by price movement in both directions. High nominal return during STRK appreciation; exposed to full STRK downside.' },
  dca_weekly:      { totalReturn: 12.1, annualisedReturn: 14.5, maxDrawdown: -9.8, sharpe: 1.4, bestMonth: 'Nov +5.2%', worstMonth: 'Jun −8.1%', notes: 'DCA smoothed entry price — average cost was $0.73 versus spot $0.82 at end of period. Reduced timing risk. Lower total return than concentrated LP but with significantly lower max drawdown and better Sharpe.' },
};

export function BacktestSim({ onComplete, onSkip, colors }: SimProps) {
  const [strategy, setStrategy] = useState<BacktestStrategy>('lending_usdc');
  const [principal, setPrincipal] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof BACKTEST_RESULTS['lending_usdc'] | null>(null);
  const [strategiesRun, setStrategiesRun] = useState(new Set<BacktestStrategy>());

  async function runBacktest() {
    setLoading(true);
    await simulateDelay(2000);
    setResult(BACKTEST_RESULTS[strategy]);
    setStrategiesRun(prev => new Set(prev).add(strategy));
    setLoading(false);
  }

  const stratLabels: Record<BacktestStrategy, string> = {
    lp_full_range: 'LP Full Range', lp_concentrated: 'LP Concentrated',
    lending_usdc: 'Lending USDC', strk_staking: 'STRK Staking', dca_weekly: 'DCA Weekly',
  };

  const canComplete = strategiesRun.size >= 3;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📈" title="Strategy Backtester"
        subtitle="Run historical backtests across Starknet DeFi strategies. Compare risk-adjusted returns."
        colors={colors} />

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>STRATEGY</Text>
      <View style={s.row}>
        {(Object.keys(stratLabels) as BacktestStrategy[]).map(st => (
          <TouchableOpacity key={st}
            style={[s.leverageBtn, { borderColor: strategy === st ? colors.accent : colors.border },
              strategy === st && { backgroundColor: colors.accentSoft }]}
            onPress={() => { setStrategy(st); setResult(null); }}>
            <Text style={[{ fontSize: 9, fontWeight: '700', textAlign: 'center' }, { color: strategy === st ? colors.accent : colors.textSoft }]}>
              {stratLabels[st]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>INITIAL CAPITAL</Text>
      <View style={s.row}>
        {[10000, 25000, 50000, 100000].map(c => (
          <TouchableOpacity key={c}
            style={[s.leverageBtn, { borderColor: principal === c ? colors.accent : colors.border },
              principal === c && { backgroundColor: colors.accentSoft }]}
            onPress={() => setPrincipal(c)}>
            <Text style={[{ fontSize: 10, fontWeight: '700' }, { color: principal === c ? colors.accent : colors.textSoft }]}>
              ${(c / 1000).toFixed(0)}K
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ActionBtn label={loading ? '' : `▶ Backtest ${stratLabels[strategy]}`}
        onPress={runBacktest} loading={loading} variant="primary" colors={colors} />

      {result && (
        <>
          <InfoRow icon="💰" label="Total Return (10 months)" value={`+${result.totalReturn}% = $${(principal * result.totalReturn / 100).toLocaleString()}`} colors={colors} />
          <InfoRow icon="📅" label="Annualised Return" value={`${result.annualisedReturn}%`} colors={colors} />
          <InfoRow icon="📉" label="Max Drawdown" value={result.maxDrawdown + '%'} colors={colors} />
          <InfoRow icon="⚖️" label="Sharpe Ratio" value={result.sharpe.toFixed(2)} colors={colors} />
          <InfoRow icon="🏆" label="Best Month" value={result.bestMonth} colors={colors} />
          <InfoRow icon="⚠️" label="Worst Month" value={result.worstMonth} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.text }]}>{result.notes}</Text>
          </View>
        </>
      )}

      <Text style={[s.posSub, { color: colors.textSoft }]}>Strategies backtested: {strategiesRun.size}/3 required</Text>
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─── Shared stylesheet ─────────────────────────────────────────────────────────

const _s6 = StyleSheet.create({
  row:          { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  statBox:      { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, alignItems: 'center' },
  statLabel:    { fontSize: 9, fontWeight: '600', marginBottom: 2 },
  statVal:      { fontSize: FontSize.sm, fontWeight: '900' },
  alertBox:     { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  alertTitle:   { fontSize: FontSize.sm, fontWeight: '900' },
  alertTxt:     { fontSize: FontSize.sm, lineHeight: 20 },
  posRow:       { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  posName:      { fontSize: FontSize.sm, fontWeight: '900' },
  posSub:       { fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 },
  riskBadge:    { fontSize: FontSize.xs, fontWeight: '900' },
  addForm:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  input:        { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, fontSize: FontSize.sm },
  addBtn2:      { borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginLeft: Spacing.sm },
  leverageBtn:  { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: 4, alignItems: 'center', minWidth: 52 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEW SIMULATORS — Added in synthesis (31 components for full lesson coverage)
// ═══════════════════════════════════════════════════════════════════════════════

export function PoolDepthSim({ onComplete, onSkip, colors }: SimProps) {
  const [poolSize, setPoolSize] = useState(500000);
  const [tradeSize, setTradeSize] = useState(5000);
  const [hasSeenHigh, setHasSeenHigh] = useState(false);
  const [hasSeenLow, setHasSeenLow] = useState(false);

  // x*y=k price impact formula
  const k = poolSize * poolSize; // 50/50 pool, equal values
  const x = poolSize; // STRK side
  const newX = x - tradeSize; // after buying tradeSize STRK
  const priceImpactPct = newX > 0
    ? ((k / newX - poolSize) / poolSize - 1) * 100 // simplified
    : 999;
  const realImpact = newX > 0
    ? Math.abs((tradeSize / (poolSize * 2)) * 100 * 1.5) // approx
    : 100;
  const cappedImpact = Math.min(realImpact, 99.9);
  const tradePct = (tradeSize / poolSize) * 100;

  const impactColor = cappedImpact < 1 ? colors.green
    : cappedImpact < 5 ? '#f59e0b'
    : '#ef4444';

  useEffect(() => {
    if (cappedImpact > 10) setHasSeenHigh(true);
    if (cappedImpact < 0.5) setHasSeenLow(true);
  }, [cappedImpact]);

  const POOL_SIZES = [
    { label: '$50K\nShallow', value: 50000 },
    { label: '$500K\nMedium', value: 500000 },
    { label: '$5M\nDeep', value: 5000000 },
    { label: '$50M\nVery Deep', value: 50000000 },
  ];

  const canComplete = hasSeenHigh && hasSeenLow;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🌊"
        title="Pool Depth & Price Impact"
        subtitle="Discover how pool size determines how much your trade moves the price."
        colors={colors}
      />

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>POOL SIZE (STRK/USDC)</Text>
      <View style={s.row}>
        {POOL_SIZES.map(p => (
          <TouchableOpacity key={p.value}
            style={[s.toggleBtn, { borderColor: poolSize === p.value ? colors.accent : colors.border },
              poolSize === p.value && { backgroundColor: colors.accentSoft }]}
            onPress={() => setPoolSize(p.value)}>
            <Text style={[{ fontSize: 10, fontWeight: '800', textAlign: 'center' },
              { color: poolSize === p.value ? colors.accent : colors.textSoft }]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>
        TRADE SIZE: ${tradeSize.toLocaleString()} ({tradePct.toFixed(2)}% of pool)
      </Text>
      <View style={[s.sliderTrack, { backgroundColor: colors.border }]}>
        {[500, 1000, 5000, 10000, 25000, 50000, 100000].map(v => (
          <TouchableOpacity key={v}
            style={[s.sliderStep, { backgroundColor: tradeSize === v ? colors.accent : colors.bgSecondary,
              borderColor: colors.border }]}
            onPress={() => setTradeSize(v)}>
            <Text style={[{ fontSize: 9, fontWeight: '700' },
              { color: tradeSize === v ? '#fff' : colors.textSoft }]}>
              ${v >= 1000 ? `${v/1000}K` : v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result display */}
      <View style={[s.resultBox, { backgroundColor: impactColor + '15', borderColor: impactColor + '40' }]}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={[s.resultLabel, { color: colors.textSoft }]}>Price Impact</Text>
            <Text style={[s.resultValue, { color: impactColor }]}>
              {cappedImpact.toFixed(2)}%
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.resultLabel, { color: colors.textSoft }]}>Effective cost</Text>
            <Text style={[s.resultValue, { color: colors.text }]}>
              ${(tradeSize * (1 + cappedImpact / 100)).toFixed(0)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.resultLabel, { color: colors.textSoft }]}>Overpaid</Text>
            <Text style={[s.resultValue, { color: impactColor }]}>
              ${(tradeSize * cappedImpact / 100).toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={[s.impactBar, { backgroundColor: colors.border, marginTop: Spacing.sm }]}>
          <View style={[s.impactFill, {
            width: `${Math.min(cappedImpact * 5, 100)}%` as any,
            backgroundColor: impactColor,
          }]} />
        </View>

        <Text style={[{ fontSize: FontSize.xs, marginTop: Spacing.sm },
          { color: cappedImpact < 1 ? colors.green : cappedImpact < 5 ? '#f59e0b' : '#ef4444' }]}>
          {cappedImpact < 0.5 ? '✅ Excellent — trade is <0.5% of pool depth'
            : cappedImpact < 1 ? '✅ Good — acceptable price impact'
            : cappedImpact < 5 ? '⚠️ Caution — consider splitting this trade'
            : '❌ High impact — this trade should be split across multiple smaller orders'}
        </Text>
      </View>

      {/* Key insight */}
      <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 18 }, { color: colors.textSoft }]}>
          Pool with ${(poolSize / 1000).toFixed(0)}K depth:{'\n'}
          Your ${tradeSize.toLocaleString()} trade = {tradePct.toFixed(2)}% of pool{'\n'}
          {tradePct > 10 ? 'This is too large for this pool — AVNU would route it across multiple pools to reduce impact.'
            : tradePct > 2 ? 'Borderline — check AVNU routing before submitting.'
            : 'Size is appropriate for this pool depth.'}
        </Text>
      </View>

      {!canComplete && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.gold }]}>
            {!hasSeenHigh
              ? '📊 Try a large trade in a shallow pool to see high impact.'
              : '📊 Now try a small trade in a deep pool to see minimal impact.'}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 LESSON 7 — starkzap-protocol-reader
// Protocol Metrics Dashboard Reader
// User reads mock DefiLlama/Starkscan-style data and answers
// interpretation questions. Builds the habit of checking volume/TVL
// and revenue before trusting a TVL headline.
// ══════════════════════════════════════════════════════════════════════════════

interface Protocol {
  name: string; tvl: string; volume7d: string; revenue7d: string;
  wallets30d: number; auditAge: string; description: string;
}

const _PROTOCOLS_DUP: Protocol[] = [
  { name: 'Vesu', tvl: '$124.8M', volume7d: '$14.2M', revenue7d: '$42.6K',
    wallets30d: 4218, auditAge: '5 months', description: 'Lending protocol on Starknet' },
  { name: 'Ekubo', tvl: '$89.2M', volume7d: '$441M', revenue7d: '$1.32M',
    wallets30d: 12440, auditAge: '8 months', description: 'Concentrated liquidity AMM' },
  { name: 'NewProtocol X', tvl: '$62M', volume7d: '$890K', revenue7d: '$2.7K',
    wallets30d: 180, auditAge: 'unaudited', description: 'New yield aggregator' },
  { name: 'AVNU', tvl: '$0 (router)', volume7d: '$318M', revenue7d: '$0 direct',
    wallets30d: 31200, auditAge: '6 months', description: 'Swap aggregator — holds no deposits' },
];

const _QUESTIONS_DUP = [
  {
    q: 'Which protocol has the highest volume-to-TVL ratio? What does this reveal?',
    answer: 'ekubo',
    explanation: 'Ekubo: $441M volume on $89.2M TVL = 4.9× weekly turnover. Capital is working extremely hard. Vesu by contrast has $14.2M on $124.8M = 0.11× — much lower but expected for a lending protocol where deposits are locked as collateral.',
  },
  {
    q: 'NewProtocol X shows $62M TVL. Should you trust this as a sign of protocol health?',
    answer: 'no',
    explanation: 'No. $62M TVL with only $890K weekly volume and $2.7K revenue means capital is largely idle — the 180 unique wallets suggests it is concentrated among a handful of large depositors, not organic user adoption. Unaudited status adds additional risk.',
  },
  {
    q: 'AVNU shows $0 TVL. Is this a sign of failure?',
    answer: 'no-avnu',
    explanation: 'No. AVNU is a routing aggregator — it does not hold deposits, it routes trades through other protocols. Its $318M weekly volume and 31,200 active wallets show it is the most-used protocol on Starknet by user count. Zero TVL is structurally correct.',
  },
];

export function UtilisationCurveSim({ onComplete, onSkip, colors }: SimProps) {
  const [utilisation, setUtilisation] = useState(50);
  const [hasSeenBelowKink, setHasSeenBelowKink] = useState(false);
  const [hasSeenAboveKink, setHasSeenAboveKink] = useState(false);

  const KINK = 80;
  const BASE_RATE = 2;
  const SLOPE1 = 0.15; // rate increase per 1% utilisation below kink
  const SLOPE2 = 1.0;  // rate increase per 1% above kink
  const RESERVE_FACTOR = 0.15;

  const borrowAPR = utilisation <= KINK
    ? BASE_RATE + utilisation * SLOPE1
    : BASE_RATE + KINK * SLOPE1 + (utilisation - KINK) * SLOPE2;
  const supplyAPY = (borrowAPR * (utilisation / 100)) * (1 - RESERVE_FACTOR);

  useEffect(() => {
    if (utilisation < KINK) setHasSeenBelowKink(true);
    if (utilisation > KINK) setHasSeenAboveKink(true);
  }, [utilisation]);

  const canComplete = hasSeenBelowKink && hasSeenAboveKink;

  const STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 85, 90, 95, 99];
  const kinkColor = utilisation > 95 ? '#ef4444' : utilisation > KINK ? '#f59e0b' : colors.green;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📉"
        title="Lending Pool — Interest Rate Curve"
        subtitle="Move the utilisation slider. Rates rise slowly until the kink at 80%, then spike steeply."
        colors={colors}
      />

      {/* Utilisation selector */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>
        UTILISATION: {utilisation}% {utilisation >= KINK ? '⚠ ABOVE KINK' : '✓ BELOW KINK'}
      </Text>
      <View style={s.stepRow}>
        {STEPS.map(v => (
          <TouchableOpacity key={v}
            style={[s.stepBtn, { borderColor: utilisation === v ? kinkColor : colors.border },
              utilisation === v && { backgroundColor: kinkColor + '20' }]}
            onPress={() => setUtilisation(v)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' },
              { color: utilisation === v ? kinkColor : v >= KINK ? '#f59e0b' : colors.textSoft }]}>
              {v}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Kink indicator */}
      <View style={[s.kinkBar, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <View style={[s.kinkFill, { width: `${utilisation}%` as any, backgroundColor: kinkColor }]} />
        <View style={[s.kinkMark, { left: `${KINK}%` as any }]}>
          <Text style={s.kinkLabel}>← KINK (80%)</Text>
        </View>
      </View>

      {/* Rate display */}
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <View style={s.row}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Borrow APR</Text>
            <Text style={[s.rateValue, { color: kinkColor }]}>{borrowAPR.toFixed(1)}%</Text>
            <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>What borrowers pay</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Supply APY</Text>
            <Text style={[s.rateValue, { color: colors.green }]}>{supplyAPY.toFixed(1)}%</Text>
            <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>What depositors earn</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Reserve</Text>
            <Text style={[s.rateValue, { color: colors.accent }]}>
              {(borrowAPR * (utilisation / 100) * RESERVE_FACTOR).toFixed(1)}%
            </Text>
            <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>Protocol keeps</Text>
          </View>
        </View>
      </View>

      {/* Liquidity risk warning */}
      {utilisation > 90 && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#ef4444' }]}>
            ⚠️ {utilisation}% utilisation — liquidity risk
          </Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.text }]}>
            Only {100 - utilisation}% of deposits are available for immediate withdrawal.
            If you try to withdraw more than ${(100 - utilisation).toFixed(0)}K from a $100K pool, the transaction will fail.
            High rates are the protocol's mechanism to attract new deposits and repayments.
          </Text>
        </View>
      )}

      {utilisation <= KINK && (
        <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.textSoft }]}>
            At {utilisation}% utilisation: rates are low and stable. The protocol is well-capitalised.
            Withdrawals process immediately — {100 - utilisation}% of deposits are idle.
          </Text>
        </View>
      )}

      {!canComplete && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.gold }]}>
            {!hasSeenBelowKink ? '👉 Try utilisation below 80% first.' :
             !hasSeenAboveKink ? '👉 Now try above 80% — observe the rate spike.' : ''}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 4 LESSON 3 — starkzap-health-factor
// Live Health Factor Calculator with Price Slider
// User sets collateral amount and borrow amount.
// Price slider moves the collateral value — HF recalculates instantly.
// Red zone liquidation trigger is visceral.
// ══════════════════════════════════════════════════════════════════════════════

export function ILCalculatorSim({ onComplete, onSkip, colors }: SimProps) {
  const [priceRatio, setPriceRatio] = useState(1.0);   // r = new/original
  const [positionSize, setPositionSize] = useState(10000);
  const [feeApy, setFeeApy] = useState(120);           // % annual
  const [hasSeenModerateIL, setHasSeenModerateIL] = useState(false);
  const [hasSeenHighIL, setHasSeenHighIL] = useState(false);
  const [hasSeenSymmetry, setHasSeenSymmetry] = useState(false);

  // IL formula: 2√r / (1 + r) − 1
  const r = priceRatio;
  const ilFraction = r > 0 ? (2 * Math.sqrt(r)) / (1 + r) - 1 : -1;
  const ilPct = Math.abs(ilFraction * 100);
  const ilDollars = positionSize * Math.abs(ilFraction);

  // Hold value vs LP value
  // At entry: $positionSize split 50/50. STRK side: positionSize/2 tokens at $1 each.
  const strkAtEntry = positionSize / 2;          // dollar value of STRK side
  const usdcAtEntry = positionSize / 2;          // dollar value of USDC side
  const holdValue = strkAtEntry * r + usdcAtEntry; // STRK appreciates at rate r
  const lpValue = positionSize * (1 + ilFraction); // LP value after IL
  const ilDollarsVsHold = holdValue - lpValue;

  // Break-even: how many days of fee income to cover IL
  const dailyFeeIncome = (positionSize * feeApy) / 100 / 365;
  const breakEvenDays = dailyFeeIncome > 0 ? Math.round(ilDollars / dailyFeeIncome) : 999;

  // Net APY estimate (assuming IL occurs over 1 year)
  const netApy = feeApy - ilPct;

  useEffect(() => {
    if (ilPct >= 5) setHasSeenModerateIL(true);
    if (ilPct >= 15) setHasSeenHighIL(true);
    // Symmetry: check that user has tried both r=2 and r=0.5 approximately
    if (Math.abs(r - 0.5) < 0.1 && hasSeenModerateIL) setHasSeenSymmetry(true);
  }, [ilPct, r, hasSeenModerateIL]);

  const canComplete = hasSeenModerateIL && hasSeenHighIL;

  const RATIO_STEPS = [0.20, 0.33, 0.50, 0.67, 0.80, 1.00, 1.25, 1.50, 2.00, 3.00, 4.00, 5.00];

  const ilColor = ilPct < 5 ? colors.green
    : ilPct < 15 ? '#f59e0b'
    : '#ef4444';

  const fmt = (n: number, dp = 2) => n.toFixed(dp);
  const fmtDollar = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📉"
        title="IL Calculator"
        subtitle="Move the price ratio to see how impermanent loss builds as STRK diverges from your entry price."
        colors={colors}
      />

      {/* Price ratio selector */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>PRICE RATIO (new / entry)</Text>
        <Text style={[s.bigNum, { color: colors.text }]}>{fmt(r, 2)}×</Text>
        <Text style={[s.sub, { color: colors.textSoft }]}>
          {r < 1 ? `STRK fell ${fmt((1 - r) * 100, 0)}% from entry` :
            r === 1 ? 'No price change — IL is zero' :
              `STRK rose ${fmt((r - 1) * 100, 0)}% from entry`}
        </Text>
        <View style={s.stepRow}>
          {RATIO_STEPS.map(step => (
            <TouchableOpacity
              key={step}
              style={[
                s.stepBtn,
                {
                  backgroundColor: Math.abs(r - step) < 0.01 ? colors.primary : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setPriceRatio(step)}
            >
              <Text style={[s.stepLabel, { color: Math.abs(r - step) < 0.01 ? '#fff' : colors.text }]}>
                {step}×
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* IL result */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>IMPERMANENT LOSS</Text>
        <Text style={[s.bigNum, { color: ilColor }]}>−{fmt(ilPct, 2)}%</Text>
        <Text style={[s.formula, { color: colors.textSoft }]}>
          2√{fmt(r, 2)} / (1 + {fmt(r, 2)}) − 1 = {fmt(ilFraction, 4)}
        </Text>
        <InfoRow label="IL on $10,000 position" value={`−${fmtDollar(ilDollars)}`} colors={colors} />
        <InfoRow label="Hold value" value={fmtDollar(holdValue)} colors={colors} />
        <InfoRow label="LP withdrawal value" value={fmtDollar(lpValue)} colors={colors} />
        <InfoRow label="Underperformance vs holding" value={`−${fmtDollar(ilDollarsVsHold)}`} colors={colors} />
      </View>

      {/* Position size selector */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>POSITION SIZE</Text>
        <View style={s.stepRow}>
          {[5000, 10000, 20000, 50000].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                s.stepBtn,
                {
                  backgroundColor: positionSize === size ? colors.primary : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setPositionSize(size)}
            >
              <Text style={[s.stepLabel, { color: positionSize === size ? '#fff' : colors.text }]}>
                ${(size / 1000).toFixed(0)}k
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sub, { color: colors.textSoft, marginTop: 4 }]}>
          IL on this position: {fmtDollar(positionSize * ilPct / 100)}
        </Text>
      </View>

      {/* Fee APY vs IL break-even */}
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[s.label, { color: colors.textSoft }]}>FEE INCOME BREAK-EVEN</Text>
        <View style={s.stepRow}>
          {[50, 80, 120, 200, 400].map(apy => (
            <TouchableOpacity
              key={apy}
              style={[
                s.stepBtn,
                {
                  backgroundColor: feeApy === apy ? colors.primary : colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFeeApy(apy)}
            >
              <Text style={[s.stepLabel, { color: feeApy === apy ? '#fff' : colors.text }]}>
                {apy}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <InfoRow label="Daily fee income" value={`$${fmt(dailyFeeIncome, 2)}`} colors={colors} />
        <InfoRow
          label="Days to recover IL"
          value={ilDollars > 0 ? `${breakEvenDays} days` : '0 days (no IL)'}
          colors={colors}
        />
        <InfoRow
          label="Net APY estimate (fee − IL)"
          value={`${fmt(netApy, 1)}%`}
          valueColor={netApy >= 0 ? colors.green : '#ef4444'}
          colors={colors}
        />
      </View>

      {/* Symmetry callout */}
      {hasSeenModerateIL && (
        <View style={[s.insight, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary }]}>
          <Text style={[s.insightTitle, { color: colors.primary }]}>🔁 IL is symmetric</Text>
          <Text style={[s.insightText, { color: colors.text }]}>
            Try r = 0.50 (price halves) and r = 2.00 (price doubles. Both produce {fmt(Math.abs((2 * Math.sqrt(2)) / (1 + 2) - 1) * 100, 2)}% IL.
            Direction does not matter — only the magnitude of the price move.
          </Text>
        </View>
      )}

      {hasSeenHighIL && (
        <View style={[s.insight, { backgroundColor: colors.surfaceAlt, borderColor: '#f59e0b' }]}>
          <Text style={[s.insightTitle, { color: '#f59e0b' }]}>⚠️ IL grows non-linearly</Text>
          <Text style={[s.insightText, { color: colors.text }]}>
            A 2× move = 5.72% IL. A 5× move = 25.5% IL. Doubling the price ratio more than quadruples the IL.
            High-volatility pairs expose you to IL that fee income may not cover.
          </Text>
        </View>
      )}

      <ActionBtn
        label={canComplete ? 'Complete Simulator' : `Try price ratios to unlock (seen moderate: ${hasSeenModerateIL ? '✓' : '○'}, high: ${hasSeenHighIL ? '✓' : '○'})`}
        onPress={canComplete ? onComplete : undefined}
        disabled={!canComplete}
        colors={colors}
      />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 7 LESSON 3 — starkzap-range-builder
// Concentrated Range Builder
// User picks lower and upper price bounds, sees capital efficiency,
// in-range probability based on historical range, and estimated
// break-even at a default fee APY.
// Also simulates a price move to show in-range vs out-of-range status.
// Unlock: user must have seen high efficiency (>= 5×), set an asymmetric
// range, and simulated an out-of-range event.
// ══════════════════════════════════════════════════════════════════════════════

const CURRENT_PRICE_DUP = 1.00; // STRK baseline

export function DefiContrastSim({ onComplete, onSkip, colors }: SimProps) {
  const [panel, setPanel] = useState<'tradfi' | 'defi'>('tradfi');
  const [tradfiStep, setTradfiStep] = useState(0);
  const [defiStep, setDefiStep] = useState(0);
  const [sawFreeze, setSawFreeze] = useState(false);
  const [sawNonCustodial, setSawNonCustodial] = useState(false);

  const TRADFI_STEPS = [
    { icon: '🏦', title: 'You deposit $10,000 into Celsius', sub: 'Celsius holds your funds. Legally they are now Celsius property — a liability on their balance sheet.' },
    { icon: '📉', title: 'Celsius deploys capital in risky DeFi strategies', sub: 'You have no visibility. You just see the APY number.' },
    { icon: '🚨', title: 'June 12, 2022 — Celsius freezes all withdrawals', sub: 'A single company decision locks every user out. You cannot access your money. No recourse.' },
    { icon: '⚖️', title: 'Bankruptcy filed. Your $10,000 is an unsecured claim.', sub: 'You wait years in a legal queue. You receive cents on the dollar — if anything.' },
  ];
  const DEFI_STEPS = [
    { icon: '👛', title: 'You deposit $10,000 via your wallet into a lending protocol', sub: 'Your ETH moves into a smart contract. The contract holds it — not a company.' },
    { icon: '🔐', title: 'Only your wallet key can withdraw', sub: 'No company can freeze your access. No executive decision. The code is the only gatekeeper.' },
    { icon: '📜', title: 'Protocol rules are public and immutable', sub: 'You can read exactly what the contract does. There are no hidden strategies.' },
    { icon: '✅', title: 'At any time: you withdraw. Instantly. No permission needed.', sub: 'Non-custodial means you are always in control. Permissionless means no one can stop you.' },
  ];

  const steps = panel === 'tradfi' ? TRADFI_STEPS : DEFI_STEPS;
  const currentStep = panel === 'tradfi' ? tradfiStep : defiStep;

  function advance() {
    if (panel === 'tradfi') {
      const next = Math.min(tradfiStep + 1, TRADFI_STEPS.length - 1);
      setTradfiStep(next);
      if (next >= 2) setSawFreeze(true);
    } else {
      const next = Math.min(defiStep + 1, DEFI_STEPS.length - 1);
      setDefiStep(next);
      if (next >= 3) setSawNonCustodial(true);
    }
  }
  const canComplete = sawFreeze && sawNonCustodial;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⚖️" title="Custody Comparison" subtitle="Walk through both scenarios. Understand what non-custodial actually means in practice." colors={colors} />
      <View style={s.row}>
        {(['tradfi', 'defi'] as const).map(p => (
          <TouchableOpacity key={p} style={[s.toggleBtn, { borderColor: panel === p ? colors.accent : colors.border }, panel === p && { backgroundColor: colors.accent + '20' }]} onPress={() => setPanel(p)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: panel === p ? colors.accent : colors.textSoft }]}>{p === 'tradfi' ? '🏦 Celsius (TradFi)' : '🔐 DeFi Protocol'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.rateBox, { backgroundColor: panel === 'tradfi' ? '#ef444415' : colors.green + '15', borderColor: panel === 'tradfi' ? '#ef4444' : colors.green }]}>
        {steps.slice(0, currentStep + 1).map((step, i) => (
          <View key={i} style={[s.allocRow, { backgroundColor: colors.bgSecondary, borderColor: colors.border, opacity: i < currentStep ? 0.6 : 1 }]}>
            <Text style={{ fontSize: 24 }}>{step.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>{step.title}</Text>
              <Text style={[{ fontSize: FontSize.xs, lineHeight: 17, marginTop: 3 }, { color: colors.textSoft }]}>{step.sub}</Text>
            </View>
          </View>
        ))}
      </View>
      {currentStep < steps.length - 1 && <ActionBtn label="Advance →" onPress={advance} variant="starknet" colors={colors} />}
      {currentStep === steps.length - 1 && panel === 'tradfi' && <ActionBtn label="Now see the DeFi scenario →" onPress={() => setPanel('defi')} variant="starknet" colors={colors} />}
      {canComplete && (
        <View style={[s.alertBox, { backgroundColor: colors.green + '15', borderColor: colors.green }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>Key distinction: non-custodial + permissionless</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 17, marginTop: 4 }, { color: colors.textSoft }]}>DeFi removes the company between you and your money. The protocol executes automatically — no intermediary can freeze, lose, or restrict your funds.</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 — starkzap-token-classifier
// ══════════════════════════════════════════════════════════════════════════════

const TOKEN_ITEMS = [
  { id: 'usdc',    label: 'USDC',         hint: 'Issued by Circle. Always 1:1 with USD. No price exposure.', correct: 'stablecoin' },
  { id: 'strk',    label: 'STRK',         hint: 'Starknet governance token. Value fluctuates with market.', correct: 'governance' },
  { id: 'wsstrk',  label: 'wstSTRK',      hint: 'STRK deposited in a staking contract. Balance grows as rewards accrue.', correct: 'yield-bearing' },
  { id: 'lptoken', label: 'STRK/USDC LP', hint: 'Represents your share of an Ekubo pool. Price depends on both assets and fees earned.', correct: 'lp' },
  { id: 'eth',     label: 'ETH',          hint: 'Ether. Native gas token. No yield unless staked or deposited.', correct: 'governance' },
  { id: 'ausdc',   label: 'aUSDC',        hint: 'USDC deposited in AAVE-style lending. Balance increases as interest accrues.', correct: 'yield-bearing' },
];
const TOKEN_CATS = ['stablecoin', 'governance', 'yield-bearing', 'lp'];

export function TokenClassifierSim({ onComplete, onSkip, colors }: SimProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);

  function assign(tokenId: string, cat: string) {
    setAssignments(a => ({ ...a, [tokenId]: cat }));
    setRevealed(r => ({ ...r, [tokenId]: true }));
    setSelected(null);
  }
  const allAssigned = TOKEN_ITEMS.every(t => assignments[t.id]);
  const score = TOKEN_ITEMS.filter(t => assignments[t.id] === t.correct).length;
  const canComplete = allAssigned && score >= 4;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🏷️" title="Token Type Classifier" subtitle="Tap a token, then tap the correct category. Wrong answers show explanations." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>TOKENS — TAP TO SELECT</Text>
      <View style={s.row}>
        {TOKEN_ITEMS.map(t => {
          const assigned = assignments[t.id];
          const correct = assigned === t.correct;
          const isSel = selected === t.id;
          return (
            <TouchableOpacity key={t.id} style={[s.miniBtn, { borderColor: assigned ? (correct ? colors.green : '#ef4444') : isSel ? colors.accent : colors.border, backgroundColor: isSel ? colors.accent + '20' : assigned ? (correct ? colors.green + '15' : '#ef444415') : colors.bgSecondary, minWidth: 90, paddingVertical: 8 }]} onPress={() => setSelected(isSel ? null : t.id)}>
              <Text style={[{ fontSize: FontSize.sm, fontWeight: '800', textAlign: 'center' }, { color: colors.text }]}>{t.label}</Text>
              {assigned && <Text style={[{ fontSize: 9, textAlign: 'center', marginTop: 2 }, { color: correct ? colors.green : '#ef4444' }]}>{correct ? '✓' : '✗'}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      {selected && (
        <>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>CLASSIFY: {TOKEN_ITEMS.find(t => t.id === selected)!.label}</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.textSoft }]}>{TOKEN_ITEMS.find(t => t.id === selected)!.hint}</Text>
          <View style={s.row}>
            {TOKEN_CATS.map(cat => (
              <TouchableOpacity key={cat} style={[s.miniBtn, { borderColor: colors.accent, backgroundColor: colors.accent + '15', flex: 1, paddingVertical: 8 }]} onPress={() => assign(selected, cat)}>
                <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: colors.accent }]}>{cat.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      {Object.entries(revealed).map(([id]) => {
        const token = TOKEN_ITEMS.find(t => t.id === id)!;
        if (assignments[id] === token.correct) return null;
        return (
          <View key={id} style={[s.alertBox, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#ef4444' }]}>{token.label} → {token.correct.toUpperCase()}</Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>{token.hint}</Text>
          </View>
        );
      })}
      {allAssigned && (
        <View style={[s.resultBox, { borderColor: score >= 4 ? colors.green : '#f59e0b', backgroundColor: score >= 4 ? colors.green + '15' : '#f59e0b15' }]}>
          <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: score >= 4 ? colors.green : '#f59e0b' }]}>{score}/6 correct</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 — starkzap-yield-audit
// ══════════════════════════════════════════════════════════════════════════════

const YIELD_OFFERINGS = [
  { id: 'vesu-usdc',  label: 'Vesu USDC Lending',       apy: '8%',   payer: 'Borrowers paying interest on USDC loans — real fee revenue.', sustainable: true },
  { id: 'ekubo-lp',  label: 'Ekubo STRK/USDC LP',       apy: '12%',  payer: 'Swap fees paid by traders routing through this pool — real fee revenue.', sustainable: true },
  { id: 'new-proto', label: 'New Protocol "SuperYield"', apy: '100%', payer: 'Token emissions. The protocol mints and distributes its own governance token. No external payer.', sustainable: false },
  { id: 'eth-stake', label: 'ETH Liquid Staking (wstETH)',apy: '4%',  payer: 'Ethereum validator rewards — paid by the ETH protocol from new issuance and MEV tips.', sustainable: true },
  { id: 'strk-stake',label: 'STRK Staking',              apy: '7%',   payer: 'Starknet protocol inflation — token issuance scheduled by governance.', sustainable: true },
];

export function YieldAuditSim({ onComplete, onSkip, colors }: SimProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const allRevealed = revealed.size === YIELD_OFFERINGS.length;
  const flaggedUnsustainable = flags.has('new-proto');
  const canComplete = allRevealed && flaggedUnsustainable;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔍" title="Yield Source Audit" subtitle="For each offering: reveal who pays, then flag any you cannot justify economically." colors={colors} />
      {YIELD_OFFERINGS.map(o => {
        const isRevealed = revealed.has(o.id);
        const isFlagged = flags.has(o.id);
        return (
          <View key={o.id} style={[s.rateBox, { borderColor: isFlagged ? '#ef4444' : isRevealed ? (o.sustainable ? colors.green : '#f59e0b') : colors.border }]}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.text }]}>{o.label}</Text>
                <Text style={[{ fontSize: FontSize.xl, fontWeight: '900', marginTop: 2 }, { color: colors.accent }]}>{o.apy} APY</Text>
              </View>
              <View style={s.row}>
                <TouchableOpacity style={[s.miniBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]} onPress={() => setRevealed(r => new Set([...r, o.id]))}>
                  <Text style={[{ fontSize: 9, fontWeight: '800' }, { color: colors.textSoft }]}>REVEAL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.miniBtn, { borderColor: isFlagged ? '#ef4444' : colors.border, backgroundColor: isFlagged ? '#ef444415' : colors.bgSecondary }]} onPress={() => setFlags(f => { const n = new Set(f); isFlagged ? n.delete(o.id) : n.add(o.id); return n; })}>
                  <Text style={[{ fontSize: 9, fontWeight: '800' }, { color: isFlagged ? '#ef4444' : colors.textSoft }]}>⚑ FLAG</Text>
                </TouchableOpacity>
              </View>
            </View>
            {isRevealed && (
              <View style={[s.hintBox, { backgroundColor: o.sustainable ? colors.green + '10' : '#f59e0b10', borderColor: o.sustainable ? colors.green : '#f59e0b' }]}>
                <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.textSoft }]}>💰 <Text style={{ fontWeight: '800' }}>Payer: </Text>{o.payer}</Text>
                {!o.sustainable && <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', marginTop: 4 }, { color: '#f59e0b' }]}>⚠️ Token emissions yield collapses when the token loses value — and it always does eventually.</Text>}
              </View>
            )}
          </View>
        );
      })}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 — starkzap-risk-matrix
// ══════════════════════════════════════════════════════════════════════════════

const RISK_DIMS = [
  { id: 'smart',    label: 'Smart Contract Risk', evidence: 'Audited by Trail of Bits (2023). No critical findings. TVL $180M, live 14 months with no exploits.' },
  { id: 'oracle',   label: 'Oracle Risk',          evidence: 'Uses Pragma on-chain oracle with 3 providers and TWAP fallback. Single-source failure would not liquidate positions.' },
  { id: 'liquidity',label: 'Liquidity Risk',       evidence: 'Current utilisation 72%. At 90%+ users cannot withdraw immediately. Peak utilisation observed: 84%.' },
  { id: 'gov',      label: 'Governance Risk',      evidence: 'Fully on-chain governance. 5 major token holders control 62% of votes. 48-hour timelock on all parameter changes.' },
  { id: 'market',   label: 'Market Risk',          evidence: 'STRK collateral accepted. STRK price dropped 80% in 2023 bear market. LTV set at 50% to provide buffer.' },
];
const RISK_LEVELS = ['Low', 'Medium', 'High'];
const LEVEL_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export function RiskMatrixSim({ onComplete, onSkip, colors }: SimProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const allScored = RISK_DIMS.every(d => scores[d.id] !== undefined);
  const totalScore = allScored ? Object.values(scores).reduce((s, v) => s + v, 0) : null;
  const compositeLevel = totalScore !== null ? (totalScore <= 4 ? 0 : totalScore <= 7 ? 1 : 2) : null;
  const canComplete = allScored;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛡️" title="Protocol Risk Matrix" subtitle="Score each risk dimension. Read the evidence first. Observe how the composite rating changes." colors={colors} />
      {RISK_DIMS.map(dim => (
        <View key={dim.id} style={[s.dimCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <TouchableOpacity style={s.row} onPress={() => setExpanded(expanded === dim.id ? null : dim.id)}>
            <Text style={[{ flex: 1, fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>{dim.label}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>{expanded === dim.id ? '▲' : '▼ evidence'}</Text>
          </TouchableOpacity>
          {expanded === dim.id && <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}>{dim.evidence}</Text>}
          <View style={s.row}>
            {RISK_LEVELS.map((lvl, i) => (
              <TouchableOpacity key={lvl} style={[s.scoreBtn, { borderColor: scores[dim.id] === i ? LEVEL_COLORS[i] : colors.border, backgroundColor: scores[dim.id] === i ? LEVEL_COLORS[i] + '20' : 'transparent' }]} onPress={() => setScores(sc => ({ ...sc, [dim.id]: i }))}>
                <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: scores[dim.id] === i ? LEVEL_COLORS[i] : colors.textSoft }]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      {allScored && compositeLevel !== null && (
        <View style={[s.resultBox, { borderColor: LEVEL_COLORS[compositeLevel], backgroundColor: LEVEL_COLORS[compositeLevel] + '15' }]}>
          <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: LEVEL_COLORS[compositeLevel] }]}>Composite: {RISK_LEVELS[compositeLevel]} Risk</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 — starkzap-settlement-trace
// ══════════════════════════════════════════════════════════════════════════════

const T2_STEPS = [
  { day: 'T+0', label: 'Trade executed', detail: 'You buy 100 shares. Counterparty agrees to sell. No money changes hands yet.', isFail: false },
  { day: 'T+1', label: 'Counterparty books the trade', detail: 'Both sides book the obligation. Your counterparty holds the shares 24 more hours.', isFail: false },
  { day: 'T+1⚠', label: 'Counterparty failure window', detail: 'If the counterparty fails here — like Herstatt Bank in 1974 — they may not deliver tomorrow. Settlement fails.', isFail: true },
  { day: 'T+2', label: 'Settlement (if counterparty survived)', detail: 'Cash moves from your account. Shares transfer to you. Two full days after the trade.', isFail: false },
];
const ATOMIC_STEPS = [
  { label: 'You submit a swap transaction', detail: 'One transaction. Atomic: either everything happens or nothing happens.' },
  { label: 'Smart contract checks: do you have ETH?', detail: 'If yes, continues. If no, reverts immediately with zero cost (minus gas).' },
  { label: 'ETH leaves your wallet; STRK enters your wallet', detail: 'Both happen in the same block. There is no gap. There is no counterparty.' },
  { label: 'Settlement complete — same block as trade', detail: 'T+0. No custodian. No clearinghouse. No two-day window. No counterparty risk.' },
];

export function SettlementTraceSim({ onComplete, onSkip, colors }: SimProps) {
  const [mode, setMode] = useState<'tradfi' | 'defi'>('tradfi');
  const [t2Step, setT2Step] = useState(0);
  const [atomicStep, setAtomicStep] = useState(0);
  const [triggeredFail, setTriggeredFail] = useState(false);
  const [completedAtomic, setCompletedAtomic] = useState(false);
  const canComplete = triggeredFail && completedAtomic;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⏱️" title="Settlement: T+2 vs Atomic" subtitle="Step through both models. Trigger the counterparty failure, then complete the DeFi atomic settlement." colors={colors} />
      <View style={s.row}>
        {(['tradfi', 'defi'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.toggleBtn, { borderColor: mode === m ? colors.accent : colors.border }, mode === m && { backgroundColor: colors.accent + '20' }]} onPress={() => setMode(m)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: mode === m ? colors.accent : colors.textSoft }]}>{m === 'tradfi' ? '🏦 T+2 (TradFi)' : '⚡ Atomic (DeFi)'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {mode === 'tradfi' && (
        <>
          {T2_STEPS.slice(0, t2Step + 1).map((step, i) => (
            <View key={i} style={[s.allocRow, { backgroundColor: step.isFail ? '#ef444415' : colors.bgSecondary, borderColor: step.isFail ? '#ef4444' : colors.green }]}>
              <View style={[{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: step.isFail ? '#ef444420' : colors.green + '20' }]}>
                <Text style={[{ fontSize: 9, fontWeight: '900' }, { color: step.isFail ? '#ef4444' : colors.green }]}>{step.day}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: step.isFail ? '#ef4444' : colors.text }]}>{step.label}</Text>
                <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>{step.detail}</Text>
              </View>
            </View>
          ))}
          {t2Step < T2_STEPS.length - 1 && <ActionBtn label="Next Step →" onPress={() => { const next = t2Step + 1; setT2Step(next); if (T2_STEPS[next].isFail) setTriggeredFail(true); }} variant="starknet" colors={colors} />}
          {triggeredFail && <ActionBtn label="Now see atomic settlement →" onPress={() => setMode('defi')} variant="starknet" colors={colors} />}
        </>
      )}
      {mode === 'defi' && (
        <>
          {ATOMIC_STEPS.slice(0, atomicStep + 1).map((step, i) => (
            <View key={i} style={[s.allocRow, { backgroundColor: colors.bgSecondary, borderColor: i === atomicStep ? colors.green : colors.border }]}>
              <View style={[{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: colors.green + '20' }]}>
                <Text style={[{ fontSize: FontSize.xs, fontWeight: '900' }, { color: colors.green }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>{step.label}</Text>
                <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>{step.detail}</Text>
              </View>
            </View>
          ))}
          {atomicStep < ATOMIC_STEPS.length - 1 && <ActionBtn label="Next Step →" onPress={() => { const next = atomicStep + 1; setAtomicStep(next); if (next === ATOMIC_STEPS.length - 1) setCompletedAtomic(true); }} variant="starknet" colors={colors} />}
        </>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 — starkzap-wallet-flow
// ══════════════════════════════════════════════════════════════════════════════

export function WalletFlowSim({ onComplete, onSkip, colors }: SimProps) {
  const [step, setStep] = useState<'connect' | 'approve' | 'swap' | 'receipt'>('connect');
  const [loading, setLoading] = useState(false);

  async function next(to: typeof step) { setLoading(true); await simulateDelay(900); setLoading(false); setStep(to); }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="💫" title="Your First DeFi Transaction" subtitle="Connect, approve, swap. Read each screen carefully." colors={colors} />
      <View style={s.row}>
        {(['connect','approve','swap','receipt'] as const).map((st, i) => (
          <View key={st} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, { backgroundColor: step === st ? colors.accent : colors.border + '80' }]}>
              <Text style={[{ fontSize: 11, fontWeight: '800' }, { color: colors.text }]}>{i + 1}</Text>
            </View>
            <Text style={[{ fontSize: 9, marginTop: 2, textAlign: 'center' }, { color: colors.textSoft }]}>{st}</Text>
          </View>
        ))}
      </View>
      {step === 'connect' && (
        <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>Connect Wallet</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}>Connecting does NOT give the protocol access to your funds. It only reads your address. No transaction is submitted yet.</Text>
          <DemoBadge colors={colors} />
          <ActionBtn label={loading ? '⏳ Connecting…' : 'Connect Wallet'} onPress={() => next('approve')} variant="starknet" colors={colors} />
        </View>
      )}
      {step === 'approve' && (
        <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>Token Approval</Text>
          <View style={[s.hintBox, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b' }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}><Text style={{ fontWeight: '800', color: '#f59e0b' }}>What you are signing: </Text>You authorise the Ekubo router to spend up to 1,000 USDC. This does NOT transfer funds — it gives permission for the next transaction to do so.</Text>
          </View>
          <ActionBtn label={loading ? '⏳ Approving…' : 'Approve 1,000 USDC'} onPress={() => next('swap')} variant="starknet" colors={colors} />
        </View>
      )}
      {step === 'swap' && (
        <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>Execute Swap</Text>
          <InfoRow icon="📤" label="You send" value="1,000 USDC" colors={colors} />
          <InfoRow icon="📥" label="You receive (est.)" value="1,243 STRK" colors={colors} />
          <InfoRow icon="🛤️" label="Route" value="AVNU → Ekubo 0.3%" colors={colors} />
          <InfoRow icon="🎯" label="Slippage tolerance" value="0.5%" colors={colors} />
          <ActionBtn label={loading ? '⏳ Submitting…' : 'Confirm Swap'} onPress={() => next('receipt')} variant="starknet" colors={colors} />
        </View>
      )}
      {step === 'receipt' && (
        <View style={[s.resultBox, { borderColor: colors.green, backgroundColor: colors.green + '10' }]}>
          <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: colors.green }]}>✓ Transaction confirmed</Text>
          <InfoRow icon="🔗" label="Tx hash" value="0x04f3a…9e1c" colors={colors} />
          <InfoRow icon="⛽" label="Gas cost" value="0.00034 ETH ($1.12)" colors={colors} />
          <InfoRow icon="📥" label="STRK received" value="1,247 STRK" colors={colors} />
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={step !== 'receipt'} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 2 — starkzap-route-inspector
// ══════════════════════════════════════════════════════════════════════════════

const ROUTE_POOLS = [
  { id: 'ekubo-main', label: 'Ekubo STRK/USDC (0.3%)', tvl: 2400000, share: 60 },
  { id: 'ekubo-alt',  label: 'Ekubo STRK/USDC (1%)',   tvl: 380000,  share: 30 },
  { id: 'myswap',     label: 'MySwap STRK/USDC',        tvl: 95000,   share: 10 },
];

export function RouteInspectorSim({ onComplete, onSkip, colors }: SimProps) {
  const [overridePool, setOverridePool] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const TRADE = 5000;

  function calcOutput(shares: number[]) {
    return ROUTE_POOLS.reduce((total, p, i) => {
      const amt = TRADE * shares[i] / 100;
      const impact = amt / p.tvl;
      return total + amt / (1.24 * (1 + impact / 2));
    }, 0);
  }

  const optimised = calcOutput(ROUTE_POOLS.map(p => p.share));
  const overridedShares = ROUTE_POOLS.map(p => p.id === overridePool ? 100 : 0);
  const singleOut = overridePool ? calcOutput(overridedShares) : null;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔀" title="AVNU Route Inspector" subtitle="Inspect how AVNU splits your $5,000 trade. Force a single-pool route and compare output." colors={colors} />
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>OPTIMISED SPLIT ROUTE</Text>
        {ROUTE_POOLS.map(p => (
          <View key={p.id} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: FontSize.xs, fontWeight: '700' }, { color: colors.text }]}>{p.label}</Text>
              <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>TVL: ${(p.tvl / 1000).toFixed(0)}K</Text>
            </View>
            <View style={[s.impactBar, { flex: 0.4, marginVertical: 4 }]}>
              <View style={[s.impactFill, { width: `${p.share}%` as any, backgroundColor: colors.accent }]} />
            </View>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', minWidth: 36, textAlign: 'right' }, { color: colors.accent }]}>{p.share}%</Text>
          </View>
        ))}
        <View style={[s.resultBox, { borderColor: colors.green, backgroundColor: colors.green + '10', marginTop: 4 }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.green }]}>Output: {optimised.toFixed(2)} STRK</Text>
        </View>
      </View>
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>FORCE SINGLE POOL</Text>
      {ROUTE_POOLS.map(p => (
        <TouchableOpacity key={p.id} style={[s.allocRow, { backgroundColor: overridePool === p.id ? colors.accent + '15' : colors.bgSecondary, borderColor: overridePool === p.id ? colors.accent : colors.border }]} onPress={() => setOverridePool(overridePool === p.id ? null : p.id)}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.text }]}>{p.label}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>impact: ~{((TRADE / p.tvl) * 100).toFixed(1)}%</Text>
          </View>
          {overridePool === p.id && <Text style={{ color: colors.accent }}>✓</Text>}
        </TouchableOpacity>
      ))}
      {singleOut !== null && (
        <View style={[s.resultBox, { borderColor: '#ef4444', backgroundColor: '#ef444410' }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: '#ef4444' }]}>Single-pool: {singleOut.toFixed(2)} STRK</Text>
          <Text style={[{ fontSize: FontSize.xs, marginTop: 3 }, { color: colors.textSoft }]}>Loss vs optimised: {(optimised - singleOut).toFixed(2)} STRK (${((optimised - singleOut) * 1.24).toFixed(2)})</Text>
        </View>
      )}
      {!executed && <ActionBtn label={loading ? '⏳ Executing…' : 'Execute Optimised Route'} onPress={async () => { setLoading(true); await simulateDelay(1000); setLoading(false); setExecuted(true); }} variant="starknet" colors={colors} />}
      {executed && <TxResult label="Swap complete" hash="0x09b2…3f4a" colors={colors} />}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!executed || !overridePool} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 2 — starkzap-slippage-calc
// ══════════════════════════════════════════════════════════════════════════════

const SLIPPAGE_POOLS = [
  { id: 'deep',   label: 'Deep Pool ($2M TVL)',    tvl: 2000000 },
  { id: 'medium', label: 'Medium Pool ($200K TVL)', tvl: 200000 },
  { id: 'thin',   label: 'Thin Pool ($20K TVL)',    tvl: 20000 },
];

export function SlippageCalcSim({ onComplete, onSkip, colors }: SimProps) {
  const [poolId, setPoolId] = useState('medium');
  const [tolerance, setTolerance] = useState(0.5);
  const [sawRevert, setSawRevert] = useState(false);
  const [sawSuccess, setSawSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<null | { reverted: boolean; impact: number }>(null);
  const pool = SLIPPAGE_POOLS.find(p => p.id === poolId)!;
  const priceImpact = (10000 / pool.tvl) * 100;
  const canComplete = sawRevert && sawSuccess;

  async function simulate() {
    setLoading(true); await simulateDelay(700); setLoading(false);
    const reverted = priceImpact > tolerance;
    if (reverted) setSawRevert(true); else setSawSuccess(true);
    setLastResult({ reverted, impact: priceImpact });
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🎯" title="Slippage Tolerance & Revert Simulator" subtitle="Find the pool+tolerance combination that causes a revert. Then find the tolerance that succeeds." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SELECT POOL</Text>
      {SLIPPAGE_POOLS.map(p => (
        <TouchableOpacity key={p.id} style={[s.allocRow, { backgroundColor: poolId === p.id ? colors.accent + '15' : colors.bgSecondary, borderColor: poolId === p.id ? colors.accent : colors.border }]} onPress={() => { setPoolId(p.id); setLastResult(null); }}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.text }]}>{p.label}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>$10K trade → ~{((10000 / p.tvl) * 100).toFixed(1)}% impact</Text>
          </View>
          {poolId === p.id && <Text style={{ color: colors.accent }}>✓</Text>}
        </TouchableOpacity>
      ))}
      <Text style={[s.sectionLabel, { color: colors.textSoft, marginTop: 4 }]}>SLIPPAGE TOLERANCE</Text>
      <View style={s.stepRow}>
        {[0.1, 0.5, 1.0, 2.0, 5.0].map(l => (
          <TouchableOpacity key={l} style={[s.stepBtn, { borderColor: tolerance === l ? (l >= 2 ? '#ef4444' : colors.accent) : colors.border }, tolerance === l && { backgroundColor: (l >= 2 ? '#ef4444' : colors.accent) + '20' }]} onPress={() => { setTolerance(l); setLastResult(null); }}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: tolerance === l ? (l >= 2 ? '#ef4444' : colors.accent) : colors.textSoft }]}>{l}%</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tolerance >= 2 && <Text style={[{ fontSize: FontSize.xs }, { color: '#f59e0b' }]}>⚠️ Tolerance above 2% increases MEV sandwich risk.</Text>}
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="📊" label="Price impact" value={`~${priceImpact.toFixed(2)}%`} colors={colors} />
        <InfoRow icon="🎯" label="Tolerance" value={`${tolerance}%`} colors={colors} />
        <InfoRow icon="⚖️" label="Verdict" value={priceImpact <= tolerance ? '✓ Will succeed' : '✗ Will revert'} colors={colors} />
      </View>
      <ActionBtn label={loading ? '⏳ Simulating…' : 'Simulate Transaction'} onPress={simulate} variant="starknet" colors={colors} />
      {lastResult && (
        <View style={[s.alertBox, { backgroundColor: lastResult.reverted ? '#ef444415' : colors.green + '15', borderColor: lastResult.reverted ? '#ef4444' : colors.green }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: lastResult.reverted ? '#ef4444' : colors.green }]}>{lastResult.reverted ? '✗ Transaction reverted' : '✓ Transaction succeeded'}</Text>
          <Text style={[{ fontSize: FontSize.xs, marginTop: 3 }, { color: colors.textSoft }]}>{lastResult.reverted ? `Impact (${lastResult.impact.toFixed(2)}%) > tolerance (${tolerance}%). Gas consumed, funds safe.` : `Impact (${lastResult.impact.toFixed(2)}%) within tolerance (${tolerance}%).`}</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 2 — starkzap-split-order
// ══════════════════════════════════════════════════════════════════════════════

export function SplitOrderSim({ onComplete, onSkip, colors }: SimProps) {
  const [chunks, setChunks] = useState(1);
  const [simDone, setSimDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const TVL = 500000; const TOTAL = 50000; const ETH_PRICE = 3200; const GAS_ETH = 0.00034;

  function calcImpact(n: number) {
    let total = 0; let tvl = TVL;
    for (let i = 0; i < n; i++) {
      const per = TOTAL / n;
      total += (per / tvl) * 100;
      tvl = tvl * 0.7 + TVL * 0.3;
    }
    return total;
  }
  const impact = calcImpact(chunks);
  const gasCost = chunks * GAS_ETH * ETH_PRICE;
  const savings = chunks > 1 ? (calcImpact(1) - impact) / 100 * TOTAL - gasCost : 0;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="✂️" title="Large Order Splitting" subtitle="Compare $50,000 STRK as one trade vs split. Find the optimal split." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>NUMBER OF CHUNKS</Text>
      <View style={s.stepRow}>
        {[1, 2, 3, 5, 10, 20].map(n => (
          <TouchableOpacity key={n} style={[s.stepBtn, { borderColor: chunks === n ? colors.accent : colors.border }, chunks === n && { backgroundColor: colors.accent + '20' }]} onPress={() => { setChunks(n); setSimDone(false); }}>
            <Text style={[{ fontSize: 10, fontWeight: '800', textAlign: 'center' }, { color: chunks === n ? colors.accent : colors.textSoft }]}>{n === 1 ? '1\nsingle' : n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <View style={s.row}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Price Impact</Text>
            <Text style={[s.rateValue, { color: impact > 5 ? '#ef4444' : impact > 2 ? '#f59e0b' : colors.green }]}>{impact.toFixed(2)}%</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Gas Cost</Text>
            <Text style={[s.rateValue, { color: colors.accent }]}>${gasCost.toFixed(2)}</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>Net Gain</Text>
            <Text style={[s.rateValue, { color: savings > 0 ? colors.green : '#ef4444' }]}>{savings > 0 ? '+' : ''}${savings.toFixed(0)}</Text>
          </View>
        </View>
      </View>
      {chunks >= 10 && <View style={[s.hintBox, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b' }]}><Text style={[{ fontSize: FontSize.xs }, { color: '#f59e0b' }]}>⚠️ Diminishing returns: gas cost grows linearly while impact savings plateau.</Text></View>}
      <ActionBtn label={loading ? '⏳ Running…' : 'Run Simulation'} onPress={async () => { setLoading(true); await simulateDelay(900); setLoading(false); setSimDone(true); }} variant="starknet" colors={colors} />
      {simDone && <View style={[s.resultBox, { borderColor: savings > 0 ? colors.green : '#ef4444', backgroundColor: (savings > 0 ? colors.green : '#ef4444') + '10' }]}><Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: savings > 0 ? colors.green : '#ef4444' }]}>{savings > 0 ? `✓ Splitting saves $${savings.toFixed(0)} net` : '✗ Gas exceeds savings — single trade better at this split'}</Text></View>}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!simDone || chunks === 1} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ════════════════════════════════════════════════════════════════════
// NEW — Labs 3–11 new sims
// ════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// LAB 3 — starkzap-pos-overview
// ══════════════════════════════════════════════════════════════════════════════

const VALIDATORS_POS = [
  { id: 'v1', name: 'StarkLabs',  uptime: 99.8, fee: 5,  safe: true },
  { id: 'v2', name: 'AlphaNode',  uptime: 97.2, fee: 12, safe: true },
  { id: 'v3', name: 'QuickStake', uptime: 99.1, fee: 8,  safe: true },
  { id: 'v4', name: 'MaxAPY Node',uptime: 94.0, fee: 3,  safe: false },
];

export function PosOverviewSim({ onComplete, onSkip, colors }: SimProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [epochs, setEpochs] = useState(0);
  const [delegated, setDelegated] = useState(false);
  const [loading, setLoading] = useState(false);
  const STAKE = 1000; const GROSS_APY = 0.07; const EPOCH_DAYS = 1;
  const validator = VALIDATORS_POS.find(v => v.id === selected);
  const netAPY = validator ? GROSS_APY * (1 - validator.fee / 100) : 0;
  const totalReward = delegated ? STAKE * netAPY * EPOCH_DAYS * epochs / 365 : 0;
  const highFeeReward = STAKE * GROSS_APY * (1 - 0.03) * EPOCH_DAYS * epochs / 365;
  const canComplete = delegated && epochs >= 3;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🏛️" title="Validator Selection & Delegation" subtitle="Pick a validator, delegate 1,000 STRK, advance epochs to see rewards." colors={colors} />
      {VALIDATORS_POS.map(v => (
        <TouchableOpacity key={v.id} style={[s.validatorCard, { backgroundColor: selected === v.id ? colors.accent + '15' : colors.bgSecondary, borderColor: selected === v.id ? colors.accent : !v.safe ? '#ef4444' : colors.border }]} onPress={() => { setSelected(v.id); setDelegated(false); setEpochs(0); }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={[s.posName, { color: colors.text }]}>{v.name} {!v.safe && '⚠️'}</Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>Uptime: {v.uptime}% · Fee: {v.fee}% · Net APY: {(GROSS_APY * (1 - v.fee / 100) * 100).toFixed(1)}%</Text>
            </View>
            {selected === v.id && <Text style={{ color: colors.accent, fontSize: 18 }}>✓</Text>}
          </View>
          {!v.safe && <Text style={[{ fontSize: 9, marginTop: 2 }, { color: '#ef4444' }]}>Low uptime (94%) — risk of missed epochs and slashing</Text>}
        </TouchableOpacity>
      ))}
      {selected && !delegated && <ActionBtn label={loading ? '⏳ Delegating…' : `Delegate 1,000 STRK to ${validator?.name}`} onPress={async () => { setLoading(true); await simulateDelay(800); setLoading(false); setDelegated(true); }} variant="starknet" colors={colors} />}
      {delegated && (
        <>
          <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <InfoRow icon="📅" label="Epoch" value={`${epochs}`} colors={colors} />
            <InfoRow icon="💰" label="Rewards" value={`${totalReward.toFixed(4)} STRK`} colors={colors} />
            <InfoRow icon="📈" label="Net APY" value={`${(netAPY * 100).toFixed(1)}%`} colors={colors} />
          </View>
          <View style={s.row}>
            {[1, 3, 5].map(n => (
              <TouchableOpacity key={n} style={[s.miniBtn, { borderColor: colors.accent, flex: 1 }]} onPress={() => setEpochs(e => e + n)}>
                <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' }, { color: colors.accent }]}>+{n} epoch{n > 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {epochs >= 3 && selected !== 'v4' && (
            <View style={[s.hintBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.textSoft }]}>MaxAPY Node (3% fee): {highFeeReward.toFixed(4)} STRK — {totalReward > highFeeReward ? 'you earned more' : 'you earned less'} with {validator?.name}. But 94% uptime means missed epochs during downtime.</Text>
            </View>
          )}
        </>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 3 — starkzap-stake-tracker
// ══════════════════════════════════════════════════════════════════════════════

export function StakeTrackerSim({ onComplete, onSkip, colors }: SimProps) {
  const [epoch, setEpoch] = useState(0);
  const [unstakeInitiated, setUnstakeInitiated] = useState(false);
  const [unstakeEpoch, setUnstakeEpoch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const PRINCIPAL = 2000; const UNSTAKE = 1000; const NET_APY = 0.065;
  const activeStake = unstakeInitiated ? PRINCIPAL - UNSTAKE : PRINCIPAL;
  const rewards = activeStake * NET_APY * epoch / 365;
  const unbondRemaining = unstakeInitiated && unstakeEpoch !== null ? Math.max(0, 21 - (epoch - unstakeEpoch)) : null;
  const canComplete = epoch >= 5 && unstakeInitiated;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📊" title="Staking Position Manager" subtitle="Advance epochs to accumulate rewards. At epoch 5, initiate a partial unstake." colors={colors} />
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="📅" label="Epoch" value={`${epoch}`} colors={colors} />
        <InfoRow icon="🔐" label="Active stake" value={`${activeStake.toLocaleString()} STRK`} colors={colors} />
        <InfoRow icon="💰" label="Rewards" value={`${rewards.toFixed(4)} STRK`} colors={colors} />
        {unstakeInitiated && <InfoRow icon="⏳" label="Unbonding" value={`${UNSTAKE} STRK — ${unbondRemaining} days left`} colors={colors} />}
      </View>
      <View style={s.row}>
        {[1, 3, 5].map(n => (
          <TouchableOpacity key={n} style={[s.miniBtn, { borderColor: colors.accent, flex: 1 }]} onPress={() => setEpoch(e => e + n)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' }, { color: colors.accent }]}>+{n} epoch{n > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {epoch >= 5 && !unstakeInitiated && (
        <View style={[s.alertBox, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b' }]}>
          <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#f59e0b' }]}>Ready: initiate partial unstake</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>Unstaking 1,000 STRK starts 21-day unbonding. Rewards on that portion stop immediately.</Text>
          <ActionBtn label={loading ? '⏳…' : 'Initiate Unstake (1,000 STRK)'} onPress={async () => { setLoading(true); await simulateDelay(700); setLoading(false); setUnstakeInitiated(true); setUnstakeEpoch(epoch); }} variant="starknet" colors={colors} />
        </View>
      )}
      {unbondRemaining !== null && (
        <View style={[s.phaseBox, { borderColor: unbondRemaining === 0 ? colors.green : '#f59e0b', backgroundColor: unbondRemaining === 0 ? colors.green + '10' : '#f59e0b10' }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: unbondRemaining === 0 ? colors.green : '#f59e0b' }]}>{unbondRemaining === 0 ? '✓ Unbonding complete — withdrawable' : `⏳ ${unbondRemaining} days remaining`}</Text>
          <View style={[s.impactBar, { marginTop: 6 }]}>
            <View style={[s.impactFill, { width: `${Math.min(100, ((21 - unbondRemaining) / 21) * 100)}%` as any, backgroundColor: unbondRemaining === 0 ? colors.green : '#f59e0b' }]} />
          </View>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 3 — starkzap-staking-calc
// ══════════════════════════════════════════════════════════════════════════════

export function StakingCalcSim({ onComplete, onSkip, colors }: SimProps) {
  const [months, setMonths] = useState(12);
  const [hasTried6, setHasTried6] = useState(false);
  const [hasTried12, setHasTried12] = useState(false);
  const NET_APY = 0.07 * (1 - 0.08); const INFLATION = 0.045;
  const unbondCost = 10000 * NET_APY / 365 * 21;
  const grossRewards = 10000 * NET_APY * months / 12;
  const netRewards = grossRewards - (months < 12 ? unbondCost : 0);
  const breakEvenMonths = unbondCost / (10000 * NET_APY / 12);
  const canComplete = hasTried6 && hasTried12;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🧮" title="Staking Economics Calculator" subtitle="Compare 6-month vs 12-month staking. Factor in the 21-day exit opportunity cost." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>STAKING DURATION</Text>
      <View style={s.stepRow}>
        {[1, 3, 6, 9, 12, 18, 24].map(m => (
          <TouchableOpacity key={m} style={[s.stepBtn, { borderColor: months === m ? colors.accent : colors.border }, months === m && { backgroundColor: colors.accent + '20' }]} onPress={() => { setMonths(m); if (m === 6) setHasTried6(true); if (m === 12) setHasTried12(true); }}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: months === m ? colors.accent : colors.textSoft }]}>{m}mo</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="📈" label="Net APY" value={`${(NET_APY * 100).toFixed(1)}%`} colors={colors} />
        <InfoRow icon="💰" label="Gross rewards" value={`${grossRewards.toFixed(2)} STRK`} colors={colors} />
        {months < 12 && <InfoRow icon="⏳" label="Unbonding opportunity cost" value={`-${unbondCost.toFixed(2)} STRK`} colors={colors} />}
        <InfoRow icon="🎯" label="Net rewards" value={`${netRewards.toFixed(2)} STRK`} colors={colors} />
        <InfoRow icon="📊" label="Real return vs inflation" value={`${((NET_APY - INFLATION) * 100).toFixed(1)}%`} colors={colors} />
      </View>
      <View style={[s.hintBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}>Break-even staking duration: <Text style={{ fontWeight: '800', color: colors.accent }}>{breakEvenMonths.toFixed(1)} months</Text>{'\n'}Below this, the 21-day unbonding cost exceeds rewards earned.</Text>
      </View>
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 4 — starkzap-supply-demo
// ══════════════════════════════════════════════════════════════════════════════

const SUPPLY_ASSETS = [
  { id: 'usdc', label: 'USDC', utilisation: 72, apy: 8.2 },
  { id: 'eth',  label: 'ETH',  utilisation: 58, apy: 4.1 },
  { id: 'strk', label: 'STRK', utilisation: 88, apy: 14.3 },
  { id: 'wbtc', label: 'wBTC', utilisation: 41, apy: 2.8 },
];

export function SupplyDemoSim({ onComplete, onSkip, colors }: SimProps) {
  const [supplied, setSupplied] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const canComplete = supplied.size >= 2;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="💵" title="Asset Supply & Yield Comparison" subtitle="Supply at least two assets. Observe how utilisation drives APY and withdrawal risk." colors={colors} />
      {SUPPLY_ASSETS.map(asset => {
        const isSupplied = supplied.has(asset.id);
        return (
          <View key={asset.id} style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: isSupplied ? colors.green : colors.border }]}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.text }]}>{asset.label}</Text>
                <Text style={[{ fontSize: FontSize.xl, fontWeight: '900' }, { color: colors.accent }]}>{asset.apy}% APY</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>Utilisation</Text>
                <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: asset.utilisation > 80 ? '#f59e0b' : colors.text }]}>{asset.utilisation}%</Text>
              </View>
            </View>
            <View style={[s.impactBar, { marginVertical: 4 }]}>
              <View style={[s.impactFill, { width: `${asset.utilisation}%` as any, backgroundColor: asset.utilisation > 80 ? '#f59e0b' : colors.green }]} />
            </View>
            {asset.utilisation > 80 && <Text style={[{ fontSize: FontSize.xs }, { color: '#f59e0b' }]}>⚠️ High utilisation — may not be withdrawable if utilisation hits 90%+</Text>}
            {!isSupplied
              ? <ActionBtn label={loading === asset.id ? '⏳ Supplying…' : `Supply 10,000 ${asset.label}`} onPress={async () => { setLoading(asset.id); await simulateDelay(800); setLoading(null); setSupplied(s => new Set([...s, asset.id])); }} variant="starknet" colors={colors} />
              : <View style={[s.hintBox, { backgroundColor: colors.green + '10', borderColor: colors.green }]}><Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.green }]}>✓ Supplied — earning {asset.apy}% APY</Text></View>}
          </View>
        );
      })}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 4 — starkzap-liquidation-watch
// ══════════════════════════════════════════════════════════════════════════════

export function LiquidationWatchSim({ onComplete, onSkip, colors }: SimProps) {
  const [ethPrice, setEthPrice] = useState(2800);
  const [sawWarning, setSawWarning] = useState(false);
  const [liquidated, setLiquidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const COLL_ETH = 1.5; const BORROW = 2800; const LIQ_THRESH = 0.82; const LIQ_BONUS = 0.05;
  const collValue = COLL_ETH * ethPrice;
  const hf = (collValue * LIQ_THRESH) / BORROW;
  const liqPrice = BORROW / (COLL_ETH * LIQ_THRESH);
  const hfColor = hf >= 1.5 ? colors.green : hf >= 1.2 ? '#f59e0b' : '#ef4444';
  if (hf < 1.2 && !liquidated && !sawWarning) setSawWarning(true);
  const canComplete = sawWarning && liquidated;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🚨" title="Liquidation Threshold — Live Watch" subtitle="Drop ETH price to watch the health factor fall. Trigger liquidation at HF < 1.0." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>ETH PRICE</Text>
      <View style={s.stepRow}>
        {[3200, 2800, 2400, 2000, 1800, 1600, 1400].map(p => (
          <TouchableOpacity key={p} style={[s.priceChip, { borderColor: ethPrice === p ? hfColor : colors.border }, ethPrice === p && { backgroundColor: hfColor + '20' }]} onPress={() => { setEthPrice(p); setLiquidated(false); }}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: ethPrice === p ? hfColor : colors.textSoft }]}>${p}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.hfBox, { borderColor: hfColor, backgroundColor: hfColor + '12' }]}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '700' }, { color: colors.textSoft }]}>Health Factor</Text>
            <Text style={[{ fontSize: 40, fontWeight: '900', letterSpacing: -1 }, { color: hfColor }]}>{hf.toFixed(2)}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>Liquidation at HF = 1.0</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>Collateral: ${collValue.toLocaleString()}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>Debt: ${BORROW.toLocaleString()}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: '#ef4444' }]}>Liq. price: ${liqPrice.toFixed(0)}</Text>
          </View>
        </View>
      </View>
      {sawWarning && !liquidated && hf < 1.0 && (
        <View style={[s.alertBox, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}>
          <Text style={[s.alertTitle, { color: '#ef4444' }]}>⚠️ HF below 1.0 — Position is liquidatable</Text>
          <Text style={[s.alertTxt, { color: colors.textSoft }]}>A liquidator can repay your ${BORROW.toLocaleString()} debt and seize ETH at a {LIQ_BONUS * 100}% discount.</Text>
          <ActionBtn label={loading ? '⏳ Processing…' : 'Trigger Liquidation'} onPress={async () => { setLoading(true); await simulateDelay(900); setLoading(false); setLiquidated(true); }} variant="starknet" colors={colors} />
        </View>
      )}
      {liquidated && (
        <View style={[s.resultBox, { borderColor: '#ef4444', backgroundColor: '#ef444415' }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: '#ef4444' }]}>💀 Position liquidated</Text>
          <InfoRow icon="🎁" label="Liquidation bonus taken by liquidator" value={`${LIQ_BONUS * 100}% = $${(collValue * LIQ_BONUS).toFixed(0)}`} colors={colors} />
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 5 — starkzap-dca-setup
// ══════════════════════════════════════════════════════════════════════════════

export function DcaSetupSim({ onComplete, onSkip, colors }: SimProps) {
  const [amount, setAmount] = useState(200);
  const [freq, setFreq] = useState<'daily' | 'weekly' | 'biweekly'>('weekly');
  const [sawNarrow, setSawNarrow] = useState(false);
  const [sawBroad, setSawBroad] = useState(false);
  const [minPrice, setMinPrice] = useState(0.50);
  const [maxPrice, setMaxPrice] = useState(1.50);
  const CURRENT = 0.92;
  const FREQ_MAP = { daily: 365, weekly: 52, biweekly: 26 };
  const inRange = CURRENT >= minPrice && CURRENT <= maxPrice;
  const rangeWidth = maxPrice - minPrice;
  const execRate = inRange ? Math.min(100, Math.round(60 + rangeWidth * 20)) : Math.round(rangeWidth > 0.5 ? 30 : 10);
  const canComplete = sawNarrow && sawBroad;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⏰" title="AVNU DCA Order Configuration" subtitle="Set frequency and price range. See how a narrow range reduces execution probability." colors={colors} />
      <View style={s.row}>
        {(['daily', 'weekly', 'biweekly'] as const).map(f => (
          <TouchableOpacity key={f} style={[s.toggleBtn, { borderColor: freq === f ? colors.accent : colors.border }, freq === f && { backgroundColor: colors.accent + '20' }]} onPress={() => setFreq(f)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: freq === f ? colors.accent : colors.textSoft }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>PRICE RANGE PRESETS (current: ${CURRENT})</Text>
      <View style={s.row}>
        <TouchableOpacity style={[s.miniBtn, { borderColor: colors.border, flex: 1 }]} onPress={() => { setMinPrice(0.80); setMaxPrice(1.00); setSawNarrow(true); }}>
          <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: colors.textSoft }]}>Narrow ($0.80–$1.00)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.miniBtn, { borderColor: colors.border, flex: 1 }]} onPress={() => { setMinPrice(0.50); setMaxPrice(1.50); setSawBroad(true); }}>
          <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: colors.textSoft }]}>Broad ($0.50–$1.50)</Text>
        </TouchableOpacity>
      </View>
      <Text style={[{ fontSize: FontSize.xs, textAlign: 'center' }, { color: colors.textSoft }]}>Range: ${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}</Text>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="📅" label="Orders per year" value={`${FREQ_MAP[freq]}`} colors={colors} />
        <InfoRow icon="💰" label="Annual total" value={`$${(amount * FREQ_MAP[freq]).toLocaleString()}`} colors={colors} />
        <InfoRow icon="📊" label="Price in range?" value={inRange ? '✓ Yes' : '✗ No — orders skip'} colors={colors} />
        <InfoRow icon="🎯" label="Est. execution rate" value={`~${execRate}%`} colors={colors} />
      </View>
      {!inRange && (
        <View style={[s.alertBox, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}>
          <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#ef4444' }]}>Current price (${CURRENT}) is outside range</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>Orders won't execute until STRK re-enters range. Narrow ranges miss more orders.</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 5 — starkzap-twamm-viz
// ══════════════════════════════════════════════════════════════════════════════

export function TwammVizSim({ onComplete, onSkip, colors }: SimProps) {
  const [mode, setMode] = useState<'instant' | 'twamm'>('instant');
  const [twammDay, setTwammDay] = useState(0);
  const [instantDone, setInstantDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const TOTAL = 500000; const TVL = 1000000; const DAYS = 7; const BASE = 1.24;
  const instImpact = TOTAL / TVL;
  const instPrice = BASE * (1 + instImpact / 2);
  const instSTRK = TOTAL / instPrice;
  let twammTotal = 0; let poolState = TVL;
  const slices: { price: number; strk: number }[] = [];
  for (let d = 0; d < DAYS; d++) {
    const impact = (TOTAL / DAYS) / poolState;
    const price = BASE * (1 + impact / 2);
    const strk = (TOTAL / DAYS) / price;
    twammTotal += strk; slices.push({ price, strk });
    poolState = poolState * 0.4 + TVL * 0.6;
  }
  const twammAvgPrice = TOTAL / twammTotal;
  const canComplete = instantDone && twammDay === DAYS;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🌊" title="TWAMM vs Instant Execution" subtitle="Execute a $500K STRK purchase both ways. Compare average price." colors={colors} />
      <View style={s.row}>
        {(['instant', 'twamm'] as const).map(m => (
          <TouchableOpacity key={m} style={[s.toggleBtn, { borderColor: mode === m ? colors.accent : colors.border }, mode === m && { backgroundColor: colors.accent + '20' }]} onPress={() => setMode(m)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: mode === m ? colors.accent : colors.textSoft }]}>{m === 'instant' ? '⚡ Instant' : '🌊 TWAMM (7 days)'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {mode === 'instant' && (
        <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <InfoRow icon="📊" label="Price impact" value={`${(instImpact * 100).toFixed(1)}% — buying 50% of pool`} colors={colors} />
          <InfoRow icon="💱" label="Avg price" value={`$${instPrice.toFixed(4)}/STRK`} colors={colors} />
          <InfoRow icon="📦" label="STRK received" value={`${instSTRK.toFixed(0)} STRK`} colors={colors} />
          {!instantDone
            ? <ActionBtn label={loading ? '⏳…' : 'Execute Instant Trade'} onPress={async () => { setLoading(true); await simulateDelay(800); setLoading(false); setInstantDone(true); }} variant="starknet" colors={colors} />
            : <TxResult label="Instant trade complete" hash="0x1a3f…" colors={colors} />}
        </View>
      )}
      {mode === 'twamm' && (
        <>
          <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '800', marginBottom: 4 }, { color: colors.text }]}>TWAMM — Day {twammDay}/{DAYS}</Text>
            {slices.slice(0, twammDay).map((sl, i) => (
              <InfoRow key={i} icon="📅" label={`Day ${i + 1}`} value={`${sl.strk.toFixed(0)} STRK @ $${sl.price.toFixed(4)}`} colors={colors} />
            ))}
            {twammDay < DAYS && <ActionBtn label={`Execute Day ${twammDay + 1}`} onPress={() => setTwammDay(d => d + 1)} variant="starknet" colors={colors} />}
          </View>
          {twammDay === DAYS && (
            <View style={[s.resultBox, { borderColor: colors.green, backgroundColor: colors.green + '10' }]}>
              <InfoRow icon="💱" label="TWAMM avg price" value={`$${twammAvgPrice.toFixed(4)}/STRK`} colors={colors} />
              <InfoRow icon="📦" label="STRK received" value={`${twammTotal.toFixed(0)} STRK`} colors={colors} />
            </View>
          )}
        </>
      )}
      {canComplete && (
        <View style={[s.alertBox, { backgroundColor: colors.green + '15', borderColor: colors.green }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>TWAMM advantage: +{(twammTotal - instSTRK).toFixed(0)} STRK (${((twammTotal - instSTRK) * BASE).toFixed(0)})</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 3 }, { color: colors.textSoft }]}>Arbitrageurs re-balanced the pool between daily slices — each subsequent trade got a better price than a single lump-sum purchase.</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 5 — starkzap-auto-portfolio
// ══════════════════════════════════════════════════════════════════════════════

export function AutoPortfolioSim({ onComplete, onSkip, colors }: SimProps) {
  const [ethP, setEthP] = useState(40);
  const [strkP, setStrkP] = useState(30);
  const [usdcP, setUsdcP] = useState(30);
  const [dca, setDca] = useState(1000);
  const [trigger, setTrigger] = useState(10);
  const [month, setMonth] = useState(0);
  const [rebalances, setRebalances] = useState(0);
  const total = ethP + strkP + usdcP;
  const valid = Math.abs(total - 100) < 1;

  function getState(m: number) {
    const strkGain = 1.0 + Math.min(m / 3, 1) * 0.20;
    const portfolio = 100000 + dca * m;
    const strkValue = 100000 * strkP / 100 * strkGain + dca * m * strkP / 100;
    const allValue = portfolio;
    const strkActual = strkValue / allValue * 100;
    return { portfolio, strkActual, drift: Math.abs(strkActual - strkP) };
  }

  function advance() {
    const next = month + 1;
    const st = getState(next);
    if (st.drift > trigger) setRebalances(r => r + 1);
    setMonth(next);
  }

  const state = getState(month);
  const canComplete = month >= 6 && rebalances >= 1;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🤖" title="Automated Portfolio Simulation" subtitle="Configure allocations, DCA, and drift trigger. Run to month 6." colors={colors} />
      {month === 0 && (
        <>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>ALLOCATIONS (must sum to 100%)</Text>
          {[{ label: 'ETH %', val: ethP, set: setEthP }, { label: 'STRK %', val: strkP, set: setStrkP }, { label: 'USDC %', val: usdcP, set: setUsdcP }].map(({ label, val, set }) => (
            <View key={label} style={s.numRow}>
              <Text style={[s.numLabel, { color: colors.text }]}>{label}</Text>
              <TouchableOpacity style={s.numBtn} onPress={() => set(Math.max(0, val - 5))}><Text style={[s.numBtnTxt, { color: colors.accent }]}>−</Text></TouchableOpacity>
              <Text style={[s.numVal, { color: colors.text }]}>{val}%</Text>
              <TouchableOpacity style={s.numBtn} onPress={() => set(Math.min(100, val + 5))}><Text style={[s.numBtnTxt, { color: colors.accent }]}>+</Text></TouchableOpacity>
            </View>
          ))}
          {!valid && <Text style={[{ fontSize: FontSize.xs }, { color: '#ef4444' }]}>Allocations must sum to 100% (currently {total}%)</Text>}
          <Text style={[s.sectionLabel, { color: colors.textSoft, marginTop: 4 }]}>REBALANCE TRIGGER</Text>
          <View style={s.stepRow}>
            {[5, 10, 15, 20].map(t => (
              <TouchableOpacity key={t} style={[s.stepBtn, { borderColor: trigger === t ? colors.accent : colors.border }, trigger === t && { backgroundColor: colors.accent + '20' }]} onPress={() => setTrigger(t)}>
                <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: trigger === t ? colors.accent : colors.textSoft }]}>±{t}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      {month > 0 && (
        <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <InfoRow icon="📅" label="Month" value={`${month}/6`} colors={colors} />
          <InfoRow icon="💼" label="Portfolio" value={`$${state.portfolio.toLocaleString()}`} colors={colors} />
          <InfoRow icon="📊" label="STRK drift" value={`${state.drift.toFixed(1)}% ${state.drift > trigger ? '🔄 REBALANCE!' : ''}`} colors={colors} />
          <InfoRow icon="🔄" label="Rebalances triggered" value={`${rebalances}`} colors={colors} />
        </View>
      )}
      {month < 6 && valid && <ActionBtn label={`Advance to Month ${month + 1}`} onPress={advance} variant="starknet" colors={colors} />}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 6 — starkzap-yield-stack
// ══════════════════════════════════════════════════════════════════════════════

export function YieldStackSim({ onComplete, onSkip, colors }: SimProps) {
  const [lpPct, setLpPct] = useState(40);
  const [sawViolation, setSawViolation] = useState(false);
  const [compared, setCompared] = useState(false);
  const TOTAL = 30000; const LP_APY = 0.12; const LEND_APY = 0.08; const LP_LIMIT = 60;
  const lpAmt = TOTAL * lpPct / 100; const lendAmt = TOTAL - lpAmt;
  const simpleYield = lpAmt * LP_APY + lendAmt * LEND_APY;
  const compoundedYield = lpAmt * LP_APY + lendAmt * (Math.pow(1 + LEND_APY / 12, 12) - 1);
  if (lpPct > LP_LIMIT && !sawViolation) setSawViolation(true);
  const canComplete = sawViolation && compared;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📐" title="Yield Stacking — Lending + LP" subtitle="Split $30,000. Max 60% in LP. Compare compounded vs simple at 12 months." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LP ALLOCATION: {lpPct}%</Text>
      <View style={s.stepRow}>
        {[20, 40, 50, 60, 70, 80].map(p => (
          <TouchableOpacity key={p} style={[s.stepBtn, { borderColor: lpPct === p ? (p > LP_LIMIT ? '#ef4444' : colors.accent) : colors.border }, lpPct === p && { backgroundColor: (p > LP_LIMIT ? '#ef4444' : colors.accent) + '20' }]} onPress={() => setLpPct(p)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: lpPct === p ? (p > LP_LIMIT ? '#ef4444' : colors.accent) : colors.textSoft }]}>{p}%</Text>
          </TouchableOpacity>
        ))}
      </View>
      {lpPct > LP_LIMIT && <View style={[s.alertBox, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}><Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#ef4444' }]}>⚠️ LP concentration exceeds 60% limit</Text></View>}
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="🏊" label={`LP (${lpPct}%)`} value={`$${(lpAmt * LP_APY).toFixed(0)}/yr`} colors={colors} />
        <InfoRow icon="💵" label={`Lending (${100 - lpPct}%)`} value={`$${(lendAmt * LEND_APY).toFixed(0)}/yr`} colors={colors} />
        <InfoRow icon="📊" label="Total (simple)" value={`$${simpleYield.toFixed(0)}/yr`} colors={colors} />
        <InfoRow icon="📈" label="Total (compounded monthly)" value={`$${compoundedYield.toFixed(0)}/yr`} colors={colors} />
        <InfoRow icon="🎯" label="Compounding advantage" value={`+$${(compoundedYield - simpleYield).toFixed(0)}`} colors={colors} />
      </View>
      {!compared && lpPct <= LP_LIMIT && <ActionBtn label="Compare Compounded vs Simple" onPress={() => setCompared(true)} variant="starknet" colors={colors} />}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 6 — starkzap-drift-rebalancer
// ══════════════════════════════════════════════════════════════════════════════

export function DriftRebalancerSim({ onComplete, onSkip, colors }: SimProps) {
  const [decision, setDecision] = useState<null | 'rebalance' | 'hold'>(null);
  const [reasoning, setReasoning] = useState('');
  const TOTAL = 200000; const STRK_RALLY = 0.30;
  const strkBase = TOTAL * 0.30; const strkNow = strkBase * (1 + STRK_RALLY);
  const totalNow = TOTAL + strkBase * STRK_RALLY;
  const strkPct = strkNow / totalNow * 100;
  const drift = strkPct - 30;
  const COST = 80;
  const canComplete = decision !== null && reasoning.length > 20;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⚖️" title="Portfolio Drift & Rebalancing Tool" subtitle="STRK rallied 30%. Assess whether the drift justifies $80 in rebalancing costs." colors={colors} />
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="📊" label="STRK target" value="30.0%" colors={colors} />
        <InfoRow icon="📈" label="STRK current" value={`${strkPct.toFixed(1)}% (+${drift.toFixed(1)}% drift)`} colors={colors} />
        <InfoRow icon="💸" label="Rebalancing cost (gas + fees)" value={`$${COST}`} colors={colors} />
        <InfoRow icon="💰" label="Misallocated capital" value={`~$${(drift / 100 * totalNow).toFixed(0)}`} colors={colors} />
      </View>
      <View style={s.row}>
        {(['rebalance', 'hold'] as const).map(d => (
          <TouchableOpacity key={d} style={[s.toggleBtn, { borderColor: decision === d ? (d === 'rebalance' ? colors.accent : '#f59e0b') : colors.border }, decision === d && { backgroundColor: (d === 'rebalance' ? colors.accent : '#f59e0b') + '20' }]} onPress={() => setDecision(d)}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: decision === d ? (d === 'rebalance' ? colors.accent : '#f59e0b') : colors.textSoft }]}>{d === 'rebalance' ? '🔄 Rebalance now' : '✋ Hold'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={[s.input, { color: colors.text, borderColor: colors.border, minHeight: 60 }]} placeholder="Explain your reasoning (min 20 chars)…" placeholderTextColor={colors.textSoft} value={reasoning} onChangeText={setReasoning} multiline />
      {canComplete && (
        <View style={[s.hintBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}>At ${COST} cost and {drift.toFixed(1)}% drift — many practitioners only rebalance above 5–10% drift. Your reasoning should justify whether this threshold is meaningful for your portfolio size.</Text>
        </View>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 7 — starkzap-fee-tracker
// ══════════════════════════════════════════════════════════════════════════════

export function FeeTrackerSim({ onComplete, onSkip, colors }: SimProps) {
  const [posSize, setPosSize] = useState(50000);
  const [dailyVol, setDailyVol] = useState(500000);
  const [foundBreakeven, setFoundBreakeven] = useState(false);
  const POOL_TVL = 2000000;
  const poolShare = posSize / POOL_TVL;
  const highFeeDaily = dailyVol * 0.003 * poolShare;
  const lowFeeDaily = dailyVol * 0.0005 * poolShare;
  const breakEvenVol = (highFeeDaily / (0.0005 * poolShare));

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="💸" title="LP Fee Accumulation Tracker" subtitle="Compare fee tiers. Find the daily volume where 0.05% catches up to 0.3%." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>POSITION SIZE</Text>
      <View style={s.stepRow}>
        {[10000, 25000, 50000, 100000].map(s2 => (
          <TouchableOpacity key={s2} style={[s.stepBtn, { borderColor: posSize === s2 ? colors.accent : colors.border }, posSize === s2 && { backgroundColor: colors.accent + '20' }]} onPress={() => setPosSize(s2)}>
            <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: posSize === s2 ? colors.accent : colors.textSoft }]}>${(s2 / 1000).toFixed(0)}K</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[s.sectionLabel, { color: colors.textSoft, marginTop: 4 }]}>DAILY VOLUME</Text>
      <View style={s.stepRow}>
        {[100000, 250000, 500000, 1000000, 5000000].map(v => (
          <TouchableOpacity key={v} style={[s.stepBtn, { borderColor: dailyVol === v ? colors.accent : colors.border }, dailyVol === v && { backgroundColor: colors.accent + '20' }]} onPress={() => { setDailyVol(v); if (v >= breakEvenVol * 0.9) setFoundBreakeven(true); }}>
            <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: dailyVol === v ? colors.accent : colors.textSoft }]}>${(v / 1000).toFixed(0)}K</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <View style={s.row}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>0.3% Fee Tier</Text>
            <Text style={[s.rateValue, { color: colors.green }]}>${highFeeDaily.toFixed(2)}/day</Text>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[s.rateLabel, { color: colors.textSoft }]}>0.05% Fee Tier</Text>
            <Text style={[s.rateValue, { color: highFeeDaily > lowFeeDaily ? '#f59e0b' : colors.green }]}>${lowFeeDaily.toFixed(2)}/day</Text>
          </View>
        </View>
      </View>
      <View style={[s.hintBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}>Break-even volume: <Text style={{ fontWeight: '800', color: colors.accent }}>${(breakEvenVol / 1000).toFixed(0)}K/day</Text>{'\n'}0.3% always earns more per unit of volume — but 0.05% pools attract higher-volume traders.</Text>
      </View>
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!foundBreakeven} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 7 — starkzap-lp-sizer
// ══════════════════════════════════════════════════════════════════════════════

export function LpSizerSim({ onComplete, onSkip, colors }: SimProps) {
  const [posPct, setPosPct] = useState(15);
  const [rangePct, setRangePct] = useState(15);
  const [sawViolation, setSawViolation] = useState(false);
  const PORTFOLIO = 200000; const LP_LIMIT = 25; const POOL_TVL = 2000000; const DAILY_VOL = 500000;
  const posUSD = PORTFOLIO * posPct / 100;
  const activeRatio = Math.min(1, rangePct / 50);
  const dailyFees = DAILY_VOL * 0.003 * (posUSD / POOL_TVL) * activeRatio;
  if (posPct > LP_LIMIT && !sawViolation) setSawViolation(true);
  const canComplete = sawViolation;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📏" title="LP Position Sizing" subtitle="Portfolio: $200,000. Max 25% in LP. Find the position that maximises active capital within limits." colors={colors} />
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>POSITION SIZE (% of portfolio)</Text>
      <View style={s.stepRow}>
        {[10, 15, 20, 25, 30, 40].map(p => (
          <TouchableOpacity key={p} style={[s.stepBtn, { borderColor: posPct === p ? (p > LP_LIMIT ? '#ef4444' : colors.accent) : colors.border }, posPct === p && { backgroundColor: (p > LP_LIMIT ? '#ef4444' : colors.accent) + '20' }]} onPress={() => setPosPct(p)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: posPct === p ? (p > LP_LIMIT ? '#ef4444' : colors.accent) : colors.textSoft }]}>{p}%</Text>
          </TouchableOpacity>
        ))}
      </View>
      {posPct > LP_LIMIT && <View style={[s.alertBox, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}><Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#ef4444' }]}>⚠️ Exceeds 25% LP limit — ${posUSD.toLocaleString()} on a $200K portfolio</Text></View>}
      <Text style={[s.sectionLabel, { color: colors.textSoft, marginTop: 4 }]}>PRICE RANGE (±%)</Text>
      <View style={s.stepRow}>
        {[5, 10, 15, 20, 30, 50].map(r => (
          <TouchableOpacity key={r} style={[s.stepBtn, { borderColor: rangePct === r ? colors.accent : colors.border }, rangePct === r && { backgroundColor: colors.accent + '20' }]} onPress={() => setRangePct(r)}>
            <Text style={[{ fontSize: 10, fontWeight: '800' }, { color: rangePct === r ? colors.accent : colors.textSoft }]}>±{r}%</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="💰" label="Position size" value={`$${posUSD.toLocaleString()} (${posPct}%)`} colors={colors} />
        <InfoRow icon="⚡" label="Active capital" value={`${(activeRatio * 100).toFixed(0)}% in range`} colors={colors} />
        <InfoRow icon="💸" label="Est. daily fees" value={`$${dailyFees.toFixed(2)}`} colors={colors} />
        <InfoRow icon="📊" label="Effective APY" value={`${(dailyFees * 365 / posUSD * 100).toFixed(1)}%`} colors={colors} />
      </View>
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 7 — starkzap-multi-range
// ══════════════════════════════════════════════════════════════════════════════

export function MultiRangeSim({ onComplete, onSkip, colors }: SimProps) {
  const [scenario, setScenario] = useState<'rangebound' | 'trending'>('rangebound');
  const [simRun, setSimRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const POOL_TVL = 2000000; const DAILY_VOL = 400000; const TOTAL = 100000;
  const cfg = { rangebound: { narrowDays: 6.5, wideDays: 7, fullDays: 7 }, trending: { narrowDays: 2, wideDays: 5.5, fullDays: 7 } };
  const c = cfg[scenario];
  const share = (TOTAL / 2) / POOL_TVL;
  const dualFees = (DAILY_VOL * 0.003 * share * c.narrowDays) + (DAILY_VOL * 0.003 * share * c.wideDays);
  const fullFees = DAILY_VOL * 0.003 * (TOTAL / POOL_TVL) * c.fullDays;
  const winner = dualFees > fullFees ? 'Dual-Range' : 'Full Range';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🎯" title="Multi-Range LP Strategy" subtitle="Compare dual-range (±5% + ±40%) vs single full-range. Results differ by market conditions." colors={colors} />
      <View style={s.row}>
        {(['rangebound', 'trending'] as const).map(sc => (
          <TouchableOpacity key={sc} style={[s.toggleBtn, { borderColor: scenario === sc ? colors.accent : colors.border }, scenario === sc && { backgroundColor: colors.accent + '20' }]} onPress={() => { setScenario(sc); setSimRun(false); }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center', lineHeight: 16 }, { color: scenario === sc ? colors.accent : colors.textSoft }]}>{sc === 'rangebound' ? '↔️ Range-Bound' : '📈 Trending +25%'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="🎯" label="Narrow range (±5%) days in range" value={`${c.narrowDays}/7`} colors={colors} />
        <InfoRow icon="🌐" label="Wide range (±40%) days in range" value={`${c.wideDays}/7`} colors={colors} />
        <InfoRow icon="♾️" label="Full range days in range" value="7/7 (always active)" colors={colors} />
      </View>
      <ActionBtn label={loading ? '⏳ Simulating…' : 'Run 7-Day Simulation'} onPress={async () => { setLoading(true); await simulateDelay(1100); setLoading(false); setSimRun(true); }} variant="starknet" colors={colors} />
      {simRun && (
        <>
          <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <View style={s.row}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[s.rateLabel, { color: colors.textSoft }]}>Dual-Range</Text>
                <Text style={[s.rateValue, { color: winner === 'Dual-Range' ? colors.green : colors.text }]}>${dualFees.toFixed(2)}</Text>
              </View>
              <View style={[s.divider, { backgroundColor: colors.border }]} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[s.rateLabel, { color: colors.textSoft }]}>Full Range</Text>
                <Text style={[s.rateValue, { color: winner === 'Full Range' ? colors.green : colors.text }]}>${fullFees.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          <View style={[s.resultBox, { borderColor: colors.green, backgroundColor: colors.green + '10' }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>Winner: {winner}</Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 3 }, { color: colors.textSoft }]}>{scenario === 'rangebound' ? 'Range-bound: concentrated ranges capture more fees. Combined dual-range beats passive full-range.' : 'Trending: narrow range goes out-of-range quickly, earns nothing. Full range stays active throughout.'}</Text>
          </View>
        </>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!simRun} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 10 — starkzap-tax-ledger
// ══════════════════════════════════════════════════════════════════════════════

const TX_TYPES_10 = ['swap', 'lp-entry', 'lp-exit', 'yield-claim', 'transfer'] as const;
type TxType10 = typeof TX_TYPES_10[number];
const TX_INFO_10: Record<TxType10, { icon: string; taxable: boolean; label: string; note: string }> = {
  'swap':        { icon: '💱', taxable: true,  label: 'Token Swap',     note: 'Taxable disposal in most jurisdictions — you sold one asset to buy another.' },
  'lp-entry':    { icon: '🏊', taxable: false, label: 'LP Deposit',     note: 'Not taxable in most jurisdictions — you contributed assets to a pool.' },
  'lp-exit':     { icon: '🚪', taxable: true,  label: 'LP Withdrawal',  note: 'Taxable — you received tokens back, potentially at a different value than deposited.' },
  'yield-claim': { icon: '💰', taxable: true,  label: 'Yield Claim',    note: 'Taxable as income in most jurisdictions — you received new tokens.' },
  'transfer':    { icon: '📤', taxable: false, label: 'Wallet Transfer', note: 'Not taxable — moving between your own wallets is not a disposal.' },
};

export function TaxLedgerSim({ onComplete, onSkip, colors }: SimProps) {
  const [logged, setLogged] = useState<Set<TxType10>>(new Set());
  const [exported, setExported] = useState(false);
  const canExport = TX_TYPES_10.every(t => logged.has(t));
  const canComplete = canExport && exported;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📋" title="DeFi Tax Record Ledger" subtitle="Log one of each transaction type. Observe which are taxable disposals." colors={colors} />
      {TX_TYPES_10.map(type => {
        const info = TX_INFO_10[type];
        const isLogged = logged.has(type);
        return (
          <View key={type} style={[s.allocRow, { backgroundColor: isLogged ? (info.taxable ? '#ef444410' : colors.green + '10') : colors.bgSecondary, borderColor: isLogged ? (info.taxable ? '#ef4444' : colors.green) : colors.border }]}>
            <Text style={{ fontSize: 20 }}>{info.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.text }]}>{info.label}</Text>
              {isLogged && <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>{info.note}</Text>}
            </View>
            {isLogged
              ? <Text style={[{ fontSize: 9, fontWeight: '800' }, { color: info.taxable ? '#ef4444' : colors.green }]}>{info.taxable ? 'TAXABLE' : 'NOT TAXABLE'}</Text>
              : <TouchableOpacity style={[s.miniBtn, { borderColor: colors.accent }]} onPress={() => setLogged(l => new Set([...l, type]))}><Text style={[{ fontSize: 9, fontWeight: '800' }, { color: colors.accent }]}>LOG</Text></TouchableOpacity>}
          </View>
        );
      })}
      {canExport && !exported && (
        <>
          <View style={[s.hintBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 17 }, { color: colors.textSoft }]}><Text style={{ fontWeight: '800', color: '#ef4444' }}>Taxable: </Text>swaps, LP exits, yield claims.{'\n'}<Text style={{ fontWeight: '800', color: colors.green }}>Not taxable: </Text>LP deposits, wallet transfers.</Text>
          </View>
          <ActionBtn label="Export Transaction Record" onPress={() => setExported(true)} variant="starknet" colors={colors} />
        </>
      )}
      {exported && <TxResult label="Record exported — 5 transactions with cost basis" hash="export_2024_q1.csv" colors={colors} />}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 10 — starkzap-concentration-risk
// ══════════════════════════════════════════════════════════════════════════════

const CONTAGION_PROTOS = [
  { id: 'vesu',    name: 'Vesu (Lending)',   oracle: 'pragma',    pct: 30 },
  { id: 'ekubo',   name: 'Ekubo (AMM)',       oracle: 'pragma',    pct: 20 },
  { id: 'zklend',  name: 'zkLend (Lending)',  oracle: 'pragma',    pct: 20 },
  { id: 'jedi',    name: 'JediSwap (AMM)',    oracle: 'chainlink', pct: 15 },
  { id: 'avnu',    name: 'AVNU (Aggregator)', oracle: 'none',      pct: 15 },
];

export function ConcentrationRiskSim({ onComplete, onSkip, colors }: SimProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const [restructured, setRestructured] = useState(false);
  const [newAlloc, setNewAlloc] = useState<Record<string, number>>({});
  const pragmaProtos = CONTAGION_PROTOS.filter(p => p.oracle === 'pragma');
  const contagion = failed ? pragmaProtos.filter(p => p.id !== failed).map(p => p.id) : [];
  const pragmaTotal = pragmaProtos.reduce((s, p) => s + (newAlloc[p.id] ?? p.pct), 0);
  if (pragmaTotal <= 40 && failed && !restructured && Object.keys(newAlloc).length > 0) setRestructured(true);
  const canComplete = failed !== null && contagion.length > 0 && (restructured || pragma_total_orig() <= 40);
  function pragma_total_orig() { return pragmaProtos.reduce((s, p) => s + p.pct, 0); }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🕸️" title="Protocol Concentration & Contagion Risk" subtitle="Trigger a failure and trace contagion. Restructure to reduce correlated exposure below 40%." colors={colors} />
      <View style={[s.hintBox, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b' }]}>
        <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: '#f59e0b' }]}>Shared dependency: Pragma Oracle</Text>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>Vesu, Ekubo, and zkLend all use Pragma. A Pragma oracle failure affects {pragma_total_orig()}% of this portfolio simultaneously.</Text>
      </View>
      {CONTAGION_PROTOS.map(p => (
        <TouchableOpacity key={p.id} style={[s.allocRow, { backgroundColor: failed === p.id ? '#ef444415' : contagion.includes(p.id) ? '#f59e0b15' : colors.bgSecondary, borderColor: failed === p.id ? '#ef4444' : contagion.includes(p.id) ? '#f59e0b' : colors.border }]} onPress={() => !failed && setFailed(p.id)}>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.text }]}>{p.name}</Text>
            <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>Oracle: {p.oracle} · {p.pct}% of portfolio</Text>
          </View>
          {failed === p.id && <Text style={{ color: '#ef4444' }}>💀 FAILED</Text>}
          {contagion.includes(p.id) && <Text style={{ color: '#f59e0b' }}>⚡ CONTAGION</Text>}
          {!failed && <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>tap to fail</Text>}
        </TouchableOpacity>
      ))}
      {failed && contagion.length > 0 && (
        <>
          <View style={[s.alertBox, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}>
            <Text style={[s.alertTitle, { color: '#ef4444' }]}>Contagion path detected</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft }]}>{failed} failure → Pragma disrupted → Affects: {contagion.join(', ')}. Total exposure: {pragma_total_orig()}%.</Text>
          </View>
          {!restructured && (
            <>
              <Text style={[s.sectionLabel, { color: colors.textSoft }]}>RESTRUCTURE — REDUCE PRAGMA BELOW 40%</Text>
              {pragmaProtos.map(p => (
                <View key={p.id} style={s.numRow}>
                  <Text style={[s.numLabel, { color: colors.text }]}>{p.name.split(' ')[0]}</Text>
                  <TouchableOpacity style={s.numBtn} onPress={() => setNewAlloc(a => ({ ...a, [p.id]: Math.max(0, (a[p.id] ?? p.pct) - 5) }))}><Text style={[s.numBtnTxt, { color: colors.accent }]}>−</Text></TouchableOpacity>
                  <Text style={[s.numVal, { color: colors.text }]}>{newAlloc[p.id] ?? p.pct}%</Text>
                  <TouchableOpacity style={s.numBtn} onPress={() => setNewAlloc(a => ({ ...a, [p.id]: Math.min(30, (a[p.id] ?? p.pct) + 5) }))}><Text style={[s.numBtnTxt, { color: colors.accent }]}>+</Text></TouchableOpacity>
                </View>
              ))}
              <Text style={[{ fontSize: FontSize.xs }, { color: pragmaTotal <= 40 ? colors.green : '#f59e0b' }]}>Current Pragma total: {pragmaTotal}% {pragmaTotal <= 40 ? '✓ under limit' : '(target: ≤40%)'}</Text>
            </>
          )}
          {restructured && <View style={[s.resultBox, { borderColor: colors.green, backgroundColor: colors.green + '10' }]}><Text style={[{ fontSize: FontSize.sm, fontWeight: '900' }, { color: colors.green }]}>✓ Correlated exposure reduced below 40%</Text></View>}
        </>
      )}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!failed || contagion.length === 0} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 10 — starkzap-ops-monitor
// ══════════════════════════════════════════════════════════════════════════════

export function OpsMonitorSim({ onComplete, onSkip, colors }: SimProps) {
  const [hfThresh, setHfThresh] = useState(1.3);
  const [yieldThresh, setYieldThresh] = useState(20);
  const [days, setDays] = useState(0);
  const [alerts, setAlerts] = useState<{ id: string; msg: string; acked: boolean; action: string }[]>([]);
  const [sawAlert, setSawAlert] = useState(false);
  const [documented, setDocumented] = useState(false);

  function advance(n: number) {
    const newDays = days + n; setDays(newDays);
    const newAlerts = [...alerts];
    if (newDays >= 7 && !alerts.find(a => a.id === 'hf')) {
      if (1.25 < hfThresh) { newAlerts.push({ id: 'hf', msg: `⚠️ ETH/USDC Borrow: HF dropped to 1.25 (threshold ${hfThresh})`, acked: false, action: '' }); setSawAlert(true); }
    }
    if (newDays >= 14 && !alerts.find(a => a.id === 'yield')) {
      if (25 > yieldThresh) { newAlerts.push({ id: 'yield', msg: `📉 Ekubo LP yield dropped 25% (to 9.1% APY, threshold ${yieldThresh}%)`, acked: false, action: '' }); setSawAlert(true); }
    }
    setAlerts(newAlerts);
  }

  function ackAlert(id: string, action: string) {
    setAlerts(a => a.map(al => al.id === id ? { ...al, acked: true, action } : al));
    if (action.length > 10) setDocumented(true);
  }

  const canComplete = sawAlert && documented;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📡" title="DeFi Operations Dashboard" subtitle="Set alert thresholds. Advance time to trigger alerts. Acknowledge and document responses." colors={colors} />
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>HF alert below</Text>
          <View style={s.stepRow}>{[1.1, 1.2, 1.3, 1.5].map(v => (<TouchableOpacity key={v} style={[s.stepBtn, { borderColor: hfThresh === v ? colors.accent : colors.border }, hfThresh === v && { backgroundColor: colors.accent + '20' }]} onPress={() => setHfThresh(v)}><Text style={[{ fontSize: 9, fontWeight: '800' }, { color: hfThresh === v ? colors.accent : colors.textSoft }]}>{v}</Text></TouchableOpacity>))}</View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>Yield drop alert above</Text>
          <View style={s.stepRow}>{[10, 15, 20, 30].map(v => (<TouchableOpacity key={v} style={[s.stepBtn, { borderColor: yieldThresh === v ? colors.accent : colors.border }, yieldThresh === v && { backgroundColor: colors.accent + '20' }]} onPress={() => setYieldThresh(v)}><Text style={[{ fontSize: 9, fontWeight: '800' }, { color: yieldThresh === v ? colors.accent : colors.textSoft }]}>{v}%</Text></TouchableOpacity>))}</View>
        </View>
      </View>
      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <InfoRow icon="📅" label="Day" value={`${days}`} colors={colors} />
        <InfoRow icon="🏦" label="ETH/USDC Borrow HF" value={days >= 7 ? '1.25 ⚠️' : '1.72'} colors={colors} />
        <InfoRow icon="🏊" label="Ekubo LP yield" value={days >= 14 ? '9.1% 📉' : '12.1%'} colors={colors} />
      </View>
      <View style={s.row}>
        {[7, 14].map(n => (<TouchableOpacity key={n} style={[s.miniBtn, { borderColor: colors.accent, flex: 1 }]} onPress={() => advance(n)}><Text style={[{ fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' }, { color: colors.accent }]}>+{n} days</Text></TouchableOpacity>))}
      </View>
      {alerts.filter(a => !a.acked).map(alert => (
        <OpsAlertCard key={alert.id} alert={alert} onAck={ackAlert} colors={colors} />
      ))}
      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

function OpsAlertCard({ alert, onAck, colors }: { alert: { id: string; msg: string; acked: boolean; action: string }; onAck: (id: string, a: string) => void; colors: any }) {
  const [action, setAction] = useState('');
  return (
    <View style={[s.alertBox, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b' }]}>
      <Text style={[s.alertTxt, { color: colors.text, fontWeight: '700' }]}>{alert.msg}</Text>
      <TextInput style={[s.input, { color: colors.text, borderColor: colors.border, marginTop: Spacing.sm }]} placeholder="Document action taken…" placeholderTextColor={colors.textSoft} value={action} onChangeText={setAction} />
      <ActionBtn label="Acknowledge" onPress={() => onAck(alert.id, action)} variant="starknet" colors={colors} />
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// LAB 11 LESSON 1 — starkzap-research-checklist
// Protocol Research — 6-Question Framework
// User applies the six-question due-diligence framework to a mock Starknet
// protocol profile. Each question requires a written answer citing data
// from the profile. Completeness score must reach 80% to complete.
// ══════════════════════════════════════════════════════════════════════════════

const NOVA_PROTOCOL = [
  { key: 'Name',          val: 'Nova Lend' },
  { key: 'Type',          val: 'Lending / Borrowing (collateral-based)' },
  { key: 'TVL',           val: '$47M — running 3 months' },
  { key: '7d Volume',     val: '$8.2M borrow/repay activity' },
  { key: 'Revenue',       val: 'Utilisation-based interest only — no token emissions' },
  { key: 'Audit',         val: '1 firm, 3 months ago; 2 mediums resolved, 1 low open' },
  { key: 'Governance',    val: '3-of-5 multisig, 24-hour timelock' },
  { key: 'Moat',          val: 'Original Cairo implementation with Starknet AA integration' },
  { key: 'Oracle',        val: 'Pragma TWAP (same as Vesu and Extended)' },
  { key: 'Emissions',     val: 'None' },
];

const FRAMEWORK_QUESTIONS = [
  {
    id: 'mechanism',
    label: '1. Mechanism Understanding',
    question: 'How does this protocol generate value and how could it lose user funds?',
    hint: 'Lending mechanics: collateral → borrow → interest. Key failure paths: oracle manipulation, liquidation cascade, 100% utilisation lock.',
    minWords: 12,
  },
  {
    id: 'failure',
    label: '2. Failure Mode Inventory',
    question: 'List at least 3 specific failure modes with their likely impact.',
    hint: 'Oracle stale price, utilisation lock (no withdrawals at 100%), governance attack via 3-of-5, smart contract bug in Cairo implementation.',
    minWords: 18,
  },
  {
    id: 'audit',
    label: '3. Audit Adequacy',
    question: 'Is one firm, 3 months ago, 2 mediums resolved, 1 low open — adequate? Justify.',
    hint: 'Compare to standard: 2+ firms, recent, all findings resolved. One firm is minimum. 3 months with no new code is acceptable. Unresolved low is minor but notable.',
    minWords: 15,
  },
  {
    id: 'moat',
    label: '4. Competitive Moat',
    question: 'What prevents a competitor from forking Nova Lend and taking its users?',
    hint: 'Original Cairo + AA integration requires genuine Starknet dev expertise. Cannot be forked in hours like an EVM clone. Is the user switching cost high enough?',
    minWords: 12,
  },
  {
    id: 'revenue',
    label: '5. Revenue Sustainability',
    question: 'Is this yield model sustainable? What happens if borrow demand drops 60%?',
    hint: 'No emissions = all yield from fees. If utilisation drops, APY drops. No cliff risk — but lower TVL → lower fees → depositor exits may spiral.',
    minWords: 12,
  },
  {
    id: 'governance',
    label: '6. Governance Risk',
    question: '3-of-5 multisig + 24-hour timelock: what risk remains?',
    hint: '24-hour timelock gives depositors an exit window. But 3-of-5 means 3 compromised signers could push an instant malicious upgrade after the timelock. Who are the signers?',
    minWords: 12,
  },
];

export function ResearchChecklistSim({ onComplete, onSkip, colors }: SimProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [unanswered, setUnanswered] = useState('');

  function scoreAnswer(id: string, text: string) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const q = FRAMEWORK_QUESTIONS.find(q => q.id === id)!;
    const score = words >= q.minWords * 2.5 ? 3
      : words >= q.minWords ? 2
      : words >= 5 ? 1 : 0;
    setScores(s => ({ ...s, [id]: score }));
  }

  const totalPossible = FRAMEWORK_QUESTIONS.length * 3;
  const earned = Object.values(scores).reduce((a, b) => a + b, 0);
  const completeness = Math.round((earned / totalPossible) * 100);
  const answered = Object.values(scores).filter(s => s >= 2).length;
  const canComplete = completeness >= 80 && unanswered.trim().split(/\s+/).length >= 8;

  const scoreColor = (sc: number) =>
    sc === 3 ? colors.green : sc === 2 ? colors.accent : sc === 1 ? '#f59e0b' : '#ef4444';
  const scoreLabel = (sc: number) =>
    ['Insufficient', 'Partial', 'Good', 'Strong'][sc];

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔬"
        title="Protocol Research — 6-Question Framework"
        subtitle="Apply the framework to Nova Lend's profile. Each answer must cite specific data. Reach 80% completeness."
        colors={colors}
      />

      {/* Protocol profile */}
      <View style={[s.alertBox, { backgroundColor: colors.bgSecondary, borderColor: colors.accent + '40' }]}>
        <Text style={[s.sectionLabel, { color: colors.accent, marginBottom: Spacing.sm }]}>
          PROTOCOL PROFILE: NOVA LEND
        </Text>
        {NOVA_PROTOCOL.map(({ key, val }) => (
          <InfoRow key={key} icon="📋" label={key} value={val} colors={colors} />
        ))}
      </View>

      {/* 6 questions */}
      {FRAMEWORK_QUESTIONS.map(q => {
        const ans = answers[q.id] ?? '';
        const sc = scores[q.id] ?? null;
        const hintOn = showHint[q.id] ?? false;
        return (
          <View key={q.id} style={[s.addForm, {
            backgroundColor: colors.bgSecondary,
            borderColor: sc !== null ? scoreColor(sc) : colors.border,
          }]}>
            <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>
              {q.label}
            </Text>
            <Text style={[{ fontSize: FontSize.xs, lineHeight: 18, marginTop: 2 }, { color: colors.textSoft }]}>
              {q.question}
            </Text>

            <TouchableOpacity
              onPress={() => setShowHint(h => ({ ...h, [q.id]: !hintOn }))}
              style={{ marginTop: 4 }}>
              <Text style={[{ fontSize: FontSize.xs, fontWeight: '700' }, { color: colors.accent }]}>
                {hintOn ? '↑ Hide hint' : '💡 Show hint'}
              </Text>
            </TouchableOpacity>

            {hintOn && (
              <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '30', marginTop: 4 }]}>
                <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.accent }]}>
                  {q.hint}
                </Text>
              </View>
            )}

            <TextInput
              style={[s.input, {
                borderColor: sc !== null ? scoreColor(sc) + '80' : colors.border,
                color: colors.text,
                backgroundColor: colors.bg,
                minHeight: 72,
                textAlignVertical: 'top',
                marginTop: Spacing.sm,
              }]}
              multiline
              placeholder="Your analysis — cite specific numbers from the profile above…"
              placeholderTextColor={colors.textSoft}
              value={ans}
              onChangeText={t => {
                setAnswers(a => ({ ...a, [q.id]: t }));
                scoreAnswer(q.id, t);
              }}
            />

            {sc !== null && (
              <Text style={[{ fontSize: FontSize.xs, fontWeight: '800', marginTop: 4 }, { color: scoreColor(sc) }]}>
                {scoreLabel(sc)} depth {sc >= 2 ? '✓' : '— add more specific data'}
              </Text>
            )}
          </View>
        );
      })}

      {/* Unanswered / additional research question */}
      <View style={[s.addForm, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>
          Unanswered Question
        </Text>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>
          What important question does this profile leave unanswered? What data would you need to gather?
        </Text>
        <TextInput
          style={[s.input, {
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.bg,
            minHeight: 56,
            textAlignVertical: 'top',
            marginTop: Spacing.sm,
          }]}
          multiline
          placeholder="e.g. Who are the 5 multisig signers? Has any code been added since the audit?"
          placeholderTextColor={colors.textSoft}
          value={unanswered}
          onChangeText={setUnanswered}
        />
      </View>

      {/* Completeness score */}
      <View style={[s.resultBox, {
        borderColor: completeness >= 80 ? colors.green : '#f59e0b',
        backgroundColor: (completeness >= 80 ? colors.green : '#f59e0b') + '10',
      }]}>
        <Text style={[{ fontSize: FontSize.lg, fontWeight: '900' }, { color: completeness >= 80 ? colors.green : '#f59e0b' }]}>
          Completeness: {completeness}%
        </Text>
        <Text style={[{ fontSize: FontSize.xs, marginTop: 3 }, { color: colors.textSoft }]}>
          {answered}/{FRAMEWORK_QUESTIONS.length} questions with adequate data citations
        </Text>
        {completeness < 80 && (
          <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: '#f59e0b' }]}>
            Cite specific numbers from the profile in each answer to increase depth scores.
          </Text>
        )}
        {completeness >= 80 && unanswered.trim().split(/\s+/).length < 8 && (
          <Text style={[{ fontSize: FontSize.xs, marginTop: 4 }, { color: '#f59e0b' }]}>
            Add a specific unanswered question to finish.
          </Text>
        )}
      </View>

      <ActionBtn
        label="Continue →"
        onPress={onComplete}
        disabled={!canComplete}
        variant="starknet"
        colors={colors}
      />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 11 — starkzap-dependency-mapper
// Starknet ecosystem dependency map with contagion tracing
// ══════════════════════════════════════════════════════════════════════════════

const ECO_PROTOCOLS = [
  { id: 'ekubo',   name: 'Ekubo',   type: 'AMM',       oracle: 'pragma',    deps: [] },
  { id: 'vesu',    name: 'Vesu',    type: 'Lending',   oracle: 'pragma',    deps: ['ekubo'] },
  { id: 'avnu',    name: 'AVNU',    type: 'Aggregator',oracle: 'none',      deps: ['ekubo'] },
  { id: 'strkfarm',name: 'StrkFarm',type: 'Yield',     oracle: 'pragma',    deps: ['ekubo', 'vesu'] },
];

export function DependencyMapperSim({ onComplete, onSkip, colors }: SimProps) {
  const [mapped, setMapped] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<string | null>(null);
  const [identified, setIdentified] = useState<string | null>(null);

  function mapProtocol(id: string) {
    setMapped(m => new Set([...m, id]));
  }

  const allMapped = ECO_PROTOCOLS.every(p => mapped.has(p.id));

  // Contagion: anything that depends on the failed protocol
  function getContagion(failId: string): string[] {
    const direct = ECO_PROTOCOLS.filter(p => p.deps.includes(failId)).map(p => p.id);
    const indirect = ECO_PROTOCOLS.filter(p => p.deps.some(d => direct.includes(d)) && !direct.includes(p.id)).map(p => p.id);
    return [...direct, ...indirect].filter(id => id !== failId);
  }

  const contagion = failed ? getContagion(failed) : [];

  // Most systemic: highest number of dependents
  const systemicRanked = [...ECO_PROTOCOLS].sort((a, b) =>
    ECO_PROTOCOLS.filter(p => p.deps.includes(b.id)).length -
    ECO_PROTOCOLS.filter(p => p.deps.includes(a.id)).length
  );

  const canComplete = allMapped && failed !== null && contagion.length > 0 && identified !== null;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🗺️" title="Ecosystem Dependency Map" subtitle="Map all protocols, trigger a failure, trace contagion, identify the most systemic." colors={colors} />

      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>STEP 1: MAP PROTOCOLS (tap to map)</Text>
      {ECO_PROTOCOLS.map(p => {
        const isMapped = mapped.has(p.id);
        const isFailed = failed === p.id;
        const isContagion = contagion.includes(p.id);
        return (
          <TouchableOpacity key={p.id}
            style={[s.allocRow, {
              backgroundColor: isFailed ? '#ef444415' : isContagion ? '#f59e0b15' : isMapped ? colors.accent + '10' : colors.bgSecondary,
              borderColor: isFailed ? '#ef4444' : isContagion ? '#f59e0b' : isMapped ? colors.accent : colors.border,
            }]}
            onPress={() => mapProtocol(p.id)}>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.text }]}>{p.name} ({p.type})</Text>
              {isMapped && (
                <Text style={[{ fontSize: FontSize.xs }, { color: colors.textSoft }]}>
                  Oracle: {p.oracle || 'none'} · Depends on: {p.deps.length > 0 ? p.deps.join(', ') : 'none'}
                </Text>
              )}
            </View>
            {isFailed && <Text style={{ color: '#ef4444', fontSize: 12 }}>💀 FAILED</Text>}
            {isContagion && <Text style={{ color: '#f59e0b', fontSize: 12 }}>⚡ CONTAGION</Text>}
            {!isMapped && <Text style={[{ fontSize: 9 }, { color: colors.textSoft }]}>tap to map</Text>}
          </TouchableOpacity>
        );
      })}

      {allMapped && !failed && (
        <>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>STEP 2: TRIGGER A FAILURE</Text>
          <View style={s.row}>
            {ECO_PROTOCOLS.map(p => (
              <TouchableOpacity key={p.id} style={[s.miniBtn, { borderColor: '#ef4444', flex: 1 }]}
                onPress={() => setFailed(p.id)}>
                <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: '#ef4444' }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {failed && contagion.length > 0 && (
        <View style={[s.alertBox, { backgroundColor: '#ef444415', borderColor: '#ef4444' }]}>
          <Text style={[s.alertTitle, { color: '#ef4444' }]}>Contagion traced</Text>
          <Text style={[s.alertTxt, { color: colors.textSoft }]}>
            {failed} failure → directly impacts: {contagion.slice(0, 2).join(', ')}.
            {contagion.length > 2 ? ` Secondary: ${contagion.slice(2).join(', ')}.` : ''}
          </Text>
        </View>
      )}

      {failed && (
        <>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>STEP 3: MOST SYSTEMIC PROTOCOL?</Text>
          <View style={s.row}>
            {systemicRanked.map(p => (
              <TouchableOpacity key={p.id} style={[s.miniBtn, {
                borderColor: identified === p.id ? colors.green : colors.border,
                backgroundColor: identified === p.id ? colors.green + '20' : 'transparent',
                flex: 1,
              }]}
                onPress={() => setIdentified(p.id)}>
                <Text style={[{ fontSize: 9, fontWeight: '800', textAlign: 'center' }, { color: identified === p.id ? colors.green : colors.textSoft }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {identified && identified === systemicRanked[0].id && (
            <View style={[s.hintBox, { backgroundColor: colors.green + '10', borderColor: colors.green }]}>
              <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.green }]}>✓ Correct — {systemicRanked[0].name} has the most dependents</Text>
              <Text style={[{ fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 }, { color: colors.textSoft }]}>
                {ECO_PROTOCOLS.filter(p => p.deps.includes(systemicRanked[0].id)).length} protocols depend on it directly. Its failure creates the longest contagion chain.
              </Text>
            </View>
          )}
          {identified && identified !== systemicRanked[0].id && (
            <View style={[s.hintBox, { backgroundColor: '#f59e0b10', borderColor: '#f59e0b' }]}>
              <Text style={[{ fontSize: FontSize.xs }, { color: '#f59e0b' }]}>
                Not the most systemic. Count dependents: which protocol do others depend on most?
              </Text>
            </View>
          )}
        </>
      )}

      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LAB 11 — starkzap-report-builder
// DeFi research report builder — 4-section template with validation
// ══════════════════════════════════════════════════════════════════════════════

const REPORT_SECTIONS = [
  {
    id: 'exec',
    title: 'Executive Summary',
    prompt: 'Summarise: what is the protocol, what is your overall verdict, and what is the recommended allocation (if any)?',
    validate: (text: string) => text.length >= 60 && (text.includes('%') || text.includes('allocat') || text.includes('recommend')),
    hint: 'Must include a specific recommendation (e.g., "allocate up to 8% of portfolio").',
  },
  {
    id: 'analysis',
    title: 'Protocol Analysis',
    prompt: 'Describe: how the protocol works, who uses it, and what metrics support your understanding.',
    validate: (text: string) => text.length >= 80 && /\$[\d,]+|[\d.]+%|[\d,]+ (users|TVL|STRK|ETH)/.test(text),
    hint: 'Must reference at least one specific metric (TVL, user count, fee revenue, APY).',
  },
  {
    id: 'risk',
    title: 'Risk Assessment',
    prompt: 'Identify at least one smart contract risk, one oracle risk, and one liquidity risk.',
    validate: (text: string) => {
      const lower = text.toLowerCase();
      return text.length >= 80 &&
        (lower.includes('smart contract') || lower.includes('audit') || lower.includes('exploit')) &&
        (lower.includes('oracle') || lower.includes('pragma') || lower.includes('price feed')) &&
        (lower.includes('liquid') || lower.includes('withdraw') || lower.includes('utilisation'));
    },
    hint: 'Must mention smart contract, oracle, and liquidity risks by name.',
  },
  {
    id: 'recommendation',
    title: 'Recommendation',
    prompt: 'State your recommended position size (% of portfolio), entry conditions, and exit conditions.',
    validate: (text: string) => {
      const lower = text.toLowerCase();
      return text.length >= 60 &&
        (text.includes('%') || lower.includes('percent')) &&
        (lower.includes('exit') || lower.includes('if') || lower.includes('condition'));
    },
    hint: 'Must include specific % allocation and at least one exit condition.',
  },
];

export function ReportBuilderSim({ onComplete, onSkip, colors }: SimProps) {
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState('exec');

  function setText(id: string, text: string) {
    setTexts(t => ({ ...t, [id]: text }));
  }

  function validate(id: string) {
    const section = REPORT_SECTIONS.find(s => s.id === id)!;
    const passes = section.validate(texts[id] || '');
    setValidated(v => ({ ...v, [id]: passes }));
  }

  const passedCount = Object.values(validated).filter(Boolean).length;
  const allSectionsDone = REPORT_SECTIONS.every(s => (texts[s.id] || '').length >= 60);
  const hasRec = texts['recommendation'] && /\d+%/.test(texts['recommendation']) &&
    texts['recommendation'].toLowerCase().includes('exit');
  const hasRisk = validated['risk'];
  const canComplete = allSectionsDone && passedCount >= 3 && hasRec;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📄" title="Research Report Builder" subtitle="Complete all four sections. Each must pass a data-backing validation check." colors={colors} />

      <View style={[s.rateBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[{ fontSize: FontSize.xs, fontWeight: '800' }, { color: colors.accent }]}>Protocol: Vesu Lending</Text>
        <Text style={[{ fontSize: FontSize.xs, lineHeight: 17, marginTop: 3 }, { color: colors.textSoft }]}>
          TVL: $180M · 4,200 users · $280K/mo fees · Audited Apr 2023 (Trail of Bits, 0 critical) · Oracle: Pragma 3-source + TWAP · Util: 72% · Age: 14mo · No exploits
        </Text>
      </View>

      {/* Section tabs */}
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        {REPORT_SECTIONS.map(s2 => (
          <TouchableOpacity key={s2.id} style={[s.miniBtn, {
            borderColor: activeSection === s2.id ? colors.accent : validated[s2.id] ? colors.green : colors.border,
            backgroundColor: activeSection === s2.id ? colors.accent + '15' : validated[s2.id] ? colors.green + '10' : 'transparent',
          }]}
            onPress={() => setActiveSection(s2.id)}>
            <Text style={[{ fontSize: 9, fontWeight: '800' }, { color: activeSection === s2.id ? colors.accent : validated[s2.id] ? colors.green : colors.textSoft }]}>
              {validated[s2.id] ? '✓ ' : ''}{s2.title.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active section */}
      {REPORT_SECTIONS.filter(s2 => s2.id === activeSection).map(s2 => (
        <View key={s2.id} style={[s.dimCard, { backgroundColor: colors.bgSecondary, borderColor: validated[s2.id] ? colors.green : colors.border }]}>
          <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: colors.text }]}>{s2.title}</Text>
          <Text style={[{ fontSize: FontSize.xs, lineHeight: 16 }, { color: colors.textSoft }]}>{s2.prompt}</Text>
          <Text style={[{ fontSize: FontSize.xs, fontStyle: 'italic' }, { color: colors.accent }]}>Requirement: {s2.hint}</Text>
          <TextInput
            style={[s.input, { color: colors.text, borderColor: validated[s2.id] ? colors.green : colors.border, minHeight: 80 }]}
            placeholder="Write your section here…"
            placeholderTextColor={colors.textSoft}
            value={texts[s2.id] || ''}
            onChangeText={t => setText(s2.id, t)}
            multiline
          />
          {validated[s2.id] === false && (
            <Text style={[{ fontSize: FontSize.xs }, { color: '#ef4444' }]}>✗ Validation failed — {s2.hint}</Text>
          )}
          <View style={s.row}>
            <ActionBtn label="Validate Section" onPress={() => validate(s2.id)} variant="starknet" colors={colors} />
          </View>
        </View>
      ))}

      <View style={[s.resultBox, { borderColor: passedCount >= 3 ? colors.green : '#f59e0b',
        backgroundColor: (passedCount >= 3 ? colors.green : '#f59e0b') + '10' }]}>
        <Text style={[{ fontSize: FontSize.sm, fontWeight: '800' }, { color: passedCount >= 3 ? colors.green : '#f59e0b' }]}>
          {passedCount}/4 sections validated
        </Text>
        {!hasRec && allSectionsDone && (
          <Text style={[{ fontSize: FontSize.xs, marginTop: 3 }, { color: '#f59e0b' }]}>
            Recommendation section needs a specific % allocation and exit condition.
          </Text>
        )}
      </View>

      <ActionBtn label="Continue →" onPress={onComplete} disabled={!canComplete} variant="starknet" colors={colors} />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─── Shared styles ──────────────────────────────────────────────────────────
const _s7 = StyleSheet.create({
  addBtn:        { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderStyle: 'dashed' },
  addBtn2:      { borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginLeft: Spacing.sm },
  addBtnTxt:     { fontSize: FontSize.sm, fontWeight: '800' },
  addForm:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  adjBtn:       { padding: Spacing.sm, borderRadius: Radius.md },
  alertBox:     { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  alertTitle:   { fontSize: FontSize.sm, fontWeight: '900' },
  alertTxt:     { fontSize: FontSize.sm, lineHeight: 20 },
  allocRow:     { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  autoRisk:      { fontSize: FontSize.xs, fontWeight: '800' },
  badge:         { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, fontSize: FontSize.xs, fontWeight: '800', overflow: 'hidden' },
  balanceBtn:    { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  balanceBtnTxt: { fontSize: FontSize.xs, fontWeight: '700' },
  bigNum: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  bridgeCard:    { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  bridgeCardSub: { fontSize: FontSize.xs, lineHeight: 18 },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chooseBtn:      { borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm },
  dimCard:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, gap: Spacing.sm },
  divider:      { width: 1, alignSelf: 'stretch' },
  fastFwdBtn:    { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.md },
  fastFwdTxt:    { fontSize: FontSize.xs, fontWeight: '700', textAlign: 'center' },
  formula: {
    fontSize: FontSize.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  hfBox:        { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  hintBox:      { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1 },
  impactBar:      { height: 8, borderRadius: 4, overflow: 'hidden' },
  impactFill:     { height: '100%', borderRadius: 4, minWidth: 4 },
  input:        { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, fontSize: FontSize.sm },
  insight: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: Spacing.md,
    gap: 6,
  },
  insightText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  insightTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  kinkBar:      { height: 16, borderRadius: 8, overflow: 'hidden', position: 'relative', borderWidth: 1 },
  kinkFill:     { position: 'absolute', left: 0, height: '100%', borderRadius: 8 },
  kinkLabel:    { position: 'absolute', top: -16, fontSize: 9, fontWeight: '800', color: '#6366f1', left: 4 },
  kinkMark:     { position: 'absolute', top: 0, width: 2, height: '100%', backgroundColor: '#6366f1' },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  leverageBtn:  { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: 4, alignItems: 'center', minWidth: 52 },
  leverageTxt:   { fontSize: FontSize.xs, fontWeight: '800' },
  linkTxt:       { fontSize: FontSize.sm, fontWeight: '700' },
  loopBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  miniBtn:      { borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center' },
  miniRow:      { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  modeBtn:       { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  modeBtnTxt:    { fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center', lineHeight: 16 },
  numBtn:        { paddingHorizontal: Spacing.md, paddingVertical: 4 },
  numBtnTxt:     { fontSize: FontSize.lg, fontWeight: '800', lineHeight: 20 },
  numLabel:      { flex: 1, fontSize: FontSize.xs },
  numRow:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm },
  numVal:        { fontSize: FontSize.sm, fontWeight: '800', minWidth: 80, textAlign: 'center' },
  phaseBox:      { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  phaseDesc:     { fontSize: FontSize.xs, lineHeight: 16 },
  phaseTxt:      { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.6 },
  poolBox:        { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  posName:      { fontSize: FontSize.sm, fontWeight: '900' },
  posRow:       { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  posSub:       { fontSize: FontSize.xs, lineHeight: 16, marginTop: 2 },
  presetBtn:     { flex: 1, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  presetBtnTxt:  { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  priceBar:       { height: 32, borderRadius: 8, backgroundColor: '#e5e7eb', position: 'relative', marginVertical: 4 },
  priceBarContainer: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  priceChip:    { borderRadius: 6, padding: 4, borderWidth: 1, alignItems: 'center', minWidth: 36 },
  priceMarker:    { position: 'absolute', width: 3, height: '100%', borderRadius: 2 },
  priceRow:       { borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  protocolCard: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  rangeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeCurrent: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 12,
    borderRadius: 2,
    marginLeft: -2,
  },
  rangeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  rangeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    minWidth: 40,
  },
  rangeTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  rateBox:      { borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, gap: Spacing.xs },
  rateLabel:    { fontSize: FontSize.xs, fontWeight: '600' },
  rateValue:    { fontSize: FontSize.xl, fontWeight: '900' },
  rebalBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  resultBox:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  resultLabel:    { fontSize: FontSize.xs, fontWeight: '600' },
  resultValue:    { fontSize: FontSize.lg, fontWeight: '900', marginTop: 2 },
  resultsBox:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, gap: Spacing.xs },
  revealBtn:    { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: 4 },
  riskBadge:    { fontSize: FontSize.xs, fontWeight: '900' },
  row:          { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  scenarioBtn:   { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  scoreBtn:     { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: 4, alignItems: 'center' },
  scoreDot:       { width: 8, height: 8, borderRadius: 4, margin: 1 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  sliderStep:     { borderRadius: Radius.sm, padding: 6, borderWidth: 1, alignItems: 'center', minWidth: 44 },
  sliderTrack:    { borderRadius: Radius.md, padding: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statBox:      { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, alignItems: 'center' },
  statLabel:    { fontSize: 9, fontWeight: '600', marginBottom: 2 },
  statVal:      { fontSize: FontSize.sm, fontWeight: '900' },
  statValue:     { fontSize: FontSize.md, fontWeight: '900' },
  statusBox:     { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  statusTxt:     { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  stepBtn: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  sub: {
    fontSize: FontSize.sm,
  },
  tensionRow:   { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, marginBottom: 4, gap: Spacing.sm },
  toggleBtn:     { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  toggleChip:    { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  toggleChipTxt: { fontSize: 10, fontWeight: '700' },
  toggleTxt:     { fontSize: FontSize.xs, fontWeight: '800' },
  validatorCard:  { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  verdictBox:    { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  verdictTxt:    { fontSize: FontSize.sm, fontWeight: '900', textAlign: 'center' },
});

