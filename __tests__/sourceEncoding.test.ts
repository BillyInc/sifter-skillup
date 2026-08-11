/**
 * Guards against encoding damage landing in source files.
 *
 * PR #85 ran five files through a cp1252 round-trip. It added a UTF-8 BOM to
 * each, turned 1053 box-drawing characters in `backend/main.py` comment
 * banners into `\u00e2\u0022\u20ac`, and flattened the `&ndash;`/`&mdash;` replacements in
 * `sanitizeRequirementText.ts` to ASCII hyphens -- which reddened main, because
 * that file's own test still asserted an en dash.
 *
 * None of it was visible in review: the diff looked like ordinary comment
 * churn, and a BOM is invisible in every code viewer. Only the one line that
 * happened to be under test failed, so 1052 others rode along silently.
 */

import { execFileSync } from "child_process";
import { readFileSync } from "fs";

/** Sequences that only ever arise from decoding UTF-8 as cp1252. */
const MOJIBAKE = [
  "\u00e2\u0022\u20ac", // U+2500 box rule, smart quote straightened
  "\u00e2\u20ac\u0022", // en/em dash, smart quote straightened
  "\u00e2\u20ac\u201c", // en dash
  "\u00e2\u20ac\u201d", // em dash
  "\u00c3\u00a9", // e-acute
  "\u00c3\u00a2", // a-circumflex
];

const SOURCE = /\.(ts|tsx|js|jsx|py|sql|ya?ml|json|md)$/;

/** Generated output, vendored deps and scraped corpora are not ours to fix. */
const EXCLUDED = [
  /^litellm-env\//,
  /^node_modules\//,
  /^data\/career-mapping\//,
  /^supabase\/migration_v2\.sql$/, // pre-existing, predates #85
  /^backend\/seed_career_pilot\.sql$/, // pre-existing, predates #85
  /^__tests__\/sanitizeRequirementText\.test\.ts$/, // asserts on mojibake by design
  /^litellm_config\.yaml$/, // pre-existing
  /^tsc.*\.(txt|out)$/, // stray build artifacts
];

function trackedSourceFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "-z"], {
    cwd: process.cwd(),
    maxBuffer: 64 * 1024 * 1024,
  }).toString();
  return out
    .split("\0")
    .filter(Boolean)
    .filter((p) => SOURCE.test(p))
    .filter((p) => !EXCLUDED.some((re) => re.test(p)));
}

const files = trackedSourceFiles();

describe("source file encoding", () => {
  it("finds source files to check", () => {
    // A broken glob would make every test below vacuously pass.
    expect(files.length).toBeGreaterThan(50);
  });

  it("has no UTF-8 BOM in any tracked source file", () => {
    const offenders = files.filter((p) => {
      const buf = readFileSync(p);
      return buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
    });
    expect(offenders).toEqual([]);
  });

  it("has no cp1252 mojibake in any tracked source file", () => {
    const offenders: string[] = [];
    for (const p of files) {
      const text = readFileSync(p, "utf8");
      const hit = MOJIBAKE.find((m) => text.includes(m));
      if (hit) {
        offenders.push(`${p} (contains ${JSON.stringify(hit)})`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
