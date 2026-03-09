const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const port = Number(process.env.PORT || 8787);
const PROMPT_VERSION = "v3.0";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function createTraceId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function getComponente(projeto, tipo) {
  return (projeto.componentes || []).find((c) => c.tipo === tipo);
}

function validarConsistenciaProjeto(projeto) {
  const trace_id = createTraceId("validar");
  const trafo = getComponente(projeto, "TRANSFORMER");
  const pcs = getComponente(projeto, "PCS");
  const bess = getComponente(projeto, "BESS");

  const potenciaTrafo = Number(trafo?.params?.potencia_kva ?? 0);
  const pcsQtd = Number(pcs?.quantidade ?? 0);
  const pcsKw = Number(pcs?.params?.potencia_kw_por_pcs ?? 0);
  const bessQtd = Number(bess?.quantidade ?? 0);
  const bessKwh = Number(bess?.params?.energia_kwh_total ?? 0);
  const bessKw = Number(bess?.params?.potencia_kw_total ?? 0);

  const inconsistencias = [];
  const observacoes = [];

  if (!Number.isFinite(projeto.tensao_mt_kv) || !Number.isFinite(projeto.tensao_bt_kv)) {
    inconsistencias.push("Tensão MT/BT inválida ou ausente.");
  } else if (projeto.tensao_mt_kv <= projeto.tensao_bt_kv) {
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

  const status = inconsistencias.length ? "erro" : observacoes.length ? "alerta" : "ok";

  return {
    nome: "validar_consistencia_projeto",
    status,
    trace_id,
    saida: {
      status,
      inconsistencias,
      observacoes,
      trace_id,
    },
  };
}

function calcularTotaisInstalados(projeto) {
  const trace_id = createTraceId("totais");
  const pcs = getComponente(projeto, "PCS");
  const bess = getComponente(projeto, "BESS");

  const pcsQtd = Number(pcs?.quantidade ?? 0);
  const pcsKw = Number(pcs?.params?.potencia_kw_por_pcs ?? 0);

  const energiaBess = Number(bess?.params?.energia_kwh_total ?? 0);
  const potenciaBess = Number(bess?.params?.potencia_kw_total ?? 0);

  return {
    nome: "calcular_totais_instalados",
    status: "ok",
    trace_id,
    saida: {
      status: "ok",
      potencia_pcs_total_kw: pcsQtd * pcsKw,
      energia_bess_total_kwh: energiaBess,
      potencia_bess_total_kw: potenciaBess,
      trace_id,
    },
  };
}

function sugerirLayoutDiagramas(projeto) {
  const trace_id = createTraceId("layout");
  const pcs = getComponente(projeto, "PCS");
  const bess = getComponente(projeto, "BESS");

  const pcsQtd = Number(pcs?.quantidade ?? 0);
  const bessQtd = Number(bess?.quantidade ?? 0);

  const recomendacoes = [];

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
    nome: "sugerir_layout_diagramas",
    status: "ok",
    trace_id,
    saida: {
      status: "ok",
      recomendacoes_layout: recomendacoes,
      agrupamentos: ["MT", "Transformação", "BT/PCS/BESS"],
      limites_detectados: [],
      trace_id,
    },
  };
}

function gerarRespostaDeterministica(projeto, tools) {
  const [validacao, totais, layout] = tools;
  const dadosFaltantes = [];

  if (!projeto?.nome?.trim()) dadosFaltantes.push("DADO INSUFICIENTE: nome do projeto");
  if (!projeto?.frequencia_hz) dadosFaltantes.push("DADO INSUFICIENTE: frequência");

  const riscos = [
    ...(validacao.saida.inconsistencias || []),
    ...(validacao.saida.observacoes || []),
  ];

  const diagnostico =
    validacao.status === "erro"
      ? "Projeto com inconsistências técnicas básicas que devem ser corrigidas antes da emissão preliminar."
      : validacao.status === "alerta"
      ? "Projeto tecnicamente viável para pré-projeto, com alertas de capacidade/arranjo."
      : "Projeto consistente para unifilar preliminar, sem inconsistências detectadas nas validações básicas.";

  return {
    diagnostico,
    acoes_recomendadas: [
      ...(layout.saida.recomendacoes_layout || []),
      "Conferir coordenação/proteção e seccionamento no projeto executivo.",
      "Validar o diagrama com checklist de legibilidade para apresentação (setas, grupos e carimbo).",
    ],
    riscos,
    dados_faltantes: dadosFaltantes,
    resumo_executivo: `PCS total: ${totais.saida.potencia_pcs_total_kw} kW | BESS: ${totais.saida.energia_bess_total_kwh} kWh / ${totais.saida.potencia_bess_total_kw} kW.`,
    justificativa_tecnica: [
      `validar_consistencia_projeto: ${validacao.status} (trace ${validacao.trace_id})`,
      `calcular_totais_instalados: totais consolidados (trace ${totais.trace_id})`,
      `sugerir_layout_diagramas: recomendações de legibilidade (trace ${layout.trace_id})`,
    ],
    prioridade_execucao: [
      { item: "Corrigir inconsistências elétricas básicas", prioridade: "alta" },
      { item: "Ajustar layout dos diagramas para legibilidade", prioridade: "media" },
      { item: "Refinar texto do pitch e documentação", prioridade: "baixa" },
    ],
  };
}

function validarSchemaResposta(resposta) {
  if (!resposta || typeof resposta !== "object") return false;

  const camposString = ["diagnostico", "resumo_executivo"];
  const camposLista = ["acoes_recomendadas", "riscos", "dados_faltantes", "justificativa_tecnica", "prioridade_execucao"];

  if (!camposString.every((k) => typeof resposta[k] === "string")) return false;
  if (!camposLista.every((k) => Array.isArray(resposta[k]))) return false;

  return resposta.prioridade_execucao.every(
    (item) =>
      item &&
      typeof item.item === "string" &&
      ["alta", "media", "baixa"].includes(item.prioridade)
  );
}


app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    servico: "assistente-bess-backend",
    mensagem: "API online. Use /health, /api/assistente/exemplo e POST /api/assistente/analisar.",
    endpoints: {
      health: "/health",
      exemplo: "/api/assistente/exemplo",
      analisar: "/api/assistente/analisar"
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/assistente/exemplo", (_req, res) => {
  const projetoExemplo = {
    nome: "BESS Exemplo",
    frequencia_hz: 60,
    tensao_mt_kv: 34.5,
    tensao_bt_kv: 13.8,
    componentes: [
      { tipo: "TRANSFORMER", quantidade: 1, params: { potencia_kva: 5000 } },
      { tipo: "PCS", quantidade: 8, params: { potencia_kw_por_pcs: 500 } },
      { tipo: "BESS", quantidade: 8, params: { energia_kwh_total: 8000, potencia_kw_total: 4000 } },
    ],
  };

  const t1 = validarConsistenciaProjeto(projetoExemplo);
  const t2 = calcularTotaisInstalados(projetoExemplo);
  const t3 = sugerirLayoutDiagramas(projetoExemplo);
  const resposta = gerarRespostaDeterministica(projetoExemplo, [t1, t2, t3]);

  return res.json({ projeto: projetoExemplo, prompt_version: PROMPT_VERSION, tools_executadas: [t1, t2, t3], resposta });
});

app.post("/api/assistente/analisar", (req, res) => {
  const projeto = req.body?.projeto;

  if (!projeto || typeof projeto !== "object") {
    return res.status(400).json({ erro: "Campo 'projeto' é obrigatório." });
  }

  const t1 = validarConsistenciaProjeto(projeto);
  const t2 = calcularTotaisInstalados(projeto);
  const t3 = sugerirLayoutDiagramas(projeto);
  const resposta = gerarRespostaDeterministica(projeto, [t1, t2, t3]);

  if (!validarSchemaResposta(resposta)) {
    return res.status(500).json({ erro: "Resposta gerada fora do schema esperado." });
  }

  return res.json({
    modelo: {
      provider: process.env.LLM_PROVIDER || "deterministic-local",
      model: process.env.LLM_MODEL || "rule-engine-v2",
      temperature: Number(process.env.LLM_TEMPERATURE || 0.2),
      top_p: Number(process.env.LLM_TOP_P || 0.9),
      prompt_version: PROMPT_VERSION,
    },
    tools_executadas: [t1, t2, t3],
    resposta,
  });
});

app.listen(port, () => {
  console.log(`Backend online em http://localhost:${port}`);
});
