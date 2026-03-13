import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';

type Mode = 'welcome' | 'login' | 'signup';

export default function AuthScreen() {
  const { signInEmail, signUpEmail, signInGuest } = useAuth();
  const [mode, setMode]       = useState<Mode>('welcome');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = async (action: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try { await action(); }
    catch (e: any) { setError(e.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  if (mode === 'welcome') {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.welcome}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={styles.appName}>Sifter Skill_Up</Text>
          <Text style={styles.tagline}>Master crypto, one lesson at a time.</Text>

          <View style={styles.features}>
            {['270 levels across 18 topics', 'Duolingo-style lessons', 'Guilds, streaks & XP', 'Works offline'].map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setMode('signup')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Get Started — Free</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, styles.secondaryBtn, { marginTop: Spacing.md }]} onPress={() => setMode('login')} activeOpacity={0.85}>
            <Text style={[styles.primaryBtnText, { color: Colors.accent }]}>I already have an account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: Spacing.xl }} onPress={() => handle(signInGuest)}>
            <Text style={styles.guestText}>Continue as guest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => setMode('welcome')} style={{ alignSelf: 'flex-start', marginBottom: Spacing.xl }}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
          <Text style={styles.formSub}>{mode === 'login' ? 'Sign in to continue your streak.' : 'Start your crypto education journey.'}</Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {mode === 'signup' && (
            <TextInput
              style={styles.input} placeholder="Username" placeholderTextColor={Colors.textMuted}
              value={username} onChangeText={setUsername} autoCapitalize="none"
            />
          )}
          <TextInput
            style={styles.input} placeholder="Email address" placeholderTextColor={Colors.textMuted}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
          />
          <TextInput
            style={styles.input} placeholder="Password" placeholderTextColor={Colors.textMuted}
            value={password} onChangeText={setPassword} secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={() => handle(mode === 'login'
              ? () => signInEmail(email, password)
              : () => signUpEmail(email, password, username)
            )}
            disabled={loading} activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: Spacing.lg, alignSelf: 'center' }} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: FontSize.md }}>
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={[styles.primaryBtn, styles.secondaryBtn]} onPress={() => handle(signInGuest)} disabled={loading} activeOpacity={0.85}>
            <Text style={[styles.primaryBtnText, { color: Colors.accent }]}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: Colors.bg },
  welcome:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  logo:           { fontSize: 72, marginBottom: Spacing.md },
  appName:        { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  tagline:        { fontSize: FontSize.lg, color: Colors.textSoft, textAlign: 'center', marginBottom: Spacing.xxxl },
  features:       { width: '100%', gap: Spacing.md, marginBottom: Spacing.xxxl },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureCheck:   { fontSize: FontSize.lg, color: Colors.green, fontWeight: '800', width: 24 },
  featureText:    { fontSize: FontSize.md, color: Colors.text, fontWeight: '600' },
  guestText:      { fontSize: FontSize.md, color: Colors.textSoft, fontWeight: '600' },

  form:           { flexGrow: 1, padding: Spacing.xxl, justifyContent: 'center' },
  formTitle:      { fontSize: FontSize.xxxl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.sm },
  formSub:        { fontSize: FontSize.md, color: Colors.textSoft, marginBottom: Spacing.xxl },
  input:          { backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.lg, fontSize: FontSize.md, color: Colors.text, marginBottom: Spacing.md },
  errorBox:       { backgroundColor: Colors.redSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  errorText:      { color: Colors.red, fontSize: FontSize.sm, fontWeight: '600' },
  dividerRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  dividerLine:    { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText:    { color: Colors.textSoft, fontSize: FontSize.sm },

  primaryBtn:     { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  secondaryBtn:   { backgroundColor: Colors.accentSoft, borderWidth: 2, borderColor: Colors.accent },
  primaryBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
});
