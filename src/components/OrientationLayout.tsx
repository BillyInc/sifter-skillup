/**
 * Sifter Skill_Up — OrientationLayout
 *
 * NEW FILE: src/components/OrientationLayout.tsx
 *
 * A drop-in wrapper that makes any screen respond correctly to
 * portrait ↔ landscape rotation.
 *
 * Usage — wrap any screen's root View:
 *
 *   import OrientationLayout from '../components/OrientationLayout';
 *
 *   export default function IslandMapScreen() {
 *     return (
 *       <OrientationLayout>
 *         {({ isLandscape, width, height, col, row }) => (
 *           <View style={col}>
 *             ...
 *           </View>
 *         )}
 *       </OrientationLayout>
 *     );
 *   }
 *
 * Render props:
 *   isLandscape  — boolean
 *   isPortrait   — boolean
 *   width        — screen width
 *   height       — screen height
 *   col          — StyleSheet for a vertical (column) flex container
 *   row          — StyleSheet for a horizontal (row) flex container
 *
 * Pre-built layout helpers (use as `style` values):
 *   splitRow(leftFlex, rightFlex) — two-column layout for landscape
 *   stackCol()                    — single column for portrait
 *
 * Landscape-aware defaults:
 *   Portrait  → single column, full width
 *   Landscape → two columns, left/right split (60/40 default)
 */

import React from 'react';
import {
  View, ScrollView, StyleSheet, ViewStyle, StyleProp,
} from 'react-native';
import { useOrientation, OrientationValue } from '../hooks/useOrientation';
import { Spacing } from '../theme';

// ─── Types ──────────────────────────────────────────────────

export interface OrientationLayoutRenderProps {
  orientation:  OrientationValue;
  isLandscape:  boolean;
  isPortrait:   boolean;
  width:        number;
  height:       number;
  /** Ready-to-use flex column style */
  col:          ViewStyle;
  /** Ready-to-use flex row style */
  row:          ViewStyle;
  /** Content width after horizontal padding */
  contentWidth: number;
}

interface OrientationLayoutProps {
  children: (props: OrientationLayoutRenderProps) => React.ReactNode;
  /** Extra padding added in landscape to account for safe area */
  landscapePaddingH?: number;
  /** Wrap content in a ScrollView (default: false) */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ─── Component ───────────────────────────────────────────────

export default function OrientationLayout({
  children,
  landscapePaddingH = Spacing.xl,
  scrollable = false,
  style,
}: OrientationLayoutProps) {
  const { orientation, isLandscape, isPortrait, width, height } = useOrientation();

  const hPad        = isLandscape ? landscapePaddingH : 0;
  const contentWidth = width - hPad * 2;

  const props: OrientationLayoutRenderProps = {
    orientation,
    isLandscape,
    isPortrait,
    width,
    height,
    contentWidth,
    col: {
      flex:           1,
      flexDirection:  'column',
      paddingHorizontal: hPad,
    },
    row: {
      flex:           1,
      flexDirection:  'row',
      paddingHorizontal: hPad,
    },
  };

  const content = children(props);

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.flex, style]}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.flex, style]}>
      {content}
    </View>
  );
}

// ─── Pre-built layout helpers ─────────────────────────────────

/**
 * Two-column layout for landscape mode.
 * In portrait, falls back to a single column.
 *
 * Usage:
 *   const { isLandscape } = useOrientation();
 *   <View style={isLandscape ? splitRow(0.6, 0.4) : stackCol()}>
 */
export function splitRow(
  leftFlex = 0.55,
  rightFlex = 0.45,
  gap = Spacing.lg,
): { container: ViewStyle; left: ViewStyle; right: ViewStyle } {
  return {
    container: {
      flexDirection: 'row',
      flex: 1,
      gap,
    },
    left: {
      flex: leftFlex,
    },
    right: {
      flex: rightFlex,
    },
  };
}

export function stackCol(): ViewStyle {
  return { flex: 1, flexDirection: 'column' };
}

// ─── Landscape sidebar layout ────────────────────────────────

/**
 * Fixed-width sidebar + scrollable main content.
 * Used by SkillsScreen, PortfolioHubScreen in landscape.
 *
 * Usage:
 *   const layout = sidebarLayout(220);
 *   <View style={layout.container}>
 *     <View style={layout.sidebar}>...</View>
 *     <ScrollView style={layout.main}>...</ScrollView>
 *   </View>
 */
export function sidebarLayout(sidebarWidth = 240, gap = 0): {
  container: ViewStyle;
  sidebar: ViewStyle;
  main: ViewStyle;
} {
  return {
    container: { flexDirection: 'row', flex: 1 },
    sidebar:   { width: sidebarWidth },
    main:      { flex: 1 },
  };
}

// ─── Lesson screen layout ────────────────────────────────────

/**
 * Lesson-specific layout.
 * Portrait: content stacked, answer choices below.
 * Landscape: question left, answer choices right.
 */
export function lessonLayout(isLandscape: boolean): {
  outer:   ViewStyle;
  content: ViewStyle;
  answers: ViewStyle;
} {
  if (isLandscape) {
    return {
      outer:   { flex: 1, flexDirection: 'row' },
      content: { flex: 0.5, paddingRight: Spacing.md },
      answers: { flex: 0.5, paddingLeft: Spacing.md },
    };
  }
  return {
    outer:   { flex: 1, flexDirection: 'column' },
    content: { flex: 1 },
    answers: { paddingBottom: Spacing.lg },
  };
}

// ─── Island map layout ───────────────────────────────────────

/**
 * Island map landscape layout:
 * Left panel = island list, right panel = island detail/level dots.
 */
export function islandMapLayout(isLandscape: boolean): {
  outer:       ViewStyle;
  islandList:  ViewStyle;
  levelDetail: ViewStyle;
} {
  if (isLandscape) {
    return {
      outer:       { flex: 1, flexDirection: 'row' },
      islandList:  { width: 280, borderRightWidth: 1 },
      levelDetail: { flex: 1 },
    };
  }
  return {
    outer:       { flex: 1, flexDirection: 'column' },
    islandList:  { flex: 1 },
    levelDetail: { display: 'none' as any },
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
