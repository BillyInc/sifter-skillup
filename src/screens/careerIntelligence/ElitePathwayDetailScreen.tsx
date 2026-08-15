import React from "react";
import PathwaysHubScreen from "./PathwaysHubScreen";

export interface ElitePathwayDetailScreenProps {
  pathwayId: string;
}

/** Compatibility wrapper: a selected elite route still renders inside Target path. */
export function ElitePathwayDetailScreen({ pathwayId }: ElitePathwayDetailScreenProps) {
  return <PathwaysHubScreen initialSection="target" requirementFocus="elite" pathwayId={pathwayId} />;
}

export default ElitePathwayDetailScreen;
