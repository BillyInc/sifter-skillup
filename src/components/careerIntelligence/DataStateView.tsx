/**
 * DataStateView — renders children only when a DataState is `real`, otherwise
 * shows a compact, on-brand inline state (locked preview / locked / pending /
 * error / empty). This is how the whole career module honours the rule:
 * unbuilt or unpopulated areas read as locked previews — never a blank or a fake.
 *
 * Use it to wrap any data-driven block:
 *   <DataStateView state={state} empty={(d) => d.length === 0}>
 *     {(data) => <RoleList roles={data} />}
 *   </DataStateView>
 */
import React, { type ReactNode } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme, Spacing, Radius, FontSize, Brand } from "../../theme";
import type { DataState, DataStatus } from "../../types/career";

const PRESET: Record<
  Exclude<DataStatus, "real">,
  { icon: string; title: string; body: string }
> = {
  coming_soon: {
    icon: "🔒",
    title: "Locked",
    body: "This page is designed, but the verified data is not ready yet.",
  },
  locked: {
    icon: "🔒",
    title: "Locked",
    body: "Create an account or wait for release to unlock this surface.",
  },
  pending: {
    icon: "🕐",
    title: "Data pending",
    body: "We’re still adding detail here. It will update automatically.",
  },
  fallback: {
    icon: "ℹ️",
    title: "Standard data",
    body: "Showing the national standard while detailed data is added.",
  },
  error: {
    icon: "⚠️",
    title: "Something went wrong",
    body: "Please try again in a moment.",
  },
};

export interface DataStateViewProps<T> {
  state: DataState<T>;
  /** Render the populated content. */
  children: (data: T) => ReactNode;
  /** Treat a `real` value as empty (e.g. an empty array) → shows empty state. */
  empty?: (data: T) => boolean;
  /** Override the empty-state copy. */
  emptyTitle?: string;
  emptyBody?: string;
  /** Show a spinner instead of a panel for `pending`. */
  spinnerOnPending?: boolean;
  /** Compact single-line variant for inline use. */
  compact?: boolean;
}

export function DataStateView<T>({
  state,
  children,
  empty,
  emptyTitle = "Nothing here yet",
  emptyBody = "There’s nothing to show right now.",
  spinnerOnPending,
  compact,
}: DataStateViewProps<T>) {
  const { colors } = useTheme();

  if (state.status === "pending" && spinnerOnPending) {
    return (
      <View style={styles.spinner}>
        <ActivityIndicator color={Brand.primary} />
      </View>
    );
  }

  if (state.status === "real" && state.data != null) {
    if (empty && empty(state.data)) {
      return (
        <StatePanel
          icon="📭"
          title={emptyTitle}
          body={state.meta?.notice ?? emptyBody}
          compact={compact}
        />
      );
    }
    return <>{children(state.data)}</>;
  }

  const preset =
    state.status === "coming_soon"
      ? lockedPreviewFor(state.meta?.notice)
      : PRESET[state.status as Exclude<DataStatus, "real">] ?? PRESET.coming_soon;
  return (
    <StatePanel
      icon={preset.icon}
      title={preset.title}
      body={state.meta?.notice ?? preset.body}
      compact={compact}
    />
  );

  function StatePanel({
    icon,
    title,
    body,
    compact: isCompact,
  }: {
    icon: string;
    title: string;
    body: string;
    compact?: boolean;
  }) {
    if (isCompact) {
      return (
        <View
          style={[
            styles.compact,
            { backgroundColor: colors.bgSecondary, borderColor: colors.border },
          ]}
        >
          <Text style={styles.compactIcon}>{icon}</Text>
          <Text
            style={[styles.compactText, { color: colors.textMuted }]}
            numberOfLines={2}
          >
            {title} · {body}
          </Text>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.panel,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={styles.panelIcon}>{icon}</Text>
        <Text style={[styles.panelTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.panelBody, { color: colors.textSoft }]}>
          {body}
        </Text>
      </View>
    );
  }
}

function lockedPreviewFor(notice?: string): {
  icon: string;
  title: string;
  body: string;
} {
  const copy = notice?.trim();
  const lower = copy?.toLowerCase() ?? "";
  const icon =
    lower.includes("scholarship") || lower.includes("application window")
      ? "🎯"
      : lower.includes("admission") || lower.includes("jamb") || lower.includes("cut-off")
        ? "🎓"
        : lower.includes("elite")
          ? "⭐"
          : lower.includes("phd")
            ? "🔬"
            : lower.includes("charter") || lower.includes("credential")
              ? "📜"
              : lower.includes("qualification") || lower.includes("upgrade")
                ? "🪜"
                : lower.includes("opportunit") || lower.includes("internship") || lower.includes("job")
                  ? "💼"
                  : lower.includes("employer") || lower.includes("organisation")
                    ? "🏢"
                    : lower.includes("domain") || lower.includes("role") || lower.includes("search")
                      ? "🧭"
                      : lower.includes("salary") || lower.includes("demand") || lower.includes("market")
                        ? "📊"
                        : lower.includes("note") || lower.includes("saved")
                          ? "🗂️"
                          : "🔒";

  return {
    icon,
    title: "Locked",
    body:
      copy ??
      "This page is ready in shape and waiting for verified data before it opens.",
  };
}

export default DataStateView;

const styles = StyleSheet.create({
  spinner: { paddingVertical: Spacing.xxl, alignItems: "center" },
  panel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: 4,
  },
  panelIcon: { fontSize: 32 },
  panelTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    marginTop: Spacing.xs,
  },
  panelBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
    maxWidth: 360,
  },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  compactIcon: { fontSize: 14 },
  compactText: { flex: 1, fontSize: FontSize.xs, fontWeight: "600" },
});
