/**
 * QuantSimulatorCard — interactive exercises for the Quant Trader Track.
 * Each simulator ties directly to the concept in the preceding level.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';

interface SimProps { onComplete: () => void; onSkip: () => void; }

// ── Shared UI ────────────────────────────────────────────────
function SimShell({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: string; children: React.ReactNode;
}) {
  return (
    <ScrollView style={sh.wrap} contentContainerStyle={sh.content} showsVerticalScrollIndicator={false}>
      <View style={sh.header}>
        <Text style={sh.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={sh.label}>⚡ QUANT LAB</Text>
          <Text style={sh.title}>{title}</Text>
          <Text style={sh.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}
const sh = StyleSheet.create({
  wrap:     { flex: 1 },
  content:  { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  header:   { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  icon:     { fontSize: 36, lineHeight: 44 },
  label:    { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  title:    { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 },
});

function PBtn({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[b.primary, disabled && b.disabled]}>
      <Text style={b.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}
function GBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={b.ghost}>
      <Text style={b.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}
const b = StyleSheet.create({
  primary:     { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  disabled:    { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  ghost:       { alignItems: 'center', paddingVertical: Spacing.md },
  ghostText:   { color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' },
});

function ResultBox({ correct, message }: { correct: boolean; message: string }) {
  return (
    <View style={[r.box, { backgroundColor: correct ? '#d1fae5' : '#fee2e2', borderColor: correct ? Colors.green : Colors.red }]}>
      <Text style={r.icon}>{correct ? '✅' : '❌'}</Text>
      <Text style={[r.msg, { color: correct ? '#065f46' : '#7f1d1d' }]}>{message}</Text>
    </View>
  );
}
const r = StyleSheet.create({
  box:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5 },
  icon: { fontSize: 20 },
  msg:  { flex: 1, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 19 },
});

function Card({ children }: { children: React.ReactNode }) {
  return <View style={[c.box, Shadow.sm]}>{children}</View>;
}
const c = StyleSheet.create({
  box: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg },
});

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowKey}>{label}</Text>
      <Text style={[s.rowVal, accent && { color: Colors.accent, fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowKey:       { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  rowVal:       { fontSize: FontSize.sm, color: Colors.text, fontWeight: '700', flex: 1, textAlign: 'right' },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  body:         { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: Spacing.sm },
  formula:      { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: FontSize.sm, color: Colors.navy, backgroundColor: '#f1f5f9', borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm },
  input:        { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, backgroundColor: Colors.card },
  fieldLabel:   { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSoft, marginBottom: 3, textTransform: 'uppercase' },
});

// ── Probability Slider ────────────────────────────────────────
function ProbSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label?: string }) {
  const steps = [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100];
  return (
    <View style={{ gap: Spacing.sm }}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <Text style={{ fontSize: 40, fontWeight: '900', color: Colors.accent, textAlign: 'center' }}>{(value * 100).toFixed(0)}%</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
        {steps.map(step => (
          <TouchableOpacity key={step} onPress={() => onChange(step / 100)}
            style={[{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
              Math.round(value * 100) === step ? { backgroundColor: Colors.accent } : { backgroundColor: Colors.border }]}>
            <Text style={{ fontSize: 8, color: Math.round(value * 100) === step ? '#fff' : Colors.textSoft, fontWeight: '600' }}>
              {step % 20 === 0 ? `${step}%` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// SIMULATORS
// ─────────────────────────────────────────────────────────────

function ConditionalProbSim({ onComplete, onSkip }: SimProps) {
  const [est, setEst] = useState(0.55);
  const [submitted, setSubmitted] = useState(false);
  const correct = 0.72;
  const isOk = Math.abs(est - correct) <= 0.08;
  return (
    <SimShell icon="🎲" title="Conditional Probability" subtitle="Update your estimate given new information">
      <Card>
        <Text style={s.sectionLabel}>SCENARIO</Text>
        <Text style={s.body}>Stock rises 55% of all days. On days when pre-market volume is 2× average, it rises 72% of the time. Today's volume is 2× average.</Text>
      </Card>
      <Card>
        <Text style={s.sectionLabel}>YOUR ESTIMATE</Text>
        <ProbSlider value={est} onChange={setEst} label="P(Rise | Volume 2×)" />
      </Card>
      {!submitted
        ? <PBtn label="Submit" onPress={() => setSubmitted(true)} />
        : <>
            <ResultBox correct={isOk} message={isOk
              ? `Correct. Conditional probability = 72%. Base rate 55% is noise; 72% is the real edge.`
              : `The conditional probability is 72%. You said ${(est*100).toFixed(0)}%. Conditioning on volume changes the base rate significantly.`} />
            <PBtn label="Continue →" onPress={onComplete} />
          </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function BayesianUpdaterSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState(0);
  const [ests, setEsts] = useState([0.40, 0.40, 0.40]);
  const [done, setDone] = useState(false);
  const evidence = [
    { label: 'Prior', info: '40% confidence this token outperforms.', correct: 0.40 },
    { label: 'Partnership announced', info: 'Partnerships are followed by outperformance 70% of the time, vs 25% without.', correct: 0.65 },
    { label: 'Lead dev sells 10%', info: 'Insider selling historically reduces outperformance probability by ~20pp.', correct: 0.45 },
  ];
  const setEst = (v: number) => { const copy = [...ests]; copy[step] = v; setEsts(copy); };
  const next = () => { if (step < evidence.length - 1) setStep(s => s + 1); else setDone(true); };
  if (done) {
    const avgErr = ests.reduce((s, e, i) => s + Math.abs(e - evidence[i].correct), 0) / 3;
    return (
      <SimShell icon="🔄" title="Bayesian Calibration" subtitle="How well did you track the evidence?">
        <Card>
          {evidence.map((e, i) => <Row key={i} label={e.label}
            value={`You: ${(ests[i]*100).toFixed(0)}% | Correct: ${(e.correct*100).toFixed(0)}%`}
            accent={Math.abs(ests[i] - e.correct) <= 0.08} />)}
          <Row label="Avg error" value={`${(avgErr*100).toFixed(0)}pp`} />
        </Card>
        <ResultBox correct={avgErr <= 0.10} message={avgErr <= 0.10
          ? `Good calibration. Average error ${(avgErr*100).toFixed(0)}pp.`
          : `Average error ${(avgErr*100).toFixed(0)}pp. Update proportionally — not too much, not too little.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </SimShell>
    );
  }
  const cur = evidence[step];
  return (
    <SimShell icon="🔄" title="Bayesian Updater" subtitle={`Step ${step + 1} of ${evidence.length}`}>
      <Card><Text style={s.sectionLabel}>{cur.label.toUpperCase()}</Text><Text style={s.body}>{cur.info}</Text></Card>
      <Card><ProbSlider value={ests[step]} onChange={setEst} label="P(Outperforms)" /></Card>
      <PBtn label={step < evidence.length - 1 ? 'Next Evidence →' : 'See Results'} onPress={next} />
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function ExpectedValueSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const bets = [
    { label: 'Bet A', desc: '70% × +$100, 30% × -$80', ev: 46 },
    { label: 'Bet B', desc: '50% × +$200, 50% × -$150', ev: 25 },
    { label: 'Bet C', desc: '90% × +$20, 10% × -$120', ev: 6 },
    { label: 'Bet D', desc: '40% × +$300, 60% × -$150', ev: 30 },
  ];
  const best = bets.indexOf(bets.reduce((a, b2) => b2.ev > a.ev ? b2 : a));
  return (
    <SimShell icon="🎯" title="Expected Value" subtitle="Which bet maximises EV?">
      <Card><Text style={s.sectionLabel}>THE QUESTION</Text><Text style={s.body}>One bet only. Purely on EV — which do you choose?</Text></Card>
      {bets.map((bt, i) => {
        const revealed = chosen !== null;
        const isCorrect = i === best;
        let bg = Colors.card, border = Colors.border;
        if (revealed && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
        if (revealed && chosen === i && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => chosen === null && setChosen(i)} disabled={chosen !== null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{bt.label}</Text>
            <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, marginTop: 2 }}>{bt.desc}</Text>
            {revealed && <Text style={{ color: Colors.accent, fontWeight: '700', marginTop: 4 }}>EV = +${bt.ev}</Text>}
          </TouchableOpacity>
        );
      })}
      {chosen !== null && <>
        <ResultBox correct={chosen === best} message={chosen === best
          ? `Correct. Bet A EV = +$46 — highest of the four.`
          : `Bet A has EV +$46. Compute EV = Σ(outcome × probability) for each.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function KellyCriterionSim({ onComplete, onSkip }: SimProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const correct = ((0.58 * 1.2 - 0.42) / 1.2);
  const isOk = Math.abs(parseFloat(input) / 100 - correct) <= 0.04;
  return (
    <SimShell icon="📐" title="Kelly Criterion" subtitle="Optimal bet fraction">
      <Card>
        <Text style={s.sectionLabel}>PARAMETERS</Text>
        <Row label="Win probability (p)" value="58%" />
        <Row label="Net odds (b)" value="1.20" />
        <Row label="Loss probability (q)" value="42%" />
        <Text style={s.formula}>f* = (p × b − q) / b</Text>
      </Card>
      {!submitted
        ? <><TextInput style={s.input} placeholder="e.g. 23 (for 23%)" keyboardType="numeric" value={input} onChangeText={setInput} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSubmitted(true)} disabled={!input} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct. f* = (0.58×1.2 - 0.42) / 1.2 = ${(correct*100).toFixed(1)}%`
              : `f* = ${(correct*100).toFixed(1)}%. You said ${input}%. Work through (0.58×1.2 - 0.42) / 1.2.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function MonteCarloSim({ onComplete, onSkip }: SimProps) {
  const [runs, setRuns] = useState(0);
  const [sum, setSum] = useState(0);
  const run = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      let bal = 0;
      for (let f = 0; f < 100; f++) bal += Math.random() > 0.5 ? 2 : -1;
      s += bal;
    }
    setRuns(r => r + n);
    setSum(sv => sv + s);
  };
  const avg = runs > 0 ? (sum / runs).toFixed(2) : '—';
  return (
    <SimShell icon="🎲" title="Monte Carlo" subtitle="See EV emerge from simulation">
      <Card>
        <Text style={s.body}>100 coin flips: heads=+$2, tails=-$1. EV per game = $50. Run simulations to see it converge.</Text>
        <Row label="Runs" value={runs.toLocaleString()} />
        <Row label="Avg outcome" value={runs > 0 ? `$${avg}` : '—'} accent />
        <Row label="Theoretical EV" value="$50.00" />
      </Card>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {[10,100,1000].map(n => (
          <TouchableOpacity key={n} onPress={() => run(n)} style={[b.primary, { flex: 1 }]}>
            <Text style={b.primaryText}>{n >= 1000 ? '1K' : n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {runs >= 100 && <>
        <ResultBox correct={Math.abs(parseFloat(avg) - 50) < 6}
          message={`After ${runs} sims, avg = $${avg}. Theory = $50. ${Math.abs(parseFloat(avg) - 50) < 6 ? 'Law of large numbers at work.' : 'Run more — it converges.'}`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function MultipleComparisonsSim({ onComplete, onSkip }: SimProps) {
  const [tested, setTested] = useState(0);
  const [fps, setFps] = useState(0);
  const runTests = (n: number) => {
    let f = 0;
    for (let i = 0; i < n; i++) if (Math.random() < 0.05) f++;
    setTested(t => t + n);
    setFps(p => p + f);
  };
  return (
    <SimShell icon="🔬" title="Multiple Comparisons" subtitle="False positives accumulate fast">
      <Card>
        <Text style={s.body}>Test worthless strategies (zero edge). Each has 5% false positive rate at p&lt;0.05.</Text>
        <Row label="Tested" value={tested.toString()} />
        <Row label="False positives" value={fps.toString()} accent />
        <Row label="Expected FPs" value={`~${(tested*0.05).toFixed(1)}`} />
      </Card>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {[10,100,1000].map(n => (
          <TouchableOpacity key={n} onPress={() => runTests(n)} style={[b.primary, { flex: 1 }]}>
            <Text style={b.primaryText}>{n >= 1000 ? '1K' : n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tested >= 50 && <>
        <ResultBox correct={false}
          message={`Tested ${tested} zero-edge strategies, found ${fps} "significant". All false positives. Bonferroni threshold = 0.05/${tested} = ${(0.05/tested).toFixed(4)}.`} />
        <PBtn label="I understand →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function AlphaRegressionSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const strats = [
    { name: 'Strategy A', ret: 18, beta: 1.8, alpha: 0 },
    { name: 'Strategy B', ret: 12, beta: 0.8, alpha: 4 },
    { name: 'Strategy C', ret: 25, beta: 2.1, alpha: 4 },
    { name: 'Strategy D', ret: 8,  beta: 0.3, alpha: 5 },
  ];
  const best = strats.indexOf(strats.reduce((a, x) => x.alpha > a.alpha ? x : a));
  return (
    <SimShell icon="📈" title="Alpha vs Beta" subtitle="Strip away market exposure">
      <Card><Text style={s.body}>Market returned 10%. α = Return − β × Market Return. Which strategy has the most genuine alpha?</Text></Card>
      {strats.map((st, i) => {
        const rev = chosen !== null;
        const isCorrect = i === best;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
        if (rev && chosen === i && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => chosen === null && setChosen(i)} disabled={chosen !== null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{st.name}</Text>
            <Row label="Return" value={`${st.ret}%`} />
            <Row label="Beta" value={st.beta.toString()} />
            {rev && <Row label="Alpha α" value={`${st.alpha}%`} accent />}
          </TouchableOpacity>
        );
      })}
      {chosen !== null && <>
        <ResultBox correct={chosen === best} message={chosen === best
          ? `Correct. Strategy D α=5% — highest despite lowest return. High returns can be disguised beta.`
          : `Strategy D has α=5%. Alpha = Return − β×Market. High returns often mask large factor exposure.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function FatTailsSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const opts = ['Once a decade', 'Once in 3,500 years', 'Once a year', 'Once a century'];
  const correct = 1;
  return (
    <SimShell icon="🐘" title="Fat Tails" subtitle="Why Gaussian fails in markets">
      <Card><Text style={s.body}>Under a normal distribution, how often should a 5-sigma event occur?</Text></Card>
      {opts.map((opt, i) => {
        const rev = chosen !== null;
        const isCorrect = i === correct;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
        if (rev && chosen === i && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => chosen === null && setChosen(i)} disabled={chosen !== null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
            <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
      {chosen !== null && <>
        <ResultBox correct={chosen === correct} message={chosen === correct
          ? `Correct — but markets have had multiple 5-sigma+ events in the last 30 years. Tails are fat. Normal distribution is wrong.`
          : `Answer: once in ~3,500 years under normality. But real markets have multiple such events per decade. The tails are fat.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function SharpeRatioSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const strats = [
    { name: 'Momentum Fund',  ret: 22, vol: 18, rf: 4 },
    { name: 'Mean Reversion', ret: 14, vol: 6,  rf: 4 },
    { name: 'Trend Following',ret: 30, vol: 28, rf: 4 },
    { name: 'Arbitrage',      ret: 9,  vol: 2,  rf: 4 },
  ];
  const sharpes = strats.map(x => (x.ret - x.rf) / x.vol);
  const best = sharpes.indexOf(Math.max(...sharpes));
  return (
    <SimShell icon="📐" title="Sharpe Ratio" subtitle="Risk-adjusted return">
      <Card><Text style={s.formula}>Sharpe = (Return − Risk-Free) / Std Dev</Text><Text style={s.body}>Risk-free = 4%. Best Sharpe?</Text></Card>
      {strats.map((st, i) => {
        const rev = chosen !== null;
        const isCorrect = i === best;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
        if (rev && chosen === i && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => chosen === null && setChosen(i)} disabled={chosen !== null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{st.name}</Text>
            <Row label="Return" value={`${st.ret}%`} />
            <Row label="Volatility" value={`${st.vol}%`} />
            {rev && <Row label="Sharpe" value={sharpes[i].toFixed(2)} accent />}
          </TouchableOpacity>
        );
      })}
      {chosen !== null && <>
        <ResultBox correct={chosen === best} message={chosen === best
          ? `Correct. Arbitrage Sharpe = ${sharpes[best].toFixed(2)} — huge return relative to tiny vol.`
          : `Arbitrage wins with Sharpe ${sharpes[best].toFixed(2)} despite lowest absolute return.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function PermutationTestSim({ onComplete, onSkip }: SimProps) {
  const [total, setTotal] = useState(0);
  const [beats, setBeats] = useState(0);
  const TARGET = 14;
  const run = (n: number) => {
    let b = 0;
    for (let i = 0; i < n; i++) if (10 + (Math.random() - 0.5) * 24 > TARGET) b++;
    setTotal(t => t + n);
    setBeats(b2 => b2 + b);
  };
  const pVal = total > 0 ? beats / total : null;
  return (
    <SimShell icon="🔀" title="Permutation Test" subtitle="Is the strategy significant?">
      <Card>
        <Text style={s.body}>Your strategy: 14% annual return. Shuffle returns randomly. How often does chance beat it?</Text>
        <Row label="Simulations" value={total.toLocaleString()} />
        <Row label="Random strategies beating 14%" value={beats.toString()} />
        {pVal !== null && <Row label="p-value" value={pVal.toFixed(4)} accent />}
      </Card>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {[100,1000,5000].map(n => (
          <TouchableOpacity key={n} onPress={() => run(n)} style={[b.primary, { flex: 1 }]}>
            <Text style={b.primaryText}>{n >= 1000 ? `${n/1000}K` : n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {total >= 500 && <>
        <ResultBox correct={(pVal ?? 1) < 0.05}
          message={(pVal ?? 1) < 0.05
            ? `p = ${pVal!.toFixed(4)} < 0.05. Statistically significant.`
            : `p = ${pVal!.toFixed(4)} ≥ 0.05. Not significant — too many random strategies match it.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function CovarianceMatrixSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const pairs = [
    { pair: 'BTC & ETH',       corr: 0.92,  label: 'Strong positive — both crypto risk assets' },
    { pair: 'BTC & Gold',      corr: 0.15,  label: 'Weak positive' },
    { pair: 'BTC & S&P 500',   corr: 0.45,  label: 'Moderate positive' },
    { pair: 'Gold & S&P 500',  corr: -0.18, label: 'Weak negative — most diversification' },
  ];
  const best = 3;
  return (
    <SimShell icon="📊" title="Covariance & Diversification" subtitle="Lower correlation = more benefit">
      <Card><Text style={s.body}>Which pair provides the most diversification benefit?</Text></Card>
      {pairs.map((p, i) => {
        const rev = chosen !== null;
        const isCorrect = i === best;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
        if (rev && chosen === i && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => chosen === null && setChosen(i)} disabled={chosen !== null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{p.pair}</Text>
            {rev && <><Text style={{ color: Colors.accent, fontWeight: '700', marginTop: 4 }}>ρ = {p.corr.toFixed(2)}</Text>
              <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, marginTop: 2 }}>{p.label}</Text></>}
          </TouchableOpacity>
        );
      })}
      {chosen !== null && <>
        <ResultBox correct={chosen === best} message={chosen === best
          ? `Correct. Gold & S&P (ρ = -0.18) — negative correlation reduces portfolio variance.`
          : `Gold & S&P (ρ = -0.18) provides most diversification. BTC & ETH (ρ = 0.92) provides least.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function MarkowitzOptimiserSim({ onComplete, onSkip }: SimProps) {
  const [weights, setWeights] = useState([25, 25, 25, 25]);
  const [locked, setLocked] = useState(false);
  const assets = [
    { name: 'BTC', ret: 40, vol: 80 },
    { name: 'ETH', ret: 35, vol: 70 },
    { name: 'Gold', ret: 8,  vol: 15 },
    { name: 'Bonds', ret: 5, vol: 5 },
  ];
  const total = weights.reduce((a, b2) => a + b2, 0);
  const portRet = assets.reduce((s, a, i) => s + (weights[i]/total) * a.ret, 0);
  const portVol = Math.sqrt(assets.reduce((s, a, i) => s + Math.pow((weights[i]/total)*a.vol, 2), 0) * 0.7);
  const sharpe = (portRet - 4) / portVol;
  const adj = (i: number, d: number) => { const cp = [...weights]; cp[i] = Math.max(5, Math.min(60, cp[i] + d)); setWeights(cp); };
  return (
    <SimShell icon="⚖️" title="Portfolio Optimiser" subtitle="Maximise Sharpe ratio">
      <Card>
        <Row label="Expected Return" value={`${portRet.toFixed(1)}%`} />
        <Row label="Est. Volatility" value={`${portVol.toFixed(1)}%`} />
        <Row label="Sharpe Ratio" value={sharpe.toFixed(2)} accent />
      </Card>
      {assets.map((a, i) => (
        <Card key={i}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontWeight: '800', color: Colors.text }}>{a.name}</Text>
            <Text style={{ fontWeight: '900', color: Colors.accent, fontSize: FontSize.lg }}>{weights[i]}%</Text>
          </View>
          <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, marginBottom: 6 }}>Ret: {a.ret}% | Vol: {a.vol}%</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[-10,-5,5,10].map(d => (
              <TouchableOpacity key={d} onPress={() => adj(i, d)} disabled={locked}
                style={[{ flex: 1, borderRadius: Radius.sm, padding: 7, alignItems: 'center', backgroundColor: d < 0 ? '#fee2e2' : '#d1fae5' }]}>
                <Text style={{ fontWeight: '800', color: d < 0 ? Colors.red : Colors.green, fontSize: FontSize.sm }}>{d > 0 ? `+${d}` : d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      ))}
      {!locked
        ? <PBtn label="Lock Portfolio" onPress={() => setLocked(true)} />
        : <><ResultBox correct={sharpe > 0.4} message={sharpe > 0.4
              ? `Good. Sharpe = ${sharpe.toFixed(2)}. Diversification improves risk-adjusted return.`
              : `Sharpe = ${sharpe.toFixed(2)}. Add more Gold/Bonds to reduce portfolio variance.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function PsdMatrixSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState('');
  const [sub, setSub] = useState(false);
  const n = 4; const correct = -(1/(n-1));
  const isOk = Math.abs(parseFloat(ans) - correct) <= 0.02;
  return (
    <SimShell icon="🔢" title="PSD Constraint" subtitle="Minimum valid correlation for n=4">
      <Card>
        <Text style={s.body}>n=4 assets, equal pairwise correlation ρ. Eigenvalues: λ₁ = 1+(n-1)ρ, λ₂ = 1-ρ. Both must be ≥ 0. What is the minimum ρ?</Text>
        <Text style={s.formula}>ρ ≥ -1/(n-1)</Text>
      </Card>
      {!sub
        ? <><TextInput style={s.input} placeholder="-0.33" keyboardType="numeric" value={ans} onChangeText={setAns} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSub(true)} disabled={!ans} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct. ρ ≥ -1/${n-1} = ${correct.toFixed(3)}`
              : `Answer: ${correct.toFixed(3)}. Set λ₂ = 1 - ρ ≥ 0 and λ₁ = 1 + (n-1)ρ ≥ 0.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function GradientDescentSim({ onComplete, onSkip }: SimProps) {
  const [theta, setTheta] = useState(3.0);
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState([3.0]);
  const LR = 0.3;
  const step = () => {
    const g = 2 * (theta - 1);
    const nt = theta - LR * g;
    setTheta(nt);
    setHistory(h => [...h.slice(-6), nt]);
    setSteps(s => s + 1);
  };
  const converged = Math.abs(theta - 1) < 0.05;
  return (
    <SimShell icon="⬇️" title="Gradient Descent" subtitle="Minimise f(θ) = (θ−1)²">
      <Card>
        <Text style={s.formula}>f(θ) = (θ − 1)²   →   minimum at θ = 1</Text>
        <Row label="Current θ" value={theta.toFixed(4)} accent />
        <Row label="Loss f(θ)" value={Math.pow(theta-1,2).toFixed(4)} />
        <Row label="Gradient" value={(2*(theta-1)).toFixed(4)} />
        <Row label="Steps" value={steps.toString()} />
        <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: Colors.textSoft, marginTop: 6 }}>
          {history.map((v, i) => `θ${steps - history.length + 1 + i}: ${v.toFixed(3)}`).join('  ')}
        </Text>
      </Card>
      {!converged
        ? <PBtn label="Step →" onPress={step} />
        : <><ResultBox correct message={`Converged in ${steps} steps. θ = ${theta.toFixed(4)}, loss ≈ 0.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function DeltaGammaSim({ onComplete, onSkip }: SimProps) {
  const [price, setPrice] = useState(100);
  const [done, setDone] = useState(false);
  const dS = price - 100;
  const newDelta = 0.5 + 0.04 * dS;
  const pnl = 0.5 * dS + 0.5 * 0.04 * dS * dS;
  return (
    <SimShell icon="Δ" title="Delta & Gamma" subtitle="See how option sensitivities change">
      <Card>
        <Text style={s.body}>Long 100 calls. K=100, Δ=0.50, Γ=0.04. Move the stock and watch the Greeks update.</Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {[-10,-5,-2,2,5,10].map(d => (
            <TouchableOpacity key={d} onPress={() => setPrice(p => Math.max(80, Math.min(120, p+d)))}
              style={[{ borderRadius: Radius.sm, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: d < 0 ? '#fee2e2' : '#d1fae5' }]}>
              <Text style={{ fontWeight: '800', color: d < 0 ? Colors.red : Colors.green }}>{d > 0 ? `+${d}` : d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      <Card>
        <Row label="Stock price" value={`$${price}`} />
        <Row label="ΔS" value={`${dS >= 0 ? '+' : ''}${dS}`} />
        <Row label="New Delta" value={newDelta.toFixed(3)} accent />
        <Row label="Option P&L (×100)" value={`${pnl >= 0 ? '+' : ''}$${(pnl*100).toFixed(0)}`} />
      </Card>
      {!done
        ? <PBtn label="Understood →" onPress={() => setDone(true)} />
        : <><ResultBox correct message={`Delta moved from 0.50 to ${newDelta.toFixed(3)} — gamma is live. Re-hedge = ${Math.round(Math.abs(newDelta)*100)} shares.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function ImpliedVolSim({ onComplete, onSkip }: SimProps) {
  const [guess, setGuess] = useState('');
  const [sub, setSub] = useState(false);
  const isOk = Math.abs(parseFloat(guess) - 20) <= 2;
  return (
    <SimShell icon="σ" title="Implied Volatility" subtitle="What vol does the market price imply?">
      <Card>
        <Row label="S" value="$100" /><Row label="K" value="$100" /><Row label="T" value="0.5 yr" />
        <Row label="r" value="5%" /><Row label="Call price" value="$6.80" />
        <Text style={s.body}>ATM approx: C ≈ S × σ × √(T/2π) ≈ 100 × σ × 0.399. If C=$6.80, σ ≈ ?</Text>
      </Card>
      {!sub
        ? <><TextInput style={s.input} placeholder="e.g. 20 (for 20%)" keyboardType="numeric" value={guess} onChangeText={setGuess} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSub(true)} disabled={!guess} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct. σ = 6.80 / (100 × 0.399) ≈ 17–20%. Implied vol ≈ 20%.`
              : `IV ≈ 20%. σ = C / (S × √(T/2π)) = 6.80 / (100 × 0.399) ≈ 17–20%.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function BrownianMotionSim({ onComplete, onSkip }: SimProps) {
  const [paths, setPaths] = useState<number[][]>([]);
  const gen = () => {
    const ps: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const p = [0];
      for (let t = 1; t <= 50; t++) p.push(p[p.length-1] + (Math.random()-0.5)*2*Math.sqrt(0.02));
      ps.push(p);
    }
    setPaths(ps);
  };
  const avg = paths.length > 0 ? (paths.map(p => p[p.length-1]).reduce((a,b)=>a+b,0)/paths.length).toFixed(3) : '—';
  return (
    <SimShell icon="〰️" title="Brownian Motion" subtitle="Simulate random walks">
      <Card><Text style={s.body}>W₀=0. Increments N(0,Δt). E[Wₜ]=0. Var[Wₜ]=t. Paths continuous, nowhere differentiable.</Text></Card>
      {paths.length === 0
        ? <PBtn label="Generate 5 Paths" onPress={gen} />
        : <>
            <Card>
              {paths.map((p, i) => <Row key={i} label={`Path ${i+1}`} value={`end = ${p[p.length-1].toFixed(3)}`} />)}
              <Row label="Average final" value={avg} accent />
              <Row label="Expected (theory)" value="≈ 0.000" />
            </Card>
            <ResultBox correct message={`All paths start at 0, wander randomly. Average ≈ ${avg} (near 0 by symmetry). No memory.`} />
            <PBtn label="Continue →" onPress={onComplete} />
          </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function GbmSimulatorSim({ onComplete, onSkip }: SimProps) {
  const [paths, setPaths] = useState<number[]>([]);
  const mu=0.15, sigma=0.30, S0=100;
  const sim = () => {
    const ends: number[] = [];
    for (let i = 0; i < 10; i++) {
      const Z = Math.sqrt(-2*Math.log(Math.random()))*Math.cos(2*Math.PI*Math.random());
      ends.push(S0 * Math.exp((mu - sigma*sigma/2)*1 + sigma*Z));
    }
    setPaths(ends);
  };
  const median = paths.length > 0 ? [...paths].sort((a,b)=>a-b)[4] : 0;
  const theoMedian = S0 * Math.exp((mu - sigma*sigma/2)*1);
  return (
    <SimShell icon="📈" title="Geometric Brownian Motion" subtitle="Stock price simulation with Itô correction">
      <Card>
        <Row label="μ (drift)" value="15%/yr" /><Row label="σ (vol)" value="30%/yr" />
        <Row label="Itô drift (μ−σ²/2)" value={`${((mu-sigma*sigma/2)*100).toFixed(1)}%`} accent />
        <Text style={s.body}>Notice: log drift is μ − σ²/2, not μ. This is the Itô correction.</Text>
      </Card>
      {paths.length === 0
        ? <PBtn label="Simulate 10 Paths" onPress={sim} />
        : <>
            <Card>
              {paths.map((p, i) => <Row key={i} label={`Path ${i+1}`} value={`$${p.toFixed(2)}`} />)}
              <Row label="Simulated median" value={`$${median.toFixed(2)}`} accent />
              <Row label="Theoretical median" value={`$${theoMedian.toFixed(2)}`} />
            </Card>
            <ResultBox correct message={`Itô correction: drift in log space = ${((mu-sigma*sigma/2)*100).toFixed(1)}%, not ${(mu*100).toFixed(0)}%. This prevents overestimating expected log returns.`} />
            <PBtn label="Continue →" onPress={onComplete} />
          </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function BlackScholesDerivationSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Step 1 — Itô's Lemma", text: "V is option price, S follows GBM.\ndV = (∂V/∂t + μS·∂V/∂S + ½σ²S²·∂²V/∂S²)dt + σS·∂V/∂S dW" },
    { label: "Step 2 — Construct Delta Hedge", text: "Portfolio: Π = V − Δ·S, where Δ = ∂V/∂S.\ndΠ = dV − Δ·dS\nThe dW terms cancel — portfolio is locally riskless!" },
    { label: "Step 3 — Riskless Portfolio", text: "A riskless portfolio earns r:\ndΠ = r·Π·dt = r(V − ΔS)dt" },
    { label: "Step 4 — Black-Scholes PDE", text: "∂V/∂t + ½σ²S²∂²V/∂S² + rS·∂V/∂S − rV = 0\n\nThe drift μ vanished completely.\nOption price is independent of expected stock return!" },
  ];
  return (
    <SimShell icon="∂" title="Black-Scholes Derivation" subtitle="Build intuition step by step">
      <Card>
        <Text style={s.sectionLabel}>{steps[step].label}</Text>
        <Text style={s.formula}>{steps[step].text}</Text>
      </Card>
      {step < steps.length - 1
        ? <PBtn label="Next Step →" onPress={() => setStep(s => s+1)} />
        : <><ResultBox correct message="Key: μ vanishes. Options are priced risk-neutrally regardless of investor preferences." />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <Text style={{ textAlign: 'center', color: Colors.textSoft, fontSize: FontSize.sm }}>Step {step+1}/{steps.length}</Text>
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function BlackScholesCalcSim({ onComplete, onSkip }: SimProps) {
  const [params, setParams] = useState({ S:'100', K:'100', T:'1', r:'5', sig:'20' });
  const [result, setResult] = useState<{call:number;put:number;d1:number;d2:number;delta:number}|null>(null);
  const normCDF = (x: number) => {
    const a=0.2316419, b=[0.319381530,-0.356563782,1.781477937,-1.821255978,1.330274429];
    const t2=1/(1+a*Math.abs(x));
    const poly=b.reduce((s,bi,i)=>s+bi*Math.pow(t2,i+1),0);
    const v=1-(1/Math.sqrt(2*Math.PI))*Math.exp(-x*x/2)*poly;
    return x>=0?v:1-v;
  };
  const compute = () => {
    const S=+params.S, K=+params.K, T=+params.T, rr=+params.r/100, sig=+params.sig/100;
    const d1=(Math.log(S/K)+(rr+sig*sig/2)*T)/(sig*Math.sqrt(T));
    const d2=d1-sig*Math.sqrt(T);
    const call=S*normCDF(d1)-K*Math.exp(-rr*T)*normCDF(d2);
    const put=K*Math.exp(-rr*T)*normCDF(-d2)-S*normCDF(-d1);
    setResult({call,put,d1,d2,delta:normCDF(d1)});
  };
  const set = (k: string, v: string) => setParams(p => ({...p, [k]:v}));
  return (
    <SimShell icon="⚫" title="Black-Scholes Calculator" subtitle="Price options from scratch">
      <Card>
        {[['S','Stock Price'],['K','Strike'],['T','Time (years)'],['r','Rate (%)'],['sig','Vol (%)']].map(([k,lbl]) => (
          <View key={k} style={{ marginBottom: Spacing.sm }}>
            <Text style={s.fieldLabel}>{lbl}</Text>
            <TextInput style={s.input} value={(params as any)[k]} onChangeText={v=>set(k,v)} keyboardType="numeric" placeholderTextColor={Colors.textMuted} />
          </View>
        ))}
      </Card>
      <PBtn label="Calculate" onPress={compute} />
      {result && <>
        <Card>
          <Row label="d₁" value={result.d1.toFixed(4)} />
          <Row label="d₂" value={result.d2.toFixed(4)} />
          <Row label="Call Price" value={`$${result.call.toFixed(4)}`} accent />
          <Row label="Put Price" value={`$${result.put.toFixed(4)}`} />
          <Row label="Delta Δ" value={result.delta.toFixed(4)} />
        </Card>
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function BossBlackScholesSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState('');
  const [sub, setSub] = useState(false);
  const correct = 0.683;
  const isOk = Math.abs(parseFloat(ans) - correct) <= 0.02;
  return (
    <SimShell icon="⚔️" title="Boss: Black-Scholes Delta" subtitle="S=105, K=100, T=0.5, r=4%, σ=25%">
      <Card>
        <Text style={s.formula}>d₁ = [ln(105/100) + (0.04+0.03125)×0.5] / (0.25×0.707){'\n'}  = [0.04879 + 0.03563] / 0.17678{'\n'}  ≈ 0.4775{'\n\n'}Delta = N(0.4775) ≈ ?</Text>
      </Card>
      {!sub
        ? <><TextInput style={s.input} placeholder="Delta = N(d₁) = ?" keyboardType="numeric" value={ans} onChangeText={setAns} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSub(true)} disabled={!ans} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct. Δ ≈ 0.683. 200 long calls → hedge = ${Math.round(0.683*200)} shares short.`
              : `Delta = N(0.4775) ≈ 0.683. You said ${ans}. Anchor: N(0.5) ≈ 0.691, N(0.48) ≈ 0.683.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function GarchModelSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState('');
  const [sub, setSub] = useState(false);
  const correct = 0.000442;
  const isOk = Math.abs(parseFloat(ans) - correct) <= 0.00003;
  return (
    <SimShell icon="📊" title="GARCH Forecast" subtitle="σ²ₜ = ω + α·ε²ₜ₋₁ + β·σ²ₜ₋₁">
      <Card>
        <Row label="ω" value="0.00001" /><Row label="α" value="0.08" /><Row label="β" value="0.90" />
        <Row label="ε² (yesterday)" value="0.0009 (return -3%)" />
        <Row label="σ²ₜ₋₁" value="0.0004" />
      </Card>
      {!sub
        ? <><TextInput style={s.input} placeholder="σ²ₜ = ?" keyboardType="numeric" value={ans} onChangeText={setAns} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSub(true)} disabled={!ans} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct. 0.00001 + 0.08×0.0009 + 0.90×0.0004 = 0.000442`
              : `Answer: 0.000442. ω=0.00001, α×ε²=0.000072, β×σ²=0.000360 → sum = 0.000442`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function VolSurfaceSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState<number | null>(null);
  const opts = [
    'They price in crash risk — a sudden large drop would make these puts very valuable',
    'They have lower liquidity so the spread is wider',
    'The market maker is making a mistake',
    'OTM options always have higher IV by definition',
  ];
  return (
    <SimShell icon="📊" title="Volatility Smile" subtitle="Why deep OTM puts trade at higher IV">
      <Card>
        <Row label="K=80 deep ITM put" value="28% IV" />
        <Row label="K=100 ATM" value="20% IV" />
        <Row label="K=120 OTM call" value="23% IV" />
        <Text style={[s.body, { marginTop: 8 }]}>Why does K=80 put trade at 28% when ATM is 20%?</Text>
      </Card>
      {opts.map((opt, i) => {
        const rev = ans !== null;
        const isCorrect = i === 0;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg = '#d1fae5'; border = Colors.green; }
        if (rev && ans === i && !isCorrect) { bg = '#fee2e2'; border = Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => ans === null && setAns(i)} disabled={ans !== null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
            <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
      {ans !== null && <>
        <ResultBox correct={ans === 0} message={ans === 0
          ? `Correct. Deep OTM puts are expensive because they pay off in crashes. The market prices left-tail crash risk above what Black-Scholes (constant vol) would predict.`
          : `Answer: crash risk premium. The market knows returns are not normally distributed — left tails are fat.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function MonteCarloOptionsSim({ onComplete, onSkip }: SimProps) {
  const [runs, setRuns] = useState(0);
  const [totalPayoff, setTotalPayoff] = useState(0);
  const S0=100, K=105, r=0.05, sigma=0.20;
  const bsPrice = 8.02;
  const bm = () => Math.sqrt(-2*Math.log(Math.random())) * Math.cos(2*Math.PI*Math.random());
  const run = (n: number) => {
    let tp = 0;
    for (let i = 0; i < n; i++) {
      const ST = S0 * Math.exp((r - sigma*sigma/2)*1 + sigma*bm());
      tp += Math.max(ST - K, 0);
    }
    setRuns(r2 => r2 + n);
    setTotalPayoff(p => p + tp);
  };
  const mcPrice = runs > 0 ? Math.exp(-r*1) * totalPayoff / runs : 0;
  const err = Math.abs(mcPrice - bsPrice);
  return (
    <SimShell icon="🎲" title="Monte Carlo Options" subtitle="Price via simulation">
      <Card>
        <Row label="S₀=100, K=105, r=5%, σ=20%" value="T=1yr" />
        <Row label="Black-Scholes price" value="$8.02" />
        <Row label="MC price" value={runs > 0 ? `$${mcPrice.toFixed(4)}` : '—'} accent />
        <Row label="Simulations" value={runs.toLocaleString()} />
        {runs > 1000 && <Row label="Error" value={`$${err.toFixed(4)}`} />}
      </Card>
      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {[1000,10000,100000].map(n => (
          <TouchableOpacity key={n} onPress={() => run(n)} style={[b.primary, { flex: 1 }]}>
            <Text style={b.primaryText}>{n >= 1000 ? `${n/1000}K` : n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {runs >= 10000 && <>
        <ResultBox correct={err < 0.20}
          message={err < 0.20
            ? `Good convergence. MC = $${mcPrice.toFixed(3)}, BS = $8.02. Error = $${err.toFixed(3)}.`
            : `Run more — error decreases as 1/√N.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function MentalMathsSim({ onComplete, onSkip }: SimProps) {
  const probs = [{q:'23 × 14 = ?',a:322},{q:'8% of 450 = ?',a:36},{q:'17 × 13 = ?',a:221},{q:'√144 = ?',a:12},{q:'3/8 as % = ?',a:37.5},{q:'65 × 4 = ?',a:260},{q:'ln(1) = ?',a:0},{q:'0.15 × 0.15 = ?',a:0.0225}];
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [fb, setFb] = useState<string|null>(null);
  const [done, setDone] = useState(false);
  const submit = () => {
    const ok = Math.abs(parseFloat(input) - probs[cur].a) <= 0.01 * Math.max(1, probs[cur].a);
    if (ok) setScore(s=>s+1);
    setFb(ok ? `✅ ${probs[cur].a}` : `❌ ${probs[cur].a}`);
    setTimeout(() => { setFb(null); setInput(''); if (cur+1 >= probs.length) setDone(true); else setCur(c=>c+1); }, 900);
  };
  if (done) return (
    <SimShell icon="🧮" title="Mental Maths" subtitle="Zetamac-style drills">
      <ResultBox correct={score >= 6} message={`${score}/${probs.length} correct. Target for quant interviews: 90%+. Daily practice is the only path.`} />
      <PBtn label="Continue →" onPress={onComplete} />
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
  return (
    <SimShell icon="🧮" title="Mental Maths" subtitle={`Problem ${cur+1}/${probs.length} · Score: ${score}`}>
      <Card>
        <Text style={{ fontSize: 30, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 16 }}>{probs[cur].q}</Text>
        <TextInput style={s.input} placeholder="Answer" keyboardType="numeric" value={input} onChangeText={setInput}
          placeholderTextColor={Colors.textMuted} returnKeyType="done" onSubmitEditing={submit} autoFocus />
        {fb && <Text style={{ textAlign: 'center', fontWeight: '700', color: fb.startsWith('✅') ? Colors.green : Colors.red }}>{fb}</Text>}
      </Card>
      <PBtn label="Submit" onPress={submit} disabled={!input || !!fb} />
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function ConditionalRegressionSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState(0);
  const [rights, setRights] = useState(0);
  const qs = [
    { q: 'X+Y>1 restricts the joint density to what geometric region?', opts:['Upper-right triangle','Lower-left triangle','Full unit square','A circle'], correct:0, ex:'The condition X+Y>1 cuts the unit square, leaving the triangle above the line X+Y=1.' },
    { q: 'The conditional density f(x,y | X+Y>1) equals:', opts:['2','1','0.5','4'], correct:0, ex:'P(X+Y>1)=0.5. Conditional density = 1/0.5 = 2.' },
    { q: 'The regression slope β in E[Y|X=x, X+Y>1] = a + βx equals:', opts:['-1/2','+1/2','-1','0'], correct:0, ex:'E[Y|X=x, X+Y>1] = (1-x+1)/2 = 1 - x/2. Slope = -1/2.' },
  ];
  const [done, setDone] = useState(false);
  const answer = (i: number) => {
    const ok = i === qs[step].correct;
    if (ok) setRights(r=>r+1);
    if (step+1 >= qs.length) { setTimeout(() => setDone(true), 600); } else setStep(s=>s+1);
  };
  if (done) return (
    <SimShell icon="📐" title="Conditional Regression" subtitle="Jane Street Problem 2">
      <ResultBox correct={rights >= 2} message={`${rights}/${qs.length} correct. Key: conditioning X+Y>1 creates negative correlation between independent variables — Berkson's paradox.`} />
      <PBtn label="Continue →" onPress={onComplete} />
    </SimShell>
  );
  const q = qs[step];
  return (
    <SimShell icon="📐" title="Conditional Regression" subtitle={`Step ${step+1}/${qs.length}`}>
      <Card><Text style={s.body}>X,Y ~ Uniform[0,1] independently. Regress Y on X given X+Y&gt;1.</Text></Card>
      <Card>
        <Text style={{ fontWeight: '800', color: Colors.text, marginBottom: 12 }}>{q.q}</Text>
        {q.opts.map((opt, i) => (
          <TouchableOpacity key={i} onPress={() => answer(i)}
            style={[{ borderRadius: Radius.sm, padding: Spacing.md, backgroundColor: Colors.border, marginBottom: 6 }]}>
            <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </Card>
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function DynamicProgrammingSim({ onComplete, onSkip }: SimProps) {
  const [phase, setPhase] = useState(0);
  const [chosen, setChosen] = useState<number|null>(null);
  const opts = ['Different paths reach the same (index, sum) state multiple times','The array is too large','We need to sort first','Recursion is always slow'];
  return (
    <SimShell icon="🔢" title="Dynamic Programming" subtitle="Target Sum — memoisation">
      {phase === 0 && <>
        <Card><Text style={s.body}>[1,1,1,1,1], target=3. Brute force: O(2ⁿ). Why is it slow?</Text></Card>
        {opts.map((opt, i) => {
          const rev = chosen !== null;
          const isCorrect = i === 0;
          let bg = Colors.card, border = Colors.border;
          if (rev && isCorrect) { bg='#d1fae5'; border=Colors.green; }
          if (rev && chosen===i && !isCorrect) { bg='#fee2e2'; border=Colors.red; }
          return (
            <TouchableOpacity key={i} onPress={() => { if (chosen===null) setChosen(i); }} disabled={chosen!==null}
              style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border }]}>
              <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
        {chosen !== null && <PBtn label="The fix →" onPress={() => { setChosen(null); setPhase(1); }} />}
      </>}
      {phase === 1 && <>
        <Card>
          <Text style={s.sectionLabel}>MEMOISATION</Text>
          <Text style={s.formula}>dp = {'{}'}{'\n'}def dfs(i, total):{'\n'}  if (i, total) in dp: return dp[(i,total)]{'\n'}  dp[(i,total)] = dfs(i+1,total+nums[i]) + dfs(i+1,total-nums[i]){'\n'}  return dp[(i,total)]</Text>
          <Row label="Before" value="O(2ⁿ) — exponential" />
          <Row label="After" value="O(n × T) — polynomial" accent />
          <Row label="[1,1,1,1,1] target=3" value="Answer = 5" />
        </Card>
        <PBtn label="Verify →" onPress={() => setPhase(2)} />
      </>}
      {phase === 2 && <>
        <Card>
          <Text style={s.sectionLabel}>VERIFY</Text>
          {['(+1+1+1+1-1)=3','(+1+1+1-1+1)=3','(+1+1-1+1+1)=3','(+1-1+1+1+1)=3','(-1+1+1+1+1)=3'].map((x,i)=><Row key={i} label={`Way ${i+1}`} value={x+' ✓'} />)}
          <Row label="Total" value="5 ways" accent />
        </Card>
        <ResultBox correct message="Memoised DP finds all 5 in O(n×T). Recognise overlapping subproblems → cache → polynomial time." />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function TargetSumSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState('');
  const [sub, setSub] = useState(false);
  const correct = 3; // [2,2,2] target=2
  const isOk = parseInt(ans) === correct;
  return (
    <SimShell icon="🎯" title="Target Sum" subtitle="[2,2,2], target=2">
      <Card><Text style={s.body}>Assign + or − to each of [2,2,2]. Count ways to reach exactly 2. There are only 2³=8 possibilities.</Text></Card>
      {!sub
        ? <><TextInput style={s.input} placeholder="Number of ways" keyboardType="numeric" value={ans} onChangeText={setAns} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSub(true)} disabled={!ans} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct: 3 ways. (+2+2-2), (+2-2+2), (-2+2+2) all = 2.`
              : `Answer: 3. (+2+2-2)=2, (+2-2+2)=2, (-2+2+2)=2. You said ${ans}.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function MarketMakingSim({ onComplete, onSkip }: SimProps) {
  const [bid, setBid] = useState('');
  const [offer, setOffer] = useState('');
  const [sub, setSub] = useState(false);
  const mid = (parseFloat(bid) + parseFloat(offer)) / 2;
  const spread = parseFloat(offer) - parseFloat(bid);
  const isOk = Math.abs(mid - 115) <= 35 && spread > 0 && spread <= 120;
  return (
    <SimShell icon="🎹" title="Market Making" subtitle="Quote piano tuners in Chicago">
      <Card>
        <Text style={s.body}>Estimate and make a two-sided market (bid/offer) on the number of piano tuners in Chicago.</Text>
        <Text style={s.formula}>Population 2.7M → 1.1M households → 10% have pianos = 110K pianos{'\n'}1 tuning/yr → 110K tunings{'\n'}Tuner capacity: 4/day × 250 = 1,000/yr{'\n'}Tuners ≈ 110K / 1,000 ≈ 110</Text>
      </Card>
      {!sub ? <>
        <TextInput style={s.input} placeholder="Bid (low estimate)" keyboardType="numeric" value={bid} onChangeText={setBid} placeholderTextColor={Colors.textMuted} />
        <TextInput style={s.input} placeholder="Offer (high estimate)" keyboardType="numeric" value={offer} onChangeText={setOffer} placeholderTextColor={Colors.textMuted} />
        <PBtn label="Make Market" onPress={() => setSub(true)} disabled={!bid || !offer} />
      </> : <>
        <Card>
          <Row label="Your mid" value={mid.toFixed(0)} accent />
          <Row label="Correct mid" value="~115" />
          <Row label="Spread" value={spread.toFixed(0)} />
        </Card>
        <ResultBox correct={isOk} message={isOk
          ? `Good market. Mid ≈ ${mid.toFixed(0)}, spread reflects uncertainty.`
          : `Correct mid ≈ 115. ${Math.abs(mid-115) > 35 ? 'Re-check the Fermi estimate.' : 'Spread should reflect your uncertainty — not too narrow, not too wide.'}`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function DeltaHedgingBossSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(['','','']);
  const [results, setResults] = useState<boolean[]>([]);
  const qs = [
    { q: 'Stock $98→$101 (+$3). New delta = 0.45 + 0.08×3 = 0.69. Shares short to hedge 100 calls?', correct:69, tol:3, unit:'shares' },
    { q: 'Gamma P&L = ½ × 0.08 × 9 × 100 = ?', correct:36, tol:2, unit:'$' },
    { q: 'IV drops 2pp. Vega = $0.12/option × 100 calls × (-0.02) = ?', correct:-24, tol:3, unit:'$' },
  ];
  const submit = (i: number) => {
    const ok = Math.abs(parseFloat(answers[i]) - qs[i].correct) <= qs[i].tol;
    const nr = [...results, ok];
    setResults(nr);
    if (i + 1 >= qs.length) setTimeout(() => setStep(99), 300); else setStep(s=>s+1);
  };
  const setAns = (i: number, v: string) => { const cp = [...answers]; cp[i]=v; setAnswers(cp); };
  if (step === 99) {
    const correct = results.filter(Boolean).length;
    return (
      <SimShell icon="⚡" title="Delta Hedging Boss" subtitle="Complete">
        <ResultBox correct={correct >= 2} message={`${correct}/${qs.length}. Answers: ${qs.map(q=>q.correct).join(', ')}.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </SimShell>
    );
  }
  const q = qs[step];
  return (
    <SimShell icon="⚡" title="Delta Hedging Boss" subtitle={`Q${step+1}/${qs.length}`}>
      <Card><Text style={{ fontWeight: '800', color: Colors.text, marginBottom: 8 }}>{q.q}</Text>
        <TextInput style={s.input} placeholder={q.unit} keyboardType="numeric" value={answers[step]}
          onChangeText={v => setAns(step, v)} placeholderTextColor={Colors.textMuted} /></Card>
      <PBtn label="Submit" onPress={() => submit(step)} disabled={!answers[step]} />
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function FamaFrenchSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState<number|null>(null);
  const factors = [{ name:'Market β=1.3', ret:13 },{ name:'SMB β=0.8', ret:2.4 },{ name:'HML β=-0.5', ret:-1 }];
  const totalFactor = factors.reduce((s,f)=>s+f.ret,0);
  const alpha = 18 - totalFactor;
  const opts = [0, 3.6, 4.4, 18];
  return (
    <SimShell icon="📉" title="Fama-French Factor Model" subtitle="Strip away systematic risk">
      <Card>
        <Text style={s.body}>Strategy returned 18% last year. Market returned 10%.</Text>
        {factors.map((f,i) => <Row key={i} label={f.name} value={`${f.ret}%`} />)}
        <Row label="Total factor return" value={`${totalFactor}%`} accent />
      </Card>
      <Card><Text style={s.body}>What is the genuine alpha (strategy return − factor returns)?</Text>
        {opts.map((opt, i) => {
          const rev = ans !== null;
          const isCorrect = Math.abs(opt - alpha) < 0.1;
          let bg = Colors.card, border = Colors.border;
          if (rev && isCorrect) { bg='#d1fae5'; border=Colors.green; }
          if (rev && ans===i && !isCorrect) { bg='#fee2e2'; border=Colors.red; }
          return (
            <TouchableOpacity key={i} onPress={() => ans===null && setAns(i)} disabled={ans!==null}
              style={[{ borderRadius: Radius.sm, padding: Spacing.md, borderWidth: 1.5, backgroundColor: bg, borderColor: border, marginTop: 6 }]}>
              <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}%</Text>
            </TouchableOpacity>
          );
        })}
      </Card>
      {ans !== null && <>
        <ResultBox correct={Math.abs(opts[ans]-alpha)<0.1} message={Math.abs(opts[ans]-alpha)<0.1
          ? `Correct. Alpha = 18% − ${totalFactor}% = ${alpha}%. Most return was factor exposure.`
          : `Alpha = ${alpha}%. 18% total − ${totalFactor}% from factors.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function LagrangeOptSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState<number|null>(null);
  const opts = ['For each 1% more variance allowed, expected return increases by 3.2%','The portfolio has 3.2× leverage','Beta equals 3.2','Portfolio has 3.2 assets'];
  return (
    <SimShell icon="λ" title="Lagrange Multipliers" subtitle="Shadow price of a constraint">
      <Card><Text style={s.body}>Maximise portfolio return subject to variance ≤ 4%. The Lagrange multiplier λ = 3.2. What does this mean?</Text></Card>
      {opts.map((opt, i) => {
        const rev = ans !== null;
        const isCorrect = i === 0;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg='#d1fae5'; border=Colors.green; }
        if (rev && ans===i && !isCorrect) { bg='#fee2e2'; border=Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => ans===null && setAns(i)} disabled={ans!==null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border, marginBottom: 6 }]}>
            <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
      {ans !== null && <>
        <ResultBox correct={ans===0} message={ans===0
          ? `Correct. λ measures the shadow price — how much the objective improves per unit relaxation of the constraint.`
          : `λ = 3.2: relaxing variance limit by 1% increases optimal return by 3.2%. It is the market price of risk.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function CorrelationMatrixSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState('');
  const [sub, setSub] = useState(false);
  const n = 5; const correct = -(1/(n-1));
  const isOk = Math.abs(parseFloat(ans) - correct) <= 0.02;
  return (
    <SimShell icon="🔢" title="Equicorrelation Matrix" subtitle="Jane Street Problem 1">
      <Card>
        <Text style={s.body}>n=5 random variables, all pairs have the same correlation ρ. Eigenvalues:</Text>
        <Text style={s.formula}>λ₁ = 1 + (n-1)ρ{'\n'}λ₂ = 1 − ρ</Text>
        <Text style={s.body}>Both eigenvalues must be ≥ 0. What is the minimum valid ρ?</Text>
      </Card>
      {!sub
        ? <><TextInput style={s.input} placeholder="e.g. -0.25" keyboardType="numeric" value={ans} onChangeText={setAns} placeholderTextColor={Colors.textMuted} />
            <PBtn label="Submit" onPress={() => setSub(true)} disabled={!ans} /></>
        : <><ResultBox correct={isOk} message={isOk
              ? `Correct. λ₂ = 1-ρ ≥ 0 → ρ ≤ 1. λ₁ = 1+(n-1)ρ ≥ 0 → ρ ≥ -1/${n-1} = ${correct.toFixed(3)}.`
              : `Answer: -1/${n-1} ≈ ${correct.toFixed(3)}. You said ${ans}.`} />
            <PBtn label="Continue →" onPress={onComplete} /></>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

function PcaAnalysisSim({ onComplete, onSkip }: SimProps) {
  const [ans, setAns] = useState<number|null>(null);
  const opts = ['The direction of maximum variance in the data','The direction of minimum variance','The average of all features','The most correlated feature pair'];
  return (
    <SimShell icon="🔍" title="PCA" subtitle="What does the first principal component capture?">
      <Card><Text style={s.body}>For a 500-stock return matrix, PCA finds orthogonal directions of decreasing variance. What does the first principal component represent?</Text></Card>
      {opts.map((opt, i) => {
        const rev = ans !== null;
        const isCorrect = i === 0;
        let bg = Colors.card, border = Colors.border;
        if (rev && isCorrect) { bg='#d1fae5'; border=Colors.green; }
        if (rev && ans===i && !isCorrect) { bg='#fee2e2'; border=Colors.red; }
        return (
          <TouchableOpacity key={i} onPress={() => ans===null && setAns(i)} disabled={ans!==null}
            style={[{ borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, backgroundColor: bg, borderColor: border, marginBottom: 6 }]}>
            <Text style={{ fontWeight: '700', color: Colors.text }}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
      {ans !== null && <>
        <ResultBox correct={ans===0} message={ans===0
          ? `Correct. PC1 points in the direction of maximum variance. For US stocks, this is essentially the market factor — everything moving together.`
          : `PC1 = direction of maximum variance = effectively the market factor for US equities.`} />
        <PBtn label="Continue →" onPress={onComplete} />
      </>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────
// LAB 0 — NUMBERS ROOM SIMULATORS
// ─────────────────────────────────────────────────────────────

function MeanCalculatorSim({ onComplete, onSkip }: SimProps) {
  const returns = [2.1, -0.8, 3.4, -1.2, 0.5, -2.9, 1.1];
  const correctMean = parseFloat((returns.reduce((a,b)=>a+b,0)/returns.length).toFixed(2));
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isOk = Math.abs(parseFloat(input) - correctMean) <= 0.05;
  return (
    <SimShell icon="⚖️" title="Calculating the Mean" subtitle="Find the centre of a dataset">
      <Card>
        <Text style={s.sectionLabel}>BITCOIN — 7 DAILY RETURNS (%)</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:Spacing.sm}}>
          {returns.map((r,i)=>(
            <View key={i} style={[{borderRadius:Radius.sm,paddingHorizontal:10,paddingVertical:6},{backgroundColor:r>=0?'#d1fae5':'#fee2e2'}]}>
              <Text style={{fontWeight:'800',color:r>=0?Colors.green:Colors.red,fontSize:FontSize.sm}}>{r>=0?'+':''}{r}%</Text>
            </View>
          ))}
        </View>
        <Text style={s.formula}>Mean = (sum of all values) / number of values</Text>
        <Text style={s.body}>Add all 7 values together, then divide by 7. What is the mean daily return?</Text>
      </Card>
      {!submitted ? <>
        <TextInput style={s.input} placeholder="e.g. 0.31" keyboardType="numeric" value={input} onChangeText={setInput} placeholderTextColor={Colors.textMuted}/>
        <PBtn label="Submit" onPress={()=>setSubmitted(true)} disabled={!input}/>
      </> : <>
        <ResultBox correct={isOk} message={isOk
          ? `Correct. Sum = ${returns.reduce((a,b)=>a+b,0).toFixed(1)}%, divided by 7 = ${correctMean}%/day. This is the balance point — the "typical" daily return.`
          : `Answer: ${correctMean}%. Add all 7 values (total = ${returns.reduce((a,b)=>a+b,0).toFixed(1)}%), then divide by 7.`}/>
        <PBtn label="Continue →" onPress={onComplete}/>
      </>}
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
}

function StdDevCalculatorSim({ onComplete, onSkip }: SimProps) {
  const [step, setStep] = useState(0);
  const returns = [2.1,-0.8,3.4,-1.2,0.5,-2.9,1.1];
  const mean = returns.reduce((a,b)=>a+b,0)/returns.length;
  const squaredDiffs = returns.map(r=>Math.pow(r-mean,2));
  const variance = squaredDiffs.reduce((a,b)=>a+b,0)/returns.length;
  const stdDev = Math.sqrt(variance);
  const stepData = [
    {title:'Step 1 — Recall the mean', body:`Mean = ${mean.toFixed(2)}%\n(same 7 daily returns from before)`},
    {title:'Step 2 — Subtract the mean from each return, then square it', body:returns.map((r,i)=>`(${r>=0?'+':''}${r} - ${mean.toFixed(2)})² = (${(r-mean).toFixed(2)})² = ${squaredDiffs[i].toFixed(3)}`).join('\n')},
    {title:'Step 3 — Average the squared differences to get Variance', body:`Sum of squared diffs = ${squaredDiffs.reduce((a,b)=>a+b,0).toFixed(3)}\nVariance σ² = ${squaredDiffs.reduce((a,b)=>a+b,0).toFixed(3)} ÷ 7 = ${variance.toFixed(3)}`},
    {title:'Step 4 — Square root of Variance = Standard Deviation', body:`σ = √${variance.toFixed(3)} ≈ ${stdDev.toFixed(2)}%\n\nThis means daily returns typically sit within ±${stdDev.toFixed(1)}% of the mean.\nSmaller σ = more consistent. Larger σ = more volatile.`},
  ];
  return (
    <SimShell icon="📏" title="Standard Deviation" subtitle="How spread out is the data?">
      <Card>
        <Text style={s.sectionLabel}>{stepData[step].title.toUpperCase()}</Text>
        <Text style={s.formula}>{stepData[step].body}</Text>
      </Card>
      {step < stepData.length-1
        ? <PBtn label="Next Step →" onPress={()=>setStep(s=>s+1)}/>
        : <><ResultBox correct message={`σ ≈ ${stdDev.toFixed(2)}% is the volatility of this strategy. Two strategies with the same mean return but different σ are completely different risks. σ is always in the same units as the original data.`}/><PBtn label="Continue →" onPress={onComplete}/></>}
      <Text style={{textAlign:'center',color:Colors.textSoft,fontSize:FontSize.sm}}>Step {step+1} of {stepData.length}</Text>
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
}

function DistributionShapeSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<number|null>(null);
  const opts = [
    {label:'A symmetric bell shape — most values near the centre, fewer at the extremes', emoji:'🔔', correct:true, exp:'Correct. The normal distribution is a symmetric bell. The mean sits at the peak. Values become progressively less likely as you move away in either direction.'},
    {label:'Skewed right — a long tail on the right side', emoji:'📈', correct:false, exp:'No — skewed right means a long positive tail. The normal distribution is perfectly symmetric; neither tail is longer.'},
    {label:'Flat — every value equally likely', emoji:'▬', correct:false, exp:'No — that is a uniform distribution. The normal distribution peaks at the mean and tapers off symmetrically.'},
    {label:'Spiky — almost all values at one single point', emoji:'📍', correct:false, exp:'No — that would be a degenerate distribution with no spread. Normal distributions always have a smooth bell spread.'},
  ];
  return (
    <SimShell icon="📊" title="Distribution Shapes" subtitle="Recognise the normal distribution">
      <Card><Text style={s.body}>You plot 500 daily returns for a stock as a histogram. Most values cluster near 0%. Very large positive or negative days are rare. Which shape matches this histogram?</Text></Card>
      {opts.map((opt,i)=>{
        const rev=chosen!==null; const isC=opt.correct;
        let bg=Colors.card, border=Colors.border;
        if(rev&&isC){bg='#d1fae5';border=Colors.green;}
        if(rev&&chosen===i&&!isC){bg='#fee2e2';border=Colors.red;}
        return(
          <TouchableOpacity key={i} onPress={()=>chosen===null&&setChosen(i)} disabled={chosen!==null}
            style={[{borderRadius:Radius.md,borderWidth:1.5,padding:Spacing.md,backgroundColor:bg,borderColor:border}]}>
            <Text style={{fontSize:22,marginBottom:4}}>{opt.emoji}</Text>
            <Text style={{fontWeight:'700',color:Colors.text}}>{opt.label}</Text>
            {rev&&<Text style={{color:Colors.textSoft,fontSize:FontSize.sm,marginTop:4,lineHeight:18}}>{opt.exp}</Text>}
          </TouchableOpacity>
        );
      })}
      {chosen!==null&&<PBtn label="Continue →" onPress={onComplete}/>}
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
}

function NormalDistributionSim({ onComplete, onSkip }: SimProps) {
  const [stage, setStage] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [ans, setAns] = useState<number|null>(null);
  const sigma=1.5;
  const bands=[
    {pct:68,range:'±1σ = -1.5% to +1.5%',bg:'#d1fae5'},
    {pct:95,range:'±2σ = -3.0% to +3.0%',bg:'#dbeafe'},
    {pct:99.7,range:'±3σ = -4.5% to +4.5%',bg:'#ede9fe'},
  ];
  const questions=[
    {q:'Daily returns: μ=0%, σ=1.5%. What percentage of days have returns between -1.5% and +1.5%?', opts:[50,68,95,99.7], correct:68},
    {q:'A return of -4.5% occurs. That is exactly 3σ below the mean. How often does that happen (both tails combined)?', opts:[5,2.5,0.3,0.1], correct:0.3},
  ];
  if(stage===0) return(
    <SimShell icon="🔔" title="The Normal Distribution" subtitle="The 68-95-99.7 Rule">
      <Card>
        <Text style={s.body}>Strategy: mean daily return μ = 0%, standard deviation σ = 1.5%. Under the normal distribution, here is exactly what that means:</Text>
        {bands.map((b2,i)=>(
          <View key={i} style={{borderRadius:Radius.sm,padding:Spacing.sm,marginTop:6,backgroundColor:b2.bg}}>
            <Text style={{fontWeight:'900',color:Colors.text,fontSize:FontSize.lg}}>{b2.pct}% of days</Text>
            <Text style={{color:Colors.textSoft,fontSize:FontSize.sm}}>Returns in range: {b2.range}</Text>
          </View>
        ))}
        <Text style={[s.body,{marginTop:Spacing.sm,fontWeight:'700'}]}>Outside 3σ: only 0.3% of days — about 1 trading day per year.</Text>
      </Card>
      <PBtn label="Test My Understanding →" onPress={()=>setStage(1)}/>
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
  const q=questions[qIdx];
  return(
    <SimShell icon="🔔" title="Normal Distribution" subtitle={`Question ${qIdx+1}/${questions.length}`}>
      <Card>
        <Text style={{fontWeight:'800',color:Colors.text,marginBottom:Spacing.sm}}>{q.q}</Text>
        {q.opts.map((opt,i)=>{
          const rev=ans!==null; const isC=opt===q.correct;
          let bg=Colors.card,border=Colors.border;
          if(rev&&isC){bg='#d1fae5';border=Colors.green;}
          if(rev&&ans===i&&!isC){bg='#fee2e2';border=Colors.red;}
          return(
            <TouchableOpacity key={i} onPress={()=>ans===null&&setAns(i)} disabled={ans!==null}
              style={[{borderRadius:Radius.sm,padding:Spacing.md,borderWidth:1.5,backgroundColor:bg,borderColor:border,marginBottom:6}]}>
              <Text style={{fontWeight:'700',color:Colors.text}}>{opt}%</Text>
            </TouchableOpacity>
          );
        })}
      </Card>
      {ans!==null&&(qIdx<questions.length-1
        ?<PBtn label="Next →" onPress={()=>{setAns(null);setQIdx(q2=>q2+1);}}/>
        :<><ResultBox correct message="The 68-95-99.7 rule is your mental ruler for normality. Commit it to memory — you will use it constantly to judge whether something is surprising."/><PBtn label="Continue →" onPress={onComplete}/></>
      )}
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
}

function CorrelationIntuitionSim({ onComplete, onSkip }: SimProps) {
  const [chosen, setChosen] = useState<Record<number,number>>({});
  const scenarios=[
    {pair:'BTC and ETH on the same day', correct:0},
    {pair:'Gold price and S&P 500 daily returns', correct:2},
    {pair:'A fair coin flip and the next day\'s BTC return', correct:1},
    {pair:'Solana and Ethereum in a broad crypto rally', correct:0},
  ];
  const optLabels=[
    {short:'Strong positive (ρ ≈ +0.9)', exp:'They tend to rise and fall together strongly.'},
    {short:'No correlation (ρ ≈ 0.0)', exp:'Completely unrelated — knowing one tells you nothing about the other.'},
    {short:'Weak negative (ρ ≈ −0.1 to −0.2)', exp:'Slight tendency to move in opposite directions — mild diversification benefit.'},
  ];
  const correctAnswers=['ρ ≈ +0.90','ρ ≈ −0.15','ρ ≈ 0.00','ρ ≈ +0.85'];
  const allDone=Object.keys(chosen).length===scenarios.length;
  const score=scenarios.filter((_,i)=>chosen[i]===scenarios[i].correct).length;
  return(
    <SimShell icon="🔗" title="Correlation Intuition" subtitle="Match each pair to its relationship">
      <Card><Text style={s.body}>Correlation ρ ranges from −1 (perfect opposite) through 0 (unrelated) to +1 (perfect together). Match each pair to the most accurate description.</Text></Card>
      {scenarios.map((sc,i)=>(
        <Card key={i}>
          <Text style={{fontWeight:'800',color:Colors.text,marginBottom:6}}>{sc.pair}</Text>
          {optLabels.map((opt,j)=>{
            const selected=chosen[i]===j; const rev=chosen[i]!==undefined; const isC=j===sc.correct;
            let bg=Colors.card,border=Colors.border,tc=Colors.text;
            if(rev&&isC){bg='#d1fae5';border=Colors.green;tc='#065f46';}
            if(rev&&selected&&!isC){bg='#fee2e2';border=Colors.red;tc='#7f1d1d';}
            return(
              <TouchableOpacity key={j} onPress={()=>chosen[i]===undefined&&setChosen(c=>({...c,[i]:j}))} disabled={chosen[i]!==undefined}
                style={[{borderRadius:Radius.sm,padding:Spacing.sm,borderWidth:1.5,marginBottom:4,backgroundColor:bg,borderColor:border}]}>
                <Text style={{fontWeight:'600',color:tc,fontSize:FontSize.sm}}>{opt.short}</Text>
              </TouchableOpacity>
            );
          })}
          {chosen[i]!==undefined&&<Text style={{color:Colors.accent,fontSize:FontSize.xs,fontWeight:'700',marginTop:4}}>Correct: {correctAnswers[i]}</Text>}
        </Card>
      ))}
      {allDone&&<><ResultBox correct={score>=3} message={`${score}/${scenarios.length}. Key takeaway: BTC and ETH moving together (ρ≈0.9) means owning both is barely more diversified than owning one. True diversification requires low or negative correlation between holdings.`}/><PBtn label="Continue →" onPress={onComplete}/></>}
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
}

function CentralLimitTheoremSim({ onComplete, onSkip }: SimProps) {
  const [n, setN] = useState(1);
  const [means, setMeans] = useState<number[]>([]);
  const simulate = (sampleSize: number) => {
    const ms: number[] = [];
    for(let i=0;i<600;i++){
      let sum=0;
      for(let j=0;j<sampleSize;j++) sum+=(-Math.log(Math.random())*2-2);
      ms.push(sum/sampleSize);
    }
    setMeans(ms);
  };
  const BUCKETS=24; const MIN=-3; const MAX=3;
  const hist=Array(BUCKETS).fill(0);
  means.forEach(m=>{const idx=Math.floor((Math.min(Math.max(m,MIN),MAX-0.001)-MIN)/((MAX-MIN)/BUCKETS));if(idx>=0&&idx<BUCKETS)hist[idx]++;});
  const maxH=Math.max(...hist,1);
  const isNormal=(stdev: number[])=>{
    if(stdev.length<10)return false;
    const m=stdev.reduce((a,b)=>a+b,0)/stdev.length;
    const v=stdev.reduce((a,b)=>a+Math.pow(b-m,2),0)/stdev.length;
    const s=Math.sqrt(v);
    const within1=stdev.filter(x=>Math.abs(x-m)<s).length/stdev.length;
    return within1>0.60&&within1<0.75;
  };
  return(
    <SimShell icon="🔔" title="Central Limit Theorem" subtitle="Why bell curves appear everywhere">
      <Card>
        <Text style={s.body}>The underlying data is <Text style={{fontWeight:'800',color:Colors.red}}>skewed and non-normal</Text> — like many real financial datasets. Watch what happens to the distribution of <Text style={{fontWeight:'800'}}>sample means</Text> as you increase the sample size.</Text>
        <Text style={[s.sectionLabel,{marginTop:Spacing.sm}]}>SAMPLE SIZE n = {n}</Text>
        <View style={{flexDirection:'row',gap:6}}>
          {[1,5,30].map(sz=>(
            <TouchableOpacity key={sz} onPress={()=>{setN(sz);setMeans([]);}}
              style={[b.primary,{flex:1,backgroundColor:n===sz?Colors.accent:'#e2e8f0'}]}>
              <Text style={[b.primaryText,{color:n===sz?'#fff':Colors.textSoft}]}>n = {sz}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      <PBtn label="Simulate 600 Sample Means" onPress={()=>simulate(n)}/>
      {means.length>0&&<>
        <Card>
          <Text style={s.sectionLabel}>HISTOGRAM OF 600 SAMPLE MEANS</Text>
          <View style={{flexDirection:'row',alignItems:'flex-end',height:90,gap:1,marginBottom:6}}>
            {hist.map((count,i)=>(
              <View key={i} style={{flex:1,height:(count/maxH)*90,backgroundColor:Colors.accent,borderRadius:2}}/>
            ))}
          </View>
          <Text style={{fontSize:FontSize.xs,color:Colors.textSoft,textAlign:'center'}}>← {MIN}%   centre = 0%   {MAX}% →</Text>
          <Text style={[s.body,{marginTop:Spacing.sm,fontWeight:'700',color: n===1?Colors.red:n===5?Colors.amber??Colors.accent:Colors.green}]}>
            {n===1?'Still skewed — each "mean" is just one raw value.':n===5?'Getting more symmetric. The skew is fading.':'🔔 Looks like a bell curve! Even though the raw data was skewed.'}
          </Text>
        </Card>
        {n===30&&<><ResultBox correct message="That is the Central Limit Theorem. As sample size grows, the distribution of sample means becomes normal — regardless of the original distribution's shape. This is why p-values, confidence intervals, and hypothesis tests all use the normal distribution even on messy data."/><PBtn label="Continue →" onPress={onComplete}/></>}
      </>}
      <GBtn label="Skip" onPress={onSkip}/>
    </SimShell>
  );
}


// ── Lab 7: Python Tool Selector ───────────────────────────────
function PythonToolSelectorSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    {
      problem: 'You need to build a minimum-variance portfolio with constraints: fully invested, max 10% per stock, no shorts.',
      options: ['pandas', 'cvxpy', 'xgboost', 'statsmodels'],
      correct: 'cvxpy',
      explanation: 'cvxpy handles convex optimisation — this is a quadratic programming problem with linear constraints. pandas handles the data prep, but the optimisation itself needs cvxpy.',
    },
    {
      problem: 'You have 500 stocks and 10 years of daily returns. You want to find the top 3 principal components explaining most variance.',
      options: ['QuantLib', 'FinRL', 'numpy/scipy', 'vectorbt'],
      correct: 'numpy/scipy',
      explanation: 'PCA is a linear algebra operation — numpy\'s linalg.eig or scipy.linalg.svd. QuantLib is for derivative pricing. FinRL is for RL trading agents. vectorbt is for backtesting.',
    },
    {
      problem: 'You want to test 5,000 parameter combinations of a moving average crossover strategy overnight.',
      options: ['NautilusTrader', 'vectorbt', 'Gurobi', 'polars'],
      correct: 'vectorbt',
      explanation: 'vectorbt is built for fast vectorised parameter sweeps — it runs thousands of combinations in seconds using numpy under the hood. NautilusTrader is production-grade but slower for scanning.',
    },
    {
      problem: 'You need to price a barrier option and compute its delta analytically.',
      options: ['xgboost', 'QuantLib', 'statsmodels', 'yfinance'],
      correct: 'QuantLib',
      explanation: 'QuantLib has built-in barrier option pricers with analytical Greeks. xgboost is an ML model. statsmodels is for econometric regression. yfinance is for downloading market data.',
    },
    {
      problem: 'You want to test whether your strategy\'s alpha is statistically significant after controlling for market, size, and value factors.',
      options: ['cvxpy', 'pytorch', 'statsmodels', 'polars'],
      correct: 'statsmodels',
      explanation: 'Fama-French regression with Newey-West standard errors is exactly what statsmodels.OLS is built for. It handles heteroskedasticity and autocorrelation correction that vanilla linear regression ignores.',
    },
  ];

  const [idx, setIdx] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const current = scenarios[idx];
  const isCorrect = selected === current.correct;

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === current.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx + 1 >= scenarios.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
  };

  if (done) return (
    <SimShell title="Python Tool Selector" icon="🛠️">
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>{score >= 4 ? '🏆' : score >= 3 ? '✅' : '📚'}</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>
          {score}/{scenarios.length} correct
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
          {score === 5 ? 'Perfect. You know your toolkit.' : score >= 3 ? 'Solid. Review the ones you missed.' : 'Revisit the tool overview levels before moving on.'}
        </Text>
        <GBtn label="Complete" onPress={onComplete} />
      </View>
    </SimShell>
  );

  return (
    <SimShell title="Python Tool Selector" icon="🛠️">
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 11, color: '#6366f1', fontWeight: '700', marginBottom: 6 }}>
          SCENARIO {idx + 1} OF {scenarios.length}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a', lineHeight: 22, marginBottom: 16 }}>
          {current.problem}
        </Text>
        <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Which tool do you reach for?</Text>
        {current.options.map(opt => {
          let bg = '#f0f4ff';
          let border = '#6366f1';
          let textColor = '#0f172a';
          if (selected) {
            if (opt === current.correct) { bg = '#d1fae5'; border = '#10b981'; }
            else if (opt === selected) { bg = '#fee2e2'; border = '#ef4444'; }
            else { bg = '#f8fafc'; border = '#e2e8f0'; textColor = '#94a3b8'; }
          }
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => handleSelect(opt)}
              style={{ backgroundColor: bg, borderWidth: 2, borderColor: border, borderRadius: 10, padding: 14, marginBottom: 8 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
        {selected && (
          <View style={{ backgroundColor: isCorrect ? '#d1fae5' : '#fef3c7', borderRadius: 10, padding: 14, marginTop: 8 }}>
            <Text style={{ fontSize: 13, color: '#0f172a', lineHeight: 20 }}>
              {isCorrect ? '✅ ' : '💡 '}{current.explanation}
            </Text>
          </View>
        )}
      </View>
      {selected && <GBtn label={idx + 1 < scenarios.length ? 'Next →' : 'See Results'} onPress={handleNext} />}
      {!selected && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Dispatcher ────────────────────────────────────────────────
const QUANT_SIMULATORS: Record<string, React.FC<SimProps>> = {
  conditionalProb:        ConditionalProbSim,
  bayesianUpdater:        BayesianUpdaterSim,
  expectedValue:          ExpectedValueSim,
  kellyCriterion:         KellyCriterionSim,
  monteCarlo:             MonteCarloSim,
  multipleComparisons:    MultipleComparisonsSim,
  alphaRegression:        AlphaRegressionSim,
  fatTails:               FatTailsSim,
  sharpeRatio:            SharpeRatioSim,
  permutationTest:        PermutationTestSim,
  famaFrench:             FamaFrenchSim,
  covarianceMatrix:       CovarianceMatrixSim,
  markowitzOptimiser:     MarkowitzOptimiserSim,
  pcaAnalysis:            PcaAnalysisSim,
  psdMatrix:              PsdMatrixSim,
  factorModel:            FamaFrenchSim,
  correlationMatrix:      CorrelationMatrixSim,
  gradientDescent:        GradientDescentSim,
  deltaGamma:             DeltaGammaSim,
  impliedVol:             ImpliedVolSim,
  lagrangeOpt:            LagrangeOptSim,
  brownianMotion:         BrownianMotionSim,
  gbmSimulator:           GbmSimulatorSim,
  blackScholesCalc:       BlackScholesCalcSim,
  blackScholesDerivation: BlackScholesDerivationSim,
  bossBlackScholes:       BossBlackScholesSim,
  volSurface:             VolSurfaceSim,
  garchModel:             GarchModelSim,
  monteCarloOptions:      MonteCarloOptionsSim,
  mentalMaths:            MentalMathsSim,
  conditionalRegression:  ConditionalRegressionSim,
  dynamicProgramming:     DynamicProgrammingSim,
  targetSum:              TargetSumSim,
  marketMaking:           MarketMakingSim,
  deltaHedgingBoss:       DeltaHedgingBossSim,
  // Lab 7 — Practitioner's Toolkit
  pythonToolSelector:     PythonToolSelectorSim,
  // Lab 0 — Numbers Room
  meanCalculator:         MeanCalculatorSim,
  stdDevCalculator:       StdDevCalculatorSim,
  distributionShape:      DistributionShapeSim,
  normalDistribution:     NormalDistributionSim,
  correlationIntuition:   CorrelationIntuitionSim,
  centralLimitTheorem:    CentralLimitTheoremSim,
  // Lab 8 — Applied Quant Python
  returnsImplementation:      ReturnsImplementationSim,
  sharpeImplementation:       SharpeImplementationSim,
  maxDrawdownImplementation:  MaxDrawdownImplementationSim,
  bayesianUpdaterCode:        BayesianUpdaterCodeSim,
  kellyImplementation:        KellyImplementationSim,
  markowitzImplementation:    MarkowitzImplementationSim,
  regressionImplementation:   RegressionImplementationSim,
  famaFrenchImplementation:   FamaFrenchImplementationSim,
  monteCarloImplementation:   MonteCarloImplementationSim,
  blackScholesImplementation: BlackScholesImplementationSim,
  backtestImplementation:     BacktestImplementationSim,
  momentumSignalCode:         MomentumSignalCodeSim,
  pairsTradeCode:             PairsTradeCodeSim,
  mlSignalCode:               MlSignalCodeSim,
  riskSystemCode:             RiskSystemCodeSim,
  dataIngestionCode:          DataIngestionCodeSim,
  vectorbtBacktest:           VectorbtBacktestSim,
  interviewCodeChallenge:     InterviewCodeChallengeSim,
  completeQuantPipeline:      CompleteQuantPipelineSim,
  lab8Boss:                   Lab8BossSim,
};

interface QuantSimulatorCardProps {
  simulatorType: string;
  onComplete: () => void;
  onSkip: () => void;
}

export { QUANT_SIMULATORS };
export default function QuantSimulatorCard({ simulatorType, onComplete, onSkip }: QuantSimulatorCardProps) {
  const Sim = QUANT_SIMULATORS[simulatorType];
  if (!Sim) {
    return (
      <SimShell icon="🔬" title="Quant Simulator" subtitle="Coming soon">
        <Card><Text style={s.body}>Simulator '{simulatorType}' is being built. Keep going!</Text></Card>
        <PBtn label="Continue →" onPress={onComplete} />
        <GBtn label="Skip" onPress={onSkip} />
      </SimShell>
    );
  }
  return <Sim onComplete={onComplete} onSkip={onSkip} />;
}

// ══════════════════════════════════════════════════════════════════════════════
// LAB 8 — APPLIED QUANT PYTHON SIMULATORS
// Each simulator teaches code review, debugging, or MCQ about implementation.
// ══════════════════════════════════════════════════════════════════════════════

// ── Returns Implementation ──────────────────────────────────────────────────
function ReturnsImplementationSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'You have prices = [100, 102, 99]. What does prices.pct_change() give for index 1?',
      opts: ['0.02', '2.0', '-0.02', '0.002'],
      correct: 0,
      explain: 'pct_change computes (102-100)/100 = 0.02. Returns are in decimal, not percent.',
    },
    {
      q: 'Why use log returns instead of simple returns for statistical analysis?',
      opts: ['Log returns are always positive','Log returns are additive across time','Log returns never exceed 1','Log returns are faster to compute'],
      correct: 1,
      explain: 'Log returns are time-additive: log(P_T/P_0) = sum of daily log returns. Simple returns compound multiplicatively, making statistics harder.',
    },
    {
      q: 'To annualise a mean daily simple return r_daily, you compute:',
      opts: ['r_daily * 252','(1 + r_daily)^252 - 1','r_daily * sqrt(252)','r_daily^252'],
      correct: 1,
      explain: 'Compounding over 252 days: (1 + r_daily)^252 - 1. The sqrt(252) formula is for volatility, not returns.',
    },
    {
      q: 'np.log(prices / prices.shift(1)) produces:',
      opts: ['Simple returns','Log returns','Percentage returns','Cumulative returns'],
      correct: 1,
      explain: 'log(P_t / P_{t-1}) is the log return. shift(1) gives the previous day\'s price.',
    },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const handleAnswer = (i: number) => {
    if (sel !== null) return;
    setSel(i);
    if (i === cur.correct) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (idx + 1 < questions.length) { setIdx(i => i + 1); setSel(null); }
    else setDone(true);
  };
  if (done) return (
    <SimShell icon="📈" title="Returns Implementation" subtitle="Score results">
      <Card><Text style={s.body}>{score}/{questions.length} correct</Text>
        <Text style={s.body}>{score === questions.length ? '✅ Perfect — you know your return formulas cold.' : '📖 Review: pct_change() = simple, log(P/P.shift(1)) = log return, annualise with (1+r)^252.'}</Text>
      </Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="📈" title="Returns Implementation" subtitle={`Q${idx+1}/${questions.length}: Code review`}>
      <Card><Text style={[s.sectionLabel]}>QUESTION</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => handleAnswer(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx + 1 < questions.length ? 'Next →' : 'Finish'} onPress={handleNext} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Sharpe Implementation ────────────────────────────────────────────────────
function SharpeImplementationSim({ onComplete, onSkip }: SimProps) {
  const [rf, setRf] = useState('4');
  const [returns, setReturns] = useState('0.08');
  const [vol, setVol] = useState('0.15');
  const [result, setResult] = useState<string | null>(null);
  const calculate = () => {
    const mu = parseFloat(returns);
    const sigma = parseFloat(vol);
    const rfRate = parseFloat(rf) / 100;
    if (isNaN(mu) || isNaN(sigma) || isNaN(rfRate) || sigma <= 0) { setResult('Invalid inputs'); return; }
    const sharpe = (mu - rfRate) / sigma;
    const quality = sharpe > 2 ? '🌟 Exceptional (likely overfit in backtest)' : sharpe > 1 ? '✅ Strong — worth investigating' : sharpe > 0.5 ? '⚠️ Mediocre — common for real strategies' : '❌ Poor — not worth deploying';
    setResult(`Sharpe = (${mu} - ${rfRate}) / ${sigma} = ${sharpe.toFixed(3)}\n\nRating: ${quality}\n\nAnnualisation: this uses annual inputs. With daily returns multiply by √252.`);
  };
  return (
    <SimShell icon="📐" title="Sharpe Ratio Calculator" subtitle="Build the formula, understand the output">
      <Card>
        <Text style={s.sectionLabel}>INPUTS (annual, decimal)</Text>
        <Text style={s.fieldLabel}>Strategy Return (e.g. 0.12 = 12%)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: FontSize.sm }} value={returns} onChangeText={setReturns} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Volatility / Std Dev (e.g. 0.15 = 15%)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: FontSize.sm }} value={vol} onChangeText={setVol} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Risk-Free Rate % (e.g. 4)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: FontSize.sm }} value={rf} onChangeText={setRf} keyboardType="decimal-pad" />
      </Card>
      <PBtn label="Calculate Sharpe" onPress={calculate} />
      {result && <Card><Text style={s.body}>{result}</Text></Card>}
      {result && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Max Drawdown Implementation ───────────────────────────────────────────────
function MaxDrawdownImplementationSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'An equity curve goes: 100 → 120 → 90 → 110. What is max drawdown?', opts: ['10%','25%','17%','33%'], correct: 1, explain: 'Peak is 120, trough is 90. Drawdown = (90-120)/120 = -25%. Max drawdown = 25%.' },
    { q: 'In pandas, equity.cummax() gives:', opts: ['The final maximum','The rolling maximum up to each date','The daily changes in maximum','The maximum of each rolling window'], correct: 1, explain: 'cummax() tracks the running peak — the highest value seen up to and including each date. That\'s exactly what you need for drawdown calculation.' },
    { q: 'Calmar ratio = ?', opts: ['Sharpe / Drawdown','Annual Return / Max Drawdown','Sharpe * Sortino','Return / Volatility'], correct: 1, explain: 'Calmar = annual return divided by max drawdown. Measures return earned per unit of worst-case loss. > 1.0 is acceptable, > 3.0 is excellent.' },
    { q: 'A strategy has Sharpe 2.1 but max drawdown 45%. What does this mean?', opts: ['Great strategy','Dangerous — 45% drawdown means most investors would redeem','Average performance','The Sharpe is wrong'], correct: 1, explain: 'High Sharpe with high drawdown means volatile returns with good average but terrible extremes. Most institutional investors have hard drawdown limits (often 15-20%).' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const handleAnswer = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const handleNext = () => { if (idx + 1 < questions.length) { setIdx(i => i + 1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="📉" title="Max Drawdown" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ Solid. Always report Sharpe AND drawdown together.' : '📖 Key: peak-to-trough decline, cummax() tracks the rolling peak.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="📉" title="Max Drawdown" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>QUESTION</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => handleAnswer(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx + 1 < questions.length ? 'Next →' : 'Finish'} onPress={handleNext} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Bayesian Updater Code ─────────────────────────────────────────────────────
function BayesianUpdaterCodeSim({ onComplete, onSkip }: SimProps) {
  const [prior, setPrior] = useState('0.1');
  const [pEvidTrue, setPEvidTrue] = useState('0.7');
  const [pEvidFalse, setPEvidFalse] = useState('0.3');
  const [beliefs, setBeliefs] = useState<number[]>([]);
  const [updates, setUpdates] = useState(0);
  const currentBelief = beliefs.length > 0 ? beliefs[beliefs.length - 1] : parseFloat(prior) || 0.1;
  const runUpdate = () => {
    const p = currentBelief;
    const lTrue = parseFloat(pEvidTrue);
    const lFalse = parseFloat(pEvidFalse);
    if (isNaN(p) || isNaN(lTrue) || isNaN(lFalse)) return;
    const pEvid = lTrue * p + lFalse * (1 - p);
    const posterior = (lTrue * p) / pEvid;
    setBeliefs(b => [...b, posterior]);
    setUpdates(u => u + 1);
  };
  const reset = () => { setBeliefs([]); setUpdates(0); };
  return (
    <SimShell icon="🧮" title="Bayesian Updater" subtitle="Watch belief converge with evidence">
      <Card>
        <Text style={s.sectionLabel}>SCENARIO: Does this fund have real alpha?</Text>
        <Text style={s.body}>Prior = 10% (most funds have no alpha). Each update = one quarter of positive performance.</Text>
        <Text style={s.fieldLabel}>P(evidence | alpha exists)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={pEvidTrue} onChangeText={setPEvidTrue} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>P(evidence | no alpha)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, fontSize: FontSize.sm }} value={pEvidFalse} onChangeText={setPEvidFalse} keyboardType="decimal-pad" />
      </Card>
      <Card>
        <Text style={s.sectionLabel}>CURRENT BELIEF</Text>
        <Text style={{ fontSize: 36, fontWeight: '900', color: Colors.accent, textAlign: 'center' }}>{(currentBelief * 100).toFixed(1)}%</Text>
        <Text style={[s.body, { textAlign: 'center', marginTop: 4 }]}>after {updates} update{updates !== 1 ? 's' : ''}</Text>
        {beliefs.length > 0 && <View style={{ marginTop: 12 }}>{beliefs.map((b, i) => <Row key={i} label={`Update ${i+1}`} value={`${(b*100).toFixed(1)}%`} accent={i === beliefs.length - 1} />)}</View>}
      </Card>
      <PBtn label="Add Evidence (new quarter)" onPress={runUpdate} />
      {updates > 0 && <GBtn label="Reset" onPress={reset} />}
      {updates >= 3 && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Kelly Implementation ──────────────────────────────────────────────────────
function KellyImplementationSim({ onComplete, onSkip }: SimProps) {
  const [mu, setMu] = useState('0.001');
  const [sigma, setSigma] = useState('0.012');
  const [fraction, setFraction] = useState('0.5');
  const [result, setResult] = useState<string | null>(null);
  const calculate = () => {
    const m = parseFloat(mu);
    const s = parseFloat(sigma);
    const f = parseFloat(fraction);
    if (isNaN(m) || isNaN(s) || s <= 0 || isNaN(f)) { setResult('Invalid inputs'); return; }
    const variance = s * s;
    const fullKelly = m / variance;
    const fracKelly = fullKelly * f;
    const warning = fracKelly > 0.5 ? '\n⚠️ WARNING: position > 50% of capital. Estimation error makes full Kelly dangerous.' : '';
    const direction = fracKelly > 0 ? 'LONG' : fracKelly < 0 ? 'SHORT (negative edge)' : 'NO POSITION';
    setResult(`Mean daily return: ${(m*100).toFixed(3)}%\nDaily variance: ${variance.toFixed(7)}\n\nFull Kelly: ${(fullKelly*100).toFixed(1)}% of capital\n${(f*100).toFixed(0)}% Kelly: ${(fracKelly*100).toFixed(1)}% of capital\n\nDirection: ${direction}${warning}`);
  };
  return (
    <SimShell icon="🎯" title="Kelly Criterion" subtitle="Compute optimal position size">
      <Card>
        <Text style={s.sectionLabel}>CONTINUOUS KELLY: f* = μ / σ²</Text>
        <Text style={s.fieldLabel}>Mean Daily Return (e.g. 0.001)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={mu} onChangeText={setMu} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Daily Std Dev (e.g. 0.012)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={sigma} onChangeText={setSigma} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Fraction of Full Kelly (0.25–0.5 recommended)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, fontSize: FontSize.sm }} value={fraction} onChangeText={setFraction} keyboardType="decimal-pad" />
      </Card>
      <PBtn label="Calculate Kelly Size" onPress={calculate} />
      {result && <Card><Text style={s.body}>{result}</Text></Card>}
      {result && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Markowitz Implementation ──────────────────────────────────────────────────
function MarkowitzImplementationSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'In cvxpy, cp.quad_form(w, Sigma) computes:', opts: ['w + Sigma','wᵀΣw (portfolio variance)','w * Sigma * w','tr(Sigma)'], correct: 1, explain: 'quad_form(w, Sigma) = wᵀΣw, the portfolio variance. This is the objective to minimise.' },
    { q: 'cp.sum(w) == 1 in the constraints means:', opts: ['All weights are equal','Short selling is allowed','Weights sum to 1 (fully invested)','Portfolio has 100 assets'], correct: 2, explain: 'Full investment constraint: all capital must be deployed. Without it, the optimiser would set all weights to 0 (zero risk = zero investment).' },
    { q: 'prob.status == "infeasible" means:', opts: ['The problem is solved','The constraints are contradictory — no valid solution exists','The solver is too slow','The covariance matrix is wrong'], correct: 1, explain: 'Infeasible means the constraint set is empty — you\'ve asked for something impossible, e.g. min 5% in 30 assets with a 100% total constraint requires 150% of capital.' },
    { q: 'Why must the covariance matrix be positive semi-definite (PSD) for Markowitz to work?', opts: ['It makes the maths faster','Portfolio variance = wᵀΣw must be ≥ 0 for all w — only PSD matrices guarantee this','PSD matrices are easier to invert','cvxpy requires PSD inputs'], correct: 1, explain: 'Portfolio variance must be non-negative. wᵀΣw ≥ 0 for all weight vectors w only if Σ is positive semi-definite. Non-PSD matrices can give negative variance — physically impossible.' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx + 1 < questions.length) { setIdx(i => i + 1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="⚖️" title="Markowitz" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You can debug Markowitz in code.' : '📖 Key: quad_form = wᵀΣw, PSD matrix required, infeasible = contradictory constraints.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="⚖️" title="Markowitz in cvxpy" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>CODE REVIEW</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx + 1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Regression Implementation ─────────────────────────────────────────────────
function RegressionImplementationSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: "sm.add_constant(X) is called before OLS. What happens if you skip it?", opts: ["Model errors","Regression has no intercept — forces line through origin, biasing all coefficients","Newey-West fails","Model runs the same"], correct: 1, explain: "Without add_constant, there's no alpha term. The model assumes zero return when all factors are zero — a massive bias. Alpha is usually what you're testing for." },
    { q: "cov_type='HAC' in .fit() does what?", opts: ["Makes the model faster","Applies Newey-West heteroskedasticity and autocorrelation consistent standard errors","Removes outliers","Bootstraps the coefficients"], correct: 1, explain: "HAC = Heteroskedasticity and Autocorrelation Consistent. Financial returns violate OLS assumptions (they're autocorrelated and have changing variance). HAC corrects standard errors for both." },
    { q: "After Fama-French regression, alpha p-value = 0.04. Is the alpha real?", opts: ["Yes, p < 0.05","Maybe — depends on how many strategies were tested (multiple comparisons problem)","No, never trust regression","Yes, always"], correct: 1, explain: "p=0.04 with one test: borderline significant. But if you tested 50 strategies, you'd expect 2-3 to show p<0.05 by chance alone. Always apply Bonferroni or walk-forward out-of-sample test." },
    { q: "results.rsquared = 0.85 in a factor regression means:", opts: ["The strategy beats the market","85% of return variance is explained by the factors — very little unexplained residual","Alpha is 85%","85% of days are profitable"], correct: 1, explain: "R² = fraction of variance explained by factors. High R² means the strategy largely mirrors known risk premia. Low R² with significant alpha means there's something genuinely novel." },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx + 1 < questions.length) { setIdx(i => i + 1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="📊" title="OLS & Newey-West" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You understand regression for finance.' : '📖 Key: always add_constant, use HAC for financial data, multiple comparisons invalidates many p-values.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="📊" title="OLS Regression Review" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>IMPLEMENTATION QUESTION</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx + 1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Fama-French Implementation ─────────────────────────────────────────────────
function FamaFrenchImplementationSim({ onComplete, onSkip }: SimProps) {
  const [asset, setAsset] = useState('');
  const [alpha, setAlpha] = useState('');
  const [pval, setPval] = useState('');
  const [beta, setBeta] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const interpret = () => {
    const a = parseFloat(alpha);
    const p = parseFloat(pval);
    const b = parseFloat(beta);
    if (isNaN(a) || isNaN(p) || isNaN(b)) { setResult('Enter all values'); return; }
    const sig = p < 0.05 ? '✅ Statistically significant' : p < 0.10 ? '⚠️ Marginally significant (10% level only)' : '❌ Not significant — could be noise';
    const alphaQ = a > 0 ? 'Positive alpha — earns above what factors explain' : 'Negative alpha — factors explain more than the return';
    const betaQ = b > 1.2 ? 'High market beta — amplifies market moves' : b < 0.8 ? 'Low beta — defensive, less market exposure' : 'Normal market beta (0.8–1.2)';
    setResult(`Asset: ${asset || 'unnamed'}\n\nAlpha: ${(a*100).toFixed(2)}% annual → ${alphaQ}\nP-value: ${p} → ${sig}\nMarket beta: ${b.toFixed(2)} → ${betaQ}\n\nKey question: did you run multiple strategies? If yes, apply Bonferroni correction to the p-value threshold.`);
  };
  return (
    <SimShell icon="🔬" title="Fama-French Interpreter" subtitle="Enter your regression output">
      <Card>
        <Text style={s.sectionLabel}>PASTE YOUR RESULTS</Text>
        <Text style={s.fieldLabel}>Asset / Strategy Name</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={asset} onChangeText={setAsset} placeholder="e.g. SPY momentum strategy" />
        <Text style={s.fieldLabel}>Annual Alpha (decimal, e.g. 0.03)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={alpha} onChangeText={setAlpha} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Alpha P-value</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={pval} onChangeText={setPval} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Market Beta (MKT-RF coefficient)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, fontSize: FontSize.sm }} value={beta} onChangeText={setBeta} keyboardType="decimal-pad" />
      </Card>
      <PBtn label="Interpret Results" onPress={interpret} />
      {result && <Card><Text style={s.body}>{result}</Text></Card>}
      {result && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Monte Carlo Implementation ─────────────────────────────────────────────────
function MonteCarloImplementationSim({ onComplete, onSkip }: SimProps) {
  const [mu, setMu] = useState('0.08');
  const [sigma, setSigma] = useState('0.20');
  const [S0, setS0] = useState('100');
  const [T, setT] = useState('1');
  const [result, setResult] = useState<string | null>(null);
  const simulate = () => {
    const m = parseFloat(mu);
    const s = parseFloat(sigma);
    const s0 = parseFloat(S0);
    const t = parseFloat(T);
    if (isNaN(m) || isNaN(s) || isNaN(s0) || isNaN(t) || s <= 0 || s0 <= 0) { setResult('Invalid inputs'); return; }
    const dt = 1/252;
    const n = Math.round(t * 252);
    const nPaths = 500;
    const drift = (m - 0.5 * s * s) * dt;
    const diff = s * Math.sqrt(dt);
    const finals: number[] = [];
    for (let p = 0; p < nPaths; p++) {
      let price = s0;
      for (let i = 0; i < n; i++) {
        const z = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() - 3) / Math.sqrt(3);
        price *= Math.exp(drift + diff * z);
      }
      finals.push(price);
    }
    finals.sort((a, b) => a - b);
    const var5 = finals[Math.floor(nPaths * 0.05)];
    const median = finals[Math.floor(nPaths * 0.50)];
    const mean = finals.reduce((a, b) => a + b, 0) / nPaths;
    const p90 = finals[Math.floor(nPaths * 0.90)];
    setResult(`GBM Simulation: ${nPaths} paths over ${t}Y\n\n5th percentile (VaR):  $${var5.toFixed(2)}\nMedian outcome:        $${median.toFixed(2)}\nMean outcome:          $${mean.toFixed(2)}\n90th percentile:       $${p90.toFixed(2)}\n\nNote: mean > median because GBM is log-normally distributed — a few very high paths pull the mean up. The Itô correction (−½σ²) in the drift is why this is correct.`);
  };
  return (
    <SimShell icon="🎲" title="GBM Monte Carlo" subtitle="Simulate price paths in your head">
      <Card>
        <Text style={s.sectionLabel}>SIMULATION PARAMETERS</Text>
        <Text style={s.fieldLabel}>Initial Price S₀</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={S0} onChangeText={setS0} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Annual Drift μ (e.g. 0.08)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={mu} onChangeText={setMu} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Annual Volatility σ (e.g. 0.20)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: FontSize.sm }} value={sigma} onChangeText={setSigma} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Time Horizon (years)</Text>
        <TextInput style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, fontSize: FontSize.sm }} value={T} onChangeText={setT} keyboardType="decimal-pad" />
      </Card>
      <PBtn label="Run 500 Simulations" onPress={simulate} />
      {result && <Card><Text style={s.body}>{result}</Text></Card>}
      {result && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Black-Scholes Implementation ───────────────────────────────────────────────
function BlackScholesImplementationSim({ onComplete, onSkip }: SimProps) {
  const [S, setS_] = useState('100');
  const [K, setK] = useState('100');
  const [T_, setT_] = useState('0.25');
  const [r, setR] = useState('0.04');
  const [sigma, setSigma] = useState('0.20');
  const [type, setType] = useState<'call'|'put'>('call');
  const [result, setResult] = useState<string | null>(null);
  const erf = (x: number) => {
    const t = 1/(1+0.3275911*Math.abs(x));
    const y = 1 - (0.254829592*t - 0.284496736*t*t + 1.421413741*t*t*t - 1.453152027*t*t*t*t + 1.061405429*t*t*t*t*t)*Math.exp(-x*x);
    return x >= 0 ? y : -y;
  };
  const norm = (x: number) => 0.5*(1 + erf(x/Math.SQRT2));
  const normPdf = (x: number) => Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);
  const price = () => {
    const s=parseFloat(S),k=parseFloat(K),t=parseFloat(T_),r_=parseFloat(r),sig=parseFloat(sigma);
    if([s,k,t,r_,sig].some(isNaN)||t<=0||sig<=0){ setResult('Invalid inputs'); return; }
    const d1=(Math.log(s/k)+(r_+0.5*sig*sig)*t)/(sig*Math.sqrt(t));
    const d2=d1-sig*Math.sqrt(t);
    let px, delta;
    if(type==='call'){ px=s*norm(d1)-k*Math.exp(-r_*t)*norm(d2); delta=norm(d1); }
    else { px=k*Math.exp(-r_*t)*norm(-d2)-s*norm(-d1); delta=-norm(-d1); }
    const gamma=normPdf(d1)/(s*sig*Math.sqrt(t));
    const vega=s*normPdf(d1)*Math.sqrt(t)/100;
    const theta=(-(s*normPdf(d1)*sig)/(2*Math.sqrt(t))-r_*k*Math.exp(-r_*t)*(type==='call'?norm(d2):norm(-d2)))/365;
    setResult(`${type.toUpperCase()} OPTION\n\nd1=${d1.toFixed(4)}, d2=${d2.toFixed(4)}\n\nPrice:  $${px.toFixed(4)}\nDelta:  ${delta.toFixed(4)} (per $1 move in S)\nGamma:  ${gamma.toFixed(4)} (Δ change per $1 move)\nVega:   $${vega.toFixed(4)} (per 1% vol change)\nTheta:  $${theta.toFixed(4)}/day\n\nIntrinsic: $${Math.max(type==='call'?s-k:k-s,0).toFixed(2)}\nTime value: $${(px-Math.max(type==='call'?s-k:k-s,0)).toFixed(2)}`);
  };
  return (
    <SimShell icon="⚫" title="Black-Scholes Pricer" subtitle="Full Greeks calculator">
      <View style={{ flexDirection:'row', gap: 8, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => setType('call')} style={[b.primary, { flex:1 }, type!=='call' && { backgroundColor:'#e2e8f0' }]}><Text style={[b.primaryText, type!=='call' && { color: Colors.text }]}>Call</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setType('put')} style={[b.primary, { flex:1 }, type!=='put' && { backgroundColor:'#e2e8f0' }]}><Text style={[b.primaryText, type!=='put' && { color: Colors.text }]}>Put</Text></TouchableOpacity>
      </View>
      <Card>
        {[['Spot Price S', S, setS_],['Strike K', K, setK],['Time to Expiry T (years)', T_, setT_],['Risk-Free Rate r', r, setR],['Implied Vol σ', sigma, setSigma]].map(([label, val, setter]: any) => (
          <View key={label} style={{ marginBottom: 8 }}>
            <Text style={s.fieldLabel}>{label}</Text>
            <TextInput style={{ borderWidth:1, borderColor: Colors.border, borderRadius:8, padding:10, fontSize: FontSize.sm }} value={val} onChangeText={setter} keyboardType="decimal-pad" />
          </View>
        ))}
      </Card>
      <PBtn label="Price Option" onPress={price} />
      {result && <Card><Text style={[s.body, { fontFamily: 'monospace' }]}>{result}</Text></Card>}
      {result && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Backtest Implementation ────────────────────────────────────────────────────
function BacktestImplementationSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'Why does the backtester use prices.iloc[test_start:test_end] for test data (never train data)?', opts: ['Speed','Prevents look-ahead bias — you never see future prices during signal generation','Cleaner code','pandas requires it'], correct: 1, explain: 'Look-ahead bias is the cardinal sin of backtesting. If any signal uses data from after the decision point, results are meaningless. Strict train/test splits with no overlap prevent this.' },
    { q: 'Transaction cost is applied as (1 + 0.001) on buy and (1 - 0.001) on sell. What does this model?', opts: ['Bid-ask spread only','Round-trip costs — you pay a fraction entering and exiting every position','Commission only','Market impact only'], correct: 1, explain: 'Real trading has round-trip costs. The 0.001 on both sides models slippage + commission. Ignoring this is one of the most common reasons backtests fail out-of-sample.' },
    { q: 'The backtester mark-to-markets BEFORE executing signals on each date. Why?', opts: ['Arbitrary convention','Correct order: value yesterday\'s positions at today\'s open, then decide what to trade at today\'s open','Faster execution','Avoids division by zero'], correct: 1, explain: 'In reality: you observe the opening price, mark your book, then submit orders. Reversing this (trade then mark) gives you prices you couldn\'t have traded at.' },
    { q: 'What is the embargo period in walk-forward validation?', opts: ['Time to settle trades','Gap between train and test to prevent autocorrelation leakage','Commission waiting period','Regulatory holding period'], correct: 1, explain: 'If features use 20-day rolling windows, the last 20 training days share data with the first 20 test days. Excluding them as an embargo eliminates this leakage.' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < questions.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="🔄" title="Backtester" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You understand what backtests actually test.' : '📖 Key: no look-ahead bias, round-trip costs, correct event ordering, embargo for leakage.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="🔄" title="Backtest Correctness" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>DESIGN QUESTION</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Momentum Signal Code ───────────────────────────────────────────────────────
function MomentumSignalCodeSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'Cross-sectional momentum buys top decile of ___ month returners, skipping ___ month.', opts: ['6-0','12-1','3-1','24-3'], correct: 1, explain: 'The Jegadeesh-Titman (1993) specification: 12-month formation, skip most recent 1 month. The skip removes short-term reversal which would reduce alpha.' },
    { q: 'Why does prices.shift(skip) / prices.shift(lookback) - 1 use shift() not iloc[]?', opts: ['iloc is deprecated','shift() aligns by date index — handles missing trading days correctly','shift() is faster','iloc would crash'], correct: 1, explain: 'shift() respects the time index. Using integer positions with iloc breaks on market holidays and different trading calendars. Always use shift() for time-series operations.' },
    { q: 'You test momentum on 500 stocks. How many would you expect in the long portfolio if n_long=10?', opts: ['500','10','50','100'], correct: 1, explain: 'n_long=10 means always hold the top 10 performers regardless of universe size. Equal-number (not equal-weight) long/short is standard for cross-sectional momentum.' },
    { q: 'The skip-month correction reduces Sharpe by ~30%. Without it, momentum appears stronger. This is an example of:', opts: ['Data snooping','In-sample optimisation bias','Short-term reversal contaminating the signal','Survivorship bias'], correct: 2, explain: 'Short-term reversal (mean reversion over 1-4 weeks) runs in the opposite direction to momentum. Including the most recent month mixes two effects, inflating apparent momentum alpha.' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < questions.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="📈" title="Momentum" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You know the Jegadeesh-Titman specification.' : '📖 Key: 12-1 month, skip to avoid reversal, shift() for time alignment.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="📈" title="Momentum Signal" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>STRATEGY DESIGN</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Pairs Trade Code ───────────────────────────────────────────────────────────
function PairsTradeCodeSim({ onComplete, onSkip }: SimProps) {
  const [z, setZ] = useState('');
  const [entry, setEntry] = useState('2.0');
  const [exit_, setExit] = useState('0.5');
  const [pos, setPos] = useState(0);
  const [trades, setTrades] = useState<string[]>([]);
  const decide = () => {
    const zv = parseFloat(z);
    const ev = parseFloat(entry);
    const xv = parseFloat(exit_);
    if (isNaN(zv) || isNaN(ev) || isNaN(xv)) { return; }
    let action = '';
    let newPos = pos;
    if (pos === 0) {
      if (zv > ev) { action = `Z=${zv.toFixed(2)} > ${ev} → SHORT spread (short A, long B)`; newPos = -1; }
      else if (zv < -ev) { action = `Z=${zv.toFixed(2)} < -${ev} → LONG spread (long A, short B)`; newPos = 1; }
      else { action = `Z=${zv.toFixed(2)} inside ±${ev} → NO TRADE`; }
    } else {
      if (Math.abs(zv) < xv) { action = `Z=${zv.toFixed(2)} inside ±${xv} → EXIT position`; newPos = 0; }
      else { action = `Z=${zv.toFixed(2)}, position ${pos > 0 ? 'LONG' : 'SHORT'} → HOLD`; }
    }
    setPos(newPos);
    setTrades(t => [...t, action]);
    setZ('');
  };
  return (
    <SimShell icon="🔀" title="Pairs Trading Signal" subtitle="Practice the entry/exit logic">
      <Card>
        <Text style={s.sectionLabel}>CURRENT STATE</Text>
        <Row label="Position" value={pos === 0 ? 'Flat' : pos > 0 ? '📈 Long Spread' : '📉 Short Spread'} accent />
        <Row label="Entry Z threshold" value={`±${entry}`} />
        <Row label="Exit Z threshold" value={`±${exit_}`} />
      </Card>
      <Card>
        <Text style={s.fieldLabel}>Enter Z-score to evaluate:</Text>
        <TextInput style={{ borderWidth:1, borderColor: Colors.border, borderRadius:8, padding:10, marginBottom:8, fontSize: FontSize.sm }} value={z} onChangeText={setZ} keyboardType="decimal-pad" placeholder="e.g. 2.3 or -1.8" />
        <Text style={s.fieldLabel}>Entry threshold</Text>
        <TextInput style={{ borderWidth:1, borderColor: Colors.border, borderRadius:8, padding:10, marginBottom:8, fontSize: FontSize.sm }} value={entry} onChangeText={setEntry} keyboardType="decimal-pad" />
        <Text style={s.fieldLabel}>Exit threshold</Text>
        <TextInput style={{ borderWidth:1, borderColor: Colors.border, borderRadius:8, padding:10, fontSize: FontSize.sm }} value={exit_} onChangeText={setExit} keyboardType="decimal-pad" />
      </Card>
      <PBtn label="Make Trading Decision" onPress={decide} disabled={!z} />
      {trades.length > 0 && <Card><Text style={s.sectionLabel}>DECISION LOG</Text>{trades.slice(-4).map((t, i) => <Text key={i} style={s.body}>• {t}</Text>)}</Card>}
      {trades.length >= 4 && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── ML Signal Code ─────────────────────────────────────────────────────────────
function MlSignalCodeSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'Walk-forward validation uses an embargo period. With 20-day rolling features, the embargo should be at least:', opts: ['1 day','20 days','252 days','No embargo needed'], correct: 1, explain: 'The last 20 days of training data share rolling window computations with the first 20 test days. A 20-day embargo removes this overlap, preventing leakage.' },
    { q: 'You fit StandardScaler on training data, then call scaler.transform(X_test). NOT scaler.fit_transform(X_test). Why?', opts: ['fit_transform is slower','fit_transform would use test data statistics — information leakage from future data','They give the same result','transform is deprecated'], correct: 1, explain: 'Fitting the scaler on test data leaks future distribution information. You must use train statistics (mean, std) to scale both train and test. This is true for all preprocessing.' },
    { q: 'Your walk-forward ML shows in-sample Sharpe 2.4, out-of-sample Sharpe 0.3. This means:', opts: ['The strategy works, just needs tuning','Severe overfitting — the model memorised noise in training data','Out-of-sample is always lower, this is normal','The model needs more features'], correct: 1, explain: 'Sharpe 2.4 → 0.3 is an 87% degradation. The model learned patterns specific to training data that don\'t generalise. Genuine alpha degrades 20-40% out-of-sample, not 87%.' },
    { q: 'GradientBoostingClassifier(max_depth=3) uses shallow trees. Why not max_depth=10?', opts: ['Depth 3 is faster','Deeper trees overfit financial noise — shallow trees are better regularised for low signal-to-noise data','max_depth=10 crashes','Depth 3 is standard practice for no reason'], correct: 1, explain: 'Financial data has very low signal-to-noise ratio. Deep trees memorise every noise pattern in training data. Shallow trees (depth 2-4) force the model to find only strong, broad patterns.' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < questions.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="🤖" title="ML Signal" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You understand ML leakage and overfitting in finance.' : '📖 Key: embargo prevents leakage, scale with train stats only, out-of-sample is the only truth.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="🤖" title="ML Signal Validation" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>ML BEST PRACTICES</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Risk System Code ───────────────────────────────────────────────────────────
function RiskSystemCodeSim({ onComplete, onSkip }: SimProps) {
  const [w1, setW1] = useState('40');
  const [w2, setW2] = useState('35');
  const [w3, setW3] = useState('25');
  const [r1, setR1] = useState('12');
  const [r2, setR2] = useState('15');
  const [r3, setR3] = useState('20');
  const [result, setResult] = useState<string | null>(null);
  const compute = () => {
    const weights = [parseFloat(w1), parseFloat(w2), parseFloat(w3)].map(w => w/100);
    const vols = [parseFloat(r1), parseFloat(r2), parseFloat(r3)].map(v => v/100);
    const sum = weights.reduce((a,b) => a+b, 0);
    if (vols.some(isNaN) || weights.some(isNaN) || Math.abs(sum-1) > 0.01) { setResult('Weights must sum to 100%'); return; }
    // Simplified: assume correlation 0.4 between all pairs
    const corr = 0.4;
    let portVar = 0;
    for (let i=0; i<3; i++) for (let j=0; j<3; j++) {
      const rho = i === j ? 1 : corr;
      portVar += weights[i]*weights[j]*vols[i]*vols[j]*rho;
    }
    const portVol = Math.sqrt(portVar);
    const varDaily = portVol / Math.sqrt(252);
    const var95 = 1.645 * varDaily;
    const cvar95 = 2.063 * varDaily;
    // Risk contributions (marginal * weight)
    const marginals = weights.map((wi, i) => {
      let marg = 0;
      for (let j=0; j<3; j++) {
        const rho = i===j ? 1 : corr;
        marg += weights[j]*vols[i]*vols[j]*rho;
      }
      return marg / portVol;
    });
    const riskContribs = marginals.map((m, i) => (weights[i]*m/portVol*100));
    setResult(`Portfolio Volatility: ${(portVol*100).toFixed(1)}% annual\n\n1-Day 95% VaR: ${(var95*100).toFixed(2)}% of portfolio\n1-Day CVaR (ES): ${(cvar95*100).toFixed(2)}% of portfolio\n\nRisk Contributions (ρ=0.4 assumed):\n  Asset 1: ${riskContribs[0].toFixed(1)}% of risk\n  Asset 2: ${riskContribs[1].toFixed(1)}% of risk\n  Asset 3: ${riskContribs[2].toFixed(1)}% of risk\n\nNote: Asset with highest vol dominates risk even with smaller weight.`);
  };
  return (
    <SimShell icon="🛡️" title="Portfolio Risk Monitor" subtitle="VaR, CVaR, and risk contributions">
      <Card>
        <Text style={s.sectionLabel}>PORTFOLIO WEIGHTS & VOLATILITIES</Text>
        {[['Asset 1', w1, setW1, r1, setR1],['Asset 2', w2, setW2, r2, setR2],['Asset 3', w3, setW3, r3, setR3]].map(([label, wv, ws, rv, rs]: any) => (
          <View key={label} style={{ flexDirection:'row', gap:8, marginBottom:8, alignItems:'flex-end' }}>
            <View style={{ flex:1 }}>
              <Text style={s.fieldLabel}>{label} Weight %</Text>
              <TextInput style={{ borderWidth:1, borderColor: Colors.border, borderRadius:8, padding:8, fontSize: FontSize.sm }} value={wv} onChangeText={ws} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex:1 }}>
              <Text style={s.fieldLabel}>Vol % annual</Text>
              <TextInput style={{ borderWidth:1, borderColor: Colors.border, borderRadius:8, padding:8, fontSize: FontSize.sm }} value={rv} onChangeText={rs} keyboardType="decimal-pad" />
            </View>
          </View>
        ))}
      </Card>
      <PBtn label="Compute Risk Metrics" onPress={compute} />
      {result && <Card><Text style={[s.body, { fontFamily:'monospace' }]}>{result}</Text></Card>}
      {result && <PBtn label="Complete →" onPress={onComplete} />}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Data Ingestion Code ────────────────────────────────────────────────────────
function DataIngestionCodeSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'yf.download(..., auto_adjust=True) vs auto_adjust=False. What does auto_adjust do?', opts: ['Downloads faster','Adjusts prices for dividends and stock splits — gives true continuous return series','Adjusts for inflation','Removes weekends'], correct: 1, explain: 'Without adjustment, a 2-for-1 stock split appears as a 50% price drop. auto_adjust=True gives the economically correct continuous series for return calculations.' },
    { q: "prices.dropna(axis=1, thresh=min_obs) drops columns (tickers) where thresh is:", opts: ['Maximum allowed NaN count','Minimum number of non-NaN observations required','The row threshold','Not a valid parameter'], correct: 1, explain: 'thresh=min_obs keeps only columns with at least min_obs non-NaN values. This removes tickers that were listed recently or have data gaps, ensuring sufficient history for estimation.' },
    { q: 'Winsorising at 0.1% tails removes:', opts: ['The best-performing days','Returns so extreme they are almost certainly data errors (e.g. 1000% in a day)','All outliers','Negative returns'], correct: 1, explain: 'A 500% return in a single day is not a real return — it\'s a data error, a stock split not being captured, or a delisting event. Winsorising clips these to the 99.9th percentile.' },
    { q: 'What is survivorship bias in financial data?', opts: ['Data loads too slowly','Historical datasets only contain companies that survived — excluding failures makes performance look better than reality','Data is biased toward survivors of your analysis','New companies bias the dataset'], correct: 1, explain: 'If you study only companies currently in the S&P 500, you\'re missing all that were delisted or went bankrupt. This inflates historical performance by excluding failures. Many "discoveries" in academic finance disappear once survivorship bias is corrected.' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < questions.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="📥" title="Data Ingestion" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You know how to build clean data pipelines.' : '📖 Key: auto_adjust for splits/dividends, thresh for data quality, winsorise outliers, beware survivorship bias.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="📥" title="Data Ingestion Quality" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>DATA PIPELINE REVIEW</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── vectorbt Backtest ──────────────────────────────────────────────────────────
function VectorbtBacktestSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    { q: 'vectorbt runs thousands of parameter combinations faster than a Python loop because:', opts: ['It uses parallel processes','It vectorises operations with numpy — all paths computed simultaneously as matrix operations','It caches results','It skips error checking'], correct: 1, explain: 'vectorbt converts the backtest loop into matrix operations that numpy/numba runs natively. A 1000-path parameter sweep that takes hours in Python takes seconds with vectorised operations.' },
    { q: 'After a vectorbt parameter sweep, you find fast=10, slow=30 gives Sharpe 2.8. You should:', opts: ['Deploy immediately','Apply walk-forward validation — in-sample optimal parameters are almost always overfit','Use it as-is but with less capital','Report it to clients'], correct: 1, explain: 'In-sample parameter optimisation is curve fitting. The best parameters for 2015-2023 data are not the best for 2024 data. Walk-forward validation tests parameters on unseen data.' },
    { q: "vbt.Portfolio.from_signals(..., fees=0.001) applies 0.1% per trade. On 500 trades/year with $100k portfolio:", opts: ['$50 total','~$500 in fees','$5,000 in fees — significant drag on returns','$50,000 in fees'], correct: 2, explain: '0.001 * 500 trades * $100k = $50,000? No — each trade is a fraction of portfolio. But 0.1% round-trip on 500 trades = 50% annual drag on portfolio. High-frequency strategies are especially sensitive to costs.' },
    { q: 'Sharpe ratio from a vectorbt backtest is 1.9. After accounting for realistic slippage and market impact, expect:', opts: ['Still 1.9','Higher — you beat the market','0.8-1.3 — real execution always worse than backtest','Negative — backtests are always wrong'], correct: 2, explain: 'Backtests use mid prices; real execution uses bid-ask spread. Market impact moves prices against you on large orders. Expect 30-50% Sharpe degradation from backtest to live — a 1.9 backtest Sharpe might be 1.0-1.3 live.' },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < questions.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="⚡" title="vectorbt" subtitle="Results">
      <Card><Text style={s.body}>{score}/{questions.length} — {score >= 3 ? '✅ You know how to use vectorbt correctly.' : '📖 Key: vectorised = fast via numpy, in-sample params need walk-forward validation, live Sharpe is always lower.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="⚡" title="vectorbt Speed & Pitfalls" subtitle={`Q${idx+1}/${questions.length}`}>
      <Card><Text style={s.sectionLabel}>PRODUCTION BACKTESTING</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < questions.length ? 'Next →' : 'Finish'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Interview Code Challenge ────────────────────────────────────────────────────
function InterviewCodeChallengeSim({ onComplete, onSkip }: SimProps) {
  const challenges = [
    {
      title: 'Max Profit (O(n) required)',
      prompt: 'prices = [7, 1, 5, 3, 6, 4]. What is the maximum profit from one buy then one sell?',
      opts: ['6','5','7','4'],
      correct: 1,
      explain: 'Buy at 1, sell at 6 = profit of 5. O(n): track min_price and max_profit as you scan left to right. Never need nested loops.',
    },
    {
      title: 'Rolling Sharpe',
      prompt: 'To annualise a 252-day rolling Sharpe from daily returns you multiply the ratio by:',
      opts: ['252','√252','252²','1/252'],
      correct: 1,
      explain: '√252 ≈ 15.87. Sharpe = mean/std already cancels units. Annualising: mean scales by 252, std scales by √252, so ratio scales by 252/√252 = √252.',
    },
    {
      title: 'EWMA from scratch',
      prompt: 'EWMA with α=0.1, values=[10, 20, 30]. Starting from values[0]=10, what is EWMA after values[2]=30?',
      opts: ['30','12.9','11.9','20'],
      correct: 1,
      explain: 'Step 1: 0.1*20 + 0.9*10 = 11. Step 2: 0.1*30 + 0.9*11 = 12.9. EWMA heavily weights the past (α=0.1 means 90% weight on previous estimate).',
    },
    {
      title: 'Running VaR',
      prompt: 'For an O(1) update to a 252-day historical VaR, you use collections.deque(maxlen=252) because:',
      opts: ['deque is faster than list','deque automatically drops the oldest observation when full — O(1) append vs O(n) list deletion','deque uses less memory','numpy requires deque'],
      correct: 1,
      explain: 'deque(maxlen=N) appends in O(1) and automatically evicts the oldest element when full. Alternative: list.pop(0) is O(n) because it shifts all elements. For real-time systems, O(1) matters.',
    },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = challenges[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < challenges.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  if (done) return (
    <SimShell icon="💻" title="Interview Code" subtitle={`Score: ${score}/${challenges.length}`}>
      <Card><Text style={s.body}>{score === challenges.length ? '🏆 Perfect. You would pass the coding screen at a top quant firm.' : score >= 3 ? '✅ Strong. Review the ones you missed.' : '📖 These appear constantly — memorise the O(n) patterns.'}</Text></Card>
      <PBtn label="Complete →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="💻" title={cur.title} subtitle={`Interview Q${idx+1}/${challenges.length}`}>
      <Card><Text style={s.sectionLabel}>PROBLEM</Text><Text style={s.body}>{cur.prompt}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < challenges.length ? 'Next →' : 'See Score'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

// ── Complete Quant Pipeline ─────────────────────────────────────────────────────
function CompleteQuantPipelineSim({ onComplete, onSkip }: SimProps) {
  const stages = [
    { id: 'data', label: '1. Data Ingestion', tool: 'yfinance + pandas', action: 'Download, clean, winsorise, log returns', done: false },
    { id: 'features', label: '2. Feature Engineering', tool: 'pandas + numpy', action: 'Momentum, volatility, mean reversion signals', done: false },
    { id: 'signal', label: '3. Signal Generation', tool: 'sklearn (walk-forward)', action: 'ML classifier with embargo, no look-ahead', done: false },
    { id: 'portfolio', label: '4. Portfolio Construction', tool: 'cvxpy', action: 'Minimum-variance optimisation, constraints', done: false },
    { id: 'risk', label: '5. Risk Monitoring', tool: 'numpy', action: 'VaR, CVaR, risk contributions', done: false },
    { id: 'attribution', label: '6. Attribution', tool: 'statsmodels + Fama-French', action: 'Alpha significance, Newey-West corrected', done: false },
    { id: 'report', label: '7. Reporting', tool: 'Sharpe + drawdown functions', action: 'Full performance tearsheet', done: false },
  ];
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setCompleted(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allDone = completed.size === stages.length;
  return (
    <SimShell icon="🏗️" title="Complete Research Pipeline" subtitle="Check off each stage as you understand it">
      <Card>
        <Text style={s.sectionLabel}>SEVEN-PHASE PIPELINE</Text>
        {stages.map(stage => (
          <TouchableOpacity key={stage.id} onPress={() => toggle(stage.id)}
            style={{ flexDirection:'row', gap:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor: Colors.border, alignItems:'flex-start' }}>
            <Text style={{ fontSize:20 }}>{completed.has(stage.id) ? '✅' : '⬜'}</Text>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize: FontSize.sm, fontWeight:'800', color: Colors.text }}>{stage.label}</Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.accent, fontWeight:'700' }}>{stage.tool}</Text>
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop:2 }}>{stage.action}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
      {allDone && <ResultBox correct message="Pipeline complete. You have built the full quant research stack from scratch." />}
      {allDone && <PBtn label="Complete →" onPress={onComplete} />}
      {!allDone && <Card><Text style={s.body}>Tap each stage when you understand what it does and which tools it uses. {stages.length - completed.size} remaining.</Text></Card>}
      <GBtn label="Skip" onPress={onSkip} />
    </SimShell>
  );
}

// ── Lab 8 Boss ─────────────────────────────────────────────────────────────────
function Lab8BossSim({ onComplete, onSkip }: SimProps) {
  const questions = [
    {
      q: 'Your momentum backtest: Sharpe 1.8, tested 50 param combos. Alpha p=0.08 after Newey-West. Is this real edge?',
      opts: ['Yes — Sharpe > 1.5 is strong','Yes — p < 0.10 is significant','No — after Bonferroni for 50 tests, threshold is 0.001. p=0.08 >> 0.001. Almost certainly a false discovery.','Unclear — need more data'],
      correct: 2,
      explain: 'Bonferroni: threshold = 0.05/50 = 0.001. p=0.08 is 80x higher than the corrected threshold. This is not statistically significant. The 1.8 Sharpe is likely overfitted to the 50 parameter combinations tested.',
    },
    {
      q: 'You build a min-variance portfolio. cvxpy returns status="infeasible". Most likely cause:',
      opts: ['Too many assets','The covariance matrix has negative eigenvalues (not PSD)','sum(w)==1 conflicts with max 5% per asset and 30 assets (requires exactly 5% each, but min might not satisfy sum=1 either)','Wrong Python version'],
      correct: 2,
      explain: 'With 30 assets each capped at 5%: 30 * 5% = 150% > 100%. The constraints are contradictory — you can\'t be fully invested with a 5% cap on 30 assets. Raise the cap to at least 3.4% (1/30 ≈ 3.33%).',
    },
    {
      q: 'Kelly fraction comes out 1.8 (180% of capital). You should:',
      opts: ['Use leverage to bet 180%','Use half-Kelly: 90%','Use quarter-Kelly: 45%','Use zero — too uncertain'],
      correct: 2,
      explain: 'Full Kelly with estimated parameters destroys accounts via estimation error. Quarter-Kelly gives ~75% of growth rate with much lower ruin probability. 45% of capital is already an aggressive allocation for a single strategy.',
    },
    {
      q: 'Walk-forward ML out-of-sample Sharpe is 0.9 vs in-sample 2.1. Your conclusion:',
      opts: ['Strategy is broken — discard it','A 57% drop is acceptable degradation — real strategies degrade 30-60%. Worth further investigation with live paper trading.','Strategy works perfectly — 0.9 is above 0','Need exactly 50% drop to proceed'],
      correct: 1,
      explain: '30-60% Sharpe degradation from in-sample to out-of-sample is normal for genuine strategies. 57% degradation is within that range. The absolute Sharpe of 0.9 is marginally viable. Proceed to paper trading to validate further before deploying capital.',
    },
    {
      q: 'Fama-French attribution shows R²=0.92, alpha p=0.31. What does this mean for your strategy?',
      opts: ['92% alpha, 8% factor','Strategy is 92% explained by known risk factors (market, size, value). The remaining alpha is not statistically significant — the strategy is essentially leveraged factor exposure, not novel alpha.','Strong alpha — p < 0.5','R² = 0.92 means 92% win rate'],
      correct: 1,
      explain: 'R²=0.92 means 92% of return variance comes from the three Fama-French factors. p=0.31 means the unexplained 8% is not statistically significant. This strategy is a factor portfolio, not an alpha strategy. You could replicate it more cheaply with factor ETFs.',
    },
  ];
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = questions[idx];
  const go = (i: number) => { if (sel !== null) return; setSel(i); if (i === cur.correct) setScore(s => s + 1); };
  const next = () => { if (idx+1 < questions.length) { setIdx(i => i+1); setSel(null); } else setDone(true); };
  const grade = score === questions.length ? '🏆 Perfect — Full Stack Quant' : score >= 4 ? '✅ Distinction — Ready for Day 1' : score >= 3 ? '⚠️ Pass — Review weak areas' : '📖 Not yet — revisit Labs 1–8';
  if (done) return (
    <SimShell icon="👑" title="Lab 8 Boss Complete" subtitle="Full Stack Quant Gauntlet">
      <Card>
        <Text style={{ fontSize: 48, textAlign:'center' }}>{score >= 4 ? '🏆' : score >= 3 ? '✅' : '📖'}</Text>
        <Text style={[s.body, { textAlign:'center', fontSize: FontSize.lg, fontWeight:'900' }]}>{score}/{questions.length}</Text>
        <Text style={[s.body, { textAlign:'center', marginTop:8 }]}>{grade}</Text>
      </Card>
      <Card>
        <Text style={s.sectionLabel}>YOU HAVE NOW COMPLETED</Text>
        {['Lab 0: Numbers Room','Lab 1: Probability','Lab 2: Statistics','Lab 3: Linear Algebra','Lab 4: Calculus & Optimisation','Lab 5: Stochastic Calculus','Lab 6: Interview War Room','Lab 7: Practitioner\'s Toolkit','Lab 8: Applied Quant Python'].map(l => (
          <Text key={l} style={s.body}>✅ {l}</Text>
        ))}
      </Card>
      <PBtn label="🎓 Claim Your Certificate →" onPress={onComplete} />
    </SimShell>
  );
  return (
    <SimShell icon="👑" title="Lab 8 Boss" subtitle={`Full Stack Gauntlet: Q${idx+1}/${questions.length}`}>
      <Card><Text style={[s.sectionLabel, { color: '#ef4444' }]}>⚔️ BOSS QUESTION</Text><Text style={s.body}>{cur.q}</Text></Card>
      {cur.opts.map((o, i) => (
        <TouchableOpacity key={i} onPress={() => go(i)} style={[b.primary, sel !== null && i === cur.correct && { backgroundColor: Colors.green }, sel !== null && sel === i && i !== cur.correct && { backgroundColor: Colors.red }, sel === null && { backgroundColor: '#e2e8f0' }]}>
          <Text style={[b.primaryText, sel === null && { color: Colors.text }]}>{o}</Text>
        </TouchableOpacity>
      ))}
      {sel !== null && <Card><Text style={s.body}>💡 {cur.explain}</Text></Card>}
      {sel !== null && <PBtn label={idx+1 < questions.length ? 'Next Question →' : 'See Final Score'} onPress={next} />}
      {sel === null && <GBtn label="Skip" onPress={onSkip} />}
    </SimShell>
  );
}

