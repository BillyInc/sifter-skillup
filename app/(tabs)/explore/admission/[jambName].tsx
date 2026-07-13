import { useLocalSearchParams } from "expo-router";
import AdmissionInsightScreen from "@/screens/careerIntelligence/AdmissionInsightScreen";

/**
 * Admission intelligence entry point.
 *
 * The dynamic segment is a JAMB/course name (e.g. "Computer Science") when
 * reached from the Explore "I know what, not where" door, or a programmeId when
 * reached from a programme's Admission tab CTA. The screen degrades gracefully:
 * with a course name it shows the national floor + competitiveness and prompts
 * for a school/programme; with a programmeId it also shows that programme's
 * cut-offs.
 */
export default function AdmissionRoute() {
  const { jambName } = useLocalSearchParams<{ jambName: string }>();
  const value = String(jambName ?? "");
  // Heuristic: our programme ids are UUIDs. Anything else is a course/JAMB name.
  const isProgrammeId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(value);
  return isProgrammeId ? (
    <AdmissionInsightScreen programmeId={value} />
  ) : (
    <AdmissionInsightScreen jambName={decodeURIComponent(value)} />
  );
}
