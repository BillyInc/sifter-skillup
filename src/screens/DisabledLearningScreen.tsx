import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme, CompassFonts, FontSize, Radius, Spacing, webContainer } from "@/theme";

/** Lightweight fallback for legacy learning/game routes while that layer is disabled. */
export default function DisabledLearningScreen({ area = "This area" }: { area?: string }) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.surface.base }]}
      contentContainerStyle={[styles.content, webContainer as object]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.eyebrow, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>COMING LATER</Text>
        <Text style={[styles.title, CompassFonts.displayBold, { color: colors.textRole.primary }]}>Learning experiences are paused</Text>
        <Text style={[styles.body, CompassFonts.body, { color: colors.textRole.secondary }]}>
          {area} is not part of the current product release. Your career guidance, programmes, domains, roles and Opportunities remain available in Explore.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to Explore"
          onPress={() => router.replace("/(tabs)/explore" as never)}
          style={[styles.button, { backgroundColor: colors.accentRole.action }]}
        >
          <Text style={[styles.buttonText, CompassFonts.bodyBold]}>Go to Explore</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: Spacing.xl },
  card: { maxWidth: 680, alignSelf: "center", width: "100%", borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.xl },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 1.2, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, lineHeight: 32, marginBottom: Spacing.md },
  body: { fontSize: FontSize.md, lineHeight: 24, marginBottom: Spacing.xl },
  button: { alignSelf: "flex-start", borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  buttonText: { color: "#fff", fontSize: FontSize.md },
});
