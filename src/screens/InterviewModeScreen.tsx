/**
 * Sifter Skill_Up — Interview Mode Screen
 *
 * A complete simulated job interview for a specific role and seniority level.
 * Structured exactly as that industry runs real interviews — not a difficulty
 * selector, not a cross-level aggregate, not a quiz.
 *
 * SUPPLY CHAIN ANALYST INTERVIEW STRUCTURE (industry standard):
 *   Junior:       2 behavioural (STAR) + 1 technical + 1 live case study
 *   Intermediate: 2 behavioural (STAR) + 2 technical + 1 live case study + 1 situational
 *   Senior:       2 behavioural (STAR) + 2 technical + 1 strategy case + 1 stakeholder scenario
 *
 * The behavioural section uses the user's own earned portfolio artifacts as
 * source material — because in a real interview, you'd be asked about actual
 * work. If no artifacts yet, platform generates plausible scenarios.
 *
 * On pass → portfolio artifact: "Interview Performance" case study pushed.
 * On fail → criteria pass/fail only. No pointers. No explanation.
 * No difficulty selector. Unlimited attempts. Fresh scenario each time.
 *
 * The interview structure template is derived from the track + level at
 * runtime. No hard-coded structures beyond Supply Chain Analyst reference.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { API } from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type InterviewLevel = 'junior' | 'intermediate' | 'senior';
type QuestionType = 'behavioural' | 'technical' | 'case-study' | 'situational' | 'strategy' | 'stakeholder';
type InterviewPhase = 'intro' | 'question' | 'reviewing' | 'result';

interface InterviewQuestion {
  id: string;
  type: QuestionType;
  index: number;        // 1-based display number
  total: number;
  question: string;
  context?: string;     // extra scenario context for case/situational questions
  fromArtifact?: {      // populated when question draws from user's portfolio
    labId: string;
    skill: string;
  };
  scoringCriteria: string[];
  timeGuidance: string; // e.g. "2-3 minutes spoken / 150-200 words written"
}

interface InterviewSession {
  sessionId: string;
  trackId: string;
  level: InterviewLevel;
  roleName: string;
  totalQuestions: number;
  currentQuestion: InterviewQuestion | null;
  questionsAnswered: number;
  complete: boolean;
}

interface InterviewResult {
  passed: boolean;
  criteriaResults: Array<{
    questionId: string;
    questionType: QuestionType;
    criteriaResults: Array<{ criterion: string; passed: boolean }>;
  }>;
  portfolioArtifact?: {
    pushed: boolean;
    platforms: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Interview structure reference — Supply Chain Analyst
// Platform generates this structure for all other tracks at runtime
// ─────────────────────────────────────────────────────────────────────────────

const INTERVIEW_STRUCTURE: Record<InterviewLevel, {
  description: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  industryNote: string;
}> = {
  junior: {
    description: 'Junior Supply Chain Analyst interview',
    questionTypes: ['behavioural', 'behavioural', 'technical', 'case-study'],
    totalQuestions: 4,
    industryNote: 'Junior interviews focus on your analytical thinking, attention to detail, and ability to learn. Interviewers are not expecting you to have solved major supply chain crises — they want to see how you think through problems.',
  },
  intermediate: {
    description: 'Intermediate Supply Chain Analyst interview',
    questionTypes: ['behavioural', 'behavioural', 'technical', 'technical', 'case-study', 'situational'],
    totalQuestions: 6,
    industryNote: 'Mid-level interviews test whether you can own decisions without escalating. Interviewers want evidence you have managed cross-functional situations, not just executed tasks.',
  },
  senior: {
    description: 'Senior Supply Chain Analyst interview',
    questionTypes: ['behavioural', 'behavioural', 'technical', 'technical', 'strategy', 'stakeholder'],
    totalQuestions: 6,
    industryNote: 'Senior interviews assess strategic thinking and leadership. You are expected to have opinions about how supply chains should be designed, not just how to run them.',
  },
};

const QUESTION_TYPE_LABELS: Record<QuestionType, { label: string; emoji: string; guidance: string }> = {
  behavioural:  { label: 'Behavioural',        emoji: '💬', guidance: 'Use the STAR method: Situation → Task → Action → Result. Be specific. Use real numbers where possible.' },
  technical:    { label: 'Technical',           emoji: '⚙️',  guidance: 'Show your working. Name the framework, formula, or tool you are applying and why.' },
  'case-study': { label: 'Live Case Study',     emoji: '📋', guidance: 'Structure your answer: diagnose first, then recommend, then measure. Do not jump to solutions before identifying root cause.' },
  situational:  { label: 'Situational',         emoji: '🧭', guidance: 'Explain what you would do and why. Reference a framework or past experience that informs your approach.' },
  strategy:     { label: 'Strategy Question',   emoji: '♟️',  guidance: 'Think at the system level. What are the first principles? What trade-offs exist? What would you recommend and why?' },
  stakeholder:  { label: 'Stakeholder Scenario',emoji: '🤝', guidance: 'Demonstrate that you can align, not just instruct. Show awareness of others\' incentives and how to navigate them.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function InterviewIntro({
  level,
  trackName,
  onStart,
}: {
  level: InterviewLevel;
  trackName: string;
  onStart: () => void;
}) {
  const structure = INTERVIEW_STRUCTURE[level];

  return (
    <ScrollView contentContainerStyle={styles.introContainer}>
      <Text style={styles.introEmoji}>🎤</Text>
      <Text style={styles.introTitle}>{structure.description}</Text>
      <Text style={styles.introSub}>{trackName}</Text>

      <View style={styles.industryNoteBox}>
        <Text style={styles.industryNoteLabel}>WHAT INTERVIEWERS ARE LOOKING FOR</Text>
        <Text style={styles.industryNoteText}>{structure.industryNote}</Text>
      </View>

      <Text style={styles.structureTitle}>Interview structure ({structure.totalQuestions} questions)</Text>
      {structure.questionTypes.map((type, i) => {
        const cfg = QUESTION_TYPE_LABELS[type];
        return (
          <View key={i} style={styles.structureRow}>
            <View style={styles.structureNum}>
              <Text style={styles.structureNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.structureEmoji}>{cfg.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.structureLabel}>{cfg.label}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.rulesBox}>
        {[
          'No hints at any point',
          'Pass/fail per criterion on fail — no explanations',
          '100% of criteria required to push to portfolio',
          'Fresh scenario generated for every attempt',
          'Unlimited attempts',
        ].map((rule, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
        <Text style={styles.startBtnText}>Begin Interview</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function QuestionView({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  submitting,
}: {
  question: InterviewQuestion;
  answer: string;
  onAnswerChange: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const cfg = QUESTION_TYPE_LABELS[question.type];

  return (
    <ScrollView contentContainerStyle={styles.questionContainer} keyboardShouldPersistTaps="handled">
      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(question.index / question.total) * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>Question {question.index} of {question.total}</Text>

      {/* Question type badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
        <Text style={styles.typeLabel}>{cfg.label}</Text>
        {question.fromArtifact && (
          <View style={styles.fromArtifactBadge}>
            <Text style={styles.fromArtifactText}>From your portfolio: {question.fromArtifact.skill}</Text>
          </View>
        )}
      </View>

      {/* Context if present */}
      {question.context && (
        <View style={styles.contextBox}>
          <Text style={styles.contextLabel}>SCENARIO CONTEXT</Text>
          <Text style={styles.contextText}>{question.context}</Text>
        </View>
      )}

      {/* Question */}
      <Text style={styles.questionText}>{question.question}</Text>

      {/* Guidance */}
      <View style={styles.guidanceBox}>
        <Text style={styles.guidanceLabel}>GUIDANCE</Text>
        <Text style={styles.guidanceText}>{cfg.guidance}</Text>
        <Text style={styles.timingText}>⏱ {question.timeGuidance}</Text>
      </View>

      {/* Answer input */}
      <TextInput
        style={styles.answerInput}
        value={answer}
        onChangeText={onAnswerChange}
        multiline
        placeholder="Type your answer here..."
        placeholderTextColor={Colors.textMuted}
        textAlignVertical="top"
      />
      <Text style={styles.wordCount}>
        {answer.trim().split(/\s+/).filter(Boolean).length} words
      </Text>

      <TouchableOpacity
        style={[styles.submitBtn, (!answer.trim() || submitting) && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={!answer.trim() || submitting}
        activeOpacity={0.85}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>
              {question.index === question.total ? 'Submit Final Answer' : 'Submit & Continue →'}
            </Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

function ResultView({
  result,
  level,
  onRetry,
  onDone,
}: {
  result: InterviewResult;
  level: InterviewLevel;
  onRetry: () => void;
  onDone: () => void;
}) {
  const totalCriteria = result.criteriaResults.reduce((sum, q) => sum + q.criteriaResults.length, 0);
  const passedCriteria = result.criteriaResults.reduce(
    (sum, q) => sum + q.criteriaResults.filter(c => c.passed).length, 0
  );

  return (
    <ScrollView contentContainerStyle={styles.resultContainer}>
      <Text style={styles.resultEmoji}>{result.passed ? '🏆' : '📋'}</Text>
      <Text style={styles.resultTitle}>
        {result.passed ? 'Interview passed' : 'Not all criteria met'}
      </Text>

      {result.passed && result.portfolioArtifact?.pushed && (
        <View style={styles.portfolioPushedBox}>
          <Text style={styles.portfolioPushedTitle}>Portfolio artifact pushed</Text>
          <Text style={styles.portfolioPushedText}>
            "Interview Performance — {level.charAt(0).toUpperCase() + level.slice(1)} Supply Chain Analyst"
            has been added to your portfolio.
          </Text>
          {result.portfolioArtifact.platforms.map(p => (
            <Text key={p} style={styles.platformPushed}>✅ {p}</Text>
          ))}
        </View>
      )}

      {/* Criteria breakdown — always shown, pass or fail */}
      <Text style={styles.criteriaTitle}>
        Criteria: {passedCriteria}/{totalCriteria} passed
      </Text>

      {result.criteriaResults.map((qResult, qi) => {
        const cfg = QUESTION_TYPE_LABELS[qResult.questionType];
        return (
          <View key={qResult.questionId} style={styles.qCriteriaBlock}>
            <Text style={styles.qCriteriaHeader}>
              {cfg.emoji} Question {qi + 1} — {cfg.label}
            </Text>
            {qResult.criteriaResults.map((c, ci) => (
              <View key={ci} style={styles.criterionRow}>
                <Text style={[styles.criterionIcon, { color: c.passed ? '#10b981' : '#ef4444' }]}>
                  {c.passed ? '✅' : '❌'}
                </Text>
                <Text style={styles.criterionText}>{c.criterion}</Text>
              </View>
            ))}
          </View>
        );
      })}

      {!result.passed && (
        <View style={styles.retryNote}>
          <Text style={styles.retryNoteText}>
            A fresh unseen scenario will be generated for your next attempt.
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.retryBtnText}>
          {result.passed ? 'Go again (new scenario)' : 'Retry with new scenario'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.7}>
        <Text style={styles.doneBtnText}>Back to track</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  trackId: string;
  level: InterviewLevel;
  trackName: string;
  onBack: () => void;
}

export default function InterviewModeScreen({ trackId, level, trackName, onBack }: Props) {
  const [phase, setPhase] = useState<InterviewPhase>('intro');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);

  const startInterview = async () => {
    try {
      const sess = await API.startInterviewSession(trackId, level);
      setSession(sess);
      setPhase('question');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not start interview. Please try again.');
    }
  };

  const submitAnswer = async () => {
    if (!session?.currentQuestion || !currentAnswer.trim()) return;
    setSubmitting(true);
    try {
      const next = await API.submitInterviewAnswer(
        session.sessionId,
        session.currentQuestion.id,
        currentAnswer.trim(),
      );
      setCurrentAnswer('');
      if (next.complete) {
        setPhase('reviewing');
        const res = await API.getInterviewResult(session.sessionId);
        setResult(res);
        setPhase('result');
      } else {
        setSession(prev => prev ? { ...prev, currentQuestion: next.nextQuestion, questionsAnswered: prev.questionsAnswered + 1 } : prev);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setSession(null);
    setResult(null);
    setCurrentAnswer('');
    setPhase('intro');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🎤 Interview Mode</Text>
          <Text style={styles.headerSub}>{trackName} · {level.charAt(0).toUpperCase() + level.slice(1)}</Text>
        </View>
      </View>

      {phase === 'intro' && (
        <InterviewIntro level={level} trackName={trackName} onStart={startInterview} />
      )}

      {phase === 'question' && session?.currentQuestion && (
        <QuestionView
          question={session.currentQuestion}
          answer={currentAnswer}
          onAnswerChange={setCurrentAnswer}
          onSubmit={submitAnswer}
          submitting={submitting}
        />
      )}

      {phase === 'reviewing' && (
        <View style={styles.reviewingContainer}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.reviewingText}>Reviewing your answers…</Text>
          <Text style={styles.reviewingSub}>Scoring against industry criteria</Text>
        </View>
      )}

      {phase === 'result' && result && (
        <ResultView
          result={result}
          level={level}
          onRetry={retry}
          onDone={onBack}
        />
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  backBtn: { padding: Spacing.sm, marginRight: Spacing.sm },
  backBtnText: { fontSize: 22, color: Colors.text },
  headerTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSoft },

  // Intro
  introContainer: { padding: Spacing.xl },
  introEmoji: { fontSize: 48, textAlign: 'center', marginBottom: Spacing.md },
  introTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.xs },
  introSub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', marginBottom: Spacing.xl },

  industryNoteBox: { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xl },
  industryNoteLabel: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1, marginBottom: Spacing.xs },
  industryNoteText: { fontSize: FontSize.sm, color: Colors.navy, lineHeight: 20 },

  structureTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  structureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border },
  structureNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  structureNumText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  structureEmoji: { fontSize: 16, width: 24 },
  structureLabel: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },

  rulesBox: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginVertical: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  ruleRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 3 },
  ruleDot: { color: Colors.textMuted },
  ruleText: { fontSize: FontSize.sm, color: Colors.textSoft, flex: 1 },

  startBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', ...Shadow.md },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },

  // Question
  questionContainer: { padding: Spacing.xl },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: Spacing.xs },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right', marginBottom: Spacing.lg },

  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  typeEmoji: { fontSize: 20 },
  typeLabel: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  fromArtifactBadge: { backgroundColor: Colors.goldSoft, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  fromArtifactText: { fontSize: 10, color: Colors.gold, fontWeight: '700' },

  contextBox: { backgroundColor: '#f8fafc', borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  contextLabel: { fontSize: 9, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  contextText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },

  questionText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, lineHeight: 26, marginBottom: Spacing.md },

  guidanceBox: { backgroundColor: Colors.greenSoft, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.md },
  guidanceLabel: { fontSize: 9, fontWeight: '800', color: '#166534', letterSpacing: 1, marginBottom: 4 },
  guidanceText: { fontSize: FontSize.sm, color: '#166534', lineHeight: 18 },
  timingText: { fontSize: FontSize.xs, color: '#166534', marginTop: 4, fontStyle: 'italic' },

  answerInput: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, minHeight: 180, lineHeight: 22 },
  wordCount: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right', marginTop: 4, marginBottom: Spacing.lg },

  submitBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },

  // Reviewing
  reviewingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  reviewingText: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  reviewingSub: { fontSize: FontSize.sm, color: Colors.textSoft },

  // Result
  resultContainer: { padding: Spacing.xl },
  resultEmoji: { fontSize: 48, textAlign: 'center', marginBottom: Spacing.md },
  resultTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.xl },

  portfolioPushedBox: { backgroundColor: '#d1fae5', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xl },
  portfolioPushedTitle: { fontSize: FontSize.sm, fontWeight: '800', color: '#065f46', marginBottom: 4 },
  portfolioPushedText: { fontSize: FontSize.sm, color: '#065f46', lineHeight: 18, marginBottom: Spacing.sm },
  platformPushed: { fontSize: FontSize.xs, color: '#065f46', fontWeight: '600' },

  criteriaTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  qCriteriaBlock: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  qCriteriaHeader: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  criterionRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 4 },
  criterionIcon: { fontSize: 14, width: 20 },
  criterionText: { flex: 1, fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 },

  retryNote: { backgroundColor: Colors.goldSoft, borderRadius: Radius.sm, padding: Spacing.md, marginVertical: Spacing.md },
  retryNoteText: { fontSize: FontSize.sm, color: Colors.gold, textAlign: 'center' },

  retryBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.sm },
  retryBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },
  doneBtn: { padding: Spacing.md, alignItems: 'center' },
  doneBtnText: { fontSize: FontSize.sm, color: Colors.textSoft },
});
