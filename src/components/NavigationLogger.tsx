/**
 * NavigationLogger — stub for expo-router compatibility
 * Original used @react-navigation/native which is not installed.
 * Expo Router handles routing — navigation logging via console.
 */
import React from 'react';

export function NavigationLogger() {
  return null; // No-op: expo-router handles routing internally
}

export default NavigationLogger;
