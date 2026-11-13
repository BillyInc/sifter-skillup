import { FormEvent, lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "../../src/theme";
import { API, request } from "../../src/lib/api";
import { careerData } from "../../src/lib/careerData";
import { friendlyLoginError, isValidEmail } from "../../src/lib/authMessages";
import { TERMS_SECTIONS, privacySections } from "../../src/lib/legalContent";
import type { CareerSearchResult, SearchIntent } from "../../src/types/career";
import { WebAuthProvider, useAuth, type WebUser } from "./webAuth";
import { ExploreBaseProvider, ADMIN_EXPLORE_BASE } from "../../src/lib/exploreNav";
import { getEducatorProfile } from "../../src/lib/educatorProfile";
import { adminAudienceForProfile } from "../../src/lib/adminAudience";
import type { EducatorProfile } from "../../src/types/institution";
import { AdminShell } from "../../src/screens/admin/AdminShell";
import { LevelUpWebWordmark } from "../../src/components/brand/LevelUpWebWordmark";
import { Search } from "lucide-react";
import "./styles.css";

const TOKEN_KEY = "sifter_auth_token_v2";
const TERMS_VERSION = "2026-08-14";
const PRIVACY_VERSION = "2026-08-14";

const AdminDashboardScreen = lazy(() => import("../../src/screens/admin/GeneralDashboardScreen"));
const AdminGuidanceScreen = lazy(() => import("../../src/screens/admin/SchoolGuidanceDashboardScreen"));
const AdminStudentsScreen = lazy(() => import("../../src/screens/admin/StudentProvisioningScreen"));
const AdminVerifyScreen = lazy(() => import("../../src/screens/admin/VerificationScreen"));
const AdminSkillsGapScreen = lazy(() => import("../../src/screens/admin/SkillsGapScreen"));
const AdminGuidanceStartScreen = lazy(() => import("../../src/screens/admin/GuidanceStartScreen"));

const ExploreScreen = lazy(() => import("../../src/screens/ExploreScreen"));
const AdmissionBrowseScreen = lazy(() => import("../../src/screens/careerIntelligence/AdmissionBrowseScreen"));
const ProgrammeDetailRefinedScreen = lazy(() => import("../../src/screens/careerIntelligence/ProgrammeDetailRefinedScreen"));
const DomainExplorerScreen = lazy(() => import("../../src/screens/careerIntelligence/DomainExplorerScreen"));
const DomainDetailScreen = lazy(() => import("../../src/screens/careerIntelligence/DomainDetailScreen"));
const SubgroupDetailScreen = lazy(() => import("../../src/screens/careerIntelligence/SubgroupDetailScreen"));
const RoleDetailScreen = lazy(() => import("../../src/screens/careerIntelligence/RoleDetailScreen"));
const ProgrammeCompareScreen = lazy(() => import("../../src/screens/careerIntelligence/ProgrammeCompareScreen"));
const CareerHomeScreen = lazy(() => import("../../src/screens/CareerHomeScreen"));
const MyWorldScreen = lazy(() => import("../../src/screens/MyWorldScreen"));
const ProfileScreen = lazy(() => import("../../src/screens/ProfileScreen"));
const SettingsScreen = lazy(() => import("../../src/screens/SettingsScreen"));
const OpportunitiesScreen = lazy(() => import("../../src/screens/OpportunitiesScreen"));
const OpportunityDetailScreen = lazy(() => import("../../src/screens/careerIntelligence/OpportunityDetailScreen"));
const OrganisationProfileScreen = lazy(() => import("../../src/screens/careerIntelligence/OrganisationProfileScreen"));
const ScholarshipsScreen = lazy(() => import("../../src/screens/careerIntelligence/ScholarshipsScreen"));
const ApplicationWindowsScreen = lazy(() => import("../../src/screens/careerIntelligence/ApplicationWindowsScreen"));
const PortfolioScreen = lazy(() => import("../../src/screens/PortfolioScreen"));
const PortfolioHubScreen = lazy(() => import("../../src/screens/PortfolioHubScreen"));
const DiaryScreen = lazy(() => import("../../src/screens/DiaryScreen"));
const GitHubScreen = lazy(() => import("../../src/screens/GitHubScreen"));
const FeedScreen = lazy(() => import("../../src/screens/FeedScreen"));
const GuildScreen = lazy(() => import("../../src/screens/GuildScreen"));
const FieldsScreen = lazy(() => import("../../src/screens/FieldsScreen"));
const SkillsScreen = lazy(() => import("../../src/screens/SkillsScreen"));
const QuantMapScreen = lazy(() => import("../../src/screens/QuantMapScreen"));
const StreaksScreen = lazy(() => import("../../src/screens/StreaksScreen"));
const ReferralScreen = lazy(() => import("../../src/screens/ReferralScreen"));
const MySchoolScreen = lazy(() => import("../../src/screens/MySchoolScreen"));
const WorldScreen = lazy(() => import("../../src/screens/WorldScreen"));
const TrackRoomScreen = lazy(() => import("../../src/screens/TrackRoomScreen"));
const LessonScreen = lazy(() => import("../../src/screens/LessonScreen"));
const IslandMapScreen = lazy(() => import("../../src/screens/IslandMapScreen"));
const EcosystemTrackScreen = lazy(() => import("../../src/screens/EcosystemTrackScreen"));
const StarknetTrackScreen = lazy(() => import("../../src/screens/StarknetTrackScreen"));
const CairoBuilderTrackScreen = lazy(() => import("../../src/screens/CairoBuilderTrackScreen"));
const LeaderboardScreen = lazy(() => import("../../src/screens/LeaderboardScreen"));
const InterviewModeScreen = lazy(() => import("../../src/screens/InterviewModeScreen"));
const PathwaysHubScreen = lazy(() => import("../../src/screens/careerIntelligence/PathwaysHubScreen"));
const EntrepreneurshipPathwayScreen = lazy(() => import("../../src/screens/careerIntelligence/EntrepreneurshipPathwayScreen"));
const CareerChangerScreen = lazy(() => import("../../src/screens/careerIntelligence/CareerChangerScreen"));
const QualificationUpgradesScreen = lazy(() => import("../../src/screens/careerIntelligence/QualificationUpgradesScreen"));
const CharteredCredentialsScreen = lazy(() => import("../../src/screens/careerIntelligence/CharteredCredentialsScreen"));
const PhdPathwayScreen = lazy(() => import("../../src/screens/careerIntelligence/PhdPathwayScreen"));
const ElitePathwaysHubScreen = lazy(() => import("../../src/screens/careerIntelligence/ElitePathwaysHubScreen"));
const ElitePathwayDetailScreen = lazy(() => import("../../src/screens/careerIntelligence/ElitePathwayDetailScreen"));
const AdminMarketScreen = lazy(() => import("../../src/screens/admin/MarketIntelligenceScreen"));
const AdminPeersScreen = lazy(() => import("../../src/screens/admin/PeersScreen"));
const AdminDomainReachScreen = lazy(() => import("../../src/screens/admin/DomainReachAuditScreen"));
const AdminExpertDossierScreen = lazy(() => import("../../src/screens/admin/ExpertDossierScreen"));
const AdminFeedbackScreen = lazy(() => import("../../src/screens/admin/AdminFeedbackScreen"));
const AdminAffiliationScreen = lazy(() => import("../../src/screens/admin/AffiliationScreen"));
const AdminSessionScreen = lazy(() => import("../../src/screens/admin/SessionModeScreen"));
const AdminProfileScreen = lazy(() => import("../../src/screens/admin/InstitutionProfileScreen"));
const AdminStudentGuidanceRoute = lazy(() => import("../../app/(admin)/students/[userId]/guidance"));
const DisabledLearningScreen = lazy(() => import("../../src/screens/DisabledLearningScreen"));
const AccountTypeGate = lazy(() => import("../../src/screens/onboarding/AccountTypeGate"));

type AuthMode = "welcome" | "login" | "signup" | "forgot";

function currentPath() {
  return `${window.location.pathname}${window.location.search}`;
}

/**
 * Expo Router group names are part of native route hrefs but are not web
 * routes in the Vite shell. Shared resume links can therefore arrive here as
 * `/(tabs)/home` (or another grouped path). Normalize those compatibility
 * URLs at the web boundary instead of making every shared navigation helper
 * platform-aware.
 */
function normalizeWebPath(rawPath: string): string {
  let path = rawPath;
  try {
    path = decodeURIComponent(rawPath);
  } catch {
    // Keep the original path if a malformed encoded URL reaches the router.
  }

  const tabsMatch = path.match(/^\/\(tabs\)(\/.*)?$/);
  if (tabsMatch) return tabsMatch[1] || "/home";

  const adminMatch = path.match(/^\/\(admin\)(\/.*)?$/);
  if (adminMatch) return `/admin${adminMatch[1] || ""}`;

  const authMatch = path.match(/^\/\(auth\)(\/.*)?$/);
  if (authMatch) {
    const authPath = authMatch[1] || "/sign-in";
    if (authPath === "/sign-in") return "/login";
    if (authPath === "/create-account" || authPath === "/signup") return "/signup";
    return authPath;
  }

  return path;
}

function go(path: string, replace = false) {
  if (replace) window.history.replaceState({}, "", path);
  else window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function platformBackFallback(path: string): string {
  if (path === "/onboarding") return "/home";
  if (path.startsWith("/explore/")) return "/explore";
  if (path.startsWith("/opportunities/")) return "/opportunities";
  if (path.startsWith("/profile/")) return "/profile";
  if (path.startsWith("/myworld/") || path.startsWith("/portfolio")) return "/myworld";
  if (path.startsWith("/skills") || path === "/streaks" || path === "/world" || path === "/map" || path.startsWith("/map/")) return "/home";
  return "/home";
}

function platformBack(path: string) {
  if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
    window.history.back();
    return;
  }
  go(platformBackFallback(path));
}

function useLocation() {
  const [location, setLocation] = useState(currentPath);
  useEffect(() => {
    const onPopState = () => setLocation(currentPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  return location;
}

function routeMode(): AuthMode {
  const path = window.location.pathname;
  if (path === "/login" || path === "/sign-in") return "login";
  if (path === "/signup" || path === "/create-account") return "signup";
  if (path === "/forgot-password") return "forgot";
  const mode = new URLSearchParams(window.location.search).get("mode");
  return mode === "login" || mode === "signup" || mode === "forgot" ? mode : "welcome";
}

export function WebApp() {
  return (
    <WebAuthProvider>
      <ThemeProvider>
        <WebRouterApp />
      </ThemeProvider>
    </WebAuthProvider>
  );
}

function WebRouterApp() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const rawPath = location.split("?")[0] || "/";
  const path = normalizeWebPath(rawPath);
  const isGuest = user?.auth_provider === "guest";

  useEffect(() => {
    if (rawPath === path) return;
    const query = window.location.search;
    const hash = window.location.hash;
    window.history.replaceState({}, "", `${path}${query}${hash}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [path, rawPath]);

  if (loading) return <div className="loading">Loading Sifter LevelUp…</div>;

  const isPublic = path === "/" || path === "/login" || path === "/sign-in" || path === "/signup" || path === "/create-account" || path === "/forgot-password";
  // `/` is the public landing entry only for signed-out visitors. A refresh
  // by an authenticated user should reopen the workspace, not the marketing
  // entry or a route-loading dead end.
  if (path === "/" && user && !isGuest) return <AuthenticatedWebApp user={user} path="/home" />;
  if (path === "/") return <AuthEntry initialMode="welcome" />;
  if (user && isPublic && !isGuest) return <AuthenticatedWebApp user={user} path="/home" />;
  if (user && isPublic && isGuest) return <AuthEntry initialMode={routeMode()} />;
  if (!user && !isPublic) {
    go(`/?mode=login&return_to=${encodeURIComponent(location)}`, true);
    return <div className="loading">Opening sign in…</div>;
  }

  if (!user) return <AuthEntry initialMode={routeMode()} />;

  return <AuthenticatedWebApp user={user} path={path} />;
}

function AuthEntry({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState(initialMode);
  useEffect(() => {
    const onPopState = () => setMode(routeMode());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const change = (next: AuthMode) => {
    setMode(next);
    const path = next === "welcome" ? "/" : next === "login" ? "/login" : next === "signup" ? "/signup" : "/forgot-password";
    go(path);
  };

  return (
    <main className="shell">
      <section className="auth-layout">
        <div className="intro-panel">
          <div className="intro-brand-lockup"><LevelUpWebWordmark variant="dark" width={460} height={132} /></div>
          <h1>Find the direction that fits you.</h1>
          <p>Explore programmes, subjects, skills and opportunities with guidance that keeps your choices connected.</p>
          <div className="promise-list"><span>Programme and university guidance</span><span>Subject-aware next steps</span><span>Your choices saved in one place</span></div>
        </div>
        <div className="auth-card">
          {mode === "welcome" && <Welcome onLogin={() => change("login")} onSignup={() => change("signup")} />}
          {mode === "login" && <Login onBack={() => change("welcome")} onSignup={() => change("signup")} onForgot={() => change("forgot")} />}
          {mode === "signup" && <Signup onBack={() => change("welcome")} onLogin={() => change("login")} />}
          {mode === "forgot" && <ForgotPassword onBack={() => change("login")} />}
        </div>
      </section>
    </main>
  );
}

function Welcome({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  const { signInGuest } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function guest() {
    setBusy(true); setError("");
    try { await signInGuest(); go("/explore", true); } catch (e) { setError(e instanceof Error ? e.message : "Could not continue as guest."); } finally { setBusy(false); }
  }
  return <>
    <div className="auth-header"><h2>Welcome to Sifter LevelUp</h2><p className="muted">Choose how you want to continue with your guidance and saved choices.</p></div>
    <div className="stack"><button className="primary" onClick={onLogin}>Log in</button><button className="secondary" onClick={onSignup}>Create account</button><button className="link-button" onClick={guest} disabled={busy}>{busy ? "Opening guest mode…" : "Continue as guest"}</button></div>
    {error && <p className="error" role="alert">{error}</p>}
  </>;
}

function Login({ onBack, onSignup, onForgot }: { onBack: () => void; onSignup: () => void; onForgot: () => void }) {
  const { signInEmail } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim();
    if (!normalizedEmail) { setError("Enter your email address."); return; }
    if (!isValidEmail(normalizedEmail)) { setError("Enter a valid email address, such as name@example.com."); return; }
    if (!password) { setError("Enter your password."); return; }
    setBusy(true);
    try { await signInEmail(normalizedEmail, password); go("/home", true); }
    catch (e) { setError(friendlyLoginError(e)); }
    finally { setBusy(false); }
  }
  return <>
    <button className="back" onClick={onBack}>← Back</button>
    <div className="auth-header"><h2>Log in</h2><p className="muted">Use the email and password for your Sifter account.</p></div>
    <form onSubmit={submit} className="form">
      <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="button" className="text-button forgot-link" onClick={onForgot}>Forgot password?</button>
      <button className="primary" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    <p className="switch">Need an account? <button className="inline-button" onClick={onSignup}>Create one</button></p>
  </>;
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  minLength?: number;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label>
      {label}
      <span className="password-field">
        <input type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} value={value} onChange={onChange} required />
        <button type="button" className="password-toggle" onMouseDown={(event) => event.preventDefault()} onClick={() => setVisible((current) => !current)} aria-pressed={visible} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}>
          {visible ? "Hide" : "Show"}
        </button>
      </span>
      {hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}

function Signup({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const { signUpEmail } = useAuth();
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", dateOfBirth: "", email: "", password: "", confirmPassword: "", schoolCode: "", claimCode: "", code: "" });
  const [sent, setSent] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false); const [privacyAccepted, setPrivacyAccepted] = useState(false); const [analytics, setAnalytics] = useState(false); const [document, setDocument] = useState<"terms" | "privacy" | null>(null);
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  function validateFields() { if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth) { setError("Complete your first name, last name and date of birth."); return false; } if (form.password.length < 8) { setError("Password must be at least 8 characters."); return false; } if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return false; } return true; }
  async function sendCode() { setError(""); if (!isValidEmail(form.email.trim())) { setError("Enter a valid email address, such as name@example.com."); return; } if (!validateFields()) return; setBusy(true); try { await request("/api/auth/email-code/request", { method: "POST", body: JSON.stringify({ email: form.email.trim() }) }); setSent(true); } catch (e) { setError(e instanceof Error ? e.message : "Could not send the verification code."); } finally { setBusy(false); } }
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (!validateFields()) return; if (!termsAccepted || !privacyAccepted) { setError("Read and explicitly accept both documents before creating your account."); return; } setBusy(true); try { await signUpEmail(form.email.trim(), form.password, { email_code: form.code, first_name: form.firstName.trim(), middle_name: form.middleName.trim() || undefined, last_name: form.lastName.trim(), date_of_birth: form.dateOfBirth, terms_version: TERMS_VERSION, privacy_version: PRIVACY_VERSION, analytics_consent: analytics }); if (form.schoolCode.trim()) { await request("/api/provisioning/students/affiliate", { method: "POST", body: JSON.stringify({ school_code: form.schoolCode.trim().toUpperCase() }) }).catch(() => undefined); } if (form.claimCode.trim()) { await request("/api/provisioning/students/claim", { method: "POST", body: JSON.stringify({ code: form.claimCode.trim().toUpperCase(), email: form.email.trim() }) }).catch(() => undefined); } go("/onboarding", true); } catch (e) { setError(e instanceof Error ? e.message : "Could not create your account."); } finally { setBusy(false); } }
  const requiredAccepted = termsAccepted && privacyAccepted;
  return <>
    <button className="back" onClick={onBack}>← Back</button>
    <div className="auth-header"><h2>Create your account</h2><p className="muted">Use one account to keep your guidance, saved choices and reports together.</p></div>
    <form onSubmit={submit} className="form">
      <div className="two-col">
        <label>First name<input autoComplete="given-name" value={form.firstName} onChange={update("firstName")} required /></label>
        <label>Last name<input autoComplete="family-name" value={form.lastName} onChange={update("lastName")} required /></label>
      </div>
      <label>Middle name <span className="field-optional">Optional</span><input autoComplete="additional-name" value={form.middleName} onChange={update("middleName")} /></label>
      <label>Date of birth<input type="date" autoComplete="bday" min="1900-01-01" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={update("dateOfBirth")} required /><small className="field-hint">Used for account safety and age-appropriate guidance.</small></label>
      <PasswordField label="Password" autoComplete="new-password" minLength={8} value={form.password} onChange={update("password")} hint="At least 8 characters." />
      <PasswordField label="Confirm password" autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={update("confirmPassword")} />
      <label>School code <span className="field-optional">Optional</span><input autoComplete="off" value={form.schoolCode} onChange={update("schoolCode")} placeholder="SCHOOL-XXXXXXXX" /><small className="field-hint">Use a code shared by your school to link your account.</small></label>
      <label>Student claim code <span className="field-optional">Optional</span><input autoComplete="off" value={form.claimCode} onChange={update("claimCode")} placeholder="SCHOOL-SS1-XXXXXXXX" /><small className="field-hint">Use this if your school created an account for you.</small></label>
      <div className={`legal-box${requiredAccepted ? " is-accepted" : ""}`}>
        <p className="legal-heading">Review before creating your account</p>
        <div className="consent-status" aria-live="polite"><span className={`consent-check ${requiredAccepted ? "is-accepted" : ""}`} aria-hidden="true">{requiredAccepted ? "✓" : ""}</span><span>{requiredAccepted ? "Terms & Conditions and Privacy Policy accepted" : "Both documents must be read and explicitly accepted"}</span></div>
        <div className="legal-actions"><button type="button" className="secondary" onClick={() => setDocument("terms")}>{termsAccepted ? "Terms accepted" : "Read and accept Terms"}</button><button type="button" className="secondary" onClick={() => setDocument("privacy")}>{privacyAccepted ? "Privacy accepted" : "Read and accept Privacy"}</button></div>
        {requiredAccepted && <><p className="analytics-explanation">Optional analytics helps us see which screens are useful and where people get stuck. It records anonymous product-usage events, not your password, email content, private report content, or school records. You can leave it off and change this choice later in Settings.</p><label className="check-row"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Share anonymous usage analytics (optional)</label></>}
      </div>
      <label>Email<input type="email" autoComplete="email" value={form.email} onChange={update("email")} required /></label>
      {sent && <label>Email verification code<input inputMode="numeric" autoComplete="one-time-code" value={form.code} onChange={update("code")} required /><small className="field-hint">Enter the code sent to your email.</small></label>}
      <div className="action-row"><button type="button" className="secondary" onClick={sendCode} disabled={busy}>{sent ? "Send again" : "Send email code"}</button>{sent && <button className="primary" disabled={busy || !requiredAccepted}>{busy ? "Creating…" : "Create account"}</button>}</div>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    <p className="switch">Already have an account? <button className="inline-button" onClick={onLogin}>Log in</button></p>
    {document && <LegalDialog kind={document} onClose={() => setDocument(null)} onAccept={() => { if (document === "terms") { setTermsAccepted(true); setDocument("privacy"); } else { setPrivacyAccepted(true); setDocument(null); } }} />}
  </>;
}

function LegalDialog({ kind, onClose, onAccept }: { kind: "terms" | "privacy"; onClose: () => void; onAccept: () => void }) {
  const [atEnd, setAtEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sections = kind === "terms" ? TERMS_SECTIONS : privacySections("Sifter LevelUp", "");
  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      element.scrollTop = 0;
      setAtEnd(element.scrollHeight <= element.clientHeight + 8);
    }
  }, [kind, sections.length]);
  return <div className="modal-backdrop" role="presentation"><section className="legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-title"><div className="modal-head"><h3 id="legal-title">{kind === "terms" ? "Terms & Conditions" : "Privacy Policy"}</h3><button className="text-button" onClick={onClose}>Close</button></div><div ref={scrollRef} className="legal-scroll" onScroll={(event) => { const element = event.currentTarget; setAtEnd(element.scrollTop + element.clientHeight >= element.scrollHeight - 8); }}>{sections.map(([title, body]) => <section key={title}><h4>{title}</h4><p>{body}</p></section>)}<p>Document version: {kind === "terms" ? TERMS_VERSION : PRIVACY_VERSION}</p><p>Reaching the end only enables the acceptance button; it does not accept the document for you.</p></div><button className="primary" disabled={!atEnd} onClick={onAccept}>{atEnd ? `I have read and accept the ${kind === "terms" ? "Terms & Conditions" : "Privacy Policy"}` : "Scroll to read the document"}</button></section></div>;
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function sendCode(event?: FormEvent) {
    event?.preventDefault(); setError(""); setMessage("");
    const normalized = email.trim();
    if (!isValidEmail(normalized)) { setError("Enter a valid email address, such as name@example.com."); return; }
    setBusy(true);
    try { await API.requestPasswordResetCode(normalized); setSent(true); setMessage("If an account matches that email, a reset code has been sent. Check your inbox and spam folder."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not request a reset code."); }
    finally { setBusy(false); }
  }

  async function reset(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!code.trim()) { setError("Enter the reset code."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try { await API.confirmPasswordReset(email.trim(), code.trim(), password); setMessage("Your password has been changed. You can now log in."); setSent(false); setCode(""); setPassword(""); setConfirmPassword(""); }
    catch (e) { const text = e instanceof Error ? e.message : ""; setError(/invalid reset code/i.test(text) ? "That reset code is not correct. Check it and try again." : text || "Could not reset your password."); }
    finally { setBusy(false); }
  }

  return <><button className="back" onClick={onBack}>← Back to log in</button><div className="auth-header"><h2>Reset your password</h2><p className="muted">Request a reset code, then choose a new password. We will not reveal whether an email is registered.</p></div>{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}<form onSubmit={sent ? reset : sendCode} className="form"><label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>{sent && <><label>Reset code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} required /></label><PasswordField label="New password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 6 characters." /><PasswordField label="Confirm new password" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></>}<button className="primary" disabled={busy}>{busy ? (sent ? "Saving…" : "Sending…") : sent ? "Set new password" : "Send reset code"}</button></form>{sent && <button className="link-button recovery-resend" onClick={() => void sendCode()} disabled={busy}>Send another code</button>}<p className="switch">Remembered it? <button className="inline-button" onClick={onBack}>Log in</button></p></>;
}

type GlobalSearchKind = "programme" | "university" | "domain" | "subgroup" | "role" | "skill" | "tool" | "certification" | "opportunity";
type GlobalSearchRow = { id: string; title: string; subtitle?: string; kind: GlobalSearchKind; domainId?: string };
type GlobalSearchGroup = { label: string; rows: GlobalSearchRow[] };

const GLOBAL_SEARCH_INTENTS: Array<{ value: SearchIntent; label: string; description: string }> = [
  { value: "programme_guidance", label: "Find a programme", description: "Programme names open Admission Intelligence, where you can compare universities with that programme." },
  { value: "university_requirements", label: "Check a university", description: "University results open its programme list and any available requirements." },
  { value: "career_exploration", label: "Explore career paths", description: "Career results show the domain, subgroup and role routes connected to your search." },
  { value: "skills_and_tools", label: "Find skills and tools", description: "See catalogue skills, tools and credentials, then open their connected domain." },
  { value: "opportunities", label: "Find opportunities", description: "Search the opportunities catalogue; availability depends on published source data." },
];

function globalSearchGroups(result: CareerSearchResult | null, intent: SearchIntent | null): GlobalSearchGroup[] {
  if (!result) return [];
  const groups: GlobalSearchGroup[] = [];
  const add = (label: string, rows: GlobalSearchRow[], allowed: SearchIntent[]) => {
    if ((!intent || allowed.includes(intent)) && rows.length) groups.push({ label, rows: rows.slice(0, 4) });
  };
  add("Programmes", (result.programmes ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.discipline ?? "Programme catalogue", kind: "programme" })), ["programme_guidance"]);
  add("Universities", (result.universities ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: [item.city, item.state].filter(Boolean).join(", ") || "University", kind: "university" })), ["university_requirements"]);
  add("Domains", (result.domains ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.cluster ?? "Career domain", kind: "domain" })), ["career_exploration"]);
  add("Subgroups", (result.subgroups ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.domainName ? `In ${item.domainName}` : "Subgroup", kind: "subgroup", domainId: item.domainId })), ["career_exploration"]);
  add("Roles", (result.roles ?? []).flatMap((item) => (item.domains ?? []).map((domain) => ({ id: domain.roleKey, title: item.name, subtitle: domain.domainName, kind: "role" as const }))), ["career_exploration"]);
  add("Skills", (result.skills ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.domainName ? `Used in ${item.domainName}` : "Career skill", kind: "skill", domainId: item.domainId })), ["skills_and_tools"]);
  add("Tools", (result.tools ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.domainName ? `Used in ${item.domainName}` : "Career tool", kind: "tool", domainId: item.domainId })), ["skills_and_tools"]);
  add("Credentials", (result.certifications ?? []).map((item) => ({ id: item.id, title: item.name, subtitle: item.domainName ? `Relevant to ${item.domainName}` : "Career credential", kind: "certification", domainId: item.domainId })), ["skills_and_tools"]);
  add("Opportunities", (result.opportunities ?? []).map((item) => ({ id: item.id, title: item.title, subtitle: [item.type, item.scope].filter(Boolean).join(" · ") || "Opportunity", kind: "opportunity" })), ["opportunities"]);
  return groups;
}

function GlobalSearchDropdown({
  query,
  intent,
  onIntentChange,
  loading,
  result,
  onSelect,
  onClose,
}: {
  query: string;
  intent: SearchIntent | null;
  onIntentChange: (intent: SearchIntent | null) => void;
  loading: boolean;
  result: CareerSearchResult | null;
  onSelect: (row: GlobalSearchRow) => void;
  onClose: () => void;
}) {
  const groups = globalSearchGroups(result, intent);
  const hasQuery = query.trim().length >= 2;
  return <div className="global-search-dropdown" role="region" aria-label="Search suggestions" onMouseDown={(event) => event.preventDefault()}>
    <div className="global-search-context">
      <span className="global-search-label">Search context</span>
      <button className={!intent ? "active" : ""} onClick={() => onIntentChange(null)}>Everything</button>
      {GLOBAL_SEARCH_INTENTS.map((option) => <button key={option.value} className={intent === option.value ? "active" : ""} onClick={() => onIntentChange(option.value)}>{option.label}</button>)}
    </div>
    {intent ? <p className="global-search-guidance">{GLOBAL_SEARCH_INTENTS.find((option) => option.value === intent)?.description}</p> : result?.searchContext?.guidance ? <p className="global-search-guidance">{result.searchContext.guidance}</p> : null}
    {!hasQuery ? <p className="global-search-hint">Type at least two characters. Results are grouped so “nursing” can be distinguished as a programme, university, domain, role or skill.</p> : null}
    {loading ? <p className="global-search-hint">Searching the current catalogue…</p> : null}
    {!loading && hasQuery && !groups.length ? <p className="global-search-hint">No matching catalogue items yet. For UTME/O-level matching and university programme details, open Admission Intelligence in Explore.</p> : null}
    {!loading && groups.map((group) => <section key={group.label} className="global-search-group"><h3>{group.label}</h3>{group.rows.map((row) => <button key={`${row.kind}-${row.id}`} className="global-search-result" onClick={() => onSelect(row)}><span><strong>{row.title}</strong><small>{row.subtitle}</small></span><em>{row.kind === "programme" ? "Open admission flow" : row.kind === "university" ? "View programmes" : "Open guidance"}</em></button>)}</section>)}
    <button className="global-search-close" onClick={onClose}>Close search</button>
  </div>;
}

function AuthenticatedWebApp({ user, path }: { user: WebUser; path: string }) {
  const { signOut } = useAuth();
  const query = new URLSearchParams(window.location.search);
  const focusedGuidance = query.get("focus") === "guidance"
    || query.get("guided") === "1"
    || query.get("journey") === "guided_subject_discovery"
    || query.get("journey_mode") === "guided_subject_discovery";
  const guidanceEntry = query.get("guidance_entry");
  const [adminProfile, setAdminProfile] = useState<EducatorProfile | null>(null);
  useEffect(() => {
    if (!path.startsWith("/admin")) return;
    let active = true;
    getEducatorProfile(user.id).then((profile) => {
      if (active) setAdminProfile(profile);
    }).catch(() => {
      if (active) setAdminProfile(null);
    });
    return () => { active = false; };
  }, [path, user.id]);
  const route = path.startsWith("/admin/explore")
    ? path.replace(/^\/admin\/explore/, "/explore")
    : path.startsWith("/admin/workspace-explore")
      ? path.replace(/^\/admin\/workspace-explore/, "/explore")
      : path;
  const isAdminExplore = path.startsWith("/admin/explore") || path.startsWith("/admin/workspace-explore");
  const isAdminRoute = path.startsWith("/admin");
  const isRootPlatformRoute = path === "/" || path === "/home" || path === "/explore" || path === "/opportunities" || path === "/myworld" || path === "/profile";
  // These detail screens render their own contextual back link (DetailScaffold:
  // "Back to programme", "Back to student guidance", ...), so the shell's generic
  // Back would show a second one. Focused guidance keeps the shell's "Exit guidance".
  const routeHasOwnBack = !focusedGuidance && (
    /^\/explore\/(programme|role)\/[^/]+/.test(route)
    || /^\/explore\/domain\/[^/]+(\/subgroup\/[^/]+)?$/.test(route)
    || /^\/opportunities\/(opportunity|organisation)\//.test(path)
    || path === "/opportunities/scholarships"
  );
  const showPlatformBack = !isAdminRoute && !routeHasOwnBack && (focusedGuidance || !isRootPlatformRoute);

  function content() {
    if (route === "/" || route === "/home") return <CareerHomeScreen />;
    if (route === "/onboarding") return <Suspense fallback={<RouteLoading />}><AccountTypeGate /></Suspense>;
    if (route === "/explore") return <ExploreScreen initialQuery={query.get("q") ?? ""} adminAudience={path.startsWith("/admin") ? adminAudienceForProfile(adminProfile) : undefined} adminType={path.startsWith("/admin") ? adminProfile?.organizationType : undefined} />;
    if (route === "/explore/admission") return <AdmissionBrowseScreen />;
    const legacyAdmission = route.match(/^\/explore\/admission\/([^/]+)$/)?.[1];
    if (legacyAdmission) return <LegacyAdmissionRedirect jambName={decodeURIComponent(legacyAdmission)} admin={path.startsWith("/admin/")} />;
    if (route === "/explore/domains") return <DomainExplorerScreen />;
    if (route === "/explore/compare") return <ProgrammeCompareScreen />;
    if (route === "/explore/pathways") return <PathwaysHubScreen />;
    if (route === "/explore/pathways/entrepreneurship") return <EntrepreneurshipPathwayScreen />;
    if (route === "/explore/pathways/career-change") return <CareerChangerScreen />;
    if (route === "/explore/pathways/upgrades") return <QualificationUpgradesScreen />;
    if (route === "/explore/pathways/credentials") return <CharteredCredentialsScreen />;
    if (route === "/explore/pathways/phd") return <PhdPathwayScreen />;
    if (route === "/explore/elite") return <ElitePathwaysHubScreen />;
    if (route.startsWith("/explore/elite/")) return <ElitePathwayDetailScreen />;
    const programme = route.match(/^\/explore\/programme\/([^/]+)/)?.[1];
    if (programme) return <ProgrammeDetailRefinedScreen programmeId={decodeURIComponent(programme)} jambProgrammeId={query.get("jamb_programme_id") ?? undefined} initialSchoolId={query.get("school_id") ?? undefined} userType={query.get("user_type") ?? undefined} guidanceStudentId={query.get("guidance_student_id") ?? undefined} guidanceTarget={query.get("guidance_target") ?? undefined} guidanceEntry={guidanceEntry ?? undefined} viewOnly={query.get("view_only") === "1"} journeyMode={query.get("journey_mode") ?? undefined} />;
    const domain = route.match(/^\/explore\/domain\/([^/]+)$/)?.[1];
    if (domain) return <DomainDetailScreen domainId={decodeURIComponent(domain)} />;
    const subgroup = route.match(/^\/explore\/domain\/([^/]+)\/subgroup\/([^/]+)$/);
    if (subgroup) return <SubgroupDetailScreen />;
    const role = route.match(/^\/explore\/role\/([^/]+)$/)?.[1];
    if (role) return <RoleDetailScreen roleId={decodeURIComponent(role)} />;
    if (path.startsWith("/opportunities/opportunity/")) return <OpportunityDetailScreen />;
    if (path.startsWith("/opportunities/organisation/")) return <OrganisationProfileScreen />;
    if (path === "/opportunities/scholarships") return <ScholarshipsScreen />;
    if (path === "/opportunities/windows") return <ApplicationWindowsScreen />;
    if (path === "/opportunities") return <OpportunitiesScreen />;
    if (path === "/portfolio/hub") return <PortfolioHubScreen />;
    if (path === "/portfolio") return <PortfolioScreen />;
    if (path === "/profile/diary") return <DiaryScreen />;
    if (path === "/profile/github") return <GitHubScreen />;
    if (path === "/feed") return <FeedScreen />;
    if (path === "/guild") return <GuildScreen />;
    if (path === "/leaderboard") return <LeaderboardScreen />;
    if (path === "/fields") return <FieldsScreen />;
    if (path === "/skills/quant-map") return <QuantMapScreen />;
    if (path === "/skills/interview") return <InterviewModeScreen />;
    if (path === "/skills/lesson") return <DisabledLearningScreen area="Lessons" />;
    if (path === "/skills") return <SkillsScreen />;
    if (path === "/streaks") return <StreaksScreen />;
    if (path === "/referral") return <ReferralScreen />;
    if (path === "/settings/my-school") return <MySchoolScreen />;
    if (path === "/world") return <WorldScreen />;
    if (path === "/track-room") return <TrackRoomScreen />;
    if (path === "/map/island") return <IslandMapScreen />;
    if (path === "/map/lesson") return <LessonScreen />;
    if (path === "/map") return <WorldScreen />;
    if (path === "/ecosystem-track") return <EcosystemTrackScreen />;
    if (path === "/starknet-track") return <StarknetTrackScreen />;
    if (path === "/cairo-builder-track") return <CairoBuilderTrackScreen />;
    if (path === "/myworld") return <MyWorldScreen />;
    if (path === "/myworld/game-profile") return <DisabledLearningScreen area="Learning progress and game profile" />;
    if (path === "/profile") return <ProfileScreen />;
    if (path === "/settings") return <SettingsScreen />;
    if (path === "/admin" || path === "/admin/dashboard") return <Suspense fallback={<RouteLoading />}><AdminDashboardScreen /></Suspense>;
    if (path === "/admin/guidance") return <Suspense fallback={<RouteLoading />}><AdminGuidanceScreen /></Suspense>;
    if (path === "/admin/guidance-start") return <Suspense fallback={<RouteLoading />}><AdminGuidanceStartScreen /></Suspense>;
    if (path === "/admin/students") return <Suspense fallback={<RouteLoading />}><AdminStudentsScreen /></Suspense>;
    if (/^\/admin\/students\/[^/]+\/guidance$/.test(path)) return <Suspense fallback={<RouteLoading />}><AdminStudentGuidanceRoute /></Suspense>;
    if (path === "/admin/verify") return <Suspense fallback={<RouteLoading />}><AdminVerifyScreen /></Suspense>;
    if (path === "/admin/skills-gap") return <Suspense fallback={<RouteLoading />}><AdminSkillsGapScreen /></Suspense>;
    if (path === "/admin/market-intelligence") return <Suspense fallback={<RouteLoading />}><AdminMarketScreen /></Suspense>;
    if (path === "/admin/peers") return <Suspense fallback={<RouteLoading />}><AdminPeersScreen /></Suspense>;
    if (path === "/admin/domain-reach") return <Suspense fallback={<RouteLoading />}><AdminDomainReachScreen /></Suspense>;
    if (path === "/admin/expert-dossier") return <Suspense fallback={<RouteLoading />}><AdminExpertDossierScreen /></Suspense>;
    if (path === "/admin/feedback") return <Suspense fallback={<RouteLoading />}><AdminFeedbackScreen /></Suspense>;
    if (path === "/admin/affiliation") return <Suspense fallback={<RouteLoading />}><AdminAffiliationScreen /></Suspense>;
    if (path === "/admin/session") return <Suspense fallback={<RouteLoading />}><AdminSessionScreen /></Suspense>;
    if (path === "/admin/workspace-profile") return <Suspense fallback={<RouteLoading />}><AdminProfileScreen /></Suspense>;
    return <NotFound path={path} />;
  }

  const [globalQuery, setGlobalQuery] = useState(query.get("q") ?? "");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIntent, setSearchIntent] = useState<SearchIntent | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPayload, setSearchPayload] = useState<CareerSearchResult | null>(null);
  const searchGeneration = useRef(0);
  const searchShellRef = useRef<HTMLDivElement | null>(null);
  const searchUserType = user.account_type === "student" ? "student" : undefined;

  useEffect(() => {
    setGlobalQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [path]);

  useEffect(() => {
    const openGlobalSearch = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string") setGlobalQuery(detail);
      setSearchOpen(true);
    };
    window.addEventListener("sifter:open-global-search", openGlobalSearch);
    return () => window.removeEventListener("sifter:open-global-search", openGlobalSearch);
  }, []);

  useEffect(() => {
    const term = globalQuery.trim();
    if (!searchOpen || term.length < 2) {
      setSearchPayload(null);
      setSearchLoading(false);
      return;
    }
    const generation = ++searchGeneration.current;
    setSearchLoading(true);
    const timer = window.setTimeout(() => {
      void careerData.searchCareer(term, searchIntent ?? undefined, searchUserType, null)
        .then((result) => {
          if (generation !== searchGeneration.current) return;
          setSearchPayload(result.status === "real" ? result.data ?? null : null);
        })
        .catch(() => {
          if (generation === searchGeneration.current) setSearchPayload(null);
        })
        .finally(() => {
          if (generation === searchGeneration.current) setSearchLoading(false);
        });
    }, 240);
    return () => window.clearTimeout(timer);
  }, [globalQuery, searchIntent, searchOpen, searchUserType]);

  useEffect(() => {
    if (!searchOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !searchShellRef.current?.contains(target)) setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [searchOpen]);

  const submitGlobalSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = globalQuery.trim();
    setSearchOpen(false);
    go(value ? `/explore?q=${encodeURIComponent(value)}` : "/explore");
  };

  const openSearchResult = (row: GlobalSearchRow) => {
    setSearchOpen(false);
    if (row.kind === "programme") {
      go(`/explore/admission?mode=programme&q=${encodeURIComponent(row.title)}`);
    } else if (row.kind === "university") {
      go(`/explore/admission?mode=school&school_id=${encodeURIComponent(row.id)}`);
    } else if (row.kind === "domain") {
      go(`/explore/domain/${encodeURIComponent(row.id)}`);
    } else if (row.kind === "subgroup" && row.domainId) {
      go(`/explore/domain/${encodeURIComponent(row.domainId)}/subgroup/${encodeURIComponent(row.id)}`);
    } else if (row.kind === "role") {
      go(`/explore/role/${encodeURIComponent(row.id)}`);
    } else if (row.kind === "opportunity") {
      go(`/opportunities/opportunity/${encodeURIComponent(row.id)}`);
    } else if (row.domainId) {
      go(`/explore/domain/${encodeURIComponent(row.domainId)}`);
    }
  };

  if (isAdminExplore) {
    return (
      <AdminShell title="Explore programmes and domains">
        <ExploreBaseProvider base={ADMIN_EXPLORE_BASE}>
          <div className="admin-web-content">
            <Suspense fallback={<RouteLoading />}>{content()}</Suspense>
          </div>
        </ExploreBaseProvider>
      </AdminShell>
    );
  }

  // Every native admin screen owns an AdminShell. Do not wrap it in the
  // student platform shell on Vite: that produced two competing navigation
  // systems and made browser admin pages look like student pages.
  if (isAdminRoute) {
    return <Suspense fallback={<RouteLoading />}>{content()}</Suspense>;
  }

  return <main className={`platform-shell${focusedGuidance ? " is-guidance-workspace" : ""}`}>
    {!focusedGuidance ? <aside className="platform-sidebar">
      <a className="brand" href="/home" onClick={(event) => { event.preventDefault(); go("/home"); }} aria-label="LevelUp home">
        <LevelUpWebWordmark variant="light" width={188} height={50} />
      </a>
      <nav className="platform-nav" aria-label="Main navigation">
        <a href="/home" onClick={(e) => { e.preventDefault(); go("/home"); }}>Home</a>
        <a href="/explore" onClick={(e) => { e.preventDefault(); go("/explore"); }}>Explore</a>
        <a href="/opportunities" onClick={(e) => { e.preventDefault(); go("/opportunities"); }}>Opportunities</a>
        <a href="/myworld" onClick={(e) => { e.preventDefault(); go("/myworld"); }}>My World</a>
        <a href="/profile" onClick={(e) => { e.preventDefault(); go("/profile"); }}>Profile</a>
      </nav>
      <div className="platform-sidebar-account"><span>{user.username || user.email || "Account"}</span><button className="text-button" onClick={() => { void signOut().then(() => go("/", true)); }}>Sign out</button></div>
    </aside> : null}
    <section className="platform-main">
      <header className="platform-toolbar">
        {showPlatformBack ? <button className="platform-back" onClick={() => {
          // Focused guidance is a task workspace entered from Home. If an
          // older saved link has no explicit entry path, its safe destination
          // is still Home—not the transient admission picker or Explore hub.
          if (focusedGuidance) go(guidanceEntry?.startsWith("/") ? guidanceEntry : "/home", true);
          else platformBack(path);
        }} aria-label="Go back">← {focusedGuidance ? "Exit guidance" : "Back"}</button> : null}
        {focusedGuidance ? <div className="platform-guidance-title"><span className="platform-guidance-brand platform-guidance-brand-full"><LevelUpWebWordmark variant="light" width={126} height={34} /></span><span className="platform-guidance-brand platform-guidance-brand-compact"><LevelUpWebWordmark variant="light" width={34} height={34} compact /></span><span>Focused guidance workspace</span><strong>Follow your selected path</strong></div> : <div className="global-search-shell" ref={searchShellRef}>
        <form className="global-search" onSubmit={submitGlobalSearch} role="search">
          <span aria-hidden="true" style={{ display: "inline-flex" }}><Search size={16} strokeWidth={2} /></span>
          <input value={globalQuery} onFocus={() => setSearchOpen(true)} onChange={(event) => { setGlobalQuery(event.target.value); setSearchOpen(true); }} placeholder="Search programmes, universities, domains, roles or skills" aria-label="Search Sifter" />
          <button type="submit">Search</button>
        </form>
        {searchOpen ? <GlobalSearchDropdown query={globalQuery} intent={searchIntent} onIntentChange={setSearchIntent} loading={searchLoading} result={searchPayload} onSelect={openSearchResult} onClose={() => setSearchOpen(false)} /> : null}
        </div>}
      </header>
      <div className="platform-content"><Suspense fallback={<RouteLoading />}>{content()}</Suspense></div>
    </section>
  </main>;
}

function PersonaChooser({ onChoose }: { onChoose: (value: string) => void }) {
  const choices = [{ value: "senior_secondary", label: "SS1 or SS2 student", body: "Explore from your class, stream and subjects." }, { value: "ss3_secondary", label: "SS3 student", body: "Prepare for the next programme and university decision." }, { value: "jamb", label: "JAMB candidate", body: "Match UTME and O-level choices to programmes." }, { value: "student", label: "Current undergraduate", body: "Connect your current programme to domains and roles." }];
  return <section className="web-panel onboarding-panel"><p className="eyebrow">Set up your guidance</p><h1>Where are you starting from?</h1><p className="muted">This changes the questions and results you see. You can return and change it later.</p><div className="persona-grid">{choices.map((choice) => <button className="persona-card" key={choice.value} onClick={() => onChoose(choice.value)}><strong>{choice.label}</strong><span>{choice.body}</span><b>Continue →</b></button>)}</div></section>;
}

function RouteLoading() { return <div className="web-panel"><p className="muted">Loading Sifter LevelUp…</p></div>; }
function LegacyAdmissionRedirect({ jambName, admin }: { jambName: string; admin?: boolean }) {
  useEffect(() => {
    const next = new URLSearchParams(window.location.search);
    next.set("mode", "programme");
    next.set("q", jambName);
    if (admin) next.set("admin", "1");
    go(`/explore/admission?${next.toString()}`, true);
  }, [admin, jambName]);
  return <RouteLoading />;
}
function NotFound({ path }: { path: string }) { return <section className="web-panel"><p className="eyebrow">Web route</p><h1>This route is not available yet.</h1><p className="muted">{path}</p><button className="primary" onClick={() => go("/home")}>Return home</button></section>; }
