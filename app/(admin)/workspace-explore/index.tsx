import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import { CompassFonts, Spacing, useTheme } from "@/theme";
import type { EducatorProfile } from "@/types/institution";
import AdminExplorePage, { type AdminScope } from "@/screens/admin/AdminExplorePage";
import { parseExploreQuery } from "@/lib/exploreQuery";

/**
 * Separate administrator catalogue landing inside the persistent admin shell.
 * It shares the route/data primitives with student Explore, not its page
 * composition or audience-specific actions. Query and scope seed the workbench.
 */
export default function AdminExploreRoute() {
  const params = useLocalSearchParams<{ q?: string | string[]; scope?: string | string[] }>();
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

  const initialQueryState = parseExploreQuery(params);
  const supportedScopes: readonly AdminScope[] = ["all", "programmes", "universities", "domains", "areas", "roles", "skills", "tools", "certifications"];
  const initialScope: AdminScope = supportedScopes.includes(initialQueryState.scope as AdminScope) ? initialQueryState.scope as AdminScope : "all";
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
  return <AdminExplorePage profile={profile} initialQuery={initialQueryState.text} initialScope={initialScope} />;
}
