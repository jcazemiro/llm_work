import type { Projeto, ItemComponente } from "./tipos_bess";

function esc(s: any): string {
  // evita quebrar SVG por caracteres especiais (&, <, >, etc.)
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pegar(comp: ItemComponente[], tipo: ItemComponente["tipo"]) {
  return comp.find((c) => c.tipo === tipo);
}

function num(n: any, fallback: number) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

/**
 * Unifilar "pré-layout" (mais próximo do padrão):
 * - Barramento MT / BT (linhas grossas)
 * - Trafo central
 * - Derivações à direita com DJ + cabo + caixas de saída
 */
export function gerarSvgUnifilarPreliminar(projeto: Projeto): string {
  const comps = projeto.componentes ?? [];

  const trafo = pegar(comps, "TRANSFORMER");
  const pcs = pegar(comps, "PCS");
  const bess = pegar(comps, "BESS");

  const trafoKva = num(trafo?.params?.potencia_kva, 1500);
  const mtKv = num(trafo?.params?.mt_kv, projeto.tensao_mt_kv ?? 13.8);
  const btKv = num(trafo?.params?.bt_kv, projeto.tensao_bt_kv ?? 0.8);

  const pcsQtd = num(pcs?.quantidade, 1);
  const pcsKwCada = num(pcs?.params?.potencia_kw_por_pcs, 100);

  const bessKwh = num(bess?.params?.energia_kwh_total, 193.5);
  const bessKw = num(bess?.params?.potencia_kw_total, 100);

  // canvas
  const W = 1200;
  const H = 700;

  // layout base
  const marginL = 70;
  const marginR = 70;

  const busStartX = marginL + 140;
  const busEndX = W - marginR;

  const busMTy = 160;
  const busBTy = 420;

  // trafo no meio
  const trafoX = (busStartX + busEndX) / 2;
  const trafoTopY = 245;

  // derivação à direita
  const branchX = busEndX - 260;

  // estilos
  const stroke = "black";
  const font = "Arial";

  const busStroke = 8; // grosso como “barramento”
  const lineStroke = 2;

  // helpers SVG
  const line = (x1: number, y1: number, x2: number, y2: number, sw = lineStroke) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" />`;

  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    rx = 10,
    sw = 2
  ) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="white" stroke="${stroke}" stroke-width="${sw}" />`;

  const text = (
    x: number,
    y: number,
    t: string,
    size = 12,
    weight: "normal" | "bold" = "normal",
    anchor: "start" | "middle" | "end" = "start"
  ) =>
    `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(
      t
    )}</text>`;

  const djSimbolo = (x: number, y: number) => {
    // símbolo simples (retângulo pequeno) + legenda DJ
    const w = 14;
    const h = 18;
    return `
      ${rect(x - w / 2, y - h / 2, w, h, 2, 2)}
      ${text(x + 18, y + 5, "DJ", 11, "bold", "start")}
    `;
  };

  const caboNota = (x: number, y: number, nota: string) => {
    return `${text(x, y, nota, 11, "normal", "start")}`;
  };

  // composição
  let svg = "";

  // fundo
  svg += `<rect width="100%" height="100%" fill="white" />`;

  // título
  svg += text(40, 40, "Unifilar Preliminar", 28, "bold", "start");
  svg += text(60, 90, esc(projeto.nome), 16, "bold", "start");
  svg += text(
    60,
    112,
    `MT: ${mtKv} kV • BT: ${btKv} kV • ${projeto.frequencia_hz ?? 60} Hz`,
    12,
    "normal",
    "start"
  );

  // BARRAMENTO MT
  svg += text(marginL, busMTy - 10, "BARRAMENTO MT", 12, "bold", "start");
  svg += line(busStartX, busMTy, busEndX, busMTy, busStroke);

  // rede chegando no barramento MT (esquerda)
  svg += text(busStartX - 60, busMTy - 35, "REDE", 12, "bold", "start");
  svg += line(busStartX, busMTy - 55, busStartX, busMTy, lineStroke);
  svg += djSimbolo(busStartX + 60, busMTy - 35);

  // derivação MT -> trafo
  svg += line(trafoX, busMTy, trafoX, trafoTopY - 30, lineStroke);

  // símbolo do trafo (dois círculos)
  svg += `<circle cx="${trafoX - 18}" cy="${trafoTopY - 30}" r="10" stroke="${stroke}" stroke-width="2" fill="white" />`;
  svg += `<circle cx="${trafoX + 18}" cy="${trafoTopY - 30}" r="10" stroke="${stroke}" stroke-width="2" fill="white" />`;

  // caixa do trafo
  const trafoBoxW = 320;
  const trafoBoxH = 70;
  const trafoBoxX = trafoX - trafoBoxW / 2;
  const trafoBoxY = trafoTopY;
  svg += rect(trafoBoxX, trafoBoxY, trafoBoxW, trafoBoxH, 10, 2);
  svg += text(trafoX, trafoBoxY + 28, "TRANSFORMADOR", 12, "bold", "middle");
  svg += text(
    trafoX,
    trafoBoxY + 50,
    `${trafoKva} kVA • ${mtKv} kV / ${btKv} kV`,
    12,
    "normal",
    "middle"
  );

  // ligação trafo -> barramento BT
  svg += line(trafoX, trafoBoxY + trafoBoxH, trafoX, busBTy, lineStroke);

  // BARRAMENTO BT
  svg += text(marginL, busBTy - 10, "BARRAMENTO BT", 12, "bold", "start");
  svg += line(busStartX, busBTy, busEndX, busBTy, busStroke);

  // DERIVAÇÃO PCS (primeira)
  const pcsDropX = branchX;
  const pcsDropTopY = busBTy;
  const pcsDropMidY = busBTy + 80;
  svg += line(pcsDropX, pcsDropTopY, pcsDropX, pcsDropMidY, lineStroke);
  svg += djSimbolo(pcsDropX + 70, busBTy + 25);
  svg += caboNota(
    pcsDropX - 80,
    busBTy + 60,
    "CU HEPR"
  );
  svg += caboNota(
    pcsDropX - 80,
    busBTy + 78,
    "0,6/1kV 3#6mm²"
  );

  // caixa SAÍDA PCS
  const pcsBoxW = 360;
  const pcsBoxH = 70;
  const pcsBoxX = pcsDropX + 40;
  const pcsBoxY = busBTy + 95;

  svg += line(pcsDropX, pcsDropMidY, pcsBoxX, pcsDropMidY, lineStroke);

  svg += rect(pcsBoxX, pcsBoxY, pcsBoxW, pcsBoxH, 10, 2);
  svg += text(pcsBoxX + pcsBoxW / 2, pcsBoxY + 26, "SAÍDA PCS", 12, "bold", "middle");
  svg += text(
    pcsBoxX + pcsBoxW / 2,
    pcsBoxY + 48,
    `PCS (x${pcsQtd}) — ${pcsKwCada} kW (cada)`,
    12,
    "normal",
    "middle"
  );

  // DERIVAÇÃO BESS (segunda, a partir do PCS para baixo, estilo “degrau”)
  const bessDropX = pcsBoxX + pcsBoxW - 30;
  const bessDropY1 = pcsBoxY + pcsBoxH;
  const bessBoxW = 360;
  const bessBoxH = 70;
  const bessBoxX = pcsBoxX + 120;
  const bessBoxY = pcsBoxY + 115;

  svg += line(bessDropX, bessDropY1, bessDropX, bessBoxY + 10, lineStroke);
  svg += djSimbolo(bessDropX - 40, bessBoxY - 5);
  svg += caboNota(
    bessDropX - 120,
    bessBoxY - 24,
    "CU HEPR"
  );
  svg += caboNota(
    bessDropX - 120,
    bessBoxY - 6,
    "0,6/1kV 3#6mm²"
  );

  svg += line(bessDropX, bessBoxY + 10, bessBoxX, bessBoxY + 10, lineStroke);

  svg += rect(bessBoxX, bessBoxY, bessBoxW, bessBoxH, 10, 2);
  svg += text(bessBoxX + bessBoxW / 2, bessBoxY + 26, "SAÍDA BESS", 12, "bold", "middle");
  svg += text(
    bessBoxX + bessBoxW / 2,
    bessBoxY + 48,
    `BESS — ${bessKwh} kWh • ${bessKw} kW`,
    12,
    "normal",
    "middle"
  );

  // rodapé resumo
  svg += text(
    60,
    H - 40,
    `Perfil: ${projeto.perfil} • PCS: ${pcsQtd} un. • BESS: ${num(bess?.quantidade, 1)} un.`,
    11,
    "normal",
    "start"
  );

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${svg}
</svg>
`;
}

// Alias para compatibilidade (se algum arquivo antigo importar esse nome)
export const gerarSvgUnifilar = gerarSvgUnifilarPreliminar;