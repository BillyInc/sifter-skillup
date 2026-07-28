import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { SearchBar } from "./RedesignPrimitives";
import type { SearchResult, SearchResultType, SearchScope } from "../../types/career";

// ── ScopeChip ─────────────────────────────────────────────────
// Horizontal filter chip for scope filtering (All / Programmes / Domains / Roles).

export function ScopeChip({
  label,
  active,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.scopeChip,
        {
          backgroundColor: active ? colors.accentRole.action : "transparent",
          borderColor: active ? colors.accentRole.action : colors.borderRole.subtle,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.scopeChipText,
          { color: active ? colors.textRole.inverse : colors.textRole.secondary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── TermHighlight ─────────────────────────────────────────────
// Subtle matched-term highlighting in titles/descriptions.
// Wraps each occurrence of `query` in a semi-transparent accent wash.

export function TermHighlight({
  text,
  query,
  style,
}: {
  text: string;
  query: string;
  style?: StyleProp<TextStyle>;
}) {
  const { colors } = useTheme();
  const segments = useMemo(() => {
    if (!query || query.length < 2) return [{ text, highlight: false }];
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part) => ({
      text: part,
      highlight: regex.test(part),
    }));
  }, [text, query]);

  return (
    <Text style={style}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <Text
            key={i}
            style={{
              color: colors.accentRole.action,
              backgroundColor: colors.accentRole.action + "12",
              borderRadius: 3,
              paddingHorizontal: 1,
            }}
          >
            {seg.text}
          </Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        ),
      )}
    </Text>
  );
}

// ── SearchResultRow ───────────────────────────────────────────
// Icon/thumbnail, title, one-line explanation, mono metadata, source/freshness, chevron.

export function SearchResultRow({
  result,
  query,
  onPress,
  style,
}: {
  result: SearchResult;
  query?: string;
  onPress?: (result: SearchResult) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const disabled = result.disabled || result.locked || !onPress;
  const iconName = (result.icon ?? defaultIcon(result.type)) as keyof typeof Feather.glyphMap;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress?.(result)}
      disabled={disabled}
      style={[
        styles.resultRow,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
          opacity: result.locked ? 0.62 : 1,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.resultIcon,
          { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
        ]}
      >
        <Feather
          name={result.locked ? "lock" : iconName}
          size={16}
          color={result.locked ? colors.state.locked : colors.textRole.secondary}
        />
      </View>
      <View style={styles.resultMain}>
        <Text
          style={[styles.resultTitle, { color: colors.textRole.primary }]}
          numberOfLines={1}
        >
          {query ? <TermHighlight text={result.title} query={query} /> : result.title}
        </Text>
        {result.subtitle ? (
          <Text
            style={[styles.resultSubtitle, { color: colors.textRole.secondary }]}
            numberOfLines={1}
          >
            {result.subtitle}
          </Text>
        ) : null}
        <View style={styles.resultMetaRow}>
          {result.meta ? (
            <Text
              style={[CompassFonts.data, styles.resultMeta, { color: colors.textRole.muted }]}
              numberOfLines={1}
            >
              {result.meta}
            </Text>
          ) : null}
          {result.source ? (
            <Text
              style={[CompassFonts.data, styles.resultSource, { color: colors.textRole.placeholder }]}
              numberOfLines={1}
            >
              {result.source}
            </Text>
          ) : null}
        </View>
      </View>
      {result.locked ? (
        <Feather name="lock" size={14} color={colors.state.locked} />
      ) : onPress ? (
        <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
      ) : null}
    </TouchableOpacity>
  );
}

function defaultIcon(type: SearchResultType): string {
  switch (type) {
    case "programme": return "book-open";
    case "domain": return "grid";
    case "role": return "briefcase";
    case "university": return "building";
    case "scholarship": return "award";
    case "opportunity": return "zap";
    case "admin": return "shield";
  }
}

// ── SearchResultsGroup ────────────────────────────────────────
// Grouped section with label (Programmes / Domains / Roles / etc.).

export function SearchResultsGroup({
  label,
  results,
  query,
  onResultPress,
  maxRows,
  style,
}: {
  label: string;
  results: SearchResult[];
  query?: string;
  onResultPress?: (result: SearchResult) => void;
  maxRows?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const visible = maxRows ? results.slice(0, maxRows) : results;
  const remaining = maxRows ? results.length - maxRows : 0;

  if (results.length === 0) return null;

  return (
    <View style={[styles.resultsGroup, style]}>
      <View style={[styles.groupHeader, { borderBottomColor: colors.borderRole.subtle }]}>
        <Text style={[styles.groupLabel, { color: colors.textRole.muted }]}>
          {label}
        </Text>
        <Text style={[styles.groupCount, CompassFonts.data, { color: colors.textRole.placeholder }]}>
          {results.length}
        </Text>
      </View>
      {visible.map((result) => (
        <SearchResultRow
          key={result.id}
          result={result}
          query={query}
          onPress={onResultPress}
        />
      ))}
      {remaining > 0 ? (
        <Text style={[styles.groupMore, { color: colors.textRole.muted }]}>
          +{remaining} more
        </Text>
      ) : null}
    </View>
  );
}

// ── SearchLoadingSkeleton ─────────────────────────────────────
// Skeleton shimmer for search results.

export function SearchLoadingSkeleton({
  rows = 5,
  style,
}: {
  rows?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.skeletonGroup, style]}>
      <View style={[styles.skeletonHeader, { backgroundColor: colors.shimmer }]} />
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.skeletonRow,
            {
              backgroundColor: colors.surface.raised,
              borderColor: colors.borderRole.subtle,
            },
          ]}
        >
          <View style={[styles.skeletonIcon, { backgroundColor: colors.shimmer }]} />
          <View style={styles.skeletonContent}>
            <View style={[styles.skeletonTitle, { backgroundColor: colors.shimmer }]} />
            <View style={[styles.skeletonSubtitle, { backgroundColor: colors.shimmerHighlight }]} />
            <View style={[styles.skeletonMeta, { backgroundColor: colors.shimmerHighlight }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── SearchEmptyState ──────────────────────────────────────────
// Illustrated empty state with route-line motif and CTA.

export function SearchEmptyState({
  query,
  scope,
  isGuest,
  onSignIn,
  style,
}: {
  query?: string;
  scope?: SearchScope;
  isGuest?: boolean;
  onSignIn?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const icon = query ? "search" : "compass";
  const title = query
    ? `No results for "${query}"`
    : "Search Sifter LevelUp";
  const message = query
    ? "Try a different search term or broaden your scope."
    : "Explore programmes, domains, roles, and opportunities.";

  return (
    <View style={[styles.emptyState, style]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surface.subtle }]}>
        <Feather name={icon} size={24} color={colors.textRole.muted} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textRole.primary }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.textRole.secondary }]}>{message}</Text>
      {isGuest && onSignIn ? (
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={onSignIn}
          style={[styles.emptyCta, { backgroundColor: colors.accentRole.action }]}
        >
          <Text style={[styles.emptyCtaText, { color: colors.textRole.inverse }]}>
            Sign in for full results
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ── SearchOverlay ─────────────────────────────────────────────
// Command-palette quality full-screen overlay.
// Mobile: full sheet with sticky input + grouped results.
// Web: centered modal (1440+ uses centered 640px panel).

interface SearchOverlayProps {
  visible: boolean;
  onClose: () => void;
  value: string;
  onChangeText: (v: string) => void;
  scope?: SearchScope;
  onScopeChange?: (scope: SearchScope) => void;
  loading?: boolean;
  error?: boolean;
  results?: { label: string; items: SearchResult[] }[];
  onResultPress?: (result: SearchResult) => void;
  recentSearches?: string[];
  onRecentPress?: (term: string) => void;
  suggestions?: string[];
  onSuggestionPress?: (term: string) => void;
  isGuest?: boolean;
  onSignIn?: () => void;
}

const SCOPE_OPTIONS: { value: SearchScope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "programmes", label: "Programmes" },
  { value: "domains", label: "Domains" },
  { value: "roles", label: "Roles" },
];

export function SearchOverlay({
  visible,
  onClose,
  value,
  onChangeText,
  scope = "all",
  onScopeChange,
  loading,
  error,
  results = [],
  onResultPress,
  recentSearches = [],
  onRecentPress,
  suggestions = [],
  onSuggestionPress,
  isGuest,
  onSignIn,
}: SearchOverlayProps) {
  const { colors } = useTheme();
  const inputRef = React.useRef<TextInput>(null);

  const hasQuery = value.length >= 2;
  const hasResults = results.some((g) => g.items.length > 0);
  const showSkeleton = loading && hasQuery;
  const showEmpty = hasQuery && !loading && !hasResults;
  const showIdle = !hasQuery && !loading;

  const handleClose = useCallback(() => {
    onChangeText("");
    onClose();
  }, [onClose, onChangeText]);

  if (!visible) return null;

  // Mobile: full-screen sheet
  const content = (
    <View style={[styles.overlay, { backgroundColor: colors.surface.base }]}>
      {/* Sticky search header */}
      <View style={[styles.overlayHeader, { borderBottomColor: colors.borderRole.subtle }]}>
        <View style={styles.overlaySearchRow}>
          <SearchBar
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder="Search programmes, domains, roles…"
            loading={loading}
            error={error}
            style={styles.overlaySearchBar}
          />
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleClose}
            style={[styles.overlayClose, { backgroundColor: colors.surface.subtle }]}
          >
            <Text style={[styles.overlayCloseText, { color: colors.textRole.secondary }]}>
              {Platform.OS === "web" ? "Esc" : "Cancel"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Scope chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.overlayScopes}
        >
          {SCOPE_OPTIONS.map((opt) => (
            <ScopeChip
              key={opt.value}
              label={opt.label}
              active={scope === opt.value}
              onPress={() => onScopeChange?.(opt.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results area */}
      <ScrollView
        style={styles.overlayBody}
        contentContainerStyle={styles.overlayBodyContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {showIdle && (
          <>
            {recentSearches.length > 0 && (
              <View style={styles.idleSection}>
                <Text style={[styles.idleLabel, { color: colors.textRole.muted }]}>
                  Recent
                </Text>
                {recentSearches.map((term, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.75}
                    onPress={() => onRecentPress?.(term)}
                    style={styles.idleRow}
                  >
                    <Feather name="clock" size={14} color={colors.textRole.placeholder} />
                    <Text style={[styles.idleTerm, { color: colors.textRole.secondary }]}>
                      {term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {suggestions.length > 0 && (
              <View style={styles.idleSection}>
                <Text style={[styles.idleLabel, { color: colors.textRole.muted }]}>
                  Suggested
                </Text>
                {suggestions.map((term, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.75}
                    onPress={() => onSuggestionPress?.(term)}
                    style={styles.idleRow}
                  >
                    <Feather name="arrow-up-left" size={14} color={colors.textRole.placeholder} />
                    <Text style={[styles.idleTerm, { color: colors.textRole.secondary }]}>
                      {term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {recentSearches.length === 0 && suggestions.length === 0 && (
              <SearchEmptyState />
            )}
          </>
        )}

        {showSkeleton && <SearchLoadingSkeleton />}

        {showEmpty && <SearchEmptyState query={value} scope={scope} isGuest={isGuest} onSignIn={onSignIn} />}

        {!showIdle && !showSkeleton && !showEmpty && (
          <>
            {results.map((group) =>
              group.items.length > 0 ? (
                <SearchResultsGroup
                  key={group.label}
                  label={group.label}
                  results={group.items}
                  query={value}
                  onResultPress={onResultPress}
                  maxRows={5}
                />
              ) : null,
            )}
            {isGuest && hasResults && (
              <View style={[styles.guestCta, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Feather name="lock" size={16} color={colors.accentRole.action} />
                <View style={styles.guestCtaContent}>
                  <Text style={[styles.guestCtaTitle, { color: colors.textRole.primary }]}>
                    Sign in for full results
                  </Text>
                  <Text style={[styles.guestCtaMessage, { color: colors.textRole.secondary }]}>
                    Guest accounts see limited previews.
                  </Text>
                </View>
                {onSignIn ? (
                  <TouchableOpacity
                    activeOpacity={0.78}
                    onPress={onSignIn}
                    style={[styles.guestCtaButton, { backgroundColor: colors.accentRole.action }]}
                  >
                    <Text style={[styles.guestCtaButtonText, { color: colors.textRole.inverse }]}>
                      Sign in
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );

  // On web, wrap in a centered modal-like container
  if (Platform.OS === "web") {
    return (
      <View style={[styles.webOverlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.webBackdrop} onPress={handleClose} />
        <View
          style={[
            styles.webPanel,
            {
              backgroundColor: colors.surface.base,
              borderColor: colors.borderRole.subtle,
            },
          ]}
        >
          {content}
        </View>
      </View>
    );
  }

  return content;
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ScopeChip
  scopeChip: {
    minHeight: 30,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  scopeChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  // SearchResultRow
  resultRow: {
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  resultTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  resultSubtitle: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
  },
  resultMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 2,
  },
  resultMeta: {
    fontSize: 10,
    letterSpacing: 0,
  },
  resultSource: {
    fontSize: 10,
    letterSpacing: 0,
  },
  // SearchResultsGroup
  resultsGroup: {
    marginBottom: Spacing.lg,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  groupCount: {
    fontSize: 10,
  },
  groupMore: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  // SearchLoadingSkeleton
  skeletonGroup: {
    gap: Spacing.sm,
  },
  skeletonHeader: {
    width: 80,
    height: 10,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
  },
  skeletonContent: {
    flex: 1,
    gap: 6,
  },
  skeletonTitle: {
    width: "60%",
    height: 12,
    borderRadius: Radius.sm,
  },
  skeletonSubtitle: {
    width: "40%",
    height: 9,
    borderRadius: Radius.sm,
  },
  skeletonMeta: {
    width: "30%",
    height: 8,
    borderRadius: Radius.sm,
  },
  // SearchEmptyState
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.huge,
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
  emptyCta: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  emptyCtaText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  // SearchOverlay
  overlay: {
    flex: 1,
  },
  overlayHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overlaySearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  overlaySearchBar: {
    flex: 1,
  },
  overlayClose: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  overlayCloseText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  overlayScopes: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  overlayBody: {
    flex: 1,
  },
  overlayBodyContent: {
    padding: Spacing.md,
  },
  // Idle state
  idleSection: {
    marginBottom: Spacing.lg,
  },
  idleLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  idleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  idleTerm: {
    fontSize: FontSize.sm,
  },
  // Guest CTA
  guestCta: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  guestCtaContent: {
    flex: 1,
    gap: 2,
  },
  guestCtaTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  guestCtaMessage: {
    fontSize: FontSize.xs,
  },
  guestCtaButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  guestCtaButtonText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  // Web overlay
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  webBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  webPanel: {
    width: 640,
    maxHeight: 520,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      default: { elevation: 8 },
    }),
  },
});
