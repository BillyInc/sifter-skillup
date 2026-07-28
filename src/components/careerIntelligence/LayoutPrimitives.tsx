import React, { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CompassFonts,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
} from "../../theme";

// ── ScreenHeader ────────────────────────────────────────────────
// Reusable eyebrow + title + subtitle + optional back button.
// Replaces the repeated header pattern found in 12/16 legacy screens.

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  right,
  style,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.header, style]}>
      {onBack ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBack}
          style={[styles.backBtn, { backgroundColor: colors.surface.subtle }]}
        >
          <Feather name="arrow-left" size={16} color={colors.textRole.primary} />
        </TouchableOpacity>
      ) : null}
      <View style={[styles.headerContent, onBack && { marginLeft: Spacing.sm }]}>
        {eyebrow ? (
          <Text style={[styles.headerEyebrow, { color: colors.textRole.muted }]}>
            {eyebrow}
          </Text>
        ) : null}
        <View style={styles.headerTitleRow}>
          <Text
            style={[CompassFonts.displayBold, styles.headerTitle, { color: colors.textRole.primary }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {right ? <View style={styles.headerRight}>{right}</View> : null}
        </View>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, { color: colors.textRole.secondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Card ────────────────────────────────────────────────────────
// Bordered container using semantic tokens. Use for repeated items,
// compact summaries, and content blocks.

export function Card({
  children,
  onPress,
  style,
  variant = "default",
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "subtle";
}) {
  const { colors } = useTheme();
  const bg =
    variant === "elevated"
      ? colors.surface.raised
      : variant === "subtle"
        ? colors.surface.subtle
        : colors.surface.raised;
  const border =
    variant === "subtle"
      ? "transparent"
      : colors.borderRole.subtle;

  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      activeOpacity={onPress ? 0.78 : 1}
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: bg, borderColor: border },
        variant === "elevated" && { ...Shadow },
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
}

const Shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

// ── Banner ──────────────────────────────────────────────────────
// Unified notice bar for info, warning, success, guest, offline, sync,
// streak, and celebration states. Replaces scattered OfflineBanner,
// StreakUrgencyBanner, and inline CelebrationOverlay message strips.
//
// Semantic tokens only. Preserves existing 4-variant API and adds new ones.

export type BannerVariant =
  | "info"
  | "warning"
  | "success"
  | "guest"
  | "offline"
  | "sync"
  | "streak"
  | "celebration";

export function Banner({
  message,
  variant = "info",
  icon,
  action,
  onAction,
  onDismiss,
  style,
}: {
  message: string;
  variant?: BannerVariant;
  icon?: keyof typeof Feather.glyphMap;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  const palette = {
    info:         { bg: colors.accentRole.status + "12",  border: colors.accentRole.status + "30",  text: colors.accentRole.status,   icon: "info" as const },
    warning:      { bg: colors.accentRole.warning + "12", border: colors.accentRole.warning + "30", text: colors.accentRole.warning,  icon: "alert-triangle" as const },
    success:      { bg: colors.accentRole.success + "12", border: colors.accentRole.success + "30", text: colors.accentRole.success,  icon: "check-circle" as const },
    guest:        { bg: colors.accentRole.warning + "0A", border: colors.accentRole.warning + "20", text: colors.accentRole.warning,  icon: "gift" as const },
    offline:      { bg: colors.accentRole.danger + "12",  border: colors.accentRole.danger + "30",  text: colors.accentRole.danger,   icon: "wifi-off" as const },
    sync:         { bg: colors.accentRole.status + "0A",  border: colors.accentRole.status + "20",  text: colors.accentRole.status,   icon: "refresh-cw" as const },
    streak:       { bg: colors.accentRole.warning + "10", border: colors.accentRole.warning + "28", text: colors.accentRole.warning,  icon: "zap" as const },
    celebration:  { bg: colors.accentRole.success + "10", border: colors.accentRole.success + "28", text: colors.accentRole.success,  icon: "star" as const },
  }[variant];

  return (
    <View style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <Feather name={icon ?? palette.icon} size={15} color={palette.text} />
      <Text style={[styles.bannerText, { color: palette.text }]} numberOfLines={3}>
        {message}
      </Text>
      {action ? (
        <TouchableOpacity activeOpacity={0.75} onPress={onAction} disabled={!onAction}>
          <Text style={[styles.bannerAction, { color: palette.text }]}>{action}</Text>
        </TouchableOpacity>
      ) : null}
      {onDismiss ? (
        <TouchableOpacity activeOpacity={0.75} onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={14} color={palette.text} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── SettingsRow ─────────────────────────────────────────────────
// Label + value/chevron/toggle row for settings and profile screens.

export function SettingsRow({
  label,
  value,
  icon,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  danger,
  style,
}: {
  label: string;
  value?: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const textColor = danger ? colors.accentRole.danger : colors.textRole.primary;
  const valueColor = danger ? colors.accentRole.danger : colors.textRole.muted;

  const Wrapper = onPress || toggle ? TouchableOpacity : View;
  return (
    <Wrapper
      activeOpacity={0.78}
      onPress={toggle ? () => onToggle?.(!toggleValue) : onPress}
      style={[styles.settingsRow, { borderBottomColor: colors.borderRole.subtle }, style]}
    >
      <View style={styles.settingsRowLeft}>
        {icon ? (
          <Feather name={icon} size={16} color={textColor} style={styles.settingsIcon} />
        ) : null}
        <Text style={[styles.settingsLabel, { color: textColor }]}>{label}</Text>
      </View>
      {toggle ? (
        <View
          style={[
            styles.toggleTrack,
            {
              backgroundColor: toggleValue ? colors.accentRole.action : colors.surface.subtle,
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: colors.surface.raised,
                transform: [{ translateX: toggleValue ? 18 : 0 }],
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.settingsRowRight}>
          {value ? (
            <Text style={[styles.settingsValue, { color: valueColor }]} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          {onPress ? (
            <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
          ) : null}
        </View>
      )}
    </Wrapper>
  );
}

// ── LinkButton ──────────────────────────────────────────────────
// Text-only button with arrow. Used for "View all", "Explore", etc.

export function LinkButton({
  label,
  onPress,
  icon = "arrow-right",
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.linkButton, style]}
    >
      <Text style={[styles.linkButtonText, { color: colors.accentRole.action }]}>
        {label}
      </Text>
      <Feather name={icon} size={13} color={colors.accentRole.action} />
    </TouchableOpacity>
  );
}

// ── KeyValueRow ─────────────────────────────────────────────────
// Label-value pair for admin/verification/inspection screens.

export function KeyValueRow({
  label,
  value,
  mono,
  style,
}: {
  label: string;
  value: string;
  mono?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.kvRow, style]}>
      <Text style={[styles.kvLabel, { color: colors.textRole.muted }]}>{label}</Text>
      <Text
        style={[
          mono ? CompassFonts.data : styles.kvValue,
          { color: colors.textRole.primary },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ── InfoCard ────────────────────────────────────────────────────
// Icon + title + body bordered card. Used for feature explanations,
// requirement lists, and capability blocks.

export function InfoCard({
  icon,
  title,
  body,
  style,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
        style,
      ]}
    >
      {icon ? (
        <View style={[styles.infoCardIcon, { backgroundColor: colors.surface.subtle }]}>
          <Feather name={icon} size={16} color={colors.accentRole.action} />
        </View>
      ) : null}
      <View style={styles.infoCardContent}>
        <Text style={[styles.infoCardTitle, { color: colors.textRole.primary }]}>{title}</Text>
        <Text style={[styles.infoCardBody, { color: colors.textRole.secondary }]}>{body}</Text>
      </View>
    </View>
  );
}

// ── Callout ─────────────────────────────────────────────────────
// Accent-bordered note block. Used for tips, warnings, product notes.

export function Callout({
  title,
  body,
  variant = "action",
  style,
}: {
  title?: string;
  body: string;
  variant?: "action" | "warning" | "success";
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const palette = {
    action: { bg: colors.accentRole.action + "0A", border: colors.accentRole.action + "30", text: colors.accentRole.action },
    warning: { bg: colors.accentRole.warning + "0A", border: colors.accentRole.warning + "30", text: colors.accentRole.warning },
    success: { bg: colors.accentRole.success + "0A", border: colors.accentRole.success + "30", text: colors.accentRole.success },
  }[variant];

  return (
    <View style={[styles.callout, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      {title ? (
        <Text style={[styles.calloutTitle, { color: palette.text }]}>{title}</Text>
      ) : null}
      <Text style={[styles.calloutBody, { color: colors.textRole.secondary }]}>{body}</Text>
    </View>
  );
}

// ── StatCard ────────────────────────────────────────────────────
// Label + mono value + optional delta. Used in streaks, guild, dashboards.

export function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
  style,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const toneColor =
    tone === "positive"
      ? colors.accentRole.success
      : tone === "negative"
        ? colors.accentRole.danger
        : tone === "warning"
          ? colors.accentRole.warning
          : colors.textRole.muted;

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
        style,
      ]}
    >
      <Text style={[styles.statCardLabel, { color: colors.textRole.muted }]}>{label}</Text>
      <Text style={[CompassFonts.dataMedium, styles.statCardValue, { color: colors.textRole.primary }]}>
        {value}
      </Text>
      {delta ? (
        <Text style={[styles.statCardDelta, { color: toneColor }]}>{delta}</Text>
      ) : null}
    </View>
  );
}

// ── EmptyState ──────────────────────────────────────────────────
// Illustrated empty state with route-line motif and CTA.

export function EmptyState({
  icon = "inbox",
  title,
  message,
  action,
  onAction,
  style,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.emptyState, style]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface.subtle }]}>
        <Feather name={icon} size={24} color={colors.textRole.muted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textRole.primary }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.textRole.secondary }]}>{message}</Text>
      {action ? (
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={onAction}
          disabled={!onAction}
          style={[styles.emptyAction, { backgroundColor: colors.accentRole.action }]}
        >
          <Text style={[styles.emptyActionText, { color: colors.textRole.inverse }]}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ScreenHeader
  header: {
    gap: Spacing.xs,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  headerContent: {
    gap: 4,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxxl,
    lineHeight: FontSize.xxxl * 1.25,
    flex: 1,
  },
  headerRight: {
    flexShrink: 0,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  // Card
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
  },
  bannerAction: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    flexShrink: 0,
  },
  // SettingsRow
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  settingsIcon: {
    width: 20,
    textAlign: "center",
  },
  settingsLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  settingsValue: {
    fontSize: FontSize.sm,
    maxWidth: 160,
  },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  // LinkButton
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 28,
  },
  linkButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  // KeyValueRow
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  kvLabel: {
    fontSize: FontSize.sm,
    flexShrink: 0,
  },
  kvValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textAlign: "right",
    flex: 1,
  },
  // InfoCard
  infoCard: {
    flexDirection: "row",
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "flex-start",
  },
  infoCardIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoCardContent: {
    flex: 1,
    gap: 3,
  },
  infoCardTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  infoCardBody: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
  // Callout
  callout: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  calloutTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  calloutBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  // StatCard
  statCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statCardValue: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.2,
  },
  statCardDelta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  // EmptyState
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: FontSize.sm * 1.5,
    maxWidth: 280,
  },
  emptyAction: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  emptyActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
