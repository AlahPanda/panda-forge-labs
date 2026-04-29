/** Launchers catalogue + AstralRinth downloads (via Ouo.io). */

export type FeatureMark = '✔️' | '✖️' | '⚠️';

export interface LauncherFeatureRow {
  platforms: FeatureMark;
  modpackFormats: FeatureMark;
  perfInstances: FeatureMark;
  authOffline: FeatureMark;
  openSafe: FeatureMark;
  beginnerAdvanced: FeatureMark;
}

export interface LauncherItem {
  id: string;
  name: string;
  description: string;
  /** Astral-first product card */
  recommended?: boolean;
  trendingLabel?: string;
  secondaryBadge?: string;
  /** Modal options (Ouo.io) — only for AstralRinth */
  ouoDownloads?: Array<{ label: string; url: string }>;
  /** Direct official download/support page */
  officialDownloadUrl?: string;
  features: LauncherFeatureRow;
}

export const ASTRAL_DOWNLOADS = [
  { label: 'Windows (.exe)', url: 'https://ouo.io/Hs6To1' },
  { label: 'macOS (ARM/M1/M2)', url: 'https://ouo.io/8kxZK3' },
  { label: 'Linux (.deb)', url: 'https://ouo.io/wDKBhZQ' },
  { label: 'Linux (.rpm)', url: 'https://ouo.io/9m7bL3' },
  { label: 'Linux (.AppImage)', url: 'https://ouo.io/jO6D1I' },
] as const satisfies ReadonlyArray<{ label: string; url: string }>;

export const launchersCatalog: LauncherItem[] = [
  {
    id: 'astralrinth',
    name: 'AstralRinth',
    trendingLabel: '🔥 TRENDING',
    secondaryBadge: 'RECOMMENDED',
    recommended: true,
    ouoDownloads: [...ASTRAL_DOWNLOADS],
    description:
      'Our recommended launcher — built around a fast workflow, clear installs, and strong defaults for Minecraft modded play. Use the modal to pick builds for Windows, macOS ARM, or Linux (.deb/.rpm/AppImage).',
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
  },
  {
    id: 'prism',
    name: 'Prism Launcher',
    officialDownloadUrl: 'https://prismlauncher.org/download/',
    description:
      'A popular open launcher for juggling multiple Minecraft instances and loaders. Loved by power-users who want control, profiles without clutter, and repeatable setups.',
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '✔️',
      openSafe: '✔️',
      beginnerAdvanced: '⚠️',
    },
  },
  {
    id: 'modrinth-app',
    name: 'Modrinth App',
    officialDownloadUrl: 'https://modrinth.com/app',
    description:
      'The Modrinth client for discovering, downloading, and running content from Modrinth. Great fit if Modrinth-first discovery and installs are central to how you build worlds.',
    features: {
      platforms: '✔️',
      modpackFormats: '✔️',
      perfInstances: '✔️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
  },
  {
    id: 'sklauncher',
    name: 'SKLauncher',
    officialDownloadUrl: 'https://skmedix.pl/downloads',
    description:
      'Known for approachable packaging and frictionless setup for many setups. Practical when you prefer a launcher that hides complexity unless you intentionally look for advanced toggles.',
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '⚠️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '⚠️',
    },
  },
  {
    id: 'atlauncher',
    name: 'ATLauncher',
    officialDownloadUrl: 'https://atlauncher.com/downloads',
    description:
      'A long-standing launcher designed around curated pack flows and repeatable installs — especially useful when you install many community packs across versions.',
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '✔️',
      openSafe: '⚠️',
      beginnerAdvanced: '⚠️',
    },
  },
  {
    id: 'curseforge-app',
    name: 'CurseForge App',
    officialDownloadUrl: 'https://www.curseforge.com/download/app',
    description:
      'The official companion for discovering and importing from the broader CurseForge ecosystem. Fits teams and players anchored on packs distributed through CF.',
    features: {
      platforms: '✔️',
      modpackFormats: '✔️',
      perfInstances: '⚠️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
  },
  {
    id: 'multimc',
    name: 'MultiMC',
    officialDownloadUrl: 'https://multimc.org/download',
    description:
      'A launcher classic tightly focused on multiple profiles and repeatable environments. Lightweight at its core — excellent when separation of instances beats heavy UI wrappers.',
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '✔️',
      openSafe: '⚠️',
      beginnerAdvanced: '⚠️',
    },
  },
  {
    id: 'gdlauncher',
    name: 'GDLauncher',
    officialDownloadUrl: 'https://gdlauncher.com/',
    description:
      'A polish-first launcher emphasizing discoverability for modded content plus friendlier visuals for onboarding. Balances approachable navigation with richer mod/instance management.',
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
  },
];
