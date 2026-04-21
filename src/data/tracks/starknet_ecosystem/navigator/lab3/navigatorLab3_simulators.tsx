/**
 * Labs 1–3 Simulators — React Native / Starkzap Pattern
 * Starknet DeFi Navigator · Junior Labs 1–3
 *
 * New simulator types:
 *   starkzap-pool-depth        — Lab1 L3: Pool depth & price impact visualizer
 *   starkzap-protocol-reader   — Lab1 L7: Protocol metrics dashboard reader
 *   starkzap-amm-pool          — Lab2 L1: Live x×y=k AMM pool simulator
 *   starkzap-range-selector    — Lab2 L2: Concentrated liquidity range builder
 *   starkzap-validator-picker  — Lab3 L2: Validator selection scorecard
 *   starkzap-stake-exit        — Lab3 L4: Time-accelerated 21-day exit sim
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../lib/starkzap';
import { Spacing, Radius, FontSize, useTheme } from '../../theme';
import {
  SimHeader, ActionBtn, TxResult, InfoRow, DemoBadge, simulateDelay,
} from './StarkzapSimulatorCard';

interface SimProps { onComplete: () => void; onSkip: () => void; colors: any; }


// ══════════════════════════════════════════════════════════════════════════════
// LAB 1 LESSON 3 — starkzap-pool-depth
// Pool Depth & Price Impact Visualizer
// User drags a trade size slider. Pool size selector shows how depth changes
// price impact in real-time — muscle memory for "check before you swap."
// ══════════════════════════════════════════════════════════════════════════════

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
  const { starknetWallet } = useAuth();
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
const s = StyleSheet.create({
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
