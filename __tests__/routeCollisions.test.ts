/**
 * No two route files may serialise to the same URL.
 *
 * Expo-router strips group segments — `(tabs)`, `(admin)` — from the URL. Two
 * files in different groups with otherwise identical paths therefore declare
 * the SAME url, and which one a cold load resolves to is not something the
 * calling code controls. Three of these shipped at once:
 *
 *   - (tabs)/explore/** vs (admin)/explore/**  — 15 paths. Loading
 *     /explore/domains signed out rendered the admin "School guidance
 *     workspace" shell, which has no auth guard.
 *   - (tabs)/profile   vs (admin)/profile
 *   - (tabs)/map/lesson vs map/lesson — the bare copy was an older revision
 *     that dropped every Starknet lab param, so lab progression degraded to
 *     the flat numeric LEVELS table with no error.
 *
 * None of it was visible from the code: the file trees look deliberate and
 * `tsc` has nothing to say. Only the URL space collides. This walks the real
 * app/ directory so a future mirror is caught at test time.
 */
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const APP_DIR = join(__dirname, '..', 'app');

/** Route files only: layouts and the +html/+not-found specials are not routes. */
function isRouteFile(name: string): boolean {
  return (
    name.endsWith('.tsx') &&
    name !== '_layout.tsx' &&
    !name.startsWith('+')
  );
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (isRouteFile(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** File path → the URL expo-router serves it at. */
function urlFor(file: string): string {
  const rel = relative(APP_DIR, file).split(/[\\/]/);
  const parts = rel
    .map((seg, i) =>
      i === rel.length - 1 ? seg.replace(/\.tsx$/, '') : seg,
    )
    .filter((seg) => !/^\(.*\)$/.test(seg)) // group segments vanish from the URL
    .filter(Boolean);
  if (parts[parts.length - 1] === 'index') parts.pop();
  return '/' + parts.join('/');
}

describe('app/ route table', () => {
  it('maps every URL to exactly one file', () => {
    const byUrl = new Map<string, string[]>();
    for (const file of walk(APP_DIR)) {
      const url = urlFor(file);
      const files = byUrl.get(url) ?? [];
      files.push(relative(APP_DIR, file));
      byUrl.set(url, files);
    }

    const collisions = [...byUrl.entries()]
      .filter(([, files]) => files.length > 1)
      .map(([url, files]) => `${url}\n    ${files.join('\n    ')}`);

    expect(collisions).toEqual([]);
  });
});
