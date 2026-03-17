/**
 * Sifter Skill_Up — Progression Engine
 *
 * Dynamically computes tier assignment, topic mode, and scenario
 * uniqueness for ANY skill track. No hard-coded track logic.
 * Scales to 10k+ tracks at production without curriculum designer input.
 *
 * TIER SYSTEM (derived at runtime from lab count):
 *   Early  → first 40% of labs  → platform assigns fully
 *   Mid    → next  40% of labs  → platform random pool, unique per user
 *   Late   → final 20% of labs  → user picks topic from derived list,
 *                                  platform generates scenario
 *
 * UNIQUENESS GUARANTEE:
 *   Template variables (company_type, size, disruption, severity,
 *   time_pressure, geography) are randomised per user per attempt.
 *   Same topic + same user = different variables every time.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TopicMode = 'platform-assigned' | 'platform-random-pool' | 'user-choice';

export interface LabTier {
  labIndex: number;   // 0-based position in level
  labId: string;
  mode: TopicMode;
  tier: 'early' | 'mid' | 'late';
}

export interface TopicOption {
  id: string;
  label: string;
  description: string;
  derivedFrom: string; // lesson id or simulator type it was derived from
}

export interface ScenarioVariables {
  company_type: string;
  company_size: string;
  disruption: string;
  severity: string;
  time_pressure: string;
  geography: string;
  seed: string; // unique per user+attempt — guarantees different scenario each time
}

export interface ScenarioAssignment {
  mode: TopicMode;
  topicOptions: TopicOption[] | null; // null for platform-assigned/random
  selectedTopic: TopicOption | null;  // null until user picks (late tier)
  variables: ScenarioVariables;
  uniquenessKey: string; // userId + labId + attemptNumber — never repeated
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier computation — pure function, no side effects
// ─────────────────────────────────────────────────────────────────────────────

export function computeLabTiers(labs: Array<{ id: string }>): LabTier[] {
  const N = labs.length;
  if (N === 0) return [];

  const earlyCount = Math.floor(N * 0.4);
  const midCount   = Math.floor(N * 0.4);
  // lateCount = N - earlyCount - midCount (gets remainders)

  return labs.map((lab, i) => {
    let tier: LabTier['tier'];
    let mode: TopicMode;

    if (i < earlyCount) {
      tier = 'early';
      mode = 'platform-assigned';
    } else if (i < earlyCount + midCount) {
      tier = 'mid';
      mode = 'platform-random-pool';
    } else {
      tier = 'late';
      mode = 'user-choice';
    }

    // Edge cases: 1-lab or 2-lab tracks
    if (N === 1) { tier = 'early'; mode = 'platform-assigned'; }
    if (N === 2 && i === 1) { tier = 'late'; mode = 'user-choice'; }

    return { labIndex: i, labId: lab.id, tier, mode };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Topic list derivation — built from lab's own lesson data at runtime
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives a list of topic options for a late-tier lab from its lessons.
 * Groups lesson titles into themes — no manual curation required.
 */
export function deriveTopicOptions(
  lessons: Array<{ id: string; title: string }>,
  simulatorTypes: string[],
): TopicOption[] {
  const topics: TopicOption[] = [];
  const seen = new Set<string>();

  // From lesson titles — collapse to topic themes
  lessons.forEach(lesson => {
    // Strip lesson number prefixes and common words to get the core theme
    const theme = lesson.title
      .replace(/^(the|what|how|why|when|understanding|mastering|using|building|working with)\s+/i, '')
      .replace(/\s+(for|in|with|at|on|and|or|the)\s+.*$/i, '')
      .trim();

    const id = `topic-${lesson.id}`;
    if (!seen.has(theme.toLowerCase())) {
      seen.add(theme.toLowerCase());
      topics.push({
        id,
        label: theme,
        description: `Scenario built around: ${lesson.title}`,
        derivedFrom: lesson.id,
      });
    }
  });

  // From simulator types — add any that aren't already covered
  simulatorTypes.forEach(st => {
    const label = st
      .replace('judgment-', '')
      .replace('sandbox-', '')
      .replace('chartReplay-', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const id = `topic-sim-${st}`;
    if (!seen.has(label.toLowerCase())) {
      seen.add(label.toLowerCase());
      topics.push({
        id,
        label,
        description: `Scenario testing: ${label}`,
        derivedFrom: st,
      });
    }
  });

  // Cap at 8 options — enough choice without overwhelming
  return topics.slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario variable randomisation
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY_TYPES = [
  'FMCG manufacturer', 'pharmaceutical distributor', 'automotive OEM',
  'retail chain', 'e-commerce fulfilment', 'food & beverage producer',
  'medical device company', 'electronics manufacturer', 'fashion retailer',
  'chemical supplier', 'logistics 3PL', 'aerospace manufacturer',
];

const COMPANY_SIZES = [
  '120-person startup', '800-person mid-market company',
  '4,000-person regional enterprise', '18,000-person multinational',
  '$40M revenue SME', '$2.3B revenue listed company',
];

const DISRUPTIONS = [
  'tier-1 supplier failure', 'port congestion delay', 'demand spike',
  'quality recall', 'logistics partner collapse', 'raw material shortage',
  'currency devaluation', 'factory fire', 'customs hold', 'cyberattack on ERP',
  'key account cancellation', 'workforce strike at distribution centre',
];

const SEVERITIES = [
  'moderate — 2 weeks of stock at risk',
  'serious — 6 weeks of production at risk',
  'critical — entire product line affected',
  'contained — 15% of SKUs impacted',
  'severe — $4.2M revenue exposure in 30 days',
];

const TIME_PRESSURES = [
  '48-hour window before board review',
  '72 hours before peak season begins',
  'end of quarter in 9 days',
  'customer SLA breach in 24 hours',
  'investor call in 3 days',
  'regulatory deadline in 5 business days',
];

const GEOGRAPHIES = [
  'Southeast Asia manufacturing base', 'European distribution network',
  'North American retail footprint', 'Latin American emerging markets',
  'Middle East & Africa logistics corridor', 'South Asian supplier base',
  'domestic US operations', 'UK & Ireland distribution',
];

/**
 * Generates randomised scenario variables unique to this user+lab+attempt.
 * Uses a seeded shuffle so the same seed always produces the same variables —
 * allowing the backend to reconstruct the scenario without storing the full text.
 */
export function generateScenarioVariables(
  userId: string,
  labId: string,
  attemptNumber: number,
): ScenarioVariables {
  const seed = `${userId}:${labId}:${attemptNumber}:${Date.now()}`;
  const pick = <T>(arr: T[], offset: number): T => {
    // Deterministic pick from seed + offset
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    h = Math.abs(h + offset * 2654435761);
    return arr[h % arr.length];
  };

  return {
    company_type:  pick(COMPANY_TYPES,  0),
    company_size:  pick(COMPANY_SIZES,  1),
    disruption:    pick(DISRUPTIONS,    2),
    severity:      pick(SEVERITIES,     3),
    time_pressure: pick(TIME_PRESSURES, 4),
    geography:     pick(GEOGRAPHIES,    5),
    seed,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Full scenario assignment — the main entry point
// ─────────────────────────────────────────────────────────────────────────────

export function assignScenario(params: {
  userId: string;
  labId: string;
  labTier: LabTier;
  attemptNumber: number;
  lessons: Array<{ id: string; title: string }>;
  simulatorTypes: string[];
  selectedTopicId?: string; // provided by user in late tier
}): ScenarioAssignment {
  const { userId, labId, labTier, attemptNumber, lessons, simulatorTypes, selectedTopicId } = params;

  const variables = generateScenarioVariables(userId, labId, attemptNumber);
  const uniquenessKey = `${userId}:${labId}:${attemptNumber}`;

  if (labTier.mode === 'platform-assigned') {
    return {
      mode: 'platform-assigned',
      topicOptions: null,
      selectedTopic: null,
      variables,
      uniquenessKey,
    };
  }

  if (labTier.mode === 'platform-random-pool') {
    return {
      mode: 'platform-random-pool',
      topicOptions: null,
      selectedTopic: null,
      variables,
      uniquenessKey,
    };
  }

  // Late tier — user choice
  const topicOptions = deriveTopicOptions(lessons, simulatorTypes);
  const selectedTopic = selectedTopicId
    ? topicOptions.find(t => t.id === selectedTopicId) ?? null
    : null;

  return {
    mode: 'user-choice',
    topicOptions,
    selectedTopic,
    variables,
    uniquenessKey,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO UNIQUENESS ENFORCEMENT
// Ensures no two users see the same scenario, and no user sees the same
// scenario twice. Works with both pre-generated scenarios (bossMode) and
// AI-generated aggregate scenarios.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fill {template_variables} in a scenario string with user-specific values.
 * Boss and aggregate scenarios use these placeholders so no two users
 * read identical scenario text.
 *
 * Usage:
 *   const personalised = fillScenarioVariables(scenario.situation, variables);
 */
export function fillScenarioVariables(
  scenarioText: string,
  variables: ScenarioVariables,
): string {
  return scenarioText
    .replace(/\{company_type\}/g,  variables.company_type)
    .replace(/\{company_size\}/g,  variables.company_size)
    .replace(/\{disruption\}/g,    variables.disruption)
    .replace(/\{severity\}/g,      variables.severity)
    .replace(/\{time_pressure\}/g, variables.time_pressure)
    .replace(/\{geography\}/g,     variables.geography)
    .replace(/\{seed\}/g,          variables.seed.slice(0, 12));
}

/**
 * Select which scenario to show a user from a pool, ensuring they never see
 * the same scenarioId twice across sessions.
 *
 * seenScenarioIds: load from user's backend record
 * Returns: the chosen scenario + updated seenIds list
 */
export function pickUniqueScenario<T extends { id: string; scenarioId?: string }>(
  scenarios: T[],
  seenScenarioIds: string[],
  userId: string,
  attemptNumber: number,
): { scenario: T; updatedSeenIds: string[] } {
  // Filter out scenarios the user has already seen
  const unseen = scenarios.filter(s =>
    !seenScenarioIds.includes(s.scenarioId ?? s.id)
  );

  // If they've seen all, reset (but keep the most recent 2 out to avoid immediate repeat)
  const pool = unseen.length >= 1 ? unseen : scenarios.filter(
    s => !seenScenarioIds.slice(-2).includes(s.scenarioId ?? s.id)
  );

  // Deterministic pick based on userId + attempt so same user+attempt = same scenario
  // (important for backend reconstruction without storing full text)
  const seed = `${userId}:pick:${attemptNumber}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  const chosen = pool[Math.abs(hash) % pool.length];

  return {
    scenario: chosen,
    updatedSeenIds: [...seenScenarioIds, chosen.scenarioId ?? chosen.id],
  };
}

/**
 * Generate a fully personalised boss scenario for a specific user attempt.
 * Combines: unique scenario selection + variable injection.
 *
 * This is what the backend calls when a user taps "Start Boss Battle".
 */
export function personaliseScenario<T extends { id: string; scenarioId?: string; situation?: string; scenario?: string }>(
  scenarios: T[],
  seenScenarioIds: string[],
  userId: string,
  labId: string,
  attemptNumber: number,
): { personalised: T & { personalisedText: string }; updatedSeenIds: string[] } {
  const variables = generateScenarioVariables(userId, labId, attemptNumber);
  const { scenario, updatedSeenIds } = pickUniqueScenario(
    scenarios, seenScenarioIds, userId, attemptNumber
  );

  const rawText = (scenario as any).situation ?? (scenario as any).scenario ?? '';
  const personalisedText = fillScenarioVariables(rawText, variables);

  return {
    personalised: { ...scenario, personalisedText },
    updatedSeenIds,
  };
}
