import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme, CompassFonts, FontSize, Radius, Spacing } from "@/theme";
import { careerData } from "@/lib/careerData";
import { getStartingPoint } from "@/lib/startingPoint";
import { useAuth } from "@/hooks/useAuth";
import { adminLearnerAudienceForOrg } from "@/lib/adminLearnerAudience";
import type { DataState, SkillDiscoveryResult } from "@/types/career";
import { SectionLabel } from "./index";

type Intent = "learned" | "intended";

function labelForIntent(intent: Intent) {
  return intent === "learned" ? "Already learned" : "I want to learn";
}

function EvidenceChips({ values, color }: { values: string[]; color: string }) {
  if (!values.length) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs }}>
      {values.map((value) => (
        <View key={value} style={{ borderWidth: 1, borderColor: color, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 }}>
          <Text style={{ color, fontSize: FontSize.xs }}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function MatchMeta({ score, label, explanation, color }: { score: number; label: string; explanation?: string; color: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[CompassFonts.data, { color, fontSize: FontSize.xs, fontWeight: "800" }]}>
        {score ? `${Math.round(score * 100)}% · ` : ""}{label}
      </Text>
      {explanation ? <Text style={{ color, fontSize: FontSize.xs }}>{explanation}</Text> : null}
    </View>
  );
}

function GapList({ values, intent, color, admin }: { values: string[]; intent: Intent; color: string; admin?: boolean }) {
  if (!values.length) return null;
  return (
    <View style={{ gap: Spacing.xs }}>
      <Text style={{ color, fontSize: FontSize.xs, fontWeight: "800" }}>
        {admin ? "Guidance gaps" : intent === "learned" ? "Gaps to build" : "Additional competencies"}
      </Text>
      <EvidenceChips values={values} color={color} />
    </View>
  );
}

export interface SkillDiscoveryPanelProps {
  /** Organisation type drives the lens for admin users. */
  adminType?: string | null;
}

export function SkillDiscoveryPanel({ adminType }: SkillDiscoveryPanelProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const adminAudience = adminLearnerAudienceForOrg(adminType);
  const isAdmin = Boolean(adminAudience);
  const [userType, setUserType] = useState<string | undefined>();
  const [adminLearnerType, setAdminLearnerType] = useState<string | undefined>();
  const [intent, setIntent] = useState<Intent>("learned");
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [match, setMatch] = useState<"both" | "either">("both");
  const [category, setCategory] = useState<string | undefined>();
  const [state, setState] = useState<DataState<SkillDiscoveryResult> | null>(null);
  const [expanded, setExpanded] = useState(false);

  const effectiveUserType = isAdmin
    ? adminLearnerType ?? adminAudience?.learnerTypes[0]
    : userType;

  useEffect(() => {
    if (!adminAudience) return;
    setAdminLearnerType((current) =>
      current && adminAudience.learnerTypes.includes(current as never)
        ? current
        : adminAudience.learnerTypes[0],
    );
  }, [adminAudience]);

  useEffect(() => {
    if (adminType || !user?.id) return;
    let active = true;
    getStartingPoint(user.id).then((profile) => {
      if (active) setUserType(profile?.userType ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [adminType, user?.id]);

  useEffect(() => {
    if (!expanded) return;
    let active = true;
    const timer = setTimeout(() => {
      careerData.discoverBySkills({
        skills: selected,
        match,
        category,
        userType: effectiveUserType,
        adminType: adminType ?? undefined,
      }).then((next) => {
        if (active) setState(next);
      });
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [adminType, category, effectiveUserType, expanded, match, selected]);

  const audienceCopy = useMemo(() => {
    if (adminType === "university") return "Map skills to undergraduate curriculum domains, subgroups, roles and credentials.";
    if (adminType === "tutorial_centre" || adminType === "jamb_cafe") return "Find the skills, tools and credentials to discuss in a JAMB student session.";
    if (adminType === "secondary_school") return "Use a student's skills to guide the next subject and career step.";
    if (userType === "skilled_worker" || userType === "professional" || userType === "graduate") return "Map what you know to adjacent fields and the competencies that would strengthen each route.";
    return "Search skills, tools, frameworks or certifications and see what they can unlock.";
  }, [adminType, userType]);

  const addSkillValue = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value || selected.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setSelected((current) => [...current, value]);
    setDraft("");
    setExpanded(true);
  };

  const addSkill = () => addSkillValue(draft);

  const removeSkill = (value: string) => setSelected((current) => current.filter((item) => item !== value));
  const data = state?.status === "real" ? state.data : null;

  return (
    <View style={{ gap: Spacing.md }}>
      <TouchableOpacity
        onPress={() => setExpanded((current) => !current)}
        activeOpacity={0.8}
        style={{ borderWidth: 1, borderColor: colors.borderRole.subtle, borderRadius: Radius.lg, padding: Spacing.md, backgroundColor: colors.surface.raised, gap: Spacing.xs }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[CompassFonts.bodyBold, { color: colors.textRole.primary, fontSize: FontSize.md }]}>Match a skill</Text>
          <Text style={{ color: colors.accentRole.action, fontWeight: "800" }}>{expanded ? "Hide" : "Open"}</Text>
        </View>
        <Text style={{ color: colors.textRole.muted, fontSize: FontSize.sm }}>{audienceCopy}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={{ gap: Spacing.md }}>
          {isAdmin ? (
            <View style={{ gap: Spacing.xs }}>
              <SectionLabel>Guiding student type</SectionLabel>
              <View style={{ flexDirection: "row", gap: Spacing.xs, flexWrap: "wrap" }}>
                {(adminAudience?.learnerTypes ?? []).map((item) => (
                  <TouchableOpacity key={item} onPress={() => setAdminLearnerType(item)} style={{ borderWidth: 1, borderColor: adminLearnerType === item ? colors.accentRole.action : colors.borderRole.subtle, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: adminLearnerType === item ? colors.accentRole.action : colors.surface.raised }}>
                    <Text style={{ color: adminLearnerType === item ? colors.textRole.inverse : colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "700" }}>{item === "undergraduate" ? "Undergraduate" : item.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
          <View style={{ flexDirection: "row", gap: Spacing.xs, flexWrap: "wrap" }}>
            {(["learned", "intended"] as Intent[]).map((item) => (
              <TouchableOpacity key={item} onPress={() => setIntent(item)} style={{ borderWidth: 1, borderColor: intent === item ? colors.textRole.primary : colors.borderRole.subtle, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: intent === item ? colors.textRole.primary : "transparent" }}>
                <Text style={{ color: intent === item ? colors.textRole.inverse : colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "700" }}>{labelForIntent(item)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          )}

          <View style={{ gap: Spacing.xs }}>
            <Text style={{ color: colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "800" }}>How should skills match?</Text>
            <Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>Match all requires every selected skill in the same result. Match any shows results containing at least one selected skill.</Text>
            <View style={{ flexDirection: "row", gap: Spacing.xs, flexWrap: "wrap" }}>
              {(["both", "either"] as const).map((option) => (
                <TouchableOpacity key={option} onPress={() => setMatch(option)} style={{ borderWidth: 1, borderColor: match === option ? colors.accentRole.action : colors.borderRole.subtle, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: match === option ? colors.accentRole.action : colors.surface.raised }}>
                  <Text style={{ color: match === option ? colors.textRole.inverse : colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "700" }}>{option === "both" ? "Match all" : "Match any"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addSkill}
              placeholder="Add a skill, tool, framework or certification"
              placeholderTextColor={colors.textRole.muted}
              style={{ flex: 1, borderWidth: 1, borderColor: colors.borderRole.subtle, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, color: colors.textRole.primary, backgroundColor: colors.surface.base }}
            />
            <TouchableOpacity onPress={addSkill} style={{ borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: colors.accentRole.action }}>
              <Text style={{ color: colors.textRole.inverse, fontWeight: "800" }}>Match skill</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: Spacing.xs }}>
            <Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs, fontWeight: "800" }}>Quick searches</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs }}>
              {["Python", "Excel", "Communication", "Data analysis"].map((example) => (
                <TouchableOpacity key={example} onPress={() => addSkillValue(example)} style={{ borderWidth: 1, borderColor: colors.borderRole.subtle, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5, backgroundColor: colors.surface.raised }}>
                  <Text style={{ color: colors.accentRole.action, fontSize: FontSize.xs, fontWeight: "700" }}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selected.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>Selected ({selected.length})</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs }}>
                {selected.map((item) => (
                  <TouchableOpacity key={item} onPress={() => removeSkill(item)} style={{ flexDirection: "row", gap: Spacing.xs, alignItems: "center", borderWidth: 1, borderColor: colors.accentRole.action, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 }}>
                    <Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs }}>{item}</Text>
                    <Text style={{ color: colors.accentRole.action, fontWeight: "900" }}>×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {data?.categories?.length ? (
            <View style={{ gap: Spacing.xs }}>
              <SectionLabel>Browse categories</SectionLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
                <TouchableOpacity onPress={() => setCategory(undefined)} style={{ borderWidth: 1, borderColor: !category ? colors.textRole.primary : colors.borderRole.subtle, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5 }}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs }}>All</Text></TouchableOpacity>
                {data.categories.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} style={{ borderWidth: 1, borderColor: category === item ? colors.textRole.primary : colors.borderRole.subtle, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5 }}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs }}>{item}</Text></TouchableOpacity>)}
              </ScrollView>
            </View>
          ) : null}

          {state?.status === "pending" || state?.status === "coming_soon" ? <ActivityIndicator color={colors.accentRole.action} /> : null}
          {data ? <SkillResults data={data} intent={intent} colors={colors} admin={isAdmin} onAdd={addSkillValue} /> : null}
          {state?.meta?.notice && !data ? <Text style={{ color: colors.textRole.muted, fontSize: FontSize.sm }}>{state.meta.notice}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function SkillResults({ data, intent, colors, admin, onAdd }: { data: SkillDiscoveryResult; intent: Intent; colors: ReturnType<typeof useTheme>["colors"]; admin?: boolean; onAdd: (value: string) => void }) {
  const hasTerms = data.terms.length > 0;
  return (
    <View style={{ gap: Spacing.md }}>
      {hasTerms ? <Text style={{ color: colors.textRole.muted, fontSize: FontSize.sm }}>Results update as you add or remove skills. Match scores show how closely each item maps to the current selection.</Text> : <Text style={{ color: colors.textRole.muted, fontSize: FontSize.sm }}>Choose a category or add a skill to start mapping the graph.</Text>}
      {hasTerms && data.suggestedNext?.length ? <View style={{ gap: Spacing.xs }}>
        <SectionLabel>Possible next steps</SectionLabel>
        <Text style={{ color: colors.textRole.muted, fontSize: FontSize.sm }}>These are source-backed options connected to what you entered. Add one to refine the route.</Text>
        {data.suggestedNext.slice(0, 8).map((item) => <TouchableOpacity key={`${item.contextKey}-${item.name}`} onPress={() => onAdd(item.name)} style={{ borderWidth: 1, borderColor: colors.borderRole.subtle, borderRadius: Radius.md, padding: Spacing.sm, backgroundColor: colors.surface.raised }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm }}><Text style={{ color: colors.textRole.primary, fontWeight: "800", flex: 1 }}>{item.name}</Text><Text style={{ color: colors.accentRole.action, fontWeight: "800" }}>Add</Text></View>
          <Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>{item.why}</Text>
        </TouchableOpacity>)}
      </View> : null}
      {data.domains.map((item) => (
        <View key={item.id} style={{ borderWidth: 1, borderColor: colors.borderRole.subtle, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, backgroundColor: colors.surface.raised }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm }}><Text style={[CompassFonts.bodyBold, { color: colors.textRole.primary, flex: 1 }]}>{item.name}</Text><MatchMeta score={item.matchScore} label={item.matchLabel} explanation={item.matchExplanation} color={colors.accentRole.action} /></View>
          {item.cluster ? <Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>{item.cluster}</Text> : null}
          <EvidenceChips values={item.matchedSkills} color={colors.accentRole.success} />
          <GapList values={item.gaps} intent={intent} color={colors.textRole.muted} admin={admin} />
        </View>
      ))}
      {data.subgroups.length ? <SectionLabel>Subgroups</SectionLabel> : null}
      {data.subgroups.map((item) => <View key={item.id} style={{ gap: Spacing.xs }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.textRole.primary, fontWeight: "800" }}>{item.name ?? "Unnamed subgroup"}</Text><MatchMeta score={item.matchScore} label={item.matchLabel} explanation={item.matchExplanation} color={colors.accentRole.action} /></View><Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>{item.domainName}</Text><EvidenceChips values={item.matchedSkills} color={colors.accentRole.success} /><GapList values={item.gaps} intent={intent} color={colors.textRole.muted} admin={admin} /></View>)}
      {data.roles.length ? <SectionLabel>Roles</SectionLabel> : null}
      {data.roles.map((item) => <View key={item.key ?? item.name} style={{ gap: Spacing.xs }}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.textRole.primary, fontWeight: "800", flex: 1 }}>{item.name ?? "Unnamed role"}</Text><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></View><Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>{item.domainName}</Text><EvidenceChips values={item.matchedSkills} color={colors.accentRole.success} /><GapList values={item.gaps} intent={intent} color={colors.textRole.muted} admin={admin} /></View>)}
      {data.tools.length ? <SectionLabel>Tools and frameworks</SectionLabel> : null}
      {data.tools.map((item) => <View key={`${item.domainId}-${item.name}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm }}><Text style={{ color: colors.textRole.primary, flex: 1 }}>{item.name ?? "Unnamed tool"} · {item.domainName}</Text><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></View>)}
      {data.certifications.length ? <SectionLabel>Certifications</SectionLabel> : null}
      {data.certifications.map((item) => <View key={`${item.domainId}-${item.name}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm }}><Text style={{ color: colors.textRole.primary, flex: 1 }}>{item.name ?? "Unnamed certification"} · {item.domainName}</Text><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></View>)}
    </View>
  );
}

export default SkillDiscoveryPanel;
