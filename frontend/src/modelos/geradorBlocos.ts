import type { Projeto, ItemComponente } from "./tipos_bess";

function rotulo(item: ItemComponente) {
  switch (item.tipo) {
    case "GRID": return "REDE / CONCESSIONÁRIA";
    case "MV_CABIN": return "CUBÍCULO MT";
    case "TRANSFORMER": return "TRANSFORMADOR";
    case "SWITCHGEAR_BT": return "QGBT / BT";
    case "PCS": return "PCS";
    case "BESS": return "BESS";
    default: return item.tipo;
  }
}

export function gerarSvgBlocos(projeto: Projeto): string {
  // sequência simples em linha (pode evoluir depois)
  const seq = projeto.componentes.filter(c => c.quantidade > 0);
  const boxW = 220;
  const boxH = 70;
  const gap = 40;
  const startX = 40;
  const y = 80;

  const width = startX * 2 + seq.length * boxW + (seq.length - 1) * gap;
  const height = 220;

  const caixas = seq.map((item, i) => {
    const x = startX + i * (boxW + gap);
    const title = `${rotulo(item)}${item.quantidade > 1 ? ` (x${item.quantidade})` : ""}`;
    return `
      <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" />
      <text x="${x + boxW/2}" y="${y + 30}" text-anchor="middle">${title}</text>
    `;
  }).join("\n");

  const setas = seq.slice(0, -1).map((_, i) => {
    const x1 = startX + i * (boxW + gap) + boxW;
    const x2 = x1 + gap;
    const midY = y + boxH/2;
    return `
      <line x1="${x1}" y1="${midY}" x2="${x2}" y2="${midY}" marker-end="url(#arrow)"/>
    `;
  }).join("\n");

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" />
      </marker>
      <style>
        rect { fill: white; stroke: #111; stroke-width: 2; }
        text { font-family: system-ui; font-size: 14px; fill: #111; }
        line { stroke: #111; stroke-width: 2; }
        path { fill: #111; }
      </style>
    </defs>

    <text x="20" y="32" style="font: 700 18px system-ui;">${projeto.nome}</text>
    <text x="20" y="54" style="font: 14px system-ui;">Perfil: ${projeto.perfil} • MT: ${projeto.tensao_mt_kv} kV • BT: ${projeto.tensao_bt_kv} kV • ${projeto.frequencia_hz} Hz</text>

    ${setas}
    ${caixas}
  </svg>
  `.trim();
}