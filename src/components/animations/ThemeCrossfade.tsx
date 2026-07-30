import React, { useEffect, useRef } from "react";
import { StyleSheet, View, type ColorValue } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from "react-native-reanimated";
import { useTheme } from "../../theme";
import { Timing, useReducedMotion } from "../../theme/motion";

export interface ThemeCrossfadeProps {
  children: React.ReactNode;
}

export function ThemeCrossfade({ children }: ThemeCrossfadeProps) {
  const { isDark, colors } = useTheme();
  const reduced = useReducedMotion();
  const overlayOpacity = useSharedValue(0);
  const prevBg = useRef<ColorValue>("transparent");

  useEffect(() => {
    if (reduced) {
      overlayOpacity.value = 0;
      return;
    }
    overlayOpacity.value = withSequence(
      withTiming(1, { duration: 60, easing: Timing.base.easing }),
      withTiming(0, Timing.base),
    );
    prevBg.current = colors.surface.base;
  }, [isDark, reduced, overlayOpacity, colors.surface.base]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {children}
      <Animated.View
        style={[StyleSheet.absoluteFill, overlayStyle, { backgroundColor: prevBg.current, pointerEvents: "none" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
