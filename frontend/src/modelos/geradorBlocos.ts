import type { Projeto, ItemComponente } from "./tipos_bess";

// Escapa caracteres especiais para SVG/XML (evita erro ao abrir arquivo baixado)
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

function infoDoItem(item: ItemComponente | undefined): string {
  if (!item) return "";

  if (item.tipo === "TRANSFORMER" && item.params?.potencia_kva) {
    const mt = item.params?.mt_kv ? `${item.params.mt_kv} kV` : "";
    const bt = item.params?.bt_kv ? `${item.params.bt_kv} kV` : "";
    const tensoes = [mt, bt].filter(Boolean).join(" / ");
    return `${item.params.potencia_kva} kVA${tensoes ? ` • ${tensoes}` : ""}`;
  }

  if (item.tipo === "PCS" && item.params?.potencia_kw_por_pcs) {
    return `${item.params.potencia_kw_por_pcs} kW (cada)`;
  }

  if (item.tipo === "BESS") {
    const e = item.params?.energia_kwh_total ? `${item.params.energia_kwh_total} kWh` : "";
    const p = item.params?.potencia_kw_total ? `${item.params.potencia_kw_total} kW` : "";
    return [e, p].filter(Boolean).join(" • ");
  }

  if (item.tipo === "MV_CABIN" && item.params?.classe_tensao_kv) {
    return `Classe ${item.params.classe_tensao_kv} kV`;
  }

  return "";
}

export function gerarSvgBlocos(projeto: Projeto): string {
  const seq: ItemComponente["tipo"][] = [
    "GRID",
    "MV_CABIN",
    "TRANSFORMER",
    "SWITCHGEAR_BT",
    "PCS",
    "BESS",
  ];

  // layout horizontal
  const boxW = 170;
  const boxH = 74;
  const gap = 32;

  const startX = 30;
  const y = 130;

  const w = startX * 2 + seq.length * boxW + (seq.length - 1) * gap;
  const h = 320;

  const titulo = escXml(projeto.nome);
  const subtitulo = escXml(
    `Perfil: ${projeto.perfil} • MT: ${projeto.tensao_mt_kv} kV • BT: ${projeto.tensao_bt_kv} kV • ${projeto.frequencia_hz} Hz`
  );

  const linhas = seq
    .slice(0, -1)
    .map((_, i) => {
      const x1 = startX + i * (boxW + gap) + boxW;
      const x2 = startX + (i + 1) * (boxW + gap);
      const y1 = y + boxH / 2;
      return `<line class="line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" />`;
    })
    .join("\n");

  const caixas = seq
    .map((tipo, i) => {
      const item = getComp(projeto, tipo);
      const q = item?.quantidade ?? 0;
      const x = startX + i * (boxW + gap);

      const t = `${rotulo(tipo)}${q ? ` (x${q})` : " (x0)"}`;
      const info = infoDoItem(item);

      return `
      <rect class="box" x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" />
      <text class="txt" x="${x + boxW / 2}" y="${y + 28}" text-anchor="middle">${escXml(t)}</text>
      ${
        info
          ? `<text class="subtxt" x="${x + boxW / 2}" y="${y + 52}" text-anchor="middle">${escXml(
              info
            )}</text>`
          : ""
      }
      `;
    })
    .join("\n");

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

    <text x="20" y="32" class="title">${titulo}</text>
    <text x="20" y="54" class="sub">${subtitulo}</text>

    ${linhas}
    ${caixas}
  </svg>
  `.trim();
}