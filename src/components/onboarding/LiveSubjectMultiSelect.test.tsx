import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

const mockGetSubjects = jest.fn();

jest.mock("@/lib/careerData", () => ({ careerData: { getSubjects: (...args: unknown[]) => mockGetSubjects(...args) } }));
jest.mock("@/theme", () => ({
  Brand: { primary: "#f80" },
  FontSize: { xs: 10, sm: 12 },
  Radius: { sm: 6, full: 99 },
  Spacing: { xs: 3, sm: 6, md: 10 },
  useTheme: () => ({ colors: {
    text: "#111", textMuted: "#666", textRole: { primary: "#111", secondary: "#333", inverse: "#fff" },
    borderRole: { subtle: "#ddd" }, surface: { subtle: "#eee", raised: "#fff" },
    accentRole: { action: "#126", warning: "#a60" },
  } }),
}));
jest.mock("./primitives", () => ({
  SearchField: (props: any) => {
    const ReactActual = jest.requireActual("react");
    const { TextInput } = jest.requireActual("react-native");
    return ReactActual.createElement(TextInput, { accessibilityLabel: props.label, value: props.value, onChangeText: props.onChangeText, placeholder: props.placeholder });
  },
}));

import { LiveSubjectMultiSelect } from "./LiveSubjectMultiSelect";

const catalogue = [
  { id: "english", name: "English Language", streamTags: ["science", "commercial"] },
  { id: "math", name: "Mathematics", streamTags: ["science", "commercial", "art"] },
  { id: "biology", name: "Biology", streamTags: ["science"] },
  { id: "economics", name: "Economics", streamTags: ["commercial", "art"] },
  { id: "history", name: "History", streamTags: ["art"] },
];

describe("LiveSubjectMultiSelect stream scoping", () => {
  beforeEach(() => {
    mockGetSubjects.mockReset();
    mockGetSubjects.mockResolvedValue({ status: "real", data: catalogue, meta: {} });
  });

  it("shows tagged and cross-listed subjects first and reveals other streams only on request", async () => {
    const ui = render(
      <LiveSubjectMultiSelect label="O-level subjects" value={[]} onChange={jest.fn()} stream="science" streamScoped minSelected={5} maxSelected={6} fixedSubjects={["English Language", "Mathematics"]} />,
    );

    await waitFor(() => expect(ui.getByText("Biology")).toBeTruthy());
    expect(ui.getAllByText("English Language").length).toBeGreaterThan(0);
    expect(ui.queryByText("Economics")).toBeNull();
    expect(mockGetSubjects).toHaveBeenCalledWith("", undefined, undefined);

    fireEvent.press(ui.getByText("Show subjects outside my stream"));
    expect(ui.getByText("Economics")).toBeTruthy();
    expect(ui.getByText("History")).toBeTruthy();
    expect(ui.getAllByText("Outside your stream").length).toBeGreaterThan(0);
  });

  it("drops subjects not tagged for a changed stream and keeps cross-listed subjects", async () => {
    const onChange = jest.fn();
    const props = { label: "O-level subjects", value: ["English Language", "Mathematics", "Biology", "Economics"], onChange, stream: "science", streamScoped: true, minSelected: 5, maxSelected: 6, fixedSubjects: ["English Language", "Mathematics"] };
    const ui = render(<LiveSubjectMultiSelect {...props} />);
    await waitFor(() => expect(ui.getByText("Biology")).toBeTruthy());

    await act(async () => {
      ui.rerender(<LiveSubjectMultiSelect {...props} stream="commercial" />);
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(["English Language", "Mathematics", "Economics"]));
  });

  it("rechecks selected tags when a stream changes before the live catalogue finishes loading", async () => {
    let resolveCatalogue: ((value: { status: string; data: typeof catalogue; meta: Record<string, never> }) => void) | undefined;
    const pendingCatalogue = new Promise<{ status: string; data: typeof catalogue; meta: Record<string, never> }>((resolve) => { resolveCatalogue = resolve; });
    mockGetSubjects.mockReturnValue(pendingCatalogue);
    const onChange = jest.fn();
    const props = { label: "O-level subjects", value: ["English Language", "Mathematics", "Biology", "Economics"], onChange, stream: "science", streamScoped: true, minSelected: 5, maxSelected: 6, fixedSubjects: ["English Language", "Mathematics"] };
    const ui = render(<LiveSubjectMultiSelect {...props} />);
    await waitFor(() => expect(mockGetSubjects).toHaveBeenCalled());
    ui.rerender(<LiveSubjectMultiSelect {...props} stream="commercial" />);
    await waitFor(() => expect(mockGetSubjects).toHaveBeenCalledTimes(1));

    await act(async () => {
      resolveCatalogue?.({ status: "real", data: catalogue, meta: {} });
      await pendingCatalogue;
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(["English Language", "Mathematics", "Economics"]));
  });
});
