import React from "react";
import PathwaysHubScreen from "./PathwaysHubScreen";

/** Compatibility wrapper: qualification data belongs to Target path requirements. */
export function QualificationUpgradesScreen() {
  return <PathwaysHubScreen initialSection="target" requirementFocus="qualification" />;
}

export default QualificationUpgradesScreen;
