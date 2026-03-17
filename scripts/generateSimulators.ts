#!/usr/bin/env node
/**
 * generateSimulators.ts — CLI script for auto-generating simulator definitions.
 *
 * Run from the project root:
 *   npx ts-node scripts/generateSimulators.ts --file src/data/tracks/spotTradingTrack.ts
 *   npx ts-node scripts/generateSimulators.ts --file src/data/tracks/myNewTrack.ts
 *   npx ts-node scripts/generateSimulators.ts --file src/data/levels.ts --missing-only
 *   npx ts-node scripts/generateSimulators.ts --file src/data/tracks/myNewTrack.ts --dry-run
 *   npx ts-node scripts/generateSimulators.ts --all
 *
 * Options:
 *   --file <path>       Process a single track file
 *   --all               Process all track files in src/data/tracks/
 *   --missing-only      Only generate for lessons that have NO lessonSimulations (default: true)
 *   --overwrite         Also regenerate lessons that already have lessonSimulations
 *   --dry-run           Print output without writing to file
 *   --lesson <title>    Process only the lesson matching this title (partial match)
 *   --count <n>         Number of simulators per lesson (default: 3)
 *   --verbose           Detailed logging
 *
 * The script reads your ANTHROPIC_API_KEY from the environment:
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   npx ts-node scripts/generateSimulators.ts --file src/data/tracks/spotTradingTrack.ts
 *
 * NEW FILE WORKFLOW:
 *   1. Create your new lesson file (or add lessons to an existing track)
 *   2. Run this script pointing at your file
 *   3. The script finds every lesson missing lessonSimulations
 *   4. Generates 3 appropriate simulators per lesson using the lesson content
 *   5. Writes the lessonSimulations block directly into your file
 *   6. Your file is ready — no manual simulator writing needed
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  generateSimulatorsForLesson,
  formatAsTypeScript,
  type LessonInput,
  type SimType,
} from '../src/lib/simulatorGenerator';

// ── CLI arg parsing ───────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// ── Lesson extractor ──────────────────────────────────────────────────────────
//
// Reads the raw TypeScript source of a track file and extracts lesson objects.
// This uses regex parsing on the text, not full TS compilation — keeps the
// script dependency-free (no ts-morph, no babel needed).

interface ExtractedLesson {
  title: string;
  explanation: string;
  keyTakeaway: string;
  examples: Array<{ context: string; scenario: string; outcome: string }>;
  startIndex: number;    // position in the file source
  endIndex: number;
  hasSimulations: boolean;
  trackId: string;
  trackName: string;
}

function extractTrackId(source: string): string {
  const m = source.match(/id:\s*['"`]([^'"`]+)['"`]/);
  return m?.[1] ?? 'unknown-track';
}

function extractTrackName(source: string): string {
  const m = source.match(/name:\s*['"`]([^'"`]+)['"`]/);
  return m?.[1] ?? 'Unknown Track';
}

function extractLessons(source: string, filePath: string): ExtractedLesson[] {
  const trackId   = extractTrackId(source);
  const trackName = extractTrackName(source);
  const lessons: ExtractedLesson[] = [];

  // Match lesson blocks — find each { id: '...', title: `...`, explanation: `...` }
  // We look for the pattern: title followed by explanation
  const titlePattern = /title:\s*[`'"]([^`'"]+)[`'"]/g;
  let match: RegExpExecArray | null;

  while ((match = titlePattern.exec(source)) !== null) {
    const titleStart = match.index;
    const title = match[1];

    // Look forward for explanation
    const exSearch = source.slice(titleStart, titleStart + 20000);
    const exMatch = exSearch.match(/explanation:\s*`([\s\S]*?)`(?:\s*,|\s*\n\s*visualPrompt)/);
    if (!exMatch) continue;

    const explanation = exMatch[1].trim();
    if (explanation.length < 50) continue; // skip very short explanations

    // Look for keyTakeaway
    const ktSearch = source.slice(titleStart, titleStart + 25000);
    const ktMatch = ktSearch.match(/keyTakeaway:\s*[`'"]([^`'"]{20,})[`'"]/);
    const keyTakeaway = ktMatch?.[1]?.trim() ?? '';

    // Look for examples
    const examples: Array<{ context: string; scenario: string; outcome: string }> = [];
    const examplesSearch = source.slice(titleStart, titleStart + 30000);
    const examplesBlock = examplesSearch.match(/examples:\s*\[([\s\S]*?)\],\s*(?:keyTakeaway|guidedPractice)/);
    if (examplesBlock) {
      const contextMatches = examplesBlock[1].matchAll(/context:\s*`([^`]{10,})`/g);
      const scenarioMatches = [...examplesBlock[1].matchAll(/scenario:\s*`([^`]{10,})`/g)];
      const outcomeMatches  = [...examplesBlock[1].matchAll(/outcome:\s*`([^`]{10,})`/g)];
      let idx = 0;
      for (const cm of contextMatches) {
        examples.push({
          context:  cm[1].slice(0, 300),
          scenario: scenarioMatches[idx]?.[1]?.slice(0, 300) ?? '',
          outcome:  outcomeMatches[idx]?.[1]?.slice(0, 200) ?? '',
        });
        idx++;
        if (idx >= 2) break;
      }
    }

    // Check if this lesson already has lessonSimulations
    const afterTitle = source.slice(titleStart, titleStart + 40000);
    const nextLessonIdx = afterTitle.search(/\n\s*\{\s*\n?\s*id:\s*['"`]/);
    const lessonBody = nextLessonIdx > 0 ? afterTitle.slice(0, nextLessonIdx) : afterTitle.slice(0, 10000);
    const hasSimulations = /lessonSimulations\s*:/.test(lessonBody);

    const endIndex = titleStart + (nextLessonIdx > 0 ? nextLessonIdx : Math.min(lessonBody.length, 10000));

    lessons.push({
      title,
      explanation: explanation.slice(0, 3000),
      keyTakeaway,
      examples,
      startIndex: titleStart,
      endIndex,
      hasSimulations,
      trackId,
      trackName,
    });
  }

  return lessons;
}

// ── Insertion: write lessonSimulations into source ────────────────────────────

function insertSimulations(
  source: string,
  lesson: ExtractedLesson,
  simTs: string,
): string {
  // Find the keyTakeaway line for this lesson and insert after guided practice
  // OR find guidedPractice end and insert after it
  // Strategy: find "keyTakeaway: `..." at or after lesson.startIndex,
  // then find the NEXT occurrence of guidedPractice array close
  const afterLesson = source.slice(lesson.startIndex);

  // Find guidedPractice array end — look for the closing ], after the array
  const gpMatch = afterLesson.match(/guidedPractice:\s*\[[\s\S]*?\],/);
  if (gpMatch && gpMatch.index !== undefined) {
    const insertAt = lesson.startIndex + gpMatch.index + gpMatch[0].length;
    const before = source.slice(0, insertAt);
    const after = source.slice(insertAt);
    return `${before}\n${simTs}\n${after}`;
  }

  // Fallback: insert before keyTakeaway
  const ktMatch = afterLesson.match(/keyTakeaway:/);
  if (ktMatch && ktMatch.index !== undefined) {
    const insertAt = lesson.startIndex + ktMatch.index;
    const before = source.slice(0, insertAt);
    const after = source.slice(insertAt);
    return `${before}${simTs}\n        ${after}`;
  }

  // Last resort: no insertion possible
  console.warn(`  [warn] Could not find insertion point for: ${lesson.title}`);
  return source;
}

// ── Levels.ts / pythonLevels.ts handler ──────────────────────────────────────

function extractIslandLessons(source: string, filePath: string): ExtractedLesson[] {
  const islandTrackId = filePath.includes('python') ? 'quant-python' : 'island-crypto';
  const islandTrackName = filePath.includes('python') ? 'Python Mastery' : 'Crypto Island';

  const lessons: ExtractedLesson[] = [];
  // For levels, we look for: topic: "..." and fact: "..."
  const topicPattern = /topic:\s*["'`]([^"'`]+)["'`]/g;
  let m: RegExpExecArray | null;

  while ((m = topicPattern.exec(source)) !== null) {
    const title = m[1];
    const startIndex = m.index;
    const slice = source.slice(startIndex, startIndex + 3000);

    const factMatch = slice.match(/fact:\s*`([\s\S]*?)`/);
    const plainMatch = slice.match(/plain:\s*`([\s\S]*?)`/);

    if (!factMatch && !plainMatch) continue;

    const explanation = (factMatch?.[1] ?? '') + '\n\n' + (plainMatch?.[1] ?? '');
    if (explanation.trim().length < 30) continue;

    const hasSimulations = /lessonSimulations\s*:/.test(slice);

    lessons.push({
      title,
      explanation: explanation.slice(0, 3000),
      keyTakeaway: plainMatch?.[1]?.slice(0, 200) ?? '',
      examples: [],
      startIndex,
      endIndex: startIndex + 2000,
      hasSimulations,
      trackId: islandTrackId,
      trackName: islandTrackName,
    });
  }

  return lessons;
}

// ── Progress display ──────────────────────────────────────────────────────────

function progress(current: number, total: number, label: string) {
  const pct = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}% — ${label.slice(0, 40).padEnd(40)}`);
  if (current === total) process.stdout.write('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('\n❌  ANTHROPIC_API_KEY not set. Export it first:\n  export ANTHROPIC_API_KEY=sk-ant-...\n');
    process.exit(1);
  }

  const dryRun      = Boolean(args['dry-run']);
  const verbose     = Boolean(args['verbose']);
  const overwrite   = Boolean(args['overwrite']);
  const missingOnly = !overwrite;
  const countArg    = args['count'] ? parseInt(args['count'] as string, 10) : 3;
  const lessonFilter = args['lesson'] as string | undefined;

  // Gather files to process
  let files: string[] = [];

  if (args['all']) {
    const tracksDir = path.join(process.cwd(), 'src/data/tracks');
    files = fs.readdirSync(tracksDir)
      .filter(f => f.endsWith('.ts'))
      .map(f => path.join(tracksDir, f));
    files.push(
      path.join(process.cwd(), 'src/data/levels.ts'),
      path.join(process.cwd(), 'src/data/pythonLevels.ts'),
    );
  } else if (args['file']) {
    const filePath = path.resolve(process.cwd(), args['file'] as string);
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌  File not found: ${filePath}\n`);
      process.exit(1);
    }
    files = [filePath];
  } else {
    console.log(`
⚡ Sifter Skill_Up — Simulator Generator

Usage:
  npx ts-node scripts/generateSimulators.ts --file <path>        Process one file
  npx ts-node scripts/generateSimulators.ts --all                 Process all track files
  npx ts-node scripts/generateSimulators.ts --file <path> --dry-run  Preview without writing

Options:
  --missing-only   Only lessons without simulators (default)
  --overwrite      Regenerate existing simulators too
  --lesson <name>  Only process this lesson (partial title match)
  --count <n>      Simulators per lesson (default: 3)
  --dry-run        Print output, don't write
  --verbose        Detailed logging

New file workflow:
  1. Create your .ts lesson file with explanation, examples, keyTakeaway fields
  2. Run: npx ts-node scripts/generateSimulators.ts --file src/data/tracks/myTrack.ts
  3. Done — lessonSimulations injected automatically
`);
    process.exit(0);
  }

  console.log(`\n⚡ Sifter Simulator Generator\n`);
  console.log(`  Files: ${files.length}`);
  console.log(`  Mode: ${missingOnly ? 'missing only' : 'all lessons'}`);
  console.log(`  Dry run: ${dryRun ? 'yes (no writes)' : 'no'}\n`);

  let totalProcessed = 0;
  let totalGenerated = 0;
  let totalErrors = 0;

  for (const filePath of files) {
    const relPath = path.relative(process.cwd(), filePath);
    console.log(`\n📄  ${relPath}`);

    let source = fs.readFileSync(filePath, 'utf-8');

    // Choose extractor based on file type
    const isLevelsFile = filePath.endsWith('levels.ts') || filePath.endsWith('pythonLevels.ts');
    const lessons = isLevelsFile
      ? extractIslandLessons(source, filePath)
      : extractLessons(source, filePath);

    const toProcess = lessons.filter(l => {
      if (lessonFilter && !l.title.toLowerCase().includes(lessonFilter.toLowerCase())) return false;
      if (missingOnly && l.hasSimulations) return false;
      return true;
    });

    if (toProcess.length === 0) {
      console.log('  ✓ All lessons already have simulators.\n');
      continue;
    }

    console.log(`  ${lessons.length} lessons found — ${toProcess.length} need simulators\n`);

    for (let i = 0; i < toProcess.length; i++) {
      const lesson = toProcess[i];
      progress(i, toProcess.length, lesson.title);

      const input: LessonInput = {
        title:              lesson.title,
        explanation:        lesson.explanation,
        keyTakeaway:        lesson.keyTakeaway,
        examples:           lesson.examples,
        trackId:            lesson.trackId,
        trackName:          lesson.trackName,
        // Pass position so generator knows scaffold tier
        lessonIndexInLab:   i,
        totalLessonsInLab:  toProcess.length,
      };

      try {
        const sims = await generateSimulatorsForLesson(input, apiKey, {
          count: countArg,
          verbose,
        });

        const tsBlock = formatAsTypeScript(sims);

        if (dryRun) {
          console.log(`\n\n  --- DRY RUN: ${lesson.title} ---`);
          console.log(tsBlock);
        } else {
          source = insertSimulations(source, lesson, tsBlock);
        }

        totalGenerated += sims.length;
        totalProcessed++;

        // Throttle
        if (i < toProcess.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err: any) {
        totalErrors++;
        console.error(`\n  ❌ Error on "${lesson.title}": ${err.message}`);
        if (verbose) console.error(err.stack);
      }
    }

    progress(toProcess.length, toProcess.length, 'complete');

    if (!dryRun && totalProcessed > 0) {
      // Write backup first
      fs.writeFileSync(`${filePath}.bak`, fs.readFileSync(filePath, 'utf-8'));
      fs.writeFileSync(filePath, source);
      console.log(`\n  ✅ Written to ${relPath} (backup: ${relPath}.bak)`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Lessons processed : ${totalProcessed}`);
  console.log(`  Simulators created: ${totalGenerated}`);
  if (totalErrors > 0) console.log(`  Errors            : ${totalErrors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// LAB-LEVEL GENERATION (aggregate + boss mode)
// Usage: npx ts-node scripts/generateSimulators.ts --lab --file src/data/tracks/myTrack.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  generateLabContent,
  generateInterviewMode,
  formatAggregateAsTypeScript,
  formatBossModeAsTypeScript,
  formatInterviewModeAsTypeScript,
  type LessonWithSims,
} from '../src/lib/labGenerator';

/**
 * Extracts lab blocks from a track file.
 * Reads lessons that already have lessonSimulations and groups them by lab.
 */
function extractLabs(source: string, filePath: string): Array<{
  labId: string;
  labTitle: string;
  startIndex: number;
  endIndex: number;
  hasAggregate: boolean;
  hasBoss: boolean;
  lessons: LessonWithSims[];
  trackId: string;
  trackName: string;
  level: 'junior' | 'intermediate' | 'senior';
}> {
  const trackId   = extractTrackId(source);
  const trackName = extractTrackName(source);
  const labs: any[] = [];

  // Detect level from file path or track name
  const pathLower = filePath.toLowerCase();
  const level: 'junior' | 'intermediate' | 'senior' =
    pathLower.includes('junior') || trackName.toLowerCase().includes('junior') ? 'junior'
    : pathLower.includes('senior') || trackName.toLowerCase().includes('senior') ? 'senior'
    : 'intermediate';

  // Find lab/section blocks — look for id patterns like 'lab-1', 'junior-foundation', etc.
  const labPattern = /id:\s*['"`]((?:lab|junior|intermediate|senior|foundation)[^'"`]*?)['"`]/g;
  let lm: RegExpExecArray | null;

  while ((lm = labPattern.exec(source)) !== null) {
    const labId = lm[1];
    const start = lm.index;

    // Look for title right after
    const slice = source.slice(start, start + 200);
    const titleM = source.slice(start, start + 500).match(/title:\s*[`'"]([^`'"]+)[`'"]/);
    if (!titleM) continue;

    const labTitle = titleM[1];
    const hasAggregate = /aggregateSimulations/.test(source.slice(start, start + 50000));
    const hasBoss = /bossMode\s*:/.test(source.slice(start, start + 50000));

    // Extract lessons within this lab (simplified — real impl would parse properly)
    const lessonTitles: LessonWithSims[] = [];
    const lessonPattern = /title:\s*[`'"]([^`'"]{10,})[`'"]/g;
    const labSource = source.slice(start, start + 60000);
    let lp: RegExpExecArray | null;
    while ((lp = lessonPattern.exec(labSource)) !== null) {
      const lTitle = lp[1];
      if (lTitle === labTitle) continue; // skip the lab title itself
      const keyTake = labSource.slice(lp.index, lp.index + 3000).match(/keyTakeaway:\s*[`'"]([^`'"]{20,})[`'"]/)?.[1] ?? '';
      const hasSims = /lessonSimulations\s*:/.test(labSource.slice(lp.index, lp.index + 5000));

      if (keyTake) {
        lessonTitles.push({
          id: lTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40),
          title: lTitle,
          explanation: '',
          keyTakeaway: keyTake,
          lessonSimulations: hasSims ? [{ type: 'judgment-riskAssess' as any, scenario: '', scoringCriteria: [] }] : [],
        });
        if (lessonTitles.length >= 12) break;
      }
    }

    if (lessonTitles.length > 0) {
      labs.push({ labId, labTitle, startIndex: start, endIndex: start + 60000, hasAggregate, hasBoss, lessons: lessonTitles, trackId, trackName, level });
    }
  }

  return labs;
}

async function runLabGeneration(filePath: string, args: Record<string, string | boolean>) {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const dryRun = Boolean(args['dry-run']);
  const verbose = Boolean(args['verbose']);
  const interviewOnly = Boolean(args['interview']);
  const overwrite = Boolean(args['overwrite']);

  let source = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(process.cwd(), filePath);
  const labs = extractLabs(source, filePath);

  console.log(`\n📦  ${relPath}`);
  console.log(`  ${labs.length} labs detected`);

  if (labs.length === 0) {
    console.log('  No labs found. Check file has lab id patterns.');
    return;
  }

  let generated = 0;

  if (interviewOnly) {
    // Generate interview mode for the level
    const trackName = labs[0]?.trackName ?? 'Unknown Track';
    const level = labs[0]?.level ?? 'junior';
    const roleName = trackName.replace(' Track', '').replace(' Junior', '').replace(' Intermediate', '').replace(' Senior', '');

    console.log(`\n  Generating ${level} interview mode for ${roleName}...`);
    const labSummaries = labs.slice(0, 8).map(l => ({
      labId:     l.labId,
      labTitle:  l.labTitle,
      keySkills: l.lessons.slice(0, 4).map(ls => ls.keyTakeaway.slice(0, 60)),
    }));

    const interview = await generateInterviewMode(
      labs[0].trackId, trackName, level, labSummaries, roleName, apiKey,
    );

    const tsOutput = formatInterviewModeAsTypeScript(interview);
    const outPath = filePath.replace('.ts', `.${level}Interview.ts`);

    if (dryRun) {
      console.log('\n--- DRY RUN: Interview Mode ---\n');
      console.log(tsOutput);
    } else {
      fs.writeFileSync(outPath, `// Auto-generated — ${new Date().toISOString()}\nimport type { InterviewMode } from '../lib/labGenerator';\n\n${tsOutput}\n`);
      console.log(`\n  ✅ Interview mode written to ${path.relative(process.cwd(), outPath)}`);
    }
    return;
  }

  // Generate aggregate + boss for each lab
  for (let i = 0; i < labs.length; i++) {
    const lab = labs[i];
    if (!overwrite && lab.hasAggregate && lab.hasBoss) {
      console.log(`  ⏭  ${lab.labTitle} — already has aggregate + boss, skipping`);
      continue;
    }

    const needsPhase2 = i >= labs.length * 0.4; // labs 3+ get phase2 (matching Section 15 pattern)
    console.log(`\n  [${i + 1}/${labs.length}] ${lab.labTitle} (phase2: ${needsPhase2})`);

    try {
      const content = await generateLabContent({
        labId:            lab.labId,
        labTitle:         lab.labTitle,
        trackId:          lab.trackId,
        trackName:        lab.trackName,
        level:            lab.level,
        labIndex:         i,
        totalLabsInLevel: labs.length,
        hasPhase2:        needsPhase2,
        lessons:          lab.lessons,
        apiKey,
        verbose,
      });

      const aggregateTs = formatAggregateAsTypeScript(content);
      const bossTs = formatBossModeAsTypeScript(content);
      const combined = `\n${aggregateTs}\n${bossTs}`;

      if (dryRun) {
        console.log(`\n--- DRY RUN: ${lab.labTitle} ---\n${combined}`);
      } else {
        // Insert before the closing of this lab's object
        // Find "}, // end lab" or just "}" after the boss-less aggregateSimulations position
        const insertTarget = source.indexOf('bossMode:', lab.startIndex);
        if (insertTarget === -1 || !lab.hasAggregate) {
          // Find end of lessons array in this lab and insert after it
          const lessonsEnd = source.indexOf('],', lab.startIndex + 200);
          if (lessonsEnd > 0) {
            source = source.slice(0, lessonsEnd + 2) + '\n' + combined + '\n' + source.slice(lessonsEnd + 2);
          }
        }
        generated++;
      }

      if (i < labs.length - 1) await new Promise(r => setTimeout(r, 1500));
    } catch (err: any) {
      console.error(`  ❌ Error on ${lab.labTitle}: ${err.message}`);
    }
  }

  if (!dryRun && generated > 0) {
    fs.writeFileSync(`${filePath}.bak`, fs.readFileSync(filePath, 'utf-8'));
    fs.writeFileSync(filePath, source);
    console.log(`\n  ✅ ${generated} labs written to ${relPath}`);
  }
}

// Extend main() to support --lab and --interview flags
const extArgs = parseArgs(process.argv);
if (extArgs['lab'] || extArgs['interview']) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('\n❌  ANTHROPIC_API_KEY not set.\n  export ANTHROPIC_API_KEY=sk-ant-...\n');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), extArgs['file'] as string ?? '');
  if (!fs.existsSync(filePath)) {
    console.error(`\n❌  File not found: ${filePath}\n`);
    process.exit(1);
  }

  runLabGeneration(filePath, extArgs).catch(err => {
    console.error('❌ Fatal:', err.message);
    process.exit(1);
  });
}
