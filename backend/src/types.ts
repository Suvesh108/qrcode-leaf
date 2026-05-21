export interface BrandColors {
  primary: string;
  secondary: string;
  vibrant: string;
  darkMuted: string;
  lightMuted: string;
  isDark: boolean;
  gradientStops?: string[];
}

export interface LogoResult {
  url: string;
  source: "favicon" | "google" | "opengraph" | "placeholder";
  buffer?: Buffer;
  mimeType?: string;
}

export interface QRStyleOptions {
  url: string;
  brandName: string;
  colors: BrandColors;
  logoUrl?: string;
  logoBuffer?: Buffer;
  customText?: string;
  size?: number;
  dotStyle?: "rounded" | "dots" | "classy" | "square" | "liquid" | "constellation" | "crystal" | "columns";
  cornerStyle?: "dot" | "square" | "extra-rounded" | "bullseye" | "orbital" | "octagonal" | "diamond" | "leaf" | "shield";
  gradient?: boolean;
  transparentBg?: boolean;
  watermark?: boolean;
  intensity?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
  template?: string;
  padding?: number;
  version?: number;
}

export interface QRGenerateResult {
  png: string;
  svg: string;
  scanValid: boolean;
  attempts: number;
  colors: BrandColors;
  brandName: string;
  logoUrl: string;
  domain: string;
}

export interface QRHistoryItem {
  id: string;
  url: string;
  brandName: string;
  png: string;
  createdAt: number;
}

export interface StyleControlsState {
  dotStyle: "rounded" | "dots" | "classy" | "square" | "liquid" | "constellation" | "crystal" | "columns";
  cornerStyle: "dot" | "square" | "extra-rounded" | "bullseye" | "orbital" | "octagonal" | "diamond" | "leaf" | "shield";
  size: number;
  gradient: boolean;
  transparentBg: boolean;
  watermark: boolean;
  customText: string;
  customLogo?: string;
}

export const DEFAULT_STYLE: StyleControlsState = {
  dotStyle: "rounded",
  cornerStyle: "extra-rounded",
  size: 400,
  gradient: true,
  transparentBg: false,
  watermark: true,
  customText: "",
};
