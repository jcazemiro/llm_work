import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PerfilBess, Projeto } from "../modelos/tipos_bess";
import { criarProjetoPadrao } from "../perfis/perfis";

export function ConstrutorProjeto() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilBess>("C_I");
  const [projeto, setProjeto] = useState<Projeto>(() => criarProjetoPadrao("C_I"));

  function trocarPerfil(novo: PerfilBess) {
    setPerfil(novo);
    setProjeto(criarProjetoPadrao(novo));
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

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Gerador de Diagramas (BESS)</h1>
      <p>Selecione um perfil e gere um diagrama de blocos e um unifilar preliminar.</p>

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
          <legend>Projeto</legend>

          <label>
            Nome:
            <input
              value={projeto.nome}
              onChange={(e) => setProjeto({ ...projeto, nome: e.target.value })}
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <label style={{ flex: 1 }}>
              Tensão MT (kV):
              <input
                type="number"
                value={projeto.tensao_mt_kv}
                onChange={(e) => setProjeto({ ...projeto, tensao_mt_kv: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label style={{ flex: 1 }}>
              Tensão BT (kV):
              <input
                type="number"
                value={projeto.tensao_bt_kv}
                onChange={(e) => setProjeto({ ...projeto, tensao_bt_kv: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 6 }}
              />
            </label>

            <label style={{ flex: 1 }}>
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
          <legend>Componentes (pré-configurado)</legend>
          <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
            {JSON.stringify(projeto.componentes, null, 2)}
          </pre>
        </fieldset>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={irParaBlocos}>Gerar diagrama de blocos</button>
        <button onClick={irParaUnifilar}>Gerar unifilar preliminar</button>
      </div>
    </div>
  );
}