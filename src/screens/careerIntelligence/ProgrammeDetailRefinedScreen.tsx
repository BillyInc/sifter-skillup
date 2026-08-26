/**
 * Shared student/admin programme detail surface.
 *
 * The academic choice is resolved first. Admission information belongs to the
 * requirements/university context; career guidance is the programme-to-domain
 * hand-off. Employment and a standalone Admission tab are deliberately not
 * user-facing concepts here.
 */
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  DataSourceBadge,
  DegreeSkills,
  DetailScaffold,
  SectionLabel,
  TextTabs,
  invalidateGuidancePathCache,
} from "@/components/careerIntelligence";
import { careerData, type GuidanceReportPath, type JambProgrammeRequirements, type JambProgrammeSchool } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import { provisioningData } from "@/lib/provisioningData";
import { awardLine } from "@/lib/programmeAward";
import { requirementFallbackText, sanitizeRequirementText, type RequirementField } from "@/lib/sanitizeRequirementText";
import { comingSoon, real, type DataState, type DomainLink, type Programme } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, type ColorPalette } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export interface ProgrammeDetailRefinedScreenProps {
  programmeId: string;
  /** A JAMB identity selected from admission matching. When present, do not
   * resolve through the broader canonical programme because that can merge
   * several distinct JAMB names and their teaching profiles. */
  jambProgrammeId?: string;
  initialSchoolId?: string;
  userType?: string;
  guidanceStudentId?: string;
}

type ProgrammeTab = "overview" | "requirements" | "schools" | "career";

const PLACEHOLDER: Programme = {
  id: "",
  name: "Programme",
  institutionType: "university",
  discipline: "",
  domains: [],
};

function displayRequirement(field: RequirementField, value?: string | null): string {
  const result = sanitizeRequirementText(value ?? null);
  return result.displayable ? result.cleaned : requirementFallbackText(field);
}

function relationshipCopy(matchType: DomainLink["matchType"]): string {
  switch (matchType) {
    case "direct":
      return "This programme shares core subjects and training foundations with this domain.";
    case "functional":
      return "This programme builds knowledge and skills that can be used in this domain, even when the work is different.";
    case "adjacent":
      return "This programme gives you a useful starting point for this domain, but specialist study may still be needed.";
    default:
      return "This domain is connected to the programme through the mapped learning content.";
  }
}

function relationshipLabel(matchType: DomainLink["matchType"]): string {
  return matchType.charAt(0).toUpperCase() + matchType.slice(1) + " connection";
}

function relationshipOrder(matchType: DomainLink["matchType"]): number {
  return matchType === "direct" ? 0 : matchType === "functional" ? 1 : 2;
}

function appendProgrammeChoice(
  path: GuidanceReportPath["path"],
  selection: Partial<GuidanceReportPath["path"]>,
): GuidanceReportPath["path"] {
  const previous = path.programmes?.length
    ? path.programmes
    : path.programme
      ? [{ programme: path.programme, university: path.university, requirements: path.requirements, universityRequirements: path.universityRequirements }]
      : [];
  const programme = selection.programme ?? {};
  const university = selection.university ?? {};
  const programmeId = String(programme.id ?? "");
  const universityId = String(university.id ?? "");
  const next = previous.filter((choice) => {
    const savedProgramme = (choice.programme ?? {}) as Record<string, unknown>;
    const savedUniversity = (choice.university ?? {}) as Record<string, unknown>;
    return String(savedProgramme.id ?? "") !== programmeId || String(savedUniversity.id ?? "") !== universityId;
  });
  return {
    ...path,
    ...selection,
    programmes: [...next, { programme, university, requirements: selection.requirements ?? {}, universityRequirements: selection.universityRequirements ?? {} }],
  };
}

export default function ProgrammeDetailRefinedScreen({ programmeId, jambProgrammeId, initialSchoolId, userType, guidanceStudentId }: ProgrammeDetailRefinedScreenProps) {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ focus?: string | string[] }>();
  const focusedGuidance = (Array.isArray(routeParams.focus) ? routeParams.focus[0] : routeParams.focus) === "guidance";
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const [tab, setTab] = useState<ProgrammeTab>("overview");
  const [state, setState] = useState<DataState<Programme>>(() => comingSoon("Loading programme details..."));
  const [schools, setSchools] = useState<JambProgrammeSchool[]>([]);
  const [requirements, setRequirements] = useState<JambProgrammeRequirements | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingSchool, setSavingSchool] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (jambProgrammeId) {
        const [detail, domainState, schoolRows] = await Promise.all([
          careerData.getJambProgramme(jambProgrammeId),
          careerData.getJambProgrammeDomains(jambProgrammeId),
          careerData.getJambProgrammeSchools(jambProgrammeId),
        ]);
        if (!active) return;
        if (detail.status !== "real" || !detail.data) {
          setState(comingSoon(detail.meta?.notice ?? "Programme details are not available yet."));
          return;
        }
        const variant = detail.data;
        const variantDomains = domainState.status === "real" && domainState.data
          ? domainState.data.domains
          : [];
        const variantProgramme: Programme = {
          id: jambProgrammeId,
          name: variant.jambName || variant.studentName || "Programme",
          displayName: variant.studentName || variant.jambName,
          studentName: variant.studentName || variant.jambName,
          studentNames: [variant.studentName || variant.jambName].filter(Boolean) as string[],
          institutionType: "university",
          discipline: variant.jambFaculty || "",
          qualification: variant.degreeType || undefined,
          // A JAMB variant must use its own source-backed skills profile. Do
          // not borrow the canonical programme description, which may be an
          // aggregate of several JAMB identities.
          overview: null,
          skillsTechnical: variant.skillsTechnical,
          skillsTransferable: variant.skillsTransferable,
          skillsCount: variant.skillsCount,
          domains: variantDomains,
        };
        setState(real(variantProgramme, detail.meta));
        setRequirements(variant.requirements ?? null);
        const nextSchools = schoolRows.status === "real" || schoolRows.status === "fallback"
          ? schoolRows.data ?? []
          : [];
        setSchools(nextSchools);
        if (initialSchoolId && nextSchools.some((school) => school.schoolId === initialSchoolId)) {
          setSelectedSchoolId(initialSchoolId);
        }
        return;
      }

      const result = await careerData.getProgramme(programmeId);
      if (!active) return;
      setState(result);
      if (result.status !== "real" || !result.data) return;
      const search = await careerData.searchJambProgrammes(result.data.name);
      const first = search.status === "real" ? search.data?.[0] : undefined;
      if (!first) return;
      const [detail, schoolRows] = await Promise.all([
        careerData.getJambProgramme(first.jambProgrammeId),
        careerData.getJambProgrammeSchools(first.jambProgrammeId),
      ]);
      if (!active) return;
      setRequirements(detail.status === "real" ? detail.data?.requirements ?? null : null);
      const nextSchools = schoolRows.status === "real" || schoolRows.status === "fallback" ? schoolRows.data ?? [] : [];
      setSchools(nextSchools);
      if (initialSchoolId && nextSchools.some((school) => school.schoolId === initialSchoolId)) {
        setSelectedSchoolId(initialSchoolId);
      }
    })();
    return () => { active = false; };
  }, [initialSchoolId, jambProgrammeId, programmeId]);

  const programme = state.data;
  const activeProgrammeId = jambProgrammeId || programmeId;
  const programmeName = programme?.studentName ?? programme?.studentNames?.[0] ?? programme?.name ?? "Programme name unavailable";
  const visibleSchools = useMemo(
    () => schools.filter((school) => !school.form || school.form.toUpperCase() === "UTME"),
    [schools],
  );
  const selectedSchool = visibleSchools.find((school) => school.schoolId === selectedSchoolId) ?? null;

  const selectSchool = async (school: JambProgrammeSchool) => {
    if (!programme || savingSchool) return;
    setSavingSchool(school.schoolId);
    setNotice(null);
    try {
      let existingPath: GuidanceReportPath["path"] = {};
      if (guidanceStudentId) {
        existingPath = (await provisioningData.getGuidancePath(guidanceStudentId))?.path ?? {};
      } else {
        const current = await careerData.getGuidancePath();
        existingPath = current.status === "real" && current.data ? current.data.path : {};
      }
      const nextPath = appendProgrammeChoice(existingPath, {
        programme: { id: activeProgrammeId, name: school.studentName ?? school.jambName ?? programmeName, sourceName: school.jambName ?? programmeName },
        university: { id: school.schoolId, name: school.schoolName, address: school.address ?? null },
        requirements: (requirements ?? {}) as Record<string, unknown>,
        universityRequirements: {
          utmeSubjects: school.universityUtmeSubjects ?? null,
          olevelRequirement: school.universityOlevelRequirement ?? null,
          note: school.universityNote ?? null,
          requiresReview: Boolean(school.hasUniversityException),
        },
      });
      let saved = false;
      let saveNotice: string | undefined;
      if (guidanceStudentId) {
        await provisioningData.saveGuidancePath(guidanceStudentId, nextPath);
        saved = true;
      } else {
        const response = await careerData.saveGuidancePath({ source: "explore", path: nextPath });
        saved = response.status === "real";
        saveNotice = response.meta?.notice;
      }
      if (saved) {
        invalidateGuidancePathCache();
        setSelectedSchoolId(school.schoolId);
        setNotice(school.hasUniversityException
          ? `${school.schoolName}: ${school.universityNote || "This university has an additional admission note. Check its current notice."}`
          : `${school.schoolName} is saved in your guidance path.`);
      } else {
        setNotice(saveNotice ?? "Create an account to save this guidance path.");
      }
    } catch {
      setNotice("We could not save this university right now. You can still review its details.");
    } finally {
      setSavingSchool(null);
    }
  };

  const header = (
    <TextTabs
      value={tab}
      onChange={setTab}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "requirements", label: "Requirements" },
        { value: "schools", label: "Universities" },
        { value: "career", label: "Career guidance" },
      ]}
      style={styles.tabs}
    />
  );

  return (
    <DetailScaffold
      eyebrow="PROGRAMME"
      title={programmeName}
      backLabel="Back to programme choices"
       save={focusedGuidance ? undefined : { entityType: "programme", entityId: activeProgrammeId }}
      pdf
      pdfPath="/api/student/report.html"
      state={state.status === "real" ? state : { ...state, data: state.data ?? PLACEHOLDER }}
      header={header}
    >
      {(data) => (
        <ProgrammeDetailBody
          data={data}
          tab={tab}
          programmeName={programmeName}
          requirements={requirements}
          schools={visibleSchools}
          selectedSchool={selectedSchool}
          selectedSchoolId={selectedSchoolId}
          earlySecondary={userType === "senior_secondary"}
          notice={notice}
          savingSchool={savingSchool}
          onSelectSchool={selectSchool}
           onContinueCareer={() => {
            exploreNav.guided(router, {
              programmeId: activeProgrammeId,
              jambProgrammeId,
              schoolId: selectedSchoolId ?? undefined,
              userType,
              guidanceStudentId,
            });
          }}
          onChooseSchool={() => setTab("schools")}
          guidanceStudentId={guidanceStudentId}
          router={router}
           colors={colors}
           focusedGuidance={focusedGuidance}
         />
      )}
    </DetailScaffold>
  );
}

function ProgrammeDetailBody({
  data,
  tab,
  programmeName,
  requirements,
  schools,
  selectedSchool,
  selectedSchoolId,
  earlySecondary,
  notice,
  savingSchool,
  onSelectSchool,
  onContinueCareer,
  onChooseSchool,
  guidanceStudentId,
  router,
  colors,
  focusedGuidance,
}: {
  data: Programme;
  tab: ProgrammeTab;
  programmeName: string;
  requirements: JambProgrammeRequirements | null;
  schools: JambProgrammeSchool[];
  selectedSchool: JambProgrammeSchool | null;
  selectedSchoolId: string | null;
  earlySecondary: boolean;
  notice: string | null;
  savingSchool: string | null;
  onSelectSchool: (school: JambProgrammeSchool) => void;
  onContinueCareer: () => void;
  onChooseSchool: () => void;
  guidanceStudentId?: string;
  router: Router;
  colors: ColorPalette;
  focusedGuidance: boolean;
}) {
  const exploreNav = useExploreNav();
  const resp = useResponsive();
  const requirementCards = [
    { label: "UTME subjects", icon: "edit-3" as const, field: "utme_subjects" as RequirementField, value: requirements?.utmeSubjects },
    { label: "O-Level requirements", icon: "book" as const, field: "olevel_requirement" as RequirementField, value: requirements?.olevelRequirement },
  ];
  const universityRequirementCards = selectedSchool ? [
    { label: "This university's UTME subjects", icon: "edit-3" as const, field: "utme_subjects" as RequirementField, value: selectedSchool.universityUtmeSubjects },
    { label: "This university's O-level requirements", icon: "book" as const, field: "olevel_requirement" as RequirementField, value: selectedSchool.universityOlevelRequirement },
  ] : [];
  const orderedDomains = [...(data.domains ?? [])].sort(
    (a, b) => relationshipOrder(a.matchType) - relationshipOrder(b.matchType),
  );
  const previewDomains = orderedDomains.slice(0, 4);

  return (
    <View style={styles.content}>
      {tab === "overview" ? (
        <View style={styles.section}>
          {awardLine(programmeName, data.qualification, data.durationYears) ? (
            <Text style={[styles.award, { color: colors.textRole.secondary }]}>{awardLine(programmeName, data.qualification, data.durationYears)}</Text>
          ) : null}
          {selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.contextLabel, { color: colors.textRole.muted }]}>University offering</Text>
              <Text style={[styles.contextName, { color: colors.textRole.primary }]}>{selectedSchool.schoolName}</Text>
              {selectedSchool.address ? <Text style={[styles.contextAddress, { color: colors.textRole.secondary }]}>{selectedSchool.address}</Text> : null}
            </View>
          ) : null}
          {data.overview ? (
            <View style={styles.block}>
              <SectionLabel>What this programme is about</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{data.overview}</Text>
            </View>
          ) : null}
           <DegreeSkills technical={data.skillsTechnical} transferable={data.skillsTransferable} total={data.skillsCount} />
           {selectedSchool ? (
             <View style={styles.block}>
               <SectionLabel>Where this programme can lead you to explore</SectionLabel>
               {previewDomains.length ? previewDomains.map((link) => (
                 <View key={link.domainId} style={[styles.preview, { borderColor: colors.borderRole.subtle }]}>
                   <Text style={[styles.previewName, { color: colors.textRole.primary }]}>{link.domainName}</Text>
                   <Text style={[styles.previewType, { color: colors.accentRole.action }]}>{relationshipLabel(link.matchType)}</Text>
                   <Text style={[styles.body, { color: colors.textRole.secondary }]}>{relationshipCopy(link.matchType)}</Text>
                 </View>
               )) : <Text style={[styles.body, { color: colors.textRole.muted }]}>Career connections are not available for this programme yet.</Text>}
               {previewDomains.length ? (
                 <TouchableOpacity
                   onPress={onContinueCareer}
                   style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}
                 >
                    <Text style={styles.primaryText}>Continue</Text>
                 </TouchableOpacity>
               ) : null}
             </View>
           ) : (
             <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
               <SectionLabel>Choose a university before domain guidance</SectionLabel>
               <Text style={[styles.body, { color: colors.textRole.secondary }]}>Review the universities offering this programme, choose one, and then continue to the domains, subgroups and roles connected to that university-aware programme.</Text>
               <TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
                 <Text style={styles.primaryText}>Choose a university</Text>
               </TouchableOpacity>
             </View>
           )}
        </View>
      ) : null}

      {tab === "requirements" ? (
        <View style={styles.section}>
          {!selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <SectionLabel>Choose a university first</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>The national and university-specific requirements will appear after you choose and open a university offering. This prevents requirements from one university being confused with another.</Text>
              <TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
                <Text style={styles.primaryText}>Choose a university</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.block, { marginTop: Spacing.md }]}>
              <SectionLabel>National programme requirements</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>These requirements belong to the selected JAMB programme. The university details below are specific to {selectedSchool.schoolName}.</Text>
              {requirementCards.map((card) => (
                <View key={card.field} style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <View style={styles.requirementTitle}>
                    <Feather name={card.icon} size={14} color={colors.accentRole.action} />
                    <Text style={[styles.label, { color: colors.textRole.primary }]}>{card.label}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayRequirement(card.field, card.value)}</Text>
                </View>
              ))}
              <DataSourceBadge verification="inferred" source="JAMB brochure" style={{ alignSelf: "flex-start" }} />
              <SectionLabel>This university&apos;s requirements</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>
                These details belong only to {selectedSchool.schoolName}. They do not replace the national programme requirements above.
              </Text>
              {universityRequirementCards.map((card) => (
                <View key={card.field} style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <View style={styles.requirementTitle}>
                    <Feather name={card.icon} size={14} color={colors.accentRole.action} />
                    <Text style={[styles.label, { color: colors.textRole.primary }]}>{card.label}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>
                    {card.value ? displayRequirement(card.field, card.value) : "No additional university-specific requirement is recorded."}
                  </Text>
                </View>
              ))}
              {selectedSchool.universityNote ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.label, { color: colors.textRole.primary }]}>Additional university note</Text>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{selectedSchool.universityNote}</Text>
                </View>
              ) : null}
              {selectedSchool.address ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.label, { color: colors.textRole.primary }]}>University address</Text>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{selectedSchool.address}</Text>
                </View>
              ) : null}
              {selectedSchool.hasUniversityException ? (
                <Text style={[styles.body, { color: colors.textRole.muted }]}>Some university-specific wording may still need confirmation. Check the university&apos;s current admission notice before applying.</Text>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {tab === "schools" ? (
        <View style={styles.section}>
          <SectionLabel>Universities offering this programme</SectionLabel>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>Choose one university to keep its programme name, address and requirements in your guidance path.</Text>
          <View style={resp.isDesktop ? styles.schoolGrid : styles.schoolList}>
            {schools.map((school) => (
              <View key={school.schoolId} style={[styles.school, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                <View style={styles.schoolCopy}>
                  <Text style={[styles.schoolName, { color: colors.textRole.primary }]}>{school.schoolName}</Text>
                  {school.studentName || school.jambName ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{school.studentName ?? school.jambName}</Text> : null}
                  {school.address ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{school.address}</Text> : null}
                  {school.hasUniversityException ? <Text style={[styles.meta, { color: colors.accentRole.action }]}>University-specific admission note available</Text> : null}
                </View>
                <TouchableOpacity onPress={() => onSelectSchool(school)} style={[styles.secondaryButton, { borderColor: selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.borderRole.subtle }]}>
                  <Text style={[styles.secondaryText, { color: selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.textRole.primary }]}>{savingSchool === school.schoolId ? "Saving..." : selectedSchoolId === school.schoolId ? "Selected" : "Choose"}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {!schools.length ? <Text style={[styles.body, { color: colors.textRole.muted }]}>No university offering is available for this programme yet.</Text> : null}
          {notice ? <Text style={[styles.notice, { color: colors.textRole.secondary }]}>{notice}</Text> : null}
        </View>
      ) : null}

      {tab === "career" ? (
        <View style={styles.section}>
          <SectionLabel>Career guidance</SectionLabel>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>Explore the domains connected to this programme, then open a domain to see its subgroups, roles and source-backed resources.</Text>
          {orderedDomains.map((link) => (
            <TouchableOpacity key={link.domainId} onPress={() => exploreNav.domain(router, link.domainId, guidanceStudentId, focusedGuidance)} style={[styles.preview, { borderColor: colors.borderRole.subtle }]}>
              <Text style={[styles.previewName, { color: colors.textRole.primary }]}>{link.domainName}</Text>
              <Text style={[styles.previewType, { color: colors.accentRole.action }]}>{relationshipLabel(link.matchType)}</Text>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{relationshipCopy(link.matchType)}</Text>
              <Text style={[styles.link, { color: colors.accentRole.action }]}>Open domain guidance →</Text>
            </TouchableOpacity>
          ))}
          {!data.domains?.length ? <Text style={[styles.body, { color: colors.textRole.muted }]}>Career connections are not available for this programme yet.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { marginTop: Spacing.md },
  content: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.md },
  block: { gap: Spacing.sm },
  award: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  context: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: 3 },
  contextLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.7 },
  contextName: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  contextAddress: { fontSize: FontSize.sm },
  preview: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: 4 },
  previewName: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  previewType: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  primaryButton: { alignSelf: "flex-start", borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  primaryText: { color: "#fff", fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  requirement: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  requirementTitle: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  label: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  schoolList: { gap: Spacing.sm },
  schoolGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  school: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, flex: 1, minWidth: 260 },
  schoolCopy: { flex: 1, gap: 3 },
  schoolName: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  secondaryButton: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 7 },
  secondaryText: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  notice: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  link: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
});
