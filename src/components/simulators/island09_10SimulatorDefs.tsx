/**
 * island09_10SimulatorDefs.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Island 9 — Memecoin Markets (Levels 91–105, Solana Devnet)
 * Island 10 — Airdrop Archipelago (Levels 106–120, Arbitrum Sepolia)
 *
 * Add to SimulatorCard.tsx SIMULATORS map:
 *   memeTokenProfile     → L92 — evaluate token safety signals
 *   bundleDetector       → L93 — spot coordinated buys
 *   memeExitStrategy     → L96 — when and how to exit
 *   memePortfolioSize    → L97 — position sizing for volatile assets
 *   memeOnChainRead      → L99 — reading real on-chain data
 *   memecoinBoss         → L105 — island boss
 *   airdropEligibility   → L107 — check if you qualify
 *   sybilDetector        → L109 — how sybil analysis works
 *   airdropTax           → L113 — tax treatment of received airdrops
 *   airdropScamDrill     → L116 — spot fake claim sites
 *   airdropExpectedValue → L118 — calculate realistic EV
 *   airdropBoss          → L120 — island boss
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Platform, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

interface SimProps { onComplete: () => void; onSkip: () => void; }

// ── Shared UI (mirror SimulatorCard.tsx pattern) ─────────────────────────────
function SimShell({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: string; children: React.ReactNode }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 18, lineHeight: 22 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 }}>⚡ TRY IT NOW</Text>
          <Text style={{ fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 }}>{title}</Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}
const PBtn = ({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
    style={[{ backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' }, disabled && { opacity: 0.4 }]}>
    <Text style={{ color: '#fff', fontSize: FontSize.lg, fontWeight: '800' }}>{label}</Text>
  </TouchableOpacity>
);
const GBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
    <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' }}>{label}</Text>
  </TouchableOpacity>
);
const Res = ({ ok, msg }: { ok: boolean; msg: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, backgroundColor: ok ? '#d1fae5' : '#fee2e2', borderColor: ok ? Colors.green : Colors.red }}>
    <Text style={{ fontSize: 20 }}>{ok ? '✅' : '❌'}</Text>
    <Text style={{ flex: 1, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 19, color: ok ? '#065f46' : '#7f1d1d' }}>{msg}</Text>
  </View>
);
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[{ backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg }, Shadow.sm as object, style]}>{children}</View>;
}
const s = StyleSheet.create({
  fl: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rk: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  rv: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '700', flex: 1, textAlign: 'right' },
  blt: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: 2 },
  h2: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 },
  inp: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, backgroundColor: Colors.card },
});

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 9 — MEMECOIN MARKETS
// ═════════════════════════════════════════════════════════════════════════════

// ── L92 — memeTokenProfile ────────────────────────────────────────────────────
export function MemeTokenProfileSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    {
      name: 'POPCAT',
      age: '45 days', mcap: '$8.2M', fdv: '$8.2M', vol24h: '$3.1M',
      holders: 12400, buys: 892, sells: 701, lpLocked: true, mintRevoked: true,
      devWallet: '2.1%', topHolder: '4.8%', honeypot: false, audited: false,
      verdict: 'WATCH',
      analysis: 'Healthy ratio, LP locked, mint revoked, distributed holders. Legitimate but still speculative — no audit.',
    },
    {
      name: 'MOON100X',
      age: '3 hours', mcap: '$180K', fdv: '$18M', vol24h: '$940K',
      holders: 48, buys: 12, sells: 3, lpLocked: false, mintRevoked: false,
      devWallet: '42%', topHolder: '67%', honeypot: true, audited: false,
      verdict: 'INSTANT RUG',
      analysis: 'FDV is 100× MC (insiders hold everything), LP unlocked, mint active, honeypot detected, dev holds 42%. Classic rug setup.',
    },
    {
      name: 'FWOG',
      age: '6 days', mcap: '$2.4M', fdv: '$2.4M', vol24h: '$890K',
      holders: 5800, buys: 2100, sells: 1400, lpLocked: true, mintRevoked: true,
      devWallet: '1.2%', topHolder: '3.1%', honeypot: false, audited: false,
      verdict: 'WATCH',
      analysis: 'Growing community, healthy buy/sell, fully diluted, LP locked. Still high risk but legitimate. Monitor volume consistency.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = tokens.filter((t, i) => answers[i] === t.verdict).length;

  return (
    <SimShell icon="🔬" title="Token Profile Analysis" subtitle="Read the full on-chain profile of 3 tokens. Classify each before committing capital.">
      {tokens.map((t, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === t.verdict;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: Spacing.sm }}>{t.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
              {[['Age', t.age], ['MC', t.mcap], ['FDV', t.fdv], ['24h Vol', t.vol24h], ['Holders', String(t.holders)], ['Buys', String(t.buys)], ['Sells', String(t.sells)]].map(([k, v]) => (
                <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
                </View>
              ))}
              {[
                { label: `LP ${t.lpLocked ? 'Locked' : 'UNLOCKED'}`, ok: t.lpLocked },
                { label: `Mint ${t.mintRevoked ? 'Revoked' : 'ACTIVE'}`, ok: t.mintRevoked },
                { label: `Dev ${t.devWallet}`, ok: parseFloat(t.devWallet) < 10 },
                { label: `Top ${t.topHolder}`, ok: parseFloat(t.topHolder) < 10 },
                { label: t.honeypot ? 'HONEYPOT 🚨' : 'No Honeypot ✅', ok: !t.honeypot },
              ].map(({ label, ok }) => (
                <View key={label} style={{ backgroundColor: ok ? '#d1fae5' : '#fee2e2', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: ok ? Colors.green : Colors.red }}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['WATCH', 'INSTANT RUG', 'BUY'].map(v => {
                const isCh = chosen === v; const isCo = v === t.verdict;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={v} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 10, color: Colors.text, textAlign: 'center' }}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {t.analysis}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PBtn label="Submit Analysis →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <><Res ok={score >= 2} msg={`${score}/3 correct. Key: FDV/MC ratio, LP lock, honeypot scan, and holder concentration are the four non-negotiables.`} />
          <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L93 — bundleDetector ──────────────────────────────────────────────────────
export function BundleDetectorSim({ onComplete, onSkip }: SimProps) {
  const txGroups = [
    {
      label: 'Launch block activity',
      transactions: [
        { time: '00:00:01', wallet: '5xK9...1aB', action: 'Buy 10M tokens', amount: '$4,200', note: 'Deployer wallet' },
        { time: '00:00:01', wallet: '8fQ2...7cD', action: 'Buy 8M tokens',  amount: '$3,100', note: 'Connected to deployer via prior tx' },
        { time: '00:00:01', wallet: '3mR5...4eF', action: 'Buy 6M tokens',  amount: '$2,800', note: 'Same device fingerprint (Bubblemaps)' },
        { time: '00:00:02', wallet: 'Random1',    action: 'Buy 0.1M tokens', amount: '$45', note: 'Organic buyer' },
      ],
      isBundled: true,
      explanation: 'Three wallets buying in the same block (00:00:01) at launch with prior fund connections = coordinated bundle. They hold 75% and will dump on organic buyers.',
    },
    {
      label: 'Normal trading day',
      transactions: [
        { time: '14:22:10', wallet: 'AlphaDesk', action: 'Buy 2M tokens', amount: '$800', note: 'Fresh wallet, no connections' },
        { time: '14:45:31', wallet: 'RetailA',   action: 'Buy 0.5M',       amount: '$200', note: 'Twitter follower of project' },
        { time: '15:01:22', wallet: 'LPProvider', action: 'Add liquidity',  amount: '$5,000', note: 'Existing LP provider' },
        { time: '15:30:08', wallet: 'RetailB',   action: 'Sell 0.3M',      amount: '$120', note: 'Profit taking' },
      ],
      isBundled: false,
      explanation: 'Spread out timing, different funding sources, varied wallet histories — organic trading pattern.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = txGroups.filter((g, i) => answers[i] === g.isBundled).length;

  return (
    <SimShell icon="🕵️" title="Spot the Bundle" subtitle="Identify coordinated wallet groups (bundles) from the transaction log.">
      <Card>
        <Text style={s.h2}>Bundling = multiple coordinated wallets buying in the same block at launch, then dumping on organic buyers. Tools: Bubblemaps, gmgn.ai, CIELO Finance.</Text>
      </Card>
      {txGroups.map((group, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === group.isBundled;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '900', color: Colors.text, marginBottom: Spacing.md }}>{group.label}</Text>
            {group.transactions.map((tx, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: Spacing.sm, paddingVertical: 4, borderBottomWidth: j < group.transactions.length - 1 ? 1 : 0, borderBottomColor: Colors.border }}>
                <Text style={{ width: 70, fontSize: 10, color: Colors.textSoft, fontFamily: 'monospace' }}>{tx.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.text }}>{tx.wallet}</Text>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>{tx.action} · {tx.amount}</Text>
                  {checked && group.isBundled && j < 3 && (
                    <Text style={{ fontSize: 10, color: Colors.red, fontWeight: '700' }}>⚠️ {tx.note}</Text>
                  )}
                </View>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              {[{ v: true, l: '🚨 BUNDLED' }, { v: false, l: '✅ ORGANIC' }].map(({ v, l }) => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCorrect)          { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCorrect)         { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && v === group.isBundled) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {group.explanation}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < txGroups.length} />
        : <><Res ok={score === 2} msg={`${score}/2 — Same-block buying at launch from funded-linked wallets = bundle. Use Bubblemaps before any purchase.`} />
          <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L96 — memeExitStrategy ────────────────────────────────────────────────────
export function MemeExitStrategySim({ onComplete, onSkip }: SimProps) {
  const [entryMC, setEntryMC] = useState('50000');
  const [investment, setInvestment] = useState('500');
  const [strategy, setStrategy] = useState<'thirds' | 'moonbag' | 'greedy' | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const entry = parseFloat(entryMC) || 50000;
  const inv = parseFloat(investment) || 500;
  const x5mc = entry * 5;
  const x10mc = entry * 10;
  const x25mc = entry * 25;

  const strategies = {
    thirds: {
      label: '📊 Rule of Thirds',
      desc: 'Sell 1/3 at 5×, 1/3 at 10×, keep 1/3 as moonbag',
      returns: {
        '5×': inv * 5 * (1/3),
        '10×': inv * 10 * (1/3),
        'moonbag': inv * (1/3),
        total: inv * 5 * (1/3) + inv * 10 * (1/3) + inv * (1/3),
      },
      outcome: 'Secured profit at 5× and 10×. Still have exposure if it 100×. This is the sustainable professional strategy.',
      risk: 'low',
    },
    moonbag: {
      label: '🌙 Moonbag Hold',
      desc: 'Sell 80% at 5×, keep 20% forever',
      returns: {
        '5×': inv * 5 * 0.8,
        'moonbag': inv * 0.2,
        total: inv * 5 * 0.8 + inv * 0.2,
      },
      outcome: 'Secured most profit early. Small moonbag costs nothing — if it 100×, you still win. Smart risk management.',
      risk: 'low',
    },
    greedy: {
      label: '🎰 Hold for 100×',
      desc: 'Never sell — waiting for the moonshot',
      returns: {
        'most common outcome': -inv,
        total: -inv,
      },
      outcome: 'Most tokens never reach 100×. 97% of pump.fun tokens go to zero. If it reached 5× and you held, you often exit at -90% from peak.',
      risk: 'high',
    },
  };

  const handleSubmit = () => {
    if (!strategy) return;
    setSubmitted(true);
    setOutcome(strategies[strategy].outcome);
  };

  const sel = strategy ? strategies[strategy] : null;

  return (
    <SimShell icon="🚪" title="Exit Strategy Builder" subtitle="Your token is 5×ing. What do you do? Most losses happen from not having a plan before entry.">
      <Card>
        <Text style={s.fl}>YOUR POSITION</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={s.fl}>ENTRY MC</Text>
            <TextInput style={[s.inp, { marginBottom: 0 }]} value={entryMC} onChangeText={setEntryMC}
              keyboardType="decimal-pad" placeholder="50000" placeholderTextColor={Colors.textMuted}
              editable={!submitted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fl}>INVESTMENT ($)</Text>
            <TextInput style={[s.inp, { marginBottom: 0 }]} value={investment} onChangeText={setInvestment}
              keyboardType="decimal-pad" placeholder="500" placeholderTextColor={Colors.textMuted}
              editable={!submitted} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, flexWrap: 'wrap' }}>
          {[['5×', x5mc], ['10×', x10mc], ['25×', x25mc]].map(([label, mc]) => (
            <View key={label as string} style={{ backgroundColor: Colors.accentSoft, borderRadius: Radius.sm, padding: Spacing.sm, flex: 1 }}>
              <Text style={{ fontWeight: '900', color: Colors.accent, textAlign: 'center' }}>{label}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSoft, textAlign: 'center' }}>${Number(mc).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Text style={[s.fl, { marginTop: 0 }]}>CHOOSE YOUR EXIT STRATEGY</Text>
      {(Object.entries(strategies) as [keyof typeof strategies, typeof strategies.thirds][]).map(([k, v]) => (
        <TouchableOpacity key={k} disabled={submitted} onPress={() => setStrategy(k)}
          style={[{ padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2,
            borderColor: strategy === k ? (v.risk === 'high' ? Colors.red : Colors.accent) : Colors.border,
            backgroundColor: strategy === k ? (v.risk === 'high' ? '#fee2e2' : Colors.accentSoft) : Colors.card }]}>
          <Text style={{ fontWeight: '900', color: Colors.text }}>{v.label}</Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 2 }}>{v.desc}</Text>
        </TouchableOpacity>
      ))}

      {!submitted ? (
        <PBtn label="Execute Strategy →" onPress={handleSubmit} disabled={!strategy} />
      ) : (
        <>
          <Res ok={strategy !== 'greedy'} msg={outcome || ''} />
          {sel && (
            <Card>
              <Text style={s.fl}>SIMULATION RETURNS</Text>
              {Object.entries(sel.returns).map(([label, amount]) => (
                <View key={label} style={s.row}>
                  <Text style={s.rk}>{label}</Text>
                  <Text style={[s.rv, { color: Number(amount) > 0 ? Colors.green : Colors.red, fontWeight: '800' }]}>
                    {Number(amount) > 0 ? '+' : ''}${Number(amount).toFixed(0)}
                  </Text>
                </View>
              ))}
            </Card>
          )}
          <Card>
            <Text style={s.fl}>PROFESSIONAL RULES</Text>
            <Text style={s.blt}>• Decide your exit before you enter — never in the moment</Text>
            <Text style={s.blt}>• Selling half at 2× = free position (you can't lose)</Text>
            <Text style={s.blt}>• Moonbags are small — never more than 20% of position</Text>
            <Text style={s.blt}>• Volume collapse = exit signal regardless of price</Text>
          </Card>
          <PBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L97 — memePortfolioSize ───────────────────────────────────────────────────
export function MemePortfolioSizeSim({ onComplete, onSkip }: SimProps) {
  const [portfolio, setPortfolio] = useState('10000');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const port = parseFloat(portfolio) || 10000;
  const rules = {
    conservative: { meme: 5,  defi: 20, btcEth: 60, stables: 15, maxPerMeme: 1 },
    moderate:     { meme: 15, defi: 30, btcEth: 45, stables: 10, maxPerMeme: 3 },
    aggressive:   { meme: 30, defi: 35, btcEth: 30, stables: 5,  maxPerMeme: 5 },
  };
  const rule = rules[riskTolerance];

  const userMeme     = parseFloat(allocations.meme || '0');
  const userBtcEth   = parseFloat(allocations.btcEth || '0');
  const userStables  = parseFloat(allocations.stables || '0');
  const total        = userMeme + userBtcEth + parseFloat(allocations.defi || '0') + userStables;

  const mistakes: string[] = [];
  if (userMeme > rule.meme + 5) mistakes.push(`Meme allocation ${userMeme}% exceeds recommended ${rule.meme}%`);
  if (userStables < rule.stables - 5) mistakes.push(`Stablecoins ${userStables}% too low — emergency buffer`);
  if (total > 105 || total < 95) mistakes.push(`Allocations total ${total.toFixed(0)}% — should sum to 100%`);

  return (
    <SimShell icon="⚖️" title="Memecoin Portfolio Sizing" subtitle="The most important skill in memecoin trading: how much of your portfolio to risk.">
      <Card>
        <Text style={s.fl}>TOTAL PORTFOLIO ($)</Text>
        <TextInput style={s.inp} value={portfolio} onChangeText={setPortfolio} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!checked} />
        <Text style={s.fl}>RISK TOLERANCE</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {(['conservative', 'moderate', 'aggressive'] as const).map(r => (
            <TouchableOpacity key={r} disabled={checked} onPress={() => setRiskTolerance(r)}
              style={[{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                borderColor: riskTolerance === r ? Colors.accent : Colors.border,
                backgroundColor: riskTolerance === r ? Colors.accentSoft : Colors.card }]}>
              <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: riskTolerance === r ? Colors.accent : Colors.text }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={{ borderColor: Colors.accent }}>
        <Text style={s.fl}>RECOMMENDED ({riskTolerance.toUpperCase()})</Text>
        {[
          ['Memecoins', rule.meme, '#7c3aed'],
          ['DeFi/Altcoins', rule.defi, '#0052ff'],
          ['BTC + ETH', rule.btcEth, '#f7931a'],
          ['Stables (emergency buffer)', rule.stables, Colors.green],
        ].map(([label, pct, color]) => (
          <View key={label as string} style={{ marginBottom: Spacing.sm }}>
            <View style={s.row}>
              <Text style={s.rk}>{label}</Text>
              <Text style={{ fontWeight: '800', color: color as string }}>{pct}% — ${(port * Number(pct) / 100).toFixed(0)}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 99, backgroundColor: color as string, width: `${pct}%` as any }} />
            </View>
          </View>
        ))}
        <Text style={{ fontSize: FontSize.xs, color: Colors.red, fontWeight: '700', marginTop: Spacing.sm }}>
          Max per individual meme token: {rule.maxPerMeme}% (${(port * rule.maxPerMeme / 100).toFixed(0)})
        </Text>
      </Card>

      <Text style={s.fl}>BUILD YOUR ALLOCATION (%)</Text>
      {[['meme', 'Memecoins %'], ['defi', 'DeFi/Alts %'], ['btcEth', 'BTC + ETH %'], ['stables', 'Stables %']].map(([key, label]) => (
        <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Text style={{ fontSize: FontSize.sm, color: Colors.text, fontWeight: '600', width: 120 }}>{label}</Text>
          <TextInput style={[s.inp, { flex: 1, marginBottom: 0, fontSize: FontSize.md }]}
            value={allocations[key] || ''} onChangeText={v => setAllocations(a => ({ ...a, [key]: v }))}
            keyboardType="decimal-pad" placeholder="%" placeholderTextColor={Colors.textMuted} editable={!checked} />
        </View>
      ))}

      {total > 0 && <Text style={{ fontSize: FontSize.xs, color: Math.abs(total - 100) < 5 ? Colors.green : Colors.red, fontWeight: '700' }}>
        Total: {total.toFixed(0)}% {Math.abs(total - 100) < 5 ? '✅' : '— must equal 100%'}
      </Text>}

      {!checked ? (
        <PBtn label="Check My Allocation →" onPress={() => setChecked(true)} disabled={Object.keys(allocations).length < 4} />
      ) : (
        <>
          <Res ok={mistakes.length === 0} msg={mistakes.length === 0
            ? `Perfect allocation for ${riskTolerance} risk. At most ${rule.maxPerMeme}% per individual token — protects from any single rug.`
            : `Issues: ${mistakes.join(' · ')}`} />
          <PBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L105 — memecoinBoss ───────────────────────────────────────────────────────
export function MemecoinBossSim({ onComplete, onSkip }: SimProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [s1Answer, setS1Answer] = useState<string | null>(null);
  const [s1Done, setS1Done] = useState(false);
  const [s2Verdict, setS2Verdict] = useState<'rug' | 'safe' | null>(null);
  const [s2Done, setS2Done] = useState(false);
  const [s3Strategy, setS3Strategy] = useState<'thirds' | 'greedy' | null>(null);
  const [allDone, setAllDone] = useState(false);

  const s1Score = s1Answer === 'bundled';
  const s2Score = s2Verdict === 'rug'; // MOON100X is a rug
  const s3Score = s3Strategy === 'thirds';
  const total = [s1Score, s2Score, s3Score].filter(Boolean).length;

  return (
    <SimShell icon="⭐" title="BOSS: Memecoin Markets" subtitle="Three stages — apply everything from Island 9.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {[1, 2, 3].map(n => (
          <View key={n} style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, alignItems: 'center',
            backgroundColor: stage === n ? Colors.accent : n < stage ? '#d1fae5' : Colors.border }}>
            <Text style={{ fontWeight: '800', color: stage === n ? '#fff' : n < stage ? Colors.green : Colors.textSoft, fontSize: FontSize.xs }}>
              {n < stage ? '✓' : `Stage ${n}`}
            </Text>
          </View>
        ))}
      </View>

      {stage === 1 && !s1Done && (
        <>
          <Card>
            <Text style={[s.fl, { color: Colors.accent }]}>STAGE 1 — BUNDLE DETECTION</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
              Three wallets buy in the same transaction block (block #1) at token launch. Two are connected by prior transactions. This is:
            </Text>
          </Card>
          {[{ id: 'bundled', l: '🚨 A coordinated bundle — insider wallets' }, { id: 'organic', l: '✅ Normal early buying — organic traders' }].map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => setS1Answer(opt.id)}
              style={[{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2,
                borderColor: s1Answer === opt.id ? Colors.accent : Colors.border,
                backgroundColor: s1Answer === opt.id ? Colors.accentSoft : Colors.card }]}>
              <Text style={{ fontWeight: '800', color: Colors.text }}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
          <PBtn label="Lock In →" onPress={() => setS1Done(true)} disabled={!s1Answer} />
        </>
      )}

      {stage === 1 && s1Done && (
        <>
          <Res ok={s1Score} msg={s1Score ? 'Correct! Same-block buys from linked wallets = coordinated bundle. Use Bubblemaps.' : 'Incorrect — this is a coordinated bundle. Same block + linked wallets = insider coordination.'} />
          <PBtn label="Stage 2 →" onPress={() => setStage(2)} />
        </>
      )}

      {stage === 2 && !s2Done && (
        <>
          <Card>
            <Text style={[s.fl, { color: Colors.accent }]}>STAGE 2 — TOKEN SAFETY CHECK</Text>
            <Text style={{ fontWeight: '800', color: Colors.text, fontSize: FontSize.lg, marginBottom: Spacing.md }}>MOON100X</Text>
            <View style={{ gap: 4 }}>
              {[
                { label: 'FDV / MC ratio', value: '100× (90% tokens locked)', bad: true },
                { label: 'LP', value: 'UNLOCKED', bad: true },
                { label: 'Mint authority', value: 'ACTIVE', bad: true },
                { label: 'Honeypot', value: 'DETECTED', bad: true },
                { label: 'Dev wallet', value: '42% of supply', bad: true },
              ].map(({ label, value, bad }) => (
                <View key={label} style={[s.row, { backgroundColor: bad ? '#fff0f0' : '#f0fff4', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm }]}>
                  <Text style={[s.rk, { color: bad ? Colors.red : Colors.green }]}>{label}</Text>
                  <Text style={[s.rv, { color: bad ? Colors.red : Colors.green, fontWeight: '800' }]}>{value}</Text>
                </View>
              ))}
            </View>
          </Card>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[{ v: 'rug' as const, l: '💀 INSTANT RUG' }, { v: 'safe' as const, l: '✅ SAFE TO BUY' }].map(({ v, l }) => (
              <TouchableOpacity key={v} onPress={() => setS2Verdict(v)}
                style={[{ flex: 1, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                  borderColor: s2Verdict === v ? Colors.accent : Colors.border,
                  backgroundColor: s2Verdict === v ? Colors.accentSoft : Colors.card }]}>
                <Text style={{ fontWeight: '800', color: Colors.text }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PBtn label="Submit Verdict →" onPress={() => setS2Done(true)} disabled={!s2Verdict} />
        </>
      )}

      {stage === 2 && s2Done && (
        <>
          <Res ok={s2Score} msg={s2Score ? 'Correct — 5 red flags, every one critical. This token would drain your wallet.' : 'Incorrect — MOON100X has ALL five critical red flags simultaneously. Never buy.'} />
          <PBtn label="Stage 3 →" onPress={() => setStage(3)} />
        </>
      )}

      {stage === 3 && !allDone && (
        <>
          <Card>
            <Text style={[s.fl, { color: Colors.accent }]}>STAGE 3 — EXIT EXECUTION</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
              Your $500 memecoin position is up 5×. Volume is still rising. What do you do?
            </Text>
          </Card>
          {[
            { id: 'thirds', l: '📊 Sell 1/3 now, keep 2/3 with staged exits' },
            { id: 'greedy', l: '🎰 Hold everything — waiting for 100×' },
          ].map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => setS3Strategy(opt.id as any)}
              style={[{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2,
                borderColor: s3Strategy === opt.id ? Colors.accent : Colors.border,
                backgroundColor: s3Strategy === opt.id ? Colors.accentSoft : Colors.card }]}>
              <Text style={{ fontWeight: '800', color: Colors.text }}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
          <PBtn label="Execute →" onPress={() => setAllDone(true)} disabled={!s3Strategy} />
        </>
      )}

      {allDone && (
        <>
          <Card style={{ borderColor: total >= 2 ? Colors.green : Colors.red }}>
            <Text style={{ textAlign: 'center', fontSize: 18 }}>{total >= 2 ? '🏆' : '📚'}</Text>
            <Text style={{ fontWeight: '800', textAlign: 'center', fontSize: FontSize.xl, color: total >= 2 ? Colors.green : Colors.red, marginTop: Spacing.sm }}>
              {total >= 2 ? 'MEMECOIN BOSS DEFEATED!' : 'Review & Retry'}
            </Text>
            <Text style={{ textAlign: 'center', color: Colors.textSoft }}>{total}/3 stages passed</Text>
          </Card>
          <Card>
            <Text style={s.fl}>ISLAND 9 MASTERY</Text>
            <Text style={s.blt}>✅ Bundle detection: same block + linked wallets = coordinated</Text>
            <Text style={s.blt}>✅ Token safety: all 5 checks before entry (LP, mint, honeypot, FDV, dev%)</Text>
            <Text style={s.blt}>✅ Exit strategy: staged selling preserves gains, moonbag costs nothing</Text>
          </Card>
          <PBtn label="Return to Island Map →" onPress={onComplete} />
        </>
      )}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 10 — AIRDROP ARCHIPELAGO
// ═════════════════════════════════════════════════════════════════════════════

// ── L107 — airdropEligibility ─────────────────────────────────────────────────
export function AirdropEligibilitySim({ onComplete, onSkip }: SimProps) {
  const [walletAge, setWalletAge] = useState(6);
  const [txCount, setTxCount] = useState(50);
  const [protocols, setProtocols] = useState(3);
  const [tvlUsd, setTvlUsd] = useState(500);
  const [checked, setChecked] = useState(false);

  const protocol = {
    name: 'HypothExchange',
    criteria: [
      { label: 'Wallet age', req: '≥ 3 months', met: walletAge >= 3 },
      { label: 'Transaction count', req: '≥ 30 txs', met: txCount >= 30 },
      { label: 'Protocols used', req: '≥ 2 unique protocols', met: protocols >= 2 },
      { label: 'TVL history', req: '≥ $100 at some point', met: tvlUsd >= 100 },
      { label: 'Not a new wallet', req: 'First tx before snapshot', met: walletAge >= 1 },
    ],
  };

  const score = protocol.criteria.filter(c => c.met).length;
  const qualifies = score >= 4;
  const tier = score === 5 ? 'Tier 1 (Max allocation)' : score === 4 ? 'Tier 2 (Reduced allocation)' : score === 3 ? 'Tier 3 (Minimal)' : 'Not eligible';

  return (
    <SimShell icon="🎯" title="Check Airdrop Eligibility" subtitle="Run your simulated wallet through a real airdrop eligibility checker.">
      <Card>
        <Text style={s.fl}>YOUR WALLET HISTORY</Text>
        {[
          { label: 'Wallet age (months)', value: walletAge, set: setWalletAge, min: 0, max: 36, step: 1 },
          { label: 'Transaction count', value: txCount, set: setTxCount, min: 0, max: 200, step: 10 },
          { label: 'Unique protocols used', value: protocols, set: setProtocols, min: 0, max: 15, step: 1 },
          { label: 'Peak TVL deposited ($)', value: tvlUsd, set: setTvlUsd, min: 0, max: 10000, step: 100 },
        ].map(({ label, value, set, min, max, step }) => (
          <View key={label} style={{ marginBottom: Spacing.md }}>
            <View style={s.row}>
              <Text style={s.rk}>{label}</Text>
              <Text style={{ fontWeight: '900', color: Colors.accent }}>{value}{label.includes('$') ? '' : label.includes('month') ? ' mo' : ''}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <TouchableOpacity onPress={() => set(v => Math.max(min, v - step))} disabled={checked}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '800', color: Colors.text }}>−</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 99, alignSelf: 'center', overflow: 'hidden' }}>
                <View style={{ height: 8, borderRadius: 99, backgroundColor: Colors.accent, width: `${((value - min) / (max - min)) * 100}%` as any }} />
              </View>
              <TouchableOpacity onPress={() => set(v => Math.min(max, v + step))} disabled={checked}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '800', color: Colors.text }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Card>

      {checked && (
        <>
          <Card>
            <Text style={s.fl}>{protocol.name} ELIGIBILITY CHECK</Text>
            {protocol.criteria.map(c => (
              <View key={c.label} style={[s.row, { paddingVertical: Spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: Colors.text, fontSize: FontSize.sm }}>{c.label}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{c.req}</Text>
                </View>
                <Text style={{ fontWeight: '800', color: c.met ? Colors.green : Colors.red, fontSize: FontSize.lg }}>{c.met ? '✅' : '❌'}</Text>
              </View>
            ))}
            <View style={{ padding: Spacing.md, backgroundColor: qualifies ? '#d1fae5' : '#fee2e2', borderRadius: Radius.md, marginTop: Spacing.sm }}>
              <Text style={{ fontWeight: '800', color: qualifies ? Colors.green : Colors.red, textAlign: 'center' }}>
                {tier} — {score}/5 criteria met
              </Text>
            </View>
          </Card>
          <Card>
            <Text style={s.fl}>TO IMPROVE YOUR ELIGIBILITY</Text>
            {protocol.criteria.filter(c => !c.met).map(c => (
              <Text key={c.label} style={s.blt}>• {c.label}: needs {c.req}</Text>
            ))}
          </Card>
          <PBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      {!checked && <PBtn label="Check Eligibility →" onPress={() => setChecked(true)} />}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L109 — sybilDetector ──────────────────────────────────────────────────────
export function SybilDetectorSim({ onComplete, onSkip }: SimProps) {
  const wallets = [
    {
      id: 'A', address: '0xA1b2...1234',
      signals: ['Same funding source as B and C', 'All three created same day', 'Identical transaction patterns', 'Gas refill from same exchange'],
      isSybil: true,
    },
    {
      id: 'B', address: '0xB3c4...5678',
      signals: ['Same funding source as A and C', 'Identical 14-day activity rhythm', 'Similar token amounts and timing', 'IP-linked to A (graph analysis)'],
      isSybil: true,
    },
    {
      id: 'C', address: '0xC5d6...9012',
      signals: ['2-year old wallet', 'Used 8 different protocols', 'Varied transaction amounts', 'Multiple funding sources'],
      isSybil: false,
    },
    {
      id: 'D', address: '0xD7e8...3456',
      signals: ['1.5-year history', 'Participated in 3 prior airdrops (legitimately)', 'Organic DeFi usage across chains', 'Different IP + device fingerprint'],
      isSybil: false,
    },
  ];

  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = wallets.filter(w => answers[w.id] === w.isSybil).length;
  const passed = score >= 3;

  return (
    <SimShell icon="🕸️" title="Sybil Wallet Detector" subtitle="Protocols use graph analysis and on-chain behaviour to exclude Sybil wallets from airdrops.">
      <Card>
        <Text style={s.h2}>Sybil detection looks for: shared funding sources, identical timing patterns, same device fingerprints, and connected wallet graphs. ONE Sybil wallet = ALL linked wallets zeroed.</Text>
      </Card>
      {wallets.map(w => {
        const chosen = answers[w.id];
        const isCorrect = chosen === w.isSybil;
        return (
          <Card key={w.id} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm }}>Wallet {w.id}: {w.address}</Text>
            {w.signals.map((sig, i) => (
              <Text key={i} style={{ fontSize: FontSize.xs, color: Colors.text, lineHeight: 18, marginBottom: 2 }}>
                {checked && w.isSybil ? '🚩' : '•'} {sig}
              </Text>
            ))}
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              {[{ v: true, l: '🚨 Sybil' }, { v: false, l: '✅ Genuine' }].map(({ v, l }) => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCorrect)       { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCorrect)      { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && v === w.isSybil){ bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [w.id]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        );
      })}
      {!checked
        ? <PBtn label="Submit Analysis →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < wallets.length} />
        : <><Res ok={passed} msg={`${score}/4 — Wallets A and B were Sybil (shared funding, identical patterns). C and D are genuine users with organic history.`} />
          {passed ? <PBtn label="Continue →" onPress={onComplete} /> : <PBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L116 — airdropScamDrill ────────────────────────────────────────────────────
export function AirdropScamDrillSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    { id: 0, url: 'arbitrum-airdrop-claim.io/wallet-connect', isScam: true, clue: 'Arbitrum\'s official claim was at claim.arbitrum.foundation — not a .io domain with hyphens.' },
    { id: 1, url: 'claim.arbitrum.foundation', isScam: false, clue: 'This is the real Arbitrum airdrop page. Official subdomain of the foundation.' },
    { id: 2, message: 'DM from @Uniswap_Official: "You\'ve been selected for a $4,500 UNI airdrop. Verify your wallet here: uni-verification.com"', isScam: true, clue: 'Uniswap never DMed users. Unsolicited DMs with wallet links are always scams.' },
    { id: 3, message: 'Tweet from Uniswap verified account: "The UNI airdrop snapshot is complete. No action required — tokens will arrive within 24 hours."', isScam: false, clue: 'Official announcement from verified account with no link and no wallet action required.' },
    { id: 4, url: 'blur.io/airdrop', isScam: false, clue: 'blur.io is Blur\'s official domain. Airdrop page on the official domain is legitimate.' },
    { id: 5, url: 'blur-airdrop-season2.xyz', isScam: true, clue: 'Blur\'s domain is blur.io. Any other domain claiming to be Blur is a phishing site.' },
  ];

  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter(sc => answers[sc.id] === sc.isScam).length;
  const passed = score >= 5;

  return (
    <SimShell icon="🎣" title="Airdrop Scam Drill" subtitle="Before connecting your wallet to any airdrop claim, run this checklist. One wrong click = drained.">
      {scenarios.map(sc => {
        const chosen = answers[sc.id];
        const isCorrect = chosen === sc.isScam;
        return (
          <Card key={sc.id} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            {sc.url && <Text style={{ fontFamily: 'monospace', fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md }}>{sc.url}</Text>}
            {sc.message && <Text style={{ fontSize: FontSize.sm, color: Colors.text, fontStyle: 'italic', marginBottom: Spacing.md, lineHeight: 20 }}>"{sc.message}"</Text>}
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[{ v: true, l: '⚠️ SCAM' }, { v: false, l: '✅ LEGIT' }].map(({ v, l }) => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCorrect)        { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCorrect)       { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && v === sc.isScam) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [sc.id]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {sc.clue}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <><Res ok={passed} msg={passed ? `${score}/6 — Excellent scam detection. Rules: official domain only, no DMs, no wallet connection required for legitimate claims.` : `${score}/6 — Key patterns: official subdomain (.foundation, .io) vs fake domains, no DMs from protocols, no "verify" steps for real airdrops.`} />
          {passed ? <PBtn label="Continue →" onPress={onComplete} /> : <PBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L118 — airdropExpectedValue ───────────────────────────────────────────────
export function AirdropExpectedValueSim({ onComplete, onSkip }: SimProps) {
  const [gasCost, setGasCost] = useState('120');
  const [timeHours, setTimeHours] = useState('40');
  const [hourlyRate, setHourlyRate] = useState('25');
  const [lowEst, setLowEst] = useState('200');
  const [midEst, setMidEst] = useState('800');
  const [highEst, setHighEst] = useState('3000');
  const [probLow, setProbLow] = useState('60');
  const [probMid, setProbMid] = useState('30');
  const [confirmed, setConfirmed] = useState(false);

  const gas = parseFloat(gasCost) || 0;
  const time = parseFloat(timeHours) || 0;
  const rate = parseFloat(hourlyRate) || 0;
  const totalCost = gas + (time * rate);

  const pL = parseFloat(probLow) / 100;
  const pM = parseFloat(probMid) / 100;
  const pH = 1 - pL - pM;
  const ev = pL * parseFloat(lowEst) + pM * parseFloat(midEst) + pH * parseFloat(highEst);
  const roi = ((ev - totalCost) / totalCost * 100).toFixed(0);
  const isPositive = ev > totalCost;

  return (
    <SimShell icon="🧮" title="Airdrop Expected Value Calculator" subtitle="Before committing time and gas, calculate realistic EV. Most airdrop farming is a losing strategy.">
      <Card>
        <Text style={s.fl}>YOUR COSTS</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={s.fl}>Gas spend ($)</Text>
            <TextInput style={s.inp} value={gasCost} onChangeText={setGasCost} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!confirmed} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fl}>Time (hours)</Text>
            <TextInput style={s.inp} value={timeHours} onChangeText={setTimeHours} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!confirmed} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.fl}>$/hour</Text>
            <TextInput style={s.inp} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!confirmed} />
          </View>
        </View>
        <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm }]}>
          <Text style={{ fontWeight: '800' }}>Total cost</Text>
          <Text style={{ fontWeight: '800', color: Colors.red, fontSize: FontSize.lg }}>${totalCost.toFixed(0)}</Text>
        </View>
      </Card>

      <Card>
        <Text style={s.fl}>AIRDROP VALUE SCENARIOS</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {([
            ['Low ($)', lowEst, setLowEst, probLow, setProbLow],
            ['Mid ($)', midEst, setMidEst, probMid, setProbMid],
            ['High ($)', highEst, setHighEst, null, null],
          ] as [string, string, (value: string) => void, string | null, ((value: string) => void) | null][]).map(([label, val, setVal, prob, setProb]) => (
            <View key={label as string} style={{ flex: 1 }}>
              <Text style={s.fl}>{label}</Text>
              <TextInput style={s.inp} value={val as string} onChangeText={setVal as any} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!confirmed} />
              {setProb && <><Text style={s.fl}>Prob %</Text>
                <TextInput style={s.inp} value={prob as string} onChangeText={setProb as any} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!confirmed} /></>}
              {!setProb && <><Text style={s.fl}>Prob %</Text>
                <Text style={[s.inp, { color: Colors.textSoft, fontWeight: '600' }]}>
                  {Math.max(0, 100 - parseFloat(probLow) - parseFloat(probMid)).toFixed(0)}%
                </Text></>}
            </View>
          ))}
        </View>
      </Card>

      {!confirmed ? (
        <PBtn label="Calculate EV →" onPress={() => setConfirmed(true)} />
      ) : (
        <>
          <Card style={{ borderColor: isPositive ? Colors.green : Colors.red }}>
            <Text style={s.fl}>EXPECTED VALUE ANALYSIS</Text>
            <View style={s.row}><Text style={s.rk}>Expected airdrop value</Text><Text style={[s.rv, { color: Colors.accent, fontWeight: '800' }]}>${ev.toFixed(0)}</Text></View>
            <View style={s.row}><Text style={s.rk}>Your total cost</Text><Text style={[s.rv, { color: Colors.red }]}>${totalCost.toFixed(0)}</Text></View>
            <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
              <Text style={{ fontWeight: '800' }}>Net EV</Text>
              <Text style={{ fontWeight: '800', fontSize: FontSize.xl, color: isPositive ? Colors.green : Colors.red }}>
                {isPositive ? '+' : ''}${(ev - totalCost).toFixed(0)} ({roi}% ROI)
              </Text>
            </View>
          </Card>
          <Res ok={isPositive} msg={isPositive
            ? `Positive EV — this campaign is worth pursuing if the protocol is legitimate. Track time costs rigorously.`
            : `Negative EV — you'd be better off putting the $${totalCost.toFixed(0)} directly into ETH. Most airdrop farmers lose money when opportunity cost is included.`} />
          <Card>
            <Text style={s.fl}>THE HONEST MATH ON AIRDROP FARMING</Text>
            <Text style={s.blt}>• Most airdrops pay $50–$500 to participants who spend 20–50 hours</Text>
            <Text style={s.blt}>• Gas + time cost at $25/hr for 40 hrs = $1,120 minimum investment</Text>
            <Text style={s.blt}>• The top 1% of farmers get the big allocations — not average participants</Text>
            <Text style={s.blt}>• Genuine protocol use beats farming — and you enjoy it more</Text>
          </Card>
          <PBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L120 — airdropBoss ────────────────────────────────────────────────────────
export function AirdropBossSim({ onComplete, onSkip }: SimProps) {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const correct = { q1: 'legitimate', q2: 'sybil', q3: 'ev_negative' };
  const answers = { q1, q2, q3 };
  const score = Object.entries(correct).filter(([k, v]) => (answers as any)[k] === v).length;

  return (
    <SimShell icon="⭐" title="BOSS: Airdrop Archipelago" subtitle="Three boss questions covering the whole island.">
      <Card>
        <Text style={[s.fl, { color: Colors.accent }]}>Q1 — FARMING STRATEGY</Text>
        <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
          You use a DEX every week for genuine trading, provide LP, and vote on governance. The protocol announces an airdrop based on past activity. Your approach was:
        </Text>
        {[{ id: 'legitimate', l: '✅ Legitimate use — maximise allocation' }, { id: 'sybil_risk', l: '⚠️ At risk of Sybil detection' }].map(opt => (
          <TouchableOpacity key={opt.id} disabled={done} onPress={() => setQ1(opt.id)}
            style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, borderColor: q1 === opt.id ? Colors.accent : Colors.border, backgroundColor: q1 === opt.id ? Colors.accentSoft : Colors.card }}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{opt.l}</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Card>
        <Text style={[s.fl, { color: Colors.accent }]}>Q2 — SYBIL DETECTION</Text>
        <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
          Your friend funded 5 wallets from the same Coinbase account on the same day and ran identical transactions. The airdrop team runs graph analysis. Their outcome will be:
        </Text>
        {[{ id: 'sybil', l: '💀 All 5 wallets zeroed — Sybil excluded' }, { id: 'max_allocation', l: '🚀 5× the allocation — multiplied rewards' }].map(opt => (
          <TouchableOpacity key={opt.id} disabled={done} onPress={() => setQ2(opt.id)}
            style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, borderColor: q2 === opt.id ? Colors.accent : Colors.border, backgroundColor: q2 === opt.id ? Colors.accentSoft : Colors.card }}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{opt.l}</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Card>
        <Text style={[s.fl, { color: Colors.accent }]}>Q3 — EXPECTED VALUE</Text>
        <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
          Farming a new L2 will cost $200 in gas and 60 hours of time (your opportunity cost: $30/hr = $1,800). Expected airdrop: $400 median. This campaign is:
        </Text>
        {[{ id: 'ev_positive', l: '✅ Positive EV — worth it' }, { id: 'ev_negative', l: '❌ Negative EV — better alternatives exist' }].map(opt => (
          <TouchableOpacity key={opt.id} disabled={done} onPress={() => setQ3(opt.id)}
            style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, borderColor: q3 === opt.id ? Colors.accent : Colors.border, backgroundColor: q3 === opt.id ? Colors.accentSoft : Colors.card }}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{opt.l}</Text>
          </TouchableOpacity>
        ))}
      </Card>

      {!done ? (
        <PBtn label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={!q1 || !q2 || !q3} />
      ) : (
        <>
          <Card style={{ borderColor: score >= 2 ? Colors.green : Colors.red }}>
            <Text style={{ textAlign: 'center', fontSize: 18 }}>{score >= 2 ? '🏆' : '📚'}</Text>
            <Text style={{ fontWeight: '800', textAlign: 'center', fontSize: FontSize.xl, color: score >= 2 ? Colors.green : Colors.red }}>
              {score >= 2 ? 'AIRDROP BOSS CLEARED!' : 'Review the Lessons'}
            </Text>
            <Text style={{ textAlign: 'center', color: Colors.textSoft }}>{score}/3 correct</Text>
          </Card>
          <Card>
            <Text style={s.fl}>ANSWERS</Text>
            <Text style={s.blt}>Q1: ✅ Legitimate use — genuine participation = highest allocation tier</Text>
            <Text style={s.blt}>Q2: 💀 All zeroed — graph analysis identifies Sybil clusters by funding source</Text>
            <Text style={s.blt}>Q3: ❌ Negative EV — total cost $2,000, expected return $400. EV = -$1,600</Text>
          </Card>
          <PBtn label="Return to Island Map →" onPress={onComplete} />
        </>
      )}
      <GBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
