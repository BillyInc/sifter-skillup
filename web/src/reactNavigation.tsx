import { useEffect, useMemo, type ReactNode } from "react";

/** Minimal browser implementation for the small React Navigation surface used
 * by shared onboarding/auth components. The browser router remains the source
 * of navigation truth; this shim only supplies lifecycle/back-listener APIs
 * expected by screens that are shared with native. */
export function useFocusEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}

export function useNavigation() {
  return useMemo(() => ({
    addListener: () => () => undefined,
    dispatch: () => undefined,
    goBack: () => window.history.back(),
  }), []);
}

export function useRoute() {
  return useMemo(() => ({
    key: window.location.pathname,
    name: window.location.pathname,
    params: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
  }), []);
}

export function NavigationContainer({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
