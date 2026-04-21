/**
 * Sifter Skill_Up — Lesson Transition
 * ─────────────────────────────────────────────────────────────
 *
 * Portal/door animation that plays between lessons (level-to-level).
 * Completely self-contained. Zero imports from LessonScreen internals.
 *
 * HOW TO USE IN LessonScreen.tsx (3-line integration)
 * ─────────────────────────────────────────────────────────────
 *
 * 1. Import at top of LessonScreen.tsx:
 *      import LessonTransition from '../components/LessonTransition';
 *
 * 2. Add state near the top of the LessonScreen component:
 *      const [showTransition, setShowTransition] = useState(false);
 *      const [pendingLevelId, setPendingLevelId] = useState<number|null>(null);
 *
 * 3. Replace the direct call to onComplete (in handleFinish) with:
 *      setPendingLevelId(nextLevelId);   // the level you're going TO
 *      setShowTransition(true);
 *
 * 4. Add the component anywhere in the SafeAreaView render (above DisclaimerFooter):
 *      <LessonTransition
 *        visible={showTransition}
 *        fromTopic={level.topic}
 *        toTopic={nextLevel?.topic ?? ''}
 *        fieldColor={fieldColor}          // e.g. Colors.accent or field-specific
 *        mechanic={nextLevel?.mechanic}   // drives which portal shape shows
 *        onDone={() => {
 *          setShowTransition(false);
 *          // now navigate to the next level — call your existing advance logic
 *          onComplete(state.stars, state.xp);
 *        }}
 *      />
 *
 * ─────────────────────────────────────────────────────────────
 *
 * PORTAL VARIANTS (driven by `mechanic` prop):
 *   'match3'   → hex grid portal (crypto/DeFi aesthetic)
 *   'memory'   → ripple wave portal (neural/data aesthetic)
 *   'chain'    → chain link door (supply chain / blockchain)
 *   'boss'     → fire vortex (warning red/orange)
 *   default    → indigo warp gate
 *
 * TIMING:
 *   Phase 1 (400ms) — current lesson content dims + slide left
 *   Phase 2 (600ms) — portal opens at center (scale 0 → full)
 *   Phase 3 (800ms) — portal holds open, topic name appears
 *   Phase 4 (400ms) — portal collapses, new content slides in from right
 *   Total: ~2.2 seconds
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  Dimensions, Modal,
} from 'react-native';
import { useTheme, Spacing, Radius, FontSize, FontWeight } from '../theme';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PortalMechanic =
  | 'match3'    // hex grid — crypto/DeFi
  | 'memory'    // ripple — data/neural
  | 'chain'     // link chain — supply/blockchain
  | 'boss'      // fire vortex — boss level
  | 'judgment'  // scales — judgment/analysis
  | 'default';  // indigo warp

export interface LessonTransitionProps {
  visible:     boolean;
  fromTopic:   string;
  toTopic:     string;
  fieldColor?: string;          // defaults to accent
  mechanic?:   string | null;   // raw mechanic string from level data
  onDone:      () => void;      // called when transition finishes
}

// ─── Timing ────────────────────────────────────────────────────────────────────

const T = {
  DIM:         350,  // lesson dims
  PORTAL_IN:   500,  // portal scales up
  HOLD:        700,  // portal stays open
  PORTAL_OUT:  400,  // portal collapses
  TOTAL:       1950, // sum
};

// ─── Utility ───────────────────────────────────────────────────────────────────

function resolvePortalMechanic(mechanic?: string | null): PortalMechanic {
  if (!mechanic) return 'default';
  if (mechanic === 'boss')                           return 'boss';
  if (mechanic.includes('chain'))                    return 'chain';
  if (mechanic.includes('memory'))                   return 'memory';
  if (mechanic.includes('match'))                    return 'match3';
  if (mechanic.includes('judgment'))                 return 'judgment';
  return 'default';
}

// ─── Portal visuals ────────────────────────────────────────────────────────────

// Hex grid portal (match3 / crypto)
function HexPortal({ color, spin }: { color: string; spin: Animated.Value }) {
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const hexes = [
    { r: 0,  ang: 0   },
    { r: 52, ang: 0   }, { r: 52, ang: 60  }, { r: 52, ang: 120 },
    { r: 52, ang: 180 }, { r: 52, ang: 240 }, { r: 52, ang: 300 },
    { r: 100, ang: 30  }, { r: 100, ang: 90  }, { r: 100, ang: 150 },
    { r: 100, ang: 210 }, { r: 100, ang: 270 }, { r: 100, ang: 330 },
  ];
  return (
    <Animated.View style={[styles.portalInner, { transform: [{ rotate }] }]}>
      {hexes.map(({ r, ang }, i) => {
        const rad = (ang * Math.PI) / 180;
        return (
          <View key={i} style={[styles.hexDot, {
            backgroundColor: color,
            left: 90 + r * Math.cos(rad) - 8,
            top:  90 + r * Math.sin(rad) - 8,
            opacity: i === 0 ? 1 : 0.5 + (i % 3) * 0.15,
            width: i === 0 ? 20 : 16 - Math.floor(i / 7) * 4,
            height: i === 0 ? 20 : 16 - Math.floor(i / 7) * 4,
          }]} />
        );
      })}
    </Animated.View>
  );
}

// Ripple wave portal (memory / data)
function RipplePortal({ color, pulse }: { color: string; pulse: Animated.Value }) {
  const rings = [0, 1, 2, 3];
  return (
    <View style={styles.portalInner}>
      {rings.map(i => {
        const size = 40 + i * 40;
        const opacity = pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7 - i * 0.15, 0.2 - i * 0.04],
        });
        const scale = pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1 + i * 0.05],
        });
        return (
          <Animated.View key={i} style={[styles.rippleRing, {
            width: size, height: size, borderRadius: size / 2,
            borderColor: color,
            left: 90 - size / 2,
            top:  90 - size / 2,
            opacity,
            transform: [{ scale }],
          }]} />
        );
      })}
      <View style={[styles.rippleCore, { backgroundColor: color }]} />
    </View>
  );
}

// Chain link portal (chain mechanic)
function ChainPortal({ color, spin }: { color: string; spin: Animated.Value }) {
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  return (
    <View style={styles.portalInner}>
      {/* Outer chain ring */}
      <Animated.View style={[styles.chainRing, {
        borderColor: color,
        transform: [{ rotate }],
      }]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
          const rad = (ang * Math.PI) / 180;
          return (
            <View key={i} style={[styles.chainLink, {
              backgroundColor: color,
              left: 80 + 72 * Math.cos(rad) - 6,
              top:  80 + 72 * Math.sin(rad) - 6,
            }]} />
          );
        })}
      </Animated.View>
      {/* Center block */}
      <View style={[styles.chainCenter, { backgroundColor: color }]}>
        <Text style={styles.chainEmoji}>🔗</Text>
      </View>
    </View>
  );
}

// Boss fire vortex
function BossPortal({ spin }: { spin: Animated.Value }) {
  const rotate  = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateR = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  return (
    <View style={styles.portalInner}>
      <Animated.View style={[styles.bossRingOuter, { transform: [{ rotate }] }]} />
      <Animated.View style={[styles.bossRingInner, { transform: [{ rotate: rotateR }] }]} />
      {/* Fire particles */}
      {[0, 60, 120, 180, 240, 300].map((ang, i) => {
        const rad = (ang * Math.PI) / 180;
        return (
          <View key={i} style={[styles.fireDot, {
            left: 90 + 55 * Math.cos(rad) - 6,
            top:  90 + 55 * Math.sin(rad) - 6,
            opacity: 0.6 + (i % 3) * 0.13,
          }]} />
        );
      })}
      <View style={styles.bossCore}>
        <Text style={styles.bossEmoji}>🔥</Text>
      </View>
    </View>
  );
}

// Default indigo warp
function WarpPortal({ color, spin, pulse }: { color: string; spin: Animated.Value; pulse: Animated.Value }) {
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
  return (
    <View style={styles.portalInner}>
      <Animated.View style={[styles.warpGlow, {
        backgroundColor: color + '30',
        transform: [{ scale: glowScale }],
      }]} />
      <Animated.View style={[styles.warpRingOuter, { borderColor: color + '80', transform: [{ rotate }] }]}>
        <View style={[styles.warpDot, { backgroundColor: color }]} />
      </Animated.View>
      <Animated.View style={[styles.warpRingInner, {
        borderColor: color,
        transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }],
      }]} />
      <View style={[styles.warpCore, { backgroundColor: color }]}>
        <Text style={styles.warpEmoji}>⚡</Text>
      </View>
    </View>
  );
}

// Judgment scales portal
function JudgmentPortal({ color, pulse }: { color: string; pulse: Animated.Value }) {
  const tilt = pulse.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] });
  return (
    <View style={styles.portalInner}>
      <View style={[styles.judgmentPole, { backgroundColor: color }]} />
      <Animated.View style={[styles.judgmentBeam, { backgroundColor: color, transform: [{ rotate: tilt }] }]}>
        <View style={[styles.judgmentPan, { backgroundColor: color + '40', borderColor: color, left: -24 }]} />
        <View style={[styles.judgmentPan, { backgroundColor: color + '40', borderColor: color, right: -24 }]} />
      </Animated.View>
      <View style={[styles.judgmentBase, { backgroundColor: color }]} />
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function LessonTransition({
  visible,
  fromTopic,
  toTopic,
  fieldColor,
  mechanic,
  onDone,
}: LessonTransitionProps) {
  const { colors } = useTheme();
  const color     = fieldColor ?? colors.accent;
  const variant   = resolvePortalMechanic(mechanic);

  // Animation values
  const bgAlpha    = useRef(new Animated.Value(0)).current;   // overlay fade
  const portalScale = useRef(new Animated.Value(0)).current;  // portal pop
  const topicAlpha  = useRef(new Animated.Value(0)).current;  // topic label
  const topicY      = useRef(new Animated.Value(20)).current; // topic slide
  const spinAnim    = useRef(new Animated.Value(0)).current;  // spin loop
  const pulseAnim   = useRef(new Animated.Value(0)).current;  // pulse loop

  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const runTransition = useCallback(() => {
    // Start continuous loops
    spinLoop.current = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
    );
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    spinLoop.current.start();
    pulseLoop.current.start();

    Animated.sequence([
      // Phase 1: overlay fades in
      Animated.timing(bgAlpha,     { toValue: 1,  duration: T.DIM,       easing: Easing.out(Easing.ease), useNativeDriver: true }),
      // Phase 2: portal opens
      Animated.spring(portalScale, { toValue: 1,  tension: 60, friction: 8, useNativeDriver: true }),
      // Phase 3: topic name appears
      Animated.parallel([
        Animated.timing(topicAlpha, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(topicY,     { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]),
      // Phase 4: hold open
      Animated.delay(T.HOLD),
      // Phase 5: portal collapses
      Animated.parallel([
        Animated.timing(topicAlpha, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(portalScale,{ toValue: 0, duration: T.PORTAL_OUT, easing: Easing.in(Easing.back(2)), useNativeDriver: true }),
        Animated.timing(bgAlpha,    { toValue: 0, duration: T.PORTAL_OUT, useNativeDriver: true }),
      ]),
    ]).start(() => {
      spinLoop.current?.stop();
      pulseLoop.current?.stop();
      spinAnim.setValue(0);
      pulseAnim.setValue(0);
      bgAlpha.setValue(0);
      portalScale.setValue(0);
      topicAlpha.setValue(0);
      topicY.setValue(20);
      onDone();
    });
  }, [onDone]);

  useEffect(() => {
    if (visible) runTransition();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: bgAlpha }]}>

        {/* Portal */}
        <Animated.View style={[styles.portalWrap, {
          transform: [
            { scale: portalScale },
            // Slight 3D perspective tilt as it opens
            { perspective: 400 },
          ],
        }]}>
          {/* Glow halo behind portal */}
          <View style={[styles.portalHalo, { backgroundColor: color + '25' }]} />

          {/* Portal shape — variant-driven */}
          {variant === 'match3'   && <HexPortal    color={color} spin={spinAnim} />}
          {variant === 'memory'   && <RipplePortal color={color} pulse={pulseAnim} />}
          {variant === 'chain'    && <ChainPortal  color={color} spin={spinAnim} />}
          {variant === 'boss'     && <BossPortal   spin={spinAnim} />}
          {variant === 'judgment' && <JudgmentPortal color={color} pulse={pulseAnim} />}
          {variant === 'default'  && <WarpPortal   color={color} spin={spinAnim} pulse={pulseAnim} />}
        </Animated.View>

        {/* Topic label below portal */}
        <Animated.View style={[styles.topicWrap, {
          opacity: topicAlpha,
          transform: [{ translateY: topicY }],
        }]}>
          <Text style={[styles.topicLabel, { color: color + '99' }]}>UP NEXT</Text>
          <Text style={styles.topicText} numberOfLines={2}>{toTopic}</Text>
        </Animated.View>

      </Animated.View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5,5,16,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  portalHalo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  portalInner: {
    width: 180,
    height: 180,
    position: 'relative',
  },

  // Hex grid
  hexDot: {
    position: 'absolute',
    borderRadius: 4,
    width: 16,
    height: 16,
  },

  // Ripple
  rippleRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  rippleCore: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    left: 80,
    top: 80,
  },

  // Chain
  chainRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    top: 10,
    left: 10,
  },
  chainLink: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  chainCenter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 12,
    top: 66,
    left: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainEmoji: { fontSize: 24 },

  // Boss
  bossRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#FF6B00',
    top: 10,
    left: 10,
    borderStyle: 'dashed',
  },
  bossRingInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#EF4444',
    top: 40,
    left: 40,
  },
  fireDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B00',
  },
  bossCore: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FF6B00',
    top: 64,
    left: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossEmoji: { fontSize: 26 },

  // Warp
  warpGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 0,
    left: 0,
  },
  warpRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    top: 10,
    left: 10,
  },
  warpDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -5,
    left: 75,
  },
  warpRingInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    top: 40,
    left: 40,
  },
  warpCore: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    top: 66,
    left: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warpEmoji: { fontSize: 22, color: '#FFF' },

  // Judgment
  judgmentPole: {
    position: 'absolute',
    width: 4,
    height: 100,
    left: 88,
    top: 40,
    borderRadius: 2,
  },
  judgmentBeam: {
    position: 'absolute',
    width: 120,
    height: 4,
    left: 30,
    top: 60,
    borderRadius: 2,
  },
  judgmentPan: {
    position: 'absolute',
    width: 36,
    height: 20,
    borderRadius: 8,
    borderWidth: 2,
    top: 6,
  },
  judgmentBase: {
    position: 'absolute',
    width: 40,
    height: 8,
    borderRadius: 4,
    left: 70,
    bottom: 20,
  },

  // Topic label
  topicWrap: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  topicLabel: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  topicText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 28,
  },
});
