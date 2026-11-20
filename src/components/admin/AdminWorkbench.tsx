/**
 * AdminWorkbench: the two "what do I do now" modules at the top of an admin
 * home (blueprint: Home workbench).
 *
 *   - "Attention needed": real counts from the student-intelligence payload
 *     the dashboards already load, each one a link to an existing admin route.
 *   - "Pick up where you left off": the last admin task / page from the
 *     client-side resume store (`adminResume`). No new backend.
 *
 * Neither module invents anything. While the payload is pending, unavailable
 * or locked the attention module renders nothing, and the resume module
 * renders nothing until the store has something worth resuming. Signals the
 * API does not supply (claim expiry, import rows to review, incomplete
 * subject profiles, an activity log) are deliberately absent.
 */
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { adminNav, type Nav } from "@/lib/adminNav";
import { getAdminResume, getAdminTask } from "@/lib/adminResume";
import {
  attentionItems,
  formatLastOpened,
  pickResume,
  type AttentionDestination,
  type ResumeCandidate,
} from "@/lib/adminHomeSignals";
import { useAuth } from "@/hooks/useAuth";
import type { DataState } from "../../types/career";
import type { StudentIntelligenceSummary } from "../../types/institution";

export interface AdminWorkbenchProps {
  students: DataState<StudentIntelligenceSummary>;
  /** Tutorial centres and JAMB cafes: attention items open the JAMB accounts. */
  providerOnly?: boolean;
  /** Wide layouts place the two modules side by side. */
  wide?: boolean;
}

export function AdminWorkbench({
  students,
  providerOnly = false,
  wide = false,
}: AdminWorkbenchProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [resume, setResume] = useState<ResumeCandidate | null>(null);

  useEffect(() => {
    let active = true;
    // Both getters swallow storage errors and resolve to null.
    Promise.all([getAdminTask(user?.id), getAdminResume(user?.id)]).then(
      ([task, page]) => {
        if (active) setResume(pickResume(task, page));
      },
      () => {
        if (active) setResume(null);
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id]);

  const open = (destination: AttentionDestination) => {
    if (destination === "jambAccounts") adminNav.jambAccounts(router as Nav);
    else adminNav.students(router as Nav);
  };

  const attention =
    students.status === "real" && students.data ? (
      <AttentionNeededPanel
        summary={students.data}
        providerOnly={providerOnly}
        onOpen={open}
      />
    ) : null;
  const resumePanel = resume ? (
    <ResumePanel
      resume={resume}
      onOpen={() => router.push(resume.href as never)}
    />
  ) : null;

  if (!attention && !resumePanel) return null;
  return (
    <View
      style={[styles.row, wide && styles.rowWide]}
      accessibilityLabel="Admin workbench"
    >
      {attention ? <View style={wide ? styles.cell : undefined}>{attention}</View> : null}
      {resumePanel ? <View style={wide ? styles.cell : undefined}>{resumePanel}</View> : null}
    </View>
  );
}

export function AttentionNeededPanel({
  summary,
  providerOnly,
  onOpen,
}: {
  summary: StudentIntelligenceSummary;
  providerOnly?: boolean;
  onOpen: (destination: AttentionDestination) => void;
}) {
  const { colors } = useTheme();
  const items = attentionItems(summary, { providerOnly });
  return (
    <View
      style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.title, CompassFonts.displayBold, { color: colors.text }]}>
        Attention needed
      </Text>
      {items.length ? (
        <View>
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => onOpen(item.destination)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}. ${item.actionLabel}`}
              style={[styles.item, { borderTopColor: colors.border }]}
            >
              <Feather
                name={item.key === "unclaimed_codes" ? "key" : "compass"}
                size={18}
                color={colors.accent}
              />
              <Text
                style={[styles.itemText, CompassFonts.bodySemibold, { color: colors.text }]}
              >
                {item.label}
              </Text>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.clear}>
          <Feather name="check-circle" size={18} color={colors.textMuted} />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            No unused claim codes or unrecorded stages right now.
          </Text>
        </View>
      )}
    </View>
  );
}

export function ResumePanel({
  resume,
  onOpen,
}: {
  resume: ResumeCandidate;
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const when = formatLastOpened(resume.updatedAt);
  return (
    <View
      style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.title, CompassFonts.displayBold, { color: colors.text }]}>
        Pick up where you left off
      </Text>
      <TouchableOpacity
        onPress={onOpen}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Continue: ${resume.label}${when ? `. Last opened ${when}` : ""}`}
        style={[styles.item, { borderTopColor: colors.border }]}
      >
        <Feather name="corner-down-right" size={18} color={colors.accent} />
        <View style={styles.itemMain}>
          <Text
            style={[styles.itemLabel, CompassFonts.bodySemibold, { color: colors.text }]}
          >
            {resume.label}
          </Text>
          {when ? (
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Last opened {when}
            </Text>
          ) : null}
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.lg },
  rowWide: { flexDirection: "row", alignItems: "flex-start" },
  cell: { flex: 1, minWidth: 260 },
  panel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: { fontSize: FontSize.lg },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  itemMain: { flex: 1, gap: 2 },
  itemText: { flex: 1, fontSize: FontSize.md },
  itemLabel: { fontSize: FontSize.md },
  clear: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  note: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});

export default AdminWorkbench;
