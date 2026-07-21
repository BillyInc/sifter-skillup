/**
 * Career intelligence typography loader.
 *
 * Loads the redesign faces via expo-font when the @expo-google-fonts
 * packages are installed, and degrades gracefully to the system stack otherwise
 * — so the app never blocks on fonts that aren't present yet.
 *
 *   Sans : Hanken Grotesk    (all UI text, titles, section labels)
 *   Data : Spline Sans Mono  (scores, cut-offs, salary, %, freshness)
 *
 * Legacy display roles intentionally map to Hanken so existing call sites keep
 * working without carrying the old Bricolage display voice into the redesign.
 *
 * To activate the real faces:
 *   npm i @expo-google-fonts/hanken-grotesk \
 *         @expo-google-fonts/spline-sans-mono
 * then set COMPASS_FONTS_AVAILABLE = true below. The font *names* used across the
 * app never change — only the underlying file binding does.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** Flip to true once the @expo-google-fonts packages are installed. */
export const COMPASS_FONTS_AVAILABLE = false;

const _EMOJI = [
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji', 'EmojiOne Color', 'Android Emoji',
].join(', ');

const _SYS = Platform.select({
  web: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif, ${_EMOJI}`,
  ios: 'System',
  android: 'sans-serif',
  default: undefined,
});

const _SYS_MONO = Platform.select({
  web: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace, ${_EMOJI}`,
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

/**
 * Named font roles. When COMPASS fonts are unavailable the values fall back to the
 * system stack, so `Fonts.display` etc. are always safe to spread into a style.
 */
export const Fonts = COMPASS_FONTS_AVAILABLE
  ? {
      display:      { fontFamily: 'HankenGrotesk_600SemiBold' },
      displayBold:  { fontFamily: 'HankenGrotesk_700Bold' },
      displaySemi:  { fontFamily: 'HankenGrotesk_600SemiBold' },
      body:         { fontFamily: 'HankenGrotesk_400Regular' },
      bodyMedium:   { fontFamily: 'HankenGrotesk_500Medium' },
      bodySemibold: { fontFamily: 'HankenGrotesk_600SemiBold' },
      bodyBold:     { fontFamily: 'HankenGrotesk_700Bold' },
      data:         { fontFamily: 'SplineSansMono_400Regular' },
      dataMedium:   { fontFamily: 'SplineSansMono_500Medium' },
      emoji:        _SYS ? { fontFamily: _SYS } : {},
    }
  : {
      display:      _SYS ? { fontFamily: _SYS } : {},
      displayBold:  _SYS ? { fontFamily: _SYS } : {},
      displaySemi:  _SYS ? { fontFamily: _SYS } : {},
      body:         _SYS ? { fontFamily: _SYS } : {},
      bodyMedium:   _SYS ? { fontFamily: _SYS } : {},
      bodySemibold: _SYS ? { fontFamily: _SYS } : {},
      bodyBold:     _SYS ? { fontFamily: _SYS } : {},
      data:         { fontFamily: _SYS_MONO },
      dataMedium:   { fontFamily: _SYS_MONO },
      emoji:        _SYS ? { fontFamily: _SYS } : {},
    };

/**
 * Gate for the root layout. Returns true when fonts are ready (or unavailable, so
 * the app renders immediately with the system stack). Wire into a splash gate:
 *
 *   const ready = useCompassFonts();
 *   if (!ready) return null;  // splash stays up
 */
export function useCompassFonts(): boolean {
  const [ready, setReady] = useState(!COMPASS_FONTS_AVAILABLE);

  useEffect(() => {
    if (!COMPASS_FONTS_AVAILABLE) return;
    let alive = true;
    (async () => {
      try {
        // Dynamically imported so the bundle doesn't hard-depend on packages that
        // may not be installed. Guarded by COMPASS_FONTS_AVAILABLE.
        const [Font, hanken, spline] = await Promise.all([
          import('expo-font'),
          import('@expo-google-fonts/hanken-grotesk' as string),
          import('@expo-google-fonts/spline-sans-mono' as string),
        ]);
        await Font.loadAsync({
          HankenGrotesk_400Regular: hanken.HankenGrotesk_400Regular,
          HankenGrotesk_500Medium: hanken.HankenGrotesk_500Medium,
          HankenGrotesk_600SemiBold: hanken.HankenGrotesk_600SemiBold,
          HankenGrotesk_700Bold: hanken.HankenGrotesk_700Bold,
          SplineSansMono_400Regular: spline.SplineSansMono_400Regular,
          SplineSansMono_500Medium: spline.SplineSansMono_500Medium,
        });
      } catch {
        // Packages missing or load failed — fall through to system stack.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return ready;
}
