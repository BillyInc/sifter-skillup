/**
 * The account-type gate — the first fork in onboarding, and the one the screen
 * itself describes as irreversible: "Continue to lock this guidance path."
 *
 * Everything downstream — which setup questions are asked, which requirements
 * are shown, which guidance the user ever sees — hangs off the persona chosen
 * here and off the draft written when Continue is pressed. A wrong persona in
 * that draft is not a visible bug; it is a user quietly sent down the wrong
 * journey. Nothing rendered this screen before this suite.
 *
 * The two destination flows are stubbed: what is under test is which one the
 * gate hands the user to and with what profile, not what those flows then do.
 */
import React from "react";
import { renderWithProviders, act, fireEvent, screen } from "../test-utils/render";

const mockParams: { restart?: string } = {};
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

// OnboardingBackGuard reaches for @react-navigation/native, which jest.setup.ts
// does not stub (it stubs expo-router's separate copy).
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ addListener: () => () => undefined, dispatch: jest.fn() }),
  useFocusEffect: () => undefined,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" }, signOut: jest.fn(), deleteAccount: jest.fn() }),
}));

const mockGetOnboardingDraft = jest.fn(async () => null as any);
const mockSaveOnboardingDraft = jest.fn(async () => undefined);
const mockClearOnboardingDraft = jest.fn(async () => undefined);
jest.mock("@/lib/onboardingDraft", () => ({
  getOnboardingDraft: (...a: unknown[]) => mockGetOnboardingDraft(...(a as [])),
  saveOnboardingDraft: (...a: unknown[]) => mockSaveOnboardingDraft(...(a as [])),
  clearOnboardingDraft: (...a: unknown[]) => mockClearOnboardingDraft(...(a as [])),
}));

// Record what each destination flow was handed, without dragging in its own
// API and provisioning stack.
const onboardingFlowProps: any[] = [];
jest.mock("@/screens/OnboardingFlow", () => ({
  __esModule: true,
  default: (props: any) => {
    const { Text } = require("react-native");
    const React = require("react");
    (global as any).__onboardingFlowProps.push(props);
    return React.createElement(Text, null, "STUDENT FLOW");
  },
}));
jest.mock("@/screens/admin/EducatorOnboarding", () => ({
  __esModule: true,
  default: () => {
    const { Text } = require("react-native");
    const React = require("react");
    return React.createElement(Text, null, "EDUCATOR FLOW");
  },
}));
(global as any).__onboardingFlowProps = onboardingFlowProps;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AccountTypeGate = require("../src/screens/onboarding/AccountTypeGate").default;

const renderGate = async () => {
  const view = renderWithProviders(<AccountTypeGate />);
  await act(async () => undefined); // let the draft read settle
  return view;
};

const openPicker = () => fireEvent.press(screen.getByText("Select your user type"));

/**
 * Reopen the picker after a choice: the selector no longer says "Select your
 * user type", it reads back the chosen persona's subtitle.
 */
const reopenPickerVia = (selectorSubtitle: string) =>
  fireEvent.press(screen.getByText(selectorSubtitle));

/**
 * The radio state of a persona option inside the picker. The persona's title
 * also appears in the selector once chosen, so match on the node whose
 * pressable ancestor actually declares a `checked` state.
 */
const radioState = (title: string): Record<string, unknown> | undefined => {
  for (const match of screen.getAllByText(title)) {
    let node: any = match;
    while (node && node.props?.accessibilityState === undefined) node = node.parent;
    if (node?.props?.accessibilityState?.checked !== undefined) return node.props.accessibilityState;
  }
  return undefined;
};

const accessibilityStateOf = (text: string | RegExp): Record<string, unknown> => {
  let node: any = screen.getByText(text);
  while (node && node.props?.accessibilityState === undefined) node = node.parent;
  return node?.props?.accessibilityState ?? {};
};

beforeEach(() => {
  jest.clearAllMocks();
  onboardingFlowProps.length = 0;
  delete mockParams.restart;
  mockGetOnboardingDraft.mockResolvedValue(null);
});

describe("AccountTypeGate", () => {
  it("asks for a starting point and commits to nothing yet", async () => {
    await renderGate();

    expect(screen.getByText("Choose your starting point")).toBeTruthy();
    expect(screen.getByText("Select your user type")).toBeTruthy();
    expect(accessibilityStateOf("Continue").disabled).toBe(true);
    // The lock warning is a consequence of having chosen; it must not appear
    // before there is anything to lock.
    expect(screen.queryByText(/Continue to lock this guidance path/)).toBeNull();
  });

  it("offers every persona the product supports, once", async () => {
    await renderGate();
    openPicker();

    [
      "SS1 Student",
      "SS2 Student",
      "SS3 Student",
      "JAMB Candidate",
      "Undergraduate Student",
      "Educator / Institution",
    ].forEach((title) => expect(screen.getByText(title)).toBeTruthy());
  });

  it("warns that the choice locks the path, once one is made", async () => {
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("JAMB Candidate"));

    expect(
      screen.getByText(
        "Continue to lock this guidance path. You can only choose a different path by returning here and starting that path again.",
      ),
    ).toBeTruthy();
    expect(accessibilityStateOf("Continue").disabled).toBe(false);
  });

  it("closes the picker and shows the chosen persona in the selector", async () => {
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("Undergraduate Student"));

    // The modal is gone: its heading is no longer on screen…
    expect(screen.queryByText("Choose your path")).toBeNull();
    // …and the selector now reads back the choice and its consequence.
    expect(screen.getByText("Undergraduate Student")).toBeTruthy();
    expect(screen.getByText("Start from your university and programme")).toBeTruthy();
  });

  it("marks exactly the chosen option as selected for a screen reader", async () => {
    // Which option is chosen was otherwise conveyed only by a border colour and
    // an icon swap — invisible to assistive tech.
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("SS2 Student"));
    reopenPickerVia("Narrow subjects before SS3 and UTME decisions");

    expect(radioState("SS2 Student")?.checked).toBe(true);
    expect(radioState("SS1 Student")?.checked).toBe(false);
  });

  it("does not advance while no persona is chosen", async () => {
    await renderGate();

    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(screen.queryByText("STUDENT FLOW")).toBeNull();
    expect(screen.queryByText("EDUCATOR FLOW")).toBeNull();
    expect(mockSaveOnboardingDraft).not.toHaveBeenCalled();
  });

  it("sends an SS3 student into the student flow with the right preset", async () => {
    // The persona's preset is what the setup steps are built from. Handing the
    // flow the bare choice string instead would silently drop ssClass.
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("SS3 Student"));
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(screen.getByText("STUDENT FLOW")).toBeTruthy();
    expect(onboardingFlowProps[0]).toMatchObject({
      initialPersona: "ss3_secondary",
      initialProfile: { userType: "ss3_secondary", ssClass: "ss3" },
    });
  });

  it("distinguishes SS1 from SS2 even though both share a user type", async () => {
    // Both map to userType "senior_secondary"; only ssClass separates them, and
    // it decides which year's guidance the student is shown.
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("SS1 Student"));
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(onboardingFlowProps[0]).toMatchObject({
      initialPersona: "senior_secondary",
      initialProfile: { ssClass: "ss1" },
    });
  });

  it("sends an educator to the institutional flow instead", async () => {
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("Educator / Institution"));
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(screen.getByText("EDUCATOR FLOW")).toBeTruthy();
    expect(screen.queryByText("STUDENT FLOW")).toBeNull();
  });

  it("persists the choice so a dropped connection does not lose the journey", async () => {
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("JAMB Candidate"));
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(mockSaveOnboardingDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        mode: "student",
        choice: "jamb",
        studentProfile: { userType: "jamb" },
      }),
    );
  });

  it("records an educator under the educator mode, not the student one", async () => {
    await renderGate();
    openPicker();
    fireEvent.press(screen.getByText("Educator / Institution"));
    await act(async () => {
      fireEvent.press(screen.getByText("Continue"));
    });

    expect(mockSaveOnboardingDraft).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "educator", choice: "educator" }),
    );
  });

  describe("returning to a saved draft", () => {
    it("resumes straight into the flow the user had already started", async () => {
      mockGetOnboardingDraft.mockResolvedValue({
        choice: "student",
        studentProfile: { userType: "student", institutionType: "university" },
      });

      await renderGate();

      expect(screen.getByText("STUDENT FLOW")).toBeTruthy();
      expect(onboardingFlowProps[0]).toMatchObject({
        initialProfile: { userType: "student", institutionType: "university" },
      });
    });

    it("ignores a draft whose persona the product no longer offers", async () => {
      // A retired or tampered value must not be fed into the flow as a persona.
      mockGetOnboardingDraft.mockResolvedValue({ choice: "postgraduate_alien" });

      await renderGate();

      expect(screen.queryByText("STUDENT FLOW")).toBeNull();
      expect(screen.getByText("Select your user type")).toBeTruthy();
    });

    it("throws the saved draft away when the user asked to restart", async () => {
      mockParams.restart = "1";
      mockGetOnboardingDraft.mockResolvedValue({ choice: "student" });

      await renderGate();

      expect(mockClearOnboardingDraft).toHaveBeenCalledWith("u1");
      expect(mockGetOnboardingDraft).not.toHaveBeenCalled();
      expect(screen.getByText("Select your user type")).toBeTruthy();
    });
  });
});
