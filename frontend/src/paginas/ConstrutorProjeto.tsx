import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PerfilBess, Projeto, TipoComponente } from "../modelos/tipos_bess";
import { criarProjetoPadrao } from "../perfis/perfis";
import "./ui.css";

export function ConstrutorProjeto() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilBess>("C_I");
  const [projeto, setProjeto] = useState<Projeto>(() => criarProjetoPadrao("C_I"));

  const compPorTipo = useMemo(
    () => Object.fromEntries(projeto.componentes.map((c) => [c.tipo, c])) as Record<TipoComponente, Projeto["componentes"][number]>,
    [projeto.componentes]
  );

  function trocarPerfil(novo: PerfilBess) {
    setPerfil(novo);
    setProjeto(criarProjetoPadrao(novo));
  }

  function atualizarComponente(tipo: TipoComponente, atualizacao: Partial<Projeto["componentes"][number]>) {
    setProjeto((atual) => ({
      ...atual,
      componentes: atual.componentes.map((c) => {
        if (c.tipo !== tipo) return c;
        return {
          ...c,
          ...atualizacao,
          params: { ...c.params, ...(atualizacao.params ?? {}) },
        };
      }),
    }));
  }

  function salvarEIrPara(rota: "blocos" | "unifilar" | "assistente") {
    const id = crypto.randomUUID();
    localStorage.setItem(`projeto:${id}`, JSON.stringify(projeto));
    navigate(`/${rota}/${id}`);
  }

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="page-title">Gerador de Diagramas BESS</h1>
        <p className="page-subtitle">Monte o pré-projeto e avance para o diagrama de blocos, unifilar preliminar e análise com Assistente IA.</p>
      </header>

      <div className="toolbar">
        <span className="badge">Configuração de perfil</span>
        <label className="form-label" style={{ minWidth: 230 }}>
          Perfil do projeto
          <select value={perfil} onChange={(e) => trocarPerfil(e.target.value as PerfilBess)} className="select">
            <option value="C_I">C&amp;I (200 kWh)</option>
            <option value="UTILITY">Utility (4.5 MWh)</option>
          </select>
        </label>
      </div>

      <div className="grid-2">
        <section className="card">
          <h2 className="card-title">Dados gerais</h2>

          <label className="form-label">
            Nome do projeto
            <input value={projeto.nome} onChange={(e) => setProjeto({ ...projeto, nome: e.target.value })} className="input" />
          </label>

          <div className="grid-3" style={{ marginTop: 10 }}>
            <label className="form-label">
              Tensão MT (kV)
              <input
                type="number"
                value={projeto.tensao_mt_kv}
                onChange={(e) => setProjeto({ ...projeto, tensao_mt_kv: Number(e.target.value) })}
                className="input"
              />
            </label>

            <label className="form-label">
              Tensão BT (kV)
              <input
                type="number"
                value={projeto.tensao_bt_kv}
                onChange={(e) => setProjeto({ ...projeto, tensao_bt_kv: Number(e.target.value) })}
                className="input"
              />
            </label>

            <label className="form-label">
              Frequência (Hz)
              <input
                type="number"
                value={projeto.frequencia_hz}
                onChange={(e) => setProjeto({ ...projeto, frequencia_hz: Number(e.target.value) })}
                className="input"
              />
            </label>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Grupos e quantidades</h2>

          <div className="grid-2-fields">
            <label className="form-label">
              Potência do trafo (kVA)
              <input
                type="number"
                value={compPorTipo.TRANSFORMER?.params?.potencia_kva ?? 1500}
                onChange={(e) => atualizarComponente("TRANSFORMER", { params: { potencia_kva: Number(e.target.value) } })}
                className="input"
              />
            </label>

            <label className="form-label">
              Nº de PCS
              <input
                type="number"
                min={1}
                value={compPorTipo.PCS?.quantidade ?? 1}
                onChange={(e) => atualizarComponente("PCS", { quantidade: Number(e.target.value) })}
                className="input"
              />
            </label>

            <label className="form-label">
              Potência por PCS (kW)
              <input
                type="number"
                min={1}
                value={compPorTipo.PCS?.params?.potencia_kw_por_pcs ?? 100}
                onChange={(e) => atualizarComponente("PCS", { params: { potencia_kw_por_pcs: Number(e.target.value) } })}
                className="input"
              />
            </label>

            <label className="form-label">
              Nº de BESS
              <input
                type="number"
                min={1}
                value={compPorTipo.BESS?.quantidade ?? 1}
                onChange={(e) => atualizarComponente("BESS", { quantidade: Number(e.target.value) })}
                className="input"
              />
            </label>

            <label className="form-label">
              Energia total BESS (kWh)
              <input
                type="number"
                min={1}
                value={compPorTipo.BESS?.params?.energia_kwh_total ?? 193.5}
                onChange={(e) => atualizarComponente("BESS", { params: { energia_kwh_total: Number(e.target.value) } })}
                className="input"
              />
            </label>

            <label className="form-label">
              Potência total BESS (kW)
              <input
                type="number"
                min={1}
                value={compPorTipo.BESS?.params?.potencia_kw_total ?? 100}
                onChange={(e) => atualizarComponente("BESS", { params: { potencia_kw_total: Number(e.target.value) } })}
                className="input"
              />
            </label>
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2 className="card-title">Componentes (JSON)</h2>
        <pre className="code-block-gray">{JSON.stringify(projeto.componentes, null, 2)}</pre>
      </section>

      <div className="actions">
        <button className="action-btn" onClick={() => salvarEIrPara("blocos")}>Gerar diagrama de blocos</button>
        <button className="action-btn secondary" onClick={() => salvarEIrPara("unifilar")}>Gerar unifilar preliminar</button>
        <button className="action-btn" onClick={() => salvarEIrPara("assistente")}>Analisar com Assistente IA</button>
      </div>
    </div>
  );
}
