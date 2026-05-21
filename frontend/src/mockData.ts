import { Campaign, Template } from './types';
import { MARKETPLACE_TEMPLATES } from './templateMetadata';

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Q3 Product Launch',
    url: 'https://brand.com/q3-launch-special-offer',
    status: 'active',
    createdAt: '2024-10-12',
    scans: 12400,
    readability: 98,
    qrConfig: {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      patternStyle: 'square',
      finderStyle: 'square',
      errorCorrection: 'H'
    }
  },
  {
    id: '2',
    name: 'Storefront Window',
    url: 'https://brand.com/store-promo',
    status: 'active',
    createdAt: '2024-09-28',
    scans: 8200,
    readability: 99,
    qrConfig: {
      foregroundColor: '#2E9D52',
      backgroundColor: '#FFFFFF',
      patternStyle: 'rounded',
      finderStyle: 'rounded',
      errorCorrection: 'Q'
    }
  },
  {
    id: '3',
    name: 'Summer Fest Flyer',
    url: 'https://brand.com/summer-fest',
    status: 'paused',
    createdAt: '2024-08-05',
    scans: 45100,
    readability: 95,
    qrConfig: {
      foregroundColor: '#DC2626',
      backgroundColor: '#FFFFFF',
      patternStyle: 'dots',
      finderStyle: 'circular',
      errorCorrection: 'M'
    }
  }
];

export const MOCK_TEMPLATES: Template[] = [
  ...MARKETPLACE_TEMPLATES
];
