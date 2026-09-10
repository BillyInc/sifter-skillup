/**
 * Career intelligence typography loader.
 *
 * Loads the redesign faces via expo-font when the @expo-google-fonts
 * packages are installed, and degrades gracefully to the system stack otherwise
 * — so the app never blocks on fonts that aren't present yet.
 *
 *   Sans : Inter             (all UI text, titles, section labels)
 *   Data : Spline Sans Mono  (scores, salary, %, freshness)
 *
 * Legacy display roles intentionally map to Inter so existing call sites keep
 * working without carrying the old Bricolage display voice into the redesign.
 *
 * To activate the real faces:
 *   npm i @expo-google-fonts/inter \
 *         @expo-google-fonts/spline-sans-mono
 * then set COMPASS_FONTS_AVAILABLE = true below. The font *names* used across the
 * app never change — only the underlying file binding does.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** Flip to true once the @expo-google-fonts packages are installed. */
export const COMPASS_FONTS_AVAILABLE = true;

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
      display:      { fontFamily: 'Inter_600SemiBold' },
      displayBold:  { fontFamily: 'Inter_700Bold' },
      displaySemi:  { fontFamily: 'Inter_600SemiBold' },
      body:         { fontFamily: 'Inter_400Regular' },
      bodyMedium:   { fontFamily: 'Inter_500Medium' },
      bodySemibold: { fontFamily: 'Inter_600SemiBold' },
      bodyBold:     { fontFamily: 'Inter_700Bold' },
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
        //
        // Per-weight subpaths, NOT the package barrel. `@expo-google-fonts/inter`
        // re-exports all 18 variants -- every weight plus every italic -- and the
        // bundler cannot tree-shake a `require()` of a .ttf, so importing the
        // barrel shipped roughly 6MB of fonts to load the four faces this app
        // actually renders. Inter has no "exports" map, so the subpath is the
        // directory: @expo-google-fonts/inter/400Regular.
        const [Font, i400, i500, i600, i700, s400, s500] = await Promise.all([
          import('expo-font'),
          import('@expo-google-fonts/inter/400Regular' as string),
          import('@expo-google-fonts/inter/500Medium' as string),
          import('@expo-google-fonts/inter/600SemiBold' as string),
          import('@expo-google-fonts/inter/700Bold' as string),
          import('@expo-google-fonts/spline-sans-mono/400Regular' as string),
          import('@expo-google-fonts/spline-sans-mono/500Medium' as string),
        ]);
        await Font.loadAsync({
          Inter_400Regular: i400.Inter_400Regular,
          Inter_500Medium: i500.Inter_500Medium,
          Inter_600SemiBold: i600.Inter_600SemiBold,
          Inter_700Bold: i700.Inter_700Bold,
          SplineSansMono_400Regular: s400.SplineSansMono_400Regular,
          SplineSansMono_500Medium: s500.SplineSansMono_500Medium,
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
