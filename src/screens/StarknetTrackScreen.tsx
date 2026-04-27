import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Spacing, Radius, FontSize, FontWeight, Shadow } from '../theme';
import { useAuth } from '../hooks/useAuth';
import DisclaimerFooter from '../components/DisclaimerFooter';
import { API, API_BASE } from '../lib/api';
import { PRIVY_ENABLED } from '../lib/config';
import { useAppPrivy } from '../lib/privy';
import { getStarknetLabs } from '../data/tracks/starknet_ecosystem/starknetLessonRegistry';
import StarknetFaucetButton from '../components/StarknetFaucetButton';

interface LabDef {
  id: string;
  number: number;
  title: string;
  lessonCount: number;
  level: 'junior' | 'intermediate' | 'senior';
  estimatedH: number;
  bossLevelId: number;
  requiresLevelId: number | null;
  portfolioPush: boolean;
}

const NAVIGATOR_LAB_UI: Record<number, Omit<LabDef, 'id' | 'number' | 'lessonCount' | 'bossLevelId' | 'requiresLevelId'>> = {
  1: { title: 'DeFi Mental Models', level: 'junior', estimatedH: 4, portfolioPush: false },
  2: { title: 'Token Swaps and AMMs', level: 'junior', estimatedH: 3, portfolioPush: true },
  3: { title: 'Staking and Delegation', level: 'junior', estimatedH: 3, portfolioPush: false },
  4: { title: 'Lending and Borrowing', level: 'junior', estimatedH: 3, portfolioPush: true },
  5: { title: 'DCA and Automation', level: 'junior', estimatedH: 3, portfolioPush: false },
  6: { title: 'Portfolio Strategy', level: 'intermediate', estimatedH: 4, portfolioPush: true },
  7: { title: 'Advanced Liquidity Provision', level: 'intermediate', estimatedH: 4, portfolioPush: false },
  8: { title: 'Bridging & Cross-Chain', level: 'intermediate', estimatedH: 4, portfolioPush: false },
  9: { title: 'Advanced DeFi Primitives', level: 'intermediate', estimatedH: 5, portfolioPush: true },
  10: { title: 'Institutional DeFi Ops', level: 'senior', estimatedH: 6, portfolioPush: false },
  11: { title: 'Research & Certification', level: 'senior', estimatedH: 8, portfolioPush: true },
};

const LABS: LabDef[] = getStarknetLabs('starknet-defi-navigator').map((lab, index, allLabs) => {
  const ui = NAVIGATOR_LAB_UI[lab.labNumber];
  const previousLab = index > 0 ? allLabs[index - 1] : null;

  return {
    id: lab.labId,
    number: lab.labNumber,
    title: ui?.title ?? `Lab ${lab.labNumber}`,
    lessonCount: lab.lessons.length,
    level: ui?.level ?? 'junior',
    estimatedH: ui?.estimatedH ?? Math.max(1, Math.ceil(lab.lessons.length / 2)),
    bossLevelId: lab.bossLevelId,
    requiresLevelId: previousLab?.bossLevelId ?? null,
    portfolioPush: ui?.portfolioPush ?? false,
  };
});

const LEVEL_COLORS = {
  junior: '#58CC02',
  intermediate: '#F59E0B',
  senior: '#EC4899',
};

function WalletBanner({
  address,
  isCreating,
  onConnect,
}: {
  address?: string;
  isCreating: boolean;
  onConnect: () => void;
}) {
  const { colors } = useTheme();

  if (isCreating) {
    return (
      <View style={[walletStyles.wrap, { backgroundColor: '#EC489912', borderColor: '#EC489940' }]}>
        <View style={walletStyles.copy}>
          <Text style={[walletStyles.label, { color: '#EC4899' }]}>Wallet Status</Text>
          <Text style={[walletStyles.title, { color: colors.text }]}>Connecting Starknet wallet</Text>
          <Text style={[walletStyles.help, { color: colors.textSoft }]}>Checking your live Privy-backed wallet.</Text>
        </View>
      </View>
    );
  }

  if (address) {
    return (
      <View style={[walletStyles.wrap, { backgroundColor: '#EC489912', borderColor: '#EC489940' }]}>
        <View style={walletStyles.copy}>
          <Text style={[walletStyles.label, { color: '#EC4899' }]}>Wallet Ready</Text>
          <Text style={[walletStyles.title, { color: colors.text }]} selectable>{address}</Text>
          <Text style={[walletStyles.help, { color: colors.textSoft }]}>
            Verify this address on Starknet Sepolia Voyager to confirm it is live and funded by real transactions.
          </Text>
        </View>
        <TouchableOpacity
          style={[walletStyles.btn, { backgroundColor: '#EC4899' }]}
          onPress={() => Linking.openURL(`https://sepolia.voyager.online/contract/${address}`)}
        >
          <Text style={walletStyles.btnTxt}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={[walletStyles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onConnect}>
      <View style={walletStyles.copy}>
        <Text style={[walletStyles.label, { color: colors.textMuted }]}>Wallet Required</Text>
        <Text style={[walletStyles.title, { color: colors.text }]}>Connect a Starknet wallet</Text>
        <Text style={[walletStyles.help, { color: colors.textSoft }]}>Lab 1 unlocks as soon as your live Privy Starknet wallet is connected.</Text>
      </View>
      <View style={[walletStyles.btn, { backgroundColor: '#EC4899' }]}>
        <Text style={walletStyles.btnTxt}>Connect</Text>
      </View>
    </TouchableOpacity>
  );
}

const walletStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.xl, borderWidth: 1.5, padding: Spacing.md },
  copy: { flex: 1 },
  label: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginTop: 3 },
  help: { fontSize: FontSize.xs, lineHeight: 16, marginTop: 4 },
  btn: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  btnTxt: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.black },
});

function LabCard({
  lab,
  locked,
  completed,
  current,
  onPress,
}: {
  lab: LabDef;
  locked: boolean;
  completed: boolean;
  current: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const levelColor = LEVEL_COLORS[lab.level];
  const accent = completed ? '#10B981' : current ? '#EC4899' : levelColor;
  const stateLabel = locked ? 'Locked' : current ? 'Continue' : completed ? 'Review' : 'Start';

  return (
    <TouchableOpacity
      style={[
        styles.labCard,
        {
          backgroundColor: colors.card,
          borderColor: current ? '#EC489955' : completed ? '#10B98155' : locked ? colors.border : `${levelColor}38`,
          opacity: locked ? 0.58 : 1,
        },
        Shadow.sm,
      ]}
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.85}
    >
      <View style={styles.labHeader}>
        <View style={[styles.labNumber, { backgroundColor: completed ? '#10B981' : `${levelColor}18`, borderColor: `${levelColor}38` }]}>
          <Text style={[styles.labNumberText, { color: completed ? '#fff' : levelColor }]}>
            {lab.number}
          </Text>
        </View>
        <View style={styles.labCopy}>
          <Text style={[styles.labEyebrow, { color: levelColor }]}>{lab.level}</Text>
          <Text style={[styles.labTitle, { color: colors.text }]} numberOfLines={1}>{lab.title}</Text>
          <Text style={[styles.labMetaText, { color: colors.textMuted }]}>
            {lab.lessonCount} lessons · {lab.estimatedH}h {lab.portfolioPush ? '· Portfolio' : ''}
          </Text>
        </View>
        <View style={[styles.statePill, { backgroundColor: `${accent}14` }]}>
          <Text style={[styles.statePillText, { color: accent }]}>{stateLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function StarknetTrackScreen() {
  const { colors } = useTheme();
  const { user, authStarknet, starknetLoading, refreshUser, updateActiveField } = useAuth();
  const navigation = useRouter();
  const privy = useAppPrivy();

  const [trackXP, setTrackXP] = useState(0);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  const address = user?.starknet_address;
  const islandDone = user?.completed_levels?.includes('310') ?? false;

  const loadData = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    try {
      const token = await API.getToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const xpRes = await fetch(`${API_BASE}/api/v2/xp/history?limit=200`, { headers });
      if (xpRes.ok) {
        const xpData = await xpRes.json();
        const xpTotal = (xpData.data || [])
          .filter((event: any) => ['starknet_tx', 'level_complete', 'boss_complete', 'lab_complete'].includes(event.event_type))
          .reduce((sum: number, event: any) => sum + (event.xp_amount || 0), 0);
        setTrackXP(xpTotal);
      }

      const completed = new Set<string>();
      const userLevels = new Set(user?.completed_levels || []);
      LABS.forEach((lab) => {
        if (userLevels.has(String(lab.bossLevelId))) {
          completed.add(lab.id);
        }
      });
      setCompletedLabs(completed);
    } catch {
      // Best effort only.
    }
  }, [user?.completed_levels, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user?.id || user.currentTrackId === 'starknet-defi-navigator') {
      return;
    }

    void updateActiveField(
      'starknet',
      '#EC4899',
      'starknet-defi-navigator',
      'Starknet DeFi Navigator',
    ).catch(() => {});
  }, [updateActiveField, user?.currentTrackId, user?.id]);

  function isLabLocked(lab: LabDef): boolean {
    if (lab.requiresLevelId === null) {
      return !address;
    }
    const userLevels = new Set(user?.completed_levels || []);
    return !userLevels.has(String(lab.requiresLevelId));
  }

  const currentLabId = LABS.find((lab) => !isLabLocked(lab) && !completedLabs.has(lab.id))?.id;

  async function handleConnectWallet() {
    if (!user) {
      navigation.push('/(auth)');
      return;
    }
    if (!user.email) {
      Alert.alert('Email needed', 'Add an email to your account to create a Starknet wallet.');
      return;
    }
    if (!PRIVY_ENABLED) {
      Alert.alert('Privy required', 'Live Starknet auth is disabled until Privy is configured.');
      return;
    }
    if (!privy.user) {
      Alert.alert(
        'Sign in with Starknet',
        'To connect a live Starknet wallet, continue through the Starknet sign-in flow.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => navigation.push('/(auth)') },
        ],
      );
      return;
    }

    setCreatingWallet(true);
    try {
      const token = await privy.getAccessToken();
      if (!token) {
        throw new Error('Privy session expired. Please sign in again.');
      }
      await authStarknet(user.email, user.starknet_address, token);
      await refreshUser();
    } catch (error: any) {
      Alert.alert('Wallet Error', error.message || 'Could not connect wallet. Please try again.');
    } finally {
      setCreatingWallet(false);
    }
  }

  function handleLabPress(lab: LabDef) {
    navigation.push({
      pathname: '/world',
      params: {
        worldId: 'starknet-realm',
        trackId: 'starknet-defi-navigator',
        trackName: 'Starknet DeFi Navigator',
        labId: lab.id,
        labNumber: String(lab.number),
      },
    } as any);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    await refreshUser();
    setRefreshing(false);
  }

  const labsDone = completedLabs.size;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EC4899" />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.back()} style={[styles.backButton, { backgroundColor: colors.bgSecondary }]}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={[styles.heroEyebrow, { color: '#EC4899' }]}>Starknet Workspace</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>DeFi Navigator</Text>
          <Text style={[styles.heroSub, { color: colors.textSoft }]}>
            Continue the Starknet practitioner flow with wallet-gated lab access, real on-chain actions, and lab-by-lab progression.
          </Text>

          <View style={styles.statsRow}>
            {[
              { label: 'XP Earned', value: trackXP.toLocaleString(), accent: colors.text },
              { label: 'Labs Cleared', value: `${labsDone}/${LABS.length}`, accent: '#EC4899' },
              { label: 'State', value: islandDone ? 'Review' : address ? 'Continue' : 'Locked', accent: islandDone ? '#10B981' : '#EC4899' },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.statValue, { color: item.accent }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <WalletBanner address={address} isCreating={creatingWallet || starknetLoading} onConnect={handleConnectWallet} />
        {address ? (
          <View style={styles.faucetWrap}>
            <StarknetFaucetButton walletAddress={address} />
          </View>
        ) : null}

        {!address ? (
          <View style={[styles.notice, { backgroundColor: '#EC489910', borderColor: '#EC489940' }]}>
            <Text style={[styles.noticeText, { color: '#EC4899' }]}>
              Connect your Starknet wallet to unlock Lab 1. The rest of the labs open sequentially after each boss.
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>Labs</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{LABS.length} DeFi Labs</Text>
        </View>

        <View style={styles.labList}>
          {LABS.map((lab) => (
            <LabCard
              key={lab.id}
              lab={lab}
              locked={isLabLocked(lab)}
              completed={completedLabs.has(lab.id)}
              current={lab.id === currentLabId}
              onPress={() => handleLabPress(lab)}
            />
          ))}
        </View>

        <View style={[styles.certCard, { backgroundColor: '#EC489910', borderColor: '#EC489930' }]}>
          <Text style={[styles.certEyebrow, { color: '#EC4899' }]}>Completion Path</Text>
          <Text style={[styles.certTitle, { color: colors.text }]}>DeFi Navigator Certified</Text>
          <Text style={[styles.certDesc, { color: colors.textSoft }]}>
            Complete all 11 labs and the final boss to finish the Starknet DeFi certification flow.
          </Text>
        </View>

        <DisclaimerFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  heroCard: { borderWidth: 1, borderRadius: Radius.xxl, padding: Spacing.lg, gap: Spacing.md, ...Shadow.sm },
  backButton: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 8 },
  backButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.black },
  heroEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  heroSub: { fontSize: FontSize.sm, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 100, borderRadius: Radius.lg, padding: Spacing.md, gap: 2 },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  statLabel: { fontSize: 10, fontWeight: FontWeight.semibold },
  faucetWrap: { marginTop: -Spacing.xs },
  notice: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md },
  noticeText: { fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.medium },
  sectionHeader: { gap: 4, marginTop: Spacing.xs },
  sectionEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  labList: { gap: Spacing.sm },
  labCard: { borderRadius: Radius.xl, borderWidth: 1.5, padding: Spacing.md },
  labHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  labNumber: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labNumberText: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  labCopy: { flex: 1 },
  labEyebrow: { fontSize: 10, fontWeight: FontWeight.black, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  labTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 2 },
  labMetaText: { fontSize: FontSize.xs },
  statePill: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  statePillText: { fontSize: 10, fontWeight: FontWeight.black },
  certCard: { borderRadius: Radius.xxl, borderWidth: 1, padding: Spacing.xl, gap: Spacing.xs, alignItems: 'flex-start' },
  certEyebrow: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1, textTransform: 'uppercase' },
  certTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  certDesc: { fontSize: FontSize.sm, lineHeight: 20 },
});
