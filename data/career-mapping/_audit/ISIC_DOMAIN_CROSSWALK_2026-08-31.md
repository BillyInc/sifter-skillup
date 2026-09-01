# ISIC domain crosswalk — 2026-08-31

## Decision

ISIC Rev.5 is the canonical current revision. The official UNSD Rev.4→Rev.5 correspondence table is used only to reconcile historical or revision-sensitive values; raw library values are preserved.

Official correspondence source: https://unstats.un.org/unsd/classifications/Econ/tables/ISIC/ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx
SHA-256: `59bbe76799750a67aa96153cd24f61d97247b19ee79784e72d6f2ecedb764415`

This artifact does not rename domains, modify `domain_meta.json`, or reassign subgroups and roles. It records candidate Rev.5 values and flags where the raw section letter and numeric code point to different revisions.

## Summary

- Domain-definition records: **166**.
- Unique raw ISIC-like values: **200**.
- Exact Rev.4 group-prefix crosswalks: **148**.
- Rev.4 division-prefix fallback crosswalks: **50**.
- Values requiring manual source review: **0**.

## Raw-value decisions

| Raw library value | Status | Rev.4 candidates | Rev.5 candidates | Section comparison |
|---|---|---|---|---|
| `A011` | `crosswalked_from_rev4_group_to_rev5` | A0111, A0112, A0113, A0114, A0115, A0116, A0119 | A0111, A0112, A0113, A0114, A0115, A0116, A0119 | raw A; Rev.4 A; Rev.5 A |
| `A012` | `crosswalked_from_rev4_group_to_rev5` | A0121, A0122, A0123, A0124, A0125, A0126, A0127, A0128, A0128, A0129 | A0121, A0122, A0123, A0124, A0125, A0126, A0127, A0128, A0113, A0129 | raw A; Rev.4 A; Rev.5 A |
| `A013` | `crosswalked_from_rev4_group_to_rev5` | A013A0 | A0130 | raw A; Rev.4 A; Rev.5 A |
| `A014` | `crosswalked_from_rev4_group_to_rev5` | A0141, A0142, A0143, A0144, A0145, A0146, A0149, A0149 | A0141, A0142, A0143, A0144, A0145, A0146, A0149, A0146 | raw A; Rev.4 A; Rev.5 A |
| `A015` | `crosswalked_from_rev4_group_to_rev5` | A0150 | A0150 | raw A; Rev.4 A; Rev.5 A |
| `A016` | `crosswalked_from_rev4_group_to_rev5` | A0161, A0162, A0163, A0164 | A0161, A0162, A0163, A0164 | raw A; Rev.4 A; Rev.5 A |
| `A021` | `crosswalked_from_rev4_group_to_rev5` | A0210 | A0210 | raw A; Rev.4 A; Rev.5 A |
| `A022` | `crosswalked_from_rev4_group_to_rev5` | A0220 | A0220 | raw A; Rev.4 A; Rev.5 A |
| `A023` | `crosswalked_from_rev4_group_to_rev5` | A0230 | A0230 | raw A; Rev.4 A; Rev.5 A |
| `A024` | `crosswalked_from_rev4_group_to_rev5` | A0240 | A0240 | raw A; Rev.4 A; Rev.5 A |
| `A031` | `crosswalked_from_rev4_group_to_rev5` | A0311, A0311, A0312, A0312 | A0311, A0330, A0312, A0330 | raw A; Rev.4 A; Rev.5 A |
| `A032` | `crosswalked_from_rev4_group_to_rev5` | A0321, A0321, A0322, A0322 | A0321, A0330, A0322, A0330 | raw A; Rev.4 A; Rev.5 A |
| `B050` | `crosswalked_from_rev4_division_to_rev5_candidates` | B0510, B0520 | B0510, B0520 | raw B; Rev.4 B; Rev.5 B |
| `B060` | `crosswalked_from_rev4_division_to_rev5_candidates` | B0610, B0620 | B0610, B0620 | raw B; Rev.4 B; Rev.5 B |
| `B070` | `crosswalked_from_rev4_division_to_rev5_candidates` | B0710, B0721, B0729 | B0710, B0721, B0729 | raw B; Rev.4 B; Rev.5 B |
| `B080` | `crosswalked_from_rev4_division_to_rev5_candidates` | B0810, B0891, B0892, B0893, B0899 | B0810, B0891, B0892, B0893, B0899 | raw B; Rev.4 B; Rev.5 B |
| `B090` | `crosswalked_from_rev4_division_to_rev5_candidates` | B0910, B0990 | B0910, B0990 | raw B; Rev.4 B; Rev.5 B |
| `C` | `section_only_industry_anchor` | — | C | — |
| `C101` | `crosswalked_from_rev4_group_to_rev5` | C1010 | C1010 | raw C; Rev.4 C; Rev.5 C |
| `C102` | `crosswalked_from_rev4_group_to_rev5` | C1020 | C1020 | raw C; Rev.4 C; Rev.5 C |
| `C103` | `crosswalked_from_rev4_group_to_rev5` | C1030 | C1030 | raw C; Rev.4 C; Rev.5 C |
| `C110` | `crosswalked_from_rev4_group_to_rev5` | C1101, C1102, C1103, C1103, C1104 | C1101, C1102, C1103, C1104, C1105 | raw C; Rev.4 C; Rev.5 C |
| `C120` | `crosswalked_from_rev4_group_to_rev5` | C1200 | C1200 | raw C; Rev.4 C; Rev.5 C |
| `C131` | `crosswalked_from_rev4_group_to_rev5` | C1311, C1312, C1313 | C1311, C1312, C1313 | raw C; Rev.4 C; Rev.5 C |
| `C132` | `crosswalked_from_rev4_division_to_rev5_candidates` | C1311, C1312, C1313, C1391, C1392, C1393, C1394, C1399 | C1311, C1312, C1313, C1391, C1392, C1393, C1394, C1399 | raw C; Rev.4 C; Rev.5 C |
| `C133` | `crosswalked_from_rev4_division_to_rev5_candidates` | C1311, C1312, C1313, C1391, C1392, C1393, C1394, C1399 | C1311, C1312, C1313, C1391, C1392, C1393, C1394, C1399 | raw C; Rev.4 C; Rev.5 C |
| `C139` | `crosswalked_from_rev4_group_to_rev5` | C1391, C1392, C1393, C1394, C1399 | C1391, C1392, C1393, C1394, C1399 | raw C; Rev.4 C; Rev.5 C |
| `C141` | `crosswalked_from_rev4_group_to_rev5` | C1410 | C1410 | raw C; Rev.4 C; Rev.5 C |
| `C142` | `crosswalked_from_rev4_group_to_rev5` | C1420 | C1420 | raw C; Rev.4 C; Rev.5 C |
| `C143` | `crosswalked_from_rev4_group_to_rev5` | C1430 | C1430 | raw C; Rev.4 C; Rev.5 C |
| `C149` | `crosswalked_from_rev4_division_to_rev5_candidates` | C1410, C1420, C1430 | C1410, C1420, C1430 | raw C; Rev.4 C; Rev.5 C |
| `C151` | `crosswalked_from_rev4_group_to_rev5` | C1511, C1512 | C1511, C1512 | raw C; Rev.4 C; Rev.5 C |
| `C152` | `crosswalked_from_rev4_group_to_rev5` | C1520 | C1520 | raw C; Rev.4 C; Rev.5 C |
| `C160` | `crosswalked_from_rev4_division_to_rev5_candidates` | C1610, C1621, C1622, C1623, C1629 | C1610, C1621, C1622, C1623, C1629 | raw C; Rev.4 C; Rev.5 C |
| `C161` | `crosswalked_from_rev4_group_to_rev5` | C1610 | C1610 | raw C; Rev.4 C; Rev.5 C |
| `C162` | `crosswalked_from_rev4_group_to_rev5` | C1621, C1622, C1623, C1629 | C1621, C1622, C1623, C1629 | raw C; Rev.4 C; Rev.5 C |
| `C170` | `crosswalked_from_rev4_group_to_rev5` | C1701, C1702, C1709 | C1701, C1702, C1709 | raw C; Rev.4 C; Rev.5 C |
| `C171` | `crosswalked_from_rev4_division_to_rev5_candidates` | C1701, C1702, C1709 | C1701, C1702, C1709 | raw C; Rev.4 C; Rev.5 C |
| `C172` | `crosswalked_from_rev4_division_to_rev5_candidates` | C1701, C1702, C1709 | C1701, C1702, C1709 | raw C; Rev.4 C; Rev.5 C |
| `C181` | `crosswalked_from_rev4_group_to_rev5` | C1811, C1812 | C1811, C1812 | raw C; Rev.4 C; Rev.5 C |
| `C182` | `crosswalked_from_rev4_group_to_rev5` | C1820 | C1820 | raw C; Rev.4 C; Rev.5 C |
| `C200` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2011, C2011, C2012, C2013, C2021, C2022, C2023, C2029, C2030 | C2011, C2029, C2012, C2013, C2021, C2022, C2023, C2029, C2030 | raw C; Rev.4 C; Rev.5 C |
| `C201` | `crosswalked_from_rev4_group_to_rev5` | C2011, C2011, C2012, C2013 | C2011, C2029, C2012, C2013 | raw C; Rev.4 C; Rev.5 C |
| `C202` | `crosswalked_from_rev4_group_to_rev5` | C2021, C2022, C2023, C2029 | C2021, C2022, C2023, C2029 | raw C; Rev.4 C; Rev.5 C |
| `C210` | `crosswalked_from_rev4_group_to_rev5` | C2100 | C2100 | raw C; Rev.4 C; Rev.5 C |
| `C211` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2100 | C2100 | raw C; Rev.4 C; Rev.5 C |
| `C220` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2211, C2219, C2220 | C2211, C2219, C2220 | raw C; Rev.4 C; Rev.5 C |
| `C221` | `crosswalked_from_rev4_group_to_rev5` | C2211, C2219 | C2211, C2219 | raw C; Rev.4 C; Rev.5 C |
| `C222` | `crosswalked_from_rev4_group_to_rev5` | C2220 | C2220 | raw C; Rev.4 C; Rev.5 C |
| `C230` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2310, C2391, C2392, C2393, C2394, C2395, C2396, C2399 | C2310, C2391, C2392, C2393, C2394, C2395, C2396, C2399 | raw C; Rev.4 C; Rev.5 C |
| `C231` | `crosswalked_from_rev4_group_to_rev5` | C2310 | C2310 | raw C; Rev.4 C; Rev.5 C |
| `C232` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2310, C2391, C2392, C2393, C2394, C2395, C2396, C2399 | C2310, C2391, C2392, C2393, C2394, C2395, C2396, C2399 | raw C; Rev.4 C; Rev.5 C |
| `C239` | `crosswalked_from_rev4_group_to_rev5` | C2391, C2392, C2393, C2394, C2395, C2396, C2399 | C2391, C2392, C2393, C2394, C2395, C2396, C2399 | raw C; Rev.4 C; Rev.5 C |
| `C241` | `crosswalked_from_rev4_group_to_rev5` | C2410 | C2410 | raw C; Rev.4 C; Rev.5 C |
| `C242` | `crosswalked_from_rev4_group_to_rev5` | C2420 | C2420 | raw C; Rev.4 C; Rev.5 C |
| `C244` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2410, C2420, C2431, C2432 | C2410, C2420, C2431, C2432 | raw C; Rev.4 C; Rev.5 C |
| `C245` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2410, C2420, C2431, C2432 | C2410, C2420, C2431, C2432 | raw C; Rev.4 C; Rev.5 C |
| `C251` | `crosswalked_from_rev4_group_to_rev5` | C2511, C2512, C2513 | C2511, C2512, C2513 | raw C; Rev.4 C; Rev.5 C |
| `C252` | `crosswalked_from_rev4_group_to_rev5` | C2520 | C2520 | raw C; Rev.4 C; Rev.5 C |
| `C259` | `crosswalked_from_rev4_group_to_rev5` | C2591, C2592, C2593, C2599 | C2591, C2592, C2593, C2599 | raw C; Rev.4 C; Rev.5 C |
| `C260` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2610, C2610, C2620, C2630, C2640, C2651, C2652, C2660, C2670, C2680 | C2611, C2619, C2620, C2630, C2640, C2651, C2652, C2660, C2670, C2680 | raw C; Rev.4 C; Rev.5 C |
| `C265` | `crosswalked_from_rev4_group_to_rev5` | C2651, C2652 | C2651, C2652 | raw C; Rev.4 C; Rev.5 C |
| `C266` | `crosswalked_from_rev4_group_to_rev5` | C2660 | C2660 | raw C; Rev.4 C; Rev.5 C |
| `C270` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2710, C2720, C2731, C2732, C2733, C2740, C2750, C2790 | C2710, C2720, C2731, C2732, C2733, C2740, C2750, C2790 | raw C; Rev.4 C; Rev.5 C |
| `C280` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2811, C2812, C2813, C2814, C2815, C2816, C2817, C2818, C2819, C2821, C2822, C2823, C2824, C2825, C2826, C2829 | C2811, C2812, C2813, C2814, C2815, C2816, C2817, C2818, C2819, C2821, C2822, C2823, C2824, C2825, C2826, C2829 | raw C; Rev.4 C; Rev.5 C |
| `C289` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2811, C2812, C2813, C2814, C2815, C2816, C2817, C2818, C2819, C2821, C2822, C2823, C2824, C2825, C2826, C2829 | C2811, C2812, C2813, C2814, C2815, C2816, C2817, C2818, C2819, C2821, C2822, C2823, C2824, C2825, C2826, C2829 | raw C; Rev.4 C; Rev.5 C |
| `C290` | `crosswalked_from_rev4_division_to_rev5_candidates` | C2910, C2920, C2930 | C2910, C2920, C2930 | raw C; Rev.4 C; Rev.5 C |
| `C291` | `crosswalked_from_rev4_group_to_rev5` | C2910 | C2910 | raw C; Rev.4 C; Rev.5 C |
| `C292` | `crosswalked_from_rev4_group_to_rev5` | C2920 | C2920 | raw C; Rev.4 C; Rev.5 C |
| `C300` | `crosswalked_from_rev4_division_to_rev5_candidates` | C3011, C3012, C3020, C3030, C3030, C3040, C3091, C3092, C3099 | C3011, C3012, C3020, C3030, C2520, C3040, C3091, C3092, C3099 | raw C; Rev.4 C; Rev.5 C |
| `C301` | `crosswalked_from_rev4_group_to_rev5` | C3011, C3012 | C3011, C3012 | raw C; Rev.4 C; Rev.5 C |
| `C302` | `crosswalked_from_rev4_group_to_rev5` | C3020 | C3020 | raw C; Rev.4 C; Rev.5 C |
| `C303` | `crosswalked_from_rev4_group_to_rev5` | C3030, C3030 | C3030, C2520 | raw C; Rev.4 C; Rev.5 C |
| `C309` | `crosswalked_from_rev4_group_to_rev5` | C3091, C3092, C3099 | C3091, C3092, C3099 | raw C; Rev.4 C; Rev.5 C |
| `C310` | `crosswalked_from_rev4_group_to_rev5` | C3100, C3100 | C3101, C3102 | raw C; Rev.4 C; Rev.5 C |
| `C321` | `crosswalked_from_rev4_group_to_rev5` | C3211, C3212 | C3211, C3212 | raw C; Rev.4 C; Rev.5 C |
| `C329` | `crosswalked_from_rev4_group_to_rev5` | C3290 | C3290 | raw C; Rev.4 C; Rev.5 C |
| `C330` | `crosswalked_from_rev4_division_to_rev5_candidates` | C3311, C3312, C3313, C3314, C3315, C3319, C3320 | C3311, C3312, C3313, C3314, C3315, C3319, C3320 | raw C; Rev.4 C; Rev.5 C |
| `D350` | `crosswalked_from_rev4_division_to_rev5_candidates` | D3510, D3510, D3510, D3510, D3520, D3520, D3530 | D3511, D3512, D3513, D3540, D3520, D3540, D3530 | raw D; Rev.4 D; Rev.5 D |
| `D351` | `crosswalked_from_rev4_group_to_rev5` | D3510, D3510, D3510, D3510 | D3511, D3512, D3513, D3540 | raw D; Rev.4 D; Rev.5 D |
| `D352` | `crosswalked_from_rev4_group_to_rev5` | D3520, D3520 | D3520, D3540 | raw D; Rev.4 D; Rev.5 D |
| `E370` | `crosswalked_from_rev4_group_to_rev5` | E3700 | E3700 | raw E; Rev.4 E; Rev.5 E |
| `E380` | `crosswalked_from_rev4_division_to_rev5_candidates` | E3811, E3812, E3821, E3822, E3830 | E3811, E3812, E3821, E3822, E3830 | raw E; Rev.4 E; Rev.5 E |
| `E390` | `crosswalked_from_rev4_group_to_rev5` | E3900 | E3900 | raw E; Rev.4 E; Rev.5 E |
| `F` | `section_only_industry_anchor` | — | F | — |
| `F410` | `crosswalked_from_rev4_group_to_rev5` | F4100, F4100 | F4100, M6810 | raw F; Rev.4 F; Rev.5 F,M |
| `F420` | `crosswalked_from_rev4_division_to_rev5_candidates` | F4210, F4220, F4290 | F4210, F4220, F4290 | raw F; Rev.4 F; Rev.5 F |
| `F430` | `crosswalked_from_rev4_division_to_rev5_candidates` | F4311, F4311, F4312, F4312, F4321, F4321, F4322, F4322, F4329, F4329, F4330, F4330, F4390, F4390 | F4311, F4340, F4312, F4340, F4321, F4340, F4322, F4340, F4329, F4340, F4330, F4340, F4390, F4340 | raw F; Rev.4 F; Rev.5 F |
| `F431` | `crosswalked_from_rev4_group_to_rev5` | F4311, F4311, F4312, F4312 | F4311, F4340, F4312, F4340 | raw F; Rev.4 F; Rev.5 F |
| `G451` | `crosswalked_from_rev4_group_to_rev5` | G4510, G4510, G4510 | G4790, G4661, G4781 | raw G; Rev.4 G; Rev.5 G |
| `G452` | `crosswalked_from_rev4_group_to_rev5` | G4520, G4520 | T9531, T9540 | raw G; Rev.4 G; Rev.5 T |
| `G453` | `crosswalked_from_rev4_group_to_rev5` | G4530, G4530 | G4662, G4782 | raw G; Rev.4 G; Rev.5 G |
| `G454` | `crosswalked_from_rev4_group_to_rev5` | G4540, G4540, G4540, G4540 | G4663, G4783, T9532, T9540 | raw G; Rev.4 G; Rev.5 G,T |
| `G460` | `crosswalked_from_rev4_division_to_rev5_candidates` | G4610, G4620, G4630, G4641, G4649, G4649, G4651, G4652, G4653, G4659, G4659, G4659, G4661, G4662, G4663, G4669, G4690 | G4610, G4620, G4630, G4641, G4649, G4642, G4651, G4652, G4653, G4642, G4649, G4659, G4671, G4672, G4673, G4679, G4690 | raw G; Rev.4 G; Rev.5 G |
| `G470` | `crosswalked_from_rev4_division_to_rev5_candidates` | G4711, G4711, G4719, G4719, G4721, G4721, G4722, G4722, G4723, G4723, G4730, G4730, G4741, G4741, G4742, G4742, G4751, G4751, G4752, G4752, G4753, G4753, G4759, G4759, G4761, G4761, G4762, G4762, G4763, G4763, G4764, G4764, G4771, G4771, G4772, G4772, G4773, G4773, G4773, G4774, G4774, G4781, G4781, G4781, G4781, G4782, G4782, G4782, G4782, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799 | G4711, G4790, G4719, G4790, G4721, G4790, G4722, G4790, G4723, G4790, G4730, G4790, G4740, G4790, G4740, G4790, G4751, G4790, G4752, G4790, G4753, G4790, G4759, G4790, G4761, G4790, G4769, G4790, G4762, G4790, G4763, G4790, G4771, G4790, G4772, G4790, G4773, G4769, G4790, G4774, G4790, G4711, G4721, G4722, G4723, G4719, G4751, G4771, G4774, G4719, G4740, G4752, G4753, G4759, G4761, G4769, G4762, G4763, G4772, G4773, G4774, G4721, G4722, G4723, G4711, G4719, G4740, G4751, G4752, G4753, G4759, G4761, G4769, G4762, G4763, G4771, G4772, G4774, G4790, J6039, G4711, G4719, G4721, G4722, G4740, G4751, G4752, G4753, G4759, G4761, G4769, G4762, G4763, G4771, G4772, G4774, G4790 | raw G; Rev.4 G; Rev.5 G,J |
| `G471` | `crosswalked_from_rev4_group_to_rev5` | G4711, G4711, G4719, G4719 | G4711, G4790, G4719, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G472` | `crosswalked_from_rev4_group_to_rev5` | G4721, G4721, G4722, G4722, G4723, G4723 | G4721, G4790, G4722, G4790, G4723, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G473` | `crosswalked_from_rev4_group_to_rev5` | G4730, G4730 | G4730, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G474` | `crosswalked_from_rev4_group_to_rev5` | G4741, G4741, G4742, G4742 | G4740, G4790, G4740, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G475` | `crosswalked_from_rev4_group_to_rev5` | G4751, G4751, G4752, G4752, G4753, G4753, G4759, G4759 | G4751, G4790, G4752, G4790, G4753, G4790, G4759, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G476` | `crosswalked_from_rev4_group_to_rev5` | G4761, G4761, G4762, G4762, G4763, G4763, G4764, G4764 | G4761, G4790, G4769, G4790, G4762, G4790, G4763, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G477` | `crosswalked_from_rev4_group_to_rev5` | G4771, G4771, G4772, G4772, G4773, G4773, G4773, G4774, G4774 | G4771, G4790, G4772, G4790, G4773, G4769, G4790, G4774, G4790 | raw G; Rev.4 G; Rev.5 G |
| `G478` | `crosswalked_from_rev4_group_to_rev5` | G4781, G4781, G4781, G4781, G4782, G4782, G4782, G4782, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789, G4789 | G4711, G4721, G4722, G4723, G4719, G4751, G4771, G4774, G4719, G4740, G4752, G4753, G4759, G4761, G4769, G4762, G4763, G4772, G4773, G4774 | raw G; Rev.4 G; Rev.5 G |
| `G479` | `crosswalked_from_rev4_group_to_rev5` | G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4791, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799, G4799 | G4721, G4722, G4723, G4711, G4719, G4740, G4751, G4752, G4753, G4759, G4761, G4769, G4762, G4763, G4771, G4772, G4774, G4790, J6039, G4711, G4719, G4721, G4722, G4740, G4751, G4752, G4753, G4759, G4761, G4769, G4762, G4763, G4771, G4772, G4774, G4790 | raw G; Rev.4 G; Rev.5 G,J |
| `H491` | `crosswalked_from_rev4_group_to_rev5` | H4911, H4912 | H4911, H4912 | raw H; Rev.4 H; Rev.5 H |
| `H492` | `crosswalked_from_rev4_group_to_rev5` | H4921, H4922, H4923 | H4921, H4922, H4923 | raw H; Rev.4 H; Rev.5 H |
| `H501` | `crosswalked_from_rev4_group_to_rev5` | H5011, H5012 | H5011, H5012 | raw H; Rev.4 H; Rev.5 H |
| `H502` | `crosswalked_from_rev4_group_to_rev5` | H5021, H5022 | H5021, H5022 | raw H; Rev.4 H; Rev.5 H |
| `H503` | `crosswalked_from_rev4_division_to_rev5_candidates` | H5011, H5012, H5021, H5022 | H5011, H5012, H5021, H5022 | raw H; Rev.4 H; Rev.5 H |
| `H511` | `crosswalked_from_rev4_group_to_rev5` | H5110 | H5110 | raw H; Rev.4 H; Rev.5 H |
| `H512` | `crosswalked_from_rev4_group_to_rev5` | H5120 | H5120 | raw H; Rev.4 H; Rev.5 H |
| `H521` | `crosswalked_from_rev4_group_to_rev5` | H5210 | H5210 | raw H; Rev.4 H; Rev.5 H |
| `H522` | `crosswalked_from_rev4_group_to_rev5` | H5221, H5221, H5221, H5222, H5222, H5222, H5223, H5223, H5223, H5224, H5224, H5229, H5229, H5229 | H5221, H5231, H5232, H5231, H5232, H5222, H5223, H5231, H5232, H5224, H5231, H5229, H5231, H5232 | raw H; Rev.4 H; Rev.5 H |
| `H524` | `crosswalked_from_rev4_division_to_rev5_candidates` | H5210, H5221, H5221, H5221, H5222, H5222, H5222, H5223, H5223, H5223, H5224, H5224, H5229, H5229, H5229 | H5210, H5221, H5231, H5232, H5231, H5232, H5222, H5223, H5231, H5232, H5224, H5231, H5229, H5231, H5232 | raw H; Rev.4 H; Rev.5 H |
| `I551` | `crosswalked_from_rev4_group_to_rev5` | I5510, I5510, I5510 | I5510, I5520, I5540 | raw I; Rev.4 I; Rev.5 I |
| `I552` | `crosswalked_from_rev4_group_to_rev5` | I5520, I5520 | I5530, I5540 | raw I; Rev.4 I; Rev.5 I |
| `I553` | `crosswalked_from_rev4_division_to_rev5_candidates` | I5510, I5510, I5510, I5520, I5520, I5590, I5590 | I5510, I5520, I5540, I5530, I5540, I5590, I5540 | raw I; Rev.4 I; Rev.5 I |
| `I561` | `crosswalked_from_rev4_group_to_rev5` | I5610, I5610 | I5610, I5640 | raw I; Rev.4 I; Rev.5 I |
| `I562` | `crosswalked_from_rev4_group_to_rev5` | I5621, I5621, I5629, I5629 | I5621, I5640, I5629, I5640 | raw I; Rev.4 I; Rev.5 I |
| `I563` | `crosswalked_from_rev4_group_to_rev5` | I5630, I5630 | I5630, I5640 | raw I; Rev.4 I; Rev.5 I |
| `J581` | `crosswalked_from_rev4_group_to_rev5` | J5811, J5812, J5813, J5813, J5819 | J5811, J5819, J5812, J5813, J5819 | raw J; Rev.4 J; Rev.5 J |
| `J582` | `crosswalked_from_rev4_group_to_rev5` | J5820, J5820 | J5821, J5829 | raw J; Rev.4 J; Rev.5 J |
| `J590` | `crosswalked_from_rev4_division_to_rev5_candidates` | J5911, J5912, J5913, J5914, J5920, J5920 | J5911, J5912, J5913, J5914, J5920, J6010 | raw J; Rev.4 J; Rev.5 J |
| `J591` | `crosswalked_from_rev4_group_to_rev5` | J5911, J5912, J5913, J5914 | J5911, J5912, J5913, J5914 | raw J; Rev.4 J; Rev.5 J |
| `J592` | `crosswalked_from_rev4_group_to_rev5` | J5920, J5920 | J5920, J6010 | raw J; Rev.4 J; Rev.5 J |
| `J601` | `crosswalked_from_rev4_group_to_rev5` | J6010 | J6010 | raw J; Rev.4 J; Rev.5 J |
| `J602` | `crosswalked_from_rev4_group_to_rev5` | J6020 | J6020 | raw J; Rev.4 J; Rev.5 J |
| `J630` | `crosswalked_from_rev4_division_to_rev5_candidates` | J6311, J6311, J6311, J6312, J6312, J6391, J6399 | J5912, J5920, K6310, J6039, K6390, J6031, K6390 | raw J; Rev.4 J; Rev.5 J,K |
| `J631` | `crosswalked_from_rev4_group_to_rev5` | J6311, J6311, J6311, J6312, J6312 | J5912, J5920, K6310, J6039, K6390 | raw J; Rev.4 J; Rev.5 J,K |
| `K610` | `crosswalked_from_rev4_division_to_rev5_candidates` | J6110, J6110, J6120, J6120, J6130, J6130, J6190, J6190 | K6110, K6120, K6110, K6120, K6110, K6120, K6190, K6120 | raw K; Rev.4 J; Rev.5 K |
| `K620` | `crosswalked_from_rev4_group_to_rev5` | J6201, J6201, J6202, J6209 | K6211, K6219, K6220, K6290 | raw K; Rev.4 J; Rev.5 K |
| `K630` | `crosswalked_from_rev4_division_to_rev5_candidates` | J6311, J6311, J6311, J6312, J6312, J6391, J6399 | J5912, J5920, K6310, J6039, K6390, J6031, K6390 | raw K; Rev.4 J; Rev.5 J,K |
| `L641` | `crosswalked_from_rev4_group_to_rev5` | K6411, K6419 | L6411, L6419 | raw L; Rev.4 K; Rev.5 L |
| `L642` | `crosswalked_from_rev4_group_to_rev5` | K6420, K6420 | L6421, L6422 | raw L; Rev.4 K; Rev.5 L |
| `L643` | `crosswalked_from_rev4_group_to_rev5` | K6430, K6430, K6430 | L6431, L6432, L6433 | raw L; Rev.4 K; Rev.5 L |
| `L649` | `crosswalked_from_rev4_group_to_rev5` | K6491, K6492, K6492, K6499, K6499, K6499 | L6491, L6492, L6495, L6493, L6494, L6499 | raw L; Rev.4 K; Rev.5 L |
| `L651` | `crosswalked_from_rev4_group_to_rev5` | K6511, K6512 | L6511, L6512 | raw L; Rev.4 K; Rev.5 L |
| `L652` | `crosswalked_from_rev4_group_to_rev5` | K6520 | L6520 | raw L; Rev.4 K; Rev.5 L |
| `L653` | `crosswalked_from_rev4_group_to_rev5` | K6530 | L6530 | raw L; Rev.4 K; Rev.5 L |
| `L661` | `crosswalked_from_rev4_group_to_rev5` | K6611, K6612, K6619 | L6611, L6612, L6619 | raw L; Rev.4 K; Rev.5 L |
| `L662` | `crosswalked_from_rev4_group_to_rev5` | K6621, K6622, K6629 | L6621, L6622, L6629 | raw L; Rev.4 K; Rev.5 L |
| `L663` | `crosswalked_from_rev4_group_to_rev5` | K6630 | L6630 | raw L; Rev.4 K; Rev.5 L |
| `M680` | `crosswalked_from_rev4_division_to_rev5_candidates` | L6810, L6820, L6820 | M6810, M6821, M6829 | raw M; Rev.4 L; Rev.5 M |
| `M681` | `crosswalked_from_rev4_group_to_rev5` | L6810 | M6810 | raw M; Rev.4 L; Rev.5 M |
| `M682` | `crosswalked_from_rev4_group_to_rev5` | L6820, L6820 | M6821, M6829 | raw M; Rev.4 L; Rev.5 M |
| `N691` | `crosswalked_from_rev4_group_to_rev5` | M6910 | N6910 | raw N; Rev.4 M; Rev.5 N |
| `N692` | `crosswalked_from_rev4_group_to_rev5` | M6920 | N6920 | raw N; Rev.4 M; Rev.5 N |
| `N701` | `crosswalked_from_rev4_group_to_rev5` | M7010 | N7010 | raw N; Rev.4 M; Rev.5 N |
| `N702` | `crosswalked_from_rev4_group_to_rev5` | M7020, M7020 | N7020, N7330 | raw N; Rev.4 M; Rev.5 N |
| `N711` | `crosswalked_from_rev4_group_to_rev5` | M7110 | N7110 | raw N; Rev.4 M; Rev.5 N |
| `N721` | `crosswalked_from_rev4_group_to_rev5` | M7210 | N7210 | raw N; Rev.4 M; Rev.5 N |
| `N722` | `crosswalked_from_rev4_group_to_rev5` | M7220 | N7220 | raw N; Rev.4 M; Rev.5 N |
| `N723` | `crosswalked_from_rev4_division_to_rev5_candidates` | M7210, M7220 | N7210, N7220 | raw N; Rev.4 M; Rev.5 N |
| `N731` | `crosswalked_from_rev4_group_to_rev5` | M7310 | N7310 | raw N; Rev.4 M; Rev.5 N |
| `N732` | `crosswalked_from_rev4_group_to_rev5` | M7320 | N7320 | raw N; Rev.4 M; Rev.5 N |
| `N741` | `crosswalked_from_rev4_group_to_rev5` | M7410 | N7410 | raw N; Rev.4 M; Rev.5 N |
| `N750` | `crosswalked_from_rev4_group_to_rev5` | M7500 | N7500 | raw N; Rev.4 M; Rev.5 N |
| `N781` | `crosswalked_from_rev4_group_to_rev5` | N7810 | O7810 | raw N; Rev.4 N; Rev.5 O |
| `N782` | `crosswalked_from_rev4_group_to_rev5` | N7820 | O7820 | raw N; Rev.4 N; Rev.5 O |
| `N783` | `crosswalked_from_rev4_group_to_rev5` | N7830 | O7820 | raw N; Rev.4 N; Rev.5 O |
| `N791` | `crosswalked_from_rev4_group_to_rev5` | N7911, N7912 | O7911, O7912 | raw N; Rev.4 N; Rev.5 O |
| `N792` | `crosswalked_from_rev4_division_to_rev5_candidates` | N7911, N7912, N7990, N7990 | O7911, O7912, O7990, O8240 | raw N; Rev.4 N; Rev.5 O |
| `N801` | `crosswalked_from_rev4_group_to_rev5` | N8010 | O8011 | raw N; Rev.4 N; Rev.5 O |
| `N802` | `crosswalked_from_rev4_group_to_rev5` | N8020 | O8019 | raw N; Rev.4 N; Rev.5 O |
| `N821` | `crosswalked_from_rev4_group_to_rev5` | N8211, N8219 | O8210, O8210 | raw N; Rev.4 N; Rev.5 O |
| `N822` | `crosswalked_from_rev4_group_to_rev5` | N8220 | O8220 | raw N; Rev.4 N; Rev.5 O |
| `N855` | `crosswalked_from_rev4_group_to_rev5` | P8550, P8550 | Q8561, Q8569 | raw N; Rev.4 P; Rev.5 Q |
| `P841` | `crosswalked_from_rev4_group_to_rev5` | O8411, O8412, O8412, O8413 | P8411, P8412, P8413, P8414 | raw P; Rev.4 O; Rev.5 P |
| `P842` | `crosswalked_from_rev4_group_to_rev5` | O8421, O8422, O8423 | P8421, P8422, P8423 | raw P; Rev.4 O; Rev.5 P |
| `P843` | `crosswalked_from_rev4_group_to_rev5` | O8430 | P8430 | raw P; Rev.4 O; Rev.5 P |
| `Q851` | `crosswalked_from_rev4_group_to_rev5` | P8510, P8510 | Q8510, Q8520 | raw Q; Rev.4 P; Rev.5 Q |
| `Q853` | `crosswalked_from_rev4_group_to_rev5` | P8530 | Q8540 | raw Q; Rev.4 P; Rev.5 Q |
| `Q854` | `crosswalked_from_rev4_group_to_rev5` | P8541, P8542, P8549, P8549, P8549 | Q8551, Q8552, Q8559, Q8553, Q8561 | raw Q; Rev.4 P; Rev.5 Q |
| `Q855` | `crosswalked_from_rev4_group_to_rev5` | P8550, P8550 | Q8561, Q8569 | raw Q; Rev.4 P; Rev.5 Q |
| `Q910` | `crosswalked_from_rev4_group_to_rev5` | R9101, R9101, R9102, R9102, R9103, R9103 | S9111, S9112, S9121, S9122, S9141, S9142 | raw Q; Rev.4 R; Rev.5 S |
| `R860` | `crosswalked_from_rev4_division_to_rev5_candidates` | Q8610, Q8620, Q8690, Q8690 | R8610, R8620, R8691, R8699 | raw R; Rev.4 Q; Rev.5 R |
| `R861` | `crosswalked_from_rev4_group_to_rev5` | Q8610 | R8610 | raw R; Rev.4 Q; Rev.5 R |
| `R862` | `crosswalked_from_rev4_group_to_rev5` | Q8620 | R8620 | raw R; Rev.4 Q; Rev.5 R |
| `R863` | `crosswalked_from_rev4_division_to_rev5_candidates` | Q8610, Q8620, Q8690, Q8690 | R8610, R8620, R8691, R8699 | raw R; Rev.4 Q; Rev.5 R |
| `R869` | `crosswalked_from_rev4_group_to_rev5` | Q8690, Q8690 | R8691, R8699 | raw R; Rev.4 Q; Rev.5 R |
| `R881` | `crosswalked_from_rev4_group_to_rev5` | Q8810 | R8810 | raw R; Rev.4 Q; Rev.5 R |
| `R889` | `crosswalked_from_rev4_group_to_rev5` | Q8890 | R8890 | raw R; Rev.4 Q; Rev.5 R |
| `R931` | `crosswalked_from_rev4_group_to_rev5` | R9311, R9312, R9319 | S9311, S9312, S9319 | raw R; Rev.4 R; Rev.5 S |
| `S900` | `crosswalked_from_rev4_group_to_rev5` | R9000, R9000, R9000, R9000, R9000, R9000, R9000 | S9011, S9012, S9013, S9020, S9031, S9039, S9130 | raw S; Rev.4 R; Rev.5 S |
| `S901` | `crosswalked_from_rev4_division_to_rev5_candidates` | R9000, R9000, R9000, R9000, R9000, R9000, R9000 | S9011, S9012, S9013, S9020, S9031, S9039, S9130 | raw S; Rev.4 R; Rev.5 S |
| `S902` | `crosswalked_from_rev4_division_to_rev5_candidates` | R9000, R9000, R9000, R9000, R9000, R9000, R9000 | S9011, S9012, S9013, S9020, S9031, S9039, S9130 | raw S; Rev.4 R; Rev.5 S |
| `S903` | `crosswalked_from_rev4_division_to_rev5_candidates` | R9000, R9000, R9000, R9000, R9000, R9000, R9000 | S9011, S9012, S9013, S9020, S9031, S9039, S9130 | raw S; Rev.4 R; Rev.5 S |
| `S910` | `crosswalked_from_rev4_group_to_rev5` | R9101, R9101, R9102, R9102, R9103, R9103 | S9111, S9112, S9121, S9122, S9141, S9142 | raw S; Rev.4 R; Rev.5 S |
| `S912` | `crosswalked_from_rev4_division_to_rev5_candidates` | R9101, R9101, R9102, R9102, R9103, R9103 | S9111, S9112, S9121, S9122, S9141, S9142 | raw S; Rev.4 R; Rev.5 S |
| `S920` | `crosswalked_from_rev4_group_to_rev5` | R9200 | S9200 | raw S; Rev.4 R; Rev.5 S |
| `S931` | `crosswalked_from_rev4_group_to_rev5` | R9311, R9312, R9319 | S9311, S9312, S9319 | raw S; Rev.4 R; Rev.5 S |
| `S932` | `crosswalked_from_rev4_group_to_rev5` | R9321, R9329 | S9321, S9329 | raw S; Rev.4 R; Rev.5 S |
| `S940` | `crosswalked_from_rev4_division_to_rev5_candidates` | S9411, S9412, S9420, S9491, S9492, S9499 | T9411, T9412, T9420, T9491, T9492, T9499 | raw S; Rev.4 S; Rev.5 T |
| `S941` | `crosswalked_from_rev4_group_to_rev5` | S9411, S9412 | T9411, T9412 | raw S; Rev.4 S; Rev.5 T |
| `S942` | `crosswalked_from_rev4_group_to_rev5` | S9420 | T9420 | raw S; Rev.4 S; Rev.5 T |
| `S949` | `crosswalked_from_rev4_group_to_rev5` | S9491, S9492, S9499 | T9491, T9492, T9499 | raw S; Rev.4 S; Rev.5 T |
| `S960` | `crosswalked_from_rev4_group_to_rev5` | S9601, S9601, S9602, S9602, S9602, S9602, S9603, S9603, S9609, S9609 | T9610, T9640, T9621, T9622, T9623, T9640, T9630, T9640, T9690, T9640 | raw S; Rev.4 S; Rev.5 T |
| `S961` | `crosswalked_from_rev4_division_to_rev5_candidates` | S9601, S9601, S9602, S9602, S9602, S9602, S9603, S9603, S9609, S9609 | T9610, T9640, T9621, T9622, T9623, T9640, T9630, T9640, T9690, T9640 | raw S; Rev.4 S; Rev.5 T |
| `S969` | `crosswalked_from_rev4_division_to_rev5_candidates` | S9601, S9601, S9602, S9602, S9602, S9602, S9603, S9603, S9609, S9609 | T9610, T9640, T9621, T9622, T9623, T9640, T9630, T9640, T9690, T9640 | raw S; Rev.4 S; Rev.5 T |
| `U990` | `crosswalked_from_rev4_group_to_rev5` | U9900 | V9900 | raw U; Rev.4 U; Rev.5 V |

## Reproducibility

```text
python data/career-mapping/_build_isic_domain_crosswalk.py
```

The official correspondence workbook must be available at `C:\tmp\ISIC_Rev4_to_ISIC_Rev5_Correspondence_Table-17Jan2025.xlsx` or the user's Downloads directory.
