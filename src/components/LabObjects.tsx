/**
 * Sifter Skill_Up — Lab Objects
 * ─────────────────────────────────────────────────────────────
 *
 * Animated visual objects rendered above the SimulatorCard.
 * Each simulator type gets a distinct living illustration —
 * DeFi liquidity pool, trading terminal, wallet interface,
 * yield farming chart, options board, etc.
 *
 * These are living simulator illustrations — always in motion,
 * contextually relevant to what the student is about to do.
 *
 * HOW TO USE IN LessonScreen.tsx (2-line integration)
 * ─────────────────────────────────────────────────────────────
 *
 * 1. Import at top of LessonScreen.tsx:
 *      import LabObject from '../components/LabObjects';
 *
 * 2. In the simulator render block (around line 614):
 *
 *   BEFORE:
 *      {q?.type==='simulator' && <SimulatorCard ... />}
 *
 *   AFTER:
 *      {q?.type==='simulator' && (
 *        <>
 *          <LabObject simulatorType={q.simulatorType ?? ''} />
 *          <SimulatorCard ... />
 *        </>
 *      )}
 *
 * ─────────────────────────────────────────────────────────────
 *
 * SUPPORTED SIMULATOR TYPES (from StarkzapSimulatorCard + SimulatorCard):
 *
 *  Starknet Island (starkzap-*):
 *    starkzap-wallet   → Animated wallet address + balance glow
 *    starkzap-gasless  → Fee-free transaction flow (zero gas badge)
 *    starkzap-swap     → DEX swap pool with token pair + price impact
 *    starkzap-stake    → Staking pool with yield curve + validator dots
 *    starkzap-lend     → Lending market with supply/borrow bars
 *    starkzap-dca      → DCA order calendar with price averaging
 *    starkzap-build    → Code terminal with integration scaffold
 *    starkzap-boss     → Multi-action command center
 *
 *  Generic (from SimulatorCard.tsx):
 *    spot-trading      → Live order book + bid/ask spread
 *    futures-trading   → Perpetual funding rate + liquidation level
 *    options-trading   → Options chain / vol surface
 *    onchain-analysis  → Wallet graph + tx flow diagram
 *    memecoin-trading  → Bonding curve + price acceleration
 *    defi-research     → Protocol TVL chart + yield comparison
 *    quant-backtest    → Sharpe/drawdown chart + backtest run
 *    algo-strategy     → Strategy block flow + execution graph
 *    supply-chain      → Logistics route map + inventory bars
 *    risk-assessment   → VaR cone + stress test sliders
 *
 *  Fallback for any unrecognised type → spinning field orb
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  Dimensions,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';

const { width: SW } = Dimensions.get('window');

// ─── Animation helpers ──────────────────────────────────────────────────────

function useFloat(range = 7, duration = 2200, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: -range, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue:  range, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, [delay, duration, range, v]);
  return v;
}

function usePulse(min = 0.85, max = 1.12, duration = 1200, delay = 0) {
  const v = useRef(new Animated.Value(min)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: max, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(v, { toValue: min, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, [delay, duration, max, min, v]);
  return v;
}

function useSpin(duration = 8000, reverse = false) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })).start();
  }, [duration, v]);
  return v.interpolate({ inputRange: [0, 1], outputRange: reverse ? ['0deg', '-360deg'] : ['0deg', '360deg'] });
}

function useTravel(from: number, to: number, duration = 2400, delay = 0) {
  const v = useRef(new Animated.Value(from)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: to,   duration, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(v, { toValue: from, duration: 0, useNativeDriver: true }),
    ])).start();
  }, [delay, duration, from, to, v]);
  return v;
}

function useBarFill(target: number, duration = 1400, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: target, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.delay(800),
      Animated.timing(v, { toValue: 0, duration: 400, useNativeDriver: false }),
    ])).start();
  }, [delay, duration, target, v]);
  return v;
}

// ─── Wrapper ────────────────────────────────────────────────────────────────

function LabObjectFrame({ children, height = 140 }: { children: React.ReactNode; height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.frame, {
      height,
      backgroundColor: colors.bgSecondary,
      borderColor: colors.border,
    }]}>
      {children}
    </View>
  );
}

// ─── starkzap-wallet ─────────────────────────────────────────────────────────
// Animated wallet address + STRK balance pulsing

function WalletObject({ color }: { color: string }) {
  const float1 = useFloat(5, 2000, 0);
  const float2 = useFloat(4, 2200, 400);
  const pulse  = usePulse(0.95, 1.08, 1400, 0);
  const travel = useTravel(-SW * 0.3, SW * 0.3, 3200, 0);

  return (
    <LabObjectFrame>
      {/* Data packet flowing across */}
      <Animated.View style={[styles.dataPacket, { backgroundColor: color, transform: [{ translateX: travel }] }]} />

      {/* Main wallet card */}
      <Animated.View style={[styles.walletCard, {
        backgroundColor: color + '15',
        borderColor: color + '50',
        transform: [{ scale: pulse }, { translateY: float1 }],
      }]}>
        <Text style={[styles.walletLabel, { color: color + '99' }]}>STARKNET ACCOUNT</Text>
        <Text style={[styles.walletAddress, { color }]}>0x04f3...8e2a</Text>
        <Text style={[styles.walletBalance, { color }]}>12.48 STRK</Text>
        <View style={[styles.walletGasBadge, { backgroundColor: color + '25' }]}>
          <Text style={[styles.walletGasText, { color }]}>⚡ Account Abstraction</Text>
        </View>
      </Animated.View>

      {/* Floating STRK coin */}
      <Animated.View style={[styles.strkCoin, {
        backgroundColor: color,
        transform: [{ translateY: float2 }],
      }]}>
        <Text style={styles.strkCoinText}>⚡</Text>
      </Animated.View>
    </LabObjectFrame>
  );
}

// ─── starkzap-gasless ────────────────────────────────────────────────────────
// Zero-fee transaction with sponsored badge

function GaslessObject({ color }: { color: string }) {
  const float1 = useFloat(6, 2000);
  const float2 = useFloat(4, 2400, 500);
  const travel1 = useTravel(-60, 60, 2000, 0);
  const travel2 = useTravel(60, -60, 2400, 600);

  return (
    <LabObjectFrame>
      {/* Arrows showing tx flow */}
      <Animated.View style={[styles.txArrow, { transform: [{ translateX: travel1 }] }]}>
        <Text style={{ fontSize: 18, color }}>→</Text>
      </Animated.View>
      <Animated.View style={[styles.txArrow, { top: 80, transform: [{ translateX: travel2 }] }]}>
        <Text style={{ fontSize: 14, color: color + '80' }}>→</Text>
      </Animated.View>

      {/* Center sponsored badge */}
      <Animated.View style={[styles.sponsoredBadge, {
        backgroundColor: color,
        transform: [{ scale: float1.interpolate({ inputRange: [-6, 6], outputRange: [0.95, 1.08] }) }],
      }]}>
        <Text style={styles.sponsoredText}>FREE GAS</Text>
        <Text style={styles.sponsoredSub}>Sponsored by dApp</Text>
      </Animated.View>

      {/* Zero fee indicator */}
      <Animated.View style={[styles.zeroBadge, {
        borderColor: color + '50',
        transform: [{ translateY: float2 }],
      }]}>
        <Text style={[styles.zeroText, { color }]}>Gas: $0.000</Text>
      </Animated.View>
    </LabObjectFrame>
  );
}

// ─── starkzap-swap ───────────────────────────────────────────────────────────
// DEX swap pool with token pair + animated price curve

function SwapObject({ color }: { color: string }) {
  const float1 = useFloat(5, 2000);
  const float2 = useFloat(4, 1900, 300);
  const priceBar = useBarFill(0.68, 2000, 0);

  return (
    <LabObjectFrame height={150}>
      {/* Token A */}
      <Animated.View style={[styles.tokenChip, {
        backgroundColor: '#F9731620',
        borderColor: '#F97316',
        left: 16,
        transform: [{ translateY: float1 }],
      }]}>
        <Text style={styles.tokenEmoji}>₿</Text>
        <Text style={[styles.tokenLabel, { color: '#F97316' }]}>STRK</Text>
      </Animated.View>

      {/* Swap arrow */}
      <View style={styles.swapArrow}>
        <View style={[styles.swapArrowLine, { backgroundColor: color }]} />
        <Text style={[styles.swapArrowHead, { color }]}>⇄</Text>
      </View>

      {/* Token B */}
      <Animated.View style={[styles.tokenChip, {
        backgroundColor: '#10B98120',
        borderColor: '#10B981',
        right: 16,
        transform: [{ translateY: float2 }],
      }]}>
        <Text style={styles.tokenEmoji}>$</Text>
        <Text style={[styles.tokenLabel, { color: '#10B981' }]}>USDC</Text>
      </Animated.View>

      {/* Price impact bar */}
      <View style={styles.priceImpactRow}>
        <Text style={[styles.priceImpactLabel, { color: color + '80' }]}>Price Impact</Text>
        <View style={styles.priceImpactTrack}>
          <Animated.View style={[styles.priceImpactFill, {
            width: priceBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          }]} />
        </View>
        <Text style={[styles.priceImpactValue, { color }]}>0.12%</Text>
      </View>
    </LabObjectFrame>
  );
}

// ─── starkzap-stake ──────────────────────────────────────────────────────────
// Staking pool with APY yield curve + validator dots

function StakeObject({ color }: { color: string }) {
  const float1 = useFloat(5, 2000);
  const pulse  = usePulse(0.9, 1.1, 1600, 0);
  const spin   = useSpin(6000);
  const apyBar = useBarFill(0.72, 1800, 200);

  const validators = [
    { x: 20, y: 40 }, { x: 60, y: 60 }, { x: 100, y: 35 },
    { x: 140, y: 55 }, { x: 180, y: 40 },
  ];

  return (
    <LabObjectFrame height={155}>
      {/* Staking ring */}
      <Animated.View style={[styles.stakingRing, {
        borderColor: color + '60',
        transform: [{ rotate: spin }],
      }]}>
        <View style={[styles.stakingRingDot, { backgroundColor: color }]} />
      </Animated.View>

      {/* Center APY badge */}
      <Animated.View style={[styles.apyBadge, {
        backgroundColor: color,
        transform: [{ scale: pulse }],
      }]}>
        <Text style={styles.apyValue}>8.4%</Text>
        <Text style={styles.apyLabel}>APY</Text>
      </Animated.View>

      {/* Validator dots */}
      <View style={styles.validatorRow}>
        {validators.map((v, i) => (
          <Animated.View key={i} style={[styles.validatorDot, {
            backgroundColor: i === 2 ? color : color + '50',
            transform: [{ translateY: float1.interpolate({
              inputRange: [-5, 5],
              outputRange: [-5 + i * 2, 5 - i * 2],
            }) }],
          }]} />
        ))}
      </View>

      {/* APY bar */}
      <View style={styles.apyBarRow}>
        <Text style={[styles.apyBarLabel, { color: color + '80' }]}>Staked</Text>
        <View style={styles.apyBarTrack}>
          <Animated.View style={[styles.apyBarFill, {
            width: apyBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          }]} />
        </View>
        <Text style={[styles.apyBarValue, { color }]}>1,200 STRK</Text>
      </View>
    </LabObjectFrame>
  );
}

// ─── starkzap-lend ───────────────────────────────────────────────────────────
// Lending market with supply/borrow utilisation bars

function LendObject({ color }: { color: string }) {
  const float1  = useFloat(4, 2000);
  const supplyBar = useBarFill(0.78, 2000, 0);
  const borrowBar = useBarFill(0.52, 2000, 400);

  return (
    <LabObjectFrame height={160}>
      {/* Protocol icon */}
      <Animated.View style={[styles.protocolIcon, {
        backgroundColor: color + '20',
        borderColor: color + '50',
        transform: [{ translateY: float1 }],
      }]}>
        <Text style={{ fontSize: 28 }}>🏦</Text>
        <Text style={[styles.protocolName, { color }]}>Vesu</Text>
      </Animated.View>

      {/* Supply utilisation */}
      <View style={styles.lendMetricRow}>
        <Text style={[styles.lendMetricLabel, { color: color + '80' }]}>Supply APY</Text>
        <View style={styles.lendTrack}>
          <Animated.View style={[styles.lendFill, {
            width: supplyBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: '#10B981',
          }]} />
        </View>
        <Text style={[styles.lendMetricValue, { color: '#10B981' }]}>4.2%</Text>
      </View>

      {/* Borrow rate */}
      <View style={[styles.lendMetricRow, { marginTop: 8 }]}>
        <Text style={[styles.lendMetricLabel, { color: color + '80' }]}>Borrow APY</Text>
        <View style={styles.lendTrack}>
          <Animated.View style={[styles.lendFill, {
            width: borrowBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: '#EF4444',
          }]} />
        </View>
        <Text style={[styles.lendMetricValue, { color: '#EF4444' }]}>6.8%</Text>
      </View>

      {/* Utilisation chip */}
      <View style={[styles.utilisationChip, { borderColor: color + '40' }]}>
        <Text style={[styles.utilisationText, { color }]}>52% utilised</Text>
      </View>
    </LabObjectFrame>
  );
}

// ─── starkzap-dca ────────────────────────────────────────────────────────────
// DCA order calendar with price averaging line

function DCAObject({ color }: { color: string }) {
  const float1 = useFloat(5, 2000);
  const pulse  = usePulse(0.9, 1.1, 1800, 0);
  const travel = useTravel(-SW * 0.25, SW * 0.25, 3000, 0);

  const bars = [0.5, 0.7, 0.45, 0.8, 0.6, 0.9, 0.55];

  return (
    <LabObjectFrame height={155}>
      {/* Animated averaging line */}
      <Animated.View style={[styles.dcaAvgLine, {
        backgroundColor: color,
        transform: [{ translateX: travel }],
      }]}>
        <View style={[styles.dcaAvgDot, { backgroundColor: color }]} />
      </Animated.View>

      {/* Weekly buy bars */}
      <View style={styles.dcaBarsRow}>
        {bars.map((h, i) => (
          <Animated.View key={i} style={[styles.dcaBar, {
            height: `${h * 60}%`,
            backgroundColor: i === bars.length - 1 ? color : color + '55',
            transform: [{ translateY: float1.interpolate({
              inputRange: [-5, 5],
              outputRange: [-3 + i, 3 - i],
            }) }],
          }]} />
        ))}
      </View>

      {/* DCA chip */}
      <Animated.View style={[styles.dcaChip, {
        backgroundColor: color,
        transform: [{ scale: pulse }],
      }]}>
        <Text style={styles.dcaChipText}>⟳ Weekly DCA</Text>
        <Text style={styles.dcaChipSub}>STRK → USDC</Text>
      </Animated.View>
    </LabObjectFrame>
  );
}

// ─── starkzap-build ──────────────────────────────────────────────────────────
// Code terminal with integration scaffold

function BuildObject({ color }: { color: string }) {
  const cursor = usePulse(0, 1, 600, 0);

  const lines = [
    { text: 'import { StarkSigner } from "starkzap-native";',  c: '#C792EA' },
    { text: 'const sdk = await StarkSigner.connect();',         c: '#82AAFF' },
    { text: 'const tx = await sdk.swap({',                     c: color },
    { text: '  from: "STRK",  to: "USDC",',                   c: '#EEFFA9' },
    { text: '  amount: "10",',                                 c: '#EEFFA9' },
    { text: '});',                                              c: color },
    { text: '✓ tx.hash: 0x04f3...8e2a',                       c: '#10B981' },
  ];

  return (
    <LabObjectFrame height={175}>
      <View style={[styles.terminal, { borderColor: color + '40' }]}>
        <View style={styles.terminalDots}>
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <View key={c} style={[styles.terminalDot, { backgroundColor: c }]} />
          ))}
        </View>
        {lines.map((l, i) => (
          <Text key={i} style={[styles.terminalLine, { color: l.c }]}>
            {l.text}
            {i === lines.length - 2 && (
              <Animated.Text style={[styles.terminalCursor, { opacity: cursor }]}>▮</Animated.Text>
            )}
          </Text>
        ))}
      </View>
    </LabObjectFrame>
  );
}

// ─── starkzap-boss ───────────────────────────────────────────────────────────
// Multi-action command center

function BossObject({ color }: { color: string }) {
  const pulse1 = usePulse(0.9, 1.1, 1400, 0);
  const pulse2 = usePulse(0.85, 1.15, 1200, 300);
  const pulse3 = usePulse(0.9, 1.1, 1600, 600);
  const spin   = useSpin(5000);

  const actions = [
    { e: '🔑', l: 'Wallet',  pulse: pulse1 },
    { e: '⇄',  l: 'Swap',   pulse: pulse2 },
    { e: '📈', l: 'Stake',  pulse: pulse3 },
    { e: '🏦', l: 'Lend',   pulse: pulse1 },
  ];

  return (
    <LabObjectFrame height={155}>
      {/* Outer orbit */}
      <Animated.View style={[styles.bossOrbit, { borderColor: color + '40', transform: [{ rotate: spin }] }]} />

      {/* Action nodes */}
      {actions.map((a, i) => {
        const ang = (i / actions.length) * 2 * Math.PI - Math.PI / 2;
        const r   = 60;
        return (
          <Animated.View key={i} style={[styles.bossActionNode, {
            backgroundColor: color + '20',
            borderColor: color + '60',
            left: 90 + r * Math.cos(ang) - 20,
            top:  65 + r * Math.sin(ang) - 20,
            transform: [{ scale: a.pulse }],
          }]}>
            <Text style={{ fontSize: 16 }}>{a.e}</Text>
            <Text style={[styles.bossActionLabel, { color }]}>{a.l}</Text>
          </Animated.View>
        );
      })}

      {/* Center */}
      <Animated.View style={[styles.bossCenterNode, {
        backgroundColor: color,
        transform: [{ scale: pulse2 }],
      }]}>
        <Text style={{ fontSize: 20 }}>⚡</Text>
      </Animated.View>
    </LabObjectFrame>
  );
}

// ─── spot-trading / generic trading terminal ─────────────────────────────────
// Live order book with bid/ask spread

function TradingTerminalObject({ color }: { color: string }) {
  const bids = [0.85, 0.72, 0.58, 0.44, 0.30];
  const asks = [0.80, 0.65, 0.50, 0.38, 0.22];
  const float1 = useFloat(3, 2000);

  return (
    <LabObjectFrame height={160}>
      {/* Price chip */}
      <Animated.View style={[styles.priceChip, {
        backgroundColor: '#10B981',
        transform: [{ translateY: float1 }],
      }]}>
        <Text style={styles.priceChipText}>$0.3847</Text>
        <Text style={styles.priceChipChange}>▲ +2.14%</Text>
      </Animated.View>

      {/* Order book */}
      <View style={styles.orderBook}>
        {/* Asks (sells) */}
        <View style={styles.orderBookSide}>
          {asks.map((w, i) => (
            <View key={i} style={styles.orderRow}>
              <View style={[styles.orderBar, { width: `${w * 100}%`, backgroundColor: '#EF444430' }]} />
              <Text style={[styles.orderPrice, { color: '#EF4444' }]}>0.384{5 + i}</Text>
            </View>
          ))}
        </View>
        {/* Spread */}
        <View style={[styles.spreadLine, { borderColor: color + '40' }]} />
        {/* Bids (buys) */}
        <View style={styles.orderBookSide}>
          {bids.map((w, i) => (
            <View key={i} style={styles.orderRow}>
              <View style={[styles.orderBar, { width: `${w * 100}%`, backgroundColor: '#10B98130' }]} />
              <Text style={[styles.orderPrice, { color: '#10B981' }]}>0.384{4 - i}</Text>
            </View>
          ))}
        </View>
      </View>
    </LabObjectFrame>
  );
}

// ─── defi-research / TVL chart ───────────────────────────────────────────────

function DeFiResearchObject({ color }: { color: string }) {
  const float1 = useFloat(4, 2000);
  const protocols = [
    { name: 'Uniswap', tvl: 0.9,  c: '#FF6B8A' },
    { name: 'Aave',    tvl: 0.75, c: '#B6509E' },
    { name: 'Curve',   tvl: 0.6,  c: '#3B82F6' },
    { name: 'Maker',   tvl: 0.5,  c: '#F59E0B' },
  ];

  return (
    <LabObjectFrame height={155}>
      {/* TVL header */}
      <Animated.View style={[styles.tvlHeader, { transform: [{ translateY: float1 }] }]}>
        <Text style={[styles.tvlLabel, { color: color + '80' }]}>Total Value Locked</Text>
        <Text style={[styles.tvlValue, { color }]}>$48.2B</Text>
      </Animated.View>

      {/* Protocol bars */}
      <View style={styles.protocolBars}>
        {protocols.map((p, i) => (
          <View key={i} style={styles.protocolBarRow}>
            <Text style={styles.protocolBarName}>{p.name}</Text>
            <View style={styles.protocolBarTrack}>
              <View style={[styles.protocolBarFill, { width: `${p.tvl * 100}%`, backgroundColor: p.c }]} />
            </View>
          </View>
        ))}
      </View>
    </LabObjectFrame>
  );
}

// ─── quant-backtest / Sharpe chart ───────────────────────────────────────────

function QuantBacktestObject({ color }: { color: string }) {
  const float1 = useFloat(3, 2000);
  const points = [0, 0.2, 0.15, 0.35, 0.3, 0.5, 0.45, 0.65, 0.6, 0.8, 0.75, 0.9];

  return (
    <LabObjectFrame height={155}>
      {/* Sharpe badge */}
      <Animated.View style={[styles.sharpeBadge, {
        backgroundColor: color,
        transform: [{ translateY: float1 }],
      }]}>
        <Text style={styles.sharpeLabel}>Sharpe</Text>
        <Text style={styles.sharpeValue}>2.81</Text>
      </Animated.View>

      {/* Equity curve */}
      <View style={styles.equityCurve}>
        {points.map((p, i) => (
          <View key={i} style={[styles.equityPoint, {
            left: `${(i / (points.length - 1)) * 100}%`,
            bottom: `${p * 80}%`,
            backgroundColor: i === points.length - 1 ? color : color + '60',
          }]} />
        ))}
        {/* Connecting line approximation */}
        {points.slice(1).map((p, i) => (
          <View key={i} style={[styles.equityLine, {
            left: `${(i / (points.length - 1)) * 100}%`,
            bottom: `${(points[i] + 0.02) * 80}%`,
            backgroundColor: color + '40',
            width: `${100 / (points.length - 1)}%`,
          }]} />
        ))}
      </View>

      {/* Drawdown */}
      <View style={styles.drawdownRow}>
        <Text style={[styles.drawdownLabel, { color: color + '80' }]}>Max DD</Text>
        <Text style={[styles.drawdownValue, { color: '#EF4444' }]}>-5.1%</Text>
        <Text style={[styles.drawdownLabel, { color: color + '80', marginLeft: 12 }]}>CAGR</Text>
        <Text style={[styles.drawdownValue, { color: '#10B981' }]}>+12%</Text>
      </View>
    </LabObjectFrame>
  );
}

// ─── onchain-analysis / wallet graph ─────────────────────────────────────────

function OnchainObject({ color }: { color: string }) {
  const float1 = useFloat(5, 2000);
  const float2 = useFloat(4, 2200, 400);
  const travel = useTravel(-40, 40, 2000, 0);

  const nodes = [
    { x: 20,  y: 40,  size: 16 },
    { x: 80,  y: 20,  size: 12 },
    { x: 140, y: 50,  size: 20 },
    { x: 80,  y: 80,  size: 14 },
    { x: 40,  y: 90,  size: 10 },
    { x: 160, y: 85,  size: 12 },
  ];

  return (
    <LabObjectFrame>
      {/* Wallet nodes */}
      {nodes.map((n, i) => (
        <Animated.View key={i} style={[styles.walletNode, {
          width: n.size, height: n.size, borderRadius: n.size / 2,
          backgroundColor: i === 2 ? color : color + '60',
          left: n.x, top: n.y,
          transform: [{ translateY: i % 2 === 0 ? float1 : float2 }],
        }]} />
      ))}

      {/* Flowing tx */}
      <Animated.View style={[styles.txFlow, {
        backgroundColor: color,
        transform: [{ translateX: travel }],
      }]} />

      {/* Whale label */}
      <View style={[styles.whaleLabel, { backgroundColor: color + '20', borderColor: color + '40' }]}>
        <Text style={[styles.whaleLabelText, { color }]}>🐋 Smart Money</Text>
      </View>
    </LabObjectFrame>
  );
}

// ─── supply-chain / logistics map ────────────────────────────────────────────

function SupplyChainObject({ color }: { color: string }) {
  const pkg1 = useTravel(-70, 70, 2400, 0);
  const pkg2 = useTravel(70, -70, 2800, 600);
  const float1 = useFloat(4, 2000);

  const hubs = [
    { x: 18,  y: 30,  e: '🏭' },
    { x: 150, y: 20,  e: '✈️' },
    { x: 110, y: 80,  e: '🚢' },
    { x: 20,  y: 85,  e: '🏪' },
  ];

  return (
    <LabObjectFrame>
      {/* Route lines */}
      <View style={[styles.routeLine, { top: 40, left: 40, width: 120, transform: [{ rotate: '-5deg' }], backgroundColor: color + '30' }]} />
      <View style={[styles.routeLine, { top: 65, left: 30, width: 100, transform: [{ rotate: '20deg' }], backgroundColor: color + '20' }]} />

      {/* Hub icons */}
      {hubs.map((h, i) => (
        <Animated.View key={i} style={[styles.hubNode, {
          backgroundColor: color,
          left: h.x, top: h.y,
          transform: [{ translateY: float1.interpolate({
            inputRange: [-4, 4], outputRange: [-4 + i, 4 - i],
          }) }],
        }]}>
          <Text style={{ fontSize: 14 }}>{h.e}</Text>
        </Animated.View>
      ))}

      {/* Moving packages */}
      <Animated.View style={[styles.pkg, { backgroundColor: color, top: 40, transform: [{ translateX: pkg1 }] }]} />
      <Animated.View style={[styles.pkg, { backgroundColor: '#FFF', top: 70, transform: [{ translateX: pkg2 }] }]} />
    </LabObjectFrame>
  );
}

// ─── Fallback orb ─────────────────────────────────────────────────────────────

function FallbackObject({ color }: { color: string }) {
  const spin   = useSpin(10000);
  const pulse  = usePulse(0.85, 1.15, 1400);
  const float1 = useFloat(6, 2000);

  return (
    <LabObjectFrame>
      <Animated.View style={[styles.fallbackOrb, {
        backgroundColor: color + '20',
        transform: [{ scale: pulse }, { translateY: float1 }],
      }]}>
        <Animated.View style={[styles.fallbackRing, {
          borderColor: color + '60',
          transform: [{ rotate: spin }],
        }]} />
        <View style={[styles.fallbackCore, { backgroundColor: color }]}>
          <Text style={{ fontSize: 24, color: '#FFF' }}>⚡</Text>
        </View>
      </Animated.View>
    </LabObjectFrame>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────

const TYPE_MAP: Record<string, (color: string) => React.ReactElement> = {
  'starkzap-wallet':  (c) => <WalletObject  color={c} />,
  'starkzap-gasless': (c) => <GaslessObject color={c} />,
  'starkzap-swap':    (c) => <SwapObject    color={c} />,
  'starkzap-stake':   (c) => <StakeObject   color={c} />,
  'starkzap-lend':    (c) => <LendObject    color={c} />,
  'starkzap-dca':     (c) => <DCAObject     color={c} />,
  'starkzap-build':   (c) => <BuildObject   color={c} />,
  'starkzap-boss':    (c) => <BossObject    color={c} />,
  'spot-trading':     (c) => <TradingTerminalObject color={c} />,
  'futures-trading':  (c) => <TradingTerminalObject color={c} />,
  'options-trading':  (c) => <TradingTerminalObject color={c} />,
  'defi-research':    (c) => <DeFiResearchObject    color={c} />,
  'defi-pool':        (c) => <DeFiResearchObject    color={c} />,
  'quant-backtest':   (c) => <QuantBacktestObject   color={c} />,
  'algo-strategy':    (c) => <QuantBacktestObject   color={c} />,
  'onchain-analysis': (c) => <OnchainObject         color={c} />,
  'supply-chain':     (c) => <SupplyChainObject     color={c} />,
};

export interface LabObjectProps {
  simulatorType: string;
  fieldColor?:   string;   // if not provided, uses theme accent
}

export default function LabObject({ simulatorType, fieldColor }: LabObjectProps) {
  const { colors } = useTheme();
  const color      = fieldColor ?? colors.accent;

  const factory = TYPE_MAP[simulatorType];
  if (factory) return factory(color);

  // Partial match fallback
  if (simulatorType.includes('trading')) return <TradingTerminalObject color={color} />;
  if (simulatorType.includes('defi'))    return <DeFiResearchObject    color={color} />;
  if (simulatorType.includes('quant'))   return <QuantBacktestObject   color={color} />;
  if (simulatorType.includes('chain'))   return <SupplyChainObject     color={color} />;
  if (simulatorType.includes('onchain')) return <OnchainObject         color={color} />;

  return <FallbackObject color={color} />;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  frame: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Wallet
  dataPacket:      { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: 20 },
  walletCard:      { borderRadius: Radius.lg, borderWidth: 1.5, padding: 12, alignItems: 'center', width: '80%' },
  walletLabel:     { fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: 4 },
  walletAddress:   { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: 4 },
  walletBalance:   { fontSize: FontSize.xl, fontWeight: FontWeight.black, marginBottom: 6 },
  walletGasBadge:  { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  walletGasText:   { fontSize: 10, fontWeight: FontWeight.bold },
  strkCoin:        { position: 'absolute', right: 20, top: 20, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  strkCoinText:    { fontSize: 16 },

  // Gasless
  txArrow:         { position: 'absolute', top: 30 },
  sponsoredBadge:  { borderRadius: Radius.lg, padding: 12, alignItems: 'center' },
  sponsoredText:   { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: '#FFF' },
  sponsoredSub:    { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  zeroBadge:       { position: 'absolute', bottom: 16, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  zeroText:        { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  // Swap
  tokenChip:       { position: 'absolute', top: 24, borderWidth: 1.5, borderRadius: Radius.md, padding: 8, alignItems: 'center', width: 60 },
  tokenEmoji:      { fontSize: 20, marginBottom: 2 },
  tokenLabel:      { fontSize: 10, fontWeight: FontWeight.black },
  swapArrow:       { alignItems: 'center', justifyContent: 'center' },
  swapArrowLine:   { height: 2, width: 40, marginBottom: 4 },
  swapArrowHead:   { fontSize: 22, fontWeight: FontWeight.black },
  priceImpactRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, position: 'absolute', bottom: 12, left: 16, right: 16 },
  priceImpactLabel:{ fontSize: 10, fontWeight: FontWeight.semibold },
  priceImpactTrack:{ flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  priceImpactFill: { height: '100%', borderRadius: 2 },
  priceImpactValue:{ fontSize: 10, fontWeight: FontWeight.bold, width: 32, textAlign: 'right' },

  // Stake
  stakingRing:     { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1.5 },
  stakingRingDot:  { position: 'absolute', top: -4, left: 55, width: 8, height: 8, borderRadius: 4 },
  apyBadge:        { borderRadius: 16, padding: 12, alignItems: 'center', minWidth: 72 },
  apyValue:        { fontSize: 22, fontWeight: FontWeight.black, color: '#FFF' },
  apyLabel:        { fontSize: 10, fontWeight: FontWeight.black, color: 'rgba(255,255,255,0.7)' },
  validatorRow:    { position: 'absolute', bottom: 16, flexDirection: 'row', gap: 8 },
  validatorDot:    { width: 10, height: 10, borderRadius: 5 },
  apyBarRow:       { position: 'absolute', bottom: 8, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  apyBarLabel:     { fontSize: 9, fontWeight: FontWeight.semibold },
  apyBarTrack:     { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  apyBarFill:      { height: '100%', borderRadius: 2 },
  apyBarValue:     { fontSize: 9, fontWeight: FontWeight.bold },

  // Lend
  protocolIcon:    { borderWidth: 1, borderRadius: Radius.lg, padding: 10, alignItems: 'center', marginBottom: 8 },
  protocolName:    { fontSize: 10, fontWeight: FontWeight.black, marginTop: 2 },
  lendMetricRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', paddingHorizontal: 16 },
  lendMetricLabel: { fontSize: 10, fontWeight: FontWeight.semibold, width: 70 },
  lendTrack:       { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  lendFill:        { height: '100%', borderRadius: 3 },
  lendMetricValue: { fontSize: 10, fontWeight: FontWeight.black, width: 36, textAlign: 'right' },
  utilisationChip: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  utilisationText: { fontSize: 10, fontWeight: FontWeight.bold },

  // DCA
  dcaAvgLine:      { position: 'absolute', top: '45%', height: 2, width: '100%', backgroundColor: 'transparent' },
  dcaAvgDot:       { width: 8, height: 8, borderRadius: 4, alignSelf: 'center', top: -3 },
  dcaBarsRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 16, paddingBottom: 44, height: 100 },
  dcaBar:          { flex: 1, borderRadius: 3, minHeight: 8 },
  dcaChip:         { position: 'absolute', bottom: 12, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 6 },
  dcaChipText:     { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF' },
  dcaChipSub:      { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  // Build / terminal
  terminal:        { width: '92%', backgroundColor: '#111111', borderRadius: 10, borderWidth: 1, padding: 10 },
  terminalDots:    { flexDirection: 'row', gap: 5, marginBottom: 8 },
  terminalDot:     { width: 8, height: 8, borderRadius: 4 },
  terminalLine:    { fontSize: 9.5, fontFamily: 'monospace', lineHeight: 15 },
  terminalCursor:  { color: '#FFF' },

  // Boss
  bossOrbit:       { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1.5 },
  bossActionNode:  { position: 'absolute', width: 40, height: 40, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bossActionLabel: { fontSize: 8, fontWeight: FontWeight.bold, marginTop: 1 },
  bossCenterNode:  { position: 'absolute', width: 44, height: 44, borderRadius: 22, top: 43, left: 68, alignItems: 'center', justifyContent: 'center' },

  // Trading terminal / order book
  priceChip:       { position: 'absolute', top: 12, right: 16, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6 },
  priceChipText:   { fontSize: FontSize.md, fontWeight: FontWeight.black, color: '#FFF' },
  priceChipChange: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  orderBook:       { width: '92%' },
  orderBookSide:   { gap: 2 },
  orderRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, height: 14 },
  orderBar:        { height: '100%', borderRadius: 2 },
  orderPrice:      { fontSize: 9, fontWeight: FontWeight.bold, width: 48, textAlign: 'right' },
  spreadLine:      { borderWidth: 0.5, marginVertical: 4 },

  // DeFi research
  tvlHeader:       { alignItems: 'center', marginBottom: 8 },
  tvlLabel:        { fontSize: 10, fontWeight: FontWeight.semibold },
  tvlValue:        { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  protocolBars:    { width: '92%', gap: 6 },
  protocolBarRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  protocolBarName: { fontSize: 9, fontWeight: FontWeight.bold, color: '#6B7280', width: 44 },
  protocolBarTrack:{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  protocolBarFill: { height: '100%', borderRadius: 3 },

  // Quant backtest
  sharpeBadge:     { position: 'absolute', top: 12, right: 16, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  sharpeLabel:     { fontSize: 9, fontWeight: FontWeight.bold, color: 'rgba(255,255,255,0.7)' },
  sharpeValue:     { fontSize: FontSize.xl, fontWeight: FontWeight.black, color: '#FFF' },
  equityCurve:     { width: '90%', height: 70, position: 'relative', marginBottom: 8 },
  equityPoint:     { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  equityLine:      { position: 'absolute', height: 2, borderRadius: 1 },
  drawdownRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  drawdownLabel:   { fontSize: 10, fontWeight: FontWeight.semibold },
  drawdownValue:   { fontSize: FontSize.sm, fontWeight: FontWeight.black },

  // Onchain
  walletNode:      { position: 'absolute' },
  txFlow:          { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: 50 },
  whaleLabel:      { position: 'absolute', bottom: 12, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  whaleLabelText:  { fontSize: 10, fontWeight: FontWeight.bold },

  // Supply chain
  routeLine:       { position: 'absolute', height: 1.5 },
  hubNode:         { position: 'absolute', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pkg:             { position: 'absolute', width: 7, height: 7, borderRadius: 2 },

  // Fallback
  fallbackOrb:     { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  fallbackRing:    { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 1.5 },
  fallbackCore:    { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
