import type { CollectionEntry } from 'astro:content';

/** Display labels for the factual portal enums. */
export const REGULATION_LABEL: Record<string, string> = {
  reg_cf: 'Reg CF',
  reg_a: 'Reg A+',
  reg_d: 'Reg D',
  broker_dealer: 'Broker-dealer',
  other: 'Other',
};

export const CATEGORY_LABEL: Record<string, string> = {
  startup_equity: 'Startup equity',
  real_estate: 'Real estate',
  small_business: 'Small business',
  climate: 'Climate',
  private_markets: 'Private markets',
  infrastructure: 'Infrastructure',
};

/** Order categories appear in the directory. */
export const CATEGORY_ORDER = [
  'startup_equity',
  'real_estate',
  'small_business',
  'private_markets',
  'climate',
  'infrastructure',
];

export const STATUS_LABEL: Record<string, string> = {
  operating: 'Operating',
  inactive: 'Inactive / acquired',
  defunct: 'Defunct',
  unknown: 'Unknown',
};

export type Portal = CollectionEntry<'portals'>;

export const portalSlug = (p: Portal) => p.data.slug ?? p.id;
