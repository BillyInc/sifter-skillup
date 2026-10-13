import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { LearningPlanShareSheet } from "./LearningPlanShareSheet";

describe("LearningPlanShareSheet", () => {
  it("previews platform-specific copy and shares the selected version", () => {
    const onShare = jest.fn();
    const onCopy = jest.fn();
    render(
      <ThemeProvider>
        <LearningPlanShareSheet
          visible
          input={{ routeLabel: "Sociology → Social Sciences", focusNames: ["Research design", "SPSS"] }}
          onClose={jest.fn()}
          onShare={onShare}
          onCopy={onCopy}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("A short, forwardable message.")).toBeTruthy();
    expect(screen.getByText(/My route starts with Sociology/)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "X" }));
    expect(screen.getByText("A concise post for X.")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Continue to share" }));

    expect(onShare).toHaveBeenCalledWith(expect.objectContaining({
      platform: "x",
      message: expect.stringContaining("Get yours: https://levelup.com.ng"),
    }));
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("offers copy-ready Instagram/TikTok captions without implying direct posting", () => {
    const onCopy = jest.fn();
    render(
      <ThemeProvider>
        <LearningPlanShareSheet
          visible
          input={{ focusNames: ["Python"] }}
          onClose={jest.fn()}
          onShare={jest.fn()}
          onCopy={onCopy}
        />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByRole("button", { name: "Instagram" }));
    expect(screen.getByText(/may require you to paste the caption/)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Copy message" }));

    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({
      platform: "instagram",
      message: expect.stringContaining("#SifterLevelUp"),
    }));
  });
});
