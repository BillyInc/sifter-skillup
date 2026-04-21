/**
 * JudgmentRenderer v2 — Deterministic scoring. Zero API dependency.
 *
 * WHAT CHANGED FROM v1:
 *   — Removed: scoreWithClaude() call → no ANTHROPIC_API_KEY needed
 *   — Added:   deterministicScorer for all auto-checkable criteria
 *   — Added:   rubric-reveal self-assessment flow for qualitative criteria
 *   — Added:   minimum input gates (prevents "a" → submit exploit)
 *   — Added:   isBoss prop for stricter thresholds in Phase 2
 *
 * Scoring flow:
 *   1. User types response (minimum character gates enforced)
 *   2. User taps Submit
 *   3. Platform auto-scores calculation/number/keyword criteria instantly
 *   4. If any self_assess criteria exist → reveal them as checkboxes
 *   5. User checks each criterion they honestly met
 *   6. User taps "I have honestly assessed my response"
 *   7. Score finalised → pass/fail shown
 *
 * Pass thresholds:
 *   Lesson simulations:  60% of criteria
 *   Boss Phase 2:        80% of criteria
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, Card, SectionLabel,
  CriterionRow, ScoreScreen,
  type SimBaseProps, type ScoringResult,
} from './SimulatorShared';
import {
  scoreResponseDeterministic,
  finaliseWithSelfAssess,
  validateMinimumInput,
  type DeterministicScoringResult,
  type CriterionResult,
} from '../../lib/deterministicScorer';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

export type JudgmentType =
  | 'judgment-communication'
  | 'judgment-dataInterpret'
  | 'judgment-riskAssess'
  | 'judgment-prioritisation'
  | 'judgment-escalation'
  | 'judgment-ethicalChoice'
  | 'judgment-negotiation';

export interface JudgmentProps extends SimBaseProps {
  type: JudgmentType;
  scenario: string;
  scoringCriteria: string[];
  /** True for Phase 2 boss scenarios — stricter threshold, no hints */
  isBoss?: boolean;
  /** Callback so parent can save user's response as portfolio artifact content */
  onArtifactContent?: (content: string) => void;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG: Record<JudgmentType, {
  label: string; icon: string; color: string;
  placeholder: string; minChars: number;
}> = {
  'judgment-communication': {
    label: 'COMMUNICATION', icon: '✉️', color: '#6366f1',
    placeholder: 'Write your memo, message, or response here.\n\nBe specific — use names, numbers, and a clear structure.',
    minChars: 120,
  },
  'judgment-dataInterpret': {
    label: 'DATA ANALYSIS', icon: '📊', color: '#0ea5e9',
    placeholder: 'Analyse the data and write your diagnosis and recommendation.\n\nUse the specific numbers in the scenario.',
    minChars: 100,
  },
  'judgment-riskAssess': {
    label: 'RISK ASSESSMENT', icon: '⚠️', color: '#f59e0b',
    placeholder: 'Write your risk assessment, ranked priorities, and recommended actions.\n\nBe specific about what you would do and why.',
    minChars: 100,
  },
  'judgment-prioritisation': {
    label: 'PRIORITISATION', icon: '🎯', color: '#10b981',
    placeholder: 'State your prioritised order clearly, then explain the reasoning for each decision.',
    minChars: 80,
  },
  'judgment-escalation': {
    label: 'ESCALATION DECISION', icon: '🚨', color: '#ef4444',
    placeholder: 'State your decision: escalate or handle. Explain who you would contact, how, and why.',
    minChars: 80,
  },
  'judgment-ethicalChoice': {
    label: 'ETHICAL JUDGEMENT', icon: '⚖️', color: '#8b5cf6',
    placeholder: 'Explain the decision you would make and your reasoning.\n\nAcknowledge the competing interests involved.',
    minChars: 80,
  },
  'judgment-negotiation': {
    label: 'NEGOTIATION', icon: '🤝', color: '#f97316',
    placeholder: 'Write your negotiation approach: your opening, key points, concessions you would make, and your walk-away position.',
    minChars: 80,
  },
};

// ── Character counter ─────────────────────────────────────────────────────────

function CharCount({ current, min }: { current: number; min: number }) {
  const ready = current >= min;
  return (
    <Text style={[cc.text, { color: ready ? Colors.green : Colors.textSoft }]}>
      {ready ? '✓ Ready to submit' : `${current}/${min} min characters`}
    </Text>
  );
}

const cc = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 4 },
});

// ── Self-assess checkbox list ─────────────────────────────────────────────────

function SelfAssessPanel({
  results,
  confirmed,
  onToggle,
  isBoss,
}: {
  results: CriterionResult[];
  confirmed: Set<number>;
  onToggle: (index: number) => void;
  isBoss: boolean;
}) {
  const selfAssessIndices = results
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.selfAssessRequired);

  if (selfAssessIndices.length === 0) return null;

  return (
    <Card>
      <SectionLabel text={`${selfAssessIndices.length} CRITERIA REQUIRE YOUR ASSESSMENT`} />
      <Text style={sa.instruction}>
        {isBoss
          ? 'This is Portfolio Push Mode. Review each criterion honestly. You need 80% to pass.'
          : 'Review your response against each criterion. Check only those you fully addressed.'}
      </Text>
      {selfAssessIndices.map(({ r, i }) => {
        const isChecked = confirmed.has(i);
        return (
          <TouchableOpacity
            key={i}
            style={[sa.row, isChecked && sa.rowChecked]}
            onPress={() => onToggle(i)}
            activeOpacity={0.8}
          >
            <View style={[sa.checkbox, isChecked && sa.checkboxChecked]}>
              {isChecked && <Text style={sa.checkmark}>✓</Text>}
            </View>
            <Text style={[sa.criterionText, isChecked && sa.criterionTextChecked]}>
              {r.criterion}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Card>
  );
}

const sa = StyleSheet.create({
  instruction: {
    fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18,
    marginBottom: Spacing.md, fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm, marginBottom: 6,
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b',
  },
  rowChecked: {
    backgroundColor: '#052e16', borderColor: '#22c55e40',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2,
    borderColor: '#475569', alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#22c55e', borderColor: '#22c55e',
  },
  checkmark: { fontSize: 12, color: '#fff', fontWeight: '900' },
  criterionText: { flex: 1, fontSize: 13, color: Colors.textSoft, lineHeight: 19 },
  criterionTextChecked: { color: '#86efac' },
});

// ── Auto-scored criteria preview ──────────────────────────────────────────────

function AutoScoredPanel({ results }: { results: CriterionResult[] }) {
  const autoResults = results.filter(r => !r.selfAssessRequired);
  if (autoResults.length === 0) return null;

  return (
    <Card>
      <SectionLabel text="AUTO-CHECKED CRITERIA" />
      {autoResults.map((r, i) => (
        <CriterionRow
          key={i}
          criterion={r.criterion}
          passed={r.passed}
          feedback={r.feedback}
          delay={i * 60}
        />
      ))}
    </Card>
  );
}

// ── Results panel ─────────────────────────────────────────────────────────────

function ResultsPanel({
  result,
  isBoss,
  passThreshold,
  onComplete,
  onRetry,
}: {
  result: DeterministicScoringResult;
  isBoss: boolean;
  passThreshold: number;
  onComplete: () => void;
  onRetry: () => void;
}) {
  const pct = result.total > 0 ? result.score / result.total : 0;
  const passed = pct >= passThreshold;

  const scoringResult: ScoringResult = {
    criteriaResults: result.criteriaResults.map(r => ({
      criterion: r.criterion,
      passed: r.passed,
      feedback: r.feedback,
    })),
    overallFeedback: result.overallFeedback,
    score: result.score,
    total: result.total,
    xpEarned: result.xpEarned,
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={rp.header}>
        <Text style={[rp.badge, { color: passed ? '#22c55e' : '#ef4444' }]}>
          {passed ? '✓ PASSED' : '✗ NEEDS REVIEW'}
        </Text>
        <Text style={rp.threshold}>
          Required: {Math.round(passThreshold * 100)}% ({Math.ceil(result.total * passThreshold)}/{result.total} criteria)
        </Text>
      </View>

      <ScoreScreen
        score={result.score}
        total={result.total}
        xp={passed ? result.xpEarned : 0}
        overallFeedback={result.overallFeedback}
        onComplete={passed ? onComplete : onRetry}
      />

      <SectionLabel text="CRITERIA BREAKDOWN" />
      {result.criteriaResults.map((cr, i) => (
        <CriterionRow
          key={i}
          criterion={cr.criterion}
          passed={cr.passed}
          feedback={cr.feedback}
          delay={i * 80}
        />
      ))}

      {!passed && (
        <View style={rp.retryBox}>
          <Text style={rp.retryText}>
            Review the criteria you missed, then try again with a revised response.
          </Text>
          <PrimaryBtn label="Try Again" onPress={onRetry} color="#f59e0b" />
        </View>
      )}
    </ScrollView>
  );
}

const rp = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: Spacing.lg },
  badge: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  threshold: { fontSize: 12, color: Colors.textSoft, marginTop: 4 },
  retryBox: {
    backgroundColor: '#fef9ee', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#fde68a',
    marginTop: Spacing.md, gap: Spacing.sm,
  },
  retryText: { fontSize: FontSize.sm, color: '#92400e', lineHeight: 20 },
});

// ── State machine ─────────────────────────────────────────────────────────────

type Phase = 'write' | 'reviewing' | 'results';

// ── Main component ────────────────────────────────────────────────────────────

export default function JudgmentRenderer({
  type, scenario, scoringCriteria,
  onComplete, onSkip, onArtifactContent,
  isBoss = false,
}: JudgmentProps) {
  const cfg = CONFIG[type];
  const passThreshold = isBoss ? 0.8 : 0.6;

  const [phase, setPhase] = useState<Phase>('write');
  const [response, setResponse] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [partialResult, setPartialResult] = useState<DeterministicScoringResult | null>(null);
  const [finalResult, setFinalResult] = useState<DeterministicScoringResult | null>(null);
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());

  const minChars = isBoss ? Math.max(cfg.minChars * 2, 200) : cfg.minChars;
  const canSubmit = response.trim().length >= minChars;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Minimum quality gate
    const gate = validateMinimumInput(type, response.trim(), isBoss);
    if (!gate.valid) {
      setInputError(gate.message);
      return;
    }
    setInputError(null);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Run deterministic scoring immediately
    const result = scoreResponseDeterministic(response.trim(), scoringCriteria);
    setPartialResult(result);
    setConfirmed(new Set());

    if (result.selfAssessCount === 0) {
      // No self-assess criteria — go straight to results
      setFinalResult(result);
      setPhase('results');
      Haptics.notificationAsync(
        result.score / result.total >= passThreshold
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
    } else {
      // Has self-assess criteria — show rubric reveal
      setPhase('reviewing');
    }
    onArtifactContent?.(response.trim());
  };

  const handleToggleSelfAssess = (index: number) => {
    Haptics.selectionAsync();
    setConfirmed(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleConfirmAssessment = () => {
    if (!partialResult) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = finaliseWithSelfAssess(partialResult, confirmed);
    setFinalResult(result);
    setPhase('results');
    Haptics.notificationAsync(
      result.score / result.total >= passThreshold
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
  };

  const handleRetry = () => {
    setPhase('write');
    setPartialResult(null);
    setFinalResult(null);
    setConfirmed(new Set());
    setResponse('');
    setInputError(null);
  };

  // ── Results phase ──────────────────────────────────────────────────────────
  if (phase === 'results' && finalResult) {
    return (
      <SimShell title={cfg.label} subtitle="Here's how you did" icon={cfg.icon} label={`⚡ ${cfg.label}`}>
        <ResultsPanel
          result={finalResult}
          isBoss={isBoss}
          passThreshold={passThreshold}
          onComplete={onComplete}
          onRetry={handleRetry}
        />
      </SimShell>
    );
  }

  // ── Reviewing phase (rubric reveal) ────────────────────────────────────────
  if (phase === 'reviewing' && partialResult) {
    const selfAssessCount = partialResult.selfAssessCount;
    const canConfirm = true; // user can confirm even if they checked nothing (honest 0)

    return (
      <SimShell title={cfg.label} subtitle="Review your response" icon={cfg.icon} label={`⚡ ${cfg.label}`}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Your submitted response (read-only) */}
          <Card>
            <SectionLabel text="YOUR SUBMITTED RESPONSE" />
            <Text style={rev.responseText}>{response}</Text>
          </Card>

          {/* Auto-scored criteria results */}
          <AutoScoredPanel results={partialResult.criteriaResults} />

          {/* Self-assess checkboxes */}
          <SelfAssessPanel
            results={partialResult.criteriaResults}
            confirmed={confirmed}
            onToggle={handleToggleSelfAssess}
            isBoss={isBoss}
          />

          {/* Honesty gate */}
          <View style={rev.gate}>
            <Text style={rev.gateText}>
              ⚠️ Check only criteria you genuinely addressed. Dishonest self-assessment does not build real skills.
            </Text>
          </View>

          <PrimaryBtn
            label="I have honestly assessed my response against each criterion"
            onPress={handleConfirmAssessment}
            disabled={!canConfirm}
            color={cfg.color}
          />
          <GhostBtn label="Go back and revise response" onPress={handleRetry} />
        </ScrollView>
      </SimShell>
    );
  }

  // ── Write phase ────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <SimShell
        title={cfg.label}
        subtitle={isBoss ? 'Portfolio Push Mode — No criteria visible until submission' : 'Write your response below'}
        icon={cfg.icon}
        label={`${isBoss ? '🏆 BOSS · ' : '⚡ '}${cfg.label}`}
      >

        {/* Scenario */}
        <Card>
          <SectionLabel text="SCENARIO" color={cfg.color} />
          <Text style={s.scenarioText}>{scenario}</Text>
        </Card>

        {/* Criteria count preview (not content — content shown after submit) */}
        <Card>
          <SectionLabel text={`${scoringCriteria.length} CRITERIA WILL BE ASSESSED`} />
          <Text style={s.criteriaHint}>
            {isBoss
              ? 'Criteria will be revealed after submission. 80% required to pass.'
              : `Your response will be checked against ${scoringCriteria.length} industry-standard criteria. Criteria are revealed after you submit.`}
          </Text>
        </Card>

        {/* Response input */}
        <View>
          <SectionLabel text="YOUR RESPONSE" />
          <TextInput
            value={response}
            onChangeText={text => { setResponse(text); setInputError(null); }}
            placeholder={isBoss ? 'Write your complete analysis here. No hints.' : cfg.placeholder}
            placeholderTextColor="#94a3b8"
            multiline
            autoCapitalize="sentences"
            autoCorrect
            style={[s.input, { borderColor: canSubmit ? cfg.color : Colors.border }]}
            textAlignVertical="top"
          />
          <CharCount current={response.trim().length} min={minChars} />
        </View>

        {inputError && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠️ {inputError}</Text>
          </View>
        )}

        <PrimaryBtn
          label="Submit Response →"
          onPress={handleSubmit}
          disabled={!canSubmit}
          color={cfg.color}
        />
        <GhostBtn label="Skip this exercise" onPress={onSkip} />
      </SimShell>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scenarioText: {
    fontSize: FontSize.sm, color: Colors.text, lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  criteriaHint: { fontSize: 13, color: Colors.textSoft, lineHeight: 19, fontStyle: 'italic' },
  input: {
    backgroundColor: Colors.card, color: Colors.text,
    fontSize: FontSize.sm, borderRadius: Radius.md,
    borderWidth: 1.5, padding: Spacing.md,
    minHeight: 180, lineHeight: 22,
  },
  errorBox: {
    backgroundColor: '#fef2f2', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { fontSize: FontSize.sm, color: '#7f1d1d', fontWeight: '600' },
});

const rev = StyleSheet.create({
  responseText: {
    fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20,
    fontStyle: 'italic',
  },
  gate: {
    backgroundColor: '#fffbeb', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: '#fde68a',
    marginBottom: Spacing.sm,
  },
  gateText: { fontSize: 12, color: '#92400e', lineHeight: 18 },
});
