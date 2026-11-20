import React from "react";
import { cleanup, renderHook } from "@testing-library/react-native";
import { useEscapeToClose } from "./useEscapeToClose";

type Handler = (event: Record<string, unknown>) => void;

function installFakeDocument(active: { focus: jest.Mock }) {
  const handlers: Handler[] = [];
  const doc = {
    activeElement: active as unknown,
    addEventListener: jest.fn((name: string, handler: Handler) => { if (name === "keydown") handlers.push(handler); }),
    removeEventListener: jest.fn((name: string, handler: Handler) => {
      const index = handlers.indexOf(handler);
      if (name === "keydown" && index >= 0) handlers.splice(index, 1);
    }),
  };
  (globalThis as unknown as { document: unknown }).document = doc;
  const press = (key: string, extra: Record<string, unknown> = {}) => {
    const event = { key, preventDefault: jest.fn(), shiftKey: false, ...extra };
    handlers.slice().forEach((handler) => handler(event));
    return event;
  };
  return { doc, handlers, press };
}

describe("useEscapeToClose", () => {
  afterEach(() => {
    cleanup(); // unmount while the fake document still exists
    delete (globalThis as unknown as { document?: unknown }).document;
  });

  it("closes on Escape and returns focus to the opener when it closes", () => {
    const opener = { focus: jest.fn() };
    const { handlers, press } = installFakeDocument(opener);
    const onClose = jest.fn();
    const { rerender } = renderHook(({ open }: { open: boolean }) => useEscapeToClose(open, onClose), { initialProps: { open: true } });
    expect(handlers).toHaveLength(1);
    const event = press("Escape");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
    rerender({ open: false });
    expect(handlers).toHaveLength(0);
    expect(opener.focus).toHaveBeenCalledTimes(1);
  });

  it("does nothing while closed and ignores other keys", () => {
    const { handlers, press } = installFakeDocument({ focus: jest.fn() });
    const onClose = jest.fn();
    const { rerender, unmount } = renderHook(({ open }: { open: boolean }) => useEscapeToClose(open, onClose), { initialProps: { open: false } });
    expect(handlers).toHaveLength(0);
    rerender({ open: true });
    press("Enter");
    press("a");
    expect(onClose).not.toHaveBeenCalled();
    unmount();
    expect(handlers).toHaveLength(0);
  });

  it("keeps Tab inside the container, wrapping at both ends", () => {
    const first = { focus: jest.fn() };
    const last = { focus: jest.fn() };
    const { doc, press } = installFakeDocument({ focus: jest.fn() });
    const { unmount } = renderHook(() => useEscapeToClose(true, jest.fn(), () => ({ querySelectorAll: () => [first, last] })));
    doc.activeElement = last;
    const forward = press("Tab");
    expect(forward.preventDefault).toHaveBeenCalled();
    expect(first.focus).toHaveBeenCalledTimes(1);
    doc.activeElement = first;
    const backward = press("Tab", { shiftKey: true });
    expect(backward.preventDefault).toHaveBeenCalled();
    expect(last.focus).toHaveBeenCalledTimes(1);
    doc.activeElement = { focus: jest.fn() };
    const middle = press("Tab");
    expect(middle.preventDefault).not.toHaveBeenCalled();
    unmount();
  });

  it("is a no-op without a DOM (native)", () => {
    const onClose = jest.fn();
    expect(() => renderHook(() => useEscapeToClose(true, onClose))).not.toThrow();
  });
});
