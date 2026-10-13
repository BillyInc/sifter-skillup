import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import { CompassFonts, Spacing, useTheme } from "@/theme";
import type { EducatorProfile } from "@/types/institution";
import { SecondarySchoolExploreSurface, TutorialCentreExploreSurface, UniversityExploreSurface } from "@/screens/admin/AdminExploreSurfaces";

/**
 * Explore (§5.4) — the full pathways catalogue inside the admin shell.
 *
 * Per the spec: "do not build new screens. Reuse the existing student-facing
 * Explore detail screens inside the admin shell." The screen is the student's,
 * unmodified; only the framing above the search box is audience-specific, and
 * that arrives as the `intro` prop. AdminShell is supplied by the stack layout,
 * not here, so the sidebar survives every push.
 *
 * `?q=` seeds the search — the General Dashboard's search field hands off here.
 */
function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function AdminExploreRoute() {
  const params = useLocalSearchParams<{ q?: string | string[] }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<"pending" | "ready" | "error">("pending");
  const [profileRetry, setProfileRetry] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    let active = true;
    setProfileStatus("pending");
    getEducatorProfile(user?.id).then(
      (p) => {
        if (!active) return;
        setProfile(p);
        setProfileStatus("ready");
      },
      () => {
        if (!active) return;
        setProfile(null);
        setProfileStatus("error");
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id, profileRetry]);

  const initialQuery = readParam(params.q);
  if (profileStatus !== "ready") {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.sm, padding: Spacing.lg }}>
      {profileStatus === "pending" ? <ActivityIndicator color={colors.accentRole.action} /> : null}
      <Text style={[CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>
        {profileStatus === "pending" ? "Loading your organization workspace…" : "We couldn’t load your organization type."}
      </Text>
      {profileStatus === "error" ? <TouchableOpacity accessibilityRole="button" onPress={() => setProfileRetry((value) => value + 1)}>
        <Text style={{ color: colors.accentRole.action }}>Try again</Text>
      </TouchableOpacity> : null}
    </View>;
  }
  if (profile?.organizationType === "university") {
    return <UniversityExploreSurface profile={profile} initialQuery={initialQuery} />;
  }
  if (profile?.organizationType === "tutorial_centre" || profile?.organizationType === "jamb_cafe") {
    return <TutorialCentreExploreSurface profile={profile} initialQuery={initialQuery} />;
  }
  return <SecondarySchoolExploreSurface profile={profile} initialQuery={initialQuery} />;
}
