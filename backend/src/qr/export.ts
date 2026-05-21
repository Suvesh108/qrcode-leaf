import sharp from "sharp";

export async function pngToHighRes(
  pngBuffer: Buffer,
  scale = 2
): Promise<Buffer> {
  const meta = await sharp(pngBuffer).metadata();
  const width = (meta.width ?? 400) * scale;
  return sharp(pngBuffer)
    .resize(width, width, { kernel: "lanczos3" })
    .png({ quality: 100 })
    .toBuffer();
}

export async function pngWithTransparentBg(
  pngBuffer: Buffer
): Promise<Buffer> {
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

export function svgWithTransparentBg(svg: string): string {
  return svg.replace(
    /background\s*:\s*[^;"]+/gi,
    "background: transparent"
  ).replace(
    /<rect[^>]*fill="(?:#fff(?:fff)?|white)"[^>]*\/>/gi,
    ""
  );
}
