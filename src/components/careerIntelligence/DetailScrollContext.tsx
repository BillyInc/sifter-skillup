import React, { createContext, useContext, type MutableRefObject, type ReactNode, type RefObject } from "react";
import type { ScrollView } from "react-native";

export type DetailScrollState = {
  scrollRef: RefObject<ScrollView | null>;
  scrollOffsetRef: MutableRefObject<number>;
};

const DetailScrollContext = createContext<DetailScrollState | null>(null);

export function DetailScrollProvider({ value, children }: { value: DetailScrollState; children: React.ReactNode }) {
  return <DetailScrollContext.Provider value={value}>{children}</DetailScrollContext.Provider>;
}

export function useDetailScroll(): DetailScrollState | null {
  return useContext(DetailScrollContext);
}

export type DetailViewportOverlayState = {
  setOverlay: (renderOverlay: (() => ReactNode) | null) => void;
};

const DetailViewportOverlayContext = createContext<DetailViewportOverlayState | null>(null);

export function DetailViewportOverlayProvider({ value, children }: { value: DetailViewportOverlayState; children: ReactNode }) {
  return <DetailViewportOverlayContext.Provider value={value}>{children}</DetailViewportOverlayContext.Provider>;
}

export function useDetailViewportOverlay(): DetailViewportOverlayState | null {
  return useContext(DetailViewportOverlayContext);
}
