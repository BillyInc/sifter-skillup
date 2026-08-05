import {
  requirementFallbackText,
  sanitizeRequirementText,
} from "../src/lib/sanitizeRequirementText";

describe("sanitizeRequirementText", () => {
  describe("empty input", () => {
    it("flags null as empty", () => {
      expect(sanitizeRequirementText(null)).toEqual({
        displayable: false,
        cleaned: "",
        issue: "empty",
      });
    });

    it("flags an empty string as empty", () => {
      expect(sanitizeRequirementText("")).toEqual({
        displayable: false,
        cleaned: "",
        issue: "empty",
      });
    });

    it("flags whitespace-only text as empty", () => {
      expect(sanitizeRequirementText("   \n\t  ")).toEqual({
        displayable: false,
        cleaned: "",
        issue: "empty",
      });
    });
  });

  describe("clean text", () => {
    it("passes clean text through unchanged", () => {
      const result = sanitizeRequirementText("Mathematics and one other subject.");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("Mathematics and one other subject.");
      expect(result.issue).toBeUndefined();
    });

    it("accepts a real-world requirement string without false-positive garble detection", () => {
      const text =
        "Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.";
      const result = sanitizeRequirementText(text);
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe(text);
      expect(result.issue).toBeUndefined();
    });

    it("trims surrounding whitespace", () => {
      const result = sanitizeRequirementText("  Physics required.  ");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("Physics required.");
    });
  });

  describe("garbled text", () => {
    it("flags run-together camelCase text", () => {
      const result = sanitizeRequirementText("FiveSSCcreditpassesinEnglish");
      expect(result.displayable).toBe(false);
      expect(result.issue).toBe("garbled");
    });

    it("flags a single word of 25+ letters", () => {
      const result = sanitizeRequirementText("fivecreditpassesinenglishlanguage");
      expect(result.displayable).toBe(false);
      expect(result.issue).toBe("garbled");
    });

    it("flags mojibake containing â€", () => {
      const result = sanitizeRequirementText("English Language â€“ Mathematics");
      expect(result.displayable).toBe(false);
      expect(result.issue).toBe("garbled");
    });

    it("flags mojibake containing Ã¢", () => {
      const result = sanitizeRequirementText("Ã¢ Physics required");
      expect(result.displayable).toBe(false);
      expect(result.issue).toBe("garbled");
    });

    it("flags mojibake containing Ã©", () => {
      const result = sanitizeRequirementText("rÃ©sumÃ© required");
      expect(result.displayable).toBe(false);
      expect(result.issue).toBe("garbled");
    });

    it("flags literal \\u00 escape sequences", () => {
      const result = sanitizeRequirementText("English\\u00a0Language");
      expect(result.displayable).toBe(false);
      expect(result.issue).toBe("garbled");
    });
  });

  describe("HTML entity decoding", () => {
    it("decodes &amp; to &", () => {
      const result = sanitizeRequirementText("Physics &amp; Chemistry");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("Physics & Chemistry");
    });

    it("decodes &rsquo; to an apostrophe", () => {
      const result = sanitizeRequirementText("candidate&rsquo;s results");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("candidate's results");
    });

    it("decodes &ldquo; and &rdquo; to double quotes", () => {
      const result = sanitizeRequirementText("&ldquo;credit&rdquo; passes");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe('"credit" passes');
    });

    it("decodes &nbsp; to a space", () => {
      const result = sanitizeRequirementText("Physics&nbsp;required");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("Physics required");
    });

    it("decodes &ndash; to an en dash", () => {
      const result = sanitizeRequirementText("Physics &ndash; Chemistry");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("Physics – Chemistry");
    });

    it("decodes &quot; to a double quote", () => {
      const result = sanitizeRequirementText("&quot;credit&quot; passes");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe('"credit" passes');
    });

    it("decodes a decimal numeric entity", () => {
      const result = sanitizeRequirementText("candidate&#8217;s results");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("candidate’s results");
    });

    it("decodes a hex numeric entity", () => {
      const result = sanitizeRequirementText("candidate&#x2019;s results");
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("candidate’s results");
    });

    it("decodes every supported entity in a single string and trims the result", () => {
      const result = sanitizeRequirementText(
        " &ldquo;Maths &amp; English&rdquo; is the candidate&rsquo;s core&nbsp;pair. ",
      );
      expect(result.displayable).toBe(true);
      expect(result.cleaned).toBe("\"Maths & English\" is the candidate's core pair.");
      expect(result.issue).toBeUndefined();
    });
  });
});

describe("requirementFallbackText", () => {
  it("returns the UTME subjects fallback", () => {
    expect(requirementFallbackText("utme_subjects")).toBe(
      "Check JAMB IBASS brochure for subject combinations for this programme.",
    );
  });

  it("returns the O'Level requirement fallback", () => {
    expect(requirementFallbackText("olevel_requirement")).toBe(
      "Check JAMB IBASS brochure for O'Level credit requirements for this programme.",
    );
  });

  it("returns the Direct Entry fallback", () => {
    expect(requirementFallbackText("direct_entry")).toBe(
      "Check individual university for Direct Entry requirements for this programme.",
    );
  });

  it("returns the cut-off fallback", () => {
    expect(requirementFallbackText("cutoff")).toBe(
      "Check university website for current cut-off mark.",
    );
  });
});
