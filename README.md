# Radar Creator para ChatGPT

Ponte MCP autoral de **Carlos Felipe — ofelipepeixoto**, desenvolvida com
assistência de IA. Organize uma ideia de imagem ou vídeo em um briefing PT-BR
para revisão, usando ChatGPT ou outro cliente MCP como interface.

**Piloto experimental v0.1.0:** o servidor MCP funciona localmente com transporte
stdio e Streamable HTTP. Prepara JSON e orientações; não gera mídia, envia pedidos,
aprova ou publica. Não está conectado à sua conta ChatGPT, ao OpenCreator ou ao
Radar Generative Studio. Teste de protocolo não é homologação no ChatGPT.

## O que você recebe

- Escolhas de marca, imagem/vídeo, formato 9:16/16:9/1:1 e duração 5/10 segundos.
- Briefing com ideia, revisão obrigatória e orçamento de API igual a zero.
- JSON compatível com os campos do contrato offline do Radar Generative Studio.
- Hash da prévia para comparar conteúdo; **não é aprovação nem assinatura**.
- Sem acesso a arquivos, shell, cookies, credenciais, histórico ou internet.

O modelo de linguagem permanece no cliente, como ChatGPT. O servidor aplica
contratos e regras determinísticas. Não há uma segunda chamada paga a LLM nem
um agente autônomo de produção nesta versão. A assinatura do cliente e custos de
hospedagem continuam separados; não afirmamos que todos os usos sejam gratuitos.

## Executar

Requisito: Node.js 22 ou superior.

```sh
npm ci --ignore-scripts
npm test
npm run demo
npm start -- --stdio
```

O último comando aguarda um cliente MCP em stdin; não é uma interface de chat no
terminal. Para testar Streamable HTTP, em outro terminal:

```sh
npm start -- --http-preview
```

Endpoint local: `http://127.0.0.1:8787/mcp`. Não é acessível pelo ChatGPT na nuvem.
A API exige Host local e recusa Origin externo; o perfil é apenas de prévia, sem
dados de conta ou credenciais. Não altere o bind para publicar dados privados.

## Ferramentas

| Ferramenta | Resultado |
| --- | --- |
| `creator_capabilities` | Formatos e limites fixos; informa conexões desativadas |
| `creator_prepare_brief` | Prévia de briefing e `studioRequest`, sem persistência |

Exemplo de argumentos:

```json
{
  "title": "Convite da agência",
  "brand": "Agência Camaleão",
  "kind": "video",
  "idea": "Apresentar os serviços em português e convidar para conversar.",
  "aspectRatio": "9:16",
  "durationSeconds": 10,
  "language": "pt-BR"
}
```

Para imagem, use `kind: "image"` e duração `0`. Campos extras, como `approved`,
`tenantId`, `url`, `apiKey` ou orçamento, são recusados. O resultado mantém
`reviewRequired: true`, `submissionEnabled: false` e `paidGenerationEnabled: false`.
Não coloque credenciais ou dados pessoais na ideia. A ideia retorna ao cliente
como dado, e nunca é interpretada como comando pelo servidor.

## ChatGPT e seus outros projetos

Consulte [docs/CHATGPT.md](docs/CHATGPT.md) para a conexão futura por HTTPS e a
diferença entre configuração local, transporte testado e plugin instalado.
O MCP não aparece automaticamente na sua lista de plugins por estar no GitHub.

Este repositório tem uma responsabilidade: adaptar a conversa ao contrato de
briefing. O **radar-generative-studio** mantém identidade, referências, aprovação
e persistência; o **radar-integration-hub** é candidato a quotas e execução futura;
o **radar-evidence-kit** pode guardar recibos. Nenhum desses serviços foi alterado
ou conectado por esta entrega. O JSON ainda precisa ser enviado por um cliente
autenticado do estúdio. O contrato foi inspecionado no snapshot
`2464ec2e2d6a956c9958ad7618e5930d02f734ca`; a integração ponta a ponta está pendente.

## Engenharia e validação

TypeScript, SDK MCP oficial fixado em `1.31.0`, Zod e Node HTTP. Lockfile npm
versionado. Não há banco, fila, framework agentic, frontend paralelo ou nova API
de mídia. `npm run typecheck`, `npm test`, `npm run demo` e `npm audit` são as
verificações de desenvolvimento. Os testes usam clientes oficiais MCP reais,
stdio, HTTP loopback e dados sintéticos, sem serviços pagos.

Os limites de HTTP são 16 KiB por corpo e timeout de requisição de 10 segundos.
Não há logs de prompts, métricas persistentes, armazenamento de arquivos ou
autenticação OAuth. Esses limites não demonstram resistência a carga ou adequação
a um servidor público. Veja [SECURITY.md](SECURITY.md).

## Próximas etapas

1. Revisar esta fatia e homologar o fluxo com um cliente MCP independente.
2. Definir domínio HTTPS e OAuth antes de ler dados privados ou enviar ao estúdio.
3. Testar o plugin no ChatGPT com o mesmo fluxo PT-BR e validar UX com o operador.
4. Só então considerar geração paga, com reserva financeira persistente e revisão.

Arquitetura e decisão: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Origem e licenças: [NOTICE.md](NOTICE.md). Código próprio sob MIT.
