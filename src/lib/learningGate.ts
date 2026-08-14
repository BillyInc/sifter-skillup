/**
 * SkillUp learning routes are currently exposed only through My World.
 * Keep the route list in one place so navigation and the integrity guard agree.
 */
export const LEGACY_LEARNING_PREFIXES = [
  "/fields",
  "/map",
  "/skills",
  "/portfolio",
  "/streaks",
  "/guild",
  "/community",
  "/feed",
  "/profile/diary",
  "/profile/github",
  "/track-room",
  "/starknet-track",
  "/ecosystem-track",
  "/cairo-builder-track",
  "/world",
] as const;

export const MY_WORLD_LEARNING_SOURCE = "myworld";

function pathnameOnly(path: string | null | undefined) {
  return (path ?? "").split("?", 1)[0].replace("/(tabs)", "");
}

export function isLegacyLearningPath(path: string | null | undefined) {
  const pathname = pathnameOnly(path);
  return LEGACY_LEARNING_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Add the explicit My World origin to learning links rendered by My World. */
export function withMyWorldLearningGate(path: string) {
  if (!isLegacyLearningPath(path) || path.includes("from=myworld")) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}from=${MY_WORLD_LEARNING_SOURCE}`;
}
