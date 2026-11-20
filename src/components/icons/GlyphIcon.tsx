/**
 * GlyphIcon: renders the Feather icon for a legacy emoji / text-code glyph.
 *
 * Several screens carry their icon as a data string (an emoji such as "👥" or
 * a text code such as "USER"). Emoji render differently on every platform and
 * clash with the Feather icons used on the student side, so they are mapped to
 * Feather here. A glyph with no mapping still renders, as text, so nothing
 * disappears; add it to GLYPH_TO_FEATHER to give it an icon.
 */
import React from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

export type FeatherName = keyof typeof Feather.glyphMap;

export const GLYPH_TO_FEATHER: Record<string, FeatherName> = {
  "📊": "bar-chart-2",
  "🔎": "search",
  "◎": "target",
  "◉": "target",
  "🎯": "target",
  "🔗": "link",
  "✅": "check-circle",
  "USER": "user",
  "👥": "users",
  "🧭": "compass",
  "🧩": "grid",
  "✉️": "inbox",
  "🏛️": "home",
  "🎓": "award",
  "🧑‍🎓": "user",
  "🧑‍💻": "user",
  "🔒": "lock",
  "🔥": "zap",
  "🗺️": "map",
  "📁": "folder",
  "📂": "folder",
  "🧠": "cpu",
  "🎤": "message-circle",
  "🛍️": "shopping-bag",
  "🎁": "gift",
  "📓": "book",
  "🐙": "github",
  "🕹️": "play-circle",
  "☰": "menu",
  "✕": "x",
  "🏫": "home",
  "🧱": "layers",
  "💼": "briefcase",
  "⚖️": "columns",
  "📌": "map-pin",
  "🏢": "briefcase",
  "⭐": "star",
  PRG: "award",
  SCH: "home",
  DOM: "compass",
  SUB: "layers",
  ROL: "briefcase",
  CMP: "columns",
  OPP: "map-pin",
  ORG: "briefcase",
  ELT: "star",
  RES: "link",
  SET: "settings",
  OUT: "power",
  MAP: "map",
  WORLD: "globe",
  XP: "zap",
  ST: "trending-up",
  PL: "layers",
  OK: "check-circle",
};

/** The Feather name for a glyph, or null when it has no mapping. */
export function featherNameForGlyph(glyph: string): FeatherName | null {
  return GLYPH_TO_FEATHER[glyph.trim()] ?? null;
}

export interface GlyphIconProps {
  /** An emoji / text-code glyph, or a Feather name used as-is. */
  glyph: string;
  size?: number;
  color?: string;
  /** Spoken label; omit for a purely decorative icon (the default). */
  accessibilityLabel?: string;
  fallbackStyle?: StyleProp<TextStyle>;
}

export function GlyphIcon({
  glyph,
  size = 16,
  color,
  accessibilityLabel,
  fallbackStyle,
}: GlyphIconProps) {
  const direct = glyph in Feather.glyphMap ? (glyph as FeatherName) : null;
  const name = direct ?? featherNameForGlyph(glyph);
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityLabel }
    : ({ accessible: false, importantForAccessibility: "no-hide-descendants" } as const);
  if (!name) {
    return (
      <Text style={fallbackStyle} {...a11y}>
        {glyph}
      </Text>
    );
  }
  return (
    <View {...a11y}>
      <Feather name={name} size={size} color={color} />
    </View>
  );
}

export default GlyphIcon;
