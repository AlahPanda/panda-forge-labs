# Fase 4A — Identidade visual e Design System V2

Base: `v2/security-foundation` em `ebf54b5`. Trabalho isolado em `v2/design-system`. Sem merge, produção ou redesign completo.

## Filosofia e âmbito

Cozy, premium, playful, clean e personal. Um pequeno estúdio que cria experiências diferentes; a identidade não depende de um produto Minecraft específico. Superfícies quentes e generosas, texto claro, raspberry controlado, panda ocasional. Não há gradientes luminosos, vidro esbatido obrigatório nem grelha tecnológica. A pequena amostra visível está no fundo global, header, footer, hero e cards V2. O resto do site mantém estrutura e conteúdo existentes; várias páginas ainda têm classes próprias a adaptar na 4B.

## Tokens (fonte de verdade: `src/index.css`, mapeamento: `tailwind.config.ts`)

Os valores HSL abaixo são os canais usados por `hsl(var(--token))` e por Tailwind. Os tokens antigos `signal`, `hairline`, `surface-elev`, `warn` e `ok` são aliases temporários, permitindo migração gradual.

| Papel | Light | Dark |
| --- | --- | --- |
| Background | `34 37% 96%` warm cream | `24 13% 12%` warm charcoal |
| Card / popover | `34 40% 99%` | `25 12% 16%` / `25 12% 17%` |
| Elevated / secondary | `34 29% 93%` / `32 26% 91%` | `25 11% 20%` / `25 10% 23%` |
| Foreground / muted | `25 21% 16%` / `25 14% 37%` | `35 20% 92%` / `30 12% 72%` |
| Border | `30 18% 83%` | `27 11% 32%` |
| Primary raspberry | `334 57% 40%` | `335 69% 73%` |
| Hover / subtle | `334 60% 33%` / `334 43% 93%` | `336 77% 81%` / `332 26% 25%` |

`accent` no mapeamento shadcn é uma superfície raspberry suave; `primary` é o accent forte de ações. `primary-foreground` é branco no Light e charcoal no Dark. Semantic colors independentes: success `151 44% 29%`/`150 45% 67%`, warning `32 72% 32%`/`40 78% 70%`, error `1 65% 38%`/`3 70% 70%`, info `205 52% 32%`/`204 62% 75%`. Estados: development=warning, alpha/beta=roxo (`267 38% 38%`/`271 65% 79%`), stable=success, archived=muted. Internamente `internal-prototype` apresenta-se publicamente como **In Development**. Estados nunca dependem da versão.

## Tipo, forma e ritmo

Fonte de UI: stack de sistema (`ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`), sem download de fontes ou direitos de fonte adicionais. Mono do sistema exclusivamente para metadata técnica e código. Escala recomendada: display 3–4.5rem, H1 2.25–4.5rem responsivo, H2 1.5–2.25rem, H3 1.25rem, body 1rem/1.5, small .875rem, label .75rem, code .8125rem. Header, hero e labels já demonstram a escala; aplicação integral às rotas fica para a 4B.

Radii: `--radius: .875rem`, `--radius-card: 1.25rem`; sombras `--shadow-card` e `--shadow-raised`, sem brilho. Espaçamento usa a escala Tailwind 4px/8px e `--space-section: clamp(3.5rem, 7vw, 6rem)` para secções futuras. Layout `container` com largura máxima 1400px e padding 1.5rem; responsive mobile first, com adaptação `sm`, `md`, `lg`, `2xl`.

## Motion e acesso

Durações `--motion-quick: 150ms`, `--motion-normal: 240ms` e easing `cubic-bezier(.2,.7,.2,1)`. Hover de superfície, press discreto, menu/dialog/tabs/tooltips através dos primitives Radix já existentes. Reveal não usa blur e começa sempre visível sem JS. Em `prefers-reduced-motion: reduce`, transições e animações param e conteúdo de reveal fica visível. Foco visível com outline de 2px e offset de 3px; áreas de toque de header ajustadas; botões só de ícone exigem `aria-label` via `IconButton`. Contraste de pares principais deve ser novamente inspecionado no Preview com conteúdo e dispositivos reais. O menu mobile já tem estado `aria-expanded`; os diálogos, tabs, selects e tooltips continuam com semântica Radix.

## Primitives e migração

Reutilizados: Button (`src/components/ui/button.tsx`, foco/disabled/press), Badge, Card (radius/sombra), Input, Select, Textarea, Tabs, Dialog, Tooltip, Alert, Skeleton e Separator existentes. Adicionados `Container`, `Divider`, `SectionHeader`, `EmptyState` e `IconButton` em `src/components/design-system/Primitives.tsx`, `ProjectStatusBadge` com uma tabela de estados em `ProjectStatus.tsx`, `PandaMark` vetorial monocromático provisório. `PublicV2Card` é o ContentCard/ProjectCard já em uso, agora com estado consistente; os antigos `ModpackCard`/`NewsCard` serão adaptados em 4B sem duplicar modelos. Notice usa Alert; Modal usa Dialog. Loading nos controles assíncronos existentes permanece responsabilidade dos respectivos fluxos: a biblioteca não deve inventar requests. Não se introduziram dependências externas.

## Tema e decisões

Mantém-se `apl.theme` e o toggle Light/Dark. Sem escolha gravada, o sistema operativo define o tema; escolha explícita persiste. Um script curto antes do mount evita flash da classe Dark, e o provider escuta mudanças de sistema apenas enquanto não há escolha explícita. O painel final System/Light/Dark e preferências do visitante continuam para fase posterior. A nova marca de panda é provisória e só aparece no shell/hero; a ilustração definitiva e o uso da marca existente dependem da aprovação visual do proprietário. A meta `theme-color` inicial é Light e pode ser sincronizada dinamicamente na 4B. Os assets do logo antigo permanecem no repositório para outras rotas e para revisão. Sem alterações a Content V2, editorial, publicidade ou analytics.

## Revisão visual pendente / 4B

Validar cor raspberry, forma do panda, densidade do header/hero, hierarquia em conteúdo técnico, Light/Dark com monitores reais e versão final do mascot. Na 4B adaptar páginas uma a uma, substituir aliases antigos, alinhar cards e formulários públicos e Admin de forma incremental, testar todos os breakpoints, automatizar auditoria de acessibilidade no Preview e avaliar o suporte explícito a System. Não remover leitores legados como parte do design.

## Verificação desta fase

- Vitest: 24/24 testes, 7 ficheiros; inclui estado público do protótipo, nome acessível de IconButton e persistência do tema.
- TypeScript aplicação (`tsconfig.app.json`): passa. `tsconfig.node.json`: erro preexistente em `build/publishedNews.ts:21` (`this.addWatchFile` inferido sem contexto de Plugin); build Vite passa. Não se modificou esta funcionalidade fora de escopo.
- Build: passa; aviso existente de chunk acima de 650 kB e base Browserslist antiga.
- Lint: zero erros; avisos preexistentes de `any`, Fast Refresh e require em ficheiros herdados. Aviso novo em ProjectStatus corrigido antes do commit.
- Acessibilidade estática disponível: testes Testing Library de nome acessível e estado, foco/reduced motion em CSS e cálculo de contraste WCAG 2.x para pares dominantes. Body Light 13.38:1, muted Light 5.90:1, botão Light 6.96:1; Body Dark 13.96:1, muted Dark 8.42:1, botão Dark 6.93:1; beta Light 8.38:1, Dark 7.10:1. Ainda falta auditoria automatizada no browser com conteúdo real e inspeção visual nos cinco tamanhos.
- Bundle minificado antes/depois: JS 1 252 544 → 1 253 994 bytes (+1 450, +0,12%); CSS 89 857 → 92 292 bytes (+2 435, +2,71%); logo legado 194 385 bytes inalterado e ainda usado noutros percursos. Nenhuma dependência nova ou vídeo/3D.
