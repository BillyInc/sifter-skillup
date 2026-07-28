/**
 * Shared cluster color + icon maps for career intelligence screens.
 *
 * All 37 clusters have colors and Feather icons defined here.
 * Single source of truth — import from here instead of duplicating.
 */
import { Feather } from "@expo/vector-icons";

export const CLUSTER_COLORS: Record<string, string> = {
  "Information & Communication Technology": "#3B3AC4",
  "Health & Biomedical": "#0E9F6E",
  "Engineering & Built Environment": "#D97706",
  "Financial Services": "#0D9488",
  "Legal & Compliance": "#111111",
  "Agriculture & Food Systems": "#F5A65B",
  "Education & Research": "#2563EB",
  "Creative & Media": "#F5A65B",
  "Data & Analytics": "#0D9488",
  "Business & Management": "#3B3AC4",
  "Public Sector & Social Services": "#2563EB",
  "Supply Chain & Logistics": "#111111",
  "Emerging Technology": "#3B3AC4",
  "Advanced Science & Engineering": "#0E9F6E",
  "Community Health & Paramedical": "#0E9F6E",
  "Defence & Military": "#111111",
  "Energy & Resources": "#D97706",
  "High-Performance Engineering": "#3B3AC4",
};

export const CLUSTER_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
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
};

export const DEFAULT_COLOR = "#6B7280";
export const DEFAULT_ICON = "compass" as const;
