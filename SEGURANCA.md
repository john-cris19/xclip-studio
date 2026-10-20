# XClip Safe Media — segurança (beta 1.7.0)

O XClip baixa mídias de publicações do X/Twitter. **Não é antivírus** e não pode garantir que todo arquivo seja inofensivo.

## O risco real

Um MP4, GIF ou PNG não obtém automaticamente senhas, cookies ou acesso ao Roblox por conter metadados. Riscos incluem vulnerabilidades do programa que interpreta a mídia, arquivos executáveis disfarçados, links fraudulentos e extensões maliciosas.

## Defesas implementadas

1. **Verificação dos primeiros bytes**, reconhecendo assinatura real de MP4, WebM, PNG, GIF, JPEG e WebP. A extensão do nome e o tipo HTTP não são provas de segurança.
2. **Limites**: 150 MiB por vídeo e 32 MiB pela imagem original processada; máximo de 8192 px por eixo e 24 milhões de pixels reconstruídos.
3. **Imagem reconstruída (PNG)**: converte os pixels para um PNG novo, sem copiar os metadados da origem. GIFs animados convertidos dessa forma viram o primeiro quadro.
4. **GIF exportado**: recriado pelo codificador do XClip com pixels decodificados, sem copiar metadados do vídeo original.
5. **MP4 reconstruído**: utiliza canvas e MediaRecorder. Só disponibiliza saída MP4 reconstruída quando o navegador oferece codificação MP4. Pode demorar, perder qualidade ou não funcionar em alguns navegadores. Não renomeia arquivos WebM como MP4.
6. **Permissões limitadas**: extensão restrita a páginas x.com/twitter.com e domínios de mídia do X. Nunca solicita senha do Roblox.

## Limitações de segurança

- **Baixar original não elimina metadados**: para isso, escolha versão reconstruída.
- A mídia original precisa ser decodificada primeiro; uma falha no decodificador pode ser explorada antes da limpeza. Este recurso não previne todos os exploits, nem garante que o arquivo final seja absolutamente seguro.
- Verificar assinaturas não é um exame antivírus.
- Reconstruções podem afetar áudio, transparência, quadros, qualidade e dimensões.
- SVG, scripts, HTML e executáveis disfarçados não são aceitos nas rotinas de verificação.

## Como reduzir o risco

Atualize o navegador, sistema e antivírus; instale a extensão apenas de fontes confiáveis; não execute arquivos .exe, .scr, .bat, .cmd ou .msi oferecidos como supostos vídeos; ative autenticação em dois fatores no Roblox.

## Código auditável

Verificação de formato: safe-media.js. PNG novo: safe-image.js na extensão. MP4/GIF recodificados: editor.js na extensão e studio.js / gif-codec.js no site.
