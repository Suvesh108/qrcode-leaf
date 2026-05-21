import * as cheerio from "cheerio";
import sharp from "sharp";
import type { LogoResult } from "../types";
import { extractDomain } from "../utils";

const FETCH_TIMEOUT = 8000;
const MAX_LOGO_SIZE = 512;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BrandedQRBot/1.0; +https://brandedqr.app)",
        Accept: "image/*,*/*",
        ...options.headers,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) return null;
    return await sharp(buf)
      .resize(MAX_LOGO_SIZE, MAX_LOGO_SIZE, { fit: "inside" })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

async function scrapeFavicon(siteUrl: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(siteUrl, {
      headers: { Accept: "text/html" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    const selectors = [
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'link[rel="icon"][type="image/png"]',
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
    ];

    for (const sel of selectors) {
      const href = $(sel).attr("href");
      if (href) return resolveUrl(siteUrl, href);
    }

    const ogImage = $('meta[property="og:image"]').attr("content");
    if (ogImage) return resolveUrl(siteUrl, ogImage);

    return null;
  } catch {
    return null;
  }
}

async function getOpenGraphImage(siteUrl: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(siteUrl, {
      headers: { Accept: "text/html" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    const og = $('meta[property="og:image"]').attr("content");
    return og ? resolveUrl(siteUrl, og) : null;
  } catch {
    return null;
  }
}

function googleFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function placeholderLogo(domain: string): string {
  const letter = domain.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="24" fill="#1a1a1a"/>
    <text x="64" y="80" font-family="system-ui,sans-serif" font-size="56" font-weight="600" fill="#fff" text-anchor="middle">${letter}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function fetchLogo(url: string): Promise<LogoResult> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const domain = extractDomain(normalized);

  const sources: Array<{ url: string; source: LogoResult["source"] }> = [];

  const scraped = await scrapeFavicon(normalized);
  if (scraped) sources.push({ url: scraped, source: "favicon" });

  const og = await getOpenGraphImage(normalized);
  if (og && og !== scraped) sources.push({ url: og, source: "opengraph" });

  sources.push({
    url: googleFaviconUrl(domain),
    source: "google",
  });

  for (const { url: logoUrl, source } of sources) {
    const buffer = await downloadImage(logoUrl);
    if (buffer) {
      return {
        url: logoUrl,
        source,
        buffer,
        mimeType: "image/png",
      };
    }
  }

  const placeholder = placeholderLogo(domain);
  const placeholderBuf = await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="#1a1a1a"/><text x="64" y="80" font-family="sans-serif" font-size="56" fill="#fff" text-anchor="middle">${domain.charAt(0).toUpperCase()}</text></svg>`
    )
  )
    .png()
    .toBuffer();

  return {
    url: placeholder,
    source: "placeholder",
    buffer: placeholderBuf,
    mimeType: "image/png",
  };
}

export async function processUploadedLogo(
  base64: string
): Promise<Buffer | null> {
  try {
    const data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, "base64");
    return await sharp(buf)
      .resize(MAX_LOGO_SIZE, MAX_LOGO_SIZE, { fit: "inside" })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}
