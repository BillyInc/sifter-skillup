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
import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useRouter, usePathname, useGlobalSearchParams } from "expo-router";
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
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_EXPLORE_SEGMENT } from "@/lib/exploreNav";
import {
  adminAudienceForProfile,
  adminAudienceLabel,
  type AdminAudience,
} from "@/lib/adminAudience";
import type { EducatorProfile } from "../../types/institution";
import { clearAdminResume, saveAdminResume } from "@/lib/adminResume";

const SIDEBAR_WIDTH = 232;
const WIDE_BREAKPOINT = 900;

function adminResumeLabel(path: string) {
  if (path.includes("/students/")) return "Student guidance";
  if (path === "/students" || path.endsWith("/students")) return "Student account creation and roster";
  if (path.includes("/peers")) return "Peer comparison";
  if (path.includes("/workspace-explore/admission")) return "Admission guidance";
  if (path.includes("/workspace-explore")) return "Explore programmes and domains";
  if (path.includes("/verify")) return "Verification";
  if (path.includes("/skills-gap")) return "Programme skills review";
  if (path.includes("/reports")) return "Reports";
  if (path.includes("/guidance")) return "Guidance workspace";
  return "Admin workspace";
}

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
    role: profile?.role,
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
  const searchParams = useGlobalSearchParams<Record<string, string | string[]>>();
  const { user, signOut, deleteAccount } = useAuth();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [accountAction, setAccountAction] = useState<"sign-out" | "delete" | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const wide = Platform.OS === "web" && width >= WIDE_BREAKPOINT;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const audience = adminAudienceForProfile(profile);
  const navGroups = navGroupsFor(audience, profile);
  // Universities land on the dashboard; advisory organisations land on
  // Explore (adminHomeForProfile). This drives whether the Back button shows.
  //
  // Key and URL segment are tracked separately because they stopped being the
  // same string: the admin Explore stack lives at /workspace-explore (the plain
  // /explore path collides with the student stack) while its nav key is still
  // "explore". One `homeMatch` compared against both would always be wrong for
  // one of them.
  const homeKey = audience === "university" ? "dashboard" : "explore";
  const homeSegment =
    audience === "university" ? "dashboard" : ADMIN_EXPLORE_SEGMENT;
  const readParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const focusedGuidance = readParam(searchParams?.guided) === "1"
    || readParam(searchParams?.focus) === "guidance"
    || readParam(searchParams?.journey) === "guided_subject_discovery"
    || readParam(searchParams?.journey_mode) === "guided_subject_discovery";
  const guidanceEntry = readParam(searchParams?.guidance_entry);
  const resumeQuery = useMemo(
    () => Object.entries(searchParams ?? {})
      .flatMap(([key, value]) => (Array.isArray(value) ? value.map((item) => [key, item] as const) : [[key, value] as const]))
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&"),
    [searchParams],
  );

  useEffect(() => {
    if (!user?.id || !pathname) return;
    const href = `/(admin)${pathname}${resumeQuery ? `?${resumeQuery}` : ""}`;
    void saveAdminResume({ href, label: adminResumeLabel(pathname) }, user.id);
  }, [pathname, resumeQuery, user?.id]);

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then(
      (p) => {
        if (active) setProfile(p);
      },
      () => {
        if (active) setProfile(null);
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Match against EVERY path segment, not just the last one. Explore is a
  // nested stack now (/explore/domain/D001), so the last segment is often an
  // id — keying on it alone left the whole stack with no highlighted nav row
  // and, worse, made isHome true on a detail screen, hiding the Back button.
  const segments = (pathname ?? "").split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";
  const activeKey = (() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (segments.includes(item.match)) return item.key;
      }
    }
    return homeKey;
  })();
  // Home means the home route ITSELF, not anything pushed on top of it.
  const isHome = activeKey === homeKey && (
    lastSegment === homeSegment
    // Keep old Vite/admin bookmarks usable while the canonical segment is
    // /workspace-explore.
    || (homeSegment === ADMIN_EXPLORE_SEGMENT && lastSegment === "explore")
  );
  const goBack = () => {
    if (focusedGuidance && guidanceEntry?.startsWith("/")) {
      router.replace(guidanceEntry as never);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    adminNav.home(router as Nav, audience);
  };

  const navigate = (item: AdminNavItem) => {
    setDrawerOpen(false);
    item.go(router as Nav);
  };

  const completeSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in" as never);
  };

  const completeDelete = async () => {
    try {
      await deleteAccount();
    } finally {
      await clearAdminResume(user?.id);
      router.replace("/(auth)/sign-in" as never);
    }
  };

  const confirmAccountAction = (action: "sign-out" | "delete") => setAccountAction(action);

  const runAccountAction = async () => {
    if (!accountAction || actionBusy) return;
    setActionBusy(true);
    try {
      if (accountAction === "delete") await completeDelete();
      else await completeSignOut();
      setAccountAction(null);
    } finally {
      setActionBusy(false);
    }
  };

  const Nav = (
    <NavList
      activeKey={activeKey}
      audience={audience}
      groups={navGroups}
      onNavigate={navigate}
      onClose={() => setDrawerOpen(false)}
      showClose={!wide}
      onSignOut={() => confirmAccountAction("sign-out")}
      onDeleteAccount={() => confirmAccountAction("delete")}
    />
  );

  // The browser has its own admin information architecture. The native
  // React-Native chrome remains the mobile reference, but rendering that
  // chrome as a stack of RN Views on Vite made admin pages look like the
  // student shell and hid the workspace identity. Keep the route/context
  // logic shared, and switch only the presentation layer here.
  if (Platform.OS === "web") {
    return (
      <WebAdminShell
        title={title}
        eyebrow={eyebrow}
        actions={actions}
        children={children}
        audience={audience}
        profile={profile}
        groups={navGroups}
        activeKey={activeKey}
        focusedGuidance={focusedGuidance}
        isHome={isHome}
        drawerOpen={drawerOpen}
        onDrawerOpen={() => setDrawerOpen(true)}
        onDrawerClose={() => setDrawerOpen(false)}
        onNavigate={navigate}
        onBack={goBack}
        onSignOut={() => confirmAccountAction("sign-out")}
        onDeleteAccount={() => confirmAccountAction("delete")}
        accountAction={accountAction}
        actionBusy={actionBusy}
        onCancelAction={() => setAccountAction(null)}
        onRunAction={() => void runAccountAction()}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface.base }]}>
      {/* Persistent sidebar (wide only) */}
      {wide && !focusedGuidance ? (
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
          {!wide && !focusedGuidance ? (
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
                {focusedGuidance ? "Exit guidance" : "Back"}
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
            {focusedGuidance ? "Guidance workspace" : title}
            </Text>
          </View>

          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>

        {focusedGuidance ? (
          <GuidanceContextBanner
            studentClass={readParam(searchParams?.student_class) || readParam(searchParams?.class_name) || readParam(searchParams?.student_type)}
            stream={readParam(searchParams?.stream)}
            journey={readParam(searchParams?.journey_mode) || readParam(searchParams?.journey)}
            studentTarget={readParam(searchParams?.guidance_student_id) ? "student" : "anonymous"}
          />
        ) : null}
        <View style={{ flex: 1 }}>{children}</View>
      </View>

      {/* Overlay drawer (narrow only) */}
      {!wide && drawerOpen ? (
        <Drawer onClose={() => setDrawerOpen(false)}>{Nav}</Drawer>
      ) : null}
      <Modal visible={accountAction !== null} transparent animationType="fade" onRequestClose={() => setAccountAction(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.modalTitle, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
              {accountAction === "delete" ? "Delete this account?" : "Sign out?"}
            </Text>
            <Text style={[styles.modalBody, CompassFonts.body, { color: colors.textRole.secondary }]}>
              {accountAction === "delete"
                ? "Your account will be marked for deletion. A 24-hour recovery cooldown starts immediately, so another account cannot be created from this device until it ends."
                : "You will need to sign in again to continue."}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAccountAction(null)} disabled={actionBusy} style={[styles.modalButton, { borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.modalButtonText, { color: colors.textRole.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={runAccountAction} disabled={actionBusy} style={[styles.modalButton, { backgroundColor: colors.accentRole.danger, borderColor: colors.accentRole.danger, opacity: actionBusy ? 0.6 : 1 }]}>
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>{accountAction === "delete" ? "Delete account" : "Sign out"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function WebAdminShell({
  title,
  eyebrow,
  actions,
  children,
  audience,
  profile,
  groups,
  activeKey,
  focusedGuidance,
  isHome,
  drawerOpen,
  onDrawerOpen,
  onDrawerClose,
  onNavigate,
  onBack,
  onSignOut,
  onDeleteAccount,
  accountAction,
  actionBusy,
  onCancelAction,
  onRunAction,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  audience: AdminAudience;
  profile: EducatorProfile | null;
  groups: { title: string; items: AdminNavItem[] }[];
  activeKey: string;
  focusedGuidance: boolean;
  isHome: boolean;
  drawerOpen: boolean;
  onDrawerOpen: () => void;
  onDrawerClose: () => void;
  onNavigate: (item: AdminNavItem) => void;
  onBack: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  accountAction: "sign-out" | "delete" | null;
  actionBusy: boolean;
  onCancelAction: () => void;
  onRunAction: () => void;
}) {
  const workspaceName = profile?.organizationName || adminAudienceLabel(audience);
  const nav = (
    <div className="web-admin-nav-inner">
      <div className="web-admin-brand">
        <span className="web-admin-brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span><strong>Sifter LevelUp</strong><small>{workspaceName}</small></span>
        {drawerOpen ? <button className="web-admin-close" onClick={onDrawerClose} aria-label="Close navigation">×</button> : null}
      </div>
      <nav className="web-admin-nav" aria-label="Administrator navigation">
        {groups.map((group) => (
          <section key={group.title} className="web-admin-nav-group">
            <p>{group.title}</p>
            {group.items.map((item) => (
              <button key={item.key} className={item.key === activeKey ? "active" : ""} onClick={() => onNavigate(item)}>
                <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>{item.locked ? <small>Locked</small> : null}
              </button>
            ))}
          </section>
        ))}
      </nav>
      {audience === "school" ? <p className="web-admin-privacy-note">Student data stays private. Individual access requires verified consent.</p> : null}
      <div className="web-admin-account">
        <button onClick={onSignOut}>Sign out</button>
        <button className="danger" onClick={onDeleteAccount}>Delete account</button>
      </div>
    </div>
  );

  return (
    <div className={`web-admin-shell${focusedGuidance ? " is-focused" : ""}`}>
      {!focusedGuidance ? <aside className="web-admin-sidebar">{nav}</aside> : null}
      {drawerOpen && !focusedGuidance ? <div className="web-admin-drawer-layer"><button className="web-admin-drawer-backdrop" onClick={onDrawerClose} aria-label="Close navigation" /><aside className="web-admin-drawer">{nav}</aside></div> : null}
      <section className="web-admin-main">
        <header className="web-admin-header">
          <button className="web-admin-menu" onClick={onDrawerOpen} aria-label="Open navigation">☰</button>
          {!isHome ? <button className="web-admin-back" onClick={onBack}>{focusedGuidance ? "Exit guidance" : "Back"}</button> : null}
          <div className="web-admin-heading">
            {eyebrow ? <span>{eyebrow}</span> : null}
            <h1>{focusedGuidance ? "Guidance workspace" : title}</h1>
          </div>
          {actions ? <div className="web-admin-actions">{actions}</div> : null}
        </header>
        {focusedGuidance ? <div className="web-admin-context" role="status"><strong>Focused guidance workspace</strong><span>Navigation is collapsed while you work. Your target and resume context remain attached to this route.</span></div> : null}
        <main className="web-admin-content">{children}</main>
      </section>
      {accountAction ? <div className="web-admin-modal-backdrop" role="presentation"><section className="web-admin-modal" role="dialog" aria-modal="true" aria-labelledby="web-admin-action-title"><h2 id="web-admin-action-title">{accountAction === "delete" ? "Delete this account?" : "Sign out?"}</h2><p>{accountAction === "delete" ? "Your account will be marked for deletion. A 24-hour recovery cooldown starts immediately." : "You will need to sign in again to continue."}</p><div><button className="secondary" onClick={onCancelAction} disabled={actionBusy}>Cancel</button><button className="danger-button" onClick={onRunAction} disabled={actionBusy}>{accountAction === "delete" ? "Delete account" : "Sign out"}</button></div></section></div> : null}
    </div>
  );
}

function GuidanceContextBanner({ studentClass, stream, journey, studentTarget }: { studentClass?: string; stream?: string; journey?: string; studentTarget: "student" | "anonymous" }) {
  const { colors } = useTheme();
  const journeyLabel = journey ? journey.replace(/_/g, " ") : "";
  const context = [studentClass, stream].filter(Boolean).join(" · ");
  return (
    <View
      accessibilityRole="summary"
      style={[styles.guidanceContext, { backgroundColor: colors.surface.subtle, borderBottomColor: colors.borderRole.subtle }]}
    >
      <View style={styles.guidanceContextCopy}>
        <Text style={[styles.guidanceContextEyebrow, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>{studentTarget === "student" ? "TARGET STUDENT GUIDANCE" : "ANONYMOUS GUIDANCE"}</Text>
        <Text style={[styles.guidanceContextTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{studentTarget === "student" ? "This workspace is scoped to the selected student" : "This workspace is not attached to a student record"}</Text>
        <Text style={[styles.guidanceContextBody, CompassFonts.body, { color: colors.textRole.secondary }]}>{studentTarget === "student" ? "Selections use this student&apos;s authorised guidance path. Access and consent checks remain enforced." : "Use this for your own or a walk-in-style exploration without identifying or inspecting a student."}</Text>
      </View>
      {context || journeyLabel ? <Text style={[styles.guidanceContextMeta, CompassFonts.data, { color: colors.textRole.muted }]}>{[context, journeyLabel].filter(Boolean).join(" · ")}</Text> : null}
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
  onSignOut,
  onDeleteAccount,
}: {
  activeKey: string;
  audience: AdminAudience;
  groups: { title: string; items: AdminNavItem[] }[];
  onNavigate: (item: AdminNavItem) => void;
  onClose: () => void;
  showClose: boolean;
  onSignOut: () => void;
  onDeleteAccount: () => void;
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

        <View style={styles.accountActions}>
          <Text style={[styles.groupTitle, CompassFonts.bodySemibold, { color: colors.textMuted }]}>ACCOUNT</Text>
          <TouchableOpacity onPress={onSignOut} style={styles.accountRow}>
            <Text style={[styles.accountText, { color: colors.textRole.secondary }]}>Sign out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDeleteAccount} style={styles.accountRow}>
            <Text style={[styles.accountText, { color: colors.accentRole.danger }]}>Delete account</Text>
          </TouchableOpacity>
        </View>
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
  accountActions: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: 2,
  },
  accountRow: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  accountText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
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
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  modalCard: { width: "100%", maxWidth: 420, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.xl, gap: Spacing.md },
  modalTitle: { fontSize: FontSize.xl },
  modalBody: { fontSize: FontSize.sm, lineHeight: 20 },
  modalActions: { flexDirection: "row", gap: Spacing.sm },
  modalButton: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: Radius.xl, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.sm },
  modalButtonText: { fontSize: FontSize.sm, fontWeight: "800" },
  guidanceContext: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.md },
  guidanceContextCopy: { flex: 1, gap: 2 },
  guidanceContextEyebrow: { fontSize: FontSize.xs, letterSpacing: 0.8 },
  guidanceContextTitle: { fontSize: FontSize.sm },
  guidanceContextBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  guidanceContextMeta: { fontSize: FontSize.xs, textTransform: "capitalize" },
});
