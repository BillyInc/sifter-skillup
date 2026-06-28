/**
 * Sifter LevelUp - Onboarding Screen
 */

import React, { useMemo, useState } from 'react';
import {
  View, Modal, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LearnMoreScreen from './LearnMoreScreen';
import {
  Colors, Spacing, Radius, FontSize, Shadow, FontWeight, useTheme, webContainer,
} from '../theme';
import { SifterButton, SifterCard } from '../components/ui';

interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; fields: string[]; weight: number }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'When something goes wrong at work, what do you instinctively do first?',
    options: [
      { label: 'Pull the data and find out what happened', fields: ['data-science', 'data-analysis', 'supply-chain', 'quant-finance'], weight: 2 },
      { label: 'Call the people involved and understand the situation', fields: ['hr', 'sales', 'project-management', 'supply-chain'], weight: 2 },
      { label: 'Write down what I know and what I need to find out', fields: ['legal', 'writing', 'project-management', 'public-sector'], weight: 2 },
      { label: 'Start fixing it immediately and figure it out as I go', fields: ['software-engineering', 'cloud-devops', 'cybersecurity', 'fintech'], weight: 2 },
    ],
  },
  {
    id: 'q2',
    question: 'What kind of result makes you feel most satisfied?',
    options: [
      { label: 'A dashboard or report that shows exactly what is happening', fields: ['data-analysis', 'data-science', 'supply-chain', 'quant-finance'], weight: 2 },
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
      { label: 'Being the person who always has the answer backed by data', fields: ['data-science', 'data-analysis', 'quant-finance', 'ai-ml'], weight: 2 },
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
      { label: 'Building or growing a business through revenue and deals', fields: ['sales', 'digital-marketing', 'fintech', 'real-estate'], weight: 3 },
    ],
  },
];

const FIELD_TO_TRACK: Record<string, { name: string; emoji: string; why: string }> = {
  'supply-chain': { name: 'Supply Chain Analyst', emoji: '🔗', why: 'You think systematically, manage risk, and care about execution.' },
  'data-science': { name: 'Data Scientist', emoji: '📊', why: 'You are drawn to finding patterns and turning them into decisions.' },
  'data-analysis': { name: 'Data Analyst', emoji: '📈', why: 'You want clear answers from data and a clean way to communicate them.' },
  'software-engineering': { name: 'Software Engineer', emoji: '💻', why: 'You want to build things that work and solve problems with code.' },
  'ai-ml': { name: 'AI/ML Engineer', emoji: '🤖', why: 'You are drawn to technical systems and automated intelligence.' },
  'cybersecurity': { name: 'Cybersecurity Analyst', emoji: '🛡️', why: 'You naturally think about prevention, risk, and protection.' },
  'cloud-devops': { name: 'Cloud & DevOps Engineer', emoji: '☁️', why: 'You like reliable systems, infrastructure, and operational smoothness.' },
  'quant-finance': { name: 'Quantitative Analyst', emoji: '⚡', why: 'You think in numbers, probabilities, and systematic edge.' },
  'project-management': { name: 'Project Manager', emoji: '📋', why: 'You want to align people, deadlines, and delivery.' },
  sales: { name: 'Sales & Revenue', emoji: '💰', why: 'You are energized by targets, relationships, and closing outcomes.' },
  'digital-marketing': { name: 'Digital Marketer', emoji: '📣', why: 'You want to grow reach, campaigns, and measurable traction.' },
  'product-design': { name: 'Product Designer', emoji: '🎨', why: 'You care about creating experiences that feel simple and useful.' },
  fintech: { name: 'Fintech & Blockchain', emoji: '₿', why: 'You are interested in financial systems and modern digital rails.' },
  hr: { name: 'Human Resources', emoji: '👥', why: 'You care about people, culture, and healthy teams.' },
  legal: { name: 'Legal & Compliance', emoji: '⚖️', why: 'You think carefully, manage risk, and value clarity.' },
  writing: { name: 'Writing & Content', emoji: '✍️', why: 'You communicate clearly and want ideas to land well.' },
  'real-estate': { name: 'Real Estate & Construction', emoji: '🏗️', why: 'You are interested in tangible assets, deals, and long-term value.' },
  logistics: { name: 'Logistics & Trade', emoji: '🚢', why: 'You want to manage the movement of goods and systems.' },
  'public-sector': { name: 'Public Sector & NGO', emoji: '🌍', why: 'You want your work to carry broad social impact.' },
  'specialized-engineering': { name: 'Specialized Engineering', emoji: '🔧', why: 'You want to design and build rigorous technical systems.' },
  edtech: { name: 'Education Technology', emoji: '📚', why: 'You want to improve how people learn and grow.' },
  'computational-science': { name: 'Computational Science', emoji: '🔬', why: 'You want to use computing to solve scientific problems.' },
};

function scoreQuiz(answers: Record<string, number>) {
  const fieldScores: Record<string, number> = {};

  QUIZ_QUESTIONS.forEach((question) => {
    const selected = answers[question.id];
    if (selected === undefined) {
      return;
    }

    question.options[selected].fields.forEach((field) => {
      fieldScores[field] = (fieldScores[field] ?? 0) + question.options[selected].weight;
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

type OnboardingStep = 'disclaimer' | 'welcome' | 'crypto-start' | 'quiz' | 'quiz-results';

function RouteCard({
  label,
  title,
  sub,
  accent,
  emoji,
  onPress,
}: {
  label: string;
  title: string;
  sub: string;
  accent: string;
  emoji: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.routeCard, { backgroundColor: colors.card, borderColor: accent }, Shadow.sm]}
    >
      <Text style={styles.routeEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.routeLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.routeTitle, { color: accent === colors.border ? colors.text : accent }]}>{title}</Text>
        <Text style={[styles.routeSub, { color: colors.textSoft }]}>{sub}</Text>
      </View>
      <Text style={[styles.routeArrow, { color: accent === colors.border ? colors.textMuted : accent }]}>→</Text>
    </TouchableOpacity>
  );
}

interface Props {
  onComplete: (selectedTrackId: string) => void;
  onBrowse: (initialFilter?: string) => void;
}

export default function OnboardingScreen({ onComplete, onBrowse }: Props) {
  const { colors } = useTheme();
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [step, setStep] = useState<OnboardingStep>('disclaimer');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const results = useMemo(() => scoreQuiz(answers), [answers]);
  const currentIndex = Object.keys(answers).length;
  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const answerQuestion = (optionIndex: number) => {
    if (!currentQuestion) {
      return;
    }

    const nextAnswers = { ...answers, [currentQuestion.id]: optionIndex };
    setAnswers(nextAnswers);
    if (currentIndex === QUIZ_QUESTIONS.length - 1) {
      setStep('quiz-results');
    }
  };

  if (step === 'disclaimer') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.scrollBody}>
          <SifterCard style={[styles.disclaimerHero, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>WELCOME</Text>
            <Text style={styles.heroEmoji}>⚡</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Build real skills, not just streaks</Text>
            <Text style={[styles.heroSub, { color: colors.textSoft }]}>
              Sifter gives you a structured path, but strong outcomes still come from practice outside the app too.
            </Text>
          </SifterCard>

          {[
            {
              title: 'What we encourage',
              body: [
                'Cross-reference with books and other learning materials',
                'Build real projects outside the app',
                'Join communities and find mentors in your field',
                'Practise in the real world, not only simulations',
              ],
            },
            {
              title: 'What we promise',
              body: ['Real, verifiable skills. An artifact trail that shows what you can do. Honest lessons built against industry standards.'],
            },
            {
              title: "What we don't promise",
              body: ["A job. Completing a path does not guarantee employment, because effort, networking, and market conditions still matter."],
            },
          ].map((section) => (
            <SifterCard key={section.title} style={[styles.disclaimerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{section.title}</Text>
              {section.body.map((line) => (
                <Text key={line} style={[styles.cardBody, { color: colors.textSoft }]}>• {line}</Text>
              ))}
            </SifterCard>
          ))}

          <SifterButton label="I understand, continue" onPress={() => setStep('welcome')} />
          <TouchableOpacity style={styles.learnMoreButton} onPress={() => setShowLearnMore(true)}>
            <Text style={[styles.learnMoreText, { color: colors.accent }]}>Read full terms and resources</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showLearnMore} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLearnMore(false)}>
          <LearnMoreScreen onClose={() => setShowLearnMore(false)} />
        </Modal>
      </SafeAreaView>
    );
  }

  if (step === 'welcome') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.scrollBody}>
          <SifterCard style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>STARTING POINT</Text>
            <Text style={styles.heroEmoji}>🧭</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Choose how you want to start</Text>
            <Text style={[styles.heroSub, { color: colors.textSoft }]}>
              Go straight to browsing, start with beginner crypto, or let the platform suggest a match.
            </Text>
          </SifterCard>

          <RouteCard
            label="BEGINNER CRYPTO"
            title="New to crypto"
            sub="Start from zero with the Bitcoin Bay island path."
            accent="#f7931a"
            emoji="₿"
            onPress={() => setStep('crypto-start')}
          />
          <RouteCard
            label="DIRECT PICK"
            title="I know what I want"
            sub="Browse fields and select a role without taking the quiz."
            accent={colors.border}
            emoji="🎯"
            onPress={() => onBrowse('operations')}
          />
          <RouteCard
            label="GUIDED MATCH"
            title="Help me figure it out"
            sub="Answer 6 quick questions and get your best-fit tracks."
            accent={colors.accent}
            emoji="🧠"
            onPress={() => setStep('quiz')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'crypto-start') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.scrollBody}>
          <SifterCard style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>BEGINNER CRYPTO</Text>
            <Text style={styles.heroEmoji}>₿</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Start from the beginning</Text>
            <Text style={[styles.heroSub, { color: colors.textSoft }]}>
              Bitcoin Bay is the structured beginner route from fundamentals through core crypto usage.
            </Text>
          </SifterCard>

          <View style={[styles.summaryPanel, { backgroundColor: 'rgba(247,147,26,0.08)', borderColor: 'rgba(247,147,26,0.18)' }]}>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              {`18 islands, 270 levels\nBitcoin -> Ethereum -> Wallets -> DeFi -> NFTs\nSecurity and scam protection built in\nUnlock advanced tracks as you progress`}
            </Text>
          </View>

          <RouteCard
            label="RECOMMENDED START"
            title="Start at Bitcoin Bay"
            sub="Begin with Island 1. No previous experience required."
            accent="#f7931a"
            emoji="🚀"
            onPress={() => onComplete('island-map')}
          />

          <TouchableOpacity style={styles.backLink} onPress={() => setStep('welcome')}>
            <Text style={[styles.backLinkText, { color: colors.textMuted }]}>← Back to options</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'quiz' && currentQuestion) {
    const progress = (currentIndex + 1) / QUIZ_QUESTIONS.length;

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <ScrollView contentContainerStyle={styles.scrollBody}>
          <SifterCard style={[styles.quizHeaderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>GUIDED MATCH</Text>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}</Text>
            <Text style={[styles.quizQuestion, { color: colors.text }]}>{currentQuestion.question}</Text>
          </SifterCard>

          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => answerQuestion(index)}
              activeOpacity={0.88}
              style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <SifterCard style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>TOP MATCHES</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Your best-fit paths</Text>
          <Text style={[styles.heroSub, { color: colors.textSoft }]}>
            These recommendations reflect how you think, what you enjoy, and where you seem to want to grow.
          </Text>
        </SifterCard>

        {results.map((result, index) => (
          <TouchableOpacity
            key={result.trackId}
            onPress={() => onComplete(result.trackId)}
            activeOpacity={0.88}
            style={[
              styles.resultCard,
              {
                backgroundColor: colors.card,
                borderColor: index === 0 ? colors.accent : colors.border,
              },
              Shadow.sm,
            ]}
          >
            {index === 0 ? (
              <View style={[styles.bestBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.bestBadgeText}>BEST MATCH</Text>
              </View>
            ) : null}
            <Text style={styles.resultEmoji}>{result.emoji}</Text>
            <Text style={[styles.resultName, { color: colors.text }]}>{result.name}</Text>
            <Text style={[styles.resultWhy, { color: colors.textSoft }]}>{result.why}</Text>
            <Text style={[styles.resultAction, { color: colors.accent }]}>Start this path →</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.backLink} onPress={() => onBrowse()}>
          <Text style={[styles.backLinkText, { color: colors.textMuted }]}>Browse all fields instead</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scrollBody: { ...webContainer, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  eyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, textAlign: 'center', marginBottom: Spacing.xs },
  heroCard: { marginBottom: Spacing.md },
  disclaimerHero: { marginBottom: Spacing.md },
  heroEmoji: { fontSize: 18, textAlign: 'center', marginBottom: Spacing.sm },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black, textAlign: 'center', marginBottom: Spacing.sm },
  heroSub: { fontSize: FontSize.sm, lineHeight: 20, textAlign: 'center' },
  disclaimerCard: { marginBottom: Spacing.md },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.heavy, marginBottom: Spacing.sm },
  cardBody: { fontSize: FontSize.sm, lineHeight: 20 },
  learnMoreButton: { paddingTop: Spacing.md, alignItems: 'center' },
  learnMoreText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  routeEmoji: { fontSize: 18 },
  routeLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.8, marginBottom: 2 },
  routeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black, marginBottom: 2 },
  routeSub: { fontSize: FontSize.sm, lineHeight: 19 },
  routeArrow: { fontSize: 20, fontWeight: FontWeight.heavy },
  summaryPanel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryText: { fontSize: FontSize.sm, lineHeight: 22 },
  backLink: { paddingVertical: Spacing.md, alignItems: 'center' },
  backLinkText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  quizHeaderCard: { marginBottom: Spacing.md },
  progressTrack: { height: 6, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', borderRadius: Radius.full },
  progressText: { fontSize: FontSize.xs, marginBottom: Spacing.md, textAlign: 'right' },
  quizQuestion: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy, lineHeight: 22 },
  optionCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm },
  optionText: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.medium },
  resultCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm },
  bestBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  bestBadgeText: { color: '#fff', fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  resultEmoji: { fontSize: 18, marginBottom: Spacing.sm },
  resultName: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: Spacing.sm },
  resultWhy: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.sm },
  resultAction: { fontSize: FontSize.sm, fontWeight: FontWeight.heavy },
});
