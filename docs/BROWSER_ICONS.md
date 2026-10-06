# AlahPanda Labs browser identity

Source: owner-approved `Panda Lab Mascot Icon.png`, preserved byte-for-byte at
`docs/brand/panda-lab-mascot-icon-source.png`. SHA-256: `8365955e8a88c8575c0f812250cc936923bce2a4286bbe8a6d9d3282d64a4967`.

Derivatives use full-image Lanczos downsampling without cropping, recolouring,
redrawing or changing the existing background/corners. The panda and flask remain
within every derivative; small details naturally reduce at 16 px.

## Assets

- ICO: embedded 16, 32 and 48 px bitmap images for browser compatibility.
- PNG favicons: 16, 32 and 48 px.
- Apple touch icon: 180 px.
- Site/app icons: 192 and 512 px, `purpose: any` (not maskable).
- Manifest: browser display; no service worker or standalone/PWA behaviour introduced.

## Cache and scope

HTML and the manifest reference `/icons/alahpanda-labs-8365955e8a88/`.
Future source changes require a new source-hash directory and updated references.
The root `/favicon.ico` is also replaced, covering browsers that probe it directly.
Previously cached root icons can remain until their cache expires; explicit
versioned HTML references avoid relying on those cache entries.
Existing static cache headers are retained; no Vercel configuration changes.

Header logo, OG artwork, SEO copy, routes, CMS, APIs, content and release data
are unchanged. The branch is based on main `0ba93df9b6c2dac0b5c617b64eb51511a581819d`
and has no file overlap with PR #11.
