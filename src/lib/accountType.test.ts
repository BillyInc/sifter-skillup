import { needsLegacyTypeSelection } from "./accountType";

describe("needsLegacyTypeSelection", () => {
  it("reopens the gate for a completed legacy student-default account", () => {
    expect(
      needsLegacyTypeSelection({
        auth_provider: "email",
        onboarding_completed: true,
        account_type: "student",
        account_type_selected_at: null,
      }),
    ).toBe(true);
  });

  it("does not reopen the gate after an explicit student choice", () => {
    expect(
      needsLegacyTypeSelection({
        auth_provider: "email",
        onboarding_completed: true,
        account_type: "student",
        account_type_selected_at: "2026-08-13T10:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("does not affect incomplete, guest, or admin accounts", () => {
    expect(
      needsLegacyTypeSelection({
        auth_provider: "email",
        onboarding_completed: false,
        account_type: "pending",
      }),
    ).toBe(false);
    expect(
      needsLegacyTypeSelection({
        auth_provider: "guest",
        onboarding_completed: true,
        account_type: "student",
      }),
    ).toBe(false);
    expect(
      needsLegacyTypeSelection({
        auth_provider: "email",
        onboarding_completed: true,
        account_type: "institution_admin",
      }),
    ).toBe(false);
  });
});
