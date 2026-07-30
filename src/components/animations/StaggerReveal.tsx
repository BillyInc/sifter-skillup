import React, { useEffect, type ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Timing, STAGGER, useReducedMotion } from '../../theme/motion';

export interface StaggerRevealProps {
  children: ReactNode;
  /** Zero-based index in the parent list. */
  index?: number;
  /** Stagger delay per item (ms). Defaults to STAGGER.list (45). */
  stagger?: number;
  /** Fade duration (ms). Defaults to Timing.base (240). */
  duration?: number;
  /** Rise distance in px (default 8). */
  rise?: number;
  style?: ViewStyle;
}

export function StaggerReveal({
  children,
  index = 0,
  stagger = STAGGER.list,
  duration,
  rise = 8,
  style,
}: StaggerRevealProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(rise);

  useEffect(() => {
    if (reduced) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const config = duration ? { duration, easing: Timing.base.easing } : Timing.base;
    opacity.value = withDelay(index * stagger, withTiming(1, config));
    translateY.value = withDelay(index * stagger, withTiming(0, config));
  }, [index, stagger, duration, rise, reduced]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

export default StaggerReveal;
