# Unsupported role→domain reconciliation — batch 016

Date: 2026-10-06  
Scope: all 20 active D027 Biomedical Science unsupported exact keys, checked against current seed source. Global-only; role-task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Key(s) | Recommendation | Basis |
|---|---|---|
| `air pollution analyst`, `airport environment officer`, `environmental technician`, `groundwater monitoring technician`, `pipeline environmental project manager` | `reclassify_exact` to new D020 keys | Pollution, environmental monitoring, water quality, and infrastructure environmental-impact tasks; not biomedical work. |
| `animal feed nutritionist` | `reclassify_exact` to new D119 key | Animal-feed formulation/advice in animal-production settings. |
| `aquaculture environmental analyst`, `aquaculture quality supervisor`, `aquaculture site supervisor` | `reclassify_exact` to new D120 keys | Aquaculture environmental conditions, production quality, and farm/site operations. |
| `botanicals specialist` | `reclassify_exact` to new D048 key | Botanical/flavour science applied to beverage production. |
| `conservation scientist`, `countryside officer`, `nature conservation officer` | `reclassify_exact` to new D121 keys | Forest/wildlife/natural-environment conservation and management. |
| `curator of horticulture`, `viticulture adviser` | `reclassify_exact` to new D118 keys | Horticultural collections, vineyard and crop production. |
| `marine biologist` | `reclassify_exact` to new D041 key | Research on marine organisms/ecosystems; not naval engineering, aquaculture production, or computational biology by title alone. |
| `environmental programme coordinator` | `remove_link_only` | D027 is wrong; alternative environmental-management parent is not established. |
| `environmental scientist` | `preserve_exclude` | D027 is wrong; D020 versus D041 requires more source-specific scope adjudication. |
| `natural resources consultant` | `preserve_exclude` | Broad fauna/flora/soil/water advisory remit; no single parent established by current domain scope. |
| `soil scientist` | `preserve_exclude` | Soil science spans environment, agriculture and research; no single parent established. |

New D020/D041/D048/D118/D119/D120/D121 target keys are recommendations only and are absent from the current role inventory. Repeated `D142` peer mappings are not endorsed. Every edge decision applies only to the named D027 exact key; roles are not globally deleted.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–016 contain **83 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2, D025 1, D027 20).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **349 current exact keys remain undecided** (432 − 83). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain separate and open.
- No canonical role/domain data has been changed.
