import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Mount at document.body so scrolling or transformed route shells cannot move the dock. */
export function PersistentLearningPlanDockPortal({ children, dock }: { children: ReactNode; dock: ReactNode }) {
  const dockPortal = typeof document !== "undefined" && document.body && dock
    ? createPortal(
      <div
        data-testid="persistent-learning-plan-dock-viewport-anchor"
        style={{
          position: "fixed",
          insetInlineEnd: 16,
          bottom: 16,
          zIndex: 10000,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          width: "max-content",
          maxWidth: "calc(100vw - 32px)",
          pointerEvents: "none",
        }}
      >
        <div style={{ maxWidth: "100%", pointerEvents: "auto" }}>{dock}</div>
      </div>,
      document.body,
    )
    : dock;
  return <>{children}{dockPortal}</>;
}
