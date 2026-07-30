import React, { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Timing, useReducedMotion } from "../../theme/motion";

export interface SkeletonCrossfadeProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Duration in ms for the crossfade (default 240). */
  duration?: number;
}

export function SkeletonCrossfade({ loading, skeleton, children, style, duration = 240 }: SkeletonCrossfadeProps) {
  const reduced = useReducedMotion();
  const contentOpacity = useSharedValue(loading ? 0 : 1);
  const skeletonOpacity = useSharedValue(loading ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      contentOpacity.value = 1;
      skeletonOpacity.value = 0;
      return;
    }
    if (loading) {
      contentOpacity.value = 0;
      skeletonOpacity.value = 1;
    } else {
      contentOpacity.value = withTiming(1, { ...Timing.base, duration });
      skeletonOpacity.value = withTiming(0, { duration: Math.min(duration, 120), easing: Timing.base.easing });
    }
  }, [loading, reduced, contentOpacity, skeletonOpacity, duration]);

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const skeletonStyle = useAnimatedStyle(() => ({ opacity: skeletonOpacity.value }));

  return (
    <View style={style}>
      <Animated.View style={contentStyle}>{children}</Animated.View>
      <Animated.View
        style={[StyleSheet.absoluteFill, skeletonStyle]}
        pointerEvents={loading ? "auto" : "none"}
      >
        {skeleton}
      </Animated.View>
    </View>
  );
}
