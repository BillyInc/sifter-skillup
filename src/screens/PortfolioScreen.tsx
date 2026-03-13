// ============================================================
// Sifter Skill_Up — Portfolio Hub Screen
// Users link/create accounts on portfolio platforms and push
// their work directly from the app, sourced to Sifter Skill_Up.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Modal, TextInput, ActivityIndicator,
  Alert, Linking, RefreshControl, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';
import { getPlatformsForField, PLATFORMS, PortfolioPlatform } from '../data/portfolioPlatforms';
import { getField, ALL_FIELDS } from '../data/fields';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ConnectedAccount {
  platformId: string;
  username: string;
  profileUrl: string;
  connectedAt: string;
  accessToken?: string;      // stored securely on backend
  tokenExpiry?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  fieldId: string;
  type: 'project' | 'writeup' | 'certificate' | 'code' | 'design' | 'video';
  fileUrl?: string;
  tags: string[];
  createdAt: string;
  pushedTo: Array<{ platformId: string; postUrl: string; pushedAt: string }>;
}

// ─────────────────────────────────────────────────────────────
// Platform Connection Modal
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
  const [mode, setMode] = useState<'choose' | 'create' | 'link'>('choose');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verifying' | 'done'>('form');

  const canAutoCreate = platform.integration === 'oauth' || platform.integration === 'api_key';

  async function handleCreate() {
    if (!username.trim() || !email.trim()) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setStep('verifying');
    try {
      const result = await API.portfolioCreateAccount({
        platformId: platform.id,
        username: username.trim(),
        email: email.trim(),
        password,
        displayName: displayName.trim() || username.trim(),
        // profile will be populated from user's Sifter progress
        sourcedFrom: 'Sifter Skill_Up',
      });
      if (result.success) {
        setStep('done');
        setTimeout(() => {
          onConnected(result.data.account);
        }, 1200);
      } else {
        Alert.alert('Error', result.message ?? 'Account creation failed.');
        setStep('form');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
      setStep('form');
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
      // For OAuth platforms: redirect to OAuth flow
      if (platform.integration === 'oauth') {
        const oauthUrl = await API.portfolioGetOAuthUrl(platform.id);
        if (oauthUrl) {
          Linking.openURL(oauthUrl);
          // OAuth result handled by deep link callback → app re-fetches connected accounts
        }
      } else {
        // For non-OAuth: just store the profile link
        const result = await API.portfolioLinkAccount({
          platformId: platform.id,
          username: username.trim(),
          profileUrl: platform.profileUrlTemplate.replace('{username}', username.trim()),
        });
        if (result.success) {
          onConnected(result.data.account);
        } else {
          Alert.alert('Error', result.message ?? 'Could not link account.');
        }
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'verifying') {
    return (
      <View style={modal.centeredBox}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={modal.verifyText}>Setting up your account…</Text>
        <Text style={modal.verifySubText}>
          We're creating your {platform.name} profile and attributing it to Sifter Skill_Up
        </Text>
      </View>
    );
  }

  if (step === 'done') {
    return (
      <View style={modal.centeredBox}>
        <Text style={modal.doneEmoji}>✅</Text>
        <Text style={modal.doneText}>Connected!</Text>
        <Text style={modal.doneSub}>{platform.name} account linked to Sifter Skill_Up</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={modal.scroll}>

        {/* Header */}
        <View style={[modal.header, { backgroundColor: platform.color + '22' }]}>
          <Text style={modal.headerIcon}>{platform.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={modal.headerTitle}>{platform.name}</Text>
            <Text style={modal.headerUrl}>{platform.url}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
            <Text style={modal.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {existing && (
          <View style={modal.existingBanner}>
            <Text style={modal.existingText}>
              ✓ Currently linked as <Text style={{ fontWeight: '800' }}>@{existing.username}</Text>
            </Text>
          </View>
        )}

        {/* Mode selector */}
        {mode === 'choose' && (
          <>
            <Text style={modal.chooseTip}>{platform.what_to_post}</Text>

            {canAutoCreate && (
              <TouchableOpacity style={[modal.modeCard, { borderColor: Colors.accent }]} onPress={() => setMode('create')}>
                <Text style={modal.modeIcon}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={modal.modeTitle}>Create a new account</Text>
                  <Text style={modal.modeSub}>
                    We fill your profile automatically using your Sifter progress. Your account will reference Sifter Skill_Up as your learning source.
                  </Text>
                </View>
                <Text style={modal.modeArrow}>›</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[modal.modeCard, { borderColor: Colors.border }]} onPress={() => setMode('link')}>
              <Text style={modal.modeIcon}>🔗</Text>
              <View style={{ flex: 1 }}>
                <Text style={modal.modeTitle}>Link existing account</Text>
                <Text style={modal.modeSub}>
                  {platform.integration === 'oauth'
                    ? 'Connect via OAuth. We can post to your account and attribute Sifter Skill_Up in every post.'
                    : 'Enter your username or profile URL. You\'ll post manually but we generate formatted submission packages.'}
                </Text>
              </View>
              <Text style={modal.modeArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modal.openPlatformBtn}
              onPress={() => Linking.openURL(`https://${platform.url}`)}>
              <Text style={modal.openPlatformText}>Open {platform.name} ↗</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Create new account form */}
        {mode === 'create' && (
          <>
            <TouchableOpacity onPress={() => setMode('choose')} style={modal.backBtn}>
              <Text style={modal.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={modal.formTitle}>Create your {platform.name} account</Text>
            <Text style={modal.formSub}>
              Your profile will be pre-filled with your name, bio, and skills from Sifter. Every piece of work you upload will credit Sifter Skill_Up as your learning platform.
            </Text>

            <Text style={modal.label}>Desired username *</Text>
            <TextInput
              style={modal.input}
              value={username}
              onChangeText={setUsername}
              placeholder="your_username"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={modal.label}>Email address *</Text>
            <TextInput
              style={modal.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={modal.label}>Display name</Text>
            <TextInput
              style={modal.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your Full Name"
            />

            {platform.integration !== 'oauth' && (
              <>
                <Text style={modal.label}>Password</Text>
                <TextInput
                  style={modal.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  secureTextEntry
                />
              </>
            )}

            <View style={modal.sifterBadge}>
              <Text style={modal.sifterBadgeText}>
                ⚡ Profile bio will include: "Trained on Sifter Skill_Up · sifter.app"
              </Text>
            </View>

            <TouchableOpacity
              style={[modal.submitBtn, loading && modal.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={modal.submitText}>Create Account & Connect</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Link existing account */}
        {mode === 'link' && (
          <>
            <TouchableOpacity onPress={() => setMode('choose')} style={modal.backBtn}>
              <Text style={modal.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={modal.formTitle}>Link your {platform.name} account</Text>

            {platform.integration === 'oauth' ? (
              <>
                <Text style={modal.formSub}>
                  We'll redirect you to {platform.name} to authorise Sifter. Once connected, we can post your work directly and attribute Sifter Skill_Up automatically.
                </Text>
                <TouchableOpacity
                  style={[modal.submitBtn, loading && modal.submitBtnDisabled]}
                  onPress={handleLink}
                  disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={modal.submitText}>Connect via {platform.name} →</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={modal.formSub}>
                  Enter your {platform.name} username or profile URL. We'll store it and generate formatted submission packages for you to upload manually.
                </Text>
                <Text style={modal.label}>Your {platform.name} username or URL *</Text>
                <TextInput
                  style={modal.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={`e.g. ${platform.profileUrlTemplate.replace('{username}', 'yourname')}`}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[modal.submitBtn, loading && modal.submitBtnDisabled]}
                  onPress={handleLink}
                  disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={modal.submitText}>Save & Link Account</Text>}
                </TouchableOpacity>
              </>
            )}
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// Platform Card (in the hub)
// ─────────────────────────────────────────────────────────────

function PlatformCard({
  platform,
  connected,
  onPress,
}: {
  platform: PortfolioPlatform;
  connected?: ConnectedAccount;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[pc.card, Shadow.sm]} onPress={onPress} activeOpacity={0.8}>
      <View style={[pc.iconWrap, { backgroundColor: platform.color + '20' }]}>
        <Text style={pc.icon}>{platform.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={pc.name}>{platform.name}</Text>
        {connected
          ? <Text style={pc.connected}>✓ @{connected.username}</Text>
          : <Text style={pc.notConnected}>Not connected</Text>}
      </View>
      <View style={[pc.badge, connected ? pc.badgeConnected : pc.badgeEmpty]}>
        <Text style={[pc.badgeText, connected ? pc.badgeTextConnected : {}]}>
          {connected ? 'Linked' : 'Connect'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// Push Portfolio Item Modal
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState(
    `${item.title}\n\nBuilt as part of my learning on Sifter Skill_Up · sifter.app\n\n#SifterSkillUp #${item.fieldId.replace(/-/g, '')}`
  );
  const [loading, setLoading] = useState(false);

  function togglePlatform(id: string) {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handlePush() {
    if (selectedPlatforms.length === 0) {
      Alert.alert('Select platforms', 'Choose at least one platform to push to.');
      return;
    }
    setLoading(true);
    try {
      const results = await API.portfolioPushItem({
        itemId: item.id,
        platformIds: selectedPlatforms,
        caption,
        sourceAttribution: 'Sifter Skill_Up · sifter.app',
      });
      results.forEach((r: { platformId: string; postUrl: string }) => {
        onPushed(r.platformId, r.postUrl);
      });
      Alert.alert(
        'Posted! 🎉',
        `Your work was pushed to ${results.length} platform${results.length !== 1 ? 's' : ''} with Sifter Skill_Up as the source.`
      );
      onClose();
    } catch {
      Alert.alert('Error', 'Some posts failed. Check your connections and try again.');
    } finally {
      setLoading(false);
    }
  }

  const eligible = connectedAccounts.filter(a => {
    const platform = PLATFORMS[a.platformId];
    return platform && ['oauth', 'api_key'].includes(platform.integration);
  });

  const manualOnly = connectedAccounts.filter(a => {
    const platform = PLATFORMS[a.platformId];
    return platform && !['oauth', 'api_key'].includes(platform.integration);
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={modal.scroll}>

        <View style={push.header}>
          <Text style={push.title}>Push to Portfolio Platforms</Text>
          <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
            <Text style={modal.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={push.itemCard}>
          <Text style={push.itemTitle}>{item.title}</Text>
          <Text style={push.itemMeta}>{item.type} · {item.fieldId}</Text>
        </View>

        {/* Auto-post eligible platforms */}
        {eligible.length > 0 && (
          <>
            <Text style={push.sectionLabel}>Auto-post (connected via OAuth)</Text>
            {eligible.map(acc => {
              const pl = PLATFORMS[acc.platformId];
              const selected = selectedPlatforms.includes(acc.platformId);
              const alreadyPosted = item.pushedTo.some(p => p.platformId === acc.platformId);
              return (
                <TouchableOpacity
                  key={acc.platformId}
                  style={[push.platformRow, selected && push.platformRowSelected, alreadyPosted && push.platformRowPosted]}
                  onPress={() => !alreadyPosted && togglePlatform(acc.platformId)}
                  activeOpacity={alreadyPosted ? 1 : 0.7}>
                  <Text style={push.platformIcon}>{pl.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={push.platformName}>{pl.name}</Text>
                    <Text style={push.platformUsername}>@{acc.username}</Text>
                  </View>
                  {alreadyPosted
                    ? <Text style={push.alreadyPosted}>✓ Posted</Text>
                    : <View style={[push.checkbox, selected && push.checkboxSelected]}>
                        {selected && <Text style={push.checkmark}>✓</Text>}
                      </View>}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Caption editor */}
        {eligible.length > 0 && (
          <>
            <Text style={push.sectionLabel}>Caption / post text</Text>
            <TextInput
              style={push.captionInput}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={push.captionNote}>
              ⚡ "Sifter Skill_Up · sifter.app" will always be included in the attribution field — even if you edit this caption.
            </Text>
          </>
        )}

        {/* Manual-only platforms */}
        {manualOnly.length > 0 && (
          <>
            <Text style={push.sectionLabel}>Manual submission platforms</Text>
            <Text style={push.manualNote}>
              These platforms don't have posting APIs. We'll generate a formatted submission package for you to upload directly.
            </Text>
            {manualOnly.map(acc => {
              const pl = PLATFORMS[acc.platformId];
              return (
                <TouchableOpacity
                  key={acc.platformId}
                  style={push.manualRow}
                  onPress={async () => {
                    const pkg = await API.portfolioGeneratePackage({ itemId: item.id, platformId: acc.platformId });
                    if (pkg?.downloadUrl) Linking.openURL(pkg.downloadUrl);
                  }}>
                  <Text style={push.platformIcon}>{pl.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={push.platformName}>{pl.name}</Text>
                    <Text style={push.platformUsername}>@{acc.username}</Text>
                  </View>
                  <Text style={push.packageBtn}>Get package ↗</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {connectedAccounts.length === 0 && (
          <View style={push.noAccounts}>
            <Text style={push.noAccountsText}>
              You haven't connected any portfolio platforms yet. Go to the Platforms tab to set them up.
            </Text>
          </View>
        )}

        {eligible.length > 0 && (
          <TouchableOpacity
            style={[modal.submitBtn, loading && modal.submitBtnDisabled]}
            onPress={handlePush}
            disabled={loading || selectedPlatforms.length === 0}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={modal.submitText}>
                  Push to {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} →
                </Text>}
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Portfolio Item Modal
// ─────────────────────────────────────────────────────────────

function AddItemModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (item: PortfolioItem) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fieldId, setFieldId] = useState(ALL_FIELDS[0]?.id ?? '');
  const [type, setType] = useState<PortfolioItem['type']>('project');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const TYPES: Array<{ value: PortfolioItem['type']; label: string; icon: string }> = [
    { value: 'project', label: 'Project', icon: '🏗️' },
    { value: 'writeup', label: 'Write-up', icon: '✍️' },
    { value: 'code', label: 'Code', icon: '💻' },
    { value: 'design', label: 'Design', icon: '🎨' },
    { value: 'video', label: 'Video', icon: '🎬' },
    { value: 'certificate', label: 'Certificate', icon: '🏆' },
  ];

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing info', 'Title and description are required.');
      return;
    }
    setLoading(true);
    try {
      const result = await API.portfolioAddItem({
        title: title.trim(),
        description: description.trim(),
        fieldId,
        type,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      if (result.success) {
        onAdded(result.data.item);
        onClose();
      } else {
        Alert.alert('Error', result.message ?? 'Could not save item.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={modal.scroll}>
        <View style={push.header}>
          <Text style={push.title}>Add Portfolio Item</Text>
          <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
            <Text style={modal.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={modal.label}>Title *</Text>
        <TextInput style={modal.input} value={title} onChangeText={setTitle} placeholder="e.g. On-Chain Whale Tracker" />

        <Text style={modal.label}>Description *</Text>
        <TextInput
          style={[modal.input, { height: 90, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="What did you build? What problem does it solve? What did you learn?"
          multiline
        />

        <Text style={modal.label}>Field</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
          {ALL_FIELDS.map(f => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFieldId(f.id)}
              style={[add.fieldChip, fieldId === f.id && { backgroundColor: f.color, borderColor: f.color }]}>
              <Text style={add.fieldChipText}>{f.emoji} {f.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={modal.label}>Type</Text>
        <View style={add.typeRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setType(t.value)}
              style={[add.typeChip, type === t.value && add.typeChipSelected]}>
              <Text style={add.typeIcon}>{t.icon}</Text>
              <Text style={[add.typeLabel, type === t.value && add.typeLabelSelected]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={modal.label}>Tags (comma separated)</Text>
        <TextInput
          style={modal.input}
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. solidity, defi, python, analysis"
          autoCapitalize="none"
        />

        <View style={modal.sifterBadge}>
          <Text style={modal.sifterBadgeText}>
            ⚡ This item will be attributed to Sifter Skill_Up on every platform you push it to
          </Text>
        </View>

        <TouchableOpacity
          style={[modal.submitBtn, loading && modal.submitBtnDisabled]}
          onPress={handleSave}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={modal.submitText}>Save Portfolio Item</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Portfolio Screen
// ─────────────────────────────────────────────────────────────

type Tab = 'overview' | 'platforms' | 'items';

export default function PortfolioScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [connectModal, setConnectModal] = useState<PortfolioPlatform | null>(null);
  const [pushModal, setPushModal] = useState<PortfolioItem | null>(null);
  const [addModal, setAddModal] = useState(false);

  const activeField = user?.active_track ? getField(user.active_track) : ALL_FIELDS[0];
  const { primary: primaryPlatforms, secondary: secondaryPlatforms } =
    getPlatformsForField(activeField?.id ?? 'crypto');

  const allRelevantPlatforms = [...primaryPlatforms, ...secondaryPlatforms];

  const fetchData = useCallback(async () => {
    try {
      const [accounts, items] = await Promise.all([
        API.portfolioGetConnectedAccounts(),
        API.portfolioGetItems(),
      ]);
      setConnectedAccounts(accounts ?? []);
      setPortfolioItems(items ?? []);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  const connectedCount = connectedAccounts.length;
  const itemsWithPushes = portfolioItems.filter(i => i.pushedTo.length > 0).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Portfolio Hub</Text>
          <Text style={styles.headerSub}>
            {connectedCount} platform{connectedCount !== 1 ? 's' : ''} connected · {portfolioItems.length} items
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['overview', 'platforms', 'items'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'overview' ? '📊 Overview' : tab === 'platforms' ? '🔗 Platforms' : '📁 My Work'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { label: 'Connected', value: connectedCount, icon: '🔗' },
                { label: 'Items', value: portfolioItems.length, icon: '📁' },
                { label: 'Pushed', value: itemsWithPushes, icon: '🚀' },
              ].map(s => (
                <View key={s.label} style={[styles.statBox, Shadow.sm]}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Active field context */}
            {activeField && (
              <View style={[styles.fieldBanner, { borderLeftColor: activeField.color }]}>
                <Text style={styles.fieldBannerEmoji}>{activeField.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldBannerTitle}>Your field: {activeField.name}</Text>
                  <Text style={styles.fieldBannerSub}>
                    {primaryPlatforms.length} primary · {secondaryPlatforms.length} secondary platforms recommended
                  </Text>
                </View>
              </View>
            )}

            {/* Primary platform checklist */}
            <Text style={styles.sectionTitle}>Recommended platforms for {activeField?.name}</Text>
            {primaryPlatforms.map(pl => {
              const acc = connectedAccounts.find(a => a.platformId === pl.id);
              return (
                <TouchableOpacity
                  key={pl.id}
                  style={[styles.checklistRow, Shadow.sm]}
                  onPress={() => setConnectModal(pl)}
                  activeOpacity={0.8}>
                  <View style={[styles.checklistIcon, { backgroundColor: pl.color + '20' }]}>
                    <Text style={{ fontSize: 18 }}>{pl.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.checklistName}>{pl.name}</Text>
                    <Text style={styles.checklistSub} numberOfLines={1}>{pl.what_to_post}</Text>
                  </View>
                  {acc
                    ? <View style={styles.checkDone}><Text style={styles.checkDoneText}>✓</Text></View>
                    : <View style={styles.checkEmpty}><Text style={styles.checkEmptyText}>+</Text></View>}
                </TouchableOpacity>
              );
            })}

            {/* Recent items */}
            {portfolioItems.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Recent portfolio items</Text>
                {portfolioItems.slice(0, 3).map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, Shadow.sm]}
                    onPress={() => setPushModal(item)}
                    activeOpacity={0.8}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.itemFooter}>
                      <Text style={styles.itemType}>{item.type}</Text>
                      {item.pushedTo.length > 0
                        ? <Text style={styles.itemPushed}>Pushed to {item.pushedTo.length} platform{item.pushedTo.length !== 1 ? 's' : ''} ✓</Text>
                        : <Text style={styles.itemUnpushed}>Not yet pushed</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {portfolioItems.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📁</Text>
                <Text style={styles.emptyTitle}>No portfolio items yet</Text>
                <Text style={styles.emptySub}>
                  As you complete levels and build things, add them here and push them to your portfolio platforms in one tap.
                </Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setAddModal(true)}>
                  <Text style={styles.emptyBtnText}>Add your first item</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ── PLATFORMS TAB ── */}
        {activeTab === 'platforms' && (
          <>
            <Text style={styles.sectionTitle}>Primary platforms</Text>
            <Text style={styles.sectionSub}>These are where recruiters and clients look first for {activeField?.name} roles.</Text>
            {primaryPlatforms.map(pl => (
              <PlatformCard
                key={pl.id}
                platform={pl}
                connected={connectedAccounts.find(a => a.platformId === pl.id)}
                onPress={() => setConnectModal(pl)}
              />
            ))}

            {secondaryPlatforms.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Secondary platforms</Text>
                <Text style={styles.sectionSub}>Build community, reach, and thought leadership.</Text>
                {secondaryPlatforms.map(pl => (
                  <PlatformCard
                    key={pl.id}
                    platform={pl}
                    connected={connectedAccounts.find(a => a.platformId === pl.id)}
                    onPress={() => setConnectModal(pl)}
                  />
                ))}
              </>
            )}

            {/* All platforms (not field-specific) */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Other connected platforms</Text>
            {connectedAccounts
              .filter(a => !allRelevantPlatforms.find(p => p.id === a.platformId))
              .map(acc => {
                const pl = PLATFORMS[acc.platformId];
                if (!pl) return null;
                return (
                  <PlatformCard
                    key={acc.platformId}
                    platform={pl}
                    connected={acc}
                    onPress={() => setConnectModal(pl)}
                  />
                );
              })}

            {connectedAccounts.filter(a => !allRelevantPlatforms.find(p => p.id === a.platformId)).length === 0 && (
              <Text style={styles.sectionSub}>No other connected platforms.</Text>
            )}
          </>
        )}

        {/* ── ITEMS TAB ── */}
        {activeTab === 'items' && (
          <>
            {portfolioItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📁</Text>
                <Text style={styles.emptyTitle}>No portfolio items yet</Text>
                <Text style={styles.emptySub}>
                  Add your projects, write-ups, designs, code, and certificates. Push them to your platforms in one tap.
                </Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setAddModal(true)}>
                  <Text style={styles.emptyBtnText}>Add first item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              portfolioItems.map(item => {
                const field = getField(item.fieldId);
                return (
                  <View key={item.id} style={[styles.itemCardFull, Shadow.sm]}>
                    <View style={styles.itemCardHeader}>
                      <View style={[styles.itemTypeBadge, { backgroundColor: field?.color + '20' ?? '#eee' }]}>
                        <Text style={[styles.itemTypeBadgeText, { color: field?.color ?? Colors.accent }]}>
                          {field?.emoji} {item.type}
                        </Text>
                      </View>
                      <Text style={styles.itemDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                    {item.tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {item.tags.map(tag => (
                          <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
                        ))}
                      </View>
                    )}
                    {/* Where it's been pushed */}
                    {item.pushedTo.length > 0 && (
                      <View style={styles.pushedRow}>
                        {item.pushedTo.map(push => {
                          const pl = PLATFORMS[push.platformId];
                          return pl ? (
                            <TouchableOpacity
                              key={push.platformId}
                              onPress={() => Linking.openURL(push.postUrl)}
                              style={styles.pushedPill}>
                              <Text style={styles.pushedPillText}>{pl.icon} {pl.name} ↗</Text>
                            </TouchableOpacity>
                          ) : null;
                        })}
                      </View>
                    )}
                    <TouchableOpacity
                      style={[styles.pushBtn, { backgroundColor: field?.color ?? Colors.accent }]}
                      onPress={() => setPushModal(item)}>
                      <Text style={styles.pushBtnText}>
                        {item.pushedTo.length > 0 ? 'Push to more platforms →' : 'Push to platforms →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}

      </ScrollView>

      {/* ── MODALS ── */}

      {/* Platform connect modal */}
      <Modal visible={!!connectModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setConnectModal(null)}>
        {connectModal && (
          <PlatformConnectModal
            platform={connectModal}
            existing={connectedAccounts.find(a => a.platformId === connectModal.id)}
            onClose={() => setConnectModal(null)}
            onConnected={acc => {
              setConnectedAccounts(prev => {
                const without = prev.filter(a => a.platformId !== acc.platformId);
                return [...without, acc];
              });
              setConnectModal(null);
            }}
          />
        )}
      </Modal>

      {/* Push item modal */}
      <Modal visible={!!pushModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPushModal(null)}>
        {pushModal && (
          <PushItemModal
            item={pushModal}
            connectedAccounts={connectedAccounts}
            onClose={() => setPushModal(null)}
            onPushed={(platformId, postUrl) => {
              setPortfolioItems(prev => prev.map(i =>
                i.id === pushModal.id
                  ? { ...i, pushedTo: [...i.pushedTo, { platformId, postUrl, pushedAt: new Date().toISOString() }] }
                  : i
              ));
            }}
          />
        )}
      </Modal>

      {/* Add item modal */}
      <Modal visible={addModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddModal(false)}>
        <AddItemModal
          onClose={() => setAddModal(false)}
          onAdded={item => setPortfolioItems(prev => [item, ...prev])}
        />
      </Modal>

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:             { flex: 1, backgroundColor: Colors.bg },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.card, borderBottomWidth: 1.5, borderBottomColor: Colors.border },
  headerTitle:        { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  headerSub:          { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  addBtn:             { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  addBtnText:         { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  tabBar:             { flexDirection: 'row', backgroundColor: Colors.card, borderBottomWidth: 1.5, borderBottomColor: Colors.border },
  tab:                { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive:          { borderBottomWidth: 3, borderBottomColor: Colors.accent },
  tabText:            { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSoft },
  tabTextActive:      { color: Colors.accent },
  content:            { padding: Spacing.lg, paddingBottom: 80, gap: Spacing.sm },
  statsRow:           { flexDirection: 'row', gap: Spacing.sm },
  statBox:            { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  statIcon:           { fontSize: 20, marginBottom: 2 },
  statValue:          { fontSize: FontSize.xl, fontWeight: '900', color: Colors.accent },
  statLabel:          { fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  fieldBanner:        { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, borderLeftWidth: 4 },
  fieldBannerEmoji:   { fontSize: 28 },
  fieldBannerTitle:   { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  fieldBannerSub:     { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  sectionTitle:       { fontSize: FontSize.md, fontWeight: '900', color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.xs },
  sectionSub:         { fontSize: FontSize.xs, color: Colors.textSoft, marginBottom: Spacing.sm, lineHeight: 16 },
  checklistRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.border },
  checklistIcon:      { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checklistName:      { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  checklistSub:       { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  checkDone:          { width: 28, height: 28, borderRadius: 99, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  checkDoneText:      { color: '#166534', fontWeight: '900', fontSize: 14 },
  checkEmpty:         { width: 28, height: 28, borderRadius: 99, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkEmptyText:     { color: Colors.textMuted, fontSize: 16, fontWeight: '700' },
  itemCard:           { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border },
  itemCardFull:       { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.border, gap: Spacing.sm },
  itemCardHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle:          { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  itemDesc:           { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 },
  itemFooter:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  itemType:           { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: '700' },
  itemPushed:         { fontSize: FontSize.xs, color: '#166534', fontWeight: '700' },
  itemUnpushed:       { fontSize: FontSize.xs, color: Colors.textMuted },
  itemTypeBadge:      { borderRadius: 99, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  itemTypeBadgeText:  { fontSize: FontSize.xs, fontWeight: '800' },
  itemDate:           { fontSize: FontSize.xs, color: Colors.textMuted },
  tagsRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:                { backgroundColor: Colors.bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  tagText:            { fontSize: 11, color: Colors.textSoft },
  pushedRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pushedPill:         { backgroundColor: '#f0fdf4', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#86efac' },
  pushedPillText:     { fontSize: 11, color: '#166534', fontWeight: '700' },
  pushBtn:            { borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center', marginTop: Spacing.xs },
  pushBtnText:        { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  emptyState:         { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  emptyIcon:          { fontSize: 52 },
  emptyTitle:         { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  emptySub:           { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
  emptyBtn:           { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  emptyBtnText:       { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
});

const pc = StyleSheet.create({
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md, borderWidth: 1.5, borderColor: Colors.border },
  iconWrap:   { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon:       { fontSize: 22 },
  name:       { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  connected:  { fontSize: FontSize.xs, color: '#166534', fontWeight: '700', marginTop: 2 },
  notConnected: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  badge:      { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  badgeConnected: { backgroundColor: '#dcfce7' },
  badgeEmpty: { backgroundColor: Colors.accentSoft },
  badgeText:  { fontSize: 11, fontWeight: '800', color: Colors.accent },
  badgeTextConnected: { color: '#166534' },
});

const modal = StyleSheet.create({
  scroll:         { padding: Spacing.lg, paddingBottom: 80, gap: Spacing.sm },
  header:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg, marginBottom: Spacing.md },
  headerIcon:     { fontSize: 32 },
  headerTitle:    { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  headerUrl:      { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  closeBtn:       { width: 32, height: 32, borderRadius: 99, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  closeText:      { fontSize: 14, color: Colors.textSoft, fontWeight: '700' },
  existingBanner: { backgroundColor: '#f0fdf4', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#86efac', marginBottom: Spacing.md },
  existingText:   { fontSize: FontSize.sm, color: '#166534' },
  chooseTip:      { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.lg, backgroundColor: Colors.bg, borderRadius: Radius.md, padding: Spacing.md },
  modeCard:       { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 2, marginBottom: Spacing.md },
  modeIcon:       { fontSize: 24, marginTop: 2 },
  modeTitle:      { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  modeSub:        { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 17, flex: 1 },
  modeArrow:      { fontSize: 22, color: Colors.textMuted, alignSelf: 'center' },
  openPlatformBtn: { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, marginTop: Spacing.sm },
  openPlatformText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
  backBtn:        { marginBottom: Spacing.md },
  backText:       { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
  formTitle:      { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  formSub:        { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 20, marginBottom: Spacing.lg },
  label:          { fontSize: FontSize.xs, fontWeight: '800', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: Spacing.sm },
  input:          { backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text },
  sifterBadge:    { backgroundColor: Colors.accentSoft, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.accent + '40', marginVertical: Spacing.md },
  sifterBadgeText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '700', lineHeight: 16 },
  submitBtn:      { backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:     { color: '#fff', fontWeight: '900', fontSize: FontSize.md },
  centeredBox:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, gap: Spacing.lg },
  verifyText:     { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  verifySubText:  { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
  doneEmoji:      { fontSize: 64 },
  doneText:       { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text },
  doneSub:        { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center' },
});

const push = StyleSheet.create({
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  title:            { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  itemCard:         { backgroundColor: Colors.bg, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.lg },
  itemTitle:        { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  itemMeta:         { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  sectionLabel:     { fontSize: FontSize.xs, fontWeight: '800', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.md },
  platformRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 6 },
  platformRowSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  platformRowPosted: { opacity: 0.6 },
  platformIcon:     { fontSize: 22 },
  platformName:     { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  platformUsername: { fontSize: FontSize.xs, color: Colors.textSoft },
  checkbox:         { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkmark:        { color: '#fff', fontWeight: '900', fontSize: 13 },
  alreadyPosted:    { fontSize: FontSize.xs, color: '#166534', fontWeight: '800' },
  captionInput:     { backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text, height: 110, marginBottom: Spacing.sm },
  captionNote:      { fontSize: FontSize.xs, color: Colors.accent, lineHeight: 16, backgroundColor: Colors.accentSoft, padding: Spacing.sm, borderRadius: Radius.sm },
  manualNote:       { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 16, marginBottom: Spacing.sm },
  manualRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: 6 },
  packageBtn:       { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '800' },
  noAccounts:       { backgroundColor: Colors.bg, borderRadius: Radius.md, padding: Spacing.xl, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  noAccountsText:   { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 20 },
});

const add = StyleSheet.create({
  fieldChip:      { backgroundColor: Colors.card, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: Colors.border, marginRight: 8 },
  fieldChipText:  { fontSize: 12, fontWeight: '700', color: Colors.text },
  typeRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  typeChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: Colors.border },
  typeChipSelected: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  typeIcon:       { fontSize: 16 },
  typeLabel:      { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSoft },
  typeLabelSelected: { color: Colors.accent },
});
