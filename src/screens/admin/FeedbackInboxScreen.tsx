/**
 * FeedbackInboxScreen — the admin-side inbox for user feedback.
 *
 * Reads GET /api/feedback (recent feedback, newest first) and renders it in the
 * shared AdminDataTable inside the AdminShell chrome. Mirrors the shell/scaffold
 * pattern of the other admin screens (e.g. RoleDemandScreen): fetch into a
 * DataState, then branch through ComingSoonPanel so an empty / unavailable inbox
 * degrades gracefully instead of showing a blank or a fabricated list.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { request } from "@/lib/api";
import { type DataState, comingSoon, real } from "../../types/career";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { ColumnDef } from "@/components/admin/AdminDataTable";

interface FeedbackRow {
  id: string;
  userId?: string | null;
  type?: string | null;
  message?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  rating?: number | null;
  createdAt?: string | null;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLUMNS: ColumnDef[] = [
  {
    key: "createdAt",
    label: "When",
    width: 120,
    render: (val: string) => formatDate(val),
  },
  { key: "type", label: "Type", width: 90, render: (v: string) => v ?? "—" },
  {
    key: "rating",
    label: "Rating",
    width: 80,
    render: (val: number | null) =>
      val != null ? "★".repeat(val) + "☆".repeat(Math.max(0, 5 - val)) : "—",
  },
  {
    key: "message",
    label: "Message",
    render: (val: string) => val ?? "—",
  },
  {
    key: "entityType",
    label: "On",
    width: 100,
    render: (_: any, row: FeedbackRow) =>
      row.entityType ? `${row.entityType}${row.entityId ? ` · ${row.entityId}` : ""}` : "—",
  },
];

/** Fetches the feedback inbox, degrading to a coming_soon envelope on error. */
async function getFeedback(): Promise<DataState<FeedbackRow[]>> {
  try {
    const rows = await request<FeedbackRow[]>("/api/feedback");
    return real<FeedbackRow[]>(Array.isArray(rows) ? rows : []);
  } catch {
    return comingSoon<FeedbackRow[]>("The feedback inbox is being loaded.");
  }
}

export function FeedbackInboxScreen() {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState<DataState<FeedbackRow[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    getFeedback().then((d) => {
      if (active) setFeedback(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell title="Feedback Inbox" eyebrow="User feedback">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Recent feedback
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Ratings and messages submitted from the app — reviews, bug reports
            and suggestions, newest first.
          </Text>
          <ComingSoonPanel
            state={feedback}
            empty={(rows) => rows.length === 0}
            emptyTitle="No feedback yet"
            emptyBody="Submitted feedback appears here as it comes in."
          >
            {(rows) => <AdminDataTable columns={COLUMNS} data={rows} />}
          </ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default FeedbackInboxScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
