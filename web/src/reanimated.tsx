import { View, Text } from "react-native";

export function useSharedValue<T>(initial: T) { return { value: initial }; }
export function useAnimatedStyle(factory: () => unknown) { return factory(); }
export function useAnimatedReaction(prepare: () => unknown, react: (value: unknown, previous: unknown) => void) { void prepare; void react; }
export function useDerivedValue<T>(factory: () => T) { return { value: factory() }; }
export function withTiming<T>(value: T) { return value; }
export function withSpring<T>(value: T) { return value; }
export function withDelay<T>(_delay: number, value: T) { return value; }
export function withSequence<T>(...values: T[]) { return values.at(-1); }
export function runOnJS<T extends (...args: any[]) => any>(fn: T) { return fn; }
export const Easing = { ease: (value: number) => value, inOut: (value: unknown) => value, out: (value: unknown) => value, linear: (value: number) => value, cubic: (value: number) => value, quad: (value: number) => value };
export const FadeIn = { duration: () => FadeIn };
export const FadeOut = { duration: () => FadeOut };
export const Layout = {};
export const createAnimatedComponent = (Component: any) => Component;
export const Animated = Object.assign(View, { View, Text, createAnimatedComponent, timing: withTiming, spring: withSpring });
export default Animated;
