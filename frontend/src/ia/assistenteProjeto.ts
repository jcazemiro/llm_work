import type { Projeto } from "../modelos/tipos_bess";
import { systemPrompt } from "../prompts/systemPrompt";
import {
  calcularTotaisInstalados,
  sugerirLayoutUnifilar,
  validarConsistenciaProjeto,
} from "../tools/engineTools";

export interface RespostaAssistente {
  diagnostico: string;
  acoes_recomendadas: string[];
  riscos: string[];
  dados_faltantes: string[];
  resumo_executivo: string;
  contexto_prompt: string;
  tools_executadas: ReturnType<typeof validarConsistenciaProjeto>[];
}

export function executarAssistenteProjeto(projeto: Projeto): RespostaAssistente {
  const t1 = validarConsistenciaProjeto(projeto);
  const t2 = calcularTotaisInstalados(projeto);
  const t3 = sugerirLayoutUnifilar(projeto);

  const dadosFaltantes: string[] = [];
  if (!projeto.nome?.trim()) dadosFaltantes.push("Nome do projeto");
  if (!projeto.frequencia_hz) dadosFaltantes.push("Frequência");

  const riscos = [
    ...((t1.saida.inconsistencias as string[]) ?? []),
    ...((t1.saida.observacoes as string[]) ?? []),
  ];

  const acoes = [
    ...((t3.saida.recomendacoes_layout as string[]) ?? []),
    "Conferir coordenação/proteção e seccionamento no projeto executivo.",
  ];

  const diagnostico =
    t1.status === "erro"
      ? "Projeto com inconsistências técnicas básicas que devem ser corrigidas antes da emissão preliminar."
      : t1.status === "alerta"
        ? "Projeto tecnicamente viável para pré-projeto, com alertas de capacidade/arranjo."
        : "Projeto consistente para unifilar preliminar, sem inconsistências detectadas nas validações básicas.";

  const totais = t2.saida;

  return {
    diagnostico,
    acoes_recomendadas: acoes,
    riscos,
    dados_faltantes: dadosFaltantes,
    resumo_executivo: `PCS total: ${totais.potencia_pcs_total_kw} kW | BESS: ${totais.energia_bess_total_kwh} kWh / ${totais.potencia_bess_total_kw} kW.`,
    contexto_prompt: systemPrompt,
    tools_executadas: [t1, t2, t3],
  };
}
