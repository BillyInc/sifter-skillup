"""
deterministic_score.py
Sifter SkillUp — Deterministic answer scoring engine (Python port)

Shared by: interview_routes.py, boss_routes.py, community_routes.py (/api/ai/score)

Mirrors the TypeScript deterministicScorer.ts logic exactly.
Zero external dependencies. Zero API calls.

SCORING TYPES:
  calculation  — criterion encodes an explicit formula result (X × Y = Z%)
  number_match — criterion contains specific numbers that must appear in answer
  keyword      — criterion names domain concepts user must address
  quality      — qualitative judgment; checks response quality signals

USAGE:
  from deterministic_score import score_response, score_criterion
"""

import re
from typing import List, Dict, Any

# ─── Patterns ─────────────────────────────────────────────────────────────────

NUM_PATTERN = re.compile(
    r'\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)([%MKB])?'
)
CALCULATION_PATTERN = re.compile(r'[×x\*]\s*[\d.%$]+\s*=\s*[\d.,]+', re.IGNORECASE)
RATIO_PATTERN = re.compile(r'\$?[\d.,]+\s*/\s*\$?[\d.,]+\s*=\s*[\d.]+%?')
SUBTRACTION_PATTERN = re.compile(r'\$?[\d.,]+\s*[-–]\s*\$?[\d.,]+\s*=\s*\$?[\d.,]+')

DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    'utilisation': ['utilisation', 'utilization', 'utilization rate'],
    'health_factor': ['health factor', 'hf'],
    'liquidation': ['liquidat'],
    'cairo': ['felt252', 'u256', 'contractaddress', 'storage', 'snforge'],
    'zk': ['stark proof', 'validity proof', 'zero-knowledge', 'prover'],
    'governance': ['governance', 'voting', 'proposal', 'quorum'],
    'amm': ['xy=k', 'constant product', 'impermanent loss', 'price impact'],
    'tokenomics': ['fdv', 'vesting', 'emission', 'supply', 'dilution'],
    'oracle': ['oracle', 'pragma', 'price feed', 'twap'],
    'sei': ['checks-effects', 'cei', 'reentrancy', 'reentrant'],
    'staking': ['stake', 'staking', 'validator', 'delegation'],
    'defi': ['protocol', 'tvl', 'yield', 'apy', 'apr', 'lending', 'borrowing'],
    'research': ['hypothesis', 'thesis', 'on-chain', 'dune', 'defillama'],
}


def extract_numbers(text: str) -> List[float]:
    """Extract numeric values from text, normalising % and M/K/B suffixes."""
    results = []
    for m in NUM_PATTERN.finditer(text):
        try:
            val = float(m.group(1).replace(',', ''))
            suffix = m.group(2) or ''
            if suffix == 'M':
                val *= 1_000_000
            elif suffix == 'K':
                val *= 1_000
            elif suffix == 'B':
                val *= 1_000_000_000
            if suffix == '%':
                results.append(val)
                results.append(val / 100)
            else:
                results.append(val)
        except (ValueError, AttributeError):
            pass
    return results


def numbers_match(a: float, b: float, tol: float = 0.02) -> bool:
    """Check if two numbers match within relative tolerance."""
    if b == 0:
        return abs(a) < 0.001
    return abs(a - b) / max(abs(b), 0.0001) <= tol


def tolerance_for(criterion: str, value: float) -> float:
    """Return appropriate tolerance based on criterion type and magnitude."""
    if '%' in criterion:
        return 0.02
    if value > 1_000_000:
        return 0.005
    if value > 1_000:
        return 0.01
    return 0.05


def classify_criterion(criterion: str) -> str:
    """Classify criterion as calculation / number_match / keyword / self_assess."""
    if CALCULATION_PATTERN.search(criterion) or RATIO_PATTERN.search(criterion) or SUBTRACTION_PATTERN.search(criterion):
        return 'calculation'
    nums = [n for n in extract_numbers(criterion) if n > 1]
    if nums and re.search(r'\d+\.?\d*%|\$[\d,]+|[\d,]{4,}', criterion):
        return 'number_match'
    lower = criterion.lower()
    if any(kw in lower for kws in DOMAIN_KEYWORDS.values() for kw in kws):
        return 'keyword'
    return 'self_assess'


def score_criterion(criterion: str, answer: str) -> Dict[str, Any]:
    """Score a single criterion against a user answer. Returns criterion result dict."""
    ctype = classify_criterion(criterion)
    answer_nums = extract_numbers(answer)

    # ── Calculation type ──────────────────────────────────────────────────────
    if ctype == 'calculation':
        # Find the result after "="
        m = re.search(r'=\s*(\$?[\d,]+\.?\d*%?)\s*$', criterion)
        if m:
            raw = m.group(1).replace('$', '').replace(',', '')
            is_pct = raw.endswith('%')
            try:
                expected = float(raw.replace('%', ''))
                tol = 0.015 if is_pct else 0.01
                matched = any(numbers_match(n, expected, tol) for n in answer_nums)
                if is_pct:
                    matched = matched or any(numbers_match(n, expected / 100, tol) for n in answer_nums)
                return {
                    'criterion': criterion,
                    'passed': matched,
                    'feedback': f'✓ Correct result {expected}{"%" if is_pct else ""}' if matched
                               else f'✗ Expected {expected}{"%" if is_pct else ""}. Recalculate.',
                    'type': 'calculation',
                }
            except ValueError:
                pass
        # Fall through to number_match

    # ── Number match type ─────────────────────────────────────────────────────
    if ctype in ('calculation', 'number_match'):
        crit_nums = [n for n in extract_numbers(criterion) if n > 0.001]
        sig_nums = sorted([n for n in crit_nums if n > 1], reverse=True)
        if sig_nums:
            target = sig_nums[0]
            tol = tolerance_for(criterion, target)
            matched = any(numbers_match(n, target, tol) for n in answer_nums)
            return {
                'criterion': criterion,
                'passed': matched,
                'feedback': f'✓ Value {target} found.' if matched
                           else f'✗ Include the value {target} in your answer.',
                'type': 'number_match',
            }

    # ── Keyword type ──────────────────────────────────────────────────────────
    if ctype == 'keyword':
        lower_answer = answer.lower()
        crit_lower = criterion.lower()
        required = [kw for kws in DOMAIN_KEYWORDS.values() for kw in kws if kw in crit_lower]
        if required:
            found = [kw for kw in required if kw.lower() in lower_answer]
            threshold = max(1, int(len(required) * 0.6))
            passed = len(found) >= threshold
            return {
                'criterion': criterion,
                'passed': passed,
                'feedback': f'✓ Key concepts addressed: {", ".join(found[:3])}.' if passed
                           else f'✗ Address: {", ".join(required[:3])}.',
                'type': 'keyword',
            }

    # ── Self-assess fallback ──────────────────────────────────────────────────
    # Qualitative criteria that cannot be deterministically scored are marked
    # as self_assess — matching the TypeScript CriterionResult interface exactly.
    # The frontend renders these as rubric checkboxes the user self-marks.
    word_count = len(answer.split())
    has_numbers = bool(answer_nums)
    has_specifics = bool(re.search(r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+|0x[0-9a-fA-F]+|\d+\.\d+', answer))
    quality_signals = sum([
        word_count >= 40,
        has_numbers,
        has_specifics,
        len(answer) >= 200,
    ])
    # Auto-pass if the response meets the minimum quality gate (sufficient length + specifics)
    # User must still self-assess the rubric criteria themselves
    auto_passed = quality_signals >= 2
    return {
        'criterion': criterion,
        'passed': auto_passed,
        'feedback': '✓ Response meets quality threshold — review rubric criteria below.' if auto_passed
                   else '✗ Add more specific detail, numbers, and named concepts.',
        'type': 'self_assess',
        'selfAssessRequired': True,
    }


def score_response(answer: str, criteria: List[str]) -> Dict[str, Any]:
    """
    Score a complete answer against a list of criteria.

    Returns:
        {
          criteriaResults: [...],
          score: int,
          total: int,
          passed: bool,
          overallFeedback: str,
          xpEarned: int,
        }
    """
    if not criteria:
        word_count = len(answer.split())
        passed = word_count >= 30
        return {
            'criteriaResults': [{
                'criterion': 'Minimum response quality',
                'passed': passed,
                'feedback': f'Word count: {word_count}',
                'type': 'self_assess',
                'selfAssessRequired': True,
            }],
            'score': 1 if passed else 0,
            'total': 1,
            'passed': passed,
            'overallFeedback': 'Response recorded.' if passed else 'Please provide a more complete answer.',
            'xpEarned': 50 if passed else 0,
        }

    results = [score_criterion(c, answer) for c in criteria]
    score = sum(1 for r in results if r['passed'])
    total = len(results)
    pct = score / total if total > 0 else 0
    passed = pct >= 0.6
    xp = round((pct * 150) / 10) * 10

    if pct == 1.0:
        overall = 'All criteria met. Strong response.'
    elif pct >= 0.7:
        overall = f'{score} of {total} criteria met. Good response with minor gaps.'
    elif pct >= 0.5:
        overall = f'{score} of {total} criteria met. Review the missed criteria and revise.'
    else:
        overall = f'{score} of {total} criteria met. Response is missing key calculations or concepts.'

    return {
        'criteriaResults': results,
        'score': score,
        'total': total,
        'passed': passed,
        'overallFeedback': overall,
        'xpEarned': xp,
    }


def extract_criteria_from_task(task_text: str) -> List[str]:
    """
    Extract scoring criteria from a Phase 1 boss task string.
    Used when tasks don't have explicit scoringCriteria arrays.
    """
    criteria = []

    # Explicit Calculate prompt
    calc_match = re.search(r'[Cc]alculate[:\s]+([^.]+)', task_text)
    if calc_match:
        items = re.split(r'[,;]', calc_match.group(1))
        criteria.extend([f'Calculate {item.strip()}' for item in items if len(item.strip()) > 3])

    # Number contexts
    number_contexts = re.findall(
        r'(\w[\w\s]*(?:APY|LTV|utilisation|utilization|health factor|price|balance|cost|ratio|impact|spread|yield)[^.!?]*[\d.]+[%$]?)',
        task_text, re.IGNORECASE
    )
    for ctx in number_contexts[:3]:
        if 10 < len(ctx.strip()) < 120:
            criteria.append(ctx.strip())

    # Conceptual prompts
    explain_matches = re.findall(r'(?:Explain|Why|What is|Describe|Define)\s+([^.?!]+)', task_text, re.IGNORECASE)
    for m in explain_matches[:2]:
        if 15 < len(m) < 150:
            criteria.append(m.strip())

    # Working required
    if re.search(r'show your working|show working|step.by.step', task_text, re.IGNORECASE):
        criteria.append('Working shown — includes intermediate calculation steps and final numeric answer')

    # Fallback
    if not criteria:
        criteria.extend([
            'Response is specific — addresses the exact scenario, not a generic answer',
            'Response includes at least one specific number or concrete example from the scenario',
        ])

    return criteria[:5]
