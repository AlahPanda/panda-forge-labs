/** Launchers catalogue — summary for cards, richer content on `/launchers/:slug`. */

export type FeatureMark = '✔️' | '✖️' | '⚠️';

export interface LauncherFeatureRow {
  platforms: FeatureMark;
  modpackFormats: FeatureMark;
  perfInstances: FeatureMark;
  authOffline: FeatureMark;
  openSafe: FeatureMark;
  beginnerAdvanced: FeatureMark;
}

export interface LauncherFAQ {
  q: string;
  a: string;
}

export interface LauncherItem {
  id: string;
  name: string;
  /** Our subtle pick flag — only AstralRinth today */
  recommended?: boolean;
  /** Card blurb (~2 lines) */
  summary: string;
  /** Lead paragraph on detail page */
  detailIntro: string;
  detailParagraphs: string[];
  downloads: Array<{ label: string; url: string }>;
  features: LauncherFeatureRow;
  faqs: LauncherFAQ[];
}

/** AstralRinth — platform builds (ouo.io) */
const ASTRAL_DOWNLOADS = [
  { label: 'Windows (.exe)', url: 'https://ouo.io/Hs6To1' },
  { label: 'macOS (ARM/M1/M2)', url: 'https://ouo.io/8kxZK3' },
  { label: 'Linux (.deb)', url: 'https://ouo.io/wDKBhZQ' },
  { label: 'Linux (.rpm)', url: 'https://ouo.io/9m7bL3' },
  { label: 'Linux (.AppImage)', url: 'https://ouo.io/jO6D1I' },
];

export const launchersCatalog: LauncherItem[] = [
  {
    id: 'astralrinth',
    name: 'AstralRinth',
    recommended: true,
    summary:
      'The launcher we recommend for everyday modded play — clear installs, desktop packages for Win/macOS/Linux, and workflows we align tutorials with.',
    detailIntro:
      'AstralRinth is AlahPanda Labs’ launcher of choice when we document installs and support tickets. It is designed to shorten the gap between downloading a profile and jumping into Minecraft, without hiding power settings when you need them.',
    detailParagraphs: [
      'Across Windows and Apple Silicon builds you get installers matched to typical hardware we see in Discord. Linux users can pick DEB, RPM, or AppImage depending on distro packaging norms — pick what matches how you normally install GUI apps.',
      'Modpack ingestion depends on upstream formats and loaders; what matters is repeatable instances and sane defaults — which is exactly where Astral sees most of its daily-use polish.',
      'Privacy and openness trade-offs mirror most proprietary launchers: you get cohesive UX, ongoing fixes, but you should weigh that against OSS alternatives if redistribution rights matter to your project.',
    ],
    downloads: ASTRAL_DOWNLOADS,
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
    faqs: [
      {
        q: 'Which download should I pick on Linux?',
        a: 'Prefer .deb on Debian/Ubuntu lines, .rpm on Fedora/OpenSUSE, and AppImage if you keep everything portable or dislike package managers touching dependencies.',
      },
      {
        q: 'Will this replace Prism or MultiMC for me?',
        a: 'Maybe. Astral thrives when you want a guided path tuned to our mods and labs content. Prism/MultiMC still edge ahead if splitting dozens of obscure instances is most of what you do.',
      },
      {
        q: 'Microsoft account versus offline?',
        a: 'Microsoft login matches modern Mojang defaults; offline availability depends on how you provision accounts legally — follow Mojang/Microsoft terms wherever you roam.',
      },
      {
        q: 'Why ouo.io links?',
        a: 'We route downloads through ouo.io for bookkeeping; each button below still resolves to your chosen package and opens in a new tab.',
      },
    ],
  },
  {
    id: 'prism',
    name: 'Prism Launcher',
    summary:
      'Open-source, instance-first launcher — excellent if you crave transparent profiles across Fabric, Forge, and endless split environments.',
    detailIntro:
      'Prism continues the Prism/Multi lineage for modders who obsess over cleanly separated instances rather than flashy discovery surfaces.',
    detailParagraphs: [
      'Because it inherits MultiMC philosophies, Prism rewards users who rename instances, micromanage per-profile Java arguments, or keep parallel MC versions sandboxed.',
      'CurseForge/Modrinth compatibility depends on loaders and manifests you import — Prism does not magically unify every storefront, but integrates well when feeds already exist locally.',
      'Upstream sources change frequently — keep an eye on the official download page whenever launcher regulations or auth libraries shift underneath.',
    ],
    downloads: [{ label: 'Prism Launcher · official downloads', url: 'https://prismlauncher.org/download/' }],
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '✔️',
      openSafe: '✔️',
      beginnerAdvanced: '⚠️',
    },
    faqs: [
      {
        q: 'Is Prism beginner friendly?',
        a: 'It can be intimidating at first glance because tabs talk about cores, workspaces, and log windows. Spend ten minutes structuring one instance cleanly and momentum builds fast.',
      },
      {
        q: 'Does it automatically download CurseForge modpacks?',
        a: 'You can consume compatible feeds imported from manifests; always verify what each pack author distributes and whether third-party tooling still matches current CF rules.',
      },
      {
        q: 'Compared to Astral?',
        a: 'Choose Prism when open-source pedigree and obsessive instance management matter most; Astral when you want tighter alignment with our lab defaults.',
      },
    ],
  },
  {
    id: 'modrinth-app',
    name: 'Modrinth App',
    summary:
      'Purpose-built surfacing for Modrinth-hosted projects — strong when Modrinth is already your canon for packs and updates.',
    detailIntro:
      'Think of Modrinth App less as generic Minecraft plumbing and more as the Modrinth ecosystem front door stitched into GUI form.',
    detailParagraphs: [
      'Discovery and diffing packs stay close to upstream Modrinth updates, reducing copy/paste hunts when announcements hit Discord.',
      'Because it aligns so tightly with one ecosystem, bridging CurseForge-only packs occasionally takes extra hoops — plan accordingly.',
    ],
    downloads: [{ label: 'Modrinth App · download', url: 'https://modrinth.com/app' }],
    features: {
      platforms: '✔️',
      modpackFormats: '✔️',
      perfInstances: '✔️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
    faqs: [
      {
        q: 'Best use case?',
        a: 'Creators distributing Modrinth manifests or players subscribing to nightly updates hosted there.',
      },
      {
        q: 'What if my pack exists only on CurseForge?',
        a: 'You may export manually or migrate — check author instructions; some workloads still hinge on CF-specific tooling.',
      },
    ],
  },
  {
    id: 'sklauncher',
    name: 'SKLauncher',
    summary:
      'Straightforward SK distribution channel — helpful when simplicity beats toggling ten advanced dialogs before first launch.',
    detailIntro:
      'SKLauncher surfaces the essentials quietly: install, authenticate, spawn instance. Tweaks emerge only once you purposely dig.',
    detailParagraphs: [
      'That philosophy helps newcomers rotating into modded SMP communities who only need reassurance that Java + loaders stay bundled.',
      'Because SK targets lightweight UX, heavyweight engineers may still gravitate toward Prism/GD once automation demands escalate.',
    ],
    downloads: [{ label: 'SKLauncher · downloads page', url: 'https://skmedix.pl/downloads' }],
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '⚠️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '⚠️',
    },
    faqs: [
      {
        q: 'Safe to use?',
        a: 'Download only from vendor-owned domains; skim release notes anytime binaries update — same hygiene as any launcher not delivered through a store marketplace.',
      },
      {
        q: 'Compared to bundled launchers?',
        a: 'If you crave Modrinth or Curse native flows, heavier catalogs may behave better — SK excels at lean footprint.',
      },
    ],
  },
  {
    id: 'atlauncher',
    name: 'ATLauncher',
    summary:
      'Battle-tested launcher for bouncing between community packs hosted on myriad platforms.',
    detailIntro:
      'ATLauncher has shepherded installs long enough that many servers still mention it by muscle memory — understandable when historical CF integration mattered massively.',
    detailParagraphs: [
      'Pack discovery lives inside launcher-native flows, which helps when you binge multiple author packs sequentially.',
      'Expect occasional UI quirks; core functionality remains reliable for players valuing scripted pack downloads over bespoke docker build farms.',
    ],
    downloads: [{ label: 'ATLauncher · downloads', url: 'https://atlauncher.com/downloads' }],
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '✔️',
      openSafe: '⚠️',
      beginnerAdvanced: '⚠️',
    },
    faqs: [
      {
        q: 'Why pick ATLauncher today?',
        a: 'If your friend group standardized on packs distributed through feeds AT ingests cleanly, staying consistent beats migrating mid-season.',
      },
      {
        q: 'Compared to Astral?',
        a: 'Astral streamlines onboarding for our tooling; ATLauncher excels when migrating decades of AT-specific scripts still matters locally.',
      },
    ],
  },
  {
    id: 'curseforge-app',
    name: 'CurseForge App',
    summary:
      'Official CurseForge client — unbeatable when catalogs, addons, or teams already anchor on CF metadata.',
    detailIntro:
      'CurseForge App mirrors the mothership storefront: updates, thumbnails, curse metadata — everything CF expects from an official conduit.',
    detailParagraphs: [
      'Gamers juggling Modrinth and CF simultaneously typically keep CF App for storefront parity alongside another launcher tuned to MR feeds.',
      'Expect heavier packaging than Prism — trade-off willingly when integrated discovery dominates your workflow.',
    ],
    downloads: [{ label: 'CurseForge App · download center', url: 'https://www.curseforge.com/download/app' }],
    features: {
      platforms: '✔️',
      modpackFormats: '✔️',
      perfInstances: '⚠️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
    faqs: [
      {
        q: 'Mandatory for CF packs?',
        a: 'Not strictly — exporters exist — but quickest adoption path for sanctioned CF manifests often runs through CF tooling.',
      },
      {
        q: 'Compared to Astral?',
        a: 'CF App wins storefront immersion; Astral prioritizes Panda lab flows and narrower opinionated ergonomics.',
      },
    ],
  },
  {
    id: 'multimc',
    name: 'MultiMC',
    summary:
      'Legendary launcher for ruthless instance separation — minimalist chrome, maximal control.',
    detailIntro:
      'MultiMC is the pragmatic shell many power users still emulate when structuring profiles before heavier launchers piled features on.',
    detailParagraphs: [
      'You may trade polish for deterministic environments — glorious when debugging custom loader stacks but less flashy for first-time onboarding.',
      'Keep official builds updated; forked successors (like Prism) often inherit goodwill but MultiMC lineage still resonates for archival workflows.',
    ],
    downloads: [{ label: 'MultiMC · downloads', url: 'https://multimc.org/download' }],
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '✔️',
      openSafe: '⚠️',
      beginnerAdvanced: '⚠️',
    },
    faqs: [
      {
        q: 'Still relevant?',
        a: 'Absolutely for profile minimalists running ancient automation scripts glued to MMC JSON exports.',
      },
      {
        q: 'Why Prism over MultiMC?',
        a: 'Prism extends active development paths with modern ecosystem hooks — MultiMC still beloved but check release cadence versus your risk tolerance.',
      },
    ],
  },
  {
    id: 'gdlauncher',
    name: 'GDLauncher',
    summary:
      'Friendly UI emphasizing discoverability and mod/instance cards — helpful when onboarding friends allergic to monospace logs.',
    detailIntro:
      'GDLauncher balances discovery surfaces with approachable controls that echo productized mod platforms rather than raw shell terminals.',
    detailParagraphs: [
      'Visual hierarchy helps modpack hunts without diving straight into manifests — expect slightly higher idle overhead versus barebones tooling.',
      'Great middle ground teams reach for before graduating to Prism or bespoke scripts.',
    ],
    downloads: [{ label: 'GDLauncher · site & download', url: 'https://gdlauncher.com/' }],
    features: {
      platforms: '✔️',
      modpackFormats: '⚠️',
      perfInstances: '✔️',
      authOffline: '⚠️',
      openSafe: '⚠️',
      beginnerAdvanced: '✔️',
    },
    faqs: [
      {
        q: 'Friendly for non-technical friends?',
        a: 'Yep — onboarding screens read like product tours instead of BIOS prompts.',
      },
      {
        q: 'Compared to Astral?',
        a: 'Astral aligns with Panda lab ergonomics first; GD remains a solid cosmopolitan choice if glossy discovery matters more.',
      },
    ],
  },
];

/** Lookup by slug / id string */
export function getLauncher(idOrSlug: string): LauncherItem | undefined {
  return launchersCatalog.find((l) => l.id === idOrSlug);
}

/** Listing: recommended first (one card subtle highlight), alphabetical among the rest */
export function launchersForList(): LauncherItem[] {
  return [...launchersCatalog].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.name.localeCompare(b.name);
  });
}
