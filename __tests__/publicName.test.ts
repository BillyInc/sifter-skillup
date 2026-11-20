import { getPublicName, getOwnPublicName, NEUTRAL_PUBLIC_NAME } from '../src/lib/publicName';
import { getDisplayName } from '../src/lib/displayName';

describe('getPublicName (other users)', () => {
  it('uses the server public_name, never the legacy username', () => {
    expect(getPublicName({ public_name: 'Adaeze', username: 'Adaeze Chinwe Okafor' })).toBe('Adaeze');
  });

  it('falls back to the legacy field only when public_name is absent (older server)', () => {
    expect(getPublicName({ username: 'Legacy' })).toBe('Legacy');
    expect(getPublicName({ author_username: 'Legacy Author' })).toBe('Legacy Author');
  });

  it('is neutral when nothing is available', () => {
    expect(getPublicName(null)).toBe(NEUTRAL_PUBLIC_NAME);
    expect(getPublicName({})).toBe('Learner');
    expect(getPublicName({}, 'Member')).toBe('Member');
  });
});

describe('getOwnPublicName (own name published to others)', () => {
  it('prefers display_name, then first name only, never username', () => {
    const u = { display_name: 'Ada', first_name: 'Adaeze', username: 'Adaeze Chinwe Okafor' };
    expect(getOwnPublicName(u)).toBe('Ada');
    expect(getOwnPublicName({ ...u, display_name: null })).toBe('Adaeze');
    expect(getOwnPublicName({ username: 'Adaeze Chinwe Okafor' })).toBe('Learner');
  });

  it('never publishes an email-like or placeholder value', () => {
    expect(getOwnPublicName({ display_name: 'a@b.com', first_name: 'Student' })).toBe('Learner');
    expect(getOwnPublicName(null)).toBe('Learner');
  });

  it('keeps the owner own display via getDisplayName', () => {
    const u = { display_name: null, username: 'Adaeze Chinwe Okafor', first_name: 'Adaeze' };
    expect(getDisplayName(u)).toBe('Adaeze Chinwe Okafor');
    expect(getOwnPublicName(u)).toBe('Adaeze');
  });
});
