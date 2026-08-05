import type { BridgeLayerKey } from "../types/career";

export type NigerianUserTypeKey =
  | "ss3_jamb_candidate"
  | "university_undergraduate"
  | "university_graduate_white_collar"
  | "university_graduate_blue_collar_field"
  | "msc_nigerian_university"
  | "msc_international_returning"
  | "phd_nigerian_limited_publications"
  | "phd_internationally_published_or_trained"
  | "hnd_holder"
  | "ond_nd_holder"
  | "nce_holder"
  | "technical_college_artisan"
  | "college_of_health_monotechnic_specialist";

export interface NigerianUserTypeDefinition {
  key: NigerianUserTypeKey;
  label: string;
  certifies: string;
  internationalStanding: string;
  primaryGap: string;
  directEntryRight: string;
}

export const NIGERIAN_USER_TYPES: NigerianUserTypeDefinition[] = [
  {
    key: "ss3_jamb_candidate",
    label: "SS3 / JAMB Candidate",
    certifies: "Pre-tertiary; no tertiary credential yet.",
    internationalStanding: "Universal starting point; future optionality depends on degree and institution choices.",
    primaryGap: "Degree selection and institution choice.",
    directEntryRight: "N/A - not yet enrolled.",
  },
  {
    key: "university_undergraduate",
    label: "University Undergraduate",
    certifies: "In-progress bachelor's degree at a Nigerian university.",
    internationalStanding: "Enrolled but not yet credentialled; value is built through signals during study.",
    primaryGap: "Internship access, credential awareness, and formation signal accumulation.",
    directEntryRight: "No - still building.",
  },
  {
    key: "university_graduate_white_collar",
    label: "University Graduate - White Collar",
    certifies: "BSc, BA, BEng, LLB, or equivalent from a Nigerian university.",
    internationalStanding: "Recognised degree; target-school prestige gap may remain internationally.",
    primaryGap: "Credential signal and institutional prestige bridge.",
    directEntryRight: "Yes for Nigerian firms; partial for international routes.",
  },
  {
    key: "university_graduate_blue_collar_field",
    label: "University Graduate - Blue Collar / Field",
    certifies: "BSc or BEng in engineering, science, or technical fields.",
    internationalStanding: "Recognised degree; engineering chartership may need additional evidence internationally.",
    primaryGap: "Professional chartership or domain registration.",
    directEntryRight: "Yes domestically; ELR may be needed for UK chartership.",
  },
  {
    key: "msc_nigerian_university",
    label: "MSc - Nigerian University",
    certifies: "Postgraduate research or taught master's from a Nigerian institution.",
    internationalStanding: "Adds specialist knowledge but may not remove institutional prestige gaps.",
    primaryGap: "International publications, funded PhD, or global credential signal.",
    directEntryRight: "Yes domestically; partial internationally.",
  },
  {
    key: "msc_international_returning",
    label: "MSc - International University (Returning)",
    certifies: "Postgraduate degree from a recognised international university.",
    internationalStanding: "Often a target-school or recognised international credential.",
    primaryGap: "Execution gap: direct applications and time-sensitive visa windows.",
    directEntryRight: "Often yes; platform should state direct eligibility where sourced.",
  },
  {
    key: "phd_nigerian_limited_publications",
    label: "PhD - Nigerian University, Limited Publications",
    certifies: "Doctoral training with limited international publication signal.",
    internationalStanding: "High time investment; global recognition depends heavily on demonstrated research output.",
    primaryGap: "Publication record, fellowship bridge, or technical proof route.",
    directEntryRight: "Selective; domain and publication-record dependent.",
  },
  {
    key: "phd_internationally_published_or_trained",
    label: "PhD - Internationally Published or Trained",
    certifies: "Doctoral degree with international training or indexed publication signal.",
    internationalStanding: "Competitive for several research, specialist, and technical tracks.",
    primaryGap: "Application knowledge, network activation, and route-specific interview prep.",
    directEntryRight: "Yes for multiple elite tracks where eligibility is sourced.",
  },
  {
    key: "hnd_holder",
    label: "HND Holder",
    certifies: "Higher National Diploma from a Nigerian polytechnic.",
    internationalStanding: "Usually treated as sub-degree rather than equivalent to a bachelor's degree.",
    primaryGap: "Top-up degree, direct entry degree route, or explicitly accepted professional-body route.",
    directEntryRight: "Limited; most elite paths require a top-up or professional-body bridge.",
  },
  {
    key: "ond_nd_holder",
    label: "OND / ND Holder",
    certifies: "Ordinary National Diploma from a Nigerian polytechnic.",
    internationalStanding: "Roughly foundation or early university level; not sufficient alone for most elite professional routes.",
    primaryGap: "JAMB Direct Entry to 200 level or completion of HND before further bridging.",
    directEntryRight: "Yes - JAMB Direct Entry may be available with Upper Credit and a related field.",
  },
  {
    key: "nce_holder",
    label: "NCE Holder",
    certifies: "Nigeria Certificate in Education.",
    internationalStanding: "Recognised as a Nigerian teaching qualification, not as a university degree internationally.",
    primaryGap: "Degree conversion or direct entry to a university degree.",
    directEntryRight: "No for most corporate elite domains; accessible inside teaching-domain routes.",
  },
  {
    key: "technical_college_artisan",
    label: "Technical College / NABTEB / Artisan",
    certifies: "Trade qualification or practical vocational skill.",
    internationalStanding: "Recognised mainly within trade frameworks unless bridged academically.",
    primaryGap: "NABTEB to OND/HND/degree bridge, or trade business ownership path.",
    directEntryRight: "No for corporate elite paths; yes for trade/business elite paths.",
  },
  {
    key: "college_of_health_monotechnic_specialist",
    label: "College of Health / Monotechnic / CoE Specialist",
    certifies: "Domain-specific professional health, nursing, education, or technology qualification.",
    internationalStanding: "Recognised within its domain; international routes require jurisdiction-specific licensing.",
    primaryGap: "Nigerian professional registration first, then specialist or international licensing.",
    directEntryRight: "Yes within domain; cross-domain requires conversion.",
  },
];

export type CareerChangerRouteKey =
  | "same_domain_level_change"
  | "adjacent_domain_pivot"
  | "significant_domain_change"
  | "forced_career_change";

export const CAREER_CHANGER_ROUTE_DEFINITIONS: {
  key: CareerChangerRouteKey;
  label: string;
  productRule: string;
}[] = [
  {
    key: "same_domain_level_change",
    label: "Same domain, different employer or level",
    productRule: "Route to market intelligence, salary benchmarking, and credential gap checks.",
  },
  {
    key: "adjacent_domain_pivot",
    label: "Adjacent domain pivot",
    productRule: "Prioritise transferable skills and one-credential bridges where possible.",
  },
  {
    key: "significant_domain_change",
    label: "Significant domain change",
    productRule: "Show full retraining timelines and costs without softening the commitment.",
  },
  {
    key: "forced_career_change",
    label: "Forced career change",
    productRule: "Route to fastest realistic stability first, with elite optionality second.",
  },
];

/**
 * The number of elite domains the product covers. Single source of truth for
 * any user-facing copy that states the count, so the number can never drift
 * out of sync with the data again.
 */
export const ELITE_DOMAIN_COUNT = 10;

/**
 * The bridge layers a guide MUST populate before release. Layer 6
 * (`ownership_path`, titled "Proof of Concept") is deliberately excluded: it
 * can only hold real, named Nigerians who actually walked the route, so it
 * stays locked until verified people exist rather than being filled to pass a
 * completeness gate.
 */
export const GUIDE_REQUIRED_BRIDGE_LAYER_KEYS: BridgeLayerKey[] = [
  "global_standard",
  "nigerian_qualification_map",
  "bridge_inventory",
  "timeline_cost",
  "employer_entry",
];

export type EliteVerificationCheckKey =
  | "specific_claims_sourced"
  | "all_user_types_covered"
  | "ond_direct_entry_noted"
  | "career_changer_routes"
  | "nigerian_entry_points_named"
  | "timelines_by_user_type"
  | "costs_with_currencies"
  | "no_unsourced_selectivity_or_burnout_stats"
  | "proof_of_concept_documented"
  | "phd_non_academic_routes_prominent"
  | "lca_anomaly_flagged_when_relevant"
  | "nse_washington_accord_status_for_engineering"
  | "international_msc_direct_application_noted"
  | "artisan_trade_business_path_included"
  | "domain_vs_role_scope_clear";

export const ELITE_PATHWAY_QUALITY_CHECKS: {
  key: EliteVerificationCheckKey;
  label: string;
  actionIfMissing: string;
}[] = [
  {
    key: "specific_claims_sourced",
    label: "Every specific number or percentage has a named source.",
    actionIfMissing: "Replace with a qualitative label or add a source.",
  },
  {
    key: "all_user_types_covered",
    label: "All Nigerian starting-point user types are covered.",
    actionIfMissing: "Generate missing user-type bridge rows before release.",
  },
  {
    key: "ond_direct_entry_noted",
    label: "OND notes JAMB Direct Entry with Upper Credit where applicable.",
    actionIfMissing: "Correct the OND bridge before release.",
  },
  {
    key: "career_changer_routes",
    label: "Career changer section includes adjacent pivots and significant-change routes.",
    actionIfMissing: "Add career changer treatment.",
  },
  {
    key: "nigerian_entry_points_named",
    label: "Named Nigerian firms, institutions, or programmes are included.",
    actionIfMissing: "Research and add Nigerian entry points.",
  },
  {
    key: "timelines_by_user_type",
    label: "Bridge timelines exist for each user type.",
    actionIfMissing: "Add timeline ranges where exact figures are unavailable.",
  },
  {
    key: "costs_with_currencies",
    label: "Costs include relevant fees and currencies.",
    actionIfMissing: "Add official fee schedule data before release.",
  },
  {
    key: "no_unsourced_selectivity_or_burnout_stats",
    label: "No unsourced burnout, selectivity, or Nigerian-specific statistics are presented as fact.",
    actionIfMissing: "Remove, source, or reframe as qualitative.",
  },
  {
    key: "proof_of_concept_documented",
    label: "Proof of concept is documented or honestly marked as not found.",
    actionIfMissing: "Do not invent examples; mark the documentation gap.",
  },
  {
    key: "phd_non_academic_routes_prominent",
    label: "PhD pathways make non-academic routes as prominent as academia.",
    actionIfMissing: "Revise PhD treatment.",
  },
  {
    key: "lca_anomaly_flagged_when_relevant",
    label: "LCA/H1B salary anomaly is flagged when US visa wage data is used.",
    actionIfMissing: "Add the anomaly explainer.",
  },
  {
    key: "nse_washington_accord_status_for_engineering",
    label: "Engineering domains mention NSE Washington Accord status.",
    actionIfMissing: "Add current status with source.",
  },
  {
    key: "international_msc_direct_application_noted",
    label: "International MSc holders are told when direct elite applications may already be available.",
    actionIfMissing: "Add explicit direct-application note.",
  },
  {
    key: "artisan_trade_business_path_included",
    label: "Artisan and technical-college users get a trade/business ownership path where relevant.",
    actionIfMissing: "Add the trade elite alternative.",
  },
  {
    key: "domain_vs_role_scope_clear",
    label: "Elite domain and elite role scopes are not conflated.",
    actionIfMissing: "Correct the scope before release.",
  },
];

export type EliteDataCategory =
  | "compensation"
  | "exam_fees"
  | "visa_rules"
  | "jamb_direct_entry"
  | "nse_washington_accord"
  | "scholarships"
  | "firm_presence"
  | "cfa_pass_rates"
  | "professional_body_requirements";

export const ELITE_DATA_UPDATE_RULES: {
  category: EliteDataCategory;
  reviewCadence: string;
  immediateTrigger: string;
  sourceFamily: string;
}[] = [
  {
    category: "compensation",
    reviewCadence: "Annual, Q1",
    immediateTrigger: "Major market event or sector shock.",
    sourceFamily: "WSO, Levels.fyi, Management Consulted, ICSC, local salary surveys.",
  },
  {
    category: "exam_fees",
    reviewCadence: "Before each intake cycle",
    immediateTrigger: "Professional body fee schedule change.",
    sourceFamily: "Official professional-body fee pages.",
  },
  {
    category: "visa_rules",
    reviewCadence: "Every 6 months",
    immediateTrigger: "UK, Ireland, Canada, or US immigration policy announcement.",
    sourceFamily: "Official immigration portals.",
  },
  {
    category: "jamb_direct_entry",
    reviewCadence: "Annual, after JAMB policy release",
    immediateTrigger: "JAMB Direct Entry policy announcement.",
    sourceFamily: "JAMB and university admission guidance.",
  },
  {
    category: "nse_washington_accord",
    reviewCadence: "Annual",
    immediateTrigger: "International Engineering Alliance status update.",
    sourceFamily: "IEA agreements and engineering-body pages.",
  },
  {
    category: "scholarships",
    reviewCadence: "Annual, before deadline season",
    immediateTrigger: "Programme suspension or new programme launch.",
    sourceFamily: "Programme websites and nominating-body pages.",
  },
  {
    category: "firm_presence",
    reviewCadence: "Annual",
    immediateTrigger: "Firm enters or exits Nigeria or changes active hiring.",
    sourceFamily: "Firm country pages and LinkedIn organisation data.",
  },
  {
    category: "cfa_pass_rates",
    reviewCadence: "Per exam cycle",
    immediateTrigger: "Pass-rate shift greater than 5 percentage points.",
    sourceFamily: "CFA Institute official statistics.",
  },
  {
    category: "professional_body_requirements",
    reviewCadence: "Annual",
    immediateTrigger: "Regulatory or professional-body rule change.",
    sourceFamily: "ICAN, COREN, NBA, MDCN, NMCN, and equivalent official pages.",
  },
];

export interface ElitePathwayCoverageDraft {
  bridgeLayerKeys: string[];
  userTypeKeys: string[];
  qualityCheckKeys: string[];
}

export interface ElitePathwayCoverageIssue {
  code:
    | "missing_bridge_layer"
    | "missing_user_type"
    | "missing_quality_check";
  message: string;
}

export function validateElitePathwayCoverage(
  draft: ElitePathwayCoverageDraft,
): ElitePathwayCoverageIssue[] {
  const issues: ElitePathwayCoverageIssue[] = [];
  const bridgeLayerKeys = new Set(draft.bridgeLayerKeys);
  const userTypeKeys = new Set(draft.userTypeKeys);
  const qualityCheckKeys = new Set(draft.qualityCheckKeys);

  for (const key of GUIDE_REQUIRED_BRIDGE_LAYER_KEYS) {
    if (!bridgeLayerKeys.has(key)) {
      issues.push({
        code: "missing_bridge_layer",
        message: `Missing bridge layer: ${key}`,
      });
    }
  }

  for (const userType of NIGERIAN_USER_TYPES) {
    if (!userTypeKeys.has(userType.key)) {
      issues.push({
        code: "missing_user_type",
        message: `Missing Nigerian user type: ${userType.label}`,
      });
    }
  }

  for (const check of ELITE_PATHWAY_QUALITY_CHECKS) {
    if (!qualityCheckKeys.has(check.key)) {
      issues.push({
        code: "missing_quality_check",
        message: `Missing quality check: ${check.label}`,
      });
    }
  }

  return issues;
}
