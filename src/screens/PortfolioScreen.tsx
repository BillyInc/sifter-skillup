// ⚡ Sifter Skill_Up — Portfolio Screen (v2)
// Tab 1 "My Track"  — only platforms for the user's active skill track
// Tab 2 "My Work"   — auto-generated items from lesson/lab completion; no manual "Add" button
// Tab 3 "All Platforms" — all 28 fields, expandable accordion
// Connection modal  — Create new account OR Connect existing
// Attribution       — every push tags "Sifter Skill_Up" as source

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator,
  Alert, Linking, RefreshControl, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import { Colors, Spacing, Radius, FontSize, useTheme } from '../theme';
import {
  getPlatformsForField,
  PLATFORMS,
  FIELD_PLATFORMS,
  PortfolioPlatform,
} from '../data/portfolioPlatforms';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebSectionLabel, WebListRow, useIsWebWide,
} from '../components/web/WebGrid';

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
  pushedTo: Array<{ platformId: string; postUrl: string; pushedAt: string }>;
  sourceLesson?: string;
  sourceTrack?: string;
}

type TabId = 'my-track' | 'my-work' | 'all-platforms';

// ─────────────────────────────────────────────────────────────
// PlatformCard
// ─────────────────────────────────────────────────────────────

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
  const isConnected = !!connected;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isConnected ? '#f0fdf4' : '#fff',
        borderWidth: 1,
        borderColor: isConnected ? '#86efac' : '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        ...(badge === 'primary' ? { borderLeftWidth: 4, borderLeftColor: platform.color || '#6366f1' } : {}),
      }}
    >
      <Text style={{ fontSize: 28, marginRight: 12 }}>{platform.icon}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937' }}>
            {platform.name}
          </Text>
          {badge === 'primary' && (
            <Text style={{ marginLeft: 6, fontSize: 11, color: '#6366f1', fontWeight: '600' }}>
              ESSENTIAL
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }} numberOfLines={1}>
          {isConnected ? `@${connected.username}` : platform.what_to_post}
        </Text>
      </View>
      <Text style={{ fontSize: 13, color: isConnected ? '#16a34a' : '#9ca3af', fontWeight: '500' }}>
        {isConnected ? '✓ Connected' : 'Connect'}
      </Text>
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
}: {
  platform: PortfolioPlatform;
  existing?: ConnectedAccount;
  onClose: () => void;
  onConnected: (account: ConnectedAccount) => void;
}) {
  const [mode, setMode] = useState<'choose' | 'create' | 'link'>(existing ? 'link' : 'choose');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const canCreate = platform.integration === 'oauth' || platform.integration === 'api_key';

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
        sourcedFrom: 'Sifter Skill_Up',
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>

        {/* Header */}
        <View style={mStyle.header}>
          <TouchableOpacity onPress={onClose} style={mStyle.closeBtn}>
            <Text style={mStyle.closeX}>✕</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 44, marginBottom: 4 }}>{platform.icon}</Text>
          <Text style={mStyle.title}>{platform.name}</Text>
          <Text style={mStyle.subtitle}>{platform.what_to_post}</Text>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>

            {/* ── Mode picker ── */}
            {mode === 'choose' && (
              <>
                <Text style={mStyle.sectionLabel}>How would you like to connect?</Text>

                {canCreate && (
                  <TouchableOpacity style={mStyle.modeCard} onPress={() => setMode('create')} activeOpacity={0.85}>
                    <Text style={{ fontSize: 26 }}>✨</Text>
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
                  <Text style={{ fontSize: 26 }}>🔗</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={mStyle.modeTitle}>Connect existing account</Text>
                    <Text style={mStyle.modeSub}>
                      Already on {platform.name}? Enter your username or profile URL.
                    </Text>
                  </View>
                  <Text style={mStyle.chevron}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={mStyle.modeCard} onPress={() => Linking.openURL(platform.signupUrl)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 26 }}>🌐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={mStyle.modeTitle}>Open {platform.name}</Text>
                    <Text style={mStyle.modeSub}>Visit {platform.url} in your browser.</Text>
                  </View>
                  <Text style={mStyle.chevron}>↗</Text>
                </TouchableOpacity>
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
                    <Text style={{ fontSize: 48 }}>✅</Text>
                    <Text style={mStyle.doneText}>Account created and connected!</Text>
                  </View>
                ) : (
                  <>
                    <Text style={mStyle.sectionLabel}>Create your {platform.name} account</Text>

                    <Text style={mStyle.inputLabel}>Username</Text>
                    <TextInput
                      style={mStyle.input}
                      placeholder={`your_${platform.id}_handle`}
                      placeholderTextColor={Colors.textMuted}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />

                    <Text style={mStyle.inputLabel}>Email</Text>
                    <TextInput
                      style={mStyle.input}
                      placeholder="your@email.com"
                      placeholderTextColor={Colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <View style={mStyle.attributionBox}>
                      <Text style={mStyle.attributionText}>
                        ⚡ Your profile will be credited: <Text style={{ fontWeight: '900' }}>"Trained via Sifter Skill_Up"</Text> — so recruiters know where your skills came from.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[mStyle.submitBtn, loading && { opacity: 0.5 }]}
                      onPress={handleCreate}
                      disabled={loading}
                      activeOpacity={0.85}>
                      {loading
                        ? <ActivityIndicator color="#fff" size="small" />
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
                  placeholderTextColor={Colors.textMuted}
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
                    ? <ActivityIndicator color="#fff" size="small" />
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
  const [selected, setSelected] = useState<string[]>([]);
  const [caption, setCaption]   = useState(`${item.title}\n\nBuild: Sifter Skill_Up · sifter.app`);
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
        sourceAttribution: 'Sifter Skill_Up · sifter.app',
      });
      results.forEach((r: { platformId: string; postUrl: string }) => onPushed(r.platformId, r.postUrl));
      Alert.alert('Posted! 🎉', `Pushed to ${results.length} platform${results.length !== 1 ? 's' : ''} — credited to Sifter Skill_Up.`);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
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
                      <Text style={{ fontSize: 22 }}>{pl.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={pushSt.platformName}>{pl.name}</Text>
                        <Text style={pushSt.platformUser}>@{acc.username}</Text>
                      </View>
                      {alreadyDone
                        ? <Text style={pushSt.postedBadge}>✓ Posted</Text>
                        : <View style={[pushSt.checkbox, isSelected && pushSt.checkboxOn]}>
                            {isSelected && <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>✓</Text>}
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
                  <Text style={pushSt.attributionNoteText}>
                    ⚡ "Sifter Skill_Up · sifter.app" is always included in the attribution field.
                  </Text>
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
                      <Text style={{ fontSize: 22 }}>{pl.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={pushSt.platformName}>{pl.name}</Text>
                        <Text style={pushSt.platformUser}>@{acc.username}</Text>
                      </View>
                      <Text style={pushSt.packageBtn}>Get package ↗</Text>
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
                  ? <ActivityIndicator color="#fff" />
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
  const { user } = useAuth();
  const isWebWide = useIsWebWide();
  const [tab, setTab]                       = useState<TabId>('my-track');
  const [connectedAccounts, setConnected]   = useState<ConnectedAccount[]>([]);
  const [portfolioItems, setItems]          = useState<PortfolioItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [connectModal, setConnectModal]     = useState<PortfolioPlatform | null>(null);
  const [pushModal, setPushModal]           = useState<PortfolioItem | null>(null);
  const [expandedField, setExpandedField]   = useState<string | null>(null);

  const activeTrack    = user?.active_track ?? 'crypto-onboarding';
  const trackPlatforms = getPlatformsForField(activeTrack);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const [accs, items] = await Promise.all([
        API.portfolioGetAccounts().catch(() => ({ accounts: [] })),
        API.portfolioGetItems().catch(() => ({ items: [] })),
      ]);
      setConnected(accs.accounts ?? []);
      setItems(items.items ?? []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const connMap: Record<string, ConnectedAccount> =
    Object.fromEntries(connectedAccounts.map(a => [a.platformId, a]));

  if (loading) {
    return (
      <SafeAreaView style={s.screen}>
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  // ── WEB LAYOUT ──────────────────────────────────────────────────────────────
  if (isWebWide) {
    const connectedCount = connectedAccounts.length;
    return (
      <SafeAreaView style={[s.screen, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title="💼 Portfolio"
            subtitle={`${connectedCount} platform${connectedCount !== 1 ? 's' : ''} connected · ${portfolioItems.length} item${portfolioItems.length !== 1 ? 's' : ''}`}
            accentColor={colors.accent}
          />

          <WebRow>
            {/* Left: tab nav + platform summary */}
            <WebCol weight={1}>
              <WebCard title="My Portfolio" accentBar accentColor={colors.accent}>
                {([
                  { id: 'my-track',      label: '🎯 My Track',    sub: 'Platforms for your track' },
                  { id: 'my-work',       label: '📂 My Work',     sub: `${portfolioItems.length} items earned` },
                  { id: 'all-platforms', label: '🌐 All Platforms', sub: 'Browse all 28 fields' },
                ] as { id: TabId; label: string; sub: string }[]).map(t => (
                  <WebListRow
                    key={t.id}
                    icon={tab === t.id ? '▶' : '○'}
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

              {/* Connected platforms summary */}
              <WebCard title="Connected Platforms" accentBar accentColor={colors.green} style={{ marginTop: 20 }}>
                {connectedAccounts.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Text style={{ fontSize: 28 }}>🔗</Text>
                    <Text style={{ color: colors.textSoft, marginTop: 8, fontSize: 13, textAlign: 'center' }}>
                      No platforms connected yet.{'\n'}Go to My Track to connect.
                    </Text>
                  </View>
                ) : (
                  connectedAccounts.map(acc => (
                    <WebListRow
                      key={acc.platformId}
                      icon="✅"
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
                title={tab === 'my-track' ? '🎯 My Track Platforms' : tab === 'my-work' ? '📂 My Work' : '🌐 All Platforms'}
                accentBar accentColor={colors.accent}
              >
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 640 }}>

                  {/* ── MY TRACK ── */}
                  {tab === 'my-track' && (
                    <>
                      <View style={[s.trackBanner, { backgroundColor: colors.accentSoft, borderRadius: Radius.md, marginBottom: 16 }]}>
                        <Text style={[s.trackBannerTitle, { color: colors.accent }]}>Your track's platforms</Text>
                        <Text style={[s.trackBannerBody, { color: colors.textSoft }]}>
                          Connect these. Your work gets pushed automatically when you complete labs.
                        </Text>
                      </View>
                      {trackPlatforms.primary.length > 0 && (
                        <>
                          <WebSectionLabel label="⭐ Essential" />
                          {trackPlatforms.primary.map(p => (
                            <PlatformCard key={p.id} platform={p} connected={connMap[p.id]} badge="primary" onPress={() => setConnectModal(p)} />
                          ))}
                        </>
                      )}
                      {trackPlatforms.secondary.length > 0 && (
                        <>
                          <WebSectionLabel label="📌 Also recommended" />
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
                        <Text style={{ fontSize: 22 }}>⚡</Text>
                        <Text style={[s.autoSaveText, { color: colors.textSoft }]}>
                          Portfolio items are created automatically when you complete lessons and labs.
                        </Text>
                      </View>
                      {portfolioItems.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                          <Text style={{ fontSize: 36 }}>📂</Text>
                          <Text style={{ color: colors.textSoft, marginTop: 12, fontSize: 14, textAlign: 'center' }}>
                            Complete lessons on your skill track — your work appears here automatically.
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                          {portfolioItems.map(item => (
                            <TouchableOpacity
                              key={item.id}
                              style={[s.workCard, { flex: 1, minWidth: 240, backgroundColor: colors.card, borderColor: colors.border }]}
                              onPress={() => setPushModal(item)}
                              activeOpacity={0.85}
                            >
                              <Text style={[s.workTitle, { color: colors.text }]}>{item.title}</Text>
                              <Text style={[s.workDesc, { color: colors.textSoft }]} numberOfLines={2}>{item.description}</Text>
                              {item.pushedTo.length === 0 && (
                                <Text style={[s.pushCta, { color: colors.accent }]}>Tap to push →</Text>
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
                              <Text style={{ fontSize: 22 }}>{field.emoji}</Text>
                              <View style={{ flex: 1 }}>
                                <Text style={[s.fieldName, { color: colors.text }]}>{field.fieldName}</Text>
                                <Text style={[s.fieldCount, { color: colors.textMuted }]}>
                                  {allP.length} platforms{connCount > 0 ? ` · ${connCount} connected` : ''}
                                </Text>
                              </View>
                              <Text style={{ color: colors.textMuted }}>{isOpen ? '▲' : '▼'}</Text>
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
          <Text style={s.headerTitle}>💼 Portfolio</Text>
          <Text style={s.headerSub}>
            {connectedAccounts.length} platform{connectedAccounts.length !== 1 ? 's' : ''} connected · {portfolioItems.length} item{portfolioItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.tabBar}>
        {([
          { id: 'my-track',      label: '🎯 My Track' },
          { id: 'my-work',       label: '📂 My Work'  },
          { id: 'all-platforms', label: '🌐 Explore'  },
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={Colors.accent} />}>

        {/* ══════════════════════════════════
            TAB 1 — MY TRACK
            Platforms relevant to the user's
            active skill track only
        ══════════════════════════════════ */}
        {tab === 'my-track' && (
          <>
            <View style={s.trackBanner}>
              <Text style={s.trackBannerTitle}>Your track's platforms</Text>
              <Text style={s.trackBannerBody}>
                Connect these platforms. When you complete lessons and labs, your work will be pushed here automatically — credited to Sifter Skill_Up.
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
                <Text style={{ fontSize: 40 }}>🔜</Text>
                <Text style={s.emptyTitle}>Platforms coming soon</Text>
                <Text style={s.emptySub}>Tap Explore to browse all available platforms.</Text>
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
              <Text style={{ fontSize: 22 }}>⚡</Text>
              <Text style={s.autoSaveText}>
                Portfolio items are created automatically when you complete lessons, labs, and boss battles. Tap any item to push it to your connected platforms.
              </Text>
            </View>

            {portfolioItems.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={{ fontSize: 40 }}>📂</Text>
                <Text style={s.emptyTitle}>No items yet</Text>
                <Text style={s.emptySub}>
                  Complete lessons on your skill track — your work will appear here automatically.
                </Text>
              </View>
            ) : (
              portfolioItems.map(item => (
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
                    <Text style={s.pushCta}>Tap to push to platforms →</Text>
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
                    <Text style={{ fontSize: 26 }}>{field.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldName}>{field.fieldName}</Text>
                      <Text style={s.fieldCount}>
                        {totalCount} platform{totalCount !== 1 ? 's' : ''}
                        {connCount > 0 ? ` · ${connCount} connected` : ''}
                      </Text>
                    </View>
                    <Text style={s.fieldChevron}>{isOpen ? '▲' : '▼'}</Text>
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
// StyleSheets
// ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // screen & chrome
  screen:            { flex: 1, backgroundColor: Colors.bg },
  header:            { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:       { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub:         { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  tabBar:            { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:               { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabActive:         { borderBottomWidth: 2.5, borderBottomColor: Colors.accent },
  tabText:           { fontSize: 11, fontWeight: '700', color: Colors.textSoft },
  tabTextActive:     { color: Colors.accent, fontWeight: '900' },
  scroll:            { flex: 1 },
  scrollContent:     { padding: Spacing.lg, gap: Spacing.md },
  sectionHeading:    { fontSize: FontSize.sm, fontWeight: '900', color: Colors.text, marginTop: Spacing.xs },

  // My Track tab
  trackBanner:       { backgroundColor: Colors.accentSoft, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.accent + '40', gap: 6 },
  trackBannerTitle:  { fontSize: FontSize.sm, fontWeight: '900', color: Colors.accent },
  trackBannerBody:   { fontSize: FontSize.xs, color: Colors.text, lineHeight: 17 },

  // My Work tab
  autoSaveBanner:    { backgroundColor: Colors.greenSoft, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.green + '30' },
  autoSaveText:      { flex: 1, fontSize: FontSize.xs, color: Colors.text, lineHeight: 17 },
  workCard:          { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.sm },
  workTitle:         { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  workDesc:          { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 17 },
  workMeta:          { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  workMetaText:      { fontSize: FontSize.xs, color: Colors.textMuted },
  pushedBadge:       { backgroundColor: Colors.greenSoft, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  pushedBadgeText:   { fontSize: 10, fontWeight: '700', color: Colors.green },
  tagRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:               { backgroundColor: Colors.accentSoft, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:           { fontSize: 10, fontWeight: '700', color: Colors.accent },
  pushCta:           { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '700' },

  // All Platforms tab
  exploreIntro:      { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 19 },
  fieldGroup:        { gap: 6 },
  fieldHeader:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, borderLeftWidth: 4 },
  fieldName:         { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  fieldCount:        { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 1 },
  fieldChevron:      { fontSize: 11, color: Colors.textMuted },
  fieldContent:      { paddingLeft: 4, gap: 4 },

  // shared empty state
  emptyState:        { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle:        { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  emptySub:          { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
});

// Connect modal styles
const mStyle = StyleSheet.create({
  header:            { backgroundColor: Colors.card, padding: Spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 3 },
  closeBtn:          { position: 'absolute', top: Spacing.lg, right: Spacing.lg, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  closeX:            { color: Colors.textSoft, fontWeight: '700', fontSize: 16 },
  title:             { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  subtitle:          { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center' },
  sectionLabel:      { fontSize: FontSize.sm, fontWeight: '900', color: Colors.text },
  modeCard:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border },
  modeTitle:         { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  modeSub:           { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16 },
  chevron:           { fontSize: 20, color: Colors.textMuted },
  backBtn:           { color: Colors.accent, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 4 },
  inputLabel:        { fontSize: FontSize.xs, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  input:             { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text },
  attributionBox:    { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.accent + '30' },
  attributionText:   { fontSize: FontSize.xs, color: Colors.text, lineHeight: 17 },
  submitBtn:         { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  submitText:        { color: '#fff', fontWeight: '900', fontSize: FontSize.sm },
  openProfile:       { alignSelf: 'flex-start' },
  openProfileText:   { color: Colors.accent, fontWeight: '700', fontSize: FontSize.sm },
  doneBox:           { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  doneText:          { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
});

// Push modal styles
const pushSt = StyleSheet.create({
  topBar:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.card },
  heading:           { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  closeX:            { color: Colors.textSoft, fontWeight: '700', fontSize: 18 },
  itemCard:          { backgroundColor: Colors.accentSoft, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.accent + '30' },
  itemTitle:         { fontSize: FontSize.sm, fontWeight: '900', color: Colors.accent },
  itemMeta:          { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  sectionLabel:      { fontSize: FontSize.xs, fontWeight: '900', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  platformRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border },
  platformRowOn:     { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  platformName:      { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  platformUser:      { fontSize: FontSize.xs, color: Colors.textSoft },
  postedBadge:       { fontSize: FontSize.xs, color: Colors.green, fontWeight: '800' },
  checkbox:          { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:        { backgroundColor: Colors.accent, borderColor: Colors.accent },
  captionInput:      { backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, height: 110 },
  attributionNote:   { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.sm },
  attributionNoteText: { fontSize: FontSize.xs, color: Colors.accent, lineHeight: 16 },
  packageBtn:        { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800' },
  noAccounts:        { backgroundColor: Colors.bg, borderRadius: Radius.md, padding: Spacing.xl, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  noAccountsText:    { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
  submitBtn:         { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  submitText:        { color: '#fff', fontWeight: '900', fontSize: FontSize.sm },
});
