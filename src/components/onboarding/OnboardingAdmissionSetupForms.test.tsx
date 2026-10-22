import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("@/theme", () => ({
  Brand: { primary: "#f80" },
  FontSize: { xs: 10, sm: 12, md: 14, lg: 15, xxl: 20 },
  Radius: { md: 9 },
  Spacing: { xs: 3, sm: 6, md: 10, lg: 14, xl: 18 },
  useTheme: () => ({ colors: {
    text: "#111", textSoft: "#333", textMuted: "#666", border: "#ddd",
    textRole: { primary: "#111", secondary: "#333", muted: "#666" },
    borderRole: { subtle: "#ddd" }, surface: { subtle: "#eee" },
    accentRole: { action: "#126" },
  } }),
}));
jest.mock("../ui", () => ({
  SifterButton: ({ label, disabled }: any) => {
    const ReactActual = jest.requireActual("react");
    const { Text, TouchableOpacity } = jest.requireActual("react-native");
    return ReactActual.createElement(TouchableOpacity, { accessibilityRole: "button", accessibilityState: { disabled } }, ReactActual.createElement(Text, null, label));
  },
}));
jest.mock("./primitives", () => ({
  SelectField: ({ label }: any) => {
    const ReactActual = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return ReactActual.createElement(Text, null, label);
  },
  OptionCard: ({ title }: any) => {
    const ReactActual = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return ReactActual.createElement(Text, null, title);
  },
  ChoiceChips: () => null,
}));
jest.mock("./LiveAdmissionSearchField", () => ({
  LiveAdmissionSearchField: ({ label }: any) => {
    const ReactActual = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return ReactActual.createElement(Text, { accessibilityLabel: label }, label);
  },
}));
jest.mock("./LiveSubjectMultiSelect", () => ({
  LiveSubjectMultiSelect: (props: any) => {
    const ReactActual = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    const fixed = (props.fixedSubjects ?? []).join(",");
    const scope = props.streamScoped ? "scoped" : "all-streams";
    return ReactActual.createElement(Text, { accessibilityLabel: `${props.label}|${props.stream}|${fixed}|${scope}` }, props.label);
  },
  MAX_OLEVEL_SUBJECTS: 6,
}));
jest.mock("../LocalLegalNotice", () => () => null);

import { JambSetupForm } from "./JambSetupForm";
import { SeniorSecondaryExploreSetupForm } from "./SeniorSecondaryExploreSetupForm";

describe("admission onboarding setup forms", () => {
  it("allows SS1/SS2 to continue with five O-level subjects or a selected programme identity", () => {
    const base = {
      ssClass: "ss1",
      userType: "senior_secondary",
      secondarySchoolId: "secondary-school",
      stream: "science",
      olevelSubjects: ["English Language", "Mathematics", "Biology", "Chemistry"],
    } as any;
    const ui = render(<SeniorSecondaryExploreSetupForm value={base} onChange={jest.fn()} onContinue={jest.fn()} />);
    expect(ui.getByRole("button", { name: "Continue" }).props.accessibilityState.disabled).toBe(true);

    ui.rerender(<SeniorSecondaryExploreSetupForm value={{ ...base, intendedJambProgrammeId: "programme-id" }} onChange={jest.fn()} onContinue={jest.fn()} />);
    expect(ui.getByRole("button", { name: "Continue" }).props.accessibilityState.disabled).toBe(false);
    expect(ui.getByLabelText("Subjects in Science|science|English Language,Mathematics|scoped")).toBeTruthy();
    expect(ui.getByLabelText("Or type a programme you are considering")).toBeTruthy();
  });

  it("shows the three SS3/JAMB doors and the correct fields for each choice", () => {
    const ui = render(<JambSetupForm
      value={{ userType: "ss3_secondary", secondarySchoolId: "secondary-school", ssDoor: "unsure", stream: "science", olevelSubjects: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"], jambSubjects: ["Use of English", "Biology", "Chemistry", "Physics"] } as any}
      onChange={jest.fn()}
      onContinue={jest.fn()}
    />);
    expect(ui.getByText("I don’t know the programme yet")).toBeTruthy();
    expect(ui.getByText("I know the programme, not the university")).toBeTruthy();
    expect(ui.getByText("I know the programme and the university")).toBeTruthy();
    expect(ui.getAllByText(/^(?:I don|I know)/).map((node) => node.props.children)).toEqual([
      "I don\u2019t know the programme yet",
      "I know the programme, not the university",
      "I know the programme and the university",
    ]);
    expect(ui.getByLabelText("Your WAEC/NECO subjects|science|English Language,Mathematics|scoped")).toBeTruthy();
    expect(ui.getByLabelText("Your UTME/JAMB subjects|science|English Language|scoped")).toBeTruthy();

    ui.rerender(<JambSetupForm value={{ userType: "ss3_secondary", secondarySchoolId: "secondary-school", ssDoor: "know_what", intendedJambProgrammeId: "jamb-sociology", intendedProgramme: "Sociology" } as any} onChange={jest.fn()} onContinue={jest.fn()} />);
    expect(ui.getByLabelText("Programme you want to study")).toBeTruthy();
    expect(ui.queryByLabelText("Preferred university")).toBeNull();
    expect(ui.queryByLabelText(/Your WAEC\/NECO subjects/)).toBeNull();
    expect(ui.getByText("Check my subjects against this programme")).toBeTruthy();

    ui.rerender(<JambSetupForm value={{ userType: "jamb", jambPrepMode: "self_taught", ssDoor: "know_where", intendedJambProgrammeId: "jamb-sociology", intendedProgramme: "Sociology", preferredSchoolId: "unilag", preferredSchool: "University of Lagos" } as any} onChange={jest.fn()} onContinue={jest.fn()} />);
    expect(ui.getByLabelText("Programme you want to study")).toBeTruthy();
    expect(ui.getByLabelText("Preferred university")).toBeTruthy();
    expect(ui.getByRole("button", { name: "Continue" }).props.accessibilityState.disabled).toBe(false);
    expect(ui.queryByLabelText(/Your WAEC\/NECO subjects/)).toBeNull();
  });
});
