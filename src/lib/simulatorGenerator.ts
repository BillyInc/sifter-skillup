/**
 * simulatorGenerator.ts
 *
 * Core logic for auto-generating simulator definitions from lesson content.
 *
 * Given any lesson (from any track or format), this module:
 *   1. Analyses the lesson content and track context
 *   2. Selects the 3 most appropriate simulator types for that lesson
 *      (each one different, following the Sifter spec)
 *   3. Calls Claude API to generate a fully-specified scenario + scoringCriteria
 *      for each simulator, grounded in the lesson's actual content
 *   4. Returns ready-to-insert LessonSimulation[] objects
 *
 * The type selection logic is deterministic per track category. The scenario
 * generation is AI-powered but constrained by the spec (observable criteria,
 * specific numbers, no vague language, verifiable correct answers).
 *
 * Supported lesson formats:
 *   - TrackLesson (from skillTypes.ts — spotTradingTrack, supplyChainTrack, etc.)
 *   - Level (from levels.ts — 270 island levels)
 *   - PythonLevel (from pythonLevels.ts)
 *   - RawLesson (plain object with topic + explanation — for new uploads)
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type SimType =
  | 'judgment-communication'
  | 'judgment-dataInterpret'
  | 'judgment-riskAssess'
  | 'judgment-prioritisation'
  | 'judgment-escalation'
  | 'judgment-ethicalChoice'
  | 'judgment-negotiation'
  | 'chartReplay-pattern'
  | 'chartReplay-breakout'
  | 'chartReplay-reversal'
  | 'chartReplay-riskManage'
  | 'chartReplay-volumeRead'
  | 'chartReplay-patternID'
  | 'sandbox-dataModel'
  | 'sandbox-sql'
  | 'sandbox-python'
  | 'sandbox-excel'
  | 'sandbox-code';

export interface GeneratedSimulation {
  type: SimType;
  scenario: string;
  scoringCriteria: string[];
  /** Only for sandbox-code: which language */
  language?: 'python' | 'sql' | 'javascript' | 'solidity' | 'rust' | 'go';
  /** Scaffolding tier — set from lesson position within the lab */
  scaffoldTier?: 'guided' | 'independent' | 'freestyle';
}

export interface LessonInput {
  /** The lesson title */
  title: string;
  /** Full explanation text */
  explanation: string;
  /** One-sentence key takeaway */
  keyTakeaway?: string;
  /** Examples from the lesson */
  examples?: Array<{ context: string; scenario: string; outcome: string }>;
  /** Guided practice questions */
  guidedPractice?: Array<{ question: string; explanation?: string }>;
  /** Track this lesson belongs to */
  trackId: string;
  trackName: string;
  /** Optional: difficulty */
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  /** Optional: any existing simulations to avoid duplicating */
  existingSimTypes?: string[];
  /**
   * Position of this lesson within the lab (0-indexed).
   * Used to calculate practiceScaffold tier.
   * First 40% = guided, middle 40% = independent, last 20% = freestyle.
   */
  lessonIndexInLab?: number;
  totalLessonsInLab?: number;
}

export interface GeneratorOptions {
  /** Number of simulations to generate per lesson (default: 3) */
  count?: number;
  /** Force specific types instead of auto-selecting */
  forceTypes?: SimType[];
  /** Verbose logging */
  verbose?: boolean;
}

// ── Track → simulator type mapping ───────────────────────────────────────────
//
// Each track category has a primary pool of simulator types.
// The generator picks 3 DIFFERENT types per lesson from this pool,
// rotating through them to ensure variety.
//
// Rules (from Sifter spec Section 5):
//   Category 1: Chart/Pattern Recognition → trading tracks
//   Category 2: Decision/Judgment → all tracks but especially professional/management
//   Category 3: Procedural/Technical → coding/data/blockchain tracks

const TRACK_TYPE_POOLS: Record<string, SimType[][]> = {
  // Trading tracks — mix of chart and judgment
  'spot-trading': [
    ['chartReplay-pattern', 'chartReplay-riskManage', 'judgment-riskAssess'],
    ['chartReplay-breakout', 'judgment-dataInterpret', 'chartReplay-volumeRead'],
    ['chartReplay-reversal', 'judgment-riskAssess', 'chartReplay-patternID'],
  ],
  'futures-trading': [
    ['chartReplay-pattern', 'judgment-riskAssess', 'sandbox-dataModel'],
    ['chartReplay-riskManage', 'judgment-dataInterpret', 'chartReplay-breakout'],
    ['chartReplay-volumeRead', 'judgment-riskAssess', 'chartReplay-reversal'],
  ],
  'memecoin-trading': [
    ['chartReplay-pattern', 'judgment-riskAssess', 'sandbox-dataModel'],
    ['judgment-dataInterpret', 'chartReplay-breakout', 'judgment-ethicalChoice'],
    ['chartReplay-reversal', 'judgment-riskAssess', 'chartReplay-patternID'],
  ],
  'options-trading': [
    ['sandbox-dataModel', 'judgment-riskAssess', 'judgment-dataInterpret'],
    ['judgment-dataInterpret', 'sandbox-dataModel', 'judgment-riskAssess'],
    ['judgment-prioritisation', 'sandbox-dataModel', 'judgment-riskAssess'],
  ],
  'quant-trading': [
    ['sandbox-python', 'judgment-dataInterpret', 'sandbox-dataModel'],
    ['sandbox-python', 'judgment-riskAssess', 'sandbox-dataModel'],
    ['sandbox-python', 'judgment-dataInterpret', 'judgment-prioritisation'],
  ],
  'arbitrage-mev': [
    ['sandbox-python', 'sandbox-dataModel', 'judgment-riskAssess'],
    ['sandbox-code', 'sandbox-dataModel', 'judgment-dataInterpret'],
    ['sandbox-python', 'judgment-riskAssess', 'sandbox-dataModel'],
  ],

  // Research / Analysis tracks
  'onchain-analysis': [
    ['sandbox-dataModel', 'sandbox-sql', 'judgment-dataInterpret'],
    ['sandbox-dataModel', 'judgment-riskAssess', 'sandbox-sql'],
    ['judgment-communication', 'sandbox-dataModel', 'sandbox-sql'],
  ],
  'onchain-sleuth': [
    ['sandbox-dataModel', 'judgment-communication', 'sandbox-sql'],
    ['sandbox-dataModel', 'sandbox-python', 'judgment-riskAssess'],
    ['judgment-dataInterpret', 'sandbox-dataModel', 'judgment-communication'],
  ],
  'token-research': [
    ['judgment-dataInterpret', 'judgment-riskAssess', 'judgment-communication'],
    ['judgment-riskAssess', 'judgment-prioritisation', 'sandbox-dataModel'],
    ['judgment-communication', 'judgment-dataInterpret', 'judgment-ethicalChoice'],
  ],
  'quant-research': [
    ['sandbox-python', 'judgment-dataInterpret', 'sandbox-dataModel'],
    ['sandbox-python', 'judgment-riskAssess', 'judgment-dataInterpret'],
    ['sandbox-python', 'sandbox-dataModel', 'judgment-communication'],
  ],
  'data-analysis': [
    ['sandbox-sql', 'sandbox-excel', 'judgment-dataInterpret'],
    ['sandbox-excel', 'judgment-communication', 'sandbox-sql'],
    ['sandbox-sql', 'judgment-prioritisation', 'sandbox-excel'],
  ],
  'data-science': [
    ['sandbox-python', 'sandbox-dataModel', 'judgment-dataInterpret'],
    ['sandbox-python', 'judgment-communication', 'sandbox-dataModel'],
    ['sandbox-python', 'judgment-riskAssess', 'sandbox-dataModel'],
  ],

  // Building / coding tracks
  'smart-contract-dev': [
    ['sandbox-code', 'sandbox-dataModel', 'judgment-riskAssess'],
    ['sandbox-code', 'judgment-ethicalChoice', 'sandbox-dataModel'],
    ['sandbox-code', 'judgment-dataInterpret', 'sandbox-dataModel'],
  ],
  'contract-auditing': [
    ['sandbox-code', 'sandbox-dataModel', 'judgment-riskAssess'],
    ['judgment-communication', 'sandbox-code', 'sandbox-dataModel'],
    ['sandbox-code', 'judgment-ethicalChoice', 'sandbox-dataModel'],
  ],
  'bot-development': [
    ['sandbox-python', 'sandbox-code', 'judgment-riskAssess'],
    ['sandbox-python', 'judgment-dataInterpret', 'sandbox-code'],
    ['sandbox-code', 'sandbox-python', 'judgment-prioritisation'],
  ],
  'dapp-development': [
    ['sandbox-code', 'sandbox-dataModel', 'judgment-riskAssess'],
    ['sandbox-code', 'judgment-communication', 'sandbox-dataModel'],
    ['sandbox-code', 'judgment-dataInterpret', 'sandbox-dataModel'],
  ],
  'vibe-coding': [
    ['sandbox-code', 'judgment-communication', 'judgment-riskAssess'],
    ['sandbox-code', 'judgment-dataInterpret', 'sandbox-code'],
    ['judgment-prioritisation', 'sandbox-code', 'judgment-communication'],
  ],

  // Professional tracks
  'supply-chain-analyst': [
    ['judgment-dataInterpret', 'sandbox-excel', 'judgment-communication'],
    ['sandbox-sql', 'judgment-riskAssess', 'judgment-escalation'],
    ['judgment-communication', 'sandbox-excel', 'judgment-prioritisation'],
  ],
  'supply-chain-junior': [
    ['judgment-dataInterpret', 'sandbox-excel', 'judgment-communication'],
    ['judgment-escalation', 'sandbox-excel', 'judgment-riskAssess'],
    ['judgment-prioritisation', 'sandbox-sql', 'judgment-communication'],
  ],
  'content-creation': [
    ['judgment-communication', 'judgment-dataInterpret', 'judgment-ethicalChoice'],
    ['judgment-prioritisation', 'judgment-communication', 'sandbox-dataModel'],
    ['judgment-negotiation', 'judgment-communication', 'judgment-ethicalChoice'],
  ],
  'community-management': [
    ['judgment-communication', 'judgment-escalation', 'judgment-ethicalChoice'],
    ['judgment-prioritisation', 'judgment-communication', 'judgment-escalation'],
    ['judgment-negotiation', 'judgment-ethicalChoice', 'judgment-communication'],
  ],

  // Default fallback — works for any unconfigured track
  default: [
    ['judgment-dataInterpret', 'judgment-riskAssess', 'judgment-communication'],
    ['judgment-riskAssess', 'judgment-prioritisation', 'judgment-escalation'],
    ['judgment-communication', 'judgment-dataInterpret', 'judgment-ethicalChoice'],
  ],
};

// ── Island levels type mapping (by topic keywords) ────────────────────────────

const ISLAND_KEYWORD_MAP: Array<{ keywords: string[]; types: SimType[] }> = [
  { keywords: ['bitcoin', 'btc', 'lightning', 'wallet', 'seed', 'private key'],
    types: ['judgment-riskAssess', 'sandbox-dataModel', 'judgment-dataInterpret'] },
  { keywords: ['ethereum', 'eth', 'erc20', 'gas', 'validator', 'layer 2'],
    types: ['sandbox-dataModel', 'judgment-riskAssess', 'judgment-dataInterpret'] },
  { keywords: ['defi', 'uniswap', 'liquidity', 'impermanent', 'yield', 'lending'],
    types: ['sandbox-dataModel', 'judgment-riskAssess', 'judgment-dataInterpret'] },
  { keywords: ['nft', 'token', 'contract', 'solidity', 'smart'],
    types: ['sandbox-dataModel', 'judgment-riskAssess', 'sandbox-code'] },
  { keywords: ['security', 'phishing', 'scam', 'opsec', 'approval', 'rug'],
    types: ['judgment-riskAssess', 'sandbox-dataModel', 'judgment-ethicalChoice'] },
  { keywords: ['mev', 'sandwich', 'frontrun', 'arb', 'bot'],
    types: ['sandbox-dataModel', 'judgment-riskAssess', 'judgment-dataInterpret'] },
  { keywords: ['python', 'code', 'script', 'function', 'loop', 'pandas'],
    types: ['sandbox-python', 'judgment-dataInterpret', 'sandbox-dataModel'] },
  { keywords: ['sql', 'query', 'database', 'table', 'select'],
    types: ['sandbox-sql', 'judgment-dataInterpret', 'sandbox-dataModel'] },
];

// ── Type selection logic ───────────────────────────────────────────────────────

export function selectSimulatorTypes(
  lesson: LessonInput,
  lessonIndexInTrack: number = 0,
  existingInLab: SimType[] = [],
): SimType[] {
  const pool = TRACK_TYPE_POOLS[lesson.trackId] ?? TRACK_TYPE_POOLS.default;

  // Rotate through the pool based on lesson index
  const candidates = pool[lessonIndexInTrack % pool.length];

  // If some of these types have been overused in this lab, rotate to next set
  const overused = candidates.filter(t =>
    existingInLab.filter(e => e === t).length >= 3
  );

  if (overused.length > 0) {
    const nextSet = pool[(lessonIndexInTrack + 1) % pool.length];
    return nextSet;
  }

  return candidates;
}

function selectIslandTypes(lesson: LessonInput): SimType[] {
  const text = (lesson.title + ' ' + lesson.explanation + ' ' + (lesson.keyTakeaway ?? '')).toLowerCase();

  for (const mapping of ISLAND_KEYWORD_MAP) {
    if (mapping.keywords.some(k => text.includes(k))) {
      return mapping.types;
    }
  }

  return ['judgment-riskAssess', 'sandbox-dataModel', 'judgment-dataInterpret'];
}

// ── Generation prompt builder ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert curriculum designer for Sifter Skill_Up, a professional skills learning platform.

Your job: Given a lesson's content, generate simulator exercises that test whether the student has truly understood the lesson — not just memorised it.

RULES (non-negotiable):
1. Each simulator must test a DIFFERENT sub-concept from the lesson. No two simulators test the same thing.
2. Scenarios must use SPECIFIC numbers, named entities, and realistic conditions. No vague language.
3. scoringCriteria must be BINARY and OBSERVABLE — either the student said X or they didn't. Never "student shows understanding".
4. Each scenario must be SELF-CONTAINED — all data the student needs is in the scenario itself.
5. scoringCriteria: 4-6 items per simulator. Each item is one testable, observable thing.
6. The correct answer must be VERIFIABLE against a named standard, calculation, or documented principle.
7. Never create simulators that can be answered by guessing or common sense alone.

OUTPUT FORMAT — respond with a JSON array only. No preamble, no markdown, no backticks:
[
  {
    "type": "judgment-riskAssess",
    "scenario": "Full scenario text here...",
    "scoringCriteria": ["Criterion 1", "Criterion 2", "Criterion 3", "Criterion 4"]
  },
  { ... },
  { ... }
]`;

function buildGenerationPrompt(lesson: LessonInput, types: SimType[]): string {
  const examplesText = lesson.examples?.slice(0, 2).map(e =>
    `Example: ${e.context}\nScenario: ${e.scenario}\nOutcome: ${e.outcome}`
  ).join('\n\n') ?? '';

  const practiceText = lesson.guidedPractice?.slice(0, 3).map(p =>
    `Q: ${p.question}`
  ).join('\n') ?? '';

  const typeInstructions = types.map((t, i) => {
    const instructions: Record<SimType, string> = {
      'judgment-communication':  'Write a memo, email, or verbal pitch. Test whether student can communicate the lesson concept clearly and professionally.',
      'judgment-dataInterpret':  'Present data from the lesson domain. Student must diagnose what is happening and recommend a specific action with numbers.',
      'judgment-riskAssess':     'Present a scenario with 3-4 risk factors from the lesson. Student must rank risks, identify the most critical, and state specific actions.',
      'judgment-prioritisation': 'Present 4-5 competing tasks or decisions. Student must rank them by urgency/impact and justify using lesson principles.',
      'judgment-escalation':     'Present a situation where something has gone wrong. Student decides: handle it themselves or escalate — with whom, how, and why.',
      'judgment-ethicalChoice':  'Present a genuine ethical dilemma in the lesson domain. No obvious right answer. Student must acknowledge competing interests.',
      'judgment-negotiation':    'Present a negotiation situation. Student writes their approach, opening position, concessions, and walk-away point.',
      'chartReplay-pattern':     'Describe a candlestick chart in text (5-8 candles with OHLCV data). Student identifies the pattern and what it signals.',
      'chartReplay-breakout':    'Describe a consolidation pattern in text with order book data. Student assesses breakout quality and states entry criteria.',
      'chartReplay-reversal':    'Describe a trend that is showing reversal signals. Student identifies signals and states their reasoning.',
      'chartReplay-riskManage':  'Describe a live chart position. Student states stop placement, target, and position sizing with specific calculations.',
      'chartReplay-volumeRead':  'Describe volume patterns alongside price action. Student interprets what the volume confirms or contradicts.',
      'chartReplay-patternID':   'Describe a named chart pattern. Student identifies the pattern name and states its textbook criteria.',
      'sandbox-dataModel':       'Present structured data (table, transaction record, or dataset). Student answers analytical questions about it.',
      'sandbox-sql':             'Present a supply chain or data analysis problem. Student writes the SQL query or logic to solve it.',
      'sandbox-python':          'Present a data analysis or automation task. Student writes Python code or logic to solve it.',
      'sandbox-excel':           'Present a spreadsheet task with specific columns and formulas needed. Student describes the formula logic.',
      'sandbox-code':            'Present a coding task in the lesson\'s language. Student writes the code or pseudocode to solve it.',
    };
    return `Simulator ${i + 1}: type="${t}"\nInstruction: ${instructions[t]}`;
  }).join('\n\n');

  return `TRACK: ${lesson.trackName}
LESSON TITLE: ${lesson.title}
DIFFICULTY: ${lesson.difficulty ?? 'intermediate'}

LESSON CONTENT:
${lesson.explanation.slice(0, 2000)}

KEY TAKEAWAY:
${lesson.keyTakeaway ?? ''}

${examplesText ? `LESSON EXAMPLES:\n${examplesText}` : ''}

${practiceText ? `GUIDED PRACTICE TOPICS:\n${practiceText}` : ''}

GENERATE THESE 3 SIMULATORS:
${typeInstructions}

Remember: Each simulator tests a DIFFERENT sub-concept. Scenarios must use specific numbers and named entities from the lesson domain. All scoringCriteria must be observable and binary. Return only the JSON array.`;
}

// ── API call ──────────────────────────────────────────────────────────────────

async function callClaude(prompt: string, apiKey: string): Promise<GeneratedSimulation[]> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json() as any;
  const raw = (data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim();

  let parsed: GeneratedSimulation[];
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON from Claude:\n${raw.slice(0, 500)}`);
  }

  if (!Array.isArray(parsed)) throw new Error('Expected array response');

  // Validate each item
  return parsed.map((item, i) => {
    if (!item.type || !item.scenario || !Array.isArray(item.scoringCriteria)) {
      throw new Error(`Simulator ${i + 1} missing required fields`);
    }
    if (item.scoringCriteria.length < 3) {
      throw new Error(`Simulator ${i + 1} has fewer than 3 scoring criteria`);
    }
    return item as GeneratedSimulation;
  });
}

// ── Main export: generate simulators for a lesson ─────────────────────────────

export async function generateSimulatorsForLesson(
  lesson: LessonInput,
  apiKey: string,
  options: GeneratorOptions = {},
): Promise<GeneratedSimulation[]> {
  const { count = 3, forceTypes, verbose = false } = options;

  // Select types
  const types = forceTypes ?? selectSimulatorTypes(lesson);
  if (verbose) console.log(`[gen] ${lesson.title}: types = ${types.join(', ')}`);

  // Build prompt
  const prompt = buildGenerationPrompt(lesson, types.slice(0, count));

  // Generate
  const sims = await callClaude(prompt, apiKey);
  if (verbose) console.log(`[gen] ${lesson.title}: generated ${sims.length} simulators`);

  // Attach scaffoldTier based on lesson position within lab
  const scaffoldTier = computeScaffoldTier(
    lesson.lessonIndexInLab ?? 0,
    lesson.totalLessonsInLab ?? 10,
  );
  return sims.map(s => ({ ...s, scaffoldTier }));
}

/**
 * Compute the scaffolding tier for a lesson based on its position in the lab.
 * First 40% of lessons = guided (platform assists heavily)
 * Middle 40%           = independent (clear task, no scaffold)
 * Last 20%             = freestyle (outcome stated, user picks approach)
 */
export function computeScaffoldTier(
  lessonIndex: number,
  totalLessons: number,
): 'guided' | 'independent' | 'freestyle' {
  const pct = lessonIndex / Math.max(totalLessons - 1, 1);
  if (pct < 0.40) return 'guided';
  if (pct < 0.80) return 'independent';
  return 'freestyle';
}

// ── Batch: generate for all lessons in a track array ─────────────────────────

export async function generateSimulatorsForTrack(
  lessons: LessonInput[],
  apiKey: string,
  options: GeneratorOptions & { delayMs?: number } = {},
): Promise<Map<string, GeneratedSimulation[]>> {
  const results = new Map<string, GeneratedSimulation[]>();
  const { delayMs = 1200, verbose = false } = options;

  // Track which types have been used in this lab for variety
  const usedTypes: SimType[] = [];

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    if (verbose) console.log(`[gen] ${i + 1}/${lessons.length}: ${lesson.title}`);

    const sims = await generateSimulatorsForLesson(
      { ...lesson, existingSimTypes: usedTypes },
      apiKey,
      { ...options, verbose },
    );

    results.set(lesson.title, sims);
    sims.forEach(s => usedTypes.push(s.type as SimType));

    // Rate limit — Claude has generous limits but be polite
    if (i < lessons.length - 1 && delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return results;
}

// ── Format output as TypeScript insertion ─────────────────────────────────────

export function formatAsTypeScript(sims: GeneratedSimulation[]): string {
  const items = sims.map(sim => {
    const criteria = sim.scoringCriteria.map(c => `          \`${c.replace(/`/g, "'")}\`,`).join('\n');
    const lang = sim.language ? `\n          language: '${sim.language}',` : '';
    return `        {
          type: \`${sim.type}\`,${lang}
          scenario: \`${sim.scenario.replace(/`/g, "'")}\`,
          scoringCriteria: [
${criteria}
          ],
        }`;
  });

  return `        lessonSimulations: [\n${items.join(',\n')},\n        ],`;
}

// ── Quick single-lesson helper ─────────────────────────────────────────────────

/**
 * Convenience function for generating and printing simulators for one lesson.
 * Useful for testing in a REPL or quick scripts.
 *
 * Usage:
 *   import { quickGenerate } from './simulatorGenerator';
 *   const ts = await quickGenerate({
 *     title: 'Liquidity and Slippage',
 *     explanation: '...',
 *     keyTakeaway: '...',
 *     trackId: 'spot-trading',
 *     trackName: 'Spot Trading',
 *   }, process.env.ANTHROPIC_API_KEY!);
 *   console.log(ts); // paste directly into your .ts file
 */
export async function quickGenerate(
  lesson: LessonInput,
  apiKey: string,
): Promise<string> {
  const sims = await generateSimulatorsForLesson(lesson, apiKey, { verbose: true });
  return formatAsTypeScript(sims);
}
