# Current production rollup — owner review

## Verified inputs and history

Starting main: `0ba93df9b6c2dac0b5c617b64eb51511a581819d`.
Integration branch: `integration/current-production-rollup`.
All five PRs were open/unmerged with the exact expected remote heads before integration. Source branches are retained and unmodified. Main is unchanged. No Production configuration, secrets or deployment action was performed.

| Order | PR / source | Verified source SHA | Published two-parent merge SHA |
| --- | --- | --- | --- |
| 1 | #15 `fix/search-console-verification` | `1ab14fe4e4c4714b0bf95829c2ead2f36676102b` | `dbb75498d046d75d726d652eb918ab7a7167f422` |
| 2 | #11 `fix/cms-and-release-sync` | `4d4cc374842bc3350fde0e70a611c4db21184332` | `6ec8aeb186a1158d2f2ff04ad68bf63c6aa5080d` |
| 3 | #14 `feat/09x-guide-and-system-preferences` | `f3b59e92540f17bb2618eb00fb28e19cc55dba09` | `4c86b4b9cd6c86b88567672f05bb91a084b8387e` |
| 4 | #12 `fix/brand-browser-icons` | `bdf257d799155eb6e66d76ff00db49eb1e6c317a` | `ef59689e8449a1752ab8438426f85a96e7868fac` |
| 5 | #13 `cleanup/repository-and-news` | `dc82850dc8b46473f3343ea8806dce3b3e8787ea` | `0984daeda50ab1fee427f3e2554fffbc9f4422d9` |

Normal local `--no-ff` merges established the result. Publication through the GitHub connector reproduces each merge with its preceding integration parent and exact source parent. Each published tree was compared with its corresponding local merge tree. No squash, rebase, cherry-pick or force push; complete source histories remain ancestors.

## Conflict audit

Only `package.json` and `vercel.json` conflicted, in the final #13 merge.

- `package.json`: #11 added `typecheck:sync` alongside the existing discovery prebuild; #13 removed the obsolete prebuild generator. Kept `typecheck:sync: tsc -p tsconfig.api.json`, removed `prebuild`. Discovery is now the validated Vite plugin. JSON duplicate-key check passed. Dependencies/devDependencies and lockfile are unchanged from main.
- `vercel.json`: #11's flat Modrinth rewrite occupied the same position as #13's News rewrite. Kept both, the API namespace exclusion from SPA, News function `includeFiles`, cron, redirects and all existing security/cache headers.
- `index.html`, i18n, PublicExperience and shared tests auto-merged. Full tests/typechecks passed. News serving preserves the merged icon/theme initialization shell.
- Two routing tests had incompatible positional assumptions: Modrinth's test assumed the SPA was at index 1; News's test assumed News was at index 0. Tests now locate the intended route and verify ordering/behavior. No runtime implementation was changed beyond the two required conflict resolutions.

Final rewrite order:

1. `/api/modrinth/:slug` → `/api/modrinth?slug=:slug`.
2. `/news/:slug` → `/api/news?slug=:slug`.
3. `/api/(.*)` → `/api/$1` (retained from cleanup).
4. `/((?!api(?:/|$)).*)` → `/` (SPA; API namespace excluded).

Existing static files take filesystem precedence before rewrites on Vercel. The Google file has no matching redirect. The News handler includes `dist/{index.html,news-index.json}`, supplies known retired URLs with 410 and unknown URLs with 404. It fails 503/noindex when its public build assets are absent. No retired News content/reader is restored. Remote Vercel routing and packaging still require runtime acceptance.

## Validation on the integrated tree

- Final full Vitest: **189 passed / 19 files**. Includes News HTTP/discovery, Modrinth endpoint/snapshot/LKG/cron, dynamic newer-release resolution, guide/Java, System/manual language/theme, CMS/auth/drafts and public routes.
- App, sync/API, Vite/build, Edge and News TypeScript configurations: passed.
- Build: passed; existing Browserslist and >650 kB chunk warnings. Main bundle 750.81 kB. No dependency upgrades.
- Lint: **0 errors / 24 warnings**; pre-existing categories, no unrelated repair.
- Edge, News and Modrinth bundles plus Node syntax checks: passed. Temporary validation assets remain outside the tracked repository.
- `git diff --check`: passed. Security-pattern scan found no newly exposed secret values or server-secret `VITE_` prefixes; test fixtures are not credentials.
- Starting validation encountered 63 untracked obsolete copies of files deleted by #13. They were byte-compared to old main and only those exact copies removed. This fixed the initial typecheck errors from unreachable old consumers. Final gates ran on the clean intended tree; no deleted source was restored.

Local composed HTTP smoke uses the built Vite shell/static files and actual bundled News/Modrinth handlers. It is not Vercel emulation or remote acceptance:

| Request | Result |
| --- | --- |
| `/` | 200 HTML |
| `/modpacks/mac-native` | 200 app shell; existing component tests cover rendering |
| `/guides/complete-mac-native` | 200 app shell; guide tests cover content |
| `/legal/privacy`, `/legal/terms` | 200 app shell; route tests cover content |
| `/google032eabfcf2578ac4.html` | 200 HTML/text, no redirect, exact 53-byte body |
| `/news/mac-native-031-beta` | 200, root canonical, Article/BreadcrumbList, approved favicon |
| `/news/astralrinth-0-8-11-architecture-memory-instances` | 410 |
| `/news/no-such-article` | 404 |
| `/api/modrinth/mac-native` | 200 JSON with explicit synthetic upstream fixture; no SPA HTML |

The API smoke fixture initially lacked a project ID; fixing only the temporary fixture produced the expected JSON. No API source repair was needed. Persistence is unavailable in this credential-free local smoke; persistent reads/writes, TTL bypass and LKG are covered by tests, not claimed live.

## Discovery, identity, guide and security

- Built Google file equals source/upload exactly: `google-site-verification: google032eabfcf2578ac4.html`, 53 bytes, no newline or wrapper.
- Approved mascot source SHA-256 remains `8365955e8a88c8575c0f812250cc936923bce2a4286bbe8a6d9d3282d64a4967`. Verified PNG dimensions 16/32/48/180/192/512, ICO frames 16/32/48, built copies and hashed HTML/manifest references.
- Canonical origin remains `https://alahpanda-labs.vercel.app`. Built sitemap: 29 root URLs, eight News URLs. RSS: eight entries. Robots references the root sitemap. Homepage canonical/OG and article canonical/OG/JSON-LD use the root. Zero built occurrences of `www.alahpanda-labs.vercel.app`; no Preview origin in discovery metadata. Drafts/noindex/private items are excluded by publication tests.
- Guide preserves the exact approved Java code block in EN/PT-PT/PT-BR/ES: `-Xms2G -Xmx4G -XX:+UseG1GC -XX:MaxGCPauseMillis=30 -XX:+ParallelRefProcEnabled`. Tests cover 2/4 GB, G1, pause target rather than guarantee, parallel reference processing, no required custom env vars, VSync/Hz, Beryl and stable no-shader baseline.
- Dynamic Modrinth resolution is preserved: a later 0.9.2 supersedes 0.9.1 by publication date. No current version hardcoded by integration.
- Official API was requested twice with max 10-second bounds; both failed proxy CONNECT timeout before a response. Latest release cannot be freshly asserted in this run. Previous verified observation from #14 was 0.9.1 / iPJDM1yr; that is historical evidence, not a new live result.
- System locale follows navigator.languages, then navigator.language; unsupported languages use English; manual selection persists and System clears the override. Tests pass. System theme follows OS; Light/Dark overrides persist; System clears override; selector displays preference. Tests pass.
- Existing headers, cron and redirects match main exactly. HSTS was not changed; it is supplied by the hosting layer, not disabled in this repository. No authentication, origin/JWT, private drafts, concurrency or sanitization weakening. No secrets/environment changes or new server-secret frontend exposure.

## Final acceptance gate

Do not merge automatically. A green build/check does not prove runtime persistence or authenticated Preview behavior.

Before owner approval, verify on the authorized integration Preview: current API JSON/version/stale/persistence/fetchedAt, current product page and official primary CTA, guide/Java in four locales, language/theme preference behavior, favicon/mobile sanity, current/retired/unknown News 200/410/404, sitemap/RSS and the exact Google file body. Use HTTP <=10 seconds and browser <=20 seconds; stop on Deployment Protection and do not bypass it.

The narrowed #13 Edge allowlist is in Git only; it was not remotely deployed by this integration. Existing owner deployment procedures and environment/branch targeting still require deliberate owner action. Source PRs and branches remain intact until rollout is accepted.
