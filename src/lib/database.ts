/**
 * Sifter Skill_Up — WatermelonDB Database Singleton
 *
 * - On native (iOS/Android): uses WatermelonDB with the SQLite adapter.
 * - On web: returns null (the offline storage layer falls back to
 *   AsyncStorage / IndexedDB). The WatermelonDB Node SQLite adapter
 *   pulls in `better-sqlite3` which would break the web bundle.
 */

import { Platform } from 'react-native';

let database: any = null;

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Database } = require('@nozbe/watermelondb');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { schema } = require('./watermelonSchema');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const models = require('./watermelonModels');

    const adapter = new SQLiteAdapter({
      schema,
      jsi: true,
      onSetUpError: (error: any) => {
        // eslint-disable-next-line no-console
        console.error('[WatermelonDB] Setup error:', error);
      },
    });

    database = new Database({
      adapter,
      modelClasses: Object.values(models).filter((m: any) => m?.table),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      '[WatermelonDB] Not available — using AsyncStorage fallback.',
      'Install with: npx expo install @nozbe/watermelondb',
    );
  }
}

export { database };
