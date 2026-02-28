# Especificação inicial de ferramentas (tools)

## 1) validar_consistencia_projeto
Entrada:
- tensao_mt_kv
- tensao_bt_kv
- potencia_trafo_kva
- pcs_quantidade
- pcs_potencia_kw
- bess_quantidade
- bess_energia_kwh_total
- bess_potencia_kw_total

Saída:
- status (ok|alerta|erro)
- inconsistencias[]
- observacoes[]

## 2) calcular_totais_instalados
Entrada:
- pcs_quantidade
- pcs_potencia_kw
- bess_energia_kwh_total
- bess_potencia_kw_total

Saída:
- potencia_pcs_total_kw
- energia_bess_total_kwh
- potencia_bess_total_kw

## 3) sugerir_layout_unifilar
Entrada:
- quantidades
- limites_visuais (largura/altura)

Saída:
- recomendacoes_layout[]
- agrupamentos[]
- limites_detectados[]
