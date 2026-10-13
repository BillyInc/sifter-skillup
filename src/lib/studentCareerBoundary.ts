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
const STUDENT_CONTEXT_LEVELS = new Set(["programme", "domain", "subgroup", "role"]);

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

/** Exact student-facing item gate, mirrored from the API contract. The source
 * record must explicitly approve its explanation at this checkpoint, and a
 * separate, accessed learning destination must be evidenced. */
export function isApprovedStudentContextItem(item?: CareerContextItem | null): boolean {
  if (
    !item
    || item.claimReviewState !== "approved"
    || item.linkState !== "linked"
    || !studentSafeUrl(item.linkUrl)
    || !item.linkAccessedAt
    || !item.linkSourceReference
    || !Object.keys(item.linkSourceReference).length
    || !item.linkEvidence
    || !Object.keys(item.linkEvidence).length
  ) return false;
  const claims = item.claimEvidence?.claims;
  if (!claims || typeof claims !== "object") return false;
  const required = ["item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"];
  if (item.expectedOutput) required.push("expected_output");
  if (["subgroup", "role"].includes(item.contextLevel) && item.priority) required.push("priority");
  return required.every((key) => {
    const claim = (claims as Record<string, unknown>)[key];
    if (!claim || typeof claim !== "object") return false;
    const evidence = claim as Record<string, unknown>;
    return Array.isArray(evidence.source_references) && evidence.source_references.length > 0
      && Array.isArray(evidence.source_locators) && evidence.source_locators.length > 0;
  });
}

/**
 * Student resources are approved, source-backed destinations owned by the
 * surface that is rendering them.  Keeping this check here means a screen
 * cannot accidentally re-introduce an audit-only or review-only URL by using
 * a raw resource array.
 */
export function isStudentLearningResource(
  resource?: CareerLearningResource,
  expectedOwner?: CareerContextItem["contextLevel"],
): boolean {
  if (!resource || !studentSafeUrl(resource.url)) return false;
  if (resource.reviewStatus !== "approved_guidance_v1") return false;
  if (!resource.ownershipScope || resource.ownershipScope === "audit_only") return false;
  if (expectedOwner && resource.ownershipScope !== expectedOwner) return false;
  if (resource.dataState === "unsourced" || resource.sourceConfidence === "unsourced") return false;
  return true;
}

/** Resolve the only URL an approved student card is allowed to open. */
export function studentItemLinkUrl(
  item?: CareerContextItem,
  resource?: CareerLearningResource,
  fallbackUrl?: string | null,
): string | undefined {
  if (item?.linkState === "review_required" || item?.linkState === "no_link") return undefined;
  // When an item exists, its explicit state is authoritative.  A resource or
  // legacy URI may not override an explicit no-link/review decision, and may
  // only supplement a linked item when it is the exact resource selected by
  // the caller.
  const candidates = item
    ? item.linkState === "linked" ? [item.linkUrl, resource?.url] : []
    : [resource?.url, fallbackUrl];
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
  if (
    item.dataState !== "source_backed"
    || item.sourceConfidence === "unsourced"
    || !STUDENT_CONTEXT_LEVELS.has(item.contextLevel)
    || item.guidanceOwner !== item.contextLevel
    || !isApprovedStudentContextItem(item)
  ) return null;
  const cleaned = scrubStudentObject(item);
  return cleaned;
}

function studentContextItems(items?: CareerContextItem[]): CareerContextItem[] | undefined {
  if (!items) return items;
  return items.map(studentContextItem).filter((item): item is CareerContextItem => Boolean(item));
}

function studentResources(
  resources?: CareerLearningResource[],
  expectedOwner?: CareerContextItem["contextLevel"],
): CareerLearningResource[] | undefined {
  if (!resources) return resources;
  return resources
    .filter((resource) => isStudentLearningResource(resource, expectedOwner))
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
  // Role-level references describe the role itself and do not need a
  // duplicated context-item row. Item-level resources do: otherwise a raw
  // resource can make an explicitly unlinked item look verified.
  if (resource.resourceType === "role_reference") return true;
  return Boolean(item && item.linkState === "linked");
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
  cleaned.resources = studentResources(programme.resources, "programme");
  return cleaned;
}

export function sanitizeStudentDomain(domain: DomainV2): DomainV2 {
  const cleaned = scrubStudentObject(domain);
  cleaned.contextItems = studentContextItems(domain.contextItems);
  cleaned.resources = studentResources(domain.resources, "domain");
  cleaned.subgroups = domain.subgroups.map((subgroup) => {
    const next = scrubStudentObject(subgroup);
    next.contextItems = studentContextItems(subgroup.contextItems);
    next.resources = studentResources(subgroup.resources, "subgroup");
    return next;
  });
  cleaned.roles = domain.roles.map((role) => scrubStudentObject(role));
  return cleaned;
}

export function sanitizeStudentRole(role: DomainRoleV2): DomainRoleV2 {
  const cleaned = scrubStudentObject(role);
  const contextItems = studentContextItems(role.contextItems) ?? [];
  cleaned.contextItems = contextItems;
  cleaned.resources = studentResources(role.resources, "role")?.filter((resource) => studentRoleResourceAllowed(resource, contextItems));
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
