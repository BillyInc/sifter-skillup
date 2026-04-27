/**
 * Sifter Skill_Up — Field Artwork System
 *
 * Each field gets a distinct animated illustration.
 * No external SVG library needed — pure React Native Animated Views.
 * These are living illustrations that stay in motion.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { getFieldColor, getFieldIcon } from '../../lib/visualThemes';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function useLoop(duration: number, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, v]);
  return v;
}

function useSpin(duration = 8000, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const spin = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    spin.start();
    return () => spin.stop();
  }, [delay, duration, v]);
  return v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
}

function usePulse(min = 0.85, max = 1.1, duration = 1200, delay = 0) {
  const v = useRef(new Animated.Value(min)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: max, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: min, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, max, min, v]);
  return v;
}

function useFloat(range = 8, duration = 2000, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: -range, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: range, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, range, v]);
  return v;
}

function useTravel(fromX: number, toX: number, duration = 3000, delay = 0) {
  const v = useRef(new Animated.Value(fromX)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: toX, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(v, { toValue: fromX, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, fromX, toX, v]);
  return v;
}

// ─── CRYPTO / WEB3 ─────────────────────────────────────────────────────────────
// Blockchain nodes in a network with moving data packets.

export function CryptoArtwork({ size = 200 }: { size?: number }) {
  // Floating nodes
  const float1 = useFloat(6, 2200, 0);
  const float2 = useFloat(8, 1900, 400);
  const float3 = useFloat(5, 2500, 800);
  const float4 = useFloat(7, 2100, 200);
  const float5 = useFloat(6, 2300, 600);

  // Node pulses
  const pulse1 = usePulse(0.8, 1.3, 1400, 0);
  const pulse2 = usePulse(0.7, 1.2, 1600, 300);
  const pulse3 = usePulse(0.9, 1.4, 1200, 600);

  // Data packet traveling along edge
  const packet1 = useTravel(-80, 60, 2000, 0);
  const packet2 = useTravel(60, -60, 2500, 800);
  const packet3 = useTravel(-40, 80, 1800, 400);

  // Outer ring spin
  const ring = useSpin(12000);
  const ring2 = useSpin(8000, 2000);

  const opacity1 = useLoop(1800, 0);
  const opacity2 = useLoop(2200, 600);

  const C = '#F97316'; // orange
  const DIM = size;

  return (
    <View style={[artwork.root, { width: DIM, height: DIM }]}>

      {/* Outer spinning ring */}
      <Animated.View style={[artwork.ring, {
        width: DIM * 0.9, height: DIM * 0.9,
        borderRadius: DIM * 0.45,
        borderColor: C + '30',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        transform: [{ rotate: ring }],
        position: 'absolute',
        top: DIM * 0.05, left: DIM * 0.05,
      }]} />
      <Animated.View style={[artwork.ring, {
        width: DIM * 0.65, height: DIM * 0.65,
        borderRadius: DIM * 0.33,
        borderColor: C + '20',
        borderWidth: 1,
        transform: [{ rotate: ring2 }],
        position: 'absolute',
        top: DIM * 0.175, left: DIM * 0.175,
      }]} />

      {/* Connection lines (static, visual) */}
      <View style={[artwork.line, {
        position: 'absolute', top: DIM * 0.25, left: DIM * 0.15,
        width: DIM * 0.6, height: 1.5,
        backgroundColor: C + '40',
        transform: [{ rotate: '25deg' }],
      }]} />
      <View style={[artwork.line, {
        position: 'absolute', top: DIM * 0.55, left: DIM * 0.2,
        width: DIM * 0.5, height: 1.5,
        backgroundColor: C + '35',
        transform: [{ rotate: '-18deg' }],
      }]} />
      <View style={[artwork.line, {
        position: 'absolute', top: DIM * 0.4, left: DIM * 0.1,
        width: DIM * 0.35, height: 1.5,
        backgroundColor: C + '30',
        transform: [{ rotate: '60deg' }],
      }]} />

      {/* Floating nodes */}
      {[
        { x: 0.15, y: 0.2,  s: 20, pulse: pulse1, float: float1, delay: 0 },
        { x: 0.7,  y: 0.15, s: 16, pulse: pulse2, float: float2, delay: 300 },
        { x: 0.6,  y: 0.55, s: 22, pulse: pulse3, float: float3, delay: 600 },
        { x: 0.1,  y: 0.6,  s: 14, pulse: pulse1, float: float4, delay: 200 },
        { x: 0.4,  y: 0.78, s: 18, pulse: pulse2, float: float5, delay: 500 },
      ].map((n, i) => (
        <Animated.View key={i} style={{
          position: 'absolute',
          left: DIM * n.x - n.s / 2,
          top: DIM * n.y - n.s / 2,
          transform: [{ translateY: n.float }, { scale: n.pulse }],
        }}>
          {/* Outer glow */}
          <View style={{
            width: n.s * 2, height: n.s * 2, borderRadius: n.s,
            backgroundColor: C + '15',
            position: 'absolute',
            top: -n.s / 2, left: -n.s / 2,
          }} />
          {/* Node body */}
          <View style={{
            width: n.s, height: n.s, borderRadius: n.s / 2,
            backgroundColor: C,
            borderWidth: 2, borderColor: '#fff3',
          }}>
            {/* Bitcoin symbol */}
            {n.s >= 18 && (
              <Text style={{ color: '#fff', fontSize: n.s * 0.55, textAlign: 'center', lineHeight: n.s, fontWeight: '900' }}>₿</Text>
            )}
          </View>
        </Animated.View>
      ))}

      {/* Data packets */}
      <Animated.View style={[artwork.packet, {
        backgroundColor: '#FFF',
        top: DIM * 0.27,
        transform: [{ translateX: packet1 }],
        opacity: opacity1,
      }]} />
      <Animated.View style={[artwork.packet, {
        backgroundColor: C,
        top: DIM * 0.57,
        transform: [{ translateX: packet2 }],
        opacity: opacity2,
      }]} />
      <Animated.View style={[artwork.packet, {
        backgroundColor: C + 'CC',
        top: DIM * 0.42,
        transform: [{ translateX: packet3 }],
        opacity: opacity1,
      }]} />

      {/* Center BTC glyph */}
      <Animated.View style={{
        position: 'absolute',
        top: DIM * 0.4, left: DIM * 0.4,
        width: DIM * 0.2, height: DIM * 0.2,
        borderRadius: DIM * 0.1,
        backgroundColor: C,
        alignItems: 'center', justifyContent: 'center',
        transform: [{ scale: pulse1 }],
        shadowColor: C, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8,
      }}>
        <Text style={{ color: '#fff', fontSize: DIM * 0.1, fontWeight: '900' }}>₿</Text>
      </Animated.View>
    </View>
  );
}

// ─── QUANTITATIVE FINANCE ──────────────────────────────────────────────────────
// Animated trading chart with ascending price line

export function QuantArtwork({ size = 200 }: { size?: number }) {
  const C = '#6366F1';
  const DIM = size;

  const chartAnim = useRef(new Animated.Value(0)).current;
  const bar1      = usePulse(0.4, 1.0, 800, 0);
  const bar2      = usePulse(0.5, 0.9, 900, 200);
  const bar3      = usePulse(0.6, 1.0, 750, 400);
  const bar4      = usePulse(0.3, 0.8, 1000, 100);
  const bar5      = usePulse(0.7, 1.0, 850, 300);
  const float1    = useFloat(4, 2000, 0);
  const float2    = useFloat(5, 1800, 400);
  const spin      = useSpin(20000);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(chartAnim, { toValue: 1, duration: 3000, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(chartAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start();
  }, [chartAnim]);

  const lineWidth = chartAnim.interpolate({ inputRange: [0, 1], outputRange: [0, DIM * 0.75] });

  const bars = [
    { h: 0.3, x: 0.12, pulse: bar1 },
    { h: 0.45, x: 0.24, pulse: bar2 },
    { h: 0.35, x: 0.36, pulse: bar3 },
    { h: 0.6, x: 0.48, pulse: bar4 },
    { h: 0.5, x: 0.60, pulse: bar5 },
    { h: 0.7, x: 0.72, pulse: bar1 },
  ];

  return (
    <View style={[artwork.root, { width: DIM, height: DIM }]}>

      {/* Background grid */}
      {[0.25, 0.5, 0.75].map((y, i) => (
        <View key={i} style={{
          position: 'absolute', top: DIM * y, left: DIM * 0.08,
          width: DIM * 0.84, height: 1,
          backgroundColor: C + '20',
        }} />
      ))}

      {/* Spinning orbit */}
      <Animated.View style={{
        position: 'absolute', top: DIM * 0.05, left: DIM * 0.05,
        width: DIM * 0.9, height: DIM * 0.9,
        borderRadius: DIM * 0.45,
        borderWidth: 1,
        borderColor: C + '25',
        transform: [{ rotate: spin }],
      }}>
        <View style={{
          position: 'absolute', top: -4, left: DIM * 0.44,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: C,
        }} />
      </Animated.View>

      {/* Candlestick bars */}
      {bars.map((b, i) => (
        <Animated.View key={i} style={{
          position: 'absolute',
          bottom: DIM * 0.15,
          left: DIM * b.x,
          width: DIM * 0.09,
          height: DIM * b.h,
          borderRadius: 3,
          backgroundColor: i % 2 === 0 ? C + 'CC' : '#10B98180',
          transform: [{ scaleY: b.pulse }],
          transformOrigin: 'bottom',
        }} />
      ))}

      {/* Ascending price line */}
      <Animated.View style={{
        position: 'absolute',
        bottom: DIM * 0.35,
        left: DIM * 0.1,
        width: lineWidth,
        height: 2.5,
        backgroundColor: '#10B981',
        borderRadius: 2,
        transform: [{ rotate: '-15deg' }],
        shadowColor: '#10B981', shadowOpacity: 0.9, shadowRadius: 6,
      }} />

      {/* Price label floating */}
      <Animated.View style={{
        position: 'absolute',
        top: DIM * 0.18,
        right: DIM * 0.1,
        transform: [{ translateY: float1 }],
      }}>
        <View style={{ backgroundColor: '#10B981', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: '#fff', fontSize: DIM * 0.07, fontWeight: '900' }}>+2.81</Text>
        </View>
      </Animated.View>

      {/* Sharpe ratio chip */}
      <Animated.View style={{
        position: 'absolute',
        top: DIM * 0.35,
        left: DIM * 0.1,
        transform: [{ translateY: float2 }],
      }}>
        <View style={{ backgroundColor: C, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: '#fff', fontSize: DIM * 0.065, fontWeight: '700' }}>SR: 2.81</Text>
        </View>
      </Animated.View>

      {/* Center sigma */}
      <View style={{
        position: 'absolute',
        top: DIM * 0.38, left: DIM * 0.38,
        width: DIM * 0.24, height: DIM * 0.24,
        borderRadius: DIM * 0.12,
        backgroundColor: C,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: C, shadowOpacity: 0.7, shadowRadius: 10,
      }}>
        <Text style={{ color: '#fff', fontSize: DIM * 0.14, fontWeight: '900' }}>Σ</Text>
      </View>
    </View>
  );
}

// ─── AI / MACHINE LEARNING ─────────────────────────────────────────────────────
// Neural network with activation pulses

export function AIArtwork({ size = 200 }: { size?: number }) {
  const C = '#3B82F6';
  const DIM = size;

  const nodes = [
    [0.15, 0.2], [0.15, 0.4], [0.15, 0.6], [0.15, 0.8],
    [0.45, 0.15], [0.45, 0.35], [0.45, 0.55], [0.45, 0.75], [0.45, 0.9],
    [0.75, 0.25], [0.75, 0.5], [0.75, 0.75],
    [0.9, 0.45],
  ];

  const pulses = [
    usePulse(0.6, 1.2, 800, 0),
    usePulse(0.6, 1.2, 880, 120),
    usePulse(0.6, 1.2, 960, 240),
    usePulse(0.6, 1.2, 1040, 360),
    usePulse(0.6, 1.2, 1120, 480),
    usePulse(0.6, 1.2, 1200, 600),
    usePulse(0.6, 1.2, 1280, 720),
    usePulse(0.6, 1.2, 1360, 840),
    usePulse(0.6, 1.2, 1440, 960),
    usePulse(0.6, 1.2, 1520, 1080),
    usePulse(0.6, 1.2, 1600, 1200),
    usePulse(0.6, 1.2, 1680, 1320),
    usePulse(0.6, 1.2, 1760, 1440),
  ];
  const float = [
    useFloat(3, 2000, 0),
    useFloat(3, 2100, 150),
    useFloat(3, 2200, 300),
    useFloat(3, 2300, 450),
    useFloat(3, 2400, 600),
    useFloat(3, 2500, 750),
    useFloat(3, 2600, 900),
    useFloat(3, 2700, 1050),
    useFloat(3, 2800, 1200),
    useFloat(3, 2900, 1350),
    useFloat(3, 3000, 1500),
    useFloat(3, 3100, 1650),
    useFloat(3, 3200, 1800),
  ];
  const spinBig = useSpin(18000);

  return (
    <View style={[artwork.root, { width: DIM, height: DIM }]}>

      {/* Spinning outer ring */}
      <Animated.View style={{
        position: 'absolute', top: DIM * 0.05, left: DIM * 0.05,
        width: DIM * 0.9, height: DIM * 0.9,
        borderRadius: DIM * 0.45,
        borderWidth: 1.5,
        borderColor: C + '25',
        borderStyle: 'dashed',
        transform: [{ rotate: spinBig }],
      }} />

      {/* Connection lines between layers */}
      {nodes.slice(0, 4).map((n1, i) =>
        nodes.slice(4, 9).map((n2, j) => (
          <View key={`${i}-${j}`} style={{
            position: 'absolute',
            left: DIM * n1[0],
            top: DIM * n1[1],
            width: Math.sqrt(Math.pow(DIM * (n2[0] - n1[0]), 2) + Math.pow(DIM * (n2[1] - n1[1]), 2)),
            height: 1,
            backgroundColor: C + '18',
            transform: [{
              rotate: `${Math.atan2(n2[1] - n1[1], n2[0] - n1[0]) * (180 / Math.PI)}deg`
            }],
          }} />
        ))
      )}

      {/* Nodes */}
      {nodes.map(([x, y], i) => (
        <Animated.View key={i} style={{
          position: 'absolute',
          left: DIM * x - 8,
          top: DIM * y - 8,
          transform: [{ scale: pulses[i] }, { translateY: float[i] }],
        }}>
          <View style={{
            width: 16, height: 16, borderRadius: 8,
            backgroundColor: i >= 10 ? C : C + 'AA',
            borderWidth: 1.5, borderColor: '#fff3',
            shadowColor: C, shadowOpacity: 0.5, shadowRadius: 4,
          }} />
        </Animated.View>
      ))}

      {/* Center brain icon */}
      <View style={{
        position: 'absolute', top: DIM * 0.38, left: DIM * 0.38,
        width: DIM * 0.24, height: DIM * 0.24,
        borderRadius: DIM * 0.12,
        backgroundColor: C,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: C, shadowOpacity: 0.7, shadowRadius: 10,
      }}>
        <Text style={{ color: '#fff', fontSize: DIM * 0.12 }}>🧠</Text>
      </View>
    </View>
  );
}

// ─── SUPPLY CHAIN ──────────────────────────────────────────────────────────────
// Logistics network with moving packages

export function SupplyChainArtwork({ size = 200 }: { size?: number }) {
  const C = '#10B981';
  const DIM = size;

  const pkg1 = useTravel(-10, DIM * 0.6, 2400, 0);
  const pkg2 = useTravel(DIM * 0.6, DIM * 0.1, 2800, 600);
  const pkg3 = useTravel(-10, DIM * 0.5, 2000, 400);
  const spin   = useSpin(15000);
  const pulse1 = usePulse(0.85, 1.15, 1400, 0);
  const pulse2 = usePulse(0.80, 1.20, 1600, 300);

  const hubs = [
    { x: 0.15, y: 0.25, label: '🏭' },
    { x: 0.7,  y: 0.15, label: '✈️' },
    { x: 0.55, y: 0.6,  label: '🚢' },
    { x: 0.12, y: 0.7,  label: '🏪' },
    { x: 0.8,  y: 0.75, label: '🏬' },
  ];

  return (
    <View style={[artwork.root, { width: DIM, height: DIM }]}>

      <Animated.View style={{
        position: 'absolute', top: DIM * 0.05, left: DIM * 0.05,
        width: DIM * 0.9, height: DIM * 0.9,
        borderRadius: DIM * 0.45,
        borderWidth: 1, borderColor: C + '20',
        transform: [{ rotate: spin }],
      }} />

      {/* Routes */}
      {[
        { x1: 0.15, y1: 0.25, x2: 0.7,  y2: 0.15 },
        { x1: 0.7,  y1: 0.15, x2: 0.55, y2: 0.6 },
        { x1: 0.55, y1: 0.6,  x2: 0.12, y2: 0.7 },
        { x1: 0.12, y1: 0.7,  x2: 0.8,  y2: 0.75 },
        { x1: 0.15, y1: 0.25, x2: 0.12, y2: 0.7 },
      ].map((r, i) => {
        const len = Math.sqrt(Math.pow(DIM*(r.x2-r.x1),2) + Math.pow(DIM*(r.y2-r.y1),2));
        const angle = Math.atan2(r.y2-r.y1, r.x2-r.x1) * 180/Math.PI;
        return (
          <View key={i} style={{
            position: 'absolute', left: DIM * r.x1, top: DIM * r.y1,
            width: len, height: 1.5, backgroundColor: C + '40',
            transform: [{ rotate: `${angle}deg` }],
          }} />
        );
      })}

      {/* Hubs */}
      {hubs.map((h, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: DIM * h.x - 14, top: DIM * h.y - 14,
          transform: [{ scale: i % 2 === 0 ? pulse1 : pulse2 }],
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 14,
            backgroundColor: C, alignItems: 'center', justifyContent: 'center',
            shadowColor: C, shadowOpacity: 0.5, shadowRadius: 6,
          }}>
            <Text style={{ fontSize: 12 }}>{h.label}</Text>
          </View>
        </Animated.View>
      ))}

      {/* Moving packages */}
      <Animated.View style={[artwork.packet, {
        backgroundColor: C, width: 8, height: 8, borderRadius: 2,
        top: DIM * 0.22, transform: [{ translateX: pkg1 }],
      }]} />
      <Animated.View style={[artwork.packet, {
        backgroundColor: '#FFF', width: 6, height: 6, borderRadius: 2,
        top: DIM * 0.42, transform: [{ translateX: pkg2 }],
      }]} />
      <Animated.View style={[artwork.packet, {
        backgroundColor: C + 'CC', width: 7, height: 7, borderRadius: 2,
        top: DIM * 0.62, transform: [{ translateX: pkg3 }],
      }]} />

      {/* Center globe */}
      <View style={{
        position: 'absolute', top: DIM * 0.38, left: DIM * 0.38,
        width: DIM * 0.24, height: DIM * 0.24,
        borderRadius: DIM * 0.12,
        backgroundColor: C,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: C, shadowOpacity: 0.7, shadowRadius: 10,
      }}>
        <Text style={{ fontSize: DIM * 0.12 }}>🌐</Text>
      </View>
    </View>
  );
}

// ─── SOFTWARE ENGINEERING ──────────────────────────────────────────────────────
// Code matrix / terminal with falling symbols

export function SoftwareArtwork({ size = 200 }: { size?: number }) {
  const C = '#06B6D4';
  const DIM = size;

  const lines = ['{  }', 'fn()', '[ ]', '===', '=>', '++', '</>'];
  const falls = [
    useTravel(-20, DIM + 20, 3000, 0),
    useTravel(-20, DIM + 20, 3200, 300),
    useTravel(-20, DIM + 20, 3400, 600),
    useTravel(-20, DIM + 20, 3600, 900),
    useTravel(-20, DIM + 20, 3800, 1200),
    useTravel(-20, DIM + 20, 4000, 1500),
    useTravel(-20, DIM + 20, 4200, 1800),
  ];
  const pulse1 = usePulse(0.8, 1.2, 1200);
  const spin   = useSpin(14000);

  return (
    <View style={[artwork.root, { width: DIM, height: DIM }]}>

      <Animated.View style={{
        position: 'absolute', top: DIM * 0.05, left: DIM * 0.05,
        width: DIM * 0.9, height: DIM * 0.9,
        borderRadius: DIM * 0.45,
        borderWidth: 1, borderColor: C + '25',
        borderStyle: 'dashed',
        transform: [{ rotate: spin }],
      }} />

      {/* Falling code symbols */}
      {lines.map((sym, i) => (
        <Animated.Text key={i} style={{
          position: 'absolute',
          left: DIM * (0.1 + (i * 0.13)),
          fontSize: DIM * 0.07,
          color: C + (i % 2 === 0 ? 'CC' : '70'),
          fontWeight: '700',
          fontFamily: 'monospace',
          transform: [{ translateY: falls[i] }],
        }}>{sym}</Animated.Text>
      ))}

      {/* Center terminal */}
      <Animated.View style={{
        position: 'absolute', top: DIM * 0.33, left: DIM * 0.2,
        width: DIM * 0.6, height: DIM * 0.34,
        borderRadius: 8,
        backgroundColor: '#111111',
        borderWidth: 1.5, borderColor: C,
        padding: DIM * 0.03,
        transform: [{ scale: pulse1 }],
      }}>
        <Text style={{ color: C, fontSize: DIM * 0.055, fontFamily: 'monospace', fontWeight: '700' }}>{'> sifter init'}</Text>
        <Text style={{ color: '#10B981', fontSize: DIM * 0.05, fontFamily: 'monospace' }}>{'✓ ready'}</Text>
        <Text style={{ color: '#FFF5', fontSize: DIM * 0.045, fontFamily: 'monospace' }}>{'_▮'}</Text>
      </Animated.View>
    </View>
  );
}

// ─── GENERIC / DEFAULT ─────────────────────────────────────────────────────────
// Pulsing orbs for any field without specific artwork

export function GenericArtwork({ size = 200, color = '#6366F1', emoji = '⚡' }: {
  size?: number; color?: string; emoji?: string;
}) {
  const DIM = size;
  return (
    <View style={[artwork.root, { width: DIM, height: DIM }]}>
      <View
        style={{
          position: 'absolute',
          top: DIM * 0.08,
          left: DIM * 0.08,
          width: DIM * 0.84,
          height: DIM * 0.84,
          borderRadius: DIM * 0.28,
          backgroundColor: color + '12',
          borderWidth: 1.5,
          borderColor: color + '26',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: DIM * 0.18,
          left: DIM * 0.18,
          width: DIM * 0.64,
          height: DIM * 0.64,
          borderRadius: DIM * 0.24,
          borderWidth: 1,
          borderColor: color + '2E',
          backgroundColor: '#FFFFFFCC',
        }}
      />
      {[
        { x: 0.16, y: 0.24, s: DIM * 0.08, a: '70' },
        { x: 0.76, y: 0.24, s: DIM * 0.06, a: '55' },
        { x: 0.18, y: 0.74, s: DIM * 0.05, a: '50' },
        { x: 0.78, y: 0.7, s: DIM * 0.07, a: '66' },
      ].map((dot, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: DIM * dot.x - dot.s / 2,
            top: DIM * dot.y - dot.s / 2,
            width: dot.s,
            height: dot.s,
            borderRadius: dot.s / 2,
            backgroundColor: color + dot.a,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: DIM * 0.32,
          left: DIM * 0.32,
          width: DIM * 0.36,
          height: DIM * 0.36,
          borderRadius: DIM * 0.18,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: color,
          shadowOpacity: 0.16,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: DIM * 0.16 }}>{emoji}</Text>
      </View>
    </View>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────

export function FieldArtwork({ fieldId, size = 180 }: { fieldId: string; size?: number }) {
  return <GenericArtwork size={size} emoji={fieldEmoji(fieldId)} color={fieldColor(fieldId)} />;
}

// ─── Field colour/emoji maps ───────────────────────────────────────────────────

// Field IDs are EXACT matches from src/data/fieldDetails.ts
const COLORS: Record<string, string> = {
  'crypto':                 '#F97316',
  'quant':                  '#6366F1',
  'ai-ml':                  '#3B82F6',
  'supply-chain':           '#10B981',
  'software-engineering':   '#06B6D4',
  'data-analysis-bi':       '#F59E0B',
  'data-science':           '#A78BFA',
  'data-engineering':       '#38BDF8',
  'fintech-blockchain':     '#8B5CF6',
  'healthcare-nonclinical': '#EC4899',
  'legal-compliance':       '#F97316',
  'human-resources':        '#A78BFA',
  'real-estate':            '#84CC16',
  'renewable-energy':       '#FBBF24',
  'education-technology':   '#34D399',
  'digital-marketing':      '#EF4444',
  'sales-revenue':          '#F97316',
  'logistics-trade':        '#10B981',
  'cybersecurity':          '#EF4444',
  'cloud-devops':           '#38BDF8',
  'product-design':         '#EC4899',
  'project-management':     '#6B7280',
  'insurance-actuarial':    '#8B5CF6',
  'agriculture-tech':       '#22C55E',
  'creative-media':         '#F59E0B',
  'computational-science':  '#6366F1',
  'specialized-engineering':'#6B7280',
  'public-sector-ngo':      '#6B7280',
  'writing-content':        '#F59E0B',
};

const EMOJIS: Record<string, string> = {
  'crypto':                 '₿',
  'quant':                  '📊',
  'ai-ml':                  '🧠',
  'supply-chain':           '🌐',
  'software-engineering':   '💻',
  'data-analysis-bi':       '📈',
  'data-science':           '🔬',
  'data-engineering':       '🔩',
  'fintech-blockchain':     '🏦',
  'healthcare-nonclinical': '⚕️',
  'legal-compliance':       '⚖️',
  'human-resources':        '👥',
  'real-estate':            '🏘️',
  'renewable-energy':       '⚡',
  'education-technology':   '📚',
  'digital-marketing':      '📣',
  'sales-revenue':          '💰',
  'logistics-trade':        '🚢',
  'cybersecurity':          '🛡️',
  'cloud-devops':           '☁️',
  'product-design':         '🎨',
  'project-management':     '📋',
  'insurance-actuarial':    '📉',
  'agriculture-tech':       '🌱',
  'creative-media':         '🎬',
  'computational-science':  '🔭',
  'specialized-engineering':'⚙️',
  'public-sector-ngo':      '🏛️',
  'writing-content':        '✍️',
};

export const fieldColor = (id: string) => getFieldColor(id) || COLORS[id] || '#6366F1';
export const fieldEmoji = (id: string) => getFieldIcon(id) || EMOJIS[id] || '⚡';

// ─── Shared styles ─────────────────────────────────────────────────────────────

const artwork = StyleSheet.create({
  root:   { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  ring:   { position: 'absolute' },
  line:   {},
  packet: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
});
