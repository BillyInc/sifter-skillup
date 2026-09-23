"""Focused static checks for the Sociology student career-intelligence route.

This audit is intentionally narrower than the population/scaling audits.  It
reads only student route sources, does not inspect or modify enrichment
ledgers, and does not claim SQL, browser, or live-payload proof.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]


def source(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def test_student_boundary_is_approval_and_ownership_fail_closed() -> None:
    boundary = source("src/lib/studentCareerBoundary.ts")
    assert "isStudentLearningResource" in boundary
    assert 'resource.reviewStatus !== "approved_guidance_v1"' in boundary
    assert 'resource.ownershipScope !== expectedOwner' in boundary
    assert 'item?.linkState === "review_required" || item?.linkState === "no_link"' in boundary
    assert "const candidates = item" in boundary
    assert "studentResources(programme.resources, \"programme\")" in boundary
    assert "studentResources(domain.resources, \"domain\")" in boundary
    assert "studentResources(subgroup.resources, \"subgroup\")" in boundary
    assert "studentResources(role.resources, \"role\")" in boundary


def test_active_domain_is_partitioned_and_owned() -> None:
    text = source("src/screens/careerIntelligence/DomainDetailScreen.tsx")
    active = text.split("function DomainBody(", 1)[1]
    assert 'isStudentResource(resource, "domain")' in active
    assert active.count("<FoundationSkillsBlock") == 1
    assert 'contextLevel="domain"' in active
    assert "Tools by purpose" in active
    assert "Qualifications and professional routes" in active
    assert "Choose a focused area" in active


def test_subgroup_and_role_continuation_is_not_a_second_inventory() -> None:
    subgroup = source("src/screens/careerIntelligence/SubgroupDetailScreen.tsx")
    active_subgroup = subgroup.split("function SubgroupBody(", 1)[1]
    assert "GuidanceContinuation" in active_subgroup
    assert "contextLevel=\"subgroup\"" in active_subgroup
    assert "What carries over from the domain" not in active_subgroup
    assert 'isStudentResource(resource, "subgroup")' in active_subgroup

    role = source("src/screens/careerIntelligence/RoleDetailScreen.tsx")
    active_role = role.split("function RoleBody(", 1)[1]
    assert "GuidanceContinuation" in active_role
    assert 'isStudentResource(resource, "role")' in active_role
    assert "studentItemLinkUrl(item, resource)" in active_role
    assert "<RolePreparationChain" in active_role
    assert "How the preparation fits together" in role
    assert "programme learning, shared field foundations, area additions, then role practice" in role


def test_student_item_cards_keep_relationships_and_guarded_links() -> None:
    contextual = source("src/components/careerIntelligence/ContextualItemList.tsx")
    tools = source("src/components/careerIntelligence/ToolGroupsBlock.tsx")
    continuation = source("src/components/careerIntelligence/GuidanceContinuation.tsx")
    assert "relationshipStatus === \"source_backed\"" in contextual
    assert "No verified link is available yet." in contextual
    assert "Options recorded for this purpose" in tools
    assert "Alternatives" in tools
    assert "studentItemLinkUrl" in tools
    assert "Shared foundation in" in continuation
    assert "This focused area adds capabilities" in continuation
    assert "This role applies the path" in continuation


def test_no_direct_external_open_in_student_career_surfaces() -> None:
    roots = (
        ROOT / "src/components/careerIntelligence",
        ROOT / "src/screens/careerIntelligence",
    )
    violations = []
    for root in roots:
        for path in root.rglob("*.tsx"):
            if path.name == "ExternalLinkGuard.tsx":
                continue
            if "Linking.openURL" in path.read_text(encoding="utf-8"):
                violations.append(path.relative_to(ROOT).as_posix())
    assert not violations, ", ".join(violations)


def run() -> None:
    checks = (
        test_student_boundary_is_approval_and_ownership_fail_closed,
        test_active_domain_is_partitioned_and_owned,
        test_subgroup_and_role_continuation_is_not_a_second_inventory,
        test_student_item_cards_keep_relationships_and_guarded_links,
        test_no_direct_external_open_in_student_career_surfaces,
    )
    for check in checks:
        check()
        print(f"PASS {check.__name__}")


if __name__ == "__main__":
    run()
