import type { ReactNode } from "react";
import { Pressable } from "react-native-web";

function flattenStyle(style: any): React.CSSProperties {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>(
      (result, item) => Object.assign(result, flattenStyle(item)),
      {},
    );
  }
  return typeof style === "object" ? style : {};
}

export function GestureHandlerRootView({ children, style }: { children?: ReactNode; style?: unknown }) {
  return <div style={flattenStyle(style)}>{children}</div>;
}
// A string alias renders a raw DOM button and forwards React Native style
// arrays directly to CSSStyleDeclaration. React then fails on indexed style
// properties ("Failed to set an indexed property [0]"). Pressable is the
// React Native Web implementation and safely resolves those styles.
export const TouchableOpacity = Pressable;
export const PanGestureHandler = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const TapGestureHandler = PanGestureHandler;
export const State = { BEGAN: 1, ACTIVE: 2, END: 5, CANCELLED: 3, FAILED: 4 } as const;
