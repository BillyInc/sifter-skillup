import React, { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, FontSize, Spacing } from "../../theme";
import { SifterButton } from "../ui";
import { careerData } from "../../lib/careerData";
import { provisioningData } from "../../lib/provisioningData";
import { useAuth } from "@/hooks/useAuth";

type BranchKind = "programmes" | "domains" | "subgroups" | "roles" | "learningFocus";
type GuidanceListItem = {
  id: string;
  name?: string;
  programme?: { id?: string };
  domainId?: string;
  domainName?: string;
  subgroupId?: string;
  subgroupName?: string;
  roleId?: string;
  roleName?: string;
  matchType?: string;
  routeKeys?: string[];
};
export type GuidancePathRecord = Record<string, GuidanceListItem[] | unknown>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function hasStableIdentity(value: unknown): boolean {
  const record = asRecord(value);
  return Boolean(
    typeof record?.id === "string" && record.id.trim()
    && typeof record?.name === "string" && record.name.trim(),
  );
}

/** A report may only be completed once its academic context is explicit. */
export function hasGuidanceReportContext(path: Record<string, unknown> | null | undefined): boolean {
  return hasStableIdentity(path?.programme) && hasStableIdentity(path?.university);
}

/**
 * A restored report path must belong to the route that is currently being
 * reviewed. Empty route values mean that the caller has no constraint (for
 * example, a context-free resume link), but a supplied programme or university
 * identity must match exactly. This prevents a completed path for another
 * offering from unlocking the current route's report actions.
 */
export function hasGuidanceReportContextForRoute(
  path: Record<string, unknown> | null | undefined,
  expected: { programmeId?: string; schoolId?: string },
): boolean {
  if (!hasGuidanceReportContext(path)) return false;
  const programmeId = String(asRecord(path?.programme)?.id ?? "");
  const schoolId = String(asRecord(path?.university)?.id ?? "");
  return (!expected.programmeId || programmeId === expected.programmeId)
    && (!expected.schoolId || schoolId === expected.schoolId);
}

/** Review completion is a deliberate checkpoint, not merely reaching the tab. */
export function isGuidanceReviewComplete(path: Record<string, unknown> | null | undefined): boolean {
  const resume = asRecord(path?.resume);
  return resume?.stage === "review" && resume?.status === "complete";
}

export function isGuidanceReportReady(path: Record<string, unknown> | null | undefined): boolean {
  return hasGuidanceReportContext(path) && isGuidanceReviewComplete(path);
}

/** Complete Review is usable only when its academic context matches the
 * programme/university route that is currently open. */
export function isGuidanceReportReadyForRoute(
  path: Record<string, unknown> | null | undefined,
  expected: { programmeId?: string; schoolId?: string },
): boolean {
  return hasGuidanceReportContextForRoute(path, expected) && isGuidanceReviewComplete(path);
}

function guidanceItems(path: GuidancePathRecord, kind: BranchKind): GuidanceListItem[] {
  const value = path[kind];
  return Array.isArray(value)
    ? value.filter((entry): entry is GuidanceListItem => Boolean(
      entry && typeof entry === "object" && (
        ("id" in entry && typeof (entry as { id?: unknown }).id === "string")
        || (kind === "programmes" && "programme" in entry && typeof (entry as { programme?: { id?: unknown } }).programme?.id === "string")
      ),
    ))
    : [];
}

function selectionId(entry: GuidanceListItem, kind: BranchKind): string {
  return kind === "programmes" ? String(entry.programme?.id ?? entry.id ?? "") : entry.id;
}

// The record is deliberately loose: alongside the branch arrays it also
// carries academicContext, subjects, notes and other non-array members. That
// is already expressed by the declaration above -- this file briefly carried
// two `GuidancePathRecord` declarations after a merge, which is a hard tsc
// error (TS2300). `unknown` is kept over `any` because `guidanceItems` does
// the narrowing properly.

const pathCache = new Map<string, GuidancePathRecord>();
const pathReads = new Map<string, Promise<GuidancePathRecord>>();
type SelectionWriteResult = { selected: boolean; notice?: string };
const pathWrites = new Map<string, Promise<SelectionWriteResult>>();

/** External path writes (onboarding/programme selection) must invalidate the
 * shared read snapshot before detail rows paint their selected state. */
export function invalidateGuidancePathCache() {
  pathCache.clear();
  pathReads.clear();
}

function pathCacheKey(targetStudentId: string | undefined, ownerId: string): string {
  return targetStudentId ? `admin:${ownerId}:${targetStudentId}` : `student:${ownerId}`;
}

function readGuidancePath(targetStudentId: string | undefined, ownerId: string): Promise<GuidancePathRecord> {
  const key = pathCacheKey(targetStudentId, ownerId);
  const cached = pathCache.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = pathReads.get(key);
  if (pending) return pending;
  const request = (targetStudentId
    ? provisioningData.getGuidancePath(targetStudentId).then((value) => value?.path ?? {})
    : careerData.getGuidancePath().then((value) => value.status === "real" && value.data ? value.data.path : {})
  ).catch(() => ({} as GuidancePathRecord)).then((value) => {
    pathCache.set(key, value);
    pathReads.delete(key);
    return value;
  });
  pathReads.set(key, request);
  return request;
}

export interface GuidanceReportSelection {
  kind: BranchKind;
  id: string;
  name: string;
  domainId?: string;
  domainName?: string;
  subgroupId?: string;
  subgroupName?: string;
  roleId?: string;
  roleName?: string;
  /** The route-local membership of a learning-focus choice. */
  routeKey?: string;
  matchType?: string;
  contextLevel?: "programme" | "domain" | "subgroup" | "role";
  contextKey?: string;
  itemType?: string;
  itemKey?: string;
  programmeId?: string;
}

/**
 * Toggle one guidance selection without dropping the academic context or
 * leaving a previously completed Review checkpoint valid for a changed path.
 */
export function toggleGuidanceSelectionPath(
  path: GuidancePathRecord,
  selection: GuidanceReportSelection,
): GuidancePathRecord {
  const list = guidanceItems(path, selection.kind);
  const selectedEntry = list.find((entry) => selectionId(entry, selection.kind) === selection.id);
  const removedByRoute = asRecord(path.learningPlanRemovedIdsByRoute);
  const routeRemovedIds = selection.routeKey && Array.isArray(removedByRoute?.[selection.routeKey])
    ? removedByRoute[selection.routeKey] as string[]
    : [];
  const removedFromRoute = routeRemovedIds.includes(selection.id);
  const selected = Boolean(selectedEntry && (selection.kind !== "learningFocus"
    || !selection.routeKey
    || !Array.isArray(selectedEntry.routeKeys)
    || selectedEntry.routeKeys.includes(selection.routeKey)) && !removedFromRoute);
  const item = {
    id: selection.id,
    name: selection.name,
    ...(selection.kind === "programmes" ? { programme: { id: selection.id, name: selection.name } } : {}),
    ...(selection.domainId ? { domainId: selection.domainId } : {}),
    ...(selection.domainName ? { domainName: selection.domainName } : {}),
    ...(selection.subgroupId ? { subgroupId: selection.subgroupId } : {}),
    ...(selection.subgroupName ? { subgroupName: selection.subgroupName } : {}),
    ...(selection.matchType ? { matchType: selection.matchType } : {}),
    ...(selection.kind === "learningFocus" ? {
      contextLevel: selection.contextLevel,
      contextKey: selection.contextKey,
      itemType: selection.itemType,
      itemKey: selection.itemKey,
      ...(selection.routeKey ? { routeKeys: [selection.routeKey] } : {}),
    } : {}),
  };
  const isLegacyGlobal = selection.kind === "learningFocus"
    && selectedEntry
    && (!Array.isArray(selectedEntry.routeKeys) || selectedEntry.routeKeys.length === 0);
  const nextList = selection.kind === "learningFocus" && selectedEntry && selection.routeKey
    ? isLegacyGlobal
      ? list
      : selected
        ? list.flatMap((entry) => {
          if (selectionId(entry, selection.kind) !== selection.id) return [entry];
          const routeKeys = Array.isArray(entry.routeKeys) ? entry.routeKeys : [];
          const remaining = routeKeys.filter((routeKey) => routeKey !== selection.routeKey);
          return remaining.length ? [{ ...entry, routeKeys: remaining }] : [];
        })
        : list.map((entry) => selectionId(entry, selection.kind) === selection.id
          ? { ...entry, routeKeys: [...new Set([...(Array.isArray(entry.routeKeys) ? entry.routeKeys : []), selection.routeKey!])] }
          : entry)
    : selected
      ? list.filter((entry) => selectionId(entry, selection.kind) !== selection.id)
      : [...list.filter((entry) => selectionId(entry, selection.kind) !== selection.id), item];
  const resume = asRecord(path.resume);
  const nextPath: GuidancePathRecord = {
    ...path,
    [selection.kind]: nextList,
    resume: {
      ...(resume ?? {}),
      stage: "in_progress",
      status: "in_progress",
    },
  };
  if (selection.kind === "learningFocus" && selection.routeKey) {
    const nextRemovedByRoute = { ...(removedByRoute ?? {}) } as Record<string, unknown>;
    const currentRemoved = Array.isArray(nextRemovedByRoute[selection.routeKey])
      ? nextRemovedByRoute[selection.routeKey] as string[]
      : [];
    const nextRemoved = selected
      ? [...new Set([...currentRemoved, selection.id])]
      : currentRemoved.filter((id) => id !== selection.id);
    if (nextRemoved.length) nextRemovedByRoute[selection.routeKey] = nextRemoved;
    else delete nextRemovedByRoute[selection.routeKey];
    if (Object.keys(nextRemovedByRoute).length) nextPath.learningPlanRemovedIdsByRoute = nextRemovedByRoute;
    else delete nextPath.learningPlanRemovedIdsByRoute;
  }
  if (selection.kind === "learningFocus" && !selected) {
    const addRouteItem = (kind: "domains" | "subgroups", id?: string, name?: string, domainId?: string) => {
      if (!id || !name) return;
      const entries = guidanceItems(nextPath, kind);
      if (entries.some((entry) => entry.id === id)) return;
      nextPath[kind] = [...entries, { id, name, ...(domainId ? { domainId } : {}) }];
    };
    addRouteItem("domains", selection.domainId, selection.domainName);
    addRouteItem("subgroups", selection.subgroupId, selection.subgroupName, selection.domainId);
    if (selection.roleId && selection.roleName) {
      const roles = guidanceItems(nextPath, "roles");
      if (!roles.some((entry) => entry.id === selection.roleId)) {
        nextPath.roles = [...roles, {
          id: selection.roleId,
          name: selection.roleName,
          ...(selection.domainId ? { domainId: selection.domainId } : {}),
          ...(selection.subgroupId ? { subgroupId: selection.subgroupId } : {}),
        }];
      }
    }
  }
  return nextPath;
}

export function GuidanceReportButton({
  selection,
  targetStudentId,
  onOpenPlan,
}: {
  selection: GuidanceReportSelection;
  targetStudentId?: string;
  onOpenPlan?: () => void;
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const ownerId = user?.id ?? "unknown";
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    let active = true;
    readGuidancePath(targetStudentId, ownerId).then((path) => {
      if (!active) return;
      const list = guidanceItems(path, selection.kind);
      setSelected(list.some((entry) => selectionId(entry, selection.kind) === selection.id
        && (selection.kind !== "learningFocus" || !selection.routeKey || !Array.isArray(entry.routeKeys) || entry.routeKeys.includes(selection.routeKey))));
    });
    return () => {
      active = false;
    };
  }, [ownerId, selection.kind, selection.id, selection.routeKey, targetStudentId]);

  const add = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const key = pathCacheKey(targetStudentId, ownerId);
      const previous = pathWrites.get(key);
      const operation = (previous ?? Promise.resolve({ selected: false }))
        .catch(() => ({ selected: false }))
        .then(async (): Promise<SelectionWriteResult> => {
          const path = await readGuidancePath(targetStudentId, ownerId);
          const nextPath = toggleGuidanceSelectionPath(path, selection);
          const nextSelected = guidanceItems(nextPath, selection.kind).some((entry) => selectionId(entry, selection.kind) === selection.id
            && (selection.kind !== "learningFocus" || !selection.routeKey || !Array.isArray(entry.routeKeys) || entry.routeKeys.includes(selection.routeKey)));
          if (targetStudentId) {
            await provisioningData.saveGuidancePath(targetStudentId, nextPath);
            pathCache.set(key, nextPath);
            return { selected: nextSelected };
          }
          const saved = await careerData.saveGuidancePath({
            source: "explore",
            path: nextPath,
          });
          if (saved.status === "real") {
            pathCache.set(key, nextPath);
            return { selected: nextSelected };
          }
          return { selected: false, notice: saved.meta?.notice ?? "Create an account to save this report path." };
      });
      pathWrites.set(key, operation);
      try {
        const result = await operation;
        setSelected(result.selected);
        setNotice(result.notice ?? (result.selected ? "Added to your guidance." : "Removed from your guidance."));
        if (targetStudentId && !result.notice) {
          setNotice(result.selected ? "Added to this student's guidance." : "Removed from this student's guidance.");
        }
        // Make the destination visible immediately after a learner saves an
        // item. Admins editing another student's plan stay on this screen.
        if (result.selected && selection.kind === "learningFocus" && !targetStudentId) onOpenPlan?.();
      } finally {
        if (pathWrites.get(key) === operation) pathWrites.delete(key);
      }
    } catch {
      setNotice(targetStudentId ? "Could not save this student's selection yet." : "Create an account to save this report path.");
    } finally {
      setBusy(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(null), 3200);
    }
  };

  return (
    <View style={styles.wrap}>
      <SifterButton
        label={busy ? "Saving..." : selected ? (selection.kind === "learningFocus" ? "Remove from my focus" : "Selected") : selection.kind === "programmes" ? "Select programme" : selection.kind === "learningFocus" ? "Add to my focus" : "Select"}
        icon={busy ? undefined : selected ? "check-circle" : "circle"}
        onPress={add}
        variant="ghost"
        size="sm"
        fullWidth={false}
        disabled={busy}
      />
      {busy ? <ActivityIndicator size="small" color={colors.textRole.muted} /> : null}
      {selected && selection.kind === "learningFocus" && onOpenPlan ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open my learning tray" onPress={onOpenPlan} style={[styles.trayIcon, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <Feather name="briefcase" size={17} color={colors.accentRole.action} />
      </TouchableOpacity> : null}
      {notice ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>{notice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "flex-start", gap: Spacing.xs },
  trayIcon: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  notice: { fontSize: FontSize.xs, maxWidth: 230 },
});

export default GuidanceReportButton;
