import type { Projeto } from "../modelos/tipos_bess";

export interface ResultadoTool {
  nome: string;
  status: "ok" | "alerta" | "erro";
  saida: Record<string, any>;
}

function pegar(projeto: Projeto, tipo: string) {
  return projeto.componentes.find((c) => c.tipo === tipo);
}

export function validarConsistenciaProjeto(projeto: Projeto): ResultadoTool {
  const trafo = pegar(projeto, "TRANSFORMER");
  const pcs = pegar(projeto, "PCS");
  const bess = pegar(projeto, "BESS");

  const potenciaTrafo = Number(trafo?.params?.potencia_kva ?? 0);
  const pcsQtd = Number(pcs?.quantidade ?? 0);
  const pcsKw = Number(pcs?.params?.potencia_kw_por_pcs ?? 0);
  const bessQtd = Number(bess?.quantidade ?? 0);
  const bessKwh = Number(bess?.params?.energia_kwh_total ?? 0);
  const bessKw = Number(bess?.params?.potencia_kw_total ?? 0);

  const inconsistencias: string[] = [];
  const observacoes: string[] = [];

  if (projeto.tensao_mt_kv <= projeto.tensao_bt_kv) {
    inconsistencias.push("Tensão MT deve ser maior que a tensão BT.");
  }

  if (pcsQtd < 1 || bessQtd < 1) {
    inconsistencias.push("Quantidade de PCS e BESS deve ser maior que zero.");
  }

  const potenciaPcsTotal = pcsQtd * pcsKw;
  if (potenciaTrafo > 0 && potenciaPcsTotal > potenciaTrafo * 0.95) {
    observacoes.push("Potência total de PCS está próxima/maior da potência nominal do trafo (margem reduzida).");
  }

  if (bessKwh <= 0 || bessKw <= 0) {
    inconsistencias.push("Energia e potência total do BESS devem ser positivas.");
  }

  return {
    nome: "validar_consistencia_projeto",
    status: inconsistencias.length ? "erro" : observacoes.length ? "alerta" : "ok",
    saida: {
      status: inconsistencias.length ? "erro" : observacoes.length ? "alerta" : "ok",
      inconsistencias,
      observacoes,
    },
  };
}

export function calcularTotaisInstalados(projeto: Projeto): ResultadoTool {
  const pcs = pegar(projeto, "PCS");
  const bess = pegar(projeto, "BESS");

  const pcsQtd = Number(pcs?.quantidade ?? 0);
  const pcsKw = Number(pcs?.params?.potencia_kw_por_pcs ?? 0);

  const energiaBess = Number(bess?.params?.energia_kwh_total ?? 0);
  const potenciaBess = Number(bess?.params?.potencia_kw_total ?? 0);

  return {
    nome: "calcular_totais_instalados",
    status: "ok",
    saida: {
      potencia_pcs_total_kw: pcsQtd * pcsKw,
      energia_bess_total_kwh: energiaBess,
      potencia_bess_total_kw: potenciaBess,
    },
  };
}

export function sugerirLayoutUnifilar(projeto: Projeto): ResultadoTool {
  const pcs = pegar(projeto, "PCS");
  const bess = pegar(projeto, "BESS");

  const pcsQtd = Number(pcs?.quantidade ?? 0);
  const bessQtd = Number(bess?.quantidade ?? 0);

  const recomendacoes: string[] = [];

  if (pcsQtd > 12) {
    recomendacoes.push("Dividir PCS em duas seções de barramento para melhorar leitura e seletividade.");
  }

  if (bessQtd > 8) {
    recomendacoes.push("Criar subgrupos BESS por fileira com identificação funcional (B1..Bn por bloco).");
  }

  if (!recomendacoes.length) {
    recomendacoes.push("Layout atual está adequado para o volume de equipamentos informado.");
  }

  return {
    nome: "sugerir_layout_unifilar",
    status: "ok",
    saida: {
      recomendacoes_layout: recomendacoes,
      agrupamentos: ["MT", "Transformação", "BT/PCS/BESS"],
      limites_detectados: [],
    },
  };
}
