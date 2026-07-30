// ⚡ Sifter LevelUp — Portfolio Screen (v2)
// Tab 1 "My Track"  — only platforms for the user's active skill track
// Tab 2 "My Work"   — auto-generated items from lesson/lab completion; no manual "Add" button
// Tab 3 "All Platforms" — all 28 fields, expandable accordion
// Connection modal  — Create new account OR Connect existing
// Attribution       — every push tags "Sifter LevelUp" as source

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput, ActivityIndicator,
  Alert, Linking, RefreshControl, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { API } from '@/lib/api';
import { Spacing, Radius, FontSize, FontWeight, useTheme, type ColorPalette } from '@/theme';
import {
  getPlatformsForField,
  PLATFORMS,
  FIELD_PLATFORMS,
  PortfolioPlatform,
} from '@/data/portfolioPlatforms';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebSectionLabel, WebListRow, useIsWebWide,
} from '@/components/web/WebGrid';
import { startPortfolioOAuth, isOAuthLive } from '@/lib/portfolioOAuth';
import { resolveTrackContext } from '@/lib/trackContext';
import { xpEngine, type XPSnapshot } from '@/lib/XPEngine';
import { streakEngine, type StreakStatus } from '@/lib/StreakEngine';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ConnectedAccount {
  platformId: string;
  username: string;
  profileUrl: string;
  connectedAt: string;
  accessToken?: string;
  tokenExpiry?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  fieldId: string;
  type: 'project' | 'writeup' | 'certificate' | 'code' | 'design' | 'video';
  tags: string[];
  createdAt: string;
  pushedTo: { platformId: string; postUrl: string; pushedAt: string }[];
  sourceLesson?: string;
  sourceTrack?: string;
}

type TabId = 'my-track' | 'my-work' | 'all-platforms';

function PlatformCard({
  platform,
  connected,
  badge,
  onPress,
}: {
  platform: PortfolioPlatform;
  connected?: ConnectedAccount;
  badge?: 'primary';
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isConnected = Boolean(connected);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 1.5,
        borderColor: isConnected ? platform.color : colors.border,
        gap: Spacing.sm,
      }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: platform.color + '18',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>{platform.icon}</Text>
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: FontSize.sm, fontWeight: '800', color: colors.text }}>{platform.name}</Text>
            {badge === 'primary' && (
              <View style={{ backgroundColor: colors.accentSoft, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.accent }}>Essential</Text>
              </View>
            )}
            {isConnected && (
              <View style={{ backgroundColor: colors.greenSoft, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.green }}>Connected</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: FontSize.xs, color: colors.textSoft, lineHeight: 17 }}>
            {platform.what_to_post}
          </Text>

          <Text style={{ fontSize: FontSize.xs, color: isConnected ? platform.color : colors.textMuted, fontWeight: '700' }}>
            {isConnected
              ? `@${connected?.username}`
              : platform.integration === 'oauth' || platform.integration === 'api_key'
                ? 'Tap to connect'
                : 'Tap to add your profile'}
          </Text>
        </View>

        <Text style={{ fontSize: FontSize.xs, color: platform.color, fontWeight: '800' }}>
          {isConnected ? 'Manage' : 'Connect'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// PlatformConnectModal
// Mode picker: Create new account  |  Connect existing  |  Open browser
// ─────────────────────────────────────────────────────────────

function PlatformConnectModal({
  platform,
  existing,
  onClose,
  onConnected,
  onOauthConnected,
}: {
  platform: PortfolioPlatform;
  existing?: ConnectedAccount;
  onClose: () => void;
  onConnected: (account: ConnectedAccount) => void;
  onOauthConnected?: () => void | Promise<void>;
}) {
  const { colors } = useTheme();
  const mStyle = makeModalStyles(colors);
  const [mode, setMode] = useState<'choose' | 'create' | 'link'>(existing ? 'link' : 'choose');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const cancelOauthRef = React.useRef<null | (() => void)>(null);

  // Live-OAuth is restricted to platforms with real credentials (demo: GitHub).
  // Other platforms fall through to manual-link / package, even if their
  // integration type is 'oauth'.
  const oauthLive = isOAuthLive(platform.id);
  const canCreate = !oauthLive && platform.integration === 'api_key';

  React.useEffect(() => () => cancelOauthRef.current?.(), []);

  async function handleOAuth() {
    setOauthBusy(true);
    try {
      cancelOauthRef.current = await startPortfolioOAuth({
        platformId: platform.id,
        onConnected: async () => {
          setOauthBusy(false);
          await onOauthConnected?.();
          onClose();
        },
        onCancel: () => {
          setOauthBusy(false);
          Alert.alert(
            'OAuth cancelled',
            Platform.OS === 'web'
              ? 'The OAuth window was closed before we saw a connection. Try again, or use the manual link option.'
              : 'OAuth did not complete. Try again.',
          );
        },
      });
    } catch (e: unknown) {
      setOauthBusy(false);
      const msg = e instanceof Error ? e.message : 'Could not start OAuth.';
      Alert.alert('OAuth unavailable', msg);
    }
  }

  async function handleCreate() {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Username and email are required.');
      return;
    }
    setLoading(true);
    try {
      const result = await API.portfolioCreateAccount({
        platformId: platform.id,
        username:   username.trim(),
        email:      email.trim(),
        displayName: username.trim(),
        sourcedFrom: 'Sifter LevelUp',
      });
      if (result.success) {
        setDone(true);
        setTimeout(() => onConnected(result.data.account), 900);
      } else {
        Alert.alert('Error', result.message ?? 'Account creation failed.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLink() {
    if (!username.trim()) {
      Alert.alert('Missing info', 'Please enter your username or profile URL.');
      return;
    }
    setLoading(true);
    try {
      const profileUrl = username.startsWith('http')
        ? username.trim()
        : platform.profileUrlTemplate.replace('{username}', username.trim());
      await API.portfolioLinkAccount({ platformId: platform.id, username: username.trim(), profileUrl });
      onConnected({
        platformId: platform.id,
        username:   username.trim(),
        profileUrl,
        connectedAt: new Date().toISOString(),
      });
    } catch {
      Alert.alert('Error', 'Failed to link account. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.base }}>

        {/* Header */}
        <View style={mStyle.header}>
          <TouchableOpacity onPress={onClose} style={mStyle.closeBtn}>
            <Text style={mStyle.closeX}>✕</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, marginBottom: 4 }}>{platform.icon}</Text>
          <Text style={mStyle.title}>{platform.name}</Text>
          <Text style={mStyle.subtitle}>{platform.what_to_post}</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>

            {/* ── Mode picker ── */}
            {mode === 'choose' && (
              <>
                <Text style={mStyle.sectionLabel}>How would you like to connect?</Text>

                {oauthLive && (
                  <TouchableOpacity
                    style={[mStyle.modeCard, oauthBusy && { opacity: 0.6 }]}
                    onPress={handleOAuth}
                    disabled={oauthBusy}
                    activeOpacity={0.85}>
                    <Text style={{ fontSize: 18 }}>🔐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={mStyle.modeTitle}>
                        {oauthBusy ? `Connecting to ${platform.name}…` : `Connect with ${platform.name} OAuth`}
                      </Text>
                      <Text style={mStyle.modeSub}>
                        {Platform.OS === 'web'
                          ? `We'll open a popup for ${platform.name}. Leave it open until you see "Connected".`
                          : `Opens ${platform.name} in your browser to authorise. Returns automatically.`}
                      </Text>
                    </View>
                    {oauthBusy
                      ? <ActivityIndicator color={colors.accentRole.action} />
                      : <Text style={mStyle.chevron}>›</Text>}
                  </TouchableOpacity>
                )}

                {canCreate && (
                  <TouchableOpacity style={mStyle.modeCard} onPress={() => setMode('create')} activeOpacity={0.85}>
                    <Text style={{ fontSize: 18 }}>✨</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={mStyle.modeTitle}>Create new account</Text>
                      <Text style={mStyle.modeSub}>
                        Set up a {platform.name} account right here. Sifter will credit itself as your learning source on your profile.
                      </Text>
                    </View>
                    <Text style={mStyle.chevron}>›</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={mStyle.modeCard} onPress={() => setMode('link')} activeOpacity={0.85}>
                  <Text style={{ fontSize: 18 }}>🔗</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={mStyle.modeTitle}>
                      {oauthLive ? 'Add manual link instead' : `Add your ${platform.name} link`}
                    </Text>
                    <Text style={mStyle.modeSub}>
                      {oauthLive
                        ? `Paste your ${platform.name} profile URL if you'd rather not OAuth.`
                        : `Paste your ${platform.name} profile URL — we'll save it to your artifact hub.`}
                    </Text>
                  </View>
                  <Text style={mStyle.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={mStyle.modeCard} onPress={() => Linking.openURL(platform.signupUrl)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 18 }}>🌐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={mStyle.modeTitle}>Open {platform.name}</Text>
                    <Text style={mStyle.modeSub}>Visit {platform.url} in your browser.</Text>
                  </View>
                  <Text style={mStyle.chevron}>↗</Text>
                </TouchableOpacity>

                {!oauthLive && (
                  <View style={mStyle.attributionBox}>
                    <Text style={mStyle.attributionText}>
                      ℹ️ Live OAuth posting for {platform.name} is not wired up for this demo. Use the manual link or the {'"'}Get package{'"'} option under Artifacts to share items here.
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* ── Create mode ── */}
            {mode === 'create' && (
              <>
                <TouchableOpacity onPress={() => setMode('choose')}>
                  <Text style={mStyle.backBtn}>← Back</Text>
                </TouchableOpacity>

                {done ? (
                  <View style={mStyle.doneBox}>
                    <Text style={{ fontSize: 18 }}>✅</Text>
                    <Text style={mStyle.doneText}>Account created and connected!</Text>
                  </View>
                ) : (
                  <>
                    <Text style={mStyle.sectionLabel}>Create your {platform.name} account</Text>

                    <Text style={mStyle.inputLabel}>Username</Text>
                    <TextInput
                      style={mStyle.input}
                      placeholder={`your_${platform.id}_handle`}
                      placeholderTextColor={colors.textRole.muted}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />

                    <Text style={mStyle.inputLabel}>Email</Text>
                    <TextInput
                      style={mStyle.input}
                      placeholder="your@email.com"
                      placeholderTextColor={colors.textRole.muted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <View style={mStyle.attributionBox}>
                      <Text style={mStyle.attributionText}>
                        ⚡ Your profile will be credited: <Text style={{ fontWeight: '800' }}>{'"'}Trained via Sifter LevelUp{'"'}</Text> — so recruiters know where your skills came from.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[mStyle.submitBtn, loading && { opacity: 0.5 }]}
                      onPress={handleCreate}
                      disabled={loading}
                      activeOpacity={0.85}>
                      {loading
                        ? <ActivityIndicator color={colors.textRole.inverse} size="small" />
                        : <Text style={mStyle.submitText}>Create Account →</Text>}
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}

            {/* ── Link / manage mode ── */}
            {mode === 'link' && (
              <>
                {!existing && (
                  <TouchableOpacity onPress={() => setMode('choose')}>
                    <Text style={mStyle.backBtn}>← Back</Text>
                  </TouchableOpacity>
                )}

                <Text style={mStyle.sectionLabel}>
                  {existing ? `Manage ${platform.name}` : `Connect your ${platform.name}`}
                </Text>

                <Text style={mStyle.inputLabel}>Username or profile URL</Text>
                <TextInput
                  style={mStyle.input}
                  placeholder={platform.profileUrlTemplate.replace('{username}', 'your_username')}
                  placeholderTextColor={colors.textRole.muted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                {existing && (
                  <TouchableOpacity onPress={() => Linking.openURL(existing.profileUrl)} style={mStyle.openProfile}>
                    <Text style={mStyle.openProfileText}>Open profile ↗</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[mStyle.submitBtn, loading && { opacity: 0.5 }]}
                  onPress={handleLink}
                  disabled={loading}
                  activeOpacity={0.85}>
                  {loading
                    ? <ActivityIndicator color={colors.textRole.inverse} size="small" />
                    : <Text style={mStyle.submitText}>{existing ? 'Update' : 'Connect Account →'}</Text>}
                </TouchableOpacity>
              </>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// PushItemModal — push a work item to connected platforms
// ─────────────────────────────────────────────────────────────

function PushItemModal({
  item,
  connectedAccounts,
  onClose,
  onPushed,
}: {
  item: PortfolioItem;
  connectedAccounts: ConnectedAccount[];
  onClose: () => void;
  onPushed: (platformId: string, postUrl: string) => void;
}) {
  const { colors } = useTheme();
  const pushSt = makePushStyles(colors);
  const [selected, setSelected] = useState<string[]>([]);
  const [caption, setCaption]   = useState(`${item.title}\n\nBuild: Sifter LevelUp · sifter.app`);
  const [loading, setLoading]   = useState(false);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  async function handlePush() {
    if (selected.length === 0) {
      Alert.alert('Select platforms', 'Choose at least one platform to push to.');
      return;
    }
    setLoading(true);
    try {
      const results = await API.portfolioPushItem({
        itemId: item.id,
        platformIds: selected,
        caption,
        sourceAttribution: 'Sifter LevelUp · sifter.app',
      });
      results.forEach((r: { platformId: string; postUrl: string }) => onPushed(r.platformId, r.postUrl));
      Alert.alert('Posted! 🎉', `Pushed to ${results.length} platform${results.length !== 1 ? 's' : ''} — credited to Sifter LevelUp.`);
      onClose();
    } catch {
      Alert.alert('Error', 'Some posts failed. Check your connections and try again.');
    } finally {
      setLoading(false);
    }
  }

  const oauthAccounts  = connectedAccounts.filter(a => ['oauth', 'api_key'].includes(PLATFORMS[a.platformId]?.integration ?? ''));
  const manualAccounts = connectedAccounts.filter(a => !['oauth', 'api_key'].includes(PLATFORMS[a.platformId]?.integration ?? ''));

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.base }}>
        <View style={pushSt.topBar}>
          <Text style={pushSt.heading}>Push to Platforms</Text>
          <TouchableOpacity onPress={onClose}><Text style={pushSt.closeX}>✕</Text></TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>

            <View style={pushSt.itemCard}>
              <Text style={pushSt.itemTitle}>{item.title}</Text>
              <Text style={pushSt.itemMeta}>{item.type} · {item.fieldId}</Text>
            </View>

            {oauthAccounts.length > 0 && (
              <>
                <Text style={pushSt.sectionLabel}>Auto-post (OAuth connected)</Text>
                {oauthAccounts.map(acc => {
                  const pl = PLATFORMS[acc.platformId];
                  if (!pl) return null;
                  const isSelected  = selected.includes(acc.platformId);
                  const alreadyDone = item.pushedTo.some(p => p.platformId === acc.platformId);
                  return (
                    <TouchableOpacity
                      key={acc.platformId}
                      style={[pushSt.platformRow, isSelected && pushSt.platformRowOn, alreadyDone && { opacity: 0.5 }]}
                      onPress={() => !alreadyDone && toggle(acc.platformId)}
                      activeOpacity={alreadyDone ? 1 : 0.8}>
                      <Text style={{ fontSize: 18 }}>{pl.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={pushSt.platformName}>{pl.name}</Text>
                        <Text style={pushSt.platformUser}>@{acc.username}</Text>
                      </View>
                      {alreadyDone
                        ? <Text style={pushSt.postedBadge}>Posted</Text>
                        : <View style={[pushSt.checkbox, isSelected && pushSt.checkboxOn]}>
                            {isSelected && <Text style={{ color: colors.textRole.inverse, fontWeight: '800', fontSize: 13 }}>OK</Text>}
                          </View>}
                    </TouchableOpacity>
                  );
                })}

                <Text style={pushSt.sectionLabel}>Caption</Text>
                <TextInput
                  style={pushSt.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                <View style={pushSt.attributionNote}>
                  <Text style={pushSt.attributionNoteText}>&quot;Sifter LevelUp | sifter.app&quot; is always included in the attribution field.</Text>
                </View>
              </>
            )}

            {manualAccounts.length > 0 && (
              <>
                <Text style={pushSt.sectionLabel}>Manual submission</Text>
                {manualAccounts.map(acc => {
                  const pl = PLATFORMS[acc.platformId];
                  if (!pl) return null;
                  return (
                    <TouchableOpacity
                      key={acc.platformId}
                      style={pushSt.platformRow}
                      onPress={async () => {
                        const pkg = await API.portfolioGeneratePackage({ itemId: item.id, platformId: acc.platformId });
                        if (pkg?.downloadUrl) Linking.openURL(pkg.downloadUrl);
                      }}>
                      <Text style={{ fontSize: 18 }}>{pl.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={pushSt.platformName}>{pl.name}</Text>
                        <Text style={pushSt.platformUser}>@{acc.username}</Text>
                      </View>
                      <Text style={pushSt.packageBtn}>Get package -&gt;</Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {connectedAccounts.length === 0 && (
              <View style={pushSt.noAccounts}>
                <Text style={pushSt.noAccountsText}>
                  No platforms connected yet. Go to the My Track tab to set them up.
                </Text>
              </View>
            )}

            {oauthAccounts.length > 0 && (
              <TouchableOpacity
                style={[pushSt.submitBtn, (loading || selected.length === 0) && { opacity: 0.4 }]}
                onPress={handlePush}
                disabled={loading || selected.length === 0}
                activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator color={colors.textRole.inverse} />
                  : <Text style={pushSt.submitText}>
                      Push to {selected.length} platform{selected.length !== 1 ? 's' : ''} →
                    </Text>}
              </TouchableOpacity>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function PortfolioScreen() {
  const { colors } = useTheme();
  const s = makeSStyles(colors);
  const { user } = useAuth();
  const isWebWide = useIsWebWide();
  const trackContext = useMemo(() => resolveTrackContext(user), [user]);
  const [tab, setTab]                       = useState<TabId>('my-track');
  const [connectedAccounts, setConnected]   = useState<ConnectedAccount[]>([]);
  const [portfolioItems, setItems]          = useState<PortfolioItem[]>([]);
  const [xp, setXp]                         = useState<XPSnapshot | null>(null);
  const [streak, setStreak]                 = useState<StreakStatus | null>(null);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [connectModal, setConnectModal]     = useState<PortfolioPlatform | null>(null);
  const [pushModal, setPushModal]           = useState<PortfolioItem | null>(null);
  const [expandedField, setExpandedField]   = useState<string | null>(null);

  const activeFieldId  = trackContext.fieldId ?? user?.activeFieldId ?? user?.active_field_id ?? 'crypto';
  const trackPlatforms = getPlatformsForField(activeFieldId);
  const workspaceItems = useMemo(() => {
    if (trackContext.mode !== 'track') {
      return portfolioItems;
    }
    const scoped = portfolioItems.filter((item) =>
      item.fieldId === activeFieldId
      || item.sourceTrack === trackContext.trackId
      || item.sourceTrack === trackContext.trackName,
    );
    return scoped.length > 0 ? scoped : portfolioItems;
  }, [activeFieldId, portfolioItems, trackContext]);
  const connectedCount = connectedAccounts.length;
  const pushedCount = workspaceItems.filter(item => item.pushedTo.length > 0).length;
  const totalTrackPlatformCount = trackPlatforms.primary.length + trackPlatforms.secondary.length;
  const portfolioSubtitle = trackContext.mode === 'track'
    ? `${trackContext.trackName} workspace · ${connectedCount} platform${connectedCount !== 1 ? 's' : ''} connected · ${workspaceItems.length} artifact${workspaceItems.length !== 1 ? 's' : ''}`
    : `${connectedCount} platform${connectedCount !== 1 ? 's' : ''} connected · ${portfolioItems.length} artifact${portfolioItems.length !== 1 ? 's' : ''}`;

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const [accs, items, xpSnap, streakSnap] = await Promise.all([
        API.portfolioGetAccounts().catch(() => []),
        API.portfolioGetItems().catch(() => []),
        xpEngine.snapshot().catch(() => null),
        streakEngine.status().catch(() => null),
      ]);
      setConnected(Array.isArray(accs) ? accs : (accs?.accounts ?? []));
      setItems(Array.isArray(items) ? items : (items?.items ?? []));
      setXp(xpSnap);
      setStreak(streakSnap);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const connMap: Record<string, ConnectedAccount> =
    Object.fromEntries(connectedAccounts.map(a => [a.platformId, a]));

  if (loading) {
    return (
      <SafeAreaView style={s.screen}>
        <ActivityIndicator color={colors.accentRole.action} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  // ── WEB LAYOUT ──────────────────────────────────────────────────────────────
  if (isWebWide) {
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title="Artifacts + XP"
            subtitle={portfolioSubtitle}
            accentColor={trackContext.mode === 'track' ? trackContext.color : colors.accent}
          />

          <WebRow>
            {/* Left: tab nav + platform summary */}
            <WebCol weight={1}>
              <WebCard title="Artifacts Hub" accentBar accentColor={colors.accent}>
                {([
                  { id: 'my-track',      label: 'Track Platforms', sub: 'Platforms for your track' },
                  { id: 'my-work',       label: 'Artifacts',       sub: `${workspaceItems.length} items earned` },
                  { id: 'all-platforms', label: 'All Platforms',   sub: 'Browse all 28 fields' },
                ] as { id: TabId; label: string; sub: string }[]).map(t => (
                  <WebListRow
                    key={t.id}
                    icon={tab === t.id ? '>' : 'o'}
                    title={t.label}
                    sub={t.sub}
                    onPress={() => setTab(t.id)}
                    right={
                      <View style={{
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: tab === t.id ? colors.accent : 'transparent',
                      }} />
                    }
                  />
                ))}
              </WebCard>

              <WebCard title="Workspace Snapshot" accentBar accentColor={trackContext.mode === 'track' ? trackContext.color : colors.gold} style={{ marginTop: 20 }}>
                <Text style={{ color: colors.textSoft, fontSize: FontSize.xs, marginBottom: 6 }}>{portfolioSubtitle}</Text>
                <WebListRow icon="XP" title="Total XP" sub={xp?.stage.name ?? 'Progress stage'} right={<Text style={{ color: colors.text, fontWeight: '800' }}>{xp?.totalXp ?? 0}</Text>} />
                <WebListRow icon="ST" title="Current Streak" sub={streak?.completedToday ? 'Protected today' : 'Needs action today'} right={<Text style={{ color: colors.text, fontWeight: '800' }}>{streak?.streak ?? 0}d</Text>} />
                <WebListRow icon="PL" title="Track Platforms" sub={trackContext.mode === 'track' ? trackContext.trackName : 'Current workspace'} right={<Text style={{ color: colors.text, fontWeight: '800' }}>{totalTrackPlatformCount}</Text>} />
                <WebListRow icon="OK" title="Artifacts Pushed" sub="Items already shared" right={<Text style={{ color: colors.text, fontWeight: '800' }}>{pushedCount}</Text>} />
              </WebCard>

              {/* Connected platforms summary */}
              <WebCard title="Connected Platforms" accentBar accentColor={colors.green} style={{ marginTop: 20 }}>
                {connectedAccounts.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textMuted }}>LN</Text>
                    <Text style={{ color: colors.textSoft, marginTop: 8, fontSize: 13, textAlign: 'center' }}>
                      No platforms connected yet.{'\n'}Go to My Track to connect.
                    </Text>
                  </View>
                ) : (
                  connectedAccounts.map(acc => (
                    <WebListRow
                      key={acc.platformId}
                      icon="OK"
                      title={acc.platformId}
                      sub={acc.username ?? 'Connected'}
                    />
                  ))
                )}
              </WebCard>
            </WebCol>

            {/* Right: tab content */}
            <WebCol weight={2}>
              <WebCard
                title={tab === 'my-track' ? 'Track Platforms' : tab === 'my-work' ? 'Artifacts' : 'All Platforms'}
                accentBar accentColor={colors.accent}
              >
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 640 }}>

                  {/* ── MY TRACK ── */}
                  {tab === 'my-track' && (
                    <>
                      <View style={[s.trackBanner, { backgroundColor: colors.accentSoft, borderRadius: Radius.md, marginBottom: 16 }]}>
                        <Text style={[s.trackBannerTitle, { color: colors.accent }]}>Your track platforms</Text>
                        <Text style={[s.trackBannerBody, { color: colors.textSoft }]}>
                          Connect these. Your work gets pushed automatically when you complete labs.
                        </Text>
                      </View>
                      {trackPlatforms.primary.length > 0 && (
                        <>
                          <WebSectionLabel label="Essential" />
                          {trackPlatforms.primary.map(p => (
                            <PlatformCard key={p.id} platform={p} connected={connMap[p.id]} badge="primary" onPress={() => setConnectModal(p)} />
                          ))}
                        </>
                      )}
                      {trackPlatforms.secondary.length > 0 && (
                        <>
                          <WebSectionLabel label="Also Recommended" />
                          {trackPlatforms.secondary.map(p => (
                            <PlatformCard key={p.id} platform={p} connected={connMap[p.id]} onPress={() => setConnectModal(p)} />
                          ))}
                        </>
                      )}
                    </>
                  )}

                  {/* ── MY WORK ── */}
                  {tab === 'my-work' && (
                    <>
                      <View style={[s.autoSaveBanner, { backgroundColor: colors.accentSoft, borderRadius: Radius.md, marginBottom: 16 }]}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.accent }}>AUTO</Text>
                        <Text style={[s.autoSaveText, { color: colors.textSoft }]}>
                          Artifacts are created automatically when you complete lessons and labs.
                        </Text>
                      </View>
                      {workspaceItems.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 18 }}>
                          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textMuted }}>ART</Text>
                          <Text style={{ color: colors.textSoft, marginTop: 12, fontSize: 14, textAlign: 'center' }}>
                            Complete lessons on your skill track and your work appears here automatically.
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                          {workspaceItems.map(item => (
                            <TouchableOpacity
                              key={item.id}
                              style={[s.workCard, { flex: 1, minWidth: 240, backgroundColor: colors.card, borderColor: colors.border }]}
                              onPress={() => setPushModal(item)}
                              activeOpacity={0.85}
                            >
                              <Text style={[s.workTitle, { color: colors.text }]}>{item.title}</Text>
                              <Text style={[s.workDesc, { color: colors.textSoft }]} numberOfLines={2}>{item.description}</Text>
                              {item.pushedTo.length === 0 && (
                                <Text style={[s.pushCta, { color: colors.accent }]}>Tap to push {'->'}</Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </>
                  )}

                  {/* ── ALL PLATFORMS ── */}
                  {tab === 'all-platforms' && (
                    <>
                      <Text style={[s.exploreIntro, { color: colors.textSoft, marginBottom: 16 }]}>
                        Every platform across all 28 skill fields. Tap a field to expand.
                      </Text>
                      {FIELD_PLATFORMS.map(field => {
                        const isOpen = expandedField === field.fieldId;
                        const allP   = [...(field.primaryPlatforms ?? []), ...(field.secondaryPlatforms ?? [])];
                        const connCount = allP.filter(id => connMap[id]).length;
                        return (
                          <View key={field.fieldId}>
                            <TouchableOpacity
                              style={[s.fieldHeader, { borderLeftColor: field.color, backgroundColor: colors.card, borderColor: colors.border }]}
                              onPress={() => setExpandedField(isOpen ? null : field.fieldId)}
                              activeOpacity={0.85}
                            >
                              <Text style={{ fontSize: 18 }}>{field.emoji}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={[s.fieldName, { color: colors.text }]}>{field.fieldName}</Text>
                                <Text style={[s.fieldCount, { color: colors.textMuted }]}>
                                  {allP.length} platforms{connCount > 0 ? ` | ${connCount} connected` : ''}
                                </Text>
                              </View>
                              <Text style={{ color: colors.textMuted }}>{isOpen ? '^' : 'v'}</Text>
                            </TouchableOpacity>
                            {isOpen && (
                              <View style={s.fieldContent}>
                                {field.primaryPlatforms?.map(id => PLATFORMS[id]).filter(Boolean).map(p => (
                                  <PlatformCard key={p.id} platform={p} connected={connMap[p.id]} badge="primary" onPress={() => setConnectModal(p)} />
                                ))}
                                {field.secondaryPlatforms?.map(id => PLATFORMS[id]).filter(Boolean).map(p => (
                                  <PlatformCard key={p.id} platform={p} connected={connMap[p.id]} onPress={() => setConnectModal(p)} />
                                ))}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </>
                  )}

                  <View style={{ height: 40 }} />
                </ScrollView>
              </WebCard>
            </WebCol>
          </WebRow>
        </WebShell>

        {connectModal && (
          <PlatformConnectModal
            platform={connectModal}
            existing={connMap[connectModal.id]}
            onClose={() => setConnectModal(null)}
            onConnected={account => {
              setConnected(prev => [account, ...prev.filter(a => a.platformId !== account.platformId)]);
              setConnectModal(null);
            }}
            onOauthConnected={() => load(true)}
          />
        )}
        {pushModal && (
          <PushItemModal
            item={pushModal}
            connectedAccounts={connectedAccounts}
            onClose={() => setPushModal(null)}
            onPushed={(platformId, postUrl) => {
              setItems(prev => prev.map(i =>
                i.id === pushModal.id
                  ? { ...i, pushedTo: [...i.pushedTo, { platformId, postUrl, pushedAt: new Date().toISOString() }] }
                  : i
              ));
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.screen}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Artifacts + XP</Text>
          <Text style={s.headerSub}>{portfolioSubtitle}</Text>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.summaryStrip}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Workspace</Text>
          <Text style={s.summaryValue}>{trackContext.mode === 'track' ? trackContext.trackName : 'Overview'}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Artifacts</Text>
          <Text style={s.summaryValue}>{workspaceItems.length}</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Streak</Text>
          <Text style={s.summaryValue}>{streak?.streak ?? 0}d</Text>
        </View>
      </View>

      <View style={s.tabBar}>
        {([
          { id: 'my-track',      label: 'Track Platforms' },
          { id: 'my-work',       label: 'Artifacts'  },
          { id: 'all-platforms', label: 'Explore'  },
        ] as { id: TabId; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.tab, tab === t.id && s.tabActive]}
            onPress={() => setTab(t.id)}>
            <Text style={[s.tabText, tab === t.id && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.accentRole.action} />}>

        {/* ══════════════════════════════════
            TAB 1 — MY TRACK
            Platforms relevant to the user's
            active skill track only
        ══════════════════════════════════ */}
        {tab === 'my-track' && (
          <>
            <View style={s.trackBanner}>
              <Text style={s.trackBannerTitle}>Your track platforms</Text>
              <Text style={s.trackBannerBody}>
                Connect these platforms. When you complete lessons and labs, your work will be pushed here automatically — credited to Sifter LevelUp.
              </Text>
            </View>

            {trackPlatforms.primary.length > 0 && (
              <>
                <Text style={s.sectionHeading}>⭐ Essential</Text>
                {trackPlatforms.primary.map(p => (
                  <PlatformCard
                    key={p.id}
                    platform={p}
                    connected={connMap[p.id]}
                    badge="primary"
                    onPress={() => setConnectModal(p)}
                  />
                ))}
              </>
            )}

            {trackPlatforms.secondary.length > 0 && (
              <>
                <Text style={s.sectionHeading}>📌 Also recommended</Text>
                {trackPlatforms.secondary.map(p => (
                  <PlatformCard
                    key={p.id}
                    platform={p}
                    connected={connMap[p.id]}
                    onPress={() => setConnectModal(p)}
                  />
                ))}
              </>
            )}

            {trackPlatforms.primary.length === 0 && trackPlatforms.secondary.length === 0 && (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 18 }}>🔒</Text>
                <Text style={s.emptyTitle}>Platforms locked</Text>
                <Text style={s.emptySub}>Explore stays open while platform integrations are prepared.</Text>
              </View>
            )}
          </>
        )}

        {/* ══════════════════════════════════
            TAB 2 — MY WORK
            Auto-generated from lessons/labs
            No manual "Add" button
        ══════════════════════════════════ */}
        {tab === 'my-work' && (
          <>
            <View style={s.autoSaveBanner}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.accent }}>AUTO</Text>
              <Text style={s.autoSaveText}>
                Artifacts are created automatically when you complete lessons, labs, and boss battles. Tap any item to push it to your connected platforms.
              </Text>
            </View>

            {workspaceItems.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 18 }}>📂</Text>
                <Text style={s.emptyTitle}>No items yet</Text>
                <Text style={s.emptySub}>
                  Complete lessons on your skill track — your work will appear here automatically.
                </Text>
              </View>
            ) : (
              workspaceItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={s.workCard}
                  onPress={() => setPushModal(item)}
                  activeOpacity={0.85}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={s.workTitle}>{item.title}</Text>
                      <Text style={s.workDesc} numberOfLines={2}>{item.description}</Text>
                    </View>
                    {item.pushedTo.length > 0 && (
                      <View style={s.pushedBadge}>
                        <Text style={s.pushedBadgeText}>Pushed to {item.pushedTo.length}</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.workMeta}>
                    <Text style={s.workMetaText}>📅 {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    {item.sourceLesson && <Text style={s.workMetaText}>📚 {item.sourceLesson}</Text>}
                  </View>
                  {item.tags.length > 0 && (
                    <View style={s.tagRow}>
                      {item.tags.slice(0, 5).map(t => (
                        <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
                      ))}
                    </View>
                  )}
                  {item.pushedTo.length === 0 && (
                    <Text style={s.pushCta}>Tap to push {'->'}</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* ══════════════════════════════════
            TAB 3 — ALL PLATFORMS
            All 28 fields, expandable accordion
        ══════════════════════════════════ */}
        {tab === 'all-platforms' && (
          <>
            <Text style={s.exploreIntro}>
              Every platform across all 28 skill fields. Tap a field to see its platforms and connect accounts you already have.
            </Text>

            {FIELD_PLATFORMS.map(field => {
              const isOpen = expandedField === field.fieldId;
              const fieldPrimary   = field.primaryPlatforms.map(id => PLATFORMS[id]).filter(Boolean) as PortfolioPlatform[];
              const fieldSecondary = field.secondaryPlatforms.map(id => PLATFORMS[id]).filter(Boolean) as PortfolioPlatform[];
              const totalCount     = fieldPrimary.length + fieldSecondary.length;
              const connCount      = [...fieldPrimary, ...fieldSecondary].filter(p => connMap[p.id]).length;

              return (
                <View key={field.fieldId} style={s.fieldGroup}>
                  <TouchableOpacity
                    style={[s.fieldHeader, { borderLeftColor: field.color }]}
                    onPress={() => setExpandedField(isOpen ? null : field.fieldId)}
                    activeOpacity={0.85}>
                    <Text style={{ fontSize: 18 }}>{field.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldName}>{field.fieldName}</Text>
                      <Text style={s.fieldCount}>
                        {totalCount} platform{totalCount !== 1 ? 's' : ''}
                        {connCount > 0 ? ` | ${connCount} connected` : ''}
                      </Text>
                    </View>
                    <Text style={s.fieldChevron}>{isOpen ? '^' : 'v'}</Text>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={s.fieldContent}>
                      {fieldPrimary.map(p => (
                        <PlatformCard
                          key={p.id}
                          platform={p}
                          connected={connMap[p.id]}
                          badge="primary"
                          onPress={() => setConnectModal(p)}
                        />
                      ))}
                      {fieldSecondary.map(p => (
                        <PlatformCard
                          key={p.id}
                          platform={p}
                          connected={connMap[p.id]}
                          onPress={() => setConnectModal(p)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Connect Modal ── */}
      {connectModal && (
        <PlatformConnectModal
          platform={connectModal}
          existing={connMap[connectModal.id]}
          onClose={() => setConnectModal(null)}
          onConnected={account => {
            setConnected(prev => {
              const next = prev.filter(a => a.platformId !== account.platformId);
              return [account, ...next];
            });
            setConnectModal(null);
          }}
          onOauthConnected={() => load(true)}
        />
      )}

      {/* ── Push Modal ── */}
      {pushModal && (
        <PushItemModal
          item={pushModal}
          connectedAccounts={connectedAccounts}
          onClose={() => setPushModal(null)}
          onPushed={(platformId, postUrl) => {
            setItems(prev =>
              prev.map(i =>
                i.id === pushModal.id
                  ? { ...i, pushedTo: [...i.pushedTo, { platformId, postUrl, pushedAt: new Date().toISOString() }] }
                  : i
              )
            );
          }}
        />
      )}

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// StyleSheets (makeStyles factories — require `colors` from useTheme)
// ─────────────────────────────────────────────────────────────

const makeSStyles = (colors: ColorPalette) => StyleSheet.create({
  // screen & chrome
  screen:            { flex: 1, backgroundColor: colors.surface.base },
  header:            { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: colors.surface.raised, borderBottomWidth: 1, borderBottomColor: colors.borderRole.subtle },
  headerTitle:       { fontSize: FontSize.xl, fontWeight: '900', color: colors.textRole.primary },
  headerSub:         { fontSize: FontSize.xs, color: colors.textRole.secondary, marginTop: 2 },
  summaryStrip:      { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  summaryCard:       { flex: 1, backgroundColor: colors.surface.raised, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.borderRole.subtle, gap: 4 },
  summaryLabel:      { fontSize: 10, fontWeight: '800', color: colors.textRole.muted, textTransform: 'uppercase' },
  summaryValue:      { fontSize: FontSize.sm, fontWeight: '800', color: colors.textRole.primary },
  tabBar:            { flexDirection: 'row', backgroundColor: colors.surface.raised, borderBottomWidth: 1, borderBottomColor: colors.borderRole.subtle },
  tab:               { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabActive:         { borderBottomWidth: 2.5, borderBottomColor: colors.accentRole.action },
  tabText:           { fontSize: 11, fontWeight: '700', color: colors.textRole.secondary },
  tabTextActive:     { color: colors.accentRole.action, fontWeight: '800' },
  scroll:            { flex: 1 },
  scrollContent:     { padding: Spacing.lg, gap: Spacing.md },
  sectionHeading:    { fontSize: 13, fontWeight: '800', color: colors.textRole.primary, marginTop: Spacing.xs, marginBottom: 10 },

  // My Track tab
  trackBanner:       { backgroundColor: colors.accentSoft, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.accentRole.action + '40', gap: 6 },
  trackBannerTitle:  { fontSize: FontSize.sm, fontWeight: '900', color: colors.accentRole.action },
  trackBannerBody:   { fontSize: FontSize.xs, color: colors.textRole.primary, lineHeight: 17 },

  // My Work tab
  autoSaveBanner:    { backgroundColor: colors.successSoft, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, borderWidth: 1, borderColor: colors.accentRole.success + '30' },
  autoSaveText:      { flex: 1, fontSize: FontSize.xs, color: colors.textRole.primary, lineHeight: 17 },
  workCard:          { backgroundColor: colors.surface.raised, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.borderRole.subtle, gap: Spacing.sm },
  workTitle:         { fontSize: FontSize.sm, fontWeight: '800', color: colors.textRole.primary },
  workDesc:          { fontSize: FontSize.xs, color: colors.textRole.secondary, lineHeight: 17 },
  workMeta:          { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  workMetaText:      { fontSize: FontSize.xs, color: colors.textRole.muted },
  pushedBadge:       { backgroundColor: colors.successSoft, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  pushedBadgeText:   { fontSize: 9, fontWeight: '700', color: colors.accentRole.success },
  tagRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:               { backgroundColor: colors.accentSoft, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  tagText:           { fontSize: 9, fontWeight: '700', color: colors.accentRole.action },
  pushCta:           { fontSize: FontSize.xs, color: colors.accentRole.action, fontWeight: '700' },

  // All Platforms tab
  exploreIntro:      { fontSize: FontSize.sm, color: colors.textRole.secondary, lineHeight: 19 },
  fieldGroup:        { gap: 6 },
  fieldHeader:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: colors.surface.raised, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.borderRole.subtle, borderLeftWidth: 4 },
  fieldName:         { fontSize: FontSize.sm, fontWeight: '800', color: colors.textRole.primary },
  fieldCount:        { fontSize: FontSize.xs, color: colors.textRole.secondary, marginTop: 1 },
  fieldChevron:      { fontSize: 11, color: colors.textRole.muted },
  fieldContent:      { paddingLeft: 4, gap: 4 },

  // shared empty state
  emptyState:        { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle:        { fontSize: FontSize.lg, fontWeight: '900', color: colors.textRole.primary },
  emptySub:          { fontSize: FontSize.sm, color: colors.textRole.secondary, textAlign: 'center', lineHeight: 20 },
});

// Connect modal styles
const makeModalStyles = (colors: ColorPalette) => StyleSheet.create({
  header:            { backgroundColor: colors.surface.raised, padding: Platform.OS === 'web' ? 14 : 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.borderRole.subtle, gap: 3 },
  closeBtn:          { position: 'absolute', top: Spacing.lg, right: Spacing.lg, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface.base, alignItems: 'center', justifyContent: 'center' },
  closeX:            { color: colors.textRole.secondary, fontWeight: '700', fontSize: 16 },
  title:             { fontSize: FontSize.xl, fontWeight: '900', color: colors.textRole.primary },
  subtitle:          { fontSize: FontSize.sm, color: colors.textRole.secondary, textAlign: 'center' },
  sectionLabel:      { fontSize: 13, fontWeight: '800', color: colors.textRole.primary, marginBottom: 10 },
  modeCard:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: colors.surface.raised, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.borderRole.subtle },
  modeTitle:         { fontSize: FontSize.sm, fontWeight: '800', color: colors.textRole.primary, marginBottom: 3 },
  modeSub:           { fontSize: FontSize.xs, color: colors.textRole.secondary, lineHeight: 16 },
  chevron:           { fontSize: 20, color: colors.textRole.muted },
  backBtn:           { color: colors.accentRole.action, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 4 },
  inputLabel:        { fontSize: FontSize.xs, fontWeight: '800', color: colors.textRole.primary, marginBottom: 4 },
  input:             { backgroundColor: colors.surface.raised, borderRadius: Radius.md, borderWidth: 1.5, borderColor: colors.borderRole.subtle, padding: Spacing.md, fontSize: FontSize.sm, color: colors.textRole.primary },
  attributionBox:    { backgroundColor: colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.accentRole.action + '30' },
  attributionText:   { fontSize: FontSize.xs, color: colors.textRole.primary, lineHeight: 17 },
  submitBtn:         { backgroundColor: colors.accentRole.action, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  submitText:        { color: colors.textRole.inverse, fontWeight: '700', fontSize: 11 },
  openProfile:       { alignSelf: 'flex-start' },
  openProfileText:   { color: colors.accentRole.action, fontWeight: '700', fontSize: FontSize.sm },
  doneBox:           { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  doneText:          { fontSize: FontSize.lg, fontWeight: '800', color: colors.textRole.primary },
});

// Push modal styles
const makePushStyles = (colors: ColorPalette) => StyleSheet.create({
  topBar:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised },
  heading:           { fontSize: FontSize.lg, fontWeight: '900', color: colors.textRole.primary },
  closeX:            { color: colors.textRole.secondary, fontWeight: '700', fontSize: 18 },
  itemCard:          { backgroundColor: colors.accentSoft, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.accentRole.action + '30' },
  itemTitle:         { fontSize: FontSize.sm, fontWeight: '900', color: colors.accentRole.action },
  itemMeta:          { fontSize: FontSize.xs, color: colors.textRole.secondary, marginTop: 2 },
  sectionLabel:      { fontSize: 13, fontWeight: '800', color: colors.textRole.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  platformRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: colors.surface.raised, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.borderRole.subtle },
  platformRowOn:     { borderColor: colors.accentRole.action, backgroundColor: colors.accentSoft },
  platformName:      { fontSize: FontSize.sm, fontWeight: '800', color: colors.textRole.primary },
  platformUser:      { fontSize: FontSize.xs, color: colors.textRole.secondary },
  postedBadge:       { fontSize: FontSize.xs, color: colors.accentRole.success, fontWeight: '800' },
  checkbox:          { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.borderRole.subtle, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:        { backgroundColor: colors.accentRole.action, borderColor: colors.accentRole.action },
  captionInput:      { backgroundColor: colors.surface.base, borderRadius: Radius.md, borderWidth: 1.5, borderColor: colors.borderRole.subtle, padding: Spacing.md, fontSize: FontSize.sm, color: colors.textRole.primary, height: 110 },
  attributionNote:   { backgroundColor: colors.accentSoft, borderRadius: Radius.md, padding: Spacing.sm },
  attributionNoteText: { fontSize: FontSize.xs, color: colors.accentRole.action, lineHeight: 16 },
  packageBtn:        { fontSize: FontSize.xs, color: colors.accentRole.action, fontWeight: '800' },
  noAccounts:        { backgroundColor: colors.surface.base, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, borderColor: colors.borderRole.subtle, alignItems: 'center' },
  noAccountsText:    { fontSize: FontSize.sm, color: colors.textRole.secondary, textAlign: 'center', lineHeight: 20 },
  submitBtn:         { backgroundColor: colors.accentRole.action, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  submitText:        { color: colors.textRole.inverse, fontWeight: '700', fontSize: 11 },
});
