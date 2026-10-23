import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

/** Native fallback anchors the dock to the app shell, outside its scroll view. */
export function PersistentLearningPlanDockPortal({ children, dock }: { children: ReactNode; dock: ReactNode }) {
  return <View style={styles.root}>{children}{dock}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1, position: "relative" } });
