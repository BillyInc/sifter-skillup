import * as fs from 'fs';
import * as path from 'path';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

describe('screens showing other users use public_name', () => {
  const screens = [
    'src/screens/LeaderboardScreen.tsx',
    'src/screens/GuildScreen.tsx',
    'src/screens/ReferralScreen.tsx',
    'src/components/RoomMessage.tsx',
  ];

  it.each(screens)('%s renders getPublicName and not a raw username', (file) => {
    const src = read(file);
    expect(src).toContain('getPublicName');
    expect(src).not.toMatch(/\{\s*(entry|m|msg|r)\.username\b/);
    expect(src).not.toMatch(/\{message\.author_username\}/);
  });

  it('TrackRoomScreen posts the public name, not the legal-name username', () => {
    const src = read('src/screens/TrackRoomScreen.tsx');
    expect(src).toContain('getOwnPublicName(user)');
    expect(src).not.toMatch(/author_username:\s*user\?\.username/);
  });

  it('GitHub portfolio files and reminder push do not use the legal-name username', () => {
    expect(read('src/screens/GitHubScreen.tsx')).not.toMatch(/const name = user\?\.username/);
    expect(read('src/screens/NotificationSettingsScreen.tsx')).not.toMatch(/userName: user\.username/);
  });
});
