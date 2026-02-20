import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import type { Projeto } from "../modelos/tipos_bess";
import { gerarSvgUnifilar } from "../modelos/geradorUnifilar";

export function UnifilarPreliminar() {
  const { idProjeto } = useParams();

  const projeto = useMemo(() => {
    const raw = idProjeto ? localStorage.getItem(`projeto:${idProjeto}`) : null;
    return raw ? (JSON.parse(raw) as Projeto) : null;
  }, [idProjeto]);

  if (!projeto) {
    return (
      <div style={{ padding: 16, fontFamily: "system-ui" }}>
        <h1>Unifilar Preliminar</h1>
        <p>Projeto não encontrado.</p>
        <Link to="/">Voltar</Link>
      </div>
    );
  }

  const svg = gerarSvgUnifilar(projeto);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Unifilar Preliminar</h1>

      <div
        style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, overflow: "auto" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <a
          href={"data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)}
          download={`unifilar_${idProjeto}.svg`}
        >
          Baixar SVG
        </a>
        <Link to="/">Voltar</Link>
      </div>
    </div>
  );
}