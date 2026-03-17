/**
 * Sifter Skill_Up — Auth Screen
 * Telegram Mini App auto-auth, Base SIWE wallet, email/guest fallback
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, Radius, FontSize } from '../theme';

type Mode = 'welcome' | 'login' | 'signup' | 'connecting';

function getTgInitData(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) return tg.initData;
  }
  return null;
}

function isTelegram(): boolean { return !!getTgInitData(); }
function isBase(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const eth = (window as any).ethereum;
    return !!(eth?.isCoinbaseWallet);
  }
  return false;
}

function setupTg() {
  if (Platform.OS !== 'web') return;
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return;
  tg.expand(); tg.enableClosingConfirmation();
  tg.setHeaderColor?.('#0a0a0a'); tg.setBackgroundColor?.('#0a0a0a');
}

async function connectBaseWallet(): Promise<{ address: string; signature: string; message: string } | null> {
  if (Platform.OS !== 'web') return null;
  const eth = (window as any).ethereum;
  if (!eth) {
    Linking.openURL('https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.href : ''));
    return null;
  }
  try {
    const [address] = await eth.request({ method: 'eth_requestAccounts' }) as string[];
    const message = `Sign in to Sifter Skill_Up\nAddress: ${address}\nTime: ${Date.now()}`;
    const signature = await eth.request({ method: 'personal_sign', params: [message, address.toLowerCase()] }) as string;
    return { address: address.toLowerCase(), signature, message };
  } catch { return null; }
}

export default function AuthScreen() {
  const { signInEmail, signUpEmail, signInGuest, authTelegram, authBaseWallet } = useAuth();
  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isTelegram()) {
      setupTg();
      const initData = getTgInitData();
      if (initData) { setMode('connecting'); authTelegram(initData).catch(() => setMode('welcome')); }
    }
  }, []);

  const run = async (fn: () => Promise<void>) => { setError(''); setLoading(true); try { await fn(); } catch (e: any) { setError(e.message || 'Something went wrong'); } finally { setLoading(false); } };
  const handleBase = async () => { setError(''); setLoading(true); try { const r = await connectBaseWallet(); if (r) await authBaseWallet(r.address, r.signature, r.message); } catch (e: any) { setError(e.message || 'Wallet error'); } finally { setLoading(false); } };

  if (mode === 'connecting') return (
    <SafeAreaView style={s.screen}><View style={s.center}>
      <Text style={{ fontSize: 56 }}>⚡</Text>
      <ActivityIndicator color={Colors.accent} size="large" style={{ marginTop: Spacing.xl }} />
      <Text style={{ color: Colors.textSoft, fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.lg }}>Signing you in…</Text>
    </View></SafeAreaView>
  );

  if (mode === 'welcome') return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={s.welcome}>
        <Text style={s.logo}>⚡</Text>
        <Text style={s.appName}>Sifter Skill_Up</Text>
        <Text style={s.tagline}>Master crypto, career skills, and quantitative finance.</Text>
        <View style={s.features}>
          {['270+ crypto levels across 18 islands','Supply Chain, Quant, Onchain career tracks','Guilds, streaks, portfolio & XP','Works offline — no signal needed'].map(f => (
            <View key={f} style={s.featureRow}><Text style={s.check}>✓</Text><Text style={s.featureText}>{f}</Text></View>
          ))}
        </View>
        <TouchableOpacity style={s.btn} onPress={() => setMode('signup')} activeOpacity={0.85}>
          <Text style={s.btnText}>Get Started — Free</Text>
        </TouchableOpacity>
        {(isBase() || Platform.OS === 'web') && (
          <TouchableOpacity style={[s.btn, { backgroundColor: '#0052ff', marginTop: Spacing.md }]} onPress={handleBase} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>🔵 Connect Base Wallet</Text>}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[s.btn, s.secondary, { marginTop: Spacing.md }]} onPress={() => setMode('login')} activeOpacity={0.85}>
          <Text style={[s.btnText, { color: Colors.accent }]}>I already have an account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: Spacing.xl }} onPress={() => run(signInGuest)} disabled={loading}>
          <Text style={{ color: Colors.textSoft, fontWeight: '600', fontSize: FontSize.md }}>{loading ? 'Loading…' : 'Continue as guest'}</Text>
        </TouchableOpacity>
        {error ? <View style={s.error}><Text style={{ color: Colors.red, fontSize: FontSize.sm, fontWeight: '600' }}>{error}</Text></View> : null}
        <Text style={s.legal}>By continuing you agree to our Terms and Privacy Policy. Sifter Skill_Up is an educational platform. Nothing here is financial advice.</Text>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setMode('welcome')} style={{ alignSelf: 'flex-start', marginBottom: Spacing.xl }}><Text style={{ fontSize: 24 }}>←</Text></TouchableOpacity>
          <Text style={s.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
          <Text style={{ fontSize: FontSize.md, color: Colors.textSoft, marginBottom: Spacing.xxl }}>{mode === 'login' ? 'Sign in to continue your streak.' : 'Start your learning journey.'}</Text>
          {error ? <View style={s.error}><Text style={{ color: Colors.red, fontSize: FontSize.sm, fontWeight: '600' }}>{error}</Text></View> : null}
          {mode === 'signup' && <TextInput style={s.input} placeholder="Username" placeholderTextColor={Colors.textMuted} value={username} onChangeText={setUsername} autoCapitalize="none" />}
          <TextInput style={s.input} placeholder="Email address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={() => run(mode === 'login' ? () => signInEmail(email, password) : () => signUpEmail(email, password, username))} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: Spacing.lg, alignSelf: 'center' }} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: FontSize.md }}>{mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg }}>
            <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} /><Text style={{ color: Colors.textSoft, fontSize: FontSize.sm }}>or</Text><View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
          </View>
          <TouchableOpacity style={[s.btn, s.secondary]} onPress={() => run(signInGuest)} disabled={loading} activeOpacity={0.85}>
            <Text style={[s.btnText, { color: Colors.accent }]}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: Colors.bg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcome:   { alignItems: 'center', padding: Spacing.xxl, paddingBottom: Spacing.xxxl },
  logo:      { fontSize: 72, marginBottom: Spacing.md },
  appName:   { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  tagline:   { fontSize: FontSize.lg, color: Colors.textSoft, textAlign: 'center', marginBottom: Spacing.xxxl },
  features:  { width: '100%', gap: Spacing.md, marginBottom: Spacing.xxxl },
  featureRow:{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  check:     { fontSize: FontSize.lg, color: Colors.green, fontWeight: '800', width: 24 },
  featureText:{ fontSize: FontSize.md, color: Colors.text, fontWeight: '600', flex: 1 },
  btn:       { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  secondary: { backgroundColor: Colors.accentSoft, borderWidth: 2, borderColor: Colors.accent },
  btnText:   { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  error:     { backgroundColor: Colors.redSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, width: '100%' },
  legal:     { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 16, paddingHorizontal: Spacing.lg },
  form:      { flexGrow: 1, padding: Spacing.xxl, justifyContent: 'center' },
  formTitle: { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  input:     { backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.lg, fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.md },
});
