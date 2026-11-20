import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";

const mockUseAuth = jest.fn();
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => mockUseAuth() }));
jest.mock("./Toast", () => ({ showToast: jest.fn() }));

const mockGetSavedItems = jest.fn();
const mockSaveItem = jest.fn();
const mockRemoveSavedItem = jest.fn();
jest.mock("../../lib/careerData", () => ({
  careerData: {
    getSavedItems: (...a: unknown[]) => mockGetSavedItems(...a),
    saveItem: (...a: unknown[]) => mockSaveItem(...a),
    removeSavedItem: (...a: unknown[]) => mockRemoveSavedItem(...a),
  },
}));

import { showToast } from "./Toast";
import { SaveButton } from "./SaveButton";

const signedIn = { user: { id: "u1", auth_provider: "email" } };

function setup(props: Partial<React.ComponentProps<typeof SaveButton>> = {}) {
  return render(
    <ThemeProvider>
      <SaveButton entityType="programme" entityId="p-1" label="Sociology" compact {...props} />
    </ThemeProvider>,
  );
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue(signedIn);
  mockGetSavedItems.mockResolvedValue({ status: "real", data: [] });
});

describe("SaveButton quick-save", () => {
  it("is a named, pressable toggle with a 44px target", async () => {
    setup();
    const button = await screen.findByRole("button", { name: "Sociology, save" });
    expect(button.props.accessibilityState.selected).toBe(false);
    const flat = Array.isArray(button.props.style) ? Object.assign({}, ...button.props.style.flat(3).filter(Boolean)) : button.props.style;
    expect(flat.minHeight).toBeGreaterThanOrEqual(44);
    expect(flat.width).toBeGreaterThanOrEqual(44);
  });

  it("reflects an item that is already saved", async () => {
    mockGetSavedItems.mockResolvedValue({
      status: "real",
      data: [{ id: "s1", entityType: "programme", entityId: "p-1" }],
    });
    setup();
    const button = await screen.findByRole("button", { name: "Sociology, saved" });
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it("saves optimistically, then keeps the saved state once the request succeeds", async () => {
    const gate = deferred<unknown>();
    mockSaveItem.mockReturnValue(gate.promise);
    setup();
    fireEvent.press(await screen.findByRole("button", { name: "Sociology, save" }));
    // Optimistic: saved is shown before the request resolves.
    expect(screen.getByRole("button", { name: "Sociology, saved" })).toBeTruthy();
    await act(async () => { gate.resolve({ status: "real", data: { id: "s9" } }); });
    expect(screen.getByRole("button", { name: "Sociology, saved" })).toBeTruthy();
    expect(mockSaveItem).toHaveBeenCalledWith("programme", "p-1", "Sociology");
  });

  it("rolls back and shows a message when the request fails", async () => {
    mockSaveItem.mockRejectedValue(new Error("offline"));
    setup();
    fireEvent.press(await screen.findByRole("button", { name: "Sociology, save" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Sociology, save" })).toBeTruthy());
    expect(screen.getByText(/Couldn't save just now/)).toBeTruthy();
    expect(showToast).toHaveBeenCalledWith(expect.stringMatching(/Couldn't save/), "error");
  });

  it("rolls back when the service is not available yet", async () => {
    mockSaveItem.mockResolvedValue({ status: "coming_soon", data: null });
    setup();
    fireEvent.press(await screen.findByRole("button", { name: "Sociology, save" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Sociology, save" })).toBeTruthy());
    expect(screen.getByText(/comes online soon/)).toBeTruthy();
  });

  it("removes a saved item and restores it if the removal fails", async () => {
    mockGetSavedItems.mockResolvedValue({
      status: "real",
      data: [{ id: "s1", entityType: "programme", entityId: "p-1" }],
    });
    mockRemoveSavedItem.mockRejectedValue(new Error("offline"));
    setup();
    fireEvent.press(await screen.findByRole("button", { name: "Sociology, saved" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Sociology, saved" })).toBeTruthy());
    expect(mockRemoveSavedItem).toHaveBeenCalledWith("s1");
  });

  it("ignores a second press while the first request is still running", async () => {
    const gate = deferred<unknown>();
    mockSaveItem.mockReturnValue(gate.promise);
    setup();
    const button = await screen.findByRole("button", { name: "Sociology, save" });
    fireEvent.press(button);
    fireEvent.press(screen.getByRole("button", { name: "Sociology, saved" }));
    fireEvent.press(screen.getByRole("button", { name: "Sociology, saved" }));
    await act(async () => { gate.resolve({ status: "real", data: { id: "s9" } }); });
    expect(mockSaveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveSavedItem).not.toHaveBeenCalled();
  });

  it("asks guests to sign in instead of saving", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "g", auth_provider: "guest" } });
    setup();
    fireEvent.press(await screen.findByRole("button", { name: "Sociology, save" }));
    expect(mockSaveItem).not.toHaveBeenCalled();
    expect(screen.getByText(/Create an account/)).toBeTruthy();
  });
});
