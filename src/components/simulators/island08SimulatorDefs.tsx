/**
 * island08SimulatorDefs.tsx
 *
 * Interactive simulator components for Island 8 — Bridges & L2s (Levels 76–90).
 * Register each in SimulatorCard.tsx's SIMULATORS map:
 *
 *   bridgeLockMint       → L76
 *   bridgeSecurity       → L77
 *   optimisticRollup     → L78
 *   zkVsOptimistic       → L79
 *   l2FeeCalc            → L80
 *   liquidityBridge      → L81
 *   bridgeEval           → L82
 *   multiChainPortfolio  → L83
 *   l2Ecosystem          → L84
 *   safeBridgingDrill    → L85
 *   bridgeAggregator     → L86
 *   zkProofDemo          → L87
 *   trilemma             → L88
 *   intentBridge         → L89
 *   bridgeBoss           → L90
 *
 * All components follow existing SimulatorCard.tsx patterns:
 *   SimShell, Card, PrimaryBtn, GhostBtn, ResultBox, chip, s styles.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

// ── Re-exported shared primitives (mirror SimulatorCard.tsx) ─────────────────
interface SimProps { onComplete: () => void; onSkip: () => void; }

function SimShell({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: string; children: React.ReactNode;
}) {
  return (
    <ScrollView style={shell.wrap} contentContainerStyle={shell.content} showsVerticalScrollIndicator={false}>
      <View style={shell.header}>
        <Text style={shell.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={shell.label}>⚡ TRY IT NOW</Text>
          <Text style={shell.title}>{title}</Text>
          <Text style={shell.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}
const shell = StyleSheet.create({
  wrap: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  header: { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  icon: { fontSize: 36, lineHeight: 44 },
  label: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 },
});
function PrimaryBtn({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[btn.primary, disabled && btn.disabled]}>
      <Text style={btn.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}
function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={btn.ghost}>
      <Text style={btn.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}
const btn = StyleSheet.create({
  primary: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  disabled: { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  ghost: { alignItems: 'center', paddingVertical: Spacing.md },
  ghostText: { color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' },
});
function ResultBox({ correct, message }: { correct: boolean; message: string }) {
  return (
    <View style={[res.box, { backgroundColor: correct ? '#d1fae5' : '#fee2e2', borderColor: correct ? Colors.green : Colors.red }]}>
      <Text style={res.icon}>{correct ? '✅' : '❌'}</Text>
      <Text style={[res.msg, { color: correct ? '#065f46' : '#7f1d1d' }]}>{message}</Text>
    </View>
  );
}
const res = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5 },
  icon: { fontSize: 20 },
  msg: { flex: 1, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 19 },
});
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[card.box, Shadow.sm, style]}>{children}</View>;
}
const card = StyleSheet.create({
  box: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg },
});
const chip = StyleSheet.create({
  base: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card },
  active: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  text: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSoft },
  activeText: { color: Colors.accent },
});
const s = StyleSheet.create({
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowKey: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  rowVal: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '700', flex: 1, textAlign: 'right' },
  bullet: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: 2 },
  hint2: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, backgroundColor: Colors.card },
});

// ─────────────────────────────────────────────────────────────────────────────
// L76 — bridgeLockMint
// Lock-and-mint visualiser with optional hack simulation
// ─────────────────────────────────────────────────────────────────────────────
export function BridgeLockMintSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<'idle' | 'locking' | 'minting' | 'done' | 'hacked'>('idle');
  const [amount, setAmount] = useState('1');
  const [showHack, setShowHack] = useState(false);
  const lockAnim  = useRef(new Animated.Value(0)).current;
  const mintAnim  = useRef(new Animated.Value(0)).current;

  const amtF = parseFloat(amount) || 0;

  const doBridge = () => {
    setStep('locking');
    Animated.timing(lockAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start(() => {
      setStep('minting');
      Animated.timing(mintAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start(() => {
        setStep('done');
        setShowHack(true);
      });
    });
  };

  const doHack = () => setStep('hacked');
  const reset  = () => { setStep('idle'); lockAnim.setValue(0); mintAnim.setValue(0); setShowHack(false); };

  const ethBarWidth  = lockAnim.interpolate({ inputRange: [0, 1], outputRange: ['100%', '0%'] });
  const arbBarWidth  = mintAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SimShell icon="🌉" title="Lock-and-Mint Bridge" subtitle="Watch ETH lock on Ethereum and appear on Arbitrum — then see what happens in a hack.">
      <Card>
        <Text style={s.fieldLabel}>AMOUNT TO BRIDGE (ETH)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholder="e.g. 1" placeholderTextColor={Colors.textMuted}
          editable={step === 'idle'} />

        {/* Ethereum balance bar */}
        <View style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontWeight: '800', color: step === 'hacked' ? Colors.red : Colors.text }}>🔷 Ethereum</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>
              {step === 'hacked' ? '⚠️ DRAINED' : step === 'done' || step === 'minting' ? `${amtF} ETH LOCKED` : `${amtF} ETH`}
            </Text>
          </View>
          <View style={{ height: 12, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
            <Animated.View style={[{ height: 12, borderRadius: 99 },
              { width: step === 'hacked' ? '0%' : ethBarWidth,
                backgroundColor: step === 'hacked' ? Colors.red : '#627eea' }]} />
          </View>
          {(step === 'minting' || step === 'done') && (
            <Text style={{ fontSize: FontSize.xs, color: '#627eea', marginTop: 2, fontWeight: '700' }}>
              🔒 {amtF} ETH locked in bridge contract
            </Text>
          )}
        </View>

        {/* Arbitrum balance bar */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontWeight: '800', color: step === 'hacked' ? Colors.red : Colors.text }}>🔵 Arbitrum</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>
              {step === 'hacked' ? '💀 WORTHLESS' : 'wETH (bridged)'}
            </Text>
          </View>
          <View style={{ height: 12, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
            <Animated.View style={[{ height: 12, borderRadius: 99 },
              { width: step === 'hacked' ? arbBarWidth : arbBarWidth,
                backgroundColor: step === 'hacked' ? Colors.red : '#28a0f0' }]} />
          </View>
        </View>
      </Card>

      {step === 'idle' && (
        <PrimaryBtn label={`Bridge ${amount || '?'} ETH to Arbitrum →`} onPress={doBridge} disabled={amtF <= 0} />
      )}

      {step === 'locking' && (
        <Card>
          <Text style={{ textAlign: 'center', fontSize: FontSize.md, fontWeight: '800', color: Colors.text }}>
            🔒 Locking ETH in bridge contract…
          </Text>
          <Text style={[s.hint2, { textAlign: 'center', marginTop: 4 }]}>
            Your ETH is being sent to the Arbitrum bridge contract on Ethereum mainnet.
          </Text>
        </Card>
      )}

      {step === 'minting' && (
        <Card>
          <Text style={{ textAlign: 'center', fontSize: FontSize.md, fontWeight: '800', color: Colors.text }}>
            ✨ Minting wETH on Arbitrum…
          </Text>
          <Text style={[s.hint2, { textAlign: 'center', marginTop: 4 }]}>
            The bridge contract on Arbitrum creates equivalent wETH for you.
          </Text>
        </Card>
      )}

      {step === 'done' && (
        <>
          <ResultBox correct message={`Bridged! ${amtF} ETH locked on Ethereum. ${amtF} wETH available on Arbitrum. They are 1:1 redeemable.`} />
          {showHack && (
            <Card style={{ borderColor: Colors.red }}>
              <Text style={[s.fieldLabel, { color: Colors.red }]}>⚠️ HACK SIMULATION</Text>
              <Text style={s.hint2}>
                The bridge contract now holds {amtF} ETH (plus everyone else's). If an attacker finds a vulnerability in the bridge contract, they can drain ALL locked funds. Your wETH becomes worthless.
              </Text>
              <TouchableOpacity onPress={doHack} style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: Colors.red, borderRadius: Radius.md, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>💥 Simulate Bridge Hack</Text>
              </TouchableOpacity>
            </Card>
          )}
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      {step === 'hacked' && (
        <>
          <Card style={{ borderColor: Colors.red, backgroundColor: '#fff5f5' }}>
            <Text style={{ fontSize: 36, textAlign: 'center' }}>💀</Text>
            <Text style={{ fontWeight: '900', color: Colors.red, textAlign: 'center', fontSize: FontSize.lg }}>BRIDGE HACKED</Text>
            <Text style={[s.hint2, { textAlign: 'center', marginTop: Spacing.sm }]}>
              The bridge contract was drained. Your ETH on Ethereum is gone. Your wETH on Arbitrum is now an IOU for nothing — worthless.
            </Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.red, fontWeight: '800', textAlign: 'center', marginTop: Spacing.sm }}>
              This is exactly what happened to Ronin ($625M) and Wormhole ($320M).
            </Text>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>WHY BRIDGES ARE TARGETS</Text>
            <Text style={s.bullet}>• Bridges hold ALL locked assets in one contract</Text>
            <Text style={s.bullet}>• One exploit = billions potentially drained</Text>
            <Text style={s.bullet}>• Always use canonical bridges for large amounts</Text>
            <Text style={s.bullet}>• Canonical = Ethereum-level security (Arbitrum official)</Text>
          </Card>
          <TouchableOpacity onPress={reset} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
            <Text style={{ color: Colors.accent, fontWeight: '700' }}>↩ Reset simulation</Text>
          </TouchableOpacity>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L77 — bridgeSecurity
// Pick a bridge security model — see consequences
// ─────────────────────────────────────────────────────────────────────────────
export function BridgeSecuritySim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('50000');
  const [chosen, setChosen] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'good' | 'bad' | null>(null);

  const bridges = [
    {
      id: 'canonical',
      name: 'Arbitrum Official Bridge',
      time: '7 days',
      security: 'Ethereum consensus',
      fee: '$2',
      risk: 'low',
      icon: '🔒',
      consequence: 'good',
      message: 'Correct choice for $50,000. Your funds arrive in 7 days with Ethereum-level security. The wait is the price of certainty.',
    },
    {
      id: 'across',
      name: 'Across Protocol',
      time: '30 min',
      security: 'Optimistic oracle',
      fee: '$30',
      risk: 'medium',
      icon: '⚡',
      consequence: 'good',
      message: 'Also acceptable. Across has 2+ year TVL, Trail of Bits audit, and optimistic oracle security. 30 minutes vs 7 days is worth $28 extra for most users.',
    },
    {
      id: 'multisig',
      name: 'QuickBridge (new)',
      time: '2 min',
      security: '3-of-5 multisig',
      fee: '$5',
      risk: 'high',
      icon: '💨',
      consequence: 'bad',
      message: 'Bridge hacked 3 days later. 2 key holders were social-engineered. Your $50,000 is gone. Cheap fees are worthless when the bridge fails.',
    },
  ];

  const selected = bridges.find(b => b.id === chosen);

  const confirm = () => {
    if (!selected) return;
    setOutcome(selected.consequence as 'good' | 'bad');
  };

  const reset = () => { setChosen(null); setOutcome(null); };

  const riskColor = (r: string) => r === 'low' ? Colors.green : r === 'medium' ? '#f59e0b' : Colors.red;
  const riskBg    = (r: string) => r === 'low' ? '#d1fae5' : r === 'medium' ? '#fef3c7' : '#fee2e2';

  return (
    <SimShell icon="🛡️" title="Choose Your Bridge" subtitle="You need to move $50,000 USDC from Ethereum to Arbitrum. Which bridge do you use?">
      <Card>
        <Text style={s.fieldLabel}>AMOUNT</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted}
          editable={!outcome} />
        <Text style={[s.hint2, { color: Colors.red, fontWeight: '700' }]}>
          ⚠️ At $50,000, your bridge security choice is a capital decision.
        </Text>
      </Card>

      {!outcome ? (
        <>
          {bridges.map(b => (
            <TouchableOpacity key={b.id} onPress={() => setChosen(b.id)} style={[card.box, Shadow.sm, {
              borderColor: chosen === b.id ? Colors.accent : Colors.border,
              borderWidth: chosen === b.id ? 2 : 1.5,
              backgroundColor: chosen === b.id ? Colors.accentSoft : Colors.card,
            }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontWeight: '900', color: Colors.text }}>{b.icon} {b.name}</Text>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: 4, flexWrap: 'wrap' }}>
                    {[['⏱', b.time], ['🛡', b.security], ['💸', b.fee]].map(([icon, val]) => (
                      <View key={val} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, color: Colors.textSoft }}>{icon} {val}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{ paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: riskBg(b.risk) }}>
                  <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: riskColor(b.risk), textTransform: 'uppercase' }}>{b.risk} risk</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <PrimaryBtn label="Confirm Bridge Choice →" onPress={confirm} disabled={!chosen} />
        </>
      ) : (
        <>
          <ResultBox correct={outcome === 'good'} message={selected?.message || ''} />
          {outcome === 'bad' && (
            <Card style={{ borderColor: Colors.red }}>
              <Text style={s.fieldLabel}>WHAT WENT WRONG</Text>
              <Text style={s.bullet}>• 3-of-5 multisig = only 3 people control $millions</Text>
              <Text style={s.bullet}>• Social engineering compromised 2 key holders</Text>
              <Text style={s.bullet}>• No code bug needed — human vulnerability was enough</Text>
              <Text style={s.bullet}>• Ronin ($625M) used exactly this model</Text>
            </Card>
          )}
          <Card>
            <Text style={s.fieldLabel}>THE SECURITY SPECTRUM</Text>
            <Text style={s.bullet}>🔒 Canonical — Ethereum validators (~$500K+)</Text>
            <Text style={s.bullet}>⚡ Optimistic — Battle-tested, oracle-secured ($50K+)</Text>
            <Text style={s.bullet}>💨 Multisig — Fast, cheap, fragile (small amounts only)</Text>
          </Card>
          <TouchableOpacity onPress={reset} style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
            <Text style={{ color: Colors.accent, fontWeight: '700' }}>↩ Try a different bridge</Text>
          </TouchableOpacity>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L78 — optimisticRollup
// Arbitrum transaction lifecycle with challenge window
// ─────────────────────────────────────────────────────────────────────────────
export function OptimisticRollupSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [fastForward, setFastForward] = useState(false);
  const [daysLeft, setDaysLeft] = useState(7);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startChallenge = () => {
    setStep(3);
    if (!fastForward) {
      timerRef.current = setInterval(() => {
        setDaysLeft(d => {
          if (d <= 1) { clearInterval(timerRef.current!); setStep(4); return 0; }
          return d - 1;
        });
      }, 400); // 400ms per simulated day
    } else {
      setTimeout(() => setStep(4), 600);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current!); }, []);

  return (
    <SimShell icon="🔄" title="Arbitrum Transaction Lifecycle" subtitle="Walk a transaction from submission through the 7-day challenge window to Ethereum finality.">
      {step === 0 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 1 — USER SUBMITS TRANSACTION</Text>
          <Text style={s.hint2}>You swap 1 ETH for USDC on Arbitrum. The transaction is sent to the Arbitrum sequencer.</Text>
          <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '800', color: Colors.accent }}>⚡ Confirmed in ~2 seconds on Arbitrum</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>Fast L2 confirmation — your USDC is spendable immediately on Arbitrum.</Text>
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 2 — SEQUENCER BATCHES TRANSACTIONS</Text>
          <Text style={s.hint2}>The sequencer collects thousands of transactions and compresses them into a batch. Every ~15 minutes, the batch is posted to Ethereum as calldata (or blob via EIP-4844).</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {['Your swap', 'Alice LP add', 'Bob liquidation', '+4,997 more…'].map((tx, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent }} />
                <Text style={{ fontSize: FontSize.sm, color: Colors.text }}>{tx}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
            <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.green }}>5,000 transactions → 1 batch → 1 Ethereum tx</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>Your share of the Ethereum gas: ~$0.001 (1/5000th of the batch cost)</Text>
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 3 — BATCH POSTED TO ETHEREUM</Text>
          <Text style={s.hint2}>The batch is submitted to Ethereum. The sequencer also posts a "state root" — a cryptographic summary of the new Arbitrum state after all transactions.</Text>
          <View style={{ marginTop: Spacing.md, gap: 4 }}>
            <View style={s.row}><Text style={s.rowKey}>Batch size</Text><Text style={s.rowVal}>5,000 transactions</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Method</Text><Text style={s.rowVal}>EIP-4844 blob (cheap)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>State root posted</Text><Text style={[s.rowVal, { color: Colors.green }]}>✅ On Ethereum L1</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Challenge window starts</Text><Text style={[s.rowVal, { color: '#f59e0b' }]}>⏳ 7 days</Text></View>
          </View>
          <Text style={[s.hint2, { marginTop: Spacing.sm }]}>
            The batch is "optimistically" assumed valid. Anyone can watch and challenge if it's wrong.
          </Text>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 4 — 7-DAY CHALLENGE WINDOW</Text>
          <View style={{ alignItems: 'center', padding: Spacing.lg }}>
            <Text style={{ fontSize: 48, fontWeight: '900', color: daysLeft > 2 ? '#f59e0b' : Colors.red }}>
              {daysLeft}
            </Text>
            <Text style={{ fontWeight: '800', color: Colors.textSoft }}>days remaining</Text>
            <View style={{ width: '100%', height: 8, backgroundColor: Colors.border, borderRadius: 99, marginTop: Spacing.md }}>
              <View style={{ height: 8, borderRadius: 99, backgroundColor: '#f59e0b', width: `${((7 - daysLeft) / 7) * 100}%` }} />
            </View>
          </View>
          <Text style={s.hint2}>
            Fraud provers watch every batch. If anyone submits a valid fraud proof during this window, the invalid batch is rejected and the sequencer is slashed.
          </Text>
          {daysLeft > 0 && (
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <TouchableOpacity onPress={() => setFastForward(true)} style={[chip.base, { flex: 1, alignItems: 'center' }]}>
                <Text style={chip.text}>⏩ Fast-forward simulation</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      )}

      {step === 4 && (
        <>
          <Card style={{ borderColor: Colors.green }}>
            <Text style={[s.fieldLabel, { color: Colors.green }]}>STEP 5 — FINALITY ACHIEVED</Text>
            <Text style={{ fontSize: 36, textAlign: 'center' }}>✅</Text>
            <Text style={{ fontWeight: '900', textAlign: 'center', color: Colors.text, marginTop: Spacing.sm }}>7 days passed. No fraud proof submitted.</Text>
            <Text style={[s.hint2, { textAlign: 'center', marginTop: 4 }]}>
              Your withdrawal is now final on Ethereum mainnet. The sequencer's state root is permanently accepted.
            </Text>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>KEY INSIGHT — OPTIMISTIC SECURITY</Text>
            <Text style={s.bullet}>• System only needs ONE honest verifier watching</Text>
            <Text style={s.bullet}>• Fraudulent batches are economically unprofitable (slashing)</Text>
            <Text style={s.bullet}>• Trade-off: 7-day wait for L1 withdrawals</Text>
            <Text style={s.bullet}>• Fast bridges (Hop, Across) provide instant exit by buying your Arbitrum ETH</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      {step < 3 && (
        <PrimaryBtn
          label={['Submit Transaction →', 'Batch is Collected →', 'Post to Ethereum →', ''][step]}
          onPress={() => setStep(s => (s + 1) as any)}
        />
      )}
      {step === 2 && (
        <PrimaryBtn label="Start Challenge Window →" onPress={startChallenge} />
      )}
      {step === 3 && daysLeft === 0 && (
        <PrimaryBtn label="See Finality →" onPress={() => setStep(4)} />
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L79 — zkVsOptimistic
// Side-by-side withdrawal comparison
// ─────────────────────────────────────────────────────────────────────────────
export function ZkVsOptimisticSim({ onComplete, onSkip }: SimProps) {
  const [started, setStarted] = useState(false);
  const [opDays, setOpDays]   = useState(7);
  const [zkHours, setZkHours] = useState(4);
  const [done, setDone]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setStarted(true);
    timerRef.current = setInterval(() => {
      setOpDays(d => Math.max(0, d - 1));
      setZkHours(h => {
        const next = Math.max(0, h - 1);
        if (next === 0) { /* ZK done — continue ticking for OP */ }
        return next;
      });
    }, 500);
  };

  useEffect(() => {
    if (opDays === 0 && started) {
      clearInterval(timerRef.current!);
      setDone(true);
    }
  }, [opDays, started]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current!); }, []);

  const zkFinished = zkHours === 0;
  const opFinished = opDays === 0;

  return (
    <SimShell icon="⚔️" title="ZK vs Optimistic Withdrawal" subtitle="Initiate a withdrawal on both. Watch the difference in finality time.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {/* Optimistic side */}
        <View style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2,
          borderColor: opFinished ? Colors.green : '#f59e0b',
          backgroundColor: opFinished ? '#d1fae5' : '#fffbeb' }}>
          <Text style={{ fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm }}>
            🔄 Optimistic
          </Text>
          <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSoft, marginBottom: Spacing.md }}>Arbitrum</Text>
          {!started ? (
            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '900', color: '#f59e0b' }}>7d</Text>
          ) : opFinished ? (
            <Text style={{ textAlign: 'center', fontSize: 32 }}>✅</Text>
          ) : (
            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '900', color: '#f59e0b' }}>{opDays}d</Text>
          )}
          <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>
            {opFinished ? 'Finalised!' : started ? 'Challenge window…' : 'Challenge window'}
          </Text>
        </View>

        {/* ZK side */}
        <View style={{ flex: 1, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2,
          borderColor: zkFinished ? Colors.green : Colors.accent,
          backgroundColor: zkFinished ? '#d1fae5' : Colors.accentSoft }}>
          <Text style={{ fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm }}>
            ⚡ ZK Proof
          </Text>
          <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSoft, marginBottom: Spacing.md }}>Starknet</Text>
          {!started ? (
            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '900', color: Colors.accent }}>~4h</Text>
          ) : zkFinished ? (
            <Text style={{ textAlign: 'center', fontSize: 32 }}>✅</Text>
          ) : (
            <Text style={{ textAlign: 'center', fontSize: 32, fontWeight: '900', color: Colors.accent }}>{zkHours}h</Text>
          )}
          <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>
            {zkFinished ? 'Proof verified!' : started ? 'Proof generating…' : 'Proof generation'}
          </Text>
        </View>
      </View>

      {zkFinished && !opFinished && (
        <Card style={{ borderColor: Colors.accent }}>
          <Text style={{ fontWeight: '800', color: Colors.accent }}>
            ⚡ ZK finalised in ~4 hours. Optimistic still has {opDays} days remaining.
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>
            No challenge window needed — the validity proof was mathematically verified.
          </Text>
        </Card>
      )}

      {done && (
        <>
          <ResultBox correct message="Both finalised! ZK took hours — optimistic took 7 days. Same Ethereum security, completely different wait times." />
          <Card>
            <Text style={s.fieldLabel}>WHY ZK IS FASTER</Text>
            <Text style={s.bullet}>• Optimistic: assume valid → wait 7 days for fraud challenge</Text>
            <Text style={s.bullet}>• ZK: prove valid mathematically → verified immediately</Text>
            <Text style={s.bullet}>• ZK proof generation takes hours (off-chain compute)</Text>
            <Text style={s.bullet}>• Once proof is verified, no waiting — instant finality</Text>
            <Text style={s.bullet}>• Trade-off: ZK proofs are computationally expensive to generate</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      {!started && (
        <PrimaryBtn label="Initiate Withdrawals on Both →" onPress={start} />
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L80 — l2FeeCalc
// Interactive L2 vs Ethereum fee calculator
// ─────────────────────────────────────────────────────────────────────────────
export function L2FeeCalcSim({ onComplete, onSkip }: SimProps) {
  const [txType, setTxType] = useState<'transfer' | 'swap' | 'nft' | 'defi'>('swap');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [confirmed, setConfirmed] = useState(false);

  const fees: Record<string, { eth: number; arb: number; label: string }> = {
    transfer: { eth: 1.80,  arb: 0.002,  label: 'ETH Transfer' },
    swap:     { eth: 22.50, arb: 0.08,   label: 'Uniswap Swap' },
    nft:      { eth: 65.00, arb: 0.15,   label: 'NFT Mint' },
    defi:     { eth: 45.00, arb: 0.12,   label: 'Complex DeFi' },
  };

  const txsPerYear: Record<string, number> = { daily: 365, weekly: 52, monthly: 12 };
  const f = fees[txType];
  const n = txsPerYear[frequency];
  const ethYear = (f.eth * n).toFixed(0);
  const arbYear = (f.arb * n).toFixed(2);
  const savings  = (f.eth * n - f.arb * n).toFixed(0);
  const factor   = Math.round(f.eth / f.arb);

  const microPayViable = f.arb < 0.10;

  return (
    <SimShell icon="💸" title="L2 Fee Calculator" subtitle="See exactly how much you save moving from Ethereum mainnet to Arbitrum.">
      <Card>
        <Text style={s.fieldLabel}>TRANSACTION TYPE</Text>
        <View style={{ gap: Spacing.sm }}>
          {Object.entries(fees).map(([k, v]) => (
            <TouchableOpacity key={k} onPress={() => setTxType(k as any)} style={[{
              flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md,
              borderRadius: Radius.md, borderWidth: 2,
              borderColor: txType === k ? Colors.accent : Colors.border,
              backgroundColor: txType === k ? Colors.accentSoft : Colors.card,
            }]}>
              <Text style={{ fontWeight: '700', color: txType === k ? Colors.accent : Colors.text }}>{v.label}</Text>
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <Text style={{ fontSize: FontSize.xs, color: Colors.red, fontWeight: '800' }}>ETH: ${v.eth}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.green, fontWeight: '800' }}>ARB: ${v.arb}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>TRANSACTION FREQUENCY</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {(['daily', 'weekly', 'monthly'] as const).map(fr => (
            <TouchableOpacity key={fr} onPress={() => setFrequency(fr)} style={[chip.base, frequency === fr && chip.active, { flex: 1, alignItems: 'center' }]}>
              <Text style={[chip.text, frequency === fr && chip.activeText]}>{fr.charAt(0).toUpperCase() + fr.slice(1)}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSoft, marginTop: 1 }}>{n}×/year</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>ANNUAL COST COMPARISON</Text>
        <View style={{ gap: Spacing.md }}>
          <View style={{ padding: Spacing.md, backgroundColor: '#fff0f0', borderRadius: Radius.md }}>
            <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.red, marginBottom: 4 }}>🔷 Ethereum Mainnet</Text>
            <Text style={{ fontWeight: '900', fontSize: 28, color: Colors.red }}>${ethYear}/year</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{n} × ${f.eth} per tx</Text>
          </View>
          <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md }}>
            <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, marginBottom: 4 }}>🔵 Arbitrum (post-EIP-4844)</Text>
            <Text style={{ fontWeight: '900', fontSize: 28, color: Colors.accent }}>${arbYear}/year</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{n} × ${f.arb} per tx</Text>
          </View>
          <View style={{ padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '900', color: Colors.green }}>💰 You save: ${savings}/year ({factor}× cheaper)</Text>
          </View>
        </View>
      </Card>

      {microPayViable ? (
        <Card style={{ borderColor: Colors.green }}>
          <Text style={{ fontWeight: '800', color: Colors.green }}>
            ✅ ${f.arb} per tx makes micropayment apps viable on Arbitrum
          </Text>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>
            On Ethereum mainnet, the same tx costs ${f.eth} — 100–1000× the payment value for small transactions.
          </Text>
        </Card>
      ) : (
        <Card style={{ borderColor: '#f59e0b' }}>
          <Text style={{ fontWeight: '800', color: '#92400e' }}>
            ⚠️ Complex DeFi tx (${f.arb}) is still too expensive for micropayments, but fine for regular DeFi.
          </Text>
        </Card>
      )}

      {!confirmed ? (
        <PrimaryBtn label="Got It — I Understand L2 Savings →" onPress={() => setConfirmed(true)} />
      ) : (
        <>
          <ResultBox correct message={`Annual savings: $${savings}. At ${factor}× cheaper, strategies that are economically impossible on mainnet become trivially viable on Arbitrum.`} />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L81 — liquidityBridge
// Cross-chain liquidity protocol route comparison
// ─────────────────────────────────────────────────────────────────────────────
export function LiquidityBridgeSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('5000');
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const amtF = parseFloat(amount) || 0;

  const routes = [
    {
      id: 'canonical',
      name: 'Arbitrum Official Bridge',
      time: '7 days',
      fee: '$2',
      tokenType: 'Native ETH',
      security: '🟢 Ethereum security',
      icon: '🔒',
      warning: null,
    },
    {
      id: 'across',
      name: 'Across Protocol',
      time: '30 min',
      fee: `$${(amtF * 0.0006).toFixed(2)}`,
      tokenType: 'Native USDC',
      security: '🟡 Optimistic oracle',
      icon: '⚡',
      warning: null,
    },
    {
      id: 'hop',
      name: 'Hop Protocol',
      time: '10 min',
      fee: `$${(amtF * 0.0004).toFixed(2)}`,
      tokenType: 'Native ETH (via hETH)',
      security: '🟡 AMM-based',
      icon: '🐰',
      warning: null,
    },
    {
      id: 'multichain',
      name: 'OldBridge (multisig)',
      time: '2 min',
      fee: '$1',
      tokenType: '⚠️ anyETH (wrapped)',
      security: '🔴 3-of-5 multisig',
      icon: '💨',
      warning: 'anyETH is a bridge-wrapped token. If this bridge fails, anyETH becomes worthless.',
    },
  ];

  const sel = routes.find(r => r.id === selected);

  return (
    <SimShell icon="🌊" title="Choose Your Bridge Route" subtitle="Bridge 5 ETH from Ethereum to Arbitrum. Compare routes — native tokens vs wrapped tokens matter.">
      <Card>
        <Text style={s.fieldLabel}>AMOUNT (ETH)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!done} />
      </Card>

      {!done ? (
        <>
          {routes.map(r => (
            <TouchableOpacity key={r.id} onPress={() => setSelected(r.id)} style={[card.box, Shadow.sm, {
              borderColor: selected === r.id ? Colors.accent : (r.id === 'multichain' ? Colors.red : Colors.border),
              borderWidth: selected === r.id ? 2 : 1.5,
            }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                <Text style={{ fontWeight: '900', color: Colors.text }}>{r.icon} {r.name}</Text>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent }}>{r.time}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
                {[['Fee', r.fee], ['Receive', r.tokenType], ['Security', r.security]].map(([k, v]) => (
                  <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
                  </View>
                ))}
              </View>
              {r.warning && (
                <Text style={{ fontSize: FontSize.xs, color: Colors.red, fontWeight: '700', marginTop: Spacing.sm }}>
                  ⚠️ {r.warning}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          <PrimaryBtn label="Confirm Route →" onPress={() => setDone(true)} disabled={!selected} />
        </>
      ) : (
        <>
          <ResultBox
            correct={sel?.id !== 'multichain'}
            message={sel?.id === 'multichain'
              ? 'Risky choice. anyETH is a wrapped token — its value depends entirely on this bridge staying solvent. Multichain collapsed in 2023; anyETH became worthless.'
              : sel?.id === 'canonical'
              ? 'Safe but slow. 7 days is a long wait. Native ETH means no bridge-wrapper risk. Perfect for large amounts where time is not critical.'
              : `Good choice. ${sel?.name} delivers native tokens via liquidity pools — you receive real ETH/USDC, not a wrapped IOU. ${sel?.time} settlement.`
            }
          />
          <Card>
            <Text style={s.fieldLabel}>NATIVE TOKEN = KEY DISTINCTION</Text>
            <Text style={s.bullet}>• Lock-and-mint bridges → wrapped tokens (IOU)</Text>
            <Text style={s.bullet}>• Pool bridges (Across, Hop, Stargate) → native tokens</Text>
            <Text style={s.bullet}>• Multichain anyETH became worthless when Multichain failed</Text>
            <Text style={s.bullet}>• Always check: will I receive the native token?</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L82 — bridgeEval
// 7-factor bridge scorecard with hidden trap
// ─────────────────────────────────────────────────────────────────────────────
export function BridgeEvalSim({ onComplete, onSkip }: SimProps) {
  type Rating = 'green' | 'yellow' | 'red';
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [submitted, setSubmitted] = useState(false);

  const bridge = {
    name: 'StarBridge',
    factors: [
      { id: 'security',  label: 'Security Model',         value: 'Optimistic verification (12 validators)', expert: 'green',  note: '12 validators is reasonable. Not canonical-level but solid.' },
      { id: 'audit',     label: 'Audits',                  value: 'Trail of Bits (2023), Certik (2022)',      expert: 'green',  note: 'Two Tier-1 audits. High quality.' },
      { id: 'tvl',       label: 'TVL Age',                 value: '$800M TVL, 18 months operation',          expert: 'green',  note: '18 months at $800M without exploit = battle-tested.' },
      { id: 'validators',label: 'Validator Transparency',  value: '12 validators, all public, 8 orgs',       expert: 'green',  note: '8 separate organisations. Reasonable diversity.' },
      { id: 'bounty',    label: 'Bug Bounty',              value: '$500,000 Immunefi bounty',                expert: 'green',  note: '$500K is a strong incentive for responsible disclosure.' },
      { id: 'token',     label: 'Destination Token',       value: 'Native USDC via CCTP integration',        expert: 'green',  note: 'Native USDC — no bridge-wrapper risk.' },
      { id: 'keyman',    label: 'Key Custody',             value: 'CEO holds master override key (undisclosed)', expert: 'red', note: '🚨 TRAP: The CEO personally holds a master key. Multichain pattern. All other factors pass — this one kills it.' },
    ],
  };

  const allRated = bridge.factors.every(f => ratings[f.id]);
  const correctRatings = bridge.factors.filter(f => ratings[f.id] === f.expert).length;
  const passed = correctRatings >= 5 && ratings['keyman'] === 'red';

  const ratingColor = (r: Rating) => r === 'green' ? Colors.green : r === 'yellow' ? '#f59e0b' : Colors.red;
  const ratingBg    = (r: Rating) => r === 'green' ? '#d1fae5' : r === 'yellow' ? '#fef3c7' : '#fee2e2';

  return (
    <SimShell icon="📋" title="Bridge Security Scorecard" subtitle="Rate all 7 factors for StarBridge. One factor is a hidden critical flaw — can you find it?">
      <Card>
        <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: Spacing.sm }}>🌟 StarBridge</Text>
        <Text style={s.hint2}>Bridge $100,000 USDC from Ethereum to Arbitrum. Evaluate all 7 factors before deciding.</Text>
      </Card>

      {bridge.factors.map(f => {
        const r = ratings[f.id];
        return (
          <Card key={f.id} style={{ borderColor: r ? ratingColor(r) : Colors.border }}>
            <Text style={{ fontWeight: '800', color: Colors.text, marginBottom: 4 }}>{f.label}</Text>
            <Text style={{ fontSize: FontSize.sm, color: Colors.text, marginBottom: Spacing.md, lineHeight: 18 }}>{f.value}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {(['green', 'yellow', 'red'] as Rating[]).map(rating => (
                <TouchableOpacity key={rating} disabled={submitted} onPress={() => setRatings(prev => ({ ...prev, [f.id]: rating }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                    borderColor: r === rating ? ratingColor(rating) : Colors.border,
                    backgroundColor: r === rating ? ratingBg(rating) : Colors.card }}>
                  <Text style={{ fontWeight: '800', fontSize: FontSize.xs }}>
                    {rating === 'green' ? '✅ Good' : rating === 'yellow' ? '⚠️ Watch' : '🔴 Risk'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {submitted && (
              <View style={{ marginTop: Spacing.sm, padding: Spacing.sm,
                backgroundColor: ratings[f.id] === f.expert ? '#d1fae5' : '#fee2e2', borderRadius: Radius.md }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '700',
                  color: ratings[f.id] === f.expert ? Colors.green : Colors.red }}>
                  Expert: {f.expert === 'green' ? '✅ Good' : f.expert === 'yellow' ? '⚠️ Watch' : '🔴 Risk'}
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>{f.note}</Text>
              </View>
            )}
          </Card>
        );
      })}

      {!submitted ? (
        <PrimaryBtn label={`Submit Scorecard (${Object.keys(ratings).length}/7 rated)`} onPress={() => setSubmitted(true)} disabled={!allRated} />
      ) : (
        <>
          <ResultBox correct={passed} message={passed
            ? `${correctRatings}/7 correct! You spotted the CEO key trap. This is the Multichain pattern — excellent factors everywhere, one fatal flaw.`
            : `${correctRatings}/7 correct. The KEY flaw was factor 7 — CEO holds a master override key. Even with perfect audits, this is catastrophic. Multichain proved it.`
          } />
          <Card>
            <Text style={s.fieldLabel}>THE LESSON FROM MULTICHAIN</Text>
            <Text style={s.bullet}>• Smart contract audits cannot catch organisational key custody</Text>
            <Text style={s.bullet}>• Always ask: "Is any single person critical to security?"</Text>
            <Text style={s.bullet}>• 6/7 perfect factors ≠ safe if the 7th is a single point of failure</Text>
            <Text style={s.bullet}>• Geographic + legal concentration of keys multiplies risk</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L83 — multiChainPortfolio
// Multi-chain portfolio dashboard + emergency exit planning
// ─────────────────────────────────────────────────────────────────────────────
export function MultiChainPortfolioSim({ onComplete, onSkip }: SimProps) {
  const [tab, setTab] = useState<'dashboard' | 'exit' | 'poolCheck'>('dashboard');
  const [exitPlans, setExitPlans] = useState<Record<string, string>>({});
  const [poolAmount, setPoolAmount] = useState('800000');
  const [planSubmitted, setPlanSubmitted] = useState(false);

  const positions = [
    { chain: 'Ethereum', icon: '🔷', protocol: 'Aave V3', type: 'Lending', value: '$8,200', color: '#627eea' },
    { chain: 'Arbitrum', icon: '🔵', protocol: 'GMX',     type: 'Perps LP', value: '$15,400', color: '#28a0f0' },
    { chain: 'Polygon',  icon: '🟣', protocol: 'QuickSwap', type: 'LP',   value: '$3,800', color: '#8247e5' },
    { chain: 'Base',     icon: '🔵', protocol: 'Aerodrome', type: 'veLP', value: '$5,600', color: '#0052ff' },
  ];

  const exitOptions: Record<string, string[]> = {
    Ethereum: ['Direct withdraw (native)', 'No bridge needed'],
    Arbitrum: ['Across Protocol (30min)', 'Arbitrum Official (7 days)'],
    Polygon: ['Stargate (10min)', 'Polygon PoS bridge (3hrs)'],
    Base: ['Base Official bridge', 'Across Protocol (30min)'],
  };

  const totalValue = positions.reduce((sum, p) => sum + parseFloat(p.value.replace('$', '').replace(',', '')), 0);
  const poolF = parseFloat(poolAmount) || 0;
  const poolDepth = 1_200_000;
  const poolImpact = Math.min(100, (poolF / poolDepth) * 100).toFixed(0);
  const isHighImpact = poolF > poolDepth * 0.3;

  const allPlanned = Object.keys(exitPlans).length === positions.filter(p => p.chain !== 'Ethereum').length;

  return (
    <SimShell icon="🗺️" title="Multi-Chain Portfolio Management" subtitle="View all positions, plan emergency exits, check pool depth before large bridges.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([
          { k: 'dashboard', l: '📊 Portfolio' },
          { k: 'exit',      l: '🚨 Exit Plan' },
          { k: 'poolCheck', l: '🌊 Pool Depth' },
        ] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} style={[chip.base, tab === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, tab === k && chip.activeText, { textAlign: 'center', fontSize: 11 }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'dashboard' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>TOTAL PORTFOLIO VALUE</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: Colors.accent }}>${totalValue.toLocaleString()}</Text>
            <Text style={s.hint2}>Across {positions.length} chains. This is what DeBank/Zerion aggregates in one view.</Text>
          </Card>
          {positions.map(p => (
            <Card key={p.chain}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontWeight: '900', color: Colors.text }}>{p.icon} {p.chain}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{p.protocol} · {p.type}</Text>
                </View>
                <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text }}>{p.value}</Text>
              </View>
            </Card>
          ))}
          <PrimaryBtn label="Plan Emergency Exits →" onPress={() => setTab('exit')} />
        </>
      )}

      {tab === 'exit' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>EMERGENCY EXIT PLANNING</Text>
            <Text style={s.hint2}>Identify two independent exit routes per chain before a crisis. Takes 10 minutes — saves hours of panic decisions.</Text>
          </Card>
          {positions.filter(p => p.chain !== 'Ethereum').map(p => {
            const opts = exitOptions[p.chain] || [];
            const chosen = exitPlans[p.chain];
            return (
              <Card key={p.chain}>
                <Text style={{ fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm }}>{p.icon} {p.chain} — {p.value}</Text>
                <Text style={[s.fieldLabel, { marginBottom: Spacing.sm }]}>PRIMARY EXIT ROUTE</Text>
                {opts.map(opt => (
                  <TouchableOpacity key={opt} onPress={() => !planSubmitted && setExitPlans(e => ({ ...e, [p.chain]: opt }))}
                    style={[{ padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1.5, marginBottom: Spacing.sm,
                      borderColor: chosen === opt ? Colors.green : Colors.border,
                      backgroundColor: chosen === opt ? '#d1fae5' : Colors.card }]}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: chosen === opt ? Colors.green : Colors.text }}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </Card>
            );
          })}
          {!planSubmitted ? (
            <PrimaryBtn label="Lock in Exit Plan →" onPress={() => setPlanSubmitted(true)} disabled={!allPlanned} />
          ) : (
            <>
              <ResultBox correct message="Exit plan saved! You now have documented routes for every chain. In a crisis, you execute the plan — no research needed." />
              <PrimaryBtn label="Check Pool Depth →" onPress={() => setTab('poolCheck')} />
            </>
          )}
        </>
      )}

      {tab === 'poolCheck' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>POOL DEPTH CHECKER</Text>
            <Text style={s.hint2}>Before bridging large amounts via pool-based bridges, check if the pool can handle your size without excessive slippage.</Text>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>BRIDGE AMOUNT (USDC)</Text>
            <TextInput style={s.input} value={poolAmount} onChangeText={setPoolAmount}
              keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
            <View style={s.row}><Text style={s.rowKey}>Pool depth (Arbitrum)</Text><Text style={s.rowVal}>${poolDepth.toLocaleString()}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Your impact</Text>
              <Text style={[s.rowVal, { color: isHighImpact ? Colors.red : Colors.green, fontWeight: '900' }]}>{poolImpact}% of pool</Text>
            </View>
            <View style={[{ marginTop: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: isHighImpact ? '#fee2e2' : '#d1fae5' }]}>
              <Text style={{ fontWeight: '800', color: isHighImpact ? Colors.red : Colors.green }}>
                {isHighImpact
                  ? `⚠️ ${poolImpact}% pool impact — split into smaller tranches with 2-hour gaps`
                  : `✅ ${poolImpact}% pool impact is acceptable — proceed as one transaction`}
              </Text>
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>SPLITTING RULE OF THUMB</Text>
            <Text style={s.bullet}>• {'>'} 30% pool impact: split into 3+ tranches</Text>
            <Text style={s.bullet}>• 10–30% pool impact: split into 2 tranches</Text>
            <Text style={s.bullet}>• {'<'} 10% pool impact: single transaction is fine</Text>
            <Text style={s.bullet}>• Wait 2–4 hours between tranches for rebalancing</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L84 — l2Ecosystem
// Arbitrum / Optimism / Base comparison and selector
// ─────────────────────────────────────────────────────────────────────────────
export function L2EcosystemSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    {
      q: 'Build a high-performance DeFi protocol — need maximum existing TVL and composability',
      correct: 'Arbitrum',
      reason: 'Arbitrum has $3B+ TVL, GMX, Camelot, Radiant, Pendle — deepest DeFi ecosystem of any L2.',
    },
    {
      q: 'Build a consumer app for Coinbase\'s 100M+ existing users with minimal onboarding friction',
      correct: 'Base',
      reason: 'Base is built by Coinbase with direct on-ramp integration. No separate bridge for Coinbase users.',
    },
    {
      q: 'Build using Rust (not Solidity) for a high-performance order book',
      correct: 'Arbitrum',
      reason: 'Arbitrum Stylus supports Rust, C, and C++ smart contracts — no other major L2 offers this.',
    },
    {
      q: 'Build an open-source developer tool and need retroactive funding from the ecosystem',
      correct: 'Optimism',
      reason: 'Optimism RetroPGF rewards past contributors to the ecosystem — the only L2 with this mechanism.',
    },
    {
      q: 'Launch a chain compatible with your protocol\'s Ethereum codebase — want to join an interconnected network',
      correct: 'Optimism',
      reason: 'The OP Stack + Superchain: deploy your own chain that inherits Optimism security and connects to Base, Zora, Mode.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((sc, i) => answers[i] === sc.correct).length;
  const passed = score >= 4;

  return (
    <SimShell icon="🏙️" title="Arbitrum vs Optimism vs Base" subtitle="Match each use case to the right L2. The winner depends entirely on your specific needs.">
      {scenarios.map((sc, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === sc.correct;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{sc.q}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['Arbitrum', 'Optimism', 'Base'].map(chain => {
                const isCh = chosen === chain; const isCo = chain === sc.correct;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={chain} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: chain }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 11, color: Colors.text, textAlign: 'center' }}>
                      {chain === 'Arbitrum' ? '🔵 Arb' : chain === 'Optimism' ? '🔴 OP' : '🔵 Base'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {sc.reason}</Text>}
          </Card>
        );
      })}

      {!checked ? (
        <PrimaryBtn label="Check Answers →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
      ) : (
        <>
          <ResultBox correct={passed} message={passed
            ? `${score}/5 — Strong L2 ecosystem knowledge. The right L2 depends on your specific requirements.`
            : `${score}/5 — Key: Arbitrum for max TVL/composability + Rust. Optimism for Superchain + RetroPGF. Base for Coinbase distribution.`
          } />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L85 — safeBridgingDrill
// Step-by-step bridge with deliberate traps to catch
// ─────────────────────────────────────────────────────────────────────────────
export function SafeBridgingDrillSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [urlChoice, setUrlChoice] = useState<'real' | 'fake' | null>(null);
  const [approvalAmount, setApprovalAmount] = useState('unlimited');
  const [destAddress, setDestAddress] = useState('');
  const [testDone, setTestDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [drained, setDrained] = useState(false);

  const REAL_URL    = 'bridge.arbitrum.io';
  const FAKE_URL    = 'arbitrum-bridge.io';
  const REAL_ADDR   = '0xA4b1...3f9c';
  const WRONG_ADDR  = '0xB2c3...4d1a'; // pre-filled wrong address

  const handleUrlChoice = (choice: 'real' | 'fake') => {
    setUrlChoice(choice);
    if (choice === 'fake') {
      setDrained(true);
    }
  };

  const handleContinue = () => {
    const newErrors: string[] = [];
    if (step === 2 && approvalAmount === 'unlimited') newErrors.push('unlimited_approval');
    if (step === 3 && destAddress !== REAL_ADDR) newErrors.push('wrong_address');
    if (step === 4 && !testDone) newErrors.push('no_test');
    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
      if (step === 2 && approvalAmount === 'unlimited') setDrained(true);
    } else {
      setStep(s => (s + 1) as any);
    }
  };

  if (drained) {
    return (
      <SimShell icon="💀" title="Wallet Drained!" subtitle="You missed a critical check. See what went wrong.">
        <Card style={{ borderColor: Colors.red, backgroundColor: '#fff5f5' }}>
          <Text style={{ fontSize: 48, textAlign: 'center' }}>💸</Text>
          <Text style={{ fontWeight: '900', color: Colors.red, textAlign: 'center', fontSize: FontSize.lg }}>
            {urlChoice === 'fake' ? 'Phishing Site!' : 'Unlimited Approval!'}
          </Text>
          <Text style={[s.hint2, { textAlign: 'center', marginTop: Spacing.sm }]}>
            {urlChoice === 'fake'
              ? `You connected to "${FAKE_URL}" (not "${REAL_URL}"). The site drained your entire wallet via a malicious approval contract.`
              : 'You approved UNLIMITED token spending. The bridge contract (or any future exploit of it) can now drain your entire token balance at any time.'}
          </Text>
        </Card>
        <Card>
          <Text style={s.fieldLabel}>LESSONS LEARNED</Text>
          {urlChoice === 'fake' && <Text style={s.bullet}>• Always type the URL directly or use a bookmark</Text>}
          <Text style={s.bullet}>• Never click bridge links from Twitter, Discord, or email</Text>
          <Text style={s.bullet}>• Change unlimited approvals to the exact bridge amount</Text>
          <Text style={s.bullet}>• The 30 seconds of URL verification is always worth it</Text>
        </Card>
        <TouchableOpacity onPress={() => { setStep(1); setUrlChoice(null); setApprovalAmount('unlimited'); setDestAddress(''); setTestDone(false); setErrors([]); setDrained(false); }}
          style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
          <Text style={{ color: Colors.accent, fontWeight: '700' }}>↩ Try again from the start</Text>
        </TouchableOpacity>
        <PrimaryBtn label="Continue (lesson learned) →" onPress={onComplete} />
      </SimShell>
    );
  }

  return (
    <SimShell icon="🛡️" title="Safe Bridging Drill" subtitle="Bridge 10,000 USDC to Arbitrum. There are 3 traps. Catch them all.">
      {/* Progress */}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <View key={n} style={{ flex: 1, height: 4, borderRadius: 99, backgroundColor: n <= step ? Colors.accent : Colors.border }} />
        ))}
      </View>

      {step === 1 && (
        <>
          <Card>
            <Text style={s.fieldLabel}>STEP 1 — VERIFY THE BRIDGE URL</Text>
            <Text style={s.hint2}>You Googled "Arbitrum bridge." Two results appeared. Which do you click?</Text>
          </Card>
          {[
            { url: FAKE_URL,  label: '⚡ Arbitrum Bridge — Fast & Free!', isReal: false, badge: 'Ad' },
            { url: REAL_URL,  label: '🔒 Arbitrum Official Bridge',        isReal: true,  badge: null },
          ].map(opt => (
            <TouchableOpacity key={opt.url} onPress={() => handleUrlChoice(opt.isReal ? 'real' : 'fake')}
              style={[card.box, Shadow.sm, { borderColor: Colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontWeight: '700', color: Colors.text }}>{opt.label}</Text>
                  <Text style={{ fontSize: FontSize.xs, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: Colors.accent, marginTop: 2 }}>{opt.url}</Text>
                </View>
                {opt.badge && (
                  <View style={{ backgroundColor: '#fef3c7', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#92400e' }}>{opt.badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {urlChoice === 'real' && (
            <>
              <ResultBox correct message={`Correct! "${REAL_URL}" is the official bridge. "${FAKE_URL}" is a phishing site — the hyphen is the trap.`} />
              <PrimaryBtn label="Proceed to Approval →" onPress={() => setStep(2)} />
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Card>
            <Text style={s.fieldLabel}>STEP 2 — TOKEN APPROVAL REQUEST</Text>
            <Text style={s.hint2}>MetaMask shows a token approval. The bridge needs permission to move your USDC. What approval amount do you set?</Text>
            <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f9fafb', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontWeight: '900', color: Colors.text }}>bridge.arbitrum.io wants to:</Text>
              <Text style={{ marginTop: Spacing.sm, color: Colors.text }}>Spend your USDC</Text>
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>APPROVAL AMOUNT</Text>
            {[
              { id: 'unlimited', label: '♾️ Unlimited', warning: 'Any future contract exploit can drain ALL your USDC forever' },
              { id: 'exact', label: '✅ Exact Amount (10,000 USDC)', warning: null },
            ].map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => setApprovalAmount(opt.id)}
                style={[{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
                  borderColor: approvalAmount === opt.id ? (opt.id === 'unlimited' ? Colors.red : Colors.green) : Colors.border,
                  backgroundColor: approvalAmount === opt.id ? (opt.id === 'unlimited' ? '#fee2e2' : '#d1fae5') : Colors.card }]}>
                <Text style={{ fontWeight: '800', color: Colors.text }}>{opt.label}</Text>
                {opt.warning && <Text style={{ fontSize: FontSize.xs, color: Colors.red, marginTop: 2 }}>⚠️ {opt.warning}</Text>}
              </TouchableOpacity>
            ))}
          </Card>
          <PrimaryBtn label="Confirm Approval →" onPress={handleContinue} disabled={!approvalAmount} />
        </>
      )}

      {step === 3 && (
        <>
          <Card>
            <Text style={s.fieldLabel}>STEP 3 — VERIFY DESTINATION ADDRESS</Text>
            <Text style={s.hint2}>The UI has pre-filled a destination address. Is this your Arbitrum wallet?</Text>
            <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: '#92400e' }}>⚠️ Pre-filled: {WRONG_ADDR}</Text>
              <Text style={{ fontSize: FontSize.xs, color: '#92400e', marginTop: 2 }}>This is a cached address from a previous session — it is NOT your wallet.</Text>
            </View>
            <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>ENTER YOUR ARBITRUM ADDRESS</Text>
            <TextInput style={s.input} value={destAddress} onChangeText={setDestAddress}
              placeholder={`Your address (hint: ${REAL_ADDR})`} placeholderTextColor={Colors.textMuted} />
          </Card>
          <PrimaryBtn label="Set Destination →" onPress={handleContinue}
            disabled={destAddress.length < 10} />
          {errors.includes('wrong_address') && (
            <ResultBox correct={false} message={`Wrong address! You would have sent to ${WRONG_ADDR}. Always type or paste your own address — never trust pre-filled values.`} />
          )}
          {destAddress === REAL_ADDR && !errors.includes('wrong_address') && (
            <ResultBox correct message="Correct address! You verified it matches your wallet before proceeding." />
          )}
        </>
      )}

      {step === 4 && (
        <>
          <Card>
            <Text style={s.fieldLabel}>STEP 4 — SEND A TEST TRANSACTION</Text>
            <Text style={s.hint2}>Before bridging $10,000, should you send a small test amount first?</Text>
          </Card>
          <View style={{ gap: Spacing.sm }}>
            {[
              { id: 'yes', label: '✅ Send $10 test first', correct: true, reason: 'Correct. A $10 test verifies address, fee, and configuration before risking $10,000.' },
              { id: 'no', label: '❌ Skip test — bridge full $10,000 now', correct: false, reason: 'Risky. Any misconfiguration (wrong address, unexpected fee) costs $10,000 instead of $10.' },
            ].map(opt => (
              <TouchableOpacity key={opt.id} onPress={() => { if (opt.correct) setTestDone(true); }}
                style={[card.box, Shadow.sm, {
                  borderColor: testDone && opt.correct ? Colors.green : Colors.border,
                  backgroundColor: testDone && opt.correct ? '#d1fae5' : Colors.card,
                }]}>
                <Text style={{ fontWeight: '700', color: Colors.text }}>{opt.label}</Text>
                {testDone && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>💡 {opt.reason}</Text>}
              </TouchableOpacity>
            ))}
          </View>
          {testDone && (
            <PrimaryBtn label="Bridge Confirmed →" onPress={() => setStep(5)} />
          )}
        </>
      )}

      {step === 5 && (
        <>
          <ResultBox correct message="All 4 checks passed! You caught the phishing URL, changed to exact approval, verified the destination address, and sent a test first. 10,000 USDC safely bridged." />
          <Card>
            <Text style={s.fieldLabel}>THE COMPLETE SAFE BRIDGING CHECKLIST</Text>
            <Text style={s.bullet}>1. ✅ Verify URL from official docs or bookmark</Text>
            <Text style={s.bullet}>2. ✅ Change unlimited approval to exact amount</Text>
            <Text style={s.bullet}>3. ✅ Verify destination address is YOUR wallet</Text>
            <Text style={s.bullet}>4. ✅ Send small test transaction first</Text>
            <Text style={s.bullet}>5. ✅ Confirm receipt on destination explorer</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L86 — bridgeAggregator
// LI.FI style route comparison
// ─────────────────────────────────────────────────────────────────────────────
export function BridgeAggregatorSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('5000');
  const [routes, setRoutes] = useState<null | typeof ROUTE_DATA>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const ROUTE_DATA = [
    {
      id: 'across',
      bridge: 'Across Protocol',
      time: '30 min',
      fee: '$3.00',
      security: '🟡 Optimistic oracle',
      tokenType: 'Native USDC',
      steps: ['Approve USDC', 'Bridge via Across', 'Receive on Arbitrum'],
      auditInfo: '2-year TVL. Trail of Bits audit. $1M bug bounty. Optimistic oracle. ✅ Safe for this amount.',
    },
    {
      id: 'hop',
      bridge: 'Hop Protocol',
      time: '10 min',
      fee: '$2.00',
      security: '🟡 AMM-based',
      tokenType: 'Native ETH',
      steps: ['Approve USDC', 'Bridge to hUSDC', 'Swap hUSDC → USDC on Arbitrum'],
      auditInfo: '18-month track record. Multiple audits. AMM-based security. ✅ Reasonable for $5,000.',
    },
    {
      id: 'fast',
      bridge: 'FastBridge (new)',
      time: '2 min',
      fee: '$0.50',
      security: '🔴 3-of-5 multisig',
      tokenType: '⚠️ wUSDC (wrapped)',
      steps: ['Bridge instantly via multisig', 'Receive wUSDC on Arbitrum'],
      auditInfo: '❌ 3 months old. Single unknown auditor. 3-of-5 multisig. Wrapped token received. DO NOT USE for meaningful amounts.',
    },
    {
      id: 'canonical',
      bridge: 'Arbitrum Official',
      time: '7 days',
      fee: '$1.20',
      security: '🟢 Ethereum consensus',
      tokenType: 'Native USDC',
      steps: ['Deposit to bridge contract', 'Wait 7-day challenge window', 'Withdraw on Arbitrum'],
      auditInfo: '✅ Highest security possible. Backed by Ethereum validators. Slow but certain. Best for large amounts.',
    },
  ];

  const find = () => setRoutes(ROUTE_DATA);

  return (
    <SimShell icon="🔭" title="Bridge Aggregator" subtitle="Find the best route. But remember — the aggregator shows ALL options, including unsafe ones.">
      <Card>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>FROM</Text>
            <Text style={{ fontWeight: '800', color: Colors.text, fontSize: FontSize.md }}>🔷 Ethereum</Text>
          </View>
          <Text style={{ alignSelf: 'center', fontSize: 20, color: Colors.textSoft }}>→</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.fieldLabel}>TO</Text>
            <Text style={{ fontWeight: '800', color: Colors.text, fontSize: FontSize.md }}>🔵 Arbitrum</Text>
          </View>
        </View>
        <Text style={s.fieldLabel}>AMOUNT (USDC)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        {!routes && <PrimaryBtn label="Find Best Routes →" onPress={find} disabled={!amount} />}
      </Card>

      {routes && !confirmed && (
        <>
          <Text style={[s.fieldLabel, { marginTop: 0 }]}>4 ROUTES FOUND (tap Details before selecting)</Text>
          {routes.map(r => (
            <View key={r.id}>
              <TouchableOpacity onPress={() => setSelected(r.id)} style={[card.box, Shadow.sm, {
                borderColor: selected === r.id ? Colors.accent : (r.id === 'fast' ? Colors.red : Colors.border),
                borderWidth: selected === r.id ? 2 : 1.5,
              }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                  <Text style={{ fontWeight: '900', color: Colors.text }}>{r.bridge}</Text>
                  <Text style={{ fontWeight: '900', color: Colors.green, fontSize: FontSize.sm }}>{r.fee}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.sm }}>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>⏱ {r.time}</Text>
                  <Text style={{ fontSize: 10 }}>{r.security}</Text>
                  <Text style={{ fontSize: 10, color: r.id === 'fast' ? Colors.red : Colors.green }}>📦 {r.tokenType}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDetail(showDetail === r.id ? null : r.id)}
                  style={{ alignSelf: 'flex-start', padding: 4 }}>
                  <Text style={{ color: Colors.accent, fontSize: FontSize.xs, fontWeight: '700' }}>
                    {showDetail === r.id ? '▲ Hide details' : '▼ View bridge security details'}
                  </Text>
                </TouchableOpacity>
                {showDetail === r.id && (
                  <View style={{ marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: '#f9fafb', borderRadius: Radius.sm }}>
                    <Text style={{ fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 }}>{r.auditInfo}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
          <PrimaryBtn label="Execute Selected Route →" onPress={() => setConfirmed(true)} disabled={!selected} />
        </>
      )}

      {confirmed && (
        <>
          {(() => {
            const sel = routes?.find(r => r.id === selected);
            const isRisky = sel?.id === 'fast';
            return (
              <>
                <ResultBox correct={!isRisky} message={isRisky
                  ? 'You chose the cheapest route — but FastBridge uses a 3-of-5 multisig and issues wrapped tokens. You saved $2.50 and took on significant risk. Always check Details.'
                  : `Good choice. ${sel?.bridge} delivered native tokens with a solid security model. The aggregator found the route — you evaluated the safety.`
                } />
                <Card>
                  <Text style={s.fieldLabel}>AGGREGATOR RULE #1</Text>
                  <Text style={s.bullet}>• Aggregators optimise for cost/speed — not security</Text>
                  <Text style={s.bullet}>• Always click "Details" before selecting any route</Text>
                  <Text style={s.bullet}>• Cheapest route = often least secure bridge</Text>
                  <Text style={s.bullet}>• The extra $1–3 for a reputable bridge is worth it</Text>
                </Card>
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
            );
          })()}
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L87 — zkProofDemo
// ZK proof interactive explainer
// ─────────────────────────────────────────────────────────────────────────────
export function ZkProofDemoSim({ onComplete, onSkip }: SimProps) {
  const [mode, setMode] = useState<'analogy' | 'batch' | 'recursive'>('analogy');
  const [waldoFound, setWaldoFound] = useState(false);
  const [batchSize, setBatchSize] = useState(1000);
  const [recursionDepth, setRecursionDepth] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const proofSizeBytes = { 1000: 288, 5000: 288, 10000: 288 }; // ZK proof is constant size!
  const txsCovered = { 1: batchSize, 2: batchSize * 10, 3: batchSize * 100 };

  return (
    <SimShell icon="🔐" title="ZK Proof Interactive Demo" subtitle="Understand zero-knowledge proofs through three interactive demonstrations.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([
          { k: 'analogy',   l: '🧩 Analogy' },
          { k: 'batch',     l: '📦 Batch Proof' },
          { k: 'recursive', l: '🔁 Recursion' },
        ] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => setMode(k)} style={[chip.base, mode === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, mode === k && chip.activeText, { textAlign: 'center', fontSize: 11 }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'analogy' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>THE WHERE'S WALDO PROOF</Text>
            <Text style={s.hint2}>You found Waldo. Your friend doesn't believe you. You need to prove it WITHOUT revealing where he is. How?</Text>
          </Card>
          <Card>
            <View style={{ alignItems: 'center', padding: Spacing.lg }}>
              <Text style={{ fontSize: 64 }}>🔍</Text>
              <Text style={{ fontWeight: '700', color: Colors.text, marginTop: Spacing.sm, textAlign: 'center' }}>
                You cut a hole in a large sheet of cardboard and hold it over the page
              </Text>
              <Text style={[s.hint2, { textAlign: 'center', marginTop: 4 }]}>
                Your friend sees ONLY Waldo through the hole — not the rest of the page. Proven without revealing anything else.
              </Text>
            </View>
            <TouchableOpacity onPress={() => setWaldoFound(true)} style={[{
              padding: Spacing.lg, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md,
              backgroundColor: waldoFound ? '#d1fae5' : Colors.accent,
            }]}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>
                {waldoFound ? '✅ Waldo found — proof given!' : '🔍 Find Waldo (generate proof)'}
              </Text>
            </TouchableOpacity>
          </Card>
          {waldoFound && (
            <>
              <Card style={{ borderColor: Colors.accent }}>
                <Text style={s.fieldLabel}>THIS IS A ZK PROOF</Text>
                <Text style={s.bullet}>• Prover (you): knows Waldo's location (private input)</Text>
                <Text style={s.bullet}>• Verifier (friend): sees only "Waldo is here" (public output)</Text>
                <Text style={s.bullet}>• Zero knowledge: location revealed = zero</Text>
                <Text style={s.bullet}>• On Starknet: prover knows 10,000 valid txs. Ethereum sees only "all valid" = zero individual tx knowledge needed</Text>
              </Card>
              <PrimaryBtn label="See Batch Proofs →" onPress={() => setMode('batch')} />
            </>
          )}
        </>
      )}

      {mode === 'batch' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>BATCH SIZE</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[1000, 5000, 10000].map(n => (
                <TouchableOpacity key={n} onPress={() => setBatchSize(n)} style={[chip.base, batchSize === n && chip.active, { flex: 1, alignItems: 'center' }]}>
                  <Text style={[chip.text, batchSize === n && chip.activeText]}>{(n / 1000).toFixed(0)}K txs</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>THE KEY INSIGHT</Text>
            <View style={{ gap: 4 }}>
              <View style={s.row}><Text style={s.rowKey}>Transactions in batch</Text><Text style={[s.rowVal, { color: Colors.text, fontWeight: '900' }]}>{batchSize.toLocaleString()}</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Proof size</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{proofSizeBytes[batchSize as keyof typeof proofSizeBytes]} bytes</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Ethereum verification cost</Text><Text style={[s.rowVal, { color: Colors.green }]}>~$50 (always constant!)</Text></View>
              <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
                <Text style={s.rowKey}>Cost per tx</Text>
                <Text style={[s.rowVal, { color: Colors.green, fontWeight: '900', fontSize: FontSize.md }]}>${(50 / batchSize).toFixed(5)}</Text>
              </View>
            </View>
            <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '800', color: Colors.accent }}>
                🔑 CONSTANT SIZE: The proof is 288 bytes whether it covers 1,000 or 10,000 transactions. This is what makes ZK rollups scale.
              </Text>
            </View>
          </Card>
          <PrimaryBtn label="See Recursive Proofs →" onPress={() => setMode('recursive')} />
        </>
      )}

      {mode === 'recursive' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>RECURSION DEPTH</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[1, 2, 3].map(d => (
                <TouchableOpacity key={d} onPress={() => setRecursionDepth(d)} style={[chip.base, recursionDepth === d && chip.active, { flex: 1, alignItems: 'center' }]}>
                  <Text style={[chip.text, recursionDepth === d && chip.activeText]}>Level {d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>RECURSIVE PROOF POWER</Text>
            <Text style={s.hint2}>
              {recursionDepth === 1 ? 'Level 1: One STARK proof covers 1,000 transactions.' :
               recursionDepth === 2 ? 'Level 2: One "proof of proofs" covers 10 individual proofs = 10,000 transactions.' :
               'Level 3: One "proof of proofs of proofs" covers 100 proofs = 100,000 transactions.'}
            </Text>
            <View style={{ gap: 4, marginTop: Spacing.md }}>
              <View style={s.row}><Text style={s.rowKey}>Transactions covered</Text><Text style={[s.rowVal, { color: Colors.accent, fontWeight: '900', fontSize: FontSize.lg }]}>{txsCovered[recursionDepth as keyof typeof txsCovered].toLocaleString()}</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Ethereum verifications</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>1 (always!)</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Verification cost</Text><Text style={[s.rowVal, { color: Colors.green }]}>$50</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Cost per tx</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>${(50 / txsCovered[recursionDepth as keyof typeof txsCovered]).toFixed(6)}</Text></View>
            </View>
          </Card>
          {!confirmed ? (
            <PrimaryBtn label="I Understand ZK Proofs →" onPress={() => setConfirmed(true)} />
          ) : (
            <>
              <ResultBox correct message="ZK proofs: constant-size proof of unlimited transactions, verified once by Ethereum. Recursion multiplies throughput with fixed cost — the path to unlimited L2 scale." />
              <PrimaryBtn label="Continue →" onPress={onComplete} />
            </>
          )}
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L88 — trilemma
// Interactive blockchain trilemma triangle
// ─────────────────────────────────────────────────────────────────────────────
export function TrilemmaSim({ onComplete, onSkip }: SimProps) {
  const [mode, setMode] = useState<'place' | 'modular'>('place');
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const chains = [
    { id: 'bitcoin',   name: 'Bitcoin',    icon: '₿', correct: 'DS',  label: 'High D + S, Low Scalability' },
    { id: 'bnb',       name: 'BNB Chain',  icon: '🟡', correct: 'SS',  label: 'High S + Scalability, Low D' },
    { id: 'solana',    name: 'Solana',     icon: '◎', correct: 'SS2', label: 'High S + Scalability, Med D' },
    { id: 'ethereum',  name: 'Ethereum L1',icon: '⟠', correct: 'DS',  label: 'High D + S, Low Scalability' },
  ];

  const positions = [
    { id: 'DS',  label: 'Decentralised\n+ Secure', desc: 'Low scalability', color: '#627eea' },
    { id: 'SS',  label: 'Secure\n+ Scalable', desc: 'Low decentralisation', color: '#e0a800' },
    { id: 'SS2', label: 'Secure\n+ Scalable (med D)', desc: 'Partial decentralisation', color: '#f59e0b' },
    { id: 'DS2', label: 'Decentralised\n+ Scalable', desc: 'Reduced security', color: Colors.red },
  ];

  const allPlaced = chains.every(c => placements[c.id]);
  const score = chains.filter(c => placements[c.id] === c.correct).length;
  const passed = score >= 3;

  return (
    <SimShell icon="🔺" title="Blockchain Trilemma" subtitle="Place each chain on the trilemma triangle. Then see how Ethereum's modular stack navigates it.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([{ k: 'place', l: '📍 Place Chains' }, { k: 'modular', l: '🏗️ Modular Stack' }] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => setMode(k)} style={[chip.base, mode === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, mode === k && chip.activeText]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'place' && (
        <>
          {/* Triangle visual */}
          <Card>
            <Text style={{ textAlign: 'center', fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm }}>THE TRILEMMA TRIANGLE</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20 }}>🔒</Text>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.text, textAlign: 'center' }}>Security</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20 }}>🌐</Text>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.text, textAlign: 'center' }}>Decentralisation</Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.text, textAlign: 'center' }}>Scalability</Text>
              </View>
            </View>
            <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.red, fontWeight: '700' }}>
              No chain can maximise all three simultaneously
            </Text>
          </Card>

          <Text style={[s.fieldLabel, { marginTop: 0 }]}>PLACE EACH CHAIN</Text>
          {chains.map(c => {
            const chosen = placements[c.id];
            const isCorrect = checked && chosen === c.correct;
            const isWrong = checked && chosen && chosen !== c.correct;
            return (
              <Card key={c.id} style={{ borderColor: isCorrect ? Colors.green : isWrong ? Colors.red : Colors.border }}>
                <Text style={{ fontWeight: '900', color: Colors.text, marginBottom: Spacing.md }}>
                  {c.icon} {c.name}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    {positions.map(pos => {
                      const isCh = chosen === pos.id;
                      const isCo = pos.id === c.correct;
                      let bg = Colors.card, border = Colors.border;
                      if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                      if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                      if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                      return (
                        <TouchableOpacity key={pos.id} disabled={checked} onPress={() => setPlacements(p => ({ ...p, [c.id]: pos.id }))}
                          style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: isCh ? pos.color + '30' : bg, borderColor: isCh ? pos.color : border, minWidth: 90 }}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.text, textAlign: 'center' }}>{pos.label}</Text>
                          <Text style={{ fontSize: 9, color: Colors.textSoft, textAlign: 'center' }}>{pos.desc}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm }}>✓ {c.label}</Text>}
              </Card>
            );
          })}

          {!checked ? (
            <PrimaryBtn label="Check Placements →" onPress={() => setChecked(true)} disabled={!allPlaced} />
          ) : (
            <>
              <ResultBox correct={passed} message={passed
                ? `${score}/4 correct! Both Bitcoin and Ethereum L1 prioritise D+S over scalability. BNB and Solana trade decentralisation for throughput.`
                : `${score}/4. Key: Bitcoin + Ethereum L1 = D+S corner. BNB = SS corner (21 validators). Solana = SS with partial D.`
              } />
              <PrimaryBtn label="See Modular Solution →" onPress={() => setMode('modular')} />
            </>
          )}
        </>
      )}

      {mode === 'modular' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>THE ETHEREUM MODULAR ANSWER</Text>
            <Text style={s.hint2}>Instead of one chain trying to do everything, separate the concerns across layers.</Text>
          </Card>
          <View style={{ gap: Spacing.sm }}>
            {[
              { layer: 'L1 — Ethereum', role: 'Security + Decentralisation', tps: '15 TPS', cost: 'High', icon: '🔷', color: '#627eea' },
              { layer: 'L2 — Arbitrum/Base', role: 'Scalability (execution)', tps: '40,000+ TPS', cost: '$0.01–0.10', icon: '🔵', color: '#28a0f0' },
              { layer: 'DA — Blobs (EIP-4844)', role: 'Data Availability (cheap)', tps: 'N/A', cost: '90% cheaper', icon: '💾', color: Colors.accent },
            ].map(layer => (
              <View key={layer.layer} style={{ padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2, borderColor: layer.color + '80', backgroundColor: layer.color + '15' }}>
                <Text style={{ fontWeight: '900', color: Colors.text }}>{layer.icon} {layer.layer}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>Role: {layer.role}</Text>
                <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: layer.color }}>⚡ {layer.tps}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: layer.color }}>💸 {layer.cost}</Text>
                </View>
              </View>
            ))}
          </View>
          <Card style={{ borderColor: Colors.green }}>
            <Text style={{ fontWeight: '800', color: Colors.green }}>
              ✅ Each layer optimises for ONE property without sacrificing the others at that layer. The trilemma navigated, not solved.
            </Text>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>THE BNB COMPARISON</Text>
            <Text style={s.bullet}>• BNB: 21 validators → fast consensus → 100 TPS</Text>
            <Text style={s.bullet}>• Ethereum + Arbitrum: 500K validators → 40K TPS on L2</Text>
            <Text style={s.bullet}>• BNB traded decentralisation. Ethereum separated it.</Text>
            <Text style={s.bullet}>• Ethereum + L2 is MORE decentralised AND more scalable</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L89 — intentBridge
// ERC-7683 intent-based bridging demo
// ─────────────────────────────────────────────────────────────────────────────
export function IntentBridgeSim({ onComplete, onSkip }: SimProps) {
  const [mode, setMode] = useState<'old' | 'intent'>('old');
  const [oldStep, setOldStep] = useState(0);
  const [intentAmount, setIntentAmount] = useState('1000');
  const [intentTarget, setIntentTarget] = useState('985');
  const [solverSelected, setSolverSelected] = useState<string | null>(null);
  const [intentDone, setIntentDone] = useState(false);

  const solvers = [
    { id: 'stargate',  name: 'Solver A (Stargate)',   time: '3 min',  output: '987', fee: '$3.00' },
    { id: 'across',    name: 'Solver B (Across)',      time: '1 min',  output: '986', fee: '$4.00' },
    { id: 'canonical', name: 'Solver C (Canonical)',   time: '7 days', output: '999', fee: '$1.00' },
  ];

  const oldSteps = [
    'Open bridge aggregator website',
    'Research 4 bridge options manually',
    'Select bridge (guess which is best)',
    'Approve token on source chain',
    'Submit bridge transaction',
    'Wait for confirmation',
    'Manually verify arrival on destination',
  ];

  return (
    <SimShell icon="🎯" title="Intent-Based Bridging" subtitle="Compare the old 7-step manual bridge with ERC-7683 intent-based: declare outcome, solvers compete.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([{ k: 'old', l: '😓 Old Way (7 steps)' }, { k: 'intent', l: '✨ Intent (1 step)' }] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => setMode(k)} style={[chip.base, mode === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, mode === k && chip.activeText, { textAlign: 'center', fontSize: 11 }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'old' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>THE OLD WAY — MANUAL BRIDGING</Text>
            <Text style={s.hint2}>Bridge 1,000 USDC from Ethereum → Arbitrum manually. 7 steps, all on you.</Text>
          </Card>
          {oldSteps.map((step, i) => (
            <TouchableOpacity key={i} onPress={() => setOldStep(Math.max(oldStep, i + 1))}
              style={[{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, marginBottom: Spacing.sm,
                borderColor: oldStep > i ? Colors.green : oldStep === i ? Colors.accent : Colors.border,
                backgroundColor: oldStep > i ? '#d1fae5' : oldStep === i ? Colors.accentSoft : Colors.card,
              }]}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: oldStep > i ? Colors.green : oldStep === i ? Colors.accent : Colors.border }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: FontSize.sm, fontWeight: oldStep === i ? '800' : '600', color: Colors.text }}>{step}</Text>
                {oldStep > i && <Text style={{ color: Colors.green }}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
          {oldStep >= oldSteps.length && (
            <>
              <ResultBox correct={false} message="Bridge complete — after 7 manual steps, 2 approvals, and ~20 minutes of work. Compare to intent-based." />
              <PrimaryBtn label="See Intent-Based Approach →" onPress={() => setMode('intent')} />
            </>
          )}
          {oldStep < oldSteps.length && (
            <PrimaryBtn label={`Complete Step ${oldStep + 1} →`} onPress={() => setOldStep(s => s + 1)} />
          )}
        </>
      )}

      {mode === 'intent' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>STEP 1 — DECLARE YOUR INTENT</Text>
            <Text style={s.hint2}>You don't specify HOW to bridge. You declare WHAT you want. Solvers compete to fill it.</Text>
            <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
              <View>
                <Text style={s.fieldLabel}>I HAVE (on Ethereum)</Text>
                <TextInput style={s.input} value={intentAmount} onChangeText={setIntentAmount}
                  keyboardType="decimal-pad" placeholder="USDC amount" placeholderTextColor={Colors.textMuted} />
              </View>
              <View>
                <Text style={s.fieldLabel}>I WANT (on Arbitrum, minimum)</Text>
                <TextInput style={s.input} value={intentTarget} onChangeText={setIntentTarget}
                  keyboardType="decimal-pad" placeholder="Min USDC to receive" placeholderTextColor={Colors.textMuted} />
              </View>
            </View>
          </Card>

          {!solverSelected ? (
            <>
              <Card>
                <Text style={s.fieldLabel}>SOLVERS COMPETING TO FILL YOUR INTENT</Text>
                <Text style={s.hint2}>Three solvers see your intent and bid to fill it. They handle all routing complexity.</Text>
              </Card>
              {solvers.map(s_ => (
                <TouchableOpacity key={s_.id} onPress={() => setSolverSelected(s_.id)} style={[card.box, Shadow.sm]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                    <Text style={{ fontWeight: '900', color: Colors.text }}>{s_.name}</Text>
                    <Text style={{ fontWeight: '900', color: Colors.green }}>{s_.output} USDC</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                    <View style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, color: Colors.textSoft }}>⏱ {s_.time}</Text>
                    </View>
                    <View style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, color: Colors.textSoft }}>💸 Fee: {s_.fee}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          ) : !intentDone ? (
            <>
              <Card style={{ borderColor: Colors.green }}>
                <Text style={{ fontWeight: '900', color: Colors.green, marginBottom: Spacing.sm }}>✅ Solver Selected</Text>
                <Text style={s.hint2}>You accepted. The solver handles everything: approve, bridge, swap. You just wait.</Text>
                <View style={{ marginTop: Spacing.md, gap: 4 }}>
                  {['Solver approves token on your behalf', 'Routes through Stargate bridge', 'Verifies arrival', 'Delivers USDC to your Arbitrum wallet'].map((action, i) => (
                    <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                      <Text style={{ color: Colors.accent }}>⚙️</Text>
                      <Text style={{ fontSize: FontSize.xs, color: Colors.text }}>{action}</Text>
                    </View>
                  ))}
                </View>
              </Card>
              <PrimaryBtn label="Receive on Arbitrum →" onPress={() => setIntentDone(true)} />
            </>
          ) : (
            <>
              <ResultBox correct message={`Done! You declared an intent and received ${solvers.find(s_ => s_.id === solverSelected)?.output} USDC on Arbitrum. 1 signature, no routing decisions, no manual steps.`} />
              <Card>
                <Text style={s.fieldLabel}>THE INTENT PARADIGM SHIFT</Text>
                <Text style={s.bullet}>• Old: user chooses bridge, route, timing, approvals (7 steps)</Text>
                <Text style={s.bullet}>• New: user declares outcome — solvers compete (1 step)</Text>
                <Text style={s.bullet}>• ERC-7683: standard format so any solver fills any intent</Text>
                <Text style={s.bullet}>• End state: bridges become invisible infrastructure</Text>
                <Text style={s.bullet}>• Like TCP/IP — you load websites, not IP addresses</Text>
              </Card>
              <PrimaryBtn label="Continue →" onPress={onComplete} />
            </>
          )}
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// L90 — bridgeBoss
// Three-stage boss challenge
// ─────────────────────────────────────────────────────────────────────────────
export function BridgeBossSim({ onComplete, onSkip }: SimProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [s1Choice, setS1Choice] = useState<string | null>(null);
  const [s1Confirmed, setS1Confirmed] = useState(false);
  const [s2Answer, setS2Answer] = useState<string | null>(null);
  const [s2Confirmed, setS2Confirmed] = useState(false);
  const [s3Placements, setS3Placements] = useState<Record<string, string>>({});
  const [s3Checked, setS3Checked] = useState(false);
  const [allDone, setAllDone] = useState(false);

  // Stage 1: pick the safe bridge for $50K
  const s1Bridges = [
    { id: 'canonical', name: '🔒 Arbitrum Official (7 days)', verdict: 'safe', note: '✅ Ethereum-level security. 7-day wait is acceptable for $50K.' },
    { id: 'across',    name: '⚡ Across Protocol (30 min)',  verdict: 'safe', note: '✅ 2-year TVL, Trail of Bits audit. Appropriate for this amount.' },
    { id: 'new',       name: '💨 NewBridge — 2 min, $0.50 fee', verdict: 'trap', note: '❌ 3 months old, unaudited 3-of-5 multisig. Ronin pattern. Fatal trap.' },
  ];

  // Stage 2: fee calculation
  const s2Options = [
    { id: 'a', label: '$7,152', correct: true  },
    { id: 'b', label: '$576',   correct: false },
    { id: 'c', label: '$71,520', correct: false },
    { id: 'd', label: '$144',   correct: false },
  ];

  // Stage 3: trilemma placement
  const s3Chains = [
    { id: 'btc',  name: 'Bitcoin',  correct: 'DS', note: 'High D + S, low scalability — deliberate design for store of value.' },
    { id: 'bnb',  name: 'BNB Chain', correct: 'SS', note: '21 validators — traded decentralisation for speed.' },
    { id: 'eth',  name: 'Eth + L2', correct: 'all', note: 'Modular: L1 = D+S, L2 = Scalability. The best answer.' },
  ];

  const s1Safe = s1Choice === 'canonical' || s1Choice === 'across';
  const s2Correct = s2Answer === 'a';
  const s3Score = s3Chains.filter(c => {
    if (c.id === 'eth') return s3Placements[c.id] === 'all';
    return s3Placements[c.id] === c.correct;
  }).length;

  const totalScore = (s1Safe ? 1 : 0) + (s2Correct ? 1 : 0) + (s3Score >= 2 ? 1 : 0);
  const passed = totalScore >= 2;

  return (
    <SimShell icon="⭐" title="BOSS: The Complete Bridges & L2s Challenge" subtitle="Three stages. Apply everything you've learned.">
      {/* Stage indicator */}
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {[1, 2, 3].map(n => (
          <View key={n} style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, alignItems: 'center',
            backgroundColor: stage === n ? Colors.accent : n < stage ? '#d1fae5' : Colors.border }}>
            <Text style={{ fontWeight: '900', color: stage === n ? '#fff' : n < stage ? Colors.green : Colors.textSoft, fontSize: FontSize.xs }}>
              {n < stage ? '✓' : `Stage ${n}`}
            </Text>
          </View>
        ))}
      </View>

      {/* STAGE 1 */}
      {stage === 1 && (
        <>
          <Card>
            <Text style={[s.fieldLabel, { color: Colors.accent }]}>STAGE 1 — BRIDGE SECURITY</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
              You need to bridge $50,000 USDC from Ethereum to Arbitrum. One of these bridges is a fatal trap. Which do you choose?
            </Text>
          </Card>
          {s1Bridges.map(b => (
            <TouchableOpacity key={b.id} onPress={() => !s1Confirmed && setS1Choice(b.id)} style={[card.box, Shadow.sm, {
              borderColor: s1Choice === b.id ? Colors.accent : (b.id === 'new' ? Colors.red + '80' : Colors.border),
              borderWidth: s1Choice === b.id ? 2 : 1.5,
            }]}>
              <Text style={{ fontWeight: '800', color: Colors.text }}>{b.name}</Text>
              {s1Confirmed && <Text style={{ fontSize: FontSize.xs, color: b.verdict === 'trap' ? Colors.red : Colors.green, marginTop: 4, fontWeight: '700' }}>{b.note}</Text>}
            </TouchableOpacity>
          ))}
          {!s1Confirmed ? (
            <PrimaryBtn label="Lock in Choice →" onPress={() => setS1Confirmed(true)} disabled={!s1Choice} />
          ) : (
            <>
              <ResultBox correct={s1Safe} message={s1Safe
                ? 'Correct. You avoided the 3-of-5 multisig trap. Security model comes first.'
                : 'Trap selected! NewBridge uses an unaudited 3-of-5 multisig. 2 months old. The $0.50 fee would cost you $50,000.'
              } />
              <PrimaryBtn label="Stage 2 →" onPress={() => setStage(2)} />
            </>
          )}
        </>
      )}

      {/* STAGE 2 */}
      {stage === 2 && (
        <>
          <Card>
            <Text style={[s.fieldLabel, { color: Colors.accent }]}>STAGE 2 — FEE CALCULATION</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
              A user makes 50 transactions per month. Ethereum mainnet: $12/tx. Arbitrum: $0.08/tx.{'\n'}
              What is the annual saving by switching to Arbitrum?
            </Text>
          </Card>
          <View style={{ gap: Spacing.sm }}>
            {s2Options.map(opt => {
              let bg = Colors.card, border = Colors.border;
              if (s2Confirmed && s2Answer === opt.id && opt.correct) { bg = '#d1fae5'; border = Colors.green; }
              if (s2Confirmed && s2Answer === opt.id && !opt.correct) { bg = '#fee2e2'; border = Colors.red; }
              if (s2Confirmed && s2Answer !== opt.id && opt.correct) { bg = '#d1fae5'; border = Colors.green; }
              return (
                <TouchableOpacity key={opt.id} disabled={s2Confirmed} onPress={() => setS2Answer(opt.id)}
                  style={[{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, backgroundColor: s2Answer === opt.id && !s2Confirmed ? Colors.accentSoft : bg, borderColor: s2Answer === opt.id && !s2Confirmed ? Colors.accent : border, alignItems: 'center' }]}>
                  <Text style={{ fontWeight: '800', fontSize: FontSize.lg, color: Colors.text }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!s2Confirmed ? (
            <PrimaryBtn label="Submit Answer →" onPress={() => setS2Confirmed(true)} disabled={!s2Answer} />
          ) : (
            <>
              <ResultBox correct={s2Correct} message={s2Correct
                ? '✅ Correct! (50 × $12 - 50 × $0.08) × 12 = $596/month × 12 = $7,152/year'
                : `Incorrect. Calculation: monthly mainnet = 50 × $12 = $600. Monthly Arb = $4. Savings = $596/mo × 12 = $7,152/year.`
              } />
              <PrimaryBtn label="Final Stage →" onPress={() => setStage(3)} />
            </>
          )}
        </>
      )}

      {/* STAGE 3 */}
      {stage === 3 && !allDone && (
        <>
          <Card>
            <Text style={[s.fieldLabel, { color: Colors.accent }]}>STAGE 3 — THE TRILEMMA</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
              Place each in the trilemma: what does it optimise for?
            </Text>
          </Card>
          {s3Chains.map(c => {
            const chosen = s3Placements[c.id];
            const isCorrect = s3Checked && chosen === c.correct;
            return (
              <Card key={c.id} style={{ borderColor: s3Checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
                <Text style={{ fontWeight: '900', color: Colors.text, marginBottom: Spacing.md }}>{c.name}</Text>
                <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
                  {[
                    { id: 'DS',  label: 'D + Security' },
                    { id: 'SS',  label: 'Security + Speed' },
                    { id: 'all', label: 'All via Modular' },
                  ].map(pos => {
                    const isCh = chosen === pos.id; const isCo = pos.id === c.correct;
                    let bg = Colors.card, border = Colors.border;
                    if (s3Checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                    if (s3Checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                    if (s3Checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                    return (
                      <TouchableOpacity key={pos.id} disabled={s3Checked} onPress={() => setS3Placements(p => ({ ...p, [c.id]: pos.id }))}
                        style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: isCh && !s3Checked ? Colors.accentSoft : bg, borderColor: isCh && !s3Checked ? Colors.accent : border }}>
                        <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: Colors.text }}>{pos.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {s3Checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm }}>{c.note}</Text>}
              </Card>
            );
          })}
          {!s3Checked ? (
            <PrimaryBtn label="Submit Placements →" onPress={() => setS3Checked(true)} disabled={Object.keys(s3Placements).length < s3Chains.length} />
          ) : (
            <>
              <ResultBox correct={s3Score >= 2} message={`${s3Score}/3 — ${s3Score >= 2 ? 'Strong trilemma knowledge.' : 'Review: Bitcoin/Ethereum L1 = D+S. BNB = speed at cost of D. Ethereum + L2 navigates all via modularity.'}`} />
              <PrimaryBtn label="See Final Score →" onPress={() => setAllDone(true)} />
            </>
          )}
        </>
      )}

      {/* FINAL */}
      {allDone && (
        <>
          <Card style={{ borderColor: passed ? Colors.green : Colors.red }}>
            <Text style={{ textAlign: 'center', fontSize: 48 }}>{passed ? '🏆' : '📚'}</Text>
            <Text style={{ fontWeight: '900', textAlign: 'center', fontSize: FontSize.xl, color: passed ? Colors.green : Colors.red, marginTop: Spacing.sm }}>
              {passed ? 'BOSS DEFEATED!' : 'Keep Learning'}
            </Text>
            <Text style={{ textAlign: 'center', color: Colors.textSoft, marginTop: 4 }}>
              {totalScore}/3 stages passed
            </Text>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>ISLAND 8 MASTERED</Text>
            <Text style={s.bullet}>✅ Bridge security: canonical → ZK → optimistic → multisig</Text>
            <Text style={s.bullet}>✅ L2 fees: 100–500× cheaper via EIP-4844 blobs</Text>
            <Text style={s.bullet}>✅ Trilemma: modular architecture navigates all three</Text>
            <Text style={s.bullet}>✅ Safe bridging: URL → approval → address → test tx</Text>
            <Text style={s.bullet}>✅ Future: intent-based systems → invisible bridges</Text>
          </Card>
          <PrimaryBtn label="Return to Island Map →" onPress={onComplete} />
        </>
      )}

      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Add these to SimulatorCard.tsx's SIMULATORS map:
//
//   bridgeLockMint:       BridgeLockMintSim,
//   bridgeSecurity:       BridgeSecuritySim,
//   optimisticRollup:     OptimisticRollupSim,
//   zkVsOptimistic:       ZkVsOptimisticSim,
//   l2FeeCalc:            L2FeeCalcSim,
//   liquidityBridge:      LiquidityBridgeSim,
//   bridgeEval:           BridgeEvalSim,
//   multiChainPortfolio:  MultiChainPortfolioSim,
//   l2Ecosystem:          L2EcosystemSim,
//   safeBridgingDrill:    SafeBridgingDrillSim,
//   bridgeAggregator:     BridgeAggregatorSim,
//   zkProofDemo:          ZkProofDemoSim,
//   trilemma:             TrilemmaSim,
//   intentBridge:         IntentBridgeSim,
//   bridgeBoss:           BridgeBossSim,
// ─────────────────────────────────────────────────────────────────────────────
