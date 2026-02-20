import type { PerfilBess, Projeto } from "../modelos/tipos_bess";

export function criarProjetoPadrao(perfil: PerfilBess): Projeto {
  if (perfil === "C_I") {
    return {
      nome: "BESS C&I (pré-projeto)",
      perfil,
      tensao_mt_kv: 13.8,
      tensao_bt_kv: 0.8,
      frequencia_hz: 60,
      componentes: [
        { tipo: "GRID", quantidade: 1, params: {} },
        { tipo: "MV_CABIN", quantidade: 1, params: { classe_tensao_kv: 15 } },
        { tipo: "TRANSFORMER", quantidade: 1, params: { potencia_kva: 1500, mt_kv: 13.8, bt_kv: 0.8 } },
        { tipo: "SWITCHGEAR_BT", quantidade: 1, params: {} },
        { tipo: "PCS", quantidade: 1, params: { potencia_kw_por_pcs: 100 } },
        { tipo: "BESS", quantidade: 1, params: { energia_kwh_total: 193.5, potencia_kw_total: 100 } },
      ],
    };
  }

  return {
    nome: "BESS Utility (pré-projeto)",
    perfil,
    tensao_mt_kv: 13.8,
    tensao_bt_kv: 0.8,
    frequencia_hz: 60,
    componentes: [
      { tipo: "GRID", quantidade: 1, params: {} },
      { tipo: "MV_CABIN", quantidade: 1, params: { classe_tensao_kv: 15 } },
      { tipo: "TRANSFORMER", quantidade: 1, params: { potencia_kva: 2500, mt_kv: 13.8, bt_kv: 0.8 } },
      { tipo: "SWITCHGEAR_BT", quantidade: 1, params: {} },
      { tipo: "PCS", quantidade: 10, params: { potencia_kw_por_pcs: 200 } },
      { tipo: "BESS", quantidade: 1, params: { energia_kwh_total: 4472, potencia_kw_total: 2236, vdc_nominal: 1331.2 } },
    ],
  };
}