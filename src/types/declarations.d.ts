declare module 'expo-router/entry';
declare module 'react-native-svg';

// lucide-react ships typings only for its barrel entry (package.json
// `typings: dist/lucide-react.d.ts`) -- there is no .d.ts beside any of the
// per-icon modules. src/shims/lucide-react.ts imports those icon modules
// directly to keep the ~1,600-icon barrel out of the web bundle, so without
// this declaration every one of them is a TS7016 implicit-any error.
//
// The import below is type-only and erased at compile time, so pointing it at
// the barrel costs no bundle bytes -- which is the entire point of the shim.
declare module 'lucide-react/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react';

  const icon: LucideIcon;
  export default icon;
}
