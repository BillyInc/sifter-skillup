/**
 * deterministicScorer.ts
 *
 * Zero-API scoring engine for all judgment simulations.
 * Replaces Claude scoring with deterministic checks anchored to authored criteria.
 *
 * Works with EXISTING string[] scoringCriteria format — no lesson data migration needed.
 *
 * Criterion auto-classification algorithm:
 *   TYPE: number_match  → criterion contains a number that should appear in user response
 *   TYPE: calculation   → criterion encodes an explicit formula result (X × Y = Z)
 *   TYPE: keyword       → criterion names domain concepts user must address
 *   TYPE: self_assess   → qualitative judgment; uses rubric-reveal + honesty gate
 *
 * All types are deterministic and inspectable. No randomness, no hallucination.
 */

export type CriterionAutoType =
  | 'number_match'
  | 'calculation'
  | 'keyword'
  | 'self_assess';

export interface ParsedCriterion {
  original: string;                  // verbatim from lesson data
  type: CriterionAutoType;
  expectedNumbers: number[];         // extracted expected values (may be empty)
  tolerance: number;                 // fractional tolerance for number matching
  requiredKeywords: string[];        // all must appear (case-insensitive)
  anyKeywords: string[];             // at least one must appear
  description: string;               // human-readable explanation
}

export interface CriterionResult {
  criterion: string;                 // original text
  passed: boolean;
  feedback: string;
  type: CriterionAutoType;
  selfAssessRequired: boolean;       // if true, pending user confirmation
}

export interface DeterministicScoringResult {
  criteriaResults: CriterionResult[];
  selfAssessCount: number;           // number of criteria requiring human confirmation
  autoPassCount: number;             // number auto-passed
  autoFailCount: number;             // number auto-failed
  score: number;                     // auto-scored only (excludes pending self-assess)
  total: number;
  xpEarned: number;
  overallFeedback: string;
}

// ─── Number extraction helpers ─────────────────────────────────────────────────

const NUM_PATTERN = /\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)(%|M|K|B)?/g;

function extractNumbers(text: string): number[] {
  const results: number[] = [];
  const matches = text.matchAll(NUM_PATTERN);
  for (const m of matches) {
    let val = parseFloat(m[1].replace(/,/g, ''));
    if (isNaN(val)) continue;
    const suffix = m[2];
    if (suffix === 'M') val *= 1_000_000;
    if (suffix === 'K') val *= 1_000;
    if (suffix === 'B') val *= 1_000_000_000;
    if (suffix === '%') {
      // store both raw percentage value AND decimal form
      results.push(val);          // e.g. 82 for "82%"
      results.push(val / 100);    // e.g. 0.82
    } else {
      results.push(val);
    }
  }
  return results;
}

function numbersMatch(a: number, b: number, tolerance: number): boolean {
  if (b === 0) return Math.abs(a) < 0.001;
  return Math.abs(a - b) / Math.max(Math.abs(b), 0.0001) <= tolerance;
}

// ─── Domain keyword sets for Starknet/DeFi topics ─────────────────────────────

const KEYWORD_SIGNALS: Record<string, string[]> = {
  utilization:  ['utilisation', 'utilization', 'borrowed', 'deposited', 'pool'],
  liquidation:  ['liquidation', 'liquidate', 'health factor', 'collateral', 'ltv'],
  amm:          ['xy=k', 'constant product', 'impermanent loss', 'price impact', 'liquidity'],
  zk:           ['stark proof', 'zero-knowledge', 'validity proof', 'cairo vm', 'prover'],
  governance:   ['governance', 'voting', 'proposal', 'quorum', 'delegate'],
  security:     ['reentrancy', 'access control', 'overflow', 'stride', 'vulnerability'],
  tokenomics:   ['vesting', 'emission', 'supply', 'inflation', 'unlock', 'fdv'],
  defi:         ['protocol', 'tvl', 'yield', 'apy', 'apr', 'staking', 'lending', 'borrowing'],
  cairo:        ['felt252', 'u256', 'contractaddress', 'storage', 'trait', 'impl', 'snforge'],
  research:     ['hypothesis', 'thesis', 'data source', 'on-chain', 'dune', 'reproducible'],
};

function extractKeywordsFromCriterion(criterion: string): string[] {
  const lower = criterion.toLowerCase();
  const found: string[] = [];

  // Extract named concepts (capitalised multi-word phrases are domain terms)
  const named = criterion.match(/[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*/g) ?? [];
  for (const n of named) {
    if (n.length > 4) found.push(n.toLowerCase());
  }

  // Extract quoted or emphasised terms
  const quoted = criterion.match(/'([^']+)'|"([^"]+)"/g) ?? [];
  for (const q of quoted) found.push(q.replace(/['"]/g, '').toLowerCase());

  // Add domain terms if the criterion mentions the domain
  for (const [, terms] of Object.entries(KEYWORD_SIGNALS)) {
    if (terms.some(t => lower.includes(t))) {
      // Add the specific matching terms as required
      found.push(...terms.filter(t => lower.includes(t)));
    }
  }

  // Deduplicate, filter very short words
  return [...new Set(found)].filter(k => k.length > 3);
}

// ─── Criterion type classifier ─────────────────────────────────────────────────

const CALCULATION_PATTERN = /[×x\*]\s*[\d.%$]+\s*=\s*[\d.,]+/i;
const RATIO_PATTERN = /\$?[\d.,]+\s*\/\s*\$?[\d.,]+\s*=\s*[\d.]+%?/;
const SUBTRACTION_PATTERN = /\$?[\d.,]+\s*[-–]\s*\$?[\d.,]+\s*=\s*\$?[\d.,]+/;

function classifyCriterion(criterion: string): CriterionAutoType {
  // Has explicit calculation with result
  if (CALCULATION_PATTERN.test(criterion)) return 'calculation';
  if (RATIO_PATTERN.test(criterion)) return 'calculation';
  if (SUBTRACTION_PATTERN.test(criterion)) return 'calculation';

  // Has specific numbers that must appear in response
  const nums = extractNumbers(criterion);
  const hasMeaningfulNumbers = nums.some(n => n > 1 && n !== 100);
  if (hasMeaningfulNumbers && criterion.match(/\d+\.?\d*%|\$[\d,]+|[\d,]{4,}/)) {
    return 'number_match';
  }

  // Has domain keyword requirements
  const lower = criterion.toLowerCase();
  const hasDomainKeywords = Object.values(KEYWORD_SIGNALS).some(
    terms => terms.some(t => lower.includes(t))
  );
  if (hasDomainKeywords) return 'keyword';

  // Default: qualitative judgment — rubric-reveal self-assessment
  return 'self_assess';
}

// ─── Tolerance by criterion type and magnitude ────────────────────────────────

function toleranceFor(criterion: string, value: number): number {
  // Percentage figures: allow ±1.5 percentage points
  if (criterion.includes('%')) return 0.02;  // 2% relative tolerance
  // Dollar amounts > $1M: allow ±0.5%
  if (value > 1_000_000) return 0.005;
  // Dollar amounts > $1K: allow ±1%
  if (value > 1_000) return 0.01;
  // Small numbers: allow ±5%
  return 0.05;
}

// ─── Auto-check: calculation criteria ─────────────────────────────────────────

function checkCalculation(criterion: string, response: string): CriterionResult {
  // Extract the RESULT of the calculation (the number after "=")
  const resultMatch = criterion.match(/=\s*(\$?[\d,]+\.?\d*%?)\s*$/);
  if (!resultMatch) {
    return checkNumberMatch(criterion, response);
  }

  const rawResult = resultMatch[1].replace(/[$,]/g, '');
  const isPercentage = rawResult.endsWith('%');
  const expectedValue = parseFloat(rawResult.replace('%', ''));

  if (isNaN(expectedValue)) {
    return { criterion, passed: false, feedback: 'Could not parse expected result.', type: 'calculation', selfAssessRequired: false };
  }

  const tol = toleranceFor(criterion, expectedValue);
  const responseNums = extractNumbers(response);

  const matched = responseNums.some(n => numbersMatch(n, expectedValue, tol));
  const matchedDecimal = isPercentage && responseNums.some(n => numbersMatch(n, expectedValue / 100, tol));

  const passed = matched || matchedDecimal;

  return {
    criterion,
    passed,
    feedback: passed
      ? `✓ Correct result ${isPercentage ? expectedValue + '%' : expectedValue} identified.`
      : `✗ Expected result: ${isPercentage ? expectedValue + '%' : expectedValue}. Check your calculation and include the result explicitly.`,
    type: 'calculation',
    selfAssessRequired: false,
  };
}

// ─── Auto-check: number_match criteria ────────────────────────────────────────

function checkNumberMatch(criterion: string, response: string): CriterionResult {
  const criterionNums = extractNumbers(criterion).filter(n => n > 0.001);
  if (criterionNums.length === 0) {
    return { criterion, passed: false, feedback: 'No reference numbers found in criterion.', type: 'number_match', selfAssessRequired: false };
  }

  const responseNums = extractNumbers(response);

  // Check that the most significant number in the criterion appears in response
  // "Most significant" = largest absolute value for financial criteria
  const significantNums = criterionNums.filter(n => n > 1).sort((a, b) => b - a);
  const primaryTarget = significantNums[0] ?? criterionNums[0];
  const tol = toleranceFor(criterion, primaryTarget);

  const matched = responseNums.some(n => numbersMatch(n, primaryTarget, tol));

  return {
    criterion,
    passed: matched,
    feedback: matched
      ? `✓ Required value ${primaryTarget} found in your response.`
      : `✗ Your response should include the value ${primaryTarget}. Include all calculated numbers.`,
    type: 'number_match',
    selfAssessRequired: false,
  };
}

// ─── Auto-check: keyword criteria ─────────────────────────────────────────────

// These are domain-specific terms that MUST appear in a correct answer.
// Compiled from Starknet/DeFi industry vocabulary.
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  'utilisation':     ['utilisation', 'utilization', 'utilization rate'],
  'health factor':   ['health factor', 'hf'],
  'impermanent loss': ['impermanent loss', 'il', 'divergence loss'],
  'reentrancy':      ['reentrancy', 're-entrancy', 'reentrant'],
  'oracle':          ['oracle', 'price feed', 'chainlink', 'pragma'],
  'stark proof':     ['stark proof', 'validity proof', 'zk proof', 'zero-knowledge proof'],
  'felt252':         ['felt252', 'field element'],
  'ltv':             ['ltv', 'loan to value', 'loan-to-value'],
  'liquidation':     ['liquidat'],  // prefix match
  'slippage':        ['slippage', 'price impact'],
  'amm':             ['amm', 'automated market maker', 'xy=k', 'constant product'],
  'kink':            ['kink', 'kink model', 'utilisation kink'],
  'reserve factor':  ['reserve factor'],
  'supply apy':      ['supply apy', 'supply rate'],
  'borrow apy':      ['borrow apy', 'borrow rate'],
  'fdv':             ['fdv', 'fully diluted valuation', 'fully diluted'],
  'vesting':         ['vesting', 'vest', 'cliff'],
  'governance':      ['governance', 'voting', 'proposal', 'dao'],
  'snforge':         ['snforge', 'scarb', 'cairo test'],
  'cei':             ['cei', 'checks-effects-interactions', 'checks effects interactions'],
};

function keywordPresent(keyword: string, text: string): boolean {
  const lower = text.toLowerCase();
  const synonyms = KEYWORD_SYNONYMS[keyword.toLowerCase()] ?? [keyword.toLowerCase()];
  return synonyms.some(syn => lower.includes(syn));
}

function checkKeyword(criterion: string, response: string): CriterionResult {
  const keywords = extractKeywordsFromCriterion(criterion);
  if (keywords.length === 0) {
    // No extractable keywords - fall through to self_assess
    return checkSelfAssess(criterion, response);
  }

  const responseLower = response.toLowerCase();
  const missing: string[] = [];
  const found: string[] = [];

  for (const kw of keywords.slice(0, 4)) {  // check up to 4 per criterion
    if (keywordPresent(kw, responseLower)) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  }

  // Pass if ≥ 60% of keywords are present
  const passThreshold = Math.ceil(keywords.slice(0, 4).length * 0.6);
  const passed = found.length >= passThreshold;

  return {
    criterion,
    passed,
    feedback: passed
      ? `✓ Key concepts addressed: ${found.join(', ')}.`
      : `✗ Response should address: ${missing.slice(0, 3).join(', ')}.`,
    type: 'keyword',
    selfAssessRequired: false,
  };
}

// ─── Self-assess: qualitative criteria ────────────────────────────────────────

function checkSelfAssess(criterion: string, response: string): CriterionResult {
  // For truly qualitative criteria, we return pending state.
  // The UI handles rubric-reveal and user confirmation.
  return {
    criterion,
    passed: false,  // starts as not-confirmed; UI sets to true on user check
    feedback: 'Review your response against this criterion and confirm whether you addressed it.',
    type: 'self_assess',
    selfAssessRequired: true,
  };
}

// ─── Main export: score a response against string[] criteria ──────────────────

export function scoreResponseDeterministic(
  userResponse: string,
  criteria: string[],
): DeterministicScoringResult {
  if (!criteria || criteria.length === 0) {
    return {
      criteriaResults: [],
      selfAssessCount: 0,
      autoPassCount: 0,
      autoFailCount: 0,
      score: 0,
      total: 0,
      xpEarned: 0,
      overallFeedback: 'No criteria provided.',
    };
  }

  const results: CriterionResult[] = criteria.map(criterion => {
    const type = classifyCriterion(criterion);
    switch (type) {
      case 'calculation':  return checkCalculation(criterion, userResponse);
      case 'number_match': return checkNumberMatch(criterion, userResponse);
      case 'keyword':      return checkKeyword(criterion, userResponse);
      case 'self_assess':  return checkSelfAssess(criterion, userResponse);
    }
  });

  const selfAssessCount = results.filter(r => r.selfAssessRequired).length;
  const autoResults    = results.filter(r => !r.selfAssessRequired);
  const autoPassCount  = autoResults.filter(r => r.passed).length;
  const autoFailCount  = autoResults.filter(r => !r.passed).length;

  const total = criteria.length;
  const score = autoPassCount;  // self-assess criteria added by UI after user confirms

  const pct = total > 0 ? score / total : 0;
  const xpEarned = Math.round((pct * 150) / 10) * 10;

  let overallFeedback = '';
  if (selfAssessCount > 0) {
    overallFeedback = `${autoPassCount} of ${autoResults.length} auto-checked criteria passed. ${selfAssessCount} criteria require your self-assessment below.`;
  } else if (pct === 1) {
    overallFeedback = 'All criteria met. Strong response.';
  } else if (pct >= 0.7) {
    overallFeedback = `${autoPassCount} of ${total} criteria met. Review the failed criteria and revise your calculation or reasoning.`;
  } else {
    overallFeedback = `${autoPassCount} of ${total} criteria met. Your response is missing key numbers or concepts. Re-read the scenario and include all required calculations.`;
  }

  return {
    criteriaResults: results,
    selfAssessCount,
    autoPassCount,
    autoFailCount,
    score,
    total,
    xpEarned,
    overallFeedback,
  };
}

/**
 * Finalise score after user self-assessment confirmation.
 * Call this when user has checked/unchecked self-assess checkboxes.
 *
 * @param partial   - result from scoreResponseDeterministic
 * @param confirmed - set of criterion indices the user confirmed as met
 */
export function finaliseWithSelfAssess(
  partial: DeterministicScoringResult,
  confirmed: Set<number>,
): DeterministicScoringResult {
  const updated = partial.criteriaResults.map((r, i) => {
    if (!r.selfAssessRequired) return r;
    const userConfirmed = confirmed.has(i);
    return {
      ...r,
      passed: userConfirmed,
      feedback: userConfirmed
        ? '✓ Self-confirmed as addressed.'
        : '✗ Not confirmed — review this criterion.',
    };
  });

  const totalPassed = updated.filter(r => r.passed).length;
  const pct = partial.total > 0 ? totalPassed / partial.total : 0;
  const xpEarned = Math.round((pct * 150) / 10) * 10;

  return {
    ...partial,
    criteriaResults: updated,
    score: totalPassed,
    xpEarned,
    overallFeedback:
      pct >= 0.8
        ? `${totalPassed}/${partial.total} criteria met. Excellent work.`
        : pct >= 0.6
        ? `${totalPassed}/${partial.total} criteria met. Review the criteria you missed.`
        : `${totalPassed}/${partial.total} criteria met. Re-read the scenario and try again.`,
  };
}

/**
 * Minimum input validation gates by judgment type.
 * Prevents zero-effort submissions from unlocking rubric reveal.
 */
export const INPUT_GATES: Record<string, (response: string) => { valid: boolean; message: string }> = {
  'judgment-dataInterpret': (r) => {
    const hasNumber = /\d+/.test(r);
    return {
      valid: hasNumber && r.trim().length >= 80,
      message: hasNumber
        ? 'Add more detail to your analysis.'
        : 'Your response must include at least one calculated number.',
    };
  },
  'judgment-riskAssess': (r) => {
    const hasTwoParagraphs = /\n\n|\n[^\n]/.test(r) || r.split(/\.\s+/).length >= 3;
    return {
      valid: hasTwoParagraphs && r.trim().length >= 100,
      message: 'Your risk assessment must address at least two separate risk factors.',
    };
  },
  'judgment-communication': (r) => {
    const wordCount = r.trim().split(/\s+/).length;
    return {
      valid: wordCount >= 30,
      message: `Your response must be at least 30 words. Currently: ${wordCount}.`,
    };
  },
  'judgment-riskAssess:boss': (r) => {
    const wordCount = r.trim().split(/\s+/).length;
    return {
      valid: wordCount >= 60,
      message: `Boss phase responses must be at least 60 words. Currently: ${wordCount}.`,
    };
  },
};

export function validateMinimumInput(
  type: string,
  response: string,
  isBoss = false,
): { valid: boolean; message: string } {
  const key = isBoss && INPUT_GATES[`${type}:boss`] ? `${type}:boss` : type;
  const gate = INPUT_GATES[key];
  if (!gate) {
    return { valid: response.trim().length >= 60, message: 'Please provide a more complete response.' };
  }
  return gate(response);
}
