// Barrel-narrowing shim for @heroicons/react/24/outline.
//
// Same mechanism as src/shims/lucide-react.ts, and the same origin: heroicons
// is not a direct dependency, it arrives via @privy-io/react-auth. Privy is
// mostly well-behaved here and imports icons by deep path, but three of its
// compiled modules import the barrel instead:
//
//   import{MagnifyingGlassIcon as l}from"@heroicons/react/24/outline"
//   import{BoltIcon as i,ArrowRightIcon as o,ChevronDownIcon as t}from"..."
//   import{PlusIcon as ze}from"@heroicons/react/24/outline"
//
// Metro does not tree-shake ESM barrels, so those three imports pull the whole
// outline set into the web entry chunk: 367 source files, 378,687 bytes, to
// serve the five icons named above.
//
// Unlike lucide, the export names map straight onto the filenames, so this list
// needs no generated lookup table.
//
// metro.config.js aliases '@heroicons/react/24/outline' to this file. The deep
// paths below are children of that specifier and DO resolve back through it --
// unlike lucide's 'lucide-react/dist/esm/icons/...', which shares no subpath
// with its alias. Without a guard the alias fires again on each of them and
// Metro recurses until the stack blows: a bare SIGSEGV during "Starting Metro
// Bundler" with no JS error to read. resolveRequest skips the alias when the
// request originates from the alias target, which is what makes this safe.
//
// If Privy is upgraded and imports an icon that is not re-exported here, the
// web build fails at that import rather than silently rendering nothing.
//
// Regenerate the list with:
//   grep -rhoE 'import\{[^}]{0,300}\}from"@heroicons/react/24/outline"' \
//     node_modules/@privy-io/react-auth/dist/esm/*.mjs

export { default as ArrowRightIcon } from '@heroicons/react/24/outline/ArrowRightIcon.js';
export { default as BoltIcon } from '@heroicons/react/24/outline/BoltIcon.js';
export { default as ChevronDownIcon } from '@heroicons/react/24/outline/ChevronDownIcon.js';
export { default as MagnifyingGlassIcon } from '@heroicons/react/24/outline/MagnifyingGlassIcon.js';
export { default as PlusIcon } from '@heroicons/react/24/outline/PlusIcon.js';
