import { Feather } from "@expo/vector-icons";

export type FeatherIconName = keyof typeof Feather.glyphMap;

export const CLUSTER_COLORS: Record<string, string> = {
  "Information & Communication Technology": "#3B3AC4",
  "Data & Analytics": "#0D9488",
  "Financial Services": "#0D9488",
  "Engineering & Built Environment": "#D97706",
  "Health & Biomedical": "#0E9F6E",
  "Business & Management": "#3B3AC4",
  "Supply Chain & Logistics": "#111111",
  "Legal & Compliance": "#111111",
  "Education & Research": "#2563EB",
  "Creative & Media": "#F5A65B",
  "Public Sector & Social Services": "#2563EB",
  "Agriculture & Food Systems": "#F5A65B",
  "Advanced Manufacturing": "#6B7280",
  "Real Estate & Construction": "#D97706",
  "Hospitality & Tourism": "#F5A65B",
  "Energy & Resources": "#D97706",
  "Emerging Technology": "#3B3AC4",
  "Office & Administrative Services": "#64748B",
  "Retail, Sales & Commerce": "#0D9488",
  "Beauty, Personal Care & Wellness": "#EC4899",
  "Culinary Arts & Food Service": "#F59E0B",
  "Electrical & Electronics Trades": "#2563EB",
  "Mechanical & Automotive Trades": "#D97706",
  "Metal, Welding & Fabrication Trades": "#6B7280",
  "Building & Construction Trades": "#D97706",
  "Wood, Furniture & Craft": "#B8860B",
  "Textiles, Garments & Leather": "#8B5CF6",
  "Printing & Graphic Production": "#6B7280",
  "Manufacturing & Industrial Plant Operations": "#6B7280",
  "Transport & Driving Operations": "#0EA5E9",
  "Agriculture, Fishing & Natural Resources": "#10B981",
  "Community Health & Paramedical": "#0E9F6E",
  "Childcare & Early Learning": "#2563EB",
  "Defence & Military": "#111111",
  "High-Performance Engineering": "#3B3AC4",
  "Advanced Science & Engineering": "#0E9F6E",
};

export const CLUSTER_ICONS: Record<string, FeatherIconName> = {
  "Information & Communication Technology": "code",
  "Health & Biomedical": "heart",
  "Engineering & Built Environment": "tool",
  "Financial Services": "trending-up",
  "Legal & Compliance": "shield",
  "Agriculture & Food Systems": "sun",
  "Education & Research": "book-open",
  "Creative & Media": "star",
  "Data & Analytics": "layers",
  "Business & Management": "briefcase",
  "Public Sector & Social Services": "users",
  "Supply Chain & Logistics": "link",
  "Emerging Technology": "cpu",
  "Advanced Science & Engineering": "hexagon",
  "Community Health & Paramedical": "activity",
  "Defence & Military": "shield",
  "Energy & Resources": "zap",
  "High-Performance Engineering": "target",
  "Advanced Manufacturing": "settings",
  "Real Estate & Construction": "home",
  "Hospitality & Tourism": "map-pin",
  "Office & Administrative Services": "file-text",
  "Retail, Sales & Commerce": "shopping-cart",
  "Beauty, Personal Care & Wellness": "feather",
  "Culinary Arts & Food Service": "coffee",
  "Electrical & Electronics Trades": "battery-charging",
  "Mechanical & Automotive Trades": "truck",
  "Metal, Welding & Fabrication Trades": "tool",
  "Building & Construction Trades": "grid",
  "Wood, Furniture & Craft": "scissors",
  "Textiles, Garments & Leather": "wind",
  "Printing & Graphic Production": "printer",
  "Manufacturing & Industrial Plant Operations": "sliders",
  "Transport & Driving Operations": "navigation",
  "Agriculture, Fishing & Natural Resources": "anchor",
  "Childcare & Early Learning": "flag",
};

export const DEFAULT_COLOR = "#6B7280";
export const DEFAULT_ICON: FeatherIconName = "compass";

export function getClusterColor(cluster: string): string {
  return CLUSTER_COLORS[cluster] ?? DEFAULT_COLOR;
}

export function getClusterIcon(cluster: string): FeatherIconName {
  return CLUSTER_ICONS[cluster] ?? DEFAULT_ICON;
}
