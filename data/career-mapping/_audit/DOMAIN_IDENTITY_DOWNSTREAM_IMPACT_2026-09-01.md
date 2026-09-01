# Domain identity downstream impact audit — 2026-09-01

No domain identity rename or reassignment was made. The reconciliation preserved all domain IDs, subgroup/role ownership, and source layers; it normalized stale display labels to domain_meta and applied the Nigerian reviewed-link overlay to the active JAMB map.

- Identity classes: **{'exact_source_terminology': 7, 'source_supported_umbrella': 159, 'curated_addition': 2}**.
- Invalid downstream domain references: **0**.
- Display-label mismatches after normalization: **0**.
- Programme links checked: **1683**; JAMB links checked: **3163**; role records checked: **4703**.
- Active Nigerian-reviewed JAMB links: **710**; bridge links: **163**.

Domain identity reconciliation does not rewrite programme-to-domain tiers, subgroup membership, role source anchors, or skill/tool/certification inheritance. It only aligns legacy display labels with `domain_meta.json`; the active JAMB map additionally carries the separately audited Nigerian curriculum dispositions.

## Reproducibility

```text
python data/career-mapping/_audit_domain_identity_downstream_impact.py
```
