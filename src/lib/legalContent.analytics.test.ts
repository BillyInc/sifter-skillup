import { PRIVACY_VERSION, TERMS_VERSION } from "./legal";
import { TERMS_SECTIONS, privacySections } from "./legalContent";

describe("learning-interest analytics disclosure", () => {
  it("distinguishes affiliated school aggregates from the institution explored", () => {
    const terms = TERMS_SECTIONS.find(([title]) => title === "Learning-interest selections and public-interest reporting")?.[1] ?? "";
    const privacy = privacySections("Sifter LevelUp", "").find(([title]) => title === "Learning-interest analytics")?.[1] ?? "";
    expect(terms).toContain("affiliated school and state");
    expect(privacy).toContain("affiliated school and state");
    expect(privacy).toContain("recorded separately");
    expect(privacy).toContain("current-selection snapshot");
    expect(privacy).toContain("clears the current-selection snapshot");
  });

  it("requires renewed legal acceptance for the expanded analytics context", () => {
    expect(TERMS_VERSION).toBe("2026-10-29.1");
    expect(PRIVACY_VERSION).toBe("2026-10-29.1");
  });
});
