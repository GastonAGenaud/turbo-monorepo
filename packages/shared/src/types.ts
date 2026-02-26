export type ProductSource = "MANUAL" | "MERLINGROW" | "DUTCHPASSION";

export type StockStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export interface ImportedProduct {
  source: Exclude<ProductSource, "MANUAL">;
  externalId: string;
  sourceUrl: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  images: string[];
  categoryName?: string | null;
  basePrice: number;
  stock: number | null;
  stockStatus: StockStatus;
  tags: string[];
}

export interface ImportRunSummary {
  created: number;
  updated: number;
  failed: number;
  durationMs: number;
}
