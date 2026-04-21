/**
 * island12_13_15SimulatorDefs.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Island 12 — Base Ecosystem     (L151–L165, Base Sepolia)
 * Island 13 — TON & Telegram     (L166–L180, TON Testnet)
 * Island 15 — Coinbase Deep Dive (L181–L195, Ethereum Sepolia)
 *
 * These fill gaps not covered by existing SimulatorCard.tsx sims.
 *
 * Add to SIMULATORS map:
 *   cbBtcExplainer     → L152 (I12)
 *   aerodromeSwap      → L154 (I12)
 *   baseMemeculture    → L158 (I12)
 *   agentKitDemo       → L160 (I12)
 *   baseBoss           → L165 (I12)
 *   tonMiniAppDex      → L168 (I13)
 *   fragmentTrading    → L171 (I13)
 *   tonDefiProtocols   → L174 (I13)
 *   tonBoss            → L180 (I13)
 *   cbBtcTrustModel    → L183 (I15)
 *   cbCdpStablecoin    → L186 (I15)
 *   cbPrimeVsRetail    → L188 (I15)
 *   cbRegStrategy      → L191 (I15)
 *   coinbaseBoss       → L195 (I15)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

interface SimProps { onComplete: () => void; onSkip: () => void; }

// ── Shared UI ─────────────────────────────────────────────────────────────────
function SimShell({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: string; children: React.ReactNode;
}) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' }}>
        <Text style={{ fontSize: 36, lineHeight: 44 }}>{icon}</Text>
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
const OK = ({ good, msg }: { good: boolean; msg: string }) => (
  <View style={{ flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, backgroundColor: good ? '#d1fae5' : '#fee2e2', borderColor: good ? Colors.green : Colors.red }}>
    <Text style={{ fontSize: 20 }}>{good ? '✅' : '❌'}</Text>
    <Text style={{ flex: 1, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 19, color: good ? '#065f46' : '#7f1d1d' }}>{msg}</Text>
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
// ISLAND 12 — BASE ECOSYSTEM
// ═════════════════════════════════════════════════════════════════════════════

// ── L152 — cbBtcExplainer ─────────────────────────────────────────────────────
export function CbBtcExplainerSim({ onComplete, onSkip }: SimProps) {
  const comparisons = [
    { property: 'Custodian',          cbBTC: 'Coinbase (regulated, insured)',          wBTC: 'BitGo + DAO (semi-decentralised)' },
    { property: 'Minting authority',  cbBTC: 'Coinbase only',                          wBTC: 'BitGo merchant network' },
    { property: 'Chain',              cbBTC: 'Base (Coinbase L2)',                      wBTC: 'Ethereum mainnet' },
    { property: 'KYC required',       cbBTC: 'Yes — Coinbase account needed to mint',  wBTC: 'No — permissionless burning' },
    { property: 'Regulatory clarity', cbBTC: '✅ US regulated, audited quarterly',     wBTC: '⚠️ Regulatory uncertainty' },
    { property: 'Gas cost for DeFi',  cbBTC: '~$0.01 on Base',                        wBTC: '~$10–50 on Ethereum' },
    { property: 'Counterparty risk',  cbBTC: 'Coinbase bankruptcy = frozen',           wBTC: 'BitGo/DAO compromise = frozen' },
    { property: 'Transparency',       cbBTC: 'Monthly attestation by Deloitte',        wBTC: 'On-chain proof of reserves' },
  ];

  const [answered, setAnswered] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const QUESTION = 'Which wrapped Bitcoin is better for someone who uses Coinbase and wants to use DeFi cheaply on Base?';
  const CORRECT = 'cbBTC';

  return (
    <SimShell icon="₿" title="cbBTC vs wBTC — Which to Use?" subtitle="Both are Bitcoin on Ethereum-compatible chains. The right one depends on your use case.">
      <Card>
        <Text style={s.fl}>PROPERTY COMPARISON</Text>
        {comparisons.map((c, i) => (
          <View key={i} style={{ borderBottomWidth: i < comparisons.length - 1 ? 1 : 0, borderBottomColor: Colors.border, paddingVertical: Spacing.sm }}>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: 4, fontSize: FontSize.sm }}>{c.property}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <View style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, backgroundColor: '#f0f4ff' }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.accent, marginBottom: 2 }}>cbBTC</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.text }}>{c.cbBTC}</Text>
              </View>
              <View style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, backgroundColor: '#fef3c7' }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: '#92400e', marginBottom: 2 }}>wBTC</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.text }}>{c.wBTC}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={s.fl}>SCENARIO CHECK</Text>
        <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, lineHeight: 20 }}>{QUESTION}</Text>
        {['cbBTC', 'wBTC', 'Neither — use native BTC'].map(opt => {
          const isSel = answered === opt;
          let bg = Colors.card, border = Colors.border;
          if (checked && isSel && opt === CORRECT)  { bg = '#d1fae5'; border = Colors.green; }
          if (checked && isSel && opt !== CORRECT)  { bg = '#fee2e2'; border = Colors.red; }
          if (checked && !isSel && opt === CORRECT) { bg = '#d1fae5'; border = Colors.green; }
          return (
            <TouchableOpacity key={opt} disabled={checked} onPress={() => setAnswered(opt)}
              style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, backgroundColor: bg, borderColor: isSel && !checked ? Colors.accent : border }}>
              <Text style={{ fontWeight: '800', color: Colors.text }}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
        {checked && (
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16, marginTop: 4 }}>
            💡 cbBTC: Coinbase user → no friction creating it, Base means sub-cent DeFi gas, regulated + insured. wBTC better if you're already on Ethereum mainnet with no Coinbase account.
          </Text>
        )}
      </Card>

      {!checked
        ? <PB label="Check →" onPress={() => setChecked(true)} disabled={!answered} />
        : <PB label="Continue →" onPress={onComplete} />}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L154 — aerodromeSwap ──────────────────────────────────────────────────────
export function AerodromeSwapSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('100');
  const [poolType, setPoolType] = useState<'stable' | 'volatile'>('volatile');
  const [veAeroLocked, setVeAeroLocked] = useState(false);
  const [step, setStep] = useState<'swap' | 've' | 'done'>('swap');

  const amtF = parseFloat(amount) || 0;
  const received = poolType === 'stable'
    ? (amtF * 0.9997).toFixed(4)   // stable pool: near 1:1 for same-peg assets
    : (amtF * 0.9975).toFixed(4);  // volatile pool: 0.25% fee

  const feeApr = poolType === 'stable' ? '12.4%' : '38.7%';
  const aeroEmissions = poolType === 'volatile' ? '82.1%' : '44.2%';

  return (
    <SimShell icon="🟠" title="Aerodrome — Base's #1 DEX" subtitle="Understand ve(3,3) tokenomics by swapping and locking AERO for voting power.">
      {step === 'swap' && (
        <>
          <Card>
            <Text style={s.fl}>POOL TYPE</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
              {([
                { k: 'volatile' as const, l: '⚡ Volatile Pool', desc: 'ETH/USDC — 0.25% fee, higher APR' },
                { k: 'stable' as const,   l: '💧 Stable Pool',   desc: 'USDC/USDbC — 0.01% fee, near 1:1' },
              ]).map(({ k, l, desc }) => (
                <TouchableOpacity key={k} onPress={() => setPoolType(k)}
                  style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2,
                    borderColor: poolType === k ? Colors.accent : Colors.border,
                    backgroundColor: poolType === k ? Colors.accentSoft : Colors.card }}>
                  <Text style={{ fontWeight: '800', color: poolType === k ? Colors.accent : Colors.text, fontSize: FontSize.sm }}>{l}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>{desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.fl}>AMOUNT (USDC)</Text>
            <TextInput style={s.inp} value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
            <View style={s.row}><Text style={s.rk}>You receive</Text><Text style={[s.rv, { color: Colors.green, fontWeight: '900' }]}>{received} {poolType === 'stable' ? 'USDC' : 'ETH equiv.'}</Text></View>
            <View style={s.row}><Text style={s.rk}>LP fee APR</Text><Text style={[s.rv, { color: Colors.accent }]}>{feeApr}</Text></View>
            <View style={s.row}><Text style={s.rk}>AERO emissions APR</Text><Text style={[s.rv, { color: Colors.green, fontWeight: '900' }]}>{aeroEmissions}</Text></View>
            <View style={s.row}><Text style={s.rk}>Gas cost (Base)</Text><Text style={[s.rv, { color: Colors.green }]}>~$0.02</Text></View>
          </Card>
          <PB label="Swap →" onPress={() => setStep('ve')} disabled={amtF <= 0} />
        </>
      )}

      {step === 've' && (
        <>
          <OK good msg={`Swapped! Received ${received} at ~$0.02 gas. On Ethereum mainnet this same swap would cost $12–45.`} />
          <Card>
            <Text style={s.fl}>VE(3,3) TOKENOMICS — THE KEY TO AERODROME</Text>
            <Text style={s.h2}>
              veAERO holders vote on which pools receive AERO emissions each week. This creates a flywheel: protocols bribe veAERO holders to direct emissions to their pools. Lock AERO → earn bribes + fees.
            </Text>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
              {[
                { action: 'Swap on Aerodrome', earns: 'Nothing (just swaps)' },
                { action: 'Provide liquidity (LP)', earns: 'Fees + AERO emissions' },
                { action: 'Lock AERO for veAERO', earns: 'Bribes + protocol fees' },
                { action: 'Vote for pools', earns: 'Proportional bribe allocation' },
              ].map(({ action, earns }) => (
                <View key={action} style={s.row}>
                  <Text style={[s.rk, { flex: 1.2 }]}>{action}</Text>
                  <Text style={[s.rv, { color: Colors.accent }]}>{earns}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setVeAeroLocked(true)}
              style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md,
                backgroundColor: veAeroLocked ? '#d1fae5' : Colors.accent, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>
                {veAeroLocked ? '✅ 100 AERO Locked for 6 months' : '🔒 Lock 100 AERO → Get veAERO'}
              </Text>
            </TouchableOpacity>
          </Card>
          <PB label={veAeroLocked ? 'See Weekly Bribes →' : 'Lock AERO First'} onPress={() => setStep('done')} disabled={!veAeroLocked} />
        </>
      )}

      {step === 'done' && (
        <>
          <Card style={{ borderColor: Colors.green }}>
            <Text style={s.fl}>THIS WEEK — YOUR veAERO VOTE ALLOCATION</Text>
            {[
              { pool: 'cbBTC/ETH', bribe: '$4.20/week', apr: '142%' },
              { pool: 'USDC/USDbC', bribe: '$2.10/week', apr: '76%' },
              { pool: 'ETH/AERO', bribe: '$6.80/week', apr: '230%' },
            ].map(({ pool, bribe, apr }) => (
              <View key={pool} style={s.row}>
                <Text style={s.rk}>{pool}</Text>
                <Text style={[s.rv, { color: Colors.green }]}>{bribe}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.accent, marginLeft: Spacing.sm }}>{apr} APR</Text>
              </View>
            ))}
          </Card>
          <OK good msg="veAERO locked! This is the ve(3,3) flywheel — protocols pay to attract liquidity, veAERO holders capture value, LPs earn rewards. Base's DeFi is designed around this loop." />
          <Card>
            <Text style={s.fl}>AERODROME KEY FACTS</Text>
            <Text style={s.blt}>• Largest DEX on Base — 60%+ of Base DEX volume</Text>
            <Text style={s.blt}>• ve(3,3) = combination of Curve veCRV + Olympus OHM game theory</Text>
            <Text style={s.blt}>• veAERO max lock: 4 years (higher lock = more voting power)</Text>
            <Text style={s.blt}>• Weekly epoch: bribes paid, votes counted, emissions directed</Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L160 — agentKitDemo ───────────────────────────────────────────────────────
export function AgentKitDemoSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [agentGoal, setAgentGoal] = useState('');
  const [agentActions, setAgentActions] = useState<string[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);

  const runAgent = () => {
    setAgentRunning(true);
    // Simulate agent planning and executing
    const actions = [
      '🔍 Checking ETH/USDC price on Aerodrome…',
      '💰 Current price: 1 ETH = 3,247 USDC',
      '📊 Checking your wallet: 1.5 USDC idle',
      '🎯 Goal: swap 1 USDC → ETH when price < $3,200',
      '⏳ Monitoring price feed (every 60 seconds)…',
      '✅ Price hit $3,198 — executing swap on your behalf',
      '🎉 Swap complete: 0.000312 ETH received',
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < actions.length) {
        setAgentActions(prev => [...prev, actions[i]]);
        i++;
      } else {
        clearInterval(interval);
        setAgentRunning(false);
        setStep(3);
      }
    }, 600);
  };

  return (
    <SimShell icon="🤖" title="AgentKit — AI Agent on Base" subtitle="Build an autonomous agent that monitors prices and executes swaps on your behalf — no frontend needed.">
      {step === 0 && (
        <Card>
          <Text style={s.h2}>
            Coinbase AgentKit gives AI models (Claude, GPT-4) a set of on-chain tools: check balance, swap tokens, bridge assets, deploy contracts. The AI decides when and how to use them.
          </Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {[
              ['What it replaces', 'Manual monitoring + clicking through DeFi UIs'],
              ['What it needs', 'Your wallet address + a defined goal'],
              ['What it can do', 'Swap, bridge, stake, deploy, read on-chain data'],
              ['What it can\'t do', 'Access your private key (you sign transactions)'],
            ].map(([k, v]) => (
              <View key={k} style={s.row}>
                <Text style={[s.rk, { flex: 1 }]}>{k}</Text>
                <Text style={[s.rv, { flex: 2 }]}>{v}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Text style={s.fl}>DEFINE YOUR AGENT'S GOAL</Text>
          <Text style={s.h2}>Give the agent a clear, achievable task. Ambiguous goals lead to unexpected actions.</Text>
          <TextInput
            style={s.inp}
            value={agentGoal}
            onChangeText={setAgentGoal}
            placeholder='e.g. "Swap 1 USDC for ETH when ETH price drops below $3,200"'
            placeholderTextColor={Colors.textMuted}
            multiline
          />
          <View style={{ padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '700', color: '#92400e', fontSize: FontSize.sm }}>
              ⚠️ Real agents execute real transactions. Always test with small amounts and clear boundaries.
            </Text>
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={s.fl}>AGENT EXECUTION LOG</Text>
          <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>Goal: {agentGoal || 'Swap when ETH < $3,200'}</Text>
          {agentActions.length === 0 && !agentRunning && (
            <Text style={s.h2}>Agent ready. Press Run to start monitoring.</Text>
          )}
          {agentActions.map((action, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, paddingVertical: 4 }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, width: 30 }}>{(i + 1).toString().padStart(2, '0')}</Text>
              <Text style={{ flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 }}>{action}</Text>
            </View>
          ))}
          {agentRunning && (
            <Text style={{ color: Colors.accent, fontWeight: '700', marginTop: Spacing.sm }}>⏳ Agent running…</Text>
          )}
        </Card>
      )}

      {step === 3 && (
        <>
          <OK good msg="Agent completed the task autonomously! It monitored the price, waited for the condition, and executed the swap — all without you clicking anything." />
          <Card>
            <Text style={s.fl}>AGENTKIT REAL-WORLD APPLICATIONS</Text>
            {[
              'Dollar-cost averaging: buy $50 ETH every Monday automatically',
              'Rebalancing: keep portfolio at 60/40 ETH/USDC by selling when ratio drifts',
              'Yield optimisation: move USDC to highest-yielding Base protocol daily',
              'Stop-loss: sell ETH if price drops 20% below entry automatically',
              'NFT sniping: buy floor NFTs when they hit target price',
            ].map((use, i) => <Text key={i} style={s.blt}>• {use}</Text>)}
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}

      {step < 2 && (
        <PB
          label={['See What AgentKit Can Do →', 'Define Agent Goal →', '', ''][step]}
          onPress={() => setStep(s => (s + 1) as any)}
        />
      )}
      {step === 2 && (
        <PB
          label={agentRunning ? 'Running…' : agentActions.length === 0 ? 'Run Agent →' : 'Continue →'}
          onPress={agentActions.length === 0 ? runAgent : () => setStep(3)}
          disabled={agentRunning}
        />
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L158 — baseMemeculture ────────────────────────────────────────────────────
export function BaseMemecultureSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    {
      name: 'BRETT',
      description: 'Blue friend of Pepe. First major Base memecoin cultural export.',
      mcap: '$420M peak', founders: 'Anonymous', launchVenue: 'pump.fun-style on Base',
      why: 'First mover + Pepe universe lore + Base native identity', status: 'Established',
      risk: 'low-medium',
    },
    {
      name: 'DEGEN',
      description: 'Tipping token of Farcaster. Social layer token for Base\'s native social network.',
      mcap: '$80M peak', founders: 'Farcaster community', launchVenue: 'Farcaster channel',
      why: 'Actual utility (tipping on Farcaster) + community-owned', status: 'Utility + meme',
      risk: 'low-medium',
    },
    {
      name: 'NEWBASE',
      description: 'Generic "Base ecosystem" token. Just launched. No utility stated.',
      mcap: '$2M', founders: 'Anonymous, 3 weeks old', launchVenue: 'Telegram group',
      why: 'None — riding Base hype', status: 'Speculative',
      risk: 'high',
    },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct: Record<string, string> = { BRETT: 'watch', DEGEN: 'research', NEWBASE: 'avoid' };
  const score = tokens.filter(t => answers[t.name] === correct[t.name]).length;

  return (
    <SimShell icon="🔵" title="Base Memecoin Culture" subtitle="Base has its own meme identity. Learn to separate culturally-embedded tokens from generic hype.">
      <Card>
        <Text style={s.h2}>
          Base memecoins often build on Farcaster social networks and Coinbase's onchain culture. Tokens with genuine community utility (tipping, identity) differ from pure speculation.
        </Text>
      </Card>
      {tokens.map(t => (
        <Card key={t.name} style={{ borderColor: checked ? (answers[t.name] === correct[t.name] ? Colors.green : Colors.red) : Colors.border }}>
          <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: 4 }}>{t.name}</Text>
          <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginBottom: Spacing.md }}>{t.description}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
            {[['MC', t.mcap], ['Status', t.status], ['Launch', t.launchVenue]].map(([k, v]) => (
              <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16, marginBottom: Spacing.md }}>💡 Why it exists: {t.why}</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[{ id: 'research', l: '🔬 Research' }, { id: 'watch', l: '👀 Watchlist' }, { id: 'avoid', l: '⛔ Avoid' }].map(opt => {
              const isCh = answers[t.name] === opt.id;
              const isCo = opt.id === correct[t.name];
              let bg = Colors.card, border = Colors.border;
              if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
              if (checked && isCh && !iCo) { bg = '#fee2e2'; border = Colors.red; }
              if (checked && !iCh && iCo)  { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={opt.id} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [t.name]: opt.id }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 11, color: Colors.text, textAlign: 'center' }}>{opt.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      ))}
      {!checked
        ? <PB label="Submit →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <><OK good={score >= 2} msg={`${score}/3 — BRETT (cultural identity), DEGEN (Farcaster utility), NEWBASE (generic hype). Cultural embedding ≠ safety, but it's a meaningful differentiator.`} />
          <PB label="Continue →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L165 — baseBoss ───────────────────────────────────────────────────────────
export function BaseBossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'A developer wants to accept Bitcoin as collateral in a Base DeFi protocol. Best asset to use?',
      options: ['wBTC (Ethereum-based)', 'cbBTC (Coinbase-backed, Base-native)', 'Native BTC via a bridge'],
      correct: 1,
      reason: 'cbBTC lives natively on Base, has $0.02 gas, Coinbase backing, and quarterly audits. wBTC on Ethereum would cost $10–50 per interaction.',
    },
    {
      q: 'You want to earn the highest sustainable yield on Base. Your strategy:',
      options: ['Hold AERO tokens and hope for price appreciation', 'Provide LP to volatile pools + lock AERO for veAERO to earn bribes', 'Buy the most popular memecoin on Base'],
      correct: 1,
      reason: 've(3,3): LP earns fees + emissions, veAERO earns bribes. This is the designed value capture mechanism of Aerodrome.',
    },
    {
      q: 'You need an AI agent to auto-rebalance your portfolio on Base daily. You use:',
      options: ['A trading bot on a CEX', 'Coinbase AgentKit connected to your Base wallet', 'Manual rebalancing via Aerodrome UI'],
      correct: 1,
      reason: 'AgentKit gives AI models on-chain tools on Base. It can execute swaps, check balances, and bridge — autonomously and permissionlessly.',
    },
    {
      q: 'Base\'s biggest regulatory advantage over other L2s is:',
      options: ['It\'s the cheapest L2', 'Coinbase\'s institutional backing and US regulatory compliance', 'It has the most validators'],
      correct: 1,
      reason: 'Coinbase is a publicly traded US company with SEC compliance. Base inherits this institutional trust — crucial for enterprise and institutional DeFi.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="⭐" title="BOSS: Base Ecosystem" subtitle="Four real-world Base decisions.">
      {questions.map((q, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: done ? (chosen === q.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            {q.options.map((opt, j) => {
              let bg = Colors.card, border = Colors.border;
              if (done && chosen === j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              if (done && chosen === j && j !== q.correct) { bg = '#fee2e2'; border = Colors.red; }
              if (done && chosen !== j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={j} disabled={done} onPress={() => setAnswers(a => ({ ...a, [i]: j }))}
                  style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
                    backgroundColor: chosen === j && !done ? Colors.accentSoft : bg,
                    borderColor: chosen === j && !done ? Colors.accent : border }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {done && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {q.reason}</Text>}
          </Card>
        );
      })}
      {!done
        ? <PB label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} />
        : <><OK good={score >= 3} msg={`${score}/4 — ${score >= 3 ? 'Base mastered! cbBTC + ve(3,3) + AgentKit + regulatory positioning = Base\'s full value stack.' : 'Review: cbBTC (native Bitcoin), Aerodrome ve(3,3) (yield), AgentKit (autonomous agents), Coinbase compliance (trust).'}`} />
          <PB label="Return to Island Map →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 13 — TON & TELEGRAM
// ═════════════════════════════════════════════════════════════════════════════

// ── L168 — tonMiniAppDex ──────────────────────────────────────────────────────
export function TonMiniAppDexSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<'open' | 'swap' | 'confirm' | 'done'>('open');
  const [amount, setAmount] = useState('50');
  const [openedApp, setOpenedApp] = useState(false);
  const amtF = parseFloat(amount) || 0;
  const received = (amtF * 6.8).toFixed(2); // TON/USDT rate approx

  return (
    <SimShell icon="💬" title="STON.fi via Telegram Mini App" subtitle="Swap tokens without leaving Telegram. This is TON's distribution advantage — 900M+ users, zero install friction.">
      {step === 'open' && (
        <>
          <Card>
            <Text style={s.h2}>
              Telegram Mini Apps are web apps that run natively inside Telegram. STON.fi (TON's largest DEX) is accessible directly as a Mini App — no wallet setup, no browser extension, no app download.
            </Text>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
              {[
                ['Users needed', '900M+ Telegram users'],
                ['Friction', 'Zero — already in Telegram'],
                ['Wallet', 'TON Space (built-in)'],
                ['Setup time', '<30 seconds'],
              ].map(([k, v]) => (
                <View key={k} style={s.row}>
                  <Text style={s.rk}>{k}</Text>
                  <Text style={[s.rv, { fontWeight: '800', color: Colors.text }]}>{v}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setOpenedApp(true)}
              style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md,
                backgroundColor: openedApp ? '#d1fae5' : '#0088cc', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm }}>
              <Text style={{ fontSize: 20 }}>💬</Text>
              <Text style={{ color: '#fff', fontWeight: '900' }}>{openedApp ? '✅ STON.fi Mini App Open' : 'Open STON.fi in Telegram'}</Text>
            </TouchableOpacity>
          </Card>
          <PB label="Proceed to Swap →" onPress={() => setStep('swap')} disabled={!openedApp} />
        </>
      )}

      {step === 'swap' && (
        <>
          <Card style={{ borderColor: '#0088cc' }}>
            <Text style={[s.fl, { color: '#0088cc' }]}>STON.fi — TON'S UNISWAP</Text>
            <Text style={s.fl}>SELL (TON)</Text>
            <TextInput style={s.inp} value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" placeholder="TON amount" placeholderTextColor={Colors.textMuted} />
            <View style={{ padding: Spacing.md, backgroundColor: '#f3f4f6', borderRadius: Radius.md, marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '900', fontSize: FontSize.xl, color: Colors.green }}>{received}</Text>
                <Text style={{ fontWeight: '900', color: Colors.text }}>USDT</Text>
              </View>
            </View>
            <View style={s.row}><Text style={s.rk}>Rate</Text><Text style={s.rv}>1 TON ≈ 6.8 USDT</Text></View>
            <View style={s.row}><Text style={s.rk}>Fee (0.3%)</Text><Text style={s.rv}>{(amtF * 0.003).toFixed(3)} TON</Text></View>
            <View style={s.row}><Text style={s.rk}>Gas</Text><Text style={[s.rv, { color: Colors.green }]}>~0.01 TON (~$0.07)</Text></View>
          </Card>
          <PB label="Review Swap →" onPress={() => setStep('confirm')} disabled={amtF <= 0} />
        </>
      )}

      {step === 'confirm' && (
        <>
          <Card>
            <Text style={s.fl}>CONFIRM — FROM TON SPACE (TELEGRAM WALLET)</Text>
            <View style={s.row}><Text style={s.rk}>Selling</Text><Text style={[s.rv, { fontWeight: '900' }]}>{amount} TON</Text></View>
            <View style={s.row}><Text style={s.rk}>Receiving</Text><Text style={[s.rv, { fontWeight: '900', color: Colors.green }]}>{received} USDT</Text></View>
            <View style={s.row}><Text style={s.rk}>All inside</Text><Text style={[s.rv, { color: '#0088cc' }]}>Telegram</Text></View>
          </Card>
          <PB label="✓ Confirm in Telegram" onPress={() => setStep('done')} />
        </>
      )}

      {step === 'done' && (
        <>
          <OK good msg={`Swapped ${amount} TON → ${received} USDT inside Telegram! No browser. No wallet extension. No app download. This is why TON's distribution moat is unique.`} />
          <Card>
            <Text style={s.fl}>THE 900M USER ADVANTAGE</Text>
            <Text style={s.blt}>• Ethereum DeFi: requires MetaMask, browser, on-ramp — 5+ steps</Text>
            <Text style={s.blt}>• TON DeFi: open Telegram, tap Mini App, swap — 3 taps</Text>
            <Text style={s.blt}>• Every Telegram user already has a TON Space wallet</Text>
            <Text style={s.blt}>• STON.fi, DeDust, Tonkeeper all have Mini App versions</Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L171 — fragmentTrading ────────────────────────────────────────────────────
export function FragmentTradingSim({ onComplete, onSkip }: SimProps) {
  const listings = [
    { username: '@crypto', price: '420 TON', lastSold: '380 TON 2 weeks ago', holders: 1, type: 'username', value: 'premium' },
    { username: '+1 (555) 123-4567', price: '12 TON', lastSold: 'Never', holders: 0, type: 'phone', value: 'normal' },
    { username: '@x', price: '15,000 TON', lastSold: '12,000 TON 1 month ago', holders: 1, type: 'username', value: 'ultra-premium' },
  ];

  const [bid, setBid] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState(false);

  const item = selected !== null ? listings[selected] : null;

  return (
    <SimShell icon="🔤" title="Fragment — On-Chain Telegram Usernames" subtitle="Fragment is where Telegram usernames and phone numbers are bought and sold on TON blockchain.">
      <Card>
        <Text style={s.h2}>
          Fragment allows ownership of Telegram usernames (e.g. @crypto) and anonymous phone numbers via TON NFTs. Ownership = blockchain-verifiable. Trading = permissionless. Short usernames command significant premiums.
        </Text>
      </Card>

      <Text style={s.fl}>ACTIVE LISTINGS</Text>
      {listings.map((l, i) => (
        <TouchableOpacity key={i} disabled={placed} onPress={() => setSelected(i)}
          style={[{ padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2, marginBottom: Spacing.sm,
            borderColor: selected === i ? Colors.accent : Colors.border,
            backgroundColor: selected === i ? Colors.accentSoft : Colors.card }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontWeight: '900', color: Colors.text, fontSize: FontSize.lg }}>{l.username}</Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>
                {l.type === 'phone' ? '📞 Anonymous number' : '💬 Telegram username'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '900', color: Colors.accent }}>{l.price}</Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>
                {l.lastSold === 'Never' ? 'Never sold' : `Last: ${l.lastSold}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {selected !== null && !placed && (
        <Card>
          <Text style={s.fl}>PLACE A BID FOR {item?.username}</Text>
          <Text style={s.h2}>Bids are escrowed on TON blockchain. Seller has 24 hours to accept or reject.</Text>
          <TextInput style={s.inp} value={bid} onChangeText={setBid}
            keyboardType="decimal-pad" placeholder={`e.g. ${item?.price.split(' ')[0]}`} placeholderTextColor={Colors.textMuted} />
          <PB label={`Place Bid for ${bid || '?'} TON →`} onPress={() => setPlaced(true)} disabled={!bid || parseFloat(bid) <= 0} />
        </Card>
      )}

      {placed && item && (
        <>
          <OK good msg={`Bid of ${bid} TON placed for ${item.username}! Funds escrowed on TON. Seller notified via Telegram.`} />
          <Card>
            <Text style={s.fl}>HOW FRAGMENT WORKS</Text>
            <Text style={s.blt}>• Telegram username = NFT on TON blockchain</Text>
            <Text style={s.blt}>• Ownership verified on-chain — no Telegram trust needed</Text>
            <Text style={s.blt}>• Short usernames (@a, @x, @crypto) = scarce digital real estate</Text>
            <Text style={s.blt}>• Anonymous phone numbers: use Telegram without revealing your number</Text>
            <Text style={s.blt}>• Revenue goes to TON ecosystem (Telegram agreed to this)</Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L180 — tonBoss ────────────────────────────────────────────────────────────
export function TonBossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'Why does TON have a distribution advantage over all other blockchains?',
      options: ['It has the fastest transactions', 'Every Telegram user has a built-in TON wallet — 900M potential users with zero onboarding', 'It has the lowest fees'],
      correct: 1,
      reason: 'TON Space is embedded in Telegram. 900M users → wallet already created → one tap to DeFi. No other chain has removed the wallet setup barrier at this scale.',
    },
    {
      q: 'You earn Notcoin tokens from a play-to-airdrop game on Telegram. The tokens\' value is determined by:',
      options: ['The amount you tapped', 'Your share of total taps × token allocation at launch', 'The Telegram team\'s decision'],
      correct: 1,
      reason: 'Airdrop allocation = your taps ÷ total protocol taps × total token pool. Your share of engagement = your share of tokens.',
    },
    {
      q: 'You want to buy the Telegram username @alpha on Fragment. What actually secures your ownership?',
      options: ['Telegram\'s central database', 'A TON blockchain NFT — provably on-chain, permissionlessly tradeable', 'A signed PDF from Telegram'],
      correct: 1,
      reason: 'Fragment usernames are TON NFTs. Ownership is verifiable on-chain, tradeable without Telegram\'s permission, and censorship-resistant.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="⭐" title="BOSS: TON & Telegram" subtitle="Three questions testing TON's unique value proposition.">
      {questions.map((q, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: done ? (chosen === q.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            {q.options.map((opt, j) => {
              let bg = Colors.card, border = Colors.border;
              if (done && chosen === j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              if (done && chosen === j && j !== q.correct) { bg = '#fee2e2'; border = Colors.red; }
              if (done && chosen !== j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={j} disabled={done} onPress={() => setAnswers(a => ({ ...a, [i]: j }))}
                  style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
                    backgroundColor: chosen === j && !done ? Colors.accentSoft : bg,
                    borderColor: chosen === j && !done ? Colors.accent : border }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {done && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {q.reason}</Text>}
          </Card>
        );
      })}
      {!done
        ? <PB label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} />
        : <><OK good={score >= 2} msg={`${score}/3 — ${score >= 2 ? 'TON mastered! Distribution moat + Mini Apps + Fragment = TON\'s three unique advantages.' : 'Core insight: TON\'s edge is 900M users with zero onboarding friction, not technical metrics.'}`} />
          <PB label="Return to Island Map →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ISLAND 15 — COINBASE DEEP DIVE
// ═════════════════════════════════════════════════════════════════════════════

// ── L186 — cbCdpStablecoin ────────────────────────────────────────────────────
export function CbCdpStablecoinSim({ onComplete, onSkip }: SimProps) {
  const [collateral, setCollateral] = useState('1');
  const [borrowAmt, setBorrowAmt] = useState('1500');
  const [confirmed, setConfirmed] = useState(false);

  const ETH_PRICE = 3247;
  const colF = parseFloat(collateral) || 0;
  const borF = parseFloat(borrowAmt) || 0;
  const colUsd = colF * ETH_PRICE;
  const ltv = colUsd > 0 ? (borF / colUsd * 100).toFixed(0) : '0';
  const maxLtv = 75;
  const liquidationPrice = borF > 0 ? (borF / (colF * (maxLtv / 100))).toFixed(0) : '0';
  const healthFactor = colUsd > 0 ? (colUsd * (maxLtv / 100) / borF).toFixed(2) : '0';
  const isRisky = parseFloat(healthFactor) < 1.2;

  return (
    <SimShell icon="🏦" title="Coinbase CDP — Borrow cbUSD Against ETH" subtitle="Coinbase's decentralised stablecoin protocol. Deposit ETH, borrow cbUSD — permissionlessly.">
      <Card>
        <Text style={s.h2}>
          CDP (Collateralised Debt Position): deposit ETH → borrow cbUSD (a dollar-pegged stablecoin) → keep your ETH exposure while accessing liquidity. If ETH price drops enough, your position liquidates.
        </Text>
      </Card>
      <Card>
        <Text style={s.fl}>COLLATERAL (ETH @ $3,247)</Text>
        <TextInput style={s.inp} value={collateral} onChangeText={setCollateral} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <View style={s.row}><Text style={s.rk}>Collateral value</Text><Text style={[s.rv, { fontWeight: '900' }]}>${colUsd.toLocaleString()}</Text></View>
        <View style={s.row}><Text style={s.rk}>Max borrow (75% LTV)</Text><Text style={[s.rv, { color: Colors.accent }]}>${(colUsd * 0.75).toFixed(0)} cbUSD</Text></View>
      </Card>
      <Card>
        <Text style={s.fl}>BORROW cbUSD</Text>
        <TextInput style={s.inp} value={borrowAmt} onChangeText={setBorrowAmt} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        {borF > colUsd * 0.75 && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginBottom: 4 }}>Exceeds 75% LTV — not allowed</Text>}
        <View style={s.row}><Text style={s.rk}>Current LTV</Text><Text style={[s.rv, { color: parseFloat(ltv) > 65 ? Colors.red : Colors.green }]}>{ltv}%</Text></View>
        <View style={s.row}><Text style={s.rk}>Health Factor</Text><Text style={[s.rv, { color: isRisky ? Colors.red : Colors.green, fontWeight: '900' }]}>{healthFactor} {isRisky ? '⚠️' : '✅'}</Text></View>
        <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
          <Text style={s.rk}>Liquidation at ETH</Text>
          <Text style={[s.rv, { color: Colors.red, fontWeight: '900' }]}>${liquidationPrice}</Text>
        </View>
      </Card>

      {!confirmed ? (
        <PB label={borF > colUsd * 0.75 ? 'Reduce borrow amount' : `Open CDP — Borrow ${borrowAmt} cbUSD →`}
          onPress={() => setConfirmed(true)} disabled={borF > colUsd * 0.75 || borF <= 0} />
      ) : (
        <>
          <OK good={!isRisky} msg={isRisky
            ? `CDP open but health factor ${healthFactor} is risky. ETH needs to drop only ${((parseFloat(liquidationPrice) / ETH_PRICE) * 100).toFixed(0)}% to liquidate you.`
            : `CDP open! You have ${borrowAmt} cbUSD to deploy in DeFi while keeping your ETH. Monitor health factor as ETH price fluctuates.`} />
          <Card>
            <Text style={s.fl}>CDP vs TRADITIONAL LOAN</Text>
            <Text style={s.blt}>• No credit check, no bank approval — permissionless</Text>
            <Text style={s.blt}>• cbUSD is 1:1 pegged to USD — stable purchasing power</Text>
            <Text style={s.blt}>• Your ETH stays yours — never sold, just locked</Text>
            <Text style={s.blt}>• Risk: ETH price crash → liquidation bot closes position</Text>
            <Text style={s.blt}>• Built on Base Sepolia — sub-cent gas for all operations</Text>
          </Card>
          <PB label="Continue →" onPress={onComplete} />
        </>
      )}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L188 — cbPrimeVsRetail ────────────────────────────────────────────────────
export function CbPrimeVsRetailSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    {
      q: 'A $50M hedge fund needs to buy $5M of BTC without moving the market',
      options: ['Coinbase.com (retail exchange)', 'Coinbase Advanced Trade', 'Coinbase Prime OTC desk'],
      correct: 2,
      reason: 'Coinbase Prime OTC executes large block trades off the order book. A $5M market buy on retail would cause massive slippage and market impact.',
    },
    {
      q: 'A pension fund needs custody of $200M in ETH with insurance and regulatory compliance',
      options: ['Hardware wallet (self-custody)', 'Coinbase Prime custody', 'MetaMask'],
      correct: 1,
      reason: 'Coinbase Prime custody: $500M insurance, institutional-grade SOC2 security, regulatory reporting, HSM key management. Not possible with retail tools.',
    },
    {
      q: 'A retail investor wants to buy $500 of ETH with a limit order and low fees',
      options: ['Coinbase.com basic', 'Coinbase Advanced Trade', 'Coinbase Prime'],
      correct: 1,
      reason: 'Advanced Trade: 0.006% maker fee (vs 0.6% basic), limit orders, full charting. Prime requires $1M+ minimum and institutional KYC.',
    },
    {
      q: 'A protocol wants to stake $100M ETH and earn yield with institutional compliance',
      options: ['Rocket Pool (decentralised)', 'Coinbase Prime staking', 'Lido (pooled)'],
      correct: 1,
      reason: 'Coinbase Prime staking: institutional SLAs, regulatory reporting, insurance, dedicated relationship manager. Required for pension funds and endowments.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="🏛️" title="Coinbase Retail vs Prime vs Advanced" subtitle="Coinbase has three distinct products for three types of customers. Know which one to use when.">
      {scenarios.map((q, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: checked ? (chosen === q.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            {q.options.map((opt, j) => {
              let bg = Colors.card, border = Colors.border;
              if (checked && chosen === j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              if (checked && chosen === j && j !== q.correct) { bg = '#fee2e2'; border = Colors.red; }
              if (checked && chosen !== j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={j} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: j }))}
                  style={{ padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, backgroundColor: bg, borderColor: border }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {q.reason}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PB label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <><OK good={score >= 3} msg={`${score}/4 — Retail = small amounts, basic UX. Advanced Trade = active traders, low fees. Prime = institutions, $1M+ minimums, OTC, custody insurance.`} />
          <PB label="Continue →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── L195 — coinbaseBoss ───────────────────────────────────────────────────────
export function CoinbaseBossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'A user holds 2 ETH on Coinbase.com. Who controls the private key?',
      options: ['The user', 'Coinbase', 'No one — it\'s decentralised'],
      correct: 1,
      reason: 'Coinbase.com is custodial — they hold the keys. You hold the claim. If Coinbase fails, your assets are at risk. This is why self-custody matters for meaningful amounts.',
    },
    {
      q: 'Coinbase\'s regulatory strategy centres on:',
      options: ['Avoiding all regulation by operating offshore', 'Proactive US compliance as competitive moat vs offshore exchanges', 'Paying the minimum possible regulatory fees'],
      correct: 1,
      reason: 'Coinbase\'s entire strategy is compliance-as-moat: US-listed company, SEC registered, fighting for clear rules. This enables institutional partnerships Binance can\'t have.',
    },
    {
      q: 'cbBTC\'s primary trust assumption compared to wBTC is:',
      options: ['Coinbase instead of BitGo/DAO as custodian', 'It\'s on Base instead of Ethereum', 'It has lower gas fees'],
      correct: 0,
      reason: 'The fundamental trust question: who holds the Bitcoin? For cbBTC: Coinbase (publicly traded, US regulated). For wBTC: BitGo + DAO. Same asset, different custodian trust models.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <SimShell icon="⭐" title="BOSS: Coinbase Deep Dive" subtitle="Three questions on Coinbase's products and strategy.">
      {questions.map((q, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: done ? (chosen === q.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{q.q}</Text>
            {q.options.map((opt, j) => {
              let bg = Colors.card, border = Colors.border;
              if (done && chosen === j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              if (done && chosen === j && j !== q.correct) { bg = '#fee2e2'; border = Colors.red; }
              if (done && chosen !== j && j === q.correct) { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={j} disabled={done} onPress={() => setAnswers(a => ({ ...a, [i]: j }))}
                  style={{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
                    backgroundColor: chosen === j && !done ? Colors.accentSoft : bg,
                    borderColor: chosen === j && !done ? Colors.accent : border }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {done && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {q.reason}</Text>}
          </Card>
        );
      })}
      {!done
        ? <PB label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={Object.keys(answers).length < questions.length} />
        : <><OK good={score >= 2} msg={`${score}/3 — ${score >= 2 ? 'Coinbase mastered! Custodial vs self-custody, compliance strategy, and cbBTC trust model are the three pillars.' : 'Key: Coinbase.com = they hold keys. Compliance = their moat. cbBTC = Coinbase as custodian.'}`} />
          <PB label="Return to Island Map →" onPress={onComplete} /></>}
      <GB label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
