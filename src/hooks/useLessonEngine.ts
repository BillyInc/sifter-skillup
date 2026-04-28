import { useState, useCallback, useRef } from 'react';
import type { Level } from '../data/levels';
import {
  getAuthoredLessonPlain,
  getAuthoredLessonSummary,
  getAuthoredLessonTopic,
  isAuthoredLesson,
  truncateAuthoredLessonText,
  type AuthoredLesson,
} from '../data/tracks/starknet_ecosystem/authoredLesson';

// ── Starknet lesson adapter ────────────────────────────────────
// Starknet lab lessons (from starknetLessonRegistry) have a different shape
// than classic Level objects — they carry `title`, `explanation`,
// `keyTakeaway`, `guidedPractice` (MCQs), `lessonSimulations`, and
// `interactiveSimulator`. We build a Question[] directly from that richer
// structure so we preserve the authored practice questions instead of
// regenerating them from a stripped-down Level summary.
/*
interface AuthoredLessonExample {
  contextTag?: string;
  context?: string;
  scenario: string;
  outcome: string;
}

interface AuthoredLesson {
  id?: string;
  title?: string;
  topic?: string;
  explanation?: string;
  keyTakeaway?: string;
  fact?: string;
  plain?: string;
  simulatorLesson?: string;
  guidedPractice?: Array<{
    question: string;
    options?: string[];
    correct?: number;
    explanation?: string;
    hint?: string;
  }>;
  interactiveSimulator?: { componentId?: string; title?: string };
  lessonSimulations?: Array<{
    type: string;
    scenario: string;
    scoringCriteria: string[];
  }>;
  examples?: AuthoredLessonExample[];
}

function truncatePlain(s: string, max: number): string {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + '…';
}

*/
function isPrimaryInteractiveSimulationType(type?: string): boolean {
  if (!type) return false;
  return (
    type.startsWith('starkzap-')
    || type.startsWith('sandbox-')
    || type.startsWith('opp-')
    || type === 'forum'
    || type === 'aggregate'
  );
}

function buildAuthoredLessonQuestions(lesson: AuthoredLesson): Question[] {
  const questions: Question[] = [];
  const topic = getAuthoredLessonTopic(lesson);
  const explanation = (lesson.explanation ?? '').trim();
  const fact = getAuthoredLessonSummary(lesson);
  const plain = getAuthoredLessonPlain(lesson);
  const lessonSimulations = (lesson.lessonSimulations ?? []).filter(
    (sim) => sim?.type && sim?.scenario && Array.isArray(sim.scoringCriteria) && sim.scoringCriteria.length > 0,
  );
  const primaryLessonSimulations = lessonSimulations.filter((sim) => isPrimaryInteractiveSimulationType(sim.type));
  const secondaryLessonSimulations = lessonSimulations.filter((sim) => !isPrimaryInteractiveSimulationType(sim.type));

  // 1. Concept card — from the lesson explanation / key takeaway.
  questions.push({
    type: 'concept_card',
    topic,
    tier: 'intermediate',
    fact,
    plain,
    lessonBody: explanation || undefined,
    keyTakeaway: lesson.keyTakeaway ?? fact,
    examples: lesson.examples ?? [],
  });

  // 2. Interactive simulator — if the lesson has one.
  const simId = lesson.interactiveSimulator?.componentId ?? lesson.simulatorLesson;
  if (simId) {
    questions.push({ type: 'simulator', simulatorType: simId });
  } else if (primaryLessonSimulations.length > 0) {
    const [primarySim] = primaryLessonSimulations;
    questions.push({
      type: 'simulator',
      simulatorType: primarySim.type,
      scenario: primarySim.scenario,
      scoringCriteria: primarySim.scoringCriteria,
    });
  }

  // 3. Guided-practice MCQs — authored by content team.
  for (const gp of lesson.guidedPractice ?? []) {
    const options = gp.options ?? [];
    if (options.length < 2 || typeof gp.correct !== 'number') continue;

    // Guided-practice options start with "A. ", "B. " prefixes — strip them
    // so the MCQ renderer (which already adds A/B/C/D) doesn't double up.
    const cleaned = options.map((o) => o.replace(/^\s*[A-D][.)]\s*/, '').trim());

    questions.push({
      type: 'mcq',
      prompt: gp.question,
      context: null,
      options: cleaned.map((text, idx) => ({ text, correct: idx === gp.correct })),
      correct: gp.correct,
      explanation: gp.explanation,
    });
  }

  // 4. Authored lesson simulations - keep tool practice ahead of judgment-only follow-ups.
  const deferredPrimarySimulations = simId
    ? primaryLessonSimulations
    : primaryLessonSimulations.slice(1);
  for (const sim of [...deferredPrimarySimulations, ...secondaryLessonSimulations]) {
    questions.push({
      type: 'simulator',
      simulatorType: sim.type,
      scenario: sim.scenario,
      scoringCriteria: sim.scoringCriteria,
    });
  }

  // If the lesson had no guided-practice entries, fall back to a single
  // concept-check true/false so the engine still has something to advance on.
  const hasInteractive = questions.some((q) => q.type !== 'concept_card');
  if (!hasInteractive && fact.length > 20) {
    questions.push({
      type: 'true_false',
      prompt: truncateAuthoredLessonText(fact, 180),
      correct: true,
      explanation: fact,
    });
  }

  return questions;
}

// ── Question types ──────────────────────────────────────────
export type QuestionType =
  | 'concept_card'
  | 'mcq'
  | 'true_false'
  | 'order'
  | 'match_pairs'
  | 'multi_select'
  | 'simulator'
  | 'fill_blank';

export interface Option { text: string; correct: boolean; }

export interface Question {
  type: QuestionType;
  // concept_card
  topic?: string; tier?: string; fact?: string; plain?: string; glossaryWord?: string;
  lessonBody?: string;
  keyTakeaway?: string;
  examples?: AuthoredLessonExample[];
  // mcq / tf / multi_select
  prompt?: string; context?: string | null;
  options?: Option[]; correct?: number | boolean;
  explanation?: string;
  // order
  items?: string[]; answer?: string[];
  // match_pairs
  pairs?: Array<{ term: string; def: string }>;
  // simulator
  simulatorType?: string;
  scenario?: string;
  scoringCriteria?: string[];
  // fill_blank
  sentence?: string; blank?: string; distractors?: string[];
}

export interface LessonState {
  questions:   Question[];
  qIndex:      number;
  hearts:      number;
  xp:          number;
  combo:       number;
  wrongCount:  number;
  answered:    boolean;
  lastCorrect: boolean | null;
  finished:    boolean;
  failed:      boolean;
  stars:       number;
}

// ── Helpers ─────────────────────────────────────────────────
const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const trunc = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + '…' : s;

// Extract key-value pairs like "X = Y" or "X → Y" from a fact string
function extractPairs(fact: string): Array<{ term: string; def: string }> | null {
  // Try to find colon-separated items in parentheses: "(term: definition)"
  const parenPattern = /\(([^)]+):\s*([^)]+)\)/g;
  const pairs: Array<{ term: string; def: string }> = [];
  let m;
  while ((m = parenPattern.exec(fact)) !== null) {
    pairs.push({ term: m[1].trim(), def: trunc(m[2].trim(), 50) });
  }
  if (pairs.length >= 3) return pairs.slice(0, 4);

  // Try numbered items: "(1) term — definition"
  const numberedPattern = /\(\d\)\s*([^—\n]+?)(?:\s*—\s*([^.(]+))?(?:\s*\.|$)/g;
  const numbered: Array<{ term: string; def: string }> = [];
  while ((m = numberedPattern.exec(fact)) !== null && numbered.length < 4) {
    if (m[1] && m[2]) numbered.push({ term: trunc(m[1].trim(), 35), def: trunc(m[2].trim(), 50) });
  }
  if (numbered.length >= 3) return numbered;

  return null;
}

// Extract key terms from a fact string for fill-in-the-blank
function extractKeyTerm(fact: string, topic: string): { sentence: string; blank: string; distractors: string[] } | null {
  const words = fact.split(/\s+/);
  if (words.length < 10) return null;

  // Find a meaningful number or key term to blank out
  const numMatch = fact.match(/(\d[\d,]*(?:\.\d+)?(?:%|x|×|M|B|K)?)/);
  if (numMatch && numMatch[1].length >= 2) {
    const blank = numMatch[1];
    const sentence = fact.replace(blank, '___').slice(0, 120);
    const distractors = [
      blank.includes('%') ? String(parseFloat(blank) * 2) + '%' : String(parseInt(blank) * 2),
      blank.includes('%') ? String(Math.round(parseFloat(blank) / 2)) + '%' : String(Math.round(parseInt(blank) / 2)),
      blank.includes('%') ? '100%' : '1,000',
    ].filter(d => d !== blank).slice(0, 3);
    return { sentence, blank, distractors };
  }
  return null;
}

// ── Question builders ────────────────────────────────────────

function buildMCQ(level: Level): Question {
  const sentences = level.fact.split('.').map(s => s.trim()).filter(s => s.length > 20);
  const base = sentences[0] || level.fact;

  const wrongs = [
    `${level.topic} requires government approval before use.`,
    `${level.topic} is controlled by central banks.`,
    `${level.topic} transactions are reversible within 24 hours.`,
    'This was invented by the US Federal Reserve in 2019.',
  ];

  const options = shuffle([
    { text: trunc(base, 90), correct: true },
    { text: wrongs[0], correct: false },
    { text: wrongs[1], correct: false },
    { text: wrongs[2], correct: false },
  ]);

  return {
    type: 'mcq',
    prompt: `Which statement about ${level.topic} is true?`,
    context: null,
    options,
    correct: options.findIndex(o => o.correct),
    explanation: level.plain,
  };
}

function buildTrueFalse(level: Level): Question {
  const sentences = level.fact.split('. ').filter(s => s.length > 25);
  const stmt = sentences[Math.floor(Math.random() * sentences.length)] || level.fact;
  const isTrue = Math.random() > 0.4;

  const falseVersions = [
    stmt.replace(/decentralis/i, 'centralised')
        .replace(/no bank/i, 'requires a bank')
        .replace(/fixed supply/i, 'unlimited supply')
        .replace(/free/i, 'expensive'),
    `${level.topic} was created by the IMF in 2015.`,
  ];
  const falseStmt = falseVersions.find(f => f !== stmt) || falseVersions[1];

  return {
    type: 'true_false',
    prompt: isTrue ? trunc(stmt, 110) : trunc(falseStmt, 110),
    correct: isTrue,
    explanation: `${isTrue ? '✓ Correct! ' : '✗ Not quite. '}${trunc(level.fact, 100)}`,
  };
}

function buildMatchPairs(level: Level): Question | null {
  const pairs = extractPairs(level.fact);
  if (!pairs) return null;
  return {
    type: 'match_pairs',
    prompt: 'Match each term to its correct definition:',
    context: level.topic,
    pairs: pairs.slice(0, 4),
    explanation: level.plain || level.fact,
  };
}

function buildFillBlank(level: Level): Question | null {
  const result = extractKeyTerm(level.fact, level.topic);
  if (!result) return null;
  return {
    type: 'fill_blank',
    prompt: 'Fill in the blank:',
    context: level.topic,
    sentence: result.sentence,
    blank: result.blank,
    distractors: result.distractors,
    explanation: level.plain || level.fact,
  };
}

function buildLesson(level: Level): Question[] {
  const questions: Question[] = [];

  // 1. Concept card — always first
  questions.push({
    type: 'concept_card',
    topic:        level.topic,
    tier:         level.tier,
    fact:         level.fact,
    plain:        level.plain,
    glossaryWord: level.glossaryWord,
  });

  // 2. Simulator — placed right after concept card
  if (level.simulatorLesson) {
    questions.push({ type: 'simulator', simulatorType: level.simulatorLesson });
  }

  // 3. Mechanic-specific interactive question
  switch (level.mechanic) {

    // ── match3: matching/pairing quiz ─────────────────────────
    case 'match3': {
      const matchQ = buildMatchPairs(level);
      if (matchQ) {
        questions.push(matchQ);
        break;
      }
      // Fallback: MCQ
      questions.push(buildMCQ(level));
      break;
    }

    // ── memory: key-term recall ────────────────────────────────
    case 'memory': {
      const fillQ = buildFillBlank(level);
      if (fillQ) {
        questions.push(fillQ);
        break;
      }
      // Fallback: True/False with an extra MCQ
      questions.push(buildMCQ(level));
      break;
    }

    // ── governance: multi-select / process ordering ────────────
    case 'governance': {
      // Look for numbered steps in the fact
      const steps = level.fact.match(/\(\d\)\s*[^(]+/g);
      if (steps && steps.length >= 3) {
        const clean = steps.map(s => s.replace(/^\(\d\)\s*/, '').trim().slice(0, 60));
        questions.push({
          type: 'order',
          prompt: 'Put these governance steps in the correct order:',
          context: level.topic,
          items: shuffle([...clean]),
          answer: clean,
        });
        break;
      }
      // Multi-select: identify correct governance attributes
      const govOptions = [
        { text: 'Token holders vote on proposals', correct: true },
        { text: 'Smart contracts auto-execute approved proposals', correct: true },
        { text: 'A CEO makes final decisions', correct: false },
        { text: 'Votes are private and anonymous', correct: false },
      ];
      questions.push({
        type: 'multi_select',
        prompt: `Which of these describe how ${level.topic} works? Select all that apply.`,
        context: level.topic,
        options: shuffle(govOptions),
        explanation: level.plain || level.fact,
      });
      break;
    }

    // ── trait: attribute identification ────────────────────────
    case 'trait': {
      // Build MCQ from plain/fact that asks about a specific attribute
      const traitFact = level.plain || level.fact;
      const sentences = traitFact.split('.').filter(s => s.trim().length > 15);
      const base = sentences[0] || traitFact;
      const traitOptions = shuffle([
        { text: trunc(base, 85), correct: true },
        { text: `${level.topic} traits are decided by miners.`, correct: false },
        { text: `${level.topic} attributes are randomly assigned at purchase.`, correct: false },
        { text: `All ${level.topic} items share identical traits.`, correct: false },
      ]);
      questions.push({
        type: 'mcq',
        prompt: `What determines rarity or attributes in ${level.topic}?`,
        context: level.topic,
        options: traitOptions,
        correct: traitOptions.findIndex(o => o.correct),
        explanation: level.fact,
      });
      break;
    }

    // ── liquidation: risk calculation / scenario ───────────────
    case 'liquidation': {
      questions.push({
        type: 'multi_select',
        prompt: 'Which factors increase liquidation risk? Select all that apply.',
        context: level.topic,
        options: shuffle([
          { text: 'Using high leverage (10× or more)', correct: true },
          { text: 'Borrowing near the maximum LTV ratio', correct: true },
          { text: 'Volatile collateral (e.g. ETH not stablecoin)', correct: true },
          { text: 'Using a stablecoin as collateral', correct: false },
          { text: 'Keeping health factor above 2.0', correct: false },
        ]),
        explanation: level.plain || level.fact,
      });
      break;
    }

    // ── chain: step ordering ───────────────────────────────────
    case 'chain': {
      const steps = level.fact.match(/\(\d\)\s*[^(]+/g);
      if (steps && steps.length >= 3) {
        const clean = steps.map(s => s.replace(/^\(\d\)\s*/, '').trim().slice(0, 60));
        questions.push({
          type: 'order',
          prompt: 'Put these steps in the correct order:',
          context: level.topic,
          items: shuffle([...clean]),
          answer: clean,
        });
        break;
      }
      questions.push(buildMCQ(level));
      break;
    }

    // ── rugpull: red flag identification ──────────────────────
    case 'rugpull': {
      const redFlags = [
        'Mint authority is NOT revoked',
        'Liquidity pool is unlocked',
        'Dev wallet holds >30% of supply',
        'Contract is not verified on-chain',
      ];
      const safeFlags = [
        'Smart contract is open source and audited',
        'Liquidity is locked for 1+ year',
        'Mint authority has been revoked',
      ];
      questions.push({
        type: 'multi_select',
        prompt: 'Which of these are red flags for a rug pull? Select all that apply.',
        context: level.topic,
        options: shuffle([
          ...redFlags.slice(0, 2).map(t => ({ text: t, correct: true })),
          ...safeFlags.slice(0, 2).map(t => ({ text: t, correct: false })),
        ]),
        correct: undefined,
        explanation: level.plain,
      });
      break;
    }

    // ── simulator / boss: entire level is a simulator — no extra questions ──
    case 'simulator':
    case 'boss':
      // simulatorLesson already pushed above; nothing else to add
      break;

    default:
      questions.push(buildMCQ(level));
  }

  // 4. True/False — always included
  if (level.fact.length > 30) {
    questions.push(buildTrueFalse(level));
  }

  // 5. Harder MCQ for boss/pro levels
  if (level.isBoss || level.tier === 'pro') {
    const harderOptions = shuffle([
      { text: trunc(level.plain || level.fact, 90), correct: true },
      { text: `${level.topic} is only for institutional investors.`, correct: false },
      { text: `${level.topic} has no real-world use cases yet.`, correct: false },
      { text: `${level.topic} requires a centralised authority to function.`, correct: false },
    ]);

    questions.push({
      type: 'mcq',
      prompt: `Best description of ${level.topic}:`,
      context: null,
      options: harderOptions,
      correct: harderOptions.findIndex(o => o.correct),
      explanation: level.fact,
    });
  }

  return questions;
}

// ── Hook ─────────────────────────────────────────────────────
export function useLessonEngine() {
  const [state, setState] = useState<LessonState | null>(null);
  const lessonRef = useRef<Level | AuthoredLesson | null>(null);

  const startLesson = useCallback((level: Level) => {
    lessonRef.current = level;
    setState({
      questions:   isAuthoredLesson(level) ? buildAuthoredLessonQuestions(level) : buildLesson(level),
      qIndex:      0,
      hearts:      5,
      xp:          0,
      combo:       0,
      wrongCount:  0,
      answered:    false,
      lastCorrect: null,
      finished:    false,
      failed:      false,
      stars:       0,
    });
  }, []);

  /**
   * Start a lesson from a Starknet-track lesson object (from the starknet
   * lesson registry). Builds questions directly from the authored content —
   * key takeaway, simulator, guided-practice MCQs — rather than regenerating
   * from a Level summary.
   */
  const startStarknetLesson = useCallback((lesson: AuthoredLesson) => {
    lessonRef.current = lesson;
    setState({
      questions:   buildAuthoredLessonQuestions(lesson),
      qIndex:      0,
      hearts:      5,
      xp:          0,
      combo:       0,
      wrongCount:  0,
      answered:    false,
      lastCorrect: null,
      finished:    false,
      failed:      false,
      stars:       0,
    });
  }, []);

  const advance = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = prev.qIndex + 1;
      if (next >= prev.questions.length) {
        const stars = prev.wrongCount === 0 ? 3 : prev.wrongCount <= 2 ? 2 : 1;
        return { ...prev, qIndex: next, finished: true, stars, answered: false };
      }
      return { ...prev, qIndex: next, answered: false, lastCorrect: null };
    });
  }, []);

  const goBack = useCallback(() => {
    setState(prev => {
      if (!prev || prev.qIndex <= 0) return prev;
      return {
        ...prev,
        qIndex: prev.qIndex - 1,
        answered: false,
        lastCorrect: null,
        finished: false,
      };
    });
  }, []);

  const completeSimulator = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, combo: prev.combo + 1, xp: prev.xp + 15 };
    });
  }, []);

  const answerCorrect = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const combo  = prev.combo + 1;
      const xpGain = combo > 2 ? 20 : 10;
      return { ...prev, combo, xp: prev.xp + xpGain, answered: true, lastCorrect: true };
    });
  }, []);

  const answerWrong = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const hearts = prev.hearts - 1;
      return {
        ...prev,
        hearts,
        combo:       0,
        wrongCount:  prev.wrongCount + 1,
        answered:    true,
        lastCorrect: false,
        failed:      hearts <= 0,
      };
    });
  }, []);

  const resetLesson = useCallback(() => {
    if (isAuthoredLesson(lessonRef.current)) {
      startStarknetLesson(lessonRef.current);
    } else if (lessonRef.current) {
      startLesson(lessonRef.current);
    }
  }, [startLesson, startStarknetLesson]);

  return { state, lesson: lessonRef.current, startLesson, startStarknetLesson, advance, goBack, answerCorrect, answerWrong, resetLesson, completeSimulator };
}
