/**
 * island14_16_17_18SimulatorDefs.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Island 14 — Alt-Chain Ecosystems    (L211–L230, various chains)
 * Island 16 — Final Frontier          (L196–L210, Ethereum Sepolia)
 * Island 17 — Security & Research     (L231–L240, Ethereum Sepolia)
 * Island 18 — Advanced Crypto (gaps)  (L121–L135, Ethereum Sepolia)
 *
 * Add to SimulatorCard.tsx SIMULATORS map:
 *   polygonVsArbitrum    → L213
 *   avalancheSubnet      → L215
 *   abstractAASim        → L217
 *   chainEvaluator       → L219
 *   l2FeeWars            → L221
 *   altChainBoss         → L226
 *   zkSnarksVsStarks     → L197
 *   rwaEvaluator         → L199
 *   depinSimulator       → L202
 *   aiAgentSim           → L204
 *   intentArchitecture   → L207
 *   finalFrontierBoss    → L210
 *   walletDrainerDrill   → L232
 *   flashbotsProtect     → L234
 *   onchainResearchSim   → L236
 *   opsecBuilder         → L238
 *   securityBoss         → L240
 *   stablecoinRisk       → L122
 *   deltaNeutral         → L127
 *   advancedCryptoBoss   → L135
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

interface SimProps { onComplete: () => void; onSkip: () => void; }

// ── Shared UI ─────────────────────────────────────────────────────────────────
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
const PB = ({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
    style={[{ backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' }, disabled && { opacity: 0.4 }]}>
    <Text style={{ color: '#fff', fontSize: FontSize.lg, fontWeight: '800' }}>{label}</Text>
  </TouchableOpacity>
);
const GB = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
    <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' }}>{label}</Text>
  </TouchableOpacity>
);
const Res = ({ ok, msg }: { ok: boolean; msg: string }) => (
  <View style={{ flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, backgroundColor: ok ? '#d1fae5' : '#fee2e2', borderColor: ok ? Colors.green : Colors.red }}>
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
  inp: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, backgroundColor: Colors.card },
});

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 14 — ALT-CHAIN ECOSYSTEMS
// ═════════════════════════════════════════════════════════════════════════════

// ── L213 — polygonVsArbitrum ───────────────────────────────────────────────────
export function PolygonVsArbitrumSim({ onComplete, onSkip }: SimProps) {
  const comparisons = [
    {
      useCase: 'Enterprise needs a private, high-throughput subnet with custom rules',
      correct: 'Polygon',
      reason: 'Polygon CDK enables custom zkEVM chains for enterprises. Arbitrum Orbit also supports this but Polygon has longer enterprise track record (Shopify, Reddit, Starbucks).',
    },
    {
      useCase: 'DeFi protocol needs maximum existing liquidity and composability',
      correct: 'Arbitrum',
      reason: 'Arbitrum has $3B+ TVL — the deepest DeFi ecosystem of any L2. GMX, Camelot, Radiant, Pendle all live here.',
    },
    {
      useCase: 'Smart contracts written in Rust (not Solidity)',
      correct: 'Arbitrum',
      reason: 'Arbitrum Stylus supports Rust, C, and C++ smart contracts — unique capability no other major L2 offers.',
    },
    {
      useCase: 'Low-cost NFT minting at massive scale for gaming',
      correct: 'Polygon',
      reason: 'Polygon PoS is used by Reddit (Collectible Avatars), Starbucks, and major gaming studios for high-volume NFT operations.',
    },
    {
      useCase: 'New L2 chain that inherits Ethereum security with full EVM equivalence',
      correct: 'Polygon',
      reason: 'Polygon zkEVM (Type 1) achieves full EVM equivalence. Polygon CDK lets anyone deploy their own zkEVM chain in the AggLayer.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = comparisons.filter((c, i) => answers[i] === c.correct).length;

  return (
    <SimShell icon="⚔️" title="Polygon vs Arbitrum" subtitle="Each chain has a specific niche. Match the use case to the right L2.">
      {comparisons.map((c, i) => {
        const chosen = answers[i]; const isCorrect = chosen === c.correct;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{c.useCase}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['Polygon', 'Arbitrum'].map(chain => {
                const isCh = chosen === chain; const isCo = chain === c.correct;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={chain} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: chain }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm }}>{chain === 'Polygon' ? '🟣 Polygon' : '🔵 Arbitrum'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {c.reason}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PB label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < comparisons.length} />
        : <><Res ok={score >= 4} msg={`${score}/5 — Key: Arbitrum for DeFi TVL + Rust (Stylus). Polygon for enterprise/gaming + AggLayer zkEVM ecosystem.`} />
          <PB label="Continue →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L217 — abstractAASim ──────────────────────────────────────────────────────
export function AbstractAASim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [passkeyCreated, setPasskeyCreated] = useState(false);
  const [sessionKeySet, setSessionKeySet] = useState(false);

  return (
    <SimShell icon="🔮" title="Abstract — Native Account Abstraction" subtitle="Experience Abstract's consumer-grade wallet UX — no seed phrase, session keys, gasless transactions.">
      {step === 0 && (
        <Card>
          <Text style={s.fl}>TRADITIONAL WALLET (THE PROBLEM)</Text>
          {['Generate 24-word seed phrase', 'Store it securely (offline)', 'Fund wallet with ETH for gas', 'Sign every single transaction', 'One mistake = permanent loss'].map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Text style={{ color: Colors.red }}>✗</Text>
              <Text style={{ flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 }}>{p}</Text>
            </View>
          ))}
          <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, marginTop: Spacing.sm }}>
            <Text style={{ fontWeight: '700', color: Colors.accent }}>Abstract solves all of this with native ERC-4337.</Text>
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Text style={s.fl}>STEP 1 — CREATE WITH PASSKEY (No seed phrase)</Text>
          <Text style={s.h2}>Abstract wallets are smart contracts. Your biometric IS the wallet — stored on your device, never leaves it.</Text>
          <TouchableOpacity onPress={() => setPasskeyCreated(true)} style={{ marginTop: Spacing.md, padding: Spacing.xl, borderRadius: Radius.xl,
            backgroundColor: passkeyCreated ? '#d1fae5' : Colors.accentSoft, alignItems: 'center', borderWidth: 2, borderColor: passkeyCreated ? Colors.green : Colors.accent }}>
            <Text style={{ fontSize: 18 }}>{passkeyCreated ? '✅' : '👆'}</Text>
            <Text style={{ fontWeight: '800', color: passkeyCreated ? Colors.green : Colors.accent, marginTop: Spacing.sm }}>
              {passkeyCreated ? 'Passkey Created — No Seed Phrase!' : 'Tap to Create with FaceID'}
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={s.fl}>STEP 2 — SET SESSION KEY (Gaming / App use)</Text>
          <Text style={s.h2}>Session keys let you authorize a game/app to sign transactions automatically for a limited time and amount — without signing each one.</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {[['App', 'Abstract Gaming'], ['Permission', 'Sign game actions'], ['Limit', '$0.10 per tx'], ['Duration', '24 hours'], ['Max spend', '$5.00 total']].map(([k, v]) => (
              <View key={k} style={s.row}><Text style={s.rk}>{k}</Text><Text style={[s.rv, { fontWeight: '800', color: Colors.text }]}>{v}</Text></View>
            ))}
          </View>
          <TouchableOpacity onPress={() => setSessionKeySet(true)} style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md,
            backgroundColor: sessionKeySet ? '#d1fae5' : Colors.accent, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>
              {sessionKeySet ? '✅ Session Key Active' : 'Approve Session Key'}
            </Text>
          </TouchableOpacity>
          <Text style={s.h2}>Now the game can sign up to 50 transactions (at $0.10 each) without any popups. Under the $5 cap, it auto-executes.</Text>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <Text style={s.fl}>STEP 3 — GASLESS TRANSACTION</Text>
          <Text style={s.h2}>The paymaster contract pays gas on your behalf. You never need ETH to transact.</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Game action (mint item)</Text><Text style={{ fontWeight: '800', color: Colors.accent }}>0.05 USDC</Text>
            </View>
            <View style={{ padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Gas fee</Text><Text style={{ fontWeight: '800', color: Colors.green }}>$0.00 (paymaster)</Text>
            </View>
            <View style={{ padding: Spacing.md, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: Colors.green }}>✅ Transaction auto-signed by session key — no popup</Text>
            </View>
          </View>
        </Card>
      )}

      {step === 4 && (
        <>
          <Res ok msg="Abstract AA working! Passkey wallet + session key + gasless = consumer-grade crypto UX. This is what mainstream adoption requires." />
          <Card>
            <Text style={s.fl}>ABSTRACT VS ETHEREUM MAINNET</Text>
            <Text style={s.blt}>• Native AA (no external SDK) — built into the protocol</Text>
            <Text style={s.blt}>• Session keys = gaming without constant signing interruptions</Text>
            <Text style={s.blt}>• Paymaster network — any app can sponsor gas for users</Text>
            <Text style={s.blt}>• Social recovery via guardians — no seed phrase ever needed</Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}

      {step < 4 && (
        <PB
          label={['See the Problem Abstract Solves →', 'Create Passkey Wallet →', 'Set Session Key →', 'Execute Gasless Transaction →', ''][step]}
          onPress={() => setStep(s => (s + 1) as any)}
          disabled={(step === 1 && !passkeyCreated) || (step === 2 && !sessionKeySet)}
        />
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L219 — chainEvaluator ─────────────────────────────────────────────────────
export function ChainEvaluatorSim({ onComplete, onSkip }: SimProps) {
  const chains = [
    { name: 'Abstract', tvl: '$180M', age: '4mo', validators: '21', txCost: '$0.001', devActivity: 'High', tokenomics: 'VC-heavy', security: 'EVM + AA', verdict: 'emerging' },
    { name: 'Avalanche', tvl: '$1.2B', age: '4yr', validators: '1,400+', txCost: '$0.02', devActivity: 'High', tokenomics: 'Balanced', security: 'Snowman consensus', verdict: 'established' },
    { name: 'NewChain XYZ', tvl: '$2M', age: '3wk', validators: '7', txCost: '$0.0001', devActivity: 'Unknown', tokenomics: '90% VC', security: 'Unaudited', verdict: 'avoid' },
  ];

  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct: Record<string, string> = { Abstract: 'emerging', Avalanche: 'established', 'NewChain XYZ': 'avoid' };
  const score = chains.filter(c => ratings[c.name] === c.verdict).length;

  return (
    <SimShell icon="🔬" title="Chain Evaluator" subtitle="Use objective metrics to rate each chain. Hype is not a metric.">
      <Card>
        <Text style={s.h2}>Evaluation framework: TVL age (battle-tested capital), validator count (decentralisation), dev activity (ecosystem health), tokenomics (who controls supply), security audits (code safety).</Text>
      </Card>
      {chains.map(chain => (
        <Card key={chain.name} style={{ borderColor: checked ? (ratings[chain.name] === correct[chain.name] ? Colors.green : Colors.red) : Colors.border }}>
          <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: Spacing.md }}>{chain.name}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
            {[['TVL', chain.tvl], ['Age', chain.age], ['Validators', chain.validators], ['Tx cost', chain.txCost], ['Dev activity', chain.devActivity], ['Tokenomics', chain.tokenomics], ['Security', chain.security]].map(([k, v]) => (
              <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[{ id: 'established', l: '🏛️ Established' }, { id: 'emerging', l: '🌱 Emerging' }, { id: 'avoid', l: '⚠️ Avoid' }].map(opt => {
              const isCh = ratings[chain.name] === opt.id; const isCo = opt.id === correct[chain.name];
              let bg = Colors.card, border = Colors.border;
              if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
              if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
              if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={opt.id} disabled={checked} onPress={() => setRatings(r => ({ ...r, [chain.name]: opt.id }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.xs, textAlign: 'center' }}>{opt.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ))}
      {!checked
        ? <PB label="Submit Ratings →" onPress={() => setChecked(true)} disabled={Object.keys(ratings).length < chains.length} />
        : <><Res ok={score >= 2} msg={`${score}/3 — Abstract: emerging (4mo TVL but strong AA thesis). Avalanche: established (4yr, enterprise partners). NewChain: avoid (7 validators + unaudited = honeypot).`} />
          <PB label="Continue →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L221 — l2FeeWars ──────────────────────────────────────────────────────────
export function L2FeeWarsSim({ onComplete, onSkip }: SimProps) {
  const [txType, setTxType] = useState<'transfer' | 'swap' | 'defi'>('swap');
  const [year, setYear] = useState<'2022' | '2023' | '2024' | '2025'>('2024');
  const [confirmed, setConfirmed] = useState(false);

  const feeData: Record<string, Record<string, Record<string, number>>> = {
    '2022': {
      transfer: { 'Ethereum L1': 8.50,  'Arbitrum': 0.35, 'Optimism': 0.40, 'Polygon': 0.01 },
      swap:     { 'Ethereum L1': 32.00, 'Arbitrum': 1.20, 'Optimism': 1.50, 'Polygon': 0.03 },
      defi:     { 'Ethereum L1': 65.00, 'Arbitrum': 3.50, 'Optimism': 4.00, 'Polygon': 0.08 },
    },
    '2023': {
      transfer: { 'Ethereum L1': 4.20,  'Arbitrum': 0.15, 'Optimism': 0.18, 'Polygon': 0.005 },
      swap:     { 'Ethereum L1': 18.00, 'Arbitrum': 0.45, 'Optimism': 0.55, 'Polygon': 0.01 },
      defi:     { 'Ethereum L1': 40.00, 'Arbitrum': 1.20, 'Optimism': 1.50, 'Polygon': 0.03 },
    },
    '2024': {
      transfer: { 'Ethereum L1': 2.50,  'Arbitrum': 0.002,'Optimism': 0.002,'Polygon': 0.001 },
      swap:     { 'Ethereum L1': 12.00, 'Arbitrum': 0.008,'Optimism': 0.008,'Polygon': 0.002 },
      defi:     { 'Ethereum L1': 28.00, 'Arbitrum': 0.02, 'Optimism': 0.02, 'Polygon': 0.005 },
    },
    '2025': {
      transfer: { 'Ethereum L1': 1.80,  'Arbitrum': 0.001,'Optimism': 0.001,'Polygon': 0.0005 },
      swap:     { 'Ethereum L1': 9.00,  'Arbitrum': 0.003,'Optimism': 0.003,'Polygon': 0.001 },
      defi:     { 'Ethereum L1': 20.00, 'Arbitrum': 0.008,'Optimism': 0.008,'Polygon': 0.003 },
    },
  };

  const data = feeData[year][txType];
  const ethFee = data['Ethereum L1'];
  const chains = Object.entries(data).filter(([k]) => k !== 'Ethereum L1');
  const cheapest = chains.reduce((a, b) => a[1] < b[1] ? a : b);

  return (
    <SimShell icon="⚔️" title="The L2 Fee Wars" subtitle="Watch gas fees collapse across chains as rollup technology matures.">
      <Card>
        <Text style={s.fl}>TRANSACTION TYPE</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {(['transfer', 'swap', 'defi'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTxType(t)} style={[{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
              borderColor: txType === t ? Colors.accent : Colors.border, backgroundColor: txType === t ? Colors.accentSoft : Colors.card }]}>
              <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: txType === t ? Colors.accent : Colors.text }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.fl, { marginTop: Spacing.md }]}>YEAR</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {(['2022', '2023', '2024', '2025'] as const).map(y => (
            <TouchableOpacity key={y} onPress={() => setYear(y)} style={[{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
              borderColor: year === y ? Colors.accent : Colors.border, backgroundColor: year === y ? Colors.accentSoft : Colors.card }]}>
              <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: year === y ? Colors.accent : Colors.text }}>{y}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fl}>COST PER TRANSACTION</Text>
        <View style={{ padding: Spacing.md, backgroundColor: '#fff0f0', borderRadius: Radius.md, marginBottom: Spacing.md }}>
          <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.red }}>🔷 Ethereum L1</Text>
          <Text style={{ fontWeight: '800', fontSize: 18, color: Colors.red }}>${ethFee.toFixed(2)}</Text>
        </View>
        {chains.map(([name, fee]) => (
          <View key={name} style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, marginBottom: Spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent }}>{name}</Text>
              <Text style={{ fontWeight: '800', fontSize: FontSize.lg, color: Colors.accent }}>${fee < 0.01 ? fee.toFixed(4) : fee.toFixed(3)}</Text>
            </View>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>
              {(ethFee / fee).toFixed(0)}× cheaper than Ethereum L1
            </Text>
          </View>
        ))}
        <View style={{ padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md }}>
          <Text style={{ fontWeight: '800', color: Colors.green }}>
            🏆 Cheapest: {cheapest[0]} at ${Number(cheapest[1]) < 0.01 ? Number(cheapest[1]).toFixed(4) : Number(cheapest[1]).toFixed(3)}
          </Text>
        </View>
      </Card>

      {!confirmed ? (
        <PB label="I See the Pattern →" onPress={() => setConfirmed(true)} />
      ) : (
        <>
          <Res ok msg={`EIP-4844 (blob transactions, 2024) was the inflection point — L2 fees dropped 90%+ overnight. The race toward zero-cost transactions continues.`} />
          <Card>
            <Text style={s.fl}>WHAT DRIVES THE FEE WARS</Text>
            <Text style={s.blt}>• EIP-4844 blobs: data 10× cheaper than calldata (Q1 2024)</Text>
            <Text style={s.blt}>• Increasing blob capacity in each Ethereum upgrade</Text>
            <Text style={s.blt}>• Competition between L2s forces fees toward zero</Text>
            <Text style={s.blt}>• EIP-7691 (Fusaka): 2× more blobs per block → another 2× fee cut</Text>
            <Text style={s.blt}>• End state: L2 transactions cost fractions of a cent perpetually</Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L226 — altChainBoss ───────────────────────────────────────────────────────
export function AltChainBossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'A DeFi protocol wants maximum existing TVL and Rust smart contracts. Best chain?',
      options: ['Polygon', 'Arbitrum', 'Abstract', 'Avalanche'],
      correct: 'Arbitrum',
      reason: 'Arbitrum: largest L2 TVL ($3B+) + Stylus (Rust support). No other chain combines both.',
    },
    {
      q: 'An enterprise needs a private high-throughput chain with custom business rules.',
      options: ['Optimism', 'Abstract', 'Avalanche', 'Arbitrum'],
      correct: 'Avalanche',
      reason: 'Avalanche subnets are purpose-built for enterprise custom chains. Used by Shopify, Celo, Evergreen institutional.',
    },
    {
      q: 'A consumer gaming app needs native AA (no SDK), session keys, and gasless UX.',
      options: ['Ethereum', 'Polygon', 'Abstract', 'Optimism'],
      correct: 'Abstract',
      reason: 'Abstract has native ERC-4337 at the protocol level, built-in session keys, and a paymaster network — designed specifically for consumer gaming.',
    },
    {
      q: 'A developer wants to launch their own chain inheriting OP security, connected to Base/Zora.',
      options: ['Arbitrum Orbit', 'Polygon CDK', 'OP Stack', 'Avalanche Subnet'],
      correct: 'OP Stack',
      reason: 'OP Stack (Optimism) powers the Superchain: Base, Zora, Mode, and 50+ chains that share security and a bridging standard.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="⭐" title="BOSS: Alt-Chain Ecosystems" subtitle="Four real-world decisions — pick the right chain for each.">
      {questions.map((q, i) => {
        const chosen = answers[i]; const isCorrect = chosen === q.correct;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
              {q.options.map(opt => {
                const isCh = chosen === opt; const isCo = opt === q.correct;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={opt} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: opt }))}
                    style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {q.reason}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PB label="Submit Boss Answers →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < questions.length} />
        : <><Res ok={score >= 3} msg={`${score}/4 — ${score >= 3 ? 'Alt-chain mastery! Each chain has a genuine niche — knowing which to use is the skill.' : 'Review: Arbitrum (DeFi+Rust), Avalanche (enterprise subnets), Abstract (gaming AA), OP Stack (Superchain).'}`} />
          <PB label="Return to Island Map →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 16 — FINAL FRONTIER
// ═════════════════════════════════════════════════════════════════════════════

// ── L197 — zkSnarksVsStarks ───────────────────────────────────────────────────
export function ZkSnarksVsStarksSim({ onComplete, onSkip }: SimProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const comparisons = [
    { property: 'Trusted setup required', snark: '✅ Yes — ceremony needed', stark: '❌ No — trustless', winnerStark: true },
    { property: 'Proof size', snark: '~200 bytes (tiny)', stark: '~50KB (larger)', winnerStark: false },
    { property: 'Verification cost (gas)', snark: '~200K gas', stark: '~5M gas', winnerStark: false },
    { property: 'Quantum resistance', snark: '❌ Vulnerable (elliptic curve)', stark: '✅ Resistant (hash-based)', winnerStark: true },
    { property: 'Recursion efficiency', snark: 'Moderate', stark: '⚡ Excellent (STARKs recurse natively)', winnerStark: true },
    { property: 'Main usage', snark: 'Groth16, Plonk (zkSync, Polygon zkEVM)', stark: 'Starknet, StarkEx', winnerStark: null },
  ];

  const question = 'Which ZK proof system does Starknet use for scaling Ethereum?';
  const correct = 'STARKs';

  return (
    <SimShell icon="🔐" title="SNARKs vs STARKs" subtitle="Two families of ZK proofs — different trade-offs, different use cases.">
      <Card>
        <Text style={s.fl}>PROPERTY COMPARISON</Text>
        {comparisons.map(c => (
          <View key={c.property} style={{ borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: Spacing.sm }}>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: 4 }}>{c.property}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <View style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, backgroundColor: c.winnerStark === false ? '#d1fae5' : '#f3f4f6' }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSoft }}>SNARKs</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.text, marginTop: 2 }}>{c.snark}</Text>
              </View>
              <View style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, backgroundColor: c.winnerStark === true ? '#d1fae5' : '#f3f4f6' }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSoft }}>STARKs</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.text, marginTop: 2 }}>{c.stark}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={s.fl}>QUICK CHECK</Text>
        <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>{question}</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {['SNARKs', 'STARKs', 'Neither — custom proofs'].map(opt => {
            const isSel = selected === opt;
            let bg = Colors.card, border = Colors.border;
            if (checked && isSel && opt === correct)  { bg = '#d1fae5'; border = Colors.green; }
            if (checked && isSel && opt !== correct)  { bg = '#fee2e2'; border = Colors.red; }
            if (checked && !isSel && opt === correct) { bg = '#d1fae5'; border = Colors.green; }
            return (
              <TouchableOpacity key={opt} disabled={checked} onPress={() => setSelected(opt)}
                style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: Colors.text, textAlign: 'center' }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>
          💡 Starknet uses STARKs (Scalable Transparent Arguments of Knowledge) — transparent (no trusted setup) and quantum-resistant. This is Cairo's native proof system.
        </Text>}
      </Card>

      {!checked
        ? <PB label="Check →" onPress={() => setChecked(true)} disabled={!selected} />
        : <PB label="Continue →" onPress={onComplete} />}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L199 — rwaEvaluator ───────────────────────────────────────────────────────
export function RwaEvaluatorSim({ onComplete, onSkip }: SimProps) {
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const products = [
    {
      name: 'Ondo USDY',
      type: 'Tokenised US Treasury',
      yield: '5.3% APY',
      custody: 'Ondo Finance + DTCC-regulated custodian',
      redemption: 'T+3 business days',
      trustLevel: 'Regulated (SEC reporting)',
      verdict: 'low_risk',
      analysis: 'USDY is backed by actual short-term US Treasuries in a regulated custodian. Redemption is slow but the underlying is real.',
    },
    {
      name: 'XYZ RealEstateCoin',
      type: 'Claimed: NYC apartment building',
      yield: '12% APY',
      custody: 'XYZ DAO (anonymous team)',
      redemption: 'Sell on DEX (no guaranteed exit)',
      trustLevel: 'Unaudited, no legal entity',
      verdict: 'high_risk',
      analysis: 'No legal entity, anonymous team, no verified property ownership, DEX-only exit. "RWA" branding with no real asset verification.',
    },
    {
      name: 'Centrifuge DROP',
      type: 'SME invoice financing',
      yield: '8.2% APY',
      custody: 'Legal SPV + on-chain verified',
      redemption: '30–90 day windows',
      trustLevel: 'Licensed, audited, EU-compliant',
      verdict: 'medium_risk',
      analysis: 'Real invoices from real businesses, legal structure, but underlying credit risk from SME defaults. Higher yield reflects higher risk than treasury.',
    },
  ];

  const correct: Record<string, string> = { 'Ondo USDY': 'low_risk', 'XYZ RealEstateCoin': 'high_risk', 'Centrifuge DROP': 'medium_risk' };
  const score = products.filter(p => ratings[p.name] === correct[p.name]).length;
  const riskColor = (r: string) => r === 'low_risk' ? Colors.green : r === 'medium_risk' ? '#f59e0b' : Colors.red;
  const riskBg    = (r: string) => r === 'low_risk' ? '#d1fae5' : r === 'medium_risk' ? '#fef3c7' : '#fee2e2';

  return (
    <SimShell icon="🏛️" title="RWA Protocol Evaluator" subtitle="Real-world assets on-chain — evaluate what's actually trustless vs marketing speak.">
      <Card>
        <Text style={s.h2}>RWA key questions: Is there a legal entity? Who holds the physical asset? What's the redemption path? Is the yield sustainable?</Text>
      </Card>
      {products.map(p => (
        <Card key={p.name} style={{ borderColor: checked ? riskColor(ratings[p.name]) : Colors.border }}>
          <Text style={{ fontWeight: '900', fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.sm }}>{p.name}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
            {[['Type', p.type], ['Yield', p.yield], ['Custody', p.custody], ['Redemption', p.redemption], ['Status', p.trustLevel]].map(([k, v]) => (
              <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2, width: '100%' }}>
                <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[{ id: 'low_risk', l: '🟢 Low Risk' }, { id: 'medium_risk', l: '🟡 Medium Risk' }, { id: 'high_risk', l: '🔴 High Risk' }].map(opt => {
              const isCh = ratings[p.name] === opt.id; const isCo = opt.id === correct[p.name];
              let bg = Colors.card, border = Colors.border;
              if (checked && isCh && isCo) { bg = riskBg(opt.id); border = riskColor(opt.id); }
              if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
              if (checked && !isCh && isCo) { bg = riskBg(opt.id); border = riskColor(opt.id); }
              return (
                <TouchableOpacity key={opt.id} disabled={checked} onPress={() => setRatings(r => ({ ...r, [p.name]: opt.id }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 10, textAlign: 'center' }}>{opt.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {p.analysis}</Text>}
        </Card>
      ))}
      {!checked
        ? <PB label="Submit Evaluation →" onPress={() => setChecked(true)} disabled={Object.keys(ratings).length < products.length} />
        : <><Res ok={score >= 2} msg={`${score}/3 — RWA rule: legal entity + regulated custodian + documented redemption = trustworthy. Anonymous team + DEX-only exit = marketing.`} />
          <PB label="Continue →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 17 — SECURITY & RESEARCH
// ═════════════════════════════════════════════════════════════════════════════

// ── L232 — walletDrainerDrill ─────────────────────────────────────────────────
export function WalletDrainerDrillSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [drained, setDrained] = useState(false);
  const [choice1, setChoice1] = useState<string | null>(null);
  const [choice2, setChoice2] = useState<string | null>(null);

  const handleChoice1 = (choice: string) => {
    setChoice1(choice);
    if (choice === 'approve') {
      setDrained(true);
    } else {
      setStep(2);
    }
  };

  const handleChoice2 = (choice: string) => {
    setChoice2(choice);
    if (choice === 'sign') {
      setDrained(true);
    } else {
      setStep(3);
    }
  };

  if (drained) {
    return (
      <SimShell icon="💀" title="Wallet Drained" subtitle="You signed a drainer transaction. See what happened.">
        <View style={{ padding: Spacing.xl, backgroundColor: '#fff0f0', borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.red, alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>💸</Text>
          <Text style={{ fontWeight: '800', color: Colors.red, fontSize: FontSize.xl, marginTop: Spacing.md }}>EVERYTHING GONE</Text>
          <Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 }}>
            The contract was a drainer. One approval/signature gave it permission to transfer all your tokens and NFTs simultaneously.
          </Text>
        </View>
        <Card>
          <Text style={s.fl}>HOW DRAINERS WORK</Text>
          <Text style={s.blt}>• Drainer = contract that calls transferFrom() on all approved tokens at once</Text>
          <Text style={s.blt}>• One "setApprovalForAll" gives unlimited access to all NFTs in collection</Text>
          <Text style={s.blt}>• "Permit" signatures move ERC-20 tokens without a transaction</Text>
          <Text style={s.blt}>• Recovery: impossible. Transactions are irreversible.</Text>
        </Card>
        <TouchableOpacity onPress={() => { setStep(1); setDrained(false); setChoice1(null); setChoice2(null); setApprovalChecked(false); }}
          style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
          <Text style={{ color: Colors.accent, fontWeight: '700' }}>↩ Try again — make better choices</Text>
        </TouchableOpacity>
        <PB label="Continue (lesson learned)" onPress={onComplete} />
      </SimShell>
    );
  }

  return (
    <SimShell icon="🛡️" title="Wallet Drainer Drill" subtitle="You'll face two real drainer scenarios. Make the right call each time.">
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: Spacing.md }}>
        {[1, 2, 3, 4, 5].map(n => (
          <View key={n} style={{ flex: 1, height: 4, borderRadius: 99, backgroundColor: n <= step ? Colors.accent : Colors.border }} />
        ))}
      </View>

      {step === 1 && (
        <>
          <Card style={{ borderColor: Colors.red }}>
            <Text style={[s.fl, { color: Colors.red }]}>SCENARIO 1 — NFT MINT APPROVAL</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>
              You're minting an NFT. MetaMask pops up asking you to sign:{'\n\n'}
              <Text style={{ fontFamily: 'monospace', color: Colors.red }}>setApprovalForAll(0xUnknown...drain, true)</Text>{'\n\n'}
              The site says "this is required to verify your wallet for the mint."
            </Text>
            <View style={{ padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: '#92400e' }}>⚠️ setApprovalForAll = grants unlimited access to ALL your NFTs in this collection to that address</Text>
            </View>
          </Card>
          <View style={{ gap: Spacing.sm }}>
            <TouchableOpacity onPress={() => handleChoice1('approve')}
              style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.red, backgroundColor: '#fff0f0', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.red }}>Approve — the site says it's required</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChoice1('reject')}
              style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.green, backgroundColor: '#f0fdf4', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.green }}>Reject — legitimate mints NEVER need setApprovalForAll</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 2 && (
        <>
          <Res ok msg="Correct! setApprovalForAll should NEVER be required to mint. That request = drainer." />
          <Card style={{ borderColor: Colors.red }}>
            <Text style={[s.fl, { color: Colors.red }]}>SCENARIO 2 — PERMIT SIGNATURE</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>
              An airdrop claim site asks you to sign a message:{'\n\n'}
              <Text style={{ fontFamily: 'monospace', fontSize: FontSize.xs, color: Colors.text }}>
                Permit{'\n'}owner: 0xYourAddress{'\n'}spender: 0xDrainer{'\n'}value: 999999999{'\n'}deadline: 9999999999
              </Text>{'\n\n'}
              The site says "verify ownership to claim your 500 USDC airdrop."
            </Text>
            <View style={{ padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: '#92400e' }}>⚠️ A Permit signature = off-chain permission for the spender to take unlimited USDC from your wallet. No transaction needed.</Text>
            </View>
          </Card>
          <View style={{ gap: Spacing.sm }}>
            <TouchableOpacity onPress={() => handleChoice2('sign')}
              style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.red, backgroundColor: '#fff0f0', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.red }}>Sign — I want my 500 USDC airdrop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChoice2('reject')}
              style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.green, backgroundColor: '#f0fdf4', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.green }}>Reject — Permit + "spender: unknown address" is a drainer</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Res ok msg="Correct! Permit signatures are silent drainers — no on-chain transaction, instant access to your ERC-20 tokens." />
          <Card>
            <Text style={s.fl}>STEP 3 — REVOKE EXISTING APPROVALS</Text>
            <Text style={s.h2}>Check your existing approvals at revoke.cash. If you have unlimited approvals from old protocols, revoke them now.</Text>
            <TouchableOpacity onPress={() => { setApprovalChecked(true); setStep(4); }}
              style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.accent, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Check Approvals at revoke.cash →</Text>
            </TouchableOpacity>
          </Card>
        </>
      )}

      {step === 4 && (
        <>
          <Res ok msg="Good habit! Regular approval audits at revoke.cash take 2 minutes and eliminate unlimited access from old or compromised protocols." />
          <Card>
            <Text style={s.fl}>WALLET DRAINER PROTECTION CHECKLIST</Text>
            {[
              'Never approve setApprovalForAll to an unknown address',
              'Never sign a Permit with "spender: 0x..." you don\'t recognise',
              'Legitimate mints/claims never need unlimited approvals',
              'Check signature details — read the entire MetaMask prompt',
              'Revoke approvals monthly at revoke.cash',
              'Use a burner wallet for new / unverified projects',
            ].map((rule, i) => <Text key={i} style={s.blt}>✅ {rule}</Text>)}
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L234 — flashbotsProtect ────────────────────────────────────────────────────
export function FlashbotsProtectSim({ onComplete, onSkip }: SimProps) {
  const [useProtection, setUseProtection] = useState<boolean | null>(null);
  const [swapAmount, setSwapAmount] = useState('2000');
  const [done, setDone] = useState(false);

  const amt = parseFloat(swapAmount) || 2000;
  const mevLoss    = (amt * 0.008).toFixed(2); // ~0.8% MEV loss without protection
  const flashbotsLoss = 0;

  const FLASHBOTS_RPC = 'https://rpc.flashbots.net';

  return (
    <SimShell icon="🤖" title="Flashbots Protect — Block MEV Bots" subtitle="Route your transaction through a private mempool. MEV bots can't see it, so they can't sandwich it.">
      <Card>
        <Text style={s.fl}>THE SCENARIO</Text>
        <Text style={s.h2}>You're swapping ${swapAmount} USDC → ETH on Uniswap. Without protection, this tx sits in the public mempool for ~12 seconds where MEV bots can see and sandwich it.</Text>
        <TextInput style={[s.inp, { marginTop: Spacing.md }]} value={swapAmount} onChangeText={setSwapAmount}
          keyboardType="decimal-pad" placeholder="Swap amount ($)" placeholderTextColor={Colors.textMuted} editable={!done} />
      </Card>

      {!done ? (
        <>
          <Card style={{ borderColor: Colors.red }}>
            <Text style={[s.fl, { color: Colors.red }]}>OPTION A — PUBLIC MEMPOOL (DEFAULT)</Text>
            <View style={s.row}><Text style={s.rk}>MEV sandwich loss</Text><Text style={[s.rv, { color: Colors.red, fontWeight: '800' }]}>-${mevLoss}</Text></View>
            <View style={s.row}><Text style={s.rk}>Slippage</Text><Text style={s.rv}>Up to 1% extra</Text></View>
            <View style={s.row}><Text style={s.rk}>Bot visibility</Text><Text style={[s.rv, { color: Colors.red }]}>Visible to all bots</Text></View>
          </Card>
          <Card style={{ borderColor: Colors.green }}>
            <Text style={[s.fl, { color: Colors.green }]}>OPTION B — FLASHBOTS PROTECT</Text>
            <View style={s.row}><Text style={s.rk}>MEV loss</Text><Text style={[s.rv, { color: Colors.green, fontWeight: '800' }]}>$0.00</Text></View>
            <View style={s.row}><Text style={s.rk}>RPC endpoint</Text><Text style={{ fontSize: 10, fontFamily: 'monospace', color: Colors.accent }}>rpc.flashbots.net</Text></View>
            <View style={s.row}><Text style={s.rk}>Bot visibility</Text><Text style={[s.rv, { color: Colors.green }]}>Private — bots can't see it</Text></View>
          </Card>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity onPress={() => { setUseProtection(false); setDone(true); }}
              style={{ flex: 1, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.red, backgroundColor: '#fff0f0', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.red }}>Use Default (Public)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setUseProtection(true); setDone(true); }}
              style={{ flex: 1, padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.green, backgroundColor: '#f0fdf4', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: Colors.green }}>Use Flashbots →</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Res ok={useProtection === true} msg={useProtection
            ? `Protected! MEV bots couldn't see your tx. You saved $${mevLoss}. Setup: add rpc.flashbots.net as a custom network in MetaMask.`
            : `Sandwiched! MEV bots front-ran and back-ran your swap. You lost $${mevLoss}. On $10,000 trades this is $80 per swap.`} />
          <Card>
            <Text style={s.fl}>HOW TO SET UP FLASHBOTS PROTECT</Text>
            <Text style={s.blt}>1. Open MetaMask → Settings → Networks → Add Network</Text>
            <Text style={s.blt}>2. Network Name: Flashbots Protect</Text>
            <Text style={[s.blt, { fontFamily: 'monospace', fontSize: FontSize.xs }]}>3. RPC URL: {FLASHBOTS_RPC}</Text>
            <Text style={s.blt}>4. Chain ID: 1 (same as Ethereum Mainnet)</Text>
            <Text style={s.blt}>5. Switch to this network for any large Uniswap swap</Text>
          </Card>
          <TouchableOpacity onPress={() => Linking.openURL('https://docs.flashbots.net/flashbots-protect/overview')}>
            <Text style={{ color: Colors.accent, fontWeight: '700', textAlign: 'center', paddingVertical: Spacing.sm }}>docs.flashbots.net →</Text>
          </TouchableOpacity>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L238 — opsecBuilder ────────────────────────────────────────────────────────
export function OpsecBuilderSim({ onComplete, onSkip }: SimProps) {
  const [portfolioSize, setPortfolioSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const tiers = {
    small: {
      label: 'Under $10,000',
      required: ['hw_wallet', 'seed_metal', 'auth_app', 'unique_email'],
      recommended: ['vpn', 'browser_profile'],
      skip: ['multisig', 'air_gap', 'geographic_split'],
    },
    medium: {
      label: '$10,000 – $100,000',
      required: ['hw_wallet', 'seed_metal', 'auth_app', 'unique_email', 'vpn', 'browser_profile'],
      recommended: ['multisig', 'cold_storage_90'],
      skip: ['air_gap', 'geographic_split'],
    },
    large: {
      label: 'Over $100,000',
      required: ['hw_wallet', 'seed_metal', 'auth_app', 'unique_email', 'vpn', 'browser_profile', 'multisig', 'air_gap', 'cold_storage_90'],
      recommended: ['geographic_split', 'legal_entity'],
      skip: [],
    },
  };

  const allMeasures = [
    { id: 'hw_wallet',      label: 'Hardware wallet (Ledger/Trezor)',     pts: 25 },
    { id: 'seed_metal',     label: 'Seed phrase on metal (not paper)',     pts: 20 },
    { id: 'auth_app',       label: 'Authenticator app 2FA (not SMS)',      pts: 20 },
    { id: 'unique_email',   label: 'Unique email per exchange',            pts: 15 },
    { id: 'vpn',            label: 'VPN for all crypto activity',          pts: 10 },
    { id: 'browser_profile',label: 'Dedicated browser profile for crypto', pts: 10 },
    { id: 'multisig',       label: 'Multisig wallet (2-of-3)',             pts: 30 },
    { id: 'air_gap',        label: 'Air-gapped signing device',            pts: 25 },
    { id: 'cold_storage_90',label: '90%+ in cold storage',                pts: 20 },
    { id: 'geographic_split',label: 'Geographic key distribution',         pts: 15 },
    { id: 'legal_entity',   label: 'Legal entity for holdings',            pts: 10 },
  ];

  const tier = tiers[portfolioSize];
  const requiredMeasures = allMeasures.filter(m => tier.required.includes(m.id));
  const recommendedMeasures = allMeasures.filter(m => tier.recommended.includes(m.id));

  const requiredMet = requiredMeasures.every(m => applied.has(m.id));
  const score = allMeasures.filter(m => applied.has(m.id)).reduce((acc, m) => acc + m.pts, 0);
  const maxScore = allMeasures.reduce((acc, m) => acc + m.pts, 0);
  const pct = Math.round(score / maxScore * 100);

  return (
    <SimShell icon="🏰" title="OPSEC Builder" subtitle="Build the right security stack for your portfolio size. Over-engineering wastes money. Under-engineering loses it.">
      <Card>
        <Text style={s.fl}>PORTFOLIO SIZE</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {(['small', 'medium', 'large'] as const).map(size => (
            <TouchableOpacity key={size} disabled={submitted} onPress={() => setPortfolioSize(size)}
              style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                borderColor: portfolioSize === size ? Colors.accent : Colors.border,
                backgroundColor: portfolioSize === size ? Colors.accentSoft : Colors.card }}>
              <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: portfolioSize === size ? Colors.accent : Colors.text, textAlign: 'center' }}>
                {tiers[size].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {requiredMeasures.length > 0 && (
        <Card style={{ borderColor: Colors.red }}>
          <Text style={[s.fl, { color: Colors.red }]}>REQUIRED FOR YOUR SIZE</Text>
          {requiredMeasures.map(m => {
            const isApplied = applied.has(m.id);
            return (
              <TouchableOpacity key={m.id} disabled={submitted} onPress={() => setApplied(prev => { const s = new Set(prev); s.has(m.id) ? s.delete(m.id) : s.add(m.id); return s; })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                  borderColor: isApplied ? Colors.green : Colors.red, backgroundColor: isApplied ? '#d1fae5' : 'transparent' }}>
                  {isApplied && <Text style={{ color: Colors.green, fontWeight: '800' }}>✓</Text>}
                </View>
                <Text style={{ flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.text }}>{m.label}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800' }}>+{m.pts}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>
      )}

      {recommendedMeasures.length > 0 && (
        <Card style={{ borderColor: '#f59e0b' }}>
          <Text style={[s.fl, { color: '#92400e' }]}>RECOMMENDED FOR YOUR SIZE</Text>
          {recommendedMeasures.map(m => {
            const isApplied = applied.has(m.id);
            return (
              <TouchableOpacity key={m.id} disabled={submitted} onPress={() => setApplied(prev => { const s = new Set(prev); s.has(m.id) ? s.delete(m.id) : s.add(m.id); return s; })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                  borderColor: isApplied ? Colors.green : '#f59e0b', backgroundColor: isApplied ? '#d1fae5' : 'transparent' }}>
                  {isApplied && <Text style={{ color: Colors.green, fontWeight: '800' }}>✓</Text>}
                </View>
                <Text style={{ flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.text }}>{m.label}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800' }}>+{m.pts}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>
      )}

      {!submitted ? (
        <PB label="Calculate OPSEC Score →" onPress={() => setSubmitted(true)} />
      ) : (
        <>
          <Card style={{ borderColor: requiredMet ? Colors.green : Colors.red }}>
            <Text style={[s.fl, { color: requiredMet ? Colors.green : Colors.red }]}>YOUR OPSEC SCORE: {pct}%</Text>
            <View style={{ height: 12, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' }}>
              <View style={{ height: 12, borderRadius: 99, backgroundColor: requiredMet ? Colors.green : Colors.red, width: `${pct}%` as any }} />
            </View>
            <Text style={{ fontWeight: '800', color: requiredMet ? Colors.green : Colors.red, marginTop: Spacing.sm }}>
              {requiredMet ? '✅ All required measures in place for your portfolio size' : '❌ Missing required measures — at risk for your portfolio size'}
            </Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L240 — securityBoss ────────────────────────────────────────────────────────
export function SecurityBossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'You get a MetaMask popup requesting setApprovalForAll for an NFT mint. You:',
      options: ['Approve — the site requires it', 'Reject — legitimate mints never need setApprovalForAll', 'Check the contract on Etherscan first, then decide'],
      correct: 1,
      reason: 'setApprovalForAll is NEVER required for minting. Any site asking for it is a drainer. Reject immediately.',
    },
    {
      q: 'You\'re making a $15,000 swap on Uniswap. Before submitting, you:',
      options: ['Submit normally — gas is the only cost', 'Switch to Flashbots Protect RPC first', 'Set slippage to 5% to ensure it fills'],
      correct: 1,
      reason: 'At $15K, MEV sandwiching can cost $120+ per swap. Flashbots Protect takes 10 seconds to configure and costs nothing.',
    },
    {
      q: 'You notice your transaction history has a 0 ETH dust transaction from an unknown address. You:',
      options: ['Ignore it — 0 ETH transactions are harmless', 'Never copy-paste addresses from your history again', 'Report it to Ethereum Foundation'],
      correct: 1,
      reason: 'This is address poisoning. The attacker is inserting a lookalike address into your history hoping you\'ll copy it. Never copy from history.',
    },
    {
      q: 'You hold $50,000 in crypto. Your seed phrase is currently stored:',
      options: ['In a notes app on your phone', 'On metal plate stored offline at home', 'In a password manager'],
      correct: 1,
      reason: 'Metal plate + offline is the only resilient storage. Phone notes: hackable. Password manager: single point of failure. Metal: survives fire, water, device loss.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [done, setDone] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="⭐" title="BOSS: Security & Research" subtitle="Four critical security decisions — one wrong answer in real life is all it takes.">
      {questions.map((q, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: done ? (chosen === q.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            {q.options.map((opt, j) => {
              let bg = Colors.card, border = Colors.border;
              if (done && chosen === j && j === q.correct)   { bg = '#d1fae5'; border = Colors.green; }
              if (done && chosen === j && j !== q.correct)   { bg = '#fee2e2'; border = Colors.red; }
              if (done && chosen !== j && j === q.correct)   { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={j} disabled={done} onPress={() => setAnswers(a => ({ ...a, [i]: j }))}
                  style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, backgroundColor: chosen === j && !done ? Colors.accentSoft : bg, borderColor: chosen === j && !done ? Colors.accent : border }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {done && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {q.reason}</Text>}
          </Card>
        );
      })}
      {!done ? (
        <PB label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} />
      ) : (
        <>
          <Card style={{ borderColor: score >= 3 ? Colors.green : Colors.red }}>
            <Text style={{ textAlign: 'center', fontSize: 18 }}>{score >= 3 ? '🏆' : '📚'}</Text>
            <Text style={{ fontWeight: '800', textAlign: 'center', color: score >= 3 ? Colors.green : Colors.red, marginTop: Spacing.sm }}>
              {score >= 3 ? 'SECURITY BOSS CLEARED!' : 'Review & Stay Safe'}
            </Text>
            <Text style={{ textAlign: 'center', color: Colors.textSoft }}>{score}/4 correct</Text>
          </Card>
          <PB label="Return to Island Map →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 18 — ADVANCED CRYPTO (gap simulators)
// ═════════════════════════════════════════════════════════════════════════════

// ── L122 — stablecoinRisk ─────────────────────────────────────────────────────
export function StablecoinRiskSim({ onComplete, onSkip }: SimProps) {
  const stablecoins = [
    {
      name: 'USDC',
      type: 'Fiat-backed',
      peg: 'US Dollar 1:1',
      backing: '100% cash + T-bills at regulated US banks',
      risks: ['Bank failure (SVB March 2023 — USDC depegged to $0.87)', 'Regulatory action by US government', 'Circle counterparty risk'],
      depegProb: 'low',
      verdict: 'safe',
    },
    {
      name: 'DAI',
      type: 'Crypto-backed (algorithmic)',
      peg: 'US Dollar via overcollateralisation',
      backing: '140%+ collateral ratio (ETH, USDC, RWA)',
      risks: ['Black swan: collateral drops 30%+ instantly', 'USDC dependency (50%+ of backing)', 'Governance attack changing collateral params'],
      depegProb: 'medium',
      verdict: 'moderate',
    },
    {
      name: 'FRAX',
      type: 'Hybrid algorithmic + collateral',
      peg: 'US Dollar (partial collateral)',
      backing: '85% USDC + 15% FXS algorithmic',
      risks: ['FXS price crash reduces backing → depeg spiral', 'Algorithmic portion is trust-based not asset-based', 'UST-style death spiral risk if collateral drops fast'],
      depegProb: 'high',
      verdict: 'risky',
    },
  ];

  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct: Record<string, string> = { USDC: 'safe', DAI: 'moderate', FRAX: 'risky' };
  const score = stablecoins.filter(s => ratings[s.name] === correct[s.name]).length;
  const riskColor = (r: string) => ({ safe: Colors.green, moderate: '#f59e0b', risky: Colors.red })[r] || Colors.textSoft;
  const riskBg    = (r: string) => ({ safe: '#d1fae5', moderate: '#fef3c7', risky: '#fee2e2' })[r] || '#f3f4f6';

  return (
    <SimShell icon="⚖️" title="Stablecoin Risk Assessment" subtitle="Not all stablecoins are equally stable. Rate each on actual depeg risk.">
      <Card>
        <Text style={s.h2}>Rule: USDT/USDC (fiat-backed) → counterparty risk. DAI (overcollateralised) → liquidation risk. Algorithmic → death spiral risk. Never keep over $50K in any single stablecoin.</Text>
      </Card>
      {stablecoins.map(sc => (
        <Card key={sc.name} style={{ borderColor: checked ? riskColor(ratings[sc.name]) : Colors.border }}>
          <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: 4 }}>{sc.name}</Text>
          <Text style={{ fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800', marginBottom: Spacing.sm }}>{sc.type}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
            {[['Peg', sc.peg], ['Backing', sc.backing]].map(([k, v]) => (
              <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2, width: '100%' }}>
                <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
              </View>
            ))}
          </View>
          <Text style={[s.fl, { marginBottom: Spacing.sm }]}>RISKS</Text>
          {sc.risks.map((r, i) => <Text key={i} style={{ fontSize: FontSize.xs, color: Colors.text, lineHeight: 18, marginBottom: 2 }}>⚠️ {r}</Text>)}
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
            {[{ id: 'safe', l: '🟢 Safe' }, { id: 'moderate', l: '🟡 Moderate' }, { id: 'risky', l: '🔴 Risky' }].map(opt => {
              const isCh = ratings[sc.name] === opt.id; const isCo = opt.id === correct[sc.name];
              let bg = Colors.card, border = Colors.border;
              if (checked && isCh && isCo) { bg = riskBg(opt.id); border = riskColor(opt.id); }
              if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
              if (checked && !isCh && isCo) { bg = riskBg(opt.id); border = riskColor(opt.id); }
              return (
                <TouchableOpacity key={opt.id} disabled={checked} onPress={() => setRatings(r => ({ ...r, [sc.name]: opt.id }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.xs, textAlign: 'center' }}>{opt.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ))}
      {!checked
        ? <PB label="Submit Risk Ratings →" onPress={() => setChecked(true)} disabled={Object.keys(ratings).length < stablecoins.length} />
        : <><Res ok={score >= 2} msg={`${score}/3 — USDC = regulated counterparty risk. DAI = overcollateralised but complex. FRAX partial algorithmic = UST-pattern risk. Never hold $50K+ in any single stablecoin.`} />
          <PB label="Continue →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L135 — advancedCryptoBoss ─────────────────────────────────────────────────
export function AdvancedCryptoBossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'A governance proposal would give 3 whales 51% of voting power. The risk this represents is:',
      options: ['Governance capture — they can drain the treasury or change any parameter', 'Nothing — majority voting is how democracy works', 'Slashing risk for validators'],
      correct: 0,
    },
    {
      q: 'A token has 5% circulating supply with 95% locked for 18 months. The FDV is $500M. Realistically:',
      options: ['The $500M FDV is accurate — market agrees with valuation', '$500M FDV will face 19× sell pressure when tokens unlock — real price likely much lower', 'High FDV means the project is successful'],
      correct: 1,
    },
    {
      q: 'You want to earn yield on ETH with maximum decentralisation. Best option:',
      options: ['Coinbase cbETH (25% cut, regulated)', 'Rocket Pool rETH (8 ETH min for nodes, fully decentralised)', 'Lido stETH (30%+ of network, liquid)'],
      correct: 1,
    },
    {
      q: 'A new protocol has $800M TVL after 1 month with 0 audits and anonymous team. You:',
      options: ['Ape in — high TVL proves trust', 'Wait for 6+ months of battle-testing and at least 2 audits', 'Invest only what you\'re willing to lose completely'],
      correct: 1,
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [done, setDone] = useState(false);
  const reasons = [
    'Governance capture = existential threat. 3 whales with 51% can pass any proposal, drain treasuries, or brick the protocol.',
    'FDV/MC at 100× means 99% of tokens will unlock and create sell pressure. $500M FDV with 5% circulating is usually closer to a $25M fair value.',
    'Rocket Pool: most decentralised (distributed validators), no single entity controls 30%+ of stake. Lido\'s market share is the network\'s biggest risk.',
    'New protocols get hacked in the first 3–12 months most often. High TVL attracts attackers, not safety. Audits + time = safety.',
  ];
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="⭐" title="BOSS: Advanced Crypto" subtitle="Four expert-level questions separating informed participants from the crowd.">
      {questions.map((q, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: done ? (chosen === q.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            {q.options.map((opt, j) => {
              let bg = Colors.card, border = Colors.border;
              if (done && chosen === j && j === q.correct)   { bg = '#d1fae5'; border = Colors.green; }
              if (done && chosen === j && j !== q.correct)   { bg = '#fee2e2'; border = Colors.red; }
              if (done && chosen !== j && j === q.correct)   { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={j} disabled={done} onPress={() => setAnswers(a => ({ ...a, [i]: j }))}
                  style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, backgroundColor: chosen === j && !done ? Colors.accentSoft : bg, borderColor: chosen === j && !done ? Colors.accent : border }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {done && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {reasons[i]}</Text>}
          </Card>
        );
      })}
      {!done ? (
        <PB label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} />
      ) : (
        <>
          <Card style={{ borderColor: score >= 3 ? Colors.green : Colors.red }}>
            <Text style={{ textAlign: 'center', fontSize: 18 }}>{score >= 3 ? '🏆' : '📚'}</Text>
            <Text style={{ fontWeight: '800', textAlign: 'center', color: score >= 3 ? Colors.green : Colors.red, marginTop: Spacing.sm }}>
              {score >= 3 ? 'ADVANCED CRYPTO MASTERED!' : 'Keep Studying'}
            </Text>
            <Text style={{ textAlign: 'center', color: Colors.textSoft }}>{score}/4 correct</Text>
          </Card>
          <PB label="Return to Island Map →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
