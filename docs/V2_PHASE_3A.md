# Phase 3A — Content Engine and CMS V2

Branch: `v2/security-foundation`. This is an additive, Git-first layer. No production configuration or public page markup is changed by this phase.

## Implemented contract

`src/content/v2/schema.ts` defines runtime Zod schemas and TypeScript types for projects, releases, launchers, articles, guides, FAQ, homepage, and site settings. Each Git collection has `{ "schemaVersion": 2, "items": [...] }`; entries use stable slugs, original language, sparse translation records (`partial` or `complete`) and optional SEO. A missing translation is missing data, not generated copy. Defaults for new records use `pt-PT`, while a specific record can choose another source language.

Project `status` is independent of release `version`/`channel`: `internal-prototype`, `development`, `alpha`, `beta`, `stable`, `archived`. A prototype needs no release or version. Optional media, compatibility, requirements, installation, recommendations, features, distribution providers, benchmarks with methodology, FAQ and roadmap are supported. Provider state can be `active`, `paused`, or `outdated`; priority can be `primary` or `secondary`. Launchers have their own platforms, features, pros/cons, ease of use, installation, compatibility, recommendations, official links and SEO. Homepage allows bounded content fields and ordered feature slugs, notices and section visibility, without CSS or executable input.

The initial V2 projects collection contains only known identities/classifications: `mac-native` = `beta`; `crafttoons` = `internal-prototype`. No releases, counts, fabricated reviews, download links or descriptions were added to V2. Other V2 collections start empty. Existing public pages still read the legacy files.

## Editorial workflow

1. Admin reads public V2 collections from the configured GitHub branch through the authenticated Edge Function and receives a Git blob SHA.
2. Admin creates or edits a **private** draft using structured fields. The Edge Function validates it and stores it in `cms_drafts` with a revision and the base Git SHA. The browser never receives the service role secret. The private preview displays locally with sanitized Markdown and does not create a public URL.
3. Publish validates the stored draft, checks its revision and unchanged base Git SHA, updates only the matching V2 collection via the server-side GitHub token, then removes the draft. If Git changed, the operation returns 409; reload/review the newer version before retrying. Edits after saving must be saved again before Publish becomes available.

The database is used only for confidential, mutable drafts. Public versioned data remains in Git. Draft contents are never committed to public Git or imported into the public frontend bundle by this workflow. The older public `news.json` writer now rejects entries with `draft: true`; new articles must use Content → articles. Legacy published articles can still be edited in the legacy section. Existing historical Git commits are unaffected.

The V2 collections are **not yet rendered as public pages**. Publishing a V2 record commits versioned content, but does not silently replace a legacy project, article or launcher page. Public integration and URL mapping require a reviewed migration phase.

## Admin navigation

Dashboard: overview. Content: Projects, Launchers, News, Guides, FAQ, Releases. Website: Homepage, Site Settings. System: private drafts and deployment/session status. Existing modpacks/news/FAQ/reviews/settings editors remain under Legacy editing. Homepage and Site Settings in V2 are separate from the still-active legacy `site.json` until a later cutover.

The V2 forms cover core text, optional translations, media, project compatibility and distribution, release information, launcher links, guide steps, homepage sections, and navigation/footer. Some detailed controls (e.g. guided media uploads, provenance enforcement for benchmarks, cross-reference pickers) remain later work. Structured input is validated on the server; invalid or incomplete fields cannot be published.

## Migration and conflicts

| Legacy source | V2 destination | Automated? | Review needed |
| --- | --- | --- | --- |
| `src/content/modpacks.json` | `projects.json` identity/description and `releases.json` verified releases | Only slug/name can be copied safely. | Mac Native is beta; reconcile published Modrinth release/version before creating releases. CraftToons is internal prototype: do not import displayed downloads, review counts, changelog or benchmarks as facts. Legacy `Soon` remains untouched and requires an explicit product decision. |
| `src/lib/launchers.ts` | `launchers.json` | No automatic migration in 3A. | Verify links, platform claims, ownership, source, recommendations and rights. Preserve `/launchers/:slug`. |
| `src/content/news.json` | `articles.json` | No automatic migration. | Check authorship, factual claims, publication dates, related project references and draft visibility. Preserve `/news/:slug`. |
| Install instructions embedded in modpacks | `guides.json` or project installation | No. | Decide whether a guide stands alone and verify steps against published release. |
| `faq.json`, `site.json`, `i18n.json` | `faq.json`, `homepage.json`, `settings.json`, translations | No. | Decide which text is original; map navigation/metrics/advertising separately and keep incomplete translations incomplete. |

The old JSON, launcher code, public routes and visible product pages are left as they were. Contradictions are classified here, not rewritten or erased. In a later migration, make explicit redirects only when a slug must change; keep existing URLs whenever possible.

## Preview setup required by the owner

1. Apply `supabase/migrations/20260925_cms_drafts.sql` to the **preview Supabase project**. It creates a table with RLS enabled, no client policies and service-role-only privileges. Do not apply to production during this phase.
2. Deploy the changed `admin-cms` function to the preview project with `supabase/functions/admin-cms/deno.json` import mapping for the existing Zod dependency and `verify_jwt = false` from `supabase/config.toml` (the function verifies its own admin JWT).
3. Set preview Edge secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and retain the Phase 1 secrets including `GITHUB_BRANCH=v2/security-foundation`, `ADMIN_ORIGIN` for the exact preview origin and the server-side `GITHUB_TOKEN`. Never expose a service-role or GitHub token under `VITE_`. Disable or isolate any deploy hook that points at production.
4. Test with a disposable V2 draft in preview: login; save; reload; open private draft; preview; publish; verify only the V2 branch changed and the draft was removed; test a conflicting Git SHA and an unauthorized request. No production or real product data needs to be changed for this test.

## Decisions deliberately deferred

- Public V2 rendering/cutover, especially whether a project with `internal-prototype` should have a public detail page, requires an explicit product decision. The current legacy page remains as-is meanwhile.
- Modrinth as the future source for Mac Native release facts, and rules for provider priority/fallback, require integration design and verification of source data. No automatic sync was added.
- The publication model currently writes the configured Git branch on Publish. If an additional editorial approval/PR gate is desired, decide that before public cutover.
- Content provenance/benchmark review, granular consent, SEO prerendering, visitor themes/language preferences and live metrics are later phases. None are blocked by this model.

## Verification

`npm test`; `npx tsc -p tsconfig.app.json --noEmit`; `npx tsc -p tsconfig.edge.json --noEmit`; `npm run build`; `npm run lint`; and Edge bundle syntax check with esbuild. Runtime integration is mocked locally; a real preview Supabase deployment requires the manual steps above.
