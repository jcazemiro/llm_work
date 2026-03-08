# Especificação de ferramentas (tools)

## Convenções gerais
- Cada tool retorna: `nome`, `status`, `trace_id`, `saida`.
- `status`: `ok | alerta | erro`.
- O backend deve incluir os outputs de tools na resposta final para rastreabilidade.

---

## 1) `validar_consistencia_projeto`
**Objetivo:** validar consistência mínima de parâmetros elétricos.

### Entradas esperadas
- `tensao_mt_kv`, `tensao_bt_kv`
- `potencia_trafo_kva`
- `pcs_quantidade`, `pcs_potencia_kw`
- `bess_quantidade`, `bess_energia_kwh_total`, `bess_potencia_kw_total`

### Regras
- Erro se `MT <= BT`.
- Erro se quantidades/energia/potência forem inválidas.
- Alerta se `potência total PCS > 95%` da potência do trafo.

### Saída
```json
{
  "nome": "validar_consistencia_projeto",
  "status": "ok|alerta|erro",
  "trace_id": "validar_xxxxxxxx",
  "saida": {
    "status": "ok|alerta|erro",
    "inconsistencias": ["string"],
    "observacoes": ["string"],
    "trace_id": "validar_xxxxxxxx"
  }
}
```

---

## 2) `calcular_totais_instalados`
**Objetivo:** consolidar totais para resumo técnico.

### Saída
```json
{
  "nome": "calcular_totais_instalados",
  "status": "ok",
  "trace_id": "totais_xxxxxxxx",
  "saida": {
    "status": "ok",
    "potencia_pcs_total_kw": "number",
    "energia_bess_total_kwh": "number",
    "potencia_bess_total_kw": "number",
    "trace_id": "totais_xxxxxxxx"
  }
}
```

---

## 3) `sugerir_layout_diagramas`
**Objetivo:** recomendar melhorias de legibilidade para blocos/unifilar.

### Regras
- `pcs > 12`: sugerir divisão de barramento.
- `bess > 8`: sugerir subgrupos por fileira/bloco.
- Caso simples: manter layout atual.

### Saída
```json
{
  "nome": "sugerir_layout_diagramas",
  "status": "ok",
  "trace_id": "layout_xxxxxxxx",
  "saida": {
    "status": "ok",
    "recomendacoes_layout": ["string"],
    "agrupamentos": ["string"],
    "limites_detectados": ["string"],
    "trace_id": "layout_xxxxxxxx"
  }
}
```

---

## Contrato de API backend
- `GET /health`: verificação de serviço.
- `GET /api/assistente/exemplo`: exemplo completo (projeto + tools + resposta).
- `POST /api/assistente/analisar`: pipeline principal.

### Saída do endpoint de análise
```json
{
  "modelo": {
    "provider": "deterministic-local",
    "model": "rule-engine-v2",
    "temperature": 0.2,
    "top_p": 0.9
  },
  "tools_executadas": ["..."],
  "resposta": {
    "diagnostico": "string",
    "acoes_recomendadas": ["string"],
    "riscos": ["string"],
    "dados_faltantes": ["string"],
    "resumo_executivo": "string",
    "justificativa_tecnica": ["string"],
    "prioridade_execucao": [
      { "item": "string", "prioridade": "alta|media|baixa" }
    ]
  }
}
```

> Observação: antes de responder ao cliente, o backend valida o schema de `resposta`.
