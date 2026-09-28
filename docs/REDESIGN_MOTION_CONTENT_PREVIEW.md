# Redesign Preview: artwork, motion e conteúdo editorial

Branch de trabalho: `v2/full-redesign`. Esta ronda não publica em `main` nem em Production.

## Artwork fornecida pelo proprietário

As imagens originais permanecem nos anexos fornecidos; os ficheiros sob `public/brand/` são apenas derivados WebP otimizados. Cada cena tem `-day.webp`, `-night.webp` e variantes `-mobile.webp`. Desktop usa a composição panorâmica; mobile recorta uma cópia derivada com gravidade ajustada ao protagonista, sem alterar o original. O componente `HeroLandscape` carrega apenas o tema ativo e antecipa a variante oposta dessa mesma cena após a entrada na página. CSS mantém gradientes de legibilidade sobre a ilustração.

| Cena | Original Day | Original Night | Composição mobile |
| --- | --- | --- | --- |
| Modpacks (`projects`) | `image(4)(2).png` | `ChatGPT Image Sep 28, 2026, 12_36_57 PM.png` | direita, panda e destinos |
| Launchers | `ChatGPT Image Sep 28, 2026, 01_02_59 PM.png` | `ChatGPT Image Sep 28, 2026, 01_03_08 PM.png` | esquerda, panda e mochila |
| News | `ChatGPT Image Sep 26, 2026, 12_54_50 PM.png` | `alahpanda news.png` | esquerda, jornal |
| FAQ | `ChatGPT Image Sep 28, 2026, 02_25_57 PM.png` | `ChatGPT Image Sep 28, 2026, 02_26_05 PM.png` | esquerda, panda e mapa |
| About | `ChatGPT Image Sep 26, 2026, 12_52_28 PM.png` | `Untitled.png` | centro, quarto |
| Guides | `image(6)(2).png` | `image(20260928-133145).png` | esquerda, biblioteca |

Home e Mac Native mantêm os pares anteriores. Não foi disponibilizado um par específico para 404 nesta ronda, portanto a rota mantém a apresentação atual.

## Motion

Reutiliza `useReveal` com `IntersectionObserver`, inclusive para cartões criados depois de filtrar. A entrada de página, texto do hero, secções, cartões, chips, imagens e respostas do FAQ partilham durações curtas; propriedades principais são opacity e transform. `SmartImage` evita flashes dos thumbnails. Valores de downloads só são animados após resposta válida do Modrinth, com `prefers-reduced-motion` a mostrar diretamente o valor. A regra de reduced motion desliga as animações nesta camada.

## News: oito demonstrações, não oito acontecimentos confirmados

`src/content/v2/articles.json` contém oito **exemplos editoriais** datados da criação desta ronda, com `[Demo]` no título, imagem local, `seo.noindex` e aviso explícito no corpo. São textos originais breves baseados em informação já conhecida do repositório; não devem ser tratados como notícias, autoria validada, tradução aprovada ou anúncio de produto. Estas entradas ficam visíveis no Preview para testar o hub e são editáveis no CMS V2. **O proprietário deve revê-las, aprovar ou substituir cada texto antes de qualquer promoção a Production.** Evitar promover esta coleção por acidente.

O schema V2 aceita apenas WebP sob `/brand/<slug>.webp` para media local, além das URLs HTTP(S) que já suportava. Não aceita caminhos relativos arbitrários, `javascript:` nem HTML executável.

## FAQ

21 perguntas em quatro grupos publicados: geral, Mac Native, launchers, ajuda/comunidade. Conserva a pergunta inicial em inglês e acrescenta respostas originais em pt-PT; traduções continuam opcionais no CMS. Rever editorialmente as respostas sobre procedimentos externos antes de Production.

## AstralRinth

A rota `/launchers/astralrinth` recupera os cinco links **históricos** de `src/lib/launchers.ts`: Windows `.exe`, macOS ARM, Linux `.deb`, `.rpm` e `.AppImage`. Estes URLs passam por `ouo.io` e não foram confirmados como distribuição oficial; a interface avisa antes do clique. Não foram restaurados ratings, claims de desempenho ou recomendações subjetivas. É necessária verificação pelo proprietário antes de classificar os downloads como oficiais ou migrar esta entrada para Launchers V2.

## Pendências

- Inspeção visual real em Preview a 375/390/430/768/1024/1440 px, nos dois temas; o browser remoto desta execução bloqueou o servidor local.
- Revisão editorial dos oito textos de demonstração e das novas respostas FAQ; confirmação externa dos downloads AstralRinth.
- Artwork Day/Night específica para 404, caso o proprietário a forneça.
