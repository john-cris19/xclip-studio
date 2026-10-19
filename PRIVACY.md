# Política de privacidade do XClip

**Última atualização:** 18 de outubro de 2026  
**Produto:** XClip 1.2.0 (beta)  
**Suporte e privacidade:** [nymostudioficial@gmail.com](mailto:nymostudioficial@gmail.com)

## 1. Sobre a extensão

O XClip é uma extensão independente, sem vínculo oficial com o X/Twitter ou a Microsoft. Sua finalidade é permitir que o usuário baixe arquivos MP4 disponíveis em postagens do X/Twitter e, opcionalmente, faça edições básicas no navegador (corte, enquadramento, resolução, áudio e GIF).

## 2. Quais informações são acessadas

Para localizar mídias nas postagens do X/Twitter, os scripts do XClip podem analisar respostas de rede e metadados de mídia da página, incluindo URLs de MP4, identificadores de postagens e nomes públicos associados às publicações. Quando o usuário escolhe editar um vídeo, o arquivo de mídia selecionado é carregado no navegador para processamento local.

O XClip não solicita senhas, credenciais bancárias, localização precisa, mensagens privadas nem dados de saúde. A versão descrita não inclui cadastro de usuário, ferramentas de análise de comportamento ou publicidade direcionada.

## 3. Uso dos dados

As informações acessadas são usadas exclusivamente para encontrar vídeos, exibir resoluções disponíveis, nomear arquivos, iniciar downloads solicitados e executar a edição local escolhida pelo usuário.

## 4. Transmissões e compartilhamento

A versão descrita não envia vídeos ou informações de uso a servidores próprios do XClip, não vende dados de usuários e não utiliza rastreadores de terceiros. Ao baixar ou editar um vídeo, o navegador pode buscar o MP4 no domínio `video.twimg.com`, operado pela infraestrutura do X. Esse provedor poderá tratar dados técnicos associados à solicitação de acordo com suas próprias políticas.

## 5. Armazenamento e retenção

O processamento de quadros de vídeo e GIF é realizado localmente e de forma temporária. Arquivos exportados são gravados na pasta de downloads do navegador. A versão descrita não mantém um banco de dados remoto de histórico de downloads ou edições.

## 6. Permissões da extensão

- **downloads:** iniciar o salvamento de MP4s, vídeos editados e GIFs quando solicitado pelo usuário.
- **Acesso a `https://video.twimg.com/*`:** obter os MP4s necessários ao download ou à edição escolhida.
- **Scripts em `x.com` e `twitter.com`:** detectar metadados de vídeos e adicionar controles de download e edição.

## 7. Doações voluntárias

O XClip pode mostrar uma chave Pix pública do responsável pelo projeto para doações opcionais. O botão apenas permite copiar a chave. A extensão não processa pagamentos nem coleta informações financeiras do doador. A transferência, se houver, é feita fora da extensão, pelo serviço bancário escolhido.

## 8. Controles do usuário

As ações de download e edição dependem de interações do usuário. É possível excluir arquivos salvos, desativar a extensão ou desinstalá-la nas configurações do navegador.

## 9. Alterações nesta política

Se versões futuras mudarem a coleta, transmissão, retenção ou tratamento de informações, esta política e as declarações fornecidas às lojas deverão ser atualizadas antes da distribuição da mudança.

## 10. Contato

Para dúvidas, solicitações e suporte relacionados à privacidade: **[nymostudioficial@gmail.com](mailto:nymostudioficial@gmail.com)**.


## Serviço web experimental (Cloudflare)

Ao usar no site a opção de colar um link de postagem pública do X, a URL informada é enviada ao Worker XClip na Cloudflare para consultar metadados públicos. Quando o usuário solicita download ou edição a partir do link, o Worker pode encaminhar o arquivo de vídeo pela infraestrutura da Cloudflare. A Cloudflare poderá tratar dados técnicos de rede associados à solicitação. Esse fluxo é diferente da edição de arquivos locais, que permanece no dispositivo. Esta integração é experimental e pode ficar indisponível caso o X altere seus endpoints.


### Resolução complementar de metadados (site)

Para links públicos não resolvidos diretamente, o serviço web XClip hospedado na Cloudflare pode consultar a API pública **FxEmbed/FxTwitter** utilizando o identificador público da publicação. Isso significa que um terceiro pode processar essa consulta de metadados. O arquivo MP4 pode ser transportado pela Cloudflare para o download solicitado. Essa integração não se aplica à edição de vídeos carregados localmente pelo usuário.


## Downloads de imagens (versão 1.5.0)

A extensão pode acessar URLs públicas de fotos de postagens do X hospedadas em `https://pbs.twimg.com/media/` somente para salvar imagens que o usuário selecionou. O mesmo controle Baixar também oferece vídeos MP4, GIFs e edição. A permissão para acessar `pbs.twimg.com` não concede acesso a senhas ou mensagens privadas.
