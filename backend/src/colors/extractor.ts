import { Vibrant } from "node-vibrant/node";
import { createCanvas, loadImage } from "canvas";
import type { BrandColors } from "../types";
import { getLuminance } from "../utils";

function colorDistance(hex1: string, hex2: string) {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function isGrayscale(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max > 240 && min > 240) return true; // near white
    if (max < 30) return true; // near black
    return max - min < 30; // low saturation
}

async function extractDistinctColors(imageBuffer: Buffer, maxColors = 5) {
  try {
    const img = await loadImage(imageBuffer);
    const scale = Math.min(1, 100 / Math.max(img.width, img.height));
    const w = Math.floor(img.width * scale) || 1;
    const h = Math.floor(img.height * scale) || 1;
    
    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    
    const colorCounts: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 128) continue;
      const hex = `#${data[i].toString(16).padStart(2, '0')}${data[i + 1].toString(16).padStart(2, '0')}${data[i + 2].toString(16).padStart(2, '0')}`;
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }
    
    const sorted = Object.entries(colorCounts)
      .filter(([hex, count]) => !isGrayscale(hex) && count > 5)
      .sort((a, b) => b[1] - a[1]);
      
    const distinctColors: string[] = [];
    for (const [hex] of sorted) {
        let isDistinct = true;
        for (const selected of distinctColors) {
            if (colorDistance(hex, selected) < 60) {
                isDistinct = false;
                break;
            }
        }
        if (isDistinct) {
            distinctColors.push(hex);
            if (distinctColors.length >= maxColors) break;
        }
    }
    return distinctColors.length > 0 ? distinctColors : null;
  } catch (e) {
    return null;
  }
}

const DEFAULT_COLORS: BrandColors = {
  primary: "#000000",
  secondary: "#333333",
  vibrant: "#0066ff",
  darkMuted: "#1a1a1a",
  lightMuted: "#f5f5f5",
  isDark: true,
};

function swatchToHex(swatch: { hex: string } | null | undefined): string {
  return swatch?.hex ?? "#000000";
}

export async function extractColors(
  imageBuffer: Buffer
): Promise<BrandColors> {
  try {
    const palette = await Vibrant.from(imageBuffer).getPalette();

    let vibrant = swatchToHex(palette.Vibrant);
    let primary = swatchToHex(palette.DarkVibrant) || vibrant;
    let secondary = swatchToHex(palette.Muted) || swatchToHex(palette.LightMuted);
    let darkMuted = swatchToHex(palette.DarkMuted) || primary;
    const lightMuted = swatchToHex(palette.LightMuted) || "#f5f5f5";

    const isDark = getLuminance(primary) < 0.4;
    
    let gradientStops = await extractDistinctColors(imageBuffer);
    if (gradientStops && gradientStops.length >= 2) {
      vibrant = gradientStops[0] || vibrant;
      primary = gradientStops[1] || primary;
      secondary = gradientStops[2] || secondary;
      darkMuted = gradientStops[3] || darkMuted || primary;
    } else {
      gradientStops = [vibrant, primary, secondary].filter(
        (val, i, arr) => arr.indexOf(val) === i
      );
    }

    return {
      primary,
      secondary,
      vibrant,
      darkMuted,
      lightMuted,
      isDark,
      gradientStops,
    };
  } catch {
    return DEFAULT_COLORS;
  }
}

export function buildGradient(
  colors: BrandColors,
  intensity = 1
): { type: "linear"; rotation: number; colorStops: Array<{ offset: number; color: string }> } {
  const mix = Math.min(1, Math.max(0.35, intensity));
  return {
    type: "linear",
    rotation: 45 + mix * 15,
    colorStops: [
      { offset: 0, color: colors.vibrant },
      { offset: 0.5, color: colors.primary },
      { offset: 1, color: colors.secondary },
    ].map((stop) => ({
      ...stop,
      color: stop.color,
    })),
  };
}

export function getQRColorScheme(
  colors: BrandColors,
  transparentBg: boolean
): {
  dots: string;
  background: string;
  corners: string;
  cornersDot: string;
} {
  const isDark = colors.isDark;
  const bg = transparentBg
    ? "transparent"
    : isDark
      ? "#ffffff"
      : "#0a0a0a";
  const dots = isDark ? colors.primary : colors.vibrant;
  const corners = colors.darkMuted;
  const cornersDot = colors.vibrant;

  return { dots, background: bg, corners, cornersDot };
}
