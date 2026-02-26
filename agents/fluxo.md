# Fluxo de agente (versão inicial)

1. Receber dados do projeto no backend.
2. Rodar `validar_consistencia_projeto`.
3. Rodar `calcular_totais_instalados`.
4. Enviar contexto consolidado ao LLM com `system_prompt`.
5. Interpretar JSON de resposta do LLM.
6. Aplicar recomendações no gerador de unifilar.
7. Exibir recomendações + diagrama atualizado no front-end.
