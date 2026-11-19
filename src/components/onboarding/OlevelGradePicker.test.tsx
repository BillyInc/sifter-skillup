import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("../../theme", () => ({
  Spacing: { xs: 3, sm: 6, md: 10 },
  FontSize: { xs: 10, sm: 12, md: 14 },
  useTheme: () => ({ colors: { text: "#111", textMuted: "#666", borderRole: { subtle: "#ddd" }, surface: { subtle: "#eee" } } }),
}));
jest.mock("./primitives", () => {
  const R = jest.requireActual("react");
  const { View, Text, TouchableOpacity } = jest.requireActual("react-native");
  return {
    ChoiceChips: ({ label, options, value, onChange }: any) =>
      R.createElement(View, { testID: `chips-${label}` },
        R.createElement(Text, null, label),
        options.map((o: any) =>
          R.createElement(TouchableOpacity, {
            key: o.value, accessibilityLabel: `${label}: ${o.label}`,
            accessibilityState: { selected: o.value === value }, onPress: () => onChange(o.value),
          }, R.createElement(Text, null, o.label)))),
  };
});

import { OlevelGradePicker } from "./OlevelGradePicker";

describe("OlevelGradePicker", () => {
  it("renders nothing without subjects", () => {
    const ui = render(<OlevelGradePicker subjects={[]} grades={{}} examBody="waec" onChange={jest.fn()} />);
    expect(ui.toJSON()).toBeNull();
  });

  it("is optional, defaults to I don't know yet, and explains the bands", () => {
    const ui = render(<OlevelGradePicker subjects={["Mathematics", "Biology"]} grades={{}} examBody={undefined} onChange={jest.fn()} />);
    expect(ui.getByText(/You can skip this/)).toBeTruthy();
    expect(ui.getByText(/institution's own rule still applies|university's own rule still applies/)).toBeTruthy();
    expect(ui.getByLabelText("Mathematics: I don't know yet").props.accessibilityState.selected).toBe(true);
    expect(ui.getByLabelText("Which exam are these grades from?: WAEC").props.accessibilityState.selected).toBe(true);
  });

  it("sets, changes and clears a grade, and changes exam body", () => {
    const onChange = jest.fn();
    const ui = render(<OlevelGradePicker subjects={["Mathematics", "Biology"]} grades={{ Biology: "B2" }} examBody="waec" onChange={onChange} />);
    fireEvent.press(ui.getByLabelText("Mathematics: C4"));
    expect(onChange).toHaveBeenLastCalledWith({ grades: { Biology: "B2", Mathematics: "C4" }, examBody: "waec" });
    fireEvent.press(ui.getByLabelText("Biology: I don't know yet"));
    expect(onChange).toHaveBeenLastCalledWith({ grades: {}, examBody: "waec" });
    fireEvent.press(ui.getByLabelText("Which exam are these grades from?: NECO"));
    expect(onChange).toHaveBeenLastCalledWith({ grades: { Biology: "B2" }, examBody: "neco" });
  });

  it("ignores grades for subjects that are no longer selected", () => {
    const onChange = jest.fn();
    const ui = render(<OlevelGradePicker subjects={["Mathematics"]} grades={{ Chemistry: "A1" }} examBody="waec" onChange={onChange} />);
    fireEvent.press(ui.getByLabelText("Mathematics: A1"));
    expect(onChange).toHaveBeenLastCalledWith({ grades: { Mathematics: "A1" }, examBody: "waec" });
  });
});
