# Fase 4B — experiência pública

Branch `v2/full-redesign`, criada a partir de `a2be3207d001c7d09bf799f715cf2e4458b441d7`. Sem alterações à produção, ao CMS, aos schemas Content V2 ou a `main`.

## Cobertura de rotas

| Rota | UI pública nesta fase | Origem dos dados / limites |
| --- | --- | --- |
| `/` | Cenário Day/Night aprovado, atalhos, cards, recursos, comunidade, estados vazios | Homepage V2, projetos V2; sem métricas antigas; notícias só V2 |
| `/projects`, `/modpacks` | Paisagem de caminhos Day/Night, pesquisa e cards responsivos | Projects V2; exclui `Soon`; `/modpacks` permanece |
| `/modpacks/mac-native` | Cenário próprio, badge Beta, compatibilidade, release e ligação oficial | Projects/Releases V2; 0.3.1 e Modrinth já validados na 3B.2; sem reviews/download counts |
| `/modpacks/crafttoons` | Teaser próprio | `internal-prototype` internamente, `In Development` publicamente; sem versão, download, benchmark ou data |
| `/launchers`, `/launchers/:slug` | Pesquisa, cards e detalhe | Seis launchers V2; `astralrinth` e `sklauncher` mantêm URL com estado de revisão, sem links não verificados |
| `/news`, `/news/:slug` | Cenário editorial Day/Night, pesquisa, cards, leitura | Apenas artigos publicados V2; cinco slugs legados mantêm página de revisão sem reproduzir conteúdo ainda não validado |
| `/guides`, `/guides/:slug` | Pesquisa, leitura e estado vazio | Guides V2 publicados; coleção vazia no commit de base |
| `/faq` | Acordeões e estado vazio | Apenas FAQ V2 publicados; três categorias legadas aguardam revisão |
| `/about`, `/support`, `/legal`, `/legal/privacy`, `/legal/terms`, `*` | Hero, painéis, comunidade, legal, 404 e footer comuns | Texto factual existente; sem slogans definitivos; redirecionamentos legais preservados |

O `App.tsx` aponta as rotas públicas para `PublicExperience.tsx`; os componentes antigos continuam versionados para uma remoção separada. `publicResolver.ts` continua centralizando V2 e fallback. Os detalhes ainda não verificados recebem uma apresentação neutra na rota original, com SEO próprio, enquanto o CMS retém os ficheiros e o fluxo Draft → Preview → Publish. Novos artigos e FAQ publicados V2 aparecem automaticamente. A autenticação, a validação Zod, a concorrência e a sanitização de Markdown não foram alteradas.

## Linguagem visual e interação

Mantêm-se os tokens Day/Night da 4A.1, a stack tipográfica de sistema e as primitives existentes. `experience.css` define a gramática comum de header, menu móvel com `Sheet`, botões, cards, grids, pesquisa, badges, painéis de leitura, estados vazios, notices e footer. O modo Light usa superfícies naturais claras; o Dark usa azul profundo e superfícies frias. Gradients de leitura são CSS e o texto nunca está gravado na imagem. CTAs e ícones têm área mínima de 44 px; `:focus-visible` e `prefers-reduced-motion` continuam globais. O seletor de tema suporta System/Light/Dark e observa mudanças do sistema, sem descarregar Day e Night simultaneamente. Idiomas existentes continuam disponíveis na navegação; vários rótulos novos de interface ainda são provisoriamente ingleses e precisam da revisão linguística antes do cutover.

Mobile primeiro: <=380 px ajusta largura e CTAs; <=640 px empilha cards e painéis, transforma a navegação rápida em grelha e preserva o foco da arte com crop mobile; <=850 px empilha detalhe/sidebar; <1280 px usa menu acessível; desktop e wide desktop têm container limitado. Os filtros usam campos de pesquisa nativos e estados vazios; o menu abre por teclado, fecha por Escape e fecha depois da navegação através do Radix Sheet. A validação visual em browsers reais e dispositivos permanece obrigatória.

## Arte

`HeroLandscape` escolhe um único ficheiro WebP por tema e breakpoint com `<picture>`. `/brand/overlook-{day,night}{-mobile}.webp` contém **as duas imagens originais aprovadas pelo proprietário**, apenas convertidas e cortadas para entrega; não foram redesenhadas. `/brand/projects-*` é exploração original provisória de caminhos, usada em Projects/Modpacks. `/brand/mac-*` é exploração original provisória da experiência Mac Native; `/brand/news-*` é exploração original provisória do ambiente editorial. Estas últimas seis composições Day/Night são **propostas de arte** para aprovação visual no Preview e não representam produtos, screenshots ou fatos. Os restantes heroes usam tokens, espaço e detalhe discreto, sem reutilizar uma grande ilustração alheia ao contexto. O panda ilustrado continua provisório e substituível; não se usa artwork de Shirokuma Cafe nem outros personagens protegidos.

## Verdade editorial e dependências

- Mac Native: beta, V2 com release 0.3.1 e ligação Modrinth já documentadas na 3B.2. Não foram importadas métricas nem claims das mockups.
- CraftToons: teaser sem release. `Soon` fica no legado histórico, invisível.
- Launchers: seis V2 visíveis; dois legados com slug preservado, conteúdo suspenso até confirmação externa. As recomendações/rating fixos antigos não aparecem.
- News: cinco artigos legados sem proveniência aprovada ficam ocultos do índice, mas o slug responde com estado editorial. Nenhum artigo novo foi inventado.
- Guides e FAQ V2: estados vazios válidos; três categorias FAQ legadas não surgem como fatos.
- O resolver, `src/content/index.ts`, `src/lib/launchers.ts` e conteúdo legado continuam no bundle por causa dos imports necessários ao fallback. Admin e readers legados não foram removidos.
- O aviso de privacidade deixou de chamar “consentimento” ao botão: o HTML herdado carrega scripts Google antes de React; a nova UI diz explicitamente que o aviso não os controla. **Bloqueio pendente:** rever consentimento real, scripts, AdSense/Analytics e política legal num trabalho específico. `index.html` também conserva title/OG description legados que descrevem apenas modpacks e requer revisão separada. Não se deve aprovar o aviso como mecanismo de consentimento.

## Verificação e limites

Vitest cobre Home, CraftToons, Mac Native, pesquisa de projetos/launchers, antigos slugs, News/Guides/FAQ vazios, seleção de artwork, além dos testes de CMS/Edge anteriores. Typecheck app, build, lint e contraste são os gates. A análise estática verifica 22 pares de tokens AA; o contraste composto texto + arte deve ser inspecionado no Preview. Também é necessária revisão visual e de teclado em 320, 390, 768, 1024, 1440 e >=1920 px, ambos os temas, incluindo menu, leitura, filtros e 404. O projeto não inclui browser local disponível nesta execução, portanto não há screenshots verificadas por browser.

Gates executados: Vitest 33/33 (25 existentes + 8 novos), app TypeScript sem erros, build concluído, lint 0 erros e 65 avisos preexistentes, 22/22 pares de contraste AA, `git diff --check` sem alterações inválidas. O bundle minificado de base 4A.1 era JS 1 253 835 B e CSS 93 166 B; agora JS 593 106 B (−660 729 B, −52.7%) e CSS 113 705 B (+20 539 B). A fase removeu rotas antigas do bundle carregado inicialmente e substituiu a animação pesada do aviso de privacidade, mas a arquitetura continua a incluir todo o CMS na mesma entrada; recomenda-se lazy loading das rotas admin num commit posterior. Imagens públicas são servidas sob demanda; as variantes modernas ocupam cerca de 2.1 MiB somadas em disco, mas só uma variante por cena/tema/breakpoint entra em cada visita. Não foi acrescentada biblioteca visual. O aviso Browserslist antiga permaneceu no build; os testes em MemoryRouter emitem avisos sobre opções futuras do React Router.

## Questões para revisão do proprietário

1. Aprovar ou rever visualmente as novas artes provisórias de Projects, Mac Native e News e a legibilidade real em vários ecrãs; a Home usa os assets aprovados.
2. Decidir a proveniência de AstralRinth/SKLauncher, cinco notícias e FAQ antigo antes de restaurar qualquer texto. Os slugs mantêm-se, mas estas páginas não contêm informação factual enquanto não houver revisão.
3. Rever copy de interface e traduções completas. Escolher eventual slogan e símbolo/mascote finais. Nenhum foi definido neste commit.
4. Separar um trabalho de privacidade para gating real dos scripts do HTML e revisão de política/metadata; não tratar o aviso informativo como consentimento.
5. Após inspeção e aprovação do Preview, considerar remoção em commit separado das páginas antigas já sem consumidores, code splitting do CMS e testes visuais automatizados.
