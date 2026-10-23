/**
 * AccountTypeGate - the first fork in onboarding.
 *
 * 6 large selectable persona cards (BRIEF: "Account-type gate - 6 large
 * selectable persona cards with photography"). Student personas drop into
 * OnboardingFlow's setup steps. Educators get the institutional
 * EducatorOnboarding flow.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { OnboardingBackGuard } from "@/components/onboarding/OnboardingBackGuard";
import { SifterButton } from "@/components/ui";
import OnboardingFlow from "@/screens/OnboardingFlow";
import EducatorOnboarding from "@/screens/admin/EducatorOnboarding";
import type { StartingPointProfile, UserType } from "@/types/onboarding";
import { useAuth } from "@/hooks/useAuth";
import { clearOnboardingDraft, getOnboardingDraft, saveOnboardingDraft } from "@/lib/onboardingDraft";
import { FlowCue } from "@/components/guidance/FlowCue";
import { startingPointCue } from "@/lib/studentFlowCopy";

type Choice =
  | "ss1_secondary"
  | "ss2_secondary"
  | "ss3_secondary"
  | "jamb"
  | "student"
  | "educator";

const PERSONAS: {
  type: Choice;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  userType?: UserType;
  preset?: Partial<StartingPointProfile>;
}[] = [
  {
    type: "ss1_secondary",
    icon: "map",
    title: "SS1 Student",
    subtitle: "School, stream, and subjects. Next is a programme preview, then universities.",
    userType: "senior_secondary",
    preset: { userType: "senior_secondary", ssClass: "ss1" },
  },
  {
    type: "ss2_secondary",
    icon: "map",
    title: "SS2 Student",
    subtitle: "Check subjects before SS3. Next is a programme preview, then universities.",
    userType: "senior_secondary",
    preset: { userType: "senior_secondary", ssClass: "ss2" },
  },
  {
    type: "ss3_secondary",
    icon: "book",
    title: "SS3 Student",
    subtitle: "Choose subjects, a programme, or both. A university shows its own requirements.",
    userType: "ss3_secondary",
    preset: { userType: "ss3_secondary", ssClass: "ss3" },
  },
  {
    type: "jamb",
    icon: "book-open",
    title: "JAMB Candidate",
    subtitle: "Same three choices as SS3, from a tutorial centre or on your own.",
    userType: "jamb",
    preset: { userType: "jamb" },
  },
  {
    type: "student",
    icon: "users",
    title: "Undergraduate Student",
    subtitle: "Your university and programme. Next is what it teaches and where it can lead.",
    userType: "student",
    preset: { userType: "student", institutionType: "university" },
  },
  {
    type: "educator",
    icon: "home",
    title: "Educator / Institution",
    subtitle: "Guide students from a school, university or tutorial centre",
  },
];

const ALLOWED_CHOICES = new Set<Choice>(PERSONAS.map((p) => p.type));

export default function AccountTypeGate() {
  const { colors } = useTheme();
  const resp = useResponsive();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ restart?: string }>();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [flowChoice, setFlowChoice] = useState<Choice | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<Partial<StartingPointProfile> | null>(null);

  useEffect(() => {
    let active = true;
    if (params.restart === "1") {
      void clearOnboardingDraft(user?.id);
      setChoice(null);
      setFlowChoice(null);
      setSelectedProfile(null);
      return () => { active = false; };
    }
    getOnboardingDraft(user?.id).then((draft) => {
      if (!active || !draft?.choice) return;
      if (ALLOWED_CHOICES.has(draft.choice as Choice)) {
        setChoice(draft.choice as Choice);
        setFlowChoice(draft.choice as Choice);
        setSelectedProfile(draft.studentProfile ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [params.restart, user?.id]);

  const choose = (next: Choice) => {
    const persona = PERSONAS.find((p) => p.type === next);
    const profile = persona?.preset ?? null;
    setChoice(next);
    setSelectedProfile(profile);
    setPickerOpen(false);
  };

  const continueWithChoice = () => {
    if (!choice) return;
    setFlowChoice(choice);
    saveOnboardingDraft({
      userId: user?.id,
      mode: choice === "educator" ? "educator" : "student",
      choice,
      step: 1,
      studentProfile: selectedProfile ?? undefined,
    }).catch(() => {});
  };

  const backToChoices = () => {
    setChoice(null);
    setFlowChoice(null);
    setSelectedProfile(null);
    setPickerOpen(false);
    void clearOnboardingDraft(user?.id);
  };

  if (flowChoice === "educator") return <EducatorOnboarding onBackToChoices={backToChoices} />;
  if (flowChoice) {
    const persona = PERSONAS.find((p) => p.type === flowChoice);
    return (
      <OnboardingFlow
        initialPersona={(persona?.userType ?? flowChoice) as UserType}
        initialProfile={selectedProfile ?? persona?.preset}
        onBackToChoices={backToChoices}
      />
    );
  }

  const selectedPersona = PERSONAS.find((p) => p.type === choice);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingBackGuard />

      <View style={[styles.content, resp.isDesktop && styles.contentDesktop]}>
        <Text
          style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}
        >
          Choose your starting point
        </Text>
        <Text
          style={[styles.sub, { color: colors.textRole.secondary }, CompassFonts.body]}
        >
          This decides which questions, requirements and guidance you will see next.
          Choose the path that describes you today.
        </Text>
        <FlowCue {...startingPointCue(choice)} />

        <Text style={[styles.fieldLabel, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>
          I am joining as
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ expanded: pickerOpen }}
          onPress={() => setPickerOpen(true)}
          style={[
            styles.selector,
            {
              backgroundColor: colors.surface.raised,
              borderColor: choice ? colors.accentRole.action : colors.borderRole.subtle,
            },
          ]}
        >
          <View style={styles.selectorIcon}>
            <Feather
              name={selectedPersona?.icon ?? "user"}
              size={20}
              color={colors.accentRole.action}
            />
          </View>
          <View style={styles.selectorCopy}>
            <Text style={[styles.selectorValue, { color: choice ? colors.textRole.primary : colors.textRole.placeholder }, CompassFonts.bodyBold]}>
              {selectedPersona?.title ?? "Select your user type"}
            </Text>
            <Text style={[styles.selectorHint, { color: colors.textRole.muted }]}>
              {selectedPersona?.subtitle ?? "We will tailor the next questions to your path."}
            </Text>
          </View>
          <Feather name="chevron-down" size={18} color={colors.textRole.muted} />
        </TouchableOpacity>

        {selectedPersona ? (
          <View style={[styles.lockNote, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Feather name="info" size={16} color={colors.accentRole.action} />
            <Text style={[styles.lockNoteText, { color: colors.textRole.secondary }]}>
              Continue to lock this guidance path. You can only choose a different path by returning here and starting that path again.
            </Text>
          </View>
        ) : null}

        <SifterButton
          label="Continue"
          onPress={continueWithChoice}
          disabled={!choice}
          variant="track"
          color={colors.accentRole.action}
          size="lg"
          fullWidth
        />
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setPickerOpen(false)}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => undefined}
            style={[styles.modalSheet, { backgroundColor: colors.surface.raised }]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
                  Choose your path
                </Text>
                <Text style={[styles.modalSub, { color: colors.textRole.muted }]}>
                  Select one option. The next screen will be built around it.
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close user type choices"
                onPress={() => setPickerOpen(false)}
                hitSlop={10}
              >
                <Feather name="x" size={20} color={colors.textRole.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalOptions}>
              {PERSONAS.map((p) => {
                const selected = choice === p.type;
                return (
                  <TouchableOpacity
                    key={p.type}
                    activeOpacity={0.85}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => choose(p.type)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected ? colors.surface.subtle : colors.surface.raised,
                        borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle,
                      },
                    ]}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: colors.surface.subtle }]}>
                      <Feather name={p.icon} size={19} color={colors.accentRole.action} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={[styles.optionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                        {p.title}
                      </Text>
                      <Text style={[styles.optionSub, { color: colors.textRole.muted }]}>
                        {p.subtitle}
                      </Text>
                    </View>
                    <Feather
                      name={selected ? "check-circle" : "circle"}
                      size={19}
                      color={selected ? colors.accentRole.action : colors.textRole.muted}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  content: { gap: Spacing.md },
  contentDesktop: { maxWidth: 680, alignSelf: "center", width: "100%" },
  fieldLabel: { fontSize: FontSize.sm },
  selector: {
    minHeight: 76,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  selectorIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorCopy: { flex: 1, gap: 3 },
  selectorValue: { fontSize: FontSize.md },
  selectorHint: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  lockNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  lockNoteText: { flex: 1, fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  modalSheet: {
    width: "100%",
    maxHeight: "86%",
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  modalTitle: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.2 },
  modalSub: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45, marginTop: 4 },
  modalOptions: { gap: Spacing.sm, paddingBottom: Spacing.lg },
  option: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: { fontSize: FontSize.sm },
  optionSub: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
});

