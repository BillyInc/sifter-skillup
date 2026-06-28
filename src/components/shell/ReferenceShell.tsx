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
  | 'home'
  | 'explore'
  | 'opportunities'
  | 'myworld'
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
  { id: 'home',          label: 'Home',          icon: '🏠', href: '/(tabs)/home',          sub: 'Your snapshot' },
  { id: 'explore',       label: 'Explore',       icon: '🔍', href: '/(tabs)/explore',       sub: 'Programmes, domains & roles' },
  { id: 'opportunities', label: 'Opportunities', icon: '🌍', href: '/(tabs)/opportunities', sub: 'Internships & jobs' },
  { id: 'myworld',       label: 'My World',      icon: '🔒', href: '/(tabs)/myworld',       sub: 'Tracks · Portfolio · Guild' },
  { id: 'profile',       label: 'Profile',       icon: '👤', href: '/(tabs)/profile',       sub: 'Account & saved' },
];

const MOBILE_NAV: { id: NavId; label: string; icon: string; href: string }[] = [
  { id: 'home',          label: 'Home',    icon: '🏠', href: '/(tabs)/home' },
  { id: 'explore',       label: 'Explore', icon: '🔍', href: '/(tabs)/explore' },
  { id: 'opportunities', label: 'Jobs',    icon: '🌍', href: '/(tabs)/opportunities' },
  { id: 'myworld',       label: 'My World', icon: '🔒', href: '/(tabs)/myworld' },
  { id: 'profile',       label: 'Profile', icon: '👤', href: '/(tabs)/profile' },
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
    || pathname.includes('/company')) return 'opportunities';
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
                { backgroundColor: active ? 'rgba(255,255,255,0.16)' : colors.bgSecondary },
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.navLabel, { color: active ? '#fff' : colors.text }]}>{item.label}</Text>
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
    return [
      { id: 'home', label: 'Home', hint: 'Your snapshot and alerts', href: '/(tabs)/home', keywords: ['home', 'dashboard', 'overview'] },
      { id: 'explore', label: 'Explore', hint: 'Programmes, domains and roles', href: '/(tabs)/explore', keywords: ['explore', 'programme', 'course', 'domain', 'role', 'search', 'jamb'] },
      { id: 'opportunities', label: 'Opportunities', hint: 'Internships and jobs — local, global, remote', href: '/(tabs)/opportunities', keywords: ['opportunities', 'jobs', 'internships', 'graduate', 'remote', 'companies'] },
      { id: 'myworld', label: 'My World', hint: 'Tracks, portfolio and guild (coming soon)', href: '/(tabs)/myworld', keywords: ['my world', 'tracks', 'learn', 'portfolio', 'guild', 'levels'] },
      { id: 'profile', label: 'Profile', hint: 'Account, saved items and settings', href: '/(tabs)/profile', keywords: ['profile', 'account', 'saved', 'bookmarks', 'settings', 'notes'] },
    ];
  }, []);

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
    openSearchResult('/(tabs)/explore');
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
              <Text style={[styles.brandSub, { color: colors.gold }]}>LEVELUP</Text>
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
                    placeholder="Search programmes, domains, roles and jobs"
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
              onPress={() => router.push('/(tabs)/opportunities' as any)}
              style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
            >
              <Text style={[styles.topbarActionLabel, { color: colors.text }]}>🌍</Text>
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
                  <Text style={[styles.brandSub, { color: colors.gold }]}>LEVELUP</Text>
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
    width: 210,
    borderRightWidth: 1,
    paddingHorizontal: 10,
    paddingBottom: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  brandBadge: {
    width: 32,
    height: 32,
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
    fontWeight: FontWeight.black,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  navList: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 34,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
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
    fontWeight: FontWeight.bold,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMiniAvatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: FontWeight.black,
  },
  profileMiniLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  profileMiniSub: {
    fontSize: 9,
    marginTop: 2,
  },
  main: {
    flex: 1,
  },
  topbar: {
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 10,
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
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
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
    minWidth: 180,
    maxWidth: 300,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  searchInput: {
    minWidth: 170,
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
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarIconText: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
  },
  topbarActionLabel: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: {
    color: '#fff',
    fontSize: 11,
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

