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
function announceForAccessibility(message: string) {
  if (typeof document === "undefined") return;
  let region = document.getElementById("sifter-accessibility-announcements");
  if (!region) {
    region = document.createElement("div");
    region.id = "sifter-accessibility-announcements";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    Object.assign(region.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(region);
  }
  region.textContent = "";
  requestAnimationFrame(() => { if (region) region.textContent = message; });
}

export const AccessibilityInfo = {
  isReduceMotionEnabled: async () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  addEventListener: () => ({ remove() {} }),
  announceForAccessibility,
};
export default Web;
