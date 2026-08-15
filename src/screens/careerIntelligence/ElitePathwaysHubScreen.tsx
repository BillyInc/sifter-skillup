import React from "react";
import PathwaysHubScreen from "./PathwaysHubScreen";

/** Compatibility wrapper: elite route evidence is part of Target path. */
export function ElitePathwaysHubScreen() {
  return <PathwaysHubScreen initialSection="target" requirementFocus="elite" />;
}

export default ElitePathwaysHubScreen;
