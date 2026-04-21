// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 8 — BRIDGING AND CROSS-CHAIN CAPITAL MOVEMENT
// Interactive Simulator Integration Spec
//
// This file defines the `interactiveSimulator` field to be added to each
// Lab 8 lesson. Merge these into navigatorLab8_lessons1to3.ts and
// navigatorLab8_part2.ts after the `lessonSimulations` field in each lesson.
//
// Design brief: Time-accelerated simulations (see pasted_text brief).
// "Teach the concept without inflicting the actual wait."
// Real bridge testnets have 7-day and 12-hour waits — simulators use
// fast-forward buttons to preserve the pedagogical experience without the
// friction. All five lessons receive a simulator because bridging is a
// muscle-memory skill: clicking through the flow teaches more than MCQs.

// ─────────────────────────────────────────────────────────────
// INTEGRATION MAP
// ─────────────────────────────────────────────────────────────
//
// Lesson ID              → Simulator Component            → File
// ─────────────────────────────────────────────────────────────
// bridge-mechanics       → LockMintVisualizer             → navigatorLab8_simulators.tsx
// eth-to-starknet-bridges → BridgeSelectorSimulator       → navigatorLab8_simulators.tsx
// solana-to-starknet-hyperlane → SolanaToStarknetSimulator → navigatorLab8_simulators.tsx
// round-trip-cost-calculation → RoundTripCostCalculator  → navigatorLab8_simulators.tsx
// multi-chain-portfolio-management → MultiChainRegister  → navigatorLab8_simulators.tsx
// ─────────────────────────────────────────────────────────────

export const LAB8_SIMULATOR_INTEGRATION: Record<
  string,
  {
    componentId: string;
    importedFrom: string;
    placementRule: string;
    pedagogicalPurpose: string;
    timeAccelerated: boolean;
    fastForwardLabel?: string;
    briefDescription: string;
  }
> = {

  // ── LESSON 1 ──────────────────────────────────────────────
  "bridge-mechanics": {
    componentId: "LockMintVisualizer",
    importedFrom: "./navigatorLab8_simulators",
    placementRule: "After lessonSimulations — before next lesson begins.",
    pedagogicalPurpose:
      "The explanation tells the learner why lock-and-mint is dangerous. " +
      "The simulator makes them FEEL it: they click 'Bridge', watch the ETH lock, " +
      "see wETH minted, then optionally trigger the exploit — watching their " +
      "wETH show 'WORTHLESS'. They then switch to burn-and-mint (CCTP) and " +
      "discover there is no locked collateral to exploit. " +
      "Muscle memory: irreversibility, collateral dependency, CCTP safety.",
    timeAccelerated: false,
    briefDescription:
      "Two-panel bridge visualizer. " +
      "Lock-and-Mint panel: user bridges ETH, sees it locked in Starkgate contract, " +
      "wETH minted on Starknet. Optional 'Simulate Exploit' button drains locked ETH " +
      "and marks wETH worthless. " +
      "Burn-and-Mint panel: user bridges USDC via CCTP, watches it destroyed on " +
      "Ethereum, Circle attests, native USDC appears on Starknet. No exploit button " +
      "exists — component explains why.",
  },

  // ── LESSON 2 ──────────────────────────────────────────────
  "eth-to-starknet-bridges": {
    componentId: "BridgeSelectorSimulator",
    importedFrom: "./navigatorLab8_simulators",
    placementRule: "After lessonSimulations — before next lesson begins.",
    pedagogicalPurpose:
      "The explanation lists three bridges. The simulator forces the learner to " +
      "CHOOSE the right bridge for three different scenarios — a large ETH transfer, " +
      "a USDC transfer, and a small ETH transfer. Wrong choices surface in real-time: " +
      "selecting CCTP for ETH shows an error message. Selecting Orbiter for $80K shows " +
      "the fee calculation and the multi-transaction problem. " +
      "The 12-hour Starkgate wait uses a fast-forward button so the learner " +
      "experiences the countdown UI without waiting. " +
      "Muscle memory: matching bridge to asset and amount, reading error states.",
    timeAccelerated: true,
    fastForwardLabel: "⏩ Fast-forward to completion (simulation — skip 12-hour wait)",
    briefDescription:
      "Three-scenario selector. Learner picks scenario (large ETH, USDC, small ETH), " +
      "sees three bridge cards (Starkgate / CCTP / Orbiter), selects one, and executes. " +
      "Wrong selections produce specific error messages with explanations. " +
      "Starkgate selection shows a 12-hour countdown display with a fast-forward button. " +
      "CCTP selection shows 8-minute real-time progress. " +
      "Completion screen summarises trust model and any caveats.",
  },

  // ── LESSON 3 ──────────────────────────────────────────────
  "solana-to-starknet-hyperlane": {
    componentId: "SolanaToStarknetSimulator",
    importedFrom: "./navigatorLab8_simulators",
    placementRule: "After lessonSimulations — before next lesson begins.",
    pedagogicalPurpose:
      "Lesson 3 teaches two paths from Solana to Starknet. The simulator lets the " +
      "learner vary asset (USDC vs wSOL) and amount, then compare Direct Hyperlane " +
      "vs the Wormhole+Starkgate intermediate hop side-by-side with live fee and " +
      "trust model calculations. For USDC they discover both paths use CCTP and the " +
      "security difference disappears. For large wSOL they discover the intermediate " +
      "hop is actually cheaper AND more secure — an unintuitive finding that the text " +
      "describes but the simulator makes visceral. " +
      "Muscle memory: route selection, fee vs security trade-off at different scales.",
    timeAccelerated: false,
    briefDescription:
      "Route planner with asset toggle (USDC / wSOL) and amount slider. " +
      "Two route cards: Direct Hyperlane vs Intermediate Hop (Wormhole + Starkgate). " +
      "Live fee calculation, trust model description, and 'cheaper' / 'safer' badges " +
      "update as the learner changes inputs. " +
      "On execute, shows the selected route flow, fee paid, and a recommendation " +
      "anchored to the specific amount entered. " +
      "USDC-specific note highlights that both paths use CCTP making the routes " +
      "equivalent from a security standpoint.",
  },

  // ── LESSON 4 ──────────────────────────────────────────────
  "round-trip-cost-calculation": {
    componentId: "RoundTripCostCalculator",
    importedFrom: "./navigatorLab8_simulators",
    placementRule: "After lessonSimulations — before next lesson begins.",
    pedagogicalPurpose:
      "The lesson teaches the break-even formula algebraically. The calculator lets " +
      "the learner explore the formula interactively: drag the principal slider and " +
      "watch break-even days collapse. Drop the APY differential to 0.5% and watch " +
      "break-even balloon to 100+ days. The three presets (small test, medium, large) " +
      "reproduce the three examples from the lesson so the learner can verify their " +
      "mental math and then explore beyond the worked examples. " +
      "Muscle memory: the feel of fixed costs versus variable yield — a skill that " +
      "transfers to every future cross-chain decision.",
    timeAccelerated: false,
    briefDescription:
      "Six-slider calculator: principal, destination APY, source APY, entry cost, " +
      "exit cost, hold duration. " +
      "Live outputs: APY differential, daily yield advantage, total round-trip cost, " +
      "break-even days, net advantage over hold period, viability verdict. " +
      "Result panel colour-codes: red (not viable — hold < break-even), " +
      "yellow (marginal), green (clearly justified). " +
      "Three preset buttons reproduce the three lesson examples for self-verification.",
  },

  // ── LESSON 5 ──────────────────────────────────────────────
  "multi-chain-portfolio-management": {
    componentId: "MultiChainRegister",
    importedFrom: "./navigatorLab8_simulators",
    placementRule: "After lessonSimulations — before aggregate simulations block.",
    pedagogicalPurpose:
      "The lesson introduces three dimensions (bridge risk, settlement finality, " +
      "rebalancing overhead) as concepts. The simulator makes the learner BUILD " +
      "a register that tracks all three. Adding a position on Starknet via Starkgate " +
      "auto-populates 'Low' risk and '12-hour finality'. Adding a third-party-bridge " +
      "position auto-populates 'High' risk and the dashboard updates 'High Risk' total. " +
      "The rebalancing tool at the bottom lets the learner run the threshold formula " +
      "on any combination of values and get an instant verdict. " +
      "Muscle memory: building a position register habit, running the threshold check " +
      "before every capital move.",
    timeAccelerated: false,
    briefDescription:
      "Two-section component. " +
      "Section 1 — Position Register: pre-loaded with two starter positions. " +
      "Learner can add positions by selecting chain, bridge, protocol, value, APY. " +
      "Risk level and settlement finality are auto-populated from bridge selection. " +
      "Portfolio summary header shows total value, bridge-exposed capital, high-risk capital. " +
      "Positions can be removed. " +
      "Section 2 — Rebalancing Threshold Check: four sliders (principal, dest APY, " +
      "src APY, hold days) plus a cost input field. " +
      "Instant verdict: justified or not, with the exact dollar calculation shown.",
  },
};


// ─────────────────────────────────────────────────────────────
// LESSON FIELD PATCH
// Add this `interactiveSimulator` field to each lesson object
// in the lesson data files. The field sits after `lessonSimulations`.
// ─────────────────────────────────────────────────────────────

export const LAB8_LESSON_SIMULATOR_FIELDS = {

  "bridge-mechanics": {
    interactiveSimulator: {
      componentId: "LockMintVisualizer",
      title: "Lock-and-Mint vs Burn-and-Mint Visualizer",
      instructionText:
        "Bridge 2 ETH using Starkgate — watch what gets locked and what gets minted. " +
        "Then trigger the exploit and observe what happens to your wETH. " +
        "Switch to CCTP and bridge USDC. Try to find the exploit button.",
      completionCriteria: [
        "User has executed at least one lock-and-mint bridge flow",
        "User has triggered the exploit scenario and observed the 'worthless' state",
        "User has executed at least one burn-and-mint (CCTP) flow",
        "User has observed there is no exploit button on the CCTP path",
      ],
    },
  },

  "eth-to-starknet-bridges": {
    interactiveSimulator: {
      componentId: "BridgeSelectorSimulator",
      title: "ETH → Starknet Bridge Selector",
      instructionText:
        "Work through all three scenarios. For each, pick the bridge you think is correct. " +
        "If you are wrong, read the error message — it explains why. " +
        "For the Starkgate path, use the fast-forward button to skip the 12-hour wait " +
        "and observe the completion state.",
      completionCriteria: [
        "User has attempted all three scenarios",
        "User has observed the CCTP-for-ETH error message",
        "User has observed the Orbiter large-amount warning",
        "User has used the fast-forward button on the Starkgate flow",
      ],
    },
  },

  "solana-to-starknet-hyperlane": {
    interactiveSimulator: {
      componentId: "SolanaToStarknetSimulator",
      title: "Solana → Starknet Route Planner",
      instructionText:
        "Start with $20,000 USDC. Compare routes. Then switch to wSOL. " +
        "Increase the amount to $80,000 and observe how the fee comparison changes. " +
        "Find the amount where the intermediate hop becomes clearly preferable for wSOL.",
      completionCriteria: [
        "User has compared both routes for USDC at any amount",
        "User has compared both routes for wSOL at any amount",
        "User has observed that at large wSOL amounts the intermediate hop is cheaper AND safer",
        "User has executed at least one route",
      ],
    },
  },

  "round-trip-cost-calculation": {
    interactiveSimulator: {
      componentId: "RoundTripCostCalculator",
      title: "Round-Trip Cost Calculator",
      instructionText:
        "Load the three presets and verify the break-even days match the lesson examples. " +
        "Then drag the principal to $800 and find what hold duration is required to break even. " +
        "Set the APY differential to 0% and observe the verdict.",
      completionCriteria: [
        "User has loaded all three presets",
        "User has observed a 'not viable' verdict",
        "User has observed a 'clearly justified' verdict",
        "User has manipulated the principal slider to observe how scale affects break-even",
      ],
    },
  },

  "multi-chain-portfolio-management": {
    interactiveSimulator: {
      componentId: "MultiChainRegister",
      title: "Multi-Chain Position Register",
      instructionText:
        "Your starter register has two positions. Add at least two more: " +
        "one on Solana via Hyperlane (non-USDC) and one using a third-party multisig bridge. " +
        "Observe how the 'High Risk' total changes. " +
        "Use the rebalancing tool to check whether moving $25,000 from 6% to 14% " +
        "APY for 30 days at $22 cost is justified.",
      completionCriteria: [
        "User has added at least two positions to the register",
        "User has added at least one position with a non-Low risk rating",
        "User has run a rebalancing threshold check",
        "User has observed both a 'justified' and 'not justified' verdict",
      ],
    },
  },
};


// ─────────────────────────────────────────────────────────────
// TIME-ACCELERATION DESIGN NOTE (from pasted_text brief)
// ─────────────────────────────────────────────────────────────
//
// Real bridge testnets have hard wait constraints:
//   - Starkgate L1 finality: up to 12 hours
//   - Optimistic rollup challenge windows: 7 days
//   - These cannot be shortened — users would leave the app
//     and not return to complete the lesson.
//
// Solution applied here:
//   - All waiting periods use a countdown UI that shows the
//     real duration (so the learner understands the friction)
//     but include a "Fast-forward (simulation)" button that
//     skips to the completion state immediately.
//   - This preserves pedagogical value (learner sees "12 hours",
//     reads why, understands planning implications) without
//     inflicting the actual wait.
//   - Applicable simulators: BridgeSelectorSimulator (Starkgate path).
//   - LockMintVisualizer, SolanaToStarknetSimulator,
//     RoundTripCostCalculator, and MultiChainRegister have
//     no waiting periods and do not require fast-forward.
//
// Component pattern used:
//   const [countdown, setCountdown] = useState(43200); // 12 hrs in seconds
//   // Fast-forward button:
//   <button onClick={() => { setCountdown(0); setFastForwarded(true); setStep("complete"); }}>
//     ⏩ Fast-forward (simulation — skip 12-hour wait)
//   </button>
//
// ─────────────────────────────────────────────────────────────
