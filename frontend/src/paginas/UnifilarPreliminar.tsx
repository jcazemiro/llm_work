import { useParams, Link } from "react-router-dom";

export function UnifilarPreliminar() {
  const { idProjeto } = useParams();
  const raw = idProjeto ? localStorage.getItem(`projeto:${idProjeto}`) : null;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Unifilar Preliminar (placeholder)</h1>
      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8 }}>
        {raw ?? "(não encontrado)"}
      </pre>
      <Link to="/">Voltar</Link>
    </div>
  );
}