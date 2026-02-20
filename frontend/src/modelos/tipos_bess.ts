export const PERFIS_BESS = {
  C_I: "C_I",
  UTILITY: "UTILITY",
} as const;

export type PerfilBess = (typeof PERFIS_BESS)[keyof typeof PERFIS_BESS];

export type TipoComponente =
  | "GRID"
  | "MV_CABIN"
  | "TRANSFORMER"
  | "SWITCHGEAR_BT"
  | "PCS"
  | "BESS";

export interface ItemComponente {
  tipo: TipoComponente;
  quantidade: number;
  params: Record<string, any>;
}

export interface Projeto {
  nome: string;
  perfil: PerfilBess;
  tensao_mt_kv: number;
  tensao_bt_kv: number;
  frequencia_hz: number;
  componentes: ItemComponente[];
}