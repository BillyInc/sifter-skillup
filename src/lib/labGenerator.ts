/**
 * labGenerator.ts — Generates everything at the Lab level and above.
 *
 * Given a lab's full lesson array (already with their lessonSimulations),
 * this generates:
 *
 *   1. aggregateSimulations block — 15 per lab, diverse types drawn from the
 *      lesson pool, each unique per user via scenario variable injection
 *
 *   2. bossMode block — both phases, per the Sifter spec:
 *      Phase 1 (Beginner/Learning Loop): platform assigns scenario, hints enabled,
 *        lesson pointers on miss, unlimited attempts, no portfolio push
 *      Phase 2 (Intermediate/Certification): platform assigns FRESH unseen scenario,
 *        no hints, no pointers, portfolio push on 100% pass only
 *      Expert tier (Late labs): user picks topic from platform list, does it freestyle
 *
 *   3. interviewMode structure — for the Final Boss at the end of each Level.
 *      Synthesises skills from 3+ labs. Each question grounded in real lesson content.
 *      No hints at any point. Fresh scenario per user via variable injection.
 *
 * UNIQUENESS GUARANTEE:
 *   Boss and aggregate scenarios use {template_variables} in their scenario text.
 *   At runtime, progressionEngine.generateScenarioVariables() fills these with
 *   user-specific values (company_type, disruption, geography, etc.)
 *   so no two users read identical scenario text.
 *
 *   Additionally, the backend tracks which scenario IDs each user has seen and
 *   never re-serves the same scenario_id to the same user.
 */

import { TRACK_TYPE_POOLS } from './simulatorGenerator';
import type { SimType, LessonInput, GeneratedSimulation } from './simulatorGenerator';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LessonWithSims {
  id:                 string;
  title:              string;
  explanation:        string;
  keyTakeaway:        string;
  lessonSimulations:  GeneratedSimulation[];
  guidedPractice?:    Array<{ question: string; explanation?: string }>;
}

export interface AggregateSimDef {
  type:             SimType;
  scenario:         string;   // contains {template_variables} for runtime injection
  scoringCriteria:  string[];
  scenarioId:       string;   // unique ID — backend uses this to prevent repeat-serving
  conceptSource:    string;   // which lesson this draws from
}

export interface BossScenario {
  id:               string;
  situation:        string;   // contains {template_variables}
  question:         string;
  scoringCriteria:  string[];
  phase:            1 | 2;
  conceptsSynthesised: string[]; // lesson titles this combines
}

export interface BossMode {
  title:    string;
  phase1: {
    hintsEnabled:       true;
    portfolioPush:      false;
    feedbackFormat: {
      showCriteriaResults: boolean;
      showLessonPointers:  boolean;
      message:             string;
    };
    scenarios:          BossScenario[];
  };
  phase2?: {
    hintsEnabled:        false;
    portfolioPush:       true;
    confirmationScreen:  string;
    feedbackFormat: {
      showCriteriaResults: boolean;
      showLessonPointers:  false;
      message:             string;
    };
    prerequisiteFloor: {
      guidedPracticeAverage:          number;
      lessonSimulationAverage:         number;
      aggregateSimulationsCompleted:   number;
    };
    scenarios:           BossScenario[];
    onPass: {
      xpAwarded:    number;
      badgeEarned:  string;
      message:      string;
    };
    expertMode: {
      enabled:      boolean;
      description:  string;
    };
  };
}

export interface InterviewQuestion {
  id:               string;
  type:             'behavioural' | 'technical' | 'case-study' | 'situational' | 'strategy';
  question:         string;
  context?:         string;
  scoringCriteria:  string[];
  timeGuidance:     string;
  labSource:        string;   // which lab this question draws from
}

export interface InterviewMode {
  level:          'junior' | 'intermediate' | 'senior';
  roleName:       string;
  totalQuestions: number;
  structure:      string;   // description of the interview format
  questions:      InterviewQuestion[];
  onPass: {
    xpAwarded:   number;
    badgeEarned: string;
    message:     string;
    unlocksLevel: string;
  };
}

export interface GeneratedLabContent {
  labId:                string;
  labTitle:             string;
  aggregateSimulations: {
    count:            number;
    simulatorTypes:   SimType[];
    description:      string;
    scoringMode:      string;
    unlockCondition:  string;
    scenarios:        AggregateSimDef[];
  };
  bossMode: BossMode;
}

// ── Generation prompts ────────────────────────────────────────────────────────

const AGGREGATE_SYSTEM = `You are an expert curriculum designer for Sifter Skill_Up.

Generate 15 aggregate simulation scenarios for a lab. These draw randomly from all lessons in the lab and test at a higher difficulty than individual lesson simulations.

Rules:
1. Each scenario must synthesise 2-3 concepts from different lessons — not just one
2. Use {company_type}, {disruption}, {geography}, {time_pressure} as template variables — these get filled with user-specific values at runtime so no two users see identical text
3. Scenarios must be harder than lesson-level simulations — require applying multiple concepts together
4. scoringCriteria: 4-5 binary, observable items per scenario
5. Cover ALL simulator types from the lessons — no type appears more than 3 times
6. scenarioId must be unique: format "agg_{labId}_{index}"

OUTPUT: valid JSON array only, no markdown:
[{
  "type": "judgment-riskAssess",
  "scenarioId": "agg_lab1_01",
  "conceptSource": "lesson title this draws from",
  "scenario": "You are a {company_type} supply chain analyst at a {company_size} company. A {disruption} has just been reported in your {geography} operations with {time_pressure}...",
  "scoringCriteria": ["...", "...", "...", "..."]
}]`;

const BOSS_SYSTEM = `You are an expert curriculum designer for Sifter Skill_Up.

CRITICAL — THE PHASE STRUCTURE IS FIXED AND NEVER CHANGES:
- Phase 1 (Learning Loop) is ALWAYS assisted: hints on, lesson pointers on, MCQ format. Every lab. Always.
- Phase 2 (Certification) is ALWAYS unassisted: no hints, no pointers, open-response. Every qualifying lab. Always.
What changes with lab difficulty is the CONTENT complexity of scenarios — not the phase structure.

PHASE 1 — Learning Loop — ALWAYS assisted:
- MCQ: 1 correct + 3 wrong answers with explanations
- situation uses {template_variables} for runtime uniqueness
- All major lab concepts synthesised in each scenario
- scoringCriteria: 4-5 binary, observable items
- Earlier labs: simpler scenarios. Later labs: harder scenarios. Hints ALWAYS available.

PHASE 2 — Certification — ALWAYS unassisted:
- Open-response only (no options array)
- {template_variables} in situation for uniqueness
- No hints. No pointers. Portfolio push on 100% pass only
- scoringCriteria: 5-6 items, verifiable against named standards
- Earlier labs: fewer concepts to synthesise. Later labs: full synthesis required

OUTPUT JSON shape:
{
  "bossTitle": "...",
  "phase1Scenarios": [{"situation":"...{company_type}...","question":"...","scoringCriteria":["..."],"options":[{"text":"...","correct":true,"explanation":"..."},...]}],
  "phase2Scenarios": [{"situation":"...{company_type}...","question":"...","scoringCriteria":["...","...","...","...","..."]}],
  "badgeEarned": "...",
  "xpAwarded": 500
}`

const INTERVIEW_SYSTEM = `You are an expert curriculum designer for Sifter Skill_Up.

Generate a Final Boss interview simulation that acts as the Level completion gate.

The interview structure must match how this role is actually interviewed in industry.
Synthesise skills from at least 3 different labs in this level.

Question types:
- behavioural: "Tell me about a time when..." (STAR format) — draws from user's actual portfolio work
- technical: specific technical knowledge test (data, process, tools)
- case-study: live case with data — analyse and recommend
- situational: "What would you do if..." — tests judgment
- strategy: senior-level strategic thinking (only for senior interviews)

Rules:
1. No hints at any point — this is a gate test
2. Fresh scenario per user (use {template_variables} in case study and situational questions)
3. scoringCriteria: 4-5 binary items per question
4. timeGuidance: realistic spoken/written time guidance for each question
5. Questions must be indistinguishable from real industry interviews for this role

OUTPUT: valid JSON only:
{
  "structure": "Interview format description...",
  "questions": [{
    "id": "q1",
    "type": "behavioural",
    "question": "...",
    "context": "optional additional context",
    "scoringCriteria": ["...", "..."],
    "timeGuidance": "2-3 minutes spoken / 150-200 words written",
    "labSource": "Lab X — topic name"
  }]
}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function callClaude(prompt: string, system: string, apiKey: string, maxTokens = 3000): Promise<any> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json() as any;
  const raw = (data.content?.[0]?.text ?? '').replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON:\n${raw.slice(0, 400)}`);
  }
}

function collectSimTypes(lessons: LessonWithSims[]): SimType[] {
  const types = new Set<SimType>();
  for (const lesson of lessons) {
    for (const sim of lesson.lessonSimulations) {
      types.add(sim.type as SimType);
    }
  }
  return [...types];
}

function buildLessonSummary(lessons: LessonWithSims[]): string {
  return lessons.slice(0, 8).map((l, i) =>
    `Lesson ${i + 1}: "${l.title}"\nKey concept: ${l.keyTakeaway}\nSim types: ${l.lessonSimulations.map(s => s.type).join(', ')}`
  ).join('\n\n');
}

// ── Aggregate generation ───────────────────────────────────────────────────────

async function generateAggregateSimulations(
  labId: string,
  labTitle: string,
  trackName: string,
  lessons: LessonWithSims[],
  apiKey: string,
): Promise<AggregateSimDef[]> {
  const simTypes = collectSimTypes(lessons);
  const lessonSummary = buildLessonSummary(lessons);

  const prompt = `TRACK: ${trackName}
LAB: ${labTitle}
LAB ID: ${labId}

LESSONS IN THIS LAB (${lessons.length} total):
${lessonSummary}

SIMULATOR TYPES USED IN THIS LAB: ${simTypes.join(', ')}

Generate exactly 15 aggregate simulation scenarios.
- Cover all simulator types (max 3 of the same type)
- Each synthesises 2-3 concepts from DIFFERENT lessons
- Use template variables: {company_type}, {disruption}, {geography}, {time_pressure}, {severity}
- scenarioId format: agg_${labId}_01 through agg_${labId}_15
- These are harder than lesson-level simulations — require applying multiple concepts together`;

  const raw = await callClaude(prompt, AGGREGATE_SYSTEM, apiKey, 4000);
  if (!Array.isArray(raw)) throw new Error('Expected array for aggregate sims');
  if (raw.length < 10) throw new Error(`Only ${raw.length} aggregate sims generated, need 15`);

  return raw.slice(0, 15).map((s: any, i: number) => ({
    type:            s.type as SimType,
    scenario:        s.scenario ?? '',
    scoringCriteria: s.scoringCriteria ?? [],
    scenarioId:      s.scenarioId ?? `agg_${labId}_${String(i + 1).padStart(2, '0')}`,
    conceptSource:   s.conceptSource ?? lessons[i % lessons.length]?.title ?? '',
  }));
}

// ── Boss mode generation ───────────────────────────────────────────────────────

async function generateBossMode(
  labId: string,
  labTitle: string,
  trackName: string,
  level: 'junior' | 'intermediate' | 'senior',
  labIndex: number,
  totalLabsInLevel: number,
  hasPhase2: boolean,
  lessons: LessonWithSims[],
  apiKey: string,
): Promise<BossMode> {
  const lessonSummary = buildLessonSummary(lessons);
  const labTier = labIndex < totalLabsInLevel * 0.4 ? 'early'
    : labIndex < totalLabsInLevel * 0.8 ? 'mid' : 'late';

  const prompt = `TRACK: ${trackName}
LEVEL: ${level}
LAB: ${labTitle} (lab ${labIndex + 1} of ${totalLabsInLevel})
LAB TIER: ${labTier} (${labTier === 'late' ? 'user picks topic — expert mode' : labTier === 'mid' ? 'platform random pool' : 'platform assigns'})
LAB ID: ${labId}
HAS PHASE 2 PORTFOLIO PUSH: ${hasPhase2}

LESSONS THIS BOSS MUST SYNTHESISE:
${lessonSummary}

Generate ${hasPhase2 ? 'both Phase 1 (3 scenarios) and Phase 2 (4 scenarios)' : 'Phase 1 only (4 scenarios)'}.

Phase 1: MCQ-style scenarios with 4 options (1 correct, 3 wrong with explanations).
Each scenario synthesises ALL major concepts from the lab.
Use {template_variables} so no two users see identical text.

${hasPhase2 ? `Phase 2: Open-response. Harder. More ambiguous. Requires independent judgment.
User writes analysis/recommendation — no options given. Portfolio artifact on 100% pass.
Badge: "${trackName} — ${labTitle.replace(/Lab \d+:\s*/i, '').trim()} Certified"` : ''}

${labTier === 'late' ? 'Expert mode: user picks from platform-suggested topics list, then completes freestyle.' : ''}`;

  const raw = await callClaude(prompt, BOSS_SYSTEM, apiKey, 4000);

  // Build phase1 scenarios
  const p1Scenarios: BossScenario[] = (raw.phase1Scenarios ?? []).slice(0, 4).map((s: any, i: number) => ({
    id: `${labId}-b${i + 1}`,
    situation: s.situation ?? s.scenario ?? '',
    question: s.question ?? 'What do you recommend?',
    scoringCriteria: s.scoringCriteria ?? [],
    options: s.options ?? [],
    phase: 1 as const,
    conceptsSynthesised: s.conceptsSynthesised ?? lessons.slice(0, 3).map(l => l.title),
  }));

  // Build phase2 scenarios
  const p2Scenarios: BossScenario[] = hasPhase2
    ? (raw.phase2Scenarios ?? []).slice(0, 4).map((s: any, i: number) => ({
        id: `${labId}-cert-${i + 1}`,
        situation: s.situation ?? s.scenario ?? '',
        question: s.question ?? 'Write your full analysis and recommendation.',
        scoringCriteria: s.scoringCriteria ?? [],
        phase: 2 as const,
        conceptsSynthesised: s.conceptsSynthesised ?? lessons.map(l => l.title),
      }))
    : [];

  const bossMode: BossMode = {
    title: raw.bossTitle ?? `${labTitle.replace(/Lab \d+:\s*/i, '').trim()} Challenge`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: true,
        message: 'Review the lessons pointed to above and try again. You can attempt Phase 1 as many times as you need.',
      },
      scenarios: p1Scenarios,
    },
  };

  if (hasPhase2) {
    bossMode.phase2 = {
      hintsEnabled: false,
      portfolioPush: true,
      confirmationScreen: `You are entering Portfolio Push Mode. No hints will be given. A fresh unseen scenario will be generated. Your portfolio artifact will only be generated if you meet 100% of the scoring criteria on this attempt. Are you ready?`,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: false,
        message: 'Not all criteria met. A new scenario will be generated for your next attempt.',
      },
      prerequisiteFloor: {
        guidedPracticeAverage: 0.70,
        lessonSimulationAverage: 0.60,
        aggregateSimulationsCompleted: 15,
      },
      scenarios: p2Scenarios,
      onPass: {
        xpAwarded: raw.xpAwarded ?? (level === 'senior' ? 1500 : level === 'intermediate' ? 1000 : 500),
        badgeEarned: raw.badgeEarned ?? `${trackName} — ${labTitle.replace(/Lab \d+:\s*/i, '').trim()} Certified`,
        message: raw.onPassMessage ?? `Portfolio artifact earned. Pushed to your primary platforms.`,
      },
      expertMode: {
        enabled: labTier === 'late',
        description: labTier === 'late'
          ? 'Pick your own topic from the platform suggestions and complete it freestyle. No prompts after topic selection.'
          : 'Expert mode unlocks in the final 20% of labs.',
      },
    };
  }

  return bossMode;
}

// ── Interview mode generation (Final Boss / Level Gate) ───────────────────────

export async function generateInterviewMode(
  trackId: string,
  trackName: string,
  level: 'junior' | 'intermediate' | 'senior',
  labSummaries: Array<{ labId: string; labTitle: string; keySkills: string[] }>,
  roleName: string,
  apiKey: string,
): Promise<InterviewMode> {
  // Sample 3+ labs to synthesise from — pick spread across the level
  const sampled = labSummaries.length <= 3
    ? labSummaries
    : [
        labSummaries[0],
        labSummaries[Math.floor(labSummaries.length / 2)],
        labSummaries[labSummaries.length - 1],
        ...(labSummaries.length > 4 ? [labSummaries[Math.floor(labSummaries.length / 3)]] : []),
      ];

  const totalQ = level === 'junior' ? 4 : level === 'intermediate' ? 6 : 6;

  const prompt = `ROLE: ${roleName}
LEVEL: ${level}
TRACK: ${trackName}

LABS TO SYNTHESISE (${sampled.length} sampled from ${labSummaries.length} total):
${sampled.map(l => `- ${l.labTitle}: ${l.keySkills.join(', ')}`).join('\n')}

Generate a ${totalQ}-question interview that mirrors a real ${level} ${roleName} interview.
Use {template_variables} in case study and situational questions.
No hints at any point — this is the level completion gate.

Structure for ${level}:
${level === 'junior'
  ? '2 behavioural (STAR) + 1 technical + 1 live case study'
  : level === 'intermediate'
  ? '2 behavioural + 2 technical + 1 live case + 1 situational'
  : '2 behavioural + 2 technical + 1 strategy case + 1 stakeholder scenario'}

Draw from DIFFERENT labs for each question.`;

  const raw = await callClaude(prompt, INTERVIEW_SYSTEM, apiKey, 3000);
  const questions: InterviewQuestion[] = (raw.questions ?? []).slice(0, totalQ).map((q: any, i: number) => ({
    id: `${level}-${trackId}-q${i + 1}`,
    type: q.type ?? 'technical',
    question: q.question ?? '',
    context: q.context,
    scoringCriteria: q.scoringCriteria ?? [],
    timeGuidance: q.timeGuidance ?? '2-3 minutes',
    labSource: q.labSource ?? sampled[i % sampled.length]?.labTitle ?? '',
  }));

  const unlocksMap: Record<string, string> = {
    junior: 'Intermediate',
    intermediate: 'Senior',
    senior: 'Certified Professional',
  };

  return {
    level,
    roleName,
    totalQuestions: questions.length,
    structure: raw.structure ?? `${level.charAt(0).toUpperCase() + level.slice(1)}-level ${roleName} interview`,
    questions,
    onPass: {
      xpAwarded:    level === 'senior' ? 3000 : level === 'intermediate' ? 2000 : 1500,
      badgeEarned:  `${roleName} — ${level.charAt(0).toUpperCase() + level.slice(1)} Certified`,
      message:      `${level.charAt(0).toUpperCase() + level.slice(1)} level complete. ${unlocksMap[level]} level unlocked.`,
      unlocksLevel: unlocksMap[level],
    },
  };
}

// ── Full lab generator — main export ──────────────────────────────────────────

export async function generateLabContent(params: {
  labId:            string;
  labTitle:         string;
  trackId:          string;
  trackName:        string;
  level:            'junior' | 'intermediate' | 'senior';
  labIndex:         number;
  totalLabsInLevel: number;
  hasPhase2:        boolean;
  lessons:          LessonWithSims[];
  apiKey:           string;
  verbose?:         boolean;
}): Promise<GeneratedLabContent> {
  const {
    labId, labTitle, trackId, trackName, level,
    labIndex, totalLabsInLevel, hasPhase2, lessons, apiKey, verbose,
  } = params;

  if (verbose) console.log(`  [lab] Generating aggregate sims for ${labTitle}...`);
  const aggregateScenarios = await generateAggregateSimulations(
    labId, labTitle, trackName, lessons, apiKey,
  );

  if (verbose) console.log(`  [lab] Generating boss mode for ${labTitle}...`);
  const bossMode = await generateBossMode(
    labId, labTitle, trackName, level,
    labIndex, totalLabsInLevel, hasPhase2, lessons, apiKey,
  );

  const simTypes = collectSimTypes(lessons);

  return {
    labId,
    labTitle,
    aggregateSimulations: {
      count: 15,
      simulatorTypes: simTypes,
      description: `No labels, no hints — random draw from all ${labTitle} lessons`,
      scoringMode: 'full-rubric',
      unlockCondition: 'all-lessons-complete',
      scenarios: aggregateScenarios,
    },
    bossMode,
  };
}

// ── TypeScript formatter ───────────────────────────────────────────────────────

export function formatAggregateAsTypeScript(content: GeneratedLabContent): string {
  const { aggregateSimulations: a } = content;

  const scenarios = a.scenarios.map(s => {
    const criteria = s.scoringCriteria.map(c => `          \`${c.replace(/`/g, "'")}\`,`).join('\n');
    return `        {
          scenarioId: \`${s.scenarioId}\`,
          type: \`${s.type}\`,
          conceptSource: \`${s.conceptSource.replace(/`/g, "'")}\`,
          scenario: \`${s.scenario.replace(/`/g, "'")}\`,
          scoringCriteria: [
${criteria}
          ],
        }`;
  }).join(',\n');

  const types = a.simulatorTypes.map(t => `      '${t}'`).join(',\n');

  return `  aggregateSimulations: {
    count: ${a.count},
    simulatorTypes: [
${types},
    ],
    description: \`${a.description}\`,
    scoringMode: '${a.scoringMode}',
    unlockCondition: '${a.unlockCondition}',
    scenarios: [
${scenarios},
    ],
  },`;
}

export function formatBossModeAsTypeScript(content: GeneratedLabContent): string {
  const { bossMode: b } = content;

  const formatScenarios = (scenarios: BossScenario[]) =>
    scenarios.map(s => {
      const criteria = s.scoringCriteria.map(c => `          \`${c.replace(/`/g, "'")}\`,`).join('\n');
      return `      {
        id: \`${s.id}\`,
        phase: ${s.phase},
        situation: \`${s.situation.replace(/`/g, "'")}\`,
        question: \`${s.question.replace(/`/g, "'")}\`,
        scoringCriteria: [
${criteria}
        ],
      }`;
    }).join(',\n');

  let out = `  bossMode: {
    title: \`${b.title.replace(/`/g, "'")}\`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: true,
        message: \`${b.phase1.feedbackFormat.message}\`,
      },
      scenarios: [
${formatScenarios(b.phase1.scenarios)}
      ],
    },`;

  if (b.phase2) {
    const p2 = b.phase2;
    out += `
    phase2: {
      hintsEnabled: false,
      portfolioPush: true,
      confirmationScreen: \`${p2.confirmationScreen.replace(/`/g, "'")}\`,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: false,
        message: \`${p2.feedbackFormat.message.replace(/`/g, "'")}\`,
      },
      prerequisiteFloor: {
        guidedPracticeAverage: ${p2.prerequisiteFloor.guidedPracticeAverage},
        lessonSimulationAverage: ${p2.prerequisiteFloor.lessonSimulationAverage},
        aggregateSimulationsCompleted: ${p2.prerequisiteFloor.aggregateSimulationsCompleted},
      },
      onPass: {
        xpAwarded: ${p2.onPass.xpAwarded},
        badgeEarned: \`${p2.onPass.badgeEarned.replace(/`/g, "'")}\`,
        message: \`${p2.onPass.message.replace(/`/g, "'")}\`,
      },
      expertMode: {
        enabled: ${p2.expertMode.enabled},
        description: \`${p2.expertMode.description.replace(/`/g, "'")}\`,
      },
      scenarios: [
${formatScenarios(p2.scenarios)}
      ],
    },`;
  }

  out += `\n  },`;
  return out;
}

export function formatInterviewModeAsTypeScript(mode: InterviewMode): string {
  const questions = mode.questions.map(q => {
    const criteria = q.scoringCriteria.map(c => `      \`${c.replace(/`/g, "'")}\`,`).join('\n');
    return `  {
    id: \`${q.id}\`,
    type: '${q.type}',
    question: \`${q.question.replace(/`/g, "'")}\`,
    ${q.context ? `context: \`${q.context.replace(/`/g, "'")}\`,` : ''}
    scoringCriteria: [
${criteria}
    ],
    timeGuidance: \`${q.timeGuidance}\`,
    labSource: \`${q.labSource.replace(/`/g, "'")}\`,
  }`;
  }).join(',\n');

  return `export const ${mode.level.toUpperCase()}_INTERVIEW: InterviewMode = {
  level: '${mode.level}',
  roleName: \`${mode.roleName}\`,
  totalQuestions: ${mode.totalQuestions},
  structure: \`${mode.structure.replace(/`/g, "'")}\`,
  questions: [
${questions}
  ],
  onPass: {
    xpAwarded: ${mode.onPass.xpAwarded},
    badgeEarned: \`${mode.onPass.badgeEarned.replace(/`/g, "'")}\`,
    message: \`${mode.onPass.message.replace(/`/g, "'")}\`,
    unlocksLevel: \`${mode.onPass.unlocksLevel}\`,
  },
};`;
}

// Re-export what the CLI needs
export { collectSimTypes };
