/**
 * AdminShell — the institutional/administrator chrome.
 *
 * Owns the navigation frame for every admin screen so individual screens render
 * only their body. Responsive by construction:
 *   - Wide (web, width >= 900): a persistent left sidebar sits beside content.
 *   - Narrow (mobile / small web): the sidebar collapses; a hamburger opens it
 *     as an overlay drawer that dismisses on backdrop press or after a tap.
 *
 * Routing goes through src/lib/adminNav (typed hrefs, never hand-built). The
 * "Student management" item is privacy-locked by design: it carries a 🔒 glyph
 * and routes to the consent-gated /(admin)/students page, which adminData
 * returns as `locked` (never coming_soon). Chrome uses theme tokens only.
 */
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  Shadow,
} from "@/theme";
import { adminNav, getAdminNavGroups } from "@/lib/adminNav";
import { getEducatorProfile } from "@/lib/educatorProfile";
import {
  adminAudienceForProfile,
  adminAudienceLabel,
  type AdminAudience,
} from "@/lib/adminAudience";
import type { EducatorProfile } from "../../types/institution";

const SIDEBAR_WIDTH = 232;
const WIDE_BREAKPOINT = 900;

// Keyed on `dashboard` because every audience has it. This was keyed on
// `domainIntelligence`, which §5.2 merged away — a nav helper rename broke
// an unrelated type alias here.
type Nav = Parameters<(typeof adminNav)["dashboard"]>[0];

interface AdminNavItem {
  key: string;
  label: string;
  icon: string;
  go: (nav: Nav) => void;
  /** Matches the trailing path segment to mark the row active. */
  match: string;
  /** Privacy-locked (consent-gated) — rendered with a lock glyph. */
  locked?: boolean;
}

/**
 * The sidebar is built by getAdminNavGroups() in src/lib/adminNav.ts — the
 * single source of truth for admin navigation.
 *
 * This file previously carried its OWN inline copy of the whole nav tree and
 * never called getAdminNavGroups, so that exported function was dead code and
 * the two definitions had already drifted apart (different group titles,
 * different membership). Editing adminNav.ts had no effect on what users
 * actually saw. One definition now, shaped by audience there.
 */
function navGroupsFor(
  audience: AdminAudience,
  profile: EducatorProfile | null,
): { title: string; items: AdminNavItem[] }[] {
  return getAdminNavGroups({
    organizationType: profile?.organizationType,
    providerSessionOnly: profile?.providerSessionOnly,
  }) as { title: string; items: AdminNavItem[] }[];
}

export interface AdminShellProps {
  /** Page title shown in the top bar / sidebar header. */
  title?: string;
  /** Optional eyebrow above the title (e.g. the institution name). */
  eyebrow?: string;
  /** Optional actions rendered in the top bar (e.g. export buttons). */
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminShell({
  title = "Administrator",
  eyebrow,
  actions,
  children,
}: AdminShellProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);

  const wide = Platform.OS === "web" && width >= WIDE_BREAKPOINT;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const audience = adminAudienceForProfile(profile);
  const navGroups = navGroupsFor(audience, profile);
  const homeMatch = audience === "university" ? "dashboard" : "guidance";

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, []);

  const activeKey = (() => {
    const segment = (pathname ?? "").split("/").filter(Boolean).pop() ?? "";
    for (const group of navGroups) {
      for (const item of group.items) {
        if (segment === item.match) return item.key;
      }
    }
    return audience === "university" ? "dashboard" : "guidance";
  })();
  const isHome = activeKey === homeMatch;
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (audience === "university") {
      adminNav.dashboard(router as Nav);
    } else {
      adminNav.guidanceDashboard(router as Nav);
    }
  };

  const navigate = (item: AdminNavItem) => {
    setDrawerOpen(false);
    item.go(router as Nav);
  };

  const Nav = (
    <NavList
      activeKey={activeKey}
      audience={audience}
      groups={navGroups}
      onNavigate={navigate}
      onClose={() => setDrawerOpen(false)}
      showClose={!wide}
    />
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.surface.base }]}>
      {/* Persistent sidebar (wide only) */}
      {wide ? (
        <View
          style={[
            styles.sidebar,
            { backgroundColor: colors.surface.raised, borderRightColor: colors.borderRole.subtle },
          ]}
        >
          {Nav}
        </View>
      ) : null}

      {/* Content column */}
      <View style={styles.content}>
        {/* Top bar */}
        <View
          style={[
            styles.topBar,
            { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle },
          ]}
        >
          {!wide ? (
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              hitSlop={10}
              style={styles.menuBtn}
              accessibilityLabel="Open navigation"
            >
              <Text style={[styles.menuIcon, CompassFonts.displayBold, { color: colors.text }]}>☰</Text>
            </TouchableOpacity>
          ) : null}

          {!isHome ? (
            <TouchableOpacity
              onPress={goBack}
              hitSlop={10}
              style={[styles.backBtn, { borderColor: colors.borderRole.subtle }]}
              accessibilityLabel="Go back"
            >
              <Text style={[styles.backText, CompassFonts.bodySemibold, { color: colors.text }]}>
                Back
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.titleWrap}>
            {eyebrow ? (
              <Text
                style={[styles.eyebrow, CompassFonts.bodySemibold, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {eyebrow}
              </Text>
            ) : null}
            <Text
              style={[styles.title, CompassFonts.bodySemibold, { color: colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>

        <View style={{ flex: 1 }}>{children}</View>
      </View>

      {/* Overlay drawer (narrow only) */}
      {!wide && drawerOpen ? (
        <Drawer onClose={() => setDrawerOpen(false)}>{Nav}</Drawer>
      ) : null}
    </View>
  );
}

// ─── Nav list ──────────────────────────────────────────────────
function NavList({
  activeKey,
  audience,
  groups,
  onNavigate,
  onClose,
  showClose,
}: {
  activeKey: string;
  audience: AdminAudience;
  groups: { title: string; items: AdminNavItem[] }[];
  onNavigate: (item: AdminNavItem) => void;
  onClose: () => void;
  showClose: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      {/* Brand header */}
      <View style={[styles.brand, { borderBottomColor: colors.borderRole.subtle }]}>
        <View
          style={[
            styles.brandMark,
            { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Text style={[styles.brandEmoji, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>S</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brandName, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>
            {adminAudienceLabel(audience)}
          </Text>
          <Text style={[styles.brandSub, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>
            Workspace
          </Text>
        </View>
        {showClose ? (
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Text style={[styles.close, CompassFonts.bodySemibold, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.navScroll}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group) => (
          <View key={group.title} style={styles.navGroup}>
            <Text style={[styles.groupTitle, CompassFonts.bodySemibold, { color: colors.textMuted }]}>
              {group.title.toUpperCase()}
            </Text>
            {group.items.map((item) => {
              const active = item.key === activeKey;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => onNavigate(item)}
                  activeOpacity={0.75}
                    style={[
                      styles.navRow,
                      active && { backgroundColor: colors.surface.inverse },
                    ]}
                  >
                    <Text style={styles.navIcon}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.navLabel,
                        active ? CompassFonts.bodyBold : CompassFonts.bodyMedium,
                        {
                          color: active ? colors.textRole.inverse : colors.textRole.secondary,
                        },
                      ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {item.locked ? (
                    <Text style={styles.lock}>🔒</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {audience === "school" ? (
          <Text style={[styles.privacyNote, { color: colors.textMuted }]}>
            Student data stays private. Individual access requires verified
            consent.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Overlay drawer ────────────────────────────────────────────
function Drawer({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const slide = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, fade]);

  return (
    <View style={styles.drawerOverlay} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.surface.raised,
            borderRightColor: colors.borderRole.subtle,
            transform: [{ translateX: slide }],
          },
          Shadow.lg,
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default AdminShell;

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  content: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuBtn: { paddingVertical: 2, paddingHorizontal: 2 },
  menuIcon: { fontSize: 22 },
  backBtn: {
    minHeight: 34,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: FontSize.sm },
  titleWrap: { flex: 1, gap: 1 },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: { fontSize: FontSize.lg },
  actions: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },

  // Brand
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  brandEmoji: { fontSize: 15 },
  brandName: {
    fontSize: FontSize.md,
    letterSpacing: 0,
  },
  brandSub: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  close: { fontSize: FontSize.lg },

  // Nav
  navScroll: { paddingVertical: Spacing.md, gap: Spacing.lg },
  navGroup: { paddingHorizontal: Spacing.md, gap: 2 },
  groupTitle: {
    fontSize: 9,
    letterSpacing: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 38,
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  navIcon: { fontSize: 15, width: 20, textAlign: "center" },
  navLabel: { flex: 1, fontSize: FontSize.sm },
  lock: { fontSize: FontSize.sm },
  privacyNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  // Drawer
  drawerOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdropTouch: { flex: 1 },
  drawer: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
