import { fetchLogo } from "./src/logo/fetcher";
import { createCanvas, loadImage } from "canvas";

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

async function extractDistinctColors(buffer: Buffer, maxColors = 5) {
  const img = await loadImage(buffer);
  
  // Scale down to speed up
  const scale = Math.min(1, 100 / Math.max(img.width, img.height));
  const w = Math.floor(img.width * scale) || 1;
  const h = Math.floor(img.height * scale) || 1;
  
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  
  const colorCounts: Record<string, number> = {};
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue; // ignore transparent
    
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
  }
  
  const sorted = Object.entries(colorCounts)
    .filter(([hex, count]) => !isGrayscale(hex) && count > 10) // Filter out grays and noise
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
  
  return distinctColors;
}

async function main() {
  const result = await fetchLogo("https://google.com");
  const colors = await extractDistinctColors(result.buffer);
  console.log("Distinct colors:", colors);
}
main();
