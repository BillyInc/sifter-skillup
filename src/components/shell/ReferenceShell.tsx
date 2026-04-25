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
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSize, FontWeight, Radius, Shadow, Spacing, useTheme } from '../../theme';

type NavId =
  | 'dashboard'
  | 'islands'
  | 'tracks'
  | 'guilds'
  | 'portfolio'
  | 'streaks'
  | 'settings';

interface ShellNavItem {
  id: NavId;
  label: string;
  icon: string;
  href: string;
  sub: string;
}

const PRIMARY_NAV: ShellNavItem[] = [
  { id: 'dashboard', label: 'Dashboard',      icon: '⊞', href: '/(tabs)/map',         sub: 'Overview' },
  { id: 'islands',   label: 'My Islands',     icon: '🗺️', href: '/(tabs)/map/island',  sub: 'Island 18 and beyond' },
  { id: 'tracks',    label: 'Career Tracks',  icon: '🧭', href: '/(tabs)/fields',      sub: 'Skill paths' },
  { id: 'guilds',    label: 'Guilds',         icon: '🛡️', href: '/(tabs)/guild',       sub: 'Leaderboard and chat' },
  { id: 'portfolio', label: 'Portfolio & XP', icon: '💼', href: '/(tabs)/portfolio',   sub: 'Artifacts and pushes' },
  { id: 'streaks',   label: 'Streaks',        icon: '🔥', href: '/(tabs)/streaks',     sub: 'Consistency' },
  { id: 'settings',  label: 'Settings',       icon: '⚙', href: '/(tabs)/settings',    sub: 'Theme and preferences' },
];

function getActiveNavId(pathname: string | null): NavId {
  if (!pathname) return 'dashboard';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/streaks')) return 'streaks';
  if (pathname.includes('/portfolio')) return 'portfolio';
  if (pathname.includes('/guild') || pathname.includes('/community')) return 'guilds';
  if (pathname.includes('/fields')) return 'tracks';
  if (pathname.includes('/map/island')) return 'islands';
  return 'dashboard';
}

function NavList({
  activeId,
  onNavigate,
}: {
  activeId: NavId;
  onNavigate: (item: ShellNavItem) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.navList}>
      {PRIMARY_NAV.map(item => {
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, isDark, toggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeId = useMemo(() => getActiveNavId(pathname), [pathname]);
  const activeItem = PRIMARY_NAV.find(item => item.id === activeId) ?? PRIMARY_NAV[0];
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
            <View style={[styles.brandBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.brandBadgeText}>⚡</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.text }]}>Sifter</Text>
              <Text style={[styles.brandSub, { color: colors.gold }]}>SKILL_UP</Text>
            </View>
          </View>

          <NavList activeId={activeId} onNavigate={goTo} />

          <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.profileMini, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
            >
              <View style={[styles.profileMiniAvatar, { backgroundColor: colors.accent }]}>
                <Text style={styles.profileMiniAvatarText}>U</Text>
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
                <Text style={[styles.topbarIconText, { color: colors.text }]}>☰</Text>
              </TouchableOpacity>
            )}

            <View>
              <Text style={[styles.pageEyebrow, { color: colors.textMuted }]}>Reference Shell</Text>
              <Text style={[styles.pageTitle, { color: colors.text }]}>{activeItem.label}</Text>
            </View>
          </View>

          <View style={styles.topbarActions}>
            <View style={[styles.searchStub, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.searchStubText, { color: colors.textMuted }]}>Search is routed next through Feed and Guilds</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/feed' as any)}
              style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
            >
              <Text style={[styles.topbarActionLabel, { color: colors.text }]}>📰</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggle}
              style={[styles.topbarIconBtn, { backgroundColor: colors.bgSecondary }]}
            >
              <Text style={[styles.topbarActionLabel, { color: colors.text }]}>{isDark ? '☀' : '☾'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[styles.avatarBtn, { backgroundColor: colors.text }]}
            >
              <Text style={styles.avatarBtnText}>U</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>{children}</View>
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
                  <Text style={styles.brandBadgeText}>⚡</Text>
                </View>
                <View>
                  <Text style={[styles.brandTitle, { color: colors.text }]}>Sifter</Text>
                  <Text style={[styles.brandSub, { color: colors.gold }]}>SKILL_UP</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <NavList activeId={activeId} onNavigate={goTo} />

              <View style={[styles.drawerSecondary, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setDrawerOpen(false);
                    router.push('/(tabs)/feed' as any);
                  }}
                  style={[styles.secondaryBtn, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
                >
                  <Text style={styles.secondaryBtnIcon}>📰</Text>
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
    borderRadius: 18,
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
  searchStub: {
    minWidth: 220,
    maxWidth: 360,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchStubText: {
    fontSize: FontSize.xs,
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
    borderRadius: 21,
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
