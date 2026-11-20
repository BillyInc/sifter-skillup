import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { StatCard } from "./StatCard";

describe("StatCard icon", () => {
  it("draws a Feather icon instead of the emoji passed in", () => {
    render(
      <ThemeProvider>
        <StatCard
          icon="🎓"
          label="Programmes"
          state={{ status: "real", data: 3 } as never}
          select={(n: number) => String(n)}
        />
      </ThemeProvider>,
    );
    expect(screen.queryByText("🎓")).toBeNull();
    expect(screen.getByText("Programmes")).toBeTruthy();
  });
});
