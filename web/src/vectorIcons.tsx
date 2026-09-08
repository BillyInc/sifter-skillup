import { Text } from "react-native";

const glyphs: Record<string, string> = {
  "arrow-left": "←", "arrow-right": "→", "arrow-up-right": "↗", "arrow-up-left": "↖",
  "chevron-right": "›", "chevron-left": "‹", "chevron-down": "⌄", "chevron-up": "⌃",
  search: "⌕", check: "✓", x: "×", plus: "+", "plus-circle": "⊕", lock: "⌑",
  info: "ⓘ", "help-circle": "?", bookmark: "☆", clock: "◷", map: "⌖", compass: "⊙",
  code: "<>" , heart: "♥", tool: "⚒", "trending-up": "↗", shield: "◇", sun: "☼",
  "book-open": "▤", star: "★", filter: "≡", more: "⋯", download: "↓", external: "↗",
};

export const Feather = Object.assign(
  function Feather({ name, size = 16, color = "currentColor", style, ...props }: { name: string; size?: number; color?: string; style?: unknown; [key: string]: unknown }) {
    return <Text {...props} style={[{ color, fontSize: size, lineHeight: size + 3, fontWeight: "700" }, style]}>{glyphs[name] ?? "•"}</Text>;
  },
  { glyphMap: glyphs },
);

