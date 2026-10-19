-- Recompute D078 route-card visibility from each current, source-backed route.
-- A stale persisted false must not permanently hide a route whose evidence is
-- already complete. Conditional routes remain selectable only with their
-- explicit scope condition; this does not promote any role-item candidate.
BEGIN;

UPDATE skillup_dev.career_role_area_routes AS route
SET student_visible = (
    route.data_state = 'source_backed'
    AND NULLIF(BTRIM(route.rationale), '') IS NOT NULL
    AND NULLIF(BTRIM(route.positive_task_evidence), '') IS NOT NULL
    AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(route.source_references) = 'array'
                THEN route.source_references ELSE '[]'::jsonb END
        ) AS source_ref
        WHERE COALESCE(source_ref->>'url', '') LIKE 'https://%'
    )
    AND (
        route.route_status = 'supported'
        OR (
            route.route_status = 'conditional'
            AND NULLIF(BTRIM(route.scope_condition), '') IS NOT NULL
        )
    )
)
WHERE route.domain_key = 'D078';

COMMIT;
