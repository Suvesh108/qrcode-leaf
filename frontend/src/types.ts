export type CampaignStatus = 'active' | 'paused' | 'archived';

export interface Campaign {
  id: string;
  name: string;
  url: string;
  status: CampaignStatus;
  createdAt: string;
  scans: number;
  readability: number;
  qrConfig: QRConfig;
}

export interface QRConfig {
  foregroundColor: string;
  backgroundColor: string;
  patternStyle: 'square' | 'rounded' | 'dots' | 'liquid' | 'constellation' | 'crystal' | 'columns';
  finderStyle: 'square' | 'rounded' | 'extra-rounded' | 'circular' | 'dot' | 'bullseye' | 'orbital' | 'octagonal' | 'diamond' | 'leaf' | 'shield';
  logo?: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

export interface Template {
  id: string;
  name: string;
  category: string;
  style: string;
  image: string;
  qrConfig?: QRConfig;
}
