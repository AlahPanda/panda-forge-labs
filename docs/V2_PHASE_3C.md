# Phase 3C — editorial inventory and legacy exit gate

Branch `v2/security-foundation`; inventory taken before Phase 3C content edits on the tree of remote commit `5cb4f1e` (2026-09-25). Categories denote the **whole legacy entry**, not the safety of an isolated name or URL. SAFE_TO_MIGRATE may be used for a reviewed subset while unsupported claims are excluded.

## Initial inventory

| Surface / legacy entry | Classification | Rationale |
| --- | --- | --- |
| Launchers `astralrinth` | NEEDS_VERIFICATION | No confirmed official distribution page for the proprietary launcher; shortened download links, ratings, runtime/security claims and comparisons need owner review. |
| Launchers `prism` | SAFE_TO_MIGRATE (identity + official URL only) | Official vendor page confirms identity and instances; older ratings/recommendations remain unverified. |
| Launchers `modrinth-app` | SAFE_TO_MIGRATE (identity + official URL only) | Modrinth publishes its app. Legacy scores and comparisons lack provenance. |
| Launchers `sklauncher` | NEEDS_VERIFICATION | Vendor site exists; authentication/offline and safety claims require review. Keep legacy temporarily; do not migrate any account bypass instructions. |
| Launchers `atlauncher` | SAFE_TO_MIGRATE (identity + official URL only) | Official download page is available; comparisons/ratings unverified. |
| Launchers `curseforge-app` | SAFE_TO_MIGRATE (identity + official URL only) | Official CurseForge App download page exists; comparisons/ratings unverified. |
| Launchers `multimc` | SAFE_TO_MIGRATE (identity + official URL only) | Official MultiMC page confirms cleanly separated instances and download destination. |
| Launchers `gdlauncher` | SAFE_TO_MIGRATE (identity + official URL only) | Official GDLauncher site confirms launcher identity; scores/recommendations unverified. |
| News `astralrinth-0-8-11-architecture-memory-instances` | NEEDS_VERIFICATION | Release/telemetry/implementation claims, named author and date are not corroborated by a release artefact. |
| News `vulkan-opengl-minecraft-2026-stuttering-drivers` | NEEDS_VERIFICATION | Claimed laboratory measurements/methodology and named author lack evidence. |
| News `crafttoons-modpack-performance-sodium-iris-stability` | NEEDS_VERIFICATION | Claims a released/tested CraftToons build inconsistent with internal prototype. |
| News `neoforge-vs-fabric-modding-2026` | NEEDS_VERIFICATION | Claims organisational policy, engineering estimates and authorship without provenance. |
| News `microsoft-auth-launcher-security-user-data` | NEEDS_VERIFICATION | Security/telemetry/token-handling claims about AstralRinth need proof before re-publication in V2. |
| FAQ `general` | KEEP_LEGACY_TEMPORARILY | Free pack claim is consistent with project policy, but account wording is dated and launcher recommendations need validation. |
| FAQ `performance` | NEEDS_VERIFICATION | Universal performance advice and ARM64 testing claim lack verifiable basis. |
| FAQ `support` | NEEDS_VERIFICATION | GitHub issue destination and redistribution permissions need owner confirmation. |
| `site.json`: name/contact | SAFE_TO_MIGRATE (name only); KEEP_LEGACY_TEMPORARILY (email) | Brand is established; contact email is operational but not independently confirmed for a cutover. |
| `site.json`: Discord/GitHub/Ko-fi/social | NEEDS_VERIFICATION | Current Discord link differs from the official Mac Native Modrinth link; other destinations require owner validation. |
| `site.json`: stats | OBSOLETE | Unverified static counters; already hidden from Home. |
| `site.json`: ads/popups | KEEP_LEGACY_TEMPORARILY | Runtime behavior exists in legacy components; no V2 functional equivalent or consent migration has been approved. |
| `homepage.json` V2 `home` | SAFE_TO_MIGRATE | Already owns the hide-metrics instruction. Other hero/site strings are still legacy fallbacks. |
| `modpacks.json`: `mac-native`, `crafttoons` | DUPLICATE | Validated public V2 projects supersede these slugs. Legacy file still supports fallback and legacy editor. |
| `modpacks.json`: `Soon` | PLACEHOLDER | Hidden from public catalog/direct detail since 3B.2; retained only in legacy source. |
| `reviews.json` | NEEDS_VERIFICATION | Ratings and author claims were not migrated; legacy detail renderer still imports reviews for fallback-only projects. |
| `i18n.json` | KEEP_LEGACY_TEMPORARILY | Public interface translations and navigation are active; sparse V2 content translations are a separate concern. |

## Source checks for safe launcher fields

Prism https://prismlauncher.org/ ; Modrinth App https://modrinth.com/app ; ATLauncher https://atlauncher.com/downloads ; CurseForge App https://www.curseforge.com/download/app ; MultiMC https://multimc.org/ ; GDLauncher https://gdlauncher.com/ . Checked 2026-09-25. Use vendor-owned destination pages only; do not copy the old scores, comparisons, security assurances, or release claims. No new launcher description is manufactured.

## Post-migration dependency report

The public V2 launcher collection now owns `prism`, `modrinth-app`, `atlauncher`, `curseforge-app`, `multimc`, and `gdlauncher`. Their slugs and `/launchers/:slug` URLs are unchanged. The rendered V2 cards/details contain only name, selected official links and three vendor-sourced short descriptions; optional platforms, features, pros/cons, ease, installation, compatibility and recommendations are intentionally absent. The CMS V2 launcher form and authenticated Git workflow can edit these entries through Draft → Preview → Publish; no new writer was added. `settings.json` now owns the established `AlahPanda Labs` identity used by the header/footer, with no unverified contact, social, ads or analytics claims.

**Exact fallback slugs still public:** `astralrinth`, `sklauncher` (launchers); `astralrinth-0-8-11-architecture-memory-instances`, `vulkan-opengl-minecraft-2026-stuttering-drivers`, `crafttoons-modpack-performance-sodium-iris-stability`, `neoforge-vs-fabric-modding-2026`, `microsoft-auth-launcher-security-user-data` (news); `general`, `performance`, `support` (FAQ). Projects have no public legacy fallback slugs: `Soon` remains hidden and the two known products resolve from V2. Guides and releases already use V2.

| Legacy file / reader | Current public importers or runtime consumers | Why still required |
| --- | --- | --- |
| `src/lib/launchers.ts` | `src/content/publicResolver.ts`, `src/pages/LauncherDetail.tsx`; launcher cards/tables and feature metadata import its types. | Two fallback slugs and their existing detail UI. Other six legacy objects remain bundled through the catalog import until reader split/removal. |
| `src/content/news.json` via `build/publishedNews.ts` virtual module and `src/content/index.ts` | `src/content/publicResolver.ts`, `src/pages/NewsArticle.tsx` (legacy branch); `src/pages/Home.tsx` featured fallback, `src/pages/News.tsx` list. | All five article slugs await proof. The legacy editor still reads/writes published news. |
| `src/content/faq.json` via `src/content/index.ts` | `src/content/publicResolver.ts`, `src/pages/Faq.tsx`. | Three groups remain unpublished in V2; operational and factual answers need review. |
| `src/content/site.json` via `src/content/index.ts` | `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `src/components/DiscordPopup.tsx`, `AdSlot.tsx`; `src/pages/Home.tsx`, `About.tsx`, `Support.tsx`, `Legal.tsx`, `ModpackDetail.tsx`; `src/content/publicResolver.ts`. | Unreviewed links/contact/tagline, ad/support/popup behavior, legal text and defaults. Static stats are still in source but not rendered on Home. |
| `src/content/modpacks.json` and `reviews.json` via `src/content/index.ts` | `src/content/publicResolver.ts`; legacy branch `src/pages/ModpackDetail.tsx`; `src/components/ModpackCard.tsx` type. | Legacy detail branch and admin compatibility; **no current public fallback slug**. These files contain unverified assertions and should not be deleted before the separate reader/editor removal. |
| `src/content/i18n.json` via `src/content/index.ts` | `src/lib/i18n.tsx`, `src/components/layout/SiteHeader.tsx`, and every public component calling `useI18n()`. | Existing interface translations are active; the sparse Content V2 translation model does not replace UI strings. |

Admin-only legacy editors in `src/pages/admin/AdminEditor.tsx` and the existing authenticated API policy still require a separate migration/retirement decision. Do not delete the legacy files merely because one public category reaches zero fallback slugs. `src/content/index.ts` currently imports multiple legacy collections as a shared module; this can retain hidden historical text in the compiled JS even where the UI no longer renders it. Separate module imports before the final removal commit.

**Removal readiness:** no blanket legacy removal yet. `Soon`, global stats, and the six superseded launcher cards can be removed from the legacy source **in a separate reversible commit** after checking that the legacy admin will not overwrite or resurrect them. The project public fallback can be retired once the legacy detail branch and reviews/editor consumers are isolated. Launchers, News, FAQ, settings, and UI i18n are blocked by the entries/consumers above. The public-facing news claims in particular need owner review; keeping them visible in legacy fallback is a material editorial risk, and hiding them is an explicit product decision.

Phase 4 can begin on a separate preview branch with design work after the owner reviews these editorial decisions, but a claim of completed legacy retirement would be inaccurate. Keep production untouched and verify the preview UI/links before rollout.
