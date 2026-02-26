import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKING", "SHIPPED", "CANCELLED"]),
});

export const importRunSchema = z.object({
  source: z.enum(["MERLINGROW", "DUTCHPASSION", "ALL"]),
});
