/**
 * LevelUpLogo — the Sifter LevelUp brand mark.
 *
 * An ascension motif: three bars rising left-to-right into a peak/chevron,
 * reading simultaneously as an upward arrow and an abstract "L". Pure SVG so it
 * scales crisply at any size and stays themeable. The optional entrance
 * animation is applied to the wrapping View (opacity + rise + settle) rather
 * than to individual SVG nodes, which keeps it identical and reliable across
 * iOS, Android and web. No raster asset required.
 */
import React, { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";
import { Brand } from "../../theme";

export interface LevelUpLogoProps {
  size?: number;
  color?: string;
  /** Play a one-shot entrance (fade + rise + settle) on mount. */
  animated?: boolean;
  style?: ViewStyle;
}

// Three ascending bars + a peak chevron, drawn in a 100x100 viewBox.
const BARS = [
  { x: 8, y: 64, w: 18, h: 28, opacity: 0.55 }, // shortest, left
  { x: 33, y: 46, w: 18, h: 46, opacity: 0.78 }, // mid
  { x: 58, y: 28, w: 18, h: 64, opacity: 1 }, // tallest, right
];

export function LevelUpLogo({
  size = 96,
  color = Brand.primary,
  animated = false,
  style,
}: LevelUpLogoProps) {
  const t = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) return;
    Animated.spring(t, {
      toValue: 1,
      tension: 70,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [animated, t]);

  return (
    <Animated.View
      style={[
        {
          opacity: t,
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
            {
              scale: t.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {BARS.map((bar, i) => (
          <Rect
            key={`bar-${i}`}
            x={bar.x}
            y={bar.y}
            width={bar.w}
            height={bar.h}
            rx={5}
            fill={color}
            opacity={bar.opacity}
          />
        ))}
        {/* Peak chevron / arrowhead crowning the tallest bar */}
        <Path
          d="M55 30 L78 8 L92 22"
          stroke={color}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

export default LevelUpLogo;
