import React from "react";
import PathwaysHubScreen from "./PathwaysHubScreen";

/** Compatibility wrapper: credentials and chartership are Target path requirements. */
export function CharteredCredentialsScreen() {
  return <PathwaysHubScreen initialSection="target" requirementFocus="credentials" />;
}

export default CharteredCredentialsScreen;
