import React from "react";
import { StyleSheet } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { ChoiceChips } from "./primitives";

const options = [
  { label: "A1", value: "A1" },
  { label: "I don't know yet", value: "unknown" },
];

describe("ChoiceChips", () => {
  it("meets the 44px touch target and exposes role, label and selected state", () => {
    const onChange = jest.fn();
    const ui = render(<ChoiceChips label="Biology" options={options} value="A1" onChange={onChange} />);
    const chip = ui.getByLabelText("Biology: A1");
    expect(chip.props.accessibilityRole).toBe("button");
    expect(chip.props.accessibilityState.selected).toBe(true);
    expect(StyleSheet.flatten(chip.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(ui.getByLabelText("Biology: I don't know yet").props.accessibilityState.selected).toBe(false);
    fireEvent.press(ui.getByLabelText("Biology: I don't know yet"));
    expect(onChange).toHaveBeenCalledWith("unknown");
  });

  it("draws a neutral default quietly (not as a solid choice) while still reporting it selected", () => {
    const ui = render(<ChoiceChips label="Biology" options={options} value="unknown" neutralValue="unknown" onChange={jest.fn()} />);
    const quiet = ui.getByLabelText("Biology: I don't know yet");
    expect(quiet.props.accessibilityState.selected).toBe(true);
    const chosen = render(<ChoiceChips label="Biology" options={options} value="A1" neutralValue="unknown" onChange={jest.fn()} />);
    const solid = StyleSheet.flatten(chosen.getByLabelText("Biology: A1").props.style);
    const quietStyle = StyleSheet.flatten(quiet.props.style);
    expect(quietStyle.backgroundColor).not.toBe(solid.backgroundColor);
    expect(quietStyle.borderColor).not.toBe(solid.borderColor);
  });
});
