import { AVATAR_PRESETS, avatarUrlForPreset, getAvatarPreset } from '../src/lib/avatarPresets';

describe('avatar presets', () => {
  it('round-trips every preset through its stored identifier', () => {
    for (const preset of AVATAR_PRESETS) {
      expect(getAvatarPreset(avatarUrlForPreset(preset.id))).toBe(preset);
    }
  });
  it('keeps stored identifiers short', () => {
    for (const preset of AVATAR_PRESETS) expect(avatarUrlForPreset(preset.id).length).toBeLessThanOrEqual(24);
  });
  it('ignores empty, unknown and remote URL values', () => {
    expect(getAvatarPreset(null)).toBeNull();
    expect(getAvatarPreset('')).toBeNull();
    expect(getAvatarPreset('preset:nope')).toBeNull();
    expect(getAvatarPreset('https://example.com/a.png')).toBeNull();
  });
});
