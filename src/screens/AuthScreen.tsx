/**
 * Sifter Skill_Up — Auth Screen v3
 *
 * Three auth paths on one screen:
 *  1. Email / Password (existing)
 *  2. Base Wallet / SIWE (restored per roadmap)
 *  3. ⚡ Starknet via Privy email (new — creates gasless wallet, routes to Island 18)
 *
 * Visual: animated circuit-board background, card entrance animation.
 * Dark/light mode via useTheme().
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView, Animated, Dimensions, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useStarknetPrivyLogin, type OAuthProvider } from '../hooks/useStarknetPrivyLogin';
import { PRIVY_CONFIGURED } from '../lib/config';
import { useTheme, Spacing, Radius, FontSize, AnimPreset } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

type Mode = 'welcome' | 'login' | 'signup' | 'connecting' | 'starknet';

// ─── Telegram helpers ──────────────────────────────────────────────────────────

function getTgInitData(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) return tg.initData;
  }
  return null;
}
function isTelegram(): boolean { return !!getTgInitData(); }
function setupTg() {
  if (Platform.OS !== 'web') return;
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return;
  tg.expand(); tg.enableClosingConfirmation();
}

// ─── Base wallet helper ────────────────────────────────────────────────────────

async function connectBaseWallet(): Promise<{ address: string; signature: string; message: string } | null> {
  if (Platform.OS !== 'web') return null;
  const eth = (window as any).ethereum;
  if (!eth) {
    Linking.openURL('https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.href));
    return null;
  }
  try {
    const [address] = await eth.request({ method: 'eth_requestAccounts' }) as string[];
    const message = `Sign in to Sifter Skill_Up\nAddress: ${address}\nTime: ${Date.now()}`;
    const signature = await eth.request({ method: 'personal_sign', params: [message, address.toLowerCase()] }) as string;
    return { address: address.toLowerCase(), signature, message };
  } catch { return null; }
}

function isBaseAvailable(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !!(window as any).ethereum;
}

// ─── Animated circuit background ──────────────────────────────────────────────

function CircuitBackground({ isDark }: { isDark: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const dotColor = isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)';
  const cols = Math.ceil(W / 40);
  const rows = Math.ceil(H / 40);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity }]} pointerEvents="none">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <View key={`${r}-${c}`} style={{
            position: 'absolute', left: c * 40 - 1, top: r * 40 - 1,
            width: 3, height: 3, borderRadius: 1.5, backgroundColor: dotColor,
          }} />
        ))
      )}
    </Animated.View>
  );
}

// ─── Shared button ─────────────────────────────────────────────────────────────

function AuthButton({
  label, onPress, loading, variant = 'primary', colors,
}: {
  label: string; onPress: () => void; loading?: boolean;
  variant?: 'primary' | 'ghost' | 'base' | 'starknet'; colors: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const bg    = variant === 'primary' ? colors.accent
    : variant === 'base'    ? '#0052ff'
    : variant === 'starknet'? '#ec4899'
    : 'transparent';
  const border = variant === 'ghost' ? colors.border : 'transparent';
  const txtClr = variant === 'ghost' ? colors.accent : '#fff';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'ghost' ? 2 : 0 }]}
        onPress={handlePress} disabled={loading} activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color={txtClr} />
          : <Text style={[s.btnText, { color: txtClr }]}>{label}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────────

function AuthInput({ placeholder, value, onChangeText, secureTextEntry, keyboardType, colors }: {
  placeholder: string; value: string; onChangeText: (v: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; colors: any;
}) {
  return (
    <TextInput
      style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
      placeholder={placeholder} placeholderTextColor={colors.textMuted}
      value={value} onChangeText={onChangeText}
      secureTextEntry={secureTextEntry} keyboardType={keyboardType}
      autoCapitalize="none" autoCorrect={false}
    />
  );
}

// ─── Starknet onboarding mode ─────────────────────────────────────────────────

type StarknetOnReady = (
  email: string,
  starknetAddress?: string,
  privyAccessToken?: string,
) => void;

function StarknetHeader() {
  return (
    <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
      <Text style={{ fontSize: 48, marginBottom: Spacing.sm }}>⚡</Text>
      <Text style={{ fontSize: FontSize.xxl, fontWeight: '900', color: '#fff', textAlign: 'center' }}>
        Starknet World
      </Text>
      <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
        Sign in to spin up your Starknet account. Gasless on Sepolia — no seed phrase needed.
      </Text>
    </View>
  );
}

function StarknetBenefits() {
  return (
    <View style={[s.starkBenefits, { borderColor: '#ec489930' }]}>
      {[
        ['⚡', 'Gasless — AVNU Paymaster covers all fees'],
        ['🔐', 'No seed phrase — secured by Privy'],
        ['📍', 'Land directly on Starknet Island #18'],
        ['🧪', 'Execute real Sepolia transactions as you learn'],
      ].map(([icon, text]) => (
        <View key={text} style={s.benefitRow}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, flex: 1 }}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

function StarknetPrivyMode({ onBack, onReady }: { onBack: () => void; onReady: StarknetOnReady }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState('');
  const privyLogin = useStarknetPrivyLogin();

  const status = privyLogin.state.kind;
  const busy = status === 'sending-code' || status === 'verifying' || status === 'provisioning-wallet';

  async function handleSendCode() {
    setLocalError('');
    if (!email) return;
    try {
      await privyLogin.startEmail(email);
    } catch (e: any) {
      setLocalError(e?.message ?? 'Could not send code');
    }
  }

  async function handleSubmitCode() {
    setLocalError('');
    try {
      const ready = await privyLogin.submitEmailCode(email, code);
      onReady(ready.email, ready.starknetAddress, ready.privyAccessToken);
    } catch (e: any) {
      setLocalError(e?.message ?? 'Login failed');
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    setLocalError('');
    try {
      const ready = await privyLogin.startOAuth(provider, email);
      onReady(ready.email, ready.starknetAddress, ready.privyAccessToken);
    } catch (e: any) {
      setLocalError(e?.message ?? 'OAuth failed');
    }
  }

  const showCodeInput = status === 'awaiting-code' || status === 'verifying' || status === 'provisioning-wallet';
  const displayError = localError || (privyLogin.state.kind === 'error' ? privyLogin.state.message : '');

  return (
    <View style={[s.card, { backgroundColor: '#0a0a1f', borderColor: '#ec489940' }]}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={[s.backText, { color: '#ec4899' }]}>← Back</Text>
      </TouchableOpacity>

      <StarknetHeader />
      <StarknetBenefits />

      {!showCodeInput && (
        <TextInput
          style={[s.input, { backgroundColor: '#1e1e38', borderColor: '#334155', color: '#fff' }]}
          placeholder="Email address" placeholderTextColor="rgba(255,255,255,0.35)"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          editable={!busy}
        />
      )}

      {showCodeInput && (
        <>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginBottom: Spacing.sm, textAlign: 'center' }}>
            Enter the 6-digit code we sent to {email}
          </Text>
          <TextInput
            style={[s.input, { backgroundColor: '#1e1e38', borderColor: '#334155', color: '#fff', letterSpacing: 4, textAlign: 'center' }]}
            placeholder="000000" placeholderTextColor="rgba(255,255,255,0.35)"
            value={code} onChangeText={setCode}
            keyboardType="number-pad" autoCapitalize="none" autoCorrect={false}
            maxLength={6}
            editable={!busy}
          />
        </>
      )}

      <TouchableOpacity
        style={[s.btn, { backgroundColor: '#ec4899', opacity: busy ? 0.7 : 1 }]}
        onPress={showCodeInput ? handleSubmitCode : handleSendCode}
        disabled={busy || (!showCodeInput ? !email : code.length < 6)}
        activeOpacity={0.85}
      >
        {busy ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[s.btnText, { color: '#fff' }]}>
              {status === 'provisioning-wallet' ? 'Creating Starknet wallet…' :
               status === 'verifying' ? 'Verifying…' :
               'Sending code…'}
            </Text>
          </View>
        ) : (
          <Text style={[s.btnText, { color: '#fff' }]}>
            {showCodeInput ? '⚡ Verify & Create Wallet' : 'Send login code'}
          </Text>
        )}
      </TouchableOpacity>

      {!showCodeInput && (
        <View style={{ marginTop: Spacing.md }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.sm }}>
            or continue with
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(['google', 'apple', 'twitter'] as OAuthProvider[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={{ flex: 1, borderColor: '#334155', borderWidth: 1, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center', backgroundColor: '#1e1e38', opacity: busy ? 0.5 : 1 }}
                onPress={() => handleOAuth(p)}
                disabled={busy}
                activeOpacity={0.85}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: FontSize.sm }}>
                  {p === 'google' ? 'Google' : p === 'apple' ? 'Apple' : 'X'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {displayError ? (
        <Text style={{ color: '#f87171', fontSize: FontSize.xs, marginTop: Spacing.md, textAlign: 'center' }}>
          {displayError}
        </Text>
      ) : null}

      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: Spacing.md, lineHeight: 15 }}>
        Powered by Privy × Starkzap · Sepolia testnet · No real funds involved
      </Text>
    </View>
  );
}

function StarknetDemoMode({ colors, onBack, onSubmit, loading }: {
  colors: any; onBack: () => void; onSubmit: (email: string) => void; loading: boolean;
}) {
  const [email, setEmail] = useState('');
  return (
    <View style={[s.card, { backgroundColor: '#0a0a1f', borderColor: '#ec489940' }]}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={[s.backText, { color: '#ec4899' }]}>← Back</Text>
      </TouchableOpacity>

      <StarknetHeader />
      <StarknetBenefits />

      <TextInput
        style={[s.input, { backgroundColor: '#1e1e38', borderColor: '#334155', color: '#fff' }]}
        placeholder="Email address" placeholderTextColor="rgba(255,255,255,0.35)"
        value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
      />

      <TouchableOpacity
        style={[s.btn, { backgroundColor: '#ec4899', opacity: loading ? 0.7 : 1 }]}
        onPress={() => onSubmit(email)} disabled={loading || !email} activeOpacity={0.85}
      >
        {loading
          ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[s.btnText, { color: '#fff' }]}>Creating wallet…</Text>
            </View>
          : <Text style={[s.btnText, { color: '#fff' }]}>⚡ Create Starknet Wallet</Text>}
      </TouchableOpacity>

      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: Spacing.sm, lineHeight: 15 }}>
        Demo mode — Privy not configured. Running with simulated address.
      </Text>
    </View>
  );
}

function StarknetMode({ colors, onBack, onReady, loading }: {
  colors: any; onBack: () => void; onReady: StarknetOnReady; loading: boolean;
}) {
  if (PRIVY_CONFIGURED) {
    return <StarknetPrivyMode onBack={onBack} onReady={onReady} />;
  }
  return <StarknetDemoMode colors={colors} onBack={onBack} onSubmit={(email) => onReady(email)} loading={loading} />;
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function AuthScreen() {
  const { signInEmail, signUpEmail, signInGuest, authTelegram, authBaseWallet, authStarknet, starknetLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const [mode,     setMode]     = useState<Mode>('welcome');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 480, useNativeDriver: true }).start();
    if (isTelegram()) {
      setupTg();
      const initData = getTgInitData();
      if (initData) { setMode('connecting'); authTelegram(initData).catch(() => setMode('welcome')); }
    }
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setError(''); setLoading(true);
    try { await fn(); } catch (e: any) { setError(e.message || 'Something went wrong'); } finally { setLoading(false); }
  };

  const handleBase = async () => {
    setError(''); setLoading(true);
    try {
      const r = await connectBaseWallet();
      if (r) await authBaseWallet(r.address, r.signature, r.message);
    } catch (e: any) { setError(e.message || 'Wallet error'); } finally { setLoading(false); }
  };

  const router = useRouter();

  const handleStarknet = async (
    starkEmail: string,
    starknetAddress?: string,
    privyAccessToken?: string,
  ) => {
    setError('');
    setMode('connecting');
    try {
      await authStarknet(starkEmail, starknetAddress, privyAccessToken);
      // Route directly to Starknet Island (Island 18, levels 291-310)
      router.replace({
        pathname: '/(tabs)/map/island' as any,
        params: { initialIsland: '18' },
      });
    } catch (e: any) {
      setError(e.message || 'Starknet error');
      setMode('starknet');
    }
  };

  const cardStyle = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
  };

  // ── Connecting ──
  if (mode === 'connecting') return (
    <View style={[s.screen, { backgroundColor: colors.bg }]}>
      <CircuitBackground isDark={isDark} />
      <View style={s.center}>
        <Text style={{ fontSize: 56 }}>⚡</Text>
        <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: Spacing.xl }} />
        <Text style={[s.connectingText, { color: colors.textSoft }]}>Signing you in…</Text>
      </View>
    </View>
  );

  // ── Starknet mode ──
  if (mode === 'starknet') return (
    <View style={[s.screen, { backgroundColor: '#020208' }]}>
      <CircuitBackground isDark={true} />
      <ScrollView contentContainerStyle={s.welcomeContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={cardStyle}>
          <StarknetMode
            colors={colors}
            onBack={() => { setMode('welcome'); setError(''); }}
            onReady={handleStarknet}
            loading={starknetLoading}
          />
        </Animated.View>
        {error ? <Text style={[s.errorText, { color: '#f87171' }]}>{error}</Text> : null}
        <Text style={[s.legal, { color: 'rgba(255,255,255,0.2)' }]}>
          Sifter Skill_Up is an educational platform. Nothing here is financial advice.
        </Text>
      </ScrollView>
    </View>
  );

  // ── Welcome ──
  if (mode === 'welcome') return (
    <View style={[s.screen, { backgroundColor: colors.bg }]}>
      <CircuitBackground isDark={isDark} />
      {Platform.OS === 'web' && (
        <View style={[s.statusBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={s.statusDot} />
          <Text style={[s.statusText, { color: colors.textSoft }]}>SERVER STATUS: OPTIMAL</Text>
          <Text style={[{ color: colors.border }]}>│</Text>
          <Text style={[s.statusText, { color: colors.textMuted }]}>SIFTER SKILL_UP</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={s.welcomeContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }, cardStyle]}>
          <Text style={s.logo}>⚡</Text>
          <Text style={[s.appName, { color: colors.text }]}>Sifter Skill_Up</Text>
          <Text style={[s.tagline, { color: colors.textSoft }]}>
            Master crypto, career skills, and quantitative finance.
          </Text>

          {/* Feature pills */}
          <View style={s.pillRow}>
            {[['📡','Offline Sync'], ['🌐','Global Guilds'], ['🔥','Skill Streaks']].map(([icon, label]) => (
              <View key={label} style={[s.pill, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={{ fontSize: 13 }}>{icon}</Text>
                <Text style={[s.pillText, { color: colors.textSoft }]}>{label}</Text>
              </View>
            ))}
          </View>

          <View style={s.btnGroup}>
            <AuthButton label="Get Started — Free" onPress={() => setMode('signup')} colors={colors} />

            {/* ⚡ Starknet CTA — prominent secondary option */}
            <TouchableOpacity
              style={[s.starknetCTA, { borderColor: '#ec489950' }]}
              onPress={() => setMode('starknet')}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 20 }}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.starknetCTATitle]}>Continue with Starknet</Text>
                <Text style={[s.starknetCTASub]}>Gasless wallet · Real transactions · Island #18</Text>
              </View>
              <Text style={{ color: '#ec4899', fontSize: 18 }}>›</Text>
            </TouchableOpacity>

            {/* Base wallet (restored) */}
            {(isBaseAvailable() || Platform.OS === 'web') && (
              <AuthButton
                label="🔵 Connect Base Wallet"
                onPress={handleBase}
                loading={loading}
                variant="base"
                colors={colors}
              />
            )}

            <AuthButton
              label="I already have an account"
              onPress={() => setMode('login')}
              variant="ghost"
              colors={colors}
            />

            <TouchableOpacity style={s.guestBtn} onPress={() => run(signInGuest)} disabled={loading}>
              {loading
                ? <ActivityIndicator color={colors.textMuted} size="small" />
                : <Text style={[s.guestText, { color: colors.textMuted }]}>Continue as guest</Text>}
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={[s.errorBox, { backgroundColor: colors.redSoft }]}>
              <Text style={[s.errorText, { color: colors.red }]}>{error}</Text>
            </View>
          ) : null}
        </Animated.View>

        <Text style={[s.legal, { color: colors.textMuted }]}>
          By continuing you agree to our Terms and Privacy Policy.{'\n'}
          Sifter Skill_Up is an educational platform. Nothing here is financial advice.
        </Text>
      </ScrollView>
    </View>
  );

  // ── Login / Signup ──
  return (
    <View style={[s.screen, { backgroundColor: colors.bg }]}>
      <CircuitBackground isDark={isDark} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">
            <Animated.View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }, cardStyle]}>
              <TouchableOpacity onPress={() => setMode('welcome')} style={s.backBtn}>
                <Text style={[s.backText, { color: colors.accent }]}>← Back</Text>
              </TouchableOpacity>
              <Text style={[s.formTitle, { color: colors.text }]}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </Text>
              <Text style={[s.formSub, { color: colors.textSoft }]}>
                {mode === 'login' ? 'Sign in to continue your streak.' : 'Start your learning journey.'}
              </Text>

              {error ? (
                <View style={[s.errorBox, { backgroundColor: colors.redSoft }]}>
                  <Text style={[s.errorText, { color: colors.red }]}>{error}</Text>
                </View>
              ) : null}

              {mode === 'signup' && (
                <AuthInput placeholder="Username" value={username} onChangeText={setUsername} colors={colors} />
              )}
              <AuthInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" colors={colors} />
              <AuthInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry colors={colors} />

              <AuthButton
                label={mode === 'login' ? 'Sign In' : 'Create Account'}
                onPress={() => run(
                  mode === 'login'
                    ? () => signInEmail(email, password)
                    : () => signUpEmail(email, password, username)
                )}
                loading={loading} colors={colors}
              />

              <TouchableOpacity style={{ alignSelf: 'center', paddingVertical: Spacing.sm }}
                onPress={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}>
                <Text style={[{ fontWeight: '700', fontSize: FontSize.md }, { color: colors.accent }]}>
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.md }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ color: colors.textMuted, fontSize: FontSize.sm }}>or</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>

              <AuthButton label="Continue as Guest" onPress={() => run(signInGuest)} loading={loading} variant="ghost" colors={colors} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:         { flex: 1 },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  connectingText: { fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.lg },
  statusBar:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  statusDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText:     { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  welcomeContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  card:           { width: '100%', maxWidth: 440, borderRadius: Radius.xl, padding: Spacing.xxl, borderWidth: 1, gap: Spacing.md },
  logo:           { fontSize: 52, textAlign: 'center' },
  appName:        { fontSize: FontSize.xxxl, fontWeight: '900', textAlign: 'center' },
  tagline:        { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  pillRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  pill:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, borderWidth: 1 },
  pillText:       { fontSize: FontSize.xs, fontWeight: '600' },
  btnGroup:       { gap: Spacing.sm },
  btn:            { borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  btnText:        { fontSize: FontSize.lg, fontWeight: '800' },
  starknetCTA:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md, backgroundColor: '#ec489908' },
  starknetCTATitle: { fontSize: FontSize.sm, fontWeight: '800', color: '#ec4899' },
  starknetCTASub:   { fontSize: FontSize.xs, color: 'rgba(236,72,153,0.7)', marginTop: 2 },
  guestBtn:       { alignItems: 'center', paddingVertical: Spacing.sm },
  guestText:      { fontSize: FontSize.md, fontWeight: '600' },
  errorBox:       { borderRadius: Radius.md, padding: Spacing.md },
  errorText:      { fontSize: FontSize.sm, fontWeight: '600' },
  legal:          { fontSize: 10, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 16 },
  formContent:    { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl, paddingBottom: Spacing.xxxl, alignItems: 'center' },
  backBtn:        { alignSelf: 'flex-start', marginBottom: Spacing.md },
  backText:       { fontSize: FontSize.md, fontWeight: '700' },
  formTitle:      { fontSize: FontSize.xxl, fontWeight: '900' },
  formSub:        { fontSize: FontSize.md, lineHeight: 21 },
  input:          { borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md + 2, fontSize: FontSize.md, width: '100%' },
  starkBenefits:  { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  benefitRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
