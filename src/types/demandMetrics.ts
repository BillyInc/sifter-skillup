/**
 * Demand metrics types for labour market intelligence.
 */
export interface DemandMetricsScope {
  postingsPerMonth: number;
  postingsYoY?: number;
  remotePct?: number;
  entrySalaryLocalNGN?: number;
  entrySalaryRemoteUSD?: number;
  plainLabel?: string;
  topEmployers?: string[];
  topCertifications?: string[];
}

export interface DemandMetrics {
  ng_local?: DemandMetricsScope;
  global?: DemandMetricsScope;
  ng_remote?: DemandMetricsScope;
}
