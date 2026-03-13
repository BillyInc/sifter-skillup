/**
 * SimulatorCard — inline "test what you just learnt" interactive exercises.
 *
 * Each simulator is a focused mini-task that uses the exact concept taught
 * in the preceding concept card. When the user completes the task they tap
 * "Done" and the lesson continues.
 *
 * Usage: render inside LessonScreen when q.type === 'simulator'.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

// ── Shared types ─────────────────────────────────────────────────────────────
interface SimProps {
  onComplete: () => void;   // called when user passes
  onSkip:     () => void;   // always available as escape hatch
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────
function SimShell({
  title, subtitle, icon, children,
}: { title: string; subtitle: string; icon: string; children: React.ReactNode }) {
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
  wrap:     { flex: 1 },
  content:  { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  header:   { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  icon:     { fontSize: 36, lineHeight: 44 },
  label:    { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  title:    { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 },
});

function PrimaryBtn({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[btn.primary, disabled && btn.disabled]}
    >
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
  primary:     { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  disabled:    { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  ghost:       { alignItems: 'center', paddingVertical: Spacing.md },
  ghostText:   { color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' },
});

function ResultBox({ correct, message }: { correct: boolean; message: string }) {
  return (
    <View style={[res.box, { backgroundColor: correct ? '#d1fae5' : '#fee2e2', borderColor: correct ? Colors.green : Colors.red }]}>
      <Text style={[res.icon]}>{correct ? '✅' : '❌'}</Text>
      <Text style={[res.msg, { color: correct ? '#065f46' : '#7f1d1d' }]}>{message}</Text>
    </View>
  );
}
const res = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5 },
  icon: { fontSize: 20 },
  msg:  { flex: 1, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 19 },
});

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[card.box, Shadow.sm, style]}>{children}</View>;
}
const card = StyleSheet.create({
  box: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg },
});

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR IMPLEMENTATIONS
// ─────────────────────────────────────────────────────────────────────────────

// ── tonWallet ─────────────────────────────────────────────────────────────────
function TonWalletSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'done'>('input');
  const TARGET = '10';
  const balance = 47.32;

  const handleSend = () => {
    if (parseFloat(amount) === parseFloat(TARGET)) setStep('confirm');
  };
  const handleConfirm = () => setStep('done');

  return (
    <SimShell icon="💎" title="Send 10 TON to Alice" subtitle="Practice a real TON wallet transaction.">
      <Card>
        <Text style={s.fieldLabel}>YOUR BALANCE</Text>
        <Text style={s.bigNumber}>{balance} TON</Text>
        <Text style={s.fieldLabel}>≈ ${(balance * 5.2).toFixed(2)} USD</Text>
      </Card>

      {step === 'input' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>RECIPIENT</Text>
            <Text style={s.address}>UQAl...ice7</Text>
            <Text style={s.fieldLabel} >AMOUNT (TON)</Text>
            <TextInput
              style={s.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              placeholderTextColor={Colors.textMuted}
            />
            {amount !== '' && parseFloat(amount) !== parseFloat(TARGET) && (
              <Text style={s.hint}>💡 Alice needs exactly {TARGET} TON</Text>
            )}
          </Card>
          <PrimaryBtn label="Continue →" onPress={handleSend} disabled={!amount || isNaN(parseFloat(amount))} />
        </>
      )}

      {step === 'confirm' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>TRANSACTION SUMMARY</Text>
            <View style={s.row}><Text style={s.rowKey}>To</Text><Text style={s.rowVal}>UQAl...ice7 (Alice)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Amount</Text><Text style={s.rowVal}>{amount} TON</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Network Fee</Text><Text style={s.rowVal}>~0.01 TON</Text></View>
            <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm }]}>
              <Text style={s.rowKey}>Total</Text>
              <Text style={[s.rowVal, { fontWeight: '900', color: Colors.text }]}>{(parseFloat(amount) + 0.01).toFixed(2)} TON</Text>
            </View>
          </Card>
          <PrimaryBtn label="✓ Confirm & Send" onPress={handleConfirm} />
        </>
      )}

      {step === 'done' && (
        <>
          <ResultBox correct message="Transaction sent! On TON, confirmation takes ~5 seconds — one of the fastest chains." />
          <Card>
            <Text style={s.fieldLabel}>KEY TAKEAWAYS</Text>
            <Text style={s.bullet}>• TON transactions cost ~0.01 TON in fees (fractions of a cent)</Text>
            <Text style={s.bullet}>• Confirmations are near-instant vs ~10 min on Bitcoin</Text>
            <Text style={s.bullet}>• Always double-check the address before confirming</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── tonTapEarn ────────────────────────────────────────────────────────────────
function TonTapEarnSim({ onComplete, onSkip }: SimProps) {
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);
  const TARGET_TAPS = 15;
  const scale = useRef(new Animated.Value(1)).current;

  const handleTap = () => {
    if (done) return;
    const newTaps = taps + 1;
    setTaps(newTaps);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    if (newTaps >= TARGET_TAPS) setDone(true);
  };

  const earned = (taps * 0.005).toFixed(3);
  const pct = Math.min(100, (taps / TARGET_TAPS) * 100);

  return (
    <SimShell icon="🎮" title="Tap-to-Earn Simulation" subtitle="Experience how play-to-airdrop games work on TON.">
      <Card>
        <Text style={[s.fieldLabel, { textAlign: 'center' }]}>TAPS: {taps}/{TARGET_TAPS}</Text>
        <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 99, marginVertical: Spacing.sm }}>
          <View style={{ height: 8, borderRadius: 99, backgroundColor: Colors.accent, width: `${pct}%` }} />
        </View>
        <Text style={[s.bigNumber, { textAlign: 'center', color: '#0088cc' }]}>{earned} TON</Text>
        <Text style={[s.fieldLabel, { textAlign: 'center' }]}>EARNED</Text>
      </Card>

      {!done ? (
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity onPress={handleTap} style={tapBtn.btn} activeOpacity={0.7}>
            <Text style={tapBtn.coin}>💎</Text>
            <Text style={tapBtn.label}>TAP TO EARN</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <>
          <ResultBox correct message={`You earned ${earned} TON! Real Notcoin players earned airdrops worth $100s just from tapping.`} />
          <Card>
            <Text style={s.fieldLabel}>WHY IT WORKS</Text>
            <Text style={s.bullet}>• TON protocols use tapping as proof-of-engagement</Text>
            <Text style={s.bullet}>• Airdrop allocation = your taps ÷ total taps × token supply</Text>
            <Text style={s.bullet}>• Notcoin's airdrop hit $1B+ market cap at launch</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
const tapBtn = StyleSheet.create({
  btn:   { alignSelf: 'center', width: 140, height: 140, borderRadius: 70, backgroundColor: '#0088cc', alignItems: 'center', justifyContent: 'center', ...Shadow.md as object },
  coin:  { fontSize: 52 },
  label: { color: '#fff', fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 1, marginTop: 4 },
});

// ── tonStaking ────────────────────────────────────────────────────────────────
function TonStakingSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('100');
  const [period, setPeriod] = useState(12);
  const [confirmed, setConfirmed] = useState(false);

  const APY = 0.054; // 5.4%
  const monthly = (parseFloat(amount || '0') * APY / 12).toFixed(2);
  const yearly  = (parseFloat(amount || '0') * APY * period / 12).toFixed(2);

  return (
    <SimShell icon="🏦" title="Stake TON with a Validator" subtitle="See how TON staking rewards are calculated.">
      <Card>
        <Text style={s.fieldLabel}>AMOUNT TO STAKE (TON)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <Text style={s.fieldLabel}>LOCK PERIOD</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {[1, 3, 6, 12].map(m => (
            <TouchableOpacity key={m} onPress={() => setPeriod(m)}
              style={[chip.base, period === m && chip.active]}>
              <Text style={[chip.text, period === m && chip.activeText]}>{m}mo</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>PROJECTED REWARDS (5.4% APY)</Text>
        <View style={s.row}><Text style={s.rowKey}>Per Month</Text><Text style={s.rowVal}>+{monthly} TON</Text></View>
        <View style={s.row}><Text style={s.rowKey}>After {period} Month{period > 1 ? 's' : ''}</Text>
          <Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>+{yearly} TON</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Validator</Text><Text style={s.rowVal}>Whales.io (99.9% uptime)</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Lock-up Risk</Text><Text style={s.rowVal}>Funds locked during period</Text></View>
      </Card>

      {!confirmed ? (
        <PrimaryBtn label={`Stake ${amount || '0'} TON for ${period} Month${period > 1 ? 's' : ''} →`} onPress={() => setConfirmed(true)} disabled={!amount || parseFloat(amount) < 1} />
      ) : (
        <>
          <ResultBox correct message={`Staked! You'll earn ~${yearly} TON over ${period} month${period > 1 ? 's' : ''}. Unlike some chains, TON has no slashing for delegators — your principal is always safe.`} />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
const chip = StyleSheet.create({
  base:       { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card },
  active:     { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  text:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSoft },
  activeText: { color: Colors.accent },
});

// ── cbProductPicker ───────────────────────────────────────────────────────────
function CbProductPickerSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    { id: 0, scenario: 'You want to buy BTC and keep it on an exchange',      correct: 'coinbase',     hint: 'Coinbase.com = custodial exchange. They hold the keys.' },
    { id: 1, scenario: 'You want to use a DApp and hold your own keys',        correct: 'cbwallet',     hint: 'Coinbase Wallet = self-custody. You control the keys.' },
    { id: 2, scenario: 'You want to send USDC directly to a friend's wallet',  correct: 'cbwallet',     hint: 'Coinbase Wallet lets you send to any wallet address directly.' },
    { id: 3, scenario: 'You want to convert fiat to crypto quickly and safely', correct: 'coinbase',    hint: 'Coinbase.com is the regulated fiat on-ramp.' },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const allAnswered = scenarios.every(s => answers[s.id]);
  const score = scenarios.filter(s => answers[s.id] === s.correct).length;
  const passed = score >= 3;

  const pick = (id: number, product: string) => {
    if (!checked) setAnswers(prev => ({ ...prev, [id]: product }));
  };

  return (
    <SimShell icon="🏦" title="Which Coinbase Product?" subtitle="Match each scenario to Coinbase.com or Coinbase Wallet.">
      {scenarios.map(s => {
        const chosen = answers[s.id];
        const correct = s.correct;
        return (
          <Card key={s.id}>
            <Text style={s2.scenario}>{s.scenario}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              {['coinbase', 'cbwallet'].map(prod => {
                const isChosen  = chosen === prod;
                const isCorrect = prod === correct;
                let bg = Colors.card, border = Colors.border, textC = Colors.text;
                if (checked && isChosen && isCorrect)   { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isChosen && !isCorrect)  { bg = '#fee2e2'; border = Colors.red; textC = Colors.red; }
                if (checked && !isChosen && isCorrect)  { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={prod} onPress={() => pick(s.id, prod)} disabled={checked}
                    style={[s2.prodBtn, { backgroundColor: bg, borderColor: border, borderWidth: 2 }]}>
                    <Text style={[s2.prodText, { color: isChosen ? textC : Colors.text }]}>
                      {prod === 'coinbase' ? '🏦 Coinbase.com' : '👛 CB Wallet'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={s2.hint}>💡 {s.hint}</Text>}
          </Card>
        );
      })}

      {!checked ? (
        <PrimaryBtn label="Check Answers →" onPress={() => setChecked(true)} disabled={!allAnswered} />
      ) : (
        <>
          <ResultBox correct={passed} message={passed
            ? `${score}/4 correct! The key rule: Coinbase.com = they hold keys. Coinbase Wallet = you hold keys.`
            : `${score}/4 correct. Review the hints above — the core distinction is custody.`} />
          {passed
            ? <PrimaryBtn label="Continue →" onPress={onComplete} />
            : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
const s2 = StyleSheet.create({
  scenario: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, lineHeight: 22 },
  prodBtn:  { flex: 1, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  prodText: { fontSize: FontSize.sm, fontWeight: '800', textAlign: 'center' },
  hint:     { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 17 },
});

// ── cbAdvancedTrade ───────────────────────────────────────────────────────────
function CbAdvancedTradeSim({ onComplete, onSkip }: SimProps) {
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [placed, setPlaced] = useState(false);
  const MARKET = 3247.80;

  const limitPrice = parseFloat(price);
  const qty_f = parseFloat(qty);
  const total = limitPrice * qty_f;
  const isBelow = limitPrice < MARKET;
  const isValid = !isNaN(limitPrice) && !isNaN(qty_f) && limitPrice > 0 && qty_f > 0 && isBelow;

  return (
    <SimShell icon="📊" title="Place a Limit Buy Order" subtitle="Buy 0.1 ETH at a price below the current market — a classic limit order.">
      <Card>
        <View style={s.row}>
          <Text style={s.rowKey}>ETH Market Price</Text>
          <Text style={[s.rowVal, { color: Colors.text, fontWeight: '900' }]}>${MARKET.toLocaleString()}</Text>
        </View>
        <Text style={[s.hint2, { marginTop: Spacing.sm }]}>
          💡 A limit buy executes only when price drops to your target. Set a price <Text style={{ fontWeight: '900' }}>below</Text> ${MARKET}.
        </Text>
      </Card>

      {!placed ? (
        <>
          <Card>
            <Text style={s.fieldLabel}>LIMIT PRICE (USD)</Text>
            <TextInput style={s.input} value={price} onChangeText={setPrice}
              keyboardType="decimal-pad" placeholder={`e.g. ${(MARKET * 0.98).toFixed(0)}`} placeholderTextColor={Colors.textMuted} />
            {price && !isBelow && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginTop: 4 }}>Price must be below market price to be a limit BUY</Text>}
            <Text style={s.fieldLabel}>QUANTITY (ETH)</Text>
            <TextInput style={s.input} value={qty} onChangeText={setQty}
              keyboardType="decimal-pad" placeholder="e.g. 0.1" placeholderTextColor={Colors.textMuted} />
            {isValid && <Text style={[s.hint2, { color: Colors.green }]}>Order total: ${total.toFixed(2)} — waits for ETH to dip to ${price}</Text>}
          </Card>
          <PrimaryBtn label="Place Limit Order →" onPress={() => setPlaced(true)} disabled={!isValid} />
        </>
      ) : (
        <>
          <ResultBox correct message={`Limit order placed: Buy ${qty} ETH at $${price}. Your order sits in the book — executes when ETH hits that price or lower.`} />
          <Card>
            <Text style={s.fieldLabel}>LIMIT vs MARKET ORDER</Text>
            <Text style={s.bullet}>• Market order = buy NOW at current price (slippage risk)</Text>
            <Text style={s.bullet}>• Limit order = buy ONLY at your price (may never fill)</Text>
            <Text style={s.bullet}>• Coinbase Advanced Trade maker fee: 0.006% (vs 0.6% basic)</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── cbStaking ─────────────────────────────────────────────────────────────────
function CbStakingSim({ onComplete, onSkip }: SimProps) {
  const [ethAmount, setEthAmount] = useState('1');
  const [confirmed, setConfirmed] = useState(false);
  const ETH_PRICE = 3247;
  const APY_CB = 0.031; // 3.1% after Coinbase's 25% cut
  const APY_RAW = 0.042;
  const eth = parseFloat(ethAmount || '0');
  const yearlyEth = (eth * APY_CB).toFixed(4);
  const yearlyUsd = (eth * APY_CB * ETH_PRICE).toFixed(2);
  const cbCut = (eth * (APY_RAW - APY_CB) * ETH_PRICE).toFixed(2);

  return (
    <SimShell icon="🔵" title="Stake ETH on Coinbase" subtitle="Calculate your regulated staking returns — and Coinbase's cut.">
      <Card>
        <Text style={s.fieldLabel}>AMOUNT TO STAKE (ETH)</Text>
        <TextInput style={s.input} value={ethAmount} onChangeText={setEthAmount}
          keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <Text style={s.fieldLabel}>≈ ${(eth * ETH_PRICE).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</Text>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>PROJECTED ANNUAL RETURNS</Text>
        <View style={s.row}><Text style={s.rowKey}>You Earn (3.1% APY)</Text><Text style={[s.rowVal, { color: Colors.green }]}>+{yearlyEth} ETH (+${yearlyUsd})</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Coinbase's 25% cut</Text><Text style={[s.rowVal, { color: Colors.red }]}>-${cbCut}</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Network APY (raw)</Text><Text style={s.rowVal}>{(APY_RAW * 100).toFixed(1)}%</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Min. Stake</Text><Text style={s.rowVal}>0.001 ETH (no minimum!)</Text></View>
      </Card>

      {!confirmed ? (
        <PrimaryBtn label="Stake →" onPress={() => setConfirmed(true)} disabled={eth <= 0} />
      ) : (
        <>
          <ResultBox correct message={`Staked! You'll receive cbETH (Coinbase Staked ETH) — a liquid token you can sell while still earning rewards.`} />
          <Card>
            <Text style={s.fieldLabel}>KEY INSIGHT</Text>
            <Text style={s.bullet}>• cbETH = liquid staking token (sell any time)</Text>
            <Text style={s.bullet}>• Lido offers ~4% but cbETH is regulated + insured</Text>
            <Text style={s.bullet}>• Coinbase keeps 25% — self-staking via Lido is cheaper</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── accountAbstraction ────────────────────────────────────────────────────────
function AccountAbstractionSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const steps = [
    { label: 'Sign in with Google', sub: 'No seed phrase needed — your Google account IS the wallet', btn: 'Sign in with Google →', icon: '🔑' },
    { label: 'Gasless Swap: USDC → ETH', sub: 'The paymaster (a smart contract) covers gas. You pay zero ETH.', btn: 'Confirm Swap →', icon: '⛽' },
    { label: 'Transaction Submitted', sub: 'Bundler batches your tx with others. Paymaster pays the gas. No ETH needed in your wallet.', btn: 'Continue →', icon: '✅' },
  ];

  return (
    <SimShell icon="🔮" title="Gasless Transaction" subtitle="Experience Account Abstraction — a wallet without seed phrases or gas.">
      {step === 0 && (
        <Card>
          <Text style={s.fieldLabel}>TRADITIONAL WALLET FLOW</Text>
          <Text style={s.bullet}>1. Write down 12-word seed phrase</Text>
          <Text style={s.bullet}>2. Fund wallet with ETH for gas</Text>
          <Text style={s.bullet}>3. Sign transaction</Text>
          <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fee2e2', borderRadius: Radius.md }}>
            <Text style={{ color: Colors.red, fontWeight: '700', fontSize: FontSize.sm }}>⚠️ Lose your seed phrase = lose everything</Text>
          </View>
        </Card>
      )}

      {step > 0 && step < 3 && (
        <Card>
          <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: Spacing.sm }}>{steps[step - 1].icon}</Text>
          <Text style={[s.fieldLabel, { textAlign: 'center' }]}>STEP {step}</Text>
          <Text style={[s2.scenario, { textAlign: 'center' }]}>{steps[step - 1].label}</Text>
          <Text style={[s.hint2, { textAlign: 'center', marginTop: Spacing.sm }]}>{steps[step - 1].sub}</Text>
        </Card>
      )}

      {step === 3 && (
        <>
          <ResultBox correct message="Done! You just did a gasless swap using account abstraction. No seed phrase. No ETH for gas. This is what ERC-4337 enables." />
          <Card>
            <Text style={s.fieldLabel}>WHAT HAPPENED BEHIND THE SCENES</Text>
            <Text style={s.bullet}>• Your wallet = a smart contract, not a key pair</Text>
            <Text style={s.bullet}>• Bundler submitted your tx to the mempool</Text>
            <Text style={s.bullet}>• Paymaster contract paid the gas on your behalf</Text>
            <Text style={s.bullet}>• Recovery via social guardians (not seed phrase)</Text>
          </Card>
        </>
      )}

      {step < 3
        ? <PrimaryBtn label={step === 0 ? 'See AA Flow →' : steps[step - 1].btn} onPress={() => setStep((step + 1) as any)} />
        : <PrimaryBtn label="Continue →" onPress={onComplete} />}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── depin ─────────────────────────────────────────────────────────────────────
function DepinSim({ onComplete, onSkip }: SimProps) {
  const [active, setActive] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const GOAL = 5;

  const start = () => {
    setActive(true);
    timerRef.current = setInterval(() => {
      setMinutes(prev => {
        if (prev + 1 >= GOAL) {
          clearInterval(timerRef.current!);
          setActive(false);
          setDone(true);
          return GOAL;
        }
        return prev + 1;
      });
    }, 600); // fast for demo: 600ms = 1 sim-minute
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const earned = (minutes * 2.4).toFixed(1);
  const pct = Math.min(100, (minutes / GOAL) * 100);

  return (
    <SimShell icon="📡" title="Share Bandwidth — Earn Tokens" subtitle="Simulate contributing to a DePIN network (like Helium Mobile).">
      <Card>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>{done ? '📡' : active ? '🟢' : '⚫'}</Text>
          <Text style={[s.fieldLabel, { marginTop: Spacing.sm }]}>
            {done ? 'CONTRIBUTION COMPLETE' : active ? 'SHARING BANDWIDTH…' : 'DEVICE OFFLINE'}
          </Text>
          <View style={{ width: '100%', height: 8, backgroundColor: Colors.border, borderRadius: 99, marginTop: Spacing.md }}>
            <View style={{ height: 8, borderRadius: 99, backgroundColor: Colors.green, width: `${pct}%` }} />
          </View>
          <Text style={[s.bigNumber, { marginTop: Spacing.sm }]}>{earned} MOBILE</Text>
          <Text style={s.fieldLabel}>TOKENS EARNED ({minutes}/{GOAL} sim-minutes)</Text>
        </View>
      </Card>

      {!done ? (
        <PrimaryBtn label={active ? 'Sharing…' : 'Start Sharing Bandwidth →'} onPress={start} disabled={active} />
      ) : (
        <>
          <ResultBox correct message={`Earned ${earned} MOBILE tokens for sharing bandwidth! Real Helium miners earn $5–$50/month passively.`} />
          <Card>
            <Text style={s.fieldLabel}>HOW DePIN WORKS</Text>
            <Text style={s.bullet}>• You contribute a real resource (bandwidth, storage, compute)</Text>
            <Text style={s.bullet}>• The protocol verifies your contribution on-chain</Text>
            <Text style={s.bullet}>• You earn tokens proportional to your contribution</Text>
            <Text style={s.bullet}>• Examples: Helium (5G), Filecoin (storage), Render (GPU)</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── opsecIdentity ─────────────────────────────────────────────────────────────
function OpsecIdentitySim({ onComplete, onSkip }: SimProps) {
  const credentials = [
    { id: 'wallet', label: '🔑 Wallet Address', desc: 'Link your on-chain identity', xp: 25 },
    { id: 'ens',    label: '🌐 ENS Name',       desc: 'e.g. alice.eth — your web3 username', xp: 30 },
    { id: 'github', label: '💻 GitHub',          desc: 'Prove your development contributions', xp: 20 },
    { id: 'poap',   label: '🎫 POAP',            desc: 'Prove event attendance on-chain', xp: 15 },
  ];
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    if (done) return;
    setAdded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const score = [...added].reduce((acc, id) => acc + (credentials.find(c => c.id === id)?.xp || 0), 0);
  const GOAL_SCORE = 45;

  return (
    <SimShell icon="🪪" title="Build Your Decentralised Identity" subtitle="Create a DID (Decentralised Identifier) by linking on-chain credentials.">
      <Card>
        <Text style={s.fieldLabel}>YOUR DID: did:web3:0xA3f2...1c</Text>
        <Text style={s.hint2}>Trust score: {score}/{credentials.reduce((a, c) => a + c.xp, 0)} — add credentials to increase it</Text>
        <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 99, marginTop: Spacing.sm }}>
          <View style={{ height: 8, borderRadius: 99, backgroundColor: Colors.accent, width: `${Math.min(100, (score / 90) * 100)}%` }} />
        </View>
      </Card>

      {credentials.map(c => {
        const isAdded = added.has(c.id);
        return (
          <TouchableOpacity key={c.id} onPress={() => toggle(c.id)}
            style={[card.box, Shadow.sm, { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderColor: isAdded ? Colors.accent : Colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.md, fontWeight: '800', color: Colors.text }}>{c.label}</Text>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 2 }}>{c.desc}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800' }}>+{c.xp}</Text>
              <View style={[{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: isAdded ? Colors.accent : Colors.border, backgroundColor: isAdded ? Colors.accentSoft : 'transparent' }]}>
                {isAdded && <Text style={{ color: Colors.accent, fontWeight: '900', fontSize: 14 }}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {score < GOAL_SCORE
        ? <PrimaryBtn label={`Add more credentials (need ${GOAL_SCORE - score} more trust score)`} onPress={() => {}} disabled />
        : (
          <>
            <ResultBox correct message={`Trust score ${score}! Your DID is now verifiable across any dApp that supports Sign-in with Ethereum.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
        )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── chainBridging ─────────────────────────────────────────────────────────────
function ChainBridgingSim({ onComplete, onSkip }: SimProps) {
  const chains = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'];
  const [fromChain, setFromChain] = useState('Ethereum');
  const [toChain, setToChain]     = useState('Arbitrum');
  const [amount, setAmount]       = useState('0.5');
  const [step, setStep]           = useState<'setup' | 'confirm' | 'done'>('setup');

  const fees: Record<string, string> = {
    Polygon: '$0.02 · 2 min', Arbitrum: '$0.10 · 5 min',
    Optimism: '$0.08 · 5 min', Base: '$0.04 · 3 min',
  };
  const feeStr = toChain !== 'Ethereum' ? (fees[toChain] || '$0.05 · 5 min') : '$8–$30 · 7 days (withdrawal)';

  return (
    <SimShell icon="🌉" title="Bridge to an L2" subtitle="Move ETH from Ethereum mainnet to a Layer 2.">
      {step === 'setup' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>FROM CHAIN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {chains.map(c => (
                  <TouchableOpacity key={c} onPress={() => setFromChain(c)}
                    style={[chip.base, fromChain === c && chip.active]}>
                    <Text style={[chip.text, fromChain === c && chip.activeText]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={s.fieldLabel}>TO CHAIN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {chains.filter(c => c !== fromChain).map(c => (
                  <TouchableOpacity key={c} onPress={() => setToChain(c)}
                    style={[chip.base, toChain === c && chip.active]}>
                    <Text style={[chip.text, toChain === c && chip.activeText]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={s.fieldLabel}>AMOUNT (ETH)</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
          </Card>
          <Card>
            <Text style={s.fieldLabel}>BRIDGE COST ESTIMATE</Text>
            <View style={s.row}><Text style={s.rowKey}>Fee + Time</Text><Text style={s.rowVal}>{feeStr}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Receiving</Text><Text style={[s.rowVal, { color: Colors.green }]}>~{amount} ETH on {toChain}</Text></View>
            {toChain === 'Arbitrum' && <Text style={s.hint2}>💡 Arbitrum uses a 7-day fraud window to WITHDRAW back to Ethereum. Deposit is fast.</Text>}
          </Card>
          <PrimaryBtn label={`Bridge to ${toChain} →`} onPress={() => setStep('confirm')} disabled={!amount || parseFloat(amount) <= 0} />
        </>
      )}

      {step === 'confirm' && (
        <>
          <Card>
            <Text style={{ fontSize: 36, textAlign: 'center' }}>🌉</Text>
            <Text style={[s.fieldLabel, { textAlign: 'center', marginTop: Spacing.sm }]}>CONFIRM BRIDGE</Text>
            <View style={s.row}><Text style={s.rowKey}>From</Text><Text style={s.rowVal}>{fromChain}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>To</Text><Text style={s.rowVal}>{toChain}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Amount</Text><Text style={s.rowVal}>{amount} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Bridge Fee</Text><Text style={s.rowVal}>{feeStr.split(' · ')[0]}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Time</Text><Text style={s.rowVal}>{feeStr.split(' · ')[1] || '5 min'}</Text></View>
          </Card>
          <PrimaryBtn label="✓ Confirm Bridge" onPress={() => setStep('done')} />
        </>
      )}

      {step === 'done' && (
        <>
          <ResultBox correct message={`Bridged ${amount} ETH to ${toChain}! The same ETH balance will appear on ${toChain} — different network, same asset.`} />
          <Card>
            <Text style={s.fieldLabel}>IMPORTANT RULES</Text>
            <Text style={s.bullet}>• Bridged ETH is still ETH — just on a different chain</Text>
            <Text style={s.bullet}>• Always use the OFFICIAL bridge (never 3rd party random sites)</Text>
            <Text style={s.bullet}>• Withdrawing from Optimistic Rollups takes 7 days</Text>
            <Text style={s.bullet}>• ZK rollups (zkSync, Polygon zkEVM) withdraw in minutes</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── avaxStaking ───────────────────────────────────────────────────────────────
function AvaxStakingSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('25');
  const [period, setPeriod] = useState(14);
  const [confirmed, setConfirmed] = useState(false);
  const AVAX_PRICE = 37.5;
  const APY = 0.07;
  const avax = parseFloat(amount || '0');
  const MIN_AVAX = 25;
  const dailyEarnings = (avax * APY / 365).toFixed(4);
  const periodEarnings = (avax * APY * period / 365).toFixed(4);

  return (
    <SimShell icon="🏔️" title="Stake AVAX — 14-Day Minimum Lock" subtitle="Experience AVAX's staking rules: minimum 25 AVAX, minimum 2-week lock.">
      <Card>
        <Text style={s.fieldLabel}>AMOUNT TO STAKE (AVAX)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        {avax < MIN_AVAX && avax > 0 && (
          <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginTop: 4 }}>Minimum stake is {MIN_AVAX} AVAX</Text>
        )}
        <Text style={s.fieldLabel}>LOCK PERIOD (DAYS)</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {[14, 30, 90, 365].map(d => (
            <TouchableOpacity key={d} onPress={() => setPeriod(d)}
              style={[chip.base, period === d && chip.active]}>
              <Text style={[chip.text, period === d && chip.activeText]}>{d}d</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>PROJECTED REWARDS (~7% APY)</Text>
        <View style={s.row}><Text style={s.rowKey}>Per Day</Text><Text style={[s.rowVal, { color: Colors.green }]}>+{dailyEarnings} AVAX</Text></View>
        <View style={s.row}><Text style={s.rowKey}>After {period} days</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>+{periodEarnings} AVAX (+${(parseFloat(periodEarnings) * AVAX_PRICE).toFixed(2)})</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Slashing Risk</Text><Text style={s.rowVal}>❌ None for delegators</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Your AVAX locked until</Text>
          <Text style={s.rowVal}>{new Date(Date.now() + period * 86400000).toLocaleDateString()}</Text></View>
      </Card>

      {!confirmed ? (
        <PrimaryBtn
          label={avax < MIN_AVAX ? `Need at least ${MIN_AVAX} AVAX` : `Lock ${amount} AVAX for ${period} Days →`}
          onPress={() => setConfirmed(true)}
          disabled={avax < MIN_AVAX} />
      ) : (
        <>
          <ResultBox correct message={`Staked! Your ${amount} AVAX is locked until ${new Date(Date.now() + period * 86400000).toLocaleDateString()}. Unlike ETH staking, you can't exit early.`} />
          <Card>
            <Text style={s.fieldLabel}>AVAX STAKING RULES TO REMEMBER</Text>
            <Text style={s.bullet}>• Minimum: 25 AVAX (~$937 at current price)</Text>
            <Text style={s.bullet}>• Minimum lock: 14 days. Maximum: 1 year</Text>
            <Text style={s.bullet}>• No slashing — delegators never lose stake</Text>
            <Text style={s.bullet}>• Longer lock = higher rewards (up to 7.5%)</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── chainComparison ───────────────────────────────────────────────────────────
function ChainComparisonSim({ onComplete, onSkip }: SimProps) {
  const pairs = [
    { useCase: '⚡ Fastest cheap NFT minting', correct: 'Solana', options: ['Solana', 'Ethereum'] },
    { useCase: '🏦 Highest DeFi liquidity and composability', correct: 'Ethereum', options: ['Ethereum', 'Avalanche'] },
    { useCase: '📱 Consumer apps via Telegram (900M users)', correct: 'TON', options: ['TON', 'Base'] },
    { useCase: '🎮 Beginner-friendly consumer crypto / gaming', correct: 'Abstract', options: ['Abstract', 'Arbitrum'] },
    { useCase: '🔗 Enterprise subnets + institutional DeFi', correct: 'Avalanche', options: ['Avalanche', 'Polygon'] },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const score = pairs.filter((p, i) => answers[i] === p.correct).length;
  const passed = score >= 4;

  return (
    <SimShell icon="🗺️" title="Which Chain for What?" subtitle="Boss challenge: match each use case to the best chain.">
      {pairs.map((p, i) => {
        const chosen = answers[i];
        return (
          <Card key={i}>
            <Text style={s2.scenario}>{p.useCase}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              {p.options.map(opt => {
                const isChosen  = chosen === opt;
                const isCorrect = opt === p.correct;
                let bg = Colors.card, border = Colors.border;
                if (checked && isChosen && isCorrect)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isChosen && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isChosen && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={opt} onPress={() => !checked && setAnswers(a => ({ ...a, [i]: opt }))}
                    style={[s2.prodBtn, { backgroundColor: bg, borderColor: border, borderWidth: 2, flex: 1 }]}>
                    <Text style={{ fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, textAlign: 'center' }}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        );
      })}

      {!checked ? (
        <PrimaryBtn label="Submit Answers →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < pairs.length} />
      ) : (
        <>
          <ResultBox correct={passed} message={passed
            ? `${score}/5 correct! You know your chains. This mental map is crucial for real-world decisions.`
            : `${score}/5 correct. Each chain has a niche — review the correct answers above.`} />
          {passed
            ? <PrimaryBtn label="Continue →" onPress={onComplete} />
            : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── addressPoison ─────────────────────────────────────────────────────────────
function AddressPoisonSim({ onComplete, onSkip }: SimProps) {
  const REAL    = '0xA4b1...1c3D';
  const POISON  = '0xA4b1...9c3D'; // changes 1→9 at position 11
  const history = [
    { type: 'sent',     to: REAL,   amount: '0.5 ETH', time: '3 days ago',  isPoison: false },
    { type: 'received', from: REAL, amount: '0.5 ETH', time: '2 days ago',  isPoison: false },
    { type: 'sent',     to: POISON, amount: '0 ETH',   time: '1 day ago',   isPoison: true,  note: 'Poisoning tx — attacker sent dust to insert fake address into your history' },
    { type: 'received', from: REAL, amount: '1.2 ETH', time: '4 hours ago', isPoison: false },
  ];

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked]   = useState(false);

  const correct = selected === 2;

  return (
    <SimShell icon="☠️" title="Spot the Poisoned Address" subtitle="Your wallet history has been poisoned. One entry is a trap — find it before you copy-paste the wrong address.">
      <Card>
        <Text style={s.fieldLabel}>YOUR REAL ADDRESS</Text>
        <Text style={s.address}>{REAL}</Text>
        <Text style={s.fieldLabel}>THE POISON ADDRESS (look carefully!)</Text>
        <Text style={[s.address, { color: Colors.red }]}>{POISON}</Text>
        <Text style={s.hint2}>💡 The attacker changed ONE character — position 11 (1 → 9)</Text>
      </Card>

      <Text style={[s.fieldLabel, { paddingHorizontal: 0 }]}>TAP THE POISONED TRANSACTION:</Text>

      {history.map((tx, i) => {
        const isSelected = selected === i;
        let bg = Colors.card, border = Colors.border;
        if (checked && isSelected && tx.isPoison)  { bg = '#d1fae5'; border = Colors.green; }
        if (checked && isSelected && !tx.isPoison) { bg = '#fee2e2'; border = Colors.red; }
        if (checked && !isSelected && tx.isPoison) { bg = '#fef3c7'; border = '#f59e0b'; }
        return (
          <TouchableOpacity key={i} onPress={() => !checked && setSelected(i)}
            style={[card.box, Shadow.sm, { borderColor: isSelected ? Colors.accent : border, backgroundColor: bg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: FontSize.sm, fontWeight: '800', color: tx.type === 'sent' ? Colors.red : Colors.green }}>
                {tx.type === 'sent' ? '↑ SENT' : '↓ RECEIVED'}
              </Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{tx.time}</Text>
            </View>
            <Text style={[s.address, { marginTop: 4 }]}>{tx.type === 'sent' ? `To: ${tx.to}` : `From: ${tx.from}`}</Text>
            <Text style={{ fontSize: FontSize.sm, color: Colors.text, marginTop: 2 }}>{tx.amount}</Text>
            {checked && tx.isPoison && <Text style={{ fontSize: FontSize.xs, color: '#92400e', marginTop: 4, fontWeight: '700' }}>⚠️ {tx.note}</Text>}
          </TouchableOpacity>
        );
      })}

      {!checked ? (
        <PrimaryBtn label="Confirm Selection →" onPress={() => setChecked(true)} disabled={selected === null} />
      ) : (
        <>
          <ResultBox correct={correct} message={correct
            ? "Correct! You spotted the poisoned tx. The attacker sent 0 ETH dust to insert the fake address into your history."
            : "That was the real transaction. The poisoned one is the dust tx with 0 ETH — tx #3 above."} />
          {correct
            ? (
              <>
                <Card>
                  <Text style={s.fieldLabel}>HOW TO PROTECT YOURSELF</Text>
                  <Text style={s.bullet}>• NEVER copy an address from your transaction history</Text>
                  <Text style={s.bullet}>• Always use your address book / ENS name</Text>
                  <Text style={s.bullet}>• Always verify the FULL address, not just first/last 4</Text>
                  <Text style={s.bullet}>• Send a $1 test transaction before large transfers</Text>
                </Card>
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
            )
            : <PrimaryBtn label="Try Again" onPress={() => { setSelected(null); setChecked(false); }} />}
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── mevSandwich ───────────────────────────────────────────────────────────────
function MevSandwichSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [usedProtection, setUsedProtection] = useState(false);

  return (
    <SimShell icon="🤖" title="MEV Sandwich Attack" subtitle="See how bots front-run your DEX trade — then protect yourself.">
      {step === 0 && (
        <Card>
          <Text style={s2.scenario}>You swap 1 ETH for USDC on Uniswap. Your tx is in the public mempool for ~12 seconds before it's mined…</Text>
          <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
            <Text style={{ color: '#92400e', fontWeight: '700', fontSize: FontSize.sm }}>🤖 A MEV bot is watching the mempool right now</Text>
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Text style={s.fieldLabel}>THE SANDWICH</Text>
          <View style={{ gap: Spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>Front-run:</Text>
                <Text style={{ color: Colors.textSoft, fontSize: FontSize.xs }}>Bot buys 50 ETH before your tx → price spikes</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>Your swap:</Text>
                <Text style={{ color: Colors.textSoft, fontSize: FontSize.xs }}>You buy ETH at the inflated price</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>Back-run:</Text>
                <Text style={{ color: Colors.textSoft, fontSize: FontSize.xs }}>Bot sells 50 ETH immediately, pocketing ~$80 profit from your loss</Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fee2e2', borderRadius: Radius.md }}>
            <Text style={{ color: Colors.red, fontWeight: '800', fontSize: FontSize.sm }}>You lost ~$80 to slippage. The bot pocketed it.</Text>
          </View>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={s.fieldLabel}>HOW TO PROTECT YOURSELF</Text>
          <Text style={s.hint2}>Instead of the public mempool, route your swap through a private RPC:</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {['MEV Blocker (mevblocker.io)', 'Flashbots Protect RPC', 'Set slippage tolerance to 0.5%'].map((opt, i) => (
              <TouchableOpacity key={i} onPress={() => { if (i === 0 || i === 1) setUsedProtection(true); }}
                style={[chip.base, (usedProtection && i === 0) && chip.active, { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
                <Text style={[chip.text, (usedProtection && i === 0) && chip.activeText]}>{opt}</Text>
                {usedProtection && i === 0 && <Text style={{ marginLeft: 'auto' as any, color: Colors.green, fontWeight: '900' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {step === 3 && (
        <>
          <ResultBox correct message="Protected! Your transaction went through a private mempool. Bots couldn't see it, so they couldn't front-run it." />
          <Card>
            <Text style={s.fieldLabel}>KEY PROTECTION RULES</Text>
            <Text style={s.bullet}>• Set slippage to 0.3–0.5% (not the default 1–3%)</Text>
            <Text style={s.bullet}>• Use MEV Blocker or Flashbots Protect for large trades</Text>
            <Text style={s.bullet}>• CoW Protocol routes swaps off-chain to avoid MEV</Text>
            <Text style={s.bullet}>• Uniswap's official app has some MEV protection built in</Text>
          </Card>
        </>
      )}

      {step < 3
        ? <PrimaryBtn label={['See the Attack →', 'How to Protect Yourself →', `Use MEV Blocker →`, ''][step]} onPress={() => setStep((step + 1) as any)} />
        : <PrimaryBtn label="Continue →" onPress={onComplete} />}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── discordResearch ───────────────────────────────────────────────────────────
function DiscordResearchSim({ onComplete, onSkip }: SimProps) {
  const messages = [
    { sender: 'CryptoMod_Official', content: 'Hi! I noticed you asked a question. I can help — tap here to verify your wallet and claim your 0.5 ETH reward!', isScam: true,  redFlags: ['Unsolicited DM', 'Wallet verification request', '"Reward" incentive'] },
    { sender: 'ProjectDev_Real',    content: 'Check our announcement channel for the new smart contract address. The old one was hacked.', isScam: true,  redFlags: ['Urgent contract change', 'Creates FOMO', 'Use official channels only'] },
    { sender: 'Alice_Community',    content: 'The whitepaper is in #resources. The team usually answers in #general around 3pm UTC.', isScam: false, redFlags: [] },
    { sender: 'Support_Official',   content: 'We will NEVER DM you first. If someone claiming to be support messages you, report and block them.', isScam: false, redFlags: [] },
  ];

  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);

  const allAnswered = messages.every((_, i) => answers[i] !== undefined);
  const score = messages.filter((m, i) => answers[i] === m.isScam).length;
  const passed = score >= 3;

  return (
    <SimShell icon="💬" title="Discord Safety Check" subtitle="Identify which messages are scams — and why.">
      <Text style={[s.fieldLabel, { paddingHorizontal: 0 }]}>IS THIS MESSAGE A SCAM?</Text>

      {messages.map((msg, i) => {
        const chosen   = answers[i];
        const isCorrect = chosen === msg.isScam;

        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.sm }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14 }}>👤</Text>
              </View>
              <Text style={{ fontWeight: '900', fontSize: FontSize.sm, color: Colors.text }}>{msg.sender}</Text>
            </View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>"{msg.content}"</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[true, false].map(val => (
                <TouchableOpacity key={String(val)} onPress={() => !checked && setAnswers(a => ({ ...a, [i]: val }))}
                  style={[chip.base, chosen === val && chip.active, { flex: 1 }]}>
                  <Text style={[chip.text, chosen === val && chip.activeText, { textAlign: 'center' }]}>{val ? '⚠️ SCAM' : '✅ LEGIT'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {checked && msg.redFlags.length > 0 && (
              <View style={{ marginTop: Spacing.sm }}>
                {msg.redFlags.map((f, fi) => <Text key={fi} style={[s.bullet, { color: '#92400e' }]}>🚩 {f}</Text>)}
              </View>
            )}
          </Card>
        );
      })}

      {!checked ? (
        <PrimaryBtn label="Check Answers →" onPress={() => setChecked(true)} disabled={!allAnswered} />
      ) : (
        <>
          <ResultBox correct={passed} message={passed
            ? `${score}/4 correct! You can spot Discord scams.`
            : `${score}/4 correct. Review the red flags above — real mods never DM first.`} />
          {passed
            ? <PrimaryBtn label="Continue →" onPress={onComplete} />
            : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── opsecCheck ────────────────────────────────────────────────────────────────
function OpsecCheckSim({ onComplete, onSkip }: SimProps) {
  const checks = [
    { id: 'hw',      label: 'Hardware wallet for >$1k',         points: 25, tip: 'Ledger or Trezor keeps keys offline' },
    { id: 'seed',    label: 'Seed phrase stored offline (not phone/cloud)', points: 20, tip: 'Never digital. Metal plate > paper.' },
    { id: 'vpn',     label: 'Using VPN for crypto activity',    points: 10, tip: 'Hides your IP from scrapers and hackers' },
    { id: 'email',   label: 'Unique email for each exchange',   points: 15, tip: 'Prevents credential stuffing attacks' },
    { id: 'sms',     label: '2FA via Authenticator app (not SMS)', points: 20, tip: 'SMS SIM-swap attacks are common' },
    { id: 'browser', label: 'Dedicated browser profile for crypto', points: 10, tip: 'Separates extensions that could be malicious' },
  ];

  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const score = [...ticked].reduce((acc, id) => acc + (checks.find(c => c.id === id)?.points || 0), 0);
  const maxScore = checks.reduce((a, c) => a + c.points, 0);
  const pct = Math.round((score / maxScore) * 100);
  const status = pct >= 70 ? 'green' : pct >= 40 ? 'amber' : 'red';
  const statusColor = status === 'green' ? Colors.green : status === 'amber' ? '#f59e0b' : Colors.red;

  const toggle = (id: string) => !submitted && setTicked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <SimShell icon="🛡️" title="Your OPSEC Score" subtitle="Honestly tick which security practices you follow — and see your risk level.">
      {checks.map(c => {
        const isOn = ticked.has(c.id);
        return (
          <TouchableOpacity key={c.id} onPress={() => toggle(c.id)}
            style={[card.box, Shadow.sm, { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderColor: isOn ? Colors.green : Colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: Colors.text }}>{c.label}</Text>
              {submitted && !isOn && <Text style={{ fontSize: FontSize.xs, color: '#92400e', marginTop: 2 }}>💡 {c.tip}</Text>}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>+{c.points}</Text>
              <View style={[{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: isOn ? Colors.green : Colors.border, backgroundColor: isOn ? '#d1fae5' : 'transparent' }]}>
                {isOn && <Text style={{ color: Colors.green, fontWeight: '900', fontSize: 14 }}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {!submitted ? (
        <PrimaryBtn label="Calculate My OPSEC Score →" onPress={() => setSubmitted(true)} />
      ) : (
        <>
          <Card>
            <Text style={[s.fieldLabel, { textAlign: 'center' }]}>YOUR OPSEC SCORE</Text>
            <Text style={[s.bigNumber, { textAlign: 'center', color: statusColor }]}>{pct}%</Text>
            <Text style={[s.fieldLabel, { textAlign: 'center', color: statusColor }]}>
              {status === 'green' ? '🟢 STRONG — Good habits in place' : status === 'amber' ? '🟡 MODERATE — Gaps remain' : '🔴 HIGH RISK — Act now'}
            </Text>
            <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 99, marginTop: Spacing.md }}>
              <View style={{ height: 8, borderRadius: 99, backgroundColor: statusColor, width: `${pct}%` }} />
            </View>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 1 — Bitcoin Bay
// ─────────────────────────────────────────────────────────────────────────────

function SendBitcoinSim({ onComplete, onSkip }: SimProps) {
  const BALANCE = 0.0842;
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [feeLevel, setFeeLevel] = useState<'slow'|'medium'|'fast'>('medium');
  const [step, setStep] = useState<'form'|'confirm'|'done'>('form');
  const fees = { slow:{ sat:'12 sat/vB', time:'~60 min', btc:'0.00002' }, medium:{ sat:'25 sat/vB', time:'~20 min', btc:'0.00004' }, fast:{ sat:'50 sat/vB', time:'~10 min', btc:'0.00008' } };
  const fee = fees[feeLevel];
  const amt = parseFloat(amount) || 0;
  const total = amt + parseFloat(fee.btc);
  const valid = to.length > 10 && amt > 0 && amt < BALANCE;
  return (
    <SimShell icon="₿" title="Send Bitcoin" subtitle="Build a real transaction — choose your fee, review and confirm.">
      {step === 'form' && (<>
        <Card>
          <Text style={s.fieldLabel}>YOUR BALANCE</Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md }}>{BALANCE} BTC</Text>
          <Text style={s.fieldLabel}>RECIPIENT ADDRESS</Text>
          <TextInput style={s.input} value={to} onChangeText={setTo} placeholder="bc1q... or 3... or 1..." placeholderTextColor={Colors.textSoft} autoCapitalize="none" />
          <Text style={s.fieldLabel}>AMOUNT (BTC)</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="e.g. 0.01" placeholderTextColor={Colors.textSoft} />
        </Card>
        <Card>
          <Text style={s.fieldLabel}>NETWORK FEE</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(['slow','medium','fast'] as const).map(l => (
              <TouchableOpacity key={l} onPress={() => setFeeLevel(l)}
                style={[{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center', borderColor: feeLevel === l ? Colors.accent : Colors.border, backgroundColor: feeLevel === l ? Colors.accentSoft : Colors.card }]}>
                <Text style={{ fontWeight: '800', fontSize: FontSize.xs, color: feeLevel === l ? Colors.accent : Colors.text }}>{l.charAt(0).toUpperCase() + l.slice(1)}</Text>
                <Text style={{ fontSize: 10, color: Colors.textSoft, marginTop: 2 }}>{fees[l].time}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[s.row, { marginTop: Spacing.md }]}><Text style={s.rowKey}>Fee rate</Text><Text style={s.rowVal}>{fee.sat}</Text></View>
          {amt > 0 && <View style={s.row}><Text style={s.rowKey}>Total out</Text><Text style={[s.rowVal, { color: Colors.text, fontWeight: '900' }]}>{total.toFixed(5)} BTC</Text></View>}
        </Card>
        <PrimaryBtn label="Review Transaction →" onPress={() => setStep('confirm')} disabled={!valid} />
      </>)}
      {step === 'confirm' && (<>
        <Card>
          <Text style={s.fieldLabel}>CONFIRM — THIS CANNOT BE UNDONE</Text>
          <View style={s.row}><Text style={s.rowKey}>To</Text><Text style={s.rowVal}>{to.slice(0,12)}…{to.slice(-6)}</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Amount</Text><Text style={s.rowVal}>{amount} BTC</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Fee ({feeLevel})</Text><Text style={s.rowVal}>{fee.btc} BTC · {fee.time}</Text></View>
          <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm }]}><Text style={s.rowKey}>Total deducted</Text><Text style={[s.rowVal, { color: Colors.red, fontWeight: '900' }]}>{total.toFixed(5)} BTC</Text></View>
        </Card>
        <View style={{ backgroundColor: '#fef3c7', borderRadius: Radius.md, padding: Spacing.md }}>
          <Text style={{ color: '#92400e', fontWeight: '700', fontSize: FontSize.sm }}>⚠️ Bitcoin transactions are IRREVERSIBLE. Verify the address character by character.</Text>
        </View>
        <PrimaryBtn label="✓ Sign & Broadcast" onPress={() => setStep('done')} />
      </>)}
      {step === 'done' && (<>
        <ResultBox correct message={`Broadcast! Miners will confirm it ${fee.time}. Signed with your private key — impossible to forge or reverse.`} />
        <Card>
          <Text style={s.fieldLabel}>WHAT JUST HAPPENED</Text>
          <Text style={s.bullet}>• You signed with your private key — proves ownership</Text>
          <Text style={s.bullet}>• Broadcast to thousands of nodes worldwide</Text>
          <Text style={s.bullet}>• Miners include it in the next block for the fee</Text>
          <Text style={s.bullet}>• After 6 confirmations (~60 min) it's considered final</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BitcoinFeesSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    { q: 'Paying for coffee — must confirm in 10 min', correct: 'fast',   hint: 'Time-sensitive: pay the higher fee to guarantee fast inclusion.' },
    { q: 'Moving savings to cold storage — happy to wait overnight', correct: 'slow', hint: 'No urgency: a low fee saves money. Miners will eventually include it.' },
    { q: 'Sending to an exchange before a big market move in 20 min', correct: 'fast', hint: 'Financial deadline: pay for speed. Cheap transactions can be stuck for days.' },
    { q: 'Withdrawing mining rewards — not urgent', correct: 'slow', hint: 'Batch low-urgency transfers at low fee times (weekends, low congestion).' },
  ];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((sc, i) => answers[i] === sc.correct).length;
  const passed = score >= 3;
  return (
    <SimShell icon="⛽" title="Choose the Right Fee" subtitle="For each scenario, pick the appropriate fee tier.">
      {scenarios.map((sc, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: checked ? (answers[i] === sc.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, fontSize: FontSize.md, lineHeight: 20, marginBottom: Spacing.md }}>{sc.q}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {(['slow','medium','fast'] as const).map(tier => {
                const isCh = chosen === tier; const isCo = tier === sc.correct;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={tier} onPress={() => !checked && setAnswers(a => ({ ...a, [i]: tier }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', fontSize: FontSize.sm, color: Colors.text }}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {sc.hint}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check Answers →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/4 — Good fee instincts. Check mempool.space before any time-sensitive send.` : `${score}/4 — Review the hints. Fee strategy saves real money.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function LightningSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0|1|2|3>(0);
  const [amount, setAmount] = useState('');
  const sats = Math.round((parseFloat(amount) || 0) * 100_000_000);
  return (
    <SimShell icon="⚡" title="Pay via Lightning Network" subtitle="Experience an instant, near-zero-fee Bitcoin payment.">
      {step === 0 && <Card>
        <Text style={s.hint2}>Normal Bitcoin: ~10 min wait, ~$2 fee. Lightning opens a payment channel off-chain — payments settle in under 1 second for fractions of a cent.</Text>
        <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
          <Text style={{ fontWeight: '800', color: Colors.green }}>⚡ Lightning: &lt;1 second · Fee: ~0.5 sat (~$0.0003)</Text>
        </View>
      </Card>}
      {step === 1 && <Card>
        <Text style={s.fieldLabel}>LIGHTNING INVOICE (from merchant)</Text>
        <Text style={[s.address, { fontSize: 11 }]}>lnbc50u1pj8q9nppp5yqd9c...</Text>
        <Text style={s.fieldLabel}>AMOUNT (BTC)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="e.g. 0.0005" placeholderTextColor={Colors.textSoft} />
        <View style={s.row}><Text style={s.rowKey}>≈ Satoshis</Text><Text style={s.rowVal}>{sats.toLocaleString()} sats</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Network fee</Text><Text style={[s.rowVal, { color: Colors.green }]}>~0.5 sat (&lt;$0.001)</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Speed</Text><Text style={[s.rowVal, { color: Colors.green }]}>Instant</Text></View>
      </Card>}
      {step === 2 && <Card>
        <Text style={{ fontSize: 36, textAlign: 'center' }}>⚡</Text>
        <Text style={[s.fieldLabel, { textAlign: 'center', marginTop: Spacing.sm }]}>PAYMENT ROUTING</Text>
        <Text style={[s.hint2, { textAlign: 'center', marginTop: 4 }]}>Your node finds a path through existing channels to the merchant. No mining. Settles atomically — either works completely or nothing moves.</Text>
      </Card>}
      {step === 3 && (<>
        <ResultBox correct message="Settled instantly! Lightning handles micropayments that would clog the Bitcoin mainchain." />
        <Card>
          <Text style={s.fieldLabel}>LIGHTNING vs ON-CHAIN</Text>
          <View style={s.row}><Text style={s.rowKey}>Speed</Text><Text style={s.rowVal}>Instant vs ~10 min</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Fee</Text><Text style={s.rowVal}>&lt;1 sat vs 500–5,000 sat</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Best for</Text><Text style={s.rowVal}>Micropayments, daily use</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Limitation</Text><Text style={s.rowVal}>Needs online node, channel capacity</Text></View>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      {step < 3 && <PrimaryBtn label={['See Lightning in Action →', 'Review Payment →', 'Send Payment ⚡', ''][step]} onPress={() => setStep((step + 1) as any)} disabled={step === 1 && !amount} />}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 2 — Ethereum Essentials
// ─────────────────────────────────────────────────────────────────────────────

function Erc20TokenSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    { name: 'USDC', standard: 'ERC-20', supply: '44,000,000,000', isNFT: false },
    { name: 'Bored Ape #7890', standard: 'ERC-721', supply: '10,000 (unique)', isNFT: true },
    { name: 'UNI (Uniswap)', standard: 'ERC-20', supply: '1,000,000,000', isNFT: false },
    { name: 'Sandbox LAND', standard: 'ERC-1155', supply: '166,464 plots', isNFT: true },
    { name: 'WBTC', standard: 'ERC-20', supply: 'Pegged 1:1 to BTC', isNFT: false },
  ];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = tokens.filter((t, i) => (answers[i] === 'erc20' && !t.isNFT) || (answers[i] === 'nft' && t.isNFT)).length;
  const passed = score >= 4;
  return (
    <SimShell icon="🪙" title="ERC-20 or NFT?" subtitle="Identify the token standard from the contract info.">
      {tokens.map((t, i) => {
        const chosen = answers[i];
        const isCorrect = (chosen === 'erc20' && !t.isNFT) || (chosen === 'nft' && t.isNFT);
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '900', fontSize: FontSize.md, color: Colors.text, marginBottom: 4 }}>{t.name}</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginBottom: Spacing.md }}>Standard: {t.standard} · Supply: {t.supply}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[{ id: 'erc20', label: '🪙 Fungible (ERC-20)' }, { id: 'nft', label: '🖼️ Unique (NFT)' }].map(opt => {
                const isCh = chosen === opt.id; const isCo = (opt.id === 'erc20' && !t.isNFT) || (opt.id === 'nft' && t.isNFT);
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return <TouchableOpacity key={opt.id} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: opt.id }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: Colors.text, textAlign: 'center' }}>{opt.label}</Text>
                </TouchableOpacity>;
              })}
            </View>
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/5 — ERC-20 tokens are identical units. NFTs (ERC-721/1155) are each unique.` : `${score}/5 — Key rule: if each unit is identical and interchangeable, it's ERC-20.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function EthValidatorSim({ onComplete, onSkip }: SimProps) {
  const [eth, setEth] = useState('32');
  const [confirmed, setConfirmed] = useState(false);
  const ETH_PRICE = 3247; const APY = 0.042;
  const amount = parseFloat(eth) || 0;
  const yearlyEth = (amount * APY).toFixed(4);
  const yearlyUsd = (amount * APY * ETH_PRICE).toFixed(2);
  return (
    <SimShell icon="⟠" title="Ethereum Validator Calculator" subtitle="See the exact requirements, rewards, and risks of solo staking.">
      <Card>
        <Text style={s.fieldLabel}>ETH TO STAKE</Text>
        <TextInput style={s.input} value={eth} onChangeText={setEth} keyboardType="decimal-pad" placeholderTextColor={Colors.textSoft} />
        {amount > 0 && amount < 32 && <Text style={{ color: Colors.red, fontSize: FontSize.xs }}>Minimum to run your own validator node is exactly 32 ETH</Text>}
      </Card>
      <Card>
        <Text style={s.fieldLabel}>ANNUAL REWARDS (~4.2% APY)</Text>
        <View style={s.row}><Text style={s.rowKey}>ETH earned/year</Text><Text style={[s.rowVal, { color: Colors.green }]}>+{yearlyEth} ETH</Text></View>
        <View style={s.row}><Text style={s.rowKey}>USD equivalent</Text><Text style={[s.rowVal, { color: Colors.green }]}>+${yearlyUsd}</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Slashing risk</Text><Text style={[s.rowVal, { color: Colors.red }]}>Up to 100% if dishonest</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Must stay online</Text><Text style={s.rowVal}>24/7 — inactivity = penalties</Text></View>
      </Card>
      <Card>
        <Text style={s.fieldLabel}>DON'T HAVE 32 ETH? ALTERNATIVES</Text>
        <Text style={s.bullet}>• Lido stETH — stake any amount, liquid token (~4%)</Text>
        <Text style={s.bullet}>• Rocket Pool rETH — decentralised, 8 ETH to run a node</Text>
        <Text style={s.bullet}>• Coinbase cbETH — regulated, 0.001 ETH minimum (3.1%)</Text>
      </Card>
      {!confirmed
        ? <PrimaryBtn label={amount >= 32 ? `Activate ${Math.floor(amount / 32)} Validator(s) →` : 'Need 32 ETH minimum'} onPress={() => setConfirmed(true)} disabled={amount < 32} />
        : <><ResultBox correct message="Validator active! Your node must propose and attest to blocks. Downtime causes small penalties. Acting maliciously triggers slashing." /><PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function Layer2Sim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    { q: 'Fastest withdrawal time back to Ethereum mainnet', correct: 'zkSync', hint: 'ZK rollups withdraw in minutes. Optimistic rollups need 7 days.' },
    { q: 'Deepest DeFi liquidity for large trades', correct: 'Arbitrum', hint: 'Arbitrum has the most DeFi TVL of any L2 — GMX, Uniswap v3, Aave all live here.' },
    { q: 'Onboard non-crypto friends with simplest UX', correct: 'Base', hint: 'Base has Coinbase integration, smart wallets, and gasless transactions — the friendliest L2.' },
    { q: 'Enterprise private subnet for an institutional product', correct: 'Avalanche', hint: 'Avalanche subnets are custom blockchains — used by enterprises like Shopify and Celo.' },
  ];
  const opts = ['Arbitrum', 'Optimism', 'Base', 'zkSync', 'Avalanche'];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((sc, i) => answers[i] === sc.correct).length;
  const passed = score >= 3;
  return (
    <SimShell icon="🔗" title="Pick the Right L2" subtitle="Match each use case to the best Layer 2 or scaling solution.">
      {scenarios.map((sc, i) => {
        const chosen = answers[i];
        return (
          <Card key={i} style={{ borderColor: checked ? (answers[i] === sc.correct ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, fontSize: FontSize.md, lineHeight: 20, marginBottom: Spacing.md }}>{sc.q}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {opts.map(opt => {
                  const isCh = chosen === opt; const isCo = opt === sc.correct;
                  let bg = Colors.card, border = Colors.border;
                  if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                  if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                  if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                  return <TouchableOpacity key={opt} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: opt }))}
                    style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}</Text>
                  </TouchableOpacity>;
                })}
              </View>
            </ScrollView>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {sc.hint}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/4 — Strong L2 knowledge. Each chain has a niche.` : `${score}/4 — Each chain is purpose-built. Review the hints above.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 3 — Wallet & Security
// ─────────────────────────────────────────────────────────────────────────────

function MetamaskSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0|1|2|3>(0);
  const [networkAdded, setNetworkAdded] = useState(false);
  const [connected, setConnected] = useState(false);
  return (
    <SimShell icon="🦊" title="Set Up MetaMask" subtitle="Add a network and connect to a dApp — the two most common MetaMask actions.">
      {step === 0 && <Card><Text style={s.hint2}>MetaMask defaults to Ethereum mainnet. Most DeFi is on cheaper networks. You add them manually — or use Chainlist.org to do it safely in one click.</Text></Card>}
      {step === 1 && <Card>
        <Text style={s.fieldLabel}>ADD ARBITRUM NETWORK</Text>
        {[['Network Name','Arbitrum One'],['RPC URL','https://arb1.arbitrum.io/rpc'],['Chain ID','42161'],['Symbol','ETH'],['Explorer','arbiscan.io']].map(([k,v]) => (
          <View key={k} style={[s.row, { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: Spacing.sm }]}>
            <Text style={[s.rowKey, { width: 100 }]}>{k}</Text>
            <Text style={{ flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: Colors.text }}>{v}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={() => setNetworkAdded(true)}
          style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: networkAdded ? '#d1fae5' : Colors.accentSoft, alignItems: 'center' }}>
          <Text style={{ fontWeight: '800', color: networkAdded ? Colors.green : Colors.accent }}>{networkAdded ? '✓ Network Added!' : 'Tap to Add Network'}</Text>
        </TouchableOpacity>
      </Card>}
      {step === 2 && <Card>
        <Text style={s.fieldLabel}>CONNECT TO UNISWAP</Text>
        <Text style={s.hint2}>A dApp requests connection. MetaMask shows exactly what it can access — read it before approving.</Text>
        <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f9fafb', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border }}>
          <Text style={{ fontWeight: '900', fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.sm }}>app.uniswap.org wants to:</Text>
          <Text style={s.bullet}>✓ See your wallet address</Text>
          <Text style={s.bullet}>✓ See your token balances</Text>
          <Text style={[s.bullet, { color: Colors.green }]}>✗ Cannot move funds without your signature per transaction</Text>
        </View>
        <TouchableOpacity onPress={() => setConnected(true)}
          style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: connected ? '#d1fae5' : Colors.accent, alignItems: 'center' }}>
          <Text style={{ fontWeight: '800', color: '#fff' }}>{connected ? '✓ Connected!' : 'Connect Wallet'}</Text>
        </TouchableOpacity>
      </Card>}
      {step === 3 && (<>
        <ResultBox correct message="Connected! Sharing your address ≠ sharing your funds. Every transaction still needs your signature." />
        <Card>
          <Text style={s.fieldLabel}>GOLDEN RULES</Text>
          <Text style={s.bullet}>• MetaMask NEVER asks for your seed phrase — ever</Text>
          <Text style={s.bullet}>• "Connect wallet" only shares your address, not funds</Text>
          <Text style={s.bullet}>• Revoke old approvals regularly at revoke.cash</Text>
          <Text style={s.bullet}>• Use Chainlist.org to add networks — not manual entry</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      {step < 3 && <PrimaryBtn label={['Start →', 'Add Network →', networkAdded ? 'Connect to Uniswap →' : 'Add Network First', ''][step]} onPress={() => setStep((step + 1) as any)} disabled={step === 1 && !networkAdded} />}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function PhishingSim({ onComplete, onSkip }: SimProps) {
  const sites = [
    { url: 'app.uniswap.org',    isReal: true,  clue: 'Official domain. Bookmark it — never Google it.' },
    { url: 'app-uniswap.org',    isReal: false, clue: 'Hyphen trick — "app-uniswap" ≠ "app.uniswap". Classic phishing.' },
    { url: 'uniswap.exchange',   isReal: false, clue: 'Wrong TLD. Real Uniswap is .org — never .exchange.' },
    { url: 'metamask.io',        isReal: true,  clue: 'MetaMask\'s real domain. No hyphens, no alternate TLDs.' },
    { url: 'metamask-io.com',    isReal: false, clue: 'Hyphen + .com. MetaMask is always metamask.io — no exceptions.' },
    { url: 'opensea.io',         isReal: true,  clue: 'OpenSea\'s real domain. Fakes use opensea.com or open-sea.io.' },
  ];
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = sites.filter((site, i) => answers[i] === site.isReal).length;
  const passed = score >= 5;
  return (
    <SimShell icon="🎣" title="Real or Phishing Site?" subtitle="Spot which URLs are real crypto sites and which are traps.">
      {sites.map((site, i) => {
        const chosen = answers[i]; const isCorrect = chosen === site.isReal;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: FontSize.md, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md }}>{site.url}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {([{ v: true, l: '✅ REAL' }, { v: false, l: '⚠️ FAKE' }] as const).map(({ v, l }) => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCorrect)            { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCorrect)           { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && v === site.isReal)   { bg = '#d1fae5'; border = Colors.green; }
                return <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>{l}</Text>
                </TouchableOpacity>;
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {site.clue}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < sites.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/6 — Strong phishing detection. Always bookmark official sites.` : `${score}/6 — Look for hyphens, wrong TLDs, subtle misspellings. Check the full URL.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function TokenApprovalsSim({ onComplete, onSkip }: SimProps) {
  const approvals = [
    { protocol: 'Uniswap v3', token: 'USDC', amount: 'Unlimited', age: '2 years ago',   risk: 'high',     action: 'Revoke — unlimited approval on old contract is unnecessary risk.' },
    { protocol: 'Aave v3',    token: 'WETH', amount: 'Unlimited', age: '3 months ago',  risk: 'medium',   action: 'Consider revoking — Aave is legit but unlimited is always risky.' },
    { protocol: 'Uniswap v3', token: 'USDT', amount: '100 USDT',  age: '1 week ago',    risk: 'low',      action: 'Keep — exact-amount, recently used, trusted protocol.' },
    { protocol: 'UnknownSwap',token: 'DAI',  amount: 'Unlimited', age: '1 year ago',    risk: 'critical', action: 'Revoke immediately — unknown protocol with unlimited DAI access.' },
  ];
  const [revoked, setRevoked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const MUST_REVOKE = [0, 3];
  const passed = MUST_REVOKE.every(i => revoked.has(i)) && !revoked.has(2);
  const riskColor = { low: Colors.green, medium: '#f59e0b', high: Colors.red, critical: '#7f1d1d' };
  const riskBg    = { low: '#d1fae5',   medium: '#fef3c7', high: '#fee2e2', critical: '#fee2e2' };
  return (
    <SimShell icon="🔑" title="Token Approval Audit" subtitle="Review active approvals. Revoke the dangerous ones — keep the safe ones.">
      <Text style={s.hint2}>Old unlimited approvals are a major attack vector. If a protocol gets hacked, attackers can drain any wallet with an active unlimited approval.</Text>
      {approvals.map((ap, i) => {
        const isRevoked = revoked.has(i);
        const r = ap.risk as keyof typeof riskColor;
        return (
          <Card key={i} style={{ borderColor: isRevoked ? Colors.border : riskColor[r] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '900', color: Colors.text }}>{ap.protocol}</Text>
                <Text style={s.hint2}>{ap.token} · {ap.amount} · {ap.age}</Text>
              </View>
              <View style={{ paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: riskBg[r] }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: riskColor[r], textTransform: 'uppercase' }}>{ap.risk}</Text>
              </View>
            </View>
            {!checked && <TouchableOpacity onPress={() => setRevoked(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}
              style={{ marginTop: Spacing.md, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, borderColor: isRevoked ? Colors.green : Colors.red, backgroundColor: isRevoked ? '#d1fae5' : '#fee2e2', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: isRevoked ? Colors.green : Colors.red }}>{isRevoked ? '✓ Revoked' : 'Tap to Revoke'}</Text>
            </TouchableOpacity>}
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {ap.action}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit Audit →" onPress={() => setChecked(true)} />
        : <><ResultBox correct={passed} message={passed ? 'Correct! Revoke unlimited approvals from unknown/old protocols. Keep exact-amount approvals from active trusted protocols.' : 'Not quite — the UnknownSwap unlimited approval and the old Uniswap one must go. The exact 100 USDT approval is safe.'} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setRevoked(new Set()); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function FakeTokensSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    { name: 'USDC',             holders: '350,000+',  volume: '$4.5B/day',  verified: true,  scam: false, flag: '' },
    { name: 'USDC (duplicate)', holders: '3',          volume: '$240',       verified: false, scam: true,  flag: 'Same name, different contract. Last 4 chars of address differ from real USDC.' },
    { name: 'UNI (Uniswap)',    holders: '300,000+',  volume: '$45M/day',   verified: true,  scam: false, flag: '' },
    { name: 'FREE AIRDROP ✓',  holders: '2',          volume: '$0',         verified: false, scam: true,  flag: 'Airdropped to your wallet uninvited. Claiming it calls a drain contract.' },
  ];
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = tokens.filter((t, i) => answers[i] === t.scam).length;
  const passed = score >= 3;
  return (
    <SimShell icon="⚠️" title="Real Token or Scam?" subtitle="Your wallet shows these tokens. Identify the dangerous ones.">
      {tokens.map((t, i) => {
        const chosen = answers[i]; const isCorrect = chosen === t.scam;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Text style={{ fontWeight: '900', color: Colors.text, flex: 1 }}>{t.name}</Text>
              {t.verified && <View style={{ backgroundColor: '#d1fae5', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 }}><Text style={{ fontSize: 10, fontWeight: '800', color: Colors.green }}>VERIFIED</Text></View>}
            </View>
            <Text style={s.hint2}>Holders: {t.holders} · Volume: {t.volume}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              {([{ v: false, l: '✅ SAFE' }, { v: true, l: '🚫 SCAM' }] as const).map(({ v, l }) => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCorrect)          { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCorrect)         { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && v === t.scam)      { bg = '#d1fae5'; border = Colors.green; }
                return <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: FontSize.sm }}>{l}</Text>
                </TouchableOpacity>;
              })}
            </View>
            {checked && t.flag && <Text style={{ fontSize: FontSize.xs, color: Colors.red, marginTop: Spacing.sm, lineHeight: 16, fontWeight: '700' }}>🚩 {t.flag}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/4 — Never interact with unrecognised tokens. Always verify contract address on Etherscan.` : `${score}/4 — Scammers copy token names exactly. Volume and verified status are key signals.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 4 — DeFi Universe
// ─────────────────────────────────────────────────────────────────────────────

function UniswapSim({ onComplete, onSkip }: SimProps) {
  const [amount, setAmount] = useState('0.5');
  const [slippage, setSlippage] = useState('0.5');
  const [confirmed, setConfirmed] = useState(false);
  const ETH_PRICE = 3247;
  const amtF = parseFloat(amount) || 0;
  const received = amtF * ETH_PRICE;
  const priceImpact = amtF > 10 ? 2.1 : amtF > 1 ? 0.5 : 0.1;
  const minReceived = received * (1 - parseFloat(slippage) / 100);
  return (
    <SimShell icon="🦄" title="Swap on Uniswap" subtitle="Execute an AMM swap — understand price impact and slippage before confirming.">
      {!confirmed ? (<>
        <Card>
          <Text style={s.fieldLabel}>SELL (ETH)</Text>
          <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textSoft} />
          <Text style={s.fieldLabel}>BUY (USDC)</Text>
          <View style={{ padding: Spacing.md, backgroundColor: '#f9fafb', borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '900', fontSize: FontSize.xl, color: Colors.green }}>{received.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
            <Text style={{ fontWeight: '900', color: Colors.text }}>USDC</Text>
          </View>
        </Card>
        <Card>
          <Text style={s.fieldLabel}>SLIPPAGE TOLERANCE</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {['0.1','0.5','1.0','3.0'].map(v => (
              <TouchableOpacity key={v} onPress={() => setSlippage(v)}
                style={[{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center', borderColor: slippage === v ? Colors.accent : Colors.border, backgroundColor: slippage === v ? Colors.accentSoft : Colors.card }]}>
                <Text style={{ fontWeight: '800', fontSize: FontSize.sm, color: slippage === v ? Colors.accent : Colors.text }}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>
          {parseFloat(slippage) >= 3 && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginTop: 4 }}>⚠️ High slippage — MEV bots may sandwich this trade</Text>}
        </Card>
        <Card>
          <Text style={s.fieldLabel}>SWAP DETAILS</Text>
          <View style={s.row}><Text style={s.rowKey}>Rate</Text><Text style={s.rowVal}>1 ETH = ${ETH_PRICE.toLocaleString()} USDC</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Price impact</Text><Text style={[s.rowVal, { color: priceImpact > 1 ? Colors.red : '#f59e0b' }]}>{priceImpact.toFixed(1)}%</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Min. received</Text><Text style={s.rowVal}>${minReceived.toFixed(2)} USDC</Text></View>
          <View style={s.row}><Text style={s.rowKey}>LP fee (0.3%)</Text><Text style={s.rowVal}>{(amtF * 0.003).toFixed(5)} ETH</Text></View>
        </Card>
        <PrimaryBtn label="Swap →" onPress={() => setConfirmed(true)} disabled={!amount || amtF <= 0} />
      </>) : (<>
        <ResultBox correct message={`Swapped ${amount} ETH for ~${received.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC. The AMM priced it from the pool's ETH/USDC ratio.`} />
        <Card>
          <Text style={s.fieldLabel}>HOW THE AMM PRICED YOUR SWAP</Text>
          <Text style={s.bullet}>• Uniswap holds a pool of ETH + USDC</Text>
          <Text style={s.bullet}>• Formula: x × y = k (constant product)</Text>
          <Text style={s.bullet}>• Your trade shifts the ratio → price moves against you</Text>
          <Text style={s.bullet}>• Larger trades = more price impact = worse effective rate</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function SlippageSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    { trade: 'Swapping $50 USDC → ETH on Uniswap (deep pool)', answer: '0.5', reason: 'Small trade, deep pool — 0.5% is standard. No MEV risk at this size.' },
    { trade: 'Swapping $50,000 USDC → new memecoin (thin pool)', answer: '5.0', reason: 'Thin liquidity means high price impact. High slippage needed or split the trade.' },
    { trade: 'Swapping $2,000 USDC → WBTC (need best price)', answer: '0.1', reason: 'Mid-size trade, set tight slippage + use MEV Blocker to avoid sandwich attacks.' },
  ];
  const opts = ['0.1','0.5','1.0','3.0','5.0'];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((sc, i) => answers[i] === sc.answer).length;
  const passed = score >= 2;
  return (
    <SimShell icon="📉" title="Set the Right Slippage" subtitle="Choose the correct slippage tolerance for each scenario.">
      {scenarios.map((sc, i) => (
        <Card key={i} style={{ borderColor: checked ? (answers[i] === sc.answer ? Colors.green : Colors.red) : Colors.border }}>
          <Text style={{ fontWeight: '700', color: Colors.text, fontSize: FontSize.md, lineHeight: 20, marginBottom: Spacing.md }}>{sc.trade}</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
            {opts.map(opt => {
              const isCh = answers[i] === opt; const isCo = opt === sc.answer;
              let bg = Colors.card, border = Colors.border;
              if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
              if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
              if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
              return <TouchableOpacity key={opt} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: opt }))}
                style={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border }}>
                <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: Colors.text }}>{opt}%</Text>
              </TouchableOpacity>;
            })}
          </View>
          {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {sc.reason}</Text>}
        </Card>
      ))}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/3 — Good slippage instincts. Tight slippage + MEV Blocker = best practice for large trades.` : `${score}/3 — Too low fails. Too high gets sandwiched. Balance for pool depth.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function ImpermanentLossSim({ onComplete, onSkip }: SimProps) {
  const [priceChange, setPriceChange] = useState(2);
  const k = 1 * 3000;
  const newETH = Math.sqrt(k / (3000 * priceChange));
  const newUSDC = k / newETH;
  const poolValue = newETH * (3000 * priceChange) + newUSDC;
  const hodlValue = 1 * (3000 * priceChange) + 3000;
  const ilPct = ((poolValue - hodlValue) / hodlValue * 100).toFixed(1);
  const ilAbs = Math.abs(hodlValue - poolValue).toFixed(0);
  return (
    <SimShell icon="📊" title="Impermanent Loss Calculator" subtitle="See how IL grows as ETH price moves — before you add liquidity.">
      <Card>
        <Text style={s.fieldLabel}>INITIAL DEPOSIT</Text>
        <View style={s.row}><Text style={s.rowKey}>ETH deposited</Text><Text style={s.rowVal}>1 ETH @ $3,000</Text></View>
        <View style={s.row}><Text style={s.rowKey}>USDC deposited</Text><Text style={s.rowVal}>3,000 USDC</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Total value</Text><Text style={s.rowVal}>$6,000</Text></View>
      </Card>
      <Card>
        <Text style={s.fieldLabel}>ETH PRICE NOW (× INITIAL)</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {[0.5, 1, 1.5, 2, 3, 5].map(mult => (
            <TouchableOpacity key={mult} onPress={() => setPriceChange(mult)}
              style={[{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: priceChange === mult ? Colors.accent : Colors.border, backgroundColor: priceChange === mult ? Colors.accentSoft : Colors.card }]}>
              <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: priceChange === mult ? Colors.accent : Colors.textSoft }}>{mult}× ${(3000 * mult).toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      <Card>
        <View style={s.row}><Text style={s.rowKey}>If you HODLED</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>${hodlValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text></View>
        <View style={s.row}><Text style={s.rowKey}>As LP provider</Text><Text style={s.rowVal}>${poolValue.toFixed(0)}</Text></View>
        <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm }]}>
          <Text style={s.rowKey}>Impermanent loss</Text>
          <Text style={[s.rowVal, { color: parseFloat(ilPct) < 0 ? Colors.red : Colors.green, fontWeight: '900' }]}>{ilPct}% (${ilAbs})</Text>
        </View>
        {priceChange === 1 && <Text style={{ color: Colors.green, fontSize: FontSize.xs, marginTop: 4 }}>No price change = no IL. Fee income is pure profit here.</Text>}
        {priceChange !== 1 && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginTop: 4 }}>The further price moves, the worse the IL. Trading fees must cover this to make LP profitable.</Text>}
      </Card>
      <PrimaryBtn label="Continue →" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function LiquidationSim({ onComplete, onSkip }: SimProps) {
  const [collateral, setCollateral] = useState('1');
  const [borrowed, setBorrowed] = useState('1500');
  const ETH_PRICE = 3000; const LIQ_THRESHOLD = 0.80;
  const col = parseFloat(collateral) || 0;
  const bor = parseFloat(borrowed) || 0;
  const colUsd = col * ETH_PRICE;
  const liquidationPrice = bor / (col * LIQ_THRESHOLD);
  const healthFactor = colUsd * LIQ_THRESHOLD / bor;
  const isRekt = healthFactor < 1.0; const isDanger = healthFactor >= 1.0 && healthFactor < 1.2;
  const hfColor = isRekt ? Colors.red : isDanger ? '#f59e0b' : Colors.green;
  return (
    <SimShell icon="⚠️" title="Liquidation Risk Calculator" subtitle="Set collateral and loan. See exactly at what ETH price you get liquidated.">
      <Card>
        <Text style={s.fieldLabel}>COLLATERAL (ETH @ $3,000)</Text>
        <TextInput style={s.input} value={collateral} onChangeText={setCollateral} keyboardType="decimal-pad" placeholderTextColor={Colors.textSoft} />
        <Text style={s.fieldLabel}>BORROWED (USDC)</Text>
        <TextInput style={s.input} value={borrowed} onChangeText={setBorrowed} keyboardType="decimal-pad" placeholderTextColor={Colors.textSoft} />
      </Card>
      <Card>
        <View style={s.row}><Text style={s.rowKey}>Collateral value</Text><Text style={s.rowVal}>${colUsd.toLocaleString()}</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Health Factor</Text><Text style={[s.rowVal, { color: hfColor, fontWeight: '900' }]}>{healthFactor.toFixed(2)} {isRekt ? '💀 LIQUIDATED' : isDanger ? '⚠️ DANGER' : '✅ HEALTHY'}</Text></View>
        <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm }]}>
          <Text style={s.rowKey}>Liquidation triggers at ETH</Text>
          <Text style={[s.rowVal, { color: Colors.red, fontWeight: '900' }]}>${liquidationPrice.toFixed(0)}</Text>
        </View>
      </Card>
      <Card style={{ borderColor: hfColor }}>
        <Text style={[s.fieldLabel, { color: hfColor }]}>WHAT HAPPENS AT ${liquidationPrice.toFixed(0)}</Text>
        <Text style={s.hint2}>{isRekt ? 'Your position is liquidated. A bot repays your debt, takes a 5–10% bonus, and you lose your collateral.' : `If ETH drops to $${liquidationPrice.toFixed(0)}, a liquidator closes your position. Keep health factor above 1.5 as your buffer.`}</Text>
      </Card>
      <PrimaryBtn label="Continue →" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 9 — Memecoin Markets
// ─────────────────────────────────────────────────────────────────────────────

function DexscreenerSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    { name:'PEPE2', age:'2h', mcap:'$142K', fdv:'$1.4M', vol:'$89K', buys:47, sells:82, liq:'$12K', lpLocked:false, mintRevoked:true, verdict:'DANGER', reasons:['More sells than buys (bearish pressure)','LP unlocked — can rug at any time','FDV is 10× market cap (90% tokens not circulating)'] },
    { name:'WOJAK', age:'3d', mcap:'$3.1M', fdv:'$3.1M', vol:'$450K', buys:312, sells:201, liq:'$280K', lpLocked:true, mintRevoked:true, verdict:'NEUTRAL', reasons:['Healthy buy/sell ratio ✓','LP locked ✓','FDV = MC (all tokens circulating) ✓','Still new — watch volume consistency'] },
    { name:'DRAGON', age:'45m', mcap:'$89K', fdv:'$890K', vol:'$1.2M', buys:8, sells:3, liq:'$3K', lpLocked:false, mintRevoked:false, verdict:'DANGER', reasons:['Volume 400× liquidity — almost certainly wash trading','Only 11 total trades — no real market','Mint authority active — devs can print infinite tokens'] },
  ];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = tokens.filter((t, i) => answers[i] === t.verdict).length;
  const passed = score >= 2;
  return (
    <SimShell icon="📊" title="Read DEXScreener" subtitle="Analyse three tokens. Classify each as SAFE, NEUTRAL, or DANGER.">
      {tokens.map((t, i) => {
        const chosen = answers[i]; const isCorrect = chosen === t.verdict;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: Spacing.sm }}>{t.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
              {[['Age', t.age], ['MC', t.mcap], ['FDV', t.fdv], ['Vol', t.vol], ['Liq', t.liq], ['Buys', String(t.buys)], ['Sells', String(t.sells)]].map(([k, v]) => (
                <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
                </View>
              ))}
              <View style={{ backgroundColor: t.lpLocked ? '#d1fae5' : '#fee2e2', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: t.lpLocked ? Colors.green : Colors.red }}>LP {t.lpLocked ? 'Locked' : 'UNLOCKED'}</Text>
              </View>
              <View style={{ backgroundColor: t.mintRevoked ? '#d1fae5' : '#fee2e2', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: t.mintRevoked ? Colors.green : Colors.red }}>Mint {t.mintRevoked ? 'Revoked' : 'ACTIVE'}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['SAFE','NEUTRAL','DANGER'].map(v => {
                const isCh = chosen === v; const isCo = v === t.verdict;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo) { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo) { bg = '#d1fae5'; border = Colors.green; }
                return <TouchableOpacity key={v} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: 11, color: Colors.text }}>{v}</Text>
                </TouchableOpacity>;
              })}
            </View>
            {checked && t.reasons.map((r, ri) => <Text key={ri} style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: ri === 0 ? Spacing.sm : 2, lineHeight: 16 }}>• {r}</Text>)}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/3 — You can read DEXScreener. Apply this before every memecoin entry.` : `${score}/3 — LP lock and mint authority are non-negotiable checks. Volume/liquidity ratio matters.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 10 — Airdrop Archipelago
// ─────────────────────────────────────────────────────────────────────────────

function AirdropFarmSim({ onComplete, onSkip }: SimProps) {
  const tasks = [
    { id: 'bridge',     label: 'Bridge ETH to the new L2',             points: 25,  sybil: false, tip: 'Bridge activity is the #1 airdrop signal. Use varied amounts, not round numbers.' },
    { id: 'swap',       label: 'Swap tokens on the native DEX',         points: 20,  sybil: false, tip: 'DEX volume is tracked. Swap real amounts — $5 swaps are flagged as farming.' },
    { id: 'lp',         label: 'Provide liquidity (even $100)',          points: 30,  sybil: false, tip: 'LP provision shows genuine commitment — highest weight in most airdrop formulas.' },
    { id: 'governance', label: 'Vote on a governance proposal',          points: 15,  sybil: false, tip: 'On-chain governance participation is a strong genuine-user signal.' },
    { id: 'nft',        label: 'Mint the protocol\'s early badge NFT',  points: 20,  sybil: false, tip: 'NFT holders often receive bonus airdrop allocation.' },
    { id: 'multiWallet',label: 'Repeat everything from 10 wallets',     points: -50, sybil: true,  tip: 'Sybil detection catches this via graph analysis — ALL wallets get zero allocation.' },
  ];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const toggle = (id: string) => !submitted && setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const score = [...selected].reduce((acc, id) => acc + (tasks.find(t => t.id === id)?.points || 0), 0);
  const pickedSybil = selected.has('multiWallet');
  const passed = score >= 50 && !pickedSybil;
  return (
    <SimShell icon="🪂" title="Build an Airdrop Strategy" subtitle="Choose your farming activities. Avoid sybil behaviour — it gets every wallet banned.">
      <Text style={s.hint2}>You have 1 wallet and $500. Choose your activities for a new L2 that hints at an upcoming airdrop.</Text>
      {tasks.map(task => {
        const isSel = selected.has(task.id);
        return (
          <TouchableOpacity key={task.id} onPress={() => toggle(task.id)}
            style={{ padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2, borderColor: isSel ? (task.sybil ? Colors.red : Colors.green) : Colors.border, backgroundColor: isSel ? (task.sybil ? '#fee2e2' : '#d1fae5') : Colors.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: Colors.text, fontSize: FontSize.sm }}>{task.label}</Text>
                {submitted && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2, lineHeight: 16 }}>💡 {task.tip}</Text>}
              </View>
              <Text style={{ fontWeight: '900', color: task.points > 0 ? Colors.green : Colors.red, fontSize: FontSize.md }}>{task.points > 0 ? '+' : ''}{task.points}</Text>
              <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: isSel ? (task.sybil ? Colors.red : Colors.green) : Colors.border, backgroundColor: isSel ? (task.sybil ? '#fee2e2' : '#d1fae5') : 'transparent' }}>
                {isSel && <Text style={{ color: task.sybil ? Colors.red : Colors.green, fontWeight: '900', fontSize: 12 }}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      {!submitted
        ? <PrimaryBtn label={`Submit Strategy (${score} pts) →`} onPress={() => setSubmitted(true)} disabled={selected.size === 0} />
        : <><ResultBox correct={passed} message={passed ? `${score} points — Legitimate farming. Real activity over time is always the safest approach.` : pickedSybil ? 'BANNED! Multi-wallet sybil farming is detected by graph analysis. All wallets score zero.' : `${score} points — Need more genuine activity. Focus on bridge + swap + LP.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setSelected(new Set()); setSubmitted(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function P2PTradeSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0|1|2|3>(0);
  const [paymentSent, setPaymentSent] = useState(false);
  return (
    <SimShell icon="🤝" title="P2P Trade Walkthrough" subtitle="Buy crypto directly from another person — understand escrow and the #1 scam.">
      {step === 0 && <Card><Text style={s.hint2}>P2P trading lets you buy crypto directly from people. The exchange holds crypto in escrow until payment is confirmed — protecting both sides.</Text><View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}><Text style={{ color: '#92400e', fontWeight: '700', fontSize: FontSize.sm }}>⚠️ The #1 scam: releasing escrow before your bank confirms funds received.</Text></View></Card>}
      {step === 1 && <Card>
        <Text style={s.fieldLabel}>YOUR ORDER</Text>
        <View style={s.row}><Text style={s.rowKey}>Buying</Text><Text style={[s.rowVal, { fontWeight: '900', color: Colors.text }]}>$500 USDT</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Rate</Text><Text style={s.rowVal}>$1.001 per USDT</Text></View>
        <View style={s.row}><Text style={s.rowKey}>You pay</Text><Text style={[s.rowVal, { color: Colors.red }]}>$500.50 via bank transfer</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Escrow status</Text><Text style={[s.rowVal, { color: Colors.green }]}>✓ LOCKED by Binance</Text></View>
        <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
          <Text style={{ fontWeight: '700', color: Colors.green, fontSize: FontSize.sm }}>The seller's USDT is locked. They cannot run away with it.</Text>
        </View>
      </Card>}
      {step === 2 && <Card>
        <Text style={s.fieldLabel}>PAYMENT STEP</Text>
        <Text style={s.hint2}>Transfer £500.50 to the seller's bank. Mark as paid — starts a 15-min timer for seller to confirm receipt.</Text>
        <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fee2e2', borderRadius: Radius.md }}>
          <Text style={{ color: Colors.red, fontWeight: '800', fontSize: FontSize.sm }}>🚨 SCAM: "Can you release escrow early? I've sent it" → NEVER. Wait for your bank to confirm.</Text>
        </View>
        <TouchableOpacity onPress={() => setPaymentSent(true)} style={{ marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: paymentSent ? '#d1fae5' : Colors.accent, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>{paymentSent ? '✓ Marked as Paid' : 'Mark Payment as Sent'}</Text>
        </TouchableOpacity>
      </Card>}
      {step === 3 && (<>
        <ResultBox correct message="Trade complete! Seller confirmed receipt. Escrow released — USDT now in your wallet." />
        <Card>
          <Text style={s.fieldLabel}>P2P SAFETY RULES</Text>
          <Text style={s.bullet}>• Never release escrow before bank confirms — ever</Text>
          <Text style={s.bullet}>• Only trade with 100+ feedback, 98%+ completion rate</Text>
          <Text style={s.bullet}>• Use platform chat only — never WhatsApp/Telegram</Text>
          <Text style={s.bullet}>• Something feels off? Open a dispute immediately</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      {step < 3 && <PrimaryBtn label={['How P2P Works →', 'See the Order →', 'I\'ve Sent Payment →', ''][step]} onPress={() => setStep((step + 1) as any)} disabled={step === 2 && !paymentSent} />}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 18 — Advanced Crypto
// ─────────────────────────────────────────────────────────────────────────────

function EnsSim({ onComplete, onSkip }: SimProps) {
  const [ensName, setEnsName] = useState('');
  const [step, setStep] = useState<'search'|'register'|'done'>('search');
  const [available, setAvailable] = useState<boolean|null>(null);
  const TAKEN = ['vitalik','punk','satoshi','ethereum','crypto','bitcoin'];
  const check = () => { const clean = ensName.toLowerCase().replace(/\.eth$/, ''); setAvailable(!TAKEN.includes(clean) && clean.length >= 3); };
  const fullName = ensName.includes('.') ? ensName : ensName + '.eth';
  return (
    <SimShell icon="🌐" title="Register an ENS Name" subtitle="Claim a .eth domain — your permanent Web3 identity.">
      {step === 'search' && (<>
        <Card>
          <Text style={s.fieldLabel}>SEARCH FOR A .ETH NAME</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={ensName} onChangeText={v => { setEnsName(v); setAvailable(null); }} placeholder="yourname.eth" placeholderTextColor={Colors.textSoft} autoCapitalize="none" />
            <TouchableOpacity onPress={check} style={{ padding: Spacing.md, backgroundColor: Colors.accent, borderRadius: Radius.md, justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Search</Text>
            </TouchableOpacity>
          </View>
          {available === true  && <Text style={{ color: Colors.green, fontWeight: '800', marginTop: Spacing.sm }}>✅ Available — ~$5/year to register</Text>}
          {available === false && <Text style={{ color: Colors.red, fontWeight: '800', marginTop: Spacing.sm }}>❌ Taken. Try another name.</Text>}
        </Card>
        <Card>
          <Text style={s.fieldLabel}>WHAT ENS GIVES YOU</Text>
          <Text style={s.bullet}>• yourname.eth replaces 0x1a2b…3c4d everywhere</Text>
          <Text style={s.bullet}>• Works in MetaMask, Rainbow, Coinbase Wallet</Text>
          <Text style={s.bullet}>• Can point to website, Twitter, email — all on-chain</Text>
          <Text style={s.bullet}>• It's an NFT — you can sell it on OpenSea</Text>
        </Card>
        <PrimaryBtn label="Register This Name →" onPress={() => setStep('register')} disabled={available !== true} />
      </>)}
      {step === 'register' && (<>
        <Card>
          <Text style={s.fieldLabel}>REGISTRATION DETAILS</Text>
          <View style={s.row}><Text style={s.rowKey}>Name</Text><Text style={[s.rowVal, { fontWeight: '900', color: Colors.accent }]}>{fullName}</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Annual fee</Text><Text style={s.rowVal}>~$5/year</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Gas (one-time)</Text><Text style={s.rowVal}>~$3–8 on mainnet</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Points to</Text><Text style={s.rowVal}>Your wallet address</Text></View>
          <Text style={{ color: '#f59e0b', fontSize: FontSize.xs, marginTop: Spacing.sm, lineHeight: 16 }}>⚠️ Registration is 2 steps: commit first (prevents front-running), then register after 1 min.</Text>
        </Card>
        <PrimaryBtn label="✓ Register & Set as Primary" onPress={() => setStep('done')} />
      </>)}
      {step === 'done' && (<>
        <ResultBox correct message={`${fullName} registered! Anyone can now send ETH directly to this name — no hex address needed.`} />
        <Card>
          <Text style={s.fieldLabel}>NEXT STEPS</Text>
          <Text style={s.bullet}>• Set it as your Primary Name in the ENS app</Text>
          <Text style={s.bullet}>• Add avatar, bio, and social links via Records</Text>
          <Text style={s.bullet}>• Use it on Farcaster, Lens, and across Web3 dApps</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function DaoVoteSim({ onComplete, onSkip }: SimProps) {
  const proposals = [
    { id: 'UIP-42', title: 'Increase UNI staking yield from 4% to 6%', forPct: 62, againstPct: 28, abstainPct: 10, quorumMet: true, timeLeft: '2 days', impact: 'Costs ~$2M/year from treasury. Benefits token stakers.' },
    { id: 'UIP-43', title: 'Deploy Uniswap v3 to Abstract chain',       forPct: 78, againstPct: 15, abstainPct: 7,  quorumMet: true, timeLeft: '5 days', impact: 'Expands protocol reach to Abstract\'s growing gaming/NFT ecosystem.' },
  ];
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  return (
    <SimShell icon="🗳️" title="DAO Governance Vote" subtitle="Cast your votes as a UNI token holder. Token balance = voting power.">
      <Card>
        <Text style={s.fieldLabel}>YOUR VOTING POWER</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: Colors.accent }}>1,250 UNI</Text>
        <Text style={s.hint2}>Voting is free — it's an off-chain signature on Snapshot.</Text>
      </Card>
      {proposals.map(prop => (
        <Card key={prop.id}>
          <Text style={{ fontWeight: '900', color: Colors.text, lineHeight: 22, marginBottom: 4 }}>{prop.title}</Text>
          <Text style={s.hint2}>{prop.impact}</Text>
          <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 99, marginVertical: Spacing.sm, flexDirection: 'row', overflow: 'hidden' }}>
            <View style={{ width: `${prop.forPct}%`, backgroundColor: Colors.green }} />
            <View style={{ width: `${prop.abstainPct}%`, backgroundColor: '#d1d5db' }} />
            <View style={{ width: `${prop.againstPct}%`, backgroundColor: Colors.red }} />
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md }}>
            <Text style={{ fontSize: 10, color: Colors.green, fontWeight: '800' }}>FOR {prop.forPct}%</Text>
            <Text style={{ fontSize: 10, color: '#9ca3af', fontWeight: '800' }}>ABSTAIN {prop.abstainPct}%</Text>
            <Text style={{ fontSize: 10, color: Colors.red, fontWeight: '800' }}>AGAINST {prop.againstPct}%</Text>
          </View>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginBottom: Spacing.sm }}>⏱ {prop.timeLeft} remaining · Quorum: {prop.quorumMet ? '✅ Met' : '❌ Not met'}</Text>
          {!submitted && (
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {(['For', 'Against', 'Abstain'] as const).map(v => {
                const isSel = votes[prop.id] === v;
                const col = v === 'For' ? Colors.green : v === 'Against' ? Colors.red : '#9ca3af';
                return <TouchableOpacity key={v} onPress={() => setVotes(prev => ({ ...prev, [prop.id]: v }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, borderColor: isSel ? col : Colors.border, backgroundColor: isSel ? col + '20' : Colors.card, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800', fontSize: FontSize.sm, color: isSel ? col : Colors.text }}>{v}</Text>
                </TouchableOpacity>;
              })}
            </View>
          )}
          {submitted && votes[prop.id] && <View style={{ padding: Spacing.sm, backgroundColor: '#d1fae5', borderRadius: Radius.md }}><Text style={{ color: Colors.green, fontWeight: '700', fontSize: FontSize.sm }}>✓ Voted: {votes[prop.id]} with 1,250 UNI</Text></View>}
        </Card>
      ))}
      {!submitted
        ? <PrimaryBtn label="Submit Votes →" onPress={() => setSubmitted(true)} disabled={Object.keys(votes).length < proposals.length} />
        : <><ResultBox correct message="Votes cast! Token-weighted DAOs: 1 token = 1 vote. Large holders dominate — a known limitation of current governance systems." /><PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function OnchainAnalysisSim({ onComplete, onSkip }: SimProps) {
  const wallets = [
    { address: '0xd8dA…6045', trades: '142 (6mo)', pnl: '+$2.1M', winRate: '78%', avgHold: '4 days', tokens: ['PEPE at $2M MC', 'ARB before CEX listing', 'BLUR on day 1'], isSmartMoney: true },
    { address: '0xA1b2…F3c4', trades: '891 (6mo)', pnl: '-$89K',  winRate: '31%', avgHold: '2 hours', tokens: ['Random memecoins', 'FOMO buys at peak', 'Sold PEPE at $1M MC'], isSmartMoney: false },
  ];
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = wallets.filter((w, i) => answers[i] === w.isSmartMoney).length;
  return (
    <SimShell icon="🔍" title="Identify Smart Money" subtitle="Analyse on-chain data. Which wallet is worth following?">
      <Text style={s.hint2}>Smart money buys early, holds the right amount of time, and has a high win rate. These signals identify wallets worth tracking.</Text>
      {wallets.map((w, i) => {
        const chosen = answers[i]; const isCorrect = chosen === w.isSmartMoney;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={s.address}>{w.address}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
              {[[w.trades, null], [w.pnl, w.pnl.startsWith('+')], [`Win rate: ${w.winRate}`, parseFloat(w.winRate) > 60], [`Avg hold: ${w.avgHold}`, null]].map(([label, positive], li) => (
                <View key={li} style={{ backgroundColor: positive === true ? '#d1fae5' : positive === false ? '#fee2e2' : '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: positive === true ? Colors.green : positive === false ? Colors.red : Colors.text }}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={s.fieldLabel}>RECENT TOKEN ENTRIES</Text>
            {w.tokens.map((t, ti) => <Text key={ti} style={{ fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16 }}>• {t}</Text>)}
            {!checked && (
              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
                {([{ v: true, l: '🧠 Smart Money' }, { v: false, l: '📉 Average Wallet' }] as const).map(({ v, l }) => {
                  const isCh = chosen === v;
                  return <TouchableOpacity key={String(v)} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, borderColor: isCh ? Colors.accent : Colors.border, backgroundColor: isCh ? Colors.accentSoft : Colors.card, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm, color: isCh ? Colors.accent : Colors.text }}>{l}</Text>
                  </TouchableOpacity>;
                })}
              </View>
            )}
            {checked && <Text style={{ fontSize: FontSize.xs, fontWeight: '800', marginTop: Spacing.sm, color: w.isSmartMoney ? Colors.green : Colors.red }}>{w.isSmartMoney ? '✅ Smart money: early entry, high win rate, holds through volatility' : '❌ Reactive trading, negative PnL, chases peaks'}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < wallets.length} />
        : <><ResultBox correct={score === 2} message={score === 2 ? 'Correct! Track wallets like the first one via Nansen, DeBank, or Arkham. Follow their buys — you won\'t see sells in time.' : 'Review the signals: PnL, win rate, and early token entries are the key tells.'} />
          {score === 2 ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function ContractAuditSim({ onComplete, onSkip }: SimProps) {
  const findings = [
    { id: 'reentrancy', title: 'Reentrancy Vulnerability',  code: 'withdraw() calls external before updating balance', impact: 'Attacker drains entire pool repeatedly in one tx', severity: 'CRITICAL', fix: 'Update state before external calls (Checks-Effects-Interactions)' },
    { id: 'overflow',   title: 'Integer Overflow',          code: 'uint8 counter; counter += 1; // wraps at 255',        impact: 'Counter silently resets to 0 — logic breaks',           severity: 'HIGH',     fix: 'Solidity 0.8+ reverts on overflow automatically' },
    { id: 'access',     title: 'Missing Access Control',    code: 'function setFee(uint _fee) public { fee = _fee; }',   impact: 'Anyone can set protocol fee to 100%',                  severity: 'MEDIUM',   fix: 'Add onlyOwner modifier' },
    { id: 'gas',        title: 'Gas Optimisation',          code: 'for(uint i=0; i<array.length; i++) { ... }',          impact: 'array.length read every iteration — wastes gas',        severity: 'LOW',      fix: 'Cache array.length before the loop' },
  ];
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const correct = { reentrancy: 'CRITICAL', overflow: 'HIGH', access: 'MEDIUM', gas: 'LOW' };
  const score = Object.entries(ratings).filter(([id, r]) => r === correct[id as keyof typeof correct]).length;
  const passed = score >= 3;
  const sevColor: Record<string,string> = { CRITICAL: '#7f1d1d', HIGH: Colors.red, MEDIUM: '#92400e', LOW: '#1d4ed8' };
  const sevBg:    Record<string,string> = { CRITICAL: '#fee2e2', HIGH: '#fee2e2', MEDIUM: '#fef3c7', LOW: '#dbeafe' };
  return (
    <SimShell icon="🔎" title="Smart Contract Audit" subtitle="Rate the severity of each vulnerability — like a real auditor.">
      {findings.map(f => {
        const chosen = ratings[f.id]; const isCo = chosen === f.severity;
        return (
          <Card key={f.id} style={{ borderColor: checked ? (isCo ? Colors.green : Colors.red) : Colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              {checked && <View style={{ paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, backgroundColor: sevBg[f.severity] }}><Text style={{ fontSize: 10, fontWeight: '900', color: sevColor[f.severity] }}>{f.severity}</Text></View>}
              <Text style={{ fontWeight: '900', color: Colors.text, flex: 1 }}>{f.title}</Text>
            </View>
            <Text style={s.address}>{f.code}</Text>
            <Text style={[s.hint2, { marginBottom: Spacing.md }]}>Impact: {f.impact}</Text>
            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
              {['CRITICAL','HIGH','MEDIUM','LOW'].map(v => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (isCh) { bg = sevBg[v]; border = sevColor[v]; }
                if (checked && !isCh && v === f.severity) { bg = sevBg[v]; border = sevColor[v]; }
                return <TouchableOpacity key={v} disabled={checked} onPress={() => setRatings(r => ({ ...r, [f.id]: v }))}
                  style={{ paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: (isCh || (checked && v === f.severity)) ? sevColor[v] : Colors.text }}>{v}</Text>
                </TouchableOpacity>;
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>🔧 {f.fix}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit Audit →" onPress={() => setChecked(true)} disabled={Object.keys(ratings).length < findings.length} />
        : <><ResultBox correct={passed} message={passed ? `${score}/4 — Strong auditor instincts. Reentrancy + access control are the most exploited DeFi vulnerabilities.` : `${score}/4 — Critical = funds at risk, High = logic breaks, Medium = privilege issues, Low = optimisation.`} />
          {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setRatings({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function TokenomicsSim({ onComplete, onSkip }: SimProps) {
  const [teamPct, setTeamPct]   = useState('15');
  const [pubPct, setPubPct]     = useState('40');
  const [vestMonths, setVest]   = useState('12');
  const [submitted, setSubmitted] = useState(false);
  const team = parseFloat(teamPct) || 0; const pub = parseFloat(pubPct) || 0; const vest = parseInt(vestMonths) || 0;
  const ecosystem = 100 - team - pub;
  const issues: string[] = [];
  if (team > 20)  issues.push('⚠️ Team >20% — raises dump risk concern');
  if (pub < 30)   issues.push('⚠️ Public <30% — insider-heavy distribution');
  if (vest < 12)  issues.push('🚨 Vesting <12 months — team can dump quickly');
  if (team + pub > 100) issues.push('🚨 Allocations exceed 100%');
  const isHealthy = issues.length === 0 && team + pub <= 100;
  return (
    <SimShell icon="📐" title="Design a Token Distribution" subtitle="Set allocations and vesting. See if your tokenomics are investor-grade.">
      <Card>
        <Text style={s.fieldLabel}>TEAM ALLOCATION (%)</Text>
        <TextInput style={s.input} value={teamPct} onChangeText={setTeamPct} keyboardType="decimal-pad" placeholderTextColor={Colors.textSoft} />
        <Text style={s.fieldLabel}>PUBLIC SALE / COMMUNITY (%)</Text>
        <TextInput style={s.input} value={pubPct} onChangeText={setPubPct} keyboardType="decimal-pad" placeholderTextColor={Colors.textSoft} />
        <Text style={s.fieldLabel}>ECOSYSTEM / TREASURY (%)</Text>
        <View style={{ padding: Spacing.md, backgroundColor: '#f9fafb', borderRadius: Radius.md, marginBottom: Spacing.md }}>
          <Text style={{ fontWeight: '900', color: Colors.text }}>{Math.max(0, ecosystem).toFixed(0)}% (auto-calculated)</Text>
        </View>
        <Text style={s.fieldLabel}>TEAM VESTING PERIOD (MONTHS)</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {['6','12','24','48'].map(v => (
            <TouchableOpacity key={v} onPress={() => setVest(v)}
              style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center', borderColor: vestMonths === v ? Colors.accent : Colors.border, backgroundColor: vestMonths === v ? Colors.accentSoft : Colors.card }}>
              <Text style={{ fontWeight: '800', fontSize: FontSize.sm, color: vestMonths === v ? Colors.accent : Colors.text }}>{v}mo</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      {!submitted ? (
        <PrimaryBtn label="Analyse Tokenomics →" onPress={() => setSubmitted(true)} disabled={team + pub > 100} />
      ) : (<>
        <Card style={{ borderColor: isHealthy ? Colors.green : Colors.red }}>
          <Text style={[s.fieldLabel, { color: isHealthy ? Colors.green : Colors.red }]}>{isHealthy ? '✅ INVESTOR-GRADE' : '⚠️ ISSUES FOUND'}</Text>
          <View style={s.row}><Text style={s.rowKey}>Team</Text><Text style={s.rowVal}>{teamPct}% · {vestMonths}mo vesting</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Public</Text><Text style={s.rowVal}>{pubPct}%</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Ecosystem</Text><Text style={s.rowVal}>{Math.max(0,ecosystem).toFixed(0)}%</Text></View>
          {issues.map((iss, i) => <Text key={i} style={{ fontSize: FontSize.sm, color: Colors.red, marginTop: Spacing.sm, fontWeight: '700' }}>{iss}</Text>)}
          {isHealthy && <Text style={{ fontSize: FontSize.sm, color: Colors.green, marginTop: Spacing.sm, fontWeight: '700' }}>Allocation looks balanced. 12+ month vesting signals long-term commitment.</Text>}
        </Card>
        <Card>
          <Text style={s.fieldLabel}>INDUSTRY BENCHMARKS</Text>
          <Text style={s.bullet}>• Team: 10–20% with 12–48mo vesting + cliff</Text>
          <Text style={s.bullet}>• Public/community: 30–50%</Text>
          <Text style={s.bullet}>• Ecosystem/treasury: 20–40%</Text>
          <Text style={s.bullet}>• VCs see &gt;20% team as a yellow flag</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
      </>)}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// =============================================================================
// NEW SIMULATORS — BATCH 1: BITCOIN & ETHEREUM FUNDAMENTALS
// =============================================================================

// ── halving ───────────────────────────────────────────────────────────────────
function HalvingSim({ onComplete, onSkip }: SimProps) {
  const halvings = [
    { year: 2009, reward: 50,    era: 'Genesis', totalMined: '0%' },
    { year: 2012, reward: 25,    era: '1st Halving', totalMined: '25%' },
    { year: 2016, reward: 12.5,  era: '2nd Halving', totalMined: '50%' },
    { year: 2020, reward: 6.25,  era: '3rd Halving', totalMined: '75%' },
    { year: 2024, reward: 3.125, era: '4th Halving', totalMined: '94%' },
    { year: 2028, reward: 1.5625,era: '5th Halving', totalMined: '97%' },
  ];
  const [selected, setSelected] = useState(4);
  const [q1, setQ1] = useState('');
  const [checked, setChecked] = useState(false);
  const h = halvings[selected];
  const correct = '3.125';
  const isCorrect = q1.trim() === correct;

  return (
    <SimShell icon="✂️" title="Bitcoin Halving Explorer" subtitle="See how the supply schedule works — and why scarcity matters.">
      <Card>
        <Text style={s.fieldLabel}>SELECT HALVING ERA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {halvings.map((hv, i) => (
              <TouchableOpacity key={i} onPress={() => setSelected(i)}
                style={[chip.base, selected === i && chip.active]}>
                <Text style={[chip.text, selected === i && chip.activeText]}>{hv.year}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={{ marginTop: Spacing.md, gap: 4 }}>
          <View style={s.row}><Text style={s.rowKey}>Era</Text><Text style={[s.rowVal, { color: Colors.accent }]}>{h.era}</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Block reward</Text><Text style={[s.rowVal, { fontWeight: '900' }]}>{h.reward} BTC</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Supply mined so far</Text><Text style={s.rowVal}>{h.totalMined} of 21M</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Annual new BTC</Text><Text style={s.rowVal}>~{(h.reward * 52560).toLocaleString()} BTC</Text></View>
        </View>
        <View style={{ height: 12, backgroundColor: Colors.border, borderRadius: 99, marginTop: Spacing.md, overflow: 'hidden' }}>
          <View style={{ height: 12, borderRadius: 99, backgroundColor: Colors.bitcoin, width: h.totalMined }} />
        </View>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>Supply mined: {h.totalMined}</Text>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>QUICK CHECK — CURRENT BLOCK REWARD</Text>
        <Text style={[s.hint2, { marginBottom: Spacing.sm }]}>We are in the 4th halving era (2024). What is the current block reward in BTC?</Text>
        <TextInput style={s.input} value={q1} onChangeText={setQ1}
          keyboardType="decimal-pad" placeholder="e.g. 6.25" placeholderTextColor={Colors.textMuted} />
        {checked && <ResultBox correct={isCorrect} message={isCorrect
          ? '✓ Correct! 3.125 BTC per block. At ~144 blocks/day that\'s ~450 new BTC minted daily — down from 900 before the 2024 halving.'
          : `Not quite. The 2024 halving cut the reward from 6.25 → 3.125 BTC. ${correct} is the answer.`} />}
        {!checked
          ? <PrimaryBtn label="Check Answer →" onPress={() => setChecked(true)} disabled={!q1} />
          : isCorrect
            ? <PrimaryBtn label="Continue →" onPress={onComplete} />
            : <PrimaryBtn label="Try Again" onPress={() => { setQ1(''); setChecked(false); }} />}
      </Card>
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── gas ───────────────────────────────────────────────────────────────────────
function GasSim({ onComplete, onSkip }: SimProps) {
  const [baseFee, setBaseFee] = useState(15);
  const [priority, setPriority] = useState(2);
  const [gasLimit, setGasLimit] = useState(21000);
  const [checked, setChecked] = useState(false);

  const totalGwei = baseFee + priority;
  const totalEth  = (totalGwei * gasLimit / 1e9).toFixed(6);
  const totalUsd  = (parseFloat(totalEth) * 3247).toFixed(4);

  const scenarios = [
    { label: 'ETH Transfer',        gas: 21000 },
    { label: 'ERC-20 Transfer',     gas: 65000 },
    { label: 'Uniswap Swap',        gas: 150000 },
    { label: 'NFT Mint',            gas: 250000 },
    { label: 'Complex DeFi tx',     gas: 500000 },
  ];

  const selected = scenarios.findIndex(sc => sc.gas === gasLimit);

  return (
    <SimShell icon="⛽" title="Ethereum Gas Fee Calculator" subtitle="Understand exactly how gas fees are calculated before you sign any transaction.">
      <Card>
        <Text style={s.fieldLabel}>TRANSACTION TYPE</Text>
        <View style={{ gap: Spacing.sm }}>
          {scenarios.map((sc, i) => (
            <TouchableOpacity key={i} onPress={() => setGasLimit(sc.gas)} style={[
              { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2,
                borderColor: selected === i ? Colors.accent : Colors.border,
                backgroundColor: selected === i ? Colors.accentSoft : Colors.card }
            ]}>
              <Text style={{ fontWeight: '700', color: selected === i ? Colors.accent : Colors.text }}>{sc.label}</Text>
              <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm }}>{sc.gas.toLocaleString()} gas</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>NETWORK CONDITIONS (Gwei)</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {[{ label: '🐢 Low', base: 8, p: 1 }, { label: '⚡ Med', base: 15, p: 2 }, { label: '🚀 Fast', base: 30, p: 5 }].map(opt => (
            <TouchableOpacity key={opt.label} onPress={() => { setBaseFee(opt.base); setPriority(opt.p); }} style={[
              chip.base, baseFee === opt.base && chip.active, { flex: 1, alignItems: 'center' }
            ]}>
              <Text style={[chip.text, baseFee === opt.base && chip.activeText]}>{opt.label}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSoft }}>{opt.base + opt.p} gwei</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: Spacing.md, gap: 4 }}>
          <View style={s.row}><Text style={s.rowKey}>Base fee (burned)</Text><Text style={s.rowVal}>{baseFee} gwei</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Priority tip (miner)</Text><Text style={s.rowVal}>{priority} gwei</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Gas limit</Text><Text style={s.rowVal}>{gasLimit.toLocaleString()} units</Text></View>
          <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
            <Text style={s.rowKey}>Formula</Text>
            <Text style={[s.rowVal, { fontSize: 11 }]}>{totalGwei} gwei × {gasLimit.toLocaleString()} = {totalEth} ETH</Text>
          </View>
          <View style={[s.row, { backgroundColor: '#f0f4ff', borderRadius: Radius.md, padding: Spacing.sm }]}>
            <Text style={{ fontWeight: '800', color: Colors.accent }}>Total fee</Text>
            <Text style={{ fontWeight: '900', color: Colors.accent, fontSize: FontSize.lg }}>{totalEth} ETH ≈ ${totalUsd}</Text>
          </View>
        </View>
      </Card>

      {!checked ? (
        <PrimaryBtn label="I Understand Gas →" onPress={() => setChecked(true)} />
      ) : (
        <>
          <ResultBox correct message={`Gas = (${baseFee} + ${priority}) gwei × ${gasLimit.toLocaleString()} units = $${totalUsd}. During NFT drops, base fee can spike to 1,000+ gwei — same formula, 100× the cost.`} />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── staking ───────────────────────────────────────────────────────────────────
function StakingSim({ onComplete, onSkip }: SimProps) {
  const options = [
    { id: 'solo',     label: '🖥️ Solo Validator',  min: 32,   apy: 4.2, liquid: false, risk: 'High — slashing risk, 24/7 uptime required', desc: 'Run your own validator. Full control, full responsibility.' },
    { id: 'lido',     label: '💧 Lido (stETH)',     min: 0.01, apy: 3.9, liquid: true,  risk: 'Smart contract risk. Lido controls 30%+ of stake.', desc: 'Stake any amount, receive stETH (liquid token). Most popular.' },
    { id: 'rocketpool',label: '🚀 Rocket Pool',     min: 0.01, apy: 3.7, liquid: true,  risk: 'Smart contract risk. More decentralised than Lido.', desc: 'Decentralised liquid staking. Receive rETH.' },
    { id: 'coinbase',  label: '🏦 Coinbase cbETH',  min: 0.001,apy: 3.1, liquid: true,  risk: 'Counterparty risk. Coinbase takes 25% cut.', desc: 'Easiest. Regulated. Lowest yield due to 25% fee.' },
  ];
  const [selected, setSelected] = useState('lido');
  const [amount, setAmount] = useState('1');
  const [confirmed, setConfirmed] = useState(false);
  const opt = options.find(o => o.id === selected)!;
  const eth = parseFloat(amount) || 0;
  const yearlyEth = (eth * opt.apy / 100).toFixed(4);
  const yearlyUsd = (parseFloat(yearlyEth) * 3247).toFixed(2);

  return (
    <SimShell icon="🔒" title="ETH Staking Comparison" subtitle="Compare all four staking options — pick the right one for your situation.">
      <Card>
        <Text style={s.fieldLabel}>CHOOSE YOUR STAKING METHOD</Text>
        {options.map(o => (
          <TouchableOpacity key={o.id} onPress={() => !confirmed && setSelected(o.id)} style={[
            { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
              borderColor: selected === o.id ? Colors.accent : Colors.border,
              backgroundColor: selected === o.id ? Colors.accentSoft : Colors.card }
          ]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', color: selected === o.id ? Colors.accent : Colors.text }}>{o.label}</Text>
              <Text style={{ fontWeight: '900', color: Colors.green }}>{o.apy}% APY</Text>
            </View>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>Min: {o.min} ETH · Liquid: {o.liquid ? '✅' : '❌ Locked'}</Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Card>
        <Text style={s.fieldLabel}>ETH AMOUNT TO STAKE</Text>
        {eth < opt.min && eth > 0 && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginBottom: 4 }}>Minimum is {opt.min} ETH for {opt.label}</Text>}
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <View style={s.row}><Text style={s.rowKey}>Annual yield ({opt.apy}%)</Text><Text style={[s.rowVal, { color: Colors.green }]}>+{yearlyEth} ETH (+${yearlyUsd})</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Risk</Text><Text style={[s.rowVal, { fontSize: 11, flex: 1, textAlign: 'right' }]}>{opt.risk}</Text></View>
        <View style={s.row}><Text style={s.rowKey}>{opt.label}</Text><Text style={[s.rowVal, { fontSize: 11, flex: 1, textAlign: 'right' }]}>{opt.desc}</Text></View>
      </Card>

      {!confirmed ? (
        <PrimaryBtn label={`Stake ${amount} ETH via ${opt.label} →`} onPress={() => setConfirmed(true)} disabled={eth < opt.min} />
      ) : (
        <>
          <ResultBox correct message={`Staked! ${opt.liquid ? 'You received a liquid token — sell it anytime without unstaking.' : 'Your ETH is locked. You earn ~4.2% APY but cannot exit without a queue wait.'}`} />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}


// =============================================================================
// BATCH 2: CEX, WRONG CHAIN, LENDING, LEVERAGE, FDV
// =============================================================================

// ── cexDeposit ────────────────────────────────────────────────────────────────
function CexDepositSim({ onComplete, onSkip }: SimProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [token, setToken] = useState('USDT');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'done' | 'error'>('select');

  const supportedNetworks: Record<string, string[]> = {
    USDT: ['Ethereum (ERC20)', 'BNB Chain (BEP20)', 'Tron (TRC20)', 'Solana (SPL)'],
    ETH:  ['Ethereum', 'Arbitrum', 'Base', 'Optimism'],
    BNB:  ['BNB Chain (BEP20)', 'Ethereum (ERC20)'],
    SOL:  ['Solana'],
  };
  const depositAddresses: Record<string, Record<string, string>> = {
    USDT: {
      'Ethereum (ERC20)': '0xA7B2...3f9c',
      'BNB Chain (BEP20)': 'bnb1qx...7c2d',
      'Tron (TRC20)': 'TR7NH...Mrd8',
      'Solana (SPL)': '7kbn3...xPo9',
    },
    ETH: {
      'Ethereum': '0xA7B2...3f9c',
      'Arbitrum': '0xA7B2...3f9c',
      'Base': '0xA7B2...3f9c',
      'Optimism': '0xA7B2...3f9c',
    },
  };
  const wrongNetworkError = network === 'Tron (TRC20)' && token === 'ETH';
  const nets = supportedNetworks[token] || [];
  const addr = depositAddresses[token]?.[network] || '0xA7B2...3f9c';

  const fees: Record<string, string> = {
    'Ethereum (ERC20)': '$2–8 (ETH gas)',
    'BNB Chain (BEP20)': '~$0.10 (BNB gas)',
    'Tron (TRC20)': '~$1 (TRX gas) ⚠️ Many CEX don\'t support TRC20',
    'Solana (SPL)': '~$0.001 (SOL gas)',
    'Ethereum': '$2–8', 'Arbitrum': '~$0.10', 'Base': '~$0.05', 'Optimism': '~$0.08',
  };

  const reset = () => { setNetwork(''); setAmount(''); setStep('select'); };

  return (
    <SimShell icon="🏦" title="CEX Deposit & Withdrawal" subtitle="Practice selecting the right network — the #1 cause of lost crypto.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {(['deposit', 'withdraw'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => { setTab(t); reset(); }} style={[chip.base, tab === t && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, tab === t && chip.activeText]}>{t === 'deposit' ? '↓ Deposit' : '↑ Withdraw'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {step === 'select' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>TOKEN</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
              {['USDT', 'ETH', 'BNB', 'SOL'].map(t => (
                <TouchableOpacity key={t} onPress={() => { setToken(t); setNetwork(''); }} style={[chip.base, token === t && chip.active]}>
                  <Text style={[chip.text, token === t && chip.activeText]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>SELECT NETWORK</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.red, fontWeight: '700', marginBottom: Spacing.sm }}>
              ⚠️ Choose the WRONG network and funds are lost permanently
            </Text>
            {nets.map(net => (
              <TouchableOpacity key={net} onPress={() => setNetwork(net)} style={[
                { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md,
                  borderWidth: 2, marginBottom: Spacing.sm,
                  borderColor: network === net ? Colors.accent : Colors.border,
                  backgroundColor: network === net ? Colors.accentSoft : Colors.card }
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: network === net ? Colors.accent : Colors.text }}>{net}</Text>
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{fees[net] || 'varies'}</Text>
                </View>
                {network === net && <Text style={{ color: Colors.accent }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <Text style={s.fieldLabel}>AMOUNT ({token})</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} placeholder="e.g. 100" />
          </Card>
          <PrimaryBtn label={tab === 'deposit' ? 'Get Deposit Address →' : 'Confirm Withdrawal →'} onPress={() => setStep('confirm')} disabled={!network || !amount} />
        </>
      )}

      {step === 'confirm' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>{tab === 'deposit' ? 'YOUR DEPOSIT ADDRESS' : 'WITHDRAWAL DETAILS'}</Text>
            <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, marginBottom: Spacing.md }}>
              <Text style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: '800', color: Colors.accent }}>{addr}</Text>
            </View>
            <View style={s.row}><Text style={s.rowKey}>Token</Text><Text style={[s.rowVal, { fontWeight: '900' }]}>{token}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Network</Text><Text style={[s.rowVal, { color: Colors.accent, fontWeight: '900' }]}>{network}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Amount</Text><Text style={s.rowVal}>{amount} {token}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Network fee</Text><Text style={s.rowVal}>{fees[network] || 'varies'}</Text></View>
            <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
              <Text style={{ color: '#92400e', fontWeight: '700', fontSize: FontSize.sm }}>
                🔍 ALWAYS verify the network matches what your wallet is sending on. One wrong click = funds gone.
              </Text>
            </View>
          </Card>
          <PrimaryBtn label="✓ Confirm" onPress={() => setStep('done')} />
          <GhostBtn label="← Go Back" onPress={reset} />
        </>
      )}

      {step === 'done' && (
        <>
          <ResultBox correct message={`${tab === 'deposit' ? 'Deposit address copied' : 'Withdrawal submitted'} on ${network}. Funds will arrive in ${network.includes('Tron') ? '~3 min' : network.includes('BNB') ? '~30 sec' : network.includes('Solana') ? '~5 sec' : '~5 min'}.`} />
          <Card>
            <Text style={s.fieldLabel}>CRITICAL RULES</Text>
            <Text style={s.bullet}>• Always match the network on BOTH sides (wallet + CEX)</Text>
            <Text style={s.bullet}>• Sending ETH on Tron to Binance = permanent loss</Text>
            <Text style={s.bullet}>• Send a tiny test amount first for large transfers</Text>
            <Text style={s.bullet}>• TRC20 USDT is cheapest but not all CEX support it</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── wrongChain ────────────────────────────────────────────────────────────────
function WrongChainSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    {
      situation: 'You sent ETH via Arbitrum to a Binance ETH deposit address (only supports Ethereum mainnet)',
      lost: false,
      recovery: 'Contact Binance support. They can manually retrieve tokens from unsupported L2 deposits. Fee: ~$50–100. Takes 5–15 days.',
      tip: 'Binance and Bybit recover most L2 deposits for a fee. Never guaranteed — use correct network.',
    },
    {
      situation: 'You sent USDT via TRC20 (Tron) to a MetaMask Ethereum address',
      lost: false,
      recovery: 'Import your MetaMask private key into a Tron wallet (TronLink). Your USDT is there — same private key works on Tron.',
      tip: 'EVM private keys control the same address on non-EVM chains. You can recover it yourself.',
    },
    {
      situation: 'You sent BNB to a Solana wallet address',
      lost: true,
      recovery: 'Unrecoverable. BNB Chain and Solana use completely different address formats. The address doesn\'t exist on BNB Chain.',
      tip: 'Cross-ecosystem sends (EVM → Solana, Solana → BTC) are almost always unrecoverable.',
    },
    {
      situation: 'You sent ETH on Base to your own MetaMask (which shows Ethereum mainnet)',
      lost: false,
      recovery: 'Switch MetaMask to Base network. Your ETH is already there — wallets hold all EVM chains with one key.',
      tip: 'EVM chains share the same address. Switch networks in MetaMask to see your Base balance.',
    },
  ];
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((sc, i) => answers[i] === sc.lost).length;
  const passed = score >= 3;

  return (
    <SimShell icon="⛓️" title="Wrong Chain — Lost or Recoverable?" subtitle="For each mistake, decide: are the funds gone forever or recoverable?">
      <Text style={s.hint2}>Knowing the difference between recoverable and permanent loss can save you from panic — or stop you making it worse.</Text>
      {scenarios.map((sc, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === sc.lost;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{sc.situation}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[{ v: false, l: '🔧 Recoverable' }, { v: true, l: '💀 Permanent Loss' }].map(({ v, l }) => {
                const isCh = chosen === v;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCorrect)          { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCorrect)         { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && v === sc.lost)     { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: Colors.text, textAlign: 'center' }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && (
              <View style={{ marginTop: Spacing.sm }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: sc.lost ? Colors.red : Colors.green }}>
                  {sc.lost ? '💀 PERMANENT LOSS' : '🔧 RECOVERABLE'}
                </Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2, lineHeight: 16 }}>{sc.recovery}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.accent, marginTop: 4, fontWeight: '700' }}>💡 {sc.tip}</Text>
              </View>
            )}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check Answers →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <>
            <ResultBox correct={passed} message={passed
              ? `${score}/4 correct. Key rule: EVM→EVM with same key = recoverable. Cross-ecosystem (EVM↔Solana/Tron mismatch) = likely permanent.`
              : `${score}/4. The key test: do both chains use the same key format? EVM chains share private keys. Solana, Tron, and Bitcoin do not.`} />
            {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── lending ───────────────────────────────────────────────────────────────────
function LendingSim({ onComplete, onSkip }: SimProps) {
  const [mode, setMode] = useState<'lend' | 'borrow'>('lend');
  const [asset, setAsset] = useState('USDC');
  const [amount, setAmount] = useState('1000');
  const [collateralEth, setCollateralEth] = useState('1');
  const [confirmed, setConfirmed] = useState(false);

  const rates: Record<string, { supply: number; borrow: number }> = {
    USDC: { supply: 5.2, borrow: 7.8 },
    ETH:  { supply: 2.1, borrow: 3.4 },
    WBTC: { supply: 0.8, borrow: 2.1 },
    DAI:  { supply: 4.8, borrow: 7.2 },
  };
  const rate = rates[asset] || rates.USDC;
  const amt = parseFloat(amount) || 0;
  const ethAmt = parseFloat(collateralEth) || 0;
  const ETH_PRICE = 3247;
  const collateralUsd = ethAmt * ETH_PRICE;
  const maxBorrow = collateralUsd * 0.75; // 75% LTV
  const monthlyEarn = (amt * rate.supply / 100 / 12).toFixed(2);
  const monthlyPay  = (amt * rate.borrow / 100 / 12).toFixed(2);
  const healthFactor = mode === 'borrow' ? (collateralUsd * 0.80 / amt).toFixed(2) : null;

  return (
    <SimShell icon="🏦" title="Aave Lending & Borrowing" subtitle="Practice earning yield on idle assets — or borrowing without selling.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {(['lend', 'borrow'] as const).map(m => (
          <TouchableOpacity key={m} onPress={() => { setMode(m); setConfirmed(false); }} style={[chip.base, mode === m && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, mode === m && chip.activeText]}>{m === 'lend' ? '💰 Lend & Earn' : '💸 Borrow'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'lend' ? (
        <>
          <Card>
            <Text style={s.fieldLabel}>ASSET TO SUPPLY</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
              {Object.keys(rates).map(a => (
                <TouchableOpacity key={a} onPress={() => setAsset(a)} style={[chip.base, asset === a && chip.active]}>
                  <Text style={[chip.text, asset === a && chip.activeText]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>AMOUNT TO SUPPLY</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
            <View style={s.row}><Text style={s.rowKey}>Supply APY</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{rate.supply}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Monthly earnings</Text><Text style={[s.rowVal, { color: Colors.green }]}>+${monthlyEarn}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>You receive</Text><Text style={s.rowVal}>a{asset} (Aave interest-bearing token)</Text></View>
          </Card>
          {!confirmed
            ? <PrimaryBtn label={`Supply ${amount} ${asset} →`} onPress={() => setConfirmed(true)} disabled={amt <= 0} />
            : <>
                <ResultBox correct message={`Supplied! You now hold a${asset} — it automatically accrues interest every block. Withdraw anytime (if liquidity available).`} />
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
          }
        </>
      ) : (
        <>
          <Card>
            <Text style={s.fieldLabel}>COLLATERAL (ETH @ $3,247)</Text>
            <TextInput style={s.input} value={collateralEth} onChangeText={setCollateralEth} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
            <View style={s.row}><Text style={s.rowKey}>Collateral value</Text><Text style={s.rowVal}>${collateralUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Max borrow (75% LTV)</Text><Text style={[s.rowVal, { color: Colors.accent }]}>${maxBorrow.toFixed(0)}</Text></View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>BORROW {asset}</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
            {amt > maxBorrow && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginBottom: 4 }}>Exceeds max borrow capacity</Text>}
            <View style={s.row}><Text style={s.rowKey}>Borrow APY</Text><Text style={[s.rowVal, { color: Colors.red }]}>{rate.borrow}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Monthly interest</Text><Text style={[s.rowVal, { color: Colors.red }]}>-${monthlyPay}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Health factor</Text>
              <Text style={[s.rowVal, { color: parseFloat(healthFactor||'2') > 1.5 ? Colors.green : parseFloat(healthFactor||'1') > 1.0 ? '#f59e0b' : Colors.red, fontWeight: '900' }]}>
                {healthFactor} {parseFloat(healthFactor||'2') < 1.0 ? '💀 LIQUIDATED' : parseFloat(healthFactor||'2') < 1.5 ? '⚠️ Danger' : '✅ Safe'}
              </Text>
            </View>
          </Card>
          {!confirmed
            ? <PrimaryBtn label={`Borrow ${amount} ${asset} →`} onPress={() => setConfirmed(true)} disabled={amt <= 0 || amt > maxBorrow} />
            : <>
                <ResultBox correct message={`Borrowed ${amount} ${asset}! Your ETH collateral stays locked. Repay the loan + interest to unlock it. If ETH drops, health factor drops — repay or add collateral before liquidation.`} />
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
          }
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── leverage ──────────────────────────────────────────────────────────────────
function LeverageSim({ onComplete, onSkip }: SimProps) {
  const [leverage, setLeverage] = useState(5);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [margin, setMargin] = useState('100');
  const [priceMove, setPriceMove] = useState(10);
  const [confirmed, setConfirmed] = useState(false);

  const marginF = parseFloat(margin) || 0;
  const positionSize = marginF * leverage;
  const pnl = direction === 'long'
    ? positionSize * priceMove / 100
    : positionSize * (-priceMove) / 100;
  const pnlPct = (pnl / marginF * 100).toFixed(1);
  const liquidationPct = -(100 / leverage).toFixed(1);
  const isLiquidated = direction === 'long' ? priceMove <= -100 / leverage : priceMove >= 100 / leverage;

  return (
    <SimShell icon="📈" title="Leverage & Perpetuals Simulator" subtitle="Experience how leverage amplifies both gains AND losses before using real money.">
      <Card>
        <Text style={s.fieldLabel}>DIRECTION</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
          {([{ v: 'long', l: '↑ Long (bet price rises)', color: Colors.green }, { v: 'short', l: '↓ Short (bet price falls)', color: Colors.red }] as const).map(({ v, l, color }) => (
            <TouchableOpacity key={v} onPress={() => setDirection(v)} style={[chip.base, direction === v && { ...chip.active, borderColor: color, backgroundColor: color + '15' }, { flex: 1 }]}>
              <Text style={[chip.text, direction === v && { color }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.fieldLabel}>LEVERAGE</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {[2, 5, 10, 25, 50, 100].map(lev => (
            <TouchableOpacity key={lev} onPress={() => setLeverage(lev)} style={[chip.base, leverage === lev && chip.active]}>
              <Text style={[chip.text, leverage === lev && chip.activeText]}>{lev}×</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>MARGIN (USD)</Text>
        <TextInput style={s.input} value={margin} onChangeText={setMargin} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
      </Card>

      <Card>
        <Text style={s.fieldLabel}>PRICE MOVE SCENARIO (%)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {[-20, -10, -5, 5, 10, 20].map(p => (
              <TouchableOpacity key={p} onPress={() => setPriceMove(p)} style={[chip.base, priceMove === p && chip.active]}>
                <Text style={[chip.text, priceMove === p && chip.activeText]}>{p > 0 ? '+' : ''}{p}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={{ marginTop: Spacing.md, gap: 4 }}>
          <View style={s.row}><Text style={s.rowKey}>Position size</Text><Text style={s.rowVal}>${positionSize.toLocaleString()} ({leverage}× margin)</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Liquidation at</Text><Text style={[s.rowVal, { color: Colors.red }]}>{direction === 'long' ? '-' : '+'}{(100 / leverage).toFixed(1)}% move</Text></View>
          <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
            <Text style={[s.rowKey, { fontWeight: '800' }]}>Your P&L</Text>
            <Text style={[s.rowVal, { fontWeight: '900', fontSize: FontSize.lg, color: isLiquidated ? Colors.red : pnl >= 0 ? Colors.green : Colors.red }]}>
              {isLiquidated ? '💀 LIQUIDATED (-$' + margin + ')' : `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct}%)`}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={{ borderColor: Colors.red }}>
        <Text style={[s.fieldLabel, { color: Colors.red }]}>RISK WARNING</Text>
        <Text style={s.bullet}>• 75% of retail leverage traders lose money</Text>
        <Text style={s.bullet}>• At 10×: a 10% move wipes your entire margin</Text>
        <Text style={s.bullet}>• Funding rates charge you every 8 hours for holding</Text>
        <Text style={s.bullet}>• Never risk more than 1-2% of portfolio on leveraged trades</Text>
      </Card>

      {!confirmed
        ? <PrimaryBtn label="I Understand the Risks →" onPress={() => setConfirmed(true)} />
        : <>
            <ResultBox correct message={`At ${leverage}× leverage, a ${Math.abs(priceMove)}% price move ${direction === 'long' ? (priceMove > 0 ? 'earns' : 'loses') : (priceMove < 0 ? 'earns' : 'loses')} ${Math.abs(parseFloat(pnlPct))}% of your margin. Liquidation happens at a ${(100/leverage).toFixed(1)}% adverse move.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── fdv ───────────────────────────────────────────────────────────────────────
function FdvSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    { name: 'NEWCOIN', price: 0.10, circSupply: 100_000_000, totalSupply: 10_000_000_000, unlock: '90% unlocks over 3 years' },
    { name: 'ESTAB',   price: 2.50, circSupply: 800_000_000, totalSupply: 1_000_000_000,  unlock: '20% remaining unlocks in 6 months' },
    { name: 'MEME69',  price: 0.000001, circSupply: 999_000_000_000, totalSupply: 1_000_000_000_000, unlock: '99.9% circulating — nearly fully diluted' },
  ];
  const [selected, setSelected] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'invest' | 'avoid' | null>>({});
  const [checked, setChecked] = useState(false);
  const correct: Record<number, 'invest' | 'avoid'> = { 0: 'avoid', 1: 'invest', 2: 'invest' };

  const tok = tokens[selected];
  const mcap = tok.price * tok.circSupply;
  const fdv   = tok.price * tok.totalSupply;
  const fdvRatio = fdv / mcap;

  return (
    <SimShell icon="🔢" title="FDV vs Market Cap" subtitle="The hidden number VCs check before every investment.">
      <Card>
        <Text style={s.fieldLabel}>SELECT TOKEN TO ANALYSE</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {tokens.map((t, i) => (
            <TouchableOpacity key={i} onPress={() => setSelected(i)} style={[chip.base, selected === i && chip.active, { flex: 1, alignItems: 'center' }]}>
              <Text style={[chip.text, selected === i && chip.activeText]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: Spacing.md, gap: 4 }}>
          <View style={s.row}><Text style={s.rowKey}>Price</Text><Text style={[s.rowVal, { fontWeight: '900' }]}>${tok.price}</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Circ. Supply</Text><Text style={s.rowVal}>{(tok.circSupply / 1e6).toFixed(0)}M</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Total Supply</Text><Text style={s.rowVal}>{(tok.totalSupply / 1e9).toFixed(1)}B</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Market Cap</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '800' }]}>${(mcap / 1e6).toFixed(1)}M</Text></View>
          <View style={[s.row, { backgroundColor: fdvRatio > 20 ? '#fee2e2' : fdvRatio > 5 ? '#fef3c7' : '#d1fae5', borderRadius: Radius.md, padding: Spacing.sm }]}>
            <Text style={{ fontWeight: '800' }}>FDV</Text>
            <Text style={[{ fontWeight: '900', fontSize: FontSize.md }, { color: fdvRatio > 20 ? Colors.red : fdvRatio > 5 ? '#92400e' : Colors.green }]}>
              ${(fdv / 1e9).toFixed(2)}B ({fdvRatio.toFixed(0)}× market cap)
            </Text>
          </View>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16, marginTop: 4 }}>🔓 Unlock schedule: {tok.unlock}</Text>
        </View>
      </Card>

      <Text style={[s.fieldLabel, { marginTop: 0 }]}>INVEST OR AVOID? (tap all 3)</Text>
      {tokens.map((t, i) => {
        const mc = t.price * t.circSupply;
        const fv = t.price * t.totalSupply;
        const ratio = fv / mc;
        const chosen = answers[i];
        const isCorrect = chosen === correct[i];
        let bg = Colors.card, border = Colors.border;
        if (checked && chosen) { bg = isCorrect ? '#d1fae5' : '#fee2e2'; border = isCorrect ? Colors.green : Colors.red; }
        return (
          <Card key={i} style={{ borderColor: border, backgroundColor: bg }}>
            <Text style={{ fontWeight: '900', color: Colors.text }}>{t.name}</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>MC: ${(mc/1e6).toFixed(1)}M · FDV: ${(fv/1e9).toFixed(2)}B · Ratio: {ratio.toFixed(0)}×</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm }}>
              {(['invest', 'avoid'] as const).map(v => (
                <TouchableOpacity key={v} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))} style={{
                  flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                  borderColor: answers[i] === v ? (v === 'invest' ? Colors.green : Colors.red) : Colors.border,
                  backgroundColor: answers[i] === v ? (v === 'invest' ? '#d1fae5' : '#fee2e2') : Colors.card
                }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm }}>{v === 'invest' ? '✅ Invest' : '🚫 Avoid'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>
              {i === 0 ? '⚠️ 100× FDV/MC means 99% of tokens are locked. Selling pressure when they unlock crushes price.' :
               i === 1 ? '✅ Only 20% left to unlock, reasonable FDV. Established protocol with real usage.' :
               '✅ Nearly fully diluted — what you see is what you get. No hidden unlock cliff.'}
            </Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <>
            <ResultBox correct={Object.entries(answers).filter(([i, a]) => a === correct[parseInt(i)]).length >= 2}
              message="FDV rule: if FDV is 10–100× market cap, expect massive sell pressure as tokens unlock. High FDV = bad for retail buyers." />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}


// =============================================================================
// BATCH 3: NFT, LP SEED, RUG SCANNER, RUGCHECK, BONDING CURVE
// =============================================================================

// ── nftMint ───────────────────────────────────────────────────────────────────
function NftMintSim({ onComplete, onSkip }: SimProps) {
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState<'select' | 'approve' | 'done'>('select');
  const MINT_PRICE = 0.08;
  const MAX_PER_WALLET = 3;
  const GAS = 0.012;
  const total = (qty * MINT_PRICE + GAS).toFixed(4);

  return (
    <SimShell icon="🖼️" title="Mint an NFT" subtitle="Walk through a real mint — understand what you're signing and what it costs.">
      {step === 'select' && (
        <>
          <Card>
            <Text style={{ fontWeight: '900', fontSize: FontSize.xl, color: Colors.text }}>PixelPunks Collection</Text>
            <Text style={s.hint2}>10,000 unique PFPs. 4,200 remaining.</Text>
            <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md }} />
            <View style={s.row}><Text style={s.rowKey}>Mint price</Text><Text style={[s.rowVal, { fontWeight: '900' }]}>{MINT_PRICE} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Max per wallet</Text><Text style={s.rowVal}>{MAX_PER_WALLET}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Est. gas</Text><Text style={s.rowVal}>~{GAS} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Network</Text><Text style={s.rowVal}>Ethereum</Text></View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>HOW MANY TO MINT?</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' }}>
              {[1, 2, 3].map(n => (
                <TouchableOpacity key={n} onPress={() => setQty(n)} style={[chip.base, qty === n && chip.active, { paddingHorizontal: Spacing.xl }]}>
                  <Text style={[chip.text, qty === n && chip.activeText, { fontSize: FontSize.xl }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.row, { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm }]}>
              <Text style={{ fontWeight: '800', color: Colors.text }}>Total (mint + gas)</Text>
              <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.accent }}>{total} ETH</Text>
            </View>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4 }}>≈ ${(parseFloat(total) * 3247).toFixed(0)} USD</Text>
          </Card>
          <PrimaryBtn label="Mint Now →" onPress={() => setStep('approve')} />
        </>
      )}

      {step === 'approve' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>MetaMask — CONFIRM TRANSACTION</Text>
            <Text style={{ fontWeight: '900', color: Colors.text, fontSize: FontSize.md, marginBottom: Spacing.sm }}>PixelPunks.mint()</Text>
            <View style={s.row}><Text style={s.rowKey}>Contract</Text><Text style={{ fontSize: 11, fontFamily: 'monospace', color: Colors.accent }}>0x58cB...dF3a</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Function</Text><Text style={s.rowVal}>mint(uint256 qty)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Value sent</Text><Text style={s.rowVal}>{(qty * MINT_PRICE).toFixed(3)} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Gas (est.)</Text><Text style={s.rowVal}>{GAS} ETH</Text></View>
            <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: '#92400e', fontSize: FontSize.sm }}>
                ⚠️ BEFORE CONFIRMING: Verify the contract address on Etherscan. Fake mint sites use different contracts.
              </Text>
            </View>
          </Card>
          <PrimaryBtn label="✓ Confirm Mint" onPress={() => setStep('done')} />
          <GhostBtn label="Reject" onPress={() => setStep('select')} />
        </>
      )}

      {step === 'done' && (
        <>
          <ResultBox correct message={`Minted ${qty} NFT${qty > 1 ? 's' : ''}! Token ID(s) assigned by the contract. They'll appear in OpenSea and your wallet within ~5 minutes.`} />
          <Card>
            <Text style={s.fieldLabel}>WHAT JUST HAPPENED ON-CHAIN</Text>
            <Text style={s.bullet}>• You called the mint() function on the NFT contract</Text>
            <Text style={s.bullet}>• Contract assigned you the next token ID(s) in sequence</Text>
            <Text style={s.bullet}>• Ownership recorded on Ethereum — permanent and public</Text>
            <Text style={s.bullet}>• Metadata (image, traits) stored on IPFS or Arweave</Text>
            <Text style={s.bullet}>• Gas is burned — it doesn't go to the NFT creator</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── nftContract ───────────────────────────────────────────────────────────────
function NftContractSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [functionName, setFunctionName] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [txHash, setTxHash] = useState('');

  const correctFn = 'mint';
  const correctValue = '0.08';
  const isCorrectFn = functionName.toLowerCase().trim() === correctFn;
  const isCorrectVal = valueInput.trim() === correctValue;

  return (
    <SimShell icon="📋" title="Mint from Contract (Site Down)" subtitle="The website crashed during the drop. Mint directly on Etherscan — no middleman needed.">
      {step === 0 && (
        <Card>
          <Text style={s.hint2}>Popular NFT launches regularly crash their own websites. Experienced minters go straight to Etherscan and call the mint function directly.</Text>
          <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '800', color: Colors.green }}>✅ This is safe and legitimate — it's exactly what the website does behind the scenes.</Text>
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 1 — FIND CONTRACT ON ETHERSCAN</Text>
          <Text style={s.hint2}>Go to Etherscan, paste the contract address, click "Contract" tab, then "Write Contract".</Text>
          <View style={{ padding: Spacing.sm, backgroundColor: Colors.border, borderRadius: Radius.sm, marginTop: Spacing.sm }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>Contract: 0x58cB...dF3a</Text>
          </View>
          <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>WRITE FUNCTIONS AVAILABLE:</Text>
          {['approve', 'setApprovalForAll', 'mint', 'transferFrom', 'renounceOwnership'].map(fn => (
            <TouchableOpacity key={fn} onPress={() => setFunctionName(fn)} style={[
              { padding: Spacing.sm, borderRadius: Radius.sm, marginTop: 4, borderWidth: 1,
                borderColor: functionName === fn ? Colors.accent : Colors.border,
                backgroundColor: functionName === fn ? Colors.accentSoft : Colors.card }
            ]}>
              <Text style={{ fontFamily: 'monospace', fontSize: 13, color: functionName === fn ? Colors.accent : Colors.text }}>{fn}()</Text>
            </TouchableOpacity>
          ))}
          {functionName && !isCorrectFn && <Text style={s.hint}>💡 You need the function that creates new NFTs — look for "mint"</Text>}
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 2 — FILL IN PARAMETERS</Text>
          <Text style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: FontSize.md, marginBottom: Spacing.sm }}>mint()</Text>
          <Text style={s.hint2}>Inputs: qty (uint256) = 1</Text>
          <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>PAYABLE AMOUNT (ETH)</Text>
          <Text style={s.hint2}>The contract costs 0.08 ETH per NFT. Set the "Value" field in ETH.</Text>
          <TextInput style={s.input} value={valueInput} onChangeText={setValueInput} keyboardType="decimal-pad" placeholder="e.g. 0.08" placeholderTextColor={Colors.textMuted} />
          {valueInput && !isCorrectVal && <Text style={s.hint}>💡 Mint price is 0.08 ETH. Under-paying reverts the transaction.</Text>}
        </Card>
      )}

      {step === 3 && (
        <>
          <ResultBox correct message="Minted directly from Etherscan! The contract doesn't care whether you used the website or called it directly — same function, same result." />
          <Card>
            <Text style={s.fieldLabel}>WHEN TO USE THIS</Text>
            <Text style={s.bullet}>• Website is down / slow during a hyped launch</Text>
            <Text style={s.bullet}>• You want to skip the front-end entirely</Text>
            <Text style={s.bullet}>• To verify the function does what you think it does</Text>
            <Text style={s.fieldLabel} style={{ marginTop: Spacing.md }}>ALWAYS VERIFY FIRST</Text>
            <Text style={s.bullet}>• Check the contract address against official Discord/Twitter</Text>
            <Text style={s.bullet}>• Look for the contract audit link in the project docs</Text>
            <Text style={s.bullet}>• Never call setApprovalForAll on a random contract</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      {step < 3 && (
        <PrimaryBtn
          label={['Start Walkthrough →', 'Select mint() Function →', 'Confirm & Mint →', ''][step]}
          onPress={() => setStep(s => (s + 1) as any)}
          disabled={(step === 1 && !isCorrectFn) || (step === 2 && !isCorrectVal)}
        />
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── rugScanner ────────────────────────────────────────────────────────────────
function RugScannerSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    {
      name: 'MOONSHOT',
      mintRevoked: false, lpLocked: false, honeypot: false,
      topHolder: 68, devWallet: 45, age: '14min',
      verdict: 'INSTANT RUG', danger: 3,
      reasons: ['Mint authority active — infinite supply possible', 'LP unlocked — creator can drain pool instantly', 'Dev wallet holds 45% — one sell wrecks price'],
    },
    {
      name: 'SAFECOIN',
      mintRevoked: true, lpLocked: true, honeypot: false,
      topHolder: 12, devWallet: 4, age: '3 days',
      verdict: 'APPEARS SAFE', danger: 0,
      reasons: ['Mint authority revoked ✅', 'LP locked for 1 year ✅', 'Dev wallet only 4% ✅', 'No honeypot code detected ✅'],
    },
    {
      name: 'TRAPTOKEN',
      mintRevoked: true, lpLocked: true, honeypot: true,
      topHolder: 8, devWallet: 3, age: '2 days',
      verdict: 'HONEYPOT', danger: 2,
      reasons: ['Mint revoked ✅ LP locked ✅ — looks safe', 'BUT: hidden sell restriction in contract', 'You can buy freely — you will NEVER sell', 'Only audited contracts are truly safe'],
    },
    {
      name: 'WHALE999',
      mintRevoked: true, lpLocked: false, honeypot: false,
      topHolder: 89, devWallet: 1, age: '5 days',
      verdict: 'WHALE DUMP RISK', danger: 1,
      reasons: ['One wallet holds 89% — coordinated pump & dump setup', 'LP unlocked but that\'s secondary risk here', 'If whale sells → price goes to zero instantly'],
    },
  ];
  const verdictColor: Record<string, string> = {
    'INSTANT RUG': Colors.red, 'APPEARS SAFE': Colors.green,
    'HONEYPOT': '#7f1d1d', 'WHALE DUMP RISK': '#f59e0b',
  };

  const [tokenIdx, setTokenIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const tok = tokens[tokenIdx];
  const allAnswered = tokens.every((_, i) => answers[i]);
  const score = tokens.filter((t, i) => answers[i] === t.verdict).length;

  const indicators = [
    { label: 'Mint Authority', value: tok.mintRevoked ? 'Revoked ✅' : 'ACTIVE 🚨', danger: !tok.mintRevoked },
    { label: 'LP Lock', value: tok.lpLocked ? 'Locked ✅' : 'UNLOCKED 🚨', danger: !tok.lpLocked },
    { label: 'Honeypot', value: tok.honeypot ? 'DETECTED 🚨' : 'Clear ✅', danger: tok.honeypot },
    { label: 'Top Holder', value: `${tok.topHolder}% ${tok.topHolder > 20 ? '⚠️' : '✅'}`, danger: tok.topHolder > 20 },
    { label: 'Dev Wallet', value: `${tok.devWallet}% ${tok.devWallet > 10 ? '⚠️' : '✅'}`, danger: tok.devWallet > 10 },
    { label: 'Token Age', value: tok.age, danger: false },
  ];

  return (
    <SimShell icon="🔍" title="Token Safety Scanner" subtitle="Run each token through the full safety checklist before deciding to buy.">
      <Card>
        <Text style={s.fieldLabel}>SELECT TOKEN</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {tokens.map((t, i) => (
            <TouchableOpacity key={i} onPress={() => setTokenIdx(i)} style={[chip.base, tokenIdx === i && chip.active]}>
              <Text style={[chip.text, tokenIdx === i && chip.activeText]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: Spacing.md, gap: 4 }}>
          {indicators.map(ind => (
            <View key={ind.label} style={[s.row, { backgroundColor: ind.danger ? '#fff0f0' : '#f0fff4', borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 }]}>
              <Text style={[s.rowKey, { color: ind.danger ? Colors.red : Colors.green }]}>{ind.label}</Text>
              <Text style={[s.rowVal, { color: ind.danger ? Colors.red : Colors.green, fontWeight: '800' }]}>{ind.value}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>VERDICT FOR {tok.name}?</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {['INSTANT RUG', 'HONEYPOT', 'WHALE DUMP RISK', 'APPEARS SAFE'].map(v => (
            <TouchableOpacity key={v} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [tokenIdx]: v }))} style={{
              paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, marginBottom: 4,
              borderColor: answers[tokenIdx] === v ? verdictColor[v] : Colors.border,
              backgroundColor: answers[tokenIdx] === v ? verdictColor[v] + '20' : Colors.card,
            }}>
              <Text style={{ fontWeight: '700', fontSize: FontSize.xs, color: answers[tokenIdx] === v ? verdictColor[v] : Colors.text }}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {checked && answers[tokenIdx] && (
          <View style={{ marginTop: Spacing.sm, padding: Spacing.md, backgroundColor: answers[tokenIdx] === tok.verdict ? '#d1fae5' : '#fee2e2', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '800', color: verdictColor[tok.verdict] }}>Verdict: {tok.verdict}</Text>
            {tok.reasons.map((r, i) => <Text key={i} style={{ fontSize: FontSize.xs, color: Colors.text, marginTop: 2 }}>• {r}</Text>)}
          </View>
        )}
      </Card>
      {!checked
        ? <PrimaryBtn label="Submit All Verdicts →" onPress={() => setChecked(true)} disabled={!allAnswered} />
        : <>
            <ResultBox correct={score >= 3} message={`${score}/4 correct. Remember: even "safe" tokens can be risky — always use Rugcheck.xyz + Bubblemaps before any purchase.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── rugcheck ──────────────────────────────────────────────────────────────────
function RugcheckSim({ onComplete, onSkip }: SimProps) {
  const [phase, setPhase] = useState<'setup' | 'rugpull' | 'aftermath'>('setup');
  const [invested, setInvested] = useState('500');
  const [sawWarnings, setSawWarnings] = useState(false);

  const warnings = [
    { text: 'Mint authority NOT revoked', severity: 'critical' },
    { text: 'LP lock expires in 48 hours', severity: 'high' },
    { text: 'Dev wallet holds 38%', severity: 'high' },
    { text: 'Contract not verified on Etherscan', severity: 'medium' },
  ];
  const inv = parseFloat(invested) || 0;
  const lostAmount = (inv * 0.97).toFixed(2);

  return (
    <SimShell icon="🪤" title="Anatomy of a Rug Pull" subtitle="Live through a rug pull — and why Rugcheck.xyz would have saved you.">
      {phase === 'setup' && (
        <>
          <Card>
            <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text, marginBottom: Spacing.sm }}>🚀 ROCKETCOIN — New token trending!</Text>
            <Text style={s.hint2}>"Dev is doxxed, LP locked, 100x incoming! Partnered with a major CEX (rumoured)."</Text>
            <Text style={[s.fieldLabel, { marginTop: Spacing.md }]}>You're about to ape in. But did you run Rugcheck.xyz first?</Text>
            <View style={{ gap: Spacing.sm }}>
              {warnings.map((w, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', padding: Spacing.sm, backgroundColor: w.severity === 'critical' ? '#fee2e2' : w.severity === 'high' ? '#fef3c7' : '#f3f4f6', borderRadius: Radius.md }}>
                  <Text style={{ fontSize: 16 }}>{w.severity === 'critical' ? '🚨' : w.severity === 'high' ? '⚠️' : '⚡'}</Text>
                  <Text style={{ fontWeight: '700', flex: 1, fontSize: FontSize.sm, color: w.severity === 'critical' ? Colors.red : w.severity === 'high' ? '#92400e' : Colors.text }}>{w.text}</Text>
                </View>
              ))}
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>HOW MUCH WOULD YOU INVEST?</Text>
            <TextInput style={s.input} value={invested} onChangeText={setInvested} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} placeholder="USD" />
            <TouchableOpacity onPress={() => setSawWarnings(!sawWarnings)} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: sawWarnings ? Colors.green : Colors.border, backgroundColor: sawWarnings ? '#d1fae5' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {sawWarnings && <Text style={{ color: Colors.green, fontWeight: '900' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft }}>I saw the Rugcheck warnings and ignored them</Text>
            </TouchableOpacity>
          </Card>
          <PrimaryBtn label="Buy ROCKETCOIN →" onPress={() => setPhase('rugpull')} disabled={inv <= 0} />
        </>
      )}

      {phase === 'rugpull' && (
        <>
          <Card style={{ borderColor: Colors.red }}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>💥</Text>
            <Text style={[s.fieldLabel, { textAlign: 'center', color: Colors.red }]}>RUG PULL DETECTED</Text>
            <Text style={{ textAlign: 'center', color: Colors.text, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md }}>
              Dev drained the LP pool 6 hours after launch
            </Text>
            <View style={s.row}><Text style={s.rowKey}>You invested</Text><Text style={s.rowVal}>${inv.toFixed(2)}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Current value</Text><Text style={[s.rowVal, { color: Colors.red, fontWeight: '900' }]}>${(inv * 0.03).toFixed(2)}</Text></View>
            <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
              <Text style={{ fontWeight: '800', color: Colors.red }}>You lost</Text>
              <Text style={{ fontWeight: '900', fontSize: FontSize.xl, color: Colors.red }}>-${lostAmount}</Text>
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>WHAT THE RUG CHECKER WOULD HAVE SHOWN</Text>
            <Text style={s.bullet}>🚨 Mint authority active → dev printed tokens, dumped them</Text>
            <Text style={s.bullet}>⚠️ LP lock expired → nothing stopped them draining the pool</Text>
            <Text style={s.bullet}>⚠️ Dev holds 38% → they already planned the exit</Text>
          </Card>
          <PrimaryBtn label="See How to Protect Yourself →" onPress={() => setPhase('aftermath')} />
        </>
      )}

      {phase === 'aftermath' && (
        <>
          <ResultBox correct={false} message={`You lost $${lostAmount}. This exact scenario happens thousands of times daily. Rugcheck.xyz takes 10 seconds.`} />
          <Card>
            <Text style={s.fieldLabel}>MANDATORY CHECKLIST BEFORE BUYING</Text>
            {['Rugcheck.xyz — paste contract, check score', 'DEXScreener — LP locked? Mint revoked?', 'Bubblemaps — visualise holder concentration', 'Honeypot.is — can you actually sell?', 'Etherscan/Solscan — is contract verified?'].map((step, i) => (
              <Text key={i} style={s.bullet}>✅ {step}</Text>
            ))}
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── bondingCurve ──────────────────────────────────────────────────────────────
function BondingCurveSim({ onComplete, onSkip }: SimProps) {
  const [solRaised, setSolRaised] = useState(50);
  const TARGET_SOL = 500;
  const INITIAL_SUPPLY = 1_000_000_000;
  const SOL_PRICE = 180;

  const pct = Math.min(100, (solRaised / TARGET_SOL) * 100);
  const price = ((solRaised / TARGET_SOL) * 0.000069 + 0.000001).toFixed(9);
  const marketCap = (parseFloat(price) * INITIAL_SUPPLY * SOL_PRICE).toFixed(0);
  const isGraduated = solRaised >= TARGET_SOL;

  const steps = [50, 100, 200, 350, 500];

  return (
    <SimShell icon="📈" title="Bonding Curve — pump.fun" subtitle="See how price moves as more SOL flows into a token. Understand why early entry matters.">
      <Card>
        <Text style={s.fieldLabel}>DRAG THE CURVE — SOL RAISED</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {steps.map(v => (
            <TouchableOpacity key={v} onPress={() => setSolRaised(v)} style={[chip.base, solRaised === v && chip.active, { flex: 1, alignItems: 'center' }]}>
              <Text style={[chip.text, solRaised === v && chip.activeText]}>{v} SOL</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginTop: Spacing.md }}>
          <View style={{ height: 12, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' }}>
            <View style={{ height: 12, borderRadius: 99, backgroundColor: isGraduated ? Colors.green : Colors.accent, width: `${pct}%` }} />
          </View>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 4, textAlign: 'right' }}>{pct.toFixed(0)}% to graduation (500 SOL)</Text>
        </View>
        <View style={{ marginTop: Spacing.md, gap: 4 }}>
          <View style={s.row}><Text style={s.rowKey}>SOL raised</Text><Text style={s.rowVal}>{solRaised} SOL (≈${(solRaised * SOL_PRICE).toLocaleString()})</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Token price</Text><Text style={[s.rowVal, { fontWeight: '900', color: Colors.accent }]}>${price}</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Market cap</Text><Text style={[s.rowVal, { fontWeight: '900' }]}>${parseInt(marketCap).toLocaleString()}</Text></View>
          {isGraduated ? (
            <View style={{ padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md, marginTop: Spacing.sm }}>
              <Text style={{ fontWeight: '800', color: Colors.green }}>🎓 GRADUATED! Token migrates to Raydium. Now trades on open market with real LP.</Text>
            </View>
          ) : (
            <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, marginTop: Spacing.sm }}>
              <Text style={{ fontWeight: '700', color: Colors.accent }}>Still on bonding curve. {TARGET_SOL - solRaised} SOL to graduation.</Text>
            </View>
          )}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>HOW THE CURVE WORKS</Text>
        <Text style={s.bullet}>• Formula: price = k × supply_sold² (exponential)</Text>
        <Text style={s.bullet}>• Every buy raises the price for the next buyer</Text>
        <Text style={s.bullet}>• Early buyers at 10 SOL buy at 10× cheaper than at 100 SOL</Text>
        <Text style={s.bullet}>• At 500 SOL (~$69K) it graduates to Raydium with real LP</Text>
        <Text style={s.bullet}>• pump.fun takes 1% fee at graduation</Text>
        <Text style={[s.bullet, { color: Colors.red, fontWeight: '700' }]}>• 98% of tokens never graduate — they die on the curve</Text>
      </Card>

      <PrimaryBtn label="Continue →" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── lpSeed ────────────────────────────────────────────────────────────────────
function LpSeedSim({ onComplete, onSkip }: SimProps) {
  const [tokenAmt, setTokenAmt] = useState('1000000');
  const [solAmt, setSolAmt]     = useState('10');
  const [confirmed, setConfirmed] = useState(false);
  const SOL_PRICE = 180;

  const tokenF = parseFloat(tokenAmt) || 0;
  const solF   = parseFloat(solAmt)   || 0;
  const startPrice = solF > 0 && tokenF > 0 ? (solF * SOL_PRICE / tokenF) : 0;
  const mcap = startPrice * 1_000_000_000;

  return (
    <SimShell icon="💧" title="Seed a Liquidity Pool" subtitle="Set the starting price by choosing how much token vs SOL to deposit.">
      <Card>
        <Text style={s.hint2}>As the token creator, you deposit tokens + SOL into the pool. The ratio you choose sets the starting price. x × y = k — the AMM formula.</Text>
      </Card>
      <Card>
        <Text style={s.fieldLabel}>TOKENS TO DEPOSIT</Text>
        <TextInput style={s.input} value={tokenAmt} onChangeText={setTokenAmt} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <Text style={s.fieldLabel}>SOL TO DEPOSIT (@ $180)</Text>
        <TextInput style={s.input} value={solAmt} onChangeText={setSolAmt} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 }]}>
          <Text style={{ fontWeight: '800' }}>Starting price</Text>
          <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.accent }}>
            ${startPrice > 0 ? startPrice.toFixed(startPrice < 0.01 ? 8 : 4) : '—'}
          </Text>
        </View>
        <View style={s.row}><Text style={s.rowKey}>Implied market cap</Text><Text style={s.rowVal}>${mcap > 0 ? (mcap / 1e6).toFixed(2) + 'M' : '—'}</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Pool total value</Text><Text style={s.rowVal}>${(solF * SOL_PRICE * 2).toFixed(0)}</Text></View>
        <Text style={[s.hint2, { marginTop: Spacing.sm }]}>💡 Less tokens + more SOL = higher starting price. This is why "low float" tokens seem expensive immediately.</Text>
      </Card>
      {!confirmed ? (
        <PrimaryBtn label="Create Pool →" onPress={() => setConfirmed(true)} disabled={tokenF <= 0 || solF <= 0} />
      ) : (
        <>
          <ResultBox correct message={`Pool seeded! Starting price: $${startPrice.toFixed(8)}. The first buyer will push the price up. First seller will push it down. You (LP provider) earn 0.25% of every trade.`} />
          <Card>
            <Text style={s.fieldLabel}>THE CREATOR ADVANTAGE</Text>
            <Text style={s.bullet}>• Creators seed at very low SOL — giving themselves a low cost basis</Text>
            <Text style={s.bullet}>• They hold tokens bought before the pool — position is 10–100×</Text>
            <Text style={s.bullet}>• They earn LP fees on every trade automatically</Text>
            <Text style={[s.bullet, { color: Colors.red }]}>• Warning: if they remove LP liquidity = instant rug</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}


// =============================================================================
// BATCH 4: BASE ISLAND — baseIntro, baseGas, smartWallet, paymaster, miniApp, miniAppBuild
// =============================================================================

// ── baseIntro ─────────────────────────────────────────────────────────────────
function BaseIntroSim({ onComplete, onSkip }: SimProps) {
  const comparisons = [
    { metric: 'Transaction speed', ethereum: '~12 sec', base: '~2 sec', winner: 'base' },
    { metric: 'Average gas fee', ethereum: '$2–$30', base: '$0.01–0.05', winner: 'base' },
    { metric: 'Security source', ethereum: 'Own validators', base: 'Ethereum L1 ✅', winner: 'tie' },
    { metric: 'Ecosystem size', ethereum: '#1 DeFi', base: 'Growing fast', winner: 'eth' },
    { metric: 'Coinbase integration', ethereum: '❌', base: '✅ Native', winner: 'base' },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = 'base';

  return (
    <SimShell icon="🔵" title="What Is Base?" subtitle="Compare Base to Ethereum — understand why it exists and who it's for.">
      <Card>
        {comparisons.map((c, i) => (
          <View key={i} style={[s.row, { paddingVertical: Spacing.sm, borderBottomWidth: i < comparisons.length - 1 ? 1 : 0, borderBottomColor: Colors.border }]}>
            <Text style={[s.rowKey, { flex: 1.2 }]}>{c.metric}</Text>
            <Text style={[{ flex: 1, textAlign: 'center', fontSize: FontSize.xs, color: c.winner === 'eth' ? Colors.green : Colors.textSoft }]}>{c.ethereum}</Text>
            <Text style={[{ flex: 1, textAlign: 'center', fontSize: FontSize.xs, fontWeight: '800', color: c.winner === 'base' ? Colors.green : Colors.textSoft }]}>{c.base}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', paddingTop: Spacing.sm }}>
          <Text style={{ flex: 1.2 }} />
          <Text style={{ flex: 1, textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '700' }}>Ethereum</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800' }}>Base</Text>
        </View>
      </Card>
      <Card>
        <Text style={s.fieldLabel}>QUICK CHECK</Text>
        <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md }}>
          A friend wants to onboard to crypto for the first time. Low fees, easy UX, connected to Coinbase. Which chain?
        </Text>
        {[{ v: 'ethereum', l: 'Ethereum Mainnet' }, { v: 'base', l: 'Base' }, { v: 'solana', l: 'Solana' }].map(({ v, l }) => {
          const isSel = selected === v;
          let bg = Colors.card, border = Colors.border;
          if (checked && isSel && v === correct)  { bg = '#d1fae5'; border = Colors.green; }
          if (checked && isSel && v !== correct)  { bg = '#fee2e2'; border = Colors.red; }
          if (checked && !isSel && v === correct) { bg = '#d1fae5'; border = Colors.green; }
          return (
            <TouchableOpacity key={v} disabled={checked} onPress={() => setSelected(v)} style={[{ padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm, backgroundColor: bg, borderColor: border }]}>
              <Text style={{ fontWeight: '700', color: Colors.text }}>{l}</Text>
            </TouchableOpacity>
          );
        })}
        {checked && <Text style={s.hint2}>💡 Base: built for consumer apps, Coinbase integration, gasless options, and 2-second finality. Perfect onboarding chain.</Text>}
      </Card>
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={!selected} />
        : <PrimaryBtn label="Continue →" onPress={onComplete} />
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── baseGas ───────────────────────────────────────────────────────────────────
function BaseGasSim({ onComplete, onSkip }: SimProps) {
  const txTypes = [
    { name: 'ETH Transfer', ethGas: 21000, ethFeeUsd: 12.50, baseFeeUsd: 0.02 },
    { name: 'Uniswap Swap', ethGas: 150000, ethFeeUsd: 45.00, baseFeeUsd: 0.08 },
    { name: 'NFT Mint',     ethGas: 250000, ethFeeUsd: 78.00, baseFeeUsd: 0.12 },
    { name: 'ERC-20 Transfer', ethGas: 65000, ethFeeUsd: 18.00, baseFeeUsd: 0.03 },
  ];
  const [selected, setSelected] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const tx = txTypes[selected];
  const savings = tx.ethFeeUsd - tx.baseFeeUsd;
  const savingsPct = ((savings / tx.ethFeeUsd) * 100).toFixed(0);

  return (
    <SimShell icon="⛽" title="Base vs Ethereum — Gas Comparison" subtitle="Same transaction, completely different cost. Understand why Base exists.">
      <Card>
        <Text style={s.fieldLabel}>TRANSACTION TYPE</Text>
        {txTypes.map((t, i) => (
          <TouchableOpacity key={i} onPress={() => setSelected(i)} style={[{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
            borderColor: selected === i ? Colors.accent : Colors.border,
            backgroundColor: selected === i ? Colors.accentSoft : Colors.card,
          }]}>
            <Text style={{ fontWeight: '700', color: selected === i ? Colors.accent : Colors.text }}>{t.name}</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{t.ethGas.toLocaleString()} gas</Text>
          </TouchableOpacity>
        ))}
      </Card>
      <Card>
        <Text style={s.fieldLabel}>FEE COMPARISON</Text>
        <View style={{ gap: Spacing.md }}>
          <View style={{ padding: Spacing.md, backgroundColor: '#fff0f0', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '800', color: Colors.red, marginBottom: 4 }}>🔷 Ethereum Mainnet</Text>
            <Text style={{ fontWeight: '900', fontSize: 28, color: Colors.red }}>${tx.ethFeeUsd.toFixed(2)}</Text>
          </View>
          <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '800', color: Colors.accent, marginBottom: 4 }}>🔵 Base</Text>
            <Text style={{ fontWeight: '900', fontSize: 28, color: Colors.accent }}>${tx.baseFeeUsd.toFixed(2)}</Text>
          </View>
          <View style={{ padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '800', color: Colors.green }}>💰 You save: ${savings.toFixed(2)} ({savingsPct}% cheaper on Base)</Text>
          </View>
        </View>
      </Card>
      <Card>
        <Text style={s.fieldLabel}>WHY SO MUCH CHEAPER?</Text>
        <Text style={s.bullet}>• Base batches thousands of txs into one Ethereum settlement</Text>
        <Text style={s.bullet}>• You split the Ethereum gas cost with thousands of others</Text>
        <Text style={s.bullet}>• Execution happens on Base — only data posts to Ethereum</Text>
        <Text style={s.bullet}>• Base uses EIP-4844 blobs for even cheaper data posting</Text>
      </Card>
      {!confirmed
        ? <PrimaryBtn label="Got It →" onPress={() => setConfirmed(true)} />
        : <>
            <ResultBox correct message={`A ${tx.name} costs $${tx.baseFeeUsd.toFixed(2)} on Base vs $${tx.ethFeeUsd.toFixed(2)} on Ethereum — ${savingsPct}% cheaper. Same security, dramatically lower cost.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── smartWallet ───────────────────────────────────────────────────────────────
function SmartWalletSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [passkey, setPasskey] = useState(false);

  return (
    <SimShell icon="🔮" title="Base Smart Wallet — No Seed Phrase" subtitle="Create a wallet with your face or fingerprint. No 12-word phrase. No private key to lose.">
      {step === 0 && (
        <Card>
          <Text style={s.fieldLabel}>TRADITIONAL WALLET PROBLEMS</Text>
          {['12-word seed phrase — write it down or lose everything', 'Private key management — complex for non-technical users', 'Gas fees — need ETH before you can do anything', 'One compromise = everything gone'].map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              <Text style={{ color: Colors.red }}>✗</Text>
              <Text style={{ flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 }}>{p}</Text>
            </View>
          ))}
          <View style={{ marginTop: Spacing.sm, padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md }}>
            <Text style={{ fontWeight: '700', color: Colors.accent }}>Smart Wallets (ERC-4337) solve all of these.</Text>
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 1 — CREATE WITH PASSKEY</Text>
          <Text style={s.hint2}>Instead of a seed phrase, your wallet is secured by a passkey — your biometrics stored on your device (FaceID, fingerprint). Apple/Google never see it.</Text>
          <TouchableOpacity onPress={() => setPasskey(true)} style={{ marginTop: Spacing.md, padding: Spacing.xl, borderRadius: Radius.xl, backgroundColor: passkey ? '#d1fae5' : Colors.accentSoft, alignItems: 'center', borderWidth: 2, borderColor: passkey ? Colors.green : Colors.accent }}>
            <Text style={{ fontSize: 48 }}>{passkey ? '✅' : '👆'}</Text>
            <Text style={{ fontWeight: '800', color: passkey ? Colors.green : Colors.accent, marginTop: Spacing.sm }}>
              {passkey ? 'Passkey Created!' : 'Tap to Create Passkey (FaceID)'}
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 2 — YOUR WALLET IS READY</Text>
          <View style={{ alignItems: 'center', padding: Spacing.md }}>
            <Text style={{ fontSize: 48 }}>🔵</Text>
            <Text style={{ fontWeight: '900', color: Colors.text, marginTop: Spacing.sm }}>base:0xA3f2...1c</Text>
            <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, marginTop: 4 }}>Your Base Smart Wallet</Text>
          </View>
          <View style={s.row}><Text style={s.rowKey}>No seed phrase</Text><Text style={[s.rowVal, { color: Colors.green }]}>✅ None needed</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Secured by</Text><Text style={s.rowVal}>FaceID + Passkey</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Gas</Text><Text style={[s.rowVal, { color: Colors.green }]}>Sponsored (free)</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Recovery</Text><Text style={s.rowVal}>Social guardians + backup</Text></View>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <Text style={s.fieldLabel}>STEP 3 — GASLESS TRANSACTION</Text>
          <Text style={s.hint2}>Watch: you're sending USDC with zero ETH in your wallet. The app's paymaster covers gas.</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Sending</Text><Text style={{ fontWeight: '900', color: Colors.accent }}>10 USDC</Text>
            </View>
            <View style={{ padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '700' }}>Gas fee</Text><Text style={{ fontWeight: '900', color: Colors.green }}>$0.00 (sponsored)</Text>
            </View>
          </View>
        </Card>
      )}

      {step === 4 && (
        <>
          <ResultBox correct message="Smart Wallet created and used! No seed phrase, no ETH for gas, biometric security. This is what mainstream crypto adoption looks like." />
          <Card>
            <Text style={s.fieldLabel}>SMART WALLET SUPERPOWERS</Text>
            <Text style={s.bullet}>• No seed phrase — secured by device passkey</Text>
            <Text style={s.bullet}>• Gasless — apps can sponsor your transactions</Text>
            <Text style={s.bullet}>• Social recovery — guardians can restore access</Text>
            <Text style={s.bullet}>• Batch transactions — do multiple actions in one tx</Text>
            <Text style={s.bullet}>• Spending limits, session keys, automated actions</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      {step < 4 && (
        <PrimaryBtn
          label={['See How Smart Wallets Work →', 'Create Passkey →', 'View My Wallet →', 'Send Gasless →', ''][step]}
          onPress={() => setStep(s => (s + 1) as any)}
          disabled={step === 1 && !passkey}
        />
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── paymaster ─────────────────────────────────────────────────────────────────
function PaymasterSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState<'setup' | 'normal' | 'sponsored' | 'compare'>('setup');
  const [txType, setTxType] = useState('swap');
  const NORMAL_GAS = { swap: 0.08, transfer: 0.02, mint: 0.15 };
  const txLabel = { swap: 'Uniswap Swap', transfer: 'USDC Transfer', mint: 'NFT Mint' };
  const gas = NORMAL_GAS[txType as keyof typeof NORMAL_GAS];

  return (
    <SimShell icon="⛽" title="Base Paymaster — Gasless UX" subtitle="Understand how app developers can pay gas on behalf of their users.">
      {step === 'setup' && (
        <Card>
          <Text style={s.hint2}>Paymaster is a smart contract that pays gas fees on behalf of users. Apps deposit ETH into a paymaster — users transact for free.</Text>
          <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
            {[{ l: 'App charges for gas', icon: '❌', desc: 'Users need ETH to do anything — huge friction' },
              { l: 'App uses Paymaster', icon: '✅', desc: 'Users transact free — app pays from their ETH deposit' }
            ].map(({ l, icon, desc }) => (
              <View key={l} style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', padding: Spacing.md, backgroundColor: icon === '✅' ? '#f0fdf4' : '#fff5f5', borderRadius: Radius.md }}>
                <Text style={{ fontSize: 20 }}>{icon}</Text>
                <View style={{ flex: 1 }}><Text style={{ fontWeight: '800', color: Colors.text }}>{l}</Text><Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>{desc}</Text></View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {step === 'normal' && (
        <Card>
          <Text style={s.fieldLabel}>WITHOUT PAYMASTER (traditional)</Text>
          <Text style={s.hint2}>User wants to do a {txLabel[txType as keyof typeof txLabel]}. They need ETH for gas first.</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            <View style={{ padding: Spacing.md, backgroundColor: '#fff0f0', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: Colors.red }}>User must:</Text>
              <Text style={{ fontSize: FontSize.sm, color: Colors.text, marginTop: 4 }}>1. Buy ETH from a CEX{'\n'}2. Bridge ETH to Base{'\n'}3. Wait for confirmations{'\n'}4. THEN do their transaction</Text>
            </View>
            <View style={s.row}><Text style={s.rowKey}>Gas cost</Text><Text style={[s.rowVal, { color: Colors.red, fontWeight: '900' }]}>${(gas * 3247).toFixed(2)} ({gas} ETH)</Text></View>
            <Text style={s.hint2}>This kills conversion. Most users abandon before step 2.</Text>
          </View>
        </Card>
      )}

      {step === 'sponsored' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>WITH COINBASE PAYMASTER</Text>
            <View style={{ gap: Spacing.sm }}>
              <View style={{ padding: Spacing.md, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
                <Text style={{ fontWeight: '700', color: Colors.green }}>User experience:</Text>
                <Text style={{ fontSize: FontSize.sm, color: Colors.text, marginTop: 4 }}>Open app → Tap action → Done ✅{'\n'}No ETH needed. No friction.</Text>
              </View>
              <View style={s.row}><Text style={s.rowKey}>User pays</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>$0.00</Text></View>
              <View style={s.row}><Text style={s.rowKey}>App pays</Text><Text style={s.rowVal}>${(gas * 3247).toFixed(2)} (from paymaster balance)</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Coinbase free gas credits</Text><Text style={[s.rowVal, { color: Colors.green }]}>$15/month (new apps)</Text></View>
            </View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>HOW THE PAYMASTER CONTRACT WORKS</Text>
            <Text style={s.bullet}>1. App deposits ETH into Paymaster contract</Text>
            <Text style={s.bullet}>2. User submits tx — paymaster validates user is whitelisted</Text>
            <Text style={s.bullet}>3. Bundler submits tx with paymaster signature</Text>
            <Text style={s.bullet}>4. Paymaster pays gas from its ETH balance</Text>
            <Text style={s.bullet}>5. User sees: "Transaction successful" — no gas prompt</Text>
          </Card>
        </>
      )}

      {step === 'compare' && (
        <>
          <ResultBox correct message="Paymaster unlocks true consumer UX. The app absorbs gas costs as a customer acquisition cost — same as a company covering Stripe fees." />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}

      {step !== 'compare' && (
        <PrimaryBtn
          label={step === 'setup' ? 'See Without Paymaster →' : step === 'normal' ? 'See With Paymaster →' : 'Understood →'}
          onPress={() => setStep(step === 'setup' ? 'normal' : step === 'normal' ? 'sponsored' : 'compare')}
        />
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── miniApp ───────────────────────────────────────────────────────────────────
function MiniAppSim({ onComplete, onSkip }: SimProps) {
  const apps = [
    { name: 'Zora', category: 'NFT Minting', users: '2M+', revenue: 'Mint fees', icon: '🎨' },
    { name: 'Paragraph', category: 'Publishing', users: '500K+', revenue: 'Subscription + tips', icon: '✍️' },
    { name: 'Rodeo', category: 'Social Trading', users: '300K+', revenue: 'Copy trade fees', icon: '🤠' },
    { name: 'Warpcast', category: 'Social (Farcaster)', users: '1M+', revenue: 'Premium + warps', icon: '🟣' },
  ];
  const [selected, setSelected] = useState<number | null>(null);
  const [step, setStep] = useState<'browse' | 'open' | 'transact' | 'done'>('browse');
  const app = selected !== null ? apps[selected] : null;

  return (
    <SimShell icon="📱" title="Base Mini Apps" subtitle="Explore how mini apps give crypto superpowers to Coinbase's 110M+ users.">
      {step === 'browse' && (
        <>
          <Card>
            <Text style={s.hint2}>Base Mini Apps live inside Coinbase Wallet and the Base app. 110M+ Coinbase users can access onchain apps without leaving the app.</Text>
          </Card>
          <Text style={[s.fieldLabel, { marginTop: 0 }]}>FEATURED MINI APPS</Text>
          {apps.map((app, i) => (
            <TouchableOpacity key={i} onPress={() => setSelected(i)} style={[card.box, Shadow.sm, {
              flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
              borderColor: selected === i ? Colors.accent : Colors.border
            }]}>
              <Text style={{ fontSize: 32 }}>{app.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '900', color: Colors.text }}>{app.name}</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft }}>{app.category} · {app.users} users</Text>
                <Text style={{ fontSize: FontSize.xs, color: Colors.green, marginTop: 2 }}>Revenue: {app.revenue}</Text>
              </View>
              {selected === i && <Text style={{ color: Colors.accent }}>✓</Text>}
            </TouchableOpacity>
          ))}
          <PrimaryBtn label="Open Selected App →" onPress={() => setStep('open')} disabled={selected === null} />
        </>
      )}

      {step === 'open' && app && (
        <>
          <Card>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>{app.icon}</Text>
            <Text style={{ fontWeight: '900', fontSize: FontSize.xxl, textAlign: 'center', color: Colors.text }}>{app.name}</Text>
            <Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: 4 }}>{app.category}</Text>
            <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md }} />
            <View style={s.row}><Text style={s.rowKey}>Wallet auto-connected</Text><Text style={[s.rowVal, { color: Colors.green }]}>✅ Instant</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Gas</Text><Text style={[s.rowVal, { color: Colors.green }]}>Sponsored</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Sign-in</Text><Text style={[s.rowVal, { color: Colors.green }]}>No password</Text></View>
          </Card>
          <PrimaryBtn label="Complete an Action →" onPress={() => setStep('transact')} />
        </>
      )}

      {step === 'transact' && app && (
        <>
          <Card>
            <Text style={s.fieldLabel}>ACTION IN {app.name.toUpperCase()}</Text>
            <Text style={{ fontWeight: '700', color: Colors.text, fontSize: FontSize.md, marginBottom: Spacing.md }}>
              {app.category === 'NFT Minting' ? 'Mint a piece for 0.001 ETH' :
               app.category === 'Publishing' ? 'Tip the author 5 USDC' :
               app.category === 'Social Trading' ? 'Copy a top trader for free' :
               'Tip a cast with 1 USDC'}
            </Text>
            <View style={s.row}><Text style={s.rowKey}>Gas cost</Text><Text style={[s.rowVal, { color: Colors.green }]}>$0 (sponsored)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Confirmation required</Text><Text style={s.rowVal}>1 tap</Text></View>
          </Card>
          <PrimaryBtn label="Confirm →" onPress={() => setStep('done')} />
        </>
      )}

      {step === 'done' && (
        <>
          <ResultBox correct message={`Action complete in ${app?.name}! Coinbase's 110M users can access this with zero friction — that's the Base distribution advantage.`} />
          <Card>
            <Text style={s.fieldLabel}>WHY BASE MINI APPS MATTER</Text>
            <Text style={s.bullet}>• 110M+ Coinbase users = massive built-in audience</Text>
            <Text style={s.bullet}>• Wallet pre-connected — no onboarding friction</Text>
            <Text style={s.bullet}>• Gasless options make it feel like a regular app</Text>
            <Text style={s.bullet}>• Featured placement → viral growth for quality apps</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── miniAppBuild ──────────────────────────────────────────────────────────────
function MiniAppBuildSim({ onComplete, onSkip }: SimProps) {
  const requirements = [
    { id: 'manifest', label: 'farcaster.json manifest at /.well-known/', critical: true, done: false },
    { id: 'sdk', label: '@farcaster/miniapp-sdk integrated', critical: true, done: false },
    { id: 'ready', label: 'sdk.actions.ready() called on load', critical: true, done: false },
    { id: 'load', label: '3-second load time or under', critical: true, done: false },
    { id: 'touch', label: '44px minimum touch targets', critical: false, done: false },
    { id: 'theme', label: 'Light + dark mode support', critical: false, done: false },
    { id: 'nav', label: 'Bottom navigation bar', critical: false, done: false },
    { id: 'avatar', label: 'User avatar shown (no 0x address)', critical: false, done: false },
    { id: 'payment', label: 'eth_sendTransaction payment flow', critical: false, done: false },
  ];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const criticalDone = requirements.filter(r => r.critical).every(r => checked.has(r.id));
  const totalDone    = requirements.filter(r => checked.has(r.id)).length;
  const score        = Math.round((totalDone / requirements.length) * 100);
  const eligible     = criticalDone && totalDone >= 7;

  const toggle = (id: string) => !submitted && setChecked(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  return (
    <SimShell icon="🛠️" title="Base Mini App Checklist" subtitle="Check off every requirement before submitting for Featured placement.">
      <Text style={s.hint2}>Featured Base mini apps get prominent placement and Coinbase promotion. Complete ALL critical items and most recommended ones.</Text>
      {requirements.map(r => {
        const isDone = checked.has(r.id);
        return (
          <TouchableOpacity key={r.id} onPress={() => toggle(r.id)} style={[card.box, Shadow.sm, {
            flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
            borderColor: isDone ? Colors.green : r.critical ? Colors.red : Colors.border
          }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: isDone ? '800' : '600', color: Colors.text, fontSize: FontSize.sm, lineHeight: 18 }}>{r.label}</Text>
              {r.critical && <View style={{ backgroundColor: '#fee2e2', borderRadius: 4, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 1, marginTop: 2 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.red }}>REQUIRED</Text>
              </View>}
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: isDone ? Colors.green : Colors.border, backgroundColor: isDone ? '#d1fae5' : 'transparent' }}>
              {isDone && <Text style={{ color: Colors.green, fontWeight: '900' }}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={[card.box, { borderColor: eligible ? Colors.green : Colors.border }]}>
        <Text style={[s.fieldLabel, { color: eligible ? Colors.green : Colors.textSoft }]}>SUBMISSION READINESS: {score}%</Text>
        <View style={{ height: 8, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' }}>
          <View style={{ height: 8, borderRadius: 99, backgroundColor: eligible ? Colors.green : Colors.accent, width: `${score}%` }} />
        </View>
        {!criticalDone && <Text style={{ color: Colors.red, fontSize: FontSize.xs, marginTop: 4, fontWeight: '700' }}>Complete all REQUIRED items first</Text>}
      </View>
      {!submitted
        ? <PrimaryBtn label="Submit for Review →" onPress={() => setSubmitted(true)} disabled={!eligible} />
        : <>
            <ResultBox correct={eligible} message={eligible ? 'Submitted for Featured review! Coinbase reviews within 5 business days. Quality apps get boosted to 110M+ users.' : 'Not eligible yet. Complete all required items and at least 7 total.'} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}


// =============================================================================
// BATCH 5: BNB CHAIN ISLAND
// =============================================================================

// ── bnbOverview ───────────────────────────────────────────────────────────────
function BnbOverviewSim({ onComplete, onSkip }: SimProps) {
  const uses = [
    { id: 'gas',      label: 'Pay gas on BNB Chain / opBNB', points: true },
    { id: 'fee',      label: '25% trading fee discount on Binance CEX', points: true },
    { id: 'launch',   label: 'Stake for Launchpool access (new token farms)', points: true },
    { id: 'burn',     label: 'Quarterly auto-burn reduces supply', points: true },
    { id: 'mining',   label: 'Mine BNB with GPU (like Bitcoin)', points: false },
    { id: 'ifo',      label: 'IFO participation on PancakeSwap', points: true },
  ];
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const correct = uses.filter(u => u.points).map(u => u.id);
  const score = Object.entries(answers).filter(([id, v]) => v === uses.find(u => u.id === id)!.points).length;
  const passed = score >= 5;

  return (
    <SimShell icon="🟡" title="BNB Token — Real Utility Quiz" subtitle="BNB has more utility than almost any token. Identify the real use cases.">
      <Text style={s.hint2}>BNB powers the entire Binance ecosystem. Some options below are real utility — one is fake. Mark each TRUE or FALSE.</Text>
      {uses.map(u => {
        const chosen = answers[u.id];
        const isCorrect = chosen === u.points;
        let bg = Colors.card, border = Colors.border;
        if (checked && chosen !== undefined) { bg = isCorrect ? '#d1fae5' : '#fee2e2'; border = isCorrect ? Colors.green : Colors.red; }
        return (
          <Card key={u.id} style={{ borderColor: border, backgroundColor: bg }}>
            <Text style={{ fontWeight: '700', color: Colors.text, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md }}>{u.label}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {([{ v: true, l: '✅ Real' }, { v: false, l: '❌ Fake' }] as const).map(({ v, l }) => (
                <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [u.id]: v }))}
                  style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                    borderColor: answers[u.id] === v ? (v ? Colors.green : Colors.red) : Colors.border,
                    backgroundColor: answers[u.id] === v ? (v ? '#d1fae5' : '#fee2e2') : Colors.card }}>
                  <Text style={{ fontWeight: '700', fontSize: FontSize.sm }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>
              {!u.points ? '❌ BNB is not mineable. It\'s a pre-minted token with quarterly burns reducing supply.' :
               u.id === 'burn' ? '✅ Binance burns BNB quarterly until 100M (half of total supply) is burned.' :
               u.id === 'fee' ? '✅ Holding BNB gives 25% discount on all Binance CEX trading fees.' :
               u.id === 'launch' ? '✅ BNB + FDUSD stakers earn new token allocations before CEX listing.' :
               '✅ Correct use case.'}
            </Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < uses.length} />
        : <>
            <ResultBox correct={passed} message={passed ? `${score}/6 — Strong BNB knowledge. BNB is one of the most utility-dense tokens in crypto.` : `${score}/6 — BNB earns fee discounts, powers BSC gas, enables Launchpool, and burns quarterly. It\'s NOT mineable.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── bnbPancake ────────────────────────────────────────────────────────────────
function BnbPancakeSim({ onComplete, onSkip }: SimProps) {
  const [mode, setMode] = useState<'swap' | 'farm' | 'pool'>('swap');
  const [amount, setAmount] = useState('100');
  const [confirmed, setConfirmed] = useState(false);

  const farmApy = 42.3;
  const poolApy = 18.7;
  const amtF = parseFloat(amount) || 0;
  const dailyFarm = (amtF * farmApy / 100 / 365).toFixed(4);
  const dailyPool = (amtF * poolApy / 100 / 365).toFixed(4);

  return (
    <SimShell icon="🥞" title="PancakeSwap — DEX, Farms & Pools" subtitle="The BNB Chain's #1 DEX. Practice swapping, farming yield, and staking CAKE.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([
          { k: 'swap', l: '🔄 Swap' },
          { k: 'farm', l: '🌾 Farm' },
          { k: 'pool', l: '🍰 Syrup Pool' },
        ] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => { setMode(k); setConfirmed(false); }} style={[chip.base, mode === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, mode === k && chip.activeText]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'swap' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>SWAP BNB → CAKE</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} placeholder="BNB amount" />
            <View style={s.row}><Text style={s.rowKey}>Rate</Text><Text style={s.rowVal}>1 BNB = ~64 CAKE</Text></View>
            <View style={s.row}><Text style={s.rowKey}>You receive</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>~{(amtF * 64).toFixed(0)} CAKE</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Fee (0.25%)</Text><Text style={s.rowVal}>{(amtF * 0.0025).toFixed(4)} BNB</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Gas cost</Text><Text style={[s.rowVal, { color: Colors.green }]}>~$0.10 (BNB Chain)</Text></View>
          </Card>
          {!confirmed
            ? <PrimaryBtn label={`Swap ${amount} BNB →`} onPress={() => setConfirmed(true)} disabled={amtF <= 0} />
            : <>
                <ResultBox correct message={`Swapped! PancakeSwap V3 uses concentrated liquidity — LPs earn more fees from the same capital than V2. BNB Chain gas makes this viable for small trades.`} />
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
          }
        </>
      )}

      {mode === 'farm' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>CAKE-BNB LP FARM</Text>
            <Text style={s.hint2}>Add CAKE + BNB liquidity, receive LP tokens, stake them in the farm to earn CAKE rewards on top of trading fees.</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="LP token value (USD)" placeholderTextColor={Colors.textMuted} />
            <View style={s.row}><Text style={s.rowKey}>Farm APR</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{farmApy}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Trading fee APR</Text><Text style={[s.rowVal, { color: Colors.green }]}>+~12%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Daily CAKE earned</Text><Text style={[s.rowVal, { color: Colors.green }]}>~${dailyFarm}</Text></View>
            <Text style={{ fontSize: FontSize.xs, color: '#92400e', marginTop: Spacing.sm }}>⚠️ IL risk: if CAKE/BNB ratio changes significantly, you may earn less than just holding.</Text>
          </Card>
          {!confirmed
            ? <PrimaryBtn label="Stake LP Tokens →" onPress={() => setConfirmed(true)} disabled={amtF <= 0} />
            : <>
                <ResultBox correct message={`Farming! You earn ${farmApy}% APR in CAKE + trading fees. CAKE auto-compounds if you use the auto-compound vault.`} />
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
          }
        </>
      )}

      {mode === 'pool' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>SYRUP POOL — STAKE CAKE, EARN PARTNER TOKENS</Text>
            <Text style={s.hint2}>Projects pay PancakeSwap to distribute their tokens to CAKE stakers. You stake CAKE, earn new project tokens.</Text>
            <View style={{ padding: Spacing.md, backgroundColor: '#fffbeb', borderRadius: Radius.md, marginBottom: Spacing.md }}>
              <Text style={{ fontWeight: '800', color: '#92400e' }}>🍬 Featured Pool: Stake CAKE → Earn XYZ token</Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>APR: {poolApy}% · Duration: 60 days · Total reward: 1,000,000 XYZ</Text>
            </View>
            <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="CAKE to stake (USD)" placeholderTextColor={Colors.textMuted} />
            <View style={s.row}><Text style={s.rowKey}>APR</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{poolApy}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Daily XYZ earned</Text><Text style={[s.rowVal, { color: Colors.green }]}>~${dailyPool}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Lock period</Text><Text style={s.rowVal}>Flexible (withdraw anytime)</Text></View>
          </Card>
          {!confirmed
            ? <PrimaryBtn label="Stake CAKE →" onPress={() => setConfirmed(true)} disabled={amtF <= 0} />
            : <>
                <ResultBox correct message={`Staked! You now earn XYZ tokens daily. Syrup pools are how new projects bootstrap distribution — similar to a Launchpool but on PancakeSwap.`} />
                <PrimaryBtn label="Continue →" onPress={onComplete} />
              </>
          }
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── bnbLaunch ─────────────────────────────────────────────────────────────────
function BnbLaunchSim({ onComplete, onSkip }: SimProps) {
  const [bnbStaked, setBnbStaked] = useState('1');
  const [daysLeft, setDaysLeft] = useState(7);
  const [claimed, setClaimed] = useState(false);

  const BNB_PRICE = 320;
  const bnbF = parseFloat(bnbStaked) || 0;
  const POOL_BNB = 500000;
  const TOKEN_POOL = 10_000_000;
  const dailyReward = (bnbF / POOL_BNB * TOKEN_POOL / 30).toFixed(2);
  const totalReward = (parseFloat(dailyReward) * (30 - daysLeft)).toFixed(2);

  return (
    <SimShell icon="🚀" title="Binance Launchpool — Farm Before Listing" subtitle="Stake BNB or FDUSD to earn new tokens before they trade on Binance.">
      <Card>
        <Text style={s.fieldLabel}>ACTIVE LAUNCHPOOL</Text>
        <View style={{ padding: Spacing.md, backgroundColor: '#fffbeb', borderRadius: Radius.md, marginBottom: Spacing.md }}>
          <Text style={{ fontWeight: '900', fontSize: FontSize.md, color: Colors.text }}>⭐ NEWTOKEN (NTK)</Text>
          <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>Lists on Binance in {daysLeft} days · Total pool: 10M NTK</Text>
        </View>
        <Text style={s.fieldLabel}>BNB TO STAKE</Text>
        <TextInput style={s.input} value={bnbStaked} onChangeText={setBnbStaked} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <View style={s.row}><Text style={s.rowKey}>Your pool share</Text><Text style={s.rowVal}>{bnbF > 0 ? ((bnbF / POOL_BNB) * 100).toFixed(4) : '0'}%</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Daily NTK earned</Text><Text style={[s.rowVal, { color: Colors.green }]}>~{dailyReward} NTK</Text></View>
        <View style={s.row}><Text style={s.rowKey}>BNB still yours</Text><Text style={[s.rowVal, { color: Colors.green }]}>✅ Unstake anytime</Text></View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>DAYS ALREADY FARMING</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {[0, 7, 15, 22, 30].map(d => (
            <TouchableOpacity key={d} onPress={() => setDaysLeft(30 - d)} style={[chip.base, (30 - daysLeft) === d && chip.active, { flex: 1, alignItems: 'center' }]}>
              <Text style={[chip.text, (30 - daysLeft) === d && chip.activeText]}>Day {d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[s.row, { marginTop: Spacing.md }]}><Text style={s.rowKey}>NTK earned so far</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{totalReward} NTK</Text></View>
        <Text style={s.hint2}>💡 The earlier you stake, the more days you farm. BNB is never locked — you can withdraw mid-farm, just stop earning.</Text>
      </Card>

      {!claimed ? (
        <PrimaryBtn label="Claim NTK Rewards →" onPress={() => setClaimed(true)} disabled={parseFloat(totalReward) <= 0} />
      ) : (
        <>
          <ResultBox correct message={`Claimed ${totalReward} NTK! At listing, Launchpool farmers often sell immediately (creating initial price pressure) or hold for CEX pump. Both strategies are used.`} />
          <Card>
            <Text style={s.fieldLabel}>LAUNCHPOOL STRATEGY</Text>
            <Text style={s.bullet}>• Stake early on day 1 — maximize farming window</Text>
            <Text style={s.bullet}>• Monitor listing price vs implied farm value</Text>
            <Text style={s.bullet}>• Most farms have sell pressure on listing day</Text>
            <Text style={s.bullet}>• BNB + FDUSD pools run simultaneously — pick higher APR</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── bnbAlpha ──────────────────────────────────────────────────────────────────
function BnbAlphaSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    { name: 'ALPHA1', age: '2h', volume: '$1.2M', holders: 842, binanceScore: 72, category: 'DeFi', listed: false, verdict: 'watch' },
    { name: 'ALPHA2', age: '6h', volume: '$340K', holders: 234, binanceScore: 45, category: 'Gaming', listed: false, verdict: 'skip' },
    { name: 'ALPHA3', age: '1d', volume: '$8.9M', holders: 4200, binanceScore: 89, category: 'AI/Crypto', listed: true, verdict: 'watch' },
  ];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = tokens.filter((t, i) => answers[i] === t.verdict).length;

  return (
    <SimShell icon="🔭" title="Binance Alpha — Early Token Discovery" subtitle="Alpha shows pre-listing tokens gaining traction. Learn to filter signal from noise.">
      <Text style={s.hint2}>Binance Alpha surfaces tokens gaining volume and holder growth before they get listed on Binance. High Alpha score = Binance is watching it.</Text>
      {tokens.map((t, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === t.verdict;
        let bg = Colors.card, border = Colors.border;
        if (checked && chosen) { bg = isCorrect ? '#d1fae5' : '#fee2e2'; border = isCorrect ? Colors.green : Colors.red; }
        return (
          <Card key={i} style={{ borderColor: border, backgroundColor: bg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm }}>
              <Text style={{ fontWeight: '900', fontSize: FontSize.lg, color: Colors.text }}>{t.name}</Text>
              <View style={{ padding: Spacing.xs, backgroundColor: '#f0f4ff', borderRadius: Radius.sm }}>
                <Text style={{ fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent }}>Alpha Score: {t.binanceScore}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md }}>
              {[['Age', t.age], ['Volume', t.volume], ['Holders', String(t.holders)], ['Category', t.category]].map(([k, v]) => (
                <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
                </View>
              ))}
              {t.listed && <View style={{ backgroundColor: '#d1fae5', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.green }}>Now Listed ✅</Text>
              </View>}
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[{ v: 'watch', l: '👀 Watchlist' }, { v: 'buy', l: '💰 Buy Now' }, { v: 'skip', l: '🚫 Skip' }].map(({ v, l }) => (
                <TouchableOpacity key={v} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))} style={{
                  flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                  borderColor: answers[i] === v ? Colors.accent : Colors.border,
                  backgroundColor: answers[i] === v ? Colors.accentSoft : Colors.card,
                }}>
                  <Text style={{ fontWeight: '700', fontSize: 10, color: answers[i] === v ? Colors.accent : Colors.text, textAlign: 'center' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>
              {i === 0 ? '💡 High score, strong volume for 2h old token. Watchlist — too early to buy, monitor momentum.' :
               i === 1 ? '💡 Low score + low holders. Gaming tokens need traction. Skip unless you have strong thesis.' :
               '💡 Score 89, already listed — confirms Alpha is a real pre-listing signal. Watchlist paid off.'}
            </Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <>
            <ResultBox correct={score >= 2} message={`${score}/3 — Alpha score 70+ with growing volume and holders is the signal to watch. Never FOMO buy immediately — watchlist first.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── bnbEarn ───────────────────────────────────────────────────────────────────
function BnbEarnSim({ onComplete, onSkip }: SimProps) {
  const [product, setProduct] = useState<'flexible' | 'locked' | 'dual'>('flexible');
  const [asset, setAsset] = useState('USDT');
  const [amount, setAmount] = useState('1000');
  const [lockDays, setLockDays] = useState(30);
  const [confirmed, setConfirmed] = useState(false);

  const flexRates: Record<string, number> = { USDT: 4.5, BNB: 1.8, BTC: 0.9, ETH: 2.1 };
  const lockedRates: Record<string, Record<number, number>> = {
    USDT: { 7: 5.2, 30: 6.8, 90: 8.1, 120: 9.3 },
    BNB:  { 7: 2.1, 30: 3.4, 90: 4.8, 120: 5.6 },
    BTC:  { 7: 1.2, 30: 2.1, 90: 3.3, 120: 4.0 },
    ETH:  { 7: 2.4, 30: 3.8, 90: 5.1, 120: 6.0 },
  };

  const amtF = parseFloat(amount) || 0;
  const flexApy  = flexRates[asset] || 4.5;
  const lockedApy = lockedRates[asset]?.[lockDays] || 6.8;
  const flexDaily  = (amtF * flexApy / 100 / 365).toFixed(4);
  const lockedEarn = (amtF * lockedApy / 100 * lockDays / 365).toFixed(4);
  const dualTarget = asset === 'BNB' ? 340 : 1.02;

  return (
    <SimShell icon="💰" title="Binance Earn — Choose Your Yield" subtitle="Compare Flexible vs Locked vs Dual Investment — pick the right product for your risk.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([
          { k: 'flexible', l: '💧 Flexible' },
          { k: 'locked',   l: '🔒 Locked' },
          { k: 'dual',     l: '🎯 Dual' },
        ] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => { setProduct(k); setConfirmed(false); }} style={[chip.base, product === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, product === k && chip.activeText]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card>
        <Text style={s.fieldLabel}>ASSET</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
          {['USDT', 'BNB', 'BTC', 'ETH'].map(a => (
            <TouchableOpacity key={a} onPress={() => setAsset(a)} style={[chip.base, asset === a && chip.active, { flex: 1, alignItems: 'center' }]}>
              <Text style={[chip.text, asset === a && chip.activeText]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.fieldLabel}>AMOUNT</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />

        {product === 'flexible' && (
          <>
            <View style={s.row}><Text style={s.rowKey}>APY</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{flexApy}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Daily interest</Text><Text style={[s.rowVal, { color: Colors.green }]}>${flexDaily}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Withdraw anytime</Text><Text style={[s.rowVal, { color: Colors.green }]}>✅ No lock</Text></View>
          </>
        )}

        {product === 'locked' && (
          <>
            <Text style={s.fieldLabel}>LOCK PERIOD</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[7, 30, 90, 120].map(d => (
                <TouchableOpacity key={d} onPress={() => setLockDays(d)} style={[chip.base, lockDays === d && chip.active, { flex: 1, alignItems: 'center' }]}>
                  <Text style={[chip.text, lockDays === d && chip.activeText]}>{d}d</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.row, { marginTop: Spacing.md }]}><Text style={s.rowKey}>APY</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{lockedApy}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>You earn (locked)</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>${lockedEarn} {asset}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Early withdrawal</Text><Text style={[s.rowVal, { color: Colors.red }]}>❌ Forfeit all interest</Text></View>
          </>
        )}

        {product === 'dual' && (
          <>
            <Text style={s.hint2}>Dual Investment: earn enhanced yield BUT at expiry, Binance may convert your asset at a preset strike price depending on market movement.</Text>
            <View style={{ padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md, marginTop: Spacing.sm }}>
              <Text style={{ fontWeight: '700', color: '#92400e' }}>⚠️ Risk: you may receive the other asset at expiry. If BNB falls below strike, you receive BNB instead of USDT.</Text>
            </View>
            <View style={[s.row, { marginTop: Spacing.md }]}><Text style={s.rowKey}>APY (enhanced)</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>22–45%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Strike price ({asset})</Text><Text style={s.rowVal}>${dualTarget}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Duration</Text><Text style={s.rowVal}>1–7 days</Text></View>
          </>
        )}
      </Card>

      {!confirmed
        ? <PrimaryBtn label={`Subscribe ${product.charAt(0).toUpperCase() + product.slice(1)} →`} onPress={() => setConfirmed(true)} disabled={amtF <= 0} />
        : <>
            <ResultBox correct message={
              product === 'flexible' ? `Earning ${flexApy}% APY. Interest paid daily. Withdraw anytime — ideal for funds you might need.` :
              product === 'locked' ? `Locked for ${lockDays} days at ${lockedApy}% APY. You'll earn $${lockedEarn} at maturity. Do NOT withdraw early.` :
              `Dual Investment active. If price stays above strike, you earn enhanced APY in USDT. If it falls, you receive more BNB at a discount. High risk, high reward.`
            } />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── bnbStaking ────────────────────────────────────────────────────────────────
function BnbStakingSim({ onComplete, onSkip }: SimProps) {
  const [method, setMethod] = useState<'native' | 'lista'>('native');
  const [amount, setAmount] = useState('10');
  const [confirmed, setConfirmed] = useState(false);
  const BNB_PRICE = 320;
  const amtF = parseFloat(amount) || 0;
  const nativeApy  = 4.2;
  const listaApy   = 4.8;
  const nativeYearly = (amtF * nativeApy / 100).toFixed(4);
  const listaYearly  = (amtF * listaApy / 100).toFixed(4);
  const listaUsd = (parseFloat(listaYearly) * BNB_PRICE).toFixed(2);

  return (
    <SimShell icon="🟡" title="BNB Staking — Native vs Liquid" subtitle="Earn yield on BNB without selling. Compare native delegation vs Lista liquid staking.">
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
        {([{ k: 'native', l: '🏛️ Native Staking' }, { k: 'lista', l: '💧 Lista (slisBNB)' }] as const).map(({ k, l }) => (
          <TouchableOpacity key={k} onPress={() => { setMethod(k); setConfirmed(false); }} style={[chip.base, method === k && chip.active, { flex: 1, alignItems: 'center' }]}>
            <Text style={[chip.text, method === k && chip.activeText]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card>
        <Text style={s.fieldLabel}>BNB TO STAKE</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />

        {method === 'native' && (
          <>
            <View style={s.row}><Text style={s.rowKey}>APY</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{nativeApy}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Annual rewards</Text><Text style={[s.rowVal, { color: Colors.green }]}>+{nativeYearly} BNB (${(parseFloat(nativeYearly) * BNB_PRICE).toFixed(2)})</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Delegation to</Text><Text style={s.rowVal}>Validator node on BSC</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Unbonding period</Text><Text style={[s.rowVal, { color: '#f59e0b' }]}>7 days</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Liquid token</Text><Text style={[s.rowVal, { color: Colors.red }]}>❌ Locked during stake</Text></View>
            <Text style={s.hint2}>✅ Simplest option. Delegate to a validator via BNB Chain staking portal. 7-day wait to unstake.</Text>
          </>
        )}

        {method === 'lista' && (
          <>
            <View style={s.row}><Text style={s.rowKey}>APY</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>{listaApy}%</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Annual rewards</Text><Text style={[s.rowVal, { color: Colors.green }]}>+{listaYearly} BNB (+${listaUsd})</Text></View>
            <View style={s.row}><Text style={s.rowKey}>You receive</Text><Text style={[s.rowVal, { color: Colors.accent }]}>slisBNB (liquid token)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Use slisBNB for</Text><Text style={s.rowVal}>DeFi collateral, LP farming</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Instant exit</Text><Text style={[s.rowVal, { color: Colors.green }]}>✅ Sell slisBNB on DEX</Text></View>
            <Text style={s.hint2}>💡 slisBNB = liquid staked BNB. Use it as Aave collateral while still earning staking rewards — double yield.</Text>
          </>
        )}
      </Card>

      {!confirmed
        ? <PrimaryBtn label={`Stake ${amount} BNB via ${method === 'native' ? 'Native Delegation' : 'Lista DAO'} →`} onPress={() => setConfirmed(true)} disabled={amtF < 1} />
        : <>
            <ResultBox correct message={method === 'native'
              ? `Delegated! ${amtF} BNB earning ${nativeApy}% APY. Simple and safe — best for long-term holders who don't need liquidity.`
              : `Staked! You received ${(amtF * 0.998).toFixed(3)} slisBNB. Use it in Venus or Thena for additional yield while staking rewards accumulate.`
            } />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}


// =============================================================================
// BATCH 6: SOLANA ISLAND
// =============================================================================

// ── solanaOverview ────────────────────────────────────────────────────────────
function SolanaOverviewSim({ onComplete, onSkip }: SimProps) {
  const claims = [
    { text: 'Solana processes ~65,000 transactions per second', correct: true, explanation: 'Correct. Theoretical max is 65K TPS using parallel transaction processing (Sealevel).' },
    { text: 'Solana uses Proof of Work like Bitcoin', correct: false, explanation: 'False. Solana uses Proof of Stake + Proof of History — a verifiable timestamp mechanism, not mining.' },
    { text: 'Solana block time is ~400 milliseconds', correct: true, explanation: 'Correct. ~400ms blocks vs ~12 seconds on Ethereum. Near real-time finality.' },
    { text: 'Solana had zero network outages in 2021–2023', correct: false, explanation: 'False. Solana had ~9 significant outages between 2021–2023 due to congestion and bugs. Uptime is improving but this is a known risk.' },
    { text: 'Solana fees are typically below $0.001 per transaction', correct: true, explanation: 'Correct. Base fee is 5,000 lamports (~$0.001). Even during peak periods, fees rarely exceed a few cents.' },
  ];
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = useState(false);
  const score = claims.filter((c, i) => answers[i] === c.correct).length;
  const passed = score >= 4;

  return (
    <SimShell icon="◎" title="Solana — True or False?" subtitle="Separate Solana facts from myths before going deeper into the ecosystem.">
      {claims.map((c, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === c.correct;
        let bg = Colors.card, border = Colors.border;
        if (checked && chosen !== undefined) { bg = isCorrect ? '#d1fae5' : '#fee2e2'; border = isCorrect ? Colors.green : Colors.red; }
        return (
          <Card key={i} style={{ borderColor: border, backgroundColor: bg }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{c.text}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {([{ v: true, l: '✅ True' }, { v: false, l: '❌ False' }] as const).map(({ v, l }) => {
                const isCh = chosen === v;
                let itemBg = Colors.card, itemBorder = Colors.border;
                if (checked && isCh && isCorrect)       { itemBg = '#d1fae5'; itemBorder = Colors.green; }
                if (checked && isCh && !isCorrect)      { itemBg = '#fee2e2'; itemBorder = Colors.red; }
                if (checked && !isCh && v === c.correct){ itemBg = '#d1fae5'; itemBorder = Colors.green; }
                return (
                  <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: v }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: itemBg, borderColor: itemBorder, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {c.explanation}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < claims.length} />
        : <>
            <ResultBox correct={passed} message={passed ? `${score}/5 — Solid Solana foundation. Speed + low fees come with trade-offs: uptime history and validator concentration.` : `${score}/5 — Key facts: 65K TPS, PoS+PoH, 400ms blocks, sub-$0.001 fees. But outages happened.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── solanaPump ────────────────────────────────────────────────────────────────
function SolanaPumpSim({ onComplete, onSkip }: SimProps) {
  const [tokenName, setTokenName] = useState('');
  const [ticker, setTicker] = useState('');
  const [desc, setDesc] = useState('');
  const [step, setStep] = useState<'create' | 'launch' | 'curve' | 'result'>('create');
  const [buys, setBuys] = useState(0);

  const CREATION_FEE = 0.02; // SOL
  const pct = Math.min(100, (buys / 20) * 100);
  const marketCap = buys * 3000;
  const price = buys > 0 ? (0.000001 * Math.pow(1.05, buys)).toFixed(9) : '0.000001';
  const graduated = buys >= 20;

  const handleBuy = () => {
    if (buys < 25) setBuys(b => b + 1);
  };

  return (
    <SimShell icon="🎰" title="Launch on pump.fun" subtitle="Create and launch a memecoin in 30 seconds — then watch the bonding curve.">
      {step === 'create' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>TOKEN NAME</Text>
            <TextInput style={s.input} value={tokenName} onChangeText={setTokenName} placeholder="e.g. DogeOnSteroids" placeholderTextColor={Colors.textMuted} />
            <Text style={s.fieldLabel}>TICKER</Text>
            <TextInput style={s.input} value={ticker} onChangeText={t => setTicker(t.toUpperCase().slice(0, 8))} placeholder="e.g. DOS" placeholderTextColor={Colors.textMuted} />
            <Text style={s.fieldLabel}>DESCRIPTION</Text>
            <TextInput style={[s.input, { height: 64 }]} value={desc} onChangeText={setDesc} placeholder="The doge that went to the gym" placeholderTextColor={Colors.textMuted} multiline />
          </Card>
          <Card>
            <Text style={s.fieldLabel}>LAUNCH COST</Text>
            <View style={s.row}><Text style={s.rowKey}>Creation fee</Text><Text style={s.rowVal}>{CREATION_FEE} SOL (~$3.60)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Your token supply</Text><Text style={s.rowVal}>1,000,000,000 (1B)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>pump.fun share</Text><Text style={s.rowVal}>0% (you keep all)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Starting price</Text><Text style={s.rowVal}>$0.000001</Text></View>
          </Card>
          <PrimaryBtn label="Launch Token →" onPress={() => setStep('launch')} disabled={!tokenName || !ticker} />
        </>
      )}

      {step === 'launch' && (
        <>
          <Card>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>🚀</Text>
            <Text style={{ fontWeight: '900', fontSize: FontSize.xl, textAlign: 'center', color: Colors.accent }}>${ticker || 'TOKEN'}</Text>
            <Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: 4 }}>{tokenName || 'My Token'} is LIVE on pump.fun</Text>
            <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md }} />
            <View style={s.row}><Text style={s.rowKey}>Initial price</Text><Text style={s.rowVal}>$0.000001</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Market cap</Text><Text style={s.rowVal}>$1,000</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Graduation target</Text><Text style={s.rowVal}>$69,000 MC</Text></View>
            <Text style={s.hint2}>💡 Your token is on a bonding curve. Every buy raises the price. Reach $69K market cap to graduate to Raydium with permanent LP.</Text>
          </Card>
          <PrimaryBtn label="Simulate Buy Pressure →" onPress={() => setStep('curve')} />
        </>
      )}

      {step === 'curve' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>BONDING CURVE PROGRESS</Text>
            <View style={{ height: 12, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden', marginBottom: Spacing.sm }}>
              <View style={{ height: 12, borderRadius: 99, backgroundColor: graduated ? Colors.green : Colors.accent, width: `${pct}%` }} />
            </View>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, textAlign: 'right' }}>{pct.toFixed(0)}% to graduation ($69K MC)</Text>
            <View style={{ marginTop: Spacing.sm, gap: 4 }}>
              <View style={s.row}><Text style={s.rowKey}>Buy events</Text><Text style={s.rowVal}>{buys} traders</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Current price</Text><Text style={[s.rowVal, { color: Colors.accent, fontWeight: '900' }]}>${price}</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Market cap</Text><Text style={[s.rowVal, { fontWeight: '900' }]}>${marketCap.toLocaleString()}</Text></View>
            </View>
            {graduated ? (
              <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md }}>
                <Text style={{ fontWeight: '800', color: Colors.green }}>🎓 GRADUATED! Token migrates to Raydium with permanent LP. Now trades on open market.</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleBuy} style={{ marginTop: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.accent, borderRadius: Radius.lg, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: FontSize.md }}>🟢 Simulate a Buy (+1 trader)</Text>
              </TouchableOpacity>
            )}
          </Card>
          <PrimaryBtn label={graduated ? 'See Results →' : 'Skip to Result →'} onPress={() => setStep('result')} />
        </>
      )}

      {step === 'result' && (
        <>
          <ResultBox correct={graduated} message={graduated
            ? `${ticker} graduated to Raydium! Real pump.fun graduates have gone from $1K → $100M+. Most (98%) never make it.`
            : `${ticker} is still on the curve at ${pct.toFixed(0)}% progress. Only ~2% of pump.fun tokens graduate.`
          } />
          <Card>
            <Text style={s.fieldLabel}>THE BRUTAL STATISTICS</Text>
            <Text style={s.bullet}>• ~97% of pump.fun tokens die on the bonding curve</Text>
            <Text style={s.bullet}>• Average lifespan of a failed token: 4–48 hours</Text>
            <Text style={s.bullet}>• pump.fun earns fees regardless of success</Text>
            <Text style={s.bullet}>• 2% survival rate makes early entry very high risk</Text>
            <Text style={s.bullet}>• Graduated tokens: BONK, WIF, MOODENG all started here</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── solanaJupiter ─────────────────────────────────────────────────────────────
function SolanaJupiterSim({ onComplete, onSkip }: SimProps) {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken]     = useState('USDC');
  const [amount, setAmount]       = useState('1');
  const [route, setRoute]         = useState<null | string[]>(null);
  const [confirmed, setConfirmed] = useState(false);

  const prices: Record<string, number> = { SOL: 180, USDC: 1, JUP: 0.85, BONK: 0.000018, WIF: 2.4, JTO: 3.2 };
  const tokens = Object.keys(prices);
  const amtF = parseFloat(amount) || 0;
  const fromPrice = prices[fromToken] || 1;
  const toPrice   = prices[toToken]   || 1;
  const received  = (amtF * fromPrice / toPrice * 0.997).toFixed(toPrice < 0.001 ? 2 : 4);

  const routes: Record<string, string[]> = {
    'SOL-BONK':  ['SOL', 'USDC', 'BONK (via Raydium)'],
    'SOL-WIF':   ['SOL', 'USDC', 'WIF (via Orca)'],
    'USDC-JUP':  ['USDC', 'JUP (direct Orca)'],
    'SOL-JTO':   ['SOL', 'JTO (direct Phoenix)'],
  };
  const routeKey = `${fromToken}-${toToken}`;
  const bestRoute = routes[routeKey] || [fromToken, toToken + ' (direct)'];

  const findRoute = () => setRoute(bestRoute);

  return (
    <SimShell icon="🪐" title="Jupiter — Best-Price Swaps" subtitle="Jupiter routes through every Solana DEX to find you the best rate. See how.">
      <Card>
        <Text style={s.fieldLabel}>FROM</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {tokens.filter(t => t !== toToken).map(t => (
              <TouchableOpacity key={t} onPress={() => { setFromToken(t); setRoute(null); setConfirmed(false); }} style={[chip.base, fromToken === t && chip.active]}>
                <Text style={[chip.text, fromToken === t && chip.activeText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Text style={s.fieldLabel}>TO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {tokens.filter(t => t !== fromToken).map(t => (
              <TouchableOpacity key={t} onPress={() => { setToToken(t); setRoute(null); setConfirmed(false); }} style={[chip.base, toToken === t && chip.active]}>
                <Text style={[chip.text, toToken === t && chip.activeText]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <Text style={s.fieldLabel}>AMOUNT ({fromToken})</Text>
        <TextInput style={s.input} value={amount} onChangeText={v => { setAmount(v); setRoute(null); }} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        {!route
          ? <PrimaryBtn label="Find Best Route →" onPress={findRoute} disabled={amtF <= 0 || fromToken === toToken} />
          : (
            <>
              <View style={{ padding: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.md, marginTop: Spacing.sm }}>
                <Text style={s.fieldLabel}>BEST ROUTE FOUND</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                  {route.map((hop, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontWeight: '800', color: Colors.accent, fontSize: FontSize.sm }}>{hop}</Text>
                      {i < route.length - 1 && <Text style={{ color: Colors.textSoft }}>→</Text>}
                    </View>
                  ))}
                </View>
              </View>
              <View style={[s.row, { marginTop: Spacing.md }]}><Text style={s.rowKey}>You receive</Text><Text style={[s.rowVal, { fontWeight: '900', color: Colors.green, fontSize: FontSize.lg }]}>{received} {toToken}</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Price impact</Text><Text style={[s.rowVal, { color: amtF > 10 ? '#f59e0b' : Colors.green }]}>{amtF > 100 ? '1.2%' : amtF > 10 ? '0.3%' : '0.05%'}</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Fee</Text><Text style={s.rowVal}>0.3% (split to LPs)</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Network fee</Text><Text style={[s.rowVal, { color: Colors.green }]}>~$0.001</Text></View>
            </>
          )
        }
      </Card>

      {route && !confirmed && <PrimaryBtn label="Confirm Swap →" onPress={() => setConfirmed(true)} />}
      {confirmed && (
        <>
          <ResultBox correct message={`Swapped! Jupiter found the best route across ${route.length > 2 ? 'multiple' : 'one'} Solana DEX${route.length > 2 ? 'es' : ''}. You got $${(parseFloat(received) * toPrice).toFixed(2)} worth of ${toToken} for ${amount} ${fromToken}.`} />
          <Card>
            <Text style={s.fieldLabel}>WHY JUPITER IS DOMINANT</Text>
            <Text style={s.bullet}>• Routes across Raydium, Orca, Meteora, Phoenix, and more</Text>
            <Text style={s.bullet}>• Split routing: breaks large orders across multiple pools</Text>
            <Text style={s.bullet}>• Handles 95%+ of Solana DEX volume</Text>
            <Text style={s.bullet}>• JUP token holders vote on protocol upgrades</Text>
            <Text style={s.bullet}>• Average 0.3% better price than any single DEX</Text>
          </Card>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── solanaStaking ─────────────────────────────────────────────────────────────
function SolanaStakingSim({ onComplete, onSkip }: SimProps) {
  const [method, setMethod] = useState<'native' | 'msol' | 'jito'>('native');
  const [amount, setAmount] = useState('10');
  const [confirmed, setConfirmed] = useState(false);
  const SOL_PRICE = 180;
  const amtF = parseFloat(amount) || 0;

  const methods = {
    native: { apy: 6.4, liquid: false, token: 'SOL (locked)', unstake: '2–3 days', desc: 'Delegate directly to a validator. Earn ~6.4% APY. Unstaking takes one epoch (~2-3 days).', extra: 'Safest option — no smart contract risk. Choose a high-uptime validator.' },
    msol:   { apy: 6.8, liquid: true,  token: 'mSOL (Marinade)', unstake: 'Instant (DEX)', desc: 'Marinade Finance liquid staking. Receive mSOL — earns yield and can be used in DeFi.', extra: 'mSOL accrues value vs SOL over time (e.g. 1 mSOL = 1.05 SOL after rewards).' },
    jito:   { apy: 7.1, liquid: true,  token: 'JitoSOL', unstake: 'Instant (DEX)', desc: 'Jito\'s liquid staking includes MEV rewards on top of standard staking yield.', extra: 'JitoSOL earns both staking APY AND a share of MEV (validator tips) — highest yield.' },
  };
  const m = methods[method];
  const yearly = (amtF * m.apy / 100).toFixed(4);
  const yearlyUsd = (parseFloat(yearly) * SOL_PRICE).toFixed(2);

  return (
    <SimShell icon="◎" title="Solana Staking — 3 Methods" subtitle="Compare native delegation, Marinade mSOL, and JitoSOL. Each has different trade-offs.">
      <Card>
        <Text style={s.fieldLabel}>STAKING METHOD</Text>
        {(Object.entries(methods) as [typeof method, typeof methods.native][]).map(([k, v]) => (
          <TouchableOpacity key={k} onPress={() => { setMethod(k); setConfirmed(false); }} style={[{
            padding: Spacing.md, borderRadius: Radius.md, borderWidth: 2, marginBottom: Spacing.sm,
            borderColor: method === k ? Colors.accent : Colors.border,
            backgroundColor: method === k ? Colors.accentSoft : Colors.card,
          }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', color: method === k ? Colors.accent : Colors.text }}>
                {k === 'native' ? '🏛️ Native Delegation' : k === 'msol' ? '🌊 Marinade (mSOL)' : '⚡ Jito (JitoSOL)'}
              </Text>
              <Text style={{ fontWeight: '900', color: Colors.green }}>{v.apy}% APY</Text>
            </View>
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>
              {v.liquid ? '✅ Liquid' : '🔒 Locked'} · Unstake: {v.unstake}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>

      <Card>
        <Text style={s.fieldLabel}>SOL TO STAKE</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <Text style={s.hint2}>{m.desc}</Text>
        <View style={{ marginTop: Spacing.sm, gap: 4 }}>
          <View style={s.row}><Text style={s.rowKey}>You receive</Text><Text style={[s.rowVal, { color: Colors.accent, fontWeight: '800' }]}>{amtF.toFixed(2)} {m.token}</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Annual rewards</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '900' }]}>+{yearly} SOL (+${yearlyUsd})</Text></View>
          <View style={s.row}><Text style={s.rowKey}>Smart contract risk</Text><Text style={s.rowVal}>{method === 'native' ? '❌ None' : '⚠️ Protocol risk'}</Text></View>
        </View>
        {method === 'jito' && (
          <View style={{ marginTop: Spacing.sm, padding: Spacing.sm, backgroundColor: '#f0fdf4', borderRadius: Radius.md }}>
            <Text style={{ fontSize: FontSize.xs, fontWeight: '700', color: Colors.green }}>⚡ MEV boost: Jito validators extract MEV and share it with JitoSOL stakers — that's the extra 0.7% vs native.</Text>
          </View>
        )}
        <Text style={{ fontSize: FontSize.xs, color: Colors.accent, marginTop: Spacing.sm, fontWeight: '700' }}>💡 {m.extra}</Text>
      </Card>

      {!confirmed
        ? <PrimaryBtn label={`Stake ${amount} SOL →`} onPress={() => setConfirmed(true)} disabled={amtF < 0.01} />
        : <>
            <ResultBox correct message={`Staked! ${method === 'native' ? `Your SOL earns ${m.apy}% APY. After 2–3 days to unstake, you're always within one epoch of liquidity.` : `You received ${m.token} which accrues value automatically. Use it in DeFi for extra yield while still earning staking rewards.`}`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ── solanaCompare ─────────────────────────────────────────────────────────────
function SolanaCompareSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    {
      q: 'You want to launch a memecoin in 30 seconds for $3',
      correct: 'Solana',
      reason: 'pump.fun on Solana: 30-second launch, $0.02 fee. Ethereum equivalent costs $100+ in gas and takes hours.',
    },
    {
      q: 'You want to access the deepest DeFi liquidity for a $500K USDC swap',
      correct: 'Ethereum',
      reason: 'Ethereum has 10× Solana\'s DeFi TVL. For large trades, deeper liquidity = better price, lower slippage.',
    },
    {
      q: 'Build a consumer app that needs sub-second UX and $0 gas for users',
      correct: 'Solana',
      reason: '400ms blocks + gasless via compressed NFTs and fee payer patterns. Solana\'s UX ceiling is higher for consumer apps.',
    },
    {
      q: 'You want maximum smart contract composability and the widest developer ecosystem',
      correct: 'Ethereum',
      reason: 'Ethereum has 10+ years of tooling, the most developers, and EVM compatibility across 50+ L2s and sidechains.',
    },
    {
      q: 'Trade NFTs with sub-cent fees and instant settlement',
      correct: 'Solana',
      reason: 'Magic Eden on Solana: <$0.01 per trade. Ethereum NFT trades cost $5–50 in gas — unviable for frequent trading.',
    },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const score = scenarios.filter((sc, i) => answers[i] === sc.correct).length;
  const passed = score >= 4;

  return (
    <SimShell icon="⚖️" title="Solana vs Ethereum — Which Chain?" subtitle="The final boss question every serious builder and trader must know cold.">
      {scenarios.map((sc, i) => {
        const chosen = answers[i];
        const isCorrect = chosen === sc.correct;
        return (
          <Card key={i} style={{ borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border }}>
            <Text style={{ fontWeight: '700', color: Colors.text, lineHeight: 20, marginBottom: Spacing.md }}>{sc.q}</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {['Solana', 'Ethereum'].map(chain => {
                const isCh = chosen === chain;
                const isCo = chain === sc.correct;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo)   { bg = '#d1fae5'; border = Colors.green; }
                if (checked && isCh && !isCo)  { bg = '#fee2e2'; border = Colors.red; }
                if (checked && !isCh && isCo)  { bg = '#d1fae5'; border = Colors.green; }
                return (
                  <TouchableOpacity key={chain} disabled={checked} onPress={() => setAnswers(a => ({ ...a, [i]: chain }))}
                    style={{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, backgroundColor: bg, borderColor: border, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: FontSize.sm }}>{chain === 'Solana' ? '◎ Solana' : '⟠ Ethereum'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: Spacing.sm, lineHeight: 16 }}>💡 {sc.reason}</Text>}
          </Card>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <>
            <ResultBox correct={passed} message={passed
              ? `${score}/5 — Expert chain selection. Solana = speed/cost/consumer. Ethereum = liquidity/composability/security.`
              : `${score}/5 — The mental model: Solana wins on speed, cost, and consumer UX. Ethereum wins on liquidity depth, tooling, and institutional trust.`
            } />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>
      }
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHER — ALL SIMULATORS
// ─────────────────────────────────────────────────────────────────────────────
const SIMULATORS: Record<string, React.ComponentType<SimProps>> = {
  // ── Original 38 ────────────────────────────────────────────────────────────
  tonWallet:            TonWalletSim,
  tonTapEarn:           TonTapEarnSim,
  tonStaking:           TonStakingSim,
  cbProductPicker:      CbProductPickerSim,
  cbAdvancedTrade:      CbAdvancedTradeSim,
  cbStaking:            CbStakingSim,
  accountAbstraction:   AccountAbstractionSim,
  depin:                DepinSim,
  opsecIdentity:        OpsecIdentitySim,
  chainBridging:        ChainBridgingSim,
  avaxStaking:          AvaxStakingSim,
  chainComparison:      ChainComparisonSim,
  addressPoison:        AddressPoisonSim,
  mevSandwich:          MevSandwichSim,
  discordResearch:      DiscordResearchSim,
  opsecCheck:           OpsecCheckSim,
  // Island 1 — Bitcoin Bay
  sendBitcoin:          SendBitcoinSim,
  bitcoinFees:          BitcoinFeesSim,
  lightning:            LightningSim,
  // Island 2 — Ethereum Essentials
  erc20Token:           Erc20TokenSim,
  ethValidator:         EthValidatorSim,
  layer2:               Layer2Sim,
  // Island 3 — Wallet & Security
  metamask:             MetamaskSim,
  phishing:             PhishingSim,
  tokenApprovals:       TokenApprovalsSim,
  fakeTokens:           FakeTokensSim,
  // Island 4 — DeFi Universe
  uniswap:              UniswapSim,
  slippage:             SlippageSim,
  impermanentLoss:      ImpermanentLossSim,
  liquidation:          LiquidationSim,
  // Island 9 — Memecoin Markets
  dexscreener:          DexscreenerSim,
  // Island 10 — Airdrop Archipelago
  airdropFarm:          AirdropFarmSim,
  p2pTrade:             P2PTradeSim,
  // Island 18 — Advanced Crypto
  ens:                  EnsSim,
  daoVote:              DaoVoteSim,
  onchainAnalysis:      OnchainAnalysisSim,
  contractAudit:        ContractAuditSim,
  tokenomics:           TokenomicsSim,

  // ── New 31 (this session) ─────────────────────────────────────────────────
  // Bitcoin & Ethereum Fundamentals
  halving:              HalvingSim,
  gas:                  GasSim,
  staking:              StakingSim,
  // CEX & Chain Operations
  cexDeposit:           CexDepositSim,
  wrongChain:           WrongChainSim,
  // DeFi
  lending:              LendingSim,
  leverage:             LeverageSim,
  fdv:                  FdvSim,
  // NFT
  nftMint:              NftMintSim,
  nftContract:          NftContractSim,
  // Memecoin
  rugScanner:           RugScannerSim,
  rugcheck:             RugcheckSim,
  bondingCurve:         BondingCurveSim,
  lpSeed:               LpSeedSim,
  // Base Island
  baseIntro:            BaseIntroSim,
  baseGas:              BaseGasSim,
  smartWallet:          SmartWalletSim,
  paymaster:            PaymasterSim,
  miniApp:              MiniAppSim,
  miniAppBuild:         MiniAppBuildSim,
  // BNB Chain Island
  bnbOverview:          BnbOverviewSim,
  bnbPancake:           BnbPancakeSim,
  bnbLaunch:            BnbLaunchSim,
  bnbAlpha:             BnbAlphaSim,
  bnbEarn:              BnbEarnSim,
  bnbStaking:           BnbStakingSim,
  // Solana Island
  solanaOverview:       SolanaOverviewSim,
  solanaPump:           SolanaPumpSim,
  solanaJupiter:        SolanaJupiterSim,
  solanaStaking:        SolanaStakingSim,
  solanaCompare:        SolanaCompareSim,
};

interface SimulatorCardProps {
  simulatorType: string;
  onComplete: () => void;
  onSkip:     () => void;
}

export default function SimulatorCard({ simulatorType, onComplete, onSkip }: SimulatorCardProps) {
  const Sim = SIMULATORS[simulatorType];
  if (!Sim) {
    return (
      <SimShell icon="⚡" title="Interactive Exercise" subtitle="Practice what you just learnt.">
        <Card>
          <Text style={s.hint2}>This simulator ({simulatorType}) is coming soon. Keep going!</Text>
        </Card>
        <PrimaryBtn label="Continue →" onPress={onComplete} />
        <GhostBtn label="Skip" onPress={onSkip} />
      </SimShell>
    );
  }
  return <Sim onComplete={onComplete} onSkip={onSkip} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  bigNumber:  { fontSize: 32, fontWeight: '900', color: Colors.text },
  address:    { fontSize: FontSize.sm, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: Colors.text, backgroundColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md },
  input:      { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, backgroundColor: Colors.card },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowKey:     { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  rowVal:     { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '700', flex: 1, textAlign: 'right' },
  bullet:     { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: 2 },
  hint:       { fontSize: FontSize.xs, color: Colors.red, marginTop: 4 },
  hint2:      { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 },
});
