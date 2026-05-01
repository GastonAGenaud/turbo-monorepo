import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKING", "SHIPPED", "CANCELLED"]),
});

export const orderArchiveSchema = z.object({
  archived: z.boolean(),
});

export const userRoleSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

export const userResetPasswordSchema = z.object({
  password: z.string().min(8).max(72),
});

export const importRunSchema = z.object({
  action: z.enum(["IMPORT", "REFRESH_IMAGES"]).default("IMPORT"),
  source: z.enum(["MERLINGROW", "DUTCHPASSION", "ALL"]),
});
