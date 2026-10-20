# XClip Studio

XClip é uma extensão independente para baixar vídeos MP4 públicos do X/Twitter e editar vídeos ou criar GIFs no navegador.

## Status — 18/10/2026

- **Microsoft Edge Add-ons:** versão 1.3.0 enviada e em análise.
- **Chrome Web Store:** versão 1.3.0 enviada e em revisão.
- **Versão de desenvolvimento 1.6.0:** menu compacto com MP4, imagens, GIF de 8 segundos ou inteiro sem nova aba visível, modal de edição no X, prévia da duração do trecho, temas claro/escuro e Pix no final do menu. **Não enviada às lojas ainda.**
- **Site:** XClip Studio 1.4 publicado a partir do diretório raiz deste repositório. A geração de GIF com arquivos locais foi testada. A resolução de links públicos do X é experimental.

## Endereços

- [Site XClip Studio](https://john-cris19.github.io/xclip-studio/)
- [Política de privacidade](https://john-cris19.github.io/xclip-studio/privacy.html)
- [Como instalar a beta manualmente](BETA-INSTALACAO.md)
- Suporte: [nymostudioficial@gmail.com](mailto:nymostudioficial@gmail.com)

## Limitações importantes

O GIF direto abre um processamento em uma aba inativa e pode demorar conforme o navegador. Nem todos os posts do X expõem MP4 compatível, e o XClip não contorna DRM. A resolução de links no site consulta um serviço experimental Cloudflare, que pode usar metadados públicos do FxEmbed/FxTwitter, conforme descrito na política de privacidade.

O projeto não tem vínculo oficial com o X/Twitter, Google ou Microsoft. Respeite os direitos dos autores.


## Testes do serviço web — 19/10/2026

O serviço Cloudflare foi corrigido e agora consulta diretamente os metadados públicos de MP4 através do FxTwitter/FxEmbed. O teste automatizado no GitHub Actions confirmou a obtenção de resoluções e bytes válidos de MP4 de quatro posts públicos reais; em um deles, o arquivo completo foi baixado e convertido em GIF animado válido. Um teste isolado no navegador confirmou o fluxo da página de resolução → download MP4 → GIF com respostas de API simuladas. Isso não garante funcionamento em conteúdo privado, bloqueado ou indisponível.

A seção 'Beta' no site aponta para o [GitHub Releases](https://github.com/john-cris19/xclip-studio/releases) e o guia de instalação. **O ZIP da extensão ainda precisa ser anexado a uma Release pública**; a publicação nas lojas continua independente.


## XClip Safe Media (beta 1.7.0)

Opções experimentais de mídia reconstruída: PNG a partir de pixels, GIF gerado pelo codificador local, MP4 recodificado quando o navegador suporta. Os downloads originais continuam disponíveis e não são sanitizados. O recurso verifica assinaturas reais de arquivo, porém não é antivírus e não garante proteção absoluta contra falhas de decodificação. Consulte [SEGURANCA.md](SEGURANCA.md) para limites e ameaças. A versão 1.7.0 está em teste e não substitui automaticamente os pacotes em revisão no Edge e Chrome.
