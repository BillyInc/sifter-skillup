/**
 * Sifter Skill_Up — Sidebar (Web)
 * Shown on web when width >= 768px. Tab bar hidden.
 * Navigation-aware: highlights active route.
 * Exports useSidebar() hook for layout decisions.
 *
 * Usage in App.tsx:
 *   const { showSidebar } = useSidebar();
 *   if (showSidebar) return <Sidebar />;
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Platform, useWindowDimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, Shadow,
} from '../theme';
import { xpEngine }     from '../lib/XPEngine';
import { streakEngine }  from '../lib/StreakEngine';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSidebar() {
  const { width } = useWindowDimensions();
  const showSidebar = Platform.OS === 'web' && width >= 768;
  return { showSidebar, sidebarWidth: 220 };
}

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  routeName: string;
  label: string;
  emoji: string;
  activeEmoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { routeName: 'Home',    label: 'Home',    emoji: '○',  activeEmoji: '⚡' },
  { routeName: 'Tracks',  label: 'Tracks',  emoji: '🌐', activeEmoji: '🌐' },
  { routeName: 'Feed',   label: 'Feed',     emoji: '📰', activeEmoji: '📰' },
  { routeName: 'Profile', label: 'Profile', emoji: '👤', activeEmoji: '👤' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { routeName: 'Settings', label: 'Settings', emoji: '⚙️', activeEmoji: '⚙️' },
];

// ─── Nav row ──────────────────────────────────────────────────────────────────

function NavRow({
  item,
  isActive,
  onPress,
  badge,
}: {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
  badge?: string;
}) {
  const { colors } = useTheme();
  const bgAnim     = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', colors.accentSoft],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View
        style={[
          styles.navRow,
          { backgroundColor: bgColor },
          isActive && styles.navRowActive,
        ]}
      >
        {/* Active indicator bar */}
        {isActive && (
          <View style={[styles.activeBar, { backgroundColor: colors.accent }]} />
        )}

        <Text style={[styles.navEmoji, isActive && { opacity: 1 }]}>
          {isActive ? item.activeEmoji : item.emoji}
        </Text>

        <Text style={[
          styles.navLabel,
          { color: isActive ? colors.accent : colors.textSoft },
          isActive && { fontWeight: FontWeight.bold },
        ]}>
          {item.label}
        </Text>

        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const navigation      = useRouter();
  const { colors, isDark, toggle } = useTheme();
  const { sidebarWidth } = useSidebar();

  const [xpTotal, setXpTotal]   = useState(0);
  const [streak, setStreak]     = useState(0);

  // Get current active tab name
  const pathname = usePathname();
  const activeRoute = (() => {
    // Derive active route from pathname
    try {
      const segment = pathname.split('/').filter(Boolean).pop() ?? 'Home';
      // Capitalize first letter to match route names
      return segment.charAt(0).toUpperCase() + segment.slice(1) || 'Home';
    } catch {
      return 'Home';
    }
  })();

  useEffect(() => {
    (async () => {
      const [xpSnap, streakSnap] = await Promise.all([
        xpEngine.snapshot(),
        streakEngine.status(),
      ]);
      setXpTotal(xpSnap.totalXp);
      setStreak(streakSnap.streak);
    })();
  }, []);

  // Entrance slide-in
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, []);

  const navigateTo = (routeName: string) => {
    navigation.push(`/${routeName.toLowerCase()}` as any);
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          width: sidebarWidth,
          backgroundColor: colors.card,
          borderRightColor: colors.border,
          transform: [{ translateX: slideAnim }],
        },
        Shadow.md,
      ]}
    >
      {/* ── Brand ── */}
      <View style={[styles.brand, { borderBottomColor: colors.border }]}>
        <Text style={[styles.brandEmoji]}>⚡</Text>
        <View>
          <Text style={[styles.brandName, { color: colors.text }]}>Sifter</Text>
          <Text style={[styles.brandSub, { color: colors.accent }]}>Skill_Up</Text>
        </View>
      </View>

      {/* ── XP + Streak pill ── */}
      <View style={[styles.statPill, { backgroundColor: colors.bgSecondary }]}>
        <View style={styles.statPillItem}>
          <Text style={[styles.statPillValue, { color: colors.accent }]}>{xpTotal}</Text>
          <Text style={[styles.statPillLabel, { color: colors.textMuted }]}>XP</Text>
        </View>
        <View style={[styles.statPillDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statPillItem}>
          <Text style={[styles.statPillValue, { color: colors.orange }]}>{streak}🔥</Text>
          <Text style={[styles.statPillLabel, { color: colors.textMuted }]}>Streak</Text>
        </View>
      </View>

      {/* ── Main nav ── */}
      <View style={styles.navSection}>
        {NAV_ITEMS.map(item => (
          <NavRow
            key={item.routeName}
            item={item}
            isActive={activeRoute === item.routeName}
            onPress={() => navigateTo(item.routeName)}
          />
        ))}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* ── Secondary nav ── */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        {/* Learning shortcut */}
        <TouchableOpacity
          style={[styles.learnBtn, { backgroundColor: colors.accent }]}
          onPress={() => navigateTo('Map')}
          activeOpacity={0.85}
        >
          <Text style={styles.learnBtnText}>🏝️ Continue Learning</Text>
        </TouchableOpacity>

        {/* Bottom items */}
        {BOTTOM_ITEMS.map(item => (
          <NavRow
            key={item.routeName}
            item={item}
            isActive={activeRoute === item.routeName}
            onPress={() => navigateTo(item.routeName)}
          />
        ))}

        {/* Dark mode toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: colors.bgSecondary }]}
          onPress={toggle}
          activeOpacity={0.75}
        >
          <Text style={styles.themeToggleEmoji}>{isDark ? '☀️' : '🌙'}</Text>
          <Text style={[styles.themeToggleLabel, { color: colors.textSoft }]}>
            {isDark ? 'Light mode' : 'Dark mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sidebar: {
    height: '100%' as any,
    borderRightWidth: 1,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    flexDirection: 'column',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  brandEmoji:   { fontSize: 28 },
  brandName:    { fontSize: FontSize.lg, fontWeight: FontWeight.black, lineHeight: 20 },
  brandSub:     { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1 },

  statPill: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  statPillItem:     { flex: 1, alignItems: 'center' },
  statPillValue:    { fontSize: FontSize.md, fontWeight: FontWeight.black },
  statPillLabel:    { fontSize: 10, fontWeight: FontWeight.semibold, marginTop: 2 },
  statPillDivider:  { width: 1, marginVertical: 4 },

  navSection:  { gap: 2, paddingHorizontal: Spacing.sm },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  navRowActive: {},
  activeBar: {
    position: 'absolute',
    left: 0,
    top: '20%' as any,
    bottom: '20%' as any,
    width: 3,
    borderRadius: Radius.full,
  },
  navEmoji:   { fontSize: 18, opacity: 0.7 },
  navLabel:   { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  badge: {
    marginLeft: 'auto' as any,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText:  { fontSize: 9, fontWeight: FontWeight.black, color: '#fff' },

  bottomSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  learnBtn: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  learnBtnText:     { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#fff' },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    marginTop: Spacing.xs,
  },
  themeToggleEmoji: { fontSize: 16 },
  themeToggleLabel: { fontSize: FontSize.sm },
});
