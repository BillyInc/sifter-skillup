import ProfileScreen from "@/screens/ProfileScreen";

// The legacy game Home / dashboard (worker character, XP ring, career stages,
// skill bars, Portfolio/Workspace/Guild rows). Per the LevelUp plan the legacy
// game profile lives under My World when the world is live; this thin wrapper
// renders the existing ProfileScreen unchanged.
export default function MyWorldGameProfileRoute() {
  return <ProfileScreen />;
}
