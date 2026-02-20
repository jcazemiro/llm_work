import type { Projeto, ItemComponente } from "./tipos_bess";

// Escapa caracteres especiais para SVG/XML (evita erro ao abrir o arquivo baixado)
function escXml(s: unknown) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getComp(projeto: Projeto, tipo: ItemComponente["tipo"]) {
  return projeto.componentes.find((c) => c.tipo === tipo);
}

function rotulo(tipo: ItemComponente["tipo"]) {
  switch (tipo) {
    case "GRID":
      return "REDE";
    case "MV_CABIN":
      return "CUBÍCULO MT";
    case "TRANSFORMER":
      return "TRAF";
    case "SWITCHGEAR_BT":
      return "QGBT";
    case "PCS":
      return "PCS";
    case "BESS":
      return "BESS";
    default:
      return tipo;
  }
}

export function gerarSvgUnifilar(projeto: Projeto): string {
  const seq: ItemComponente["tipo"][] = [
    "GRID",
    "MV_CABIN",
    "TRANSFORMER",
    "SWITCHGEAR_BT",
    "PCS",
    "BESS",
  ];

  // layout simples vertical
  const w = 520;
  const h = 760;

  const cx = 260; // centro
  const top = 120;
  const step = 105;

  const caixaW = 220;
  const caixaH = 62;

  const linhas = seq
    .slice(0, -1)
    .map((_, i) => {
      const y1 = top + i * step + caixaH;
      const y2 = top + (i + 1) * step;
      return `<line class="line" x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}" />`;
    })
    .join("\n");

  const caixas = seq
    .map((tipo, i) => {
      const item = getComp(projeto, tipo);
      const q = item?.quantidade ?? 0;

      const y = top + i * step;
      const x = cx - caixaW / 2;

      let info = "";
      if (tipo === "TRANSFORMER" && item?.params?.potencia_kva) {
        info = `${item.params.potencia_kva} kVA`;
      }
      if (tipo === "PCS" && item?.params?.potencia_kw_por_pcs) {
        info = `${item.params.potencia_kw_por_pcs} kW (cada)`;
      }
      if (
        tipo === "BESS" &&
        (item?.params?.energia_kwh_total || item?.params?.potencia_kw_total)
      ) {
        const e = item?.params?.energia_kwh_total
          ? `${item.params.energia_kwh_total} kWh`
          : "";
        const p = item?.params?.potencia_kw_total
          ? `${item.params.potencia_kw_total} kW`
          : "";
        info = [e, p].filter(Boolean).join(" • ");
      }

      const titulo = `${rotulo(tipo)}${q ? ` (x${q})` : " (x0)"}`;

      return `
      <rect class="box" x="${x}" y="${y}" width="${caixaW}" height="${caixaH}" rx="10" />
      <text class="txt" x="${cx}" y="${y + 26}" text-anchor="middle">${escXml(titulo)}</text>
      ${
        info
          ? `<text class="subtxt" x="${cx}" y="${y + 48}" text-anchor="middle">${escXml(
              info
            )}</text>`
          : ""
      }
    `;
    })
    .join("\n");

  const tituloProjeto = escXml(projeto.nome);
  const subtitulo = escXml(
    `MT: ${projeto.tensao_mt_kv} kV • BT: ${projeto.tensao_bt_kv} kV • ${projeto.frequencia_hz} Hz`
  );

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <style>
        .title { font: 700 18px system-ui; }
        .sub { font: 14px system-ui; }
        .txt { font: 13px system-ui; }
        .subtxt { font: 12px system-ui; }
        .line { stroke: #111; stroke-width: 2; }
        .box { fill: #fff; stroke: #111; stroke-width: 2; }
      </style>
    </defs>

    <text x="20" y="32" class="title">${tituloProjeto}</text>
    <text x="20" y="54" class="sub">${subtitulo}</text>

    ${linhas}
    ${caixas}
  </svg>
  `.trim();
}