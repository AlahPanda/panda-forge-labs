# Phase 3B.1 — controlled public resolution

Branch: `v2/security-foundation`. The source remains Git. No production migration, Edge change, database change, or automatic external import occurs here.

## Resolution contract

`src/content/publicResolver.ts` reads checked-in V2 collection JSON only. Each candidate is validated with the same Zod item schema as the CMS. Invalid entries, unexpected `draft` markers, and duplicate slugs are excluded individually. A valid V2 entry replaces its legacy entry with the same slug in listings and detail lookup; unmatched legacy entries remain. The public bundle imports no private draft storage. Git publishing must still go through the authenticated Edge Function and its revision/SHA checks. Removing the legacy later requires replacing only this resolver and the legacy render branches.

| Surface | Current behavior |
| --- | --- |
| `/modpacks`, `/modpacks/:slug` | V2 Mac Native and CraftToons use restrained cards and detail pages with the existing styling and URLs. CraftToons displays `In Development`, name, and only an approved V2 summary/image if later published. Mac Native displays `Beta`; no unsupported version, download counter, review, benchmark, changelog or provider link is imported. New published V2 projects can use the same routes. Other legacy-only entries retain their existing presentation. |
| `/launchers`, `/launchers/:slug` | Published V2 launchers replace matching legacy slugs and use a basic safe detail view with optional official links; legacy-only launchers keep their cards and established richer pages. Technical claims and recommendations are not copied. |
| `/news`, `/news/:slug` | Published V2 articles replace matching legacy slugs. Other published legacy news persists; the legacy virtual module filters drafts at build time. V2 drafts are not bundled. |
| `/faq` | V2 groups with matching category ID/slug take precedence. Other legacy groups remain. |
| `/` | Existing layout uses V2 hero text, notices, ordered featured slugs and visibility for `metrics`, `featured-projects`, `latest-news` only if configured. V2 cards do not depend on the legacy metric fields. Empty collection preserves the old hero/sections; featured Mac Native and CraftToons use V2 cards. |
| Footer and SEO | Valid V2 site description can replace the homepage SEO description; valid V2 contact email replaces the footer address. Other legacy site settings persist. |

`guides` is validated and exposed through the resolver, with no new public route yet. Decide whether standalone guides should live under `/guides/:slug` or under the parent project/launcher before adding routes. Homepage navigation/footer configuration and site settings beyond description/contact need an explicit mapping to current UI; arbitrary CSS/JS is not supported.

## Editorial conflicts and content retained in legacy

- Mac Native legacy has a displayed `0.3.1` beside changelog `1.4.2`/`1.4.0`, numeric download/review/benchmark claims and distribution links. These are **not** imported into V2. Verify actual release and download data against the official Modrinth publication before migration.
- CraftToons legacy contains public versions, a download matrix, review/rating, FPS benchmarks, feature claims, installation instructions and changelogs inconsistent with its `internal-prototype` status. V2 overrides its public card/detail without deleting the old JSON; no summary/image has been approved yet. Do not copy these claims into V2. The old legacy data remains in source control, so anyone inspecting the repository can still find it.
- Legacy `Soon` remains in the legacy collection and may appear as an unmatched legacy listing. It is deliberately absent from the V2 collection. Decide separately whether to retire/hide this legacy placeholder; no replacement was created.
- Legacy launcher scores, download destinations, authentication-related comparisons and claims remain in legacy pages until an editorial verification pass. Legacy news and FAQ remain until reviewed. Global homepage stats are still taken from legacy `site.json` when the metrics section is visible; decide whether to hide or replace the block with verified data. This phase does not assert those numbers as V2 facts.

## Remaining risks and 3B.2

V2 detail pages intentionally expose a small subset of the schema. Verified release facts, installation guidance, media, accessibility refinements, translations, site-wide settings mapping and richer launcher details need a later reviewed public adapter. V2 media URLs are HTTP(S) validated, while remote image availability/rights still require review. Client-rendered metadata cannot guarantee search crawler prerendering. Keep same slugs or plan explicit redirects before a rename.

For 3B.2, review the factual ledger with the owner, verify Mac Native on Modrinth, decide what happens to legacy `Soon` and homepage metrics, approve a CraftToons teaser summary/image if desired, then progressively replace legacy launcher/news/FAQ claims and add a guide route once its URL model is decided. Validate appearance and links on Vercel Preview before any production cutover.
