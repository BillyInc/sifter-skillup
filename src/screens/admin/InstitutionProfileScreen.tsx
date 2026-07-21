/**
 * InstitutionProfileScreen — organisation profile + team access.
 *
 * Product decision: the normal Profile tab is a person/account profile. This
 * admin screen is the organisation profile and seat-management surface. Multiple
 * officials from the same school/university/tutorial centre join the same
 * dashboard through institution_members, not by sharing one login.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  webContainer,
} from "../../theme";
import { adminData } from "../../lib/adminData";
import { getEducatorProfile } from "../../lib/educatorProfile";
import type { DataState } from "../../types/career";
import type {
  EducatorProfile,
  OrgRole,
  OrganizationTeam,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { SectionLabel } from "../../components/careerIntelligence";

const ROLE_OPTIONS: { value: OrgRole; label: string; body: string }[] = [
  {
    value: "institution_admin",
    label: "Admin",
    body: "Manage profile, verification, team seats and intelligence access.",
  },
  {
    value: "counsellor",
    label: "Counsellor",
    body: "Use guidance intelligence and student-consent workflows.",
  },
  {
    value: "provisioning_manager",
    label: "Provisioning manager",
    body: "Create student claim codes and manage consent-gated rosters.",
  },
  {
    value: "data_viewer",
    label: "Viewer",
    body: "Read aggregate dashboards without changing settings.",
  },
];

export function InstitutionProfileScreen() {
  const { colors } = useTheme();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [team, setTeam] = useState<DataState<OrganizationTeam>>({
    status: "pending",
    data: null,
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("counsellor");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getEducatorProfile(), adminData.getOrganizationTeam()]).then(
      ([p, t]) => {
        if (!active) return;
        setProfile(p);
        setTeam(t);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const canInvite = team.status === "real" ? Boolean(team.data?.canInvite) : false;
  const orgName =
    team.status === "real" && team.data?.organization?.name
      ? team.data.organization.name
      : profile?.organizationName || "Organisation profile";
  const orgType = profile?.organizationType?.replace(/_/g, " ") || "Not set";
  const verification = profile?.verificationStatus || "unverified";
  const memberCount = team.status === "real" ? team.data?.members.length ?? 0 : 0;
  const pendingInviteCount =
    team.status === "real"
      ? team.data?.invites.filter((i) => i.status === "pending").length ?? 0
      : 0;

  const selectedRole = useMemo(
    () => ROLE_OPTIONS.find((r) => r.value === role) ?? ROLE_OPTIONS[1],
    [role],
  );

  const invite = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    const res = await adminData.inviteOrganizationMember({
      invitedEmail: cleanEmail,
      role,
    });
    setSubmitting(false);
    if (res.status === "real") {
      setEmail("");
      setFeedback("Invitation created. The official can accept it with their own account.");
      const refreshed = await adminData.getOrganizationTeam();
      setTeam(refreshed);
    } else {
      setFeedback(
        res.meta?.notice ??
          "Team invitations will activate after organisation verification is online.",
      );
    }
  };

  return (
    <AdminShell title="Profile + team" eyebrow="Organisation workspace">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.surface.base }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.textRole.muted }]}>
              ORGANISATION
            </Text>
            <Text style={[styles.title, { color: colors.textRole.primary }]}>{orgName}</Text>
            <View style={styles.statusLine}>
              <Text style={[styles.lede, { color: colors.textRole.secondary }]}>
                {orgType}
              </Text>
              <VerificationBadge status={verification} />
            </View>
          </View>
          <View style={styles.stats}>
            <Stat label="Members" value={String(memberCount)} />
            <Stat label="Pending" value={String(pendingInviteCount)} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel>Access model</SectionLabel>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>
            One school, university or tutorial centre can have multiple
            officials. The owner or verified admin invites each person by email,
            assigns a role, and that person signs in with their own account.
            Access is scoped through the shared organisation membership.
          </Text>
        </View>

        <View style={styles.grid}>
          <View
            style={[
              styles.panel,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            <SectionLabel>Team members</SectionLabel>
            <ComingSoonPanel state={team}>
              {(data) => (
                <View style={styles.rows}>
                  {data.members.length ? (
                    data.members.map((m) => (
                      <TeamRow
                        key={m.id}
                        primary={m.displayName || m.email || m.userId}
                        secondary={`${roleLabel(m.role)} · ${m.seatStatus}`}
                      />
                    ))
                  ) : (
                    <Text style={[styles.empty, { color: colors.textRole.muted }]}>
                      No member seats have been returned yet.
                    </Text>
                  )}
                </View>
              )}
            </ComingSoonPanel>
          </View>

          <View
            style={[
              styles.panel,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            <SectionLabel>Invite an official</SectionLabel>
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>
              {canInvite
                ? "Invite another official into this same workspace."
                : "Invites unlock for verified owners/admins. Until then, this explains the workflow."}
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              editable={canInvite && !submitting}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="official@school.edu.ng"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
              {
                  color: colors.textRole.primary,
                  borderColor: colors.borderRole.subtle,
                  backgroundColor: colors.surface.raised,
                },
              ]}
            />

            <View style={styles.roleList}>
              {ROLE_OPTIONS.map((option) => {
                const active = option.value === role;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setRole(option.value)}
                    activeOpacity={0.8}
                    style={[
                      styles.roleOption,
                      {
                        borderColor: active ? colors.borderRole.strong : colors.borderRole.subtle,
                        backgroundColor: active ? colors.surface.subtle : colors.surface.raised,
                      },
                    ]}
                  >
                    <Text style={[styles.roleLabel, { color: colors.textRole.primary }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.roleBody, { color: colors.textRole.secondary }]}>
                      {option.body}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={invite}
              activeOpacity={0.85}
              disabled={!canInvite || !email.trim() || submitting}
              style={[
                styles.cta,
                {
                  backgroundColor:
                    canInvite && email.trim() ? colors.surface.inverse : colors.surface.subtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.ctaText,
                  { color: canInvite && email.trim() ? colors.textRole.inverse : colors.textRole.muted },
                ]}
              >
                {submitting ? "Creating invite..." : `Invite as ${selectedRole.label}`}
              </Text>
            </TouchableOpacity>

            {feedback ? (
              <Text style={[styles.feedback, { color: colors.textRole.muted }]}>
                {feedback}
              </Text>
            ) : null}
          </View>
        </View>

        {team.status === "real" && team.data?.invites.length ? (
          <View style={styles.section}>
            <SectionLabel>Pending invitations</SectionLabel>
            <View style={styles.rows}>
              {team.data.invites.map((invite) => (
                <TeamRow
                  key={invite.id}
                  primary={invite.invitedEmail}
                  secondary={`${roleLabel(invite.role)} · ${invite.status}`}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AdminShell>
  );
}

function roleLabel(role: OrgRole): string {
  return role.replace(/_/g, " ");
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface.subtle }]}>
      <Text style={[styles.statValue, { color: colors.textRole.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textRole.muted }]}>{label}</Text>
    </View>
  );
}

function TeamRow({ primary, secondary }: { primary: string; secondary: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.teamRow, { borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.teamPrimary, { color: colors.textRole.primary }]} numberOfLines={1}>
        {primary}
      </Text>
      <Text style={[styles.teamSecondary, { color: colors.textRole.muted }]}>
        {secondary}
      </Text>
    </View>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const { colors } = useTheme();
  const normalized = status.replace(/_/g, " ");
  const tone =
    status === "verified"
      ? { bg: colors.state.verifiedSoft, text: colors.state.verified }
      : status === "rejected"
        ? { bg: colors.dangerSoft, text: colors.danger }
        : status === "pending"
          ? { bg: colors.state.pendingSoft, text: colors.state.pending }
          : { bg: colors.state.lockedSoft, text: colors.state.locked };
  return (
    <View style={[styles.verifyBadge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.verifyBadgeText, { color: tone.text }]}>
        {normalized}
      </Text>
    </View>
  );
}

export default InstitutionProfileScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  hero: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  kicker: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.xs,
  },
  lede: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    textTransform: "capitalize",
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  verifyBadge: {
    minHeight: 22,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "capitalize",
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  stat: {
    minWidth: 92,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  section: { gap: Spacing.sm },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.lg },
  panel: {
    flex: 1,
    minWidth: 300,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  rows: { gap: Spacing.sm },
  empty: { fontSize: FontSize.sm },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    minHeight: 44,
  },
  roleList: { gap: Spacing.sm },
  roleOption: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 3,
  },
  roleLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  roleBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  cta: {
    minHeight: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
  },
  ctaText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  feedback: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  teamRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  teamPrimary: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  teamSecondary: {
    fontSize: FontSize.xs,
    textTransform: "capitalize",
    marginTop: 2,
  },
});
