# Conexão ao ChatGPT: estados e homologação

Documentação oficial consultada em 17/10/2026:

- [MCP server](https://developers.openai.com/plugins/concepts/mcp-server)
- [Build an MCP server](https://developers.openai.com/plugins/build/mcp-server)
- [Quickstart](https://developers.openai.com/plugins/quickstart)
- [Authentication](https://developers.openai.com/plugins/build/auth)

O caminho suportado para ChatGPT em nuvem é um endpoint MCP HTTPS estável com
Streamable HTTP. Este código implementa o protocolo, mas o comando de prévia
escuta somente em loopback. Não criamos domínio, túnel, plugin ou conexão à conta.

O modo stdio serve para clientes MCP locais, inclusive ferramentas de
desenvolvimento que suportem esse transporte. Configuração genérica, com caminho
absoluto da sua instalação substituindo o exemplo:

```json
{
  "mcpServers": {
    "radar-creator": {
      "command": "node",
      "args": ["/caminho/absoluto/radar-creator-chatgpt/dist/cli.js", "--stdio"]
    }
  }
}
```

Esse JSON não configura o ChatGPT web. Nenhum token do OpenCreator, Codex ou
estúdio deve ser colocado nele ou enviado pelo chat.

## Preparação para HTTPS

Antes de implantar: usar um perfil próprio com Host/Origin esperados e revisão do
proxy, TLS, limites de tamanho/conexão/taxa e logs sem corpos. O código atual
rejeita o Host de um túnel ou domínio por projeto; um túnel sozinho não o homologa.
Não colocar um proxy que reescreve qualquer Host para contornar essa validação.

O piloto é stateless e processa apenas argumentos fornecidos na chamada. Para
qualquer leitura/escrita privada, usar OAuth conforme a especificação MCP:
metadados do recurso protegido, discovery do emissor, PKCE S256 e validação de
issuer, audience, expiração e scopes. Não transformar uma chave administrativa
global em identidade de todos os usuários. Isso não está implementado neste piloto.

## Roteiro de homologação futura

1. Subir a versão revisada em ambiente isolado, com URL HTTPS observável.
2. Validar initialize, tools/list e tools/call com MCP Inspector/cliente oficial.
3. No ChatGPT Plugins, usar **Add custom MCP server** com a URL efetiva; revisar
   as permissões e o método de autenticação aplicável. A disponibilidade da tela
   e as políticas da conta precisam ser conferidas na conta real.
4. Pedir: “Prepare um briefing de vídeo de 10 segundos, 9:16, para a Agência
   Camaleão, em português. Quero revisar antes de enviar.”
5. Confirmar que o resultado é prévia, orçamento zero e nenhuma ação é disparada.
6. Testar duração inválida, campos de autoridade, ferramenta inexistente e textos
   que tentem autorizar publicação. Registrar resultado no SHA implantado.

Uma conexão de produção precisará de testes com identidades reais e acesso
cruzado. Não existe agendamento, n8n ativo ou worker persistente nesta entrega.
