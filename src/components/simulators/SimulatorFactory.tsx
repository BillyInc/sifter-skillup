/**
 * SimulatorFactory — generic engine for all quiz-style simulators.
 * Three renderer types:
 *   'mcq'     — multiple choice, predict output / match concept
 *   'build'   — text-input, write the answer from spec
 *   'match'   — drag/tap to match two columns
 *
 * All 133 simulators are data arrays that feed into one of these three renderers.
 * Custom interactive simulators (Black-Scholes, Kelly, etc.) live in QuantSimulatorCard.tsx.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MCQQuestion {
  prompt: string;           // the question or code snippet
  isCode?: boolean;         // render prompt in monospace dark box
  options: string[];        // 4 choices
  correct: string;          // must match one of options exactly
  explain: string;          // shown after answer
}

export interface BuildQuestion {
  prompt: string;           // what to write
  context?: string;         // code context shown above input
  answer: string;           // canonical answer (trimmed, lowercased for comparison)
  hint: string;             // shown after submit if wrong
  explain: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface SimulatorDef {
  key: string;
  title: string;
  icon: string;
  subtitle: string;
  type: 'mcq' | 'build' | 'match';
  questions?: MCQQuestion[];   // for mcq
  buildQuestions?: BuildQuestion[];  // for build
  pairs?: MatchPair[];         // for match
}

interface SimProps {
  def: SimulatorDef;
  onComplete: () => void;
  onSkip: () => void;
}

// ── Shared Shell ───────────────────────────────────────────────────────────────

function Shell({ title, icon, subtitle, children }: {
  title: string; icon: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>⚡ SIFTER SKILL_UP</Text>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}

function PrimaryBtn({ label, onPress, disabled = false }: {
  label: string; onPress: () => void; disabled?: boolean;
}) {
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

function ScoreScreen({ score, total, onComplete }: {
  score: number; total: number; onComplete: () => void;
}) {
  const pct = score / total;
  const emoji = pct === 1 ? '🏆' : pct >= 0.8 ? '✅' : pct >= 0.6 ? '📚' : '🔄';
  const msg = pct === 1 ? 'Perfect. Every concept locked in.' :
              pct >= 0.8 ? 'Strong. Review the ones you missed.' :
              pct >= 0.6 ? 'Getting there — revisit the level content.' :
              'Go back and re-read the level before retrying.';
  return (
    <View style={{ alignItems: 'center', padding: Spacing.xl }}>
      <Text style={{ fontSize: 52, marginBottom: 12 }}>{emoji}</Text>
      <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.text, marginBottom: 6 }}>
        {score}/{total}
      </Text>
      <Text style={{ fontSize: 15, color: Colors.textSoft, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
        {msg}
      </Text>
      <PrimaryBtn label="Complete ✓" onPress={onComplete} />
    </View>
  );
}

// ── MCQ Renderer ───────────────────────────────────────────────────────────────

function MCQRenderer({ questions, onComplete, onSkip }: {
  questions: MCQQuestion[]; onComplete: () => void; onSkip: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const isCorrect = selected === q?.correct;

  const pick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
  };

  if (done) return <ScoreScreen score={score} total={questions.length} onComplete={onComplete} />;

  return (
    <View>
      <View style={mcq.progress}>
        <Text style={mcq.progressText}>{idx + 1} / {questions.length}</Text>
        <View style={mcq.progressBar}>
          <View style={[mcq.progressFill, { width: `${((idx) / questions.length) * 100}%` as any }]} />
        </View>
      </View>

      {q.isCode ? (
        <View style={mcq.codeBox}>
          <Text style={mcq.codeText}>{q.prompt}</Text>
        </View>
      ) : (
        <Text style={mcq.prompt}>{q.prompt}</Text>
      )}

      <View style={{ gap: 8, marginTop: 12 }}>
        {q.options.map(opt => {
          let bg = '#f0f4ff', border = Colors.accent, tc = Colors.text;
          if (selected) {
            if (opt === q.correct) { bg = '#d1fae5'; border = '#10b981'; tc = '#064e3b'; }
            else if (opt === selected) { bg = '#fee2e2'; border = '#ef4444'; tc = '#7f1d1d'; }
            else { bg = '#f8fafc'; border = '#e2e8f0'; tc = '#94a3b8'; }
          }
          return (
            <TouchableOpacity key={opt} onPress={() => pick(opt)}
              style={[mcq.option, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[mcq.optionText, { color: tc }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <View style={[mcq.explain, { backgroundColor: isCorrect ? '#ecfdf5' : '#fffbeb' }]}>
          <Text style={mcq.explainLabel}>{isCorrect ? '✅ Correct' : '💡 Explanation'}</Text>
          <Text style={mcq.explainText}>{q.explain}</Text>
        </View>
      )}

      {selected
        ? <PrimaryBtn label={idx + 1 < questions.length ? 'Next →' : 'See Results'} onPress={next} />
        : <GhostBtn label="Skip this simulator" onPress={onSkip} />
      }
    </View>
  );
}

// ── Build Renderer ─────────────────────────────────────────────────────────────

function BuildRenderer({ questions, onComplete, onSkip }: {
  questions: BuildQuestion[]; onComplete: () => void; onSkip: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  const normalise = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  const isCorrect = submitted && normalise(input) === normalise(q.answer);

  const submit = () => { setSubmitted(true); if (normalise(input) === normalise(q.answer)) setScore(s => s + 1); };

  const next = () => {
    if (idx + 1 >= questions.length) { setDone(true); return; }
    setIdx(i => i + 1); setInput(''); setSubmitted(false);
  };

  if (done) return <ScoreScreen score={score} total={questions.length} onComplete={onComplete} />;

  return (
    <View>
      <View style={mcq.progress}>
        <Text style={mcq.progressText}>{idx + 1} / {questions.length}</Text>
        <View style={mcq.progressBar}>
          <View style={[mcq.progressFill, { width: `${(idx / questions.length) * 100}%` as any }]} />
        </View>
      </View>

      <Text style={mcq.prompt}>{q.prompt}</Text>

      {q.context && (
        <View style={mcq.codeBox}>
          <Text style={mcq.codeText}>{q.context}</Text>
        </View>
      )}

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Write your answer here..."
        placeholderTextColor="#94a3b8"
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        style={build.input}
      />

      {submitted && (
        <View style={[mcq.explain, { backgroundColor: isCorrect ? '#ecfdf5' : '#fffbeb' }]}>
          <Text style={mcq.explainLabel}>{isCorrect ? '✅ Correct!' : '💡 Expected:'}</Text>
          {!isCorrect && <Text style={[mcq.codeText, { color: '#1e293b', backgroundColor: 'transparent', padding: 0, marginBottom: 6 }]}>{q.hint}</Text>}
          <Text style={mcq.explainText}>{q.explain}</Text>
        </View>
      )}

      {!submitted
        ? <PrimaryBtn label="Check Answer" onPress={submit} disabled={input.trim().length === 0} />
        : <PrimaryBtn label={idx + 1 < questions.length ? 'Next →' : 'See Results'} onPress={next} />
      }
      {!submitted && <GhostBtn label="Skip this simulator" onPress={onSkip} />}
    </View>
  );
}

// ── Match Renderer ─────────────────────────────────────────────────────────────

function MatchRenderer({ pairs, onComplete, onSkip }: {
  pairs: MatchPair[]; onComplete: () => void; onSkip: () => void;
}) {
  const rights = React.useMemo(() => [...pairs].sort(() => Math.random() - 0.5).map(p => p.right), []);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});  // leftIdx → rightIdx
  const [wrong, setWrong] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const selectLeft = (i: number) => {
    if (matched[i] !== undefined) return;
    setSelectedLeft(i === selectedLeft ? null : i);
    setWrong(null);
  };

  const selectRight = (j: number) => {
    if (selectedLeft === null) return;
    const isUsed = Object.values(matched).includes(j);
    if (isUsed) return;
    const correctRightIdx = rights.indexOf(pairs[selectedLeft].right);
    if (correctRightIdx === j) {
      const next = { ...matched, [selectedLeft]: j };
      setMatched(next);
      setSelectedLeft(null);
      if (Object.keys(next).length === pairs.length) setDone(true);
    } else {
      setWrong(j);
      setTimeout(() => setWrong(null), 800);
      setSelectedLeft(null);
    }
  };

  if (done) return (
    <View style={{ alignItems: 'center', padding: Spacing.xl }}>
      <Text style={{ fontSize: 52, marginBottom: 12 }}>🏆</Text>
      <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 8 }}>Perfect Match!</Text>
      <Text style={{ color: Colors.textSoft, marginBottom: 28 }}>All pairs correctly matched.</Text>
      <PrimaryBtn label="Complete ✓" onPress={onComplete} />
    </View>
  );

  return (
    <View>
      <Text style={{ fontSize: 13, color: Colors.textSoft, marginBottom: 16 }}>
        Tap a left item, then tap its matching right item.
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {pairs.map((p, i) => {
            const isMatched = matched[i] !== undefined;
            const isActive = selectedLeft === i;
            return (
              <TouchableOpacity key={i} onPress={() => selectLeft(i)}
                style={[mch.card, isMatched && mch.cardDone, isActive && mch.cardActive]}>
                <Text style={[mch.cardText, isMatched && { color: '#10b981' }]}>{p.left}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          {rights.map((r, j) => {
            const isMatched = Object.values(matched).includes(j);
            const isWrong = wrong === j;
            return (
              <TouchableOpacity key={j} onPress={() => selectRight(j)}
                style={[mch.card, isMatched && mch.cardDone, isWrong && mch.cardWrong]}>
                <Text style={[mch.cardText, isMatched && { color: '#10b981' }]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <GhostBtn label="Skip this simulator" onPress={onSkip} />
    </View>
  );
}

// ── Main Factory Export ────────────────────────────────────────────────────────

export default function SimulatorFactory({ def, onComplete, onSkip }: SimProps) {
  return (
    <Shell title={def.title} icon={def.icon} subtitle={def.subtitle}>
      {def.type === 'mcq' && def.questions &&
        <MCQRenderer questions={def.questions} onComplete={onComplete} onSkip={onSkip} />}
      {def.type === 'build' && def.buildQuestions &&
        <BuildRenderer questions={def.buildQuestions} onComplete={onComplete} onSkip={onSkip} />}
      {def.type === 'match' && def.pairs &&
        <MatchRenderer pairs={def.pairs} onComplete={onComplete} onSkip={onSkip} />}
    </Shell>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrap:     { flex: 1 },
  content:  { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  header:   { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  icon:     { fontSize: 36, lineHeight: 44 },
  label:    { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  title:    { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 },
});

const btn = StyleSheet.create({
  primary:     { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%', marginTop: 12 },
  disabled:    { opacity: 0.4 },
  primaryText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  ghost:       { paddingVertical: Spacing.md, alignItems: 'center', marginTop: 4 },
  ghostText:   { color: Colors.textSoft, fontSize: FontSize.sm },
});

const mcq = StyleSheet.create({
  progress:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  progressText: { fontSize: 12, color: Colors.textSoft, fontWeight: '700', minWidth: 40 },
  progressBar:  { flex: 1, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  prompt:       { fontSize: 15, color: Colors.text, lineHeight: 22, fontWeight: '500', marginBottom: 4 },
  codeBox:      { backgroundColor: '#1e293b', borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  codeText:     { fontFamily: 'monospace', color: '#e2e8f0', fontSize: 12, lineHeight: 19 },
  option:       { borderWidth: 2, borderRadius: Radius.md, padding: Spacing.md },
  optionText:   { fontSize: 14, fontWeight: '600', fontFamily: 'monospace' },
  explain:      { borderRadius: Radius.md, padding: Spacing.md, marginTop: 12, marginBottom: 4 },
  explainLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  explainText:  { fontSize: 13, color: '#374151', lineHeight: 20 },
});

const build = StyleSheet.create({
  input: {
    backgroundColor: '#1e293b', color: '#e2e8f0', fontFamily: 'monospace',
    fontSize: 13, borderRadius: Radius.md, padding: Spacing.md, marginTop: 8,
    minHeight: 80, textAlignVertical: 'top',
  },
});

const mch = StyleSheet.create({
  card:      { backgroundColor: '#f0f4ff', borderWidth: 2, borderColor: Colors.accent, borderRadius: Radius.md, padding: 10, minHeight: 52, justifyContent: 'center' },
  cardActive: { backgroundColor: '#e0e7ff', borderColor: '#4338ca' },
  cardDone:   { backgroundColor: '#d1fae5', borderColor: '#10b981' },
  cardWrong:  { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  cardText:   { fontSize: 12, fontWeight: '600', color: Colors.text, lineHeight: 17 },
});
