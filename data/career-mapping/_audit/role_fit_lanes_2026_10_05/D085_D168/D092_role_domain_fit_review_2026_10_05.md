# D092 role-to-parent-domain fit review

Audit date: 2026-10-05  
Scope: role tasks against the parent domain **Culinary Arts, Catering and Food Service** only. This review does not assess subgroup or specialization membership and makes no canonical edits.

## Result

Reviewed **21/21** D092 lane mappings: **20 supported, 1 conditional, 0 unsupported, 0 unresolved**.

The parent description defines food and drink preparation/service and names cooking, industrial cooking, beverage service, waiting/crew service, and kitchen support. The checked-in task descriptions for cooks, beverage workers, dining-service staff, hosts, and kitchen staff fall within those functions. The conditional case is **industrial cook**: its task profile emphasizes formulation and processing of foodstuff products, and the parent description does not state where culinary production ends and industrial food manufacturing begins. It is kept conditional instead of silently treating the title or occupation code as conclusive.

## Evidence and limits

- Each decision records the exact ESCO occupation URI and the role-task excerpt in the JSON artifact. The source task text was taken from the checked-in lane queue/profile; individual ESCO pages were not independently re-fetched during this slice, so the artifact states that limitation plainly.
- The U.S. Bureau of Labor Statistics groups cooks, bartenders, food-preparation workers, waiters, and related service occupations under food preparation and serving. This is corroboration of the task family, not a global taxonomy or proof for every specialist role. [BLS: Food Preparation and Serving Occupations](https://www.bls.gov/ooh/food-preparation-and-serving/)
- BLS describes cooks as preparing food in restaurants, schools, hospitals, households, and other food-service settings. [BLS: Cooks](https://www.bls.gov/ooh/food-preparation-and-serving/cooks.htm)
- FAO/WHO Codex lists CXC 1-1969, *General Principles of Food Hygiene*. This supports the relevance of hygiene to kitchen tasks, not occupational membership. [Codex codes of practice](https://www.fao.org/fao-who-codexalimentarius/codex-texts/codes-of-practice/en/)

## Audit boundary

These dispositions compare task substance with the named parent-domain scope only. They do not infer fit from ISCO, subgroup membership, title resemblance, or repetition. No specialization/subgroup decision, student-path decision, or canonical taxonomy change was made. Full machine-readable role-by-role evidence is in [`D092_role_domain_fit_review_2026_10_05.json`](D092_role_domain_fit_review_2026_10_05.json).
