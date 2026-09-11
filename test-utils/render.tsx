/**
 * Shared render helper for component suites.
 *
 * Every component under src/components reads colours and type scales off
 * `useTheme()`, which throws outside a ThemeProvider. Repeating that wrapper in
 * each suite is the kind of boilerplate that quietly drifts: one suite wraps,
 * the next renders bare, and the failure reads as a component bug.
 *
 * This file deliberately lives OUTSIDE `__tests__/` — jest's default testMatch
 * treats every file under `__tests__/` as a suite, and a helper with no `it()`
 * fails the run with "Your test suite must contain at least one test".
 */
import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react-native";
import { ThemeProvider } from "../src/theme";

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

/** Render a component inside the providers every screen already has in the app. */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react-native";
