import React, { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme, FontSize, Spacing } from "../../theme";
import { SifterButton } from "../ui";
import { careerData } from "../../lib/careerData";
import { provisioningData } from "../../lib/provisioningData";
import { useAuth } from "@/hooks/useAuth";

type BranchKind = "domains" | "subgroups" | "roles";
type GuidanceListItem = { id: string };
type GuidancePathRecord = Record<string, GuidanceListItem[] | unknown>;

function guidanceItems(path: GuidancePathRecord, kind: BranchKind): GuidanceListItem[] {
  const value = path[kind];
  return Array.isArray(value)
    ? value.filter((entry): entry is GuidanceListItem => Boolean(
      entry && typeof entry === "object" && "id" in entry && typeof (entry as { id?: unknown }).id === "string",
    ))
    : [];
}

// The record is deliberately loose: alongside the branch arrays it also
// carries academicContext, subjects, notes and other non-array members. That
// is already expressed by the declaration above -- this file briefly carried
// two `GuidancePathRecord` declarations after a merge, which is a hard tsc
// error (TS2300). `unknown` is kept over `any` because `guidanceItems` does
// the narrowing properly.

const pathCache = new Map<string, GuidancePathRecord>();
const pathReads = new Map<string, Promise<GuidancePathRecord>>();

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
      setSelected(list.some((entry) => entry.id === selection.id));
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
      const path = await readGuidancePath(targetStudentId, ownerId);
      const list = guidanceItems(path, selection.kind);
      const item = {
        id: selection.id,
        name: selection.name,
        ...(selection.domainId ? { domainId: selection.domainId } : {}),
        ...(selection.domainName ? { domainName: selection.domainName } : {}),
        ...(selection.subgroupId ? { subgroupId: selection.subgroupId } : {}),
        ...(selection.subgroupName ? { subgroupName: selection.subgroupName } : {}),
        ...(selection.matchType ? { matchType: selection.matchType } : {}),
      };
      const nextList = selected
        ? list.filter((entry) => entry.id !== selection.id)
        : [...list.filter((entry) => entry.id !== selection.id), item];
      if (targetStudentId) {
        const nextPath = {
          ...path,
          [selection.kind]: nextList,
        };
        await provisioningData.saveGuidancePath(targetStudentId, nextPath);
        pathCache.set(pathCacheKey(targetStudentId, ownerId), nextPath);
        setSelected(!selected);
        setNotice(selected ? "Removed from this student's guidance." : "Added to this student's guidance.");
      } else {
        const saved = await careerData.saveGuidancePath({
          source: "explore",
          path: { ...path, [selection.kind]: nextList },
        });
        if (saved.status === "real") {
          pathCache.set(pathCacheKey(undefined, ownerId), { ...path, [selection.kind]: nextList });
          setSelected(!selected);
          setNotice(selected ? "Removed from your guidance." : "Added to your guidance.");
        } else {
          setNotice(saved.meta?.notice ?? "Create an account to save this report path.");
        }
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
        label={busy ? "Saving..." : selected ? "Selected" : "Add to guidance"}
        icon={busy ? undefined : selected ? "check" : "bookmark"}
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
