/**
 * Sifter Skill_Up — Base MiniKit Configuration
 *
 * This file configures the app for the Base App mini-app store.
 * After April 9 2026 Base moved to standard web app + wallet model (no Farcaster SDK).
 *
 * Steps to publish:
 *  1. Deploy to Vercel / your hosting
 *  2. Go to base.dev/preview → paste your domain → generate accountAssociation
 *  3. Paste the accountAssociation below
 *  4. Register at base.dev with primaryUrl, category, screenshots
 *
 * Auth: SIWE (Sign-In with Ethereum) via wagmi — see AuthScreen.tsx
 * No Farcaster SDK — standard web + injected wallet (window.ethereum)
 */

const ROOT_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sifterskillup.com';

export const minikitConfig = {
  accountAssociation: {
    // Generated via base.dev/preview — paste here after deployment
    header: '',
    payload: '',
    signature: '',
  },
  miniapp: {
    version: '1',
    name: 'Sifter Skill_Up',
    subtitle: 'Master crypto & career skills',
    description: 'From complete beginner to hire-ready professional. 270+ crypto levels, supply chain analyst track, onchain sleuth, quantitative finance. Guilds, streaks, portfolio push. Works offline.',
    screenshotUrls: [
      `${ROOT_URL}/screenshots/island-map.png`,
      `${ROOT_URL}/screenshots/lesson-screen.png`,
      `${ROOT_URL}/screenshots/skills-screen.png`,
      `${ROOT_URL}/screenshots/community.png`,
    ],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: '#0a0a0a',
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: 'education',
    tags: ['crypto', 'education', 'career', 'skills', 'supply-chain', 'quant', 'defi', 'offline'],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: 'Master crypto & career skills',
    ogTitle: 'Sifter Skill_Up — Real Skills. Real Careers.',
    ogDescription: 'The only platform that teaches crypto AND career tracks in one place. Supply Chain, Quant Finance, Onchain Sleuth — all with verified portfolio artifacts.',
    ogImageUrl: `${ROOT_URL}/og.png`,
  },
} as const;

/**
 * wagmi config for Base App (standard web app path)
 * Used in index.web.tsx when running as a web app / Base Mini App
 *
 * Install: npm install wagmi viem @tanstack/react-query @base-org/account
 */
export const wagmiConfigCode = `
import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),                    // MetaMask, Coinbase Wallet in-browser
    baseAccount({ appName: 'Sifter Skill_Up' }),  // Base App native wallet
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: { [base.id]: http() },
});
`;
