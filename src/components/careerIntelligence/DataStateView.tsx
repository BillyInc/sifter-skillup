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
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize } from "../../theme";
import type { DataState, DataStatus } from "../../types/career";

const PRESET: Record<
  Exclude<DataStatus, "real">,
  { icon: keyof typeof Feather.glyphMap; title: string; body: string }
> = {
  coming_soon: {
    icon: "lock",
    title: "Locked",
    body: "This surface is designed and waiting for verified data.",
  },
  locked: {
    icon: "lock",
    title: "Locked",
    body: "Create an account or wait for release to unlock this surface.",
  },
  pending: {
    icon: "clock",
    title: "Data pending",
    body: "Verified detail is still being added. This will update automatically.",
  },
  fallback: {
    icon: "info",
    title: "Standard data",
    body: "Showing the national standard while detailed data is added.",
  },
  error: {
    icon: "alert-triangle",
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
        <ActivityIndicator color={colors.accentRole.action} />
      </View>
    );
  }

  if (state.status === "real" && state.data != null) {
    if (empty && empty(state.data)) {
      return (
        <StatePanel
          icon="inbox"
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
    icon: keyof typeof Feather.glyphMap;
    title: string;
    body: string;
    compact?: boolean;
  }) {
    if (isCompact) {
      return (
        <View
          style={[
            styles.compact,
            { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Feather name={icon} size={15} color={colors.state.locked} />
          <Text
            style={[styles.compactText, { color: colors.textRole.muted }]}
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
          { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
        ]}
      >
        <View style={[styles.panelIcon, { backgroundColor: colors.state.lockedSoft }]}>
          <Feather name={icon} size={20} color={colors.state.locked} />
        </View>
        <Text style={[styles.panelTitle, { color: colors.textRole.primary }]}>{title}</Text>
        <Text style={[styles.panelBody, { color: colors.textRole.secondary }]}>
          {body}
        </Text>
      </View>
    );
  }
}

function lockedPreviewFor(notice?: string): {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
} {
  const copy = notice?.trim();
  const lower = copy?.toLowerCase() ?? "";
  const icon =
    lower.includes("scholarship") || lower.includes("application window")
      ? "calendar"
      : lower.includes("admission") || lower.includes("jamb") || lower.includes("cut-off")
        ? "book-open"
        : lower.includes("elite")
          ? "award"
          : lower.includes("phd")
            ? "search"
            : lower.includes("charter") || lower.includes("credential")
              ? "file-text"
              : lower.includes("qualification") || lower.includes("upgrade")
                ? "trending-up"
                : lower.includes("opportunit") || lower.includes("internship") || lower.includes("job")
                  ? "briefcase"
                  : lower.includes("employer") || lower.includes("organisation")
                    ? "home"
                    : lower.includes("domain") || lower.includes("role") || lower.includes("search")
                      ? "compass"
                      : lower.includes("salary") || lower.includes("demand") || lower.includes("market")
                        ? "bar-chart-2"
                        : lower.includes("note") || lower.includes("saved")
                          ? "folder"
                          : "lock";

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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: "center",
    gap: 4,
  },
  panelIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  compactText: { flex: 1, fontSize: FontSize.xs, fontWeight: "600" },
});
