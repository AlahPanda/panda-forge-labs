# Phase 3B.2 — editorial cutover ledger

Branch `v2/security-foundation`; no merge, production deployment or legacy deletion.

## Verified public V2 ownership

| Entry / route | Public source | Scope |
| --- | --- | --- |
| `/modpacks/mac-native` | V2 project and `mac-native-0-3-1` release | Modrinth lists release 0.3.1 as Beta, compatible with Minecraft Java 1.21.11, Fabric and client-side. The public detail shows a link to the exact official release; the release notes are paraphrased from that page. Project status remains independent of version. |
| `/modpacks/crafttoons` | V2 project | Internal prototype, public `In Development`, a short neutral teaser authorized for this phase, and no release, metrics, downloads or feature list. No unapproved image is assigned. |
| `/` | V2 homepage entry for section configuration and V2 project cards | Legacy global metrics are no longer rendered. Hero text and other unreviewed site claims remain legacy fallback; V2 homepage explicitly records `metrics: false`. |
| `/guides`, `/guides/:slug` | V2 guides collection | Empty state and not-found state are valid. New published V2 guides will use stable slugs, sanitized Markdown and existing SEO infrastructure. There are currently no guides to migrate. |
| `/modpacks/Soon` | No public content | Legacy placeholder remains only in old JSON. Public list filters it; direct route returns the existing not-found presentation. |

Other launcher, news/article and FAQ entries remain in legacy fallback because their technical claims, authorship, publication dates, and recommendation/rating provenance need review. V2 collections remain available for new reviewed entries. Site Settings V2 is still empty: contact and navigation claims have not been verified. The public resolver continues preferring validated, checked-in V2 entries and rejects draft markers. Draft storage, auth and publication concurrency from 3A are unchanged.

## Source ledger, checked 2026-09-25

- Official project: https://modrinth.com/modpack/mac-native — confirms Mac focus (Apple Silicon and Intel), Minecraft 1.21.11, Fabric and client-side environment. The `macOS` compatibility string in V2 describes the target platform; no wider Windows/Linux support is asserted here.
- Official versions: https://modrinth.com/modpack/mac-native/versions — lists 0.3.1 as the latest displayed Beta entry, followed by 0.3. No sync runs automatically: a later publication may change which release is latest.
- Official release: https://modrinth.com/modpack/mac-native/version/0.3.1 — confirms beta channel, compatibility and official release link; its change notes list e4all/VMP, AsyncParticles/ModernFix, EMF/ETF/ESF and default options. We paraphrase those notes in the V2 release and omit counts, measurements and exact publication time.

## Excluded or hidden claims

- Legacy Mac Native changelog claims for 1.4.2/1.4.0 conflict with the Modrinth version list. No legacy benchmark, rating, count, mirrors or memory/Java requirement was copied. Official Modrinth project prose includes benchmarks, but their methodology is not established in this migration, so they were not migrated.
- Legacy CraftToons claims about releases, downloads, reviews, mod count, features, install steps and benchmarks remain in the old file and do not render through the V2 route.
- The legacy `Soon` entry and legacy homepage numbers remain in source control for audit and are hidden from public surfaces. Do not re-enable metrics through a V2 visibility toggle until backed by a verified source and an explicit integration.
- Third-party launcher descriptions, news articles and FAQ were not bulk-copied into V2. No translations or new guides were fabricated.

## Follow-up / removal gate

Before deleting legacy readers, audit every fallback slug, validate publisher attribution and claims for launchers, news and FAQ, map shared site settings deliberately, add explicit redirects for any slug changes, verify the actual Modrinth release again, and inspect all changed routes on Vercel Preview. Then remove legacy data/readers in a distinct reviewed commit. Phase 4 can address source synchronization, verified metrics, translation workflows and SEO prerendering without coupling drafts or Git publication to the public runtime.
