# Fase 4B.2.3 — Owner Control Panel V2

## Base e limites

- Branch: `v2/full-redesign`; base local/remota auditada: `92461eff4ab96670cb86d568d4f1a9a6d7f1782f`. Nenhum commit posterior existia no início. O stash histórico `stash@{0}` (`preserve pre-4B2.1 worktree from 43ce445`) não foi aplicado.
- O conceito aprovado do dashboard é uma referência de estrutura, densidade, hierarquia, navy e comportamento, não uma fonte de números, artigos, releases ou autenticação. A imagem original encontra-se no pedido do proprietário, não foi integrada no bundle.
- Sem merge em `main`, publicação CMS real ou mudança de secrets/projeto Supabase/produção. A função Preview `admin-cms/me` respondeu **401 a pedido anónimo**, o que verifica apenas a rejeição sem sessão; login real e operação autenticada exigem uma sessão do proprietário no Preview.

## Arquitetura e rotas

`/admin` continua a ser o login existente; `AdminGate` valida a sessão na Edge antes de montar `/admin/editor/*`. A página principal possui sidebar e topbar próprios, pesquisa V2 e navegação por rota. O browser só recebe o JWT temporário em `sessionStorage`; não recebe `ADMIN_PASSWORD`, service role nem `GITHUB_TOKEN`.

| Rota dentro de `/admin/editor` | Origem e operação |
| --- | --- |
| `/` | Dashboard: contagens de coleções V2 lidas via Edge, drafts privados, traduções calculadas, status de Edge/branch e métricas públicas Modrinth se disponíveis. |
| `/ai` | Revisão manual de proposta Content V2 com validação, diff estruturado e **Save private draft**. Sem fornecedor IA ligado. |
| `/modpacks`, `/launchers`, `/articles`, `/guides`, `/faq`, `/releases` | Listas por coleção, pesquisa, published/draft, edição tipada, relações, media, SEO e traduções. O resumo de modpacks mostra versões V2 relacionadas; métricas Mac Native vêm apenas da API pública Modrinth. |
| `/media` | Índice de media já referida por entradas V2, sem upload paralelo. |
| `/locales` | Idioma e filtro por original, completo, parcial, em falta, revisão ou indisponível; abre o item/idioma no editor. |
| `/homepage`, `/navigation`, `/seo`, `/settings` | Conteúdo da Home e facetas das Site Settings V2. Navigation/SEO partilham a coleção Settings, sem segundo ficheiro de escrita. |
| `/drafts` | Revisões e datas **reais** devolvidas pela Edge, com ligação ao editor. |
| `/deployments`, `/activity` | Configuração que a Edge consegue confirmar; deployment, saúde externa e feed não ligado aparecem **Unknown**, sem tempos/eventos simulados. Não há botão de Production deploy. |
| `/advanced/legacy` | Inventário histórico **apenas leitura**. Faz read autenticado dos ficheiros antigos apenas se esta rota for aberta. A implementação antiga foi preservada em `LegacyAdminEditor.tsx`, mas não é importada nem montada pelo novo painel. |

O admin principal não espera pelos cinco ficheiros legacy para iniciar. `AdminEditor` e `AdminGate` continuam lazy-loaded pela aplicação; AI Studio e inventário legacy têm chunks separados. `/admin/editor/*` suporta deep links; uma visita não autenticada volta a `/admin`.

## Conteúdo, draft e publicação

GitHub continua a ser fonte persistente pública. `adminApi.read` lê coleções V2 pela função autenticada; `parseCollection/parseItem` validam Zod (incluindo IDs estáveis únicos). O editor abre um item publicado ou um draft privado existente com `base_sha` e `revision`. Alterações → `draft-save` → preview privado → `draft-publish` manual. A UI só ativa Publish após abrir a pré-visualização **do draft guardado**, confirmar a identidade da branch/repositório em `adminApi.status` (`AlahPanda/panda-forge-labs` / `v2/full-redesign`) e retirar traduções ainda marcadas `needs-review`. Guardar novamente reinicia a revisão do preview. O servidor mantém JWT, origin, revisão e SHA como autoridade de segurança; a validação de `parseCollection` na Edge também rejeita publicação de traduções com texto `needs-review`. Os controles na UI são uma proteção adicional. O commit de publicação dispara depois o build Preview; não é uma publicação instantânea da página.

RichMarkdown continua a fornecer o preview sanitizado. O código público importa apenas ficheiros V2 **committed**, não a tabela privada de drafts. A pré-visualização do editor é privada dentro do CMS, não uma URL pública. Não há escrita GitHub pelo browser nem caminho de produção adicionado.

### FAQ: auditoria e correção

Antes: `src/content/faq.json` continha grupos General/Performance/Support, mas `/faq` e a pesquisa apresentavam somente FAQ V2, ainda vazia. Assim a página mostrava “No answers published yet” apesar de haver FAQ histórica. Agora `src/content/v2/faq.json` possui **uma** pergunta de General sobre conta Minecraft com resposta baseada nas [instruções oficiais de conta Minecraft](https://www.minecraft.net/en-us/article/how-create-minecraft-account). O texto legado dizia “paid Java Edition account from Mojang”, o que não foi copiado: a fonte oficial descreve login por conta Microsoft com acesso ao jogo. Não foram migradas recomendações sobre launchers, promessas de desempenho ou regras de redistribuição sem revisão do proprietário.

`publicFaq()` escolhe o grupo General V2 pelo slug e mantém Performance/Support apenas como registos legacy para auditoria; `FaqExperience` **não apresenta** esses grupos pendentes. No futuro: editar `/admin/editor/faq?entry=general`, guardar draft privado, rever preview e publicar pela Edge para a branch Preview; só o JSON V2 validado e committed chega à rota pública. As outras perguntas são decisões editoriais pendentes, não respostas em produção.

## Localization

- UI pública: dicionário existente `src/content/i18n.json`, quatro idiomas `pt-PT`, `pt-BR`, `en`, `es`. Rótulos novos do login e loading localizados. Shell/editor V2 usam `adminText.ts` e `editorLabels.ts`, mantendo nomes próprios e identificadores técnicos como tal.
- Conteúdo V2: `sourceLocale` preserva o original. `translations[locale].fields` cobre texto simples, instalação, changelog, SEO, hero e introduções opcionais; `structured` cobre features, requisitos, FAQ, passos, avisos, secções, quick links, navegação/footer **quando há ID estável**. A ausência de um ID ou de um campo traduzido mantém o campo original. Um item `needs-review` permanece num **draft privado**; o resolver mostra o original ao público e a pré-visualização privada pode mostrar a proposta ainda em revisão. Git recusa texto `needs-review` na coleção V2.
- Não foram geradas traduções nem duplicado conteúdo. PT-PT e PT-BR continuam independentes. Um campo fonte sem tradução contribui como em falta, mesmo se o editor marcar o estado “complete”. Se um item não tem campos traduzíveis, o progresso mostra **indisponível**, nunca 100% inventado. Os números do dashboard são calculados apenas a partir das coleções V2 realmente lidas.
- O editor apresenta original junto ao campo traduzido e permite avançar por locale, inclusive perguntas/respostas com ID. A página Locales consulta coleções publicadas **e os drafts autenticados** para que o filtro Needs review inclua trabalho privado ainda pendente, identificado como draft. IDs de arrays são validados como únicos; os índices nunca servem para associar traduções.
- Limite: strings legadas não migradas e conteúdo editorial sem tradução continuam no idioma original conforme o fallback já estabelecido; o painel não traduz texto automaticamente nem transforma um estado de revisão em texto publicado.

## AI Studio

`ContentProposalProvider` descreve a fronteira de um futuro provider autenticado. **Não existe provider ligado**: prompt e ações de geração estão inativos e explicados como tal. O owner pode introduzir um item JSON Content V2 **completo** preparado por outra ferramenta; a UI valida schema/slug, compara campos atuais e propostos (inclusive caminhos de tradução), rejeita eliminação implícita de campos existentes e drafts com o mesmo slug, e só então permite guardar como draft privado. A Edge revalida e controla SHA/revisão. AI Studio não chama Publish, não recebe credentials de Git e não afirma que gerou conteúdo. Um futuro adapter deve ficar server-side, autenticar o owner, limitar o input e produzir proposta sujeita à mesma revisão.

## Dados de sistema e Preview

O dashboard mostra o estado confirmado pela função (`repo`, `branch`, armazenamento de drafts, presença de deploy hook). Sem endpoint de Vercel para latest deploy, health ou feed, esses dados ficam **Unknown**. O link de Preview só fica ativo se `VITE_PREVIEW_ORIGIN` (valor público opcional) for idêntico à origin aberta e `status.branch` for `v2/full-redesign`; este projeto não adicionou nem alterou a variável. Mesmo com link disponível, não se infere a saúde do deployment. Modrinth usa a integração pública já existente (`https://api.modrinth.com/v2/project/{slug}`), React Query cache de 15 minutos, timeout de cinco segundos e omissão de valor quando a API falha; CraftToons não recebe métricas, versões ou link de download inventados.

Para configuração do proprietário, password, JWT, `ADMIN_ORIGIN` e isolamento Preview/Production, consultar [OWNER_CMS_ACCESS.md](OWNER_CMS_ACCESS.md) e [V2_PREVIEW_INFRASTRUCTURE.md](V2_PREVIEW_INFRASTRUCTURE.md). Nenhum secret foi lido, alterado ou escrito nesta fase. A alteração do comentário explicativo em `supabase/functions/admin-cms/policy.ts` faz com que o workflow na branch publique no **projeto Supabase Preview fixado pelo workflow** a validação partilhada atualizada de `parseCollection`. Depois do push, confirmar no GitHub Actions se o deploy Preview concluiu antes de afirmar que a nova regra já está ativa no servidor; nenhuma ação altera Production.

## QA e limites

- Testes cobrem guard/deep links, criação de novo draft V2, coleções sem obrigatoriedade legacy, sidebar responsiva com teclado, isolamento legacy, FAQ pública, fila de revisão com drafts, traduções estruturadas e fallback, IDs duplicados, rejeição de texto `needs-review` na coleção Git, validação/diff de propostas, draft-only IA e Preview obrigatório antes de Publish. Testes existentes da Edge cobrem sessão/revisão/SHA e Markdown continua sanitizado.
- Gates finais: Vitest **77/77**, TypeScript app **OK**, TypeScript Edge **OK**, build **OK** (1769 módulos), `npm run lint` **0 errors / 66 warnings** (sobretudo código preexistente e o ficheiro LegacyAdminEditor preservado; há uma dependência `a` no efeito de `V2Workspace` a rever futuramente), 22 pares públicos e 7 pares Admin nos checks estáticos de contraste **OK**; Edge bundle 145,3 kB, sintaxe `node --check` **OK**. A primeira tentativa de lint coincidiu com a build Vite e falhou por um `vite.config.ts.timestamp-*.mjs` entretanto removido; a execução isolada do lint concluiu com código 0. A análise estática de contraste não substitui uma inspeção WCAG no browser.
- Bundle comparado com o build do commit base `92461ef`: entry pública 600,61 → **606,04 kB** (+5,43 kB, ~0,90%); CSS público 120,71 → **120,78 kB** (+0,07 kB). Shell Admin **53,26 kB** num chunk separado, Admin CSS **15,06 kB**; AI Studio **4,59 kB** e Legacy Archive **1,46 kB** lazy-loaded. Estes números são ficheiros não comprimidos reportados por Vite, não tráfego transferido no browser.
- Sem ferramenta de browser interativo disponível nesta sessão: **não houve inspeção visual real** nas larguras 1440/1280/1024/768, nem screenshot ou teste de login autenticado no Preview. O proprietário deve validar Preview visualmente e testar uma sessão/draft descartável antes de aprovar. Não publicar conteúdo de teste.
- Pendências funcionais deliberadas: provider IA ausente; integração Vercel para health/latest deployment e activity feed ausente; Media é catálogo de referências, sem upload; Home quick links e introduções das Settings têm schema/editor mas não são consumidos por todas as páginas públicas; `LegacyAdminEditor.tsx` histórico permanece no repositório sem rota ativa; revisão da restante FAQ legacy e traduções editoriais compete ao proprietário.

## Aceitação manual recomendada no Preview

1. Abrir `/admin` no Preview isolado, iniciar sessão com a password configurada pelo proprietário e confirmar redirecionamento. Sem sessão, `/admin/editor/faq?entry=general` deve voltar ao login.
2. Percorrer Dashboard, AI Studio, Modpacks, FAQ, Locales, Drafts, Deployments e Advanced/Legacy em 1440, 1280, 1024, 768 e mobile. Verificar sidebar com Escape, leitura de tabelas e sticky actions sem overflow.
3. Criar draft privado descartável de FAQ, alternar locale, validar fallback, guardar, fazer preview e descartar. Para validar Publish num item real, confirmar primeiro repositório/branch e aprovar a alteração editorial. Não testar com dados fictícios publicáveis.
4. Confirmar que estados Vercel sem API dizem Unknown, que os valores Modrinth dizem Unknown quando a API falha, que não surgem números de CraftToons e que conteúdo legacy continua fora da `/faq` pública.
