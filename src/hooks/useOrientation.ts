/**
 * Sifter Skill_Up — useOrientation
 *
 * NEW FILE: src/hooks/useOrientation.ts
 *
 * Tracks device orientation reactively.
 * Uses expo-screen-orientation (already in Expo SDK).
 *
 * Returns:
 *   orientation  — 'portrait' | 'landscape'
 *   isPortrait   — boolean shorthand
 *   isLandscape  — boolean shorthand
 *   width        — current screen width
 *   height       — current screen height
 *
 * Install expo-screen-orientation if not already:
 *   npx expo install expo-screen-orientation
 */

import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
let ScreenOrientation: any = null;
try { ScreenOrientation = require('expo-screen-orientation'); } catch {}

export type OrientationValue = 'portrait' | 'landscape';

export interface OrientationState {
  orientation: OrientationValue;
  isPortrait:  boolean;
  isLandscape: boolean;
  width:       number;
  height:      number;
}

function _derive(width: number, height: number): OrientationValue {
  return width >= height ? 'landscape' : 'portrait';
}

export function useOrientation(): OrientationState {
  const initial = Dimensions.get('window');
  const [width,       setWidth]       = useState(initial.width);
  const [height,      setHeight]      = useState(initial.height);
  const [orientation, setOrientation] = useState<OrientationValue>(
    _derive(initial.width, initial.height)
  );

  useEffect(() => {
    // Dimensions listener handles rotation reliably on both iOS and Android
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
      setHeight(window.height);
      setOrientation(_derive(window.width, window.height));
    });

    // Also subscribe to expo-screen-orientation for locked orientations
    // (some devices/tablets report Dimensions changes late)
    let orientationSub: ScreenOrientation.Subscription;

    if (ScreenOrientation) {
      ScreenOrientation.getOrientationAsync().then((o: any) => {
        const isLand = o === ScreenOrientation.Orientation.LANDSCAPE_LEFT
                    || o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        setOrientation(isLand ? 'landscape' : 'portrait');
      }).catch(() => {});
      orientationSub = ScreenOrientation.addOrientationChangeListener((e: any) => {
        const o = e.orientationInfo.orientation;
        const isLand = o === ScreenOrientation.Orientation.LANDSCAPE_LEFT
                    || o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        setOrientation(isLand ? 'landscape' : 'portrait');
      });
    }

    return () => {
      sub.remove();
      if (ScreenOrientation && orientationSub) ScreenOrientation.removeOrientationChangeListener(orientationSub);
    };
  }, []);

  return {
    orientation,
    isPortrait:  orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    width,
    height,
  };
}
