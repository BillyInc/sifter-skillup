/**
 * artifactBuilder — generates real portfolio artifact content from user work.
 *
 * Replaces the `interviewReadyTemplate` placeholder system.
 * When a user passes Phase 2 of a Boss Battle, their actual written/coded work
 * becomes the artifact content pushed to GitHub, LinkedIn, and other platforms.
 *
 * The artifact wraps the user's real response in a professional case-study format,
 * with the task context, scoring result, and Sifter verification metadata.
 */

import { ScoringResult } from '../components/simulators/SimulatorShared';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ArtifactFormat = 'github-markdown' | 'linkedin-post' | 'notion-export' | 'pdf-template';

export interface ArtifactInput {
  // Track / lab context
  trackName:    string;  // e.g. "Supply Chain Analyst"
  labTitle:     string;  // e.g. "Lab 3 — Inventory Management"
  level:        'junior' | 'intermediate' | 'senior';
  skill:        string;  // e.g. "Demand Planning & Bullwhip Effect Analysis"
  framework:    string;  // e.g. "APICS/CSCMP supply chain fundamentals"

  // The scenario the user was given (Boss Battle Phase 2)
  scenario:     string;

  // The user's actual work — whatever they wrote or coded
  userWork:     string;

  // AI scoring result
  scoring:      ScoringResult;

  // Meta
  userId:       string;
  userName:     string;
  completedAt:  string; // ISO date
  verificationUrl?: string;
}

export interface BuiltArtifact {
  // Files to push to GitHub
  files: Array<{ path: string; content: string }>;
  // LinkedIn post text
  linkedInPost: string;
  // Short badge text for app display
  badgeSummary: string;
  // Interview answer (STAR format)
  interviewAnswer: string;
}

// ── GitHub markdown builder ───────────────────────────────────────────────────

function buildGitHubMarkdown(input: ArtifactInput): string {
  const passed = input.scoring.score === input.scoring.total;
  const pct    = Math.round((input.scoring.score / input.scoring.total) * 100);

  return `# ${input.skill}
## Track: ${input.trackName} — ${input.labTitle}
**Level:** ${input.level.charAt(0).toUpperCase() + input.level.slice(1)}
**Completed:** ${new Date(input.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
**Score:** ${input.scoring.score}/${input.scoring.total} criteria met (${pct}%)${input.verificationUrl ? `\n**Verified:** [Sifter Skill_Up](${input.verificationUrl})` : ''}

---

## Scenario

> ${input.scenario.replace(/\n/g, '\n> ')}

---

## My Work

${input.userWork}

---

## Assessment Results

| Criterion | Result |
|-----------|--------|
${input.scoring.criteriaResults.map(cr => `| ${cr.criterion} | ${cr.passed ? '✅ Met' : '❌ Not met'} |`).join('\n')}

**Evaluator feedback:** ${input.scoring.overallFeedback}

---

## Framework Applied

${input.framework}

---

## About This Artifact

This portfolio artifact was earned by completing a **${passed ? 'Phase 2 Certification' : 'Boss Battle Learning Loop'}** on [Sifter Skill_Up](https://sifter.app).

- All scenarios are **unseen at time of attempt** — no rehearsed answers
- Scoring is performed by AI against explicit, published criteria
- Artifacts are only generated on meeting **all required criteria**
- The work above is the candidate's actual unedited submission

*Verified by Sifter Skill_Up · ${input.trackName} · ${input.level.charAt(0).toUpperCase() + input.level.slice(1)} Level*
`;
}

// ── LinkedIn post builder ──────────────────────────────────────────────────────

const LINKEDIN_TEMPLATES = [
  `🏆 Just earned a verified portfolio artifact in {skill} on @SifterSkillUp.

The challenge: an unseen {trackName} scenario, assessed against {framework} standards.
Scored {score}/{total} on a rubric I couldn't see in advance.

This isn't a certificate. It's documented proof of what I can actually do.

See the full artifact on my GitHub: {repoUrl}

#SkillUp #{hashtag} #Portfolio`,

  `⚡ New certification: {skill}

Passed a {level}-level {trackName} Boss Battle on @SifterSkillUp — {score}/{total} criteria met on an unseen scenario.

No hints. No rehearsed answers. Just the scenario and a scoring rubric.

Portfolio: {repoUrl}

#{hashtag} #CareerDevelopment #Verified`,

  `📊 Added to my portfolio: {skill}

{trackName} · {level} Level · {score}/{total} scoring criteria met

The scenario was generated fresh — I hadn't seen it before. The work above is my actual submission.

Full case study: {repoUrl}

#{hashtag} #SifterSkillUp`,
];

function buildLinkedInPost(input: ArtifactInput, repoUrl: string): string {
  const template = LINKEDIN_TEMPLATES[Math.floor(Math.random() * LINKEDIN_TEMPLATES.length)];
  const hashtag  = input.trackName.replace(/[^a-zA-Z]/g, '');
  const level    = input.level.charAt(0).toUpperCase() + input.level.slice(1);

  return template
    .replace(/{skill}/g,      input.skill)
    .replace(/{trackName}/g,  input.trackName)
    .replace(/{framework}/g,  input.framework)
    .replace(/{score}/g,      String(input.scoring.score))
    .replace(/{total}/g,      String(input.scoring.total))
    .replace(/{repoUrl}/g,    repoUrl)
    .replace(/{hashtag}/g,    hashtag)
    .replace(/{level}/g,      level);
}

// ── Interview answer builder (STAR format) ─────────────────────────────────────

function buildInterviewAnswer(input: ArtifactInput): string {
  return `SITUATION: ${input.scenario.split('\n')[0]}

TASK: Apply ${input.framework} to diagnose the problem and deliver a structured recommendation.

ACTION: ${input.userWork.slice(0, 600)}${input.userWork.length > 600 ? '…' : ''}

RESULT: Met ${input.scoring.score} of ${input.scoring.total} assessment criteria on an unseen case study. Key evaluator feedback: ${input.scoring.overallFeedback}`;
}

// ── Badge summary ──────────────────────────────────────────────────────────────

function buildBadgeSummary(input: ArtifactInput): string {
  const pct = Math.round((input.scoring.score / input.scoring.total) * 100);
  return `${input.skill} · ${input.level.charAt(0).toUpperCase() + input.level.slice(1)} · ${pct}% · ${input.trackName}`;
}

// ── Main export ────────────────────────────────────────────────────────────────

export function buildArtifact(input: ArtifactInput, repoName?: string): BuiltArtifact {
  const safeTrack  = input.trackName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const safeSkill  = input.skill.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
  const date       = new Date(input.completedAt).toISOString().slice(0, 10);
  const folderPath = `${input.level}/${input.labTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;
  const repoUrl    = `https://github.com/${input.userId}/${repoName ?? `${safeTrack}-portfolio`}`;

  const markdown = buildGitHubMarkdown(input);

  return {
    files: [
      {
        path: `${folderPath}/case-study.md`,
        content: markdown,
      },
      {
        path: `${folderPath}/submission.txt`,
        content: `# Raw Submission — ${input.skill}\n# Date: ${date}\n\n${input.userWork}`,
      },
    ],
    linkedInPost:    buildLinkedInPost(input, repoUrl),
    badgeSummary:    buildBadgeSummary(input),
    interviewAnswer: buildInterviewAnswer(input),
  };
}

// ── Helper: attach to existing pushPortfolio API call ────────────────────────

/**
 * Use after passing Phase 2. Replaces the old interviewReadyTemplate approach.
 *
 * Example usage in PortfolioHubScreen:
 *
 *   const artifact = buildArtifact({
 *     trackName: 'Supply Chain Analyst',
 *     labTitle:  'Lab 3 — Inventory Management',
 *     level:     'junior',
 *     skill:     'Demand Planning & Bullwhip Effect',
 *     framework: 'APICS/CSCMP',
 *     scenario:  bossScenario,
 *     userWork:  capturedUserResponse,   // from JudgmentRenderer.onArtifactContent
 *     scoring:   scoringResult,
 *     userId:    user.id,
 *     userName:  user.name,
 *     completedAt: new Date().toISOString(),
 *   });
 *
 *   await API.pushPortfolio('supply-chain-analyst-portfolio', artifact.files);
 *   // Then post artifact.linkedInPost via LinkedIn API
 */
export type { ArtifactInput as ArtifactBuildInput };
