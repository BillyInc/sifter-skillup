import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useStarknetPrivyLogin, type OAuthProvider } from '../hooks/useStarknetPrivyLogin';
import { PRIVY_CONFIGURED, PRIVY_ENABLED } from '../lib/config';
import { readPendingPrivyWebLogin } from '../lib/privyShared';
import { useTheme, Spacing, Radius, FontSize } from '../theme';
import { SifterButton } from '../components/ui';
import { getFieldVisualTheme } from '../lib/visualThemes';

const { width: W, height: H } = Dimensions.get('window');
const STARKNET_THEME = getFieldVisualTheme('starknet');
const BASE_THEME = { accent: '#0052ff' };

type Mode = 'welcome' | 'login' | 'signup' | 'connecting' | 'starknet';

function getTgInitData(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      return tg.initData;
    }
  }
  return null;
}

function isTelegram(): boolean {
  return !!getTgInitData();
}

function setupTg() {
  if (Platform.OS !== 'web') {
    return;
  }
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) {
    return;
  }
  tg.expand();
  tg.enableClosingConfirmation();
}

async function connectBaseWallet(): Promise<{ address: string; signature: string; message: string } | null> {
  if (Platform.OS !== 'web') {
    return null;
  }
  const eth = (window as any).ethereum;
  if (!eth) {
    Linking.openURL(`https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`);
    return null;
  }
  try {
    const [address] = await eth.request({ method: 'eth_requestAccounts' }) as string[];
    const message = `Sign in to Sifter Skill_Up\nAddress: ${address}\nTime: ${Date.now()}`;
    const signature = await eth.request({
      method: 'personal_sign',
      params: [message, address.toLowerCase()],
    }) as string;
    return { address: address.toLowerCase(), signature, message };
  } catch {
    return null;
  }
}

function isBaseAvailable(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !!(window as any).ethereum;
}

function hasPendingPrivyWebLogin(): boolean {
  return Platform.OS === 'web' && !!readPendingPrivyWebLogin();
}

function CircuitBackground({ isDark }: { isDark: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const dotColor = isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)';
  const cols = Math.ceil(W / 40);
  const rows = Math.ceil(H / 40);
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity }]} pointerEvents="none">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((__, col) => (
          <View
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: col * 40 - 1,
              top: row * 40 - 1,
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: dotColor,
            }}
          />
        )))}
    </Animated.View>
  );
}

function AuthButton({
  label,
  onPress,
  loading,
  variant = 'primary',
  colors,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'base';
  colors: any;
}) {
  return (
    <SifterButton
      label={label}
      onPress={onPress}
      loading={loading}
      variant={variant === 'ghost' ? 'ghost' : 'primary'}
      color={variant === 'base' ? BASE_THEME.accent : colors.accent}
      size="md"
      fullWidth
      style={styles.authButton}
    />
  );
}

function AuthInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  colors,
}: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  colors: any;
}) {
  return (
    <TextInput
      style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

type StarknetOnReady = (
  email: string,
  starknetAddress?: string,
  privyAccessToken?: string,
) => void;

function StarknetHeader() {
  return (
    <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
      <Text style={{ fontSize: FontSize.xxl, fontWeight: '900', color: '#fff', textAlign: 'center' }}>
        Starknet World
      </Text>
      <Text style={{ fontSize: FontSize.sm, color: 'rgba(255,255,255,0.68)', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
        Log in or create access with Privy, then continue straight into the Starknet islands.
      </Text>
    </View>
  );
}

function StarknetBenefits() {
  return (
    <View style={[styles.starkBenefits, { borderColor: `${STARKNET_THEME.palette.primary}30` }]}>
      {[
        'Live Privy auth with backend wallet wiring',
        'No seed phrase required',
        'Land directly on Starknet Island #18',
        'Use real Starknet wallet infrastructure, not demo mode',
      ].map((text) => (
        <View key={text} style={styles.benefitRow}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, flex: 1 }}>{text}</Text>
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
  const submittedReadyToken = useRef<string | null>(null);

  const status = privyLogin.state.kind;
  const busy = status === 'sending-code' || status === 'verifying';
  const showCodeInput = status === 'awaiting-code' || status === 'verifying';
  const displayError = localError || (privyLogin.state.kind === 'error' ? privyLogin.state.message : '');

  useEffect(() => {
    if (privyLogin.state.kind !== 'ready') {
      return;
    }

    const readyKey = `${privyLogin.state.email}:${privyLogin.state.privyAccessToken}`;
    if (submittedReadyToken.current === readyKey) {
      return;
    }

    submittedReadyToken.current = readyKey;
    onReady(
      privyLogin.state.email,
      privyLogin.state.starknetAddress,
      privyLogin.state.privyAccessToken,
    );
  }, [onReady, privyLogin.state]);

  async function handleSendCode() {
    setLocalError('');
    if (!email) {
      return;
    }
    try {
      await privyLogin.startEmail(email);
    } catch (error: any) {
      setLocalError(error?.message ?? 'Could not send code');
    }
  }

  async function handleSubmitCode() {
    setLocalError('');
    try {
      await privyLogin.submitEmailCode(email, code);
    } catch (error: any) {
      setLocalError(error?.message ?? 'Login failed');
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    setLocalError('');
    try {
      await privyLogin.startOAuth(provider, email);
    } catch (error: any) {
      setLocalError(error?.message ?? 'OAuth failed');
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: '#0a0a1f', borderColor: `${STARKNET_THEME.palette.primary}40` }]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={[styles.backText, { color: STARKNET_THEME.palette.primary }]}>Back</Text>
      </TouchableOpacity>

      <StarknetHeader />
      <StarknetBenefits />

      {!showCodeInput ? (
        <TextInput
          style={[styles.input, { backgroundColor: '#1e1e38', borderColor: '#334155', color: '#fff' }]}
          placeholder="Email address"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />
      ) : (
        <>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginBottom: Spacing.sm, textAlign: 'center' }}>
            Enter the 6-digit code sent to {email}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#1e1e38', borderColor: '#334155', color: '#fff', letterSpacing: 4, textAlign: 'center' }]}
            placeholder="000000"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={6}
            editable={!busy}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: STARKNET_THEME.palette.primary, opacity: busy ? 0.7 : 1 }]}
        onPress={showCodeInput ? handleSubmitCode : handleSendCode}
        disabled={busy || (!showCodeInput ? !email : code.length < 6)}
        activeOpacity={0.85}
      >
        {busy ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={[styles.btnText, { color: '#fff' }]}>
              {status === 'verifying' ? 'Verifying...' : 'Sending code...'}
            </Text>
          </View>
        ) : (
          <Text style={[styles.btnText, { color: '#fff' }]}>
            {showCodeInput ? 'Verify and Continue' : 'Send login code'}
          </Text>
        )}
      </TouchableOpacity>

      {!showCodeInput ? (
        <View style={{ marginTop: Spacing.md }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.sm }}>
            or continue with
          </Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {(['google', 'apple', 'twitter'] as OAuthProvider[]).map((provider) => (
              <TouchableOpacity
                key={provider}
                style={{
                  flex: 1,
                  borderColor: '#334155',
                  borderWidth: 1,
                  borderRadius: Radius.md,
                  paddingVertical: Spacing.md,
                  alignItems: 'center',
                  backgroundColor: '#1e1e38',
                  opacity: busy ? 0.5 : 1,
                }}
                onPress={() => handleOAuth(provider)}
                disabled={busy}
                activeOpacity={0.85}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: FontSize.sm }}>
                  {provider === 'twitter' ? 'X' : provider[0].toUpperCase() + provider.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {displayError ? (
        <Text style={{ color: '#f87171', fontSize: FontSize.xs, marginTop: Spacing.md, textAlign: 'center' }}>
          {displayError}
        </Text>
      ) : null}
    </View>
  );
}

function StarknetUnavailableMode({ onBack }: { onBack: () => void }) {
  const message = !PRIVY_CONFIGURED
    ? 'Starknet auth is unavailable until Privy is configured. Demo-mode Starknet wallet creation has been disabled.'
    : 'Starknet auth is currently unavailable on this device.';

  return (
    <View style={[styles.card, { backgroundColor: '#0a0a1f', borderColor: `${STARKNET_THEME.palette.primary}40` }]}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={[styles.backText, { color: STARKNET_THEME.palette.primary }]}>Back</Text>
      </TouchableOpacity>
      <StarknetHeader />
      <StarknetBenefits />
      <Text style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 }}>
        {message}
      </Text>
    </View>
  );
}

function StarknetMode({
  onBack,
  onReady,
}: {
  onBack: () => void;
  onReady: StarknetOnReady;
}) {
  if (PRIVY_ENABLED) {
    return <StarknetPrivyMode onBack={onBack} onReady={onReady} />;
  }
  return <StarknetUnavailableMode onBack={onBack} />;
}

export default function AuthScreen() {
  const {
    signInEmail,
    signUpEmail,
    signInGuest,
    authTelegram,
    authBaseWallet,
    authStarknet,
    starknetLoading,
  } = useAuth();
  const { colors, isDark } = useTheme();
  const [mode, setMode] = useState<Mode>(() => (hasPendingPrivyWebLogin() ? 'starknet' : 'welcome'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, { toValue: 1, duration: 480, useNativeDriver: true }).start();
    if (isTelegram()) {
      setupTg();
      const initData = getTgInitData();
      if (initData) {
        setMode('connecting');
        authTelegram(initData).catch(() => setMode('welcome'));
      }
    }
  }, [authTelegram, cardAnim]);

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (cause: any) {
      setError(cause.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBase = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await connectBaseWallet();
      if (result) {
        await authBaseWallet(result.address, result.signature, result.message);
      }
    } catch (cause: any) {
      setError(cause.message || 'Wallet error');
    } finally {
      setLoading(false);
    }
  };

  const handleStarknet = async (
    starkEmail: string,
    starknetAddress?: string,
    privyAccessToken?: string,
  ) => {
    setError('');
    setMode('connecting');
    try {
      await authStarknet(starkEmail, starknetAddress, privyAccessToken);
    } catch (cause: any) {
      setError(cause.message || 'Starknet error');
      setMode('starknet');
    }
  };

  const cardStyle = {
    opacity: cardAnim,
    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
  };

  if (mode === 'connecting') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <CircuitBackground isDark={isDark} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: Spacing.xl }} />
          <Text style={[styles.connectingText, { color: colors.textSoft }]}>Signing you in...</Text>
        </View>
      </View>
    );
  }

  if (mode === 'starknet') {
    return (
      <View style={[styles.screen, { backgroundColor: '#020208' }]}>
        <CircuitBackground isDark />
        <ScrollView contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={cardStyle}>
            <StarknetMode onBack={() => { setMode('welcome'); setError(''); }} onReady={handleStarknet} />
          </Animated.View>
          {error ? <Text style={[styles.errorText, { color: '#f87171' }]}>{error}</Text> : null}
          {starknetLoading ? <ActivityIndicator color={STARKNET_THEME.palette.primary} style={{ marginTop: Spacing.md }} /> : null}
        </ScrollView>
      </View>
    );
  }

  if (mode === 'welcome') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <CircuitBackground isDark={isDark} />
        {Platform.OS === 'web' ? (
          <View style={[styles.statusBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { color: colors.textSoft }]}>SERVER STATUS: OPTIMAL</Text>
            <Text style={{ color: colors.border }}>|</Text>
            <Text style={[styles.statusText, { color: colors.textMuted }]}>SIFTER SKILL_UP</Text>
          </View>
        ) : null}
        <ScrollView contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, cardStyle]}>
            <Text style={[styles.appName, { color: colors.text }]}>Sifter Skill_Up</Text>
            <Text style={[styles.tagline, { color: colors.textSoft }]}>
              Compact, track-first learning for crypto, operations, and advanced career paths.
            </Text>

            <View style={styles.btnGroup}>
              <AuthButton label="Create account" onPress={() => setMode('signup')} colors={colors} />

              <TouchableOpacity
                style={[styles.starknetCTA, { borderColor: `${STARKNET_THEME.palette.primary}50` }]}
                onPress={() => setMode('starknet')}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.starknetCTATitle, { color: STARKNET_THEME.palette.primary }]}>Log in or create with Starknet</Text>
                  <Text style={styles.starknetCTASub}>Privy auth, wallet sync, and direct Starknet island return</Text>
                </View>
              </TouchableOpacity>

              {(isBaseAvailable() || Platform.OS === 'web') ? (
                <AuthButton
                  label="Connect Base"
                  onPress={handleBase}
                  loading={loading}
                  variant="base"
                  colors={colors}
                />
              ) : null}

              <AuthButton
                label="Log in"
                onPress={() => setMode('login')}
                variant="ghost"
                colors={colors}
              />

              <TouchableOpacity style={styles.guestBtn} onPress={() => run(signInGuest)} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.textMuted} size="small" /> : <Text style={[styles.guestText, { color: colors.textMuted }]}>Continue as guest</Text>}
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.redSoft }]}>
                <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <CircuitBackground isDark={isDark} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, cardStyle]}>
              <TouchableOpacity onPress={() => setMode('welcome')} style={styles.backBtn}>
                <Text style={[styles.backText, { color: colors.accent }]}>Back</Text>
              </TouchableOpacity>

              <Text style={[styles.formTitle, { color: colors.text }]}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </Text>
              <Text style={[styles.formSub, { color: colors.textSoft }]}>
                {mode === 'login' ? 'Return to your saved track and continue.' : 'Create your account and enter your first track.'}
              </Text>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.redSoft }]}>
                  <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
                </View>
              ) : null}

              {mode === 'signup' ? (
                <AuthInput placeholder="Username" value={username} onChangeText={setUsername} colors={colors} />
              ) : null}
              <AuthInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" colors={colors} />
              <AuthInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry colors={colors} />

              <AuthButton
                label={mode === 'login' ? 'Log in' : 'Create account'}
                onPress={() => run(
                  mode === 'login'
                    ? () => signInEmail(email, password)
                    : () => signUpEmail(email, password, username),
                )}
                loading={loading}
                colors={colors}
              />

              <TouchableOpacity
                style={{ alignSelf: 'center', paddingVertical: Spacing.sm }}
                onPress={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}
              >
                <Text style={{ fontWeight: '700', fontSize: FontSize.md, color: colors.accent }}>
                  {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Log in'}
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  connectingText: { fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.lg },
  statusBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statusText: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  welcomeContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  formContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg, paddingBottom: Spacing.xxxl, alignItems: 'center' },
  card: { width: '100%', maxWidth: 430, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, gap: Spacing.sm },
  appName: { fontSize: FontSize.xxxl, fontWeight: '900', textAlign: 'center' },
  tagline: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  btnGroup: { gap: Spacing.sm },
  authButton: { width: '100%' },
  input: { borderWidth: 1.5, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.sm, width: '100%' },
  starknetCTA: { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md, backgroundColor: '#ec489908' },
  starknetCTATitle: { fontSize: FontSize.sm, fontWeight: '800', color: '#ec4899' },
  starknetCTASub: { fontSize: FontSize.xs, color: 'rgba(236,72,153,0.7)', marginTop: 2 },
  guestBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  guestText: { fontSize: FontSize.sm, fontWeight: '600' },
  errorBox: { borderRadius: Radius.md, padding: Spacing.md },
  errorText: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.md },
  backText: { fontSize: FontSize.md, fontWeight: '700' },
  formTitle: { fontSize: FontSize.xxl, fontWeight: '900' },
  formSub: { fontSize: FontSize.sm, lineHeight: 19 },
  starkBenefits: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
