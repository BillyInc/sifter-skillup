/**
 * RouteLine — the COMPASS signature.
 *
 * A *functional* wayfinding spine: stations encode the real typed structure of
 * the product (your start → domain → role → destination), so the ornament carries
 * information rather than decorating. It is the one memorable element, reused at
 * three scales via `variant`:
 *
 *   "rule"    — a 1px header underline that draws in on mount (DetailScaffold).
 *   "spine"   — an inline row of stations with edges between them (SkillsBridge,
 *               readiness banners, opportunity likelihood).
 *   "journey" — a full vertical diagram with labels + captions (CareerChanger
 *               pivot, PathwaysHub, elite / PhD flows, admission you-are-here).
 *
 * Station state maps to the taxonomy the codebase already models:
 *   "you"     ● filled    — you / covered / reached / current
 *   "bridge"  ◑ half-ring  — functional / in-progress / a skills bridge to cross
 *   "target"  ◎ ring       — adjacent / stretch / locked destination
 *
 * Edge kind maps to match type:
 *   "solid"  ━  Direct
 *   "dashed" ┄  Adjacent / a reach
 *
 * Motion: on mount the line draws L→R (or top→down) and stations light in
 * sequence. Respects reduce-motion (fades only, no draw).
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme, Spacing, FontSize, Radius } from '../../theme';
import { Timing, STAGGER, useReducedMotion } from '../../theme/motion';

export type StationState = 'you' | 'bridge' | 'target';
export type EdgeKind = 'solid' | 'dashed';

export interface RouteStation {
  state: StationState;
  /** Station name — shown in "spine" and "journey". */
  label?: string;
  /** Sub-caption under the label — shown in "journey" only. */
  caption?: string;
  /** Override the accent for this station (e.g. semantic colour). */
  color?: string;
}

export interface RouteLineProps {
  variant?: 'rule' | 'spine' | 'journey';
  stations?: RouteStation[];
  /** Edge style *between* stations. Length should be stations.length - 1. */
  edges?: EdgeKind[];
  /** Disable the draw-in animation. */
  static?: boolean;
  style?: ViewStyle;
}

const AView = Animated.View;

export function RouteLine({
  variant = 'rule',
  stations = [],
  edges,
  static: isStatic,
  style,
}: RouteLineProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const draw = useSharedValue(isStatic || reduced ? 1 : 0);

  useEffect(() => {
    if (isStatic || reduced) {
      draw.value = 1;
      return;
    }
    draw.value = withTiming(1, Timing.route);
  }, [isStatic, reduced, draw]);

  // ── hooks called unconditionally ──
  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: draw.value }],
  }));

  // ── "rule": a header underline that wipes in from the left ──
  if (variant === 'rule') {
    return (
      <View style={[styles.ruleTrack, { backgroundColor: colors.border }, style]}>
        <AView
          style={[
            styles.ruleFill,
            { backgroundColor: colors.cobalt },
            ruleStyle,
          ]}
        />
      </View>
    );
  }

  const nodeColor = (s: RouteStation) => s.color ?? colors.routeNode;

  const Node = ({ station, index }: { station: RouteStation; index: number }) => {
    const pop = useAnimatedStyle(() => {
      const t = draw.value;
      return { opacity: t, transform: [{ scale: 0.6 + t * 0.4 }] };
    });
    const c = nodeColor(station);
    const inner =
      station.state === 'you' ? (
        <View style={[styles.nodeFill, { backgroundColor: c }]} />
      ) : station.state === 'bridge' ? (
        <View style={[styles.nodeHalf, { borderColor: c }]}>
          <View style={[styles.nodeHalfFill, { backgroundColor: c }]} />
        </View>
      ) : (
        <View style={[styles.nodeRing, { borderColor: c }]} />
      );
    return (
      <AView style={pop}>
        <View style={styles.node}>{inner}</View>
      </AView>
    );
  };

  const Edge = ({ kind, i }: { kind: EdgeKind; i: number }) => {
    const grow = useAnimatedStyle(() => {
      const t = draw.value;
      return { opacity: t };
    });
    if (variant === 'journey') {
      return (
        <AView
          style={[
            styles.edgeV,
            kind === 'dashed'
              ? { borderColor: colors.routeLine, borderStyle: 'dashed', borderLeftWidth: 2 }
              : { backgroundColor: colors.routeLine },
            grow,
          ]}
        />
      );
    }
    return (
      <AView
        style={[
          styles.edgeH,
          kind === 'dashed'
            ? { borderColor: colors.routeLine, borderStyle: 'dashed', borderTopWidth: 2 }
            : { backgroundColor: colors.routeLine },
          grow,
        ]}
      />
    );
  };

  const edgeAt = (i: number): EdgeKind => edges?.[i] ?? 'solid';

  // ── "spine": inline horizontal row ──
  if (variant === 'spine') {
    return (
      <View style={[styles.spineRow, style]}>
        {stations.map((s, i) => (
          <React.Fragment key={i}>
            <View style={styles.spineStation}>
              <Node station={s} index={i} />
              {s.label ? (
                <Text
                  style={[styles.spineLabel, { color: colors.textSoft }]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              ) : null}
            </View>
            {i < stations.length - 1 ? (
              <Edge kind={edgeAt(i)} i={i} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    );
  }

  // ── "journey": vertical diagram with labels + captions ──
  return (
    <View style={[styles.journey, style]}>
      {stations.map((s, i) => (
        <View key={i} style={styles.journeyRow}>
          <View style={styles.journeyRail}>
            <Node station={s} index={i} />
            {i < stations.length - 1 ? <Edge kind={edgeAt(i)} i={i} /> : null}
          </View>
          <View style={styles.journeyText}>
            {s.label ? (
              <Text style={[styles.journeyLabel, { color: colors.text }]}>
                {s.label}
              </Text>
            ) : null}
            {s.caption ? (
              <Text style={[styles.journeyCaption, { color: colors.textMuted }]}>
                {s.caption}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export default RouteLine;

const NODE = 14;

const styles = StyleSheet.create({
  // rule
  ruleTrack: { height: 2, borderRadius: 1, overflow: 'hidden', width: '100%' },
  ruleFill: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    // transform-origin left so scaleX wipes from the start
    alignSelf: 'flex-start',
    transform: [{ scaleX: 0 }],
  },

  // node
  node: {
    width: NODE,
    height: NODE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeFill: { width: NODE, height: NODE, borderRadius: NODE / 2 },
  nodeRing: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  nodeHalf: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  nodeHalfFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: NODE / 2 },

  // spine (horizontal)
  spineRow: { flexDirection: 'row', alignItems: 'center' },
  spineStation: { alignItems: 'center', gap: 4 },
  spineLabel: { fontSize: FontSize.xs, fontWeight: '600', maxWidth: 92, textAlign: 'center' },
  edgeH: { flex: 1, height: 2, marginHorizontal: 6, minWidth: 18 },

  // journey (vertical)
  journey: { gap: 0 },
  journeyRow: { flexDirection: 'row', gap: Spacing.md },
  journeyRail: { alignItems: 'center', width: NODE },
  edgeV: { width: 2, flex: 1, minHeight: 26, marginVertical: 2 },
  journeyText: { flex: 1, paddingBottom: Spacing.md, gap: 2, marginTop: -2 },
  journeyLabel: { fontSize: FontSize.md, fontWeight: '700' },
  journeyCaption: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
});
