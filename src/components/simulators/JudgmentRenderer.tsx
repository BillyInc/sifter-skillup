/**
 * JudgmentRenderer — AI-scored open-response simulator.
 *
 * Handles all 7 judgment types (1,285 exercises across all tracks):
 *   judgment-communication   write a memo, pitch, or stakeholder message
 *   judgment-dataInterpret   analyse data and write a diagnosis
 *   judgment-riskAssess      assess a risk scenario with reasoning
 *   judgment-prioritisation  triage competing tasks
 *   judgment-escalation      decide when and how to escalate
 *   judgment-ethicalChoice   navigate an ethical dilemma
 *   judgment-negotiation     write a negotiation approach
 *
 * Usage in SimulatorRegistry.ts:
 *   'judgment-communication': (props) => <JudgmentRenderer type="judgment-communication" {...props} />
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, Card, SectionLabel,
  CriterionRow, ScoreScreen, TypingIndicator,
  scoreWithClaude, type SimBaseProps, type ScoringResult,
} from './SimulatorShared';
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
  /** Callback so parent can save user's response as portfolio artifact content */
  onArtifactContent?: (content: string) => void;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG: Record<JudgmentType, {
  label: string; icon: string; color: string;
  placeholder: string; minChars: number;
}> = {
  'judgment-communication': {
    label: 'COMMUNICATION',       icon: '✉️',  color: '#6366f1',
    placeholder: 'Write your memo, message, or response here.\n\nBe specific — use names, numbers, and a clear structure.',
    minChars: 120,
  },
  'judgment-dataInterpret': {
    label: 'DATA ANALYSIS',       icon: '📊',  color: '#0ea5e9',
    placeholder: 'Analyse the data and write your diagnosis and recommendation.\n\nUse the specific numbers in the scenario.',
    minChars: 100,
  },
  'judgment-riskAssess': {
    label: 'RISK ASSESSMENT',     icon: '⚠️',  color: '#f59e0b',
    placeholder: 'Write your risk assessment, ranked priorities, and recommended actions.\n\nBe specific about what you would do and why.',
    minChars: 100,
  },
  'judgment-prioritisation': {
    label: 'PRIORITISATION',      icon: '🎯',  color: '#10b981',
    placeholder: 'State your prioritised order clearly, then explain the reasoning for each decision.',
    minChars: 80,
  },
  'judgment-escalation': {
    label: 'ESCALATION DECISION', icon: '🚨',  color: '#ef4444',
    placeholder: 'State your decision: escalate or handle. Explain who you would contact, how, and why.',
    minChars: 80,
  },
  'judgment-ethicalChoice': {
    label: 'ETHICAL JUDGEMENT',   icon: '⚖️',  color: '#8b5cf6',
    placeholder: 'Explain the decision you would make and your reasoning.\n\nAcknowledge the competing interests involved.',
    minChars: 80,
  },
  'judgment-negotiation': {
    label: 'NEGOTIATION',         icon: '🤝',  color: '#f97316',
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

// ── Results panel ─────────────────────────────────────────────────────────────

function ResultsPanel({ result, onComplete }: { result: ScoringResult; onComplete: () => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ScoreScreen
        score={result.score}
        total={result.total}
        xp={result.xpEarned}
        overallFeedback={result.overallFeedback}
        onComplete={onComplete}
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
    </ScrollView>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function JudgmentRenderer({
  type, scenario, scoringCriteria, onComplete, onSkip, onArtifactContent,
}: JudgmentProps) {
  const cfg = CONFIG[type];
  const [phase, setPhase] = useState<'write' | 'scoring' | 'results'>('write');
  const [response, setResponse] = useState('');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = response.trim().length >= cfg.minChars;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('scoring');
    setError(null);

    try {
      const scored = await scoreWithClaude(scenario, scoringCriteria, response.trim());
      setResult(scored);
      setPhase('results');
      Haptics.notificationAsync(
        scored.score === scored.total
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
      // Surface user's work to parent for portfolio artifact
      onArtifactContent?.(response.trim());
    } catch (e: any) {
      setError('Scoring unavailable. Check your connection and try again.');
      setPhase('write');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // ── Scoring phase ──────────────────────────────────────────────────────────
  if (phase === 'scoring') {
    return (
      <SimShell title={cfg.label} subtitle="Evaluating your response…" icon={cfg.icon} label={`⚡ ${cfg.label}`}>
        <Card style={{ alignItems: 'center', paddingVertical: Spacing.xxxl }}>
          <TypingIndicator label="Reading your response and scoring against criteria…" />
        </Card>
      </SimShell>
    );
  }

  // ── Results phase ──────────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    return (
      <SimShell title={cfg.label} subtitle="Here's how you did" icon={cfg.icon} label={`⚡ ${cfg.label}`}>
        <ResultsPanel result={result} onComplete={onComplete} />
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
      <SimShell title={cfg.label} subtitle="Write your response below" icon={cfg.icon} label={`⚡ ${cfg.label}`}>

        {/* Scenario */}
        <Card>
          <SectionLabel text="SCENARIO" color={cfg.color} />
          <Text style={s.scenarioText}>{scenario}</Text>
        </Card>

        {/* What's being assessed */}
        <Card>
          <SectionLabel text={`${scoringCriteria.length} CRITERIA BEING ASSESSED`} />
          {scoringCriteria.map((c, i) => (
            <View key={i} style={s.criterionPreview}>
              <Text style={[s.criterionDot, { color: cfg.color }]}>•</Text>
              <Text style={s.criterionText}>{c}</Text>
            </View>
          ))}
        </Card>

        {/* Response input */}
        <View>
          <SectionLabel text="YOUR RESPONSE" />
          <TextInput
            value={response}
            onChangeText={setResponse}
            placeholder={cfg.placeholder}
            placeholderTextColor="#94a3b8"
            multiline
            autoCapitalize="sentences"
            autoCorrect
            style={[s.input, { borderColor: canSubmit ? cfg.color : Colors.border }]}
            textAlignVertical="top"
          />
          <CharCount current={response.trim().length} min={cfg.minChars} />
        </View>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <PrimaryBtn
          label="Submit for Scoring →"
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
  criterionPreview: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  criterionDot:     { fontSize: 14, lineHeight: 20, fontWeight: '900' },
  criterionText:    { flex: 1, fontSize: 13, color: Colors.textSoft, lineHeight: 19 },
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
