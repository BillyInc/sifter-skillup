/**
 * BranchingInterviewRenderer.tsx
 *
 * Handles the Ecosystem Final Boss adaptive interview simulation.
 * Used for: 'branching-interview' simulator type.
 *
 * HOW THE BRANCHING WORKS — NO AI:
 *
 * The Ecosystem Final Boss has 4 core questions. Each question has 3 branches:
 *   Strong:    candidate demonstrates specific, data-backed reasoning
 *   Partial:   candidate is directionally correct but lacks precision
 *   Incorrect: candidate misses the core mechanism
 *
 * The platform classifies the user's response into a branch deterministically:
 *   1. Extract numbers from response → more numbers + % = stronger signal
 *   2. Check for presence of specific required terms (from triggerDescription keywords)
 *   3. Check for anti-patterns (generic statements, missing mechanism)
 *
 * Branch classification thresholds:
 *   Strong:   ≥ 3 of 5 strong signal keywords AND ≥ 1 number/metric
 *   Partial:  ≥ 2 of 5 keywords OR has number but missing mechanism keyword
 *   Incorrect: everything else
 *
 * After classification, the platform presents the branch's follow-up question.
 * User answers the follow-up. Platform scores against that branch's scoringCriteria
 * using the deterministic scorer.
 *
 * FINAL PASS CONDITION:
 *   Must pass the follow-up scoring for at least 3 of 4 questions.
 *   Each follow-up is scored against its branch's specific scoringCriteria.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, SectionLabel, Card,
  type SimBaseProps,
} from './SimulatorShared';
import { scoreResponseDeterministic, finaliseWithSelfAssess } from '../../lib/deterministicScorer';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ─── Branch types (matching lesson data structure) ─────────────────────────────

export interface BranchDef {
  triggerDescription: string;
  followUpQuestion: string;
  scoringCriteria: string[];
}

export interface CoreQuestion {
  questionId: string;
  question: string;
  branches: {
    strong: BranchDef;
    partial: BranchDef;
    incorrect: BranchDef;
  };
}

export interface BranchingInterviewProps extends SimBaseProps {
  interviewTitle: string;
  interviewDescription: string;
  coreQuestions: CoreQuestion[];
  passRequirement: number; // how many questions must pass (e.g. 3 of 4)
  onArtifactContent?: (content: string) => void;
}

// ─── Branch classifier ─────────────────────────────────────────────────────────

type Branch = 'strong' | 'partial' | 'incorrect';

/**
 * Deterministic branch classification.
 * Uses keyword sets extracted from triggerDescriptions + response quality signals.
 */
function classifyBranch(
  response: string,
  question: CoreQuestion,
): Branch {
  const lower = response.toLowerCase();
  const wordCount = response.trim().split(/\s+/).length;

  // Very short response → incorrect
  if (wordCount < 30) return 'incorrect';

  // Extract strong signal keywords from triggerDescription for 'strong' branch
  const strongTrigger = question.branches.strong.triggerDescription.toLowerCase();
  const strongKeywords = extractTriggerKeywords(strongTrigger);

  // Extract partial signal keywords
  const partialTrigger = question.branches.partial.triggerDescription.toLowerCase();
  const partialKeywords = extractTriggerKeywords(partialTrigger);

  // Check for numbers in response (sign of data-backed reasoning)
  const hasNumbers = /\d+\.?\d*%|\$\d+[MKB]?|\d{4,}/.test(response);
  const hasMultipleNumbers = (response.match(/\d+\.?\d*%|\$\d+[MKB]?/g) ?? []).length >= 2;

  // Check for specific references (artifact IDs, protocol names, query table names)
  const hasArtifactRef = /PA-L\d+-\d+|decoded_starknet\.|starknet\.token_transfers|DAU|TVL|MoM/i.test(response);
  const hasProtocolNames = /ekubo|vesu|nostra|avnu|pragma|starkware|myswap/i.test(lower);
  const hasMechanism = /because|therefore|which means|this causes|leading to|mechanism|explains/i.test(lower);

  // Count strong keyword matches
  const strongMatches = strongKeywords.filter(kw => lower.includes(kw)).length;
  const partialMatches = partialKeywords.filter(kw => lower.includes(kw)).length;

  // Strong: 3+ strong keywords + numbers + mechanism word
  if (strongMatches >= 3 && (hasNumbers || hasArtifactRef) && hasMechanism) {
    return 'strong';
  }

  // Strong: 4+ keywords regardless
  if (strongMatches >= 4 && hasMultipleNumbers) {
    return 'strong';
  }

  // Partial: some strong keywords OR partial keywords + direction correct
  if (strongMatches >= 2 || (partialMatches >= 2 && (hasNumbers || hasProtocolNames))) {
    return 'partial';
  }

  // Partial: short but has protocol-specific content
  if (hasProtocolNames && hasMechanism) {
    return 'partial';
  }

  return 'incorrect';
}

function extractTriggerKeywords(triggerText: string): string[] {
  // Extract meaningful terms: protocol names, metric names, technical terms
  const words = triggerText.match(/\b[a-z]{4,}\b/g) ?? [];
  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'they', 'their', 'have', 'been',
    'will', 'were', 'more', 'than', 'which', 'when', 'what', 'does',
    'candidate', 'leads', 'states', 'correct', 'specific', 'about',
    'rather', 'cannot', 'articulate', 'identifies', 'mentions', 'makes',
  ]);
  return [...new Set(words.filter(w => !stopWords.has(w)))].slice(0, 10);
}

// ─── Question state ────────────────────────────────────────────────────────────

interface QuestionState {
  questionId: string;
  initialResponse: string;
  branch: Branch;
  followUpResponse: string;
  scoringResult: any | null;
  selfAssessConfirmed: Set<number>;
  finalised: boolean;
  passed: boolean;
}

// ─── Progress indicator ────────────────────────────────────────────────────────

function ProgressDots({ total, current, results }: {
  total: number; current: number; results: (boolean | null)[];
}) {
  return (
    <View style={pd.row}>
      {Array.from({ length: total }).map((_, i) => {
        const res = results[i];
        const isActive = i === current;
        return (
          <View
            key={i}
            style={[
              pd.dot,
              isActive && pd.dotActive,
              res === true && pd.dotPass,
              res === false && pd.dotFail,
            ]}
          >
            <Text style={pd.dotText}>
              {res === true ? '✓' : res === false ? '✗' : (i + 1).toString()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const pd = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.md },
  dot: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  dotPass: { backgroundColor: '#ecfdf5', borderColor: '#22c55e' },
  dotFail: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
  dotText: { fontSize: 11, fontWeight: '800', color: Colors.textSoft },
});

// ─── Branch label ─────────────────────────────────────────────────────────────

const BRANCH_LABELS: Record<Branch, { label: string; color: string; icon: string }> = {
  strong:    { label: 'STRONG RESPONSE',    color: '#22c55e', icon: '⚡' },
  partial:   { label: 'PARTIAL RESPONSE',   color: '#f59e0b', icon: '◑' },
  incorrect: { label: 'NEEDS DEVELOPMENT',  color: '#ef4444', icon: '↻' },
};

// ─── Main component ───────────────────────────────────────────────────────────

type InterviewPhase = 'intro' | 'initial' | 'classified' | 'followup' | 'scored' | 'complete';

export default function BranchingInterviewRenderer({
  interviewTitle, interviewDescription,
  coreQuestions, passRequirement,
  onComplete, onSkip, onArtifactContent,
}: BranchingInterviewProps) {

  const [phase, setPhase] = useState<InterviewPhase>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [initialResponse, setInitialResponse] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState('');
  const [currentBranch, setCurrentBranch] = useState<Branch>('partial');
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [selfAssessConfirmed, setSelfAssessConfirmed] = useState<Set<number>>(new Set());
  const [partialResult, setPartialResult] = useState<any>(null);

  const currentQ = coreQuestions[currentQIndex];
  const results = questionStates.map(qs => qs.passed ? true : qs.finalised ? false : null);
  const totalPassed = questionStates.filter(qs => qs.passed).length;

  const handleClassify = () => {
    if (initialResponse.trim().length < 50) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const branch = classifyBranch(initialResponse, currentQ);
    setCurrentBranch(branch);
    setPhase('classified');
  };

  const handleFollowUp = () => {
    if (followUpResponse.trim().length < 40) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const branchDef = currentQ.branches[currentBranch];
    const result = scoreResponseDeterministic(followUpResponse, branchDef.scoringCriteria);
    setPartialResult(result);
    setSelfAssessConfirmed(new Set());

    if (result.selfAssessCount === 0) {
      finalise(result, new Set());
    } else {
      setPhase('scored'); // show self-assess checkboxes
    }
  };

  const finalise = (result: any, confirmed: Set<number>) => {
    const finalResult = result.selfAssessCount > 0
      ? finaliseWithSelfAssess(result, confirmed)
      : result;

    const passed = finalResult.score / finalResult.total >= 0.6;

    const newState: QuestionState = {
      questionId: currentQ.questionId,
      initialResponse,
      branch: currentBranch,
      followUpResponse,
      scoringResult: finalResult,
      selfAssessConfirmed: confirmed,
      finalised: true,
      passed,
    };

    const newStates = [...questionStates, newState];
    setQuestionStates(newStates);

    if (currentQIndex + 1 < coreQuestions.length) {
      // Move to next question
      setCurrentQIndex(currentQIndex + 1);
      setInitialResponse('');
      setFollowUpResponse('');
      setPartialResult(null);
      setSelfAssessConfirmed(new Set());
      setPhase('initial');
    } else {
      // All questions done
      const finalPassed = newStates.filter(s => s.passed).length;
      buildArtifact(newStates);
      setPhase('complete');
    }

    Haptics.notificationAsync(
      passed ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    );
  };

  const handleConfirmSelfAssess = () => {
    finalise(partialResult, selfAssessConfirmed);
  };

  const buildArtifact = (states: QuestionState[]) => {
    const transcript = states.map((qs, i) => {
      const q = coreQuestions[i];
      const branchInfo = BRANCH_LABELS[qs.branch];
      return `## Question ${i + 1}\n\n**Q:** ${q.question}\n\n**A:** ${qs.initialResponse}\n\n**Classification:** ${branchInfo.label}\n\n**Follow-Up:** ${q.branches[qs.branch].followUpQuestion}\n\n**Follow-Up Response:** ${qs.followUpResponse}\n\n**Result:** ${qs.passed ? 'PASSED' : 'FAILED'} (${qs.scoringResult?.score}/${qs.scoringResult?.total})`;
    }).join('\n\n---\n\n');

    const totalP = states.filter(s => s.passed).length;
    const summary = `# Final Boss Transcript\n\n**Result:** ${totalP >= passRequirement ? '✓ PASSED' : '✗ FAILED'}\n**Score:** ${totalP}/${coreQuestions.length} questions passed\n**Required:** ${passRequirement}\n\n---\n\n${transcript}`;

    onArtifactContent?.(summary);
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SimShell title="FINAL BOSS" subtitle={interviewTitle} icon="👑" label="👑 FINAL BOSS — INTERVIEW MODE">
        <Card>
          <Text style={intro.title}>{interviewTitle}</Text>
          <Text style={intro.desc}>{interviewDescription}</Text>
          <View style={intro.rules}>
            <Text style={intro.rulesTitle}>HOW THIS WORKS:</Text>
            <Text style={intro.rule}>• {coreQuestions.length} core questions — each has a follow-up</Text>
            <Text style={intro.rule}>• Your answer determines which follow-up you receive</Text>
            <Text style={intro.rule}>• Each follow-up is scored against specific criteria</Text>
            <Text style={intro.rule}>• Pass {passRequirement} of {coreQuestions.length} to earn certification</Text>
            <Text style={intro.rule}>• No hints. No lesson pointers. Senior level.</Text>
          </View>
          <PrimaryBtn label="Begin Interview →" onPress={() => setPhase('initial')} color="#7c3aed" />
        </Card>
        <GhostBtn label="Skip" onPress={onSkip} />
      </SimShell>
    );
  }

  // ── Complete ───────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const overallPassed = totalPassed >= passRequirement;
    return (
      <SimShell title="FINAL BOSS" subtitle="Interview Complete" icon="👑" label="👑 FINAL BOSS">
        <Card>
          <Text style={[comp.verdict, { color: overallPassed ? '#22c55e' : '#ef4444' }]}>
            {overallPassed ? '✓ CERTIFIED' : '✗ NOT YET'}
          </Text>
          <Text style={comp.score}>
            {totalPassed}/{coreQuestions.length} questions passed
          </Text>
          <Text style={comp.req}>Required: {passRequirement}/{coreQuestions.length}</Text>
          {questionStates.map((qs, i) => (
            <View key={i} style={comp.qRow}>
              <Text style={{ fontSize: 13 }}>{qs.passed ? '✅' : '❌'}</Text>
              <Text style={comp.qText}>Q{i + 1}: {BRANCH_LABELS[qs.branch].label}</Text>
            </View>
          ))}
          {overallPassed
            ? <PrimaryBtn label="Push to Portfolio →" onPress={onComplete} color="#22c55e" />
            : <PrimaryBtn label="Try Again (Fresh Scenario)" onPress={onSkip} color="#f59e0b" />}
        </Card>
      </SimShell>
    );
  }

  // ── Initial question ───────────────────────────────────────────────────────
  if (phase === 'initial') {
    return (
      <SimShell title="FINAL BOSS" subtitle={`Question ${currentQIndex + 1} of ${coreQuestions.length}`} icon="👑" label="👑 FINAL BOSS">
        <ProgressDots total={coreQuestions.length} current={currentQIndex} results={results} />
        <Card>
          <SectionLabel text={`QUESTION ${currentQIndex + 1}`} />
          <Text style={q.text}>{currentQ.question}</Text>
        </Card>
        <Card>
          <SectionLabel text="YOUR RESPONSE" />
          <TextInput
            value={initialResponse}
            onChangeText={setInitialResponse}
            placeholder="Give a specific, data-backed response. Reference numbers and protocol names where relevant."
            placeholderTextColor="#94a3b8"
            multiline
            style={q.input}
            textAlignVertical="top"
          />
          <Text style={q.wc}>{initialResponse.trim().split(/\s+/).filter(Boolean).length} words</Text>
        </Card>
        <PrimaryBtn
          label="Submit Response →"
          onPress={handleClassify}
          disabled={initialResponse.trim().length < 50}
          color="#7c3aed"
        />
      </SimShell>
    );
  }

  // ── Classified ─────────────────────────────────────────────────────────────
  if (phase === 'classified') {
    const bl = BRANCH_LABELS[currentBranch];
    const branchDef = currentQ.branches[currentBranch];
    return (
      <SimShell title="FINAL BOSS" subtitle="Follow-up" icon="👑" label="👑 FINAL BOSS">
        <ProgressDots total={coreQuestions.length} current={currentQIndex} results={results} />
        <Card>
          <View style={cl.badge}>
            <Text style={[cl.badgeText, { color: bl.color }]}>{bl.icon} {bl.label}</Text>
          </View>
          {currentBranch === 'incorrect' && (
            <Text style={cl.redirect}>
              {(currentQ.branches.incorrect as any).redirectStatement}
            </Text>
          )}
          <SectionLabel text="FOLLOW-UP QUESTION" />
          <Text style={q.text}>{branchDef.followUpQuestion}</Text>
        </Card>
        <Card>
          <TextInput
            value={followUpResponse}
            onChangeText={setFollowUpResponse}
            placeholder="Answer the follow-up question precisely. Be specific."
            placeholderTextColor="#94a3b8"
            multiline
            style={q.input}
            textAlignVertical="top"
          />
        </Card>
        <PrimaryBtn
          label="Submit Follow-Up →"
          onPress={handleFollowUp}
          disabled={followUpResponse.trim().length < 40}
          color="#7c3aed"
        />
      </SimShell>
    );
  }

  // ── Self-assess checkboxes (if needed after follow-up scoring) ─────────────
  if (phase === 'scored' && partialResult) {
    const selfCriteria = partialResult.criteriaResults.filter((r: any) => r.selfAssessRequired);
    return (
      <SimShell title="FINAL BOSS" subtitle="Assess your response" icon="👑" label="👑 FINAL BOSS">
        <Card>
          <SectionLabel text="AUTO-CHECKED CRITERIA" />
          {partialResult.criteriaResults.filter((r: any) => !r.selfAssessRequired).map((r: any, i: number) => (
            <View key={i} style={sa.row}>
              <Text>{r.passed ? '✅' : '❌'}</Text>
              <Text style={[sa.text, { color: r.passed ? '#86efac' : '#fca5a5' }]}>{r.criterion}</Text>
            </View>
          ))}
        </Card>
        <Card>
          <SectionLabel text="SELF-ASSESS CRITERIA" />
          {selfCriteria.map((r: any, idx: number) => {
            const realIdx = partialResult.criteriaResults.indexOf(r);
            const checked = selfAssessConfirmed.has(realIdx);
            return (
              <TouchableOpacity
                key={idx}
                style={[sa.checkRow, checked && sa.checkRowActive]}
                onPress={() => {
                  setSelfAssessConfirmed(prev => {
                    const next = new Set(prev);
                    next.has(realIdx) ? next.delete(realIdx) : next.add(realIdx);
                    return next;
                  });
                }}
              >
                <View style={[sa.cb, checked && sa.cbActive]}>
                  {checked && <Text style={sa.ck}>✓</Text>}
                </View>
                <Text style={sa.text}>{r.criterion}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>
        <PrimaryBtn
          label="Confirm Assessment →"
          onPress={handleConfirmSelfAssess}
          color="#7c3aed"
        />
      </SimShell>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const intro = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  desc: { fontSize: 13, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.md },
  rules: { backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  rulesTitle: { fontSize: 11, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.sm },
  rule: { fontSize: 13, color: Colors.textSoft, lineHeight: 22 },
});

const q = StyleSheet.create({
  text: {
    fontSize: FontSize.sm, color: Colors.text, lineHeight: 22,
    fontFamily: 'Georgia',
  },
  input: {
    backgroundColor: Colors.card, color: Colors.text, fontSize: FontSize.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, minHeight: 160, lineHeight: 22,
  },
  wc: { fontSize: 10, color: Colors.textMuted, textAlign: 'right', marginTop: 4 },
});

const cl = StyleSheet.create({
  badge: { alignItems: 'center', marginBottom: Spacing.md },
  badgeText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  redirect: {
    fontSize: 13, color: '#94a3b8', lineHeight: 20, fontStyle: 'italic',
    backgroundColor: '#0a0f1e', borderRadius: Radius.sm, padding: Spacing.sm,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: '#1e293b',
  },
});

const comp = StyleSheet.create({
  verdict: { fontSize: 18, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  score: { fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center', marginTop: 4 },
  req: { fontSize: 12, color: Colors.textSoft, textAlign: 'center', marginBottom: Spacing.md },
  qRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  qText: { fontSize: 13, color: Colors.textSoft },
});

const sa = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 6 },
  text: { flex: 1, fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  checkRow: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: 6,
    backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b',
  },
  checkRowActive: { backgroundColor: '#052e16', borderColor: '#22c55e40' },
  cb: {
    width: 18, height: 18, borderRadius: 3, borderWidth: 2, borderColor: '#475569',
    alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0,
  },
  cbActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  ck: { fontSize: 10, color: '#fff', fontWeight: '800' },
});
