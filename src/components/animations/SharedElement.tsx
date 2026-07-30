import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from "react-native-reanimated";
import { Spring, Timing, useReducedMotion } from "../../theme/motion";

interface ElementLayout {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
}

interface SharedElementContextValue {
  register: (id: string, layout: ElementLayout) => void;
  unregister: (id: string) => void;
  getLayout: (id: string) => ElementLayout | undefined;
  sourceId: string | null;
  startTransition: (id: string) => void;
}

const SharedElementCtx = createContext<SharedElementContextValue>({
  register: () => {},
  unregister: () => {},
  getLayout: () => undefined,
  sourceId: null,
  startTransition: () => {},
});

export function SharedElementProvider({ children }: { children: React.ReactNode }) {
  const layouts = useRef<Map<string, ElementLayout>>(new Map());
  const [sourceId, setSourceId] = useState<string | null>(null);

  const register = useCallback((id: string, layout: ElementLayout) => {
    layouts.current.set(id, layout);
  }, []);

  const unregister = useCallback((id: string) => {
    layouts.current.delete(id);
  }, []);

  const getLayout = useCallback((id: string) => {
    return layouts.current.get(id);
  }, []);

  const startTransition = useCallback((id: string) => {
    setSourceId(id);
  }, []);

  const value = useMemo(
    () => ({ register, unregister, getLayout, sourceId, startTransition }),
    [register, unregister, getLayout, sourceId, startTransition],
  );

  return (
    <SharedElementCtx.Provider value={value}>
      {children}
      <TransitionOverlay sourceId={sourceId} onFinish={() => setSourceId(null)} />
    </SharedElementCtx.Provider>
  );
}

export function useSharedElementRegistry() {
  return useContext(SharedElementCtx);
}

export interface SharedElementProps {
  id: string;
  children: React.ReactNode;
  style?: any;
}

export function SharedElement({ id, children, style }: SharedElementProps) {
  const { register, unregister } = useSharedElementRegistry();
  const ref = useRef<View>(null);

  const handleLayout = useCallback(() => {
    ref.current?.measureInWindow((pageX: number, pageY: number, width: number, height: number) => {
      register(id, { pageX, pageY, width, height });
    });
  }, [id, register]);

  React.useEffect(() => {
    return () => unregister(id);
  }, [id, unregister]);

  return (
    <View ref={ref} onLayout={handleLayout} style={style}>
      {children}
    </View>
  );
}

function TransitionOverlay({
  sourceId,
  onFinish,
}: {
  sourceId: string | null;
  onFinish: () => void;
}) {
  const { getLayout } = useSharedElementRegistry();
  const reduced = useReducedMotion();
  const source = sourceId ? getLayout(sourceId) : null;
  const [ready, setReady] = useState(false);

  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (!sourceId || !source || reduced) {
      onFinish();
      return;
    }
    setReady(true);
    opacity.value = withTiming(0, Timing.base, () => {
      runOnJS(onFinish)();
    });
  }, [sourceId, source, reduced]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!sourceId || !source) return null;
  if (reduced) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        overlayStyle,
        {
          zIndex: 999,
          pointerEvents: "none",
          backgroundColor: "#EEEEFB",
          transform: [
            { translateX: source.pageX },
            { translateY: source.pageY },
          ],
          width: source.width,
          height: source.height,
          borderRadius: 9,
        },
      ]}
    />
  );
}
