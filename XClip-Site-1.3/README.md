# XClip Web 1.3 — site estático

Este diretório contém o **site completo** (não apenas um mockup): editor local de MP4/WebM para vídeos enviados do aparelho, criação de GIF, interface em seis idiomas, política de privacidade e seção de instalação nas lojas.

## Publicar no GitHub Pages

1. No repositório `john-cris19/xclip-studio`, substitua o `index.html` e adicione `style.css`, `studio.js`, `translations.js`, `config.js`, `gif-codec.js`, `privacy.html`, `assets/icon48.png` na **raiz**.
2. Mantenha GitHub Pages configurado para `main` / `/(root)`.
3. Abra `https://john-cris19.github.io/xclip-studio/` após alguns minutos.
4. No Partner Center, altere a **Privacy policy URL** para `https://john-cris19.github.io/xclip-studio/privacy.html` e verifique que o texto aparece.

## Status de recursos

- ✅ Arquivo do celular/computador → cortar, reenquadrar, exportar MP4 (quando compatível) ou WebM e GIF. Tudo no navegador.
- ✅ Layout móvel, troca de idioma, status de lojas pendentes.
- ⚠️ Colar um link do X **ainda não baixa automaticamente no site público**: precisa ativar o backend opcional, na pasta `worker/` (incluída no pacote completo). GitHub Pages não executa código backend. Uma vez configurada a URL do Worker em `config.js`, o site poderá tentar resolver posts públicos; a disponibilidade depende do X e de suas APIs não oficiais.
- ⚠️ Downloads diretos de MP4 de `video.twimg.com` dependem das regras CORS do domínio e do navegador.
- ⚠️ Os botões Edge/Chrome só devem apontar para URLs reais após aprovação. Não há um link da loja divulgado ainda.

## Privacidade

A política pública está em `privacy.html`. Se o Worker for ativado, revise as declarações de dados no Partner Center e na política de privacidade de acordo com o comportamento real. Não cadastre dados falsos, não prometa suporte a vídeos privados/DRM.

Suporte: nymostudioficial@gmail.com.
