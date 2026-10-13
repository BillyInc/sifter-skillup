import React from "react";
import { Image, type ImageStyle } from "react-native";

export type LevelUpLogoVariant = "light" | "dark";

interface LevelUpWebWordmarkProps {
  variant: LevelUpLogoVariant;
  width: number;
  height: number;
  compact?: boolean;
  style?: ImageStyle;
}

/** Supplied full lockup for web surfaces; artwork is not recoloured. */
export function LevelUpWebWordmark({ variant, width, height, compact = false, style }: LevelUpWebWordmarkProps) {
  return (
    <Image
      source={{ uri: `/brand/levelup-${compact ? "icon" : "lockup"}-${variant}.png` }}
      accessibilityLabel={compact ? "LevelUp icon" : "LevelUp"}
      accessible
      resizeMode="contain"
      style={[{ width, height, flexShrink: 0 }, style]}
    />
  );
}
