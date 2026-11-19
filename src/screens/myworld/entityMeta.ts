import type { SavedEntityType } from "@/types/career";

/** Human-friendly glyphs / labels per saved entity type (shared by My World
 *  saved rows and collection rows). */
export const ENTITY_META: Record<SavedEntityType, { icon: string; label: string }> = {
  resource: { icon: "🔗", label: "Resource" },
  programme: { icon: "🎓", label: "Programme" },
  school: { icon: "🏫", label: "School" },
  domain: { icon: "🧭", label: "Domain" },
  subgroup: { icon: "🧱", label: "Subgroup" },
  role: { icon: "💼", label: "Role" },
  comparison: { icon: "⚖️", label: "Comparison" },
  opportunity: { icon: "📌", label: "Opportunity" },
  organisation: { icon: "🏢", label: "Employer" },
  elite_pathway: { icon: "⭐", label: "Pathway" },
};
