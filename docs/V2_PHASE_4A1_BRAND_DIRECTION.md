# Fase 4A.1 — Brand Direction Lock

Branch `v2/design-system`, base remota `51b556a`. O proprietário rejeitou a proposta cromática raspberry/cream/charcoal da 4A. O moodboard Day/Night e a board de todas as páginas, acompanhados pelas referências individuais de maior resolução, são **direção artística e UX**. Os números, artigos, versões, claims e cartões nas imagens não são conteúdo real e não foram importados.

## Decisão visual e diferença face à 4A

**Day / Explore / Discover:** ivory, oat, sage discreto, céu dessaturado, luz natural. **Night / Rest / Wonder:** midnight blue, superfícies blue-slate, luar suave e luzes quentes à distância. A estrutura da UI é partilhada; a atmosfera muda. As superfícies e os estados continuam a usar os tokens semânticos, primitives, foco, motion e resolução editorial V2 da 4A. Removemos raspberry como primary e a grande marca geométrica do Hero. A ilustração faz agora parte da amostra visível; as outras páginas só recebem tokens de base, não um redesign.

## Paleta proposta — HSL `h s% l%`

| Papel | Day | Night |
| --- | --- | --- |
| Background | `39 48% 94%` ivory | `218 41% 12%` navy |
| Surface / Card | `42 60% 98%` soft cream | `217 34% 17%` blue slate |
| Popover | `42 60% 98%` | `217 34% 18%` |
| Elevated | `40 34% 90%` oat | `217 29% 21%` |
| Foreground | `29 22% 18%` dark ink | `42 35% 93%` moonlit cream |
| Muted foreground | `29 16% 35%` | `215 24% 76%` |
| Border | `36 23% 79%` | `215 23% 34%` |
| Primary | `76 32% 30%` natural olive | `216 76% 70%` moonlit blue |
| Primary foreground | `0 0% 100%` | `220 47% 11%` |
| Hover | `76 36% 25%` | `214 81% 79%` |
| Accent subtle | `79 25% 86%` | `217 32% 26%` |
| Secondary | `39 29% 88%` | `217 25% 23%` |

Semantic states remain independent: success `146 43% 28%` / `150 44% 68%`; warning `32 72% 32%` / `40 78% 70%`; error `1 65% 38%` / `3 70% 70%`; info `205 48% 32%` / `202 61% 77%`; beta purple; development amber; stable success; archived muted. `signal`, `hairline`, `surface-elev`, `ok`, `warn` remain temporary aliases for old components. Source of truth: `src/index.css`; Tailwind maps them in `tailwind.config.ts`. The 4A radii, spacing, shadows, durations and `prefers-reduced-motion` rules are retained, with shadow colors aligned to the new surroundings.

## Tipografia e UI

`Trebuchet MS`, `Segoe UI`, system UI, sans-serif: friendly humanist sans without a new network request or font license. Actual rendering varies by platform; typographic approval needs checks on macOS, Windows and mobile. Large expressive H1, modest sentence case labels, restrained monospace only for technical data. Header uses a replaceable illustrated symbol and a simple wordmark, comfortably spaced CTA and 44px mobile menu target. Buttons, cards, forms, dialog, tabs, tooltip, notice and status badges still use the shared primitives and theme tokens. Header and Home are the limited demonstration surface. Do not derive new facts from the concept images.

## Hero artwork and performance

Two **original** generated images depict the same valley, village, river, mountain silhouettes, tree and panda seen from behind. The Night variant was edited from the Day composition, changing moonlight, stars and village windows while keeping spatial continuity. Image generation used the built-in tool: the moodboard and the Home concept image were **style references**, never source pixels or page content; the Day image was the edit target for Night. Prompt constraints: original panda with no clothing, no lettering, no UI, no protected character, same composition in both moments. Generated masters are not shipped to the browser; optimized WebP files live under `public/brand/`.

| Variant | Dimensions | Size |
| --- | ---: | ---: |
| Day desktop | 1983×793 | 192 590 B |
| Night desktop | 1983×793 | 129 952 B |
| Day mobile crop | 720×634 | 105 504 B |
| Night mobile crop | 720×634 | 73 498 B |

`HeroLandscape` uses `<picture>` with a mobile source and a desktop fallback, chosen by the **active theme**, including a saved explicit preference. Only the selected breakpoint and moment are fetched; the second artwork appears on user toggle and may then remain cached. Mobile has a separate crop preserving the village and panda; CSS fades the artwork into the page and puts content below it, while desktop preserves an opaque text zone on the left. All hero text is HTML, not baked into the image. No new visual dependency, WebGL, video or parallax. Images are decoration with empty `alt`, while the textual heading names the site. This is an original provisional visual exploration, **not** an approved final mascot illustration or logo.

## Brand architecture and provisional copy

Provisional `BrandSymbol` is a small organic original panda head that replaces the 4A geometric mark in the header; final symbol, horizontal wordmark, mascot, monochrome versions, avatar/favicon and contextual art require distinct approval. Shirokuma Cafe artwork/personage is not used. The hero panda is viewed from behind to avoid locking the final face. Approved high-resolution concept images are references only and were not copied into production assets.

The Hero now names AlahPanda Labs and uses deliberately provisional, neutral copy (`Projects and experiences to explore.` and equivalents in PT/ES). This is not an approved slogan. Published Homepage V2 fields `hero.title`, `hero.subtitle` and `hero.eyebrow` still take precedence when present, preserving CMS editability. Old branding describing only engineered premium modpacks and `Lab Notebook` was removed from the Home, header/footer copy and runtime Home SEO metadata. No product claim, release version, metrics, review, guide, article or translation of outside material was introduced. Legacy `site.json` brand description changed only to neutral identity text; Content V2 collections were left untouched. URLs and fallback readers remain intact.

**HTML estático pendente:** a revisão automática de publicação recusou o envio de `index.html`, porque esse ficheiro preexistente contém scripts de Analytics/AdSense e um identificador de verificação; interpretou o envio como introdução de tracking fora do âmbito da fase. Foi reposto exatamente o `index.html` do commit base, sem tentar contornar a recusa. O título, a descrição e a cor de tema iniciais desse HTML continuam com a identidade 4A até o React carregar; o `Seo` da Home e o `ThemeProvider` aplicam os novos valores em runtime. Esta diferença para crawlers sem JavaScript e o possível flash de cor inicial requerem uma alteração de metadados autorizada e revista separadamente.

## Acessibilidade e limites

`node scripts/check-brand-contrast.mjs` checks 22 normal-text pairs against WCAG AA 4.5:1: all pass (minimum 5.66:1 Day primary link; 7.00:1 Night primary link). Hero text has a background gradient on desktop and sits against solid thematic background on mobile; image-composite contrast and browser/keyboard audit must still be checked in Vercel Preview. Theme control remains keyboard accessible and updates browser chrome color. `prefers-reduced-motion` remains in CSS. Theme and responsive source choice are covered by tests. No browser screenshot was produced locally when a browser was unavailable; owners should inspect the actual Preview on small mobile, mobile, tablet, desktop and wide desktop before approving the art.

## Pending owner decisions before 4B

1. Approve or revise the Day/Night artwork, Panda posture/size and the temporary head symbol; commission/approve a distinctive final mascot.
2. Approve the exact visual voice and a final, translated Hero slogan or leave copy neutral.
3. Check responsive crop, typography on target devices, light/dark legibility over the actual image and the Preview keyboard flow.
4. Only after approval, plan progressive page-by-page UI work with truthful V2 content. Do not promote concept-board articles, versions, feature claims, recommendations, statistics or release dates.

## Verificação final desta iteração

- Vitest: 25/25 testes, sete ficheiros; os 24 da 4A mantidos, um teste de seleção Day/Night com source mobile acrescentado.
- `tsc --noEmit -p tsconfig.app.json`: passou. O typecheck Node opcional continua com o erro conhecido fora de escopo em `build/publishedNews.ts:21`.
- `npm run build`: passou, com avisos existentes de Browserslist antiga e chunk >650 kB.
- `npm run lint`: 0 erros e 65 warnings herdados (a 4A tinha 65 após correção da sua advertência nova).
- `node scripts/check-brand-contrast.mjs`: 22/22 pares passam WCAG AA para texto normal, mínimo 5.66:1 no Day e 7.00:1 no Night.
- 4A → 4A.1, tamanho minificado: JS 1 253 994 → 1 253 816 B (−178 B); CSS 92 292 → 93 166 B (+874 B). Artwork externo ao bundle: só um ficheiro WebP por visita/viewport (Day desktop 192 590 B; Night desktop 129 952 B; Day mobile 105 504 B; Night mobile 73 498 B). Total de quatro variantes guardadas: 501 544 B. Logo PNG legado continua a ser importado por outras páginas e permanece no bundle (~194 kB), a rever noutra fase.
