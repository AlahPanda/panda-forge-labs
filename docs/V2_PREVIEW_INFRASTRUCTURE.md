# Fase 4B.2.1 — infraestrutura isolada e verificação real

## Estado recuperado

- Branch `v2/full-redesign`; baseline anterior `75ed166`; commit manual posterior `267bd61` acrescentou o workflow de deploy. O stash `preserve pre-4B2.1 worktree from 43ce445` continua preservado e não foi aplicado.
- Supabase Preview: `jnvckqlschyquzzfldrs`, `https://jnvckqlschyquzzfldrs.supabase.co`. O projeto histórico `ypfxaqqilqnbpxbttngy` não é um destino autorizado para esta fase.
- O proprietário reportou que aplicou `supabase/migrations/20260925_cms_drafts.sql` no projeto Preview com sucesso; a presença remota da tabela e as permissões ainda devem ser confirmadas no dashboard.

## Topologia e destinos

`GitHub v2/full-redesign` → `Vercel Preview (VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY)` → `Supabase Preview /functions/v1/admin-cms` → `public.cms_drafts (RLS, só service role)`; **Publish**, que não é testado nesta verificação, escreve na mesma branch GitHub mediante `GITHUB_BRANCH` e controlo de revisões.

O ficheiro `supabase/config.toml` usa o ref Preview e declara `verify_jwt = false` somente em `admin-cms`. A função valida a password no servidor e verifica tokens administrativos próprios para ações protegidas; drafts não são uma rota de leitura pública. `GITHUB_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET` e service role nunca devem estar em `VITE_*` nem no Git.

O workflow de GitHub Actions dispara apenas num push a `v2/full-redesign` que toque a função, a configuração Supabase ou o próprio workflow. Confirma `SUPABASE_PROJECT_ID=jnvckqlschyquzzfldrs` antes de executar `supabase functions deploy admin-cms --project-ref jnvckqlschyquzzfldrs`. `SUPABASE_ACCESS_TOKEN` é um repository Actions secret com scope Preview/Edge; se expirar, renova no GitHub sem escrever o valor no repositório. O workflow manual anterior existia só nesta branch e não era executável pelo botão do GitHub Actions, pois `workflow_dispatch` exige o ficheiro na default branch. Não levar o workflow para `main`.

## Sequência para operação e prova de ponta a ponta

1. GitHub **Actions → Deploy Supabase Preview Function**: verificar execução verde no commit de configuração. Em caso de falha, verificar só as mensagens não sensíveis e o scope/validade do token; nunca publicar logs com secrets.
2. Supabase Preview **Edge Functions**: confirmar `admin-cms`, endpoint, configuração de autenticação e logs; **Database → Table Editor**: confirmar `cms_drafts`. Um deploy da Edge não prova que os secrets existem.
3. Em **Edge Functions → Secrets**, conferir presença (apenas nomes) de `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `ADMIN_ORIGIN`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`. As variáveis Supabase de projeto são fornecidas no servidor. `VERCEL_DEPLOY_HOOK` deve permanecer vazio salvo isolamento provado.
4. Na Vercel, identificar domínio HTTPS estável da branch Preview; configurar `ADMIN_ORIGIN` com a origem exata sem `/`, e em **Environment Variables → Preview → branch `v2/full-redesign`** adicionar `VITE_SUPABASE_URL=https://jnvckqlschyquzzfldrs.supabase.co` e a publishable key do projeto Preview. Gerar novo deployment Preview. Não selecionar Production, promover deployment nem usar service role no frontend.
5. Testar `/admin` → login → `/admin/editor`, senha incorreta, refresh, logout e guard sem sessão. Criar um draft descartável, verificar gravação, leitura, revisão, preview privado e eliminação; nunca clicar Publish nesta prova.
6. No Preview, verificar `/projects` → `/modpacks`, Modrinth, e smoke test de `/`, `/modpacks`, `/modpacks/mac-native`, `/launchers`, `/news`, `/guides`, `/faq`, `/about`, `/support`, `/404` em pt-PT, pt-BR, en e es. Rever console/CORS, persistência e conteúdo editorial com fallback.

## Sinais observados e limites

- O endpoint público oficial `GET https://api.modrinth.com/v2/project/mac-native` respondeu HTTP 200 nesta execução com `downloads` e `followers` válidos; o header `Access-Control-Allow-Origin: *` foi observado para a API pública. A aplicação mostra dados apenas após validação e oculta métricas em erro, sem bloquear a página. Isto ainda não confirma comportamento no browser do Preview.
- O commit manual `267bd61` tem status Vercel `success` no GitHub, mas um status de build não demonstra que variáveis Preview, CORS, auth ou drafts funcionam.
- No browser disponível o dashboard Supabase mostrou o ecrã de login; este ambiente não tem `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN` ou `GITHUB_TOKEN`. Não inferir da configuração GitHub que a função já foi implantada ou que os secrets Edge foram configurados.
- `index.html` continua a carregar o script AdSense antes de existir consentimento granular; este é um bloqueio de privacidade separado, não resolvido aqui. Não adicionar tracking nesta fase.

Consultar [OWNER_CMS_ACCESS.md](OWNER_CMS_ACCESS.md) para passos de criação/rotação de credenciais exclusivamente no projeto Preview e invalidação de sessões. A Fase 4B.3 permanece fora de escopo.
