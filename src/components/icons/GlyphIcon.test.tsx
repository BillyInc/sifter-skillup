import React from "react";
import { render, screen } from "@testing-library/react-native";
import { GLYPH_TO_FEATHER, GlyphIcon, featherNameForGlyph } from "./GlyphIcon";

describe("GlyphIcon", () => {
  it("renders a Feather icon, not the emoji, for a mapped glyph", () => {
    render(<GlyphIcon glyph="👥" />);
    expect(screen.queryByText("👥")).toBeNull();
  });

  it("maps legacy text codes such as ROL and SET to Feather names", () => {
    expect(featherNameForGlyph("ROL")).toBe("briefcase");
    expect(featherNameForGlyph("SET")).toBe("settings");
    expect(featherNameForGlyph("USER")).toBe("user");
  });

  it("accepts a Feather name as-is", () => {
    render(<GlyphIcon glyph="chevron-right" />);
    expect(screen.queryByText("chevron-right")).toBeNull();
  });

  it("still shows an unmapped glyph as text so nothing disappears", () => {
    render(<GlyphIcon glyph="•" />);
    expect(screen.getByText("•", { includeHiddenElements: true })).toBeTruthy();
  });

  it("is hidden from assistive tech unless a label is given", () => {
    render(<GlyphIcon glyph="🔒" accessibilityLabel="Locked" />);
    expect(screen.getByLabelText("Locked")).toBeTruthy();
  });

  it("maps only to names that exist in Feather", () => {
    const { Feather } = require("@expo/vector-icons");
    for (const [glyph, name] of Object.entries(GLYPH_TO_FEATHER)) {
      expect({ glyph, ok: name in Feather.glyphMap }).toEqual({ glyph, ok: true });
    }
  });
});
