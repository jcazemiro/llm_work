import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { Projeto } from "../modelos/tipos_bess";
import { executarAssistenteProjeto } from "../ia/assistenteProjeto";

export function AssistenteIA() {
  const { idProjeto } = useParams();

  const projeto = useMemo(() => {
    const raw = idProjeto ? localStorage.getItem(`projeto:${idProjeto}`) : null;
    return raw ? (JSON.parse(raw) as Projeto) : null;
  }, [idProjeto]);

  if (!projeto) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Assistente IA</h1>
        <p>Projeto não encontrado.</p>
        <Link to="/">Voltar</Link>
      </div>
    );
  }

  const resposta = executarAssistenteProjeto(projeto);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Assistente IA — Análise do Projeto</h1>
      <p style={{ marginTop: 0, color: "#475569" }}>Integração inicial do front com prompt + tools para diagnóstico técnico preliminar.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <section style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, background: "#fff" }}>
          <h3>Diagnóstico</h3>
          <p>{resposta.diagnostico}</p>
          <h4>Resumo executivo</h4>
          <p>{resposta.resumo_executivo}</p>

          <h4>Ações recomendadas</h4>
          <ul>
            {resposta.acoes_recomendadas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4>Riscos / alertas</h4>
          <ul>
            {resposta.riscos.length ? resposta.riscos.map((item) => <li key={item}>{item}</li>) : <li>Sem riscos detectados nas validações básicas.</li>}
          </ul>

          <h4>Dados faltantes</h4>
          <ul>
            {resposta.dados_faltantes.length ? resposta.dados_faltantes.map((item) => <li key={item}>{item}</li>) : <li>Nenhum dado faltante obrigatório.</li>}
          </ul>

          <h4>Justificativa técnica</h4>
          <ul>
            {resposta.justificativa_tecnica.map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h4>Prioridade de execução</h4>
          <ul>
            {resposta.prioridade_execucao.map((item) => <li key={item.item}>{item.item} — {item.prioridade}</li>)}
          </ul>
        </section>

        <section style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, background: "#fff" }}>
          <h3>Prompt e Tools em uso</h3>
          <h4>System Prompt</h4>
          <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: 10, borderRadius: 8, overflow: "auto", whiteSpace: "pre-wrap" }}>
            {resposta.contexto_prompt}
          </pre>

          <h4>Saída estruturada (JSON)</h4>
          <pre style={{ background: "#111827", color: "#d1fae5", padding: 10, borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(
              {
                diagnostico: resposta.diagnostico,
                acoes_recomendadas: resposta.acoes_recomendadas,
                riscos: resposta.riscos,
                dados_faltantes: resposta.dados_faltantes,
                resumo_executivo: resposta.resumo_executivo,
                justificativa_tecnica: resposta.justificativa_tecnica,
                prioridade_execucao: resposta.prioridade_execucao,
              },
              null,
              2
            )}
          </pre>

          <h4>Tools executadas</h4>
          <pre style={{ background: "#111827", color: "#e5e7eb", padding: 10, borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(resposta.tools_executadas, null, 2)}
          </pre>
        </section>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
        <Link to={`/unifilar/${idProjeto}`}>Ver unifilar</Link>
        <Link to="/">Voltar ao construtor</Link>
      </div>
    </div>
  );
}
