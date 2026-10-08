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

Twelve main headings plus a Java subsection in each of en/pt-PT/pt-BR/es: before beginning; official
installation; first launch; VSync; Java/instance fields; memory; environment variables; no shaders;
Beryl; controlled tuning; troubleshooting; safe updates. Existing Premium layout,
reading container, Markdown sanitization and Content V2 CMS editing are preserved.

VSync recommendation: start enabled to compare perceived smoothness, frame delivery
and tearing against the display refresh rate. It does not universally increase raw
FPS; latency/adaptive sync/alternative limiting may warrant comparison. Not mandatory.

Owner approval supplied on 2026-10-08 in the PR #14 continuation replaces the
previous pending Java recommendation. Exact approved configuration:

```text
-Xms2G -Xmx4G -XX:+UseG1GC -XX:MaxGCPauseMillis=30 -XX:+ParallelRefProcEnabled
```

The guide documents initial/max heap 2/4 GB, G1 collector, approximately 30 ms
pause target (not a guaranteed maximum), and parallel reference processing where
supported. No universal FPS/stutter improvement is promised. Heap values are not
the total application's memory cap. For machines without sufficient headroom or
unsupported runtime options, restore defaults and seek support.

Launcher duplication check: Prism's official Java settings documentation separates
memory and JVM fields. Use instance memory minimum/maximum 2048/4096 MiB and the
three collector flags in the argument field, not a second heap configuration.
Modrinth official source (`packages/app-lib/src/launcher/args.rs`) explicitly
appends `-Xmx{memory.maximum}M`; its instance Java settings UI independently exposes
custom memory and argument overrides. Use 4 GB maximum in that UI and `-Xms2G`
plus the collector flags in custom arguments, avoiding duplicate Xmx. The full
approved string is reproduced unchanged in all four translations. No custom
environment variable is required for the standard setup unless future notes say
otherwise. Java options do not belong in environment-variable fields.

Sources (reviewed 2026-10-08):
- https://prismlauncher.org/wiki/help-pages/java-settings/
- https://github.com/modrinth/code/blob/main/apps/app-frontend/src/pages/instance/components/settings-modal/java-settings.vue
- https://github.com/modrinth/code/blob/main/packages/app-lib/src/launcher/args.rs
- https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html

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

Initial PR results: 38 focused tests passed; full suite 165 tests / 19 files passed.
App and NodeNext sync API typecheck passed. Build passed (main chunk ~760.5 kB;
existing chunk-size/Browserslist warnings; guide translations increase bundled
editorial data). Lint: 0 errors / 72 warnings; no dependency upgrades. Diff check
passed. The optional-content fixture now clears translations when deleting its
source sections, preventing stale translated fixture content from masking removal.


## Owner-approved Java continuation

Previous PR #14 HEAD: `07340758f63109a5f29d86123a605ab966554f7b`.
Only this guide, regression tests and this document changed. Java code blocks are
byte-for-byte identical across all locales. VSync now includes a four-step test
workflow and refresh-rate/frame-pacing explanation; Beryl follows a stable
no-shader baseline. PT-BR wording/typos found during the language review corrected.
Language/theme providers and release-sync code remain untouched.

Validation: 42 focused tests passed before the final wording assertions; final
full suite 169 tests / 19 files passed. App and sync API typecheck passed. Build
passed with existing chunk/Browserslist warnings; lint 0 errors / 71 warnings.
Diff check passed. Official API rechecked: latest listed version_number 0.9.1,
id iPJDM1yr, published 2026-10-08T00:20:17.536032Z. Current rendering remains
upstream-driven, including the already-tested later 0.9.2 transition.

Authenticated runtime Preview acceptance remains separate from passing local gates.
Bounded Preview outcome and final commit SHA are recorded in PR #14. No merge.
