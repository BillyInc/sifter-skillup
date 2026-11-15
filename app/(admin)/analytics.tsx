import { LearningInterestScreen } from "../../src/screens/admin/LearningInterestScreen";

// /analytics is shared by product staff (platform aggregate) and verified
// institution owners (their own aggregate cohort); the server chooses scope.
export default function AnalyticsRoute() {
  return <LearningInterestScreen />;
}
