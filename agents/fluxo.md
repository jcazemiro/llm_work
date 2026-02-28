# Fluxo de agente — versão revisada para professor

1. Receber dados do projeto (frontend -> backend).
2. Executar `validar_consistencia_projeto`.
3. Executar `calcular_totais_instalados`.
4. Executar `sugerir_layout_diagramas` com `modo` adequado (blocos/unifilar).
5. Montar contexto técnico + system prompt.
6. Chamar o LLM e exigir saída JSON estruturada.
7. Validar JSON de resposta (schema/keys obrigatórias).
8. Exibir recomendações com rastreabilidade (tools + justificativa).
9. Opcional para apresentação: `gerar_resumo_apresentacao`.

## Métricas sugeridas para avaliação
- Tempo de resposta (latência)
- % de respostas com JSON válido
- # inconsistências detectadas por projeto
- # ajustes de layout sugeridos
