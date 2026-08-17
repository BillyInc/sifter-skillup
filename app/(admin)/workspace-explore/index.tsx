import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ExploreScreen from "@/screens/ExploreScreen";
import { AdminExploreIntro } from "@/screens/admin/AdminExploreIntro";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { adminAudienceForProfile, type AdminAudience } from "@/lib/adminAudience";
import { useAuth } from "@/hooks/useAuth";
import type { EducatorProfile } from "@/types/institution";

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

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then(
      (p) => {
        if (active) setProfile(p);
      },
      () => {
        // Framing only. A failed profile read must not blank the catalogue,
        // and must not surface as an unhandled rejection.
        if (active) setProfile(null);
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id]);

  const audience: AdminAudience = adminAudienceForProfile(profile);

  return (
    <ExploreScreen
      initialQuery={readParam(params.q)}
      adminAudience={audience}
      adminType={profile?.organizationType}
      heading={
        profile?.organizationType === "university"
          ? "Review programmes,\ndomains and peers"
          : profile?.organizationType === "tutorial_centre" || profile?.organizationType === "jamb_cafe"
            ? "Guide JAMB students\nfrom skills to routes"
          : "Guide a student through\nsubjects and programmes"
      }
      intro={
        <AdminExploreIntro
          audience={audience}
          providerSessionOnly={Boolean(profile?.providerSessionOnly)}
        />
      }
    />
  );
}
