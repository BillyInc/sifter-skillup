import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import { readBrowseState, writeBrowseState } from "@/lib/browseSessionState";

const RESTORE_WINDOW_MS = 4000;

/**
 * Remembers a ScrollView's vertical offset under `key` and restores it once
 * the content is tall enough to reach it (results arrive asynchronously, so
 * scrolling at mount would clamp to the top). Spread the returned props onto
 * the ScrollView.
 */
export function useBrowseScroll(key: string) {
  const ref = useRef<ScrollView>(null);
  const initialised = useRef(false);
  const pending = useRef<number | null>(null);
  const deadline = useRef(0);
  const viewportHeight = useRef(0);

  if (!initialised.current) {
    initialised.current = true;
    const saved = readBrowseState(key);
    if (saved && saved.scrollY > 0) {
      pending.current = saved.scrollY;
      deadline.current = Date.now() + RESTORE_WINDOW_MS;
    }
  }

  const latestY = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (latestY.current === null) return;
    // While a restore is pending the offset is not the student's own yet.
    if (pending.current !== null && Date.now() < deadline.current) return;
    writeBrowseState(key, { scrollY: latestY.current });
    latestY.current = null;
  }, [key]);

  // Debounced, with a trailing write so the final resting offset is kept, and
  // a flush when the screen unmounts (the student opened a result).
  const record = useCallback((y: number) => {
    if (pending.current !== null && Date.now() < deadline.current) return;
    pending.current = null;
    latestY.current = y;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 120);
  }, [flush]);

  useEffect(() => flush, [flush]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    record(event.nativeEvent.contentOffset.y);
  }, [record]);

  // On web the page (window) often scrolls instead of the ScrollView, e.g.
  // inside the web shell, so follow the window too.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return undefined;
    const startPath = window.location.pathname;
    // Opening a result resets the window scroll while this screen is still
    // mounted; that reset is not the student's position, so ignore it.
    const onWindowScroll = () => {
      if (window.location.pathname === startPath) record(window.scrollY);
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, [record]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    viewportHeight.current = event.nativeEvent.layout.height;
  }, []);

  const tryRestore = useCallback((contentHeight?: number) => {
    const target = pending.current;
    if (target === null) return;
    if (Date.now() > deadline.current) {
      pending.current = null;
      return;
    }
    const web = Platform.OS === "web" && typeof document !== "undefined";
    // When the window is the scroller (web shell) the ScrollView is as tall as
    // its content, so only the page height says whether the offset is reachable.
    const pageScrolls = web && document.documentElement.scrollHeight > window.innerHeight + 1;
    const viewReachable = !pageScrolls && contentHeight !== undefined && contentHeight >= target + viewportHeight.current;
    const pageReachable = pageScrolls && document.documentElement.scrollHeight >= target + window.innerHeight;
    if (!viewReachable && !pageReachable) return;
    pending.current = null;
    const go = () => {
      ref.current?.scrollTo({ y: target, animated: false });
      if (pageReachable) window.scrollTo(0, target);
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(go);
    else go();
  }, []);

  const onContentSizeChange = useCallback((_width: number, height: number) => tryRestore(height), [tryRestore]);

  // The web page can grow without the ScrollView reporting it (the window is
  // the scroller), so also poll briefly until the saved offset is reachable.
  useEffect(() => {
    if (Platform.OS !== "web" || pending.current === null) return undefined;
    const id = setInterval(() => {
      tryRestore();
      if (pending.current === null) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
  }, [tryRestore]);

  return { ref, onScroll, onLayout, onContentSizeChange, scrollEventThrottle: 100 } as const;
}
