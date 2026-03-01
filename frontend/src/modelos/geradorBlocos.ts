import type { Projeto, ItemComponente } from "./tipos_bess";

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

function num(n: unknown, fallback: number) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function gerarSvgBlocos(projeto: Projeto): string {
  const trafo = getComp(projeto, "TRANSFORMER");
  const pcs = getComp(projeto, "PCS");
  const bess = getComp(projeto, "BESS");

  const trafoKva = num(trafo?.params?.potencia_kva, 1500);
  const mtKv = num(trafo?.params?.mt_kv, projeto.tensao_mt_kv);
  const btKv = num(trafo?.params?.bt_kv, projeto.tensao_bt_kv);
  const pcsQtd = num(pcs?.quantidade, 1);
  const pcsKw = num(pcs?.params?.potencia_kw_por_pcs, 100);
  const bessQtd = num(bess?.quantidade, 1);
  const bessKwh = num(bess?.params?.energia_kwh_total, 193.5);

  const W = 1780;
  const H = 1030;

  const palette = {
    bg: "#efefef",
    frame: "#0f172a",
    dashed: "#b5b7bd",
    title: "#111827",
    text: "#111827",
    subtle: "#475569",
    line: "#111111",
    panel: "#f8f8f8",
  };

  const rect = (x: number, y: number, w: number, h: number, rx = 0, dashed = false, fill = "none", sw = 1.2) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${dashed ? palette.dashed : palette.frame}" stroke-width="${sw}" ${dashed ? 'stroke-dasharray="7 5"' : ""} />`;

  const line = (x1: number, y1: number, x2: number, y2: number, markerStart = false, markerEnd = true, sw = 2.4) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette.line}" stroke-width="${sw}" ${markerStart ? 'marker-start="url(#arrow)"' : ""} ${markerEnd ? 'marker-end="url(#arrow)"' : ""} />`;

  const text = (
    x: number,
    y: number,
    value: string,
    size = 14,
    weight: "normal" | "bold" = "normal",
    anchor: "start" | "middle" | "end" = "start",
    color = palette.text
  ) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter, Arial" font-size="${size}" font-weight="${weight}" fill="${color}">${escXml(value)}</text>`;

  const hatch = (x: number, y: number, w: number, h: number, gap = 6) => {
    const lines: string[] = [];
    for (let i = 0; i < h; i += gap) {
      lines.push(`<line x1="${x}" y1="${y + i}" x2="${x + w}" y2="${y + i}" stroke="#5b5f67" stroke-width="1" />`);
    }
    return lines.join("");
  };

  const card = (x: number, y: number, w: number, h: number, title: string, content: string) =>
    `${rect(x, y, w, h, 4, true)}${text(x + w / 2, y + 22, title, 29 / 2, "bold", "middle")}${content}`;

  const drawTower = (x: number, y: number, w: number, h: number) => {
    const cx = x + w / 2;
    return `
      <line x1="${cx}" y1="${y + 30}" x2="${cx - 24}" y2="${y + h - 20}" stroke="#222" stroke-width="3" />
      <line x1="${cx}" y1="${y + 30}" x2="${cx + 24}" y2="${y + h - 20}" stroke="#222" stroke-width="3" />
      <line x1="${cx - 30}" y1="${y + h - 20}" x2="${cx + 30}" y2="${y + h - 20}" stroke="#4a2d14" stroke-width="4" />
      <line x1="${cx - 20}" y1="${y + 50}" x2="${cx + 20}" y2="${y + 50}" stroke="#222" stroke-width="2" />
      <line x1="${cx - 24}" y1="${y + 72}" x2="${cx + 24}" y2="${y + 72}" stroke="#222" stroke-width="2" />
      <line x1="${cx - 18}" y1="${y + 94}" x2="${cx + 18}" y2="${y + 94}" stroke="#222" stroke-width="2" />
      <line x1="${cx - 16}" y1="${y + 36}" x2="${cx + 16}" y2="${y + 36}" stroke="#222" stroke-width="2" />
      <line x1="${cx - 16}" y1="${y + 116}" x2="${cx + 16}" y2="${y + 116}" stroke="#222" stroke-width="2" />
      <line x1="${cx - 18}" y1="${y + 30}" x2="${cx - 40}" y2="${y + 20}" stroke="#222" stroke-width="3" />
      <line x1="${cx + 18}" y1="${y + 30}" x2="${cx + 40}" y2="${y + 20}" stroke="#222" stroke-width="3" />
      <line x1="${cx - 25}" y1="${y + 52}" x2="${cx - 54}" y2="${y + 42}" stroke="#222" stroke-width="3" />
      <line x1="${cx + 25}" y1="${y + 52}" x2="${cx + 54}" y2="${y + 42}" stroke="#222" stroke-width="3" />
      <line x1="${cx - 28}" y1="${y + 74}" x2="${cx - 58}" y2="${y + 64}" stroke="#222" stroke-width="3" />
      <line x1="${cx + 28}" y1="${y + 74}" x2="${cx + 58}" y2="${y + 64}" stroke="#222" stroke-width="3" />
    `;
  };

  const drawFactory = (x: number, y: number, w: number, h: number) => `
    <rect x="${x + 8}" y="${y + 55}" width="${w - 16}" height="${h - 65}" fill="#c9c9c9" stroke="#777" />
    <rect x="${x + 4}" y="${y + 48}" width="${w - 8}" height="18" fill="#28714e" stroke="#215f41" />
    <polygon points="${x + 28},${y + 48} ${x + 50},${y + 48} ${x + 46},${y + 4} ${x + 32},${y + 4}" fill="#9ca3af" stroke="#7b828f" />
    <polygon points="${x + w - 50},${y + 48} ${x + w - 28},${y + 48} ${x + w - 32},${y + 4} ${x + w - 46},${y + 4}" fill="#9ca3af" stroke="#7b828f" />
    <rect x="${x + w / 2 - 26}" y="${y + h - 36}" width="52" height="30" fill="#27272a" stroke="#111" />
    ${hatch(x + w / 2 - 24, y + h - 34, 48, 26, 4)}
    <rect x="${x + 20}" y="${y + h - 34}" width="30" height="18" fill="#3f3f46" stroke="#111" />
    <rect x="${x + w - 50}" y="${y + h - 34}" width="30" height="18" fill="#3f3f46" stroke="#111" />
  `;

  const drawCabine = (x: number, y: number, w: number, h: number) => `
    <rect x="${x + 16}" y="${y + 24}" width="${w - 32}" height="${h - 38}" fill="#cfcfcf" stroke="#8b8b8b" />
    <rect x="${x + 8}" y="${y + 20}" width="${w - 16}" height="8" fill="#9aa0a6" stroke="#6b7280" />
    <rect x="${x + w / 2 - 34}" y="${y + h - 66}" width="68" height="58" fill="#595b60" stroke="#2f3135" />
    ${hatch(x + w / 2 - 32, y + h - 64, 64, 54, 4)}
    <rect x="${x + w / 2 - 35}" y="${y + h - 66}" width="2" height="58" fill="#b6bbc2" />
    <rect x="${x + 34}" y="${y + h - 44}" width="16" height="8" fill="#dc2626" stroke="#111" />
    <rect x="${x + 34}" y="${y + h - 41}" width="16" height="3" fill="#f8fafc" stroke="none" />
    <rect x="${x + w - 50}" y="${y + h - 46}" width="8" height="34" fill="#dc2626" stroke="#111" />
    <circle cx="${x + w - 46}" cy="${y + h - 48}" r="4" fill="#111" />
  `;

  const drawIntegracao = (x: number, y: number, w: number, h: number) => {
    let doors = "";
    const sections = 8;
    const sx = x + 16;
    const sy = y + 42;
    const sw = (w - 32) / sections;
    doors += `<rect x="${sx}" y="${sy}" width="${w - 32}" height="${h - 58}" fill="#d8d5cc" stroke="#7f7a70" />`;
    doors += `<rect x="${sx}" y="${sy}" width="${w - 32}" height="10" fill="#c7c2b7" stroke="none" />`;
    for (let i = 1; i < sections; i++) {
      const xx = sx + i * sw;
      doors += `<line x1="${xx}" y1="${sy}" x2="${xx}" y2="${sy + h - 58}" stroke="#4b4b4b" stroke-width="2" />`;
    }
    for (let i = 0; i < sections; i++) {
      const hx = sx + i * sw + 4;
      doors += `<rect x="${hx}" y="${sy + h - 84}" width="2" height="12" fill="#111" />`;
    }
    return doors;
  };

  const drawSimpleCabinet = (x: number, y: number, w: number, h: number, tone = "#d7d3ca") => `
    <rect x="${x + 28}" y="${y + 26}" width="${w - 56}" height="${h - 44}" fill="${tone}" stroke="#666" />
    <rect x="${x + 24}" y="${y + 22}" width="${w - 48}" height="6" fill="#b6b1a8" stroke="#666" />
    <rect x="${x + 35}" y="${y + h / 2}" width="4" height="16" fill="#111" />
  `;

  const drawTransformer = (x: number, y: number, w: number, h: number) => `
    <rect x="${x + 14}" y="${y + 26}" width="${w - 28}" height="${h - 40}" fill="#dddddd" stroke="#5f6368" />
    <rect x="${x + 6}" y="${y + 22}" width="${w - 12}" height="7" fill="#c5c8ce" stroke="#7a7f88" />
    <rect x="${x + 24}" y="${y + 44}" width="42" height="52" fill="#ececec" stroke="#555" />
    <rect x="${x + w - 66}" y="${y + 44}" width="42" height="52" fill="#ececec" stroke="#555" />
    <rect x="${x + 26}" y="${y + h - 54}" width="44" height="26" fill="#cfd4da" stroke="#6b7280" />
    ${hatch(x + 28, y + h - 52, 40, 22, 4)}
    <rect x="${x + w - 70}" y="${y + h - 54}" width="44" height="26" fill="#cfd4da" stroke="#6b7280" />
    ${hatch(x + w - 68, y + h - 52, 40, 22, 4)}
  `;

  const drawQsw = (x: number, y: number, w: number, h: number) => `
    <rect x="${x + 16}" y="${y + 24}" width="${w - 32}" height="${h - 36}" fill="#d8dcdf" stroke="#666" />
    <rect x="${x + 24}" y="${y + 40}" width="${w - 48}" height="18" fill="#c4c9cf" stroke="#5b5f67" />
    ${hatch(x + 26, y + 42, w - 52, 14, 3)}
    <rect x="${x + 52}" y="${y + 70}" width="${w - 104}" height="30" fill="#f3f4f6" stroke="#4b5563" />
    <circle cx="${x + w / 2}" cy="${y + 86}" r="3" fill="#eab308" stroke="#111" />
    <rect x="${x + 28}" y="${y + h - 44}" width="${w - 56}" height="16" fill="#c4c9cf" stroke="#5b5f67" />
    ${hatch(x + 30, y + h - 42, w - 60, 12, 3)}
  `;

  const drawBess = (x: number, y: number, w: number, h: number) => {
    const modules = 3;
    const mw = (w - 30) / modules;
    let out = `<rect x="${x + 12}" y="${y + 34}" width="${w - 24}" height="${h - 46}" fill="#d1d5db" stroke="#4b5563" />`;
    for (let i = 1; i < modules; i++) {
      const xx = x + 12 + i * mw;
      out += `<line x1="${xx}" y1="${y + 34}" x2="${xx}" y2="${y + h - 12}" stroke="#111" stroke-width="2" />`;
    }
    for (let i = 0; i < modules; i++) {
      const xx = x + 18 + i * mw;
      out += `<rect x="${xx}" y="${y + 46}" width="${mw - 16}" height="${h - 74}" fill="#e5e7eb" stroke="#6b7280" />`;
      out += `<line x1="${xx + 8}" y1="${y + 46}" x2="${xx + 8}" y2="${y + h - 28}" stroke="#9ca3af" />`;
      out += `<line x1="${xx + mw - 24}" y1="${y + 46}" x2="${xx + mw - 24}" y2="${y + h - 28}" stroke="#9ca3af" />`;
    }
    return out;
  };

  let svg = "";
  svg += `<rect width="100%" height="100%" fill="${palette.bg}" />`;
  svg += rect(10, 10, W - 20, H - 20, 0, false, "none", 1.8);

  svg += text(26, 42, "DIAGRAMA DE BLOCOS — ARRANJO BESS", 24, "bold", "start", palette.title);
  svg += text(26, 66, `${projeto.nome} • MT ${mtKv} kV / BT ${btKv} kV • ${projeto.frequencia_hz} Hz`, 12, "normal", "start", palette.subtle);

  // Top layer
  svg += card(36, 170, 190, 200, "REDE", drawTower(60, 194, 150, 152));
  svg += card(330, 260, 210, 300, "CABINE MT\nEXISTENTE", drawCabine(344, 272, 182, 272));
  svg += card(610, 260, 420, 300, "CABINE DE INTEGRAÇÃO", drawIntegracao(620, 272, 400, 278));
  svg += card(630, 40, 180, 170, "TRANSFORMADOR DE\nATERRAMENTO", drawSimpleCabinet(650, 68, 140, 130));
  svg += card(890, 40, 170, 170, "QD-COM", drawSimpleCabinet(910, 68, 130, 130));

  // Mid-lower
  svg += card(290, 670, 120, 200, "QD-TF", drawSimpleCabinet(300, 690, 100, 170));
  svg += card(470, 680, 170, 190, "TRANSFORMADOR\nAUXILIAR", drawSimpleCabinet(488, 706, 134, 150));
  svg += card(710, 655, 180, 215, "QSW", drawQsw(724, 670, 150, 188));
  svg += card(990, 650, 220, 230, "TRANSFORMADOR\nDE POTÊNCIA", drawTransformer(1002, 665, 196, 206));

  // Bottom
  svg += card(310, 815, 390, 190, "BESS", drawBess(324, 830, 362, 166) + text(505, 998, `${bessQtd} un • ${bessKwh} kWh total`, 11, "normal", "middle", palette.subtle));
  svg += card(760, 815, 130, 150, "PCS", drawSimpleCabinet(770, 836, 110, 112) + text(825, 956, `${pcsQtd} x ${pcsKw} kW`, 10, "normal", "middle", palette.subtle));

  // Factory block
  svg += card(36, 520, 190, 200, "FÁBRICA", drawFactory(48, 540, 166, 160));

  // Flows - adjusted to avoid overlap and mimic sample
  svg += line(226, 320, 328, 320, true, true); // REDE <-> CABINE MT
  svg += line(540, 418, 608, 418, true, true); // CABINE MT <-> CAB INTEG

  svg += line(715, 250, 715, 212, false, true); // integração -> aterr
  svg += line(975, 250, 975, 212, false, true); // integração -> qd-com

  // Right descent from integração to trafo potência
  svg += line(1030, 440, 1110, 440, false, false);
  svg += line(1110, 440, 1110, 650, false, true);

  // mid chain with bidirectional style
  svg += line(710, 770, 642, 770, false, true); // qsw -> trafo aux
  svg += line(470, 770, 412, 770, false, true); // trafo aux -> qd-tf
  svg += line(892, 774, 988, 774, true, true); // qsw <-> trafo potência

  // Vertical qsw <-> pcs
  svg += line(800, 814, 800, 870, true, true);

  // bess <-> pcs
  svg += line(700, 910, 758, 910, true, true);

  // fábrica <- cabine mt
  svg += line(330, 615, 246, 615, false, true);

  // Notes panel and title block
  svg += rect(1330, 20, 430, 210, 0, false, "none", 1);
  svg += text(1350, 48, "REFERÊNCIAS / NOTAS", 13, "bold", "start", palette.title);
  svg += text(1350, 72, "1. Fluxo principal com setas e conexões sem sobreposição crítica.", 11, "normal", "start", palette.subtle);
  svg += text(1350, 92, "2. Desenho simbólico dos equipamentos inspirado no arranjo de campo.", 11, "normal", "start", palette.subtle);
  svg += text(1350, 112, "3. Agrupamento por níveis (MT, integração, transformação, BESS/PCS).", 11, "normal", "start", palette.subtle);
  svg += text(1350, 132, "4. Usar como pré-projeto; detalhar em projeto executivo.", 11, "normal", "start", palette.subtle);

  svg += rect(1320, 760, 440, 250, 0, false, "none", 1);
  svg += text(1340, 786, "CARIMBO", 11, "bold", "start", palette.subtle);
  svg += text(1340, 814, `Projeto: ${projeto.nome}`, 11, "bold");
  svg += text(1340, 836, `Perfil: ${projeto.perfil}`, 11);
  svg += text(1340, 858, `Trafo: ${trafoKva} kVA`, 11);
  svg += text(1340, 880, `PCS: ${pcsQtd} x ${pcsKw} kW`, 11);
  svg += text(1340, 902, `BESS: ${bessQtd} un`, 11);
  svg += text(1340, 924, `Tensões: MT ${mtKv} kV / BT ${btKv} kV`, 11);
  svg += text(1340, 946, `Data: ${new Date().toLocaleDateString("pt-BR")}`, 11);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#111" />
    </marker>
  </defs>
  ${svg}
</svg>
`.trim();
}
