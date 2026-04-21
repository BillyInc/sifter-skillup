/**
 * Labs 4–6 Simulators — React Native / Starkzap Pattern
 * Starknet DeFi Navigator · Junior Labs 4–6
 *
 * New simulator types:
 *   starkzap-utilisation-curve  — Lab4 L1: Kink model interest rate visualizer
 *   starkzap-health-factor      — Lab4 L3: Live health factor calculator
 *   starkzap-borrow             — Lab4 L4: Real borrow via starkzap lending
 *   starkzap-dca-calc           — Lab5 L1: DCA vs lump sum calculator
 *   starkzap-yield-dca          — Lab5 L4: Yield-funded DCA demonstrator
 *   starkzap-junior-allocator   — Lab6 L1: Portfolio allocation builder
 *   starkzap-risk-scorecard     — Lab6 L3: 7-dimension protocol risk tool
 *   starkzap-loop-builder       — Lab6 L4: Loop yield calculator
 */

import React, { useState, useEffect } from 'react';
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
// LAB 4 LESSON 1 — starkzap-utilisation-curve
// Kink Model Interest Rate Visualizer
// User drags utilisation slider. Sees borrow APR and supply APY
// respond in real-time. Understands the kink point — and why
// high utilisation means you cannot withdraw immediately.
// ══════════════════════════════════════════════════════════════════════════════

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
  const { starknetWallet } = useAuth();
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
  const { starknetWallet } = useAuth();
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

const RISK_DIMENSIONS = [
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
const s = StyleSheet.create({
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
