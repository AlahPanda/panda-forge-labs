# Security operations

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


## Search security and dependencies

A previously reported browser warning was not reproduced; its cause remains unconfirmed. In Google Search Console select `https://alahpanda-labs.vercel.app/` and inspect **Security & Manual Actions → Security issues / Manual actions**. Do not bypass warnings. Request review only after the reported causes are confirmed and remedied.

The 2026-10-06 dependency audit recorded vulnerabilities, including critical build/test dependencies. This cleanup does not upgrade dependencies or claim those findings are harmless. Keep dev/test servers private and perform a separate reachability/patch review for runtime and build dependencies.

Canonical identity is `src/config/publicSite.json`. Existing global security/cache headers remain in `vercel.json`; HSTS is provided by the deployed platform. Article-specific HTTP metadata and removal semantics are described in [REPOSITORY_NEWS_CLEANUP.md](REPOSITORY_NEWS_CLEANUP.md). No configuration/secrets or protection settings were changed during cleanup.
