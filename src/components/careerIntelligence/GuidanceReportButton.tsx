import React, { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme, FontSize, Spacing } from "../../theme";
import { SifterButton } from "../ui";
import { careerData } from "../../lib/careerData";
import { provisioningData } from "../../lib/provisioningData";
import { useAuth } from "@/hooks/useAuth";

type BranchKind = "programmes" | "domains" | "subgroups" | "roles";
type GuidanceListItem = { id: string; programme?: { id?: string } };
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

/** Review completion is a deliberate checkpoint, not merely reaching the tab. */
export function isGuidanceReviewComplete(path: Record<string, unknown> | null | undefined): boolean {
  const resume = asRecord(path?.resume);
  return resume?.stage === "review" && resume?.status === "complete";
}

export function isGuidanceReportReady(path: Record<string, unknown> | null | undefined): boolean {
  return hasGuidanceReportContext(path) && isGuidanceReviewComplete(path);
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
  matchType?: string;
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
  const selected = list.some((entry) => selectionId(entry, selection.kind) === selection.id);
  const item = {
    id: selection.id,
    name: selection.name,
    ...(selection.kind === "programmes" ? { programme: { id: selection.id, name: selection.name } } : {}),
    ...(selection.domainId ? { domainId: selection.domainId } : {}),
    ...(selection.domainName ? { domainName: selection.domainName } : {}),
    ...(selection.subgroupId ? { subgroupId: selection.subgroupId } : {}),
    ...(selection.subgroupName ? { subgroupName: selection.subgroupName } : {}),
    ...(selection.matchType ? { matchType: selection.matchType } : {}),
  };
  const nextList = selected
    ? list.filter((entry) => selectionId(entry, selection.kind) !== selection.id)
    : [...list.filter((entry) => selectionId(entry, selection.kind) !== selection.id), item];
  const resume = asRecord(path.resume);
  return {
    ...path,
    [selection.kind]: nextList,
    resume: {
      ...(resume ?? {}),
      stage: "in_progress",
      status: "in_progress",
    },
  };
}

export function GuidanceReportButton({
  selection,
  targetStudentId,
}: {
  selection: GuidanceReportSelection;
  targetStudentId?: string;
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
      setSelected(list.some((entry) => selectionId(entry, selection.kind) === selection.id));
    });
    return () => {
      active = false;
    };
  }, [ownerId, selection.kind, selection.id, targetStudentId]);

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
          const nextSelected = guidanceItems(nextPath, selection.kind).some(
            (entry) => selectionId(entry, selection.kind) === selection.id,
          );
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
        label={busy ? "Saving..." : selected ? "Selected" : selection.kind === "programmes" ? "Select programme" : "Select"}
        icon={busy ? undefined : selected ? "check-circle" : "circle"}
        onPress={add}
        variant="ghost"
        size="sm"
        fullWidth={false}
        disabled={busy}
      />
      {busy ? <ActivityIndicator size="small" color={colors.textRole.muted} /> : null}
      {notice ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>{notice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "flex-start", gap: Spacing.xs },
  notice: { fontSize: FontSize.xs, maxWidth: 230 },
});

export default GuidanceReportButton;
