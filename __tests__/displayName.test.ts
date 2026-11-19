import {
  DISPLAY_NAME_MAX,
  supportsDisplayName,
  getDisplayName,
  getDisplayNameOr,
  getGreetingName,
  NAME_TO_SHOW_MAX,
  sanitizeNameToShow,
} from '../src/lib/displayName';

describe('getDisplayName', () => {
  it('prefers display_name, then username, then first name', () => {
    const u = { display_name: 'Ada', username: 'Ada Lovelace', first_name: 'Augusta' };
    expect(getDisplayName(u)).toBe('Ada');
    expect(getDisplayName({ ...u, display_name: null })).toBe('Ada Lovelace');
    expect(getDisplayName({ ...u, display_name: '  ', username: 'Student' })).toBe('Augusta');
    expect(getGreetingName({ display_name: 'Ada B', username: 'Legal Full Name' })).toBe('Ada');
  });
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

describe('display_name support', () => {
  it('feature-detects the key on the user payload', () => {
    expect(supportsDisplayName({ username: 'x' })).toBe(false);
    expect(supportsDisplayName({ display_name: null })).toBe(true);
    expect(supportsDisplayName({ display_name: 'Ada' })).toBe(true);
    expect(supportsDisplayName(null)).toBe(false);
  });
  it('applies the 2-30 limit when asked', () => {
    expect(sanitizeNameToShow('x'.repeat(31), DISPLAY_NAME_MAX).ok).toBe(false);
    expect(sanitizeNameToShow('A', DISPLAY_NAME_MAX).ok).toBe(false);
    expect(sanitizeNameToShow('Ada', DISPLAY_NAME_MAX)).toEqual({ ok: true, value: 'Ada' });
  });
});
