export type ProductSource = "MANUAL" | "MERLINGROW" | "DUTCHPASSION";

export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export interface ProductAttributes {
  genetics?: string | null;
  flowering?: string | null;
  thcContent?: string | null;
  cbdContent?: string | null;
  yield?: string | null;
  height?: string | null;
  effect?: string | null;
  flavor?: string | null;
  seedCount?: string | null;
}

export interface ImportedProduct {
  source: Exclude<ProductSource, "MANUAL">;
  externalId: string;
  sourceUrl: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  longDescription?: string | null;
  images: string[];
  categoryName?: string | null;
  basePrice: number;
  stock: number | null;
  stockStatus: StockStatus;
  tags: string[];
  attributes?: ProductAttributes | null;
}

export interface ImportRunSummary {
  created: number;
  updated: number;
  failed: number;
  durationMs: number;
}
