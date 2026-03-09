# Etapa 1 — Reestruturação de System Prompt e Prompting

Este documento registra a evolução do critério **System Prompt e Prompting**.

## Objetivo
Responder ao feedback: prompt básico, pouca engenharia de prompt, sem evidência clara de few-shot/CoT/XML tags.

## O que foi implementado
1. **Prompt em estrutura XML-like** (`<persona>`, `<prioridades>`, `<politica_de_entrada>`, `<schema_saida_obrigatorio>`, etc.).
2. **Contrato de saída estrito** (JSON único, sem campos extras).
3. **Política de raciocínio interno** (CoT privado, sem exposição da cadeia de pensamento).
4. **Few-shot com 3 cenários**:
   - consistente,
   - inconsistente,
   - alerta de margem de trafo.
5. **Rubrica interna de qualidade** para auto-checagem do modelo antes da resposta final.

## Evidências no repositório
- Prompt principal: `prompts/system_prompt.txt`
- Espelho no frontend: `frontend/src/prompts/systemPrompt.ts`

## Risco remanescente
- Ainda falta validação quantitativa do ganho de qualidade por experimento A/B (ex.: taxa de JSON válido por versão de prompt).

## Próximo passo (Etapa 2)
- Evoluir Tools/integração com testes automatizados e dados de benchmark por cenário.
