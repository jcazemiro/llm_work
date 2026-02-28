# Especificação de ferramentas (tools) — versão para avaliação final

## 1) validar_consistencia_projeto
**Objetivo:** verificar consistência elétrica e de parametrização mínima.

### Entrada
- `tensao_mt_kv: number`
- `tensao_bt_kv: number`
- `potencia_trafo_kva: number`
- `pcs_quantidade: number`
- `pcs_potencia_kw: number`
- `bess_quantidade: number`
- `bess_energia_kwh_total: number`
- `bess_potencia_kw_total: number`

### Saída
- `status: "ok" | "alerta" | "erro"`
- `inconsistencias: string[]`
- `observacoes: string[]`

### Falhas esperadas
- Entrada não numérica
- Valores nulos/negativos
- MT <= BT

---

## 2) calcular_totais_instalados
**Objetivo:** consolidar totais para carimbo, resumo e validações cruzadas.

### Entrada
- `pcs_quantidade: number`
- `pcs_potencia_kw: number`
- `bess_energia_kwh_total: number`
- `bess_potencia_kw_total: number`

### Saída
- `potencia_pcs_total_kw: number`
- `energia_bess_total_kwh: number`
- `potencia_bess_total_kw: number`

---

## 3) sugerir_layout_diagramas
**Objetivo:** recomendar organização visual para diagrama de blocos e unifilar.

### Entrada
- `quantidades: { pcs: number, bess: number }`
- `limites_visuais: { largura: number, altura: number }`
- `modo: "blocos" | "unifilar"`

### Saída
- `recomendacoes_layout: string[]`
- `agrupamentos: string[]`
- `limites_detectados: string[]`

---

## 4) gerar_resumo_apresentacao
**Objetivo:** apoiar pitch de 3 minutos para avaliação.

### Entrada
- `diagnostico`
- `acoes_recomendadas`
- `tradeoffs`

### Saída
- `elevator_pitch_30s: string`
- `decisoes_llm_2min: string[]`
- `riscos_30s: string[]`
