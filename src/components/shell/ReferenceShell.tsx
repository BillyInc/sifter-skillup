import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontSize, FontWeight, Radius, Shadow, Spacing, useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { resolveTrackContext, type TrackContext } from '../../lib/trackContext';

type NavId =
  | 'dashboard'
  | 'islands'
  | 'tracks'
  | 'guilds'
  | 'portfolio'
  | 'streaks'
  | 'settings'
  | 'feed'
  | 'profile';

interface ShellNavItem {
  id: NavId;
  label: string;
  icon: string;
  href: string;
  sub: string;
}

interface ShellSearchItem {
  id: string;
  label: string;
  hint: string;
  href: string;
  keywords: string[];
}

const PRIMARY_NAV: ShellNavItem[] = [
  { id: 'dashboard', label: 'Dashboard',      icon: '⊞', href: '/(tabs)/home',        sub: 'Overview' },
  { id: 'islands',   label: 'My Islands',     icon: '🗺', href: '/map/island',  sub: 'Island 18 and beyond' },
  { id: 'tracks',    label: 'Career Tracks',  icon: '🧭', href: '/(tabs)/fields',      sub: 'Skill paths' },
  { id: 'guilds',    label: 'Guilds',         icon: '🛡', href: '/(tabs)/guild',       sub: 'Leaderboard and chat' },
  { id: 'portfolio', label: 'Portfolio & XP', icon: '💼', href: '/(tabs)/portfolio',   sub: 'Artifacts and XP' },
  { id: 'streaks',   label: 'Streaks',        icon: '🔥', href: '/(tabs)/streaks',     sub: 'Consistency' },
  { id: 'settings',  label: 'Settings',       icon: '⚙', href: '/(tabs)/settings',    sub: 'Theme and preferences' },
];

const MOBILE_NAV: { id: NavId; label: string; icon: string; href: string }[] = [
  { id: 'dashboard', label: 'Home', icon: '⊞', href: '/(tabs)/home' },
  { id: 'tracks', label: 'Tracks', icon: '🧭', href: '/(tabs)/fields' },
  { id: 'feed', label: 'Feed', icon: '📺', href: '/(tabs)/feed' },
  { id: 'profile', label: 'Profile', icon: '👤', href: '/(tabs)/profile' },
];

function isIslandWorkspace(trackContext: TrackContext): boolean {
  return trackContext.continueHref.includes('/map/island');
}

function buildPrimaryNav(trackContext: TrackContext): ShellNavItem[] {
  if (trackContext.mode !== 'track') {
    return PRIMARY_NAV;
  }

  const workspaceNav: ShellNavItem = isIslandWorkspace(trackContext)
    ? {
        id: 'islands',
        label: 'My Islands',
        icon: '🗺',
        href: trackContext.continueHref,
        sub: `${trackContext.trackName} map and lessons`,
      }
    : {
        id: 'islands',
        label: 'My Track',
        icon: '🧭',
        href: trackContext.continueHref,
        sub: `${trackContext.trackName} workspace`,
      };

  return [
    PRIMARY_NAV[0],
    workspaceNav,
    { ...PRIMARY_NAV[2], label: 'All Tracks', sub: 'Switch paths' },
    ...PRIMARY_NAV.slice(3),
  ];
}

function getPageMeta(trackContext: TrackContext, activeId: NavId, activeItem: ShellNavItem) {
  if (trackContext.mode === 'track' && activeId === 'dashboard') {
    return {
      eyebrow: trackContext.heroEyebrow,
      title: trackContext.trackName,
    };
  }

  if (trackContext.mode === 'track' && activeId === 'islands') {
    return {
      eyebrow: isIslandWorkspace(trackContext) ? trackContext.heroEyebrow : activeItem.label,
      title: isIslandWorkspace(trackContext) ? activeItem.label : trackContext.trackName,
    };
  }

  return {
    eyebrow: 'Sifter Workspace',
    title: activeItem.label,
  };
}

function getActiveNavId(pathname: string | null): NavId {
  if (!pathname) return 'dashboard';
  if (pathname.includes('/profile')) return 'profile';
  if (pathname.includes('/feed')) return 'feed';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/streaks')) return 'streaks';
  if (pathname.includes('/portfolio')) return 'portfolio';
  if (pathname.includes('/guild') || pathname.includes('/community')) return 'guilds';
  if (pathname.includes('/quant-map')) return 'islands';
  if (pathname.includes('/world')) return 'islands';
  if (pathname.includes('/starknet-track')) return 'islands';
  if (pathname.includes('/ecosystem-track')) return 'islands';
  if (pathname.includes('/cairo-builder-track')) return 'islands';
  if (pathname.includes('/map')) return 'islands';
  if (pathname.includes('/skills')) return 'tracks';
  if (pathname.includes('/fields')) return 'tracks';
  if (pathname.includes('/home')) return 'dashboard';
  return 'dashboard';
}

function getActiveMobileNavId(activeId: NavId): NavId {
  if (activeId === 'tracks') return 'tracks';
  if (activeId === 'feed') return 'feed';
  if (activeId === 'profile' || activeId === 'settings' || activeId === 'portfolio' || activeId === 'streaks') {
    return 'profile';
  }
  return 'dashboard';
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
                { backgroundColor: active ? 'rgba(255,255,255,0.16)' : colors.bgSecondary },
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: active ? '#fff' : colors.text }]}>{item.label}</Text>
              <Text style={[styles.navSub, { color: active ? 'rgba(255,255,255,0.72)' : colors.textMuted }]}>{item.sub}</Text>
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
  const [searchFocused, setSearchFocused] = useState(false);
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

  const searchItems = useMemo<ShellSearchItem[]>(() => {
    const workspaceLabel = trackContext.mode === 'track'
      ? (isIslandWorkspace(trackContext) ? 'My Islands' : 'My Track')
      : 'My Islands';
    const workspaceHint = trackContext.mode === 'track'
      ? (isIslandWorkspace(trackContext)
          ? `${trackContext.trackName} map and island lessons`
          : `${trackContext.trackName} workspace`)
      : 'Island map and lessons';
    const base: ShellSearchItem[] = [
      { id: 'dashboard', label: 'Dashboard', hint: 'Overview and workspace', href: '/(tabs)/home', keywords: ['dashboard', 'home', 'overview', 'workspace'] },
      {
        id: 'islands',
        label: workspaceLabel,
        hint: workspaceHint,
        href: trackContext.mode === 'track' ? trackContext.continueHref : '/map/island',
        keywords: ['islands', 'map', 'lessons', 'levels', 'workspace', 'current track', trackContext.trackName.toLowerCase(), trackContext.worldName.toLowerCase()],
      },
      {
        id: 'tracks',
        label: trackContext.mode === 'track' ? 'All Tracks' : 'Career Tracks',
        hint: trackContext.mode === 'track' ? 'Switch to another path' : 'Browse skill paths',
        href: '/(tabs)/fields',
        keywords: ['tracks', 'skills', 'fields', 'career', 'switch track'],
      },
      { id: 'guilds', label: 'Guilds', hint: 'Guild hub, rankings, and chat', href: '/(tabs)/guild', keywords: ['guilds', 'guild', 'rankings', 'leaderboard', 'chat', 'community'] },
      { id: 'feed', label: 'Feeds', hint: 'Track news, jobs, and signals', href: '/(tabs)/feed', keywords: ['feeds', 'feed', 'news', 'jobs', 'signals'] },
      { id: 'portfolio', label: 'Portfolio & XP', hint: 'Artifacts, tasks, and XP', href: '/(tabs)/portfolio', keywords: ['portfolio', 'artifacts', 'xp', 'projects', 'work samples'] },
      { id: 'streaks', label: 'Streaks', hint: 'Consistency and rewards', href: '/(tabs)/streaks', keywords: ['streaks', 'streak', 'consistency'] },
      { id: 'settings', label: 'Settings', hint: 'Theme, notifications, wallet', href: '/(tabs)/settings', keywords: ['settings', 'preferences', 'theme', 'notifications', 'wallet'] },
      { id: 'profile', label: 'Profile', hint: 'Your account and progress', href: '/(tabs)/profile', keywords: ['profile', 'account', 'progress'] },
    ];

    if (trackContext.mode === 'track') {
      base.unshift({
        id: 'current-track',
        label: trackContext.trackName,
        hint: trackContext.tagline,
        href: '/(tabs)/home',
        keywords: [
          trackContext.trackName.toLowerCase(),
          trackContext.worldName.toLowerCase(),
          trackContext.heroEyebrow.toLowerCase(),
          'current track',
        ],
      });
    }

    return base;
  }, [trackContext]);

  const filteredSearchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchItems.slice(0, 5);
    return searchItems
      .filter(item =>
        item.label.toLowerCase().includes(q)
        || item.hint.toLowerCase().includes(q)
        || item.keywords.some(keyword => keyword.includes(q)),
      )
      .slice(0, 6);
  }, [searchItems, searchQuery]);

  const goTo = (item: ShellNavItem) => {
    setDrawerOpen(false);
    router.push(item.href as any);
  };

  const openSearchResult = (href: string) => {
    setSearchFocused(false);
    setSearchQuery('');
    router.push(href as any);
  };

  const handleSearchSubmit = () => {
    const first = filteredSearchItems[0];
    if (first) {
      openSearchResult(first.href);
      return;
    }
    openSearchResult('/(tabs)/feed');
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
            <View style={[styles.brandBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.brandBadgeText}>S</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.text }]}>Sifter</Text>
              <Text style={[styles.brandSub, { color: colors.gold }]}>SKILL_UP</Text>
            </View>
          </View>

          <NavList items={primaryNav} activeId={activeId} onNavigate={goTo} />

          <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.profileMini, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
            >
              <View style={[styles.profileMiniAvatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.profileMiniAvatarText}>👤</Text>
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
                <View style={[styles.searchStub, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Feather name="search" size={14} color={colors.textMuted} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                    onSubmitEditing={handleSearchSubmit}
                    placeholder={trackContext.mode === 'track' && (activeId === 'dashboard' || activeId === 'islands') ? trackContext.searchPlaceholder : 'Search screens, tracks, and tools'}
                    placeholderTextColor={colors.textMuted}
                    style={[styles.searchInput, { color: colors.text }]}
                    returnKeyType="search"
                  />
                </View>
                {searchFocused && filteredSearchItems.length > 0 && (
                  <View style={[styles.searchResults, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {filteredSearchItems.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => openSearchResult(item.href)}
                        style={[styles.searchResultRow, { borderBottomColor: colors.border }]}
                      >
                        <Text style={[styles.searchResultTitle, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.searchResultHint, { color: colors.textMuted }]}>{item.hint}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/feed' as any)}
              style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
            >
              <Text style={[styles.topbarActionLabel, { color: colors.text }]}>📺</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggle}
              style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
            >
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.avatarBtn, { backgroundColor: colors.text }]}
            >
              <Text style={styles.avatarBtnText}>👤</Text>
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
                  style={styles.mobileTab}
                >
                  <View style={[styles.mobileTabIconWrap, { backgroundColor: active ? colors.text : colors.bgSecondary }]}>
                    <Text style={[styles.mobileTabIcon, { color: active ? '#fff' : colors.text }]}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.mobileTabLabel, { color: active ? colors.text : colors.textMuted }]}>{item.label}</Text>
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
                <View style={[styles.brandBadge, { backgroundColor: colors.gold }]}>
                  <Text style={styles.brandBadgeText}>S</Text>
                </View>
                <View>
                  <Text style={[styles.brandTitle, { color: colors.text }]}>Sifter</Text>
                  <Text style={[styles.brandSub, { color: colors.gold }]}>SKILL_UP</Text>
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
                  style={[styles.secondaryBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                >
                  <Text style={styles.secondaryBtnIcon}>📺</Text>
                  <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>Open Feed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setDrawerOpen(false);
                    router.push('/(tabs)/profile' as any);
                  }}
                  style={[styles.secondaryBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                >
                  <Text style={styles.secondaryBtnIcon}>👤</Text>
                  <Text style={[styles.secondaryBtnLabel, { color: colors.text }]}>Profile</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: FontWeight.black,
  },
  brandTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 1.2,
  },
  navList: {
    gap: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    ...Shadow.xs,
  },
  navIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  navSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  profileMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
  },
  profileMiniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMiniAvatarText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  profileMiniLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  profileMiniSub: {
    fontSize: 11,
    marginTop: 2,
  },
  main: {
    flex: 1,
  },
  topbar: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  topbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  pageEyebrow: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    marginTop: 2,
  },
  topbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchWrap: {
    position: 'relative',
  },
  searchStub: {
    minWidth: 220,
    maxWidth: 360,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchIcon: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  searchInput: {
    minWidth: 220,
    fontSize: FontSize.xs,
    paddingVertical: 0,
  },
  searchResults: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  searchResultRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  searchResultTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  searchResultHint: {
    fontSize: 11,
  },
  topbarIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarIconText: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
  },
  topbarActionLabel: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  content: {
    flex: 1,
  },
  mobileTabbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  mobileTab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  mobileTabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTabIcon: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,25,0.28)',
    flexDirection: 'row',
  },
  drawerSheet: {
    width: 320,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  closeText: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
  },
  drawerSecondary: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.md,
  },
  secondaryBtnIcon: {
    fontSize: 18,
  },
  secondaryBtnLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});

