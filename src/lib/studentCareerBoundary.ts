import type {
  CareerContextItem,
  CareerLearningResource,
  DataState,
  DomainRoleV2,
  DomainV2,
  Programme,
  RoleWorkProfile,
} from "@/types/career";

/**
 * Student guidance may use occupation evidence that was assembled from O*NET,
 * but the legacy O*NET source URLs are staff/audit evidence.  Keep that
 * distinction at the client boundary as well as in the API contract: admin
 * screens continue to use the raw careerData methods, while student screens
 * use the sanitised methods below.
 */
const LEGACY_ONET_HOSTS = ["onetonline.org", "onetcenter.org"];

export function isLegacyOnetUrl(value?: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return LEGACY_ONET_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

/**
 * A student-facing destination must be a specific HTTPS destination and must
 * not be a legacy O*NET source URL. Raw source URLs remain available through
 * the un-sanitised admin/audit loaders.
 */
export function studentSafeUrl(value?: string | null): string | undefined {
  if (!value || isLegacyOnetUrl(value)) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Resolve the only URL an approved student card is allowed to open. */
export function studentItemLinkUrl(
  item?: CareerContextItem,
  resource?: CareerLearningResource,
  fallbackUrl?: string | null,
): string | undefined {
  if (item?.linkState === "review_required" || item?.linkState === "no_link") return undefined;
  const candidates = item?.linkState === "linked"
    ? [item.linkUrl, resource?.url, fallbackUrl]
    : [resource?.url, fallbackUrl, item?.linkUrl];
  return candidates.map((candidate) => studentSafeUrl(candidate)).find((candidate): candidate is string => Boolean(candidate));
}

function scrubStudentValue(value: unknown): unknown {
  if (typeof value === "string") return isLegacyOnetUrl(value) ? undefined : value;
  if (Array.isArray(value)) {
    return value
      .filter((entry) => !(entry && typeof entry === "object" && isLegacyOnetUrl((entry as { url?: unknown }).url)))
      .map(scrubStudentValue)
      .filter((entry) => entry !== undefined);
  }
  if (!value || typeof value !== "object") return value;
  if (isLegacyOnetUrl((value as { url?: unknown }).url)) return undefined;

  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string" && isLegacyOnetUrl(child)) continue;
    const cleaned = scrubStudentValue(child);
    if (cleaned !== undefined) output[key] = cleaned;
  }
  return output;
}

function scrubStudentObject<T>(value: T): T {
  return scrubStudentValue(value) as T;
}

function studentContextItem(item: CareerContextItem): CareerContextItem | null {
  if (item.linkState === "review_required") return null;
  const cleaned = scrubStudentObject(item);
  if (!cleaned.linkState) {
    cleaned.linkState = "no_link";
    cleaned.linkUrl = null;
    cleaned.linkTitle = null;
    cleaned.linkSourceReference = undefined;
    cleaned.linkEvidence = undefined;
    cleaned.noLinkReason = "A verified student destination is not attached yet.";
  }
  if (item.linkState === "linked" && isLegacyOnetUrl(item.linkUrl)) {
    cleaned.linkState = "no_link";
    cleaned.linkUrl = null;
    cleaned.linkTitle = null;
    cleaned.linkSourceReference = undefined;
    cleaned.linkEvidence = undefined;
    cleaned.noLinkReason = "The source is retained for staff review, not student guidance.";
  }
  if (cleaned.linkState === "linked" && !studentSafeUrl(cleaned.linkUrl)) {
    cleaned.linkState = "no_link";
    cleaned.linkUrl = null;
    cleaned.linkTitle = null;
    cleaned.linkSourceReference = undefined;
    cleaned.linkEvidence = undefined;
    cleaned.noLinkReason = "A verified student destination is not attached yet.";
  }
  return cleaned;
}

function studentContextItems(items?: CareerContextItem[]): CareerContextItem[] | undefined {
  if (!items) return items;
  return items.map(studentContextItem).filter((item): item is CareerContextItem => Boolean(item));
}

function studentResources(resources?: CareerLearningResource[]): CareerLearningResource[] | undefined {
  if (!resources) return resources;
  return resources
    .filter((resource) => Boolean(studentSafeUrl(resource.url)))
    .map((resource) => scrubStudentObject(resource));
}

function studentContextItemFor(items: CareerContextItem[], itemType: CareerContextItem["itemType"], name: string): CareerContextItem | undefined {
  const normalized = name.trim().toLowerCase();
  return items.find((item) => item.itemType === itemType && item.name.trim().toLowerCase() === normalized);
}

function studentItemUrl(item?: CareerContextItem): string | undefined {
  return item?.linkState === "linked" ? studentSafeUrl(item.linkUrl) : undefined;
}

function studentRoleResourceAllowed(resource: CareerLearningResource, items: CareerContextItem[]): boolean {
  const target = resource.targetName.trim().toLowerCase();
  const itemType = resource.resourceType === "tool_learning"
    ? "tool"
    : resource.resourceType === "competency_reference"
      ? "competency"
      : resource.resourceType === "certification_exam" || resource.resourceType === "professional_body"
        ? "certification"
        : "skill";
  const item = items.find((candidate) => candidate.itemType === itemType && candidate.name.trim().toLowerCase() === target);
  return !item || item.linkState !== "no_link";
}

function studentWorkProfile(profile?: RoleWorkProfile | null): RoleWorkProfile | null | undefined {
  if (!profile) return profile;
  const cleaned = scrubStudentObject(profile);
  cleaned.sourceLinks = profile.sourceLinks.filter((source) => !isLegacyOnetUrl(source.url));
  cleaned.wefSignals = profile.wefSignals.map((signal) => scrubStudentObject(signal));
  return cleaned;
}

export function sanitizeStudentProgramme(programme: Programme): Programme {
  const cleaned = scrubStudentObject(programme);
  cleaned.contextItems = studentContextItems(programme.contextItems);
  cleaned.resources = studentResources(programme.resources);
  return cleaned;
}

export function sanitizeStudentDomain(domain: DomainV2): DomainV2 {
  const cleaned = scrubStudentObject(domain);
  cleaned.contextItems = studentContextItems(domain.contextItems);
  cleaned.resources = studentResources(domain.resources);
  cleaned.subgroups = domain.subgroups.map((subgroup) => {
    const next = scrubStudentObject(subgroup);
    next.contextItems = studentContextItems(subgroup.contextItems);
    next.resources = studentResources(subgroup.resources);
    return next;
  });
  cleaned.roles = domain.roles.map((role) => scrubStudentObject(role));
  return cleaned;
}

export function sanitizeStudentRole(role: DomainRoleV2): DomainRoleV2 {
  const cleaned = scrubStudentObject(role);
  const contextItems = studentContextItems(role.contextItems) ?? [];
  cleaned.contextItems = contextItems;
  cleaned.resources = studentResources(role.resources)?.filter((resource) => studentRoleResourceAllowed(resource, contextItems));
  cleaned.essentialSkillUris = role.essentialSkills.map((name) => {
    const item = studentContextItemFor(contextItems, "skill", name);
    return item ? studentItemUrl(item) || "" : "";
  });
  cleaned.optionalSkillUris = role.optionalSkills.map((name) => {
    const item = studentContextItemFor(contextItems, "skill", name);
    return item ? studentItemUrl(item) || "" : "";
  });
  cleaned.tools = role.tools?.map((tool) => ({
    ...tool,
    toolUrl: studentItemUrl(studentContextItemFor(contextItems, "tool", tool.name)) || "",
  }));
  cleaned.certifications = role.certifications?.map((cert) => ({
    ...cert,
    officialUrl: studentItemUrl(studentContextItemFor(contextItems, "certification", cert.name)),
  }));
  cleaned.workProfile = studentWorkProfile(role.workProfile);
  cleaned.parentContext = role.parentContext
    ? {
        ...scrubStudentObject(role.parentContext),
        domainItems: studentContextItems(role.parentContext.domainItems),
        subgroupItems: studentContextItems(role.parentContext.subgroupItems),
      }
    : role.parentContext;
  return cleaned;
}

export function sanitizeStudentDataState<T>(state: DataState<T>, sanitize: (data: T) => T): DataState<T> {
  return state.data == null ? state : { ...state, data: sanitize(state.data) };
}
