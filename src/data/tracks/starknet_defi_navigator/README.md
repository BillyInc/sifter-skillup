# Sifter SkillUp — Starknet DeFi Navigator
## Complete Curriculum Package · Labs 1–11

---

## Structure

| Folder | Contents |
|--------|----------|
| lab1/  | DeFi Mental Models (8 lessons + boss) |
| lab2/  | Token Swaps and AMMs (5 lessons + boss) |
| lab3/  | Staking and Delegation (5 lessons + boss) |
| lab4/  | Lending and Borrowing (5 lessons + boss) |
| lab5/  | DCA and Automation (5 lessons + boss) |
| lab6/  | Portfolio Strategy and Allocation (5 lessons + boss) |
| lab7/  | Advanced Liquidity Provision (5 lessons + boss) — see README |
| lab8/  | Bridging and Cross-Chain Capital Movement (5 lessons + boss) |
| lab9/  | Advanced DeFi Primitives (5 lessons + boss) |
| lab10/ | Institutional DeFi Operations (5 lessons + boss) |
| lab11/ | Strategy Research and Competitive Analysis (5 lessons + boss + Final Boss) |
| shared/ | StarkzapSimulatorCard (v2/v3/v4), starkzap.ts SDK |

---

## Simulator Card Versions

| Version | Adds |
|---------|------|
| StarkzapSimulatorCard_v2.tsx | Lab 8 bridge simulators |
| StarkzapSimulatorCard_v3.tsx | Labs 8 + 9 + 10 + 11 simulators |
| StarkzapSimulatorCard_v4_switchblock.ts | Labs 1–6 simulator cases to add to v3 |

**Use v3 as the base and apply v4_switchblock additions to get the complete card covering all labs.**

---

## Simulator Types by Lab

### Labs 1–3 (navigatorLabs1to3_simulators.tsx)
| Type | Lab | Lesson |
|------|-----|--------|
| starkzap-pool-depth | 1 | L3 prices-markets-liquidity |
| starkzap-protocol-reader | 1 | L7 reading-defi-data |
| starkzap-wallet | 1 | L8 first-defi-transaction (existing) |
| starkzap-amm-pool | 2 | L1 how-amms-work |
| starkzap-range-selector | 2 | L2 concentrated-liquidity-ekubo |
| starkzap-swap | 2 | L3–L4 (existing) |
| starkzap-dca | 2 | L5 (existing) |
| starkzap-validator-picker | 3 | L2 validator-selection |
| starkzap-stake | 3 | L3 (existing) |
| starkzap-stake-exit | 3 | L4 exiting-staking-positions |

### Labs 4–6 (navigatorLabs4to6_simulators.tsx)
| Type | Lab | Lesson |
|------|-----|--------|
| starkzap-utilisation-curve | 4 | L1 how-lending-protocols-work |
| starkzap-lend | 4 | L2 (existing) |
| starkzap-health-factor | 4 | L3 collateral-health-factor |
| starkzap-borrow | 4 | L4 borrowing-strategies |
| starkzap-dca-calc | 5 | L1 mathematics-of-dca |
| starkzap-yield-dca | 5 | L4 combining-dca-strategies |
| starkzap-junior-allocator | 6 | L1 asset-allocation-frameworks |
| starkzap-risk-scorecard | 6 | L3 protocol-risk-assessment |
| starkzap-loop-builder | 6 | L4 cross-protocol-strategies |

### Lab 8 (navigatorLab8_simulators.tsx)
starkzap-bridge-lockmint, starkzap-bridge-selector, starkzap-bridge-route,
starkzap-bridge-calc, starkzap-bridge-register

### Lab 9 (navigatorLab9_simulators.tsx)
starkzap-perps-position, starkzap-confidential, starkzap-flashloan-defence,
starkzap-mev-defence, starkzap-liquid-stake

### Labs 10–11 (navigatorLab10_and_Lab11_simulators.tsx)
starkzap-treasury-allocator, starkzap-correlation-manager,
starkzap-onchain-query, starkzap-backtest

---

## Patches Applied (Labs 1–6)
All files in lab1–lab6 have the following patches from labs1to6_patches.ts applied:
- Key takeaways: one dominant concept, no compound "and" statements
- Term introductions: anchor → mechanism → label sequence enforced
- Company identifiers: first-use identifying sentences added
- Named characters replaced with role descriptions throughout examples
- Simulation scenarios corrected to second person ("you")
- Lab 2 L1 Q1 reordered to comprehension-first difficulty curve

---

## Level Structure
| Level | Labs | Entry |
|-------|------|-------|
| Junior | 1–5 | Starknet Island complete |
| Intermediate | 6–9 | Junior certified |
| Senior | 10–11 | Intermediate certified |

Final Boss: Lab 11 — DeFi Navigator Certification
30-day managed portfolio exercise with three incident responses.
