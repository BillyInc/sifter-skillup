/**
 * ChartReplayRenderer — SVG candlestick chart for trading pattern exercises.
 *
 * Handles all 5 chartReplay types (150 exercises across trading tracks):
 *   chartReplay-pattern     identify pattern (head & shoulders, flags, etc.)
 *   chartReplay-breakout    breakout setup analysis
 *   chartReplay-reversal    reversal signal identification
 *   chartReplay-riskManage  risk management given chart state
 *   chartReplay-volumeRead  volume + price action interpretation
 *   chartReplay-patternID   named pattern identification
 *
 * Parses candle data directly from the scenario text already written in each
 * lesson's lessonSimulation. User looks at the chart, then writes their analysis.
 * AI scores against the existing scoringCriteria.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Platform,
  ScrollView, KeyboardAvoidingView, TextInput,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, Card, SectionLabel,
  CriterionRow, ScoreScreen, TypingIndicator,
  scoreWithClaude, type SimBaseProps, type ScoringResult,
} from './SimulatorShared';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChartReplayType =
  | 'chartReplay-pattern'
  | 'chartReplay-breakout'
  | 'chartReplay-reversal'
  | 'chartReplay-riskManage'
  | 'chartReplay-volumeRead'
  | 'chartReplay-patternID';

interface Candle {
  open: number; high: number; low: number; close: number;
  volume: number; label?: string;
}

export interface ChartReplayProps extends SimBaseProps {
  type: ChartReplayType;
  scenario: string;
  scoringCriteria: string[];
  onArtifactContent?: (content: string) => void;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG: Record<ChartReplayType, { label: string; icon: string; color: string; prompt: string }> = {
  'chartReplay-pattern':    { label: 'PATTERN RECOGNITION', icon: '📈', color: '#6366f1', prompt: 'Identify the pattern and explain what it signals.' },
  'chartReplay-breakout':   { label: 'BREAKOUT ANALYSIS',   icon: '⚡', color: '#f59e0b', prompt: 'Assess the breakout setup quality and state your entry criteria.' },
  'chartReplay-reversal':   { label: 'REVERSAL SIGNALS',    icon: '🔄', color: '#ef4444', prompt: 'Identify the reversal signals and explain your reasoning.' },
  'chartReplay-riskManage': { label: 'RISK MANAGEMENT',     icon: '🛡️', color: '#10b981', prompt: 'State your stop placement, target, and position sizing rationale.' },
  'chartReplay-volumeRead': { label: 'VOLUME ANALYSIS',     icon: '📊', color: '#0ea5e9', prompt: 'Analyse the volume pattern and what it confirms or contradicts.' },
  'chartReplay-patternID':  { label: 'PATTERN ID',          icon: '🔍', color: '#8b5cf6', prompt: 'Name the pattern and describe its textbook criteria.' },
};

// ── Candle parser — reads text scenario into structured candle data ──────────

/**
 * Extracts OHLCV candle data from the scenario text.
 * Scenarios follow the format: "price $71,200–$71,800, volume 1,240 BTC"
 * Falls back to generated demo data if parsing yields < 3 candles.
 */
function parseCandlesFromScenario(scenario: string): Candle[] {
  const candles: Candle[] = [];

  // Match patterns like "$71,200–$71,800" or "$71,200-$71,800"
  const rangePattern = /\$?([\d,]+)[–\-—]([\d,]+)/g;
  const volPattern = /volume\s+([\d,]+\.?\d*)\s*(BTC|ETH|SOL|USDT|×|x)?/gi;

  const ranges: [number, number][] = [];
  const volumes: number[] = [];

  let m;
  while ((m = rangePattern.exec(scenario)) !== null) {
    const lo = parseFloat(m[1].replace(/,/g, ''));
    const hi = parseFloat(m[2].replace(/,/g, ''));
    if (!isNaN(lo) && !isNaN(hi) && hi > lo) ranges.push([lo, hi]);
  }
  while ((m = volPattern.exec(scenario)) !== null) {
    const v = parseFloat(m[1].replace(/,/g, ''));
    if (!isNaN(v)) volumes.push(v);
  }

  // Build candles from parsed ranges
  for (let i = 0; i < ranges.length; i++) {
    const [lo, hi] = ranges[i];
    const bullish = i === 0 ? true : Math.random() > 0.4;
    candles.push({
      open:   bullish ? lo + (hi - lo) * 0.1 : hi - (hi - lo) * 0.1,
      close:  bullish ? hi - (hi - lo) * 0.1 : lo + (hi - lo) * 0.1,
      high:   hi + (hi - lo) * 0.08,
      low:    lo - (hi - lo) * 0.08,
      volume: volumes[i] ?? 1000 + Math.random() * 2000,
    });
  }

  // Fallback: generate illustrative candles if parse didn't yield enough
  if (candles.length < 5) {
    return generateDemoCandles(scenario);
  }
  return candles;
}

function generateDemoCandles(scenario: string): Candle[] {
  // Detect pattern type from scenario text to generate appropriate shape
  const s = scenario.toLowerCase();
  const isBreakout  = s.includes('consolidat') || s.includes('breakout') || s.includes('resistance');
  const isReversal  = s.includes('reversal') || s.includes('top') || s.includes('bottom') || s.includes('wick');
  const isDowntrend = s.includes('decline') || s.includes('drop') || s.includes('fall') || s.includes('bear');

  const seed = isBreakout ? 'breakout' : isReversal ? 'reversal' : isDowntrend ? 'downtrend' : 'uptrend';
  return DEMO_CANDLES[seed] ?? DEMO_CANDLES.uptrend;
}

const DEMO_CANDLES: Record<string, Candle[]> = {
  uptrend: [
    { open: 100, high: 106, low: 98,  close: 104, volume: 1200 },
    { open: 104, high: 109, low: 102, close: 107, volume: 1450 },
    { open: 107, high: 108, low: 104, close: 105, volume: 800  },
    { open: 105, high: 113, low: 104, close: 111, volume: 2100 },
    { open: 111, high: 117, low: 110, close: 115, volume: 2600 },
    { open: 115, high: 118, low: 113, close: 116, volume: 1100 },
    { open: 116, high: 122, low: 115, close: 120, volume: 3200 },
  ],
  breakout: [
    { open: 190, high: 191, low: 188, close: 190, volume: 900  },
    { open: 190, high: 192, low: 189, close: 191, volume: 1000 },
    { open: 191, high: 191.5, low: 189.5, close: 190.5, volume: 850 },
    { open: 190.5, high: 191.8, low: 190, close: 191.2, volume: 920 },
    { open: 191.2, high: 191.5, low: 190.5, close: 190.8, volume: 800 },
    { open: 190.8, high: 198, low: 190.5, close: 197, volume: 4800, label: '⚡' },
  ],
  reversal: [
    { open: 100, high: 108, low: 99,  close: 106, volume: 1500 },
    { open: 106, high: 115, low: 105, close: 113, volume: 2200 },
    { open: 113, high: 120, low: 112, close: 118, volume: 2800 },
    { open: 118, high: 126, low: 117, close: 122, volume: 3200 },
    { open: 122, high: 128, low: 108, close: 110, volume: 4100, label: '⚠️' },
    { open: 110, high: 112, low: 102, close: 104, volume: 2600 },
    { open: 104, high: 106, low: 97,  close: 100, volume: 1900 },
  ],
  downtrend: [
    { open: 120, high: 122, low: 114, close: 115, volume: 1800 },
    { open: 115, high: 117, low: 109, close: 110, volume: 1600 },
    { open: 110, high: 113, low: 106, close: 108, volume: 1400 },
    { open: 108, high: 110, low: 103, close: 105, volume: 1200 },
    { open: 105, high: 107, low: 98,  close: 100, volume: 2100 },
    { open: 100, high: 102, low: 95,  close: 97,  volume: 1900 },
  ],
};

// ── Candlestick chart component ───────────────────────────────────────────────

const CHART_H = 200;
const VOL_H   = 48;
const PAD     = { top: 12, bottom: 8, left: 40, right: 12 };

function CandlestickChart({ candles }: { candles: Candle[] }) {
  const screenW = Dimensions.get('window').width - Spacing.lg * 2 - 8;
  const chartW  = screenW;
  const plotW   = chartW - PAD.left - PAD.right;
  const plotH   = CHART_H - PAD.top - PAD.bottom;

  const prices  = candles.flatMap(c => [c.high, c.low]);
  const minP    = Math.min(...prices);
  const maxP    = Math.max(...prices);
  const range   = maxP - minP || 1;

  const maxVol  = Math.max(...candles.map(c => c.volume));

  const cw      = plotW / candles.length;
  const bw      = Math.max(cw * 0.55, 4);

  const py = (price: number) => PAD.top + plotH - ((price - minP) / range) * plotH;
  const cx = (i: number) => PAD.left + i * cw + cw / 2;

  const priceLabels = [minP, (minP + maxP) / 2, maxP].map(p => ({
    y: py(p), label: p > 10000 ? `$${Math.round(p / 1000)}k` : `$${p.toFixed(p > 100 ? 0 : 2)}`,
  }));

  return (
    <Svg width={chartW} height={CHART_H + VOL_H}>
      {/* Grid lines */}
      {priceLabels.map((pl, i) => (
        <G key={i}>
          <Line x1={PAD.left} y1={pl.y} x2={chartW - PAD.right} y2={pl.y}
            stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
          <SvgText x={PAD.left - 4} y={pl.y + 4} textAnchor="end"
            fontSize={9} fill="#94a3b8" fontWeight="600">{pl.label}</SvgText>
        </G>
      ))}

      {/* Candles */}
      {candles.map((c, i) => {
        const x     = cx(i);
        const bullish = c.close >= c.open;
        const color   = bullish ? '#10b981' : '#ef4444';
        const bodyTop = py(Math.max(c.open, c.close));
        const bodyH   = Math.max(Math.abs(py(c.open) - py(c.close)), 2);

        // Volume bar
        const volH = (c.volume / maxVol) * (VOL_H - 6);
        const volY = CHART_H + VOL_H - volH - 4;

        return (
          <G key={i}>
            {/* Wick */}
            <Line x1={x} y1={py(c.high)} x2={x} y2={py(c.low)}
              stroke={color} strokeWidth={1.5} />
            {/* Body */}
            <Rect x={x - bw / 2} y={bodyTop} width={bw} height={bodyH}
              fill={color} rx={1.5} />
            {/* Volume */}
            <Rect x={x - bw / 2} y={volY} width={bw} height={volH}
              fill={color + '88'} rx={1} />
            {/* Label (breakout candle etc.) */}
            {c.label && (
              <SvgText x={x} y={py(c.high) - 8} textAnchor="middle" fontSize={12}>{c.label}</SvgText>
            )}
          </G>
        );
      })}

      {/* Axes */}
      <Line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CHART_H}
        stroke="#cbd5e1" strokeWidth={1.5} />
      <Line x1={PAD.left} y1={CHART_H} x2={chartW - PAD.right} y2={CHART_H}
        stroke="#cbd5e1" strokeWidth={1.5} />
      {/* Volume axis label */}
      <SvgText x={PAD.left - 4} y={CHART_H + VOL_H - 2} textAnchor="end"
        fontSize={8} fill="#94a3b8">VOL</SvgText>
    </Svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChartReplayRenderer({
  type, scenario, scoringCriteria, onComplete, onSkip, onArtifactContent,
}: ChartReplayProps) {
  const cfg     = CONFIG[type];
  const candles = useMemo(() => parseCandlesFromScenario(scenario), [scenario]);

  const [phase, setPhase]       = useState<'read' | 'write' | 'scoring' | 'results'>('read');
  const [response, setResponse] = useState('');
  const [result, setResult]     = useState<ScoringResult | null>(null);
  const canSubmit = response.trim().length >= 60;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('scoring');
    try {
      const scored = await scoreWithClaude(scenario, scoringCriteria, response.trim(), `Chart type: ${type}`);
      setResult(scored);
      setPhase('results');
      onArtifactContent?.(response.trim());
      Haptics.notificationAsync(scored.score === scored.total
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning);
    } catch {
      setPhase('write');
    }
  };

  if (phase === 'scoring') {
    return (
      <SimShell title={cfg.label} subtitle="Evaluating your analysis…" icon={cfg.icon}>
        <TypingIndicator label="Checking your pattern analysis against scoring criteria…" />
      </SimShell>
    );
  }

  if (phase === 'results' && result) {
    return (
      <SimShell title={cfg.label} subtitle="Results" icon={cfg.icon}>
        <ScoreScreen score={result.score} total={result.total} xp={result.xpEarned}
          overallFeedback={result.overallFeedback} onComplete={onComplete} />
        <SectionLabel text="CRITERIA BREAKDOWN" />
        {result.criteriaResults.map((cr, i) => (
          <CriterionRow key={i} {...cr} delay={i * 80} />
        ))}
      </SimShell>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SimShell title={cfg.label} subtitle={cfg.prompt} icon={cfg.icon}>
        {/* Chart */}
        <View style={s.chartWrap}>
          <View style={s.chartHeader}>
            <Text style={s.chartPair}>BTC/USDT</Text>
            <View style={s.chartLegend}>
              <View style={[s.legendDot, { backgroundColor: '#10b981' }]} /><Text style={s.legendText}>Bull</Text>
              <View style={[s.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={s.legendText}>Bear</Text>
            </View>
          </View>
          <CandlestickChart candles={candles} />
        </View>

        {/* Scenario text */}
        {phase === 'read' && (
          <Card>
            <SectionLabel text="SCENARIO DETAILS" color={cfg.color} />
            <Text style={s.scenarioText}>{scenario}</Text>
            <PrimaryBtn label="Analyse This Chart →" onPress={() => setPhase('write')} color={cfg.color} />
          </Card>
        )}

        {/* Write analysis */}
        {phase === 'write' && (
          <View>
            <SectionLabel text="YOUR ANALYSIS" />
            <TextInput
              value={response}
              onChangeText={setResponse}
              placeholder={`${cfg.prompt}\n\nReference specific price levels and volume from what you see above.`}
              placeholderTextColor="#94a3b8"
              multiline autoCapitalize="sentences"
              style={[s.input, { borderColor: canSubmit ? cfg.color : '#e2e8f0' }]}
              textAlignVertical="top"
            />
            <PrimaryBtn label="Submit Analysis →" onPress={handleSubmit} disabled={!canSubmit} color={cfg.color} />
            <GhostBtn label="Skip" onPress={onSkip} />
          </View>
        )}
      </SimShell>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  chartWrap:   { backgroundColor: '#fff', borderRadius: Radius.lg, borderWidth: 1.5, borderColor: '#e2e8f0', overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  chartPair:   { fontSize: 13, fontWeight: '800', color: Colors.text },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { fontSize: 11, color: Colors.textSoft, marginRight: 4 },
  scenarioText:{ fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  input:       {
    backgroundColor: Colors.card, color: Colors.text,
    fontSize: FontSize.sm, borderRadius: Radius.md, borderWidth: 1.5,
    padding: Spacing.md, minHeight: 150, lineHeight: 22,
  },
});
