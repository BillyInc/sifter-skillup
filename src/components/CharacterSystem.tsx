/**
 * Sifter Skill_Up — Character System
 * SVG-composed worker character across 8 XP stages.
 * Track-specific desk tools, idle animation, The Bolt celebratory character.
 *
 * Exports:
 *   <WorkerCharacter stage={3} trackId="quant" size={160} animate />
 *   <TheBolt size={120} animate />
 *   <DeskScene stage={4} trackId="crypto" />
 */

import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Svg, {
  Circle, Rect, Ellipse, Path, G, Defs, LinearGradient, Stop,
  Text as SvgText, Line, Polygon,
} from 'react-native-svg';
import {
  AnimPreset,
  getTrackTools,
  XP_STAGES,
} from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WorkerCharacterProps {
  stage?: number;           // 1–8 (defaults to 1)
  trackId?: string;         // maps to TRACK_TOOLS
  size?: number;            // render width/height
  animate?: boolean;        // idle float animation
  mood?: 'neutral' | 'happy' | 'focused' | 'celebrating';
}

export interface TheBoltProps {
  size?: number;
  animate?: boolean;        // celebration burst
}

export interface DeskSceneProps {
  stage?: number;
  trackId?: string;
  width?: number;
  height?: number;
}

// ─── Stage appearance tokens ───────────────────────────────────────────────────
// Each stage gets a distinct visual upgrade — clothing, desk, environment

const STAGE_TOKENS = [
  // Stage 1 — Raw Recruit
  {
    outfitColor: '#94a3b8',  // grey casual tee
    pantsColor:  '#64748b',
    hairColor:   '#1e293b',
    skinColor:   '#fde68a',
    deskColor:   '#d1d5db',  // simple desk
    chairColor:  '#9ca3af',
    hasMonitor:  false,
    monitorCount: 0,
    hasPlant:    false,
    hasCoffee:   true,
    frameColor:  '#e2e8f0',
  },
  // Stage 2 — Junior Analyst
  {
    outfitColor: '#3b82f6',  // blue shirt
    pantsColor:  '#1e3a5f',
    hairColor:   '#0f172a',
    skinColor:   '#fde68a',
    deskColor:   '#cbd5e1',
    chairColor:  '#475569',
    hasMonitor:  true,
    monitorCount: 1,
    hasPlant:    false,
    hasCoffee:   true,
    frameColor:  '#dbeafe',
  },
  // Stage 3 — Associate
  {
    outfitColor: '#6366f1',  // smart casual indigo
    pantsColor:  '#312e81',
    hairColor:   '#0f172a',
    skinColor:   '#fde68a',
    deskColor:   '#b8b8d4',
    chairColor:  '#4338ca',
    hasMonitor:  true,
    monitorCount: 2,
    hasPlant:    true,
    hasCoffee:   true,
    frameColor:  '#ede9fe',
  },
  // Stage 4 — Specialist
  {
    outfitColor: '#0ea5e9',  // business shirt
    pantsColor:  '#0c4a6e',
    hairColor:   '#0f172a',
    skinColor:   '#fed7aa',
    deskColor:   '#94a3b8',
    chairColor:  '#0369a1',
    hasMonitor:  true,
    monitorCount: 2,
    hasPlant:    true,
    hasCoffee:   true,
    frameColor:  '#e0f2fe',
  },
  // Stage 5 — Senior Analyst
  {
    outfitColor: '#10b981',  // smart jacket
    pantsColor:  '#064e3b',
    hairColor:   '#0f172a',
    skinColor:   '#fed7aa',
    deskColor:   '#64748b',
    chairColor:  '#047857',
    hasMonitor:  true,
    monitorCount: 3,
    hasPlant:    true,
    hasCoffee:   true,
    frameColor:  '#d1fae5',
  },
  // Stage 6 — Lead
  {
    outfitColor: '#f59e0b',  // premium suit jacket
    pantsColor:  '#78350f',
    hairColor:   '#1e293b',
    skinColor:   '#fbbf24',
    deskColor:   '#475569',
    chairColor:  '#b45309',
    hasMonitor:  true,
    monitorCount: 3,
    hasPlant:    true,
    hasCoffee:   true,
    frameColor:  '#fef3c7',
  },
  // Stage 7 — Director
  {
    outfitColor: '#8b5cf6',  // executive suit
    pantsColor:  '#2e1065',
    hairColor:   '#1e293b',
    skinColor:   '#fbbf24',
    deskColor:   '#334155',
    chairColor:  '#6d28d9',
    hasMonitor:  true,
    monitorCount: 4,
    hasPlant:    true,
    hasCoffee:   true,
    frameColor:  '#f3e8ff',
  },
  // Stage 8 — Industry Expert
  {
    outfitColor: '#ec4899',  // signature executive look
    pantsColor:  '#500724',
    hairColor:   '#0f172a',
    skinColor:   '#fbbf24',
    deskColor:   '#1e293b',
    chairColor:  '#be185d',
    hasMonitor:  true,
    monitorCount: 4,
    hasPlant:    true,
    hasCoffee:   true,
    frameColor:  '#fce7f3',
  },
] as const;

// ─── SVG: Worker body ──────────────────────────────────────────────────────────

function WorkerSVG({
  stage,
  mood,
  size,
  trackId,
}: {
  stage: number;
  mood: WorkerCharacterProps['mood'];
  size: number;
  trackId: string;
}) {
  const tokens = STAGE_TOKENS[Math.min(stage - 1, 7)];
  const tools  = getTrackTools(trackId);
  const s      = size;

  // Mouth curve based on mood
  const mouthPath =
    mood === 'happy' || mood === 'celebrating'
      ? `M ${s * 0.42} ${s * 0.44} Q ${s * 0.5} ${s * 0.5} ${s * 0.58} ${s * 0.44}`
      : mood === 'focused'
      ? `M ${s * 0.42} ${s * 0.46} L ${s * 0.58} ${s * 0.46}`
      : `M ${s * 0.42} ${s * 0.46} Q ${s * 0.5} ${s * 0.49} ${s * 0.58} ${s * 0.46}`;

  // Eye offset for moods
  const eyeOffsetY = mood === 'happy' || mood === 'celebrating' ? -1 : 0;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tokens.frameColor} stopOpacity="0.6" />
          <Stop offset="1" stopColor={tokens.frameColor} stopOpacity="0.1" />
        </LinearGradient>
        <LinearGradient id="outfitGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tokens.outfitColor} stopOpacity="1" />
          <Stop offset="1" stopColor={tokens.outfitColor} stopOpacity="0.8" />
        </LinearGradient>
      </Defs>

      {/* Background circle */}
      <Circle cx={s * 0.5} cy={s * 0.5} r={s * 0.46} fill="url(#bgGrad)" />

      {/* Track color accent ring */}
      <Circle cx={s * 0.5} cy={s * 0.5} r={s * 0.46} fill="none"
        stroke={tools.color} strokeWidth={s * 0.018} strokeOpacity={0.4} />

      {/* Body / torso */}
      <Rect
        x={s * 0.3} y={s * 0.56}
        width={s * 0.4} height={s * 0.28}
        rx={s * 0.05}
        fill="url(#outfitGrad)"
      />

      {/* Collar */}
      <Path
        d={`M ${s * 0.42} ${s * 0.56} L ${s * 0.5} ${s * 0.62} L ${s * 0.58} ${s * 0.56}`}
        fill={tokens.frameColor}
      />

      {/* Pants */}
      <Rect
        x={s * 0.3} y={s * 0.8}
        width={s * 0.17} height={s * 0.12}
        rx={s * 0.02}
        fill={tokens.pantsColor}
      />
      <Rect
        x={s * 0.53} y={s * 0.8}
        width={s * 0.17} height={s * 0.12}
        rx={s * 0.02}
        fill={tokens.pantsColor}
      />

      {/* Arms */}
      <Ellipse
        cx={s * 0.24} cy={s * 0.66}
        rx={s * 0.06} ry={s * 0.11}
        fill={tokens.outfitColor}
      />
      <Ellipse
        cx={s * 0.76} cy={s * 0.66}
        rx={s * 0.06} ry={s * 0.11}
        fill={tokens.outfitColor}
      />

      {/* Neck */}
      <Rect
        x={s * 0.44} y={s * 0.46}
        width={s * 0.12} height={s * 0.12}
        fill={tokens.skinColor}
      />

      {/* Head */}
      <Ellipse
        cx={s * 0.5} cy={s * 0.36}
        rx={s * 0.16} ry={s * 0.18}
        fill={tokens.skinColor}
      />

      {/* Hair */}
      <Ellipse
        cx={s * 0.5} cy={s * 0.22}
        rx={s * 0.16} ry={s * 0.09}
        fill={tokens.hairColor}
      />
      <Rect
        x={s * 0.34} y={s * 0.2}
        width={s * 0.32} height={s * 0.1}
        fill={tokens.hairColor}
      />

      {/* Eyes */}
      <Circle cx={s * 0.44} cy={s * 0.35 + eyeOffsetY} r={s * 0.025} fill="#0f172a" />
      <Circle cx={s * 0.56} cy={s * 0.35 + eyeOffsetY} r={s * 0.025} fill="#0f172a" />
      {/* Eye shine */}
      <Circle cx={s * 0.445} cy={s * 0.342 + eyeOffsetY} r={s * 0.008} fill="#fff" />
      <Circle cx={s * 0.565} cy={s * 0.342 + eyeOffsetY} r={s * 0.008} fill="#fff" />

      {/* Mouth */}
      <Path d={mouthPath} stroke="#1e293b" strokeWidth={s * 0.015} fill="none"
        strokeLinecap="round" />

      {/* Stage badge (stage ≥ 3: tie or accessory) */}
      {stage >= 3 && (
        <Polygon
          points={`${s*0.5},${s*0.6} ${s*0.47},${s*0.56} ${s*0.53},${s*0.56}`}
          fill={tools.color}
          opacity={0.9}
        />
      )}

      {/* Track tool emoji label (stage ≥ 4) */}
      {stage >= 4 && (
        <SvgText
          x={s * 0.76} y={s * 0.78}
          fontSize={s * 0.11}
          textAnchor="middle"
        >
          {tools.toolEmoji}
        </SvgText>
      )}

      {/* Stage number badge */}
      <Circle cx={s * 0.82} cy={s * 0.18} r={s * 0.1} fill={tools.color} />
      <SvgText
        x={s * 0.82} y={s * 0.215}
        fontSize={s * 0.1}
        fill="#fff"
        fontWeight="bold"
        textAnchor="middle"
      >
        {stage}
      </SvgText>
    </Svg>
  );
}

// ─── Worker Character ──────────────────────────────────────────────────────────

export function WorkerCharacter({
  stage   = 1,
  trackId = 'default',
  size    = 120,
  animate = true,
  mood    = 'neutral',
}: WorkerCharacterProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, ...AnimPreset.float }),
        Animated.timing(floatAnim, { toValue:  0, ...AnimPreset.float }),
      ])
    ).start();
  }, [animate]);

  const translateY = animate ? floatAnim : new Animated.Value(0);

  return (
    <Animated.View style={{ transform: [{ translateY }] }}>
      <WorkerSVG stage={stage} mood={mood} size={size} trackId={trackId} />
    </Animated.View>
  );
}

// ─── The Bolt ─────────────────────────────────────────────────────────────────
// Celebratory lightning bolt mascot — shown on lesson complete, lab complete,
// and stage-up events.

export function TheBolt({ size = 100, animate = true }: TheBoltProps) {
  const scaleAnim  = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;

    // Burst entrance
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, ...AnimPreset.spring }),
      Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      // Idle wobble
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1,  duration: 1200, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: -1, duration: 1200, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0,  duration: 600,  useNativeDriver: true }),
        ])
      ).start();
    });
  }, [animate]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-8deg', '8deg'],
  });

  const s = size;

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }, { rotate }],
        },
        animate && {
          shadowColor: '#f59e0b',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowAnim as any,
          shadowRadius: 20,
        },
      ]}
    >
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="boltGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fde68a" />
            <Stop offset="1" stopColor="#f59e0b" />
          </LinearGradient>
          <LinearGradient id="boltGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#fbbf24" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#f59e0b" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Glow circle */}
        <Circle cx="50" cy="50" r="46" fill="url(#boltGlow)" />

        {/* Bold lightning bolt */}
        <Path
          d="M 58 8 L 28 52 L 46 52 L 36 92 L 72 42 L 54 42 Z"
          fill="url(#boltGrad)"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Shine highlight */}
        <Path
          d="M 55 12 L 38 48 L 50 46"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />

        {/* Eyes on the bolt */}
        <Circle cx="46" cy="38" r="3.5" fill="#1e293b" />
        <Circle cx="56" cy="38" r="3.5" fill="#1e293b" />
        <Circle cx="47.2" cy="36.8" r="1.2" fill="#fff" />
        <Circle cx="57.2" cy="36.8" r="1.2" fill="#fff" />

        {/* Smile */}
        <Path
          d="M 43 43 Q 51 49 59 43"
          stroke="#1e293b" strokeWidth="2" fill="none"
          strokeLinecap="round"
        />

        {/* Sparkle stars */}
        <SvgText x="12" y="22" fontSize="11">✨</SvgText>
        <SvgText x="74" y="30" fontSize="9">⭐</SvgText>
        <SvgText x="8" y="68" fontSize="8">✦</SvgText>
      </Svg>
    </Animated.View>
  );
}

// ─── Desk Scene ───────────────────────────────────────────────────────────────
// Full desk + worker composite — used on ProfileScreen and HomeScreen.

export function DeskScene({
  stage   = 1,
  trackId = 'default',
  width   = 320,
  height  = 180,
}: DeskSceneProps) {
  const tokens = STAGE_TOKENS[Math.min(stage - 1, 7)];
  const tools  = getTrackTools(trackId);
  const w = width;
  const h = height;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <LinearGradient id="roomGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0f172a" />
          <Stop offset="1" stopColor="#1e293b" />
        </LinearGradient>
        <LinearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tokens.deskColor} />
          <Stop offset="1" stopColor={tokens.deskColor} stopOpacity="0.7" />
        </LinearGradient>
      </Defs>

      {/* Room background */}
      <Rect x="0" y="0" width={w} height={h} fill="url(#roomGrad)" rx="12" />

      {/* Floor line */}
      <Line x1="0" y1={h * 0.72} x2={w} y2={h * 0.72}
        stroke={tokens.deskColor} strokeWidth="1" strokeOpacity="0.3" />

      {/* Desk surface */}
      <Rect x={w * 0.08} y={h * 0.6}
        width={w * 0.84} height={h * 0.12}
        fill="url(#deskGrad)" rx="4" />

      {/* Monitors */}
      {tokens.monitorCount >= 1 && (
        <G>
          {/* Monitor stand */}
          <Rect x={w * 0.38} y={h * 0.42} width={w * 0.03} height={h * 0.18}
            fill={tokens.deskColor} />
          {/* Monitor screen */}
          <Rect x={w * 0.24} y={h * 0.18} width={w * 0.26} height={h * 0.25}
            fill="#0ea5e9" rx="4" opacity="0.9" />
          {/* Screen content lines */}
          <Rect x={w * 0.26} y={h * 0.22} width={w * 0.14} height={h * 0.02}
            fill="#fff" opacity="0.6" rx="1" />
          <Rect x={w * 0.26} y={h * 0.26} width={w * 0.1} height={h * 0.015}
            fill="#fff" opacity="0.4" rx="1" />
          <Rect x={w * 0.26} y={h * 0.3} width={w * 0.18} height={h * 0.015}
            fill={tools.color} opacity="0.7" rx="1" />
          <SvgText x={w * 0.28} y={h * 0.39} fontSize="8" fill="#94a3b8">
            {tools.screenLabel.slice(0, 16)}
          </SvgText>
        </G>
      )}

      {tokens.monitorCount >= 2 && (
        <G>
          {/* Second monitor stand */}
          <Rect x={w * 0.61} y={h * 0.42} width={w * 0.03} height={h * 0.18}
            fill={tokens.deskColor} />
          {/* Second monitor */}
          <Rect x={w * 0.5} y={h * 0.18} width={w * 0.26} height={h * 0.25}
            fill="#1e293b" rx="4" opacity="0.95"
            stroke={tools.color} strokeWidth="1.5" strokeOpacity="0.5" />
          {/* Chart on second monitor */}
          <Rect x={w * 0.52} y={h * 0.36} width={w * 0.02} height={h * 0.04}
            fill={tools.color} opacity="0.8" />
          <Rect x={w * 0.55} y={h * 0.32} width={w * 0.02} height={h * 0.08}
            fill={tools.color} opacity="0.9" />
          <Rect x={w * 0.58} y={h * 0.28} width={w * 0.02} height={h * 0.12}
            fill={tools.color} />
          <Rect x={w * 0.61} y={h * 0.31} width={w * 0.02} height={h * 0.09}
            fill={tools.color} opacity="0.8" />
          <Rect x={w * 0.64} y={h * 0.26} width={w * 0.02} height={h * 0.14}
            fill={tools.color} />
          <Rect x={w * 0.67} y={h * 0.3} width={w * 0.02} height={h * 0.1}
            fill={tools.color} opacity="0.7" />
          <Rect x={w * 0.7} y={h * 0.22} width={w * 0.02} height={h * 0.18}
            fill={tools.color} opacity="0.95" />
        </G>
      )}

      {/* Coffee cup */}
      {tokens.hasCoffee && (
        <G>
          <Rect x={w * 0.82} y={h * 0.54} width={w * 0.05} height={h * 0.065}
            fill="#fff" rx="2" opacity="0.9" />
          <SvgText x={w * 0.84} y={h * 0.52} fontSize="10">☕</SvgText>
        </G>
      )}

      {/* Plant (stage ≥ 3) */}
      {tokens.hasPlant && (
        <SvgText x={w * 0.06} y={h * 0.6} fontSize="22">🌿</SvgText>
      )}

      {/* Track tool emoji */}
      <SvgText x={w * 0.88} y={h * 0.66} fontSize="18">{tools.toolEmoji}</SvgText>

      {/* Stage name label */}
      <Rect x={w * 0.3} y={h * 0.78} width={w * 0.4} height={h * 0.14}
        fill={tools.color} rx="6" opacity="0.15" />
      <SvgText x={w * 0.5} y={h * 0.875} fontSize="11" fill={tools.color}
        textAnchor="middle" fontWeight="bold" opacity="0.9">
        {XP_STAGES[Math.min(stage - 1, 7)].name.toUpperCase()}
      </SvgText>
    </Svg>
  );
}
