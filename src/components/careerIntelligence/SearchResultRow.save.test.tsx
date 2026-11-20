import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";

jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "u1", auth_provider: "email" } }) }));
jest.mock("./Toast", () => ({ showToast: jest.fn() }));
jest.mock("../../lib/careerData", () => ({
  careerData: {
    getSavedItems: jest.fn().mockResolvedValue({ status: "real", data: [] }),
    saveItem: jest.fn().mockResolvedValue({ status: "real", data: { id: "s1" } }),
    removeSavedItem: jest.fn().mockResolvedValue({ status: "real", data: null }),
  },
}));

import { SearchResultRow, SearchResultsGroup, SearchOverlay } from "./SearchComponents";
import type { SearchResult } from "@/types/career";

const row = (over: Partial<SearchResult>): SearchResult =>
  ({ id: "x", type: "programme", title: "Sociology", ...over }) as SearchResult;

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe("quick-save on search rows", () => {
  it("shows a save control for saveable types and keeps row navigation", async () => {
    const onPress = jest.fn();
    wrap(<SearchResultRow result={row({ id: "p-1" })} onPress={onPress} showSave />);
    expect(await screen.findByRole("button", { name: "Sociology, save" })).toBeTruthy();
    fireEvent.press(screen.getByText("Sociology"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("pressing save does not also open the row", async () => {
    const onPress = jest.fn();
    wrap(<SearchResultRow result={row({ id: "p-1" })} onPress={onPress} showSave />);
    fireEvent.press(await screen.findByRole("button", { name: "Sociology, save" }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("has no save control for types that cannot be saved", () => {
    for (const type of ["skill", "tool", "certification", "university", "scholarship"] as const) {
      const { unmount } = wrap(<SearchResultRow result={row({ id: type, type, title: `T-${type}` })} onPress={jest.fn()} showSave />);
      expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
      unmount();
    }
  });

  it("has no save control on locked rows or when showSave is off", () => {
    const a = wrap(<SearchResultRow result={row({ locked: true })} onPress={jest.fn()} showSave />);
    expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
    a.unmount();
    wrap(<SearchResultRow result={row({})} onPress={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
  });

  it("the global overlay offers quick-save to signed-in users only", async () => {
    const groups = [{ label: "Programmes", scope: "programmes", items: [row({ id: "p-1" })] }] as any;
    const base = {
      visible: true, onClose: jest.fn(), value: "soc", onChangeText: jest.fn(), scope: "all" as const,
      onScopeChange: jest.fn(), results: groups, onResultPress: jest.fn(),
    };
    const a = wrap(<SearchOverlay {...(base as any)} isGuest={false} />);
    expect(await screen.findByRole("button", { name: "Sociology, save" })).toBeTruthy();
    a.unmount();
    wrap(<SearchOverlay {...(base as any)} isGuest />);
    expect(screen.queryByRole("button", { name: "Sociology, save" })).toBeNull();
  });

  it("groups pass showSave through to their rows", async () => {
    wrap(<SearchResultsGroup label="Programmes" results={[row({ id: "p-1" })]} onResultPress={jest.fn()} showSave />);
    expect(await screen.findByRole("button", { name: "Sociology, save" })).toBeTruthy();
  });
});
