/**
 * IntroCarousel — first-launch brand intro for Sifter LevelUp.
 *
 * Three skippable slides that explain the platform and land on the tagline,
 * then hand off to auth. Shown once (gated by INTRO_SEEN_KEY); returning users
 * never see it. Horizontal paging via ScrollView (no extra dependency), with a
 * subtle parallax on the logo and animated progress dots.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useTheme,
  Spacing,
  FontSize,
  Brand,
  CompassFonts,
  INTRO_SEEN_KEY,
} from "@/theme";
import { SifterButton } from "@/components/ui";
import { LevelUpLogo } from "@/components/brand/LevelUpLogo";

const { width: W } = Dimensions.get("window");

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "WELCOME TO",
    title: "Sifter LevelUp",
    body: "Career intelligence for every Nigerian starting point — JAMB, university, college of education and beyond.",
  },
  {
    eyebrow: "WHAT YOU GET",
    title: "Your programme,\nfully mapped",
    body: "Search any programme and see the domains, roles and skills it connects to. Verified Opportunities appear when available, with local, global and remote signals kept separate.",
  },
  {
    eyebrow: "WHAT YOU GET",
    title: "Opportunities,\nwhen available",
    body: "See the domains, roles and skills connected to your programme, then discover verified Opportunities when they are available.",
  },
];

export function IntroCarousel({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const isWeb = Platform.OS === "web";
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isLast = index === SLIDES.length - 1;

  const finish = useCallback(() => {
    AsyncStorage.setItem(INTRO_SEEN_KEY, "1").catch(() => {});
    onDone();
  }, [onDone]);

  const goToLogin = useCallback(() => {
    AsyncStorage.setItem(INTRO_SEEN_KEY, "1").catch(() => {});
    router.replace("/(auth)/sign-in" as never);
  }, [router]);

  const goNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: next * W, animated: true });
    setIndex(next);
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
  }, [index, isLast, finish]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / W);
    if (i !== index) {
      setIndex(i);
      if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    }
  };

  const gradient: [string, string] = isDark
    ? ["#0B0B10", "#161108"]
    : [colors.surface.base, colors.surface.subtle];

  return (
    <View style={[styles.root, { backgroundColor: colors.surface.base }]}>      
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />

      {/* Skip */}
      <TouchableOpacity style={styles.skip} onPress={finish} hitSlop={12}>
        <Text style={[styles.skipText, { color: colors.textRole.muted }, CompassFonts.body]}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => {
          // Parallax: logo drifts slightly slower than the page.
          const translateX = isWeb ? 0 : scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [W * 0.25, 0, -W * 0.25],
              extrapolate: "clamp",
            });
          const opacity = isWeb ? 1 : scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
          return (
            <View key={i} style={[styles.slide, { width: W }]}>
              <Animated.View
                style={{
                  transform: isWeb ? undefined : [{ translateX }],
                  opacity,
                  alignItems: "center",
                }}
              >
                <LevelUpLogo size={132} animated={i === 0} />
                <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
                  {slide.eyebrow}
                </Text>
                <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
                  {slide.title}
                </Text>
                <Text style={[styles.body, { color: colors.textRole.secondary }, CompassFonts.body]}>
                  {slide.body}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => {
          const w = isWeb ? (i === index ? 22 : 8) : scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [8, 22, 8],
              extrapolate: "clamp",
            });
          const o = isWeb ? (i === index ? 1 : 0.3) : scrollX.interpolate({
              inputRange: [(i - 1) * W, i * W, (i + 1) * W],
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { width: w, opacity: o, backgroundColor: Brand.primary },
              ]}
            />
          );
        })}
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <SifterButton
          label={isLast ? "Get Started" : "Next"}
          onPress={goNext}
          variant="track"
          color={Brand.primary}
          size="lg"
          fullWidth
        />
        {isLast ? (
          <TouchableOpacity style={styles.signIn} onPress={goToLogin} hitSlop={8}>
            <Text style={[styles.signInText, { color: colors.textRole.secondary }, CompassFonts.body]}>
              I already have an account
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export default IntroCarousel;

const styles = StyleSheet.create({
  root: { flex: 1 },
  skip: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: { fontSize: FontSize.md },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.huge,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
    marginTop: Spacing.xl,
  },
  title: {
    fontSize: FontSize.hero,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: FontSize.hero * 1.15,
  },
  body: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.5,
    textAlign: "center",
    marginTop: Spacing.lg,
    maxWidth: 360,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: Spacing.xl,
  },
  dot: { height: 8, borderRadius: 4 },
  cta: { paddingHorizontal: Spacing.huge, paddingBottom: 48, gap: Spacing.md },
  signIn: { alignSelf: "center", paddingVertical: Spacing.sm },
  signInText: { fontSize: FontSize.md },
});
