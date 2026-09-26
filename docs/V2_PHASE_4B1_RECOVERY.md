# Fase 4B.1 — recuperação funcional, conteúdo e UX

Branch `v2/full-redesign`. Base local `43ce445d32cc62fe818a68a28edeb0376492454e`, remota `063ee1c9031c0e966763dbf5ae32964e11c7fc16`; árvores idênticas no início. Não houve merge, publicação em produção, remoção de rotas ou de fontes legadas.

## Inventário inicial, antes das alterações desta fase

- `src/App.tsx` montava `/`, `/projects`, `/modpacks`, `/modpacks/:slug`, `/launchers`, `/launchers/:slug`, `/news`, `/news/:slug`, `/guides`, `/guides/:slug`, `/faq`, `/about`, `/support`, `/legal`, os redirecionamentos legais, `/admin`, `/admin/editor` e `*`.
- `src/content/publicResolver.ts` selecionava V2 validado primeiro; conservava fallbacks para `astralrinth`, `sklauncher`, cinco slugs de notícias e três grupos FAQ. O catálogo público 4B filtrava os dois launchers legados da listagem embora os seus URLs de detalhe ainda respondessem.
- Projetos V2: `mac-native` beta com release `mac-native-0-3-1` e compatibilidade 1.21.11/Fabric/macOS; `crafttoons` como protótipo interno sem release. Legacy `modpacks.json` ainda contém os dois projetos e `Soon`, bem como números, benchmarks, versões e instalação sem validação. `Soon` não tem rota pública de detalhe V2.
- Launchers V2 antes desta fase: `prism`, `modrinth-app`, `atlauncher`, `curseforge-app`, `multimc`, `gdlauncher`. Legacy `src/lib/launchers.ts`: os mesmos seis e ainda `astralrinth`, `sklauncher`, total oito. A UI 4B mostrava seis na lista; duas rotas antigas tinham uma página de revisão.
- V2 `articles.json`, `guides.json`, `faq.json` estavam vazios; cinco notícias e três categorias FAQ legadas não podiam ser apresentadas como informação revista. Homepage V2 ocultava métricas. `settings.json` V2 continha só a identidade; `site.json` legado mantinha links/contacto, identidade, ads e contadores não validados.
- Admin já existia em `/admin` (login) e `/admin/editor` (Dashboard, coleções V2, drafts, system e editores legados). Um link discreto “Admin” estava no footer. O browser usa `sessionStorage` e chama a função `admin-cms` em `VITE_SUPABASE_URL`; a Edge autentica e detém o acesso de escrita GitHub. O editor verificava `adminApi.me()` no efeito, mas montava a shell antes da verificação e `/admin` não redirecionava sessões válidas.
- `ThemeProvider` usava a preferência `apl.theme` (`system`, `light`, `dark`), escutava o sistema e trocava classes imediatamente. A pré-aplicação do tema estava no fim do `<body>`, e `HeroLandscape` substituía diretamente o `src` Day/Night, causando risco de frame vazio e flash.

## Launchers — regressão e decisão por campo

| Launcher/slug | Existia antes da V2? | 4B V2/listado? | Após 4B.1 | Fonte de identidade e links | Campos em revisão |
| --- | --- | --- | --- | --- | --- |
| `prism` | Sim | Sim/Sim | V2 listado | https://prismlauncher.org/ | Scores e comparações antigos |
| `modrinth-app` | Sim | Sim/Sim | V2 listado | https://modrinth.com/app | Scores e recomendações antigas |
| `atlauncher` | Sim | Sim/Sim | V2 listado | https://atlauncher.com/downloads | Scores e comparações antigos |
| `curseforge-app` | Sim | Sim/Sim | V2 listado | https://www.curseforge.com/download/app | Scores e recomendações antigas |
| `multimc` | Sim | Sim/Sim | V2 listado | https://multimc.org/ | Scores e comparações antigos |
| `gdlauncher` | Sim | Sim/Sim | V2 listado | https://gdlauncher.com/ | Scores e comparações antigos |
| `sklauncher` | Sim | Não/Não; URL antiga respondia | V2 listado e detalhe factual | https://skmedix.pl/ e https://docs.skmedix.pl/getting-started/install (plataformas Windows/Linux/macOS) | Segurança, offline/auth, scores e recomendações antigas não foram migrados |
| `astralrinth` | Sim | Não/Não; URL antiga respondia | Legacy listado apenas com nome, estado editorial e slug de detalhe | Identidade histórica no Git; o repositório do publicador mudou de domínio; distribuição/autenticação ainda por decidir | **Sem** links ou downloads encurtados, ratings, endorsos, claims de licenciamento/autenticação ou segurança. Proprietário deve confirmar proveniência/distribuição antes de promover a V2. |

Em particular, os URLs `ouo.io` do legacy AstralRinth **não** voltaram à UI. O nome continua encontrável no catálogo, distinguindo uma identidade histórica de metadados/links não aprovados. Nenhum launcher é apresentado como alternativa à autenticação ou licença de Minecraft.

## Mac Native — fontes e decisão editorial

- Fonte principal: https://modrinth.com/modpack/mac-native ; release publicada: https://modrinth.com/modpack/mac-native/version/0.3.1 . A página oficial descreve Apple Silicon e Intel, foco em macOS, suporte háptico em trackpads MacBook integrados; a release 0.3.1 confirma Beta, Minecraft 1.21.11, Fabric, client-side e as notas já resumidas em `releases.json`. A página `/versions` carrega a lista dinamicamente; este commit **não** garante que 0.3.1 continuará a ser a release mais recente depois desta verificação. A interface diz “Published release”.
- Instalação editorial própria em pt-PT: passos conservadores para abrir a página oficial e usar o catálogo do Modrinth App. A documentação oficial confirma o fluxo Browse → Install: https://support.modrinth.com/en/articles/8802250-modpacks-on-modrinth . Não se reaproveitaram as instruções antigas de `brew`, Java, RAM ou temporização de shaders.
- `projects.json` agora inclui resumo, descrição, três pontos de enfoque com linguagem limitada à publicação oficial, `compatibility.environment=client`, instalação e FAQ específica. O esquema V2 ganha `knownIssues` opcional e `compatibility.environment` enum limitado; ambos são editáveis no CMS existente. Não foram acrescentados requisitos de RAM nem problemas específicos sem confirmação.
- `/modpacks/mac-native` apresenta hero próprio, Beta, CTA da release publicada, link do projeto oficial, ficha técnica, descrição, objetivos, compatibilidade, instalação, notas de release e ligação à lista de mods, FAQ e ligações para suporte/outros projetos. Requisitos adicionais, imagens e problemas conhecidos só aparecem se estiverem publicados em V2. A arte do hero continua **provisória** e nunca é tratada como screenshot do produto.
- Não migrados: `modpacks.json` traz benchmarks, ratings, contadores, modCount, mirrors, GitHub/CurseForge, “zero Rosetta”, especificações de RAM/Java, instalação e changelogs 1.4.x em conflito com a publicação. `reviews.json` carece de proveniência. Permanecem no legado, sem surgir na página.

## Acesso ao CMS, navegação e outros conteúdos

1. Abrir diretamente `<origem do Preview>/admin` ou o link discreto **Owner CMS** no footer. Com sessão válida, `/admin` confirma-a na Edge e vai para `/admin/editor`; sem sessão, apresenta o formulário da palavra-passe. Depois do login a API devolve o JWT de sessão ao browser, que o guarda em `sessionStorage` e navega para `/admin/editor`.
2. `/admin/editor` passa por `AdminGate`: sem token redireciona para `/admin`; com token verifica `adminApi.me()` **antes de montar o CMS**. Em 401 a API limpa a sessão; se a API estiver indisponível há um aviso, sem abrir o editor. O `AdminEditor` conserva ainda a sua própria verificação e leitura versionada de ficheiros. Não existe segundo escritor.
3. Em cada Preview, configurar `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, a função `admin-cms`, `ADMIN_ORIGIN` igual à origem exata do Preview e `GITHUB_BRANCH=v2/full-redesign` **na função de Preview**, com token/permissões Git apenas na Edge. Antes de testar Publish/redeploy verificar que o deploy hook aponta **apenas para Preview**; se não houver isolamento, não o ativar. Não colocar tokens Git nem service role em `VITE_`. `docs/V2_PHASE_0_1.md` e `docs/V2_PHASE_3A.md` contêm o resto da configuração. O teste de login real depende das credenciais e infraestrutura externa do proprietário; não foi efetuada escrita CMS real nesta fase.
4. Footer oferece Mac Native, CraftToons, suporte e o acesso reservado ao CMS; menu móvel oferece atalhos para esses dois projetos e suporte. Desktop já tinha Home, Projects, Modpacks, Launchers, News, Guides, About e FAQ; Home e Projects oferecem os projetos. `index.html` deixa de descrever toda a marca como “premium modpacks” e aponta para o favicon realmente versionado. Slugs públicos permanecem intactos.
5. Home, Projects, CraftToons, News, Guides, About, Support e FAQ foram auditados sem migrar claims suspeitos: mantêm os projetos V2, empty states e os links/comunidade atuais. Cinco artigos e três categorias FAQ continuam pendentes de proveniência. O link Discord legado difere do da publicação Modrinth: requer aprovação do proprietário antes de migrar Site Settings. Não restaurámos métricas, avaliações, notícias ou FAQ não revistos.

## Tema, arte e limites

O tema inicial é aplicado no `<head>` antes de Vite carregar CSS; a preferência continua a ser `system/light/dark` e mudanças do sistema propagam-se. Backgrounds, surfaces, bordas, texto, ícones e sombras usam transições CSS de 320 ms; a arte da cena atual mantém-se visível enquanto a variante oposta carrega e só então faz crossfade de 340 ms. Uma única variante oposta **da cena presente** é pedida após breve inatividade, salvo preferência por redução de dados. `prefers-reduced-motion` suprime a animação. Em mobile o `<picture>` continua a usar a variante WebP própria sem crop destrutivo do ficheiro original.

Home usa o par Day/Night fornecido e aprovado na fase anterior. Projects, Mac Native e News continuam com imagens **provisórias**. Launchers, Guides, About e 404 continuam sem imagens finais. Nenhuma artwork nova foi criada; os slots e overlays atuais ficam substituíveis pela arte futura do proprietário. As imagens de Mac Native não são screenshots oficiais.

O browser cloud ficou bloqueado a abrir `127.0.0.1` durante o teste local e o processo local deixou de responder. Não há screenshots reais nem validação visual dos breakpoints 375, 390, 430, 768, 1024 e 1440 nesta execução; CSS e testes DOM não substituem essa inspeção. No Preview seguinte testar ambos os temas, mudança System/Light/Dark, scroll/overflow, menu móvel, crop, Mac Native, launcher em revisão, `/admin` e estados vazios nesses tamanhos.

## Verificação e riscos em aberto

Vitest cobre URLs estáveis, campos V2 opcionais e inválidos, Mac Native e dados recusados, oito launchers visíveis, rota SK e rota Astral, guard/login/CMS, persistência e mudanças de tema, manutenção da imagem antiga até a nova carregar e rotas públicas. No final desta fase: 40/40 testes verdes, app typecheck, lint 0 erros/65 avisos antigos, build concluído com aviso Browserslist antigo, 22/22 pares de contraste AA e `git diff --check` limpo. `deno` não está instalado neste ambiente; bundle/syntax check da Edge com esbuild e `node --check` concluído (141,8 kB de bundle de verificação).

Riscos: falta inspeção visual real e artworks finais; artigos/FAQ legados não revistos; origem Discord/contacto externos por validar; launchers legados ainda mantidos no bundle; instalação Mac Native depende de um fluxo externo mutável; o texto de UI 4B continua parcialmente em inglês apesar dos controlos de idioma; scripts Analytics/AdSense antigos em `index.html` continuam fora de um consentimento efetivo. A Fase 4B **não** está aprovada. Aprovar arte, origem editorial e acesso/configuração de Preview separadamente antes de qualquer cutover ou produção.
