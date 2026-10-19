# XClip 1.6.0 — Instalação manual da beta

**Status (18/10/2026):** a extensão XClip 1.6.0 foi enviada para análise do Microsoft Edge Add-ons. A Chrome Web Store ainda está na fase de cadastro. **Esta instalação manual não é a publicação nas lojas.**

## Como instalar

1. No repositório, abra **Releases** e baixe o arquivo `XClip-1.6.0-Edge-Chrome.zip` quando ele estiver disponível.
2. Extraia todo o ZIP para uma pasta permanente (por exemplo `Documentos/XClip-1.6.0`). Não apague essa pasta depois da instalação.
3. No Chrome, abra `chrome://extensions`. No Edge, abra `edge://extensions`.
4. Ative **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactação / Load unpacked**.
6. Selecione a pasta extraída que contém o arquivo `manifest.json`.
7. Abra um post público com vídeo no [X/Twitter](https://x.com), atualize a página e, se necessário, reproduza o vídeo. Use **Baixar**, o menu de resoluções ou **Editar**.

## Limitações e segurança

- Esta é uma **beta de testes**, sem aprovação das lojas até o momento.
- Instalações manuais **não recebem automaticamente** atualizações pela Chrome Web Store ou Edge Add-ons.
- A extensão usa permissões de `downloads` e acesso a mídia MP4 em `video.twimg.com`.
- Nem todos os posts disponibilizam MP4 compatível. Não há suporte a DRM ou transmissões apenas HLS.
- O editor pode exportar vídeo MP4 ou WebM conforme os codecs do navegador; GIF é sem áudio.
- Baixe apenas do repositório do projeto e revise as permissões mostradas pelo navegador.

Privacidade: [Política de privacidade](https://john-cris19.github.io/xclip-studio/privacy.html)  
Contato: [nymostudioficial@gmail.com](mailto:nymostudioficial@gmail.com)

> **Para publicar a beta:** o mantenedor deve criar uma *GitHub Release* chamada `v1.6.0-beta`, anexar o ZIP original e publicar a release. Não ofereça a URL da loja como oficial até aprovação.
