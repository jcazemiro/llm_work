import type { Projeto, ItemComponente } from "./tipos_bess";

function esc(s: any): string {
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

function fmt(n: number, casas = 0) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(n);
}

export function gerarSvgUnifilarPreliminar(projeto: Projeto): string {
  const comps = projeto.componentes ?? [];

  const trafo = pegar(comps, "TRANSFORMER");
  const pcs = pegar(comps, "PCS");
  const bess = pegar(comps, "BESS");

  const trafoKva = num(trafo?.params?.potencia_kva, 1500);
  const mtKv = num(trafo?.params?.mt_kv, projeto.tensao_mt_kv ?? 13.8);
  const btKv = num(trafo?.params?.bt_kv, projeto.tensao_bt_kv ?? 0.8);

  const pcsQtd = Math.max(1, Math.floor(num(pcs?.quantidade, 1)));
  const pcsKwCada = num(pcs?.params?.potencia_kw_por_pcs, 100);

  const bessQtd = Math.max(1, Math.floor(num(bess?.quantidade, 1)));
  const bessKwhTotal = num(bess?.params?.energia_kwh_total, 193.5);
  const bessKwTotal = num(bess?.params?.potencia_kw_total, 100);

  const W = 1640;

  const btGroupX = 920;
  const btGroupY = 148;
  const btGroupW = 680;

  const pcsAreaX = 944;
  const pcsAreaY = 546;
  const pcsAreaW = 632;
  const pcsItemW = 76;
  const pcsItemH = 62;
  const pcsGapX = 12;
  const pcsGapY = 30;
  const pcsCols = Math.max(1, Math.floor((pcsAreaW + pcsGapX) / (pcsItemW + pcsGapX)));
  const pcsRender = Math.min(24, pcsQtd);
  const pcsRows = Math.ceil(pcsRender / pcsCols);

  const bessAreaX = 944;
  const bessAreaW = 632;
  const bessItemW = 98;
  const bessItemH = 74;
  const bessGapX = 14;
  const bessGapY = 32;
  const bessCols = Math.max(1, Math.floor((bessAreaW + bessGapX) / (bessItemW + bessGapX)));
  const bessRender = Math.min(16, bessQtd);
  const bessRows = Math.ceil(bessRender / bessCols);

  const pcsBottomY = pcsAreaY + Math.max(1, pcsRows) * (pcsItemH + pcsGapY);
  const bessBusY = Math.max(720, pcsBottomY + 42);
  const bessAreaY = bessBusY + 36;
  const bessBottomY = bessAreaY + Math.max(1, bessRows) * (bessItemH + bessGapY);

  const summaryY = Math.max(970, bessBottomY + 24);
  const H = summaryY + 170;
  const btGroupH = summaryY - btGroupY - 22;

  const palette = {
    page: "#f6f7fb",
    stroke: "#111827",
    label: "#334155",
    group: "#94a3b8",
    bus: "#0f172a",
    accent: "#2563eb",
    fill: "#ffffff",
  };

  const font = "Inter, Segoe UI, Arial";

  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sw = 2,
    stroke = palette.stroke,
    dash = ""
  ) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""} />`;

  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    rx = 6,
    sw = 1.4,
    fill = palette.fill,
    stroke = palette.stroke,
    dash = ""
  ) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ""} />`;

  const text = (
    x: number,
    y: number,
    t: string,
    size = 12,
    weight: "normal" | "bold" = "normal",
    anchor: "start" | "middle" | "end" = "start",
    color = palette.stroke
  ) =>
    `<text x="${x}" y="${y}" fill="${color}" font-family="${font}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(
      t
    )}</text>`;

  const group = (x: number, y: number, w: number, h: number, titulo: string) =>
    `${rect(x, y, w, h, 4, 1, "none", palette.group, "7 5")}${text(x + 8, y - 8, titulo, 11, "bold", "start", palette.accent)}`;

  const dj = (x: number, y: number, label = "DJ") =>
    `${rect(x - 7, y - 10, 14, 20, 2, 1.5)}${text(x + 18, y + 4, label, 10, "bold")}`;

  let svg = "";
  svg += `<rect width="100%" height="100%" fill="${palette.page}" />`;
  svg += rect(16, 16, W - 32, H - 32, 8, 1, "#fbfcfe", "#d0d7e2");

  svg += text(36, 64, "DIAGRAMA UNIFILAR PRELIMINAR", 34, "bold", "start", palette.bus);
  svg += text(36, 96, projeto.nome, 18, "bold", "start", palette.accent);
  svg += text(36, 120, `MT ${fmt(mtKv, 1)} kV • BT ${fmt(btKv, 1)} kV • ${projeto.frequencia_hz} Hz`, 13, "normal", "start", palette.label);

  svg += group(42, 148, 450, 220, "GRUPO 1 • CABINE MT / REDE");
  svg += group(510, 148, 390, 220, "GRUPO 2 • TRANSFORMAÇÃO");
  svg += group(btGroupX, btGroupY, btGroupW, btGroupH, "GRUPO 3 • DISTRIBUIÇÃO BT / PCS / BESS");

  const mtBusY = 255;
  const mtBusStartX = 132;
  const mtBusEndX = 880;
  svg += text(58, mtBusY - 10, "BARRAMENTO MT", 12, "bold", "start", palette.label);
  svg += line(mtBusStartX, mtBusY, mtBusEndX, mtBusY, 8, palette.bus);
  svg += text(96, 192, "REDE", 12, "bold");
  svg += line(mtBusStartX, 198, mtBusStartX, mtBusY, 2);
  svg += dj(mtBusStartX + 64, 198);

  const trafoX = 705;
  const trafoY = 300;
  svg += line(trafoX, mtBusY, trafoX, trafoY - 24, 2);
  svg += `<circle cx="${trafoX - 17}" cy="${trafoY - 24}" r="9" stroke="${palette.stroke}" stroke-width="2" fill="white" />`;
  svg += `<circle cx="${trafoX + 17}" cy="${trafoY - 24}" r="9" stroke="${palette.stroke}" stroke-width="2" fill="white" />`;
  svg += rect(trafoX - 160, trafoY, 320, 56, 9, 1.6);
  svg += text(trafoX, trafoY + 24, "TRANSFORMADOR DE POTÊNCIA", 12, "bold", "middle");
  svg += text(trafoX, trafoY + 44, `${fmt(trafoKva)} kVA • ${fmt(mtKv, 1)} / ${fmt(btKv, 1)} kV`, 11, "normal", "middle", palette.label);

  const btBusY = 470;
  const btBusStartX = 940;
  const btBusEndX = 1570;
  svg += line(trafoX, trafoY + 56, trafoX, btBusY, 2);
  svg += line(trafoX, btBusY, btBusStartX, btBusY, 2);
  svg += text(936, btBusY - 12, "BARRAMENTO BT", 12, "bold", "start", palette.label);
  svg += line(btBusStartX, btBusY, btBusEndX, btBusY, 8, palette.bus);

  svg += text(pcsAreaX, pcsAreaY - 18, "SEÇÃO PCS", 11, "bold", "start", palette.accent);
  svg += rect(pcsAreaX - 8, pcsAreaY - 8, pcsAreaW + 12, pcsBottomY - pcsAreaY - 16, 6, 1, "#ffffff", "#cbd5e1", "4 3");

  for (let row = 0; row < Math.max(1, pcsRows); row++) {
    const rowStart = row * pcsCols;
    const rowCount = Math.max(0, Math.min(pcsCols, pcsRender - rowStart));
    if (rowCount === 0) continue;

    const rowY = pcsAreaY + row * (pcsItemH + pcsGapY) - 22;
    const firstCenterX = pcsAreaX + pcsItemW / 2;
    const lastCenterX = pcsAreaX + (rowCount - 1) * (pcsItemW + pcsGapX) + pcsItemW / 2;

    const tapX = firstCenterX - 22;
    svg += line(tapX, btBusY, tapX, rowY, 1.4);
    svg += line(tapX, rowY, lastCenterX + 12, rowY, 1.4, palette.stroke);

    for (let i = 0; i < rowCount; i++) {
      const idx = rowStart + i;
      const x = pcsAreaX + i * (pcsItemW + pcsGapX) + pcsItemW / 2;
      const topY = pcsAreaY + row * (pcsItemH + pcsGapY);
      svg += line(x, rowY, x, topY - 8, 1.2);
      svg += dj(x, rowY + 18, `Q${idx + 1}`);
      svg += rect(x - pcsItemW / 2, topY, pcsItemW, pcsItemH, 6, 1.2);
      svg += text(x, topY + 24, `PCS ${idx + 1}`, 10, "bold", "middle");
      svg += text(x, topY + 42, `${fmt(pcsKwCada)} kW`, 9, "normal", "middle", palette.label);
    }
  }

  if (pcsQtd > pcsRender) {
    svg += text(pcsAreaX, pcsBottomY - 10, `+ ${fmt(pcsQtd - pcsRender)} PCS adicionais`, 11, "normal", "start", palette.label);
  }

  const bessBusStartX = 1040;
  const bessBusEndX = 1570;
  svg += text(bessAreaX, bessBusY - 18, "SEÇÃO BESS", 11, "bold", "start", palette.accent);
  svg += rect(bessAreaX - 8, bessAreaY - 10, bessAreaW + 12, bessBottomY - bessAreaY - 18, 6, 1, "#ffffff", "#cbd5e1", "4 3");

  svg += line(960, btBusY + 90, 960, bessBusY, 1.8);
  svg += line(960, bessBusY, bessBusStartX, bessBusY, 1.8);
  svg += line(bessBusStartX, bessBusY, bessBusEndX, bessBusY, 6, palette.bus);

  const bessKwhPorUn = bessKwhTotal / bessQtd;
  const bessKwPorUn = bessKwTotal / bessQtd;

  for (let row = 0; row < Math.max(1, bessRows); row++) {
    const rowStart = row * bessCols;
    const rowCount = Math.max(0, Math.min(bessCols, bessRender - rowStart));
    if (rowCount === 0) continue;

    const rowY = bessAreaY + row * (bessItemH + bessGapY) - 22;
    const firstCenterX = bessAreaX + bessItemW / 2;
    const lastCenterX = bessAreaX + (rowCount - 1) * (bessItemW + bessGapX) + bessItemW / 2;

    const tapX = firstCenterX - 26;
    svg += line(tapX, bessBusY, tapX, rowY, 1.4);
    svg += line(tapX, rowY, lastCenterX + 14, rowY, 1.4);

    for (let i = 0; i < rowCount; i++) {
      const idx = rowStart + i;
      const x = bessAreaX + i * (bessItemW + bessGapX) + bessItemW / 2;
      const topY = bessAreaY + row * (bessItemH + bessGapY);
      svg += line(x, rowY, x, topY - 8, 1.2);
      svg += dj(x, rowY + 18, `B${idx + 1}`);
      svg += rect(x - bessItemW / 2, topY, bessItemW, bessItemH, 6, 1.2);
      svg += text(x, topY + 22, `BESS ${idx + 1}`, 10, "bold", "middle");
      svg += text(x, topY + 41, `${fmt(bessKwhPorUn, 1)} kWh`, 9, "normal", "middle", palette.label);
      svg += text(x, topY + 58, `${fmt(bessKwPorUn, 1)} kW`, 9, "normal", "middle", palette.label);
    }
  }

  if (bessQtd > bessRender) {
    svg += text(bessAreaX, bessBottomY - 10, `+ ${fmt(bessQtd - bessRender)} BESS adicionais`, 11, "normal", "start", palette.label);
  }

  svg += rect(42, summaryY, 960, 136, 8, 1, "#f8fbff", "#c3d0e1");
  svg += text(62, summaryY + 28, "RESUMO DO ARRANJO", 13, "bold", "start", palette.bus);
  svg += text(62, summaryY + 52, `Grupo MT: entrada da rede e proteção primária em ${fmt(mtKv, 1)} kV.`, 12, "normal", "start", palette.label);
  svg += text(62, summaryY + 74, `Grupo Trafo: ${fmt(trafoKva)} kVA com acoplamento ${fmt(mtKv, 1)}/${fmt(btKv, 1)} kV.`, 12, "normal", "start", palette.label);
  svg += text(62, summaryY + 96, `Grupo PCS: ${fmt(pcsQtd)} unidades × ${fmt(pcsKwCada)} kW = ${fmt(pcsQtd * pcsKwCada)} kW.`, 12, "normal", "start", palette.label);
  svg += text(62, summaryY + 118, `Grupo BESS: ${fmt(bessQtd)} unidades • ${fmt(bessKwhTotal, 1)} kWh total • ${fmt(bessKwTotal, 1)} kW total.`, 12, "normal", "start", palette.label);

  svg += rect(1020, summaryY, 580, 136, 6, 1, "#ffffff", "#aab5c6");
  svg += text(1038, summaryY + 28, "CARIMBO", 11, "bold", "start", palette.label);
  svg += text(1038, summaryY + 54, `Projeto: ${projeto.nome}`, 12, "bold");
  svg += text(1038, summaryY + 78, `Perfil ${projeto.perfil} • Rev A`, 11, "normal", "start", palette.label);
  svg += text(1038, summaryY + 102, `Data: ${new Date().toLocaleDateString("pt-BR")}`, 11, "normal", "start", palette.label);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`;
}

export const gerarSvgUnifilar = gerarSvgUnifilarPreliminar;
