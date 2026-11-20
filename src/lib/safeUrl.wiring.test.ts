/**
 * Every place that opens a URL taken from an API response, saved item or OAuth
 * hand-off must go through openExternalUrl / safeExternalUrl, never a bare
 * Linking.openURL. (Constant URLs written in the source are not checked here.)
 */
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..", "..");
const GUARDED = [
  "src/components/FeedCard.tsx",
  "src/components/FeedWebLayout.tsx",
  "src/components/StarknetFaucetButton.tsx",
  "src/components/careerIntelligence/ContextRelationshipSheet.tsx",
  "src/components/careerIntelligence/AlternativeComparisonSheet.tsx",
  "src/screens/MyWorldScreen.tsx",
  "src/screens/LearnMoreScreen.tsx",
  "src/screens/PortfolioScreen.tsx",
  "src/screens/PortfolioHubScreen.tsx",
  "src/screens/GitHubScreen.tsx",
  "src/screens/careerIntelligence/SubgroupDetailScreen.tsx",
  "src/lib/portfolioOAuth.ts",
];

describe("external URL opens", () => {
  it.each(GUARDED)("%s has no bare data-derived Linking.openURL", (file) => {
    const source = fs.readFileSync(path.join(ROOT, file), "utf8");
    const bare = source.split("\n").filter((line) => /Linking\.openURL\(/.test(line));
    // Constant URLs (string/template literals starting with a scheme) are fine.
    const dataDerived = bare.filter((line) => !/Linking\.openURL\(\s*[`'"](https?:|mailto:)/.test(line));
    expect(dataDerived).toEqual([]);
    expect(source).toMatch(/openExternalUrl|safeExternalUrl/);
  });

  it("the OAuth popup is not opened with a noopener feature (it needs the handle to poll)", () => {
    const source = fs.readFileSync(path.join(ROOT, "src/lib/portfolioOAuth.ts"), "utf8");
    expect(source).not.toMatch(/noopener/);
    expect(source).toMatch(/safeExternalUrl\(authUrl\)/);
  });
});
