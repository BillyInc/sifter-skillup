import React, { useEffect, useState } from 'react';
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
      <View style={[walletStyles.wrap, { backgroundColor: '#EC489915', borderColor: '#EC489940' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[walletStyles.label, { color: '#EC4899' }]}>CONNECTING STARKNET WALLET</Text>
          <Text style={[walletStyles.addr, { color: colors.textSoft }]}>Checking your live Privy-backed wallet...</Text>
        </View>
      </View>
    );
  }

  if (address) {
    return (
      <View style={[walletStyles.wrap, { backgroundColor: '#EC489915', borderColor: '#EC489940' }]}>
        <View style={{ flex: 1 }}>
          <Text style={[walletStyles.label, { color: '#EC4899' }]}>STARKNET WALLET CONNECTED</Text>
          <Text style={[walletStyles.addr, { color: colors.text }]} selectable>{address}</Text>
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
    <TouchableOpacity style={[walletStyles.wrap, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]} onPress={onConnect}>
      <View style={{ flex: 1 }}>
        <Text style={[walletStyles.label, { color: colors.textMuted }]}>NO STARKNET WALLET CONNECTED</Text>
        <Text style={[walletStyles.addr, { color: colors.textSoft }]}>Connect your live Privy Starknet wallet to unlock Lab 1.</Text>
      </View>
      <View style={[walletStyles.btn, { backgroundColor: '#EC4899' }]}>
        <Text style={walletStyles.btnTxt}>Connect</Text>
      </View>
    </TouchableOpacity>
  );
}

const walletStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.md },
  label: { fontSize: 9, fontWeight: FontWeight.black, letterSpacing: 0.8 },
  addr: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginTop: 2 },
  help: { fontSize: FontSize.xs, lineHeight: 16, marginTop: 4 },
  btn: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  btnTxt: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.black },
});

function LabCard({
  lab,
  locked,
  completed,
  onPress,
}: {
  lab: LabDef;
  locked: boolean;
  completed: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const levelColor = LEVEL_COLORS[lab.level];

  return (
    <TouchableOpacity
      style={[
        styles.labCard,
        {
          backgroundColor: colors.card,
          borderColor: completed ? levelColor : locked ? colors.border : `${levelColor}60`,
          opacity: locked ? 0.55 : 1,
        },
        Shadow.sm,
      ]}
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.85}
    >
      <View style={styles.labRow}>
        <View style={[styles.labNumber, { backgroundColor: completed ? levelColor : colors.bgSecondary }]}>
          <Text style={[styles.labNumberText, { color: completed ? '#fff' : colors.textMuted }]}>
            {completed ? 'OK' : lab.number}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.labTitle, { color: colors.text }]} numberOfLines={1}>{lab.title}</Text>
          <View style={styles.labMeta}>
            <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
              <Text style={[styles.levelBadgeText, { color: levelColor }]}>{lab.level}</Text>
            </View>
            <Text style={[styles.labMetaText, { color: colors.textMuted }]}>
              {lab.lessonCount} lessons · {lab.estimatedH}h
            </Text>
            {lab.portfolioPush ? <Text style={styles.labMetaText}>Portfolio</Text> : null}
          </View>
        </View>
        <Text style={{ fontSize: 18, color: locked ? colors.textMuted : levelColor }}>{locked ? 'LOCK' : 'GO'}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function StarknetTrackScreen() {
  const { colors } = useTheme();
  const { user, authStarknet, starknetLoading, refreshUser } = useAuth();
  const navigation = useRouter();
  const privy = useAppPrivy();

  const [trackXP, setTrackXP] = useState(0);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  const address = user?.starknet_address;
  const islandDone = user?.completed_levels?.includes('310') ?? false;
  const labsDone = completedLabs.size;

  useEffect(() => {
    void loadData();
  }, [user?.id]);

  async function loadData() {
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
  }

  function isLabLocked(lab: LabDef): boolean {
    if (lab.requiresLevelId === null) {
      return !address;
    }
    const userLevels = new Set(user?.completed_levels || []);
    return !userLevels.has(String(lab.requiresLevelId));
  }

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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.back()} style={{ marginRight: Spacing.md }}>
          <Text style={{ color: colors.accent, fontSize: FontSize.md, fontWeight: FontWeight.semibold }}>Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>DeFi Navigator</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>Starknet Ecosystem · 11 Labs</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
      >
        <View style={{ padding: Spacing.lg }}>
          <WalletBanner address={address} isCreating={creatingWallet || starknetLoading} onConnect={handleConnectWallet} />
        </View>

        <View style={styles.stats}>
          {[
            { label: 'XP Earned', value: trackXP.toLocaleString() },
            { label: 'Labs Done', value: `${labsDone}/${LABS.length}` },
            { label: 'Status', value: islandDone ? 'Island Complete' : address ? 'Wallet Ready' : 'Connect Wallet' },
          ].map((item) => (
            <View key={item.label} style={[styles.stat, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {!address ? (
          <View style={[styles.notice, { backgroundColor: '#EC489910', borderColor: '#EC489940' }]}>
            <Text style={{ color: '#EC4899', fontSize: FontSize.sm, lineHeight: 20, fontWeight: FontWeight.medium }}>
              Lab 1 unlocks when you connect your live Starknet wallet above. The remaining labs unlock sequentially as you complete each lab boss.
            </Text>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{LABS.length} Labs · Junior to Senior</Text>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
            {LABS.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab}
                locked={isLabLocked(lab)}
                completed={completedLabs.has(lab.id)}
                onPress={() => handleLabPress(lab)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.cert, { backgroundColor: '#EC489910', borderColor: '#EC489930' }]}>
          <Text style={[styles.certTitle, { color: colors.text }]}>DeFi Navigator Certified</Text>
          <Text style={[styles.certDesc, { color: colors.textSoft }]}>
            Complete all 11 labs and the Final Boss to earn your certification flow on Starknet.
          </Text>
        </View>

        <DisclaimerFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  sub: { fontSize: FontSize.xs, marginTop: 1 },
  stats: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  stat: { flex: 1, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, alignItems: 'center', gap: 2 },
  statValue: { fontSize: FontSize.md, fontWeight: FontWeight.black, textAlign: 'center' },
  statLabel: { fontSize: 9, fontWeight: FontWeight.semibold },
  notice: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  labCard: { borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.md },
  labRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  labNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  labNumberText: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  labTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 4 },
  labMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  levelBadge: { borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  levelBadgeText: { fontSize: 9, fontWeight: FontWeight.black, textTransform: 'uppercase' },
  labMetaText: { fontSize: FontSize.xs },
  cert: { margin: Spacing.lg, marginTop: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  certTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, textAlign: 'center' },
  certDesc: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
