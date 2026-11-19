import SkillsMatcherScreen from "@/screens/SkillsMatcherScreen";

// Student entry to the Skills Matcher. Deliberately NOT under `/skills`, which
// is a gated legacy-learning prefix (src/lib/learningGate.ts) that
// RouteIntegrityGuard redirects while the learning layer is off.
export default function ExploreSkillsMatcherRoute() {
  return <SkillsMatcherScreen studentView />;
}
