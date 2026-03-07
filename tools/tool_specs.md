# Especificação de ferramentas (tools) — versão para avaliação final

## Convenções gerais
- Todas as tools devem receber JSON válido e retornar objeto com `status`, `output` e `trace_id`.
- Em caso de erro de entrada, retornar `status="erro"` com `error_code`.
- Todo valor numérico deve ser normalizado para `number`.

---

## 1) `validar_consistencia_projeto`
**Objetivo:** verificar consistência elétrica e de parametrização mínima.

### Entrada (schema simplificado)
```json
{
  "tensao_mt_kv": "number > 0",
  "tensao_bt_kv": "number > 0",
  "potencia_trafo_kva": "number > 0",
  "pcs_quantidade": "integer >= 1",
  "pcs_potencia_kw": "number > 0",
  "bess_quantidade": "integer >= 1",
  "bess_energia_kwh_total": "number > 0",
  "bess_potencia_kw_total": "number > 0"
}
```

### Saída
```json
{
  "status": "ok|alerta|erro",
  "inconsistencias": ["string"],
  "observacoes": ["string"],
  "trace_id": "string"
}
```

### Regras de validação
- Erro se `tensao_mt_kv <= tensao_bt_kv`.
- Alerta se `pcs_quantidade * pcs_potencia_kw > 95%` da potência do trafo.
- Erro para valores não numéricos, nulos ou negativos.

---

## 2) `calcular_totais_instalados`
**Objetivo:** consolidar totais para carimbo, resumo e validações cruzadas.

### Entrada
```json
{
  "pcs_quantidade": "integer >= 1",
  "pcs_potencia_kw": "number > 0",
  "bess_energia_kwh_total": "number > 0",
  "bess_potencia_kw_total": "number > 0"
}
```

### Saída
```json
{
  "status": "ok",
  "potencia_pcs_total_kw": "number",
  "energia_bess_total_kwh": "number",
  "potencia_bess_total_kw": "number",
  "trace_id": "string"
}
```

---

## 3) `sugerir_layout_diagramas`
**Objetivo:** recomendar organização visual para diagrama de blocos e unifilar.

### Entrada
```json
{
  "quantidades": { "pcs": "integer", "bess": "integer" },
  "limites_visuais": { "largura": "number", "altura": "number" },
  "modo": "blocos|unifilar"
}
```

### Saída
```json
{
  "status": "ok",
  "recomendacoes_layout": ["string"],
  "agrupamentos": ["string"],
  "limites_detectados": ["string"],
  "trace_id": "string"
}
```

### Regras de decisão
- `pcs > 12`: sugerir subdivisão de barramento.
- `bess > 8`: sugerir subgrupos por fileira/bloco.
- Cenário simples: manter layout atual.

---

## 4) `gerar_resumo_apresentacao`
**Objetivo:** apoiar pitch de 3 minutos para avaliação.

### Entrada
```json
{
  "diagnostico": "string",
  "acoes_recomendadas": ["string"],
  "tradeoffs": ["string"]
}
```

### Saída
```json
{
  "status": "ok",
  "elevator_pitch_30s": "string",
  "decisoes_llm_2min": ["string"],
  "riscos_30s": ["string"],
  "trace_id": "string"
}
```

---

## Contrato de integração backend LLM
- Endpoint: `POST /api/assistente/analisar`
- Pipeline: `input -> tools -> contexto -> resposta estruturada`
- Modelo padrão na entrega atual: `deterministic-local` (fallback reproduzível).
- Parâmetros versionados:
  - `LLM_MODEL`
  - `LLM_TEMPERATURE` (padrão 0.2)
  - `LLM_TOP_P` (padrão 0.9)

Esse contrato garante que a banca consiga validar rastreabilidade mesmo sem chave de API externa.
