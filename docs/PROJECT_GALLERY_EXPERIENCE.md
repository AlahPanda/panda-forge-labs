# Project gallery — premium editorial refinement

## Branch and baseline

Continue `update/project-gallery-high-quality`, PR #17, from `afd372c03773b2e6d2be744567e68c7711efab82`. Remote main remains `bc3fc9a3a668522f10f431ed23db5cd8a7ac1d7b`. No merge or production configuration action.

## Previous design recovered

Inspected `8aa0850`, `613ef8d` and pre-gallery-update main. The earlier gallery used a rounded, shadowed card, a 1.12–1.6rem bold caption, 24px insets, compact arrows and pagination, cover photography and a blur/scale reveal. Captions were supplied by Modrinth descriptions; there was no checked-in approved editorial caption collection in those implementations. No upstream text was fetched or silently treated as owner-approved copy.

Retain the rounded card, border/shadow, larger title hierarchy and compact navigation. Replace the small literal caption with an evocative title and a short sentence. Keep text below the picture for readability and unobscured gameplay UI; do not restore a permanent dark gradient. Replace the old blur/scale reveal with restrained 300ms directional transform/opacity transitions. The six originals and twelve responsive derivatives are unchanged.

## Image composition

The stable panoramic card is 12:5. Both native 1920×800 images fit without cropping. The 1920×1200 gameplay views use `object-fit: cover` anchored to the bottom: at native scale the upper 400px are outside the card, preserving the visible players, action and hotbar in the lower 800px. This is display framing, not source editing or additional zoom. The river-valley view loses the upper sky/FPS strip while retaining the valley and river. Upper scenery is cropped in panoramic card presentation; all source details remain available in the viewer. Visual owner review is still required, especially if a less panoramic framing is preferred.

Fullscreen always uses the original `url` without srcset, crop or transform, capped at native width and available viewport height. The river original still contains its FPS overlay: it has **not** been removed from fullscreen.

## Captions: before → after

Previously the visible caption repeated the accessible alt text. The following English examples show the separation now applied in all four locales:

| Image | Previous visible caption (now alt only) | New title | New sentence |
|---|---|---|---|
| 1 | Sunlit cherry grove overlooking grassy hills | Take the scenic route | Leave room for a detour when the view is worth it. |
| 2 | Lake beneath a cherry-covered hillside | A little further | Pick a spot on the far bank and see where the journey takes you. |
| 3 | Multiplayer gameplay on open rocky terrain | Better together | Bring a friend and turn an ordinary outing into a story worth sharing. |
| 4 | Pillager outpost with players and a crossbow | Plans can change | A quiet walk can become the adventure you remember most. |
| 5 | Nether lava landscape with a zombified piglin | Beyond the familiar | Step through the portal and find a different kind of adventure. |
| 6 | Multiplayer scene in a cherry grove | Make yourself at home | Find your favourite corner of the world and enjoy it together. |

## Final captions — en

| Image | Title | Sentence |
|---|---|---|
| 1 | Take the scenic route | Leave room for a detour when the view is worth it. |
| 2 | A little further | Pick a spot on the far bank and see where the journey takes you. |
| 3 | Better together | Bring a friend and turn an ordinary outing into a story worth sharing. |
| 4 | Plans can change | A quiet walk can become the adventure you remember most. |
| 5 | Beyond the familiar | Step through the portal and find a different kind of adventure. |
| 6 | Make yourself at home | Find your favourite corner of the world and enjoy it together. |

## Final captions — pt-PT

| Image | Title | Sentence |
|---|---|---|
| 1 | Vai pelo caminho mais bonito | Dá-te tempo para um desvio quando a vista merece. |
| 2 | Só mais um pouco | Escolhe um lugar na outra margem e descobre onde te leva o caminho. |
| 3 | Melhor com companhia | Leva um amigo e transforma um passeio numa história para contar. |
| 4 | Os planos podem mudar | Uma caminhada tranquila pode tornar-se a aventura de que mais te lembras. |
| 5 | Para lá do habitual | Atravessa o portal e descobre outra forma de aventura. |
| 6 | Sente-te em casa | Encontra o teu recanto favorito e aproveita-o com quem joga contigo. |

## Final captions — pt-BR

| Image | Title | Sentence |
|---|---|---|
| 1 | Vá pelo caminho mais bonito | Reserve tempo para um desvio quando a vista vale a pena. |
| 2 | Só mais um pouco | Escolha um lugar na outra margem e descubra aonde o caminho leva. |
| 3 | Melhor com companhia | Chame um amigo e transforme um passeio em uma história para contar. |
| 4 | Os planos podem mudar | Uma caminhada tranquila pode virar a aventura de que você mais se lembra. |
| 5 | Além do conhecido | Atravesse o portal e descubra outro jeito de se aventurar. |
| 6 | Sinta-se em casa | Encontre seu cantinho favorito e aproveite com quem joga com você. |

## Final captions — es

| Image | Title | Sentence |
|---|---|---|
| 1 | Elige el camino más bonito | Deja tiempo para un desvío cuando las vistas lo merezcan. |
| 2 | Un poco más allá | Elige un lugar en la otra orilla y descubre adónde te lleva el camino. |
| 3 | Mejor en compañía | Invita a un amigo y convierte un paseo en una historia que contar. |
| 4 | Los planes pueden cambiar | Un paseo tranquilo puede convertirse en la aventura que más recuerdes. |
| 5 | Más allá de lo conocido | Cruza el portal y descubre otra forma de aventura. |
| 6 | Siéntete como en casa | Encuentra tu rincón favorito y disfrútalo con quienes juegan contigo. |

## Interaction and accessibility

- No visible Screenshots label or counter; accessible group and image-position labels remain.
- Next moves the image to the right; previous moves it to the left. Incoming and outgoing images use 300ms opacity/translate transitions, with the outgoing image retained until the new source loads.
- The active dot indicator moves between fixed 28px positions. At wrap boundaries the old indicator exits in the navigation direction and the new one enters from the matching edge. Dot and arrow controls have 44px-high touch targets.
- Hover/focus darkens only the interactive image state; default image brightness is unchanged. An expand icon makes click-to-open discoverable. Arrows darken and invert foreground contrast on hover.
- Reuses the installed Radix Dialog primitives: modal semantics, title/description, focus trap, localized close control, Escape and outside-click dismissal, scroll lock and focus restoration. No dependency added. Left/right keys and viewer arrows browse the same collection. Swipe continues in the card and does not intentionally open the viewer.
- Autoplay pauses on hover/focus and while the viewer is open. Reduced-motion disables autoplay and animated transitions; manual controls remain usable.
- Original native dimensions and responsive 768/1280/1920 selection retained. Only the next responsive image is preloaded; opening the viewer requests the native original on demand.

## Validation and limitations

Focused component/public-route tests cover editorial/alt separation, no visible counter, direction and wrap, manual and timed navigation, reduced-motion, native lightbox source, arrows, Escape, focus restoration/trapping and scroll locking. Final gates: 197 tests across 19 files passed (11 gallery tests); application typecheck passed; production build passed; lint 0 errors / 24 pre-existing warnings; git diff --check passed. Existing Browserslist, bundle-size and unrelated test warnings remain.

Actual desktop/mobile browser acceptance is **not** claimed. The bounded Preview HTTP probe failed at proxy CONNECT before any server response; the prior cloud browser could not reach the local build. Automated DOM tests and CSS geometry are technical checks, not rendered visual proof. Owner Preview review remains required for panoramic framing, caption rhythm, transitions and touch behavior. No protection bypass was attempted.
