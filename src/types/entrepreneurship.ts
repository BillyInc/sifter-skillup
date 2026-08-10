import type { DataState } from "./career";

export type EntrepreneurshipEntryMode =
  | "programme"
  | "domain"
  | "idea"
  | "skill"
  | "market_problem";

export type VentureMode =
  | "micro"
  | "service"
  | "creator"
  | "scalable"
  | "research"
  | "trade";

export type OpportunityLens =
  | "replicate"
  | "adapt"
  | "digitize"
  | "productize"
  | "distribute"
  | "regulated";

export type EvidenceStatus = "verified" | "inferred" | "not_yet_evidenced";

export interface EntrepreneurshipEvidence {
  status: EvidenceStatus;
  sources: string[];
  lastReviewed?: string | null;
  note?: string | null;
}

export interface EntrepreneurshipMarketSignal {
  id: string;
  label: string;
  geography: "nigeria" | "global" | "both";
  evidence: EntrepreneurshipEvidence;
}

export interface EntrepreneurshipRole {
  id: string;
  title: string;
  roleType: "documented" | "emerging";
  summary: string;
  domainIds: string[];
  ventureModes: VentureMode[];
  lenses: OpportunityLens[];
  entryModes: EntrepreneurshipEntryMode[];
  capabilityLayers: string[];
  partnerRequirements: string[];
  regulationNotes: string[];
  nigeriaContext: string;
  globalContext: string;
  evidence: EntrepreneurshipEvidence;
  marketSignals: EntrepreneurshipMarketSignal[];
}

export interface EntrepreneurshipOpportunityMap {
  context: {
    entryMode: EntrepreneurshipEntryMode;
    domainId?: string | null;
    domainName?: string | null;
    programmeName?: string | null;
  };
  domains: { id: string; name: string; rank?: number | null; evidence: EntrepreneurshipEvidence }[];
  roles: EntrepreneurshipRole[];
  entitlements: {
    canSave: boolean;
    canCompare: boolean;
    canExport: boolean;
    canViewFullMap: boolean;
  };
}

export type EntrepreneurshipMapState = DataState<EntrepreneurshipOpportunityMap>;
