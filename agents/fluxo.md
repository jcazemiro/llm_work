# Fluxo de agente

## Pipeline principal (`POST /api/assistente/analisar`)
1. Receber `projeto` do frontend.
2. Executar `validar_consistencia_projeto`.
3. Executar `calcular_totais_instalados`.
4. Executar `sugerir_layout_diagramas`.
5. Montar resposta estruturada (modo determinístico auditável nesta versão).
6. Validar schema final antes de retornar ao cliente.
7. Retornar `modelo + tools_executadas + resposta`.

## Endpoint de referência
- `GET /api/assistente/exemplo`: retorna payload completo para demonstração em banca.

## Controles de qualidade
- `trace_id` por tool para rastreabilidade.
- Rejeição de resposta fora do schema obrigatório.
- Priorização explícita de inconsistências técnicas na saída.

## Métricas sugeridas
- latência do endpoint;
- percentual de JSON válido;
- inconsistências médias por cenário;
- taxa de acionamento de recomendações de layout (escala pequena/média/grande).
