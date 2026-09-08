import { View } from "react-native";
import type { ReactNode } from "react";

export function SafeAreaProvider({ children }: { children?: ReactNode }) { return <>{children}</>; }
export function SafeAreaView({ children, style, ...props }: { children?: ReactNode; style?: unknown; [key: string]: unknown }) { return <View {...props} style={style}>{children}</View>; }
export function useSafeAreaInsets() { return { top: 0, right: 0, bottom: 0, left: 0 }; }
export function useSafeAreaFrame() { return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }; }

