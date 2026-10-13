import type { ProgrammeSkillCoverage } from "@/types/institution";

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

/** Export only the reports returned by the API; never expand scope implicitly. */
export function programmeCoverageCsv(reports: ProgrammeSkillCoverage[]): string {
  const rows: unknown[][] = [[
    "Programme", "Record type", "Domain", "Connection", "Level", "Item type",
    "Item", "Comparison state", "Scope", "Source URL",
  ]];
  for (const report of reports) {
    for (const evidence of report.curriculumEvidence ?? []) {
      if (evidence.studentDisplay && evidence.dataState === "source_backed") {
        rows.push([report.programmeName, "Curriculum", "", "", "Programme", "Learning outcome", evidence.studentText || evidence.courseTitle, "Taught", evidence.courseCode, ""]);
      }
    }
    for (const domain of report.domains) {
      for (const resource of domain.resources) {
        rows.push([
          report.programmeName, "Downstream evidence", domain.domainName, domain.matchType,
          resource.source, resource.kind, resource.name,
          resource.curriculumState || resource.state || resource.marketState,
          [resource.scopeName, resource.roleName].filter(Boolean).join(" / "), resource.url,
        ]);
      }
    }
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
