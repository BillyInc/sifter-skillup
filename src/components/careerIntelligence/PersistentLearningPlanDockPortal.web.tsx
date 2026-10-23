import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Mount at document.body so scrolling or transformed route shells cannot move the dock. */
export function PersistentLearningPlanDockPortal({ children, dock }: { children: ReactNode; dock: ReactNode }) {
  const dockPortal = typeof document !== "undefined" && document.body && dock
    ? createPortal(dock, document.body)
    : dock;
  return <>{children}{dockPortal}</>;
}
