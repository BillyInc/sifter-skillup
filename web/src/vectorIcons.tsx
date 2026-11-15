import { Text } from "react-native";

/**
 * Web stand-in for Feather. Icons the learning-plan tray and programme
 * selector rely on are drawn as stroke SVGs. Unknown names stay on the
 * small unicode map, and only a name with no drawing at all falls back
 * to a dot.
 */
const glyphs: Record<string, string> = {
  "arrow-left": "←", "arrow-right": "→", "arrow-up-right": "↗", "arrow-up-left": "↖",
  "chevron-right": "›", "chevron-left": "‹", "chevron-down": "⌄", "chevron-up": "⌃",
  search: "⌕", check: "✓", x: "×", plus: "+", "plus-circle": "⊕", lock: "⌑",
  info: "ⓘ", "help-circle": "?", bookmark: "☆", clock: "◷", map: "⌖", compass: "⊙",
  code: "<>" , heart: "♥", tool: "⚒", "trending-up": "↗", shield: "◇", sun: "☼",
  "book-open": "▤", star: "★", filter: "≡", more: "⋯", download: "↓", external: "↗",
};

type IconPart = { d?: string; rect?: { x: number; y: number; width: number; height: number; rx?: number }; circle?: { cx: number; cy: number; r: number }; line?: { x1: number; y1: number; x2: number; y2: number } };

/** Standard Feather stroke icons. These replace the dot fallback for the tray and the programme check. */
const svgIcons: Record<string, IconPart[]> = {
  check: [{ d: "M20 6 9 17l-5-5" }],
  square: [{ rect: { x: 3, y: 3, width: 18, height: 18, rx: 2 } }],
  x: [{ d: "M18 6 6 18" }, { d: "M6 6l12 12" }],
  minus: [{ d: "M5 12h14" }],
  folder: [{ d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" }],
  "chevron-down": [{ d: "m6 9 6 6 6-6" }],
  "chevron-up": [{ d: "m18 15-6-6-6 6" }],
  "minimize-2": [{ d: "M4 14h6v6" }, { d: "M20 10h-6V4" }, { d: "m14 10 7-7" }, { d: "m3 21 7-7" }],
  "maximize-2": [{ d: "M15 3h6v6" }, { d: "M9 21H3v-6" }, { d: "m21 3-7 7" }, { d: "m3 21 7-7" }],
  "trash-2": [
    { d: "M3 6h18" },
    { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" },
    { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" },
    { line: { x1: 10, y1: 11, x2: 10, y2: 17 } },
    { line: { x1: 14, y1: 11, x2: 14, y2: 17 } },
  ],
  "alert-circle": [{ circle: { cx: 12, cy: 12, r: 10 } }, { line: { x1: 12, y1: 8, x2: 12, y2: 12 } }, { line: { x1: 12, y1: 16, x2: 12.01, y2: 16 } }],
};

function SvgIcon({ name, size, color }: { name: string; size: number; color: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}>
    {svgIcons[name].map((part, index) => {
      if (part.rect) return <rect key={index} x={part.rect.x} y={part.rect.y} width={part.rect.width} height={part.rect.height} rx={part.rect.rx} />;
      if (part.circle) return <circle key={index} cx={part.circle.cx} cy={part.circle.cy} r={part.circle.r} />;
      if (part.line) return <line key={index} x1={part.line.x1} y1={part.line.y1} x2={part.line.x2} y2={part.line.y2} />;
      return <path key={index} d={part.d} />;
    })}
  </svg>;
}

export const Feather = Object.assign(
  function Feather({ name, size = 16, color = "currentColor", style, ...props }: { name: string; size?: number; color?: string; style?: unknown; [key: string]: unknown }) {
    if (svgIcons[name]) {
      const extra = style && typeof style === "object" && !Array.isArray(style) ? style as Record<string, unknown> : {};
      return <span {...props} aria-hidden="true" style={{ display: "inline-flex", width: size, height: size, color, lineHeight: 0, flexShrink: 0, ...extra }}>
        <SvgIcon name={name} size={size} color={color} />
      </span>;
    }
    return <Text {...props} style={[{ color, fontSize: size, lineHeight: size + 3, fontWeight: "700" }, style] as never}>{glyphs[name] ?? "•"}</Text>;
  },
  { glyphMap: { ...glyphs, ...Object.fromEntries(Object.keys(svgIcons).map((name) => [name, name])) } },
);
