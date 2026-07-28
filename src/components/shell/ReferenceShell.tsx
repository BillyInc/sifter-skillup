import React, { useMemo, useState } from 'react';
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
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontSize, FontWeight, Radius, Spacing, useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { resolveTrackContext, type TrackContext } from '../../lib/trackContext';
import { SearchOverlay, SearchBar } from '../careerIntelligence';
import type { SearchResult, SearchScope } from '../../types/career';

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
            style={[
              styles.navItem,
              {
                backgroundColor: active ? colors.text : colors.card,
                borderColor: active ? colors.text : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.navIconWrap,
                { backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent' },
              ]}
            >
              <Feather
                name={item.icon}
                size={15}
                color={active ? colors.textInverse : colors.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: active ? colors.textInverse : colors.textSoft }]}>{item.label}</Text>
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
  const [overlayResults, setOverlayResults] = useState<{ label: string; items: SearchResult[] }[]>([]);
  const [overlayLoading, setOverlayLoading] = useState(false);
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
  const isWide = Platform.OS === 'web' && width >= 1100;

  const goTo = (item: ShellNavItem) => {
    setDrawerOpen(false);
    router.push(item.href as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {isWide && (
        <View
          style={[
            styles.sidebar,
            {
              paddingTop: Math.max(insets.top, Spacing.lg),
              backgroundColor: colors.card,
              borderRightColor: colors.border,
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={[styles.brandBadge, { backgroundColor: colors.text }]}>
              <Text style={styles.brandBadgeText}>S</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.text }]}>Sifter</Text>
              <Text style={[styles.brandSub, { color: colors.textMuted }]}>LEVELUP</Text>
            </View>
          </View>

          <NavList items={primaryNav} activeId={activeId} onNavigate={goTo} />

          <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.profileMini, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
            >
              <View style={[styles.profileMiniAvatar, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <Feather name="user" size={14} color={colors.textMuted} />
              </View>
              <View>
                <Text style={[styles.profileMiniLabel, { color: colors.text }]}>Profile</Text>
                <Text style={[styles.profileMiniSub, { color: colors.textMuted }]}>Topbar shortcut too</Text>
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
              backgroundColor: colors.card,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.topbarLeft}>
            {!isWide && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setDrawerOpen(true)}
                style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
              >
                <Feather name="menu" size={18} color={colors.text} />
              </TouchableOpacity>
            )}

            <View>
              <Text style={[styles.pageEyebrow, { color: colors.textMuted }]}>{pageMeta.eyebrow}</Text>
              <Text style={[styles.pageTitle, { color: colors.text }]}>{pageMeta.title}</Text>
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
                style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
              >
                <Feather name="search" size={18} color={colors.text} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggle}
              style={[styles.topbarIconBtn, { backgroundColor: colors.surface.subtle }]}
            >
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.avatarBtn, { backgroundColor: colors.text }]}
            >
              <Feather name="user" size={15} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.content, !isWide && { paddingBottom: 18 }]}>{children}</View>

        {!isWide && (
          <View
            style={[
              styles.mobileTabbar,
              {
                paddingBottom: Math.max(insets.bottom, Spacing.sm),
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
            ]}
          >
            {MOBILE_NAV.map(item => {
              const active = item.id === activeMobileId;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => router.push(item.href as any)}
                  style={[
                    styles.mobileTab,
                    active && { backgroundColor: colors.text },
                  ]}
                >
                  <Feather name={item.icon} size={16} color={active ? colors.textInverse : colors.textMuted} />
                  <Text style={[styles.mobileTabLabel, { color: active ? colors.textInverse : colors.textMuted }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <Modal visible={drawerOpen && !isWide} animationType="fade" transparent onRequestClose={() => setDrawerOpen(false)}>
        <Pressable style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)}>
          <Pressable
            onPress={() => undefined}
            style={[
              styles.drawerSheet,
              {
                paddingTop: Math.max(insets.top, Spacing.lg),
                backgroundColor: colors.card,
                borderRightColor: colors.border,
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <View style={[styles.brandBadge, { backgroundColor: colors.text }]}>
                  <Text style={styles.brandBadgeText}>S</Text>
                </View>
                <View>
                  <Text style={[styles.brandTitle, { color: colors.text }]}>Sifter</Text>
                  <Text style={[styles.brandSub, { color: colors.textMuted }]}>LEVELUP</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <NavList items={primaryNav} activeId={activeId} onNavigate={goTo} />

              <View style={[styles.drawerSecondary, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setDrawerOpen(false);
                    router.push('/(tabs)/feed' as any);
                  }}
                  style={[styles.secondaryBtn, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
                >
                  <Feather name="activity" size={16} color={colors.textMuted} />
                  <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>Open Feed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setDrawerOpen(false);
                    router.push('/(tabs)/profile' as any);
                  }}
                  style={[styles.secondaryBtn, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}
                >
                  <Feather name="user" size={16} color={colors.textMuted} />
                  <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>Profile</Text>
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
          setOverlayVisible(false);
          setSearchQuery("");
          // Navigate based on result type — actual routing wired by screens
          router.push(`/(tabs)/explore` as any);
        }}
        recentSearches={["Medicine & Surgery", "UNILAG", "Computer Science"]}
        onRecentPress={(term) => setSearchQuery(term)}
        suggestions={["Law", "Engineering", "Accounting", "Nursing"]}
        onSuggestionPress={(term) => setSearchQuery(term)}
        isGuest={!user}
        onSignIn={() => {
          setOverlayVisible(false);
          router.push("/(auth)" as any);
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
    fontWeight: FontWeight.black,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
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
    fontWeight: FontWeight.semibold,
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
    fontWeight: FontWeight.semibold,
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
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
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
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
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
    fontWeight: FontWeight.bold,
  },
});
