import { useEffect, useRef } from "react";

type FocusableLike = { focus?: () => void } | null;
type ContainerLike = { querySelectorAll: (selector: string) => ArrayLike<FocusableLike> } | null;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Web only. While `open`, Escape calls `onClose`, Tab stays inside the
 * container returned by `getContainer`, and focus returns to whatever opened
 * the overlay when it closes. No-op where there is no DOM (native).
 */
export function useEscapeToClose(open: boolean, onClose: () => void, getContainer?: () => ContainerLike) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const containerRef = useRef(getContainer);
  containerRef.current = getContainer;

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    const opener = document.activeElement as FocusableLike;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const container = containerRef.current?.();
      if (!container) return;
      const stops = Array.from(container.querySelectorAll(FOCUSABLE));
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement as unknown;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last?.focus?.();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first?.focus?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      if (typeof document !== "undefined") document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);
}
