# 0.9.x guide and system preferences

Stacked branch: `feat/09x-guide-and-system-preferences`.
Base: remote `fix/cms-and-release-sync` at `4d4cc374842bc3350fde0e70a611c4db21184332` (PR #11 remains open/draft and unchanged).
No main, CMS auth, Supabase, News, favicon, PR #12/#13 or dependency changes.

## Official observation — 2026-10-08

Bounded direct GETs to `https://api.modrinth.com/v2/project/mac-native`
and `/v2/project/mac-native/version` returned the project description and public
versions. Newest listed by publication date: version_number **0.9.1**, id
**iPJDM1yr**, published **2026-10-08T00:20:17.536032Z**, Minecraft **1.21.11**,
Fabric. This is an observation, never a permanent UI pin. The upstream version's
name differs from version_number; the existing resolver correctly uses
version_number. A cached web rendering of the description was older than the API:
the current direct API was used for this review.

Existing PR #11 publication/snapshot resolver remains the factual authority with
15-minute TTL and explicit stale LKG. The product panel already distinguishes
historical editorial fallback from current upstream release; this behavior is
preserved. Guide release/version/Minecraft/loader data now consumes the same
validated resolver and displays stale saved facts explicitly. If unavailable,
the panel disappears; guide instructions and official links remain usable.
No static Content V2 edit is needed when 0.9.2 or a later version is published.

## Old 0.3.1 inventory and actions

- `guides.json`, complete-mac-native original and pt-PT/pt-BR/es bodies: outdated
  installation generation; rewritten for 0.9.x, newest compatible release and
  dynamic Minecraft/loader references. Old release-specific guide source removed.
- `projects.json`, Mac Native FAQ: old compatibility release wording replaced by
  current official-release instructions, with translated FAQs/installation/features.
- `faq.json`, accounts-compatibility/mac-version and mac-native/mac-available:
  static availability/compatibility claims rewritten to official current facts.
- `projects.json` releaseSlugs and `releases.json` mac-native-0-3-1: preserved as
  historical published release, explicitly historical in connected product fallback.
- `articles.json` historical 0.3.1 article and its dated sources: preserved; News
  is outside scope. No global numeric replacement.
- Legacy source/content references: preserved; not current V2 release authority.
- No 0.3.1 current-version strings found in Premium JSX or shared UI dictionaries.

## Guide content

Eleven small headings in each of en/pt-PT/pt-BR/es: before beginning; official
installation; first launch; VSync; Java/instance fields; memory; no shaders;
Beryl; controlled tuning; troubleshooting; safe updates. Existing Premium layout,
reading container, Markdown sanitization and Content V2 CMS editing are preserved.

VSync recommendation: start enabled to compare perceived smoothness, frame delivery
and tearing against the display refresh rate. It does not universally increase raw
FPS; latency/adaptive sync/alternative limiting may warrant comparison. Not mandatory.

No owner-approved custom JVM argument or environment-variable value was found in
repository documentation/content or official project description/release notes.
**Owner-approved Java argument value still required.** No fabricated command/code
block was added. The separate launcher fields are named exactly and users are asked
to retain defaults until a precise recommendation exists. No universal RAM amount.

Beryl: official 0.9.0 release notes explicitly introduce optional shader support;
the current official project description includes Beryl. Its official page
`https://modrinth.com/mod/beryl` describes a Vulkan pipeline requiring VulkanMod,
with an integrated shader pack. The guide does not equate it with arbitrary shader
pack compatibility. Without shaders is the troubleshooting/headroom baseline;
with Beryl is optional, adds GPU work and should use the pack's supplied setup.

## Language and theme

Language preference is separate from resolved locale: `system` or one of four
locales. Without `apl.locale`, resolve navigator.languages in priority order, then
navigator.language: pt-BR → pt-BR; other pt variants/bare pt → pt-PT; en variants →
en; es variants → es; no supported match → en. No geolocation. Languagechange
updates System mode. Manual choices persist; selecting System clears the override.
Existing valid stored preferences are preserved. Storage failure permits session use.

UI fallback: selected dictionary → English → neutral unavailable label.
Editorial fallback remains selected approved nonempty translation → published
original; needs-review is excluded. No fabricated translation. Complete Mac Native
project and guide translations now prevent unnecessary Portuguese fallback on the
English installation/FAQ/feature surfaces. Other untranslated records retain their
source language; no global editorial fallback behavior was changed.

Theme infrastructure was already healthy and retained: preference system/light/dark,
resolved light/dark, matchMedia change subscription, persisted manual overrides,
System removes override. Header selectors show preference, including System even
when the resolved appearance is Light/Dark. Pre-paint script resolves language and
theme consistently and handles unavailable storage independently. The app is a
client-rendered SPA, not SSR hydration. Existing reduced-motion/transitions untouched.

## Validation / acceptance

Focused regression tests cover browser locale mapping, priority, persistence,
System reset and runtime language changes; System/explicit themes and OS changes;
all guide languages, collection validation, English project fields and selector
binding; latest upstream 0.9.1 and future 0.9.2 selection by publication date.
Full gates and bounded remote Preview results are reported in the PR/final delivery.
Real authenticated Preview checks must not be inferred from local passing tests.
No protection bypass or owner authentication/configuration changes are authorized.

Final local results: 38 focused tests passed; full suite 165 tests / 19 files passed.
App and NodeNext sync API typecheck passed. Build passed (main chunk ~760.5 kB;
existing chunk-size/Browserslist warnings; guide translations increase bundled
editorial data). Lint: 0 errors / 72 warnings; no dependency upgrades. Diff check
passed. The optional-content fixture now clears translations when deleting its
source sections, preventing stale translated fixture content from masking removal.
