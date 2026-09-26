# Fase 4B.2 — experiência de produto e profundidade da informação

## Base e limites

Branch `v2/full-redesign`; baseline remoto `eb9b204c8f4f0d99af393b7aeed6df90bf235d0d`. A árvore local antes das alterações era igual à remota (`8d71a2ee812c78e0333b2323a67386737bec4424`); a referência local foi alinhada com a remota sem force push. Foram lidos `V2_PHASE_4B_FULL_REDESIGN.md` e `V2_PHASE_4B1_RECOVERY.md`. CMS, autenticação, Edge, conteúdo legado e rotas não foram removidos. Não há publicação em produção nem aprovação visual nesta fase.

## Jornada e páginas

| Etapa | Entrada pública | Continuação verificável |
| --- | --- | --- |
| Descobrir | Home com arte Day/Night já aprovada; headline candidata “You've seen this world before. Just not like this.”, substituível pelo campo Hero V2 | Projects, Mac Native, CraftToons, Launchers, Guides, News, About |
| Compreender | `/projects`, `/modpacks` mostram os dois projetos V2 sem filtro de marketplace; Mac Native tem página própria; CraftToons é teaser In Development | Detalhes do produto e informação publicada |
| Compatibilidade | `/modpacks/mac-native` mostra Minecraft, loader, plataforma, ambiente e requisitos **somente quando disponíveis** | Instalação ancorada na própria página |
| Obter e instalar | Link da release oficial publicada V2; instruções editoriais do Project V2 | `/launchers` mantém oito identidades e links oficiais validados; `/support` leva às instruções |
| Ajuda | Support por intenção, FAQ global V2 com pesquisa/âncoras e FAQ própria de Mac Native | Guides e comunidade existente |
| Acompanhar | News V2 e relação por projectSlug, listas relacionadas quando publicadas | Página do projeto, lançamentos e comunidade |

Home separa explicitamente o flagship publicado do protótipo, dá destaque ao download real quando existir e mantém News vazio quando não há artigos publicados V2. A configuração Homepage V2 continua a controlar hero, featured slugs, notices e visibilidade de secções, sem métricas. O candidato de slogan é **copy provisória de marca**, não facto editorial ou tagline definitiva. Projects só mostra V2 aprovado, sem `Soon`. CraftToons conserva internamente `internal-prototype` e não mostra release, versão, download nem métricas; uma descrição longa futura só aparecerá se publicada.

Mac Native não tem versão fixa em JSX. A primeira release da lista `project.releaseSlugs` publicada e válida alimenta CTA/versão/canal. A lista é ordenada **explicitamente pelo CMS** (não por comparação de números de versão); o proprietário deve pôr a release desejada primeiro. Se uma release define `compatibility`, os seus campos substituem individualmente os valores genéricos do Project V2. Data, changelog, requisitos, media, known issues e FAQ são condicionais. O link para a lista de mods e histórico continua a apontar para a publicação oficial do Modrinth. O texto da FAQ de projeto que cita a release 0.3.1 requer revisão editorial quando a release principal mudar; esta fase não altera afirmações factuais aprovadas.

Launchers V2: `prism`, `modrinth-app`, `atlauncher`, `curseforge-app`, `multimc`, `gdlauncher`, `sklauncher`. `astralrinth` continua listado como identidade histórica do legado com página de revisão, sem download, links encurtados, ratings ou endossos. A relação com Mac Native é uma ligação à instalação, **não** uma afirmação de compatibilidade de cada launcher.

News e Guides permanecem vazios no Git público V2. O detalhe de um futuro artigo suporta autoria, data, categoria, media, Markdown, projeto e outros artigos do mesmo projeto. Um futuro guia suporta data de atualização, media, nível, etapas, relação a projeto e launcher e outros guias do mesmo projeto. Apenas entries V2 válidas, publicadas e relacionadas aparecem nessas áreas; notícias antigas aguardam revisão na sua URL preservada. FAQ V2 permite pesquisa, categorias, vínculo opcional ao projeto, respostas Markdown sanitizado e `id` opcional por pergunta para deep links estáveis. FAQ legado não foi promovido. About usa a identidade e os projetos existentes, sem história empresarial inventada; Support aponta para instalação, Launchers, Guides, FAQ específica/global, comunidade e destino Ko-fi já existente, sem sistema fictício de tickets.

## Propriedade dos dados

| Classe | Origem | Exemplos e limites |
| --- | --- | --- |
| A — CMS | `src/content/v2/*.json` publicados via fluxo Draft → Preview → Publish | Projects, Releases, Launchers, Articles, Guides, FAQ, Homepage, Site Settings; resumo, compatibilidade, instruções, media e SEO. Alterações de schema são opcionais e retrocompatíveis. |
| B — release | Releases V2 curadas com base na fonte oficial Modrinth | Versão publicada, canal, distribuição, changelog e compatibilidade opcional; sem sincronização automática nem afirmação de “latest”. |
| C — marca/UI | `src/content/i18n.json` e componentes | Navegação, labels, ajuda, estados vazios, copy de interface em en/pt-PT/pt-BR/es. A headline candidata é fallback de Home, subordinada ao Hero V2. |
| D — derivado | `publicResolver.ts` e componentes | Destaques, relações por slug, estado público amigável, paths `/modpacks/:slug`, releases ordenadas pelo projeto. Não se infere status pela versão. |
| Fallback operacional | `src/content/site.json` | Discord, email, Ko-fi e descrição até Site Settings V2 publicar equivalentes verificados; não se migram métricas, avaliações ou anúncios. |

O CMS V2 existente edita os novos campos opcionais: compatibilidade de Release, `updatedAt` e media de Guide, `publishedAt` de Article e `id` de FAQ. Mantém autenticação na Edge, drafts privados, revisões, concorrência otimista e sanitização. Uma publicação de release exige atualizar `releaseSlugs` na ordem desejada e rever compatibilidade e copy de FAQ; sem esse passo a interface não anuncia automaticamente uma versão que não foi editorialmente vinculada ao projeto.

## I18n, SEO, performance e acessibilidade

Foi ampliado o dicionário da interface nos quatro idiomas. Status públicos, navegação de apoio, descoberta, CTAs e labels principais de Mac Native, pesquisa e empty states usam `t()`; a ausência de chave continua a cair em inglês e depois na própria chave. **Lacuna editorial:** os textos V2 atuais têm origem pt-PT ou en e `translations: {}`; são mostrados no idioma de origem em outros locales. Títulos e descrições de launcher, texto de releases, legal, estados legados em revisão e alguns labels específicos ainda exigem revisão humana de tradução. A tagline candidata em inglês continua deliberadamente não traduzida até aprovação editorial.

`Seo` emite title, description, canonical sem query, OpenGraph/Twitter, imagem apenas se publicada (não usa mais `placeholder.svg`) e respeita `seo.noindex` das entidades V2. A aplicação é uma SPA com Helmet no cliente: crawlers que não executam JS podem não receber metadata específica da rota; SSR/pre-render e social preview real são pendências técnicas. Nenhum domínio canónico foi inventado no fallback de servidor.

`/admin`, `/admin/editor` e guard são lazy-loaded com Suspense; a rota do editor continua protegida por `AdminGate`. Bundle 4B.1: entrada JS ~606.33 kB e CSS 119.57 kB. Bundle 4B.2: entrada JS 580.39 kB (−25.94 kB, −4.3%), CSS 120.71 kB (+1.14 kB); chunks AdminEditor 52.89 kB, AdminLogin 2.49 kB, AdminGate 0.74 kB, adminApi 1.40 kB carregados na rota de proprietário. Números são ficheiros minificados não comprimidos; a entrada ainda inclui algumas dependências comuns. Sem novas bibliotecas ou arte.

Links/CTAs têm foco e targets existentes; `<details>` de FAQ é navegável por teclado, deep links de instalação/FAQ têm scroll margin para header sticky, imagens editoriais têm alt e a arte de hero permanece decorativa. O script de contraste estático passou 22/22 pares AA. Não houve browser gráfico local disponível nesta execução; **não há screenshots reais ou aprovação de overflow, crops, foco e composite text/art** para 375, 390, 430, 768, 1024 e 1440 px em Day/Night.

## Arte e bloqueios editoriais

| Estado | Superfície |
| --- | --- |
| Aprovado | Home Day/Night, apenas os derivados responsivos existentes |
| Provisório | Projects, Mac Native, News |
| Final pendente | CraftToons, Launchers, Guides, About, 404 |

Não foram geradas novas artes. `index.html` ainda carrega Google Analytics antes de consentimento efetivo e inclui metadado AdSense herdado. O aviso informativo não é consent manager; isto é um **bloqueio de privacidade separado**. Cinco notícias legadas e três categorias de FAQ permanecem sem revisão. AstralRinth precisa confirmação do proprietário. Nenhum número, review, benchmark ou artigo foi acrescentado. Os screenshots de Mac Native e os guias exigem conteúdo original aprovado. A opção `seo.noindex` é editorial, não substitui a política de robots para Preview.

## Verificação

- Vitest: 50/50, incluindo jornada Home, release futura sintética sem versão JSX fixa, optional sections, links Support, oito launchers, News/Guides vazio e fixture publicada, FAQ pesquisável, i18n, SEO, admin lazy+guard e testes anteriores de Edge/CMS.
- App TypeScript: passou. `tsconfig.node.json` continua com erro preexistente em `build/publishedNews.ts:21` sobre `addWatchFile`; não pertence à app nem foi modificado.
- ESLint: 0 erros, 65 avisos herdados. Vite build: passou, com aviso herdado de Browserslist antigo.
- Contraste: 22/22 AA estáticos. `git diff --check`: passou. Edge: esbuild bundle/syntax check passou (142.1 kB); Deno não disponível.
- Sem navegador local Chromium/Firefox/Playwright; não se substituiu inspeção visual por análise estática.

## Antes da 4B.3

1. Revisão visual real no Vercel Preview em seis larguras e ambos os temas, verificando arte, menu, layout, texto, scroll e foco. O proprietário aprova separadamente.
2. Substituir as três artes provisórias e fornecer artes finais pendentes sem crop destrutivo; conservar Home aprovada.
3. Rever copy de marca, artigos/FAQ legados, identidade AstralRinth, traduções editoriais e qualquer claims antigos conflitantes.
4. Planear privacidade/consentimento real e SEO de rotas para crawlers sociais; atualizar release V2/compatibilidade/FAQ quando a publicação oficial mudar.
5. Não tratar build verde como aprovação integral da Fase 4B.
