# Fase 4B.2.1 — produto, dados públicos, idiomas e acesso CMS

## Estado e compatibilidade

Base remota auditada: `c7e77f8` na branch `v2/full-redesign`. A worktree local antiga em `43ce445` continha alterações da fase anterior; ficou preservada em `stash@{0}` (`preserve pre-4B2.1 worktree from 43ce445`), sem ser reaplicada. A implementação parte da árvore remota limpa. Não foi feito merge nem alteração de produção.

`/modpacks` é agora o hub público único de Mac Native (beta, publicado) e CraftToons (protótipo interno apresentado como “In Development”). `/projects` continua acessível para links históricos por redirecionamento HTTP permanente em `vercel.json`, com redirecionamento SPA de reserva. Todas as ligações de navegação pública e breadcrumbs apontam para `/modpacks`. Não foi criada nova categoria nem migrado `Soon`. A arte interna ainda tem o identificador técnico `projects`, sem novo conteúdo público.

## Mac Native: fronteiras de dados

| Dado | Dono | Apresentação |
| --- | --- | --- |
| Downloads totais e followers | GET público `https://api.modrinth.com/v2/project/mac-native` | Só se a resposta JSON for válida; atribuídos ao Modrinth, nunca a analytics do site |
| Release, versão, canal, compatibilidade específica, changelog, link de download | `releases.json` V2 publicado, curado da fonte oficial | O primeiro slug listado em `Project.releaseSlugs` define a release principal; mudar a publicação V2 altera a página sem alterar JSX |
| Proposta, features, instalação, FAQ, compatibilidade base | `projects.json` V2 publicado | Campos opcionais, omitidos quando ausentes |
| Identidade genérica de Labs e strings de interface | design e `i18n.json` | Não substituem factos de releases |

`src/lib/modrinthStats.ts` extrai um slug **apenas** de `https://modrinth.com/modpack/<slug>` publicado no Project, consulta a API JSON oficial em background com timeout de cinco segundos e valida inteiros seguros não negativos. React Query deduplica pedidos, mantém os dados da sessão por até uma hora e considera-os frescos durante **15 minutos**. Falhas de rede, CORS, estado HTTP ou formato ocultam as duas métricas; CTA, release e instalação continuam disponíveis. Uma nova visita depois da expiração pede dados de novo. O cache é **por browser**, sem proxy nem segredo; não garante uma única chamada entre visitantes. Futuramente, se escala/quotas o exigirem, um cache no servidor pode substituir esta camada sem alterar o componente. Não se fazem fetches para outros projetos nem se inferem downloads de tráfego do site.

## Idiomas e origem editorial

`src/content/i18n.json` contém a UI comum em `en`, `pt-PT`, `pt-BR`, `es`, incluindo navegação, modpacks, estados, menus, apoio, pesquisas, alertas e rótulos do Modrinth. A preferência permanece em `localStorage` (`apl.locale`), aplica `lang` ao documento e funciona em links diretos. As chaves foram equalizadas nos quatro dicionários; chaves desconhecidas não são mostradas como texto ao visitante. Os nomes próprios dos projetos, provedores e plataformas mantêm-se.

Conteúdo editorial V2 **não** foi traduzido artificialmente. `localizeItem` usa `translations[requestedLocale].fields` apenas para `name`, `summary`, `description`, `body` presentes e não vazios; cada campo em falta recua ao conteúdo editorial original do item. Esta resolução é usada em cards e detalhes de projetos, launchers, notícias, guias, grupos FAQ e identidade Site Settings; a pesquisa utiliza os nomes/resumos visíveis no idioma selecionado. Os `sourceLocale` existentes continuam como foram publicados. O CMS `V2Workspace` já edita o idioma de autoria e traduções opcionais desses campos e agora permite selecionar o idioma na **pré-visualização privada**, usando o mesmo fallback. Segue Draft → Preview → Publish, revisions, conflitos, validação Zod e Markdown seguro. Sem publicação V2, a tradução não aparece publicamente. Não se adicionaram traduções às coleções existentes.

Auditoria estática de texto JSX nas rotas públicas montadas: os únicos textos JSX literais deixados são nomes próprios (`AlahPanda Labs`, `Mac Native`, `CraftToons`, `Discord`) e a sigla `FAQ`. As etiquetas de UI, acessibilidade, SEO de páginas de coleção, placeholders e aviso informativo de privacidade usam `i18n.json`; as quatro coleções partilham as mesmas chaves (incluindo rótulos de níveis e estados). Avisos editoriais da Homepage, quando publicados, permanecem no idioma original. Os títulos e descrições SEO editoriais de items V2 podem continuar no idioma original se a tradução do próprio SEO não foi aprovada no modelo; a canonical usa a URL de rota, sem duplicar `/projects`.

### Conteúdo ainda na língua de origem / revisão necessária

- Mac Native: descrição, features estruturadas, instalação e FAQ são editoriais pt-PT; release e changelog têm origem en. Os campos estruturados não possuem ainda tradução por subitem no schema. O texto permanece na língua de origem em vez de receber traduções não aprovadas.
- Launchers V2: nomes/descrições de origem mantêm-se até revisão/tradução no CMS. AstralRinth e notícias legadas em revisão não se tornam factos pelo seletor de idioma.
- FAQ V2: perguntas e respostas estruturadas continuam no idioma publicado, sem traduções automáticas.
- Homepage V2: hero, notices e settings estruturados ainda não têm traduções por subcampo; títulos vazios usam strings de UI traduzidas. Site Settings mantém apenas identidade aprovada, não afirmações novas.
- A política legal tem corpo editorial em inglês, explicitamente marcado `lang="en"`; navegação e hero estão traduzidos. A tradução legal requer revisão do proprietário e revisão jurídica. O aviso de privacidade é só informativo e não bloqueia os scripts antigos de Analytics/Ads antes de consentimento; esse bloqueio continua separado.
- A área `/admin` e o editor continuam com rótulos internos em inglês; a fase prometeu a experiência **pública**, não tradução integral do espaço de trabalho.

## Autenticação e publicação

Entrada `/admin` → Edge `admin-cms/login` → JWT HMAC de oito horas em `sessionStorage` → `/admin/editor` com guard server-side. A Edge valida o origin exato, password `ADMIN_PASSWORD`, secret de assinatura `ADMIN_JWT_SECRET`, revisão dos drafts e SHA do conteúdo; apenas a Edge escreve no GitHub. Não foi adicionado um segundo percurso de escrita, password default ou token no browser. Procedimento operacional e separação Preview/Production: [OWNER_CMS_ACCESS.md](OWNER_CMS_ACCESS.md). Nenhum secret foi alterado remotamente nesta fase.

## Limites e próximos passos

**Verificação local:** 62/62 testes Vitest; typecheck app e Edge sem erros; lint 0 erros e 65 avisos antigos; build concluído; 22/22 pares de contraste Day/Night AA; bundle/syntax da Edge 142,1 kB e `node --check` sem erros; `git diff --check` limpo. Deno não está instalado. Face ao baseline 4B.2, o JS de entrada minificado passou de 580,39 para 600,61 kB (+20,22 kB, ~3,5%; inclui os dicionários e a integração), CSS manteve 120,71 kB, AdminEditor passou de 52,89 para 53,13 kB. Não foi adicionada dependência visual nem artwork. Testes da API usam respostas simuladas e não confirmam ligação de rede real.

Avaliar no Preview a navegação, labels e a resposta de métricas com rede real; os testes não confirmam conectividade ao Modrinth no browser de produção. O redirecionamento HTTP permanente só é verificável após deployment **de Preview**. Não houve browser gráfico nem screenshots nesta fase, apenas auditoria estática de JSX e testes da interface. Confirmar isolamento do projeto Supabase antes de qualquer configuração do owner. A fase 4B.3 continua responsável pela arte final aprovada, QA visual real e revisão de traduções editoriais/publicações; a Fase 4B não fica aprovada por uma build verde.
