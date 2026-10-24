import React, { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { PersistentLearningPlanDockPortal } from "@/components/careerIntelligence/PersistentLearningPlanDockPortal";

type DockRenderer = () => ReactNode;
type PersistentLearningPlanDockValue = {
  register: (renderer: DockRenderer, activationKey: string) => void;
  dismiss: () => void;
};

const PersistentLearningPlanDockContext = createContext<PersistentLearningPlanDockValue | null>(null);

/**
 * App-shell-owned host for the learner's floating learning-plan tray.
 * Screens can replace its current route content without tying the dock's
 * lifetime or viewport position to a particular detail page.
 */
export function PersistentLearningPlanDockProvider({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const [renderer, setRenderer] = useState<DockRenderer | null>(null);
  const [visible, setVisible] = useState(false);
  const currentKey = useRef<string | null>(null);
  const dismissedKey = useRef<string | null>(null);

  const register = useCallback((nextRenderer: DockRenderer, activationKey: string) => {
    setRenderer(() => nextRenderer);
    if (currentKey.current === activationKey) return;
    currentKey.current = activationKey;
    if (dismissedKey.current !== activationKey) {
      dismissedKey.current = null;
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    dismissedKey.current = currentKey.current;
    setVisible(false);
  }, []);

  const value = useMemo(() => ({ register, dismiss }), [register, dismiss]);
  const dock = visible && renderer ? <View pointerEvents="box-none" style={[
        styles.dockLayer,
        Platform.OS === "web" ? styles.dockLayerWeb : styles.dockLayerNative,
        { bottom: width < 768 ? 82 : 16 },
      ]}>{renderer()}</View> : null;
  return <PersistentLearningPlanDockContext.Provider value={value}>
    <PersistentLearningPlanDockPortal dock={dock}>{children}</PersistentLearningPlanDockPortal>
  </PersistentLearningPlanDockContext.Provider>;
}

export function usePersistentLearningPlanDock(): PersistentLearningPlanDockValue | null {
  return useContext(PersistentLearningPlanDockContext);
}

const styles = StyleSheet.create({
  dockLayer: { zIndex: 1000, alignItems: "flex-end", justifyContent: "flex-end" },
  dockLayerWeb: { position: "fixed" as any, right: 16 },
  dockLayerNative: { position: "absolute", right: 16 },
});
