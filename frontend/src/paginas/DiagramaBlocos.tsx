import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import type { Projeto } from "../modelos/tipos_bess";
import { gerarSvgBlocos } from "../modelos/geradorBlocos";

export function DiagramaBlocos() {
  const { idProjeto } = useParams();
  const projeto = useMemo(() => {
    const raw = idProjeto ? localStorage.getItem(`projeto:${idProjeto}`) : null;
    return raw ? (JSON.parse(raw) as Projeto) : null;
  }, [idProjeto]);

  if (!projeto) {
    return (
      <div style={{ padding: 16, fontFamily: "system-ui" }}>
        <h1>Diagrama de Blocos</h1>
        <p>Projeto não encontrado.</p>
        <Link to="/">Voltar</Link>
      </div>
    );
  }

  const svg = gerarSvgBlocos(projeto);

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: 20, fontFamily: "system-ui", boxSizing: "border-box" }}>
      <h1 style={{ margin: 0 }}>Diagrama de Blocos</h1>
      <p style={{ color: "#475569", marginTop: 8 }}>Visão macro do sistema com fluxo funcional para apresentação e discussão técnica.</p>

      <div style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, overflow: "auto", background: "#fff" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <a
          href={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)}
          download={`diagrama_blocos_${idProjeto}.svg`}
        >
          Baixar SVG
        </a>
        <Link to="/">Voltar</Link>
      </div>
    </div>
  );
}
