import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontSize, CompassFonts, Radius, Spacing, useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { resolveTrackContext, type TrackContext } from '@/lib/trackContext';
import { SearchOverlay, SearchBar } from '@/components/careerIntelligence';
import { TOUCH_TARGET_MIN } from '@/components/ui';
import { Spring, useReducedMotion } from '@/theme/motion';
import { careerData } from '@/lib/careerData';
import { toSearchGroups, resolveSearchHref } from '@/lib/searchResults';
import { getRecentSearches, addRecentSearch } from '@/lib/recentSearches';
import type { CareerSearchResult, SearchScope } from '@/types/career';

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
  { id: 'opportunities', label: 'Opportunities', icon: 'briefcase', href: '/(tabs)/opportunities', sub: 'Jobs, scholarships & windows' },
  { id: 'myworld',       label: 'My World',      icon: 'book-open', href: '/(tabs)/myworld',       sub: 'Tracks · Portfolio · Guild' },
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
  { id: 'opportunities', label: 'Jobs',    icon: 'briefcase', href: '/(tabs)/opportunities' },
  { id: 'myworld',       label: 'My World', icon: 'book-open', href: '/(tabs)/myworld' },
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
  const params = useLocalSearchParams<{ trackId?: string | string[]; trackName?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, isDark, toggle } = useTheme();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayScope, setOverlayScope] = useState<SearchScope>("all");
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
  const isWide = Platform.OS === 'web' && width >= 1100;

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
        .searchCareer(term)
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
  }, [searchQuery, overlayVisible]);

  const overlayResults = useMemo(
    () => toSearchGroups(searchPayload, overlayScope),
    [searchPayload, overlayScope],
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
    <View style={[styles.root, { backgroundColor: colors.surface.base }]}>
      {isWide && (
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

          <View style={[styles.sidebarFooter, { borderTopColor: colors.borderRole.subtle }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.profileMini, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
            >
              <View style={[styles.profileMiniAvatar, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <Feather name="user" size={14} color={colors.textRole.muted} />
              </View>
              <View>
                <Text style={[styles.profileMiniLabel, { color: colors.textRole.primary }]}>Profile</Text>
                <Text style={[styles.profileMiniSub, { color: colors.textRole.muted }]}>Account & saved</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.main}>
        <View
          style={[
            styles.topbar,
            {
              paddingTop: Math.max(insets.top, Spacing.md),
              backgroundColor: colors.surface.raised,
              borderBottomColor: colors.borderRole.subtle,
            },
          ]}
        >
          <View style={styles.topbarLeft}>
            {!isWide && (
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
              <Text style={[styles.pageEyebrow, { color: colors.textRole.muted }]}>{pageMeta.eyebrow}</Text>
              <Text style={[styles.pageTitle, { color: colors.textRole.primary }]}>{pageMeta.title}</Text>
            </View>
          </View>

          <View style={styles.topbarActions}>
            {isWide && (
              <View style={styles.searchWrap}>
                <SearchBar
                  value=""
                  onChangeText={() => setOverlayVisible(true)}
                  placeholder="Search programmes, domains and roles…"
                  editable={false}
                  pointerEvents="none"
                  style={styles.searchStub}
                />
              </View>
            )}

            {!isWide && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setOverlayVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Search programmes, domains and roles"
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

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              style={[styles.avatarBtn, { backgroundColor: colors.textRole.primary }]}
            >
              <Feather name="user" size={15} color={colors.textRole.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.content, !isWide && { paddingBottom: 18 }]}>{children}</View>

        {!isWide && (() => {
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

              <View style={[styles.drawerSecondary, { borderTopColor: colors.borderRole.subtle }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setDrawerOpen(false);
                    router.push('/(tabs)/profile' as any);
                  }}
                  style={[styles.secondaryBtn, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
                >
                  <Feather name="user" size={16} color={colors.textRole.muted} />
                  <Text style={[styles.secondaryBtnLabel, { color: colors.textRole.primary }]}>Profile</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <SearchOverlay
        visible={overlayVisible}
        onClose={() => { setOverlayVisible(false); setSearchQuery(""); }}
        value={searchQuery}
        onChangeText={setSearchQuery}
        scope={overlayScope}
        onScopeChange={setOverlayScope}
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
        recentSearches={recentSearches}
        onRecentPress={(term) => setSearchQuery(term)}
        suggestions={SEARCH_SUGGESTIONS}
        onSuggestionPress={(term) => setSearchQuery(term)}
        isGuest={!user}
        onSignIn={() => {
          setOverlayVisible(false);
          router.push("/(auth)/sign-in" as any);
        }}
      />
    </View>
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
  searchWrap: {
    position: 'relative',
  },
  searchStub: {
    minWidth: 260,
    maxWidth: 340,
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
