/**
 * Privacy-safe, platform-aware copy for a learner's guided-plan share action.
 *
 * This module only formats text. It never adds a learner name, institution,
 * private note, admin field or hidden/review-only item. A referral URL is an
 * explicit input so tracking can be added later without changing the copy
 * contract or quietly inventing a referral code.
 */

export type LearningPlanSharePlatform =
  | "generic"
  | "whatsapp"
  | "facebook"
  | "x"
  | "instagram"
  | "tiktok"
  | "email";

export interface LearningPlanShareInput {
  referralUrl?: string | null;
  routeLabel?: string | null;
  focusNames?: string[];
}

export interface LearningPlanShareCopy {
  platform: LearningPlanSharePlatform;
  title: string;
  message: string;
  link?: string;
}

export interface LearningPlanShareStackInput {
  routeLabel?: string | null;
  selectedIds?: unknown[];
  itemSummaries?: Array<{ id?: unknown; name?: unknown }>;
}

const DEFAULT_PUBLIC_URL = "https://levelup.com.ng";
const BASE_MESSAGE = "I just got my career mapping from Sifter LevelUp. You should do yours too.";

function clean(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function safeLink(value?: string | null): string {
  const link = clean(value);
  return link && /^https:\/\//i.test(link) ? link : DEFAULT_PUBLIC_URL;
}

function safeFocusNames(values?: string[]): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))].slice(0, 3);
}

function contextLine(input: LearningPlanShareInput): string {
  const route = clean(input.routeLabel);
  const focus = safeFocusNames(input.focusNames);
  const routeLine = route ? ` My route starts with ${route}.` : "";
  const focusLine = focus.length ? ` I chose to focus on ${focus.join(", ")}.` : "";
  return `${routeLine}${focusLine}`;
}

/** Build a privacy-safe share payload from saved stacks, including selected items only. */
export function buildLearningPlanShareInputFromStacks(
  stacks: LearningPlanShareStackInput[],
  fallbackRouteLabel?: string | null,
): LearningPlanShareInput {
  const routeLabels = stacks.map((stack) => clean(stack.routeLabel)).filter((value): value is string => Boolean(value));
  const focusNames = stacks.flatMap((stack) => {
    const selected = new Set((stack.selectedIds ?? []).map((id) => String(id)));
    return (stack.itemSummaries ?? [])
      .filter((item) => selected.has(String(item.id ?? "")))
      .map((item) => clean(typeof item.name === "string" ? item.name : undefined))
      .filter((value): value is string => Boolean(value));
  });
  return {
    routeLabel: routeLabels.join(" / ") || clean(fallbackRouteLabel),
    focusNames: [...new Set(focusNames)].slice(0, 3),
  };
}

/** Build all copy variants without performing a platform share. */
export function buildLearningPlanShareCopies(input: LearningPlanShareInput = {}): Record<LearningPlanSharePlatform, LearningPlanShareCopy> {
  const link = safeLink(input.referralUrl);
  const context = contextLine(input);
  const generic = `${BASE_MESSAGE}${context}\n\nGet yours: ${link}\n\nThis is a personal learning focus, not a mastery result or employment guarantee.`;
  return {
    generic: { platform: "generic", title: "My Sifter LevelUp career mapping", message: generic, link },
    whatsapp: {
      platform: "whatsapp",
      title: "My Sifter LevelUp career mapping",
      message: `${BASE_MESSAGE}${context}\n\nGet yours here: ${link}`,
      link,
    },
    facebook: {
      platform: "facebook",
      title: "My Sifter LevelUp career mapping",
      message: `${BASE_MESSAGE}${context}\n\nSifter LevelUp helped me see a clearer route from my programme to what I can learn next. Get yours: ${link}`,
      link,
    },
    x: {
      platform: "x",
      title: "My Sifter LevelUp career mapping",
      message: `${BASE_MESSAGE}${context} Get yours: ${link}`,
      link,
    },
    instagram: {
      platform: "instagram",
      title: "My Sifter LevelUp career mapping",
      message: `${BASE_MESSAGE}${context}\n\nSee yours at ${link}\n\n#SifterLevelUp #CareerMapping #LearnWithPurpose`,
      link,
    },
    tiktok: {
      platform: "tiktok",
      title: "My Sifter LevelUp career mapping",
      message: `${BASE_MESSAGE}${context}\n\nStart yours: ${link}\n\n#SifterLevelUp #CareerTok #StudyTok`,
      link,
    },
    email: {
      platform: "email",
      title: "You should try Sifter LevelUp career mapping",
      message: `${BASE_MESSAGE}${context}\n\nIt connects your programme with possible directions and a focused learning plan.\n\nStart here: ${link}`,
      link,
    },
  };
}

export function buildLearningPlanShareMessage(
  platform: LearningPlanSharePlatform = "generic",
  input: LearningPlanShareInput = {},
): LearningPlanShareCopy {
  return buildLearningPlanShareCopies(input)[platform];
}
