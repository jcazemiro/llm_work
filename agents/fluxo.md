# Fluxo de agente — versão revisada

## Pipeline de execução
1. Front-end envia `projeto` para `POST /api/assistente/analisar`.
2. Backend executa `validar_consistencia_projeto`.
3. Backend executa `calcular_totais_instalados`.
4. Backend executa `sugerir_layout_diagramas`.
5. Backend monta contexto técnico (`prompt + outputs das tools + metadados do modelo`).
6. Orquestrador gera resposta estruturada (fallback determinístico nesta versão).
7. Backend valida formato JSON obrigatório.
8. Front-end exibe recomendações, riscos e prioridade com rastreabilidade das tools.

## Contratos e qualidade
- **Entrada mínima:** dados elétricos básicos + quantidades de PCS/BESS.
- **Saída obrigatória:** `diagnostico`, `acoes_recomendadas`, `riscos`, `dados_faltantes`, `resumo_executivo`, `justificativa_tecnica`, `prioridade_execucao`.
- **Rastreabilidade:** cada tool retorna `nome`, `status` e `saida`.
- **Reprodutibilidade:** parâmetros do modelo retornam no payload da API.

## Métricas sugeridas para avaliação
- Latência da rota `/api/assistente/analisar`.
- `%` de respostas com JSON válido.
- Número médio de inconsistências detectadas por projeto.
- Quantidade de recomendações de layout acionadas por faixa de escala (pequeno/médio/grande).
