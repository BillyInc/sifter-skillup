import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

const mockSearchJambProgrammes = jest.fn();

jest.mock("@/lib/careerData", () => ({ careerData: { searchJambProgrammes: (...args: unknown[]) => mockSearchJambProgrammes(...args) } }));
jest.mock("@/theme", () => ({
  Brand: { primary: "#f80" },
  FontSize: { xs: 10, sm: 12 },
  Radius: { sm: 6, md: 8 },
  Spacing: { xs: 3, sm: 6, md: 10 },
  useTheme: () => ({ colors: {
    text: "#111", textMuted: "#666", border: "#ddd", card: "#fff", danger: "#a00",
    surface: { subtle: "#f7f7f7" },
    borderRole: { subtle: "#ddd" },
    accentRole: { action: "#126" },
  } }),
}));
jest.mock("./primitives", () => ({
  SearchField: (props: any) => {
    const ReactActual = jest.requireActual("react");
    const { TextInput } = jest.requireActual("react-native");
    return ReactActual.createElement(TextInput, { accessibilityLabel: props.label, value: props.value, onChangeText: props.onChangeText, placeholder: props.placeholder });
  },
}));

import { LiveAdmissionSearchField } from "./LiveAdmissionSearchField";

describe("LiveAdmissionSearchField programme matching", () => {
  beforeEach(() => {
    mockSearchJambProgrammes.mockReset();
    mockSearchJambProgrammes.mockResolvedValue({
      status: "real",
      data: [
        { id: "nursing-general", jambName: "Nursing / Nursing Science", distinction: "General nursing programme" },
        { id: "nursing-community", jambName: "Community Health Nursing" },
      ],
      meta: {},
    });
  });

  it("strips an intent phrase and presents each stored programme identity as a separate choice", async () => {
    const onSelect = jest.fn();
    const ui = render(<LiveAdmissionSearchField label="Programme" value="" onSelect={onSelect} placeholder="Search" kind="programme" />);

    fireEvent.changeText(ui.getByLabelText("Programme"), "I want to study nursing");
    await waitFor(() => expect(ui.getByText(/JAMB lists more than one programme under/)).toBeTruthy());
    expect(mockSearchJambProgrammes).toHaveBeenCalledWith("nursing");

    expect(ui.getByText("Nursing / Nursing Science")).toBeTruthy();
    expect(ui.getByText("Community Health Nursing")).toBeTruthy();
    expect(ui.getByText("General nursing programme")).toBeTruthy();
    expect(ui.getByText("This is a separate JAMB programme. Its O-level subjects, UTME subjects, and universities are its own.")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalledWith(expect.objectContaining({ id: "nursing-community" }));

    fireEvent.press(ui.getAllByText("Choose this programme")[1]);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "nursing-community", name: "Community Health Nursing" }));
  });

  it("selects a single returned identity and restores the typed words when changed", async () => {
    mockSearchJambProgrammes.mockResolvedValueOnce({ status: "real", data: [{ id: "nursing-one", jambName: "Nursing/Nursing Science" }], meta: {} });
    const onSelect = jest.fn();
    function ControlledProgrammeSearch() {
      const [value, setValue] = React.useState("");
      const [selectedId, setSelectedId] = React.useState<string | undefined>();
      return <LiveAdmissionSearchField
        label="Programme"
        value={value}
        selectedId={selectedId}
        onSelect={(item) => {
          onSelect(item);
          setValue(item.name);
          setSelectedId(item.id || undefined);
        }}
        placeholder="Search"
        kind="programme"
      />;
    }
    const ui = render(<ControlledProgrammeSearch />);
    fireEvent.changeText(ui.getByLabelText("Programme"), "I want to study nursing");

    await waitFor(() => expect(ui.getByLabelText("Change programme")).toBeTruthy());
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "nursing-one", name: "Nursing/Nursing Science" }));
    expect(ui.getByText("Nursing/Nursing Science")).toBeTruthy();
    fireEvent.press(ui.getByLabelText("Change programme"));
    expect(onSelect).toHaveBeenLastCalledWith({ id: "", name: "I want to study nursing" });
    await waitFor(() => expect((ui.getByLabelText("Programme") as any).props.value).toBe("I want to study nursing"));
    await waitFor(() => expect(ui.getByText(/JAMB lists more than one programme under/)).toBeTruthy());
  });
});
