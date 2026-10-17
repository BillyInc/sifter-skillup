import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, FoundationSkill, ProgrammeDomainConnection } from "@/types/career";
import { additiveStageItems, domainStageItems } from "@/lib/cumulativeLearningPath";
import { SectionLabel } from "./RedesignPrimitives";

type Props = {
  programmeName?: string | null;
  connection?: ProgrammeDomainConnection | null;
  domainName: string;
  subgroupName?: string | null;
  roleName?: string | null;
  domainId?: string | null;
  domainHasAreas?: boolean;
  domainFoundation?: FoundationSkill[];
  domainItems?: CareerContextItem[];
  subgroupItems?: CareerContextItem[];
  roleItems?: CareerContextItem[];
};

function Stage({ title, text, compulsoryCount, optionalCount }: { title: string; text?: string; compulsoryCount?: number; optionalCount?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stage, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text style={[styles.stageTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>
      {text ? <Text style={[styles.stageText, { color: colors.textRole.secondary }]}>{text}</Text> : null}
      {compulsoryCount !== undefined ? <Text style={[styles.stageText, { color: colors.textRole.secondary }]}>{compulsoryCount ? `${compulsoryCount} compulsory learning ${compulsoryCount === 1 ? "item continues or is added" : "items continue or are added"} at this stage. These items are part of the selected route's required learning, not a claim that every learner in the field needs the same role-specific preparation.` : "No additional compulsory learning item is recorded at this stage. The earlier selected learning still provides the route context."}</Text> : null}
      {optionalCount ? <View style={[styles.optionalNote, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.optionalTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Optional useful edges</Text><Text style={[styles.stageText, { color: colors.textRole.secondary }]}>{`${optionalCount} optional ${optionalCount === 1 ? "choice can support" : "choices can support"} particular tasks or interests. They stay outside the compulsory path, so you can continue without selecting them. Add one only when its described use fits the route you want to explore.`}</Text></View> : null}
    </View>
  );
}

/** Shows the inherited-to-added route without duplicating a flat skills list. */
export function GuidanceContinuation({ programmeName, connection, domainName, domainId, domainHasAreas = false, subgroupName, roleName, domainFoundation, domainItems, subgroupItems, roleItems }: Props) {
  const { colors } = useTheme();
  // Course codes remain provenance/API data; the learner-facing route uses
  // the course title only, because codes are not consistent across universities.
  const programmeCourses = (connection?.courseAnchors ?? []).slice(0, 3).map((item) => item.title);
  const transferNarrative = connection?.transferableLearningNarrative?.trim();
  const domainCompulsory = domainStageItems(domainId === "D078" ? [] : domainFoundation, domainItems);
  const domainOptional = additiveStageItems(domainItems, [], "optional");
  const areaCompulsory = subgroupName ? additiveStageItems(subgroupItems, domainCompulsory, "needed") : [];
  const areaOptional = subgroupName ? additiveStageItems(subgroupItems, [...domainCompulsory, ...domainOptional], "optional") : [];
  const inheritedCompulsory = [...domainCompulsory, ...areaCompulsory];
  const inheritedOptional = [...domainOptional, ...areaOptional];
  const roleCompulsory = roleName ? additiveStageItems(roleItems, inheritedCompulsory, "needed") : [];
  const roleOptional = roleName ? additiveStageItems(roleItems, [...inheritedCompulsory, ...inheritedOptional], "optional") : [];
  const hasProgrammeStage = Boolean(programmeName && (connection?.explanation?.trim() || programmeCourses.length || transferNarrative));
  const hasDomainStage = Boolean(domainName);
  const hasSubgroupStage = Boolean(subgroupName);
  const hasRoleStage = Boolean(roleName);
  const hasAny = hasProgrammeStage || hasDomainStage || hasSubgroupStage || hasRoleStage;
  if (!hasAny) return null;
  return (
    <View style={styles.container}>
      <SectionLabel>How this path builds</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>This view follows the learning from your programme into a field, then into an area and role where those routes are supported. Each stage explains what carries forward and what is newly added; optional choices stay separate unless you select them.</Text>
      <View style={styles.grid}>
        {hasProgrammeStage ? (
          <View style={styles.programmeStage}>
            <Stage
              title={connection?.curriculumContextHeading || `What your ${programmeName} programme covers`}
              text={connection?.explanation?.trim() || "This is learning from your programme, not extra learning to select here."}
            />
            {transferNarrative ? (
              <Stage
                title={`How that learning carries into ${domainName}`}
                text={transferNarrative}
              />
            ) : null}
            {programmeCourses.length ? <Stage title="Programme topics connected to this field" text={`The connection is supported by ${programmeCourses.join(", ")}. Course titles are context, not extra selections. The field may ask for learning beyond the programme.`} /> : null}
          </View>
        ) : null}
        {hasDomainStage ? <Stage title="Compulsory domain foundations" text={connection?.domainAddsExplanation || `The domain adds field-wide learning after ${programmeName ? "your programme learning" : "the field overview"}. This is additional preparation for work and study across the domain, not a claim that your programme already taught every item shown here. Optional useful edges remain separate and can be skipped.`} compulsoryCount={domainCompulsory.length} optionalCount={domainOptional.length} /> : null}
        {hasSubgroupStage ? <Stage title={`Compulsory additions for ${subgroupName}`} text="The selected area builds on the compulsory domain path and focuses it on this part of the field. Any optional domain choices you selected remain your choices; opening the area does not add them automatically." compulsoryCount={areaCompulsory.length} optionalCount={areaOptional.length} /> : null}
        {hasRoleStage ? <Stage title={`Compulsory additions for ${roleName}`} text={subgroupName ? `This role adds learning for its supported tasks after the selected domain and area path. The role-specific additions explain what further preparation those tasks call for; they do not replace the earlier learning.` : domainHasAreas ? `This role is supported through one or more areas in this domain. Choose the area route that fits your interest; its context explains which parts of the role draw on that specialization.` : "This role connects directly to a domain that has no area layer. The selected route therefore moves from the domain to the role without implying area-specific learning."} compulsoryCount={roleCompulsory.length} optionalCount={roleOptional.length} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  intro: { fontSize: 16, lineHeight: 24 },
  grid: { flexDirection: "column", gap: Spacing.md },
  programmeStage: { gap: Spacing.sm },
  stage: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.sm, width: "100%" },
  stageTitle: { fontSize: 20, lineHeight: 27 },
  stageText: { fontSize: 16, lineHeight: 24 },
  optionalNote: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  optionalTitle: { fontSize: 18, lineHeight: 25 },
});

export default GuidanceContinuation;
