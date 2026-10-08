# Current architecture

The frontend is React/Vite, mounted from `src/main.tsx` and routed by `src/App.tsx`. Current public experiences are in `src/pages/PublicExperience.tsx`; Legal and lazy admin routes have dedicated modules. `/projects` redirects to `/modpacks`.

Public Git content uses Zod-validated `{schemaVersion: 2, items: [...]}` collections in `src/content/v2/`. `schema.ts` defines eight content kinds. `publication.ts` is the fail-closed public boundary shared by the resolver and build discovery: invalid records, any draft marker and populated translations awaiting review are excluded. Published originals and sparse translations retain stable slugs and field fallback.

`publicResolver.ts` keeps V2-first fallback for projects, launchers, FAQ and settings. News is V2-only; retired news has no editorial reader. Guides are V2-only. Legacy modpack/FAQ/site/launcher data still have runtime/admin consumers and cannot all be deleted in this cleanup. Public metrics and release facts retain the existing Modrinth architecture; see [V2_MODRINTH_AUTOMATION_AND_LAUNCH.md](V2_MODRINTH_AUTOMATION_AND_LAUNCH.md).

The owner signs in at `/admin`; server-side `admin-cms` validates origin/password/JWT. Private drafts are in Supabase, public versioned content in Git. Publish checks draft revision and Git SHA before writing the configured branch. A commit and a deployed Preview are distinct states. There is no second browser-to-GitHub publication path.

## Draft storage prerequisites

Apply `supabase/migrations/20260925_cms_drafts.sql` only to the deliberately selected project. `cms_drafts` is protected by RLS and service-role-only privileges. `supabase/functions/admin-cms/deno.json` maps Zod, while `supabase/config.toml` disables platform JWT enforcement only because the function validates its own admin JWT. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are server-only; reserved Supabase values are normally injected, not created manually as public envs. Never expose these or GitHub credentials via `VITE_*`.

Follow [OWNER_CMS_ACCESS.md](OWNER_CMS_ACCESS.md) for origins, credential rotation, isolation and owner validation, and [V2_PREVIEW_INFRASTRUCTURE.md](V2_PREVIEW_INFRASTRUCTURE.md) for the current isolated Preview workflow. The workflow remains branch-specific and is not silently extended to `main`.

## Build and HTTP discovery

`build/discovery.ts` emits sitemap, RSS, robots and a public metadata index using the same Zod publication boundary. `api/news.ts` reads the built index and app shell to serve true article HTTP 200/410/404 plus own canonical/social/structured metadata before React loads. The independent icon PR remains compatible because the built shell's favicon tags are preserved. No full SSR, localized URL routes or new editorial content are introduced. See [REPOSITORY_NEWS_CLEANUP.md](REPOSITORY_NEWS_CLEANUP.md).

Support delivery is documented in [SUPPORT_OPERATIONS.md](SUPPORT_OPERATIONS.md), security in [SECURITY_OPERATIONS.md](SECURITY_OPERATIONS.md), and the disabled monetization gate in [MONETIZATION_PREVIEW_GATE.md](MONETIZATION_PREVIEW_GATE.md).
