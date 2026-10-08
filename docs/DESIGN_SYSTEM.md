# Current Day/Night design system

Source of truth: `src/index.css`, `src/experience.css` and `tailwind.config.ts`. Day uses ivory/oat surfaces and natural olive actions; Night uses midnight/navy surfaces and moonlit-blue actions. Both share semantic success/warning/error/info and independent project status colors. `internal-prototype` is displayed as In Development, never inferred from a release version.

Tokens include background, foreground, card/popover, muted, border, primary, accent/hover/subtle, radii, shadows, spacing and motion. Compatibility aliases remain until all consumers migrate; removing them without a selector audit is unsafe. Current typography is defined by CSS, with system fallbacks and monospace reserved for technical data. Historical raspberry palettes are not the current identity.

`src/components/ui/` supplies Radix-based accessible primitives. `src/components/design-system/` provides shared primitives, status, brand symbol and responsive landscape selection. Actual public cards/detail composition lives in `src/components/experience/` and `src/pages/PublicExperience.tsx`; superseded V1 card/detail templates have been removed.

Theme preference is stored as `apl.theme`; the existing early initializer and provider implement System/Light/Dark and reduced-motion behavior. Responsive Day/Night art uses the checked-in WebP desktop/mobile assets; artwork approval and licensing remain owner decisions. The cleanup does not change visuals, themes, motion, the header logo, icons or the Premium product composition.

Run `node scripts/check-brand-contrast.mjs` and `node scripts/check-admin-contrast.mjs` for the static token checks. These do not replace keyboard, mobile, screen-reader or real artwork contrast review. The approved Mac Native layout contract is [MAC_NATIVE_REFERENCE_LAYOUT.md](MAC_NATIVE_REFERENCE_LAYOUT.md).
