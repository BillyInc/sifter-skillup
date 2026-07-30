import React, { useEffect } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, type SharedValue } from "react-native-reanimated";
import { useReducedMotion } from "../../theme/motion";

const PARTICLE_COUNT = 10;
const MAX_RADIUS = 80;

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
}

function buildParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (2 * Math.PI * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.6;
    const dist = MAX_RADIUS * (0.5 + Math.random() * 0.5);
    particles.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 40,
    });
  }
  return particles;
}

export interface CelebrationBurstProps {
  trigger: number;
  /** Override burst origin. Defaults to centre of the container. */
  originX?: number;
  originY?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function CelebrationBurst({ trigger, originX, originY, color = "#F5A65B", style }: CelebrationBurstProps) {
  const reduced = useReducedMotion();
  const [layout, setLayout] = React.useState({ w: 0, h: 0 });
  const [particles, setParticles] = React.useState<Particle[]>([]);

  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    setParticles(buildParticles());
    opacity.value = 1;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    opacity.value = withDelay(500, withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) }));
  }, [trigger, reduced, opacity, progress]);

  if (reduced) return null;

  const cx = originX ?? layout.w / 2;
  const cy = originY ?? layout.h / 2;

  return (
    <View
      style={[StyleSheet.absoluteFill, style, { pointerEvents: "none" }]}
      onLayout={(e: LayoutChangeEvent) => {
        setLayout({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
      }}
    >
      {particles.map((p, i) => (
        <ParticleDot
          key={i}
          particle={p}
          progress={progress}
          opacity={opacity}
          cx={cx}
          cy={cy}
          color={color}
        />
      ))}
    </View>
  );
}

function ParticleDot({
  particle,
  progress,
  opacity,
  cx,
  cy,
  color,
}: {
  particle: Particle;
  progress: SharedValue<number>;
  opacity: SharedValue<number>;
  cx: number;
  cy: number;
  color: string;
}) {
  const animStyle = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (progress.value - particle.delay / 700) / (1 - particle.delay / 700)));
    const eased = t * t * (3 - 2 * t);
    return {
      transform: [
        { translateX: particle.x * eased },
        { translateY: particle.y * eased },
        { scale: 0.3 + 0.7 * eased },
      ],
      opacity: opacity.value * (1 - eased * 0.6),
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: color,
          left: cx - particle.size / 2,
          top: cy - particle.size / 2,
        },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
  },
});
