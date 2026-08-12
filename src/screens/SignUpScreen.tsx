/**
 * SignUpScreen - create a Sifter LevelUp account.
 * Email/password live via useAuth.signUpEmail.
 * On success -> onboarding (AccountTypeGate -> persona setup).
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/lib/api";
import { useTheme, Spacing, FontSize, Brand, CompassFonts } from "@/theme";
import { SifterButton } from "@/components/ui";
import {
  AuthScaffold,
  AuthField,
  LegalFooter,
  ErrorNote,
  TermsModal,
} from "./auth/authShared";

function toIsoDate(value: string): string | null {
  const trimmed = value.trim();
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, dd, mm, yyyy] = slash;
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return `${yyyy}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return null;
  }
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return iso ? trimmed : null;
}

function friendlySignupError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (!message) return fallback;
  if (/already registered|already exists/i.test(message)) {
    return "An account already exists for this email. Please log in instead.";
  }
  if (/invalid verification code/i.test(message)) {
    return "That code is not correct. Check the email and try again.";
  }
  if (/expired/i.test(message)) {
    return "That code has expired. Please request a new one.";
  }
  if (/request a verification code/i.test(message)) {
    return "Please request a new verification code before creating your account.";
  }
  if (/too many attempts/i.test(message)) {
    return "Too many attempts. Please request a new verification code.";
  }
  if (/bad request|internal server error|schema|column|relation|violates|null value/i.test(message)) {
    return fallback;
  }
  return message;
}

const DEV_SIGNUP_PRESETS = [
  {
    label: "SS Student",
    firstName: "Dev",
    lastName: "Senior",
    email: "levelup.dev+ss@student.test",
  },
  {
    label: "JAMB",
    firstName: "Dev",
    lastName: "Jamb",
    email: "levelup.dev+jamb@student.test",
  },
  {
    label: "University",
    firstName: "Dev",
    lastName: "University",
    email: "levelup.dev+university@student.test",
  },
  {
    label: "Graduate",
    firstName: "Dev",
    lastName: "Graduate",
    email: "levelup.dev+graduate@student.test",
  },
  {
    label: "Skilled",
    firstName: "Dev",
    lastName: "Skilled",
    email: "levelup.dev+skilled@student.test",
  },
  {
    label: "Professional",
    firstName: "Dev",
    lastName: "Professional",
    email: "levelup.dev+professional@student.test",
  },
  {
    label: "School Admin",
    firstName: "Dev",
    lastName: "SchoolAdmin",
    email: "levelup.dev+school-admin@educator.test",
  },
  {
    label: "University Admin",
    firstName: "Dev",
    lastName: "UniversityAdmin",
    email: "levelup.dev+university-admin@educator.test",
  },
] as const;

const DEV_PASSWORD = "Password123!";
const DEV_EMAIL_CODE = "000000";

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUpEmail } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const passwordMismatch = Boolean(confirmPassword && password !== confirmPassword);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setCodeSent(false);
    setDevCode("");
    setEmailCode("");
    setError("");
  };

  const validateBaseFields = () => {
    setError("");
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      setError("Complete your name, date of birth, email and password.");
      return false;
    }
    if (!toIsoDate(dateOfBirth)) {
      setError("Enter date of birth as DD/MM/YYYY.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const applyDevPreset = (preset: (typeof DEV_SIGNUP_PRESETS)[number]) => {
    setFirstName(preset.firstName);
    setMiddleName("");
    setLastName(preset.lastName);
    setDateOfBirth("01/01/2000");
    setEmail(preset.email);
    setPassword(DEV_PASSWORD);
    setConfirmPassword(DEV_PASSWORD);
    setEmailCode(DEV_EMAIL_CODE);
    setCodeSent(true);
    setDevCode(DEV_EMAIL_CODE);
    setError("");
  };

  const handleSendCode = async () => {
    if (!validateBaseFields()) return;
    setBusy(true);
    try {
      const result = await API.requestEmailVerificationCode(email.trim());
      setCodeSent(true);
      setDevCode(result.devCode ?? "");
      setError("");
    } catch (e: any) {
      setError(friendlySignupError(e, "We could not send your code. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!validateBaseFields()) {
      return;
    }
    if (!emailCode.trim()) {
      setError("Enter the verification code sent to your email.");
      return;
    }
    setBusy(true);
    try {
      const isoDob = toIsoDate(dateOfBirth);
      if (!isoDob) {
        setError("Enter date of birth as DD/MM/YYYY.");
        return;
      }
      await signUpEmail(email.trim(), password, {
        first_name: firstName,
        middle_name: middleName || undefined,
        last_name: lastName,
        date_of_birth: isoDob,
        email_code: emailCode.trim(),
      });
      router.replace("/(auth)/onboarding");
    } catch (e: any) {
      setError(friendlySignupError(e, "We could not create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold>
      <TouchableOpacity
        style={styles.back}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
          {"<- Back"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Create your account
      </Text>

      <ErrorNote message={error} />

      {typeof __DEV__ !== "undefined" && __DEV__ ? (
        <View style={[styles.devPanel, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <Text style={[styles.devTitle, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>
            Dev test accounts
          </Text>
          <View style={styles.devGrid}>
            {DEV_SIGNUP_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.email}
                onPress={() => applyDevPreset(preset)}
                style={[styles.devChip, { borderColor: colors.borderRole.subtle }]}
              >
                <Text style={[styles.devChipText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.devHint, { color: colors.textRole.muted }, CompassFonts.body]}>
            Password: {DEV_PASSWORD} / code: {DEV_EMAIL_CODE}
          </Text>
        </View>
      ) : null}

      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          <AuthField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoFocus
          />
        </View>
        <View style={{ flex: 1 }}>
          <AuthField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>

      <AuthField
        label="Middle name (optional)"
        value={middleName}
        onChangeText={setMiddleName}
      />

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>Date of birth</Text>
        <View style={styles.dateRow}>
          <TextInput
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textRole.placeholder}
            keyboardType="numbers-and-punctuation"
            style={[styles.dateInput, { color: colors.textRole.primary, backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }, CompassFonts.body]}
          />
          <TouchableOpacity
            onPress={() => setDatePickerOpen(true)}
            style={[styles.dateButton, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[{ color: colors.accentRole.action }, CompassFonts.bodyBold]}>Choose</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.hint, { color: colors.textRole.muted }, CompassFonts.body]}>Type it or choose day, month and year.</Text>
      </View>

      <AuthField
        label="Email address"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secure
        placeholder="********"
        hint="At least 8 characters"
      />
      <AuthField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secure
        placeholder="********"
      />
      {passwordMismatch ? (
        <Text style={[styles.inlineError, { color: colors.accentRole.danger }, CompassFonts.bodyMedium]}>
          Passwords do not match.
        </Text>
      ) : null}

      {codeSent ? (
        <AuthField
          label="Email verification code"
          value={emailCode}
          onChangeText={setEmailCode}
          keyboardType="number-pad"
          placeholder="123456"
          hint={devCode ? `Development code: ${devCode} or 000000` : "Enter the 6-digit code sent to your email"}
        />
      ) : null}

      <SifterButton
        label={codeSent ? "Verify & create account ->" : "Send email code ->"}
        onPress={codeSent ? handleCreate : handleSendCode}
        loading={busy}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
      />
      <ErrorNote message={error} />

      <View style={styles.row}>
        <Text style={[styles.muted, { color: colors.textRole.muted }, CompassFonts.body]}>
          Already have an account?
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8}>
          <Text style={[styles.link, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
            Sign in
          </Text>
        </TouchableOpacity>
      </View>

      <LegalFooter action="creating an account" onShowTerms={() => setShowTerms(true)} />

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <DatePickerModal
        visible={datePickerOpen}
        value={dateOfBirth}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(value) => { setDateOfBirth(value); setDatePickerOpen(false); }}
      />
    </AuthScaffold>
  );
}

function DatePickerModal({ visible, value, onClose, onSelect }: { visible: boolean; value: string; onClose: () => void; onSelect: (value: string) => void }) {
  const { colors } = useTheme();
  const now = new Date();
  const [search, setSearch] = useState("");
  const [day, setDay] = useState(value.split("/")[0] || "");
  const [month, setMonth] = useState(value.split("/")[1] || "");
  const [year, setYear] = useState(value.split("/")[2] || "");
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const years = Array.from({ length: 86 }, (_, i) => String(now.getFullYear() - i)).filter((item) => item.includes(search));
  const choose = () => {
    if (day && month && year) onSelect(`${day.padStart(2, "0")}/${month}/${year}`);
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.modalTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Date of birth</Text>
          <Text style={[styles.hint, { color: colors.textRole.muted }, CompassFonts.body]}>Choose a value or search for a year.</Text>
          <View style={styles.pickerRow}>{["Day", "Month"].map((label) => <Text key={label} style={[styles.pickerLabel, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>{label}</Text>)}</View>
          <View style={styles.choiceRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>{Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((item) => <Pressable key={item} onPress={() => setDay(item)} style={[styles.choice, day === item && { backgroundColor: Brand.primary }]}><Text style={{ color: day === item ? "#fff" : colors.textRole.primary }}>{item}</Text></Pressable>)}</ScrollView>
          </View>
          <View style={styles.choiceRow}><ScrollView horizontal showsHorizontalScrollIndicator={false}>{months.map((item) => <Pressable key={item} onPress={() => setMonth(item)} style={[styles.choice, month === item && { backgroundColor: Brand.primary }]}><Text style={{ color: month === item ? "#fff" : colors.textRole.primary }}>{item}</Text></Pressable>)}</ScrollView></View>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search year" placeholderTextColor={colors.textRole.placeholder} keyboardType="number-pad" style={[styles.yearSearch, { color: colors.textRole.primary, backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }}>{years.map((item) => <Pressable key={item} onPress={() => setYear(item)} style={[styles.choice, year === item && { backgroundColor: Brand.primary }]}><Text style={{ color: year === item ? "#fff" : colors.textRole.primary }}>{item}</Text></Pressable>)}</ScrollView>
          <View style={styles.modalActions}><TouchableOpacity onPress={onClose}><Text style={[{ color: colors.textRole.secondary }, CompassFonts.bodyBold]}>Cancel</Text></TouchableOpacity><SifterButton label="Use date" onPress={choose} variant="track" color={Brand.primary} size="md" disabled={!day || !month || !year} /></View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { fontSize: FontSize.md },
  title: {
    fontSize: FontSize.xxl,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  nameRow: { flexDirection: "row", gap: Spacing.md },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm },
  hint: { fontSize: FontSize.xs, lineHeight: 17 },
  dateRow: { flexDirection: "row", gap: Spacing.sm, alignItems: "center" },
  dateInput: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: FontSize.md },
  dateButton: { minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, justifyContent: "center" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, gap: Spacing.sm },
  modalTitle: { fontSize: FontSize.xl },
  pickerRow: { flexDirection: "row", justifyContent: "space-around" },
  pickerLabel: { fontSize: FontSize.xs },
  choiceRow: { minHeight: 42 },
  choice: { minWidth: 42, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 6, paddingHorizontal: 10 },
  yearSearch: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  muted: { fontSize: FontSize.sm },
  link: { fontSize: FontSize.sm },
  inlineError: { fontSize: FontSize.sm, marginTop: -Spacing.xs },
  devPanel: { borderWidth: 1, borderRadius: 12, padding: Spacing.md, gap: Spacing.sm },
  devTitle: { fontSize: FontSize.sm },
  devGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  devChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  devChipText: { fontSize: FontSize.xs },
  devHint: { fontSize: FontSize.xs },
});
