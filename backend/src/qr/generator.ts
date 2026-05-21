import QRCode from "qrcode";
import sharp from "sharp";
import type { QRStyleOptions } from "../types";
import { validateQRScan } from "./validator";

interface GenerateAttempt {
  intensity: number;
  margin: number;
  logoScale: number;
}

const ATTEMPTS: GenerateAttempt[] = [
  { intensity: 1, margin: 2, logoScale: 0.31 },
  { intensity: 0.75, margin: 3, logoScale: 0.26 },
];

/**
 * Builds a rounded-rect path string (inline, no newlines) safe for SVG inside sharp.
 */
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const R = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + R} ${y}`,
    `L ${x + w - R} ${y}`,
    `A ${R} ${R} 0 0 1 ${x + w} ${y + R}`,
    `L ${x + w} ${y + h - R}`,
    `A ${R} ${R} 0 0 1 ${x + w - R} ${y + h}`,
    `L ${x + R} ${y + h}`,
    `A ${R} ${R} 0 0 1 ${x} ${y + h - R}`,
    `L ${x} ${y + R}`,
    `A ${R} ${R} 0 0 1 ${x + R} ${y}`,
    `Z`,
  ].join(" ");
}

  function roundedRectRadii(x: number, y: number, w: number, h: number, radii: [number, number, number, number]): string {
    const [tl, tr, br, bl] = radii;
    return [
      `M ${x + tl} ${y}`,
      `L ${x + w - tr} ${y}`,
      `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`,
      `L ${x + w} ${y + h - br}`,
      `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}`,
      `L ${x + bl} ${y + h}`,
      `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`,
      `L ${x} ${y + tl}`,
      `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}`,
      `Z`,
    ].join(" ");
  }

function getChamferedCellPath(x: number, y: number, cs: number, tl: number, tr: number, br: number, bl: number): string {
  return [
    `M ${x + tl} ${y}`,
    `L ${x + cs - tr} ${y}`,
    `L ${x + cs} ${y + tr}`,
    `L ${x + cs} ${y + cs - br}`,
    `L ${x + cs - br} ${y + cs}`,
    `L ${x + bl} ${y + cs}`,
    `L ${x} ${y + cs - bl}`,
    `L ${x} ${y + tl}`,
    `Z`
  ].join(" ");
}


async function generateWithQrcode(
  options: QRStyleOptions,
  attempt: GenerateAttempt
): Promise<{ png: Buffer; svg: string }> {
  const size = options.size ?? 400;
  const bgColor = options.transparentBg ? "none" : "#ffffff";

  // Generate QR matrix
  const qr = QRCode.create(options.url, { 
    errorCorrectionLevel: options.errorCorrection || "H",
    version: options.version
  });
  const { modules } = qr;
  const matrixSize = modules.size;
  const data = modules.data;
  const margin = typeof options.padding === 'number' ? options.padding : attempt.margin;
  const totalCells = matrixSize + margin * 2;
  const cellSize = size / totalCells;

  const getCellColor = (x: number, y: number): string => {
    if (options.gradient) {
      return "url(#qr-gradient)";
    }
    const mid = matrixSize / 2;
    const { primary, secondary, vibrant, darkMuted } = options.colors;

    if (x < mid && y < mid) return vibrant;
    if (x >= mid && y < mid) return primary;
    if (x < mid && y >= mid) return secondary;
    return darkMuted;
  };

  // Determine which cells are inside a finder region (7x7 blocks)
  const isFinder = (x: number, y: number): boolean => {
    if (x < 7 && y < 7) return true;
    if (x >= matrixSize - 7 && y < 7) return true;
    if (x < 7 && y >= matrixSize - 7) return true;
    return false;
  };

  let svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  if (options.gradient) {
    const { primary, secondary, vibrant, gradientStops } = options.colors;

    svgContent += `<defs>`;
    svgContent += `<linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">`;
    
    if (gradientStops && gradientStops.length > 1) {
        const step = 100 / (gradientStops.length - 1);
        gradientStops.forEach((stopColor, i) => {
            const offset = Math.round(i * step);
            svgContent += `<stop offset="${offset}%" stop-color="${stopColor}"/>`;
        });
    } else {
        svgContent += `<stop offset="0%" stop-color="${vibrant}"/>`;
        svgContent += `<stop offset="50%" stop-color="${primary}"/>`;
        svgContent += `<stop offset="100%" stop-color="${secondary}"/>`;
    }
    
    svgContent += `</linearGradient>`;
    svgContent += `</defs>`;
  }
  if (bgColor !== "none") {
    svgContent += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
  }

  // ── 1. Data modules (skip finder regions) ────────────────────────────────
  const dotStyle = options.dotStyle ?? "square";

  const isDarkAt = (r: number, c: number): boolean => {
    if (r < 0 || r >= matrixSize || c < 0 || c >= matrixSize) return false;
    return !!data[r * matrixSize + c];
  };

  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (!isDarkAt(row, col)) continue;
      if (isFinder(col, row)) continue;

      const color = getCellColor(col, row);
      const px = (col + margin) * cellSize;
      const py = (row + margin) * cellSize;
      const cs = cellSize;

      // ── Template Specific Layout Overrides ──
      if (options.template === "Constellation") {
        // Constellation Circuit Logic: 45° Diagonal Connections
        const diagBR = isDarkAt(row + 1, col + 1) && !isFinder(col + 1, row + 1);
        const diagBL = isDarkAt(row + 1, col - 1) && !isFinder(col - 1, row + 1);

        if (diagBR) {
          svgContent += `<line x1="${px + cs / 2}" y1="${py + cs / 2}" x2="${px + cs * 1.5}" y2="${py + cs * 1.5}" stroke="${color}" stroke-width="${cs * 0.18}" stroke-linecap="round"/>`;
        }
        if (diagBL) {
          svgContent += `<line x1="${px + cs / 2}" y1="${py + cs / 2}" x2="${px - cs / 2}" y2="${py + cs * 1.5}" stroke="${color}" stroke-width="${cs * 0.18}" stroke-linecap="round"/>`;
        }

        // Organic Nodes: Larger if connected, smaller if standalone
        const hasAnyNeighbor = isDarkAt(row - 1, col - 1) || isDarkAt(row - 1, col + 1) || isDarkAt(row + 1, col - 1) || isDarkAt(row + 1, col + 1);
        const radius = hasAnyNeighbor ? (cs * 0.38) : (cs * 0.28);
        svgContent += `<circle cx="${px + cs / 2}" cy="${py + cs / 2}" r="${radius}" fill="${color}"/>`;
      } else if (options.template === "Bullseye Dot") {
        // Variable-sized dots based on horizontal/vertical neighbors
        const hasHorizontalNeighbor = (isDarkAt(row, col - 1) && !isFinder(col - 1, row)) || (isDarkAt(row, col + 1) && !isFinder(col + 1, row));
        const hasVerticalNeighbor = (isDarkAt(row - 1, col) && !isFinder(col, row - 1)) || (isDarkAt(row + 1, col) && !isFinder(col, row + 1));

        let radius;
        if (hasHorizontalNeighbor && hasVerticalNeighbor) {
          radius = cs * 0.42; // Larger dot for intersections
        } else if (hasHorizontalNeighbor || hasVerticalNeighbor) {
          radius = cs * 0.35; // Standard module dot size
        } else {
          radius = cs * 0.25; // Smaller dot for standalone nodes
        }
        svgContent += `<circle cx="${px + cs / 2}" cy="${py + cs / 2}" r="${radius}" fill="${color}"/>`;
      } else if (options.template === "Micro Target") {
        // Precise uniform micro-dots
        svgContent += `<circle cx="${px + cs / 2}" cy="${py + cs / 2}" r="${cs * 0.26}" fill="${color}"/>`;
      } else if (options.template === "Flame Wave") {
        // Pinwheel Flame neighbor rule (exposed corners)
        const n = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
        const s = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
        const w = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
        const e = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
        const neighbors = (n ? 1 : 0) + (s ? 1 : 0) + (w ? 1 : 0) + (e ? 1 : 0);

        let rTL = 0, rTR = 0, rBR = 0, rBL = 0;
        const R = cs / 2;

        if (neighbors === 0) {
          rTL = R; rTR = R; rBR = R; rBL = R;
        } else if (neighbors === 1) {
          if (w) rBR = R;
          else if (n) rBL = R;
          else if (e) rTL = R;
          else if (s) rTR = R;
        } else if (neighbors === 2) {
          if (e && s) rTL = R;
          else if (w && s) rTR = R;
          else if (w && n) rBR = R;
          else if (e && n) rBL = R;
        }
        svgContent += `<path d="${roundedRectRadii(px, py, cs, cs, [rTL, rTR, rBR, rBL])}" fill="${color}"/>`;
      } else if (options.template === "Crystal Shield") {
        // Chamfered exposed-edge crystal blocks
        const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
        const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
        const left = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
        const right = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
        const chamferSize = 0.5 * cs;

        const tl = (!top && !left) ? chamferSize : 0;
        const tr = (!top && !right) ? chamferSize : 0;
        const br = (!bottom && !right) ? chamferSize : 0;
        const bl = (!bottom && !left) ? chamferSize : 0;

        svgContent += `<path d="${getChamferedCellPath(px, py, cs, tl, tr, br, bl)}" fill="${color}"/>`;
      } else if (options.template === "Vertical Capsule") {
        // Connected vertical pill tracks
        const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
        const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
        const radius = cs / 2;

        if (top || bottom) {
          const rTL = top ? 0 : radius;
          const rTR = top ? 0 : radius;
          const rBR = bottom ? 0 : radius;
          const rBL = bottom ? 0 : radius;
          svgContent += `<path d="${roundedRectRadii(px + 0.6, py, cs - 1.2, cs, [rTL, rTR, rBR, rBL])}" fill="${color}"/>`;
        } else {
          svgContent += `<circle cx="${px + radius}" cy="${py + radius}" r="${radius - 0.4}" fill="${color}"/>`;
        }
      } else if (options.template === "Eco Circular") {
        // Exposed-edge rounding
        const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
        const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
        const left = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
        const right = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
        const radius = cs * 0.5;

        const tl = (!top && !left) ? radius : 0;
        const tr = (!top && !right) ? radius : 0;
        const br = (!bottom && !right) ? radius : 0;
        const bl = (!bottom && !left) ? radius : 0;

        svgContent += `<path d="${roundedRectRadii(px, py, cs, cs, [tl, tr, br, bl])}" fill="${color}" stroke="${color}" stroke-width="0.5"/>`;
      } else if (options.template === "Leaf Finder") {
        // Liquid module connection logic exactly like Leaf Finder in sourceCodes.ts
        const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
        const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
        const left = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
        const right = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
        const radius = cs * 0.4;

        if ((left || right) && (top || bottom)) {
          svgContent += `<rect x="${px}" y="${py}" width="${cs}" height="${cs}" fill="${color}"/>`;
        } else if (left || right) {
          const rTL = left ? 0 : radius;
          const rTR = right ? 0 : radius;
          const rBR = right ? 0 : radius;
          const rBL = left ? 0 : radius;
          svgContent += `<path d="${roundedRectRadii(px, py, cs, cs, [rTL, rTR, rBR, rBL])}" fill="${color}"/>`;
        } else if (top || bottom) {
          const rTL = top ? 0 : radius;
          const rTR = top ? 0 : radius;
          const rBR = bottom ? 0 : radius;
          const rBL = bottom ? 0 : radius;
          svgContent += `<path d="${roundedRectRadii(px, py, cs, cs, [rTL, rTR, rBR, rBL])}" fill="${color}"/>`;
        } else {
          svgContent += `<circle cx="${px + cs / 2}" cy="${py + cs / 2}" r="${radius}" fill="${color}"/>`;
        }
      } else if (options.template === "Liquid Rounded" || options.template === "Fluid Logo" || options.template === "Octagonal Fluid" || options.template === "Orbital Diamond") {
        // Premium liquid with exposed edge rounding
        const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
        const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
        const left = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
        const right = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
        const radius = cs * 0.45;

        const tl = (!top && !left) ? radius : 0;
        const tr = (!top && !right) ? radius : 0;
        const br = (!bottom && !right) ? radius : 0;
        const bl = (!bottom && !left) ? radius : 0;

        svgContent += `<path d="${roundedRectRadii(px, py, cs, cs, [tl, tr, br, bl])}" fill="${color}"/>`;
      } else {
        // ── Default Styles ──
        if (dotStyle === "dots") {
          svgContent += `<circle cx="${px + cs / 2}" cy="${py + cs / 2}" r="${(cs / 2) * 0.85}" fill="${color}"/>`;
        } else if (dotStyle === "rounded") {
          svgContent += `<rect x="${px}" y="${py}" width="${cs}" height="${cs}" rx="${cs / 3}" fill="${color}"/>`;
        } else if (dotStyle === "liquid") {
          const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
          const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
          const left = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
          const right = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
          const radius = cs * 0.45;
          const tl = (!top && !left) ? radius : 0;
          const tr = (!top && !right) ? radius : 0;
          const br = (!bottom && !right) ? radius : 0;
          const bl = (!bottom && !left) ? radius : 0;
          svgContent += `<path d="${roundedRectRadii(px, py, cs, cs, [tl, tr, br, bl])}" fill="${color}"/>`;
        } else if (dotStyle === "constellation") {
          const diagBR = isDarkAt(row + 1, col + 1) && !isFinder(col + 1, row + 1);
          const diagBL = isDarkAt(row + 1, col - 1) && !isFinder(col - 1, row + 1);

          if (diagBR) {
            svgContent += `<line x1="${px + cs / 2}" y1="${py + cs / 2}" x2="${px + cs * 1.5}" y2="${py + cs * 1.5}" stroke="${color}" stroke-width="${cs * 0.18}" stroke-linecap="round"/>`;
          }
          if (diagBL) {
            svgContent += `<line x1="${px + cs / 2}" y1="${py + cs / 2}" x2="${px - cs / 2}" y2="${py + cs * 1.5}" stroke="${color}" stroke-width="${cs * 0.18}" stroke-linecap="round"/>`;
          }

          const hasAnyNeighbor = isDarkAt(row - 1, col - 1) || isDarkAt(row - 1, col + 1) || isDarkAt(row + 1, col - 1) || isDarkAt(row + 1, col + 1);
          const radius = hasAnyNeighbor ? (cs * 0.38) : (cs * 0.28);
          svgContent += `<circle cx="${px + cs / 2}" cy="${py + cs / 2}" r="${radius}" fill="${color}"/>`;
        } else if (dotStyle === "columns") {
          const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
          const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
          const radius = cs / 2;
          if (top || bottom) {
            const rTL = top ? 0 : radius;
            const rTR = top ? 0 : radius;
            const rBR = bottom ? 0 : radius;
            const rBL = bottom ? 0 : radius;
            svgContent += `<path d="${roundedRectRadii(px + 0.6, py, cs - 1.2, cs, [rTL, rTR, rBR, rBL])}" fill="${color}"/>`;
          } else {
            svgContent += `<circle cx="${px + radius}" cy="${py + radius}" r="${radius - 0.4}" fill="${color}"/>`;
          }
        } else if (dotStyle === "crystal") {
          const top = isDarkAt(row - 1, col) && !isFinder(col, row - 1);
          const bottom = isDarkAt(row + 1, col) && !isFinder(col, row + 1);
          const left = isDarkAt(row, col - 1) && !isFinder(col - 1, row);
          const right = isDarkAt(row, col + 1) && !isFinder(col + 1, row);
          const chamferSize = 0.5 * cs;
          const tl = (!top && !left) ? chamferSize : 0;
          const tr = (!top && !right) ? chamferSize : 0;
          const br = (!bottom && !right) ? chamferSize : 0;
          const bl = (!bottom && !left) ? chamferSize : 0;
          svgContent += `<path d="${getChamferedCellPath(px, py, cs, tl, tr, br, bl)}" fill="${color}"/>`;
        } else {
          svgContent += `<rect x="${px}" y="${py}" width="${cs + 0.1}" height="${cs + 0.1}" fill="${color}"/>`;
        }
      }
    }
  }

  // ── 2. Finder patterns ───────────────────────────────────────────────────
  const cornerStyle = options.cornerStyle ?? "square";

  const renderFinder = (col: number, row: number) => {
    const color = getCellColor(col + 3, row + 3);
    const x = (col + margin) * cellSize;
    const y = (row + margin) * cellSize;
    const full = 7 * cellSize;
    const cs = cellSize;

    if (cornerStyle === "bullseye") {
      const cx = x + 3.5 * cs;
      const cy = y + 3.5 * cs;
      // Outer Dark Ring
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${3.5 * cs}" fill="${color}"/>`;
      // Middle White Ring
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${2.3 * cs}" fill="${bgColor === "none" ? "white" : bgColor}"/>`;
      // Center Core
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${1.3 * cs}" fill="${color}"/>`;
      return;
    }

    if (cornerStyle === "orbital") {
      const cx = x + 3.5 * cs;
      const cy = y + 3.5 * cs;
      const orbitR = 3.1 * cs;

      // 1. Central Core
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${1.6 * cs}" fill="${color}"/>`;

      // 2. Dashed Orbit
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${orbitR}" fill="none" stroke="${color}" stroke-width="${cs * 0.15}" stroke-dasharray="${cs * 0.4},${cs * 0.3}"/>`;

      // 3. Satellites
      const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      angles.forEach((angle, idx) => {
        const satX = cx + Math.cos(angle) * orbitR;
        const satY = cy + Math.sin(angle) * orbitR;
        const satR = (idx % 2 === 0) ? (cs * 0.38) : (cs * 0.5);
        svgContent += `<circle cx="${satX}" cy="${satY}" r="${satR}" fill="${color}"/>`;
      });
      return;
    }

    if (cornerStyle === "octagonal") {
      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;
      const size = 7 * cs;
      const outerInset = 2 * cs;
      const innerInset = 1.3 * cs;

      const getOctoPath = (ox: number, oy: number, os: number, oi: number) => {
        return `M ${ox + oi},${oy} L ${ox + os - oi},${oy} L ${ox + os},${oy + oi} L ${ox + os},${oy + os - oi} L ${ox + os - oi},${oy + os} L ${ox + oi},${oy + os} L ${ox},${oy + os - oi} L ${ox},${oy + oi} Z`;
      };

      const outerPath = getOctoPath(x, y, size, outerInset);
      const innerPath = getOctoPath(x + cs, y + cs, size - 2 * cs, innerInset);

      // Render frame with evenodd
      svgContent += `<path d="${outerPath} ${innerPath}" fill="${color}" fill-rule="evenodd"/>`;

      // Inner eye 3×3 rounded square
      const eyeX = x + 2 * cs;
      const eyeY = y + 2 * cs;
      const eyeSize = 3 * cs;
      svgContent += `<rect x="${eyeX}" y="${eyeY}" width="${eyeSize}" height="${eyeSize}" rx="${0.8 * cs}" fill="${color}"/>`;
      return;
    }
    if (cornerStyle === "diamond") {
      const cx = x + 3.5 * cs;
      const cy = y + 3.5 * cs;

      // 1. Outer Dark Circle
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${3.5 * cs}" fill="${color}"/>`;

      // 2. White Ring
      svgContent += `<circle cx="${cx}" cy="${cy}" r="${2.3 * cs}" fill="${bgColor === "none" ? "white" : bgColor}"/>`;

      // 3. Diamond Core (Rotated square)
      const diamondSize = 2.4 * cs;
      const half = diamondSize / 2;
      // Vertices of the diamond
      const p1 = `${cx},${cy - half}`;
      const p2 = `${cx + half},${cy}`;
      const p3 = `${cx},${cy + half}`;
      const p4 = `${cx - half},${cy}`;
      svgContent += `<polygon points="${p1} ${p2} ${p3} ${p4}" fill="${color}"/>`;
      return;
    }
    if (cornerStyle === "leaf") {
      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;
      const size = 7 * cs;

      // Determine radii based on which corner we are in
      // Radii: [topLeft, topRight, bottomRight, bottomLeft]
      let radiiOuter: [number, number, number, number] = [0, 0, 0, 0];
      let radiiInner: [number, number, number, number] = [0, 0, 0, 0];
      let radiiEye: [number, number, number, number] = [0, 0, 0, 0];

      const isTopLeft = col === 0 && row === 0;
      const isTopRight = col > 0 && row === 0;
      const isBottomLeft = col === 0 && row > 0;

      if (isTopLeft) {
        radiiOuter = [4.5 * cs, 0, 4.5 * cs, 4.5 * cs];
        radiiInner = [2.5 * cs, 0, 2.5 * cs, 2.5 * cs];
        radiiEye = [1.3 * cs, 0, 1.3 * cs, 1.3 * cs];
      } else if (isTopRight) {
        radiiOuter = [0, 4.5 * cs, 4.5 * cs, 4.5 * cs];
        radiiInner = [0, 2.5 * cs, 2.5 * cs, 2.5 * cs];
        radiiEye = [0, 1.3 * cs, 1.3 * cs, 1.3 * cs];
      } else if (isBottomLeft) {
        radiiOuter = [4.5 * cs, 4.5 * cs, 4.5 * cs, 0];
        radiiInner = [2.5 * cs, 2.5 * cs, 2.5 * cs, 0];
        radiiEye = [1.3 * cs, 1.3 * cs, 1.3 * cs, 0];
      }

      const getLeafPath = (lx: number, ly: number, ls: number, lr: [number, number, number, number]) => {
        const [tl, tr, br, bl] = lr;
        return `M ${lx + tl},${ly} 
                L ${lx + ls - tr},${ly} 
                Q ${lx + ls},${ly} ${lx + ls},${ly + tr} 
                L ${lx + ls},${ly + ls - br} 
                Q ${lx + ls},${ly + ls} ${lx + ls - br},${ly + ls} 
                L ${lx + bl},${ly + ls} 
                Q ${lx},${ly + ls} ${lx},${ly + ls - bl} 
                L ${lx},${ly + tl} 
                Q ${lx},${ly} ${lx + tl},${ly} Z`;
      };

      const outerPath = getLeafPath(x, y, size, radiiOuter);
      const innerPath = getLeafPath(x + cs, y + cs, size - 2 * cs, radiiInner);

      svgContent += `<path d="${outerPath} ${innerPath}" fill="${color}" fill-rule="evenodd"/>`;

      const eyeX = x + 2 * cs;
      const eyeY = y + 2 * cs;
      const eyeSize = 3 * cs;
      svgContent += `<path d="${getLeafPath(eyeX, eyeY, eyeSize, radiiEye)}" fill="${color}"/>`;
      return;
    }

    if (cornerStyle === "shield") {
      const x = (col + margin) * cellSize;
      const y = (row + margin) * cellSize;
      const size = 7 * cs;

      let outerRadii: [number, number, number, number] = [0, 0, 0, 0];
      let innerRadii: [number, number, number, number] = [0, 0, 0, 0];
      let coreRadii: [number, number, number, number] = [0, 0, 0, 0];

      const isTopLeft = col === 0 && row === 0;
      const isTopRight = col > 0 && row === 0;
      const isBottomLeft = col === 0 && row > 0;

      if (isTopLeft) {
        outerRadii = [3 * cs, 2 * cs, 0, 2 * cs];
        innerRadii = [1.8 * cs, 1.2 * cs, 0, 1.2 * cs];
        coreRadii = [1 * cs, 0.5 * cs, 0, 0.5 * cs];
      } else if (isTopRight) {
        outerRadii = [2 * cs, 3 * cs, 2 * cs, 0];
        innerRadii = [1.2 * cs, 1.8 * cs, 1.2 * cs, 0];
        coreRadii = [0.5 * cs, 1 * cs, 0.5 * cs, 0];
      } else if (isBottomLeft) {
        outerRadii = [2 * cs, 0, 2 * cs, 3 * cs];
        innerRadii = [1.2 * cs, 0, 1.2 * cs, 1.8 * cs];
        coreRadii = [0.5 * cs, 0, 0.5 * cs, 1 * cs];
      }

      const getShieldPath = (sx: number, sy: number, ss: number, sr: [number, number, number, number]) => {
        const [tl, tr, br, bl] = sr;
        return `M ${sx + tl},${sy} 
                L ${sx + ss - tr},${sy} 
                Q ${sx + ss},${sy} ${sx + ss},${sy + tr} 
                L ${sx + ss},${sy + ss - br} 
                Q ${sx + ss},${sy + ss} ${sx + ss - br},${sy + ss} 
                L ${sx + bl},${sy + ss} 
                Q ${sx},${sy + ss} ${sx},${sy + ss - bl} 
                L ${sx},${sy + tl} 
                Q ${sx},${sy} ${sx + tl},${sy} Z`;
      };

      const outerPath = getShieldPath(x, y, size, outerRadii);
      const innerPath = getShieldPath(x + cs, y + cs, size - 2 * cs, innerRadii);
      svgContent += `<path d="${outerPath} ${innerPath}" fill="${color}" fill-rule="evenodd"/>`;

      const eyeX = x + 2 * cs;
      const eyeY = y + 2 * cs;
      const eyeSize = 3 * cs;
      svgContent += `<path d="${getShieldPath(eyeX, eyeY, eyeSize, coreRadii)}" fill="${color}"/>`;
      return;
    }

    const outerR =
      cornerStyle === "dot" ? full / 2 :
        cornerStyle === "extra-rounded" ? cs * 1.5 : 0;

    const innerR =
      cornerStyle === "dot" ? (full - 2 * cs) / 2
        : cornerStyle === "extra-rounded" ? cs
          : 0;

    const eyeR =
      cornerStyle === "dot" ? (3 * cs) / 2
        : cornerStyle === "extra-rounded" ? cs * 0.75
          : 0;

    // Outer shape
    const outerPath = roundedRect(x, y, full, full, outerR);
    // Inner hole (5×5 starting at 1 cell in)
    const holeX = x + cs;
    const holeY = y + cs;
    const holeSize = 5 * cs;
    const holePath = roundedRect(holeX, holeY, holeSize, holeSize, innerR);

    // Render outer frame with hole via evenodd
    svgContent += `<path d="${outerPath} ${holePath}" fill="${color}" fill-rule="evenodd"/>`;

    // Inner eye 3×3 centred inside the 7×7
    const eyeX = x + 2 * cs;
    const eyeY = y + 2 * cs;
    const eyeSize = 3 * cs;
    svgContent += `<rect x="${eyeX}" y="${eyeY}" width="${eyeSize}" height="${eyeSize}" rx="${eyeR}" fill="${color}"/>`;
  };

  // Top-left finder: module grid origin (0,0)
  renderFinder(0, 0);
  // Top-right finder
  renderFinder(matrixSize - 7, 0);
  // Bottom-left finder
  renderFinder(0, matrixSize - 7);

  svgContent += `</svg>`;

  let png = await sharp(Buffer.from(svgContent)).png().toBuffer();

  // ── 3. Background Watermark (Rendered behind the center logo plate) ──────
  if (options.watermark && options.logoBuffer) {
    const wmSize = Math.floor(size * 0.80);
    const wm = await sharp(options.logoBuffer)
      .resize(wmSize, wmSize, { fit: "inside" })
      .ensureAlpha()
      .modulate({ brightness: 1.2 })
      .png()
      .toBuffer();

    const faded = await sharp(wm)
      .ensureAlpha()
      .composite([
        {
          input: {
            create: {
              width: 1,
              height: 1,
              channels: 4,
              background: {
                r: 255,
                g: 255,
                b: 255,
                alpha: 0.18 * attempt.intensity,
              },
            },
          },
          tile: true,
          blend: "dest-in",
        },
      ])
      .toBuffer();

    png = await sharp(png)
      .composite([{ input: faded, gravity: "center", blend: "over" }])
      .png()
      .toBuffer();
  }

  // ── 4. Center Logo Plate (Rendered on top of the watermark) ──────────────
  if (options.logoBuffer) {
    const plateSize = Math.floor(size * attempt.logoScale * 1.25);
    const maxLogoDimension = Math.floor(plateSize * 0.96);

    const logo = await sharp(options.logoBuffer)
      .resize(maxLogoDimension, maxLogoDimension, { fit: "inside" })
      .png()
      .toBuffer();

    const plate = await sharp({
      create: {
        width: plateSize,
        height: plateSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toBuffer();

    const mask = Buffer.from(
      `<svg><circle cx="${plateSize / 2}" cy="${plateSize / 2}" r="${plateSize / 2}" fill="white"/></svg>`
    );

    const roundedPlate = await sharp(plate)
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();

    png = await sharp(png)
      .composite([{ input: roundedPlate, gravity: "center" }])
      .png()
      .toBuffer();
  }

  return { png, svg: svgContent };
}

export async function generateBrandedQR(
  options: QRStyleOptions
): Promise<{
  png: Buffer;
  svg: string;
  scanValid: boolean;
  attempts: number;
}> {
  options.url = options.url?.trim() || "https://qrcodeleaf.com";
  let lastResult: { png: Buffer; svg: string } | null = null;
  let attempts = 0;

  for (const attempt of ATTEMPTS) {
    attempts++;
    const result = await generateWithQrcode(
      { ...options, intensity: attempt.intensity },
      attempt
    );
    lastResult = result;

    const validation = await validateQRScan(result.png, options.url);
    if (validation.valid) {
      return { ...result, scanValid: true, attempts };
    }
  }

  if (lastResult) {
    return { ...lastResult, scanValid: false, attempts };
  }

  throw new Error("Failed to generate QR code");
}

export async function generateSimpleQR(
  url: string,
  size = 400
): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    margin: 4,
    width: size,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
