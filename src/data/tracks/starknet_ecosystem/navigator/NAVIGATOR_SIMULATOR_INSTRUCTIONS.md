# Starknet DeFi Navigator — Simulator Instructions

## Dual-Network Requirement

Every simulator in the DeFi Navigator track **must** use both:

| Layer | What | Why |
|-------|------|-----|
| **Starknet Sepolia** | The execution network | Generates real, explorer-verifiable transaction hashes on the live Starknet testnet |
| **StarkZap SDK** (`starkzap-native`) | The execution SDK | Abstracts account abstraction — no seed phrase, no browser extension, just email |

These two are always paired. **Starknet Sepolia is the WHERE. StarkZap is the HOW.** No simulator runs one without the other.

---

## How to Wire a Navigator Simulator

All navigator simulators import from `../../lib/starkzap` (the same shared lib used by Starknet Islands) and declare the network explicitly:

```typescript
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../lib/starkzap';
import { NAVIGATOR_NETWORK_CONFIG } from '../data/tracks/starknet_defi_navigator/navigatorTrack';

// Network is always 'sepolia' for DeFi Navigator lessons
// SDK is always starkzap-native
// Both are declared in NAVIGATOR_NETWORK_CONFIG
```

The SDK initialises on Sepolia automatically (see `src/lib/starkzap.ts` — the singleton uses `network: 'sepolia'`).

---

## Demo vs Live Mode

| Mode | Condition | Behaviour |
|------|-----------|-----------|
| **Live** | `starkzap-native` installed | Real Sepolia transactions, real hashes, real explorer links |
| **Demo** | SDK not installed | `MOCK` object returns realistic delays and fake-but-plausible hashes |

Check mode with: `const live = isStarkzapAvailable();`

Show users which mode they're in via the `<DemoBadge />` component (imported from `StarkzapSimulatorCard`).

---

## Simulator Types by Lab

### Labs 1–3 (`lab1–lab3/navigatorLab*_simulators.tsx`)
Import shared components from `StarkzapSimulatorCard` (existing). New types:

| Type | Lab/Lesson | What it does |
|------|-----------|--------------|
| `starkzap-pool-depth` | Lab 1, L3 | AMM pool depth slider — shows price impact at different trade sizes on Sepolia pools |
| `starkzap-protocol-reader` | Lab 1, L7 | Live DefiLlama + Starkscan data reader |
| `starkzap-amm-pool` | Lab 2, L1 | x×y=k AMM visualiser with live Sepolia pool state |
| `starkzap-range-selector` | Lab 2, L2 | Concentrated liquidity range builder (Ekubo on Sepolia) |
| `starkzap-validator-picker` | Lab 3, L2 | Staking validator scorecard |
| `starkzap-stake-exit` | Lab 3, L4 | Time-accelerated 21-day unstake simulation |

Existing types that carry over from Starknet Islands: `starkzap-wallet`, `starkzap-swap`, `starkzap-dca`, `starkzap-stake`.

### Labs 4–6 (`lab4–lab6/navigatorLab*_simulators.tsx`)

| Type | Lab/Lesson | What it does |
|------|-----------|--------------|
| `starkzap-utilisation-curve` | Lab 4, L1 | Vesu utilisation/borrow rate curve |
| `starkzap-health-factor` | Lab 4, L3 | Collateral ratio → health factor live calculator |
| `starkzap-borrow` | Lab 4, L4 | Full borrow flow on Vesu Sepolia |
| `starkzap-dca-calc` | Lab 5, L1 | DCA vs lump-sum maths simulator |
| `starkzap-yield-dca` | Lab 5, L4 | Yield-funded DCA strategy builder |
| `starkzap-junior-allocator` | Lab 6, L1 | Asset allocation framework builder |
| `starkzap-risk-scorecard` | Lab 6, L3 | Protocol risk scoring tool |
| `starkzap-loop-builder` | Lab 6, L4 | Cross-protocol loop strategy modeller |

Existing type: `starkzap-lend`.

### Lab 8 (`lab8/navigatorLab8_simulators.tsx`)
Bridge simulators — all execute on Starknet Sepolia via StarkZap bridge module:

`starkzap-bridge-lockmint` · `starkzap-bridge-selector` · `starkzap-bridge-route` · `starkzap-bridge-calc` · `starkzap-bridge-register`

### Lab 9 (`lab9/navigatorLab9_simulators.tsx`)
Advanced primitives:

`starkzap-perps-position` · `starkzap-confidential` · `starkzap-flashloan-defence` · `starkzap-mev-defence` · `starkzap-liquid-stake`

### Labs 10–11 (`lab10–lab11/navigatorLab*_simulators.tsx`)
Institutional and research:

`starkzap-treasury-allocator` · `starkzap-correlation-manager` · `starkzap-onchain-query` · `starkzap-backtest`

---

## StarkzapSimulatorCard Version to Use

Use **v3** as the base (`shared/StarkzapSimulatorCard_v3.tsx`) and apply the switch-block additions from **v4** (`shared/StarkzapSimulatorCard_v4_switchblock.ts`) to get complete coverage of Labs 1–11.

```
StarkzapSimulatorCard_v3.tsx  ← base (Labs 8, 9, 10, 11 built in)
+ v4_switchblock additions    ← adds Labs 1–6 cases
= Complete navigator card
```

The final card lives at: `src/components/simulators/StarkzapSimulatorCard.tsx`

---

## Transaction Display Standard

Every simulator that executes a real Starknet Sepolia transaction must display:

1. **Network badge**: `⚡ STARKNET SEPOLIA` (pink, `#ec4899`) in the sim header
2. **SDK badge**: `Powered by StarkZap` below the network badge
3. **Hash**: truncated `0x1234…abcd` with copy-to-clipboard
4. **Explorer link**: `https://sepolia.voyager.online/tx/{hash}` — opens in browser
5. **Demo indicator**: `<DemoBadge />` when running in mock mode

---

## Install

```bash
npm install starkzap-native
```

Without installation, all simulators run in mock mode automatically. No crashes, no errors — just synthetic data.
