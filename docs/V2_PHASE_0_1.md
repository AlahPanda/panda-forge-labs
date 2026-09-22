# V2: baseline and security foundation

Base: `main` at `520c7223eaecfbb90a9b200a35a33245dc0d4cf2`.
Branch: `v2/security-foundation`. No changes to visual design, product copy, editorial data or `main`.

## Baseline (phase 0)

- Vite/React SPA on Vercel; Supabase `admin-cms` Edge Function; six JSON content files.
- Existing public routes: `/`, `/modpacks`, `/modpacks/:slug`, `/news`, `/news/:slug`, `/launchers`, `/launchers/:slug`, `/faq`, `/about`, `/support`, `/legal`, `/admin`, `/admin/editor`.
- Existing admin sections retained: modpacks, news, FAQ, reviews, site settings; login, edit, save, redeploy and logout remain.
- GitHub `main` remained at the base SHA when this branch was created.
- No live deployment, Supabase configuration, Vercel configuration or external download links were changed or verified.

## Changes (phase 1)

- Browser no longer imports a Supabase client solely for CMS writes or reads `VITE_GITHUB_TOKEN`. All CMS reads, writes and redeploy requests use the authenticated Edge Function.
- Edge Function verifies a short-lived signed admin token (subject, issue time, expiry), checks a fixed origin, enforces allowed content paths, checks basic JSON shape and rejects stale GitHub blob SHA on save (HTTP 409). Every GitHub request uses a server secret and an explicit `GITHUB_BRANCH`.
- Editor verifies its session with `/me`, loads the latest content and SHA from `/read`, and only renders editing forms after successful loading. Browser token now lives in session storage; existing browser sessions need to log in again.
- Public news data is filtered at Vite build time. Drafts are absent from the public JS bundle and cannot be opened via `/news/:slug`. The authenticated editor reads the full news file.
- Markdown escapes attribute values, rejects unsafe URL protocols, and sanitizes generated markup using DOMPurify. Existing Markdown features and YouTube embeds remain.
- Tracked `.env` removed from the branch and `.env.example` added. The old `.env` remains in Git history; this does not erase previously published values.
- Supabase config disables its gateway JWT check for this function because `/login` is public and the function validates its own JWT on protected actions.

## Configuration required before testing a preview

1. Inspect Vercel deployment environment and past build assets for `VITE_GITHUB_TOKEN`. If it was ever set, **revoke that GitHub token**, create a new fine-grained token with Contents read/write limited to `AlahPanda/panda-forge-labs`, and keep it only as the Edge Function secret `GITHUB_TOKEN`. Remove `VITE_GITHUB_TOKEN` from every Vercel environment. A token with repository-wide Contents access can still write other branches if stolen.
2. Configure Edge Function secrets: `ADMIN_PASSWORD`, a new random `ADMIN_JWT_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO=AlahPanda/panda-forge-labs`, `GITHUB_BRANCH=v2/security-foundation`, `ADMIN_ORIGIN=<exact preview origin, no trailing slash>`. Configure `VERCEL_DEPLOY_HOOK` only if it rebuilds this V2 preview, not production. Do not paste these values into a `VITE_` variable or commit them.
3. Deploy `admin-cms` with `supabase/config.toml` (including `verify_jwt = false`) and configure the V2 preview with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env.example`. A preview and production origin require separate function deployment/configuration because `ADMIN_ORIGIN` accepts exactly one origin.
4. In preview: wrong password returns 401; protected read/save without JWT returns 401; login succeeds; all five editor sections load; saving each allowed file creates a commit **only on the V2 branch**; stale SHA returns 409; redeploy targets preview only; logout ends the session. Inspect GitHub before and after to confirm `main` has not moved.
5. Check both the public JS bundle and direct article route with a temporary draft *in a preview-only fixture or branch*; remove that fixture after verification.

## Known limits and next steps

- **Drafts are not confidential in a public GitHub repository.** They are now absent from the deployed public bundle/routes, but their source JSON and Git history remain publicly readable. Truly private drafts require private storage/repository in a later phase; do not put sensitive or embargoed text in this CMS yet.
- The login limiter is per Edge instance, not distributed. Add a shared rate limiter and monitoring before exposing the CMS broadly. A single admin password remains the authentication model.
- The editor uses basic JSON shape validation; complete schema and content model validation belong to phase 3. A GitHub token with repository-wide Contents permissions remains a sensitive server secret.
- Consent/Analytics behaviour, SEO, performance, visual design and editorial accuracy are outside phases 0–1. The existing build reports an approximately 1.17 MB JavaScript bundle.
- External preview integration, live Edge deployment, real token history and actual GitHub/Vercel permissions were not accessible from code alone.

## Local verification

Run `npm ci`, `npm test`, `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`, and `npm run lint`.
