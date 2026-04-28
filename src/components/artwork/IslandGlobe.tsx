import React from 'react';
import { Platform } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Ellipse,
  Path,
  G,
  Rect,
  Text,
  ClipPath,
} from 'react-native-svg';

export interface IslandPin {
  x: number;
  y: number;
  color: string;
  name: string;
  done: number;
  total: number;
}

export interface IslandGlobeProps {
  pins: IslandPin[];
  width?: number | string;
  height?: number | string;
  activePin?: number | null;
  onPinPress?: (index: number) => void;
}

export const DEFAULT_ISLAND_PINS: IslandPin[] = [
  { x: 138, y: 193, color: '#F7931A', name: 'Bitcoin Bay', done: 15, total: 15 },
  { x: 215, y: 148, color: '#627EEA', name: 'Eth Essentials', done: 12, total: 15 },
  { x: 258, y: 188, color: '#EF4444', name: 'Wallet & Sec', done: 8, total: 15 },
  { x: 232, y: 225, color: '#10B981', name: 'DeFi Universe', done: 5, total: 20 },
  { x: 270, y: 165, color: '#9945FF', name: 'Solana', done: 0, total: 15 },
  { x: 148, y: 218, color: '#B6509E', name: 'Aave Archipelago', done: 8, total: 15 },
  { x: 248, y: 200, color: '#F59E0B', name: 'Starknet World', done: 2, total: 20 },
];

const LATITUDES = [-60, -30, 0, 30, 60];
const LONGITUDES = [0, 60, 120];
const CONTINENTS = [
  { d: 'M92 90 L140 72 L165 82 L172 102 L168 130 L156 160 L148 188 L138 212 L124 230 L110 240 L96 230 L82 208 L78 180 L80 150 L86 120 L88 102Z', fill: '#4d8c52', opacity: 0.9 },
  { d: 'M160 54 L188 46 L200 58 L192 78 L172 84 L160 72Z', fill: '#56985c', opacity: 0.88 },
  { d: 'M128 260 L158 248 L174 260 L178 284 L175 314 L162 338 L144 350 L128 344 L116 320 L114 294 L120 272Z', fill: '#58a05e', opacity: 0.9 },
  { d: 'M200 78 L222 72 L242 82 L250 98 L244 114 L226 124 L208 130 L198 120 L196 104Z', fill: '#4d8c52', opacity: 0.89 },
  { d: 'M222 58 L238 52 L248 64 L240 82 L226 86 L218 74Z', fill: '#56985c', opacity: 0.88 },
  { d: 'M204 132 L244 122 L262 134 L268 160 L264 190 L256 220 L244 250 L228 274 L212 282 L198 276 L188 258 L184 230 L184 200 L190 170 L196 150Z', fill: '#58a05e', opacity: 0.92 },
  { d: 'M256 72 L312 62 L362 68 L382 88 L378 116 L358 138 L328 152 L296 158 L266 152 L248 140 L246 120 L252 96Z', fill: '#4d8c52', opacity: 0.9 },
  { d: 'M290 152 L312 150 L322 167 L316 194 L304 208 L288 202 L282 184 L282 164Z', fill: '#56985c', opacity: 0.86 },
  { d: 'M320 270 L356 258 L378 272 L380 296 L370 316 L346 324 L318 318 L306 300 L310 280Z', fill: '#58a05e', opacity: 0.88 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function IslandGlobe({
  pins,
  width = 360,
  height = 400,
  activePin = null,
  onPinPress,
}: IslandGlobeProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 420 420"
      preserveAspectRatio="xMidYMid meet"
      style={Platform.OS === 'web' ? { display: 'block' } : undefined}
    >
      <Defs>
        <RadialGradient id="oceanGrad" cx="38%" cy="35%" r="70%">
          <Stop offset="0%" stopColor="#5ab4f0" />
          <Stop offset="50%" stopColor="#1a6ab8" />
          <Stop offset="100%" stopColor="#0b3260" />
        </RadialGradient>

        <RadialGradient id="shineGrad" cx="33%" cy="28%" r="45%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.17)" />
          <Stop offset="100%" stopColor="transparent" />
        </RadialGradient>

        <ClipPath id="globeClip">
          <Circle cx={210} cy={210} r={190} />
        </ClipPath>

        <LinearGradient id="calloutBarBg" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#e5e7eb" />
          <Stop offset="100%" stopColor="#d1d5db" />
        </LinearGradient>
      </Defs>

      <Circle
        cx={210}
        cy={210}
        r={197}
        fill="none"
        stroke="rgba(100,196,255,0.14)"
        strokeWidth={8}
      />
      <Circle
        cx={210}
        cy={210}
        r={193}
        fill="none"
        stroke="rgba(100,196,255,0.28)"
        strokeWidth={1.5}
      />

      <Circle cx={210} cy={210} r={190} fill="url(#oceanGrad)" />

      <G clipPath="url(#globeClip)">
        {LATITUDES.map((lat) => {
          const y = 210 + (lat / 90) * 190;
          const hw = Math.sqrt(Math.max(0, 190 * 190 - (y - 210) * (y - 210)));
          return (
            <Ellipse
              key={`lat-${lat}`}
              cx={210}
              cy={y}
              rx={hw}
              ry={hw * 0.13}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={0.7}
            />
          );
        })}

        {LONGITUDES.map((lon) => (
          <Ellipse
            key={`lon-${lon}`}
            cx={210}
            cy={210}
            rx={190 * Math.abs(Math.sin((lon * Math.PI) / 180)) + 2}
            ry={190}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.7}
          />
        ))}

        {CONTINENTS.map((continent) => (
          <Path
            key={continent.d}
            d={continent.d}
            fill={continent.fill}
            opacity={continent.opacity}
          />
        ))}

        <Circle cx={210} cy={210} r={190} fill="url(#shineGrad)" />
      </G>

      {pins.map((pin, i) => {
        const isActive = activePin === i;
        const isLocked = pin.done <= 0;
        const resolvedColor = isLocked ? '#94a3b8' : pin.color;
        const calloutWidth = 118;
        const calloutHeight = 44;
        const pinPressProps: any = onPinPress
          ? (Platform.OS === 'web'
              ? {
                  onClick: () => onPinPress(i),
                  style: { cursor: 'pointer' },
                }
              : {
                  onPress: () => onPinPress(i),
                })
          : undefined;
        const showRight = pin.x < 230;
        const calloutX = clamp(
          showRight ? pin.x + 14 : pin.x - calloutWidth - 14,
          8,
          420 - calloutWidth - 8
        );
        const calloutY = clamp(pin.y - calloutHeight / 2, 8, 420 - calloutHeight - 8);
        const progress = pin.total > 0 ? pin.done / pin.total : 0;
        const progressWidth = clamp(progress, 0, 1) * 86;

        return (
          <G key={`${pin.name}-${i}`}>
            <G {...pinPressProps}>
              <Circle cx={pin.x} cy={pin.y} r={13} fill={resolvedColor} opacity={isLocked ? 0.12 : 0.18} />
              <Circle cx={pin.x} cy={pin.y} r={6} fill={resolvedColor} stroke="white" strokeWidth={1.8} opacity={isLocked ? 0.72 : 1} />
              {isLocked ? (
                <Rect x={pin.x + 4} y={pin.y - 12} width={11} height={10} rx={3} fill="rgba(15,23,42,0.86)" />
              ) : null}
            </G>

            {isActive ? (
              <G>
                <Rect
                  x={calloutX}
                  y={calloutY}
                  width={calloutWidth}
                  height={calloutHeight}
                  rx={8}
                  fill="rgba(255,255,255,0.97)"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={1}
                />
                <Text
                  x={calloutX + 10}
                  y={calloutY + 13}
                  fontSize={10}
                  fontWeight="800"
                  fill="#111"
                >
                  {pin.name}
                </Text>
                <Rect
                  x={calloutX + 10}
                  y={calloutY + 20}
                  width={86}
                  height={4}
                  rx={2}
                  fill="url(#calloutBarBg)"
                />
                <Rect
                  x={calloutX + 10}
                  y={calloutY + 20}
                  width={progressWidth}
                  height={4}
                  rx={2}
                  fill={resolvedColor}
                />
                <Text
                  x={calloutX + 10}
                  y={calloutY + 35}
                  fontSize={9}
                  fill="#6b7280"
                >
                  {`${pin.done}/${pin.total} levels`}
                </Text>
              </G>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}
