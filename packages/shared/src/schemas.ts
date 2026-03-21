import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  captchaToken: z.string().min(16).max(2000),
  captchaAnswer: z.string().min(1).max(12),
  website: z.string().max(200).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(32).optional().nullable(),
  addressLine1: z.string().min(4).max(180),
  addressLine2: z.string().max(180).optional().nullable(),
  city: z.string().min(2).max(120),
  postalCode: z.string().min(3).max(12),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1),
});

export const productMutationSchema = z.object({
  sku: z.string().min(2).max(100),
  name: z.string().min(2).max(180),
  slug: z.string().min(2).max(190),
  brand: z.string().max(120).optional().nullable(),
  description: z.string().max(4000).optional().nullable(),
  images: z.array(z.string().url()).default([]),
  basePrice: z.number().nonnegative(),
  markupPercent: z.number().min(0).max(200),
  stock: z.number().int().nonnegative().nullable(),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"]),
  categoryId: z.string().cuid().nullable(),
  tags: z.array(z.string().max(40)).default([]),
  isActive: z.boolean().default(true),
  source: z.enum(["MANUAL", "MERLINGROW", "DUTCHPASSION"]),
  externalId: z.string().max(255).optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
});
