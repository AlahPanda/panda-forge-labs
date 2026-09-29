# Mac Native — composição da referência visual

A página `/modpacks/mac-native` segue a referência `image(20260928-191451).png` fornecida pelo proprietário. Mantém o par de ilustrações Day/Night já existente no hero, navegação e design tokens do site.

## Mapeamento

- Hero compacto: breadcrumb, identidade Mac Native, estado Beta, proposta, compatibilidade publicada e CTAs para a release oficial e para a secção de conteúdo.
- Faixa de benefícios: apresenta os três campos `features` publicados em Projects V2, sem prometer resultados quantitativos.
- Área principal: galeria à esquerda; release e três passos de instalação à direita. A galeria lê `media` do projeto V2 e imagens da galeria oficial via `GET https://api.modrinth.com/v2/project/mac-native`. Só URLs HTTPS no hostname exato `cdn.modrinth.com` são aceites para imagens da API. Enquanto não houver imagens, a arte original do projeto aparece com identificação explícita de **ilustração**, não como screenshot de jogo.
- Carrossel: avança a cada 4,5 s, pausa ao hover/foco, aceita botões, indicadores e swipe; não inicia autoplay sob `prefers-reduced-motion`.
- Base: CTA de apoio e painéis compactos para instalação, compatibilidade, notas da release, problemas conhecidos e FAQ. Campos ausentes não geram painéis vazios.

Downloads e seguidores continuam a aparecer apenas quando recebidos do Modrinth; a falha da API não bloqueia a página, release ou download. A query mantém TTL de 15 minutos. A versão e o changelog continuam a vir da release validada em Content V2, com ligação para a publicação oficial; não são inferidos de métricas ou da imagem de referência.

A imagem de referência contém texto e cenas que são direção de composição, não factos editoriais nem screenshots reutilizáveis. Ainda faltam screenshots reais aprovadas/publicadas e um guia longo para substituir o detalhe de instalação existente. Nenhum foi inventado nesta alteração.
