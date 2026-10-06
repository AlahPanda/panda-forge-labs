# Production trust hardening — 6 October 2026

## Baseline and scope

Started from remote `main` at `64031b49b16d07842673a960ab7493e8895196f7`.
Working branch: `fix/production-trust-hardening`.
No visual/editorial redesign, CMS configuration, secrets, release automation,
snapshots, social proof, or primary download behavior changed.

## Unsafe-site investigation: not reproduced, cause unconfirmed

- Tested `https://alahpanda-labs.vercel.app/` in the cloud Chrome browser.
  The application loaded without a browser phishing/TLS warning. No warning was bypassed.
- HTTP probe: 200, final URL unchanged, certificate verification result 0.
  Existing Vercel HSTS: `max-age=63072000; includeSubDomains; preload`.
- Home DOM contained no `http:` resource/link. No application console error was
  observed there; an unrelated browser-extension metadata error was present.
- Google Transparency Report for this exact hostname said **No unsafe content
  found**, but its displayed information date was **6 August 2026**. This is
  evidence of the displayed result, not a fresh scan or a security guarantee.
- Cannot establish whether the user's warning concerned another URL/provider,
  a download file, a stale deployment, or a subsequently changed classification.
  **Do not claim this patch fixes that warning.**

Owner action: open Google Search Console, select/verify the URL-prefix property
`https://alahpanda-labs.vercel.app/`, then **Security & Manual Actions → Security
issues** and **Manual actions**. Record the provider's issue and sample URLs.
If actual reported issues are remedied, use **Request a review** in the relevant
report, describing the verified fixes. Supply the exact warning hostname/provider
and timestamp for diagnosis; never bypass the warning to gather this evidence.
Sources: [Google Security issues](https://support.google.com/webmasters/answer/9044101)
and [dangerous-site labels](https://support.google.com/webmasters/answer/6347750).

## Public external links and legacy reachability

All eight current launcher entries resolve to V2, including AstralRinth.
Public V2 distribution/download/official links use HTTPS and contain no known
shortener. Current Mac Native CTA remains the direct official project destination
`https://modrinth.com/modpack/mac-native`, independently of the release API.

`src/content/publicResolver.ts` imports the legacy launcher catalog. Before this
patch five `https://ouo.io/...` destinations therefore existed in its built JS,
although V2 shadowed AstralRinth and public pages did not render those links.
The legacy detail fallback could re-expose them if the V2 record became invalid.
This patch quarantines only those unverified legacy download destinations by
emptying that list and removing its old shortener FAQ. No guessed replacements.
Published AstralRinth's verified `git.xorison.dev` destinations remain unchanged.
The current newly emitted entry bundle has no `https://ouo.io/` URLs. Historical
text mentions remain in old unused components/translations; they are not links.
Old local dist chunks are not evidence of the newly emitted entry bundle.

Focused DOM tests check every `_blank` link in ten public routes for both
`noopener` and `noreferrer`. Existing link semantics already passed; no broad
link refactor was necessary. Contact links remain `mailto:`.

Public HEAD probes (20 destinations):

| Destination | Observation |
|---|---|
| Main hostname | 200; no redirect |
| AstralRinth source and release, `git.xorison.dev/didirus/AstralRinth` | 200; unchanged |
| GitHub AlahPanda; Ko-fi AlahPanda | 200; unchanged |
| YouTube `@alahpanda` | 200; redirects to `www.youtube.com/@alahpanda` |
| Discord invite | redirects to `discord.com/invite/alahpanda`, then 403 to this client |
| CurseForge support article | 200; unchanged |
| ATLauncher, Prism, Modrinth, MultiMC, GDLauncher, SKLauncher, CurseForge app | 403 to this client; no unrelated destination observed |

A 403 is not proof of a dead/malicious domain or bot detection. The restricted
client cannot fully validate these pages or binaries. No installers were run.
No active public shortener was found and no relation to the reported warning
was proven. Publisher download URLs were preserved, not re-certified as safe binaries.

## Canonical, legal routing and discovery

`src/config/publicSite.json` is the public identity source of truth, shared by
runtime helpers and the Node discovery generator. Its origin is fixed at
`https://alahpanda-labs.vercel.app`; deployment/Preview envs do not override it.
`canonicalUrl` retains the pathname of explicit/current URLs but drops their
host, query and hash. It normalizes old `/projects` and legal query identities.
Article/guide JSON-LD and breadcrumbs now use this origin too.

Preferred routes `/legal/privacy` and `/legal/terms` directly render the existing
texts with distinct canonic­als. The former reverse redirects are gone.
Vercel permanently redirects recognized old query routes to the preferred paths;
React performs equivalent replace navigation for local/SPAs and defaults `/legal`
to privacy. Footer links use the preferred paths. No legal claims were rewritten.
Sitemap emits preferred legal paths; no admin/private entries. Robots explicitly
excludes `/admin`. This is crawl guidance, not access control. RSS uses the shared
origin and still excludes articles marked noindex. Draft-marked records fail closed
in the generator. Existing eight noindex editorial records stay noindex.

## Brand metadata and structured data

Static title: **AlahPanda Labs — Minecraft Experiences, Modpacks & Launchers**.
Static description: **Discover Minecraft modpacks, launcher guides, releases and
original projects from AlahPanda Labs, built around performance, creativity and
a better player experience.**

Static canonical/OG URL, OG title/description/type/image, Twitter card/title/
description/image are present before JavaScript. Existing original brand panorama
`/brand/overlook-day.webp` is the default social image, not project-specific art.
A dedicated reviewed **1200×630** card is still recommended; no new artwork created.
Helmet-managed baseline tags let route metadata replace these values. This remains
an SPA: social crawlers that do not execute JS may still see the global baseline on
detail routes. Per-route pre-rendering is a separate follow-up, not claimed solved.

Static and homepage JSON-LD contain only WebSite/Organization name and public URL.
No invented ratings, dates, address, employees or social identities.

## Headers and CSP

All paths receive:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-Frame-Options: SAMEORIGIN`

Existing cache headers and HTTPS/HSTS remain. Camera/mic/geolocation/Payment API
are not used. Ko-fi is an external navigation, not an embedded Payment API flow.
SAMEORIGIN permits same-origin owner previewing; cross-origin framing of this site
is intentionally disallowed. It does not block the site's YouTube child frames.

**CSP enforcement deferred.** Required inventory:

| Resource | Current source/requirement |
|---|---|
| App scripts/styles | self; inline theme initializer; runtime/inline styles |
| Preview tooling | Vercel-injected feedback/auth resources depend on environment |
| Owner API | exact configured Supabase HTTPS origin (`VITE_SUPABASE_URL`) |
| Public release/metrics | same-origin `/api/modrinth/*`; fallback `api.modrinth.com` |
| Support anti-abuse | `challenges.cloudflare.com` scripts and frames |
| Email | Resend server-side only; no browser API key/origin needed |
| Video | `www.youtube.com/embed/*` frames from sanitized Markdown |
| Images | local brand assets; official media/CDN origins and CMS-published HTTPS media |
| Fonts | local/system stack; no new third-party font loading |

A future CSP must start report-only, with exact deployed Supabase/Vercel/CDN
origins plus reviewed inline script hashes/style strategy. Test owner auth/draft
preview/publish, support Turnstile, media and video before enforcement. Do not
substitute broad `https:`/wildcards just to silence reports. No new CSP or
frame-ancestors claim is made by this patch.

## Main protection — owner action required

API evidence: `main.protected=false`, repository rulesets `[]`. The connected
GitHub capabilities expose reads and Git/PR operations, not administration writes.
No protection setting was silently changed.

In repository **Settings → Rules → Rulesets → New branch ruleset**:
1. Name `main protection`, Enforcement **Active**, target branch `main`.
2. Enable **Restrict deletions**, **Block force pushes**, **Require a pull request
   before merging**. For a solo owner, do not require an unavailable second reviewer.
3. Leave **Require linear history** OFF so merge commits stay permitted.
4. Select existing **Vercel** deployment status only after confirming it appears
   reliably on this PR. `Vercel Preview Comments` alone is not a build gate.
   Do not require a non-existent tests/typecheck CI context.
5. Keep an explicit owner recovery bypass; do not lock the branch or require an
   unavailable merge queue. Check the rule in a disposable PR before relying on it.
6. **Settings → General → Pull Requests → Allow merge commits** remains enabled.

Source: [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Validation

- Focused trust/public/download tests: **47 passed**.
- Full Vitest: **131 passed**, 17 files.
- App TypeScript: passed.
- Build: passed; main JS 739.91 kB, existing >650 kB warning.
- Lint: 0 errors, 70 existing warnings.
- `git diff --check`: passed.
- npm audit: **41 affected package entries** (2 critical, 30 high, 7 moderate,
  2 low). Exit 1 signals findings, not test failure. No dependencies were changed.

Critical entries `vitest`/`tinypool` are build/test dependencies: public production
runs built static JS and serverless APIs, not Vitest UI or its worker options.
Do not expose test/dev servers. Browser-runtime dependencies such as React Router,
DOMPurify and lodash and server-side `ws` require separate patch/reachability review.
DOMPurify uses string sanitation here, not the cited IN_PLACE hook pattern; this
is limited reachability evidence, not a claim all its advisories are harmless.
Build tools/g­lob/CSS entries can be lockfile production dependencies without being
browser-loaded. Severity totals include transitive propagation, not 41 proven
exploits in this application. No major upgrades/automatic audit fix in this task.

Runtime Preview smoke verification and PR check/merge outcomes are recorded in the
completion report; Preview Authentication must not be bypassed if it blocks access.

### Dependency inventory (npm audit and installed lockfile)

| Package | Severity | Lockfile scope | Installed version(s) |
|---|---|---|---|
| @humanfs/node | moderate | build/test only | 0.16.6 |
| @remix-run/router | high | production dependency | 1.23.0 |
| @tailwindcss/typography | moderate | build/test only | 0.5.16 |
| @tootallnate/once | low | build/test only | 2.0.0 |
| @typescript-eslint/eslint-plugin | high | build/test only | 8.38.0 |
| @typescript-eslint/parser | high | build/test only | 8.38.0 |
| @typescript-eslint/type-utils | high | build/test only | 8.38.0 |
| @typescript-eslint/typescript-estree | high | build/test only | 8.38.0 |
| @typescript-eslint/utils | high | build/test only | 8.38.0 |
| @vitest/mocker | moderate | build/test only | 3.2.4 |
| ajv | moderate | build/test only | 6.12.6 |
| brace-expansion | high | production dependency | 1.1.12,2.0.2 |
| braces | high | production dependency | 3.0.3 |
| browserslist | high | build/test only | 4.25.1 |
| chokidar | high | production dependency | 3.6.0 |
| dompurify | low | production dependency | 3.4.15 |
| esbuild | moderate | build/test only | 0.21.5,0.25.0 |
| fast-glob | high | production dependency | 3.3.2 |
| flatted | high | build/test only | 3.3.1 |
| form-data | high | build/test only | 4.0.5 |
| glob | high | production dependency | 10.4.5 |
| js-yaml | high | build/test only | 4.1.0 |
| lodash | high | production dependency | 4.17.21 |
| lovable-tagger | high | build/test only | 1.1.13 |
| micromatch | high | production dependency | 4.0.8 |
| minimatch | high | production dependency | 3.1.2,9.0.5 |
| nanoid | high | production dependency | 3.3.11 |
| picomatch | high | production dependency | 2.3.1,4.0.4 |
| postcss | high | production dependency | 8.5.6 |
| postcss-selector-parser | moderate | production dependency | 6.0.10,6.1.2 |
| react-router | high | production dependency | 6.30.1 |
| react-router-dom | high | production dependency | 6.30.1 |
| rollup | high | build/test only | 4.24.0 |
| source-map-js | high | production dependency | 1.2.1 |
| tailwindcss | high | production dependency | 3.4.17 |
| tinypool | critical | build/test only | 1.1.1 |
| typescript-eslint | high | build/test only | 8.38.0 |
| vite | high | build/test only | 5.4.19 |
| vitest | critical | build/test only | 3.2.4 |
| ws | high | production dependency | 8.18.1,8.20.0 |
| yaml | moderate | production dependency | 2.6.0 |
