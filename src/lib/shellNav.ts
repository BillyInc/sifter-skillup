export type NavId =
  | 'home'
  | 'explore'
  | 'build'
  | 'entrepreneurship'
  | 'opportunities'
  | 'myworld'
  | 'profile';

/** Which top-level destination a pathname belongs to (sidebar active state). */
export function getActiveNavId(pathname: string | null): NavId {
  if (!pathname) return 'home';
  if (pathname.includes('/profile') || pathname.includes('/settings')) return 'profile';
  if (pathname === '/build' || pathname.startsWith('/build/')) return 'build';
  if (pathname.includes('/pathways/entrepreneurship')) return 'entrepreneurship';
  if (pathname.includes('/explore') || pathname.includes('/programme')
    || pathname.includes('/domain') || pathname.includes('/role')) return 'explore';
  if (pathname.includes('/opportunities') || pathname.includes('/opportunity')
    || pathname.includes('/company') || pathname.includes('/scholarship')) return 'opportunities';
  // Everything from the legacy learning app now lives under My World.
  if (
    pathname.includes('/myworld')
    || pathname.includes('/map') || pathname.includes('/world')
    || pathname.includes('/starknet-track') || pathname.includes('/ecosystem-track')
    || pathname.includes('/cairo-builder-track') || pathname.includes('/track-room')
    || pathname.includes('/quant') || pathname.includes('/fields') || pathname.includes('/skills')
    || pathname.includes('/guild') || pathname.includes('/community')
    || pathname.includes('/portfolio') || pathname.includes('/streaks')
    || pathname.includes('/feed') || pathname.includes('/merchandise')
  ) return 'myworld';
  if (pathname.includes('/home')) return 'home';
  return 'home';
}
