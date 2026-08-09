import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import ExploreScreen from "@/screens/ExploreScreen";
import { AdminExploreIntro } from "@/screens/admin/AdminExploreIntro";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { adminAudienceForProfile, type AdminAudience } from "@/lib/adminAudience";
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
  const [profile, setProfile] = useState<EducatorProfile | null>(null);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then(
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
  }, []);

  const audience: AdminAudience = adminAudienceForProfile(profile);

  return (
    <ExploreScreen
      initialQuery={readParam(params.q)}
      heading={
        audience === "university"
          ? "Search the national\nprogramme map"
          : "Look up a programme,\nfield or role"
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
