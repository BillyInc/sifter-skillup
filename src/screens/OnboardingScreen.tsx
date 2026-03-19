/**
 * Sifter Skill_Up — Onboarding Screen
 *
 * Shown once to new users immediately after account creation.
 * Three paths:
 *   1. "I know what I want"   → Browse fields → pick role → straight to track
 *   2. "Help me figure it out" → Career interest quiz → platform suggests 3 tracks
 *   3. Returning user          → Resume from exact last position (lesson + lab + level)
 *
 * The quiz is 6 fast questions. Platform scores answers against a
 * field-affinity matrix and surfaces the top 3 matches with reasoning.
 */

import React, { useState, useRef } from 'react';
import {
  View, Modal, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Animated, Dimensions,
} from 'react-native';
import LearnMoreScreen from './LearnMoreScreen';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Career interest quiz
// ─────────────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ label: string; fields: string[]; weight: number }>;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'When something goes wrong at work, what do you instinctively do first?',
    options: [
      { label: 'Pull the data and find out what happened', fields: ['data-science', 'data-analysis', 'supply-chain', 'quant-finance'], weight: 2 },
      { label: 'Call the people involved and understand the situation', fields: ['hr', 'sales', 'project-management', 'supply-chain'], weight: 2 },
      { label: 'Write down what I know and what I need to find out', fields: ['legal', 'writing', 'project-management', 'public-sector'], weight: 2 },
      { label: 'Start fixing it immediately — figure it out as I go', fields: ['software-engineering', 'cloud-devops', 'cybersecurity', 'fintech'], weight: 2 },
    ],
  },
  {
    id: 'q2',
    question: 'What kind of result makes you feel most satisfied?',
    options: [
      { label: 'A dashboard or report that shows exactly what\'s happening', fields: ['data-analysis', 'data-science', 'supply-chain', 'quant-finance'], weight: 2 },
      { label: 'Something I built that other people can use', fields: ['software-engineering', 'cloud-devops', 'product-design', 'ai-ml'], weight: 2 },
      { label: 'A deal closed, a number hit, a target beaten', fields: ['sales', 'real-estate', 'quant-finance', 'fintech'], weight: 2 },
      { label: 'A problem prevented before it happened', fields: ['cybersecurity', 'legal', 'risk', 'supply-chain'], weight: 2 },
    ],
  },
  {
    id: 'q3',
    question: 'Which of these appeals to you most as a workday?',
    options: [
      { label: 'Deep in data, finding patterns no one else noticed', fields: ['data-science', 'quant-finance', 'ai-ml', 'computational-science'], weight: 3 },
      { label: 'Managing a project across teams to hit a deadline', fields: ['project-management', 'supply-chain', 'product-design', 'public-sector'], weight: 3 },
      { label: 'Writing, creating, or communicating complex ideas simply', fields: ['writing', 'digital-marketing', 'edtech', 'hr'], weight: 3 },
      { label: 'Solving a technical problem that no one else can crack', fields: ['software-engineering', 'cybersecurity', 'cloud-devops', 'specialized-engineering'], weight: 3 },
    ],
  },
  {
    id: 'q4',
    question: 'What do you want to be known for in your career?',
    options: [
      { label: 'Being the person who always has the answer — backed by data', fields: ['data-science', 'data-analysis', 'quant-finance', 'ai-ml'], weight: 2 },
      { label: 'Being the person who keeps everything running smoothly', fields: ['supply-chain', 'project-management', 'logistics', 'cloud-devops'], weight: 2 },
      { label: 'Being the person who builds things that last', fields: ['software-engineering', 'product-design', 'specialized-engineering', 'real-estate'], weight: 2 },
      { label: 'Being the person who grows revenue and wins deals', fields: ['sales', 'digital-marketing', 'fintech', 'real-estate'], weight: 2 },
    ],
  },
  {
    id: 'q5',
    question: 'Which risk feels most manageable to you?',
    options: [
      { label: 'Being wrong about a data conclusion', fields: ['data-science', 'data-analysis', 'quant-finance', 'ai-ml'], weight: 1 },
      { label: 'A project running late or over budget', fields: ['project-management', 'supply-chain', 'real-estate', 'specialized-engineering'], weight: 1 },
      { label: 'A piece of content or campaign that underperforms', fields: ['digital-marketing', 'writing', 'creative', 'edtech'], weight: 1 },
      { label: 'A system going down or getting breached', fields: ['software-engineering', 'cybersecurity', 'cloud-devops', 'fintech'], weight: 1 },
    ],
  },
  {
    id: 'q6',
    question: 'Where do you want to be in 5 years?',
    options: [
      { label: 'Leading a data or analytics function', fields: ['data-science', 'data-analysis', 'ai-ml', 'quant-finance'], weight: 3 },
      { label: 'Running operations, supply chain, or a business unit', fields: ['supply-chain', 'project-management', 'logistics', 'public-sector'], weight: 3 },
      { label: 'A technical expert or senior engineer', fields: ['software-engineering', 'cybersecurity', 'cloud-devops', 'specialized-engineering'], weight: 3 },
      { label: 'Building or growing a business — revenue, deals, growth', fields: ['sales', 'digital-marketing', 'fintech', 'real-estate'], weight: 3 },
    ],
  },
];

// Field affinity → track mapping
const FIELD_TO_TRACK: Record<string, { name: string; emoji: string; why: string }> = {
  'supply-chain':           { name: 'Supply Chain Analyst',        emoji: '🔗', why: 'You think systematically, manage risk, and care about execution — core supply chain instincts.' },
  'data-science':           { name: 'Data Scientist',              emoji: '📊', why: 'You want to find patterns in data and turn them into decisions — that\'s data science.' },
  'data-analysis':          { name: 'Data Analyst',                emoji: '📈', why: 'You want clear answers from data and to communicate them well — a natural analyst.' },
  'software-engineering':   { name: 'Software Engineer',           emoji: '💻', why: 'You want to build things that work and solve problems with code.' },
  'ai-ml':                  { name: 'AI/ML Engineer',              emoji: '🤖', why: 'You\'re drawn to cutting-edge problem-solving and automated intelligence.' },
  'cybersecurity':          { name: 'Cybersecurity Analyst',       emoji: '🛡️', why: 'You want to prevent problems before they happen — security mindset at its core.' },
  'cloud-devops':           { name: 'Cloud & DevOps Engineer',     emoji: '☁️', why: 'You want to build reliable, scalable infrastructure that keeps systems running.' },
  'quant-finance':          { name: 'Quantitative Analyst',        emoji: '⚡', why: 'You think in numbers, probabilities, and systematic edge.' },
  'project-management':     { name: 'Project Manager',             emoji: '📋', why: 'You want to lead teams, manage complexity, and deliver results on time.' },
  'sales':                  { name: 'Sales & Revenue',             emoji: '💰', why: 'You want to win deals, build relationships, and hit numbers.' },
  'digital-marketing':      { name: 'Digital Marketer',            emoji: '📣', why: 'You want to grow audiences, run campaigns, and drive measurable results.' },
  'product-design':         { name: 'Product Designer',            emoji: '🎨', why: 'You want to create experiences that feel simple and actually work.' },
  'fintech':                { name: 'Fintech & Blockchain',        emoji: '₿',  why: 'You want to build the future of finance and decentralised systems.' },
  'hr':                     { name: 'Human Resources',             emoji: '👥', why: 'You care about people, culture, and building great teams.' },
  'legal':                  { name: 'Legal & Compliance',          emoji: '⚖️', why: 'You think carefully, manage risk, and want to protect organisations.' },
  'writing':                { name: 'Writing & Content',           emoji: '✍️', why: 'You communicate clearly and want to create content that reaches people.' },
  'real-estate':            { name: 'Real Estate & Construction',  emoji: '🏗️', why: 'You want to work with tangible assets, deals, and long-term value.' },
  'logistics':              { name: 'Logistics & Trade',           emoji: '🚢', why: 'You want to manage the movement of goods across the world.' },
  'public-sector':          { name: 'Public Sector & NGO',         emoji: '🌍', why: 'You want your work to have social impact at scale.' },
  'specialized-engineering':{ name: 'Specialized Engineering',     emoji: '🔧', why: 'You want to design and build physical systems and infrastructure.' },
  'edtech':                 { name: 'Education Technology',        emoji: '📚', why: 'You want to teach, design learning, and improve how people grow.' },
  'computational-science':  { name: 'Computational Science',       emoji: '🔬', why: 'You want to use computing to solve scientific problems.' },
};

function scoreQuiz(answers: Record<string, number>): Array<{ trackId: string; name: string; emoji: string; why: string; score: number }> {
  const fieldScores: Record<string, number> = {};

  QUIZ_QUESTIONS.forEach(q => {
    const selectedIdx = answers[q.id];
    if (selectedIdx === undefined) return;
    const opt = q.options[selectedIdx];
    opt.fields.forEach(field => {
      fieldScores[field] = (fieldScores[field] ?? 0) + opt.weight;
    });
  });

  return Object.entries(fieldScores)
    .filter(([id]) => FIELD_TO_TRACK[id])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, score]) => ({
      trackId: id,
      score,
      ...FIELD_TO_TRACK[id],
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-screens
// ─────────────────────────────────────────────────────────────────────────────

type OnboardingStep =
  | 'disclaimer'
  | 'welcome'
  | 'crypto-start'
  | 'quiz'
  | 'quiz-results'
  | 'browse';

function WelcomeStep({ onKnow, onQuiz, onCryptoStart }: { onKnow: () => void; onQuiz: () => void; onCryptoStart: () => void }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeEmoji}>⚡</Text>
      <Text style={styles.welcomeTitle}>What do you want to learn?</Text>
      <Text style={styles.welcomeSub}>
        We have 28 career fields and 800+ roles. Let's find the right one for you.
      </Text>

      <TouchableOpacity style={[styles.bigBtn, { borderColor: '#f7931a', borderWidth: 2 }]} onPress={onCryptoStart} activeOpacity={0.85}>
        <Text style={styles.bigBtnEmoji}>₿</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bigBtnTitle, { color: '#f7931a' }]}>New to crypto</Text>
          <Text style={styles.bigBtnSub}>Start from zero → Bitcoin Bay island map</Text>
        </View>
        <Text style={[styles.bigBtnArrow, { color: '#f7931a' }]}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bigBtn} onPress={() => onKnow('operations')} activeOpacity={0.85}>
        <Text style={styles.bigBtnEmoji}>🎯</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bigBtnTitle}>I know what I want</Text>
          <Text style={styles.bigBtnSub}>Browse fields and pick a role directly</Text>
        </View>
        <Text style={styles.bigBtnArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.bigBtn, styles.bigBtnSecondary]} onPress={onQuiz} activeOpacity={0.85}>
        <Text style={styles.bigBtnEmoji}>🧠</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bigBtnTitle, { color: Colors.accent }]}>Help me figure it out</Text>
          <Text style={styles.bigBtnSub}>6 quick questions → we suggest your best match</Text>
        </View>
        <Text style={[styles.bigBtnArrow, { color: Colors.accent }]}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// CryptoStartStep — routes true beginners to Bitcoin Bay
// ─────────────────────────────────────────────────────────
function CryptoStartStep({ onStart, onBrowse }: { onStart: (trackId: string) => void; onBrowse: () => void }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeEmoji}>₿</Text>
      <Text style={styles.welcomeTitle}>Start from the beginning</Text>
      <Text style={styles.welcomeSub}>
        You'll start at Bitcoin Bay — 18 islands that take you from complete beginner to confident crypto user. No experience needed.
      </Text>

      <View style={{ backgroundColor: 'rgba(247,147,26,0.1)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ color: Colors.text, fontSize: 14, lineHeight: 22 }}>
          {`🏝️  18 islands, 270 levels\n₿  Bitcoin → Ethereum → Wallets → DeFi → NFTs\n🛡️  Security and scam protection built in\n🔓  Unlock skill tracks as you progress`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.bigBtn, { borderColor: '#f7931a', borderWidth: 2 }]}
        onPress={() => onStart('island-map')}
        activeOpacity={0.85}
      >
        <Text style={styles.bigBtnEmoji}>🚀</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bigBtnTitle, { color: '#f7931a' }]}>Start at Bitcoin Bay</Text>
          <Text style={styles.bigBtnSub}>Begin Island 1 — no experience needed</Text>
        </View>
        <Text style={[styles.bigBtnArrow, { color: '#f7931a' }]}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 16, padding: 12, alignItems: 'center' }} onPress={onBrowse}>
        <Text style={{ color: Colors.textMuted, fontSize: 14 }}>← Back to options</Text>
      </TouchableOpacity>
    </View>
  );
}

function QuizStep({
  questions,
  answers,
  onAnswer,
  onComplete,
}: {
  questions: QuizQuestion[];
  answers: Record<string, number>;
  onAnswer: (qId: string, idx: number) => void;
  onComplete: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const progress = (current + 1) / questions.length;

  const handleSelect = (idx: number) => {
    onAnswer(q.id, idx);
    if (isLast) {
      onComplete();
    } else {
      setCurrent(c => c + 1);
    }
  };

  return (
    <View style={styles.stepContainer}>
      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{current + 1} of {questions.length}</Text>

      <Text style={styles.quizQuestion}>{q.question}</Text>

      {q.options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.quizOption, answers[q.id] === i && styles.quizOptionSelected]}
          onPress={() => handleSelect(i)}
          activeOpacity={0.8}
        >
          <Text style={[styles.quizOptionText, answers[q.id] === i && styles.quizOptionTextSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function QuizResultsStep({
  results,
  onSelect,
  onBrowse,
}: {
  results: Array<{ trackId: string; name: string; emoji: string; why: string; score: number }>;
  onSelect: (trackId: string) => void;
  onBrowse: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.stepContainer}>
      <Text style={styles.resultsTitle}>Your top matches</Text>
      <Text style={styles.resultsSub}>
        Based on your answers, these careers fit how you think and what you want.
      </Text>

      {results.map((r, i) => (
        <TouchableOpacity
          key={r.trackId}
          style={[styles.resultCard, i === 0 && styles.resultCardTop]}
          onPress={() => onSelect(r.trackId)}
          activeOpacity={0.85}
        >
          {i === 0 && (
            <View style={styles.topMatchBadge}>
              <Text style={styles.topMatchText}>⚡ BEST MATCH</Text>
            </View>
          )}
          <Text style={styles.resultEmoji}>{r.emoji}</Text>
          <Text style={styles.resultName}>{r.name}</Text>
          <Text style={styles.resultWhy}>{r.why}</Text>
          <Text style={styles.resultCta}>Start this track →</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.browseLink} onPress={onBrowse}>
        <Text style={styles.browseLinkText}>Browse all fields instead</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onComplete: (selectedTrackId: string) => void;
  onBrowse: (initialFilter?: string) => void;
}

export default function OnboardingScreen({ onComplete, onBrowse }: Props) {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [step, setStep] = useState<OnboardingStep>('disclaimer');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<ReturnType<typeof scoreQuiz>>([]);

  const handleAnswer = (qId: string, idx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const handleQuizComplete = () => {
    const scored = scoreQuiz(answers);
    setResults(scored);
    setStep('quiz-results');
  };

  // Disclaimer step
  if (step === -1) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.disclaimerBody}>
          <Text style={styles.disclaimerEmoji}>⚡</Text>
          <Text style={styles.disclaimerTitle}>Welcome to Sifter Skill_Up</Text>
          <Text style={styles.disclaimerSub}>
            We're here to help you build real career skills — from foundation to senior level.
          </Text>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerCardTitle}>But mastery isn't built in one place.</Text>
            <Text style={styles.disclaimerCardBody}>We encourage you to:</Text>
            {[
              '📚 Cross-reference with books and other learning materials',
              '🏗️ Build real projects outside the app',
              '👥 Join communities and find mentors in your field',
              '🌍 Practice in the real world — not just simulations',
            ].map((item, i) => (
              <Text key={i} style={styles.disclaimerBullet}>{item}</Text>
            ))}
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerCardTitle}>What we promise:</Text>
            <Text style={styles.disclaimerCardBody}>Real, verifiable skills. A portfolio that proves what you can do. Honest, high-quality lessons built against industry standards.</Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerCardTitle}>What we don't promise:</Text>
            <Text style={styles.disclaimerCardBody}>A job. Completing a path does not guarantee employment. Your outcomes depend on your effort, your network, and market conditions we can't control.</Text>
          </View>

          <TouchableOpacity style={styles.acceptBtn} onPress={handleDisclaimerAccept}>
            <Text style={styles.acceptBtnText}>I understand — Let's build skills</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.learnMoreBtn} onPress={() => setShowLearnMore(true)}>
            <Text style={styles.learnMoreBtnText}>Read full terms and resources →</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showLearnMore} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLearnMore(false)}>
          <LearnMoreScreen onClose={() => setShowLearnMore(false)} />
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {step === 'welcome' && (
        <WelcomeStep
          onKnow={onBrowse}
          onQuiz={() => setStep('quiz')}
          onCryptoStart={() => setStep('crypto-start')}
        />
      )}
      {step === 'crypto-start' && (
        <CryptoStartStep
          onStart={onComplete}
          onBrowse={() => setStep('welcome')}
        />
      )}
      {step === 'quiz' && (
        <QuizStep
          questions={QUIZ_QUESTIONS}
          answers={answers}
          onAnswer={handleAnswer}
          onComplete={handleQuizComplete}
        />
      )}
      {step === 'quiz-results' && (
        <QuizResultsStep
          results={results}
          onSelect={onComplete}
          onBrowse={onBrowse}
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
  stepContainer: { flex: 1, padding: Spacing.xl, paddingTop: Spacing.xxxl },

  welcomeEmoji: { fontSize: 48, textAlign: 'center', marginBottom: Spacing.lg },
  welcomeTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  welcomeSub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xxxl },

  bigBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    ...Shadow.md,
  },
  bigBtnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.accent },
  bigBtnEmoji: { fontSize: 28 },
  bigBtnTitle: { fontSize: FontSize.md, fontWeight: '800', color: '#fff', marginBottom: 2 },
  bigBtnSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  bigBtnArrow: { fontSize: 20, color: '#fff', fontWeight: '700' },

  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, marginBottom: Spacing.sm },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right', marginBottom: Spacing.xl },

  quizQuestion: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, lineHeight: 26, marginBottom: Spacing.xl },
  quizOption: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.lg, marginBottom: Spacing.sm, backgroundColor: '#fff',
  },
  quizOptionSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  quizOptionText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  quizOptionTextSelected: { color: Colors.accent, fontWeight: '700' },

  resultsTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  resultsSub: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.xl },

  resultCard: {
    backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.xl,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  resultCardTop: { borderColor: Colors.accent, borderWidth: 2 },
  topMatchBadge: {
    backgroundColor: Colors.accent, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: Spacing.sm,
  },
  topMatchText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  resultEmoji: { fontSize: 36, marginBottom: Spacing.sm },
  resultName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  resultWhy: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.md },
  resultCta: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent },

  browseLink: { padding: Spacing.lg, alignItems: 'center' },
  browseLinkText: { fontSize: FontSize.sm, color: Colors.textSoft, textDecorationLine: 'underline' },

  // Disclaimer
  disclaimerBody: { padding: Spacing.xl, alignItems: 'center', paddingBottom: 60 },
  disclaimerEmoji: { fontSize: 56, marginBottom: Spacing.lg, marginTop: Spacing.xl },
  disclaimerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  disclaimerSub: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  disclaimerCard: { backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.md, width: '100%', borderWidth: 1, borderColor: Colors.border },
  disclaimerCardTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  disclaimerCardBody: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20 },
  disclaimerBullet: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 28, paddingLeft: 4 },
  acceptBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, width: '100%', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  acceptBtnText: { color: '#fff', fontWeight: '900', fontSize: FontSize.md },
  learnMoreLinkBtn: { padding: Spacing.md, alignItems: 'center' },
  learnMoreLinkText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
});
