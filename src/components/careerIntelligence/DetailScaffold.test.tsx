import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { DetailScaffold, d078ContentGutter } from "./DetailScaffold";
import { ThemeProvider } from "@/theme";
import { real } from "@/types/career";

jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), replace: jest.fn(), canGoBack: () => false }) }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "student-1" } }) }));

describe("DetailScaffold D078 heading options", () => {
  it("keeps the navigation control while the nested D078 body owns the visible title", () => {
    render(<ThemeProvider><DetailScaffold
      title="Area title supplied by the scaffold"
      eyebrow="AREA"
      hideScreenTitle
      hideEyebrow
      state={real({})}
      backLabel="Back to methods"
    >{() => <></>}</DetailScaffold></ThemeProvider>);

    expect(screen.queryByText("Area title supplied by the scaffold")).toBeNull();
    expect(screen.queryByText("AREA")).toBeNull();
    expect(screen.getByText("Back to methods")).toBeTruthy();
  });

  it("uses the specified 16px D078 gutter on a narrow screen", () => {
    const rendered = render(<ThemeProvider><DetailScaffold
      title="Social Sciences"
      wideContent
      hideScreenTitle
      hideEyebrow
      state={real({})}
    >{() => <></>}</DetailScaffold></ThemeProvider>);

    const scroll = rendered.UNSAFE_getAllByType(ScrollView)[0];
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle).paddingHorizontal).toBe(16);
    expect(d078ContentGutter(390)).toBe(16);
    expect(d078ContentGutter(1024)).toBe(24);
  });

  it("gives the D078 scaffold back control the 44px target and journey label size", () => {
    const rendered = render(<ThemeProvider><DetailScaffold
      title="Social Sciences"
      wideContent
      hideScreenTitle
      hideEyebrow
      state={real({})}
      backLabel="Back to programme"
    >{() => <></>}</DetailScaffold></ThemeProvider>);

    const back = rendered.UNSAFE_getAllByType(TouchableOpacity).find((node) => node.props.onPress);
    expect(back).toBeTruthy();
    expect(StyleSheet.flatten(back!.props.style).minHeight).toBeGreaterThanOrEqual(44);
    const backLabel = screen.getByText("Back to programme");
    expect(StyleSheet.flatten(backLabel.props.style)).toMatchObject({ fontSize: 16, lineHeight: 20 });
  });
});
