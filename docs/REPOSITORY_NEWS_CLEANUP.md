# Repository and News cleanup

## Baseline and scope

- Repository: `AlahPanda/panda-forge-labs`.
- Base remote main: `0ba93df9b6c2dac0b5c617b64eb51511a581819d`, verified unchanged before edits and before publication.
- Branch: `cleanup/repository-and-news`, independent worktree.
- PR #11 `fix/cms-and-release-sync` remains at `4d4cc374842bc3350fde0e70a611c4db21184332`.
- PR #12 `fix/brand-browser-icons` remains at `bdf257d799155eb6e66d76ff00db49eb1e6c317a`.
- No merge, force push, dependency/secret/environment change, redesign, favicon change, CMS-auth change or Modrinth sync change.

Tracked files: **281 → 230** (63 deleted, 12 created; net reduction 51). Documentation: **20 → 10** (15 superseded reports deleted, five current runbooks/report created). Counts concern this branch versus its exact base, excluding build artifacts and other PRs. Git history is preserved; no claim that repository Git storage shrank.

## Audit and classification

Audited roots: `src`, `public`, `api`, `docs`, `supabase`, `scripts`, `build`, tests, configs/lockfiles and `.github`. Proof combines the App/main route/import graph (including lazy routes), import searches, references from tests/build/scripts/admin, local media paths, successful production build and full tests.

| Class | Candidates | Evidence / decision |
| --- | --- | --- |
| KEEP | Current public experiences, Premium template, shared UI/design primitives, layout, theme/motion, i18n core | Mounted routes and imports/tests; visual behavior unchanged |
| KEEP | Existing APIs, Modrinth snapshot/download/sync, migrations, origin/JWT security, publication workflow | Runtime/workflow/DB contracts; no speculative API deletion |
| KEEP | Brand WebP assets, source logo, favicon, ownership HTML, `ads.txt` | Public content/hero consumers, independent icon PR, operational/account provenance |
| MERGE / CONSOLIDATE | Build discovery and public publication filter | One Zod publication boundary shared by resolver/discovery; generated files emitted by Vite rather than duplicated static copies |
| MERGE / CONSOLIDATE | Old architecture, support, design and security reports | Current operational sections moved to ARCHITECTURE, SUPPORT_OPERATIONS, DESIGN_SYSTEM and SECURITY_OPERATIONS; completed phase evidence remains in Git |
| DELETE SAFE | Five legacy articles and news-specific reader/plugin/UI strings | Explicit owner retirement; public News now V2-only; no live consumers retained |
| DELETE SAFE | Unmounted old pages, their private component subtree, obsolete legacy editor, App.css, placeholder, template test | No reachability from App/main or retained test roots; build and full suite pass without them |
| DELETE AFTER MIGRATION | Legacy modpack/FAQ/site/launcher data | Still consumed by publicResolver fallback, site/i18n/legal/layout and/or authenticated legacy inventory; deleting now would change behavior |
| UNKNOWN / DO NOT TOUCH | Supabase-generated client/types, unused library primitives, alternate lockfiles, granular legacy CSS/translations, media reuse rights | Sparse references alone do not establish safe deletion; security/toolchain/design migration decisions remain separate |

Directories with no tracked files left: `src/components/launchers`, `src/pages/launchers`, `src/pages/news`. Shared `src/components/experience` and the active `src/pages/PublicExperience.tsx` remain.

## Retired News library

The entire `src/content/news.json` is deleted. Titles, bodies, authors, dates, unsupported claims and the virtual V1 reader are removed from the current tree. The minimal slug-only `src/content/removedNews.json` is deliberately retained as HTTP tombstones, not historical editorial storage. Those identities are also excluded by the public boundary so an accidental V2 slug reuse cannot resurrect them.

| Retired slug | HTTP |
| --- | --- |
| astralrinth-0-8-11-architecture-memory-instances | 410 |
| vulkan-opengl-minecraft-2026-stuttering-drivers | 410 |
| crafttoons-modpack-performance-sodium-iris-stability | 410 |
| neoforge-vs-fabric-modding-2026 | 410 |
| microsoft-auth-launcher-security-user-data | 410 |

No blanket redirect or substitute article is invented. Unknown `/news/:slug` receives HTTP **404**, not a SPA 200. Removed and unknown responses have `X-Robots-Tag: noindex, follow` and matching HTML robots metadata. The old “Article under review” renderer is gone. SPA navigation to a missing article renders the existing unavailable-page UI with noindex; real status codes are supplied on an HTTP request, not simulated by React.

The authenticated archive no longer requests the removed news file. The Edge path allowlist refuses that obsolete path. Password/JWT, origin checks, revisions, conflict checks, draft APIs and sanitization are unchanged. The dead, unmounted legacy editor is removed; the active V2 CMS remains the only owner editing UI.

## Published V2 articles

All eight are retained and indexable by default, with explicit `seo.noindex` still supported for intentional exclusion:

| Slug | HTTP | Discovery |
| --- | --- | --- |
| mac-native-031-beta | 200 | Sitemap + RSS |
| mac-native-onde-instalar | 200 | Sitemap + RSS |
| crafttoons-em-desenvolvimento | 200 | Sitemap + RSS |
| content-v2-como-funciona | 200 | Sitemap + RSS |
| launchers-destinos-oficiais | 200 | Sitemap + RSS |
| faq-nova-base | 200 | Sitemap + RSS |
| modrinth-factos-publicos | 200 | Sitemap + RSS |
| guia-biblioteca-publica | 200 | Sitemap + RSS |

No approval flag/CMS action is required for indexing published Git content. The eight blanket noindex flags were removed. Bodies, titles, summaries, translations, author labels, publication/modification dates and media were compared against the base and preserved exactly. One historical project-document source link is pinned to the immutable base Git SHA, where that original phase report remains available; it is not a broken local documentation dependency. No dates are refreshed to pretend the articles are newer.

`publication.ts` applies the existing collection validation fail-closed: drafts (including any draft marker), invalid records, duplicate slugs and populated translations awaiting review cannot enter public content. Private drafts are never imported into the resolver, metadata index, sitemap or RSS. Explicit noindex articles can remain publicly readable but are excluded from feeds/discovery. Guide publication policy is unchanged.

## HTTP and discovery implementation

- `build/discovery.ts` emits `dist/sitemap.xml`, `rss.xml`, `robots.txt` and `news-index.json` from validated public collections. Static checked-in duplicates and the unchecked prebuild generator are removed.
- The built sitemap has **29 URLs, eight News entries**; RSS has **eight items**, preserving published dates. Canonical origin comes from `src/config/publicSite.json`, not Preview env or incoming Host.
- No admin/draft/private/noindex/retired entries appear. Atom is not added.
- The narrow `/news/:slug → /api/news?slug=:slug` rewrite precedes the existing SPA fallback. Other routes/API behavior is preserved.
- `api/news.ts` serves the compiled app shell with per-article canonical, description, OG/Twitter, Article and BreadcrumbList metadata before JS. `server/newsDocument.ts` is outside the API route directory.
- `vercel.json` explicitly includes `dist/index.html` and `dist/news-index.json` in the function. The function only uses the public build artifact, never Supabase or drafts.
- Missing build assets fail 503/no-store/noindex instead of making absent articles an indexable 200. GET/HEAD supported; other methods 405. Slug inputs are bounded and escaped; embedded JSON escapes `<`.
- Cache is `public, max-age=0, s-maxage=300, must-revalidate`; deployments refresh the artifact. The runtime metadata index is scoped to the build.
- The existing compiled JS/CSS, theme initializer and icon declarations remain intact. This is targeted HTTP head/status handling, not full SSR or a visual rewrite. React still renders the article body and translated UI; localized URL architecture is unchanged.
- Local `vite preview` does not emulate Vercel functions. A real deployment routing check is still required before merge.

## Verification

- Focused public resolver/security/public routes/trust tests passed; new HTTP/discovery suite: **21 tests**.
- Full Vitest: **151 tests passed, 17 files**. Includes current public routes, Home/News links, V2/CMS/auth/workflow, APIs, i18n and Modrinth behavior.
- TypeScript app, Vite/build, Edge and new News function configurations: passed. Edge bundle and Node syntax check passed; temporary bundles remain outside the repository.
- Production build: passed; main minified JS **739.91 → 718.81 kB**. Existing >650 kB and old Browserslist warnings remain; dependencies are unchanged.
- Lint: **0 errors, 23 warnings** (previous baseline report: 70). No unrelated warning repair.
- Actual local HTTP requests against the bundled function **using the built dist artifacts**: published 200 with own canonical/index headers; removed 410; unknown 404; compiled entrypoint preserved. Built sitemap/RSS each contain eight News entries.
- Import/reference scan: no broken relative/alias imports or local media paths. Operational Markdown links resolve. Only necessary tombstone tests/report and an immutable Git citation mention retired/deleted identities.
- Test corrections: preserve the shared launcher `reviewPending` translation; CMS transport tests stub fictional public config rather than requiring real env/secrets. This changes no runtime CMS behavior.
- `git diff --check`: passed in final tree. Build output and temporary validation files stay outside tracked files.

## Compatibility with the pending PRs

Read-only `git merge-tree` against exact PR heads found:

| PR | Result | Integration requirement |
| --- | --- | --- |
| #11 CMS/release repair | Text conflicts in `package.json` and `vercel.json`; adminApi test auto-merges | Preserve its `typecheck:sync` script while removing obsolete `prebuild`; preserve its `/api/modrinth/:slug → /api/modrinth?slug=:slug` rewrite and API-excluding SPA fallback while adding this News rewrite before SPA and retaining the News includeFiles block |
| #12 browser icons | Clean merge simulation | Keep its index.html/icon files; News handler reads that built shell and preserves its favicon declarations |

No PR branch was modified and no conflict was resolved in their worktrees. This cleanup is **not ready for an unattended merge after #11**: resolve the two known config conflicts, then rerun validation on the combined result. #12 is independently compatible. No histories are rebased/squashed/force-pushed.

## Owner actions / remaining risks

1. Review this PR without merging until PR #11 operational validation and the two configuration conflicts are addressed.
2. On the authorized Vercel Preview, request representative current/removed/unknown News URLs and confirm 200/410/404, own canonical/robots, sitemap and RSS. Packaging/rewrite behavior is locally tested but not claimed verified on a remote deployment in this task. Do not bypass Preview Authentication.
3. After a deliberate merge/deployment, submit the updated sitemap and inspect representative URLs in Google Search Console. Search engines decide crawl/index timing; eight indexable pages do not guarantee immediate indexing or remove old results instantly.
4. The narrowed obsolete Edge path permission is checked in, not remotely deployed here. The existing Supabase Preview workflow only triggers on `v2/full-redesign`, not this cleanup branch/main. Apply the reviewed function change deliberately via the existing isolated procedure if the owner wants the retired write path denied remotely; no new workflow or secrets were configured.
5. Retained legacy project/launcher/FAQ/site/review inventory needs a separate approved migration before deletion. Media licensing, guide noindex decisions, support delivery, dependency vulnerabilities, CSP and consent/ads activation remain owner-controlled/separate work.

## Exact files deleted

- `build/publishedNews.ts`
- `docs/PRODUCTION_TRUST_HARDENING.md`
- `docs/REDESIGN_MOTION_CONTENT_PREVIEW.md`
- `docs/V2_PHASE_0_1.md`
- `docs/V2_PHASE_3A.md`
- `docs/V2_PHASE_3B1.md`
- `docs/V2_PHASE_3B2.md`
- `docs/V2_PHASE_3C.md`
- `docs/V2_PHASE_4A1_BRAND_DIRECTION.md`
- `docs/V2_PHASE_4A_DESIGN_SYSTEM.md`
- `docs/V2_PHASE_4B1_RECOVERY.md`
- `docs/V2_PHASE_4B21_DATA_I18N_CMS.md`
- `docs/V2_PHASE_4B23_OWNER_CONTROL_PANEL.md`
- `docs/V2_PHASE_4B2_PRODUCT_EXPERIENCE.md`
- `docs/V2_PHASE_4B_FULL_REDESIGN.md`
- `docs/V2_REMAINDER_PREVIEW.md`
- `public/placeholder.svg`
- `public/robots.txt`
- `public/rss.xml`
- `public/sitemap.xml`
- `scripts/generate-discovery.mjs`
- `src/App.css`
- `src/components/AdSlot.tsx`
- `src/components/BenchmarkChart.tsx`
- `src/components/DiscordPopup.tsx`
- `src/components/FeatureShowcase.tsx`
- `src/components/InstallGuide.tsx`
- `src/components/MarkdownEditor.tsx`
- `src/components/ModpackCard.tsx`
- `src/components/NavLink.tsx`
- `src/components/NewsCard.tsx`
- `src/components/PublicV2Card.tsx`
- `src/components/PublicV2Detail.tsx`
- `src/components/TagChip.tsx`
- `src/components/launchers/AstralDownloadGrid.tsx`
- `src/components/launchers/LauncherBackLink.tsx`
- `src/components/launchers/LauncherCompareTable.tsx`
- `src/components/launchers/LauncherFeaturesTable.tsx`
- `src/components/launchers/LauncherGlassDownload.tsx`
- `src/components/launchers/LauncherListCard.tsx`
- `src/components/launchers/LauncherLogo.tsx`
- `src/components/launchers/LauncherQuickStartGuide.tsx`
- `src/components/launchers/LauncherStars.tsx`
- `src/content/news.json`
- `src/lib/launcherFeatureMeta.ts`
- `src/pages/About.tsx`
- `src/pages/Faq.tsx`
- `src/pages/GuideDetail.tsx`
- `src/pages/Guides.tsx`
- `src/pages/Home.tsx`
- `src/pages/Index.tsx`
- `src/pages/LauncherDetail.tsx`
- `src/pages/Launchers.tsx`
- `src/pages/ModpackDetail.tsx`
- `src/pages/Modpacks.tsx`
- `src/pages/News.tsx`
- `src/pages/NewsArticle.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/Support.tsx`
- `src/pages/admin/LegacyAdminEditor.tsx`
- `src/pages/launchers/LauncherRoutesLayout.tsx`
- `src/pages/news/NewsRoutesLayout.tsx`
- `src/test/example.test.ts`

## Exact files modified

- `README.md`
- `docs/OWNER_CMS_ACCESS.md`
- `package.json`
- `src/content/i18n.json`
- `src/content/index.ts`
- `src/content/publicResolver.ts`
- `src/content/v2/articles.json`
- `src/pages/PublicExperience.tsx`
- `src/pages/admin/LegacyArchive.tsx`
- `src/test/adminApi.test.ts`
- `src/test/production-trust.test.tsx`
- `src/test/public-experience.test.tsx`
- `src/test/public-resolver.test.ts`
- `src/test/security.test.ts`
- `src/vite-env.d.ts`
- `supabase/functions/admin-cms/policy.ts`
- `tsconfig.node.json`
- `vercel.json`
- `vite.config.ts`
- `vitest.config.ts`

## Exact files created

- `api/news.ts`
- `build/discovery.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/REPOSITORY_NEWS_CLEANUP.md`
- `docs/SECURITY_OPERATIONS.md`
- `docs/SUPPORT_OPERATIONS.md`
- `server/newsDocument.ts`
- `src/content/removedNews.json`
- `src/content/v2/publication.ts`
- `src/test/news-publication.test.ts`
- `tsconfig.news.json`
