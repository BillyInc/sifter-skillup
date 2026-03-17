/**
 * Sifter Skill_Up — Terms of Service (full legal text)
 * Plain English where possible. Lawyer-reviewable structure.
 * Accessible from LearnMoreScreen, onboarding, and footer.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';

const SECTIONS = [
  {
    num: '1', title: 'Who We Are',
    body: 'Sifter Skill_Up is an educational platform operated by Sifter Technologies Ltd, incorporated under the laws of the Federal Republic of Nigeria. References to "we", "us", or "Sifter" mean Sifter Technologies Ltd.',
  },
  {
    num: '2', title: 'What This Platform Is',
    body: 'Sifter Skill_Up is an educational tool. We provide lessons, simulations, portfolio tools, and career skill development content. We are not a recruitment agency, career counsellor, job placement service, financial adviser, legal adviser, or professional licensing body.',
  },
  {
    num: '3', title: 'No Employment Guarantee',
    body: 'Completion of any career path, level, or certification on Sifter Skill_Up does not guarantee job placement, employment offers, interview opportunities, salary increases, or any specific career outcome. Your outcomes depend on your effort, experience, network, local market conditions, and many factors outside our control.',
  },
  {
    num: '4', title: 'Interview Mode is Simulation Only',
    body: 'Our "Interview Mode" feature provides simulated practice based on common industry patterns. It is practice only. We do not have access to actual interview questions from any employer. Real interviews may differ significantly. Passing interview mode does not mean you will pass any real interview.',
  },
  {
    num: '5', title: 'Educational Content Disclaimer',
    body: 'Our lessons are designed against industry frameworks (APICS, CSCMP, CFA, and others) to be as accurate and current as possible. However, we do not guarantee the accuracy, completeness, or timeliness of any content. Industry standards and best practices change. Always verify critical information with official sources and qualified professionals.',
  },
  {
    num: '6', title: 'You Own Your Portfolio Content',
    body: 'You retain full ownership of all projects, work, and materials you create while using Sifter Skill_Up. By storing content on our platform, you grant us a non-exclusive, worldwide, royalty-free licence to host and display it within the app, enable the portfolio push features you initiate, and generate previews of your work. We do not claim ownership of your work. You may delete it at any time. We will not use your portfolio content to train AI models without your explicit written permission.',
  },
  {
    num: '7', title: 'Authorised Agent for Third-Party Platforms',
    body: 'By using our profile creation and portfolio push features, you expressly authorise Sifter Skill_Up to act as your limited agent for the purpose of: (a) creating accounts on platforms you designate; (b) populating profile information based on your learning progress; (c) pushing portfolio work you approve; (d) updating profiles with achievements you earn.\n\nYou acknowledge that: you are solely responsible for the accuracy of submitted information; you retain full control and may modify content directly on third-party platforms; we act only at your direction; you may revoke access at any time.',
  },
  {
    num: '8', title: 'OAuth and Credential Security',
    body: 'We never store your passwords for any third-party platform. Where we use OAuth, we store only access tokens provided by the platform with your explicit permission. These tokens grant limited access only to permissions you approve. You may revoke access at any time from your Sifter account settings or directly from the third-party platform\'s settings. We implement industry-standard security measures. However, no method of storage is 100% secure.',
  },
  {
    num: '9', title: 'Third-Party Platform Disclaimer',
    body: 'Our integrations (LinkedIn, GitHub, Upwork, Fiverr, and others) rely on those platforms\' APIs and policies. We do not control these platforms. They may change their APIs, terms, or policies at any time. We are not liable for account suspensions, data loss, formatting issues, or other problems arising from changes to third-party platforms. Your use of each platform is governed by that platform\'s own terms of service.',
  },
  {
    num: '10', title: 'Your Data and Privacy',
    body: 'Your diary content is encrypted and stored only on your device — it never leaves your device or reaches our servers. Your learning progress is stored on our servers to enable multi-device access and restore after phone changes. We do not sell your personal data to any third party. For full details, see our Privacy Policy at sifter.app/privacy.',
  },
  {
    num: '11', title: 'Referral Programme',
    body: 'Referral points are awarded at our discretion and may be modified, suspended, or discontinued at any time with notice. Points have no cash value except as explicitly stated in the reward tier system. We reserve the right to void referral points obtained through fraudulent or automated means.',
  },
  {
    num: '12', title: 'User-Generated Content (Guilds, Posts, Comments)',
    body: 'You are responsible for content you post in guilds, discussions, and group projects. You must not post content that is unlawful, defamatory, harassing, or infringing. We reserve the right to remove any content at our discretion and to terminate accounts that violate these standards. We are not responsible for content posted by other users.',
  },
  {
    num: '13', title: 'Platform Availability',
    body: 'We aim for maximum uptime but do not guarantee uninterrupted availability. We are not liable for damages resulting from inability to access the platform, data loss, or technical issues.',
  },
  {
    num: '14', title: 'Limitation of Liability',
    body: 'To the maximum extent permitted by applicable law, Sifter Technologies Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this platform, including but not limited to loss of earnings, loss of employment opportunity, or reliance on any educational content.',
  },
  {
    num: '15', title: 'Termination',
    body: 'We may terminate or restrict your access at our sole discretion if you violate these terms, abuse the platform, engage in fraudulent activity, or harm other users. We will provide notice where reasonably possible unless the violation requires immediate action.',
  },
  {
    num: '16', title: 'Changes to These Terms',
    body: 'We may update these terms. We will notify you of material changes via in-app notification and email at least 14 days before they take effect. Continued use of the platform after that date constitutes acceptance.',
  },
  {
    num: '17', title: 'Governing Law',
    body: 'These terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Disputes are subject to Nigerian jurisdiction. If you use Sifter from a jurisdiction with mandatory consumer protection laws that override these terms, those laws apply to that extent.',
  },
  {
    num: '18', title: 'Contact',
    body: 'Legal notices: legal@sifter.app\nGeneral support: support@sifter.app\nPrivacy concerns: privacy@sifter.app\n\nSifter Technologies Ltd, Lagos, Nigeria.',
  },
];

interface Props { onClose?: () => void; }

export default function TermsScreen({ onClose }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.sub}>Last updated: March 2026 · Governing law: Nigeria</Text>
        </View>
        {onClose && <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>}
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.lawyerNote}>
          <Text style={styles.lawyerText}>
            ⚠️ These terms have been drafted for clarity but should be reviewed by a qualified Nigerian lawyer before your platform reaches 10,000 users. Contact legal@sifter.app.
          </Text>
        </View>
        {SECTIONS.map(s => (
          <View key={s.num} style={styles.section}>
            <Text style={styles.sectionNum}>{s.num}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{s.title}</Text>
              <Text style={styles.sectionBody}>{s.body}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.emailBtn} onPress={() => Linking.openURL('mailto:legal@sifter.app')}>
          <Text style={styles.emailBtnText}>Questions? Email legal@sifter.app</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#fff' },
  title: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 },
  close: { fontSize: 18, color: Colors.textSoft, padding: Spacing.xs },
  body: { padding: Spacing.lg },
  lawyerNote: { backgroundColor: Colors.goldSoft, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.gold },
  lawyerText: { fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 },
  section: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: '#fff', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  sectionNum: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.accent, width: 24 },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  sectionBody: { fontSize: FontSize.xs, color: Colors.textSoft, lineHeight: 18 },
  emailBtn: { borderWidth: 1, borderColor: Colors.accent, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
  emailBtnText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700' },
});
