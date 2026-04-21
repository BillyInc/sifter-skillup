/**
 * Lab 7 Simulators — React Native / Starkzap Pattern
 * Starknet DeFi Navigator · Intermediate Lab 7
 *
 * Simulator types:
 *   starkzap-il-calculator   — Lab7 L2: Impermanent loss formula visualiser
 *   starkzap-range-builder   — Lab7 L3: Concentrated range builder + capital efficiency
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
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
// LAB 7 LESSON 2 — starkzap-il-calculator
// Impermanent Loss Formula Visualiser
// User drags a price ratio slider and sees IL% update in real-time.
// Includes a concrete dollar example, a break-even fee APY line,
// and a "hold vs LP" comparison to make IL tangible.
// Unlock: user must have seen IL > 5% and IL > 15% before completing.
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

const s = StyleSheet.create({
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
