import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Modal, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QUANT_LABS, isQuantLabUnlocked, type QuantLab } from '@/data/quantIslands';
import { QUANT_LEVELS } from '@/data/quantLevels';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { Spacing, Radius, FontSize, FontWeight, Shadow, useTheme, webContainer, type ColorPalette } from '@/theme';
import LessonScreen from './LessonScreen';
import { VRBridge } from '@/lib/vrBridge';
import type { VRScenarioKey } from '@/lib/vrBridge';
import DisclaimerFooter from '@/components/DisclaimerFooter';
import TrackScene from '@/components/artwork/TrackIsometricScene';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebSectionLabel, WebStatTile, WebListRow, useIsWebWide,
} from '@/components/web/WebGrid';

const TIER_COLORS = {
  foundation: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#8b5cf6',
  elite: '#ef4444',
};

const TIER_LABELS = {
  foundation: 'Foundation',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};

interface TrackDashboardConfig {
  title: string;
  subtitle: string;
  accentColor: string;
  statsLabel: string;
  perfCardTitle: string;
  perfCardStat1Label: string;
  perfCardStat1Value: string;
  perfCardStat2Label: string;
  perfCardStat2Value: string;
  labCardTitle: string;
  labCardStat1: string;
  labCardStat2: string;
  simCardTitle: string;
  simStat1: string;
  simStat2: string;
  notifText: string;
  ctaButtonLabel: string;
}

const TRACK_DASHBOARD_CONFIG: Record<string, TrackDashboardConfig> = {
  'quant-trader': {
    title: 'Quant Trading Dashboard',
    subtitle: 'Master the markets with elite quantitative models.',
    accentColor: '#1D4ED8',
    statsLabel: 'Quant Trading Performance Overview',
    perfCardTitle: 'Active Algorithms & Sharpe Ratio',
    perfCardStat1Label: 'Active Algorithms',
    perfCardStat1Value: '4',
    perfCardStat2Label: 'Sharpe Ratio',
    perfCardStat2Value: '2.8',
    labCardTitle: 'Strategy Lab',
    labCardStat1: 'In Development: 2',
    labCardStat2: 'Next: Alpha Generation',
    simCardTitle: 'Backtesting',
    simStat1: 'Total Runs: 12',
    simStat2: 'CAGR: 12% · Drawdown: 5.1%',
    notifText: 'Alert: Volatility Surface Anomaly in SPX Option Chain',
    ctaButtonLabel: '⚡ Connect Market Data Feeds',
  },
  'supply-chain-analyst': {
    title: 'Supply Chain Dashboard',
    subtitle: 'Optimize every node from source to shelf.',
    accentColor: '#0EA5E9',
    statsLabel: 'Supply Chain Performance Overview',
    perfCardTitle: 'Active Workflows & Efficiency',
    perfCardStat1Label: 'Active Workflows',
    perfCardStat1Value: '3',
    perfCardStat2Label: 'Efficiency Score',
    perfCardStat2Value: '87%',
    labCardTitle: 'Operations Lab',
    labCardStat1: 'Models in Dev: 2',
    labCardStat2: 'Next: Demand Forecasting',
    simCardTitle: 'Historical Simulations',
    simStat1: 'Total Runs: 8',
    simStat2: 'Cost Reduction: 9.3% · Fill Rate: 96%',
    notifText: 'Alert: Port congestion risk detected on Pacific route',
    ctaButtonLabel: '🔗 Connect ERP Data Feed',
  },
  'onchain-analyst': {
    title: 'Onchain Intelligence Dashboard',
    subtitle: 'Follow the money. Trace every wallet.',
    accentColor: '#3B82F6',
    statsLabel: 'Onchain Analysis Performance',
    perfCardTitle: 'Active Investigations & Signal Score',
    perfCardStat1Label: 'Active Investigations',
    perfCardStat1Value: '5',
    perfCardStat2Label: 'Signal Accuracy',
    perfCardStat2Value: '91%',
    labCardTitle: 'Protocol Lab',
    labCardStat1: 'Wallets Flagged: 3',
    labCardStat2: 'Next: MEV Bot Tracing',
    simCardTitle: 'Historical Wallet Activity',
    simStat1: 'Wallets Analysed: 24',
    simStat2: 'Funds Traced: $2.4M · Accuracy: 88%',
    notifText: 'Alert: Large wallet movement detected — $4.2M USDC',
    ctaButtonLabel: '🔍 Connect Etherscan API',
  },
  'defi-researcher': {
    title: 'DeFi Research Dashboard',
    subtitle: 'Analyse protocols, yield, and liquidity flows.',
    accentColor: '#10B981',
    statsLabel: 'DeFi Protocol Performance Overview',
    perfCardTitle: 'Protocols Tracked & Yield',
    perfCardStat1Label: 'Protocols Tracked',
    perfCardStat1Value: '6',
    perfCardStat2Label: 'Best APR Found',
    perfCardStat2Value: '24.3%',
    labCardTitle: 'Yield Lab',
    labCardStat1: 'Proposals Tracked: 4',
    labCardStat2: 'Next: Liquidity Depth Analysis',
    simCardTitle: 'Yield Simulations',
    simStat1: 'Total Runs: 9',
    simStat2: 'Avg Yield: 18.7% · Max Drawdown: 12%',
    notifText: 'Alert: Governance vote live — Uniswap fee tier proposal',
    ctaButtonLabel: '🌊 Connect DeFi Data Feeds',
  },
  'cairo-builder': {
    title: 'Cairo Builder Dashboard',
    subtitle: 'Deploy contracts. Ship on Starknet.',
    accentColor: '#F59E0B',
    statsLabel: 'Contract Deployment Overview',
    perfCardTitle: 'Deployed Contracts & Coverage',
    perfCardStat1Label: 'Contracts Deployed',
    perfCardStat1Value: '4',
    perfCardStat2Label: 'Test Coverage',
    perfCardStat2Value: '78%',
    labCardTitle: 'Cairo Lab',
    labCardStat1: 'Contracts in Draft: 2',
    labCardStat2: 'Next: Storage Optimization',
    simCardTitle: 'Sepolia Test Runs',
    simStat1: 'Total Test Runs: 18',
    simStat2: 'Pass Rate: 89% · Avg Gas: 14,200',
    notifText: 'Alert: Starknet Sepolia faucet funded — ready to deploy',
    ctaButtonLabel: '⚡ Connect Starknet RPC',
  },
  'starknet-defi-navigator': {
    title: 'Starknet DeFi Dashboard',
    subtitle: 'Live pool data, yield, and on-chain execution.',
    accentColor: '#F59E0B',
    statsLabel: 'Starknet DeFi Performance',
    perfCardTitle: 'Live Pools & Yield Monitor',
    perfCardStat1Label: 'Pools Tracked',
    perfCardStat1Value: '7',
    perfCardStat2Label: 'Best Pool APR',
    perfCardStat2Value: '31.2%',
    labCardTitle: 'StarkZap Lab',
    labCardStat1: 'Txns Executed: 6',
    labCardStat2: 'Next: Multi-hop Swap',
    simCardTitle: 'Historical Pool Runs',
    simStat1: 'Total Simulations: 11',
    simStat2: 'IL Exposure: 3.2% · Best Route: JediSwap',
    notifText: 'Alert: JediSwap pool rebalance detected — opportunity window',
    ctaButtonLabel: '🧭 Connect Starknet Wallet',
  },
  'bug-bounty-hunter': {
    title: 'Bug Bounty Dashboard',
    subtitle: 'Find vulnerabilities. Report. Get paid.',
    accentColor: '#EF4444',
    statsLabel: 'Bounty Hunt Performance',
    perfCardTitle: 'Active Hunts & Severity Score',
    perfCardStat1Label: 'Active Hunts',
    perfCardStat1Value: '3',
    perfCardStat2Label: 'Avg Severity',
    perfCardStat2Value: 'High',
    labCardTitle: 'Recon Lab',
    labCardStat1: 'Targets Mapped: 5',
    labCardStat2: 'Next: Exploit PoC Development',
    simCardTitle: 'Historical Reports',
    simStat1: 'Reports Submitted: 7',
    simStat2: 'Accepted: 5 · Bounty Est: $4,800',
    notifText: 'Alert: New scope added to Immunefi — Aave V3 contracts',
    ctaButtonLabel: '🐛 Connect Immunefi Feed',
  },
};

const DEFAULT_DASHBOARD_CONFIG: TrackDashboardConfig = {
  title: 'Track Dashboard',
  subtitle: 'Select a track to see your progress overview.',
  accentColor: '#111111',
  statsLabel: 'Track Performance',
  perfCardTitle: 'Progress Overview',
  perfCardStat1Label: 'Labs Completed',
  perfCardStat1Value: '—',
  perfCardStat2Label: 'Score',
  perfCardStat2Value: '—',
  labCardTitle: 'Practice Lab',
  labCardStat1: 'No active track',
  labCardStat2: 'Go to Career Tracks to begin',
  simCardTitle: 'Simulation History',
  simStat1: 'No runs yet',
  simStat2: '—',
  notifText: 'Select a track from Career Tracks to see your dashboard.',
  ctaButtonLabel: '🧭 Explore Tracks',
};

type LabState = 'locked' | 'continue' | 'review' | 'ready';

function getFirstActiveLab(completedLevels: number[]) {
  return QUANT_LABS.find(lab => isQuantLabUnlocked(lab, completedLevels) && !completedLevels.includes(lab.bossLevel));
}

function getLabState(lab: QuantLab, completedLevels: number[]): LabState {
  if (!isQuantLabUnlocked(lab, completedLevels)) return 'locked';
  if (completedLevels.includes(lab.bossLevel)) return 'review';
  if (getFirstActiveLab(completedLevels)?.id === lab.id) return 'continue';
  return 'ready';
}

function LevelDot({ levelId, labColor, onPress, completed, isBoss, locked, interviewStyle }: {
  levelId: number; labColor: string; onPress: () => void;
  completed: boolean; isBoss: boolean; locked: boolean; interviewStyle?: boolean;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const size = isBoss ? 54 : 42;
  const bg = locked ? colors.borderRole.subtle : completed ? labColor : colors.surface.inverse;
  const border = locked ? colors.borderDark : labColor;
  const emoji = locked ? 'L' : isBoss ? (interviewStyle ? 'X' : 'B') : undefined;

  return (
    <TouchableOpacity
      onPress={locked ? undefined : onPress}
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: border },
        !locked && Shadow.sm,
      ]}
      activeOpacity={locked ? 1 : 0.8}
    >
      {emoji
        ? <Text style={{ fontSize: isBoss ? 18 : 14, fontWeight: '800' }}>{emoji}</Text>
        : <Text style={[styles.dotText, { color: completed ? colors.textRole.inverse : labColor, fontSize: isBoss ? 16 : 12 }]}>
            {String(levelId - 1000)}
          </Text>}
    </TouchableOpacity>
  );
}

function LabCard({ lab, completedLevels, onLevelPress, unlocked }: {
  lab: QuantLab; completedLevels: number[];
  onLevelPress: (id: number) => void; unlocked: boolean;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [expanded, setExpanded] = useState(false);
  const total = lab.end - lab.start + 1;
  const done = completedLevels.filter(l => l >= lab.start && l <= lab.end).length;
  const pct = Math.round((done / total) * 100);
  const tierColor = TIER_COLORS[lab.tier];
  const state = getLabState(lab, completedLevels);
  const stateColor = state === 'review' ? '#10B981' : state === 'continue' ? lab.color : state === 'ready' ? tierColor : colors.textRole.muted;
  const stateLabel = state === 'review' ? 'Review' : state === 'continue' ? 'Continue' : state === 'ready' ? 'Start' : 'Locked';

  const levels = Array.from({ length: total }, (_, i) => lab.start + i);
  const rows: number[][] = [];
  for (let i = 0; i < levels.length; i += 5) rows.push(levels.slice(i, i + 5));

  return (
    <View style={[styles.labCard, !unlocked && styles.labCardLocked, Shadow.md]}>
      <TouchableOpacity
        style={[styles.labHeader, { backgroundColor: lab.color }]}
        onPress={() => unlocked && setExpanded(e => !e)}
        activeOpacity={unlocked ? 0.85 : 1}
      >
        <Text style={styles.labIcon}>{lab.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={[styles.tierPill, { backgroundColor: tierColor + '30' }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>{TIER_LABELS[lab.tier].toUpperCase()}</Text>
          </View>
          <Text style={styles.labName}>{lab.name}</Text>
          <Text style={styles.labSubtitle}>{lab.subtitle}</Text>
        </View>
        <View style={[styles.stateBadge, { backgroundColor: `${stateColor}22` }]}>
          <Text style={[styles.stateBadgeText, { color: stateColor }]}>{stateLabel}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.labBody}>
        <Text style={styles.labDesc}>{lab.description}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: lab.color }]} />
          </View>
          <Text style={styles.progressLabel}>{done}/{total} · {pct}%</Text>
        </View>

        <Text style={styles.stateHelper}>
          {state === 'review'
            ? 'Boss cleared and ready to revisit.'
            : state === 'continue'
              ? 'Best next lab in the trader sequence.'
              : state === 'ready'
                ? 'Unlocked and ready to enter.'
                : `Complete Level ${lab.requiredLevel - 1000} boss to unlock.`}
        </Text>

        {lab.vrScenario && done >= total && (
          <View style={[styles.vrBadge, { borderColor: lab.color }]}>
            <Text style={styles.vrBadgeIcon}>VR</Text>
            <Text style={[styles.vrBadgeText, { color: lab.color }]}>Scenario unlocked</Text>
          </View>
        )}
      </View>

      {unlocked && expanded ? (
        <View style={styles.levelGrid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.levelRow}>
              {row.map(lvl => {
                const ql = QUANT_LEVELS[lvl];
                return (
                  <LevelDot
                    key={lvl}
                    levelId={lvl}
                    labColor={lab.color}
                    completed={completedLevels.includes(lvl)}
                    isBoss={lvl === lab.bossLevel}
                    locked={false}
                    interviewStyle={ql?.interviewStyle}
                    onPress={() => onLevelPress(lvl)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      ) : !unlocked ? (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedIcon}>LOCK</Text>
          <Text style={styles.lockedText}>
            Complete Level {lab.requiredLevel - 1000} boss to unlock
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function VRPromptModal({ visible, scenarioKey, labName, onDismiss }: {
  visible: boolean; scenarioKey: VRScenarioKey | undefined;
  labName: string; onDismiss: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  if (!scenarioKey) return null;
  const info = VRBridge.getScenarioInfo(scenarioKey);

  const launchVR = async () => {
    const { launched, error } = await VRBridge.launchScenario(
      { scenarioKey, userId: 'user', userDisplayName: 'Trader', difficultyLevel: 'training' },
      (result) => {
        Alert.alert('VR Session Complete', `Score: ${result.score}/100\n${result.feedbackSummary}`);
      }
    );
    if (!launched) {
      Alert.alert('VR Coming Soon', error ?? 'VR environment launching soon. Your progress is saved.');
    }
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.vrOverlay}>
        <View style={[styles.vrModal, Shadow.md]}>
          <Text style={styles.vrModalIcon}>VR</Text>
          <Text style={styles.vrModalTitle}>Scenario Unlocked</Text>
          <Text style={styles.vrModalLab}>{labName}</Text>
          <Text style={styles.vrModalName}>{info.title}</Text>
          <Text style={styles.vrModalDesc}>{info.description}</Text>
          <View style={styles.vrModalMeta}>
            <Text style={styles.vrMetaItem}>~{info.estimatedMinutes} min</Text>
            <Text style={styles.vrMetaItem}>{info.type}</Text>
            {info.requiresHaptics && <Text style={styles.vrMetaItem}>Haptics</Text>}
          </View>
          <TouchableOpacity style={styles.vrLaunchBtn} onPress={launchVR} activeOpacity={0.85}>
            <Text style={styles.vrLaunchBtnText}>Launch VR Experience</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.vrDismissBtn} onPress={onDismiss}>
            <Text style={styles.vrDismissBtnText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function QuantHeader({ completedLevels }: { completedLevels: number[] }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const total = Object.keys(QUANT_LEVELS).length;
  const done = completedLevels.filter(l => l >= 1001 && l <= 1090).length;
  const labsDone = QUANT_LABS.filter(lab =>
    completedLevels.includes(lab.bossLevel)
  ).length;
  const currentLab = getFirstActiveLab(completedLevels);

  return (
    <View style={[styles.header, { backgroundColor: colors.surface.raised, borderBottomColor: colors.borderRole.subtle }]}>
      <View style={styles.headerTop}>
        <Text style={[styles.headerEyebrow, { color: colors.textRole.muted }]}>Quant Workspace</Text>
        <Text style={styles.headerTitle}>Quant Program</Text>
        <Text style={styles.headerSub}>Trader Track · {currentLab ? `${currentLab.name} next` : 'Review ready'}</Text>
      </View>
      <View style={styles.headerStats}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{done}</Text>
          <Text style={styles.statLabel}>Levels</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{labsDone}</Text>
          <Text style={styles.statLabel}>Labs Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
      <View style={styles.overallBar}>
        <View style={[styles.overallFill, { width: `${Math.round((done / total) * 100)}%` }]} />
      </View>
      <Text style={styles.overallLabel}>{Math.round((done / total) * 100)}% complete</Text>
    </View>
  );
}

export default function QuantMapScreen() {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { user } = useAuth();
  const { completeLevel } = useProgress();
  const isWebWide = useIsWebWide();
  const screenWidth = Dimensions.get('window').width;
  const activeTrackId = user?.active_track ?? '';
  const cfg = TRACK_DASHBOARD_CONFIG[activeTrackId] ?? DEFAULT_DASHBOARD_CONFIG;
  const accentColor = cfg.accentColor;
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [vrPrompt, setVrPrompt] = useState<{ scenarioKey: VRScenarioKey; labName: string } | null>(null);

  const completed: number[] = (user?.completed_levels ?? []).map(l => typeof l === 'string' ? parseInt(l, 10) : l).filter((n): n is number => !isNaN(n));
  const currentLab = useMemo(() => getFirstActiveLab(completed), [completed]);

  const dashboardHeader = (
    <>
      <View style={dashStyles.headerRow}>
        <View style={dashStyles.headerCopy}>
          <Text style={[dashStyles.headerTitle, { color: colors.textRole.primary }]}>
            {cfg.title}
          </Text>
          <Text style={[dashStyles.headerSubtitle, { color: colors.textRole.secondary }]}>
            {cfg.subtitle}
          </Text>
        </View>
        <View style={[dashStyles.notifCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[dashStyles.notifLabel, { color: colors.textRole.muted }]}>NOTIFICATION</Text>
          <Text style={[dashStyles.notifText, { color: colors.textRole.secondary }]}>{cfg.notifText}</Text>
          <TouchableOpacity
            style={[dashStyles.ctaButton, { backgroundColor: colors.navy }]}
          >
            <Text style={[dashStyles.ctaButtonText, { color: colors.textRole.inverse }]}>
              {cfg.ctaButtonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[dashStyles.scenePanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <Text style={[dashStyles.scenePanelTitle, { color: colors.textRole.primary }]}>
          {cfg.statsLabel}
        </Text>
        <Text style={[dashStyles.scenePanelSub, { color: colors.textRole.muted }]}>
          Map your expertise across sectors.
        </Text>
        <TrackScene
          trackId={activeTrackId}
          accentColor={accentColor}
          width={isWebWide ? 560 : screenWidth - 48}
          height={isWebWide ? 300 : 200}
        />
      </View>

      <Text style={[dashStyles.statsSection, { color: colors.textRole.muted }]}>
        {cfg.statsLabel}
      </Text>
      <View style={dashStyles.statsRow}>
        <View style={[dashStyles.statsCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[dashStyles.statsCardTitle, { color: colors.textRole.primary }]}>
            {cfg.perfCardTitle}
          </Text>
          <View style={dashStyles.statsCardRow}>
            <Text style={[dashStyles.statsCardLabel, { color: colors.textRole.muted }]}>
              {cfg.perfCardStat1Label}
            </Text>
            <Text style={[dashStyles.statsCardValue, { color: accentColor }]}>
              {cfg.perfCardStat1Value}
            </Text>
          </View>
          <View style={dashStyles.statsCardRow}>
            <Text style={[dashStyles.statsCardLabel, { color: colors.textRole.muted }]}>
              {cfg.perfCardStat2Label}
            </Text>
            <Text style={[dashStyles.statsCardValue, { color: accentColor }]}>
              {cfg.perfCardStat2Value}
            </Text>
          </View>
        </View>

        <View style={[dashStyles.statsCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[dashStyles.statsCardTitle, { color: colors.textRole.primary }]}>
            {cfg.labCardTitle}
          </Text>
          <Text style={[dashStyles.statsCardBody, { color: colors.textRole.secondary }]}>
            {cfg.labCardStat1}
          </Text>
          <Text style={[dashStyles.statsCardBody, { color: colors.textRole.secondary }]}>
            {cfg.labCardStat2}
          </Text>
        </View>

        <View style={[dashStyles.statsCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[dashStyles.statsCardTitle, { color: colors.textRole.primary }]}>
            {cfg.simCardTitle}
          </Text>
          <Text style={[dashStyles.statsCardBody, { color: colors.textRole.secondary }]}>
            {cfg.simStat1}
          </Text>
          <Text style={[dashStyles.statsCardBody, { color: colors.textRole.secondary }]}>
            {cfg.simStat2}
          </Text>
        </View>
      </View>

      <View style={[dashStyles.divider, { backgroundColor: colors.borderRole.subtle }]} />
    </>
  );

  const handleLevelPress = (id: number) => setActiveLevelId(id);

  const handleLevelComplete = async (stars: number, xp: number) => {
    if (!activeLevelId) return;
    await completeLevel(activeLevelId, 'quant-trader', xp, stars === 3);
    const ql = QUANT_LEVELS[activeLevelId];
    const lab = QUANT_LABS.find(l => l.bossLevel === activeLevelId);
    if (ql?.vrUnlock && lab?.vrScenario) {
      setTimeout(() => {
        setVrPrompt({ scenarioKey: lab.vrScenario as VRScenarioKey, labName: lab.name });
      }, 600);
    }
    setActiveLevelId(null);
  };

  if (activeLevelId) {
    const ql = QUANT_LEVELS[activeLevelId];
    if (!ql) { setActiveLevelId(null); return null; }
    return (
      <LessonScreen
        levelId={activeLevelId}
        onExit={() => setActiveLevelId(null)}
        onComplete={handleLevelComplete}
      />
    );
  }

  if (isWebWide) {
    const completedCount = completed.length;
    const totalLevels = Object.keys(QUANT_LEVELS).length;
    const labsUnlocked = QUANT_LABS.filter(l => isQuantLabUnlocked(l, completed)).length;

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
        <WebShell>
          {dashboardHeader}
          <WebPageHeader
            title="Quant Quarter"
            subtitle={`${completedCount} / ${totalLevels} levels complete · ${labsUnlocked} labs unlocked`}
            accentColor={colors.accentRole.action}
          />

          <WebRow>
            <WebCol weight={1}>
              <WebCard title="Your Progress" accentBar accentColor={colors.accentRole.action}>
                <WebStatTile emoji="OK" label="Levels Done" value={`${completedCount}`} sub={`of ${totalLevels}`} color={colors.xpGreen} />
                <WebStatTile emoji="LB" label="Labs Unlocked" value={`${labsUnlocked}`} sub={`of ${QUANT_LABS.length}`} color={colors.accentRole.action} />
                <WebStatTile emoji="BS" label="Bosses Beaten" value={`${QUANT_LABS.filter(l => completed.includes(l.bossLevel)).length}`} sub="boss completions" color={colors.accentRole.status} />
              </WebCard>

              <WebCard title="Jump to Lab" accentBar accentColor={colors.accentRole.status} style={{ marginTop: 20 }}>
                {QUANT_LABS.map(lab => {
                  const state = getLabState(lab, completed);
                  return (
                    <WebListRow
                      key={lab.id}
                      icon={state === 'review' ? 'RV' : state === 'locked' ? 'LK' : 'GO'}
                      title={lab.name}
                      sub={`${lab.end - lab.start + 1} levels${lab.vrScenario ? ' · VR unlock' : ''}`}
                      onPress={state === 'locked' ? undefined : () => handleLevelPress(lab.start)}
                      right={
                        <View style={{
                          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                          backgroundColor: state === 'review'
                            ? colors.xpGreen + '20'
                            : state === 'locked'
                              ? colors.surface.subtle
                              : colors.accentRole.action + '20',
                        }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: state === 'review' ? colors.xpGreen : state === 'locked' ? colors.textRole.muted : colors.accentRole.action }}>
                            {state === 'review' ? 'Review' : state === 'continue' ? 'Continue' : state === 'ready' ? 'Start' : 'Locked'}
                          </Text>
                        </View>
                      }
                    />
                  );
                })}
              </WebCard>
            </WebCol>

            <WebCol weight={2}>
              <WebSectionLabel label="All Labs" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {QUANT_LABS.map(lab => {
                  const state = getLabState(lab, completed);
                  const accent = state === 'review' ? colors.xpGreen : state === 'locked' ? colors.textRole.muted : colors.accentRole.action;
                  return (
                    <View key={lab.id} style={{ width: '48%' }}>
                      <WebCard accentBar accentColor={accent} style={{ opacity: state === 'locked' ? 0.6 : 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <Text style={{ fontSize: 18 }}>{lab.icon ?? 'Q'}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textRole.primary }}>{lab.name}</Text>
                            <Text style={{ fontSize: 11, color: colors.textRole.muted, marginTop: 1 }}>
                              {state === 'review' ? 'Review complete run' : state === 'continue' ? 'Continue current run' : state === 'ready' ? 'Ready to start' : 'Locked path'}
                            </Text>
                          </View>
                        </View>
                        {lab.description ? (
                          <Text style={{ fontSize: 12, color: colors.textRole.secondary, lineHeight: 17, marginBottom: 10 }} numberOfLines={2}>
                            {lab.description}
                          </Text>
                        ) : null}
                        {lab.vrScenario && state !== 'locked' && (
                          <View style={{ backgroundColor: colors.accentRole.action + '18', borderRadius: Radius.sm, padding: 7, marginBottom: 10 }}>
                            <Text style={{ fontSize: 11, color: colors.accentRole.action, fontWeight: '700' }}>VR unlocks on boss</Text>
                          </View>
                        )}
                        {state !== 'locked' && state !== 'review' && (
                          <TouchableOpacity
                            style={{ backgroundColor: accent, borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' }}
                            onPress={() => handleLevelPress(lab.start)}
                          >
                            <Text style={{ color: colors.textRole.inverse, fontSize: 12, fontWeight: '700' }}>{state === 'continue' ? 'Continue Lab' : 'Start Lab'}</Text>
                          </TouchableOpacity>
                        )}
                      </WebCard>
                    </View>
                  );
                })}
              </View>
              <View style={{ height: 40 }} />
            </WebCol>
          </WebRow>
        </WebShell>

        <VRPromptModal
          visible={!!vrPrompt}
          scenarioKey={vrPrompt?.scenarioKey}
          labName={vrPrompt?.labName ?? ''}
          onDismiss={() => setVrPrompt(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface.base} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {dashboardHeader}
        <QuantHeader completedLevels={completed} />

        {QUANT_LABS.map(lab => (
          <LabCard
            key={lab.id}
            lab={lab}
            completedLevels={completed}
            onLevelPress={handleLevelPress}
            unlocked={isQuantLabUnlocked(lab, completed)}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {currentLab ? `${currentLab.name} is the best next lab.` : 'All current labs are ready for review.'}
          </Text>
          <Text style={styles.footerSub}>VR scenarios unlock from lab bosses. Researcher and builder tracks arrive in Phase B.</Text>
        </View>

        <DisclaimerFooter />
      </ScrollView>

      <VRPromptModal
        visible={!!vrPrompt}
        scenarioKey={vrPrompt?.scenarioKey}
        labName={vrPrompt?.labName ?? ''}
        onDismiss={() => setVrPrompt(null)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorPalette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.base },
  scroll: { flex: 1 },
  scrollContent: { ...webContainer, gap: Spacing.lg, paddingBottom: 18 },
  header: { backgroundColor: colors.navy, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md },
  headerTop: { gap: 2 },
  headerEyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '900', color: colors.textRole.inverse },
  headerSub: { fontSize: FontSize.sm, color: '#94a3b8', fontWeight: '600' },
  headerStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: FontSize.xl, fontWeight: '800', color: colors.textRole.inverse },
  statLabel: { fontSize: FontSize.xs, color: '#94a3b8', fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: '#334155' },
  overallBar: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  overallFill: { height: '100%', backgroundColor: colors.accentRole.action, borderRadius: 3 },
  overallLabel: { fontSize: FontSize.xs, color: '#94a3b8', textAlign: 'center', fontWeight: '600' },
  labCard: { backgroundColor: colors.surface.raised, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderRole.subtle },
  labCardLocked: { opacity: 0.65 },
  labHeader: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, alignItems: 'flex-start' },
  labIcon: { fontSize: 18, lineHeight: 22 },
  labName: { fontSize: FontSize.lg, fontWeight: '900', color: colors.textRole.inverse, marginTop: 2 },
  labSubtitle: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  tierPill: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  tierText: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  stateBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  stateBadgeText: { fontSize: 10, fontWeight: '800' },
  labBody: { padding: Spacing.lg, gap: Spacing.md },
  labDesc: { fontSize: FontSize.sm, color: colors.textRole.secondary, lineHeight: 20 },
  stateHelper: { fontSize: FontSize.xs, color: colors.textRole.muted, lineHeight: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressTrack: { flex: 1, height: 6, backgroundColor: colors.borderRole.subtle, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: FontSize.xs, color: colors.textRole.muted, fontWeight: '700', minWidth: 72, textAlign: 'right' },
  vrBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  vrBadgeIcon: { fontSize: 12, fontWeight: '800' },
  vrBadgeText: { fontSize: FontSize.xs, fontWeight: '800' },
  levelGrid: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.sm },
  levelRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-start' },
  dot: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontWeight: '800' },
  lockedOverlay: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  lockedIcon: { fontSize: 16, fontWeight: '800' },
  lockedText: { fontSize: FontSize.sm, color: colors.textRole.muted, fontWeight: '600', textAlign: 'center' },
  vrOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  vrModal: { backgroundColor: colors.surface.raised, borderRadius: Radius.xl, padding: Spacing.xl, width: '100%', maxWidth: 380, gap: Spacing.md },
  vrModalIcon: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  vrModalTitle: { fontSize: FontSize.lg, fontWeight: '900', color: colors.accentRole.action, textAlign: 'center' },
  vrModalLab: { fontSize: FontSize.sm, color: colors.textRole.secondary, textAlign: 'center', fontWeight: '600' },
  vrModalName: { fontSize: FontSize.xl, fontWeight: '900', color: colors.textRole.primary, textAlign: 'center' },
  vrModalDesc: { fontSize: FontSize.sm, color: colors.textRole.secondary, lineHeight: 20, textAlign: 'center' },
  vrModalMeta: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  vrMetaItem: { fontSize: FontSize.xs, color: colors.textRole.muted, fontWeight: '600' },
  vrLaunchBtn: { backgroundColor: colors.accentRole.action, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  vrLaunchBtnText: { color: colors.textRole.inverse, fontSize: FontSize.lg, fontWeight: '800' },
  vrDismissBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  vrDismissBtnText: { color: colors.textRole.secondary, fontSize: FontSize.sm, fontWeight: '600' },
  footer: { alignItems: 'center', gap: 6, paddingTop: Spacing.md },
  footerText: { fontSize: FontSize.sm, color: colors.textRole.secondary, fontWeight: '600', textAlign: 'center' },
  footerSub: { fontSize: FontSize.xs, color: colors.textRole.muted, textAlign: 'center' },
});

const dashStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  headerCopy: { flex: 1, minWidth: 200 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 340,
  },
  notifCard: {
    minWidth: 220,
    maxWidth: 280,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  notifLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  notifText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  ctaButton: {
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scenePanel: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  scenePanelTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  scenePanelSub: {
    fontSize: 11,
    marginBottom: 12,
  },
  statsSection: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statsCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  statsCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  statsCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsCardLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsCardValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  statsCardBody: {
    fontSize: 11,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    marginBottom: 20,
    marginHorizontal: -16,
  },
});

export function PythonGateBanner({ chaptersCompleted, required }: { chaptersCompleted: number; required: number }) {
  const done = chaptersCompleted >= required;
  return (
    <View style={{
      margin: Spacing.md,
      padding: Spacing.lg,
      borderRadius: Radius.lg,
      backgroundColor: done ? '#d1fae5' : '#fef3c7',
      borderWidth: 1.5,
      borderColor: done ? '#10b981' : '#f59e0b',
    }}>
      <Text style={{ fontSize: FontSize.sm, fontWeight: '800', color: done ? '#065f46' : '#92400e', marginBottom: 4 }}>
        {done ? 'Lab 8 Unlocked - Applied Quant Python' : 'Lab 8 Requires Python Foundations'}
      </Text>
      <Text style={{ fontSize: FontSize.xs, color: done ? '#065f46' : '#92400e', lineHeight: 18 }}>
        {done
          ? 'You have completed the Python prerequisites. Lab 8 implements everything from Labs 0-7 in real code.'
          : `Complete Python chapters 1-5 (${chaptersCompleted}/${required} done) before starting the Applied Quant Python lab.`}
      </Text>
    </View>
  );
}
