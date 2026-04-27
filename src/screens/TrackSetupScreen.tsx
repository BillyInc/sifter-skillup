/**
 * TrackSetupScreen - shown once when a user first enters a track.
 * Introduces the tools, prepares track assets, and primes technical setup.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Spacing, Radius, FontSize, Shadow, FontWeight, useTheme, webContainer,
} from '../theme';
import { SifterButton, SifterCard } from '../components/ui';

interface ToolDef {
  name: string;
  emoji: string;
  whatItIs: string;
  analogy: string;
  whyThisTrack: string;
}

interface PackageManagerDef {
  command: string;
  manager: string;
  whatItDoes: string;
  analogy: string;
  packages: { name: string; does: string }[];
}

interface TrackSetupConfig {
  tools: ToolDef[];
  packageManager?: PackageManagerDef;
  lazyAssets?: { id: string; label: string; sizeMB: number }[];
}

const TRACK_SETUPS: Record<string, TrackSetupConfig> = {
  'quant-trading': {
    tools: [
      {
        name: 'Python',
        emoji: '🐍',
        whatItIs: 'Python is the main programming language behind the track.',
        analogy: 'Think of it like Excel after it learned how to automate itself and scale to millions of rows.',
        whyThisTrack: 'Most quant workflows use Python for research, testing, and strategy building.',
      },
      {
        name: 'pandas',
        emoji: '🐼',
        whatItIs: 'pandas handles tables of market data.',
        analogy: 'It is like a spreadsheet inside your code, except filters and calculations happen at machine speed.',
        whyThisTrack: 'You will clean prices, calculate returns, and structure strategy data with it.',
      },
      {
        name: 'numpy',
        emoji: '🔢',
        whatItIs: 'numpy is the fast maths engine used under the hood.',
        analogy: 'It is like a calculator that works on thousands of numbers at once.',
        whyThisTrack: 'Volatility, correlations, and portfolio maths all rely on it.',
      },
    ],
    packageManager: {
      manager: 'pip',
      command: 'pip install pandas numpy matplotlib',
      whatItDoes: 'pip downloads Python libraries to your environment so your code can import and use them.',
      analogy: 'Think of it like installing specialist tools into your workstation before you start the job.',
      packages: [
        { name: 'pandas', does: 'Loads and shapes your price and trade tables.' },
        { name: 'numpy', does: 'Handles the fast numerical calculations.' },
        { name: 'matplotlib', does: 'Draws performance charts and visual checks.' },
      ],
    },
    lazyAssets: [{ id: 'python-sandbox', label: 'Python environment', sizeMB: 8.2 }],
  },
  'data-science': {
    tools: [
      {
        name: 'Python',
        emoji: '🐍',
        whatItIs: 'Python is the main language for analysis and modelling in this track.',
        analogy: 'It works like a Swiss Army knife for data: clean it, explore it, model it, and explain it.',
        whyThisTrack: 'It is the standard language used across data science roles.',
      },
      {
        name: 'scikit-learn',
        emoji: '🧠',
        whatItIs: 'scikit-learn is a machine-learning toolkit.',
        analogy: 'Think of it like a box of ready-made models that you can train on your own data.',
        whyThisTrack: 'It helps you practise core classification, regression, and evaluation workflows.',
      },
      {
        name: 'Jupyter Notebook',
        emoji: '📓',
        whatItIs: 'Jupyter is an interactive notebook for code and notes.',
        analogy: 'It feels like a document where some blocks are live code and others are explanations.',
        whyThisTrack: 'It makes iterative exploration easier to follow and review.',
      },
    ],
    packageManager: {
      manager: 'pip',
      command: 'pip install pandas scikit-learn jupyter',
      whatItDoes: 'Installs the Python libraries this track expects.',
      analogy: 'It is the setup pass that puts the right tools on your desk before the exercises begin.',
      packages: [
        { name: 'pandas', does: 'Loads and cleans datasets.' },
        { name: 'scikit-learn', does: 'Provides training and evaluation tools.' },
        { name: 'jupyter', does: 'Runs the notebook workflow used in labs.' },
      ],
    },
    lazyAssets: [{ id: 'python-sandbox', label: 'Python environment', sizeMB: 8.2 }],
  },
  'onchain-analysis': {
    tools: [
      {
        name: 'Etherscan',
        emoji: '🔍',
        whatItIs: 'Etherscan lets you inspect wallets, contracts, and transactions on Ethereum.',
        analogy: 'Think of it like a public record office where every on-chain move is searchable.',
        whyThisTrack: 'A lot of on-chain investigation starts by reading transaction history clearly.',
      },
      {
        name: 'Dune',
        emoji: '🦆',
        whatItIs: 'Dune turns blockchain data into queryable tables and dashboards.',
        analogy: 'It is like asking a giant spreadsheet questions with database syntax.',
        whyThisTrack: 'It helps you move from one wallet lookup to pattern-level analysis.',
      },
      {
        name: 'SQL',
        emoji: '🗄️',
        whatItIs: 'SQL is the language used to query structured data.',
        analogy: 'It is a precise search language for databases rather than a loose keyword search.',
        whyThisTrack: 'You will use it to pull the exact metrics you need from on-chain datasets.',
      },
    ],
    lazyAssets: [{ id: 'sql-sandbox', label: 'SQL practice environment', sizeMB: 3.1 }],
  },
  'smart-contract-dev': {
    tools: [
      {
        name: 'Solidity',
        emoji: '⛓️',
        whatItIs: 'Solidity is the main language used for Ethereum smart contracts.',
        analogy: 'It is like writing the exact rules for a machine that executes them automatically.',
        whyThisTrack: 'The contracts you build and read in this path live in Solidity.',
      },
      {
        name: 'Hardhat',
        emoji: '🔨',
        whatItIs: 'Hardhat is a smart-contract development environment.',
        analogy: 'It acts like a safe workshop where you can build, test, and debug before going live.',
        whyThisTrack: 'You need a repeatable testing flow before deploying contract code.',
      },
      {
        name: 'OpenZeppelin',
        emoji: '🛡️',
        whatItIs: 'OpenZeppelin provides audited contract building blocks.',
        analogy: 'It is like starting with trusted components instead of machining every part from raw metal.',
        whyThisTrack: 'It reduces avoidable risk and teaches standard patterns.',
      },
    ],
    packageManager: {
      manager: 'npm',
      command: 'npm install --save-dev hardhat @openzeppelin/contracts',
      whatItDoes: 'npm installs the JavaScript and Solidity packages used by the local project.',
      analogy: 'It is like stocking your workshop with the core tools and safe parts before building.',
      packages: [
        { name: 'hardhat', does: 'Runs local compile, test, and deployment workflows.' },
        { name: '@openzeppelin/contracts', does: 'Supplies standard contract modules and patterns.' },
      ],
    },
    lazyAssets: [{ id: 'solidity-sandbox', label: 'Solidity environment', sizeMB: 5.4 }],
  },
  'dapp-development': {
    tools: [
      {
        name: 'React',
        emoji: '⚛️',
        whatItIs: 'React builds the interface your users interact with.',
        analogy: 'It works like reusable UI building blocks that snap together into a full app.',
        whyThisTrack: 'Most modern dapp frontends are built with it.',
      },
      {
        name: 'ethers.js',
        emoji: '⛓️',
        whatItIs: 'ethers.js connects your frontend to wallets and contracts.',
        analogy: 'It is the translator between your interface and blockchain actions.',
        whyThisTrack: 'Without it, your app cannot read chain data or request signatures.',
      },
      {
        name: 'Wagmi',
        emoji: '🔌',
        whatItIs: 'Wagmi simplifies wallet connection flows in React.',
        analogy: 'Think of it as prebuilt wallet plumbing so you can focus on product logic.',
        whyThisTrack: 'It handles common wallet UX patterns cleanly.',
      },
    ],
    packageManager: {
      manager: 'npm',
      command: 'npm install ethers wagmi viem',
      whatItDoes: 'Installs the frontend packages used to build and connect the dapp.',
      analogy: 'It is the step where you bring the right client-side tools into the project.',
      packages: [
        { name: 'ethers', does: 'Reads chain data and sends transactions.' },
        { name: 'wagmi', does: 'Handles wallet hooks and connection state.' },
        { name: 'viem', does: 'Supports low-level chain encoding and data handling.' },
      ],
    },
    lazyAssets: [{ id: 'js-sandbox', label: 'JavaScript environment', sizeMB: 4.8 }],
  },
  'supply-chain-analyst': {
    tools: [
      {
        name: 'Excel',
        emoji: '📊',
        whatItIs: 'Excel is still a core day-to-day tool for supply chain work.',
        analogy: 'It is the control desk where operational data often gets checked first.',
        whyThisTrack: 'You will constantly work with tables, reconciliations, and simple models.',
      },
      {
        name: 'SQL',
        emoji: '🗄️',
        whatItIs: 'SQL pulls structured data from business systems.',
        analogy: 'It is a precise way to ask the company database for exactly the rows you need.',
        whyThisTrack: 'A lot of supply chain analysis starts with the right query.',
      },
      {
        name: 'Power BI / Tableau',
        emoji: '📉',
        whatItIs: 'These tools turn raw data into shareable dashboards.',
        analogy: 'They are like live charts that keep refreshing instead of static screenshots.',
        whyThisTrack: 'Stakeholders need clear KPI views, not raw exports.',
      },
    ],
    lazyAssets: [
      { id: 'excel-sandbox', label: 'Spreadsheet environment', sizeMB: 2.8 },
      { id: 'sql-sandbox', label: 'SQL practice environment', sizeMB: 3.1 },
    ],
  },
  default: { tools: [] },
};

function getSetup(trackId: string): TrackSetupConfig {
  return TRACK_SETUPS[trackId] ?? TRACK_SETUPS.default;
}

const SETUP_KEY = (trackId: string) => `sifter_track_setup_v1_${trackId}`;

async function markSetupComplete(trackId: string) {
  await AsyncStorage.setItem(SETUP_KEY(trackId), '1');
}

export async function isTrackSetupComplete(trackId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(SETUP_KEY(trackId));
  return value === '1';
}

function ToolCard({ tool, index, accentColor }: { tool: ToolDef; index: number; accentColor: string }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(index === 0);
  const chevron = useRef(new Animated.Value(index === 0 ? 1 : 0)).current;

  const rotation = chevron.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.timing(chevron, { toValue: next ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.9}
      style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}
    >
      <View style={styles.toolHeader}>
        <View style={[styles.toolIconWrap, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={styles.toolEmoji}>{tool.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.toolName, { color: colors.text }]}>{tool.name}</Text>
          <Text style={[styles.toolSummary, { color: colors.textSoft }]}>{tool.whatItIs}</Text>
        </View>
        <Animated.Text style={[styles.toolChevron, { color: colors.textSoft, transform: [{ rotate: rotation }] }]}>
          ›
        </Animated.Text>
      </View>

      {expanded ? (
        <View style={styles.toolBody}>
          <View style={[styles.analogyBox, { backgroundColor: colors.bgSecondary, borderLeftColor: accentColor }]}>
            <Text style={[styles.microLabel, { color: accentColor }]}>ANALOGY</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>{tool.analogy}</Text>
          </View>
          <View>
            <Text style={[styles.microLabel, { color: colors.textMuted }]}>WHY IT SHOWS UP</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>{tool.whyThisTrack}</Text>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function PackageManagerCard({ def, accentColor }: { def: PackageManagerDef; accentColor: string }) {
  const { colors } = useTheme();

  return (
    <SifterCard style={[styles.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.packageHeader}>
        <View style={[styles.packageBadge, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={styles.packageBadgeText}>PKG</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.packageTitle, { color: colors.text }]}>Dependency setup</Text>
          <Text style={[styles.packageSub, { color: colors.textSoft }]}>What `{def.command}` actually does</Text>
        </View>
      </View>

      <Text style={[styles.bodyText, { color: colors.text }]}>{def.whatItDoes}</Text>

      <View style={[styles.analogyBox, { backgroundColor: colors.bgSecondary, borderLeftColor: accentColor }]}>
        <Text style={[styles.microLabel, { color: accentColor }]}>ANALOGY</Text>
        <Text style={[styles.bodyText, { color: colors.text }]}>{def.analogy}</Text>
      </View>

      <View style={styles.commandBox}>
        <Text style={styles.commandLabel}>COMMAND</Text>
        <Text style={styles.commandText}>{def.command}</Text>
      </View>

      <Text style={[styles.microLabel, { color: colors.textMuted }]}>PACKAGE BREAKDOWN</Text>
      {def.packages.map((pkg) => (
        <View key={pkg.name} style={styles.packageRow}>
          <View style={[styles.packageNamePill, { backgroundColor: accentColor }]}>
            <Text style={styles.packageNameText}>{pkg.name}</Text>
          </View>
          <Text style={[styles.packageDoes, { color: colors.text }]}>{pkg.does}</Text>
        </View>
      ))}
    </SifterCard>
  );
}

function AssetDownloader({
  assets,
  onAllDone,
}: {
  assets: { id: string; label: string; sizeMB: number }[];
  onAllDone: () => void;
}) {
  const { colors } = useTheme();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const completedRef = useRef(false);

  useEffect(() => {
    if (!assets.length) {
      onAllDone();
      return;
    }

    const timers = assets.map((asset) => {
      let pct = 0;
      let interval: ReturnType<typeof setInterval>;
      interval = setInterval(() => {
        pct += Math.random() * 18 + 8;
        if (pct >= 100) {
          pct = 100;
        }

        setProgress(prev => {
          const next = { ...prev, [asset.id]: pct };
          const allDone = assets.every(item => (next[item.id] ?? 0) >= 100);
          if (allDone && !completedRef.current) {
            completedRef.current = true;
            setTimeout(onAllDone, 350);
          }
          return next;
        });

        if (pct >= 100) {
          clearInterval(interval);
        }
      }, 180 + Math.random() * 140);
      return interval;
    });

    return () => {
      timers.forEach(clearInterval);
    };
  }, [assets, onAllDone]);

  return (
    <SifterCard style={[styles.assetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.microLabel, { color: colors.textMuted }]}>PREPARING TRACK FILES</Text>
      {assets.map((asset) => {
        const pct = progress[asset.id] ?? 0;
        return (
          <View key={asset.id} style={styles.assetRow}>
            <View style={styles.assetMeta}>
              <Text style={[styles.assetLabel, { color: colors.text }]}>{asset.label}</Text>
              <Text style={[styles.assetSize, { color: colors.textMuted }]}>{asset.sizeMB.toFixed(1)} MB</Text>
            </View>
            <Text style={[styles.assetPct, { color: colors.accent }]}>{pct >= 100 ? 'Ready' : `${Math.round(pct)}%`}</Text>
            <View style={[styles.assetTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.assetFill, { backgroundColor: colors.accent, width: `${pct}%` as any }]} />
            </View>
          </View>
        );
      })}
    </SifterCard>
  );
}

interface TrackSetupScreenProps {
  trackId: string;
  trackName: string;
  trackIcon?: string;
  accentColor?: string;
  onComplete: () => void;
}

export default function TrackSetupScreen({
  trackId,
  trackName,
  trackIcon,
  accentColor,
  onComplete,
}: TrackSetupScreenProps) {
  const { colors } = useTheme();
  const setup = useMemo(() => getSetup(trackId), [trackId]);
  const resolvedAccent = accentColor ?? colors.accent;
  const [assetsReady, setAssetsReady] = useState(!setup.lazyAssets?.length);
  const [canStart, setCanStart] = useState(!setup.lazyAssets?.length);

  const handleAssetsReady = () => {
    setAssetsReady(true);
    setCanStart(true);
  };

  const handleStart = async () => {
    await markSetupComplete(trackId);
    onComplete();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.headerIconWrap, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <Text style={styles.headerIcon}>{trackIcon ?? '📚'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerEyebrow, { color: colors.textMuted }]}>TRACK SETUP</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{trackName}</Text>
          <Text style={[styles.headerSub, { color: colors.textSoft }]}>Review the tools, prep the files, then enter the track.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {setup.lazyAssets?.length ? (
          <AssetDownloader assets={setup.lazyAssets} onAllDone={handleAssetsReady} />
        ) : null}

        <SifterCard style={[styles.introCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.introTitle, { color: colors.text }]}>What you will use</Text>
          <Text style={[styles.introText, { color: colors.textSoft }]}>
            Each card explains a tool in plain language so the lessons feel grounded from the start.
          </Text>
        </SifterCard>

        {setup.tools.length ? (
          setup.tools.map((tool, index) => (
            <ToolCard key={tool.name} tool={tool} index={index} accentColor={resolvedAccent} />
          ))
        ) : (
          <SifterCard style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Preparing setup details</Text>
            <Text style={[styles.emptyText, { color: colors.textSoft }]}>
              This track does not have tool notes ready yet, but the setup gate still protects the first-run flow.
            </Text>
          </SifterCard>
        )}

        {setup.packageManager ? (
          <PackageManagerCard def={setup.packageManager} accentColor={resolvedAccent} />
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        {!assetsReady ? (
          <View style={styles.preparingRow}>
            <ActivityIndicator size="small" color={resolvedAccent} />
            <Text style={[styles.preparingText, { color: colors.textSoft }]}>Preparing your environment...</Text>
          </View>
        ) : null}
        <SifterButton
          label={canStart ? `Start ${trackName}` : 'Getting ready...'}
          onPress={handleStart}
          disabled={!canStart}
          variant="track"
          color={resolvedAccent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 18 },
  headerEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  headerSub: { fontSize: FontSize.xs, lineHeight: 17 },
  content: {
    ...webContainer,
    paddingBottom: 112,
  },
  introCard: { marginBottom: Spacing.md },
  introTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: 6 },
  introText: { fontSize: FontSize.sm, lineHeight: 20 },
  toolCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  toolHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolEmoji: { fontSize: 18 },
  toolName: { fontSize: FontSize.md, fontWeight: FontWeight.heavy },
  toolSummary: { fontSize: FontSize.xs, lineHeight: 17, marginTop: 2 },
  toolChevron: { fontSize: 18, fontWeight: FontWeight.heavy },
  toolBody: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  analogyBox: {
    borderLeftWidth: 3,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  microLabel: {
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bodyText: { fontSize: FontSize.sm, lineHeight: 20 },
  packageCard: { marginTop: Spacing.md },
  packageHeader: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginBottom: Spacing.md },
  packageBadge: {
    minWidth: 44,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  packageBadgeText: { fontSize: 10, fontWeight: FontWeight.black },
  packageTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  packageSub: { fontSize: FontSize.xs, marginTop: 2 },
  commandBox: {
    backgroundColor: '#0f172a',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  commandLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  commandText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#a5f3fc',
    lineHeight: 20,
  },
  packageRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: Spacing.sm },
  packageNamePill: {
    minWidth: 88,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  packageNameText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: FontWeight.heavy,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  packageDoes: { flex: 1, fontSize: FontSize.sm, lineHeight: 19 },
  assetCard: { marginBottom: Spacing.md },
  assetRow: { marginTop: Spacing.sm },
  assetMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  assetLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  assetSize: { fontSize: FontSize.xs },
  assetPct: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginBottom: 6 },
  assetTrack: { height: 4, borderRadius: Radius.full, overflow: 'hidden' },
  assetFill: { height: '100%', borderRadius: Radius.full },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.sm, lineHeight: 20, textAlign: 'center' },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  preparingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  preparingText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
