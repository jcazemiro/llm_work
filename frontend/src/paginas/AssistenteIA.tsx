import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { Projeto } from "../modelos/tipos_bess";
import { executarAssistenteProjeto } from "../ia/assistenteProjeto";
import "./ui.css";

export function AssistenteIA() {
  const { idProjeto } = useParams();

  const projeto = useMemo(() => {
    const raw = idProjeto ? localStorage.getItem(`projeto:${idProjeto}`) : null;
    return raw ? (JSON.parse(raw) as Projeto) : null;
  }, [idProjeto]);

  if (!projeto) {
    return (
      <div className="page-shell">
        <h1 className="page-title">Assistente IA</h1>
        <p className="page-subtitle">Projeto não encontrado.</p>
        <Link to="/">Voltar</Link>
      </div>
    );
  }

  const resposta = executarAssistenteProjeto(projeto);

  return (
    <div className="page-shell">
      <header className="page-header">
        <span className="badge">Diagnóstico técnico</span>
        <h1 className="page-title">Assistente IA — Análise do Projeto</h1>
        <p className="page-subtitle">Integração do front com prompt e tools para diagnóstico técnico preliminar e rastreável.</p>
      </header>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Resultado da análise</h2>
          <p>{resposta.diagnostico}</p>

          <h3 className="card-title" style={{ marginTop: 16 }}>Resumo executivo</h3>
          <p>{resposta.resumo_executivo}</p>

          <h3 className="card-title" style={{ marginTop: 16 }}>Ações recomendadas</h3>
          <ul>
            {resposta.acoes_recomendadas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="card-title" style={{ marginTop: 16 }}>Riscos / alertas</h3>
          <ul>
            {resposta.riscos.length ? resposta.riscos.map((item) => <li key={item}>{item}</li>) : <li>Sem riscos detectados nas validações básicas.</li>}
          </ul>

          <h3 className="card-title" style={{ marginTop: 16 }}>Dados faltantes</h3>
          <ul>
            {resposta.dados_faltantes.length ? resposta.dados_faltantes.map((item) => <li key={item}>{item}</li>) : <li>Nenhum dado faltante obrigatório.</li>}
          </ul>

          <h3 className="card-title" style={{ marginTop: 16 }}>Justificativa técnica</h3>
          <ul>
            {resposta.justificativa_tecnica.map((item) => <li key={item}>{item}</li>)}
          </ul>

          <h3 className="card-title" style={{ marginTop: 16 }}>Prioridade de execução</h3>
          <ul>
            {resposta.prioridade_execucao.map((item) => (
              <li key={item.item}>
                {item.item} — {item.prioridade}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="card-title">Prompt e tools em uso</h2>
          <h3 className="card-title">System prompt</h3>
          <pre className="code-block">{resposta.contexto_prompt}</pre>

          <h3 className="card-title" style={{ marginTop: 16 }}>Saída estruturada (JSON)</h3>
          <pre className="code-block-green">
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

          <h3 className="card-title" style={{ marginTop: 16 }}>Tools executadas</h3>
          <pre className="code-block-gray">{JSON.stringify(resposta.tools_executadas, null, 2)}</pre>
        </section>
      </div>

      <div className="actions">
        <Link to={`/unifilar/${idProjeto}`}>Ver unifilar</Link>
        <Link to="/">Voltar ao construtor</Link>
      </div>
    </div>
  );
}
