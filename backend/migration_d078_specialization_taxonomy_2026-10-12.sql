-- D078-specific area and multi-area role-route persistence.
-- Apply after the canonical career domain/role schema exists. This is
-- additive: it does not rewrite domain_subgroups or re-adjudicate role fit.
-- D078's seven Areas of Specialization are not the two legacy ISCO buckets.

CREATE TABLE IF NOT EXISTS skillup_dev.career_areas_of_specialization (
    area_key          TEXT PRIMARY KEY,
    domain_id         UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    domain_key        TEXT NOT NULL,
    label             TEXT NOT NULL,
    description       TEXT NOT NULL,
    display_order     INTEGER NOT NULL,
    source_ids        TEXT[] NOT NULL DEFAULT '{}',
    source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_confidence TEXT NOT NULL CHECK (source_confidence IN ('high', 'medium', 'low')),
    data_state        TEXT NOT NULL CHECK (data_state IN ('source_backed', 'partial', 'review_only', 'excluded')),
    verified_at       DATE NOT NULL,
    CHECK (domain_key = 'D078'),
    UNIQUE (domain_id, display_order),
    UNIQUE (domain_id, label)
);

CREATE INDEX IF NOT EXISTS idx_career_areas_of_specialization_domain
    ON skillup_dev.career_areas_of_specialization(domain_id, display_order);

CREATE TABLE IF NOT EXISTS skillup_dev.career_role_area_routes (
    route_id                          UUID PRIMARY KEY,
    domain_id                         UUID NOT NULL REFERENCES skillup_dev.domains(id) ON DELETE CASCADE,
    domain_key                        TEXT NOT NULL,
    area_key                          TEXT NOT NULL REFERENCES skillup_dev.career_areas_of_specialization(area_key) ON DELETE CASCADE,
    role_id                           UUID NOT NULL REFERENCES skillup_dev.domain_roles(id) ON DELETE CASCADE,
    role_key                          TEXT NOT NULL,
    route_status                      TEXT NOT NULL CHECK (route_status IN ('supported', 'conditional')),
    student_visible                   BOOLEAN NOT NULL DEFAULT false,
    rationale                         TEXT NOT NULL,
    positive_task_evidence            TEXT NOT NULL,
    negative_neighbouring_domain_check TEXT NOT NULL,
    scope_condition                   TEXT,
    source_references                 JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_provenance                 JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_state                        TEXT NOT NULL CHECK (data_state IN ('source_backed', 'partial', 'review_only', 'excluded')),
    verified_at                       DATE NOT NULL,
    CHECK (domain_key = 'D078'),
    CHECK (route_status <> 'conditional' OR NULLIF(trim(scope_condition), '') IS NOT NULL),
    CHECK (jsonb_array_length(source_references) > 0),
    UNIQUE (role_id, area_key)
);

CREATE INDEX IF NOT EXISTS idx_career_role_area_routes_area
    ON skillup_dev.career_role_area_routes(area_key, route_status);
CREATE INDEX IF NOT EXISTS idx_career_role_area_routes_role
    ON skillup_dev.career_role_area_routes(role_id, route_status);

ALTER TABLE skillup_dev.career_areas_of_specialization ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_areas_of_specialization_public_read
    ON skillup_dev.career_areas_of_specialization;
CREATE POLICY career_areas_of_specialization_public_read
    ON skillup_dev.career_areas_of_specialization FOR SELECT USING (true);

ALTER TABLE skillup_dev.career_role_area_routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_role_area_routes_public_read
    ON skillup_dev.career_role_area_routes;
CREATE POLICY career_role_area_routes_public_read
    ON skillup_dev.career_role_area_routes FOR SELECT USING (true);

COMMENT ON TABLE skillup_dev.career_areas_of_specialization IS
    'Current, source-backed D078 Areas of Specialization/practice. These are distinct from the retired legacy ISCO subgroup buckets.';
COMMENT ON TABLE skillup_dev.career_role_area_routes IS
    'Approved D078 area-to-role routes, including scope-bounded conditional routes. Does not itself establish programme preparation or guarantee employment.';
