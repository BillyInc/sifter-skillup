export * from "react-native-web";
import * as Web from "react-native-web";

function withoutNativeDriver<T extends Record<string, unknown>>(config: T): Omit<T, "useNativeDriver"> {
  const { useNativeDriver: _useNativeDriver, ...browserConfig } = config;
  return browserConfig;
}

// React Native animation configs are shared with mobile and commonly request
// the native driver. React Native Web has no native animation module, so strip
// that mobile-only option at the web boundary rather than warning on every
// screen or pretending the native driver is available.
export const Animated = {
  ...Web.Animated,
  timing: (value: unknown, config: Record<string, unknown>) =>
    Web.Animated.timing(value as never, withoutNativeDriver(config) as never),
  spring: (value: unknown, config: Record<string, unknown>) =>
    Web.Animated.spring(value as never, withoutNativeDriver(config) as never),
  decay: (value: unknown, config: Record<string, unknown>) =>
    Web.Animated.decay(value as never, withoutNativeDriver(config) as never),
  event: (mapping: unknown, config?: Record<string, unknown>) =>
    Web.Animated.event(mapping as never, config ? withoutNativeDriver(config) as never : undefined),
};

export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => ({}),
};
export const NativeModules: Record<string, unknown> = {};
export const Platform = Web.Platform;
export const AccessibilityInfo = { isReduceMotionEnabled: async () => false, addEventListener: () => ({ remove() {} }) };
export default Web;
