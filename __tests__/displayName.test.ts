import {
  getDisplayName,
  getDisplayNameOr,
  getGreetingName,
  NAME_TO_SHOW_MAX,
  sanitizeNameToShow,
} from '../src/lib/displayName';

describe('getDisplayName', () => {
  it('prefers username over first name', () => {
    expect(getDisplayName({ username: 'Ada Lovelace', first_name: 'Augusta' })).toBe('Ada Lovelace');
  });
  it('falls back to first name when username is a placeholder or empty', () => {
    expect(getDisplayName({ username: 'Student', first_name: 'Ada' })).toBe('Ada');
    expect(getDisplayName({ username: '  ', first_name: 'Ada' })).toBe('Ada');
    expect(getDisplayName({ username: null, first_name: 'Ada' })).toBe('Ada');
  });
  it('never returns the generic placeholders', () => {
    expect(getDisplayName({ username: 'Student' })).toBeNull();
    expect(getDisplayName({ username: 'guest' })).toBeNull();
    expect(getDisplayName(null)).toBeNull();
  });
  it('collapses whitespace', () => {
    expect(getDisplayName({ username: '  Ada   Lovelace ' })).toBe('Ada Lovelace');
  });
});

describe('greeting and fallback', () => {
  it('uses the first word for greetings', () => {
    expect(getGreetingName({ username: 'Ada Lovelace' })).toBe('Ada');
    expect(getGreetingName({ username: 'Student' })).toBeNull();
  });
  it('returns the caller fallback only when no name exists', () => {
    expect(getDisplayNameOr({ username: 'Ada' }, 'Account')).toBe('Ada');
    expect(getDisplayNameOr({ username: 'Student' }, 'Account')).toBe('Account');
  });
});

describe('sanitizeNameToShow', () => {
  it('trims and accepts a normal name', () => {
    expect(sanitizeNameToShow('  Ada  ')).toEqual({ ok: true, value: 'Ada' });
  });
  it('rejects empty, placeholder and over-long input', () => {
    expect(sanitizeNameToShow('   ').ok).toBe(false);
    expect(sanitizeNameToShow('Student').ok).toBe(false);
    expect(sanitizeNameToShow('x'.repeat(NAME_TO_SHOW_MAX + 1)).ok).toBe(false);
  });
});
