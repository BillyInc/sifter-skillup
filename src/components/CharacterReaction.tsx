/**
 * Sifter LevelUp — Character Reaction
 * Wraps WorkerCharacter with mood-driven animations.
 * Correct  → nod down + bounce up + brief green glow
 * Wrong    → head shake left-right + brief red flash
 * Thinking → slow idle sway
 * Celebrate→ full jump + spin (used on lab complete)
 *
 * Usage in LessonScreen:
 *   <CharacterReaction
 *     mood={answerMood}          // 'idle' | 'correct' | 'wrong' | 'thinking' | 'celebrating'
 *     stage={xp.stage.stage}
 *     trackId={user.currentTrackId}
 *     size={80}
 *   />
 */

import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { WorkerCharacter } from './CharacterSystem';
import { useTheme, AnimPreset, Shadow } from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CharacterMood =
  | 'idle'
  | 'correct'
  | 'wrong'
  | 'thinking'
  | 'celebrating';

export interface CharacterReactionProps {
  mood: CharacterMood;
  stage?: number;
  trackId?: string;
  size?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CharacterReaction({
  mood,
  stage = 1,
  trackId = 'default',
  size = 88,
}: CharacterReactionProps) {
  const { colors } = useTheme();

  // Translation animations
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Glow color (rgba string via interpolation trick)
  const glowAlpha  = useRef(new Animated.Value(0)).current;
  const glowRed    = useRef(new Animated.Value(0)).current;  // 1 = red, 0 = green

  // Idle float loop ref
  const idleLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const startIdle = () => {
    idleLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -5, ...AnimPreset.float }),
        Animated.timing(translateY, { toValue:  0, ...AnimPreset.float }),
      ])
    );
    idleLoopRef.current.start();
  };

  const stopIdle = () => {
    idleLoopRef.current?.stop();
    idleLoopRef.current = null;
  };

  useEffect(() => {
    // Always stop idle before triggering a reaction
    stopIdle();
    translateY.setValue(0);
    translateX.setValue(0);
    scaleAnim.setValue(1);
    rotateAnim.setValue(0);

    if (mood === 'idle') {
      startIdle();
      return;
    }

    if (mood === 'correct') {
      // Nod: dip down then spring back up with bounce
      glowRed.setValue(0);   // green glow
      Animated.parallel([
        // Nod motion: dip down then overshoot up
        Animated.sequence([
          Animated.timing(translateY, { toValue: 10, duration: 120, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: -12, ...AnimPreset.spring }),
          Animated.spring(translateY, { toValue: 0,   ...AnimPreset.springGentle }),
        ]),
        // Quick scale squash on dip
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 0.88, duration: 120, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1.08, ...AnimPreset.spring }),
          Animated.spring(scaleAnim, { toValue: 1,    ...AnimPreset.springGentle }),
        ]),
        // Green glow flash
        Animated.sequence([
          Animated.timing(glowAlpha, { toValue: 0.5, duration: 150, useNativeDriver: true }),
          Animated.timing(glowAlpha, { toValue: 0,   duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => startIdle());
      return;
    }

    if (mood === 'wrong') {
      // Shake horizontally
      glowRed.setValue(1);   // red glow
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateX, { toValue: -10, duration: 70, useNativeDriver: true }),
          Animated.timing(translateX, { toValue:  10, duration: 70, useNativeDriver: true }),
          Animated.timing(translateX, { toValue:  -8, duration: 70, useNativeDriver: true }),
          Animated.timing(translateX, { toValue:   8, duration: 70, useNativeDriver: true }),
          Animated.timing(translateX, { toValue:  -4, duration: 70, useNativeDriver: true }),
          Animated.timing(translateX, { toValue:   0, duration: 70, useNativeDriver: true }),
        ]),
        // Brief drop
        Animated.sequence([
          Animated.timing(translateY, { toValue: 6, duration: 120, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, ...AnimPreset.springGentle }),
        ]),
        // Red glow flash
        Animated.sequence([
          Animated.timing(glowAlpha, { toValue: 0.4, duration: 100, useNativeDriver: true }),
          Animated.timing(glowAlpha, { toValue: 0,   duration: 500, useNativeDriver: true }),
        ]),
      ]).start(() => startIdle());
      return;
    }

    if (mood === 'thinking') {
      // Gentle side sway
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue:  1, duration: 900, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: -1, duration: 900, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue:  0, duration: 450, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
      return;
    }

    if (mood === 'celebrating') {
      // Full jump with spin
      glowRed.setValue(0);  // gold-ish via green channel
      Animated.sequence([
        // Big jump
        Animated.parallel([
          Animated.sequence([
            Animated.spring(translateY, { toValue: -28, ...AnimPreset.spring }),
            Animated.spring(translateY, { toValue: -14, ...AnimPreset.spring }),
            Animated.spring(translateY, { toValue: -22, ...AnimPreset.spring }),
            Animated.spring(translateY, { toValue:   0, ...AnimPreset.springGentle }),
          ]),
          Animated.sequence([
            Animated.spring(scaleAnim, { toValue: 1.2, ...AnimPreset.spring }),
            Animated.spring(scaleAnim, { toValue: 0.9, ...AnimPreset.spring }),
            Animated.spring(scaleAnim, { toValue: 1,   ...AnimPreset.springGentle }),
          ]),
          // Spin
          Animated.timing(rotateAnim, { toValue: 4, duration: 500, useNativeDriver: true }),
          // Gold glow
          Animated.sequence([
            Animated.timing(glowAlpha, { toValue: 0.6, duration: 200, useNativeDriver: true }),
            Animated.timing(glowAlpha, { toValue: 0,   duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => {
        rotateAnim.setValue(0);
        startIdle();
      });
      return;
    }
  }, [mood]);

  // Cleanup on unmount
  useEffect(() => () => stopIdle(), []);

  const rotate = rotateAnim.interpolate({
    inputRange:  [-1, 1, 4],
    outputRange: ['-6deg', '6deg', '360deg'],
  });

  const glowColor = glowRed.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.xpGreen, colors.red],
  });

  return (
    <View style={{ width: size, height: size + 16, alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* Glow ring behind character */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: size / 2,
            backgroundColor: glowColor as any,
            opacity: glowAlpha,
            shadowColor: glowColor as any,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 18,
          },
        ]}
      />

      {/* Character with reaction transforms */}
      <Animated.View
        style={{
          transform: [
            { translateY },
            { translateX },
            { scale: scaleAnim },
            { rotate },
          ],
        }}
      >
        <WorkerCharacter
          stage={stage}
          trackId={trackId}
          size={size}
          animate={false}      // we control animation ourselves
          mood={
            mood === 'correct'     ? 'happy'
            : mood === 'celebrating' ? 'celebrating'
            : mood === 'wrong'     ? 'focused'
            : 'neutral'
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({});
