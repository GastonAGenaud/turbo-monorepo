import { z } from "zod";

const trimmedString = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(min).max(max),
  );

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    },
    z.string().max(max).nullable().optional(),
  );

const optionalEmail = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toLowerCase() : null;
  },
  z.string().email().nullable().optional(),
);

export const registerSchema = z.object({
  name: trimmedString(2, 120),
  email: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.string().email(),
  ),
  password: z.string().min(8).max(72),
  captchaToken: z.string().min(16).max(2000),
  captchaAnswer: z.string().min(1).max(12),
  website: optionalTrimmedString(200),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.string().email(),
  ),
  password: z.string().min(8).max(72),
});

export const checkoutSchema = z.object({
  fullName: trimmedString(2, 120),
  email: optionalEmail,
  phone: trimmedString(8, 32),
  contactDetails: optionalTrimmedString(280),
  addressLine1: optionalTrimmedString(180),
  addressLine2: optionalTrimmedString(180),
  city: trimmedString(2, 120),
  postalCode: optionalTrimmedString(12),
  notes: optionalTrimmedString(500),
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
