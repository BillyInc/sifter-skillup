"""Static acceptance checks for the student/admin career rendering boundary.

This audit deliberately stays at the client boundary.  It does not read or
write Supabase, generated seeds, SQL, or browser state.  Admin loaders must
retain the raw career-data methods, while student routes must use the
sanitised loaders and the student-safe link guard.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]


def source(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def check_student_loaders_are_sanitised() -> None:
    expected = {
        "src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx": "getProgrammeForStudent",
        "src/screens/careerIntelligence/DomainDetailScreen.tsx": "getDomainV2ForStudent",
        "src/screens/careerIntelligence/SubgroupDetailScreen.tsx": "getSubgroupV2ForStudent",
        "src/screens/careerIntelligence/RoleDetailScreen.tsx": "getRoleV2ForStudent",
    }
    for path, loader in expected.items():
        text = source(path)
        assert loader in text, f"student route {path} must use {loader}"


def check_admin_loader_keeps_raw_evidence() -> None:
    text = source("src/screens/admin/AdminCareerDetailScreen.tsx")
    for loader in ("careerData.getProgramme(id)", "careerData.getDomainV2(id)", "careerData.getRoleV2(id)"):
        assert loader in text, f"admin route must retain raw loader: {loader}"
    assert "ADMIN CATALOGUE VIEW" in text
    assert "O*NET essential-skill evidence" in text
    assert 'audience="admin"' in text
    assert "role.workProfile.sourceLinks" in text


def check_student_link_boundary_and_no_link_state() -> None:
    boundary = source("src/lib/studentCareerBoundary.ts")
    guard = source("src/components/careerIntelligence/ExternalLinkGuard.tsx")
    work = source("src/components/careerIntelligence/RoleWorkEvidenceBlock.tsx")
    assert "onetonline.org" in boundary and "onetcenter.org" in boundary
    assert "studentSafeUrl(value)" in guard
    assert "studentSourceLinks" in work
    assert "No verified student link is attached to this work evidence yet." in work
    assert 'if (item.linkState === "review_required") return null;' in boundary
    assert 'cleaned.linkState = "no_link"' in boundary
    assert 'item.linkState === "linked"' in boundary


def check_role_item_state_controls_legacy_arrays() -> None:
    boundary = source("src/lib/studentCareerBoundary.ts")
    role = source("src/screens/careerIntelligence/RoleDetailScreen.tsx")
    assert "cleaned.essentialSkillUris" in boundary
    assert "cleaned.optionalSkillUris" in boundary
    assert "cleaned.tools" in boundary
    assert "cleaned.certifications" in boundary
    assert "studentSafeUrl" in role
    assert "cert.officialUrl || resource?.url" in role


def check_student_career_components_do_not_open_urls_directly() -> None:
    roots = (
        ROOT / "src/components/careerIntelligence",
        ROOT / "src/screens/careerIntelligence",
    )
    violations = []
    for root in roots:
        for path in root.rglob("*.tsx"):
            if path.name == "ExternalLinkGuard.tsx":
                continue
            text = path.read_text(encoding="utf-8")
            if "Linking.openURL" in text:
                violations.append(path.relative_to(ROOT).as_posix())
    assert not violations, "student career renderers must use ExternalLinkGuard: " + ", ".join(violations)


def run() -> None:
    checks = (
        check_student_loaders_are_sanitised,
        check_admin_loader_keeps_raw_evidence,
        check_student_link_boundary_and_no_link_state,
        check_role_item_state_controls_legacy_arrays,
        check_student_career_components_do_not_open_urls_directly,
    )
    for check in checks:
        check()
        print(f"PASS {check.__name__}")


if __name__ == "__main__":
    run()
