/**
 * Sifter LevelUp — WatermelonDB Database Singleton
 * Safe import — falls back gracefully if @nozbe/watermelondb not installed.
 * Install: npx expo install @nozbe/watermelondb
 */

import { Platform } from 'react-native';

let database: any = null;

try {
  const { Database } = require('@nozbe/watermelondb');
  const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
  const { schema } = require('./watermelonSchema');
  const models = require('./watermelonModels');

  const adapter = new SQLiteAdapter({
    schema,
    jsi: Platform.OS !== 'web',
    onSetUpError: (error: any) => {
      console.error('[WatermelonDB] Setup error:', error);
    },
  });

  database = new Database({
    adapter,
    modelClasses: Object.values(models).filter((m: any) => m?.table),
  });
} catch (e) {
  console.warn('[WatermelonDB] Not available — using AsyncStorage fallback. Install with: npx expo install @nozbe/watermelondb');
}

export { database };
