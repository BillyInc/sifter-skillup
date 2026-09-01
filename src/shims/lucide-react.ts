// Barrel-narrowing shim for lucide-react.
//
// lucide-react is NOT a direct dependency -- it arrives transitively via
// @privy-io/react-auth, whose compiled output imports it 30 times as
// `import{Icon,...}from"lucide-react"`. That barrel re-exports ~1,600 icons,
// and Metro does not tree-shake ESM barrels, so every icon in the package
// lands in the web entry chunk: 1,469,946 bytes of source, the single largest
// avoidable contributor after the wallet SDKs themselves.
//
// This file re-exports only the 29 icons Privy actually imports, each from its
// own module path, so the barrel is never pulled in. metro.config.js aliases
// the bare specifier `lucide-react` to this file; the deep
// `lucide-react/dist/esm/...` paths below do not match that alias, so there is
// no resolution cycle.
//
// The name -> file mapping is generated from lucide-react's own
// dist/esm/lucide-react.js export map, not hand-derived: the filenames do not
// follow from the export names (AlertCircle lives in circle-alert.js,
// FingerprintIcon in fingerprint-pattern.js). If Privy is upgraded and imports
// an icon that is not re-exported here, the web build fails loudly at that
// import rather than silently rendering nothing.
//
// Regenerate the list with:
//   grep -rho 'import{[^}]*}from"lucide-react"' node_modules/@privy-io/react-auth/dist/

export { default as AlertCircle } from 'lucide-react/dist/esm/icons/circle-alert.js';
export { default as AlertTriangle } from 'lucide-react/dist/esm/icons/triangle-alert.js';
export { default as ArrowRightLeft } from 'lucide-react/dist/esm/icons/arrow-right-left.js';
export { default as Ban } from 'lucide-react/dist/esm/icons/ban.js';
export { default as Building } from 'lucide-react/dist/esm/icons/building.js';
export { default as Check } from 'lucide-react/dist/esm/icons/check.js';
export { default as CheckCircle } from 'lucide-react/dist/esm/icons/circle-check-big.js';
export { default as ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down.js';
export { default as ChevronRight } from 'lucide-react/dist/esm/icons/chevron-right.js';
export { default as CloudUpload } from 'lucide-react/dist/esm/icons/cloud-upload.js';
export { default as Copy } from 'lucide-react/dist/esm/icons/copy.js';
export { default as CreditCard } from 'lucide-react/dist/esm/icons/credit-card.js';
export { default as Edit } from 'lucide-react/dist/esm/icons/square-pen.js';
export { default as ExternalLink } from 'lucide-react/dist/esm/icons/external-link.js';
export { default as FileCheck } from 'lucide-react/dist/esm/icons/file-check.js';
export { default as FingerprintIcon } from 'lucide-react/dist/esm/icons/fingerprint-pattern.js';
export { default as HelpCircle } from 'lucide-react/dist/esm/icons/circle-question-mark.js';
export { default as Hourglass } from 'lucide-react/dist/esm/icons/hourglass.js';
export { default as Landmark } from 'lucide-react/dist/esm/icons/landmark.js';
export { default as Lock } from 'lucide-react/dist/esm/icons/lock.js';
export { default as Mail } from 'lucide-react/dist/esm/icons/mail.js';
export { default as Phone } from 'lucide-react/dist/esm/icons/phone.js';
export { default as Smartphone } from 'lucide-react/dist/esm/icons/smartphone.js';
export { default as Trash2 } from 'lucide-react/dist/esm/icons/trash-2.js';
export { default as UserCheck } from 'lucide-react/dist/esm/icons/user-check.js';
export { default as UserCircle } from 'lucide-react/dist/esm/icons/circle-user.js';
export { default as Wallet } from 'lucide-react/dist/esm/icons/wallet.js';
export { default as X } from 'lucide-react/dist/esm/icons/x.js';
export { default as XCircle } from 'lucide-react/dist/esm/icons/circle-x.js';
