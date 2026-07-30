import React, { useCallback, type ReactNode } from 'react';
import { Pressable, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Spring, useReducedMotion } from '../../theme/motion';

export interface PressLiftProps {
  onPress?: () => void;
  children: ReactNode;
  /** Scale to apply on press-in (default 0.98). */
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function PressLift({
  onPress,
  children,
  scaleTo = 0.98,
  style,
  disabled,
}: PressLiftProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (!reduced) {
      scale.value = withSpring(scaleTo, Spring.press);
    }
  }, [reduced, scaleTo]);

  const onPressOut = useCallback(() => {
    if (!reduced) {
      scale.value = withSpring(1, Spring.press);
    }
  }, [reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || !onPress}
      style={style}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

export default PressLift;
