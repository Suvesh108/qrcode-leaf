import { Request, Response } from "express";
import { z } from "zod";
import { fetchLogo, processUploadedLogo } from "./logo/fetcher";
import { extractColors } from "./colors/extractor";
import { generateBrandedQR } from "./qr/generator";
import { pngToHighRes, pngWithTransparentBg, svgWithTransparentBg } from "./qr/export";
import {
  normalizeUrl,
  extractBrandName,
  extractDomain,
  bufferToDataUrl,
  isValidUrl,
  generateId,
} from "./utils";
import type { QRGenerateResult } from "./types";
import { addGeneration } from "./analyticsStore";

const schema = z.object({
  url: z.string().optional().default("https://qrcodeleaf.com"),
  customText: z.string().optional(),
  customLogo: z.string().optional(),
  dotStyle: z.string().optional(),
  cornerStyle: z.string().optional(),
  size: z.number().optional(),
  gradient: z.boolean().optional(),
  transparentBg: z.boolean().optional(),
  watermark: z.boolean().optional(),
  highRes: z.boolean().optional(),
  foregroundColor: z.string().optional(),
  gradientColor2: z.string().optional(),
  backgroundColor: z.string().optional(),
  template: z.string().optional(),
  padding: z.number().optional(),
  version: z.number().optional(),
}).passthrough();

export async function generateQRHandler(req: Request, res: Response): Promise<void> {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      console.error("Zod Validation Error:", JSON.stringify(parsed.error.flatten(), null, 2));
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const {
      url: rawUrl,
      customText,
      customLogo,
      dotStyle,
      cornerStyle,
      size = 400,
      gradient = true,
      transparentBg = false,
      watermark = true,
      highRes = false,
      foregroundColor,
      gradientColor2,
      backgroundColor,
      template,
      padding,
      version,
    } = parsed.data;

    const newId = generateId();

    let brandName = customText || "QR";
    let domain = "";
    let logoBuffer: Buffer | undefined;
    let logoUrl = customLogo || "";
    let colors = {
      primary: foregroundColor || "#000000",
      secondary: gradientColor2 || foregroundColor || "#8884d8",
      vibrant: foregroundColor || "#000000",
      darkMuted: foregroundColor || "#000000",
      lightMuted: backgroundColor || "#ffffff",
      isDark: true,
    };

    if (isValidUrl(rawUrl)) {
      const url = normalizeUrl(rawUrl);
      brandName = customText || extractBrandName(url);
      domain = extractDomain(url);

      const logo = customLogo
        ? {
            ...(await (async () => {
              const buf = await processUploadedLogo(customLogo);
              return buf
                ? { buffer: buf, url: customLogo, source: "placeholder" as const }
                : await fetchLogo(url);
            })()),
          }
        : await fetchLogo(url);

      logoBuffer = logo.buffer;
      logoUrl = logo.url;

      if (logoBuffer) {
        const extracted = await extractColors(logoBuffer);
        colors = {
          ...extracted,
          primary: foregroundColor || extracted.primary,
          secondary: gradientColor2 || extracted.secondary,
          vibrant: foregroundColor || extracted.vibrant,
        };
      }
    } else if (customLogo) {
      const buf = await processUploadedLogo(customLogo);
      if (buf) {
        logoBuffer = buf;
        const extracted = await extractColors(buf);
        colors = {
          ...extracted,
          primary: foregroundColor || extracted.primary,
          secondary: gradientColor2 || extracted.secondary,
          vibrant: foregroundColor || extracted.vibrant,
        };
      }
    }

    const isSample = !rawUrl || rawUrl.trim() === "" || rawUrl === "https://qrcodeleaf.com";
    const isWebUrl = isValidUrl(rawUrl) && !isSample;
    // Encode the actual destination URL directly into the QR code so it works
    // regardless of whether the backend is publicly deployed or running locally.
    // Analytics are still recorded in the DB using newId for tracking purposes.
    const trackingUrl = rawUrl || "https://qrcodeleaf.com";

    const { png, svg, scanValid, attempts } = await generateBrandedQR({
      url: trackingUrl,
      brandName,
      colors,
      logoBuffer,
      customText: customText || brandName,
      size,
      dotStyle: dotStyle as any,
      cornerStyle: cornerStyle as any,
      gradient,
      transparentBg,
      watermark,
      errorCorrection: (req.body.errorCorrection || 'H') as any,
      template,
      padding,
      version,
    });

    let finalPng = png;
    if (transparentBg) {
      finalPng = await pngWithTransparentBg(png);
    }
    if (highRes) {
      finalPng = await pngToHighRes(finalPng, 2);
    }

    const finalSvg = transparentBg ? svgWithTransparentBg(svg) : svg;

    const result: QRGenerateResult = {
      png: bufferToDataUrl(finalPng),
      svg: finalSvg.startsWith("data:")
        ? finalSvg
        : `data:image/svg+xml;base64,${Buffer.from(finalSvg).toString("base64")}`,
      scanValid,
      attempts,
      colors,
      brandName,
      logoUrl,
      domain,
    };

    if (!isSample) {
      addGeneration({
        id: newId,
        url: rawUrl,
        foregroundColor: colors.primary,
        backgroundColor: colors.lightMuted,
        patternStyle: dotStyle || "square",
        finderStyle: cornerStyle || "square",
        errorCorrection: (req.body.errorCorrection || 'H') as any,
        scanValid,
        attempts
      });
    }

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("Generate error:", err);
    res.status(500).json({ error: message, hint: "Check the input and try again." });
  }
}
