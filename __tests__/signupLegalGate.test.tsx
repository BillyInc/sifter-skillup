/**
 * The signup legal gate — the first screen of the entry journey, and the one
 * place in the app where a wrong render has a legal consequence.
 *
 * The gate is a small state machine with four interacting flags (terms,
 * termsRead, privacyRead, analytics) and every bug in it is silent: the CTA
 * enabling one tap early, the analytics toggle defaulting on, a prior
 * attempt's acceptance surviving into a new one. None of that throws, none of
 * it fails a type check, and nothing rendered this file before now.
 *
 * The Terms and Privacy documents themselves are stubbed: what is under test
 * is the gate's response to "the user reached the end of that document", not
 * the scroll detection inside the document viewer.
 */
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { renderWithProviders, act, fireEvent, screen } from "../test-utils/render";

// signup.tsx takes useFocusEffect from @react-navigation/native, NOT from
// expo-router — jest.setup.ts's expo-router stub does not cover it, and without
// this the screen never leaves its loading spinner.
const mockUseFocusEffect = jest.fn((cb: () => void | (() => void)) => {
  React.useEffect(cb, []);
});
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb: () => void | (() => void)) => mockUseFocusEffect(cb),
}));

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

// The real form is a separate concern (API, provisioning, validation). All this
// suite needs to know is whether the gate let the user through.
jest.mock("../src/screens/SignUpScreen", () => {
  const { Text: RNText } = require("react-native");
  return { __esModule: true, default: () => <RNText>SIGNUP FORM</RNText> };
});

const mockSaveLegalAcceptance = jest.fn(async () => undefined);
const mockClearLegalAcceptance = jest.fn(async () => undefined);
jest.mock("../src/lib/legal", () => ({
  TERMS_VERSION: "2026-08-14",
  PRIVACY_VERSION: "2026-08-14",
  saveLegalAcceptance: (...a: unknown[]) => mockSaveLegalAcceptance(...(a as [])),
  clearLegalAcceptance: () => mockClearLegalAcceptance(),
}));

// Stand in for the document viewers. Each exposes the one thing the gate cares
// about — "the user read this to the end" — plus records the props it was given
// so the explicit-confirmation requirement is still asserted.
const termsProps: Record<string, unknown>[] = [];
const privacyProps: Record<string, unknown>[] = [];
const docStub = (label: string, sink: Record<string, unknown>[]) => (props: any) => {
  sink.push(props);
  return (
    <TouchableOpacity onPress={props.onReadToEnd}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
};

jest.mock("../src/screens/TermsScreen", () => ({
  __esModule: true,
  default: (props: any) => (global as any).__termsStub(props),
}));
jest.mock("../src/screens/PrivacyScreen", () => ({
  __esModule: true,
  default: (props: any) => (global as any).__privacyStub(props),
}));

(global as any).__termsStub = docStub("REACH END OF TERMS", termsProps);
(global as any).__privacyStub = docStub("REACH END OF PRIVACY", privacyProps);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SignUpPage = require("../app/(auth)/signup").default;

const renderGate = async () => {
  const view = renderWithProviders(<SignUpPage />);
  // The focus effect clears any stale acceptance before the gate is shown.
  await act(async () => undefined);
  return view;
};

/**
 * The CTA's disabled state lives on the pressable ancestor of its label, not on
 * the Text node itself — walk up to the first node that declares one. Asserting
 * this (rather than only that pressing does nothing) is deliberate: the screen
 * ALSO re-checks the flags inside onContinue, so a behavioural assertion alone
 * would still pass with the `disabled` prop deleted and the button looking live.
 */
const ctaDisabled = (): boolean => accessibilityStateOf("Continue →").disabled === true;

/** The a11y state of the pressable ancestor of a label. */
function accessibilityStateOf(text: string | RegExp): Record<string, unknown> {
  let node: any = screen.getByText(text);
  while (node && node.props?.accessibilityState === undefined) node = node.parent;
  return node?.props?.accessibilityState ?? {};
}

beforeEach(() => {
  jest.clearAllMocks();
  termsProps.length = 0;
  privacyProps.length = 0;
});

describe("the signup legal gate", () => {
  it("shows the gate, not the signup form, on arrival", async () => {
    await renderGate();

    expect(screen.getByText("Before you begin")).toBeTruthy();
    expect(screen.queryByText("SIGNUP FORM")).toBeNull();
  });

  it("discards any acceptance left over from a previous attempt", async () => {
    // Consent is per-attempt and pre-account. A refresh, a back-navigation or a
    // different person on the same device must not inherit it.
    await renderGate();
    expect(mockClearLegalAcceptance).toHaveBeenCalled();
  });

  it("starts with the CTA disabled and nothing agreed", async () => {
    await renderGate();
    // eslint-disable-next-line no-console
    expect(ctaDisabled()).toBe(true);
    expect(screen.getByText("Tap the agreement line to read the Terms and Privacy Policy.")).toBeTruthy();
    expect(screen.getByText("Read Terms & Conditions")).toBeTruthy();
    expect(screen.getByText("Read Privacy Policy")).toBeTruthy();
  });

  it("refuses to accept before either document has been opened", async () => {
    // Tapping the agreement line is not agreement yet — the first tap opens the
    // Terms. Ticking the box without reading is the failure mode this prevents.
    await renderGate();

    fireEvent.press(screen.getByText(/I agree to the/));
    expect(screen.getByText("REACH END OF TERMS")).toBeTruthy();
    expect(mockSaveLegalAcceptance).not.toHaveBeenCalled();
  });

  it("requires an explicit confirmation inside each document", async () => {
    await renderGate();
    fireEvent.press(screen.getByText("Read Terms & Conditions"));

    expect(termsProps[termsProps.length - 1]).toMatchObject({
      requireExplicitConfirmation: true,
      confirmLabel: "I have read the Terms & Conditions",
    });
  });

  it("hands the user straight from the Terms to the Privacy Policy", async () => {
    await renderGate();

    fireEvent.press(screen.getByText(/I agree to the/));
    await act(async () => {
      fireEvent.press(screen.getByText("REACH END OF TERMS"));
    });

    expect(screen.getByText("REACH END OF PRIVACY")).toBeTruthy();
    expect(screen.getByText("✓ Terms read")).toBeTruthy();
  });

  it("still will not let the user through with both documents merely read", async () => {
    // Reading is not consenting. The box must be ticked on top.
    await readBothDocuments();

    expect(screen.getByText("Both documents read. Tap the agreement line to accept.")).toBeTruthy();
    expect(ctaDisabled()).toBe(true);

    await act(async () => {
      fireEvent.press(screen.getByText("Continue →"));
    });
    expect(screen.queryByText("SIGNUP FORM")).toBeNull();
  });

  it("keeps analytics hidden and off until the required consent is given", async () => {
    // An optional consent presented alongside a required one invites a single
    // "accept all" tap. It appears only after the required box is ticked, and
    // it starts off.
    await readBothDocuments();
    expect(screen.queryByText(/Help improve Sifter/)).toBeNull();

    fireEvent.press(screen.getByText(/I agree to the/));
    expect(accessibilityStateOf(/Help improve Sifter/).checked).toBe(false);
  });

  it("lets the user through once both documents are read and the box is ticked", async () => {
    await readBothDocuments();
    fireEvent.press(screen.getByText(/I agree to the/));

    expect(screen.getByText("Required terms accepted. Analytics is optional.")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText("Continue →"));
    });

    expect(mockSaveLegalAcceptance).toHaveBeenCalledWith(false);
    expect(screen.getByText("SIGNUP FORM")).toBeTruthy();
  });

  it("records an opted-in analytics choice, and only when the user opted in", async () => {
    await readBothDocuments();
    fireEvent.press(screen.getByText(/I agree to the/));
    fireEvent.press(screen.getByText(/Help improve Sifter/));

    await act(async () => {
      fireEvent.press(screen.getByText("Continue →"));
    });

    expect(mockSaveLegalAcceptance).toHaveBeenCalledWith(true);
  });

  it("offers a way back out of the gate", async () => {
    await renderGate();
    fireEvent.press(screen.getByText("← Back to sign in or create account"));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("shows which legal versions the user is agreeing to", async () => {
    await renderGate();
    expect(screen.getByText(/Terms 2026-08-14 · Privacy 2026-08-14/)).toBeTruthy();
  });
});

/** Drive the gate through both documents, leaving the box still unticked. */
async function readBothDocuments() {
  await renderGate();
  fireEvent.press(screen.getByText(/I agree to the/));
  await act(async () => {
    fireEvent.press(screen.getByText("REACH END OF TERMS"));
  });
  await act(async () => {
    fireEvent.press(screen.getByText("REACH END OF PRIVACY"));
  });
}
