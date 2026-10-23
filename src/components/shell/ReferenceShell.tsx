import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type DimensionValue,
  useWindowDimensions,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontSize, CompassFonts, Radius, Spacing, useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { resolveTrackContext, type TrackContext } from '@/lib/trackContext';
import { SearchOverlay, SearchBar } from '@/components/careerIntelligence';
import { TOUCH_TARGET_MIN } from '@/components/ui';
import { Spring, useReducedMotion } from '@/theme/motion';
import { careerData } from '@/lib/careerData';
// The fourth destination names itself the same way everywhere; see worldNav.
import { WORLD_NAV } from '@/lib/worldNav';
import { toSearchGroups, resolveSearchHref } from '@/lib/searchResults';
import { exploreQueryHref } from '@/lib/exploreQuery';
import { getRecentSearches, addRecentSearch } from '@/lib/recentSearches';
import { useSidebarNav } from '@/hooks/useResponsive';
import type { CareerSearchResult, SearchIntent, SearchScope } from '@/types/career';
import { getStartingPoint } from '@/lib/startingPoint';
import { SearchLauncherProvider } from '@/components/shell/searchLauncher';

type NavId =
  | 'home'
  | 'explore'
  | 'opportunities'
  | 'myworld'
  | 'profile';

interface ShellNavItem {
  id: NavId;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  href: string;
  sub: string;
}

const PRIMARY_NAV: ShellNavItem[] = [
  { id: 'home',          label: 'Home',          icon: 'home', href: '/(tabs)/home',          sub: 'Your snapshot' },
  { id: 'explore',       label: 'Explore',       icon: 'compass', href: '/(tabs)/explore',       sub: 'Programmes, domains & roles' },
  { id: 'opportunities', label: 'Opportunities', icon: 'briefcase', href: '/(tabs)/opportunities', sub: 'Opportunities, scholarships & windows' },
  { id: 'myworld',       label: WORLD_NAV.label, icon: WORLD_NAV.icon, href: '/(tabs)/myworld', sub: WORLD_NAV.sub },
  { id: 'profile',       label: 'Profile',       icon: 'user', href: '/(tabs)/profile',       sub: 'Account & saved' },
];

/**
 * Editorial starting points for an empty search box, rendered under a
 * "Suggested" heading. Unlike "Recent", that label makes no claim about the
 * user, so a curated list is honest here. Each term was checked against
 * /api/career/search and returns real domains, roles and programmes -- a
 * suggestion that dead-ends is worse than none.
 */
const SEARCH_SUGGESTIONS = ['Law', 'Engineering', 'Accounting', 'Nursing'];

const MOBILE_NAV: { id: NavId; label: string; icon: keyof typeof Feather.glyphMap; href: string }[] = [
  { id: 'home',          label: 'Home',    icon: 'home', href: '/(tabs)/home' },
  { id: 'explore',       label: 'Explore', icon: 'compass', href: '/(tabs)/explore' },
  { id: 'opportunities', label: 'Opportunities', icon: 'briefcase', href: '/(tabs)/opportunities' },
  { id: 'myworld',       label: WORLD_NAV.label, icon: WORLD_NAV.icon, href: '/(tabs)/myworld' },
  { id: 'profile',       label: 'Profile', icon: 'user', href: '/(tabs)/profile' },
];

function buildPrimaryNav(_trackContext: TrackContext): ShellNavItem[] {
  // LevelUp uses a fixed 5-destination information architecture.
  return PRIMARY_NAV;
}

function getPageMeta(_trackContext: TrackContext, _activeId: NavId, activeItem: ShellNavItem) {
  return {
    eyebrow: 'Sifter LevelUp',
    title: activeItem.label,
  };
}

function getActiveNavId(pathname: string | null): NavId {
  if (!pathname) return 'home';
  if (pathname.includes('/profile') || pathname.includes('/settings')) return 'profile';
  if (pathname.includes('/explore') || pathname.includes('/programme')
    || pathname.includes('/domain') || pathname.includes('/role')) return 'explore';
  if (pathname.includes('/opportunities') || pathname.includes('/opportunity')
    || pathname.includes('/company') || pathname.includes('/scholarship')) return 'opportunities';
  // Everything from the legacy learning app now lives under My World.
  if (
    pathname.includes('/myworld')
    || pathname.includes('/map') || pathname.includes('/world')
    || pathname.includes('/starknet-track') || pathname.includes('/ecosystem-track')
    || pathname.includes('/cairo-builder-track') || pathname.includes('/track-room')
    || pathname.includes('/quant') || pathname.includes('/fields') || pathname.includes('/skills')
    || pathname.includes('/guild') || pathname.includes('/community')
    || pathname.includes('/portfolio') || pathname.includes('/streaks')
    || pathname.includes('/feed') || pathname.includes('/merchandise')
  ) return 'myworld';
  if (pathname.includes('/home')) return 'home';
  return 'home';
}

function getActiveMobileNavId(activeId: NavId): NavId {
  // The mobile bar mirrors the primary nav 1:1.
  return activeId;
}

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function NavList({
  items,
  activeId,
  onNavigate,
}: {
  items: ShellNavItem[];
  activeId: NavId;
  onNavigate: (item: ShellNavItem) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.navList}>
      {items.map(item => {
        const active = item.id === activeId;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => onNavigate(item)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            // Active state is otherwise conveyed by colour alone.
            accessibilityState={{ selected: active }}
            style={[
              styles.navItem,
              {
                backgroundColor: active ? colors.textRole.primary : colors.surface.raised,
                borderColor: active ? colors.textRole.primary : colors.borderRole.subtle,
              },
            ]}
          >
            {active && <View style={[styles.navActiveDot, { backgroundColor: colors.accentRole.action }]} />}
            <View
              style={[
                styles.navIconWrap,
                { backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent' },
              ]}
            >
              <Feather
                name={item.icon}
                size={15}
                color={active ? colors.textRole.inverse : colors.textRole.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: active ? colors.textRole.inverse : colors.textRole.secondary }]}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ReferenceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // This shell sits above the nested Explore stack. Use global params so a
  // focus marker added by a programme/domain/subgroup/role route reaches the
  // shell and hides the complete app navigation chrome, not only the current
  // Explore screen's controls.
  const params = useGlobalSearchParams<{ trackId?: string | string[]; trackName?: string | string[]; journey?: string | string[]; focus?: string | string[]; guided?: string | string[]; guidance_entry?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, isDark, toggle } = useTheme();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === 'guest';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayScope, setOverlayScope] = useState<SearchScope>("all");
  const [searchIntent, setSearchIntent] = useState<SearchIntent | null>(null);
  const [searchUserType, setSearchUserType] = useState<string | null>(null);
  const [searchSchoolId, setSearchSchoolId] = useState<string | null>(null);
  // These two were previously destructured WITHOUT setters, so results were
  // permanently [] and the overlay could never return anything.
  const [searchPayload, setSearchPayload] = useState<CareerSearchResult | null>(null);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const routeTrackId = readParam(params.trackId);
  const routeTrackName = readParam(params.trackName);
  const trackContext = useMemo(() => resolveTrackContext(user, {
    trackId: routeTrackId,
    trackName: routeTrackName,
  }), [routeTrackId, routeTrackName, user]);

  const primaryNav = useMemo(() => buildPrimaryNav(trackContext), [trackContext]);
  const activeId = useMemo(() => getActiveNavId(pathname), [pathname]);
  const activeMobileId = useMemo(() => getActiveMobileNavId(activeId), [activeId]);
  const activeItem = primaryNav.find(item => item.id === activeId) ?? primaryNav[0];
  const pageMeta = useMemo(() => getPageMeta(trackContext, activeId, activeItem), [trackContext, activeId, activeItem]);
  const reduced = useReducedMotion();
  // 1100 was not a defined breakpoint at all, and useSidebarNav() -- which
  // returns exactly this intent -- already existed but went unused here. The
  // design system puts the left sidebar on the Desktop tier (1025px+), so the
  // threshold drops from 1100 to 1025.
  const isWide = useSidebarNav();
  const focusedGuidance = (Array.isArray(params.journey) ? params.journey[0] : params.journey) === 'guided_subject_discovery'
    || (Array.isArray(params.focus) ? params.focus[0] : params.focus) === 'guidance'
    || (Array.isArray(params.guided) ? params.guided[0] : params.guided) === '1';
  const guidanceEntry = readParam(params.guidance_entry);

  useEffect(() => {
    let active = true;
    if (!user?.id || isGuest) {
      setSearchUserType(null);
      setSearchSchoolId(null);
      return () => { active = false; };
    }
    // Account type identifies the student shell, while the starting-point
    // profile distinguishes an undergraduate from JAMB and secondary users.
    setSearchUserType(user.account_type === 'student' ? 'student' : null);
    setSearchSchoolId(null);
    void getStartingPoint(user.id).then((profile) => {
      if (active) {
        setSearchUserType(profile?.userType ?? (user.account_type === 'student' ? 'student' : null));
        setSearchSchoolId(profile?.preferredSchoolId ?? null);
      }
    });
    return () => { active = false; };
  }, [isGuest, user?.account_type, user?.id]);

  // Load the user's real search history when the overlay opens. Empty until
  // they have actually searched -- the overlay hides the section in that case.
  useEffect(() => {
    if (!overlayVisible) return;
    let alive = true;
    getRecentSearches().then((terms) => {
      if (alive) setRecentSearches(terms);
    });
    return () => {
      alive = false;
    };
  }, [overlayVisible]);

  // Debounced query against /api/career/search. `generation` discards responses
  // from superseded keystrokes, so a slow early request cannot overwrite the
  // results of a later, faster one.
  const searchGeneration = useRef(0);
  useEffect(() => {
    const term = searchQuery.trim();
    if (!overlayVisible || term.length < 2) {
      setSearchPayload(null);
      setOverlayLoading(false);
      return;
    }

    const generation = ++searchGeneration.current;
    setOverlayLoading(true);
    const timer = setTimeout(() => {
      careerData
        .searchCareer(term, searchIntent ?? undefined, searchUserType, searchSchoolId)
        .then((res) => {
          if (generation !== searchGeneration.current) return;
          setSearchPayload(res.status === 'real' ? res.data ?? null : null);
        })
        .catch(() => {
          if (generation !== searchGeneration.current) return;
          setSearchPayload(null);
        })
        .finally(() => {
          if (generation === searchGeneration.current) setOverlayLoading(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchIntent, searchQuery, overlayVisible, searchSchoolId, searchUserType]);

  const overlayResults = useMemo(
    () => toSearchGroups(searchPayload, overlayScope, searchIntent),
    [searchIntent, searchPayload, overlayScope],
  );

  const tabDotX = useSharedValue(0);
  const tabW = (width - Spacing.md * 2 - Spacing.xs * 4) / 5;
  const stride = useSharedValue(tabW + Spacing.xs);
  const baseLeft = useSharedValue(Spacing.md + tabW / 2 - 8);
  const activeIdx = MOBILE_NAV.findIndex(n => n.id === activeMobileId);

  useEffect(() => {
    const nextW = (width - Spacing.md * 2 - Spacing.xs * 4) / 5;
    stride.value = nextW + Spacing.xs;
    baseLeft.value = Spacing.md + nextW / 2 - 8;
  }, [width, stride, baseLeft]);

  useEffect(() => {
    tabDotX.value = withSpring(Math.max(0, activeIdx), reduced ? Spring.press : Spring.arrive);
  }, [activeIdx, tabDotX, reduced]);

  const dotAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: baseLeft.value + tabDotX.value * stride.value }],
  }));

  const goTo = (item: ShellNavItem) => {
    setDrawerOpen(false);
    router.push(item.href as any);
  };

  return (
    <SearchLauncherProvider onOpen={(query, scope) => { if (query !== undefined) setSearchQuery(query); if (scope) setOverlayScope(scope); setOverlayVisible(true); }}>
    <View style={[styles.root, { backgroundColor: colors.surface.base }]}>
      {!focusedGuidance && isWide && (
        <View
          style={[
            styles.sidebar,
            {
              paddingTop: Math.max(insets.top, Spacing.lg),
              backgroundColor: colors.surface.raised,
              borderRightColor: colors.borderRole.subtle,
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={[styles.brandBadge, { backgroundColor: colors.textRole.primary }]}>
              <Text style={styles.brandBadgeText}>S</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.textRole.primary }]}>Sifter</Text>
              <Text style={[styles.brandSub, { color: colors.textRole.muted }]}>LEVELUP</Text>
            </View>
          </View>

          <NavList items={primaryNav} activeId={activeId} onNavigate={goTo} />

        </View>
      )}

      <View style={styles.main}>
        <View
          style={[
            styles.topbar,
            focusedGuidance && styles.focusTopbar,
            {
              paddingTop: Math.max(insets.top, Spacing.md),
              backgroundColor: colors.surface.raised,
              borderBottomColor: colors.borderRole.subtle,
            },
          ]}
        >
          <View style={styles.topbarLeft}>
            {!isWide && !focusedGuidance && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open navigation menu"
                accessibilityState={{ expanded: drawerOpen }}
                style={[styles.topbarIconBtn, { backgroundColor: colors.surface.subtle }]}
              >
                <Feather name="menu" size={18} color={colors.textRole.primary} />
              </TouchableOpacity>
            )}

            <View>
              <Text style={[styles.pageEyebrow, { color: colors.textRole.muted }]}>{focusedGuidance ? 'Sifter guidance' : pageMeta.eyebrow}</Text>
              <Text style={[styles.pageTitle, { color: colors.textRole.primary }]}>{focusedGuidance ? 'Choose your next step' : pageMeta.title}</Text>
            </View>
          </View>

          <View style={styles.topbarActions}>
            {focusedGuidance ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  if (guidanceEntry?.startsWith('/')) router.replace(guidanceEntry as any);
                  else router.replace('/(tabs)/home' as any);
                }}
                style={[styles.focusExitButton, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
              >
                <Text style={[styles.focusExitText, { color: colors.textRole.primary }]}>Exit guidance</Text>
              </TouchableOpacity>
            ) : null}
            {!focusedGuidance ? <>
            {isWide && (
              <View style={styles.searchWrap}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={(value) => {
                    setSearchQuery(value);
                    setOverlayVisible(true);
                  }}
                  onFocus={() => setOverlayVisible(true)}
                   placeholder="What do you want to find or do?"
                   style={styles.searchStub}
                />
              </View>
            )}

            {!isWide && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setOverlayVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Open contextual search"
                style={[styles.topbarIconBtn, { backgroundColor: colors.surface.subtle }]}
              >
                <Feather name="search" size={18} color={colors.textRole.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggle}
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              style={[styles.topbarIconBtn, { backgroundColor: colors.surface.subtle }]}
            >
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={colors.textRole.primary} />
            </TouchableOpacity>

            </> : null}
          </View>
        </View>

        <View style={[styles.content, !isWide && !focusedGuidance && { paddingBottom: 18 }]}>{children}</View>

        {!isWide && !focusedGuidance && (() => {
          const DOT_W = 16;
          const DOT_H = 3;
          return (
            <View
              style={[
                styles.mobileTabbar,
                {
                  paddingBottom: Math.max(insets.bottom, Spacing.sm),
                  backgroundColor: colors.surface.raised,
                  borderTopColor: colors.borderRole.subtle,
                },
              ]}
            >
              <Animated.View
                style={[
                  dotAnimStyle,
                  {
                    position: 'absolute',
                    bottom: Math.max(insets.bottom, Spacing.sm) + 2,
                    width: DOT_W,
                    height: DOT_H,
                    borderRadius: DOT_H / 2,
                    backgroundColor: colors.accentRole.action,
                  },
                ]}
              />
              {MOBILE_NAV.map(item => {
                const active = item.id === activeMobileId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(item.href as any)}
                    accessibilityRole="tab"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: active }}
                    style={styles.mobileTab}
                  >
                    <Feather
                      name={item.icon}
                      size={16}
                      color={active ? colors.accentRole.action : colors.textRole.muted}
                    />
                    <Text
                      style={[
                        styles.mobileTabLabel,
                        { color: active ? colors.textRole.primary : colors.textRole.muted },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })()}
      </View>

      <Modal visible={drawerOpen && !isWide} animationType="fade" transparent onRequestClose={() => setDrawerOpen(false)}>
        <Pressable
          style={styles.drawerOverlay}
          onPress={() => setDrawerOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close navigation menu"
        >
          <Pressable
            onPress={() => undefined}
            // Swallows backdrop taps only; it is not a control. "no" hides just
            // this view — descendants (the drawer's nav) stay reachable.
            importantForAccessibility="no"
            style={[
              styles.drawerSheet,
              {
                paddingTop: Math.max(insets.top, Spacing.lg),
                backgroundColor: colors.surface.raised,
                borderRightColor: colors.borderRole.subtle,
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <View style={[styles.brandBadge, { backgroundColor: colors.textRole.primary }]}>
                  <Text style={styles.brandBadgeText}>S</Text>
                </View>
                <View>
                  <Text style={[styles.brandTitle, { color: colors.textRole.primary }]}>Sifter</Text>
                  <Text style={[styles.brandSub, { color: colors.textRole.muted }]}>LEVELUP</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setDrawerOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
              >
                <Feather name="x" size={18} color={colors.textRole.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <NavList items={primaryNav} activeId={activeId} onNavigate={goTo} />

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <SearchOverlay
        visible={overlayVisible}
        onClose={() => { setOverlayVisible(false); setSearchQuery(""); setSearchIntent(null); setOverlayScope("all"); }}
        value={searchQuery}
        onChangeText={setSearchQuery}
        scope={overlayScope}
        onScopeChange={setOverlayScope}
        intent={searchIntent}
        onIntentChange={(intent) => { setSearchIntent(intent); setOverlayScope("all"); }}
        userType={searchUserType}
        searchContext={searchPayload?.searchContext}
        loading={overlayLoading}
        results={overlayResults}
        onResultPress={(result) => {
          const href = resolveSearchHref(result);
          // A row with no destination must not navigate. Previously every
          // result pushed /explore, so picking a specific role or programme
          // silently landed the user somewhere unrelated.
          if (!href) return;
          void addRecentSearch(searchQuery);
          setOverlayVisible(false);
          setSearchQuery("");
          router.push(href as any);
        }}
        onOpenExplore={(query, scope) => {
          void addRecentSearch(query);
          setOverlayVisible(false);
          router.push(exploreQueryHref('/(tabs)/explore', { text: query, scope: scope === 'subgroups' ? 'areas' : scope }) as any);
        }}
        recentSearches={recentSearches}
        onRecentPress={(term) => setSearchQuery(term)}
        suggestions={SEARCH_SUGGESTIONS}
        onSuggestionPress={(term) => setSearchQuery(term)}
        isGuest={isGuest}
        onSignIn={() => {
          setOverlayVisible(false);
          router.push("/(auth)/sign-in" as any);
        }}
      />
    </View>
    </SearchLauncherProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 224,
    borderRightWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  brandBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#fff',
    fontSize: 14,
    ...CompassFonts.displayBold,
  },
  brandTitle: {
    fontSize: 14,
    ...CompassFonts.bodySemibold,
  },
  brandSub: {
    fontSize: 9,
    ...CompassFonts.bodySemibold,
    letterSpacing: 1,
  },
  navList: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 0,
  },
  navActiveDot: {
    position: 'absolute',
    left: -2,
    top: '50%',
    width: 3,
    height: 14,
    borderRadius: 1.5,
    marginTop: -7,
  },
  navIconWrap: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navIcon: {
    fontSize: 13,
  },
  navLabel: {
    fontSize: 13,
    ...CompassFonts.bodySemibold,
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  profileMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  profileMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMiniLabel: {
    fontSize: 11,
    ...CompassFonts.bodySemibold,
  },
  profileMiniSub: {
    fontSize: 9,
    marginTop: 2,
  },
  main: {
    flex: 1,
  },
  topbar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  focusTopbar: {
    minHeight: 62,
  },
  topbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pageEyebrow: {
    fontSize: 10,
    ...CompassFonts.bodySemibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: FontSize.lg,
    ...CompassFonts.bodySemibold,
    marginTop: 1,
  },
  topbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusExitButton: {
    minHeight: TOUCH_TARGET_MIN,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusExitText: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodySemibold,
  },
  searchWrap: {
    position: 'relative',
    width: 420,
    maxWidth: '45vw' as DimensionValue,
  },
  searchStub: {
    width: '100%',
    minWidth: 360,
    maxWidth: 480,
  },
  topbarIconBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  mobileTabbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  mobileTab: {
    flex: 1,
    // Was 42 — just under the 44pt minimum, and this is the app's primary
    // navigation. Uses the shared constant so it cannot drift again.
    minHeight: TOUCH_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
  },
  mobileTabLabel: {
    fontSize: 11,
    ...CompassFonts.bodySemibold,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,25,0.28)',
    flexDirection: 'row',
  },
  drawerSheet: {
    width: 320,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  drawerSecondary: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  secondaryBtnLabel: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodyBold,
  },
});
