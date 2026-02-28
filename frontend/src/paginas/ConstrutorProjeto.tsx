import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PerfilBess, Projeto, TipoComponente } from "../modelos/tipos_bess";
import { criarProjetoPadrao } from "../perfis/perfis";

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

  function irParaBlocos() {
    const id = crypto.randomUUID();
    localStorage.setItem(`projeto:${id}`, JSON.stringify(projeto));
    navigate(`/blocos/${id}`);
  }

  function irParaUnifilar() {
    const id = crypto.randomUUID();
    localStorage.setItem(`projeto:${id}`, JSON.stringify(projeto));
    navigate(`/unifilar/${id}`);
  }

  function irParaAssistenteIA() {
    const id = crypto.randomUUID();
    localStorage.setItem(`projeto:${id}`, JSON.stringify(projeto));
    navigate(`/assistente/${id}`);
  }

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Gerador de Diagramas (BESS)</h1>
      <p>Monte o projeto em grupos principais (MT, Trafo, PCS, BESS) e gere o unifilar preliminar.</p>

      <label>
        Perfil:
        <select
          value={perfil}
          onChange={(e) => trocarPerfil(e.target.value as PerfilBess)}
          style={{ marginLeft: 8 }}
        >
          <option value="C_I">C&amp;I (200 kWh)</option>
          <option value="UTILITY">Utility (4.5 MWh)</option>
        </select>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <fieldset>
          <legend>Dados gerais</legend>

          <label>
            Nome:
            <input
              value={projeto.nome}
              onChange={(e) => setProjeto({ ...projeto, nome: e.target.value })}
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 10 }}>
            <label>
              Tensão MT (kV):
              <input
                type="number"
                value={projeto.tensao_mt_kv}
                onChange={(e) => setProjeto({ ...projeto, tensao_mt_kv: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Tensão BT (kV):
              <input
                type="number"
                value={projeto.tensao_bt_kv}
                onChange={(e) => setProjeto({ ...projeto, tensao_bt_kv: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Frequência (Hz):
              <input
                type="number"
                value={projeto.frequencia_hz}
                onChange={(e) => setProjeto({ ...projeto, frequencia_hz: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Grupos e quantidades</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            <label>
              Potência do Trafo (kVA)
              <input
                type="number"
                value={compPorTipo.TRANSFORMER?.params?.potencia_kva ?? 1500}
                onChange={(e) => atualizarComponente("TRANSFORMER", { params: { potencia_kva: Number(e.target.value) } })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Nº de PCS
              <input
                type="number"
                min={1}
                value={compPorTipo.PCS?.quantidade ?? 1}
                onChange={(e) => atualizarComponente("PCS", { quantidade: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Potência por PCS (kW)
              <input
                type="number"
                min={1}
                value={compPorTipo.PCS?.params?.potencia_kw_por_pcs ?? 100}
                onChange={(e) => atualizarComponente("PCS", { params: { potencia_kw_por_pcs: Number(e.target.value) } })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Nº de BESS
              <input
                type="number"
                min={1}
                value={compPorTipo.BESS?.quantidade ?? 1}
                onChange={(e) => atualizarComponente("BESS", { quantidade: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Energia total BESS (kWh)
              <input
                type="number"
                min={1}
                value={compPorTipo.BESS?.params?.energia_kwh_total ?? 193.5}
                onChange={(e) => atualizarComponente("BESS", { params: { energia_kwh_total: Number(e.target.value) } })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label>
              Potência total BESS (kW)
              <input
                type="number"
                min={1}
                value={compPorTipo.BESS?.params?.potencia_kw_total ?? 100}
                onChange={(e) => atualizarComponente("BESS", { params: { potencia_kw_total: Number(e.target.value) } })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>
          </div>
        </fieldset>
      </div>

      <div style={{ marginTop: 12 }}>
        <fieldset>
          <legend>Componentes (json)</legend>
          <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(projeto.componentes, null, 2)}
          </pre>
        </fieldset>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={irParaBlocos}>Gerar diagrama de blocos</button>
        <button onClick={irParaUnifilar}>Gerar unifilar preliminar</button>
        <button onClick={irParaAssistenteIA}>Analisar com Assistente IA</button>
      </div>
    </div>
  );
}
