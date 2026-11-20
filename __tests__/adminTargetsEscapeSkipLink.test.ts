import fs from "fs";
import path from "path";

const read = (rel: string) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

describe("admin keyboard and touch-target wiring", () => {
  it("closes the mobile admin drawer on Escape, traps Tab inside it and focuses it on open", () => {
    const shell = read("src/screens/admin/AdminShell.tsx");
    expect(shell).toContain('import { useEscapeToClose } from "@/hooks/useEscapeToClose"');
    expect(shell).toMatch(/useEscapeToClose\(drawerActive, onDrawerClose, \(\) => drawerRef\.current\)/);
    expect(shell).toMatch(/<aside className="web-admin-drawer" ref=\{drawerRef\} tabIndex=\{-1\}/);
    expect(shell).toMatch(/if \(drawerActive\) drawerRef\.current\?\.focus\(\)/);
  });

  it("offers a skip-to-content link that lands on a focusable main region, in both web shells", () => {
    for (const file of ["src/screens/admin/AdminShell.tsx", "web/src/WebApp.tsx"]) {
      const source = read(file);
      expect(source).toMatch(/<a className="skip-link" href="#main-content"/);
      expect(source).toContain('id="main-content" tabIndex={-1}');
      // SPA routers must not navigate on the hash: the handler focuses the target itself.
      expect(source).toMatch(/event\.preventDefault\(\); const target = document\.getElementById\("main-content"\)/);
    }
    const reference = read("src/components/shell/ReferenceShell.tsx");
    expect(reference).toContain("<SkipToContent />");
    expect(reference).toContain("nativeID={MAIN_CONTENT_ID}");
    const css = read("web/src/styles.css");
    expect(css).toMatch(/\.skip-link \{[^}]*transform: translateY\(-200%\)/);
    expect(css).toMatch(/\.skip-link:focus[^{]*\{ transform: translateY\(0\)/);
  });

  it("mounts the learner-interest screen in the Vite preview shell via its named export", () => {
    const web = read("web/src/WebApp.tsx");
    expect(web).toMatch(/LearningInterestScreen"\)\.then\(\(module\) => \(\{ default: module\.LearningInterestScreen \}\)\)/);
    expect(web).toMatch(/path === "\/admin\/analytics"\) return <Suspense fallback=\{<RouteLoading \/>\}><AdminLearningInterestScreen \/>/);
  });

  it("sizes the small controls the review measured", () => {
    const css = read("web/src/styles.css");
    expect(css).toMatch(/\.global-search input \{ min-height: 44px; \}/);
    expect(css).toMatch(/\.global-search-close \{ min-height: 36px;/);
    expect(css).toMatch(/\.platform-sidebar-account \.text-button \{ min-height: 36px;/);
    expect(css).toMatch(/@media \(max-width: 900px\) \{\s*\.global-search-close[^}]*\.web-admin-account button[^}]*min-height: 44px/);
    for (const file of ["src/screens/admin/GeneralDashboardScreen.tsx", "src/screens/admin/SchoolGuidanceDashboardScreen.tsx"]) {
      expect(read(file)).toMatch(/link: \{ alignSelf: "flex-start", minHeight: 44, justifyContent: "center"/);
    }
  });
});
