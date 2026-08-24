/**
 * Sifter LevelUp — Sidebar (Web)
 * Shown on web from the Tablet tier up (BREAKPOINTS.tablet, 768px). Tab bar
 * hidden. The design system allows a side nav from Tablet, so this stays at
 * 768 rather than moving to the Desktop tier.
 * Navigation-aware: highlights active route.
 * Exports useSidebar() hook for layout decisions.
 *
 * Usage in App.tsx:
 *   const { showSidebar } = useSidebar();
 *   if (showSidebar) return <Sidebar />;
 */

import React, { useRef, useEffect, useState } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  useTheme, Radius, FontSize, FontWeight, Shadow,
} from '../theme';
import { xpEngine }     from '../lib/XPEngine';
import { streakEngine }  from '../lib/StreakEngine';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSidebar() {
  const { isWeb, isMobile } = useResponsive();
  const showSidebar = isWeb && !isMobile;
  return { showSidebar, sidebarWidth: 210 };
}

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  routeName: string;
  label: string;
  emoji: string;
  activeEmoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { routeName: 'Home',    label: 'Home',    emoji: '○',  activeEmoji: '●' },
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
    outputRange: ['transparent', colors.navy],
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

        <View style={styles.navIconWrap}>
          <Text style={[styles.navEmoji, isActive && { opacity: 1 }]}>
            {isActive ? item.activeEmoji : item.emoji}
          </Text>
        </View>

        <View style={styles.navTextWrap}>
          <Text style={[
            styles.navLabel,
            { color: isActive ? colors.textInverse : colors.textSoft },
            isActive && styles.navLabelActive,
          ]}>
            {item.label}
          </Text>
        </View>

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
        <View>
          <Text style={[styles.brandName, { color: colors.text }]}>Sifter</Text>
          <Text style={[styles.brandSub, { color: colors.accent }]}>LEVELUP</Text>
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
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandName:    { fontSize: 14, fontWeight: FontWeight.black, lineHeight: 16, letterSpacing: -0.3 },
  brandSub:     { fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.1 },

  statPill: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statPillItem:     { flex: 1, alignItems: 'center' },
  statPillValue:    { fontSize: FontSize.md, fontWeight: FontWeight.black },
  statPillLabel:    { fontSize: 10, fontWeight: FontWeight.semibold, marginTop: 2 },
  statPillDivider:  { width: 1, marginVertical: 4 },

  navSection:  { gap: 2, paddingHorizontal: 10, paddingVertical: 4 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minHeight: 38,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 9,
    position: 'relative',
    overflow: 'hidden',
  },
  navRowActive: { backgroundColor: '#111111', borderRadius: 9 },
  activeBar: {
    position: 'absolute',
    left: 6,
    top: 10,
    bottom: 10,
    width: 2,
    borderRadius: 2,
  },
  navIconWrap: { width: 16, alignItems: 'center', justifyContent: 'center' },
  navTextWrap: { flex: 1, justifyContent: 'center' },
  navEmoji:   { fontSize: 14, opacity: 0.72 },
  navLabel:   { fontSize: 13, fontWeight: FontWeight.medium },
  navLabelActive: { fontWeight: FontWeight.bold },
  badge: {
    marginLeft: 'auto' as any,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText:  { fontSize: 9, fontWeight: '700', color: '#fff' },

  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    paddingHorizontal: 10,
    paddingBottom: 14,
    gap: 6,
  },
  learnBtn: {
    marginHorizontal: 4,
    marginBottom: 6,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnBtnText:     { fontSize: 11, fontWeight: FontWeight.bold, color: '#fff' },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.lg,
    marginHorizontal: 4,
    marginTop: 2,
  },
  themeToggleEmoji: { fontSize: 16 },
  themeToggleLabel: { fontSize: 12, fontWeight: FontWeight.medium },
});
