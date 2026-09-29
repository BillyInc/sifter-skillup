export type ProvisioningMode = "school" | "jamb";

/** The saved organisation type is authoritative; route hints are only fallback. */
export function provisioningModeFor(
  organizationType: string | null | undefined,
  routeMode: ProvisioningMode,
): ProvisioningMode {
  if (organizationType === "secondary_school") return "school";
  if (organizationType === "tutorial_centre" || organizationType === "jamb_cafe") return "jamb";
  return routeMode;
}

/** One named student is an implicit choice; multiple students require ticks. */
export function selectedProvisioningDraftIds<T extends { id: string; fullName?: string | null }>(
  drafts: T[],
  selected: Record<string, boolean>,
): string[] {
  const hasExplicitSelection = Object.values(selected).some(Boolean);
  const singleNamedDraft = drafts.length === 1 && Boolean(drafts[0].fullName?.trim());
  return drafts
    .filter((draft) => selected[draft.id] || (singleNamedDraft && !hasExplicitSelection))
    .map((draft) => draft.id);
}

export function provisioningDraftsNeedTicks(drafts: unknown[]) {
  return drafts.length > 1;
}
