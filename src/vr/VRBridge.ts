// ⚡ Sifter Skill_Up — VR Bridge Layer
// This file defines the complete contract between the React Native app and
// the future Unity/VR environment. All functions are currently no-ops that
// log intent. When the Unity build is ready, replace implementations below
// with real bridge calls (react-native-unity-view or Expo native module).
//
// ARCHITECTURE NOTE:
// The VRBridge is a singleton service. Every VR-capable level knows its
// vrScenario key. LessonScreen checks for a vrScenario on boss completion
// and offers the VR experience. The bridge handles the handoff.

import { Platform } from 'react-native';

// ── VR Scenario Keys ──────────────────────────────────────────────────────
// These keys are referenced in quantLevels.ts vrScenario fields.
// Each key maps to a Unity scene in the VR build.
export type VRScenarioKey =
  | 'bayesian_trading_floor_intro'
  | 'regression_desk_simulation'
  | 'portfolio_matrix_builder'
  | 'delta_hedging_simulation'
  | 'options_greeks_trading_floor'
  | 'jane_street_interview_simulation'
  // Future scenarios (Phase B — Researcher & Developer tracks)
  | 'stochastic_calculus_visualiser'
  | 'ml_alpha_research_lab'
  | 'low_latency_execution_engine'
  | 'systematic_strategy_builder';

// ── VR Session Result ─────────────────────────────────────────────────────
export interface VRSessionResult {
  scenarioKey: VRScenarioKey;
  userId: string;
  completedAt: string;             // ISO timestamp
  score: number;                   // 0–100
  calibrationError?: number;       // average distance from correct posterior
  reasoningQuality?: number;       // 0–1, AI evaluation of verbal reasoning
  decisionsCorrect: number;
  decisionsTotal: number;
  sessionDurationSeconds: number;
  feedbackSummary: string;         // AI-generated debrief
  vrHeadset?: string;              // device identifier e.g. "Meta Quest 3"
  handTrackingUsed?: boolean;
}

// ── VR Capability Check ───────────────────────────────────────────────────
export interface VRCapability {
  available: boolean;
  reason?: string;       // why unavailable
  headsetDetected?: string;
  unityBuildVersion?: string;
}

// ── VR Session Config ─────────────────────────────────────────────────────
export interface VRSessionConfig {
  scenarioKey: VRScenarioKey;
  userId: string;
  userDisplayName: string;
  difficultyLevel: 'training' | 'assessment' | 'elite';
  timeLimit?: number;              // seconds, undefined = no limit
  enableHaptics?: boolean;
  enableSpatialAudio?: boolean;
  enableAICoach?: boolean;         // real-time AI feedback during session
  priorSessionResult?: VRSessionResult; // for adaptive difficulty
}

// ── Bridge Implementation ─────────────────────────────────────────────────

class VRBridgeService {
  private _sessionActive = false;
  private _onSessionComplete?: (result: VRSessionResult) => void;

  // ── Capability check ────────────────────────────────────────
  async checkVRCapability(): Promise<VRCapability> {
    // STUB: In production, this would query the Unity runtime
    // for headset availability, check if the VR build is installed,
    // and verify device compatibility.
    //
    // Production implementation:
    // const response = await NativeModules.SifterVRBridge.checkCapability();
    // return response;

    console.log('[VRBridge] Capability check — VR build not yet connected');
    return {
      available: false,
      reason: 'VR build coming soon. Complete this level to unlock the VR experience when it launches.',
      headsetDetected: undefined,
      unityBuildVersion: undefined,
    };
  }

  // ── Launch a VR scenario ────────────────────────────────────
  async launchScenario(
    config: VRSessionConfig,
    onComplete: (result: VRSessionResult) => void,
  ): Promise<{ launched: boolean; error?: string }> {
    if (this._sessionActive) {
      return { launched: false, error: 'A VR session is already active.' };
    }

    // STUB: In production, this would:
    // 1. Serialise config to JSON
    // 2. Call NativeModules.SifterVRBridge.launchScenario(JSON.stringify(config))
    // 3. Register the onComplete callback to fire when Unity calls back
    // 4. The Unity scene reads the config and starts the scenario

    console.log('[VRBridge] Launch requested:', config.scenarioKey, '— VR build not yet connected');
    console.log('[VRBridge] Config:', JSON.stringify(config, null, 2));

    this._onSessionComplete = onComplete;
    this._sessionActive = false; // stays false until build is connected

    return {
      launched: false,
      error: 'VR environment not yet connected. Your progress is saved — you will be notified when VR launches.',
    };
  }

  // ── Receive result from Unity (called by native module) ─────
  onSessionResult(resultJson: string): void {
    // STUB: In production, this method is called by the native Unity bridge
    // when the VR session completes. The Unity scene serialises the result
    // and calls back to React Native.
    //
    // Production implementation:
    // NativeEventEmitter.addListener('VRSessionComplete', (data) => {
    //   this.onSessionResult(data.resultJson);
    // });

    try {
      const result: VRSessionResult = JSON.parse(resultJson);
      this._sessionActive = false;
      this._onSessionComplete?.(result);
      this._onSessionComplete = undefined;
      console.log('[VRBridge] Session result received:', result.scenarioKey, result.score);
    } catch (e) {
      console.error('[VRBridge] Failed to parse session result:', e);
    }
  }

  // ── Abort active session ────────────────────────────────────
  async abortSession(): Promise<void> {
    // STUB: NativeModules.SifterVRBridge.abortSession()
    this._sessionActive = false;
    this._onSessionComplete = undefined;
    console.log('[VRBridge] Session aborted');
  }

  // ── Scenario metadata ───────────────────────────────────────
  getScenarioInfo(key: VRScenarioKey): VRScenarioInfo {
    return VR_SCENARIO_INFO[key] ?? {
      key,
      title: 'VR Experience',
      description: 'Coming soon.',
      estimatedMinutes: 15,
      requiresHaptics: false,
      type: 'training',
    };
  }

  get isSessionActive() {
    return this._sessionActive;
  }
}

// ── Singleton export ──────────────────────────────────────────
export const VRBridge = new VRBridgeService();

// ── Scenario info catalogue ───────────────────────────────────
export interface VRScenarioInfo {
  key: VRScenarioKey;
  title: string;
  description: string;
  estimatedMinutes: number;
  requiresHaptics: boolean;
  type: 'training' | 'assessment' | 'simulation';
  vrEnvironment?: string;  // Unity scene name
}

export const VR_SCENARIO_INFO: Record<VRScenarioKey, VRScenarioInfo> = {
  bayesian_trading_floor_intro: {
    key: 'bayesian_trading_floor_intro',
    title: 'Bayesian Trading Floor',
    description:
      'You are a junior quant analyst on a simulated trading floor. Market signals arrive in real time. Update your probability estimates after each signal. Your calibration score determines your seat at the desk.',
    estimatedMinutes: 12,
    requiresHaptics: false,
    type: 'training',
    vrEnvironment: 'TradingFloor_Bayesian',
  },

  regression_desk_simulation: {
    key: 'regression_desk_simulation',
    title: 'The Signal-or-Noise Desk',
    description:
      'A strategy report lands on your desk. Evaluate it for statistical validity. Spot the multiple comparisons trap. Apply Bonferroni corrections. Decide whether to recommend capital allocation. AI analyst assistant argues with your conclusions.',
    estimatedMinutes: 15,
    requiresHaptics: false,
    type: 'training',
    vrEnvironment: 'ResearchDesk_Statistics',
  },

  portfolio_matrix_builder: {
    key: 'portfolio_matrix_builder',
    title: 'Portfolio Matrix Builder',
    description:
      'Construct a 20-asset portfolio under realistic constraints. The covariance matrix updates live as market conditions shift. Visualise the efficient frontier in three-dimensional space. Rebalance under new constraints in real time.',
    estimatedMinutes: 18,
    requiresHaptics: true,
    type: 'training',
    vrEnvironment: 'PortfolioLab_LinearAlgebra',
  },

  delta_hedging_simulation: {
    key: 'delta_hedging_simulation',
    title: 'Delta Hedging Simulator',
    description:
      'You hold a live options book. Stock prices move in real time. Hedge your delta. Monitor gamma, theta, vega. A volatility spike arrives mid-session. Your P&L depends on how well you maintained your hedge.',
    estimatedMinutes: 20,
    requiresHaptics: true,
    type: 'simulation',
    vrEnvironment: 'OptionsDesk_Greeks',
  },

  options_greeks_trading_floor: {
    key: 'options_greeks_trading_floor',
    title: 'Options Greeks Trading Floor',
    description:
      'Full options trading floor simulation. Multiple positions across strikes and expiries. Real-time P&L attribution by Greek. Earnings announcement drops mid-session — IV collapses. Manage vega exposure while maintaining delta neutrality.',
    estimatedMinutes: 25,
    requiresHaptics: true,
    type: 'simulation',
    vrEnvironment: 'TradingFloor_Options',
  },

  jane_street_interview_simulation: {
    key: 'jane_street_interview_simulation',
    title: 'Jane Street Interview Room',
    description:
      'Three problems. Ninety minutes. An AI interviewer across the table. The room goes quiet when you stop talking. Problem 1: linear algebra. Problem 2: conditional probability. Problem 3: dynamic programming under time pressure. Your reasoning is scored, not just your answers.',
    estimatedMinutes: 90,
    requiresHaptics: false,
    type: 'assessment',
    vrEnvironment: 'InterviewRoom_JaneStreet',
  },

  stochastic_calculus_visualiser: {
    key: 'stochastic_calculus_visualiser',
    title: 'Stochastic Calculus Visualiser',
    description:
      'Walk through the derivation of Black-Scholes in an immersive mathematical environment. See Brownian paths rendered in 3D. Visualise the Itô integral. Watch the delta-hedge portfolio become riskless in real time.',
    estimatedMinutes: 20,
    requiresHaptics: false,
    type: 'training',
    vrEnvironment: 'MathLab_StochasticCalc',
  },

  ml_alpha_research_lab: {
    key: 'ml_alpha_research_lab',
    title: 'ML Alpha Research Lab',
    description:
      'Build a machine learning alpha signal from raw data in a fully equipped virtual research lab. Feature engineering, model selection, cross-validation, out-of-sample testing — under time pressure with a simulated head of research watching.',
    estimatedMinutes: 30,
    requiresHaptics: false,
    type: 'simulation',
    vrEnvironment: 'ResearchLab_ML',
  },

  low_latency_execution_engine: {
    key: 'low_latency_execution_engine',
    title: 'Low-Latency Execution Engine',
    description:
      'Build and test a trading execution engine in a virtual server room. WebSocket data feeds, order routing, latency measurement. A simulated market impact event tests your system\'s resilience.',
    estimatedMinutes: 25,
    requiresHaptics: false,
    type: 'simulation',
    vrEnvironment: 'ServerRoom_Execution',
  },

  systematic_strategy_builder: {
    key: 'systematic_strategy_builder',
    title: 'Systematic Strategy Builder',
    description:
      'Design a complete systematic trading strategy from hypothesis to live deployment in a virtual quant lab. Walk through the backtesting pipeline, identify overfitting, apply corrections, present your strategy to a virtual investment committee.',
    estimatedMinutes: 35,
    requiresHaptics: false,
    type: 'assessment',
    vrEnvironment: 'QuantLab_Strategy',
  },
};
