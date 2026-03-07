# Plano de melhoria para alcançar nota mínima (baseado na correção)

## Diagnóstico da correção do professor
Pontuação atual: **70/100**. O principal gargalo está nos critérios de IA aplicada:
- System Prompt e Prompting: 6/18
- Ferramentas (Tools): 3/14
- Parâmetros do Modelo: 4/10
- Arquitetura e Framework: 4/10
- README e Documentação: 6/10

## Ações objetivas por critério

### 1) System Prompt e Prompting (alto impacto)
- Adotar prompt com estrutura explícita em tags (`<system>`, `<objetivo>`, `<regras>`, etc.).
- Definir saída JSON obrigatória com chaves fixas.
- Incluir **few-shot** com cenário válido e cenário inconsistente.
- Exigir `DADO INSUFICIENTE` para dados ausentes.

**Entrega feita nesta revisão:** prompt atualizado em `prompts/system_prompt.txt` e espelho no frontend.

### 2) Ferramentas (Tools) (alto impacto)
- Padronizar contrato de entrada/saída (schema e status).
- Definir claramente quando retorna `ok`, `alerta`, `erro`.
- Registrar regras de negócio que justificam cada alerta técnico.

**Entrega feita nesta revisão:** `tools/tool_specs.md` com schemas, regras e contrato backend.

### 3) Parâmetros do Modelo (médio impacto)
- Fixar parâmetros iniciais (`temperature=0.2`, `top_p=0.9`) e justificar.
- Explicar quando ajustar temperatura (ex.: brainstorming x validação técnica).
- Exibir parâmetros no retorno da API para rastreabilidade.

**Entrega feita nesta revisão:** backend devolve configuração ativa de modelo no payload.

### 4) Arquitetura e Framework (alto impacto)
- Implementar endpoint real de orquestração (`/api/assistente/analisar`).
- Encadear tools antes da geração da resposta para reduzir alucinação.
- Validar formato da saída antes de enviar ao frontend.

**Entrega feita nesta revisão:** backend Express implementado com pipeline completo e fallback determinístico.

### 5) README e Documentação (médio impacto)
- Atualizar README para mostrar o que está implementado vs planejado.
- Incluir passos de execução frontend/backend.
- Documentar limitações e próximos experimentos.

## Próximas ações recomendadas (antes da entrega final)
1. Conectar o frontend no endpoint backend em vez de executar assistente localmente.
2. Adicionar 3 casos de teste (projeto válido, com alerta e com erro).
3. Gravar evidências de execução (prints de JSON e tools).
4. Preparar slide de 1 página com: problema, arquitetura, decisões de LLM, métricas.
5. Ensaiar pitch de 3 minutos com foco em decisões de engenharia.
