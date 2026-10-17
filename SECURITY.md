# Escopo de segurança

Este piloto não faz autenticação, gera mídia, lê arquivos, executa comandos,
consulta URLs, aprova ou envia pedidos. Não usa credenciais de Codex/OpenCreator.
Ele apenas transforma os argumentos da chamada em uma prévia determinística.

O HTTP escuta em 127.0.0.1, verifica Host/Origin e limita o corpo a 16 KiB. O stdio
pressupõe cliente/processo local confiável. Os erros de domínio não refletem o
prompt. O resultado normal inclui a ideia enviada, para revisão; não envie
segredos ou dados pessoais. Não há persistência nem log de argumentos.

Não é um backend SaaS: faltam OAuth, autorização por recurso, rate limiting,
limites globais de conexões, métricas, testes de carga e homologação ChatGPT.
Um hash de prévia não comprova identidade, direitos ou aprovação humana.
Não exponha o perfil local publicamente nem acrescente chamadas de provider sem
controles e testes específicos. Saída de modelo é dado e não concede autoridade.

Relate falhas sem credenciais ou dados pessoais por canal privado ao mantenedor.
Não publique detalhes de uma credencial real em uma issue. Nenhum emissor ou
canal privado de incidentes foi configurado por esta entrega.
