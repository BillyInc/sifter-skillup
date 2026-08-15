import React from "react";
import PathwaysHubScreen from "./PathwaysHubScreen";

/** Compatibility wrapper: PhD/research data is a Target path requirement lens. */
export function PhdPathwayScreen() {
  return <PathwaysHubScreen initialSection="target" requirementFocus="research" />;
}

export default PhdPathwayScreen;
