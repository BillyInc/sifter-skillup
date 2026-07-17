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
  FontWeight,
  Brand,
  Shadow,
} from "../../theme";
import { adminNav } from "../../lib/adminNav";
import { getEducatorProfile } from "../../lib/educatorProfile";
import {
  adminAudienceForProfile,
  adminAudienceLabel,
  type AdminAudience,
} from "../../lib/adminAudience";
import type { EducatorProfile } from "../../types/institution";

const SIDEBAR_WIDTH = 232;
const WIDE_BREAKPOINT = 900;

type Nav = Parameters<(typeof adminNav)["domainIntelligence"]>[0];

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

function navGroupsFor(
  audience: AdminAudience,
  profile: EducatorProfile | null,
): { title: string; items: AdminNavItem[] }[] {
  if (audience === "university") {
    return [
      {
        title: "Programme intelligence",
        items: [
          {
            key: "dashboard",
            label: "Dashboard",
            icon: "📊",
            match: "dashboard",
            go: (n) => adminNav.dashboard(n),
          },
          {
            key: "peers",
            label: "Peer benchmarks",
            icon: "🏛️",
            match: "peers",
            go: (n) => adminNav.peers(n),
          },
        ],
      },
      {
        title: "Market intelligence",
        items: [
          {
            key: "domain-intelligence",
            label: "Domain lens",
            icon: "🧭",
            match: "domain-intelligence",
            go: (n) => adminNav.domainIntelligence(n),
          },
          {
            key: "role-demand",
            label: "Role value",
            icon: "💼",
            match: "role-demand",
            go: (n) => adminNav.roleDemand(n),
          },
          {
            key: "skills-gap",
            label: "Skills gaps",
            icon: "🧩",
            match: "skills-gap",
            go: (n) => adminNav.skillsGap(n),
          },
          {
            key: "trends",
            label: "Trends",
            icon: "📈",
            match: "trends",
            go: (n) => adminNav.trends(n),
          },
        ],
      },
      {
        title: "Setup",
        items: [
          {
            key: "profile",
            label: "Profile + team",
            icon: "◎",
            match: "profile",
            go: (n) => adminNav.profile(n),
          },
          {
            key: "verify",
            label: "Verification",
            icon: "✅",
            match: "verify",
            go: (n) => adminNav.verify(n),
          },
          {
            key: "affiliation",
            label: "Affiliation",
            icon: "🔗",
            match: "affiliation",
            go: (n) => adminNav.affiliation(n),
          },
        ],
      },
    ];
  }

  const providerOnly = Boolean(profile?.providerSessionOnly);
  return [
    {
      title: "Guidance intelligence",
      items: [
        {
          key: "guidance",
          label: "Guidance dashboard",
          icon: "🧭",
          match: "guidance",
          go: (n) => adminNav.guidanceDashboard(n),
        },
        {
          key: "domain-intelligence",
          label: "Domain lens",
          icon: "◈",
          match: "domain-intelligence",
          go: (n) => adminNav.domainIntelligence(n),
        },
        {
          key: "role-demand",
          label: "Role value",
          icon: "▤",
          match: "role-demand",
          go: (n) => adminNav.roleDemand(n),
        },
        {
          key: "skills-gap",
          label: "Learning gaps",
          icon: "▦",
          match: "skills-gap",
          go: (n) => adminNav.skillsGap(n),
        },
        {
          key: "trends",
          label: "Trends",
          icon: "↗",
          match: "trends",
          go: (n) => adminNav.trends(n),
        },
        providerOnly
          ? {
              key: "session",
              label: "Session workspace",
              icon: "📚",
              match: "session",
              go: (n) => adminNav.session(n),
            }
          : {
              key: "students",
              label: "Students",
              icon: "👥",
              match: "students",
              go: (n) => adminNav.students(n),
            },
      ],
    },
    {
      title: "Setup",
      items: [
        {
          key: "profile",
          label: "Profile + team",
          icon: "◎",
          match: "profile",
          go: (n) => adminNav.profile(n),
        },
        {
          key: "verify",
          label: "Verification",
          icon: "✅",
          match: "verify",
          go: (n) => adminNav.verify(n),
        },
        {
          key: "affiliation",
          label: "Affiliation",
          icon: "🔗",
          match: "affiliation",
          go: (n) => adminNav.affiliation(n),
        },
      ],
    },
  ];
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
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Persistent sidebar (wide only) */}
      {wide ? (
        <View
          style={[
            styles.sidebar,
            { backgroundColor: colors.card, borderRightColor: colors.border },
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
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          {!wide ? (
            <TouchableOpacity
              onPress={() => setDrawerOpen(true)}
              hitSlop={10}
              style={styles.menuBtn}
              accessibilityLabel="Open navigation"
            >
              <Text style={[styles.menuIcon, { color: colors.text }]}>☰</Text>
            </TouchableOpacity>
          ) : null}

          {!isHome ? (
            <TouchableOpacity
              onPress={goBack}
              hitSlop={10}
              style={[styles.backBtn, { borderColor: colors.border }]}
              accessibilityLabel="Go back"
            >
              <Text style={[styles.backText, { color: colors.text }]}>
                Back
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.titleWrap}>
            {eyebrow ? (
              <Text
                style={[styles.eyebrow, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {eyebrow}
              </Text>
            ) : null}
            <Text
              style={[styles.title, { color: colors.text }]}
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
      <View style={[styles.brand, { borderBottomColor: colors.border }]}>
        <View style={styles.brandMark}>
          <Text style={styles.brandEmoji}>⚡</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brandName, { color: colors.text }]}>
            {Brand.short}
          </Text>
          <Text style={[styles.brandSub, { color: Brand.primaryDeep }]}>
            {adminAudienceLabel(audience).toUpperCase()}
          </Text>
        </View>
        {showClose ? (
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Text style={[styles.close, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.navScroll}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group) => (
          <View key={group.title} style={styles.navGroup}>
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
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
                    active && { backgroundColor: colors.navy },
                  ]}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.navLabel,
                      {
                        color: active ? colors.textInverse : colors.textSoft,
                        fontWeight: active
                          ? FontWeight.bold
                          : FontWeight.medium,
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
            🔒 Student data stays private. Individual access requires verified
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
            backgroundColor: colors.card,
            borderRightColor: colors.border,
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
    borderRightWidth: 1,
    flexShrink: 0,
  },
  content: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  menuBtn: { paddingVertical: 2, paddingHorizontal: 2 },
  menuIcon: { fontSize: 22, fontWeight: FontWeight.black },
  backBtn: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  titleWrap: { flex: 1, gap: 1 },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  actions: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },

  // Brand
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
  },
  brandEmoji: { fontSize: 16 },
  brandName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.1,
  },
  close: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },

  // Nav
  navScroll: { paddingVertical: Spacing.md, gap: Spacing.lg },
  navGroup: { paddingHorizontal: Spacing.md, gap: 2 },
  groupTitle: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
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
    borderRadius: Radius.md,
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
    borderRightWidth: 1,
  },
});
