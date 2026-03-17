/**
 * DataModelRenderer — structured data card display for sandbox-dataModel exercises.
 * SandboxCodeRenderer — code editor for SQL, Python, Solidity, Rust, JS, Go.
 * SandboxReportRenderer — rich-text report editor for memo/analysis exercises.
 *
 * All three feed into SimulatorRegistry and push real user content to portfolio.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, Card, SectionLabel,
  CriterionRow, ScoreScreen, TypingIndicator,
  scoreWithClaude, type SimBaseProps, type ScoringResult,
} from './SimulatorShared';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ── Shared scoring flow hook ──────────────────────────────────────────────────

type Phase = 'input' | 'scoring' | 'results';

function useScoring(scenario: string, criteria: string[], onArtifact?: (s: string) => void) {
  const [phase, setPhase]   = useState<Phase>('input');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError]   = useState<string | null>(null);

  const submit = async (response: string) => {
    setPhase('scoring');
    setError(null);
    try {
      const scored = await scoreWithClaude(scenario, criteria, response);
      setResult(scored);
      setPhase('results');
      onArtifact?.(response);
      Haptics.notificationAsync(scored.score === scored.total
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning);
    } catch {
      setError('Scoring unavailable — check connection.');
      setPhase('input');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return { phase, result, error, submit };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DataModelRenderer — sandbox-dataModel
//    Shows structured blockchain / supply chain data cards,
//    then asks the user analysis questions.
// ─────────────────────────────────────────────────────────────────────────────

export interface DataModelProps extends SimBaseProps {
  scenario: string;
  scoringCriteria: string[];
  onArtifactContent?: (s: string) => void;
}

/** Parse scenario text into structured key-value rows for card display */
function parseDataRows(scenario: string): Array<{ key: string; value: string; highlight?: boolean }> {
  const rows: Array<{ key: string; value: string; highlight?: boolean }> = [];
  const lines = scenario.split('\n').filter(l => l.trim());

  for (const line of lines) {
    // Match "Key: Value" or "Key — Value" or "- Key: Value"
    const colonMatch = line.match(/^[-•*]?\s*([^:—\-]{2,40})[:\-—]\s*(.+)$/);
    if (colonMatch) {
      const key = colonMatch[1].trim();
      const val = colonMatch[2].trim();
      const highlight = /gwei|fee|price|hash|address|amount|total|tx|volume/i.test(key);
      rows.push({ key, value: val, highlight });
    }
  }
  return rows.slice(0, 12); // cap at 12 rows
}

export function DataModelRenderer({
  scenario, scoringCriteria, onComplete, onSkip, onArtifactContent,
}: DataModelProps) {
  const { phase, result, error, submit } = useScoring(scenario, scoringCriteria, onArtifactContent);
  const [response, setResponse] = useState('');
  const rows = parseDataRows(scenario);
  const canSubmit = response.trim().length >= 60;

  if (phase === 'scoring') {
    return (
      <SimShell title="DATA ANALYSIS" subtitle="Evaluating your analysis…" icon="🔍">
        <TypingIndicator label="Checking your data interpretation…" />
      </SimShell>
    );
  }

  if (phase === 'results' && result) {
    return (
      <SimShell title="DATA ANALYSIS" subtitle="Results" icon="🔍">
        <ScoreScreen score={result.score} total={result.total} xp={result.xpEarned}
          overallFeedback={result.overallFeedback} onComplete={onComplete} />
        {result.criteriaResults.map((cr, i) => (
          <CriterionRow key={i} {...cr} delay={i * 80} />
        ))}
      </SimShell>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SimShell title="DATA ANALYSIS" subtitle="Read the data, then answer the questions below" icon="🔍">
        {/* Data card */}
        <Card style={{ gap: 0 }}>
          <SectionLabel text="DATA" color="#0ea5e9" />
          {rows.length > 0
            ? rows.map((row, i) => (
                <View key={i} style={[dm.row, i < rows.length - 1 && dm.rowBorder]}>
                  <Text style={dm.key}>{row.key}</Text>
                  <Text style={[dm.val, row.highlight && dm.valHighlight]}>{row.value}</Text>
                </View>
              ))
            : <Text style={dm.rawText}>{scenario}</Text>
          }
        </Card>

        {/* Scenario questions (text after the data block) */}
        <Card>
          <SectionLabel text="QUESTIONS" color="#0ea5e9" />
          <Text style={dm.rawText}>{scenario}</Text>
        </Card>

        <SectionLabel text="YOUR ANALYSIS" />
        <TextInput
          value={response} onChangeText={setResponse}
          placeholder="Answer each question using the data above. Be specific — reference exact values."
          placeholderTextColor="#94a3b8" multiline autoCapitalize="sentences"
          style={[dm.input, { borderColor: canSubmit ? '#0ea5e9' : '#e2e8f0' }]}
          textAlignVertical="top"
        />
        {error && <Text style={dm.error}>⚠️ {error}</Text>}
        <PrimaryBtn label="Submit Analysis →" onPress={() => submit(response.trim())}
          disabled={!canSubmit} color="#0ea5e9" />
        <GhostBtn label="Skip" onPress={onSkip} />
      </SimShell>
    </KeyboardAvoidingView>
  );
}

const dm = StyleSheet.create({
  row:          { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 8 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  key:          { fontSize: 12, color: Colors.textSoft, fontWeight: '600', flex: 1 },
  val:          { fontSize: 12, color: Colors.text, fontWeight: '700', flex: 1.5, textAlign: 'right' },
  valHighlight: { color: Colors.accent },
  rawText:      { fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  input:        { backgroundColor: Colors.card, color: Colors.text, fontSize: FontSize.sm, borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, minHeight: 140, lineHeight: 22 },
  error:        { fontSize: 12, color: '#ef4444', fontWeight: '600' },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SandboxCodeRenderer — sandbox-sql, sandbox-python, sandbox-code
//    Code editor with syntax-aware highlighting. User writes real code.
//    AI validates intent and logic against scoring criteria (no runtime execution —
//    safe, cross-platform, no security surface). User's actual code is the artifact.
// ─────────────────────────────────────────────────────────────────────────────

export type CodeLanguage = 'sql' | 'python' | 'javascript' | 'solidity' | 'rust' | 'go' | 'typescript';

export interface SandboxCodeProps extends SimBaseProps {
  scenario: string;
  scoringCriteria: string[];
  language?: CodeLanguage;
  starterCode?: string;
  onArtifactContent?: (s: string) => void;
}

const LANG_CONFIG: Record<CodeLanguage, { label: string; color: string; comment: string }> = {
  sql:        { label: 'SQL',        color: '#f59e0b', comment: '-- ' },
  python:     { label: 'Python',     color: '#3b82f6', comment: '# '  },
  javascript: { label: 'JavaScript', color: '#f7931a', comment: '// ' },
  solidity:   { label: 'Solidity',   color: '#8b5cf6', comment: '// ' },
  rust:       { label: 'Rust',       color: '#ef4444', comment: '// ' },
  go:         { label: 'Go',         color: '#0ea5e9', comment: '// ' },
  typescript: { label: 'TypeScript', color: '#6366f1', comment: '// ' },
};

/** Detect language from scenario text if not explicitly passed */
function detectLanguage(scenario: string): CodeLanguage {
  const s = scenario.toLowerCase();
  if (s.includes('select') && s.includes('from'))   return 'sql';
  if (s.includes('def ') || s.includes('import '))  return 'python';
  if (s.includes('pragma solidity'))                  return 'solidity';
  if (s.includes('fn ') || s.includes('let mut'))    return 'rust';
  if (s.includes('func ') || s.includes('package ')) return 'go';
  if (s.includes('const ') || s.includes('interface')) return 'typescript';
  return 'python'; // default
}

function LineNumbers({ code, color }: { code: string; color: string }) {
  const lines = code.split('\n').length;
  return (
    <View style={ln.wrap}>
      {Array.from({ length: Math.max(lines, 8) }, (_, i) => (
        <Text key={i} style={[ln.num, { color: color + '66' }]}>{i + 1}</Text>
      ))}
    </View>
  );
}

const ln = StyleSheet.create({
  wrap: { paddingVertical: Spacing.md, paddingRight: 8, alignItems: 'flex-end', minWidth: 28 },
  num:  { fontSize: 11, lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});

export function SandboxCodeRenderer({
  scenario, scoringCriteria, language, starterCode,
  onComplete, onSkip, onArtifactContent,
}: SandboxCodeProps) {
  const lang   = language ?? detectLanguage(scenario);
  const cfg    = LANG_CONFIG[lang];
  const { phase, result, error, submit } = useScoring(scenario, scoringCriteria, onArtifactContent);
  const [code, setCode] = useState(starterCode ?? `${cfg.comment}Write your ${cfg.label} here\n\n`);
  const canSubmit = code.trim().length > 20 && !code.includes(`Write your ${cfg.label} here`);

  if (phase === 'scoring') {
    return (
      <SimShell title={`${cfg.label} SANDBOX`} subtitle="Evaluating your code…" icon="💻">
        <TypingIndicator label={`Reviewing your ${cfg.label} against the task requirements…`} />
      </SimShell>
    );
  }

  if (phase === 'results' && result) {
    return (
      <SimShell title={`${cfg.label} SANDBOX`} subtitle="Code Review" icon="💻">
        <ScoreScreen score={result.score} total={result.total} xp={result.xpEarned}
          overallFeedback={result.overallFeedback} onComplete={onComplete} />
        {result.criteriaResults.map((cr, i) => (
          <CriterionRow key={i} {...cr} delay={i * 80} />
        ))}
      </SimShell>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SimShell title={`${cfg.label} SANDBOX`} subtitle="Write code that solves the task" icon="💻">

        {/* Task */}
        <Card>
          <SectionLabel text="TASK" color={cfg.color} />
          <Text style={sc.taskText}>{scenario}</Text>
        </Card>

        {/* Requirements */}
        <Card>
          <SectionLabel text="REQUIREMENTS" />
          {scoringCriteria.map((c, i) => (
            <View key={i} style={sc.reqRow}>
              <Text style={[sc.reqBullet, { color: cfg.color }]}>›</Text>
              <Text style={sc.reqText}>{c}</Text>
            </View>
          ))}
        </Card>

        {/* Code editor */}
        <View style={[sc.editorWrap, { borderColor: cfg.color + '88' }]}>
          <View style={[sc.editorHeader, { backgroundColor: cfg.color + '15' }]}>
            <View style={[sc.langBadge, { backgroundColor: cfg.color }]}>
              <Text style={sc.langText}>{cfg.label}</Text>
            </View>
            <Text style={sc.editorHint}>No execution — write intent + logic</Text>
          </View>
          <View style={sc.editorBody}>
            <LineNumbers code={code} color={cfg.color} />
            <TextInput
              value={code} onChangeText={setCode}
              multiline autoCapitalize="none" autoCorrect={false} spellCheck={false}
              style={sc.codeInput}
              textAlignVertical="top"
            />
          </View>
        </View>

        {error && <Text style={sc.error}>⚠️ {error}</Text>}
        <PrimaryBtn label="Submit Code →" onPress={() => submit(code.trim())}
          disabled={!canSubmit} color={cfg.color} />
        <GhostBtn label="Skip" onPress={onSkip} />
      </SimShell>
    </KeyboardAvoidingView>
  );
}

const sc = StyleSheet.create({
  taskText:    { fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  reqRow:      { flexDirection: 'row', gap: 8, marginBottom: 6 },
  reqBullet:   { fontSize: 16, lineHeight: 20, fontWeight: '900' },
  reqText:     { flex: 1, fontSize: 13, color: Colors.textSoft, lineHeight: 19 },
  editorWrap:  { borderWidth: 1.5, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#0f172a' },
  editorHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 8 },
  langBadge:   { borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 3 },
  langText:    { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  editorHint:  { fontSize: 10, color: '#64748b', fontWeight: '600' },
  editorBody:  { flexDirection: 'row' },
  codeInput:   {
    flex: 1, color: '#e2e8f0', padding: Spacing.md, paddingLeft: 4,
    fontSize: 13, lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 200,
  },
  error:       { fontSize: 12, color: '#ef4444', fontWeight: '600' },
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SandboxReportRenderer — for professional writing tracks
//    Used when sandbox-python/excel scenario is actually a report/analysis task.
//    User writes a structured report with section headers.
//    Provides a rich formatting toolbar (bold, bullets, headers) via text insertion.
// ─────────────────────────────────────────────────────────────────────────────

export interface SandboxReportProps extends SimBaseProps {
  scenario: string;
  scoringCriteria: string[];
  reportType?: 'memo' | 'analysis' | 'investigation' | 'recommendation' | 'case-study';
  onArtifactContent?: (s: string) => void;
}

const REPORT_TEMPLATES: Record<NonNullable<SandboxReportProps['reportType']>, string> = {
  'memo':           `TO: [Recipient]\nFROM: [Your Name]\nDATE: [Date]\nSUBJECT: [Subject]\n\n## Summary\n\n## Background\n\n## Findings\n\n## Recommendation\n`,
  'analysis':       `## Executive Summary\n\n## Data & Findings\n\n## Root Cause Analysis\n\n## Recommendation\n\n## KPIs to Track\n`,
  'investigation':  `## Subject\n\n## Evidence\n\n## Chain of Events\n\n## Attribution\n\n## Recommended Action\n`,
  'recommendation': `## Problem Statement\n\n## Analysis\n\n## Options Considered\n\n## Recommendation\n\n## Expected Impact\n`,
  'case-study':     `## Situation\n\n## Task\n\n## Actions Taken\n\n## Result\n\n## Frameworks Applied\n`,
};

const REPORT_CONFIG: Record<NonNullable<SandboxReportProps['reportType']>, { label: string; color: string }> = {
  'memo':           { label: 'MEMO',           color: '#6366f1' },
  'analysis':       { label: 'ANALYSIS',       color: '#0ea5e9' },
  'investigation':  { label: 'INVESTIGATION',  color: '#f59e0b' },
  'recommendation': { label: 'RECOMMENDATION', color: '#10b981' },
  'case-study':     { label: 'CASE STUDY',     color: '#8b5cf6' },
};

function FormatBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={rp.fmtBtn} onPress={onPress}>
      <Text style={rp.fmtBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SandboxReportRenderer({
  scenario, scoringCriteria, reportType = 'analysis',
  onComplete, onSkip, onArtifactContent,
}: SandboxReportProps) {
  const cfg = REPORT_CONFIG[reportType];
  const { phase, result, error, submit } = useScoring(scenario, scoringCriteria, onArtifactContent);
  const [text, setText] = useState(REPORT_TEMPLATES[reportType]);
  const canSubmit = text.replace(/\[.*?\]/g, '').trim().length >= 150;

  const insertAt = (snippet: string) => setText(prev => prev + snippet);

  if (phase === 'scoring') {
    return (
      <SimShell title={cfg.label} subtitle="Evaluating your report…" icon="📄">
        <TypingIndicator label="Reviewing against scoring criteria…" />
      </SimShell>
    );
  }

  if (phase === 'results' && result) {
    return (
      <SimShell title={cfg.label} subtitle="Report Assessment" icon="📄">
        <ScoreScreen score={result.score} total={result.total} xp={result.xpEarned}
          overallFeedback={result.overallFeedback} onComplete={onComplete} />
        {result.criteriaResults.map((cr, i) => (
          <CriterionRow key={i} {...cr} delay={i * 80} />
        ))}
      </SimShell>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SimShell title={`${cfg.label} EDITOR`} subtitle="Write your report in the editor below" icon="📄">

        <Card>
          <SectionLabel text="TASK" color={cfg.color} />
          <Text style={rp.taskText}>{scenario}</Text>
        </Card>

        <Card>
          <SectionLabel text="SCORING CRITERIA" />
          {scoringCriteria.map((c, i) => (
            <View key={i} style={rp.crit}>
              <Text style={[rp.critBullet, { color: cfg.color }]}>•</Text>
              <Text style={rp.critText}>{c}</Text>
            </View>
          ))}
        </Card>

        {/* Format toolbar */}
        <View style={rp.toolbar}>
          <FormatBtn label="## Heading" onPress={() => insertAt('\n## ')} />
          <FormatBtn label="• Bullet"   onPress={() => insertAt('\n• ')} />
          <FormatBtn label="**Bold**"   onPress={() => insertAt('**bold**')} />
          <FormatBtn label="Table"      onPress={() => insertAt('\n| Col 1 | Col 2 |\n|-------|-------|\n| data  | data  |\n')} />
        </View>

        <TextInput
          value={text} onChangeText={setText}
          multiline autoCapitalize="sentences"
          style={[rp.editor, { borderColor: canSubmit ? cfg.color : '#e2e8f0' }]}
          textAlignVertical="top"
        />

        {error && <Text style={rp.error}>⚠️ {error}</Text>}
        <PrimaryBtn label="Submit Report →" onPress={() => submit(text.trim())}
          disabled={!canSubmit} color={cfg.color} />
        <GhostBtn label="Skip" onPress={onSkip} />
      </SimShell>
    </KeyboardAvoidingView>
  );
}

const rp = StyleSheet.create({
  taskText:   { fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  crit:       { flexDirection: 'row', gap: 8, marginBottom: 5 },
  critBullet: { fontSize: 14, lineHeight: 19, fontWeight: '900' },
  critText:   { flex: 1, fontSize: 13, color: Colors.textSoft, lineHeight: 18 },
  toolbar:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  fmtBtn:     { backgroundColor: '#f1f5f9', borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  fmtBtnText: { fontSize: 11, fontWeight: '700', color: Colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  editor:     { backgroundColor: Colors.card, color: Colors.text, fontSize: 13, lineHeight: 22, borderRadius: Radius.md, borderWidth: 1.5, padding: Spacing.md, minHeight: 240 },
  error:      { fontSize: 12, color: '#ef4444', fontWeight: '600' },
});
