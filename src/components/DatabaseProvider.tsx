/**
 * Sifter Skill_Up — DatabaseProvider
 * Wraps app with WatermelonDB context. Falls back gracefully if not installed.
 * Install WatermelonDB: npx expo install @nozbe/watermelondb
 */
import React, { ReactNode } from 'react';

interface Props { children: ReactNode; }

let WatermelonProvider: any = null;
try {
  WatermelonProvider = require('@nozbe/watermelondb/react').DatabaseProvider;
} catch {}

export function DatabaseProvider({ children }: Props) {
  const { database } = require('../lib/database');
  if (WatermelonProvider && database) {
    return <WatermelonProvider database={database}>{children}</WatermelonProvider>;
  }
  // Fallback: render children without WatermelonDB context
  return <>{children}</>;
}
