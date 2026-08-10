import { request } from "./api";
import { comingSoon, type DataState } from "@/types/career";
import type {
  EntrepreneurshipEntryMode,
  EntrepreneurshipOpportunityMap,
  OpportunityLens,
  VentureMode,
} from "@/types/entrepreneurship";

const pendingEvidence = {
  status: "not_yet_evidenced" as const,
  sources: [],
  lastReviewed: null,
  note: "Not yet evidenced. This content needs approved source coverage before claims are shown.",
};

const FOUNDATION_MAP: EntrepreneurshipOpportunityMap = {
  context: {
    entryMode: "domain",
    domainId: null,
    domainName: null,
    programmeName: null,
  },
  domains: [
    { id: "domain-current", name: "Use my saved or selected domain", rank: 1, evidence: pendingEvidence },
    { id: "domain-adjacent", name: "Explore adjacent domains", rank: 2, evidence: pendingEvidence },
    { id: "domain-market", name: "Start from a market problem", rank: 3, evidence: pendingEvidence },
  ],
  roles: [
    {
      id: "independent-service-builder",
      title: "Independent service builder",
      roleType: "documented",
      summary: "A solo or small-team service path built from a student's domain skill.",
      domainIds: ["domain-current"],
      ventureModes: ["micro", "service"],
      lenses: ["replicate", "productize"],
      entryModes: ["programme", "domain", "skill"],
      capabilityLayers: ["Customer discovery", "Pricing", "Delivery workflow", "Bookkeeping"],
      partnerRequirements: ["Optional operator or sales partner"],
      regulationNotes: ["Check sector-specific registration before taking regulated work."],
      nigeriaContext: "Not yet evidenced.",
      globalContext: "Not yet evidenced.",
      evidence: pendingEvidence,
      marketSignals: [],
    },
    {
      id: "creator-educator",
      title: "Creator educator",
      roleType: "documented",
      summary: "A knowledge-product path that turns field expertise into teaching, templates, or advisory content.",
      domainIds: ["domain-current", "domain-adjacent"],
      ventureModes: ["creator", "service"],
      lenses: ["productize", "distribute"],
      entryModes: ["programme", "skill", "idea"],
      capabilityLayers: ["Audience definition", "Content packaging", "Distribution", "Proof of learning outcome"],
      partnerRequirements: ["Optional subject reviewer or production support"],
      regulationNotes: ["Avoid credential or outcome claims until independently evidenced."],
      nigeriaContext: "Not yet evidenced.",
      globalContext: "Not yet evidenced.",
      evidence: pendingEvidence,
      marketSignals: [],
    },
    {
      id: "problem-led-venture",
      title: "Problem-led venture",
      roleType: "emerging",
      summary: "A venture hypothesis that starts from a repeated market problem and is validated before build.",
      domainIds: ["domain-market"],
      ventureModes: ["scalable", "research"],
      lenses: ["adapt", "digitize", "regulated"],
      entryModes: ["idea", "market_problem", "domain"],
      capabilityLayers: ["Problem evidence", "Buyer mapping", "Prototype", "Compliance review"],
      partnerRequirements: ["Domain expert", "Technical builder", "Distribution partner"],
      regulationNotes: ["Render sector-specific requirements only after source-backed validation."],
      nigeriaContext: "Not yet evidenced.",
      globalContext: "Not yet evidenced.",
      evidence: pendingEvidence,
      marketSignals: [],
    },
    {
      id: "trade-owner-operator",
      title: "Trade owner-operator",
      roleType: "documented",
      summary: "A skilled-work path from practical capability to a local business operation.",
      domainIds: ["domain-adjacent", "domain-market"],
      ventureModes: ["trade", "micro"],
      lenses: ["replicate", "adapt"],
      entryModes: ["skill", "market_problem"],
      capabilityLayers: ["Service quality", "Tools", "Supplier relationships", "Customer retention"],
      partnerRequirements: ["Supplier or workshop partner where needed"],
      regulationNotes: ["Local permits and professional standards must be source-checked per trade."],
      nigeriaContext: "Not yet evidenced.",
      globalContext: "Not yet evidenced.",
      evidence: pendingEvidence,
      marketSignals: [],
    },
  ],
  entitlements: {
    canSave: false,
    canCompare: false,
    canExport: false,
    canViewFullMap: false,
  },
};

export const entrepreneurshipData = {
  async getOpportunityMap(params: {
    entryMode?: EntrepreneurshipEntryMode;
    domainId?: string;
    programmeName?: string;
  } = {}): Promise<DataState<EntrepreneurshipOpportunityMap>> {
    try {
      const qs = new URLSearchParams();
      if (params.entryMode) qs.set("entry_mode", params.entryMode);
      if (params.domainId) qs.set("domain_id", params.domainId);
      if (params.programmeName) qs.set("programme_name", params.programmeName);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return await request<DataState<EntrepreneurshipOpportunityMap>>(
        `/api/entrepreneurship/opportunity-map${suffix}`,
      );
    } catch {
      return {
        status: "pending",
        data: {
          ...FOUNDATION_MAP,
          context: {
            ...FOUNDATION_MAP.context,
            entryMode: params.entryMode ?? FOUNDATION_MAP.context.entryMode,
            domainId: params.domainId ?? null,
            programmeName: params.programmeName ?? null,
          },
        },
        meta: {
          verification: "pending",
          notice: "Opportunity Map foundation is available; source-backed data is still being imported.",
        },
      };
    }
  },

  filterRoles(
    map: EntrepreneurshipOpportunityMap,
    filters: {
      domainId?: string | null;
      ventureModes: VentureMode[];
      lenses: OpportunityLens[];
      showAll: boolean;
    },
  ) {
    return map.roles.filter((role) => {
      const domainOk =
        filters.showAll ||
        !filters.domainId ||
        role.domainIds.includes(filters.domainId);
      const modeOk =
        !filters.ventureModes.length ||
        role.ventureModes.some((mode) => filters.ventureModes.includes(mode));
      const lensOk =
        !filters.lenses.length ||
        role.lenses.some((lens) => filters.lenses.includes(lens));
      return domainOk && modeOk && lensOk;
    });
  },
};

export function emptyEntrepreneurshipMap(notice?: string) {
  return comingSoon<EntrepreneurshipOpportunityMap>(notice);
}
