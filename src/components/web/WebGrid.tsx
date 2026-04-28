/**
 * Sifter Skill_Up — Web Grid System
 *
 * Primitives for 2–3 column dashboard layouts on web >= 768px.
 * Screens import these and render them inside isWebWide branches.
 *
 * Usage:
 *   <WebShell title="Home">
 *     <WebRow>
 *       <WebCol weight={2}><MyBigCard /></WebCol>
 *       <WebCol weight={1}><MySideCard /></WebCol>
 *     </WebRow>
 *     <WebRow cols={3}>
 *       <TrackCard /><TrackCard /><TrackCard />
 *     </WebRow>
 *   </WebShell>
 */

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform, useWindowDimensions,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../theme';

// ─── Constants ──────────────────────────────────────────────────────────────────

export const WEB_BREAKPOINT   = 768;
export const WEB_MAX_WIDTH    = 1088;
export const WEB_SIDEBAR_W    = 204;
export const GRID_GAP         = 10;
export const GRID_GAP_SM      = 8;

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useIsWebWide() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= WEB_BREAKPOINT;
}

// ─── WebShell ───────────────────────────────────────────────────────────────────
// Full-page scroll wrapper with constrained max-width and consistent padding.

export function WebShell({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.shell, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
      <View style={{ height: 64 }} />
    </ScrollView>
  );
}

// ─── WebPageHeader ───────────────────────────────────────────────────────────────
// Consistent page-level heading row with title + optional right actions.

export function WebPageHeader({
  title,
  subtitle,
  right,
  accentColor,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  accentColor?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.pageHeader}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.pageSubtitle, { color: colors.textSoft }]}>{subtitle}</Text>
        )}
      </View>
      {right && <View style={styles.pageHeaderRight}>{right}</View>}
      <View style={[styles.pageHeaderLine, { backgroundColor: accentColor ?? colors.accent }]} />
    </View>
  );
}

// ─── WebSectionLabel ──────────────────────────────────────────────────────────

export function WebSectionLabel({ label, action, onAction }: {
  label: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={[styles.sectionAction, { color: colors.accent }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── WebRow ───────────────────────────────────────────────────────────────────
// Flex row with gap. Children are WebCol components.

export function WebRow({
  children,
  cols,
  gap = GRID_GAP,
  style,
}: {
  children: React.ReactNode;
  cols?: number;          // if provided, renders equal-width auto-wrapping grid
  gap?: number;
  style?: any;
}) {
  if (cols) {
    // Equal-width grid: children get flex: 0 width=(100/cols)%
    const colWidth = `${100 / cols}%` as any;
    return (
      <View style={[styles.row, { gap, flexWrap: 'wrap' }, style]}>
        {React.Children.map(children, (child) =>
          child ? (
            <View style={{ width: colWidth, paddingRight: 0 }}>{child}</View>
          ) : null
        )}
      </View>
    );
  }
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

// ─── WebCol ───────────────────────────────────────────────────────────────────
// Flex column with weight-based sizing.

export function WebCol({
  children,
  weight = 1,
  style,
}: {
  children: React.ReactNode;
  weight?: number;
  style?: any;
}) {
  return (
    <View style={[{ flex: weight }, style]}>{children}</View>
  );
}

// ─── WebCard ──────────────────────────────────────────────────────────────────
// Elevated card with consistent styling.

export function WebCard({
  children,
  style,
  title,
  titleRight,
  accentBar,
  accentColor,
  noPad,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  title?: string;
  titleRight?: React.ReactNode;
  accentBar?: boolean;
  accentColor?: string;
  noPad?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const inner = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        Shadow.sm,
        noPad && { padding: 0, overflow: 'hidden' },
        style,
      ]}
    >
      {accentBar && (
        <View style={[styles.cardAccentBar, { backgroundColor: accentColor ?? colors.accent }]} />
      )}
      {title && (
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          {titleRight}
        </View>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

// ─── WebStatTile ──────────────────────────────────────────────────────────────
// Compact stat display used in side columns.

export function WebStatTile({
  emoji, label, value, sub, color,
}: {
  emoji: string; label: string; value: string; sub?: string; color: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: color + '28' }, Shadow.xs]}>
      <Text style={styles.statTileEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statTileValue, { color }]}>{value}</Text>
        <Text style={[styles.statTileLabel, { color: colors.textSoft }]}>{label}</Text>
        {sub && <Text style={[styles.statTileSub, { color: colors.textMuted }]}>{sub}</Text>}
      </View>
    </View>
  );
}

// ─── WebDivider ───────────────────────────────────────────────────────────────

export function WebDivider({ label }: { label?: string }) {
  const { colors } = useTheme();
  if (!label) return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
  return (
    <View style={styles.dividerLabeled}>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.dividerLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

// ─── WebListRow ───────────────────────────────────────────────────────────────
// Standard list row with icon, text, optional badge.

export function WebListRow({
  icon, title, sub, badge, badgeColor, onPress, right,
}: {
  icon: string;
  title: string;
  sub?: string;
  badge?: string | number;
  badgeColor?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const rightNode = typeof right === 'string' || typeof right === 'number'
    ? <Text style={[styles.listRowRightText, { color: colors.textMuted }]}>{right}</Text>
    : right;
  return (
    <TouchableOpacity
      style={[styles.listRow, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.listRowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.listRowTitle, { color: colors.text }]}>{title}</Text>
        {sub && <Text style={[styles.listRowSub, { color: colors.textMuted }]}>{sub}</Text>}
      </View>
      {badge !== undefined && (
        <View style={[styles.listRowBadge, { backgroundColor: badgeColor ?? colors.accent }]}>
          <Text style={styles.listRowBadgeText}>{badge}</Text>
        </View>
      )}
      {rightNode ? <View style={styles.listRowRight}>{rightNode}</View> : null}
    </TouchableOpacity>
  );
}

// ─── WebEmptyState ────────────────────────────────────────────────────────────

export function WebEmptyState({ emoji, title, sub }: { emoji: string; title: string; sub?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {sub && <Text style={[styles.emptySub, { color: colors.textMuted }]}>{sub}</Text>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: {
    maxWidth: WEB_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: GRID_GAP,
    paddingTop: GRID_GAP,
  },

  pageHeader: {
    marginBottom: GRID_GAP,
    position: 'relative',
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  pageHeaderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pageHeaderLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    width: 44,
    borderRadius: Radius.full,
  },

  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: GRID_GAP_SM,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  sectionAction: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: GRID_GAP_SM,
  },

  card: {
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  statTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    marginBottom: GRID_GAP_SM,
  },
  statTileEmoji:  { fontSize: 18 },
  statTileValue:  { fontSize: FontSize.lg, fontWeight: FontWeight.black, lineHeight: 20 },
  statTileLabel:  { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statTileSub:    { fontSize: 10, marginTop: 1 },

  divider: {
    height: 1,
    marginVertical: GRID_GAP_SM,
  },
  dividerLabeled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: GRID_GAP_SM,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.5 },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  listRowIcon:      { fontSize: 16 },
  listRowTitle:     { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  listRowSub:       { fontSize: FontSize.xs, marginTop: 2 },
  listRowBadge:     { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  listRowBadgeText: { fontSize: 10, fontWeight: FontWeight.black, color: '#fff' },
  listRowRight:     { marginLeft: Spacing.sm, alignItems: 'center', justifyContent: 'center' },
  listRowRightText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  emptyState:   { alignItems: 'center', paddingVertical: 18, gap: 8 },
  emptyEmoji:   { fontSize: 18 },
  emptyTitle:   { fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  emptySub:     { fontSize: FontSize.sm, textAlign: 'center' },
});
