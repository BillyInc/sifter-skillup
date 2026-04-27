/**
 * Phase1BossRenderer.tsx
 *
 * Handles ALL Phase 1 boss gauntlets across Navigator and Ecosystem tracks.
 * Simulator type: 'boss-phase1'
 *
 * HOW IT WORKS:
 *   1. Receives a pool of task strings (22 for Navigator, 20 for Ecosystem)
 *   2. Randomly draws drawPerAttempt tasks (8–10) with no repeats per attempt
 *   3. Shows one task at a time with a text response field
 *   4. Scores each response with deterministicScorer immediately on submission
 *   5. Shows per-task pass/fail with feedback after each answer
 *   6. At the end: shows total score, pass/fail, and "Unlock Phase 2" button if passed
 *
 * SCORING:
 *   - Navigator tasks contain calculations → number_match + calculation criteria
 *   - Ecosystem tasks contain tokenomics calculations AND conceptual frameworks
 *   - All scored deterministically — zero AI dependency
 *   - Hints mode: shows hint after incorrect answer (Phase 1 only, hints: true)
 *   - Pass threshold: configurable per lab (70% Navigator, 80% Ecosystem)
 *
 * UNIQUENESS:
 *   - Random draw per attempt ensures different task combinations
 *   - Seed from user ID + attempt number for reproducible but varied draws
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, SectionLabel, Card,
  type SimBaseProps,
} from './SimulatorShared';
import {
  scoreResponseDeterministic,
  validateMinimumInput,
  type DeterministicScoringResult,
} from '../../lib/deterministicScorer';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Phase1BossProps extends SimBaseProps {
  labId: string;
  labTitle: string;
  /** Full task pool — question strings with embedded answer clues */
  taskPool: string[];
  /** How many tasks to draw per attempt */
  drawPerAttempt: number;
  /** Pass threshold (0–1), e.g. 0.7 = 70% */
  passThreshold: number;
  /** Whether hints are enabled (Phase 1 always true) */
  hintsEnabled: boolean;
  /** Attempt number for seeded shuffling */
  attemptNumber?: number;
  /** Called on pass — unlocks Phase 2 */
  onPhase2Unlock: () => void;
}

interface TaskResult {
  taskIndex: number;
  taskText: string;
  response: string;
  scoring: DeterministicScoringResult;
  passed: boolean;
}

// ─── Seeded shuffle (reproducible draws) ─────────────────────────────────────

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function drawTasks(pool: string[], count: number, seed: number): Array<{ text: string; originalIndex: number }> {
  const shuffled = seededShuffle(pool.map((text, i) => ({ text, originalIndex: i })), seed);
  return shuffled.slice(0, Math.min(count, pool.length));
}

// ─── Extract scoring criteria from task text ──────────────────────────────────
/**
 * Navigator and Ecosystem Phase 1 tasks are self-contained question strings
 * that include the expected calculations in the question itself.
 * We extract scoring criteria by parsing the question for:
 *   - Explicit calculation prompts (Calculate: X, Y, Z)
 *   - Numerical values that must appear in any correct answer
 *   - Conceptual requirements (Explain, Define, Why)
 *
 * This gives the deterministicScorer something concrete to check against.
 */
function extractCriteriaFromTask(taskText: string): string[] {
  const criteria: string[] = [];

  // Pattern 1: "Calculate: X, Y, Z" — each item becomes a criterion
  const calcMatch = taskText.match(/[Cc]alculate[:\s]+([^.]+)/);
  if (calcMatch) {
    const items = calcMatch[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 3);
    items.forEach(item => criteria.push(`Calculate ${item}`));
  }

  // Pattern 2: Numbers embedded in the task become answer targets
  // e.g. "k = 640,000,000,000,000" or "utilisation 76%, borrow APY 8.1%"
  const numberContexts = taskText.match(/(\w[\w\s]*(?:APY|LTV|utilisation|health factor|price|balance|cost|ratio|impact|spread|yield)[^.!?]*[\d.]+[%$]?)/gi);
  if (numberContexts) {
    numberContexts.slice(0, 3).forEach(ctx => {
      if (ctx.trim().length > 10 && ctx.trim().length < 120) {
        criteria.push(ctx.trim());
      }
    });
  }

  // Pattern 3: "Explain X" / "Why Y" / "What is Z" → keyword criterion
  const explainMatch = taskText.match(/(?:Explain|Why|What is|Describe|Define)\s+([^.?!]+)/gi);
  if (explainMatch) {
    explainMatch.slice(0, 2).forEach(m => {
      if (m.length > 15 && m.length < 150) criteria.push(m.trim());
    });
  }

  // Pattern 4: explicit numerical answer prompts like "Show your working"
  if (/show your working|show working|step.by.step|calculate.*and show/i.test(taskText)) {
    criteria.push('Working shown — includes intermediate calculation steps and a final numeric answer');
  }

  // Fallback: if no criteria extracted, create quality-gate criteria
  if (criteria.length === 0) {
    criteria.push('Response is specific — addresses the exact scenario described, not a generic answer');
    criteria.push('Response includes at least one specific number, name, or concrete example from the scenario');
  }

  return criteria.slice(0, 5); // max 5 criteria per task
}

// ─── Hint extractor ───────────────────────────────────────────────────────────

function extractHint(taskText: string): string {
  // Extract the calculation prompt as a hint framework
  const calcMatch = taskText.match(/[Cc]alculate[:\s]+([^.]+)/);
  if (calcMatch) {
    return `Hint: Use the numbers given in the scenario. Required: ${calcMatch[1].trim()}`;
  }
  const whyMatch = taskText.match(/[Ww]hy\s+([^?]+\?)/);
  if (whyMatch) {
    return `Hint: Focus on the mechanism — ${whyMatch[1].trim()}`;
  }
  return 'Hint: Re-read the scenario carefully. Include specific numbers and named concepts in your response.';
}

// ─── Task card component ──────────────────────────────────────────────────────

function TaskCard({
  taskNumber,
  totalTasks,
  taskText,
  onSubmit,
  hintsEnabled,
}: {
  taskNumber: number;
  totalTasks: number;
  taskText: string;
  onSubmit: (response: string, criteria: string[]) => void;
  hintsEnabled: boolean;
}) {
  const [response, setResponse] = useState('');
  const [showHint, setShowHint] = useState(false);
  const hint = useMemo(() => extractHint(taskText), [taskText]);
  const criteria = useMemo(() => extractCriteriaFromTask(taskText), [taskText]);

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 15;

  return (
    <View style={tc.container}>
      <View style={tc.header}>
        <Text style={tc.progress}>Task {taskNumber} of {totalTasks}</Text>
        <View style={tc.progressBar}>
          <View style={[tc.progressFill, { width: `${((taskNumber - 1) / totalTasks) * 100}%` }]} />
        </View>
      </View>

      <Card>
        <SectionLabel text="CHALLENGE" color="#7c3aed" />
        <Text style={tc.taskText}>{taskText}</Text>
      </Card>

      {hintsEnabled && (
        <TouchableOpacity style={tc.hintBtn} onPress={() => setShowHint(!showHint)}>
          <Text style={tc.hintBtnText}>{showHint ? '▲ Hide hint' : '▼ Show hint'}</Text>
        </TouchableOpacity>
      )}
      {showHint && (
        <View style={tc.hintBox}>
          <Text style={tc.hintText}>{hint}</Text>
        </View>
      )}

      <View>
        <SectionLabel text="YOUR ANSWER" />
        <TextInput
          value={response}
          onChangeText={setResponse}
          placeholder="Write your answer here. Include all calculations, specific numbers, and reasoning."
          placeholderTextColor="#94a3b8"
          multiline
          style={tc.input}
          textAlignVertical="top"
          autoCapitalize="sentences"
        />
        <Text style={[tc.wc, { color: canSubmit ? '#22c55e' : '#64748b' }]}>
          {wordCount} words {canSubmit ? '✓' : '(min 15)'}
        </Text>
      </View>

      <PrimaryBtn
        label="Submit Answer →"
        onPress={() => onSubmit(response, criteria)}
        disabled={!canSubmit}
        color="#7c3aed"
      />
    </View>
  );
}

const tc = StyleSheet.create({
  container: { gap: Spacing.md },
  header: { gap: 4 },
  progress: { fontSize: 11, fontWeight: '800', color: '#7c3aed', letterSpacing: 1 },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 2 },
  taskText: {
    fontSize: FontSize.sm, color: Colors.text, lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  hintBtn: {
    padding: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: '#7c3aed40', backgroundColor: Colors.card,
  },
  hintBtnText: { fontSize: 12, color: '#c084fc', fontWeight: '600', textAlign: 'center' },
  hintBox: {
    backgroundColor: '#1c1008', borderRadius: Radius.sm, padding: Spacing.md,
    borderWidth: 1, borderColor: '#f59e0b40',
  },
  hintText: { fontSize: 13, color: '#fcd34d', lineHeight: 19 },
  input: {
    backgroundColor: Colors.card, color: Colors.text, fontSize: FontSize.sm,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: '#7c3aed40',
    padding: Spacing.md, minHeight: 140, lineHeight: 22,
  },
  wc: { fontSize: 10, textAlign: 'right', marginTop: 4, fontWeight: '600' },
});

// ─── Result card ──────────────────────────────────────────────────────────────

function TaskResultCard({
  result,
  taskNumber,
  hintsEnabled,
}: {
  result: TaskResult;
  taskNumber: number;
  hintsEnabled: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <TouchableOpacity
      style={[res.container, result.passed ? res.pass : res.fail]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={res.header}>
        <Text style={res.taskNum}>Task {taskNumber}</Text>
        <Text style={[res.verdict, { color: result.passed ? '#22c55e' : '#ef4444' }]}>
          {result.passed ? '✓ PASS' : '✗ NEEDS WORK'}
        </Text>
        <Text style={res.score}>
          {result.scoring.score}/{result.scoring.total}
        </Text>
        <Text style={res.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>

      {expanded && (
        <View style={res.detail}>
          <Text style={res.taskPreview} numberOfLines={2}>{result.taskText}</Text>
          {result.scoring.criteriaResults.map((cr, i) => (
            <View key={i} style={res.criterionRow}>
              <Text style={{ fontSize: 12 }}>{cr.passed ? '✅' : '❌'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[res.criterionText, { color: cr.passed ? '#86efac' : '#fca5a5' }]}>
                  {cr.criterion.length > 100 ? cr.criterion.slice(0, 97) + '…' : cr.criterion}
                </Text>
                {!cr.passed && (
                  <Text style={res.feedback}>{cr.feedback}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const res = StyleSheet.create({
  container: {
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: 6,
  },
  pass: { backgroundColor: '#ecfdf5', borderColor: '#86efac' },
  fail: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  taskNum: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  verdict: { flex: 1, fontSize: 13, fontWeight: '700' },
  score: { fontSize: 12, color: Colors.textSoft, fontWeight: '600' },
  chevron: { fontSize: 10, color: Colors.textMuted },
  detail: { marginTop: Spacing.sm, gap: 6 },
  taskPreview: { fontSize: 11, color: Colors.textMuted, lineHeight: 16, fontStyle: 'italic', marginBottom: 4 },
  criterionRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  criterionText: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  feedback: { fontSize: 11, color: '#94a3b8', lineHeight: 15 },
});

// ─── Summary screen ───────────────────────────────────────────────────────────

function SummaryScreen({
  results,
  passThreshold,
  labTitle,
  onUnlockPhase2,
  onRetry,
  onSkip,
}: {
  results: TaskResult[];
  passThreshold: number;
  labTitle: string;
  onUnlockPhase2: () => void;
  onRetry: () => void;
  onSkip: () => void;
}) {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const pct = passed / total;
  const overallPass = pct >= passThreshold;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={sum.header}>
        <Text style={[sum.verdict, { color: overallPass ? '#22c55e' : '#ef4444' }]}>
          {overallPass ? '⭐ PHASE 1 COMPLETE' : '✗ NOT YET'}
        </Text>
        <Text style={sum.score}>{passed}/{total} tasks passed</Text>
        <Text style={sum.threshold}>
          Required: {Math.round(passThreshold * 100)}% ({Math.ceil(total * passThreshold)}/{total})
        </Text>
        {overallPass && (
          <View style={sum.unlockBadge}>
            <Text style={sum.unlockText}>🏆 Phase 2 Unlocked</Text>
          </View>
        )}
      </View>

      <SectionLabel text="TASK BREAKDOWN" />
      {results.map((r, i) => (
        <TaskResultCard key={i} result={r} taskNumber={i + 1} hintsEnabled={true} />
      ))}

      {overallPass ? (
        <PrimaryBtn label="Begin Phase 2 →" onPress={onUnlockPhase2} color="#22c55e" />
      ) : (
        <>
          <View style={sum.retryBox}>
            <Text style={sum.retryText}>
              Review the tasks you did not pass. On retry, you will receive a new draw of {total} tasks from the pool.
            </Text>
          </View>
          <PrimaryBtn label="Retry Phase 1" onPress={onRetry} color="#f59e0b" />
        </>
      )}
      <GhostBtn label="Skip" onPress={onSkip} />
    </ScrollView>
  );
}

const sum = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 6 },
  verdict: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  score: { fontSize: 18, fontWeight: '700', color: Colors.text },
  threshold: { fontSize: 12, color: Colors.textSoft },
  unlockBadge: {
    backgroundColor: '#052e16', borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderWidth: 1, borderColor: '#22c55e40', marginTop: 4,
  },
  unlockText: { fontSize: 14, color: '#22c55e', fontWeight: '800' },
  retryBox: {
    backgroundColor: '#fffbeb', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#fde68a',
    marginBottom: Spacing.sm,
  },
  retryText: { fontSize: 13, color: '#92400e', lineHeight: 19 },
});

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = 'task' | 'result' | 'summary';

export default function Phase1BossRenderer({
  labId, labTitle,
  taskPool, drawPerAttempt, passThreshold,
  hintsEnabled, attemptNumber = 1,
  onPhase2Unlock, onComplete, onSkip,
}: Phase1BossProps) {

  // Draw tasks for this attempt — seeded by labId + attemptNumber
  const seed = labId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + attemptNumber * 997;
  const drawnTasks = useMemo(
    () => drawTasks(taskPool, drawPerAttempt, seed),
    [taskPool, drawPerAttempt, seed]
  );

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('task');
  const [currentResult, setCurrentResult] = useState<TaskResult | null>(null);
  const [allResults, setAllResults] = useState<TaskResult[]>([]);

  const handleSubmitAnswer = useCallback((response: string, criteria: string[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const scoring = scoreResponseDeterministic(response, criteria);
    // For Phase 1: self-assess criteria are auto-passed if response meets quality gates
    const qualityGate = validateMinimumInput(
      'judgment-dataInterpret',
      response,
      false,
    );
    // If response passes quality gate, promote self-assess criteria to passed
    const finalResults = scoring.criteriaResults.map(cr => {
      if (cr.selfAssessRequired && qualityGate.valid) {
        return { ...cr, passed: true, feedback: '✓ Response demonstrates sufficient engagement with the task.' };
      }
      return cr;
    });
    const finalScore = finalResults.filter(r => r.passed).length;
    const finalTotal = finalResults.length;
    const finalPct = finalTotal > 0 ? finalScore / finalTotal : 0;

    const result: TaskResult = {
      taskIndex: currentTaskIndex,
      taskText: drawnTasks[currentTaskIndex].text,
      response,
      scoring: {
        ...scoring,
        criteriaResults: finalResults,
        score: finalScore,
        total: finalTotal,
        autoPassCount: finalResults.filter(r => r.passed && !r.selfAssessRequired).length,
        selfAssessCount: 0,
      },
      passed: finalPct >= 0.6, // each task passes at 60%
    };

    setCurrentResult(result);
    setPhase('result');
    Haptics.notificationAsync(
      result.passed
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    );
  }, [currentTaskIndex, drawnTasks]);

  const handleNextTask = useCallback(() => {
    if (!currentResult) return;
    const newResults = [...allResults, currentResult];
    setAllResults(newResults);

    if (currentTaskIndex + 1 < drawnTasks.length) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setCurrentResult(null);
      setPhase('task');
    } else {
      setPhase('summary');
    }
  }, [currentResult, allResults, currentTaskIndex, drawnTasks.length]);

  const handleRetry = useCallback(() => {
    setCurrentTaskIndex(0);
    setAllResults([]);
    setCurrentResult(null);
    setPhase('task');
  }, []);

  if (phase === 'summary') {
    return (
      <SimShell title="PHASE 1" subtitle={`${labTitle} — Boss Gauntlet`} icon="⭐" label="⭐ BOSS BATTLE — PHASE 1">
        <SummaryScreen
          results={allResults}
          passThreshold={passThreshold}
          labTitle={labTitle}
          onUnlockPhase2={onPhase2Unlock}
          onRetry={handleRetry}
          onSkip={onSkip}
        />
      </SimShell>
    );
  }

  if (phase === 'result' && currentResult) {
    return (
      <SimShell
        title="PHASE 1"
        subtitle={`Task ${currentTaskIndex + 1} result`}
        icon="⭐"
        label="⭐ BOSS BATTLE — PHASE 1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: currentResult.passed ? '#22c55e' : '#ef4444' }}>
              {currentResult.passed ? '✓ PASS' : '✗ INCOMPLETE'}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSoft, marginTop: 4 }}>
              {currentResult.scoring.score}/{currentResult.scoring.total} criteria met
            </Text>
          </View>

          <Card>
            <SectionLabel text="CRITERIA RESULTS" />
            {currentResult.scoring.criteriaResults.map((cr, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <Text>{cr.passed ? '✅' : '❌'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: cr.passed ? '#86efac' : '#fca5a5', fontWeight: '600', lineHeight: 17 }}>
                    {cr.criterion}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 15 }}>{cr.feedback}</Text>
                </View>
              </View>
            ))}
          </Card>

          {!currentResult.passed && hintsEnabled && (
            <View style={{
              backgroundColor: '#1c1008', borderRadius: Radius.sm, padding: Spacing.md,
              borderWidth: 1, borderColor: '#f59e0b40', marginBottom: Spacing.md,
            }}>
              <Text style={{ fontSize: 12, color: '#fcd34d', lineHeight: 18 }}>
                💡 For this type of task: include all the specific numbers from the scenario. State each result explicitly (e.g., &quot;utilisation = 84%&quot;, not just &quot;approximately correct&quot;).
              </Text>
            </View>
          )}

          <PrimaryBtn
            label={currentTaskIndex + 1 < drawnTasks.length
              ? `Next Task (${currentTaskIndex + 2}/${drawnTasks.length}) →`
              : 'See Final Results →'}
            onPress={handleNextTask}
            color="#7c3aed"
          />
        </ScrollView>
      </SimShell>
    );
  }

  // Task phase
  const current = drawnTasks[currentTaskIndex];
  return (
    <SimShell
      title="PHASE 1 GAUNTLET"
      subtitle={`${labTitle} — Unlimited attempts · ${hintsEnabled ? 'Hints enabled' : 'No hints'}`}
      icon="⭐"
      label="⭐ BOSS BATTLE — PHASE 1"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <TaskCard
          taskNumber={currentTaskIndex + 1}
          totalTasks={drawnTasks.length}
          taskText={current.text}
          onSubmit={handleSubmitAnswer}
          hintsEnabled={hintsEnabled}
        />
        <GhostBtn label="Skip Boss" onPress={onSkip} />
      </ScrollView>
    </SimShell>
  );
}
