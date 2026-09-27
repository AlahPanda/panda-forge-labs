# Acesso do proprietário ao CMS (Preview V2)

## Antes de configurar

`/admin` é a única entrada de login; após autenticação, abre `/admin/editor`. Não existe password por defeito. A função `supabase/functions/admin-cms/index.ts` compara a string enviada com **`ADMIN_PASSWORD`**, guardada em secrets server-side do projeto Supabase. Atualmente não utiliza hash: introduz a nova password diretamente como valor do secret. O browser nunca recebe o valor do secret. Não é possível descobrir a password anterior a partir do repositório.

**Confirma primeiro o projeto Supabase de Preview.** Os secrets de Edge Functions são partilhados pelas funções do mesmo projeto Supabase. Se o Preview estiver ligado ao projeto Supabase da produção, alterar `ADMIN_PASSWORD`, `ADMIN_ORIGIN` ou `GITHUB_BRANCH` nesse projeto afetará produção. Nesse caso, cria/isola primeiro um projeto Supabase de Preview, com a migração de drafts correspondente; não alteres os secrets do projeto de produção. O simples deploy da branch Vercel não altera os secrets Supabase.

## Configuração pelo proprietário

1. No [Supabase Dashboard](https://supabase.com/dashboard), seleciona **o projeto isolado de Preview** e confirma que a função Edge `admin-cms` está implantada nesse projeto. Confirma `verify_jwt = false` para `admin-cms` (configurado no `supabase/config.toml`); a própria função verifica o seu JWT assinado nas operações protegidas.
2. Abre **Edge Functions → Secrets** desse projeto. Cria ou atualiza a chave **`ADMIN_PASSWORD`** com uma **nova password longa e única, escolhida agora**, diretamente no campo Value; guarda. Não utilizes uma password escrita em conversas anteriores, código, documentação, `VITE_*` ou logs. O valor é plaintext **dentro do secret server-side**, porque é isso que o código atual compara; não coloques um hash neste campo.
3. No mesmo projeto, configura **`ADMIN_JWT_SECRET`** com um segredo aleatório independente da password (por exemplo, gerado num gestor de passwords). Rodá-lo invalida todos os tokens anteriores; mudar só `ADMIN_PASSWORD` impede novos logins com a password antiga, mas tokens já emitidos continuam válidos até expirarem (máximo oito horas).
4. Configura **`ADMIN_ORIGIN`** como a origem HTTPS **exata e estável** do Preview que vai usar o CMS, sem `/` final, por exemplo `https://preview-exemplo.vercel.app`. A função rejeita pedidos com outra origem. Previews Vercel com URLs efémeros requerem uma origem fixa autorizada ou infraestrutura separada; a função não aceita várias origens hoje.
5. Para publicação no repositório de Preview, configura **`GITHUB_REPO=AlahPanda/panda-forge-labs`** e **`GITHUB_BRANCH=v2/full-redesign`**, além de **`GITHUB_TOKEN`** com a autorização necessária. A função faz todas as escritas GitHub; o token permanece server-side. Deixa `VERCEL_DEPLOY_HOOK` vazio se não existir um hook estritamente isolado para Preview. Não testes publicação antes de confirmar estes destinos.
6. A função de drafts requer `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` server-side e a tabela/migração `cms_drafts`. Consulta `supabase/migrations/` e `docs/V2_PHASE_3A.md`. Os nomes `SUPABASE_*` são normalmente injetados pelo Supabase remoto; confirma que estão disponíveis no projeto e **não tentes criar manualmente uma chave reservada** no dashboard de secrets. Nunca coloques a service role num `VITE_*`.
7. Nas variáveis **Vercel Preview** do branch, define `VITE_SUPABASE_URL` para a URL **do mesmo projeto Supabase de Preview** e `VITE_SUPABASE_PUBLISHABLE_KEY` para a chave publicável desse projeto. Não uses a service role. Se alterares estas variáveis Vercel, faz um novo **deploy apenas do Preview**; são embebidas no build frontend. Os secrets Supabase Edge ficam disponíveis após Save sem redeploy da função; se a função ainda não estiver implantada ou o seu código/config tiver mudado, implanta **apenas no projeto isolado de Preview**.
8. Abre `<origem-do-preview>/admin`. Introduz a nova password escolhida no passo 2. Confirma o redirecionamento para `/admin/editor` e que a sessão carrega o Dashboard. Um pedido de publicação de teste grava na branch configurada; não o faças sem confirmar antes `GITHUB_BRANCH` e eventual deploy hook.

## Troca/recuperação

Se esqueceres a password, inicia sessão no **dashboard Supabase de Preview** como proprietário e substitui `ADMIN_PASSWORD` em **Edge Functions → Secrets** por uma nova. Atualiza `ADMIN_JWT_SECRET` para invalidar sessões existentes (em todos os browsers). Espera os secrets propagarem, recarrega `/admin`, inicia sessão com a nova password. Tokens ficam em `sessionStorage` e são retirados ao terminar sessão; sessões antigas também são rejeitadas assim que o JWT secret mudar. Não é necessário recuperar nem imprimir a password antiga.

Sem `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET` ou `ADMIN_ORIGIN` a função falha fechada; nunca usa credenciais default. A password não deve ser pedida nem introduzida nesta conversa. Ver documentação oficial: [Edge Function secrets](https://supabase.com/docs/guides/functions/secrets) e [deploy e chave publicável](https://supabase.com/docs/guides/functions/deploy).

## Limite desta entrega

Este repositório não concede acesso ao projeto Supabase nem mostra o estado real dos secrets remotos. O login real só pode ser confirmado depois de o proprietário executar os passos anteriores num projeto isolado. Os testes automatizados cobrem falha por falta de configuração, rejeição de password errada, autenticação correta simulada, guard e redirecionamento no cliente.
