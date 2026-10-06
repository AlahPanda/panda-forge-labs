# CMS and automatic release recovery

Baseline: `main` at `0ba93df9b6c2dac0b5c617b64eb51511a581819d`.
Branch: `fix/cms-and-release-sync`. No production secrets/configuration modified.

## Evidence and current blockers

The production browser transport contains an unconditional `missing-config` throw
and no Edge fetch. This proves build-time configuration is absent/invalid; it does
**not** identify which individual Vercel variable/scope was missing, because the
optimizer removes the unreachable transport and its constants. At least one of
`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` failed its guard. Supabase
being Healthy cannot restore missing frontend build environment automatically.

The owner reports Database/PostgREST/Auth/Realtime/Storage/Edge Healthy. This was
not independently verified in an authenticated dashboard. Local public env values
exist but point to a different project from the documented isolated Preview ref;
that does not prove the intended restored Production project is wrong. Local Edge
preflights returned a network/proxy 502 and cannot establish remote secret health.

| Variable / setting | Observed state |
|---|---|
| VITE_SUPABASE_URL | Production scope/value unverified; build configuration fails |
| VITE_SUPABASE_PUBLISHABLE_KEY | Production scope/value unverified; build configuration fails |
| SUPABASE_URL | Vercel server scope unverified |
| SUPABASE_SERVICE_ROLE_KEY | Vercel server scope unverified |
| ADMIN_ORIGINS / ADMIN_ORIGIN | Edge scope unverified |
| ADMIN_PREVIEW_ALIAS | Optional; Edge scope unverified |
| ADMIN_PASSWORD | Edge scope unverified; no default password |
| ADMIN_JWT_SECRET | Edge scope unverified; required |
| GITHUB_TOKEN / GITHUB_REPO / GITHUB_BRANCH | Edge scope unverified |
| CRON_SECRET | Vercel Production scope unverified |

No secret values are logged, copied into Git or requested in chat.

## Official Modrinth observation

Official API `/v2/project/mac-native` returned project `fPtkF9pO`, slug
`mac-native`. `/v2/project/mac-native/version` returned newest listed public:

- version `0.6.0`, ID `76Xlpx2i`, type beta;
- published `2026-09-29T20:02:31.661509Z`;
- Minecraft `1.21.11`, loader `fabric`;
- primary file `Mac Native 0.6.0.mrpack` on official `cdn.modrinth.com`;
- changelog present, 2154 characters.

Older listed releases include 0.3.1 and 0.3. No version is pinned in rendering or
current release authority; publication date still chooses future releases.

Before repair, production `/api/modrinth/mac-native` returned **200 text/html**
containing the SPA index, not a release/snapshot response. Therefore production
stale/persistence/fetchedAt/stored version cannot be inferred from that response.
`/api/sync-modrinth` returned **500**, while `/api/support` returned its expected
GET 405, showing at least some serverless functions are deployed.

NodeNext verification independently reproduced TS2835 on extensionless ESM imports
in the cron. This is a confirmed repository defect, but the exact production 500
exception requires Vercel function logs; do not claim logs were inspected.
The route swallowing and cron failure occur before a valid public publication
response. No proof was obtained of a 0.3.1 stored snapshot or failed database row.

## Changes and exact flow

- ESM imports for sync helpers use `.js`; JSON uses a Node import attribute.
- A flat Vercel `api/modrinth.ts` handler is explicitly reached by the public
  `/api/modrinth/:slug` rewrite, with its slug passed as a query parameter.
  The previous dynamic entry remains a compatibility re-export.
- SPA fallback excludes the `/api` namespace; it cannot pretend to be JSON.
  Existing headers, redirects, cron schedule and direct Modrinth CTA are unchanged.
- Snapshot REST calls have bounded five-second timeouts.
- Snapshots must match connected slug/ID and a valid non-future fetchedAt before
  reuse. TTL is 15 minutes; force bypasses it. No browser force-write endpoint.
- Safe diagnostics expose source (`cache`, `upstream`, `last-known-good`), previous
  stored version, current release version, fetchedAt, stale/persistence, and failure
  stage. Sync logs contain these factual fields without headers, credentials or
  raw exceptions. Authorized cron returns per-project results and 503 for stale
  or unpersisted refreshes instead of reporting an unhealthy refresh as success.
- Frontend configuration accepts valid HTTPS root URLs with/without trailing slash,
  rejects credentials/path/query/hash and reports variable status without values.
  It does not guess a Supabase URL/key or fetch from an arbitrary fallback project.

Public path:
Modrinth project + version API → fetchModrinthPublication → parseModrinthPublication
→ resolveSnapshot → Supabase modrinth_snapshots → public API → React Query page.
Scheduled path: existing Vercel daily `0 6 * * *` → `/api/sync-modrinth` → constant
configured bearer authorization → syncProject(force=true) → validated persistence.

Supabase read failure does not prevent a fresh Modrinth fetch. Write failure returns
fresh facts with persistence unavailable. Modrinth failure uses matching LKG stale;
malformed upstream cannot replace it. A subsequent healthy request resumes storage.
No manual snapshot JSON update, editorial releaseSlug, keepalive or credentials
bypass was introduced. Historical 0.3.1 editorial content is unchanged.

## Owner actions — required before real acceptance or merge

1. Open **Vercel → alahpandas-projects → alahpanda-labs → Settings → Environment
   Variables**. Inspect variable names/scopes; never send their values in chat.
   For Production, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to
   the intended restored project's public URL and publishable/legacy anon key.
   Obtain them in **Supabase → restored project → Settings → Data API / API Keys**.
   Verify the project ref against the Healthy project before copying.
2. Add the corresponding public variables in **Preview** for this repair branch,
   pointing to the approved Preview CMS project. Do not silently reuse a Production
   service-role key in Preview. Existing isolated Preview documentation names ref
   `jnvckqlschyquzzfldrs`; confirm it with the owner before selecting it.
3. In Vercel server-only variables set `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` for each intended environment. The latter must NEVER
   use a `VITE_` prefix. Inspect the project's `public.modrinth_snapshots` table in
   Supabase Database → Table Editor. If absent, apply the existing checked-in
   `supabase/migrations/20260929000000_modrinth_snapshots.sql`. It enables RLS and denies anon/authenticated reads/writes.
4. In the selected **Supabase → Edge Functions → admin-cms / Secrets**, verify
   `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `ADMIN_ORIGINS`, `GITHUB_TOKEN`,
   `GITHUB_REPO`, `GITHUB_BRANCH`, and draft-storage secrets. Keep the existing
   verify_jwt=false deployment setting: the function validates its own admin JWT.
   Add the exact production origin `https://alahpanda-labs.vercel.app` only to the
   intended production CMS configuration. Preview exact aliases may be added
   separately; existing strict project deployment-host validation remains intact.
   Never use `*`. Keep GitHub writes pinned to the existing approved editing branch;
   do not switch publication to main just to make login work.
5. VITE values are **build-time**. After setting them, open **Vercel → Deployments
   → repair branch Preview → … → Redeploy**, after checking it is Preview.
   Do not change Production deployment settings or manually redeploy Production
   as part of this unmerged repair. Secrets/config changes above are owner actions,
   not changes performed by the agent.
6. Open the authenticated Preview `/admin`. Its safe configuration diagnostics
   should report both public variables present. Use the owner password locally.
   Confirm POST reaches the intended `/functions/v1/admin-cms/login`, wrong password
   gets 401, correct password succeeds, `/admin/editor` loads and a private draft
   stays private. Do not paste the password or session token into chat.
7. Open Preview `/api/modrinth/mac-native`: expect JSON, 0.6.0, stale=false,
   persistence=available and recent fetchedAt. Check the snapshot table's project
   ID/version/fetched_at and the Preview page's release link, compatibility and
   counts. API unavailable must never display fake zero metrics.
8. **Vercel → project → Settings → Cron Jobs**: verify the existing daily job;
   **Observability / Logs** filter `/api/sync-modrinth` for actual invocations and
   `modrinth_sync` diagnostics. Check Production `CRON_SECRET` exists in the proper
   scope. A protected manual force-refresh requires a bearer-authenticated call to
   the intended deployed sync endpoint using the locally held secret, plus normal
   Preview Authentication when applicable. Do not expose the secret or bypass
   Vercel protection. Run the production cron manually only after this repair is
   accepted/deployed through the normal workflow. No real forced refresh was made
   by the agent, as the required access was unavailable.

Real stored versions, cron activity and accepted owner credentials remain
**unverified**. A table being Healthy is not evidence of a successful upsert.
Preview Authentication may block this agent: authenticate in the owner's browser
and perform steps 6–8 there. No main merge until the task's real Preview criteria
are confirmed. See also `docs/OWNER_CMS_ACCESS.md` for password rotation/session
invalidation; no password reset was performed.

## Regression verification

Coverage includes newest-by-date 0.6.0, future release, TTL/force, identity rejection,
read/write failure recovery, stale LKG, malformed upstream, the actual public/cron
handlers, route isolation, missing public config, credential/session guards and
protected CMS editor/private draft tests. `npm run typecheck:sync` checks the sync
API's NodeNext imports separately from the frontend, which previously did not cover
those server files. Full test/build/typecheck/lint results and Preview outcomes are
reported with the PR; successful mocks are not presented as real login/persistence.

Local final gates: 145 tests / 18 files passed; app and sync API typecheck passed;
build passed (existing 739.91 kB main chunk warning); full lint 0 errors / 70 existing
warnings and scoped API lint passed; git diff --check passed.
