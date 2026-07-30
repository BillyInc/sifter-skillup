import React from "react";
import { View, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Spacing, Radius } from "@/theme";
import {
  getClusterColor,
  getClusterIcon,
  DEFAULT_COLOR,
  DEFAULT_ICON,
  type FeatherIconName,
} from "@/data/clusterMaps";
import { getDomainIcon, getDomainCluster } from "@/data/domainIcons";

export interface DomainIconProps {
  domainId?: string;
  cluster?: string;
  size?: number;
  color?: string;
  rounded?: boolean;
  style?: ViewStyle;
}

export function DomainIcon({
  domainId,
  cluster,
  size = 16,
  color,
  rounded = false,
  style,
}: DomainIconProps) {
  const resolvedCluster = cluster ?? (domainId ? getDomainCluster(domainId) : undefined);
  const iconName: FeatherIconName = domainId
    ? getDomainIcon(domainId)
    : resolvedCluster
      ? getClusterIcon(resolvedCluster)
      : DEFAULT_ICON;
  const iconColor = color ?? (resolvedCluster ? getClusterColor(resolvedCluster) : DEFAULT_COLOR);

  if (rounded) {
    return (
      <View
        style={[
          {
            width: size * 2.2,
            height: size * 2.2,
            borderRadius: Radius.md,
            backgroundColor: iconColor + "15",
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Feather name={iconName} size={size} color={iconColor} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Feather name={iconName} size={size} color={iconColor} />
    </View>
  );
}
