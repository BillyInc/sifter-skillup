/**
 * Lab 10 + Lab 11 Simulators — React Native / Starkzap Pattern
 *
 * Lab 10:
 *   starkzap-treasury-allocator   — Lesson 1: Build $300K treasury, enforce concentration limits
 *   starkzap-correlation-manager  — Lesson 3: Position correlation dashboard + sell-off sim + exit criteria
 *
 * Lab 11:
 *   starkzap-onchain-query        — Lesson 1: Dune-style query builder for Starknet analytics
 *   starkzap-backtest             — Lesson 4: Strategy backtester over historical Starknet data
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { useAuth } from '../../../../hooks/useAuth';
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../../../lib/starkzap';
import { Spacing, Radius, FontSize, useTheme } from '../../../../theme';
import {
  SimHeader, ActionBtn, TxResult, InfoRow, DemoBadge, simulateDelay,
} from '../shared/StarkzapSimulatorCard_v3';

interface SimProps { onComplete: () => void; onSkip: () => void; colors: any; }

// ══════════════════════════════════════════════════════════════════════════════
// LAB 10 LESSON 1 — starkzap-treasury-allocator
// Build a $300,000 treasury. Enforce 25% concentration limit.
// See risk-adjusted weighted yield update live.
// ══════════════════════════════════════════════════════════════════════════════

interface TreasuryPos {
  id: string;
  name: string;
  allocation: number;
  apy: number;
  sharpe: number;
  riskLevel: 'low' | 'medium' | 'high';
}

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

const s = StyleSheet.create({
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
